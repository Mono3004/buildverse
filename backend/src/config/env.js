const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/buildverse",
  KAFKA_BROKER: process.env.KAFKA_BROKER || "localhost:9092",
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "super-secret-buildverse-jwt-token-key",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
};