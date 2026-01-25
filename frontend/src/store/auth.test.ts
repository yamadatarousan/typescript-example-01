import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./auth";

const STORAGE_KEY = "todo-auth";

describe("認証ストア", () => {
  beforeEach(() => {
    // テスト前に永続化とストア状態を初期化する
    window.localStorage.clear();
    useAuthStore.setState({ token: null, user: null });
  });

  it("認証情報を保存できる", () => {
    // Arrange: setAuthを呼べる状態を作る
    const state = useAuthStore.getState();
    // Act: 認証情報を保存する
    state.setAuth("token", { id: 1, email: "user@example.com" });

    // Assert: localStorageとストアの両方に反映される
    const saved = window.localStorage.getItem(STORAGE_KEY);
    expect(saved).toBe(
      JSON.stringify({ token: "token", user: { id: 1, email: "user@example.com" } }),
    );
    expect(useAuthStore.getState().token).toBe("token");
    expect(useAuthStore.getState().user?.email).toBe("user@example.com");
  });

  it("認証情報をクリアできる", () => {
    // Arrange: いったん認証情報を保存しておく
    const state = useAuthStore.getState();
    state.setAuth("token", { id: 1, email: "user@example.com" });
    // Act: 認証情報を消す
    state.clearAuth();

    // Assert: localStorageとストアが初期状態に戻る
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
