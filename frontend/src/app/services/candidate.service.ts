import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timeout, catchError, throwError, retry } from 'rxjs';
import { Candidate } from '../models/candidate.model';
import { ApiResponse, EvaluationResult, Flag, CandidateEvaluationResponse } from '../models/flag.model';

interface StoredCandidate {
  id: string;
  candidate: Candidate;
  evaluation: EvaluationResult;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})


export class CandidateService {
  private apiUrl = 'http://localhost:5000/api/candidates';

  constructor(private http: HttpClient) { }
  
  evaluateCandidate(candidate: Candidate): Observable<CandidateEvaluationResponse> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    // Create a copy to avoid modifying the original
    const preparedCandidate = JSON.parse(JSON.stringify(candidate));
    
    // Ensure englishProficiency score is correctly handled (keep as string)
    if (preparedCandidate.englishProficiency && 
        preparedCandidate.englishProficiency.score !== null) {
      preparedCandidate.englishProficiency.score = 
        preparedCandidate.englishProficiency.score.toString();
    }
    
    return this.http.post<CandidateEvaluationResponse>(`${this.apiUrl}/evaluate`, preparedCandidate, { headers })
      .pipe(
        timeout(60000), // Increase timeout to 60 seconds for large responses
        catchError(error => {
          if (error.name === 'TimeoutError') {
            return throwError(() => new Error('Request timed out. The server took too long to respond.'));
          }
          return throwError(() => error);
        })
      );
  }
  
  updateFlagStatus(candidateId: string, flagId: string, acknowledged: boolean, overridden: boolean): Observable<ApiResponse> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const url = `${this.apiUrl}/${candidateId}/flags/${flagId}`;
    
    return this.http.patch<ApiResponse>(url, { acknowledged, overridden }, { headers })
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
  
  getAllCandidates(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}`)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
  
  getCandidateById(candidateId: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${candidateId}`)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
  getAllStoredCandidates(): Observable<{success: boolean, data?: StoredCandidate[], message?: string}> {
  return this.http.get<{success: boolean, data?: StoredCandidate[], message?: string}>(`${this.apiUrl}/stored`)
    .pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
}
}