const redis = require('ioredis')

const redis = new  Redis(
    process.env.REDIS_HOST
);

redis.on('connect', ()  => {
    console.log('Redis Connected')
}
);

redis.on('error',  (error) => {
    console.log('Redis Error:', error);

} 
);

module.exports = redis;

