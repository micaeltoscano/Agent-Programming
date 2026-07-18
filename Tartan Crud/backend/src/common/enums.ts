export enum UserRole {
  ADMIN = 'ADMIN',
  FUNCIONARIO = 'FUNCIONARIO',
  COZINHA = 'COZINHA',
  MOTOBOY = 'MOTOBOY',
  CLIENTE = 'CLIENTE',
}

/**
 * Máquina de estados do pedido. As transições legais são definidas em
 * ORDER_TRANSITIONS (pedidos.service) para impedir fluxos ilógicos
 * (ex.: marcar ENTREGUE antes de PRONTO) — cf. RACE/fluxo do validador.
 */
export enum OrderStatus {
  PENDENTE = 'PENDENTE', // criado, aguardando pagamento/confirmação
  CONFIRMADO = 'CONFIRMADO', // pago/confirmado -> baixa de estoque efetivada
  EM_PRODUCAO = 'EM_PRODUCAO', // cozinha preparando
  PRONTO = 'PRONTO', // cozinha finalizou
  A_CAMINHO = 'A_CAMINHO', // motoboy saiu para entrega
  ENTREGUE = 'ENTREGUE', // entrega concluída
  CANCELADO = 'CANCELADO', // cancelado (estorna estoque se já baixado)
}

export enum PaymentMethod {
  DINHEIRO = 'DINHEIRO',
  CARTAO = 'CARTAO',
  PIX = 'PIX',
}

export enum PaymentStatus {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  ESTORNADO = 'ESTORNADO',
}

export enum StockMovementType {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
  AJUSTE = 'AJUSTE',
  ESTORNO = 'ESTORNO',
}
