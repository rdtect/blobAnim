/**
 * <blob-element> - Custom Web Component for animated SVG blobs
 *
 * Usage:
 *   <blob-element ...attributes>
 *
 * All configuration and animation logic is handled by BlobAnimEngine and pattern classes.
 */
import { BlobAnimEngine } from '../core/BlobAnimEngine';
import { BlobAnimConfig } from '../core/types';
import { ANIMATION_CONFIG, PatternRegistry } from '../patterns';

// Attribute mapping configuration
const ATTRIBUTE_CONFIG = {
  numeric: {
    count: 'count',
    size: 'size',
    speed: 'speed',
    width: 'width',
    height: 'height',
    sizefactor: 'sizeFactor',
    opacity: 'opacity',
    chaosamount: 'chaosAmount',
    amplitude: 'amplitude'
  } as Record<string, string>,
  boolean: {
    gooey: 'gooey',
    scaleeffects: 'scaleEffects',
    glass: 'glass',
    gradient: 'gradient',
    debug: 'debug',
  } as Record<string, string>,
  json: {
    colors: 'colors',
    glassblobs: 'glassBlobs',
  } as Record<string, string>,
  string: {
    state: 'state',
    variant: 'variant',
    container: 'container',
    color: 'colors',
    'gooey-intensity': 'gooeyIntensity',
  } as Record<string, string>,
};

/**
 * Parse an attribute value to the correct type
 * @param name Attribute name
 * @param value Attribute value
 * @returns Object with parsed value or null if parsing failed
 */
function parseAttributeValue(name: string, value: string): Record<string, any> | null {
  // Numeric attributes
  if (ATTRIBUTE_CONFIG.numeric[name]) {
    const parsed = parseFloat(value);
    const propName = ATTRIBUTE_CONFIG.numeric[name];
    if (isNaN(parsed)) return null;
    if (propName === 'opacity') {
      return { [propName]: Math.min(Math.max(parsed, 0), 1) };
    }
    return { [propName]: parsed };
  }
  
  // Boolean attributes
  if (ATTRIBUTE_CONFIG.boolean[name]) {
    const propName = ATTRIBUTE_CONFIG.boolean[name];
    // Handle presence-only boolean (e.g., <tag bool> yields empty string value)
    const boolVal = value === '' || value === 'true' || value === '1';
    return { [propName]: boolVal };
  }
  
  // JSON attributes
  if (ATTRIBUTE_CONFIG.json[name]) {
    const propName = ATTRIBUTE_CONFIG.json[name];
    try {
      const jsonValue = JSON.parse(value);
      if (Array.isArray(jsonValue)) return { [propName]: jsonValue };
    } catch {
      // Try comma-separated list for colors
      const arrayValue = value.split(',').map((c) => c.trim()).filter((c) => c);
      if (arrayValue.length > 0) return { [propName]: arrayValue };
    }
    return null;
  }
  
  // String attributes
  if (ATTRIBUTE_CONFIG.string[name]) {
    const propName = ATTRIBUTE_CONFIG.string[name];
    if (name === 'color') return { [propName]: [value] };
    return { [propName]: value };
  }
  
  return null;
}

export class BlobElement extends HTMLElement {
  private _container: HTMLDivElement;
  private _config: BlobAnimConfig;
  private _anim: BlobAnimEngine | null;
  private _needsVisualUpdate: boolean = false;
  private _resizeObserver: ResizeObserver | null = null;
  private _visibilityObserver: IntersectionObserver | null = null;
  private _legacyResizeListener: boolean = false;
  private _wasHidden: boolean = false;
  private _isInitialized: boolean = false;

  constructor() {
    super();
    this._container = document.createElement('div');
    // ensure SVG is clipped to container bounds
    this._container.style.cssText = 'width:100%;height:100%;overflow:hidden;';
    this.attachShadow({ mode: 'open' }).appendChild(this._container);
    
    // Set up auto-resize with feature detection
    this.setupResizeHandling();
    
    this._config = {};
    this._anim = null;
    this._needsVisualUpdate = false;
  }

