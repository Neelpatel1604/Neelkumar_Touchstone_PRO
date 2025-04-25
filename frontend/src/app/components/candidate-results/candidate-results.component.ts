import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { Flag, EvaluationResult } from '../../models/flag.model';
import { CandidateService } from '../../services/candidate.service';

@Component({
  selector: 'app-candidate-results',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    CheckboxModule,
    FormsModule,
    CardModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './candidate-results.component.html',
  styleUrls: ['./candidate-results.component.css']
})
export class CandidateResultsComponent implements OnChanges {
  @Input() evaluationResult: EvaluationResult | null = null;
  @Input() candidateId: string | null = null;
  
  flags: Flag[] = [];
  countRedFlags: number = 0;
  countGreenFlags: number = 0;
  
  constructor(
    private candidateService: CandidateService,
    private messageService: MessageService
  ) {}
  
  ngOnChanges() {
    if (this.evaluationResult && this.evaluationResult.flags) {
      this.flags = this.evaluationResult.flags;
      console.log('Flags received with IDs:', this.flags.map(f => ({ id: f.id, status: f.status })));
      this.calculateFlagCounts();
    }
  }
  
  calculateFlagCounts() {
    this.countRedFlags = this.flags.filter(flag => flag.status === 'Red' && !flag.overridden).length;
    this.countGreenFlags = this.flags.filter(flag => flag.status === 'Green' || flag.overridden).length;
  }
  
  updateFlag(flag: Flag) {
    if (!this.candidateId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot update flag: Candidate ID is missing'
      });
      return;
    }
    
    // Check if flag.id exists before updating
    if (!flag.id) {
      console.error('Flag ID is missing', flag);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot update flag: Flag ID is missing'
      });
      return;
    }
    
    console.log('Updating flag:', flag);
    this.candidateService.updateFlagStatus(
      this.candidateId, 
      flag.id, 
      flag.acknowledged || false, 
      flag.overridden || false
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Flag status updated successfully'
          });
          
          // Update eligibility if provided in response
          if (response.data && response.data.isEligible !== undefined && this.evaluationResult) {
            this.evaluationResult.isEligible = response.data.isEligible;
          }
          
          // Recalculate flag counts
          this.calculateFlagCounts();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to update flag status'
          });
        }
      },
      error: (error) => {
        console.error('Error updating flag:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update flag status: ' + (error.message || 'Unknown error')
        });
      }
    });
  }
} 