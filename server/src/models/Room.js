const mongoose = require('mongoose');

function generateRoomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result; 
}

// Custom validator to ensure we don't exceed 4 spectators
function arrayLimit(val) {
  return val.length <= 4;
}

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true, default: generateRoomId },
  password: { type: String, required: true },
  format: { type: String, enum: ['classical', 'rapid', 'blitz'], default: 'rapid' },
  
  // The host of the room
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // These MUST be optional (not required) so a room can be created before the second player joins!
  whitePlayer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  blackPlayer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Array validation applied here
  spectators: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    validate: [arrayLimit, 'A room can only have a maximum of 4 spectators']
  }
}, {
  timestamps: true // Added this so rooms can auto-delete if they are too old!
});

module.exports = mongoose.model('Room', roomSchema);