import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';

export default function DataDownload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportData, setExportData] = useState(null);

  const handleDownloadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/export`);
      const data = await response.json();
      if (data.ok) {
        setExportData(data.data);
      } else {
        setError('Nie udało się pobrać danych');
      }
    } catch (e) {
      setError('Błąd połączenia: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (sheet) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const url = `${API_URL}/api/export/${sheet}`;
    const a = document.createElement('a');
    a.href = url;
    a.click();
  };

  return (
    <div className="page-container" style={{ minHeight: '100vh' }}>
      <div className="page-card" style={{ maxWidth: '56.25rem' }}>
        <div className="content-header">
          <h2>Pobierz dane badania</h2>
          <Link to="/" style={{ fontSize: '0.875rem', color: '#667eea' }}>← Powrót</Link>
        </div>

        <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '0.75rem' }}>Dostępne opcje:</h3>
          <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: 0 }}>
            Pobierz zebrane dane badania w formacie CSV. Każdy arkusz zawiera dane z innej części badania.
          </p>
        </div>

        {error && (
          <div style={{
            padding: '1rem',
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            color: '#721c24',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        {exportData && (
          <div style={{
            padding: '1rem',
            background: '#d4edda',
            border: '1px solid #c3e6cb',
            color: '#155724',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <strong>Dane załadowane!</strong> {exportData.total_participants} uczestników
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => downloadCSV('users')}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.9375rem',
              fontWeight: 500,
              transition: 'background 0.3s'
            }}
            onMouseOver={(e) => e.target.style.background = '#5568d3'}
            onMouseOut={(e) => e.target.style.background = '#667eea'}
          >
            Użytkownicy (CSV)
          </button>

          <button
            onClick={() => downloadCSV('ciss')}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.9375rem',
              fontWeight: 500,
              transition: 'background 0.3s'
            }}
            onMouseOver={(e) => e.target.style.background = '#5568d3'}
            onMouseOut={(e) => e.target.style.background = '#667eea'}
          >
            CISS (CSV)
          </button>

          <button
            onClick={() => downloadCSV('phishing')}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.9375rem',
              fontWeight: 500,
              transition: 'background 0.3s'
            }}
            onMouseOver={(e) => e.target.style.background = '#5568d3'}
            onMouseOut={(e) => e.target.style.background = '#667eea'}
          >
            Phishing (CSV)
          </button>

          <button
            onClick={() => downloadCSV('summary')}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.9375rem',
              fontWeight: 500,
              transition: 'background 0.3s'
            }}
            onMouseOver={(e) => e.target.style.background = '#5568d3'}
            onMouseOut={(e) => e.target.style.background = '#667eea'}
          >
            Podsumowanie (CSV)
          </button>
        </div>

        <button
          onClick={handleDownloadAll}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: loading ? '#ccc' : '#28A745',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.9375rem',
            fontWeight: 500,
            width: '100%',
            transition: 'background 0.3s'
          }}
          onMouseOver={(e) => !loading && (e.target.style.background = '#218838')}
          onMouseOut={(e) => !loading && (e.target.style.background = '#28A745')}
        >
          {loading ? 'Ładowanie...' : 'Załaduj wszystkie dane'}
        </button>

        <div style={{ marginTop: '1.5rem', fontSize: '0.8125rem', color: '#666', lineHeight: 1.6 }}>
          <p><strong>Informacje:</strong></p>
          <ul style={{ marginLeft: '1.25rem' }}>
            <li>Każdy plik CSV zawiera dane w oddzielnym arkuszu</li>
            <li>Pliki można otworzyć w Excel, Google Sheets lub dowolnym edytorze tekstu</li>
            <li>Dane są zapisywane automatycznie w trakcie badania</li>
            <li>Przechowywane w formacie JSON na serwerze (niezawodne, bez blokad pliku)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
