/**
 * BlobAnim Configuration System
 *
 * Streamlined configuration management for the BlobAnim library.
 * Provides default values, simple validation, and a clean update mechanism.
 */

/**
 * Valid animation states
 */
export const ANIMATION_STATES = ["chaos", "organizing", "structured"];

/**
 * Available patterns for each animation state
 */
export const PATTERNS = {
  chaos: ["default", "random", "brownian", "explosion", "math-brownian", "math-explosion", "math", "circle"],
  organizing: ["default", "grid", "spiral", "wave", "cylinder"],
  structured: ["default", "grid", "circle", "orbit", "flower", "basic"],
};

/**
 * Color palette for animations.
 * Colors are chosen uniformly at random for each blob.
 */
const COLORS = ["#3b82f6"]; // Blue

/**
 * Levels of gooey intensity supported.
 */
export const GOOEY_INTENSITY_PRESETS = {
  none: {
    blur: 0,
    contrast: 0,
    shift: 0
  },
  low: {
    blur: 8,
    contrast: 12,
    shift: -6
  },
  medium: {
    blur: 12,
    contrast: 18,
    shift: -7
  },
  strong: {
    blur: 16,
    contrast: 24,
    shift: -8
  }
};

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  count: 10, // Default count of 10 elements
  speed: 5, // Default speed of 5
  size: 40, // Default size of 40px
  animationState: "chaos", // Default state is chaos
  variant: "default", // Default variant
  color: COLORS[0], // Default to first color in palette
  opacity: 0.85, // Default opacity
  debug: false, // Debug mode off by default
  gooeyIntensity: "medium", // Medium gooey effect by default
  lerpFactor: 0.1, // Smooth transitions
  intensity: 0.5, // Medium animation intensity
};

/**
 * Configuration Manager
 * Simplified singleton for managing animation configuration
 */
class ConfigManager {
  /**
   * Private constructor to enforce singleton pattern
   */
  constructor(initialConfig) {
    // Start with defaults and merge initial config
    this.config = { ...DEFAULT_CONFIG, ...initialConfig };

    // Initialize update callbacks array
    this.updateCallbacks = [];

    // Logger instance
    this.logger = console;
    this.logger.debug("Configuration manager initialized");
  }

  /**
   * Get the singleton instance
   */
  static getInstance(initialConfig) {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager(initialConfig);
    } else if (initialConfig) {
      // Update existing instance with new config
      ConfigManager.instance.updateConfig(initialConfig);
    }
    return ConfigManager.instance;
  }

  /**
   * Get the current configuration (readonly)
   */
  getConfig() {
    return this.config;
  }

  /**
   * Update the configuration with partial values
   */
  updateConfig(partial) {
    // Create a validated version of the partial update
    const validatedPartial = this.validateConfig(partial);

    // Apply validated updates
    this.config = { ...this.config, ...validatedPartial };

    // Notify listeners
    this.notifyUpdateListeners(validatedPartial);

    this.logger.debug("Configuration updated", validatedPartial);
  }

  /**
   * Subscribe to configuration updates
   * @returns Unsubscribe function
   */
  subscribe(callback) {
    this.updateCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index !== -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Validate critical configuration properties
   * Simplified validation that only checks the most important constraints
   * Returns a validated version of the input config partial.
   */
  validateConfig(config) {
    const validated = {};
    try {
      // Animation state validation
      if (config.animationState !== undefined) {
        if (!ANIMATION_STATES.includes(config.animationState)) {
          this.logger.warn(
            `Invalid animation state: ${config.animationState}. Using default: ${DEFAULT_CONFIG.animationState}`
          );
          validated.animationState = DEFAULT_CONFIG.animationState;
        } else {
          validated.animationState = config.animationState;
        }
      }

      // Variant validation - depends on the state (either from input or current config)
      const currentState = validated.animationState || this.config.animationState;
      if (config.variant !== undefined) {
        if (
          PATTERNS[currentState] &&
          !PATTERNS[currentState].includes(config.variant)
        ) {
          this.logger.warn(
            `Invalid variant ${config.variant} for state ${currentState}. Using default: ${DEFAULT_CONFIG.variant}`
          );
          validated.variant = DEFAULT_CONFIG.variant;
        } else {
          validated.variant = config.variant;
        }
      }

      // Basic range validations (clamping)
      if (config.count !== undefined) {
        validated.count = Math.max(1, Math.min(25, config.count));
      }
      if (config.size !== undefined) {
        validated.size = Math.max(5, Math.min(100, config.size));
      }
      if (config.speed !== undefined) {
        validated.speed = Math.max(0.1, Math.min(10, config.speed));
      }
      if (config.opacity !== undefined) {
        validated.opacity = Math.max(0, Math.min(1, config.opacity));
      }
      if (config.intensity !== undefined) {
        validated.intensity = Math.max(0, Math.min(1, config.intensity));
      }
      if (config.lerpFactor !== undefined) {
        validated.lerpFactor = Math.max(0.01, Math.min(1, config.lerpFactor));
      }

      // Gooey intensity validation
      if (config.gooeyIntensity !== undefined) {
        if (
          typeof config.gooeyIntensity === "string" &&
          !Object.keys(GOOEY_INTENSITY_PRESETS).includes(config.gooeyIntensity)
        ) {
          this.logger.warn(
            `Invalid gooeyIntensity: ${config.gooeyIntensity}. Using default: ${DEFAULT_CONFIG.gooeyIntensity}`
          );
          validated.gooeyIntensity = DEFAULT_CONFIG.gooeyIntensity;
        } else {
          validated.gooeyIntensity = config.gooeyIntensity;
        }
      }

      // Other properties just pass through if defined
      if (config.color !== undefined) validated.color = config.color;
      if (config.debug !== undefined) validated.debug = config.debug;

    } catch (error) {
      this.logger.error("Configuration validation failed unexpectedly", error);
      // Return minimal validated object in case of unexpected errors
      return {};
    }
    return validated;
  }

  /**
   * Notify all update listeners of configuration changes
   */
  notifyUpdateListeners(changes) {
    for (const callback of this.updateCallbacks) {
      try {
        callback(changes);
      } catch (error) {
        this.logger.error("Error in config update callback", error);
      }
    }
  }

  /**
   * Get patterns for a state
   */
  getPatternsForState(state) {
    return PATTERNS[state] || [];
  }
}

/**
 * Get the configuration manager instance
 * Convenience function for accessing the singleton
 */
export function getConfigManager(initialConfig) {
  return ConfigManager.getInstance(initialConfig);
}

// Export the getConfigManager function and other utilities
export { getConfigManager, GOOEY_INTENSITY_PRESETS };
