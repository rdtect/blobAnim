// Export the web component
export { BlobElement } from "./components/blob-element";

// Export core types for public use
export * from "./core/types";

// Export core components for advanced usage
export { BlobAnimEngine } from "./core/BlobAnimEngine";
export { BlobRenderer } from "./core/BlobRenderer";
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
} from "./patterns";
