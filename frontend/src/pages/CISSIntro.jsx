import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';

export default function CISSIntro() {
  const { user } = useApp();
  const nav = useNavigate();

  if (!user) return <div>Nie jesteś zalogowany. <Link to="/">Wróć</Link></div>;

  return (
    <div className="intro-container">
      <div className="intro-card">
        <div className="intro-header">
          <h2>Przygotowanie — CISS Kwestionariusz</h2>
        </div>
        
        <div className="intro-content">
          <p>
            Zaraz przejdziesz do kwestionariusza CISS. Jest to standardowy test 
            psychologiczny mierzący style radzenia sobie ze stresem.
          </p>
        </div>

        <div className="nav">
          <button onClick={() => nav('/ciss')}>Przejdź do CISS</button>
        </div>
      </div>
    </div>
  );
}
