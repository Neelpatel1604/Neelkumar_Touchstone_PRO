import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidate } from '../models/candidate.model';
import { ApiResponse } from '../models/flag.model';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private apiUrl = 'http://localhost:5000/evaluate';

  constructor(private http: HttpClient) { }

  evaluateCandidate(candidate: Candidate): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, candidate);
  }
}