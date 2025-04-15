import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      throw new Error('Authentication failed: No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error('Authentication failed: User not found');
    }

    socket.user = user;
    socket.join(`user_${user._id}`); // Join user's personal room
    next();
  } catch (error) {
    next(new Error('Authentication failed: ' + error.message));
  }
};
