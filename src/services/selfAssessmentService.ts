/**
 * Research pre/post self-assessment: queue every submission on the device first, then send it to
 * POST /api/self-assessment. Unlike loggingService's queue this one never drops anything and keeps
 * a cookie copy, because these answers are the research data (docs/software/10-research-pre-post-backend.md).
 */
import pkg from "../../package.json";
import { SELF_ASSESSMENT_ITEM_SET, type SelfAssessmentPhase } from "@/lib/selfAssessmentPhase";
import type { SelfAssessmentStatus } from "@/lib/selfAssessmentStore";
import type { SelfAssessmentSubmissionInput } from "@/lib/validations";
import { apiClient, ApiHttpError } from "./apiClient";
import { loggingService } from "./loggingService";
import { generateUUID, getCookie, progressService, setCookie } from "./progressService";

export const SELF_ASSESSMENT_PENDING_KEY = "naplab_ml_sa_pending";
export const SELF_ASSESSMENT_REJECTED_KEY = "naplab_ml_sa_rejected";
// One submission is ~600 bytes; three keep the cookie well under the ~4 KB per-cookie limit.
const COOKIE_PENDING_LIMIT = 3;
const COOKIE_MAX_AGE_DAYS = 365;

export type SelfAssessmentSubmission = SelfAssessmentSubmissionInput;

export interface SubmitSelfAssessmentInput {
  phase: SelfAssessmentPhase;
  /** { "sa-01": 4, … } keyed by item id, never by on-screen position */
  answers: Record<string, number>;
  /** item ids in the order they were shown */
  itemOrder: string[];
  /** ISO time the questions page opened */
  startedAt?: string;
  isDevSkip?: boolean;
}

export interface SyncResult {
  sent: number;
  duplicates: number;
  rejected: number;
  remaining: number;
}

const isSubmission = (value: unknown): value is SelfAssessmentSubmission =>
  !!value &&
  typeof value === "object" &&
  typeof (value as SelfAssessmentSubmission).submission_uuid === "string" &&
  typeof (value as SelfAssessmentSubmission).phase === "string";

function readList(key: string): SelfAssessmentSubmission[] {
  try {
    const stored = localStorage.getItem(key);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.filter(isSubmission) : [];
  } catch {
    return [];
  }
}

