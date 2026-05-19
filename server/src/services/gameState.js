const redis = require('../config/redis');

const TIMES = { classical: 5400000, rapid: 300000, blitz: 180000 };

async function initGameState(gameId, whiteId, blackId, format = 'rapid') {
  const t = TIMES[format] || TIMES.rapid;
  const now = Date.now();
  await redis.hset(`game:${gameId}`, {
    whitePlayer: whiteId,
    blackPlayer: blackId,
    format: format,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    turn: 'w',
    whiteTimeRemaining: t,
    blackTimeRemaining: t,
    lastMoveTimestamp: now,
    moves: JSON.stringify([]),
    status: 'in-progress'
  });
}

async function getGameState(gameId) {
  const s = await redis.hgetall(`game:${gameId}`);
  if (!s || Object.keys(s).length === 0) return null;
  return {
    ...s,
    whiteTimeRemaining: parseInt(s.whiteTimeRemaining, 10),
    blackTimeRemaining: parseInt(s.blackTimeRemaining, 10),
    lastMoveTimestamp: parseInt(s.lastMoveTimestamp, 10),
    moves: JSON.parse(s.moves || '[]')
  };
}

async function updateGameState(gameId, updates) {
  if (updates.moves) updates.moves = JSON.stringify(updates.moves);
  await redis.hset(`game:${gameId}`, updates);
}

async function deleteGameState(gameId) {
  await redis.del(`game:${gameId}`);
}

module.exports = { initGameState, getGameState, updateGameState, deleteGameState, TIMES };