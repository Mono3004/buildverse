const { Server } = require("socket.io");
const env = require("../config/env");
const registerChatHandlers = require("./chat.socket");
const logger = require("../utils/logger");

module.exports = function initSockets(httpServer) {
  const io = new Server(httpServer, { cors: { origin: env.CORS_ORIGIN } });

  io.on("connection", (socket) => {
    logger.info(`socket connected ${socket.id}`);
    registerChatHandlers(io, socket);
  });

  return io;
};