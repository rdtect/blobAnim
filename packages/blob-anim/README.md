# Blob Animation Library

A lightweight, optimized SVG blob animation library with web component support. Create beautiful, interactive animations with minimal code.

## Features

- 🚀 **High Performance**: Optimized SVG-based animations with element reuse
- 🎨 **Customizable**: Multiple animation states and variants with extensive configuration
- 📦 **Lightweight**: Minimal dependencies, just uses D3 under the hood
- 💻 **Easy Integration**: Use as a web component or integrate with your own code
- 🔄 **Responsive**: Automatically adapts to container size changes
- 🎮 **Interactive**: Configurable with attributes or JavaScript API
- 🔍 **Developer Friendly**: TypeScript support and comprehensive documentation

## Installation

```bash
npm install blob-anim
```

## Usage

### Basic Web Component Usage

```html
<blob-element
  count="5"
  size="20"
  state="chaos"
  variant="spiral"
  colors='["#3b82f6", "#10b981", "#f59e0b"]'
  gooey
></blob-element>
```

### JavaScript API

```javascript
import { BlobElement } from 'blob-anim';

// Register the web component if not using import
// customElements.define('blob-element', BlobElement);

// Create element and add to DOM
const blob = document.createElement('blob-element');
blob.setAttribute('count', '5');
blob.setAttribute('color', '#3b82f6');
blob.setAttribute('state', 'chaos');
blob.setAttribute('variant', 'spiral');
blob.setAttribute('gooey', '');
document.body.appendChild(blob);

// Or use the object API
blob.update({
  count: 7,
  size: 30,
  colors: ['#3b82f6', '#10b981', '#f59e0b'],
  state: 'organizing',
  variant: 'default',
  gooey: true,
  chaosAmount: 0.7
});

// Events
blob.addEventListener('blob:configChange', (e) => {
  console.log('Configuration changed:', e.detail);
});
```

### Advanced Usage with Direct API Access

```javascript
import { 
  BlobAnimEngine, 
  ChaosPattern,
  TransitionManager
} from 'blob-anim';

// Create an SVG element
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('width', '400');
svg.setAttribute('height', '400');
document.body.appendChild(svg);

// Create and configure the animation engine
const engine = new BlobAnimEngine(svg, {
  count: 5,
  size: 20,
  colors: ['#3b82f6'],
  state: 'chaos',
  variant: 'spiral',
  gooey: true
}, new ChaosPattern());

// Start the animation
engine.start();

// Update configuration
engine.updateConfig({
  count: 7,
  colors: ['#3b82f6', '#10b981', '#f59e0b']
});

// Subscribe to events
engine.on('configChange', (data) => {
  console.log('Configuration changed:', data);
});

// Control animation
document.getElementById('pauseBtn').addEventListener('click', () => {
  engine.pause();
});

document.getElementById('resumeBtn').addEventListener('click', () => {
  engine.resume();
});
```

## Configuration Options

### Attributes / Configuration Properties

| Attribute     | Property      | Type                | Default     | Description                                     |
|---------------|---------------|---------------------|-------------|-------------------------------------------------|
| count         | count         | number              | 5           | Number of blobs to display                      |
| size          | size          | number              | 20          | Size of each blob                               |
| color         | colors        | string              | #3b82f6     | Single color (as attribute)                     |
| colors        | colors        | string[]            | ['#3b82f6'] | Array of colors (alternate syntax)              |
| state         | state         | string              | chaos       | Animation state (chaos, organizing, structured) |
| variant       | variant       | string              | default     | Variant within the state                        |
| speed         | speed         | number              | 1           | Animation speed                                 |
| gooey         | gooey         | boolean             | true        | Enable gooey effect                             |
| gooey-intensity | gooeyIntensity | string           | medium      | Gooey effect intensity (light, medium, heavy)   |
| scaleeffects  | scaleEffects  | boolean             | true        | Enable scaling effects                          |
| width         | width         | number              | auto        | Canvas width (optional)                         |
| height        | height        | number              | auto        | Canvas height (optional)                        |
| opacity       | opacity       | number              | 1           | Blob opacity (0-1)                              |
| glass         | glass         | boolean             | false       | Enable glass effect                             |
| glassblobs    | glassBlobs    | number[]            | []          | Indices of blobs to apply glass effect          |
| chaosamount   | chaosAmount   | number              | 1.0         | Amount of chaos (0-1)                           |
| sizefactor    | sizeFactor    | number              | 1           | Size multiplier                                 |
| gradient      | gradient      | boolean             | false       | Enable gradient fill                            |
| debug         | debug         | boolean             | false       | Enable debug mode                               |

