import { Request, Response } from 'express';
import { FlaggingService } from '../services/flaggingService';
import { Candidate } from '../models/Candidate';

export class CandidateController {
  private flaggingService: FlaggingService;
  
  constructor() {
    this.flaggingService = new FlaggingService();
  }
  
  evaluateCandidate = (req: Request, res: Response): void => {
    try {
      const candidateData: Candidate = req.body;
      
      // Validate the incoming data
      if (!candidateData) {
        res.status(400).json({ 
          success: false, 
          message: 'No candidate data provided' 
        });
        return;
      }
      
      // Evaluate the candidate
      const evaluationResult = this.flaggingService.evaluateCandidate(candidateData);
      
      res.status(200).json({
        success: true,
        data: evaluationResult
      });
    } catch (error) {
      console.error('Error evaluating candidate:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: (error as Error).message
      });
    }
  };
}