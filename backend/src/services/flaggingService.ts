import { Candidate } from '../models/Candidate';
import { EvaluationResult, Flag, FlagType } from '../models/Flag';

export class FlaggingService {
  
  evaluateCandidate(candidate: Candidate): EvaluationResult {
    try {
      console.log('Processing candidate:', JSON.stringify(candidate, null, 2));
      const flags: Flag[] = [];
      
      // Personal Information Validation
      this.validateRequiredFields(candidate, flags);
      
      // Legal Status
      this.evaluateLegalStatus(candidate, flags);
      
      // Driving License
      this.evaluateDrivingLicense(candidate, flags);
      
      // Practice Hours
      this.evaluatePracticeHours(candidate, flags);
      
      // TDM Results
      this.evaluateTDM(candidate, flags);
      
      // English Proficiency
      this.evaluateEnglishProficiency(candidate, flags);
      
      // Postgrad Training
      this.evaluatePostgradTraining(candidate, flags);
      
      // Rotations
      this.evaluateRotations(candidate, flags);
      
      // Impairment to Practice
      this.evaluateImpairment(candidate, flags);
      
      // Check if candidate is eligible (no red flags)
      const hasRedFlags = flags.some(flag => flag.status === 'Red');
      
      return {
        isEligible: !hasRedFlags,
        flags,
      };
    } catch (error) {
      console.error('Error in flagging service:', error);
      // Return a basic result with an error flag
      return {
        isEligible: false,
        flags: [{
          category: 'System Error',
          field: 'evaluation',
          status: 'Red',
          message: 'Error processing candidate data: ' + (error as Error).message
        }]
      };
    }
  }
  
  private validateRequiredFields(candidate: Candidate, flags: Flag[]): void {
    // Check for required personal information
    const requiredPersonalFields: (keyof Candidate)[] = ['firstName', 'lastName', 'email', 'dateOfBirth'];
    
    requiredPersonalFields.forEach(field => {
      if (!candidate[field]) {
        flags.push({
          category: 'Personal Information',
          field: field.toString(),
          status: 'Red',
          message: `${field} is required`
        });
      }
    });
    
    // Check medical education fields
    const requiredMedicalFields: (keyof Candidate)[] = ['medicalSchool', 'degree', 'graduationYear', 'languageOfEducation'];
    
    requiredMedicalFields.forEach(field => {
      if (!candidate[field]) {
        flags.push({
          category: 'Medical Education',
          field: field.toString(),
          status: 'Red',
          message: `${field} is required`
        });
      }
    });
    
    // Check examination fields
    const examinationFields: (keyof Candidate)[] = ['nacDate', 'mccqe1Date', 'mccqe2Date'];
    
    examinationFields.forEach(field => {
      if (!candidate[field]) {
        flags.push({
          category: 'Examinations',
          field: field.toString(),
          status: 'Red',
          message: `${field} is required`
        });
      }
    });
  }
  
  private evaluateLegalStatus(candidate: Candidate, flags: Flag[]): void {
    const { legalStatus } = candidate;
    
    if (legalStatus === 'Permanent Resident' || legalStatus === 'Canadian Citizen') {
      flags.push({
        category: 'Legal Status',
        field: 'legalStatus',
        status: 'Green',
        message: 'Candidate meets legal status requirement'
      });
    } else {
      flags.push({
        category: 'Legal Status',
        field: 'legalStatus',
        status: 'Red',
        message: 'Candidate must be a Permanent Resident or Canadian Citizen'
      });
    }
  }
  
  private evaluateDrivingLicense(candidate: Candidate, flags: Flag[]): void {
    const { hasCanadianDrivingLicense } = candidate;
    
    if (hasCanadianDrivingLicense) {
      flags.push({
        category: 'Driving License',
        field: 'hasCanadianDrivingLicense',
        status: 'Green',
        message: 'Candidate has a valid Canadian driving license'
      });
    } else {
      flags.push({
        category: 'Driving License',
        field: 'hasCanadianDrivingLicense',
        status: 'Red',
        message: 'Candidate must have a valid Canadian driving license'
      });
    }
  }
  
  private evaluatePracticeHours(candidate: Candidate, flags: Flag[]): void {
    const { practiceHours } = candidate;
    
    if (practiceHours >= 720) {
      flags.push({
        category: 'Practice Hours',
        field: 'practiceHours',
        status: 'Green',
        message: 'Candidate has sufficient practice hours'
      });
    } else {
      flags.push({
        category: 'Practice Hours',
        field: 'practiceHours',
        status: 'Red',
        message: 'Candidate must have at least 720 hours of in-person practice'
      });
    }
  }
  
