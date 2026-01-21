import AuthScreen from "./features/auth/AuthScreen";
import TodoApp from "./features/todos/TodoApp";
import { useAuthStore } from "./store/auth";

// 画面全体はTodo機能に委譲する
export default function App() {
  const { token, user } = useAuthStore();

  if (!token || !user) {
    return <AuthScreen />;
  }

  return <TodoApp />;
}
