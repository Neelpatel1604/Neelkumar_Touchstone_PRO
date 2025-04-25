import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
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
import { DOCUMENT } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { NgZone } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CandidateResultsComponent } from '../candidate-results/candidate-results.component';

import { Candidate } from '../../models/candidate.model';
import { CandidateService } from '../../services/candidate.service';
import { FlagTableComponent } from '../flag-table/flag-table.component';
import { EvaluationResult } from '../../models/flag.model';
import { Flag } from '../../models/flag.model';

@Component({
  selector: 'app-candidate-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    DatePickerModule,
    RadioButtonModule,
    InputNumberModule,
    ButtonModule,
    CardModule,
    ToastModule,
    CheckboxModule,
    FlagTableComponent,
    StepsModule,
    PanelModule,
    ProgressSpinnerModule,
    SelectModule,
    TableModule,
    CandidateResultsComponent
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

  // Add this property to test flag-table component
  testFlags: Flag[] = [
    { 
      id: 'test1', 
      category: 'Test', 
      field: 'test', 
      status: 'Red', 
      message: 'Test flag', 
      acknowledged: false, 
      overridden: false 
    },
    { 
      id: 'test2', 
      category: 'Test', 
      field: 'test2', 
      status: 'Green', 
      message: 'Test flag 2', 
      acknowledged: false, 
      overridden: false 
    }
  ];

  constructor(
    private fb: FormBuilder,
    private candidateService: CandidateService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
    private ngZone: NgZone
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
    this.evaluationResult = null; // Clear previous results
    this.cdr.detectChanges(); // Force immediate update
    
    const candidate: Candidate = this.candidateForm.value;

    this.messageService.add({
      severity: 'info',
      summary: 'Processing',
      detail: 'Evaluating candidate...',
      life: 5000
    });

    console.log('Form data being submitted:', candidate);

    // Simplified approach
    this.candidateService.evaluateCandidate(candidate).subscribe({
      next: (response) => {
        console.log('Response received:', response);
        
        if (response?.success && response?.data) {
          console.log('Setting data from response');
          
          // First update just the essential data
          this.candidateId = response.data.candidateId || null;
          this.submitting = false;
          this.cdr.detectChanges(); // Force update
          
          // Type check and cast the data properly
          if (this.isEvaluationResult(response.data)) {
            // Then add the full evaluation result after a brief delay
            setTimeout(() => {
              // Make sure all flags have IDs by generating them if needed
              const flagsWithIds = response.data!.flags.map(flag => {
                // If flag doesn't have an ID, generate one
                if (!flag.id) {
                  // Generate a random ID using a timestamp and random string
                  const randomId = 'flag_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
                  return { ...flag, id: randomId };
                }
                return flag;
              });

              // Create a clean copy and properly cast it to EvaluationResult
              this.evaluationResult = {
                isEligible: response.data!.isEligible ?? false,
                flags: flagsWithIds,
                candidateId: response.data!.candidateId || ''
              };
              
              console.log('Setting evaluation result with generated flag IDs:', this.evaluationResult);
              console.log('Setting candidate ID:', this.candidateId);
              
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Candidate has been evaluated successfully.'
              });
              
              this.cdr.detectChanges(); // Force update again
              
              // Add this to scroll to evaluation results
              setTimeout(() => {
                const resultsElement = document.querySelector('.evaluation-summary');
                if (resultsElement) {
                  resultsElement.scrollIntoView({ behavior: 'smooth' });
                }
              }, 200);
            }, 100);
          } else {
            console.error('Response data is not in expected format:', response.data);
            this.messageService.add({
              severity: 'error',
              summary: 'Data Format Error',
              detail: 'The response from the server is not in the expected format.'
            });
            this.submitting = false;
            this.cdr.detectChanges();
          }
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Evaluation Failed',
            detail: response?.message || 'Server returned an unsuccessful response.'
          });
          this.submitting = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Evaluation error:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to evaluate candidate: ' + (error.message || 'Unknown error')
        });
        this.submitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Add this helper method to check the response type
  private isEvaluationResult(data: any): data is EvaluationResult {
    return data && 
      typeof data.isEligible === 'boolean' && 
      Array.isArray(data.flags);
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

  // Add a test button to your template
  // <button type="button" (click)="testFlagTable()">Test Flag Table</button>

  testFlagTable() {
    // Set test data to verify flag-table rendering
    this.evaluationResult = {
      isEligible: false,
      flags: this.testFlags,
      candidateId: 'test-id'
    };
    this.candidateId = 'test-id';
    console.log('Test data set for flag-table');
    this.cdr.detectChanges();
  }
}