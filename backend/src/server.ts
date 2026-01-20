import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const prisma = new PrismaClient();

type ApiError = {
  message: string;
};

type AuthUser = {
  id: number;
  email: string;
};

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

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

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function parseId(input: string): number | null {
  const id = Number.parseInt(input, 10);
  return Number.isNaN(id) ? null : id;
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

function createPasswordHash(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = hashPassword(password, salt);
  return { hash, salt };
}

function verifyPassword(password: string, salt: string, hash: string): boolean {
  const computed = scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, "hex");
  return computed.length === stored.length && timingSafeEqual(computed, stored);
}

function signToken(user: AuthUser, secret: string): string {
  return jwt.sign({ sub: user.id, email: user.email }, secret, {
    expiresIn: "7d",
  });
}

export function buildApp(): FastifyInstance {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is required");
  }

  const app = fastify();

  app.register(cors, {
    origin: ["http://localhost:5173"],
  });

  const requireAuth = async (request: FastifyRequest, reply: FastifyReply) => {
    const header = request.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      const error: ApiError = { message: "Unauthorized." };
      return reply.code(401).send(error);
    }

    const token = header.slice("Bearer ".length);
    try {
      const payload = jwt.verify(token, jwtSecret);
      if (typeof payload !== "object" || payload === null) {
        const error: ApiError = { message: "Unauthorized." };
        return reply.code(401).send(error);
      }

      const sub = payload.sub;
      const userId =
        typeof sub === "number" ? sub : Number.parseInt(String(sub), 10);
      if (!Number.isFinite(userId)) {
        const error: ApiError = { message: "Unauthorized." };
        return reply.code(401).send(error);
      }

      const email =
        typeof payload.email === "string" ? payload.email : undefined;
      if (!email) {
        const error: ApiError = { message: "Unauthorized." };
        return reply.code(401).send(error);
      }

      request.user = { id: userId, email };
    } catch (error) {
      const response: ApiError = { message: "Unauthorized." };
      return reply.code(401).send(response);
    }
  };

  app.post("/auth/signup", async (request, reply) => {
    const parsed = authSchema.safeParse(request.body);
    if (!parsed.success) {
      const error: ApiError = { message: "Invalid body." };
      return reply.code(400).send(error);
    }

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (existing) {
      const error: ApiError = { message: "Email already registered." };
      return reply.code(409).send(error);
    }

    const { hash, salt } = createPasswordHash(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        passwordHash: hash,
        passwordSalt: salt,
      },
    });

    const token = signToken({ id: user.id, email: user.email }, jwtSecret);
    return reply.code(201).send({ token, user: { id: user.id, email: user.email } });
  });

  app.post("/auth/login", async (request, reply) => {
    const parsed = authSchema.safeParse(request.body);
    if (!parsed.success) {
      const error: ApiError = { message: "Invalid body." };
      return reply.code(400).send(error);
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (!user) {
      const error: ApiError = { message: "Invalid credentials." };
      return reply.code(401).send(error);
    }

    const valid = verifyPassword(
      parsed.data.password,
      user.passwordSalt,
      user.passwordHash,
    );
    if (!valid) {
      const error: ApiError = { message: "Invalid credentials." };
      return reply.code(401).send(error);
    }

    const token = signToken({ id: user.id, email: user.email }, jwtSecret);
    return reply.send({ token, user: { id: user.id, email: user.email } });
  });

  app.get("/todos", { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.user?.id;
    if (!userId) {
      const error: ApiError = { message: "Unauthorized." };
      return reply.code(401).send(error);
    }
    const items = await prisma.todo.findMany({
      where: { userId },
      orderBy: { id: "asc" },
    });
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
    const todo = await prisma.todo.create({
      data: {
        title: parsed.data.title,
        userId,
      },
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
      const target = await prisma.todo.findFirst({
        where: { id, userId },
      });
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
      const target = await prisma.todo.findFirst({
        where: { id, userId },
      });
      if (!target) {
        const error: ApiError = { message: "Todo not found." };
        return reply.code(404).send(error);
      }

      await prisma.todo.delete({ where: { id } });
      return reply.code(204).send();
    },
  );

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}
