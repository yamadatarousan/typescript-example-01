import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AuthServiceError, login, signUp } from "../services/authService";

type ApiError = {
  message: string;
};

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function registerAuthHandlers(app: FastifyInstance, jwtSecret: string) {
  app.post("/auth/signup", async (request, reply) => {
    const parsed = authSchema.safeParse(request.body);
    if (!parsed.success) {
      const error: ApiError = { message: "Invalid body." };
      return reply.code(400).send(error);
    }

    try {
      const result = await signUp(parsed.data.email, parsed.data.password, jwtSecret);
      return reply.code(201).send(result);
    } catch (error) {
      if (error instanceof AuthServiceError && error.code === "EMAIL_EXISTS") {
        const response: ApiError = { message: error.message };
        return reply.code(409).send(response);
      }
      const response: ApiError = { message: "Unexpected error." };
      return reply.code(500).send(response);
    }
  });

  app.post("/auth/login", async (request, reply) => {
    const parsed = authSchema.safeParse(request.body);
    if (!parsed.success) {
      const error: ApiError = { message: "Invalid body." };
      return reply.code(400).send(error);
    }

    try {
      const result = await login(parsed.data.email, parsed.data.password, jwtSecret);
      return reply.send(result);
    } catch (error) {
      if (error instanceof AuthServiceError && error.code === "INVALID_CREDENTIALS") {
        const response: ApiError = { message: error.message };
        return reply.code(401).send(response);
      }
      const response: ApiError = { message: "Unexpected error." };
      return reply.code(500).send(response);
    }
  });
}
