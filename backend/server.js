// backend/server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { 
  getSessionPath, 
  loadSessionFromPath,
  appendCISSWithPath, 
  appendPhishingWithPath, 
  appendSummaryWithPath,
  getAllSessions 
} = require("./utils/jsonStorage");
const { generateCsvExport } = require("./utils/csvExport");

const app = express();

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
  if (!user_id) return res.status(400).json({ error: "user_id required" });

  try {
    const result = getSessionPath(user_id, device_type, browser);
    const sessionPath = result.path;
    
    if (result.collision) {
      // User ID already exists for today - ask frontend to retry with new ID
      return res.json({ ok: false, shouldRetry: true, user_id });
    }
    
    activeSessions[user_id] = sessionPath;
    const sessionData = loadSessionFromPath(sessionPath);
    
    // Log session start for new session
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] User ${user_id} STARTED questionnaire (device: ${device_type}, browser: ${browser})`);
    
    res.json({ ok: true, user_id, session: sessionData });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.post("/api/ciss", async (req, res) => {
  const { user_id, answers } = req.body;
  if (!user_id || !answers) return res.status(400).json({ error: "user_id and answers required" });

  try {
    const sessionPath = activeSessions[user_id];
    if (!sessionPath) {
      return res.status(400).json({ error: "session not initialized" });
    }
    appendCISSWithPath(sessionPath, answers);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.post("/api/phishing", async (req, res) => {
  const { user_id, answers } = req.body;
  if (!user_id || !answers) return res.status(400).json({ error: "user_id and answers required" });

  try {
    const sessionPath = activeSessions[user_id];
    if (!sessionPath) {
      return res.status(400).json({ error: "session not initialized" });
    }
    appendPhishingWithPath(sessionPath, answers);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.post("/api/summary", async (req, res) => {
  const { user_id, summary } = req.body;
  if (!user_id || !summary) return res.status(400).json({ error: "user_id and summary required" });

  try {
    const sessionPath = activeSessions[user_id];
    if (!sessionPath) {
      return res.status(400).json({ error: "session not initialized" });
    }
    appendSummaryWithPath(sessionPath, summary);
    
    // Log completion
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] User ${user_id} FINISHED questionnaire`);
    
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

// Export all data as CSV files (zipped or individual downloads)
app.get("/api/export", (req, res) => {
  try {
    const sessions = getAllSessions();
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
    console.error(e);
    res.status(500).json({ error: "export error" });
  }
});

// Download individual CSV file
app.get("/api/export/:sheet", (req, res) => {
  try {
    const { sheet } = req.params;
    const validSheets = ['users', 'ciss', 'phishing', 'summary'];
    
    if (!validSheets.includes(sheet)) {
      return res.status(400).json({ error: "invalid sheet" });
    }
    
    const sessions = getAllSessions();
    const csvData = generateCsvExport(sessions);
    const sheetKey = sheet.toUpperCase();
    const csv = csvData[sheetKey];
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="badanie_${sheet}_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "export error" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
