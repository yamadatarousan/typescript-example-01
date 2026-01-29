import { describe, it, expect, vi, beforeEach } from "vitest";
import { scryptSync } from "crypto";
import { domainErrorCodes } from "../domain/errors/domainError.js";
import { signUp, login } from "./authService.js";
import { findUserByEmail, createUser } from "../repositories/userRepository.js";
import jwt from "jsonwebtoken";

vi.mock("../repositories/userRepository.js", () => ({
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(() => "token"),
  },
}));

describe("authService", () => {
  const findUserByEmailMock = vi.mocked(findUserByEmail);
  const createUserMock = vi.mocked(createUser);
  const jwtSignMock = vi.mocked(jwt.sign);

  beforeEach(() => {
    findUserByEmailMock.mockReset();
    createUserMock.mockReset();
    jwtSignMock.mockClear();
  });

  it("既存ユーザーがいる場合はサインアップを拒否する", async () => {
    findUserByEmailMock.mockResolvedValue({
      id: 1,
      email: "exists@example.com",
      passwordHash: "hash",
      passwordSalt: "salt",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(signUp("exists@example.com", "pass", "secret")).rejects
      .toMatchObject({ code: domainErrorCodes.emailExists });
  });

  it("新規ユーザーを作成してトークンを返す", async () => {
    findUserByEmailMock.mockResolvedValue(null);
    createUserMock.mockResolvedValue({
      id: 2,
      email: "new@example.com",
      passwordHash: "hash",
      passwordSalt: "salt",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await signUp("new@example.com", "pass", "secret");

    expect(createUserMock).toHaveBeenCalledWith({
      email: "new@example.com",
      passwordHash: expect.any(String),
      passwordSalt: expect.any(String),
    });
    expect(result).toEqual({
      token: "token",
      user: { id: 2, email: "new@example.com" },
    });
  });

  it("存在しないユーザーのログインは拒否する", async () => {
    findUserByEmailMock.mockResolvedValue(null);

    await expect(login("missing@example.com", "pass", "secret")).rejects
      .toMatchObject({ code: domainErrorCodes.invalidCredentials });
  });

  it("パスワードが一致しない場合は拒否する", async () => {
    const salt = "salt";
    const hash = scryptSync("correct", salt, 64).toString("hex");
    findUserByEmailMock.mockResolvedValue({
      id: 3,
      email: "user@example.com",
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(login("user@example.com", "wrong", "secret")).rejects
      .toMatchObject({ code: domainErrorCodes.invalidCredentials });
  });

  it("正しい資格情報ならトークンを返す", async () => {
    const salt = "salt";
    const hash = scryptSync("correct", salt, 64).toString("hex");
    findUserByEmailMock.mockResolvedValue({
      id: 4,
      email: "user@example.com",
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await login("user@example.com", "correct", "secret");

    expect(result).toEqual({
      token: "token",
      user: { id: 4, email: "user@example.com" },
    });
  });
});
