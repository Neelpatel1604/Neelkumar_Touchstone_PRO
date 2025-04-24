// This is a simple test script that can be run with ts-node
import axios from 'axios';

// Base URL for our API
const API_URL = 'http://localhost:5000/api/candidates';

// Sample candidate data for testing
const validCandidate = {
  // Personal Information
  firstName: 'Neelkumar',
  lastName: 'patel',
  email: 'neel_patel2004@outlook.com',
  dateOfBirth: '2004-16-10',
  legalStatus: 'Canadian Citizen',
  
  // Medical Education
  medicalSchool: 'Sheridan College',
  degree: 'MD',
  graduationYear: 2019,
  languageOfEducation: 'English',
  
  // Examinations
  nacDate: '2020-01-01',
  mccqe1Date: '2020-03-01',
  mccqe2Date: '2020-06-01',
  
  // TDM Results
  writtenTDM: 'Passed',
  
  // License
  hasCanadianDrivingLicense: true,
  
  // Practice Experience
  practiceHours: 800,
  
  // English Proficiency
  englishProficiency: {
    type: 'IELTS',
    score: 8
  },
  
  // Postgraduate Training
  postGradTraining: {
    completed: true,
    months: 24,
    independentPracticeMonths: 36
  },
  
  // Rotations
  rotationsCompleted: 7,
  
  // Impairment
  hasImpairmentToPractice: false
};

// Sample candidate that should fail
const invalidCandidate = {
  // Personal Information
  firstName: 'hello',
  lastName: 'world',
  email: 'helloworld@outlook.com',
  dateOfBirth: '2003-05-05',
  legalStatus: 'Other',
  
  // Medical Education
  medicalSchool: 'University of British Columbia',
  degree: 'MD',
  graduationYear: 2015,
  languageOfEducation: 'English',
  
  // Examinations
  nacDate: '2017-01-01',
  mccqe1Date: '2017-03-01',
  mccqe2Date: '2017-06-01',
  
  // TDM Results
  writtenTDM: 'Failed',
  
  // License
  hasCanadianDrivingLicense: false,
  
  // Practice Experience
  practiceHours: 600,
  
  // English Proficiency
  englishProficiency: {
    type: 'IELTS',
    score: 6
  },
  
  // Postgraduate Training
  postGradTraining: {
    completed: false,
    months: 12,
    independentPracticeMonths: 24
  },
  
  // Rotations
  rotationsCompleted: 5,
  
  // Impairment
  hasImpairmentToPractice: true
};

// Function to test the candidate evaluation endpoint
async function testCandidateEvaluation() {
  console.log('Testing valid candidate...');
  try {
    const validResponse = await axios.post(`${API_URL}/evaluate`, validCandidate);
    console.log('Valid Candidate Response:', JSON.stringify(validResponse.data, null, 2));
    
    console.log('\nTesting invalid candidate...');
    const invalidResponse = await axios.post(`${API_URL}/evaluate`, invalidCandidate);
    console.log('Invalid Candidate Response:', JSON.stringify(invalidResponse.data, null, 2));
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error:', error.response?.data || error.message);
    } else {
      console.error('Error:', error);
    }
  }
}

// Run the test
testCandidateEvaluation();