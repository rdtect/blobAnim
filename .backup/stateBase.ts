import * as d3 from 'd3';
import { Node, ForceConfig } from './types';
import type { Pattern } from './types';

/**
 * StateBase - Abstract base class for cognitive state managers
 * 
 * Provides common functionality for:
 * - D3 force simulation management
 * - Force application
 * - Pattern support
 * - Performance monitoring
 */
export abstract class StateBase {
  protected nodes: Node[];
  protected width: number;
  protected height: number;
  protected simulation: d3.Simulation<Node, undefined>;
  protected currentPattern: Pattern | null = null;
  protected lastLoopTime: number = 0;
  protected frameCount: number = 0;
  protected fpsAverage: number = 60;
  protected velocityHistory: Map<string, {vx: number, vy: number, age: number}[]> = new Map();
  protected lastTick: number = 0;
  
  constructor(nodes: Node[], width: number, height: number) {
    this.nodes = nodes;
    this.width = width;
    this.height = height;
    
    // Initialize the D3 force simulation with common settings
    this.simulation = d3.forceSimulation<Node>(this.nodes)
      .alphaTarget(0.3)  // Keep simulation "hot" - never stop completely
      .alphaDecay(0.02)  // Slow decay for sustained animation
      .velocityDecay(0.15); // Lower values allow more momentum
    
    // Apply the forces specific to this state
    this.applyForces();
    
    // Set up velocity history tracking for each node
    this.nodes.forEach(node => {
      this.velocityHistory.set(node.id, []);
    });
    
    // Track FPS for performance monitoring
    this.lastLoopTime = performance.now();
    
    // Add a velocity feedback loop to maintain continuous motion
    // Using D3's built-in tick event for synchronization with the physics engine
    this.simulation.on('tick', () => this.velocityFeedbackLoop());
  }
  
  /**
   * Apply forces to the simulation based on the concrete class's configuration
   */
  protected applyForces(): void {
    // Clear existing forces first - properly typed for TypeScript
    const sim = this.simulation as any;
    if (sim._forces) {
      const forceNames = Object.keys(sim._forces);
      forceNames.forEach(name => {
        this.simulation.force(name, null);
      });
    }
    
    // Get force configuration from subclass
    const forceConfig = this.configureForces();
    
    // Apply all configured forces
    for (const [name, force] of Object.entries(forceConfig)) {
      this.simulation.force(name, force);
    }
    
    // Always add a light Brownian motion force for natural movement
    // Subclasses can override getBrownianIntensity() to control the intensity
    this.simulation.force('brownian', this.createBrownianForce(this.getBrownianIntensity()));
    
    // Automatically add edge force if not specified by subclass
    if (!forceConfig.edges) {
      this.simulation.force('edges', this.createEdgeForce());
    }
  }
  
  /**
   * Implement a velocity feedback loop to maintain continuous motion
   * This analyzes node velocities and applies counteracting or sustaining forces
   * to prevent the system from reaching equilibrium
   */
  protected velocityFeedbackLoop(): void {
    const now = performance.now();
    // Only run feedback logic every few frames for performance
    if (now - this.lastTick < 50) return;
    this.lastTick = now;
    
    const systemEnergy = this.getSystemEnergy();
    const alpha = this.simulation.alpha();
    
    // If system energy is dropping too low, reinvigorate it
    if (systemEnergy < 0.2 && alpha < 0.4) {
      // Apply a small simulation "reheat"
      this.simulation.alpha(Math.min(alpha + 0.1, 0.5));
      
      // Apply velocity nudges to nodes that are slowing down
      this.nodes.forEach(node => {
        const history = this.velocityHistory.get(node.id) || [];
        const velocityMagnitude = Math.sqrt((node.vx || 0)**2 + (node.vy || 0)**2);
        
        // If node is slowing down, give it a boost
        if (velocityMagnitude < 0.2) {
          // Get the node's previous direction if available
          let boostX = Math.random() * 2 - 1;
          let boostY = Math.random() * 2 - 1;
          
          // Use previous velocity direction if available
          if (history.length > 0) {
            const prevVelocity = history[history.length - 1];
            const prevMagnitude = Math.sqrt(prevVelocity.vx**2 + prevVelocity.vy**2);
            
            if (prevMagnitude > 0.01) {
              // Boost in the general direction the node was already moving
              boostX = prevVelocity.vx / prevMagnitude;
              boostY = prevVelocity.vy / prevMagnitude;
            }
          }
          
          // Apply the boost (stronger for nodes that are almost stationary)
          const boostFactor = 0.5 + (0.2 / (velocityMagnitude + 0.1));
          node.vx = (node.vx || 0) + boostX * boostFactor;
          node.vy = (node.vy || 0) + boostY * boostFactor;
        }
      });
    }
    
    // Update velocity history for each node
    this.nodes.forEach(node => {
      const history = this.velocityHistory.get(node.id) || [];
      
      // Add current velocity to history
      history.push({
        vx: node.vx || 0,
        vy: node.vy || 0,
        age: now
      });
      
      // Limit history size and remove old entries
      while (history.length > 10 || (history.length > 0 && now - history[0].age > 2000)) {
        history.shift();
      }
      
      this.velocityHistory.set(node.id, history);
    });
    
    // Track FPS for performance tuning
    this.frameCount++;
    if (now - this.lastLoopTime > 1000) { // Every second
      this.fpsAverage = this.frameCount / ((now - this.lastLoopTime) / 1000);
      this.frameCount = 0;
      this.lastLoopTime = now;
      
      // If FPS drops too low, reduce Brownian intensity
      if (this.fpsAverage < 30 && this.nodes.length > 50) {
        const brownian = this.simulation.force('brownian');
        if (typeof brownian === 'function') {
          // Reduce intensity
          this.simulation.force('brownian', this.createBrownianForce(this.getBrownianIntensity() * 0.8));
        }
      }
    }
  }
  
