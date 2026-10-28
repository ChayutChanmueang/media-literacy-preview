/**
 * API Client for interacting with Next.js API Route Handlers.
 */
import type { LeaderboardResponse } from "@/lib/leaderboard";
import type { DuplicateReason, SavedSubmission, SelfAssessmentStatus } from "@/lib/selfAssessmentStore";
import type { LeaderboardResultInput, SelfAssessmentSubmissionInput } from "@/lib/validations";
import type { UserSession } from "./progressService";

/** Row sent to POST /api/action-logs (also queued offline by loggingService). */
export interface ActionLogInput {
  session_id: string;
  event_name: string;
  page_url?: string;
  payload?: Record<string, unknown>;
  created_at?: string;
}

/** Thrown for any non-2xx response; `status` lets callers tell bad input (4xx) from outages (5xx). */
export class ApiHttpError extends Error {
  constructor(readonly status: number) {
    super(`HTTP error! status: ${status}`);
    this.name = "ApiHttpError";
  }
}

export type SaveSelfAssessmentResponse =
  | { submission: SavedSubmission }
  | { duplicate: true; reason: DuplicateReason };

export const apiClient = {
  async post(url: string, data: unknown) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new ApiHttpError(response.status);
    }
    return await response.json();
  },

  async get(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new ApiHttpError(response.status);
    }
    return await response.json();
  },

  async saveSession(session: UserSession) {
    const payload = {
      id: session.sessionId,
      age_range: session.ageGroup,
      role: session.role || "elder",
      location_consent: session.consentGiven,
      selected_district: session.location?.district || null,
      selected_sub_district: session.location?.subdistrict || null,
      gps_latitude: session.location?.coordinates?.latitude || null,
      gps_longitude: session.location?.coordinates?.longitude || null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      device_metadata: session.deviceMetadata || null,
    };
    return this.post("/api/sessions", payload);
  },

  async logPageView(session_id: string, page_path: string, referrer?: string, duration_seconds?: number) {
    return this.post("/api/page-views", {
      session_id,
      page_path,
      referrer,
      duration_seconds,
    });
  },

  async logEvent(logData: ActionLogInput) {
    return this.post("/api/action-logs", {
      session_id: logData.session_id,
      event_name: logData.event_name,
      page_url: logData.page_url,
      payload: logData.payload,
    });
  },

  async saveLessonProgress(session_id: string, lesson_id: string, video_completed_at?: string, game_completed_at?: string) {
    return this.post("/api/lesson-progress", {
      session_id,
      lesson_id,
      video_completed_at,
      game_completed_at,
    });
  },

  async getQuizQuestions(type: "pretest" | "posttest") {
    return this.get(`/api/quiz-questions?type=${type}`);
  },

  async getLeaderboard(
    gid: string,
    limit = 10,
    playerUuid?: string,
  ): Promise<LeaderboardResponse> {
    const playerQuery = playerUuid
      ? `&player_uuid=${encodeURIComponent(playerUuid)}`
      : "";
    return this.get(
      `/api/leaderboard?gid=${encodeURIComponent(gid)}&limit=${limit}${playerQuery}`,
    ) as Promise<LeaderboardResponse>;
  },

  async saveGameResult(result: LeaderboardResultInput) {
    return this.post("/api/game-results", result);
  },

  /** POST /api/self-assessment — 201 { submission } or 200 { duplicate, reason }; throws ApiHttpError otherwise. */
  async saveSelfAssessment(submission: SelfAssessmentSubmissionInput): Promise<SaveSelfAssessmentResponse> {
    return this.post("/api/self-assessment", submission);
  },

  /** GET /api/self-assessment?session_id= — which phases the server already has for this session. */
  async getSelfAssessmentStatus(session_id: string): Promise<SelfAssessmentStatus> {
    const body = await this.get(`/api/self-assessment?session_id=${encodeURIComponent(session_id)}`);
    return body.status;
  },

  async saveQuizAttempt(session_id: string, test_type: "pretest" | "posttest", score: number, completed_at?: string) {
    return this.post("/api/quiz-attempts", {
      session_id,
      test_type,
      score,
      completed_at,
    });
  },

  async saveQuizAnswer(attempt_id: string, question_id: string, selected_option_id: string, is_correct: boolean) {
    return this.post("/api/quiz-answers", {
      attempt_id,
      question_id,
      selected_option_id,
      is_correct,
    });
  },

  async saveQuizAnswersBatch(answers: Array<{ attempt_id: string; question_id: string; selected_option_id: string; is_correct: boolean }>) {
    return this.post("/api/quiz-answers", answers);
  }
};
