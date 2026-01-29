import { describe, it, expect, vi, beforeEach } from "vitest";
import { domainErrorCodes } from "../domain/errors/domainError.js";
import { updateTodoForUser, deleteTodoForUser } from "./todoService.js";
import {
  findTodoByIdForUser,
  updateTodo,
  deleteTodo,
} from "../repositories/todoRepository.js";

vi.mock("../repositories/todoRepository.js", () => ({
  findTodoByIdForUser: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

describe("todoService", () => {
  const findTodoByIdForUserMock = vi.mocked(findTodoByIdForUser);
  const updateTodoMock = vi.mocked(updateTodo);
  const deleteTodoMock = vi.mocked(deleteTodo);

  beforeEach(() => {
    findTodoByIdForUserMock.mockReset();
    updateTodoMock.mockReset();
    deleteTodoMock.mockReset();
  });

  it("更新対象がなければエラーにする", async () => {
    findTodoByIdForUserMock.mockResolvedValue(null);

    await expect(
      updateTodoForUser(1, 10, { title: "Update" }),
    ).rejects.toMatchObject({ code: domainErrorCodes.todoNotFound });
  });

  it("更新対象があれば更新処理を呼ぶ", async () => {
    findTodoByIdForUserMock.mockResolvedValue({
      id: 1,
      title: "Old",
      status: "todo",
      doneAt: null,
      userId: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    updateTodoMock.mockResolvedValue({
      id: 1,
      title: "New",
      status: "done",
      doneAt: new Date("2024-01-01T00:00:00Z"),
      userId: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await updateTodoForUser(1, 10, {
      title: "New",
      status: "done",
    });

    expect(updateTodoMock).toHaveBeenCalledWith(1, {
      title: "New",
      status: "done",
    });
    expect(result.id).toBe(1);
  });

  it("削除対象がなければエラーにする", async () => {
    findTodoByIdForUserMock.mockResolvedValue(null);

    await expect(deleteTodoForUser(1, 10)).rejects.toMatchObject({
      code: domainErrorCodes.todoNotFound,
    });
  });

  it("削除対象があれば削除処理を呼ぶ", async () => {
    findTodoByIdForUserMock.mockResolvedValue({
      id: 2,
      title: "Target",
      status: "todo",
      doneAt: null,
      userId: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    deleteTodoMock.mockResolvedValue();

    await deleteTodoForUser(2, 10);

    expect(deleteTodoMock).toHaveBeenCalledWith(2);
  });
});
