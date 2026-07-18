# 🛠️ Entrega do Implementador — Ciclo 02

**Sinal:** `PRONTO_PARA_VALIDACAO`
**Data:** 17 de Julho de 2026
**Módulos:** Infra/BD, Autenticação (RBAC), Catálogo/Estoque, Motor de Pedidos, Máquina de Estados.

## 1. Correções dos apontamentos do Ciclo 01

| ID | Apontamento | Correção aplicada | Verificação |
|----|-------------|-------------------|-------------|
| **SEC-01** | Total negativo ao aplicar cupom > total | Clamp do desconto ao subtotal (`Math.min`) e `total = max(0, subtotal - desconto)` | Pedido R$29,90 + cupom R$50 → **total R$0,00** ✅ |
| **RACE-01** | Estoque ficava `-1` em compras simultâneas | Transação `SERIALIZABLE` + lock pessimista (`SELECT … FOR UPDATE`) por insumo, ordenado por id (anti-deadlock); conflito vira **409** | 2 pedidos concorrentes do último item → **201 + 409, estoque = 0** ✅ |

## 2. Artefatos gerados

- `backend/` — API NestJS completa (entidades, auth, catálogo, pedidos).
- `docker-compose.yml` + `backend/Dockerfile` — ambiente reproduzível (Postgres 16).
- `backend/src/database/seed.ts` — dados de teste (1 usuário por perfil, produto com
  receita/insumo, cupom de valor alto para SEC-01, estoque baixo para RACE-01).
- Testes unitários: `cupom.service.spec.ts` (SEC-01), `order-state.spec.ts` (Fase 5).

## 3. Contexto de execução

```bash
docker compose up --build        # Postgres + API
cd backend && npm run seed       # popular (senha padrão: senha123)
npm test                         # 7 testes, todos passando
```
API: `http://localhost:3000/api`. Prefixo global `/api`, CORS habilitado,
`ValidationPipe` global com whitelist (mitiga injeção de campos).

## 4. Cobertura dos critérios de aceitação (seção 10 da Atividade 03)

- (a)(b) Admin faz CRUD de pratos e gerencia estoque — `catalogo` ✅
- (c) Estoque baixado automaticamente na finalização — `REQ-01` ✅
- (d) Cliente realiza pedidos — `POST /pedidos` ✅
- (e) Cozinha vê pedidos em produção — `GET /pedidos` filtrado por perfil ✅
- (f) Motoboy acompanha entregas — filtro PRONTO/A_CAMINHO ✅
- (i) Cada perfil vê apenas o permitido — `RolesGuard` ✅
- (g)(h) Dashboards/relatórios diários — **pendente (Fase 6, não iniciada)**

## 5. Fora de escopo deste ciclo (aguardando aprovação para avançar)

Fase 6 (Dashboards/Relatórios) e Fase 7 (funcionalidades inteligentes/WhatsApp).
Conforme a regra de ouro, **não avancei** para essas fases sem aprovação do Validador.

---
**Aguardando** execução da suíte do Validador e retorno do Coordenador.
