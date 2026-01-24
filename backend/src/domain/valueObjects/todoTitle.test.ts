import { describe, it, expect } from "vitest";
import { TodoTitle } from "./todoTitle.js";
import { DomainError, domainErrorCodes } from "../errors/domainError.js";

describe("TodoTitle", () => {
  it("trims and stores a valid title", () => {
    const title = TodoTitle.create("  Write tests  ");
    expect(title.value).toBe("Write tests");
  });

  it("rejects empty title", () => {
    expect(() => TodoTitle.create("   ")).toThrow(DomainError);
    try {
      TodoTitle.create("   ");
    } catch (error) {
      const domainError = error as DomainError;
      expect(domainError.code).toBe(domainErrorCodes.invalidTodoTitle);
    }
  });
});
