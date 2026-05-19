const redis = require('../config/redis');
const { v4: uuidv4 } = require('uuid');

const QUEUE = 'matchmaking_queue';
const BOT_PREFIX = 'bot_';

async function addToQueue(userId, elo, format) {
  await redis.set(`format:${userId}`, format);
  await redis.zadd(QUEUE, elo, userId);
  await redis.set(`queue_time:${userId}`, Date.now());
}

async function findOpponent(userId, elo) {
  const candidates = await redis.zrangebyscore(QUEUE, elo - 50, elo + 50);

  const opponent = candidates.find(id => id !== userId && !id.startsWith(BOT_PREFIX));
  if (!opponent) return null;
  const myFormat = await redis.get(`format:${userId}`);
  const theirFormat = await redis.get(`format:${opponent}`);
  return myFormat === theirFormat ? opponent : null;
}

async function findBotOpponent(elo) {
  const botElo = Math.max(400, elo + Math.floor(Math.random() * 21) - 10);
  const botId = `${BOT_PREFIX}${uuidv4()}`;
  return { botId, botElo };
}

async function removeFromQueue(userId) {
  await redis.zrem(QUEUE, userId);
  await redis.del(`format:${userId}`);
  await redis.del(`queue_time:${userId}`);
}

async function getQueueTime(userId) {
  const time = await redis.get(`queue_time:${userId}`);
  return time ? parseInt(time, 10) : null;
}

module.exports = { addToQueue, findOpponent, findBotOpponent, removeFromQueue, getQueueTime, BOT_PREFIX };