const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");

loadEnv();

const PORT = Number(process.env.PORT) || 8000;
const ROOT = __dirname;
const rooms = new Map();

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8"
};

const server = http.createServer((request, response) => {
  if (request.method !== "GET") {
    response.writeHead(405);
    response.end();
    return;
  }

  const url = new URL(request.url, `http://localhost:${PORT}`);
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(ROOT, pathname));

  if (!filePath.startsWith(ROOT)) {
    response.writeHead(403);
    response.end();
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Arquivo nao encontrado");
      return;
    }

    response.writeHead(200, {
      "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(data);
  });
});

server.on("upgrade", (request, socket) => {
  if (request.headers.upgrade?.toLowerCase() !== "websocket") {
    socket.destroy();
    return;
  }

  const accept = crypto
    .createHash("sha1")
    .update(`${request.headers["sec-websocket-key"]}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest("base64");

  socket.write([
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${accept}`,
    "",
    ""
  ].join("\r\n"));

  socket.frameBuffer = Buffer.alloc(0);
  socket.setNoDelay(true);

  socket.on("data", (buffer) => {
    const result = decodeFrames(Buffer.concat([socket.frameBuffer, buffer]));
    socket.frameBuffer = result.remaining;
    result.messages.forEach((message) => handleMessage(socket, message));
  });

  socket.on("close", () => removeClient(socket));
  socket.on("error", () => removeClient(socket));
});

server.listen(PORT, () => {
  console.log(`Servidor em http://localhost:${PORT}`);
  console.log("ETAPA 7 CONCLUÍDA — aguardando validação");
});

function handleMessage(socket, message) {
  let data;

  try {
    data = JSON.parse(message);
  } catch {
    return;
  }

  if (data.type === "create") {
    removeClient(socket);
    const code = createCode();
    rooms.set(code, { players: [socket], ready: new Set(), started: false });
    socket.roomCode = code;
    socket.playerIndex = 0;
    send(socket, { type: "roomCreated", code, player: "Jogador 1" });
    return;
  }

  if (data.type === "join") {
    removeClient(socket);
    const code = String(data.code || "").trim().toUpperCase();
    const room = rooms.get(code);

    if (!room || room.started || room.players.length >= 2) {
      send(socket, { type: "error", message: "Sala indisponivel" });
      return;
    }

    room.players.push(socket);
    socket.roomCode = code;
    socket.playerIndex = 1;
    send(socket, { type: "joined", code, player: "Jogador 2", remoteReady: room.ready.has(room.players[0]) });
    broadcast(room, { type: "peerJoined" }, socket);
    return;
  }

  if (data.type === "ready") {
    const room = rooms.get(socket.roomCode);
    if (room) {
      room.ready.add(socket);
      broadcast(room, { type: "ready" }, socket);

      if (room.players.length === 2 && room.players.every((player) => room.ready.has(player))) {
        room.started = true;
        sendToRoom(room, { type: "multiplayerStart" });
      }
    }
    return;
  }

  if (data.type === "state" || data.type === "result") {
    const room = rooms.get(socket.roomCode);
    if (room) {
      broadcast(room, data, socket);
    }
  }
}

function createCode() {
  let code;

  do {
    code = Math.random().toString(36).slice(2, 8).toUpperCase();
  } while (rooms.has(code));

  return code;
}

function removeClient(socket) {
  const room = rooms.get(socket.roomCode);

  if (!room) {
    delete socket.roomCode;
    delete socket.playerIndex;
    return;
  }

  room.players = room.players.filter((player) => player !== socket);
  room.ready.delete(socket);
  broadcast(room, { type: "peerLeft" }, socket);

  if (room.players.length === 0) {
    rooms.delete(socket.roomCode);
  }

  delete socket.roomCode;
  delete socket.playerIndex;
}

function broadcast(room, payload, except) {
  room.players.forEach((player) => {
    if (player !== except) {
      send(player, payload);
    }
  });
}

function sendToRoom(room, payload) {
  room.players.forEach((player) => send(player, payload));
}

function send(socket, payload) {
  if (!socket.writable) {
    return;
  }

  const data = Buffer.from(JSON.stringify(payload));
  const header = data.length < 126
    ? Buffer.from([0x81, data.length])
    : Buffer.from([0x81, 126, data.length >> 8, data.length & 255]);

  socket.write(Buffer.concat([header, data]));
}

function decodeFrames(buffer) {
  const messages = [];
  let cursor = 0;

  while (cursor + 2 <= buffer.length) {
    const opcode = buffer[cursor] & 0x0f;
    const masked = Boolean(buffer[cursor + 1] & 0x80);
    let length = buffer[cursor + 1] & 0x7f;
    let offset = cursor + 2;

    if (length === 126) {
      if (offset + 2 > buffer.length) {
        break;
      }
      length = buffer.readUInt16BE(offset);
      offset += 2;
    } else if (length === 127) {
      if (offset + 8 > buffer.length) {
        break;
      }
      length = Number(buffer.readBigUInt64BE(offset));
      offset += 8;
    }

    const maskLength = masked ? 4 : 0;
    if (offset + maskLength + length > buffer.length) {
      break;
    }

    const mask = masked ? buffer.slice(offset, offset + 4) : null;
    offset += maskLength;
    const payload = Buffer.from(buffer.slice(offset, offset + length));
    cursor = offset + length;

    if (opcode === 0x08) {
      continue;
    }

    if (opcode !== 0x01) {
      continue;
    }

    if (mask) {
      for (let i = 0; i < payload.length; i += 1) {
        payload[i] ^= mask[i % 4];
      }
    }

    messages.push(payload.toString("utf8"));
  }

  return {
    messages,
    remaining: buffer.slice(cursor)
  };
}

function loadEnv() {
  const envPath = path.join(__dirname, ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  fs.readFileSync(envPath, "utf8").split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separator = trimmed.indexOf("=");

    if (separator === -1) {
      return;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}