  /**
   * Calculate the current energy level of the system based on node velocities
   * Used to determine when to apply velocity feedback
   */
  getSystemEnergy(): number {
    let totalEnergy = 0;
    
    this.nodes.forEach(node => {
      const vx = node.vx || 0;
      const vy = node.vy || 0;
      // Kinetic energy is proportional to velocity squared
      totalEnergy += (vx * vx + vy * vy);
    });
    
    // Normalize by node count to get average energy per node
    return totalEnergy / (this.nodes.length || 1);
  }
  
  /**
   * Configure forces for the simulation
   * To be implemented by concrete subclasses
   */
  abstract configureForces(): ForceConfig;
  
  /**
   * Create a force that repels nodes from the container edges
   */
  protected createEdgeForce() {
    const padding = 20;
    const strength = 0.1;
    
    return (alpha: number) => {
      this.nodes.forEach(node => {
        // Check if node is near any edge and apply a force to repel it
        
        // Left edge
        if (node.x < padding) {
          node.vx = (node.vx || 0) + (padding - node.x) * strength * alpha;
        }
        // Right edge
        else if (node.x > this.width - padding) {
          node.vx = (node.vx || 0) - (node.x - (this.width - padding)) * strength * alpha;
        }
        
        // Top edge
        if (node.y < padding) {
          node.vy = (node.vy || 0) + (padding - node.y) * strength * alpha;
        }
        // Bottom edge
        else if (node.y > this.height - padding) {
          node.vy = (node.vy || 0) - (node.y - (this.height - padding)) * strength * alpha;
        }
      });
    };
  }
  
  /**
   * Create a force that applies Brownian motion to nodes
   * Uses d3.randomNormal for more natural random movement
   */
  protected createBrownianForce(intensity: number) {
    // Create a normal distribution random generator for more natural movement
    const randomNormal = d3.randomNormal(0, 1);
    
    return (alpha: number) => {
      this.nodes.forEach(node => {
        // Apply random motion scaled by alpha and intensity
        node.vx = (node.vx || 0) + randomNormal() * intensity * alpha;
        node.vy = (node.vy || 0) + randomNormal() * intensity * alpha;
      });
    };
  }
  
  /**
   * Get the Brownian motion intensity for this state
   * Default implementation provides a medium intensity
   * Override in subclasses for state-specific values
   */
  protected getBrownianIntensity(): number {
    return 0.4; // Medium intensity by default
  }
  
  /**
   * Set the current pattern for this state
   */
  setPattern(pattern: Pattern): void {
    this.currentPattern = pattern;
    // Reheat the simulation when pattern changes
    this.simulation.alpha(0.8);
    // Force nodes to get new positions based on the pattern
    this.simulation.restart();
  }
  
  /**
   * Public getter for the D3 simulation instance
   */
  public getSimulation(): d3.Simulation<Node, undefined> {
    return this.simulation;
  }
  
  /**
   * Get the estimated FPS
   */
  getFPS(): number {
    return this.fpsAverage;
  }
  
  /**
   * Jiggle the nodes to prevent stabilization
   * Can be called externally or internally
   */
  jiggleNodes(intensity: number = 0.5): void {
    this.nodes.forEach(node => {
      node.vx = (node.vx || 0) + (Math.random() - 0.5) * intensity;
      node.vy = (node.vy || 0) + (Math.random() - 0.5) * intensity;
    });
    
    // Slightly reheat the simulation
    if (this.simulation.alpha() < 0.3) {
      this.simulation.alpha(0.3);
    }
  }
}
