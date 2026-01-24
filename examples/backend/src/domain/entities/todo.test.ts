import { describe, it, expect } from "vitest";
import { Todo } from "./todo.js";
import { TodoTitle } from "../valueObjects/todoTitle.js";

describe("Todo", () => {
  it("marks todo as done", () => {
    const todo = new Todo({
      id: 1,
      title: TodoTitle.create("Ship"),
      status: "todo",
      userId: 10,
      doneAt: null,
    });

    const done = todo.markDone();
    expect(done.status).toBe("done");
    expect(done.doneAt).toBeInstanceOf(Date);
  });

  it("marks done todo back to todo", () => {
    const todo = new Todo({
      id: 1,
      title: TodoTitle.create("Ship"),
      status: "done",
      userId: 10,
      doneAt: new Date(),
    });

    const reset = todo.markTodo();
    expect(reset.status).toBe("todo");
    expect(reset.doneAt).toBe(null);
  });
});
