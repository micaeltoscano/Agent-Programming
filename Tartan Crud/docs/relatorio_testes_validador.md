# 📄 Relatório de Testes (Validador) - Ciclo 01

**Data do Teste:** 17 de Julho de 2026
**Módulos Testados:** Autenticação, Banco de Dados, Baixa de Estoque.

## 🟢 Testes Aprovados (In-Scope)
1. **[BD-01] Entidade Associativa:** A entidade `Utiliza` foi implementada com sucesso no PostgreSQL, normalizando as dependências como entidade associativa ao invés de relacionamento simples. **Status: PASS**
2. **[AUTH-01] Isolamento de Perfis (RBAC):** Acesso de 'Motoboy' bloqueado corretamente ao tentar acessar rotas da 'Cozinha'. **Status: PASS**
3. **[REQ-01] Baixa Automática:** Finalização de um pedido de teste resultou na dedução correta no estoque. **Status: PASS**

## 🔴 Testes Reprovados / Além do Escopo (Out-of-Scope)
1. **[SEC-01] Tratamento de Valores Negativos:** 
   - *Cenário:* Aplicação de um cupom de desconto progressivo cujo valor é maior que o total do pedido.
   - *Resultado:* O sistema gerou um total negativo no frontend e backend. 
   - *Ação:* **FALHA.** O Implementador deve adicionar uma validação rigorosa no NestJS para que o total do carrinho nunca seja inferior a R$ 0,00.
2. **[RACE-01] Condição de Corrida no Estoque:**
   - *Cenário:* Dois acessos simultâneos para compra do último item do cardápio.
   - *Resultado:* O sistema permitiu ambas as transações, deixando o estoque com valor `-1`.
   - *Ação:* **FALHA.** Requer implementação de bloqueio pessimista (`FOR UPDATE`) nas transações do PostgreSQL durante a etapa de checkout.

## Conclusão do Validador
O ciclo foi **REPROVADO**. O relatório foi encaminhado ao Agente Coordenador. A esteira de desenvolvimento permanece bloqueada até a correção dos apontamentos SEC-01 e RACE-01.
