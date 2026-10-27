import { describe, expect, it } from "vitest";
import {
  clampToRange,
  getBombDropCount,
  getKeyframeValue,
  getSkyAltitudeProgress,
  getStackTargetY,
  getTowerCameraTarget,
  getVisibleScoopRange,
  isCaughtAtTarget,
  stepCatchBottom,
} from "@/lib/g13Game";

describe("G13 Canvas remake game rules", () => {
  it("eases the catch zone's bottom up after a catch and snaps it down when the tower shrinks", () => {
    // tower grew: bottom moves part of the way up, never past the new target
    const eased = stepCatchBottom(-10, -60, 0.1, 4);
    expect(eased).toBeLessThan(-10);
    expect(eased).toBeGreaterThan(-60);
    expect(stepCatchBottom(-10, -60, 10, 4)).toBeCloseTo(-60);
    // tower shrank (a bomb hit): straight down to the new top scoop's middle
    expect(stepCatchBottom(-60, -10, 0.016, 4)).toBe(-10);
    expect(stepCatchBottom(-60, -60, 0.016, 4)).toBe(-60);
  });

  it("stacks the first scoop on the cone and later scoops on the current top", () => {
    expect(getStackTargetY(500, 0, 25, 35, 9)).toBe(509);
    expect(getStackTargetY(500, 1, 25, 35, 9)).toBe(484);
    expect(getStackTargetY(500, 4, 25, 35, 9)).toBe(379);
  });

  it("drops at most two scoops after a bomb hit", () => {
    expect(getBombDropCount(0)).toBe(0);
    expect(getBombDropCount(1)).toBe(1);
    expect(getBombDropCount(2)).toBe(2);
    expect(getBombDropCount(12)).toBe(2);
  });

  it("requires both vertical contact and horizontal overlap", () => {
    expect(
      isCaughtAtTarget({
        objectX: 200,
        objectBottomY: 300,
        targetX: 210,
        targetY: 300,
        catchWidth: 38,
      })
    ).toBe(true);

    expect(
      isCaughtAtTarget({
        objectX: 280,
        objectBottomY: 300,
        targetX: 210,
        targetY: 300,
        catchWidth: 38,
      })
    ).toBe(false);

    expect(
      isCaughtAtTarget({
        objectX: 200,
        objectBottomY: 250,
        targetX: 210,
        targetY: 300,
        catchWidth: 38,
      })
    ).toBe(false);
  });

  it("only catches within the catch depth below the target, not after falling past it", () => {
    const zone = { objectX: 200, targetX: 200, targetY: 300, catchWidth: 38, catchDepth: 25 };
    expect(isCaughtAtTarget({ ...zone, objectBottomY: 299 })).toBe(false);
    expect(isCaughtAtTarget({ ...zone, objectBottomY: 300 })).toBe(true);
    expect(isCaughtAtTarget({ ...zone, objectBottomY: 325 })).toBe(true);
    expect(isCaughtAtTarget({ ...zone, objectBottomY: 326 })).toBe(false);
  });

  it("keeps the cone inside canvas world bounds", () => {
    expect(clampToRange(-20, 42, 318)).toBe(42);
    expect(clampToRange(180, 42, 318)).toBe(180);
    expect(clampToRange(400, 42, 318)).toBe(318);
  });

  it("follows tall towers and returns to zero when the tower becomes short", () => {
    expect(getTowerCameraTarget(600, 360)).toBe(0);
    expect(getTowerCameraTarget(600, 180)).toBe(108);
    expect(getTowerCameraTarget(600, -40)).toBe(328);
    expect(getTowerCameraTarget(600, 360)).toBe(0);
  });

  it("darkens the sky progressively with camera altitude", () => {
    expect(getSkyAltitudeProgress(0, 600)).toBe(0);
    expect(getSkyAltitudeProgress(216, 600)).toBeCloseTo(0.5);
    expect(getSkyAltitudeProgress(432, 600)).toBe(1);
    expect(getSkyAltitudeProgress(900, 600)).toBe(1);
  });

  it("limits visible scoops based on max pixel height budget", () => {
    // 1 scoop total: all visible
    expect(getVisibleScoopRange(1, 162, 65)).toEqual({ startIndex: 0, endIndex: 1 });
    // 3 scoops total (2 steps = 130px <= 162px): all 3 visible
    expect(getVisibleScoopRange(3, 162, 65)).toEqual({ startIndex: 0, endIndex: 3 });
    // 10 scoops total: only top 3 visible (indexes 7 to 10)
    expect(getVisibleScoopRange(10, 162, 65)).toEqual({ startIndex: 7, endIndex: 10 });
    // 0 scoops: empty range
    expect(getVisibleScoopRange(0, 162, 65)).toEqual({ startIndex: 0, endIndex: 0 });
  });

  it("eases the tutorial hand between keyframes", () => {
    const keys = [[0, 0], [0.5, 10], [1, 10]] as const;
    expect(getKeyframeValue(0, keys)).toBe(0);
    expect(getKeyframeValue(0.25, keys)).toBe(5);
    expect(getKeyframeValue(0.5, keys)).toBe(10);
    expect(getKeyframeValue(0.75, keys)).toBe(10);
    expect(getKeyframeValue(2, keys)).toBe(10);
  });
});
