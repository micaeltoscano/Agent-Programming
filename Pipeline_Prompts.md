# Tetris Arcade

## PROMPT BASE

Você é um especialista em desenvolvimento de jogos 2D contratado para criar um
jogo de Tetris em HTML/JavaScript puro, usando Canvas.
Sem frameworks externos — apenas HTML, CSS e JS vanilla.

A cada etapa concluída, exiba no console: "ETAPA X CONCLUÍDA — aguardando validação"
NÃO avance para a próxima etapa sem confirmação explícita do outro agente validador, ou seja, não faça a validação.

---
 
## Fase 1: Base do Jogo
Considere que você é um desenvolvedor de jogos e crie um jogo de Tetris em JavaScript e HTML com os seus elementos principais: campo de jogo, todos os (sete) tipos de tetraminós, controle das peças (movimento direita/ esquerda, rotação, aceleração da queda), peças caindo com o tempo, detecção de colisão, mecânica de limpar linhas completas, condição de fim de jogo (quando não é possível adicionar uma peça no meio da tela pois alguma das posições já está preenchida), exibição da próxima peça que vai aparecer, exibição de um contorno translúcido que mostra onde a peça atual vai aterrissar se você soltá-la naquele instante.

---

## Fase 2: Níveis e Pontuação
Adicione níveis de dificuldade ao jogo da seguinte forma: após um certo número de linhas limpas, o jogo sobe de nível e as peças passam a cair de maneira mais rápida. Adicione também um sistema de pontuação do jogador baseado nas seguintes regras de pontuação: Limpar linhas, T-Spin, Back-to-Back, Combo e Soft drop/Hard drop. A pontuação deve ser mostrada na tela durante o jogo, assim como o nível atual, e você deve adicionar a funcionalidade de pontuações mais altas (high scores), mostrando na tela do jogo a pontuação mais alta obtida até o momento.

---

## Fase 3: Tela de Abertura
Adicione uma tela de abertura que deve esperar o usuário interagir de alguma forma (com botão do mouse, tecla do teclado, etc) para começar o jogo. Ao fim de uma jogada (game over), deve ser mostrado “GAME OVER” na tela e o jogo deve retornar para a tela de abertura. Com o sistema de high scores implementado, crie uma forma de ver o ranking das pontuações após a tela de “GAME OVER”. Inclua também um modo de demonstração (attract mode) que deve ser combinado com a tela de high scores no loop tradicional dos jogos de arcade: tela de abertura, depois de algum tempo mostrar o attract mode, depois de mais algum tempo mostra a tela de high scores, e depois volta para a tela de abertura e continua o loop.

---

## Fase 4: Adições Extras
Para diferenciar seu Tetris, adicione mais dois campos de jogo, totalizando três. Cada campo deve manter as mesmas características, funcionalidades e especificações do original. O controle das peças deve ser simultâneo nos três campos (mesmos comandos aplicados a todos), porém cada campo deve possuir sua própria sequência de peças e sua própria exibição da próxima peça.