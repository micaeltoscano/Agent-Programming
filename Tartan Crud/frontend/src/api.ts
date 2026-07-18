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
}

export const api = {
  login: (email: string, senha: string) =>
    req<{ accessToken: string; usuario: Usuario }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    }),

  // Dashboard
  resumo: (q = '') => req<any>(`/dashboard/resumo${q}`),
  maisVendidos: (q = '') => req<any[]>(`/dashboard/mais-vendidos${q}`),
  vendasPorBairro: (q = '') => req<any[]>(`/dashboard/vendas-por-bairro${q}`),
  faturamentoDiario: (q = '') => req<any[]>(`/dashboard/faturamento-diario${q}`),

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
};
