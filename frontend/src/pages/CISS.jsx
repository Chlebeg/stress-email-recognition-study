import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';

export default function CISS(){
  const { user, cissAnswers, setCissAnswers } = useApp();
  const [questions, setQuestions] = useState([]);
  const [validationError, setValidationError] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    // Load questions from JSON
    fetch('/ciss.json').then(r=>r.json()).then(data=>setQuestions(data.items || []));
  }, []);

  if (!user) return <div>Nie jesteś zalogowany. <Link to="/">Wróć</Link></div>;

  // Select answer for a specific question by ID
  const select = (questionId, answer) => {
    const updated = { ...cissAnswers };
    updated[questionId] = answer;
    setCissAnswers(updated);
    setValidationError(''); // Clear error when user makes selection
  };

  // Validate all 48 questions have answers
  const validateAllAnswered = () => {
    const unanswered = questions.filter(q => !cissAnswers[q.id]);
    if (unanswered.length > 0) {
      setValidationError(`Musisz odpowiedzieć na wszystkie pytania. Brakuje ${unanswered.length} odpowiedzi.`);
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validateAllAnswered()) return;

    try {
      // Send answers to backend
      const answerArray = questions.map(q => ({
        question_id: q.id,
        answer: cissAnswers[q.id]
      }));

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      await fetch(`${API_URL}/api/ciss`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ user_id: user.user_id, answers: answerArray })
      });
      nav('/phishing-intro');
    } catch (error) {
      console.error('CISS submit error:', error);
      alert('Błąd podczas zapisywania odpowiedzi. Sprawdź połączenie z serwerem.');
    }
  };

  const answeredCount = Object.keys(cissAnswers).length;

  return (
    <div className="page-container">
      <div className="page-card">
        <div className="content-header">
          <h2>CISS — Kwestionariusz</h2>
        </div>

        <div className="content-body">

        <div className="instruction">
          <p>
            <strong>Instrukcja:</strong> Poniższe zadania opisują różne reakcje ludzi na trudne, 
            przykre, stresujące sytuacje w życiu. Dla każdego zdania wskaż, w jakim stopniu 
            odpowiada Ci ta reakcja, używając poniższej skali.
          </p>
          <p className="scale-info">
            Skala: Nigdy → Bardzo rzadko → Czasami → Często → Bardzo często
          </p>
        </div>

        <div className="progress-info">
          Odpowiadasz na <strong>{answeredCount}</strong> z <strong>{questions.length}</strong> pytań
        </div>

        {validationError && (
          <div className="error-message">
            {validationError}
          </div>
        )}

        {questions.length > 0 ? (
          <>
            <div className="questions-full-page">
              {questions.map((q, idx) => {
                const isAnswered = !!cissAnswers[q.id];
                return (
                  <div
                    key={q.id}
                    className={`question-block ${isAnswered ? 'answered' : 'unanswered'}`}
                  >
                    <div className="question-header">
                      <strong>{idx + 1}. </strong>{q.text}
                    </div>
                    <div className="options-radio">
                      {q.options.map(opt => (
                        <label key={opt} className="option-label">
                          <input
                            type="radio"
                            name={`ciss-${q.id}`}
                            value={opt}
                            checked={cissAnswers[q.id] === opt}
                            onChange={() => select(q.id, opt)}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="ciss-submit">
              <button
                onClick={submit}
                disabled={answeredCount < questions.length}
                className="submit-btn"
              >
                Zakończ CISS i przejdź dalej
              </button>
              <div className="muted">
                Możesz przewijać i zmieniać swoje odpowiedzi w dowolnym momencie przed wysłaniem.
              </div>
            </div>
          </>
        ) : (
          <div>Ładowanie pytań...</div>
        )}
        </div>
      </div>
    </div>
  );
}
