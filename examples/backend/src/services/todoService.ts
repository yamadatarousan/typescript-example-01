import type { Todo } from "@prisma/client";
import {
  createTodo,
  deleteTodo,
  findTodoByIdForUser,
  listTodosByUserId,
  updateTodo,
} from "../repositories/todoRepository";

export class TodoServiceError extends Error {
  readonly code: "TODO_NOT_FOUND";

  constructor(message: string) {
    super(message);
    this.code = "TODO_NOT_FOUND";
  }
}

export async function listTodos(userId: number): Promise<Todo[]> {
  return listTodosByUserId(userId);
}

export async function createNewTodo(userId: number, title: string): Promise<Todo> {
  return createTodo(userId, title);
}

export async function updateTodoForUser(
  id: number,
  userId: number,
  data: { title?: string; status?: string; doneAt?: Date | null },
): Promise<Todo> {
  const target = await findTodoByIdForUser(id, userId);
  if (!target) {
    throw new TodoServiceError("Todo not found.");
  }

  return updateTodo(id, data);
}

export async function deleteTodoForUser(id: number, userId: number): Promise<void> {
  const target = await findTodoByIdForUser(id, userId);
  if (!target) {
    throw new TodoServiceError("Todo not found.");
  }

  await deleteTodo(id);
}
