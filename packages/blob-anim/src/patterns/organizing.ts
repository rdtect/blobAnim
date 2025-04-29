/**
 * @module organizingPatterns
 * @description Defines animation patterns for the 'organizing' state.
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
  getGridPosition: (
    i: number,
    count: number,
    w: number,
    h: number,
    withPadding = true
  ) => {
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const col = i % cols;
    const row = Math.floor(i / cols);
    if (withPadding) {
      const cellWidth = w / (cols + 1);
      const cellHeight = h / (rows + 1);
      return {
        x: (col + 1) * cellWidth,
        y: (row + 1) * cellHeight,
      };
    } else {
      const cellWidth = w / cols;
      const cellHeight = h / rows;
      return {
        x: col * cellWidth + cellWidth / 2,
        y: row * cellHeight + cellHeight / 2,
      };
    }
  },
};

export class OrganizingPattern extends BlobPattern {
  private frequencies: number[] = [];
  private phases: number[] = [];
  private basePoints: BlobPoint[] = [];
  private centerX: number = 0;
  private centerY: number = 0;
  private targetPoints: BlobPoint[] = [];
  
  /**
   * Initialize pattern with configuration
   * Precomputes values for animation efficiency
   */
  initialize(config: BlobAnimConfig): void {
    super.initialize(config);
    
    // Calculate center of container
    this.centerX = config.width / 2;
    this.centerY = config.height / 2;
    
    // Precompute frequencies for animation
    this.frequencies = Array.from({ length: config.count }, 
      (_, i) => 0.3 + (i / config.count) * 1.2 + (config.randomSeed || 0) * 0.2
    );
    
    // Precompute phases for variation
    this.phases = Array.from({ length: config.count },
      (_, i) => Math.random() * Math.PI * 2
    );
    
    // Generate initial random positions
    this.basePoints = this.generateBasePoints(config);
    
    // Generate target organized positions
    this.targetPoints = this.generateTargetPoints(config);
  }
  
  /**
   * Generate points based on the current state and configuration
   * Using deltaTime for frame-rate independence
   */
  generatePoints(config: BlobAnimConfig, state: BlobAnimState): BlobPoint[] {
    // If not initialized or config changed, initialize
    if (this.frequencies.length !== config.count) {
      this.initialize(config);
    }
    
    // Get deltaTime with fallback
    const deltaTime = state.deltaTime || 0.016;
    
    // Organization progress over 5 seconds, capped at 1
    const currentProgress = Math.min(1, (state.time || 0) / 5); 
    
    return this.basePoints.map((basePoint, i) => {
      const targetPoint = this.targetPoints[i];
      
      // Calculate oscillation using deltaTime, reducing as organization progresses
      const oscillation = Math.sin(state.time * this.frequencies[i] + this.phases[i]) * 
                          config.amplitude * (1 - currentProgress * 0.8);
      
      // Apply organized target impact based on progress
      const x = basePoint.x * (1 - currentProgress) + targetPoint.x * currentProgress + 
                oscillation * (config.directionX || 1) * deltaTime * 60;
      const y = basePoint.y * (1 - currentProgress) + targetPoint.y * currentProgress + 
                oscillation * (config.directionY || 1) * deltaTime * 60;
      
      return {
        x,
        y,
        radius: basePoint.radius,
        color: basePoint.color,
        // Increase opacity as they organize
        opacity: Math.min(1, basePoint.opacity || 0.8) * (0.5 + 0.5 * currentProgress)
      };
    });
  }
  
  /**
   * Generate initial random positions
   */
  private generateBasePoints(config: BlobAnimConfig): BlobPoint[] {
    return Array.from({ length: config.count }, (_, i) => {
      return {
        x: Math.random() * config.width,
        y: Math.random() * config.height,
        radius: (config.minRadius || 2) + Math.random() * ((config.maxRadius || 8) - (config.minRadius || 2)),
        color: config.colors ? config.colors[i % config.colors.length] : undefined,
        opacity: 0.5 + Math.random() * 0.5,
        seed: Math.random()
      };
    });
  }
  
  /**
   * Generate target positions for organized state
   */
  private generateTargetPoints(config: BlobAnimConfig): BlobPoint[] {
    const points: BlobPoint[] = [];
    const radius = Math.min(config.width, config.height) * 0.4;
    
    for (let i = 0; i < config.count; i++) {
      const angle = (i / config.count) * Math.PI * 2;
      const x = this.centerX + Math.cos(angle) * radius;
      const y = this.centerY + Math.sin(angle) * radius;
      
      points.push({
        x,
        y,
        radius: (config.minRadius || 2) + Math.random() * ((config.maxRadius || 8) - (config.minRadius || 2)),
        color: config.colors ? config.colors[i % config.colors.length] : undefined,
        opacity: 0.8 + Math.random() * 0.2
      });
    }
    
    return points;
  }
  
  /**
   * Clean up resources
   */
  dispose(): void {
    this.frequencies = [];
    this.phases = [];
    this.basePoints = [];
    this.targetPoints = [];
  }
}

// Export all organizing patterns as a registry for use in ANIMATION_CONFIG
export const organizingPatterns = {
  default: OrganizingPattern,
  // Add other organizing patterns here if needed
};
