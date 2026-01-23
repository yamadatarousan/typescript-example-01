import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const dataFilePath = resolve("./data/todos.json");

type TodoStatus = "todo" | "done";

type Todo = {
  id: number;
  title: string;
  status: TodoStatus;
  createdAt: string;
  doneAt?: string;
};

type TodoList = {
  nextId: number;
  items: Todo[];
};

type Command = "add" | "list" | "done" | "remove" | "clear" | "help";

type ParsedArgs = {
  command: Command;
  rest: string[];
};

const defaultList: TodoList = { nextId: 1, items: [] };

async function loadTodos(): Promise<TodoList> {
  try {
    const raw = await readFile(dataFilePath, "utf-8");
    const parsed = JSON.parse(raw) as TodoList;
    if (
      !parsed ||
      !Array.isArray(parsed.items) ||
      typeof parsed.nextId !== "number"
    ) {
      return { ...defaultList };
    }
    return parsed;
  } catch {
    return { ...defaultList };
  }
}

async function saveTodos(list: TodoList): Promise<void> {
  const json = JSON.stringify(list, null, 2);
  await writeFile(dataFilePath, `${json}\n`, "utf-8");
}

function parseArgs(argv: string[]): ParsedArgs {
  const [command, ...rest] = argv;

  if (
    command === "add" ||
    command === "list" ||
    command === "done" ||
    command === "remove" ||
    command === "clear" ||
    command === "help"
  ) {
    return { command, rest };
  }

  return { command: "help", rest: [] };
}

function printHelp(): void {
  console.log("Usage:");
  console.log("  npm run dev -- src/index.ts add <title>");
  console.log("  npm run dev -- src/index.ts list");
  console.log("  npm run dev -- src/index.ts done <id>");
  console.log("  npm run dev -- src/index.ts remove <id>");
  console.log("  npm run dev -- src/index.ts clear");
}

function formatTodo(todo: Todo): string {
  const status = todo.status === "done" ? "[x]" : "[ ]";
  return `${status} ${todo.id}: ${todo.title}`;
}

function parseId(input: string | undefined): number | null {
  if (!input) return null;
  const id = Number.parseInt(input, 10);
  return Number.isNaN(id) ? null : id;
}

async function addTodo(rest: string[]): Promise<void> {
  const title = rest.join(" ").trim();
  if (!title) {
    console.log("Title is required.");
    return;
  }

  const list = await loadTodos();
  const now = new Date().toISOString();
  const todo: Todo = {
    id: list.nextId,
    title,
    status: "todo",
    createdAt: now,
  };

  list.items.push(todo);
  list.nextId += 1;
  await saveTodos(list);

  console.log("Added:", formatTodo(todo));
}

async function listTodos(): Promise<void> {
  const list = await loadTodos();
  if (list.items.length === 0) {
    console.log("No todos yet.");
    return;
  }

  list.items.forEach((todo) => console.log(formatTodo(todo)));
}

async function doneTodo(rest: string[]): Promise<void> {
  const id = parseId(rest[0]);
  if (id === null) {
    console.log("ID is required.");
    return;
  }

  const list = await loadTodos();
  const target = list.items.find((todo) => todo.id === id);
  if (!target) {
    console.log(`Todo ${id} not found.`);
    return;
  }

  if (target.status === "done") {
    console.log("Already done:", formatTodo(target));
    return;
  }

  target.status = "done";
  target.doneAt = new Date().toISOString();
  await saveTodos(list);

  console.log("Done:", formatTodo(target));
}

async function removeTodo(rest: string[]): Promise<void> {
  const id = parseId(rest[0]);
  if (id === null) {
    console.log("ID is required.");
    return;
  }

  const list = await loadTodos();
  const before = list.items.length;
  list.items = list.items.filter((todo) => todo.id !== id);

  if (list.items.length === before) {
    console.log(`Todo ${id} not found.`);
    return;
  }

  await saveTodos(list);
  console.log(`Removed todo ${id}.`);
}

async function clearTodos(): Promise<void> {
  const list = await loadTodos();
  list.items = [];
  list.nextId = 1;
  await saveTodos(list);
  console.log("Cleared all todos.");
}

async function main(): Promise<void> {
  const { command, rest } = parseArgs(process.argv.slice(2));

  switch (command) {
    case "add":
      await addTodo(rest);
      break;
    case "list":
      await listTodos();
      break;
    case "done":
      await doneTodo(rest);
      break;
    case "remove":
      await removeTodo(rest);
      break;
    case "clear":
      await clearTodos();
      break;
    default:
      printHelp();
  }
}

main().catch((error: unknown) => {
  console.error("Unexpected error:", error);
  process.exitCode = 1;
});
