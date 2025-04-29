/**
 * BlobAnim Showcase App
 *
 * Main entry point for the showcase application.
 * Handles initialization and UI interactivity.
 */

// Import BlobAnim web component via Vite alias
import "../../../packages/blob-anim/demos/blob-anim.es";

// Make file a module by adding an empty export
export {};

// Type definitions
type ThemeMode = "light" | "dark";

// Properly declare global types
declare global {
  interface Window {
    APP: AppInterface;
  }
}

interface AppInterface {
  theme: ThemeMode;
  isDarkTheme: boolean;
  toggleTheme: () => void;
  initTheme: () => void;
}

interface AnimationInstance {
  update: (config: any) => any;
  pause: () => any;
  resume: () => any;
  getPerformanceMetrics: () => { fps: number };
  destroy: () => void;
}

interface BlobAnimElement extends HTMLElement {
  update: (config: any) => BlobAnimElement;
  pause: () => BlobAnimElement;
  resume: () => BlobAnimElement;
  resize: (width: number, height: number) => BlobAnimElement;
  getPerformanceMetrics: () => { fps: number };
  destroy: () => BlobAnimElement;
}

// Initialize the global app object
const initializeApp = (): void => {
  // Create global app properties
  window.APP = {} as AppInterface;

  // Setup theme control
  window.APP.theme = "light";
  window.APP.isDarkTheme = false;

  // Initialize theme based on user preference
  window.APP.initTheme = () => {
    const savedTheme = localStorage.getItem("blobAnim-theme");
    const prefersDark =
      window.matchMedia?.("(prefers-color-scheme: dark)")?.matches || false;
    const initialTheme = (savedTheme ||
      (prefersDark ? "dark" : "light")) as ThemeMode;

    document.documentElement.setAttribute("data-theme", initialTheme);
    window.APP.isDarkTheme = initialTheme === "dark";
    window.APP.theme = initialTheme;

    // Update theme toggle button
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.innerHTML = window.APP.isDarkTheme ? "☀️" : "🌙";
      themeToggle.setAttribute(
        "aria-label",
        window.APP.isDarkTheme
          ? "Switch to light theme"
          : "Switch to dark theme"
      );
    }
  };

  // Toggle between light and dark theme
  window.APP.toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute(
      "data-theme"
    ) as ThemeMode;
    const isDarkTheme = currentTheme === "dark";
    const newTheme = isDarkTheme ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("blobAnim-theme", newTheme);

    window.APP.isDarkTheme = !isDarkTheme;
    window.APP.theme = newTheme;

    // Update theme toggle button
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.innerHTML = !isDarkTheme ? "☀️" : "🌙";
      themeToggle.setAttribute(
        "aria-label",
        !isDarkTheme ? "Switch to light theme" : "Switch to dark theme"
      );
    }
  };

  // Initialize theme
  window.APP.initTheme();
};

// --- Advanced Controls State ---
interface ColorState {
  colors: string[];
  opacity: number;
}

const colorState: ColorState = {
  colors: ["#3b82f6"],
  opacity: 1.0,
};

// --- Utility Functions ---
function renderColorChips() {
  const chips = document.getElementById("colorChips");
  if (!chips) return;
  chips.innerHTML = "";
  colorState.colors.forEach((color, idx) => {
    const chip = document.createElement("div");
    chip.className = "color-chip";
    chip.style.backgroundColor = color;
    chip.title = color;
    chip.tabIndex = 0;
    chip.addEventListener("click", () => {
      colorState.colors.splice(idx, 1);
      renderColorChips();
      updateBlobAnimColors();
    });
    // Remove button
    const rm = document.createElement("button");
    rm.className = "remove-chip";
    rm.innerHTML = "&times;";
    rm.type = "button";
    rm.onclick = (e) => {
      e.stopPropagation();
      colorState.colors.splice(idx, 1);
      renderColorChips();
      updateBlobAnimColors();
    };
    chip.appendChild(rm);
    chips.appendChild(chip);
  });
}

function updateBlobAnimColors() {
  const blobAnim = document.querySelector("blob-anim") as any;
  if (blobAnim) {
    blobAnim.update?.({
      colors: colorState.colors,
      colorOpacity: colorState.opacity,
    });
  }
}