  static get observedAttributes() {
    return Object.keys(ATTRIBUTE_CONFIG.numeric)
      .concat(Object.keys(ATTRIBUTE_CONFIG.boolean))
      .concat(Object.keys(ATTRIBUTE_CONFIG.string))
      .concat(Object.keys(ATTRIBUTE_CONFIG.json));
  }

  /**
   * Setup resize handling with appropriate fallbacks
   */
  private setupResizeHandling(): void {
    // Try to use ResizeObserver if available
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(this.handleResize.bind(this));
      this._resizeObserver.observe(this);
    } else {
      // Fallback to window resize event
      window.addEventListener('resize', this.handleResize.bind(this));
      this._legacyResizeListener = true;
    }
  }

  /**
   * Handle element resize
   */
  private handleResize(entries?: ResizeObserverEntry[]): void {
    let width, height;
    
    if (entries && entries.length) {
      // ResizeObserver data
      const entry = entries[0];
      width = entry.contentRect.width;
      height = entry.contentRect.height;
    } else {
      // Manual measurement
      width = this.clientWidth;
      height = this.clientHeight;
    }
    
    // Only update if we have positive dimensions
    if (width > 0 && height > 0) {
      this.resize(width, height);
    }
  }

  connectedCallback() {
    if (!this.isConnected) return;
    
    // Read all initial attributes into config
    BlobElement.observedAttributes.forEach((attr) => {
      const val = this.getAttribute(attr);
      if (val !== null) {
        const parsed = parseAttributeValue(attr, val);
        if (parsed) Object.assign(this._config, parsed);
      }
    });
    
    this._needsVisualUpdate = true;
    this.update();
    
    // Forward animation events to DOM events
    if (this._anim) {
      this.setupEventForwarding();
    }
    
    // Start visibility observer
    this._startVisibilityObserver();
    
    this._isInitialized = true;
  }

  disconnectedCallback() {
    this._cleanupResources();
    this._wasHidden = true;
    this._isInitialized = false;
  }
  
  /**
   * Called when the element is moved to a new document
   */
  adoptedCallback() {
    // Re-initialize when moved to a new document
    this._cleanupResources();
    this._isInitialized = false;
    
    // Re-initialize in the new document
    if (this.isConnected) {
      this.connectedCallback();
    }
  }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (oldVal !== newVal) {
      const parsed = parseAttributeValue(name, newVal);
      if (parsed) {
        Object.assign(this._config, parsed);
        this.update();
      }
    }
  }

  /**
   * Start visibility observer to pause animations when not visible
   */
  private _startVisibilityObserver(): void {
    // Check if IntersectionObserver is available
    if (typeof IntersectionObserver !== 'undefined') {
      this._visibilityObserver = new IntersectionObserver((entries) => {
        const isVisible = entries[0].isIntersecting;
        
        if (isVisible && this._wasHidden && this._anim) {
          // Resume animation when element becomes visible again
          this._anim.resume();
          this._wasHidden = false;
          this.dispatchEvent(new CustomEvent('blob:visible'));
        } else if (!isVisible && this._anim && !this._wasHidden) {
          // Pause animation when element is not visible
          this._anim.pause();
          this._wasHidden = true;
          this.dispatchEvent(new CustomEvent('blob:hidden'));
        }
      });
      
      this._visibilityObserver.observe(this);
    }
  }
  
  /**
   * Clean up all resources used by the component
   */
  private _cleanupResources(): void {
    // Clean up animation engine
    if (this._anim) {
      this._anim.stop();
      this._anim = null;
    }
    
    // Clean up resize handler
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    
    // Clean up visibility observer
    if (this._visibilityObserver) {
      this._visibilityObserver.disconnect();
      this._visibilityObserver = null;
    }
    
    // Clean up legacy resize listener
    if (this._legacyResizeListener) {
      window.removeEventListener('resize', this.handleResize.bind(this));
      this._legacyResizeListener = false;
    }
  }

  /**
   * Setup event forwarding from internal engine to DOM events
   */
  private setupEventForwarding(): void {
    if (!this._anim) return;
    
    // Forward engine events to DOM events
    this._anim.on('start', () => {
      this.dispatchEvent(new CustomEvent('blob:start'));
    });
    
    this._anim.on('stop', () => {
      this.dispatchEvent(new CustomEvent('blob:stop'));
    });
    
    this._anim.on('pause', () => {
      this.dispatchEvent(new CustomEvent('blob:pause'));
    });
    
    this._anim.on('resume', () => {
      this.dispatchEvent(new CustomEvent('blob:resume'));
    });
    
    this._anim.on('configChange', (data) => {
      this.dispatchEvent(new CustomEvent('blob:configChange', { detail: data }));
    });
  }

  /**
   * Get pattern class based on state and variant
   * @param state Animation state
   * @param variant Variant within state
   * @returns Pattern class constructor
   */
  private getPatternClass(state: string, variant: string) {
    const stateKey = state || 'chaos';
    const variantKey = variant || 'default';
    
    // Find state config
    const stateCfg = ANIMATION_CONFIG.states[stateKey];
    if (!stateCfg) {
      console.error(`Unknown animation state: ${stateKey}`);
      // Fallback to chaos state
      return PatternRegistry.chaos;
    }
    
    // Find pattern for variant or default
    return stateCfg.patterns[variantKey] || stateCfg.patterns.default;
  }

  /**
   * Update the animation config and/or pattern.
   * @param newConfig Partial config to merge
   */
  public update(newConfig: Partial<BlobAnimConfig> = {}) {
    // Merge the new config
    Object.assign(this._config, newConfig);
    
    // If engine not created yet but pending visual update, instantiate it
    if (!this._anim && this._needsVisualUpdate) {
      this._initializeEngine();
      return;
    }
    
    if (this._anim) {
      // Check if pattern/state or variant changed
      if (newConfig.state || newConfig.variant) {
        const stateKey = this._config.state || 'chaos';
        const variantKey = this._config.variant || 'default';
        const PatternClass = this.getPatternClass(stateKey, variantKey);
        this._anim.setPattern(new PatternClass());
      }
      
      // Update config
      this._anim.updateConfig(this._config);
    } else {
      this._needsVisualUpdate = true;
    }
  }
  
  /**
   * Initialize the animation engine
   */
  private _initializeEngine(): void {
    // Create SVG root
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    
    // Set initial dimensions
    const width = this._config.width || this._container.clientWidth || 300;
    const height = this._config.height || this._container.clientHeight || 150;
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    
    // Clear container and add SVG
    this._container.innerHTML = '';
    this._container.appendChild(svg);
    
    // Determine pattern class from config
    const stateKey = this._config.state || 'chaos';
    const variantKey = this._config.variant || 'default';
    const PatternClass = this.getPatternClass(stateKey, variantKey);
    
    // Create the animation engine
    this._anim = new BlobAnimEngine(svg, this._config, new PatternClass());
    this._anim.start();
    this._needsVisualUpdate = false;
    
    // Set up event forwarding
    this.setupEventForwarding();
  }

  /**
   * Resize the animation SVG.
   */
  public resize(width: number, height: number) {
    this._config.width = width;
    this._config.height = height;
    
    // Update SVG element dimensions
    const svg = this._container.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', width.toString());
      svg.setAttribute('height', height.toString());
    }
    
    // Update animation config
    this.update();
  }

  /**
   * Pause the animation
   */
  public pause(): void {
    if (this._anim) {
      this._anim.pause();
    }
  }

  /**
   * Resume the animation
   */
  public resume(): void {
    if (this._anim) {
      this._anim.resume();
    }
  }

  /**
   * Get performance metrics
   * @returns Object with FPS
   */
  public getPerformanceMetrics(): { fps: number } {
    return this._anim ? this._anim.getPerformanceMetrics() : { fps: 0 };
  }

  /**
   * Destroy the animation and clean up resources.
   */
  public destroy() {
    this._cleanupResources();
    this._container.innerHTML = '';
    this._isInitialized = false;
  }
}

// Register the custom element (ensure this runs only once)
if (
  typeof window !== 'undefined' &&
  typeof customElements !== 'undefined' &&
  !customElements.get('blob-element')
) {
  customElements.define('blob-element', BlobElement);
}
