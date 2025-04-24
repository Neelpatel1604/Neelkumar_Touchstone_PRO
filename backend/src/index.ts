import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import candidateRoutes from './routes/candidateRoutes';
import { CandidateController } from './controllers/candidateController';
import { validateCandidateData } from './middleware/validateRequest';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize controller
const candidateController = new CandidateController();

// Routes
app.use('/api/candidates', candidateRoutes);

// Direct /evaluate route for convenience
app.post('/evaluate', validateCandidateData, candidateController.evaluateCandidate);

// Base route
app.get('/', (req, res) => {
  res.send('Flagging System API is running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});