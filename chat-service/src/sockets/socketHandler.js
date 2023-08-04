const Message = require('../models/Message');  // Replace with the path to your Message model

module.exports = function handleSocketConnection(socket) {
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });

  socket.on('message', async (roomId, messageData) => {
    const message = new Message(messageData);
    await message.save();

    socket.to(roomId).emit('message', message);
  });

  socket.on('error', (error) => {
    console.error(error);
  });
};
