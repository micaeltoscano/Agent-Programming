const COLS = 10;
const ROWS = 20;
const BLOCK = 30;
const BASE_DROP_INTERVAL = 720;
const MIN_DROP_INTERVAL = 80;
const LINES_PER_LEVEL = 10;
const HIGH_SCORE_KEY = "tetris-arcade-high-score";

const LINE_POINTS = [0, 100, 300, 500, 800];
const T_SPIN_POINTS = [400, 800, 1200, 1600];

const boardCanvas = document.getElementById("board");
const boardContext = boardCanvas.getContext("2d");
const nextCanvas = document.getElementById("next");
const nextContext = nextCanvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");
const levelElement = document.getElementById("level");
const linesElement = document.getElementById("lines");
const comboElement = document.getElementById("combo");

const COLORS = {
  I: "#35ada8",
  J: "#4e7dd9",
  L: "#f29f45",
  O: "#f4d35e",
  S: "#61c46e",
  T: "#a56de2",
  Z: "#ea5667"
};

const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ]
};

const PIECES = Object.keys(SHAPES);

let board;
let currentPiece;
let nextPiece;
let lastTime = 0;
let dropCounter = 0;
let gameOver = false;
let score = 0;
let highScore = Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
let level = 1;
let linesCleared = 0;
let combo = -1;
let backToBack = false;
let lastMoveWasRotation = false;

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function cloneMatrix(matrix) {
  return matrix.map((row) => [...row]);
}

function createPiece(type = randomType()) {
  const shape = cloneMatrix(SHAPES[type]);
  return {
    type,
    shape,
    color: COLORS[type],
    x: Math.floor((COLS - shape[0].length) / 2),
    y: 0
  };
}

function randomType() {
  return PIECES[Math.floor(Math.random() * PIECES.length)];
}

function restart() {
  board = createBoard();
  currentPiece = createPiece();
  nextPiece = createPiece();
  lastTime = 0;
  dropCounter = 0;
  gameOver = false;
  score = 0;
  level = 1;
  linesCleared = 0;
  combo = -1;
  backToBack = false;
  lastMoveWasRotation = false;
  gameOver = collides(currentPiece, currentPiece.x, currentPiece.y);
  updateStats();
  draw();
}

function collides(piece, nextX, nextY, shape = piece.shape) {
  for (let y = 0; y < shape.length; y += 1) {
    for (let x = 0; x < shape[y].length; x += 1) {
      if (!shape[y][x]) {
        continue;
      }

      const boardX = nextX + x;
      const boardY = nextY + y;

      if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
        return true;
      }

      if (boardY >= 0 && board[boardY][boardX]) {
        return true;
      }
    }
  }

  return false;
}

function movePiece(offsetX) {
  if (gameOver) {
    return;
  }

  const nextX = currentPiece.x + offsetX;
  if (!collides(currentPiece, nextX, currentPiece.y)) {
    currentPiece.x = nextX;
    lastMoveWasRotation = false;
  }
}

function rotatePiece() {
  if (gameOver || currentPiece.type === "O") {
    return;
  }

  const rotated = rotateMatrix(currentPiece.shape);
  const kicks = [0, -1, 1, -2, 2];

  for (const kick of kicks) {
    if (!collides(currentPiece, currentPiece.x + kick, currentPiece.y, rotated)) {
      currentPiece.shape = rotated;
      currentPiece.x += kick;
      lastMoveWasRotation = true;
      return;
    }
  }
}

function rotateMatrix(matrix) {
  return matrix[0].map((_, column) => matrix.map((row) => row[column]).reverse());
}

function softDrop() {
  if (gameOver) {
    return;
  }

  if (!collides(currentPiece, currentPiece.x, currentPiece.y + 1)) {
    currentPiece.y += 1;
    score += 1;
    lastMoveWasRotation = false;
    updateHighScore();
    updateStats();
    return;
  }

  lockPiece();
}

