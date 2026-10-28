const bus = require("./emitter");
const logger = require("../utils/logger");
const { TOPICS } = require("../constants");

bus.on(TOPICS.USER_REGISTERED, (payload) => logger.info("user registered", payload));

module.exports = bus;