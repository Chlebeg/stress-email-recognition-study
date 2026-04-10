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

const isDev = import.meta.env.MODE === 'development';

export default function Login(){
  const [generatedId, setGeneratedId] = useState('');
  const [displayId, setDisplayId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useApp();
  const nav = useNavigate();

  // Generate ID on mount
  useEffect(() => {
    const id = generateSessionID();
    setGeneratedId(id);
    setDisplayId(id);
  }, []);

  // Recursive login attempt to handle user_id collisions without stale closure
  const attemptLogin = async (userId, attempt) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const { device_type, browser } = getBrowserDevice();
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, device_type, browser }),
    });
    const data = await response.json();
    if (data.shouldRetry && attempt < 3) {
      const newId = generateSessionID();
      setGeneratedId(newId);
      setDisplayId(newId);
      return new Promise(resolve =>
        setTimeout(() => resolve(attemptLogin(newId, attempt + 1)), 200)
      );
    }
    return { data, userId };
  };

  const start = async () => {
    if (!generatedId) {
      setError('Błąd generowania identyfikatora. Odśwież stronę i spróbuj ponownie.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, userId } = await attemptLogin(generatedId, 0);

      if (!data.ok) {
        setError('Błąd logowania. Spróbuj ponownie.');
        setLoading(false);
        return;
      }

      setUser({ user_id: userId });
      nav('/ciss-intro');
    } catch (e) {
      setError('Błąd połączenia z serwerem. Sprawdź czy backend jest uruchomiony.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Badanie: Analiza wpływu stylu radzenia sobie ze stresem na decyzje związane z cyberbezpieczeństwem</h1>
          <p className="login-subtitle">Ankieta ta jest częścią badania realizowanego w ramach pracy magisterskiej pod tytułem: Analiza wpływu stylu radzenia sobie ze stresem na decyzje związane z cyberbezpieczeństwem. Proszę odpowiedzieć na wszystkie pytania zgodnie z własnymi odczuciami i doświadczeniami.</p>
          <p className='login-subtitle'>Badanie prowadzone jest w ramach studiów 2 stopnia na kierunku Cyberbezpieczeństwo w Instytucie Telekomunikacji na Wydziale Informatyki, Elektroniki i Telekomunikacji na Akademii Górniczo-Hutniczej im. Stanisława Staszica w Krakowie. <br /> Kontakt - mplich@student.agh.edu.pl</p>
        </div>

        <div className="login-form">
          <div className="form-section">
            {isDev && (
              <>
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
              </>
            )}

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
                <li><strong>Krok 2:</strong> Zadania phishingowe (5 email-i, ~3 min)</li>
                <li><strong>Krok 3:</strong> Ankieta podsumowująca (1 min)</li>
              </ul>
              <p className="info-note">Całe badanie zajmie do <strong>15 minut</strong>. Twoje odpowiedzi będą anonimowe i będą wykorzystane wyłącznie do badań naukowych.</p>
            </div>
          </div>
        </div>

        <div className="login-footer">
          <p className="footer-text">Ankieta jest w pełni anonimowa i nie są zbierane ani przechowywane dane osobiste ani kontaktowe osób ankietowanych.</p>
        </div>
      </div>
    </div>
  );
}