// --- Setup Advanced Controls ---
function setupAdvancedControls() {
  // Color Picker
  const colorPicker = document.getElementById("colorPicker") as HTMLInputElement;
  const addColorBtn = document.getElementById("addColorBtn");
  const clearColorsBtn = document.getElementById("clearColorsBtn");
  const opacitySlider = document.getElementById("colorOpacitySlider") as HTMLInputElement;
  const opacityValue = document.getElementById("opacityValueDisplay");

  if (colorPicker && addColorBtn) {
    addColorBtn.addEventListener("click", () => {
      if (!colorState.colors.includes(colorPicker.value)) {
        colorState.colors.push(colorPicker.value);
        renderColorChips();
        updateBlobAnimColors();
      }
    });
  }
  if (clearColorsBtn) {
    clearColorsBtn.addEventListener("click", () => {
      colorState.colors = ["#3b82f6"];
      renderColorChips();
      updateBlobAnimColors();
    });
  }
  if (opacitySlider && opacityValue) {
    opacitySlider.value = colorState.opacity.toString();
    opacityValue.textContent = colorState.opacity.toFixed(1);
    opacitySlider.addEventListener("input", () => {
      colorState.opacity = parseFloat(opacitySlider.value);
      opacityValue.textContent = colorState.opacity.toFixed(1);
      updateBlobAnimColors();
    });
  }
  renderColorChips();
}

// --- Effects Toggles ---
function setupEffectsToggles() {
  const gooey = document.getElementById("gooey") as HTMLInputElement;
  const scale = document.getElementById("scaleEffects") as HTMLInputElement;
  const blobAnim = document.querySelector("blob-anim") as any;
  if (gooey) {
    gooey.addEventListener("change", () => {
      blobAnim?.update?.({ gooey: gooey.checked });
    });
  }
  if (scale) {
    scale.addEventListener("change", () => {
      blobAnim?.update?.({ scaleEffects: scale.checked });
    });
  }
}

// --- Variant Dropdown ---
const availableVariants: Record<string, string[]> = {
  chaos: ["default", "random", "spiral", "explosion", "brownian", "math-explosion", "math", "circle"],
  organizing: ["default", "grid", "spiral", "wave", "cylinder"],
  structured: ["default", "grid", "circle", "orbit", "flower", "basic"],
};
function setupVariantDropdown() {
  const stateSelect = document.getElementById("state-select") as HTMLSelectElement;
  const variantSelect = document.getElementById("variant-select") as HTMLSelectElement;
  const blobAnim = document.querySelector("blob-anim") as any;
  function updateVariants(state: string) {
    variantSelect.innerHTML = "";
    availableVariants[state]?.forEach((variant) => {
      const option = document.createElement("option");
      option.value = variant;
      option.textContent = variant.charAt(0).toUpperCase() + variant.slice(1);
      variantSelect.appendChild(option);
    });
  }
  if (stateSelect && variantSelect) {
    stateSelect.addEventListener("change", () => {
      updateVariants(stateSelect.value);
      blobAnim?.update?.({ state: stateSelect.value, variant: variantSelect.value });
    });
    variantSelect.addEventListener("change", () => {
      blobAnim?.update?.({ variant: variantSelect.value });
    });
    updateVariants(stateSelect.value);
  }
}

