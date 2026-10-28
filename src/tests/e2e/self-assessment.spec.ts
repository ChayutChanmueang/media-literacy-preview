import { test, expect, type Browser, type Page, type BrowserContext, type Route } from "@playwright/test";

// Research-mode pre/post self-assessment (US-DATA-03 Task-19, docs/software/10-research-pre-post-backend.md 9.5).
// Needs a server started with APP_MODE=research, e.g.
//   npm run build && APP_MODE=research npx next start -p 3100
//   E2E_BASE_URL=http://localhost:3100 npx playwright test self-assessment
// Every /api call is mocked, so no test DB is needed.

type SubmissionBody = {
  submission_uuid: string;
  phase: string;
  answers: Record<string, number>;
  item_order: string[];
  is_dev_skip: boolean;
};

// Reads the mode label on the landing page in a throwaway context: the landing page creates an unconsented
// session in localStorage, which would win over the session cookie the tests seed.
async function isResearchMode(browser: Browser) {
  const context = await browser.newContext({ baseURL: test.info().project.use.baseURL });
  try {
    const page = await context.newPage();
    await page.goto("/");
    const mode = page.getByText(/\((research|normal)\)/);
    await expect(mode).toBeVisible();
    return (await mode.textContent())?.includes("research") ?? false;
  } finally {
    await context.close();
  }
}

/** Skips onboarding: a consented session cookie, as /consent/location would leave it. */
async function addSession(context: BrowserContext, extra: Record<string, unknown> = {}) {
  const session = {
    sessionId: crypto.randomUUID(),
    ageGroup: "61-69",
    consentGiven: true,
    location: { province: "เชียงใหม่", district: "เมืองเชียงใหม่", subdistrict: "ศรีภูมิ", source: "manual" },
    createdAt: new Date().toISOString(),
    ...extra,
  };
  await context.addCookies([
    { name: "naplab_ml_session", value: encodeURIComponent(JSON.stringify(session)), url: test.info().project.use.baseURL! },
  ]);
}

/** Mocks every API; POST /api/self-assessment goes to `onSubmit` (default: saved, 201). */
async function mockApi(page: Page, onSubmit?: (route: Route, body: SubmissionBody) => Promise<void>) {
  const submissions: SubmissionBody[] = [];
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    if (request.url().includes("/api/self-assessment") && request.method() === "POST") {
      const body = request.postDataJSON() as SubmissionBody;
      if (onSubmit) return onSubmit(route, body);
      submissions.push(body);
      return route.fulfill({
        status: 201,
        json: { submission: { submission_uuid: body.submission_uuid, phase: body.phase, received_at: new Date().toISOString() } },
      });
    }
    if (request.url().includes("/api/self-assessment")) return route.fulfill({ json: { status: { pre: false, post: false } } });
    return route.fulfill({ json: {} });
  });
  return submissions;
}

/** Answers every statement with 4 and returns the item ids in on-screen order. */
async function answerAll(page: Page) {
  const groups = page.getByRole("radiogroup");
  await expect(groups).toHaveCount(12);
  const order = await groups.evaluateAll((els) => els.map((el) => el.getAttribute("aria-labelledby")!.replace(/-text$/, "")));
  for (let i = 0; i < order.length; i++) await groups.nth(i).getByRole("radio", { name: /^4 / }).click();
  return order;
}

