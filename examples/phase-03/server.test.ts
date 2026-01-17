import request from "supertest";
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { buildApp } from "./server.js";

describe("todos api", () => {
  const app = buildApp();

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
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
  });
});
