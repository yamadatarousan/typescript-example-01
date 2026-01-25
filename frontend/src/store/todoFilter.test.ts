import { describe, it, expect, beforeEach } from "vitest";
import { useTodoFilterStore } from "./todoFilter";

describe("Todoフィルタストア", () => {
  beforeEach(() => {
    // テスト前にフィルタ状態を初期値に戻す
    useTodoFilterStore.setState({ filter: "all" });
  });

  it("初期値はall", () => {
    // Assert: 初期フィルタがallであることを確認
    expect(useTodoFilterStore.getState().filter).toBe("all");
  });

  it("フィルタを更新できる", () => {
    // Act: フィルタを変更する
    useTodoFilterStore.getState().setFilter("done");
    // Assert: 変更が反映される
    expect(useTodoFilterStore.getState().filter).toBe("done");
  });
});
