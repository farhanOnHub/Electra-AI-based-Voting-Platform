import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, authorize('admin'));

// Fraud alerts
router.get('/fraud-alerts', adminController.getFraudAlerts);

// User management
router.get('/users', adminController.getAllUsers);
router.post('/users/:userId/ban', adminController.banUser);
router.post('/users/:userId/unban', adminController.unbanUser);

// Admin stats
router.get('/stats', adminController.getAdminStats);

export default router;
