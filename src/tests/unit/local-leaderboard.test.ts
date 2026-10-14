import { beforeEach, describe, expect, it } from "vitest";
import { getLeaderboardGame, isSupportedLeaderboardGid, LOCAL_BROWSABLE_LEADERBOARD_GAMES } from "@/lib/leaderboard";
import { LOCAL_LEADERBOARD_KEY, localLeaderboardService } from "@/services/localLeaderboardService";

const somporn = { player_uuid: "11111111-1111-4111-8111-111111111111", name: "ยายสมพร" };
const somchai = { player_uuid: "22222222-2222-4222-8222-222222222222", name: "ตาสมชาย" };

describe("local leaderboard (G18–G20, not yet on the database)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("maps the three fun games as local-only and keeps them off the API's supported list", () => {
    for (const [lessonId, gid] of [["g18", "G18"], ["g19", "G19"], ["g20", "G20"]]) {
      const game = getLeaderboardGame(lessonId);
      expect(game).toMatchObject({ lessonId, gid, localOnly: true });
      expect(game?.name).toBeTruthy();
      expect(isSupportedLeaderboardGid(gid)).toBe(false);
    }
  });

  it("gives the experimental G20K its own local board, off the leaderboard menu's game list", () => {
    expect(getLeaderboardGame("g20k")).toMatchObject({ lessonId: "g20k", gid: "G20K", localOnly: true });
    expect(isSupportedLeaderboardGid("G20K")).toBe(false);
    expect(LOCAL_BROWSABLE_LEADERBOARD_GAMES.map((game) => game.gid)).not.toContain("G20K");
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
