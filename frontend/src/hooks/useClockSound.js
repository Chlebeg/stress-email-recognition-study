import { useRef, useCallback, useEffect } from 'react';

const useClockSound = () => {
  const audioContextRef = useRef(null);
  const scheduledNodesRef = useRef([]);

  // Close AudioContext on unmount to avoid hitting browser limit (typically 6)
  useEffect(() => {
    return () => {
      cancelScheduled();
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  const getOrCreateContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  // Stop all pre-scheduled sounds immediately (called when timer is cleared)
  const cancelScheduled = useCallback(() => {
    scheduledNodesRef.current.forEach(node => {
      try { node.stop(0); } catch (_) {}
    });
    scheduledNodesRef.current = [];
  }, []);

  // Schedule a single physical clock tick at a precise AudioContext time.
  // isHigh: true = "tick" (higher pitch), false = "tock" (lower pitch)
  const scheduleTickAt = (ctx, when, volume, isHigh) => {
    // Layer 1: bandpass-filtered noise burst — the sharp "snap" of a clock escapement
    const snapDuration = 0.018;
    const bufferSize = Math.ceil(ctx.sampleRate * snapDuration);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = isHigh ? 2800 : 2200;
    bandpass.Q.value = 6;

    const snapGain = ctx.createGain();
    snapGain.gain.setValueAtTime(0, when);
    snapGain.gain.linearRampToValueAtTime(volume, when + 0.001);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, when + snapDuration);

    noiseSource.connect(bandpass);
    bandpass.connect(snapGain);
    snapGain.connect(ctx.destination);
    noiseSource.start(when);
    noiseSource.stop(when + snapDuration);
    scheduledNodesRef.current.push(noiseSource);

    // Layer 2: low-frequency sine — the body resonance / "thump"
    const thumpDuration = 0.04;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = isHigh ? 320 : 260;

    const thumpGain = ctx.createGain();
    thumpGain.gain.setValueAtTime(0, when);
    thumpGain.gain.linearRampToValueAtTime(volume * 0.45, when + 0.003);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, when + thumpDuration);

    osc.connect(thumpGain);
    thumpGain.connect(ctx.destination);
    osc.start(when);
    osc.stop(when + thumpDuration);
    scheduledNodesRef.current.push(osc);
  };

  /**
   * Pre-schedule all ticks for a countdown using Web Audio's sample-accurate clock.
   * Completely avoids setInterval timing drift for audio.
   *
   * @param {number} duration  - total seconds on the timer
   * @param {number} minVolume - volume of first tick (0-1)
   * @param {number} maxVolume - volume of last tick (0-1)
   */
  const scheduleAllTicks = useCallback((duration, minVolume = 0.2, maxVolume = 0.7) => {
    const ctx = getOrCreateContext();
    cancelScheduled();

    const doSchedule = () => {
      // Small lookahead so the first tick isn't clipped by resume latency
      const startTime = ctx.currentTime + 0.08;
      for (let i = 0; i < duration; i++) {
        const when = startTime + i;
        // Linear ramp: quiet at start, loud at end
        const t = duration <= 1 ? 1 : i / (duration - 1);
        const volume = minVolume + (maxVolume - minVolume) * t;
        scheduleTickAt(ctx, when, volume, i % 2 === 0);
      }
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(doSchedule);
    } else {
      doSchedule();
    }
  }, [cancelScheduled]);

  return { scheduleAllTicks, cancelScheduled };
};

export default useClockSound;
