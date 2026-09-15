"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { SEED_USER_ID } from "../../../lib/constants";

export default function InterMotorPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? SEED_USER_ID;
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-emerald-500 hover:text-emerald-400 text-sm mb-4 inline-block">&larr; Voltar ao Dashboard</Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center text-sm">
            M5
          </div>
          Banco Inter (Em Breve)
        </h1>
        <p className="text-slate-400 mt-2">Extração e categorização de faturas em PDF via IA.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Upload de Fatura (PDF)</h2>
        <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center bg-slate-900/50 hover:bg-slate-800/50 transition-colors">
          <input 
            type="file" 
            accept="application/pdf"
            className="hidden"
            id="file-upload"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-slate-300 font-medium">{file ? file.name : "Clique para selecionar ou arraste o PDF aqui"}</span>
            <span className="text-slate-500 text-sm mt-1">Apenas formato PDF do Banco Inter</span>
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            disabled={true} 
            className="bg-orange-600 hover:bg-orange-500 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Analisar Fatura (Em desenvolvimento)
          </button>
        </div>
      </div>
    </div>
  );
}
