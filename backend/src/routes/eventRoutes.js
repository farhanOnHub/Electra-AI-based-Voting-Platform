import express from 'express';
import * as eventController from '../controllers/eventController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize('admin'), eventController.createEvent);
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.post('/code', eventController.getEventByCode);
router.put('/:id', authenticate, authorize('admin'), eventController.updateEvent);
router.delete('/:id', authenticate, authorize('admin'), eventController.deleteEvent);
router.post('/join', authenticate, eventController.joinEvent);
router.get('/user/events', authenticate, eventController.getUserEvents);
router.get('/:eventId/results', eventController.getEventResults);
router.get('/admin/analytics', authenticate, authorize('admin'), eventController.getAdminAnalytics);

export default router;
