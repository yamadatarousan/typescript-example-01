import { DomainError, domainErrorCodes } from "../errors/domainError";

export class Email {
  private constructor(readonly value: string) {}

  static create(input: string): Email {
    const trimmed = input.trim().toLowerCase();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!isValid) {
      throw new DomainError("Invalid email.", domainErrorCodes.invalidEmail);
    }
    return new Email(trimmed);
  }
}
