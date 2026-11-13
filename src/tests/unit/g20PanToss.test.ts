import { describe, expect, it } from "vitest";
import { panTossPosition, randomTossX, startPanToss } from "@/lib/g20PanToss";

const GRAVITY = 0.8;
const HOME = { x: 270, y: 760 };

describe("G20 pan toss (next veggie thrown up into the pan)", () => {
  it("starts where it was thrown from and lands exactly in the pan", () => {
    const toss = startPanToss(60, 1120, HOME, GRAVITY, 160);
    expect(panTossPosition(toss, GRAVITY)).toEqual({ x: 60, y: 1120 });
    toss.t = toss.frames;
    const landed = panTossPosition(toss, GRAVITY);
    expect(landed.x).toBeCloseTo(HOME.x);
    expect(landed.y).toBeCloseTo(HOME.y);
    toss.t = toss.frames + 10; // stays put after landing
    expect(panTossPosition(toss, GRAVITY).y).toBeCloseTo(HOME.y);
  });

  it("rises to peakRise above the pan, then comes down into it", () => {
    const toss = startPanToss(400, 1120, HOME, GRAVITY, 160);
    toss.t = -toss.vy / GRAVITY; // top of the arc
    expect(panTossPosition(toss, GRAVITY).y).toBeCloseTo(HOME.y - 160);
    expect(toss.frames).toBeGreaterThan(30); // slow enough to follow
    expect(toss.frames).toBeLessThan(90);
  });

  it("picks a random x inside the margins", () => {
    expect(randomTossX(540, 40, () => 0)).toBe(40);
    expect(randomTossX(540, 40, () => 1)).toBe(500);
  });
});
