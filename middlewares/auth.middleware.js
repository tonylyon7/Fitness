import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../utils/errors.js';
import User from '../models/user.model.js';

export const protect = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await User.findById(decoded.userId)
      .select('-password -refreshToken');
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(new AuthenticationError('Invalid token'));
  }
};
