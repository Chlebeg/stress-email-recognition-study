import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';

export default function PhishingIntro() {
  const { user } = useApp();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [exampleAnswer, setExampleAnswer] = useState(null);
  const [isReady, setIsReady] = useState(false);

  if (!user) return <div>Nie jesteś zalogowany. <Link to="/">Wróć</Link></div>;

  return (
    <div className="intro-container">
      <div className={`intro-card phishing-intro-card ${step === 2 ? 'phishing-intro-example' : ''}`}>
        <div className="intro-header">
          <h2>Przygotowanie — Zadania Phishingowe</h2>
          <div className="intro-step-indicator" aria-label={`Krok ${step} z 3`}>
            <span className={step >= 1 ? 'active' : ''}>1</span>
            <span className={step >= 2 ? 'active' : ''}>2</span>
            <span className={step >= 3 ? 'active' : ''}>3</span>
          </div>
        </div>

        {step === 1 && (
          <>
            <div className="intro-content">
              <p>Zaraz będziesz klasyfikować wiadomości e-mail jako phishing lub wiadomości normalne.</p>
              <p><strong>Twoja rola:</strong> przeanalizuj każdą wiadomość i zdecyduj, czy jest to próba phishingu czy normalna wiadomość.</p>
              <p>Dostaniesz serię wiadomości do przeklasyfikowania. Nie będziesz mógł(a) wrócić do poprzedniej wiadomości.</p>
            </div>
            <div className="nav">
              <button onClick={() => setStep(2)}>Zobacz przykład</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="intro-content">
              <p><strong>Przykład</strong>: ta wiadomość nie jest częścią badania i nie zostanie zapisana.</p>
            </div>
            <section className="intro-example-email" aria-label="Przykładowa wiadomość e-mail">
              <div className="webmail-toolbar" aria-label="Pasek narzędzi wiadomości">
                <div className="webmail-navigation">
                  <button className="webmail-icon-button" type="button" disabled aria-label="Wróć do skrzynki">&larr;</button>
                  <div className="webmail-location"><span>Odebrane</span><span aria-hidden="true">/</span><strong>Wiadomość</strong></div>
                </div>
              </div>
              <div className="email-header">
                <div className="email-sender-avatar" aria-hidden="true">P</div>
                <div className="email-heading">
                  <div className="email-subject-line">Twój profil zaufany jest gotowy</div>
                  <div className="email-sender-line"><strong>Profil zaufany</strong> <span>&lt;powiadomienia@pz.gov.pl&gt;</span></div>
                </div>
                <div className="email-header-date">dzisiaj, 10:14</div>
                <div className="email-header-row"><span className="email-label">Do:</span><span className="email-value">badany@przyklad.pl</span></div>
              </div>
              <iframe
                className="intro-example-document"
                src="/email-templates/profil-zaufany-example.html"
                title="Przykładowa wiadomość Profil zaufany"
                sandbox="allow-same-origin"
                onLoad={(event) => {
                  const documentHeight = event.currentTarget.contentDocument?.documentElement.scrollHeight;
                  if (documentHeight) event.currentTarget.style.height = `${documentHeight}px`;
                }}
              />
            </section>
            {!exampleAnswer ? (
              <div className="phishing-question-container">
                <div className="phishing-question">Czy to jest Phishing?</div>
                <div className="phishing-answers">
                  <button className="btn-phishing" onClick={() => setExampleAnswer('phishing')}>Tak</button>
                  <button className="btn-legitimate" onClick={() => setExampleAnswer('legitimate')}>Nie</button>
                </div>
              </div>
            ) : (
              <div className="intro-example-feedback">
                <strong>To normalna wiadomość.</strong>
                <p>Ma charakter informacyjny, nie wywiera presji i nie prosi o wykonanie działania przez podejrzany link lub załącznik.</p>
                <div className="nav"><button onClick={() => setStep(3)}>Dalej</button></div>
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <div className="intro-content">
              <p>Przykład został zakończony. Kolejne wiadomości będą właściwymi zadaniami badania.</p>
              <label className="intro-ready-check">
                <input type="checkbox" checked={isReady} onChange={(event) => setIsReady(event.target.checked)} />
                <span>Jestem gotowy(a) rozpocząć rozpoznawanie wiadomości.</span>
              </label>
            </div>
            <div className="nav">
              <button disabled={!isReady} onClick={() => nav('/phishing')}>Rozpocznij zadania</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
