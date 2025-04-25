# Medical Candidate Flagging System - Backend

## Overview

This project implements the backend component of a flagging system for the PRO (Practice Ready Ontario) Portal, designed to evaluate medical candidates' eligibility. The system automatically flags applications based on various criteria and allows reviewers to acknowledge or override flags as needed.

## Project Background

This application was developed as part of the "Summer Student Test – PRO Portal Development" assignment, which required creating a flagging service that:
- Processes candidate applications
- Evaluates eligibility based on predefined rules
- Allows manual overriding of flags
- Persists candidate data

## Tech Stack

- **Node.js** - JavaScript runtime environment
- **Express** - Web application framework
- **TypeScript** - Typed JavaScript
- **Jest** - Testing framework

## Features

- **RESTful API** - Provides endpoints for candidate evaluation and flag management
- **Automated Flagging** - Evaluates candidates against multiple eligibility criteria:
  - Legal status verification
  - English proficiency assessment
  - Practice hours validation
  - Postgraduate training verification
  - TDM test results
  - Impairment to practice checks
  - Rotation requirements
- **Flag Management** - Allows reviewers to acknowledge and override individual flags
- **Persistence** - JSON-based storage of candidate data and evaluation results
- **Eligibility Recalculation** - Automatically recalculates overall eligibility when flags are overridden

## Project Structure

- `src/` - Source code
  - `controllers/` - HTTP request handlers
  - `middleware/` - Express middleware for validation
  - `models/` - Data models for candidates and flags
  - `routes/` - API routes
  - `services/` - Core business logic
    - `flaggingService.ts` - Rules-based candidate evaluation
    - `storageService.ts` - Data persistence
  - `tests/` - Unit tests
- `data/` - Storage location for JSON data

## API Endpoints

- `POST /api/candidates` - Submit and evaluate a new candidate
- `GET /api/candidates` - Retrieve all candidates
- `GET /api/candidates/:id` - Retrieve a specific candidate
- `PATCH /api/candidates/:id/flags/:flagId` - Update flag status (acknowledge/override)
- `GET /` - Health check endpoint

## Setup Instructions

1. Clone the repository
2. Navigate to the backend folder
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```
5. Run tests:
   ```
   npm test
   ```

## Environment Variables

Create a `.env` file in the root directory with:
```
PORT=5000
ALLOWED_ORIGINS=http://localhost:4200

```

## Data Models

### Candidate
Structured data representing medical professional applicants with fields for:
- Personal information
- Education background
- Examination history
- Practice experience
- Language proficiency
- Postgraduate training

### Flag
Evaluation markers with:
- Status (Red/Green)
- Category
- Field reference
- Message
- Override status

## Development and Testing

The codebase includes comprehensive unit tests for the flagging logic and storage service. Run tests using `npm test`.