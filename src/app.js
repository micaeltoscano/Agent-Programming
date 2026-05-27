const COLS = 10;
const ROWS = 20;
const BLOCK = 30;
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
const BOMB_BLOCK_POINTS = 25;

const boardCanvas = document.getElementById("board");
const boardContext = boardCanvas.getContext("2d");
const boardSetElement = document.querySelector(".board-set");
const localLabelElement = document.getElementById("local-label");
const opponentPanelElement = document.getElementById("opponent-panel");
const opponentLabelElement = document.getElementById("opponent-label");
const opponentCanvas = document.getElementById("opponent-board");
const opponentContext = opponentCanvas.getContext("2d");
const botTwoPanelElement = document.getElementById("bot-two-panel");
const botTwoCanvas = document.getElementById("bot-two-board");
const botTwoContext = botTwoCanvas.getContext("2d");
const nextCanvas = document.getElementById("next");
const nextContext = nextCanvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");
const levelElement = document.getElementById("level");
const linesElement = document.getElementById("lines");
const comboElement = document.getElementById("combo");
const screenElement = document.getElementById("screen");
const screenTitleElement = document.getElementById("screen-title");
const screenSubtitleElement = document.getElementById("screen-subtitle");
const startButton = document.getElementById("start-button");
const multiplayerButton = document.getElementById("multiplayer-button");
const botButton = document.getElementById("bot-button");
const modeButtonsElement = document.getElementById("mode-buttons");
const multiplayerPanelElement = document.getElementById("multiplayer-panel");
const createRoomButton = document.getElementById("create-room-button");
const joinRoomButton = document.getElementById("join-room-button");
const readyButton = document.getElementById("ready-button");
const roomCodeInput = document.getElementById("room-code-input");
const roomStatusElement = document.getElementById("room-status");
const botPanelElement = document.getElementById("bot-panel");
const botStatusElement = document.getElementById("bot-status");
const screenMenuButton = document.getElementById("screen-menu-button");
const rankingElement = document.getElementById("ranking");
const screenRankingElement = document.getElementById("screen-ranking");
const remoteScoreRow = document.getElementById("remote-score-row");
const remoteScoreElement = document.getElementById("remote-score");
const botOneScoreRow = document.getElementById("bot-one-score-row");
const botOneScoreElement = document.getElementById("bot-one-score");
const botTwoScoreRow = document.getElementById("bot-two-score-row");
const botTwoScoreElement = document.getElementById("bot-two-score");

