/**
 * Chaos Animation Patterns
 * 
 * Provides pattern functions for the chaos state.
 */

// Map to store state for stateful patterns
const movementState = new Map();

/**
 * Default chaos pattern using mathematical functions
 * @param {number} index - Element index
 * @param {number} count - Total element count
 * @param {number} time - Current animation time
 * @param {number} intensity - Animation intensity
 * @param {Object} config - Animation configuration
 * @returns {Object} Position data
 */
function defaultPattern(index, count, time, intensity = 1, config = {}) {
  // Simplified implementation that doesn't require D3
  const angle = (index / count) * Math.PI * 2 + time * 0.5;
  const radius = 0.3 * intensity;

  // Add some randomness
  const randomOffset = Math.sin(time * 2 + index * 3) * 0.1 * intensity;
  
  // Get container dimensions
  const width = config.width || 400;
  const height = config.height || 400;

  return {
    id: `chaos-math-${index}`,
    x: width * (0.5 + Math.cos(angle) * (radius + randomOffset)),
    y: height * (0.5 + Math.sin(angle) * (radius + randomOffset)),
    scale: 0.8 + Math.sin(time + index) * 0.2,
    opacity: 1
  };
}

/**
 * Random chaos pattern
 * @param {number} index - Element index
 * @param {number} count - Total element count
 * @param {number} time - Current animation time
 * @param {number} intensity - Animation intensity
 * @param {Object} config - Animation configuration
 * @returns {Object} Position data
 */
function randomPattern(index, count, time, intensity = 1, config = {}) {
  // Enhanced baseline intensity to create more movement
  const intensityFactor = typeof intensity === "number" ? intensity : 1;
  const movementScale = 0.35 * intensityFactor;
  
  // Get container dimensions
  const width = config.width || 400;
  const height = config.height || 400;
  
  // Use noise-like functions for smooth randomness
  const noiseX = Math.sin(time * 0.5 + index * 2.1) * Math.cos(time * 0.3 + index * 1.1);
  const noiseY = Math.cos(time * 0.4 + index * 1.7) * Math.sin(time * 0.2 + index * 2.3);
  
  return {
    id: `chaos-random-${index}`,
    x: width * (0.5 + noiseX * movementScale),
    y: height * (0.5 + noiseY * movementScale),
    scale: 0.7 + Math.sin(time * 0.7 + index) * 0.3,
    opacity: 0.7 + Math.cos(time * 0.5 + index) * 0.3
  };
}

/**
 * Brownian motion pattern
 * @param {number} index - Element index
 * @param {number} count - Total element count
 * @param {number} time - Current animation time
 * @param {number} intensity - Animation intensity
 * @param {Object} config - Animation configuration
 * @returns {Object} Position data
 */
function brownianPattern(index, count, time, intensity = 1, config = {}) {
  // Get container dimensions
  const width = config.width || 400;
  const height = config.height || 400;
  
  // Get previous movement state or initialize new if first time
  let state = movementState.get(index);
  if (!state) {
    // Create initial random movement vectors
    state = {
      x: width * 0.5, // Start at center
      y: height * 0.5, // Start at center
      dx: (Math.random() * 2 - 1) * 0.01, // Small initial movement
      dy: (Math.random() * 2 - 1) * 0.01,
      scale: 1
    };
    movementState.set(index, state);
  }
  
  // Apply random changes to direction
  state.dx += (Math.random() * 2 - 1) * 0.002 * intensity;
  state.dy += (Math.random() * 2 - 1) * 0.002 * intensity;
  
  // Limit maximum speed
  const maxSpeed = 0.01 * intensity;
  const speed = Math.sqrt(state.dx * state.dx + state.dy * state.dy);
  if (speed > maxSpeed) {
    state.dx = (state.dx / speed) * maxSpeed;
    state.dy = (state.dy / speed) * maxSpeed;
  }
  
  // Update position
  state.x += state.dx * width;
  state.y += state.dy * height;
  
  // Bounce off edges
  if (state.x < 0 || state.x > width) {
    state.dx = -state.dx;
    state.x = Math.max(0, Math.min(width, state.x));
  }
  if (state.y < 0 || state.y > height) {
    state.dy = -state.dy;
    state.y = Math.max(0, Math.min(height, state.y));
  }
  
  // Update scale with a subtle pulsing effect
  state.scale = 0.8 + Math.sin(time + index) * 0.2;
  
  return {
    id: `chaos-brownian-${index}`,
    x: state.x,
    y: state.y,
    scale: state.scale,
    opacity: 1
  };
}

