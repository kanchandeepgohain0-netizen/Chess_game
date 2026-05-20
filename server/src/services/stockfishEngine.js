const Stockfish = require('stockfish');

function getBestMove(fen, depth = 12, elo = null) {
  console.log(`[Stockfish Engine] getBestMove started. FEN: "${fen}", Depth: ${depth}, Elo: ${elo}`);
  return new Promise((resolve, reject) => {
    let resolved = false;

    // Use single-lite engine: lightweight (~7MB), fast, and memory efficient for Render container constraints.
    console.log('[Stockfish Engine] Initializing lite-single WASM engine...');
    Stockfish('lite-single').then(engine => {
      console.log('[Stockfish Engine] Engine loaded. Setting up listener...');
      engine.listener = (line) => {
        console.log(`[Stockfish Engine stdout] ${line}`);
        line = line.trim();
        if (line.startsWith('bestmove')) {
          const move = line.split(' ')[1];
          if (!resolved) {
            resolved = true;
            console.log(`[Stockfish Engine] Found bestmove: ${move}`);
            if (move && move !== '(none)') {
              resolve(move);
            } else {
              reject(new Error('No legal move available'));
            }
          }
        }
      };

      console.log('[Stockfish Engine] Sending commands...');
      engine.sendCommand('uci');
      if (elo && elo >= 1320 && elo <= 3190) {
        console.log(`[Stockfish Engine] Setting strength UCI_Elo: ${elo}`);
        engine.sendCommand('setoption name UCI_LimitStrength value true');
        engine.sendCommand('setoption name UCI_Elo value ' + elo);
      }
      engine.sendCommand('isready');
      engine.sendCommand('position fen ' + fen);
      engine.sendCommand('go depth ' + Math.min(Math.max(depth, 1), 20));
    }).catch(err => {
      console.error('[Stockfish Engine] Initialization or run error:', err);
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.warn('[Stockfish Engine] 15 second timeout reached!');
        reject(new Error('Stockfish timeout'));
      }
    }, 15000);
  });
}

module.exports = { getBestMove };
