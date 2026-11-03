/**
 * The one audio system of the app (docs/software/11): a thin wrapper over Howler.js that adds what
 * Howler lacks — BGM / SFX channels, route BGM with crossfade, ducking, hide/show handling and
 * per-sound voice limits. Components never import "howler" directly; they call `audio.*`.
 *
 * Every call is a safe no-op on the server, before Howler has loaded, before the browser unlocked
 * audio, or when a file failed to load — sound is decoration and must never break a game.
 */
import type { Howl } from "howler";
import { BGM, SFX, type SfxDef, type SfxKey, sfxKeysOfGroup } from "./audioCatalog";
import { clamp01, effectiveVolume, isConstrainedNetwork } from "./audioMath";
import {
  AUDIO_CONTROLS_ENABLED,
  type AudioSettings,
  DEFAULT_AUDIO_SETTINGS,
  loadAudioSettings,
  saveAudioSettings,
} from "./audioSettings";

type HowlerModule = typeof import("howler");

const FADE_CROSS_MS = 1200;
const FADE_OUT_MS = 800;
const FADE_IN_MS = 1500;
const DUCK_IN_MS = 200;
const DUCK_OUT_MS = 400;
const DUCK_LEVEL = 0.2;
/** low-end Android phones crackle / burn CPU with many sources at once */
const MAX_TOTAL_VOICES = 12;
/** an unused BGM track (or a left game's SFX) is unloaded after this — decoded audio is big */
const UNLOAD_AFTER_MS = 60_000;
const SAVE_DEBOUNCE_MS = 300;

interface SfxEntry {
  howl: Howl;
  ready: boolean;
  /** ids still playing, oldest first */
  active: number[];
  lastAt: number;
}

interface BgmTrack {
  howl: Howl;
  id: number | null;
  pauseTimer?: number;
  unloadTimer?: number;
}

let H: HowlerModule | null = null;
let howlerLoading: Promise<void> | null = null;
let unlocked = false;
let hidden = false;
let settings: AudioSettings | null = null;
let saveTimer: number | undefined;
let applyPending = false;
const listeners = new Set<() => void>();

const sfx = new Map<SfxKey, SfxEntry>();
const pendingPreload = new Set<SfxKey>();
let totalVoices = 0;

const bgm = new Map<string, BgmTrack>();
let routeBgm: string | null = null;
const overrides: { token: number; key: string | null }[] = [];
let overrideSeq = 0;
/** the track that is (or is fading) in — null = silence */
let activeBgm: string | null = null;

const duckReasons = new Map<string, number>();

const isClient = () => typeof window !== "undefined";

function currentSettings(): AudioSettings {
  if (!isClient()) return DEFAULT_AUDIO_SETTINGS;
  // no controls = no way to undo a saved mute, so play with the defaults
  if (!settings) settings = AUDIO_CONTROLS_ENABLED ? loadAudioSettings() : DEFAULT_AUDIO_SETTINGS;
  return settings;
}

function notify() {
  listeners.forEach((listener) => listener());
}

// ---------- Howler loading / unlock ----------

/** Loads Howler (kept out of the first-load bundle) and gets audio ready to unlock on the next tap. */
function loadHowler(): Promise<void> {
  if (!isClient()) return Promise.resolve();
  if (!howlerLoading) {
    howlerLoading = import("howler")
      .then((mod) => {
        H = mod;
        onHowlerReady();
      })
      .catch(() => {});
  }
  return howlerLoading;
}

function onHowlerReady() {
  if (!H) return;
  const { Howler } = H;
  Howler.volume(); // creates the AudioContext
  // Howler only attaches its tap-to-unlock listeners when the first Howl is created; attach them now
  // so the very first tap on any page unlocks audio (private method, stable in the pinned 2.2.x)
  (Howler as unknown as { _unlockAudio?: () => void })._unlockAudio?.();
  Howler.mute(hidden);
  watchUnlock();
  pendingPreload.forEach((key) => createSfx(key));
  pendingPreload.clear();
}

