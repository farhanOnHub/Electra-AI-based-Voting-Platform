import express from 'express';
import * as otpController from '../controllers/otpController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/send', otpController.sendOTP);
router.post('/verify', otpController.verifyOTP);
router.post('/resend', otpController.resendOTP);

export default router;
