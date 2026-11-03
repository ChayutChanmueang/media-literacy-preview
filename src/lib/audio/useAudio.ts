import { useEffect, useSyncExternalStore } from "react";
import { audio } from "./audioEngine";
import type { SfxKey } from "./audioCatalog";
import { type AudioSettings, DEFAULT_AUDIO_SETTINGS } from "./audioSettings";

const serverSettings = () => DEFAULT_AUDIO_SETTINGS;

/** Sound settings for UI. Components that only play sounds don't need this — call audio.playSfx. */
export function useAudioSettings(): AudioSettings {
  return useSyncExternalStore(audio.subscribe, audio.getSettings, serverSettings);
}

/** Loads a game's sounds while its intro is showing, so the first hit in play isn't dropped. */
export function usePreloadSfx(keys: readonly SfxKey[]) {
  const id = keys.join("|");
  useEffect(() => {
    if (id) audio.preloadSfx(id.split("|") as SfxKey[]);
  }, [id]);
}

/**
 * A component's own BGM while mounted (wins over the route): a key, or null for silence.
 * `undefined` = no override (follow the route).
 */
export function useBgmOverride(key: string | null | undefined) {
  useEffect(() => {
    if (key === undefined) return;
    const token = audio.pushBgmOverride(key);
    return () => audio.popBgmOverride(token);
  }, [key]);
}
