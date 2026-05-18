const lastReq = new Map();

module.exports = (io, socket) => {
  socket.on('computer_move', async ({ fen, depth = 12 }) => {
    try {
      const now = Date.now();
      const last = lastReq.get(socket.id) || 0;
      
      if (now - last < 200) {
        socket.emit('error_event', { message: 'Too many requests' });
        return;
      }
      lastReq.set(socket.id, now);

      const url = new URL(process.env.STOCKFISH_API_URL);
      url.searchParams.set('fen', fen);
      url.searchParams.set('depth', String(Math.min(depth, 15)));

      const response = await fetch(url.toString(), {
        method: 'GET',
        signal: AbortSignal.timeout(8000) 
      });

      if (!response.ok) {
        throw new Error(`Stockfish API HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('Stockfish API returned failure');
      }

      socket.emit('computer_response', {
        bestMove: data.bestmove,
        continuation: data.continuation || ''
      });

    } catch (err) {
      console.error('computer_move error:', err.message);
      socket.emit('error_event', { message: 'Engine calculation failed' });
    }
  });
};