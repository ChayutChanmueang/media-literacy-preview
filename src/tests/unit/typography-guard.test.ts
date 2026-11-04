// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "fs";
import path from "path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

/**
 * Guard for docs/wiki/design/07-typography.md: text in pages and components is set only with the
 * style utilities (text-<style> / gp-type-<style>). Fails on hand-set sizes, inline fontSize, a
 * weight class next to a style class, and Mali outside StagePopup. Anything inside an element with
 * data-type-exempt (or under one) is skipped — the file is parsed, so exemption follows the JSX tree.
 */

const SRC = path.resolve(__dirname, "../..");
const ROOTS = ["app", "components"];

// Out of scope (docs/implementation_plan/typography-implementation-plan.md, section 0): dev tools,
// the facilitator projector view, components no page uses, dev-hub prototypes, and G14 (still legacy).
const OUT_OF_SCOPE = [
  "app/dev/",
  "app/facilitator/",
  "app/api/",
  "components/LandingScreen.jsx",
  "components/LessonSelector.jsx",
  "components/CertificateScreen.jsx",
  "components/VideoScreen.jsx",
  "components/RewardScreen.jsx",
  "components/ConsentScreen.jsx",
  "components/G12ChuzzleStop.tsx",
  "components/G14GooslMarbles.tsx",
  "components/GP1PromptBuilder.tsx",
  "components/GP2PromptBuilder.tsx",
  "components/GP5RealOrFakeVideo.tsx",
];

const STYLES = "display|h1|h2|h3|body-lg|body|button|caption|small";
const HAND_SET_SIZE = [
  /(?<![\w-])text-\[(?:clamp|max|min|calc)\(/,
  /(?<![\w-])text-\[[\d.]+(?:px|rem|em)\]/,
  /(?<![\w-])text-(?:xs|sm|base|lg|xl|[2-9]xl)(?![\w-])/,
  /(?<![\w-])gp-text-\d/,
];
const STYLE_CLASS = new RegExp(`(?<![\\w-])(?:gp-type|text)-(?:${STYLES})(?![\\w-])`);
const WEIGHT_CLASS = /(?<![\w-:])font-(?:thin|light|normal|medium|semibold|bold|extrabold|black)(?![\w-])/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(tsx|jsx|ts)$/.test(name) ? [full] : [];
  });
}

const rel = (file: string) => path.relative(SRC, file).split(path.sep).join("/");

function isExemptElement(attributes: ts.JsxAttributes) {
  return attributes.properties.some(
    (p) => ts.isJsxAttribute(p) && p.name.getText() === "data-type-exempt",
  );
}

function check(file: string): string[] {
  const text = readFileSync(file, "utf8");
  const kind = file.endsWith(".jsx") ? ts.ScriptKind.JSX : file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  const problems: string[] = [];
  const report = (node: ts.Node, what: string) => {
    const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
    problems.push(`${rel(file)}:${line + 1} ${what}: ${node.getText(sf).slice(0, 100)}`);
  };

  const visit = (node: ts.Node, exempt: boolean) => {
    if (ts.isJsxElement(node)) exempt ||= isExemptElement(node.openingElement.attributes);
    if (ts.isJsxSelfClosingElement(node)) exempt ||= isExemptElement(node.attributes);

    if (!exempt) {
      if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateLiteralToken(node)) {
        const value = node.text;
        if (HAND_SET_SIZE.some((re) => re.test(value))) report(node, "hand-set text size");
        if (STYLE_CLASS.test(value) && WEIGHT_CLASS.test(value)) report(node, "weight class next to a text style");
      }
      if (ts.isPropertyAssignment(node) && node.name.getText(sf) === "fontSize") report(node, "inline fontSize");
    }
    ts.forEachChild(node, (child) => visit(child, exempt));
  };
  visit(sf, false);
  return problems;
}

const files = ROOTS.flatMap((root) => sourceFiles(path.join(SRC, root)));

describe("typography guard", () => {
  it("pages and components set text only with the style utilities", () => {
    const inScope = files.filter((f) => !OUT_OF_SCOPE.some((p) => rel(f).startsWith(p)));
    expect(inScope.length).toBeGreaterThan(50);
    expect(inScope.flatMap(check)).toEqual([]);
  });

  it("Mali is imported only by StagePopup", () => {
    const importers = files.filter((f) =>
      /import\s*\{[^}]*\bmali\b[^}]*\}\s*from\s*["']@\/lib\/fonts["']/.test(readFileSync(f, "utf8")),
    );
    expect(importers.map(rel)).toEqual(["components/StagePopup.tsx"]);
  });
});
