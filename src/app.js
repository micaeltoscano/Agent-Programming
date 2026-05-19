import { GameManager } from './gameManager.js';

const boardCanvases = [
  document.getElementById('tetris-board-1'),
  document.getElementById('tetris-board-2'),
  document.getElementById('tetris-board-3'),
];
const nextCanvases = [
  document.getElementById('next-piece-1'),
  document.getElementById('next-piece-2'),
  document.getElementById('next-piece-3'),
];
const scoreElement = document.getElementById('score');
const linesElement = document.getElementById('lines');
const levelElement = document.getElementById('level');
const startButton = document.getElementById('start-button');

const gameManager = new GameManager(boardCanvases, nextCanvases, {
  onScore: score => {
    scoreElement.textContent = score;
  },
  onLines: lines => {
    linesElement.textContent = lines;
  },
  onLevel: level => {
    levelElement.textContent = level;
  },
  onGameOver: () => {
    startButton.textContent = 'Jogo Finalizado - Recomeçar';
  },
  onPause: isPaused => {
    startButton.textContent = isPaused ? 'Retomar' : 'Reiniciar';
  },
});

startButton.addEventListener('click', () => {
  gameManager.start();
  startButton.textContent = 'Reiniciar';
});

window.addEventListener('load', () => {
  scoreElement.textContent = '0';
  linesElement.textContent = '0';
  levelElement.textContent = '1';
});
