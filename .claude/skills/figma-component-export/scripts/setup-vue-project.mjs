#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const targetArg = process.argv[2] || '.';
const target = path.resolve(process.cwd(), targetArg);
const force = process.argv.includes('--force');

const files = new Map([
  ['package.json', JSON.stringify({
    private: true,
    type: 'module',
    scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
    dependencies: { '@vitejs/plugin-vue': 'latest', vite: 'latest', vue: 'latest' },
    devDependencies: { playwright: 'latest' }
  }, null, 2) + '\n'],
  ['index.html', `<div id="app"></div>\n<script type="module" src="/src/main.js"></script>\n`],
  ['vite.config.js', `import { defineConfig } from 'vite';\nimport vue from '@vitejs/plugin-vue';\n\nexport default defineConfig({\n  plugins: [vue()]\n});\n`],
  ['src/main.js', `import { createApp } from 'vue';\nimport App from './App.vue';\n\ncreateApp(App).mount('#app');\n`],
  ['src/App.vue', `<template>\n  <main class="figma-export-page">\n    <section class="export-workbench" aria-label="Figma export preview">\n      <div class="export-stage">\n        <p class="export-placeholder">figma-export setup ready</p>\n      </div>\n    </section>\n  </main>\n</template>\n\n<style scoped>\n:global(*) { box-sizing: border-box; }\n:global(body) { margin: 0; font-family: Inter, Arial, sans-serif; background: #15191f; color: #f7f8fb; }\n.figma-export-page { min-height: 100vh; display: grid; place-items: center; padding: 24px; }\n.export-workbench { width: min(100%, 960px); min-height: 540px; display: grid; place-items: center; overflow: auto; }\n.export-stage { width: 420px; min-height: 320px; display: grid; place-items: center; background: #242a33; border: 1px solid rgba(255,255,255,.14); }\n.export-placeholder { margin: 0; color: #cfd7e3; font-size: 14px; }\n</style>\n`],
  ['PLANNING.md', `# Planning\n\n## Export Rules\n\n- Work one phase at a time.\n- Use raw Figma values only.\n- Use HTML/CSS for UI primitives, SVG for icons/vectors, and local image assets only for image fills.\n- Preview every phase through index.html -> src/App.vue.\n- A phase is done only after build, browser verification, screenshot, and doc sync.\n\n## Phases\n\n- [ ] Phase 1: Define first Figma component/node and acceptance checks.\n`],
  ['PROGRESS.md', `# Progress\n\nAppend each phase with date, source node ids, raw values, implementation files, verification command, screenshot path, and status.\n`],
  ['FIGMA.md', `# Figma Raw Inventory\n\nRecord source file keys, node ids, raw properties, vector paths, image hashes, screenshots used only for confirmation, and omitted hidden effects.\n`],
  ['COMPONENTS.md', `# Components\n\nMap each Figma component/state/icon/asset to code files, CSS/SVG/PNG policy, props, dimensions, and verification status.\n`],
  ['EXPORT.md', `# Export Handoff\n\nTrack demo export status, production integration notes, DOM contracts, and verification evidence.\n`],
  ['.gitignore', `node_modules/\ndist/\n.env\n.env.*\n*.local\n/tmp/\n`]
]);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(rel, body) {
  const abs = path.join(target, rel);
  ensureDir(path.dirname(abs));
  if (fs.existsSync(abs) && !force) {
    return { rel, status: 'exists' };
  }
  fs.writeFileSync(abs, body);
  return { rel, status: fs.existsSync(abs) ? 'written' : 'failed' };
}

ensureDir(target);
ensureDir(path.join(target, 'src/components'));
ensureDir(path.join(target, 'src/assets'));

const results = [];
for (const [rel, body] of files.entries()) {
  results.push(writeFile(rel, body));
}

console.log(JSON.stringify({ target, force, results }, null, 2));