const COLORS = {
  I: "#0ea5e9",
  J: "#2563eb",
  L: "#f97316",
  O: "#eab308",
  S: "#10b981",
  T: "#8b5cf6",
  Z: "#ef4444"
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
let mode = "title";
let modeStartedAt = 0;
let gameOver = false;
let score = 0;
let ranking = loadRanking();
let highScore = Math.max(Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0, ranking[0] || 0);
let level = 1;
let linesCleared = 0;
let combo = -1;
let backToBack = false;
let lastMoveWasRotation = false;
let demoStep = 0;
let currentScoreSaved = false;
let particles = [];
let lineEffects = [];
let lockEffects = [];
let shakeTime = 0;
let gameMode = "solo";
let selectedBotDifficulty = "medio";
let socket = null;
let roomCode = "";
let playerLabel = "Jogador Solo";
let remoteState = null;
let remoteGameOver = false;
let multiplayerResult = "";
let lastStateSync = 0;
let botGames = [];
let botFinalRanking = [];
let paused = false;
let floatingTexts = [];
let localReady = false;
let remoteReady = false;

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

function createBotGame(name, style) {
  return {
    name,
    style,
    board: createBoard(),
    currentPiece: createPiece(),
    nextPiece: createPiece(),
    dropCounter: 0,
    actionCounter: 0,
    plan: null,
    gameOver: false,
    score: 0,
    level: 1,
    lines: 0,
    combo: -1,
    backToBack: false,
    lastMoveWasRotation: false,
    particles: [],
    lineEffects: [],
    lockEffects: [],
    shakeTime: 0
  };
}

function resetGame() {
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
  demoStep = 0;
  currentScoreSaved = false;
  particles = [];
  lineEffects = [];
  lockEffects = [];
  floatingTexts = [];
  shakeTime = 0;
  paused = false;
  remoteState = null;
  remoteGameOver = false;
  multiplayerResult = "";
  lastStateSync = 0;
  localReady = false;
  remoteReady = false;
  if (gameMode === "bot") {
    botGames = [createBotGame("VILLACORTA 67", "balanced"), createBotGame("VILLACORTA 69", "clean")];
    botFinalRanking = [];
  } else {
    botGames = [];
  }
  updateStats();
}

function setMode(nextMode) {
  mode = nextMode;
  modeStartedAt = performance.now();

  if (mode === "title") {
    gameMode = "solo";
    playerLabel = "Jogador Solo";
  }

  if (mode === "playing" || mode === "demo") {
    resetGame();
  }

  updateScreen();
  draw();
}

function updateScreen() {
  renderRanking(mode === "gameOver" && gameMode === "bot" ? botFinalRanking : ranking);
  updateModeLayout();

  if (mode === "playing") {
    screenElement.hidden = true;
    return;
  }

  screenElement.hidden = false;
  modeButtonsElement.hidden = mode !== "title";
  multiplayerPanelElement.hidden = mode !== "multiplayerLobby";
  botPanelElement.hidden = mode !== "botDifficulty";
  screenMenuButton.hidden = mode === "title" || mode === "playing";

  if (mode === "title") {
    screenTitleElement.textContent = "Tetris Arcade";
    screenSubtitleElement.textContent = "Escolha um modo ou pressione qualquer tecla para jogar solo";
    startButton.textContent = "Jogador Solo";
    screenRankingElement.hidden = true;
  } else if (mode === "demo") {
    screenTitleElement.textContent = "Demo";
    screenSubtitleElement.textContent = "Modo de demonstracao";
    screenRankingElement.hidden = true;
  } else if (mode === "scores") {
    screenTitleElement.textContent = "High Scores";
    screenSubtitleElement.textContent = "Ranking das melhores pontuacoes";
    screenRankingElement.hidden = false;
  } else if (mode === "gameOver") {
    screenTitleElement.textContent = "GAME OVER";
    screenSubtitleElement.textContent = multiplayerResult || `Pontuacao final: ${score}`;
    screenRankingElement.hidden = false;
  } else if (mode === "multiplayerLobby") {
    screenTitleElement.textContent = "Multiplayer Online";
    screenSubtitleElement.textContent = "Crie uma sala ou entre com um codigo";
    screenRankingElement.hidden = true;
  } else if (mode === "botDifficulty") {
    screenTitleElement.textContent = "Contra Bot";
    screenSubtitleElement.textContent = "Escolha a dificuldade para a Fase 6";
    screenRankingElement.hidden = true;
  }
}

function updateModeLayout() {
  const activeMode = mode === "playing" || mode === "gameOver" || mode === "demo";
  const isMultiplayer = gameMode === "multiplayer" && activeMode;
  const isBotMode = gameMode === "bot" && activeMode;

  boardSetElement.classList.toggle("multiplayer", isMultiplayer);
  boardSetElement.classList.toggle("bot-mode", isBotMode);
  opponentPanelElement.hidden = !isMultiplayer && !isBotMode;
  botTwoPanelElement.hidden = !isBotMode;
  remoteScoreRow.hidden = gameMode !== "multiplayer";
  botOneScoreRow.hidden = gameMode !== "bot";
  botTwoScoreRow.hidden = gameMode !== "bot";
  localLabelElement.textContent = gameMode === "multiplayer" ? playerLabel : (gameMode === "bot" ? "VOCE" : "Jogador Solo");
  opponentLabelElement.textContent = gameMode === "bot" ? "VILLACORTA 67" : (playerLabel === "Jogador 1" ? "Jogador 2" : "Jogador 1");
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

function renderRanking(items = ranking) {
  const renderedItems = items.map((value, index) => {
    if (typeof value === "number") {
      return `<li>${value}</li>`;
    }

    return `<li>${index + 1}. ${value.name} - ${value.score} pts, ${value.lines} linhas, nivel ${value.level}</li>`;
  }).join("");
  rankingElement.innerHTML = renderedItems;
  screenRankingElement.innerHTML = renderedItems;
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
  if (gameOver || mode !== "playing") {
    return;
  }

  moveActivePiece(offsetX);
}

function moveActivePiece(offsetX) {
  const nextX = currentPiece.x + offsetX;
  if (!collides(currentPiece, nextX, currentPiece.y)) {
    currentPiece.x = nextX;
    lastMoveWasRotation = false;
  }
}

function rotatePiece() {
  if (gameOver || mode !== "playing") {
    return;
  }

  rotateActivePiece();
}

function rotateActivePiece() {
  if (currentPiece.type === "O") {
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
  if (gameOver || mode !== "playing") {
    return;
  }

  if (!collides(currentPiece, currentPiece.x, currentPiece.y + 1)) {
    currentPiece.y += 1;
    score += 1;
    addFloatingText("+1", currentPiece.x * BLOCK + BLOCK, currentPiece.y * BLOCK, "#67d7d1");
    lastMoveWasRotation = false;
    updateHighScore();
    updateStats();
    return;
  }

  lockPiece();
}

function hardDrop() {
  if (gameOver || mode !== "playing") {
    return;
  }

  let distance = 0;
  while (!collides(currentPiece, currentPiece.x, currentPiece.y + 1)) {
    currentPiece.y += 1;
    distance += 1;
  }

  score += distance * 2;
  if (distance > 0) {
    addFloatingText(`Hard +${distance * 2}`, currentPiece.x * BLOCK + BLOCK, currentPiece.y * BLOCK, "#67d7d1");
  }
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
  const lockedCells = getPieceCells(lockedPiece);

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

  addLockEffect(lockedCells, currentPiece.color);
  const cleared = clearLines();
  let bombDestroyed = 0;

  if (cleared > 0) {
    bombDestroyed = activateLineBomb(lockedCells);
    if (bombDestroyed > 0) {
      score += bombDestroyed * BOMB_BLOCK_POINTS;
      addFloatingText(`Bomba +${bombDestroyed * BOMB_BLOCK_POINTS}`, boardCanvas.width / 2, boardCanvas.height / 2, "#ea5667");
    }
  }

  applyScore(cleared, wasTSpin);
  spawnPiece();
}

function getPieceCells(piece) {
  const cells = [];

  piece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        cells.push({
          x: piece.x + x,
          y: piece.y + y
        });
      }
    });
  });

  return cells;
}

