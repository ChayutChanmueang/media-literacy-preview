import { expect, test } from "@playwright/test";

/**
 * Fun-game game-over flow, same for every leaderboard game as for G13 (ice cream): the game-over popup over
 * the frozen game (GameResultPopup) → "จบเกม" → "ต้องการเก็บคะแนนหรือไม่?" → "ใช่" → name entry popup →
 * leaderboard popup, all over the game page (no navigation until "กดเพื่อเสร็จสิ้น").
 * Played through on G18: the dev-only "จบรอบ" button clears the 3 practice levels, then the first pad is
 * tapped on every turn until it is the wrong one (one wrong tap ends the run).
 */
test("G18 game over uses the popup flow", async ({ page, context, baseURL }) => {
  test.setTimeout(120_000);
  await context.addCookies([
    {
      name: "naplab_ml_session",
      value: encodeURIComponent(JSON.stringify({
        sessionId: "e2e-fun-game-over",
        ageGroup: "60-69",
        consentGiven: true,
        location: { province: "", district: "", subdistrict: "", source: "manual" },
        deviceMetadata: {},
        createdAt: "2026-01-01T00:00:00.000Z",
      })),
      url: baseURL!,
    },
    { name: "naplab_ml_dev_app_mode", value: "normal", url: baseURL! },
  ]);
  await page.route("**/api/action-logs", (route) => route.fulfill({ status: 200, json: {} }));
  await page.goto("/lessons/g18/game");
  await page.getByRole("button", { name: "กดเพื่อเริ่ม" }).click();

  // practice levels: skip each once it's the player's turn
  for (let i = 0; i < 3; i += 1) {
    await expect(page.getByRole("status").filter({ hasText: "กดปุ่มสีตามที่เห็น" })).toBeVisible({ timeout: 15_000 });
    await page.locator('[data-dev-only="g18-skip-level"]').click();
  }

  // real run: tap the first pad every turn until a wrong tap ends the run
  const resultPopup = page.getByRole("dialog").filter({ hasText: "เล่นอีกครั้ง" });
  const firstPad = page.getByRole("button", { name: /^ปุ่มสี/ }).first();
  const yourTurn = page.getByRole("status").filter({ hasText: "กดปุ่มสีตามที่เห็น" });
  for (let turn = 0; turn < 40 && !(await resultPopup.isVisible()); turn += 1) {
    await expect(yourTurn.or(resultPopup)).toBeVisible({ timeout: 20_000 });
    if (await resultPopup.isVisible()) break;
    await firstPad.click();
    // the turn is over once the pill leaves "your turn" (next level's lights, or the wrong-pad pause)
    await expect(yourTurn).toBeHidden({ timeout: 10_000 }).catch(() => undefined);
  }

  // game-over popup over the frozen board (the board is still on the page underneath)
  await expect(resultPopup).toBeVisible({ timeout: 10_000 });
  await expect(firstPad).toBeAttached();
  await expect(page).toHaveURL(/\/lessons\/g18\/game$/);
  await resultPopup.getByRole("button", { name: "จบเกม" }).click();

  await page.getByRole("button", { name: "ใช่" }).click();
  const name = page.getByPlaceholder("กรอกชื่อของคุณ");
  await expect(name).toBeVisible();
  await name.fill("ทดสอบ");
  await page.getByRole("button", { name: "ยืนยัน" }).click();

  const board = page.getByRole("dialog", { name: "กระดานคะแนน" });
  await expect(board).toBeVisible();
  await expect(board).toContainText("ทดสอบ");
  await expect(page).toHaveURL(/\/lessons\/g18\/game$/);
  await page.getByRole("button", { name: "กดเพื่อเสร็จสิ้น" }).click();
  await expect(page).not.toHaveURL(/\/lessons\/g18\/game$/);
});
