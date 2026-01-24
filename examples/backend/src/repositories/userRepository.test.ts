import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createUser, findUserByEmail } from "./userRepository.js";

const prisma = new PrismaClient();

describe("userRepository", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("メールでユーザーを取得できる", async () => {
    await createUser({
      email: "user@example.com",
      passwordHash: "hash",
      passwordSalt: "salt",
    });

    const found = await findUserByEmail("user@example.com");

    expect(found).not.toBeNull();
    expect(found?.email).toBe("user@example.com");
  });

  it("存在しないメールはnullになる", async () => {
    const found = await findUserByEmail("missing@example.com");

    expect(found).toBeNull();
  });
});
