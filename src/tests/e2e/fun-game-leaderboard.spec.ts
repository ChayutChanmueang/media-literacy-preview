import { expect, test } from "@playwright/test";

const viewports = [
  { width: 320, height: 535 },
  { width: 360, height: 740 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 667, height: 375 },
  { width: 1280, height: 800 },
];

for (const viewport of viewports) {
  test(`fun-game leaderboard button fits at ${viewport.width}×${viewport.height}`, async ({ page, context, baseURL }) => {
    await page.setViewportSize(viewport);
    await context.addCookies([
      {
        name: "naplab_ml_session",
        value: encodeURIComponent(JSON.stringify({
          sessionId: "e2e-fun-leaderboard",
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
    await page.goto("/lessons");
    await page.getByRole("button", { name: /อิสระ เลือกหัวข้อ/ }).click();
    await page.getByRole("button", { name: "เกมสนุก", exact: true }).click();

    const button = page.getByRole("button", { name: "กระดานคะแนน" });
    const game = page.getByRole("button", { name: "ต่อไอติมฝึกสมอง" });
    const title = page.getByText("เกมสนุก", { exact: true });
    const rootInnerRight = await page.locator("#root-container").evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const borderRight = parseFloat(getComputedStyle(el).borderRightWidth) || 0;
      return rect.right - borderRight;
    });
    const [buttonBox, gameBox, titleBox] = await Promise.all([
      button.boundingBox(), game.boundingBox(), title.boundingBox(),
    ]);
    expect(buttonBox).not.toBeNull();
    expect(gameBox).not.toBeNull();
    expect(titleBox).not.toBeNull();
    expect(buttonBox!.width).toBeGreaterThanOrEqual(48);
    // 36px yellow face + 8px drop shadow (Press3D) — sized on request, below the 48px target used elsewhere
    expect(buttonBox!.height).toBeGreaterThanOrEqual(44);
    expect(buttonBox!.x + buttonBox!.width).toBeCloseTo(gameBox!.x + gameBox!.width, 0);
    const leftGap = buttonBox!.x - (titleBox!.x + titleBox!.width);
    const rightGap = rootInnerRight - (buttonBox!.x + buttonBox!.width);
    expect(leftGap).toBeCloseTo(rightGap, 0);

    await button.click();
    const picker = page.getByRole("dialog", { name: "เลือกเกมเพื่อดูกระดานคะแนน" });
    await expect(picker).toBeVisible();
    await expect(picker.getByRole("button", { name: "ต่อไอติมฝึกสมอง" })).toBeVisible();
    await picker.getByRole("button", { name: "ปิด" }).click();
    await expect(picker).toBeHidden();
    await button.click();
    await picker.getByRole("button", { name: "ต่อไอติมฝึกสมอง" }).click();
    // the board opens as LeaderboardPopup over the fun-game page (no navigation); the ✕ ("ปิด") closes it
    const board = page.getByRole("dialog", { name: "กระดานคะแนน" });
    await expect(board).toBeVisible();
    await expect(page).toHaveURL(/\/lessons$/);
    await expect(page.getByRole("button", { name: "ปิด", exact: true })).toHaveCount(1); // no bottom button
    // centred on the screen once its rise-in animation has settled
    await page.waitForTimeout(600);
    const boardBox = await board.boundingBox();
    expect(boardBox).not.toBeNull();
    const viewportHeight = page.viewportSize()!.height;
    const pageHeight = Math.max(viewportHeight, 480); // the popup column is 480px tall at least
    expect(boardBox!.y).toBeCloseTo(pageHeight - (boardBox!.y + boardBox!.height), 0);
    await board.getByRole("button", { name: "ปิด", exact: true }).click();
    await expect(board).toBeHidden();
    await expect(button).toBeVisible();
  });
}
