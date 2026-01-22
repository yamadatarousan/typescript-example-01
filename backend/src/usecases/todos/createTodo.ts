import type { TodoStatus } from "../../domain/valueObjects/todoStatus.js";
import type { TodoTitle } from "../../domain/valueObjects/todoTitle.js";
import { createNewTodo } from "../../services/todoService.js";

export type CreateTodoInput = {
  userId: number;
  title: TodoTitle;
};

export type CreateTodoOutput = {
  id: number;
  title: string;
  status: TodoStatus;
  doneAt: Date | null;
};

export type CreateTodo = (input: CreateTodoInput) => Promise<CreateTodoOutput>;

export function buildCreateTodo(): CreateTodo {
  return async (input: CreateTodoInput) => {
    const todo = await createNewTodo(input.userId, input.title.value);
    return {
      id: todo.id,
      title: todo.title,
      status: todo.status as TodoStatus,
      doneAt: todo.doneAt ?? null,
    };
  };
}
