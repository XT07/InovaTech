const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro || `Erro ${res.status}`);
  }
  return res.json();
}

// ── Dashboard ──────────────────────────────────────────────
export interface DashboardData {
  fornecedores: {
    total: number;
    ativos: number;
    inativos: number;
    por_categoria: { categoria: string; quantidade: number }[];
  };
  produtos: { total: number; estoque_baixo: number };
  financeiro: { total_entradas: number; total_saidas: number; saldo: number };
  documentos: { total: number; vencendo_30_dias: number };
}

export interface LucroPorCategoria {
  categoria: string;
  entradas: number;
  saidas: number;
  saldo: number;
}

export const dashboard = {
  visaoGeral: () => request<DashboardData>("/api/dashboard"),
  lucroPorCategoria: () => request<LucroPorCategoria[]>("/api/dashboard/lucro-por-categoria"),
};

// ── Fornecedores ──────────────────────────────────────────
export interface Fornecedor {
  id: number;
  nome: string;
  categoria: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const fornecedores = {
  listar: (params?: { categoria?: string; ativo?: boolean; busca?: string }) => {
    const q = new URLSearchParams();
    if (params?.categoria) q.set("categoria", params.categoria);
    if (params?.ativo !== undefined) q.set("ativo", String(params.ativo));
    if (params?.busca) q.set("busca", params.busca);
    return request<Fornecedor[]>(`/api/fornecedores?${q}`);
  },
  buscarPorId: (id: number) => request<Fornecedor>(`/api/fornecedores/${id}`),
  criar: (body: Omit<Fornecedor, "id" | "ativo" | "createdAt" | "updatedAt">) =>
    request<Fornecedor>("/api/fornecedores", { method: "POST", body: JSON.stringify(body) }),
  atualizar: (id: number, body: Partial<Fornecedor>) =>
    request<Fornecedor>(`/api/fornecedores/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  excluir: (id: number) => request<{ mensagem: string }>(`/api/fornecedores/${id}`, { method: "DELETE" }),
};

// ── Produtos ──────────────────────────────────────────────
export interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  preco_custo: number;
  preco_venda?: number;
  quantidade_estoque: number;
  estoque_minimo: number;
  fornecedor_id: number;
  fornecedor?: { id: number; nome: string; categoria: string };
  createdAt?: string;
  updatedAt?: string;
}

export const produtos = {
  listar: (params?: { fornecedor_id?: number }) => {
    const q = new URLSearchParams();
    if (params?.fornecedor_id) q.set("fornecedor_id", String(params.fornecedor_id));
    return request<Produto[]>(`/api/produtos?${q}`);
  },
  estoqueBaixo: () => request<Produto[]>("/api/produtos/estoque-baixo"),
  buscarPorId: (id: number) => request<Produto>(`/api/produtos/${id}`),
  criar: (body: Omit<Produto, "id" | "fornecedor" | "createdAt" | "updatedAt">) =>
    request<Produto>("/api/produtos", { method: "POST", body: JSON.stringify(body) }),
  atualizar: (id: number, body: Partial<Produto>) =>
    request<Produto>(`/api/produtos/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  excluir: (id: number) => request<{ mensagem: string }>(`/api/produtos/${id}`, { method: "DELETE" }),
};

// ── Custos ────────────────────────────────────────────────
export interface Custo {
  id: number;
  descricao: string;
  tipo: "entrada" | "saida";
  valor: number;
  data_custo?: string;
  fornecedor_id: number;
  fornecedor?: { id: number; nome: string; categoria: string };
  createdAt?: string;
  updatedAt?: string;
}

export const custos = {
  listar: (params?: { fornecedor_id?: number; tipo?: "entrada" | "saida"; data_inicio?: string; data_fim?: string }) => {
    const q = new URLSearchParams();
    if (params?.fornecedor_id) q.set("fornecedor_id", String(params.fornecedor_id));
    if (params?.tipo) q.set("tipo", params.tipo);
    if (params?.data_inicio) q.set("data_inicio", params.data_inicio);
    if (params?.data_fim) q.set("data_fim", params.data_fim);
    return request<Custo[]>(`/api/custos?${q}`);
  },
  resumo: () => request<unknown[]>("/api/custos/resumo"),
  buscarPorId: (id: number) => request<Custo>(`/api/custos/${id}`),
  criar: (body: Omit<Custo, "id" | "fornecedor" | "createdAt" | "updatedAt">) =>
    request<Custo>("/api/custos", { method: "POST", body: JSON.stringify(body) }),
  atualizar: (id: number, body: Partial<Custo>) =>
    request<Custo>(`/api/custos/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  excluir: (id: number) => request<{ mensagem: string }>(`/api/custos/${id}`, { method: "DELETE" }),
};

// ── Documentos ────────────────────────────────────────────
export interface Documento {
  id: number;
  nome: string;
  tipo?: string;
  caminho_arquivo?: string;
  data_vencimento?: string;
  fornecedor_id: number;
  fornecedor?: { id: number; nome: string };
  createdAt?: string;
  updatedAt?: string;
}

export const documentos = {
  listar: (params?: { fornecedor_id?: number; tipo?: string }) => {
    const q = new URLSearchParams();
    if (params?.fornecedor_id) q.set("fornecedor_id", String(params.fornecedor_id));
    if (params?.tipo) q.set("tipo", params.tipo);
    return request<Documento[]>(`/api/documentos?${q}`);
  },
  vencimentos: (dias?: number) =>
    request<Documento[]>(`/api/documentos/vencimentos${dias ? `?dias=${dias}` : ""}`),
  buscarPorId: (id: number) => request<Documento>(`/api/documentos/${id}`),
  criar: (body: Omit<Documento, "id" | "fornecedor" | "createdAt" | "updatedAt">) =>
    request<Documento>("/api/documentos", { method: "POST", body: JSON.stringify(body) }),
  atualizar: (id: number, body: Partial<Documento>) =>
    request<Documento>(`/api/documentos/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  excluir: (id: number) => request<{ mensagem: string }>(`/api/documentos/${id}`, { method: "DELETE" }),
};
