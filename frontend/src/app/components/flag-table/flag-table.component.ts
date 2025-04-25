import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { EvaluationResult, Flag } from '../../models/flag.model';
import { CandidateService } from '../../services/candidate.service';

@Component({
  selector: 'app-flag-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    CheckboxModule,
    CardModule,
    MessagesModule,
    MessageModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './flag-table.component.html',
  styleUrl: './flag-table.component.css'
})
export class FlagTableComponent implements OnChanges {
  @Input() evaluationResult: EvaluationResult | null = null;
  @Input() candidateId: string | null = null;
  
  redFlags: Flag[] = [];
  greenFlags: Flag[] = [];
  
  submitting = false;
  
  constructor(
    private candidateService: CandidateService,
    private messageService: MessageService
  ) {}
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['evaluationResult'] && this.evaluationResult) {
      this.categorizeFlags();
      
      // If candidateId wasn't provided directly but is in the evaluationResult
      if (!this.candidateId && this.evaluationResult && 'candidateId' in this.evaluationResult) {
        this.candidateId = this.evaluationResult.candidateId as string;
      }
      
      console.log('FlagTable received candidateId:', this.candidateId);
      console.log('FlagTable received flags:', this.evaluationResult.flags);
    }
  }
  
  categorizeFlags(): void {
    if (!this.evaluationResult) return;
    
    this.redFlags = this.evaluationResult.flags.filter(flag => flag.status === 'Red');
    this.greenFlags = this.evaluationResult.flags.filter(flag => flag.status === 'Green');
    
    console.log('Red flags:', this.redFlags.length);
    console.log('Green flags:', this.greenFlags.length);
  }
  
  getSeverity(status: string): string {
    return status === 'Red' ? 'danger' : 'success';
  }
  
  acknowledgeFlag(flag: Flag, event?: Event): void {
    // Add stop propagation to prevent event bubbling
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!this.candidateId || !flag.id) {
      console.warn('Cannot update flag - missing data:', { 
        candidateId: this.candidateId, 
        flagId: flag.id 
      });
      
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot update flag: Missing candidate ID or flag ID'
      });
      return;
    }
    
    console.log('Acknowledging flag:', flag.id, 'for candidate:', this.candidateId);
    flag.acknowledged = !flag.acknowledged;
    
    this.candidateService.updateFlagStatus(
      this.candidateId,
      flag.id,
      flag.acknowledged || false,
      flag.overridden || false
    ).subscribe({
      next: (response) => {
        console.log('Flag acknowledgment response:', response);
        
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Flag has been ${flag.acknowledged ? 'acknowledged' : 'unacknowledged'}`
          });
          
          // Update the evaluation result if returned
          if (response.data) {
            this.evaluationResult = response.data;
            this.categorizeFlags();
          }
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to update flag status'
          });
        }
      },
      error: (error) => {
        console.error('Error updating flag status:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update flag status: ' + (error.message || 'Unknown error')
        });
        
        // Revert the UI change since the server update failed
        flag.acknowledged = !flag.acknowledged;
      }
    });
  }
  
  overrideFlag(flag: Flag, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!this.candidateId || !flag.id) {
      console.warn('Cannot override flag - missing data:', { 
        candidateId: this.candidateId, 
        flagId: flag.id 
      });
      
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot override flag: Missing candidate ID or flag ID'
      });
      return;
    }
    
    console.log('Overriding flag:', flag.id, 'for candidate:', this.candidateId);
    flag.overridden = !flag.overridden;
    
    this.candidateService.updateFlagStatus(
      this.candidateId,
      flag.id,
      flag.acknowledged || false,
      flag.overridden || false
    ).subscribe({
      next: (response) => {
        console.log('Flag override response:', response);
        
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Flag has been ${flag.overridden ? 'overridden' : 'reset to original status'}`
          });
          
          // Update the evaluation result if returned
          if (response.data) {
            this.evaluationResult = response.data;
            this.categorizeFlags();
          }
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to override flag'
          });
        }
      },
      error: (error) => {
        console.error('Error overriding flag:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to override flag: ' + (error.message || 'Unknown error')
        });
        
        // Revert the UI change since the server update failed
        flag.overridden = !flag.overridden;
      }
    });
  }
  
  getFlagsByCategoryForDisplay(flags: Flag[]): { category: string, flags: Flag[] }[] {
    const flagsByCategory: { [key: string]: Flag[] } = {};
    
    flags.forEach(flag => {
      if (!flagsByCategory[flag.category]) {
        flagsByCategory[flag.category] = [];
      }
      flagsByCategory[flag.category].push(flag);
    });
    
    return Object.keys(flagsByCategory).map(category => ({
      category,
      flags: flagsByCategory[category]
    }));
  }
  
  resetForm(): void {
    // Reset any state if needed
    this.evaluationResult = null;
    this.candidateId = null;
    this.redFlags = [];
    this.greenFlags = [];
  }
}