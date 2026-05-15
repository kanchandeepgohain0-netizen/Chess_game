const { v4: uuidv4 } = require('uuid');     
const { addToQueue, findOpponent, removeFromQueue } = require('../services/matchmaking');
const { initGameState } = require('../services/gameState');

module.exports = (io, socket) => {

  socket.on('find_match', async ({ userId, elo, format }) => {
    try {
      await addToQueue(userId, elo, format);

      const opponent = await findOpponent(userId, elo);
      
      if (!opponent) {
        socket.emit('waiting_for_match');
        return;  
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

    } catch (err) {
      console.error('find_match error:', err);
      socket.emit('error_event', { message: 'Matchmaking failed' });
    }
  });


  socket.on('cancel_match', async ({ userId }) => {
    await removeFromQueue(userId);
    socket.emit('match_cancelled');
  });
};