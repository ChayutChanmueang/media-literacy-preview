<template>
  <main class="figma-export-page">
    <section class="export-workbench" aria-label="Figma export preview">
      <div class="export-stage">
        <p class="export-placeholder">figma-export setup ready</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
:global(*) { box-sizing: border-box; }
:global(body) { margin: 0; font-family: Inter, Arial, sans-serif; background: #15191f; color: #f7f8fb; }
.figma-export-page { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
.export-workbench { width: min(100%, 960px); min-height: 540px; display: grid; place-items: center; overflow: auto; }
.export-stage { width: 420px; min-height: 320px; display: grid; place-items: center; background: #242a33; border: 1px solid rgba(255,255,255,.14); }
.export-placeholder { margin: 0; color: #cfd7e3; font-size: 14px; }
</style>
