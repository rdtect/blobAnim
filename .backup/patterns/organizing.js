/**
 * Organizing Animation Patterns
 * 
 * Provides pattern functions for the organizing state.
 */

/**
 * Default organizing pattern (grid)
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
  
  // Add some movement
  const wobble = Math.sin(time + index) * 10 * intensity;
  
  return {
    id: `organizing-grid-${index}`,
    x: centerX + wobble,
    y: centerY + wobble,
    scale: 0.8 + Math.sin(time * 0.5 + index) * 0.2,
    opacity: 1
  };
}

/**
 * Spiral pattern
 * @param {number} index - Element index
 * @param {number} count - Total element count
 * @param {number} time - Current animation time
 * @param {number} intensity - Animation intensity
 * @param {Object} config - Animation configuration
 * @returns {Object} Position data
 */
function spiralPattern(index, count, time, intensity = 1, config = {}) {
  // Get container dimensions
  const width = config.width || 400;
  const height = config.height || 400;
  
  // Calculate spiral parameters
  const normalizedIndex = index / count;
  const angle = normalizedIndex * Math.PI * 8 + time * 0.1; // Slow rotation
  const radius = (0.2 + normalizedIndex * 0.3) * Math.min(width, height) / 2 * intensity;
  
  // Calculate position
  const centerX = width / 2;
  const centerY = height / 2;
  const x = centerX + Math.cos(angle) * radius;
  const y = centerY + Math.sin(angle) * radius;
  
  return {
    id: `organizing-spiral-${index}`,
    x: x,
    y: y,
    scale: 1 - normalizedIndex * 0.5, // Smaller as they go outward
    opacity: 1
  };
}

/**
 * Wave pattern
 * @param {number} index - Element index
 * @param {number} count - Total element count
 * @param {number} time - Current animation time
 * @param {number} intensity - Animation intensity
 * @param {Object} config - Animation configuration
 * @returns {Object} Position data
 */
function wavePattern(index, count, time, intensity = 1, config = {}) {
  // Get container dimensions
  const width = config.width || 400;
  const height = config.height || 400;
  
  // Calculate normalized position in wave
  const normalizedIndex = index / count;
  
  // Calculate wave parameters
  const waveAmplitude = 0.2 * height * intensity;
  const waveFrequency = 3;
  const waveSpeed = 0.5;
  
  // Calculate position
  const x = width * normalizedIndex;
  const baseY = height / 2;
  const waveY = Math.sin(normalizedIndex * waveFrequency * Math.PI * 2 + time * waveSpeed) * waveAmplitude;
  
  return {
    id: `organizing-wave-${index}`,
    x: x,
    y: baseY + waveY,
    scale: 0.8 + Math.sin(time * 0.3 + index) * 0.2,
    opacity: 1
  };
}

/**
 * Cylinder pattern
 * @param {number} index - Element index
 * @param {number} count - Total element count
 * @param {number} time - Current animation time
 * @param {number} intensity - Animation intensity
 * @param {Object} config - Animation configuration
 * @returns {Object} Position data
 */
function cylinderPattern(index, count, time, intensity = 1, config = {}) {
  // Get container dimensions
  const width = config.width || 400;
  const height = config.height || 400;
  
  // Calculate cylinder parameters
  const rows = Math.ceil(Math.sqrt(count / 2));
  const cols = Math.ceil(count / rows);
  
  // Calculate row and column
  const row = Math.floor(index / cols);
  const col = index % cols;
  
  // Calculate cell size
  const cellWidth = width / cols;
  const cellHeight = height / rows;
  
  // Calculate base position
  const baseX = cellWidth * (col + 0.5);
  const baseY = cellHeight * (row + 0.5);
  
  // Calculate rotation angle for this element
  const rotationAngle = time * 0.5 + (col / cols) * Math.PI * 2;
  
  // Apply 3D-like effect with scaling based on Y rotation
  const scale = 0.5 + Math.abs(Math.cos(rotationAngle)) * 0.5;
  
  // Calculate X position with rotation effect
  const xOffset = Math.sin(rotationAngle) * cellWidth * 0.3 * intensity;
  
  return {
    id: `organizing-cylinder-${index}`,
    x: baseX + xOffset,
    y: baseY,
    scale: scale,
    opacity: 0.5 + scale * 0.5 // More opaque when larger (closer)
  };
}

/**
 * Export all organizing patterns
 */
export const organizingPatterns = {
  default: defaultPattern,
  grid: gridPattern,
  spiral: spiralPattern,
  wave: wavePattern,
  cylinder: cylinderPattern
};
