"use strict";

const Redis = require('ioredis');

module.exports = function () {
  const redisHost = process.env.REDIS_MASTER_SERVICE_HOST || process.env.REDIS_SERVICE_HOST;
  const redisPort = process.env.REDIS_MASTER_SERVICE_PORT || process.env.REDIS_SERVICE_PORT;
  const redisSentinelPort = process.env.REDIS_SERVICE_PORT_REDIS_SENTINEL;
  const redisMasterName = 'mymaster';
  let redis = null;

  if (process.env.REDIS_SERVICE_PORT_REDIS_SENTINEL) {
    console.log(`Using redis sentinel ${redisHost}:${redisSentinelPort}`);
    redis = new Redis({
      sentinels: [{
        host: redisHost,
        port: redisSentinelPort
      }],
      name: redisMasterName
    });
  } else if (redisHost && redisPort) {
    console.log(`Using default redis ${redisHost}:${redisPort}`);
    redis = new Redis(redisHost, redisPort);
  }

  return redis;
};