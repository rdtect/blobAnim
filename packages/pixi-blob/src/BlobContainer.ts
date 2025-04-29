import { Container, Filter, Color, Rectangle, Application, Sprite, Texture, type ApplicationOptions } from "pixi.js";
import type { ColorSource } from "pixi.js";
import type { FederatedPointerEvent } from "pixi.js";
import { BlobOptions, BlobPoint, BlobState, BlobVariant } from "./types";
import metaballFragment from "./filters/metaball.frag?raw";

const DEFAULT_OPTIONS: Required<BlobOptions> = {
  count: 5,
  size: 30,
  colors: ["#3b82f6"],
  speed: 1,
  variant: "default",
  state: "chaos",
  gooey: false,
  gradientFill: false,
  scaleEffects: true,
};

export class BlobContainer extends Container {
  readonly #options: Required<BlobOptions>;
  #points: BlobPoint[] = [];
  #filter!: Filter;
  #time: number = 0;
  #bounds!: Rectangle;
  #isDestroyed: boolean = false;
  #app?: Application;
  #standalone: boolean = false;
  #resizeHandler: () => void;
  #pointerMoveHandler: (event: FederatedPointerEvent) => void;
  #quad?: Sprite;

  constructor(options: BlobOptions = {}) {
    super();
    this.#options = { ...DEFAULT_OPTIONS, ...options };
    this.#resizeHandler = this.#handleResize.bind(this);
    this.#pointerMoveHandler = this.#handlePointerMove.bind(this);
  }

