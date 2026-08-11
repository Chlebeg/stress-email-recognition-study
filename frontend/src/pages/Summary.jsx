import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { Stressors } from '../constants/Stressors';

const NO_STRESS = 'no_stress';
const FEELING_OPTIONS = [
  {
    value: Stressors.TIMER,
    label: 'Poczucie szybko uciekającego czasu wywoływało we mnie niepokój.'
  },
  {
    value: Stressors.NEGATIVE_FEEDBACK,
    label: 'Otrzymywanie informacji sugerujących błędną lub słabszą odpowiedź wywoływało we mnie frustrację lub zwątpienie.'
  },
  {
    value: Stressors.PERMISSION_POPUP_MICROPHONE,
    label: 'Prośba o dostęp do mikrofonu wywoływała we mnie niepewność lub rozpraszała mnie podczas wykonywania zadania.'
  },
  {
    value: Stressors.PERMISSION_POPUP_CAMERA,
    label: 'Prośba o dostęp do kamery wywoływała we mnie niepewność lub rozpraszała mnie podczas wykonywania zadania.'
  },
  {
    value: Stressors.EMAIL_BLUR,
    label: 'Zamazanie treści wiadomości utrudniało mi analizę i powodowało napięcie.'
  },
  {
    value: Stressors.RECORDING,
    label: 'Informacja o nagrywaniu mojej aktywności powodowała, że czułem się obserwowany lub oceniany.'
  },
  {
    value: Stressors.SOCIAL_COMPARISON,
    label: 'Porównanie mojego tempa z innymi osobami wywoływało we mnie presję.'
  },
  {
    value: Stressors.COGNITIVE_OVERLOAD,
    label: 'Konieczność zapamiętania dodatkowych informacji przed zadaniem utrudniała mi skupienie.'
  },
  {
    value: NO_STRESS,
    label: 'Nie odczuwałem stresu podczas wykonywanego badania.'
  }
];

export default function Summary(){
  const { user, summary = {}, setSummary } = useApp();
  const [postStressRating, setPostStressRating] = useState((summary && summary.post_stress_rating) || '');
  const [stressImpactFactors, setStressImpactFactors] = useState(() => {
    const savedFactors = summary && summary.stress_impact_factor;
    return Array.isArray(savedFactors) ? savedFactors : savedFactors ? [savedFactors] : [];
  });
  const [stressImpactNotes, setStressImpactNotes] = useState((summary && summary.stress_impact_factor_notes) || '');
  const [error, setError] = useState('');
  const nav = useNavigate();

  const submit = async () => {
    // Validate stress rating
    if (!postStressRating.trim()) {
      setError('Oceń swój poziom stresu, aby kontynuować');
      return;
    }
    if (isNaN(postStressRating) || parseInt(postStressRating) < 1 || parseInt(postStressRating) > 10) {
      setError('Ocena stresu musi być liczbą od 1 do 10');
      return;
    }

    if (stressImpactFactors.length === 0) {
      setError('Wybierz co najmniej jedną odpowiedź dotyczącą swoich odczuć');
      return;
    }

    const s = { post_stress_rating: postStressRating, stress_impact_factor: stressImpactFactors, stress_impact_factor_notes: stressImpactNotes };
    setSummary(s);
    
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

  const toggleFeeling = (value) => {
    if (value === NO_STRESS) {
      setStressImpactFactors(stressImpactFactors.includes(NO_STRESS) ? [] : [NO_STRESS]);
      setError('');
      return;
    }

    const selectedFactors = stressImpactFactors.filter((factor) => factor !== NO_STRESS);
    if (selectedFactors.includes(value)) {
      setStressImpactFactors(selectedFactors.filter((factor) => factor !== value));
    } else if (selectedFactors.length < 3) {
      setStressImpactFactors([...selectedFactors, value]);
    } else {
      setError('Możesz wybrać maksymalnie trzy odpowiedzi');
      return;
    }

    setError('');
  };

  if (!user) return <div>Nie jesteś zalogowany. <Link to="/">Wróć</Link></div>;

  return (
    <div className="summary-container">
      <div className="summary-card">
        <div className="summary-header">
          <h2>Podsumowanie Badania</h2>
        </div>

        <div className="summary-scroll">
          <div className="summary-content">
          <p className="summary-intro">Prawie gotowe! Do zakończenia badania pozostało uzupełnić ostatnie informacje.</p>

          <form className="summary-form">
            <div className="form-group">
              <label htmlFor="post-stress-rating" className="form-label">
                Oceń swój poziom stresu po zakończeniu badania (1-10):
              </label>
              <div className="stress-scale">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <button
                    key={num}
                    type="button"
                    className={`stress-button ${parseInt(postStressRating) === num ? 'selected' : ''}`}
                    onClick={() => {
                      setPostStressRating(String(num));
                      setError('');
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="scale-labels">
                <span>Brak stresu</span>
                <span>Wysoki poziom stresu</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Które z poniższych zdań najlepiej opisuje Twoje odczucia podczas badania? Wybierz maksymalnie trzy odpowiedzi:
              </label>
              <div className="stress-factors">
                {FEELING_OPTIONS.map(factor => (
                  <label key={factor.value} className="factor-option">
                    <input
                      type="checkbox"
                      value={factor.value}
                      checked={stressImpactFactors.includes(factor.value)}
                      onChange={() => toggleFeeling(factor.value)}
                    />
                    <span>{factor.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {stressImpactFactors.length > 0 && (
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

            <div className="summary-note">
              <p>
                Twoje odpowiedzi będą anonimowe i będą jednynie wykorzystane do analizy badawczej.
              </p>
            </div>
          </form>
          </div>
        </div>

        <div className="summary-actions">
          {error && (
            <div className="form-error">
              <span>⚠️</span> {error}
            </div>
          )}
          <button type="button" onClick={submit} className="btn-primary btn-large">
            Zakończ badanie i zapisz wyniki
          </button>
        </div>
      </div>
    </div>
  );
}
