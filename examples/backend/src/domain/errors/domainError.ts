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
  emailExists: "EMAIL_ALREADY_REGISTERED",
  invalidCredentials: "INVALID_CREDENTIALS",
  todoNotFound: "TODO_NOT_FOUND",
} as const;
