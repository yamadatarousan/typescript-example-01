import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

afterEach(() => {
  // 各テストのDOMを片付けて、次のテストに影響しないようにする
  cleanup();
});
