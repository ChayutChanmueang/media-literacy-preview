import { describe, expect, it } from "vitest";
import { seededStream, todaySeed } from "@/lib/seededRandom";

const take = (rng: () => number, n: number) => Array.from({ length: n }, () => rng());

describe("seededRandom", () => {
  it("gives the same sequence for the same game, date and stream", () => {
    expect(take(seededStream("G13", "2026-10-07", "spawner-1"), 20)).toEqual(
      take(seededStream("G13", "2026-10-07", "spawner-1"), 20)
    );
  });

  it("gives different sequences for a different date or stream", () => {
    const base = take(seededStream("G13", "2026-10-07", "spawner-1"), 5);
    expect(take(seededStream("G13", "2026-10-08", "spawner-1"), 5)).not.toEqual(base);
    expect(take(seededStream("G13", "2026-10-07", "spawner-2"), 5)).not.toEqual(base);
  });

  it("stays in [0, 1)", () => {
    for (const n of take(seededStream("G13", "2026-10-07", "x"), 1000)) {
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  it("uses the Bangkok date", () => {
    // 2026-10-07 18:30 UTC is already 2026-10-08 01:30 in Bangkok
    expect(todaySeed(new Date("2026-10-07T18:30:00Z"))).toBe("2026-10-08");
  });
});
