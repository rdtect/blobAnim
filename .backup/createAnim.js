import { select } from "d3-selection";
import { arraysEqual } from "./utils.js";

// Common pattern helpers to reduce redundancy
const patternHelpers = {
  // Center coordinates - used in multiple patterns
  center: (w, h) => ({ x: w / 2, y: h / 2 }),

  // Calculate polar coordinates from center - used in several patterns
  polarToCartesian: (centerX, centerY, radius, angle, result = { x: 0, y: 0 }) => {
    result.x = centerX + Math.cos(angle) * radius;
    result.y = centerY + Math.sin(angle) * radius;
    return result;
  },

  // Standard angle calculation used in many patterns
  indexToAngle: (i, count, timeOffset = 0) =>
    (i / count) * Math.PI * 2 + timeOffset,

  // Grid calculations shared between patterns
  getGridPosition: (i, count, w, h, withPadding = true) => {
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const col = i % cols;
    const row = Math.floor(i / cols);

    if (withPadding) {
      const cellWidth = w / (cols + 1);
      const cellHeight = h / (rows + 1);
      return {
        x: (col + 1) * cellWidth,
        y: (row + 1) * cellHeight,
      };
    } else {
      const cellWidth = w / cols;
      const cellHeight = h / rows;
      return {
        x: col * cellWidth + cellWidth / 2,
        y: row * cellHeight + cellHeight / 2,
      };
    }
  },
};

// Animation states and patterns consolidated into a single object
export const ANIMATION_CONFIG = {
  states: {
    chaos: {
      patterns: {
        default: (d, i, t, count, w, h) => {
          const center = patternHelpers.center(w, h);
          const angle = patternHelpers.indexToAngle(i, count, t * 0.5);
          const radius = w * 0.3;
          const offset = Math.sin(t * 2 + i * 3) * w * 0.05;

          return patternHelpers.polarToCartesian(
            center.x,
            center.y,
            radius + offset,
            angle
          );
        },
        spiral: (d, i, t, count, w, h) => {
          const center = patternHelpers.center(w, h);
          const angle = patternHelpers.indexToAngle(i, count, t * 0.5);
          const radius = (i / count) * w * 0.25 + w * 0.05;
          const offset = Math.sin(t * 2 + i) * w * 0.02;

          return patternHelpers.polarToCartesian(
            center.x,
            center.y,
            radius + offset,
            angle
          );
        },
        explosion: (d, i, t, count, w, h) => {
          const center = patternHelpers.center(w, h);
          const angle = patternHelpers.indexToAngle(i, count, 0);
          const pulseSpeed = t * 2;
          const radius = (0.2 + Math.sin(pulseSpeed) * 0.1) * w;

          return patternHelpers.polarToCartesian(
            center.x,
            center.y,
            radius,
            angle
          );
        },
      },
    },
    organizing: {
      patterns: {
        default: (d, i, t, count, w, h) => {
          const pos = patternHelpers.getGridPosition(i, count, w, h, true);
          return {
            x: pos.x + Math.sin(t + i) * w * 0.02,
            y: pos.y + Math.cos(t + i) * h * 0.02,
          };
        },
        wave: (d, i, t, count, w, h) => {
          const spacing = w / (count + 1);
          const waveY = Math.sin(i * 0.3 + t * 2) * h * 0.2;
          return {
            x: (i + 1) * spacing,
            y: h / 2 + waveY,
          };
        },
        cylinder: (d, i, t, count, w, h) => {
          const center = patternHelpers.center(w, h);
          const angle = patternHelpers.indexToAngle(i, count, t);
          const verticalPos = ((i % 5) / 5) * h;
          const radius = w * 0.3;

          return {
            x: center.x + Math.cos(angle) * radius,
            y: verticalPos,
          };
        },
      },
    },
    structured: {
      patterns: {
        default: (d, i, t, count, w, h) => {
          return patternHelpers.getGridPosition(i, count, w, h, false);
        },
        orbit: (d, i, t, count, w, h) => {
          const center = patternHelpers.center(w, h);
          const groups = 3;
          const groupIndex = i % groups;
          const groupSize = Math.ceil(count / groups);
          const posInGroup = Math.floor(i / groups);
          const angleInGroup = (posInGroup / groupSize) * Math.PI * 2;
          const groupRadius = w * 0.12 * (groupIndex + 1);
          const orbitSpeed = 0.5 / (groupIndex + 1);
          const angle = angleInGroup + t * orbitSpeed;

          return patternHelpers.polarToCartesian(
            center.x,
            center.y,
            groupRadius,
            angle
          );
        },
        flower: (d, i, t, count, w, h) => {
          const center = patternHelpers.center(w, h);
          const angle = patternHelpers.indexToAngle(i, count, 0);
          const petalCount = 5;
          const petalRadius = w * 0.3;
          const variance = Math.sin(angle * petalCount + t) * w * 0.1;

          return patternHelpers.polarToCartesian(
            center.x,
            center.y,
            petalRadius + variance,
            angle
          );
        },
      },
    },
  },
};

