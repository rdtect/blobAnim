import { BlobAnimConfig, BlobPoint } from "../core/types";
import { BlobPattern } from "./BlobPattern";

// Animation configuration constants
export const ANIMATION_CONFIG = {
  states: [
    {
      name: "chaos",
      variants: ["default", "random", "spiral", "explosion", "brownian"],
    },
    { name: "organizing", variants: ["default", "math", "math-explosion"] },
    { name: "structured", variants: ["default", "circle", "pulse"] },
  ],
};

/**
 * ChaosPattern - Random, chaotic movement of blobs with attraction/repulsion
 */
export class ChaosPattern extends BlobPattern {
  // Store velocity for smoother movement
  private velocities: Array<{ x: number; y: number }> = [];

  public initialize(config: BlobAnimConfig): void {
    this.points = Array.from({ length: config.count }, (_, i) => ({
      x: Math.random() * (config.width || 400),
      y: Math.random() * (config.height || 400),
      radius: config.size * (0.5 + Math.random() * 0.5),
      color: config.colors[i % config.colors.length],
      id: `blob-${i}`,
    }));

    // Initialize velocities
    this.velocities = Array.from({ length: config.count }, () => ({
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
    }));
  }

  public getPoints(time: number, config: BlobAnimConfig): BlobPoint[] {
    const chaosAmount =
      config.chaosAmount !== undefined ? config.chaosAmount : 1;
    const centerX = (config.width || 400) / 2;
    const centerY = (config.height || 400) / 2;
    const maxDist = Math.min(config.width || 400, config.height || 400) / 2;

    // Update velocities and positions with attraction/repulsion
    return this.points.map((point, i) => {
      // Add natural wandering
      this.velocities[i].x +=
        (Math.random() - 0.5) * config.speed * chaosAmount;
      this.velocities[i].y +=
        (Math.random() - 0.5) * config.speed * chaosAmount;

      // Add attraction to center
      const dx = centerX - point.x;
      const dy = centerY - point.y;
      const distToCenter = Math.sqrt(dx * dx + dy * dy);

      // Attraction force increases with distance
      const centerAttraction = 0.01 * config.speed * (distToCenter / maxDist);
      this.velocities[i].x += dx * centerAttraction;
      this.velocities[i].y += dy * centerAttraction;

      // Add repulsion from other points
      this.points.forEach((otherPoint, j) => {
        if (i !== j) {
          const ox = otherPoint.x - point.x;
          const oy = otherPoint.y - point.y;
          const dist = Math.sqrt(ox * ox + oy * oy);
          if (dist < (point.radius || config.size) * 3) {
            // Repulsion force decreases with distance
            const repulsion = (-0.05 * config.speed) / (dist + 1);
            this.velocities[i].x += ox * repulsion;
            this.velocities[i].y += oy * repulsion;
          }
        }
      });

      // Apply damping to avoid excessive speed
      this.velocities[i].x *= 0.95;
      this.velocities[i].y *= 0.95;

      // Apply velocity
      const newX = point.x + this.velocities[i].x;
      const newY = point.y + this.velocities[i].y;

      // Bounce off walls
      if (newX < 0 || newX > (config.width || 400)) {
        this.velocities[i].x *= -0.8;
      }

      if (newY < 0 || newY > (config.height || 400)) {
        this.velocities[i].y *= -0.8;
      }

      // Pulse the size with time
      const pulseFactor = 1 + 0.2 * Math.sin(time * 2 + i);

      return {
        ...point,
        x: newX,
        y: newY,
        radius: (point.radius || config.size) * pulseFactor,
      };
    });
  }

  public dispose(): void {
    this.points = [];
    this.velocities = [];
  }
}

/**
 * OrganizingPattern - Blobs moving towards a structured form with size oscillation
 */
export class OrganizingPattern extends BlobPattern {
  public initialize(config: BlobAnimConfig): void {
    this.points = Array.from({ length: config.count }, (_, i) => {
      const angle = (i / config.count) * Math.PI * 2;
      const distance = 100 + Math.random() * 50;
      return {
        x: Math.cos(angle) * distance + (config.width || 400) / 2,
        y: Math.sin(angle) * distance + (config.height || 400) / 2,
        radius: config.size * (0.8 + Math.random() * 0.4),
        color: config.colors[i % config.colors.length],
        id: `blob-${i}`,
        initialAngle: angle,
      };
    });
  }

