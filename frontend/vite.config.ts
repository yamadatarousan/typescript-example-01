import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// ローカル開発用のVite設定
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
  },
});
