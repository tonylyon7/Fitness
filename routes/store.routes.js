import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  getProducts,
  getProductById,
  createOrder,
  getOrders
} from '../controllers/store.controller.js';

const router = Router();

// Public routes
router.get('/products',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('category').optional().isIn(['supplements', 'equipment', 'apparel', 'accessories']),
    query('sortBy').optional().isIn(['createdAt', 'price', 'rating']),
    query('order').optional().isIn(['asc', 'desc']),
    validate
  ],
  getProducts
);

router.get('/products/:id',
  [
    param('id').isMongoId(),
    validate
  ],
  getProductById
);

// Protected routes
router.use(protect);

router.post('/orders/create',
  [
    body('items').isArray().notEmpty(),
    body('items.*.productId').isMongoId(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('shippingAddress').isObject(),
    body('shippingAddress.street').trim().notEmpty(),
    body('shippingAddress.city').trim().notEmpty(),
    body('shippingAddress.state').trim().notEmpty(),
    body('shippingAddress.zipCode').trim().notEmpty(),
    body('shippingAddress.country').trim().notEmpty(),
    body('paymentMethod').isIn(['credit_card', 'debit_card', 'paypal']),
    validate
  ],
  createOrder
);

router.get('/orders', getOrders);

export default router;
