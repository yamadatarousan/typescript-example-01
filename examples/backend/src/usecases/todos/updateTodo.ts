import type { TodoStatus } from "../../domain/valueObjects/todoStatus";
import type { TodoTitle } from "../../domain/valueObjects/todoTitle";

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
