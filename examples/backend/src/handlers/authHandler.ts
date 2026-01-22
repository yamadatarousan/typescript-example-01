import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { Email } from "../domain/valueObjects/email";
import { AuthServiceError } from "../services/authService";
import { buildLoginUser } from "../usecases/auth/loginUser";
import { buildSignUpUser } from "../usecases/auth/signUpUser";

type ApiError = {
  message: string;
};

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function registerAuthHandlers(app: FastifyInstance, jwtSecret: string) {
  const signUpUser = buildSignUpUser(jwtSecret);
  const loginUser = buildLoginUser(jwtSecret);

  app.post("/auth/signup", async (request, reply) => {
    const parsed = authSchema.safeParse(request.body);
    if (!parsed.success) {
      const error: ApiError = { message: "Invalid body." };
      return reply.code(400).send(error);
    }

    try {
      const result = await signUpUser({
        email: Email.create(parsed.data.email),
        password: parsed.data.password,
      });
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
      const result = await loginUser({
        email: Email.create(parsed.data.email),
        password: parsed.data.password,
      });
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
