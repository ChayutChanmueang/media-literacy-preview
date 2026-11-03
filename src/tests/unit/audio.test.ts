import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clamp01, effectiveVolume, gameLessonOf, isConstrainedNetwork, resolveBgm } from "@/lib/audio/audioMath";
import {
  AUDIO_SETTINGS_KEY,
  DEFAULT_AUDIO_SETTINGS,
  clearAudioSettings,
  loadAudioSettings,
  saveAudioSettings,
} from "@/lib/audio/audioSettings";
import { SFX } from "@/lib/audio/audioCatalog";

describe("audioMath", () => {
  const withG13Track = (key: string) => key === "flow-g13";

  it.each([
    ["/", "menu"],
    ["/consent", "menu"],
    ["/consent/location", "menu"],
    ["/lessons", "menu"],
    ["/lessons/", "menu"],
    ["/lessons/complete", "menu"],
    ["/certificate", "menu"],
    ["/lessons/topic-1/video", null],
    ["/lessons/topic-1/game", "game"],
    ["/lessons/g19/score", "game"],
    ["/lessons/g20/leaderboard", "game"],
    ["/lessons/flow-g13/game", "flow-g13"],
    ["/pretest", null],
    ["/posttest", null],
    ["/self-assessment/pre", null],
    ["/self-assessment/post/questions", null],
    ["/facilitator", null],
    ["/facilitator/abc", null],
    ["/dev/games", null],
  ])("resolveBgm(%s) = %s", (path, expected) => {
    expect(resolveBgm(path, withG13Track)).toBe(expected);
  });

  it("gameLessonOf finds the lesson of game / score / leaderboard pages only", () => {
    expect(gameLessonOf("/lessons/g17/game")).toBe("g17");
    expect(gameLessonOf("/lessons/g17/score")).toBe("g17");
    expect(gameLessonOf("/lessons/g17/video")).toBeNull();
    expect(gameLessonOf("/lessons")).toBeNull();
  });

  it("effectiveVolume multiplies gain × channel × duck and is 0 when muted", () => {
    expect(effectiveVolume(0.5, 0.8, false)).toBeCloseTo(0.4);
    expect(effectiveVolume(0.5, 0.8, false, 0.2)).toBeCloseTo(0.08);
    expect(effectiveVolume(0.5, 0.8, true)).toBe(0);
    expect(effectiveVolume(2, 2, false)).toBe(1);
    expect(clamp01(Number.NaN)).toBe(0);
  });

  it("isConstrainedNetwork: data saver or 2G only", () => {
    expect(isConstrainedNetwork(undefined)).toBe(false);
    expect(isConstrainedNetwork({ effectiveType: "4g" })).toBe(false);
    expect(isConstrainedNetwork({ saveData: true, effectiveType: "4g" })).toBe(true);
    expect(isConstrainedNetwork({ effectiveType: "2g" })).toBe(true);
    expect(isConstrainedNetwork({ effectiveType: "slow-2g" })).toBe(true);
  });
});

describe("audioSettings", () => {
  beforeEach(() => {
    localStorage.clear();
    clearAudioSettings();
  });

  it("defaults when nothing is stored", () => {
    expect(loadAudioSettings()).toEqual(DEFAULT_AUDIO_SETTINGS);
  });

  it("survives a reload, from localStorage or (LINE cleared it) from the cookie", () => {
    const changed = { ...DEFAULT_AUDIO_SETTINGS, bgmMuted: true, sfxVolume: 0.3 };
    saveAudioSettings(changed);
    expect(loadAudioSettings()).toEqual(changed);
    localStorage.removeItem(AUDIO_SETTINGS_KEY);
    expect(loadAudioSettings()).toEqual(changed);
  });

  it("repairs bad stored values", () => {
    localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify({ bgmVolume: 7, sfxVolume: "loud", bgmMuted: 1 }));
    expect(loadAudioSettings()).toEqual({ ...DEFAULT_AUDIO_SETTINGS, bgmVolume: 1 });
  });
});

// ---------- engine, with Howler mocked ----------

