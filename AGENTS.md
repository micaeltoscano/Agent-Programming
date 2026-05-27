# Fluxo obrigatório do agente

O agente executor deve seguir este pipeline:

1. Ler Pipeline_Prompts.md
2. Identificar a etapa atual
3. Implementar SOMENTE a etapa atual
4. Ao terminar, exibir no console:
   "ETAPA X CONCLUÍDA — aguardando validação"
5. Parar a execução e aguardar validação externa

O agente executor não deve validar o próprio código.
O agente executor não deve avançar para a próxima fase sem confirmação explícita do agente validador.

Após receber o relatório do agente validador:
1. Corrigir apenas os problemas apontados
2. Manter o escopo da etapa atual
3. Exibir novamente:
   "ETAPA X CONCLUÍDA — aguardando validação"