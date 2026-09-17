# Command Shortcuts

Use this reference whenever the user types a short `figma-export ...` command. Commands are intent shorthands, not shell commands unless this reference says to run a bundled script.

## `figma-export help`

Reply with quick prompts the user can paste. Keep it short and do not edit files. Include these prompts:

- `figma-export setup` - scaffold a Vue + Vite export demo project and required docs in the current directory.
- `figma-export next` - read docs and continue the next incomplete phase.
- `figma-export phase <component or node id>` - export one named component/state/icon/asset phase only.
- `figma-export verify <selector>` - build and run Playwright bounds/screenshot verification.
- `figma-export docs` - synchronize the tracking docs after an export phase.
- `figma-export prod` - port verified demo output into the production integration target.

Also show the non-negotiables: one phase at a time, raw Figma values only, UI surfaces as HTML/CSS, icons/vectors as SVG, image fills as local assets, preview in `index.html`/`src/App.vue`, build plus browser verification before done.

## `figma-export setup [path]`

Initialize a demo workspace. If no path is supplied, use the current directory. If the directory is non-empty, inspect it first and preserve user files. Ask before overwriting any existing file unless the user explicitly requested replacement.

Recommended script:

```bash
node /home/kong/.codex/skills/figma-component-export/scripts/setup-vue-project.mjs [target-dir]
```

The setup must create or confirm:

- `package.json` with Vue/Vite scripts: `dev`, `build`, `preview`;
- `index.html` mounting `#app`;
- `vite.config.js` with `@vitejs/plugin-vue`;
- `src/main.js`;
- `src/App.vue` with an actual export workbench, not a landing page;
- `src/components/`;
- `src/assets/`;
- `PLANNING.md`, `PROGRESS.md`, `FIGMA.md`, `COMPONENTS.md`, `EXPORT.md`;
- optional `.gitignore` for `node_modules`, `dist`, env files, and local screenshots.

After setup, run `npm install` only when appropriate for the environment and permissions. Then run `npm run build` if dependencies are present. If dependencies are missing and network is restricted, report the exact next command instead of pretending verification passed.

## `figma-export next`

Read `PROGRESS.md` and `PLANNING.md` first. Choose the first incomplete phase. If phase status is unclear, inspect `COMPONENTS.md` and `FIGMA.md`. Announce the chosen phase with its node id(s), component name, asset policy, and acceptance checks before editing.

## `figma-export phase <component|node>`

Run the normal one-phase workflow for that target. If the target is a component with multiple named variants, export one variant per phase unless the variants are a tight pair that cannot be reviewed separately. For checkbox circles, use CSS for the circle UI and SVG only for the check icon/vector.

## `figma-export verify [selector]`

Build first. Start or reuse the local dev server. Use Playwright to capture bounds and screenshots for the selector. The bundled helper can be used after the server is running:

```bash
node /home/kong/.codex/skills/figma-component-export/scripts/playwright-bounds.mjs http://127.0.0.1:5173/ '.export-workbench' /tmp/figma-export-verify.png
```

Verification must mention root bbox, important child bbox, screenshot path, console/page errors, and any mismatch against raw Figma values.

## `figma-export docs`

Synchronize docs after inspecting implementation and verification evidence. Append current phase details rather than rewriting history. Required docs are `PROGRESS.md`, `FIGMA.md`, `COMPONENTS.md`, `PLANNING.md`, and `EXPORT.md`; include phase-specific docs when present.

## `figma-export prod`

Use only after demo output is verified. Port values from the demo code/docs into the production integration. Preserve existing app behavior, state, routing, DB calls, audio, Phaser scenes, and DOM hooks. Treat production verification as a new phase with its own browser proof.
