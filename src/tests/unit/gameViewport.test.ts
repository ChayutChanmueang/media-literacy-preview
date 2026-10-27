import { describe, expect, it } from "vitest";
import {
  fitStage,
  MAX_STAGE_SCALE,
  MIN_STAGE_SCALE,
  REFERENCE_VIEWPORT,
  stageScale,
  textScale,
  toStage,
} from "@/lib/gameViewport";

describe("stageScale", () => {
  it("is 1 on the reference phone (iPhone 12 Pro)", () => {
    expect(stageScale(REFERENCE_VIEWPORT.w, REFERENCE_VIEWPORT.h)).toBe(1);
  });

  it("never grows past 1 on tablets / desktop", () => {
    expect(stageScale(480, 1273)).toBe(MAX_STAGE_SCALE);
    expect(stageScale(1024, 1366)).toBe(MAX_STAGE_SCALE);
  });

  it("shrinks by the side that is shortest compared with the reference", () => {
    // field data (docs/analytics): median phone, Android in LINE, iPhone in LINE
    expect(stageScale(384, 666)).toBeCloseTo(666 / 844, 5);
    expect(stageScale(360, 612)).toBeCloseTo(612 / 844, 5);
    expect(stageScale(390, 669)).toBeCloseTo(669 / 844, 5);
    // tall but narrow: width decides
    expect(stageScale(320, 900)).toBeCloseTo(320 / REFERENCE_VIEWPORT.w, 5);
  });

  it("stops at the minimum on very small screens", () => {
    expect(stageScale(320, 460)).toBe(MIN_STAGE_SCALE);
    expect(stageScale(200, 300)).toBe(MIN_STAGE_SCALE);
  });

  it("falls back to 1 before the root has a size", () => {
    expect(stageScale(0, 0)).toBe(MAX_STAGE_SCALE);
    expect(stageScale(NaN, 600)).toBe(MAX_STAGE_SCALE);
  });
});

describe("textScale", () => {
  it("shrinks text less than sizes", () => {
    expect(textScale(1)).toBe(1);
    expect(textScale(0.82)).toBeCloseTo(0.94, 2); // matches the old .gp-compact step
    expect(textScale(MIN_STAGE_SCALE)).toBeGreaterThan(MIN_STAGE_SCALE);
  });
});

describe("fitStage / toStage", () => {
  const STAGE = { w: 540, h: 960 };

  it("fits the stage, centred across and resting on the bottom", () => {
    const fit = fitStage(390, 700, STAGE);
    expect(fit.s).toBeCloseTo(390 / 540, 5);
    expect(fit.ox).toBeCloseTo(0, 5);
    expect(fit.oy).toBeCloseTo(700 - 960 * fit.s, 5);

    const wide = fitStage(480, 600, STAGE);
    expect(wide.s).toBeCloseTo(600 / 960, 5);
    expect(wide.ox).toBeCloseTo((480 - 540 * wide.s) / 2, 5);
    expect(wide.oy).toBeCloseTo(0, 5);
  });

  it("maps a screen point back to stage units", () => {
    const fit = fitStage(360, 540, STAGE);
    const corner = toStage(fit.ox + 540 * fit.s, fit.oy + 960 * fit.s, fit);
    expect(corner.x).toBeCloseTo(540, 5);
    expect(corner.y).toBeCloseTo(960, 5);
    const origin = toStage(fit.ox, fit.oy, fit);
    expect(origin.x).toBeCloseTo(0, 5);
    expect(origin.y).toBeCloseTo(0, 5);
  });
});
