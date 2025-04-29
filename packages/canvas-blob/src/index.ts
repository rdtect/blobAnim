// Export the web component
export { CanvasBlobElement } from "./components/canvas-blob-element";

// Export core types for public use
export * from "./core/types";

// Export core components for advanced usage
export { CanvasBlobEngine } from "./core/CanvasBlobEngine";
export { CanvasRenderer } from "./core/CanvasRenderer";
export { EventEmitter } from "./core/EventEmitter";
export { TransitionManager } from "./core/TransitionManager";

// Export pattern classes
export { BlobPattern } from "./patterns/BlobPattern";
export {
  ChaosPattern,
  OrganizingPattern,
  StructuredPattern,
  PatternRegistry,
  ANIMATION_CONFIG,
} from "./patterns/index";
