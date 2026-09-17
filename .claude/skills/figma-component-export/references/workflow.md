# Workflow Reference

## Phase Gate Contract

Each phase must name exactly one component, one named variant, one icon, one raster asset, or one tight component pair that cannot be reviewed independently. If a shared component serves multiple Figma arts, create one code component but keep separate phase gates for each visual state.

Before implementation, record:

- phase number and date;
- exact Figma file key and node ids;
- expected child layers/assets;
- source-of-truth location (`figma-raw`, `get_design_context`, `use_figma`, asset export);
- CSS/SVG/image decision;
- acceptance checks.

A phase is not done until the live demo renders it, build passes, browser bounds/screenshot exist, and docs are synchronized.

## Source Lookup Order

1. Use local `figma-raw/` when it covers the node and the values are not stale.
2. Use `get_design_context` for the exact node.
3. Use `get_screenshot` for visual confirmation only.
4. Use `use_figma` for missing master component values, vectors, raw plugin fields, image hashes/transforms, and stale discrepancies.
5. Use asset download/export for actual image binaries and SVG strings.

Do not use screenshot pixels as a substitute for missing raw values.

## Required Raw Properties

For every visible layer, collect id/name/type, bbox/render bounds, relative position, rotation, visibility, opacity, blend mode, mask state, layout mode/padding/gap/sizing when applicable, fills, strokes, stroke weight/align/cap/join, dash pattern, corner radii, effects, text font/style/weight/size/line height/letter spacing/alignment, image hash/scale/transform, and vector paths/exported SVG.

If a property is absent on that node type, omit it. If Figma returns `figma.mixed`, record `MIXED`.

## CSS/SVG Mapping

- Figma color channels are 0-1; convert to exact `rgb()`/`rgba()` values.
- Visible `DROP_SHADOW` maps to `box-shadow` for rectangular primitives or SVG/filter for non-rectangular shapes.
- Visible `INNER_SHADOW` maps to inset `box-shadow` only when it follows the shape; use SVG filters for text/path effects.
- `strokeAlign: OUTSIDE` on CSS boxes usually maps to spread `box-shadow` or outline while preserving natural bbox size.
- Hidden strokes/effects do not render. State this in docs.
- Gradients must use exact stops and transform-derived direction; do not choose a direction by appearance.
- Text metrics come from Figma. If production dynamic text would clip, document the deviation and constrain text deliberately.

## Documentation Sync

For this project, update every relevant document, not only the first file mentioned:

- `PROGRESS.md`: raw values, decisions, implementation files, verification, status.
- `FIGMA.md`: durable raw inventory and node/component values.
- `COMPONENTS.md`: Figma-to-code map and surface policy.
- `PLANNING.md`: next phase/order/acceptance gate.
- `EXPORT.md`: production or handoff status when relevant.
- Phase-specific docs such as `BUTTON-STROKE-PLAN.md`, `PART8B-FINAL.md`, `PART9-VERIFICATION.md`, `DOCUMENTATION-UPDATES.md` when the phase touches them.

Append new sections. Avoid rewriting completed historical records except to correct a documented error.

## Demo vs Production

Demo exports in `test figma export` use Vue SFCs in `src/components/`, stable local assets in `src/assets/`, and `src/App.vue` for `index.html` preview.

Production integration uses verified demo values, usually as vanilla render functions and CSS modules, while preserving DOM hooks and existing behavior. It is a separate task unless explicitly requested.
