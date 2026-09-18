import { useEffect, useRef, useSyncExternalStore } from "react";

// Compile-time guard (same as G13's dev timer skip): production builds drop the header button and handlers,
// unless NEXT_PUBLIC_ENABLE_DEV_HUB=true was set at build time (same flag that unlocks /dev/games, see devHub.ts).
export const DEV_SKIP_ENABLED =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_ENABLE_DEV_HUB === "true";

let current: (() => void) | null = null;
const listeners = new Set<() => void>();

const setHandler = (handler: (() => void) | null) => {
  current = handler;
  listeners.forEach((notify) => notify());
};

const subscribe = (notify: () => void) => {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
};

/** Register what the header's dev "skip" button does on this page (usually: go to the next step). */
export function useDevSkip(handler: () => void) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!DEV_SKIP_ENABLED) return;
    const run = () => handlerRef.current();
    setHandler(run);
    return () => {
      if (current === run) setHandler(null);
    };
  }, []);
}

/** The active page's skip handler, or null when the page registered none. */
export function useDevSkipHandler() {
  return useSyncExternalStore(subscribe, () => current, () => null);
}
