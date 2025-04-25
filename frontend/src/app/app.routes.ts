import { Routes } from '@angular/router';
import { CandidateFormComponent } from './components/candidate-form/candidate-form.components';
import { CandidateListComponent } from './components/candidate-list/candidate-list.component';
import { FlagTableComponent } from './components/flag-table/flag-table.component';

export const routes: Routes = [
  { path: '', component: CandidateFormComponent },
  { path: 'history', component: CandidateListComponent },
  { path: '**', redirectTo: '' }
];