import { BlobAnimConfig, BlobAnimState, BlobPoint } from './types';
import { BlobRenderer } from './BlobRenderer';
import { BlobPattern } from '../patterns/BlobPattern';
import { EventEmitter } from './EventEmitter';
import { TransitionManager } from './TransitionManager';

export class BlobAnimEngine {
  private config: BlobAnimConfig;
  private state: BlobAnimState;
  private renderer: BlobRenderer;
  private pattern: BlobPattern;
  private animationFrameId?: number;
  private events: EventEmitter;
  private transition: TransitionManager;
  private lastPoints: BlobPoint[] = [];

  constructor(svgRoot: SVGSVGElement, config: BlobAnimConfig, pattern: BlobPattern) {
    this.events = new EventEmitter();
    this.config = { ...config };
    this.state = { data: [], time: 0, fps: 60 };
    this.renderer = new BlobRenderer(svgRoot, this.events);
    this.pattern = pattern;
    this.transition = new TransitionManager(this.config);
    
    // Initialize pattern with config
    this.pattern.initialize(this.config);
    
    // First update to initialize animation
    this.update();
  }

  /**
   * Start the animation loop
   */
  public start(): void {
    if (this.animationFrameId) {
      this.stop();
    }
    
    // Reset paused state
    this.config.paused = false;
    
    // Notify start event
    this.events.emit('start');
    
    // Start animation loop
    this.animate(performance.now());
  }

  /**
   * Stop the animation loop
   */
  public stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
      
      // Notify stop event
      this.events.emit('stop');
    }
  }

  /**
   * Pause the animation (keeps the animation loop running but freezes updates)
   */
  public pause(): void {
    if (!this.config.paused) {
      this.config.paused = true;
      this.events.emit('pause');
    }
  }

  /**
   * Resume the animation from paused state
   */
  public resume(): void {
    if (this.config.paused) {
      this.config.paused = false;
      this.events.emit('resume');
      
      // Reset time tracking to avoid jumps
      this.state.previousTime = performance.now();
    }
  }

  /**
   * Update animation configuration
   * @param newConfig New configuration to apply
   */
  public updateConfig(newConfig: Partial<BlobAnimConfig>): void {
    // Save previous config for events and transitions
    const prevConfig = { ...this.config };
    
    // Apply new config
    const updatedConfig = { ...this.config, ...newConfig };
    this.config = updatedConfig;
    
    // Check if we need to reinitialize the pattern (if count changes)
    if (newConfig.count !== undefined && newConfig.count !== prevConfig.count) {
      this.pattern.initialize(this.config);
    }
    
    // Start transition if supported properties changed
    if (this.shouldTransition(prevConfig, updatedConfig)) {
      // Store the current points for transition
      this.transition.startTransition(prevConfig, updatedConfig);
    }
    
    // Update immediately
    this.update();
    
    // Emit change event
    this.events.emit('configChange', {
      previous: prevConfig,
      current: this.config
    });
  }

  /**
   * Replace the current pattern with a new one
   * @param pattern New pattern to use
   */
  public setPattern(pattern: BlobPattern): void {
    const oldPattern = this.pattern;
    const oldState = oldPattern.constructor.name;
    const newState = pattern.constructor.name;
    
    // Clean up old pattern
    oldPattern.dispose();
    
    // Switch to new pattern
    this.pattern = pattern;
    this.pattern.initialize(this.config);
    
    // Reset transition manager
    this.transition = new TransitionManager(this.config);
    
    // Emit pattern change event
    this.events.emit('patternChange', {
      previous: oldState,
      current: newState
    });
    
    // Update immediately
    this.update();
  }

  /**
   * Subscribe to animation events
   * @param event Event type to listen for
   * @param callback Function to call when event occurs
   * @returns Function to unsubscribe
   */
  public on(event: string, callback: (data?: any) => void): () => void {
    return this.events.on(event as any, callback);
  }

  /**
   * Get performance metrics
   * @returns Object with FPS
   */
  public getPerformanceMetrics(): { fps: number } {
    return { fps: this.state.fps || 60 };
  }

  /**
   * Animation frame callback
   * @param timestamp Current time
   */
  private animate = (timestamp: number): void => {
    // Calculate actual time passed since last frame
    const now = timestamp || performance.now();
    let deltaTime = 0.016; // Default to ~60fps
    
    if (this.state.previousTime) {
      deltaTime = (now - this.state.previousTime) / 1000; // Convert to seconds
      
      // Limit maximum delta time to prevent huge jumps on low frame rates or tab switches
      deltaTime = Math.min(deltaTime, 0.1); // Cap at 100ms (10fps)
    }
    
    this.state.previousTime = now;
    
    // Don't advance time if paused
    if (!this.config.paused) {
      this.state.time += deltaTime * (this.config.speed || 1);
      this.state.deltaTime = deltaTime;
      
      // Update animation state
      this.update();
    }
    
    // Update FPS tracking
    this.updateFPS(deltaTime);
    
    // Continue animation loop
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  /**
   * Update animation state and render
   */
  private update(): void {
    // Update pattern state
    this.pattern.update(this.config, this.state);
    
    // Generate points
    const points = this.pattern.generatePoints(this.config, this.state);
    
    // Store for transitions
    this.lastPoints = points;
    
    // Render points
    this.renderer.render(points, this.config);
  }

  /**
   * Update FPS calculation
   * @param deltaTime Time since last frame in seconds
   */
  private updateFPS(deltaTime: number): void {
    // Only update if we have valid delta
    if (deltaTime > 0) {
      const instantFPS = 1 / deltaTime;
      
      // Smooth FPS over time using exponential moving average
      const alpha = 0.1; // Smoothing factor
      this.state.fps = this.state.fps 
        ? this.state.fps * (1 - alpha) + instantFPS * alpha
        : instantFPS;
    }
  }

  /**
   * Check if configuration changes warrant a transition
   * @param prevConfig Previous configuration
   * @param newConfig New configuration
   * @returns True if transition is needed
   */
  private shouldTransition(prevConfig: BlobAnimConfig, newConfig: BlobAnimConfig): boolean {
    // List of properties that should trigger a transition
    const transitionProps: (keyof BlobAnimConfig)[] = [
      'count', 'size', 'variant', 'state', 'chaosAmount', 'sizeFactor'
    ];
    
    // Check if any transition property changed
    return transitionProps.some(prop => prevConfig[prop] !== newConfig[prop]);
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.stop();
    this.pattern.dispose();
    this.renderer.dispose();
    this.events.removeAllListeners();
  }
}
