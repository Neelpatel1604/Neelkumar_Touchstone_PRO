import express from 'express';
import { CandidateController } from '../controllers/candidateController';
import { validateCandidateData } from '../middleware/validateRequest';

const router = express.Router();
const candidateController = new CandidateController();

// POST endpoint to evaluate a candidate with validation
router.post('/evaluate', validateCandidateData, candidateController.evaluateCandidate);

export default router;