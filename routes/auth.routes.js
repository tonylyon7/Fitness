import { Router } from 'express';
import { body } from 'express-validator';
import { signup, login, refresh } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

router.post('/signup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    validate
  ],
  signup
);

router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validate
  ],
  login
);

router.post('/refresh',
  [
    body('refreshToken').notEmpty(),
    validate
  ],
  refresh
);

export default router;