function clearLines() {
  let cleared = 0;

  for (let y = ROWS - 1; y >= 0; y -= 1) {
    if (board[y].every(Boolean)) {
      addLineEffect(y);
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(null));
      cleared += 1;
      y += 1;
    }
  }

  return cleared;
}

function activateLineBomb(lockedCells) {
  const targets = new Map();

  lockedCells.forEach((cell) => {
    for (let y = cell.y - 1; y <= cell.y + 1; y += 1) {
      for (let x = cell.x - 1; x <= cell.x + 1; x += 1) {
        if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
          targets.set(`${x},${y}`, { x, y });
        }
      }
    }
  });

  let destroyed = 0;

  targets.forEach(({ x, y }) => {
    if (board[y][x]) {
      board[y][x] = null;
      destroyed += 1;
      addExplosion(x, y);
    }
  });

  if (destroyed > 0) {
    shakeTime = 220;
  }

  return destroyed;
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
    if (cleared > 0) {
      addFloatingText("T-Spin", boardCanvas.width / 2, boardCanvas.height / 2 - 34, "#a56de2");
    }
  } else if (cleared > 0) {
    points += LINE_POINTS[cleared] * level;
    addFloatingText(`${cleared} linha${cleared > 1 ? "s" : ""}`, boardCanvas.width / 2, boardCanvas.height / 2 - 34, "#f4d35e");
  }

  if (cleared > 0 && combo > 0) {
    points += combo * 50 * level;
    addComboEffect();
    addFloatingText(`Combo ${combo}`, boardCanvas.width / 2, boardCanvas.height / 2 - 58, "#67d7d1");
  }

  if (difficultClear && backToBack) {
    points = Math.floor(points * 1.5);
    addFloatingText("Back-to-Back", boardCanvas.width / 2, boardCanvas.height / 2 - 82, "#f4d35e");
  }

  if (difficultClear) {
    backToBack = true;
  } else if (cleared > 0) {
    backToBack = false;
  }

  score += points;
  if (points > 0) {
    addFloatingText(`+${points}`, boardCanvas.width / 2, boardCanvas.height / 2 + 18, "#0f172a");
  }
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
  remoteScoreElement.textContent = remoteState ? String(remoteState.score) : "0";
  botOneScoreElement.textContent = botGames[0] ? String(botGames[0].score) : "0";
  botTwoScoreElement.textContent = botGames[1] ? String(botGames[1].score) : "0";
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
    finishGame();
  }
}

