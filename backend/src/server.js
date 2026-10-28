require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const env = require("./config/env");
const connectDatabase = require("./database/connect");
const autoSeedDatabase = require("./database/seed");
const routes = require("./routes");
const errorHandler = require("./middlewares/error.middleware");
const notFound = require("./middlewares/notFound.middleware");
const initSockets = require("./sockets");
const { connectRedis } = require("./redis/client");
const { connectKafka } = require("./kafka/client");
const startJobs = require("./jobs");
const logger = require("./utils/logger");
const mountDocs = require("./docs");

const app = express();

// HELMET WITH CROSS-ORIGIN RESOURCE SHARING ALLOWED
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ status: "ok", uptime: process.uptime() }));
mountDocs(app);
app.use("/api/v1", routes);
app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);

async function bootstrap() {
  await connectDatabase();
  await autoSeedDatabase();
  try { await connectRedis(); } catch (e) { logger.warn("Redis connection skipped"); }
  try { await connectKafka(); } catch (e) { logger.warn("Kafka connection skipped"); }
  initSockets(server);
  try { startJobs(); } catch (e) { logger.warn("Background jobs skipped"); }
  server.listen(env.PORT, () => logger.info(`BuildVerse API listening on :${env.PORT}`));
}

bootstrap().catch((err) => {
  logger.error("Failed to start server", err);
});

module.exports = app;