// Animation constants
const ANIMATION_CONSTANTS = {
  LERP_FACTOR: 0.08,
  DEFAULT_SCALE_MIN: 0.8,
  DEFAULT_SCALE_MAX: 1.2,
  FPS_SAMPLING_INTERVAL: 1000, // ms
  MIN_DELTA: 0.001,
  FPS_DROP_THRESHOLD: 30,
  MIN_BLOB_COUNT: 6,
};

// Gooey filter presets for better configurability
const GOOEY_PRESETS = {
  none: null, // No filter
  low: {
    stdDeviation: 8,
    matrix: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -7",
  },
  medium: {
    stdDeviation: 12,
    matrix: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8",
  }, // Default
  strong: {
    stdDeviation: 16,
    matrix: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -9",
  },
};

// Glass effect filter - new addition
const GLASS_FILTER = {
  enabled: false,
  blurAmount: 4,
  opacity: 0.7,
  reflectionIntensity: 0.3
};

// Default configuration values - added glass effect and randomness options
const DEFAULT_CONFIG = {
  count: 5,
  size: 20,
  colors: ["#3b82f6"],
  opacity: 1,
  speed: 1,
  state: "chaos",
  variant: "default",
  gooey: true, // Keep simple boolean toggle for backward compatibility/ease of use
  gooeyIntensity: "medium", // Add intensity option
  scaleEffects: true,
  glass: false, // Whether to apply glass effect
  glassBlobs: [], // Array of indices for blobs with glass effect
  chaosAmount: 1.0, // How chaotic/random blobs should be (0.0-1.0)
  sizeFactor: 1,
  transitionDuration: 1000,
  debug: false,
  gradient: false, // New gradient option
};

/**
 * Creates a blob animation
 * @param {HTMLElement} container - The DOM element to place the animation in
 * @param {Object} options - Configuration options
 * @returns {Object} Animation control methods
 */
