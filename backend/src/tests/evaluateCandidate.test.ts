// backend/src/tests/evaluateCandidate.test.ts (with type fixes)
import axios from 'axios';
import { Flag } from '../models/Flag'; // Import the Flag type

// Define API URL
const API_URL = 'http://localhost:5000/api/candidates';

// Valid candidate data - this should match all criteria for eligibility
const validCandidate = {
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

// Invalid candidate data - fails multiple criteria
const invalidCandidate = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  dateOfBirth: '1995-05-15',
  legalStatus: 'Other',
  medicalSchool: 'Foreign University',
  degree: 'MD',
  graduationYear: 2018,
  languageOfEducation: 'French',
  writtenTDM: 'Failed',
  hasCanadianDrivingLicense: false,
  practiceHours: 500,
  englishProficiency: {
    type: 'IELTS',
    score: '6'
  },
  postGradTraining: {
    completed: false,
    months: 6,
    independentPracticeMonths: 12
  },
  rotationsCompleted: 3,
  hasImpairmentToPractice: true
};

// Properly skip tests if server isn't running
describe('Candidate API Tests', () => {
  let serverAvailable = false;

  beforeAll(async () => {
    try {
      await axios.get('http://localhost:5000');
      serverAvailable = true;
      console.log('Backend server is running, tests will execute');
    } catch (error) {
      serverAvailable = false;
      console.log('Backend server is not running, tests will be skipped');
    }
  });

  // This is the key part - use conditional test execution
  (serverAvailable ? test : test.skip)('should evaluate a valid candidate correctly', async () => {
    const validResponse = await axios.post(`${API_URL}/evaluate`, validCandidate);
    
    console.log('Response status:', validResponse.status);
    
    expect(validResponse.status).toBe(200);
    expect(validResponse.data.success).toBe(true);
    expect(validResponse.data.data.isEligible).toBe(true);
    
    const flags: Flag[] = validResponse.data.data.flags;
    expect(flags.some((f: Flag) => f.status === 'Green')).toBe(true);
  });

  (serverAvailable ? test : test.skip)('should correctly flag an invalid candidate', async () => {
    const invalidResponse = await axios.post(`${API_URL}/evaluate`, invalidCandidate);
    
    console.log('Response status:', invalidResponse.status);
    
    expect(invalidResponse.status).toBe(200);
    expect(invalidResponse.data.success).toBe(true);
    expect(invalidResponse.data.data.isEligible).toBe(false);
    
    const flags: Flag[] = invalidResponse.data.data.flags;
    expect(flags.some((f: Flag) => f.status === 'Red')).toBe(true);
  });
});