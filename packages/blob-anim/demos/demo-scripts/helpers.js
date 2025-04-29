// Helper functions for BlobAnim demo UI

/**
 * Display an error message in the demo UI
 */
export function displayErrorMessage(message) {
  const demoContainer = document.querySelector(".card-body");
  if (demoContainer) {
    const errorDiv = document.createElement("div");
    errorDiv.style.color = "#ef4444";
    errorDiv.style.padding = "1rem";
    errorDiv.style.textAlign = "center";
    errorDiv.textContent = message;
    demoContainer.prepend(errorDiv);
  }
}

/**
 * Update the variant select options based on state
 */
export function updateVariantOptions(state, variantSelectId = "variant", blobElementId = "demo-blob") {
  const availableVariants = {
    chaos: ["default", "random", "spiral", "explosion", "brownian", "math-explosion", "math", "circle"],
    organizing: ["default", "grid", "spiral", "wave", "cylinder"],
    structured: ["default", "grid", "circle", "orbit", "flower", "basic"],
  };
  const variantSelect = document.getElementById(variantSelectId);
  const blobElement = document.getElementById(blobElementId);
  if (!variantSelect) return;
  const currentVariant = variantSelect.value;
  variantSelect.innerHTML = "";
  availableVariants[state].forEach((variant) => {
    const option = document.createElement("option");
    option.value = variant;
    option.textContent = variant.charAt(0).toUpperCase() + variant.slice(1);
    variantSelect.appendChild(option);
  });
  if (availableVariants[state].includes(currentVariant)) {
    variantSelect.value = currentVariant;
  } else {
    variantSelect.value = "default";
    if (blobElement && typeof blobElement.update === "function") {
      blobElement.update({ variant: "default" });
    }
  }
}

/**
 * Update the code preview panel with current settings
 */
export function updateCodePreview(blobElementId = "demo-blob", codePreviewId = "code-preview") {
  const blobElement = document.getElementById(blobElementId);
  const codePreview = document.getElementById(codePreviewId);
  if (!blobElement || !codePreview) return;
  const config = blobElement.getConfig ? blobElement.getConfig() : {};
  let codeHtml = "";
  codeHtml += '<span class="element">&lt;blob-element</span> ';
  if (config.count) codeHtml += `<span class="attribute">count</span>=<span class="value">"${config.count}"</span> `;
  if (config.size) codeHtml += `<span class="attribute">size</span>=<span class="value">"${config.size}"</span> `;
  if (config.state) codeHtml += `<span class="attribute">state</span>=<span class="value">"${config.state}"</span> `;
  if (config.variant) codeHtml += `<span class="attribute">variant</span>=<span class="value">"${config.variant}"</span> `;
  if (config.speed) codeHtml += `<span class="attribute">speed</span>=<span class="value">"${config.speed}"</span> `;
  if (config.colors && config.colors.length) codeHtml += `<span class="attribute">colors</span>=<span class="value">'${JSON.stringify(config.colors)}'</span> `;
  if (config.gooey) codeHtml += `<span class="attribute">gooey</span> `;
  if (config.scaleEffects) codeHtml += `<span class="attribute">scale-effects</span> `;
  if (config.glass) codeHtml += `<span class="attribute">glass</span> `;
  if (config.chaosAmount !== undefined && config.chaosAmount !== 1.0) codeHtml += `<span class="attribute">chaos-amount</span>=<span class="value">"${config.chaosAmount}"</span> `;
  codeHtml += '<span class="element">&gt;&lt;/blob-element&gt;</span>';
  codePreview.innerHTML = codeHtml;
}

/**
 * Render color chips UI for color selection
 */
export function renderColorChips(colorList, colorChipsContainer, colorInput, colorOpacityInput, opacityValue, updateBlobColors, editColor, removeColor) {
  colorChipsContainer.innerHTML = "";
  colorList.forEach((color, index) => {
    const chip = document.createElement("div");
    chip.classList.add("color-chip");
    chip.style.backgroundColor = color;
    if (color.startsWith("rgba")) {
      chip.style.backgroundImage =
        "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)";
      chip.style.backgroundSize = "10px 10px";
      chip.style.backgroundPosition = "0 0, 0 5px, 5px -5px, -5px 0px";
    }
    chip.title = color;
    chip.addEventListener("click", () => removeColor(index));
    chip.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      editColor(index);
    });
    colorChipsContainer.appendChild(chip);
  });
}

/**
 * Convert hex color to rgba string
 */
export function hexToRgba(hex, opacity) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Extract opacity from rgba string
 */
export function extractOpacityFromRgba(rgbaColor) {
  const match = rgbaColor.match(/rgba\(.*?,\s*([0-9.]+)\)/);
  if (match && match[1]) return parseFloat(match[1]);
  return 1.0;
}
