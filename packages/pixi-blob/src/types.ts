import { ColorSource } from "pixi.js";

export type BlobVariant =
  | "default"
  | "random"
  | "spiral"
  | "circle"
  | "brownian";
export type BlobState = "chaos" | "organizing" | "structured";

export interface BlobOptions {
  count?: number;
  size?: number;
  colors?: ColorSource[];
  speed?: number;
  variant?: BlobVariant;
  state?: BlobState;
  gooey?: boolean;
  gradientFill?: boolean;
  scaleEffects?: boolean;
}

export interface BlobPoint {
  x: number;
  y: number;
  radius: number;
  color: ColorSource;
  velocity: { x: number; y: number };
}
