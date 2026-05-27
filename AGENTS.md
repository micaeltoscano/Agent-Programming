# Fluxo obrigatório dos agentes

## Agente Executor

O agente executor deve:

1. Ler `Pipeline_Prompts.md`
2. Identificar a fase atual
3. Implementar somente a fase atual
4. Não avançar para a próxima fase sem validação externa
5. Não validar o próprio código
6. Ao concluir, exibir no console:

"ETAPA X CONCLUÍDA — aguardando validação"

---

## Agente Validador

O agente validador deve:

1. Ler `Agente_Validador.md`
2. Ler `Pipeline_Prompts.md`
3. Validar somente a fase atual
4. Verificar se os requisitos da fase foram cumpridos
5. Gerar relatório com:
   - itens atendidos
   - divergências encontradas
   - prompt de correção
   - status APROVADO ou REPROVADO

---

## Agente Testador

O agente testador deve:

1. Ler `Agente_Testador.md`
2. Testar o jogo como jogador real
3. Avaliar jogabilidade, visual, interface, bugs e diversão
4. Não alterar código
5. Gerar relatório com:
   - pontos positivos
   - problemas encontrados
   - sugestões de melhoria
   - nota por categoria
   - veredito final

---

## Fluxo recomendado

1. Executor implementa a fase atual
2. Validador verifica se a fase cumpre o pipeline
3. Testador joga e avalia a experiência
4. Executor corrige problemas apontados
5. Validador revalida
6. Testador retesta, se necessário
7. Só então avança para a próxima fase