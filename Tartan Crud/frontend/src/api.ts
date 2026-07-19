const TOKEN_KEY = 'tartan_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string | null) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.message ?? res.statusText;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return data as T;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: string;
  enderecos?: any[];
}

export const api = {
  login: (email: string, senha: string) =>
    req<{ accessToken: string; usuario: Usuario }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    }),
  register: (nome: string, email: string, senha: string) =>
    req<Usuario>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nome, email, senha }),
    }),
  me: () => req<Usuario>('/auth/me'),

  // Dashboard
  resumo: (q = '') => req<any>(`/dashboard/resumo${q}`),
  maisVendidos: (q = '') => req<any[]>(`/dashboard/mais-vendidos${q}`),
  vendasPorBairro: (q = '') => req<any[]>(`/dashboard/vendas-por-bairro${q}`),
  faturamentoDiario: (q = '') => req<any[]>(`/dashboard/faturamento-diario${q}`),

  // Catálogo
  categorias: () => req<any[]>('/categorias'),
  produtos: () => req<any[]>('/produtos'),

  // Chat (Ollama)
  chatStatus: () =>
    req<{ online: boolean; model: string; modelosDisponiveis?: string[] }>(
      '/chat/status',
    ),
  chat: (messages: { role: string; content: string }[]) =>
    req<{ role: 'assistant'; content: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    }),

  // Pedidos
  listarPedidos: () => req<any[]>('/pedidos'),
  criarPedido: (payload: any) => req<any>('/pedidos', { method: 'POST', body: JSON.stringify(payload) }),
  atualizarStatusPedido: (id: string, status: string) => req<any>(`/pedidos/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  abandonedCart: (itens: any) => req<any>('/pedidos/abandoned-cart', { method: 'POST', body: JSON.stringify({ itens }) }),

  // CRUD Admin
  insumos: () => req<any[]>('/estoque'),
  createCategoria: (payload: any) => req<any>('/categorias', { method: 'POST', body: JSON.stringify(payload) }),
  updateCategoria: (id: string, payload: any) => req<any>(`/categorias/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteCategoria: (id: string) => req<any>(`/categorias/${id}`, { method: 'DELETE' }),

  createProduto: (payload: any) => req<any>('/produtos', { method: 'POST', body: JSON.stringify(payload) }),
  updateProduto: (id: string, payload: any) => req<any>(`/produtos/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteProduto: (id: string) => req<any>(`/produtos/${id}`, { method: 'DELETE' }),

  createInsumo: (payload: any) => req<any>('/estoque', { method: 'POST', body: JSON.stringify(payload) }),
  updateInsumo: (id: string, payload: any) => req<any>(`/estoque/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteInsumo: (id: string) => req<any>(`/estoque/${id}`, { method: 'DELETE' }),
};
