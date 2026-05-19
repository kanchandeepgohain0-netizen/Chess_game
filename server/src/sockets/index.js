const { Server } = require('socket.io');
const redis = require('../config/redis');   

const matchmakingHandler = require('./matchmakingHandler');
const gameHandler = require('./gameHandler');
const roomHandler = require('./roomHandler');
const computerHandler = require('./computerHandler');
const { endGame } = require('../services/endGame');

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true
    }
  });


  const reconnectTimers = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('register_user', async ({ userId }) => {
      if (!userId) return;

      // Map socket → user
      await redis.set(`socket:${userId}`, socket.id);
      socket.userId = userId;

      // If a reconnect fuse is running for this user, cancel it
      if (reconnectTimers.has(userId)) {
        clearTimeout(reconnectTimers.get(userId));
        reconnectTimers.delete(userId);
        console.log(`🔄 Player ${userId} reconnected — cancelling auto-resign fuse`);

        // Restore their active game state so the client can resync
        const keys = await redis.keys('game:*');
        for (const key of keys) {
          const state = await redis.hgetall(key);
          if (
            state.status === 'in-progress' &&
            (state.whitePlayer === userId || state.blackPlayer === userId)
          ) {
            const gameId = key.replace('game:', '');
            // Re-join socket to the game room so they receive future events
            socket.join(gameId);
            // Emit the current game state back so the board resyncs
            socket.emit('player_reconnect', {
              gameId,
              fen: state.fen,
              turn: state.turn,
              whiteTime: parseInt(state.whiteTimeRemaining, 10),
              blackTime: parseInt(state.blackTimeRemaining, 10),
              moves: JSON.parse(state.moves || '[]')
            });
            // Notify opponent
            socket.to(gameId).emit('opponent_reconnected', { userId });
            break;
          }
        }

        await redis.del(`disconnect:${userId}`);
      }
    });

    matchmakingHandler(io, socket);
    gameHandler(io, socket);
    roomHandler(io, socket);
    computerHandler(io, socket);

    socket.on('disconnect', async () => {
      if (!socket.userId) return;
      const userId = socket.userId;

      await redis.zrem('matchmaking_queue', userId);
      await redis.del(`format:${userId}`);
      await redis.del(`socket:${userId}`);

      // Check if player is in an active game
      const keys = await redis.keys('game:*');
      let activeGameId = null;
      for (const key of keys) {
        const state = await redis.hgetall(key);
        if (
          state.status === 'in-progress' &&
          (state.whitePlayer === userId || state.blackPlayer === userId)
        ) {
          activeGameId = key.replace('game:', '');
          break;
        }
      }

      if (!activeGameId) return; // Not in a game — nothing to do

      console.log(`⚡ Player ${userId} disconnected from game ${activeGameId} — starting 60s fuse`);

      // Flag disconnected state in Redis so the reconnect handler can check it
      await redis.set(`disconnect:${userId}`, activeGameId, 'EX', 70);

      // Notify opponent
      io.to(activeGameId).emit('opponent_disconnected', { userId });

      // Start 60-second auto-resign fuse
      const timer = setTimeout(async () => {
        reconnectTimers.delete(userId);

        // Double-check game is still in progress before resigning
        const state = await redis.hgetall(`game:${activeGameId}`);
        if (!state || state.status !== 'in-progress') return;

        console.log(`⏱️ Auto-resign: ${userId} failed to reconnect in 60s`);
        const winner = state.whitePlayer === userId ? state.blackPlayer : state.whitePlayer;
        await endGame(io, activeGameId, 'resignation', winner);
        await redis.del(`disconnect:${userId}`);
      }, 60000); // 60 seconds

      reconnectTimers.set(userId, timer);
    });
  });

  return io;
}

module.exports = { initSocket };