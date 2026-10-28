const logger = require("../utils/logger");

const ONE_DAY = 24 * 60 * 60 * 1000;

module.exports = function digestJob() {
  setInterval(() => logger.info("running daily digest job"), ONE_DAY).unref();
};