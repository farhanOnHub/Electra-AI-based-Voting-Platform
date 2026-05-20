import express from 'express';
import * as chatController from '../controllers/chatController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, chatController.sendMessage);
router.get('/:eventId', chatController.getEventMessages);
router.post('/:messageId/like', authenticate, chatController.likeMessage);
router.post('/:messageId/flag', authenticate, chatController.flagMessage);
router.delete('/:messageId', authenticate, chatController.deleteMessage);
router.patch('/:messageId/moderate', authenticate, authorize('admin'), chatController.moderateMessage);

export default router;
