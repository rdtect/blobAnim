/**
 * Blob Animation Class
 * 
 * Core implementation of the blob animation system.
 * Uses D3 for SVG creation and manipulation.
 */

import * as d3 from 'd3';
import { createSvg, createGroup, createDefs, createBlobs, updateBlobPositions } from './utils/svg.js';
import { createGooeyFilter, updateGooeyFilter, applyGooeyFilter } from './utils/gooey.js';
import { getPattern } from './patterns/index.js';
import { getConfigManager } from './config.js';

/**
 * BlobAnimation class
 * Main class for creating and managing blob animations
 */
export class BlobAnimation {
  /**
   * Create a new blob animation
   * @param {HTMLElement} container - Container element
   * @param {Object} config - Animation configuration
   */
  constructor(container, config = {}) {
    // Store container
    this.container = container;
    
    // Get configuration manager
    this.configManager = getConfigManager(config);
    this.config = this.configManager.getConfig();
    
    // Initialize properties
    this.width = container.clientWidth || 400;
    this.height = container.clientHeight || 400;
    this.nodes = [];
    this.animationFrame = null;
    this.lastFrameTime = 0;
    this.elapsedTime = 0;
    
    // Create SVG elements
    this.svg = createSvg(container, this.config);
    this.defs = createDefs(this.svg);
    this.group = createGroup(this.svg, 'blob-group');
    
    // Add gooey filter
    if (this.config.gooeyIntensity !== 'none') {
      this.defs.html(createGooeyFilter(this.config.gooeyIntensity));
      applyGooeyFilter(this.group);
    }
    
    // Create nodes
    this.createNodes();
    
    // Create blobs
    this.blobs = createBlobs(this.group, this.nodes, this.config);
    
    // Subscribe to configuration updates
    this.unsubscribe = this.configManager.subscribe(this.handleConfigUpdate.bind(this));
    
    // Add resize handler
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  /**
   * Create nodes for the animation
   */
  createNodes() {
    const { count } = this.config;
    
    // Create nodes
    this.nodes = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: this.width / 2,
      y: this.height / 2,
      scale: 1,
      opacity: this.config.opacity
    }));
  }
  
  /**
   * Start the animation
   */
  start() {
    if (this.animationFrame) return;
    
    this.lastFrameTime = performance.now();
    this.animationFrame = requestAnimationFrame(this.animate.bind(this));
  }
  
  /**
   * Stop the animation
   */
  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
  
  /**
   * Animation loop
   * @param {number} timestamp - Current timestamp
   */
  animate(timestamp) {
    // Calculate time delta
    const delta = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;
    
    // Update elapsed time
    this.elapsedTime += delta / 1000;
    
    // Update node positions
    this.updateNodes();
    
    // Update blob positions
    updateBlobPositions(this.blobs, true, 100);
    
    // Request next frame
    this.animationFrame = requestAnimationFrame(this.animate.bind(this));
  }
  
  /**
   * Update node positions based on current pattern
   */
  updateNodes() {
    const { animationState, variant, intensity } = this.config;
    
    // Get pattern function
    const patternFn = getPattern(animationState, variant);
    
    // Update each node
    this.nodes.forEach((node, i) => {
      // Calculate target position
      const target = patternFn(i, this.nodes.length, this.elapsedTime, intensity, {
        width: this.width,
        height: this.height
      });
      
      // Apply lerp for smooth transitions
      const lerpFactor = this.config.lerpFactor;
      node.x = node.x + (target.x - node.x) * lerpFactor;
      node.y = node.y + (target.y - node.y) * lerpFactor;
      node.scale = node.scale + (target.scale - node.scale) * lerpFactor;
      node.opacity = node.opacity + (target.opacity - node.opacity) * lerpFactor;
    });
  }
  
  /**
   * Handle configuration updates
   * @param {Object} changes - Configuration changes
   */
  handleConfigUpdate(changes) {
    // Update local config
    this.config = this.configManager.getConfig();
    
    // Handle count changes
    if (changes.count !== undefined) {
      this.createNodes();
      this.blobs = createBlobs(this.group, this.nodes, this.config);
    }
    
    // Handle gooey intensity changes
    if (changes.gooeyIntensity !== undefined) {
      updateGooeyFilter(this.defs, this.config.gooeyIntensity);
      
      if (this.config.gooeyIntensity === 'none') {
        this.group.attr('filter', null);
      } else {
        applyGooeyFilter(this.group);
      }
    }
    
    // Handle color changes
    if (changes.color !== undefined) {
      this.blobs.attr('fill', this.config.color);
    }
    
    // Handle opacity changes
    if (changes.opacity !== undefined) {
      this.blobs.attr('opacity', this.config.opacity);
    }
    
    // Handle size changes
    if (changes.size !== undefined) {
      this.blobs.attr('r', this.config.size / 2);
    }
  }
  
  /**
   * Handle container resize
   */
  handleResize() {
    // Update dimensions
    this.width = this.container.clientWidth || 400;
    this.height = this.container.clientHeight || 400;
    
    // Update SVG
    this.svg
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    // Stop animation
    this.stop();
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    
    // Unsubscribe from configuration updates
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    
    // Remove SVG
    if (this.svg) {
      this.svg.remove();
    }
  }
}