function finishGame() {
  if (mode === "demo") {
    resetGame();
    return;
  }

  gameOver = true;
  sendMultiplayerState();

  if (gameMode === "bot") {
    finishBotMatchIfNeeded();
    return;
  }

  if (gameMode === "multiplayer") {
    if (remoteGameOver) {
      finishMultiplayerByScore();
    } else {
      multiplayerResult = "Aguardando o outro jogador terminar";
      updateScreen();
    }
    return;
  }

  saveScoreToRanking();
  setMode("gameOver");
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
  updateEffects(deltaTime);

  updateAttractLoop(time);

  if ((mode === "playing" || mode === "demo") && !paused) {
    dropCounter += deltaTime;

    if (mode === "demo") {
      runDemo(deltaTime);
    }

    if (dropCounter > getDropInterval()) {
      gravityDrop();
      dropCounter = 0;
    }

    if (gameMode === "multiplayer" && mode === "playing" && time - lastStateSync > 180) {
      sendMultiplayerState();
      lastStateSync = time;
    }

    if (gameMode === "bot" && mode === "playing") {
      updateBotGames(deltaTime);
    }
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
  const target = Math.floor((COLS - currentPiece.shape[0].length) / 2 + Math.sin(performance.now() / 520) * 3);

  if (Math.random() < 0.18) {
    rotateActivePiece();
  }

  if (currentPiece.x < target) {
    moveActivePiece(1);
  } else if (currentPiece.x > target) {
    moveActivePiece(-1);
  }
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
  boardContext.save();

  if (shakeTime > 0) {
    boardContext.translate((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5);
  }

  drawGrid(boardContext, COLS, ROWS, BLOCK);
  drawBoard();

  if (currentPiece) {
    drawPiece(getGhostPiece(), boardContext, BLOCK, 0.22, true);
    drawPiece(currentPiece, boardContext, BLOCK);
  }

  if (gameOver) {
    drawGameOver();
  }

  drawEffects();
  drawFloatingTexts(boardContext, floatingTexts);
  if (paused && mode === "playing") {
    drawPauseOverlay(boardContext, boardCanvas);
  }
  boardContext.restore();

  drawNext();

  if (gameMode === "multiplayer") {
    drawOpponent();
  } else if (gameMode === "bot") {
    drawBotGame(botGames[0], opponentContext, opponentCanvas);
    drawBotGame(botGames[1], botTwoContext, botTwoCanvas);
  }
}

function drawOpponent() {
  opponentContext.clearRect(0, 0, opponentCanvas.width, opponentCanvas.height);
  drawGrid(opponentContext, COLS, ROWS, BLOCK);

  if (!remoteState) {
    opponentContext.fillStyle = "rgba(15, 23, 42, 0.6)";
    opponentContext.font = "16px 'Inter', sans-serif";
    opponentContext.textAlign = "center";
    opponentContext.fillText("Aguardando jogador", opponentCanvas.width / 2, opponentCanvas.height / 2);
    return;
  }

  remoteState.board.forEach((row, y) => {
    row.forEach((color, x) => {
      if (color) {
        drawBlock(opponentContext, x, y, BLOCK, color);
      }
    });
  });

  if (remoteState.currentPiece) {
    drawPiece(remoteState.currentPiece, opponentContext, BLOCK);
  }

  if (remoteState.gameOver) {
    drawRemoteGameOver();
  }
}

function drawRemoteGameOver() {
  opponentContext.fillStyle = "rgba(255, 255, 255, 0.85)";
  opponentContext.fillRect(0, 0, opponentCanvas.width, opponentCanvas.height);
  opponentContext.fillStyle = "#0f172a";
  opponentContext.font = "700 30px 'Outfit', sans-serif";
  opponentContext.textAlign = "center";
  opponentContext.fillText("GAME OVER", opponentCanvas.width / 2, opponentCanvas.height / 2);
}

function updateBotGames(deltaTime) {
  const settings = getBotDifficultySettings();

  botGames.forEach((game) => {
    if (game.gameOver) {
      return;
    }

    updateBotEffects(game, deltaTime);
    game.actionCounter += deltaTime;
    game.dropCounter += deltaTime;

    if (game.actionCounter >= settings.actionDelay) {
      game.actionCounter = 0;
      driveBot(game, settings);
    }

    if (game.dropCounter > getBotDropInterval(game)) {
      botGravityDrop(game);
      game.dropCounter = 0;
    }
  });
}

function getBotDifficultySettings() {
  const difficulty = selectedBotDifficulty || localStorage.getItem("tetris-bot-difficulty") || "medio";

  if (difficulty === "facil") {
    return { actionDelay: 260, mistakeChance: 0.35, hardDropChance: 0.35, weights: { holes: 28, height: 5, bump: 4, clear: 75 } };
  }

  if (difficulty === "dificil") {
    return { actionDelay: 70, mistakeChance: 0.03, hardDropChance: 0.95, weights: { holes: 70, height: 11, bump: 10, clear: 150 } };
  }

  return { actionDelay: 130, mistakeChance: 0.12, hardDropChance: 0.7, weights: { holes: 48, height: 8, bump: 7, clear: 110 } };
}

function driveBot(game, settings) {
  if (!game.plan) {
    game.plan = chooseBotPlan(game, settings);
  }

  if (!game.plan) {
    botGravityDrop(game);
    return;
  }

  if (game.plan.rotations > 0) {
    botRotate(game);
    game.plan.rotations -= 1;
    return;
  }

  if (game.currentPiece.x < game.plan.x) {
    botMove(game, 1);
    return;
  }

  if (game.currentPiece.x > game.plan.x) {
    botMove(game, -1);
    return;
  }

  if (Math.random() < settings.hardDropChance) {
    botHardDrop(game);
  } else {
    botGravityDrop(game);
  }
}

function chooseBotPlan(game, settings) {
  let best = null;
  const rotations = getRotations(game.currentPiece);

  rotations.forEach(({ rotation, shape }) => {
    for (let x = -2; x < COLS; x += 1) {
      const piece = { ...game.currentPiece, shape, x, y: 0 };

      if (botCollides(game, piece, piece.x, piece.y, shape)) {
        continue;
      }

      while (!botCollides(game, piece, piece.x, piece.y + 1, shape)) {
        piece.y += 1;
      }

      const boardAfter = simulateBotLock(game.board, piece, shape);
      const metrics = analyzeBotBoard(boardAfter);
      const scoreValue = (
        metrics.cleared * settings.weights.clear
        - metrics.holes * settings.weights.holes
        - metrics.aggregateHeight * settings.weights.height
        - metrics.bumpiness * settings.weights.bump
        - metrics.maxHeight * 12
      );

      if (!best || scoreValue > best.score) {
        best = { score: scoreValue, x, rotations: rotation };
      }
    }
  });

  if (best && Math.random() < settings.mistakeChance) {
    best.x = Math.max(0, Math.min(COLS - 1, best.x + (Math.random() < 0.5 ? -1 : 1)));
  }

  return best;
}

function getRotations(piece) {
  const rotations = [];
  let shape = cloneMatrix(piece.shape);

  for (let rotation = 0; rotation < 4; rotation += 1) {
    const key = JSON.stringify(shape);

    if (!rotations.some((item) => item.key === key)) {
      rotations.push({ rotation, shape: cloneMatrix(shape), key });
    }

    shape = rotateMatrix(shape);
  }

  return rotations;
}

function botCollides(game, piece, nextX, nextY, shape = piece.shape) {
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

function botMove(game, offsetX) {
  const nextX = game.currentPiece.x + offsetX;

  if (!botCollides(game, game.currentPiece, nextX, game.currentPiece.y)) {
    game.currentPiece.x = nextX;
    game.lastMoveWasRotation = false;
  }
}

function botRotate(game) {
  if (game.currentPiece.type === "O") {
    return;
  }

  const rotated = rotateMatrix(game.currentPiece.shape);
  const kicks = [0, -1, 1, -2, 2];

  for (const kick of kicks) {
    if (!botCollides(game, game.currentPiece, game.currentPiece.x + kick, game.currentPiece.y, rotated)) {
      game.currentPiece.shape = rotated;
      game.currentPiece.x += kick;
      game.lastMoveWasRotation = true;
      return;
    }
  }
}

function botGravityDrop(game) {
  if (!botCollides(game, game.currentPiece, game.currentPiece.x, game.currentPiece.y + 1)) {
    game.currentPiece.y += 1;
    game.lastMoveWasRotation = false;
    return;
  }

  botLockPiece(game);
}

function botHardDrop(game) {
  let distance = 0;

  while (!botCollides(game, game.currentPiece, game.currentPiece.x, game.currentPiece.y + 1)) {
    game.currentPiece.y += 1;
    distance += 1;
  }

  game.score += distance * 2;
  botLockPiece(game);
}

function botLockPiece(game) {
  const lockedPiece = { ...game.currentPiece, shape: game.currentPiece.shape };
  const lockedCells = getBotPieceCells(lockedPiece);

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

  addBotLockEffect(game, lockedCells, game.currentPiece.color);
  const cleared = botClearLines(game);

  if (cleared > 0) {
    const destroyed = botActivateLineBomb(game, lockedCells);
    game.score += destroyed * BOMB_BLOCK_POINTS;
  }

  botApplyScore(game, cleared);
  botSpawnPiece(game);
}

function getBotPieceCells(piece) {
  const cells = [];

  piece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        cells.push({ x: piece.x + x, y: piece.y + y });
      }
    });
  });

  return cells;
}

