import { create } from "zustand";

type Filter = "all" | "todo" | "done";

type TodoFilterState = {
  filter: Filter;
  setFilter: (filter: Filter) => void;
};

export const useTodoFilterStore = create<TodoFilterState>((set) => ({
  filter: "all",
  setFilter: (filter) => set({ filter }),
}));
