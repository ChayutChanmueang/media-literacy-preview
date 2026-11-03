"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { audio } from "@/lib/audio/audioEngine";
import { BGM, SFX_GROUP_BY_LESSON } from "@/lib/audio/audioCatalog";
import { gameLessonOf, resolveBgm } from "@/lib/audio/audioMath";

/** a left game's decoded sounds are freed after this (docs/software/11 ข้อ 10.4) */
const SFX_UNLOAD_AFTER_MS = 60_000;

const hasTrack = (key: string) => key in BGM;

/**
 * Lifecycle of the single audio system, mounted once in the root layout (renders nothing):
 * loads Howler when the browser is idle, follows the route's BGM, silences audio while the app is
 * hidden, stops a game's sounds when leaving it and frees them a minute later.
 */
export default function AudioProvider() {
  const pathname = usePathname();
  const groupRef = useRef<string | null>(null);
  const unloadTimers = useRef(new Map<string, number>());

  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
      __audioDebug?: typeof audio.debugState;
    };
    // Howler stays out of the first-load bundle and doesn't compete with the page loading
    const idle = w.requestIdleCallback
      ? w.requestIdleCallback(() => void audio.start(), { timeout: 3000 })
      : window.setTimeout(() => void audio.start(), 1500);

    const syncHidden = () => audio.setHidden(document.visibilityState === "hidden");
    const onPageHide = () => audio.setHidden(true); // some LINE builds fire only this
    document.addEventListener("visibilitychange", syncHidden);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", syncHidden);

    if (process.env.NODE_ENV !== "production") w.__audioDebug = audio.debugState;

    const timers = unloadTimers.current;
    return () => {
      if (w.cancelIdleCallback) w.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      document.removeEventListener("visibilitychange", syncHidden);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", syncHidden);
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
    };
  }, []);

  useEffect(() => {
    audio.setRouteBgm(resolveBgm(pathname, hasTrack));

    // a game's sounds (a dragLoop above all) never outlive its play screen
    if (!/\/game\/?$/.test(pathname)) audio.stopAllSfx();

    const lessonId = gameLessonOf(pathname);
    const group = lessonId ? SFX_GROUP_BY_LESSON[lessonId] ?? null : null;
    const timers = unloadTimers.current;
    if (group) {
      window.clearTimeout(timers.get(group));
      timers.delete(group);
    }
    const previous = groupRef.current;
    if (previous && previous !== group && !timers.has(previous)) {
      timers.set(
        previous,
        window.setTimeout(() => {
          timers.delete(previous);
          audio.unloadSfxGroup(previous);
        }, SFX_UNLOAD_AFTER_MS)
      );
    }
    groupRef.current = group;
  }, [pathname]);

  return null;
}
