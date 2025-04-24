import { Routes } from '@angular/router';
import { CandidateFormComponent } from './components/candidate-form/candidate-form.components';

export const routes: Routes = [
  { path: '', component: CandidateFormComponent },
  { path: '**', redirectTo: '' }
];