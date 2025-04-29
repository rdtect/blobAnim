import * as d3 from 'd3';
import { StateBase } from './stateBase';
import { ForceConfig, Node } from './types';

/**
 * Chaos State Manager
 * 
 * Philosophy: This represents raw, unprocessed data or thoughts.
 * The motion is entirely unpredictable and fluid, like subatomic particles.
 * 
 * Physics Model:
 * - Continuous Random Motion: Nodes move in unpredictable paths
 * - No tendency toward equilibrium - constantly in flux
 * - Minimal physics influence - animation dominates motion
 */
export class ChaosStateManager extends StateBase {
  private startTime: number;
  private noiseGenerators: Map<string, {
    xFastGen: () => number;
    xSlowGen: () => number;
    yFastGen: () => number;
    ySlowGen: () => number;
    pulseGen: () => number;
  }>;
  
  constructor(nodes: Node[], width: number, height: number) {
    super(nodes, width, height);
    
    // Initialize time
    this.startTime = Date.now() * 0.001;
    
    // Set physics parameters - very minimal influence
    this.simulation.alphaTarget(0.3)
      .alphaDecay(0.01)
      .velocityDecay(0.1);
    
    // Create separate noise generators for each node
    this.noiseGenerators = new Map();
    
    // For each node, create unique D3 random generators
    nodes.forEach(node => {
      this.noiseGenerators.set(node.id, {
        // Fast changing x component
        xFastGen: d3.randomNormal(0, 0.5),
        // Slow changing x component
        xSlowGen: d3.randomBates(3), // More centered distribution
        // Fast changing y component
        yFastGen: d3.randomNormal(0, 0.5),
        // Slow changing y component
        ySlowGen: d3.randomBates(3),
        // Pulsing/size variation
        pulseGen: d3.randomExponential(1),
      });
    });
  }

  configureForces(): ForceConfig {
    return {
      // Very light repulsion just to prevent perfect overlaps
      charge: d3.forceManyBody<Node>().strength(-3).distanceMax(50),
      
      // Extremely weak centering force to keep nodes from flying off screen
      x: d3.forceX<Node>(this.width / 2).strength(0.01),
      y: d3.forceY<Node>(this.height / 2).strength(0.01),
      
      // Minimal collision detection
      collision: d3.forceCollide<Node>().radius(d => d.r).strength(0.2).iterations(1),
      
      // Chaotic motion force - the main driver of animation
      chaos: this.createChaoticMotionForce(1.0),
      
      // Edge force to keep nodes within bounds
      edges: this.createChaoticEdgeForce()
    };
  }
  
  /**
   * Create a chaotic edge force that keeps nodes within the container
   * but with unpredictable bouncing behavior
   */
  private createChaoticEdgeForce() {
    const edgePadding = 5;
    return (alpha: number) => {
      this.nodes.forEach(node => {
        // Get the node's random generators
        const nodeGen = this.noiseGenerators.get(node.id);
        if (!nodeGen) return;
        
        // Calculate bounce strength - varies per node and over time
        const bounceStrength = 0.3 + Math.abs(nodeGen.xSlowGen()) * 0.7; // 0.3-1.0
        
        // Check boundaries with padding
        if (node.x < edgePadding) {
          // Left edge - bounce right with random strength
          node.vx = (node.vx || 0) + bounceStrength * 1 * alpha;
        } else if (node.x > this.width - edgePadding) {
          // Right edge - bounce left with random strength
          node.vx = (node.vx || 0) - bounceStrength * 1 * alpha;
        }
        
        if (node.y < edgePadding) {
          // Top edge - bounce down with random strength
          node.vy = (node.vy || 0) + bounceStrength * 1 * alpha;
        } else if (node.y > this.height - edgePadding) {
          // Bottom edge - bounce up with random strength
          node.vy = (node.vy || 0) - bounceStrength * 1 * alpha;
        }
      });
    };
  }
  
  /**
   * Create a force that applies continuous chaotic motion
   * This is the primary driver of the chaotic state's animation
   */
  private createChaoticMotionForce(intensity: number) {
    return (alpha: number) => {
      const currentTime = (Date.now() * 0.001) - this.startTime;
      
      this.nodes.forEach(node => {
        // Get the node's random generators
        const nodeGen = this.noiseGenerators.get(node.id);
        if (!nodeGen) return;
        
        // Create unique variation for this node based on its id
        const nodeId = parseInt(node.id.replace(/\D/g, '') || '0');
        const nodeOffset = nodeId * 0.1;
        
        // Calculate time-variant factors
        const timeFactor1 = Math.sin(currentTime * 0.4 + nodeOffset) * 0.5 + 0.5; // 0-1
        const timeFactor2 = Math.cos(currentTime * 0.6 + nodeOffset) * 0.5 + 0.5; // 0-1
        
        // Combine multiple random components for x with time variation
        const vx = (
          nodeGen.xFastGen() * 2 * timeFactor1 + // Fast component
          (nodeGen.xSlowGen() - 0.5) * 4 * timeFactor2 // Slow component
        ) * intensity * alpha;
        
        // Combine multiple random components for y with time variation
        const vy = (
          nodeGen.yFastGen() * 2 * timeFactor2 + // Fast component
          (nodeGen.ySlowGen() - 0.5) * 4 * timeFactor1 // Slow component
        ) * intensity * alpha;
        
        // Apply the chaotic motion forces
        node.vx = (node.vx || 0) + vx;
        node.vy = (node.vy || 0) + vy;
      });
    };
  }
  
  /**
   * Every few frames, apply a stronger random impulse to some nodes
   * This creates occasional "bursts" of activity
   */
  jiggleNodes(intensity: number = 1) {
    // Only jiggle some nodes randomly
    const jiggleCount = Math.ceil(this.nodes.length * 0.3); // 30% of nodes
    const jiggleCandidates = [...this.nodes].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < jiggleCount; i++) {
      const node = jiggleCandidates[i];
      if (!node) continue;
      
      // Get the node's random generator
      const nodeGen = this.noiseGenerators.get(node.id);
      if (!nodeGen) continue;
      
      // Apply a strong random impulse
      node.vx = (node.vx || 0) + (nodeGen.xFastGen() * 10 * intensity);
      node.vy = (node.vy || 0) + (nodeGen.yFastGen() * 10 * intensity);
    }
  }
  
  /**
   * Override getBrownianIntensity to provide high random motion
   */
  protected getBrownianIntensity(): number {
    return 0.5; // High intensity for chaos state
  }
}
