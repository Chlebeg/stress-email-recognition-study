// backend/utils/jsonStorage.js
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const SESSIONS_DIR = path.join(DATA_DIR, 'sessions');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// Get session file path for user (creates if doesn't exist, reuses if exists same day)
// Returns {path, isNewSession, collision} or throws on error
function getSessionPath(user_id, device_type = null, browser = null) {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const files = fs.readdirSync(SESSIONS_DIR);
    
    // Look for existing session file for this user created today
    const existingFile = files.find(f => 
      f.startsWith(user_id + '_') && 
      f.endsWith('.json') &&
      f.includes(today)
    );
    
    if (existingFile) {
      // Session file already exists for this user today
      return {
        path: path.join(SESSIONS_DIR, existingFile),
        isNewSession: false,
        collision: true
      };
    }
    
    // Create new session file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `${user_id}_${timestamp}.json`;
    const filePath = path.join(SESSIONS_DIR, filename);
    
    const sessionData = {
      user_id,
      timestamp_start: new Date().toISOString(),
      device_type: device_type || 'unknown',
      browser: browser || 'unknown',
      ciss_answers: null,
      phishing_answers: null,
      summary_data: null,
      timestamp_end: null
    };
    
    fs.writeFileSync(filePath, JSON.stringify(sessionData, null, 2), 'utf8');
    
    return {
      path: filePath,
      isNewSession: true,
      collision: false
    };
  } catch (e) {
    console.error('Error getting session path:', e);
    throw e;
  }
}

// Load session data from filepath
function loadSessionFromPath(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Error loading session:', e);
    return null;
  }
}

// Save session data to filepath (internal use only)
function saveSessionToPath(filePath, sessionData) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(sessionData, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error saving session:', e);
    throw e;
  }
}

// Append CISS answers using filepath
function appendCISSWithPath(filePath, answers) {
  let session = loadSessionFromPath(filePath);
  session.ciss_answers = answers;
  session.timestamp_ciss = new Date().toISOString();
  saveSessionToPath(filePath, session);
}

// Append Phishing answers using filepath
function appendPhishingWithPath(filePath, answers) {
  let session = loadSessionFromPath(filePath);
  session.phishing_answers = answers;
  session.timestamp_phishing = new Date().toISOString();
  saveSessionToPath(filePath, session);
}

// Append Summary data using filepath
function appendSummaryWithPath(filePath, data) {
  let session = loadSessionFromPath(filePath);
  session.summary_data = data;
  session.timestamp_end = new Date().toISOString();
  saveSessionToPath(filePath, session);
}

// Get all sessions
function getAllSessions() {
  try {
    const files = fs.readdirSync(SESSIONS_DIR)
      .filter(f => f.endsWith('.json'))
      .sort();
    
    const sessions = [];
    files.forEach(file => {
      try {
        const filePath = path.join(SESSIONS_DIR, file);
        const data = fs.readFileSync(filePath, 'utf8');
        sessions.push(JSON.parse(data));
      } catch (e) {
        console.error(`Error reading ${file}:`, e);
      }
    });
    return sessions;
  } catch (e) {
    console.error('Error getting all sessions:', e);
    return [];
  }
}

module.exports = {
  getSessionPath,
  loadSessionFromPath,
  appendCISSWithPath,
  appendPhishingWithPath,
  appendSummaryWithPath,
  getAllSessions
};