  private evaluateTDM(candidate: Candidate, flags: Flag[]): void {
    const { writtenTDM } = candidate;
    
    if (writtenTDM === 'Passed') {
      flags.push({
        category: 'TDM Results',
        field: 'writtenTDM',
        status: 'Green',
        message: 'Candidate has passed the Written TDM test'
      });
    } else {
      flags.push({
        category: 'TDM Results',
        field: 'writtenTDM',
        status: 'Red',
        message: 'Candidate must pass the Written TDM test'
      });
    }
  }
  
  private evaluateEnglishProficiency(candidate: Candidate, flags: Flag[]): void {
    const { englishProficiency } = candidate;
    
    if (!englishProficiency) {
      flags.push({
        category: 'English Proficiency',
        field: 'englishProficiency',
        status: 'Red',
        message: 'English proficiency information is required'
      });
      return;
    }
    
    let isEligible = false;
    
    switch (englishProficiency.type) {
      case 'IELTS':
        // Notice that the value is coming as a string "8" not number 8
        // Convert to number for comparison
        isEligible = parseFloat(englishProficiency.score as string) >= 7;
        break;
      case 'OET':
        isEligible = (englishProficiency.score as string) >= 'B';
        break;
      case 'CELPIP':
        isEligible = parseFloat(englishProficiency.score as string) >= 9;
        break;
      case 'Recent Practice':
        isEligible = (englishProficiency.recentPracticePercentage || 0) >= 50;
        break;
    }
    
    if (isEligible) {
      flags.push({
        category: 'English Proficiency',
        field: 'englishProficiency',
        status: 'Green',
        message: 'Candidate meets English proficiency requirements'
      });
    } else {
      flags.push({
        category: 'English Proficiency',
        field: 'englishProficiency',
        status: 'Red',
        message: 'Candidate does not meet English proficiency requirements'
      });
    }
  }
  
  private evaluatePostgradTraining(candidate: Candidate, flags: Flag[]): void {
    const { postGradTraining } = candidate;
    
    if (!postGradTraining) {
      flags.push({
        category: 'Postgrad Training',
        field: 'postGradTraining',
        status: 'Red',
        message: 'Postgrad training information is required'
      });
      return;
    }
    
    // Check if candidate has completed 24 months PG + 24 months independent practice OR
    // 12 months PG + 36 months independent practice
    const { months, independentPracticeMonths } = postGradTraining;
    
    const condition1 = months >= 24 && independentPracticeMonths >= 24;
    const condition2 = months >= 12 && independentPracticeMonths >= 36;
    
    if (condition1 || condition2) {
      flags.push({
        category: 'Postgrad Training',
        field: 'postGradTraining',
        status: 'Green',
        message: 'Candidate meets postgrad training requirements'
      });
    } else {
      flags.push({
        category: 'Postgrad Training',
        field: 'postGradTraining',
        status: 'Red',
        message: 'Candidate must have completed either 24 months PG + 24 months independent practice OR 12 months PG + 36 months independent practice'
      });
    }
    
    // Check completion of 2-year postgrad
    if (months >= 24) {
      flags.push({
        category: 'Postgrad Training',
        field: 'twoYearPostgradCompleted',
        status: 'Green',
        message: 'Candidate has completed 2 years of postgrad training'
      });
    } else {
      flags.push({
        category: 'Postgrad Training',
        field: 'twoYearPostgradCompleted',
        status: 'Red',
        message: 'Candidate must complete 2 years of postgrad training'
      });
    }
  }
  
  private evaluateRotations(candidate: Candidate, flags: Flag[]): void {
    const { rotationsCompleted } = candidate;
    
    if (rotationsCompleted >= 7) {
      flags.push({
        category: 'Rotations',
        field: 'rotationsCompleted',
        status: 'Green',
        message: 'Candidate has completed the required 7 rotations'
      });
    } else {
      flags.push({
        category: 'Rotations',
        field: 'rotationsCompleted',
        status: 'Red',
        message: 'Candidate must complete 7 rotations'
      });
    }
  }
  
  private evaluateImpairment(candidate: Candidate, flags: Flag[]): void {
    const { hasImpairmentToPractice } = candidate;
    
    if (!hasImpairmentToPractice) {
      flags.push({
        category: 'Impairment to Practice',
        field: 'hasImpairmentToPractice',
        status: 'Green',
        message: 'Candidate has no impairment to practice'
      });
    } else {
      flags.push({
        category: 'Impairment to Practice',
        field: 'hasImpairmentToPractice',
        status: 'Red',
        message: 'Candidate has impairment to practice'
      });
    }
  }
}