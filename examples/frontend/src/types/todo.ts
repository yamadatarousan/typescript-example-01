export type TodoStatus = "todo" | "done";

export type Todo = {
  id: number;
  title: string;
  status: TodoStatus;
  createdAt: string;
  updatedAt: string;
  doneAt?: string | null;
};
