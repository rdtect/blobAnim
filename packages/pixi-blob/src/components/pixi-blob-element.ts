/**
 * <pixi-blob-element> - Custom Web Component for animated Pixi.js blobs
 *
 * Usage:
 *   <pixi-blob-element ...attributes>
 *
 * All configuration and animation logic is handled by BlobContainer.
 */
import { BlobContainer } from '../BlobContainer';
import type { BlobOptions } from '../types';

// Attribute mapping configuration
const ATTRIBUTE_CONFIG = {
  numeric: {
    count: 'count',
    size: 'size',
    speed: 'speed',
    width: 'width',
    height: 'height',
  } as Record<string, string>,
  boolean: {
    gooey: 'gooey',
    scaleeffects: 'scaleEffects',
    gradientfill: 'gradientFill',
  } as Record<string, string>,
  string: {
    state: 'state',
    variant: 'variant',
    colors: 'colors',
  } as Record<string, string>,
};

function parseAttributeValue(name: string, value: string): Record<string, any> | null {
  // Numeric attributes
  if (ATTRIBUTE_CONFIG.numeric[name]) {
    const parsed = parseFloat(value);
    const propName = ATTRIBUTE_CONFIG.numeric[name];
    if (isNaN(parsed)) return null;
    return { [propName]: parsed };
  }
  // Boolean attributes
  if (ATTRIBUTE_CONFIG.boolean[name]) {
    const propName = ATTRIBUTE_CONFIG.boolean[name];
    const boolVal = value === '' || value === 'true' || value === '1';
    return { [propName]: boolVal };
  }
  // String attributes
  if (ATTRIBUTE_CONFIG.string[name]) {
    const propName = ATTRIBUTE_CONFIG.string[name];
    if (name === 'colors') return { [propName]: value.split(',').map((c) => c.trim()).filter(Boolean) };
    return { [propName]: value };
  }
  return null;
}

export class PixiBlobElement extends HTMLElement {
  private _container: HTMLDivElement;
  private _options: Partial<BlobOptions> = {};
  private _pixi: BlobContainer | null = null;
  private _resizeObserver: ResizeObserver | null = null;
  private _isConnected: boolean = false;
  private _animationFrame: number | null = null;

  constructor() {
    super();
    this._container = document.createElement('div');
    this._container.style.cssText = 'width:100%;height:100%;overflow:hidden;position:relative;';
    this.attachShadow({ mode: 'open' }).appendChild(this._container);
  }

  static get observedAttributes() {
    return [
      ...Object.keys(ATTRIBUTE_CONFIG.numeric),
      ...Object.keys(ATTRIBUTE_CONFIG.boolean),
      ...Object.keys(ATTRIBUTE_CONFIG.string),
    ];
  }

  connectedCallback() {
    this._isConnected = true;
    if (typeof window !== 'undefined' && typeof ResizeObserver !== 'undefined') {
      this.setupResizeHandling();
    }
    this.initPixi();
  }

  disconnectedCallback() {
    this._isConnected = false;
    this.cleanupResizeHandling();
    this.destroyPixi();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;
    const parsed = newValue !== null ? parseAttributeValue(name, newValue) : null;
    if (parsed) {
      Object.assign(this._options, parsed);
      this.updatePixi();
    }
  }

  /**
   * Public API for updating options dynamically
   */
  set options(opts: Partial<BlobOptions>) {
    Object.assign(this._options, opts);
    this.updatePixi();
  }
  get options() {
    return this._options;
  }

