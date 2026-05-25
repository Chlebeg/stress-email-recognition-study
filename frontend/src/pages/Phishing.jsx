import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import useClockSound from '../hooks/useClockSound';
import PermissionPopup from '../components/PermissionPopup';
import VolumeMixer from '../components/VolumeMixer';
import { Stressors } from '../constants/Stressors';

// Component to try loading image with multiple extensions
function ImageWithFallback({ basePath, alt, className }) {
  const extensions = ['.png', '.jpg', '.jpeg', '.svg'];
  const [currentExtIndex, setCurrentExtIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  // Remove existing extension from basePath if present
  const cleanBasePath = basePath.replace(/\.(png|jpg|jpeg|svg)$/i, '');

  const handleError = () => {
    const nextIndex = currentExtIndex + 1;
    if (nextIndex < extensions.length) {
      setCurrentExtIndex(nextIndex);
    } else {
      setFailed(true);
    }
  };

  if (failed) return null;

  return (
    <img 
      src={`${cleanBasePath}${extensions[currentExtIndex]}`} 
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}

export default function Phishing(){
  const { user, settings, phishingAnswers, setPhishingAnswers } = useApp();
  const [tasks, setTasks] = useState([]);
  const [index, setIndex] = useState(0);
  const [timerLeft, setTimerLeft] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [permissionPopup, setPermissionPopup] = useState(null);
  const [permissionType, setPermissionType] = useState(null); // 'microphone' or 'camera'
  const [permissionTypeForMixer, setPermissionTypeForMixer] = useState(null); // Persist for mixer
  const [permissionResponse, setPermissionResponse] = useState(null);
  const [showMixer, setShowMixer] = useState(false); // Show mixer when confirmation appears
  const [showCameraLoading, setShowCameraLoading] = useState(false);
  const timerRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const permissionPopupTimeoutRef = useRef(null);
  const { scheduleAllTicks, cancelScheduled } = useClockSound();
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
    setShowMixer(false);
    setPermissionType(null);
    setPermissionTypeForMixer(null);
    setShowCameraLoading(false);
    clearTimer();
    clearInterval(feedbackTimerRef.current);
    clearTimeout(permissionPopupTimeoutRef.current);
    const t = tasks[index];
    if (!t) return;
    
    // Trigger permission popup if in task stressors
    const stressors = t.stressors || [];
    const popupType = stressors.includes(Stressors.PERMISSION_POPUP_CAMERA)
      ? 'camera'
      : stressors.includes(Stressors.PERMISSION_POPUP_MICROPHONE)
        ? 'microphone'
        : null;
    if (popupType) {
      const timeoutId = setTimeout(() => {
        setPermissionType(popupType);
        setPermissionTypeForMixer(popupType);
        setPermissionPopup(true);
      }, 300);
      permissionPopupTimeoutRef.current = timeoutId;
    }
    
    if (settings.task_timer_enabled && (t.stressors || []).includes(Stressors.TIMER)) {
      setTimerLeft(settings.task_timer_duration);
      scheduleAllTicks(settings.task_timer_duration);
      timerRef.current = setInterval(() => {
        setTimerLeft(prev => {
          const currentTime = prev - 1;
          if (currentTime <= 0) {
            clearTimer();
            setTimedOut(true);
            return 0;
          }
          return currentTime;
        });
      }, 1000);
    } else {
      setTimerLeft(null);
    }
    return () => clearTimer();
    // eslint-disable-next-line
  }, [index, tasks, scheduleAllTicks]);

  const clearTimer = () => {
    cancelScheduled();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Parse body content for the new format with layout directives, logos, banners, buttons, and sections
  const parseBodyContent = (bodyText) => {
    const parts = {
      layout: null,
      logoAlign: null,
      logoUrl: null,
      separatorLine: false,
      sections: [],
      buttons: [],
      banners: []
    };

    const lines = bodyText.split('\n');
    let currentSection = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Layout directive
      if (line.startsWith('[LAYOUT:')) {
        const match = line.match(/\[LAYOUT:\s*(.+?)\]/);
        if (match) parts.layout = match[1].trim();
      }
      // Logo with alignment
      else if (line.startsWith('[LOGO_ALIGN_')) {
        const match = line.match(/\[LOGO_ALIGN_(\w+):\s*(.+?)\]/);
        if (match) {
          // Save current section before logo
          if (currentSection.length > 0) {
            parts.sections.push(currentSection.join('\n'));
            currentSection = [];
          }
          parts.logoAlign = match[1].toLowerCase();
          parts.logoUrl = match[2].trim();
        }
      }
      // Separator line
      else if (line.startsWith('[SEPARATOR_LINE_')) {
        parts.separatorLine = true;
      }
      // Section markers
      else if (line.startsWith('[SECTION:')) {
        // Save current section before starting new one
        if (currentSection.length > 0) {
          parts.sections.push(currentSection.join('\n'));
          currentSection = [];
        }
      }
      else if (line === '[END_SECTION]') {
        // End of section - save it
        if (currentSection.length > 0) {
          parts.sections.push(currentSection.join('\n'));
          currentSection = [];
        }
      }
      // Banner with position
      else if (line.startsWith('[BANNER_')) {
        const match = line.match(/\[BANNER_(?:IMG|BOTTOM):\s*(.+?)\]/);
        if (match) {
          // Save current section before banner
          if (currentSection.length > 0) {
            parts.sections.push(currentSection.join('\n'));
            currentSection = [];
          }
          parts.banners.push({
            url: match[1].trim(),
            position: line.includes('BOTTOM') ? 'bottom' : 'inline'
          });
        }
      }
      // Button with style
      else if (line.startsWith('[BUTTON_')) {
        const match = line.match(/\[BUTTON_[A-Z_]+:\s*(.+?)\s*->\s*(.+?)\]/);
        if (match) {
          // Save current section before button
          if (currentSection.length > 0) {
            parts.sections.push(currentSection.join('\n'));
            currentSection = [];
          }
          // Extract button style from marker
          const styleMatch = line.match(/\[BUTTON_([A-Z_]+):/);
          parts.buttons.push({
            text: match[1].trim(),
            url: match[2].trim(),
            style: styleMatch ? styleMatch[1].toLowerCase() : 'default'
          });
        }
      }
      // Regular text content
      else if (line && !line.startsWith('[')) {
        currentSection.push(line);
      }
      // Empty line - add to current section as paragraph break
      else if (!line) {
        currentSection.push('');
      }
    }

    // Push final section if any
    if (currentSection.length > 0) {
      parts.sections.push(currentSection.join('\n'));
    }

    return parts;
  };

  if (!user) return <div>Nie jesteś zalogowany. <Link to="/">Wróć</Link></div>;

  const t = tasks[index];
  if (!t) return <div>Ładowanie zadań phishingowych...</div>;

  const answerNow = (ans, afterTimeout=false) => {
    const row = {
      task_id: t.id,
      subject: t.subject,
      is_phishing: t.is_phishing,
      user_is_phishing: ans === 'phishing',
      stressors: t.stressors || [],
      after_timeout: afterTimeout,
      permission_response: permissionResponse
    };
    const arr = [...phishingAnswers, row];
    setPhishingAnswers(arr);

    // Check if this question has negative feedback stressor
    if (settings.stress_negative_feedback_enabled && (t.stressors || []).includes(Stressors.NEGATIVE_FEEDBACK)) {
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

  const parsed = parseBodyContent(t.body);
  
  // Generate inline styles from task.style
  const emailBodyStyle = {
    fontFamily: t.style?.fontFamily || 'Arial, sans-serif',
    color: t.style?.primaryColor || '#000',
    ...(t.style?.containerBorderTop && { borderTop: t.style.containerBorderTop })
  };

  const buttonStyle = (btnStyle) => {
    const base = (btnStyle && t.style?.[btnStyle]) || t.style?.button || {};
    return {
      background: base.backgroundColor || '#000',
      backgroundColor: base.backgroundColor || '#000',
      color: base.color || '#fff',
      borderRadius: base.borderRadius || '4px',
      fontWeight: base.fontWeight || 'normal',
      padding: base.padding || '10px 20px',
      border: base.border || 'none',
      ...(base.boxShadow && { boxShadow: base.boxShadow }),
      ...(base.width && { width: base.width }),
      ...(base.textTransform && { textTransform: base.textTransform }),
      textAlign: base.textAlign || 'center',
      cursor: 'not-allowed',
      fontSize: '14px',
      display: 'inline-block'
    };
  };

  return (
    <>
      <div className="page-container">
        <div className="page-card">
        <div className="content-header">
          <h2>Zadania: Rozpoznawanie Phishingu</h2>
          <div className="task-progress">E-mail {index+1} z {tasks.length}</div>
        </div>

        <div className="email-container">
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
          <div className="email-body" style={emailBodyStyle}>
            {/* Render logo with alignment */}
            {parsed.logoUrl && (
              <div className={`email-logo-container email-logo-align-${parsed.logoAlign || 'left'}`}>
                <ImageWithFallback 
                  basePath={parsed.logoUrl}
                  alt="Logo"
                  className="email-logo"
                />
              </div>
            )}

            {/* Separator line */}
            {parsed.separatorLine && (
              <div 
                style={{
                  borderTop: `1px solid ${t.style?.separatorColor || '#ccc'}`,
                  margin: '10px 0'
                }}
              />
            )}

            {/* Body sections */}
            {parsed.sections.map((section, i) => (
              <div key={i} className="email-section">
                {section.split('\n').map((line, lineIdx) => {
                  if (!line) return <p key={lineIdx}>&nbsp;</p>;
                  
                  // Handle bold text (**text**) and italic (*text*)
                  const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/);
                  return (
                    <p key={lineIdx}>
                      {parts.map((part, pIdx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
                        } else if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
                          return <em key={pIdx}>{part.slice(1, -1)}</em>;
                        }
                        return <span key={pIdx}>{part}</span>;
                      })}
                    </p>
                  );
                })}
              </div>
            ))}

            {/* Display buttons from body - BEFORE banners */}
            {parsed.buttons.length > 0 && (
              <div className="email-cta" style={{ background: 'transparent', border: 'none', padding: '0' }}>
                {parsed.buttons.map((btn, i) => (
                  <div key={i} className="cta-item" style={{ margin: '15px 0' }}>
                    <button 
                      className="cta-button" 
                      disabled
                      style={buttonStyle(btn.style)}
                    >
                      {btn.text}
                    </button>
                    <div className="cta-url" style={{ fontSize: '11px', marginTop: '5px', color: '#999' }}>
                      {btn.url}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Inline banners */}
            {parsed.banners.filter(b => b.position === 'inline').map((banner, i) => (
              <div key={i} className="email-banner-container" style={{ margin: '15px 0' }}>
                <ImageWithFallback 
                  basePath={banner.url}
                  alt="Banner"
                  className="email-banner"
                />
              </div>
            ))}

            {/* Bottom banners */}
            {parsed.banners.filter(b => b.position === 'bottom').map((banner, i) => (
              <div key={i} className="email-banner-container" style={{ margin: '15px 0', marginTop: '20px' }}>
                <ImageWithFallback 
                  basePath={banner.url}
                  alt="Banner"
                  className="email-banner"
                />
              </div>
            ))}
          </div>

          {/* Timer Display */}
          {(settings.task_timer_enabled && (t.stressors || []).includes(Stressors.TIMER)) && (
            <div className={`timer-box ${timerLeft !== null && timerLeft <= 10 ? 'timer-warning' : ''}`}>
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
          {permissionPopup && permissionType && (
            <PermissionPopup
              type={permissionType}
              onConfirmationShow={() => {
                if (permissionType === 'microphone') setShowMixer(true);
              }}
              onAllow={() => {
                setPermissionResponse('allow');
                if (permissionType === 'camera') {
                  setShowCameraLoading(true);
                  setPermissionPopup(null);
                } else {
                  // Microphone: popup already dismissed itself; formally unmount after a beat
                  clearTimeout(permissionPopupTimeoutRef.current);
                  permissionPopupTimeoutRef.current = setTimeout(() => {
                    setPermissionPopup(null);
                    setPermissionType(null);
                  }, 500);
                }
              }}
              onBlock={() => {
                setPermissionResponse('block');
                if (permissionType === 'camera') {
                  setShowCameraLoading(true);
                  setPermissionPopup(null);
                } else {
                  clearTimeout(permissionPopupTimeoutRef.current);
                  permissionPopupTimeoutRef.current = setTimeout(() => {
                    setPermissionPopup(null);
                    setPermissionType(null);
                  }, 500);
                }
              }}
              onTimeout={() => {
                setPermissionResponse('timeout');
                if (permissionType === 'camera') {
                  setShowCameraLoading(true);
                }
                setPermissionPopup(null);
                setPermissionType(null);
              }}
            />
          )}

          {/* Camera loading box — shown after camera permission popup interaction */}
          {showCameraLoading && (
            <div className="camera-loading-box">
              <div className="camera-loading-spinner" />
              <div className="camera-loading-label">Ładowanie kamery...</div>
            </div>
          )}
        </div>
        </div>
        </div>
      </div>

      <VolumeMixer 
        isActive={permissionTypeForMixer === 'microphone'} 
        showAfterInteraction={showMixer}
      />
    </>
  );
}