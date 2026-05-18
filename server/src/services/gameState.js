const {createClient} = require('../config/redis');


const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const createGame = async (gameId, playerWhiteId, playerBlackId) => {
    const gameState = {
        playerWhite: playerWhiteId,
        playerBlack: playerBlackId,
        fen: STARTING_FEN,
        turn: 'w',
        status: 'active'
    };
    await redis.hSet(`game:${gameId}`,gameState);
    await redis.expire(`game:${gameId}`,86400);
    return gameState;
};

const getGame = async(gameId) => {
    const state = await redis.hGetAll(`game:${gameId}`);
    if(Object.keys(state).length === 0) return null;
    return state;
};

const updateMove = async (gameId, newFen, nextTurn) => {
    await redis.hSet(`game:${gameId}`,{
        fen: newFen,
        turn: nextTurn
    });
};

const deleteGame = async (gameId) => {
    await redis.del(`game:${gameId}`);
};

module.exports = { createGame, getGame, updateMove, deleteGame };
