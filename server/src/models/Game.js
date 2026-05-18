const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  whitePlayer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  blackPlayer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  winner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null 
  },
  
  format: { 
    type: String, 
    required: true,
    enum: ['classical', 'rapid', 'blitz']
  },
  
  status: { 
    type: String, 
    default: 'in-progress',
    enum: ['in-progress', 'checkmate', 'resignation', 'timeout', 'stalemate', 'draw-agreement', 'draw-repetition', 'draw-insufficient']
  },
  
  moves: [{ type: String }],
  currentFen: { type: String, default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' },
  
  whiteTimeRemaining: { type: Number, required: true },
  blackTimeRemaining: { type: Number, required: true },

  whiteEloChange: { type: Number, default: 0 },
  blackEloChange: { type: Number, default: 0 },

  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: false }

}, {
  timestamps: true
});

gameSchema.index({ whitePlayer: 1 });
gameSchema.index({ blackPlayer: 1 });
gameSchema.index({ status: 1 });
gameSchema.index({ winner: 1 });

module.exports = mongoose.model('Game', gameSchema);