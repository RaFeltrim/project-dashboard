"use client";

import { useState } from "react";
import { trpc } from "../../../lib/trpc";
import { useSession } from "next-auth/react";
import { SEED_USER_ID } from "../../../lib/constants";

export default function MercadoPagoPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? SEED_USER_ID;

  const { data: config, refetch } = trpc.mercadoPago.getConfig.useQuery(
    { userId },
    { enabled: !!userId }
  );

  const [tokenInput, setTokenInput] = useState("");
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const saveConfig = trpc.mercadoPago.saveConfig.useMutation({
    onSuccess: () => {
      refetch();
      setTokenInput("");
      alert("Token salvo com sucesso!");
    },
  });

  const sync = trpc.mercadoPago.sync.useMutation({
    onSuccess: (data) => {
      refetch();
      setSyncStatus(`Sincronização concluída! ${data.count} transações novas importadas.`);
    },
    onError: (err) => {
      setSyncStatus(`Erro: ${err.message}`);
    }
  });

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput || !userId) return;
    saveConfig.mutate({ userId, accessToken: tokenInput });
  };

  const handleSync = () => {
    if (!userId) return;
    setSyncStatus(null);
    sync.mutate({ userId });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
          <span className="w-4 h-4 rounded-full bg-blue-500"></span>
          Motor 1: Mercado Pago
        </h1>
        <p className="text-slate-400 mt-1">
          Integração via API Oficial. Configure seu Access Token para puxar suas movimentações automaticamente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm h-fit">
          <h2 className="text-xl font-semibold mb-4 text-slate-200">Configuração de Acesso</h2>
          
          <div className="mb-6 p-4 bg-slate-950 rounded-lg border border-slate-800">
            <p className="text-sm text-slate-400">Status atual da conexão:</p>
            {config?.accessToken ? (
              <div className="flex items-center gap-2 mt-2">
                <span className="flex w-3 h-3 bg-emerald-500 rounded-full"></span>
                <span className="text-emerald-400 font-medium">Conectado</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                <span className="flex w-3 h-3 bg-slate-600 rounded-full"></span>
                <span className="text-slate-400 font-medium">Não configurado</span>
              </div>
            )}
            
            {config?.lastSyncAt && (
              <p className="text-xs text-slate-500 mt-2">
                Última sincronização: {new Date(config.lastSyncAt).toLocaleString()}
              </p>
            )}
          </div>

          <form onSubmit={handleSaveToken} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Access Token (PROD_ACCESS_TOKEN)</label>
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="APP_USR-..."
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Crie uma aplicação no Painel de Desenvolvedores do Mercado Pago para obter o token.</p>
            </div>
            <button
              type="submit"
              disabled={saveConfig.isPending}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {saveConfig.isPending ? "Salvando..." : "Salvar Configuração"}
            </button>
          </form>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-slate-200">Sincronização Manual</h2>
          <p className="text-slate-400 text-sm mb-6">
            O Motor 1 busca automaticamente as transações dos últimos 30 dias que tenham status "aprovado". 
            Transações já importadas são ignoradas para evitar duplicidade.
          </p>

          <button
            onClick={handleSync}
            disabled={sync.isPending || !config?.accessToken}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-4 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            {sync.isPending ? (
              <span>Sincronizando... Isso pode levar alguns segundos.</span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Buscar Transações Agora
              </>
            )}
          </button>

          {syncStatus && (
            <div className={`mt-4 p-4 rounded-md text-sm ${syncStatus.includes("Erro") ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
              {syncStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
