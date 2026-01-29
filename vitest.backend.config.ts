//  Vitest はデフォルトだと プロジェクト全体の **/*.{test,spec}.* を収集する仕様で、
//  vitest run backend/src/server.test.ts でも “全体収集 → その後に絞り込み” になるため、
//  backend 以外のテストも拾われないように include/exclude で制御する。
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["backend/src/**/*.test.ts"],
    exclude: ["backend/legacy/**"],
    coverage: {
      provider: "v8",
      include: ["backend/src/**"],
      exclude: [
        "**/*.test.ts",
        "**/legacy/**",
        "**/frontend/**",
      ],
    },
  },
});
