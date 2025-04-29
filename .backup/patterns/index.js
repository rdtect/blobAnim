/**
 * Animation Patterns Registry
 * 
 * Central registry for all animation patterns.
 */

import { chaosPatterns } from './chaos.js';
import { organizingPatterns } from './organizing.js';
import { structuredPatterns } from './structured.js';

/**
 * All patterns organized by state
 */
export const patterns = {
  chaos: chaosPatterns,
  organizing: organizingPatterns,
  structured: structuredPatterns
};

/**
 * Get a pattern function by state and variant
 * @param {string} state - Animation state
 * @param {string} variant - Pattern variant
 * @returns {Function} Pattern function
 */
export function getPattern(state, variant = 'default') {
  // Get patterns for the state
  const statePatterns = patterns[state];
  if (!statePatterns) {
    console.warn(`State '${state}' not found, using chaos state`);
    return patterns.chaos.default;
  }
  
  // Get the specific variant
  const patternFn = statePatterns[variant];
  if (!patternFn) {
    console.warn(`Variant '${variant}' not found for state '${state}', using default variant`);
    return statePatterns.default;
  }
  
  return patternFn;
}
