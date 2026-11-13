// G20 / G20K: the next veggie is tossed up from below the screen and drops into the pan.
// Plain projectile maths in stage units and 60 fps frames (same units as the games' physics), solved in
// closed form so the veggie lands exactly on its spot at any frame rate.

type Point = { x: number; y: number };

export type PanToss = {
  fromX: number;
  fromY: number;
  vx: number;
  vy: number;
  /** frames from launch to landing in the pan */
  frames: number;
  /** frames since launch */
  t: number;
};

/** A toss from (fromX, fromY) that peaks `peakRise` above `to` and comes down onto `to` */
export function startPanToss(fromX: number, fromY: number, to: Point, gravity: number, peakRise: number): PanToss {
  const peakY = to.y - peakRise;
  const rise = Math.max(0, fromY - peakY);
  const vy = -Math.sqrt(2 * gravity * rise);
  const frames = Math.max(1, -vy / gravity + Math.sqrt((2 * peakRise) / gravity));
  return { fromX, fromY, vx: (to.x - fromX) / frames, vy, frames, t: 0 };
}

/** Where the tossed veggie is `toss.t` frames after launch (held at the landing spot once it has landed) */
export function panTossPosition(toss: PanToss, gravity: number): Point {
  const t = Math.min(toss.t, toss.frames);
  return { x: toss.fromX + toss.vx * t, y: toss.fromY + toss.vy * t + 0.5 * gravity * t * t };
}

/** Random x along the bottom for a toss after a serve, kept `margin` in from each side */
export function randomTossX(width: number, margin: number, random: () => number = Math.random) {
  return margin + random() * Math.max(0, width - margin * 2);
}
