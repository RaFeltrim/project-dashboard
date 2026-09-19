"use client";

import { useSession } from "next-auth/react";
import { trpc } from "../../lib/trpc";
import Link from "next/link";
import { useState } from "react";

import { DashboardSkeleton } from "../../components/DashboardSkeleton";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function Home() {
  const { data: session } = useSession();

  const [timeRange, setTimeRange] = useState<'THIS_MONTH' | 'LAST_30_DAYS' | 'ALL_TIME' | 'CUSTOM_MONTH'>('CUSTOM_MONTH');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState<'PAGAR' | 'PAGOS' | 'AMBOS'>('AMBOS');

  const { data, isLoading } = trpc.dashboard.getConsolidatedData.useQuery(
    { timeRange, statusFilter, selectedMonth, selectedYear }, { enabled: !!session?.user }
  );

  const [fastChatInput, setFastChatInput] = useState("");
  
  const fastChat = trpc.fastChat.process.useMutation({
    onSuccess: (data) => {
      alert(`Lançado: R$ ${data.transaction.amount} (${data.transaction.rawDescription}) -> Categoria: ${data.categoryGuess}`);
      setFastChatInput("");
    },
    onError: (err) => {
      alert("Erro: " + err.message);
    }
  });

  const handleFastChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fastChatInput) return;
    fastChat.mutate({ message: fastChatInput });
  };

  const handlePrevMonth = () => {
    setTimeRange('CUSTOM_MONTH');
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    setTimeRange('CUSTOM_MONTH');
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
    setTimeRange('CUSTOM_MONTH');
  };

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  const motorData = [
    { name: 'Mercado Pago', value: data.statsByMotor["MERCADO_PAGO"] || 0, color: '#3b82f6' },
    { name: 'Santander', value: data.statsByMotor["SANTANDER"] || 0, color: '#ef4444' },
    { name: 'Nubank', value: data.statsByMotor["NUBANK_RATEIO"] || 0, color: '#a855f7' },
    { name: 'Cartão Tia', value: data.statsByMotor["CARTAO_TIA"] || 0, color: '#eab308' },
  ].filter(m => m.value > 0);

  return (
    <div className="space-y-8">
      {/* HEADER & CHAT RÁPIDO */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">Visão Geral</h1>
          <p className="text-slate-400 mt-1">
            {timeRange === 'ALL_TIME' 
              ? 'Visão completa de todos os tempos' 
              : timeRange === 'LAST_30_DAYS' 
              ? 'Resumo dos últimos 30 dias' 
              : `Resumo de ${MONTH_NAMES[selectedMonth]} de ${selectedYear}`}
          </p>
        </div>
        
        {/* FAST CHAT (Fase 7 inline) */}
        <div className="w-full md:w-96">
          <form onSubmit={handleFastChat} className="relative">
            <input 
              type="text" 
              value={fastChatInput}
              onChange={(e) => setFastChatInput(e.target.value)}
              placeholder="Digite rápido: -50 ifood"
              className="w-full bg-slate-900 border border-slate-700 rounded-full py-3 px-5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
            />
            <button 
              type="submit"
              className="absolute right-2 top-2 bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* FILTROS GLOBAIS COM SELETOR DE MÊS */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Seletor de Mês e Ano */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
            <button
              onClick={handlePrevMonth}
              title="Mês anterior"
              aria-label="Mês anterior"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(Number(e.target.value));
                setTimeRange('CUSTOM_MONTH');
              }}
              className="bg-transparent text-sm font-semibold text-slate-200 border-none focus:ring-0 cursor-pointer px-2 py-1"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={idx} value={idx} className="bg-slate-900 text-slate-200">
                  {name}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setTimeRange('CUSTOM_MONTH');
              }}
              className="bg-transparent text-sm font-semibold text-slate-200 border-none focus:ring-0 cursor-pointer px-2 py-1"
            >
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr} className="bg-slate-900 text-slate-200">
                  {yr}
                </option>
              ))}
            </select>

            <button
              onClick={handleNextMonth}
              title="Próximo mês"
              aria-label="Próximo mês"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Atalhos Rápidos */}
          <button 
            onClick={handleCurrentMonth} 
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              timeRange === 'CUSTOM_MONTH' && selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear()
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Mês Atual
          </button>
          <button 
            onClick={() => setTimeRange('LAST_30_DAYS')} 
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              timeRange === 'LAST_30_DAYS' 
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Últimos 30 Dias
          </button>
          <button 
            onClick={() => setTimeRange('ALL_TIME')} 
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              timeRange === 'ALL_TIME' 
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Todo Período
          </button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={() => setStatusFilter('AMBOS')} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${statusFilter === 'AMBOS' ? 'bg-slate-700 text-slate-200 border border-slate-600' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Ambos</button>
          <button onClick={() => setStatusFilter('PAGAR')} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${statusFilter === 'PAGAR' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>A Pagar</button>
          <button onClick={() => setStatusFilter('PAGOS')} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${statusFilter === 'PAGOS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Pagos</button>
        </div>
      </div>

      {/* ALERTAS PROATIVOS */}
      {(data.upcomingCharges.length > 0 || data.pendingInvoices.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.pendingInvoices.map(inv => (
            <div key={inv.id} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500/20 p-2 rounded-lg text-amber-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-amber-500 font-semibold text-sm">Fatura Pendente</h3>
                  <p className="text-amber-400/80 text-xs">Você tem dados de {inv.motor} aguardando revisão</p>
                </div>
              </div>
              <Link href={inv.motor === "SANTANDER" ? `/motores/santander?invoiceId=${inv.id}` : `/motores/nubank-rateio?invoiceId=${inv.id}`} className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-sm font-medium rounded-lg transition-colors">
                Revisar
              </Link>
            </div>
          ))}

          {data.upcomingCharges.map(charge => (
            <div key={charge.id} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                <div className="bg-red-500/20 p-2 rounded-lg text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-red-400 font-semibold text-sm">Vencimento Próximo</h3>
                  <p className="text-red-400/80 text-xs">{charge.description} vence em {charge.nextChargeAt ? new Date(charge.nextChargeAt).toLocaleDateString() : 'breve'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-red-400">R$ {Number(charge.amount).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CARDS PRINCIPAIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Despesas do Mês */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-slate-400 font-medium text-sm mb-2">
            {timeRange === 'ALL_TIME' ? 'Total de Despesas' : timeRange === 'LAST_30_DAYS' ? 'Despesas (30 dias)' : `Despesas de ${MONTH_NAMES[selectedMonth]}`}
          </h2>
          <p className="text-4xl font-bold text-slate-100 mb-1">
            R$ {data.totalExpense.toFixed(2)}
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-red-500 h-full" style={{ width: `${Math.min((data.totalExpense / 3000) * 100, 100)}%` }}></div>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-right">Teto sugerido: R$ 3000</p>
        </div>

        {/* Gasto Diário Sugerido */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
          <h2 className="text-slate-400 font-medium text-sm mb-2">Gasto Diário Recomendado</h2>
          <p className="text-4xl font-bold text-emerald-400 mb-1">
            R$ {data.dailyRecommended.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-4 bg-slate-950 p-2 rounded-md inline-block">
            Baseado no saldo livre de R$ {data.budgetLeft.toFixed(2)}
          </p>
        </div>

        {/* Breakdown de Motores */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <h2 className="text-slate-400 font-medium text-sm mb-4">Origem dos Gastos</h2>
          {motorData.length === 0 ? (
            <p className="text-slate-500 text-sm mt-8 text-center">Sem dados de motores</p>
          ) : (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={motorData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} stroke="none">
                    {motorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => `R$ ${Number(value || 0).toFixed(2)}`}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      {/* QUICK LINKS MOTORES */}
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Acesso Rápido aos Motores</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/motores/mercado-pago" className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-xl transition-colors flex flex-col items-center justify-center text-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              M1
            </div>
            <span className="text-sm font-medium text-slate-300">Mercado Pago</span>
          </Link>
          <Link href="/motores/santander" className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-xl transition-colors flex flex-col items-center justify-center text-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              M2
            </div>
            <span className="text-sm font-medium text-slate-300">Santander</span>
          </Link>
          <Link href="/motores/nubank-rateio" className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-xl transition-colors flex flex-col items-center justify-center text-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              M3
            </div>
            <span className="text-sm font-medium text-slate-300">Nubank Mãe</span>
          </Link>
          <Link href="/motores/cartao-tia" className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-xl transition-colors flex flex-col items-center justify-center text-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              M4
            </div>
            <span className="text-sm font-medium text-slate-300">Cartão Tia</span>
          </Link>
        </div>
      </div>

      {/* HISTÓRICO E AGRUPAMENTOS TEMPORAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        
        {/* Histórico por Mês */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col">
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Histórico por Mês
          </h2>
          <div className="h-64 w-full">
            {data.historyByMonth.length === 0 ? (
              <p className="text-slate-500 text-sm italic mt-8 text-center">Nenhum dado encontrado para o filtro atual.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.historyByMonth.slice().reverse()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                  <RechartsTooltip 
                    formatter={(value) => [`R$ ${Number(value || 0).toFixed(2)}`, 'Gasto']}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                    cursor={{ fill: '#334155', opacity: 0.4 }}
                  />
                  <Bar dataKey="expense" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Histórico por Dia (Últimos 30 c/ Dados) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col">
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Gastos por Dia (Top Recentes)
          </h2>
          <div className="overflow-y-auto max-h-64 pr-2 custom-scrollbar">
            {data.historyByDay.length === 0 ? (
              <p className="text-slate-500 text-sm italic">Nenhum dado encontrado.</p>
            ) : (
              <ul className="space-y-3">
                {data.historyByDay.map((d, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-300 text-sm">{d.dateStr}</span>
                    <span className="text-red-400 font-bold text-sm">R$ {d.expense.toFixed(2)}</span>
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
