/**
 * 4011-SectionIntegrator.js
 *
 * Module for handling integration between different sections of the TEUI Calculator
 * Manages data flow and dependencies between sections
 *
 * =============================================================================
 * CROSS-SECTION DATA FLOW: LESSONS FROM TEUI CALCULATION INTEGRATION
 * =============================================================================
 *
 * The TEUI calculation represents a critical case study for cross-section data flow.
 * Below are key principles and lessons learned that should be applied when
 * integrating calculations across sections:
 *
 * 1. DATA OWNERSHIP
 *    - Each field has a clear owner section where it's primarily calculated or input
 *    - User inputs typically come from one section but affect calculations in multiple sections
 *    - Example: Area (h_15) comes from Section 2 but is used in TEUI calculations in Section 1
 *
 * 2. STATEMANAGER AS THE SINGLE SOURCE OF TRUTH
 *    - All calculations should get values from and store results to StateManager
 *    - NEVER pass values directly between sections without going through StateManager
 *    - WRONG: section1.setTEUI(section4.getEnergy() / section2.getArea())
 *    - RIGHT: Calculate TEUI using `StateManager.getValue('f_32')` and `StateManager.getValue('h_15')`
 *
 * 3. PROPAGATION METHODS FOR DOM-BASED VALUES
 *    - DOM-first approach: When a DOM element is updated, explicitly set StateManager value
 *    - When updating derived/calculated values, update both StateManager AND the DOM display
 *    - Example: When subtotals are updated in Section 4, we directly update StateManager:
 *      ```
 *      const f32Value = calculateSum(...);
 *      f32El.textContent = formatNumber(f32Value);
 *      window.TEUI.StateManager.setValue("f_32", f32Value.toString(), "calculated");
 *      ```
 *
 * 4. LAYERED CALCULATION APPROACH (CRUCIAL)
 *    - Calculations should be separated into layers with clear dependencies:
 *      a) Raw user inputs (direct inputs in a section)
 *      b) Primary derived values (calculated values within sections)
 *      c) Cross-section composite values (values dependent on multiple sections)
 *    - TEUI exemplifies this: User energy inputs (Section 4) → Energy subtotals (Section 4) → TEUI (Section 1)
 *
 * 5. EVENT-DRIVEN UPDATES VS. POLLING
 *    - Prefer event-based notifications (StateManager listeners) over polling or interval checks
 *    - Add explicit listeners for critical fields that trigger downstream calculations:
 *      ```
 *      addListener('f_32', () => updateTEUICalculations('f_32'));
 *      addListener('h_15', () => updateTEUICalculations('h_15'));
 *      ```
 *
 * 6. FALLBACK MECHANISMS
 *    - Implement multiple methods to resolve values in case the primary method fails:
 *      a) First try StateManager.getValue()
 *      b) If that fails, try extracting from DOM elements directly
 *      c) Default to hardcoded values only as a last resort
 *    - Include validation to prevent calculation errors (check for NaN, division by zero, etc.)
 *
 * 7. DEBUGGING & LOGGING
 *    - Log calculated values with their sources at each step in the calculation chain
 *    - Especially log when values are read from or written to StateManager
 *    - When debugging cross-section calculations, trace the entire data flow path
 *
 * 8. COMMON PITFALLS IDENTIFIED
 *    - Hardcoded values that don't update with user inputs - always get real-time values
 *    - Format/parsing conflicts - ensure consistent handling of numerical formats (commas, decimals)
 *    - DOM-vs-State desynchronization - ensure both are updated together
 *    - Incorrect source fields - double-check field IDs when accessing data from other sections
 *    - Missing update triggers - ensure all input changes propagate through the calculation chain
 *
 * 9. DEPENDENCY INITIALIZATION ORDER
 *    - Order matters - initialize dependencies before dependent calculations
 *    - Use StateManager's registerDependency() to establish formal relationships
 *    - Ensures calculation order respects dependencies
 *
 * 10. SPECIAL CASES HANDLING
 *     - Handle zero values explicitly (e.g., zero energy = zero TEUI)
 *     - Handle out-of-range or anomalous values with clear validation
 *     - Include UI feedback for special cases (warnings, colors, etc.)
 *
 * 10. DOCUMENTATION AND NOTES
 *     - SectionIntegrator should automatically handle cross-section references
 *     - User notes section can capture specific project details
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};

// Section Integrator Module
TEUI.SectionIntegrator = (function () {
  // Keep track of registered section integrations
  const registeredIntegrations = {};

  /**
   * Initialize the integrator
   */
  function initialize() {
    // Register known integrations
    registerTEUIIntegration();
    registerEmissionsFactorIntegration();
    registerRadiantGainsIntegration();
    registerTEDITELIIntegration(); // Register new integration for TEDI/TELI
    registerVolumeMetricsIntegration(); // Register new integration for Volume Metrics

    // Listen for rendering complete event
    document.addEventListener("teui-rendering-complete", function () {
      initializeAllIntegrations();
    });
  }

  /**
   * Register the integration between Section04 and Section01 for TEUI calculations
   */
  function registerTEUIIntegration() {
    // Register this integration
    registeredIntegrations.teui = {
      name: "TEUI Calculation",
      sections: ["sect04", "sect01"],
      description:
        "Calculates TEUI values in Section01 based on energy data from Section04",
      initialize: initializeTEUIIntegration,
    };
  }

  /**
   * Register the integration between Section03 and Section04 for emissions factor calculations
   */
  function registerEmissionsFactorIntegration() {
    // Register this integration
    registeredIntegrations.emissionsFactor = {
      name: "Emissions Factor Integration",
      sections: ["sect03", "sect04"],
      description:
        "Updates emission factors in Section04 based on province selection in Section03",
      initialize: initializeEmissionsFactorIntegration,
    };
  }

  /**
   * Register the integration for Radiant Gains calculations
   */
  function registerRadiantGainsIntegration() {
    // Register this integration
    registeredIntegrations.radiantGains = {
      name: "Radiant Gains Integration",
      sections: ["sect10", "sect09", "sect03"],
      description:
        "Calculates solar gains based on building orientation and climate data",
      initialize: initializeRadiantGainsIntegration,
    };
  }

  /**
   * Register the integration for TEDI & TELI calculations
   */
  function registerTEDITELIIntegration() {
    // Register this integration
    registeredIntegrations.tediTeli = {
      name: "TEDI & TELI Integration",
      sections: ["sect14", "sect15", "sect02"],
      description:
        "Integrates TEDI/TELI calculations with building area and TEUI summary",
      initialize: initializeTEDITELIIntegration,
    };
  }

  /**
   * Register the integration for Volume Metrics calculations
   */
  function registerVolumeMetricsIntegration() {
    // Register this integration
    registeredIntegrations.volumeMetrics = {
      name: "Volume Metrics Integration",
      sections: ["sect12", "sect11", "sect14"],
      description:
        "Integrates building volume metrics with envelope and TEDI/TELI calculations",
      initialize: initializeVolumeMetricsIntegration,
    };
  }

  /**
   * Initialize all registered integrations
   */
  function initializeAllIntegrations() {
    Object.values(registeredIntegrations).forEach((integration) => {
      try {
        if (typeof integration.initialize === "function") {
          integration.initialize();
        }
      } catch (error) {
        console.error(
          `Error initializing integration ${integration.name}:`,
          error,
        );
      }
    });
  }

  /**
   * Initialize the TEUI integration between Section04 and Section01
   */
  function initializeTEUIIntegration() {
    if (!window.TEUI.StateManager) {
      console.error("StateManager not available for TEUI integration");
      return;
    }

    // Set correct values in the StateManager to ensure proper TEUI calculation
    ensureCorrectTEUIValues();

    // For Section04, find the total energy input fields and add change listeners
    setupSection04Listeners();

    // For Section01, make sure it listens to the relevant state changes
    setupSection01Listeners();

    // Make initial calculation
    updateTEUIValues();
  }

  /**
   * Initialize the TEDI & TELI integration between Section14, Section15, and other sections
   */
  function initializeTEDITELIIntegration() {
    if (!window.TEUI.StateManager) {
      console.error("StateManager not available for TEDI/TELI integration");
      return;
    }

    // Register critical cross-section dependencies
    registerTEDITELIDependencies();

    // Set up listeners for area changes to trigger TEDI/TELI recalculation
    setupTEDITELIListeners();

    // Create a global function for forcing TEDI/TELI recalculation from any section
    window.TEUI.updateTEDITELIValues = function () {
      forceTEDITELIUpdate();
    };

    // Initial calculation to ensure consistency
    forceTEDITELIUpdate();
  }

  /**
   * Register formal dependencies between sections for TEDI/TELI calculations
   */
  function registerTEDITELIDependencies() {
    if (!window.TEUI.StateManager) return;

    // Building area from Section 2 affects TEDI/TELI intensity values
    window.TEUI.StateManager.registerDependency("h_15", "h_126"); // Area affects TEDI
    window.TEUI.StateManager.registerDependency("h_15", "h_127"); // Area affects TEDI (Excludes Ventilation)
    window.TEUI.StateManager.registerDependency("h_15", "h_128"); // Area affects CEDI Unmitigated
    window.TEUI.StateManager.registerDependency("h_15", "h_130"); // Area affects TELI
    window.TEUI.StateManager.registerDependency("h_15", "h_131"); // Area affects CEGI

    // TEDI values affect TEUI summary in Section 15
    window.TEUI.StateManager.registerDependency("h_126", "h_136"); // TEDI affects TEUI summary

    // Register other critical cross-section dependencies
    window.TEUI.StateManager.registerDependency("d_121", "d_126"); // Ventilation affects TED Targeted
  }

  /**
   * Set up listeners for changes that should trigger TEDI/TELI recalculation
   */
  function setupTEDITELIListeners() {
    if (!window.TEUI.StateManager) return;

    // Listen for area changes to update intensity values
    window.TEUI.StateManager.addListener("h_15", function () {
      forceTEDITELIUpdate();
    });

    // Listen for ventilation changes
    window.TEUI.StateManager.addListener("d_121", function () {
      forceTEDITELIUpdate();
    });
  }

  /**
   * Force update of TEDI/TELI calculations across all affected sections
   */
  function forceTEDITELIUpdate() {
    // First try using Section 14's calculation function
    if (window.TEUI.SectionModules && window.TEUI.SectionModules.sect14) {
      if (
        typeof window.TEUI.SectionModules.sect14.calculateValues === "function"
      ) {
        window.TEUI.SectionModules.sect14.calculateValues();
      }

      if (
        typeof window.TEUI.SectionModules.sect14.updateDisplay === "function"
      ) {
        window.TEUI.SectionModules.sect14.updateDisplay();
      }
    }

    // Then update Section 15 if available
    if (window.TEUI.SectionModules && window.TEUI.SectionModules.sect15) {
      if (
        typeof window.TEUI.SectionModules.sect15.calculateAll === "function"
      ) {
        window.TEUI.SectionModules.sect15.calculateAll();
      } else if (
        typeof window.TEUI.SectionModules.sect15.calculateValues === "function"
      ) {
        // Fallback to calculateValues if calculateAll not available
        window.TEUI.SectionModules.sect15.calculateValues();

        // Also call updateDisplay separately if calculateAll not available
        if (
          typeof window.TEUI.SectionModules.sect15.updateDisplay === "function"
        ) {
          window.TEUI.SectionModules.sect15.updateDisplay();
        }
      }
    }

    // If Section 1 exists, trigger TEUI update there as well since it uses TEDI values
    if (window.TEUI.SectionModules && window.TEUI.SectionModules.sect01) {
      if (
        typeof window.TEUI.SectionModules.sect01.updateTEUIDisplay ===
        "function"
      ) {
        window.TEUI.SectionModules.sect01.updateTEUIDisplay();
      }
    }
  }

  /**
   * Ensure the correct TEUI values are set in the StateManager ONLY at initial startup
   */
  function ensureCorrectTEUIValues() {
    // ONLY set default values during initial startup, never override existing values
    if (window.TEUI.StateManager) {
      // Check if these have already been initialized from any source
      const hasF32 = window.TEUI.StateManager.getValue("f_32") !== null;
      const hasJ32 = window.TEUI.StateManager.getValue("j_32") !== null;
      const hasH15 = window.TEUI.StateManager.getValue("h_15") !== null;

      // Only set defaults if they don't already exist from any source
      if (!hasF32) {
        window.TEUI.StateManager.setValue(
          "f_32",
          "132938.00",
          window.TEUI.StateManager.VALUE_STATES.DEFAULT,
        );
      }

      if (!hasJ32) {
        window.TEUI.StateManager.setValue(
          "j_32",
          "132763.65",
          window.TEUI.StateManager.VALUE_STATES.DEFAULT,
        );
      }

      if (!hasH15) {
        window.TEUI.StateManager.setValue(
          "h_15",
          "1427.20",
          window.TEUI.StateManager.VALUE_STATES.DEFAULT,
        );
      }

      /*
            console.log('TEUI source values after initialization:');
            console.log('- f_32 (Actual Energy):', window.TEUI.StateManager.getValue('f_32'));
            console.log('- j_32 (Target Energy):', window.TEUI.StateManager.getValue('j_32'));
            console.log('- h_15 (Area):', window.TEUI.StateManager.getValue('h_15'));
            */
    }
  }

  /**
   * Setup listeners for relevant fields in Section04
   */
  function setupSection04Listeners() {
    // Find all input fields in the energy section that contribute to the total
    const section04 = document.getElementById("actualTargetEnergy");
    if (!section04) {
      console.warn("Section04 element not found for TEUI integration");
      return;
    }

    // Find the actual energy value fields
    const actualEnergyInputs = section04.querySelectorAll(
      'input[data-contributes-to="f_32"]',
    );

    // Add change listeners to all fields that contribute to the total
    actualEnergyInputs.forEach((input) => {
      input.addEventListener("change", function () {
        updateTEUIValues();
      });
    });

    // Also listen for the target energy inputs
    const targetEnergyInputs = section04.querySelectorAll(
      'input[data-contributes-to="j_32"]',
    );

    // Add change listeners
    targetEnergyInputs.forEach((input) => {
      input.addEventListener("change", function () {
        updateTEUIValues();
      });
    });
  }

  /**
   * Setup listeners for Section01 to handle TEUI updates
   */
  function setupSection01Listeners() {
    const section01 = document.getElementById("keyValues");
    if (!section01) {
      console.warn("Section01 element not found for TEUI integration");
      return;
    }

    // Listen for dropdown changes in Section 2 to toggle between Targeted Use and Utility Bills
    const dropdown = document.querySelector('select[data-field-id="d_14"]');
    if (dropdown) {
      dropdown.addEventListener("change", function () {
        // Update the display in Section01
        if (
          window.TEUI.SectionModules.sect01 &&
          typeof window.TEUI.SectionModules.sect01
            .updateActualValuesBasedOnDropdown === "function"
        ) {
          window.TEUI.SectionModules.sect01.updateActualValuesBasedOnDropdown();
        }
      });
    }
  }

  /**
   * Update TEUI values based on current energy and area data
   */
  function updateTEUIValues() {
    // First, try to directly call the global calculateTEUI function (most direct method)
    if (typeof window.calculateTEUI === "function") {
      window.calculateTEUI();
    }
    // Fallback to StateManager if direct function not available
    else if (
      window.TEUI.StateManager &&
      typeof window.TEUI.StateManager.updateTEUICalculations === "function"
    ) {
      window.TEUI.StateManager.updateTEUICalculations(
        "section-integrator-force",
      );
    }

    // Always trigger display update regardless of calculation method
    if (
      window.TEUI.SectionModules.sect01 &&
      typeof window.TEUI.SectionModules.sect01.updateTEUIDisplay === "function"
    ) {
      window.TEUI.SectionModules.sect01.updateTEUIDisplay();
    }
  }

  /**
   * Initialize the emissions factor integration between Section03 and Section04
   */
  function initializeEmissionsFactorIntegration() {
    if (!window.TEUI.StateManager) {
      console.error(
        "StateManager not available for emissions factor integration",
      );
      return;
    }

    // Register formal dependency between section fields
    window.TEUI.StateManager.registerDependency("d_19", "l_27");
    window.TEUI.StateManager.registerDependency("h_12", "l_27");

    // Add listener to force recalculation when province changes
    window.TEUI.StateManager.addListener("d_19", function (_newValue) {
      forceEmissionsFactorUpdate();
    });

    // Add listener to force recalculation when reporting year changes
    window.TEUI.StateManager.addListener("h_12", function (_newValue) {
      forceEmissionsFactorUpdate();
    });

    // Create a global function that Section09 can use safely
    window.TEUI.updateEmissionFactor = function () {
      forceEmissionsFactorUpdate();
    };

    // Initial update
    forceEmissionsFactorUpdate();
  }

  /**
   * Force update of emissions factors based on current province and year
   */
  function forceEmissionsFactorUpdate() {
    // First try using the global function if it's available
    if (typeof window.updateElectricityEmissionFactor === "function") {
      window.updateElectricityEmissionFactor();
      return;
    }

    // Then try using the module function
    if (window.TEUI.SectionModules && window.TEUI.SectionModules.sect04) {
      if (
        typeof window.TEUI.SectionModules.sect04
          .updateElectricityEmissionFactor === "function"
      ) {
        window.TEUI.SectionModules.sect04.updateElectricityEmissionFactor();
        return;
      }
    }

    // Try indirect method through DOM event
    const provinceDropdown = document.querySelector(
      '[data-dropdown-id="dd_d_19"]',
    );
    if (provinceDropdown) {
      provinceDropdown.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  /**
   * Initialize the radiant gains integration
   */
  function initializeRadiantGainsIntegration() {
    if (!window.TEUI.StateManager) {
      console.error("StateManager not available for Radiant Gains integration");
      return;
    }

    // Register dependencies between sections
    window.TEUI.StateManager.registerDependency("j_19", "m_73"); // Climate zone impacts gain factor calculations
    window.TEUI.StateManager.registerDependency("j_19", "m_74");
    window.TEUI.StateManager.registerDependency("j_19", "m_75");
    window.TEUI.StateManager.registerDependency("j_19", "m_76");
    window.TEUI.StateManager.registerDependency("j_19", "m_77");
    window.TEUI.StateManager.registerDependency("j_19", "m_78");

    // Make internal gains from Section 9 impact utilization calculations
    window.TEUI.StateManager.registerDependency("i_71", "e_80");
    window.TEUI.StateManager.registerDependency("i_71", "e_81");

    // Set up listener for climate zone changes
    window.TEUI.StateManager.addListener("j_19", function () {
      if (typeof window.recalculateRadiantGains === "function") {
        window.recalculateRadiantGains();
      }
    });

    // Create a global function that any section can use
    window.TEUI.updateRadiantGains = function () {
      if (typeof window.recalculateRadiantGains === "function") {
        window.recalculateRadiantGains();
      }
    };
  }

  /**
   * Initialize the Volume Metrics integration between Section12 and related sections
   */
  function initializeVolumeMetricsIntegration() {
    if (!window.TEUI.StateManager) {
      console.error(
        "StateManager not available for Volume Metrics integration",
      );
      return;
    }

    // Register critical cross-section dependencies
    registerVolumeMetricsDependencies();

    // Set up listeners for envelope changes to trigger Volume Metrics recalculation
    setupVolumeMetricsListeners();

    // Create a global function for forcing Volume Metrics recalculation from any section
    window.TEUI.updateVolumeMetrics = function () {
      forceVolumeMetricsUpdate();
    };

    // Initial calculation to ensure consistency
    forceVolumeMetricsUpdate();
  }

  /**
   * Register formal dependencies between sections for Volume Metrics calculations
   */
  function registerVolumeMetricsDependencies() {
    if (!window.TEUI.StateManager) return;

    // Envelope U-values from Section 11 affect Volume Metrics in Section 12
    window.TEUI.StateManager.registerDependency("h_85", "d_104"); // Roof U-value affects combined U
    window.TEUI.StateManager.registerDependency("h_86", "d_104"); // Wall U-value affects combined U
    window.TEUI.StateManager.registerDependency("h_89", "d_104"); // Window U-value affects combined U
    window.TEUI.StateManager.registerDependency("h_95", "d_104"); // Floor U-value affects combined U

    // Volume Metrics from Section 12 affect TEDI values in Section 14
    window.TEUI.StateManager.registerDependency("i_104", "i_126"); // Total heat loss affects TEDI
    window.TEUI.StateManager.registerDependency("i_103", "i_126"); // Air leakage heat loss affects TEDI
  }

  /**
   * Set up listeners for changes that should trigger Volume Metrics recalculation
   */
  function setupVolumeMetricsListeners() {
    if (!window.TEUI.StateManager) return;

    // Listen for envelope changes to update volume metrics
    const envelopeFields = [
      "h_85",
      "h_86",
      "h_89",
      "h_95",
      "d_85",
      "d_86",
      "d_89",
      "d_90",
      "d_91",
      "d_92",
      "d_95",
    ];

    envelopeFields.forEach((fieldId) => {
      window.TEUI.StateManager.addListener(fieldId, function () {
        forceVolumeMetricsUpdate();
      });
    });
  }

  // Add debouncing for Volume Metrics updates
  let volumeMetricsUpdateTimeout = null;

  /**
   * Force update of Volume Metrics calculations across all affected sections
   */
  function forceVolumeMetricsUpdate() {
    // Clear any pending update
    if (volumeMetricsUpdateTimeout) {
      clearTimeout(volumeMetricsUpdateTimeout);
    }

    // Debounce the update to prevent excessive calls
    volumeMetricsUpdateTimeout = setTimeout(() => {
      // First try using Section 12's calculation function
      if (window.TEUI.SectionModules && window.TEUI.SectionModules.sect12) {
        if (
          typeof window.TEUI.SectionModules.sect12.calculateAll === "function"
        ) {
          window.TEUI.SectionModules.sect12.calculateAll();
        }
      }
      // Fallback to global function
      else if (window.TEUI.forceSurfaceMetricsUpdate) {
        window.TEUI.forceSurfaceMetricsUpdate("section-integrator");
      }

      // Update TEDI/TELI if available since it depends on volume metrics
      if (window.TEUI.updateTEDITELIValues) {
        window.TEUI.updateTEDITELIValues();
      }

      volumeMetricsUpdateTimeout = null;
    }, 100); // 100ms debounce
  }

  // Initialize on load
  document.addEventListener("DOMContentLoaded", initialize);

  // Create a globally available safe version for any section to use
  /*
    window.setInitialDropdownValues = function() {
        // Create a safe delayed call
        setTimeout(function() {
            if (window.updateElectricityEmissionFactor) {
                window.updateElectricityEmissionFactor();
            } else if (window.TEUI?.SectionModules?.sect04?.updateElectricityEmissionFactor) {
                window.TEUI.SectionModules.sect04.updateElectricityEmissionFactor();
            } else if (window.TEUI?.updateEmissionFactor) {
                window.TEUI.updateEmissionFactor();
            } else {
                // console.warn("No emission factor update function available");
            }
        }, 500); // Delay to ensure functions are loaded
    };
    */

  // Public API
  return {
    initialize: initialize,
    updateTEUIValues: updateTEUIValues,
    getRegisteredIntegrations: function () {
      return { ...registeredIntegrations };
    },
  };
})();
