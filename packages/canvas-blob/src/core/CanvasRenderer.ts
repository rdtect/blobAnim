import type { BlobAnimConfig, BlobPoint } from "./types";
import { EventEmitter } from "./EventEmitter";
// Import p5 in a way that works with both ESM and global
import p5 from "p5";

// Augment Canvas API types to work around TypeScript DOM limitations
interface CanvasRenderingContext2DExtended extends CanvasRenderingContext2D {
  clearRect(x: number, y: number, width: number, height: number): void;
  beginPath(): void;
  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ): void;
  fill(): void;
  fillStyle: string;
  globalAlpha: number;
}

// For P5.js constructor
interface WindowWithP5 extends Window {
  p5: any;
}

// Define DOM element types to avoid TS errors
interface HTMLCanvasElementWithDimensions extends HTMLCanvasElement {
  width: number;
  height: number;
  parentElement: HTMLElement | null;
}

interface HTMLElementWithParent extends HTMLElement {
  parentElement: HTMLElement | null;
}

export class CanvasRenderer {
  private canvas: HTMLCanvasElementWithDimensions;
  private ctx: CanvasRenderingContext2DExtended;
  private events: EventEmitter;
  private lastRenderTime: number = 0;
  private p5Instance: any = null;
  private metaballShader: any = null;
  private balls: any[] = [];
  private maxBalls: number = 9; // Number of balls supported by the shader
  private currentPoints: BlobPoint[] = [];
  private currentConfig: BlobAnimConfig | null = null;
  private useGooey: boolean = false;
  private p5Canvas: any = null;
  private p5Container: HTMLElementWithParent | null = null;

  constructor(canvas: HTMLCanvasElement, events?: EventEmitter) {
    this.canvas = canvas as HTMLCanvasElementWithDimensions;
    const ctx = canvas.getContext(
      "2d"
    ) as unknown as CanvasRenderingContext2DExtended;
    if (!ctx) {
      throw new Error("Could not get 2D context from canvas");
    }
    this.ctx = ctx;
    this.events = events || new EventEmitter();

    // Create the P5.js container if in browser environment
    if (typeof document !== "undefined") {
      this.setupP5Container();
    }
  }

  private setupP5Container(): void {
    try {
      // Skip if not in browser environment
      if (typeof document === "undefined") return;

      // Create a wrapper div for the P5 canvas
      const wrapperDiv = document.createElement("div") as HTMLElementWithParent;
      wrapperDiv.style.position = "absolute";
      wrapperDiv.style.top = "0";
      wrapperDiv.style.left = "0";
      wrapperDiv.style.width = "100%";
      wrapperDiv.style.height = "100%";
      wrapperDiv.style.pointerEvents = "none";

      const parent = this.canvas.parentElement;
      if (parent) {
        parent.appendChild(wrapperDiv);
        this.p5Container = wrapperDiv;

        // Initialize P5 instance
        this.initializeP5();
      }
    } catch (error) {
      console.warn("Failed to set up P5 container:", error);
    }
  }

