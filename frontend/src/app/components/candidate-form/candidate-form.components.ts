import { Component, OnInit } from '@angular/core';
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
import { MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';

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
    FlagTableComponent
  ],
  providers: [MessageService],
  templateUrl: './candidate-form.components.html',
  styleUrl: './candidate-form.components.css'
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
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private candidateService: CandidateService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
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

  onSubmit(): void {
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
    const candidate: Candidate = this.candidateForm.value;

    this.candidateService.evaluateCandidate(candidate).subscribe({
      next: (response) => {
        this.submitting = false;
        this.evaluationResult = response.data;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Candidate has been evaluated successfully.'
        });
      },
      error: (error) => {
        this.submitting = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to evaluate candidate.'
        });
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
    this.initForm();
  }
}