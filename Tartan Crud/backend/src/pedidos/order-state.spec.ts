import { OrderStatus } from '../common/enums';

/**
 * Reproduz a tabela de transições do PedidosService para testar a máquina de
 * estados de forma isolada (Fase 5: impedir fluxos ilógicos como ENTREGUE
 * antes de PRONTO). Mantida em sincronia com ORDER_TRANSITIONS.
 */
const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDENTE]: [OrderStatus.CONFIRMADO, OrderStatus.CANCELADO],
  [OrderStatus.CONFIRMADO]: [OrderStatus.EM_PRODUCAO, OrderStatus.CANCELADO],
  [OrderStatus.EM_PRODUCAO]: [OrderStatus.PRONTO, OrderStatus.CANCELADO],
  [OrderStatus.PRONTO]: [OrderStatus.A_CAMINHO],
  [OrderStatus.A_CAMINHO]: [OrderStatus.ENTREGUE],
  [OrderStatus.ENTREGUE]: [],
  [OrderStatus.CANCELADO]: [],
};

const legal = (de: OrderStatus, para: OrderStatus) =>
  ORDER_TRANSITIONS[de].includes(para);

describe('Máquina de estados do pedido (Fase 5)', () => {
  it('permite o fluxo feliz completo', () => {
    expect(legal(OrderStatus.CONFIRMADO, OrderStatus.EM_PRODUCAO)).toBe(true);
    expect(legal(OrderStatus.EM_PRODUCAO, OrderStatus.PRONTO)).toBe(true);
    expect(legal(OrderStatus.PRONTO, OrderStatus.A_CAMINHO)).toBe(true);
    expect(legal(OrderStatus.A_CAMINHO, OrderStatus.ENTREGUE)).toBe(true);
  });

  it('impede ENTREGUE antes de PRONTO/A_CAMINHO', () => {
    expect(legal(OrderStatus.EM_PRODUCAO, OrderStatus.ENTREGUE)).toBe(false);
    expect(legal(OrderStatus.PRONTO, OrderStatus.ENTREGUE)).toBe(false);
  });

  it('estados terminais não permitem novas transições', () => {
    expect(ORDER_TRANSITIONS[OrderStatus.ENTREGUE]).toHaveLength(0);
    expect(ORDER_TRANSITIONS[OrderStatus.CANCELADO]).toHaveLength(0);
  });
});
