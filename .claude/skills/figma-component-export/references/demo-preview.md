# Demo Preview and Verification

## Index Preview

In the demo repo, the browser entry is `index.html` -> `src/main.js` -> `src/App.vue`. Every exported component must appear in `App.vue` during its phase. Do not leave a component file orphaned and call it done.

Use review stages that make the artifact inspectable:

- dark or neutral gray background for white/mint/green UI;
- checkerboard for transparent PNGs;
- horizontally scrollable rows or scaled wrappers for large 1080px components;
- captions with phase/name/node id are useful in demo workbenches, but avoid adding explanatory product text inside the component itself.

For full screen previews, render the real component at native size and scale the containing viewport. Example pattern: `1080 x 1920` design inside a `540 x 960` viewport with child transform `scale(0.5)`.

## Layout Pitfalls

- Add `flex: 0 0 auto` or equivalent for fixed Figma components in flex rows; otherwise browser layout may shrink them.
- Define stable width/height/aspect ratio for boards, panels, icon slots, and buttons.
- Ensure text fits; document intentional deviations such as wider number glyph boxes for two-digit values.
- Do not put UI cards inside other cards unless the Figma component itself requires it.

## Browser Verification

Run the build, then run the local dev server and use Playwright to inspect:

- element count;
- root bbox and important child bbox;
- computed colors, radii, shadows, overflow, font styles when useful;
- image natural/rendered dimensions and alpha/transparency where relevant;
- absence of console/page errors except harmless Vite debug connect logs;
- screenshot path under `/tmp`.

If Chromium fails from sandbox restrictions, request approval to rerun that Playwright command outside the sandbox. Do not mark visual phases complete on build alone.

## Asset Verification

For PNG assets, verify exact rendered dimensions and alpha. Transparent artwork must have an alpha channel and non-opaque pixels when expected.

For SVG assets that should not include dynamic text, statically inspect the SVG for `<text>` or embedded glyph paths representing the excluded text, and verify rank/text is rendered live in HTML.

Never keep temporary Figma MCP asset URLs in source code. Download/export to stable local files immediately.
