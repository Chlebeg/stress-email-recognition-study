import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import useClockSound from '../hooks/useClockSound';
import PermissionPopup from '../components/PermissionPopup';

export default function Phishing(){
  const { user, settings, phishingAnswers, setPhishingAnswers } = useApp();
  const [tasks, setTasks] = useState([]);
  const [index, setIndex] = useState(0);
  const [timerLeft, setTimerLeft] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [permissionPopup, setPermissionPopup] = useState(null);
  const [permissionResponse, setPermissionResponse] = useState(null);
  const timerRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const permissionPopupTimeoutRef = useRef(null);
  const { playTick, playTock } = useClockSound();
  const soundCounterRef = useRef(0);
  const nav = useNavigate();

  useEffect(()=> {
    fetch('/phishing.json').then(r=>r.json()).then(data=>setTasks(data.tasks || []));
  }, []);

  useEffect(() => {
    window.history.pushState(null, document.title, window.location.href);
    const onPop = () => {
      window.history.pushState(null, document.title, window.location.href);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    return () => {
      clearInterval(feedbackTimerRef.current);
      clearTimeout(permissionPopupTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    setTimedOut(false);
    setFeedbackMessage(null);
    setPermissionPopup(null);
    setPermissionResponse(null);
    clearTimer();
    clearInterval(feedbackTimerRef.current);
    clearTimeout(permissionPopupTimeoutRef.current);
    const t = tasks[index];
    if (!t) return;
    
    // Trigger permission popup if in task stressors
    if ((t.stressors || []).includes('permission_popup')) {
      setTimeout(() => {
        setPermissionPopup(true);
      }, 300);
    }
    
    if (settings.task_timer_enabled && (t.stressors || []).includes('timer')) {
      setTimerLeft(settings.task_timer_duration);
      soundCounterRef.current = 0;
      timerRef.current = setInterval(()=> {
        setTimerLeft(prev => {
          const currentTime = prev - 1;
          
          if (currentTime <= 0) {
            clearTimer();
            setTimedOut(true);
            return 0;
          }
          
          // Play tick/tock sound - increase volume only in last 3 seconds
          // Volume increases as timer gets lower
          let volume = currentTime <= 3 ? 0.3 + (1 - (currentTime / 3)) * 0.2 : 0.1; // 0.1 normally, 0.3-0.5 in last 3 seconds
          
          // Only play sound in last 10 seconds or if less than 25% time remaining
          if (currentTime <= 10 || currentTime <= (settings.task_timer_duration * 0.25)) {
            // Alternate between tick and tock
            soundCounterRef.current += 1;
            if (soundCounterRef.current % 2 === 0) {
              playTick(volume);
            } else {
              playTock(volume);
            }
          }
          
          return currentTime;
        });
      }, 1000);
    } else {
      setTimerLeft(null);
    }
    return () => clearTimer();
    // eslint-disable-next-line
  }, [index, tasks, playTick, playTock]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Parse body content for button markers and images
  const parseBodyContent = (bodyText) => {
    const parts = [];
    const buttonRegex = /\[BUTTON:\s*(.+?)\s*→\s*(.+?)\]/g;
    const imageRegex = /\[IMAGE:\s*(.+?)\]/g;
    
    let lastIndex = 0;
    let match;

    // Process buttons first
    const matches = [...bodyText.matchAll(buttonRegex)];
    const imageMatches = [...bodyText.matchAll(imageRegex)];

    // Simple parser - split by button markers
    const sections = bodyText.split(/\[BUTTON:[^\]]+\]/);
    const buttons = [];
    
    while ((match = buttonRegex.exec(bodyText)) !== null) {
      buttons.push({
        text: match[1].trim(),
        url: match[2].trim()
      });
    }

    // Return sections and buttons separately
    return { sections, buttons };
  };

  if (!user) return <div>Nie jesteś zalogowany. <Link to="/">Wróć</Link></div>;

  const t = tasks[index];
  if (!t) return <div>Ładowanie zadań phishingowych...</div>;

  const answerNow = (ans, afterTimeout=false) => {
    const row = {
      task_id: t.id,
      subject: t.subject,
      is_phishing: t.correct === 'phishing',
      user_is_phishing: ans === 'phishing',
      stressors: t.stressors || [],
      after_timeout: afterTimeout
    };
    const arr = [...phishingAnswers, row];
    setPhishingAnswers(arr);

    // Check if this question has negative feedback stressor
    if ((t.stressors || []).includes('negative_feedback')) {
      clearTimer(); // Stop the timer
      setFeedbackMessage('Odpowiedziałeś błędnie');
      clearInterval(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => {
        setFeedbackMessage(null);
        if (index < tasks.length - 1) {
          setIndex(index + 1);
        } else {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
          fetch(`${API_URL}/api/phishing`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ user_id: user.user_id, answers: arr })
          }).then(()=> nav('/summary')).catch(()=> nav('/summary'));
        }
      }, 5000);
    } else {
      if (index < tasks.length -1) {
        setIndex(index+1);
      } else {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        fetch(`${API_URL}/api/phishing`, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ user_id: user.user_id, answers: arr })
        }).then(()=> nav('/summary')).catch(()=> nav('/summary'));
      }
    }
  };

  const { sections, buttons } = parseBodyContent(t.body);

  return (
    <div className="page-container">
      <div className="page-card">
        <div className="content-header">
          <h2>Zadania: Rozpoznawanie Phishingu</h2>
          <div className="task-progress">E-mail {index+1} z {tasks.length}</div>
        </div>

        <div className={`email-view ${timedOut ? 'email-hazed' : ''}`}>
          {/* Email Header */}
          <div className="email-header">
            <div className="email-header-row">
              <span className="email-label">Od:</span>
              <span className="email-value">{t.from} &lt;{t.fromEmail}&gt;</span>
            </div>
            <div className="email-header-row">
              <span className="email-label">Do:</span>
              <span className="email-value">{t.to}</span>
            </div>
            <div className="email-header-row">
              <span className="email-label">Data:</span>
              <span className="email-value">{t.date}</span>
            </div>
            <div className="email-header-row email-subject">
              <span className="email-label">Temat:</span>
              <span className="email-value">{t.subject}</span>
            </div>
          </div>

          {/* Email Body */}
          <div className="email-body">
            {sections.map((section, i) => (
              <div key={i}>
                {section.split('\n').map((line, lineIdx) => (
                  <p key={lineIdx}>{line || '\u00A0'}</p>
                ))}
              </div>
            ))}

            {/* Display buttons from body */}
            {buttons.length > 0 && (
              <div className="email-cta">
                {buttons.map((btn, i) => (
                  <div key={i} className="cta-item">
                    <button className="cta-button" disabled>{btn.text}</button>
                    <div className="cta-url">{btn.url}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timer Display */}
          {(settings.task_timer_enabled && (t.stressors || []).includes('timer')) && (
            <div className={`timer-box ${timerLeft <= 10 ? 'timer-warning' : ''}`}>
              <div className="timer-label">Pozostały czas:</div>
              <div className="timer-value">{timerLeft > 0 ? timerLeft : 0}s</div>
            </div>
          )}

          {/* Question and Answer Buttons */}
          <div className="phishing-question-container">
            <div className="phishing-question">Czy to jest Phishing?</div>
            
            <div className="phishing-answers">
              <button 
                className="btn-phishing"
                onClick={()=>answerNow('phishing')}
                disabled={timedOut}
              >
                Tak
              </button>
              <button 
                className="btn-legitimate"
                onClick={()=>answerNow('normalny')}
                disabled={timedOut}
              >
                Nie
              </button>
            </div>
          </div>

          {/* Timeout Modal - Hazed Overlay */}
          {timedOut && (
            <div className="timeout-overlay">
              <div className="timeout-box">
                <div className="timeout-message">Czas minął. Czy to jest Phishing?</div>
                <div className="phishing-answers">
                  <button 
                    className="btn-phishing"
                    onClick={()=>answerNow('phishing', true)}
                  >
                    Tak
                  </button>
                  <button 
                    className="btn-legitimate"
                    onClick={()=>answerNow('normalny', true)}
                  >
                    Nie
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Negative Feedback Modal */}
          {feedbackMessage && (
            <div className="feedback-overlay">
              <div className="feedback-box feedback-negative">
                <div className="feedback-message">{feedbackMessage}</div>
              </div>
            </div>
          )}

          {/* Permission Popup */}
          {permissionPopup && (
            <PermissionPopup
              onAllow={() => {
                setPermissionResponse('allow');
                // Wait 7 seconds total (2s popup dismiss + 5s confirmation) before clearing
                clearTimeout(permissionPopupTimeoutRef.current);
                permissionPopupTimeoutRef.current = setTimeout(() => {
                  setPermissionPopup(null);
                }, 7000);
              }}
              onBlock={() => {
                setPermissionResponse('block');
                // Wait 7 seconds total (2s popup dismiss + 5s confirmation) before clearing
                clearTimeout(permissionPopupTimeoutRef.current);
                permissionPopupTimeoutRef.current = setTimeout(() => {
                  setPermissionPopup(null);
                }, 7000);
              }}
              onTimeout={() => {
                setPermissionResponse('timeout');
                setPermissionPopup(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
