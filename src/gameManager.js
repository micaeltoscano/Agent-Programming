import { Game } from './game.js';
import { InputHandler } from './inputHandler.js';
import { LEVEL_SPEED } from './constants.js';

export class GameManager {
  constructor(boardCanvases, nextCanvases, callbacks) {
    this.callbacks = callbacks;
    this.panelOver = [];
    this.games = boardCanvases.map((canvas, index) => new Game(canvas, nextCanvases[index], {
      onScore: score => this.updateCombinedStats(index, score),
      onLines: lines => this.updateCombinedStats(index, lines, 'lines'),
      onLevel: level => this.updateCombinedStats(index, level, 'level'),
      onGameOver: () => this.handlePanelGameOver(index),
    }));
    this.input = new InputHandler();
    this.scores = Array(this.games.length).fill(0);
    this.lines = Array(this.games.length).fill(0);
    this.levels = Array(this.games.length).fill(1);
    this.isPaused = false;
    this.isGameOver = false;
    this.dropInterval = 700;
    this.dropCounter = 0;
    this.lastTime = 0;
    this.input.attach();
    this.initializeListeners();
  }

  initializeListeners() {
    this.input.subscribe('move', direction => this.games.forEach(game => game.movePiece(direction)));
    this.input.subscribe('rotate', () => this.games.forEach(game => game.rotatePiece()));
    this.input.subscribe('softDrop', () => this.games.forEach(game => game.dropPiece()));
    this.input.subscribe('hardDrop', () => this.games.forEach(game => game.hardDropPiece()));
    this.input.subscribe('pause', () => this.togglePause());
  }

  start() {
    this.isPaused = false;
    this.isGameOver = false;
    this.panelOver = Array(this.games.length).fill(false);
    this.scores.fill(0);
    this.lines.fill(0);
    this.levels.fill(1);
    this.dropInterval = LEVEL_SPEED(1);
    this.dropCounter = 0;
    this.lastTime = performance.now();
    this.games.forEach(game => game.start());
    this.updateCombinedDisplay();
    requestAnimationFrame(this.update.bind(this));
  }

  togglePause() {
    if (this.isGameOver) return;
    this.isPaused = !this.isPaused;
    this.games.forEach(game => game.setPaused(this.isPaused));
    this.callbacks.onPause?.(this.isPaused);
    if (!this.isPaused) {
      this.lastTime = performance.now();
      requestAnimationFrame(this.update.bind(this));
    }
  }

  update(time = 0) {
    if (this.isPaused || this.isGameOver) return;

    const deltaTime = time - this.lastTime;
    this.lastTime = time;
    this.dropCounter += deltaTime;

    if (this.dropCounter >= this.dropInterval) {
      this.dropCounter = 0;
      this.games.forEach(game => {
        if (game.isRunning && !game.isPaused) {
          game.moveDown();
        }
      });
    }

    this.games.forEach(game => {
      game.renderer.updateEffects(deltaTime);
      game.render();
    });
    requestAnimationFrame(this.update.bind(this));
  }

  handlePanelGameOver(index) {
    if (this.panelOver[index]) return;
    this.panelOver[index] = true;
    if (this.panelOver.every(status => status)) {
      this.isGameOver = true;
      this.callbacks.onGameOver?.();
    }
  }

  gameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.games.forEach(game => game.stop());
    this.callbacks.onGameOver?.();
  }

  updateCombinedStats(index, value, type = 'score') {
    if (type === 'score') {
      this.scores[index] = value;
    } else if (type === 'lines') {
      this.lines[index] = value;
    } else if (type === 'level') {
      this.levels[index] = value;
    }
    this.updateCombinedDisplay();
  }

  updateCombinedDisplay() {
    const totalScore = this.scores.reduce((sum, current) => sum + current, 0);
    const totalLines = this.lines.reduce((sum, current) => sum + current, 0);
    const maxLevel = Math.max(...this.levels);
    this.dropInterval = LEVEL_SPEED(maxLevel);
    this.callbacks.onScore?.(totalScore);
    this.callbacks.onLines?.(totalLines);
    this.callbacks.onLevel?.(maxLevel);
  }
}
