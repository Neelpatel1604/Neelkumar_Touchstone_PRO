# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.9.

## Project Structure

- **Components:**
  - CandidateForm - Main entry point for adding candidates
  - CandidateList - View candidate history
  - FlagTable - Display flagging information
  - CandidateResults - Show results for candidates

- **Services:**
  - CandidateService - Handles data operations for candidates

- **Models:**
  - Candidate - Data structure for candidate information
  - Flag - Data structure for flagging system

## Routes
- `/` - Candidate Form (main entry point)
- `/history` - Candidate List view

## Installation and Setup

### Angular CLI

Install Angular CLI globally:

```bash
npm install -g @angular/cli
```

### Project Dependencies

Install dependencies:

```bash
npm install
```

## Development server

Start local development server:

```bash
npm start
```

Access at: `http://localhost:4200/`

## Key Features
- Candidate submission form
- History tracking for candidates
- Flagging system for candidate evaluation
- Results display

## Technologies
- Angular 19.2
- PrimeNG UI Components
- RxJS for reactive programming

## Building

Build for production:

```bash
ng build
```

## Additional Resources

For more information: [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
