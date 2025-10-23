/**
 * 4011-Calculator.js
 *
 * Core calculation engine for TEUI Calculator 4.011
 * Handles all mathematical operations and formula evaluations
 *
 * Refactored to use DOM-based field IDs (e.g. 'd_12' for cell D12).
 */

// Define the global namespace if it doesn't exist
window.TEUI = window.TEUI || {};

// Calculator Module
TEUI.Calculator = (function () {
  // Reference to state manager
  let stateManager;

  // Calculation sections
  const SECTIONS = {
    KEY_VALUES: "keyValues",
    BUILDING_INFO: "buildingInfo",
    CLIMATE: "climateCalculations",
    ENERGY_CARBON: "actualTargetEnergy",
    EMISSIONS: "emissions",
    RENEWABLE: "onSiteEnergy",
    WATER: "waterUse",
    AIR_QUALITY: "indoorAirQuality",
    INTERNAL_GAINS: "occupantInternalGains",
    RADIANT_GAINS: "envelopeRadiantGains",
    TRANSMISSION_LOSSES: "envelopeTransmissionLosses",
    VOLUME_METRICS: "volumeSurfaceMetrics",
    MECHANICAL: "mechanicalLoads",
    TEDI: "tediSummary",
    TEUI: "teuiSummary",
  };

  // Constants for calculations
  const CONSTANTS = {
    CELSIUS_TO_FAHRENHEIT: function (c) {
      return (c * 9) / 5 + 32;
    },
    FAHRENHEIT_TO_CELSIUS: function (f) {
      return ((f - 32) * 5) / 9;
    },
    DEFAULT_CDD_FACTOR: -0.85, // Ground facing CDD factor HALLUCINATION
  };

  /**
   * Initialize the calculator
   */
  function initialize() {
    // Get state manager reference
    stateManager = window.TEUI.StateManager;

    // Register all calculations with state manager
    // registerCalculations(); // Assuming registration happens elsewhere or within sections now

    // Initialize state manager first
    if (TEUI.StateManager) {
      TEUI.StateManager.initialize();
      TEUI.StateManager.loadState();
    }

    // Initialize FieldManager to generate content for all sections
    if (TEUI.FieldManager) {
      TEUI.FieldManager.renderAllSections();
    }

    // Initialize Component Bridge
    /* if (TEUI.ComponentBridge) {
      TEUI.ComponentBridge.initAll();

      // ✅ Initialize dual-state synchronization
      TEUI.ComponentBridge.initDualStateSync();
    } */

    // Set up event listeners after DOM is ready
    // setupEventListeners(); // Assuming event listeners are set up elsewhere now

    // Listen for rendering completion
    document.addEventListener("teui-rendering-complete", function (_event) {
      // Initialize weather handlers when rendering is complete
      // initializeWeatherHandlers(); // Moved to 4011-init.js?
      // Calculate all values immediately after rendering and weather handlers are ready
    });
  }

  /**
   * Register all calculations with state manager
   */
  function _registerCalculations() {
    // Register Building Info calculations
    registerBuildingInfoCalculations();

    // Register Climate calculations
    registerClimateCalculations();

    // Register Key Values calculations
    registerKeyValuesCalculations();

    // Other sections will be implemented as needed
  }

  /**
   * Register Building Info section calculations
   */
  function registerBuildingInfoCalculations() {
    // Example: Climate zone based on province and city
    stateManager.registerDependency("d_19", "climate-zone"); // Province affects climate zone
    stateManager.registerDependency("h_19", "climate-zone"); // City affects climate zone

    // Add listeners for fields that require calculations
    stateManager.addListener("d_19", recalculateClimateZone);
    stateManager.addListener("h_19", recalculateClimateZone);
  }

  /**
   * Register Climate section calculations
   */
  function registerClimateCalculations() {
    // Ground facing HDD calculations (d_22) now depends on heating setpoint and cooling season
    stateManager.registerDependency("h_23", "d_22"); // Heating setpoint affects ground facing HDD
    stateManager.registerDependency("m_19", "d_22"); // Cooling season affects ground facing HDD
    stateManager.addListener("h_23", recalculateGroundFacingHDD);
    stateManager.addListener("m_19", recalculateGroundFacingHDD);

    // Ground facing CDD calculations (h_22)
    stateManager.registerDependency("d_21", "h_22"); // CDD affects ground facing CDD
    stateManager.addListener("d_21", recalculateGroundFacingCDD);

    // Temperature conversions
    stateManager.registerDependency("dv_d_23a", "cf_e_23a"); // Heating setpoint C to F
    stateManager.addListener("dv_d_23a", recalculateTemperatures);

    stateManager.registerDependency("dv_d_24a", "cf_e_24a"); // Cooling setpoint C to F
    stateManager.addListener("dv_d_24a", recalculateTemperatures);
  }

  /**
   * Register Key Values section calculations
   */
  function registerKeyValuesCalculations() {
    // TEUI calculations
    stateManager.registerDependency("i_10", "cf_j_10"); // Actual TEUI affects percent
    stateManager.registerDependency("d_10", "cf_j_10"); // Reference TEUI affects percent
    stateManager.addListener("i_10", recalculateTEUIPercent);
    stateManager.addListener("d_10", recalculateTEUIPercent);

    // Annual Carbon calculations
    stateManager.registerDependency("i_8", "j_8"); // Actual Annual Carbon affects percent
    stateManager.registerDependency("d_8", "j_8"); // Reference Annual Carbon affects percent
    stateManager.addListener("i_8", recalculateAnnualCarbonPercent);
    stateManager.addListener("d_8", recalculateAnnualCarbonPercent);
  }

  /**
   * Formula Registry - Central place to define all calculation formulas
   * Each formula is implemented as a function that takes the state manager as an argument
   * This will be populated from FORMULAE.csv in the future
   */
  const FormulaRegistry = {
    // Example formula-m_8: IF(D$14="Utility Bills", K8/E8, H8/E8)
    m_8: function (stateManager) {
      const useType = stateManager.getValue("d_14");
      const eValue = parseFloat(stateManager.getValue("e_8"));

      // Avoid division by zero
      if (!eValue) return 0;

      if (useType === "Utility Bills") {
        const kValue = parseFloat(stateManager.getValue("k_8"));
        return kValue / eValue;
      } else {
        const hValue = parseFloat(stateManager.getValue("h_8"));
        return hValue / eValue;
      }
    },

    // Example temperature conversion formula
    "e-23a": function (stateManager) {
      const celsiusValue = parseFloat(stateManager.getValue("dv_d_23a"));
      return CONSTANTS.CELSIUS_TO_FAHRENHEIT(celsiusValue);
    },

    // Example ground facing HDD formula
    d_22: function (stateManager) {
      const hddValue = parseFloat(stateManager.getValue("dv_d_20"));
      return Math.round(hddValue * CONSTANTS.DEFAULT_GROUND_FACTOR);
    },

    // Example ground facing CDD formula
    h_22: function (stateManager) {
      const cddValue = parseFloat(stateManager.getValue("dv_d_21"));
      return Math.round(cddValue * CONSTANTS.DEFAULT_CDD_FACTOR);
    },

    // Add additional formulas here as they're identified from FORMULAE.csv
  };

  /**
   * Execute a formula by its ID
   * @param {string} formulaId - Formula ID (e.g., 'm_8')
   * @returns {any} The calculated result
   */
  function executeFormula(formulaId) {
    const formula = FormulaRegistry[formulaId];
    if (!formula) {
      return null;
    }

    try {
      return formula(stateManager);
    } catch (_error) {
      return null;
    }
  }

  /**
   * Calculate Climate Zone based on province and city
   */
  function recalculateClimateZone() {
    const province = stateManager.getValue("d_19");
    const city = stateManager.getValue("h_19");

    // Skip if missing data
    if (!province || !city) return;

    // Get location data from LocationManager (when available)
    let climateZone = "";
    if (window.TEUI.LocationManager) {
      const location = window.TEUI.LocationManager.getLocationData(
        city,
        province,
      );
      if (location) {
        climateZone = determineClimateZone(location.HDD);
      }
    } else {
      // Fallback calculation
      const hdd = stateManager.getValue("dv_d_20");
      if (hdd) {
        climateZone = determineClimateZone(hdd);
      }
    }

    // Update the climate zone
    if (climateZone) {
      stateManager.setValue(
        "climate-zone",
        climateZone,
        stateManager.VALUE_STATES.CALCULATED,
      );
    }
  }

  /**
   * Determine climate zone based on HDD
   * @param {number} hdd - Heating degree days
   * @returns {string} Climate zone
   */
  function determineClimateZone(hdd) {
    if (hdd < 3000) return "Zone 4";
    if (hdd < 4000) return "Zone 5";
    if (hdd < 5000) return "Zone 6";
    if (hdd < 6000) return "Zone 7";
    return "Zone 8";
  }

  /**
   * Calculate Ground Facing HDD using the correct formula
   * Ground-Facing HDD = (Heating Setpoint - 10) * 365 - Cooling Season Length
   */
  function recalculateGroundFacingHDD() {
    // Get values from stateManager using parseNumeric for robust parsing and defaults
    const stateManager = window.TEUI.StateManager; // Ensure we have the reference
    const heatingSetpoint = window.TEUI.parseNumeric(
      stateManager.getValue("h_23"),
      21,
    ); // Default 21C
    const coolingSeason = window.TEUI.parseNumeric(
      stateManager.getValue("m_19"),
      120,
    ); // Default 120 days

    // If defaults were used, values should be valid numbers, but add safety check
    if (isNaN(heatingSetpoint) || isNaN(coolingSeason)) {
      console.error(
        "Critical error: Could not determine valid heating setpoint or cooling season length for GF HDD calc.",
      );
      return;
    }

    // Calculate ground facing HDD using the correct formula
    const groundFacingHDD = Math.round(
      (heatingSetpoint - 10) * 365 - coolingSeason,
    );

    // Update the field
    stateManager.setValue(
      "d_22",
      groundFacingHDD.toString(),
      stateManager.VALUE_STATES.CALCULATED,
    );
  }

  /**
   * Calculate Ground Facing CDD
   * TODO: Current CDD calculation is incorrect.
   * The CDD capacitance calculation needs review and implementation
   * Current formula uses a simple factor of -0.85 which is incorrect
   * This should be updated based on the proper formula when available
   */
  function recalculateGroundFacingCDD() {
    const cdd = parseFloat(stateManager.getValue("dv_d_21"));

    // Skip if missing data
    if (isNaN(cdd)) return;

    // Calculate ground facing CDD
    const groundFacingCDD = Math.round(cdd * CONSTANTS.DEFAULT_CDD_FACTOR);

    // Update the field
    stateManager.setValue(
      "cf_e_22",
      groundFacingCDD.toString(),
      stateManager.VALUE_STATES.CALCULATED,
    );
  }

  /**
   * Calculate temperature conversions (C to F)
   */
  function recalculateTemperatures() {
    // Heating setpoint
    const heatingC = parseFloat(stateManager.getValue("dv_d_23a"));
    if (!isNaN(heatingC)) {
      const heatingF = Math.round(CONSTANTS.CELSIUS_TO_FAHRENHEIT(heatingC));
      stateManager.setValue(
        "cf_e_23a",
        heatingF.toString(),
        stateManager.VALUE_STATES.CALCULATED,
      );
    }

    // Cooling setpoint
    const coolingC = parseFloat(stateManager.getValue("dv_d_24a"));
    if (!isNaN(coolingC)) {
      const coolingF = Math.round(CONSTANTS.CELSIUS_TO_FAHRENHEIT(coolingC));
      stateManager.setValue(
        "cf_e_24a",
        coolingF.toString(),
        stateManager.VALUE_STATES.CALCULATED,
      );
    }
  }

  /**
   * Calculate TEUI percent value
   */
  function recalculateTEUIPercent() {
    const actual = parseFloat(stateManager.getValue("i_10"));
    const reference = parseFloat(stateManager.getValue("d_10"));

    // Skip if missing data or reference is zero
    if (isNaN(actual) || isNaN(reference) || reference === 0) return;

    // Calculate percentage
    const percent = Math.round((actual / reference) * 100);

    // Update the field
    stateManager.setValue(
      "cf_j_10",
      `${percent}%`,
      stateManager.VALUE_STATES.CALCULATED,
    );
  }

  /**
   * Calculate Annual Carbon percent value
   */
  function recalculateAnnualCarbonPercent() {
    const actual = parseFloat(stateManager.getValue("i_8"));
    const reference = parseFloat(stateManager.getValue("d_8"));

    // Skip if missing data or reference is zero
    if (isNaN(actual) || isNaN(reference) || reference === 0) return;

    // Calculate percentage
    const percent = Math.round((actual / reference) * 100);

    // Update the field
    stateManager.setValue(
      "j_8",
      `${percent}%`,
      stateManager.VALUE_STATES.CALCULATED,
    );
  }

  /**
   * Recalculate all dirty fields
   */
  function recalculateDirtyFields() {
    // Skip if no StateManager or no dirty fields
    if (!window.TEUI || !window.TEUI.StateManager) return;

    const stateManager = window.TEUI.StateManager;
    if (!stateManager.getDirtyFields || !stateManager.getCalculationOrder) {
      return;
    }

    // Get dirty fields
    const dirtyFields = stateManager.getDirtyFields();
    if (!dirtyFields || !dirtyFields.length) {
      // No dirty fields, nothing to do
      return;
    }

    // Get calculation order
    try {
      const calculationOrder = stateManager.getCalculationOrder();

      // Calculate each field in the correct order
      calculationOrder.forEach((fieldId) => {
        // Get field definition
        const field = getField(fieldId);
        if (!field) return;

        // Calculate field value if it has a calculation function
        if (field.calculate) {
          try {
            const value = field.calculate();
            stateManager.setValue(
              fieldId,
              value,
              stateManager.VALUE_STATES.CALCULATED,
            );

            // Update UI
            updateUI(fieldId, value);
          } catch (error) {
            console.error(`Error calculating field ${fieldId}:`, error);
          }
        }
      });

      // Clear dirty status
      stateManager.clearDirtyStatus();
    } catch (error) {
      console.error("Error in recalculateDirtyFields:", error);
    }
  }

  /**
   * Calculate all values in a specific section
   * @param {string} section - Section ID
   */
  function calculateSection(section) {
    // Implementation would depend on the section
    switch (section) {
      case SECTIONS.CLIMATE:
        recalculateClimateZone();
        recalculateGroundFacingHDD();
        recalculateGroundFacingCDD();
        recalculateTemperatures();
        break;

      case SECTIONS.KEY_VALUES:
        recalculateTEUIPercent();
        recalculateAnnualCarbonPercent();
        break;

      default:
        // Process any dirty fields in this section
        recalculateDirtyFields();
    }
  }

  /**
   * Recalculate all values
   */
  function calculateAll() {
    // Start performance timing
    if (window.TEUI?.Clock?.markCalculationStart) {
      window.TEUI.Clock.markCalculationStart();
    }

    // Define a logical calculation order based on major dependencies
    const calcOrder = [
      "sect02", // Building Info
      "sect03", // Climate
      "sect08", // IAQ
      "sect09", // Internal Gains
      "sect12", // Volume Metrics (defines areas for S10, S11)
      "sect10", // Radiant Gains (i80 for S15)
      "sect11", // Transmission Losses
      // "cooling", // MOVED: Now called directly by S13 to guarantee order
      "sect07", // Water Use (k51 for S15)
      "sect13", // Mechanical Loads (reads cooling values, calculates ventilation)
      "sect06", // Renewable Energy (m43 for S15)
      "sect14", // TEDI Summary (reads d_129, m_129 from cooling)
      "sect04", // Actual/Target Energy (many inputs, but needs to calc before S05 consumes its outputs)
      "sect05", // Emissions (consumes S04 outputs)
      "sect15", // TEUI Summary (consumes S14, S04 and others)
      "sect16", // Sankey Diagram (visualisation, should be late)
      "sect17", // Dependency Graph (visualisation, should be late)
      "sect01", // Key Values (consumes S15, S05)
    ];

    // Explicitly call each section's calculateAll if it exists
    calcOrder.forEach((sectionKey) => {
      if (sectionKey === "cooling") {
        // Special handling for Cooling module
        if (window.TEUI?.CoolingCalculations?.calculateAll) {
          try {
            console.log(
              "[Calculator] 🌀 Calling CoolingCalculations module...",
            );
            // ✅ BUG #9 FIX: Pass "target" mode for default calculator run
            window.TEUI.CoolingCalculations.calculateAll("target");
            console.log("[Calculator] ✅ CoolingCalculations module finished.");
          } catch (error) {
            console.error("[Calculator] ❌ Error in Cooling module:", error);
          }
        } else {
          console.warn("[Calculator] ⚠️ Cooling module not available");
        }
      } else {
        const sectionModule = window.TEUI.SectionModules?.[sectionKey];
        if (sectionModule && typeof sectionModule.calculateAll === "function") {
          try {
            sectionModule.calculateAll();
          } catch (error) {
            console.error(`Error calculating section ${sectionKey}:`, error);
          }
        } else {
          // Section module not found or doesn't have calculateAll method
        }
      }
    });

    // Note: Performance timing ends in S01 after h_10 finalization
    // Clock.markCalculationEnd() called from Section01.runAllCalculations()
  }

  /**
   * Import a formula set from CSV
   * @param {string} csv - CSV string with formulas
   */
  function importFormulasFromCSV(csv) {
    // Split into lines
    const lines = csv.split("\n");

    // Process each line
    lines.forEach((line) => {
      if (!line.trim()) return; // Skip empty lines

      // Parse CSV line
      const parts = line.split(",");
      if (parts.length < 2) return; // Skip invalid lines

      const _formulaId = parts[0].trim();
      const _formulaText = parts[1].trim();

      // Store in the formula registry for future implementation
      // This would be expanded to actually parse and convert the formula
      // For now, we just log it
    });
  }

  // Add to the initialization section
  function _initializeWeatherHandlers() {
    // Listen for city selection changes
    attachCityChangeListener();

    // Listen for province selection changes
    attachProvinceChangeListener();

    // Listen for present/future toggle
    attachPresentFutureToggleListener();

    // Show full weather data modal
    attachWeatherDataButtonListener();

    // Mark as initialized to prevent duplicate initialization
    document.weatherHandlersInitialized = true;
  }

  function attachCityChangeListener() {
    const cityDropdowns = document.querySelectorAll(
      '[data-dropdown-id="dd_h_19"]',
    );

    cityDropdowns.forEach((dropdown) => {
      dropdown.addEventListener("change", function (e) {
        const city = e.target.value;
        const province = document.querySelector(
          '[data-dropdown-id="dd_d_19"]',
        ).value;
        if (city && province) {
          updateWeatherData(province, city);
        }
      });
    });

    // If no dropdowns found, add a mutation observer to watch for them
    if (cityDropdowns.length === 0) {
      setupDropdownMutationObserver();
    }
  }

  function attachProvinceChangeListener() {
    const provinceDropdowns = document.querySelectorAll(
      '[data-dropdown-id="dd_d_19"]',
    );

    provinceDropdowns.forEach((dropdown) => {
      dropdown.addEventListener("change", function (e) {
        // Clear city dropdown values when province changes
        const cityDropdowns = document.querySelectorAll(
          '[data-dropdown-id="dd_h_19"]',
        );
        cityDropdowns.forEach((cityDropdown) => {
          cityDropdown.innerHTML = '<option value="">Select City</option>';

          // Populate with cities from the selected province
          if (e.target.value && TEUI.ExcelLocationHandler) {
            const locationData = TEUI.ExcelLocationHandler.getLocationData();
            if (locationData && locationData[e.target.value]) {
              const cities = locationData[e.target.value].cities;
              cities.forEach((city) => {
                const option = document.createElement("option");
                option.value = city.name;
                option.textContent = city.name;
                cityDropdown.appendChild(option);
              });
            }
          }
        });
      });
    });
  }

  function attachPresentFutureToggleListener() {
    const futureToggles = document.querySelectorAll(
      '[data-dropdown-id="dd_h_20"]',
    );

    futureToggles.forEach((toggle) => {
      toggle.addEventListener("change", function (_e) {
        const city = document.querySelector(
          '[data-dropdown-id="dd_h_19"]',
        )?.value;
        const province = document.querySelector(
          '[data-dropdown-id="dd_d_19"]',
        )?.value;
        if (city && province) {
          updateWeatherData(province, city);
        }
      });
    });
  }

  function attachWeatherDataButtonListener() {
    const weatherDataBtns = document.querySelectorAll(
      "#showWeatherDataBtn, #weatherDataBtn",
    );

    weatherDataBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const city = document.querySelector(
          '[data-dropdown-id="dd_h_19"]',
        )?.value;
        const province = document.querySelector(
          '[data-dropdown-id="dd_d_19"]',
        )?.value;
        if (city && province) {
          showFullWeatherData(province, city);
        } else {
          alert("Please select a province and city first.");
        }
      });
    });
  }

  function setupDropdownMutationObserver() {
    // Create a mutation observer to watch for dropdowns being added to the DOM
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === "childList") {
          const cityDropdowns = document.querySelectorAll(
            '[data-dropdown-id="dd_h_19"]',
          );
          if (cityDropdowns.length > 0) {
            attachCityChangeListener();
            observer.disconnect(); // Stop observing once dropdowns are found
          }
        }
      });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function updateWeatherData(province, city) {
    // Get the location data
    const locationData = TEUI.ExcelLocationHandler.getLocationData();
    if (!locationData) {
      console.error("No location data available");
      return;
    }

    if (!locationData[province]) {
      console.error(`Province ${province} not found in location data`);
      return;
    }

    // Find the city data
    const cityData = locationData[province].cities.find((c) => c.name === city);
    if (!cityData) {
      console.error(`City ${city} not found in province ${province}`);
      return;
    }

    // Check if we should use future values or present values
    const presentFutureEl = document.querySelector(
      '[data-dropdown-id="dd_h_20"]',
    );
    const presentFutureValue = presentFutureEl ? presentFutureEl.value : "";

    // If the value is explicitly "Future", use future data
    // Otherwise (empty or "Present"), use present data
    const isFuture = presentFutureValue === "Future";

    const feedbackArea = document.getElementById("feedback-area");
    if (feedbackArea) {
      feedbackArea.textContent = `Weather data loaded: ${city}, ${province} (${isFuture ? "Future 2021-2050" : "Current 1991-2020"})`;
      feedbackArea.style.color = "#0dcaf0";
    }

    const occupancyType =
      document.querySelector('[data-dropdown-id="dd_d_12"]')?.value ||
      "commercial";

    // Update HDD Field - both temporary and rendered cells
    const hddValue = isFuture
      ? cityData.data.HDD18_2021_2050
      : cityData.data.HDD18;

    // Update temporary input field if it exists
    const hddField = document.getElementById("in_l_2_1");
    if (hddField) {
      hddField.value = hddValue || "0";
    }

    // Update the rendered HDD field (d_20)
    updateFieldValue("d_20", hddValue);

    // Update CDD Field - both temporary and rendered cells
    const cddValue = isFuture
      ? cityData.data.CDD24_2021_2050
      : cityData.data.CDD24;

    // Update temporary input field if it exists
    const cddField = document.getElementById("in_l_2_2");
    if (cddField) {
      cddField.value = cddValue || "0";
    }

    // Update the rendered CDD field (d_21)
    updateFieldValue("d_21", cddValue);

    // Update Design Temperature Field - both temporary and rendered cells
    let designTemp;
    if (occupancyType === "residential") {
      designTemp = isFuture
        ? cityData.data.January_2_5_2021_2050
        : cityData.data.January_2_5;
    } else {
      designTemp = isFuture
        ? cityData.data.January_1_2021_2050
        : cityData.data.January_1;
    }

    // Update temporary input field if it exists
    const designTempField = document.getElementById("in_l_2_3");
    if (designTempField) {
      designTempField.value = designTemp || "0";
    }

    // Update the rendered coldest days field (d_23)
    updateFieldValue("d_23", designTemp);

    // Update the hottest days field (d_24) - Use extreme hot temperature from data
    const hottestTemp = isFuture
      ? cityData.data.Extreme_Hot_Tdb_2021_2050 ||
        cityData.data.July_2_5_Tdb_2021_2050
      : cityData.data.Extreme_Hot_Tdb_1991_2020 ||
        cityData.data.July_2_5_Tdb ||
        "34"; // Fallback value

    // Update the hottest days field (d_24)
    updateFieldValue("d_24", hottestTemp);

    // Trigger Celsius to Fahrenheit conversions for temperature fields
    recalculateTemperatures();

    // Safely trigger calculations for derived values
    try {
      calculateGFHDD();
      calculateGFCDD();
    } catch (e) {
      console.error("Error calculating ground facing values:", e);
    }

    // Safely trigger any other dependent calculations
    if (TEUI.Calculator && TEUI.Calculator.updateResults) {
      try {
        TEUI.Calculator.updateResults();
      } catch (e) {
        console.error("Error updating calculator results:", e);
      }
    }
  }

  // Helper function to update field values both in DOM and StateManager
  function updateFieldValue(fieldId, value) {
    // Update in DOM
    const fieldElements = document.querySelectorAll(
      `[data-field-id="${fieldId}"]`,
    );
    if (fieldElements.length > 0) {
      fieldElements.forEach((element) => {
        element.textContent = value || "0";
      });
    } else {
      // No DOM elements found for this field ID - field may not be rendered yet
    }

    // Update in StateManager if available
    if (window.TEUI && window.TEUI.StateManager) {
      window.TEUI.StateManager.setValue(
        fieldId,
        (value || "0").toString(),
        "derived",
      );
    }
  }

  function showFullWeatherData(province, city) {
    try {
      const locationData = TEUI.ExcelLocationHandler.getLocationData();
      if (!locationData || !locationData[province]) {
        console.error(`Province ${province} not found in location data`);
        alert(`Error: Province ${province} not found in weather data`);
        return;
      }

      const cityData = locationData[province].cities.find(
        (c) => c.name === city,
      );
      if (!cityData) {
        console.error(`City ${city} not found in province ${province}`);
        alert(`Error: City ${city} not found in province ${province}`);
        return;
      }

      // Set modal title with location information
      const modalTitleEl = document.getElementById("weatherDataModalLabel");
      if (modalTitleEl) {
        modalTitleEl.textContent = `Weather Data for ${city}, ${province}`;
      }

      // Format and display the weather data
      const weatherDataPre = document.getElementById("weatherDataContent");
      if (weatherDataPre) {
        weatherDataPre.textContent = JSON.stringify(cityData.data, null, 2);
      }

      // Show the modal using Bootstrap's modal method
      const modalEl = document.getElementById("weatherDataModal");
      if (!modalEl) {
        console.error(
          "Weather data modal element not found with ID: weatherDataModal",
        );
        alert("Error: Could not find weather data modal element");
        return;
      }

      // Initialize and show the modal (cleanup is handled by global event handler)
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    } catch (error) {
      console.error("Error showing weather data modal:", error);
      alert("Error showing weather data modal. Check console for details.");
    }
  }

  function calculateGFHDD() {
    // Get HDD value with fallback
    const hddInput = document.getElementById("in_l_2_1");
    const hdd = hddInput ? parseFloat(hddInput.value) || 0 : 0;

    // Get heating setpoint with fallback - this was causing the error (in_d_13_1 doesn't exist)
    // Instead of using in_d_13_1, we'll use a default value if the element isn't found
    const heatingSetpointInput = document.getElementById("in_d_13_1");
    const heatingSetpoint = heatingSetpointInput
      ? parseFloat(heatingSetpointInput.value) || 18
      : 18;

    // Calculate ground facing HDD
    const gfhdd = Math.max(0, (hdd * (18 - heatingSetpoint)) / 18);

    // Update the output field if it exists
    const outputField = document.getElementById("in_l_2_4");
    if (outputField) {
      outputField.value = gfhdd.toFixed(1);
    }

    // Trigger any dependent calculations if the Calculator is available
    if (TEUI.Calculator && TEUI.Calculator.updateResults) {
      TEUI.Calculator.updateResults();
    }

    return gfhdd; // Return the calculated value for potential use elsewhere
  }

  function calculateGFCDD() {
    // Get CDD value with fallback
    const cddInput = document.getElementById("in_l_2_2");
    const cdd = cddInput ? parseFloat(cddInput.value) || 0 : 0;

    // Get cooling setpoint with fallback
    const coolingSetpointInput = document.getElementById("in_d_13_2");
    const coolingSetpoint = coolingSetpointInput
      ? parseFloat(coolingSetpointInput.value) || 24
      : 24;

    // Calculate ground facing CDD
    const gfcdd = Math.max(0, (cdd * (24 - coolingSetpoint)) / 24);

    // Update the output field if it exists
    const outputField = document.getElementById("in_l_2_5");
    if (outputField) {
      outputField.value = gfcdd.toFixed(1);
    }

    // Trigger any dependent calculations if the Calculator is available
    if (TEUI.Calculator && TEUI.Calculator.updateResults) {
      TEUI.Calculator.updateResults();
    }

    return gfcdd; // Return the calculated value for potential use elsewhere
  }

  function _setupEventListeners() {
    // Wait for the elements to be available
    const heatingSetpointInput = document.getElementById("in_d_13_1");
    if (heatingSetpointInput) {
      heatingSetpointInput.addEventListener("change", calculateGFHDD);
    } else {
      // Heating setpoint input not found - element may not be rendered yet
    }

    const coolingSetpointInput = document.getElementById("in_d_13_2");
    if (coolingSetpointInput) {
      coolingSetpointInput.addEventListener("change", calculateGFCDD);
    } else {
      // Cooling setpoint input not found - element may not be rendered yet
    }
  }

  // Public API
  return {
    initialize: initialize,
    calculateSection: calculateSection,
    calculateAll: calculateAll,
    recalculateDirtyFields: recalculateDirtyFields,
    importFormulasFromCSV: importFormulasFromCSV,
    executeFormula: executeFormula,
    updateWeatherData: updateWeatherData,
    showFullWeatherData: showFullWeatherData,
    updateResults: function () {
      // Recalculate all dirty fields
      recalculateDirtyFields();
    },
  };
})();

