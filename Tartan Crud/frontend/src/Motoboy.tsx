import { useEffect, useState } from 'react';
import { api } from './api';
import { io } from 'socket.io-client';

export function Motoboy() {
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
    if (atual === 'PRONTO') proximo = 'A_CAMINHO';
    else if (atual === 'A_CAMINHO') proximo = 'ENTREGUE';
    else return;

    try {
      await api.atualizarStatusPedido(id, proximo);
      load();
    } catch (err: any) {
      alert(`Erro ao atualizar: ${err.message}`);
    }
  }

  const pendentes = pedidos.filter(p => p.status === 'PRONTO' || p.status === 'A_CAMINHO');

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Pedidos para Entrega</h2>
      {pendentes.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Nenhum pedido aguardando entrega no momento.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pendentes.map(p => (
            <div key={p.id} style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '18px' }}>Pedido #{p.id.split('-')[0]}</span>
                <span style={{ 
                  background: p.status === 'A_CAMINHO' ? '#dbeafe' : '#fef3c7', 
                  color: p.status === 'A_CAMINHO' ? '#1e40af' : '#92400e',
                  padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600
                }}>
                  {p.status.replace('_', ' ')}
                </span>
              </div>
              <div style={{ marginBottom: '16px', color: 'var(--muted)', fontSize: '14px' }}>
                <strong>Endereço: </strong> 
                {p.enderecoEntrega ? (
                  `${p.enderecoEntrega.rua}, ${p.enderecoEntrega.numero} - ${p.enderecoEntrega.bairro}`
                ) : 'Retirada no balcão / Endereço não informado'}
              </div>
              
              <button 
                className="btn" 
                style={{ width: '100%', padding: '12px' }}
                onClick={() => avancar(p.id, p.status)}
              >
                {p.status === 'PRONTO' ? 'Iniciar Rota (A Caminho)' : 'Marcar como Entregue'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
