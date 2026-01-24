import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildListTodos } from "./listTodos.js";
import { listTodos } from "../../services/todoService.js";

vi.mock("../../services/todoService.js", () => ({
  listTodos: vi.fn(),
}));

describe("listTodosユースケース", () => {
  const listTodosMock = vi.mocked(listTodos);

  beforeEach(() => {
    listTodosMock.mockReset();
  });

  it("ユーザーのTodo一覧を返却形式に変換する", async () => {
    listTodosMock.mockResolvedValue([
      {
        id: 1,
        title: "Ship",
        status: "done",
        doneAt: new Date("2024-01-01T00:00:00Z"),
        userId: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const listTodosUsecase = buildListTodos();
    const result = await listTodosUsecase({ userId: 10 });

    expect(listTodosMock).toHaveBeenCalledWith(10);
    expect(result).toEqual([
      {
        id: 1,
        title: "Ship",
        status: "done",
        doneAt: new Date("2024-01-01T00:00:00Z"),
      },
    ]);
  });
});
