/**
 * BlobAnim - SVG Implementation
 *
 * A simple SVG-based blob animation library.
 */

/**
 * Create a new blob animation
 * @param {HTMLElement} container - Container element
 * @param {Object} options - Animation options
 * @returns {Object} Animation control object
 */
function createAnim(container, options = {}) {
  // Default options
  const config = {
    count: options.count || 10,
    size: options.size || 20,
    colors: options.colors || "#3b82f6",
 
   
    opacity: options.opacity || 1,
    speed: options.speed || 1,
    state: options.state || "chaos",
    variant: options.variant || "default",
    gooey: options.gooey !== undefined ? options.gooey : true,
    scaleEffects:
      options.scaleEffects !== undefined ? options.scaleEffects : true,
    
    ...options,
  };

  // Create SVG
  // Fix: Use passed width/height or container size, but with lower minimums (100px instead of 400px)
  let width = options.width || container.clientWidth || 600;
  let height = options.height || container.clientHeight || 600;



  // Create SVG using D3
  const svg = d3
    .select(container)
    // .html("")
    // .append('canvas')
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

   

  // Add defs for filters
  const defs = svg.append("defs");

  // Add gooey filter if enabled
  if (config.gooey) {
    addGooeyFilter(defs);
  }

  // Create group for blobs
  const blobGroup = svg
    .append("g")
    .attr("class", "blobs")
    .attr("filter", config.gooey ? "url(#gooey)" : null);

  // Create data for blobs
  const data = Array.from({ length: config.count }, (_, i) => ({
    id: i,
    x: width / 2,
    y: height / 2,
    scale: 1,
    glass: i % 5 === 0 && config.showGlass,
  }));

  // Create blobs
  createBlobs(blobGroup, data, config);

  // Animation variables
  let animationFrame = null;
  let lastTime = 0;
  let elapsedTime = 0;
  let frameCount = 0;
  let lastFpsUpdate = 0;
  let fps = 60;

  // Animation patterns
  const patterns = {
    chaos: {
      default: (_, i, time, count, width, height) => {
        const angle = (i / count) * Math.PI * 2 + time * 0.5;
        const radius = width * 0.3;
        const randomOffset = Math.sin(time * 2 + i * 3) * width * 0.05;
        const scale = config.scaleEffects ? 0.8 + Math.sin(time + i) * 0.2 : 1;

        return {
          x: width / 2 + Math.cos(angle) * (radius + randomOffset),
          y: height / 2 + Math.sin(angle) * (radius + randomOffset),
          scale: scale,
        };
      },
      spiral: (_, i, time, count, width, height) => {
        const normalizedIndex = i / count;
        const angle = normalizedIndex * Math.PI * 8 + time * 0.5;
        const radius =
          ((0.1 + normalizedIndex * 0.3) * Math.min(width, height)) / 2;
        const scale = config.scaleEffects
          ? 1 - normalizedIndex * 0.5 + Math.sin(time * 0.3 + i) * 0.1
          : 1;

        return {
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius,
          scale: scale,
        };
      },
      explosion: (_, i, time, count, width, height) => {
        const angle = (i / count) * Math.PI * 2;
        const explosionProgress = Math.min(1, (time % 5) / 5);
        const radius = (0.4 * explosionProgress * Math.min(width, height)) / 2;
        const scale = config.scaleEffects ? 1.0 - explosionProgress * 0.3 : 1;

        return {
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius,
          scale: scale,
        };
      },
    },
    organizing: {
      default: (_, i, time, count, width, height) => {
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cellWidth = width / cols;
        const cellHeight = height / rows;
        const centerX = cellWidth * (col + 0.5);
        const centerY = cellHeight * (row + 0.5);
        const wobble = Math.sin(time + i) * 10;
        const scale = config.scaleEffects
          ? 0.8 + Math.sin(time * 0.5 + i) * 0.2
          : 1;

        return {
          x: centerX + wobble,
          y: centerY + wobble,
          scale: scale,
        };
      },
      wave: (_, i, time, count, width, height) => {
        const normalizedIndex = i / count;
        const waveAmplitude = 0.2 * height;
        const waveFrequency = 3;
        const waveSpeed = 0.5;
        const x = width * normalizedIndex;
        const baseY = height / 2;
        const waveY =
          Math.sin(
            normalizedIndex * waveFrequency * Math.PI * 2 + time * waveSpeed
          ) * waveAmplitude;
        const scale = config.scaleEffects
          ? 0.8 + Math.sin(time * 0.3 + i) * 0.2
          : 1;

        return {
          x: x,
          y: baseY + waveY,
          scale: scale,
        };
      },
      cylinder: (_, i, time, count, width, height) => {
        const rows = Math.ceil(Math.sqrt(count / 2));
        const cols = Math.ceil(count / rows);
        const row = Math.floor(i / cols);
        const col = i % cols;
        const cellWidth = width / cols;
        const cellHeight = height / rows;
        const baseX = cellWidth * (col + 0.5);
        const baseY = cellHeight * (row + 0.5);
        const rotationAngle = time * 0.5 + (col / cols) * Math.PI * 2;
        const xOffset = Math.sin(rotationAngle) * cellWidth * 0.3;
        const scale = config.scaleEffects
          ? 0.5 + Math.abs(Math.cos(rotationAngle)) * 0.5
          : 1;

        return {
          x: baseX + xOffset,
          y: baseY,
          scale: scale,
        };
      },
    },
    structured: {
      default: (_, i, time, count, width, height) => {
        const angle = (i / count) * Math.PI * 2;
        const radius = width * 0.3;
        const wobble = Math.sin(time * 0.2 + i) * 2;
        const scale = config.scaleEffects
          ? 0.9 + Math.sin(time * 0.1 + i) * 0.1
          : 1;

        return {
          x: width / 2 + Math.cos(angle) * radius + wobble,
          y: height / 2 + Math.sin(angle) * radius + wobble,
          scale: scale,
        };
      },
      orbit: (_, i, time, count, width, height) => {
        const orbits = 3;
        const orbitIndex = Math.floor((i / count) * orbits);
        const nodesInOrbit = Math.ceil(count / orbits);
        const nodeIndexInOrbit = i % nodesInOrbit;
        const baseRadius = (Math.min(width, height) / 2) * 0.4;
        const orbitRadius = baseRadius * ((orbitIndex + 1) / orbits);
        const orbitSpeed = 0.2 * (1 - orbitIndex / orbits);
        const angle =
          (nodeIndexInOrbit / nodesInOrbit) * Math.PI * 2 + time * orbitSpeed;
        const scale = config.scaleEffects ? 1 - orbitIndex * 0.2 : 1;

        return {
          x: width / 2 + Math.cos(angle) * orbitRadius,
          y: height / 2 + Math.sin(angle) * orbitRadius,
          scale: scale,
        };
      },
      flower: (_, i, time, count, width, height) => {
        const petals = 5;
        const angle = (i / count) * Math.PI * 2;
        const radius = (0.3 * Math.min(width, height)) / 2;
        const petalEffect = Math.cos(petals * angle) * 0.3;
        const adjustedRadius = radius * (1 + petalEffect);
        const rotationSpeed = 0.05;
        const rotatedAngle = angle + time * rotationSpeed;
        const scale = config.scaleEffects ? 0.8 + petalEffect * 0.4 : 1;

        return {
          x: width / 2 + Math.cos(rotatedAngle) * adjustedRadius,
          y: height / 2 + Math.sin(rotatedAngle) * adjustedRadius,
          scale: scale,
        };
      },
    },
  };

  // Add gooey filter
  function addGooeyFilter(defs) {
    const filter = defs
      .append("filter")
      .attr("id", "gooey")
      .attr("width", "300%")
      .attr("height", "300%")
      .attr("x", "-100%")
      .attr("y", "-100%");

    filter
      .append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", "10")
      .attr("result", "blur");

    filter
      .append("feColorMatrix")
      .attr("in", "blur")
      .attr("mode", "matrix")
      .attr("values", "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9")
      .attr("result", "gooey");

    filter
      .append("feComposite")
      .attr("in", "SourceGraphic")
      .attr("in2", "gooey")
      .attr("operator", "atop");
  }

  // Create blobs
  function createBlobs(group, data, config) {
    const blobs = group
      .selectAll(".blob")
      .data(data, (d) => d.id)
      .join(
        (enter) => {
          const blob = enter
            .append("circle")
            .attr("class", "blob")
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .attr("r", config.size)
            .attr("fill-opacity", config.opacity)
            .attr("fill", (d, i) => {
              if (d.glass) {
                return "none";
              } else if (config.solidColor) {
                return config.color;
              } else {
                return config.colors[i % config.colors.length];
              }
            })
            .attr("stroke", (d, i) => {
              if (d.glass) {
                return config.solidColor
                  ? config.color
                  : config.colors[i % config.colors.length];
              }
              return null;
            })
            .attr("stroke-width", (d) => (d.glass ? 2 : 0))
            .attr("stroke-opacity", config.opacity)
            .attr("transform", (d) => `scale(${d.scale || 1})`);

          return blob;
        },
        (update) => update,
        (exit) => exit.remove()
      );
  }

  // Animation function
  function animate(timestamp) {
    // Calculate time delta
    const delta = timestamp - lastTime;
    lastTime = timestamp;

    // Update elapsed time
    elapsedTime += delta / 1000;

    // Get current pattern
    const pattern =
      patterns[config.state]?.[config.variant] || patterns.chaos.default;

    // Update FPS counter
    frameCount++;
    if (timestamp - lastFpsUpdate >= 1000) {
      fps = frameCount;
      frameCount = 0;
      lastFpsUpdate = timestamp;
    }

    // Update positions
    data.forEach((d, i) => {
      const target = pattern(d, i, elapsedTime, config.count, width, height);

      // Apply simple easing
      d.x += (target.x - d.x) * 0.1 * config.speed;
      d.y += (target.y - d.y) * 0.1 * config.speed;

      // Apply scale easing if available
      if (target.scale !== undefined) {
        d.scale =
          d.scale !== undefined
            ? d.scale + (target.scale - d.scale) * 0.1 * config.speed
            : target.scale;
      }
    });

    // Update blob positions
    blobGroup
      .selectAll(".blob")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", config.size)
      .attr("fill-opacity", config.opacity)
      .attr(
        "transform",
        (d) =>
          `translate(${d.x} ${d.y}) scale(${
            d.scale || 1
          }) translate(${-d.x} ${-d.y})`
      )
      .attr("fill", (d, i) => {
        if (d.glass) {
          return "none";
        } else if (config.solidColor) {
          return config.color;
        } else {
          return config.colors[i % config.colors.length];
        }
      })
      .attr("stroke", (d, i) => {
        if (d.glass) {
          return config.solidColor
            ? config.color
            : config.colors[i % config.colors.length];
        }
        return null;
      })
      .attr("stroke-width", (d) => (d.glass ? 2 : 0))
      .attr("stroke-opacity", config.opacity);

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

      // Handle size changes
      if (newOptions.width !== undefined || newOptions.height !== undefined) {
        width = newOptions.width || width;
        height = newOptions.height || height;

        // Update SVG viewBox
        svg.attr("viewBox", `0 0 ${width} ${height}`);
      }

      // Handle gooey effect toggle
      if (newOptions.gooey !== undefined) {
        if (config.gooey) {
          // Add filter if not exists
          if (defs.select("#gooey").empty()) {
            addGooeyFilter(defs);
          }
          blobGroup.attr("filter", "url(#gooey)");
        } else {
          blobGroup.attr("filter", null);
        }
      }

      // Handle count changes
      if (newOptions.count !== undefined && newOptions.count !== data.length) {
        // Add or remove blobs
        if (newOptions.count > data.length) {
          // Add new blobs
          const newBlobs = Array.from(
            { length: newOptions.count - data.length },
            (_, i) => ({
              id: data.length + i,
              x: width / 2,
              y: height / 2,
              scale: 1,
              glass: (data.length + i) % 5 === 0 && config.showGlass,
            })
          );
          data.push(...newBlobs);
        } else {
          // Remove blobs
          data.splice(newOptions.count);
        }

        // Update DOM
        createBlobs(blobGroup, data, config);
      }

      // Handle glass effect changes
      if (newOptions.showGlass !== undefined) {
        data.forEach((d, i) => {
          d.glass = i % 5 === 0 && config.showGlass;
        });
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

    // Get performance metrics
    getPerformanceMetrics() {
      return {
        fps: fps,
        count: data.length,
      };
    },

    // Destroy animation
    destroy() {
      // Stop animation
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      // Remove SVG
      svg.remove();
    },
  };
}
