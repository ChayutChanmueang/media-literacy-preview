import { z } from "zod";

export const LEADERBOARD_PENDING_SCORE_KEY = "naplab_ml_leaderboard_pending_score";

const pendingScoreSchema = z.object({
  attempt_uuid: z.string().uuid(),
  gid: z.string().trim().toUpperCase().min(1),
  score: z.number().int().min(0),
});

export type PendingLeaderboardScore = z.infer<typeof pendingScoreSchema>;

export const leaderboardScoreService = {
  savePendingScore(gid: string, score: number): PendingLeaderboardScore {
    if (typeof window === "undefined") {
      throw new Error("Pending leaderboard scores can only be saved in the browser.");
    }

    const pendingScore = pendingScoreSchema.parse({
      attempt_uuid: crypto.randomUUID(),
      gid,
      score,
    });
    sessionStorage.setItem(LEADERBOARD_PENDING_SCORE_KEY, JSON.stringify(pendingScore));
    return pendingScore;
  },

  getPendingScore(gid: string): PendingLeaderboardScore | null {
    if (typeof window === "undefined") return null;

    try {
      const storedScore = sessionStorage.getItem(LEADERBOARD_PENDING_SCORE_KEY);
      if (!storedScore) return null;

      const parsedScore = pendingScoreSchema.safeParse(JSON.parse(storedScore));
      if (!parsedScore.success) {
        sessionStorage.removeItem(LEADERBOARD_PENDING_SCORE_KEY);
        return null;
      }

      return parsedScore.data.gid === gid.toUpperCase() ? parsedScore.data : null;
    } catch {
      sessionStorage.removeItem(LEADERBOARD_PENDING_SCORE_KEY);
      return null;
    }
  },

  clearPendingScore(gid?: string) {
    if (typeof window === "undefined") return;

    if (!gid) {
      sessionStorage.removeItem(LEADERBOARD_PENDING_SCORE_KEY);
      return;
    }

    const pendingScore = this.getPendingScore(gid);
    if (pendingScore) {
      sessionStorage.removeItem(LEADERBOARD_PENDING_SCORE_KEY);
    }
  },
};