const howlerMock = vi.hoisted(() => {
  let counter = 1000;
  class FakeHowl {
    static instances: FakeHowl[] = [];
    opts: Record<string, unknown> & { src: string[]; volume?: number };
    groupVolume: number;
    volumes = new Map<number, number>();
    playingIds = new Set<number>();
    fades: { from: number; to: number; ms: number; id: number }[] = [];
    paused: number[] = [];
    unloaded = false;
    constructor(opts: FakeHowl["opts"]) {
      this.opts = opts;
      this.groupVolume = opts.volume ?? 1;
      FakeHowl.instances.push(this);
    }
    finishLoading() {
      (this.opts.onload as (() => void) | undefined)?.();
    }
    play(id?: number) {
      const soundId = id ?? ++counter;
      this.playingIds.add(soundId);
      return soundId;
    }
    stop(id?: number) {
      if (id === undefined) this.playingIds.clear();
      else this.playingIds.delete(id);
      return this;
    }
    pause(id: number) {
      this.playingIds.delete(id);
      this.paused.push(id);
      return this;
    }
    playing(id: number) {
      return this.playingIds.has(id);
    }
    volume(a?: number, id?: number) {
      if (a === undefined) return this.groupVolume;
      if (id !== undefined) {
        this.volumes.set(id, a);
        return this;
      }
      if (a >= 1000) return this.volumes.get(a) ?? this.groupVolume; // getter by sound id
      this.groupVolume = a;
      return this;
    }
    fade(from: number, to: number, ms: number, id: number) {
      this.fades.push({ from, to, ms, id });
      this.volumes.set(id, to);
      return this;
    }
    rate() {
      return this;
    }
    unload() {
      this.unloaded = true;
    }
  }
  const ctx = {
    state: "running" as AudioContextState,
    listeners: [] as (() => void)[],
    addEventListener(_: string, fn: () => void) {
      this.listeners.push(fn);
    },
    removeEventListener(_: string, fn: () => void) {
      this.listeners = this.listeners.filter((l) => l !== fn);
    },
    resume: () => Promise.resolve(),
  };
  const Howler = {
    ctx,
    masterGain: {},
    muted: false,
    volume: () => 1,
    mute(value: boolean) {
      this.muted = value;
    },
    _unlockAudio: () => {},
  };
  return { FakeHowl, Howler, ctx };
});

vi.mock("howler", () => ({ Howl: howlerMock.FakeHowl, Howler: howlerMock.Howler }));
vi.mock("@/lib/audio/audioCatalog", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/audio/audioCatalog")>();
  return {
    ...original,
    BGM: {
      menu: { src: "/audio/bgm/menu-test.mp3", gain: 1 },
      game: { src: "/audio/bgm/game-test.mp3", gain: 1 },
    },
  };
});

type Engine = typeof import("@/lib/audio/audioEngine").audio;

