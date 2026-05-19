import { BOARD_WIDTH, BOARD_HEIGHT, CELL_SIZE, COLORS } from './constants.js';

export class Renderer {
  constructor(boardCanvas, nextCanvas, board) {
    this.boardCanvas = boardCanvas;
    this.nextCanvas = nextCanvas;
    this.board = board;
    this.boardContext = boardCanvas.getContext('2d');
    this.nextContext = nextCanvas.getContext('2d');
    this.boardCanvas.width = BOARD_WIDTH * CELL_SIZE;
    this.boardCanvas.height = BOARD_HEIGHT * CELL_SIZE;
    this.nextCanvas.width = 4 * CELL_SIZE;
    this.nextCanvas.height = 4 * CELL_SIZE;
    this.effects = [];
  }

  clear(context, width, height) {
    context.fillStyle = '#0f172a';
    context.fillRect(0, 0, width, height);
  }

  shadeColor(hex, percent) {
    const num = parseInt(hex.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
  }

  drawCell(context, x, y, color) {
    const px = x * CELL_SIZE;
    const py = y * CELL_SIZE;
    const gradient = context.createLinearGradient(px, py, px + CELL_SIZE, py + CELL_SIZE);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, this.shadeColor(color, -18));
    context.fillStyle = gradient;
    context.fillRect(px, py, CELL_SIZE, CELL_SIZE);
    context.strokeStyle = this.shadeColor(color, -55);
    context.lineWidth = 1.5;
    context.strokeRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    this.drawMossDetail(context, px, py, color);
  }

  drawMossDetail(context, px, py, color) {
    context.save();
    const variations = 3;
    for (let i = 0; i < variations; i += 1) {
      const dotX = px + CELL_SIZE * (0.2 + Math.random() * 0.6);
      const dotY = py + CELL_SIZE * (0.2 + Math.random() * 0.6);
      const radius = Math.random() * 1.25 + 0.5;
      context.fillStyle = 'rgba(236, 253, 245, 0.14)';
      context.beginPath();
      context.arc(dotX, dotY, radius, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }

  drawBoard() {
    this.clear(this.boardContext, this.boardCanvas.width, this.boardCanvas.height);
    for (let y = 0; y < BOARD_HEIGHT; y += 1) {
      for (let x = 0; x < BOARD_WIDTH; x += 1) {
        const color = this.board.grid[y][x];
        if (color) {
          this.drawCell(this.boardContext, x, y, color);
        }
      }
    }
  }

  drawEffects() {
    const ctx = this.boardContext;
    for (const particle of this.effects) {
      ctx.save();
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  updateEffects(deltaTime) {
    const aliveEffects = [];
    for (const effect of this.effects) {
      effect.x += effect.vx * deltaTime * 0.03;
      effect.y += effect.vy * deltaTime * 0.03;
      effect.alpha -= deltaTime * 0.0012;
      effect.size += deltaTime * 0.002;
      if (effect.alpha > 0) aliveEffects.push(effect);
    }
    this.effects = aliveEffects;
  }

  addLineClearEffect(rows) {
    for (const row of rows) {
      const baseY = row * CELL_SIZE + CELL_SIZE / 2;
      for (let i = 0; i < 20; i += 1) {
        const baseX = Math.random() * this.boardCanvas.width;
        const speed = 80 + Math.random() * 120;
        const angle = Math.random() * Math.PI * 2;
        this.effects.push({
          x: baseX,
          y: baseY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 20,
          alpha: 1,
          size: 2 + Math.random() * 3,
          color: `rgba(255, 255, 255, ${0.7 + Math.random() * 0.3})`,
        });
      }
    }
  }

  drawPiece(piece, position) {
    if (!piece) return;
    for (let y = 0; y < piece.matrix.length; y += 1) {
      for (let x = 0; x < piece.matrix[y].length; x += 1) {
        if (piece.matrix[y][x]) {
          this.drawCell(this.boardContext, position.x + x, position.y + y, piece.color);
        }
      }
    }
  }

  drawNextPiece(piece) {
    this.clear(this.nextContext, this.nextCanvas.width, this.nextCanvas.height);
    if (!piece) return;
    const offset = 1;
    for (let y = 0; y < piece.matrix.length; y += 1) {
      for (let x = 0; x < piece.matrix[y].length; x += 1) {
        if (piece.matrix[y][x]) {
          this.drawCell(this.nextContext, x + offset, y + offset, piece.color);
        }
      }
    }
  }
}
