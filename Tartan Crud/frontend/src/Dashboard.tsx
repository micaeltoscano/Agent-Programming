import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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

  return (
    <div className="container">
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
          Aplicar filtro
        </button>
      </div>
      {erro && <div className="error">{erro}</div>}

      {resumo && (
        <div className="cards">
          <div className="card">
            <div className="label">Faturamento</div>
            <div className="value accent">{brl(resumo.faturamento)}</div>
          </div>
          <div className="card">
            <div className="label">Ticket médio</div>
            <div className="value">{brl(resumo.ticketMedio)}</div>
          </div>
          <div className="card">
            <div className="label">Pedidos</div>
            <div className="value">{resumo.totalPedidos}</div>
          </div>
          <div className="card">
            <div className="label">Cancelados</div>
            <div className="value">
              {resumo.pedidosCancelados}{' '}
              <span style={{ fontSize: 14, color: 'var(--muted)' }}>
                ({(resumo.taxaCancelamento * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="panel">
        <h2>Faturamento diário</h2>
        {serie.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Sem dados no período.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={serie}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2c3442" />
              <XAxis dataKey="dia" stroke="#9aa4b2" fontSize={12} />
              <YAxis stroke="#9aa4b2" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#1a1f27', border: '1px solid #2c3442' }}
                formatter={(v: number) => brl(v)}
              />
              <Line type="monotone" dataKey="faturamento" stroke="#f0a500" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="panel">
        <h2>Produtos mais vendidos</h2>
        {vendidos.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Sem vendas no período.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={vendidos} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2c3442" />
              <XAxis type="number" stroke="#9aa4b2" fontSize={12} />
              <YAxis type="category" dataKey="nome" stroke="#9aa4b2" fontSize={12} width={140} />
              <Tooltip contentStyle={{ background: '#1a1f27', border: '1px solid #2c3442' }} />
              <Bar dataKey="quantidade" fill="#e23744" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="panel">
        <h2>Vendas por bairro (João Pessoa)</h2>
        <table>
          <thead>
            <tr>
              <th>Bairro</th>
              <th>Pedidos</th>
              <th>Faturamento</th>
            </tr>
          </thead>
          <tbody>
            {bairros.map((b) => (
              <tr key={b.bairro}>
                <td>{b.bairro}</td>
                <td>{b.pedidos}</td>
                <td>{brl(b.faturamento)}</td>
              </tr>
            ))}
            {bairros.length === 0 && (
              <tr>
                <td colSpan={3} style={{ color: 'var(--muted)' }}>
                  Sem dados no período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
