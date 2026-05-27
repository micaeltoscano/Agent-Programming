# Tetris Arcade

## PROMPT BASE

Você é um especialista em desenvolvimento de jogos 2D contratado para criar um jogo de Tetris em HTML/JavaScript puro, usando Canvas.

O projeto deve usar apenas:
- HTML
- CSS
- JavaScript vanilla
- Canvas API

Não use frameworks externos.

A cada etapa concluída, exiba no console:

"ETAPA X CONCLUÍDA — aguardando validação"

NÃO avance para a próxima etapa sem confirmação explícita do agente validador.

O agente executor não deve validar o próprio código. A validação deve ser feita por outro agente.

---

## Fase 1: Base do Jogo

Crie a base funcional do jogo de Tetris em JavaScript e HTML.

A implementação deve conter:

- campo de jogo renderizado em Canvas;
- todos os sete tipos clássicos de tetraminós;
- movimento para esquerda e direita;
- rotação das peças;
- aceleração da queda;
- queda automática com o tempo;
- detecção de colisão;
- travamento da peça no campo;
- limpeza de linhas completas;
- condição de game over;
- exibição da próxima peça;
- contorno translúcido mostrando onde a peça atual irá cair caso seja solta naquele instante.

Ao concluir esta etapa, exiba no console:

"ETAPA 1 CONCLUÍDA — aguardando validação"

---

## Fase 2: Níveis e Pontuação

Adicione sistema de pontuação e níveis de dificuldade.

O jogo deve possuir:

- pontuação visível na tela;
- nível atual visível na tela;
- aumento de nível após certa quantidade de linhas limpas;
- aumento da velocidade de queda conforme o nível sobe;
- sistema de high score persistente.

A pontuação deve considerar:

- linhas limpas;
- T-Spin;
- Back-to-Back;
- Combo;
- Soft drop;
- Hard drop.

A maior pontuação obtida até o momento deve ser exibida na tela.

Ao concluir esta etapa, exiba no console:

"ETAPA 2 CONCLUÍDA — aguardando validação"

---

## Fase 3: Tela de Abertura e Loop Arcade

Adicione uma tela de abertura antes do início do jogo.

A tela inicial deve permitir que o jogador escolha entre:

- Jogador Solo;
- Multiplayer Online;
- Contra Bot.

Nesta fase, os botões podem existir visualmente, mas apenas o modo Jogador Solo precisa estar totalmente funcional.

O jogo deve começar somente após interação do usuário, como:

- clique do mouse;
- tecla do teclado;
- botão na interface.

Ao fim de uma jogada, deve aparecer a mensagem:

"GAME OVER"

Após o game over, o jogo deve retornar para a tela de abertura.

Também deve existir um loop arcade tradicional:

1. tela de abertura;
2. após algum tempo, modo demonstração ou attract mode;
3. após mais algum tempo, tela de high scores;
4. retorno para a tela de abertura;
5. repetição do ciclo.

A tela de high scores deve mostrar o ranking das maiores pontuações.

Ao concluir esta etapa, exiba no console:

"ETAPA 3 CONCLUÍDA — aguardando validação"

---

## Fase 4: Adições Extras, Efeitos Visuais e Bomba de Linha

Adicione melhorias visuais e mecânicas extras ao jogo.

### Efeitos Visuais

Quando o jogador realizar ações importantes, o jogo deve exibir efeitos visuais no Canvas.

Deve haver efeito visual quando:

- uma linha for removida;
- um tetraminó for posicionado no campo;
- um combo for realizado;
- uma bomba for ativada.

Ao remover linhas, o jogo deve mostrar uma animação clara indicando quais linhas estão sendo eliminadas.

A animação pode incluir:

- brilho;
- fade out;
- partículas;
- tremor leve no campo;
- blocos desaparecendo gradualmente.

### Bomba de Linha

Adicione a mecânica de "Bomba de Linha" como uma recompensa extra para o jogador quando ele completar uma ou mais linhas.

Quando o jogador completar uma ou mais linhas:

