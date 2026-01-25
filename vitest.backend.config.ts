//  Vitest はデフォルトだと プロジェクト全体の **/*.{test,spec}.* を収集する仕様で、
//  vitest run backend/src/server.test.ts でも “全体収集 → その後に絞り込み” になるため、
//  結果として examples/** も拾われて同時に走ってた。
//  だから vitest.backend.config.ts で examples/** を exclude して、
//  収集段階から外した。
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["backend/src/**/*.test.ts"],
    exclude: ["examples/**", "backend/legacy/**"],
    coverage: {
      provider: "v8",
      include: ["backend/src/**"],
      exclude: [
        "**/*.test.ts",
        "**/legacy/**",
        "**/examples/**",
        "**/frontend/**",
      ],
    },
  },
});