function botClearLines(game) {
  let cleared = 0;

  for (let y = ROWS - 1; y >= 0; y -= 1) {
    if (game.board[y].every(Boolean)) {
      addBotLineEffect(game, y);
      game.board.splice(y, 1);
      game.board.unshift(Array(COLS).fill(null));
      cleared += 1;
      y += 1;
    }
  }

  return cleared;
}

function botActivateLineBomb(game, lockedCells) {
  const targets = new Map();

  lockedCells.forEach((cell) => {
    for (let y = cell.y - 1; y <= cell.y + 1; y += 1) {
      for (let x = cell.x - 1; x <= cell.x + 1; x += 1) {
        if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
          targets.set(`${x},${y}`, { x, y });
        }
      }
    }
  });

  let destroyed = 0;

  targets.forEach(({ x, y }) => {
    if (game.board[y][x]) {
      game.board[y][x] = null;
      destroyed += 1;
      addBotExplosion(game, x, y);
    }
  });

  if (destroyed > 0) {
    game.shakeTime = 220;
  }

  return destroyed;
}

function botApplyScore(game, cleared) {
  if (cleared > 0) {
    game.lines += cleared;
    game.level = Math.floor(game.lines / LINES_PER_LEVEL) + 1;
    game.combo += 1;
    game.score += LINE_POINTS[cleared] * game.level;
  } else {
    game.combo = -1;
  }

  if (cleared > 0 && game.combo > 0) {
    game.score += game.combo * 50 * game.level;
  }

  updateStats();
}

function botSpawnPiece(game) {
  game.currentPiece = game.nextPiece;
  game.currentPiece.x = Math.floor((COLS - game.currentPiece.shape[0].length) / 2);
  game.currentPiece.y = 0;
  game.nextPiece = createPiece();
  game.plan = null;

  if (botCollides(game, game.currentPiece, game.currentPiece.x, game.currentPiece.y)) {
    game.gameOver = true;
    finishBotMatchIfNeeded();
  }
}

function getBotDropInterval(game) {
  return Math.max(MIN_DROP_INTERVAL, BASE_DROP_INTERVAL - (game.level - 1) * 55);
}

function finishBotMatchIfNeeded() {
  if (!gameOver || !botGames.every((game) => game.gameOver)) {
    updateStats();
    return;
  }

  botFinalRanking = [
    { name: "VOCE", score, lines: linesCleared, level },
    ...botGames.map((game) => ({ name: game.name, score: game.score, lines: game.lines, level: game.level }))
  ].sort((a, b) => b.score - a.score || b.lines - a.lines || b.level - a.level);

  multiplayerResult = "Ranking final contra bots";
  setMode("gameOver");
}

function simulateBotLock(boardState, piece, shape) {
  const copy = boardState.map((row) => [...row]);

  shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        const boardY = piece.y + y;
        const boardX = piece.x + x;

        if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
          copy[boardY][boardX] = piece.color;
        }
      }
    });
  });

  return copy.filter((row) => !row.every(Boolean));
}

function analyzeBotBoard(boardState) {
  const padded = [
    ...Array.from({ length: ROWS - boardState.length }, () => Array(COLS).fill(null)),
    ...boardState
  ];
  const heights = Array(COLS).fill(0);
  let holes = 0;

  for (let x = 0; x < COLS; x += 1) {
    let foundBlock = false;

    for (let y = 0; y < ROWS; y += 1) {
      if (padded[y][x]) {
        if (!foundBlock) {
          heights[x] = ROWS - y;
        }
        foundBlock = true;
      } else if (foundBlock) {
        holes += 1;
      }
    }
  }

  return {
    cleared: ROWS - boardState.length,
    holes,
    aggregateHeight: heights.reduce((sum, value) => sum + value, 0),
    maxHeight: Math.max(...heights),
    bumpiness: heights.slice(1).reduce((sum, value, index) => sum + Math.abs(value - heights[index]), 0)
  };
}

function addBotLineEffect(game, row) {
  game.lineEffects.push({ row, life: 360, maxLife: 360 });
}

function addBotLockEffect(game, cells, color) {
  game.lockEffects.push({ cells, color, life: 220, maxLife: 220 });
}

