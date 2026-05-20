import express from 'express';
import * as candidateController from '../controllers/candidateController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize('admin'), candidateController.addCandidate);
router.put('/:id', authenticate, authorize('admin'), candidateController.updateCandidate);
router.delete('/:id', authenticate, authorize('admin'), candidateController.deleteCandidate);
router.get('/event/:eventId', candidateController.getCandidatesByEvent);

export default router;
