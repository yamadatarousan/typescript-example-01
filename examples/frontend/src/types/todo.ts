// API側と揃えたTodoステータス
export type TodoStatus = "todo" | "done";

// APIレスポンスに合わせたTodoモデル
export type Todo = {
  id: number;
  title: string;
  status: TodoStatus;
  createdAt: string;
  updatedAt: string;
  doneAt?: string | null;
};
