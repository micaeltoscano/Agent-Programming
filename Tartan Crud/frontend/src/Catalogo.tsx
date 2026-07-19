import { useEffect, useState } from 'react';
import { api } from './api';
import { useCart, Produto } from './contexts/CartContext';
import { useAuth } from './contexts/AuthContext';

const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Interface Produto movida para CartContext

export function Catalogo() {
  const { carrinho, addAoCarrinho, limparCarrinho } = useCart();
  const { usuario } = useAuth();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('');
  const [cupomInput, setCupomInput] = useState('');
  const [hasAlertedCart, setHasAlertedCart] = useState(false);
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');

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

  // addAoCarrinho agora vem do CartContext

  // Fase 7: Carrinho Abandonado
  useEffect(() => {
    if (carrinho.length === 0) {
      setHasAlertedCart(false);
      return;
    }
    if (hasAlertedCart) return;

    const timer = setTimeout(() => {
      api.abandonedCart(carrinho).then(() => {
        // Apenas para mostrar ao usuário o que ocorreu no background
        alert('🔔 [WhatsApp Mock] Vimos que você deixou itens no carrinho! Volte e finalize com VOLTE10.');
        setHasAlertedCart(true);
      }).catch(console.error);
    }, 30000); // 30 segundos de inatividade para alertar
    
    return () => clearTimeout(timer);
  }, [carrinho, hasAlertedCart]);

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
      limparCarrinho(); // Limpa o carrinho

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
                <button 
                  onClick={() => addAoCarrinho(p)}
                  style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '20px', transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#991b1b'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'var(--accent)'}
                >
                  +
                </button>
              </div>
            </div>
          ))}
          {prodFiltrados.length === 0 && (
            <p style={{ color: 'var(--muted)' }}>Nenhum produto nesta categoria.</p>
          )}
        </div>
      </div>

      {/* Direita: Carrinho */}
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
              <div key={item.produto.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '14px' }}>{item.produto.nome}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '13px' }}>{item.qtd}x {brl(item.produto.preco)}</div>
                </div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>
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
      
    </div>
  );
}
