// server/src/services/matchmaking.js
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid'); // We will use this to generate unique Game IDs

// Create a new Redis connection specifically for our background services
const redis = new Redis(process.env.REDIS_URL);

const QUEUE_KEY = 'matchmaking_queue';
const ELO_FLEXIBILITY = 50; // Match players within 50 ELO points of each other

async function joinQueue(userId, elo) {
    // 1. Add the player to the queue, sorted by their ELO
    await redis.zadd(QUEUE_KEY, elo, userId);
    console.log(`Player ${userId} (ELO: ${elo}) joined the queue.`);

    // 2. Immediately check if there is a match waiting for them
    return await checkForMatch(userId, elo);
}

async function checkForMatch(userId, elo) {
    const minElo = elo - ELO_FLEXIBILITY;
    const maxElo = elo + ELO_FLEXIBILITY;

    // 3. Find everyone in the queue within the ELO range
    const potentialMatches = await redis.zrangebyscore(QUEUE_KEY, minElo, maxElo);

    // 4. Look for an opponent who is NOT the current user
    const opponentId = potentialMatches.find(id => id !== userId);

    if (opponentId) {
        console.log(`Match found! ${userId} vs ${opponentId}`);

        // 5. Remove BOTH players from the queue so they don't get matched again
        await redis.zrem(QUEUE_KEY, userId, opponentId);

        // 6. Generate a unique Room ID for their game
        const gameId = `game_${uuidv4()}`;
        return { matchFound: true, gameId, opponentId };
    }

    // If no one is available, they stay in the queue
    return { matchFound: false, message: "Waiting for opponent..." };
}

module.exports = { joinQueue };