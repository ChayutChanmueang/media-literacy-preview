/**
 * Deterministic random helpers shared by games that seed their levels by the playing day
 * (G19, G13) — every player gets the same random sequence on the same date.
 */

export type Rng = () => number; // 0 ≤ n < 1, like Math.random

// mulberry32 — tiny deterministic PRNG: the same seed always gives the same numbers
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// FNV-1a — turns the seed text into a 32-bit number for mulberry32
export function hashString(text: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// A named stream, e.g. seededStream("G13", "2026-10-07", "spawner-1")
export const seededStream = (gameId: string, seed: string, name: string): Rng =>
  mulberry32(hashString(`${gameId}:${seed}:${name}`));

// Today's date as "YYYY-MM-DD" in Thai time, so a phone with a wrong timezone still gets today's level.
export function todaySeed(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