1. o jogo deve identificar a última peça travada;
2. o jogo deve obter as coordenadas dos blocos dessa peça;
3. uma área de 1 bloco de distância ao redor de cada bloco da peça travada deve ser afetada;
4. os blocos adjacentes dentro dessa área devem ser removidos do tabuleiro;
5. deve ser exibida uma animação de explosão antes ou durante a remoção;
6. cada bloco destruído pela bomba deve conceder pontuação extra.

A área da bomba deve considerar os blocos ao redor da última peça posicionada, incluindo posições:

- acima;
- abaixo;
- esquerda;
- direita;
- diagonais.

Os blocos destruídos pela bomba devem ser definidos como `null` no tabuleiro.

A animação de explosão deve usar partículas coloridas no Canvas, expandindo a partir da região da última peça travada.

Cada bloco destruído pela bomba deve conceder bônus de pontuação.


## Fase 5: Modos de Jogo

Expanda a tela inicial para permitir a escolha real entre três modos de jogo:

- Jogador Solo;
- Multiplayer Online;
- Contra Bot.

### Modo Jogador Solo

O modo Jogador Solo deve manter o funcionamento tradicional do Tetris:

- um único campo de jogo;
- controle pelo teclado;
- pontuação individual;
- high score;
- níveis;
- game over;
- efeitos visuais;
- bomba de linha.

### Modo Multiplayer Online

Adicione uma opção de Multiplayer Online com dois campos de jogo.

O multiplayer deve ser realmente online, permitindo que dois jogadores joguem em máquinas ou abas diferentes.

O modo multiplayer deve possuir:

- dois campos de jogo;
- um campo para cada jogador;
- criação de sala;
- entrada em sala;
- código de partida;
- identificação de Jogador 1 e Jogador 2;
- sincronização do estado da partida;
- placar individual;
- condição de vitória ou derrota.

Cada jogador deve controlar apenas seu próprio campo.

A partida multiplayer deve terminar quando houver um vencedor definido.

Critérios mínimos de vitória:

- se um jogador perder e o outro continuar vivo, o sobrevivente vence;
- se ambos perderem, vence quem tiver maior pontuação.

A implementação pode utilizar WebSocket, servidor Node.js ou outra solução mínima compatível com HTML, CSS e JavaScript vanilla.

Não implemente multiplayer apenas local.

### Modo Contra Bot

Adicione o botão "Contra Bot" na tela inicial.

Ao selecionar Contra Bot, o jogador deve escolher uma dificuldade:

- Fácil;
- Médio;
- Difícil.

A dificuldade deve alterar o comportamento dos bots.

#### Fácil

- decisões simples;
- maior chance de erro;
- demora mais para agir;
- prioriza apenas sobreviver.

#### Médio

- evita buracos;
- tenta limpar linhas;
- posiciona peças com mais consistência;
- velocidade intermediária.

#### Difícil

- avalia melhor o tabuleiro;
- reduz altura máxima;
- evita irregularidades;
- tenta maximizar pontuação;
- age rapidamente;
- usa hard drop com mais frequência.

Nesta fase, apenas prepare a estrutura do modo Contra Bot com seleção de dificuldade. O modo competitivo completo será implementado na Fase 6.

Ao concluir esta etapa, exiba no console:

"ETAPA 5 CONCLUÍDA — aguardando validação"

---

## Fase 6: Modo Contra Bot — Você vs Villacorta 67 vs Villacorta 69

Transforme o modo Contra Bot em uma partida competitiva com três campos de jogo.

A partida deve conter:

- Campo 1: jogador humano;
- Campo 2: bot chamado Villacorta 67;
- Campo 3: bot chamado Villacorta 69.

Cada campo deve possuir:

- sua própria sequência de peças;
- sua própria peça atual;
- sua própria próxima peça;
- sua própria pontuação;
- seu próprio nível;
- suas próprias linhas limpas;
- seu próprio estado de game over;
- seus próprios efeitos visuais;
- sua própria ativação da bomba de linha.

O jogador humano deve continuar usando o teclado normalmente.

Os bots Villacorta 67 e Villacorta 69 devem ser implementados internamente em JavaScript, sem uso obrigatório de APIs externas.

Cada bot deve analisar seu próprio tabuleiro e escolher movimentos automaticamente.

Os bots devem conseguir executar:

