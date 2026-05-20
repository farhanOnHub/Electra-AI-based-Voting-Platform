import express from 'express';
import * as auditController from '../controllers/auditController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize('admin'), auditController.getAuditLogs);
router.get('/failed-logins', authenticate, authorize('admin'), auditController.getFailedLogins);
router.get('/suspicious', authenticate, authorize('admin'), auditController.getSuspiciousActivities);
router.get('/:userId', authenticate, authorize('admin'), auditController.getUserActivityHistory);

export default router;
