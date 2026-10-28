// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { NextRequest } from "next/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import ITEMS from "@/data/self-assessment-items.json";
import { findItemSetProblem, SELF_ASSESSMENT_ITEM_SET } from "@/lib/selfAssessmentPhase";
import {
  getSelfAssessmentStatus,
  saveSelfAssessmentSubmission,
  type DbPool,
} from "@/lib/selfAssessmentStore";
import { selfAssessmentSubmissionSchema, type SelfAssessmentSubmissionInput } from "@/lib/validations";

// The route reads the pool through getDatabasePool(); point it at the PGlite database below.
vi.mock("@/lib/database", () => ({
  getDatabasePool: () => (globalThis as { __selfAssessmentTestPool?: DbPool }).__selfAssessmentTestPool,
}));

const ids = ITEMS.map((item) => item.id);
const shuffled = [...ids].reverse();
const SESSION = "11111111-1111-4111-8111-111111111111";
let counter = 0;

function submission(overrides: Partial<SelfAssessmentSubmissionInput> = {}): SelfAssessmentSubmissionInput {
  counter++;
  return {
    submission_uuid: `aaaaaaaa-aaaa-4aaa-8aaa-${String(counter).padStart(12, "0")}`,
    session_id: SESSION,
    phase: "pre",
    item_set: SELF_ASSESSMENT_ITEM_SET,
    answers: Object.fromEntries(ids.map((id) => [id, id === "sa-07" ? 2 : 4])),
    item_order: shuffled,
    started_at: "2026-10-28T03:00:00.000Z",
    submitted_at: "2026-10-28T03:02:00.000Z",
    app_mode: "research",
    app_version: "0.24.0",
    is_dev_skip: false,
    ...overrides,
  };
}

describe("self-assessment submission validation", () => {
  it("accepts a full 12-item submission", () => {
    const input = submission();
    expect(selfAssessmentSubmissionSchema.safeParse(input).success).toBe(true);
    expect(findItemSetProblem(input.item_set, input.answers, input.item_order)).toBeNull();
  });

  it.each([0, 6, 3.5])("rejects the value %s", (value) => {
    const input = submission({ answers: { ...submission().answers, "sa-01": value } });
    expect(selfAssessmentSubmissionSchema.safeParse(input).success).toBe(false);
  });

  it("rejects bad uuids and unknown phases", () => {
    expect(selfAssessmentSubmissionSchema.safeParse(submission({ submission_uuid: "x" })).success).toBe(false);
    expect(selfAssessmentSubmissionSchema.safeParse({ ...submission(), phase: "mid" }).success).toBe(false);
  });

  it("rejects answers that are missing, extra, or keyed by position", () => {
    const { "sa-12": _dropped, ...missing } = submission().answers;
    expect(findItemSetProblem(SELF_ASSESSMENT_ITEM_SET, missing, ids)).toMatch(/answers/);
    expect(findItemSetProblem(SELF_ASSESSMENT_ITEM_SET, { ...submission().answers, "sa-13": 3 }, ids)).toMatch(/answers/);
    const byPosition = Object.fromEntries(ids.map((_, i) => [String(i + 1), 3]));
    expect(findItemSetProblem(SELF_ASSESSMENT_ITEM_SET, byPosition, ids)).toMatch(/answers/);
  });

  it("rejects an item_order with repeats or the wrong ids, and unknown item sets", () => {
    const answers = submission().answers;
    expect(findItemSetProblem(SELF_ASSESSMENT_ITEM_SET, answers, [...ids.slice(1), ids[1]])).toMatch(/duplicate/);
    expect(findItemSetProblem(SELF_ASSESSMENT_ITEM_SET, answers, ids.slice(1))).toMatch(/item_order/);
    expect(findItemSetProblem("sa-v0", answers, ids)).toMatch(/unknown item_set/);
  });
});

