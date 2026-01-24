import { describe, it, expect } from "vitest";
import { parseTodoStatus } from "./todoStatus.js";
import { DomainError, domainErrorCodes } from "../errors/domainError.js";

describe("TodoStatus（状態）", () => {
  it("有効なステータスを受け付ける", () => {
    expect(parseTodoStatus("todo")).toBe("todo");
    expect(parseTodoStatus("done")).toBe("done");
  });

  it("無効なステータスを拒否する", () => {
    expect(() => parseTodoStatus("invalid")).toThrow(DomainError);
    try {
      parseTodoStatus("invalid");
    } catch (error) {
      const domainError = error as DomainError;
      expect(domainError.code).toBe(domainErrorCodes.invalidTodoStatus);
    }
  });
});
