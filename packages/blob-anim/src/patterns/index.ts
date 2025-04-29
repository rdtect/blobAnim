import { chaosPatterns, ChaosPattern } from "./chaos";
import { organizingPatterns, OrganizingPattern } from "./organizing";
import { structuredPatterns, StructuredPattern } from "./structured";

/**
 * Combined animation configuration for all states and patterns
 */
export const ANIMATION_CONFIG = {
  states: {
    chaos: { patterns: chaosPatterns },
    organizing: { patterns: organizingPatterns },
    structured: { patterns: structuredPatterns },
  },
};

/**
 * Pattern registry for simplified pattern access
 * Used by BlobElement to get pattern class from state/variant
 */
export const PatternRegistry = {
  chaos: ChaosPattern,
  organizing: OrganizingPattern,
  structured: StructuredPattern,
};

export { ChaosPattern, OrganizingPattern, StructuredPattern };

// Export all pattern registries for direct access
export { chaosPatterns, organizingPatterns, structuredPatterns };

