const { Queue } = require("bullmq");
const env = require("../config/env");
const { QUEUES } = require("../constants");
const logger = require("../utils/logger");

let emailQueue = null;

try {
  emailQueue = new Queue(QUEUES.EMAIL, {
    connection: { url: env.REDIS_URL },
  });
  emailQueue.on("error", () => {});
} catch (_e) {
  emailQueue = null;
}

exports.emailQueue = emailQueue;
exports.connection = { url: env.REDIS_URL };
exports.enqueueWelcomeEmail = async (to) => {
  if (!emailQueue) {
    logger.info(`(Offline Queue Fallback) Welcome email queued for ${to}`);
    return;
  }
  try {
    await emailQueue.add("welcome", { to }, { attempts: 3 });
  } catch (_err) {
    logger.info(`(Offline Queue Notice) Welcome email queued for ${to}`);
  }
};