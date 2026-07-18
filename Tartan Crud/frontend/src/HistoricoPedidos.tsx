import { useEffect, useState } from 'react';
import { api } from './api';
import { io } from 'socket.io-client';

const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const StatusMap: Record<string, string> = {
  'PENDENTE': 'Pendente',
  'PREPARANDO': 'Preparando',
  'PRONTO': 'Pronto para Retirada',
  'EM_ROTA': 'Em Rota de Entrega',
  'ENTREGUE': 'Entregue',
  'CANCELADO': 'Cancelado',
};

const StatusColor: Record<string, string> = {
  'PENDENTE': '#f59e0b',
  'PREPARANDO': '#3b82f6',
  'PRONTO': '#8b5cf6',
  'EM_ROTA': '#ec4899',
  'ENTREGUE': '#10b981',
  'CANCELADO': '#ef4444',
};

export function HistoricoPedidos() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.listarPedidos();
        setPedidos(data);
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }
    load();
    const socket = io();
    socket.on('pedidoCriado', () => load());
    socket.on('statusAtualizado', () => load());

    return () => {
      socket.disconnect();
    };
  }, []);

  if (carregando) return <div style={{ padding: '24px' }}>Carregando histórico...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', margin: '0 0 24px' }}>Histórico de Pedidos</h2>
      
      {pedidos.length === 0 ? (
        <div style={{ padding: '40px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--muted)' }}>
          Você ainda não realizou nenhum pedido.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pedidos.map(p => (
            <div key={p.id} style={{ padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <span style={{ fontWeight: 600 }}>Pedido #{p.id.split('-')[0].toUpperCase()}</span>
                <span style={{ background: StatusColor[p.status] || '#ccc', color: 'white', padding: '4px 12px', borderRadius: '24px', fontSize: '13px', fontWeight: 600 }}>
                  {StatusMap[p.status] || p.status}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {p.itens.map((i: any) => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span>{i.quantidade}x {i.produto?.nome || 'Produto Indisponível'}</span>
                    <span style={{ color: 'var(--muted)' }}>{brl(Number(i.precoUnitario) * Number(i.quantidade))}</span>
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--border)' }}>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>
                  {new Date(p.criadoEm).toLocaleString('pt-BR')}
                </span>
                <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--accent)' }}>
                  Total: {brl(Number(p.total))}
                </span>
              </div>
              {p.cupom && (
                <div style={{ marginTop: '8px', fontSize: '13px', color: '#10b981', textAlign: 'right' }}>
                  Desconto aplicado (Cupom: {p.cupom.codigo})
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
