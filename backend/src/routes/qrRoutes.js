import express from 'express';
import * as qrController from '../controllers/qrController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/event/:eventId', authenticate, qrController.generateEventQR);
router.get('/result/:eventId', authenticate, qrController.generateResultQR);

export default router;
