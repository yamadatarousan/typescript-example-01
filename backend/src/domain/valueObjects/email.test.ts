import { describe, it, expect } from "vitest";
import { Email } from "./email.js";
import { DomainError, domainErrorCodes } from "../errors/domainError.js";

describe("Email（メール）", () => {
  it("有効なメールを正規化して保持する", () => {
    const email = Email.create("  Hello@Example.com ");
    expect(email.value).toBe("hello@example.com");
  });

  it("無効なメールを拒否する", () => {
    expect(() => Email.create("not-an-email")).toThrow(DomainError);
    try {
      Email.create("not-an-email");
    } catch (error) {
      const domainError = error as DomainError;
      expect(domainError.code).toBe(domainErrorCodes.invalidEmail);
    }
  });
});