function watchUnlock() {
  const ctx = H?.Howler.ctx;
  // no Web Audio: Howler falls back to HTML5 Audio and unlocks each element itself
  if (!ctx) {
    unlocked = true;
    syncBgm();
    return;
  }
  const check = () => {
    if (unlocked || ctx.state !== "running") return;
    unlocked = true;
    ctx.removeEventListener("statechange", check);
    syncBgm();
    notify();
  };
  ctx.addEventListener("statechange", check);
  check();
}

// ---------- SFX ----------

function releaseVoice(entry: SfxEntry, id: number) {
  const index = entry.active.indexOf(id);
  if (index === -1) return;
  entry.active.splice(index, 1);
  totalVoices--;
}

function createSfx(key: SfxKey): SfxEntry | null {
  const existing = sfx.get(key);
  if (existing) return existing;
  if (!H) {
    pendingPreload.add(key);
    void loadHowler();
    return null;
  }
  const def: SfxDef = SFX[key];
  const s = currentSettings();
  const entry = { ready: false, active: [], lastAt: -Infinity } as unknown as SfxEntry;
  entry.howl = new H.Howl({
    src: [def.src],
    loop: def.loop ?? false,
    volume: effectiveVolume(def.gain, s.sfxVolume, s.sfxMuted),
    onload: () => {
      entry.ready = true;
    },
    // a failed file stays not-ready (no retry storm from a game loop); a reload tries again
    onloaderror: () => {},
    // a looping sound fires "end" every loop — it is only released by stop
    onend: (id) => {
      if (!def.loop) releaseVoice(entry, id);
    },
    onstop: (id) => releaseVoice(entry, id),
  });
  sfx.set(key, entry);
  return entry;
}

/**
 * Plays a sound effect; safe to call every frame (no allocation, no React state, no logging).
 * Returns the Howler sound id (needed to stop a looping sound) or null when nothing played.
 */
function playSfx(key: SfxKey, opts?: { volume?: number; rate?: number }): number | null {
  if (!H || !unlocked || hidden) {
    if (!H) createSfx(key);
    return null;
  }
  const s = currentSettings();
  if (s.sfxMuted) return null;
  const entry = sfx.get(key);
  if (!entry) {
    createSfx(key); // dropped now (a late sound is confusing) — ready next time
    return null;
  }
  if (!entry.ready) return null;
  const def: SfxDef = SFX[key];
  const now = performance.now();
  if (now - entry.lastAt < (def.minIntervalMs ?? 30)) return null;
  if (entry.active.length >= (def.maxVoices ?? 4)) {
    // Howler's stop event is async, so release the oldest voice here
    const oldest = entry.active.shift() as number;
    totalVoices--;
    entry.howl.stop(oldest);
  } else if (totalVoices >= MAX_TOTAL_VOICES) {
    return null;
  }
  const id = entry.howl.play();
  if (opts?.volume !== undefined) entry.howl.volume(effectiveVolume(def.gain * opts.volume, s.sfxVolume, false), id);
  if (opts?.rate !== undefined) entry.howl.rate(opts.rate, id);
  entry.active.push(id);
  totalVoices++;
  entry.lastAt = now;
  return id;
}

function stopSfx(key: SfxKey, id: number | null | undefined) {
  if (id == null) return;
  const entry = sfx.get(key);
  if (!entry) return;
  releaseVoice(entry, id);
  entry.howl.stop(id);
}

function stopAllSfx() {
  sfx.forEach((entry) => {
    if (entry.active.length === 0) return;
    entry.active.length = 0;
    entry.howl.stop();
  });
  totalVoices = 0;
}

function preloadSfx(keys: readonly SfxKey[]) {
  if (!isClient()) return;
  keys.forEach((key) => createSfx(key));
}

/** Frees the decoded sounds of one game ("g13", "g20" …) — called a while after the player left it. */
function unloadSfxGroup(group: string) {
  sfxKeysOfGroup(group).forEach((key) => {
    pendingPreload.delete(key);
    const entry = sfx.get(key);
    if (!entry) return;
    totalVoices -= entry.active.length;
    entry.active.length = 0;
    entry.howl.unload();
    sfx.delete(key);
  });
}

