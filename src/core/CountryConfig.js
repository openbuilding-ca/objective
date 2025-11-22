/**
 * CountryConfig.js
 *
 * Country-specific configuration for TEUI localization system.
 * Defines paths to reference values, climate data, and UI translations for each country.
 *
 * Usage:
 *   const config = TEUI.CountryConfig.getCountry('CA');
 *   const allCountries = TEUI.CountryConfig.getAllCountries();
 */

// Ensure TEUI namespace exists
window.TEUI = window.TEUI || {};

/**
 * Country configuration object
 * Each country defines paths to its localization resources
 */
window.TEUI.CountryConfig = {
  /**
   * Country definitions
   */
  countries: {
    CA: {
      code: "CA",
      name: "Canada",
      nameLocal: "Canada",
      flag: "🇨🇦",

      // Data file paths
      referenceValuesPath: "src/core/ReferenceValues.js",
      climateValuesPath: "src/core/ClimateValues.js",

      // Translation files (future Phase 2b)
      uiLabelsPath: "localizations/Canada/ui-labels-en.json",
      regionsPath: "localizations/Canada/regions-en.json",

      // Language settings
      defaultLanguage: "en",
      availableLanguages: ["en", "fr"],

      // Default selections
      defaultRegion: "Ontario",
      defaultCity: "Toronto",

      // Display settings
      unitSystem: "metric", // or "imperial"
      currencyCode: "CAD",

      // Header subtitle
      subtitle: "for Canadian Projects"
    },

    DE: {
      code: "DE",
      name: "Germany",
      nameLocal: "Deutschland",
      flag: "🇩🇪",

      // Data file paths
      referenceValuesPath: "localizations/Germany/4012-ReferenzWerten-DE.js",
      climateValuesPath: "localizations/Germany/KlimaWerten.js",

      // Translation files (future Phase 2b)
      uiLabelsPath: "localizations/Germany/ui-labels-de.json",
      regionsPath: "localizations/Germany/regions-de.json",

      // Language settings
      defaultLanguage: "de",
      availableLanguages: ["de", "en"],

      // Default selections
      defaultRegion: "Berlin",
      defaultCity: "Berlin",

      // Display settings
      unitSystem: "metric",
      currencyCode: "EUR",

      // Header subtitle
      subtitle: "für deutsche Projekte"
    }
  },

  /**
   * Get configuration for a specific country
   * @param {string} countryCode - Two-letter country code (e.g., "CA", "DE")
   * @returns {Object|null} Country configuration object or null if not found
   */
  getCountry: function(countryCode) {
    if (!countryCode) {
      console.warn('CountryConfig.getCountry: No country code provided');
      return null;
    }

    const country = this.countries[countryCode.toUpperCase()];
    if (!country) {
      console.warn(`CountryConfig.getCountry: Country '${countryCode}' not found`);
      return null;
    }

    return country;
  },

  /**
   * Get all available country codes
   * @returns {string[]} Array of country codes
   */
  getAllCountryCodes: function() {
    return Object.keys(this.countries);
  },

  /**
   * Get all country configurations
   * @returns {Object[]} Array of country configuration objects
   */
  getAllCountries: function() {
    return Object.values(this.countries);
  },

  /**
   * Check if a country is supported
   * @param {string} countryCode - Two-letter country code
   * @returns {boolean} True if country is supported
   */
  isSupported: function(countryCode) {
    return this.countries.hasOwnProperty(countryCode.toUpperCase());
  },

  /**
   * Get default country code
   * @returns {string} Default country code (Canada)
   */
  getDefaultCountryCode: function() {
    return "CA";
  },

  /**
   * Validate country configuration
   * Checks that all required paths and properties are defined
   * @param {string} countryCode - Two-letter country code
   * @returns {Object} Validation result with isValid and errors array
   */
  validateCountry: function(countryCode) {
    const country = this.getCountry(countryCode);
    const errors = [];

    if (!country) {
      return {
        isValid: false,
        errors: [`Country '${countryCode}' not found`]
      };
    }

    // Required fields
    const requiredFields = [
      'code',
      'name',
      'referenceValuesPath',
      'climateValuesPath',
      'defaultLanguage'
    ];

    requiredFields.forEach(field => {
      if (!country[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  /**
   * Get country by name (English or local)
   * @param {string} name - Country name to search for
   * @returns {Object|null} Country configuration or null
   */
  getCountryByName: function(name) {
    const normalizedName = name.toLowerCase();

    for (const country of this.getAllCountries()) {
      if (country.name.toLowerCase() === normalizedName ||
          country.nameLocal.toLowerCase() === normalizedName) {
        return country;
      }
    }

    return null;
  }
};

// Expose shorthand alias
window.TEUI.Countries = window.TEUI.CountryConfig.countries;

console.log('CountryConfig.js loaded successfully');
console.log('Available countries:', window.TEUI.CountryConfig.getAllCountryCodes().join(', '));
