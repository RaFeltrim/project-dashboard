"use client";

import { useState } from "react";
import { trpc } from "../../../lib/trpc";
import { useSession } from "next-auth/react";
import { SEED_USER_ID } from "../../../lib/constants";

export default function CartaoTiaPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? SEED_USER_ID;

  const { data: charges, refetch } = trpc.recurringCharge.getAll.useQuery(
    { userId },
    { enabled: !!userId }
  );

  const createCharge = trpc.recurringCharge.create.useMutation({
    onSuccess: () => {
      refetch();
      // Reset form or show success state
    },
  });

  const createInstallments = trpc.transaction.createInstallments.useMutation({
    onSuccess: () => {
      alert("Parcelas criadas com sucesso! Elas aparecerão no seu Dashboard.");
    }
  });

  const updateInstallment = trpc.recurringCharge.updateInstallment.useMutation({
    onSuccess: () => refetch(),
  });

  const toggleActive = trpc.recurringCharge.toggleActive.useMutation({
    onSuccess: () => refetch(),
  });

  const deleteCharge = trpc.recurringCharge.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("10");
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentsCount, setInstallmentsCount] = useState("1");
  const [currentInstallmentInput, setCurrentInstallmentInput] = useState("1");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !description || !amount) return;

    if (isInstallment) {
      createCharge.mutate({
        userId,
        description,
        amount: parseFloat(amount),
        dayOfMonth: parseInt(dayOfMonth),
        isInstallment: true,
        installmentTotal: parseInt(installmentsCount),
        startsAt: new Date(),
      });
    } else {
      createCharge.mutate({
        userId,
        description,
        amount: parseFloat(amount),
        dayOfMonth: parseInt(dayOfMonth),
        startsAt: new Date(),
      });
    }

    setDescription("");
    setAmount("");
    setInstallmentsCount("1");
    setCurrentInstallmentInput("1");
  };

  const handleAdvance = (charge: any, delta: number) => {
    const currentIndex = charge.installmentIndex || 1;
    const newIndex = Math.min((charge.installmentTotal || 1), Math.max(1, currentIndex + delta));
    updateInstallment.mutate({
      id: charge.id,
      userId,
      newCurrentIndex: newIndex,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
          <span className="w-4 h-4 rounded-full bg-yellow-500"></span>
          Motor 4: Cartão Tia
        </h1>
        <p className="text-slate-400 mt-1">
          Lançamentos do cartão da tia: insira compras fixas ou parceladas com adiantamento e controle da parcela atual.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm sticky top-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-200">Novo Lançamento</h2>
            
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => setIsInstallment(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!isInstallment ? 'bg-yellow-600/20 text-yellow-500 border border-yellow-600/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                Recorrente (Fixo)
              </button>
              <button
                type="button"
                onClick={() => setIsInstallment(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${isInstallment ? 'bg-yellow-600/20 text-yellow-500 border border-yellow-600/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                Parcelado
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Compra Sofá ou Fone de Ouvido"
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Valor da Parcela (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="120.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Dia Vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>
              </div>

              {isInstallment && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Total de Parcelas a Pagar</label>
                  <input
                    type="number"
                    min="1"
                    max="72"
                    value={installmentsCount}
                    onChange={(e) => setInstallmentsCount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={createCharge.isPending}
                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-md transition-colors mt-4"
              >
                {createCharge.isPending ? "Salvando..." : "Salvar Lançamento"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-800">
              <h2 className="text-xl font-semibold text-slate-200">Lançamentos do Cartão Tia</h2>
            </div>
            
            {charges?.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                Nenhum lançamento no cartão da tia ainda.
              </div>
            ) : (
              <ul className="divide-y divide-slate-800">
                {charges?.map((charge) => (
                  <li key={charge.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex flex-col items-center justify-center text-yellow-500 font-bold shrink-0">
                        <span className="text-xs">Dia</span>
                        <span className="text-sm">{charge.dayOfMonth}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-200 text-base">{charge.description}</p>
                          {charge.isInstallment && (
                            <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400 font-semibold">
                              Parcela {charge.installmentIndex || 1}/{charge.installmentTotal || 1}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          R$ {Number(charge.amount).toFixed(2)} {charge.isInstallment ? "por mês" : "recorrente"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
                      {charge.isInstallment && (
                        <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          <span className="text-xs text-slate-400 mr-1">Adiantar:</span>
                          <button
                            type="button"
                            onClick={() => handleAdvance(charge, 1)}
                            disabled={updateInstallment.isPending || (charge.installmentIndex || 1) >= (charge.installmentTotal || 1)}
                            className="bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-400 text-xs px-2 py-1 rounded transition-colors disabled:opacity-30"
                            title="Avançar 1 parcela"
                          >
                            +1 Parcela
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => toggleActive.mutate({ id: charge.id, userId, active: !charge.active })}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                          charge.active
                            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        {charge.active ? "Ativo" : "Quitado/Pausado"}
                      </button>
                      <button
                        onClick={() => deleteCharge.mutate({ id: charge.id, userId })}
                        className="text-red-400 hover:text-red-300 p-2"
                        title="Remover"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
