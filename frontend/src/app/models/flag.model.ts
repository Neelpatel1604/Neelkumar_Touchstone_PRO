export interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface EvaluationResult {
  isEligible: boolean;
  flags: Flag[];
  candidateId?: string;
}

export type FlagType = 'Red' | 'Green';

export interface Flag {
  id: string;
  category: string;
  field: string;
  status: 'Red' | 'Green' | string;
  message: string;
  acknowledged?: boolean;
  overridden?: boolean;
}

// Add a specific response type for candidate evaluation
export interface CandidateEvaluationResponse {
  success: boolean;
  data?: {
    isEligible: boolean;
    flags: Flag[];
    candidateId: string;
  };
  message?: string;
}