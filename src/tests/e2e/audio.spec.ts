import { test, expect, type Page } from "@playwright/test";
import { AUDIO_CONTROLS_ENABLED } from "../../lib/audio/audioSettings";

/**
 * The single audio system (docs/software/11): route → BGM, no audio downloads where the budget says
 * none (before the first tap, on the video page), a game preloads its own sounds, and the sound
 * buttons persist. Checks the engine's state through window.__audioDebug (dev builds), not real sound.
 */

type AudioDebug = {
  loaded: boolean;
  routeBgm: string | null;
  sfxLoaded: string[];
  settings: { bgmMuted: boolean; sfxMuted: boolean };
};

const debugState = (page: Page) =>
  page.evaluate(() => (window as unknown as { __audioDebug?: () => AudioDebug }).__audioDebug?.() ?? null);

// a consented session so the game/video routes don't send us to /consent (same as fun-game-viewport.spec)
async function seedSession(page: Page) {
  const session = {
    sessionId: "e2e-audio",
    ageGroup: "60-69",
    consentGiven: true,
    location: { province: "เชียงใหม่", district: "", subdistrict: "", source: "manual" },
    deviceMetadata: {},
    createdAt: "2026-11-02T00:00:00.000Z",
  };
  await page.context().addCookies([
    { name: "naplab_ml_session", value: encodeURIComponent(JSON.stringify(session)), url: "http://localhost:3000" },
  ]);
}

function collectAudioRequests(page: Page) {
  const urls: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/audio/")) urls.push(request.url());
  });
  return urls;
}

test("no sound controls while they are switched off", async ({ page }) => {
  test.skip(AUDIO_CONTROLS_ENABLED, "controls are on");
  await seedSession(page);
  await page.goto("/lessons/flow-g13/game");
  await expect(page.getByRole("button", { name: "กดเพื่อเริ่ม" })).toBeVisible();
  await expect(page.getByRole("button", { name: "ปิดเสียงเกม" })).toHaveCount(0);
  await page.goto("/lessons");
  await page.getByRole("button", { name: "เปิดเมนู" }).click();
  await expect(page.getByRole("button", { name: "ปิดเพลงประกอบ" })).toHaveCount(0);
});

test("landing page: menu BGM route, Howler loads when idle, no audio file before a tap", async ({ page }) => {
  const audioRequests = collectAudioRequests(page);
  await page.goto("/");
  await expect.poll(async () => (await debugState(page))?.loaded, { timeout: 10_000 }).toBe(true);
  expect((await debugState(page))?.routeBgm).toBe("menu");
  expect(audioRequests).toEqual([]);
});

test("video page: no BGM and no audio downloads", async ({ page }) => {
  await seedSession(page);
  const audioRequests = collectAudioRequests(page);
  await page.goto("/lessons/topic-1/video");
  await expect.poll(async () => (await debugState(page))?.loaded, { timeout: 10_000 }).toBe(true);
  expect((await debugState(page))?.routeBgm).toBeNull();
  expect(audioRequests).toEqual([]);
});

test("game page: game BGM route and the game's sounds preload on its intro", async ({ page }) => {
  await seedSession(page);
  const audioRequests = collectAudioRequests(page);
  await page.goto("/lessons/flow-g13/game");
  await expect(page.getByRole("button", { name: "กดเพื่อเริ่ม" })).toBeVisible();
  await expect
    .poll(async () => (await debugState(page))?.sfxLoaded.slice().sort(), { timeout: 10_000 })
    .toEqual(["g13.bombHit", "g13.scoopCatch", "g13.scoopCatchX2"]);
  expect((await debugState(page))?.routeBgm).toBe("game");
  await expect.poll(() => audioRequests.filter((u) => u.includes("/audio/g13/")).length).toBe(3);
});

test("in-game sound button mutes everything and stays muted after a reload", async ({ page }) => {
  test.skip(!AUDIO_CONTROLS_ENABLED, "sound controls are hidden (AUDIO_CONTROLS_ENABLED)");
  await seedSession(page);
  await page.goto("/lessons/flow-g13/game");
  const toggle = page.getByRole("button", { name: "ปิดเสียงเกม" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect.poll(async () => (await debugState(page))?.settings).toMatchObject({ bgmMuted: true, sfxMuted: true });

  await page.waitForTimeout(400); // settings are saved debounced (300 ms)
  await page.reload();
  await expect(page.getByRole("button", { name: "ปิดเสียงเกม" })).toHaveAttribute("aria-pressed", "true");
});

test("drawer: music and sound effects switch off separately", async ({ page }) => {
  test.skip(!AUDIO_CONTROLS_ENABLED, "sound controls are hidden (AUDIO_CONTROLS_ENABLED)");
  await seedSession(page);
  await page.goto("/lessons");
  await page.getByRole("button", { name: "เปิดเมนู" }).click();
  await page.getByRole("button", { name: "ปิดเพลงประกอบ" }).click();
  await expect.poll(async () => (await debugState(page))?.settings).toMatchObject({ bgmMuted: true, sfxMuted: false });
  await page.getByRole("button", { name: "ปิดเสียงเอฟเฟกต์" }).click();
  await expect.poll(async () => (await debugState(page))?.settings).toMatchObject({ bgmMuted: true, sfxMuted: true });
});
