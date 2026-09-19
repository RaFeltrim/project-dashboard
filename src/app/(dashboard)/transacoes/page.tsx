"use client";

import { useState } from "react";
import { trpc } from "../../../lib/trpc";
import { useSession } from "next-auth/react";

import { MotorType } from "@prisma/client";

type SortBy = "date" | "description" | "amount" | "motor";
type SortOrder = "asc" | "desc";

export default function TransacoesPage() {
  const { data: session } = useSession();
  

  const [motorFilter, setMotorFilter] = useState<MotorType | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const { data: transactions, refetch, isLoading } = trpc.transaction.getAll.useQuery(
    { 
      take: 100,
      motor: motorFilter !== "ALL" ? motorFilter : undefined,
      search,
      sortBy,
      sortOrder
    },
    { enabled: !!session?.user }
  );

  const deleteTransaction = trpc.transaction.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const handleSort = (column: SortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc"); // Default to desc when changing column (makes sense for date/amount)
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
          <span className="w-4 h-4 rounded-full bg-blue-500"></span>
          Gestão de Transações
        </h1>
        <p className="text-slate-400 mt-1">Histórico completo dos últimos lançamentos de todos os motores.</p>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            value={motorFilter}
            onChange={(e) => setMotorFilter(e.target.value as MotorType | "ALL")}
            className="bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Todos os Motores</option>
            <option value="MERCADO_PAGO">Mercado Pago</option>
            <option value="SANTANDER">Santander</option>
            <option value="NUBANK_RATEIO">Nubank Mãe</option>
            <option value="CARTAO_TIA">Cartão Tia (AP)</option>
          </select>
          <input 
            type="text" 
            placeholder="Buscar por descrição..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64 bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-slate-800/50" onClick={() => handleSort("date")}>
                  Data {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-slate-800/50" onClick={() => handleSort("description")}>
                  Descrição Original {sortBy === "description" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-slate-800/50" onClick={() => handleSort("amount")}>
                  Valor (R$) {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-slate-800/50" onClick={() => handleSort("motor")}>
                  Motor {sortBy === "motor" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
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
              ) : transactions?.items && transactions.items.length > 0 ? (
                transactions.items.map((tx) => (
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