describe("audioEngine", () => {
  let audio: Engine;
  let now = 0;
  const { FakeHowl, Howler, ctx } = howlerMock;
  const howlOf = (src: string) => FakeHowl.instances.filter((h) => h.opts.src[0] === src).at(-1)!;
  const tick = (ms = 100) => {
    now += ms;
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    localStorage.clear();
    clearAudioSettings();
    FakeHowl.instances.length = 0;
    ctx.state = "running";
    ctx.listeners = [];
    Howler.muted = false;
    now = 10_000;
    vi.spyOn(performance, "now").mockImplementation(() => now);
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    audio = (await import("@/lib/audio/audioEngine")).audio;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const ready = async (...keys: Parameters<Engine["playSfx"]>[0][]) => {
    await audio.start();
    audio.preloadSfx(keys);
    keys.forEach((key) => howlOf(SFX[key].src).finishLoading());
  };

  it("does nothing before Howler has loaded", () => {
    expect(audio.playSfx("g13.scoopCatch")).toBeNull();
    expect(FakeHowl.instances).toHaveLength(0);
  });

  it("drops a sound that hasn't loaded yet instead of playing it late", async () => {
    await audio.start();
    expect(audio.playSfx("g13.scoopCatch")).toBeNull(); // creates the Howl
    expect(audio.playSfx("g13.scoopCatch")).toBeNull(); // still loading
    howlOf("/audio/g13/scoopCatch.wav").finishLoading();
    tick();
    expect(audio.playSfx("g13.scoopCatch")).not.toBeNull();
  });

  it("plays nothing until the browser unlocked audio", async () => {
    ctx.state = "suspended";
    await ready("g13.scoopCatch");
    expect(audio.playSfx("g13.scoopCatch")).toBeNull();
    ctx.state = "running";
    ctx.listeners.forEach((l) => l());
    expect(audio.playSfx("g13.scoopCatch")).not.toBeNull();
  });

  it("minIntervalMs drops a replay that comes too soon", async () => {
    await ready("g17.paddleBounce"); // minIntervalMs 60
    expect(audio.playSfx("g17.paddleBounce")).not.toBeNull();
    tick(20);
    expect(audio.playSfx("g17.paddleBounce")).toBeNull();
    tick(60);
    expect(audio.playSfx("g17.paddleBounce")).not.toBeNull();
  });

  it("maxVoices stops the oldest copy", async () => {
    await ready("g13.scoopCatch"); // maxVoices 3
    const ids = [1, 2, 3, 4].map(() => {
      tick();
      return audio.playSfx("g13.scoopCatch")!;
    });
    const howl = howlOf("/audio/g13/scoopCatch.wav");
    expect(howl.playing(ids[0])).toBe(false);
    expect(ids.slice(1).every((id) => howl.playing(id))).toBe(true);
    expect(audio.debugState().activeVoices).toBe(3);
  });

  it("caps the whole system at 12 voices", async () => {
    // their maxVoices add up to 14
    const keys = ["g13.scoopCatch", "g17.blockBreak", "g19.tileMatch", "g20.throwBall", "g13.scoopCatchX2", "g17.paddleBounce"] as const;
    await ready(...keys, "g17.powerUp");
    for (let round = 0; round < 3; round++) {
      for (const key of keys) {
        tick();
        audio.playSfx(key);
      }
    }
    expect(audio.debugState().activeVoices).toBe(12);
    tick();
    expect(audio.playSfx("g17.powerUp")).toBeNull(); // a new sound is refused, nothing playing is cut
  });

  it("SFX mute silences new sounds and turns every loaded sound down", async () => {
    await ready("g13.scoopCatch", "g17.powerUp");
    audio.updateSettings({ sfxMuted: true });
    tick();
    expect(audio.playSfx("g13.scoopCatch")).toBeNull();
    expect(howlOf("/audio/g13/scoopCatch.wav").groupVolume).toBe(0);
    expect(howlOf("/audio/g17/powerUp.wav").groupVolume).toBe(0);
    audio.updateSettings({ sfxMuted: false, sfxVolume: 0.5 });
    expect(howlOf("/audio/g17/powerUp.wav").groupVolume).toBeCloseTo(0.7 * 0.5);
  });

  it("settings keep the same object until they change (useSyncExternalStore)", () => {
    const first = audio.getSettings();
    expect(audio.getSettings()).toBe(first);
    audio.updateSettings({ sfxVolume: first.sfxVolume });
    expect(audio.getSettings()).toBe(first);
    audio.updateSettings({ sfxVolume: 0.1 });
    expect(audio.getSettings()).not.toBe(first);
  });

  it("saves settings (debounced)", () => {
    audio.updateSettings({ bgmMuted: true });
    expect(localStorage.getItem(AUDIO_SETTINGS_KEY)).toBeNull();
    vi.advanceTimersByTime(400);
    expect(JSON.parse(localStorage.getItem(AUDIO_SETTINGS_KEY)!).bgmMuted).toBe(true);
  });

  it("route BGM: fades in once unlocked, keeps playing for the same key, crossfades to another", async () => {
    ctx.state = "suspended";
    audio.setRouteBgm("menu");
    await audio.start();
    expect(FakeHowl.instances).toHaveLength(0); // nothing downloaded before the first tap
    ctx.state = "running";
    ctx.listeners.forEach((l) => l());

    const menu = howlOf("/audio/bgm/menu-test.mp3");
    expect(menu.fades.at(-1)).toMatchObject({ from: 0, ms: 1500 });
    const target = menu.fades.at(-1)!.to;
    expect(target).toBeCloseTo(DEFAULT_AUDIO_SETTINGS.bgmVolume);

    audio.setRouteBgm("menu");
    expect(menu.fades).toHaveLength(1);

    audio.setRouteBgm("game");
    const game = howlOf("/audio/bgm/game-test.mp3");
    expect(menu.fades.at(-1)).toMatchObject({ to: 0, ms: 1200 });
    expect(game.fades.at(-1)).toMatchObject({ from: 0, ms: 1200 });
    vi.advanceTimersByTime(1300);
    expect(menu.paused).toHaveLength(1);
    vi.advanceTimersByTime(60_000);
    expect(menu.unloaded).toBe(true);
    expect(audio.debugState().bgmLoaded).toEqual(["game"]);
  });

  it("muting BGM pauses it (so the context can sleep) and unmuting fades it back", async () => {
    await audio.start();
    audio.setRouteBgm("menu");
    const menu = howlOf("/audio/bgm/menu-test.mp3");
    audio.updateSettings({ bgmMuted: true });
    expect(menu.fades.at(-1)).toMatchObject({ to: 0, ms: 800 });
    vi.advanceTimersByTime(900);
    expect(menu.paused).toHaveLength(1);
    audio.updateSettings({ bgmMuted: false });
    expect(menu.fades.at(-1)).toMatchObject({ from: 0, ms: 1500 });
    expect(audio.debugState().bgm).toBe("menu");
  });

  it("silence routes fade BGM out", async () => {
    await audio.start();
    audio.setRouteBgm("menu");
    audio.setRouteBgm(null);
    expect(howlOf("/audio/bgm/menu-test.mp3").fades.at(-1)).toMatchObject({ to: 0, ms: 800 });
    expect(audio.debugState().bgm).toBeNull();
  });

  it("ducks BGM while TTS talks, counted per reason", async () => {
    await audio.start();
    audio.setRouteBgm("menu");
    const menu = howlOf("/audio/bgm/menu-test.mp3");
    const full = menu.fades.at(-1)!.to;
    audio.duck("tts");
    expect(menu.fades.at(-1)!.to).toBeCloseTo(full * 0.2);
    audio.duck("video");
    audio.unduck("tts");
    expect(menu.fades.at(-1)!.to).toBeCloseTo(full * 0.2); // video still talking
    audio.unduck("video");
    expect(menu.fades.at(-1)!.to).toBeCloseTo(full);
  });

  it("an override wins over the route while mounted", async () => {
    await audio.start();
    audio.setRouteBgm("menu");
    const token = audio.pushBgmOverride(null);
    expect(audio.debugState().bgm).toBeNull();
    audio.popBgmOverride(token);
    expect(audio.debugState().bgm).toBe("menu");
  });

  it("hidden app: everything muted, BGM paused at once, no new sounds", async () => {
    await ready("g13.scoopCatch");
    audio.setRouteBgm("menu");
    const menu = howlOf("/audio/bgm/menu-test.mp3");
    audio.setHidden(true);
    expect(Howler.muted).toBe(true);
    expect(menu.paused).toHaveLength(1);
    expect(audio.playSfx("g13.scoopCatch")).toBeNull();
    audio.setHidden(false);
    expect(Howler.muted).toBe(false);
    expect(audio.debugState().bgm).toBe("menu");
  });

  it("a slow connection skips BGM unless the player turned music on", async () => {
    vi.stubGlobal("navigator", { ...navigator, connection: { saveData: true } });
    await audio.start();
    audio.setRouteBgm("menu");
    expect(audio.debugState().bgm).toBeNull();
    audio.updateSettings({ bgmTouched: true });
    expect(audio.debugState().bgm).toBe("menu");
  });

  it("unloads a left game's sounds", async () => {
    await ready("g13.scoopCatch", "g17.powerUp");
    audio.unloadSfxGroup("g13");
    expect(howlOf("/audio/g13/scoopCatch.wav").unloaded).toBe(true);
    expect(audio.debugState().sfxLoaded).toEqual(["g17.powerUp"]);
  });
});
