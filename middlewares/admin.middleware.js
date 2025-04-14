import { AuthorizationError } from '../utils/errors.js';

export const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }
    next();
  } catch (error) {
    next(error);
  }
};
