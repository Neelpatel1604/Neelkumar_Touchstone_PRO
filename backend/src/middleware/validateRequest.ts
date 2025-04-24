import { Request, Response, NextFunction } from 'express';
import { Candidate } from '../models/Candidate';

export const validateCandidateData = (req: Request, res: Response, next: NextFunction): void => {
  const candidateData = req.body as Partial<Candidate>;
  
  // Check for required fields
  const requiredFields: (keyof Candidate)[] = [
    'firstName', 
    'lastName', 
    'email', 
    'dateOfBirth', 
    'legalStatus'
  ];
  
  const missingFields = requiredFields.filter(field => !candidateData[field]);
  
  if (missingFields.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Missing required fields',
      missingFields
    });
    return;
  }
  
  // If all validation passes, proceed
  next();
};