# Tetris Arcade

Jogo Tetris em HTML, CSS e JavaScript com três telas sincronizadas, sistema de pontuação, níveis progressivos e tela de abertura/game over.

## Estrutura

- `index.html` - markup principal com suporte para telas de abertura e game over.
- `styles/style.css` - estilo do game com responsividade.
- `src/` - lógica do jogo em módulos:
  - `app.js` - ponto de entrada que coordena ScreenManager e GameManager.
  - `screenManager.js` - **NOVO** - gerencia telas (abertura, jogo, game over) e persistência de high scores.
  - `gameManager.js` - gerencia 3 telas e controla todos os jogos juntos.
  - `game.js` - controle de um único tabuleiro com integração de som.
  - `board.js` - gerenciamento da grade do tabuleiro e limpeza de linhas.
  - `piece.js` - definição e rotação de tetrominos (7 tetrominós clássicos + variações).
  - `renderer.js` - desenho do tabuleiro, peças, próxima peça e efeitos visuais.
  - `inputHandler.js` - leitura de teclado e eventos.
  - `soundManager.js` - **NOVO** - reprodução de efeitos sonoros usando Web Audio API.
  - `constants.js` - configurações, formas e pontuação.

## Funcionalidades Implementadas

### Etapa 1: Base do Jogo ✓
- [x] Campo de jogo 10x20
- [x] Todos os 7 tetrominós (I, J, L, O, S, T, Z) + variações (P, U, Q)
- [x] Movimento de peças (esquerda/direita)
- [x] Rotação de peças com teste de posição
- [x] Aceleração da queda (soft drop e hard drop)
- [x] Peças caindo com o tempo
- [x] Detecção de colisão
- [x] Limpeza de linhas completas
- [x] Condição de fim de jogo
- [x] Exibição da próxima peça

### Etapa 2: Níveis e Pontuação ✓
- [x] Sistema de níveis progressivos
- [x] Aumento de velocidade conforme o nível sobe
- [x] Sistema de pontuação baseado em linhas limpas
- [x] Pontuação exibida durante o jogo
- [x] Nível atual exibido
- [x] Próxima peça exibida
- [x] High scores persistentes (localStorage)

### Etapa 3: Tela de Abertura ✓
- [x] Tela inicial com título e instruções
- [x] Exibição das 5 maiores pontuações
- [x] Botão "JOGAR" ou qualquer tecla para começar
- [x] Tela de "GAME OVER" com estatísticas finais
- [x] Retorno à tela de abertura após game over
- [x] Transições suaves entre telas

### Etapa 4: Adições Extras ✓
- [x] Persistência de high scores em localStorage
- [x] Efeitos visuais (partículas ao limpar linhas, detalhes de células)
- [x] Efeitos sonoros (movimento, rotação, queda, limpeza de linhas)
- [x] Sistema de 3 telas sincronizadas
- [x] Pausa/retomada do jogo (tecla P)
- [x] Design visual premium com gradientes e estilos modernos

## Como usar

1. Abra `index.html` no navegador.
2. Ou use um servidor local para garantir que os módulos ES carreguem corretamente.
3. Pressione o botão "JOGAR" ou qualquer tecla para começar.

## Controles

- `←` / `→` - mover peça
- `↑` - rotacionar
- `↓` - queda rápida
- `Espaço` - queda instantânea
- `P` - pausar/retomar
- Qualquer tecla na tela de abertura - iniciar jogo
- Qualquer tecla na tela de game over - voltar ao menu

## Sistema de Pontuação

- 1 linha: 40 pontos
- 2 linhas: 100 pontos
- 3 linhas: 300 pontos
- 4 linhas (Tetris): 1200 pontos

A pontuação é multiplicada pelo nível atual.

## Velocidade dos Níveis

A velocidade aumenta progressivamente conforme o nível sobe:
- Nível 1: 520ms
- Nível 2: 470ms
- ... e assim por diante até um mínimo de 40ms

## Compatibilidade

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Navegadores modernos com suporte a ES6 modules

## Notas

- O jogo usa Web Audio API para efeitos sonoros (pode ser silenciado se não suportado)
- As pontuações são salvas automaticamente em localStorage
- O jogo é responsivo e funciona em diferentes tamanhos de tela
