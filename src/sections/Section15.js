/**
 * 4012-Section15.js
 * TEUI Summary (Section 15) - Final Energy Calculations & Dashboard Feed
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

// Section 15: TEUI Summary Module
window.TEUI.SectionModules.sect15 = (function () {
  //==========================================================================
  // HELPER FUNCTIONS
  //==========================================================================

  /**
   * Safely parses a numeric value from StateManager or DOM, handling potential strings with commas.
   * Uses the global parseNumeric if available, otherwise provides a fallback.
   * @param {string} fieldId - The ID of the field to retrieve the value for.
   * @returns {number} The parsed numeric value, or 0 if parsing fails.
   */
  function getNumericValue(fieldId) {
    if (typeof window.TEUI?.parseNumeric === "function") {
      return (
        window.TEUI.parseNumeric(window.TEUI.StateManager?.getValue(fieldId)) ||
        0
      );
    } else {
      // Fallback parsing logic
      const value = window.TEUI.StateManager?.getValue(fieldId);
      if (value === null || value === undefined) return 0;
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        // Remove $, commas, % and handle potential empty strings or non-numeric values
        const cleanedValue = value.replace(/[$,%]/g, "").trim();
        if (cleanedValue === "") return 0;
        const parsed = parseFloat(cleanedValue);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    }
  }

  /**
   * Formats a number according to the project's display rules (2 decimal places, commas).
   * Handles specific formats like percentages and currency.
   * @param {number} value - The number to format.
   * @param {string} [format='number'] - The type of format ('number', 'currency', 'percent').
   * @returns {string} The formatted number as a string.
   */
  function formatNumber(value, format = "number") {
    if (value === null || value === undefined || isNaN(value)) {
      return format === "currency"
        ? "$0.00"
        : format === "percent"
          ? "0%"
          : "0.00";
    }

    const num = Number(value);

    if (format === "currency") {
      return (
        "$" +
        num.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } else if (format === "percent") {
      // Assuming the input value is the raw decimal (e.g., 0.59 for 59%)
      return (num * 100).toFixed(0) + "%";
    } else if (format === "btu") {
      return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
    } else if (format === "tons") {
      return num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else if (format === "integer") {
      return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
    } else {
      // Default number format (e.g., kWh, kWh/m2, W/m2)
      return num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  }

  /**
   * Sets a calculated value for the Target model.
   * Updates the local TargetState and the global StateManager.
   * @param {string} fieldId - The ID of the field.
   * @param {number} rawValue - The raw numeric value.
   */
  function setTargetValue(fieldId, rawValue) {
    const valueToStore =
      !isFinite(rawValue) || rawValue === null || rawValue === undefined
        ? "N/A"
        : rawValue.toString();
    TargetState.setValue(fieldId, valueToStore);
    if (window.TEUI?.StateManager) {
      window.TEUI.StateManager.setValue(fieldId, valueToStore, "calculated");
    }
  }

  /**
   * Sets a calculated value for the Reference model.
   * Updates the local ReferenceState and the global StateManager (with ref_ prefix).
   * @param {string} fieldId - The ID of the field.
   * @param {number} rawValue - The raw numeric value.
   */
  function setReferenceValue(fieldId, rawValue) {
    const valueToStore =
      !isFinite(rawValue) || rawValue === null || rawValue === undefined
        ? "N/A"
        : rawValue.toString();
    ReferenceState.setValue(fieldId, valueToStore);
    if (window.TEUI?.StateManager) {
      const refFieldId = `ref_${fieldId}`;
      window.TEUI.StateManager.setValue(refFieldId, valueToStore, "calculated");
    }
  }

  //==========================================================================
  // 🎯 PATTERN A DUAL-STATE ARCHITECTURE
  //==========================================================================

  /**
   * TargetState: Manages Target (user's design) state with persistence
   */
  const TargetState = {
    data: {},
    storageKey: "S15_TARGET_STATE",

    // Load saved state from localStorage
    loadState: function () {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          this.data = JSON.parse(saved);
          // console.log(`S15: Loaded Target state from localStorage`);
        }
      } catch (error) {
        console.warn(`S15: Error loading Target state:`, error);
        this.data = {};
      }
    },

    // Save current state to localStorage
    saveState: function () {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        // console.log(`S15: Saved Target state to localStorage`);
      } catch (error) {
        console.warn(`S15: Error saving Target state:`, error);
      }
    },

    // Get value with fallback to DOM
    getValue: function (fieldId) {
      // ✅ CORRECTED: Remove fallback to global getNumericValue to prevent state contamination.
      // State objects should only ever access their own internal data.
      return this.data[fieldId];
    },

    // Set value and optionally save state
    setValue: function (fieldId, value, source = "calculated") {
      this.data[fieldId] = value;
      if (source === "user" || source === "user-modified") {
        this.saveState();
      }
    },

    // Set default values for Target calculations
    setDefaults: function () {
      // S15 is mostly calculated values, minimal defaults needed
      // console.log(`S15: Target defaults set`);
    },
  };

  /**
   * ReferenceState: Manages Reference (building code minimums) state with persistence
   */
  const ReferenceState = {
    data: {},
    storageKey: "S15_REFERENCE_STATE",

    // Load saved state from localStorage
    loadState: function () {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          this.data = JSON.parse(saved);
          // console.log(`S15: Loaded Reference state from localStorage`);
        }
      } catch (error) {
        console.warn(`S15: Error loading Reference state:`, error);
        this.data = {};
      }
    },

    // Save current state to localStorage
    saveState: function () {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        // console.log(`S15: Saved Reference state from localStorage`);
      } catch (error) {
        console.warn(`S15: Error saving Reference state:`, error);
      }
    },

    // Get value with fallback to DOM
    getValue: function (fieldId) {
      // ✅ CORRECTED: Remove fallback to global getNumericValue to prevent state contamination.
      return this.data[fieldId];
    },

    // Set value and optionally save state
    setValue: function (fieldId, value, source = "calculated") {
      this.data[fieldId] = value;
      if (source === "user" || source === "user-modified") {
        this.saveState();
      }
    },

    // Set default values for Reference calculations
    setDefaults: function () {
      // S15 is mostly calculated values, minimal defaults needed
      // console.log(`S15: Reference defaults set`);
    },
  };

  /**
   * ModeManager: Handles UI mode switching and state coordination
   */
  const ModeManager = {
    currentMode: "target", // "target" or "reference"

    // Initialize the mode manager
    initialize: function () {
      TargetState.loadState();
      ReferenceState.loadState();
      TargetState.setDefaults();
      ReferenceState.setDefaults();

      // console.log(`S15: Pattern A initialization complete.`);
    },

    // Switch between Target and Reference modes
    switchMode: function (mode) {
      if (mode !== "target" && mode !== "reference") {
        console.warn(`S15: Invalid mode: ${mode}`);
        return;
      }

      this.currentMode = mode;

      // ✅ CORRECTED: Only refresh UI, don't re-run calculations.
      this.refreshUI();
      this.updateCalculatedDisplayValues();
    },

    // Refresh UI based on current mode
    refreshUI: function () {
      const fieldsToSync = [
        // S15 is mostly calculated fields, minimal user inputs to sync
        "d_141",
        "h_141", // Capital cost inputs if any
      ];

      fieldsToSync.forEach((fieldId) => {
        const element = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (element) {
          const currentState =
            this.currentMode === "target" ? TargetState : ReferenceState;
          const value = currentState.getValue(fieldId);
          if (element.type === "checkbox") {
            element.checked = value === "true" || value === true;
          } else {
            element.value = value || "";
          }
        }
      });

      // Update calculated display values
      this.updateCalculatedDisplayValues();

      // console.log(`S15: UI refreshed for ${this.currentMode} mode`);
    },

    // Update calculated field displays based on current mode
    updateCalculatedDisplayValues: function () {
      const calculatedFields = [
        "d_135",
        "h_135",
        "d_136",
        "h_136",
        "d_137",
        "h_137",
        "d_138",
        "h_138",
        "d_139",
        "h_139",
        "d_140",
        "h_140",
        "l_137",
        "l_138",
        "l_139",
        "d_141",
        "h_141",
        "l_141",
        "h_142",
        "d_143",
        "h_143",
        "l_143",
        "d_144",
        "h_144",
        "l_144",
        "d_145",
      ];

      const currentState = this.getCurrentState();

      calculatedFields.forEach((fieldId) => {
        const element = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (element) {
          let rawValue = currentState.getValue(fieldId);

          // ✅ SPECIAL CASE: d_145 is mode-agnostic (always Target vs Reference ratio)
          // If not available in current state, read from Target state as fallback
          if (
            (rawValue === "N/A" ||
              rawValue === null ||
              rawValue === undefined) &&
            fieldId === "d_145"
          ) {
            rawValue = TargetState.getValue(fieldId); // Escape to Target state for ratio
          }

          if (
            rawValue === "N/A" ||
            rawValue === null ||
            rawValue === undefined
          ) {
            element.textContent = "N/A";
            return;
          }

          const num = window.TEUI.parseNumeric(rawValue, 0);
          let format = "number"; // Default format
          if (["d_141", "h_141", "l_141", "d_142"].includes(fieldId))
            format = "currency";
          else if (["d_144", "h_144", "l_144", "d_145"].includes(fieldId))
            format = "percent";
          else if (["l_137", "l_138", "l_139"].includes(fieldId))
            format = "btu";
          else if (["h_138", "h_139"].includes(fieldId)) format = "tons";
          else if (fieldId === "h_142") format = "number";

          element.textContent = formatNumber(num, format);
          element.classList.toggle("negative-value", num < 0);
        }
      });
    },

    // Reset current mode's state to defaults
    resetCurrentState: function () {
      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;
      currentState.data = {};
      currentState.setDefaults();
      currentState.saveState();

      this.refreshUI();
      calculateAll();
      // ✅ PHASE 3 FIX: Update DOM after calculations (DUAL-STATE-CHEATSHEET requirement)
      this.updateCalculatedDisplayValues();

      console.log(`S15: ${this.currentMode} state reset to defaults`);

      // ✅ DUAL-STATE: State reset complete - values will be published via calculateAll()
    },

    // Get current value based on active mode
    getValue: function (fieldId) {
      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;
      return currentState.getValue(fieldId);
    },

    // Set value in current mode's state
    setValue: function (fieldId, value, source = "calculated") {
      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;
      currentState.setValue(fieldId, value, source);
    },

    getCurrentState: function () {
      return this.currentMode === "target" ? TargetState : ReferenceState;
    },
  };

  // MANDATORY: Global exposure for cross-section communication
  window.TEUI.sect15 = window.TEUI.sect15 || {};
  window.TEUI.sect15.ModeManager = ModeManager;
  window.TEUI.sect15.TargetState = TargetState;
  window.TEUI.sect15.ReferenceState = ReferenceState;

  //==========================================================================
  // HEADER CONTROLS INJECTION
  //==========================================================================

  /**
   * Creates and injects the Target/Reference toggle and Reset button into the section header.
   * Follows the exact pattern from S14, S13, S12, S11 for consistent behavior.
   */
  function injectHeaderControls() {
    const sectionHeader = document.querySelector(
      "#teuiSummary .section-header, #teuiSummary .section-title",
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

    // Reset Button
    const resetButton = document.createElement("button");
    resetButton.innerHTML = "🔄 Reset";
    resetButton.title = "Reset Section 15 to Defaults";
    resetButton.style.cssText =
      "padding: 4px 8px; font-size: 0.8em; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;";

    resetButton.addEventListener("click", (event) => {
      event.stopPropagation();
      if (
        confirm(
          "Are you sure you want to reset all inputs in this section to their defaults? This will clear any saved data for Section 15.",
        )
      ) {
        ModeManager.resetCurrentState();
      }
    });

    // Toggle Switch (exact copy from S14 pattern)
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

    // Toggle Switch Click Handler
    toggleSwitch.addEventListener("click", (event) => {
      event.stopPropagation(); // ✅ FIX: Prevent header collapse
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

    // Assemble controls
    controlsContainer.appendChild(resetButton);
    controlsContainer.appendChild(stateIndicator);
    controlsContainer.appendChild(toggleSwitch);
    sectionHeader.appendChild(controlsContainer);

    console.log("✅ S15: Header controls injected successfully");
  }

  //==========================================================================
  // CONSOLIDATED FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  // Define rows with integrated field definitions
  const sectionRows = {
    // SECTION HEADER
    header: {
      id: "15-ID",
      rowId: "15-ID",
      label: "TEUI Summary Units",
      cells: {
        c: {
          content: "SECTION 15. TEUI Targeted",
          classes: ["section-header"],
        },
        d: { content: "Column D", classes: ["section-subheader"] },
        e: { content: "Column E", classes: ["section-subheader"] },
        f: { content: "Column F", classes: ["section-subheader"] },
        g: { content: "Column G", classes: ["section-subheader"] },
        h: { content: "Column H", classes: ["section-subheader"] },
        i: { content: "Column I", classes: ["section-subheader"] },
        j: { content: "Column J", classes: ["section-subheader"] },
        k: { content: "Column K", classes: ["section-subheader"] },
        l: { content: "Column L", classes: ["section-subheader"] },
        m: { content: "Column M", classes: ["section-subheader"] },
        n: { content: "Column N", classes: ["section-subheader"] },
      },
    },

    // Row 135: T.6.0 TEU Targeted Electricity / T.6.1 TEUI
    135: {
      id: "T.6.0",
      rowId: "T.6.0",
      label: "TEU Targeted Electricity",
      cells: {
        c: { label: "TEU Targeted Electricity" },
        d: {
          fieldId: "d_135",
          type: "calculated",
          value: "0.00", // Default to 0.00, will be calculated
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        e: { content: "ekWh/yr" },
        f: {
          content: "T.6.1",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: { content: "TEUI", classes: ["label-main", "text-left", "no-wrap"] },
        h: {
          fieldId: "h_135",
          type: "calculated",
          value: "0.00", // Default to 0.00
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        i: { content: "kWh/m²/yr" },
        j: {
          content: "Excludes ekWh of any Gas or Oil loads",
          classes: ["note-text"],
        },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 136: T.6.2 TEU Targeted Electricity if HP/Gas/Oil Bldg. / T.6.3 TEUI
    136: {
      id: "T.6.2",
      rowId: "T.6.2",
      label: "TEU Targeted Electricity if HP/Gas/Oil Bldg.",
      cells: {
        c: { label: "TEU Targeted Electricity if HP/Gas/Oil Bldg." },
        d: {
          fieldId: "d_136",
          type: "calculated",
          value: "0.00", // Default to 0.00
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        e: { content: "kWh/yr" },
        f: {
          content: "T.6.3",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: { content: "TEUI", classes: ["label-main", "text-left", "no-wrap"] },
        h: {
          fieldId: "h_136",
          type: "calculated",
          value: "0.00", // Default to 0.00
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        i: { content: "kWh/m²/yr" },
        j: {
          content: "Excl. ekWh of fossil eqpt/Applies COP for HP",
          classes: ["note-text"],
        }, //Excludes ekWh of any Gas loads, and Applies COP for HP Equipment
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 137: T.6.4 Peak Heating Load (Enclosure Only) / T.6.4 TEUI-imp
    137: {
      id: "T.6.4",
      rowId: "T.6.4",
      label: "Peak Heating Load (Enclosure Only)",
      cells: {
        c: { label: "Peak Heating Load (Enclosure Only)" },
        d: {
          fieldId: "d_137",
          type: "calculated",
          value: "0.00", // Default to 0.00
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        e: { content: "kW" },
        f: {
          content: "T.6.4",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: {
          content: "TEUI-imp",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: { content: "" }, // Removed fieldId, no calculation for h_137
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: {
          fieldId: "l_137",
          type: "calculated",
          value: "0", // Default to 0
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        m: { content: "BTU/hr" },
        n: { content: "" },
      },
    },

    // Row 138: T.6.5 Peak Cooling Load (Enclosure Only) / T.6.6 Peak Cooling Imp
    138: {
      id: "T.6.5",
      rowId: "T.6.5",
      label: "Peak Cooling Load (Enclosure Only)",
      cells: {
        c: { label: "Peak Cooling Load (Enclosure Only)" },
        d: {
          fieldId: "d_138",
          type: "calculated",
          value: "0.00", // Default to 0.00
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        e: { content: "kW" },
        f: {
          content: "T.6.6",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: {
          content: "Peak Cooling Imp",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: {
          fieldId: "h_138",
          type: "calculated",
          value: "0.00", // Default to 0.00
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        i: { content: "Tons-Cooling" },
        j: { content: "" },
        k: { content: "" },
        l: {
          fieldId: "l_138",
          type: "calculated",
          value: "0", // Default to 0
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        m: { content: "BTU/hr" },
        n: { content: "" },
      },
    },

    // Row 139: T.6.7 Peak Cooling Load (Enclosure + Gains) / T.6.9 Peak Cooling Imp
    139: {
      id: "T.6.7",
      rowId: "T.6.7",
      label: "Peak Cooling Load (Enclosure + Gains)",
      cells: {
        c: { label: "Peak Cooling Load (Enclosure + Gains)" },
        d: {
          fieldId: "d_139",
          type: "calculated",
          value: "0.00", // Default to 0.00
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        e: { content: "kW" },
        f: {
          content: "T.6.9",
          classes: ["label-prefix", "text-right", "no-wrap"],
        }, // Note: CSV says T.6.7, but UI label suggests T.6.9? Assuming T.6.9 for field h_139
        g: {
          content: "Peak Cooling Imp",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: {
          fieldId: "h_139",
          type: "calculated",
          value: "0.00", // Default to 0.00
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        i: { content: "Tons-Cooling" },
        j: { content: "" },
        k: { content: "" },
        l: {
          fieldId: "l_139",
          type: "calculated",
          value: "0", // Default to 0
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        m: { content: "BTU/hr" },
        n: { content: "" },
      },
    },

    // Row 140: T.6.8 Max. Heating Load Intensity / T.6.8 Heat Load Imp
    140: {
      id: "T.6.8",
      rowId: "T.6.8",
      label: "Max. Heating Load Intensity",
      cells: {
        c: { label: "Max. Heating Load Intensity" },
        d: {
          fieldId: "d_140",
          type: "calculated",
          value: "0.00", // Default to 0.00
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        e: { content: "W/m²" },
        f: {
          content: "T.6.8",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: {
          content: "Heat Load Imp",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: {
          fieldId: "h_140",
          type: "calculated",
          value: "0.00", // Default to 0.00 - Max Cool Intsty in W/m² (Enclosure Only)
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        i: { content: "" }, // Unit removed as it's W/m2
        j: { content: "T.6.6 Mx. Cool Intsty in W/m² (Enclosure Only)" },
        k: { content: "" },
        l: { content: "" }, // l_140 removed, no formula in CSV
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 141: T.7.1 Annual Cost of Electricity
    141: {
      id: "T.7.1",
      rowId: "T.7.1",
      label: "Annual Cost of Electricity",
      cells: {
        c: { label: "Annual Cost of Electricity" },
        d: {
          fieldId: "d_141",
          type: "calculated",
          value: "$0.00", // Default to $0.00
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        e: { content: "" },
        f: {
          content: "T.7.2",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: {
          content: "pre and",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: {
          fieldId: "h_141",
          type: "calculated",
          value: "$0.00", // Default to $0.00
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        i: { content: "post heat pump" },
        j: { content: "T.7.3" },
        k: { content: "∑ Other Energy" },
        l: {
          fieldId: "l_141",
          type: "calculated",
          value: "$0.00", // Default to $0.00
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 142: T.7.4 Cost Premium of HP Equipment
    142: {
      id: "T.7.4",
      rowId: "T.7.4",
      label: "Cost Premium of HP Equipment",
      cells: {
        c: { label: "Cost Premium of HP Equipment" },
        d: {
          // This seems like an input, not calculated. Assuming it's an editable field for now.
          fieldId: "d_142",
          type: "editable",
          value: "30000.00", // Default value from CSV example
          classes: ["user-input"], // Assuming user input style
          section: "teuiSummary",
          tooltip: true, // Capital Cost Premium
        },
        e: { content: "" },
        f: {
          content: "T.7.5",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: { content: "ROI", classes: ["label-main", "text-left", "no-wrap"] },
        h: {
          fieldId: "h_142",
          type: "calculated",
          value: "0.00", // Default to 0.00
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        i: { content: "Years to Amortize" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 143: T.3.1 TEUI Reference / T.3.2 Targeted TEUI / T.3.3 Actual
    143: {
      id: "T.3.1",
      rowId: "T.3.1",
      label: "TEUI Reference (Performance Gap)",
      cells: {
        c: { label: "TEUI Reference (Performance Gap)" },
        d: {
          fieldId: "d_143",
          type: "calculated",
          value: "0.00", // Default to 0.00
          classes: ["reference-value"], // Keep reference style
          section: "teuiSummary",
        },
        e: { content: "Reference" },
        f: {
          content: "T.3.2",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: {
          content: "Targeted TEUI",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: {
          fieldId: "h_143",
          type: "calculated",
          value: "0.00", // Default to 0.00
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        i: { content: "Target (Design)" },
        j: { content: "T.3.3" },
        k: { content: "Actual" },
        l: {
          fieldId: "l_143",
          type: "calculated",
          value: "0.00", // Default to 0.00
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        m: { content: "Actual (Utility Bills)" },
        n: { content: "" },
      },
    },

    // Row 144: T.8.1 TEUI Energy Reduction from Reference / T.8.2 Target % of Utility
    144: {
      id: "T.8.1",
      rowId: "T.8.1",
      label: "TEUI Energy Reduction from Reference",
      cells: {
        c: { label: "TEUI Energy Reduction from Reference" },
        d: {
          fieldId: "d_144",
          type: "calculated",
          value: "0%", // Default to 0%
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        e: { content: "" },
        f: {
          content: "T.8.2",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: {
          content: "Target % of Utility Data",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: {
          fieldId: "h_144",
          type: "calculated",
          value: "0%", // Default to 0%
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        i: { content: "of Utility Data" },
        j: { content: "T.8.3" },
        k: { content: "Actual" },
        l: {
          fieldId: "l_144",
          type: "calculated",
          value: "0%", // Default to 0%
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        m: { content: "of Targeted Design" },
        n: { content: "" },
      },
    },

    // Row 145: T.9.1 GHGe Reduction from Reference
    145: {
      id: "T.9.1",
      rowId: "T.9.1",
      label: "GHGe Reduction from Reference",
      cells: {
        c: { label: "GHGe Reduction from Reference" },
        d: {
          fieldId: "d_145",
          type: "calculated",
          value: "0%", // Default to 0%
          classes: ["calculated-value"],
          section: "teuiSummary",
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },
  };

  //==========================================================================
  // ACCESSOR METHODS TO EXTRACT FIELDS AND LAYOUT
  //==========================================================================

  /**
   * Extract field definitions from the integrated layout
   * This method is required for compatibility with the FieldManager
   */
  function getFields() {
    const fields = {};

    // Extract field definitions from all rows except the header
    Object.entries(sectionRows).forEach(([rowKey, row]) => {
      if (rowKey === "header") return; // Skip the header row
      if (!row.cells) return;

      // Process each cell in the row
      Object.entries(row.cells).forEach(([colKey, cell]) => {
        // Include 'editable' types now
        if (
          cell.fieldId &&
          (cell.type === "calculated" || cell.type === "editable")
        ) {
          // Create field definition with all relevant properties
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.label || row.label,
            // Use 'value' from cell definition as defaultValue
            defaultValue: cell.value !== undefined ? cell.value.toString() : "",
            section: cell.section || "teuiSummary",
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
        }
      });
    });

    return fields;
  }

  /**
   * Extract dropdown options from the integrated layout
   * Required for backward compatibility
   */
  function getDropdownOptions() {
    const options = {};

    // Extract dropdown options from all cells with dropdownId
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
   * This converts our compact definition to the format expected by the renderer
   */
  function getLayout() {
    // IMPORTANT: To ensure the header appears first, we process the rows in
    // a specific order: header first, then all other rows

    // Start with an empty array for rows
    const layoutRows = [];

    // First add the header row if it exists
    if (sectionRows["header"]) {
      layoutRows.push(createLayoutRow(sectionRows["header"]));
    }

    // Then add all other rows in their original order, excluding the header
    Object.entries(sectionRows).forEach(([key, row]) => {
      if (key !== "header") {
        layoutRows.push(createLayoutRow(row));
      }
    });

    return { rows: layoutRows };
  }

  /**
   * Helper function to convert a row definition to the layout format
   * This function handles the conversion of column C cells for proper row labels
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

        // Special handling for column C to support both label patterns
        if (col === "c") {
          // If using content+type pattern, convert to label pattern
          if (cell.type === "label" && cell.content && !cell.label) {
            cell.label = cell.content;
            delete cell.type; // Not needed for rendering
            delete cell.content; // Not needed once we have label
          }
          // If neither label nor content exists, use row's label as fallback
          else if (!cell.label && !cell.content && row.label) {
            cell.label = row.label;
          }
        }

        // Remove field-specific properties that aren't needed for rendering
        delete cell.getOptions;
        delete cell.section;
        delete cell.dependencies; // Dependencies are handled by StateManager, not renderer
        // Keep 'value' for editable fields' initial display
        // Keep 'type' for renderer to identify editable vs calculated

        rowDef.cells.push(cell);
      } else {
        // Add empty cell if not defined
        // Special handling for column C - use row's label if available
        if (col === "c" && !row.cells?.c && row.label) {
          rowDef.cells.push({ label: row.label });
        } else {
          // Otherwise add empty cell
          rowDef.cells.push({});
        }
      }
    });

    return rowDef;
  }

  //==========================================================================
  // CALCULATIONS AND DEPENDENCIES
  //==========================================================================

  /**
   * Register all field dependencies with the StateManager based on FORMULAE-3037.csv
   */
  function registerDependencies() {
    if (!window.TEUI.StateManager) {
      // console.warn("StateManager not available for TEUI dependency registration");
      return;
    }
    const sm = window.TEUI.StateManager;

    // Dependencies for d_135: =M43+K51+H70+D117+I104+M121-I80
    ["m_43", "k_51", "h_70", "d_117", "i_104", "m_121", "i_80"].forEach((dep) =>
      sm.registerDependency(dep, "d_135"),
    );

    // Dependencies for h_135: =D135/H15
    sm.registerDependency("d_135", "h_135");
    sm.registerDependency("h_15", "h_135");

    // Dependencies for d_136: =IF(D113="Electricity",D135,IF(D113="Heatpump",(K51+D117+D114+M43+H70),IF(D113="Gas",(K51+D117+M43+H70),IF(D113="Oil",(K51+D117+M43+H70)))))
    sm.registerDependency("d_113", "d_136"); // Primary Heating System
    sm.registerDependency("d_135", "d_136"); // Dependency if electric
    ["k_51", "d_117", "d_114", "m_43", "h_70"].forEach((dep) =>
      sm.registerDependency(dep, "d_136"),
    ); // Dependencies if HP/Gas/Oil

    // Dependencies for h_136: =D136/H15
    sm.registerDependency("d_136", "h_136");
    sm.registerDependency("h_15", "h_136");

    // Dependencies for d_137: =(G101*D101+D102*G102)*(H23-D23)/1000
    ["g_101", "d_101", "d_102", "g_102", "h_23", "d_23"].forEach((dep) =>
      sm.registerDependency(dep, "d_137"),
    );

    // Dependencies for l_137: =D137*3412.14245
    sm.registerDependency("d_137", "l_137");

    // Dependencies for d_138: =(G101*D101+D102*G102)*(D24-H24)/1000
    ["g_101", "d_101", "d_102", "g_102", "d_24", "h_24"].forEach((dep) =>
      sm.registerDependency(dep, "d_138"),
    );

    // Dependencies for h_138: =D138*0.2843451361
    sm.registerDependency("d_138", "h_138");

    // Dependencies for l_138: =D138*3412.14245
    sm.registerDependency("d_138", "l_138");

    // Dependencies for d_139: =((G101*D101+D102*G102)*(D24-H24)+(D65+D66+D67)*H15)/1000+((K79+D122+K64-H124)/(M19*24))
    [
      "g_101",
      "d_101",
      "d_102",
      "g_102",
      "d_24",
      "h_24",
      "d_65",
      "d_66",
      "d_67",
      "h_15",
      "k_79",
      "d_122",
      "k_64",
      "h_124",
      "m_19",
    ].forEach((dep) => sm.registerDependency(dep, "d_139"));

    // Dependencies for h_139: =D139*0.2843451361
    sm.registerDependency("d_139", "h_139");

    // Dependencies for l_139: =D139*3412.14245
    sm.registerDependency("d_139", "l_139");

    // Dependencies for d_140: =D137*1000/H15
    sm.registerDependency("d_137", "d_140");
    sm.registerDependency("h_15", "d_140");

    // Dependencies for h_140: =D138/H15*1000
    sm.registerDependency("d_138", "h_140");
    sm.registerDependency("h_15", "h_140");

    // Dependencies for d_141: =D135*L12
    sm.registerDependency("d_135", "d_141");
    sm.registerDependency("l_12", "d_141"); // Electricity price

    // Dependencies for h_141: =D136*L12
    sm.registerDependency("d_136", "h_141");
    sm.registerDependency("l_12", "h_141"); // Electricity price

    // Dependencies for l_141: =(L13*D28)+(D29*L14)+(L15*D31)
    ["l_13", "d_28", "d_29", "l_14", "l_15", "d_31"].forEach((dep) =>
      sm.registerDependency(dep, "l_141"),
    );

    // Dependencies for h_142: =IF(D113="Heatpump",D142/(D141-H141), 0)
    sm.registerDependency("d_113", "h_142"); // Primary Heating System
    sm.registerDependency("d_142", "h_142"); // Cost Premium (Input)
    sm.registerDependency("d_141", "h_142"); // Pre-HP cost
    sm.registerDependency("h_141", "h_142"); // Post-HP cost

    // Dependencies for d_143: =E10 (Reference TEUI)
    sm.registerDependency("e_10", "d_143"); // Note: e_10 might be calculated elsewhere

    // Dependencies for h_143: =H10 (Target TEUI)
    sm.registerDependency("h_10", "h_143");

    // Dependencies for l_143: =IF(D14="Targeted Use", "N/A", K10)
    sm.registerDependency("d_14", "l_143"); // Reporting Mode
    sm.registerDependency("k_10", "l_143"); // Actual TEUI from Sec 1

    // Dependencies for d_144: =1-(H143/D143)
    sm.registerDependency("h_143", "d_144");
    sm.registerDependency("d_143", "d_144");

    // Dependencies for h_144: =IF(L143="N/A", "N/A", IF(L143=0, 0, H143/L143))
    sm.registerDependency("l_143", "h_144");
    sm.registerDependency("h_143", "h_144");

    // Dependencies for l_144: =IF(D14="Targeted Use", "N/A", L143/H143)
    sm.registerDependency("d_14", "l_144"); // Reporting Mode
    sm.registerDependency("l_143", "l_144");
    sm.registerDependency("h_143", "l_144");

    // Dependencies for d_145: =1-(K32/REFERENCE!K32)
    // Requires k_32 (Target Net Emissions) and a reference emission value (REFERENCE!K32)
    sm.registerDependency("k_32", "d_145");
    sm.registerDependency("ref_k_32", "d_145"); // Reference emissions from S04
  }

  /**
   * Calculate all values for this section and connected sections
   * This follows the template pattern expected by the system
   */
  function calculateAll() {
    // console.log(`[S15DEBUG] calculateAll() triggered`);
    // Run both engines independently
    calculateReferenceModel(); // Calculates Reference values with ref_ prefix
    calculateTargetModel(); // Calculates Target values (existing logic)
  }

  /**
   * REFERENCE MODEL ENGINE: Calculate all values using Reference state
   * Stores results with ref_ prefix to keep separate from Target values
   * ENHANCED: Now properly receives Reference values from Section 04
   */
  function calculateReferenceModel() {
    try {
      // 🎯 Enhanced helper function to get Reference values with comprehensive parseFloat
      const getRefValue = (fieldId) => {
        const refFieldId = `ref_${fieldId}`;
        const refValue = window.TEUI?.StateManager?.getValue(refFieldId);

        // ✅ CRITICAL CONTAMINATION FIX: No fallbacks to Target values (Phase 6 compliance)
        // Reference calculations must ONLY read ref_ prefixed values for perfect state isolation

        // Return null if truly missing, so we can handle N/A properly
        if (refValue === null || refValue === undefined) {
          return null;
        }

        // ✅ CRITICAL: Convert strings to numbers for math (prevents concatenation)
        return parseFloat(refValue) || 0;
      };

      // ✅ Get Reference values from upstream sections and convert to numbers
      // ✅ CONTAMINATION FIX: Read ONLY ref_ prefixed area value
      const area =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_h_15")) || 1;
      if (area === null || area <= 0) {
        console.warn(
          "[S15 REF DEBUG] Critical: ref_h_15 (area) missing or zero - cannot calculate Reference model",
        );
        return; // Exit early if we can't calculate without area
      }

      const elecPrice =
        window.TEUI?.parseNumeric?.(
          window.TEUI?.StateManager?.getValue(`ref_l_12`),
        ) || 0;
      // ✅ CONTAMINATION FIX: Read ONLY ref_ prefixed cost values
      const gasPrice =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_l_13")) || 0;
      const propanePrice =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_l_14")) || 0;
      const oilPrice =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_l_16")) || 0;
      const woodPrice =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_l_15")) || 0;

      // ✅ CONTAMINATION FIX: Read ONLY ref_ prefixed S04 values
      const ref_j32 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_j_32")) || 0; // Reference Total Energy from S04
      const ref_k32 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_k_32")) || 0; // Reference Total Emissions from S04

      // ✅ Reference upstream values - READ ONLY ref_ prefixed values with parseFloat
      const ref_i104 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_i_104")) || 0; // From S12 Building Envelope
      const ref_m121 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_m_121")) || 0; // From S13 Ventilation
      const ref_i80 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_i_80")) || 0; // From S10 Solar Gains
      // console.log(
      //   `🔍 S15 REFERENCE UPSTREAM: ref_i_104=${ref_i104}, ref_m_121=${ref_m121}, ref_i_80=${ref_i80}`,
      // );

      // ✅ Get other Reference dependencies with parseFloat conversion
      // ✅ CONTAMINATION FIX: Read ONLY ref_ prefixed values
      const m43 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_m_43")) || 0;
      const m43_final = m43 !== null ? m43 : 0; // Use 0 if ref_m_43 is missing
      const k51 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_k_51")) || 0;
      const h70 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_h_70")) || 0; // ✅ CORRECT: Read PLE subtotal (h_70) as per Excel formula
      const i104 = ref_i104; // Use Reference values for Reference calculations
      const m121 = ref_m121; // Use Reference values for Reference calculations
      const i80 = ref_i80; // Use Reference values for Reference calculations

      // ✅ FIX: Use direct ref_d_113 instead of broken getReferenceValue()
      const primaryHeating =
        window.TEUI?.StateManager?.getValue("ref_d_113") || "Electricity";

      // 🔍 CRITICAL DEBUG: Confirm S15 Reference engine now reads correct heating system (commented out for clean logs)
      // console.log(`[S15 REF DEBUG] FIXED: Reading ref_d_113 directly = "${primaryHeating}"`);
      // ✅ CONTAMINATION FIX: Read ONLY ref_ prefixed S13 heating value
      const d114 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_d_114")) || 0;

      // 🔍 DEBUG: Log S15 Reference calculation inputs (commented out for clean logs)
      // console.log(`[S15 REF DEBUG] d_114 calculation: ref_d_114=${window.TEUI?.StateManager?.getValue("ref_d_114")}, parsed=${d114}, heating=${primaryHeating}`);

      // ✅ CONTAMINATION FIX: Read ONLY ref_ prefixed values for Reference calculations
      const g101 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_g_101")) || 0;
      const d101 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_d_101")) || 0;
      const d102 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_d_102")) || 0;
      const g102 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_g_102")) || 0;
      const h23 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_h_23")) || 0;
      const d23 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_d_23")) || 0;
      const d24 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_d_24")) || 0;
      const h24 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_h_24")) || 0;

      // Check if critical upstream Reference values are available
      const criticalRefValues = [
        "ref_g_101",
        "ref_d_101",
        "ref_h_23",
        "ref_i_104",
      ];
      const missingValues = criticalRefValues.filter(
        (fieldId) => !window.TEUI.StateManager.getValue(fieldId),
      );
      if (missingValues.length > 0) {
        console.warn(
          `[S15] Missing critical upstream Reference values: ${missingValues.join(", ")}`,
        );
        // ✅ TIMING FIX: Use fallback values during initialization, values will be available later
        console.log(
          `[S15] Using fallback values for missing upstream dependencies (initialization timing)`,
        );
      }

      // ✅ CONTAMINATION FIX: Read ONLY ref_ prefixed values for Reference calculations
      const d65 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_d_65")) || 0;
      const d66 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_d_66")) || 0;
      const d67 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_d_67")) || 0;
      const k79 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_k_79")) || 0;
      const d122 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_d_122")) || 0;
      const k64 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_k_64")) || 0;
      const h124 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_h_124")) || 0;
      const m19_days =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_m_19")) || 120;

      // console.log(
      //   `✅ S15 Reference Model: All values converted to numbers for proper math`,
      // );

      // ✅ CONTAMINATION FIX: Read ONLY ref_ prefixed fuel and cost values
      const d28 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_d_28")) || 0; // Total Fossil Gas Use (m3/yr)
      const d29 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_d_29")) || 0; // Total Propane Use (kg/yr)
      const d31 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_d_31")) || 0; // Total Wood Use (m3/yr)
      const d30_litres =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_d_30")) || 0; // Total Oil Use (litres/yr)
      // ✅ CONTAMINATION FIX: Read ONLY ref_ prefixed cost premium value
      const hpCostPremium =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_d_142")) || 0; // Heat pump cost premium
      // Read S01 dashboard values directly (S01 is state-agnostic)
      const refTEUI_e10 =
        window.TEUI?.parseNumeric(
          window.TEUI?.StateManager?.getValue("e_10"),
        ) || 0; // Reference TEUI (Sec 1)
      const targetTEUI_h10 =
        window.TEUI?.parseNumeric(
          window.TEUI?.StateManager?.getValue("h_10"),
        ) || 0; // Target TEUI (Sec 1)
      const actualTEUI_k10 =
        window.TEUI?.parseNumeric(
          window.TEUI?.StateManager?.getValue("k_10"),
        ) || 0; // Actual TEUI from Sec 1
      const reportingMode_d14 =
        window.TEUI?.StateManager?.getValue("d_14") || "Targeted Use"; // Reporting Mode

      // console.log(
      //   `✅ S15 Reference Model: Additional fuel variables declared for cost calculations`,
      // );

      // Get cooling type for d117 logic
      // ✅ FIX: Use direct ref_d_116 instead of broken getReferenceValue()
      const coolingType_d116 =
        window.TEUI?.StateManager?.getValue("ref_d_116") || "No Cooling";
      // ✅ CONTAMINATION FIX: Read ONLY ref_ prefixed cooling value
      let d117_actual_val =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_d_117")) || 0;
      let d117_effective = d117_actual_val;
      if (coolingType_d116 === "No Cooling") {
        d117_effective = 0;
      }

      // 🔍 DEBUG: Log cooling system logic for d_136 calculation (commented out for clean logs)
      // console.log(`[S15 REF DEBUG] Cooling logic: ref_d_116="${coolingType_d116}", ref_d_117=${d117_actual_val}, effective=${d117_effective}`);

      // d_135: TEU Targeted Electricity (Reference)
      let ref_teuTargetTotal =
        m43_final + k51 + h70 + d117_effective + i104 + m121 - i80;

      // console.log(`[S15] 🔗 REF d_135 calc: ${ref_teuTargetTotal} = m43(${m43}) + k51(${k51}) + h70(${h70}) + d117(${d117_effective}) + i104(${i104}) + m121(${m121}) - i80(${i80})`);

      setReferenceValue("d_135", ref_teuTargetTotal);

      // h_135: TEUI (Reference)
      let ref_teui_h135 = area > 0 ? ref_teuTargetTotal / area : 0;
      setReferenceValue("h_135", ref_teui_h135);

      // d_136: TEU Targeted Electricity if HP/Gas/Oil Bldg (Reference)
      let ref_teuTargetedElecHPGasOil;
      if (primaryHeating === "Electricity") {
        ref_teuTargetedElecHPGasOil = ref_teuTargetTotal;
      } else if (primaryHeating === "Heatpump") {
        ref_teuTargetedElecHPGasOil =
          k51 + d117_effective + d114 + m43_final + h70;
      } else {
        ref_teuTargetedElecHPGasOil = k51 + d117_effective + m43_final + h70;
      }

      setReferenceValue("d_136", ref_teuTargetedElecHPGasOil);

      // h_136: TEUI (HP/Gas/Oil) (Reference)
      let ref_teui_h136 = area > 0 ? ref_teuTargetedElecHPGasOil / area : 0;
      setReferenceValue("h_136", ref_teui_h136);

      // Calculate all other Reference values using the same pattern...

      // d_137: Peak Heating Load (Reference)
      let ref_peakHeatingLoad_d137 =
        ((g101 * d101 + d102 * g102) * (h23 - d23)) / 1000;
      setReferenceValue("d_137", ref_peakHeatingLoad_d137);

      // l_137: Peak Heating BTU (Reference)
      let ref_peakHeatingBTU_l137 = ref_peakHeatingLoad_d137 * 3412.14245;
      setReferenceValue("l_137", ref_peakHeatingBTU_l137);

      // d_138: Peak Cooling Load (Reference)
      let ref_peakCoolingLoad_d138 =
        ((g101 * d101 + d102 * g102) * (d24 - h24)) / 1000;
      setReferenceValue("d_138", ref_peakCoolingLoad_d138);

      // h_138: Peak Cooling Tons (Reference)
      let ref_peakCoolingTons_h138 = ref_peakCoolingLoad_d138 * 0.2843451361;
      setReferenceValue("h_138", ref_peakCoolingTons_h138);

      // l_138: Peak Cooling BTU (Reference)
      let ref_peakCoolingBTU_l138 = ref_peakCoolingLoad_d138 * 3412.14245;
      setReferenceValue("l_138", ref_peakCoolingBTU_l138);

      // d_139: Peak Cooling Load with Gains (Reference)
      let ref_enclosureCoolLoad = (g101 * d101 + d102 * g102) * (d24 - h24);
      let ref_internalGainsW = (d65 + d66 + d67) * area;
      let ref_solarVentOccGains = k79 + d122 + k64 - h124;
      let ref_peakCoolingLoadGains_d139 =
        (ref_enclosureCoolLoad + ref_internalGainsW) / 1000;
      if (m19_days > 0) {
        ref_peakCoolingLoadGains_d139 +=
          ref_solarVentOccGains / (m19_days * 24);
      }
      setReferenceValue("d_139", ref_peakCoolingLoadGains_d139);

      // h_139: Peak Cooling Tons with Gains (Reference)
      let ref_peakCoolingTonsGains_h139 =
        ref_peakCoolingLoadGains_d139 * 0.2843451361;
      setReferenceValue("h_139", ref_peakCoolingTonsGains_h139);

      // l_139: Peak Cooling BTU with Gains (Reference)
      let ref_peakCoolingBTUGains_l139 =
        ref_peakCoolingLoadGains_d139 * 3412.14245;
      setReferenceValue("l_139", ref_peakCoolingBTUGains_l139);

      // d_140: Max Heating Intensity (Reference)
      let ref_maxHeatingIntensity_d140 =
        area > 0 ? (ref_peakHeatingLoad_d137 * 1000) / area : 0;
      setReferenceValue("d_140", ref_maxHeatingIntensity_d140);

      // h_140: Max Cooling Intensity (Reference)
      let ref_maxCoolingIntensity_h140 =
        area > 0 ? (ref_peakCoolingLoad_d138 * 1000) / area : 0;
      setReferenceValue("h_140", ref_maxCoolingIntensity_h140);

      // d_141: Annual Cost of Electricity (Reference)
      let ref_annualCostElecPre_d141 = ref_teuTargetTotal * elecPrice;
      setReferenceValue("d_141", ref_annualCostElecPre_d141);

      // h_141: Annual Cost of Electricity Post HP (Reference)
      let ref_annualCostElecPost_h141 = ref_teuTargetedElecHPGasOil * elecPrice;
      setReferenceValue("h_141", ref_annualCostElecPost_h141);

      // l_141: Other Energy Cost (Reference)
      let ref_otherEnergyCost_l141 =
        gasPrice * d28 +
        propanePrice * d29 +
        woodPrice * d31 +
        oilPrice * d30_litres;
      setReferenceValue("l_141", ref_otherEnergyCost_l141);

      // h_142: ROI (Reference)
      let ref_roi_h142 = 0;
      let ref_costSavings =
        ref_annualCostElecPre_d141 - ref_annualCostElecPost_h141;
      if (primaryHeating === "Heatpump" && ref_costSavings > 0) {
        ref_roi_h142 = hpCostPremium / ref_costSavings;
      }
      setReferenceValue("h_142", ref_roi_h142);

      // CRITICAL: Store Reference TEUI values for Section 01 consumption
      // These are the final Reference values that Section 01 needs for e_10 calculation
      setReferenceValue("d_143", refTEUI_e10); // Reference TEUI
      setReferenceValue("h_143", targetTEUI_h10); // Target TEUI

      // Calculate Reference percentage reductions
      let ref_teuiReduction_d144 =
        refTEUI_e10 > 0 ? 1 - targetTEUI_h10 / refTEUI_e10 : 0;
      setReferenceValue("d_144", ref_teuiReduction_d144);

      // Reference mode utility bill handling
      let ref_actualTEUI_l143 =
        reportingMode_d14 === "Utility Bills" ? actualTEUI_k10 : NaN;
      setReferenceValue("l_143", ref_actualTEUI_l143);

      // Reference h_144: Target vs Actual comparison
      let ref_targetVsActual_h144 = NaN;
      if (!isNaN(ref_actualTEUI_l143)) {
        ref_targetVsActual_h144 =
          ref_actualTEUI_l143 > 0 ? targetTEUI_h10 / ref_actualTEUI_l143 : 0;
      }
      setReferenceValue("h_144", ref_targetVsActual_h144);

      // Reference l_144: Actual vs Target comparison
      let ref_actualVsTarget_l144 = NaN;
      if (reportingMode_d14 === "Utility Bills" && targetTEUI_h10 > 0) {
        ref_actualVsTarget_l144 = ref_actualTEUI_l143 / targetTEUI_h10;
      }
      setReferenceValue("l_144", ref_actualVsTarget_l144);

      // GHG Reduction: Always Target vs Reference (same in both UI modes)
      // d_145 formula: 1 - (k_32 / ref_k_32) - compares Target vs Reference regardless of UI mode
      const targetEmissions_k32_forRatio = getNumericValue("k_32") || 0; // Always read Target emissions
      let ref_ghgReduction_d145 =
        ref_k32 > 0 ? 1 - targetEmissions_k32_forRatio / ref_k32 : 0;
      setReferenceValue("d_145", ref_ghgReduction_d145);

      // Debug logging (reduced frequency)
      // Reference calculations completed successfully
    } catch (error) {
      console.error(
        "[Section15] Error in Reference Model calculations:",
        error,
      );
    }
  }

  /**
   * TARGET MODEL ENGINE: Calculate all values using Application state
   * This is the existing calculation logic
   */
  function calculateTargetModel() {
    // Store current mode and switch to target for calculations
    const originalMode = ModeManager.currentMode;
    ModeManager.currentMode = "target";

    try {
      // Perform target calculations using existing calculateValues function
      calculateValues();

      // Note: Section 15 doesn't appear to have reference indicators in the standard sense
      // The percentages calculated (d_144, h_144, l_144, d_145) are comparisons between
      // Reference, Target, and Actual values rather than pass/fail indicators
    } catch (error) {
      console.error("[Section15] Error in Target Model calculations:", error);
    } finally {
      // CRITICAL: Restore original mode
      ModeManager.currentMode = originalMode;
    }
  }

  /**
   * Calculate all values for this section based on FORMULAE-3037.csv
   * This is triggered when dependencies change or on initial load
   */
  function calculateValues() {
    try {
      if (!window.TEUI.StateManager) {
        // console.warn("StateManager not available for TEUI Summary calculations");
        return;
      }
      const sm = window.TEUI.StateManager;

      // --- Get Input Values ---
      const area = getNumericValue("h_15");

      // ✅ FIX: Use robust currency parsing for electricity price from S04
      const elecPrice =
        window.TEUI?.parseNumeric?.(
          window.TEUI?.StateManager?.getValue("l_12"),
        ) || 0;
      // console.log(
      //   `[S15 DEBUG] 💰 Electricity price from S04: $${elecPrice}/kWh`,
      // );

      // ✅ PATTERN A FIX: Target engine reads unprefixed climate data (proper external dependencies)
      const hdd =
        window.TEUI.parseNumeric(window.TEUI.StateManager?.getValue("d_20")) ||
        0;
      const cdd =
        window.TEUI.parseNumeric(window.TEUI.StateManager?.getValue("d_21")) ||
        0;
      const gfhdd =
        window.TEUI.parseNumeric(window.TEUI.StateManager?.getValue("d_22")) ||
        0;
      const gfcdd =
        window.TEUI.parseNumeric(window.TEUI.StateManager?.getValue("h_22")) ||
        0;
      // console.log(`✅ S15 TARGET ENGINE CLIMATE: HDD=${hdd}, CDD=${cdd}, GFHDD=${gfhdd}, GFCDD=${gfcdd}`);

      // ✅ PATTERN A FIX: Target engine reads unprefixed upstream values (clean external dependencies)
      const i104 =
        window.TEUI.parseNumeric(window.TEUI.StateManager?.getValue("i_104")) ||
        0; // From S12 Building Envelope
      const m121 =
        window.TEUI.parseNumeric(window.TEUI.StateManager?.getValue("m_121")) ||
        0; // From S13 Ventilation
      const i80 =
        window.TEUI.parseNumeric(window.TEUI.StateManager?.getValue("i_80")) ||
        0; // From S10 Solar Gains
      // console.log(
      //   `✅ S15 TARGET UPSTREAM: i_104=${i104}, m_121=${m121}, i_80=${i80}`,
      // );
      const gasPrice = getNumericValue("l_13"); // Price per m3
      const propanePrice = getNumericValue("l_14"); // Price per kg
      const oilPrice = getNumericValue("l_16"); // Price per litre (CSV says l_16, form says l_15?) - Assuming l_16 from formula
      const woodPrice = getNumericValue("l_15"); // Price per m3 (CSV says l_15, form says l_16?) - Assuming l_15 from formula

      const m43 = getNumericValue("m_43"); // Onsite Energy Subtotals
      const k51 = getNumericValue("k_51"); // W.3.3 Net Electrical Demand (DHW)
      const h70 = getNumericValue("h_70"); // Plug/Light/Eqpt. Subtotals (Annual kWh)
      // ✅ PATTERN A FIX: Variables already properly assigned above with clean external dependency reads

      const primaryHeating = sm.getValue("d_113"); // e.g., "Heatpump", "Gas", "Oil", "Electricity"
      const d114 = getNumericValue("d_114"); // Heating System Demand (after COP/AFUE)

      const g101 = getNumericValue("g_101"); // U-Val. for Ae
      const d101 = getNumericValue("d_101"); // Total Area Exposed to Air (Ae)
      const d102 = getNumericValue("d_102"); // Total Area Exposed to Ground (Ag)
      const g102 = getNumericValue("g_102"); // U-Val. for Ag

      // ✅ FIXED: Read temperature data using Pattern A (unprefixed for Target)
      const h23 = getNumericValue("h_23") || 0; // Tset Heating (from S03)
      const d23 = getNumericValue("d_23") || 0; // Coldest Days Temp (from S03)
      const d24 = getNumericValue("d_24") || 0; // Hottest Days Temp (from S03)
      const h24 = getNumericValue("h_24") || 0; // Tset Cooling (from S03)
      // console.log(
      //   `[S15] 🎯 TGT S03 CLIMATE READ: h_23=${h23}, d_23=${d23}, d_24=${d24}, h_24=${h24}`,
      // );

      const d65 = getNumericValue("d_65"); // Plug Loads W/m2
      const d66 = getNumericValue("d_66"); // Lighting Loads W/m2
      const d67 = getNumericValue("d_67"); // Equipment Loads W/m2
      const k79 = getNumericValue("k_79"); // Subtotal Solar Gains (Cool Load kWh/yr)
      const d122 = getNumericValue("d_122"); // Incoming Cooling Season Ventil. Energy
      const k64 = getNumericValue("k_64"); // Occupant Activity (Cooling Gain kWh/yr)
      const h124 = getNumericValue("h_124"); // Ventilation Free Cooling/Vent Capacity (kWh/yr)
      const m19_days = getNumericValue("m_19") || 120; // L.3.3 Days Cooling (default 120 if not set)

      const d28 = getNumericValue("d_28"); // Total Fossil Gas Use (m3/yr) - Actual
      const d29 = getNumericValue("d_29"); // Total Propane Use (kg/yr) - Actual
      const d31 = getNumericValue("d_31"); // Total Wood Use (m3/yr) - Actual
      const d30_litres = getNumericValue("d_30"); // Total Oil Use (litres/yr) - Actual (Need value for l_141 calc)

      const hpCostPremium = getNumericValue("d_142"); // User input cost premium

      const refTEUI_e10 = getNumericValue("e_10"); // Reference TEUI (Sec 1)
      const targetTEUI_h10 = getNumericValue("h_10"); // Target TEUI (Sec 1)
      const actualTEUI_k10 = getNumericValue("k_10"); // Actual TEUI (Sec 1)
      const reportingMode_d14 = sm.getValue("d_14"); // "Utility Bills" or "Targeted Use"

      const targetEmissions_k32 = getNumericValue("k_32"); // Target Net Emissions kgCO2/yr
      const referenceEmissions_REF_k32 = getNumericValue("ref_k_32") || 0; // Reference emissions from S04

      const coolingType_d116 = sm.getValue("d_116"); // Get cooling type for d117 logic

      // --- Perform Calculations ---
      let d117_actual_val = getNumericValue("d_117"); // Get the actual d_117 value
      let d117_effective = d117_actual_val;
      if (coolingType_d116 === "No Cooling") {
        d117_effective = 0; // Override d_117 if No Cooling selected
      }

      // d_135: =M43+K51+H70+D117+I104+M121-I80
      let teuTargetTotal = m43 + k51 + h70 + d117_effective + i104 + m121 - i80;

      // console.log(`[S15] 🔗 TAR d_135 calc: ${teuTargetTotal} = m43(${m43}) + k51(${k51}) + h70(${h70}) + d117(${d117_effective}) + i104(${i104}) + m121(${m121}) - i80(${i80})`);

      setTargetValue("d_135", teuTargetTotal);

      // h_135: =D135/H15
      let teui_h135 = area > 0 ? teuTargetTotal / area : 0;
      setTargetValue("h_135", teui_h135);

      // d_136: Calculation using d117_effective logic
      let teuTargetedElecHPGasOil;
      if (primaryHeating === "Electricity") {
        teuTargetedElecHPGasOil = teuTargetTotal; // teuTargetTotal already uses d117_effective
      } else if (primaryHeating === "Heatpump") {
        teuTargetedElecHPGasOil = k51 + d117_effective + d114 + m43 + h70;
      } else {
        // Gas or Oil - sum elec loads only, exclude heating demand (d114)
        teuTargetedElecHPGasOil = k51 + d117_effective + m43 + h70;
      }

      // 🔍 KEY: Log S15 Target calculation for comparison
      // console.log(`[S15] 🔗 TAR d_136 calc: ${teuTargetedElecHPGasOil} (heating=${primaryHeating}, h70=${h70} PLE subtotal, i80=${i80} from S10)`);

      setTargetValue("d_136", teuTargetedElecHPGasOil);

      // h_136: =D136/H15
      let teui_h136 = area > 0 ? teuTargetedElecHPGasOil / area : 0;
      setTargetValue("h_136", teui_h136);

      // ✅ FINAL TARGET TEUI CALCULATION TRACKER - Use Section 01's specialized display system
      // console.log(`🔍 S15 TARGET ENGINE: Final TEUI calculation = ${teui_h136}`);
      // console.log(`🔍 S15 TARGET ENGINE: Setting h_10 = ${teui_h136} (should be stable ~93.6)`);
      // console.log(`🔍 S15 TARGET ENGINE: ** TARGET h_10 SHOULD NEVER CHANGE WHEN REFERENCE MODE LOCATION CHANGES **`);

      // 🚨 DISABLED: S15 overriding S01's h_10 calculation causes race condition
      // S01 should be the sole owner of h_10, calculating from fresh j_32 via S04
      /*
      // Store in StateManager but let Section 01 handle the display
      window.TEUI.StateManager?.setValue(
        "h_10",
        teui_h136.toString(),
        "calculated",
      );
      */
      // ✅ FIXED: Pattern A compliance - no target_ prefixes
      window.TEUI.StateManager?.setValue(
        "h_10",
        teui_h136.toString(),
        "calculated",
      );

      // 🚨 DISABLED: S15 overriding S01's h_10 calculation causes race condition
      // S01 should be the sole owner of h_10, calculating from fresh j_32 via S04
      /*
      // Trigger Section 01's specialized display update if available
      if (window.TEUI?.SectionModules?.sect01?.updateDisplayValue) {
        const formattedValue =
          window.TEUI?.formatNumber?.(teui_h136, "number-1dp") ??
          teui_h136.toString();
        window.TEUI.SectionModules.sect01.updateDisplayValue(
          "h_10",
          formattedValue,
        );
      }
      */

      // d_137: =(G101*D101+D102*G102)*(H23-D23)/1000
      let peakHeatingLoad_d137 =
        ((g101 * d101 + d102 * g102) * (h23 - d23)) / 1000;
      setTargetValue("d_137", peakHeatingLoad_d137);

      // l_137: =D137*3412.14245
      let peakHeatingBTU_l137 = peakHeatingLoad_d137 * 3412.14245;
      setTargetValue("l_137", peakHeatingBTU_l137);

      // d_138: =(G101*D101+D102*G102)*(D24-H24)/1000
      let peakCoolingLoad_d138 =
        ((g101 * d101 + d102 * g102) * (d24 - h24)) / 1000;
      setTargetValue("d_138", peakCoolingLoad_d138);

      // h_138: =D138*0.2843451361
      let peakCoolingTons_h138 = peakCoolingLoad_d138 * 0.2843451361;
      setTargetValue("h_138", peakCoolingTons_h138);

      // l_138: =D138*3412.14245
      let peakCoolingBTU_l138 = peakCoolingLoad_d138 * 3412.14245;
      setTargetValue("l_138", peakCoolingBTU_l138);

      // d_139: =((G101*D101+D102*G102)*(D24-H24)+(D65+D66+D67)*H15)/1000+((K79+D122+K64-H124)/(M19*24))
      let enclosureCoolLoad = (g101 * d101 + d102 * g102) * (d24 - h24);
      let internalGainsW = (d65 + d66 + d67) * area; // Gains in Watts
      let solarVentOccGains = k79 + d122 + k64 - h124; // Gains in kWh/yr
      let peakCoolingLoadGains_d139 =
        (enclosureCoolLoad + internalGainsW) / 1000; // Convert W to kW
      if (m19_days > 0) {
        // Convert annual kWh gains to average kW during cooling days
        peakCoolingLoadGains_d139 += solarVentOccGains / (m19_days * 24);
      }
      setTargetValue("d_139", peakCoolingLoadGains_d139);

      // h_139: =D139*0.2843451361
      let peakCoolingTonsGains_h139 = peakCoolingLoadGains_d139 * 0.2843451361;
      setTargetValue("h_139", peakCoolingTonsGains_h139);

      // l_139: =D139*3412.14245
      let peakCoolingBTUGains_l139 = peakCoolingLoadGains_d139 * 3412.14245;
      setTargetValue("l_139", peakCoolingBTUGains_l139);

      // d_140: =D137*1000/H15
      let maxHeatingIntensity_d140 =
        area > 0 ? (peakHeatingLoad_d137 * 1000) / area : 0;
      setTargetValue("d_140", maxHeatingIntensity_d140);

      // h_140: =D138/H15*1000
      let maxCoolingIntensity_h140 =
        area > 0 ? (peakCoolingLoad_d138 * 1000) / area : 0;
      setTargetValue("h_140", maxCoolingIntensity_h140);

      // d_141: =D135*L12
      const d135_value = parseFloat(getNumericValue("d_135")) || teuTargetTotal; // Read stored d_135 value
      let annualCostElecPre_d141 = d135_value * elecPrice; // Use actual d_135 value
      // console.log(
      //   `[S15 DEBUG] 🧮 D141 calculation: ${d135_value} kWh/m²/yr × $${elecPrice}/kWh = $${annualCostElecPre_d141.toFixed(2)}`,
      // );
      setTargetValue("d_141", annualCostElecPre_d141);

      // h_141: =D136*L12
      let annualCostElecPost_h141 = teuTargetedElecHPGasOil * elecPrice; // Using d_136 value
      setTargetValue("h_141", annualCostElecPost_h141);

      // l_141: =(L13*D28)+(D29*L14)+(L15*D31)
      let otherEnergyCost_l141 =
        gasPrice * d28 +
        propanePrice * d29 +
        woodPrice * d31 +
        oilPrice * d30_litres;
      setTargetValue("l_141", otherEnergyCost_l141);

      // h_142: =IF(D113="Heatpump",D142/(D141-H141), 0)
      let roi_h142 = 0;
      let costSavings = annualCostElecPre_d141 - annualCostElecPost_h141;
      if (primaryHeating === "Heatpump" && costSavings > 0) {
        roi_h142 = hpCostPremium / costSavings;
      }
      setTargetValue("h_142", roi_h142);

      // d_143: =E10 (Reference TEUI)
      setTargetValue("d_143", refTEUI_e10);

      // h_143: =H10 (Target TEUI)
      setTargetValue("h_143", targetTEUI_h10);

      // l_143: =IF(D14="Targeted Use", "N/A", K10)
      let actualTEUI_l143 =
        reportingMode_d14 === "Utility Bills" ? actualTEUI_k10 : NaN; // Use NaN to represent N/A
      setTargetValue("l_143", actualTEUI_l143);

      // d_144: =1-(H143/D143)
      let teuiReduction_d144 =
        refTEUI_e10 > 0 ? 1 - targetTEUI_h10 / refTEUI_e10 : 0;
      setTargetValue("d_144", teuiReduction_d144);

      // h_144: =IF(L143="N/A", "N/A", IF(L143=0, 0, H143/L143))
      let targetVsActual_h144 = NaN;
      if (!isNaN(actualTEUI_l143)) {
        targetVsActual_h144 =
          actualTEUI_l143 > 0 ? targetTEUI_h10 / actualTEUI_l143 : 0;
      }
      setTargetValue("h_144", targetVsActual_h144);

      // l_144: =IF(D14="Targeted Use", "N/A", L143/H143)
      let actualVsTarget_l144 = NaN;
      if (reportingMode_d14 === "Utility Bills" && targetTEUI_h10 > 0) {
        actualVsTarget_l144 = actualTEUI_l143 / targetTEUI_h10;
      }
      setTargetValue("l_144", actualVsTarget_l144);

      // d_145: =1-(K32/REFERENCE!K32) - GHG Reduction from Reference
      let ghgReduction_d145 =
        referenceEmissions_REF_k32 > 0
          ? 1 - targetEmissions_k32 / referenceEmissions_REF_k32
          : 0;
      // Check if targetEmissions is negative (sequestration), handle division by zero
      if (referenceEmissions_REF_k32 === 0 && targetEmissions_k32 < 0) {
        ghgReduction_d145 = 1; // Or some indicator of 100%+ reduction if baseline is zero
      } else if (referenceEmissions_REF_k32 === 0 && targetEmissions_k32 >= 0) {
        ghgReduction_d145 = 0; // No reduction if baseline and target are zero or positive
      }
      setTargetValue("d_145", ghgReduction_d145);
      // ✅ SPECIAL CASE: Also store in ReferenceState for mode-agnostic display
      ReferenceState.setValue("d_145", ghgReduction_d145, "calculated");
    } catch (error) {
      console.error("Error in TEUI Summary calculations:", error);
    }
  }

  /**
   * Update the DOM with the current values from the StateManager
   * Note: This might become redundant if setCalculatedValue handles DOM updates reliably.
   * Keeping it for now as a fallback or explicit refresh mechanism if needed.
   */
  function updateDisplay() {
    if (!window.TEUI.StateManager) return;

    // Get all fields managed by this section
    const fields = getFields();

    Object.keys(fields).forEach((fieldId) => {
      const value = window.TEUI.StateManager.getValue(fieldId);
      if (value !== null && value !== undefined) {
        const element = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (element) {
          // Find the field definition to know the format
          let format = "number"; // Default format
          let rawValue = getNumericValue(fieldId); // Get raw value for formatting check

          if (
            fieldId === "d_141" ||
            fieldId === "h_141" ||
            fieldId === "l_141" ||
            fieldId === "d_142"
          ) {
            format = "currency";
          } else if (
            fieldId === "d_144" ||
            fieldId === "h_144" ||
            fieldId === "l_144" ||
            fieldId === "d_145"
          ) {
            format = "percent";
          } else if (
            fieldId === "l_137" ||
            fieldId === "l_138" ||
            fieldId === "l_139"
          ) {
            format = "btu";
          } else if (fieldId === "h_138" || fieldId === "h_139") {
            format = "tons";
          } else if (fieldId === "h_142") {
            format = "number"; // Years, 2 decimals ok
          }

          // Use formatNumber for display consistency
          element.textContent = formatNumber(rawValue, format);
        }
      }
    });
  }

  /**
   * Handle editable field blur events (for d_142 cost premium input)
   */
  function handleEditableBlur(event) {
    const fieldElement = event.target;
    const fieldId = fieldElement.getAttribute("data-field-id");
    if (!fieldId) return;

    let valueStr = fieldElement.textContent.trim();
    let numValue = window.TEUI.parseNumeric(valueStr, NaN);

    if (!isNaN(numValue)) {
      // Store in both local state and global StateManager to trigger dependencies
      ModeManager.setValue(fieldId, numValue.toString(), "user-modified");
      window.TEUI.StateManager.setValue(
        fieldId,
        numValue.toString(),
        "user-modified",
      );

      // Format for display
      const formattedValue = formatNumber(numValue, "currency");
      fieldElement.textContent = formattedValue;
    } else {
      // Invalid input - revert to stored value or default
      const storedValue = ModeManager.getValue(fieldId) || "30000.00";
      fieldElement.textContent = formatNumber(
        parseFloat(storedValue),
        "currency",
      );
    }

    // Trigger recalculations
    calculateAll();
    ModeManager.updateCalculatedDisplayValues();
  }

  /**
   * Initialize event handlers for this section
   * Sets up listeners for changes in dependency values from other sections.
   */
  function initializeEventHandlers() {
    if (!window.TEUI.StateManager) {
      console.warn(
        "StateManager not available for teuiSummary dependency registration",
      );
      return;
    }
    const sm = window.TEUI.StateManager;

    // Setup event handlers for editable fields
    const editableFields = ["d_142"]; // Cost Premium of HP Equipment

    editableFields.forEach((fieldId) => {
      const field = document.querySelector(`[data-field-id="${fieldId}"]`);
      if (
        field &&
        field.hasAttribute("contenteditable") &&
        !field.hasEditableListeners
      ) {
        // Prevent Enter key from creating newlines
        field.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            field.blur();
          }
        });

        // Handle blur event
        field.addEventListener("blur", handleEditableBlur);

        // Visual feedback for editing state
        field.addEventListener("focus", () => field.classList.add("editing"));
        field.addEventListener("focusout", () =>
          field.classList.remove("editing"),
        );

        field.hasEditableListeners = true;
      }
    });

    // Helper function to create listeners that trigger calculateAll
    const addCalculationListener = (key) => {
      sm.addListener(key, () => {
        calculateAll();
        ModeManager.updateCalculatedDisplayValues();
      });
    };

    // ✅ COMPLETE DUAL-ENGINE DEPENDENCY PAIRS: 100% State Isolation Support
    // Every dependency has Target/Reference pair for "Independent Models" capability
    // Ordered alphabetically for easy scanning and maintenance
    const dependencies = [
      // Building Status (Independent Models: different project status)
      "d_14",
      "ref_d_14", // Building completion status

      // Location Data (Independent Models: different locations)
      "d_19",
      "ref_d_19", // Province (affects emission factors)

      // Climate Data (Independent Models: different climates)
      "d_23",
      "ref_d_23", // Heating design temperature
      "d_24",
      "ref_d_24", // Cooling design temperature

      // Utility Consumption (Independent Models: different actual usage)
      "d_28",
      "ref_d_28", // Gas consumption
      "d_29",
      "ref_d_29", // Propane consumption
      "d_30",
      "ref_d_30", // Oil consumption
      "d_31",
      "ref_d_31", // Wood consumption

      // Internal Gains (Independent Models: different occupancy patterns)
      "d_65",
      "ref_d_65", // Occupant density
      "d_66",
      "ref_d_66", // Plug load density
      "d_67",
      "ref_d_67", // Lighting density

      // S12 Building Envelope (Independent Models: different building performance)
      "d_101",
      "ref_d_101", // Area air
      "d_102",
      "ref_d_102", // Area ground

      // S13 Mechanical Loads (Independent Models: different HVAC systems)
      "d_113",
      "ref_d_113", // M.1.0 Primary heating system
      "f_113",
      "ref_f_113", // HSPF Efficiency
      "d_114",
      "ref_d_114", // M.2.1Heating demand
      "j_115",
      "ref_j_115", // AFUE Efficiency
      "d_117",
      "ref_d_117", // M.3.5
      "m_121",
      "ref_m _121", // V.2.3 Net Htg. Season Ventilation Loss
      "d_122",
      "ref_d_122", // V.3.1 Additional gains
      "h_124",
      "ref_h_124", // V.4.2 Free Cooling Limit
      "d_142",
      "ref_d_142", // Cost premium

      // S01 Dashboard Values (Final Display - NO ref_ versions needed)
      // S01 calculates e_10 and h_10 internally from upstream ref_j_32/j_32
      // These are FINAL DISPLAY values, not published upstream values
      "e_10",
      "h_10",
      "k_10",

      // Building Geometry (Independent Models: different building sizes)
      "h_12",
      "ref_h_12", // Reporting year (affects emission factors)
      "h_15",
      "ref_h_15", // Conditioned area
      "h_23",
      "ref_h_23", // Heating design temperature
      "h_24",
      "ref_h_24", // Cooling design temperature
      "h_70",
      "ref_h_70", // S09 PLE (Plug+Light+Equipment) subtotal
      "h_124",
      "ref_h_124", // Occupant losses

      // S12 Building Envelope U-values (Independent Models: different envelope performance)
      "g_101",
      "ref_g_101", // U-value air
      "g_102",
      "ref_g_102", // U-value ground
      "g_104",
      "ref_g_104", // Weighted U-value

      // S10 Radiant Gains (Independent Models: different window/solar performance)
      "i_80",
      "ref_i_80", // Utilization factors (CRITICAL for d_135 calculation)
      "i_98",
      "ref_i_98", // S11 Total envelope loss
      "i_104",
      "ref_i_104", // S12 Total envelope loss

      // Climate Zone (Independent Models: different climate zones)
      "j_19",
      "ref_j_19", // Climate zone

      // Energy Subtotals (Independent Models: different energy performance)
      "k_32",
      "ref_k_32", // S04 Energy subtotals (fix: was "reference_k_32")
      "k_51",
      "ref_k_51", // S07 DHW electrical demand
      "k_64",
      "ref_k_64", // Occupant gains
      "k_79",
      "ref_k_79", // Solar gains
      "k_98",
      "ref_k_98", // S11 Total envelope gain

      // Energy Prices (Independent Models: different utility rates/locations)
      "l_12",
      "ref_l_12", // Electricity price
      "l_13",
      "ref_l_13", // Gas price
      "l_14",
      "ref_l_14", // Propane price
      "l_15",
      "ref_l_15", // Wood price
      "l_16",
      "ref_l_16", // Oil price

      // Utility Billing (Independent Models: different billing periods)
      "m_19",
      "ref_m_19", // Billing period
      "m_43",
      "ref_m_43", // S06 Onsite renewable subtotal
    ];

    const uniqueDependencies = [...new Set(dependencies)];

    // ✅ FIXED: Add listeners correctly for mixed prefixed/unprefixed dependencies
    // console.log(`[S15DEBUG] Setting up ${uniqueDependencies.length} dependencies:`, uniqueDependencies);
    uniqueDependencies.forEach((dep) => {
      addCalculationListener(dep); // Add listener for the dependency as-is
      // console.log(`[S15DEBUG] Added listener for: ${dep}`);

      // Only add ref_ prefix if dependency doesn't already have it
      if (!dep.startsWith("ref_")) {
        addCalculationListener(`ref_${dep}`); // Add ref_ prefixed version for Target deps
        // console.log(`[S15DEBUG] Added listener for: ref_${dep}`);
      }
    });

    // Initial calculation on render
    calculateAll();
    ModeManager.updateCalculatedDisplayValues();
  }

  /**
   * Called when section is rendered
   */
  function onSectionRendered() {
    // Initialize Pattern A Dual-State Module
    ModeManager.initialize();

    // Inject header controls for local testing and troubleshooting
    injectHeaderControls();

    // Register dependencies first
    // Dependencies might rely on other sections being registered, so ensure StateManager is ready
    if (window.TEUI.StateManager) {
      registerDependencies();
    } else {
      console.warn(
        "StateManager not ready during sect15 onSectionRendered dependency registration.",
      );
      // Optionally, retry registration later or listen for a StateManager ready event
    }

    // Initialize event handlers AFTER dependencies are registered
    initializeEventHandlers();

    // Apply validation tooltips to fields
    if (window.TEUI.TooltipManager && window.TEUI.TooltipManager.initialized) {
      setTimeout(() => {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }

    // Initial calculation should now be triggered by the central Calculator.calculateAll
    // or by listeners responding to dependency updates.
  }

  //==========================================================================
  // PUBLIC API
  //==========================================================================

  return {
    // Field definitions and layout - REQUIRED
    getFields: getFields,
    getDropdownOptions: getDropdownOptions,
    getLayout: getLayout,

    // Calculations
    calculateAll: calculateAll,

    // Pattern A Mode management
    switchMode: function (mode) {
      ModeManager.switchMode(mode);
    },

    // Event handling and initialization - REQUIRED
    initializeEventHandlers: initializeEventHandlers,
    onSectionRendered: onSectionRendered,

    // Expose ModeManager for global toggle integration
    ModeManager: ModeManager,
  };
})();

// Event listeners removed in ORDERING branch

// Add an initialized flag to prevent multiple runs of onSectionRendered
if (
  window.TEUI &&
  window.TEUI.SectionModules &&
  window.TEUI.SectionModules.sect15
) {
  window.TEUI.SectionModules.sect15.initialized = false;
}
