// backend/server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { initSession, appendCISS, appendPhishing, appendSummary, getAllSessions } = require("./utils/jsonStorage");
const { generateCsvExport } = require("./utils/csvExport");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/api/login", async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: "user_id required" });

  try {
    initSession(user_id);
    res.json({ ok: true, user_id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.post("/api/ciss", async (req, res) => {
  const { user_id, answers } = req.body;
  if (!user_id || !answers) return res.status(400).json({ error: "user_id and answers required" });

  try {
    appendCISS(user_id, answers);
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
    appendPhishing(user_id, answers);
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
    appendSummary(user_id, summary);
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
