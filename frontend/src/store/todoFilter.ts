import { create } from "zustand";

// Todo一覧の表示フィルタ
type Filter = "all" | "todo" | "done";

type TodoFilterState = {
  filter: Filter;
  // フィルタの更新関数
  setFilter: (filter: Filter) => void;
};

// フィルタ状態を共有するストア
export const useTodoFilterStore = create<TodoFilterState>((set) => ({
  filter: "all",
  setFilter: (filter) => set({ filter }),
}));
