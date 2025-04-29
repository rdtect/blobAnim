/**
 * BlobAnim Library - Main Entry Point
 *
 * Provides a clean, simplified API for creating and controlling blob animations.
 * Uses D3 for SVG creation and manipulation.
 */

import { BlobAnimation } from "./blob.js";
import { getConfigManager } from "./config.js";

/**
 * Create a new blob animation
 * @param {HTMLElement} container - Container element
 * @param {Object} config - Animation configuration
 * @returns {Object} Animation control object
 */
export function createAnim(container, config = {}) {
  if (!container || !(container instanceof HTMLElement)) {
    throw new Error("Invalid container: must be a valid HTML element");
  }

  // Create animation
  const animation = new BlobAnimation(container, config);

  // Start animation
  animation.start();

  // Return control object
  return {
    /**
     * Update animation configuration
     * @param {Object} newConfig - New configuration
     */
    updateConfig(newConfig) {
      getConfigManager(newConfig);
      // Refresh the animation with the new config
      animation.handleConfigUpdate(newConfig);
    },

    /**
     * Pause the animation
     */
    pause() {
      animation.stop();
    },

    /**
     * Resume the animation
     */
    resume() {
      animation.start();
    },

    /**
     * Get performance metrics
     * @returns {Object} Performance metrics
     */
    getPerformanceMetrics() {
      // Simple performance metrics
      return {
        fps: {
          current: 60, // Placeholder
          average: 60, // Placeholder
        },
      };
    },

    /**
     * Clean up resources
     */
    destroy() {
      animation.destroy();
    },
  };
}

// Export default for convenience
export default createAnim;
