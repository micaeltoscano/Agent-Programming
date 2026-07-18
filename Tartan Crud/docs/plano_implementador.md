# 🛠️ Plano de Execução: Agente Implementador

## Objetivo
Escrever e estruturar o código do Sistema Tartan utilizando NestJS (Backend), React (Frontend) e PostgreSQL (Banco de Dados).

## Etapas de Implementação

### 1. Modelagem e Banco de Dados (PostgreSQL)
- Criar as tabelas base: `Usuario`, `Produto`, `Pedido`, `Estoque`.
- **Atenção à Modelagem:** A relação entre certas entidades não será um relacionamento simples; a estrutura `Utiliza` será implementada como uma entidade associativa, garantindo um rastreamento preciso da interação e dependência de dados.

### 2. Desenvolvimento da API (NestJS)
- **Fase A:** Autenticação JWT e RBAC (Administrador, Cliente, Motoboy, Cozinha).
- **Fase B:** CRUD de Produtos e Insumos.
- **Fase C:** Motor de Pedidos (Regra estrita: O serviço de finalização de pedido deve disparar a baixa automática do estoque).

### 3. Desenvolvimento de Interface (React)
- Desenvolver os dashboards para o Administrador (Faturamento, Ticket Médio).
- Telas de acompanhamento em tempo real para a Cozinha e o Motoboy.

## Regra de Entrega
Ao finalizar um módulo, o código não é mesclado (merged) automaticamente. O agente deve emitir `PRONTO_PARA_VALIDACAO` e aguardar ordens do Coordenador.
