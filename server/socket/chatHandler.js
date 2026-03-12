import Message from '../models/Message.js';

export const setupChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join task chat room
    socket.on('join-task', async (data) => {
      const { taskId, userId } = data;
      const room = `task-${taskId}`;

      socket.join(room);
      console.log(`User ${userId} joined room ${room}`);

      // Notify others
      socket.to(room).emit('user-joined', {
        message: `User joined the chat`,
        userId
      });
    });

    // Send message
    socket.on('send-message', async (data) => {
      try {
        const { taskId, senderId, receiverId, text, attachments } = data;

        // Save message to database
        const message = new Message({
          task: taskId,
          sender: senderId,
          receiver: receiverId,
          text,
          attachments: attachments || []
        });

        await message.save();

        const room = `task-${taskId}`;

        // Emit message to room
        io.to(room).emit('message-received', {
          id: message._id,
          text: message.text,
          sender: senderId,
          receiver: receiverId,
          attachments: message.attachments,
          createdAt: message.createdAt
        });

        console.log(`Message sent in room ${room}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Load chat history
    socket.on('load-history', async (data) => {
      try {
        const { taskId } = data;

        const messages = await Message.find({ task: taskId })
          .select('sender receiver text attachments createdAt')
          .sort({ createdAt: 1 });

        socket.emit('chat-history', { messages });
      } catch (error) {
        socket.emit('error', { message: 'Failed to load chat history' });
      }
    });

    // Mark message as read
    socket.on('message-read', async (data) => {
      try {
        const { messageId, taskId } = data;

        await Message.findByIdAndUpdate(messageId, { read: true });

        const room = `task-${taskId}`;
        io.to(room).emit('message-read-status', { messageId });
      } catch (error) {
        socket.emit('error', { message: 'Failed to update read status' });
      }
    });

    // Leave task room
    socket.on('leave-task', (data) => {
      const { taskId, userId } = data;
      const room = `task-${taskId}`;

      socket.leave(room);
      console.log(`User ${userId} left room ${room}`);

      socket.to(room).emit('user-left', {
        message: `User left the chat`,
        userId
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
