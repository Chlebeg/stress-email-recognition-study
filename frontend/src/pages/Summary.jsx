import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';

export default function Summary(){
  const { user, summary = {}, setSummary, cissAnswers, phishingAnswers } = useApp();
  const [age, setAge] = useState((summary && summary.age) || '');
  const [stressRating, setStressRating] = useState((summary && summary.stress_rating) || '');
  const [stressImpactFactor, setStressImpactFactor] = useState((summary && summary.stress_impact_factor) || '');
  const [stressImpactNotes, setStressImpactNotes] = useState((summary && summary.stress_impact_factor_notes) || '');
  const [error, setError] = useState('');
  const nav = useNavigate();

  const submit = async () => {
    // Validate age
    if (!age.trim()) {
      setError('Wpisz swój wiek, aby kontynuować');
      return;
    }
    if (isNaN(age) || parseInt(age) < 1 || parseInt(age) > 100) {
      setError('Wiek musi być liczbą od 1 do 100');
      return;
    }

    // Validate stress rating
    if (!stressRating.trim()) {
      setError('Oceń swój poziom stresu, aby kontynuować');
      return;
    }
    if (isNaN(stressRating) || parseInt(stressRating) < 1 || parseInt(stressRating) > 10) {
      setError('Ocena stresu musi być liczbą od 1 do 10');
      return;
    }

    // Validate stress impact factor
    if (!stressImpactFactor.trim()) {
      setError('Wybierz czynnik wpływający na stres, aby kontynuować');
      return;
    }

    const s = { age, stress_rating: stressRating, stress_impact_factor: stressImpactFactor, stress_impact_factor_notes: stressImpactNotes, notes: { ciss_count: cissAnswers.length, phishing_count: phishingAnswers.length } };
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      await fetch(`${API_URL}/api/summary`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ user_id: user.user_id, summary: s })
      });
      nav('/end');
    } catch (error) {
      console.error('Summary submit error:', error);
      setError('Błąd połączenia z serwerem. Sprawdź czy backend jest uruchomiony.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') submit();
  };

  if (!user) return <div>Nie jesteś zalogowany. <Link to="/">Wróć</Link></div>;

  return (
    <div className="summary-container">
      <div className="summary-card">
        <div className="summary-header">
          <h2>Podsumowanie Badania</h2>
          <p className="summary-subtitle">Prawie gotowe! Wypełnij ostatnie informacje</p>
        </div>

        <div className="summary-content">
          <div className="summary-progress">
            <div className="progress-item completed">
              <div className="progress-number">✓</div>
              <div className="progress-text">
                <strong>Kwestionariusz CISS</strong>
                <span>48 pytań uzupełnionych</span>
              </div>
            </div>
            <div className="progress-item completed">
              <div className="progress-number">✓</div>
              <div className="progress-text">
                <strong>Zadania Phishingowe</strong>
                <span>4 zadania ukończone</span>
              </div>
            </div>
            <div className="progress-item active">
              <div className="progress-number">3</div>
              <div className="progress-text">
                <strong>Ankieta Końcowa</strong>
                <span>Uzupełnianie teraz</span>
              </div>
            </div>
          </div>

          <form className="summary-form">
            <div className="form-group">
              <label htmlFor="age" className="form-label">
                Wiek (lata):
              </label>
              <input
                id="age"
                type="number"
                className="form-input"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="np. 28"
                min="1"
                max="100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="stress-rating" className="form-label">
                Oceń swój poziom stresu podczas badania (1-10):
              </label>
              <div className="stress-scale">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <button
                    key={num}
                    type="button"
                    className={`stress-button ${parseInt(stressRating) === num ? 'selected' : ''}`}
                    onClick={() => {
                      setStressRating(String(num));
                      setError('');
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="scale-labels">
                <span>Bez stresu</span>
                <span>Maksymalny stres</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Który czynnik wpłynął na Twój stres najbardziej?
              </label>
              <div className="stress-factors">
                {[
                  { value: 'timer', label: 'Czas' },
                  { value: 'negative_feedback', label: 'Błędna informacja zwrotna' },
                  { value: 'permission_popup', label: 'Popup-y' },
                  { value: 'other', label: 'Inne' }
                ].map(factor => (
                  <label key={factor.value} className="factor-option">
                    <input
                      type="radio"
                      name="stress-factor"
                      value={factor.value}
                      checked={stressImpactFactor === factor.value}
                      onChange={(e) => {
                        setStressImpactFactor(e.target.value);
                        setError('');
                      }}
                    />
                    <span>{factor.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {stressImpactFactor === 'other' && (
              <div className="form-group">
                <label htmlFor="stress-notes" className="form-label">
                  Opisz jaki był inny czynnik (opcjonalne):
                </label>
                <textarea
                  id="stress-notes"
                  className="form-input"
                  value={stressImpactNotes}
                  onChange={(e) => {
                    setStressImpactNotes(e.target.value);
                    setError('');
                  }}
                  placeholder="Opisz inny czynnik wpływający na stres..."
                  rows="4"
                />
              </div>
            )}

            {stressImpactFactor && stressImpactFactor !== 'other' && (
              <div className="form-group">
                <label htmlFor="stress-notes" className="form-label">
                  Dodatkowe uwagi (opcjonalne):
                </label>
                <textarea
                  id="stress-notes"
                  className="form-input"
                  value={stressImpactNotes}
                  onChange={(e) => {
                    setStressImpactNotes(e.target.value);
                    setError('');
                  }}
                  placeholder="Podziel się dodatkowymi uwagami..."
                  rows="3"
                />
              </div>
            )}

            {error && (
              <div className="form-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <button type="button" onClick={submit} className="btn-primary btn-large">
              Zakończ badanie i zapisz wyniki
            </button>

            <div className="summary-note">
              <p>
                Dziękujemy za udział w badaniu! Twoje odpowiedzi będą anonimowe 
                i będą wykorzystane do analizy wpływu stresu na decyzje bezpieczeństwa.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
