import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["examples/backend/src/**/*.test.ts"],
    exclude: ["examples/backend/legacy/**", "backend/**"],
  },
});