  async initialize(appOptions?: ApplicationOptions) {
    if (appOptions) {
      this.#app = new Application();
      await this.#app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        ...appOptions
      });
      this.#standalone = true;
      this.#bounds = new Rectangle(
        0,
        0,
        this.#app.renderer.width,
        this.#app.renderer.height
      );
      this.#app.stage.addChild(this);
    } else {
      this.#bounds = new Rectangle(0, 0, 300, 300);
    }
    // Create full-screen quad for filter geometry
    const quad = new Sprite(Texture.WHITE);
    quad.width = this.#bounds.width;
    quad.height = this.#bounds.height;
    this.addChild(quad);
    this.#quad = quad;

    // Initialize blob points, filter, and start events
    this.#initializePoints();
    this.#initializeFilter();
    this.#updateFilter();
    this.#setupEventListeners();
  }

  /**
   * The HTMLCanvasElement used by the Pixi Application
   */
  get canvas(): HTMLCanvasElement {
    if (!this.#app) {
      throw new Error("Cannot access canvas before initialization");
    }
    // Pixi v8 stores the canvas in the 'view' property
    return this.#app.view;
  }
  
  /**
   * Initialize the blob animation. Call this method only when using as a child component.
   * In standalone mode, initialization happens automatically.
   */
  init(width: number, height: number) {
    if (this.#standalone) {
      console.warn("init() is not needed in standalone mode");
      return;
    }
    
    this.#bounds.width = width;
    this.#bounds.height = height;
    this.#updateFilter();
  }

  resize(width: number, height: number) {
    if (this.#app && this.#standalone) {
      this.#app.renderer.resize(width, height);
    }
    
    // Update quad size on resize
    this.#quad!.width = width;
    this.#quad!.height = height;
    this.#bounds.width = width;
    this.#bounds.height = height;
    this.#updateFilter();
  }

  #setupEventListeners() {
    window.addEventListener("resize", this.#resizeHandler);
    
    if (this.#app && this.#standalone) {
      this.#app.stage.on("pointermove", this.#pointerMoveHandler);
    } else {
      // In child mode, listen to this container's own pointermove events
      this.eventMode = 'static';
      this.on("pointermove", this.#pointerMoveHandler);
    }
    
    // Start animation in both modes
    this.#startAnimation();
  }

  #handlePointerMove(event: FederatedPointerEvent) {
    if (this.#isDestroyed) return;

    // Update points based on pointer position
    this.#points.forEach((point) => {
      const dx = event.globalX - point.x;
      const dy = event.globalY - point.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 200) {
        point.velocity.x += dx * 0.01;
        point.velocity.y += dy * 0.01;
      }
    });
  }

  #handleResize() {
    if (this.#isDestroyed) return;
    this.resize(window.innerWidth, window.innerHeight);
  }

  #initializeFilter() {
    // Create filter with fragment shader and initial uniforms
    const uniforms: any = {
      uTime: 0,
      uColors: this.#points.map((p) => {
        const c = new Color(p.color as string);
        return [c.red, c.green, c.blue, c.alpha];
      }),
      uPoints: this.#points.map((p) => [
        (p.x / this.#bounds.width) * 2 - 1,
        (p.y / this.#bounds.height) * 2 - 1,
        (p.radius / this.#bounds.width) * 2,
      ]),
      uGooey: this.#options.gooey ? 0.1 : 0.0,
      uCount: this.#points.length,
    };
    // @ts-ignore: object-based Filter constructor for Pixi v8
    this.#filter = new Filter({ fragment: metaballFragment, uniforms } as any);
    // Attach filter directly to quad sprite
    this.#quad!.filters = [this.#filter];
  }

  #initializePoints() {
    this.#points = Array.from({ length: this.#options.count }, (_, i) => {
      const angle = (i / this.#options.count) * Math.PI * 2;
      const radius = this.#options.size;
      return {
        x: Math.cos(angle) * radius + this.#bounds.width / 2,
        y: Math.sin(angle) * radius + this.#bounds.height / 2,
        radius: this.#options.size,
        color: this.#options.colors[i % this.#options.colors.length],
        velocity: { x: 0, y: 0 },
      };
    });
  }

  #startAnimation() {
    if (this.#standalone && this.#app) {
      // In standalone mode, use the ticker from our app
      this.#app.ticker.add(() => {
        if (!this.#isDestroyed) {
          this.#update();
        }
      });
    } else {
      // In child mode, wait for the parent app to call update
      // The parent should add this blob to its ticker
    }
  }
  
  /**
   * Update method that can be called by the parent application's ticker
   * when using this as a child component
   */
  update(deltaTime?: number) {
    if (!this.#isDestroyed) {
      this.#time += deltaTime ? deltaTime / 60 : 0.016; // Convert to seconds or use default
      this.#updatePoints();
      this.#updateFilter();
    }
  }

  #update() {
    this.#time += 0.016; // Assuming 60fps
    this.#updatePoints();
    this.#updateFilter();
  }

  #updatePoints() {
    const { state, variant, speed } = this.#options;

    this.#points.forEach((point, i) => {
      // Update position based on variant and state
      switch (variant) {
        case "spiral": {
          const angle =
            (i / this.#points.length) * Math.PI * 2 + this.#time * speed;
          const radius =
            this.#options.size * (1 + Math.sin(this.#time * 0.5) * 0.2);
          point.x = Math.cos(angle) * radius + this.#bounds.width / 2;
          point.y = Math.sin(angle) * radius + this.#bounds.height / 2;
          break;
        }
        case "random": {
          if (Math.random() < 0.02) {
            point.velocity.x = (Math.random() - 0.5) * speed;
            point.velocity.y = (Math.random() - 0.5) * speed;
          }
          point.x += point.velocity.x;
          point.y += point.velocity.y;

          // Keep points within bounds
          point.x = Math.max(
            point.radius,
            Math.min(this.#bounds.width - point.radius, point.x)
          );
          point.y = Math.max(
            point.radius,
            Math.min(this.#bounds.height - point.radius, point.y)
          );
          break;
        }
        case "circle": {
          const circleAngle =
            (i / this.#points.length) * Math.PI * 2 + this.#time * speed;
          const circleRadius = this.#options.size * 2;
          point.x =
            Math.cos(circleAngle) * circleRadius + this.#bounds.width / 2;
          point.y =
            Math.sin(circleAngle) * circleRadius + this.#bounds.height / 2;
          break;
        }
        case "brownian": {
          point.velocity.x += (Math.random() - 0.5) * 0.1;
          point.velocity.y += (Math.random() - 0.5) * 0.1;
          point.velocity.x *= 0.98;
          point.velocity.y *= 0.98;
          point.x += point.velocity.x * speed;
          point.y += point.velocity.y * speed;

          // Keep points within bounds
          point.x = Math.max(
            point.radius,
            Math.min(this.#bounds.width - point.radius, point.x)
          );
          point.y = Math.max(
            point.radius,
            Math.min(this.#bounds.height - point.radius, point.y)
          );
          break;
        }
      }

      // Apply state-specific behavior
      switch (state) {
        case "chaos":
          point.radius =
            this.#options.size * (1 + Math.sin(this.#time + i) * 0.2);
          break;
        case "structured":
          point.radius = this.#options.size;
          break;
        case "organizing":
          point.radius =
            this.#options.size * (1 + Math.sin(this.#time * 0.5 + i) * 0.1);
          break;
      }
    });
  }

  #updateFilter() {
    if (!this.#filter || this.#isDestroyed || !(this.#filter as any).uniforms) {
      // Reinitialize filter if missing
      this.#initializeFilter();
      if (!this.#filter || !(this.#filter as any).uniforms) return;
    }
 
    const u = (this.#filter as any).uniforms;
    u.uTime = this.#time;
    u.uPoints = this.#points.map((p) => [
      (p.x / this.#bounds.width) * 2 - 1,
      (p.y / this.#bounds.height) * 2 - 1,
      (p.radius / this.#bounds.width) * 2,
    ]);
    u.uColors = this.#points.map((p) => {
      const color = new Color(p.color as string);
      return [color.red, color.green, color.blue, color.alpha];
    });
    u.uGooey = this.#options.gooey ? 0.1 : 0.0;
    u.uCount = this.#points.length;
  }

  // Animation method called by web component
  animate() {
    this.update(0.016); // ~60fps
  }

  // Public setters for option values that match web component API
  setVariant(variant: BlobVariant) {
    this.#options.variant = variant;
    this.#initializePoints();
  }

  setState(state: BlobState) {
    this.#options.state = state;
    this.#initializePoints();
  }

  setSpeed(speed: number) {
    this.#options.speed = speed;
  }

  setSize(size: number) {
    this.#options.size = size;
    this.#initializePoints();
  }

  setCount(count: number) {
    this.#options.count = count;
    this.#initializePoints();
  }

  setGooey(gooey: boolean) {
    this.#options.gooey = gooey;
    this.#updateFilter();
  }

  setColors(colors: ColorSource[]) {
    this.#options.colors = colors as string[];
    this.#updateFilter();
  }

  public destroy() {
    if (this.#isDestroyed) return;

    // Remove event listeners using the same bound functions
    window.removeEventListener("resize", this.#resizeHandler);
    
    if (this.#app && this.#standalone) {
      this.#app.stage.off("pointermove", this.#pointerMoveHandler);
      this.#app.destroy(true);
    } else {
      this.off("pointermove", this.#pointerMoveHandler);
    }
    
    // Clean up resources
    if (this.#filter) {
      this.#filter.destroy();
    }
    
    this.filters = null as any;
    this.#isDestroyed = true;
    super.destroy();
  }
}
