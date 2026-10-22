import { useSyncExternalStore } from "react";

const subscribeNoop = () => () => {};

/**
 * false during SSR and the hydration render, true afterwards.
 * Lets a component read client-only storage (localStorage/cookies via progressService) during render
 * without a hydration mismatch — instead of a mount effect that calls setState.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

/**
 * Reads a primitive value from client-only storage (e.g. progressService.getAppMode()).
 * Returns `serverValue` during SSR/hydration. `read` must return a primitive so the snapshot is stable.
 */
export function useClientValue<T extends string | number | boolean | null>(read: () => T, serverValue: T): T {
  return useSyncExternalStore(subscribeNoop, read, () => serverValue);
}
