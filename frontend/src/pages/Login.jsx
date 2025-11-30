import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext';

export default function Login(){
  const [id, setId] = useState('');
  const [error, setError] = useState('');
  const { setUser, setSettings } = useApp();
  const nav = useNavigate();

  const start = async () => {
    if (!id.trim()) {
      setError('Wpisz identyfikator, aby kontynuować');
      return;
    }
    
    try {
      await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: id.trim() }),
      });
      
      setUser({ user_id: id.trim() });
      setSettings(s => ({...s, stress_timer_enabled: true, stress_timer_duration: 8}));
      nav('/ciss-intro');
    } catch (error) {
      console.error('Login error:', error);
      setError('Błąd połączenia z serwerem. Sprawdź czy backend jest uruchomiony.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') start();
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
            <h2>Logowanie</h2>
            
            <div className="form-group">
              <label htmlFor="participant-id" className="form-label">
                Identyfikator uczestnika:
              </label>
              <input
                id="participant-id"
                type="text"
                className="form-input"
                value={id}
                onChange={(e) => {
                  setId(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="np. badany_01, participant_01, ID123"
                autoFocus
              />
              <p className="form-help">Wpisz kod identyfikacyjny przyznany przez badacza</p>
            </div>

            {error && (
              <div className="form-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <button onClick={start} className="btn-primary btn-large">
              Rozpocznij badanie
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
