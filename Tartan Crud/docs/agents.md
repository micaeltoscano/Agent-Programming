# 🤖 Orquestração de Agentes: Sistema Tartan

Este documento estabelece o fluxo de coordenação entre os Agentes de Inteligência Artificial para o desenvolvimento do Sistema de Gestão do Restaurante Tartan. O objetivo é garantir uma arquitetura robusta, onde a implementação segue regras estritas de sequência e a validação atua de forma autônoma e exaustiva.

---

## 🎭 1. Papéis e Comportamentos

### 🧠 Agente Coordenador (Orquestrador)
* **Função:** Gerenciar o ciclo de vida do desenvolvimento.
* **Regra de Ouro:** O fluxo é estritamente sequencial e bloqueante. A fase `N+1` só pode ser iniciada após a fase `N` receber o status de **APROVADO** pelo Validador.
* **Atribuição:** Ler este arquivo `agents.md`, delegar as tarefas de codificação para o Implementador e, em seguida, bloquear a fila de desenvolvimento até o retorno do Validador.

### 🛠️ Agente Implementador (Desenvolvedor/Arquiteto)
* **Função:** Escrever o código-fonte (NestJS, React, PostgreSQL) conforme o esquema de dados e requisitos.
* **Comportamento:** Ao finalizar a codificação de um módulo, o Implementador **deve parar** e emitir um sinal de `PRONTO_PARA_VALIDACAO`, entregando os artefatos gerados, as dependências e o contexto de execução.
* **Restrição:** É terminantemente proibido avançar para a próxima funcionalidade sem a aprovação explícita.

### 🕵️ Agente Validador (Testador/Revisor QA)
* **Função:** Averiguar a qualidade do produto, segurança e resiliência.
* **Comportamento:** Possui **liberdade total** para realizar testes de caixa branca e caixa preta.
* **Escopo de Testes:**
  1. **Testes Base (In-Scope):** Validar os critérios de aceitação descritos no documento (ex: baixa automática de estoque).
  2. **Testes Além do Escopo (Out-of-Scope / Edge Cases):** Tentar quebrar a aplicação (ex: injeção de SQL, race conditions em pedidos simultâneos, valores negativos em cupons, falhas na concorrência de estoque).
* **Saída:** Retorna um relatório de bugs (que obriga o Implementador a refazer a tarefa) ou um selo de **APROVADO**.

---

## 🛤️ 2. Trilha de Implementação e Validação (Ordem de Execução)

As etapas abaixo foram estruturadas para o ambiente de Ciência de Dados e IA da UFPB, visando facilitar a colaboração da equipe (Sérgio, Matheus e Micael) com a IA, garantindo escalabilidade.

### 📦 Fase 1: Infraestrutura e Base de Dados
* **Implementação:**
  * Setup do Docker e repositório Git.
  * Configuração do backend (NestJS + TypeScript) e frontend (React).
  * Conexão com PostgreSQL e criação das entidades primárias (Usuário, Endereço).
* **Testes do Validador:**
  * *Base:* Verificar se os containers sobem corretamente e o banco aceita conexões.
  * *Exploratório:* Testar falhas de conexão de rede, variáveis de ambiente ausentes e resiliência do banco.

### 🔐 Fase 2: Perfis de Acesso e Autenticação (RBAC)
* **Implementação:**
  * Criação do sistema de login e JWT.
  * Separação de rotas e permissões para: Administrador, Funcionário, Cozinha, Motoboy e Cliente.
* **Testes do Validador:**
  * *Base:* Cliente não pode acessar dashboard de Admin; Motoboy só vê tela de entrega.
  * *Exploratório:* Tentar forjar tokens JWT, acessar rotas de cozinha com token de cliente expirado, e ataques de força bruta no login.

### 🍔 Fase 3: Catálogo de Produtos e Gestão de Estoque
* **Implementação:**
  * CRUD de Categorias, Produtos e Insumos (Estoque).
  * Lógica de Movimentação de Estoque (entrada/saída manual).
* **Testes do Validador:**
  * *Base:* Criar, editar e remover pratos. Atualizar quantidades no estoque.
  * *Exploratório:* Inserir preços negativos, nomes de pratos com milhares de caracteres, tentar apagar categorias que possuem pratos vinculados (verificar integridade referencial).

### 🛒 Fase 4: Motor de Pedidos e Baixa Automática (Core)
* **Implementação:**
  * Criação de Pedido, ItemPedido e Pagamento.
  * **Regra Crítica:** Gatilho/Serviço no NestJS para realizar a baixa automática no estoque assim que um pedido é finalizado.
* **Testes do Validador:**
  * *Base:* Fluxo de compra do cliente até o pagamento; verificação se o estoque reduziu corretamente.
  * *Exploratório:* Simular 100 clientes comprando o último item do estoque no mesmo milissegundo (Race Condition). Testar compras com carrinho vazio.

### 🛵 Fase 5: Operação de Cozinha e Logística
* **Implementação:**
  * Telas de status em tempo real: "Em produção" (Cozinha) e "Pronto / A caminho" (Motoboy).
  * Atualização de status do pedido e do entregador.
* **Testes do Validador:**
  * *Base:* Cozinha recebe pedido -> altera status -> Motoboy visualiza -> finaliza entrega.
  * *Exploratório:* O que acontece se o motoboy marcar "Entregue" antes da cozinha marcar "Pronto"? O validador deve criar testes de máquina de estados para impedir fluxos ilógicos.

### 📊 Fase 6: Dashboards e Relatórios
* **Implementação:**
  * APIs analíticas (faturamento, ticket médio, produtos mais vendidos).
  * Integração com mapa da cidade (João Pessoa) para destacar bairros com mais vendas.
* **Testes do Validador:**
  * *Base:* Verificar precisão dos cálculos do dashboard e geração de relatórios com filtros.
  * *Exploratório:* Testar filtros de datas invertidas (data final menor que inicial), gerar relatórios de 10 anos de dados falsos para testar tempo de resposta e paginação.

### 🧠 Fase 7: Funcionalidades Inteligentes (Diferencial)
* **Implementação:**
  * Motor de descontos progressivos baseado no valor do carrinho.
  * Automação de recuperação de carrinho abandonado.
  * Geração de mensagens automatizadas (WhatsApp tracking).
* **Testes do Validador:**
  * *Base:* Verificar se cupom de R$ 1,00 é gerado aos R$ 25,00. Verificar disparo de mensagem.
  * *Exploratório:* Aplicar 50 cupons simultâneos, forçar carrinho a ficar com valor negativo, simular perda de conexão da API do WhatsApp no meio do disparo.

---

## 🔄 3. Ciclo de Vida da Tarefa

```text
[COORDENADOR] Inicia Fase X -> 
[IMPLEMENTADOR] Codifica (TypeScript/React) -> 
[IMPLEMENTADOR] Pausa e envia PRONTO_PARA_VALIDACAO -> 
[VALIDADOR] Executa Suite de Testes (Unitários/Integração/Stress) -> 
    ↳ SE FALHAR: [VALIDADOR] Envia relatório de bugs -> [IMPLEMENTADOR] Corrige
    ↳ SE APROVADO: [COORDENADOR] Avança para Fase X+1
```
