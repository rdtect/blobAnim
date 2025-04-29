import * as d3 from 'd3';
import { StateBase } from './stateBase';
import { ForceConfig, Node } from './types';

/**
 * Organizing State Manager
 * 
 * Philosophy: This state signifies that raw data is beginning to coalesce into 
 * recognizable patterns—a cognitive shift from chaos toward meaningful structure.
 * 
 * Physics Model:
 * - Swirling/Orbital Motion: Nodes follow loose orbital paths with swirling behavior
 * - Minimal physics influence - animation drives the movement primarily
 */
export class OrganizingStateManager extends StateBase {
  // Time tracking for continuous motion
  private startTime: number;
  
  // Motion parameters for continuous animation
  private swirls: Map<string, {
    centerX: number;
    centerY: number;
    radius: number;
    speed: number;
    phase: number;
    secondaryRadius: number;
    secondarySpeed: number;
  }>;
  
  constructor(nodes: Node[], width: number, height: number) {
    super(nodes, width, height);
    
    // Set minimal physics parameters - we'll use mostly animation
    this.simulation.alphaTarget(0.15)
      .alphaDecay(0.02)
      .velocityDecay(0.2);
    
    // Initialize time for continuous animation
    this.startTime = Date.now() * 0.001;
    
    // Create swirl parameters for each node
    this.swirls = new Map();
    
    // Determine cluster centers for organizing into groups
    const clusterCount = Math.min(5, Math.ceil(nodes.length / 7)); // 1 cluster per ~7 nodes, max 5
    const clusters: Array<{x: number, y: number}> = [];
    
    // Generate cluster centers
    for (let i = 0; i < clusterCount; i++) {
      // Place clusters in a circular arrangement around center
      const angle = (i / clusterCount) * Math.PI * 2;
      const clusterRadius = Math.min(width, height) * 0.3; // 30% of container size
      
      clusters.push({
        x: width / 2 + Math.cos(angle) * clusterRadius,
        y: height / 2 + Math.sin(angle) * clusterRadius
      });
    }
    
    // Assign each node to a cluster and generate swirl parameters
    nodes.forEach((node, i) => {
      // Assign to a cluster - nodes with same group go to same cluster if possible
      let clusterIndex;
      if (node.group) {
        // Hash the group name to a consistent cluster index
        const hash = node.group.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        clusterIndex = hash % clusterCount;
      } else {
        // Distribute evenly if no group
        clusterIndex = i % clusterCount;
      }
      
      const cluster = clusters[clusterIndex];
      
      // Create organic swirling motion parameters
      this.swirls.set(node.id, {
        // Base orbit center is the cluster center
        centerX: cluster.x,
        centerY: cluster.y,
        // Primary orbit
        radius: 20 + Math.random() * 40, // 20-60px radius
        speed: 0.1 + Math.random() * 0.3, // 0.1-0.4 rad/sec
        phase: Math.random() * Math.PI * 2, // Random starting phase
        // Secondary swirl (creates more complex paths)
        secondaryRadius: 5 + Math.random() * 15, // 5-20px secondary radius
        secondarySpeed: 0.5 + Math.random() * 1.0 // 0.5-1.5 rad/sec (faster)
      });
    });
  }

  configureForces(): ForceConfig {
    return {
      // Very light repulsion - just enough to prevent perfect overlap
      charge: d3.forceManyBody<Node>()
        .strength(-5)
        .distanceMax(50)
        .theta(0.9),
      
      // Minimal directional forces - animation does most of the work
      x: d3.forceX<Node>().strength(0.02),
      y: d3.forceY<Node>().strength(0.02),
      
      // Light collision detection
      collision: d3.forceCollide<Node>()
        .radius(d => d.r * 1.1)
        .strength(0.3)
        .iterations(1),
      
      // Swirling motion force - the main driver of animation
      swirl: this.createSwirlForce(0.8)
    };
  }

  /**
   * Create a force that applies continuous swirling motion
   * This combines orbital movement with secondary oscillations
   */
  private createSwirlForce(intensity: number) {
    return (alpha: number) => {
      const currentTime = (Date.now() * 0.001) - this.startTime;
      
      this.nodes.forEach(node => {
        const swirl = this.swirls.get(node.id);
        if (!swirl) return;
        
        // Calculate primary orbital angle
        const primaryAngle = currentTime * swirl.speed + swirl.phase;
        
        // Calculate secondary swirl angle (faster)
        const secondaryAngle = currentTime * swirl.secondarySpeed;
        
        // Calculate combined position
        // Primary orbit + secondary swirl
        const targetX = swirl.centerX + 
          Math.cos(primaryAngle) * swirl.radius + 
          Math.cos(secondaryAngle) * swirl.secondaryRadius;
          
        const targetY = swirl.centerY + 
          Math.sin(primaryAngle) * swirl.radius + 
          Math.sin(secondaryAngle) * swirl.secondaryRadius;
        
        // Calculate vector to target
        const dx = targetX - node.x;
        const dy = targetY - node.y;
        
        // Apply force toward orbital position - stronger than in structured state
        // This creates a more fluid, organic swirling motion
        node.vx = (node.vx || 0) + dx * intensity * alpha;
        node.vy = (node.vy || 0) + dy * intensity * alpha;
      });
    };
  }
  
  /**
   * Override getBrownianIntensity to provide moderate random motion
   */
  protected getBrownianIntensity(): number {
    return 0.15; // Moderate intensity for organizing state
  }
}
