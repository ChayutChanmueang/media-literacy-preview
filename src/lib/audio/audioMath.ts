/** Pure helpers of the audio system — no Howler, no DOM, so they are unit-tested directly. */

export const clamp01 = (value: number) => (Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0);

/** Volume a Howl gets: per-file gain × channel volume × duck (0 when the channel is muted). */
export const effectiveVolume = (gain: number, channelVolume: number, muted: boolean, duck = 1) =>
  muted ? 0 : clamp01(gain * clamp01(channelVolume) * clamp01(duck));

const GAME_ROUTE = /^\/lessons\/([^/]+)\/(game|score|leaderboard)\/?$/;

/** lessonId when the path is a game or one of its after-game pages (score / leaderboard), else null */
export const gameLessonOf = (pathname: string): string | null => GAME_ROUTE.exec(pathname)?.[1] ?? null;

const MENU_ROUTES = new Set(["/", "/consent", "/consent/location", "/lessons", "/lessons/complete", "/certificate"]);

/**
 * BGM key of a route (docs/software/11 ข้อ 6.2). `hasTrack` tells whether a game has its own track;
 * otherwise games share "game". null = silence (videos, tests, facilitator, dev tools).
 */
export function resolveBgm(pathname: string, hasTrack: (key: string) => boolean): string | null {
  const path = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  if (MENU_ROUTES.has(path)) return "menu";
  const lessonId = gameLessonOf(path);
  if (lessonId) return hasTrack(lessonId) ? lessonId : "game";
  return null;
}

/** Slow or data-saving connection: BGM isn't downloaded unless the player turned music on themselves. */
export function isConstrainedNetwork(connection: { saveData?: boolean; effectiveType?: string } | undefined) {
  if (!connection) return false;
  return connection.saveData === true || connection.effectiveType === "slow-2g" || connection.effectiveType === "2g";
}