- mover para a esquerda;
- mover para a direita;
- rotacionar;
- usar soft drop;
- usar hard drop.

A tomada de decisão dos bots deve considerar:

- evitar buracos;
- reduzir a altura máxima do tabuleiro;
- tentar limpar linhas;
- evitar colunas muito irregulares;
- sobreviver o maior tempo possível;
- aproveitar a bomba de linha quando possível.

O jogo deve exibir claramente:

- VOCÊ;
- VILLACORTA 67;
- VILLACORTA 69.

A dificuldade escolhida na Fase 5 deve afetar os dois bots.

A partida só deve terminar quando os três competidores estiverem em game over.

Ao final, o jogo deve exibir um ranking final com:

- posição final;
- nome do competidor;
- pontuação;
- linhas limpas;
- nível alcançado.

Ao concluir esta etapa, exiba no console:

"ETAPA 6 CONCLUÍDA — aguardando validação"

Não avance para nenhuma nova etapa sem validação explícita do agente validador.

---

## Fase 7: Refinamentos Finais e Melhorias de Interface

Realize pequenos ajustes finais para melhorar a experiência geral do jogo.

### Interface do Modo Contra Bot

Melhore a tela do modo Contra Bot, garantindo que os três campos fiquem bem organizados.

A interface deve:

- respeitar as divisórias entre cada jogador/bot;
- deixar claro o espaço de cada competidor;
- evitar sobreposição de elementos;
- alinhar melhor campos, placares, nomes e informações;
- manter boa legibilidade durante a partida.

### Multiplayer Online

Melhore o fluxo do Multiplayer Online.

A partida só deve começar quando:

- o Jogador 1 estiver conectado;
- o Jogador 2 estiver conectado;
- ambos estiverem prontos para iniciar.

Enquanto os dois jogadores não estiverem prontos, o jogo deve mostrar uma tela ou mensagem de espera.

### Bomba de Linha

Revise a mecânica da Bomba de Linha.

Verifique se a bomba realmente está explodindo visualmente e removendo blocos corretamente.

Caso o efeito esteja fraco, intensifique a animação usando:

- mais partículas;
- cores mais visíveis;
- expansão maior da explosão;
- brilho;
- tremor leve no campo;
- efeito sonoro visual ou indicação textual.

### Efeitos Visuais Gerais

Melhore os efeitos visuais existentes no jogo.

Os efeitos devem ficar mais claros em situações como:

- remoção de linhas;
- combos;
- travamento de peça;
- explosão da bomba;
- game over;
- mudança de nível.

### Organização da Tela

Ajuste o layout geral do jogo.

O jogo deve respeitar melhor os espaços da tela, mantendo:

- alinhamento entre elementos;
- espaçamento consistente;
- textos legíveis;
- botões bem posicionados;
- menus organizados;
- campos centralizados ou distribuídos corretamente.

### Navegação e Retorno ao Menu

Adicione opções mais fáceis para voltar ao menu.

O jogador deve conseguir voltar ao menu:

- após perder uma partida;
- ao entrar em uma opção errada;
- a partir das telas de modo de jogo;
- a partir das telas de dificuldade;
- a partir da tela de espera do multiplayer.

### Textos de Pontuação e Combo

Adicione textos visuais informando ganhos de pontuação e tipos de combo.

O jogo deve exibir mensagens como:

- quantidade de pontos ganhos;
- tipo de combo realizado;
- linhas removidas;
- bônus da bomba;
- bônus de soft drop;
- bônus de hard drop;
- bônus de back-to-back;
- bônus de T-Spin.

Esses textos devem aparecer de forma temporária e desaparecer suavemente.

### Pausa

Adicione uma opção de pausar o jogo.

A pausa deve permitir:

- pausar e retomar a partida;
- mostrar claramente que o jogo está pausado;
- impedir que as peças continuem caindo enquanto pausado;
- impedir ações indevidas durante a pausa.

A pausa pode ser ativada por tecla ou botão na interface.

Ao concluir esta etapa, exiba no console:

"ETAPA 7 CONCLUÍDA — aguardando validação"

Não avance para nenhuma nova etapa sem validação explícita do agente validador.