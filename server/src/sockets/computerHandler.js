const { getBestMove } = require('../services/stockfishEngine');

const lastReq = new Map();

module.exports = (io, socket) => {
  socket.on('computer_move', async ({ fen, depth = 12, elo = null }) => {
    console.log(`Received computer_move on socket ${socket.id}: fen=${fen}`);
    try {
      const now = Date.now();
      const last = lastReq.get(socket.id) || 0;

      if (now - last < 200) {
        socket.emit('error_event', { message: 'Too many requests' });
        return;
      }
      lastReq.set(socket.id, now);

      const bestMove = await getBestMove(fen, Math.min(depth, 18), elo);

      socket.emit('computer_response', {
        bestMove,
        continuation: ''
      });

    } catch (err) {
      console.error('computer_move error:', err.message);
      socket.emit('error_event', { message: 'Engine calculation failed' });
    }
  });
};