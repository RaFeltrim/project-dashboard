"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { LogoutButton } from "../components/LogoutButton";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <body className="bg-slate-950 text-slate-100 antialiased h-screen flex overflow-hidden">
      {/* Sidebar Minimalista */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4 space-y-6 shrink-0">
        <div className="px-3 py-2">
          <h2 className="text-sm font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Finance Hub
          </h2>
          <p className="text-[10px] text-slate-500 mt-0.5">Automação sem estresse</p>
        </div>
        <nav className="flex flex-col space-y-1">
          <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Dashboard</p>
          <Link href="/" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm text-slate-300">
            Dashboard Home
          </Link>

          <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-3 mb-1">Motores</p>
          <Link href="/motores/mercado-pago" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm text-slate-300">
            Mercado Pago
          </Link>
          <Link href="/motores/santander" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm text-slate-300">
            Santander Parse
          </Link>
          <Link href="/motores/nubank-rateio" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm text-slate-300">
            Nubank (Mae)
          </Link>
          <Link href="/motores/cartao-tia" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm text-slate-300">
            Cartao Tia
          </Link>

          <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-3 mb-1">Gestao</p>
          <Link href="/transacoes" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm text-slate-300">
            Transacoes
          </Link>
          <Link href="/gestao/caixinhas" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm text-slate-300">
            Caixinhas (Cofres)
          </Link>
          <Link href="/categorias" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm text-slate-300">
            Categorias
          </Link>
          <Link href="/fontes" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm text-slate-300">
            Contas
          </Link>
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-800">
          <div className="px-3 py-2 text-sm text-slate-400 flex justify-between items-center">
            <span className="truncate">{session?.user?.name || session?.user?.email || "Usuario"}</span>
            {session && <LogoutButton />}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </body>
  );
}