// Initialize when the document is ready
document.addEventListener("DOMContentLoaded", function () {
  TEUI.Calculator.initialize();

  // Set up recalculation on state changes
  if (window.TEUI.StateManager) {
    // Listen for value changes that should trigger recalculation
    const stateManager = window.TEUI.StateManager;

    // Restore wildcard listener - it is part of the original architecture.
    // This listener is crucial for dynamic updates based on any field change,
    // triggering recalculation of dirty fields to maintain data consistency.
    // It was temporarily commented out during debugging of d_97 propagation (Aug 2024).
    stateManager.addListener("*", function (newValue, oldValue, fieldId) {
      // Skip calculated values to avoid circular recalculation if setValue with 'calculated' already handles deps
      // However, if a calculated value IS a direct precedent for another, this might still be needed.
      // The primary guard against infinite loops should be StateManager not auto-triggering from 'calculated' state for registerDependency.
      if (fieldId.startsWith("cf_") || fieldId.startsWith("dv_")) {
        return;
      }

      TEUI.Calculator.recalculateDirtyFields();
    });
  }

  // initializeWeatherDataHandlers(); // REMOVED: Called from teui-rendering-complete listener instead
});

// Move function outside the DOMContentLoaded event handler for proper scope access
function _initializeWeatherDataHandlers() {
  // Check for the presence of a feedback area
  const feedbackArea = document.getElementById("feedback-area");
  if (feedbackArea) {
    feedbackArea.textContent =
      "Weather handlers initialized. Select a province and city to load weather data.";
    feedbackArea.style.color = "#0dcaf0";
  }

  // Listen for province selection changes
  const provinceDropdown = document.querySelector(
    '[data-dropdown-id="dd_d_19"]',
  );
  if (provinceDropdown) {
    provinceDropdown.addEventListener("change", function (e) {
      const province = e.target.value;
      const citySelect = document.querySelector('[data-dropdown-id="dd_h_19"]');

      // Clear and disable city dropdown if no province selected
      citySelect.innerHTML = '<option value="">Select City</option>';
      citySelect.disabled = !province;

      if (province && TEUI.ExcelLocationHandler.getLocationData()) {
        const locationData = TEUI.ExcelLocationHandler.getLocationData();
        if (locationData && locationData[province]) {
          const cities = locationData[province].cities;
          cities.forEach((city) => {
            const option = document.createElement("option");
            option.value = city.name;
            option.textContent = city.name;
            citySelect.appendChild(option);
          });
        }
      }
    });
  }

  // Listen for city selection changes
  const cityDropdown = document.querySelector('[data-dropdown-id="dd_h_19"]');
  if (cityDropdown) {
    cityDropdown.addEventListener("change", function (e) {
      const city = e.target.value;
      const province = document.querySelector(
        '[data-dropdown-id="dd_d_19"]',
      ).value;
      if (city && province) {
        // Use the properly scoped function from TEUI.Calculator
        TEUI.Calculator.updateWeatherData(province, city);
      }
    });
  }

  // Make sure Present/Future toggle exists and has 'Present' selected
  const futureToggle = document.querySelector('[data-dropdown-id="dd_h_20"]');
  if (futureToggle) {
    // Check if empty, and if so, add options
    if (futureToggle.options.length === 0) {
      // Add Present option
      const presentOption = document.createElement("option");
      presentOption.value = "Present";
      presentOption.textContent = "Present (1991-2020)";
      presentOption.selected = true;
      futureToggle.appendChild(presentOption);

      // Add Future option
      const futureOption = document.createElement("option");
      futureOption.value = "Future";
      futureOption.textContent = "Future (2021-2050)";
      futureToggle.appendChild(futureOption);
    } else if (futureToggle.value === "") {
      // If empty selection, select 'Present' by default
      for (let i = 0; i < futureToggle.options.length; i++) {
        if (futureToggle.options[i].value === "Present") {
          futureToggle.options[i].selected = true;
          break;
        }
      }
    }

    // Add event listener
    futureToggle.addEventListener("change", function (_e) {
      const city = document.querySelector('[data-dropdown-id="dd_h_19"]').value;
      const province = document.querySelector(
        '[data-dropdown-id="dd_d_19"]',
      ).value;
      if (city && province) {
        // Use the properly scoped function from TEUI.Calculator
        TEUI.Calculator.updateWeatherData(province, city);
      }
    });
  } else {
    console.error("Present/Future toggle dropdown not found!");
  }

  // Add event listener for the Weather Data button in the section content
  const weatherDataBtn = document.getElementById("weatherDataBtn");
  if (weatherDataBtn) {
    weatherDataBtn.addEventListener("click", function () {
      const city = document.querySelector('[data-dropdown-id="dd_h_19"]').value;
      const province = document.querySelector(
        '[data-dropdown-id="dd_d_19"]',
      ).value;
      if (city && province) {
        // Note: showFullWeatherData is also in TEUI.Calculator scope
        TEUI.Calculator.showFullWeatherData(province, city);
      } else {
        alert("Please select a province and city first.");
      }
    });
  }

  // Add event listener for the More Weather Data button in the header
  const showWeatherDataBtn = document.getElementById("showWeatherDataBtn");
  if (showWeatherDataBtn) {
    showWeatherDataBtn.addEventListener("click", function () {
      const city = document.querySelector('[data-dropdown-id="dd_h_19"]').value;
      const province = document.querySelector(
        '[data-dropdown-id="dd_d_19"]',
      ).value;
      if (city && province) {
        // Note: showFullWeatherData is also in TEUI.Calculator scope
        TEUI.Calculator.showFullWeatherData(province, city);
      } else {
        alert("Please select a province and city first.");
      }
    });
  }
}

/**
 * Get a field definition by ID
 */
function getField(fieldId) {
  // Try to get from the FieldManager's fields
  if (window.TEUI?.fields && window.TEUI.fields[fieldId]) {
    return window.TEUI.fields[fieldId];
  }

  // Return a default object if field not found
  return null;
}

/**
 * Update the UI with a calculated value
 */
function updateUI(fieldId, value) {
  // Try to update the DOM element
  const element = document.querySelector(`[data-field-id="${fieldId}"]`);
  if (!element) return;

  // Format value if it's a number
  let displayValue = value;
  if (typeof value === "number") {
    if (fieldId.includes("percent")) {
      displayValue = `${Math.round(value)}%`;
    } else {
      // Format with commas and appropriate decimal places
      displayValue = value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    }
  }

  // Update element based on type
  if (element.tagName === "INPUT") {
    element.value = displayValue;
  } else if (element.tagName === "SELECT") {
    element.value = displayValue;
  } else {
    element.textContent = displayValue;
  }
}
