// backend/src/routes/candidateRoutes.ts (updated)
import express from 'express';
import { CandidateController } from '../controllers/candidateController';
import { validateCandidateData } from '../middleware/validateRequest';

const router = express.Router();
const candidateController = new CandidateController();

// POST endpoint to evaluate a candidate with validation
router.post('/evaluate', validateCandidateData, candidateController.evaluateCandidate);

// GET all candidates
router.get('/', candidateController.getAllCandidates);

// GET stored candidates - must come before /:candidateId to avoid pattern matching issues
router.get('/stored', candidateController.getStoredCandidates);

// GET candidate by ID (specific ID routes should come after more specific routes)
router.get('/:candidateId', candidateController.getCandidateById);

// PATCH to update flag status
router.patch('/:candidateId/flags/:flagId', candidateController.updateFlag);

export default router;