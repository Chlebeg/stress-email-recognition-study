import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import useClockSound from '../hooks/useClockSound';
import PermissionPopup from '../components/PermissionPopup';
import VolumeMixer from '../components/VolumeMixer';
import { Stressors } from '../constants/Stressors';

// Component to try loading image with multiple extensions
function ImageWithFallback({ basePath, alt, className, style }) {
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
      style={style}
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
  const [showMicPopup, setShowMicPopup] = useState(false);
  const [showCamPopup, setShowCamPopup] = useState(false);
  const [micPermissionResponse, setMicPermissionResponse] = useState(null);
  const [camPermissionResponse, setCamPermissionResponse] = useState(null);
  const [showMixer, setShowMixer] = useState(false); // Show mixer when mic confirmation appears
  const [showCameraLoading, setShowCameraLoading] = useState(false);
  const [showEmailBlur, setShowEmailBlur] = useState(false);
  const [showRecording, setShowRecording] = useState(false);
  const [showSocialComparison, setShowSocialComparison] = useState(false);
  const [showCognitiveOverload, setShowCognitiveOverload] = useState(false);
  const timerRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const micPopupTimeoutRef = useRef(null);
  const camPopupTimeoutRef = useRef(null);
  const blurStartRef = useRef(null);
  const blurEndRef = useRef(null);
  const socialComparisonStartRef = useRef(null);
  const socialComparisonEndRef = useRef(null);
  const cognitiveOverloadStartRef = useRef(null);
  const cognitiveOverloadEndRef = useRef(null);
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
      clearTimeout(micPopupTimeoutRef.current);
      clearTimeout(camPopupTimeoutRef.current);
      clearTimeout(blurStartRef.current);
      clearTimeout(blurEndRef.current);
      clearTimeout(socialComparisonStartRef.current);
      clearTimeout(socialComparisonEndRef.current);
      clearTimeout(cognitiveOverloadStartRef.current);
      clearTimeout(cognitiveOverloadEndRef.current);
    };
  }, []);

  useEffect(() => {
    setTimedOut(false);
    setFeedbackMessage(null);
    setShowMicPopup(false);
    setShowCamPopup(false);
    setMicPermissionResponse(null);
    setCamPermissionResponse(null);
    setShowMixer(false);
    setShowCameraLoading(false);
    setShowEmailBlur(false);
    setShowRecording(false);
    setShowSocialComparison(false);
    setShowCognitiveOverload(false);
    clearTimer();
    clearInterval(feedbackTimerRef.current);
    clearTimeout(micPopupTimeoutRef.current);
    clearTimeout(camPopupTimeoutRef.current);
    clearTimeout(blurStartRef.current);
    clearTimeout(blurEndRef.current);
    clearTimeout(socialComparisonStartRef.current);
    clearTimeout(socialComparisonEndRef.current);
    clearTimeout(cognitiveOverloadStartRef.current);
    clearTimeout(cognitiveOverloadEndRef.current);
    const t = tasks[index];
    if (!t) return;
    
    // Trigger permission popups — each type is independent and can coexist
    const stressors = t.stressors || [];
    if (stressors.includes(Stressors.PERMISSION_POPUP_MICROPHONE)) {
      micPopupTimeoutRef.current = setTimeout(() => setShowMicPopup(true), 300);
    }
    if (stressors.includes(Stressors.PERMISSION_POPUP_CAMERA)) {
      camPopupTimeoutRef.current = setTimeout(() => setShowCamPopup(true), 800);
    }

    // Recording overlay stressor — active for the entire task duration
    if (stressors.includes(Stressors.RECORDING)) {
      setShowRecording(true);
    }

    // Schedule email blur stressor
    if (stressors.includes(Stressors.EMAIL_BLUR)) {
      const blurStart = (t.email_blur_start ?? 0) * 1000;
      const blurEnd = (t.email_blur_end ?? 4) * 1000;
      blurStartRef.current = setTimeout(() => {
        setShowEmailBlur(true);
        blurEndRef.current = setTimeout(() => {
          setShowEmailBlur(false);
        }, blurEnd - blurStart);
      }, blurStart);
    }

    if (stressors.includes(Stressors.SOCIAL_COMPARISON)) {
      const comparisonDelay = (t.social_comparison_delay ?? 3) * 1000;
      const comparisonDuration = (t.social_comparison_duration ?? 5) * 1000;
      socialComparisonStartRef.current = setTimeout(() => {
        setShowSocialComparison(true);
        socialComparisonEndRef.current = setTimeout(() => {
          setShowSocialComparison(false);
        }, comparisonDuration);
      }, comparisonDelay);
    }

    if (stressors.includes(Stressors.COGNITIVE_OVERLOAD)) {
      const overloadDelay = (t.cognitive_overload_delay ?? 0) * 1000;
      const overloadDuration = (t.cognitive_overload_duration ?? 4) * 1000;
      cognitiveOverloadStartRef.current = setTimeout(() => {
        setShowCognitiveOverload(true);
        cognitiveOverloadEndRef.current = setTimeout(() => {
          setShowCognitiveOverload(false);
        }, overloadDuration);
      }, overloadDelay);
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
    let currentSectionName = null;

    const saveCurrentSection = () => {
      if (currentSection.length > 0) {
        parts.sections.push({
          content: currentSection.join('\n'),
          name: currentSectionName
        });
        currentSection = [];
        currentSectionName = null;
      }
    };

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
          saveCurrentSection();
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
        saveCurrentSection();
        const match = line.match(/\[SECTION:\s*(.+?)\]/);
        currentSectionName = match ? match[1].trim() : null;
      }
      else if (line === '[END_SECTION]') {
        // End of section - save it
        saveCurrentSection();
      }
      // Banner with position
      else if (line.startsWith('[BANNER_')) {
        const match = line.match(/\[BANNER_(?:IMG|BOTTOM):\s*(.+?)\]/);
        if (match) {
          // Save current section before banner
          saveCurrentSection();
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
          saveCurrentSection();
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
    saveCurrentSection();

    return parts;
  };

  if (!user) return <div>Nie jesteś zalogowany. <Link to="/">Wróć</Link></div>;

  const t = tasks[index];
  if (!t) return <div>Ładowanie zadań phishingowych...</div>;

  const getImageStyle = (imageType) => {
    const imageStyle = t.style?.[imageType] || {};
    return {
      ...(imageStyle.width && { width: imageStyle.width }),
      ...(imageStyle.maxWidth && { maxWidth: imageStyle.maxWidth }),
      ...(imageStyle.maxHeight && { maxHeight: imageStyle.maxHeight }),
      ...(imageStyle.objectFit && { objectFit: imageStyle.objectFit })
    };
  };

  const answerNow = (ans, afterTimeout=false) => {
    const row = {
      task_id: t.id,
      subject: t.subject,
      is_phishing: t.is_phishing,
      user_is_phishing: ans === 'phishing',
      stressors: t.stressors || [],
      after_timeout: afterTimeout,
      permission_response: { microphone: micPermissionResponse, camera: camPermissionResponse }
    };
    const arr = [...phishingAnswers, row];
    setPhishingAnswers(arr);

    const stressors = t.stressors || [];
    const hasExtendedFeedback = stressors.includes(Stressors.EXTENDED_NEGATIVE_FEEDBACK);
    const hasNegativeFeedback = stressors.includes(Stressors.NEGATIVE_FEEDBACK);

    // Extended feedback takes precedence when both feedback stressors are configured.
    if (settings.stress_negative_feedback_enabled && (hasExtendedFeedback || hasNegativeFeedback)) {
      clearTimer(); // Stop the timer
      setFeedbackMessage(hasExtendedFeedback
        ? (t.extended_negative_feedback_message || 'Twoje ostatnie odpowiedzi były mniej trafne niż odpowiedzi większości uczestników.')
        : 'Odpowiedziałeś błędnie');
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

  const parsed = parseBodyContent(t.body || '');
  
  // Generate inline styles from task.style
  const emailBodyStyle = {
    fontFamily: t.style?.fontFamily || 'Arial, sans-serif',
    color: t.style?.bodyColor || t.style?.primaryColor || '#000',
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

  const formatUrl = (url) => {
    try {
      const parsedUrl = new URL(url);
      return `${parsedUrl.hostname}${parsedUrl.pathname === '/' ? '' : parsedUrl.pathname}`;
    } catch {
      return url;
    }
  };

  const timerStressorActive = settings.task_timer_enabled && (t.stressors || []).includes(Stressors.TIMER);
  const vignetteIntensity = timerStressorActive && timerLeft !== null
    ? Math.max(0, 1 - timerLeft / settings.task_timer_duration)
    : 0;
  const isAllegroParcel = t.template === 'allegro_parcel';
  const isBookingReservation = t.template === 'booking_reservation';

  return (
    <>
      <div className="page-container phishing-page-container">
        <div className="page-card">
        <div className="content-header">
          <h2>Zadania: Rozpoznawanie Phishingu</h2>
          <div className="task-progress">E-mail {index+1} z {tasks.length}</div>
        </div>

        <div className="email-container">
          <div className={`email-view ${timedOut ? 'email-hazed' : ''}`}>
          <div className="email-scroll-area">
          {t.htmlPath ? (
            <div className="email-template-frame">
              <iframe
                key={t.htmlPath}
                className="email-template-document"
                src={t.htmlPath}
                title={t.subject}
                sandbox="allow-same-origin"
                onLoad={(event) => {
                  const documentHeight = event.currentTarget.contentDocument?.documentElement.scrollHeight;
                  if (documentHeight) event.currentTarget.style.height = `${documentHeight}px`;
                }}
              />
              {showEmailBlur && (
                <div className="email-blur-overlay" aria-hidden="true">
                  <div className="email-blur-spinner" />
                  <div className="email-blur-label">Ładowanie treści...</div>
                </div>
              )}
            </div>
          ) : (
            <>
          <div className="webmail-toolbar" aria-label="Pasek narzędzi wiadomości">
            <div className="webmail-navigation">
              <button className="webmail-icon-button" type="button" disabled aria-label="Wróć do skrzynki" title="Wróć do skrzynki">&larr;</button>
              <div className="webmail-location"><span>Odebrane</span><span aria-hidden="true">/</span><strong>Wiadomość</strong></div>
            </div>
            <div className="webmail-actions" aria-label="Działania na wiadomości">
              <button className="webmail-icon-button" type="button" disabled aria-label="Archiwizuj" title="Archiwizuj">&#9634;</button>
              <button className="webmail-icon-button" type="button" disabled aria-label="Oznacz jako spam" title="Oznacz jako spam">!</button>
              <button className="webmail-icon-button" type="button" disabled aria-label="Więcej opcji" title="Więcej opcji">&hellip;</button>
            </div>
          </div>
          {/* Email Header */}
          <div className="email-header">
            <div className="email-sender-avatar" aria-hidden="true">{t.from.charAt(0)}</div>
            <div className="email-heading">
              <div className="email-subject-line">{t.subject}</div>
              <div className="email-sender-line"><strong>{t.from}</strong> <span>&lt;{t.fromEmail}&gt;</span></div>
            </div>
            <div className="email-header-date">{t.date}</div>
            <div className="email-header-row">
              <span className="email-label">Do:</span>
              <span className="email-value">{t.to}</span>
            </div>
          </div>

          {/* Email Body */}
          <div className="email-body" style={emailBodyStyle}>
            {/* Render logo with alignment */}
            {parsed.logoUrl && !isBookingReservation && (
              <div className={`email-logo-container email-logo-align-${parsed.logoAlign || 'left'} ${parsed.layout === 'HEADER_FULL_WIDTH_YELLOW' ? 'email-logo-header-yellow' : ''}`}>
                <ImageWithFallback 
                  basePath={parsed.logoUrl}
                  alt="Logo"
                  className="email-logo"
                  style={getImageStyle('logo')}
                />
              </div>
            )}

            {isBookingReservation && (
              <div className="booking-email-masthead">
                <div className="booking-wordmark">Booking<span>.com</span></div>
                <div className="booking-confirmation">Potwierdzenie: <strong>{t.reservation.confirmation}</strong><br />PIN: <strong>{t.reservation.pin}</strong> <span>(Poufne)</span></div>
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
            {parsed.sections.map((section, i) => {
              const sectionLines = section.content.split('\n');
              const renderedLines = isAllegroParcel || isBookingReservation
                ? sectionLines.filter(line => line.trim())
                : sectionLines;

              return (
              <div key={i} className={`email-section ${section.name === 'ORDER_SUMMARY_BOX' ? 'email-section-order-summary' : ''}`}>
                {renderedLines.map((line, lineIdx) => {
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
              );
            })}

            {isBookingReservation && (
              <div className="booking-reservation-details">
                <h2>Twoja rezerwacja</h2>
                <p className="booking-arrival-note"><strong>Obiekt oczekuje Cię {t.reservation.arrival}.</strong></p>
                <section className="booking-safety-note">
                  <h3>Chroń swoje dane</h3>
                  <p>Nie udostępniaj kodu PIN ani danych płatności przez e-mail. W razie wątpliwości skontaktuj się z obiektem przez Booking.com.</p>
                </section>
                <h2 className="booking-property-name">{t.reservation.property}</h2>
                <dl className="booking-details-table">
                  <div><dt>Zameldowanie</dt><dd>{t.reservation.arrival}</dd></div>
                  <div><dt>Wymeldowanie</dt><dd>{t.reservation.departure}</dd></div>
                  <div><dt>Twój pobyt</dt><dd>{t.reservation.stay}</dd></div>
                  <div><dt>Goście</dt><dd>{t.reservation.guests}</dd></div>
                  <div><dt>Lokalizacja</dt><dd>{t.reservation.location}</dd></div>
                </dl>
              </div>
            )}

            {isAllegroParcel && (
              <div className="allegro-parcel-details">
                <section className="allegro-parcel-section">
                  <h3>Przewidywana dostawa</h3>
                  <p>{t.delivery.estimated}</p>
                </section>
                <section className="allegro-parcel-section">
                  <h3>Przewoźnik i nr przesyłki</h3>
                  <p>{t.delivery.carrier} <span className="allegro-tracking-number">{t.delivery.trackingNumber}</span></p>
                </section>
                <section className="allegro-purchase-row">
                  <div className="allegro-product-placeholder" aria-hidden="true">&#128230;</div>
                  <div className="allegro-product-info">
                    <h3>Twój zakup</h3>
                    <div className="allegro-product-name">{t.product.name}</div>
                    <div className="allegro-product-seller">Sprzedający: {t.product.seller}</div>
                  </div>
                  <div className="allegro-product-quantity">{t.product.quantity}</div>
                </section>
                <ImageWithFallback
                  basePath="/images/banners/allegro_delivery_app"
                  alt="Aplikacja Allegro"
                  className="email-banner allegro-app-banner"
                  style={getImageStyle('banner')}
                />
              </div>
            )}

            {/* Inline promotional banners appear within the message, before its call to action. */}
            {parsed.banners.filter(b => b.position === 'inline').map((banner, i) => (
              <div key={i} className="email-banner-container">
                <ImageWithFallback
                  basePath={banner.url}
                  alt="Baner promocyjny"
                  className="email-banner"
                  style={getImageStyle('banner')}
                />
              </div>
            ))}

            {/* Display buttons from body */}
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
                    <div className="cta-url" title={btn.url}>
                      <span className="cta-url-lock" aria-hidden="true">&#128274;</span>
                      <span>{formatUrl(btn.url)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom banners */}
            {parsed.banners.filter(b => b.position === 'bottom').map((banner, i) => (
              <div key={i} className="email-banner-container email-banner-bottom">
                <ImageWithFallback 
                  basePath={banner.url}
                  alt="Baner promocyjny"
                  className="email-banner"
                  style={getImageStyle('banner')}
                />
              </div>
            ))}

            {t.footer && (
              <footer className={`email-footer ${isAllegroParcel ? 'allegro-email-footer' : ''}`}>
                <div className="email-footer-brand">{t.footer.brand}</div>
                <p>{t.footer.contact}</p>
                <p>{t.footer.address}</p>
                <p className="email-footer-legal">{t.footer.legal}</p>
                <p className="email-footer-preferences">{t.footer.preferences}</p>
              </footer>
            )}

            {/* Email blur loading overlay */}
            {showEmailBlur && (
              <div className="email-blur-overlay" aria-hidden="true">
                <div className="email-blur-spinner" />
                <div className="email-blur-label">Ładowanie treści...</div>
              </div>
            )}
          </div>
          </>
          )}
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

          {/* Permission Popups — stacked in a single fixed container, 1em gap between them */}
          {(showMicPopup || showCamPopup) && (
            <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '1em' }}>
              {showMicPopup && (
                <PermissionPopup
                  type="microphone"
                  onConfirmationShow={() => setShowMixer(true)}
                  onAllow={() => {
                    setMicPermissionResponse('allow');
                    clearTimeout(micPopupTimeoutRef.current);
                    micPopupTimeoutRef.current = setTimeout(() => setShowMicPopup(false), 500);
                  }}
                  onBlock={() => {
                    setMicPermissionResponse('block');
                    clearTimeout(micPopupTimeoutRef.current);
                    micPopupTimeoutRef.current = setTimeout(() => setShowMicPopup(false), 500);
                  }}
                  onTimeout={() => {
                    setMicPermissionResponse('timeout');
                    setShowMicPopup(false);
                  }}
                />
              )}
              {showCamPopup && (
                <PermissionPopup
                  type="camera"
                  onConfirmationShow={() => setShowCameraLoading(true)}
                  onAllow={() => {
                    setCamPermissionResponse('allow');
                    setShowCamPopup(false);
                  }}
                  onBlock={() => {
                    setCamPermissionResponse('block');
                    setShowCamPopup(false);
                  }}
                  onTimeout={() => {
                    setCamPermissionResponse('timeout');
                    setShowCamPopup(false);
                  }}
                />
              )}
            </div>
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
        isActive={(t?.stressors || []).includes(Stressors.PERMISSION_POPUP_MICROPHONE)}
        showAfterInteraction={showMixer}
      />

      {/* Red vignette overlay — activates automatically with timer stressor */}
      {timerStressorActive && (
        <div
          className="timer-vignette"
          style={{ opacity: vignetteIntensity }}
          aria-hidden="true"
        />
      )}

      {/* Recording overlay — blinking REC indicator + red corner brackets */}
      {showRecording && (
        <div className="recording-overlay" aria-hidden="true">
          <div className="recording-corners">
            <span className="recording-corner recording-corner-tl" />
            <span className="recording-corner recording-corner-tr" />
            <span className="recording-corner recording-corner-bl" />
            <span className="recording-corner recording-corner-br" />
          </div>
          <div className="recording-badge">
            <span className="recording-dot" />
            <span className="recording-label">REC</span>
          </div>
          <div className="recording-screen-text">Ekran jest nagrywany</div>
        </div>
      )}

      {showSocialComparison && (
        <div className="social-comparison-notice" role="status" aria-live="assertive">
          {t.social_comparison_message || 'Odpowiadasz wolniej niż 78% uczestników.'}
        </div>
      )}

      {showCognitiveOverload && (
        <div className="cognitive-overload-overlay" role="dialog" aria-modal="true">
          <div className="cognitive-overload-box">
            <div className="cognitive-overload-label">Zapamiętaj poniższą informację</div>
            <div className="cognitive-overload-value">{t.cognitive_overload_value || '4827'}</div>
            <div className="cognitive-overload-prompt">
              {t.cognitive_overload_prompt || 'Za chwilę przejdziesz do następnego zadania.'}
            </div>
          </div>
        </div>
      )}
    </>
  );
}