function writeList(key: string, list: SelfAssessmentSubmission[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {}
}

/** localStorage and the cookie copy merged — either may have been wiped by the LINE in-app browser. */
function readPending(): SelfAssessmentSubmission[] {
  if (typeof window === "undefined") return [];
  const cookieList = getCookie(SELF_ASSESSMENT_PENDING_KEY);
  const merged = new Map<string, SelfAssessmentSubmission>();
  for (const item of [...readList(SELF_ASSESSMENT_PENDING_KEY), ...(Array.isArray(cookieList) ? cookieList : [])]) {
    if (isSubmission(item) && !merged.has(item.submission_uuid)) merged.set(item.submission_uuid, item);
  }
  return [...merged.values()].sort((a, b) => a.submitted_at.localeCompare(b.submitted_at));
}

function writePending(list: SelfAssessmentSubmission[]) {
  if (typeof window === "undefined") return;
  writeList(SELF_ASSESSMENT_PENDING_KEY, list);
  if (list.length > COOKIE_PENDING_LIMIT) {
    console.warn(`[SelfAssessmentService] ${list.length} pending submissions; only the oldest ${COOKIE_PENDING_LIMIT} have a cookie copy.`);
  }
  if (list.length === 0) {
    document.cookie = `${SELF_ASSESSMENT_PENDING_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  } else {
    setCookie(SELF_ASSESSMENT_PENDING_KEY, list.slice(0, COOKIE_PENDING_LIMIT), COOKIE_MAX_AGE_DAYS);
  }
}

function removePending(submissionUuid: string) {
  writePending(readPending().filter((item) => item.submission_uuid !== submissionUuid));
}

// 4xx means the server will never accept this body (resending can't help); 408/429 are worth retrying.
const isPermanentRejection = (error: unknown) =>
  error instanceof ApiHttpError && error.status >= 400 && error.status < 500 && ![408, 429].includes(error.status);

let syncInFlight: Promise<SyncResult> | null = null;

export const selfAssessmentService = {
  /**
   * Builds the submission, stores it in the pending queue, then starts sending it in the background.
   * Returns at once — the page can navigate without waiting for the network.
   */
  submit(input: SubmitSelfAssessmentInput): SelfAssessmentSubmission {
    const session = progressService.getOrCreateSession();
    if (!session) throw new Error("[SelfAssessmentService] submit() runs in the browser only.");
    const submission: SelfAssessmentSubmission = {
      submission_uuid: generateUUID(),
      session_id: session.sessionId,
      phase: input.phase,
      item_set: SELF_ASSESSMENT_ITEM_SET,
      answers: { ...input.answers },
      item_order: [...input.itemOrder],
      ...(input.startedAt ? { started_at: input.startedAt } : {}),
      submitted_at: new Date().toISOString(),
      app_mode: progressService.getAppMode(),
      app_version: pkg.version,
      is_dev_skip: !!input.isDevSkip,
      client_meta:
        typeof window === "undefined"
          ? {}
          : { userAgent: navigator.userAgent, screenSize: `${window.innerWidth}x${window.innerHeight}` },
    };

    writePending([...readPending(), submission]);
    void this.syncPending();
    return submission;
  },

  /**
   * Sends queued submissions oldest first. Saved (201) and duplicate (200) ones leave the queue;
   * permanently rejected ones (400) move to the rejected list; anything else stays for the next try.
   * Concurrent calls share one run.
   */
  syncPending(): Promise<SyncResult> {
    if (syncInFlight) return syncInFlight;
    syncInFlight = (async () => {
      const result: SyncResult = { sent: 0, duplicates: 0, rejected: 0, remaining: 0 };
      if (typeof window === "undefined") return result;

      for (const submission of readPending()) {
        if (!navigator.onLine) break;
        try {
          const response = await apiClient.saveSelfAssessment(submission);
          if ("duplicate" in response) result.duplicates++;
          else result.sent++;
          removePending(submission.submission_uuid);
        } catch (error) {
          if (!isPermanentRejection(error)) break; // offline or server trouble: keep order, try later
          removePending(submission.submission_uuid);
          writeList(SELF_ASSESSMENT_REJECTED_KEY, [...readList(SELF_ASSESSMENT_REJECTED_KEY), submission]);
          result.rejected++;
          loggingService.logEvent("self_assessment_sync_rejected", {
            submission_uuid: submission.submission_uuid,
            phase: submission.phase,
            status: (error as ApiHttpError).status,
          });
        }
      }

      result.remaining = readPending().length;
      return result;
    })().finally(() => {
      syncInFlight = null;
    });
    return syncInFlight;
  },

  /** Submissions still waiting to reach the server (oldest first). */
  getPending(): SelfAssessmentSubmission[] {
    return readPending();
  },

  /** Submissions the server refused as malformed (kept on the device for support/debugging). */
  getRejected(): SelfAssessmentSubmission[] {
    return typeof window === "undefined" ? [] : readList(SELF_ASSESSMENT_REJECTED_KEY);
  },

  /**
   * Whether this device already did `phase` for the current session: answers saved in progress,
   * or a submission for it still queued. Synchronous, so pages can redirect before rendering.
   */
  hasCompleted(phase: SelfAssessmentPhase): boolean {
    if (typeof window === "undefined") return false;
    const progress = progressService.getProgress();
    if (progress.selfAssessment?.[phase]) return true;
    const sessionId = progressService.getOrCreateSession().sessionId;
    return readPending().some((item) => item.phase === phase && item.session_id === sessionId);
  },

  /** The server's view of this session's phases, or null when it can't be reached. */
  async fetchServerStatus(): Promise<SelfAssessmentStatus | null> {
    if (typeof window === "undefined") return null;
    try {
      return await apiClient.getSelfAssessmentStatus(progressService.getOrCreateSession().sessionId);
    } catch {
      return null;
    }
  },
};

// Same triggers as loggingService: when the network comes back, and shortly after the app loads
// (picks up anything left from an earlier visit).
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    void selfAssessmentService.syncPending();
  });
  setTimeout(() => {
    void selfAssessmentService.syncPending();
  }, 3000);
}
