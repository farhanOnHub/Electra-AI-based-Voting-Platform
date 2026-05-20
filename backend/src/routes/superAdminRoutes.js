import express from 'express';
import * as superAdminController from '../controllers/superAdminController.js';
import { authenticate, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require super admin access
router.use(authenticate, requireSuperAdmin);

router.get('/stats', superAdminController.getPlatformStats);
router.get('/organizations', superAdminController.getAllOrganizations);
router.post('/users/:userId/ban', superAdminController.banUser);
router.post('/users/:userId/unban', superAdminController.unbanUser);
router.get('/audit-logs', superAdminController.getAllAuditLogs);
router.get('/health', superAdminController.getSystemHealth);

export default router;
