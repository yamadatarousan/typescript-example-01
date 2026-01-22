import type { User } from "@prisma/client";
import { prisma } from "../infrastructure/prismaClient";

export type CreateUserInput = {
  email: string;
  passwordHash: string;
  passwordSalt: string;
};

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(input: CreateUserInput): Promise<User> {
  return prisma.user.create({
    data: {
      email: input.email,
      passwordHash: input.passwordHash,
      passwordSalt: input.passwordSalt,
    },
  });
}
