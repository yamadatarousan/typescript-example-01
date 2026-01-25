import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TodoApp from "./TodoApp";
import {
  createTodo,
  deleteTodo,
  fetchTodos,
  updateTodoStatus,
  updateTodoTitle,
} from "../../api/client";
import { useTodoFilterStore } from "../../store/todoFilter";

vi.mock("../../api/client", () => ({
  // APIはすべてモックして、呼び出しの有無だけ確認する
  fetchTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodoStatus: vi.fn(),
  updateTodoTitle: vi.fn(),
  deleteTodo: vi.fn(),
}));

const clearAuth = vi.fn();

vi.mock("../../store/auth", () => ({
  // 認証済みの状態として描画する
  useAuthStore: () => ({
    user: { id: 1, email: "user@example.com" },
    clearAuth,
  }),
}));

function renderWithClient() {
  // React Queryのクライアントをテスト用に作る
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TodoApp />
    </QueryClientProvider>,
  );
}

describe("TodoApp", () => {
  const fetchTodosMock = vi.mocked(fetchTodos);
  const createTodoMock = vi.mocked(createTodo);

  beforeEach(() => {
    // 前のテストの副作用を消す
    fetchTodosMock.mockReset();
    createTodoMock.mockReset();
    vi.mocked(updateTodoStatus).mockReset();
    vi.mocked(updateTodoTitle).mockReset();
    vi.mocked(deleteTodo).mockReset();
    clearAuth.mockReset();
    // フィルタは毎回初期状態に戻す
    useTodoFilterStore.setState({ filter: "all" });
  });

  it("Todo一覧を表示できる", async () => {
    // Arrange: APIがTodo一覧を返す前提で表示を確認する
    fetchTodosMock.mockResolvedValue([
      {
        id: 1,
        title: "Ship",
        status: "done",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        doneAt: "2024-01-02",
      },
    ]);

    // Act: 画面を描画する
    renderWithClient();

    // Assert: 取得したTodoが表示される
    expect(await screen.findByText("Ship")).toBeInTheDocument();
  });

  it("Todoを追加できる", async () => {
    // Arrange: 初期一覧は空、追加時の戻り値を定義
    fetchTodosMock.mockResolvedValue([]);
    createTodoMock.mockResolvedValue({
      id: 2,
      title: "New",
      status: "todo",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
      doneAt: null,
    });

    // Act: 入力して追加ボタンを押す
    renderWithClient();
    const user = userEvent.setup();

    await user.type(
      screen.getByPlaceholderText("次のTODOを書いて追加"),
      "  New  ",
    );
    await user.click(screen.getByRole("button", { name: "Add" }));

    // Assert: トリムされた値でAPIが呼ばれる
    await waitFor(() => {
      expect(createTodoMock).toHaveBeenCalledWith("New", expect.anything());
    });
  });

  it("フィルタを切り替えられる", async () => {
    // Arrange: todo/doneが混在する一覧を返す
    fetchTodosMock.mockResolvedValue([
      {
        id: 1,
        title: "Todo A",
        status: "todo",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        doneAt: null,
      },
      {
        id: 2,
        title: "Todo B",
        status: "done",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        doneAt: "2024-01-02",
      },
    ]);

    // Act: 画面を描画してフィルタを変更
    renderWithClient();
    const user = userEvent.setup();

    // Assert: 初期は両方見える
    expect(await screen.findByText("Todo A")).toBeInTheDocument();
    expect(screen.getByText("Todo B")).toBeInTheDocument();

    // Act: doneフィルタへ切り替え
    await user.click(screen.getByRole("button", { name: "done" }));

    // Assert: doneだけが残る
    expect(screen.queryByText("Todo A")).not.toBeInTheDocument();
    expect(screen.getByText("Todo B")).toBeInTheDocument();
  });
});
