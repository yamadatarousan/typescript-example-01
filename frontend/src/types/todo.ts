// API側と揃えたTodoステータス
export type TodoStatus = "todo" | "done";

// APIレスポンスに合わせたTodoモデル
export type Todo = {
  id: number;
  title: string;
  status: TodoStatus;
  // API側の日時はISO文字列で受け取る
  createdAt: string;
  updatedAt: string;
  // doneAtは未完了の場合null/undefinedになる
  doneAt?: string | null;
}
