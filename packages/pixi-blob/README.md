# pixi-blob

A lightweight, interactive Pixi.js v8+ library for creating beautiful, customizable blob animations using WebGL fragment shaders.

## Features

- 🚀 Optimized for performance using WebGL fragment shaders
- 🌈 Customizable blob properties (count, size, colors, speed)
- 🎨 Multiple animation variants (spiral, random, circle, brownian)
- 🎭 Different animation states (chaos, organizing, structured)
- 🎯 Tree-shakeable ES modules
- 📦 Zero dependencies (Pixi.js as peer dependency)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pixi-blob.git

# Install dependencies
cd pixi-blob
npm install

# Build the package
npm run build
```

Or add it to your project:

```bash
npm install path/to/pixi-blob pixi.js
```

## Usage

### Child Mode (Recommended)

```typescript
import { Application } from "pixi.js";
import { BlobContainer } from "pixi-blob";

// Create Pixi application
const app = new Application();
app.init({
  width: 800,
  height: 600,
  backgroundColor: 0x2a2a2a,
});
document.body.appendChild(app.canvas);

// Create blob container as a child component
const blob = new BlobContainer({
  count: 5,
  size: 30,
  colors: ["#3b82f6"],
  speed: 2.5,
  variant: "spiral",
  state: "chaos",
  gooey: true,
});

// Add to stage
app.stage.addChild(blob);

// Initialize with app dimensions
blob.init(app.renderer.width, app.renderer.height);

// Start animation
app.ticker.add((delta) => {
  blob.update(delta);
});
```

### Standalone Mode

```typescript
import { BlobContainer } from "pixi-blob";

// Create blob container with standalone mode
const blob = new BlobContainer({
  count: 5,
  size: 30,
  colors: ["#3b82f6"],
  speed: 2.5,
  variant: "spiral",
  state: "chaos",
  gooey: true,
}, {
  // Optional application options
  width: 800, 
  height: 600,
  backgroundColor: 0x2a2a2a,
});

// Get the canvas element
document.body.appendChild(blob.canvas);
```

## API Reference

### BlobContainer

The main class for creating and managing blob animations.

#### Constructor

```typescript
const blobContainer = new BlobContainer(options?: BlobOptions, appOptions?: IApplicationOptions);
```

- `options`: Configuration options for the blob animation (see below)
- `appOptions`: PIXI application options for standalone mode (optional)

#### BlobOptions Interface

```typescript
interface BlobOptions {
  count?: number; // Number of blobs (default: 5)
  size?: number; // Base size of blobs (default: 30)
  colors?: ColorSource[]; // Array of colors (default: ['#3b82f6'])
  speed?: number; // Animation speed (default: 1)
  variant?: "default" | "random" | "spiral" | "circle" | "brownian"; // Layout variant
  state?: "chaos" | "organizing" | "structured"; // Animation state
  gooey?: boolean; // Enable gooey effect (default: false)
  gradientFill?: boolean; // Enable gradient fill (default: false)
  scaleEffects?: boolean; // Enable scale effects (default: true)
}
```

#### Methods

- `init(width: number, height: number)`: Initialize the blob animation when used as a child component
- `update(deltaTime?: number)`: Update blob positions and animation state
- `resize(width: number, height: number)`: Resize the animation area
- `setState(state: BlobState)`: Change animation state
- `setVariant(variant: BlobVariant)`: Change layout variant
- `setColors(colors: ColorSource[])`: Update blob colors and count
- `setSize(size: number)`: Update blob size
- `setSpeed(speed: number)`: Update animation speed
- `setGooey(enabled: boolean)`: Enable/disable gooey effect
- `destroy()`: Clean up resources and remove event listeners

#### Properties

- `canvas`: Get the canvas element (only available in standalone mode)

## Demo

Check out the interactive demo in the `/demo` directory to see all features in action.

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build library
pnpm build

# Preview demo
pnpm preview
```

## License

MIT
