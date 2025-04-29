/**
 * @module structuredPatterns
 * @description Defines animation patterns for the 'structured' state.
 */

import { BlobPattern } from './BlobPattern';
import { BlobAnimConfig, BlobAnimState, BlobPoint } from '../core/types';

const PatternMath = {
  center: (w: number, h: number) => ({ x: w / 2, y: h / 2 }),
  indexToAngle: (i: number, count: number, offset: number = 0) =>
    (2 * Math.PI * i) / count + offset,
  polarToCartesian: (
    cx: number,
    cy: number,
    r: number,
    angle: number,
    result?: { x: number; y: number }
  ) => {
    const res = result || { x: 0, y: 0 };
    res.x = cx + Math.cos(angle) * r;
    res.y = cy + Math.sin(angle) * r;
    return res;
  },
  getGridPosition: (i: number, count: number, w: number, h: number, center: boolean) => {
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const cellW = w / cols;
    const cellH = h / rows;
    const col = i % cols;
    const row = Math.floor(i / cols);
    let x = col * cellW + cellW / 2;
    let y = row * cellH + cellH / 2;
    if (center) {
      x += w / 2 - cols * cellW / 2;
      y += h / 2 - rows * cellH / 2;
    }
    return { x, y };
  },
};

export class StructuredPattern extends BlobPattern {
  private gridPoints: BlobPoint[] = [];
  private frequencies: number[] = [];
  private phases: number[] = [];
  
  /**
   * Initialize pattern with configuration
   * Precomputes values for animation efficiency
   */
  initialize(config: BlobAnimConfig): void {
    super.initialize(config);
    
    // Precompute animation parameters
    this.frequencies = Array.from({ length: config.count }, 
      (_, i) => 0.2 + (i / config.count) * 0.8 + (config.randomSeed || 0) * 0.1
    );
    
    this.phases = Array.from({ length: config.count },
      (_, i) => Math.random() * Math.PI * 2
    );
    
    // Generate grid-based structure
    this.gridPoints = this.generateGridPoints(config);
  }
  
  /**
   * Generate points based on the current state and configuration
   * Using deltaTime for frame-rate independence
   */
  generatePoints(config: BlobAnimConfig, state: BlobAnimState): BlobPoint[] {
    // If not initialized or config changed, initialize
    if (this.gridPoints.length !== config.count) {
      this.initialize(config);
    }
    
    const deltaTime = state.deltaTime || 0.016;
    
    return this.gridPoints.map((gridPoint, i) => {
      // Create subtle animation within the structure
      const xOffset = Math.sin(state.time * this.frequencies[i] + this.phases[i]) * 
                      (config.amplitude || 10) * 0.3;
      const yOffset = Math.cos(state.time * this.frequencies[i] + this.phases[i] * 1.3) * 
                      (config.amplitude || 10) * 0.3;
      
      return {
        x: gridPoint.x + xOffset * deltaTime * 60,
        y: gridPoint.y + yOffset * deltaTime * 60,
        radius: gridPoint.radius,
        color: gridPoint.color,
        opacity: gridPoint.opacity
      };
    });
  }
  
  /**
   * Generate grid-based pattern points
   */
  private generateGridPoints(config: BlobAnimConfig): BlobPoint[] {
    const points: BlobPoint[] = [];
    const cols = Math.ceil(Math.sqrt(config.count));
    const rows = Math.ceil(config.count / cols);
    
    const cellWidth = config.width / cols;
    const cellHeight = config.height / rows;
    
    // Create grid-based pattern
    for (let i = 0; i < config.count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      // Add slight randomization to grid positions
      const randomX = (Math.random() * 0.4 + 0.3) * cellWidth;
      const randomY = (Math.random() * 0.4 + 0.3) * cellHeight;
      
      points.push({
        x: col * cellWidth + randomX,
        y: row * cellHeight + randomY,
        radius: (config.minRadius || 3) + Math.random() * ((config.maxRadius || 6) - (config.minRadius || 3)),
        color: config.colors ? config.colors[i % config.colors.length] : undefined,
        opacity: 0.7 + Math.random() * 0.3,
        seed: Math.random()
      });
    }
    
    return points;
  }
  
  /**
   * Clean up resources
   */
  dispose(): void {
    this.gridPoints = [];
    this.frequencies = [];
    this.phases = [];
  }
}

export const structuredPatterns = {
  default: StructuredPattern,
  // Add other structured patterns here if needed
};
