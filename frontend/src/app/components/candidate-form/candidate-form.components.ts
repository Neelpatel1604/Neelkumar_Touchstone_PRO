import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService, MenuItem } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { StepsModule } from 'primeng/steps';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { Candidate } from '../../models/candidate.model';
import { CandidateService } from '../../services/candidate.service';
import { FlagTableComponent } from '../flag-table/flag-table.component';
import { EvaluationResult } from '../../models/flag.model';

@Component({
  selector: 'app-candidate-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    RadioButtonModule,
    InputNumberModule,
    ButtonModule,
    CardModule,
    ToastModule,
    CheckboxModule,
    FlagTableComponent,
    StepsModule,
    PanelModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService, CandidateService],
  templateUrl: './candidate-form.components.html',
  styleUrl: './candidate-form.components.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandidateFormComponent implements OnInit {
  candidateForm!: FormGroup;
  legalStatusOptions = [
    { label: 'Permanent Resident', value: 'Permanent Resident' },
    { label: 'Canadian Citizen', value: 'Canadian Citizen' },
    { label: 'Other', value: 'Other' }
  ];
  tdmOptions = [
    { label: 'Passed', value: 'Passed' },
    { label: 'Failed', value: 'Failed' },
    { label: 'Not Taken', value: 'Not Taken' }
  ];
  englishProficiencyTypes = [
    { label: 'IELTS', value: 'IELTS' },
    { label: 'OET', value: 'OET' },
    { label: 'CELPIP', value: 'CELPIP' },
    { label: 'Recent Practice', value: 'Recent Practice' }
  ];
  
  evaluationResult: EvaluationResult | null = null;
  candidateId: string | null = null;
  submitting = false;
  items: MenuItem[] = [];
  activeIndex: number = 0;

  constructor(
    private fb: FormBuilder,
    private candidateService: CandidateService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.items = [
      { label: 'Personal Information', command: (event) => this.activeIndex = 0 },
      { label: 'Medical Education', command: (event) => this.activeIndex = 1 },
      { label: 'Examinations', command: (event) => this.activeIndex = 2 },
      { label: 'Practice & License', command: (event) => this.activeIndex = 3 },
      { label: 'Proficiency & Training', command: (event) => this.activeIndex = 4 },
      { label: 'Final Details', command: (event) => this.activeIndex = 5 }
    ];
  }

  initForm(): void {
    this.candidateForm = this.fb.group({
      // Personal Information
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: ['', Validators.required],
      legalStatus: ['', Validators.required],
      
      // Medical Education
      medicalSchool: ['', Validators.required],
      degree: ['', Validators.required],
      graduationYear: [null, [Validators.required, Validators.min(1950), Validators.max(new Date().getFullYear())]],
      languageOfEducation: ['', Validators.required],
      
      // Examinations
      nacDate: [''],
      mccqe1Date: [''],
      mccqe2Date: [''],
      
      // TDM Results
      writtenTDM: ['', Validators.required],
      
      // License
      hasCanadianDrivingLicense: [false],
      
      // Practice Experience
      practiceHours: [0, [Validators.required, Validators.min(0)]],
      
      // English Proficiency
      englishProficiency: this.fb.group({
        type: ['IELTS', Validators.required],
        score: [null],
        recentPracticePercentage: [null]
      }),
      
      // Postgraduate Training
      postGradTraining: this.fb.group({
        completed: [false],
        months: [0, [Validators.min(0)]],
        independentPracticeMonths: [0, [Validators.min(0)]]
      }),
      
      // Rotations
      rotationsCompleted: [0, [Validators.required, Validators.min(0)]],
      
      // Impairment
      hasImpairmentToPractice: [false]
    });

    // Add conditional validation based on English proficiency type
    this.candidateForm.get('englishProficiency.type')?.valueChanges.subscribe(type => {
      const scoreControl = this.candidateForm.get('englishProficiency.score');
      const percentageControl = this.candidateForm.get('englishProficiency.recentPracticePercentage');
      
      // Reset controls
      scoreControl?.clearValidators();
      percentageControl?.clearValidators();
      
      if (type === 'Recent Practice') {
        percentageControl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      } else {
        scoreControl?.setValidators([Validators.required]);
      }
      
      scoreControl?.updateValueAndValidity();
      percentageControl?.updateValueAndValidity();
    });
  }

  onSubmit(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    if (this.candidateForm.invalid) {
      this.markFormGroupTouched(this.candidateForm);
      this.messageService.add({
        severity: 'error',
        summary: 'Form Error',
        detail: 'Please fill in all required fields correctly.'
      });
      return;
    }

    this.submitting = true;
    this.cdr.markForCheck();
    
    const candidate: Candidate = this.candidateForm.value;

    // Show loading message
    this.messageService.add({
      severity: 'info',
      summary: 'Processing',
      detail: 'Evaluating candidate...'
    });

    console.log('Form data being submitted:', candidate);

    this.candidateService.evaluateCandidate(candidate).subscribe({
      next: (response) => {
        console.log('Response received:', response);
        this.submitting = false;
        
        if (response && response.success === true && response.data) {
          // Create a clean copy without circular references
          const cleanResult = JSON.parse(JSON.stringify(response.data));
          this.evaluationResult = cleanResult;
          this.candidateId = cleanResult.candidateId || null;
          
          console.log('Setting evaluation result:', this.evaluationResult);
          console.log('Setting candidate ID:', this.candidateId);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Candidate has been evaluated successfully.'
          });
          
          // Force change detection to update the UI with the new evaluationResult
          this.cdr.markForCheck();
        } else {
          console.error('Response not successful', response);
          this.messageService.add({
            severity: 'error',
            summary: 'Evaluation Failed',
            detail: response?.message || 'Server returned an unsuccessful response.'
          });
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        console.error('Evaluation error details:', error);
        this.submitting = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to evaluate candidate: ' + (error.message || 'Unknown error')
        });
        this.cdr.markForCheck();
      }
    });
  }

  // Helper method to mark all controls in a form group as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  resetForm(): void {
    this.candidateForm.reset();
    this.evaluationResult = null;
    this.candidateId = null;
    this.initForm();
    this.cdr.markForCheck();
  }

  nextStep() {
    if (this.activeIndex < 5) {
      this.activeIndex++;
      window.scrollTo(0, 0);
      this.cdr.markForCheck();
    }
  }

  previousStep() {
    if (this.activeIndex > 0) {
      this.activeIndex--;
      window.scrollTo(0, 0);
      this.cdr.markForCheck();
    }
  }
}