import React, { useEffect, useState, useRef } from 'react';
import './VolumeMixer.css';

/**
 * VolumeMixer Component
 * 
 * Visualizes audio input levels mimicking a real volume mixer.
 * Shows animated bars simulating microphone sound detection.
 * 
 * Props:
 * - isActive: boolean - whether to animate (typically when permission popup is shown)
 * - showAfterInteraction: boolean - whether to show mixer after user interaction
 */
export default function VolumeMixer({ isActive, showAfterInteraction }) {
  const [levels, setLevels] = useState(Array(8).fill(0));
  const animationRef = useRef(null);
  const levelRefs = useRef(Array(8).fill(0));
  const frameCountRef = useRef(0);

  useEffect(() => {
    if (!isActive) {
      // Clear animation when inactive
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setLevels(Array(8).fill(0));
      levelRefs.current = Array(8).fill(0);
      return;
    }

    // Don't run the rAF loop if the component won't render
    if (!showAfterInteraction) return;

    const animate = () => {
      frameCountRef.current++;
      
      // Update levels every 3 frames (slows down oscillation)
      if (frameCountRef.current % 3 === 0) {
        // Generate random level changes for each bar
        const newLevels = levelRefs.current.map(() => {
          // Random value between 0-100
          const randomValue = Math.random();
          
          // 20% chance of a spike (simulating ambient noise spike)
          if (randomValue > 0.8) {
            return 60 + Math.random() * 20; // 60-80% range
          }
          // 90% chance of baseline oscillation between 15-25%
          return 15 + Math.random() * 10; // 15-25% range
        });

        setLevels(newLevels);
        levelRefs.current = newLevels;
      }

      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  if (!isActive || !showAfterInteraction) return null;

  return (
    <div className="volume-mixer-container">
      <div className="volume-mixer">
        <div className="mixer-header">
          <div className="mixer-icon">🎙️</div>
          <div className="mixer-label">Mikrofon</div>
        </div>

        <div className="mixer-bars">
          {levels.map((level, idx) => (
            <div key={idx} className="mixer-bar-wrapper">
              <div className="mixer-bar-background">
                <div
                  className={`mixer-bar-fill ${
                    level > 50 ? 'spike' : 'baseline'
                  }`}
                  style={{ height: `${level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <span className="mixer-labels">Rozpoczęcie nagrywania</span>
      </div>
    </div>
  );
}
