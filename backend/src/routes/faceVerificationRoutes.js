import express from 'express';
import * as faceController from '../controllers/faceVerificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/capture', authenticate, faceController.captureFaceImage);
router.post('/verify-vote', authenticate, faceController.verifyFaceBeforeVote);
router.post('/disable', authenticate, faceController.disableFaceVerification);
router.get('/check', authenticate, faceController.isFaceVerified);

export default router;
