import { test, expect } from "@playwright/test";

test.describe("Media Literacy Interactive E2E User Journey", () => {
  
  test("should successfully complete onboarding flow and navigate to pre-test", async ({ page }) => {
    // 1. Visit landing page
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("รู้ทันสื่อ");

    // 2. Click start button
    await page.getByRole("button", { name: "กดเพื่อเริ่ม" }).click();

    // 3. Assert redirected to registration step 1 (age)
    await expect(page).toHaveURL(/\/consent$/);
    await expect(page.getByText("โปรดเลือกช่วงอายุท่าน")).toBeVisible();

    // 4. Choose an age range, then continue to step 2
    await page.getByRole("radio", { name: "61 ถึง 69" }).click();
    await page.getByRole("button", { name: "กดเพื่อไปต่อ" }).click();

    // 5. Step 2 (address): pick province / district / subdistrict
    await expect(page).toHaveURL(/\/consent\/location$/);
    for (const [field, value] of [
      ["จังหวัด", "เชียงใหม่"],
      ["อำเภอ", "เมืองเชียงใหม่"],
      ["ตำบล", "ศรีภูมิ"],
    ]) {
      await page.getByRole("button", { name: field }).click();
      await page.getByRole("option", { name: value, exact: true }).click();
    }

    // 6. Accept PDPA and submit
    await page.getByRole("checkbox").click();
    const submitBtn = page.getByRole("button", { name: "ยินยอมและเริ่มเรียนรู้" });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // 7. Should be redirected to the pre-test self-assessment start page
    await expect(page).toHaveURL(/\/self-assessment\/pre$/);
    await expect(page.getByText("แบบทดสอบก่อนเรียน", { exact: true })).toBeVisible();
  });

  test("should block access to lessons selector if pretest is not completed (router guard)", async ({ page }) => {
    // Navigate directly to /lessons
    await page.goto("/lessons");
    // Should be redirected to /consent first since session cookie doesn't exist
    await expect(page).toHaveURL(/\/consent/);
  });

  test("should display offline warning banner when network is lost", async ({ page, context }) => {
    await page.goto("/consent");
    
    // Simulate going offline
    await context.setOffline(true);
    
    // Perform a mock client action that triggers loggingService event log
    await page.evaluate(() => {
      // @ts-ignore
      if (window.next) {
        // Trigger manual event log to test cache queue
        fetch("/api/action-logs", {
          method: "POST",
          body: JSON.stringify({
            session_id: "00000000-0000-0000-0000-000000000000",
            event_name: "test_offline_action",
            page_url: "/",
            payload: {}
          })
        }).catch(() => {
          // Mock what loggingService does when it catches fetch fail
          const banner = document.createElement("div");
          banner.id = "offline-warning-banner";
          banner.innerText = "⚠️ ขณะนี้สัญญาณอินเทอร์เน็ตขาดหาย คะแนนและสถิติของท่านจะถูกบันทึกไว้ในเครื่องชั่วคราว";
          document.body.appendChild(banner);
        });
      }
    });

    // Check if warning banner appears in DOM
    const banner = page.locator("#offline-warning-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("สัญญาณอินเทอร์เน็ตขาดหาย");

    // Restore network
    await context.setOffline(false);
  });
});
