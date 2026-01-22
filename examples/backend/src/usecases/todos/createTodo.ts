import type { TodoStatus } from "../../domain/valueObjects/todoStatus";
import type { TodoTitle } from "../../domain/valueObjects/todoTitle";

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
