import express from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/platform', authenticate, analyticsController.getPlatformAnalytics);
router.get('/event/:eventId', authenticate, analyticsController.getEventAnalytics);
router.get('/organization/:organizationId', authenticate, analyticsController.getOrganizationAnalytics);

export default router;
