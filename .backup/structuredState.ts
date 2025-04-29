import * as d3 from 'd3';
import { StateBase } from './stateBase';
import { ForceConfig, Node } from './types';

/**
 * Structured State Manager
 * 
 * Philosophy: Here, the system achieves clarity—nodes settle into orbit patterns.
 * This represents full cognitive clarity, where raw data has been processed into a coherent structure.
 * 
 * Physics Model:
 * - Orbital Forces: Nodes follow continuous orbital paths around anchors
 * - Slight physics influence but never reaching equilibrium
 */
export class StructuredStateManager extends StateBase {
  private startTime: number;
  private orbitalSpeeds: Map<string, number>;
  private orbitalRadii: Map<string, number>;
  private orbitalPhases: Map<string, number>;
  
  constructor(nodes: Node[], width: number, height: number) {
    super(nodes, width, height);
    
    // Initialize orbital parameters
    this.startTime = Date.now() * 0.001;
    this.orbitalSpeeds = new Map();
    this.orbitalRadii = new Map();
    this.orbitalPhases = new Map();
    
    // Set minimal physics parameters - we'll use mostly direct animation
    this.simulation.alphaTarget(0.1)
      .alphaDecay(0.02)
      .velocityDecay(0.3);
    
    // Initialize orbital parameters for each node
    nodes.forEach(node => {
      // Each node gets a unique orbital speed and radius
      this.orbitalSpeeds.set(node.id, 0.2 + Math.random() * 0.3); // 0.2 to 0.5 rad/sec
      this.orbitalRadii.set(node.id, 5 + Math.random() * 15);     // 5 to 20px
      this.orbitalPhases.set(node.id, Math.random() * Math.PI * 2); // Random starting phase
    });
  }

  configureForces(): ForceConfig {
    return {
      // Very light directional forces toward target positions
      x: d3.forceX<Node>(d => this.getTargetPosition(d).x).strength(0.1),
      y: d3.forceY<Node>(d => this.getTargetPosition(d).y).strength(0.1),
      
      // Collision detection to prevent overlaps
      collision: d3.forceCollide<Node>()
        .radius(d => d.r * 1.05)
        .strength(0.5)
        .iterations(1),
        
      // Continuous orbital motion force
      orbital: this.createOrbitalForce(0.6)
    };
  }

  /**
   * Get the target position for a node
   * Uses pattern if available, otherwise computes positions in a grid
   */
  private getTargetPosition(node: Node): { x: number, y: number } {
    // If node already has target positions defined, use those
    if (node.targetX !== undefined && node.targetY !== undefined) {
      return { x: node.targetX, y: node.targetY };
    }
    
    // If a pattern is set, use the pattern's getTargetPosition method
    if (this.currentPattern) {
      return this.currentPattern.getTargetPosition(node, this.width, this.height);
    }
    
    // Default behavior - arrange in a grid
    const totalNodes = this.nodes.length;
    const nodeIndex = this.nodes.findIndex(n => n.id === node.id);
    
    // Calculate grid dimensions based on aspect ratio
    const aspectRatio = this.width / this.height;
    let cols = Math.ceil(Math.sqrt(totalNodes * aspectRatio));
    let rows = Math.ceil(totalNodes / cols);
    
    // Calculate position in grid
    const col = nodeIndex % cols;
    const row = Math.floor(nodeIndex / cols);
    
    // Padding from edges
    const padding = Math.max(node.r * 3, 30);
    const availableWidth = this.width - (padding * 2);
    const availableHeight = this.height - (padding * 2);
    
    // Calculate cell size
    const cellWidth = availableWidth / Math.max(cols - 1, 1);
    const cellHeight = availableHeight / Math.max(rows - 1, 1);
    
    // Calculate position (add padding to start from the edge)
    const x = padding + col * cellWidth;
    const y = padding + row * cellHeight;
    
    return { x, y };
  }
  
  /**
   * Create a force that applies continuous orbital motion around target positions
   * This ensures nodes never settle into equilibrium
   */
  private createOrbitalForce(intensity: number) {
    return (alpha: number) => {
      const currentTime = (Date.now() * 0.001) - this.startTime;
      
      this.nodes.forEach(node => {
        // Get orbital parameters for this node
        const speed = this.orbitalSpeeds.get(node.id) || 0.3;
        const radius = this.orbitalRadii.get(node.id) || 10;
        const phase = this.orbitalPhases.get(node.id) || 0;
        
        // Calculate current angle based on time
        const angle = currentTime * speed + phase;
        
        // Get the base target position
        const target = this.getTargetPosition(node);
        
        // Calculate orbital offset using sine/cosine
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;
        
        // Calculate vector from current position to orbital position
        const orbitX = target.x + offsetX;
        const orbitY = target.y + offsetY;
        
        const dx = orbitX - node.x;
        const dy = orbitY - node.y;
        
        // Apply force toward orbital position
        node.vx = (node.vx || 0) + dx * intensity * alpha;
        node.vy = (node.vy || 0) + dy * intensity * alpha;
      });
    };
  }
  
  /**
   * Override getBrownianIntensity to provide very subtle random motion
   */
  protected getBrownianIntensity(): number {
    return 0.05; // Very slight intensity for structured state
  }
}
