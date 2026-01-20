import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["backend/src/**/*.test.ts"],
    exclude: ["examples/**", "backend/legacy/**"],
  },
});
