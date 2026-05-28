"use client";

import { useState, useEffect, useCallback } from "react";
import { produtos, fornecedores, Produto, Fornecedor } from "@/lib/api";

export default function ProdutosPage() {
  const [lista, setLista] = useState<Produto[]>([]);
  const [listaFornecedores, setListaFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [soEstoqueBaixo, setSoEstoqueBaixo] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [form, setForm] = useState({ nome: "", descricao: "", preco_custo: "", preco_venda: "", quantidade_estoque: "0", estoque_minimo: "5", fornecedor_id: "" });

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [p, f] = await Promise.all([
        soEstoqueBaixo ? produtos.estoqueBaixo() : produtos.listar(),
        fornecedores.listar(),
      ]);
      setLista(p);
      setListaFornecedores(f);
    } finally {
      setLoading(false);
    }
  }, [soEstoqueBaixo]);

  useEffect(() => { carregar(); }, [carregar]);

  function abrirNovo() {
    setEditando(null);
    setForm({ nome: "", descricao: "", preco_custo: "", preco_venda: "", quantidade_estoque: "0", estoque_minimo: "5", fornecedor_id: "" });
    setShowForm(true);
  }

  function abrirEditar(p: Produto) {
    setEditando(p);
    setForm({
      nome: p.nome, descricao: p.descricao || "", preco_custo: String(p.preco_custo),
      preco_venda: String(p.preco_venda || ""), quantidade_estoque: String(p.quantidade_estoque),
      estoque_minimo: String(p.estoque_minimo), fornecedor_id: String(p.fornecedor_id),
    });
    setShowForm(true);
  }

  async function salvar() {
    try {
      const body = {
        nome: form.nome, descricao: form.descricao,
        preco_custo: parseFloat(form.preco_custo),
        preco_venda: form.preco_venda ? parseFloat(form.preco_venda) : undefined,
        quantidade_estoque: parseInt(form.quantidade_estoque),
        estoque_minimo: parseInt(form.estoque_minimo),
        fornecedor_id: parseInt(form.fornecedor_id),
      };
      if (editando) {
        await produtos.atualizar(editando.id, body);
      } else {
        await produtos.criar(body);
      }
      setShowForm(false);
      carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao salvar");
    }
  }

  async function excluir(id: number) {
    if (!confirm("Excluir este produto?")) return;
    try { await produtos.excluir(id); carregar(); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Erro"); }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Produtos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{lista.length} registros</p>
        </div>
        <button onClick={abrirNovo} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Novo Produto
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
        <input type="checkbox" checked={soEstoqueBaixo} onChange={(e) => setSoEstoqueBaixo(e.target.checked)} className="rounded" />
        Mostrar apenas estoque baixo
      </label>

      {loading ? <p className="text-gray-400 text-sm">Carregando...</p> : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Nome</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Fornecedor</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Custo</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Venda</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Estoque</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => {
                const baixo = p.quantidade_estoque <= p.estoque_minimo;
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.nome}</td>
                    <td className="px-4 py-3 text-gray-600">{p.fornecedor?.nome || "—"}</td>
                    <td className="px-4 py-3 text-right text-gray-700">R$ {Number(p.preco_custo).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{p.preco_venda ? `R$ ${Number(p.preco_venda).toFixed(2)}` : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${baixo ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {p.quantidade_estoque} {baixo && "(baixo)"}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <button onClick={() => abrirEditar(p)} className="text-blue-600 hover:underline text-xs">Editar</button>
                      <button onClick={() => excluir(p.id)} className="text-red-500 hover:underline text-xs">Excluir</button>
                    </td>
                  </tr>
                );
              })}
              {lista.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400">Nenhum produto encontrado</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold">{editando ? "Editar Produto" : "Novo Produto"}</h2>
            <FormField label="Nome *" value={form.nome} onChange={(v) => setForm((p) => ({ ...p, nome: v }))} />
            <FormField label="Descrição" value={form.descricao} onChange={(v) => setForm((p) => ({ ...p, descricao: v }))} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Preço de custo *" value={form.preco_custo} onChange={(v) => setForm((p) => ({ ...p, preco_custo: v }))} type="number" />
              <FormField label="Preço de venda" value={form.preco_venda} onChange={(v) => setForm((p) => ({ ...p, preco_venda: v }))} type="number" />
              <FormField label="Qtd. estoque" value={form.quantidade_estoque} onChange={(v) => setForm((p) => ({ ...p, quantidade_estoque: v }))} type="number" />
              <FormField label="Estoque mínimo" value={form.estoque_minimo} onChange={(v) => setForm((p) => ({ ...p, estoque_minimo: v }))} type="number" />
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

function FormField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );
}
