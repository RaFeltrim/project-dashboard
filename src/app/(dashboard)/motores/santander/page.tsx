"use client";

import React, { useState, useMemo } from "react";
import { trpc } from "../../../../lib/trpc";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  categoryGuess?: string;
}

export default function SantanderPage() {
  const { data: session } = useSession();

  const [fileContent, setFileContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [uploadedTransactions, setUploadedTransactions] = useState<ParsedTransaction[]>([]);
  const [uploadedInvoiceId, setUploadedInvoiceId] = useState<string | null>(null);

  const [targetMonth, setTargetMonth] = useState<number>(new Date().getMonth());
  const [targetYear, setTargetYear] = useState<number>(new Date().getFullYear());

  const [advancements, setAdvancements] = useState<Record<number, number>>({});
  const [vaultSelections, setVaultSelections] = useState<Record<number, string>>({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const urlInvoiceId = searchParams.get("invoiceId");
  const isReviewMode = !!urlInvoiceId;

  const vaultsQuery = trpc.vault.getAll.useQuery();
  const vaults = vaultsQuery.data || [];

  const invoiceQuery = trpc.invoice.getParsedInvoice.useQuery(
    { invoiceId: urlInvoiceId || "" },
    {
      enabled: !!urlInvoiceId,
    }
  );

  const parsedTransactions = useMemo<ParsedTransaction[]>(() => {
    if (uploadedTransactions.length > 0) return uploadedTransactions;
    if (invoiceQuery.data?.parsedData) {
      return typeof invoiceQuery.data.parsedData === "string"
        ? JSON.parse(invoiceQuery.data.parsedData)
        : (invoiceQuery.data.parsedData as unknown as ParsedTransaction[]);
    }
    return [];
  }, [uploadedTransactions, invoiceQuery.data]);

  const invoiceId = uploadedInvoiceId || invoiceQuery.data?.id || null;

  const totalInvoice = useMemo(() => {
    return parsedTransactions.reduce((acc, curr, idx) => {
      const multiplier = (advancements[idx] || 0) + 1;
      return acc + (Math.abs(curr.amount || 0) * multiplier);
    }, 0);
  }, [parsedTransactions, advancements]);

  const uploadAndParse = trpc.invoice.uploadAndParse.useMutation({
    onSuccess: (data) => {
      setUploadedInvoiceId(data.id);
      if (data.parsedData) {
        setUploadedTransactions(JSON.parse(data.parsedData as string));
      }
    },
  });

  const confirmInvoice = trpc.invoice.confirmInvoice.useMutation({
    onSuccess: () => {
      alert("Transações importadas com sucesso!");
      if (isReviewMode) {
        router.push("/");
      } else {
        setFileContent("");
        setFileName("");
        setUploadedTransactions([]);
        setUploadedInvoiceId(null);
      }
    },
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    if (file.name.endsWith(".pdf")) {
      // PDF: Use dedicated upload endpoint (FormData, no size limit)
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        
        formData.append("motor", "SANTANDER");

        const res = await fetch("/api/upload-pdf", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) {
          alert("Erro no upload: " + (data.error || res.statusText));
          return;
        }

        setUploadedInvoiceId(data.id);
        if (data.parsedData) {
          setUploadedTransactions(typeof data.parsedData === 'string' ? JSON.parse(data.parsedData) : data.parsedData);
        } else {
          alert("Erro no processamento: " + data.errorMessage);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        alert("Erro ao enviar PDF: " + message);
      } finally {
        setIsUploading(false);
      }
    } else {
      // CSV: Use tRPC (small payload)
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setFileContent(text);
        uploadAndParse.mutate({
          motor: "SANTANDER",
          fileName: file.name,
          content: text,
        });
      };
      reader.readAsText(file);
    }
  };

  const handleConfirm = () => {
    if (!invoiceId || parsedTransactions.length === 0) return;
    confirmInvoice.mutate({
      invoiceId,
      targetMonth,
      targetYear,
      transactions: parsedTransactions.map((t, idx) => {
        const adiantados = advancements[idx] || 0;
        const multiplier = adiantados + 1;
        const finalAmount = (t.amount || 0) * multiplier;

        return {
          date: t.date,
          description: t.description,
          amount: finalAmount, // Note: Santander values are usually negative for expenses
          categoryName: t.categoryGuess,
          vaultId: vaultSelections[idx] || undefined,
        };
      }),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
          <span className="w-4 h-4 rounded-full bg-red-500"></span>
          Motor 2: Santander
        </h1>
        <p className="text-slate-400 mt-1">
          Faça upload da sua fatura ou extrato CSV. O sistema irá ler, extrair as datas e tentar categorizar automaticamente.
        </p>
      </div>

      {!isReviewMode && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-slate-200">Importar Fatura (CSV ou PDF)</h2>
          
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-950 hover:bg-slate-900 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Clique para fazer upload</span> ou arraste e solte</p>
                <p className="text-xs text-slate-500">Arquivos .CSV ou .PDF são suportados</p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" accept=".csv, .pdf" onChange={handleFileUpload} />
            </label>
          </div>

          {(uploadAndParse.isPending || isUploading) && (
            <div className="mt-4 text-center text-red-400 font-medium animate-pulse">⏳ Lendo arquivo e categorizando com IA...</div>
          )}
        </div>
      )}
        {parsedTransactions.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-200">Prévia de Importação ({parsedTransactions.length} itens)</h3>
                <p className="text-sm text-slate-400 mt-1">Total da fatura: <span className="font-bold text-red-400">R$ {totalInvoice.toFixed(2)}</span></p>
                <div className="mt-3 flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
                  <label className="text-sm text-slate-300 font-medium">Mês da Fatura:</label>
                  <select 
                    value={targetMonth} 
                    onChange={(e) => setTargetMonth(parseInt(e.target.value))}
                    className="bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded p-1.5 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                  >
                    {["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"].map((m, i) => (
                      <option key={i} value={i}>{m}</option>
                    ))}
                  </select>
                  <select 
                    value={targetYear} 
                    onChange={(e) => setTargetYear(parseInt(e.target.value))}
                    className="bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded p-1.5 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                  >
                    {[2024, 2025, 2026, 2027].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button 
                onClick={handleConfirm}
                disabled={confirmInvoice.isPending}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                {confirmInvoice.isPending ? "Salvando..." : "Confirmar e Salvar Tudo"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-400">
                <thead className="text-xs text-slate-500 uppercase bg-slate-950 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Descrição Original</th>
                    <th className="px-4 py-3">Categoria Sugerida</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedTransactions.map((tx, idx) => (
                    <React.Fragment key={idx}>
                    <tr className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="px-4 py-3">{tx.date}</td>
                      <td className="px-4 py-3 font-medium text-slate-300">{tx.description}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${tx.categoryGuess !== 'Outros' ? 'bg-red-500/10 text-red-400' : 'bg-slate-700 text-slate-400'}`}>
                          {tx.categoryGuess}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-200">
                        <div className="flex flex-col items-end gap-1">
                          <span>R$ {((tx.amount || 0) * ((advancements[idx] || 0) + 1)).toFixed(2)}</span>
                          {(advancements[idx] || 0) > 0 && (
                            <span className="text-[10px] text-red-400">({(advancements[idx] || 0) + 1}x R$ {(tx.amount || 0).toFixed(2)})</span>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Linha Oculta de Configurações */}
                    {isReviewMode && (
                      <tr key={`config-${idx}`} className="border-b border-slate-800 bg-slate-900/30">
                        <td colSpan={4} className="px-4 py-2">
                          <div className="flex justify-end gap-6 items-center">
                            <div className="flex items-center gap-2 text-xs">
                              <label className="text-slate-400">Adiantar Parcelas:</label>
                              <input 
                                type="number" 
                                min="0" 
                                value={advancements[idx] || 0}
                                onChange={(e) => setAdvancements({...advancements, [idx]: parseInt(e.target.value) || 0})}
                                className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                              />
                            </div>
                            <div className="flex items-center gap-2 text-xs">
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
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}
