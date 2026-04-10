// backend/utils/csvExport.js

// Escape CSV values and prevent formula injection (OWASP A03)
function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  let str = String(value);
  // Prefix values that could be interpreted as spreadsheet formulas
  if (str.length > 0 && ['=', '+', '-', '@', '\t', '\r'].includes(str[0])) {
    str = `'${str}`;
  }
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Convert CISS answers to CSV rows (wide format with Q1-Q48 columns)
function cissToCsv(sessions) {
  if (sessions.length === 0) return '';

  // Build header: user_id, q1, q2, ..., q48
  const headers = ['user_id'];
  for (let i = 1; i <= 48; i++) {
    headers.push(`q${i}`);
  }
  let rows = [headers.map(escapeCSV).join(',')];

  sessions.forEach(session => {
    if (session.ciss_answers && typeof session.ciss_answers === 'object') {
      // Build row: user_id followed by q1-q48 values
      const rowData = [escapeCSV(session.user_id)];
      for (let i = 1; i <= 48; i++) {
        rowData.push(escapeCSV(session.ciss_answers[`q${i}`] || ''));
      }
      
      rows.push(rowData.join(','));
    }
  });

  return rows.join('\n');
}

// Convert Phishing answers to CSV rows (no timestamps)
function phishingToCsv(sessions) {
  if (sessions.length === 0) return '';

  const headers = ['user_id', 'task_id', 'subject', 'is_phishing', 'user_is_phishing', 'stressors', 'after_timeout'];
  let rows = [headers.map(escapeCSV).join(',')];

  sessions.forEach(session => {
    if (session.phishing_answers && Array.isArray(session.phishing_answers)) {
      session.phishing_answers.forEach(answer => {
        rows.push([
          escapeCSV(session.user_id),
          escapeCSV(answer.task_id),
          escapeCSV(answer.subject),
          escapeCSV(answer.is_phishing),
          escapeCSV(answer.user_is_phishing),
          escapeCSV(JSON.stringify(answer.stressors || [])),
          escapeCSV(answer.after_timeout)
        ].join(','));
      });
    }
  });

  return rows.join('\n');
}

// Convert Users + Summary data to single CSV (merged)
function usersToCsv(sessions) {
  if (sessions.length === 0) return '';

  const headers = ['user_id', 'age', 'stress_rating', 'stress_impact_factor', 'stress_impact_factor_notes', 'device_type', 'browser', 'timestamp_start', 'timestamp_end'];
  let rows = [headers.map(escapeCSV).join(',')];

  sessions.forEach(session => {
    const summary = session.summary_data || {};
    rows.push([
      escapeCSV(session.user_id),
      escapeCSV(summary.age || ''),
      escapeCSV(summary.stress_rating || ''),
      escapeCSV(summary.stress_impact_factor || ''),
      escapeCSV(summary.stress_impact_factor_notes || ''),
      escapeCSV(session.device_type || 'unknown'),
      escapeCSV(session.browser || 'unknown'),
      escapeCSV(session.timestamp_start),
      escapeCSV(session.timestamp_end || '')
    ].join(','));
  });

  return rows.join('\n');
}

// Generate downloadable CSV data
function generateCsvExport(sessions) {
  return {
    USERS: usersToCsv(sessions),
    CISS: cissToCsv(sessions),
    PHISHING: phishingToCsv(sessions)
  };
}

module.exports = {
  generateCsvExport
};
