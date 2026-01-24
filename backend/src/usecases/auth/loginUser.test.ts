import { describe, it, expect, vi, beforeEach } from "vitest";
import { Email } from "../../domain/valueObjects/email.js";
import { buildLoginUser } from "./loginUser.js";
import { login } from "../../services/authService.js";

vi.mock("../../services/authService.js", () => ({
  login: vi.fn(),
}));

describe("loginUserユースケース", () => {
  const loginMock = vi.mocked(login);

  beforeEach(() => {
    loginMock.mockReset();
  });

  it("正規化済みのメールとパスワードをサービスへ渡す", async () => {
    loginMock.mockResolvedValue({
      token: "token",
      user: { id: 2, email: "hello@example.com" },
    });

    const loginUser = buildLoginUser("secret");
    const result = await loginUser({
      email: Email.create(" Hello@Example.com "),
      password: "pass1234",
    });

    expect(loginMock).toHaveBeenCalledWith(
      "hello@example.com",
      "pass1234",
      "secret",
    );
    expect(result).toEqual({
      token: "token",
      user: { id: 2, email: "hello@example.com" },
    });
  });
});
