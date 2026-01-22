import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  createNewTodo,
  deleteTodoForUser,
  listTodos,
  TodoServiceError,
  updateTodoForUser,
} from "../services/todoService";

type ApiError = {
  message: string;
};

const todoStatus = z.enum(["todo", "done"]);

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

type AuthGuard = (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

export function registerTodoHandlers(app: FastifyInstance, requireAuth: AuthGuard) {
  app.get("/todos", { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.user?.id;
    if (!userId) {
      const error: ApiError = { message: "Unauthorized." };
      return reply.code(401).send(error);
    }

    const items = await listTodos(userId);
    return { items };
  });

  app.post("/todos", { preHandler: requireAuth }, async (request, reply) => {
    const parsed = createTodoSchema.safeParse(request.body);
    if (!parsed.success) {
      const error: ApiError = { message: "Invalid body." };
      return reply.code(400).send(error);
    }

    const userId = request.user?.id;
    if (!userId) {
      const error: ApiError = { message: "Unauthorized." };
      return reply.code(401).send(error);
    }

    const todo = await createNewTodo(userId, parsed.data.title);
    return reply.code(201).send(todo);
  });

  app.put<{ Params: { id: string } }>(
    "/todos/:id",
    { preHandler: requireAuth },
    async (request, reply) => {
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

      const userId = request.user?.id;
      if (!userId) {
        const error: ApiError = { message: "Unauthorized." };
        return reply.code(401).send(error);
      }

      const data: { title?: string; status?: string; doneAt?: Date | null } = {};

      if (parsed.data.title) {
        data.title = parsed.data.title;
      }

      if (parsed.data.status) {
        data.status = parsed.data.status;
        data.doneAt = parsed.data.status === "done" ? new Date() : null;
      }

      try {
        const todo = await updateTodoForUser(id, userId, data);
        return reply.send(todo);
      } catch (error) {
        if (error instanceof TodoServiceError) {
          const response: ApiError = { message: error.message };
          return reply.code(404).send(response);
        }
        const response: ApiError = { message: "Unexpected error." };
        return reply.code(500).send(response);
      }
    },
  );

  app.delete<{ Params: { id: string } }>(
    "/todos/:id",
    { preHandler: requireAuth },
    async (request, reply) => {
      const id = parseId(request.params.id);
      if (id === null) {
        const error: ApiError = { message: "Invalid id." };
        return reply.code(400).send(error);
      }

      const userId = request.user?.id;
      if (!userId) {
        const error: ApiError = { message: "Unauthorized." };
        return reply.code(401).send(error);
      }

      try {
        await deleteTodoForUser(id, userId);
        return reply.code(204).send();
      } catch (error) {
        if (error instanceof TodoServiceError) {
          const response: ApiError = { message: error.message };
          return reply.code(404).send(response);
        }
        const response: ApiError = { message: "Unexpected error." };
        return reply.code(500).send(response);
      }
    },
  );
}
