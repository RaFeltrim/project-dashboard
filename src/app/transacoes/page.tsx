"use client";

import { trpc } from "../../lib/trpc";
import { useSession } from "next-auth/react";
import { SEED_USER_ID } from "../../lib/constants";

export default function TransacoesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? SEED_USER_ID;

  const { data: transactions, refetch, isLoading } = trpc.transaction.getAll.useQuery(
    { userId, take: 100 },
    { enabled: !!userId }
  );

  const deleteTransaction = trpc.transaction.delete.useMutation({
    onSuccess: () => refetch(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
          <span className="w-4 h-4 rounded-full bg-blue-500"></span>
          Gestão de Transações
        </h1>
        <p className="text-slate-400 mt-1">Histórico completo dos últimos lançamentos de todos os motores.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th scope="col" className="px-6 py-4">Data</th>
                <th scope="col" className="px-6 py-4">Descrição Original</th>
                <th scope="col" className="px-6 py-4">Valor (R$)</th>
                <th scope="col" className="px-6 py-4">Motor</th>
                <th scope="col" className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Carregando transações...
                  </td>
                </tr>
              ) : transactions && transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(tx.occurredAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {tx.rawDescription}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${Number(tx.amount) > 0 ? 'bg-green-950/50 text-green-400' : 'bg-red-950/50 text-red-400'}`}>
                        R$ {Math.abs(Number(tx.amount)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs border border-slate-700">
                        {tx.motor}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteTransaction.mutate({ id: tx.id })}
                        className="text-red-400 hover:text-red-300 font-medium transition-colors"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
