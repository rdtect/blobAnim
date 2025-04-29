/**
 * Gooey Filter Utilities
 * 
 * Provides SVG filter creation and management for the gooey effect.
 */

import { GOOEY_INTENSITY_PRESETS } from '../config.js';

/**
 * Creates SVG markup for a gooey filter with given intensity
 * @param {string} intensity - The intensity level of the gooey effect
 * @returns {string} SVG filter markup as a string
 */
export function createGooeyFilter(intensity = "medium") {
  const preset = GOOEY_INTENSITY_PRESETS[intensity];

  if (intensity === "none") {
    return '<filter id="gooey"></filter>';
  }

  return `<filter id="gooey" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceGraphic" stdDeviation="${preset.blur}" result="blur" />
    <feColorMatrix in="blur" mode="matrix" 
      values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${preset.contrast} ${preset.shift}" result="gooey" />
    <feBlend in="SourceGraphic" in2="gooey" />
  </filter>`;
}

/**
 * Updates an existing gooey filter to a new intensity
 * @param {d3.Selection} defs - The SVG defs element containing the filter
 * @param {string} intensity - The new intensity level
 */
export function updateGooeyFilter(defs, intensity) {
  // Remove existing filter
  defs.select("#gooey").remove();

  // Add new filter with updated intensity
  defs.html(createGooeyFilter(intensity));
}

/**
 * Apply gooey filter to a selection of elements
 * @param {d3.Selection} selection - The D3 selection to apply the filter to
 */
export function applyGooeyFilter(selection) {
  selection.attr("filter", "url(#gooey)");
}

/**
 * Remove gooey filter from a selection of elements
 * @param {d3.Selection} selection - The D3 selection to remove the filter from
 */
export function removeGooeyFilter(selection) {
  selection.attr("filter", null);
}
