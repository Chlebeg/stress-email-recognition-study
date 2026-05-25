import React, { useEffect, useState, useRef } from 'react';
import './PermissionPopup.css';

/**
 * PermissionPopup Component
 * 
 * Browser-mimicking permission popup that mimics real OS/browser permission requests.
 * Timing behavior:
 * - No interaction: dismisses after 10 seconds
 * - User interaction (click): popup dismisses after 2 seconds, confirmation shows for 5 seconds
 * 
 * Props:
 * - type: 'microphone' | 'camera' — permission type, determines popup icon/text and post-interaction behavior
 * - onAllow: callback when user clicks Allow
 * - onBlock: callback when user clicks Block
 * - onTimeout: callback when popup auto-dismisses after 10 seconds (no interaction)
 * - onConfirmationShow: callback called when confirmation message appears (microphone only, after user interaction or timeout)
 */
export default function PermissionPopup({
  type = 'microphone',
  onAllow,
  onBlock,
  onTimeout,
  onConfirmationShow
}) {
  const [showPopup, setShowPopup] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hidePopup, setHidePopup] = useState(false);
  const [hideConfirmation, setHideConfirmation] = useState(false);
  const timerRefs = useRef([]);
  
  // Fixed timeouts (in seconds)
  const PERMISSION_POPUP_NO_INTERACTION = 10;
  const POPUP_DISMISS_AFTER_INTERACTION = 2;
  const CONFIRMATION_MESSAGE_DURATION = 5;
  const ANIMATION_DURATION = 300;
  
  const isMicrophone = type === 'microphone';

  // Helper: Clear all active timeouts
  const clearAllTimeouts = () => {
    timerRefs.current.forEach(id => clearTimeout(id));
    timerRefs.current = [];
  };

  // Helper: Schedule animation then action
  const scheduleWithAnimation = (delay, onAnimationStart, onAnimationEnd) => {
    const timeoutId = setTimeout(() => {
      onAnimationStart();
      const animationCompleteId = setTimeout(() => {
        onAnimationEnd();
      }, ANIMATION_DURATION);
      timerRefs.current.push(animationCompleteId);
    }, delay * 1000);
    timerRefs.current.push(timeoutId);
  };

  // Helper: Handle interaction (allow/block)
  const handleInteraction = (callback) => {
    clearAllTimeouts();

    if (isMicrophone) {
      // Microphone: show confirmation bar, then call callback after it fades
      setShowConfirmation(true);
      if (onConfirmationShow) onConfirmationShow();

      scheduleWithAnimation(
        POPUP_DISMISS_AFTER_INTERACTION,
        () => setHidePopup(true),
        () => setShowPopup(false)
      );

      scheduleWithAnimation(
        CONFIRMATION_MESSAGE_DURATION,
        () => setHideConfirmation(true),
        () => {
          setShowConfirmation(false);
          callback && callback();
        }
      );
    } else {
      // Camera: start dismiss animation immediately, show loading box right away
      setHidePopup(true);
      const animId = setTimeout(() => {
        setShowPopup(false);
        callback && callback();
      }, ANIMATION_DURATION);
      timerRefs.current.push(animId);
    }
  };

  useEffect(() => {
    // Auto-dismiss after 10 seconds if no user interaction
    const autoTimeoutId = setTimeout(() => {
      setShowPopup(false);

      if (isMicrophone) {
        // Microphone: show confirmation bar on timeout
        setShowConfirmation(true);
        if (onConfirmationShow) onConfirmationShow();

        scheduleWithAnimation(
          CONFIRMATION_MESSAGE_DURATION,
          () => setHideConfirmation(true),
          () => {
            setShowConfirmation(false);
            onTimeout && onTimeout();
          }
        );
      } else {
        // Camera: call onTimeout directly — parent shows loading box
        onTimeout && onTimeout();
      }
    }, PERMISSION_POPUP_NO_INTERACTION * 1000);
    
    timerRefs.current.push(autoTimeoutId);

    return () => clearAllTimeouts();
  }, []);

  const handleAllow = () => handleInteraction(onAllow);
  const handleBlock = () => handleInteraction(onBlock);

  if (!showPopup && !showConfirmation) return null;

  return (
    <>
      {showPopup && (
        <div className={`permission-popup-bar ${hidePopup ? 'slide-out' : ''}`}>
          <div className="popup-bar-content">
            <div className="popup-icon">
              {isMicrophone ? '🎤' : '📷'}
            </div>
            <div className="popup-text">
              <div className="popup-origin">example.com</div>
              <div className="popup-message">
                {isMicrophone 
                  ? 'Strona chce uzyskać dostęp do Twojego mikrofonu'
                  : 'Strona chce uzyskać dostęp do Twojej kamery'}
              </div>
            </div>
            <div className="popup-buttons-bar">
              <button 
                type="button" 
                className="btn-deny" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleBlock();
                }}
              >
                Blokuj
              </button>
              <button 
                type="button" 
                className="btn-allow" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAllow();
                }}
              >
                Zezwól
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmation && (
        <div className={`permission-confirmation-bar ${hideConfirmation ? 'slide-out' : ''}`}>
          <div className="confirmation-bar-content">
            <div className="confirmation-bar-icon">✓</div>
            <div className="confirmation-bar-text">Uprawnienia przyznane</div>
          </div>
        </div>
      )}
    </>
  );
}
