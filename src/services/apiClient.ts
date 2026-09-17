/**
 * API Client for interacting with Next.js API Route Handlers.
 */
import type { LeaderboardResponse } from "@/lib/leaderboard";
import type { LeaderboardResultInput } from "@/lib/validations";

export const apiClient = {
  async post(url: string, data: any) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  async get(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  async saveSession(session: any) {
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

  async logEvent(logData: any) {
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
