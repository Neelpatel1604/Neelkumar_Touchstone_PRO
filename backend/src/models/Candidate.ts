export interface Candidate {
    // Personal details
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    legalStatus: 'Permanent Resident' | 'Canadian Citizen' | 'Other';
    
    // Education background
    medicalSchool: string;
    degree: string;
    graduationYear: number;
    languageOfEducation: string;
    
    // Exam history
    nacDate?: string;
    mccqe1Date?: string;
    mccqe2Date?: string;
    
    // TDM Results
    writtenTDM: 'Passed' | 'Failed' | 'Not Taken';
    
    // License
    hasCanadianDrivingLicense: boolean;
    
    // Practice Experience
    practiceHours: number;
    
    // English Proficiency
    englishProficiency: {
      type: 'IELTS' | 'OET' | 'CELPIP' | 'Recent Practice';
      score?: number | string; // Number for IELTS/CELPIP, string for OET
      recentPracticePercentage?: number; // For Recent Practice type
    };
    
    // Postgraduate Training
    postGradTraining: {
      completed: boolean;
      months: number;
      independentPracticeMonths: number;
    };
    
    // Rotations
    rotationsCompleted: number;
    
    // Impairment
    hasImpairmentToPractice: boolean;
  }