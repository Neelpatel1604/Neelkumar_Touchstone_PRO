// New file: backend/src/services/storageService.ts
import fs from 'fs';
import path from 'path';
import { Candidate } from '../models/Candidate';
import { EvaluationResult, Flag } from '../models/Flag';
import { v4 as uuidv4 } from 'uuid';

interface StoredCandidate {
  id: string;
  candidate: Candidate;
  evaluation: EvaluationResult;
  timestamp: string;
}

export class StorageService {
  private dataFilePath: string;
  private candidates: StoredCandidate[] = [];

  constructor() {
    this.dataFilePath = path.join(__dirname, '../../data/candidates.json');
    this.ensureDataFileExists();
    this.loadData();
  }

  private ensureDataFileExists(): void {
    const dir = path.dirname(this.dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.dataFilePath)) {
      fs.writeFileSync(this.dataFilePath, JSON.stringify([], null, 2));
    }
  }

  private loadData(): void {
    try {
      const data = fs.readFileSync(this.dataFilePath, 'utf8');
      this.candidates = JSON.parse(data);
    } catch (error) {
      console.error('Error loading data:', error);
      this.candidates = [];
    }
  }

  private saveData(): void {
    try {
      fs.writeFileSync(this.dataFilePath, JSON.stringify(this.candidates, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  storeCandidate(candidate: Candidate, evaluation: EvaluationResult): string {
    const id = uuidv4();
    
    // Update the flags model to include acknowledged and overridden properties
    const updatedEvaluation: EvaluationResult = {
        ...evaluation,
        flags: evaluation.flags.map(flag => ({
          ...flag,
          id: flag.id || uuidv4(), // Preserve existing ID or generate new one
          acknowledged: flag.acknowledged !== undefined ? flag.acknowledged : false,
          overridden: flag.overridden !== undefined ? flag.overridden : false
        }))
      };
    
    this.candidates.push({
      id,
      candidate,
      evaluation: updatedEvaluation,
      timestamp: new Date().toISOString()
    });
    
    this.saveData();
    return id;
  }

  getAllCandidates(): StoredCandidate[] {
    return this.candidates;
  }

  getCandidateById(candidateId: string): StoredCandidate | undefined {
    return this.candidates.find(c => c.id === candidateId);
  }

  updateFlagStatus(candidateId: string, flagId: string, acknowledged: boolean, overridden: boolean): boolean {
    const candidateIndex = this.candidates.findIndex(c => c.id === candidateId);
    
    if (candidateIndex === -1) {
      console.error(`Candidate with ID ${candidateId} not found`);
      return false;
    }
    
    const candidate = this.candidates[candidateIndex];
    
    // Find the flag by id in the evaluation results
    let flagFound = false;
    const updatedFlags = candidate.evaluation.flags.map(flag => {
      if (flag.id === flagId) {
        flagFound = true;
        return {
          ...flag,
          acknowledged,
          overridden
        };
      }
      return flag;
    });
    
    if (!flagFound) {
      console.error(`Flag with ID ${flagId} not found for candidate ${candidateId}`);
      return false;
    }
    
    // Update the evaluation result with the modified flags
    this.candidates[candidateIndex].evaluation.flags = updatedFlags;
    
    // Recalculate eligibility if any flags are overridden
    if (overridden) {
      const hasActiveRedFlags = updatedFlags.some(
        flag => flag.status === 'Red' && !flag.overridden
      );
      
      this.candidates[candidateIndex].evaluation.isEligible = !hasActiveRedFlags;
    }
    
    // Save the updated data
    this.saveData();
    return true;
  }
}