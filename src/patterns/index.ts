import { chaosPatterns } from "./chaos";
import { organizingPatterns } from "./organizing";
import { structuredPatterns } from "./structured";

/**
 * Consolidated animation patterns for all states
 */
export const ANIMATION_CONFIG = {
  states: {
    chaos: { patterns: chaosPatterns },
    organizing: { patterns: organizingPatterns },
    structured: { patterns: structuredPatterns },
  },
};
