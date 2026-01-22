import type { TodoStatus } from "../../domain/valueObjects/todoStatus.js";
import type { TodoTitle } from "../../domain/valueObjects/todoTitle.js";
import { updateTodoForUser } from "../../services/todoService.js";

export type UpdateTodoInput = {
  id: number;
  userId: number;
  title?: TodoTitle;
  status?: TodoStatus;
};

export type UpdateTodoOutput = {
  id: number;
  title: string;
  status: TodoStatus;
  doneAt: Date | null;
};

export type UpdateTodo = (input: UpdateTodoInput) => Promise<UpdateTodoOutput>;

export function buildUpdateTodo(): UpdateTodo {
  return async (input: UpdateTodoInput) => {
    const todo = await updateTodoForUser(input.id, input.userId, {
      title: input.title?.value,
      status: input.status,
    });
    return {
      id: todo.id,
      title: todo.title,
      status: todo.status as TodoStatus,
      doneAt: todo.doneAt ?? null,
    };
  };
}