/**
 * Explosion pattern
 * @param {number} index - Element index
 * @param {number} count - Total element count
 * @param {number} time - Current animation time
 * @param {number} intensity - Animation intensity
 * @param {Object} config - Animation configuration
 * @returns {Object} Position data
 */
function explosionPattern(index, count, time, intensity = 1, config = {}) {
  // Get container dimensions
  const width = config.width || 400;
  const height = config.height || 400;
  
  // Simplified explosion effect
  const angle = (index / count) * Math.PI * 2;
  const explosionProgress = Math.min(1, (time % 5) / 5); // Cycle every 5 seconds
  const radius = 0.4 * explosionProgress * intensity;
  
  return {
    id: `chaos-explosion-${index}`,
    x: width * (0.5 + Math.cos(angle) * radius),
    y: height * (0.5 + Math.sin(angle) * radius),
    scale: 1.0 - explosionProgress * 0.3, // Get smaller as they move out
    opacity: 1.0 - explosionProgress * 0.5 // Fade out as they move out
  };
}

/**
 * Math-based brownian pattern
 * @param {number} index - Element index
 * @param {number} count - Total element count
 * @param {number} time - Current animation time
 * @param {number} intensity - Animation intensity
 * @param {Object} config - Animation configuration
 * @returns {Object} Position data
 */
function mathBrownianPattern(index, count, time, intensity = 1, config = {}) {
  // Get container dimensions
  const width = config.width || 400;
  const height = config.height || 400;
  
  // Simplified Brownian motion
  const seed1 = index * 0.1;
  const seed2 = index * 0.2;
  
  // Use multiple sine waves at different frequencies for more natural movement
  const x = 0.5 + 
    Math.sin(time * 0.3 + seed1) * 0.2 * intensity + 
    Math.sin(time * 0.7 + seed2) * 0.1 * intensity;
    
  const y = 0.5 + 
    Math.cos(time * 0.4 + seed1) * 0.2 * intensity + 
    Math.cos(time * 0.6 + seed2) * 0.1 * intensity;
  
  return {
    id: `chaos-math-brownian-${index}`,
    x: width * x,
    y: height * y,
    scale: 0.8 + Math.sin(time * 0.5 + index) * 0.2,
    opacity: 1
  };
}

/**
 * Math-based explosion pattern
 * @param {number} index - Element index
 * @param {number} count - Total element count
 * @param {number} time - Current animation time
 * @param {number} intensity - Animation intensity
 * @param {Object} config - Animation configuration
 * @returns {Object} Position data
 */
function mathExplosionPattern(index, count, time, intensity = 1, config = {}) {
  // Get container dimensions
  const width = config.width || 400;
  const height = config.height || 400;
  
  // Simplified explosion effect with math functions
  const angle = (index / count) * Math.PI * 2;
  const cycle = time % 10; // 10-second cycle
  const explosionProgress = cycle < 5 ? cycle / 5 : (10 - cycle) / 5; // Expand then contract
  const radius = 0.4 * explosionProgress * intensity;
  
  return {
    id: `chaos-math-explosion-${index}`,
    x: width * (0.5 + Math.cos(angle) * radius),
    y: height * (0.5 + Math.sin(angle) * radius),
    scale: 1.0 - explosionProgress * 0.3 + Math.sin(time + index) * 0.1,
    opacity: 1.0 - explosionProgress * 0.3
  };
}

/**
 * Circle pattern
 * @param {number} index - Element index
 * @param {number} count - Total element count
 * @param {number} time - Current animation time
 * @param {number} intensity - Animation intensity
 * @param {Object} config - Animation configuration
 * @returns {Object} Position data
 */
function circlePattern(index, count, time, intensity = 1, config = {}) {
  // Get container dimensions
  const width = config.width || 400;
  const height = config.height || 400;
  
  // Calculate position on circle with some chaos
  const angle = (index / count) * Math.PI * 2 + time * 0.2;
  const radius = 0.3 + Math.sin(time * 0.5 + index * 0.7) * 0.1 * intensity;
  
  return {
    id: `chaos-circle-${index}`,
    x: width * (0.5 + Math.cos(angle) * radius),
    y: height * (0.5 + Math.sin(angle) * radius),
    scale: 0.8 + Math.sin(time + index) * 0.2,
    opacity: 0.7 + Math.cos(time * 0.3 + index) * 0.3
  };
}

/**
 * Export all chaos patterns
 */
export const chaosPatterns = {
  default: defaultPattern,
  random: randomPattern,
  brownian: brownianPattern,
  explosion: explosionPattern,
  'math-brownian': mathBrownianPattern,
  'math-explosion': mathExplosionPattern,
  math: defaultPattern,
  circle: circlePattern
};
