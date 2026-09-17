# Export Case Notes

## GameHub Components

Named component wrappers define ownership. Do not infer ownership from repeated raw layer names such as `Group 1105`, `Rectangle 904`, or `Union` when a named component exists.

GameHub node surfaces are CSS ellipses. Check marks and arrows are SVG. Fry-food and avatar/trophy artwork may be image/SVG only because the raw Figma layer is image/vector artwork, not a simple surface.

Numbers with Figma inner shadows required SVG text filters; CSS pseudo-element drop shadows were wrong. Two-digit numbers needed a documented robustness deviation: a wider centered box while preserving vertical position.

## Panels and Buttons

Button and panel rounded rectangles are CSS. Hidden Figma strokes/effects must not render. White outside strokes should preserve natural bbox size, commonly with spread `box-shadow`.

A prior wrong attempt created production-style `src/ui/components/*.js` in the demo repo, used an eyeballed border/text shadow, and exported two buttons together. Correct behavior: Vue SFCs in `src/components/`, one phase per component, raw values first, screenshot/bounds verification.

## Leaderboard

`Top-1`, `Top-2`, `Top-3`, `Top-3-You`, and `Other-Rating` are five Figma art references for one shared row component. Do not create five row components. Do maintain five phase gates.

Coins are number-free SVG assets. Rank numbers are live HTML text with documented font, stroke, and shadow. Trophy and flowers are transparent PNGs with exact bounds and alpha checks. The full leaderboard composition is a separate final phase after all leaf phases pass.

## Checkbox Circles

`Check` is an SVG icon from `3305:445`/`3305:443` with path, round stroke, and drop shadow. `Check_Circle` and `Uncheck_Circle` are CSS circles from `3305:446` and `3305:447`. The checked state is a composition of the circle plus the check icon, using Figma canvas offset `(16,23)`.

## Production Part 8b

Production GameHub uses a fixed-width centered column. The 1080-authored stage is scaled with `zoom = shellWidth / 1080`, where shell width is the fixed column width, not the full viewport. Preserve scroll/profile/FAB/node hooks or re-point configurable selectors deliberately.
