import express from 'express';
import * as mlController from '../controllers/mlController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All ML routes require authentication
router.use(authenticate);

// Sentiment Analysis
router.get('/sentiment/candidate/:candidateId', mlController.analyzeCandidateSentiment);

// Voter Behavior Prediction
router.get('/behavior/prediction/:userId', mlController.predictVoterBehavior);

// Smart Recommendations
router.get('/recommendations/:userId', mlController.getSmartRecommendations);

// Anomaly Detection
router.get('/anomaly-detection/:eventId', mlController.detectAnomalies);

// Natural Language Processing
router.get('/nlp/event/:eventId', mlController.analyzeEventDescription);

export default router;
