import { BlobAnimConfig, BlobPoint } from './types';
import { EventEmitter } from './EventEmitter';

export class BlobRenderer {
  private svg: SVGSVGElement;
  private defs: SVGDefsElement;
  private group: SVGGElement;
  private circles: SVGCircleElement[] = [];
  private events: EventEmitter;
  private lastRenderTime: number = 0;

  constructor(svgRoot: SVGSVGElement, events?: EventEmitter) {
    this.svg = svgRoot;
    this.events = events || new EventEmitter();
    
    // Ensure SVG has defs and group elements
    this.defs = this.ensureChild('defs', this.svg) as SVGDefsElement;
    this.group = this.ensureChild('g', this.svg) as SVGGElement;
  }

  /**
   * Render a frame of the animation
   * @param points Array of points to render
   * @param config Animation configuration
   */
  public render(points: BlobPoint[], config: BlobAnimConfig): void {
    const renderStart = performance.now();
    
    // Update SVG filters
    this.updateGooeyEffect(config);
    this.updateGlassEffect(config);
    this.updateGradient(config);
    
    // Apply gooey filter to group if enabled
    if (config.gooey) {
      this.group.setAttribute('filter', 'url(#gooey-filter)');
    } else {
      this.group.removeAttribute('filter');
    }
    
    // Create or remove circles as needed
    this.updateCirclePool(points.length);
    
    // Update existing circles
    this.updateCircleAttributes(points, config);
    
    // Measure render time
    const renderTime = performance.now() - renderStart;
    this.lastRenderTime = renderTime;
    
    // Emit render event with performance data
    this.events.emit('render', { renderTime, pointCount: points.length });
  }