function addBotExplosion(game, x, y) {
  const centerX = x * BLOCK + BLOCK / 2;
  const centerY = y * BLOCK + BLOCK / 2;

  for (let i = 0; i < 18; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2.2 + Math.random() * 6;
    game.particles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 480,
      maxLife: 480,
      color: ["#3b82f6", "#60a5fa", "#93c5fd", "#ffffff"][Math.floor(Math.random() * 4)],
      size: 3 + Math.random() * 5
    });
  }
}

function updateBotEffects(game, deltaTime) {
  game.shakeTime = Math.max(0, game.shakeTime - deltaTime);
  game.particles = game.particles
    .map((particle) => ({ ...particle, x: particle.x + particle.vx, y: particle.y + particle.vy, vy: particle.vy + 0.03, life: particle.life - deltaTime }))
    .filter((particle) => particle.life > 0);
  game.lineEffects = game.lineEffects.map((effect) => ({ ...effect, life: effect.life - deltaTime })).filter((effect) => effect.life > 0);
  game.lockEffects = game.lockEffects.map((effect) => ({ ...effect, life: effect.life - deltaTime })).filter((effect) => effect.life > 0);
}

function drawBotGame(game, context, canvas) {
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (!game) {
    return;
  }

  context.save();
  if (game.shakeTime > 0) {
    context.translate((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5);
  }

  drawGrid(context, COLS, ROWS, BLOCK);
  game.board.forEach((row, y) => {
    row.forEach((color, x) => {
      if (color) {
        drawBlock(context, x, y, BLOCK, color);
      }
    });
  });

  if (game.currentPiece) {
    drawPiece(getBotGhostPiece(game), context, BLOCK, 0.22, true);
    drawPiece(game.currentPiece, context, BLOCK);
  }

  drawBotEffects(game, context);

  if (game.gameOver) {
    context.fillStyle = "rgba(255, 255, 255, 0.85)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#0f172a";
    context.font = "700 30px 'Outfit', sans-serif";
    context.textAlign = "center";
    context.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
  }

  context.restore();
}

function drawBotEffects(game, context) {
  game.lineEffects.forEach((effect) => {
    const alpha = effect.life / effect.maxLife;
    context.fillStyle = `rgba(59, 130, 246, ${0.35 * alpha})`;
    context.fillRect(0, effect.row * BLOCK, COLS * BLOCK, BLOCK);
  });

  game.lockEffects.forEach((effect) => {
    const alpha = effect.life / effect.maxLife;
    context.strokeStyle = effect.color;
    context.globalAlpha = alpha;
    context.lineWidth = 2;
    effect.cells.forEach((cell) => {
      context.strokeRect(cell.x * BLOCK + 3, cell.y * BLOCK + 3, BLOCK - 6, BLOCK - 6);
    });
    context.globalAlpha = 1;
  });

  game.particles.forEach((particle) => {
    const alpha = particle.life / particle.maxLife;
    context.globalAlpha = alpha;
    context.fillStyle = particle.color;
    context.fillRect(particle.x, particle.y, particle.size, particle.size);
    context.globalAlpha = 1;
  });
}

function getBotGhostPiece(game) {
  const ghost = { ...game.currentPiece, shape: game.currentPiece.shape };

  while (!botCollides(game, ghost, ghost.x, ghost.y + 1, ghost.shape)) {
    ghost.y += 1;
  }

  return ghost;
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
        context.lineWidth = 2;
        context.setLineDash([4, 4]);
        drawRoundedRect(context, drawX * blockSize + 2, drawY * blockSize + 2, blockSize - 4, blockSize - 4, 6);
        context.stroke();
        context.setLineDash([]);
      } else {
        drawBlock(context, drawX, drawY, blockSize, piece.color);
      }
    });
  });

  context.restore();
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawBlock(context, x, y, size, color) {
  const px = x * size;
  const py = y * size;
  const padding = 1.5;
  const radius = 6;

  context.save();
  context.fillStyle = color;
  drawRoundedRect(context, px + padding, py + padding, size - padding * 2, size - padding * 2, radius);
  context.fill();

  context.strokeStyle = "rgba(255, 255, 255, 0.35)";
  context.lineWidth = 1;
  context.stroke();
  context.restore();
}

function addLineEffect(row) {
  lineEffects.push({
    row,
    life: 360,
    maxLife: 360
  });
}

function addLockEffect(cells, color) {
  lockEffects.push({
    cells,
    color,
    life: 220,
    maxLife: 220
  });
}

function addComboEffect() {
  for (let i = 0; i < 18; i += 1) {
    particles.push({
      x: boardCanvas.width / 2,
      y: boardCanvas.height / 2,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
      life: 520,
      maxLife: 520,
      color: "#f4d35e",
      size: 3 + Math.random() * 3
    });
  }
}

function addExplosion(x, y) {
  const centerX = x * BLOCK + BLOCK / 2;
  const centerY = y * BLOCK + BLOCK / 2;

  addFloatingText("BOOM", centerX, centerY, "#ea5667");

  for (let i = 0; i < 22; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2.2 + Math.random() * 6;
    particles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 480,
      maxLife: 480,
      color: ["#3b82f6", "#60a5fa", "#93c5fd", "#ffffff"][Math.floor(Math.random() * 4)],
      size: 3 + Math.random() * 5
    });
  }
}

function addFloatingText(text, x, y, color = "#0f172a") {
  floatingTexts.push({
    text,
    x,
    y,
    vy: -0.45,
    life: 900,
    maxLife: 900,
    color
  });
}

