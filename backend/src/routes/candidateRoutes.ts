// backend/src/routes/candidateRoutes.ts (updated)
import express from 'express';
import { CandidateController } from '../controllers/candidateController';
import { validateCandidateData } from '../middleware/validateRequest';

const router = express.Router();
const candidateController = new CandidateController();

// Candidate evaluation endpoint
router.post('/evaluate', validateCandidateData, candidateController.evaluateCandidate);

// Retrieve all candidates
router.get('/', candidateController.getAllCandidates);

// Get stored candidates list (route order matters to prevent param collision)
router.get('/stored', candidateController.getStoredCandidates);

// Fetch candidate details by ID
router.get('/:candidateId', candidateController.getCandidateById);

// Update candidate flag
router.patch('/:candidateId/flags/:flagId', candidateController.updateFlag);

export default router;