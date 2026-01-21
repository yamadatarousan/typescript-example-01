import { create } from "zustand";
import type { AuthUser } from "../types/auth";

const STORAGE_KEY = "todo-auth";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
};

function loadAuth(): { token: string | null; user: AuthUser | null } {
  if (typeof window === "undefined") return { token: null, user: null };
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return { token: null, user: null };
  try {
    const parsed = JSON.parse(raw) as { token?: string; user?: AuthUser };
    if (parsed.token && parsed.user) {
      return { token: parsed.token, user: parsed.user };
    }
  } catch {
    // ignore storage errors
  }
  return { token: null, user: null };
}

function persistAuth(token: string | null, user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (!token || !user) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
}

export const useAuthStore = create<AuthState>((set) => {
  const initial = loadAuth();
  return {
    token: initial.token,
    user: initial.user,
    setAuth: (token, user) => {
      persistAuth(token, user);
      set({ token, user });
    },
    clearAuth: () => {
      persistAuth(null, null);
      set({ token: null, user: null });
    },
  };
});