function updateEffects(deltaTime) {
  shakeTime = Math.max(0, shakeTime - deltaTime);

  particles = particles
    .map((particle) => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      vy: particle.vy + 0.03,
      life: particle.life - deltaTime
    }))
    .filter((particle) => particle.life > 0);

  floatingTexts = floatingTexts
    .map((item) => ({
      ...item,
      y: item.y + item.vy,
      life: item.life - deltaTime
    }))
    .filter((item) => item.life > 0);

  lineEffects = lineEffects
    .map((effect) => ({
      ...effect,
      life: effect.life - deltaTime
    }))
    .filter((effect) => effect.life > 0);

  lockEffects = lockEffects
    .map((effect) => ({
      ...effect,
      life: effect.life - deltaTime
    }))
    .filter((effect) => effect.life > 0);
}

function drawFloatingTexts(context, items) {
  context.save();
  context.textAlign = "center";
  context.font = "700 16px Arial, Helvetica, sans-serif";
  items.forEach((item) => {
    context.globalAlpha = item.life / item.maxLife;
    context.fillStyle = item.color;
    context.fillText(item.text, item.x, item.y);
  });
  context.restore();
}

function drawPauseOverlay(context, canvas) {
  context.fillStyle = "rgba(255, 255, 255, 0.85)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#0f172a";
  context.font = "700 30px 'Outfit', sans-serif";
  context.textAlign = "center";
  context.fillText("PAUSADO", canvas.width / 2, canvas.height / 2);
}

function drawEffects() {
  lineEffects.forEach((effect) => {
    const alpha = effect.life / effect.maxLife;
    boardContext.fillStyle = `rgba(59, 130, 246, ${0.35 * alpha})`;
    boardContext.fillRect(0, effect.row * BLOCK, COLS * BLOCK, BLOCK);
  });

  lockEffects.forEach((effect) => {
    const alpha = effect.life / effect.maxLife;
    boardContext.strokeStyle = effect.color;
    boardContext.globalAlpha = alpha;
    boardContext.lineWidth = 2;
    effect.cells.forEach((cell) => {
      boardContext.strokeRect(cell.x * BLOCK + 3, cell.y * BLOCK + 3, BLOCK - 6, BLOCK - 6);
    });
    boardContext.globalAlpha = 1;
  });

  particles.forEach((particle) => {
    const alpha = particle.life / particle.maxLife;
    boardContext.globalAlpha = alpha;
    boardContext.fillStyle = particle.color;
    boardContext.fillRect(particle.x, particle.y, particle.size, particle.size);
    boardContext.globalAlpha = 1;
  });
}

function drawGrid(context, cols, rows, blockSize) {
  context.fillStyle = "#f8fafc";
  context.fillRect(0, 0, cols * blockSize, rows * blockSize);
  context.strokeStyle = "rgba(15, 23, 42, 0.04)";
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

  if (!nextPiece) {
    return;
  }

  const preview = {
    ...nextPiece,
    x: (4 - nextPiece.shape[0].length) / 2,
    y: (4 - nextPiece.shape.length) / 2
  };

  drawPiece(preview, nextContext, 30);
}

function serializeState() {
  return {
    board,
    currentPiece,
    score,
    level,
    lines: linesCleared,
    gameOver
  };
}

function sendMultiplayerState() {
  if (gameMode !== "multiplayer" || !socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }

  socket.send(JSON.stringify({
    type: "state",
    state: serializeState()
  }));
}

function openMultiplayerLobby() {
  gameMode = "multiplayer";
  mode = "multiplayerLobby";
  multiplayerResult = "";
  localReady = false;
  remoteReady = false;
  readyButton.hidden = true;
  readyButton.disabled = false;
  readyButton.textContent = "Pronto";
  roomStatusElement.textContent = "Aguardando sala";
  updateScreen();
}

function openBotDifficulty() {
  mode = "botDifficulty";
  updateScreen();
}

function connectSocket() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  const protocol = location.protocol === "https:" ? "wss" : "ws";
  socket = new WebSocket(`${protocol}://${location.host}`);

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    handleSocketMessage(data);
  });

  socket.addEventListener("close", () => {
    roomStatusElement.textContent = "Conexao encerrada";
  });

  return socket;
}

function handleSocketMessage(data) {
  if (data.type === "roomCreated") {
    roomCode = data.code;
    playerLabel = data.player;
    roomStatusElement.textContent = `Sala ${roomCode}. Aguardando Jogador 2`;
    readyButton.hidden = false;
    readyButton.disabled = false;
    updateModeLayout();
  } else if (data.type === "joined") {
    roomCode = data.code;
    playerLabel = data.player;
    remoteReady = Boolean(data.remoteReady);
    roomStatusElement.textContent = remoteReady ? `Conectado na sala ${roomCode}. Outro jogador pronto` : `Conectado na sala ${roomCode}`;
    readyButton.hidden = false;
    readyButton.disabled = false;
    updateModeLayout();
  } else if (data.type === "peerJoined") {
    roomStatusElement.textContent = `Jogador conectado na sala ${roomCode}. Marque pronto`;
  } else if (data.type === "ready") {
    remoteReady = true;
    roomStatusElement.textContent = localReady ? "Ambos prontos. Iniciando..." : "Outro jogador pronto";
  } else if (data.type === "multiplayerStart") {
    roomStatusElement.textContent = "Ambos prontos. Iniciando...";
    startMultiplayerGame();
  } else if (data.type === "state") {
    remoteState = data.state;
    remoteGameOver = Boolean(remoteState.gameOver);
    updateStats();

    if (remoteGameOver && !gameOver) {
      multiplayerResult = `${playerLabel} venceu`;
      setMode("gameOver");
    } else if (remoteGameOver && gameOver) {
      finishMultiplayerByScore();
    }
  } else if (data.type === "peerLeft") {
    roomStatusElement.textContent = "Outro jogador saiu da sala";
  } else if (data.type === "error") {
    roomStatusElement.textContent = data.message;
  }
}

