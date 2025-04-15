import { Server } from 'socket.io';
import { socketAuth } from '../middleware/socket.middleware.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // In production, replace with your frontend URL
      methods: ["GET", "POST"]
    }
  });

  // Use authentication middleware
  io.use(socketAuth);

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user.name);

    // Join a chat room
    socket.on('join_chat', (chatId) => {
      socket.join(`chat_${chatId}`);
      console.log(`User ${socket.user.name} joined chat: ${chatId}`);

      // Notify others in the chat
      socket.to(`chat_${chatId}`).emit('user_joined', {
        userId: socket.user._id,
        name: socket.user.name
      });
    });

    // Leave a chat room
    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
      console.log(`User ${socket.user.name} left chat: ${chatId}`);

      // Notify others in the chat
      socket.to(`chat_${chatId}`).emit('user_left', {
        userId: socket.user._id,
        name: socket.user.name
      });
    });

    // Handle typing status
    socket.on('typing_start', (chatId) => {
      socket.to(`chat_${chatId}`).emit('user_typing', {
        userId: socket.user._id,
        name: socket.user.name
      });
    });

    socket.on('typing_end', (chatId) => {
      socket.to(`chat_${chatId}`).emit('user_stopped_typing', {
        userId: socket.user._id,
        name: socket.user.name
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user.name);
      
      // Notify all rooms this user was in
      socket.rooms.forEach(room => {
        if (room.startsWith('chat_')) {
          io.to(room).emit('user_offline', {
            userId: socket.user._id,
            name: socket.user.name
          });
        }
      });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
