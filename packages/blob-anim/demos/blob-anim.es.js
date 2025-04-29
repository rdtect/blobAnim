class P {
  constructor() {
    this.eventListeners = /* @__PURE__ */ new Map();
  }
  /**
   * Register an event listener
   * @param event Event type to listen for
   * @param callback Function to call when event is emitted
   * @returns Function to remove the listener
   */
  on(t, e) {
    return this.eventListeners.has(t) || this.eventListeners.set(t, []), this.eventListeners.get(t).push(e), () => this.off(t, e);
  }
  /**
   * Remove an event listener
   * @param event Event type
   * @param callback Function to remove
   */
  off(t, e) {
    const s = this.eventListeners.get(t);
    if (s) {
      const i = s.indexOf(e);
      i !== -1 && s.splice(i, 1);
    }
  }
  /**
   * Emit an event with optional data
   * @param event Event type to emit
   * @param data Data to pass to listeners
   */
  emit(t, e) {
    const s = this.eventListeners.get(t);
    s && s.forEach((i) => {
      try {
        i(e);
      } catch (n) {
        console.error(`Error in event handler for ${t}:`, n);
      }
    });
  }
  /**
   * Remove all event listeners
   */
  removeAllListeners() {
    this.eventListeners.clear();
  }
  /**
   * Create DOM event compatible with CustomEvent API for Web Component integration
   * @param type Event type
   * @param data Event data
   * @returns CustomEvent object
   */
  createDOMEvent(t, e) {
    return new CustomEvent(`blob:${t}`, {
      bubbles: !0,
      composed: !0,
      detail: e
    });
  }
}
class E {
  constructor(t, e) {
    this.circles = [], this.lastRenderTime = 0, this.svg = t, this.events = e || new P(), this.defs = this.ensureChild("defs", this.svg), this.group = this.ensureChild("g", this.svg);
  }
  /**
   * Render a frame of the animation
   * @param points Array of points to render
   * @param config Animation configuration
   */
  render(t, e) {
    const s = performance.now();
    this.updateGooeyEffect(e), this.updateGlassEffect(e), this.updateGradient(e), e.gooey ? this.group.setAttribute("filter", "url(#gooey-filter)") : this.group.removeAttribute("filter"), this.updateCirclePool(t.length), this.updateCircleAttributes(t, e);
    const i = performance.now() - s;
    this.lastRenderTime = i, this.events.emit("render", { renderTime: i, pointCount: t.length });
  }
  /**
   * Update the circle pool to match the number of points
   * @param count Number of circles needed
   */
  updateCirclePool(t) {
    for (; this.circles.length > t; ) {
      const e = this.circles.pop();
      e != null && e.parentNode && e.parentNode.removeChild(e);
    }
    for (; this.circles.length < t; ) {
      const e = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      this.group.appendChild(e), this.circles.push(e);
    }
  }
  /**
   * Update circle attributes based on points
   * @param points Array of points
   * @param config Animation configuration
   */
  updateCircleAttributes(t, e) {
    const s = e.size || 20, i = e.colors || ["#000"], n = e.opacity !== void 0 ? e.opacity : 1;
    t.forEach((r, o) => {
      var d;
      const a = this.circles[o];
      a.setAttribute("cx", r.x.toString()), a.setAttribute("cy", r.y.toString()), a.setAttribute("r", (r.radius || s).toString());
      const h = r.color || i[o % i.length];
      a.setAttribute("fill", h);
      const c = r.opacity !== void 0 ? r.opacity : n;
      a.setAttribute("opacity", c.toString()), e.glass && ((d = e.glassBlobs) != null && d.includes(o)) ? a.setAttribute("filter", "url(#glass-filter)") : a.removeAttribute("filter"), e.debug && a.setAttribute("data-index", o.toString());
    });
  }
  /**
   * Create or update radial gradient in defs
   * @param config Animation configuration
   */
  updateGradient(t) {
    var i;
    const e = "blob-gradient";
    let s = this.defs.querySelector(`#${e}`);
    if (t.gradient) {
      if (!s) {
        s = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient"), s.setAttribute("id", e), s.setAttribute("cx", "0.5"), s.setAttribute("cy", "0.5"), s.setAttribute("r", "0.5"), s.setAttribute("gradientUnits", "objectBoundingBox");
        const n = document.createElementNS(s.namespaceURI, "stop");
        n.setAttribute("offset", "0%"), n.setAttribute("stop-color", "white");
        const r = document.createElementNS(s.namespaceURI, "stop");
        r.setAttribute("offset", "100%"), r.setAttribute("stop-color", "rgba(255,255,255,0.5)"), s.appendChild(n), s.appendChild(r), this.defs.appendChild(s);
      }
      if ((i = t.colors) != null && i.length && t.colors.length >= 2) {
        const n = s.querySelectorAll("stop");
        n.length >= 2 && (n[0].setAttribute("stop-color", t.colors[0]), n[1].setAttribute("stop-color", t.colors[t.colors.length - 1]));
      }
    } else
      s && s.remove();
  }
  /**
   * Create or update glass effect filter in defs
   * @param config Animation configuration
   */
  updateGlassEffect(t) {
    const e = "glass-filter", s = this.ensureFilter(e, t.glass);
    if (t.glass && s) {
      for (s.setAttribute("filterUnits", "userSpaceOnUse"), s.setAttribute("x", "0"), s.setAttribute("y", "0"), s.setAttribute("width", "100%"), s.setAttribute("height", "100%"); s.firstChild; )
        s.removeChild(s.firstChild);
      const i = document.createElementNS(s.namespaceURI, "feGaussianBlur");
      i.setAttribute("in", "SourceGraphic"), i.setAttribute("stdDeviation", "2"), i.setAttribute("result", "blur"), s.appendChild(i);
      const n = document.createElementNS(s.namespaceURI, "feSpecularLighting");
      n.setAttribute("in", "blur"), n.setAttribute("surfaceScale", "5"), n.setAttribute("specularConstant", "0.8"), n.setAttribute("specularExponent", "20"), n.setAttribute("lighting-color", "#ffffff"), n.setAttribute("result", "specLight");
      const r = document.createElementNS(s.namespaceURI, "fePointLight");
      r.setAttribute("x", "50"), r.setAttribute("y", "50"), r.setAttribute("z", "200"), n.appendChild(r), s.appendChild(n);
      const o = document.createElementNS(s.namespaceURI, "feComposite");
      o.setAttribute("in", "specLight"), o.setAttribute("in2", "SourceGraphic"), o.setAttribute("operator", "in"), o.setAttribute("result", "specLightIn"), s.appendChild(o);
      const a = document.createElementNS(s.namespaceURI, "feComposite");
      a.setAttribute("in", "SourceGraphic"), a.setAttribute("in2", "specLightIn"), a.setAttribute("operator", "arithmetic"), a.setAttribute("k1", "0"), a.setAttribute("k2", "1"), a.setAttribute("k3", "1"), a.setAttribute("k4", "0"), a.setAttribute("result", "glass"), s.appendChild(a);
      const h = document.createElementNS(s.namespaceURI, "feColorMatrix");
      h.setAttribute("in", "glass"), h.setAttribute("type", "matrix"), h.setAttribute("values", "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.5 0"), s.appendChild(h);
    }
  }
  /**
   * Create or update gooey SVG filter in defs
   * @param config Animation configuration
   */
  updateGooeyEffect(t) {
    const e = "gooey-filter", s = this.ensureFilter(e, t.gooey);
    if (t.gooey && s) {
      for (s.setAttribute("filterUnits", "userSpaceOnUse"), s.setAttribute("x", "0"), s.setAttribute("y", "0"), s.setAttribute("width", "100%"), s.setAttribute("height", "100%"); s.firstChild; )
        s.removeChild(s.firstChild);
      let i = "10";
      t.gooeyIntensity === "light" && (i = "5"), t.gooeyIntensity === "heavy" && (i = "15");
      const n = document.createElementNS(s.namespaceURI, "feGaussianBlur");
      n.setAttribute("in", "SourceGraphic"), n.setAttribute("stdDeviation", i), n.setAttribute("result", "blur"), s.appendChild(n);
      const r = document.createElementNS(s.namespaceURI, "feColorMatrix");
      r.setAttribute("in", "blur"), r.setAttribute("mode", "matrix"), r.setAttribute("values", "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"), r.setAttribute("result", "gooey"), s.appendChild(r);
      const o = document.createElementNS(s.namespaceURI, "feComposite");
      o.setAttribute("in", "SourceGraphic"), o.setAttribute("in2", "gooey"), o.setAttribute("operator", "atop"), s.appendChild(o);
    }
  }
  /**
   * Ensure a filter element exists or is removed
   * @param id Filter ID
   * @param shouldExist Whether the filter should exist
   * @returns The filter element if it should exist, null otherwise
   */
  ensureFilter(t, e = !0) {
    let s = this.defs.querySelector(`#${t}`);
    return e ? (s || (s = document.createElementNS("http://www.w3.org/2000/svg", "filter"), s.setAttribute("id", t), this.defs.appendChild(s)), s) : (s && s.remove(), null);
  }
  /**
   * Ensure an SVG element exists as a child of the specified parent
   * @param tag SVG element tag name
   * @param parent Parent SVG element
   * @returns The child SVG element
   */
  ensureChild(t, e) {
    let s = e.querySelector(t);
    return s || (s = document.createElementNS("http://www.w3.org/2000/svg", t), e.appendChild(s)), s;
  }
  /**
   * Get the last render time in milliseconds
   * @returns Render time in ms
   */
  getRenderTime() {
    return this.lastRenderTime;
  }
  /**
   * Clean up any resources used by the renderer
   */
  dispose() {
    for (this.circles.forEach((t) => {
      t.parentNode && t.parentNode.removeChild(t);
    }), this.circles = []; this.group.firstChild; )
      this.group.removeChild(this.group.firstChild);
    for (; this.defs.firstChild; )
      this.defs.removeChild(this.defs.firstChild);
  }
}
class _ {
  constructor(t) {
    this.transitionActive = !1, this.transitionProgress = 0, this.sourceConfig = {}, this.sourcePoints = [], this.targetPoints = [], this.targetConfig = { ...t }, this.transitionDuration = t.transitionDuration || 1e3;
  }
  /**
   * Start a transition from current to new configuration
   * @param source Current configuration
   * @param target Target configuration
   * @param duration Transition duration in ms
   */
  startTransition(t, e, s) {
    this.transitionActive && this.transitionProgress > 0 && this.transitionProgress < 1 ? this.sourceConfig = { ...this.getCurrentConfig() } : this.sourceConfig = { ...t }, this.targetConfig = { ...e }, this.transitionDuration = this.calculateDuration(t, e) || s || e.transitionDuration || 1e3, this.transitionProgress = 0, this.transitionActive = !0;
  }
  /**
   * Set source and target points for interpolation
   * @param source Current points
   * @param target Target points 
   */
  setPoints(t, e) {
    this.sourcePoints = t.map((s) => ({ ...s })), this.targetPoints = e.map((s) => ({ ...s }));
  }
  /**
   * Update the transition progress
   * @param deltaTimeMs Delta time in milliseconds
   * @returns true if transition is still in progress
   */
  update(t) {
    if (!this.transitionActive)
      return !1;
    const e = t / this.transitionDuration;
    return this.transitionProgress += e, this.transitionProgress >= 1 ? (this.transitionProgress = 1, this.transitionActive = !1, !1) : !0;
  }
  /**
   * Get the current interpolated configuration
   * @returns Interpolated configuration
   */
  getCurrentConfig() {
    if (!this.transitionActive || this.transitionProgress >= 1)
      return this.targetConfig;
    const t = this.easeInOutCubic(this.transitionProgress), e = { ...this.targetConfig };
    return [
      "count",
      "size",
      "opacity",
      "speed",
      "chaosAmount",
      "sizeFactor"
    ].forEach((i) => {
      const n = this.sourceConfig[i], r = this.targetConfig[i];
      n !== void 0 && r !== void 0 && typeof n == "number" && typeof r == "number" && (e[i] = n + (r - n) * t);
    }), e;
  }
  /**
   * Get interpolated points based on transition progress
   * @returns Interpolated points array
   */
  getInterpolatedPoints() {
    if (!this.transitionActive || this.transitionProgress >= 1 || this.sourcePoints.length === 0)
      return this.targetPoints;
    const t = this.easeInOutCubic(this.transitionProgress), e = this.sourcePoints.length, s = this.targetPoints.length, i = Math.max(e, s), n = [];
    for (let r = 0; r < i; r++) {
      const o = this.sourcePoints[r % e], a = this.targetPoints[r % s], h = {
        x: o.x + (a.x - o.x) * t,
        y: o.y + (a.y - o.y) * t
      };
      o.radius !== void 0 && a.radius !== void 0 && (h.radius = o.radius + (a.radius - o.radius) * t), o.opacity !== void 0 && a.opacity !== void 0 && (h.opacity = o.opacity + (a.opacity - o.opacity) * t), n.push(h);
    }
    return n;
  }
  /**
   * Check if a transition is currently active
   * @returns true if a transition is in progress
   */
  isTransitioning() {
    return this.transitionActive;
  }
  /**
   * Get current transition progress (0-1)
   * @returns Transition progress value
   */
  getProgress() {
    return this.transitionProgress;
  }
  /**
   * Calculate appropriate transition duration based on the difference between configs
   * @param from Source configuration
   * @param to Target configuration
   * @returns Calculated transition duration in ms
   */
  calculateDuration(t, e) {
    const s = Math.abs((t.count || 0) - (e.count || 0)) / Math.max(t.count || 1, e.count || 1), i = Math.abs((t.size || 0) - (e.size || 0)) / Math.max(t.size || 1, e.size || 1), n = Math.abs((t.amplitude || 0) - (e.amplitude || 0)) / Math.max(t.amplitude || 1, e.amplitude || 1), r = t.state !== e.state || t.variant !== e.variant ? 1 : 0, o = 500, a = 2e3, h = Math.min(s + i + n, 1) + r;
    return o + h * a;
  }
  /**
   * Cubic easing function for smoother transitions
   * @param t Progress value (0-1)
   * @returns Eased value
   */
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}
class S {
  constructor(t, e, s) {
    this.lastPoints = [], this.animate = (i) => {
      const n = i || performance.now();
      let r = 0.016;
      this.state.previousTime && (r = (n - this.state.previousTime) / 1e3, r = Math.min(r, 0.1)), this.state.previousTime = n, this.config.paused || (this.state.time += r * (this.config.speed || 1), this.state.deltaTime = r, this.update()), this.updateFPS(r), this.animationFrameId = requestAnimationFrame(this.animate);
    }, this.events = new P(), this.config = { ...e }, this.state = { data: [], time: 0, fps: 60 }, this.renderer = new E(t, this.events), this.pattern = s, this.transition = new _(this.config), this.pattern.initialize(this.config), this.update();
  }
  /**
   * Start the animation loop
   */
  start() {
    this.animationFrameId && this.stop(), this.config.paused = !1, this.events.emit("start"), this.animate(performance.now());
  }
  /**
   * Stop the animation loop
   */
  stop() {
    this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = void 0, this.events.emit("stop"));
  }
  /**
   * Pause the animation (keeps the animation loop running but freezes updates)
   */
  pause() {
    this.config.paused || (this.config.paused = !0, this.events.emit("pause"));
  }
  /**
   * Resume the animation from paused state
   */
  resume() {
    this.config.paused && (this.config.paused = !1, this.events.emit("resume"), this.state.previousTime = performance.now());
  }
  /**
   * Update animation configuration
   * @param newConfig New configuration to apply
   */
  updateConfig(t) {
    const e = { ...this.config }, s = { ...this.config, ...t };
    this.config = s, t.count !== void 0 && t.count !== e.count && this.pattern.initialize(this.config), this.shouldTransition(e, s) && this.transition.startTransition(e, s), this.update(), this.events.emit("configChange", {
      previous: e,
      current: this.config
    });
  }
  /**
   * Replace the current pattern with a new one
   * @param pattern New pattern to use
   */
  setPattern(t) {
    const e = this.pattern, s = e.constructor.name, i = t.constructor.name;
    e.dispose(), this.pattern = t, this.pattern.initialize(this.config), this.transition = new _(this.config), this.events.emit("patternChange", {
      previous: s,
      current: i
    }), this.update();
  }
  /**
   * Subscribe to animation events
   * @param event Event type to listen for
   * @param callback Function to call when event occurs
   * @returns Function to unsubscribe
   */
  on(t, e) {
    return this.events.on(t, e);
  }
  /**
   * Get performance metrics
   * @returns Object with FPS
   */
  getPerformanceMetrics() {
    return { fps: this.state.fps || 60 };
  }
  /**
   * Update animation state and render
   */
  update() {
    this.pattern.update(this.config, this.state);
    const t = this.pattern.generatePoints(this.config, this.state);
    this.lastPoints = t, this.renderer.render(t, this.config);
  }
  /**
   * Update FPS calculation
   * @param deltaTime Time since last frame in seconds
   */
  updateFPS(t) {
    if (t > 0) {
      const e = 1 / t, s = 0.1;
      this.state.fps = this.state.fps ? this.state.fps * (1 - s) + e * s : e;
    }
  }
  /**
   * Check if configuration changes warrant a transition
   * @param prevConfig Previous configuration
   * @param newConfig New configuration
   * @returns True if transition is needed
   */
  shouldTransition(t, e) {
    return [
      "count",
      "size",
      "variant",
      "state",
      "chaosAmount",
      "sizeFactor"
    ].some((i) => t[i] !== e[i]);
  }
  /**
   * Clean up resources
   */
  dispose() {
    this.stop(), this.pattern.dispose(), this.renderer.dispose(), this.events.removeAllListeners();
  }
}
class v {
  constructor() {
    this.frequencies = [], this.phases = [], this.radii = [], this.velocities = [], this.initialized = !1;
  }
  /**
   * Initialize pattern with config
   * This is called when the pattern is first created or when key properties change
   * @param config Animation configuration
   */
  initialize(t) {
    this.initialized = !0;
  }
  /**
   * Update pattern state without generating points
   * This is useful for patterns that need to update internal state before generating points
   * @param config Animation configuration
   * @param state Current animation state
   */
  update(t, e) {
  }
  /**
   * Clean up pattern resources
   */
  dispose() {
    this.frequencies = [], this.phases = [], this.radii = [], this.velocities = [], this.initialized = !1;
  }
}
const p = {
  center: (l, t) => ({ x: l / 2, y: t / 2 }),
  indexToAngle: (l, t, e = 0) => 2 * Math.PI * l / t + e,
  polarToCartesian: (l, t, e, s) => ({
    x: l + Math.cos(s) * e,
    y: t + Math.sin(s) * e
  })
};
class z extends v {
  /**
   * Initialize pattern with configuration values
   * @param config Animation configuration
   */
  initialize(t) {
    super.initialize(t);
    const e = t.count || 5;
    this.frequencies = Array.from({ length: e }, (s, i) => 0.5 + i / e * 0.7 + (t.randomSeed || 0.5) * 0.3), this.phases = Array.from({ length: e }, (s, i) => i * Math.PI * 0.5 + (t.randomSeed || 0.5) * Math.PI), this.radii = Array.from({ length: e }, () => 0);
  }
  /**
   * Generate blob points using optimized calculations
   * @param config Animation configuration
   * @param state Current animation state
   * @returns Array of points with x,y coordinates
   */
  generatePoints(t, e) {
    const s = t.count || 5, i = t.width || 200, n = t.height || 200, r = p.center(i, n), o = Math.min(i, n) / 2 * (t.sizeFactor || 1) * 0.8, a = t.chaosAmount || 1;
    this.frequencies.length !== s && this.initialize(t);
    const h = [];
    for (let c = 0; c < s; ++c) {
      const d = p.indexToAngle(c, s);
      this.frequencies[c];
      const f = this.phases[c], u = Math.sin(e.time * (t.speed || 1) + f) * a * o * 0.5, g = o + u;
      this.radii[c] = g;
      const b = p.polarToCartesian(r.x, r.y, g, d);
      b.radius = t.size, t.colors && t.colors.length > 0 && (b.color = t.colors[c % t.colors.length]), h.push(b);
    }
    return h;
  }
}
class I extends v {
  initialize(t) {
    super.initialize(t);
    const e = t.count || 5;
    this.frequencies = Array.from({ length: e }, (s, i) => 0.5 + i * 0.1), this.phases = Array.from({ length: e }, (s, i) => i * 3);
  }
  generatePoints(t, e) {
    const s = t.count || 5, i = t.width || 200, n = t.height || 200, r = p.center(i, n), o = i * 0.3, a = t.speed || 1;
    this.frequencies.length !== s && this.initialize(t);
    const h = [];
    for (let c = 0; c < s; ++c) {
      const d = p.indexToAngle(c, s, e.time * 0.5 * a), f = Math.sin(e.time * 2 * a + this.phases[c]) * i * 0.05, u = p.polarToCartesian(r.x, r.y, o + f, d);
      u.radius = t.size, t.colors && t.colors.length > 0 && (u.color = t.colors[c % t.colors.length]), h.push(u);
    }
    return h;
  }
}
class R extends v {
  initialize(t) {
    super.initialize(t);
    const e = t.count || 5;
    this.frequencies = Array.from({ length: e }, (s, i) => 0.5 + i / e * 2 + (t.randomSeed || 0) * 0.5), this.phases = Array.from({ length: e }, (s, i) => i * 3.7 + (t.randomSeed || 0) * Math.PI);
  }
  generatePoints(t, e) {
    const s = t.count || 5, i = t.width || 200, n = t.height || 200, r = p.center(i, n), o = t.speed || 1;
    this.frequencies.length !== s && this.initialize(t);
    const a = [];
    for (let h = 0; h < s; ++h) {
      const c = this.frequencies[h], d = this.phases[h], f = Math.sin(e.time * c * o + d) * Math.sin(e.time * 0.4 * o + h * 2), u = Math.cos(e.time * c * o + d) * Math.sin(e.time * 0.3 * o + h * 1.5), g = 0.9, b = Math.sin(e.time * 0.2 + h * 5) > g ? Math.sin(e.time * 5) * i * 0.08 : 0, A = Math.cos(e.time * 0.2 + h * 5) > g ? Math.cos(e.time * 5) * n * 0.08 : 0, y = {
        x: r.x + f * i * 0.4 + b,
        y: r.y + u * n * 0.4 + A,
        radius: t.size
      };
      t.colors && t.colors.length > 0 && (y.color = t.colors[h % t.colors.length]), a.push(y);
    }
    return a;
  }
}
class T extends v {
  initialize(t) {
    super.initialize(t);
    const e = t.count || 5;
    this.phases = Array.from({ length: e }, (s, i) => i);
  }
  generatePoints(t, e) {
    const s = t.count || 5, i = t.width || 200, n = t.height || 200, r = p.center(i, n), o = t.speed || 1;
    this.phases.length !== s && this.initialize(t);
    const a = [];
    for (let h = 0; h < s; ++h) {
      const c = p.indexToAngle(h, s, e.time * 0.5 * o), d = h / s * i * 0.25 + i * 0.05, f = Math.sin(e.time * 2 * o + this.phases[h]) * i * 0.02, u = p.polarToCartesian(r.x, r.y, d + f, c);
      u.radius = t.size, t.colors && t.colors.length > 0 && (u.color = t.colors[h % t.colors.length]), a.push(u);
    }
    return a;
  }
}
class O extends v {
  generatePoints(t, e) {
    const s = t.count || 5, i = t.width || 200, n = t.height || 200, r = p.center(i, n), o = t.speed || 1, a = [], h = e.time * 2 * o, c = (0.2 + Math.sin(h) * 0.1) * i;
    for (let d = 0; d < s; ++d) {
      const f = p.indexToAngle(d, s), u = p.polarToCartesian(r.x, r.y, c, f);
      u.radius = t.size, t.colors && t.colors.length > 0 && (u.color = t.colors[d % t.colors.length]), a.push(u);
    }
    return a;
  }
}
class N extends v {
  initialize(t) {
    super.initialize(t);
    const e = t.count || 5;
    this.velocities = Array.from({ length: e }, () => ({ x: 0, y: 0 })), this.phases = Array.from({ length: e }, (s, i) => i * 1.618033988749895);
  }
  update(t, e) {
    if (!this.initialized || this.velocities.length !== (t.count || 5)) {
      this.initialize(t);
      return;
    }
    const s = e.deltaTime || 0.016, i = t.speed || 1;
    for (let n = 0; n < this.velocities.length; n++) {
      const r = this.phases[n], o = e.time;
      this.velocities[n].x += (Math.sin(o * 7 + r * 13) * 2 - 1) * i * s * 50, this.velocities[n].y += (Math.cos(o * 5 + r * 7) * 2 - 1) * i * s * 50, this.velocities[n].x *= 0.98, this.velocities[n].y *= 0.98;
    }
  }
  generatePoints(t, e) {
    const s = t.count || 5, i = t.width || 200, n = t.height || 200, r = p.center(i, n);
    this.velocities.length !== s && this.initialize(t);
    const o = [], a = Math.min(i, n) * 0.4;
    for (let h = 0; h < s; ++h) {
      const c = this.phases[h], d = Math.sin(e.time * 0.3 + c) + Math.sin(e.time * 0.7 + c * 2) * 0.5 + Math.sin(e.time * 1.1 + c * 3) * 0.25, f = Math.cos(e.time * 0.4 + c) + Math.cos(e.time * 0.6 + c * 2) * 0.5 + Math.cos(e.time * 1.3 + c * 3) * 0.25, u = {
        x: r.x + d * (i * 0.3),
        y: r.y + f * (n * 0.3),
        radius: t.size,
        velocity: this.velocities[h]
      }, g = u.x - r.x, b = u.y - r.y, A = Math.sqrt(g * g + b * b);
      if (A > a) {
        const y = a / A;
        u.x = r.x + g * y, u.y = r.y + b * y;
      }
      t.colors && t.colors.length > 0 && (u.color = t.colors[h % t.colors.length]), o.push(u);
    }
    return o;
  }
}
const q = {
  default: z,
  orbital: I,
  true: R,
  spiral: T,
  explosion: O,
  brownian: N
};
class M extends v {
  constructor() {
    super(...arguments), this.frequencies = [], this.phases = [], this.basePoints = [], this.centerX = 0, this.centerY = 0, this.targetPoints = [];
  }
  /**
   * Initialize pattern with configuration
   * Precomputes values for animation efficiency
   */
  initialize(t) {
    super.initialize(t), this.centerX = t.width / 2, this.centerY = t.height / 2, this.frequencies = Array.from(
      { length: t.count },
      (e, s) => 0.3 + s / t.count * 1.2 + (t.randomSeed || 0) * 0.2
    ), this.phases = Array.from(
      { length: t.count },
      (e, s) => Math.random() * Math.PI * 2
    ), this.basePoints = this.generateBasePoints(t), this.targetPoints = this.generateTargetPoints(t);
  }
  /**
   * Generate points based on the current state and configuration
   * Using deltaTime for frame-rate independence
   */
  generatePoints(t, e) {
    this.frequencies.length !== t.count && this.initialize(t);
    const s = e.deltaTime || 0.016, i = Math.min(1, (e.time || 0) / 5);
    return this.basePoints.map((n, r) => {
      const o = this.targetPoints[r], a = Math.sin(e.time * this.frequencies[r] + this.phases[r]) * t.amplitude * (1 - i * 0.8), h = n.x * (1 - i) + o.x * i + a * (t.directionX || 1) * s * 60, c = n.y * (1 - i) + o.y * i + a * (t.directionY || 1) * s * 60;
      return {
        x: h,
        y: c,
        radius: n.radius,
        color: n.color,
        // Increase opacity as they organize
        opacity: Math.min(1, n.opacity || 0.8) * (0.5 + 0.5 * i)
      };
    });
  }
  /**
   * Generate initial random positions
   */
  generateBasePoints(t) {
    return Array.from({ length: t.count }, (e, s) => ({
      x: Math.random() * t.width,
      y: Math.random() * t.height,
      radius: (t.minRadius || 2) + Math.random() * ((t.maxRadius || 8) - (t.minRadius || 2)),
      color: t.colors ? t.colors[s % t.colors.length] : void 0,
      opacity: 0.5 + Math.random() * 0.5,
      seed: Math.random()
    }));
  }
  /**
   * Generate target positions for organized state
   */
  generateTargetPoints(t) {
    const e = [], s = Math.min(t.width, t.height) * 0.4;
    for (let i = 0; i < t.count; i++) {
      const n = i / t.count * Math.PI * 2, r = this.centerX + Math.cos(n) * s, o = this.centerY + Math.sin(n) * s;
      e.push({
        x: r,
        y: o,
        radius: (t.minRadius || 2) + Math.random() * ((t.maxRadius || 8) - (t.minRadius || 2)),
        color: t.colors ? t.colors[i % t.colors.length] : void 0,
        opacity: 0.8 + Math.random() * 0.2
      });
    }
    return e;
  }
  /**
   * Clean up resources
   */
  dispose() {
    this.frequencies = [], this.phases = [], this.basePoints = [], this.targetPoints = [];
  }
}
const F = {
  default: M
  // Add other organizing patterns here if needed
};
class x extends v {
  constructor() {
    super(...arguments), this.gridPoints = [], this.frequencies = [], this.phases = [];
  }
  /**
   * Initialize pattern with configuration
   * Precomputes values for animation efficiency
   */
  initialize(t) {
    super.initialize(t), this.frequencies = Array.from(
      { length: t.count },
      (e, s) => 0.2 + s / t.count * 0.8 + (t.randomSeed || 0) * 0.1
    ), this.phases = Array.from(
      { length: t.count },
      (e, s) => Math.random() * Math.PI * 2
    ), this.gridPoints = this.generateGridPoints(t);
  }
  /**
   * Generate points based on the current state and configuration
   * Using deltaTime for frame-rate independence
   */
  generatePoints(t, e) {
    this.gridPoints.length !== t.count && this.initialize(t);
    const s = e.deltaTime || 0.016;
    return this.gridPoints.map((i, n) => {
      const r = Math.sin(e.time * this.frequencies[n] + this.phases[n]) * (t.amplitude || 10) * 0.3, o = Math.cos(e.time * this.frequencies[n] + this.phases[n] * 1.3) * (t.amplitude || 10) * 0.3;
      return {
        x: i.x + r * s * 60,
        y: i.y + o * s * 60,
        radius: i.radius,
        color: i.color,
        opacity: i.opacity
      };
    });
  }
  /**
   * Generate grid-based pattern points
   */
  generateGridPoints(t) {
    const e = [], s = Math.ceil(Math.sqrt(t.count)), i = Math.ceil(t.count / s), n = t.width / s, r = t.height / i;
    for (let o = 0; o < t.count; o++) {
      const a = o % s, h = Math.floor(o / s), c = (Math.random() * 0.4 + 0.3) * n, d = (Math.random() * 0.4 + 0.3) * r;
      e.push({
        x: a * n + c,
        y: h * r + d,
        radius: (t.minRadius || 3) + Math.random() * ((t.maxRadius || 6) - (t.minRadius || 3)),
        color: t.colors ? t.colors[o % t.colors.length] : void 0,
        opacity: 0.7 + Math.random() * 0.3,
        seed: Math.random()
      });
    }
    return e;
  }
  /**
   * Clean up resources
   */
  dispose() {
    this.gridPoints = [], this.frequencies = [], this.phases = [];
  }
}
const L = {
  default: x
  // Add other structured patterns here if needed
}, U = {
  states: {
    chaos: { patterns: q },
    organizing: { patterns: F },
    structured: { patterns: L }
  }
}, G = {
  chaos: z,
  organizing: M,
  structured: x
}, m = {
  numeric: {
    count: "count",
    size: "size",
    speed: "speed",
    width: "width",
    height: "height",
    sizefactor: "sizeFactor",
    opacity: "opacity",
    chaosamount: "chaosAmount",
    amplitude: "amplitude"
  },
  boolean: {
    gooey: "gooey",
    scaleeffects: "scaleEffects",
    glass: "glass",
    gradient: "gradient",
    debug: "debug"
  },
  json: {
    colors: "colors",
    glassblobs: "glassBlobs"
  },
  string: {
    state: "state",
    variant: "variant",
    container: "container",
    color: "colors",
    "gooey-intensity": "gooeyIntensity"
  }
};
function w(l, t) {
  if (m.numeric[l]) {
    const e = parseFloat(t), s = m.numeric[l];
    return isNaN(e) ? null : s === "opacity" ? { [s]: Math.min(Math.max(e, 0), 1) } : { [s]: e };
  }
  if (m.boolean[l]) {
    const e = m.boolean[l], s = t === "" || t === "true" || t === "1";
    return { [e]: s };
  }
  if (m.json[l]) {
    const e = m.json[l];
    try {
      const s = JSON.parse(t);
      if (Array.isArray(s))
        return { [e]: s };
    } catch {
      const s = t.split(",").map((i) => i.trim()).filter((i) => i);
      if (s.length > 0)
        return { [e]: s };
    }
    return null;
  }
  if (m.string[l]) {
    const e = m.string[l];
    return l === "color" ? { [e]: [t] } : { [e]: t };
  }
  return null;
}
class C extends HTMLElement {
  constructor() {
    super(), this._needsVisualUpdate = !1, this._resizeObserver = null, this._visibilityObserver = null, this._legacyResizeListener = !1, this._wasHidden = !1, this._isInitialized = !1, this._container = document.createElement("div"), this._container.style.cssText = "width:100%;height:100%;overflow:hidden;", this.attachShadow({ mode: "open" }).appendChild(this._container), this.setupResizeHandling(), this._config = {}, this._anim = null, this._needsVisualUpdate = !1;
  }
  static get observedAttributes() {
    return Object.keys(m.numeric).concat(Object.keys(m.boolean)).concat(Object.keys(m.string)).concat(Object.keys(m.json));
  }
  /**
   * Setup resize handling with appropriate fallbacks
   */
  setupResizeHandling() {
    typeof ResizeObserver < "u" ? (this._resizeObserver = new ResizeObserver(this.handleResize.bind(this)), this._resizeObserver.observe(this)) : (window.addEventListener("resize", this.handleResize.bind(this)), this._legacyResizeListener = !0);
  }
  /**
   * Handle element resize
   */
  handleResize(t) {
    let e, s;
    if (t && t.length) {
      const i = t[0];
      e = i.contentRect.width, s = i.contentRect.height;
    } else
      e = this.clientWidth, s = this.clientHeight;
    e > 0 && s > 0 && this.resize(e, s);
  }
  connectedCallback() {
    this.isConnected && (C.observedAttributes.forEach((t) => {
      const e = this.getAttribute(t);
      if (e !== null) {
        const s = w(t, e);
        s && Object.assign(this._config, s);
      }
    }), this._needsVisualUpdate = !0, this.update(), this._anim && this.setupEventForwarding(), this._startVisibilityObserver(), this._isInitialized = !0);
  }
  disconnectedCallback() {
    this._cleanupResources(), this._wasHidden = !0, this._isInitialized = !1;
  }
  /**
   * Called when the element is moved to a new document
   */
  adoptedCallback() {
    this._cleanupResources(), this._isInitialized = !1, this.isConnected && this.connectedCallback();
  }
  attributeChangedCallback(t, e, s) {
    if (e !== s) {
      const i = w(t, s);
      i && (Object.assign(this._config, i), this.update());
    }
  }
  /**
   * Start visibility observer to pause animations when not visible
   */
  _startVisibilityObserver() {
    typeof IntersectionObserver < "u" && (this._visibilityObserver = new IntersectionObserver((t) => {
      const e = t[0].isIntersecting;
      e && this._wasHidden && this._anim ? (this._anim.resume(), this._wasHidden = !1, this.dispatchEvent(new CustomEvent("blob:visible"))) : !e && this._anim && !this._wasHidden && (this._anim.pause(), this._wasHidden = !0, this.dispatchEvent(new CustomEvent("blob:hidden")));
    }), this._visibilityObserver.observe(this));
  }
  /**
   * Clean up all resources used by the component
   */
  _cleanupResources() {
    this._anim && (this._anim.stop(), this._anim = null), this._resizeObserver && (this._resizeObserver.disconnect(), this._resizeObserver = null), this._visibilityObserver && (this._visibilityObserver.disconnect(), this._visibilityObserver = null), this._legacyResizeListener && (window.removeEventListener("resize", this.handleResize.bind(this)), this._legacyResizeListener = !1);
  }
  /**
   * Setup event forwarding from internal engine to DOM events
   */
  setupEventForwarding() {
    this._anim && (this._anim.on("start", () => {
      this.dispatchEvent(new CustomEvent("blob:start"));
    }), this._anim.on("stop", () => {
      this.dispatchEvent(new CustomEvent("blob:stop"));
    }), this._anim.on("pause", () => {
      this.dispatchEvent(new CustomEvent("blob:pause"));
    }), this._anim.on("resume", () => {
      this.dispatchEvent(new CustomEvent("blob:resume"));
    }), this._anim.on("configChange", (t) => {
      this.dispatchEvent(new CustomEvent("blob:configChange", { detail: t }));
    }));
  }
  /**
   * Get pattern class based on state and variant
   * @param state Animation state
   * @param variant Variant within state
   * @returns Pattern class constructor
   */
  getPatternClass(t, e) {
    const s = t || "chaos", i = e || "default", n = U.states[s];
    return n ? n.patterns[i] || n.patterns.default : (console.error(`Unknown animation state: ${s}`), G.chaos);
  }
  /**
   * Update the animation config and/or pattern.
   * @param newConfig Partial config to merge
   */
  update(t = {}) {
    if (Object.assign(this._config, t), !this._anim && this._needsVisualUpdate) {
      this._initializeEngine();
      return;
    }
    if (this._anim) {
      if (t.state || t.variant) {
        const e = this._config.state || "chaos", s = this._config.variant || "default", i = this.getPatternClass(e, s);
        this._anim.setPattern(new i());
      }
      this._anim.updateConfig(this._config);
    } else
      this._needsVisualUpdate = !0;
  }
  /**
   * Initialize the animation engine
   */
  _initializeEngine() {
    const t = "http://www.w3.org/2000/svg", e = document.createElementNS(t, "svg"), s = this._config.width || this._container.clientWidth || 300, i = this._config.height || this._container.clientHeight || 150;
    e.setAttribute("width", s.toString()), e.setAttribute("height", i.toString()), this._container.innerHTML = "", this._container.appendChild(e);
    const n = this._config.state || "chaos", r = this._config.variant || "default", o = this.getPatternClass(n, r);
    this._anim = new S(e, this._config, new o()), this._anim.start(), this._needsVisualUpdate = !1, this.setupEventForwarding();
  }
  /**
   * Resize the animation SVG.
   */
  resize(t, e) {
    this._config.width = t, this._config.height = e;
    const s = this._container.querySelector("svg");
    s && (s.setAttribute("width", t.toString()), s.setAttribute("height", e.toString())), this.update();
  }
  /**
   * Pause the animation
   */
  pause() {
    this._anim && this._anim.pause();
  }
  /**
   * Resume the animation
   */
  resume() {
    this._anim && this._anim.resume();
  }
  /**
   * Get performance metrics
   * @returns Object with FPS
   */
  getPerformanceMetrics() {
    return this._anim ? this._anim.getPerformanceMetrics() : { fps: 0 };
  }
  /**
   * Destroy the animation and clean up resources.
   */
  destroy() {
    this._cleanupResources(), this._container.innerHTML = "", this._isInitialized = !1;
  }
}
typeof window < "u" && typeof customElements < "u" && !customElements.get("blob-element") && customElements.define("blob-element", C);
const D = {
  count: 5,
  size: 20,
  colors: ["#3b82f6"],
  opacity: 1,
  speed: 1,
  state: "chaos",
  variant: "default",
  gooey: !0,
  gooeyIntensity: "medium",
  scaleEffects: !0,
  glass: !1,
  glassBlobs: [],
  chaosAmount: 1,
  sizeFactor: 1,
  transitionDuration: 1e3,
  debug: !1,
  gradient: !1,
  randomSeed: 0.5,
  paused: !1
};
export {
  U as ANIMATION_CONFIG,
  S as BlobAnimEngine,
  C as BlobElement,
  v as BlobPattern,
  E as BlobRenderer,
  z as ChaosPattern,
  D as DEFAULT_CONFIG,
  P as EventEmitter,
  M as OrganizingPattern,
  G as PatternRegistry,
  x as StructuredPattern,
  _ as TransitionManager
};
//# sourceMappingURL=blob-anim.es.js.map