describe("self-assessment store and API (real schema on PGlite)", () => {
  let db: PGlite;
  let pool: DbPool;

  beforeAll(async () => {
    db = new PGlite();
    await db.exec("CREATE ROLE anon; CREATE ROLE authenticated;");
    await db.exec(fs.readFileSync(path.resolve(__dirname, "../../../docs/supabase-schema.sql"), "utf8"));
    const query = (text: string, values?: unknown[]) => db.query(text, values) as never;
    pool = { query, connect: async () => ({ query, release: () => {} }) };
    (globalThis as { __selfAssessmentTestPool?: DbPool }).__selfAssessmentTestPool = pool;
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    await db.exec("DELETE FROM self_assessment_submissions; DELETE FROM sessions;");
  });

  const rows = async <T>(sql: string, values: unknown[] = []) => (await db.query<T>(sql, values)).rows;

  it("saves the submission and one answer row per item, keyed by item id with its on-screen position", async () => {
    const input = submission();
    const result = await saveSelfAssessmentSubmission(pool, input);

    expect(result).toMatchObject({ status: "created", submission: { submission_uuid: input.submission_uuid, phase: "pre" } });
    const answers = await rows<{ item_id: string; value: number; shown_position: number }>(
      "SELECT item_id, value, shown_position FROM self_assessment_answers WHERE submission_uuid = $1",
      [input.submission_uuid],
    );
    expect(answers).toHaveLength(12);
    expect(answers.find((a) => a.item_id === "sa-07")).toEqual({
      item_id: "sa-07",
      value: 2,
      shown_position: shuffled.indexOf("sa-07") + 1,
    });
    // the session row is created on the fly (consent may not have synced yet)
    expect(await rows("SELECT age_range FROM sessions WHERE id = $1", [SESSION])).toEqual([{ age_range: "unknown" }]);
  });

  it("treats a resend of the same submission_uuid as a duplicate", async () => {
    const input = submission();
    await saveSelfAssessmentSubmission(pool, input);
    expect(await saveSelfAssessmentSubmission(pool, input)).toEqual({ status: "duplicate", reason: "same_submission" });
    expect(await rows("SELECT 1 FROM self_assessment_answers")).toHaveLength(12);
  });

  it("allows each phase once per session, but dev-skip runs on top", async () => {
    await saveSelfAssessmentSubmission(pool, submission());
    expect(await saveSelfAssessmentSubmission(pool, submission())).toEqual({
      status: "duplicate",
      reason: "phase_already_done",
    });
    expect((await saveSelfAssessmentSubmission(pool, submission({ is_dev_skip: true }))).status).toBe("created");
    expect((await saveSelfAssessmentSubmission(pool, submission({ phase: "post" }))).status).toBe("created");
  });

  it("keeps the answers when the device clock puts started_at after submitted_at", async () => {
    const input = submission({ started_at: "2026-10-28T04:00:00.000Z" });
    expect((await saveSelfAssessmentSubmission(pool, input)).status).toBe("created");
    expect(await rows("SELECT started_at FROM self_assessment_submissions")).toEqual([{ started_at: null }]);
  });

  it("rolls the submission back when an answer row fails", async () => {
    const input = submission({ item_set: "sa-v9" }); // not seeded: FK on the submission row fails
    await expect(saveSelfAssessmentSubmission(pool, input)).rejects.toThrow();
    const broken = submission();
    broken.answers = { ...broken.answers, "sa-01": 9 }; // bypasses zod: CHECK on the answer row fails
    await expect(saveSelfAssessmentSubmission(pool, broken)).rejects.toThrow();
    expect(await rows("SELECT 1 FROM self_assessment_submissions")).toHaveLength(0);
  });

  it("reports which phases a session has done, ignoring dev-skip rows", async () => {
    expect(await getSelfAssessmentStatus(pool, SESSION)).toEqual({ pre: false, post: false });
    await saveSelfAssessmentSubmission(pool, submission());
    await saveSelfAssessmentSubmission(pool, submission({ phase: "post", is_dev_skip: true }));
    expect(await getSelfAssessmentStatus(pool, SESSION)).toEqual({ pre: true, post: false });
  });

  describe("route /api/self-assessment", () => {
    const post = async (body: unknown) => {
      const { POST } = await import("@/app/api/self-assessment/route");
      const response = await POST(
        new NextRequest("http://localhost/api/self-assessment", {
          method: "POST",
          body: typeof body === "string" ? body : JSON.stringify(body),
        }),
      );
      return { status: response.status, body: await response.json() };
    };
    const get = async (query: string) => {
      const { GET } = await import("@/app/api/self-assessment/route");
      const response = await GET(new NextRequest(`http://localhost/api/self-assessment${query}`));
      return { status: response.status, body: await response.json() };
    };

    it("POST returns 201, then 200 duplicate for the same body", async () => {
      const input = submission();
      expect(await post(input)).toMatchObject({ status: 201, body: { submission: { submission_uuid: input.submission_uuid } } });
      expect(await post(input)).toEqual({ status: 200, body: { duplicate: true, reason: "same_submission" } });
    });

    it("POST returns 400 for bad JSON, schema errors and incomplete answer sets", async () => {
      expect((await post("{")).status).toBe(400);
      expect((await post({ ...submission(), phase: "mid" })).status).toBe(400);
      const { "sa-03": _dropped, ...answers } = submission().answers;
      expect(await post(submission({ answers }))).toMatchObject({ status: 400, body: { reason: expect.stringMatching(/answers/) } });
      expect(await rows("SELECT 1 FROM self_assessment_submissions")).toHaveLength(0);
    });

    it("POST returns 500 without details when the database fails", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      await db.exec("ALTER TABLE self_assessment_answers RENAME TO self_assessment_answers_off");
      try {
        expect(await post(submission())).toEqual({ status: 500, body: { error: "ไม่สามารถบันทึกแบบทดสอบได้" } });
      } finally {
        await db.exec("ALTER TABLE self_assessment_answers_off RENAME TO self_assessment_answers");
      }
      expect(await rows("SELECT 1 FROM self_assessment_submissions")).toHaveLength(0);
    });

    it("GET returns the phase status and rejects a missing or invalid session_id", async () => {
      await post(submission());
      expect(await get(`?session_id=${SESSION}`)).toEqual({ status: 200, body: { status: { pre: true, post: false } } });
      expect((await get("")).status).toBe(400);
      expect((await get("?session_id=nope")).status).toBe(400);
    });
  });
});
