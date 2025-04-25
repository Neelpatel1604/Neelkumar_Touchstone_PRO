// frontend/src/app/models/flag.model.ts
export interface ApiResponse {
  success: boolean;
  data?: EvaluationResult;
  message?: string;
}

export interface EvaluationResult {
  isEligible: boolean;
  flags: Flag[];
  candidateId?: string;
}

export type FlagType = 'Red' | 'Green';

export interface Flag {
  id?: string;
  category: string;
  field: string;
  status: FlagType;
  message: string;
  acknowledged?: boolean;
  overridden?: boolean;
}