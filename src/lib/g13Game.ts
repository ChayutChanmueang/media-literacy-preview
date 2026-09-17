export type CatchGeometry = {
  objectX: number;
  objectBottomY: number;
  targetX: number;
  targetY: number;
  catchWidth: number;
  verticalTolerance?: number;
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
}: CatchGeometry) =>
  objectBottomY >= targetY - verticalTolerance &&
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

