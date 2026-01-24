import { describe, it, expect } from "vitest";
import { DomainError, domainErrorCodes } from "./domainError.js";

describe("DomainError（ドメインエラー）", () => {
  it("メッセージとコードを保持する", () => {
    const error = new DomainError("Invalid", domainErrorCodes.invalidEmail);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Invalid");
    expect(error.code).toBe(domainErrorCodes.invalidEmail);
  });
});
