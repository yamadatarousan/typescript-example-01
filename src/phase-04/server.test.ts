import request from "supertest";
import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import { PrismaClient } from "@prisma/client";
import { buildApp } from "./server.js";

describe("todos api (db)", () => {
  const app = buildApp();
  const prisma = new PrismaClient();

  beforeAll(async () => {
    await prisma.$connect();
    await app.ready();
  });

  beforeEach(async () => {
    await prisma.todo.deleteMany();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it("creates and lists todos", async () => {
    const createResponse = await request(app.server)
      .post("/todos")
      .send({ title: "Write tests" })
      .expect(201);

    expect(createResponse.body.title).toBe("Write tests");
    expect(createResponse.body.status).toBe("todo");

    const listResponse = await request(app.server).get("/todos").expect(200);

    expect(Array.isArray(listResponse.body.items)).toBe(true);
    expect(listResponse.body.items.length).toBe(1);
  });

  it("updates and deletes todos", async () => {
    const createResponse = await request(app.server)
      .post("/todos")
      .send({ title: "Ship" })
      .expect(201);

    const todoId = createResponse.body.id as number;

    const updateResponse = await request(app.server)
      .put(`/todos/${todoId}`)
      .send({ status: "done" })
      .expect(200);

    expect(updateResponse.body.status).toBe("done");

    await request(app.server).delete(`/todos/${todoId}`).expect(204);

    const listResponse = await request(app.server).get("/todos").expect(200);
    expect(listResponse.body.items.length).toBe(0);
  });
});
