"use client";

import { useState } from "react";
import { trpc } from "../../../lib/trpc";
import { useSession } from "next-auth/react";
import { ExpenseSection } from "@prisma/client";


export default function CategoriasPage() {
  const { data: session } = useSession();
  

  const { data: categories, refetch, isLoading } = trpc.category.getAll.useQuery(undefined, {
    enabled: !!session?.user,
  });

  const createCategory = trpc.category.create.useMutation({
    onSuccess: () => {
      refetch();
      setNewName("");
      setNewSection(ExpenseSection.PESSOAL);
      setNewColor("#6366f1");
    },
  });

  const deleteCategory = trpc.category.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const [newName, setNewName] = useState("");
  const [newSection, setNewSection] = useState<ExpenseSection>(ExpenseSection.PESSOAL);
  const [newColor, setNewColor] = useState("#6366f1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    createCategory.mutate({
      name: newName,
      section: newSection,
      color: newColor,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
          <span className="w-4 h-4 rounded-full bg-indigo-500"></span>
          Gestão de Categorias
        </h1>
        <p className="text-slate-400 mt-1">Crie e organize categorias para seus lançamentos.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-slate-200">Nova Categoria</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-400 mb-1">Nome</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="Ex: Supermercado"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Seção</label>
            <select
              value={newSection}
              onChange={(e) => setNewSection(e.target.value as ExpenseSection)}
              className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {Object.values(ExpenseSection).map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Cor</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="h-9 w-14 rounded-md border-0 p-0 bg-transparent cursor-pointer"
              />
              <button
                type="submit"
                disabled={createCategory.isPending}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-md font-medium transition-colors"
              >
                {createCategory.isPending ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-slate-200">Categorias Existentes</h2>
        {isLoading ? (
          <p className="text-slate-500 text-sm">Carregando...</p>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex flex-col justify-between items-start gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color || "#ccc" }}></div>
                  <span className="font-medium text-slate-200 text-sm">{cat.name}</span>
                </div>
                <div className="flex w-full items-center justify-between mt-2">
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-md">{cat.section}</span>
                  <button
                    onClick={() => deleteCategory.mutate({ id: cat.id })}
                    className="text-red-400 hover:text-red-300 text-xs font-semibold"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Nenhuma categoria encontrada.</p>
        )}
      </div>
    </div>
  );
}
