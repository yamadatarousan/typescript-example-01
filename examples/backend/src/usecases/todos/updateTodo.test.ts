import { describe, it, expect, vi, beforeEach } from "vitest";
import { TodoTitle } from "../../domain/valueObjects/todoTitle.js";
import { buildUpdateTodo } from "./updateTodo.js";
import { updateTodoForUser } from "../../services/todoService.js";

vi.mock("../../services/todoService.js", () => ({
  updateTodoForUser: vi.fn(),
}));

describe("updateTodoユースケース", () => {
  const updateTodoForUserMock = vi.mocked(updateTodoForUser);

  beforeEach(() => {
    updateTodoForUserMock.mockReset();
  });

  it("Todoを更新できる", async () => {
    updateTodoForUserMock.mockResolvedValue({
      id: 1,
      title: "Updated",
      status: "done",
      doneAt: new Date("2024-01-01T00:00:00Z"),
      userId: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const updateTodo = buildUpdateTodo();
    const result = await updateTodo({
      id: 1,
      userId: 10,
      title: TodoTitle.create(" Updated "),
      status: "done",
    });

    expect(updateTodoForUserMock).toHaveBeenCalledWith(1, 10, {
      title: "Updated",
      status: "done",
    });
    expect(result).toEqual({
      id: 1,
      title: "Updated",
      status: "done",
      doneAt: new Date("2024-01-01T00:00:00Z"),
    });
  });

  it("一部の項目だけ更新できる", async () => {
    updateTodoForUserMock.mockResolvedValue({
      id: 2,
      title: "Keep",
      status: "todo",
      doneAt: null,
      userId: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const updateTodo = buildUpdateTodo();
    const result = await updateTodo({
      id: 2,
      userId: 10,
      status: "todo",
    });

    expect(updateTodoForUserMock).toHaveBeenCalledWith(2, 10, {
      title: undefined,
      status: "todo",
    });
    expect(result).toEqual({
      id: 2,
      title: "Keep",
      status: "todo",
      doneAt: null,
    });
  });
});
