
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

export interface EvaluationResult {
  isEligible: boolean;
  flags: Flag[];
  candidateId?: string;
}