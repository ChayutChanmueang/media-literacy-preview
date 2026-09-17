---
name: figma-component-export
description: Export Figma components into code with strict raw-value fidelity, phase gates, documentation sync, live demo previews, and shorthand commands. Use when the user asks to export, convert, port, or implement Figma components, icons, UI surfaces, leaderboard/gamehub assets, checkbox circles, buttons, panels, rows, or composed screens from Figma into the test-figma-export demo or a later production integration; also use when the user types figma-export help, figma-export setup, figma-export next, figma-export phase, figma-export verify, figma-export docs, or figma-export prod.
---

# Figma Component Export

## Core Rule

Export one phase at a time. Never batch several components, variants, icons, PNGs, or SVGs into one implementation phase. A shared implementation may serve several visual states, but each named Figma art/state still gets its own extraction, screenshot, documentation, and acceptance gate.

All visual values must come from raw Figma properties. Do not estimate, eyeball, infer from screenshots, or use a screenshot as a shortcut for a CSS/SVG surface.

## Command Shortcuts

Treat `figma-export ...` phrases as commands. Do not ask the user to restate the long rules. Read `references/commands.md` when a command is present, then execute the mapped workflow.

- `figma-export help`: show quick prompts and command meanings only; do not edit files.
- `figma-export setup [path]`: create or initialize a Vue + Vite demo export project with required docs, `src/App.vue`, `src/components/`, `src/assets/`, package scripts, and verification helpers. Prefer the current directory when no path is supplied. Use `scripts/setup-vue-project.mjs` when a project scaffold is needed.
- `figma-export next`: inspect docs and continue the next incomplete phase.
- `figma-export phase <name|node>`: export exactly that one component/state/icon/asset phase.
- `figma-export verify [selector]`: build, run/attach to dev server, and perform Playwright bounds/screenshot checks for the active preview.
- `figma-export docs`: synchronize `PROGRESS.md`, `FIGMA.md`, `COMPONENTS.md`, `PLANNING.md`, `EXPORT.md`, and phase docs without changing implementation unless docs expose a blocker.
- `figma-export prod`: port already verified demo values into the production integration path while preserving the production DOM contract.

## Before Work

1. Read the local project docs if they exist: `PLANNING.md`, `PROGRESS.md`, `FIGMA.md`, `COMPONENTS.md`, `EXPORT.md`, plus any phase-specific docs such as `BUTTON-STROKE-PLAN.md`, `PART8B-FINAL.md`, `PART9-VERIFICATION.md`, or `DOCUMENTATION-UPDATES.md`.
2. Identify whether this is the demo workspace or production integration:
   - Demo workspace: use Vue SFCs in `src/components/`, assets in `src/assets/`, preview through `src/App.vue` and root `index.html`.
   - Production integration: port already verified demo values into render-function modules and preserve the production DOM contract. Do not re-derive values unless a discrepancy is found.
3. Determine the next phase number from `PROGRESS.md`/`PLANNING.md`; append, do not rewrite history.
4. Name the exact Figma node/component id(s), expected children/assets, and CSS/SVG/PNG decision before editing source files.

## Required Figma Reads

Use the Figma skill/tools when available.

1. Prefer local raw dumps first when they cover the node (`figma-raw/part-*.json`).
2. Call `get_design_context` for the exact node/component.
3. Call `get_screenshot` for the exact single node/component; use it only as confirmation.
4. If raw values are missing, call `use_figma` with read-only Plugin API JavaScript to return the exact node properties.
5. For vectors/boolean shapes, read `vectorPaths` or use `node.exportAsync({ format: 'SVG' })`.
6. For image fills, export the actual image/node asset from Figma; store it locally immediately because MCP asset URLs are temporary.

Read and record for every visible layer: id, name, type, bbox/render bounds, relative placement, layout, opacity/blend/visibility/mask, fills, strokes, stroke weights/align/caps/joins, radii, effects, text styles, image hashes/transforms, and vector paths where relevant. Hidden Figma strokes/effects remain hidden in code and must be explicitly documented as omitted.