export function createAnim(container, options = {}) {
  // --- Configuration Setup ---
  const config = { ...DEFAULT_CONFIG, ...options };

  // Handle legacy color option
  if (options.color && !options.colors) {
    config.colors = [options.color];
  }
  // Ensure colors is always an array
  if (!Array.isArray(config.colors) || config.colors.length === 0) {
    config.colors = [DEFAULT_CONFIG.colors[0]];
  }

  // Process RGBA color for opacity (only if opacity wasn't explicitly set)
  if (options.opacity === undefined && config.colors[0]?.startsWith("rgba(")) {
    try {
      const rgbaMatch = config.colors[0].match(
        /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/
      );
      if (rgbaMatch?.[1]) {
        config.opacity = parseFloat(rgbaMatch[1]);
      }
    } catch (e) {
      console.warn("Error parsing RGBA color for opacity:", e);
    }
  }

  // Ensure container dimensions are set
  config.width = config.width || container.clientWidth || 400;
  config.height = config.height || container.clientHeight || 400;

  // Defensive: Ensure numeric config options are numbers
  config.count = Number(config.count) || DEFAULT_CONFIG.count;
  config.size = Number(config.size) || DEFAULT_CONFIG.size;
  config.speed = Number(config.speed) || DEFAULT_CONFIG.speed;
  config.width = Number(config.width) || container.clientWidth || 400;
  config.height = Number(config.height) || container.clientHeight || 400;
  config.chaosAmount = Number(config.chaosAmount) || DEFAULT_CONFIG.chaosAmount;

  // --- SVG and Group Setup ---
  const svg = select(container) // Use imported select
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${config.width} ${config.height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("display", "block"); // Ensure SVG is block element

  const defs = svg.append("defs");
  const group = svg.append("g").attr("stroke", "none"); // Apply stroke none to group

  // --- Gradient Fill Support ---
  // Add a gradient definition and logic for blobs
  const createGradientDefs = () => {
    defs.selectAll("linearGradient, radialGradient").remove();
    if (config.gradient) {
      defs.append("radialGradient")
        .attr("id", "blob-gradient")
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "80%")
        .selectAll("stop")
        .data([
          { offset: "0%", color: config.colors[0], opacity: 1 },
          { offset: "100%", color: config.colors[1] || config.colors[0], opacity: 0.8 }
        ])
        .enter()
        .append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color)
        .attr("stop-opacity", d => d.opacity);
    }
  };

  // Function to apply or remove gooey filter
  const applyGooeyFilter = () => {
    defs.select("#gooey").remove(); // Clear previous filter
    const intensity = config.gooey ? config.gooeyIntensity : "none";
    const preset = GOOEY_PRESETS[intensity];

    if (preset) {
      defs.append("filter").attr("id", "gooey").html(`
            <feGaussianBlur in="SourceGraphic" stdDeviation="${preset.stdDeviation}" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="${preset.matrix}" result="gooeyEffect" />
            <feComposite in="SourceGraphic" in2="gooeyEffect" operator="atop" />
          `);
      group.attr("filter", "url(#gooey)");
    } else {
      group.attr("filter", null);
    }
  };

  // Function to create glass effect filter
  const createGlassFilter = () => {
    // Remove any existing glass filter
    defs.select("#glass-effect").remove();
    
    // Add the glass effect filter with configurable parameters
    if (config.glass) {
      const glassFilter = defs.append("filter")
        .attr("id", "glass-effect")
        .html(`
          <feGaussianBlur in="SourceGraphic" stdDeviation="${GLASS_FILTER.blurAmount}" result="blur" />
          <feColorMatrix in="blur" type="matrix" 
                        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
          <feBlend in="SourceGraphic" in2="goo" mode="normal" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" result="comp" />
          <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#ffffff" flood-opacity="${GLASS_FILTER.reflectionIntensity}" />
        `);
    }
  };

  // Function to apply scaling transform
  const applyScalingTransform = () => {
    const scaledWidth = config.width * config.sizeFactor;
    const scaledHeight = config.height * config.sizeFactor;
    const translateX = (config.width - scaledWidth) / 2;
    const translateY = (config.height - scaledHeight) / 2;
    group.attr(
      "transform",
      `translate(${translateX}, ${translateY}) scale(${config.sizeFactor})`
    );
  };

  // Initial setup
  applyGooeyFilter();
  createGlassFilter();
  createGradientDefs();
  applyScalingTransform();

  // --- Data and Color Management ---
  const getColorForBlob = (index) => {
    // Cycle through colors array
    return config.colors[index % config.colors.length];
  };

  let data = [];
  const initializeData = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: config.width / 2,
      y: config.height / 2,
      scale: 1,
      color: getColorForBlob(i),
      isGlass: config.glassBlobs.includes(i), // Track glass effect state
      randomSeed: Math.random(), // Add random seed for variation
      // Store current lerp target for smooth transitions
      targetX: config.width / 2,
      targetY: config.height / 2,
      targetScale: 1,
    }));
  };

  // --- DOM Element Management ---
  // Keep a reference to the selection of blob groups
  let blobGroupSelection = group.selectAll("g.blob-group");

  // Function to update DOM elements based on data
  const updateDOMElements = () => {
    blobGroupSelection = blobGroupSelection
      .data(data, (d) => d.id) // Use key function for object constancy
      .join(
        (enter) => {
          const groups = enter
            .append("g")
            .attr("class", "blob-group") // Add class for easier selection
            .attr(
              "transform",
              (d) => `translate(${d.x}, ${d.y}) scale(${d.scale})`
            );
            
          // Add blob circle
          groups.append("circle")
            .attr("r", config.size)
            .attr("fill", (d) => config.gradient ? "url(#blob-gradient)" : d.color)
            .attr("opacity", (d) => d.isGlass ? GLASS_FILTER.opacity : config.opacity);
            
          // Apply glass effect filter to glass blobs
          groups.each(function(d) {
            const element = select(this);
            if (d.isGlass) {
              element.attr("filter", "url(#glass-effect)")
                    .select("circle")
                    .style("stroke", "rgba(255, 255, 255, 0.5)")
                    .style("stroke-width", "1");
            }
          });
            
          return groups;
        },
        (update) => update, // No specific update needed here, transform handled below
        (exit) => exit.remove()
      );

    // Update transforms and attributes for all groups/circles efficiently
    blobGroupSelection.attr(
      "transform",
      (d) => `translate(${d.x}, ${d.y}) scale(${d.scale})`
    );
    
    // Update blob appearance based on attributes
    blobGroupSelection.each(function(d) {
      const element = select(this);
      element.select("circle")
        .attr("r", config.size)
        .attr("fill", config.gradient ? "url(#blob-gradient)" : d.color)
        .attr("opacity", d.isGlass ? GLASS_FILTER.opacity : config.opacity);
        
      // Apply or remove glass effect
      if (d.isGlass) {
        element.attr("filter", "url(#glass-effect)")
              .select("circle")
              .style("stroke", "rgba(255, 255, 255, 0.5)")
              .style("stroke-width", "1");
      } else {
        element.attr("filter", null)
              .select("circle")
              .style("stroke", null)
              .style("stroke-width", null);
      }
    });
  };

  // Initialize data and DOM
  data = initializeData(config.count);
  console.log("BlobAnim data length:", data.length, "config.count:", config.count);
  updateDOMElements();

  // --- Animation State and Transition Logic ---
  let animationFrame = null;
  let lastTime = performance.now();
  let elapsedTime = 0; // Tracks total time for pattern calculations

  // Transition state variables
  let isTransitioning = false;
  let transitionStartTime = 0;
  let previousState = config.state;
  let previousVariant = config.variant;
  let targetState = config.state;
  let targetVariant = config.variant;
  let oldPatternFn = null; // Always declare and initialize

  // Function to get pattern function based on specific state/variant
  const getPatternFunction = (state, variant) => {
    const stateConfig = ANIMATION_CONFIG.states[state];
    return (
      stateConfig?.patterns[variant] ??
      ANIMATION_CONFIG.states.chaos.patterns.default
    );
  };

  // --- FPS Monitoring ---
  let frameCount = 0;
  let lastFpsUpdate = 0;
  let currentFps = 60;

  // --- Main Animation Loop (Delta Timing, Batching, Adaptive Quality) ---
  function animateLoop(timestamp) {
    if (!this._lastFrameTimestamp) this._lastFrameTimestamp = timestamp;
    const delta = Math.max((timestamp - this._lastFrameTimestamp) / 1000, ANIMATION_CONSTANTS.MIN_DELTA);
    this._lastFrameTimestamp = timestamp;

    elapsedTime += delta; // Increment elapsed time

    // FPS calculation
    frameCount++;
    if (!lastFpsUpdate) lastFpsUpdate = timestamp;
    if (timestamp - lastFpsUpdate > ANIMATION_CONSTANTS.FPS_SAMPLING_INTERVAL) {
      currentFps = frameCount;
      frameCount = 0;
      lastFpsUpdate = timestamp;
      // Adaptive quality: reduce blob count if FPS drops
      if (currentFps < ANIMATION_CONSTANTS.FPS_DROP_THRESHOLD && this._config.count > ANIMATION_CONSTANTS.MIN_BLOB_COUNT) {
        // ... Adaptive quality logic would go here
      }
    }

    // Get the appropriate pattern function based on current state/variant
    const patternFn = getPatternFunction(this._targetState, this._targetVariant);

    // Transition handling
    let transitionProgress = 1;
    if (this._isTransitioning) {
      const elapsed = timestamp - this._transitionStartTime;
      transitionProgress = Math.min(elapsed / this._config.transitionDuration, 1);
      
      if (transitionProgress >= 1) {
        this._isTransitioning = false;
        this._oldPatternFn = null; // Clear old pattern
      }
    }

    // Update position for each blob with delta-adjusted time
    // Scale the time by speed config
    const timeValue = elapsedTime * this._config.speed;
    
    // Apply chaos factor to randomize movements
    const chaosAmount = this._config.chaosAmount;

    // Update each blob efficiently, batching all calculations
    this._data.forEach((d, i) => {
      // Calculate target position using the pattern function
      const targetPos = patternFn(d, i, timeValue, this._config.count, this._config.width, this._config.height);
      
      // Add randomness based on chaosAmount
      if (chaosAmount > 0) {
        const randomOffset = {
          x: (Math.sin(timeValue * d.randomSeed + i) * this._config.width * 0.1) * chaosAmount,
          y: (Math.cos(timeValue * (d.randomSeed + 0.5) + i) * this._config.height * 0.1) * chaosAmount
        };
        targetPos.x += randomOffset.x;
        targetPos.y += randomOffset.y;
      }
      
      // During transition, blend between old and new patterns
      if (this._isTransitioning && this._oldPatternFn) {
        const oldTargetPos = this._oldPatternFn(d, i, timeValue, this._config.count, this._config.width, this._config.height);
        // Lerp between old and new positions
        targetPos.x = oldTargetPos.x * (1 - transitionProgress) + targetPos.x * transitionProgress;
        targetPos.y = oldTargetPos.y * (1 - transitionProgress) + targetPos.y * transitionProgress;
      }

      // Store the target position
      d.targetX = targetPos.x;
      d.targetY = targetPos.y;

      // Apply scale variation effects if enabled
      if (this._config.scaleEffects) {
        const scaleVariation = Math.sin(timeValue * 1.5 + i * 0.7) * 0.1 + 1;
        d.targetScale = scaleVariation;
      } else {
        d.targetScale = 1;
      }

      // Smooth lerp towards target position and scale
      d.x += (d.targetX - d.x) * ANIMATION_CONSTANTS.LERP_FACTOR;
      d.y += (d.targetY - d.y) * ANIMATION_CONSTANTS.LERP_FACTOR;
      d.scale += (d.targetScale - d.scale) * ANIMATION_CONSTANTS.LERP_FACTOR;
    });

    // Batch update to DOM elements
    // Use requestAnimationFrame timing to ensure visual smoothness
    this._blobGroupSelection.attr("transform", d => `translate(${d.x}, ${d.y}) scale(${d.scale})`);

    // Continue animation loop
    this._animationFrame = requestAnimationFrame(this.animateLoop.bind(this));
  }

  // --- Public API Methods ---
  const api = {
    // Reference to dom element
    container,

    // Keep private references with underscore prefix
    _config: config,
    _data: data,
    _svg: svg,
    _group: group,
    _animationFrame: animationFrame,
    _blobGroupSelection: blobGroupSelection,
    _lastFrameTimestamp: 0,
    _isTransitioning: isTransitioning,
    _transitionStartTime: transitionStartTime,
    _previousState: previousState,
    _previousVariant: previousVariant,
    _targetState: targetState,
    _targetVariant: targetVariant,
    _oldPatternFn: oldPatternFn,

    // Current status
    isRunning: false,

    // Method to start the animation
    start() {
      if (!this.isRunning) {
        this._lastFrameTimestamp = 0; // Reset timestamp
        this._animationFrame = requestAnimationFrame(this.animateLoop.bind(this));
        this.isRunning = true;
      }
      return this;
    },

    // Method to stop the animation
    stop() {
      if (this.isRunning) {
        cancelAnimationFrame(this._animationFrame);
        this.isRunning = false;
      }
      return this;
    },

    // Get current FPS
    getFPS() {
      return currentFps;
    },

    // Method to update configuration
    updateConfig(newConfig) {
      const oldConfig = { ...this._config };
      const updated = { ...this._config, ...newConfig };

      // Handle special case for state and variant transitions
      const stateChanged = updated.state !== this._config.state || updated.variant !== this._config.variant;
      if (stateChanged) {
        this._isTransitioning = true;
        this._transitionStartTime = performance.now();
        this._previousState = this._config.state;
        this._previousVariant = this._config.variant;
        this._targetState = updated.state;
        this._targetVariant = updated.variant;
        this._oldPatternFn = getPatternFunction(this._previousState, this._previousVariant);
      }

      // Check for count changes to update data array
      
        if (updated.count > this._config.count) {
          // Add new blobs
          const newBlobsCount = updated.count - this._config.count;
          const newBlobs = Array.from({ length: newBlobsCount }, (_, i) => {
            const index = this._config.count + i;
            return {
              id: index,
              x: this._config.width / 2,
              y: this._config.height / 2,
              scale: 1,
              color: getColorForBlob(index),
              isGlass: updated.glassBlobs.includes(index),
              randomSeed: Math.random(),
              targetX: this._config.width / 2,
              targetY: this._config.height / 2,
              targetScale: 1,
            };
          });
          this._data = [...this._data, ...newBlobs];
        } else if (updated.count < this._config.count) {
          // Remove excess blobs
          this._data = this._data.slice(0, updated.count);
        }
        // Update DOM after count changes
        updateDOMElements();
      }
      
      // Check for glass blob changes
      const glassChanged = !arraysEqual(oldConfig.glassBlobs, updated.glassBlobs);
      if (glassChanged) {
        // Update glass state for each blob
        this._data.forEach((d, i) => {
          d.isGlass = updated.glassBlobs.includes(i);
        });
        createGlassFilter();
        updateDOMElements();
      }

      // Handle size, color changes
      if (updated.size !== this._config.size || 
          !arraysEqual(updated.colors, this._config.colors)) {
          JSON.stringify(updated.colors) !== JSON.stringify(this._config.colors)) {
        // Update colors if needed
        if (JSON.stringify(updated.colors) !== JSON.stringify(this._config.colors)) {
          this._data.forEach((d, i) => {
            d.color = getColorForBlob(i);
          });
        }
        updateDOMElements();
      }

      // Handle gooey filter changes
      if (updated.gooey !== this._config.gooey || 
          updated.gooeyIntensity !== this._config.gooeyIntensity) {
        applyGooeyFilter();
      }

      // Handle glass effect toggle
      if (updated.glass !== this._config.glass) {
        createGlassFilter();
        updateDOMElements();
      }

      // Handle gradient changes
      if (updated.gradient !== this._config.gradient || !arraysEqual(updated.colors, this._config.colors)) {
        createGradientDefs();
        updateDOMElements();
      }

      // Update size/scaling transform
      if (updated.width !== this._config.width ||
          updated.height !== this._config.height ||
          updated.sizeFactor !== this._config.sizeFactor) {
        this._svg.attr("viewBox", `0 0 ${updated.width} ${updated.height}`);
        applyScalingTransform();
      }

      // Update config with new values
      this._config = updated;
      return this;
    },

    // Method to get current config
    getConfig() {
      return { ...this._config };
    },

    // Helper method to set glass effect on specific blobs
    setGlassBlobs(indices) {
      return this.updateConfig({
        glass: indices.length > 0,
        glassBlobs: indices
      });
    },

    // Helper method to set chaos amount (0-1)
    setChaosAmount(amount) {
      return this.updateConfig({
        chaosAmount: Math.max(0, Math.min(1, amount))
      });
    },

    // Animation loop - bound via this in start()
    animateLoop,
  };

  // Start the animation automatically
  api.start();

  return api;
}
