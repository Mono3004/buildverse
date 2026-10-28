let Redis;
try {
  Redis = require("ioredis");
} catch (_e) {
  Redis = null;
}

const env = require("../config/env");
const logger = require("../utils/logger");

let redis = null;

if (Redis && env.REDIS_URL) {
  try {
    redis = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      retryStrategy: () => null,
    });
    redis.on("error", () => {});
  } catch (_err) {
    redis = null;
  }
}

async function connectRedis() {
  if (!redis) {
    logger.info("Redis notice: running in safe memory mode (Redis server offline)");
    return;
  }
  try {
    await redis.connect();
    logger.info("Redis connected successfully");
  } catch (err) {
    logger.warn("Redis connection notice (offline mode active): " + err.message);
  }
}

module.exports = { redis, connectRedis };