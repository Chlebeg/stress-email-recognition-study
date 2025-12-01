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

  const headers = ['user_id', 'timestamp_start', 'timestamp_ciss', 'pytanie_id', 'odpowiedz'];
  let rows = [headers.map(escapeCSV).join(',')];

  sessions.forEach(session => {
    if (session.ciss_answers && Array.isArray(session.ciss_answers)) {
      session.ciss_answers.forEach(answer => {
        rows.push([
          escapeCSV(session.user_id),
          escapeCSV(session.timestamp_start),
          escapeCSV(session.timestamp_ciss),
          escapeCSV(answer.pytanie_id),
          escapeCSV(answer.odpowiedz)
        ].join(','));
      });
    }
  });

  return rows.join('\n');
}

// Convert Phishing answers to CSV rows
function phishingToCsv(sessions) {
  if (sessions.length === 0) return '';

  const headers = ['user_id', 'timestamp_start', 'timestamp_phishing', 'zadanie_id', 'from', 'subject', 'correct_answer', 'user_answer', 'stress_timer_active', 'stressors', 'czy_odpowiedziano_po_timeout'];
  let rows = [headers.map(escapeCSV).join(',')];

  sessions.forEach(session => {
    if (session.phishing_answers && Array.isArray(session.phishing_answers)) {
      session.phishing_answers.forEach(answer => {
        rows.push([
          escapeCSV(session.user_id),
          escapeCSV(session.timestamp_start),
          escapeCSV(session.timestamp_phishing),
          escapeCSV(answer.zadanie_id),
          escapeCSV(answer.from),
          escapeCSV(answer.subject),
          escapeCSV(answer.correct_answer),
          escapeCSV(answer.user_answer),
          escapeCSV(answer.stress_timer_active),
          escapeCSV(JSON.stringify(answer.stressors_per_question || [])),
          escapeCSV(answer.czy_odpowiedziano_po_timeout)
        ].join(','));
      });
    }
  });

  return rows.join('\n');
}

// Convert Summary data to CSV rows
function summaryToCsv(sessions) {
  if (sessions.length === 0) return '';

  const headers = ['user_id', 'timestamp_start', 'timestamp_end', 'wiek', 'ocena_stresu', 'inne'];
  let rows = [headers.map(escapeCSV).join(',')];

  sessions.forEach(session => {
    if (session.summary_data) {
      const summary = session.summary_data;
      rows.push([
        escapeCSV(session.user_id),
        escapeCSV(session.timestamp_start),
        escapeCSV(session.timestamp_end),
        escapeCSV(summary.wiek),
        escapeCSV(summary.ocena_stresu),
        escapeCSV(summary.inne)
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
