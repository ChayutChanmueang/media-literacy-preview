/**
 * Screen-size scaling for the fun games (G13, G18–G20, G20K) — see
 * docs/implementation_plan/fun-game-viewport-scaling-plan.md.
 *
 * Each game is tuned on the reference viewport below. On a phone with less room (LINE's bars, a
 * narrow "Display size" setting, a short screen) everything in the game shrinks by one factor `s`,
 * so the game keeps the same proportions instead of the sprites taking over the screen. `s` never
 * goes above 1: tablets and desktop keep the tuned size.
 */

export type Size = { w: number; h: number };

/**
 * The game root on an iPhone 12 Pro (390 × 844 in DevTools) — the screen the fun games were tuned
 * on (s = 1). 388, not 390: #root-container has a 1px border each side (globals.css).
 */
export const REFERENCE_VIEWPORT: Size = { w: 388, h: 844 };
/** below this the game would get too small to see/tap; shorter screens get a denser scene or scroll */
export const MIN_STAGE_SCALE = 0.6;
export const MAX_STAGE_SCALE = 1;
/** text shrinks a third as much as sizes (gp-text-* also keeps an 18px floor) */
const TEXT_SHARE = 0.33;

/** one scale factor for an area of w × h, from the side that is shortest compared with the reference */
export function stageScale(
  w: number,
  h: number,
  reference: Size = REFERENCE_VIEWPORT,
  min = MIN_STAGE_SCALE,
  max = MAX_STAGE_SCALE
): number {
  if (!(w > 0) || !(h > 0)) return max;
  const s = Math.min(w / reference.w, h / reference.h);
  return Math.min(max, Math.max(min, s));
}

/** text factor that goes with a size factor — the --gp-t partner of --gp-s */
export function textScale(s: number): number {
  return 1 - (1 - s) * TEXT_SHARE;
}

/**
 * Fixed-size stage (G20's 540 × 960) placed in a w × h area: as large as fits, centred across,
 * resting on the bottom edge. The space left over is scene the game draws past the stage edges.
 */
export function fitStage(w: number, h: number, stage: Size): { s: number; ox: number; oy: number } {
  const s = Math.max(0.01, Math.min(w / stage.w, h / stage.h));
  return { s, ox: (w - stage.w * s) / 2, oy: h - stage.h * s };
}

/** a point in the area (px from its top-left corner) → stage units */
export function toStage(x: number, y: number, fit: { s: number; ox: number; oy: number }): { x: number; y: number } {
  return { x: (x - fit.ox) / fit.s, y: (y - fit.oy) / fit.s };
}
