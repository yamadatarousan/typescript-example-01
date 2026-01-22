import { DomainError, domainErrorCodes } from "../errors/domainError";

export type TodoStatus = "todo" | "done";

export function parseTodoStatus(input: string): TodoStatus {
  if (input === "todo" || input === "done") {
    return input;
  }
  throw new DomainError("Invalid todo status.", domainErrorCodes.invalidTodoStatus);
}
