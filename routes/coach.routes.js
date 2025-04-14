import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  getCoaches,
  getCoachById,
  bookSession,
  getSessions
} from '../controllers/coach.controller.js';

const router = Router();

// Public routes
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('specialization').optional().isIn([
      'weight_training',
      'cardio',
      'yoga',
      'nutrition',
      'crossfit',
      'powerlifting',
      'bodybuilding',
      'rehabilitation'
    ]),
    query('minRate').optional().isFloat({ min: 0 }),
    query('maxRate').optional().isFloat({ min: 0 }),
    query('sortBy').optional().isIn(['rating', 'hourlyRate', 'experience']),
    query('order').optional().isIn(['asc', 'desc']),
    validate
  ],
  getCoaches
);

router.get('/:id',
  [
    param('id').isMongoId(),
    validate
  ],
  getCoachById
);

// Protected routes
router.use(protect);

router.post('/book',
  [
    body('coachId').isMongoId(),
    body('date').isISO8601().toDate(),
    body('startTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
    body('endTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
    body('sessionGoals').trim().notEmpty(),
    body('type').optional().isIn(['one_on_one', 'group']),
    validate
  ],
  bookSession
);

router.get('/sessions',
  [
    query('status').optional().isIn(['scheduled', 'completed', 'cancelled', 'no_show']),
    query('upcoming').optional().isBoolean(),
    validate
  ],
  getSessions
);

export default router;
