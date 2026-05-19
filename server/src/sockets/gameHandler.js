const { Chess } = require('chess.js');
const { getGameState, updateGameState } = require('../services/gameState');
const { endGame } = require('../services/endGame');
const { getBestMove } = require('../services/stockfishEngine');
const redis = require('../config/redis');

async function makeBotMove(io, gameId, fen, botId) {
  try {
    const state = await getGameState(gameId);
    if (!state || state.status !== 'in-progress') return;

    const botData = await redis.hgetall(`bot:${gameId}`);
    const botElo = botData ? parseInt(botData.botElo, 10) : null;

    const uci = await getBestMove(fen, 12, botElo);
    const from = uci.slice(0, 2);
    const to   = uci.slice(2, 4);
    const promotion = uci.length > 4 ? uci[4] : undefined;

    const chess = new Chess(fen);
    let result;
    try {
      result = chess.move({ from, to, promotion });
    } catch {
      result = null;
    }
    if (!result) {
      console.error(`Bot illegal move ${uci} for fen ${fen}`);
      return;
    }

    const now = Date.now();
    const elapsed = now - state.lastMoveTimestamp;
    const isWhiteTurn = state.turn === 'w';
    let wTime = state.whiteTimeRemaining;
    let bTime = state.blackTimeRemaining;
    if (isWhiteTurn) wTime = Math.max(0, wTime - elapsed);
    else              bTime = Math.max(0, bTime - elapsed);

    await updateGameState(gameId, {
      fen: chess.fen(),
      turn: chess.turn(),
      whiteTimeRemaining: wTime,
      blackTimeRemaining: bTime,
      lastMoveTimestamp: now,
      moves: [...state.moves, result.san]
    });

    io.to(gameId).emit('board_update', {
      fen: chess.fen(),
      turn: chess.turn(),
      whiteTime: wTime,
      blackTime: bTime,
      lastMove: result
    });


    if (chess.isCheckmate()) {
      const winner = isWhiteTurn ? state.whitePlayer : state.blackPlayer;
      await endGame(io, gameId, 'checkmate', winner);
    } else if (chess.isStalemate()) {
      await endGame(io, gameId, 'stalemate', null);
    } else if (chess.isInsufficientMaterial()) {
      await endGame(io, gameId, 'draw-insufficient', null);
    } else if (chess.isThreefoldRepetition()) {
      await endGame(io, gameId, 'draw-repetition', null);
    }

  } catch (err) {
    console.error('makeBotMove error:', err.message);

    const state = await getGameState(gameId).catch(() => null);
    if (state) {
      const winner = state.whitePlayer === botId ? state.blackPlayer : state.whitePlayer;
      await endGame(io, gameId, 'resignation', winner).catch(() => {});
    }
  }
}


module.exports = (io, socket) => {

  socket.on('join_game', ({ gameId }) => {
    socket.join(gameId);
  });

  socket.on('make_move', async ({ gameId, move, userId }) => {
    try {
      const state = await getGameState(gameId);
      if (!state || state.status !== 'in-progress') return;

      const isWhiteTurn = state.turn === 'w';
      const isWhite = userId === state.whitePlayer;
      const isBlack = userId === state.blackPlayer;

      console.log(`make_move event: userId=${userId}, move=${JSON.stringify(move)}, turn=${state.turn}, white=${state.whitePlayer}, black=${state.blackPlayer}`);

      if (isWhiteTurn && !isWhite) { console.log('Rejected: Not white turn'); return; }
      if (!isWhiteTurn && !isBlack) { console.log('Rejected: Not black turn'); return; }

      const chess = new Chess(state.fen);
      let result;
      try {
        result = chess.move(move);
      } catch {
        result = null;
      }
      if (!result) {
        console.log(`Rejected: Illegal move on server: ${JSON.stringify(move)}`);
        socket.emit('illegal_move', { move });
        return;
      }
      console.log(`Server applied move: ${result.san}, FEN=${chess.fen()}`);

      const now = Date.now();
      const elapsed = now - state.lastMoveTimestamp;
      let wTime = state.whiteTimeRemaining;
      let bTime = state.blackTimeRemaining;

      if (isWhiteTurn) wTime = Math.max(0, wTime - elapsed);
      else             bTime = Math.max(0, bTime - elapsed);

      if (wTime <= 0) { await endGame(io, gameId, 'timeout', state.blackPlayer); return; }
      if (bTime <= 0) { await endGame(io, gameId, 'timeout', state.whitePlayer); return; }

      await updateGameState(gameId, {
        fen: chess.fen(),
        turn: chess.turn(),
        whiteTimeRemaining: wTime,
        blackTimeRemaining: bTime,
        lastMoveTimestamp: now,
        moves: [...state.moves, result.san]
      });

      io.to(gameId).emit('board_update', {
        fen: chess.fen(),
        turn: chess.turn(),
        whiteTime: wTime,
        blackTime: bTime,
        lastMove: result
      });

      if (chess.isCheckmate()) {
        const winner = isWhiteTurn ? state.whitePlayer : state.blackPlayer;
        await endGame(io, gameId, 'checkmate', winner);
        return;
      }
      if (chess.isStalemate())           { await endGame(io, gameId, 'stalemate', null); return; }
      if (chess.isInsufficientMaterial()) { await endGame(io, gameId, 'draw-insufficient', null); return; }
      if (chess.isThreefoldRepetition())  { await endGame(io, gameId, 'draw-repetition', null); return; }


      const botData = await redis.hgetall(`bot:${gameId}`);
      if (botData && botData.active === 'true') {
        const isBotTurn =
          (botData.botColor === 'white' && chess.turn() === 'w') ||
          (botData.botColor === 'black' && chess.turn() === 'b');

        if (isBotTurn) {

          const delay = 800 + Math.random() * 1200;
          setTimeout(() => makeBotMove(io, gameId, chess.fen(), botData.botId), delay);
        }
      }

    } catch (err) {
      console.error('make_move error:', err);
      socket.emit('error_event', { message: 'Move failed' });
    }
  });

  socket.on('resign', async ({ gameId, userId }) => {
    const state = await getGameState(gameId);
    if (!state || state.status !== 'in-progress') return;
    const winner = userId === state.whitePlayer ? state.blackPlayer : state.whitePlayer;
    await endGame(io, gameId, 'resignation', winner);
  });

  socket.on('offer_draw', async ({ gameId, userId }) => {
    const state = await getGameState(gameId);
    if (!state || state.status !== 'in-progress') return;


    const botData = await redis.hgetall(`bot:${gameId}`);
    if (botData && botData.active === 'true') {
      socket.emit('error_event', { message: 'Cannot offer a draw to the AI opponent.' });
      return;
    }

    socket.to(gameId).emit('draw_offered', { by: userId });
  });

  socket.on('draw_response', async ({ gameId, accepted }) => {
    if (accepted) await endGame(io, gameId, 'draw-agreement', null);
    else io.to(gameId).emit('draw_declined');
  });
};