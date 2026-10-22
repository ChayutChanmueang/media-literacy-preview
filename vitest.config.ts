import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    // src/tests/e2e is Playwright's (npm run test:e2e); Vitest can't run those specs.
    exclude: ["**/node_modules/**", "**/.next/**", "src/tests/e2e/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
