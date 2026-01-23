import fastify, { FastifyInstance } from "fastify";
import { error } from "node:console";
import { request } from "node:http";
import { title } from "node:process";
import { z } from "zod";

const todoStatus = z.enum(["todo", "done"]);

type Todo = {
  id: number;
  title: string;
  status: z.infer<typeof todoStatus>;
  createdAt: string;
  doneAt?: string;
};

type TodoList = {
  nextId: number;
  items: Todo[];
};

type ApiError = {
  message: string;
};

const createTodoSchema = z.object({
  title: z.string().min(1),
});

const updateTodoSchema = z
  .object({
    title: z.string().min(1).optional(),
    status: todoStatus.optional(),
  })
  .refine((value) => value.title || value.status, {
    message: "Either title or status is required.",
  });

function parseId(input: string): number | null {
  const id = Number.parseInt(input, 10);
  return Number.isNaN(id) ? null : id;
}

export function buildApp(): FastifyInstance {
  const app = fastify();

  const list: TodoList = {
    nextId: 1,
    items: [],
  };

  app.get("/todos", async () => ({ items: list.items }));

  app.post("/todos", async (request, reply) => {
    const parsed = createTodoSchema.safeParse(request.body);
    if (!parsed.success) {
      const err: ApiError = { message: "Invalid body." };
      return reply.code(400).send(error);
    }

    const now = new Date().toISOString();
    const todo: Todo = {
      id: list.nextId,
      title: parsed.data.title,
      status: "todo",
      createdAt: now,
    };

    list.items.push(todo);
    list.nextId += 1;

    return reply.code(201).send(todo);
  });

  app.put<{ Params: { id: string } }>("/todos/:id", async (request, reply) => {
    const id = parseId(request.params.id);
    if (id === null) {
      const error: ApiError = { message: "Invalid id." };
      return reply.code(400).send(error);
    }

    const parsed = updateTodoSchema.safeParse(request.body);
    if (!parsed.success) {
      const error: ApiError = {
        message: parsed.error.issues[0]?.message ?? "Invalid body.",
      };
      return reply.code(400).send(error);
    }

    const target = list.items.find((todo) => todo.id === id);
    if (!target) {
      const error: ApiError = { message: "Todo not found." };
      return reply.code(404).send(error);
    }

    if (parsed.data.title) {
      target.title = parsed.data.title;
    }

    if (parsed.data.status) {
      target.status = parsed.data.status;
      if (parsed.data.status === "done") {
        target.doneAt = new Date().toISOString();
      } else {
        delete target.doneAt;
      }
    }

    return reply.send(target);
  });

  app.delete<{ Params: { id: string } }>(
    "/todos/:id",
    async (request, reply) => {
      const id = parseId(request.params.id);
      if (id === null) {
        const error: ApiError = { message: "Invalid id." };
        return reply.code(400).send(error);
      }

      const before = list.items.length;
      list.items = list.items.filter((todo) => todo.id !== id);

      if (list.items.length === before) {
        const error: ApiError = { message: "Todo not found." };
        return reply.code(404).send(error);
      }

      return reply.code(204).send();
    },
  );

  return app;
}
