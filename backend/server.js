// backend/server.js
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const archiver = require("archiver");

// Use MongoDB or fallback to JSON storage
const USE_MONGODB = process.env.MONGODB_URI ? true : false;
const storage = USE_MONGODB 
  ? require("./utils/mongoStorage")
  : require("./utils/jsonStorage");

const { 
  getSessionPath, 
  loadSessionFromPath,
  appendPreExperimentWithPath,
  appendCISSWithPath, 
  appendPhishingWithPath, 
  appendSummaryWithPath,
  getAllSessions 
} = storage;

const { generateCsvExport } = require("./utils/csvExport");

const app = express();

// Helper function to log to both stderr and a file
function logEvent(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  process.stderr.write(logMessage);
  // Also write to file for Render's log archival
  if (fs.existsSync && typeof fs.appendFile === 'function') {
    fs.appendFile('/tmp/app.log', logMessage, () => {});
  }
}

// Connect to MongoDB if using it; fall back to JSON storage if connection fails
if (USE_MONGODB) {
  storage.connect().catch(err => {
    console.error('Failed to connect to MongoDB, falling back to JSON storage:', err);
    // Swap out storage functions to JSON fallback at runtime
    const jsonStorage = require('./utils/jsonStorage');
    Object.assign(storage, jsonStorage);
  });
  process.on('SIGTERM', () => storage.closeConnection());
}


// CORS configuration for Render deployment
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4000',
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Allow if in allowedOrigins
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // For production on Render, accept any onrender.com domain
      if (origin.includes('onrender.com')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
}));
app.use(bodyParser.json());

// Store active session paths per user
const activeSessions = {};

app.post("/api/login", async (req, res) => {
  const { user_id, device_type, browser } = req.body;
  logEvent(`POST /api/login received`);
  if (!user_id) return res.status(400).json({ error: "user_id required" });

  try {
    const result = await getSessionPath(user_id, device_type, browser);
    const sessionPath = result.path;
    
    if (result.collision) {
      // User ID already exists for today - ask frontend to retry with new ID
      return res.json({ ok: false, shouldRetry: true, user_id });
    }
    
    activeSessions[user_id] = sessionPath;
    const sessionData = await loadSessionFromPath(sessionPath);
    
    // Log session start for new session
    logEvent(`User ${user_id} STARTED questionnaire (device: ${device_type}, browser: ${browser})`);
    
    res.json({ ok: true, user_id, session: sessionData });
  } catch (e) {
    logEvent(`Error in /api/login: ${e.message}`);
    res.status(500).json({ error: "server error" });
  }
});

app.post("/api/ciss", async (req, res) => {
  logEvent(`POST /api/ciss received`);
  const { user_id, answers } = req.body;
  if (!user_id || !answers) return res.status(400).json({ error: "user_id and answers required" });

  try {
    const sessionPath = activeSessions[user_id];
    if (!sessionPath) {
      return res.status(400).json({ error: "session not initialized" });
    }
    await appendCISSWithPath(sessionPath, answers);
    res.json({ ok: true });
  } catch (e) {
    logEvent(`Error in /api/ciss: ${e.message}`);
    res.status(500).json({ error: "server error" });
  }
});

app.post("/api/pre-experiment", async (req, res) => {
  logEvent(`POST /api/pre-experiment received`);
  const { user_id, pre_experiment_data } = req.body;
  if (!user_id || !pre_experiment_data) {
    return res.status(400).json({ error: "user_id and pre_experiment_data required" });
  }

  try {
    const sessionPath = activeSessions[user_id];
    if (!sessionPath) {
      return res.status(400).json({ error: "session not initialized" });
    }
    await appendPreExperimentWithPath(sessionPath, pre_experiment_data);
    res.json({ ok: true });
  } catch (e) {
    logEvent(`Error in /api/pre-experiment: ${e.message}`);
    res.status(500).json({ error: "server error" });
  }
});

