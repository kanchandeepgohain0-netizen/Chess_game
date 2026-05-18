const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, {
    retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
    }
});

redis.on('connect', () => {
    console.log('Redis Connected');
});

redis.on('error', (error) => {
    console.error('Redis Error:', error);
});

module.exports = redis;