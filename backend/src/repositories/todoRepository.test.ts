import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import {
  createTodo,
  listTodosByUserId,
  findTodoByIdForUser,
  updateTodo,
  deleteTodo,
} from "./todoRepository.js";
import { createUser } from "./userRepository.js";

const prisma = new PrismaClient();

describe("todoRepository", () => {
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

  it("ユーザーごとにTodoを一覧できる", async () => {
    const userA = await createUser({
      email: "a@example.com",
      passwordHash: "hash",
      passwordSalt: "salt",
    });
    const userB = await createUser({
      email: "b@example.com",
      passwordHash: "hash",
      passwordSalt: "salt",
    });

    const first = await createTodo(userA.id, "First");
    const second = await createTodo(userA.id, "Second");
    await createTodo(userB.id, "Other");

    const items = await listTodosByUserId(userA.id);

    expect(items.map((item) => item.id)).toEqual([first.id, second.id]);
    expect(items.map((item) => item.title)).toEqual(["First", "Second"]);
  });

  it("ユーザーに紐づくTodoだけを取得できる", async () => {
    const userA = await createUser({
      email: "owner@example.com",
      passwordHash: "hash",
      passwordSalt: "salt",
    });
    const userB = await createUser({
      email: "other@example.com",
      passwordHash: "hash",
      passwordSalt: "salt",
    });

    const todo = await createTodo(userA.id, "Owned");

    const found = await findTodoByIdForUser(todo.id, userA.id);
    const other = await findTodoByIdForUser(todo.id, userB.id);

    expect(found?.id).toBe(todo.id);
    expect(other).toBeNull();
  });

  it("Todoを更新できる", async () => {
    const user = await createUser({
      email: "update@example.com",
      passwordHash: "hash",
      passwordSalt: "salt",
    });
    const todo = await createTodo(user.id, "Old");

    const updated = await updateTodo(todo.id, {
      title: "New",
      status: "done",
      doneAt: new Date("2024-01-01T00:00:00Z"),
    });

    expect(updated.title).toBe("New");
    expect(updated.status).toBe("done");
    expect(updated.doneAt).toEqual(new Date("2024-01-01T00:00:00Z"));
  });

  it("Todoを削除できる", async () => {
    const user = await createUser({
      email: "delete@example.com",
      passwordHash: "hash",
      passwordSalt: "salt",
    });
    const todo = await createTodo(user.id, "Delete");

    await deleteTodo(todo.id);

    const remaining = await listTodosByUserId(user.id);
    expect(remaining.length).toBe(0);
  });
});
