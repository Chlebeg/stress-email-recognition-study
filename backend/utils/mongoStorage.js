// backend/utils/mongoStorage.js
const { MongoClient } = require('mongodb');

let client = null;
let db = null;
let sessionsCollection = null;

// Connect to MongoDB
async function connect() {
  if (db) return db; // Already connected

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable not set');
  }

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('ciss_research');
    sessionsCollection = db.collection('sessions');
    
    // Create index on user_id for faster lookups
    await sessionsCollection.createIndex({ user_id: 1 });
    
    console.log('✅ Connected to MongoDB Atlas');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// Get or create session
async function getSessionPath(user_id, device_type = null, browser = null) {
  await connect();
  
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Check if session exists for this user today
    const existingSession = await sessionsCollection.findOne({
      user_id,
      timestamp_start: { $regex: `^${today}` }
    });
    
    if (existingSession) {
      return {
        path: existingSession._id.toString(),
        isNewSession: false,
        collision: true
      };
    }
    
    // Create new session
    const sessionData = {
      user_id,
      timestamp_start: new Date().toISOString(),
      device_type: device_type || 'unknown',
      browser: browser || 'unknown',
      pre_experiment_data: null,
      ciss_answers: {},
      phishing_answers: null,
      summary_data: null,
      timestamp_end: null
    };
    
    const result = await sessionsCollection.insertOne(sessionData);
    
    return {
      path: result.insertedId.toString(),
      isNewSession: true,
      collision: false
    };
  } catch (error) {
    console.error('Error in getSessionPath:', error);
    throw error;
  }
}

// Load session by ID (path)
async function loadSessionFromPath(sessionId) {
  await connect();
  
  try {
    const { ObjectId } = require('mongodb');
    const session = await sessionsCollection.findOne({ _id: new ObjectId(sessionId) });
    
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    return session;
  } catch (error) {
    console.error('Error loading session:', error);
    throw error;
  }
}

// Save session by ID (path)
async function saveSessionToPath(sessionId, sessionData) {
  await connect();
  
  try {
    const { ObjectId } = require('mongodb');
    await sessionsCollection.updateOne(
      { _id: new ObjectId(sessionId) },
      { $set: sessionData }
    );
  } catch (error) {
    console.error('Error saving session:', error);
    throw error;
  }
}

// Append pre-experiment data
async function appendPreExperimentWithPath(sessionId, data) {
  await connect();
  try {
    const { ObjectId } = require('mongodb');
    await sessionsCollection.updateOne(
      { _id: new ObjectId(sessionId) },
      {
        $set: {
          pre_experiment_data: data,
          timestamp_pre_experiment: new Date().toISOString()
        }
      }
    );
  } catch (error) {
    console.error('Error appending pre-experiment data:', error);
    throw error;
  }
}

// Append CISS answers
async function appendCISSWithPath(sessionId, answers) {
  await connect();
  
  try {
    const { ObjectId } = require('mongodb');
    await sessionsCollection.updateOne(
      { _id: new ObjectId(sessionId) },
      {
        $set: {
          ciss_answers: answers,
          timestamp_ciss: new Date().toISOString()
        }
      }
    );
  } catch (error) {
    console.error('Error appending CISS:', error);
    throw error;
  }
}

// Append Phishing answers
async function appendPhishingWithPath(sessionId, answers) {
  await connect();
  
  try {
    const { ObjectId } = require('mongodb');
    await sessionsCollection.updateOne(
      { _id: new ObjectId(sessionId) },
      {
        $set: {
          phishing_answers: answers,
          timestamp_phishing: new Date().toISOString()
        }
      }
    );
  } catch (error) {
    console.error('Error appending phishing:', error);
    throw error;
  }
}

// Append Summary data
async function appendSummaryWithPath(sessionId, data) {
  await connect();
  
  try {
    const { ObjectId } = require('mongodb');
    await sessionsCollection.updateOne(
      { _id: new ObjectId(sessionId) },
      {
        $set: {
          summary_data: data,
          timestamp_end: new Date().toISOString()
        }
      }
    );
  } catch (error) {
    console.error('Error appending summary:', error);
    throw error;
  }
}

// Get all sessions
async function getAllSessions() {
  await connect();
  
  try {
    const sessions = await sessionsCollection.find({}).toArray();
    return sessions;
  } catch (error) {
    console.error('Error getting all sessions:', error);
    throw error;
  }
}

// Close connection (optional, for cleanup)
async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    sessionsCollection = null;
    console.log('MongoDB connection closed');
  }
}

module.exports = {
  connect,
  getSessionPath,
  loadSessionFromPath,
  appendPreExperimentWithPath,
  appendCISSWithPath,
  appendPhishingWithPath,
  appendSummaryWithPath,
  getAllSessions,
  closeConnection
};
