import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Mężczyzna' },
  { value: 'female', label: 'Kobieta' },
  { value: 'other', label: 'Inne' },
  { value: 'prefer_not_to_say', label: 'Nie chcę podawać' }
];

export default function PreExperiment() {
  const { user, preExperimentData = {}, setPreExperimentData } = useApp();
  const [age, setAge] = useState(preExperimentData.age || '');
  const [gender, setGender] = useState(preExperimentData.gender || '');
  const [technicalBackground, setTechnicalBackground] = useState(preExperimentData.technical_background || '');
  const [preStressRating, setPreStressRating] = useState(preExperimentData.pre_stress_rating || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    if (!age.trim() || isNaN(age) || parseInt(age, 10) < 1 || parseInt(age, 10) > 100) {
      setError('Wiek musi być liczbą od 1 do 100');
      return;
    }
    if (!gender) {
      setError('Wybierz odpowiedź dotyczącą płci');
      return;
    }
    if (!technicalBackground) {
      setError('Wybierz odpowiedź dotyczącą doświadczenia technicznego');
      return;
    }
    if (!preStressRating || isNaN(preStressRating) || parseInt(preStressRating, 10) < 1 || parseInt(preStressRating, 10) > 10) {
      setError('Ocena stresu musi być liczbą od 1 do 10');
      return;
    }

    const data = {
      age,
      gender,
      technical_background: technicalBackground,
      pre_stress_rating: preStressRating
    };

    setIsSubmitting(true);
    setError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/pre-experiment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, pre_experiment_data: data })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setPreExperimentData(data);
      navigate('/ciss-intro');
    } catch (submitError) {
      console.error('Pre-experiment data submit error:', submitError);
      setError('Błąd połączenia z serwerem. Sprawdź czy backend jest uruchomiony.');
      setIsSubmitting(false);
    }
  };

  if (!user) return <div>Nie jesteś zalogowany. <Link to="/">Wróć</Link></div>;

  return (
    <div className="summary-container">
      <div className="summary-card">
        <div className="summary-header">
          <h2>Informacje przed badaniem</h2>
        </div>

        <div className="summary-scroll">
          <div className="summary-content">
            <p className="summary-intro">
              Przed rozpoczęciem badania odpowiedz na kilka pytań dotyczących Ciebie i Twojego samopoczucia.
            </p>

            <form className="summary-form">
              <div className="form-group">
                <label htmlFor="pre-age" className="form-label">Wiek (lata):</label>
                <input
                  id="pre-age"
                  type="number"
                  className="form-input"
                  value={age}
                  onChange={(event) => { setAge(event.target.value); setError(''); }}
                  min="1"
                  max="100"
                  placeholder="np. 28"
                />
              </div>

              <div className="form-group">
                <span className="form-label">Płeć:</span>
                <div className="pre-gender-options">
                  {GENDER_OPTIONS.map((option) => (
                    <label key={option.value} className="technical-background-option">
                      <input
                        type="radio"
                        name="gender"
                        value={option.value}
                        checked={gender === option.value}
                        onChange={(event) => { setGender(event.target.value); setError(''); }}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <span className="form-label">Czy pracujesz zawodowo w obszarze szeroko pojętego IT lub posiadasz wykształcenie związane z tym obszarem?</span>
                <div className="technical-background-options">
                  {['yes', 'no'].map((value) => (
                    <label key={value} className="technical-background-option">
                      <input
                        type="radio"
                        name="technical-background"
                        value={value}
                        checked={technicalBackground === value}
                        onChange={(event) => { setTechnicalBackground(event.target.value); setError(''); }}
                      />
                      <span>{value === 'yes' ? 'Tak' : 'Nie'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Oceń swój poziom stresu przed rozpoczęciem badania (1-10):</label>
                <div className="stress-scale">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
                    <button
                      key={number}
                      type="button"
                      className={`stress-button ${parseInt(preStressRating, 10) === number ? 'selected' : ''}`}
                      onClick={() => { setPreStressRating(String(number)); setError(''); }}
                    >
                      {number}
                    </button>
                  ))}
                </div>
                <div className="scale-labels">
                  <span>Brak stresu</span>
                  <span>Wysoki poziom stresu</span>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="summary-actions">
          {error && <div className="form-error"><span>⚠️</span> {error}</div>}
          <button type="button" onClick={submit} className="btn-primary btn-large" disabled={isSubmitting}>
            {isSubmitting ? 'Zapisywanie...' : 'Przejdź do instrukcji badania'}
          </button>
        </div>
      </div>
    </div>
  );
}
