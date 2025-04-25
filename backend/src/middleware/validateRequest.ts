import { Request, Response, NextFunction } from 'express';
import { Candidate } from '../models/Candidate';

export const validateCandidateData = (req: Request, res: Response, next: NextFunction): void => {
  const candidateData = req.body as Partial<Candidate>;
  
  // Core required fields
  const requiredFields: (keyof Candidate)[] = [
    'firstName', 
    'lastName', 
    'email', 
    'dateOfBirth', 
    'legalStatus',
    'medicalSchool',
    'degree',
    'graduationYear',
    'languageOfEducation',
    'writtenTDM',
    'practiceHours',
    'englishProficiency',
    'postGradTraining',
    'rotationsCompleted'
  ];
  
  try {
    // Find missing fields
    const missingFields = requiredFields.filter(field => 
      candidateData[field] === undefined || candidateData[field] === null || 
      (typeof candidateData[field] === 'string' && candidateData[field] === '')
    );
    
    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields
      });
      return;
    }

    // Check object structures
    if (!candidateData.englishProficiency || typeof candidateData.englishProficiency !== 'object') {
      res.status(400).json({
        success: false,
        message: 'English proficiency data is missing or invalid'
      });
      return;
    }

    if (!candidateData.postGradTraining || typeof candidateData.postGradTraining !== 'object') {
      res.status(400).json({
        success: false,
        message: 'Post graduate training data is missing or invalid'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating request data',
      error: (error as Error).message
    });
  }
};