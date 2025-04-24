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

import { EvaluationResult, Flag } from '../../models/flag.model';

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
    MessageModule
  ],
  templateUrl: './flag-table.component.html',
  styleUrl: './flag-table.component.css'
})
export class FlagTableComponent implements OnChanges {
  @Input() evaluationResult: EvaluationResult | null = null;
  
  redFlags: Flag[] = [];
  greenFlags: Flag[] = [];
  
  constructor() {}
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['evaluationResult'] && this.evaluationResult) {
      this.categorizeFlags();
    }
  }
  
  categorizeFlags(): void {
    if (!this.evaluationResult) return;
    
    this.redFlags = this.evaluationResult.flags.filter(flag => flag.status === 'Red');
    this.greenFlags = this.evaluationResult.flags.filter(flag => flag.status === 'Green');
  }
  
  getSeverity(status: string): string {
    return status === 'Red' ? 'danger' : 'success';
  }
  
  acknowledgeFlag(flag: Flag): void {
    flag.acknowledged = !flag.acknowledged;
  }
  
  overrideFlag(flag: Flag): void {
    flag.overridden = !flag.overridden;
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
}