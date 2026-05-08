const mongoose = require('mongoose');

function generateFriendCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

const userSchema = new mongoose.Schema({
  // Basic Info
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  
  // 1. The custom friend ID
  friendCode: { type: String,
    unique: true,
    default: generateFriendCode
  },

  // Player Stats
  elo: { type: Number, default: 1200 }, 
  
  // 2. Win/Loss/Draw tracking
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },

  // Match History (Array of IDs pointing to the Game model)
  matchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game' }]
  
}, {
  timestamps: true // Automatically adds 'createdAt' and 'updatedAt' fields!
});

module.exports = mongoose.model('User', userSchema);