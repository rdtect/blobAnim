// Wrap everything in an IIFE to avoid global namespace pollution
(() => {
  // Animation states
  if (typeof window.ANIMATION_STATES === 'undefined') {
    window.ANIMATION_STATES = ["chaos", "organizing", "structured"];
  }

  // Available patterns for each animation state
  if (typeof window.PATTERNS === 'undefined') {
    window.PATTERNS = {
      chaos: ["default", "spiral", "explosion"],
      organizing: ["default", "wave", "cylinder"],
      structured: ["default", "orbit", "flower"],
    };
  }

  // Create ConfigManager if it doesn't exist
  if (typeof window.BlobConfig === 'undefined') {
    const ConfigManagerInstance = (() => {
      let instance = null;

      class ConfigManagerClass {
        constructor(initialConfig = {}) {
          if (instance) {
            return instance;
          }
          
          // Define default configuration with all possible options
          this.defaultConfig = {
            // Animation basics
            count: 10,
            speed: 5,
            size: 40,
            state: "chaos",
            variant: "default",

            // Materials (colors + glass)
            materials: ["#3b82f6"], // Default single blue color
            glassProperties: {
              color: "#ffffff",
              opacity: 0.2,
              blur: 5
            },

            // Visual properties
            gooey: true,
            scaleEffects: true,

            // Canvas dimensions
            width: 450,
            height: 450,

            // Advanced settings
            intensity: 0.5,
            debug: false,
          };

          this.config = { ...this.defaultConfig, ...initialConfig };
          this.subscribers = [];
          instance = this;
        }

        static getInstance(initialConfig) {
          if (!instance) {
            instance = new ConfigManagerClass(initialConfig);
          } else if (initialConfig) {
            instance.updateConfig(initialConfig);
          }
          return instance;
        }

        getConfig() {
          return { ...this.config };
        }

        updateConfig(newConfig = {}) {
          if (Object.keys(newConfig).length === 0) return this.config;

          const oldConfig = { ...this.config };
          this.config = { ...this.config, ...newConfig };

          if (this.config.debug) {
            console.log("Config updated:", newConfig);
          }

          this.notifySubscribers(oldConfig, this.config);
          return this.config;
        }

        resetConfig() {
          const oldConfig = { ...this.config };
          this.config = { ...this.defaultConfig };

          if (this.config.debug) {
            console.log("Config reset to defaults");
          }

          this.notifySubscribers(oldConfig, this.config);
          return this.config;
        }

        subscribe(callback) {
          if (typeof callback !== "function") return () => {};

          this.subscribers.push(callback);

          if (this.config.debug) {
            console.log(`Subscriber added (${this.subscribers.length} total)`);
          }

          return () => {
            this.subscribers = this.subscribers.filter((cb) => cb !== callback);

            if (this.config.debug) {
              console.log(`Subscriber removed (${this.subscribers.length} remaining)`);
            }
          };
        }

        notifySubscribers(oldConfig, newConfig) {
          if (this.subscribers.length === 0) return;

          if (this.config.debug) {
            console.log(`Notifying ${this.subscribers.length} subscribers of config change`);
          }

          this.subscribers.forEach((callback) => {
            try {
              callback(newConfig, oldConfig);
            } catch (error) {
              console.error("Error in config subscriber:", error);
            }
          });
        }

        getPatternsForState(state) {
          return window.PATTERNS[state] || [];
        }
      }

      return {
        getInstance: (initialConfig) => ConfigManagerClass.getInstance(initialConfig)
      };
    })();

    function mapConfigToAnimProps(config) {
      const colors = config.materials.map(material => {
        if (material === 'glass') {
          const { color, opacity } = config.glassProperties;
          return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
        }
        return material;
      });

      return {
        state: config.state,
        variant: config.variant,
        count: config.count,
        size: config.size,
        colors: colors,
        speed: config.speed,
        gooey: config.gooey,
        scaleEffects: config.scaleEffects,
      };
    }

    // Export to window.BlobConfig
    window.BlobConfig = {
      getConfigManager: (initialConfig) => ConfigManagerInstance.getInstance(initialConfig),
      ANIMATION_STATES: window.ANIMATION_STATES,
      PATTERNS: window.PATTERNS,
      mapConfigToAnimProps,
    };

    console.log("BlobConfig initialized successfully");
  }
})();
