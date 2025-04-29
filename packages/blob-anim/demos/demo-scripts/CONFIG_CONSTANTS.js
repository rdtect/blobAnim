// Centralized config constants for BlobAnim demos

export const DEFAULT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export const DEFAULT_PRESETS = {
  playful: {
    count: 8,
    size: 32,
    state: "playful",
    variant: "organic",
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
    speed: 2.2,
    gooey: true,
    scaleEffects: true,
    glass: false,
    gradient: false,
  },
  // Add other presets as needed
};

export const DEMO_DEFAULTS = {
  count: 5,
  size: 30,
  state: "chaos",
  variant: "spiral",
  speed: 1.5,
  gooey: true,
  scaleEffects: false,
  glass: false,
  gradient: false,
};

export const AVAILABLE_VARIANTS = {
  chaos: ["default", "random", "spiral", "explosion", "brownian", "math-explosion", "math", "circle"],
  organizing: ["default", "grid", "spiral", "wave", "cylinder"],
  structured: ["default", "grid", "circle", "orbit", "flower", "basic"],
};

export const PRESETS = {
  playful: {
    count: 8,
    size: 30,
    speed: 2.5,
    colors: ["#3b82f6"],
    state: "chaos",
    variant: "spiral",
    gooey: true,
    scaleEffects: true,
    sizeFactor: 1,
  },
  ocean: {
    count: 10,
    size: 40,
    speed: 1.2,
    colors: ["#0ea5e9", "#0284c7", "#0369a1", "#0c4a6e"],
    colorMode: "gradient",
    state: "organizing",
    variant: "wave",
    gooey: true,
    scaleEffects: true,
    sizeFactor: 0.8,
  },
  lava: {
    count: 5,
    size: 50,
    speed: 0.8,
    colors: ["#ef4444"],
    state: "chaos",
    variant: "default",
    gooey: true,
    scaleEffects: true,
    sizeFactor: 1.2,
  },
  psychedelic: {
    count: 15,
    size: 25,
    speed: 4,
    colors: ["#8b5cf6", "#d946ef", "#ec4899", "#f43f5e"],
    colorMode: "random",
    state: "chaos",
    variant: "explosion",
    gooey: true,
    scaleEffects: true,
    sizeFactor: 0.9,
  },
  organized: {
    count: 9,
    size: 35,
    speed: 1.5,
    colors: ["#10b981"],
    state: "organizing",
    variant: "cylinder",
    gooey: false,
    scaleEffects: true,
    sizeFactor: 1,
  },
  flower: {
    count: 5,
    size: 35,
    speed: 1.0,
    colors: ["#f59e0b", "#f97316", "#ea580c", "#c2410c"],
    colorMode: "sequence",
    state: "structured",
    variant: "flower",
    gooey: true,
    scaleEffects: true,
    sizeFactor: 1.1,
  },
};