function hardDrop() {
  if (gameOver) {
    return;
  }

  let distance = 0;
  while (!collides(currentPiece, currentPiece.x, currentPiece.y + 1)) {
    currentPiece.y += 1;
    distance += 1;
  }

  score += distance * 2;
  lastMoveWasRotation = false;
  updateHighScore();
  updateStats();
  lockPiece();
}

function lockPiece() {
  const lockedPiece = {
    ...currentPiece,
    shape: currentPiece.shape
  };
  const wasTSpin = isTSpin(lockedPiece);

  currentPiece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        const boardY = currentPiece.y + y;
        const boardX = currentPiece.x + x;

        if (boardY >= 0) {
          board[boardY][boardX] = currentPiece.color;
        }
      }
    });
  });

  const cleared = clearLines();
  applyScore(cleared, wasTSpin);
  spawnPiece();
}

function clearLines() {
  let cleared = 0;

  for (let y = ROWS - 1; y >= 0; y -= 1) {
    if (board[y].every(Boolean)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(null));
      cleared += 1;
      y += 1;
    }
  }

  return cleared;
}

function applyScore(cleared, wasTSpin) {
  if (cleared > 0) {
    linesCleared += cleared;
    level = Math.floor(linesCleared / LINES_PER_LEVEL) + 1;
    combo += 1;
  } else {
    combo = -1;
  }

  let points = 0;
  const difficultClear = cleared === 4 || (wasTSpin && cleared > 0);

  if (wasTSpin) {
    points += (T_SPIN_POINTS[cleared] || T_SPIN_POINTS[0]) * level;
  } else if (cleared > 0) {
    points += LINE_POINTS[cleared] * level;
  }

  if (cleared > 0 && combo > 0) {
    points += combo * 50 * level;
  }

  if (difficultClear && backToBack) {
    points = Math.floor(points * 1.5);
  }

  if (difficultClear) {
    backToBack = true;
  } else if (cleared > 0) {
    backToBack = false;
  }

  score += points;
  updateHighScore();
  updateStats();
}

function isTSpin(piece) {
  if (piece.type !== "T" || !lastMoveWasRotation) {
    return false;
  }

  const centerX = piece.x + 1;
  const centerY = piece.y + 1;
  const corners = [
    [centerX - 1, centerY - 1],
    [centerX + 1, centerY - 1],
    [centerX - 1, centerY + 1],
    [centerX + 1, centerY + 1]
  ];

  const blockedCorners = corners.filter(([x, y]) => {
    return x < 0 || x >= COLS || y >= ROWS || (y >= 0 && board[y][x]);
  }).length;

  return blockedCorners >= 3;
}

function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
  }
}

function updateStats() {
  scoreElement.textContent = String(score);
  highScoreElement.textContent = String(highScore);
  levelElement.textContent = String(level);
  linesElement.textContent = String(linesCleared);
  comboElement.textContent = combo > 0 ? String(combo) : "0";
}

function getDropInterval() {
  return Math.max(MIN_DROP_INTERVAL, BASE_DROP_INTERVAL - (level - 1) * 55);
}

function spawnPiece() {
  currentPiece = nextPiece;
  currentPiece.x = Math.floor((COLS - currentPiece.shape[0].length) / 2);
  currentPiece.y = 0;
  lastMoveWasRotation = false;
  nextPiece = createPiece();

  if (collides(currentPiece, currentPiece.x, currentPiece.y)) {
    gameOver = true;
    updateHighScore();
    updateStats();
  }
}

function getGhostPiece() {
  const ghost = { ...currentPiece, shape: currentPiece.shape };
  while (!collides(ghost, ghost.x, ghost.y + 1)) {
    ghost.y += 1;
  }
  return ghost;
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  if (!gameOver) {
    dropCounter += deltaTime;

    if (dropCounter > getDropInterval()) {
      gravityDrop();
      dropCounter = 0;
    }
  }

  draw();
  requestAnimationFrame(update);
}

