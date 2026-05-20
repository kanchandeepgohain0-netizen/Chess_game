async function getBestMove(fen, depth = 12, elo = null) {
  console.log(`[Stockfish Engine] getBestMove started. FEN: "${fen}", Depth: ${depth}, Elo: ${elo}`);
  
  // Map ELO to search depth to simulate player strength when using the API
  let apiDepth = depth;
  if (elo) {
    const numericElo = Number(elo);
    if (numericElo < 1000) {
      apiDepth = 3;
    } else if (numericElo < 1300) {
      apiDepth = 5;
    } else if (numericElo < 1600) {
      apiDepth = 8;
    } else if (numericElo < 1900) {
      apiDepth = 12;
    } else {
      apiDepth = 15;
    }
  }

  // Cap depth between 1 and 15 for stockfish.online API stability
  apiDepth = Math.min(Math.max(apiDepth, 1), 15);

  try {
    const url = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${apiDepth}`;
    console.log(`[Stockfish Engine] Querying online API: ${url}`);

    // Call online API with 6 second timeout using native fetch and AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.success && data.bestmove) {
        const parts = data.bestmove.split(' ');
        const move = parts[1]; // Extract the UCI move (e.g. "e2e4")
        if (move && move !== '(none)') {
          console.log(`[Stockfish Engine] Found bestmove from online API: ${move}`);
          return move;
        }
      }
    }
    console.warn('[Stockfish Engine] Online API response was not successful or missing bestmove');
  } catch (err) {
    console.error('[Stockfish Engine] Online API failed:', err.message);
  }

  // Fallback: If online API fails/times out, pick a random legal move to keep game running
  console.log('[Stockfish Engine] Using fallback legal move generator...');
  try {
    const { Chess } = require('chess.js');
    const chess = new Chess(fen);
    const moves = chess.moves({ verbose: true });
    
    if (moves.length > 0) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      const uci = randomMove.from + randomMove.to + (randomMove.promotion || '');
      console.log(`[Stockfish Engine] Safe fallback generated move: ${uci}`);
      return uci;
    }
  } catch (fallbackErr) {
    console.error('[Stockfish Engine] Fallback move generator failed:', fallbackErr.message);
  }

  throw new Error('No moves available (checkmate, draw, or invalid FEN)');
}

module.exports = { getBestMove };


