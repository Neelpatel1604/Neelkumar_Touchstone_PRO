# Flagging System

This project consists of a medical candidate assessment system with flagging capabilities. It includes both frontend (Angular) and backend (Node.js) components.

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Neelpatel1604/Neelkumar_Touchstone_PRO.git
   ```

## Features

- Candidate information form with validation
- Automated assessment based on configurable rules
- Flag display with override capabilities
- Data persistence for candidate records

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Angular CLI

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The server will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Angular development server:
   ```bash
   ng serve
   ```
   OR
   ```bash
   npm start
   ```
   The application will be available at http://localhost:4200

## Usage

1. Open the application in your browser at http://localhost:4200
2. Fill out the candidate assessment form
3. Submit the form to receive an eligibility assessment
4. Review the flags and override if necessary

## Project Structure

### Frontend
- `src/app/components/`: Angular components
- `src/app/models/`: Data models
- `src/app/services/`: Services for API communication

### Backend
- `src/controllers/`: Request handlers
- `src/models/`: Data models
- `src/services/`: Business logic
- `src/routes/`: API route definitions
- `src/middleware/`: Express middleware

## Testing

Run the backend tests:
```bash
cd backend
npm test
```

Run the frontend tests:
```bash
cd frontend
```
