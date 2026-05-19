export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const CELL_SIZE = 30;
export const COLORS = {
  I: '#22d3ee',
  J: '#3b82f6',
  L: '#f59e0b',
  O: '#eab308',
  S: '#10b981',
  T: '#a855f7',
  Z: '#ef4444',
  P: '#14b8a6',
  U: '#f472b6',
  Q: '#8b5cf6',
  X: '#111827',
};

export const TETROMINOES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  P: [
    [1, 1, 0],
    [1, 1, 1],
    [1, 0, 0],
  ],
  U: [
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 1],
  ],
  Q: [
    [1, 1, 1],
    [1, 0, 1],
  ],
};

export const SCORE_BY_LINES = {
  0: 0,
  1: 40,
  2: 100,
  3: 300,
  4: 1200,
};

export const LEVEL_SPEED = level => Math.max(40, 520 - (level - 1) * 50);
