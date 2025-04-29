import { BlobAnimConfig, BlobPoint } from './types';

/**
 * Manages smooth transitions between animation states and configurations
 */
export class TransitionManager {
  private transitionActive: boolean = false;
  private transitionProgress: number = 0;
  private sourceConfig: Partial<BlobAnimConfig> = {};
  private targetConfig: BlobAnimConfig;
  private transitionDuration: number;
  private sourcePoints: BlobPoint[] = [];
  private targetPoints: BlobPoint[] = [];

  constructor(initialConfig: BlobAnimConfig) {
    this.targetConfig = { ...initialConfig };
    this.transitionDuration = initialConfig.transitionDuration || 1000;
  }

  /**
   * Start a transition from current to new configuration
   * @param source Current configuration
   * @param target Target configuration
   * @param duration Transition duration in ms
   */
  public startTransition(source: Partial<BlobAnimConfig>, target: BlobAnimConfig, duration?: number): void {
    // Handle interrupted transitions by starting from current interpolated state
    if (this.transitionActive && this.transitionProgress > 0 && this.transitionProgress < 1) {
      // Use current interpolated config as new source
      this.sourceConfig = { ...this.getCurrentConfig() };
    } else {
      this.sourceConfig = { ...source };
    }
    
    this.targetConfig = { ...target };
    this.transitionDuration = this.calculateDuration(source, target) || duration || target.transitionDuration || 1000;
    this.transitionProgress = 0;
    this.transitionActive = true;
  }

  /**
   * Set source and target points for interpolation
   * @param source Current points
   * @param target Target points 
   */
  public setPoints(source: BlobPoint[], target: BlobPoint[]): void {
    this.sourcePoints = source.map(p => ({ ...p }));
    this.targetPoints = target.map(p => ({ ...p }));
  }

  /**
   * Update the transition progress
   * @param deltaTimeMs Delta time in milliseconds
   * @returns true if transition is still in progress
   */
  public update(deltaTimeMs: number): boolean {
    if (!this.transitionActive) return false;

    const step = deltaTimeMs / this.transitionDuration;
    this.transitionProgress += step;

    if (this.transitionProgress >= 1) {
      this.transitionProgress = 1;
      this.transitionActive = false;
      return false;
    }

    return true;
  }

  /**
   * Get the current interpolated configuration
   * @returns Interpolated configuration
   */
  public getCurrentConfig(): BlobAnimConfig {
    if (!this.transitionActive || this.transitionProgress >= 1) {
      return this.targetConfig;
    }

    // Use easing for smoother transitions
    const t = this.easeInOutCubic(this.transitionProgress);
    
    // Create interpolated config
    const result: BlobAnimConfig = { ...this.targetConfig };
    
    // Only interpolate numeric properties
    const numericProps: (keyof BlobAnimConfig)[] = [
      'count', 'size', 'opacity', 'speed', 'chaosAmount', 'sizeFactor'
    ];

    numericProps.forEach(prop => {
      const sourceVal = this.sourceConfig[prop];
      const targetVal = this.targetConfig[prop];
      
      if (sourceVal !== undefined && targetVal !== undefined && typeof sourceVal === 'number' && typeof targetVal === 'number') {
        result[prop] = sourceVal + (targetVal - sourceVal) * t;
      }
    });

    return result;
  }

  /**
   * Get interpolated points based on transition progress
   * @returns Interpolated points array
   */
  public getInterpolatedPoints(): BlobPoint[] {
    if (!this.transitionActive || this.transitionProgress >= 1 || this.sourcePoints.length === 0) {
      return this.targetPoints;
    }

    // Use easing function for smoother transitions
    const t = this.easeInOutCubic(this.transitionProgress);
    
    // Calculate the needed points count
    const sourceCount = this.sourcePoints.length;
    const targetCount = this.targetPoints.length;
    const count = Math.max(sourceCount, targetCount);
    
    const result: BlobPoint[] = [];
    
    for (let i = 0; i < count; i++) {
      // Use modulo to handle different array lengths
      const sourcePoint = this.sourcePoints[i % sourceCount];
      const targetPoint = this.targetPoints[i % targetCount];
      
      const interpolatedPoint: BlobPoint = {
        x: sourcePoint.x + (targetPoint.x - sourcePoint.x) * t,
        y: sourcePoint.y + (targetPoint.y - sourcePoint.y) * t
      };
      
      // Interpolate optional properties if they exist
      if (sourcePoint.radius !== undefined && targetPoint.radius !== undefined) {
        interpolatedPoint.radius = sourcePoint.radius + (targetPoint.radius - sourcePoint.radius) * t;
      }
      
      if (sourcePoint.opacity !== undefined && targetPoint.opacity !== undefined) {
        interpolatedPoint.opacity = sourcePoint.opacity + (targetPoint.opacity - sourcePoint.opacity) * t;
      }
      
      result.push(interpolatedPoint);
    }
    
    return result;
  }

  /**
   * Check if a transition is currently active
   * @returns true if a transition is in progress
   */
  public isTransitioning(): boolean {
    return this.transitionActive;
  }

  /**
   * Get current transition progress (0-1)
   * @returns Transition progress value
   */
  public getProgress(): number {
    return this.transitionProgress;
  }

  /**
   * Calculate appropriate transition duration based on the difference between configs
   * @param from Source configuration
   * @param to Target configuration
   * @returns Calculated transition duration in ms
   */
  private calculateDuration(from: Partial<BlobAnimConfig>, to: BlobAnimConfig): number {
    // Adaptive duration based on how different the configs are
    const countDiff = Math.abs((from.count || 0) - (to.count || 0)) / 
                      Math.max(from.count || 1, to.count || 1);
                      
    const sizeDiff = Math.abs((from.size || 0) - (to.size || 0)) / 
                     Math.max(from.size || 1, to.size || 1);
                     
    const amplitudeDiff = Math.abs((from.amplitude || 0) - (to.amplitude || 0)) / 
                          Math.max(from.amplitude || 1, to.amplitude || 1);
    
    // Different patterns need more time to transition smoothly
    const patternChange = (from.state !== to.state || from.variant !== to.variant) ? 1 : 0;
    
    // Convert the difference factor to milliseconds (500ms to 2500ms)
    const baseDuration = 500;
    const maxAdditionalDuration = 2000;
    const diffFactor = Math.min(countDiff + sizeDiff + amplitudeDiff, 1) + patternChange;
    
    return baseDuration + diffFactor * maxAdditionalDuration;
  }

  /**
   * Cubic easing function for smoother transitions
   * @param t Progress value (0-1)
   * @returns Eased value
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}
