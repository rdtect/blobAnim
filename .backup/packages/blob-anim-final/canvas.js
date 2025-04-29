import * as d3 from "d3";

/**
 * Create a new blob animation using D3 forceSimulation and Canvas 2D
 * @param {HTMLElement} container - Container element
 * @param {Object} options - Configuration options
 */
export function createCanvasAnim(container, options = {}) {
  const config = {
    count: options.count || 10,
    size: options.size || 20,
    color: options.color || "#3b82f6",
    colors: options.colors || ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"],
    solidColor: options.solidColor ?? true,
    opacity: options.opacity || 1,
    speed: options.speed || 1,
    state: options.state || "chaos",
    variant: options.variant || "default",
    gooey: options.gooey ?? true,
    scaleEffects: options.scaleEffects ?? true,
  };

  let width = container.clientWidth || 300;
  let height = container.clientHeight || 300;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  container.innerHTML = "";
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  let offscreenCanvas = null;
  let offscreenCtx = null;
  if (config.gooey) {
    offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    offscreenCtx = offscreenCanvas.getContext("2d");
  }

  const data = d3.range(config.count).map((i) => ({
    id: i,
    x: width / 2,
    y: height / 2,
    vx: 0,
    vy: 0,
    scale: 1,
  }));

  let startTime = performance.now();
  function getElapsed() { return (performance.now() - startTime) / 1000; }

  // pattern force generator
  function patternForce(pattern) {
    return function(alpha) {
      const t = getElapsed();
      data.forEach((d, i) => {
        const target = pattern(d, i, t, config.count, width, height);
        d.vx += ((target.x - d.x) * 0.1 * alpha * config.speed);
        d.vy += ((target.y - d.y) * 0.1 * alpha * config.speed);
        d.scale += ((target.scale - d.scale) * 0.1 * alpha * config.speed);
      });
    };
  }

  // define patterns (only chaos.default shown here, add others as needed)
  const patterns = {
    chaos: {
      default: (_, i, time, count, w, h) => {
        const angle = (i/count)*Math.PI*2 + time*0.5;
        const radius = w*0.3;
        const offset = Math.sin(time*2 + i*3)*w*0.05;
        const scale = config.scaleEffects ? 0.8 + Math.sin(time+i)*0.2 : 1;
        return { x: w/2 + Math.cos(angle)*(radius+offset), y: h/2 + Math.sin(angle)*(radius+offset), scale };
      }
    }
    // ... add organizing and structured patterns here
  };

  const activePattern = (patterns[config.state]||patterns.chaos).default;

  function drawCircle(ctx, x, y, radius, color, opacity) {
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function applyGooeyEffect(sourceCanvas, destCtx) {
    destCtx.filter = "blur(10px)";
    destCtx.drawImage(sourceCanvas, 0, 0);
    destCtx.filter = "none";
    destCtx.globalCompositeOperation = "source-over";
    destCtx.drawImage(canvas, 0, 0);
  }

  const simulation = d3.forceSimulation(data)
    .alphaDecay(0)
    .velocityDecay(0.15)
    .force("pattern", patternForce(activePattern))
    .on("tick", render);

  function render() {
    const renderCtx = config.gooey ? offscreenCtx : ctx;
    renderCtx.clearRect(0,0,width,height);
    data.forEach((d,i) => {
      const radius = config.size * (d.scale||1);
      const color = config.solidColor ? config.color : config.colors[i % config.colors.length];
      drawCircle(renderCtx, d.x, d.y, radius, color, config.opacity);
    });
    if (config.gooey) {
      ctx.clearRect(0,0,width,height);
      applyGooeyEffect(offscreenCanvas, ctx);
    }
  }

  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      canvas.width = width;
      canvas.height = height;
      if (offscreenCanvas) { offscreenCanvas.width = width; offscreenCanvas.height = height; }
    }
  });
  resizeObserver.observe(container);

  return {
    update(newOptions) {
      Object.assign(config, newOptions);
      if (newOptions.count !== undefined && newOptions.count !== data.length) {
        simulation.stop();
        const newData = d3.range(config.count).map(i => ({ id:i, x:width/2, y:height/2, vx:0, vy:0, scale:1 }));
        data.length = 0; data.push(...newData);
        simulation.nodes(data).restart();
      }
    },
    pause() { simulation.stop(); },
    resume() { simulation.restart(); },
    destroy() { simulation.stop(); resizeObserver.disconnect(); if (canvas.parentNode) canvas.remove(); }
  };
}
