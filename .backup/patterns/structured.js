/**
 * Structured Animation Patterns
 * 
 * Provides pattern functions for the structured state.
 */

/**
 * Default structured pattern (grid)
 * @param {number} index - Element index
 * @param {number} count - Total element count
 * @param {number} time - Current animation time
 * @param {number} intensity - Animation intensity
 * @param {Object} config - Animation configuration
 * @returns {Object} Position data
 */
function defaultPattern(index, count, time, intensity = 1, config = {}) {
  return gridPattern(index, count, time, intensity, config);
}

/**
 * Basic structured pattern with minimal movement
 * @param {number} index - Element index
 * @param {number} count - Total element count
 * @param {number} time - Current animation time
 * @param {number} intensity - Animation intensity
 * @param {Object} config - Animation configuration
 * @returns {Object} Position data
 */
function basicPattern(index, count, time, intensity = 1, config = {}) {
  // Get container dimensions
  const width = config.width || 400;
  const height = config.height || 400;
  
  // Simplified implementation with precise circle arrangement
  const angle = (index / count) * Math.PI * 2;
  const radius = 0.3 * Math.min(width, height) / 2 * intensity;
  
  // Very minimal movement
  const wobble = Math.sin(time * 0.2 + index) * 2;
  
  return {
    id: `structured-basic-${index}`,
    x: width / 2 + Math.cos(angle) * radius + wobble,
    y: height / 2 + Math.sin(angle) * radius + wobble,
    scale: 1,
    opacity: 1
  };
}

/**
 * Grid pattern
 * @param {number} index - Element index
 * @param {number} count - Total element count
 * @param {number} time - Current animation time
 * @param {number} intensity - Animation intensity
 * @param {Object} config - Animation configuration
 * @returns {Object} Position data
 */
function gridPattern(index, count, time, intensity = 1, config = {}) {
  // Get container dimensions
  const width = config.width || 400;
  const height = config.height || 400;
  
  // Calculate grid dimensions
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  
  // Calculate cell position
  const col = index % cols;
  const row = Math.floor(index / cols);
  
  // Calculate cell size
  const cellWidth = width / cols;
  const cellHeight = height / rows;
  
  // Calculate cell center
  const centerX = cellWidth * (col + 0.5);
  const centerY = cellHeight * (row + 0.5);
  
  // Add minimal movement
  const wobble = Math.sin(time * 0.1 + index) * 2 * intensity;
  
  return {
    id: `structured-grid-${index}`,
    x: centerX + wobble,
    y: centerY + wobble,
    scale: 1,
    opacity: 1
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
  
  // Calculate position on circle
  const angle = (index / count) * Math.PI * 2;
  const radius = 0.4 * Math.min(width, height) / 2 * intensity;
  
  // Add minimal movement
  const wobble = Math.sin(time * 0.1 + index) * 2;
  
  return {
    id: `structured-circle-${index}`,
    x: width / 2 + Math.cos(angle) * radius + wobble,
    y: height / 2 + Math.sin(angle) * radius + wobble,
    scale: 1,
    opacity: 1
  };
}

/**
 * Orbit pattern
 * @param {number} index - Element index
 * @param {number} count - Total element count
 * @param {number} time - Current animation time
 * @param {number} intensity - Animation intensity
 * @param {Object} config - Animation configuration
 * @returns {Object} Position data
 */
function orbitPattern(index, count, time, intensity = 1, config = {}) {
  // Get container dimensions
  const width = config.width || 400;
  const height = config.height || 400;
  
  // Determine which orbit this node belongs to
  const orbits = 3; // Number of orbital rings
  const orbitIndex = Math.floor((index / count) * orbits);
  const nodesInOrbit = Math.ceil(count / orbits);
  const nodeIndexInOrbit = index % nodesInOrbit;
  
  // Calculate orbit radius
  const baseRadius = Math.min(width, height) / 2 * 0.4 * intensity;
  const orbitRadius = baseRadius * ((orbitIndex + 1) / orbits);
  
  // Calculate orbit speed (inner orbits move faster)
  const orbitSpeed = 0.2 * (1 - orbitIndex / orbits);
  
  // Calculate position on orbit
  const angle = (nodeIndexInOrbit / nodesInOrbit) * Math.PI * 2 + time * orbitSpeed;
  
  return {
    id: `structured-orbit-${index}`,
    x: width / 2 + Math.cos(angle) * orbitRadius,
    y: height / 2 + Math.sin(angle) * orbitRadius,
    scale: 1 - orbitIndex * 0.2, // Smaller as they go outward
    opacity: 1
  };
}

/**
 * Flower pattern
 * @param {number} index - Element index
 * @param {number} count - Total element count
 * @param {number} time - Current animation time
 * @param {number} intensity - Animation intensity
 * @param {Object} config - Animation configuration
 * @returns {Object} Position data
 */
function flowerPattern(index, count, time, intensity = 1, config = {}) {
  // Get container dimensions
  const width = config.width || 400;
  const height = config.height || 400;
  
  // Calculate flower parameters
  const petals = 5;
  const angle = (index / count) * Math.PI * 2;
  const radius = 0.3 * Math.min(width, height) / 2 * intensity;
  
  // Calculate position with flower petal effect
  const petalEffect = Math.cos(petals * angle) * 0.3;
  const adjustedRadius = radius * (1 + petalEffect);
  
  // Add subtle rotation
  const rotationSpeed = 0.05;
  const rotatedAngle = angle + time * rotationSpeed;
  
  return {
    id: `structured-flower-${index}`,
    x: width / 2 + Math.cos(rotatedAngle) * adjustedRadius,
    y: height / 2 + Math.sin(rotatedAngle) * adjustedRadius,
    scale: 0.8 + petalEffect * 0.4, // Larger at petal tips
    opacity: 1
  };
}

/**
 * Export all structured patterns
 */
export const structuredPatterns = {
  default: defaultPattern,
  basic: basicPattern,
  grid: gridPattern,
  circle: circlePattern,
  orbit: orbitPattern,
  flower: flowerPattern
};
