import type { TodoStatus } from "../../domain/valueObjects/todoStatus";

export type ListTodosInput = {
  userId: number;
};

export type ListTodosOutput = Array<{
  id: number;
  title: string;
  status: TodoStatus;
  doneAt: Date | null;
}>;

export type ListTodos = (input: ListTodosInput) => Promise<ListTodosOutput>;
