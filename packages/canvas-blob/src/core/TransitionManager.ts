import type { BlobAnimConfig, BlobPoint, TransitionData } from "./types";

// For performance.now()
declare global {
  interface Performance {
    now(): number;
  }
  var performance: Performance;
}

/**
 * Manages transitions between animation states
 */
export class TransitionManager {
  private transition: TransitionData | null = null;

  constructor(initialConfig: BlobAnimConfig) {
    // Initialize with default state
    this.transition = null;
  }

  /**
   * Check if a transition is currently active
   * @returns True if a transition is in progress
   */
  public isActive(): boolean {
    if (!this.transition) return false;
    return this.transition.active && this.transition.progress < 1;
  }

  /**
   * Start a new transition between configurations
   * @param startConfig Starting configuration
   * @param endConfig Ending configuration
   */
  public startTransition(
    startConfig: BlobAnimConfig,
    endConfig: BlobAnimConfig
  ): void {
    // Create a new transition
    this.transition = {
      startConfig,
      endConfig,
      startTime: performance.now(),
      // Default to 1 second if not specified in config
      duration: endConfig.transitionDuration || 1000,
      progress: 0,
      active: true,
    };
  }

  /**
   * Get interpolated points for the current transition state
   * @param currentTime Current animation time
   * @param startPoints Original points
   * @param endPoints Target points
   * @returns Interpolated points, or null if no active transition
   */
  public getTransitionPoints(
    currentTime: number,
    startPoints: BlobPoint[],
    endPoints: BlobPoint[]
  ): BlobPoint[] | null {
    if (!this.transition || !this.transition.active) {
      return null;
    }

    // Calculate progress (0 to 1)
    const elapsed = performance.now() - this.transition.startTime;
    this.transition.progress = Math.min(1, elapsed / this.transition.duration);

    // If transition is complete, deactivate it
    if (this.transition.progress >= 1) {
      this.transition.active = false;
      return null;
    }

    // Get the smaller of the two point arrays
    const count = Math.min(startPoints.length, endPoints.length);

    // Create interpolated points
    const transitionPoints: BlobPoint[] = [];
    for (let i = 0; i < count; i++) {
      const startPoint = startPoints[i];
      const endPoint = endPoints[i];

      if (!startPoint || !endPoint) continue;

      // Interpolate position
      const x = this.interpolate(
        startPoint.x,
        endPoint.x,
        this.transition.progress
      );
      const y = this.interpolate(
        startPoint.y,
        endPoint.y,
        this.transition.progress
      );

      // Interpolate size
      const radius = this.interpolate(
        startPoint.radius || this.transition.startConfig.size || 20,
        endPoint.radius || this.transition.endConfig.size || 20,
        this.transition.progress
      );

      // Interpolate opacity
      const opacity = this.interpolate(
        startPoint.opacity !== undefined ? startPoint.opacity : 1,
        endPoint.opacity !== undefined ? endPoint.opacity : 1,
        this.transition.progress
      );

      // Interpolate other properties if needed
      transitionPoints.push({
        x,
        y,
        radius,
        opacity,
        color: endPoint.color || startPoint.color,
      });
    }

    return transitionPoints;
  }

  /**
   * Helper function to interpolate between two values
   * @param start Starting value
   * @param end Ending value
   * @param progress Progress from 0 to 1
   * @returns Interpolated value
   */
  private interpolate(start: number, end: number, progress: number): number {
    // Simple linear interpolation
    return start + (end - start) * progress;
  }

  /**
   * Get the current configuration (interpolated if in transition)
   * @returns Current configuration
   */
  public getCurrentConfig(): BlobAnimConfig {
    if (!this.transition || !this.transition.active) {
      return (
        this.transition?.endConfig || {
          count: 5,
          size: 20,
          colors: ["#3b82f6"],
          state: "chaos",
          variant: "default",
          speed: 1,
          gooey: false,
          scaleEffects: false,
          glass: false,
          gradient: false,
          debug: false,
        }
      );
    }

    // TODO: Implement config interpolation if needed
    return this.transition.progress >= 0.5
      ? this.transition.endConfig
      : this.transition.startConfig;
  }
}
