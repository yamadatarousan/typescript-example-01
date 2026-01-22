import { deleteTodoForUser } from "../../services/todoService";

export type DeleteTodoInput = {
  id: number;
  userId: number;
};

export type DeleteTodo = (input: DeleteTodoInput) => Promise<void>;

export function buildDeleteTodo(): DeleteTodo {
  return async (input: DeleteTodoInput) => {
    await deleteTodoForUser(input.id, input.userId);
  };
}
