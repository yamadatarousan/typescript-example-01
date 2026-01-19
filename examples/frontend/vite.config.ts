import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ローカル開発用のVite設定
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
