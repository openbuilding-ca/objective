/**
 * LocalizationManager.js
 *
 * Manages country/language switching and dynamic loading of localization resources.
 * Handles:
 * - Dynamic script loading for ReferenceValues and ClimateValues
 * - Country selection persistence (localStorage)
 * - State reset when switching countries
 * - Event dispatching for UI updates
 *
 * Usage:
 *   TEUI.LocalizationManager.initialize();
 *   TEUI.LocalizationManager.setCountry('DE');
 *   const current = TEUI.LocalizationManager.getCurrentCountry();
 */

// Ensure TEUI namespace exists
window.TEUI = window.TEUI || {};

window.TEUI.LocalizationManager = (function() {
  'use strict';

  // Private state
  let currentCountryCode = null;
  let isInitialized = false;
  let loadedScripts = {
    referenceValues: null,
    climateValues: null
  };

  // Constants
  const STORAGE_KEY = 'TEUI_SELECTED_COUNTRY';
  const DEFAULT_COUNTRY = 'CA';

  /**
   * Initialize the LocalizationManager
   * Loads saved country preference or defaults to Canada
   */
  function initialize() {
    if (isInitialized) {
      console.warn('LocalizationManager: Already initialized');
      return;
    }

    console.log('LocalizationManager: Initializing...');

    // Check for saved country preference
    const savedCountry = getSavedCountry();
    const countryToLoad = savedCountry || DEFAULT_COUNTRY;

    // Validate country is supported
    if (!window.TEUI.CountryConfig.isSupported(countryToLoad)) {
      console.warn(`LocalizationManager: Saved country '${countryToLoad}' not supported, using default`);
      currentCountryCode = DEFAULT_COUNTRY;
    } else {
      currentCountryCode = countryToLoad;
    }

    isInitialized = true;
    console.log(`LocalizationManager: Initialized with country: ${currentCountryCode}`);

    // Dispatch initialization event
    dispatchEvent('localization:initialized', { countryCode: currentCountryCode });
  }

  /**
   * Get currently selected country code
   * @returns {string} Two-letter country code
   */
  function getCurrentCountry() {
    return currentCountryCode;
  }

  /**
   * Get current country configuration object
   * @returns {Object} Country configuration
   */
  function getCurrentCountryConfig() {
    return window.TEUI.CountryConfig.getCountry(currentCountryCode);
  }

  /**
   * Set/switch to a different country
   * @param {string} countryCode - Two-letter country code
   * @param {Object} options - Optional configuration
   * @param {boolean} options.skipReload - Skip page reload (default: false)
   * @returns {Promise} Resolves when country switch is complete
   */
  async function setCountry(countryCode, options = {}) {
    const { skipReload = false } = options;

    console.log(`LocalizationManager: Switching to country: ${countryCode}`);

    // Validate country
    if (!window.TEUI.CountryConfig.isSupported(countryCode)) {
      const error = `Country '${countryCode}' is not supported`;
      console.error(`LocalizationManager: ${error}`);
      throw new Error(error);
    }

    // Check if already on this country
    if (countryCode === currentCountryCode) {
      console.log('LocalizationManager: Already on this country, no change needed');
      return Promise.resolve();
    }

    const previousCountry = currentCountryCode;
    currentCountryCode = countryCode;

    // Save preference
    saveCountry(countryCode);

    // Dispatch country change event
    dispatchEvent('localization:country-changing', {
      from: previousCountry,
      to: countryCode
    });

    if (skipReload) {
      // Dynamic loading without page reload (advanced)
      try {
        await loadCountryResources(countryCode);
        dispatchEvent('localization:country-changed', {
          from: previousCountry,
          to: countryCode
        });
      } catch (error) {
        console.error('LocalizationManager: Error loading country resources:', error);
        // Revert to previous country on error
        currentCountryCode = previousCountry;
        throw error;
      }
    } else {
      // Simple approach: reload page
      console.log('LocalizationManager: Reloading page to apply country change...');

      // Small delay to ensure localStorage write completes
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }

  /**
   * Load country-specific resources dynamically
   * @param {string} countryCode - Country to load resources for
   * @returns {Promise} Resolves when resources are loaded
   */
  async function loadCountryResources(countryCode) {
    const config = window.TEUI.CountryConfig.getCountry(countryCode);

    if (!config) {
      throw new Error(`No configuration found for country: ${countryCode}`);
    }

    console.log(`LocalizationManager: Loading resources for ${config.name}...`);

    // Remove existing scripts
    removeExistingScripts();

    // Load ReferenceValues
    await loadScript(config.referenceValuesPath, 'referenceValues');

    // Load ClimateValues
    await loadScript(config.climateValuesPath, 'climateValues');

    console.log(`LocalizationManager: Resources loaded for ${config.name}`);
  }

  /**
   * Dynamically load a script file
   * @param {string} path - Path to script file
   * @param {string} type - Type of script (referenceValues, climateValues)
   * @returns {Promise} Resolves when script is loaded
   */
  function loadScript(path, type) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = path;
      script.type = 'text/javascript';
      script.dataset.localizationType = type;

      script.onload = () => {
        console.log(`LocalizationManager: Loaded ${type} from ${path}`);
        loadedScripts[type] = path;
        resolve();
      };

      script.onerror = () => {
        const error = `Failed to load ${type} from ${path}`;
        console.error(`LocalizationManager: ${error}`);
        reject(new Error(error));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Remove previously loaded localization scripts
   */
  function removeExistingScripts() {
    const scripts = document.querySelectorAll('script[data-localization-type]');
    scripts.forEach(script => {
      console.log(`LocalizationManager: Removing script: ${script.src}`);
      script.remove();
    });

    loadedScripts = {
      referenceValues: null,
      climateValues: null
    };
  }

  /**
   * Get saved country preference from localStorage
   * @returns {string|null} Saved country code or null
   */
  function getSavedCountry() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.warn('LocalizationManager: Could not read from localStorage', error);
      return null;
    }
  }

  /**
   * Save country preference to localStorage
   * @param {string} countryCode - Country code to save
   */
  function saveCountry(countryCode) {
    try {
      localStorage.setItem(STORAGE_KEY, countryCode);
      console.log(`LocalizationManager: Saved country preference: ${countryCode}`);
    } catch (error) {
      console.warn('LocalizationManager: Could not save to localStorage', error);
    }
  }

  /**
   * Clear saved country preference
   */
  function clearSavedCountry() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('LocalizationManager: Cleared country preference');
    } catch (error) {
      console.warn('LocalizationManager: Could not clear localStorage', error);
    }
  }

  /**
   * Reset to default country
   * @returns {Promise} Resolves when reset is complete
   */
  function resetToDefault() {
    console.log('LocalizationManager: Resetting to default country');
    clearSavedCountry();
    return setCountry(DEFAULT_COUNTRY);
  }

  /**
   * Dispatch custom event
   * @param {string} eventName - Name of event to dispatch
   * @param {Object} detail - Event detail data
   */
  function dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, {
      detail: detail,
      bubbles: true,
      cancelable: true
    });
    window.dispatchEvent(event);
    console.log(`LocalizationManager: Dispatched event '${eventName}'`, detail);
  }

  /**
   * Get status information for debugging
   * @returns {Object} Status object
   */
  function getStatus() {
    return {
      initialized: isInitialized,
      currentCountry: currentCountryCode,
      currentConfig: getCurrentCountryConfig(),
      loadedScripts: { ...loadedScripts },
      savedCountry: getSavedCountry(),
      availableCountries: window.TEUI.CountryConfig.getAllCountryCodes()
    };
  }

  // Public API
  return {
    initialize,
    getCurrentCountry,
    getCurrentCountryConfig,
    setCountry,
    resetToDefault,
    getStatus,

    // Constants exposed for external use
    DEFAULT_COUNTRY,
    STORAGE_KEY
  };
})();

// Auto-initialize on load (if CountryConfig is available)
if (window.TEUI.CountryConfig) {
  console.log('LocalizationManager.js loaded successfully');
} else {
  console.error('LocalizationManager.js: CountryConfig not found! Load CountryConfig.js first.');
}