function startMultiplayerGame() {
  if (gameMode === "multiplayer" && mode === "playing") {
    return;
  }

  gameMode = "multiplayer";
  remoteState = null;
  remoteGameOver = false;
  multiplayerResult = "";
  setMode("playing");
  sendMultiplayerState();
  setTimeout(sendMultiplayerState, 120);
  setTimeout(sendMultiplayerState, 360);
  setTimeout(sendMultiplayerState, 720);
}

function returnToMenu() {
  closeSocket();
  gameMode = "solo";
  playerLabel = "Jogador Solo";
  localReady = false;
  remoteReady = false;
  paused = false;
  setMode("title");
}

function finishMultiplayerByScore() {
  if (score > (remoteState?.score || 0)) {
    multiplayerResult = `${playerLabel} venceu por pontuacao`;
  } else if (score < (remoteState?.score || 0)) {
    multiplayerResult = `${opponentLabelElement.textContent} venceu por pontuacao`;
  } else {
    multiplayerResult = "Empate";
  }

  setMode("gameOver");
}

function drawGameOver() {
  boardContext.fillStyle = "rgba(255, 255, 255, 0.85)";
  boardContext.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
  boardContext.fillStyle = "#0f172a";
  boardContext.font = "700 30px 'Outfit', sans-serif";
  boardContext.textAlign = "center";
  boardContext.fillText("GAME OVER", boardCanvas.width / 2, boardCanvas.height / 2 - 12);
  boardContext.font = "14px 'Inter', sans-serif";
  boardContext.fillStyle = "#64748b";
  boardContext.fillText("Retornando ao início", boardCanvas.width / 2, boardCanvas.height / 2 + 24);
}

function startPlaying() {
  gameMode = "solo";
  playerLabel = "Jogador Solo";
  setMode("playing");
}

function startSolo() {
  gameMode = "solo";
  playerLabel = "Jogador Solo";
  closeSocket();
  setMode("playing");
}

function closeSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}

document.addEventListener("keydown", (event) => {
  if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) {
    return;
  }

  if (mode !== "playing") {
    event.preventDefault();

    if (mode === "gameOver") {
      returnToMenu();
    } else if (mode === "title" || mode === "demo" || mode === "scores") {
      startSolo();
    }

    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    returnToMenu();
  } else if (event.key.toLowerCase() === "p") {
    event.preventDefault();
    paused = !paused;
    draw();
  } else if (paused) {
    event.preventDefault();
  } else if (event.key === "ArrowLeft") {
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
    startPlaying();
  }
});

screenElement.addEventListener("click", () => {
  if (mode === "gameOver") {
    returnToMenu();
  }
});

screenMenuButton.addEventListener("click", (event) => {
  event.stopPropagation();
  returnToMenu();
});

document.querySelectorAll(".mode-panel .back-menu-button").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    returnToMenu();
  });
});

startButton.addEventListener("click", (event) => {
  event.stopPropagation();
  startSolo();
});

multiplayerButton.addEventListener("click", (event) => {
  event.stopPropagation();
  openMultiplayerLobby();
});

botButton.addEventListener("click", (event) => {
  event.stopPropagation();
  openBotDifficulty();
});

createRoomButton.addEventListener("click", (event) => {
  event.stopPropagation();
  const ws = connectSocket();
  roomStatusElement.textContent = "Criando sala...";
  ws.addEventListener("open", () => {
    ws.send(JSON.stringify({ type: "create" }));
  }, { once: true });

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "create" }));
  }
});

joinRoomButton.addEventListener("click", (event) => {
  event.stopPropagation();
  const code = roomCodeInput.value.trim().toUpperCase();

  if (!code) {
    roomStatusElement.textContent = "Informe o codigo da sala";
    return;
  }

  const ws = connectSocket();
  roomStatusElement.textContent = "Entrando na sala...";
  ws.addEventListener("open", () => {
    ws.send(JSON.stringify({ type: "join", code }));
  }, { once: true });

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "join", code }));
  }
});

readyButton.addEventListener("click", (event) => {
  event.stopPropagation();
  localReady = true;
  readyButton.textContent = "Pronto!";
  readyButton.disabled = true;
  roomStatusElement.textContent = remoteReady ? "Ambos prontos. Iniciando..." : "Aguardando outro jogador ficar pronto";

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "ready" }));
  }

});

document.querySelectorAll(".difficulty-button").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    selectedBotDifficulty = button.dataset.difficulty;
    localStorage.setItem("tetris-bot-difficulty", selectedBotDifficulty);
    botStatusElement.textContent = `Dificuldade ${button.textContent} selecionada`;
    gameMode = "bot";
    playerLabel = "VOCE";
    closeSocket();
    setMode("playing");
  });
});

resetGame();
setMode("title");
requestAnimationFrame(update);
console.log("ETAPA 7 CONCLUÍDA — aguardando validação");
