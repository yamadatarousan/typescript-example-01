import request from "supertest";
import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import { PrismaClient } from "@prisma/client";
import { buildApp } from "./server.js";

const password = "password123";

async function signupAndGetToken(
  app: ReturnType<typeof buildApp>,
  email: string,
) {
  const response = await request(app.server)
    .post("/auth/signup")
    .send({ email, password })
    .expect(201);

  return response.body.token as string;
}

describe("Todo API（DB）", () => {
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

  it("サインアップとログインができる", async () => {
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

  it("不正な認証を拒否する", async () => {
    await request(app.server)
      .post("/auth/signup")
      .send({ email: "dup@example.com", password })
      .expect(201);

    await request(app.server)
      .post("/auth/signup")
      .send({ email: "dup@example.com", password })
      .expect(409);

    await request(app.server)
      .post("/auth/login")
      .send({ email: "dup@example.com", password: "wrong-pass" })
      .expect(401);

    await request(app.server)
      .post("/auth/login")
      .send({ email: "missing@example.com", password })
      .expect(401);
  });

  it("認証の入力バリデーションを拒否する", async () => {
    await request(app.server)
      .post("/auth/signup")
      .send({ email: "invalid-email", password: "short" })
      .expect(400);

    await request(app.server)
      .post("/auth/login")
      .send({ email: "invalid-email", password: "short" })
      .expect(400);
  });

  it("Todo操作に認証が必要", async () => {
    await request(app.server).get("/todos").expect(401);

    await request(app.server)
      .post("/todos")
      .send({ title: "No auth" })
      .expect(401);

    await request(app.server)
      .put("/todos/1")
      .send({ status: "done" })
      .expect(401);

    await request(app.server).delete("/todos/1").expect(401);
  });

  it("他ユーザーのTodoは操作できない", async () => {
    const tokenA = await signupAndGetToken(app, "owner@example.com");
    const tokenB = await signupAndGetToken(app, "other@example.com");

    const created = await request(app.server)
      .post("/todos")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "Owner task" })
      .expect(201);

    const todoId = created.body.id as number;

    await request(app.server)
      .put(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ status: "done" })
      .expect(404);

    await request(app.server)
      .delete(`/todos/${todoId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(404);
  });

  it("Todoを作成して一覧取得できる", async () => {
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

  it("Todo作成の入力バリデーションを拒否する", async () => {
    const token = await signupAndGetToken(app, "invalid-create@example.com");
    await request(app.server)
      .post("/todos")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "" })
      .expect(400);
  });

  it("Todoを更新・削除できる", async () => {
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

  it("Todo更新の入力バリデーションを拒否する", async () => {
    const token = await signupAndGetToken(app, "invalid-update@example.com");

    await request(app.server)
      .put("/todos/invalid")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "done" })
      .expect(400);

    await request(app.server)
      .put("/todos/1")
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .expect(400);

    await request(app.server)
      .put("/todos/1")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "invalid" })
      .expect(400);
  });

  it("Todo削除の不正なIDを拒否する", async () => {
    const token = await signupAndGetToken(app, "invalid-delete@example.com");

    await request(app.server)
      .delete("/todos/invalid")
      .set("Authorization", `Bearer ${token}`)
      .expect(400);
  });
});
