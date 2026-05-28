"use client";

import { useState, useEffect, useCallback } from "react";
import { documentos, fornecedores, Documento, Fornecedor } from "@/lib/api";

export default function DocumentosPage() {
  const [lista, setLista] = useState<Documento[]>([]);
  const [listaFornecedores, setListaFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [abaVencimentos, setAbaVencimentos] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Documento | null>(null);
  const [form, setForm] = useState({ nome: "", tipo: "", caminho_arquivo: "", data_vencimento: "", fornecedor_id: "" });

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [d, f] = await Promise.all([
        abaVencimentos ? documentos.vencimentos(30) : documentos.listar(),
        fornecedores.listar(),
      ]);
      setLista(d);
      setListaFornecedores(f);
    } finally {
      setLoading(false);
    }
  }, [abaVencimentos]);

  useEffect(() => { carregar(); }, [carregar]);

  function abrirNovo() {
    setEditando(null);
    setForm({ nome: "", tipo: "", caminho_arquivo: "", data_vencimento: "", fornecedor_id: "" });
    setShowForm(true);
  }

  function abrirEditar(d: Documento) {
    setEditando(d);
    setForm({ nome: d.nome, tipo: d.tipo || "", caminho_arquivo: d.caminho_arquivo || "", data_vencimento: d.data_vencimento?.slice(0, 10) || "", fornecedor_id: String(d.fornecedor_id) });
    setShowForm(true);
  }

  async function salvar() {
    try {
      const body = { nome: form.nome, tipo: form.tipo || undefined, caminho_arquivo: form.caminho_arquivo || undefined, data_vencimento: form.data_vencimento || undefined, fornecedor_id: parseInt(form.fornecedor_id) };
      if (editando) { await documentos.atualizar(editando.id, body); }
      else { await documentos.criar(body); }
      setShowForm(false);
      carregar();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Erro"); }
  }

  async function excluir(id: number) {
    if (!confirm("Excluir este documento?")) return;
    try { await documentos.excluir(id); carregar(); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Erro"); }
  }

  function statusVencimento(data?: string) {
    if (!data) return null;
    const dias = Math.ceil((new Date(data).getTime() - Date.now()) / 86400000);
    if (dias < 0) return <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">Vencido</span>;
    if (dias <= 7) return <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">Vence em {dias}d</span>;
    if (dias <= 30) return <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">Vence em {dias}d</span>;
    return <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">{new Date(data).toLocaleDateString("pt-BR")}</span>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Documentos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{lista.length} registros</p>
        </div>
        <button onClick={abrirNovo} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">+ Novo Documento</button>
      </div>

      <div className="flex gap-2">
        {[false, true].map((v) => (
          <button key={String(v)} onClick={() => setAbaVencimentos(v)} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${abaVencimentos === v ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {v ? "⚠️ Vencendo em 30 dias" : "Todos"}
          </button>
        ))}
      </div>

      {loading ? <p className="text-gray-400 text-sm">Carregando...</p> : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Nome</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Fornecedor</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Tipo</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Vencimento</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((d) => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{d.nome}</td>
                  <td className="px-4 py-3 text-gray-600">{d.fornecedor?.nome || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{d.tipo || "—"}</td>
                  <td className="px-4 py-3">{statusVencimento(d.data_vencimento)}</td>
                  <td className="px-4 py-3 flex gap-2 justify-end">
                    <button onClick={() => abrirEditar(d)} className="text-blue-600 hover:underline text-xs">Editar</button>
                    <button onClick={() => excluir(d.id)} className="text-red-500 hover:underline text-xs">Excluir</button>
                  </td>
                </tr>
              ))}
              {lista.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum documento encontrado</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">{editando ? "Editar Documento" : "Novo Documento"}</h2>
            {[
              { label: "Nome *", field: "nome" },
              { label: "Tipo (ex: contrato, nota fiscal)", field: "tipo" },
              { label: "Caminho/URL do arquivo", field: "caminho_arquivo" },
              { label: "Data de vencimento", field: "data_vencimento", type: "date" },
            ].map(({ label, field, type = "text" }) => (
              <div key={field}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <input type={type} value={(form as Record<string, string>)[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fornecedor *</label>
              <select value={form.fornecedor_id} onChange={(e) => setForm((p) => ({ ...p, fornecedor_id: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Selecione...</option>
                {listaFornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
            </div>
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
