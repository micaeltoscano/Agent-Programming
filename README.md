# Tetris

Jogo Tetris em HTML, CSS e JavaScript usando classes e módulos ES.

## Estrutura

- `index.html` - markup principal.
- `styles/style.css` - estilo do game.
- `src/` - lógica do jogo em módulos:
  - `app.js` - ponto de entrada.
  - `gameManager.js` - gerencia 3 telas e controla todos os jogos juntos.
  - `game.js` - controle de um único tabuleiro.
  - `board.js` - gerenciamento da grade do tabuleiro.
  - `piece.js` - definição e rotação de tetrominos.
  - `renderer.js` - desenho do tabuleiro, peças e efeitos de musgo.
  - `inputHandler.js` - leitura de teclado.
  - `constants.js` - configurações e formas.

## Como usar

1. Abra `index.html` no navegador.
2. Ou use um servidor local para garantir que os módulos ES carreguem corretamente.
3. Pressione `Iniciar Jogo`.

## Controles

- `←` / `→` - mover peça
- `↑` - rotacionar
- `↓` - queda rápida
- `Espaço` - queda instantânea
- `P` - pausar
