import { useState } from "react";
import { login, signup } from "../../api/client";
import { useAuthStore } from "../../store/auth";

type Mode = "login" | "signup";

const highlights = [
  "JWTで安全に認証",
  "TODOはユーザーごとに分離",
  "最小構成で学ぶログイン体験",
];

export default function AuthScreen() {
  const { setAuth } = useAuthStore();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = { email: email.trim(), password };
      const response = mode === "login" ? await login(payload) : await signup(payload);
      setAuth(response.token, response.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#0b0f12] text-slate-100"
      style={{
        background:
          "radial-gradient(900px circle at 15% 15%, rgba(255, 184, 92, 0.22), transparent 60%), radial-gradient(900px circle at 85% 10%, rgba(88, 214, 197, 0.25), transparent 60%), #0b0f12",
      }}
    >
      <div className="mx-auto grid min-h-screen w-full max-w-5xl grid-cols-1 gap-10 px-6 py-14 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-center gap-6">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-200/80">
            Phase 5 Auth
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-slate-100 sm:text-5xl">
            私だけのTODO空間に
            <span className="block text-amber-200">ログインする。</span>
          </h1>
          <p className="max-w-xl text-base text-slate-300">
            シンプルな認証だけど、API・トークン・権限の流れを学べる実装。
            ログインからデータ取得までの一連を体験しよう。
          </p>
          <div className="grid gap-3 text-sm text-slate-300">
            {highlights.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Welcome</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-100">
                  {mode === "login" ? "Login" : "Create Account"}
                </h2>
              </div>
              <div className="flex rounded-full border border-slate-800 bg-slate-900/60 p-1 text-xs">
                {(["login", "signup"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMode(value)}
                    className={`rounded-full px-3 py-1 transition ${
                      mode === value
                        ? "bg-amber-300 text-slate-950"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {value === "login" ? "Login" : "Sign up"}
                  </button>
                ))}
              </div>
            </div>

            <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-amber-300"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="minimum 8 characters"
                  className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-amber-300"
                  required
                  minLength={8}
                />
              </label>

              {error && (
                <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 rounded-2xl bg-amber-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Processing..." : mode === "login" ? "Login" : "Sign up"}
              </button>
            </form>

            <p className="mt-6 text-xs text-slate-500">
              This is a practice screen. Use any email and an 8+ character password.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
