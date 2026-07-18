import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from './api';

const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function Dashboard() {
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [resumo, setResumo] = useState<any>(null);
  const [vendidos, setVendidos] = useState<any[]>([]);
  const [bairros, setBairros] = useState<any[]>([]);
  const [serie, setSerie] = useState<any[]>([]);
  const [erro, setErro] = useState('');

  function query() {
    const p = new URLSearchParams();
    if (inicio) p.set('inicio', inicio);
    if (fim) p.set('fim', fim);
    const s = p.toString();
    return s ? `?${s}` : '';
  }

  async function carregar() {
    setErro('');
    try {
      const q = query();
      const [r, v, b, s] = await Promise.all([
        api.resumo(q),
        api.maisVendidos(q),
        api.vendasPorBairro(q),
        api.faturamentoDiario(q),
      ]);
      setResumo(r);
      setVendidos(v);
      setBairros(b);
      setSerie(s);
    } catch (e: any) {
      setErro(e.message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const dataAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '28px', color: 'var(--text)' }}>Olá, Admin 👋</h1>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '15px' }}>Painel de Vendas - {dataAtual.charAt(0).toUpperCase() + dataAtual.slice(1)}</p>
      </div>

      <div className="filters">
        <label>
          Início
          <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </label>
        <label>
          Fim
          <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
        </label>
        <button className="btn" onClick={carregar}>
          Atualizar Dados
        </button>
      </div>
      
      {erro && <div className="error">{erro}</div>}

      {resumo && (
        <div className="cards">
          <div className="card">
            <div className="label">Vendas Totais Hoje</div>
            <div className="value">{brl(resumo.faturamento)}</div>
          </div>
          <div className="card">
            <div className="label">Novos Pedidos</div>
            <div className="value" style={{ color: '#10b981' }}>{resumo.totalPedidos}</div>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div className="label" style={{ marginBottom: '8px' }}>Produtos Mais Vendidos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {vendidos.slice(0, 2).map((v) => (
                <div key={v.nome} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ fontWeight: 500 }}>🍣 {v.nome}</span>
                  <span style={{ color: 'var(--muted)' }}>{brl(v.receita)}</span>
                </div>
              ))}
              {vendidos.length === 0 && <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Sem vendas ainda.</span>}
            </div>
          </div>
          <div className="card">
            <div className="label">Ticket Médio</div>
            <div className="value" style={{ color: '#0ea5e9' }}>{brl(resumo.ticketMedio)}</div>
          </div>
        </div>
      )}

      <div className="panel">
        <h2>Tendência de Vendas</h2>
        {serie.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Sem dados no período.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={serie} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0dcd0" />
              <XAxis dataKey="dia" stroke="#7a776f" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#7a776f" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e0dcd0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                formatter={(v: number) => brl(v)}
                labelStyle={{ color: '#7a776f', marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="faturamento" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorFaturamento)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="panel">
        <h2>Vendas por Bairro (João Pessoa)</h2>
        <table>
          <thead>
            <tr>
              <th>Bairro</th>
              <th>Total de Pedidos</th>
              <th>Faturamento Total</th>
            </tr>
          </thead>
          <tbody>
            {bairros.map((b) => (
              <tr key={b.bairro}>
                <td style={{ fontWeight: 500 }}>{b.bairro}</td>
                <td>{b.pedidos}</td>
                <td style={{ color: 'var(--accent)', fontWeight: 500 }}>{brl(b.faturamento)}</td>
              </tr>
            ))}
            {bairros.length === 0 && (
              <tr>
                <td colSpan={3} style={{ color: 'var(--muted)', textAlign: 'center', padding: '24px' }}>
                  Sem dados para exibir neste período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

