import { TETROMINOES, COLORS } from './constants.js';

export class Piece {
  constructor(type) {
    this.type = type;
    this.matrix = TETROMINOES[type].map(row => row.slice());
    this.color = COLORS[type];
  }

  rotate() {
    const matrix = this.matrix;
    const size = matrix.length;
    const rotated = matrix.map((_, index) => matrix.map(row => row[index]).reverse());
    this.matrix = rotated;
  }

  get width() {
    return this.matrix[0].length;
  }

  get height() {
    return this.matrix.length;
  }
}
