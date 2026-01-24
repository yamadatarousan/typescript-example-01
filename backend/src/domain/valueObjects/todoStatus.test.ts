import { describe, it, expect } from "vitest";
import { parseTodoStatus } from "./todoStatus.js";
import { DomainError, domainErrorCodes } from "../errors/domainError.js";

describe("TodoStatus", () => {
  it("accepts valid status", () => {
    expect(parseTodoStatus("todo")).toBe("todo");
    expect(parseTodoStatus("done")).toBe("done");
  });

  it("rejects invalid status", () => {
    expect(() => parseTodoStatus("invalid")).toThrow(DomainError);
    try {
      parseTodoStatus("invalid");
    } catch (error) {
      const domainError = error as DomainError;
      expect(domainError.code).toBe(domainErrorCodes.invalidTodoStatus);
    }
  });
});