## Format Decisions

- Use HTML + CSS for UI surfaces made from rectangles, rounded rectangles, ellipses, lines, dots, cards, panels, progress bars, FAB/button containers, and other simple primitives.
- Use SVG for vector icons, boolean operations, pen/vector paths, and text/path effects CSS cannot represent faithfully.
- Use PNG/image only for Figma `IMAGE` fills or complex image artwork. Never screenshot a component to fake a CSS/SVG surface.
- Exclude live/dynamic text from decorative SVG assets when product text must remain HTML, such as leaderboard coin rank numbers.
- Preserve Figma spellings in documentation even if code filenames use a corrected alias, e.g. `Sliver-Coin` source to `silver-coin.svg`.

## Implementation Workflow

For each phase:

1. Inspect source and write raw values into `PROGRESS.md` before or alongside code edits.
2. Implement only the phase scope.
3. Render the live output in the demo page. In this repo, `index.html` mounts `src/App.vue`; the component must be visible there, not orphaned.
4. Run the build (`npm run build` in the demo repo; production may use `npm run build-nolog` if that is the established command).
5. Start a local dev server when browser rendering is required.
6. Use Playwright to measure component bounds and capture a screenshot. Compare against raw Figma bbox/render bounds, not by eye.
7. Update `PROGRESS.md` status only after build and browser verification pass.
8. Sync all relevant docs (`COMPONENTS.md`, `PLANNING.md`, `FIGMA.md`, `EXPORT.md`, `PROGRESS.md`, and phase docs) before finishing.
9. Run `git diff --check`.

If Playwright/Chromium fails because of sandbox restrictions, rerun the same important verification with approval/escalation rather than skipping browser proof.

## Demo Page Rules

Build the actual review surface as the first visible content in `index.html`/`App.vue`. For isolated components, use a neutral/checkerboard/dark stage that makes strokes, transparency, and shadows inspectable. For full compositions, render the design at its native Figma size inside a stable scaled viewport (for example, `1080 x 1920` rendered at 50% inside `540 x 960`).

Use fixed dimensions and `flex: 0 0 auto` or equivalent where needed so the workbench does not shrink large Figma-authored components. Verify text does not overlap or clip; if dynamic production text needs robustness, document any deviation from exact Figma boxes.

## Production Integration Rules

Production integration is separate from demo export unless the user explicitly asks for it. When integrating:

- Port verified demo values; do not re-derive from screenshots.
- Preserve or deliberately re-point DOM hooks such as scroll areas, FAB actions, profile buttons, node actions, day selectors, progress hooks, and current/completed node selectors.
- Keep application state, routing, DB, audio, Phaser scenes, and pure normalization/history logic unchanged unless the phase explicitly requires it.
- Use render-function modules when the production screen is rendered by `root.innerHTML`; do not mount Vue islands into wholesale re-rendered DOM.

## References

Read these when needed:

- `references/commands.md` for `figma-export ...` command behavior, setup scaffold rules, and quick prompts.
- `references/workflow.md` for the complete phase gate, raw-value mapping, documentation sync, and production/demo distinction.
- `references/demo-preview.md` for demo page, Playwright, transparency, and composition checks.
- `references/figma-inspection.md` for reusable read-only Plugin API snippets and property checklist.
- `references/cases.md` for concrete lessons from GameHub, panels, leaderboard, checkbox circles, and common corrections.

Use scripts as templates, not as blind commands:

- `scripts/setup-vue-project.mjs` scaffolds a Vue + Vite export demo project and required documentation placeholders for `figma-export setup`.
- `scripts/inspect-node.js` contains read-only Figma Plugin API code to paste into `use_figma`.
- `scripts/playwright-bounds.mjs` is a configurable browser bounds/screenshot audit helper.
