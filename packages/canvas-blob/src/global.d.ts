/**
 * Global TypeScript declarations for canvas-blob library
 */

// Define global types for DOM and requestAnimationFrame
interface Window {
  requestAnimationFrame(callback: (time: number) => void): number;
  cancelAnimationFrame(handle: number): void;
  performance: Performance;
  p5: any;
}

interface Document {
  createElement(tagName: string): HTMLElement;
}

interface HTMLElement {
  style: CSSStyleDeclaration;
  parentElement: HTMLElement | null;
  appendChild(node: Node): Node;
  removeChild(node: Node): Node;
}

interface HTMLCanvasElement extends HTMLElement {
  width: number;
  height: number;
  getContext(contextId: "2d"): CanvasRenderingContext2D | null;
}

interface Performance {
  now(): number;
}

// Declare global variables
declare var document: Document;
declare var window: Window;
declare var performance: Performance;
declare var requestAnimationFrame: (callback: (time: number) => void) => number;
declare var cancelAnimationFrame: (handle: number) => void;

// Declare module for p5.js
declare module "p5" {
  // P5 has both a default export and named exports
  const p5: any;
  export = p5;
  export as namespace p5;
}
