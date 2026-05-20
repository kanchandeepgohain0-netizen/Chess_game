const { v4: uuidv4 } = require('uuid');
const redis = require('../config/redis');
const { addToQueue, findOpponent, findBotOpponent, removeFromQueue, getQueueTime } = require('../services/matchmaking');
const { initGameState } = require('../services/gameState');


const botTimers = new Map();

module.exports = (io, socket) => {

  socket.on('find_match', async ({ userId, elo, format }) => {
    try {
      await addToQueue(userId, elo, format);

      const opponent = await findOpponent(userId, elo);

      if (opponent) {

        if (botTimers.has(userId)) {
          clearTimeout(botTimers.get(userId));
          botTimers.delete(userId);
        }
        if (botTimers.has(opponent)) {
          clearTimeout(botTimers.get(opponent));
          botTimers.delete(opponent);
        }

        await removeFromQueue(userId);
        await removeFromQueue(opponent);

        const gameId = uuidv4();
        const isWhite = Math.random() > 0.5;
        const whiteId = isWhite ? userId : opponent;
        const blackId = isWhite ? opponent : userId;

        await initGameState(gameId, whiteId, blackId, format);

        const oppSocket = await redis.get(`socket:${opponent}`);

        socket.emit('match_found', {
          gameId,
          color: isWhite ? 'white' : 'black',
          opponent: { id: opponent },
          format
        });

        if (oppSocket) {
          io.to(oppSocket).emit('match_found', {
            gameId,
            color: isWhite ? 'black' : 'white',
            opponent: { id: userId },
            format
          });
        }
        return;
      }


      socket.emit('waiting_for_match');

      const timer = setTimeout(async () => {
        try {
          console.log(`[Matchmaking] Fallback timer fired for user: ${userId}`);
          const queueTime = await getQueueTime(userId);
          console.log(`[Matchmaking] Queue time check for ${userId}: ${queueTime}`);
          if (!queueTime) {
            console.log(`[Matchmaking] Aborting fallback for ${userId}: user not in queue or queue time missing`);
            return;
          }

          await removeFromQueue(userId);

          const { botId, botElo } = await findBotOpponent(elo);
          console.log(`[Matchmaking] Generated bot opponent: ${botId} with ELO ${botElo}`);

          const gameId = uuidv4();
          const isWhite = Math.random() > 0.5;
          const whiteId = isWhite ? userId : botId;
          const blackId = isWhite ? botId : userId;

          console.log(`[Matchmaking] Initializing bot game state for gameId: ${gameId}`);
          await initGameState(gameId, whiteId, blackId, format);

          await redis.hset(`bot:${gameId}`, {
            botId,
            botColor: isWhite ? 'black' : 'white',
            botElo: String(botElo),
            active: 'true'
          });

          console.log(`🤖 Pairing ${userId} with bot ${botId} (ELO ${botElo}) in game ${gameId}`);

          socket.emit('match_found', {
            gameId,
            color: isWhite ? 'white' : 'black',
            opponent: {
              id: botId,
              username: `AI Bot (${botElo})`,
              isBot: true
            },
            format
          });

          botTimers.delete(userId);
        } catch (err) {
          console.error('[Matchmaking] bot_fallback timer error:', err);
        }
      }, 30000); // 30 seconds

      botTimers.set(userId, timer);
      console.log(`[Matchmaking] Fallback bot timer registered for user ${userId} (30s)`);

    } catch (err) {
      console.error('find_match error:', err);
      socket.emit('error_event', { message: 'Matchmaking failed' });
    }
  });


  socket.on('cancel_match', async ({ userId }) => {
    if (botTimers.has(userId)) {
      clearTimeout(botTimers.get(userId));
      botTimers.delete(userId);
    }
    await removeFromQueue(userId);
    socket.emit('match_cancelled');
  });

  socket.on('disconnect', () => {
    if (socket.userId && botTimers.has(socket.userId)) {
      clearTimeout(botTimers.get(socket.userId));
      botTimers.delete(socket.userId);
    }
  });
};