test.describe("Research pre/post self-assessment", () => {
  test.beforeEach(async ({ browser }) => {
    test.skip(!(await isResearchMode(browser)), "needs a server with APP_MODE=research");
  });

  test("submit posts answers keyed by item id with the on-screen order", async ({ page, context }) => {
    await addSession(context);
    const submissions = await mockApi(page);
    await page.goto("/self-assessment/pre/questions");
    const order = await answerAll(page);

    const request = page.waitForRequest((r) => r.url().includes("/api/self-assessment") && r.method() === "POST");
    await page.getByRole("button", { name: "ต่อไป" }).click();
    const body = (await request).postDataJSON() as SubmissionBody;

    expect(body.phase).toBe("pre");
    expect(Object.keys(body.answers).sort()).toEqual([...order].sort());
    expect(Object.keys(body.answers).every((id) => /^sa-\d{2}$/.test(id))).toBe(true);
    expect(Object.values(body.answers).every((v) => v === 4)).toBe(true);
    expect(body.item_order).toEqual(order);
    expect(body.is_dev_skip).toBe(false);
    await expect(page).toHaveURL(/\/self-assessment\/pre\/complete$/);
    await expect.poll(() => submissions.length).toBe(1);
  });

  test("offline submit moves on, then sends once the network is back", async ({ page, context }) => {
    await addSession(context);
    const submissions = await mockApi(page);
    await page.goto("/self-assessment/pre/questions");
    await answerAll(page); // the questions page prefetches the complete page meanwhile
    await page.waitForLoadState("networkidle");

    await context.setOffline(true);
    await page.getByRole("button", { name: "ต่อไป" }).click();
    await expect(page).toHaveURL(/\/self-assessment\/pre\/complete$/);
    const pending = await page.evaluate(() => JSON.parse(localStorage.getItem("naplab_ml_sa_pending") ?? "[]").length);
    expect(pending).toBe(1);
    expect(submissions).toHaveLength(0);

    await context.setOffline(false);
    await expect.poll(() => submissions.length).toBeGreaterThan(0);
    // Next.js reloads the page once back online (it retries the request that failed offline), so a read may
    // land mid-reload; retry until it doesn't.
    await expect
      .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("naplab_ml_sa_pending") ?? "[]").length).catch(() => -1))
      .toBe(0);
    // The reload can cut off the response before the queue drops the item, so the next sync resends it —
    // fine, the server dedupes by submission_uuid. What matters is one submission, never a new one.
    expect(new Set(submissions.map((s) => s.submission_uuid)).size).toBe(1);
  });

  test("pre-test can be done once: reopening it goes to the lessons", async ({ page, context }) => {
    await addSession(context);
    await mockApi(page);
    await page.goto("/self-assessment/pre/questions");
    await answerAll(page);
    await page.getByRole("button", { name: "ต่อไป" }).click();
    await expect(page).toHaveURL(/\/self-assessment\/pre\/complete$/);

    for (const path of ["/self-assessment/pre", "/self-assessment/pre/questions"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/lessons/);
      await expect(page.getByRole("radiogroup")).toHaveCount(0);
    }
  });

  test("post-test can be done once: reopening it goes to the course end", async ({ page, context }) => {
    await addSession(context);
    await mockApi(page);
    await page.goto("/self-assessment/post/questions");
    await answerAll(page);
    await page.getByRole("button", { name: "ต่อไป" }).click();
    await expect(page).toHaveURL(/\/self-assessment\/post\/complete$/);

    await page.goto("/self-assessment/post");
    await expect(page).toHaveURL(/\/lessons\/complete$/);
    await expect(page.getByText("แบบทดสอบหลังเรียน", { exact: true })).toHaveCount(0);
  });

  test("a submission still queued counts as done, and the failed send stays queued", async ({ page, context }) => {
    await addSession(context);
    await mockApi(page, (route) => route.fulfill({ status: 500, json: { error: "db down" } }));
    await page.goto("/self-assessment/pre/questions");
    await answerAll(page);
    await page.getByRole("button", { name: "ต่อไป" }).click();
    await expect(page).toHaveURL(/\/self-assessment\/pre\/complete$/);

    // Progress cleared (e.g. storage wiped) but the queue cookie survives → still counts as done.
    await page.evaluate(() => {
      localStorage.removeItem("naplab_ml_progress");
      document.cookie = "naplab_ml_progress=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    });
    await page.goto("/self-assessment/pre");
    await expect(page).toHaveURL(/\/lessons/);
    const pending = await page.evaluate(() => JSON.parse(localStorage.getItem("naplab_ml_sa_pending") ?? "[]").length);
    expect(pending).toBe(1);
  });

  test("menu has no reset button", async ({ page, context }) => {
    await addSession(context);
    await mockApi(page);
    await page.goto("/self-assessment/pre");
    await page.getByRole("button", { name: "เปิดเมนู" }).click();
    await expect(page.getByRole("button", { name: "ไปหน้าแรก" })).toBeVisible();
    await expect(page.getByRole("button", { name: "รีเซ็ตข้อมูล" })).toHaveCount(0);
  });

  test("a stale isTestingGroup session never reaches the old multiple-choice tests", async ({ page, context }) => {
    await addSession(context, { isTestingGroup: true });
    await mockApi(page);

    await page.goto("/lessons");
    await expect(page).not.toHaveURL(/\/pretest/);

    await page.goto("/pretest");
    await expect(page).toHaveURL(/\/self-assessment\/pre$/);

    await page.goto("/posttest");
    await expect(page).not.toHaveURL(/\/posttest/);
  });
});
