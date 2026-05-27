const COLS = 10;
const ROWS = 20;
const BLOCK = 30;
const FIELD_COUNT = 3;
const BASE_DROP_INTERVAL = 720;
const MIN_DROP_INTERVAL = 80;
const LINES_PER_LEVEL = 10;
const HIGH_SCORE_KEY = "tetris-arcade-high-score";
const RANKING_KEY = "tetris-arcade-ranking";
const TITLE_TIME = 5000;
const DEMO_TIME = 8000;
const SCORES_TIME = 6000;
const GAME_OVER_TIME = 5000;

const LINE_POINTS = [0, 100, 300, 500, 800];
const T_SPIN_POINTS = [400, 800, 1200, 1600];

const boardCanvases = Array.from({ length: FIELD_COUNT }, (_, index) => document.getElementById(`board-${index}`));
const boardContexts = boardCanvases.map((canvas) => canvas.getContext("2d"));
const nextCanvases = Array.from({ length: FIELD_COUNT }, (_, index) => document.getElementById(`next-${index}`));
const nextContexts = nextCanvases.map((canvas) => canvas.getContext("2d"));
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");
const levelElement = document.getElementById("level");
const linesElement = document.getElementById("lines");
const comboElement = document.getElementById("combo");
const screenElement = document.getElementById("screen");
const screenTitleElement = document.getElementById("screen-title");
const screenSubtitleElement = document.getElementById("screen-subtitle");
const startButton = document.getElementById("start-button");
const rankingElement = document.getElementById("ranking");
const screenRankingElement = document.getElementById("screen-ranking");

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

let games = [];
let lastTime = 0;
let mode = "title";
let modeStartedAt = 0;
let score = 0;
let ranking = loadRanking();
let highScore = Math.max(Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0, ranking[0] || 0);
let level = 1;
let linesCleared = 0;
let combo = -1;
let backToBack = false;
let demoStep = 0;
let currentScoreSaved = false;

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

function createGame(index) {
  const currentPiece = createPiece();

  return {
    index,
    board: createBoard(),
    currentPiece,
    nextPiece: createPiece(),
    dropCounter: 0,
    gameOver: false,
    lastMoveWasRotation: false
  };
}

function resetGame() {
  games = Array.from({ length: FIELD_COUNT }, (_, index) => createGame(index));
  lastTime = 0;
  score = 0;
  level = 1;
  linesCleared = 0;
  combo = -1;
  backToBack = false;
  demoStep = 0;
  currentScoreSaved = false;
  updateStats();
}

function setMode(nextMode) {
  mode = nextMode;
  modeStartedAt = performance.now();

  if (mode === "playing" || mode === "demo") {
    resetGame();
  }

  updateScreen();
  draw();
}

function updateScreen() {
  renderRanking();

  if (mode === "playing") {
    screenElement.hidden = true;
    return;
  }

  screenElement.hidden = false;
  startButton.hidden = mode === "demo" || mode === "gameOver";

  if (mode === "title") {
    screenTitleElement.textContent = "Tetris Arcade";
    screenSubtitleElement.textContent = "Pressione qualquer tecla ou clique para jogar";
    startButton.textContent = "Jogar";
    screenRankingElement.hidden = true;
  } else if (mode === "demo") {
    screenTitleElement.textContent = "Demo";
    screenSubtitleElement.textContent = "Tres campos jogando em paralelo";
    screenRankingElement.hidden = true;
  } else if (mode === "scores") {
    screenTitleElement.textContent = "High Scores";
    screenSubtitleElement.textContent = "Ranking das melhores pontuacoes";
    screenRankingElement.hidden = false;
  } else if (mode === "gameOver") {
    screenTitleElement.textContent = "GAME OVER";
    screenSubtitleElement.textContent = `Pontuacao final: ${score}`;
    screenRankingElement.hidden = false;
  }
}

function loadRanking() {
  try {
    const saved = JSON.parse(localStorage.getItem(RANKING_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter(Number.isFinite).slice(0, 5) : [];
  } catch {
    return [];
  }
}

function saveScoreToRanking() {
  if (currentScoreSaved || score <= 0) {
    return;
  }

  currentScoreSaved = true;
  ranking = [...ranking, score].sort((a, b) => b - a).slice(0, 5);
  localStorage.setItem(RANKING_KEY, JSON.stringify(ranking));
  updateHighScore();
  renderRanking();
}

function renderRanking() {
  const items = ranking.map((value) => `<li>${value}</li>`).join("");
  rankingElement.innerHTML = items;
  screenRankingElement.innerHTML = items;
}

function collides(game, piece, nextX, nextY, shape = piece.shape) {
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

      if (boardY >= 0 && game.board[boardY][boardX]) {
        return true;
      }
    }
  }

  return false;
}

