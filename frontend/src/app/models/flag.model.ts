export type FlagType = 'Red' | 'Green';

export interface Flag {
  category: string;
  field: string;
  status: FlagType;
  message: string;
  acknowledged?: boolean;
  overridden?: boolean;
}

export interface EvaluationResult {
  isEligible: boolean;
  flags: Flag[];
}

export interface ApiResponse {
  success: boolean;
  data: EvaluationResult;
  message?: string;
}