  private initializeP5(): void {
    try {
      // Skip if not in browser environment
      if (typeof window === "undefined") return;

      // First try the imported p5, then fallback to the global p5
      const P5Constructor = p5 || (window as WindowWithP5).p5;

      if (!P5Constructor) {
        console.warn("P5.js not found. Gooey effect will not be available.");
        return;
      }

      // Create a new p5 instance
      this.p5Instance = new P5Constructor((p: any) => {
        p.setup = () => {
          this.p5Canvas = p.createCanvas(
            this.canvas.width,
            this.canvas.height,
            p.WEBGL
          );
          this.p5Canvas.style("position", "absolute");
          this.p5Canvas.style("top", "0");
          this.p5Canvas.style("left", "0");
          this.p5Canvas.style("z-index", "1");

          // Create the improved metaball shader with smoothing
          this.metaballShader = p.createShader(
            // Vertex shader
            `attribute vec3 aPosition;

            // Uniforms allow you to pass information from JavaScript to your shader
            uniform float width;
            uniform float height;

            // Varying values pass data from the vertex shader to the fragment shader
            // their values will be smoothly interpolated from one vertex to the next
            varying highp vec2 vPos;

            void main() {
              // convert position attribute into screen position (-1, -1) to (1, 1)
              gl_Position = vec4(aPosition, 1.0);
              // convert position in screen space to position in pixel space
              vPos = vec2(
                (gl_Position.x + 1.) / 2. * width,
                (gl_Position.y + 1.) / 2. * height);
            }`,
            // Fragment shader
            `precision highp float;

            #define BALLS ${this.maxBalls}

            uniform float xs[BALLS];
            uniform float ys[BALLS];
            uniform float rs[BALLS];
            uniform vec3 fgColor;
            uniform vec3 bgColor;
            uniform float threshold;
            uniform float smoothing;

            varying highp vec2 vPos;

            // Improved metaball with smoothing at the edges
            void main() {
              float sum = 0.0;
        
              // Calculate the sum value for the current pixel
              for (int i = 0; i < BALLS; i++) {
                float dx = xs[i] - vPos.x;
                float dy = ys[i] - vPos.y;
                float d = sqrt(dx * dx + dy * dy); // More precise distance calculation
                
                // Improved field function with better falloff
                float contribution = rs[i] * rs[i] / max(d * d, 0.001); 
                sum += contribution;
              }
              
              // Apply smoothing at the edges
              // Using a smooth step function creates a nicer transition
              float alpha = smoothstep(threshold - smoothing, threshold + smoothing, sum);
              
              // Set the pixel color with alpha for smooth edges
              gl_FragColor = vec4(fgColor, alpha);
            }`
          );

          p.shader(this.metaballShader);

          // Set up initial shader values
          this.metaballShader.setUniform("width", this.canvas.width);
          this.metaballShader.setUniform("height", this.canvas.height);
          this.metaballShader.setUniform("threshold", 1.0); // Default threshold
          this.metaballShader.setUniform("smoothing", 0.2); // Default edge smoothing

          // Initialize the balls array
          this.balls = [];
          for (let i = 0; i < this.maxBalls; i++) {
            this.balls.push({
              r: 100, // Default radius
              pos: { x: 0, y: 0 },
            });
          }

          p.noStroke();

          // Initially hide the canvas until gooey effect is used
          this.p5Canvas.hide();
        };

        p.draw = () => {
          if (
            !this.useGooey ||
            !this.currentConfig ||
            this.currentPoints.length === 0
          ) {
            return;
          }

          p.clear();

          if (!this.metaballShader) {
            return;
          }

          const numBalls = Math.min(this.currentPoints.length, this.maxBalls);
          const defaultSize = this.currentConfig.size || 20;
          const defaultColors = this.currentConfig.colors || ["#3b82f6"];

          // Set gooey intensity based on config
          const gooeyIntensity = this.currentConfig.gooeyIntensity || "medium";
          let threshold = 1.0;
          let smoothing = 0.2;

          // Adjust threshold and smoothing based on intensity
          switch (gooeyIntensity) {
            case "light":
              threshold = 1.5;
              smoothing = 0.3;
              break;
            case "medium":
              threshold = 1.0;
              smoothing = 0.2;
              break;
            case "heavy":
              threshold = 0.7;
              smoothing = 0.15;
              break;
          }

          // Initialize position arrays
          const xs = new Array(this.maxBalls).fill(0);
          const ys = new Array(this.maxBalls).fill(0);
          const rs = new Array(this.maxBalls).fill(0);

          // Update ball positions from the points
          for (let i = 0; i < numBalls; i++) {
            const point = this.currentPoints[i];
            if (!point) continue;

            this.balls[i].pos.x = point.x;
            this.balls[i].pos.y = point.y;

            // Scale radius based on point radius or default size
            // Adjust for the improved field function
            const pointRadius = point.radius || defaultSize;
            this.balls[i].r = Math.sqrt(pointRadius) * 10; // Scale factor for better visual result

            xs[i] = point.x;
            ys[i] = point.y;
            rs[i] = this.balls[i].r;
          }

          // Get foreground and background colors from config
          const fgColor = this.hexToRgb(defaultColors[0] || "#3b82f6");
          const bgColor = [0.0, 0.0, 0.0]; // Transparent background

          // Update shader uniforms
          p.shader(this.metaballShader);
          this.metaballShader.setUniform("xs", xs);
          this.metaballShader.setUniform("ys", ys);
          this.metaballShader.setUniform("rs", rs);
          this.metaballShader.setUniform("fgColor", fgColor);
          this.metaballShader.setUniform("bgColor", bgColor);
          this.metaballShader.setUniform("threshold", threshold);
          this.metaballShader.setUniform("smoothing", smoothing);

          // Draw fullscreen quad
          p.quad(-1, -1, 1, -1, 1, 1, -1, 1);
        };
      }, this.p5Container as HTMLElement);
    } catch (error) {
      console.error("Failed to initialize P5.js:", error);
      this.p5Instance = null;
    }
  }

