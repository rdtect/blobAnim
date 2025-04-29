// Main entry for BlobAnim demos
import "../blob-anim.es.js";
// createAnim is deprecated; use the web component API directly
import { DEFAULT_COLORS, DEFAULT_PRESETS, DEMO_DEFAULTS, AVAILABLE_VARIANTS, PRESETS } from "./CONFIG_CONSTANTS.js";
import { displayErrorMessage, updateVariantOptions, updateCodePreview, renderColorChips, hexToRgba, extractOpacityFromRgba } from "./helpers.js";

// --- Interactive Demo ---
export function initInteractiveDemo() {
  console.log("Initializing interactive demo...");
  // Use the globally cached element if available (from waitForBlobElementReady)
  const blobElement = window.debugBlobAnim?.blobElement || document.getElementById("demo-blob");
  if (!blobElement) {
    console.error("Could not find demo-blob element!");
    return;
  }
  if (!blobElement.shadowRoot) {
    console.warn("BlobElement found but shadowRoot not initialized yet");
  }
  console.log("Found blob-element:", blobElement);

  // --- Controls ---
  const countInput = document.getElementById("count");
  const sizeInput = document.getElementById("size");
  const sizeFactorInput = document.getElementById("sizeFactor");
  const speedInput = document.getElementById("speed");
  const colorInput = document.getElementById("colorPicker");
  const colorOpacityInput = document.getElementById("colorOpacitySlider");
  const colorChipsContainer = document.getElementById("colorChips");
  const addColorBtn = document.getElementById("addColorBtn");
  const clearColorsBtn = document.getElementById("clearColorsBtn");
  const glassEffectCheckbox = document.getElementById("glassEffect");
  const glassOpacityInput = document.getElementById("glassOpacity");
  const glassBlobsInput = document.getElementById("glassBlobs");
  const glassOpacityValue = document.getElementById("glassOpacityValue");
  const glassBlobsValue = document.getElementById("glassBlobsValue");
  const chaosAmountInput = document.getElementById("chaosAmount");
  const chaosAmountValue = document.getElementById("chaosAmountValue");
  const stateButtons = document.querySelectorAll(".state-btn");
  const variantSelect = document.getElementById("variant");
  const gooeyCheckbox = document.getElementById("gooey");
  const scaleEffectsCheckbox = document.getElementById("scaleEffects");
  const gradientCheckbox = document.getElementById("gradientFill");
  const widthInput = document.getElementById("width");
  const heightInput = document.getElementById("height");
  const widthValue = document.getElementById("widthValue");
  const heightValue = document.getElementById("heightValue");
  const pauseBtn = document.getElementById("pauseBtn");
  const resumeBtn = document.getElementById("resumeBtn");
  const resetBtn = document.getElementById("resetBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const countValue = document.getElementById("countValue");
  const sizeValue = document.getElementById("sizeValue");
  const sizeFactorValue = document.getElementById("sizeFactorValue");
  const speedValue = document.getElementById("speedValue");
  const opacityValue = document.getElementById("opacityValueDisplay");
  const presetButtons = document.querySelectorAll(".preset");
  
  // Log which controls were found
  console.log("Controls found:", {
    countInput, sizeInput, colorInput, variantSelect, 
    gooeyCheckbox, glassEffectCheckbox, gradientCheckbox
  });

  // --- State ---
  let colorList = ["#3b82f6"];
  const GLASS_FILTER = { enabled: false, opacity: 0.7, reflectionIntensity: 0.3 };

  // --- Color Chip Logic ---
  function updateBlobColors() {
    if (colorList.length === 0) {
      colorList = ["#3b82f6"];
      renderColorChips(colorList, colorChipsContainer, colorInput, colorOpacityInput, opacityValue, updateBlobColors, editColor, removeColor);
    }
    const updatedColors = colorList.slice();
    blobElement.update({ colors: updatedColors });
  }

  function editColor(index) {
    const color = colorList[index];
    if (color.startsWith("rgba")) {
      const rgbMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
      if (rgbMatch) {
        const [_, r, g, b] = rgbMatch;
        const hex = "#" + parseInt(r).toString(16).padStart(2, "0") + parseInt(g).toString(16).padStart(2, "0") + parseInt(b).toString(16).padStart(2, "0");
        colorInput.value = hex;
        const opacity = extractOpacityFromRgba(color);
        colorOpacityInput.value = opacity;
        opacityValue.textContent = opacity;
      }
    } else {
      colorInput.value = color;
      colorOpacityInput.value = 1;
      opacityValue.textContent = "1.0";
    }
    colorList.splice(index, 1);
    updateBlobColors();
  }

  function removeColor(index) {
    colorList.splice(index, 1);
    updateBlobColors();
  }

  function addColor() {
    const color = colorInput.value;
    const opacity = parseFloat(colorOpacityInput.value);
    let finalColor = color;
    if (opacity < 1) {
      const rgbColor = hexToRgba(color, opacity);
      finalColor = rgbColor;
    }
    colorList.push(finalColor);
    updateBlobColors();
  }

  // --- Glass Effect Logic ---
  function updateGlassEffect() {
    GLASS_FILTER.enabled = glassEffectCheckbox.checked;
    blobElement.update({ glass: GLASS_FILTER.enabled });
  }

  function updateGlassOpacity() {
    GLASS_FILTER.opacity = parseFloat(glassOpacityInput.value);
    glassOpacityValue.textContent = GLASS_FILTER.opacity.toFixed(1);
    blobElement.update({ glassOpacity: GLASS_FILTER.opacity });
  }

  function updateGlassBlobs() {
    const blobsValue = parseInt(glassBlobsInput.value);
    glassBlobsValue.textContent = blobsValue;
    blobElement.update({ glassBlobs: Array.from({ length: blobsValue }, (_, i) => i) });
  }

  // --- Event Listeners ---
  addColorBtn.addEventListener("click", addColor);
  clearColorsBtn.addEventListener("click", () => {
    colorList = [];
    updateBlobColors();
  });

  colorInput.addEventListener("input", () => {
    const color = colorInput.value;
    const opacity = parseFloat(colorOpacityInput.value);
    if (opacity < 1) {
      const rgbColor = hexToRgba(color, opacity);
      colorInput.dataset.color = rgbColor;
    } else {
      colorInput.dataset.color = color;
    }
  });

  colorOpacityInput.addEventListener("input", () => {
    const opacity = parseFloat(colorOpacityInput.value);
    opacityValue.textContent = opacity.toFixed(1);
    const color = colorInput.value;
    if (opacity < 1) {
      const rgbColor = hexToRgba(color, opacity);
      colorInput.dataset.color = rgbColor;
    } else {
      colorInput.dataset.color = color;
    }
  });

  glassEffectCheckbox.addEventListener("change", updateGlassEffect);
  glassOpacityInput.addEventListener("input", updateGlassOpacity);
  glassBlobsInput.addEventListener("input", updateGlassBlobs);
  gradientCheckbox && gradientCheckbox.addEventListener("change", (e) => {
    blobElement.update({ gradient: !!e.target.checked });
  });
  gooeyCheckbox.addEventListener("change", () => {
    blobElement.update({ gooey: gooeyCheckbox.checked });
  });
  scaleEffectsCheckbox.addEventListener("change", () => {
    blobElement.update({ scaleEffects: scaleEffectsCheckbox.checked });
  });

  // --- Size and Numeric Controls ---
  widthInput.addEventListener("input", () => {
    console.log("Width changed:", widthInput.value);
    const width = parseInt(widthInput.value);
    widthValue.textContent = width;
    blobElement.style.width = `${width}px`;
    blobElement.update({ width });
  });
  
  heightInput.addEventListener("input", () => {
    console.log("Height changed:", heightInput.value);
    const height = parseInt(heightInput.value);
    heightValue.textContent = height;
    blobElement.style.height = `${height}px`;
    blobElement.update({ height });
  });
  
  countInput.addEventListener("input", () => {
    console.log("Count changed:", countInput.value);
    countValue.textContent = countInput.value;
    blobElement.update({ count: parseInt(countInput.value) });
  });
  
  sizeInput.addEventListener("input", () => {
    console.log("Size changed:", sizeInput.value);
    sizeValue.textContent = sizeInput.value;
    blobElement.update({ size: parseInt(sizeInput.value) });
  });
  
  sizeFactorInput.addEventListener("input", () => {
    console.log("Size factor changed:", sizeFactorInput.value);
    sizeFactorValue.textContent = parseFloat(sizeFactorInput.value).toFixed(1);
    blobElement.update({ sizeFactor: parseFloat(sizeFactorInput.value) });
  });
  
  speedInput.addEventListener("input", () => {
    console.log("Speed changed:", speedInput.value);
    speedValue.textContent = speedInput.value;
    blobElement.update({ speed: parseFloat(speedInput.value) });
  });
  
  variantSelect.addEventListener("change", () => {
    console.log("Variant changed:", variantSelect.value);
    blobElement.update({ variant: variantSelect.value });
  });

  chaosAmountInput.addEventListener("input", () => {
    const chaosAmount = parseFloat(chaosAmountInput.value);
    chaosAmountValue.textContent = chaosAmount.toFixed(1);
    blobElement.update({ chaosAmount });
  });

  // --- State Buttons ---
  stateButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      stateButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const state = btn.dataset.state;
      blobElement.update({ state });
      updateVariantOptions(state);
    });
  });

  // --- Pause/Resume Buttons ---
  pauseBtn.addEventListener("click", () => {
    if (blobElement && typeof blobElement.pause === 'function') {
      blobElement.pause();
    }
    pauseBtn.disabled = true;
    resumeBtn.disabled = false;
  });

  resumeBtn.addEventListener("click", () => {
    if (blobElement && typeof blobElement.resume === 'function') {
      blobElement.resume();
    }
    pauseBtn.disabled = false;
    resumeBtn.disabled = true;
  });

  // --- Reset Button ---
  resetBtn.addEventListener("click", () => {
    blobElement.update(DEMO_DEFAULTS);
    updateCodePreview(DEMO_DEFAULTS);
  });

  // --- Download Button ---
  downloadBtn.addEventListener("click", () => {
    const svgElement = blobElement.shadowRoot.querySelector("svg");
    if (!svgElement) {
      displayErrorMessage("SVG element not found for download");
      return;
    }
    // Download logic...
  });

  // --- Presets ---
  presetButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const presetName = btn.dataset.preset;
      applyPreset(presetName);
    });
  });

  // --- Apply Preset ---
  function applyPreset(presetName) {
    if (!PRESETS[presetName]) return;
    const preset = { ...PRESETS[presetName] };
    
    // Update UI controls to match preset
    if (preset.count) countInput.value = preset.count;
    if (preset.size) sizeInput.value = preset.size;
    if (preset.speed) speedInput.value = preset.speed;
    if (preset.state) {
      stateButtons.forEach((btn) => {
        if (btn.dataset.state === preset.state) {
          btn.click(); // This will also update variant options
        }
      });
    }
    if (preset.variant) variantSelect.value = preset.variant;
    if (preset.hasOwnProperty("gooey")) gooeyCheckbox.checked = preset.gooey;
    if (preset.hasOwnProperty("scaleEffects")) scaleEffectsCheckbox.checked = preset.scaleEffects;
    if (preset.hasOwnProperty("glass")) glassEffectCheckbox.checked = preset.glass;
    if (preset.hasOwnProperty("gradient") && gradientCheckbox) gradientCheckbox.checked = preset.gradient;

    // Update display values
    if (preset.count) countValue.textContent = preset.count;
    if (preset.size) sizeValue.textContent = preset.size;
    if (preset.speed) speedValue.textContent = preset.speed;

    // Apply to blob animation
    blobElement.update(preset);
    
    // Update code preview
    updateCodePreview(preset);
  }

  // --- Initialize ---
  // Set up initial color chips
  renderColorChips(colorList, colorChipsContainer, colorInput, colorOpacityInput, opacityValue, updateBlobColors, editColor, removeColor);

  // Set up initial variant options based on default state
  updateVariantOptions("chaos");

  // Set up FPS counter
  const fpsDisplay = document.getElementById("fps");
  if (fpsDisplay) {
    setInterval(() => {
      if (blobElement && typeof blobElement.getPerformanceMetrics === 'function') {
        const metrics = blobElement.getPerformanceMetrics();
        if (metrics && metrics.fps) {
          fpsDisplay.textContent = `${Math.round(metrics.fps)} FPS`;
        }
      }
    }, 1000);
  }

  // Initial code preview
  updateCodePreview(DEMO_DEFAULTS);
}

