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
import { Badge, BadgeModule } from 'primeng/badge';

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
    ProgressSpinnerModule,
    BadgeModule
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
  @Input() showOnlyOverride: boolean = false;
  
  redFlags: Flag[] = [];
  greenFlags: Flag[] = [];
  
  private _cachedCategories: { category: string, flags: Flag[] }[] | null = null;
  private _lastProcessedFlags: Flag[] | null = null;
  
  countRedFlags: number = 0;
  countGreenFlags: number = 0;

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
    this.calculateFlagCounts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['evaluationResult'] && this.evaluationResult) {
      this.categorizeFlags();
      
      if (!this.candidateId && this.evaluationResult && 'candidateId' in this.evaluationResult) {
        this.candidateId = this.evaluationResult.candidateId as string;
      }
    }

    if (this.flags) {
      this.calculateFlagCounts();
    }
  }

  private renderInChunks() {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
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
  }
  
  getSeverity(status: string): string {
    return status === 'Red' ? 'danger' : 'success';
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
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update flag status: ' + (error.message || 'Unknown error')
        });
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