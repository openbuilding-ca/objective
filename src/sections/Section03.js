/**
 * 4012-Section03.js - ENHANCED WITH DUALSTATE ARCHITECTURE
 * Climate Calculations (Section 3) module for TEUI Calculator 4.012
 *
 * BREAKTHROUGH: Integrated proven Target/Reference state isolation
 * Using ClimateValues JSON for data lookup (no Excel import needed)
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

// Section 3: Climate Calculations Module with DualState Architecture
window.TEUI.SectionModules.sect03 = (function () {
  //==========================================================================
  // DUAL-STATE ARCHITECTURE (Self-Contained State Module - Pattern A)
  //==========================================================================

  // PATTERN 1: Internal State Objects (Self-Contained + Persistent)
  const TargetState = {
    state: {},
    listeners: {},
    initialize: function () {
      const savedState = localStorage.getItem("S03_TARGET_STATE");
      if (savedState) {
        try {
          this.state = JSON.parse(savedState);
          // console.log("S03 TARGET STATE: Restored from localStorage", this.state);
        } catch (e) {
          this.setDefaults();
        }
      } else {
        this.setDefaults();
      }
    },
    setDefaults: function () {
      // ✅ ANTI-PATTERN FIX: Field definitions are single source of truth - no hardcoded fallbacks
      this.state = {
        d_19: getFieldDefault("d_19"), // Province
        h_19: getFieldDefault("h_19"), // City
        h_20: getFieldDefault("h_20"), // Timeframe
        h_21: getFieldDefault("h_21"), // Capacitance setting
        m_19: getFieldDefault("m_19"), // Cooling days
        l_20: getFieldDefault("l_20"), // Summer night temp (NEW - Cooling Refactor)
        l_21: getFieldDefault("l_21"), // Summer RH% (NEW - Cooling Refactor)
        l_22: getFieldDefault("l_22"), // Elevation
        l_24: getFieldDefault("l_24"), // Cooling override
        i_21: getFieldDefault("i_21"), // Capacitance percentage
        // ✅ CALCULATED FIELDS REMOVED: h_23, h_24 are calculated, not defaults
        // Climate data populated by calculation engines from ClimateValues.js
        // NOTE: l_23 (Seasonal outdoor RH%) will be added in future phase
      };
      console.log(
        "S03: Target defaults set from field definitions - single source of truth",
      );
    },
    saveState: function () {
      try {
        localStorage.setItem("S03_TARGET_STATE", JSON.stringify(this.state));
      } catch (e) {
        console.log("S03 TARGET STATE: Error saving", e);
      }
    },
    setValue: function (fieldId, value, source = "user") {
      this.state[fieldId] = value;
      this.notifyListeners(fieldId, value);
      this.saveState();
      // console.log(`S03 TARGET setValue: ${fieldId} = ${value} (${source})`);
    },
    getValue: function (fieldId) {
      return this.state[fieldId];
    },
    addListener: function (fieldId, callback) {
      if (!this.listeners[fieldId]) {
        this.listeners[fieldId] = [];
      }
      this.listeners[fieldId].push(callback);
    },
    notifyListeners: function (fieldId, value) {
      if (this.listeners[fieldId]) {
        this.listeners[fieldId].forEach((callback) => callback(value));
      }
    },
    syncFromGlobalState: function (fieldIds = ["d_19", "h_19", "i_21"]) {
      fieldIds.forEach((fieldId) => {
        const globalValue = window.TEUI.StateManager.getValue(fieldId);
        if (globalValue !== null && globalValue !== undefined) {
          this.setValue(fieldId, globalValue, "imported");
          console.log(
            `S03 TargetState: Synced ${fieldId} = ${globalValue} from global StateManager`,
          );
        }
      });
    },
  };

  // Reference State Management (with dynamic defaults based on d_13)
  const ReferenceState = {
    state: {},
    listeners: {},
    initialize: function () {
      const savedState = localStorage.getItem("S03_REFERENCE_STATE");
      if (savedState) {
        try {
          this.state = JSON.parse(savedState);
          // console.log("S03 REFERENCE STATE: Restored from localStorage", this.state);
        } catch (e) {
          this.setDefaults();
        }
      } else {
        this.setDefaults();
      }
    },
    setDefaults: function () {
      // ✅ ANTI-PATTERN FIX: Field definitions are single source of truth - no hardcoded fallbacks
      this.state = {
        // 1. Base defaults from field definitions (single source of truth)
        d_19: getFieldDefault("d_19"), // Province
        h_19: getFieldDefault("h_19"), // City
        h_20: getFieldDefault("h_20"), // Timeframe
        h_21: getFieldDefault("h_21"), // Capacitance setting
        m_19: getFieldDefault("m_19"), // Cooling days
        l_20: getFieldDefault("l_20"), // Summer night temp (NEW - Cooling Refactor)
        l_21: getFieldDefault("l_21"), // Summer RH% (NEW - Cooling Refactor)
        l_22: getFieldDefault("l_22"), // Elevation
        l_24: getFieldDefault("l_24"), // Cooling override
        i_21: getFieldDefault("i_21"), // Capacitance percentage

        // 2. Reference-specific overrides (same as Target for S03 Excel compliance)
        // Both Target and Reference use Ontario/Alexandria for Excel baseline
        // ✅ CALCULATED FIELDS REMOVED: h_23, h_24 are calculated, not defaults
        // Climate data populated by calculation engines from ClimateValues.js
        // NOTE: l_23 (Seasonal outdoor RH%) will be added in future phase
      };
      console.log(
        "S03: Reference defaults set from field definitions - single source of truth",
      );
    },
    saveState: function () {
      try {
        localStorage.setItem("S03_REFERENCE_STATE", JSON.stringify(this.state));
      } catch (e) {
        console.log("S03 REFERENCE STATE: Error saving", e);
      }
    },
    setValue: function (fieldId, value, source = "user") {
      this.state[fieldId] = value;
      this.notifyListeners(fieldId, value);
      this.saveState();
      // console.log(`S03 REFERENCE setValue: ${fieldId} = ${value} (${source})`);
    },
    getValue: function (fieldId) {
      return this.state[fieldId];
    },
    addListener: function (fieldId, callback) {
      if (!this.listeners[fieldId]) {
        this.listeners[fieldId] = [];
      }
      this.listeners[fieldId].push(callback);
    },
    notifyListeners: function (fieldId, value) {
      if (this.listeners[fieldId]) {
        this.listeners[fieldId].forEach((callback) => callback(value));
      }
    },
    syncFromGlobalState: function (fieldIds = ["d_19", "h_19", "i_21"]) {
      fieldIds.forEach((fieldId) => {
        const refFieldId = `ref_${fieldId}`;
        const globalValue = window.TEUI.StateManager.getValue(refFieldId);
        if (globalValue !== null && globalValue !== undefined) {
          this.setValue(fieldId, globalValue, "imported");
          console.log(
            `S03 ReferenceState: Synced ${fieldId} = ${globalValue} from global StateManager (${refFieldId})`,
          );
        }
      });
    },
  };

  // PATTERN 2: The ModeManager Facade (Standardized Pattern A)
  const ModeManager = {
    currentMode: "target",
    initialize: function () {
      TargetState.initialize();
      ReferenceState.initialize();
      // console.log("S03 MODE MANAGER: Both states initialized");
    },
    switchMode: function (mode) {
      if (
        this.currentMode === mode ||
        (mode !== "target" && mode !== "reference")
      )
        return;
      this.currentMode = mode;
      // console.log(`S03: Switched to ${mode.toUpperCase()} mode`);

      this.refreshUI();
      this.updateCalculatedDisplayValues();

      // ✅ CRITICAL FIX: Update critical occupancy flag when mode changes
      updateCriticalOccupancyFlag();
    },
    resetState: function () {
      console.log(
        "S03: Resetting state and clearing localStorage for Section 3.",
      );
      TargetState.setDefaults();
      TargetState.saveState();
      ReferenceState.setDefaults(); // This will reload from current d_13 selection
      ReferenceState.saveState();
      console.log("S03: States have been reset to defaults.");

      // After resetting, refresh the UI and recalculate.
      this.refreshUI();
      calculateAll();
    },
    getCurrentState: function () {
      return this.currentMode === "target" ? TargetState : ReferenceState;
    },
    getValue: function (fieldId) {
      return this.getCurrentState().getValue(fieldId);
    },
    setValue: function (fieldId, value, source = "user") {
      this.getCurrentState().setValue(fieldId, value, source);

      // BRIDGE: For backward compatibility, sync Target changes to global StateManager.
      if (this.currentMode === "target") {
        window.TEUI.StateManager.setValue(fieldId, value, "user-modified");
      } else if (this.currentMode === "reference") {
        window.TEUI.StateManager.setValue(
          `ref_${fieldId}`,
          value,
          "user-modified",
        );
      }
    },
    refreshUI: function () {
      const sectionElement = document.getElementById("climateCalculations");
      if (!sectionElement) return;

      const currentState = this.getCurrentState();

      // Update province dropdown
      const provinceSelect = sectionElement.querySelector(
        '[data-dropdown-id="dd_d_19"]',
      );
      if (provinceSelect && currentState.getValue("d_19")) {
        provinceSelect.value = currentState.getValue("d_19");
        // Trigger city dropdown update
        handleProvinceChange({ target: provinceSelect });
      }

      // Update city dropdown
      const citySelect = sectionElement.querySelector(
        '[data-dropdown-id="dd_h_19"]',
      );
      if (citySelect && currentState.getValue("h_19")) {
        citySelect.value = currentState.getValue("h_19");
      }

      // Update timeframe dropdown
      const timeframeSelect = sectionElement.querySelector(
        '[data-dropdown-id="dd_h_20"]',
      );
      if (timeframeSelect && currentState.getValue("h_20")) {
        timeframeSelect.value = currentState.getValue("h_20");
      }

      // Update capacitance dropdown - CRITICAL for GFCDD calculation
      const capacitanceSelect = sectionElement.querySelector(
        '[data-dropdown-id="dd_h_21"]',
      );
      const capacitanceValue = currentState.getValue("h_21") || "Capacitance";
      if (capacitanceSelect) {
        capacitanceSelect.value = capacitanceValue;
        // console.log(`S03: Updated capacitance dropdown to "${capacitanceValue}" in ${this.currentMode} mode`);
      }

      // CRITICAL: Update percentage slider from isolated state (FieldManager structure)
      const percentageSlider = sectionElement.querySelector(
        'input.form-range[data-field-id="i_21"]',
      );
      const percentageValue = currentState.getValue("i_21");
      if (
        percentageSlider &&
        percentageValue !== undefined &&
        percentageValue !== null
      ) {
        percentageSlider.value = percentageValue;
        // Update percentage display - FieldManager creates .slider-value as sibling
        const sliderContainer = percentageSlider.parentElement;
        const display = sliderContainer?.querySelector(".slider-value");
        if (display) {
          display.textContent = percentageValue + "%";
        }
        // console.log(`S03: Updated slider to ${percentageValue}% in ${this.currentMode} mode`);
      }

      // Update all other editable fields from current state
      const editableFields = sectionElement.querySelectorAll("[data-field-id]");
      editableFields.forEach((field) => {
        const fieldId = field.getAttribute("data-field-id");
        const stateValue = currentState.getValue(fieldId);
        if (stateValue !== undefined && stateValue !== null) {
          if (field.isContentEditable) {
            field.textContent = stateValue;
          } else if (field.tagName === "SELECT") {
            field.value = stateValue;
          } else if (field.tagName === "SPAN") {
            field.textContent = stateValue;
          }
        }
      });

      // ✅ PHASE 3: Climate data now handled by calculation engines
      // No need to call updateWeatherData() - calculateAll() handles it

      // console.log(`S03: UI refreshed for ${this.currentMode} mode`);
    },

    /**
     * ✅ NEW: Update calculated fields display based on current mode
     * This updates DOM elements to show calculated values from StateManager
     */
    updateCalculatedDisplayValues: function () {
      const calculatedFields = [
        "j_19",
        "d_20",
        "d_21",
        "d_22",
        "h_22",
        "d_23",
        "e_23",
        "h_23",
        "i_23",
        "m_23",
        "d_24",
        "e_24",
        "h_24",
        "i_24",
        "m_24",
      ];

      calculatedFields.forEach((fieldId) => {
        const element = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (element) {
          let valueToDisplay;
          if (this.currentMode === "reference") {
            // Reference mode: Read ONLY ref_ prefixed values.
            valueToDisplay = window.TEUI.StateManager.getValue(
              `ref_${fieldId}`,
            );
          } else {
            valueToDisplay = window.TEUI.StateManager.getValue(fieldId);
          }

          // If a value isn't found in the correct state, use a safe default. NEVER fall back.
          if (valueToDisplay === null || valueToDisplay === undefined) {
            valueToDisplay = "0.00";
          }

          if (valueToDisplay !== null && valueToDisplay !== undefined) {
            const numericValue = window.TEUI.parseNumeric(valueToDisplay, NaN);
            let formattedValue = valueToDisplay;
            if (!isNaN(numericValue)) {
              let formatType = "number-2dp";
              if (
                [
                  "d_20",
                  "d_21",
                  "d_22",
                  "h_22",
                  "d_23",
                  "h_23",
                  "d_24",
                  "h_24",
                  "l_24",
                ].includes(fieldId)
              ) {
                formatType = "integer";
              } else if (["e_23", "i_23", "e_24", "i_24"].includes(fieldId)) {
                formatType = "integer-nocomma";
              } else if (fieldId === "j_19") {
                formatType = "number-1dp";
              }
              formattedValue = window.TEUI.formatNumber(
                numericValue,
                formatType,
              );
            }
            element.textContent = formattedValue;
          }
        }
      });
    },
  };

  // Expose globally for cross-section communication
  window.TEUI.sect03 = window.TEUI.sect03 || {};
  window.TEUI.sect03.ModeManager = ModeManager;

  // Compatibility alias for existing code
  const DualState = ModeManager;

  //==========================================================================
  // HELPER FUNCTIONS (Refactored for Self-Contained State Module)
  //==========================================================================

  function getNumericValue(fieldId) {
    // For values INTERNAL to this section
    const rawValue = ModeManager.getValue(fieldId);
    return window.TEUI.parseNumeric(rawValue) || 0;
  }

  function getGlobalNumericValue(fieldId) {
    // For values EXTERNAL to this section (from global StateManager)
    const rawValue = window.TEUI?.StateManager?.getValue(fieldId);
    return window.TEUI.parseNumeric(rawValue) || 0;
  }

  function getGlobalStringValue(fieldId) {
    // For string values EXTERNAL to this section (from global StateManager)
    const rawValue = window.TEUI?.StateManager?.getValue(fieldId);
    return rawValue ? rawValue.toString() : "";
  }

  /**
   * ✅ PHASE 2: Mode-aware external dependency reader for Target/Reference pairs
   * Reads the correct state value based on current calculation mode
   */
  function getModeAwareGlobalValue(fieldId) {
    if (!window.TEUI?.StateManager) return "";

    if (ModeManager.currentMode === "reference") {
      // Reference mode: Read ONLY ref_ prefixed values for perfect state isolation.
      const refValue = window.TEUI.StateManager.getValue(`ref_${fieldId}`);
      // If ref_ value doesn't exist, return empty or a safe default. NEVER fall back to the Target value.
      return refValue ? refValue.toString() : "";
    } else {
      // Target mode: Read unprefixed values directly
      const targetValue = window.TEUI.StateManager.getValue(fieldId);
      return targetValue ? targetValue.toString() : "";
    }
  }

  function getFieldValue(fieldId) {
    const stateValue = ModeManager.getValue(fieldId);
    if (stateValue != null) return stateValue;

    // Fallback for non-state values (e.g., legacy DOM elements)
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    return element ? (element.value ?? element.textContent?.trim()) : null;
  }

  /**
   * Sets field value using simplified dual-state (ModeManager handles internal state)
   * @param {string} fieldId
   * @param {*} value
   * @param {string} [source='calculated']
   */
  function setFieldValue(fieldId, value, source = "calculated") {
    const rawValue =
      value !== null && value !== undefined ? value.toString() : null;

    // Set raw value in ModeManager (automatically handles current mode)
    ModeManager.setValue(fieldId, rawValue, source);

    // ❌ ANTI-PATTERN REMOVED: Direct DOM write from a calculation helper has been eliminated.
    // The `ModeManager.updateCalculatedDisplayValues()` function is now solely responsible
    // for reading from StateManager and updating the UI, ensuring a single source of truth.
  }

  //==========================================================================
  // CLIMATE DATA SERVICE - Direct ClimateValues.js Access
  //==========================================================================

  /**
   * ClimateDataService - Direct access to ClimateValues.js data
   * Copied verbatim from 4012 S03 Unified Toggle Test.html
   */
  const ClimateDataService = {
    ensureAvailable: function (callback, maxRetries = 10) {
      let attempts = 0;

      const checkData = () => {
        attempts++;
        console.log(
          `S03: Checking climate data availability (attempt ${attempts}/${maxRetries})`,
        );

        if (
          window.TEUI?.ClimateData &&
          Object.keys(window.TEUI.ClimateData).length > 0
        ) {
          console.log(
            "S03: Climate data available",
            Object.keys(window.TEUI.ClimateData),
          );
          callback(window.TEUI.ClimateData);
          return;
        }

        if (attempts >= maxRetries) {
          console.error(
            "S03: Error - Climate data not available after max retries",
          );
          return;
        }

        const delay = Math.min(100 * Math.pow(2, attempts), 2000);
        console.log(`S03: Will retry in ${delay}ms`);
        setTimeout(checkData, delay);
      };

      checkData();
    },

    getProvinces: function () {
      if (!window.TEUI?.ClimateData) return [];
      return Object.keys(window.TEUI.ClimateData).sort();
    },

    getCitiesForProvince: function (province) {
      if (!window.TEUI?.ClimateData || !window.TEUI.ClimateData[province])
        return [];
      return Object.keys(window.TEUI.ClimateData[province]).sort();
    },

    getCityData: function (province, city) {
      if (
        !window.TEUI?.ClimateData ||
        !window.TEUI.ClimateData[province] ||
        !window.TEUI.ClimateData[province][city]
      ) {
        return null;
      }
      return window.TEUI.ClimateData[province][city];
    },

    getProvinceFullName: function (abbr) {
      const provinceNames = {
        AB: "Alberta",
        BC: "British Columbia",
        MB: "Manitoba",
        NB: "New Brunswick",
        NL: "Newfoundland and Labrador",
        NS: "Nova Scotia",
        NT: "Northwest Territories",
        NU: "Nunavut",
        ON: "Ontario",
        PE: "Prince Edward Island",
        QC: "Québec",
        SK: "Saskatchewan",
        YT: "Yukon",
      };
      return provinceNames[abbr] || abbr;
    },
  };

  //==========================================================================
  // CLIMATE DATA PROCESSING - Pure Functions for Dual-State Architecture
  //==========================================================================

  /**
   * ✅ PHASE 1: Mode-aware climate data function for dual-state architecture
   * Fetches and calculates climate data based on the provided state object and calculation mode.
   * Now includes critical occupancy logic for proper 1% vs 2.5% temperature selection.
   * @param {object} stateObject - Either TargetState or ReferenceState
   * @param {string} calculationMode - "target" or "reference" to determine occupancy source
   * @returns {object} An object containing all calculated climate values
   */
  function getClimateDataForState(stateObject, calculationMode = "target") {
    const province = stateObject.getValue("d_19") || "ON";
    const city = stateObject.getValue("h_19") || "Alexandria";
    const timeframe = stateObject.getValue("h_20") || "Present";

    // ✅ CRITICAL FIX: Get occupancy type based on calculation mode for proper temperature selection
    let occupancyType = "";
    if (window.TEUI?.StateManager) {
      if (calculationMode === "reference") {
        // Reference calculations: Read ref_d_12 for Reference occupancy
        occupancyType = window.TEUI.StateManager.getValue("ref_d_12") || "";
        // console.log(`[S03] 🔵 REF MODE: Using occupancy "${occupancyType}" from ref_d_12`);
      } else {
        // Target calculations: Read d_12 for Target occupancy
        occupancyType = window.TEUI.StateManager.getValue("d_12") || "";
        // console.log(`[S03] 🎯 TGT MODE: Using occupancy "${occupancyType}" from d_12`);
      }
    }

    const isCritical = occupancyType.includes("Care");
    // console.log(`[S03] Getting climate data for: ${city}, ${province} (${timeframe}) - Critical: ${isCritical} (${calculationMode} mode)`);

    const cityData = ClimateDataService.getCityData(province, city);

    if (!cityData) {
      console.warn(`S03: No climate data for ${city}, ${province}`);
      return {
        d_20: "N/A",
        d_21: "N/A",
        j_19: "6.0",
        d_23: isCritical ? "-26" : "-24", // Use fallback appropriate for occupancy
        d_24: "34",
        l_22: "80",
      };
    }

    // Choose values based on timeframe
    const hdd =
      timeframe === "Future" ? cityData.HDD18_2021_2050 : cityData.HDD18;
    const cdd =
      timeframe === "Future" ? cityData.CDD24_2021_2050 : cityData.CDD24;

    // ✅ CRITICAL FIX: Select January temperature based on critical occupancy
    // Use January_1 (1%) for critical occupancies (Care), January_2_5 (2.5%) for others
    const janTempKey = isCritical ? "January_1" : "January_2_5";
    const selectedJanTemp =
      cityData[janTempKey] ||
      cityData["January_2_5"] ||
      (isCritical ? "-26" : "-24");

    // console.log(`[S03] ${calculationMode.toUpperCase()} TEMP SELECTION: ${janTempKey} = ${selectedJanTemp} (Critical: ${isCritical})`);

    const climateValues = {
      d_20: hdd !== null && hdd !== undefined && hdd !== 666 ? hdd : "N/A",
      d_21: cdd !== null && cdd !== undefined && cdd !== 666 ? cdd : "N/A",
      j_19: determineClimateZone(hdd),
      d_23: selectedJanTemp, // ✅ Now uses occupancy-aware temperature selection
      d_24: cityData.July_2_5_Tdb || "34",
      l_22: cityData["Elev ASL (m)"] || "80",
    };

    // console.log(`[S03] Climate values for ${city} (${calculationMode}):`, climateValues);
    return climateValues;
  }

  //==========================================================================
  // PART 1: CONSOLIDATED FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  // Define rows with integrated field definitions for a fully consolidated approach
  const sectionRows = {
    // Unit Subheader Row - MUST BE FIRST for proper rendering order
    header: {
      id: "03-ID",
      rowId: "03-ID",
      label: "Climate Units",
      cells: {
        c: { content: "C", classes: ["section-subheader"] },
        d: { content: "ºC", classes: ["section-subheader"] },
        e: { content: "ºF", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "G", classes: ["section-subheader"] },
        h: { content: "ºC", classes: ["section-subheader"] },
        i: { content: "ºF", classes: ["section-subheader"] },
        j: { content: "J", classes: ["section-subheader"] },
        k: { content: "K", classes: ["section-subheader"] },
        l: { content: "L", classes: ["section-subheader"] },
        m: { content: "M", classes: ["section-subheader"] },
        n: { content: "N", classes: ["section-subheader"] },
      },
    },

    // Row 19: Province, City, Climate Zone
    19: {
      id: "L.1.1",
      rowId: "L.1.1",
      label: "Province",
      cells: {
        c: { content: "Province", type: "label" },
        d: {
          fieldId: "d_19",
          type: "dropdown",
          dropdownId: "dd_d_19",
          value: "ON",
          section: "climateCalculations",
          tooltip: true, // Select a Province
          options: [{ value: "", name: "Select Province" }],
          getOptions: function () {
            const provinces = ClimateDataService.getProvinces();
            return provinces.map((province) => ({
              value: province,
              name: ClimateDataService.getProvinceFullName(province),
            }));
          },
        },
        f: { content: "L.1.2", classes: ["label-prefix"] },
        g: { content: "City", classes: ["label-main"] },
        h: {
          fieldId: "h_19",
          type: "dropdown",
          dropdownId: "dd_h_19",
          value: "Alexandria",
          section: "climateCalculations",
          tooltip: true, // Municpality
          dependencies: ["d_19"],
          options: [{ value: "", name: "Select City" }],
          getOptions: function (provinceValue) {
            if (!provinceValue) {
              provinceValue =
                DualState.getValue("d_19") ||
                document.querySelector('[data-dropdown-id="dd_d_19"]')?.value;
            }

            const cities =
              ClimateDataService.getCitiesForProvince(provinceValue);
            return cities.map((city) => ({
              value: city,
              name: city,
            }));
          },
        },
        i: { content: "Climate Zone" },
        j: {
          fieldId: "j_19",
          type: "derived",
          value: "6.0",
          section: "climateCalculations",
          dependencies: ["d_20"],
        },
        k: { content: "L.3.3", classes: ["label-prefix"] },
        l: { content: "Days Cooling", classes: ["label-main"] },
        m: {
          fieldId: "m_19",
          type: "editable",
          value: "120",
          section: "climateCalculations",
          tooltip: true, // Cooling Days are Increasing
          classes: ["user-input", "editable"],
        },
      },
    },

    // Row 20: Heating Degree Days
    20: {
      id: "L.2.1",
      rowId: "L.2.1",
      label: "Heating Degree Days (HDD)",
      cells: {
        c: { content: "Heating Degree Days (HDD)", type: "label" },
        d: {
          fieldId: "d_20",
          type: "derived",
          value: "4600",
          section: "climateCalculations",
          dependencies: ["d_19", "h_19"],
        },
        f: { content: "L.2.2", classes: ["label-prefix"] },
        g: { content: "Current or Future Values", classes: ["label-main"] },
        h: {
          fieldId: "h_20",
          type: "dropdown",
          dropdownId: "dd_h_20",
          value: "Present",
          section: "climateCalculations",
          tooltip: true, // Weather Data Range
          options: [
            { value: "Present", name: "Present (1991-2020)" },
            { value: "Future", name: "Future (2021-2050)" },
          ],
        },
        // NEW: Summer Night Temperature field (l_20) - Cooling Refactor Phase 5.1.1
        // Replaces: j_20 "HDD Reference Lookup" and k "HDD - Energy Star"
        // TODO: Add tooltips with links to HDD/CDD reference resources later
        j: { content: "L.2.0", classes: ["label-prefix"] },
        k: { content: "Summer Night ºC", classes: ["label-main"] },
        l: {
          fieldId: "l_20",
          type: "editable",
          value: "20.43", // Default: Alexandria, ON summer night temp
          section: "climateCalculations",
          tooltip: true, // Night-time outdoor temp (cooling season mean)
          classes: ["user-input", "editable"],
          // NOTE: Currently user-editable for testing. Will be locked in future (calculated from climate data)
        },
      },
    },

    // Row 21: Cooling Degree Days
    21: {
      id: "L.2.3",
      rowId: "L.2.3",
      label: "Cooling Degree Days (CDD)",
      cells: {
        c: { content: "Cooling Degree Days (CDD)", type: "label" },
        d: {
          fieldId: "d_21",
          type: "derived",
          value: "196",
          section: "climateCalculations",
          dependencies: ["d_19", "h_19"],
        },
        f: { content: "G.4.2", classes: ["label-prefix"] },
        g: { content: "Capacitance", classes: ["label-main"] },
        h: {
          fieldId: "h_21",
          type: "dropdown",
          dropdownId: "dd_h_21",
          value: "Capacitance",
          section: "climateCalculations",
          tooltip: true, // Select Calculation Method
          options: [
            { value: "Static", name: "Static" },
            { value: "Capacitance", name: "Capacitance" },
          ],
        },
        i: {
          fieldId: "i_21",
          type: "percentage",
          value: "50",
          min: 0,
          max: 100,
          step: 5,
          section: "climateCalculations",
          tooltip: true, // Capacitance Factor
          defaultValue: "50",
        },
        // NEW: Summer RH% field (l_21) - Cooling Refactor Phase 5.1.1
        // Replaces: j_21 "CDD Reference Lookup" and k "CDD - Energy Star"
        // TODO: Add tooltips with links to HDD/CDD reference resources later
        j: { content: "L.2.2", classes: ["label-prefix"] },
        k: { content: "Summer RH%", classes: ["label-main"] },
        l: {
          fieldId: "l_21",
          type: "editable",
          value: "55.85", // Default: Alexandria, ON cooling season mean RH at 15h00 LST
          section: "climateCalculations",
          tooltip: true, // Cooling season mean RH at 15h00 LST
          classes: ["user-input", "editable"],
          // NOTE: Currently user-editable for testing. Will be locked in future (calculated from climate data)
        },
      },
    },

    // Row 22: Ground Facing HDD, Ground Facing CDD, Elevation
    22: {
      id: "L.2.4",
      rowId: "L.2.4",
      label: "Ground Facing GF HDD",
      cells: {
        c: { content: "Ground Facing GF HDD", type: "label" },
        d: {
          fieldId: "d_22",
          type: "derived",
          value: "1960",
          section: "climateCalculations",
          dependencies: ["d_20"],
        },
        e: { content: "ºC•days", classes: ["unit-label"] },
        f: { content: "L.2.5", classes: ["label-prefix"] },
        g: { content: "GF CDD", classes: ["label-main"] },
        h: {
          fieldId: "h_22",
          type: "calculated",
          value: "-1680",
          section: "climateCalculations",
          dependencies: ["d_21"],
        },
        i: { content: "ºC•days", classes: ["unit-label"] },
        j: { content: "L.1.3", classes: ["label-prefix"] },
        k: { content: "Elevation (ASL)", classes: ["label-main"] },
        l: {
          fieldId: "l_22",
          type: "editable",
          value: "80",
          section: "climateCalculations",
          classes: ["user-input", "editable"],
        },
        m: { content: "m", classes: ["unit-label"] },
      },
    },

    // Row 23: Coldest Days, Heating Setpoint
    23: {
      id: "L.3.1",
      rowId: "L.3.1",
      label: "Coldest Days (Location Specific)",
      cells: {
        c: { content: "Coldest Days (Location Specific)", type: "label" },
        d: {
          fieldId: "d_23",
          type: "derived",
          value: "-24",
          section: "climateCalculations",
          dependencies: ["d_19", "h_19", "d_12"],
        },
        e: {
          fieldId: "e_23",
          type: "calculated",
          value: "-11",
          section: "climateCalculations",
          dependencies: ["d_23"],
        },
        f: { content: "B.1.2", classes: ["label-prefix"] },
        g: { content: "Tset Heating", classes: ["label-main"] },
        h: {
          fieldId: "h_23",
          type: "calculated",
          section: "climateCalculations",
          dependencies: ["d_12"],
        },
        i: {
          fieldId: "i_23",
          type: "calculated",
          value: "66",
          section: "climateCalculations",
          dependencies: ["h_23"],
        },
        m: {
          fieldId: "m_23",
          type: "calculated",
          value: "122%",
          section: "climateCalculations",
        },
      },
    },

    // Row 24: Hottest Days, Cooling Setpoint & Override
    24: {
      id: "L.3.2",
      rowId: "L.3.2",
      label: "Hottest Days (Location Specific)",
      cells: {
        c: { content: "Hottest Days (Location Specific)", type: "label" },
        d: {
          fieldId: "d_24",
          type: "derived",
          value: "34",
          section: "climateCalculations",
          dependencies: ["d_19", "h_19"],
        },
        e: {
          fieldId: "e_24",
          type: "calculated",
          value: "98",
          section: "climateCalculations",
          dependencies: ["d_24"],
        },
        f: { content: "B.1.3", classes: ["label-prefix"] },
        g: { content: "Tset Cooling", classes: ["label-main"] },
        h: {
          fieldId: "h_24",
          type: "calculated",
          section: "climateCalculations",
          dependencies: ["d_12"],
        },
        i: {
          fieldId: "i_24",
          type: "calculated",
          value: "78",
          section: "climateCalculations",
          dependencies: ["h_24", "l_24"],
        },
        j: { content: "B.1.4", classes: ["label-prefix"] },
        k: { content: "Cooling Override", classes: ["label-main"] },
        l: {
          fieldId: "l_24",
          type: "editable",
          value: "24",
          section: "climateCalculations",
          classes: ["user-input", "editable"],
        },
        m: {
          fieldId: "m_24",
          type: "calculated",
          value: "108%",
          section: "climateCalculations",
          dependencies: ["h_24", "l_24"],
        },
      },
    },
  };

  //==========================================================================
  // PART 2: ACCESSOR METHODS TO EXTRACT FIELDS AND LAYOUT
  //==========================================================================

  /**
   * Extract field definitions from the integrated layout
   * This separates the fields from the layout for compatibility with existing code
   */
  function getFields() {
    const fields = {};

    // Extract field definitions from layout rows
    Object.values(sectionRows).forEach((row) => {
      if (!row.cells) return;

      Object.values(row.cells).forEach((cell) => {
        if (cell.fieldId && cell.type) {
          // Create a field definition with relevant properties
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.content || row.label,
            defaultValue: cell.value || "",
            section: cell.section || "climateCalculations",
          };

          // Copy additional field properties if they exist
          if (cell.dropdownId)
            fields[cell.fieldId].dropdownId = cell.dropdownId;
          if (cell.options) fields[cell.fieldId].options = cell.options;
          if (cell.getOptions)
            fields[cell.fieldId].getOptions = cell.getOptions;
          if (cell.dependencies)
            fields[cell.fieldId].dependencies = cell.dependencies;
          if (cell.min !== undefined) fields[cell.fieldId].min = cell.min;
          if (cell.max !== undefined) fields[cell.fieldId].max = cell.max;
          if (cell.step !== undefined) fields[cell.fieldId].step = cell.step;
          if (cell.classes) fields[cell.fieldId].classes = cell.classes;
        }
      });
    });

    return fields;
  }

  /**
   * Extract dropdown options from the integrated layout
   */
  function getDropdownOptions() {
    const options = {};

    // Extract dropdown options from cells with dropdownId
    Object.values(sectionRows).forEach((row) => {
      if (!row.cells) return;

      Object.values(row.cells).forEach((cell) => {
        if (cell.dropdownId && cell.options) {
          options[cell.dropdownId] = cell.options;
        }
      });
    });

    return options;
  }

  /**
   * Generate layout from integrated row definitions
   * FIXED: Now properly places the header row first
   */
  function getLayout() {
    // Create array with rows in the correct order
    const layoutRows = [];

    // STEP 1: First add the header row if it exists
    if (sectionRows["header"]) {
      layoutRows.push(createLayoutRow(sectionRows["header"]));
    }

    // STEP 2: Add all remaining rows in the proper order (excluding the header)
    Object.entries(sectionRows).forEach(([key, row]) => {
      if (key !== "header") {
        layoutRows.push(createLayoutRow(row));
      }
    });

    return { rows: layoutRows };
  }

  /**
   * Helper function to convert a row definition to the layout format expected by the renderer
   */
  function createLayoutRow(row) {
    // Create standard row structure
    const rowDef = {
      id: row.id,
      cells: [
        {}, // Empty column A
        {}, // ID column B (auto-populated)
      ],
    };

    // Add cells C through N based on the row definition
    const columns = [
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
    ];

    // For each column, add the cell definition if it exists in the row
    columns.forEach((col) => {
      if (row.cells && row.cells[col]) {
        // Create a simplified cell definition for the renderer
        // without the extra field properties
        const cell = { ...row.cells[col] };

        // Special handling for column C to ensure row labels work
        if (col === "c" && cell.type === "label" && cell.content) {
          // When we have a cell in column C with type "label", ensure it has a label property
          // which the renderer needs to display properly
          cell.label = cell.content;
        }

        // Remove field-specific properties that aren't needed for rendering
        delete cell.getOptions;
        delete cell.section;
        delete cell.dependencies;

        rowDef.cells.push(cell);
      } else {
        // Add empty cell if not defined
        // Special handling for column C - use row's label if column C is missing
        if (col === "c" && !row.cells?.c && row.label) {
          // If column C is missing but we have a row label, use that
          rowDef.cells.push({ label: row.label });
        } else {
          // Otherwise add empty cell
          rowDef.cells.push({});
        }
      }
    });

    return rowDef;
  }

  /**
   * ✅ PHASE 3: Retrieves a field's default value from the sectionRows definition.
   * This is the single source of truth for non-climate default values.
   * Climate data should come from ClimateValues.js, not hardcoded defaults.
   * @param {string} fieldId The ID of the field (e.g., "d_19")
   * @returns {string|null} The default value or null if not found.
   */
  function getFieldDefault(fieldId) {
    for (const row of Object.values(sectionRows)) {
      if (row.cells) {
        for (const cell of Object.values(row.cells)) {
          if (cell.fieldId === fieldId && cell.value !== undefined) {
            return cell.value;
          }
        }
      }
    }
    return null;
  }

  //==========================================================================
  // EVENT HANDLING AND CALCULATIONS
  //==========================================================================

  // All event handling and calculation functions remain unchanged

  /**
   * Helper: Get element by multiple possible selectors
   */
  function getElement(selectors) {
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  /**
   * Handle province selection change - ✅ PHASE 3: Simplified for dual-state architecture
   */
  function handleProvinceChange(e) {
    const provinceValue = e?.target?.value;
    if (!provinceValue) return;

    console.log("Section03: Province selected:", provinceValue);

    // Update state using ModeManager (handles mode-aware StateManager sync)
    ModeManager.setValue("d_19", provinceValue, "user-modified");

    // Update city dropdown for this province (UI only)
    updateCityDropdown(provinceValue);

    // Note: calculateAll() will be called by the city dropdown's auto-selection
    // If city doesn't auto-select, we would add calculateAll() here
  }

  /**
   * Update city dropdown based on selected province - Using ClimateDataService
   */
  function updateCityDropdown(provinceValue) {
    const cityDropdown = getElement(['[data-dropdown-id="dd_h_19"]']);
    if (!cityDropdown) return;

    // Clear existing options
    cityDropdown.innerHTML = '<option value="">Select City</option>';

    if (!provinceValue) {
      cityDropdown.disabled = true;
      return;
    }

    // Get cities from ClimateDataService
    const cities = ClimateDataService.getCitiesForProvince(provinceValue);

    if (cities.length === 0) {
      console.log("No cities found for province:", provinceValue);
      cityDropdown.disabled = true;
      return;
    }

    // Add city options
    cities.forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      cityDropdown.appendChild(option);
    });

    cityDropdown.disabled = false;

    // Auto-select city from current state if it exists in this province
    const currentCity = DualState.getValue("h_19");
    if (currentCity && cities.includes(currentCity)) {
      cityDropdown.value = currentCity;
      DualState.setValue("h_19", currentCity, "init");
    } else if (provinceValue === "ON" && cities.includes("Alexandria")) {
      // Default to Alexandria for Ontario
      cityDropdown.value = "Alexandria";
      DualState.setValue("h_19", "Alexandria", "init");
    } else if (cities.length > 0) {
      // Default to first city
      cityDropdown.value = cities[0];
      DualState.setValue("h_19", cities[0], "init");
    }

    console.log(
      "City dropdown updated for",
      provinceValue,
      "- selected:",
      cityDropdown.value,
    );
  }

  /**
   * ❌ PHASE 4: DEPRECATED - This function has been replaced by climate data integration
   * in calculateTargetModel() and calculateReferenceModel() for perfect state isolation.
   * Keeping commented for reference during testing phase.
   */
  /*
  function updateWeatherData() {
    // Get province and city values from DualState (automatically uses current mode)
    const provinceValue =
      DualState.getValue("d_19") ||
      getElement(['[data-dropdown-id="dd_d_19"]'])?.value;
    const cityValue =
      DualState.getValue("h_19") ||
      getElement(['[data-dropdown-id="dd_h_19"]'])?.value;
    const timeframe =
      DualState.getValue("h_20") ||
      getElement(['[data-dropdown-id="dd_h_20"]'])?.value ||
      "Present";

    if (!provinceValue || !cityValue) {
      console.log("S03: Cannot update weather data - missing province or city");
      return;
    }

    // Get city data using ClimateDataService
    const cityData = ClimateDataService.getCityData(provinceValue, cityValue);

    if (!cityData) {
      console.warn(
        `S03: No climate data found for ${cityValue}, ${provinceValue}`,
      );
      return;
    }

    // Update HDD value - choosing based on timeframe
    const hddValue =
      timeframe === "Future" ? cityData.HDD18_2021_2050 : cityData.HDD18;
    if (hddValue !== null && hddValue !== undefined && hddValue !== 666) {
      setFieldValue("d_20", hddValue, "derived");
    } else {
      setFieldValue("d_20", "N/A", "derived");
    }

    // Update CDD value - choosing based on timeframe
    const cddValue =
      timeframe === "Future" ? cityData.CDD24_2021_2050 : cityData.CDD24;
    if (cddValue !== null && cddValue !== undefined && cddValue !== 666) {
      setFieldValue("d_21", cddValue, "derived");
    } else {
      // Check if fallback to present value is possible
      if (
        timeframe === "Future" &&
        cityData.CDD24 !== null &&
        cityData.CDD24 !== undefined &&
        cityData.CDD24 !== 666
      ) {
        console.warn(
          `S03: Future CDD not available for ${cityValue}, ${provinceValue}. Using present value as fallback.`,
        );
        setFieldValue("d_21", cityData.CDD24, "derived");
      } else {
        setFieldValue("d_21", "N/A", "derived");
      }
    }

    // Update other climate values from cityData
    const climateUpdates = [
      { fieldId: "d_23", value: cityData.January_2_5, label: "Coldest Days" },
      { fieldId: "d_24", value: cityData.July_2_5_Tdb, label: "Hottest Days" },
      { fieldId: "l_22", value: cityData["Elev ASL (m)"], label: "Elevation" },
    ];

    climateUpdates.forEach((update) => {
      if (
        update.value !== null &&
        update.value !== undefined &&
        update.value !== 666
      ) {
        setFieldValue(update.fieldId, update.value, "derived");
      } else {
        setFieldValue(update.fieldId, "N/A", "derived");
      }
    });

    // Update climate zone based on HDD
    const climateZone = determineClimateZone(hddValue);
    setFieldValue("j_19", climateZone, "calculated");

    // Run all calculations after weather data update
    calculateAll();
    // ✅ PHASE 1: Add missing DOM update after calculations
    ModeManager.updateCalculatedDisplayValues();

    console.log(
      `S03: Weather data updated for ${cityValue}, ${provinceValue} (${timeframe})`,
    );
  }
  */ // End of deprecated updateWeatherData() function

  /**
   * Determine climate zone based on HDD
   */
  function determineClimateZone(hdd) {
    // Excel Formula: =IF(D20<3000, 4, IF(D20<4000, 5, IF(D20<5000, 6, IF(D20<6000, 7.1, IF(D20<7000, 7.2, 8))))) )
    if (hdd === null || hdd === undefined || hdd === "") return "6.0"; // Default if HDD is missing

    const numericHdd = parseFloat(hdd);
    if (isNaN(numericHdd)) return "6.0"; // Default if HDD is not a number

    if (numericHdd < 3000) return "4.0";
    if (numericHdd < 4000) return "5.0";
    if (numericHdd < 5000) return "6.0";
    if (numericHdd < 6000) return "7.1"; // Corrected from 7.0
    if (numericHdd < 7000) return "7.2"; // Added missing check
    return "8.0"; // Correct: returns 8.0 only if HDD >= 7000
  }

  /**
   * Display weather data in modal - Using ClimateDataService
   */
  function showWeatherData() {
    const provinceValue =
      DualState.getValue("d_19") ||
      getElement(['[data-dropdown-id="dd_d_19"]'])?.value;
    const cityValue =
      DualState.getValue("h_19") ||
      getElement(['[data-dropdown-id="dd_h_19"]'])?.value;

    if (!provinceValue || !cityValue) {
      alert("Please select a province and city first.");
      return;
    }

    // Get city data using ClimateDataService
    const cityData = ClimateDataService.getCityData(provinceValue, cityValue);

    if (!cityData) {
      alert(`City data not found for ${cityValue}, ${provinceValue}`);
      return;
    }

    // Field mapping with meaningful names and units
    const fieldMapping = {
      // Basic Information
      Location: { name: "Location", unit: "", category: "Basic" },
      "Elev ASL (m)": {
        name: "Elevation Above Sea Level",
        unit: "m",
        category: "Basic",
      },

      // Temperature Data
      January_2_5: {
        name: "January Design Temperature (2.5%)",
        unit: "°C",
        category: "Temperature",
      },
      January_1: {
        name: "January Design Temperature (1%)",
        unit: "°C",
        category: "Temperature",
      },
      July_2_5_Tdb: {
        name: "July Dry Bulb Temperature (2.5%)",
        unit: "°C",
        category: "Temperature",
      },
      July_2_5_Twb: {
        name: "July Wet Bulb Temperature (2.5%)",
        unit: "°C",
        category: "Temperature",
      },
      Future_July_2_5_Tdb: {
        name: "Future July Dry Bulb (2021-2050)",
        unit: "°C",
        category: "Temperature",
      },
      Future_July_2_5_Twb: {
        name: "Future July Wet Bulb (2021-2050)",
        unit: "°C",
        category: "Temperature",
      },

      // Degree Days
      HDD18: {
        name: "Heating Degree Days (Base 18°C)",
        unit: "°C·days",
        category: "Degree Days",
      },
      HDD15: {
        name: "Heating Degree Days (Base 15°C)",
        unit: "°C·days",
        category: "Degree Days",
      },
      HDD18_2021_2050: {
        name: "Future HDD (2021-2050)",
        unit: "°C·days",
        category: "Degree Days",
      },
      CDD24: {
        name: "Cooling Degree Days (Base 24°C)",
        unit: "°C·days",
        category: "Degree Days",
      },
      CDD24_2021_2050: {
        name: "Future CDD (2021-2050)",
        unit: "°C·days",
        category: "Degree Days",
      },

      // Extreme Temperature
      Over_30Tdb_2021_2050: {
        name: "Days Over 30°C (2021-2050)",
        unit: "days",
        category: "Extreme",
      },
      Extreme_Hot_Tdb_1991_2020: {
        name: "Extreme Maximum Temperature",
        unit: "°C",
        category: "Extreme",
      },

      // Precipitation
      Rain_15_min_mm: {
        name: "15-Minute Rainfall",
        unit: "mm",
        category: "Precipitation",
      },
      Rain_15_min_mm_New: {
        name: "15-Minute Rainfall (Updated)",
        unit: "mm",
        category: "Precipitation",
      },
      "Rain_1_day_1/50mm": {
        name: "One Day Rainfall (1-in-50 year)",
        unit: "mm",
        category: "Precipitation",
      },
      "Rain_1_day_1/50mm_New": {
        name: "One Day Rainfall (Updated)",
        unit: "mm",
        category: "Precipitation",
      },
      Rain_Annual_mm: {
        name: "Annual Rainfall",
        unit: "mm",
        category: "Precipitation",
      },
      Rain_Annual_mm_New: {
        name: "Annual Rainfall (Updated)",
        unit: "mm",
        category: "Precipitation",
      },
      Moisture_Index_New: {
        name: "Moisture Index",
        unit: "",
        category: "Precipitation",
      },
      Precip_Annual_mm: {
        name: "Annual Total Precipitation",
        unit: "mm",
        category: "Precipitation",
      },
      Precip_Annual_mm_New: {
        name: "Annual Precipitation (Updated)",
        unit: "mm",
        category: "Precipitation",
      },

      // Wind & Snow
      "Driving_Rain_Wind_Pa_1/5": {
        name: "Driving Rain Wind Pressure (1-in-5)",
        unit: "Pa",
        category: "Wind",
      },
      "Driving_Rain_Wind_Pa_1/5_New": {
        name: "Driving Rain Wind (Updated)",
        unit: "Pa",
        category: "Wind",
      },
      "Snow_kPa_1/50_Ss": {
        name: "Snow Load (1-in-50) Ss",
        unit: "kPa",
        category: "Snow",
      },
      "Snow_kPa_1/50_Sr": {
        name: "Snow Load (1-in-50) Sr",
        unit: "kPa",
        category: "Snow",
      },
      "Snow_kPa_1/1000_Ss": {
        name: "Snow Load (1-in-1000) Ss",
        unit: "kPa",
        category: "Snow",
      },
      "Snow_kPa_1/1000_Sr": {
        name: "Snow Load (1-in-1000) Sr",
        unit: "kPa",
        category: "Snow",
      },
      "Wind_Hourly_kPa_1/10": {
        name: "Hourly Wind Pressure (1-in-10)",
        unit: "kPa",
        category: "Wind",
      },
      "Wind_Hourly_kPa_1/10_New": {
        name: "Hourly Wind (Updated)",
        unit: "kPa",
        category: "Wind",
      },
      "Wind_Hourly_kPa_1/50": {
        name: "Hourly Wind Pressure (1-in-50)",
        unit: "kPa",
        category: "Wind",
      },
      "Wind_Hourly_kPa_1/50_New": {
        name: "Hourly Wind (1-in-50 Updated)",
        unit: "kPa",
        category: "Wind",
      },
      "Wind_Hourly_kPa_1/500_New": {
        name: "Hourly Wind (1-in-500)",
        unit: "kPa",
        category: "Wind",
      },

      // Seasonal Averages
      Winter_Tdb_Avg: {
        name: "Winter Average Temperature",
        unit: "°C",
        category: "Seasonal",
      },
      Winter_Windspeed_Avg: {
        name: "Winter Average Wind Speed",
        unit: "m/s",
        category: "Seasonal",
      },
      Summer_Tdb_Avg: {
        name: "Summer Average Temperature",
        unit: "°C",
        category: "Seasonal",
      },
      Summer_Twb_Avg: {
        name: "Summer Average Wet Bulb",
        unit: "°C",
        category: "Seasonal",
      },
      Summer_RH_1500_LST: {
        name: "Summer RH at 15:00",
        unit: "%",
        category: "Seasonal",
      },
    };

    // Set modal title and content
    const modalTitle = document.getElementById("weatherDataModalLabel");
    const modalContent = document.getElementById("weatherDataContent");

    if (modalTitle) {
      modalTitle.textContent = `Weather Data for ${cityValue}, ${ClimateDataService.getProvinceFullName(provinceValue)}`;
    }

    if (modalContent) {
      // Group data by category
      const categorizedData = {};
      Object.entries(cityData).forEach(([key, value]) => {
        const mapping = fieldMapping[key];
        if (mapping) {
          if (!categorizedData[mapping.category]) {
            categorizedData[mapping.category] = [];
          }
          categorizedData[mapping.category].push({ key, value, mapping });
        }
      });

      // Format the climate data with categories
      let formattedData = "";
      const categoryOrder = [
        "Basic",
        "Temperature",
        "Degree Days",
        "Extreme",
        "Precipitation",
        "Wind",
        "Snow",
        "Seasonal",
      ];

      categoryOrder.forEach((category) => {
        if (categorizedData[category] && categorizedData[category].length > 0) {
          formattedData += `<div style="margin-top: 16px; margin-bottom: 8px; font-weight: bold; color: #0066cc; border-bottom: 2px solid #0066cc;">${category}</div>`;

          categorizedData[category].forEach(({ key, value, mapping }) => {
            // Skip null values or 666 markers
            if (value === null || value === 666) {
              return;
            }

            const displayValue = mapping.unit
              ? `${value} ${mapping.unit}`
              : value;
            formattedData += `<div style="display: flex; padding: 6px 0; border-bottom: 1px solid #f0f0f0;">
              <div style="flex: 1.5; font-weight: 400; color: #333;">${mapping.name}</div>
              <div style="flex: 1; text-align: right; color: #666;">${displayValue}</div>
            </div>`;
          });
        }
      });

      modalContent.innerHTML = formattedData;
    }

    // Show modal
    const modal = document.getElementById("weatherDataModal");
    if (modal) new bootstrap.Modal(modal).show();
  }

  /**
   * Calculate Celsius to Fahrenheit conversions (Heating only now)
   */
  function calculateTemperatures() {
    // Coldest days conversion (d_23 -> e_23)
    const coldestC_str = window.TEUI.StateManager?.getValue("d_23");
    const coldestC = parseFloat(coldestC_str);
    if (!isNaN(coldestC)) {
      const coldestF = Math.round((coldestC * 9) / 5 + 32);
      setFieldValue("e_23", coldestF);
    }

    // Heating setpoint conversion (h_23 -> i_23)
    const heatingC_str = window.TEUI.StateManager?.getValue("h_23");
    const heatingC = parseFloat(heatingC_str);
    if (!isNaN(heatingC)) {
      const heatingF = Math.round((heatingC * 9) / 5 + 32);
      setFieldValue("i_23", heatingF);
    }

    // Hottest days conversion (d_24 -> e_24)
    const hottestC_str = window.TEUI.StateManager?.getValue("d_24");
    const hottestC = parseFloat(hottestC_str);
    if (!isNaN(hottestC)) {
      const hottestF = Math.round((hottestC * 9) / 5 + 32);
      setFieldValue("e_24", hottestF);
    }

    // Cooling setpoint conversion is now handled by updateCoolingDependents
  }

  /**
   * Calculate ground facing HDD and CDD
   * RESTORED from ARCHIVE/GOLD-STANDARDS/OBJECTIVE-4011GS-2025.06.21-SOLSTICE-BASELINE
   */
  function calculateGroundFacing() {
    // --- Ground facing HDD ---
    const heatingSetpoint = getNumericValue("h_23");
    const coolingDaysGFH = getNumericValue("m_19"); // Use a separate variable name to avoid confusion
    const heatingDays = 365 - coolingDaysGFH;

    // Formula: (TsetHeating - 10°C_ground) * HeatingDays
    const gfhdd = Math.round((heatingSetpoint - 10) * heatingDays);
    setFieldValue("d_22", gfhdd);

    // --- Ground facing CDD (h_22) --- ARCHIVE LOGIC RESTORED ---
    const capacitanceSetting = getFieldValue("h_21") || "Static"; // Default to Static if undefined
    const coolingSetpoint_h24 = getNumericValue("h_24"); // TsetCool
    const coolingDays_m19 = getNumericValue("m_19"); // DaysCooling
    let gfcdd;

    if (capacitanceSetting === "Static") {
      // Formula: MAX(0, (10 - TsetCool) * DaysCooling)
      gfcdd = Math.max(0, (10 - coolingSetpoint_h24) * coolingDays_m19);
    } else {
      // Assumes 'Capacitance' or any other value
      // Formula: (10 - TsetCool) * DaysCooling
      gfcdd = (10 - coolingSetpoint_h24) * coolingDays_m19;
    }

    // Update h_22 field with the newly calculated GF CDD value
    // Use Math.round as Excel likely rounds this
    setFieldValue("h_22", Math.round(gfcdd));
  }

  /**
   * Calculate all values - DUAL-ENGINE PATTERN
   * Runs both Target and Reference calculations for complete downstream data
   */
  function calculateAll() {
    // ALWAYS run BOTH engines in parallel for complete downstream data
    calculateTargetModel(); // Updates Target values (unprefixed)
    calculateReferenceModel(); // Stores ref_ values for downstream sections

    // MANDATORY: Update DOM display after calculations (strict isolation)
    ModeManager.updateCalculatedDisplayValues();
  }

  /**
   * TARGET MODEL ENGINE: Calculate all values using Target state
   * ✅ PHASE 2: Integrated climate data fetch for perfect state isolation
   */
  function calculateTargetModel() {
    // Ensure Target engine always uses Target state regardless of UI mode
    const originalMode = ModeManager.currentMode;
    try {
      ModeManager.currentMode = "target";

      // ✅ STEP 1: Get climate data based on TargetState location with Target occupancy
      const climateValues = getClimateDataForState(TargetState, "target");

      // ✅ STEP 2: Update both local state AND StateManager immediately
      Object.entries(climateValues).forEach(([key, value]) => {
        TargetState.setValue(key, value, "calculated");
        // CRITICAL: Publish to StateManager so downstream sections can access
        window.TEUI.StateManager.setValue(key, value.toString(), "calculated");
      });

      // ✅ STEP 3: Run calculations that depend on climate data
      calculateHeatingSetpoint();
      calculateCoolingSetpoint_h24();
      calculateTemperatures();
      calculateGroundFacing();
      updateCoolingDependents();
      updateCriticalOccupancyFlag();

      // ✅ FIX: Store Target calculation results to StateManager (was missing!)
      storeTargetResults();

      // ✅ CRITICAL: Force S12 recalculation after climate data publication (user changes only)
      // This ensures S12 gets updated climate data even if listeners fail
      // PERFORMANCE: Only trigger for user-initiated climate changes, not calculated cascades
      if (window.TEUI?.SectionModules?.sect12) {
        // Check if S12 is properly initialized
        if (!window.TEUI.SectionModules.sect12.isInitialized) {
          window.TEUI.SectionModules.sect12.forceInitialization();
        }

        // Only force recalculation for user-initiated changes (location changes)
        // Skip during initialization cascades to improve performance
        if (window.TEUI.SectionModules.sect12.calculateTargetModel) {
          window.TEUI.SectionModules.sect12.calculateTargetModel();

          // Ensure DOM display values are updated after forced calculation
          if (
            window.TEUI.SectionModules.sect12.ModeManager
              ?.updateCalculatedDisplayValues
          ) {
            window.TEUI.SectionModules.sect12.ModeManager.updateCalculatedDisplayValues();
          }
        }
      }
    } finally {
      // Restore prior UI mode
      ModeManager.currentMode = originalMode;
    }
  }

  /**
   * REFERENCE MODEL ENGINE: Calculate all values using Reference state
   * ✅ PHASE 2: Integrated climate data fetch for perfect state isolation
   */
  function calculateReferenceModel() {
    try {
      // ✅ STEP 1: Get climate data based on ReferenceState location with Reference occupancy
      const climateValues = getClimateDataForState(ReferenceState, "reference");

      // ✅ STEP 2: Update ReferenceState with the new climate data
      Object.entries(climateValues).forEach(([key, value]) => {
        ReferenceState.setValue(key, value, "calculated");
      });

      // Force Reference mode temporarily for other calculations
      const originalMode = ModeManager.currentMode;
      ModeManager.currentMode = "reference";

      // ✅ STEP 3: Run calculations that depend on climate data
      calculateHeatingSetpoint();
      calculateCoolingSetpoint_h24();
      calculateTemperatures();
      calculateGroundFacing();
      updateCoolingDependents();

      // Restore original mode
      ModeManager.currentMode = originalMode;

      // ✅ STEP 4: Store all Reference results for downstream sections
      storeReferenceResults();
    } catch (error) {
      console.error("Error during Section 03 calculateReferenceModel:", error);
    }
  }

  /**
   * Store Reference Model calculation results with ref_ prefix for downstream sections
   *
   * ✅ FIX (Oct 5, 2025): Only publish CALCULATED outputs, NOT input fields
   * INPUT fields (d_19, h_19, h_20) are managed by:
   * - User input → StateManager.setValue("ref_d_19", value, "user-modified")
   * - Import → StateManager.setValue("ref_d_19", value, "imported")
   * - ReferenceValues → Not applicable for S03 location fields
   *
   * Section calculations should ONLY publish calculated climate data and outputs!
   */
  function storeReferenceResults() {
    if (!window.TEUI?.StateManager) return;

    // ✅ ONLY publish CALCULATED outputs from Reference model calculations
    const referenceResults = {
      // ❌ REMOVED INPUT FIELDS - they are NOT calculated by S03:
      // d_19 (province), h_19 (city), h_20 (current/future weather toggle)
      // These INPUT fields are set via user input or import, NOT calculated

      // ✅ Climate data - CALCULATED from location lookup (KEEP)
      d_20: ReferenceState.getValue("d_20"), // Reference HDD (CALCULATED) ✅
      d_21: ReferenceState.getValue("d_21"), // Reference CDD (CALCULATED) ✅
      j_19: ReferenceState.getValue("j_19"), // Reference climate zone (CALCULATED) ✅
      d_23: ReferenceState.getValue("d_23"), // Reference coldest day (CALCULATED) ✅
      d_24: ReferenceState.getValue("d_24"), // Reference hottest day (CALCULATED) ✅
      l_22: ReferenceState.getValue("l_22"), // Elevation (CALCULATED) ✅

      // ✅ Calculated setpoints and values (KEEP)
      h_23: ReferenceState.getValue("h_23"), // Reference heating setpoint (CALCULATED) ✅
      h_24: ReferenceState.getValue("h_24"), // Reference cooling setpoint (CALCULATED) ✅
      d_22: ReferenceState.getValue("d_22"), // Reference GF HDD (CALCULATED) ✅
      h_22: ReferenceState.getValue("h_22"), // Reference GF CDD (CALCULATED) ✅
    };

    // Store with ref_ prefix for downstream sections
    Object.entries(referenceResults).forEach(([fieldId, value]) => {
      if (value !== null && value !== undefined) {
        window.TEUI.StateManager.setValue(
          `ref_${fieldId}`,
          String(value),
          "calculated",
        );
      }
    });

    console.log(
      "[S03] Reference CALCULATED results stored (climate data + setpoints - INPUT fields excluded)",
    );
  }

  /**
   * Store Target Model calculation results to StateManager for downstream sections
   * ✅ FIX (Oct 5, 2025): Added missing Target results storage
   * This publishes ONLY the calculated values that aren't already published in the initial climate data loop
   */
  function storeTargetResults() {
    if (!window.TEUI?.StateManager) return;

    // ✅ ONLY publish values CALCULATED by the calculation functions (not from climate lookup)
    // NOTE: d_20, d_21, j_19, d_23, d_24, l_22 are already published in the initial climate data loop
    const targetResults = {
      // ✅ Calculated setpoints and derived values (ONLY these need additional publishing)
      h_23: TargetState.getValue("h_23"), // Target heating setpoint (CALCULATED from occupancy) ✅
      h_24: TargetState.getValue("h_24"), // Target cooling setpoint (CALCULATED from occupancy) ✅
      d_22: TargetState.getValue("d_22"), // Target GF HDD (CALCULATED from h_23) ✅ - This was missing!
      h_22: TargetState.getValue("h_22"), // Target GF CDD (CALCULATED from h_24) ✅ - This was missing!
    };

    // Store unprefixed for downstream sections (Target mode)
    Object.entries(targetResults).forEach(([fieldId, value]) => {
      if (value !== null && value !== undefined) {
        window.TEUI.StateManager.setValue(fieldId, String(value), "calculated");
      }
    });

    console.log(
      "[S03] Target CALCULATED results stored (setpoints + derived values only - climate data already published)",
    );
  }

  // --- New Calculation Functions ---

  /**
   * Calculate Heating Setpoint (h_23) based on Occupancy Type (d_12)
   */
  function calculateHeatingSetpoint() {
    const referenceStandard = getModeAwareGlobalValue("d_13"); // ✅ PHASE 2: Mode-aware external dependency
    const occupancyType = getModeAwareGlobalValue("d_12"); // ✅ PHASE 2: Mode-aware external dependency
    let heatingSetpoint;

    // Check if the reference standard indicates a Passive House related standard
    if (referenceStandard.toUpperCase().includes("PH")) {
      // Case-insensitive check for "PH"
      heatingSetpoint = 18;
    } else {
      // Original logic if not a PH standard: 22°C for Residential or Care occupancies, else 18°C
      // Ensuring the occupancyType strings match those defined in Section02 d_12 options
      if (
        occupancyType === "C-Residential" ||
        occupancyType === "B2-Care and Treatment" || // Exact match for B2
        occupancyType === "B3-Detention Care & Treatment" || // Exact match for B3
        occupancyType.includes("Care")
      ) {
        // Broader check for "Care" just in case of variations
        heatingSetpoint = 22;
      } else {
        heatingSetpoint = 18; // Default for other non-PH, non-Care/Residential occupancies
      }
    }

    setFieldValue("h_23", heatingSetpoint); // Update state and DOM via S03 local helper
    return heatingSetpoint; // Return value for potential chaining
  }

  /**
   * Calculate Base Cooling Setpoint (h_24) based on Occupancy Type (d_12)
   */
  function calculateCoolingSetpoint_h24() {
    const occupancyType = getModeAwareGlobalValue("d_12"); // ✅ PHASE 2: Mode-aware external dependency
    let coolingSetpoint = 24; // Default for all types currently

    // Add specific logic based on occupancy if needed in the future
    setFieldValue("h_24", coolingSetpoint); // Update state and DOM
    return coolingSetpoint; // Return value for potential chaining
  }

  /**
   * Determine the effective cooling setpoint considering the override
   */
  function determineEffectiveCoolingSetpoint() {
    const baseSetpoint_h24 = getNumericValue("h_24") || 24; // Get from S03 internal state
    const override_l24 = getNumericValue("l_24") || 24; // Get from S03 internal state

    // Use override only if it's a valid number and > 20
    if (!isNaN(override_l24) && override_l24 > 20) {
      return override_l24;
    } else {
      return baseSetpoint_h24;
    }
  }

  /**
   * Update fields dependent on the effective cooling setpoint (i_24, m_24)
   */
  function updateCoolingDependents() {
    const effectiveSetpointC = determineEffectiveCoolingSetpoint();

    // Update i_24 (Fahrenheit conversion)
    if (!isNaN(effectiveSetpointC)) {
      const effectiveSetpointF = Math.round((effectiveSetpointC * 9) / 5 + 32);
      setFieldValue("i_24", effectiveSetpointF);
    }

    // Update m_24 (Percentage calculation - Placeholder logic)
    // Add the actual calculation logic for m_24 here when known
    // Example placeholder:
    const someBaseValueForM24 = 100; // Replace with actual dependency value
    const m24Value = Math.round((effectiveSetpointC / 22) * 100); // Example calc
    setFieldValue("m_24", `${m24Value}%`);
  }

  /**
   * Update the critical occupancy flag display based on current mode and occupancy
   * ✅ FIXED: Now properly mode-aware and removes flag when not critical
   */
  function updateCriticalOccupancyFlag() {
    // ✅ FIXED: Use the same mode-aware pattern as S02 for perfect state isolation
    const occupancyType =
      ModeManager.currentMode === "reference"
        ? window.TEUI.StateManager?.getValue("ref_d_12") || "" // ✅ Reference mode: read ref_d_12
        : window.TEUI.StateManager?.getValue("d_12") || ""; // ✅ Target mode: read d_12

    const sectionHeader = document.querySelector(
      "#climateCalculations .section-header",
    ); // Target the main header
    if (!sectionHeader) {
      console.warn("Section 3 header not found for critical flag.");
      return false;
    }

    let flagSpan = sectionHeader.querySelector(
      ".critical-occupancy-header-flag",
    );
    let isCritical = occupancyType.includes("Care");

    // console.log(`[S03] Critical flag update: mode=${ModeManager.currentMode}, occupancy="${occupancyType}", critical=${isCritical}`);

    if (isCritical) {
      if (!flagSpan) {
        // Create the span if it doesn't exist
        flagSpan = document.createElement("span");
        flagSpan.className = "critical-occupancy-header-flag";
        flagSpan.style.cssText = `
          color: #dc3545;
          font-weight: 600;
          margin-left: 15px;
          font-size: 14px;
          background-color: rgba(220, 53, 69, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid rgba(220, 53, 69, 0.3);
        `;

        // Insert immediately after the section title text
        const sectionTitleText = sectionHeader.textContent.trim();
        if (sectionTitleText.includes("SECTION 3. Climate Calculations")) {
          // Find the text node or icon and insert after it
          const iconSpan = sectionHeader.querySelector(".section-icon");
          if (iconSpan && iconSpan.nextSibling) {
            // Insert after icon and title text
            iconSpan.parentNode.insertBefore(
              flagSpan,
              iconSpan.nextSibling.nextSibling || null,
            );
          } else {
            // Fallback: insert at beginning
            sectionHeader.insertBefore(
              flagSpan,
              sectionHeader.firstChild.nextSibling,
            );
          }
        }
      }
      flagSpan.textContent = "Critical Occupancy";
    } else {
      // ✅ CRITICAL FIX: Remove the flag when not critical (was missing before!)
      flagSpan?.remove();
    }

    // Store status on the header dataset for easier access by other functions
    sectionHeader.dataset.isCritical = isCritical;

    return isCritical; // Return the status for other functions
  }

  // --- End New Calculation Functions ---

  /**
   * Creates and injects the Target/Reference toggle and Reset button into the section header.
   */
  function injectHeaderControls() {
    const sectionHeader = document.querySelector(
      "#climateCalculations .section-header",
    );
    if (
      !sectionHeader ||
      sectionHeader.querySelector(".local-controls-container")
    ) {
      return; // Already setup or header not found
    }

    const controlsContainer = document.createElement("div");
    controlsContainer.className = "local-controls-container";
    controlsContainer.style.cssText =
      "display: flex; align-items: center; margin-left: auto; gap: 10px;";

    // --- Create Reset Button ---
    const resetButton = document.createElement("button");
    resetButton.innerHTML = "🔄 Reset"; // Using an icon for clarity
    resetButton.title = "Reset Section 3 to Defaults";
    resetButton.style.cssText =
      "padding: 4px 8px; font-size: 0.8em; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;";

    resetButton.addEventListener("click", (event) => {
      event.stopPropagation();
      // Use a confirmation dialog to prevent accidental resets
      if (
        confirm(
          "Are you sure you want to reset all inputs in this section to their defaults? This will clear any saved data for Section 3.",
        )
      ) {
        ModeManager.resetState();
      }
    });

    // --- Create Weather Data Button ---
    const weatherButton = document.createElement("button");
    weatherButton.textContent = "Weather Data";
    weatherButton.id = "s03WeatherDataBtn";
    weatherButton.title = "Show detailed weather data for current city";
    weatherButton.style.cssText =
      "padding: 4px 8px; font-size: 0.8em; background-color: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer;";

    weatherButton.addEventListener("click", function () {
      showWeatherData();
    });

    // --- Create Toggle Switch ---
    const stateIndicator = document.createElement("span");
    stateIndicator.textContent = "TARGET";
    stateIndicator.style.cssText =
      "color: #fff; font-weight: bold; font-size: 0.8em; background-color: rgba(0, 123, 255, 0.5); padding: 2px 6px; border-radius: 4px;";

    const toggleSwitch = document.createElement("div");
    toggleSwitch.style.cssText =
      "position: relative; width: 40px; height: 20px; background-color: #ccc; border-radius: 10px; cursor: pointer;";

    const slider = document.createElement("div");
    slider.style.cssText =
      "position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background-color: white; border-radius: 50%; transition: transform 0.2s;";

    toggleSwitch.appendChild(slider);

    toggleSwitch.addEventListener("click", (event) => {
      event.stopPropagation();
      const isReference = toggleSwitch.classList.toggle("active");
      if (isReference) {
        slider.style.transform = "translateX(20px)";
        toggleSwitch.style.backgroundColor = "#28a745";
        stateIndicator.textContent = "REFERENCE";
        stateIndicator.style.backgroundColor = "rgba(40, 167, 69, 0.7)";
        ModeManager.switchMode("reference");
      } else {
        slider.style.transform = "translateX(0px)";
        toggleSwitch.style.backgroundColor = "#ccc";
        stateIndicator.textContent = "TARGET";
        stateIndicator.style.backgroundColor = "rgba(0, 123, 255, 0.5)";
        ModeManager.switchMode("target");
      }
    });

    // Append all controls to the container, then the container to the header
    controlsContainer.appendChild(resetButton);
    controlsContainer.appendChild(weatherButton);
    controlsContainer.appendChild(stateIndicator);
    controlsContainer.appendChild(toggleSwitch);
    sectionHeader.appendChild(controlsContainer);

    console.log("S03: Header controls setup complete");
  }

  /**
   * Initialize all event handlers
   */
  function initializeEventHandlers() {
    // Province dropdown change
    const provinceDropdown = getElement(['[data-dropdown-id="dd_d_19"]']);
    if (provinceDropdown) {
      // Remove any existing listeners
      const newProvinceDropdown = provinceDropdown.cloneNode(true);
      provinceDropdown.parentNode.replaceChild(
        newProvinceDropdown,
        provinceDropdown,
      );

      // Add new listener
      newProvinceDropdown.addEventListener("change", handleProvinceChange);
    }

    // City dropdown change
    const cityDropdown = getElement(['[data-dropdown-id="dd_h_19"]']);
    if (cityDropdown) {
      // Remove any existing listeners
      const newCityDropdown = cityDropdown.cloneNode(true);
      cityDropdown.parentNode.replaceChild(newCityDropdown, cityDropdown);

      // Add new listener - ✅ PHASE 3: Simplified to match h_21 working pattern
      newCityDropdown.addEventListener("change", function () {
        const selectedCity = this.value;
        console.log("Section03: City selected:", selectedCity);
        ModeManager.setValue("h_19", selectedCity, "user-modified");
        calculateAll(); // ✅ Let the engines handle climate data updates
      });
    }

    // Present/Future timeframe dropdown
    const timeframeDropdown = getElement(['[data-dropdown-id="dd_h_20"]']);
    if (timeframeDropdown) {
      // Remove any existing listeners
      const newTimeframeDropdown = timeframeDropdown.cloneNode(true);
      timeframeDropdown.parentNode.replaceChild(
        newTimeframeDropdown,
        timeframeDropdown,
      );

      // Add new listener - ✅ PHASE 3: Simplified to match h_21 working pattern
      newTimeframeDropdown.addEventListener("change", function () {
        const selectedTimeframe = this.value;
        console.log("S03: Timeframe selected:", selectedTimeframe);
        ModeManager.setValue("h_20", selectedTimeframe, "user-modified");
        calculateAll(); // ✅ Let the engines handle climate data updates
      });
    }

    // ✅ CRITICAL: Capacitance dropdown (h_21) - AFFECTS GFCDD CALCULATION
    const capacitanceDropdown = getElement(['[data-dropdown-id="dd_h_21"]']);
    if (capacitanceDropdown) {
      // Remove any existing listeners
      const newCapacitanceDropdown = capacitanceDropdown.cloneNode(true);
      capacitanceDropdown.parentNode.replaceChild(
        newCapacitanceDropdown,
        capacitanceDropdown,
      );

      // Add new listener
      newCapacitanceDropdown.addEventListener("change", function () {
        const selectedCapacitance = this.value;
        console.log("S03: Capacitance setting changed:", selectedCapacitance);
        ModeManager.setValue("h_21", selectedCapacitance, "user");

        // If "Static" is chosen, force the percentage to 0
        if (selectedCapacitance === "Static") {
          ModeManager.setValue("i_21", "0", "system");
          ModeManager.refreshUI(); // Refresh UI to show the slider reset to 0
        }

        calculateAll(); // CRITICAL: Recalculate GFCDD when capacitance changes
      });
    }

    // Weather data buttons
    ["showWeatherDataBtn", "weatherDataBtn"].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.removeEventListener("click", showWeatherData);
        btn.addEventListener("click", showWeatherData);
      }
    });

    // Add handlers for ALL editable fields in this section (e.g., m_19, l_24)
    const sectionElement = document.getElementById("climateCalculations");
    if (sectionElement) {
      const editableFields = sectionElement.querySelectorAll(
        ".editable.user-input",
      );
      editableFields.forEach((field) => {
        if (!field.hasEditableListeners) {
          // Add a flag to prevent duplicate listeners
          field.setAttribute("contenteditable", "true");
          field.addEventListener("blur", handleEditableBlur); // Use the general blur handler
          // Add the general keydown handler to prevent Enter newlines
          field.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              this.blur();
            }
          });
          field.hasEditableListeners = true; // Set the flag
        }
      });
    }

    // ✅ INITIALIZE SLIDERS VIA FIELDMANAGER (Standard Architecture)
    if (window.TEUI?.FieldManager?.initializeSliders) {
      window.TEUI.FieldManager.initializeSliders("climateCalculations");
      console.log("S03: Sliders initialized via FieldManager");
    } else {
      console.warn("S03: FieldManager.initializeSliders not available");
    }

    // ✅ PHASE 3: Initial climate data handled by calculateAll() in onSectionRendered
    // No need for explicit updateWeatherData() call here

    // --- StateManager Listeners ---
    if (window.TEUI && window.TEUI.StateManager) {
      // ✅ ENHANCED: Listener for d_12 (Target Occupancy) changes
      window.TEUI.StateManager.addListener(
        "d_12",
        function (newOccupancyValue) {
          // console.log(`[S03] 🎯 Target occupancy changed: ${newOccupancyValue}`);

          // ✅ NEW APPROACH: Trigger full recalculation of BOTH engines
          // This ensures both Target and Reference models get updated with correct temperatures
          // based on their respective occupancy values
          calculateAll();

          // ✅ CRITICAL FIX: Update critical flag display immediately (mode-aware)
          updateCriticalOccupancyFlag();
        },
      );

      // ✅ NEW: Listener for ref_d_12 (Reference Occupancy) changes
      window.TEUI.StateManager.addListener(
        "ref_d_12",
        function (newRefOccupancyValue) {
          // console.log(`[S03] 🔵 Reference occupancy changed: ${newRefOccupancyValue}`);

          // ✅ NEW APPROACH: Trigger full recalculation of BOTH engines
          // This ensures both Target and Reference models get updated with correct temperatures
          // based on their respective occupancy values
          calculateAll();

          // ✅ CRITICAL FIX: Update critical flag display immediately (mode-aware)
          updateCriticalOccupancyFlag();
        },
      );

      // ✅ REMOVED: Self-listeners cause recursion anti-pattern per 4012-CHEATSHEET.md
      // S03 should not listen to its own calculated values (d_20, h_24, d_22, etc.)
      // User input changes trigger calculateAll() directly via dropdown/slider handlers
      // Internal calculations (j_19, h_22, d_22) are handled within calculation engines

      // ✅ CRITICAL: Bridge FieldManager slider updates to DualState
      window.TEUI.StateManager.addListener("i_21", function (newValue) {
        // When FieldManager updates StateManager, also update DualState for isolation
        // This listener handles TARGET mode slider changes.
        if (ModeManager.currentMode === "target") {
          ModeManager.setValue("i_21", newValue, "user");
          calculateAll(); // Recalculate everything as capacitance affects GF CDD
          console.log(
            `S03: TARGET slider updated via FieldManager - bridged to DualState: ${newValue}%`,
          );
        }
      });

      // ✅ FINAL FIX: Add a dedicated listener for REFERENCE mode slider changes.
      window.TEUI.StateManager.addListener("ref_i_21", function (newValue) {
        // This listener handles REFERENCE mode slider changes.
        if (ModeManager.currentMode === "reference") {
          ModeManager.setValue("i_21", newValue, "user");
          calculateAll(); // Recalculate everything as capacitance affects GF CDD
          console.log(
            `S03: REFERENCE slider updated via FieldManager - bridged to DualState: ${newValue}%`,
          );
        }
      });

      // ✅ CRITICAL: Bridge capacitance dropdown (h_21) updates to DualState
      window.TEUI.StateManager.addListener("h_21", function (newValue) {
        // When dropdown updates StateManager, also update DualState for isolation
        DualState.setValue("h_21", newValue, "user");
        calculateAll(); // Recalculate GFCDD when capacitance setting changes
        console.log(
          `S03: Capacitance dropdown updated via StateManager - bridged to DualState: ${newValue}`,
        );
      });
    } else {
      console.warn("Section 03: StateManager not found, listeners not added.");
    }
  }

  /**
   * Handle blur events on editable fields
   */
  function handleEditableBlur(event) {
    const fieldId = this.getAttribute("data-field-id");
    if (!fieldId) return;

    const newValue = this.textContent.trim();
    const numericValue = window.TEUI.parseNumeric(newValue, NaN); // Try parsing

    if (!isNaN(numericValue)) {
      // Format display for valid numbers
      const formatType = Number.isInteger(numericValue)
        ? "integer"
        : "number-2dp"; // Default format
      this.textContent = window.TEUI.formatNumber(numericValue, formatType);

      // ✅ MODE-AWARE: Update BOTH internal state (TargetState/ReferenceState) AND StateManager
      // Use ModeManager.setValue() which handles both automatically
      ModeManager.setValue(fieldId, numericValue.toString(), "user-modified");

      calculateAll(); // Recalculate after state update
    } else {
      // Revert to previous value if input is invalid
      const previousValue = ModeManager.getValue(fieldId) || "0"; // Read from internal state
      const prevNumericValue = window.TEUI.parseNumeric(previousValue, 0);
      const formatType = Number.isInteger(prevNumericValue)
        ? "integer"
        : "number-2dp";
      this.textContent = window.TEUI.formatNumber(prevNumericValue, formatType);
      console.warn(
        `Invalid input for ${fieldId}: ${newValue}. Reverted to ${this.textContent}.`,
      );
    }
  }

  /**
   * Populate province dropdown using ClimateDataService
   */
  function populateProvinceDropdown() {
    const provinceSelect = getElement(['[data-dropdown-id="dd_d_19"]']);
    if (!provinceSelect) return;

    // Clear existing options except the first one
    while (provinceSelect.options.length > 1) {
      provinceSelect.remove(1);
    }

    const provinces = ClimateDataService.getProvinces();
    provinces.forEach((province) => {
      const option = document.createElement("option");
      option.value = province;
      option.textContent = ClimateDataService.getProvinceFullName(province);
      provinceSelect.appendChild(option);
    });

    // console.log("S03: Populated province dropdown with options:", provinces);

    // Set default province from current state
    const defaultProvince = DualState.getValue("d_19") || "ON";
    provinceSelect.value = defaultProvince;

    if (provinceSelect.value) {
      DualState.setValue("d_19", provinceSelect.value, "init");

      // ✅ CRITICAL FIX: Sync to global StateManager for cross-section communication (MODE-AWARE)
      if (window.TEUI?.StateManager) {
        const key =
          ModeManager.currentMode === "reference" ? "ref_d_19" : "d_19";
        window.TEUI.StateManager.setValue(key, provinceSelect.value, "default");
        window.TEUI.StateManager.setValue(
          "dd_d_19",
          provinceSelect.value,
          "default",
        );
        console.log(
          `S03: Synced province "${provinceSelect.value}" to StateManager for cross-section communication`,
        );
      }

      // Trigger city dropdown update
      updateCityDropdown(provinceSelect.value);
    }
  }

  /**
   * Called when section is rendered - Enhanced for DualState
   */
  function onSectionRendered() {
    console.log(
      "S03: Section rendered - initializing Self-Contained State Module.",
    );

    // 1. Initialize the ModeManager and its internal states
    ModeManager.initialize();

    // 2. Setup the section-specific toggle switch in the header
    injectHeaderControls();

    // 3. Expose ModeManager globally for cross-section communication
    if (window.TEUI) {
      window.TEUI.sect03 = window.TEUI.sect03 || {};
      window.TEUI.sect03.ModeManager = ModeManager;
      console.log(
        "S03: ModeManager exposed globally for cross-section integration.",
      );
    }

    // 4. Ensure ClimateData is available before proceeding
    ClimateDataService.ensureAvailable(function () {
      // console.log("S03: ClimateData available - initializing dropdowns");

      // Populate province dropdown
      populateProvinceDropdown();

      // Set up event handlers
      initializeEventHandlers();

      // Initial UI refresh from current state
      ModeManager.refreshUI();

      // ✅ CSV EXPORT FIX: Publish ALL Reference defaults to StateManager
      // Without this, CSV export shows empty Reference values (missing S03 fields)
      // FileHandler.exportToCSV() reads from StateManager, not from internal ReferenceState
      // Pattern: Conditionally publish if value doesn't exist (import-safe, non-destructive)
      if (window.TEUI?.StateManager) {
        ["d_19", "h_19", "h_20", "h_21", "i_21", "m_19", "l_20", "l_21", "l_24"].forEach(id => {
          const refId = `ref_${id}`;
          const val = ReferenceState.getValue(id);
          if (!window.TEUI.StateManager.getValue(refId) && val != null && val !== "") {
            window.TEUI.StateManager.setValue(refId, val, "calculated");
          }
        });
      }

      // 5. Perform initial calculations for this section
      calculateAll();

      // 6. Apply validation tooltips to fields
      if (
        window.TEUI.TooltipManager &&
        window.TEUI.TooltipManager.initialized
      ) {
        setTimeout(() => {
          window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
        }, 300);
      }

      console.log("S03: Self-Contained State Module initialization complete");
    });
  }

  //==========================================================================
  // PART 5: PUBLIC API - Enhanced with DualState
  //==========================================================================

  return {
    // Field definitions and layout
    getFields: getFields,
    getDropdownOptions: getDropdownOptions,
    getLayout: getLayout,

    // Event handling and initialization
    initializeEventHandlers: initializeEventHandlers,
    onSectionRendered: onSectionRendered,

    // Utility functions
    showWeatherData: showWeatherData,
    calculateAll: calculateAll,

    // DualState functionality
    DualState: DualState,
    ModeManager: ModeManager,
    TargetState: TargetState,
    ReferenceState: ReferenceState,
  };
})();
