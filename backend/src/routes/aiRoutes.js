import express from 'express';
import * as aiController from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary/:eventId', authenticate, aiController.generateElectionSummary);
router.get('/fraud-detection/:eventId', authenticate, aiController.detectFraud);
router.get('/participation-prediction/:eventId', authenticate, aiController.predictParticipation);

export default router;
