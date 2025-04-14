import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { protect } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  getDashboardStats,
  getUsers,
  updateUserRole,
  deleteUser,
  manageContent
} from '../controllers/admin.controller.js';

const router = Router();

// Protect all routes and require admin access
router.use(protect, isAdmin);

router.get('/dashboard', getDashboardStats);

router.get('/users',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('role').optional().isIn(['user', 'coach', 'admin']),
    validate
  ],
  getUsers
);

router.put('/users/:userId/role',
  [
    param('userId').isMongoId(),
    body('role').isIn(['user', 'coach', 'admin']),
    validate
  ],
  updateUserRole
);

router.delete('/users/:userId',
  [
    param('userId').isMongoId(),
    validate
  ],
  deleteUser
);

router.post('/content',
  [
    body('action').isIn(['delete']),
    body('contentType').isIn(['post', 'product']),
    body('contentId').isMongoId(),
    validate
  ],
  manageContent
);

export default router;
