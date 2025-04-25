
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
  private lastSave: number = 0;
  private saveQueue: Promise<void> = Promise.resolve();
  private saveThrottleMs: number = 500; // Throttle writes

  constructor() {
    this.dataFilePath = path.join(__dirname, '../../data/candidates.json');
    this.candidates = [];
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await this.ensureDataFileExists();
      await this.loadData();
      console.log('Storage service initialized successfully');
    } catch (error) {
      console.error('Error initializing storage service:', error);
    }
  }

  private ensureDataFileExists(): Promise<void> {
    return new Promise((resolve, reject) => {
      const dir = path.dirname(this.dataFilePath);
      
      // Check if directory exists
      fs.access(dir, (err) => {
        if (err) {
          // Create directory if it doesn't exist
          fs.mkdir(dir, { recursive: true }, (mkdirErr) => {
            if (mkdirErr) {
              reject(mkdirErr);
              return;
            }
            
            // Check if file exists
            fs.access(this.dataFilePath, (accessErr) => {
              if (accessErr) {
                // Create empty file if it doesn't exist
                fs.writeFile(this.dataFilePath, JSON.stringify([], null, 2), (writeErr) => {
                  if (writeErr) {
                    reject(writeErr);
                  } else {
                    resolve();
                  }
                });
              } else {
                resolve();
              }
            });
          });
        } else {
          // Directory exists, check if file exists
          fs.access(this.dataFilePath, (accessErr) => {
            if (accessErr) {
              // Create empty file if it doesn't exist
              fs.writeFile(this.dataFilePath, JSON.stringify([], null, 2), (writeErr) => {
                if (writeErr) {
                  reject(writeErr);
                } else {
                  resolve();
                }
              });
            } else {
              resolve();
            }
          });
        }
      });
    });
  }

  private loadData(): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.readFile(this.dataFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error loading data:', err);
          this.candidates = [];
          resolve();
        } else {
          try {
            this.candidates = JSON.parse(data);
            resolve();
          } catch (parseError) {
            console.error('Error parsing JSON data:', parseError);
            this.candidates = [];
            resolve();
          }
        }
      });
    });
  }

  private saveData(): Promise<void> {
    const now = Date.now();
    
    // If a save was performed recently, delay the next save
    if (now - this.lastSave < this.saveThrottleMs) {
      const delay = this.saveThrottleMs - (now - this.lastSave);
      
      // Queue this save operation
      this.saveQueue = this.saveQueue
        .then(() => new Promise(resolve => setTimeout(resolve, delay)))
        .then(() => this.actualSave());
      
      return this.saveQueue;
    }
    
    // Otherwise perform the save immediately
    this.saveQueue = this.actualSave();
    return this.saveQueue;
  }

  private actualSave(): Promise<void> {
    this.lastSave = Date.now();
    return new Promise((resolve, reject) => {
      fs.writeFile(
        this.dataFilePath, 
        JSON.stringify(this.candidates, null, 2), 
        'utf8',
        (err) => {
          if (err) {
            console.error('Error saving data:', err);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async storeCandidate(candidate: Candidate, evaluation: EvaluationResult): Promise<string> {
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
    
    // Save data asynchronously
    await this.saveData();
    return id;
  }

  getAllCandidates(): StoredCandidate[] {
    return this.candidates;
  }

  getCandidateById(candidateId: string): StoredCandidate | undefined {
    return this.candidates.find(c => c.id === candidateId);
  }

  async updateFlagStatus(candidateId: string, flagId: string, acknowledged: boolean, overridden: boolean): Promise<boolean> {
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
    
    // Save the updated data asynchronously
    await this.saveData();
    return true;
  }

  // Get paginated candidates to avoid loading the entire dataset at once
  getPaginatedCandidates(page: number = 1, pageSize: number = 20): {
    candidates: StoredCandidate[],
    total: number,
    page: number,
    pageSize: number,
    totalPages: number
  } {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedCandidates = this.candidates.slice(start, end);
    
    return {
      candidates: paginatedCandidates,
      total: this.candidates.length,
      page,
      pageSize,
      totalPages: Math.ceil(this.candidates.length / pageSize)
    };
  }
}