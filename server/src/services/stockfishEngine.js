const https = require('https');

function getBestMove(fen, depth = 12, elo = null) {
  console.log(`[Stockfish Engine] getBestMove started. FEN: "${fen}", Depth: ${depth}, Elo: ${elo}`);
  
  return new Promise((resolve, reject) => {
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
    apiDepth = Math.min(Math.max(apiDepth, 1), 15);

    const url = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${apiDepth}`;
    console.log(`[Stockfish Engine] Querying online API via https module: ${url}`);

    let resolved = false;

    // Set up a fallback function to prevent duplicate resolves/rejects
    const triggerFallback = () => {
      if (resolved) return;
      resolved = true;
      console.log('[Stockfish Engine] Using fallback legal move generator...');
      try {
        const { Chess } = require('chess.js');
        const chess = new Chess(fen);
        const moves = chess.moves({ verbose: true });
        
        if (moves.length > 0) {
          const randomMove = moves[Math.floor(Math.random() * moves.length)];
          const uci = randomMove.from + randomMove.to + (randomMove.promotion || '');
          console.log(`[Stockfish Engine] Safe fallback generated move: ${uci}`);
          resolve(uci);
          return;
        }
      } catch (fallbackErr) {
        console.error('[Stockfish Engine] Fallback move generator failed:', fallbackErr.message);
      }
      reject(new Error('No moves available (checkmate, draw, or invalid FEN)'));
    };

    // Set a 6-second timeout
    const timeoutId = setTimeout(() => {
      console.warn('[Stockfish Engine] API request timed out after 6s');
      req.destroy();
      triggerFallback();
    }, 6000);

    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        clearTimeout(timeoutId);
        if (resolved) return;

        try {
          if (res.statusCode === 200) {
            const parsed = JSON.parse(data);
            if (parsed && parsed.success && parsed.bestmove) {
              const parts = parsed.bestmove.split(' ');
              const move = parts[1]; // UCI move
              if (move && move !== '(none)') {
                console.log(`[Stockfish Engine] Found bestmove from online API: ${move}`);
                resolved = true;
                resolve(move);
                return;
              }
            }
          }
          console.warn(`[Stockfish Engine] API responded with code ${res.statusCode} or invalid body`);
        } catch (err) {
          console.error('[Stockfish Engine] Failed to parse API JSON response:', err.message);
        }
        triggerFallback();
      });
    });

    req.on('error', (err) => {
      clearTimeout(timeoutId);
      console.error('[Stockfish Engine] https request error:', err.message);
      triggerFallback();
    });
  });
}

module.exports = { getBestMove };



