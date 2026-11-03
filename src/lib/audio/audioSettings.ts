import { getCookie, setCookie } from "@/services/progressService";
import { clamp01 } from "./audioMath";

/** Sound settings of this device — localStorage + cookie like progressService (LINE clears storage). */
export interface AudioSettings {
  bgmVolume: number;
  sfxVolume: number;
  bgmMuted: boolean;
  sfxMuted: boolean;
  /** the player set music on/off themselves — a slow connection then no longer turns BGM off */
  bgmTouched: boolean;
}

export const AUDIO_SETTINGS_KEY = "naplab_ml_audio";

/**
 * Whether players get sound controls (☰ drawer "เสียง" section + the in-game on/off button).
 * Off until the team decides if players may turn sound off (docs/software/11 ข้อ 12) — while off,
 * stored settings are ignored too, so a device muted earlier isn't stuck silent with no button.
 */
export const AUDIO_CONTROLS_ENABLED = false;

// BGM starts quiet: "เพลงประกอบเบา ๆ ปิดได้ง่าย" (docs/gdd/03-art-direction.md)
export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  bgmVolume: 0.35,
  sfxVolume: 0.8,
  bgmMuted: false,
  sfxMuted: false,
  bgmTouched: false,
};

function sanitize(raw: unknown): AudioSettings {
  const value = (raw && typeof raw === "object" ? raw : {}) as Partial<Record<keyof AudioSettings, unknown>>;
  const num = (v: unknown, fallback: number) => (typeof v === "number" ? clamp01(v) : fallback);
  const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
  const d = DEFAULT_AUDIO_SETTINGS;
  return {
    bgmVolume: num(value.bgmVolume, d.bgmVolume),
    sfxVolume: num(value.sfxVolume, d.sfxVolume),
    bgmMuted: bool(value.bgmMuted, d.bgmMuted),
    sfxMuted: bool(value.sfxMuted, d.sfxMuted),
    bgmTouched: bool(value.bgmTouched, d.bgmTouched),
  };
}

export function loadAudioSettings(): AudioSettings {
  if (typeof window === "undefined") return DEFAULT_AUDIO_SETTINGS;
  let stored: unknown = null;
  try {
    const raw = localStorage.getItem(AUDIO_SETTINGS_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch {}
  return sanitize(stored ?? getCookie(AUDIO_SETTINGS_KEY));
}

export function saveAudioSettings(settings: AudioSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
  setCookie(AUDIO_SETTINGS_KEY, settings, 365);
}

export function clearAudioSettings() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUDIO_SETTINGS_KEY);
  } catch {}
  document.cookie = `${AUDIO_SETTINGS_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
