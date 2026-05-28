"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// 1. Definição da estrutura dos dados que vêm da API
interface DashboardData {
  totalFornecedores: number;
  comprasPendentes: number;
  lucroEstimado: number;
  ultimasMovimentacoes: { id: number; fornecedor: string; valor: number; status: string }[];
}

export default function Home() {
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // 2. Simulação da requisição para a API
  useEffect(() => {
    async function carregarDadosDashboard() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const dadosSimulados: DashboardData = {
          totalFornecedores: 42,
          comprasPendentes: 15,
          lucroEstimado: 24850.0,
          ultimasMovimentacoes: [
            { id: 1, fornecedor: "Distribuidora Alfa", valor: 4500, status: "Concluído" },
            { id: 2, fornecedor: "Logística Brasil", valor: 1200, status: "Pendente" },
            { id: 3, fornecedor: "Indústria Metalúrgica X", valor: 8900, status: "Concluído" },
          ],
        };

        setDados(dadosSimulados);
      } catch (error) {
        console.error("Erro ao buscar dados da API", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDadosDashboard();
  } ,[] );

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>Carregando dados do painel...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Topo / Navbar Simples */}
      <header style={styles.header}>
        <div style={styles.logoWrapper}>
          <Image
            src="/Captura de tela 2026-05-27 204009.png"
            alt="Gestão de Fornecedores"
            width={300}
            height={100}
            style={styles.logo}
            priority
          />
        </div>
        <h1 style={styles.title}>Painel de Controle</h1>
      </header>

      <main style={styles.main}>
        {/* 3. Grid de Cards com os Indicadores da API */}
        <section style={styles.metricsGrid}>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Total de Fornecedores</p>
            <h2 style={styles.cardValue}>{dados?.totalFornecedores}</h2>
          </div>

          <div style={styles.card}>
            <p style={styles.cardLabel}>Compras Pendentes</p>
            <h2 style={{ ...styles.cardValue, color: "#e53e3e" }}>{dados?.comprasPendentes}</h2>
          </div>

          <div style={styles.card}>
            <p style={styles.cardLabel}>Lucro Estimado</p>
            <h2 style={{ ...styles.cardValue, color: "#38a169" }}>
              R$ {dados?.lucroEstimado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </h2>
          </div>
        </section>

        {/* 4. Tabela de Últimas Movimentações vindas da API */}
        <section style={styles.tableSection}>
          <h3 style={styles.sectionTitle}>Últimas Movimentações de Compras</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Fornecedor</th>
                  <th style={styles.th}>Valor</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {dados?.ultimasMovimentacoes.map((item) => (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.td}>{item.fornecedor}</td>
                    <td style={styles.td}>R$ {item.valor.toFixed(2)}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: item.status === "Concluído" ? "#e6fffa" : "#fffaf0",
                          color: item.status === "Concluído" ? "#234e52" : "#7b341e",
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <p>Dashboard integrado à API de Gestão</p>
      </footer>
    </div>
  );
}

// Estilizações focadas em formato Dashboard (Limpo e moderno)
const styles = {
  container: {
    backgroundColor: "#f7fafc",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: "#2d3748",
  },
  loadingText: {
    fontSize: "1.2rem",
    fontWeight: "500",
    color: "#4a5568",
    margin: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e2e8f0",
    flexWrap: "wrap" as const,
    gap: "1rem",
  },
  logoWrapper: {
    maxWidth: "220px",
  },
  logo: {
    width: "100%",
    height: "auto",
    objectFit: "contain" as const,
  },
  title: {
    fontSize: "1.5rem",
    margin: 0,
    fontWeight: "600",
  },
  main: {
    padding: "2rem",
    flex: 1,
    maxWidth: "1200px",
    width: "100%",
    margin: "0 auto",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2.5rem",
  },
  card: {
    backgroundColor: "#fff",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
  },
  cardLabel: {
    fontSize: "0.875rem",
    color: "#718096",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    margin: "0 0 0.5rem 0",
  },
  cardValue: {
    fontSize: "2rem",
    margin: 0,
    fontWeight: "700",
  },
  tableSection: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    padding: "1.5rem",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    fontSize: "1.15rem",
    margin: "0 0 1rem 0",
    fontWeight: "600",
  },
  tableWrapper: {
    overflowX: "auto" as const,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    textAlign: "left" as const,
  },
  thRow: {
    borderBottom: "2px solid #edf2f7",
  },
  th: {
    padding: "0.75rem 1rem",
    color: "#718096",
    fontWeight: "600",
    fontSize: "0.875rem",
  },
  tr: {
    borderBottom: "1px solid #edf2f7",
  },
  td: {
    padding: "1rem",
    fontSize: "0.95rem",
  },
  statusBadge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  footer: {
    padding: "1.5rem",
    textAlign: "center" as const,
    fontSize: "0.875rem",
    color: "#a0aec0",
    borderTop: "1px solid #e2e8f0",
    backgroundColor: "#fff",
  },
};