// Setup animation controls
const setupControls = (): void => {
  const blobAnim = document.querySelector("blob-anim") as BlobAnimElement;
  if (!blobAnim) {
    console.error("Blob animation element not found");
    return;
  }

  // Update animation with form values
  const updateAnimation = () => {
    const countSlider = document.getElementById(
      "count-slider"
    ) as HTMLInputElement;
    const sizeSlider = document.getElementById(
      "size-slider"
    ) as HTMLInputElement;
    const speedSlider = document.getElementById(
      "speed-slider"
    ) as HTMLInputElement;
    const colorPicker = document.getElementById(
      "color-picker"
    ) as HTMLInputElement;
    const stateSelect = document.getElementById(
      "state-select"
    ) as HTMLSelectElement;
    const gooeyCheckbox = document.getElementById(
      "gooey-checkbox"
    ) as HTMLInputElement;
    const scaleCheckbox = document.getElementById(
      "scale-checkbox"
    ) as HTMLInputElement;

    if (
      !countSlider ||
      !sizeSlider ||
      !speedSlider ||
      !colorPicker ||
      !stateSelect ||
      !gooeyCheckbox ||
      !scaleCheckbox
    ) {
      console.error("One or more control elements not found");
      return;
    }

    const count = countSlider.value;
    const size = sizeSlider.value;
    const speed = speedSlider.value;
    const color = colorPicker.value;
    const state = stateSelect.value;
    const gooey = gooeyCheckbox.checked;
    const scaleEffects = scaleCheckbox.checked;

    // Update the animation
    blobAnim.setAttribute("count", count);
    blobAnim.setAttribute("size", size);
    blobAnim.setAttribute("speed", speed);
    blobAnim.setAttribute("color", color);
    blobAnim.setAttribute("state", state);

    // Toggle boolean attributes
    if (gooey) {
      blobAnim.setAttribute("gooey", "");
    } else {
      blobAnim.removeAttribute("gooey");
    }

    if (scaleEffects) {
      blobAnim.setAttribute("scaleeffects", "");
    } else {
      blobAnim.removeAttribute("scaleeffects");
    }

    // Update displayed values
    const countValue = document.getElementById("count-value");
    const sizeValue = document.getElementById("size-value");
    const speedValue = document.getElementById("speed-value");

    if (countValue) countValue.textContent = count;
    if (sizeValue) sizeValue.textContent = size;
    if (speedValue) speedValue.textContent = speed;
  };

  // Add input event listeners
  document
    .getElementById("count-slider")
    ?.addEventListener("input", updateAnimation);
  document
    .getElementById("size-slider")
    ?.addEventListener("input", updateAnimation);
  document
    .getElementById("speed-slider")
    ?.addEventListener("input", updateAnimation);
  document
    .getElementById("color-picker")
    ?.addEventListener("change", updateAnimation);
  document
    .getElementById("state-select")
    ?.addEventListener("change", updateAnimation);
  document
    .getElementById("gooey-checkbox")
    ?.addEventListener("change", updateAnimation);
  document
    .getElementById("scale-checkbox")
    ?.addEventListener("change", updateAnimation);

  // Button controls
  document
    .getElementById("update-btn")
    ?.addEventListener("click", updateAnimation);
  document
    .getElementById("pause-btn")
    ?.addEventListener("click", () => blobAnim.pause());
  document
    .getElementById("resume-btn")
    ?.addEventListener("click", () => blobAnim.resume());

  // Reset button
  document.getElementById("reset-btn")?.addEventListener("click", () => {
    const countSlider = document.getElementById(
      "count-slider"
    ) as HTMLInputElement;
    const sizeSlider = document.getElementById(
      "size-slider"
    ) as HTMLInputElement;
    const speedSlider = document.getElementById(
      "speed-slider"
    ) as HTMLInputElement;
    const colorPicker = document.getElementById(
      "color-picker"
    ) as HTMLInputElement;
    const stateSelect = document.getElementById(
      "state-select"
    ) as HTMLSelectElement;
    const gooeyCheckbox = document.getElementById(
      "gooey-checkbox"
    ) as HTMLInputElement;
    const scaleCheckbox = document.getElementById(
      "scale-checkbox"
    ) as HTMLInputElement;

    if (
      !countSlider ||
      !sizeSlider ||
      !speedSlider ||
      !colorPicker ||
      !stateSelect ||
      !gooeyCheckbox ||
      !scaleCheckbox
    ) {
      console.error("One or more control elements not found");
      return;
    }

    countSlider.value = "3";
    sizeSlider.value = "40";
    speedSlider.value = "1.5";
    colorPicker.value = "#3b82f6";
    stateSelect.value = "chaos";
    gooeyCheckbox.checked = true;
    scaleCheckbox.checked = true;
    updateAnimation();
  });

  // Initialize with default values
  updateAnimation();
};

// Setup tab functionality for code examples
const setupTabs = (): void => {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs
      tabs.forEach((t) => t.classList.remove("active"));

      // Add active class to clicked tab
      tab.classList.add("active");

      // Hide all tab content
      const tabContents = document.querySelectorAll(".tab-content");
      tabContents.forEach((content) => content.classList.remove("active"));

      // Show selected tab content
      const tabId = `${(tab as HTMLElement).dataset.tab}-tab`;
      const contentElement = document.getElementById(tabId);
      if (contentElement) {
        contentElement.classList.add("active");
      }
    });
  });
};

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize the app
  initializeApp();

  // Setup theme toggle
  document
    .getElementById("theme-toggle")
    ?.addEventListener("click", window.APP.toggleTheme);

  // Setup animation controls
  setupControls();

  // Setup advanced controls
  setupAdvancedControls();
  setupEffectsToggles();
  setupVariantDropdown();

  // Setup tab functionality
  setupTabs();

  console.log("BlobAnim Showcase initialized");
});