  private setupResizeHandling() {
    if (typeof window !== 'undefined' && typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => this.handleResize());
      this._resizeObserver.observe(this);
    } else if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize as EventListener);
    }
  }

  private cleanupResizeHandling() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    } else if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize as EventListener);
    }
  }

  private handleResize = () => {
    if (!this._pixi) return;
    const rect = this.getBoundingClientRect();
    this._pixi.resize(rect.width, rect.height);
  };

  private async initPixi() {
    if (this._pixi) return;

    const rect = this.getBoundingClientRect();
    // If not yet laid out, defer initialization
    if (!rect.width || !rect.height) {
      // Try again on the next animation frame
      if (typeof window !== 'undefined') {
        window.requestAnimationFrame(() => this.initPixi());
      }
      return;
    }

    try {
      const blob = new BlobContainer(this._options);
      await blob.initialize({
        width: rect.width || 300,
        height: rect.height || 300,
        backgroundColor: 0x000000,
        antialias: true,
      } as any);

      if (blob.canvas && this._container) {
        this._container.appendChild(blob.canvas);
      }

      // Assign pixi instance after initialize to avoid premature resize calls
      this._pixi = blob;

      // Initial resize to match element size
      this.handleResize();

      // Start the animation loop - THIS IS CRITICAL!
      this.startAnimationLoop();

      // Dispatch event that component is ready
      this.dispatchEvent(new CustomEvent('pixiblob-ready', { 
        bubbles: true, 
        composed: true 
      }));

    } catch (error) {
      console.error('Error initializing PixiBlob:', error);
    }
  }

  private startAnimationLoop() {
    if (!this._isConnected || !this._pixi) return;
    
    // Clear any existing animation loop
    if (this._animationFrame !== null) {
      if (typeof window !== 'undefined') {
        window.cancelAnimationFrame(this._animationFrame);
      }
      this._animationFrame = null;
    }
    
    // Animation frame function
    const animate = () => {
      if (!this._isConnected || !this._pixi) return;
      
      // Call the BlobContainer's animation/render methods directly
      if (typeof (this._pixi as any).animate === 'function') {
        (this._pixi as any).animate();
      } else if (typeof (this._pixi as any).update === 'function') {
        (this._pixi as any).update(0.016); // ~60fps
      }
      
      // Request next frame
      if (typeof window !== 'undefined') {
        this._animationFrame = window.requestAnimationFrame(animate);
      }
    };
    
    // Start the loop
    if (typeof window !== 'undefined') {
      this._animationFrame = window.requestAnimationFrame(animate);
    }
  }

  private updatePixi() {
    if (!this._pixi) {
      if (this._isConnected) this.initPixi();
      return;
    }
    
    // Update options by setting individual properties on BlobContainer
    if (this._options.variant && typeof (this._pixi as any).setVariant === 'function') {
      (this._pixi as any).setVariant(this._options.variant);
    }
    
    if (this._options.state && typeof (this._pixi as any).setState === 'function') {
      (this._pixi as any).setState(this._options.state);
    }
    
    if (this._options.speed !== undefined && typeof (this._pixi as any).setSpeed === 'function') {
      (this._pixi as any).setSpeed(this._options.speed);
    }
    
    if (this._options.size !== undefined && typeof (this._pixi as any).setSize === 'function') {
      (this._pixi as any).setSize(this._options.size);
    }
    
    if (this._options.count !== undefined && typeof (this._pixi as any).setCount === 'function') {
      (this._pixi as any).setCount(this._options.count);
    }
    
    if (this._options.gooey !== undefined && typeof (this._pixi as any).setGooey === 'function') {
      (this._pixi as any).setGooey(this._options.gooey);
    }
    
    if (this._options.colors && typeof (this._pixi as any).setColors === 'function') {
      (this._pixi as any).setColors(this._options.colors);
    }
  }

  private destroyPixi() {
    // Stop animation loop
    if (this._animationFrame !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this._animationFrame);
      this._animationFrame = null;
    }
    
    if (this._pixi) {
      if (typeof (this._pixi as any).destroy === 'function') {
        (this._pixi as any).destroy();
      }
      if (this._pixi.canvas && this._pixi.canvas.parentNode === this._container) {
        this._container.removeChild(this._pixi.canvas);
      }
      this._pixi = null;
    }
  }
}

// Register the custom element (guarded)
if (typeof window !== 'undefined' && typeof customElements !== 'undefined') {
  if (!customElements.get('pixi-blob-element')) {
    customElements.define('pixi-blob-element', PixiBlobElement);
  }
}
