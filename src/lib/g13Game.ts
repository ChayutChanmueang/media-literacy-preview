export type CatchGeometry = {
  objectX: number;
  objectBottomY: number;
  targetX: number;
  targetY: number;
  catchWidth: number;
  verticalTolerance?: number;
  /** How far below targetY the object's bottom may be and still count; past that it has gone by */
  catchDepth?: number;
};

export const clampToRange = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const getStackTargetY = (
  coneTop: number,
  stackLength: number,
  scoopRadius: number,
  stackStep: number,
  coneOverlap = 0
) =>
  stackLength > 0
    ? coneTop + coneOverlap - scoopRadius - (stackLength - 1) * stackStep
    : coneTop + coneOverlap;

export const getBombDropCount = (stackLength: number) =>
  Math.min(2, Math.max(0, stackLength));

export const getTowerCameraTarget = (
  viewportHeight: number,
  naturalTopY: number,
  followLineRatio = 0.48
) => Math.max(0, viewportHeight * followLineRatio - naturalTopY);

export const getSkyAltitudeProgress = (
  cameraOffset: number,
  viewportHeight: number
) => clampToRange(cameraOffset / Math.max(1, viewportHeight * 0.72), 0, 1);

/**
 * Score-based difficulty progress.
 * Returns a value in [0, 1] that linearly ramps from 0 at score=0
 * to 1 at score=scoreCap, then stays at 1.
 * Used to drive fall speed, spawn delay, and bomb chance scaling.
 */
export const getDifficultyProgress = (
  score: number,
  scoreCap: number
): number => clampToRange(score / Math.max(1, scoreCap), 0, 1);

export const isCaughtAtTarget = ({
  objectX,
  objectBottomY,
  targetX,
  targetY,
  catchWidth,
  verticalTolerance = 0,
  catchDepth = Infinity,
}: CatchGeometry) =>
  objectBottomY >= targetY - verticalTolerance &&
  objectBottomY <= targetY + catchDepth &&
  Math.abs(objectX - targetX) <= catchWidth;

/**
 * Calculates the index range of scoops to render, capping the total visible
 * stack height to maxVisiblePx (excluding cone).
 * Only the topmost scoops that fit within the pixel budget are shown.
 */
export const getVisibleScoopRange = (
  stackLength: number,
  maxVisiblePx: number,
  stackStep: number
): { startIndex: number; endIndex: number } => {
  if (stackLength <= 0) return { startIndex: 0, endIndex: 0 };
  const maxVisibleScoops = Math.max(1, Math.floor(maxVisiblePx / Math.max(1, stackStep)) + 1);
  const startIndex = Math.max(0, stackLength - maxVisibleScoops);
  return { startIndex, endIndex: stackLength };
};


/**
 * Value of a looping keyframe track at progress t (0–1), eased (smoothstep) between keys.
 * Keys are [t, value] pairs sorted by t; used for the tutorial hand's path and fade.
 */
export const getKeyframeValue = (t: number, keys: readonly (readonly [number, number])[]): number => {
  if (keys.length === 0) return 0;
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i += 1) {
    const [t0, v0] = keys[i - 1];
    const [t1, v1] = keys[i];
    if (t <= t1) {
      const p = t1 === t0 ? 1 : (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * p * p * (3 - 2 * p);
    }
  }
  return keys[keys.length - 1][1];
};
