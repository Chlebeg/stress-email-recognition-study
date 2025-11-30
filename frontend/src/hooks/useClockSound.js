import { useRef, useCallback } from 'react';

const useClockSound = () => {
  // We use a ref to hold the audio context so it persists across renders
  const audioContextRef = useRef(null);

  const playTick = useCallback((volume = 0.1) => {
    // 1. Initialize AudioContext if it doesn't exist (browsers require user interaction first)
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    
    // Resume context if it was suspended (common browser policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // 2. Create an Oscillator (The source of the sound)
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // 3. Configure the sound to sound like a "tick"
    // High frequency square wave gives a "mechanical" click sound
    osc.type = 'square'; 
    osc.frequency.setValueAtTime(800, ctx.currentTime); 
    
    // 4. Create a sharp envelope (Volume goes High -> Low instantly)
    // This creates the percussive "hit"
    gainNode.gain.setValueAtTime(volume, ctx.currentTime); // Start volume
    gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.05); // Decay fast

    // 5. Connect the nodes: Oscillator -> Gain -> Speakers
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    // 6. Play and stop immediately
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }, []);

  const playTock = useCallback((volume = 0.1) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Lower frequency for the "Tock"
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, ctx.currentTime); // Lower pitch

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.05);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }, []);

  return { playTick, playTock };
};

export default useClockSound;
