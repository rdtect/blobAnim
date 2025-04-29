/**
 * @module chaosPatterns
 * @description Defines optimized animation patterns for the 'chaos' state.
 */

import { BlobPattern } from './BlobPattern';
import { BlobAnimConfig, BlobAnimState, BlobPoint } from '../core/types';

// Utility math helpers for patterns
const PatternMath = {
  center: (w: number, h: number) => ({ x: w / 2, y: h / 2 }),
  indexToAngle: (i: number, count: number, offset: number = 0) =>
    (2 * Math.PI * i) / count + offset,
  polarToCartesian: (
    cx: number,
    cy: number,
    r: number,
    angle: number,
  ): BlobPoint => {
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r
    };
  },
};

export class ChaosPattern extends BlobPattern {
  /**
   * Initialize pattern with configuration values
   * @param config Animation configuration
   */
  public initialize(config: BlobAnimConfig): void {
    super.initialize(config);
    
    const count = config.count || 5;
    
    // Precompute persistent values
    this.frequencies = Array.from({ length: count }, (_, i) => 
      0.5 + (i / count) * 0.7 + (config.randomSeed || 0.5) * 0.3);
      
    this.phases = Array.from({ length: count }, (_, i) => 
      i * Math.PI * 0.5 + (config.randomSeed || 0.5) * Math.PI);
      
    this.radii = Array.from({ length: count }, () => 0);
  }

  /**
   * Generate blob points using optimized calculations
   * @param config Animation configuration
   * @param state Current animation state
   * @returns Array of points with x,y coordinates
   */
  public generatePoints(config: BlobAnimConfig, state: BlobAnimState): BlobPoint[] {
    const count = config.count || 5;
    const w = config.width || 200;
    const h = config.height || 200;
    const center = PatternMath.center(w, h);
    const baseRadius = (Math.min(w, h) / 2) * (config.sizeFactor || 1) * 0.8;
    const chaos = config.chaosAmount || 1.0;
    
    // Ensure we have the right count of frequencies
    if (this.frequencies.length !== count) {
      this.initialize(config);
    }
    
    // Generate points
    const points: BlobPoint[] = [];
    
    for (let i = 0; i < count; ++i) {
      const angle = PatternMath.indexToAngle(i, count);
      const freq = this.frequencies[i];
      const phase = this.phases[i];
      
      // Smooth oscillation instead of random jitter
      const offset = Math.sin(state.time * (config.speed || 1) + phase) * chaos * baseRadius * 0.5;
      const r = baseRadius + offset;
      
      // Store radius for future reference
      this.radii[i] = r;
      
      // Get point coordinates
      const point = PatternMath.polarToCartesian(center.x, center.y, r, angle);
      
      // Add size and color from config when available
      point.radius = config.size;
      if (config.colors && config.colors.length > 0) {
        point.color = config.colors[i % config.colors.length];
      }
      
      points.push(point);
    }
    
    return points;
  }
}

export class OrbitalChaosPattern extends BlobPattern {
  public initialize(config: BlobAnimConfig): void {
    super.initialize(config);
    
    const count = config.count || 5;
    this.frequencies = Array.from({ length: count }, (_, i) => 0.5 + i * 0.1);
    this.phases = Array.from({ length: count }, (_, i) => i * 3);
  }
  
  public generatePoints(config: BlobAnimConfig, state: BlobAnimState): BlobPoint[] {
    const count = config.count || 5;
    const w = config.width || 200;
    const h = config.height || 200;
    const center = PatternMath.center(w, h);
    const radius = w * 0.3;
    const speed = config.speed || 1;
    
    // Ensure arrays are the right size
    if (this.frequencies.length !== count) {
      this.initialize(config);
    }
    
    const points: BlobPoint[] = [];
    
    for (let i = 0; i < count; ++i) {
      const angle = PatternMath.indexToAngle(i, count, state.time * 0.5 * speed);
      const offset = Math.sin(state.time * 2 * speed + this.phases[i]) * w * 0.05;
      
      const point = PatternMath.polarToCartesian(center.x, center.y, radius + offset, angle);
      
      // Add size and color from config
      point.radius = config.size;
      if (config.colors && config.colors.length > 0) {
        point.color = config.colors[i % config.colors.length];
      }
      
      points.push(point);
    }
    
    return points;
  }
}

