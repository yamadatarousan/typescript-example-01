import request from "supertest";
import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import { PrismaClient } from "@prisma/client";
import { buildApp } from "./server.js";

const password = "password123";

async function signupAndGetToken(app: ReturnType<typeof buildApp>, email: string) {
  const response = await request(app.server)
    .post("/auth/signup")
    .send({ email, password })
    .expect(201);

  return response.body.token as string;
}

describe("todos api (db)", () => {
  const app = buildApp();
  const prisma = new PrismaClient();

  beforeAll(async () => {
    await prisma.$connect();
    await app.ready();
  });

  beforeEach(async () => {
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it("signs up and logs in", async () => {
    const signupResponse = await request(app.server)
      .post("/auth/signup")
      .send({ email: "hello@example.com", password })
      .expect(201);

    expect(signupResponse.body.user.email).toBe("hello@example.com");
    expect(typeof signupResponse.body.token).toBe("string");

    const loginResponse = await request(app.server)
      .post("/auth/login")
      .send({ email: "hello@example.com", password })
      .expect(200);

    expect(loginResponse.body.user.email).toBe("hello@example.com");
    expect(typeof loginResponse.body.token).toBe("string");
  });

  it("creates and lists todos", async () => {
    const token = await signupAndGetToken(app, "list@example.com");
    const createResponse = await request(app.server)
      .post("/todos")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Write tests" })
      .expect(201);

    expect(createResponse.body.title).toBe("Write tests");
    expect(createResponse.body.status).toBe("todo");

    const listResponse = await request(app.server)
      .get("/todos")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(listResponse.body.items)).toBe(true);
    expect(listResponse.body.items.length).toBe(1);
  });

  it("updates and deletes todos", async () => {
    const token = await signupAndGetToken(app, "update@example.com");
    const createResponse = await request(app.server)
      .post("/todos")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Ship" })
      .expect(201);

    const todoId = createResponse.body.id as number;

    const updateResponse = await request(app.server)
      .put(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "done" })
      .expect(200);

    expect(updateResponse.body.status).toBe("done");

    await request(app.server)
      .delete(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    const listResponse = await request(app.server)
      .get("/todos")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(listResponse.body.items.length).toBe(0);
  });
});
