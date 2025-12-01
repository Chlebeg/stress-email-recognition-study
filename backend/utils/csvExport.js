// backend/utils/csvExport.js
const fs = require('fs');
const path = require('path');

// Escape CSV values
function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Convert CISS answers to CSV rows
function cissToCsv(sessions) {
  if (sessions.length === 0) return '';

  const headers = ['user_id', 'timestamp_start', 'timestamp_ciss', 'question_id', 'answer'];
  let rows = [headers.map(escapeCSV).join(',')];

  sessions.forEach(session => {
    if (session.ciss_answers && Array.isArray(session.ciss_answers)) {
      session.ciss_answers.forEach(answer => {
        rows.push([
          escapeCSV(session.user_id),
          escapeCSV(session.timestamp_start),
          escapeCSV(session.timestamp_ciss),
          escapeCSV(answer.question_id),
          escapeCSV(answer.answer)
        ].join(','));
      });
    }
  });

  return rows.join('\n');
}

// Convert Phishing answers to CSV rows
function phishingToCsv(sessions) {
  if (sessions.length === 0) return '';

  const headers = ['user_id', 'timestamp_start', 'timestamp_phishing', 'task_id', 'user_answer', 'stressors', 'after_timeout'];
  let rows = [headers.map(escapeCSV).join(',')];

  sessions.forEach(session => {
    if (session.phishing_answers && Array.isArray(session.phishing_answers)) {
      session.phishing_answers.forEach(answer => {
        rows.push([
          escapeCSV(session.user_id),
          escapeCSV(session.timestamp_start),
          escapeCSV(session.timestamp_phishing),
          escapeCSV(answer.task_id),
          escapeCSV(answer.user_answer),
          escapeCSV(JSON.stringify(answer.stressors || [])),
          escapeCSV(answer.after_timeout)
        ].join(','));
      });
    }
  });

  return rows.join('\n');
}

// Convert Summary data to CSV rows
function summaryToCsv(sessions) {
  if (sessions.length === 0) return '';

  const headers = ['user_id', 'timestamp_start', 'timestamp_end', 'age', 'stress_rating', 'notes'];
  let rows = [headers.map(escapeCSV).join(',')];

  sessions.forEach(session => {
    if (session.summary_data) {
      const summary = session.summary_data;
      rows.push([
        escapeCSV(session.user_id),
        escapeCSV(session.timestamp_start),
        escapeCSV(session.timestamp_end),
        escapeCSV(summary.age),
        escapeCSV(summary.stress_rating),
        escapeCSV(summary.notes)
      ].join(','));
    }
  });

  return rows.join('\n');
}

// Convert Users to CSV rows
function usersToCsv(sessions) {
  if (sessions.length === 0) return '';

  const headers = ['user_id', 'timestamp_start', 'timestamp_end', 'device_type', 'browser'];
  let rows = [headers.map(escapeCSV).join(',')];

  sessions.forEach(session => {
    rows.push([
      escapeCSV(session.user_id),
      escapeCSV(session.timestamp_start),
      escapeCSV(session.timestamp_end),
      escapeCSV(session.device_type || 'unknown'),
      escapeCSV(session.browser || 'unknown')
    ].join(','));
  });

  return rows.join('\n');
}

// Generate downloadable CSV data
function generateCsvExport(sessions) {
  return {
    USERS: usersToCsv(sessions),
    CISS: cissToCsv(sessions),
    PHISHING: phishingToCsv(sessions),
    SUMMARY: summaryToCsv(sessions)
  };
}

module.exports = {
  generateCsvExport,
  cissToCsv,
  phishingToCsv,
  summaryToCsv,
  usersToCsv,
  escapeCSV
};
