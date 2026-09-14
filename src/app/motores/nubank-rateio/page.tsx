"use client";

import { useState } from "react";
import { trpc } from "../../../lib/trpc";
import { useSession } from "next-auth/react";
import { SEED_USER_ID } from "../../../lib/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NubankRateioPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? SEED_USER_ID;

  const [invoiceText, setInvoiceText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [urlInvoiceId, setUrlInvoiceId] = useState<string | null>(null);
  
  const [advancements, setAdvancements] = useState<Record<number, number>>({});
  const [vaultSelections, setVaultSelections] = useState<Record<number, string>>({});

  const router = useRouter();

  const vaultsQuery = trpc.vault.getAll.useQuery({ userId });
  const vaults = vaultsQuery.data || [];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("invoiceId");
      if (id) {
        setUrlInvoiceId(id);
        setIsReviewMode(true);
      }
    }
  }, []);

  const invoiceQuery = trpc.invoice.getParsedInvoice.useQuery(
    { invoiceId: urlInvoiceId || "" },
    {
      enabled: !!urlInvoiceId,
    }
  );

  useEffect(() => {
    if (invoiceQuery.data && invoiceQuery.data.parsedData) {
      setInvoiceId(invoiceQuery.data.id);
      setParsedData(typeof invoiceQuery.data.parsedData === 'string' ? JSON.parse(invoiceQuery.data.parsedData) : invoiceQuery.data.parsedData);
    }
  }, [invoiceQuery.data]);

  const handleError = (msg: string) => {
    if (msg.includes("503") || msg.includes("overloaded") || msg.includes("high demand")) {
      alert("⚠️ A API do Google está temporariamente sobrecarregada (Erro 503). Por favor, aguarde alguns segundos e tente novamente!");
    } else {
      alert(msg);
    }
  };

  const uploadAndParse = trpc.invoice.uploadAndParse.useMutation({
    onSuccess: (data) => {
      setInvoiceId(data.id);
      if (data.parsedData) {
        setParsedData(typeof data.parsedData === 'string' ? JSON.parse(data.parsedData) : data.parsedData);
      } else {
        handleError("Erro no processamento da IA: " + data.errorMessage);
      }
    },
    onError: (err) => {
      handleError("Erro ao analisar fatura: " + err.message);
    }
  });

  const confirmInvoice = trpc.invoice.confirmInvoice.useMutation({
    onSuccess: () => {
      alert("Fatura processada e salva com sucesso!");
      if (isReviewMode) {
        router.push("/");
      } else {
        setInvoiceText("");
        setFileName("");
        setParsedData(null);
        setInvoiceId(null);
      }
    },
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleParse = async () => {
    if (!userId) return;

    // Se tiver arquivo selecionado, vai pela rota de arquivo
    if (selectedFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("userId", userId);
        formData.append("motor", "NUBANK_RATEIO");
        formData.append("personalExpenses", invoiceText);

        const res = await fetch("/api/upload-pdf", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) {
          handleError("Erro no upload: " + (data.error || res.statusText));
          return;
        }

        setInvoiceId(data.id);
        if (data.parsedData) {
          setParsedData(typeof data.parsedData === 'string' ? JSON.parse(data.parsedData) : data.parsedData);
        } else {
          handleError("Erro no processamento da IA: " + data.errorMessage);
        }
      } catch (err: any) {
        handleError("Erro ao enviar PDF: " + err.message);
      } finally {
        setIsUploading(false);
      }
    } else if (invoiceText) {
      // Falha gracefully avisando que precisa do PDF para cruzar
      handleError("Por favor, selecione o PDF da fatura completa do Nubank para podermos cruzar com os seus gastos manuais.");
    }
  };

  const handleConfirm = () => {
    if (!invoiceId || !parsedData?.itens) return;
    
    confirmInvoice.mutate({
      invoiceId,
      userId,
      transactions: parsedData.itens.map((t: any, idx: number) => {
        const adiantados = advancements[idx] || 0;
        const multiplier = adiantados + 1;
        const finalAmount = t.amount * multiplier;

        return {
          date: t.date,
          description: t.item_real || t.gateway_string,
          amount: -Math.abs(finalAmount), // Força a ser despesa (negativo)
          categoryName: t.stakeholder,
          vaultId: vaultSelections[idx] || undefined,
        };
      }),
    });
  };

  const copyToClipboard = () => {
    if (parsedData?.whatsapp_report) {
      navigator.clipboard.writeText(parsedData.whatsapp_report);
      alert("Relatório copiado para a área de transferência!");
    }
  };

  const handleItemNameChange = (idx: number, newName: string) => {
    const newData = { ...parsedData };
    newData.itens[idx].item_real = newName;
    setParsedData(newData);
  };

  const handleStakeholderChange = (idx: number, newStakeholder: string) => {
    const newData = { ...parsedData };
    newData.itens[idx].stakeholder = newStakeholder;
    
    // Recalcular totais se necessário (opcional, mas bom pra UX)
    let subPessoal = 0;
    let ap = 0;
    let terceiros = 0;
    let mae = 0;
    
    newData.itens.forEach((t: any) => {
      if (t.stakeholder === 'SUB_PESSOAL') subPessoal += t.amount;
      if (t.stakeholder === 'AP') ap += t.amount;
      if (t.stakeholder === 'TERCEIROS') terceiros += t.amount;
      if (t.stakeholder === 'MAE') mae += t.amount;
    });

    newData.totais = {
      ...newData.totais,
      sub_pessoal_total: subPessoal,
      ap_total: ap,
      terceiros_total: terceiros,
      mae_total: mae,
      geral_filho: subPessoal + ap + terceiros
    };

    setParsedData(newData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
          <span className="w-4 h-4 rounded-full bg-purple-500"></span>
          Motor 3: Nubank Mãe
        </h1>
        <p className="text-slate-400 mt-1">
          O agente autônomo extrai e consolida sua fatura baseando-se no Dicionário de Regras de Negócio.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Input (Oculta no modo revisão) */}
        {!isReviewMode && (
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-slate-200">Importar Fatura (PDF + Suas Parcelas)</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">1º Selecione o arquivo PDF do Nubank</label>
              <input 
                type="file" 
                accept=".pdf"
                onChange={handleFileUpload}
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              {fileName && <p className="text-xs text-slate-500 mt-2 text-emerald-400">✅ Fatura PDF carregada: {fileName}</p>}
            </div>

            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 border-t border-slate-700"></div>
              <span className="text-slate-500 text-sm">+</span>
              <div className="flex-1 border-t border-slate-700"></div>
            </div>

            <label className="block text-sm font-medium text-slate-300 mb-2">2º Cole os Seus Gastos Pessoais (Opcional, para cruzamento)</label>
            <textarea
              className="w-full h-48 bg-slate-950 border border-slate-800 rounded-md p-4 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono resize-none"
              placeholder="Cole o texto aqui... (ex: 10 AGO Allura Doces - Parcela 6/6 R$ 75,00)"
              value={invoiceText}
              onChange={(e) => setInvoiceText(e.target.value)}
            />
            <button
              onClick={handleParse}
              disabled={isUploading || (!selectedFile)}
              className="mt-4 w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {isUploading ? "Analisando Cruzamento IA..." : "Analisar e Cruzar Dados"}
            </button>
          </div>
        )}

        {/* Coluna Direita: Resultados */}
        {parsedData && (
          <div className={`${isReviewMode ? 'lg:col-span-12' : 'lg:col-span-8'} bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-200">Resultado do Mês: {parsedData.mes_referencia}</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800 rounded-lg p-3 text-center border-b-2 border-purple-500">
                <p className="text-slate-400 text-xs mb-1">Sub Pessoal</p>
                <p className="text-lg font-bold text-purple-400">R$ {parsedData.totais?.sub_pessoal_total?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3 text-center border-b-2 border-blue-500">
                <p className="text-slate-400 text-xs mb-1">Coisas do AP</p>
                <p className="text-lg font-bold text-blue-400">R$ {parsedData.totais?.ap_total?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3 text-center border-b-2 border-amber-500">
                <p className="text-slate-400 text-xs mb-1">Terceiros</p>
                <p className="text-lg font-bold text-amber-400">R$ {parsedData.totais?.terceiros_total?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3 text-center border-l-2 border-slate-700">
                <p className="text-slate-400 text-xs mb-1">Total do Filho (Pagar)</p>
                <p className="text-lg font-bold text-white">R$ {parsedData.totais?.geral_filho?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Lista de Transações */}
              <div className="flex-1 overflow-y-auto max-h-96 space-y-3 pr-2">
                <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase">Transações Extraídas</h3>
                <p className="text-xs text-slate-500 mb-3">Você pode editar os nomes dos itens antes de salvar.</p>
                {parsedData.itens?.map((item: any, idx: number) => (
                  <div key={idx} className={`p-3 rounded-lg border ${item.stakeholder === 'PENDING_TAG' ? 'bg-amber-950/30 border-amber-500/50' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <div className="flex-1">
                        <span className="text-slate-500 text-xs mr-2">{item.date}</span>
                        <input
                          type="text"
                          className="bg-transparent border-b border-slate-700 hover:border-purple-500 focus:border-purple-500 focus:outline-none text-sm font-medium text-slate-200 w-full transition-colors"
                          value={item.item_real || item.gateway_string}
                          onChange={(e) => handleItemNameChange(idx, e.target.value)}
                        />
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-200 whitespace-nowrap pt-1">
                          R$ {((item.amount || 0) * ((advancements[idx] || 0) + 1)).toFixed(2)}
                        </p>
                        {(advancements[idx] || 0) > 0 && (
                          <p className="text-[10px] text-purple-400">({(advancements[idx] || 0) + 1}x R$ {item.amount.toFixed(2)})</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex gap-2">
                        <select 
                          value={item.stakeholder}
                          onChange={(e) => handleStakeholderChange(idx, e.target.value)}
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded cursor-pointer border-none focus:ring-0 ${
                          item.stakeholder === 'SUB_PESSOAL' ? 'bg-purple-500/20 text-purple-400' :
                          item.stakeholder === 'AP' ? 'bg-blue-500/20 text-blue-400' :
                          item.stakeholder === 'TERCEIROS' ? 'bg-amber-500/20 text-amber-400' :
                          item.stakeholder === 'MAE' ? 'bg-slate-700 text-slate-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          <option value="SUB_PESSOAL">SUB_PESSOAL</option>
                          <option value="AP">AP</option>
                          <option value="TERCEIROS">TERCEIROS</option>
                          <option value="MAE">MÃE</option>
                          <option value="PENDING_TAG">PENDING_TAG</option>
                        </select>
                        {item.last_installment && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                            Última Parcela
                          </span>
                        )}
                      </div>
                      {item.parcela_atual && item.parcela_total && (
                        <span className="text-xs text-slate-500">{item.parcela_atual}/{item.parcela_total}</span>
                      )}
                    </div>
                    {item.stakeholder === 'PENDING_TAG' && (
                      <p className="text-xs text-amber-400 mt-2">⚠️ Necessário revisar: Tag não mapeada no dicionário.</p>
                    )}

                    {isReviewMode && (
                      <div className="mt-3 pt-3 border-t border-slate-800/50 flex flex-col gap-2">
                        {/* Adiantamento de Parcelas */}
                        {item.parcela_atual && item.parcela_total && item.parcela_atual < item.parcela_total && (
                          <div className="flex justify-between items-center text-xs">
                            <label className="text-slate-400">Adiantar Parcelas:</label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                min="0" 
                                max={item.parcela_total - item.parcela_atual}
                                value={advancements[idx] || 0}
                                onChange={(e) => setAdvancements({...advancements, [idx]: parseInt(e.target.value) || 0})}
                                className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Seleção de Caixinha */}
                        <div className="flex justify-between items-center text-xs">
                          <label className="text-slate-400">Abater da Caixinha:</label>
                          <select 
                            value={vaultSelections[idx] || ""}
                            onChange={(e) => setVaultSelections({...vaultSelections, [idx]: e.target.value})}
                            className="w-32 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                          >
                            <option value="">Nenhuma</option>
                            {vaults.map(v => (
                              <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Relatório WhatsApp */}
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase">Relatório WhatsApp</h3>
                  <button 
                    onClick={copyToClipboard}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded transition-colors"
                  >
                    Copiar
                  </button>
                </div>
                <textarea
                  readOnly
                  className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-md p-4 text-sm text-slate-300 focus:outline-none font-mono resize-none min-h-[300px]"
                  value={parsedData.whatsapp_report || ""}
                />
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={confirmInvoice.isPending}
              className="mt-auto w-full bg-slate-100 hover:bg-white disabled:opacity-50 text-slate-900 font-bold py-3 px-4 rounded-md transition-colors"
            >
              {confirmInvoice.isPending ? "Confirmando..." : "Confirmar Rateio no Sistema"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
