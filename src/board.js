import { BOARD_WIDTH, BOARD_HEIGHT } from './constants.js';

export class Board {
  constructor() {
    this.width = BOARD_WIDTH;
    this.height = BOARD_HEIGHT;
    this.reset();
  }

  reset() {
    this.grid = Array.from({ length: this.height }, () => Array(this.width).fill(null));
  }

  isInside(x, y) {
    return x >= 0 && x < this.width && y < this.height;
  }

  isOccupied(x, y) {
    return y >= 0 && this.grid[y][x] !== null;
  }

  isValidPosition(piece, position) {
    const { x: px, y: py } = position;
    for (let row = 0; row < piece.matrix.length; row += 1) {
      for (let col = 0; col < piece.matrix[row].length; col += 1) {
        if (!piece.matrix[row][col]) continue;
        const x = px + col;
        const y = py + row;
        if (x < 0 || x >= this.width || y >= this.height) {
          return false;
        }
        if (y >= 0 && this.isOccupied(x, y)) {
          return false;
        }
      }
    }
    return true;
  }

  placePiece(piece, position) {
    for (let row = 0; row < piece.matrix.length; row += 1) {
      for (let col = 0; col < piece.matrix[row].length; col += 1) {
        if (!piece.matrix[row][col]) continue;
        const x = position.x + col;
        const y = position.y + row;
        if (y >= 0 && y < this.height) {
          this.grid[y][x] = piece.color;
        }
      }
    }
  }

  clearLines() {
    const clearedRows = [];
    const filteredGrid = [];

    for (let rowIndex = 0; rowIndex < this.grid.length; rowIndex += 1) {
      const row = this.grid[rowIndex];
      if (row.every(cell => cell !== null)) {
        clearedRows.push(rowIndex);
      } else {
        filteredGrid.push(row);
      }
    }

    while (filteredGrid.length < this.height) {
      filteredGrid.unshift(Array(this.width).fill(null));
    }

    this.grid = filteredGrid;
    return clearedRows;
  }
}
