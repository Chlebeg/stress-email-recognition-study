/**
 * Stressors Enum
 *
 * Defines available stressor types that can be applied to phishing tasks.
 * Stressors are experimental manipulations designed to increase cognitive load
 * and measure how users respond to phishing under stress conditions.
 *
 * Available stressors:
 * - TIMER: Countdown timer that forces answer submission after time expires
 * - NEGATIVE_FEEDBACK: Fabricated feedback shown after submission regardless of actual answer correctness
 * - PERMISSION_POPUP_MICROPHONE: Browser-mimicking microphone permission popup
 * - PERMISSION_POPUP_CAMERA: Browser-mimicking camera permission popup (shows endless loading box after interaction)
 * - EMAIL_BLUR: Blurs the email body for a configurable window (email_blur_start → email_blur_end seconds from task mount)
 * - RECORDING: Fixed overlay informing participant they are being recorded; blinking REC dot + red corner brackets framing the screen; active for the entire task duration
 * - SOCIAL_COMPARISON: Timed message comparing a participant's speed with other participants
 * - COGNITIVE_OVERLOAD: Timed memorization prompt shown before the email task
 */

export const Stressors = {
  TIMER: 'timer',
  NEGATIVE_FEEDBACK: 'negative_feedback',
  PERMISSION_POPUP_MICROPHONE: 'permission_popup_microphone',
  PERMISSION_POPUP_CAMERA: 'permission_popup_camera',
  EMAIL_BLUR: 'email_blur',
  RECORDING: 'recording',
  SOCIAL_COMPARISON: 'social_comparison',
  COGNITIVE_OVERLOAD: 'cognitive_overload'
};

/**
 * Get all available stressor values
 * @returns {string[]} Array of stressor strings
 */
export const getAllStressors = () => Object.values(Stressors);

/**
 * Validate if a stressor is valid
 * @param {string} stressor - The stressor string to validate
 * @returns {boolean} True if valid stressor
 */
export const isValidStressor = (stressor) => Object.values(Stressors).includes(stressor);

/**
 * Validate if all stressors in an array are valid
 * @param {string[]} stressors - Array of stressor strings
 * @returns {boolean} True if all are valid stressors
 */
export const areValidStressors = (stressors) => {
  if (!Array.isArray(stressors)) return false;
  return stressors.every(s => isValidStressor(s));
};

/**
 * Get stressor display name (for UI)
 * @param {string} stressor - The stressor string
 * @returns {string} Display name
 */
export const getStressorDisplayName = (stressor) => {
  const names = {
    [Stressors.TIMER]: 'Timer (Time Pressure)',
    [Stressors.NEGATIVE_FEEDBACK]: 'Negative Feedback',
    [Stressors.PERMISSION_POPUP_MICROPHONE]: 'Permission Popup (Microphone)',
    [Stressors.PERMISSION_POPUP_CAMERA]: 'Permission Popup (Camera)',
    [Stressors.EMAIL_BLUR]: 'Email Blur',
    [Stressors.RECORDING]: 'Recording Notice',
    [Stressors.SOCIAL_COMPARISON]: 'Social Comparison',
    [Stressors.COGNITIVE_OVERLOAD]: 'Cognitive Overload'
  };
  return names[stressor] || stressor;
};
