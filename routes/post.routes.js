import { Router } from 'express';
import { body, query } from 'express-validator';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  getFeed,
  createPost,
  likePost,
  commentOnPost
} from '../controllers/post.controller.js';

const router = Router();

// Protect all routes
router.use(protect);

router.get('/feed',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    validate
  ],
  getFeed
);

router.post('/create',
  [
    body('content').trim().notEmpty(),
    body('media').optional().isArray(),
    body('media.*').optional().isURL(),
    body('type').optional().isIn(['workout', 'progress', 'general']),
    body('workoutDetails').optional().isObject(),
    body('workoutDetails.exercises').optional().isArray(),
    body('workoutDetails.duration').optional().isInt({ min: 1 }),
    body('workoutDetails.caloriesBurned').optional().isInt({ min: 0 }),
    validate
  ],
  createPost
);

router.post('/like',
  [
    body('postId').notEmpty().isMongoId(),
    validate
  ],
  likePost
);

router.post('/comment',
  [
    body('postId').notEmpty().isMongoId(),
    body('content').trim().notEmpty(),
    validate
  ],
  commentOnPost
);

export default router;
