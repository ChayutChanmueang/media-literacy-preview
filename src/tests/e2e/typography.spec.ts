import { test, expect, type Page } from "@playwright/test";

/**
 * Typography guard in the browser (docs/wiki/design/07-typography.md): every visible text on the
 * entry pages and in every live game renders in Noto Sans Thai Looped at one of the style sizes.
 * Elements under data-type-exempt are skipped (emoji, big score numbers, mock-app chrome, the
 * Mali stage popup …). The phone is tall enough that nothing shrinks (no .gp-compact step, stage
 * scale 1), so sizes are the exact style sizes.
 */

const STYLE_SIZES = new Set(["40px", "32px", "28px", "24px", "22px", "20px", "18px", "12px"]);

// live games in the dev hub (G14 is still legacy — see 07-typography.md section 4)
const GAMES = ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10", "G11", "G13", "G15", "G16", "G17", "G18", "G19", "G20", "G20K"];

test.use({ viewport: { width: 390, height: 1200 } });

async function offStyleText(page: Page, scope: string) {
  return page.evaluate((selector) => {
    const root = document.querySelector(selector);
    if (!root) return [`no ${selector}`];
    const bad: string[] = [];
    for (const el of root.querySelectorAll("*")) {
      if (![...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim())) continue;
      if (el.closest("[data-type-exempt]") || el.closest("svg")) continue;
      const box = el.getBoundingClientRect();
      if (!box.width || !box.height) continue;
      const s = getComputedStyle(el);
      if (s.visibility === "hidden") continue;
      const family = s.fontFamily.split(",")[0].replace(/["']/g, "").trim();
      const text = el.textContent!.trim().replace(/\s+/g, " ").slice(0, 30);
      if (family !== "Noto Sans Thai Looped") bad.push(`${text} — font ${family}`);
      if (!(window as unknown as { __sizes: string[] }).__sizes.includes(s.fontSize)) bad.push(`${text} — ${s.fontSize}`);
    }
    return bad;
  }, scope);
}

async function exposeSizes(page: Page) {
  await page.addInitScript((sizes) => {
    (window as unknown as { __sizes: string[] }).__sizes = sizes;
  }, [...STYLE_SIZES]);
}

test.describe("text uses the style sizes and Noto", () => {
  for (const path of ["/", "/consent", "/consent/location"]) {
    test(`page ${path}`, async ({ page }) => {
      await exposeSizes(page);
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      expect(await offStyleText(page, "body")).toEqual([]);
    });
  }

  for (const id of GAMES) {
    test(`game ${id}`, async ({ page }) => {
      test.setTimeout(90_000);
      await exposeSizes(page);
      await page.goto("/dev/games");
      const card = page.getByRole("button", { name: new RegExp(`^${id} —`) });
      // the hub's cards can be clicked before hydration; retry until the game opens
      await expect(async () => {
        await card.click({ timeout: 2000 });
        await expect(card).toHaveCount(0, { timeout: 1000 });
      }).toPass({ timeout: 40_000 });
      const root = '[data-testid="dev-game-root"]';
      await page.locator(root).waitFor();
      await page.waitForTimeout(1500);
      expect(await offStyleText(page, root), "intro").toEqual([]);

      const start = page.locator(root).getByRole("button", { name: "กดเพื่อเริ่ม" });
      if (await start.isVisible()) {
        await start.click();
        await page.waitForTimeout(3000);
        await page.locator(root).waitFor();
        expect(await offStyleText(page, root), "playing").toEqual([]);
      }
    });
  }
});
