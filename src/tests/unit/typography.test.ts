// @vitest-environment node
import { readFileSync } from "fs";
import path from "path";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { beforeAll, describe, expect, it } from "vitest";

// The Figma text styles (docs/wiki/design/07-typography.md): size / line height / weight
const STYLES = {
  display: [40, 48, 700],
  h1: [32, 40, 700],
  h2: [28, 36, 700],
  h3: [24, 32, 600],
  "body-lg": [22, 32, 400],
  body: [20, 30, 400],
  button: [20, 30, 600],
  caption: [18, 26, 400],
  small: [12, 16, 400],
} as const;

const GLOBALS = path.resolve(__dirname, "../../app/globals.css");

/** Compile globals.css with only the given classes as content, like the app build does */
async function compile(classes: string[]) {
  const css = readFileSync(GLOBALS, "utf8").replace(
    '@import "tailwindcss";',
    `@import "tailwindcss" source(none);\n@source inline("${classes.join(" ")}");`,
  );
  const result = await postcss([tailwind({ base: path.dirname(GLOBALS) })]).process(css, { from: GLOBALS });
  return result.css;
}

function rule(css: string, selector: string) {
  const match = css.match(new RegExp(`\\${selector}\\s*\\{([^}]*)\\}`));
  if (!match) throw new Error(`no rule for ${selector}`);
  return match[1];
}

describe("text style utilities", () => {
  let css = "";
  beforeAll(async () => {
    const names = Object.keys(STYLES);
    css = await compile([...names.map((n) => `text-${n}`), ...names.map((n) => `gp-type-${n}`)]);
  }, 30_000);

  it.each(Object.entries(STYLES))("theme tokens for %s match Figma", (name, [size, lineHeight, weight]) => {
    expect(css).toContain(`--text-${name}: ${size}px;`);
    expect(css).toContain(`--text-${name}--line-height: ${lineHeight}px;`);
    expect(css).toContain(`--text-${name}--font-weight: ${weight};`);
  });

  it.each(Object.keys(STYLES))("text-%s sets size, line height and weight together", (name) => {
    const body = rule(css, `.text-${name}`);
    expect(body).toContain(`font-size: var(--text-${name})`);
    expect(body).toContain(`var(--text-${name}--line-height)`);
    expect(body).toContain(`var(--text-${name}--font-weight)`);
  });

  it.each(Object.keys(STYLES))("gp-type-%s scales with --gp-t, floored at 18px", (name) => {
    const body = rule(css, `.gp-type-${name}`);
    expect(body).toContain(`font-size: min(var(--text-${name}), max(18px, calc(var(--text-${name}) * var(--gp-t, 1))))`);
    expect(body).toContain(`line-height: calc(var(--text-${name}--line-height) * var(--gp-t, 1))`);
    expect(body).toContain(`font-weight: var(--text-${name}--font-weight)`);
  });

  it("puts Noto Looped Thai behind both base font stacks", () => {
    expect(css).toMatch(/--font-sans: var\(--font-noto-looped\)/);
    expect(css).toMatch(/--font-content: var\(--font-noto-looped\)/);
  });
});
