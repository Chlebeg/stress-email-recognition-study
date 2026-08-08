# Study: The Impact of Stress Coping Style on Cybersecurity Decision-Making

## Overview

This React and Express application runs a single-session research study in Polish:

1. **CISS**: 48-item Coping Inventory for Stressful Situations questionnaire.
2. **Phishing tasks**: classification of realistic email messages under task-configured stressors.
3. **Summary**: age, IT work/education background, self-reported stress, and stressor-related feelings.

The participant flow is linear: Login -> CISS intro -> CISS -> phishing intro -> phishing -> Summary -> completion. Participant state is held in React context and is intentionally lost when the page is refreshed.

## Setup

Install dependencies independently for the frontend and backend.

```powershell
cd backend
npm install
npm run dev
```

The API runs at `http://localhost:4000` by default.

```powershell
cd frontend
npm install
npm run dev
```

The Vite application runs at `http://localhost:3000`.

## Commands

| Location | Command | Purpose |
|---|---|---|
| `backend` | `npm start` | Start the Express server. |
| `backend` | `npm run dev` | Start Express with nodemon. |
| `frontend` | `npm run dev` | Start the Vite development server. |
| `frontend` | `npm run build` | Create a production build in `frontend/dist`. |
| `frontend` | `npm run preview` | Serve the production build locally. |

## Architecture

```text
frontend/                         React 18 + Vite application
  public/ciss.json                CISS item definitions
  public/phishing.json            Email tasks and task stressor configuration
  src/constants/Stressors.js      Canonical stressor identifiers
  src/pages/                      Participant pages
  src/state/AppContext.jsx        In-memory participant/session state

backend/                          Express API
  server.js                       Session endpoints and development exports
  utils/jsonStorage.js            Local JSON session persistence
  utils/mongoStorage.js           MongoDB session persistence
  utils/csvExport.js              USERS, CISS, and PHISHING CSV generation
```

## Storage

The backend stores one consolidated session record per participant per day. It uses MongoDB when `MONGODB_URI` is available; otherwise it stores JSON session files in `backend/data/sessions/`.

Each session contains participant metadata, CISS answers, phishing answers, the Summary response, and section timestamps. The backend's in-memory `activeSessions` map links a logged-in participant to the storage record for subsequent submissions, so a page refresh requires a new login/session flow.

## API

All participant endpoints accept JSON and return `{ "ok": true }` on success.

| Endpoint | Request body | Result |
|---|---|---|
| `POST /api/login` | `user_id`, `device_type`, `browser` | Creates or initializes the participant session. Same-day ID collisions return `shouldRetry: true`. |
| `POST /api/ciss` | `user_id`, `answers` | Saves `{ q1: 1, ..., q48: 5 }`. |
| `POST /api/phishing` | `user_id`, `answers` | Saves one response per email task. |
| `POST /api/summary` | `user_id`, `summary` | Saves demographics and subjective-stress data. |

Example Summary payload:

```json
{
  "user_id": "participant_01",
  "summary": {
    "age": "28",
    "technical_background": "yes",
    "stress_rating": "7",
    "stress_impact_factor": ["timer", "email_blur"],
    "stress_impact_factor_notes": ""
  }
}
```

Development-only export routes are available while `NODE_ENV` is not `production`:

- `GET /api/export`: returns all CSV strings in JSON.
- `GET /api/export/users`, `/api/export/ciss`, and `/api/export/phishing`: download individual CSV files.
- `GET /api/export/sessions/zip`: download raw session records as a ZIP archive.

Production exports are intentionally not registered; access production data through MongoDB.

## Stressors

Configure stressors per phishing task in `frontend/public/phishing.json`. Valid values are defined in `frontend/src/constants/Stressors.js`:

- `timer`
- `negative_feedback`
- `permission_popup_microphone`
- `permission_popup_camera`
- `email_blur`
- `recording`
- `social_comparison`
- `extended_negative_feedback`
- `cognitive_overload`

The global development settings in `AppContext.jsx` control timer enablement/duration and negative-feedback enablement. The full research sequence and task-specific choices are maintained in [RESEARCH_PLAN.md](RESEARCH_PLAN.md).

## Deployment

The repository contains a Render Blueprint in [`render.yaml`](render.yaml) with two services:

| Service | Type | Build | Runtime |
|---|---|---|---|
| `stress-email-recognition-study-backend` | Node web service | `cd backend && npm install` | `cd backend && node server.js` |
| `stress-email-recognition-study` | Static site | `cd frontend && npm install && npm run build` | Publishes `frontend/dist` |

### First deployment

1. Push the repository to GitHub or another Git provider supported by Render.
2. In Render, choose **New +** -> **Blueprint** and select the repository.
3. Review the two services detected from `render.yaml`.
4. Set the secret `MONGODB_URI` for `stress-email-recognition-study-backend`.
5. Deploy the Blueprint and wait for the backend to become healthy before testing the frontend.

The backend listens on Render's assigned port through the `PORT` environment variable. The Blueprint sets `NODE_ENV=production`, which disables the development data-export endpoints.

### Environment variables

#### Backend service

| Variable | Required | Value |
|---|---|---|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Yes | `4000` in the Blueprint; Render may provide its own service port. |
| `MONGODB_URI` | Yes for persistent production data | MongoDB Atlas connection string. Keep this secret and set it in Render, not in Git. |
| `FRONTEND_URL` | Optional | Full frontend origin, useful when restricting CORS for a custom domain. |

When `MONGODB_URI` is present, the backend uses the `ciss_research` database and `sessions` collection. Without it, the backend falls back to JSON files, which should not be treated as durable production storage on a free or ephemeral host.

#### Frontend service

| Variable | Required | Value |
|---|---|---|
| `VITE_API_URL` | Yes | The public backend URL, for example `https://stress-email-recognition-study-backend.onrender.com`. |

`VITE_API_URL` is embedded into the frontend during `npm run build`. Changing it requires a new frontend build/deploy; restarting only the backend is not enough.

