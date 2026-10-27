import { test, expect, type Page } from "@playwright/test";
import { stageScale } from "../../lib/gameViewport";

/**
 * Fun games (G13, G18–G20K) at real phone sizes from the field logs (docs/analytics, see
 * docs/implementation_plan/fun-game-viewport-scaling-plan.md) plus the iPhone 12 Pro reference:
 * the game shrinks by the expected factor, fits across the screen, and taps stay ≥ 48px.
 */

const VIEWPORTS = [
  { name: "reference iPhone 12 Pro", width: 390, height: 844 },
  { name: "iPhone in LINE", width: 390, height: 669 },
  { name: "median phone", width: 384, height: 666 },
  { name: "Android in LINE", width: 360, height: 612 },
  { name: "large display size", width: 320, height: 535 },
];

const GAMES = [
  { lessonId: "flow-g13", name: "G13" },
  { lessonId: "g18", name: "G18" },
  { lessonId: "g19", name: "G19" },
  { lessonId: "g20", name: "G20" },
  { lessonId: "g20k", name: "G20K" },
];

// a consented session (cookie for the server-side guard in proxy.ts, progressService syncs it to
// localStorage), so /lessons/[id]/game doesn't send us to /consent
async function seedSession(page: Page) {
  const session = {
    sessionId: "e2e-viewport",
    ageGroup: "60-69",
    consentGiven: true,
    location: { province: "เชียงใหม่", district: "", subdistrict: "", source: "manual" },
    deviceMetadata: {},
    createdAt: "2026-10-27T00:00:00.000Z",
  };
  await page.context().addCookies([
    {
      name: "naplab_ml_session",
      value: encodeURIComponent(JSON.stringify(session)),
      url: "http://localhost:3000",
    },
  ]);
}

for (const vp of VIEWPORTS) {
  test.describe(`fun games at ${vp.width}×${vp.height} (${vp.name})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const game of GAMES) {
      test(`${game.name} scales to the screen`, async ({ page }) => {
        await seedSession(page);
        await page.goto(`/lessons/${game.lessonId}/game`);
        await page.getByRole("button", { name: "กดเพื่อเริ่ม" }).click();

        const root = page.locator("[data-stage-scale]").first();
        await expect(root).toBeVisible();
        const box = await root.boundingBox();
        expect(box).not.toBeNull();

        // the factor the hook set matches the formula for the root it measured
        const scale = Number(await root.getAttribute("data-stage-scale"));
        expect(scale).toBeCloseTo(stageScale(box!.width, box!.height), 2);
        if (vp.width === 390 && vp.height === 844) expect(scale).toBe(1);
        else expect(scale).toBeLessThan(1);

        // nothing sticks out sideways
        const overflowX = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflowX).toBeLessThanOrEqual(0);

        // every visible button the player can tap is ≥ 48 × 48 (dev-only QA buttons excluded)
        const buttons = root.locator("button:visible:not([data-dev-only])");
        const count = await buttons.count();
        for (let i = 0; i < count; i += 1) {
          const b = await buttons.nth(i).boundingBox();
          if (!b) continue;
          expect.soft(Math.round(b.width), `button ${i} width`).toBeGreaterThanOrEqual(48);
          expect.soft(Math.round(b.height), `button ${i} height`).toBeGreaterThanOrEqual(48);
        }

        await page.screenshot({
          path: test.info().outputPath(`${game.name}-${vp.width}x${vp.height}.png`),
        });
      });
    }
  });
}
