# 🛠️ Plano de Execução: Arquitetura e Implementação (Master Plan)

## 🎯 Objetivo Global
Desenvolver do zero o **Sistema Tartan**, uma plataforma completa de gestão de pedidos e PDV para um restaurante de culinária japonesa e chinesa. A solução deve integrar **NestJS (Back-end)**, **React + Vite (Front-end)** e **PostgreSQL (Banco de Dados)**, culminando num ecossistema moderno, reativo e amparado por Inteligência Artificial.

Este plano detalha a construção do sistema dividida em **3 Ciclos Estratégicos**, assumindo que o projeto começa a partir de um repositório vazio.

---

## 🏗️ 1. Padrões de Código Obrigatórios (Strict Mode)

Ao codificar, a equipe de desenvolvimento (Agentes) deve seguir estas regras:

### Backend (NestJS)
1. **Tipagem Estrita**: NUNCA use o tipo `any`. Todas as respostas da API e payloads devem ser tipados através de DTOs (`class-validator` e `class-transformer`).
2. **Transações (ACID)**: Qualquer operação que modifique mais de uma entidade (ex: Criar Pedido + Atualizar Estoque) deve ocorrer dentro de uma transação do `TypeORM` para evitar inconsistências caso ocorram falhas parciais.
3. **Database Versioning**: O banco de dados deve utilizar Migrations via CLI do TypeORM (`synchronize: false`).
4. **Segurança e Estabilidade**: Rate Limiting (Throttler) e configurações estritas de CORS devem estar ativas desde o início.

### Frontend (React + Vite)
1. **Gestão de Estado Global**: Utilizar Context API (ex: `AuthContext`, `CartContext`) para evitar _prop drilling_ e gerenciar persistência de dados (sessão via `localStorage`).
2. **Roteamento Consistente**: O sistema deve possuir URLs independentes via `react-router-dom` para viabilizar carregamento direto, proteção de rotas privadas e navegação limpa.
3. **Comunicação Segura**: Centralizar chamadas de API em um utilitário (ex: `api.ts`) que faça a injeção do token JWT e lide com erros globais (401, 500).

---

## 🗺️ 2. Fases de Implementação (Ciclos)

### 🚀 Ciclo 01: Fundações e MVP Transacional
O objetivo deste ciclo é criar o banco de dados, o backend e garantir que um cliente faça login e gere um pedido válido no frontend.
- [ ] **Setup da Infraestrutura:** Containerização com Docker (`postgres`, `backend`, `frontend`).
- [ ] **Modelagem do BD (TypeORM):** Criação das Entidades de Usuário (com roles), Endereço, Categoria, Produto, Insumo, Ficha Técnica (Produto_Insumo) e Pedido (com Itens e Pagamento).
- [ ] **Autenticação (JWT):** Implementar Login e Registro no Back-end (`/auth`) e Context API (`AuthContext`) no Front-end, assegurando que os Endereços do cliente sejam retornados no Payload.
- [ ] **Regras de Negócio (Estoque):** Back-end deve verificar ficha técnica, conferir estoque de insumos e aplicar `SELECT FOR UPDATE` (Pessimistic Lock) para concorrência ao criar pedidos.
- [ ] **Catálogo e Checkout:** Tela principal onde o cliente visualiza pratos (`/catalogo`) e os insere em um carrinho, contendo obrigatoriamente um formulário para coleta e autopreenchimento de Endereço (Bairro, Logradouro, Número) para viabilizar entregas.

### 🧩 Ciclo 02: Resolução de Débitos Técnicos e Telas Departamentais
O objetivo deste ciclo é organizar a arquitetura front-end que eventualmente tenha crescido de forma desordenada no Ciclo 01, e desenvolver telas dedicadas para os perfis operacionais.
- [ ] **Refatoração Front-end:** Implementar `react-router-dom` nativo, elevar o estado do carrinho para um `CartContext` persistente e consertar perdas de sessão (`localStorage`).
- [ ] **Filtros e Paginação Back-end:** Adicionar lógica de paginação (`take`/`skip`) para não sobrecarregar listagens longas de produtos e pedidos.
- [ ] **[NEW-01] Tela Cozinha (Kanban):** Interface de Fila para preparar pedidos (`CONFIRMADO` -> `EM_PRODUCAO` -> `PRONTO`). Acessível via `role=COZINHA`.
- [ ] **[NEW-02] Tela Motoboy (Fila):** Lista de entregas pendentes com endereço destacado (`PRONTO` -> `A_CAMINHO` -> `ENTREGUE`). Acessível via `role=MOTOBOY`.
- [ ] **[NEW-03] Telas Admin (CRUD):** Painel para Administradores gerenciarem (Criar, Editar, Excluir) Insumos, Categorias e Produtos.

### 🌟 Ciclo 03: Experiência Avançada (Real-Time, Analytics e IA)
O objetivo deste ciclo é elevar a maturidade do produto, fornecendo painéis gráficos, atualizações em tempo real e um atendimento automatizado.
- [ ] **Infraestrutura Real-Time (WebSockets):** Substituir atualizações baseadas em temporizador (`setInterval`) no Front-end por instâncias de Socket.IO conectadas ao `@nestjs/websockets` (EventGateway). A Cozinha e o Cliente devem ver mudanças de status imediatamente.
- [ ] **Dashboard Analytics (`recharts`):** Repaginar o painel do Admin, consumindo métricas (Faturamento, Top Produtos, Ticket Médio, Vendas por Bairro) e exibindo em gráficos interativos e bonitos (Barras e Pizza).
- [ ] **TypeORM Migrations:** Estruturação formal do banco de dados para Deploy em Produção (script de `migration:generate` via CLI).
- [ ] **Atendente Virtual (Ollama / LLM):** Orquestrar o serviço do Ollama nativamente no `docker-compose.yml` (com sidecar para pull automático do modelo). Integrar um chat flutuante no frontend conectado ao back-end. A Inteligência Artificial terá o cardápio no seu System Prompt, responderá dúvidas e **adicionará pratos automaticamente no carrinho do usuário** (parseando comandos mágicos como `[ADD:id-produto]`).

---

## 🔒 3. Critérios de Conclusão (Definition of Done)
- Nenhum código entra sem *build* com sucesso (`npm run build`).
- As rotas protegidas verificam as permissões (RBAC) via JWT e Roles Guard no Back-end.
- Front-end não deve possuir *warnings* críticos de `hooks` perdidos ou componentes não renderizados corretamente.
- Mudanças no BD devem ser refletidas em uma Migration validada.
