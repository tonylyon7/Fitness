import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  getSubscriptionStatus,
  updateSubscription,
  cancelSubscription,
  getSubscriptionPlans,
  checkFeatureAccess
} from '../controllers/subscription.controller.js';

const router = Router();

// Protect all routes
router.use(protect);

router.get('/status', getSubscriptionStatus);

router.get('/plans', getSubscriptionPlans);

router.put('/update',
  [
    body('plan').isIn(['basic', 'premium', 'elite']),
    body('interval').isIn(['monthly', 'yearly']),
    body('paymentMethod').isObject(),
    body('paymentMethod.type').isIn(['credit_card', 'debit_card', 'paypal']),
    body('paymentMethod.last4').optional().isString().isLength({ min: 4, max: 4 }),
    body('paymentMethod.expiryDate').optional().matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/),
    validate
  ],
  updateSubscription
);

router.post('/cancel',
  [
    body('reason').optional().trim().isString(),
    validate
  ],
  cancelSubscription
);

router.get('/access/:feature',
  [
    param('feature').isString().trim().notEmpty(),
    validate
  ],
  checkFeatureAccess
);

export default router;
