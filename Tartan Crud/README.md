# Sistema de Gestão — Restaurante Tartan

Aplicação CRUD (Atividade 03 — Programação com Agentes, UFPB) para o restaurante
Tartan (culinária japonesa e chinesa). Backend em **NestJS + TypeScript**, banco
**PostgreSQL** (via TypeORM), orquestrado por **Docker**.

## Estrutura

```
Tartan Crud/
├── docker-compose.yml       # Postgres + backend
├── backend/                 # API NestJS
│   └── src/
│       ├── entities/        # Modelo de dados (inclui associativa Utiliza = ProdutoInsumo)
│       ├── auth/            # JWT + RBAC (5 perfis)
│       ├── catalogo/        # Categorias, Produtos, Estoque/Insumos
│       ├── pedidos/         # Motor de pedidos, cupons, baixa de estoque
│       ├── dashboard/       # Analytics: faturamento, ticket médio, mais vendidos, bairros
│       ├── chat/            # Atendimento via Ollama local (substitui WhatsApp)
│       └── database/        # Config + seed
├── frontend/                # SPA React + Vite (dashboard + chat)
└── docs/                    # Documentação do projeto e dos agentes
```

## Como rodar

```bash
# Sobe Postgres + API
docker compose up --build

# OU localmente (com Postgres em localhost:5432)
cd backend
cp .env.example .env
npm install
npm run build && npm start
npm run seed        # popula dados de teste (senha padrão: senha123)
npm test            # testes unitários (SEC-01 e máquina de estados)
```

A API sobe em `http://localhost:3000/api`.

### Frontend (dashboard + chat)

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173 (proxy /api -> backend)
```

Login de teste: `admin@tartan.com` / `senha123`. O painel gerencial (faturamento,
ticket médio, mais vendidos, vendas por bairro) fica disponível para
Admin/Funcionário. O **chat de atendimento** (botão 💬 no canto inferior direito)
está disponível para qualquer visitante.

### Chat com Ollama (substitui o WhatsApp)

O atendimento por WhatsApp (seções 5.3/5.4 da Atividade 03) foi substituído por um
assistente rodando **localmente via [Ollama](https://ollama.com)**. O backend atua
como proxy (`POST /api/chat`), injetando o cardápio atual como contexto de sistema.

```bash
# instalar e subir o Ollama, depois baixar um modelo
ollama pull llama3.2
ollama serve          # expõe http://localhost:11434
```

Configuração (via `.env` do backend):

```
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

Se o Ollama estiver offline, o chat exibe um aviso amigável (o backend responde
`503` com instruções) em vez de quebrar — o restante do sistema segue funcionando.

## Perfis (RBAC)

`ADMIN`, `FUNCIONARIO`, `COZINHA`, `MOTOBOY`, `CLIENTE` — cada rota é protegida por
`JwtAuthGuard` + `RolesGuard`. Registro público (`POST /auth/register`) sempre cria
`CLIENTE`; apenas o admin cria outros perfis (`POST /auth/usuarios`).

## Regras críticas implementadas

| Item | Regra | Onde |
|------|-------|------|
| **REQ-01** | Baixa automática de estoque ao confirmar pedido | `pedidos.service#baixarEstoque` |
| **BD-01** | Entidade associativa `Utiliza` (Produto↔Insumo) com qtd por unidade | `produto-insumo.entity` |
| **SEC-01** | Total do pedido nunca < R$ 0,00 (clamp de cupom) | `cupom.service#validarECalcular` + `criar` |
| **RACE-01** | Sem venda além do estoque em concorrência (lock pessimista + SERIALIZABLE) | `pedidos.service#baixarEstoque` |
| **Fase 5** | Máquina de estados impede transições ilógicas (ex.: ENTREGUE antes de PRONTO) | `ORDER_TRANSITIONS` |
| **Fase 6** | Dashboards/relatórios com guarda de datas invertidas (fim < início → 400) | `dashboard.service#resolverPeriodo` |

## Máquina de estados do pedido

```
PENDENTE → CONFIRMADO → EM_PRODUCAO → PRONTO → A_CAMINHO → ENTREGUE
   ↘ CANCELADO      ↘ CANCELADO   ↘ CANCELADO
```

Cancelamento após confirmação estorna o estoque automaticamente.