  public getPoints(time: number, config: BlobAnimConfig): BlobPoint[] {
    return this.points.map((point, i) => {
      const angle = (point.initialAngle as number) + time * config.speed * 0.1;
      const targetX = Math.cos(angle) * 150 + (config.width || 400) / 2;
      const targetY = Math.sin(angle) * 150 + (config.height || 400) / 2;

      // Ease toward target position
      const easeAmount = 0.05 * config.speed;
      const newX = point.x + (targetX - point.x) * easeAmount;
      const newY = point.y + (targetY - point.y) * easeAmount;

      // Oscillate size with position
      const distanceToTarget = Math.sqrt(
        Math.pow(targetX - point.x, 2) + Math.pow(targetY - point.y, 2)
      );
      const sizeFactor = 1 + 0.3 * Math.sin(time * 3 + i);

      return {
        ...point,
        x: newX,
        y: newY,
        radius: (point.radius || config.size) * sizeFactor,
      };
    });
  }

  public dispose(): void {
    this.points = [];
  }
}

/**
 * StructuredPattern - Blobs in organized patterns with fluid motion
 */
export class StructuredPattern extends BlobPattern {
  public initialize(config: BlobAnimConfig): void {
    this.points = Array.from({ length: config.count }, (_, i) => {
      const angle = (i / config.count) * Math.PI * 2;
      return {
        x: Math.cos(angle) * 150 + (config.width || 400) / 2,
        y: Math.sin(angle) * 150 + (config.height || 400) / 2,
        radius: config.size,
        color: config.colors[i % config.colors.length],
        id: `blob-${i}`,
        initialAngle: angle,
      };
    });
  }

  public getPoints(time: number, config: BlobAnimConfig): BlobPoint[] {
    const variant = config.variant || "default";

    return this.points.map((point, i) => {
      const angle = (point.initialAngle as number) + time * config.speed * 0.05;

      // Different patterns based on variant
      let x = point.x;
      let y = point.y;
      let radius = point.radius || config.size;

      const centerX = (config.width || 400) / 2;
      const centerY = (config.height || 400) / 2;

      if (variant === "circle") {
        // Circular pattern
        x = Math.cos(angle) * 150 + centerX;
        y = Math.sin(angle) * 150 + centerY;

        // Make size oscillate slightly
        radius =
          (point.radius || config.size) *
          (1 + 0.1 * Math.sin(time * 4 + i * 0.5));
      } else if (variant === "pulse") {
        // Pulsing pattern
        const baseDistance = 120 + 40 * Math.sin(time * config.speed * 0.5);
        x = Math.cos(angle) * baseDistance + centerX;
        y = Math.sin(angle) * baseDistance + centerY;

        // Synchronized size pulsing
        radius = (point.radius || config.size) * (1 + 0.4 * Math.sin(time * 2));
      } else {
        // Default structured pattern
        const orbitDistance = 150 + 20 * Math.sin(time + i * 0.5);
        x = Math.cos(angle) * orbitDistance + centerX;
        y = Math.sin(angle) * orbitDistance + centerY;

        // Individual size oscillation
        radius =
          (point.radius || config.size) * (1 + 0.2 * Math.sin(time * 3 + i));
      }

      return {
        ...point,
        x,
        y,
        radius,
      };
    });
  }

  public dispose(): void {
    this.points = [];
  }
}

/**
 * PatternRegistry - Factory for creating pattern instances based on state and variant
 */
export class PatternRegistry {
  private static patterns: { [key: string]: new () => BlobPattern } = {
    chaos: ChaosPattern,
    organizing: OrganizingPattern,
    structured: StructuredPattern,
  };

  public static getPattern(state: string): BlobPattern {
    const PatternClass = this.patterns[state] || ChaosPattern;
    return new PatternClass();
  }
}
