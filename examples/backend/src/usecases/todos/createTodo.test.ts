import { describe, it, expect, vi, beforeEach } from "vitest";
import { TodoTitle } from "../../domain/valueObjects/todoTitle.js";
import { buildCreateTodo } from "./createTodo.js";
import { createNewTodo } from "../../services/todoService.js";

vi.mock("../../services/todoService.js", () => ({
  createNewTodo: vi.fn(),
}));

describe("createTodoユースケース", () => {
  const createNewTodoMock = vi.mocked(createNewTodo);

  beforeEach(() => {
    createNewTodoMock.mockReset();
  });

  it("ValueObjectから作成し返却形式に変換する", async () => {
    createNewTodoMock.mockResolvedValue({
      id: 1,
      title: "Write tests",
      status: "todo",
      doneAt: null,
      userId: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createTodo = buildCreateTodo();
    const result = await createTodo({
      userId: 10,
      title: TodoTitle.create(" Write tests "),
    });

    expect(createNewTodoMock).toHaveBeenCalledWith(10, "Write tests");
    expect(result).toEqual({
      id: 1,
      title: "Write tests",
      status: "todo",
      doneAt: null,
    });
  });
});
