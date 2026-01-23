import type { TodoTitle } from "../valueObjects/todoTitle.js";
import type { TodoStatus } from "../valueObjects/todoStatus.js";

type TodoProps = {
  id: number;
  title: TodoTitle;
  status: TodoStatus;
  userId: number;
  doneAt: Date | null;
};

export class Todo {
  readonly id: number;
  readonly title: TodoTitle;
  readonly status: TodoStatus;
  readonly userId: number;
  readonly doneAt: Date | null;

  constructor(props: TodoProps) {
    this.id = props.id;
    this.title = props.title;
    this.status = props.status;
    this.userId = props.userId;
    this.doneAt = props.doneAt;
  }

  markDone(): Todo {
    return new Todo({
      ...this,
      status: "done",
      doneAt: new Date(),
    });
  }

  markTodo(): Todo {
    return new Todo({
      ...this,
      status: "todo",
      doneAt: null,
    });
  }
}
