import {
  leaderboardNameSchema,
  leaderboardPlayerSchema,
  type LeaderboardPlayer,
} from "@/lib/validations";

export const LEADERBOARD_PLAYER_KEY = "naplab_ml_leaderboard_player";

function generateUUID() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const randomValue = (Math.random() * 16) | 0;
    const value = character === "x" ? randomValue : (randomValue & 0x3) | 0x8;
    return value.toString(16);
  });
}

export const leaderboardPlayerService = {
  getProfile(): LeaderboardPlayer | null {
    if (typeof window === "undefined") return null;

    try {
      const storedProfile = localStorage.getItem(LEADERBOARD_PLAYER_KEY);
      if (!storedProfile) return null;

      const parsedProfile = leaderboardPlayerSchema.safeParse(JSON.parse(storedProfile));
      if (parsedProfile.success) return parsedProfile.data;

      localStorage.removeItem(LEADERBOARD_PLAYER_KEY);
    } catch {
      localStorage.removeItem(LEADERBOARD_PLAYER_KEY);
    }

    return null;
  },

  createProfile(name: string): LeaderboardPlayer {
    if (typeof window === "undefined") {
      throw new Error("Leaderboard player profiles can only be created in the browser.");
    }

    const parsedName = leaderboardNameSchema.parse({ name });
    const profile = leaderboardPlayerSchema.parse({
      player_uuid: generateUUID(),
      name: parsedName.name,
    });

    localStorage.setItem(LEADERBOARD_PLAYER_KEY, JSON.stringify(profile));
    return profile;
  },

  clearProfile() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(LEADERBOARD_PLAYER_KEY);
  },
};
