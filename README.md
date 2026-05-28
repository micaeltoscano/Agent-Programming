# Tetris Arcade

Tetris Arcade e um jogo de Tetris feito com HTML, CSS e JavaScript vanilla, renderizado em Canvas. O projeto inclui modo solo, multiplayer online com WebSocket, modo contra bots, pontuacao avancada, ranking local, efeitos visuais e pausa.

## Tecnologias

- HTML5
- CSS3
- JavaScript vanilla
- Canvas API
- Node.js para servidor estatico e WebSocket do multiplayer

Nao ha frameworks externos no jogo principal.

## Como Rodar

Instale uma versao recente do Node.js e execute:

```bash
npm start
```

Depois acesse:

```text
http://localhost:8000
```

Tambem e possivel abrir `index.html` diretamente no navegador para jogar solo ou contra bot. Para o Multiplayer Online, use o servidor com `npm start`.

## Estrutura

- `index.html`: tela principal, paineis, placar, menus e canvases.
- `styles/style.css`: layout, responsividade, botoes, paineis e acabamento visual.
- `src/app.js`: toda a logica do jogo, renderizacao, modos, pontuacao, bots e efeitos.
- `server.js`: servidor HTTP local e WebSocket para salas multiplayer.
- `Pipeline_Prompts.md`: roteiro das fases do projeto.
- `Agente_Validador.md` e `Agente_Testador.md`: instrucoes para validacao e teste.

## Modos de Jogo

### Jogador Solo

Modo classico de Tetris com um tabuleiro, proxima peca, peca fantasma, pontuacao, niveis, combos, high score e game over.

### Multiplayer Online

Permite criar ou entrar em uma sala por codigo. A partida comeca quando os dois jogadores estao conectados e prontos. Cada jogador controla seu proprio tabuleiro, e o resultado e definido por sobrevivencia ou pontuacao.

### Contra Bot

Partida com tres competidores:

- VOCE
- PELICANO
- PELICANA

O jogador escolhe a dificuldade dos bots:

- Facil
- Medio
- Dificil / Aura++

Os bots analisam seus proprios tabuleiros e executam movimentos automaticamente, incluindo deslocamento, rotacao, soft drop e hard drop.

## Recursos Implementados

- Campo de jogo 10x20 em Canvas.
- Sete tetrominos classicos: I, J, L, O, S, T e Z.
- Movimento lateral, rotacao, soft drop e hard drop.
- Queda automatica com velocidade progressiva.
- Deteccao de colisao e travamento de pecas.
- Limpeza de linhas completas.
- Proxima peca e peca fantasma.
- Sistema de pontuacao com linhas, T-Spin, Back-to-Back, Combo, Soft Drop e Hard Drop.
- High score e ranking salvos em `localStorage`.
- Bomba de linha ao completar linhas.
- Particulas, tremor, efeitos de linha, efeitos de travamento e textos flutuantes.
- Tela inicial, tela de high scores, game over e retorno ao menu.
- Pausa por botao ou teclado.
- Layout responsivo para solo, multiplayer e contra bot.

## Controles

- `Seta esquerda`: mover para a esquerda
- `Seta direita`: mover para a direita
- `Seta cima`: rotacionar
- `Seta baixo`: acelerar queda
- `Espaco`: hard drop
- `P`: pausar ou retomar
- `Esc`: voltar ao menu
- `R`: reiniciar partida

## Pontuacao

A pontuacao considera:

- Linhas removidas
- T-Spin
- Back-to-Back
- Combo
- Soft drop
- Hard drop
- Blocos destruidos pela bomba de linha

Valores principais:

- 1 linha: 100 pontos
- 2 linhas: 300 pontos
- 3 linhas: 500 pontos
- 4 linhas: 800 pontos
- Bloco destruido pela bomba: 25 pontos

Os valores sao multiplicados pelo nivel atual quando aplicavel.

## Multiplayer

O servidor em `server.js` faz:

- Servir os arquivos do jogo.
- Criar salas com codigo.
- Permitir entrada de um segundo jogador.
- Controlar estado de pronto dos jogadores.
- Sincronizar estado e resultado entre os clientes.

Fluxo basico:

1. Jogador 1 clica em `Criar Sala`.
2. Jogador 2 informa o codigo e clica em `Entrar`.
3. Ambos clicam em `Pronto`.
4. A partida inicia automaticamente.

## Persistencia

O jogo usa `localStorage` para salvar:

- Maior pontuacao
- Ranking local
- Dificuldade selecionada para os bots

## Estado do Projeto

O projeto esta na Fase 7, com refinamentos de interface, efeitos visuais, pausa, retorno ao menu e ajustes nos modos multiplayer e contra bot.
