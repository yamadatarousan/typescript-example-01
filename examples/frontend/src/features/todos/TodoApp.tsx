import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTodo,
  deleteTodo,
  fetchTodos,
  updateTodoStatus,
  updateTodoTitle,
} from "../../api/client";
import type { Todo } from "../../types/todo";
import { useTodoFilterStore } from "../../store/todoFilter";

function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  return value.slice(0, 10);
}

export default function TodoApp() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const { filter, setFilter } = useTodoFilterStore();

  const todosQuery = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "todo" | "done" }) =>
      updateTodoStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const updateTitleMutation = useMutation({
    mutationFn: ({ id, title: nextTitle }: { id: number; title: string }) =>
      updateTodoTitle(id, nextTitle),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const filteredTodos = useMemo(() => {
    const items = todosQuery.data ?? [];
    if (filter === "all") return items;
    return items.filter((todo) => todo.status === filter);
  }, [todosQuery.data, filter]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    createMutation.mutate(trimmed, {
      onSuccess: () => setTitle(""),
    });
  }

  function handleToggle(todo: Todo) {
    const nextStatus = todo.status === "done" ? "todo" : "done";
    updateStatusMutation.mutate({ id: todo.id, status: nextStatus });
  }

  function handleEdit(todo: Todo) {
    const nextTitle = window.prompt("New title", todo.title);
    if (!nextTitle) return;
    updateTitleMutation.mutate({ id: todo.id, title: nextTitle });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Phase 5</p>
          <h1 className="text-4xl font-semibold">TODO Frontend</h1>
          <p className="text-slate-400">
            React + Vite + TanStack Query + Zustand でAPI連携する。
          </p>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/30">
          <form className="flex flex-col gap-3 md:flex-row" onSubmit={handleSubmit}>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="次のTODOを書いて追加"
              className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-cyan-400"
            />
            <button
              type="submit"
              className="rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-cyan-300"
              disabled={createMutation.isPending}
            >
              Add
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            {(["all", "todo", "done"] as const).map((value) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`rounded-full border px-4 py-1 text-sm transition ${
                  filter === value
                    ? "border-cyan-400 bg-cyan-400 text-slate-950"
                    : "border-slate-700 text-slate-300 hover:border-cyan-400"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-4">
          {todosQuery.isLoading && <p className="text-slate-400">Loading...</p>}
          {todosQuery.isError && (
            <p className="text-red-300">{(todosQuery.error as Error).message}</p>
          )}

          {filteredTodos.map((todo) => (
            <article
              key={todo.id}
              className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100">{todo.title}</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Status: {todo.status} · Created: {formatDate(todo.createdAt)} · Done: {formatDate(todo.doneAt)}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-cyan-400"
                    onClick={() => handleToggle(todo)}
                  >
                    {todo.status === "done" ? "Undone" : "Done"}
                  </button>
                  <button
                    className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-cyan-400"
                    onClick={() => handleEdit(todo)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-full border border-red-400/40 px-3 py-1 text-xs text-red-200 hover:border-red-300"
                    onClick={() => deleteMutation.mutate(todo.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}

          {!todosQuery.isLoading && filteredTodos.length === 0 && (
            <p className="text-slate-400">No todos yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
