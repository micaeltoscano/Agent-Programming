import { createContext, useContext, useState, ReactNode } from 'react';

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria?: { id: string; nome: string };
  imagem?: string;
}

export interface CartItem {
  produto: Produto;
  qtd: number;
}

interface CartContextType {
  carrinho: CartItem[];
  addAoCarrinho: (produto: Produto) => void;
  limparCarrinho: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [carrinho, setCarrinho] = useState<CartItem[]>([]);

  function addAoCarrinho(produto: Produto) {
    setCarrinho(curr => {
      const ex = curr.find(c => c.produto.id === produto.id);
      if (ex) {
        return curr.map(c => c.produto.id === produto.id ? { ...c, qtd: c.qtd + 1 } : c);
      }
      return [...curr, { produto, qtd: 1 }];
    });
  }

  function limparCarrinho() {
    setCarrinho([]);
  }

  return (
    <CartContext.Provider value={{ carrinho, addAoCarrinho, limparCarrinho }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
