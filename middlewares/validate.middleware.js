import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array()[0].msg);
  }
  next();
};
