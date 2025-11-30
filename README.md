# Study: The Impact of Stress Coping Style on Cybersecurity Decision-Making

## Project Description
A web-based application for conducting a research study consisting of three parts:
1. **CISS** - Coping Inventory for Stressful Situations questionnaire
2. **Phishing** - Email phishing recognition task (with optional stress-inducing factors)
3. **Summary** - Post-study survey

## Project Structure
```
├── backend/                   # Express.js server
│   ├── server.js              # Main server file with API endpoints
│   ├── package.json           # Backend dependencies
│   ├── utils/
│   │   └── excel.js           # Excel file writing utilities
│   ├── data/                  # Data storage directory
│   └── save-test.js           # Test file for saving functionality
├── frontend/                  # React application
│   ├── index.html             # Main HTML entry point
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.js         # Vite configuration
│   ├── public/
│   │   ├── ciss.json          # CISS questionnaire items
│   │   └── phishing.json      # Phishing email tasks
│   └── src/
│       ├── App.jsx            # Main application component
│       ├── main.jsx           # React entry point
│       ├── styles.css         # Global styles
│       ├── pages/             # Application pages
│       │   ├── Login.jsx
│       │   ├── CISS.jsx
│       │   ├── Phishing.jsx
│       │   ├── Summary.jsx
│       │   └── End.jsx
│       └── state/             # Context API
│           └── AppContext.jsx # Global application state
```

## Installation and Setup

### Backend
```bash
cd backend
npm install
npm start
```
Backend will be available at: http://localhost:4000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at: http://localhost:3000

## Development Commands

### Backend
- `npm start` - Start the server in production mode
- `npm run dev` - Start the server with nodemon (hot reload)

## API Endpoints

### POST /api/login
Saves user_id to USERS sheet.
```json
{
  "user_id": "participant_01"
}
```
**Response:**
```json
{
  "ok": true,
  "user_id": "participant_01"
}
```

### POST /api/ciss
Saves CISS questionnaire answers to CISS sheet.
```json
{
  "user_id": "participant_01",
  "answers": [
    { "pytanie_id": 1, "odpowiedz": "Frequently" }
  ]
}
```
**Response:**
```json
{
  "ok": true
}
```

### POST /api/phishing
Saves phishing task answers to PHISHING sheet.
```json
{
  "user_id": "participant_01",
  "answers": [
    {
      "zadanie_id": "p1",
      "subject": "Your account has been locked",
      "correct_answer": "phishing",
      "user_answer": "phishing",
      "stress_timer_active": true,
      "stress_timer_duration": 8,
      "stressors_per_question": ["timer"],
      "czy_odpowiedziano_po_timeout": false
    }
  ]
}
```
**Response:**
```json
{
  "ok": true
}
```

### POST /api/summary
Saves post-study survey responses to SUMMARY sheet.
```json
{
  "user_id": "participant_01",
  "summary": {
    "wiek": "28",
    "ocena_stresu": "5",
    "inne": {}
  }
}
```
**Response:**
```json
{
  "ok": true
}
```

## Excel Output Structure (wyniki.xlsx)

### USERS Sheet
- `user_id` - Unique participant identifier
- `timestamp` - Login timestamp

### CISS Sheet
- `user_id` - Participant identifier
- `question_id` - Question ID (1-48)
- `answer` - Selected answer option
- `timestamp` - Response timestamp

### PHISHING Sheet
- `user_id` - Participant identifier
- `task_id` - Task ID (p1-p4)
- `subject` - Email subject
- `correct_answer` - Ground truth label ("phishing" or "normalny")
- `user_answer` - Participant's classification
- `stress_timer_active` - Whether timer was active
- `stress_timer_duration` - Timer duration in seconds
- `stressors_per_question` - Applied stressors (e.g., ["timer"])
- `answered_after_timeout` - Whether answer was given after timeout
- `timestamp` - Response timestamp

### SUMMARY Sheet
- `user_id` - Participant identifier
- `age` - Age
- `stress_rating` - Self-reported stress rating
- `additional_data` - Additional responses (JSON format)
- `timestamp` - Submission timestamp

## Stress Factor Configuration

### Global Settings
In `frontend/src/state/AppContext.jsx`, you can modify default stress settings:
```javascript
stress_timer_enabled: true,     // enable/disable timer globally
stress_timer_duration: 8        // duration in seconds
```

### Per-Task Stressors
In `frontend/public/phishing.json`, stressors can be configured per task:
```json
{
  "id": "p1",
  "subject": "Your account has been locked",
  "body": "...",
  "correct": "phishing",
  "stressors": ["timer"]  // stressors for this task
}
```

## Future Enhancements
- Multi-language support (language selection on login page)
- Additional stress factors (fake popups, etc.)
- Advanced statistical analysis dashboard
- Real-time result visualization
