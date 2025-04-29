import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function createAnim(container, options = {}) {
  const config = {
    count: options.count || 10,
    size: options.size || 20,
    color: options.color || "#3b82f6",
    opacity: options.opacity || 1,
    speed: options.speed || 1,
    state: options.state || "chaos",
    variant: options.variant || "default",
    gooey: options.gooey !== undefined ? options.gooey : true,
    scaleEffects:
      options.scaleEffects !== undefined ? options.scaleEffects : true,
    width: options.width || container.clientWidth || 400,
    height: options.height || container.clientHeight || 400,
  };

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${config.width} ${config.height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const defs = svg.append("defs");

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

  const group = svg.append("g");
  if (config.gooey) {
    group.attr("filter", "url(#gooey)");
  }

  const data = Array.from({ length: config.count }, (_, i) => ({
    id: i,
    x: config.width / 2,
    y: config.height / 2,
    scale: 1,
  }));

  let blobs = group
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("r", config.size)
    .attr("fill", config.color)
    .attr("opacity", config.opacity)
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y);

  let animationFrame = null;
  let lastTime = performance.now();
  let elapsedTime = 0;

  const pattern = (_, i, t, count, w, h) => {
    const angle = (i / count) * Math.PI * 2 + t * 0.5;
    const radius = w * 0.3;
    const offset = Math.sin(t * 2 + i * 3) * w * 0.05;
    const scale = config.scaleEffects ? 0.8 + Math.sin(t + i) * 0.2 : 1;
    return {
      x: w / 2 + Math.cos(angle) * (radius + offset),
      y: h / 2 + Math.sin(angle) * (radius + offset),
      scale,
    };
  };

  function animate(timestamp) {
    const delta = timestamp - lastTime;
    lastTime = timestamp;
    elapsedTime += delta / 1000;

    data.forEach((d, i) => {
      const target = pattern(
        d,
        i,
        elapsedTime,
        config.count,
        config.width,
        config.height
      );
      d.x += (target.x - d.x) * 0.1 * config.speed;
      d.y += (target.y - d.y) * 0.1 * config.speed;
      d.scale += (target.scale - d.scale) * 0.1 * config.speed;
    });

    blobs
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("transform", (d) => `scale(\${d.scale})`);

    animationFrame = requestAnimationFrame(animate);
  }

  animationFrame = requestAnimationFrame(animate);

  return {
    update(newOptions) {
      Object.assign(config, newOptions);
      if (newOptions.count !== undefined) {
        const newData = Array.from(
          { length: config.count },
          (_, i) =>
            data[i] || {
              id: i,
              x: config.width / 2,
              y: config.height / 2,
              scale: 1,
            }
        );
        data.length = 0;
        data.push(...newData);
        blobs = group
          .selectAll("circle")
          .data(data)
          .join("circle")
          .attr("r", config.size)
          .attr("fill", config.color)
          .attr("opacity", config.opacity);
      }
    },
    pause() {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    },
    resume() {
      if (!animationFrame) {
        lastTime = performance.now();
        animationFrame = requestAnimationFrame(animate);
      }
    },
    destroy() {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      svg.remove();
    },
  };
}
