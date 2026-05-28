"use client";

import { useState, useEffect, useCallback } from "react";
import { custos, fornecedores, Custo, Fornecedor } from "@/lib/api";

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CustosPage() {
  const [lista, setLista] = useState<Custo[]>([]);
  const [listaFornecedores, setListaFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<"" | "entrada" | "saida">("");
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Custo | null>(null);
  const [form, setForm] = useState({ descricao: "", tipo: "saida" as "entrada" | "saida", valor: "", data_custo: "", fornecedor_id: "" });

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [c, f] = await Promise.all([
        custos.listar({ tipo: filtroTipo || undefined }),
        fornecedores.listar(),
      ]);
      setLista(c);
      setListaFornecedores(f);
    } finally {
      setLoading(false);
    }
  }, [filtroTipo]);

  useEffect(() => { carregar(); }, [carregar]);

  function abrirNovo() {
    setEditando(null);
    setForm({ descricao: "", tipo: "saida", valor: "", data_custo: "", fornecedor_id: "" });
    setShowForm(true);
  }

  function abrirEditar(c: Custo) {
    setEditando(c);
    setForm({ descricao: c.descricao, tipo: c.tipo, valor: String(c.valor), data_custo: c.data_custo?.slice(0, 10) || "", fornecedor_id: String(c.fornecedor_id) });
    setShowForm(true);
  }

  async function salvar() {
    try {
      const body = { descricao: form.descricao, tipo: form.tipo, valor: parseFloat(form.valor), data_custo: form.data_custo || undefined, fornecedor_id: parseInt(form.fornecedor_id) };
      if (editando) { await custos.atualizar(editando.id, body); }
      else { await custos.criar(body); }
      setShowForm(false);
      carregar();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Erro"); }
  }

  async function excluir(id: number) {
    if (!confirm("Excluir este custo?")) return;
    try { await custos.excluir(id); carregar(); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Erro"); }
  }

  const totalEntradas = lista.filter((c) => c.tipo === "entrada").reduce((s, c) => s + Number(c.valor), 0);
  const totalSaidas = lista.filter((c) => c.tipo === "saida").reduce((s, c) => s + Number(c.valor), 0);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Custos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{lista.length} registros</p>
        </div>
        <button onClick={abrirNovo} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">+ Novo Custo</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Total Entradas</p>
          <p className="text-xl font-bold text-green-700 mt-1">{fmt(totalEntradas)}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-xs text-red-600 font-medium uppercase tracking-wide">Total Saídas</p>
          <p className="text-xl font-bold text-red-700 mt-1">{fmt(totalSaidas)}</p>
        </div>
        <div className={`${totalEntradas - totalSaidas >= 0 ? "bg-blue-50" : "bg-amber-50"} rounded-xl p-4`}>
          <p className={`text-xs font-medium uppercase tracking-wide ${totalEntradas - totalSaidas >= 0 ? "text-blue-600" : "text-amber-600"}`}>Saldo</p>
          <p className={`text-xl font-bold mt-1 ${totalEntradas - totalSaidas >= 0 ? "text-blue-700" : "text-amber-700"}`}>{fmt(totalEntradas - totalSaidas)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(["", "entrada", "saida"] as const).map((t) => (
          <button key={t} onClick={() => setFiltroTipo(t)} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filtroTipo === t ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {t === "" ? "Todos" : t === "entrada" ? "Entradas" : "Saídas"}
          </button>
        ))}
      </div>

      {loading ? <p className="text-gray-400 text-sm">Carregando...</p> : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Descrição</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Fornecedor</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Tipo</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Valor</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Data</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.descricao}</td>
                  <td className="px-4 py-3 text-gray-600">{c.fornecedor?.nome || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.tipo === "entrada" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {c.tipo === "entrada" ? "Entrada" : "Saída"}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${c.tipo === "entrada" ? "text-green-700" : "text-red-600"}`}>{fmt(Number(c.valor))}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.data_custo ? new Date(c.data_custo).toLocaleDateString("pt-BR") : "—"}</td>
                  <td className="px-4 py-3 flex gap-2 justify-end">
                    <button onClick={() => abrirEditar(c)} className="text-blue-600 hover:underline text-xs">Editar</button>
                    <button onClick={() => excluir(c.id)} className="text-red-500 hover:underline text-xs">Excluir</button>
                  </td>
                </tr>
              ))}
              {lista.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400">Nenhum custo encontrado</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">{editando ? "Editar Custo" : "Novo Custo"}</h2>
            {[{ label: "Descrição *", field: "descricao" }, { label: "Valor *", field: "valor", type: "number" }, { label: "Data", field: "data_custo", type: "date" }].map(({ label, field, type = "text" }) => (
              <div key={field}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <input type={type} value={(form as Record<string, string>)[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tipo *</label>
              <select value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value as "entrada" | "saida" }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>
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
