import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize('admin'), notificationController.createNotification);
router.get('/', authenticate, notificationController.getUserNotifications);
router.patch('/:notificationId/read', authenticate, notificationController.markAsRead);
router.delete('/:notificationId', authenticate, notificationController.deleteNotification);
router.get('/unread/count', authenticate, notificationController.getUnreadCount);

export default router;
