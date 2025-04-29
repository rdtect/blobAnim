/**
 * SVG Utilities
 * 
 * Provides helper functions for SVG creation and manipulation.
 */

import * as d3 from 'd3';

/**
 * Create an SVG element in the given container
 * @param {HTMLElement} container - Container element
 * @param {Object} options - SVG options
 * @returns {d3.Selection} D3 selection of the created SVG
 */
export function createSvg(container, options = {}) {
  const width = container.clientWidth || 400;
  const height = container.clientHeight || 400;
  
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .attr('class', 'blob-animation-svg')
    .style('display', 'block')
    .style('overflow', 'visible')
    .style('position', 'relative')
    .style('background-color', options.debug ? 'rgba(0, 0, 0, 0.05)' : 'transparent')
    .style('border', options.debug ? '1px dashed red' : 'none')
    .style('z-index', '1');
    
  return svg;
}

/**
 * Create a group element in the given SVG
 * @param {d3.Selection} svg - SVG element
 * @param {string} className - Class name for the group
 * @returns {d3.Selection} D3 selection of the created group
 */
export function createGroup(svg, className) {
  return svg.append('g')
    .attr('class', className);
}

/**
 * Create a defs element in the given SVG
 * @param {d3.Selection} svg - SVG element
 * @returns {d3.Selection} D3 selection of the created defs
 */
export function createDefs(svg) {
  return svg.append('defs');
}

/**
 * Create blob elements in the given group
 * @param {d3.Selection} group - Group element
 * @param {Array} data - Data array
 * @param {Object} options - Blob options
 * @returns {d3.Selection} D3 selection of the created blobs
 */
export function createBlobs(group, data, options) {
  return group.selectAll('circle')
    .data(data)
    .join('circle')
    .attr('r', options.size / 2)
    .attr('fill', options.color)
    .attr('opacity', options.opacity)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y);
}

/**
 * Update blob positions
 * @param {d3.Selection} blobs - Blob elements
 * @param {boolean} useTransition - Whether to use transitions
 * @param {number} duration - Transition duration
 */
export function updateBlobPositions(blobs, useTransition = true, duration = 100) {
  if (useTransition) {
    blobs.transition()
      .duration(duration)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('transform', d => `scale(${d.scale || 1})`);
  } else {
    blobs
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('transform', d => `scale(${d.scale || 1})`);
  }
}
