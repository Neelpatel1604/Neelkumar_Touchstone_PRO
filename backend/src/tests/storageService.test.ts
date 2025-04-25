// Complete updated StorageService.test.ts
import { StorageService } from '../services/storageService';
import { Candidate } from '../models/Candidate';
import { EvaluationResult, Flag } from '../models/Flag';
import * as fs from 'fs';
import * as path from 'path';

// Helper to create a clean isolated StorageService for each test
function createIsolatedStorageService() {
  const testFilePath = path.join(__dirname, `../../data/test-candidates-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.json`);
  
  // Ensure the directory exists
  const dir = path.dirname(testFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Create an empty file
  fs.writeFileSync(testFilePath, JSON.stringify([]));
  
  const storageService = new StorageService();
  // @ts-ignore - Access private property for testing
  storageService.dataFilePath = testFilePath;
  // Reset the candidates array to ensure isolation
  // @ts-ignore - Access private property for testing
  storageService.candidates = [];
  
  return { storageService, testFilePath };
}

// Mock candidate data
const mockCandidate: Candidate = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  dateOfBirth: '1990-01-01',
  legalStatus: 'Canadian Citizen',
  medicalSchool: 'University of Toronto',
  degree: 'MD',
  graduationYear: 2015,
  languageOfEducation: 'English',
  writtenTDM: 'Passed',
  hasCanadianDrivingLicense: true,
  practiceHours: 800,
  englishProficiency: {
    type: 'IELTS',
    score: '8'
  },
  postGradTraining: {
    completed: true,
    months: 24,
    independentPracticeMonths: 24
  },
  rotationsCompleted: 10,
  hasImpairmentToPractice: false
};

describe('StorageService', () => {
  
  afterAll(() => {
    // Cleanup any test files that might be left
    const dataDir = path.join(__dirname, '../../data');
    if (fs.existsSync(dataDir)) {
      const files = fs.readdirSync(dataDir);
      files.forEach(file => {
        if (file.startsWith('test-candidates-')) {
          fs.unlinkSync(path.join(dataDir, file));
        }
      });
    }
  });
  
  test('should store a candidate and return an ID', () => {
    const { storageService, testFilePath } = createIsolatedStorageService();
    
    try {
      // Create mock evaluation
      const mockEvaluation: EvaluationResult = {
        isEligible: true,
        flags: [
          {
            category: 'Legal Status',
            field: 'legalStatus',
            status: 'Green',
            message: 'Candidate meets legal status requirement'
          }
        ]
      };
      
      const id = storageService.storeCandidate(mockCandidate, mockEvaluation);
      expect(id).toBeTruthy();
      
      // Verify it was stored
      const candidates = storageService.getAllCandidates();
      expect(candidates.length).toBe(1);
      expect(candidates[0].candidate.firstName).toBe('John');
    } finally {
      // Clean up
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    }
  });
  
  test('should update flag status', () => {
    const { storageService, testFilePath } = createIsolatedStorageService();
    
    try {
      // Create mock evaluation with a flag that has an ID field
      const mockEvaluation: EvaluationResult = {
        isEligible: true,
        flags: [
          {
            id: 'test-flag-id', // Add an ID here
            category: 'Legal Status',
            field: 'legalStatus',
            status: 'Green',
            message: 'Candidate meets legal status requirement'
          }
        ]
      };
      
      const id = storageService.storeCandidate(mockCandidate, mockEvaluation);
      
      // Update the flag using the known ID
      const result = storageService.updateFlagStatus(id, 'test-flag-id', true, true);
      expect(result).toBe(true);
      
      // Verify the update
      const updatedCandidate = storageService.getCandidateById(id);
      expect(updatedCandidate?.evaluation.flags[0].acknowledged).toBe(true);
      expect(updatedCandidate?.evaluation.flags[0].overridden).toBe(true);
    } finally {
      // Clean up
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    }
  });
  
  test('should recalculate eligibility when flags are overridden', () => {
    const { storageService, testFilePath } = createIsolatedStorageService();
    
    try {
      // Create a candidate with a Red flag with a specific ID
      const redFlagEvaluation: EvaluationResult = {
        isEligible: false,
        flags: [
          {
            id: 'red-flag-id', // Add an ID
            category: 'Test',
            field: 'test',
            status: 'Red',
            message: 'Red flag for testing'
          }
        ]
      };
      
      const id = storageService.storeCandidate(mockCandidate, redFlagEvaluation);
      
      // Verify initially not eligible
      const initialCandidate = storageService.getCandidateById(id);
      expect(initialCandidate?.evaluation.isEligible).toBe(false);
      
      // Override the red flag with known ID
      const result = storageService.updateFlagStatus(id, 'red-flag-id', true, true);
      expect(result).toBe(true);
      
      // Check if eligibility was recalculated
      const updatedCandidate = storageService.getCandidateById(id);
      expect(updatedCandidate?.evaluation.isEligible).toBe(true);
    } finally {
      // Clean up
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    }
  });
  
  test('should return false for non-existent candidate ID', () => {
    const { storageService, testFilePath } = createIsolatedStorageService();
    
    try {
      const result = storageService.updateFlagStatus('non-existent-id', 'flag-id', true, true);
      expect(result).toBe(false);
    } finally {
      // Clean up
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    }
  });
  
  test('should return false for non-existent flag ID', () => {
    const { storageService, testFilePath } = createIsolatedStorageService();
    
    try {
      // First store a candidate
      const mockEvaluation: EvaluationResult = {
        isEligible: true,
        flags: [
          {
            id: 'existing-flag-id',
            category: 'Legal Status',
            field: 'legalStatus',
            status: 'Green',
            message: 'Candidate meets legal status requirement'
          }
        ]
      };
      
      const id = storageService.storeCandidate(mockCandidate, mockEvaluation);
      
      // Try to update with invalid flag ID
      const result = storageService.updateFlagStatus(id, 'non-existent-flag-id', true, true);
      expect(result).toBe(false);
    } finally {
      // Clean up
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    }
  });
});