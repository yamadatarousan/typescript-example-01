import type { AuthResponse } from "../types/auth";
import type { Todo, TodoStatus } from "../types/todo";

// Viteの環境変数からAPIエンドポイントを取得する
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

type TodoListResponse = {
  items: Todo[];
};

// APIが返すエラーメッセージの最低限の形
type ApiError = {
  message: string;
};

type AuthInput = {
  email: string;
  password: string;
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("todo-auth");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

function buildAuthHeader(): Record<string, string> {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

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
  // 一覧取得
  const response = await fetch(`${API_BASE}/todos`, {
    headers: { ...buildAuthHeader() },
  });
  const data = await handleResponse<TodoListResponse>(response);
  return data.items;
}

export async function createTodo(title: string): Promise<Todo> {
  // 作成
  const response = await fetch(`${API_BASE}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...buildAuthHeader() },
    body: JSON.stringify({ title }),
  });

  return handleResponse<Todo>(response);
}

export async function updateTodoStatus(id: number, status: TodoStatus): Promise<Todo> {
  // ステータス更新
  const response = await fetch(`${API_BASE}/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...buildAuthHeader() },
    body: JSON.stringify({ status }),
  });

  return handleResponse<Todo>(response);
}

export async function updateTodoTitle(id: number, title: string): Promise<Todo> {
  // タイトル更新
  const response = await fetch(`${API_BASE}/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...buildAuthHeader() },
    body: JSON.stringify({ title }),
  });

  return handleResponse<Todo>(response);
}

export async function deleteTodo(id: number): Promise<void> {
  // 削除
  const response = await fetch(`${API_BASE}/todos/${id}`, {
    method: "DELETE",
    headers: { ...buildAuthHeader() },
  });

  await handleResponse<void>(response);
}

export async function login(input: AuthInput): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return handleResponse<AuthResponse>(response);
}

export async function signup(input: AuthInput): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return handleResponse<AuthResponse>(response);
}
