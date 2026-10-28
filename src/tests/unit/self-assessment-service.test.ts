import { beforeEach, describe, expect, it, vi } from "vitest";

// Keep the module's 3-second auto-sync from firing in the middle of a test.
vi.hoisted(() => vi.useFakeTimers());

vi.mock("@/services/apiClient", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/apiClient")>();
  return {
    ...actual,
    apiClient: { ...actual.apiClient, saveSelfAssessment: vi.fn(), getSelfAssessmentStatus: vi.fn() },
  };
});
vi.mock("@/services/loggingService", () => ({ loggingService: { logEvent: vi.fn() } }));

import ITEMS from "@/data/self-assessment-items.json";
import { apiClient, ApiHttpError } from "@/services/apiClient";
import { loggingService } from "@/services/loggingService";
import { progressService } from "@/services/progressService";
import {
  SELF_ASSESSMENT_PENDING_KEY,
  selfAssessmentService,
} from "@/services/selfAssessmentService";

const save = vi.mocked(apiClient.saveSelfAssessment);
const ids = ITEMS.map((item) => item.id);
const answers = Object.fromEntries(ids.map((id) => [id, 3]));

const clearCookies = () => {
  for (const name of document.cookie.split(";").map((c) => c.split("=")[0].trim()).filter(Boolean)) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};

describe("selfAssessmentService queue", () => {
  beforeEach(() => {
    localStorage.clear();
    clearCookies();
    save.mockReset();
    vi.mocked(loggingService.logEvent).mockReset();
  });

  it("builds the submission from the session, queues it and sends it", async () => {
    save.mockResolvedValue({ submission: { submission_uuid: "x", phase: "pre", received_at: "" } });

    const sent = selfAssessmentService.submit({
      phase: "pre",
      answers,
      itemOrder: [...ids].reverse(),
      startedAt: "2026-10-28T03:00:00.000Z",
    });

    expect(sent).toMatchObject({
      session_id: progressService.getOrCreateSession()!.sessionId,
      phase: "pre",
      item_set: "sa-v1",
      item_order: [...ids].reverse(),
      started_at: "2026-10-28T03:00:00.000Z",
      is_dev_skip: false,
      app_mode: "normal",
    });
    expect(selfAssessmentService.getPending()).toHaveLength(1); // queued before any network call finishes

    expect(await selfAssessmentService.syncPending()).toMatchObject({ sent: 1, remaining: 0 });
    expect(save).toHaveBeenCalledWith(sent);
    expect(selfAssessmentService.getPending()).toEqual([]);
  });

  it("keeps the submission when the request fails, and survives localStorage being wiped", async () => {
    save.mockRejectedValue(new TypeError("Failed to fetch"));
    const sent = selfAssessmentService.submit({ phase: "post", answers, itemOrder: ids });
    expect(await selfAssessmentService.syncPending()).toMatchObject({ sent: 0, remaining: 1 });

    localStorage.removeItem(SELF_ASSESSMENT_PENDING_KEY); // LINE in-app browser clearing storage
    expect(selfAssessmentService.getPending().map((s) => s.submission_uuid)).toEqual([sent.submission_uuid]);
  });

  it("drops duplicates from the queue and stops at the first server error to keep the order", async () => {
    save.mockRejectedValue(new TypeError("offline"));
    selfAssessmentService.submit({ phase: "pre", answers, itemOrder: ids });
    vi.setSystemTime(Date.now() + 1000);
    selfAssessmentService.submit({ phase: "post", answers, itemOrder: ids });
    await selfAssessmentService.syncPending();

    save.mockReset();
    save.mockResolvedValueOnce({ duplicate: true, reason: "same_submission" }).mockRejectedValueOnce(new ApiHttpError(503));
    expect(await selfAssessmentService.syncPending()).toMatchObject({ duplicates: 1, remaining: 1 });
    expect(selfAssessmentService.getPending().map((s) => s.phase)).toEqual(["post"]);
  });

  it("does not send later submissions ahead of one that hit a server error", async () => {
    save.mockRejectedValue(new TypeError("offline"));
    selfAssessmentService.submit({ phase: "pre", answers, itemOrder: ids });
    vi.setSystemTime(Date.now() + 1000);
    selfAssessmentService.submit({ phase: "post", answers, itemOrder: ids });
    await selfAssessmentService.syncPending();

    save.mockReset();
    save
      .mockRejectedValueOnce(new ApiHttpError(500))
      .mockResolvedValue({ submission: { submission_uuid: "x", phase: "post", received_at: "" } });
    expect(await selfAssessmentService.syncPending()).toMatchObject({ sent: 0, remaining: 2 });
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("moves a submission the server rejects as invalid out of the queue and logs it", async () => {
    save.mockRejectedValue(new ApiHttpError(400));
    const sent = selfAssessmentService.submit({ phase: "pre", answers, itemOrder: ids });

    expect(await selfAssessmentService.syncPending()).toMatchObject({ rejected: 1, remaining: 0 });
    expect(selfAssessmentService.getRejected().map((s) => s.submission_uuid)).toEqual([sent.submission_uuid]);
    expect(loggingService.logEvent).toHaveBeenCalledWith(
      "self_assessment_sync_rejected",
      expect.objectContaining({ submission_uuid: sent.submission_uuid, status: 400 }),
    );
  });

  it("shares one run between overlapping sync calls", async () => {
    let resolve!: (value: Awaited<ReturnType<typeof apiClient.saveSelfAssessment>>) => void;
    save.mockReturnValue(new Promise((r) => (resolve = r)));
    selfAssessmentService.submit({ phase: "pre", answers, itemOrder: ids }); // starts a run
    const second = selfAssessmentService.syncPending();
    resolve({ submission: { submission_uuid: "x", phase: "pre", received_at: "" } });

    expect(await second).toMatchObject({ sent: 1 });
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("knows a phase is done from saved answers or a queued submission, and reset keeps the queue", async () => {
    save.mockRejectedValue(new TypeError("offline"));
    expect(selfAssessmentService.hasCompleted("pre")).toBe(false);

    selfAssessmentService.submit({ phase: "pre", answers, itemOrder: ids });
    await selfAssessmentService.syncPending();
    expect(selfAssessmentService.hasCompleted("pre")).toBe(true);
    expect(selfAssessmentService.hasCompleted("post")).toBe(false);

    progressService.saveProgress({ ...progressService.getProgress(), selfAssessment: { post: answers } });
    expect(selfAssessmentService.hasCompleted("post")).toBe(true);

    progressService.resetAll(); // new session: the old submission must still be sent
    expect(selfAssessmentService.getPending()).toHaveLength(1);
    expect(selfAssessmentService.hasCompleted("pre")).toBe(false);
  });
});
