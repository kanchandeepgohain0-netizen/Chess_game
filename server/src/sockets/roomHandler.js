const {v4 : uuidv4} = require('uuid');
const {initGameState} = require('../services/gameState');
const Room = require('../models/Room');

module.exports = (io, socket) => {
    socket.on('join room', async ({roomId, userId}) => {
        socket.join(roomId);

    socket.to(roomId).emit('member joined', {userId});

    const room = await room.findOne({roomId});
    
    if(room && room.whitePlayer && room.blackPlayer) {
        const gameId = uuidv4();

        await initGameState(
            gameId,
            room.whitePlayer.toString(),
            room.blackPlayer.toString(),
            'blitz'
        );

        io.to(roomId).emit('room ready', {
            gameId,
            white : room.whitePlayer,
            black: room.blackPlayer
        });

    }
    });

    socket.on('spectate_game', ({gameId}) => {
        socket.join(gameId);

    });
};

