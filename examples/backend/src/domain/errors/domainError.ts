export class DomainError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

export const domainErrorCodes = {
  invalidEmail: "INVALID_EMAIL",
  invalidTodoTitle: "INVALID_TODO_TITLE",
  invalidTodoStatus: "INVALID_TODO_STATUS",
} as const;