/** Short synth tone on the SFX channel (G18's pads) — follows SFX volume/mute and hide/show. */
function playTone(hz: number, ms: number, opts?: { type?: OscillatorType; peak?: number }) {
  if (!H || !unlocked || hidden) return;
  const s = currentSettings();
  if (s.sfxMuted) return;
  const ctx = H.Howler.ctx;
  const out = H.Howler.masterGain;
  if (!ctx || !out) return;
  if (ctx.state !== "running") ctx.resume().catch(() => {});
  const peak = (opts?.peak ?? 0.18) * clamp01(s.sfxVolume);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = opts?.type ?? "triangle";
  osc.frequency.value = hz;
  const now = ctx.currentTime;
  const end = now + ms / 1000;
  // soft attack/release so the tone doesn't click
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peak, now + 0.02);
  gain.gain.setValueAtTime(peak, Math.max(now + 0.02, end - 0.06));
  gain.gain.linearRampToValueAtTime(0, end);
  osc.connect(gain).connect(out);
  osc.start(now);
  osc.stop(end + 0.02);
}

// ---------- BGM ----------

const duckFactor = () => (duckReasons.size > 0 ? DUCK_LEVEL : 1);

function bgmTarget(key: string) {
  const def = BGM[key];
  if (!def) return 0;
  return effectiveVolume(def.gain, currentSettings().bgmVolume, false, duckFactor());
}

function desiredBgm(): string | null {
  const key = overrides.length > 0 ? overrides[overrides.length - 1].key : routeBgm;
  if (!key || !BGM[key] || hidden) return null;
  const s = currentSettings();
  if (s.bgmMuted) return null;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (!s.bgmTouched && isConstrainedNetwork(connection)) return null;
  return key;
}

/** Brings the playing track in line with route / override / settings / visibility. */
function syncBgm() {
  if (!H || !unlocked) return; // re-run on unlock — BGM is never downloaded before the first tap
  const next = desiredBgm();
  if (next === activeBgm) return;
  const previous = activeBgm;
  activeBgm = next;
  if (previous) fadeOutBgm(previous, hidden ? 0 : next ? FADE_CROSS_MS : FADE_OUT_MS);
  if (next) fadeInBgm(next, previous ? FADE_CROSS_MS : FADE_IN_MS);
  notify();
}

const volumeOf = (howl: Howl, id: number) => howl.volume(id) as number;

function fadeOutBgm(key: string, ms: number) {
  const track = bgm.get(key);
  if (!track || track.id === null) return;
  const id = track.id;
  window.clearTimeout(track.pauseTimer);
  window.clearTimeout(track.unloadTimer);
  // paused, not stopped: coming back within UNLOAD_AFTER_MS continues where it was
  if (ms <= 0) {
    track.howl.pause(id);
  } else {
    track.howl.fade(volumeOf(track.howl, id), 0, ms, id);
    track.pauseTimer = window.setTimeout(() => {
      if (activeBgm !== key) track.howl.pause(id);
    }, ms + 50);
  }
  track.unloadTimer = window.setTimeout(() => {
    if (activeBgm === key) return;
    track.howl.unload();
    bgm.delete(key);
  }, UNLOAD_AFTER_MS);
}

function fadeInBgm(key: string, ms: number) {
  if (!H) return;
  let track = bgm.get(key);
  if (!track) {
    const howl = new H.Howl({ src: [BGM[key].src], loop: true, volume: 0, onloaderror: () => {} });
    track = { howl, id: null };
    bgm.set(key, track);
  }
  window.clearTimeout(track.pauseTimer);
  window.clearTimeout(track.unloadTimer);
  if (track.id === null) {
    track.id = track.howl.play(); // queued by Howler until the file has loaded
    track.howl.volume(0, track.id);
  } else if (!track.howl.playing(track.id)) {
    track.howl.volume(0, track.id); // paused at once when the app was hidden — fade in again, don't jump
    track.howl.play(track.id);
  }
  track.howl.fade(volumeOf(track.howl, track.id), bgmTarget(key), ms, track.id);
}

