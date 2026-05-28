"use client";

import { useState, useEffect, useCallback } from "react";
import { fornecedores, Fornecedor } from "@/lib/api";

export default function FornecedoresPage() {
  const [lista, setLista] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Fornecedor | null>(null);
  const [form, setForm] = useState({ nome: "", categoria: "", cnpj: "", email: "", telefone: "", endereco: "" });

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fornecedores.listar({ busca: busca || undefined });
      setLista(data);
      setErro(null);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }, [busca]);

  useEffect(() => { carregar(); }, [carregar]);

  function abrirNovo() {
    setEditando(null);
    setForm({ nome: "", categoria: "", cnpj: "", email: "", telefone: "", endereco: "" });
    setShowForm(true);
  }

  function abrirEditar(f: Fornecedor) {
    setEditando(f);
    setForm({ nome: f.nome, categoria: f.categoria, cnpj: f.cnpj || "", email: f.email || "", telefone: f.telefone || "", endereco: f.endereco || "" });
    setShowForm(true);
  }

  async function salvar() {
    try {
      if (editando) {
        await fornecedores.atualizar(editando.id, form);
      } else {
        await fornecedores.criar(form);
      }
      setShowForm(false);
      carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao salvar");
    }
  }

  async function excluir(id: number) {
    if (!confirm("Excluir este fornecedor?")) return;
    try {
      await fornecedores.excluir(id);
      carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao excluir");
    }
  }

  async function toggleAtivo(f: Fornecedor) {
    await fornecedores.atualizar(f.id, { ativo: !f.ativo });
    carregar();
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Fornecedores</h1>
          <p className="text-sm text-gray-500 mt-0.5">{lista.length} registros</p>
        </div>
        <button onClick={abrirNovo} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Novo Fornecedor
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por nome..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full max-w-sm border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {erro && <p className="text-red-600 text-sm">{erro}</p>}
      {loading ? (
        <p className="text-gray-400 text-sm">Carregando...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Nome</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Categoria</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">CNPJ</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Contato</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((f) => (
                <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{f.nome}</td>
                  <td className="px-4 py-3 text-gray-600">{f.categoria}</td>
                  <td className="px-4 py-3 text-gray-500">{f.cnpj || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{f.email || f.telefone || "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleAtivo(f)} className={`text-xs px-2 py-1 rounded-full font-medium ${f.ativo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
                      {f.ativo ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="px-4 py-3 flex gap-2 justify-end">
                    <button onClick={() => abrirEditar(f)} className="text-blue-600 hover:underline text-xs">Editar</button>
                    <button onClick={() => excluir(f.id)} className="text-red-500 hover:underline text-xs">Excluir</button>
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Nenhum fornecedor encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-semibold">{editando ? "Editar Fornecedor" : "Novo Fornecedor"}</h2>
            {(["nome", "categoria", "cnpj", "email", "telefone", "endereco"] as const).map((field) => (
              <div key={field}>
                <label className="block text-xs text-gray-500 mb-1 capitalize">{field}{field === "nome" || field === "categoria" ? " *" : ""}</label>
                <input
                  value={form[field]}
                  onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={salvar} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
