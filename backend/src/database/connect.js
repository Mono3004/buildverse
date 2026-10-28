const mongoose = require("mongoose");
const env = require("../config/env");
const logger = require("../utils/logger");

module.exports = async function connectDatabase() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    logger.info("MongoDB connected successfully at " + env.MONGO_URI);
  } catch (err) {
    logger.warn("MongoDB connection notice (Server running in standalone mode): " + err.message);
  }
};