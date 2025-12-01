/**
 * Stressors Enum
 *
 * Defines available stressor types that can be applied to phishing tasks.
 * Stressors are experimental manipulations designed to increase cognitive load
 * and measure how users respond to phishing under stress conditions.
 *
 * Available stressors:
 * - TIMER: Countdown timer that forces answer submission after time expires
 * - NEGATIVE_FEEDBACK: False negative feedback shown regardless of actual answer correctness
 */

export const Stressors = {
  TIMER: 'timer',
  NEGATIVE_FEEDBACK: 'negative_feedback'
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
    [Stressors.NEGATIVE_FEEDBACK]: 'Negative Feedback'
  };
  return names[stressor] || stressor;
};
