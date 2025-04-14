import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  getConversations,
  getMessages,
  sendMessage,
  createConversation
} from '../controllers/chat.controller.js';

const router = Router();

// Protect all routes
router.use(protect);

router.get('/conversations', getConversations);

router.get('/messages/:conversationId',
  [
    param('conversationId').isMongoId(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
  ],
  getMessages
);

router.post('/messages/send',
  [
    body('conversationId').isMongoId(),
    body('content').trim().notEmpty(),
    body('contentType').optional().isIn(['text', 'image', 'video', 'file']),
    body('mediaUrl').optional().isURL(),
    body('replyToId').optional().isMongoId(),
    validate
  ],
  sendMessage
);

router.post('/conversations/create',
  [
    body('participantIds').isArray().notEmpty(),
    body('participantIds.*').isMongoId(),
    body('type').optional().isIn(['direct', 'group', 'support']),
    body('name').optional().trim(),
    validate
  ],
  createConversation
);

export default router;