app.post("/api/phishing", async (req, res) => {
  logEvent(`POST /api/phishing received`);
  const { user_id, answers } = req.body;
  if (!user_id || !answers) return res.status(400).json({ error: "user_id and answers required" });

  try {
    const sessionPath = activeSessions[user_id];
    if (!sessionPath) {
      return res.status(400).json({ error: "session not initialized" });
    }
    await appendPhishingWithPath(sessionPath, answers);
    res.json({ ok: true });
  } catch (e) {
    logEvent(`Error in /api/phishing: ${e.message}`);
    res.status(500).json({ error: "server error" });
  }
});

app.post("/api/summary", async (req, res) => {
  logEvent(`POST /api/summary received`);
  const { user_id, summary } = req.body;
  if (!user_id || !summary) return res.status(400).json({ error: "user_id and summary required" });

  try {
    const sessionPath = activeSessions[user_id];
    if (!sessionPath) {
      return res.status(400).json({ error: "session not initialized" });
    }
    await appendSummaryWithPath(sessionPath, summary);
    
    // Log completion
    logEvent(`User ${user_id} FINISHED questionnaire`);
    
    res.json({ ok: true });
  } catch (e) {
    logEvent(`Error in /api/summary: ${e.message}`);
    res.status(500).json({ error: "server error" });
  }
});

// Export routes — only registered in non-production environments
// In production, data is accessed directly via MongoDB
if (process.env.NODE_ENV !== 'production') {

app.get("/api/export", async (req, res) => {
  try {
    const sessions = await getAllSessions();
    const csvData = generateCsvExport(sessions);
    
    // Return as JSON object with all CSV strings
    res.json({
      ok: true,
      data: {
        users_csv: csvData.USERS,
        ciss_csv: csvData.CISS,
        phishing_csv: csvData.PHISHING,
        summary_csv: csvData.SUMMARY,
        export_timestamp: new Date().toISOString(),
        total_participants: sessions.length
      }
    });
  } catch (e) {
    logEvent(`Error in /api/export: ${e.message}`);
    res.status(500).json({ error: "export error" });
  }
});

// Download all session JSON files as ZIP — must be registered before /api/export/:sheet
app.get("/api/export/sessions/zip", async (req, res) => {
  try {
    const sessions = await getAllSessions();
    
    if (!sessions || sessions.length === 0) {
      return res.status(404).json({ error: "no sessions found" });
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const zipFilename = `sessions_${timestamp}.zip`;
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);
    
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.on('error', (err) => {
      logEvent(`Error creating ZIP archive: ${err.message}`);
      res.status(500).json({ error: "archive error" });
    });
    
    archive.pipe(res);
    
    sessions.forEach((session) => {
      const filename = `${session.user_id}_${session.timestamp_start.replace(/[:.]/g, '-').slice(0, -5)}.json`;
      const content = JSON.stringify(session, null, 2);
      archive.append(content, { name: filename });
    });
    
    archive.finalize();
    
    logEvent(`ZIP export: ${sessions.length} session files`);
  } catch (e) {
    logEvent(`Error in /api/export/sessions/zip: ${e.message}`);
    res.status(500).json({ error: "export error" });
  }
});

// Download individual CSV file
app.get("/api/export/:sheet", async (req, res) => {
  try {
    const { sheet } = req.params;
    const validSheets = ['users', 'ciss', 'phishing', 'summary'];
    
    if (!validSheets.includes(sheet)) {
      return res.status(400).json({ error: "invalid sheet" });
    }
    
    const sessions = await getAllSessions();
    const csvData = generateCsvExport(sessions);
    const sheetKey = sheet.toUpperCase();
    const csv = csvData[sheetKey];
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="exam_${sheet}_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (e) {
    logEvent(`Error in /api/export/:sheet: ${e.message}`);
    res.status(500).json({ error: "export error" });
  }
});

} // end dev-only export routes

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => process.stderr.write(`Server listening on http://localhost:${PORT}\n`));