function forEachActiveGame(callback) {
  games.forEach((game) => {
    if (!game.gameOver) {
      callback(game);
    }
  });
}

function movePiece(offsetX) {
  if (mode !== "playing") {
    return;
  }

  forEachActiveGame((game) => moveActivePiece(game, offsetX));
}

function moveActivePiece(game, offsetX) {
  const nextX = game.currentPiece.x + offsetX;
  if (!collides(game, game.currentPiece, nextX, game.currentPiece.y)) {
    game.currentPiece.x = nextX;
    game.lastMoveWasRotation = false;
  }
}

function rotatePiece() {
  if (mode !== "playing") {
    return;
  }

  forEachActiveGame(rotateActivePiece);
}

function rotateActivePiece(game) {
  if (game.currentPiece.type === "O") {
    return;
  }

  const rotated = rotateMatrix(game.currentPiece.shape);
  const kicks = [0, -1, 1, -2, 2];

  for (const kick of kicks) {
    if (!collides(game, game.currentPiece, game.currentPiece.x + kick, game.currentPiece.y, rotated)) {
      game.currentPiece.shape = rotated;
      game.currentPiece.x += kick;
      game.lastMoveWasRotation = true;
      return;
    }
  }
}

function rotateMatrix(matrix) {
  return matrix[0].map((_, column) => matrix.map((row) => row[column]).reverse());
}

function softDrop() {
  if (mode !== "playing") {
    return;
  }

  forEachActiveGame((game) => {
    if (!collides(game, game.currentPiece, game.currentPiece.x, game.currentPiece.y + 1)) {
      game.currentPiece.y += 1;
      score += 1;
      game.lastMoveWasRotation = false;
      return;
    }

    lockPiece(game);
  });

  updateHighScore();
  updateStats();
}

function hardDrop() {
  if (mode !== "playing") {
    return;
  }

  forEachActiveGame((game) => {
    let distance = 0;

    while (!collides(game, game.currentPiece, game.currentPiece.x, game.currentPiece.y + 1)) {
      game.currentPiece.y += 1;
      distance += 1;
    }

    score += distance * 2;
    game.lastMoveWasRotation = false;
    lockPiece(game);
  });

  updateHighScore();
  updateStats();
}

function lockPiece(game) {
  const lockedPiece = {
    ...game.currentPiece,
    shape: game.currentPiece.shape
  };
  const wasTSpin = isTSpin(game, lockedPiece);

  game.currentPiece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        const boardY = game.currentPiece.y + y;
        const boardX = game.currentPiece.x + x;

        if (boardY >= 0) {
          game.board[boardY][boardX] = game.currentPiece.color;
        }
      }
    });
  });

  const cleared = clearLines(game);
  applyScore(cleared, wasTSpin);
  spawnPiece(game);
}

function clearLines(game) {
  let cleared = 0;

  for (let y = ROWS - 1; y >= 0; y -= 1) {
    if (game.board[y].every(Boolean)) {
      game.board.splice(y, 1);
      game.board.unshift(Array(COLS).fill(null));
      cleared += 1;
      y += 1;
    }
  }

  return cleared;
}

