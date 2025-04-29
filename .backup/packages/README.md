# BlobAnim

A simplified, D3-based blob animation library with SVG rendering and pattern support.

## Features

- **Simple API**: Easy to use with sensible defaults
- **Pattern System**: Choose from chaos, organizing, and structured patterns
- **D3 Integration**: Uses D3 for SVG creation and manipulation
- **Gooey Effect**: SVG filter for blob merging effect
- **Lightweight**: Minimal dependencies and optimized code

## Usage

### Standard Version

```html
<!-- Include D3 -->
<script src="https://d3js.org/d3.v7.min.js"></script>
<!-- Include BlobAnim -->
<script src="simple.js"></script>

<script>
  // Create animation with default settings
  const animation = createAnim(document.getElementById("container"));

  // Or with custom configuration
  const customAnimation = createAnim(document.getElementById("container"), {
    count: 10,
    size: 20,
    color: "#3b82f6",
    opacity: 0.8,
    speed: 1,
    state: "chaos",
    variant: "default",
    gooey: true,
  });

  // Update configuration
  customAnimation.update({
    state: "organizing",
    count: 20,
  });

  // Pause/resume animation
  customAnimation.pause();
  customAnimation.resume();

  // Cleanup
  customAnimation.destroy();
</script>
```

### ES Module Version

```javascript
import { createAnim } from "./simple-module.js";

// Create animation
const animation = createAnim(document.getElementById("container"), {
  count: 10,
  size: 20,
  color: "#3b82f6",
  speed: 1,
});

// Update, pause, resume, destroy as above
```

## Configuration Options

- `count`: Number of blobs (default: 10)
- `size`: Size of blobs in pixels (default: 20)
- `color`: Blob color (default: '#3b82f6')
- `colors`: Array of colors for multi-colored blobs (default: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'])
- `solidColor`: Use a single color for all blobs (default: true)
- `opacity`: Blob opacity (default: 0.8)
- `speed`: Animation speed (default: 1)
- `state`: Animation state ('chaos', 'organizing', 'structured', default: 'chaos')
- `variant`: Animation variant (default: 'default')
- `gooey`: Enable gooey effect (default: true)
- `scaleEffects`: Enable scale effects for 2.5D look (default: true)

## Animation States and Variants

### Chaos

Random, unpredictable movement with smooth transitions.

**Variants:**

- `default`: Mathematical pattern with smooth movement
- `spiral`: Elements move in a spiral pattern
- `explosion`: Elements explode outward and then contract

### Organizing

Semi-structured movement with elements arranging in a grid pattern.

**Variants:**

- `default`: Grid arrangement with movement
- `wave`: Wave-like movement across the container
- `cylinder`: 3D-like cylinder effect with rotation

### Structured

Orderly, predictable movement with minimal randomness.

**Variants:**

- `default`: Circular arrangement with minimal movement
- `orbit`: Planetary orbit system with multiple rings
- `flower`: Flower petal arrangement with rotation

## API Reference

### createAnim(container, options)

Creates a new blob animation and returns control methods.

**Parameters:**

- `container`: HTML element to host the animation
- `options`: Configuration options (optional)

**Returns:**

- `update(options)`: Update animation configuration
- `pause()`: Pause the animation
- `resume()`: Resume the animation
- `getPerformanceMetrics()`: Get performance metrics (fps, count)
- `destroy()`: Clean up resources
