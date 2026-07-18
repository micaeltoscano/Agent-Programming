# 🧠 Plano de Execução: Agente Coordenador (Orquestrador)

## Objetivo
Gerenciar o fluxo de desenvolvimento do Sistema Tartan (UFPB - Programação com Agentes), garantindo a sincronicidade entre implementação e validação.

## Diretrizes de Operação
1. **Inicialização:** Ler os requisitos do sistema (Relatório de Atividade 03) e repassar as especificações para o Agente Implementador.
2. **Controle de Fila:** O fluxo de trabalho é sequencial. O Coordenador só despacha a Tarefa N+1 após a Tarefa N estar concluída e validada.
3. **Comunicação:** 
   - Recebe o sinal `PRONTO_PARA_VALIDACAO` do Implementador.
   - Aciona o Agente Validador passando o escopo da tarefa atual.
   - Avalia o `RELATORIO_DE_TESTES` do Validador.
4. **Resolução de Conflitos:** Se o Validador reprovar, o Coordenador devolve o pacote ao Implementador com o log de erros.

## Tabela de Acompanhamento (Simulada)
| Fase | Módulo | Status | Responsável Atual |
|---|---|---|---|
| 1 | Infra e BD | Concluído | N/A |
| 2 | Autenticação (RBAC/JWT) | Concluído (correções SEC-01/RACE-01 aplicadas) | N/A |
| 3 | Catálogo e Estoque | Implementado — PRONTO_PARA_VALIDACAO | Validador |
| 4 | Motor de Pedidos e Baixa Automática | Implementado — PRONTO_PARA_VALIDACAO | Validador |
| 5 | Cozinha e Logística (máquina de estados) | Implementado — PRONTO_PARA_VALIDACAO | Validador |
| 6 | Dashboards e Relatórios | Implementado — PRONTO_PARA_VALIDACAO | Validador |
| 7 | Inteligentes / Chat de atendimento (Ollama, substitui WhatsApp) | Chat entregue; descontos progressivos e recuperação de carrinho pendentes | Implementador |
