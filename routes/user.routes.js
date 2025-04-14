import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  getProfile,
  updateProfile,
  followUser,
  unfollowUser
} from '../controllers/user.controller.js';

const router = Router();

// Protect all routes
router.use(protect);

router.get('/profile', getProfile);

router.put('/profile/update',
  [
    body('name').optional().trim().notEmpty(),
    body('bio').optional().trim(),
    body('profilePicture').optional().trim().isURL(),
    validate
  ],
  updateProfile
);

router.post('/follow',
  [
    body('userId').notEmpty().isMongoId(),
    validate
  ],
  followUser
);

router.post('/unfollow',
  [
    body('userId').notEmpty().isMongoId(),
    validate
  ],
  unfollowUser
);

export default router;
