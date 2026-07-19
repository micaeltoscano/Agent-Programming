import { useEffect, useRef, useState } from 'react';
import { api } from './api';
import { useCart, Produto } from './contexts/CartContext';
import { useAuth } from './contexts/AuthContext';
const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
// Interface Produto movida para CartContext
export function Catalogo() {
  const { carrinho, addAoCarrinho, removerDoCarrinho, alterarQtd, limparCarrinho } = useCart();
  const { usuario } = useAuth();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('');
  const [cupomInput, setCupomInput] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  // Ref para carrinho: usada no cleanup de abandono sem criar nova dependência
  const carrinhoRef = useRef(carrinho);
  useEffect(() => { carrinhoRef.current = carrinho; }, [carrinho]);
  const isCliente = usuario?.role === 'CLIENTE';
  useEffect(() => {
    async function load() {
      try {
        const [cats, prods] = await Promise.all([
          api.categorias(),
          api.produtos()
        ]);
        setCategorias([{id: '', nome: 'Todos'}, ...cats]);
        setProdutos(prods);
        setCategoriaAtiva('');
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);
  useEffect(() => {
    if (usuario?.enderecos && usuario.enderecos.length > 0) {
      const end = usuario.enderecos[0];
      setLogradouro(end.logradouro || '');
      setNumero(end.numero || '');
      setBairro(end.bairro || '');
    }
  }, [usuario]);
  // Fase 7: Carrinho Abandonado — dispara ao DESMONTAR a página com itens no carrinho.
  // A regra correta é: cliente saiu da página sem finalizar.
  useEffect(() => {
    return () => {
      if (carrinhoRef.current.length > 0 && isCliente) {
        api.abandonedCart(carrinhoRef.current).catch(console.error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function finalizarPedido() {
    if (!logradouro || !numero || !bairro) {
      alert('Por favor, preencha todos os campos do endereço de entrega.');
      return;
    }
    try {
      const payload = {
        itens: carrinho.map(c => ({ produtoId: c.produto.id, quantidade: c.qtd })),
        metodoPagamento: 'PIX', // Fixo para o MVP
        cupomCodigo: cupomInput || undefined,
        enderecoNovo: { logradouro, numero, bairro },
      };
      
      const res = await api.criarPedido(payload);
      
      alert(`✅ Pedido realizado com sucesso! Total: ${brl(Number(res.total))}.` + (res.cupomGerado ? `\n🎉 Parabéns! Você ganhou o cupom ${res.cupomGerado.codigo} para a próxima compra!` : ''));
      limparCarrinho();
    } catch (err: any) {
      alert(`❌ Erro ao finalizar: ${err.message}`);
    }
  }
  const subtotal = carrinho.reduce((acc, item) => acc + (item.produto.preco * item.qtd), 0);
  const prodFiltrados = produtos.filter(p => !categoriaAtiva || p.categoria?.id === categoriaAtiva);
  return (
    <div className="catalogo-container">
      
      {/* Esquerda: Produtos */}
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: '24px', margin: '0 0 16px' }}>Catálogo</h2>
        
        {/* Chips de Categoria */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px', WebkitOverflowScrolling: 'touch' }}>
          {categorias.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              style={{
                padding: '8px 16px', borderRadius: '24px', border: '1px solid var(--border)',
                background: categoriaAtiva === cat.id ? 'var(--accent)' : 'white',
                color: categoriaAtiva === cat.id ? 'white' : 'var(--text)',
                cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {cat.nome}
            </button>
          ))}
        </div>
        {/* Grid de Produtos */}
        <div className="produtos-grid">
          {prodFiltrados.map(p => (
            <div key={p.id} className="produto-card">
              <div style={{ width: '100%', aspectRatio: '4/3', background: '#f4f2eb', borderRadius: '8px', overflow: 'hidden' }}>
                {p.imagem ? (
                  <img src={p.imagem} alt={p.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '14px' }}>Sem imagem</span>
                  </div>
                )}
              </div>
              <h3 style={{ margin: '12px 0 4px', fontSize: '16px', fontWeight: 600 }}>{p.nome}</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', flex: 1 }}>{p.descricao}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
                <span style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '16px' }}>{brl(p.preco)}</span>
                {isCliente && (
                  <button 
                    onClick={() => addAoCarrinho(p)}
                    style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '20px', transition: 'background 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#991b1b'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'var(--accent)'}
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          ))}
          {prodFiltrados.length === 0 && (
            <p style={{ color: 'var(--muted)' }}>Nenhum produto nesta categoria.</p>
          )}
        </div>
      </div>
      {/* Direita: Carrinho — visível apenas para CLIENTE */}
      {isCliente && (
        <div className="catalogo-sidebar" style={{ 
          width: '320px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column',
          position: 'sticky', top: '24px', maxHeight: 'calc(100vh - 120px)'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🛒 Carta (Carrinho)
            </h3>
          </div>
          
          <div style={{ padding: '20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {carrinho.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '14px', textAlign: 'center', margin: '40px 0' }}>O carrinho está vazio.</p>
            ) : (
              carrinho.map(item => (
                <div key={item.produto.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.produto.nome}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '13px' }}>{brl(item.produto.preco)} / un</div>
                  </div>
                  {/* Controles de quantidade */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => alterarQtd(item.produto.id, item.qtd - 1)}
                      title="Diminuir quantidade"
                      style={{ width: '26px', height: '26px', border: '1px solid var(--border)', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                    >−</button>
                    <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 600, fontSize: '14px' }}>{item.qtd}</span>
                    <button
                      onClick={() => alterarQtd(item.produto.id, item.qtd + 1)}
                      title="Aumentar quantidade"
                      style={{ width: '26px', height: '26px', border: '1px solid var(--border)', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                    >+</button>
                    <button
                      onClick={() => removerDoCarrinho(item.produto.id)}
                      title="Remover item"
                      style={{ width: '26px', height: '26px', border: 'none', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px' }}
                    >✕</button>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '14px', minWidth: '56px', textAlign: 'right' }}>
                    {brl(item.produto.preco * item.qtd)}
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{ padding: '20px', background: '#faf9f5', borderTop: '1px solid var(--border)', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
            
            <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: 'var(--text)' }}>Endereço de Entrega</h4>
              <input 
                type="text" 
                placeholder="Rua / Logradouro" 
                value={logradouro}
                onChange={(e) => setLogradouro(e.target.value)}
                style={{ boxSizing: 'border-box', width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '14px' }}
              />
              <div style={{ display: 'flex', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
                <input 
                  type="text" 
                  placeholder="Número" 
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  style={{ boxSizing: 'border-box', flex: 1, minWidth: 0, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '14px' }}
                />
                <input 
                  type="text" 
                  placeholder="Bairro" 
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  style={{ boxSizing: 'border-box', flex: 2, minWidth: 0, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input 
                type="text" 
                placeholder="Cupom de desconto" 
                value={cupomInput}
                onChange={(e) => setCupomInput(e.target.value)}
                style={{ boxSizing: 'border-box', flex: 1, minWidth: 0, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontWeight: 600, fontSize: '16px' }}>
              <span>Subtotal</span>
              <span style={{ color: 'var(--accent)' }}>{brl(subtotal)}</span>
            </div>
            <button 
              className="btn" 
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
              disabled={carrinho.length === 0}
              onClick={finalizarPedido}
            >
              Finalizar Pedido
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}