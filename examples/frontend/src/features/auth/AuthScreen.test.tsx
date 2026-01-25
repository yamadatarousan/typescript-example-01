import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthScreen from "./AuthScreen";
import { login, signup } from "../../api/client";

// AuthScreenが認証情報を保存するかを見るためのモック
const setAuth = vi.fn();

vi.mock("../../api/client", () => ({
  // API呼び出しは実際に行わずモックで検証する
  login: vi.fn(),
  signup: vi.fn(),
}));

vi.mock("../../store/auth", () => ({
  // AuthScreenがsetAuthを呼ぶかだけ確認するため、最小のモックを返す
  useAuthStore: () => ({ setAuth }),
}));

describe("AuthScreen", () => {
  const loginMock = vi.mocked(login);
  const signupMock = vi.mocked(signup);

  beforeEach(() => {
    // 前のテストの影響を消す
    loginMock.mockReset();
    signupMock.mockReset();
    setAuth.mockReset();
  });

  it("ログインで認証情報を保存できる", async () => {
    // Arrange: APIの成功レスポンスを疑似的に返す
    loginMock.mockResolvedValue({
      token: "token",
      user: { id: 1, email: "user@example.com" },
    });

    // Act: 画面を描画して入力・送信する
    render(<AuthScreen />);
    const user = userEvent.setup();

    // 入力 → 送信でloginが呼ばれることを確認
    await user.type(screen.getByLabelText("Email"), " user@example.com ");
    await user.type(screen.getByLabelText("Password"), "password123");
    const loginButtons = screen.getAllByRole("button", { name: "Login" });
    const submitLogin = loginButtons.find(
      (button) => button.getAttribute("type") === "submit",
    );
    if (!submitLogin) {
      throw new Error("Login送信ボタンが見つかりません");
    }
    await user.click(submitLogin);

    // Assert: 正規化された入力でAPIが呼ばれ、setAuthが呼ばれる
    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      });
    });
    expect(setAuth).toHaveBeenCalledWith("token", {
      id: 1,
      email: "user@example.com",
    });
  });

  it("サインアップ時はsignupを呼ぶ", async () => {
    // Arrange: signupの成功レスポンスを疑似的に返す
    signupMock.mockResolvedValue({
      token: "token",
      user: { id: 2, email: "new@example.com" },
    });

    // Act: サインアップモードに切り替えて送信する
    render(<AuthScreen />);
    const user = userEvent.setup();

    // モード切替 → 入力 → 送信でsignupが呼ばれることを確認
    // モード切替ボタンを先に押す
    await user.click(screen.getByRole("button", { name: "Sign up" }));
    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    const signupButtons = screen.getAllByRole("button", { name: "Sign up" });
    const submitSignup = signupButtons.find(
      (button) => button.getAttribute("type") === "submit",
    );
    if (!submitSignup) {
      throw new Error("Sign up送信ボタンが見つかりません");
    }
    await user.click(submitSignup);

    await waitFor(() => {
      expect(signupMock).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "password123",
      });
    });
  });

  it("ログイン失敗時はエラーを表示する", async () => {
    // Arrange: loginが失敗した場合のエラーを返す
    loginMock.mockRejectedValue(new Error("Invalid credentials"));

    // Act: 画面でログイン操作を行う
    render(<AuthScreen />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    const loginButtons = screen.getAllByRole("button", { name: "Login" });
    const submitLogin = loginButtons.find(
      (button) => button.getAttribute("type") === "submit",
    );
    if (!submitLogin) {
      throw new Error("Login送信ボタンが見つかりません");
    }
    await user.click(submitLogin);

    // Assert: エラーメッセージが表示される
    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });
});
