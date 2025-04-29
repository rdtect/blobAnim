/**
 * BlobAnim - Simplified Version
 *
 * A minimal implementation of the blob animation library.
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
    color: options.color || "#3b82f6",
    colors: options.colors || [
      "#3b82f6",
      "#ef4444",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
    ],
    solidColor: options.solidColor !== undefined ? options.solidColor : true,
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
  let width = container.clientWidth || 400;
  let height = container.clientHeight || 400;

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("overflow", "visible");

  // Create defs for filters
  const defs = svg.append("defs");

  // Generate unique ID for the filter
  const filterId = `gooey-${Math.random().toString(36).substr(2, 9)}`;

  // Add gooey filter if enabled
  if (config.gooey) {
    defs.html(`
      <filter id="${filterId}">
        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
        <feColorMatrix in="blur" mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="gooey" />
        <feBlend in="SourceGraphic" in2="gooey" />
      </filter>
    `);
  }

  // Create group for blobs
  const group = svg.append("g");

  // Apply gooey filter if enabled
  if (config.gooey) {
    group.attr("filter", `url(#${filterId})`);
  }

  // Create data for blobs
  const data = Array.from({ length: config.count }, (_, i) => ({
    id: i,
    x: width / 2,
    y: height / 2,
    scale: 1,
    vx: 0,
    vy: 0,
  }));

  // Create blobs
  let blobs = group
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("r", config.size)
    .attr(
      "fill",
      config.solidColor
        ? config.color
        : (_, i) => config.colors[i % config.colors.length]
    )
    .attr("opacity", config.opacity)
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y);

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

    // Update blob positions and scale
    blobs
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("transform", (d) => `scale(${d.scale || 1})`);

    // Request next frame
    animationFrame = requestAnimationFrame(animate);
  }

  // Start animation
  lastTime = performance.now();
  animationFrame = requestAnimationFrame(animate);

  // Add resize observer
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      svg
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`);
    }
  });
  resizeObserver.observe(container);

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
              vy: 0,
            };
          }
        });

        // Update data array
        data.length = 0;
        data.push(...newData);

        // Update blobs
        blobs.remove();
        blobs = group
          .selectAll("circle")
          .data(data)
          .join("circle")
          .attr("r", config.size)
          .attr(
            "fill",
            config.solidColor
              ? config.color
              : (_, i) => config.colors[i % config.colors.length]
          )
          .attr("opacity", config.opacity)
          .attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y)
          .attr("transform", (d) => `scale(${d.scale || 1})`);
      }

      // Handle size changes
      if (newOptions.size !== undefined) {
        blobs.attr("r", config.size);
      }

      // Handle color changes
      if (
        newOptions.color !== undefined ||
        newOptions.colors !== undefined ||
        newOptions.solidColor !== undefined
      ) {
        blobs.attr(
          "fill",
          config.solidColor
            ? config.color
            : (_, i) => config.colors[i % config.colors.length]
        );
      }

      // Handle opacity changes
      if (newOptions.opacity !== undefined) {
        blobs.attr("opacity", config.opacity);
      }

      // Handle gooey changes
      if (newOptions.gooey !== undefined) {
        if (config.gooey) {
          group.attr("filter", `url(#${filterId})`);
        } else {
          group.attr("filter", null);
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
        animationFrame = null;
      }

      // Disconnect resize observer
      resizeObserver.disconnect();

      // Remove SVG
      svg.remove();
    },
  };
}
