export interface BlobAnimConfig {
  count: number;
  size: number;
  colors?: string[];
  state?: string;
  variant?: string;
  speed?: number;
  gooey?: boolean;
  gooeyIntensity?: "light" | "medium" | "heavy";
  scaleEffects?: boolean;
  width?: number;
  height?: number;
  opacity?: number;
  glass?: boolean;
  glassBlobs?: number[];
  chaosAmount?: number;
  sizeFactor?: number;
  gradient?: boolean;
  debug?: boolean;
  paused?: boolean;
  transitionDuration?: number;
  attraction?: number;
  repulsion?: number;
}

export interface BlobPoint {
  x: number;
  y: number;
  radius?: number;
  color?: string;
  opacity?: number;
  id?: string | number;
  initialAngle?: number;
}

export interface BlobAnimState {
  data: BlobPoint[];
  time: number;
  fps: number;
  deltaTime?: number;
  previousTime?: number;
}

export type AnimationState = "chaos" | "organizing" | "structured";

export interface AnimationConfig {
  states: {
    name: string;
    variants: string[];
  }[];
}

export interface TransitionData {
  startConfig: BlobAnimConfig;
  endConfig: BlobAnimConfig;
  startTime: number;
  duration: number;
  progress: number;
  active: boolean;
}
