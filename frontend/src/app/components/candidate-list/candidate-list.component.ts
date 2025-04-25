import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CandidateService } from '../../services/candidate.service';
import { Candidate } from '../../models/candidate.model';
import { FlagTableComponent } from '../flag-table/flag-table.component';
import { EvaluationResult } from '../../models/flag.model';

interface StoredCandidate {
  id: string;
  candidate: Candidate;
  evaluation: EvaluationResult;
  timestamp: string;
}

interface PaginatedResponse {
  candidates: StoredCandidate[];
  pagination?: any;
}

@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    CardModule,
    ButtonModule,
    ToastModule,
    TagModule,
    DialogModule,
    FlagTableComponent,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './candidate-list.component.html',
  styleUrl: './candidate-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandidateListComponent implements OnInit {
  candidates: StoredCandidate[] = [];
  loading = false;
  selectedCandidate: StoredCandidate | null = null;
  showDialog = false;

  constructor(
    private candidateService: CandidateService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCandidates();
  }

  loadCandidates(): void {
    this.loading = true;
    this.candidateService.getAllStoredCandidates().subscribe({
      next: (response) => {
        console.log('Received response:', response);
        if (response.success && response.data) {
          // Ensure candidates is always an array
          if (Array.isArray(response.data)) {
            this.candidates = response.data;
          } else if (response.data && typeof response.data === 'object' && 'candidates' in response.data) {
            this.candidates = (response.data as PaginatedResponse).candidates;
          } else {
            console.error('Unexpected data format:', response.data);
            this.candidates = [];
          }
          
          console.log('Parsed candidates:', this.candidates);
          
          // Ensure each candidate has the correct structure
          this.candidates = this.candidates.map(candidate => {
            // Make sure evaluation.flags is always an array
            if (!candidate.evaluation.flags || !Array.isArray(candidate.evaluation.flags)) {
              candidate.evaluation.flags = [];
            }
            return candidate;
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load candidates: ' + (response.message || 'Unknown error')
          });
          this.candidates = [];
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading candidates:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load candidates: ' + (error.message || 'Unknown error')
        });
        this.loading = false;
        this.candidates = [];
        this.cdr.markForCheck();
      }
    });
  }

  formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }

  getEligibilityStatus(evaluation: EvaluationResult): string {
    return evaluation.isEligible ? 'Eligible' : 'Not Eligible';
  }

  getEligibilitySeverity(evaluation: EvaluationResult): string {
    return evaluation.isEligible ? 'success' : 'danger';
  }

  countFlags(evaluation: EvaluationResult, type: 'Red' | 'Green'): number {
    return evaluation.flags.filter(flag => flag.status === type).length;
  }

  viewCandidate(candidate: StoredCandidate): void {
    this.selectedCandidate = candidate;
    this.showDialog = true;
    this.cdr.markForCheck();
  }

  closeDialog(): void {
    this.showDialog = false;
    this.selectedCandidate = null;
    this.cdr.markForCheck();
  }

  refreshList(): void {
    this.loadCandidates();
  }
}