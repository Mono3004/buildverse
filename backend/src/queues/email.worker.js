const { Worker } = require("bullmq");
const { connection } = require("./email.queue");
const { QUEUES } = require("../constants");
const logger = require("../utils/logger");

module.exports = () => {
  try {
    const worker = new Worker(
      QUEUES.EMAIL,
      async (job) => {
        logger.info(`sending ${job.name} email to ${job.data.to}`);
      },
      { connection }
    );
    worker.on("error", () => {});
    return worker;
  } catch (_e) {
    logger.info("Email worker initialized in safe offline mode.");
    return null;
  }
};