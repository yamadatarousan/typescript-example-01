export type DeleteTodoInput = {
  id: number;
  userId: number;
};

export type DeleteTodo = (input: DeleteTodoInput) => Promise<void>;
