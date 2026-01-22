import type { TodoStatus } from "../../domain/valueObjects/todoStatus.js";
import { listTodos } from "../../services/todoService.js";

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

export function buildListTodos(): ListTodos {
  return async (input: ListTodosInput) => {
    const items = await listTodos(input.userId);
    return items.map((todo) => ({
      id: todo.id,
      title: todo.title,
      status: todo.status as TodoStatus,
      doneAt: todo.doneAt ?? null,
    }));
  };
}
