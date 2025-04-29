// demo/main.js - PixiBlob demo using the web component
// This script handles UI controls for the pixi-blob-element

// Wait for custom elements to be defined
let pixiBlob = null;

// Helper function to ensure component is ready before accessing it
function waitForPixiBlobReady(maxAttempts = 50) {
  return new Promise((resolve, reject) => {
    // If we already have a reference, return it
    if (pixiBlob && pixiBlob.shadowRoot) {
      resolve(pixiBlob);
      return;
    }
    
    // Try to get the element
    pixiBlob = document.getElementById('pixiblob');
    
    if (pixiBlob && pixiBlob.shadowRoot) {
      resolve(pixiBlob);
      return;
    }
    
    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;
      
      // Try to get the element again
      pixiBlob = document.getElementById('pixiblob');
      
      // Check if element and shadow root exist
      if (pixiBlob && pixiBlob.shadowRoot) {
        clearInterval(checkInterval);
        resolve(pixiBlob);
        return;
      }
      
      // Give up after max attempts
      if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        reject(new Error('PixiBlob element not ready after maximum attempts'));
      }
    }, 100);
  });
}

// Initialize UI controls when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Wait for the blob element to be ready
    pixiBlob = await waitForPixiBlobReady();
    console.log('PixiBlob element is ready');
    
    // Now set up all the controls
    const variantSelect = document.getElementById('variant');
    const stateSelect = document.getElementById('state');
    const speedInput = document.getElementById('speed');
    const sizeInput = document.getElementById('size');
    const countInput = document.getElementById('count');
    const gooeyCheckbox = document.getElementById('gooey');
    const speedValue = document.getElementById('speedValue');
    const sizeValue = document.getElementById('sizeValue');
    const countValue = document.getElementById('countValue');

    // Function to update the blob element
    function updateBlob(options) {
      if (pixiBlob) {
        pixiBlob.options = options;
      }
    }

    // Set up event listeners for controls
    variantSelect.addEventListener('change', () => {
      updateBlob({ variant: variantSelect.value });
    });
    
    stateSelect.addEventListener('change', () => {
      updateBlob({ state: stateSelect.value });
    });
    
    speedInput.addEventListener('input', () => {
      const v = parseFloat(speedInput.value);
      updateBlob({ speed: v });
      speedValue.textContent = v.toFixed(1);
    });
    
    sizeInput.addEventListener('input', () => {
      const v = parseInt(sizeInput.value);
      updateBlob({ size: v });
      sizeValue.textContent = v;
    });
    
    countInput.addEventListener('input', () => {
      const v = parseInt(countInput.value);
      updateBlob({ count: v });
      countValue.textContent = v;
    });
    
    gooeyCheckbox.addEventListener('change', () => {
      updateBlob({ gooey: gooeyCheckbox.checked });
    });
    
    console.log('All controls initialized');
  } catch (error) {
    console.error('Error initializing the demo:', error);
  }
});
