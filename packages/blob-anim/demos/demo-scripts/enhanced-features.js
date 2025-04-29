// Enhanced Features Demo Script
import "../blob-anim.es.js";

export function initEnhancedFeaturesDemo() {
  console.log("Initializing enhanced features demo...");
  
  // Get DOM references
  const elements = {
    // Pattern Types demo
    patternsBlob: document.getElementById("patternsBlob"),
    patternButtons: document.querySelectorAll(".pattern-btn"),
    patternVariantSelect: document.getElementById("patternVariantSelect"),
    countSlider: document.getElementById("countSlider"),
    countValue: document.getElementById("countValue"),
    sizeSlider: document.getElementById("sizeSlider"),
    sizeValue: document.getElementById("sizeValue"),
    speedSlider: document.getElementById("speedSlider"),
    speedValue: document.getElementById("speedValue"),
    amplitudeSlider: document.getElementById("amplitudeSlider"),
    amplitudeValue: document.getElementById("amplitudeValue"),
    pauseResumeBtn: document.getElementById("pauseResumeBtn"),
    resetBtn: document.getElementById("resetBtn"),
    gooeyToggle: document.getElementById("gooeyToggle"),
    scaleEffectsToggle: document.getElementById("scaleEffectsToggle"),
    patternIndicator: document.getElementById("patternIndicator"),
    typesFpsCounter: document.getElementById("typesFpsCounter"),
    typesPointsCounter: document.getElementById("typesPointsCounter"),
    
    // Effects demo
    effectsBlob: document.getElementById("effectsBlob"),
    glassToggle: document.getElementById("glassToggle"),
    effectsGooeyToggle: document.getElementById("effectsGooeyToggle"),
    glassOpacity: document.getElementById("glassOpacity"),
    glassOpacityValue: document.getElementById("glassOpacityValue"),
    glassBlobs: document.getElementById("glassBlobs"),
    glassBlobsValue: document.getElementById("glassBlobsValue"),
    backgroundSelect: document.getElementById("backgroundSelect"),
    transitionBtn: document.getElementById("transitionBtn"),
    transitionChaosBtn: document.getElementById("transitionChaosBtn"),
    transitionOrganizingBtn: document.getElementById("transitionOrganizingBtn"),
    transitionStructuredBtn: document.getElementById("transitionStructuredBtn"),
    effectsIndicator: document.getElementById("effectsIndicator"),
    effectsFpsCounter: document.getElementById("effectsFpsCounter"),
    transitionLog: document.getElementById("transitionLog"),
    
    // Event Log
    eventLog: document.getElementById("eventLog")
  };
  
  // Track state
  const state = {
    isPaused: false,
    currentPatternState: "chaos"
  };
  
  // Default config for reset
  const DEFAULT_CONFIG = {
    count: 30,
    size: 15,
    speed: 1,
    amplitude: 20,
    state: "chaos",
    variant: "default",
    gooey: true,
    scaleEffects: true
  };
  
  // Helper functions
  const helpers = {
    /**
     * Log an event to the event log
     */
    logEvent(source, event, detail) {
      const time = new Date().toLocaleTimeString();
      let detailText = '';
      
      if (detail) {
        try {
          if (typeof detail === 'object') {
            // Handle complex event data
            if (detail.previous && detail.current) {
              const changes = Object.entries(detail.current)
                .filter(([key, value]) => detail.previous[key] !== value)
                .map(([key, value]) => `${key}: ${JSON.stringify(detail.previous[key])} → ${JSON.stringify(value)}`)
                .join(', ');
              
              detailText = `: ${changes}`;
            } else {
              detailText = `: ${JSON.stringify(detail)}`;
            }
          } else {
            detailText = `: ${detail}`;
          }
        } catch (e) {
          detailText = `: ${detail}`;
        }
      }
      
      const logEntry = document.createElement('p');
      logEntry.textContent = `[${time}] ${source} - ${event}${detailText}`;
      elements.eventLog.appendChild(logEntry);
      
      // Limit log size
      while (elements.eventLog.children.length > 30) {
        elements.eventLog.removeChild(elements.eventLog.children[1]); // Keep header
      }
      
      // Auto-scroll to bottom
      elements.eventLog.scrollTop = elements.eventLog.scrollHeight;
    },
    
    /**
     * Update variant options based on pattern state
     */
    updateVariantOptions(state) {
      // Clear existing options
      elements.patternVariantSelect.innerHTML = '';
      
      // Add appropriate variants based on state
      if (state === 'chaos') {
        const variants = [
          { value: 'default', label: 'Default' },
          { value: 'orbital', label: 'Orbital' },
          { value: 'spiral', label: 'Spiral' },
          { value: 'explosion', label: 'Explosion' },
          { value: 'brownian', label: 'Brownian' }
        ];
        
        variants.forEach(variant => {
          const option = document.createElement('option');
          option.value = variant.value;
          option.textContent = variant.label;
          elements.patternVariantSelect.appendChild(option);
        });
      } else {
        // Other states usually just have default variant
        const option = document.createElement('option');
        option.value = 'default';
        option.textContent = 'Default';
        elements.patternVariantSelect.appendChild(option);
      }
    },
    
    /**
     * Reset pattern demo to default settings
     */
    resetPatternDemo() {
      // Reset control values
      elements.countSlider.value = DEFAULT_CONFIG.count;
      elements.countValue.textContent = DEFAULT_CONFIG.count;
      elements.sizeSlider.value = DEFAULT_CONFIG.size;
      elements.sizeValue.textContent = DEFAULT_CONFIG.size;
      elements.speedSlider.value = DEFAULT_CONFIG.speed;
      elements.speedValue.textContent = DEFAULT_CONFIG.speed.toFixed(1);
      elements.amplitudeSlider.value = DEFAULT_CONFIG.amplitude;
      elements.amplitudeValue.textContent = DEFAULT_CONFIG.amplitude;
      elements.gooeyToggle.checked = DEFAULT_CONFIG.gooey;
      elements.scaleEffectsToggle.checked = DEFAULT_CONFIG.scaleEffects;
      
      // Reset state button
      elements.patternButtons.forEach(btn => {
        if (btn.dataset.state === DEFAULT_CONFIG.state) {
          btn.click();
        }
      });
      
      // Reset variant
      helpers.updateVariantOptions(DEFAULT_CONFIG.state);
      elements.patternVariantSelect.value = DEFAULT_CONFIG.variant;
      
      // Apply to blob
      Object.entries(DEFAULT_CONFIG).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          elements.patternsBlob.setAttribute(key, value ? 'true' : 'false');
        } else {
          elements.patternsBlob.setAttribute(key, value);
        }
      });
      
      helpers.logEvent('Patterns', 'Reset to defaults');
    },
    
    /**
     * Generate a random transition for the effects demo
     */
    randomTransition() {
      const states = ['chaos', 'organizing', 'structured'];
      const variants = ['default', 'orbital', 'spiral', 'brownian'];
      
      const randomState = states[Math.floor(Math.random() * states.length)];
      const randomVariant = randomState === 'chaos' ? 
        variants[Math.floor(Math.random() * variants.length)] : 'default';
      const randomCount = Math.floor(Math.random() * 50) + 10;
      const randomSpeed = (Math.random() * 2 + 0.5).toFixed(1);
      const randomSize = Math.floor(Math.random() * 30) + 10;
      
      // Apply transition
      helpers.logEvent('Effects', 'Starting Random Transition', { 
        state: randomState, 
        variant: randomVariant,
        count: randomCount,
        speed: randomSpeed,
        size: randomSize
      });
      
      elements.effectsBlob.setAttribute('state', randomState);
      elements.effectsBlob.setAttribute('variant', randomVariant);
      elements.effectsBlob.setAttribute('count', randomCount.toString());
      elements.effectsBlob.setAttribute('speed', randomSpeed.toString());
      elements.effectsBlob.setAttribute('size', randomSize.toString());
      
      elements.transitionLog.textContent = `Random transition to ${randomState}...`;
      setTimeout(() => {
        elements.transitionLog.textContent = '';
      }, 2000);
    },
    
    /**
     * Update FPS counters
     */
    updateFpsCounters() {
      if (elements.patternsBlob) {
        const metrics = elements.patternsBlob.getPerformanceMetrics();
        elements.typesFpsCounter.textContent = `FPS: ${metrics.fps.toFixed(1)}`;
      }
      
      if (elements.effectsBlob) {
        const metrics = elements.effectsBlob.getPerformanceMetrics();
        elements.effectsFpsCounter.textContent = `FPS: ${metrics.fps.toFixed(1)}`;
      }
    },
    
    /**
     * Toggle pause/resume for pattern blob
     */
    togglePauseResume() {
      if (state.isPaused) {
        elements.patternsBlob.resume();
        elements.pauseResumeBtn.textContent = 'Pause';
      } else {
        elements.patternsBlob.pause();
        elements.pauseResumeBtn.textContent = 'Resume';
      }
      state.isPaused = !state.isPaused;
    },
    
    /**
     * Make specific transition to a state
     */
    makeTransition(stateTarget) {
      elements.effectsBlob.setAttribute('state', stateTarget);
      elements.effectsBlob.setAttribute('variant', 'default');
      helpers.logEvent('Effects', `Transition to ${stateTarget}`);
    }
  };
  
  // Set up event listeners
  function setupEventListeners() {
    // Pattern blob events
    elements.patternsBlob.addEventListener('blob:start', () => {
      helpers.logEvent('Patterns', 'Animation Started');
      elements.patternIndicator.classList.remove('inactive');
    });
    
    elements.patternsBlob.addEventListener('blob:stop', () => {
      helpers.logEvent('Patterns', 'Animation Stopped');
      elements.patternIndicator.classList.add('inactive');
    });
    
    elements.patternsBlob.addEventListener('blob:pause', () => {
      helpers.logEvent('Patterns', 'Animation Paused');
      elements.patternIndicator.classList.add('inactive');
    });
    
    elements.patternsBlob.addEventListener('blob:resume', () => {
      helpers.logEvent('Patterns', 'Animation Resumed');
      elements.patternIndicator.classList.remove('inactive');
    });
    
    elements.patternsBlob.addEventListener('blob:configChange', (e) => {
      helpers.logEvent('Patterns', 'Config Changed', e.detail);
    });
    
    // Effects blob events
    elements.effectsBlob.addEventListener('blob:configChange', (e) => {
      helpers.logEvent('Effects', 'Config Changed', e.detail);
      
      // Show transition information
      if (e.detail?.current?.state) {
        elements.transitionLog.textContent = `Transitioning to ${e.detail.current.state}...`;
        setTimeout(() => {
          elements.transitionLog.textContent = '';
        }, 2000);
      }
    });
    
    elements.effectsBlob.addEventListener('blob:visible', () => {
      helpers.logEvent('Effects', 'Became Visible');
      elements.effectsIndicator.classList.remove('inactive');
    });
    
    elements.effectsBlob.addEventListener('blob:hidden', () => {
      helpers.logEvent('Effects', 'Became Hidden');
      elements.effectsIndicator.classList.add('inactive');
    });
    
    // Pattern controls
    elements.patternButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.patternButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const patternState = btn.dataset.state;
        state.currentPatternState = patternState;
        elements.patternsBlob.setAttribute('state', patternState);
        
        // Update variant options based on selected state
        helpers.updateVariantOptions(patternState);
        
        // Update point counter
        const count = parseInt(elements.countSlider.value);
        elements.typesPointsCounter.textContent = `Points: ${count}`;
      });
    });
    
    // Pattern variant selection
    elements.patternVariantSelect.addEventListener('change', () => {
      const variant = elements.patternVariantSelect.value;
      elements.patternsBlob.setAttribute('variant', variant);
    });
    
    // Count slider
    elements.countSlider.addEventListener('input', () => {
      const value = elements.countSlider.value;
      elements.countValue.textContent = value;
      elements.patternsBlob.setAttribute('count', value);
      elements.typesPointsCounter.textContent = `Points: ${value}`;
    });
    
    // Size slider
    elements.sizeSlider.addEventListener('input', () => {
      const value = elements.sizeSlider.value;
      elements.sizeValue.textContent = value;
      elements.patternsBlob.setAttribute('size', value);
    });
    
    // Speed slider
    elements.speedSlider.addEventListener('input', () => {
      const value = elements.speedSlider.value;
      elements.speedValue.textContent = parseFloat(value).toFixed(1);
      elements.patternsBlob.setAttribute('speed', value);
    });
    
    // Amplitude slider
    elements.amplitudeSlider.addEventListener('input', () => {
      const value = elements.amplitudeSlider.value;
      elements.amplitudeValue.textContent = value;
      elements.patternsBlob.setAttribute('amplitude', value);
    });
    
    // Effect toggles
    elements.gooeyToggle.addEventListener('change', () => {
      elements.patternsBlob.setAttribute('gooey', elements.gooeyToggle.checked);
    });
    
    elements.scaleEffectsToggle.addEventListener('change', () => {
      elements.patternsBlob.setAttribute('scaleEffects', elements.scaleEffectsToggle.checked);
    });
    
    // Pause/Resume button
    elements.pauseResumeBtn.addEventListener('click', helpers.togglePauseResume);
    
    // Reset button
    elements.resetBtn.addEventListener('click', helpers.resetPatternDemo);
    
    // Glass effect controls
    elements.glassToggle.addEventListener('change', () => {
      elements.effectsBlob.setAttribute('glass', elements.glassToggle.checked);
    });
    
    elements.effectsGooeyToggle.addEventListener('change', () => {
      elements.effectsBlob.setAttribute('gooey', elements.effectsGooeyToggle.checked);
    });
    
    elements.glassOpacity.addEventListener('input', () => {
      const value = elements.glassOpacity.value;
      elements.glassOpacityValue.textContent = value;
      elements.effectsBlob.setAttribute('glassOpacity', value);
    });
    
    elements.glassBlobs.addEventListener('input', () => {
      const value = elements.glassBlobs.value;
      const percentage = Math.round(value * 100);
      elements.glassBlobsValue.textContent = `${percentage}%`;
      
      // Convert percentage to actual blob indices
      const count = parseInt(elements.effectsBlob.getAttribute('count') || 20);
      const blobCount = Math.floor(count * value);
      const indices = Array.from({ length: blobCount }, (_, i) => i);
      
      elements.effectsBlob.setAttribute('glassBlobs', JSON.stringify(indices));
    });
    
    // Background selection
    elements.backgroundSelect.addEventListener('change', () => {
      const container = elements.effectsBlob.parentElement;
      container.classList.remove('theme-light', 'theme-dark', 'theme-gradient');
      container.classList.add(`theme-${elements.backgroundSelect.value}`);
    });
    
    // Transition buttons
    elements.transitionBtn.addEventListener('click', helpers.randomTransition);
    elements.transitionChaosBtn.addEventListener('click', () => helpers.makeTransition('chaos'));
    elements.transitionOrganizingBtn.addEventListener('click', () => helpers.makeTransition('organizing'));
    elements.transitionStructuredBtn.addEventListener('click', () => helpers.makeTransition('structured'));
  }
  
  // Initialize demo
  function initialize() {
    // Set up event listeners
    setupEventListeners();
    
    // Initialize variant options
    helpers.updateVariantOptions(state.currentPatternState);
    
    // Start FPS counter updates
    setInterval(helpers.updateFpsCounters, 1000);
    
    // Log initial state
    helpers.logEvent('Demo', 'Enhanced Features Demo Initialized');
  }
  
  // Start initialization
  initialize();
}
