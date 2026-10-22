import { beforeEach, describe, expect, it } from "vitest";
import {
  BROWSABLE_LEADERBOARD_GAMES,
  getLeaderboardGame,
  getLeaderboardMaxScore,
  isSupportedLeaderboardGid,
  LOCAL_BROWSABLE_LEADERBOARD_GAMES,
} from "@/lib/leaderboard";
import { leaderboardNameSchema } from "@/lib/validations";
import {
  LEADERBOARD_PLAYER_KEY,
  leaderboardPlayerService,
} from "@/services/leaderboardPlayerService";
import { leaderboardScoreService } from "@/services/leaderboardScoreService";

describe("leaderboard player profile", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("trims and stores a valid anonymous player profile", () => {
    const profile = leaderboardPlayerService.createProfile("  ยายสมพร  ");

    expect(profile.name).toBe("ยายสมพร");
    expect(profile.player_uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(leaderboardPlayerService.getProfile()).toEqual(profile);
  });

  it("removes malformed stored data instead of reusing it", () => {
    localStorage.setItem(LEADERBOARD_PLAYER_KEY, JSON.stringify({ player_uuid: "bad", name: "" }));

    expect(leaderboardPlayerService.getProfile()).toBeNull();
    expect(localStorage.getItem(LEADERBOARD_PLAYER_KEY)).toBeNull();
  });

  it("rejects blank and overlong names", () => {
    expect(leaderboardNameSchema.safeParse({ name: "   " }).success).toBe(false);
    expect(leaderboardNameSchema.safeParse({ name: "ก".repeat(31) }).success).toBe(false);
  });
});

describe("pending leaderboard score", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("keeps the G13 score until the leaderboard submits it", () => {
    leaderboardScoreService.savePendingScore("g13", 12);

    const pendingScore = leaderboardScoreService.getPendingScore("G13");
    expect(pendingScore).toEqual(
      expect.objectContaining({
        gid: "G13",
        score: 12,
      }),
    );
    expect(pendingScore?.attempt_uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );

    leaderboardScoreService.clearPendingScore("G13");
    expect(leaderboardScoreService.getPendingScore("G13")).toBeNull();
  });

  it("does not return a pending score for another game", () => {
    leaderboardScoreService.savePendingScore("G13", 8);
    expect(leaderboardScoreService.getPendingScore("G1")).toBeNull();
  });
});

describe("leaderboard game routing", () => {
  it("maps a lesson route to its isolated game leaderboard", () => {
    expect(getLeaderboardGame("flow-g13")).toEqual({
      lessonId: "flow-g13",
      gid: "G13",
      icon: "/assets/icons/g13-ice-cream.jpg",
    });
  });

  it("rejects unsupported route and game IDs", () => {
    expect(getLeaderboardGame("unknown-game")).toBeNull();
    expect(isSupportedLeaderboardGid("G13")).toBe(true);
    expect(isSupportedLeaderboardGid("G999")).toBe(false);
    expect(getLeaderboardMaxScore("G13")).toBe(500);
  });

  it("puts G18–G20 on the database leaderboard with names from game_id", () => {
    for (const [lessonId, gid] of [["g18", "G18"], ["g19", "G19"], ["g20", "G20"]]) {
      const game = getLeaderboardGame(lessonId);
      expect(game).toMatchObject({ lessonId, gid });
      expect(game?.localOnly).toBeUndefined();
      expect(game?.name).toBeUndefined();
      expect(isSupportedLeaderboardGid(gid)).toBe(true);
      expect(getLeaderboardMaxScore(gid)).toBeGreaterThan(0);
      expect(BROWSABLE_LEADERBOARD_GAMES.map((browsable) => browsable.gid)).toContain(gid);
    }
    expect(LOCAL_BROWSABLE_LEADERBOARD_GAMES).toEqual([]);
  });

  it("shares G20's leaderboard with the G20K variant without listing it twice in the game picker", () => {
    expect(getLeaderboardGame("g20k")).toMatchObject({ lessonId: "g20k", gid: "G20" });
    expect(isSupportedLeaderboardGid("G20K")).toBe(false);
    expect(BROWSABLE_LEADERBOARD_GAMES.filter((game) => game.gid === "G20").map((game) => game.lessonId)).toEqual(["g20"]);
  });

  it("caps G18–G20 scores at each game's ceiling", () => {
    expect(getLeaderboardMaxScore("G18")).toBe(100);
    expect(getLeaderboardMaxScore("G19")).toBe(20_000);
    expect(getLeaderboardMaxScore("G20")).toBe(15);
  });
});