function gravityDrop() {
  if (!collides(currentPiece, currentPiece.x, currentPiece.y + 1)) {
    currentPiece.y += 1;
    lastMoveWasRotation = false;
    return;
  }

  lockPiece();
}

function draw() {
  boardContext.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
  drawGrid(boardContext, COLS, ROWS, BLOCK);
  drawBoard();
  drawPiece(getGhostPiece(), boardContext, BLOCK, 0.22, true);
  drawPiece(currentPiece, boardContext, BLOCK);

  if (gameOver) {
    drawGameOver();
  }

  drawNext();
}

function drawBoard() {
  board.forEach((row, y) => {
    row.forEach((color, x) => {
      if (color) {
        drawBlock(boardContext, x, y, BLOCK, color);
      }
    });
  });
}

function drawPiece(piece, context, blockSize, alpha = 1, outlineOnly = false) {
  context.save();
  context.globalAlpha = alpha;

  piece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (!cell) {
        return;
      }

      const drawX = piece.x + x;
      const drawY = piece.y + y;

      if (drawY < 0) {
        return;
      }

      if (outlineOnly) {
        context.strokeStyle = piece.color;
        context.lineWidth = 3;
        context.strokeRect(drawX * blockSize + 4, drawY * blockSize + 4, blockSize - 8, blockSize - 8);
      } else {
        drawBlock(context, drawX, drawY, blockSize, piece.color);
      }
    });
  });

  context.restore();
}

function drawBlock(context, x, y, size, color) {
  const px = x * size;
  const py = y * size;

  context.fillStyle = color;
  context.fillRect(px + 1, py + 1, size - 2, size - 2);
  context.fillStyle = "rgba(255, 255, 255, 0.18)";
  context.fillRect(px + 3, py + 3, size - 6, 5);
  context.strokeStyle = "rgba(0, 0, 0, 0.28)";
  context.strokeRect(px + 1.5, py + 1.5, size - 3, size - 3);
}

function drawGrid(context, cols, rows, blockSize) {
  context.fillStyle = "#090a0d";
  context.fillRect(0, 0, cols * blockSize, rows * blockSize);
  context.strokeStyle = "rgba(255, 255, 255, 0.055)";
  context.lineWidth = 1;

  for (let x = 0; x <= cols; x += 1) {
    context.beginPath();
    context.moveTo(x * blockSize + 0.5, 0);
    context.lineTo(x * blockSize + 0.5, rows * blockSize);
    context.stroke();
  }

  for (let y = 0; y <= rows; y += 1) {
    context.beginPath();
    context.moveTo(0, y * blockSize + 0.5);
    context.lineTo(cols * blockSize, y * blockSize + 0.5);
    context.stroke();
  }
}

function drawNext() {
  nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  drawGrid(nextContext, 4, 4, 30);

  const preview = {
    ...nextPiece,
    x: (4 - nextPiece.shape[0].length) / 2,
    y: (4 - nextPiece.shape.length) / 2
  };

  drawPiece(preview, nextContext, 30);
}

function drawGameOver() {
  boardContext.fillStyle = "rgba(9, 10, 13, 0.76)";
  boardContext.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
  boardContext.fillStyle = "#f7f4ea";
  boardContext.font = "700 34px Arial, Helvetica, sans-serif";
  boardContext.textAlign = "center";
  boardContext.fillText("GAME OVER", boardCanvas.width / 2, boardCanvas.height / 2 - 12);
  boardContext.font = "16px Arial, Helvetica, sans-serif";
  boardContext.fillText("Pressione R para reiniciar", boardCanvas.width / 2, boardCanvas.height / 2 + 24);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    movePiece(-1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    movePiece(1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    rotatePiece();
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    softDrop();
    dropCounter = 0;
  } else if (event.code === "Space") {
    event.preventDefault();
    hardDrop();
    dropCounter = 0;
  } else if (event.key.toLowerCase() === "r") {
    restart();
  }
});

restart();
requestAnimationFrame(update);
console.log("ETAPA 2 CONCLUÍDA — aguardando validação");