export class TrueChaosPattern extends BlobPattern {
  public initialize(config: BlobAnimConfig): void {
    super.initialize(config);
    
    const count = config.count || 5;
    
    // Precalculate frequencies and phases
    this.frequencies = Array.from({ length: count }, (_, i) => 
      0.5 + (i / count) * 2 + (config.randomSeed || 0) * 0.5);
      
    this.phases = Array.from({ length: count }, (_, i) => 
      i * 3.7 + (config.randomSeed || 0) * Math.PI);
  }
  
  public generatePoints(config: BlobAnimConfig, state: BlobAnimState): BlobPoint[] {
    const count = config.count || 5;
    const w = config.width || 200;
    const h = config.height || 200;
    const center = PatternMath.center(w, h);
    const speed = config.speed || 1;
    
    // Ensure arrays are the right size
    if (this.frequencies.length !== count) {
      this.initialize(config);
    }
    
    const points: BlobPoint[] = [];
    
    for (let i = 0; i < count; ++i) {
      const uniqueFreq = this.frequencies[i];
      const uniquePhase = this.phases[i];

      // Complex multi-frequency motion
      const noiseX = Math.sin(state.time * uniqueFreq * speed + uniquePhase) * 
                    Math.sin(state.time * 0.4 * speed + i * 2);
                    
      const noiseY = Math.cos(state.time * uniqueFreq * speed + uniquePhase) * 
                    Math.sin(state.time * 0.3 * speed + i * 1.5);

      // Occasional "jumps" when sine wave peaks
      const jumpThreshold = 0.9;
      const jumpX = Math.sin(state.time * 0.2 + i * 5) > jumpThreshold ? 
                   Math.sin(state.time * 5) * w * 0.08 : 0;
                   
      const jumpY = Math.cos(state.time * 0.2 + i * 5) > jumpThreshold ? 
                   Math.cos(state.time * 5) * h * 0.08 : 0;

      // Create point
      const point: BlobPoint = {
        x: center.x + noiseX * w * 0.4 + jumpX,
        y: center.y + noiseY * h * 0.4 + jumpY,
        radius: config.size,
      };
      
      // Add color
      if (config.colors && config.colors.length > 0) {
        point.color = config.colors[i % config.colors.length];
      }
      
      points.push(point);
    }
    
    return points;
  }
}

export class SpiralChaosPattern extends BlobPattern {
  public initialize(config: BlobAnimConfig): void {
    super.initialize(config);
    
    const count = config.count || 5;
    this.phases = Array.from({ length: count }, (_, i) => i);
  }
  
  public generatePoints(config: BlobAnimConfig, state: BlobAnimState): BlobPoint[] {
    const count = config.count || 5;
    const w = config.width || 200;
    const h = config.height || 200;
    const center = PatternMath.center(w, h);
    const speed = config.speed || 1;
    
    // Ensure arrays are the right size
    if (this.phases.length !== count) {
      this.initialize(config);
    }
    
    const points: BlobPoint[] = [];
    
    for (let i = 0; i < count; ++i) {
      const angle = PatternMath.indexToAngle(i, count, state.time * 0.5 * speed);
      const radius = (i / count) * w * 0.25 + w * 0.05;
      const offset = Math.sin(state.time * 2 * speed + this.phases[i]) * w * 0.02;
      
      const point = PatternMath.polarToCartesian(center.x, center.y, radius + offset, angle);
      
      // Add radius and color
      point.radius = config.size;
      if (config.colors && config.colors.length > 0) {
        point.color = config.colors[i % config.colors.length];
      }
      
      points.push(point);
    }
    
    return points;
  }
}

