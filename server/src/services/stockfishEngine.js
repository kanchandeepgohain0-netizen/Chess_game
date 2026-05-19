
const { spawn } = require('child_process');
const path = require('path');


function getBestMove(fen, depth = 12, elo = null) {
  return new Promise((resolve, reject) => {
    let resolved = false;


    const script = `
      const Stockfish = require('stockfish');
      Stockfish().then(engine => {
        engine.sendCommand('uci');
        ${elo && elo >= 1320 && elo <= 3190 ? `
        engine.sendCommand('setoption name UCI_LimitStrength value true');
        engine.sendCommand('setoption name UCI_Elo value ${elo}');
        ` : ''}
        engine.sendCommand('isready');
        engine.sendCommand('position fen ${fen}');
        engine.sendCommand('go depth ${Math.min(Math.max(depth, 1), 20)}');
      }).catch(err => {
        console.error(err);
        process.exit(1);
      });
    `;

 
    const child = spawn('node', ['-e', script], {
      cwd: path.resolve(__dirname, '../../') // Points to chess_game/server where node_modules is
    });

    child.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (let line of lines) {
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
            child.kill();
          }
        }
      }
    });

    child.stderr.on('data', (err) => {
      console.error('[Stockfish Worker Err]', err.toString());
    });

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        reject(new Error('Stockfish timeout'));
        child.kill();
      }
    }, 15000);

    child.on('close', (code) => {
      if (!resolved) {
        resolved = true;
        reject(new Error(`Stockfish process exited with code ${code}`));
      }
      clearTimeout(timeout);
    });
  });
}

module.exports = { getBestMove };
