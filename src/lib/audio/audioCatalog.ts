/**
 * Every sound the app plays — the only place that knows file paths (docs/software/11 ข้อ 4).
 * File names are immutable once shipped: change a sound = new file name (menu-v1 → menu-v2),
 * because the PWA cache and Cache-Control headers keep /audio/* for a long time.
 */

export interface BgmDef {
  src: string;
  /** per-file loudness, multiplied by the BGM channel volume */
  gain: number;
}

export interface SfxDef {
  src: string;
  /** per-file loudness, multiplied by the SFX channel volume */
  gain: number;
  /** keeps playing until stopped with audio.stopSfx(key, id) */
  loop?: boolean;
  /** how many copies of this sound may play at once — the oldest is stopped (default 4) */
  maxVoices?: number;
  /** ignore a replay sooner than this after the last one (default 30) */
  minIntervalMs?: number;
}

/**
 * BGM tracks. Keys are what resolveBgm() returns: "menu", "game", or a lessonId for a game with
 * its own track (e.g. "g13"). A key without an entry plays nothing, so adding music = adding a
 * line here + the file under public/audio/bgm/ (mono MP3, a 45–75 s loop — ข้อ 8).
 */
export const BGM: Readonly<Record<string, BgmDef>> = {
  // menu: { src: "/audio/bgm/menu-v1.mp3", gain: 0.8 },
  // game: { src: "/audio/bgm/game-v1.mp3", gain: 0.7 },
};

export const SFX = {
  "g13.scoopCatch": { src: "/audio/g13/scoopCatch.wav", gain: 0.8, maxVoices: 3 },
  "g13.scoopCatchX2": { src: "/audio/g13/scoopCatchX2.wav", gain: 0.8, maxVoices: 2 },
  "g13.bombHit": { src: "/audio/g13/bombHit.wav", gain: 0.6, maxVoices: 1 },

  "g17.blockBreak": { src: "/audio/g17/blockBreak.wav", gain: 0.6, maxVoices: 3, minIntervalMs: 40 },
  "g17.paddleBounce": { src: "/audio/g17/paddleBounce.wav", gain: 0.5, maxVoices: 2, minIntervalMs: 60 },
  "g17.powerUp": { src: "/audio/g17/powerUp.wav", gain: 0.7, maxVoices: 1 },

  "g19.tileSwap": { src: "/audio/g19/tileSwap.mp3", gain: 0.6, maxVoices: 1 },
  // G19 raises its pitch (rate) on each cascade step
  "g19.tileMatch": { src: "/audio/g19/tileMatched.ogg", gain: 0.7, maxVoices: 2, minIntervalMs: 80 },
  "g19.tileFall": { src: "/audio/g19/tileFall.wav", gain: 0.4, maxVoices: 1, minIntervalMs: 120 },
  // a 🥤/🌟 appears (instead of tileMatch) / a 🥤/🌟 is swapped and goes off
  "g19.tilePowerUpCreated": { src: "/audio/g19/tilePowerUpCreated.wav", gain: 0.7, maxVoices: 1 },
  "g19.tilePowerUpUsed": { src: "/audio/g19/tilePowerUpUsed.wav", gain: 0.7, maxVoices: 1 },

  "g20.throwBall": { src: "/audio/g20/throwBall.wav", gain: 0.7, maxVoices: 2 },
  "g20.basketScore": { src: "/audio/g20/basketScore.wav", gain: 0.8, maxVoices: 1 },
  "g20.ballMiss": { src: "/audio/g20/ballMiss.wav", gain: 0.5, maxVoices: 1 },
  "g20.dragLoop": { src: "/audio/g20/dragLoop.wav", gain: 0.35, maxVoices: 1, loop: true },
} as const satisfies Record<string, SfxDef>;

export type SfxKey = keyof typeof SFX;

/** SFX group (the key prefix before ".") of each fun game's lessonId — G20K reuses G20's sounds */
export const SFX_GROUP_BY_LESSON: Readonly<Record<string, string>> = {
  "flow-g13": "g13",
  g17: "g17",
  g19: "g19",
  g20: "g20",
  g20k: "g20",
};

export const sfxKeysOfGroup = (group: string): SfxKey[] =>
  (Object.keys(SFX) as SfxKey[]).filter((key) => key.startsWith(`${group}.`));
