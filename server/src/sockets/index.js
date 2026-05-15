const {Server, Socket} = require('socket.io');
const redis  = require('../config/redis')

const matchmakingHandler  = require('./matchmakingHandler');
const gameHandler = require('./gameHandler');
const roomHandler = require('./roomHandler');
const computerHandler = require('./computerHandler');

const {endGame} = require('../services/endGame');

function initSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('Socket Connected: ', socket.id);

        socket.on('register user', async (userId) => {
            if (!userId) {
                console.log('User ID is required for registration');
                return;
            }
            
            await redis.set(`socket:${userId}`, socket.id);
            socket.userId = userId;
        });

        matchmakingHandler(io, socket);
        gameHandler(io, socket);
        roomHandler(io, socket);
        computerHandler(io, socket);

        socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      
      if (socket.userId) {
        const keys = await redis.keys('game:*');
        for (const key of keys) {
          const state = await redis.hgetall(key);

          if (state.status === 'in-progress' && 
              (state.whitePlayer === socket.userId || state.blackPlayer === socket.userId)) {
            
            const gameId = key.replace('game:', '');
            const winner = state.whitePlayer === socket.userId 
              ? state.blackPlayer 
              : state.whitePlayer;
            
            await endGame(io, gameId, 'resignation', winner);

          }
        }
        await redis.zrem('matchmaking_queue', socket.userId);
        await redis.del(`format:${socket.userId}`);
        await redis.del(`socket:${socket.userId}`);

              }
    });
  });

  return io;
}

module.exports = { initSocket };

