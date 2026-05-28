"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { dashboard, DashboardData, LucroPorCategoria } from "@/lib/api";

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Home() {
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [lucro, setLucro] = useState<LucroPorCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
        const [d, l] = await Promise.all([
          dashboard.visaoGeral(),
          dashboard.lucroPorCategoria(),
        ]);
        setDados(d);
        setLucro(l);
      } catch (e: unknown) {
        setErro(e instanceof Error ? e.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Carregando painel...</div>;
  if (erro) return <div className="p-8 text-red-600 bg-red-50 rounded-xl m-8">Erro: {erro} — verifique se a API está rodando em <code>http://localhost:8080</code></div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Painel de Controle</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral do sistema InovaTech</p>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Fornecedores ativos" value={dados!.fornecedores.ativos} sub={`${dados!.fornecedores.total} total`} color="blue" />
        <MetricCard label="Produtos cadastrados" value={dados!.produtos.total} sub={`${dados!.produtos.estoque_baixo} com estoque baixo`} color={dados!.produtos.estoque_baixo > 0 ? "red" : "green"} />
        <MetricCard label="Saldo financeiro" value={fmt(dados!.financeiro.saldo)} sub={`Entradas: ${fmt(dados!.financeiro.total_entradas)}`} color={dados!.financeiro.saldo >= 0 ? "green" : "red"} />
        <MetricCard label="Documentos" value={dados!.documentos.total} sub={`${dados!.documentos.vencendo_30_dias} vencem em 30 dias`} color={dados!.documentos.vencendo_30_dias > 0 ? "amber" : "green"} />
      </div>

      {/* Acesso rápido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/fornecedores", label: "Fornecedores", icon: "🏭" },
          { href: "/produtos", label: "Produtos", icon: "📦" },
          { href: "/custos", label: "Custos", icon: "💰" },
          { href: "/documentos", label: "Documentos", icon: "📄" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-sm transition-all flex items-center gap-3">
            <span className="text-2xl">{item.icon}</span>
            <span className="font-medium text-gray-700">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Lucro por categoria */}
      {lucro.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Resultado por Categoria de Fornecedor</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-left">
                  <th className="pb-2 font-medium">Categoria</th>
                  <th className="pb-2 font-medium text-right">Entradas</th>
                  <th className="pb-2 font-medium text-right">Saídas</th>
                  <th className="pb-2 font-medium text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {lucro.map((row) => (
                  <tr key={row.categoria} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">{row.categoria}</td>
                    <td className="py-3 text-right text-green-700">{fmt(row.entradas)}</td>
                    <td className="py-3 text-right text-red-600">{fmt(row.saidas)}</td>
                    <td className={`py-3 text-right font-semibold ${row.saldo >= 0 ? "text-green-700" : "text-red-600"}`}>{fmt(row.saldo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categorias de fornecedores */}
      {dados!.fornecedores.por_categoria.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Fornecedores por Categoria</h2>
          <div className="flex flex-wrap gap-3">
            {dados!.fornecedores.por_categoria.map((cat) => (
              <div key={cat.categoria} className="bg-blue-50 text-blue-800 rounded-lg px-4 py-2 text-sm font-medium">
                {cat.categoria} <span className="ml-2 bg-blue-200 text-blue-900 rounded-full px-2 py-0.5 text-xs">{cat.quantidade}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: "blue" | "green" | "red" | "amber" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs mt-1 opacity-60">{sub}</p>
    </div>
  );
}