### Animation States

- `chaos`: Random, unpredictable motion
- `organizing`: Transitioning from chaos to structure
- `structured`: Organized, predictable patterns

### Variants

#### Chaos Variants
- `default`: Gentle random motion
- `orbital`: Blobs orbit around a center point
- `true`: Highly chaotic random motion
- `spiral`: Spiraling motion
- `explosion`: Pulsing explosion effect
- `brownian`: Brownian motion physics simulation

#### Organizing Variants
- `default`: Basic organizing motion
- `wave`: Wave-like motion
- `converge`: Blobs converge toward center
- `pulse`: Pulsing organization

#### Structured Variants
- `default`: Basic structured pattern
- `circle`: Circle formation
- `grid`: Grid arrangement
- `line`: Linear arrangement
- `flower`: Flower-like formation

## Events

The BlobElement and BlobAnimEngine emit the following events:

| Event Name      | Description                            | Detail                       |
|-----------------|----------------------------------------|------------------------------|
| blob:start      | Animation started                      | -                            |
| blob:stop       | Animation stopped                      | -                            |
| blob:pause      | Animation paused                       | -                            |
| blob:resume     | Animation resumed                      | -                            |
| blob:configChange | Configuration changed                | { previous, current }        |
| blob:render     | Frame rendered                         | { renderTime, pointCount }   |

## Methods

### BlobElement Methods

| Method                   | Description                                     |
|--------------------------|-------------------------------------------------|
| update(config)           | Update configuration                            |
| resize(width, height)    | Resize the animation                            |
| pause()                  | Pause the animation                             |
| resume()                 | Resume the animation                            |
| getPerformanceMetrics()  | Get performance data (FPS)                      |
| destroy()                | Clean up resources                              |

### BlobAnimEngine Methods

| Method                    | Description                                    |
|---------------------------|------------------------------------------------|
| start()                   | Start the animation                            |
| stop()                    | Stop the animation                             |
| pause()                   | Pause the animation                            |
| resume()                  | Resume the animation                           |
| updateConfig(config)      | Update configuration                           |
| setPattern(pattern)       | Change the animation pattern                   |
| on(event, callback)       | Subscribe to events                            |
| getPerformanceMetrics()   | Get performance data (FPS)                     |
| dispose()                 | Clean up resources                             |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Legacy browser support is included with appropriate fallbacks.

## Performance Optimization

The library is optimized for performance:
- DOM element reuse instead of recreation
- Delta-time based animation for consistent timing
- Pre-calculation of animation constants
- Efficient SVG rendering
- Minimal DOM operations

## Custom Patterns

You can create custom patterns by extending the `BlobPattern` class:

```javascript
import { BlobPattern, BlobAnimConfig, BlobAnimState, BlobPoint } from 'blob-anim';

export class MyCustomPattern extends BlobPattern {
  // Initialize with configuration
  public initialize(config: BlobAnimConfig): void {
    super.initialize(config);
    
    // Pre-calculate constants
    const count = config.count || 5;
    this.frequencies = Array.from({ length: count }, (_, i) => i * 0.1);
  }
  
  // Generate points for each frame
  public generatePoints(config: BlobAnimConfig, state: BlobAnimState): BlobPoint[] {
    const count = config.count || 5;
    const width = config.width || 200;
    const height = config.height || 200;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Create points array
    const points: BlobPoint[] = [];
    
    for (let i = 0; i < count; i++) {
      // Calculate position with custom logic
      const angle = (i / count) * Math.PI * 2 + state.time;
      const radius = 50 + Math.sin(state.time + i) * 20;
      
      // Add point
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        radius: config.size,
        color: config.colors?.[i % (config.colors?.length || 1)]
      });
    }
    
    return points;
  }
}
```

## License

MIT License
