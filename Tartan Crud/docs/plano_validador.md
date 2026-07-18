# 🕵️ Plano de Execução: Agente Validador (QA)

## Objetivo
Garantir que a implementação atende aos critérios de aceitação da Atividade 03 e realizar testes exploratórios para garantir a robustez do software.

## Matriz de Testes

### 1. Testes Base (In-Scope)
- **Critério 1:** O estoque é atualizado automaticamente após a finalização de um pedido?
- **Critério 2:** Cada usuário (Admin, Funcionário, Cliente, Motoboy) só visualiza as funcionalidades permitidas para o seu perfil?
- **Critério 3:** A entidade associativa `Utiliza` está registrando corretamente o vínculo entre as entidades no PostgreSQL sem redundâncias?

### 2. Testes Além do Escopo (Out-of-Scope / Stress)
- **Concorrência:** O que ocorre se dois clientes tentarem comprar a última unidade do mesmo prato exatamente no mesmo milissegundo?
- **Injeção e Segurança:** Tentar bypass de permissões nas rotas do NestJS.
- **Limites Analíticos:** Inserir datas invertidas nos relatórios do dashboard gerencial para testar o tratamento de erros do backend.

## Fluxo de Saída
O Validador gera um relatório (Pass/Fail). Falhas geram um log detalhado para o Implementador.