function applyScore(cleared, wasTSpin) {
  if (mode !== "playing") {
    return;
  }

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

function isTSpin(game, piece) {
  if (piece.type !== "T" || !game.lastMoveWasRotation) {
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
    return x < 0 || x >= COLS || y >= ROWS || (y >= 0 && game.board[y][x]);
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

function spawnPiece(game) {
  game.currentPiece = game.nextPiece;
  game.currentPiece.x = Math.floor((COLS - game.currentPiece.shape[0].length) / 2);
  game.currentPiece.y = 0;
  game.lastMoveWasRotation = false;
  game.nextPiece = createPiece();

  if (collides(game, game.currentPiece, game.currentPiece.x, game.currentPiece.y)) {
    game.gameOver = true;
    finishGame();
  }
}

function finishGame() {
  if (mode === "demo") {
    resetGame();
    return;
  }

  saveScoreToRanking();
  setMode("gameOver");
}

function getGhostPiece(game) {
  const ghost = { ...game.currentPiece, shape: game.currentPiece.shape };
  while (!collides(game, ghost, ghost.x, ghost.y + 1)) {
    ghost.y += 1;
  }
  return ghost;
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  updateAttractLoop(time);

  if (mode === "playing" || mode === "demo") {
    if (mode === "demo") {
      runDemo(deltaTime);
    }

    games.forEach((game) => {
      if (game.gameOver) {
        return;
      }

      game.dropCounter += deltaTime;

      if (game.dropCounter > getDropInterval()) {
        gravityDrop(game);
        game.dropCounter = 0;
      }
    });
  }

  draw();
  requestAnimationFrame(update);
}

function updateAttractLoop(time) {
  const elapsed = time - modeStartedAt;

  if (mode === "title" && elapsed > TITLE_TIME) {
    setMode("demo");
  } else if (mode === "demo" && elapsed > DEMO_TIME) {
    setMode("scores");
  } else if (mode === "scores" && elapsed > SCORES_TIME) {
    setMode("title");
  } else if (mode === "gameOver" && elapsed > GAME_OVER_TIME) {
    setMode("title");
  }
}

function runDemo(deltaTime) {
  demoStep += deltaTime;

  if (demoStep < 160) {
    return;
  }

  demoStep = 0;
  games.forEach((game, index) => {
    if (game.gameOver) {
      return;
    }

    const wave = Math.sin(performance.now() / (520 + index * 90));
    const target = Math.floor((COLS - game.currentPiece.shape[0].length) / 2 + wave * 3);

    if (Math.random() < 0.18) {
      rotateActivePiece(game);
    }

    if (game.currentPiece.x < target) {
      moveActivePiece(game, 1);
    } else if (game.currentPiece.x > target) {
      moveActivePiece(game, -1);
    }
  });
}

function gravityDrop(game) {
  if (!collides(game, game.currentPiece, game.currentPiece.x, game.currentPiece.y + 1)) {
    game.currentPiece.y += 1;
    game.lastMoveWasRotation = false;
    return;
  }

  lockPiece(game);
}

function draw() {
  games.forEach((game, index) => drawGame(game, boardContexts[index], boardCanvases[index]));
  games.forEach((game, index) => drawNext(game, nextContexts[index], nextCanvases[index]));
}

function drawGame(game, context, canvas) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid(context, COLS, ROWS, BLOCK);
  drawBoard(game, context);

  if (game.currentPiece) {
    drawPiece(getGhostPiece(game), context, BLOCK, 0.22, true);
    drawPiece(game.currentPiece, context, BLOCK);
  }

  if (mode === "gameOver" || game.gameOver) {
    drawGameOver(context, canvas);
  }
}

function drawBoard(game, context) {
  game.board.forEach((row, y) => {
    row.forEach((color, x) => {
      if (color) {
        drawBlock(context, x, y, BLOCK, color);
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

function drawNext(game, context, canvas) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid(context, 4, 4, 30);

  if (!game.nextPiece) {
    return;
  }

  const preview = {
    ...game.nextPiece,
    x: (4 - game.nextPiece.shape[0].length) / 2,
    y: (4 - game.nextPiece.shape.length) / 2
  };

  drawPiece(preview, context, 30);
}

function drawGameOver(context, canvas) {
  context.fillStyle = "rgba(9, 10, 13, 0.76)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#f7f4ea";
  context.font = "700 34px Arial, Helvetica, sans-serif";
  context.textAlign = "center";
  context.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 12);
  context.font = "16px Arial, Helvetica, sans-serif";
  context.fillText("Retornando ao inicio", canvas.width / 2, canvas.height / 2 + 24);
}

function startPlaying() {
  setMode("playing");
}

document.addEventListener("keydown", (event) => {
  if (mode !== "playing") {
    event.preventDefault();

    if (mode === "gameOver") {
      setMode("title");
    } else {
      startPlaying();
    }

    return;
  }

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
    games.forEach((game) => {
      game.dropCounter = 0;
    });
  } else if (event.code === "Space") {
    event.preventDefault();
    hardDrop();
    games.forEach((game) => {
      game.dropCounter = 0;
    });
  } else if (event.key.toLowerCase() === "r") {
    startPlaying();
  }
});

screenElement.addEventListener("click", () => {
  if (mode === "gameOver") {
    setMode("title");
  } else if (mode !== "playing") {
    startPlaying();
  }
});

startButton.addEventListener("click", (event) => {
  event.stopPropagation();
  startPlaying();
});

resetGame();
setMode("title");
requestAnimationFrame(update);
console.log("ETAPA 4 CONCLUÍDA — aguardando validação");
