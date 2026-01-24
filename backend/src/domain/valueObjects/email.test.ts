import { describe, it, expect } from "vitest";
import { Email } from "./email.js";
import { DomainError, domainErrorCodes } from "../errors/domainError.js";

describe("Email", () => {
  it("normalizes and stores a valid email", () => {
    const email = Email.create("  Hello@Example.com ");
    expect(email.value).toBe("hello@example.com");
  });

  it("rejects invalid email", () => {
    expect(() => Email.create("not-an-email")).toThrow(DomainError);
    try {
      Email.create("not-an-email");
    } catch (error) {
      const domainError = error as DomainError;
      expect(domainError.code).toBe(domainErrorCodes.invalidEmail);
    }
  });
});
