export type FlagType = 'Red' | 'Green';

export interface Flag {
  category: string;
  field: string;
  status: FlagType;
  message: string;
}

export interface EvaluationResult {
  isEligible: boolean;
  flags: Flag[];
} 