const Stockfish = require('stockfish');

function getBestMove(fen, depth = 12, elo = null) {
  return new Promise((resolve, reject) => {
    let resolved = false;

    // Use single-lite engine: lightweight (~7MB), fast, and memory efficient for Render container constraints.
    Stockfish('lite-single').then(engine => {
      engine.listener = (line) => {
        line = line.trim();
        if (line.startsWith('bestmove')) {
          const move = line.split(' ')[1];
          if (!resolved) {
            resolved = true;
            if (move && move !== '(none)') {
              resolve(move);
            } else {
              reject(new Error('No legal move available'));
            }
          }
        }
      };

      engine.sendCommand('uci');
      if (elo && elo >= 1320 && elo <= 3190) {
        engine.sendCommand('setoption name UCI_LimitStrength value true');
        engine.sendCommand('setoption name UCI_Elo value ' + elo);
      }
      engine.sendCommand('isready');
      engine.sendCommand('position fen ' + fen);
      engine.sendCommand('go depth ' + Math.min(Math.max(depth, 1), 20));
    }).catch(err => {
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        reject(new Error('Stockfish timeout'));
      }
    }, 15000);
  });
}

module.exports = { getBestMove };
