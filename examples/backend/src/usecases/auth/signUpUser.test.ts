import { describe, it, expect, vi, beforeEach } from "vitest";
import { Email } from "../../domain/valueObjects/email.js";
import { buildSignUpUser } from "./signUpUser.js";
import { signUp } from "../../services/authService.js";

vi.mock("../../services/authService.js", () => ({
  signUp: vi.fn(),
}));

describe("signUpUser usecase", () => {
  const signUpMock = vi.mocked(signUp);

  beforeEach(() => {
    signUpMock.mockReset();
  });

  it("passes normalized email and password to service", async () => {
    signUpMock.mockResolvedValue({
      token: "token",
      user: { id: 1, email: "hello@example.com" },
    });

    const signUpUser = buildSignUpUser("secret");
    const result = await signUpUser({
      email: Email.create(" Hello@Example.com "),
      password: "pass1234",
    });

    expect(signUpMock).toHaveBeenCalledWith(
      "hello@example.com",
      "pass1234",
      "secret",
    );
    expect(result).toEqual({
      token: "token",
      user: { id: 1, email: "hello@example.com" },
    });
  });
});
