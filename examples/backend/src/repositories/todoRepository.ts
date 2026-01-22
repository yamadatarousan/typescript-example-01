import type { Prisma, Todo } from "@prisma/client";
import { prisma } from "../infrastructure/prismaClient.js";

export async function listTodosByUserId(userId: number): Promise<Todo[]> {
  return prisma.todo.findMany({ where: { userId }, orderBy: { id: "asc" } });
}

export async function createTodo(userId: number, title: string): Promise<Todo> {
  return prisma.todo.create({ data: { title, userId } });
}

export async function findTodoByIdForUser(
  id: number,
  userId: number,
): Promise<Todo | null> {
  return prisma.todo.findFirst({ where: { id, userId } });
}

export async function updateTodo(
  id: number,
  data: Prisma.TodoUpdateInput,
): Promise<Todo> {
  return prisma.todo.update({ where: { id }, data });
}

export async function deleteTodo(id: number): Promise<void> {
  await prisma.todo.delete({ where: { id } });
}
