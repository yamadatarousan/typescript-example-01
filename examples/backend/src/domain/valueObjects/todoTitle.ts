import { DomainError, domainErrorCodes } from "../errors/domainError.js";

export class TodoTitle {
  private constructor(readonly value: string) {}

  static create(input: string): TodoTitle {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new DomainError(
        "Todo title is required.",
        domainErrorCodes.invalidTodoTitle,
      );
    }
    return new TodoTitle(trimmed);
  }
}
