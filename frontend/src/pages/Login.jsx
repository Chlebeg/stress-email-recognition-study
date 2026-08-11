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
      nav('/pre-experiment');
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
          <p className="login-subtitle">Badanie jest realizowane w ramach pracy magisterskiej na kierunku Cyberbezpieczeństwo w Akademii Górniczo-Hutniczej im. Stanisława Staszica w Krakowie.</p>
          <p className="login-contact">Kontakt w sprawie badania: mplich@student.agh.edu.pl</p>
        </div>

        <div className="login-scroll">
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
          </div>

          <div className="login-info">
            <div className="info-box">
              <h3>Informacje o badaniu</h3>
              <p>Udział w badaniu jest dobrowolny. Możesz z niego zrezygnować w dowolnym momencie, po prostu zamykając stronę.</p>
              <p className="info-note">Wypełnienie ankiety zajmuje około <strong>15 minut</strong>. Wiadomości e-mail i pozostałe elementy widoczne w badaniu są symulacją. Nie klikaj w linki ani nie podawaj żadnych danych - wystarczy zaznaczać odpowiedzi.</p>
              <p className="info-note">Nie zbieramy danych osobowych ani kontaktowych. Nie pytamy o imię i nazwisko, adres e-mail, numer telefonu ani inne informacje pozwalające Cię zidentyfikować. Zebrane odpowiedzi posłużą wyłącznie do celów naukowych.</p>
              <p className="info-note">Niektóre zadania mogą wywołać chwilowe napięcie. Jeśli poczujesz, że badanie jest dla Ciebie zbyt obciążające lub pogorszy się Twoje samopoczucie, przerwij udział.</p>
            </div>
          </div>

          </div>
        </div>

        <div className="login-actions">
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
      </div>
    </div>
  );
}
