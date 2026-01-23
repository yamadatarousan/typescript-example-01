import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { parseTodoStatus } from "../domain/valueObjects/todoStatus.js";
import { TodoTitle } from "../domain/valueObjects/todoTitle.js";
import { DomainError, domainErrorCodes } from "../domain/errors/domainError.js";
import { buildCreateTodo } from "../usecases/todos/createTodo.js";
import { buildDeleteTodo } from "../usecases/todos/deleteTodo.js";
import { buildListTodos } from "../usecases/todos/listTodos.js";
import { buildUpdateTodo } from "../usecases/todos/updateTodo.js";

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

type AuthGuard = (
  request: FastifyRequest,
  reply: FastifyReply,
) => Promise<void>;

export function registerTodoHandlers(
  app: FastifyInstance,
  requireAuth: AuthGuard,
) {
  const listTodosUseCase = buildListTodos();
  const createTodoUseCase = buildCreateTodo();
  const updateTodoUseCase = buildUpdateTodo();
  const deleteTodoUseCase = buildDeleteTodo();

  app.get("/todos", { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.user?.id;
    if (!userId) {
      const error: ApiError = { message: "Unauthorized." };
      return reply.code(401).send(error);
    }

    const items = await listTodosUseCase({ userId });
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

    const todo = await createTodoUseCase({
      userId,
      title: TodoTitle.create(parsed.data.title),
    });
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

      try {
        const todo = await updateTodoUseCase({
          id,
          userId,
          title: parsed.data.title
            ? TodoTitle.create(parsed.data.title)
            : undefined,
          status: parsed.data.status
            ? parseTodoStatus(parsed.data.status)
            : undefined,
        });
        return reply.send(todo);
      } catch (error) {
        if (error instanceof DomainError) {
          if (error.code === domainErrorCodes.todoNotFound) {
            const response: ApiError = { message: error.message };
            return reply.code(404).send(response);
          }
          if (
            error.code === domainErrorCodes.invalidTodoTitle ||
            error.code === domainErrorCodes.invalidTodoStatus
          ) {
            const response: ApiError = { message: error.message };
            return reply.code(400).send(response);
          }
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
        await deleteTodoUseCase({ id, userId });
        return reply.code(204).send();
      } catch (error) {
        if (error instanceof DomainError) {
          if (error.code === domainErrorCodes.todoNotFound) {
            const response: ApiError = { message: error.message };
            return reply.code(404).send(response);
          }
        }
        const response: ApiError = { message: "Unexpected error." };
        return reply.code(500).send(response);
      }
    },
  );
}
