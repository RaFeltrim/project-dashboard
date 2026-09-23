"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Credenciais inválidas. Verifique seu e-mail e senha.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Ocorreu um erro ao tentar entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (userEmail: string) => {
    setEmail(userEmail);
    // Não preenche a senha automaticamente por segurança
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Finance Hub
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Entre para gerenciar suas finanças com zero fricção
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            {loading ? "Entrando..." : "Entrar no Finance Hub"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-400 font-medium mb-3 text-center">
            Perfis de Acesso Rápido:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("rafeltrim@gmail.com")}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors cursor-pointer text-left ${
                email === "rafeltrim@gmail.com"
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                  : "border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="font-semibold text-slate-200">Rafael Feltrim</div>
              <div className="text-[10px] text-indigo-400">Admin</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("gustavo@gmail.com")}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors cursor-pointer text-left ${
                email === "gustavo@gmail.com"
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                  : "border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="font-semibold text-slate-200">Gustavo Contiero</div>
              <div className="text-[10px] text-slate-400">Rateio Casa</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
