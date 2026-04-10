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
 * - onAllow: callback when user clicks Allow
 * - onBlock: callback when user clicks Block
 * - onTimeout: callback when popup auto-dismisses after 10 seconds (no interaction)
 * - onMount: callback(permissionType) called when component mounts with 'microphone' or 'video'
 * - onConfirmationShow: callback called when confirmation message appears (after user interaction or timeout)
 */
export default function PermissionPopup({
  onAllow,
  onBlock,
  onTimeout,
  onMount,
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
  
  // Randomly choose between microphone and video (50/50)
  const randomType = useRef(Math.random() < 0.5 ? 'microphone' : 'video').current;
  const isMicrophone = randomType === 'microphone';

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
    setShowConfirmation(true);
    
    // Notify parent that confirmation is showing
    if (onConfirmationShow) {
      onConfirmationShow();
    }
    
    // Hide popup after 2 seconds
    scheduleWithAnimation(
      POPUP_DISMISS_AFTER_INTERACTION,
      () => setHidePopup(true),
      () => setShowPopup(false)
    );
    
    // Hide confirmation after 5 seconds
    scheduleWithAnimation(
      CONFIRMATION_MESSAGE_DURATION,
      () => setHideConfirmation(true),
      () => {
        setShowConfirmation(false);
        callback && callback();
      }
    );
  };

  useEffect(() => {
    // Notify parent of permission type
    if (onMount) {
      onMount(randomType);
    }

    // Auto-dismiss after 10 seconds if no user interaction
    const autoTimeoutId = setTimeout(() => {
      // Show confirmation on timeout
      setShowPopup(false);
      setShowConfirmation(true);
      
      // Notify parent that confirmation is showing (timeout case)
      if (onConfirmationShow) {
        onConfirmationShow();
      }
      
      // Hide confirmation after 5 seconds
      scheduleWithAnimation(
        CONFIRMATION_MESSAGE_DURATION,
        () => setHideConfirmation(true),
        () => {
          setShowConfirmation(false);
          onTimeout && onTimeout();
        }
      );
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
