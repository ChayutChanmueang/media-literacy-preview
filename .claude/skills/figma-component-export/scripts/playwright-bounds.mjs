import { chromium } from 'playwright';

const url = process.argv[2] || 'http://127.0.0.1:5173/';
const selector = process.argv[3];
const screenshot = process.argv[4] || '/tmp/figma-component-export.png';

if (!selector) {
  console.error('Usage: node scripts/playwright-bounds.mjs <url> <selector> [screenshot]');
  process.exit(2);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 900, height: 700 }, deviceScaleFactor: 1 });
const logs = [];
page.on('console', m => logs.push({ type: m.type(), text: m.text() }));
page.on('pageerror', e => logs.push({ type: 'pageerror', text: e.message }));
await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
const target = page.locator(selector).first();
await target.waitFor({ state: 'visible', timeout: 15000 });
const data = await target.evaluate(el => {
  const r = el.getBoundingClientRect();
  const style = getComputedStyle(el);
  return {
    bounds: { x: +r.x.toFixed(3), y: +r.y.toFixed(3), width: +r.width.toFixed(3), height: +r.height.toFixed(3) },
    backgroundColor: style.backgroundColor,
    borderRadius: style.borderRadius,
    boxShadow: style.boxShadow,
    overflow: style.overflow,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight
  };
});
await page.screenshot({ path: screenshot, fullPage: true });
await browser.close();
console.log(JSON.stringify({ url, selector, data, logs, screenshot }, null, 2));