// Example: export presets for UI usage
export { DEFAULT_PRESETS };

// --- Basic Usage Demo ---
export function initBasicUsageDemo() {
  const container = document.getElementById("js-animation");
  if (!container) return;
  let animation = container.querySelector("blob-element");
  if (!animation) {
    animation = document.createElement("blob-element");
    container.appendChild(animation);
  }
  animation.update({
    count: 5,
    colors: ["#10b981"],
    state: "organizing",
    variant: "wave",
    gooey: true,
    speed: 1.5,
    width: 350,
    height: 350
  });
  const pauseBtn = document.getElementById("js-pause-btn");
  const resumeBtn = document.getElementById("js-resume-btn");
  const resizeBtn = document.getElementById("js-resize-btn");
  if (pauseBtn && resumeBtn) {
    pauseBtn.addEventListener("click", () => {
      if (animation && typeof animation.pause === 'function') {
        animation.pause();
      }
      pauseBtn.disabled = true;
      resumeBtn.disabled = false;
    });
    resumeBtn.addEventListener("click", () => {
      if (animation && typeof animation.resume === 'function') {
        animation.resume();
      }
      pauseBtn.disabled = false;
      resumeBtn.disabled = true;
    });
  }
  if (resizeBtn) {
    let isExpanded = false;
    resizeBtn.addEventListener("click", () => {
      isExpanded = !isExpanded;
      const newWidth = isExpanded ? 450 : 350;
      const newHeight = isExpanded ? 450 : 350;
      container.style.width = newWidth + "px";
      container.style.height = newHeight + "px";
      if (animation && typeof animation.update === 'function') {
        animation.update({ width: newWidth, height: newHeight });
      }
    });
  }
}
