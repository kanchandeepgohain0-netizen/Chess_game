const Game = require('../models/Game');
const User = require('../models/User');
const Room = require('../models/Room');
const redis = require('../config/redis');
const { getGameState, deleteGameState } = require('./gameState');
const { calculateElo } = require('./eloCalculator');

async function endGame(io, gameId, status, winnerId) {
  try {
    const state = await getGameState(gameId);
    if (!state) return;
    await redis.hset(`game:${gameId}`, 'status', 'ended');


    const botData = await redis.hgetall(`bot:${gameId}`);
    const isBotGame = botData && botData.active === 'true';

    const whiteUser = state.whitePlayer.startsWith('bot_') ? null : await User.findById(state.whitePlayer);
    const blackUser = state.blackPlayer.startsWith('bot_') ? null : await User.findById(state.blackPlayer);


    const humanUser = isBotGame ? (whiteUser || blackUser) : null;

    if (!isBotGame && (!whiteUser || !blackUser)) return;
    if (isBotGame && !humanUser) return;

    let wChange = 0, bChange = 0;
    if (!isBotGame) {
      if (['checkmate', 'timeout', 'resignation'].includes(status)) {
        const whiteWon = winnerId === state.whitePlayer;
        const r = calculateElo(whiteUser.elo, blackUser.elo, whiteWon ? 1 : 0);
        wChange = r.changeA;
        bChange = r.changeB;
      } else {
        const r = calculateElo(whiteUser.elo, blackUser.elo, 0.5);
        wChange = r.changeA;
        bChange = r.changeB;
      }
    } else {

      const botElo = parseInt(botData.botElo, 10) || 1200;
      const humanIsWhite = state.whitePlayer !== botData.botId;
      const humanElo = humanUser.elo;
      const humanWon = winnerId && winnerId !== botData.botId;
      const scoreForHuman = !winnerId ? 0.5 : humanWon ? 1 : 0;
      const r = calculateElo(humanElo, botElo, scoreForHuman);
      if (humanIsWhite) { wChange = r.changeA; } else { bChange = r.changeA; }
    }

    const game = await Game.create({
      whitePlayer: isBotGame
        ? (state.whitePlayer === botData.botId ? state.blackPlayer : state.whitePlayer)
        : state.whitePlayer,
      blackPlayer: isBotGame
        ? (state.blackPlayer === botData.botId ? state.whitePlayer : state.blackPlayer)
        : state.blackPlayer,
      format: state.format,
      status: status,
      moves: state.moves,
      currentFen: state.fen,
      whiteTimeRemaining: state.whiteTimeRemaining,
      blackTimeRemaining: state.blackTimeRemaining,
      whiteEloChange: wChange,
      blackEloChange: bChange
    });

    if (!isBotGame) {

        await User.findByIdAndUpdate(state.whitePlayer, {
        $inc: { elo: wChange, wins: winnerId === state.whitePlayer ? 1 : 0, losses: winnerId === state.blackPlayer ? 1 : 0, draws: !winnerId ? 1 : 0 },
        $push: { matchHistory: game._id }
      });
      await User.findByIdAndUpdate(state.blackPlayer, {
        $inc: { elo: bChange, wins: winnerId === state.blackPlayer ? 1 : 0, losses: winnerId === state.whitePlayer ? 1 : 0, draws: !winnerId ? 1 : 0 },
        $push: { matchHistory: game._id }
      });
    } else {

      const humanIsWhite = state.whitePlayer !== botData.botId;
      const humanId = humanIsWhite ? state.whitePlayer : state.blackPlayer;
      const humanEloChange = humanIsWhite ? wChange : bChange;
      const humanWon = winnerId && winnerId !== botData.botId;
      await User.findByIdAndUpdate(humanId, {
        $inc: {
          elo: humanEloChange,
          wins: humanWon ? 1 : 0,
          losses: !winnerId ? 0 : humanWon ? 0 : 1,
          draws: !winnerId ? 1 : 0
        },
        $push: { matchHistory: game._id }
      });
    }

    io.to(gameId).emit('game_over', { status, winner: winnerId, wEloChange: wChange, bEloChange: bChange, gameId });
    await deleteGameState(gameId);
    await redis.del(`bot:${gameId}`);

    // Clean up custom room if one exists for these players
    if (!isBotGame) {
      await Room.findOneAndDelete({
        $or: [
          { whitePlayer: state.whitePlayer, blackPlayer: state.blackPlayer },
          { whitePlayer: state.blackPlayer, blackPlayer: state.whitePlayer }
        ]
      }).catch(() => {}); // non-fatal
    }
  } catch (err) {
    console.error('endGame error:', err);
  }
}

module.exports = { endGame };