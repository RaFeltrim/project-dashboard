"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

// O PluggyConnect carrega client-side apenas
const PluggyConnect = dynamic(
  () => import("react-pluggy-connect").then((mod) => mod.PluggyConnect),
  { ssr: false }
);

export default function MercadoPagoPage() {
  const { data: session } = useSession();
  const [connectToken, setConnectToken] = useState<string | null>(null);
  const [isPluggyOpen, setIsPluggyOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const loadConnectToken = useCallback(async () => {
    try {
      const res = await fetch("/api/pluggy/token");
      const data = await res.json();
      if (data.accessToken) {
        setConnectToken(data.accessToken);
      }
    } catch (err) {
      console.error("Erro ao carregar token:", err);
    }
  }, []);

  useEffect(() => {
    loadConnectToken();
  }, [loadConnectToken]);

  const handleOpenPluggy = () => {
    if (!connectToken) {
      setStatusMsg("Aguarde a geração do token seguro...");
      return;
    }
    setIsPluggyOpen(true);
  };

  const handlePluggySuccess = async (itemData: any) => {
    setIsPluggyOpen(false);
    setStatusMsg("Banco conectado com sucesso! Sincronizando dados...");
    
    // Salvar o item no nosso banco
    if (session?.user?.id) {
      try {
        await fetch("/api/pluggy/item", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId: itemData.item.id,
            userId: session.user.id
          })
        });
        setStatusMsg("Conta salva! O robô de 24h já começará a processar seus saldos.");
      } catch (err) {
        setStatusMsg("Erro ao salvar conta bancária.");
      }
    }
  };

  const handlePluggyError = (error: any) => {
    setIsPluggyOpen(false);
    setStatusMsg(`Conexão cancelada ou falhou: ${error.message || "Erro desconhecido"}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
          <span className="w-4 h-4 rounded-full bg-blue-500"></span>
          Motor 1: Mercado Pago (Open Finance)
        </h1>
        <p className="text-slate-400 mt-1">
          Integração oficial e segura via Pluggy. Conecte sua conta para atualizar saldos e caixinhas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm h-fit">
          <h2 className="text-xl font-semibold mb-4 text-slate-200">Sincronização Bancária</h2>
          
          <p className="text-sm text-slate-400 mb-6">
            O Pluggy permite uma conexão de leitura segura com seu banco. Nós não temos acesso à sua senha. 
            Uma vez conectado, o sistema puxará o seu saldo e extrato diariamente.
          </p>

          <button
            onClick={handleOpenPluggy}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Conectar com o Mercado Pago
          </button>

          {statusMsg && (
            <div className="mt-4 p-4 rounded-md text-sm bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {statusMsg}
            </div>
          )}

          {isPluggyOpen && connectToken && (
            <PluggyConnect
              connectToken={connectToken}
              includeSandbox={true}
              onSuccess={handlePluggySuccess}
              onError={handlePluggyError}
              onClose={() => setIsPluggyOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
