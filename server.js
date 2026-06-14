/**
 * Ash-Esh (اش-اش) — Socket.io Server
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const {
  createRoom,
  joinRoom,
  startGame,
  handleDraw,
  handleCaptureGround,
  handleSteal,
  handleDiscard,
  handleEndTurn,
  handleNextRound,
  getRoomStateForPlayer,
  handleDisconnect,
} = require('./game/rooms');

const app = express();
app.use(cors());
app.use(express.json());

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────

// Broadcast updated state to all players in a room
function broadcastState(code) {
  const room = getRoomStateForPlayer(code, null);
  if (!room) return;

  room.players.forEach(player => {
    const socket = io.sockets.sockets.get(player.socketId);
    if (socket) {
      socket.emit('state', getRoomStateForPlayer(code, player.socketId));
    }
  });
}

// ─── SOCKET EVENTS ────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`✅ Connected: ${socket.id}`);

  // ── Create Room ──
  socket.on('create_room', ({ playerName }, callback) => {
    try {
      const room = createRoom(socket.id, playerName || 'Host');
      socket.join(room.code);
      callback({ success: true, room: getRoomStateForPlayer(room.code, socket.id) });
    } catch (e) {
      callback({ success: false, error: e.message });
    }
  });

  // ── Join Room ──
  socket.on('join_room', ({ code, playerName }, callback) => {
    try {
      const result = joinRoom(code, socket.id, playerName || 'Player');
      if (!result.success) return callback(result);

      socket.join(code);
      broadcastState(code);
      callback({ success: true, room: getRoomStateForPlayer(code, socket.id) });
    } catch (e) {
      callback({ success: false, error: e.message });
    }
  });

  // ── Start Game ──
  socket.on('start_game', ({ code }, callback) => {
    try {
      const result = startGame(code, socket.id);
      if (!result.success) return callback(result);

      broadcastState(code);
      callback({ success: true });
    } catch (e) {
      callback({ success: false, error: e.message });
    }
  });

  // ── Draw Card ──
  socket.on('draw_card', ({ code }, callback) => {
    try {
      const result = handleDraw(code, socket.id);
      if (!result.success) return callback(result);

      broadcastState(code);
      callback({ success: true, card: result.card });
    } catch (e) {
      callback({ success: false, error: e.message });
    }
  });

  // ── Capture from Ground ──
  socket.on('capture_ground', ({ code, cardId, jokerRank }, callback) => {
    try {
      const result = handleCaptureGround(code, socket.id, cardId, jokerRank);
      if (!result.success) return callback(result);

      broadcastState(code);
      callback({ success: true, result });
    } catch (e) {
      callback({ success: false, error: e.message });
    }
  });

  // ── Steal from Player ──
  socket.on('steal', ({ code, targetId, cardId, jokerRank }, callback) => {
    try {
      const result = handleSteal(code, socket.id, targetId, cardId, jokerRank);
      if (!result.success) return callback(result);

      broadcastState(code);
      callback({ success: true, result });
    } catch (e) {
      callback({ success: false, error: e.message });
    }
  });

  // ── Discard Card ──
  socket.on('discard', ({ code, cardId }, callback) => {
    try {
      const result = handleDiscard(code, socket.id, cardId);
      if (!result.success) return callback(result);

      broadcastState(code);
      callback({ success: true, result });
    } catch (e) {
      callback({ success: false, error: e.message });
    }
  });

  // ── End Turn (after captures, player signals done) ──
  socket.on('end_turn', ({ code }, callback) => {
    try {
      const result = handleEndTurn(code, socket.id);
      if (!result.success) return callback(result);

      broadcastState(code);
      callback({ success: true, result });
    } catch (e) {
      callback({ success: false, error: e.message });
    }
  });

  // ── Start Next Round ──
  socket.on('next_round', ({ code, chosenFaceRank }, callback) => {
    try {
      const result = handleNextRound(code, socket.id, chosenFaceRank);
      if (!result.success) return callback(result);

      broadcastState(code);
      callback({ success: true });
    } catch (e) {
      callback({ success: false, error: e.message });
    }
  });

  // ── Get State ──
  socket.on('get_state', ({ code }, callback) => {
    const state = getRoomStateForPlayer(code, socket.id);
    callback({ success: !!state, room: state });
  });

  // ── Disconnect ──
  socket.on('disconnect', () => {
    console.log(`❌ Disconnected: ${socket.id}`);
    const result = handleDisconnect(socket.id);
    if (result) {
      io.to(result.code).emit('player_disconnected', {
        playerId: socket.id,
        playerName: result.player.name,
      });
    }
  });
});

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', game: 'Ash-Esh اش-اش' }));

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🃏 Ash-Esh server running on port ${PORT}`);
});
