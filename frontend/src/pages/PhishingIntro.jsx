import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';

export default function PhishingIntro() {
  const { user } = useApp();
  const nav = useNavigate();

  if (!user) return <div>Nie jesteś zalogowany. <Link to="/">Wróć</Link></div>;

  return (
    <div className="intro-container">
      <div className="intro-card">
        <div className="intro-header">
          <h2>Przygotowanie — Zadania Phishingowe</h2>
        </div>
        
        <div className="intro-content">
          <p>
            Zaraz będziesz klasyfikować wiadomości e-mail jako phishing 
            lub wiadomości normalne.
          </p>
          <p>
            <strong>Twoja rola:</strong> Przeanalizuj każdą wiadomość i zdecyduj, 
            czy jest to próba phishingu czy normalna wiadomość.
          </p>
          <p>
            Dostaniesz serię wiadomości do przeklasyfikowania. Nie będziesz mógł(a) 
            wrócić do poprzedniej wiadomości.
          </p>
        </div>

        <div className="nav">
          <button onClick={() => nav('/phishing')}>Przejdź do Zadań</button>
        </div>
      </div>
    </div>
  );
}
