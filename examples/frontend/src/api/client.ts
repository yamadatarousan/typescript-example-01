import type { Todo, TodoStatus } from "../types/todo";

// Viteの環境変数からAPIエンドポイントを取得する
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

type TodoListResponse = {
  items: Todo[];
};

type ApiError = {
  message: string;
};

// レスポンスの成否を統一的に扱う
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "Request failed.";
    try {
      const body = (await response.json()) as ApiError;
      if (body?.message) message = body.message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  // No Contentの時はボディが無いのでundefinedを返す
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch(`${API_BASE}/todos`);
  const data = await handleResponse<TodoListResponse>(response);
  return data.items;
}

export async function createTodo(title: string): Promise<Todo> {
  const response = await fetch(`${API_BASE}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });

  return handleResponse<Todo>(response);
}

export async function updateTodoStatus(id: number, status: TodoStatus): Promise<Todo> {
  const response = await fetch(`${API_BASE}/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  return handleResponse<Todo>(response);
}

export async function updateTodoTitle(id: number, title: string): Promise<Todo> {
  const response = await fetch(`${API_BASE}/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });

  return handleResponse<Todo>(response);
}

export async function deleteTodo(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/todos/${id}`, {
    method: "DELETE",
  });

  await handleResponse<void>(response);
}
