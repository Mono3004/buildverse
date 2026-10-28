const { SOCKET_EVENTS } = require("../constants");

module.exports = function registerChatHandlers(io, socket) {
  socket.on(SOCKET_EVENTS.JOIN_ROOM, (roomId) => socket.join(roomId));
  socket.on(SOCKET_EVENTS.MESSAGE, ({ roomId, body }) => {
    io.to(roomId).emit(SOCKET_EVENTS.MESSAGE, { body, at: Date.now(), from: socket.id });
  });
};