/** Re-fades the playing track to its current target (after duck / unduck). */
function refadeActive(ms: number) {
  const track = activeBgm ? bgm.get(activeBgm) : undefined;
  if (!track || track.id === null || !activeBgm) return;
  track.howl.fade(volumeOf(track.howl, track.id), bgmTarget(activeBgm), ms, track.id);
}

function setRouteBgm(key: string | null) {
  routeBgm = key;
  syncBgm();
}

/** A component's own BGM while it is mounted (wins over the route) — see useBgmOverride. */
function pushBgmOverride(key: string | null): number {
  const token = ++overrideSeq;
  overrides.push({ token, key });
  syncBgm();
  return token;
}

function popBgmOverride(token: number) {
  const index = overrides.findIndex((o) => o.token === token);
  if (index === -1) return;
  overrides.splice(index, 1);
  syncBgm();
}

// ---------- ducking ----------

/** Lowers BGM while something else talks (reason "tts" / "video"); counted per reason. */
function duck(reason: string) {
  const wasDucked = duckReasons.size > 0;
  duckReasons.set(reason, (duckReasons.get(reason) ?? 0) + 1);
  if (!wasDucked) refadeActive(DUCK_IN_MS);
}

function unduck(reason: string) {
  const count = duckReasons.get(reason);
  if (!count) return;
  if (count > 1) duckReasons.set(reason, count - 1);
  else duckReasons.delete(reason);
  if (duckReasons.size === 0) refadeActive(DUCK_OUT_MS);
}

// ---------- visibility ----------

/** App hidden (other app / locked screen): silence everything; shown again: carry on. */
function setHidden(value: boolean) {
  if (hidden === value) return;
  hidden = value;
  H?.Howler.mute(value);
  syncBgm();
}

// ---------- settings ----------

function applyVolumes() {
  applyPending = false;
  const s = currentSettings();
  sfx.forEach((entry, key) => {
    entry.howl.volume(effectiveVolume(SFX[key].gain, s.sfxVolume, s.sfxMuted));
  });
  const track = activeBgm ? bgm.get(activeBgm) : undefined;
  if (track && track.id !== null && activeBgm) track.howl.volume(bgmTarget(activeBgm), track.id);
}

function updateSettings(patch: Partial<AudioSettings>) {
  const previous = currentSettings();
  const next: AudioSettings = { ...previous, ...patch };
  next.bgmVolume = clamp01(next.bgmVolume);
  next.sfxVolume = clamp01(next.sfxVolume);
  if ((Object.keys(next) as (keyof AudioSettings)[]).every((k) => next[k] === previous[k])) return;
  settings = next;
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => saveAudioSettings(next), SAVE_DEBOUNCE_MS);
  // a dragged slider updates every Howl at most once per frame
  if (!applyPending) {
    applyPending = true;
    window.requestAnimationFrame(applyVolumes);
  }
  if (previous.bgmMuted !== next.bgmMuted || previous.bgmTouched !== next.bgmTouched) syncBgm();
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** State for E2E / debugging (window.__audioDebug outside production). */
function debugState() {
  return {
    loaded: H !== null,
    unlocked,
    hidden,
    ctxState: H?.Howler.ctx?.state ?? null,
    routeBgm,
    bgm: activeBgm,
    activeVoices: totalVoices,
    ducked: duckReasons.size > 0,
    sfxLoaded: [...sfx.keys()],
    bgmLoaded: [...bgm.keys()],
    settings: currentSettings(),
  };
}

export const audio = {
  start: loadHowler,
  setRouteBgm,
  pushBgmOverride,
  popBgmOverride,
  playSfx,
  stopSfx,
  stopAllSfx,
  preloadSfx,
  unloadSfxGroup,
  playTone,
  duck,
  unduck,
  setHidden,
  getSettings: currentSettings,
  updateSettings,
  subscribe,
  debugState,
};
