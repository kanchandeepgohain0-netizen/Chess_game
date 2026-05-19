const { v4: uuidv4 } = require('uuid');
const { initGameState } = require('../services/gameState');
const Room = require('../models/Room');

module.exports = (io, socket) => {
  socket.on('join_room', async ({ roomId, userId }) => {   
    socket.join(roomId);
    socket.to(roomId).emit('room_member_joined', { userId });  

    const room = await Room.findOne({ roomId });  

    if (room && room.whitePlayer && room.blackPlayer) {
      const gameId = uuidv4();
      await initGameState(gameId, room.whitePlayer.toString(), room.blackPlayer.toString(), room.format || 'rapid');
      io.to(roomId).emit('room_ready', { gameId, white: room.whitePlayer, black: room.blackPlayer, format: room.format || 'rapid' });
    }
  });

  socket.on('spectate_game', ({ gameId }) => {
    socket.join(gameId);
  });
};