export class ExplosionChaosPattern extends BlobPattern {
  public generatePoints(config: BlobAnimConfig, state: BlobAnimState): BlobPoint[] {
    const count = config.count || 5;
    const w = config.width || 200;
    const h = config.height || 200;
    const center = PatternMath.center(w, h);
    const speed = config.speed || 1;
    
    const points: BlobPoint[] = [];
    
    // The pulse is the key animation effect
    const pulseSpeed = state.time * 2 * speed;
    const baseRadius = (0.2 + Math.sin(pulseSpeed) * 0.1) * w;
    
    for (let i = 0; i < count; ++i) {
      const angle = PatternMath.indexToAngle(i, count);
      const point = PatternMath.polarToCartesian(center.x, center.y, baseRadius, angle);
      
      // Add radius and color
      point.radius = config.size;
      if (config.colors && config.colors.length > 0) {
        point.color = config.colors[i % config.colors.length];
      }
      
      points.push(point);
    }
    
    return points;
  }
}

export class BrownianChaosPattern extends BlobPattern {
  public initialize(config: BlobAnimConfig): void {
    super.initialize(config);
    
    const count = config.count || 5;
    
    // Initialize velocities for brownian motion
    this.velocities = Array.from({ length: count }, () => ({ x: 0, y: 0 }));
    this.phases = Array.from({ length: count }, (_, i) => i * 1.618033988749895); // Golden ratio for variety
  }
  
  public update(config: BlobAnimConfig, state: BlobAnimState): void {
    // Update velocities with small random changes
    if (!this.initialized || this.velocities.length !== (config.count || 5)) {
      this.initialize(config);
      return;
    }
    
    const deltaTime = state.deltaTime || 0.016;
    const speed = config.speed || 1;
    
    for (let i = 0; i < this.velocities.length; i++) {
      // Add tiny random impulses using deterministic noise
      const seed = this.phases[i];
      const time = state.time;
      
      this.velocities[i].x += (Math.sin(time * 7 + seed * 13) * 2 - 1) * speed * deltaTime * 50;
      this.velocities[i].y += (Math.cos(time * 5 + seed * 7) * 2 - 1) * speed * deltaTime * 50;
      
      // Dampen velocities to prevent extreme speeds
      this.velocities[i].x *= 0.98;
      this.velocities[i].y *= 0.98;
    }
  }
  
  public generatePoints(config: BlobAnimConfig, state: BlobAnimState): BlobPoint[] {
    const count = config.count || 5;
    const w = config.width || 200;
    const h = config.height || 200;
    const center = PatternMath.center(w, h);
    
    // Ensure arrays are the right size
    if (this.velocities.length !== count) {
      this.initialize(config);
    }
    
    const points: BlobPoint[] = [];
    const maxDistance = Math.min(w, h) * 0.4; // Max distance from center
    
    for (let i = 0; i < count; ++i) {
      // Use velocities to update positions
      const seed = this.phases[i];
      
      // Use multiple harmonic oscillators for complex but deterministic motion
      const xNoise = Math.sin(state.time * 0.3 + seed) +
                    Math.sin(state.time * 0.7 + seed * 2) * 0.5 +
                    Math.sin(state.time * 1.1 + seed * 3) * 0.25;
                    
      const yNoise = Math.cos(state.time * 0.4 + seed) +
                    Math.cos(state.time * 0.6 + seed * 2) * 0.5 +
                    Math.cos(state.time * 1.3 + seed * 3) * 0.25;
      
      // Create the point
      const point: BlobPoint = {
        x: center.x + xNoise * (w * 0.3),
        y: center.y + yNoise * (h * 0.3),
        radius: config.size,
        velocity: this.velocities[i]
      };
      
      // Keep points within bounds
      const dx = point.x - center.x;
      const dy = point.y - center.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > maxDistance) {
        const scale = maxDistance / distance;
        point.x = center.x + dx * scale;
        point.y = center.y + dy * scale;
      }
      
      // Add color
      if (config.colors && config.colors.length > 0) {
        point.color = config.colors[i % config.colors.length];
      }
      
      points.push(point);
    }
    
    return points;
  }
}

// Export all chaos patterns as a registry for use in ANIMATION_CONFIG
export const chaosPatterns = {
  default: ChaosPattern,
  orbital: OrbitalChaosPattern,
  true: TrueChaosPattern,
  spiral: SpiralChaosPattern,
  explosion: ExplosionChaosPattern,
  brownian: BrownianChaosPattern,
};
