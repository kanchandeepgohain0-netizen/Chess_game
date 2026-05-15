const { Chess } = require('chess.js');    
const { getGameState, updateGameState } = require('../services/gameState');
const { endGame } = require('../services/endGame');

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
      
      if (isWhiteTurn && !isWhite) 
        return;   
      if (!isWhiteTurn && !isBlack) 
        return;  


      const chess = new Chess(state.fen);       
      const result = chess.move(move);          
      
      if (!result) {
        socket.emit('illegal_move', { move });  
      }

      const now = Date.now();
      const elapsed = now - state.lastMoveTimestamp;  
      
      let wTime = state.whiteTimeRemaining;
      let bTime = state.blackTimeRemaining;
      
      if (isWhiteTurn) {
        wTime = Math.max(0, wTime - elapsed);   
      } else {
        bTime = Math.max(0, bTime - elapsed);
      }

      if (wTime <= 0) {
        await endGame(io, gameId, 'timeout', state.blackPlayer);  
        return;
      }
      if (bTime <= 0) {
        await endGame(io, gameId, 'timeout', state.whitePlayer);
        return;
      }

      const moves = [...state.moves, result.san]; 

      await updateGameState(gameId, {
        fen: chess.fen(),              
        turn: chess.turn(),
        whiteTimeRemaining: wTime,
        blackTimeRemaining: bTime,
        lastMoveTimestamp: now,        
        moves: moves
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
      
      if (chess.isStalemate()) {
        await endGame(io, gameId, 'stalemate', null);  
        return;
      }
      
      if (chess.isInsufficientMaterial()) {
        await endGame(io, gameId, 'draw-insufficient', null);
        return;
      }
      
      if (chess.isThreefoldRepetition()) {
        await endGame(io, gameId, 'draw-repetition', null);
        return;
      }

    } catch (err) {
      console.error('make_move error:', err);
      socket.emit('error_event', { message: 'Move failed' });
    }
  });


  socket.on('resign', async ({ gameId, userId }) => {
    const state = await getGameState(gameId);
    if (!state || state.status !== 'in-progress') 
        return;
    


    const winner = userId === state.whitePlayer ? state.blackPlayer : state.whitePlayer;
    await endGame(io, gameId, 'resignation', winner);
  });

  socket.on('offer_draw', async ({ gameId, userId }) => {
    const state = await getGameState(gameId);
    if (!state || state.status !== 'in-progress') 
        return;
    
    socket.to(gameId).emit('draw_offered', { by: userId });
  });

  socket.on('draw_response', async ({ gameId, accepted }) => {
    if (accepted) {
      await endGame(io, gameId, 'draw-agreement', null);  
    } else {
      io.to(gameId).emit('draw_declined');  
    }
  });
};