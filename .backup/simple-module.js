/**
 * BlobAnim - Simplified Module Version
 * 
 * A minimal implementation of the blob animation library using ES modules.
 */

import * as d3 from 'd3';

/**
 * Create a new blob animation
 * @param {HTMLElement} container - Container element
 * @param {Object} options - Animation options
 * @returns {Object} Animation control object
 */
export function createAnim(container, options = {}) {
  // Default options
  const config = {
    count: options.count || 10,
    size: options.size || 20,
    color: options.color || '#3b82f6',
    opacity: options.opacity || 0.8,
    speed: options.speed || 1,
    state: options.state || 'chaos',
    variant: options.variant || 'default',
    gooey: options.gooey !== undefined ? options.gooey : true,
    ...options
  };
  
  // Create SVG
  const width = container.clientWidth || 400;
  const height = container.clientHeight || 400;
  
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');
  
  // Create defs for filters
  const defs = svg.append('defs');
  
  // Add gooey filter if enabled
  if (config.gooey) {
    defs.html(`
      <filter id="gooey">
        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
        <feColorMatrix in="blur" mode="matrix" 
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="gooey" />
        <feBlend in="SourceGraphic" in2="gooey" />
      </filter>
    `);
  }
  
  // Create group for blobs
  const group = svg.append('g');
  
  // Apply gooey filter if enabled
  if (config.gooey) {
    group.attr('filter', 'url(#gooey)');
  }
  
  // Create data for blobs
  const data = Array.from({ length: config.count }, (_, i) => ({
    id: i,
    x: width / 2,
    y: height / 2,
    vx: 0,
    vy: 0
  }));
  
  // Create blobs
  let blobs = group.selectAll('circle')
    .data(data)
    .join('circle')
    .attr('r', config.size)
    .attr('fill', config.color)
    .attr('opacity', config.opacity)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y);
  
  // Animation variables
  let animationFrame = null;
  let lastTime = 0;
  let elapsedTime = 0;
  
  // Animation patterns
  const patterns = {
    chaos: {
      default: (d, i, time, count, width, height) => {
        const angle = (i / count) * Math.PI * 2 + time * 0.5;
        const radius = width * 0.3;
        const randomOffset = Math.sin(time * 2 + i * 3) * width * 0.05;
        
        return {
          x: width / 2 + Math.cos(angle) * (radius + randomOffset),
          y: height / 2 + Math.sin(angle) * (radius + randomOffset)
        };
      }
    },
    organizing: {
      default: (d, i, time, count, width, height) => {
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cellWidth = width / cols;
        const cellHeight = height / rows;
        const centerX = cellWidth * (col + 0.5);
        const centerY = cellHeight * (row + 0.5);
        const wobble = Math.sin(time + i) * 10;
        
        return {
          x: centerX + wobble,
          y: centerY + wobble
        };
      }
    },
    structured: {
      default: (d, i, time, count, width, height) => {
        const angle = (i / count) * Math.PI * 2;
        const radius = width * 0.3;
        const wobble = Math.sin(time * 0.2 + i) * 2;
        
        return {
          x: width / 2 + Math.cos(angle) * radius + wobble,
          y: height / 2 + Math.sin(angle) * radius + wobble
        };
      }
    }
  };
  
  // Animation function
  function animate(timestamp) {
    // Calculate time delta
    const delta = timestamp - lastTime;
    lastTime = timestamp;
    
    // Update elapsed time
    elapsedTime += delta / 1000;
    
    // Get current pattern
    const pattern = patterns[config.state]?.[config.variant] || patterns.chaos.default;
    
    // Update positions
    data.forEach((d, i) => {
      const target = pattern(d, i, elapsedTime, config.count, width, height);
      
      // Apply simple easing
      d.x += (target.x - d.x) * 0.1 * config.speed;
      d.y += (target.y - d.y) * 0.1 * config.speed;
    });
    
    // Update blob positions
    blobs
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
    
    // Request next frame
    animationFrame = requestAnimationFrame(animate);
  }
  
  // Start animation
  lastTime = performance.now();
  animationFrame = requestAnimationFrame(animate);
  
  // Return control object
  return {
    // Update configuration
    update(newOptions) {
      // Update config
      Object.assign(config, newOptions);
      
      // Handle count changes
      if (newOptions.count !== undefined && newOptions.count !== data.length) {
        // Update data
        const newData = Array.from({ length: config.count }, (_, i) => {
          if (i < data.length) {
            return data[i];
          } else {
            return {
              id: i,
              x: width / 2,
              y: height / 2,
              vx: 0,
              vy: 0
            };
          }
        });
        
        // Update data array
        data.length = 0;
        data.push(...newData);
        
        // Update blobs
        blobs.remove();
        blobs = group.selectAll('circle')
          .data(data)
          .join('circle')
          .attr('r', config.size)
          .attr('fill', config.color)
          .attr('opacity', config.opacity)
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
      }
      
      // Handle size changes
      if (newOptions.size !== undefined) {
        blobs.attr('r', config.size);
      }
      
      // Handle color changes
      if (newOptions.color !== undefined) {
        blobs.attr('fill', config.color);
      }
      
      // Handle opacity changes
      if (newOptions.opacity !== undefined) {
        blobs.attr('opacity', config.opacity);
      }
      
      // Handle gooey changes
      if (newOptions.gooey !== undefined) {
        if (config.gooey) {
          group.attr('filter', 'url(#gooey)');
        } else {
          group.attr('filter', null);
        }
      }
    },
    
    // Pause animation
    pause() {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    },
    
    // Resume animation
    resume() {
      if (!animationFrame) {
        lastTime = performance.now();
        animationFrame = requestAnimationFrame(animate);
      }
    },
    
    // Destroy animation
    destroy() {
      // Stop animation
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      
      // Remove SVG
      svg.remove();
    }
  };
}

// Default export
export default createAnim;
