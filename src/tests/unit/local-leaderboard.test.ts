import { beforeEach, describe, expect, it } from "vitest";
import { LOCAL_LEADERBOARD_KEY, localLeaderboardService } from "@/services/localLeaderboardService";

const somporn = { player_uuid: "11111111-1111-4111-8111-111111111111", name: "ยายสมพร" };
const somchai = { player_uuid: "22222222-2222-4222-8222-222222222222", name: "ตาสมชาย" };

describe("local leaderboard service (for localOnly games)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("ranks players by their best score and flags the current player", () => {
    localLeaderboardService.saveScore("G19", somporn, 400);
    localLeaderboardService.saveScore("G19", somchai, 700);
    localLeaderboardService.saveScore("G19", somporn, 900);
    localLeaderboardService.saveScore("G19", somporn, 100); // lower run does not replace the best

    const board = localLeaderboardService.getLeaderboard("G19", "เรียงผลไม้", 10, somporn.player_uuid);

    expect(board.game).toEqual({ gid: "G19", name: "เรียงผลไม้" });
    expect(board.entries.map((e) => [e.rank, e.name, e.score, e.is_current_player])).toEqual([
      [1, "ยายสมพร", 900, true],
      [2, "ตาสมชาย", 700, false],
    ]);
    expect(board.currentPlayer?.rank).toBe(1);
  });

  it("keeps each game's board separate", () => {
    localLeaderboardService.saveScore("G18", somporn, 5);

    expect(localLeaderboardService.getLeaderboard("G20", "ผักบุ้งลอยฟ้า").entries).toEqual([]);
  });

  it("drops malformed stored data instead of crashing", () => {
    localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify({ G18: [{ name: 1 }] }));

    expect(localLeaderboardService.getLeaderboard("G18", "จำให้ขึ้นใจ").entries).toEqual([]);
    expect(localStorage.getItem(LOCAL_LEADERBOARD_KEY)).toBeNull();
  });
});
