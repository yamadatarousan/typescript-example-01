import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["examples/backend/src/**/*.test.ts"],
    exclude: ["examples/backend/legacy/**", "backend/**"],
    coverage: {
      provider: "v8",
      include: ["examples/backend/src/**"],
      exclude: [
        "**/*.test.ts",
        "**/legacy/**",
        "backend/**",
        "frontend/**",
      ],
    },
  },
});
