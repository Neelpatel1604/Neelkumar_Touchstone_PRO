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
  template: `
    <div>
      <p-card header="Candidate Evaluation Results">
        <div class="evaluation-summary mb-3">
          <h3>Eligibility Status: 
            <span [ngClass]="{'text-success': evaluationResult?.isEligible, 'text-danger': !evaluationResult?.isEligible}">
              {{evaluationResult?.isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}}
            </span>
          </h3>
        </div>
        
        <!-- Flag counts -->
        <div class="mb-3">
          <span class="p-badge p-badge-success mr-2">
            {{countGreenFlags}} Green Flags
          </span>
          <span class="p-badge p-badge-danger">
            {{countRedFlags}} Red Flags
          </span>
        </div>
        
        <!-- Flags Table -->
        <p-table [value]="flags" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Category</th>
              <th>Field</th>
              <th>Status</th>
              <th>Message</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-flag>
            <tr>
              <td>{{flag.category}}</td>
              <td>{{flag.field}}</td>
              <td>
                <span [ngClass]="{'text-success': flag.status === 'Green', 'text-danger': flag.status === 'Red'}">
                  {{flag.status}}
                </span>
                <span *ngIf="flag.overridden" class="p-badge p-badge-warning p-badge-sm ml-2">Overridden</span>
              </td>
              <td>{{flag.message}}</td>
              <td>
                <div class="flag-actions">
                  <p-checkbox [(ngModel)]="flag.acknowledged" 
                            [binary]="true"
                            (onChange)="updateFlag(flag)"
                            label="Acknowledge">
                  </p-checkbox>
                  
                  <p-checkbox *ngIf="flag.status === 'Red'"
                            [(ngModel)]="flag.overridden" 
                            [binary]="true"
                            (onChange)="updateFlag(flag)"
                            label="Override"
                            class="ml-3">
                  </p-checkbox>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
      
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .text-success { color: #28a745; }
    .text-danger { color: #dc3545; }
    .p-badge-success { background-color: #28a745; }
    .p-badge-danger { background-color: #dc3545; }
    .p-badge-warning { background-color: #ffc107; color: #000; }
    .mr-2 { margin-right: 0.5rem; }
    .ml-2 { margin-left: 0.5rem; }
    .ml-3 { margin-left: 0.75rem; }
    .mb-3 { margin-bottom: 0.75rem; }
  `]
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