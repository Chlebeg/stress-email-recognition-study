import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';

export default function CISSIntro() {
  const { user } = useApp();
  const nav = useNavigate();

  if (!user) return <div>Nie jesteś zalogowany. <Link to="/">Wróć</Link></div>;

  return (
    <div className="intro-container ciss-intro-container">
      <div className="intro-card ciss-intro-card">
        <div className="intro-header">
          <h2>Wstęp - Kwestionariusz CISS</h2>
        </div>
        
        <div className="intro-content">
          <p>
            Zaraz przejdziesz do kwestionariusza CISS (Coping Inventory for Stressful Situations). Służy do badania stylów radzenia
            sobie ze stresem i składa się z 48 stwierdzeń, w których badany określa na skali 1–5 częstotliwość swoich reakcji
            w sytuacjach trudnych. <br />
            Odpowiadaj na pytania zgodnie z tym, jak reagujesz w rzeczywistości, a nie jak chciałbyś reagować.
            Nie ma dobrych ani złych odpowiedzi.
          </p>
        </div>

        <div className="nav ciss-intro-actions">
          <button onClick={() => nav('/ciss')}>Przejdź do CISS</button>
        </div>
      </div>
    </div>
  );
}
