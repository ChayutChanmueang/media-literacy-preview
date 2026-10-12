import { z } from "zod";
import type { LeaderboardEntry, LeaderboardResponse } from "@/lib/leaderboard";
import type { LeaderboardPlayer } from "@/lib/validations";

// กระดานคะแนนในเครื่อง สำหรับเกมที่ยังไม่ต่อฐานข้อมูล (localOnly ใน src/lib/leaderboard.ts)
// ไม่ส่ง/ไม่ดึงอะไรจากเซิร์ฟเวอร์ — เห็นเฉพาะคะแนนที่เล่นบนเครื่องนี้ เก็บคะแนนดีที่สุดต่อผู้เล่น
export const LOCAL_LEADERBOARD_KEY = "naplab_ml_local_leaderboard";

const storedRowSchema = z.object({
  player_uuid: z.string(),
  name: z.string(),
  score: z.number().int().min(0),
  created_at: z.string(),
});
const storedBoardsSchema = z.record(z.string(), z.array(storedRowSchema));

type StoredBoards = z.infer<typeof storedBoardsSchema>;

function readBoards(): StoredBoards {
  try {
    const stored = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    if (!stored) return {};
    const parsed = storedBoardsSchema.safeParse(JSON.parse(stored));
    if (parsed.success) return parsed.data;
    localStorage.removeItem(LOCAL_LEADERBOARD_KEY);
  } catch {
    // storage blocked or malformed JSON — treat as an empty board
  }
  return {};
}

export const localLeaderboardService = {
  /** Keeps only the player's best score, so saving the same result twice changes nothing */
  saveScore(gid: string, player: LeaderboardPlayer, score: number) {
    if (typeof window === "undefined") return;
    const boards = readBoards();
    const key = gid.toUpperCase();
    const rows = boards[key] ?? [];
    const existing = rows.find((row) => row.player_uuid === player.player_uuid);

    if (existing) {
      existing.name = player.name;
      if (score > existing.score) {
        existing.score = score;
        existing.created_at = new Date().toISOString();
      }
    } else {
      rows.push({ player_uuid: player.player_uuid, name: player.name, score, created_at: new Date().toISOString() });
    }

    boards[key] = rows;
    try {
      localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(boards));
    } catch {
      // storage full/blocked — the board just won't remember this score
    }
  },

  /** Same shape as GET /api/leaderboard so the page renders both the same way */
  getLeaderboard(gid: string, name: string, limit = 10, playerUuid?: string): LeaderboardResponse {
    const key = gid.toUpperCase();
    // higher score first; ties go to whoever reached it earlier
    const ranked: LeaderboardEntry[] = [...(typeof window === "undefined" ? [] : readBoards()[key] ?? [])]
      .sort((a, b) => b.score - a.score || a.created_at.localeCompare(b.created_at))
      .map((row, index) => ({
        id: row.player_uuid,
        rank: index + 1,
        name: row.name,
        score: row.score,
        created_at: row.created_at,
        is_current_player: Boolean(playerUuid) && row.player_uuid === playerUuid,
      }));

    return {
      game: { gid: key, name },
      entries: ranked.slice(0, limit),
      currentPlayer: ranked.find((entry) => entry.is_current_player) ?? null,
    };
  },
};
