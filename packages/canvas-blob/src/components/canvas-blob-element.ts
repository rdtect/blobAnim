import { CanvasBlobEngine } from "../core/CanvasBlobEngine";
import { BlobAnimConfig } from "../core/types";
import { BlobPattern } from "../patterns/BlobPattern";
import { BlobPoint } from "../core/types";

// Fixed pattern class that implements BlobPattern interface
export class DummyPattern implements BlobPattern {
  // Add required points array
  protected points: BlobPoint[] = [];

  initialize(config: BlobAnimConfig) {
    // Initialize points based on count
    this.points = Array.from({ length: config.count }, (_, i) => {
      const angle = (i / config.count) * Math.PI * 2;
      return {
        x: Math.cos(angle) * 100 + (config.width || 400) / 2,
        y: Math.sin(angle) * 100 + (config.height || 400) / 2,
        radius: config.size,
        color: config.colors[i % config.colors.length],
      };
    });
  }

  getPoints(time: number, config: BlobAnimConfig) {
    // Simple orbiting animation
    return this.points.map((point, i) => {
      const angle = (i / config.count) * Math.PI * 2 + time * config.speed;
      return {
        ...point,
        x: Math.cos(angle) * 100 + (config.width || 400) / 2,
        y: Math.sin(angle) * 100 + (config.height || 400) / 2,
      };
    });
  }

  dispose() {
    // Cleanup if needed
    this.points = [];
  }
}

/**
 * CanvasBlobElement - Web Component for blob animations using Canvas
 */
export class CanvasBlobElement extends HTMLElement {
  private engine: CanvasBlobEngine | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private config: BlobAnimConfig = {
    count: 5,
    size: 30,
    colors: ["#3b82f6", "#f39c12", "#e74c3c"],
    state: "chaos",
    variant: "default",
    speed: 1,
    gooey: false,
    scaleEffects: true,
    glass: false,
    gradient: false,
    debug: false,
  };

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    if (this.shadowRoot) {
      // Create a container div
      const container = document.createElement("div");
      container.style.display = "block";
      container.style.position = "relative";
      container.style.overflow = "hidden";

      // Create canvas element
      this.canvas = document.createElement("canvas");
      this.canvas.width = this.config.width || 400;
      this.canvas.height = this.config.height || 400;
      container.appendChild(this.canvas);

      // Append container to shadow DOM
      this.shadowRoot.appendChild(container);

      // Read attributes for initial config
      this.readAttributes();
    }
  }

  connectedCallback() {
    if (this.canvas) {
      // Initialize the engine with a dummy pattern
      const pattern = new DummyPattern();
      this.engine = new CanvasBlobEngine(this.canvas, this.config, pattern);
      this.engine.start();
    }
  }

  disconnectedCallback() {
    if (this.engine) {
      this.engine.stop();
      this.engine.dispose();
      this.engine = null;
    }
  }

  static get observedAttributes() {
    return [
      "count",
      "size",
      "speed",
      "state",
      "variant",
      "gooey",
      "color",
      "colors",
      "opacity",
      "scaleeffects",
      "width",
      "height",
      "glass",
      "glassblobs",
      "chaosamount",
      "sizefactor",
      "gradient",
      "debug",
    ];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this.updateConfigFromAttributes(name, newValue);
      if (this.engine) {
        this.engine.updateConfig(this.config);
      }
    }
  }

  private readAttributes() {
    const count = this.getAttribute("count");
    if (count) this.config.count = parseInt(count, 10);

    const size = this.getAttribute("size");
    if (size) this.config.size = parseInt(size, 10);

    const speed = this.getAttribute("speed");
    if (speed) this.config.speed = parseFloat(speed);

    const state = this.getAttribute("state");
    if (state) this.config.state = state;

    const variant = this.getAttribute("variant");
    if (variant) this.config.variant = variant;

    const gooey = this.getAttribute("gooey");
    if (gooey !== null) this.config.gooey = true;

    const colors = this.getAttribute("colors");
    if (colors) {
      try {
        this.config.colors = JSON.parse(colors);
      } catch (e) {
        console.warn("Invalid colors JSON, using default", e);
      }
    } else {
      const color = this.getAttribute("color");
      if (color) this.config.colors = [color];
    }

    const width = this.getAttribute("width");
    if (width) this.config.width = parseInt(width, 10);

    const height = this.getAttribute("height");
    if (height) this.config.height = parseInt(height, 10);

    // Update canvas dimensions if provided
    if (this.canvas && this.config.width && this.config.height) {
      this.canvas.width = this.config.width;
      this.canvas.height = this.config.height;
    }
  }

  private updateConfigFromAttributes(name: string, value: string) {
    switch (name) {
      case "count":
        this.config.count = parseInt(value, 10);
        break;
      case "size":
        this.config.size = parseInt(value, 10);
        break;
      case "speed":
        this.config.speed = parseFloat(value);
        break;
      case "state":
        this.config.state = value;
        break;
      case "variant":
        this.config.variant = value;
        break;
      case "gooey":
        this.config.gooey = value !== "false";
        break;
      case "colors":
        try {
          this.config.colors = JSON.parse(value);
        } catch (e) {
          console.warn("Invalid colors JSON", e);
        }
        break;
      case "color":
        this.config.colors = [value];
        break;
      case "width":
        this.config.width = parseInt(value, 10);
        if (this.canvas) this.canvas.width = this.config.width;
        break;
      case "height":
        this.config.height = parseInt(value, 10);
        if (this.canvas) this.canvas.height = this.config.height;
        break;
      // Add other attributes as needed
    }
  }
}

// Define the custom element
customElements.define("canvas-blob", CanvasBlobElement);
