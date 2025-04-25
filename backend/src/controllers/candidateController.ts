// backend/src/controllers/candidateController.ts (updated)
import { Request, Response } from 'express';
import { FlaggingService } from '../services/flaggingService';
import { StorageService } from '../services/storageService';
import { Candidate } from '../models/Candidate';

export class CandidateController {
  private flaggingService: FlaggingService;
  private storageService: StorageService;
  
  constructor() {
    this.flaggingService = new FlaggingService();
    this.storageService = new StorageService();
  }
  
  evaluateCandidate = async (req: Request, res: Response): Promise<void> => {
    try {
      // Log only essential information instead of the entire object
      console.log('Receiving candidate data for:', 
        req.body.firstName, req.body.lastName, req.body.email);
      
      const candidateData: Candidate = req.body;
      
      // Additional validation
      if (!candidateData) {
        res.status(400).json({ 
          success: false, 
          message: 'No candidate data provided' 
        });
        return;
      }
      
      // Log that evaluation is starting
      console.log('Starting candidate evaluation');
      
      // Evaluate the candidate
      const evaluationResult = this.flaggingService.evaluateCandidate(candidateData);
      
      // Store the candidate and evaluation asynchronously
      const candidateId = await this.storageService.storeCandidate(candidateData, evaluationResult);
      
      // Log successful evaluation
      console.log('Candidate evaluation completed successfully for ID:', candidateId);
      
      // Send a streamlined response
      res.status(200).json({
        success: true,
        data: {
          ...evaluationResult,
          candidateId
        }
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
  
  updateFlag = async (req: Request, res: Response): Promise<void> => {
    try {
      const { candidateId, flagId } = req.params;
      const { acknowledged, overridden } = req.body;
      
      if (!candidateId || !flagId) {
        res.status(400).json({
          success: false,
          message: 'Candidate ID and Flag ID are required'
        });
        return;
      }
      
      const success = await this.storageService.updateFlagStatus(
        candidateId,
        flagId,
        acknowledged,
        overridden
      );
      
      if (success) {
        // Get the updated candidate to return
        const updatedCandidate = this.storageService.getCandidateById(candidateId);
        
        res.status(200).json({
          success: true,
          message: 'Flag status updated successfully',
          data: updatedCandidate?.evaluation
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Candidate or flag not found'
        });
      }
    } catch (error) {
      console.error('Error updating flag status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: (error as Error).message
      });
    }
  };
  
  getAllCandidates = (req: Request, res: Response): void => {
    try {
      const candidates = this.storageService.getAllCandidates();
      res.status(200).json({
        success: true,
        data: candidates
      });
    } catch (error) {
      console.error('Error retrieving candidates:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: (error as Error).message
      });
    }
  };
  
  getCandidateById = (req: Request, res: Response): void => {
    try {
      const { candidateId } = req.params;
      const candidate = this.storageService.getCandidateById(candidateId);
      
      if (candidate) {
        res.status(200).json({
          success: true,
          data: candidate
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Candidate not found'
        });
      }
    } catch (error) {
      console.error('Error retrieving candidate:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: (error as Error).message
      });
    }
  };
  getStoredCandidates = (req: Request, res: Response): void => {
    try {
      // Get all candidates
      const allCandidates = this.storageService.getAllCandidates();
      
      // Return all candidates without pagination for simplicity
      res.status(200).json({
        success: true,
        data: allCandidates
      });
    } catch (error) {
      console.error('Error retrieving stored candidates:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: (error as Error).message
      });
    }
  };
}