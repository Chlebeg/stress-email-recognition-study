import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { getBrowserDevice } from '../utils/getBrowserDevice';

// Generate a unique session ID
const generateSessionID = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${timestamp}_${random}`;
};

export default function Login(){
  const [generatedId, setGeneratedId] = useState('');
  const [displayId, setDisplayId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { setUser, setSettings } = useApp();
  const nav = useNavigate();

  // Generate ID on mount
  useEffect(() => {
    const id = generateSessionID();
    setGeneratedId(id);
    setDisplayId(id);
  }, []);

  const start = async () => {
    if (!generatedId) {
      setError('Błąd generowania identyfikatora. Odśwież stronę i spróbuj ponownie.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const { device_type, browser } = getBrowserDevice();

      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: generatedId,
          device_type,
          browser
        }),
      });

      const data = await response.json();

      if (!data.ok && data.shouldRetry && retryCount < 3) {
        // Silent retry on collision
        console.log(`Collision detected, retrying... (attempt ${retryCount + 1}/3)`);
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        const newId = generateSessionID();
        setGeneratedId(newId);
        setDisplayId(newId);
        setLoading(false);
        
        // Auto-retry after short delay
        setTimeout(async () => {
          // Re-attempt login with new ID
          try {
            const response2 = await fetch(`${API_URL}/api/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_id: newId,
                device_type,
                browser
              }),
            });
            const data2 = await response2.json();
            
            if (!data2.ok && data2.shouldRetry && newRetryCount < 3) {
              // Continue retry logic
              console.log(`Collision detected, retrying... (attempt ${newRetryCount + 1}/3)`);
              setRetryCount(newRetryCount + 1);
              const newerIdId = generateSessionID();
              setGeneratedId(newerIdId);
              setDisplayId(newerIdId);
              setTimeout(() => start(), 200);
              return;
            }
            
            if (!data2.ok) {
              setError('Błąd logowania. Spróbuj ponownie.');
              setLoading(false);
              return;
            }
            
            setUser({ user_id: newId });
            setSettings(s => ({...s, stress_timer_enabled: true, stress_timer_duration: 8}));
            nav('/ciss-intro');
          } catch (e) {
            console.error('Retry error:', e);
            setError('Błąd połączenia z serwerem. Sprawdź czy backend jest uruchomiony.');
            setLoading(false);
          }
        }, 200);
        return;
      }

      if (!data.ok) {
        setError('Błąd logowania. Spróbuj ponownie.');
        setLoading(false);
        return;
      }

      setUser({ user_id: generatedId });
      setSettings(s => ({...s, stress_timer_enabled: true, stress_timer_duration: 8}));
      nav('/ciss-intro');
    } catch (error) {
      console.error('Login error:', error);
      setError('Błąd połączenia z serwerem. Sprawdź czy backend jest uruchomiony.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Badanie: Stres &amp; Decyzje Cyberbezpieczeństwa</h1>
          <p className="login-subtitle">Analiza wpływu stylu radzenia sobie ze stresem na decyzje związane z cyberbezpieczeństwem</p>
        </div>

        <div className="login-form">
          <div className="form-section">
            <h2>Identyfikator sesji</h2>
            
            <div className="form-group">
              <p className="form-help">Twój unikalny identyfikator sesji:</p>
              <div className="session-id-display">
                <code>{displayId}</code>
              </div>
              <p className="form-help" style={{marginTop: '1rem', fontSize: '0.9rem'}}>
                Zanotuj ten numer. Będzie Ci potrzebny do śledzenia postępu badania.
              </p>
            </div>

            {error && (
              <div className="form-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <button 
              onClick={start} 
              className="btn-primary btn-large"
              disabled={loading}
            >
              {loading ? 'Inicjowanie sesji...' : 'Rozpocznij badanie'}
            </button>
          </div>

          <div className="login-info">
            <div className="info-box">
              <h3>Co Cię czeka?</h3>
              <ul>
                <li><strong>Krok 1:</strong> Kwestionariusz CISS (48 pytań, ~8 min)</li>
                <li><strong>Krok 2:</strong> Zadania phishingowe (4 emaile, ~3 min)</li>
                <li><strong>Krok 3:</strong> Ankieta podsumowująca (1 min)</li>
              </ul>
              <p className="info-note">Całe badanie zajmie około <strong>15-20 minut</strong>. Twoje odpowiedzi będą anonimowe i będą wykorzystane wyłącznie do badań naukowych.</p>
            </div>
          </div>
        </div>

        <div className="login-footer">
          <p className="footer-text">Bezpieczne badanie • Bez przechowywania danych osobowych • Dane anonimowe</p>
        </div>
      </div>
    </div>
  );
}
