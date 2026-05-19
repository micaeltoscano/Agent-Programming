import { Board } from './board.js';
import { Piece } from './piece.js';
import { Renderer } from './renderer.js';
import { SCORE_BY_LINES, LEVEL_SPEED, BOARD_WIDTH } from './constants.js';

const TETROMINO_KEYS = ['I', 'J', 'L', 'O', 'S', 'T', 'Z', 'P', 'U', 'Q'];

export class Game {
  constructor(boardCanvas, nextCanvas, callbacks) {
    this.board = new Board();
    this.renderer = new Renderer(boardCanvas, nextCanvas, this.board);
    this.callbacks = callbacks;

    this.resetState();
  }

  resetState() {
    this.board.reset();
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.isPaused = false;
    this.isRunning = false;
    this.dropInterval = LEVEL_SPEED(this.level);
    this.dropCounter = 0;
    this.lastTime = 0;
    this.activePiece = null;
    this.activePosition = { x: 0, y: 0 };
    this.nextPiece = this.createPiece();
  }

  createPiece() {
    const type = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
    return new Piece(type);
  }

  spawnPiece() {
    this.activePiece = this.nextPiece;
    this.nextPiece = this.createPiece();
    this.activePosition = {
      x: Math.floor((BOARD_WIDTH - this.activePiece.width) / 2),
      y: -this.activePiece.height,
    };
    if (!this.board.isValidPosition(this.activePiece, this.activePosition)) {
      this.gameOver();
    }
  }

  start() {
    this.resetState();
    this.spawnPiece();
    this.isRunning = true;
    this.isPaused = false;
    this.updateUI();
    this.render();
  }

  gameOver() {
    this.isRunning = false;
    this.callbacks.onGameOver?.();
  }

  setPaused(paused) {
    if (!this.isRunning) return;
    this.isPaused = paused;
  }

  stop() {
    this.isRunning = false;
  }

  tick(deltaTime) {
    if (!this.isRunning || this.isPaused) return;
    this.dropCounter += deltaTime;
    this.render();
  }

  render() {
    this.renderer.drawBoard();
    this.renderer.drawPiece(this.activePiece, this.activePosition);
    this.renderer.drawEffects();
    this.renderer.drawNextPiece(this.nextPiece);
  }

  movePiece(direction) {
    if (!this.isRunning || this.isPaused) return;
    const newPosition = { ...this.activePosition, x: this.activePosition.x + direction };
    if (this.board.isValidPosition(this.activePiece, newPosition)) {
      this.activePosition = newPosition;
      this.render();
    }
  }

  moveDown() {
    const nextPosition = { ...this.activePosition, y: this.activePosition.y + 1 };
    if (this.board.isValidPosition(this.activePiece, nextPosition)) {
      this.activePosition = nextPosition;
    } else {
      this.lockPiece();
    }
  }

  dropPiece() {
    if (!this.isRunning || this.isPaused) return;
    this.moveDown();
    this.render();
  }

  hardDropPiece() {
    if (!this.isRunning || this.isPaused) return;
    while (this.board.isValidPosition(this.activePiece, { x: this.activePosition.x, y: this.activePosition.y + 1 })) {
      this.activePosition.y += 1;
    }
    this.lockPiece();
    this.render();
  }

  lockPiece() {
    this.board.placePiece(this.activePiece, this.activePosition);
    const clearedRows = this.board.clearLines();
    if (clearedRows.length > 0) {
      this.lines += clearedRows.length;
      this.score += SCORE_BY_LINES[clearedRows.length] * this.level;
      this.level = Math.floor(this.lines / 10) + 1;
      this.dropInterval = LEVEL_SPEED(this.level);
      this.renderer.addLineClearEffect(clearedRows);
    }
    this.spawnPiece();
    this.updateUI();
    this.render();
  }

  rotatePiece() {
    if (!this.isRunning || this.isPaused) return;
    const cloned = new Piece(this.activePiece.type);
    cloned.matrix = this.activePiece.matrix.map(row => row.slice());
    cloned.rotate();

    const positions = [0, -1, 1, -2, 2];
    for (const offset of positions) {
      const testPosition = { x: this.activePosition.x + offset, y: this.activePosition.y };
      if (this.board.isValidPosition(cloned, testPosition)) {
        this.activePiece.matrix = cloned.matrix;
        this.activePosition = testPosition;
        this.render();
        return;
      }
    }
  }

  updateUI() {
    this.callbacks.onScore?.(this.score);
    this.callbacks.onLines?.(this.lines);
    this.callbacks.onLevel?.(this.level);
  }
}