  /**
   * Update the circle pool to match the number of points
   * @param count Number of circles needed
   */
  private updateCirclePool(count: number): void {
    // Remove excess circles
    while (this.circles.length > count) {
      const circle = this.circles.pop();
      if (circle?.parentNode) {
        circle.parentNode.removeChild(circle);
      }
    }
    
    // Add new circles if needed
    while (this.circles.length < count) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      this.group.appendChild(circle);
      this.circles.push(circle);
    }
  }

  /**
   * Update circle attributes based on points
   * @param points Array of points
   * @param config Animation configuration
   */
  private updateCircleAttributes(points: BlobPoint[], config: BlobAnimConfig): void {
    const defaultSize = config.size || 20;
    const defaultColors = config.colors || ['#000'];
    const defaultOpacity = config.opacity !== undefined ? config.opacity : 1;
    
    points.forEach((point, idx) => {
      const circle = this.circles[idx];
      
      // Set basic position and size
      circle.setAttribute('cx', point.x.toString());
      circle.setAttribute('cy', point.y.toString());
      circle.setAttribute('r', (point.radius || defaultSize).toString());
      
      // Set appearance
      const color = point.color || defaultColors[idx % defaultColors.length];
      circle.setAttribute('fill', color);
      
      const opacity = point.opacity !== undefined ? point.opacity : defaultOpacity;
      circle.setAttribute('opacity', opacity.toString());
      
      // Apply glass effect to specific blobs if enabled
      if (config.glass && config.glassBlobs?.includes(idx)) {
        circle.setAttribute('filter', 'url(#glass-filter)');
      } else {
        circle.removeAttribute('filter');
      }
      
      // Set data attributes for debugging
      if (config.debug) {
        circle.setAttribute('data-index', idx.toString());
      }
    });
  }

  /**
   * Create or update radial gradient in defs
   * @param config Animation configuration
   */
  public updateGradient(config: BlobAnimConfig): void {
    const id = 'blob-gradient';
    let gradient = this.defs.querySelector(`#${id}`) as SVGRadialGradientElement;
    
    if (config.gradient) {
      if (!gradient) {
        gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        gradient.setAttribute('id', id);
        gradient.setAttribute('cx', '0.5');
        gradient.setAttribute('cy', '0.5');
        gradient.setAttribute('r', '0.5');
        gradient.setAttribute('gradientUnits', 'objectBoundingBox');
        
        // Add stops
        const stop1 = document.createElementNS(gradient.namespaceURI, 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', 'white');
        
        const stop2 = document.createElementNS(gradient.namespaceURI, 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', 'rgba(255,255,255,0.5)');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        this.defs.appendChild(gradient);
      }
      
      // Update gradient colors if provided
      if (config.colors?.length && config.colors.length >= 2) {
        const stops = gradient.querySelectorAll('stop');
        if (stops.length >= 2) {
          stops[0].setAttribute('stop-color', config.colors[0]);
          stops[1].setAttribute('stop-color', config.colors[config.colors.length - 1]);
        }
      }
    } else if (gradient) {
      gradient.remove();
    }
  }

  /**
   * Create or update glass effect filter in defs
   * @param config Animation configuration
   */
  public updateGlassEffect(config: BlobAnimConfig): void {
    const id = 'glass-filter';
    const filter = this.ensureFilter(id, config.glass);
    
    if (config.glass && filter) {
      // Set filter properties
      filter.setAttribute('filterUnits', 'userSpaceOnUse');
      filter.setAttribute('x', '0');
      filter.setAttribute('y', '0');
      filter.setAttribute('width', '100%');
      filter.setAttribute('height', '100%');
      
      // Clear existing filter elements
      while (filter.firstChild) {
        filter.removeChild(filter.firstChild);
      }
      
      // Create new filter elements for glass effect
      
      // 1. Gaussian blur for soft edges
      const feGaussianBlur = document.createElementNS(filter.namespaceURI, 'feGaussianBlur');
      feGaussianBlur.setAttribute('in', 'SourceGraphic');
      feGaussianBlur.setAttribute('stdDeviation', '2');
      feGaussianBlur.setAttribute('result', 'blur');
      filter.appendChild(feGaussianBlur);
      
      // 2. Specular highlight
      const feSpecularLighting = document.createElementNS(filter.namespaceURI, 'feSpecularLighting');
      feSpecularLighting.setAttribute('in', 'blur');
      feSpecularLighting.setAttribute('surfaceScale', '5');
      feSpecularLighting.setAttribute('specularConstant', '0.8');
      feSpecularLighting.setAttribute('specularExponent', '20');
      feSpecularLighting.setAttribute('lighting-color', '#ffffff');
      feSpecularLighting.setAttribute('result', 'specLight');
      
      // Add light source
      const fePointLight = document.createElementNS(filter.namespaceURI, 'fePointLight');
      fePointLight.setAttribute('x', '50');
      fePointLight.setAttribute('y', '50');
      fePointLight.setAttribute('z', '200');
      feSpecularLighting.appendChild(fePointLight);
      filter.appendChild(feSpecularLighting);
      
      // 3. Composite specular lighting with original
      const feComposite1 = document.createElementNS(filter.namespaceURI, 'feComposite');
      feComposite1.setAttribute('in', 'specLight');
      feComposite1.setAttribute('in2', 'SourceGraphic');
      feComposite1.setAttribute('operator', 'in');
      feComposite1.setAttribute('result', 'specLightIn');
      filter.appendChild(feComposite1);
      
      // 4. Add specular lighting to original
      const feComposite2 = document.createElementNS(filter.namespaceURI, 'feComposite');
      feComposite2.setAttribute('in', 'SourceGraphic');
      feComposite2.setAttribute('in2', 'specLightIn');
      feComposite2.setAttribute('operator', 'arithmetic');
      feComposite2.setAttribute('k1', '0');
      feComposite2.setAttribute('k2', '1');
      feComposite2.setAttribute('k3', '1');
      feComposite2.setAttribute('k4', '0');
      feComposite2.setAttribute('result', 'glass');
      filter.appendChild(feComposite2);
      
      // 5. Add transparency
      const feColorMatrix = document.createElementNS(filter.namespaceURI, 'feColorMatrix');
      feColorMatrix.setAttribute('in', 'glass');
      feColorMatrix.setAttribute('type', 'matrix');
      feColorMatrix.setAttribute('values', '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.5 0');
      filter.appendChild(feColorMatrix);
    }
  }

  /**
   * Create or update gooey SVG filter in defs
   * @param config Animation configuration
   */
  private updateGooeyEffect(config: BlobAnimConfig): void {
    const id = 'gooey-filter';
    const filter = this.ensureFilter(id, config.gooey);
    
    if (config.gooey && filter) {
      // Set filter properties
      filter.setAttribute('filterUnits', 'userSpaceOnUse');
      filter.setAttribute('x', '0');
      filter.setAttribute('y', '0');
      filter.setAttribute('width', '100%');
      filter.setAttribute('height', '100%');
      
      // Clear existing filter elements
      while (filter.firstChild) {
        filter.removeChild(filter.firstChild);
      }
      
      // Get blur amount based on intensity setting
      let blurAmount = '10';
      if (config.gooeyIntensity === 'light') blurAmount = '5';
      if (config.gooeyIntensity === 'heavy') blurAmount = '15';
      
      // Create filter elements
      
      // 1. Gaussian blur
      const feGaussianBlur = document.createElementNS(filter.namespaceURI, 'feGaussianBlur');
      feGaussianBlur.setAttribute('in', 'SourceGraphic');
      feGaussianBlur.setAttribute('stdDeviation', blurAmount);
      feGaussianBlur.setAttribute('result', 'blur');
      filter.appendChild(feGaussianBlur);
      
      // 2. Color matrix for threshold
      const feColorMatrix = document.createElementNS(filter.namespaceURI, 'feColorMatrix');
      feColorMatrix.setAttribute('in', 'blur');
      feColorMatrix.setAttribute('mode', 'matrix');
      feColorMatrix.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10');
      feColorMatrix.setAttribute('result', 'gooey');
      filter.appendChild(feColorMatrix);
      
      // 3. Composite with original
      const feComposite = document.createElementNS(filter.namespaceURI, 'feComposite');
      feComposite.setAttribute('in', 'SourceGraphic');
      feComposite.setAttribute('in2', 'gooey');
      feComposite.setAttribute('operator', 'atop');
      filter.appendChild(feComposite);
    }
  }

  /**
   * Ensure a filter element exists or is removed
   * @param id Filter ID
   * @param shouldExist Whether the filter should exist
   * @returns The filter element if it should exist, null otherwise
   */
  private ensureFilter(id: string, shouldExist: boolean = true): SVGFilterElement | null {
    let filter = this.defs.querySelector(`#${id}`) as SVGFilterElement;
    
    if (shouldExist) {
      if (!filter) {
        filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', id);
        this.defs.appendChild(filter);
      }
      return filter;
    } else if (filter) {
      filter.remove();
    }
    
    return null;
  }

  /**
   * Ensure an SVG element exists as a child of the specified parent
   * @param tag SVG element tag name
   * @param parent Parent SVG element
   * @returns The child SVG element
   */
  private ensureChild(tag: string, parent: SVGElement): SVGElement {
    let child = parent.querySelector(tag);
    if (!child) {
      child = document.createElementNS('http://www.w3.org/2000/svg', tag);
      parent.appendChild(child);
    }
    return child as SVGElement;
  }
  
  /**
   * Get the last render time in milliseconds
   * @returns Render time in ms
   */
  public getRenderTime(): number {
    return this.lastRenderTime;
  }
  
  /**
   * Clean up any resources used by the renderer
   */
  public dispose(): void {
    // Clean up circles
    this.circles.forEach(circle => {
      if (circle.parentNode) {
        circle.parentNode.removeChild(circle);
      }
    });
    this.circles = [];
    
    // Clear group
    while (this.group.firstChild) {
      this.group.removeChild(this.group.firstChild);
    }
    
    // Clear defs
    while (this.defs.firstChild) {
      this.defs.removeChild(this.defs.firstChild);
    }
  }
}
