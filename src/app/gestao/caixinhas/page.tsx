"use client";

import { useState } from "react";
import { trpc } from "../../../lib/trpc";
import { useSession } from "next-auth/react";

import { SEED_USER_ID } from "../../../lib/constants";

export default function CaixinhasPage() {
  const { data: session } = useSession();
  const utils = trpc.useUtils();

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState<number | "">("");

  const [activeVault, setActiveVault] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<number | "">("");
  
  const userId = session?.user?.id ?? SEED_USER_ID;

  const vaultsQuery = trpc.vault.getAll.useQuery({ userId }, {
    enabled: !!userId,
  });

  const createVault = trpc.vault.create.useMutation({
    onSuccess: () => {
      utils.vault.getAll.invalidate();
      setIsCreating(false);
      setNewName("");
      setNewTarget("");
    },
    onError: (err) => {
      alert("Erro ao criar caixinha: " + err.message);
    }
  });

  const addFunds = trpc.vault.addFunds.useMutation({
    onSuccess: () => {
      utils.vault.getAll.invalidate();
      setActiveVault(null);
      setDepositAmount("");
      alert("Aporte realizado com sucesso!");
    },
    onError: (err) => {
      alert("Erro ao aportar: " + err.message);
    }
  });

  const handleCreate = () => {
    if (!newName) return;
    createVault.mutate({
      userId,
      name: newName,
      targetAmount: newTarget ? Number(newTarget) : undefined,
    });
  };

  const handleDeposit = (id: string) => {
    if (!depositAmount || Number(depositAmount) <= 0) return;
    addFunds.mutate({
      id,
      userId,
      amount: Number(depositAmount),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            <span className="w-4 h-4 rounded-full bg-emerald-500"></span>
            Gestão de Caixinhas
          </h1>
          <p className="text-slate-400 mt-1">
            Simule o comportamento de cofres (Caixinhas). Guarde dinheiro e atrele abates na revisão de faturas.
          </p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
        >
          + Nova Caixinha
        </button>
      </div>

      {isCreating && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-6 shadow-md mb-6 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-xl font-semibold mb-4 text-emerald-400">Criar Nova Caixinha</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nome da Caixinha (ex: Reserva de Emergência)</label>
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Meta Financeira (Opcional) R$</label>
              <input 
                type="number" 
                value={newTarget}
                onChange={(e) => setNewTarget(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button 
              onClick={() => setIsCreating(false)}
              className="text-slate-400 hover:text-slate-300 px-4 py-2"
            >
              Cancelar
            </button>
            <button 
              onClick={handleCreate}
              disabled={createVault.isPending || !newName}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              {createVault.isPending ? "Criando..." : "Salvar Caixinha"}
            </button>
          </div>
        </div>
      )}

      {vaultsQuery.isLoading ? (
        <div className="text-emerald-400 animate-pulse text-center py-10">Carregando Caixinhas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaultsQuery.data?.map(vault => {
            const balance = Number(vault.balance);
            const target = vault.targetAmount ? Number(vault.targetAmount) : null;
            const progress = target ? Math.min(100, Math.round((balance / target) * 100)) : 0;

            return (
              <div key={vault.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-6 shadow-sm transition-all flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-slate-200">{vault.name}</h3>
                  <div className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded font-medium">Ativa</div>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-slate-400 mb-1">Saldo Atual</p>
                  <p className="text-3xl font-bold text-white">R$ {balance.toFixed(2)}</p>
                </div>

                {target && (
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                      <span>Progresso da Meta</span>
                      <span>{progress}% de R$ {target.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                )}

                <div className="mt-auto">
                  {activeVault === vault.id ? (
                    <div className="bg-slate-950 rounded-lg p-3 border border-emerald-500/50">
                      <label className="block text-xs text-slate-400 mb-1">Valor do Aporte (R$)</label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none"
                        />
                        <button 
                          onClick={() => handleDeposit(vault.id)}
                          disabled={addFunds.isPending}
                          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-3 py-1 rounded font-medium text-sm"
                        >
                          OK
                        </button>
                        <button 
                          onClick={() => setActiveVault(null)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded text-sm"
                        >
                          X
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setActiveVault(vault.id); setDepositAmount(""); }}
                      className="w-full border border-emerald-600/50 text-emerald-400 hover:bg-emerald-500/10 font-medium py-2 rounded-md transition-colors"
                    >
                      Guardar Dinheiro
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {vaultsQuery.data?.length === 0 && (
            <div className="col-span-full bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-10 text-center">
              <p className="text-slate-400 mb-4">Você ainda não tem nenhuma caixinha.</p>
              <button 
                onClick={() => setIsCreating(true)}
                className="text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Criar a minha primeira
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
