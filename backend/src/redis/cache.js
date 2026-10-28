const { redis } = require("./client");

exports.get = async (key) => {
  if (!redis) return null;
  try {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (_e) {
    return null;
  }
};

exports.set = async (key, value, ttlSeconds = 300) => {
  if (!redis) return null;
  try {
    return await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (_e) {
    return null;
  }
};

exports.del = async (key) => {
  if (!redis) return null;
  try {
    return await redis.del(key);
  } catch (_e) {
    return null;
  }
};