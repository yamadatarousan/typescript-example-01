import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildDeleteTodo } from "./deleteTodo.js";
import { deleteTodoForUser } from "../../services/todoService.js";

vi.mock("../../services/todoService.js", () => ({
  deleteTodoForUser: vi.fn(),
}));

describe("deleteTodo usecase", () => {
  const deleteTodoForUserMock = vi.mocked(deleteTodoForUser);

  beforeEach(() => {
    deleteTodoForUserMock.mockReset();
  });

  it("deletes todo for user", async () => {
    deleteTodoForUserMock.mockResolvedValue();

    const deleteTodo = buildDeleteTodo();
    await deleteTodo({ id: 1, userId: 10 });

    expect(deleteTodoForUserMock).toHaveBeenCalledWith(1, 10);
  });
});
