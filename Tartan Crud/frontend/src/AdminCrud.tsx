import { useEffect, useState } from 'react';
import { api } from './api';

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function AdminCrud() {
  const [activeTab, setActiveTab] = useState<'categorias' | 'insumos' | 'produtos'>('categorias');
  
  const [categorias, setCategorias] = useState<any[]>([]);
  const [insumos, setInsumos] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  async function loadData() {
    setLoading(true);
    try {
      if (activeTab === 'categorias') setCategorias(await api.categorias());
      if (activeTab === 'insumos') setInsumos(await api.insumos());
      if (activeTab === 'produtos') setProdutos(await api.produtos());
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    setEditingItem(null);
  }, [activeTab]);

  async function handleDelete(id: string) {
    if (!window.confirm('Tem certeza que deseja excluir?')) return;
    try {
      if (activeTab === 'categorias') await api.deleteCategoria(id);
      if (activeTab === 'insumos') await api.deleteInsumo(id);
      if (activeTab === 'produtos') await api.deleteProduto(id);
      loadData();
    } catch (err: any) {
      alert(`Erro ao excluir: ${err.message}`);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const isNew = !editingItem.id;
      
      if (activeTab === 'categorias') {
        if (isNew) await api.createCategoria(editingItem);
        else await api.updateCategoria(editingItem.id, editingItem);
      }
      if (activeTab === 'insumos') {
        // Garantindo tipos esperados pelo backend
        const payload = {
          ...editingItem,
          quantidade: String(editingItem.quantidade),
          estoqueMinimo: String(editingItem.estoqueMinimo)
        };
        if (isNew) await api.createInsumo(payload);
        else await api.updateInsumo(editingItem.id, payload);
      }
      if (activeTab === 'produtos') {
        // Garantindo formatação de produtos e insumos
        const payload = {
          ...editingItem,
          preco: String(editingItem.preco),
          categoriaId: editingItem.categoria?.id || editingItem.categoriaId,
          insumos: editingItem.insumos?.map((i: any) => ({
            insumoId: i.insumo?.id || i.insumoId,
            quantidade: String(i.quantidade)
          })) || []
        };
        if (isNew) await api.createProduto(payload);
        else await api.updateProduto(editingItem.id, payload);
      }
      
      setEditingItem(null);
      loadData();
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message}`);
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2>Painel Administrativo</h2>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        {['categorias', 'insumos', 'produtos'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              padding: '12px 24px', background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '16px', color: activeTab === tab ? 'var(--accent)' : 'var(--muted)',
              borderBottom: activeTab === tab ? '3px solid var(--accent)' : '3px solid transparent'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3>Gerenciar {activeTab}</h3>
        <button className="btn" onClick={() => setEditingItem({})}>+ Adicionar Novo</button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px' }}>Nome</th>
              {activeTab === 'insumos' && <th style={{ padding: '12px 16px' }}>Qtd / Min</th>}
              {activeTab === 'produtos' && <th style={{ padding: '12px 16px' }}>Preço</th>}
              {activeTab === 'produtos' && <th style={{ padding: '12px 16px' }}>Categoria</th>}
              <th style={{ padding: '12px 16px', width: '150px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {(activeTab === 'categorias' ? categorias : activeTab === 'insumos' ? insumos : produtos).map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px' }}>{item.nome}</td>
                {activeTab === 'insumos' && <td style={{ padding: '12px 16px' }}>{item.quantidade}{item.unidade} (Mín: {item.estoqueMinimo})</td>}
                {activeTab === 'produtos' && <td style={{ padding: '12px 16px' }}>{brl(Number(item.preco))}</td>}
                {activeTab === 'produtos' && <td style={{ padding: '12px 16px' }}>{item.categoria?.nome}</td>}
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => setEditingItem({...item})} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '12px' }}>Editar</button>
                  <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>{editingItem.id ? 'Editar' : 'Novo'} {activeTab.slice(0, -1)}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="field">
                <label>Nome</label>
                <input required type="text" value={editingItem.nome || ''} onChange={e => setEditingItem({...editingItem, nome: e.target.value})} />
              </div>

              {activeTab === 'categorias' && (
                <div className="field">
                  <label>Descrição</label>
                  <input type="text" value={editingItem.descricao || ''} onChange={e => setEditingItem({...editingItem, descricao: e.target.value})} />
                </div>
              )}

              {activeTab === 'insumos' && (
                <>
                  <div className="field">
                    <label>Unidade (ex: g, ml, un)</label>
                    <input required type="text" value={editingItem.unidade || ''} onChange={e => setEditingItem({...editingItem, unidade: e.target.value})} />
                  </div>
                  <div className="field">
                    <label>Qtd Atual</label>
                    <input required type="number" step="0.01" value={editingItem.quantidade || ''} onChange={e => setEditingItem({...editingItem, quantidade: e.target.value})} />
                  </div>
                  <div className="field">
                    <label>Estoque Mínimo</label>
                    <input required type="number" step="0.01" value={editingItem.estoqueMinimo || ''} onChange={e => setEditingItem({...editingItem, estoqueMinimo: e.target.value})} />
                  </div>
                </>
              )}

              {activeTab === 'produtos' && (
                <>
                  <div className="field">
                    <label>Descrição</label>
                    <input type="text" value={editingItem.descricao || ''} onChange={e => setEditingItem({...editingItem, descricao: e.target.value})} />
                  </div>
                  <div className="field">
                    <label>Preço</label>
                    <input required type="number" step="0.01" value={editingItem.preco || ''} onChange={e => setEditingItem({...editingItem, preco: e.target.value})} />
                  </div>
                  <div className="field">
                    <label>Imagem URL (Mock)</label>
                    <input type="text" value={editingItem.imagem || ''} onChange={e => setEditingItem({...editingItem, imagem: e.target.value})} />
                  </div>
                  <div className="field">
                    <label>Categoria ID</label>
                    {/* Simplified for the MVP: a text input. Ideally it's a select. */}
                    <input required type="text" value={editingItem.categoria?.id || editingItem.categoriaId || ''} onChange={e => setEditingItem({...editingItem, categoriaId: e.target.value})} placeholder="UUID da Categoria" />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>Salvar</button>
                <button type="button" className="btn secondary" style={{ flex: 1 }} onClick={() => setEditingItem(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
