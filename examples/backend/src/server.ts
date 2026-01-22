import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import jwt from "jsonwebtoken";
import { registerAuthHandlers } from "./handlers/authHandler";
import { registerTodoHandlers } from "./handlers/todoHandler";
import { disconnectPrisma } from "./infrastructure/prismaClient";

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

  registerAuthHandlers(app, jwtSecret);
  registerTodoHandlers(app, requireAuth);

  app.addHook("onClose", async () => {
    await disconnectPrisma();
  });

  return app;
}
