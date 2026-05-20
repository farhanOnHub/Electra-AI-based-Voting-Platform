import express from 'express';
import * as publicResultsController from '../controllers/publicResultsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/share/:slug', publicResultsController.getPublicResults);

// Admin routes
router.post('/', authenticate, publicResultsController.generatePublicResult);
router.post('/qr-code', authenticate, publicResultsController.generateQRCode);
router.post('/export', authenticate, publicResultsController.exportResults);
router.post('/share/:slug/increment', publicResultsController.sharePublicResult);

export default router;
