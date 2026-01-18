import fastify, { FastifyInstance } from "fastify";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

type ApiError = {
  message: string;
};

function parseId(input: string): number | null {
  const id = Number.parseInt(input, 10);
  return Number.isNaN(id) ? null : id;
}

export function buildApp(): FastifyInstance {
  const app = fastify();

  app.get("/todos", async () => {
    const items = await prisma.todo.findMany({ orderBy: { id: "asc" } });
    return { items };
  });

  app.post("/todos", async (request, reply) => {
    const parsed = createTodoSchema.safeParse(request.body);
    if (!parsed.success) {
      const error: ApiError = { message: "Invalid body." };
      return reply.code(400).send(error);
    }

    const todo = await prisma.todo.create({
      data: {
        title: parsed.data.title,
      },
    });

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
      const error: ApiError = { message: parsed.error.issues[0]?.message ?? "Invalid body." };
      return reply.code(400).send(error);
    }

    const target = await prisma.todo.findUnique({ where: { id } });
    if (!target) {
      const error: ApiError = { message: "Todo not found." };
      return reply.code(404).send(error);
    }

    const data: { title?: string; status?: string; doneAt?: Date | null } = {};

    if (parsed.data.title) {
      data.title = parsed.data.title;
    }

    if (parsed.data.status) {
      data.status = parsed.data.status;
      data.doneAt = parsed.data.status === "done" ? new Date() : null;
    }

    const todo = await prisma.todo.update({ where: { id }, data });
    return reply.send(todo);
  });

  app.delete<{ Params: { id: string } }>("/todos/:id", async (request, reply) => {
    const id = parseId(request.params.id);
    if (id === null) {
      const error: ApiError = { message: "Invalid id." };
      return reply.code(400).send(error);
    }

    const target = await prisma.todo.findUnique({ where: { id } });
    if (!target) {
      const error: ApiError = { message: "Todo not found." };
      return reply.code(404).send(error);
    }

    await prisma.todo.delete({ where: { id } });
    return reply.code(204).send();
  });

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}