  /**
   * Render a frame of the animation
   * @param points Array of points to render
   * @param config Animation configuration
   */
  public render(points: BlobPoint[], config: BlobAnimConfig): void {
    const renderStart = performance.now();

    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Set canvas size if provided in config
    if (
      config.width &&
      config.height &&
      (this.canvas.width !== config.width ||
        this.canvas.height !== config.height)
    ) {
      this.canvas.width = config.width;
      this.canvas.height = config.height;

      // Update P5 canvas size if it exists
      if (this.p5Instance && this.p5Canvas) {
        this.p5Instance.resizeCanvas(config.width, config.height);
        this.metaballShader?.setUniform("width", config.width);
        this.metaballShader?.setUniform("height", config.height);
      }
    }

    // Store current points and config for P5.js draw method
    this.currentPoints = points;
    this.currentConfig = config;

    const useGooeyNow = !!config.gooey;

    // Toggle P5 canvas visibility based on gooey setting
    if (useGooeyNow !== this.useGooey) {
      this.useGooey = useGooeyNow;
      if (this.p5Canvas) {
        if (useGooeyNow) {
          this.p5Canvas.show();
        } else {
          this.p5Canvas.hide();
        }
      }
    }

    // For non-gooey mode, render directly on the 2D canvas
    if (!useGooeyNow) {
      this.renderBasic(points, config);
    }
    // For gooey mode, the P5.js draw loop will handle rendering

    // Measure render time
    const renderTime = performance.now() - renderStart;
    this.lastRenderTime = renderTime;

    // Emit render event with performance data
    this.events.emit("render", { renderTime, pointCount: points.length });
  }

  private renderBasic(points: BlobPoint[], config: BlobAnimConfig): void {
    // Draw each point as a circle
    const defaultSize = config.size || 20;
    const defaultColors = config.colors || ["#000"];
    const defaultOpacity = config.opacity !== undefined ? config.opacity : 1;

    points.forEach((point, idx) => {
      this.ctx.beginPath();
      const radius = point.radius || defaultSize;
      this.ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);

      const color =
        point.color || defaultColors[idx % defaultColors.length] || "#000";
      this.ctx.fillStyle = color;

      const opacity =
        point.opacity !== undefined ? point.opacity : defaultOpacity;
      this.ctx.globalAlpha = opacity;

      this.ctx.fill();

      // Reset global alpha
      this.ctx.globalAlpha = 1;
    });
  }

  /**
   * Convert hex color to RGB array
   */
  private hexToRgb(hex: string): number[] {
    // Remove # if present
    hex = hex.replace(/^#/, "");

    // Parse hex
    let r, g, b;
    if (hex.length === 3) {
      r = parseInt(hex.charAt(0) + hex.charAt(0), 16) / 255;
      g = parseInt(hex.charAt(1) + hex.charAt(1), 16) / 255;
      b = parseInt(hex.charAt(2) + hex.charAt(2), 16) / 255;
    } else {
      r = parseInt(hex.substring(0, 2), 16) / 255;
      g = parseInt(hex.substring(2, 4), 16) / 255;
      b = parseInt(hex.substring(4, 6), 16) / 255;
    }

    return [r, g, b];
  }

  /**
   * Get the last render time
   * @returns Last render time in milliseconds
   */
  public getRenderTime(): number {
    return this.lastRenderTime;
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Clean up P5.js instance if it exists
    if (this.p5Instance) {
      this.p5Instance.remove();
      this.p5Instance = null;
      this.metaballShader = null;
    }

    // Remove the P5 container
    if (this.p5Container && this.p5Container.parentElement) {
      this.p5Container.parentElement.removeChild(this.p5Container);
      this.p5Container = null;
    }
  }
}
