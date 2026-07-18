import { useEffect, useState } from 'react';
import { api } from './api';
import { io } from 'socket.io-client';

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function Cozinha() {
  const [pedidos, setPedidos] = useState<any[]>([]);

  async function load() {
    try {
      const data = await api.listarPedidos();
      setPedidos(data);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  }

  useEffect(() => {
    load();
    const socket = io(); // Conecta no host atual (via vite proxy na porta 3000)
    socket.on('pedidoCriado', () => load());
    socket.on('statusAtualizado', () => load());

    return () => {
      socket.disconnect();
    };
  }, []);

  async function avancar(id: string, atual: string) {
    let proximo = '';
    if (atual === 'CONFIRMADO') proximo = 'EM_PRODUCAO';
    else if (atual === 'EM_PRODUCAO') proximo = 'PRONTO';
    else return;

    try {
      await api.atualizarStatusPedido(id, proximo);
      load();
    } catch (err: any) {
      alert(`Erro ao atualizar: ${err.message}`);
    }
  }

  const colunas = [
    { key: 'CONFIRMADO', title: 'Novos (Confirmados)' },
    { key: 'EM_PRODUCAO', title: 'Em Produção' },
    { key: 'PRONTO', title: 'Prontos (Aguardando Retirada)' }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h2>Cozinha - Kanban</h2>
      <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '16px' }}>
        {colunas.map(col => {
          const lista = pedidos.filter(p => p.status === col.key);
          return (
            <div key={col.key} style={{ flex: 1, minWidth: '300px', background: '#f8f9fa', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', display: 'flex', justifyContent: 'space-between' }}>
                {col.title}
                <span style={{ background: 'var(--border)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>{lista.length}</span>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {lista.map(p => (
                  <div key={p.id} style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600 }}>Pedido #{p.id.split('-')[0]}</span>
                      <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{new Date(p.criadoEm).toLocaleTimeString()}</span>
                    </div>
                    <ul style={{ paddingLeft: '20px', margin: '0 0 16px 0', fontSize: '14px' }}>
                      {p.itens?.map((i: any) => (
                        <li key={i.id}>{i.quantidade}x {i.produto?.nome}</li>
                      ))}
                    </ul>
                    {col.key !== 'PRONTO' && (
                      <button 
                        className="btn" 
                        style={{ width: '100%', padding: '8px' }}
                        onClick={() => avancar(p.id, p.status)}
                      >
                        {col.key === 'CONFIRMADO' ? 'Iniciar Produção' : 'Marcar como Pronto'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
