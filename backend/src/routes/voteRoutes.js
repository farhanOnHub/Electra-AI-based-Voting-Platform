import express from 'express';
import * as voteController from '../controllers/voteController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, voteController.castVote);
router.get('/:eventId/results', voteController.getEventResults);
router.get('/:eventId/check', authenticate, voteController.checkIfVoted);
router.get('/history', authenticate, voteController.getUserVotingHistory);

export default router;
