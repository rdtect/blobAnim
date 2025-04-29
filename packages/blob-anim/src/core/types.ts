

// Enhanced, strongly-typed interfaces for BlobAnim

export interface BlobPoint {
  x: number;
  y: number;
  radius?: number;
  color?: string;
  opacity?: number;
  seed?: number;
  velocity?: { x: number; y: number };
}

export interface BlobAnimState {
  data: BlobPoint[]; // Strongly typed now
  time: number;
  previousTime?: number;
  deltaTime?: number;
  fps?: number;
}

export interface BlobAnimConfig {
  count?: number;
  size?: number;
  colors?: string[];
  opacity?: number;
  speed?: number;
  state?: string;
  variant?: string;
  gooey?: boolean;
  gooeyIntensity?: string;
  scaleEffects?: boolean;
  width?: number;
  height?: number;
  glass?: boolean;
  glassBlobs?: number[];
  chaosAmount?: number;
  sizeFactor?: number;
  transitionDuration?: number;
  debug?: boolean;
  gradient?: boolean;
  randomSeed?: number; // For pattern randomness
  paused?: boolean; // To track animation pause state
}

export const DEFAULT_CONFIG: BlobAnimConfig = {
  count: 5,
  size: 20,
  colors: ["#3b82f6"],
  opacity: 1,
  speed: 1,
  state: "chaos",
  variant: "default",
  gooey: true,
  gooeyIntensity: "medium",
  scaleEffects: true,
  glass: false,
  glassBlobs: [],
  chaosAmount: 1.0,
  sizeFactor: 1,
  transitionDuration: 1000,
  debug: false,
  gradient: false,
  randomSeed: 0.5,
  paused: false,
};

// Event types
export type BlobAnimEventType =
  | 'configChange'
  | 'patternChange'
  | 'pause'
  | 'resume'
  | 'start'
  | 'stop'
  | 'render';

export interface BlobAnimEventData {
  configChange?: {
    previous: Partial<BlobAnimConfig>;
    current: BlobAnimConfig;
  };
  patternChange?: {
    previous: string;
    current: string;
  };
  [key: string]: any;
}
