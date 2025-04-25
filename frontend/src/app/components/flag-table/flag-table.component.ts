import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, NgZone, AfterViewInit, OnInit } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './flag-table.component.html',
  styleUrl: './flag-table.component.css'
})
export class FlagTableComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() evaluationResult: EvaluationResult | null = null;
  @Input() candidateId: string | null = null;
  @Input() flags: Flag[] = [];
  @Input() submitting: boolean = false;
  
  redFlags: Flag[] = [];
  greenFlags: Flag[] = [];
  
  private _cachedCategories: { category: string, flags: Flag[] }[] | null = null;
  private _lastProcessedFlags: Flag[] | null = null;

  ngAfterViewInit() {
    if (this.flags.length > 5) {
      this.renderInChunks();
    }
  }

  constructor(
    private candidateService: CandidateService,
    private messageService: MessageService,
    private ngZone: NgZone
  ) {}
  
  ngOnInit() {
    console.log('Flag table initialized with:', {
      flags: this.flags?.length || 0,
      candidateId: this.candidateId
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Flag table inputs changed:', {
      flags: this.flags?.length || 0,
      candidateId: this.candidateId
    });
    
    if (changes['evaluationResult'] && this.evaluationResult) {
      this.categorizeFlags();
      
      if (!this.candidateId && this.evaluationResult && 'candidateId' in this.evaluationResult) {
        this.candidateId = this.evaluationResult.candidateId as string;
      }
      
      console.log('FlagTable received candidateId:', this.candidateId);
      console.log('FlagTable received flags count:', this.evaluationResult?.flags?.length || 0);
    }

    console.log('Flag-table received flags:', this.flags);
    console.log('Flag-table received candidateId:', this.candidateId);
  }

  private renderInChunks() {
    // Use NgZone.runOutsideAngular to avoid triggering change detection
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        // Run any heavy calculations here
        this.ngZone.run(() => {
          // Then update the UI when ready
        });
      }, 0);
    });
  }

  categorizeFlags(): void {
    if (!this.evaluationResult) return;
    
    this.redFlags = this.evaluationResult?.flags?.filter(flag => flag.status === 'Red') || [];
    this.greenFlags = this.evaluationResult?.flags?.filter(flag => flag.status === 'Green') || [];
    
    console.log('Red flags:', this.redFlags.length);
    console.log('Green flags:', this.greenFlags.length);
  }
  
  getSeverity(status: string): string {
    return status === 'Red' ? 'danger' : 'success';
  }
  
  acknowledgeFlag(flag: Flag, event?: Event): void {
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
        
        flag.overridden = !flag.overridden;
      }
    });
  }
  
  getFlagsByCategoryForDisplay(flags: Flag[]): { category: string, flags: Flag[] }[] {
    if (!this._cachedCategories || this._lastProcessedFlags !== flags) {
      const flagsByCategory: { [key: string]: Flag[] } = {};
      
      for (const flag of flags) {
        if (!flagsByCategory[flag.category]) {
          flagsByCategory[flag.category] = [];
        }
        flagsByCategory[flag.category].push(flag);
      }
      
      this._cachedCategories = Object.keys(flagsByCategory).map(category => ({
        category,
        flags: flagsByCategory[category]
      }));
      
      this._lastProcessedFlags = flags;
    }
    
    return this._cachedCategories;
  }
  
  resetForm(): void {
    this.evaluationResult = null;
    this.candidateId = null;
    this.redFlags = [];
    this.greenFlags = [];
    this._cachedCategories = null;
    this._lastProcessedFlags = null;
  }
}