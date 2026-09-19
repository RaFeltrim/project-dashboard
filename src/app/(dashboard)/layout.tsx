import { getServerSession } from "next-auth/next";
import { authOptions } from "../../server/auth";
import Link from "next/link";
import { LogoutButton } from "../../components/LogoutButton";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  
  return (
    <>
      {/* Sidebar Minimalista */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4 space-y-6 shrink-0 h-screen">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Finance Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">Automação sem estresse</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          <Link href="/" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm text-slate-200">
            Dashboard Home
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Motores</p>
          </div>
          <Link href="/motores/mercado-pago" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm text-blue-400 border-l-2 border-transparent hover:border-blue-400">
            Mercado Pago
          </Link>
          <Link href="/motores/santander" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm text-red-400 border-l-2 border-transparent hover:border-red-400">
            Santander Parse
          </Link>
          <Link href="/motores/nubank-rateio" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm text-purple-400 border-l-2 border-transparent hover:border-purple-400">
            Nubank (Mãe)
          </Link>
          <Link href="/motores/cartao-tia" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm text-yellow-400 border-l-2 border-transparent hover:border-yellow-400">
            Cartão Tia
          </Link>

          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Gestão</p>
          </div>
          <Link href="/transacoes" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm text-slate-300">
            Transações
          </Link>
          <Link href="/gestao/caixinhas" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm text-emerald-400 border-l-2 border-transparent hover:border-emerald-400">
            Caixinhas (Cofres)
          </Link>
          <Link href="/categorias" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm text-slate-300">
            Categorias
          </Link>
          <Link href="/fontes" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm text-slate-300">
            Contas
          </Link>
        </nav>

        <div className="pt-4 border-t border-slate-800">
          {/* Espaço para Info do Usuário */}
          <div className="px-3 py-2 text-sm text-slate-400 flex justify-between items-center">
            <span>{session?.user?.name || session?.user?.email || "Usuário"}</span>
            {session && <LogoutButton />}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-8 h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </>
  );
}
