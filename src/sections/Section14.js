/**
 * 4012-Section14.js
 * TEDI & TELI (Section 14) module for TEUI Calculator 4.011 (this file shows as uncommitted, but it works betetr than the committed one so commit THIS to over-write the committed one)
 *
 * This file contains field definitions, layout templates, and rendering logic
 * specific to the TEDI & TELI section.
 *
 * Follows the consolidated declarative approach where field definitions
 * are integrated directly into the layout structure.
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

// Section 14: TEDI & TELI Module
window.TEUI.SectionModules.sect14 = (function () {
  //==========================================================================
  // DUAL-STATE ARCHITECTURE (Self-Contained State Module)
  //==========================================================================

  // PATTERN A: Internal State Objects (Self-Contained + Persistent)
  const TargetState = {
    state: {},
    listeners: {},
    initialize: function () {
      const savedState = localStorage.getItem("S14_TARGET_STATE");
      if (savedState) {
        this.state = JSON.parse(savedState);
      } else {
        this.setDefaults();
      }
    },
    setDefaults: function () {
      // S14-specific Target defaults - minimal user inputs
      this.state = {
        d_142: "0", // Capital cost premium for HP equipment (only user input)
        // Most other fields are calculated from upstream sections
      };
    },
    saveState: function () {
      localStorage.setItem("S14_TARGET_STATE", JSON.stringify(this.state));
    },
    setValue: function (fieldId, value, source = "user") {
      this.state[fieldId] = value;
      if (source === "user-modified") {
        this.saveState();
      }
    },
    getValue: function (fieldId) {
      return this.state[fieldId];
    },
  };

  const ReferenceState = {
    state: {},
    listeners: {},
    initialize: function () {
      const savedState = localStorage.getItem("S14_REFERENCE_STATE");
      if (savedState) {
        this.state = JSON.parse(savedState);
      } else {
        this.setDefaults();
      }
    },
    setDefaults: function () {
      // ✅ DYNAMIC LOADING: Get current reference standard from dropdown d_13
      const currentStandard =
        window.TEUI?.StateManager?.getValue?.("d_13") || "OBC SB10 5.5-6 Z6";
      const referenceValues =
        window.TEUI?.ReferenceValues?.[currentStandard] || {};

      // Apply reference values to S14 fields with fallbacks
      this.state = {
        d_142: referenceValues.d_142 || "0", // Capital cost premium (typically 0 for reference)
        // Most S14 values are calculated from upstream Reference sections
      };

      console.log(
        `S14: Reference defaults loaded from standard: ${currentStandard}`,
      );
    },
    // MANDATORY: Include onReferenceStandardChange for d_13 changes
    onReferenceStandardChange: function () {
      console.log("S14: Reference standard changed, reloading defaults");
      this.setDefaults();
      this.saveState();
      // Only refresh UI if currently in reference mode
      if (ModeManager.currentMode === "reference") {
        ModeManager.refreshUI();
        calculateAll();
      }
    },
    saveState: function () {
      localStorage.setItem("S14_REFERENCE_STATE", JSON.stringify(this.state));
    },
    setValue: function (fieldId, value, source = "user") {
      this.state[fieldId] = value;
      if (source === "user-modified") {
        this.saveState();
      }
    },
    getValue: function (fieldId) {
      return this.state[fieldId];
    },
  };

  // PATTERN 2: The ModeManager Facade
  const ModeManager = {
    currentMode: "target",
    initialize: function () {
      TargetState.initialize();
      ReferenceState.initialize();

      // MANDATORY: Listen for reference standard changes
      if (window.TEUI?.StateManager?.addListener) {
        window.TEUI.StateManager.addListener("d_13", () => {
          ReferenceState.onReferenceStandardChange();
        });
      }
    },
    switchMode: function (mode) {
      if (
        this.currentMode === mode ||
        (mode !== "target" && mode !== "reference")
      )
        return;
      this.currentMode = mode;
      console.log(`S14: Switched to ${mode.toUpperCase()} mode`);

      this.refreshUI();
      // ✅ CORRECTED: Only refresh UI, don't re-run calculations.
      this.updateCalculatedDisplayValues();
    },

    // Update displayed calculated values based on current mode
    updateCalculatedDisplayValues: function () {
      const calculatedFields = [
        "d_127",
        "h_127",
        "d_128",
        "h_128",
        "d_129",
        "h_129",
        "m_129",
        "d_130",
        "h_130",
        "d_131",
        "h_131",
        "d_132",
        "h_132",
      ];

      calculatedFields.forEach((fieldId) => {
        const element = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (element) {
          let value;
          // ✅ STRICT STATE ISOLATION: No fallbacks.
          if (this.currentMode === "reference") {
            value = window.TEUI.StateManager.getValue(`ref_${fieldId}`);
          } else {
            value = window.TEUI.StateManager.getValue(fieldId);
          }

          // Use a neutral default if the value is not found in the correct state.
          if (value === null || value === undefined) {
            value = "0.00";
          }

          const numericValue = window.TEUI.parseNumeric(value, 0);
          element.textContent = formatNumber(numericValue);
        }
      });
    },
    resetState: function () {
      console.log("S14: Resetting state and clearing localStorage.");
      TargetState.setDefaults();
      TargetState.saveState();
      ReferenceState.setDefaults();
      ReferenceState.saveState();
      console.log("S14: States have been reset to defaults.");

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

      // BRIDGE: For backward compatibility, sync Target changes to global StateManager
      if (this.currentMode === "target") {
        window.TEUI.StateManager.setValue(fieldId, value, "user-modified");
      }
    },
    refreshUI: function () {
      const sectionElement = document.getElementById("tediSummary");
      if (!sectionElement) return;

      const currentState = this.getCurrentState();

      // S14-specific fields to sync (minimal user inputs)
      const fieldsToSync = ["d_142"]; // Only one user input field

      fieldsToSync.forEach((fieldId) => {
        const stateValue = currentState.getValue(fieldId);
        if (stateValue === undefined || stateValue === null) return;

        const element = sectionElement.querySelector(
          `[data-field-id="${fieldId}"]`,
        );
        if (!element) return;

        // ✅ PATTERN A: Simple element updates
        if (element.hasAttribute("contenteditable")) {
          element.textContent = stateValue;
        } else if (element.type === "range") {
          // Handle sliders if any
          element.value = stateValue;
          const textDisplay = element.nextElementSibling;
          if (textDisplay && textDisplay.matches("[data-field-id]")) {
            textDisplay.textContent = stateValue;
          }
        }
      });
    },
  };

  // MANDATORY: Global exposure
  window.TEUI.sect14 = window.TEUI.sect14 || {};
  window.TEUI.sect14.ModeManager = ModeManager;
  window.TEUI.sect14.TargetState = TargetState;
  window.TEUI.sect14.ReferenceState = ReferenceState;

  //==========================================================================
  // HEADER CONTROLS INJECTION
  //==========================================================================

  /**
   * Creates and injects the Target/Reference toggle and Reset button into the section header.
   */
  function injectHeaderControls() {
    const sectionHeader = document.querySelector(
      "#tediSummary .section-header, #tediSummary .section-title",
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
    resetButton.title = "Reset Section 14 to Defaults";
    resetButton.style.cssText =
      "padding: 4px 8px; font-size: 0.8em; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;";

    resetButton.addEventListener("click", (event) => {
      event.stopPropagation();
      if (
        confirm(
          "Are you sure you want to reset all inputs in this section to their defaults? This will clear any saved data for Section 14.",
        )
      ) {
        ModeManager.resetState();
      }
    });

    // Toggle Switch (exact copy from S13)
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

    controlsContainer.appendChild(resetButton);
    controlsContainer.appendChild(stateIndicator);
    controlsContainer.appendChild(toggleSwitch);
    sectionHeader.appendChild(controlsContainer);
  }

  //==========================================================================
  // HELPER FUNCTIONS (Copied from Section 15 Refactor)
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
   * @param {string} [format='number'] - The type of format ('number', 'currency', 'percent', 'W/m2').
   * @returns {string} The formatted number as a string.
   */
  function formatNumber(value, format = "number") {
    if (value === null || value === undefined || isNaN(value)) {
      return "0.00"; // Default numeric format for errors/NaN
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
      // Default number format (kWh, kWh/m2, W/m2)
      return num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  }

  /**
   * Sets a calculated value in the StateManager and updates the corresponding DOM element.
   * @param {string} fieldId - The ID of the field to update.
   * @param {number} rawValue - The raw calculated numeric value.
   * @param {string} [format='number'] - The format type for display.
   */
  function setCalculatedValue(fieldId, rawValue, format = "number") {
    // Handle potential N/A cases first
    if (isNaN(rawValue) || rawValue === null || rawValue === undefined) {
      window.TEUI.StateManager?.setValue(fieldId, "N/A", "calculated");
      const elementNA = document.querySelector(`[data-field-id="${fieldId}"]`);
      if (elementNA) elementNA.textContent = "N/A";
      return; // Stop processing if value is not a valid number
    }

    const formattedValue = formatNumber(rawValue, format);

    // Store raw value as string in StateManager for precision
    window.TEUI.StateManager?.setValue(
      fieldId,
      rawValue.toString(),
      "calculated",
    );

    // Update DOM with formatted value
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (element) {
      element.textContent = formattedValue;
      element.classList.toggle("negative-value", rawValue < 0);
    } else {
      // console.warn(`setCalculatedValue: Element not found for fieldId ${fieldId}`);
    }
  }

  //==========================================================================
  // CONSOLIDATED FIELD DEFINITIONS AND LAYOUT (Update Defaults)
  //==========================================================================

  // Define rows with integrated field definitions
  const sectionRows = {
    // SECTION HEADER
    header: {
      id: "14-ID",
      rowId: "14-ID",
      label: "TEDI & TELI Units",
      cells: {
        c: {
          content: "SECTION 14. TEDI & TELI Targeted",
          classes: ["section-header"],
        },
        d: { content: "kWh/yr", classes: ["section-subheader", "text-center"] },
        e: { content: "", classes: ["section-subheader"] },
        f: { content: "", classes: ["section-subheader"] },
        g: { content: "", classes: ["section-subheader"] },
        h: {
          content: "kWh/m²/yr",
          classes: ["section-subheader", "text-center"],
        },
        i: { content: "", classes: ["section-subheader"] },
        j: { content: "", classes: ["section-subheader"] },
        k: { content: "", classes: ["section-subheader"] },
        l: { content: "", classes: ["section-subheader"] },
        m: { content: "kWh/yr", classes: ["section-subheader", "text-center"] },
        n: { content: "", classes: ["section-subheader"] },
      },
    },

    // Row 127: T.4.0 TED Targeted / T.4.1 TEDI
    127: {
      id: "T.4.0",
      rowId: "127",
      label: "TED Targeted",
      cells: {
        c: { label: "TED Targeted" },
        d: {
          fieldId: "d_127",
          type: "calculated",
          value: "0.00",
          classes: ["calculated-value"],
          section: "tediSummary",
        },
        e: { content: "" },
        f: {
          content: "T.4.1",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: { content: "TEDI", classes: ["label-main", "text-left", "no-wrap"] },
        h: {
          fieldId: "h_127",
          type: "calculated",
          value: "0.00",
          classes: ["calculated-value"],
          section: "tediSummary",
        },
        i: {
          content:
            "Includes V.5 Net Ventilation Losses, Excludes T.7.3 CEDI Ae",
          classes: ["note-text"],
        },
        j: { content: "" },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 128: T.4.2 TED Envelope / T.4.3 TEDI (Excludes Ventilation)
    128: {
      id: "T.4.2",
      rowId: "128",
      label: "TED Envelope (Excludes Ventilation)",
      cells: {
        c: { label: "TED Envelope (Excludes Ventilation)" },
        d: {
          fieldId: "d_128",
          type: "calculated",
          value: "0.00",
          classes: ["calculated-value"],
          section: "tediSummary",
        },
        e: { content: "" },
        f: {
          content: "T.4.3",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: {
          content: "TEDI (Excludes Ventilation)",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: {
          fieldId: "h_128",
          type: "calculated",
          value: "0.00",
          classes: ["calculated-value"],
          section: "tediSummary",
        },
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 129: T.4.4 CED Cooling Load Unmitigated / T.4.5 CEDI Unmitigated
    129: {
      id: "T.4.4",
      rowId: "129",
      label: "CED Cooling Load Unmitigated",
      cells: {
        c: { label: "CED Cooling Load Unmitigated" },
        d: {
          fieldId: "d_129",
          type: "calculated",
          value: "0.00",
          classes: ["calculated-value"],
          section: "tediSummary",
        },
        e: { content: "" },
        f: {
          content: "T.4.5",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: {
          content: "CEDI Unmitigated",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: {
          fieldId: "h_129",
          type: "calculated",
          value: "0.00",
          classes: ["calculated-value"],
          section: "tediSummary",
        },
        i: { content: "" },
        j: {
          content: "T.5.2 less Free Cool. & Vent. Exhaust",
          classes: ["note-text"],
        },
        k: { content: "" },
        l: { content: "" },
        m: {
          fieldId: "m_129",
          type: "calculated",
          value: "0.00",
          classes: ["calculated-value"],
          section: "tediSummary",
        },
        n: { content: "" },
      },
    },

    // Row 130: T.4.6 CEDI Cooling Load (W/m2) / T.4.7 CEDI Mitigated (W/m2)
    130: {
      id: "T.4.6",
      rowId: "130",
      label: "CEDI Cooling Load",
      cells: {
        c: { label: "CEDI Cooling Load" },
        d: {
          fieldId: "d_130",
          type: "calculated",
          value: "0.00",
          classes: ["calculated-value"],
          section: "tediSummary",
        },
        e: { content: "W/m²", classes: ["unit-text"] },
        f: {
          content: "T.4.7",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: {
          content: "CEDI Mitigated",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: {
          fieldId: "h_130",
          type: "calculated",
          value: "0.00",
          classes: ["calculated-value"],
          section: "tediSummary",
        },
        i: { content: "W/m²", classes: ["unit-text"] },
        j: { content: "" },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 131: T.5.1 TEL Total Envelope Heatloss / T.5.2 TELI
    131: {
      id: "T.5.1",
      rowId: "131",
      label: "TEL Total Envelope Heatloss",
      cells: {
        c: { label: "TEL Total Envelope Heatloss" },
        d: {
          fieldId: "d_131",
          type: "calculated",
          value: "0.00",
          classes: ["calculated-value"],
          section: "tediSummary",
        },
        e: { content: "" },
        f: {
          content: "T.5.2",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: { content: "TELI", classes: ["label-main", "text-left", "no-wrap"] },
        h: {
          fieldId: "h_131",
          type: "calculated",
          value: "0.00",
          classes: ["calculated-value"],
          section: "tediSummary",
        },
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 132: T.5.3 CEG Cooling Envelope Heatgain / T.5.4 CEGI
    132: {
      id: "T.5.3",
      rowId: "132",
      label: "CEG Cooling Envelope Heatgain",
      cells: {
        c: { label: "CEG Cooling Envelope Heatgain" },
        d: {
          fieldId: "d_132",
          type: "calculated",
          value: "0.00",
          classes: ["calculated-value"],
          section: "tediSummary",
        },
        e: { content: "" },
        f: {
          content: "T.5.4",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: { content: "CEGI", classes: ["label-main", "text-left", "no-wrap"] },
        h: {
          fieldId: "h_132",
          type: "calculated",
          value: "0.00",
          classes: ["calculated-value"],
          section: "tediSummary",
        },
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
  // ACCESSOR METHODS TO EXTRACT FIELDS AND LAYOUT (Unchanged)
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
        if (cell.fieldId && cell.type) {
          // Create field definition with all relevant properties
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.label || row.label,
            defaultValue: cell.value || "",
            section: cell.section || "tediSummary",
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
        delete cell.dependencies; // Renderer doesn't need these

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
  // CALCULATIONS AND DEPENDENCIES (Refactored)
  //==========================================================================

  /**
   * Register all field dependencies with the StateManager based on FORMULAE-3037.csv
   */
  function registerDependencies() {
    if (!window.TEUI.StateManager) {
      // console.warn("StateManager not available for TEDI/TELI dependency registration");
      return;
    }
    const sm = window.TEUI.StateManager;

    // D127 (TED Targeted): =(I97+I98+I103+M121)-I80
    ["i_97", "i_98", "i_103", "m_121", "i_80"].forEach((dep) =>
      sm.registerDependency(dep, "d_127"),
    );
    // H127 (TEDI): =D127/H15
    sm.registerDependency("d_127", "h_127");
    sm.registerDependency("h_15", "h_127");

    // D128 (TED Envelope): =(I97+I98+I103)-I80
    ["i_97", "i_98", "i_103", "i_80"].forEach((dep) =>
      sm.registerDependency(dep, "d_128"),
    );
    // H128 (TEDI Envelope): =D128/H15
    sm.registerDependency("d_128", "h_128");
    sm.registerDependency("h_15", "h_128");

    // D129 (CED Unmitigated): = K71+K79+K98+D122 (Using K98 for A47)
    sm.registerDependency("k_71", "d_129");
    sm.registerDependency("k_79", "d_129");
    sm.registerDependency("k_98", "d_129"); // Changed from d_132 / k_97/k_103
    sm.registerDependency("d_122", "d_129");

    // H129 (CEDI Unmitigated W/m2): =(D129/8760*1000)/H15
    sm.registerDependency("d_129", "h_129");
    sm.registerDependency("h_15", "h_129");

    // L128 (CED Mitigated kWh/yr): =D129-H124-D123
    sm.registerDependency("d_129", "l_128");
    sm.registerDependency("h_124", "l_128");
    sm.registerDependency("d_123", "l_128");

    // D130 (CEDI Cooling Load W/m2 Unmitigated): =(D129/8760*1000)/H15
    sm.registerDependency("d_129", "d_130");
    sm.registerDependency("h_15", "d_130");

    // H130 (CEDI Mitigated W/m2): =(M129/8760*1000)/H15
    sm.registerDependency("m_129", "h_130");
    sm.registerDependency("h_15", "h_130");

    // d_131: TEL Heatloss (Total Envelope Heatloss)
    // Excel formula: =SUM(I97:I98)+I103 which is i_97 + i_98 + i_103 in app terms
    ["i_97", "i_98", "i_103"].forEach((dep) =>
      sm.registerDependency(dep, "d_131"),
    );
    // h_131: TELI Heatloss Intensity kWh/m²/yr
    sm.registerDependency("d_131", "h_131");
    sm.registerDependency("h_15", "h_131");

    // d_132 & h_132: CEG and CEGI
    // Excel formula: =SUM(K97:K98)+K103
    ["k_97", "k_98", "k_103"].forEach((dep) =>
      sm.registerDependency(dep, "d_132"),
    ); // Added k_103 dependency
    sm.registerDependency("d_132", "h_132");
    sm.registerDependency("h_15", "h_132");
  }

  /**
   * Calculate all values for this section and connected sections
   * This follows the template pattern expected by the system
   */
  function calculateAll() {
    // console.log("[Section14] Running dual-engine calculations...");

    // Run both engines independently
    calculateReferenceModel(); // Calculates Reference values with ref_ prefix
    calculateTargetModel(); // Calculates Target values (existing logic)

    // console.log("[Section14] Dual-engine calculations complete");
  }

  /**
   * REFERENCE MODEL ENGINE: Calculate all values using Reference state
   * Stores results with ref_ prefix to keep separate from Target values
   */
  function calculateReferenceModel() {
    // console.log("[S14 DEBUG] 🔄 Running Reference Model calculations...");

    try {
      // Get Reference values from upstream sections with debugging
      const getRefValue = (fieldId) => {
        const refFieldId = `ref_${fieldId}`;
        const refValue = window.TEUI?.StateManager?.getValue(refFieldId);
        const fallbackValue =
          window.TEUI?.StateManager?.getReferenceValue(fieldId);
        const domValue = getNumericValue(fieldId);

        const finalValue = refValue || fallbackValue || 0; // ✅ FIXED: No Target fallback contamination

        // TEMPORARY DEBUG: Only log problematic values now that we know the issue
        if (!finalValue || isNaN(finalValue)) {
          console.log(
            `[S14 DEBUG] ❌ getRefValue(${fieldId}): ref="${refValue}", fallback="${fallbackValue}", dom="${domValue}", final="${finalValue}"`,
          );
        }

        return finalValue;
      };

      // ✅ CRITICAL FIX: Read ONLY ref_ prefixed values for Reference calculations (no fallbacks)
      const area =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_h_15")) || 1; // Use 1 as fallback to avoid division by zero

      // ✅ CONTAMINATION FIX: Read actual ref_ prefixed values directly from StateManager
      const i97 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_i_97")) || 0; // Thermal Bridge Penalty Heatloss
      const i98 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_i_98")) || 0; // Envelope Totals Heatloss
      const i103 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_i_103")) || 0; // Natural Air Leakage Heatloss
      const m121 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_m_121")) || 0; // Net Htg Season Ventil. Lost
      const i80 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_i_80")) || 0; // Internal heat gains - Occupants
      const k71 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_k_71")) || 0; // Internal gains people
      const k79 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_k_79")) || 0; // Internal gains equip/light
      const k97 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_k_97")) || 0; // Solar
      const k98 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_k_98")) || 0; // Transmission
      const d122 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_d_122")) || 0; // Incoming Cooling Vent Energy from S13
      const h124 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_h_124")) || 0; // Free Cooling Limit from S13
      const d123 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_d_123")) || 0; // Recovered Cooling Vent Energy from S13
      const k103 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_k_103")) || 0; // Natural Air Leakage Heatgain

      // Calculate Reference values with proper numeric safety

      // d_127: TED (Heating Load) - Using original calculation logic with numeric values
      const ref_tedHeatloss_d127 = i97 + i98 + i103 + m121 - i80;

      window.TEUI?.StateManager?.setValue(
        "ref_d_127",
        ref_tedHeatloss_d127.toString(),
        "calculated",
      );

      // h_127: TEDI (Heating Load Intensity kWh/m²/yr)
      const ref_tedi_h127 = area > 0 ? ref_tedHeatloss_d127 / area : 0;
      window.TEUI?.StateManager?.setValue(
        "ref_h_127",
        ref_tedi_h127.toString(),
        "calculated",
      );

      // d_128: TED Envelope (Heating Load - Envelope Only)
      const ref_tediEnvelope_d128 = i97 + i98 + i103 - i80;

      window.TEUI?.StateManager?.setValue(
        "ref_d_128",
        ref_tediEnvelope_d128.toString(),
        "calculated",
      );

      // h_128: TEDI Envelope (Heating Load Intensity - Envelope Only kWh/m²/yr)
      const ref_tediEnvelope_h128 = area > 0 ? ref_tediEnvelope_d128 / area : 0;
      window.TEUI?.StateManager?.setValue(
        "ref_h_128",
        ref_tediEnvelope_h128.toString(),
        "calculated",
      );

      // d_129 and related cooling calculations
      const ref_cedCoolingUnmitigated_d129 = k71 + k79 + k98 + d122;
      window.TEUI?.StateManager?.setValue(
        "ref_d_129",
        ref_cedCoolingUnmitigated_d129.toString(),
        "calculated",
      );

      // h_129: CEDI Unmitigated (kWh/m²/yr)
      const ref_cediUnmitigated_h129 =
        area > 0 ? ref_cedCoolingUnmitigated_d129 / area : 0;
      window.TEUI?.StateManager?.setValue(
        "ref_h_129",
        ref_cediUnmitigated_h129.toString(),
        "calculated",
      );

      // ✅ PHASE 3: ref_m_129 now calculated by S13 (hybrid architecture)
      // S13 calculates ref_m_129 for immediate use in Reference d_117, publishes to S14 for display
      // S14 no longer calculates ref_m_129 to prevent conflicts

      // d_130: CEDI Cooling Load W/m2 Unmitigated
      const ref_cediCoolingWm2_d130 =
        area > 0 ? ((ref_cedCoolingUnmitigated_d129 / 8760) * 1000) / area : 0;
      window.TEUI?.StateManager?.setValue(
        "ref_d_130",
        ref_cediCoolingWm2_d130.toString(),
        "calculated",
      );

      // h_130: CEDI Mitigated W/m2 (depends on S13's ref_m_129)
      const ref_m129_fromS13 =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_m_129")) || 0;
      const ref_cediMitigated_h130 =
        area > 0 ? ((ref_m129_fromS13 / 8760) * 1000) / area : 0;
      window.TEUI?.StateManager?.setValue(
        "ref_h_130",
        ref_cediMitigated_h130.toString(),
        "calculated",
      );

      // d_131: TEL Heatloss
      const ref_telHeatloss_d131 = i97 + i98 + i103;
      window.TEUI?.StateManager?.setValue(
        "ref_d_131",
        ref_telHeatloss_d131.toString(),
        "calculated",
      );

      // h_131: TELI Heatloss Intensity
      const ref_teli_h131 = area > 0 ? ref_telHeatloss_d131 / area : 0;
      window.TEUI?.StateManager?.setValue(
        "ref_h_131",
        ref_teli_h131.toString(),
        "calculated",
      );

      // d_132 & h_132: CEG and CEGI
      const ref_cegHeatgain_d132 = k97 + k98 + k103;
      window.TEUI?.StateManager?.setValue(
        "ref_d_132",
        ref_cegHeatgain_d132.toString(),
        "calculated",
      );

      const ref_cegi_h132 = area > 0 ? ref_cegHeatgain_d132 / area : 0;
      window.TEUI?.StateManager?.setValue(
        "ref_h_132",
        ref_cegi_h132.toString(),
        "calculated",
      );

      // console.log("[Section14] Reference Model calculations stored");
    } catch (error) {
      console.error(
        "[Section14] Error in Reference Model calculations:",
        error,
      );
    }
  }

  /**
   * TARGET MODEL ENGINE: Calculate all values using Application state
   * This is the existing calculation logic
   */
  function calculateTargetModel() {
    // console.log("[Section14] Running Target Model calculations...");

    try {
      // Perform target calculations using existing calculateValues function
      calculateValues();

      // Update reference indicator for h_127
      updateReferenceIndicator();

      // console.log("[Section14] Target Model calculations complete");
    } catch (error) {
      console.error("[Section14] Error in Target Model calculations:", error);
    }
  }

  /**
   * Calculate all values for this section based on FORMULAE-3037.csv
   * This is triggered when dependencies change or on initial load
   */
  function calculateValues() {
    try {
      if (!window.TEUI.StateManager) {
        // console.warn("StateManager not available for TEDI/TELI calculations");
        return;
      }

      // --- Fetch ALL Dependencies FIRST ---
      const area = getNumericValue("h_15");
      const i97 = getNumericValue("i_97"); // Thermal Bridge Penalty Heatloss
      const i98 = getNumericValue("i_98"); // Envelope Totals Heatloss
      const i103 = getNumericValue("i_103"); // Natural Air Leakage Heatloss
      const m121 = getNumericValue("m_121"); // Net Htg Season Ventil. Lost
      const i80 = getNumericValue("i_80"); // Internal heat gains - Occupants
      const k71 = getNumericValue("k_71"); // Internal gains people
      const k79 = getNumericValue("k_79"); // Internal gains equip/light
      const k97 = getNumericValue("k_97"); // Solar
      const k98 = getNumericValue("k_98"); // Transmission
      const d122 = getNumericValue("d_122"); // Incoming Cooling Vent Energy from S13
      const h124 = getNumericValue("h_124"); // Free Cooling Limit from S13
      const d123 = getNumericValue("d_123"); // Recovered Cooling Vent Energy from S13
      const k103 = getNumericValue("k_103"); // Natural Air Leakage Heatgain (Below Grade) - Added for d_132

      // --- Perform Calculations ---

      // d_127: TED (Heating Load)
      const tedHeatloss_d127 = i97 + i98 + i103 + m121 - i80;
      setCalculatedValue("d_127", tedHeatloss_d127);

      // h_127: TEDI (Heating Load Intensity kWh/m²/yr)
      const tedi_h127 = area > 0 ? tedHeatloss_d127 / area : 0;
      setCalculatedValue("h_127", tedi_h127); // Format as default number

      // d_128: TED Envelope (Heating Load - Envelope Only)
      const tediEnvelope_d128 = i97 + i98 + i103 - i80;
      setCalculatedValue("d_128", tediEnvelope_d128);

      // h_128: TEDI Envelope (Heating Load Intensity - Envelope Only kWh/m²/yr)
      const tediEnvelope_h128 = area > 0 ? tediEnvelope_d128 / area : 0;
      setCalculatedValue("h_128", tediEnvelope_h128);

      // Calculate d_129 value needed for h_129, m_129, d_130
      const cedCoolingUnmitigated_d129 = k71 + k79 + k98 + d122;

      // h_129: CEDI Unmitigated (kWh/m²/yr)
      const cediUnmitigated_h129 =
        area > 0 ? cedCoolingUnmitigated_d129 / area : 0;
      setCalculatedValue("h_129", cediUnmitigated_h129);

      // ✅ PHASE 3: m_129 now calculated by S13 (hybrid architecture)
      // S13 calculates m_129 for immediate use in d_117, publishes to S14 for display
      // S14 no longer calculates m_129 to prevent conflicts

      // Set d_129 display value now
      setCalculatedValue("d_129", cedCoolingUnmitigated_d129);

      // d_130: CEDI Cooling Load W/m2 Unmitigated: =(D129/8760*1000)/H15
      const cediCoolingWm2_d130 =
        area > 0 ? ((cedCoolingUnmitigated_d129 / 8760) * 1000) / area : 0;
      setCalculatedValue("d_130", cediCoolingWm2_d130, "W/m2");

      // h_130: CEDI Mitigated W/m2 (depends on S13's m_129)
      const m129_fromS13 = getNumericValue("m_129"); // Read from S13 via StateManager
      const cediMitigated_h130 =
        area > 0 ? ((m129_fromS13 / 8760) * 1000) / area : 0;
      setCalculatedValue("h_130", cediMitigated_h130, "W/m2");

      // d_131: TEL Heatloss (Total Envelope Heatloss)
      // Excel formula: =SUM(I97:I98)+I103 which is i_97 + i_98 + i_103 in app terms
      const telHeatloss_d131 = i97 + i98 + i103;
      setCalculatedValue("d_131", telHeatloss_d131);

      // h_131: TELI Heatloss Intensity W/m2
      const teli_h131 = area > 0 ? telHeatloss_d131 / area : 0;
      setCalculatedValue("h_131", teli_h131);

      // d_132 & h_132: CEG and CEGI
      // Excel formula: =SUM(K97:K98)+K103
      const cegHeatgain_d132 = k97 + k98 + k103; // Added k103
      setCalculatedValue("d_132", cegHeatgain_d132);
      const cegi_h132 = area > 0 ? cegHeatgain_d132 / area : 0;
      setCalculatedValue("h_132", cegi_h132);
    } catch (error) {
      // console.error("Error in TEDI/TELI calculations:", error);
    }
  }

  //==========================================================================
  // REFERENCE INDICATOR CONFIGURATION
  //==========================================================================

  // T-cell comparison configuration for Section 14
  const referenceComparisons = {
    h_127: {
      type: "lower-is-better",
      tCell: "t_127",
      description: "TEDI Target kWh/m²",
    },
  };

  /**
   * Update reference indicator (M and N columns) for h_127
   */
  function updateReferenceIndicator() {
    const fieldId = "h_127";
    const config = referenceComparisons[fieldId];
    if (!config) return;

    // Get current value
    const currentValue =
      window.TEUI?.parseNumeric?.(getFieldValue(fieldId)) || 0;

    // Get reference value
    const referenceValue =
      window.TEUI?.StateManager?.getTCellValue?.(fieldId) ||
      window.TEUI?.StateManager?.getReferenceValue?.(config.tCell);

    const rowId = "127"; // h_127 is on row 127
    const mFieldId = `m_${rowId}`;
    const nFieldId = `n_${rowId}`;

    // If no reference value found, show N/A
    if (!referenceValue || referenceValue === 0) {
      const mElement = document.querySelector(`[data-field-id="${mFieldId}"]`);
      if (mElement) mElement.textContent = "N/A";
      const nElement = document.querySelector(`[data-field-id="${nFieldId}"]`);
      if (nElement) {
        nElement.textContent = "";
        nElement.classList.remove("checkmark", "warning");
      }
      return;
    }

    // Calculate percentage based on comparison type (lower-is-better)
    const percentage = (referenceValue / currentValue) * 100;
    const isGood = currentValue <= referenceValue;

    // Cap percentage at reasonable bounds
    const cappedPercentage = Math.min(Math.max(percentage, 0), 999);

    // Update M column with percentage
    const mElement = document.querySelector(`[data-field-id="${mFieldId}"]`);
    if (mElement) {
      mElement.textContent = formatNumber(cappedPercentage / 100, "percent");
    }

    // Update N column with checkmark/warning
    const nElement = document.querySelector(`[data-field-id="${nFieldId}"]`);
    if (nElement) {
      nElement.textContent = isGood ? "✓" : "✗";
      nElement.classList.remove("checkmark", "warning");
      nElement.classList.add(isGood ? "checkmark" : "warning");
    }
  }

  function getFieldValue(fieldId) {
    if (window.TEUI?.StateManager?.getValue) {
      const stateValue = window.TEUI.StateManager.getValue(fieldId);
      if (stateValue !== null && stateValue !== undefined) {
        return stateValue;
      }
    }
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (element) {
      return element.textContent.trim();
    }
    return null;
  }

  //==========================================================================
  // EVENT HANDLING AND INITIALIZATION
  //==========================================================================

  /**
   * Update the DOM with the current values from the StateManager
   * Note: Redundant if setCalculatedValue handles DOM updates reliably.
   */
  function updateDisplay() {
    if (!window.TEUI.StateManager) return;

    const fields = getFields();

    Object.keys(fields).forEach((fieldId) => {
      const value = window.TEUI.StateManager.getValue(fieldId);
      if (value !== null && value !== undefined) {
        const element = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (element) {
          let format = "number"; // Default
          let rawValue = value; // Assume raw for N/A check

          // Determine format based on field ID
          if (fieldId === "d_129" || fieldId === "h_129") {
            format = "W/m2";
            rawValue = getNumericValue(fieldId);
          } else if (value === "N/A") {
            element.textContent = "N/A";
            return; // Skip formatting
          } else {
            rawValue = getNumericValue(fieldId);
          }

          element.textContent = formatNumber(rawValue, format);
          element.classList.toggle("negative-value", rawValue < 0);
        }
      }
    });
    // console.log("TEDI/TELI display updated");
  }

  /**
   * Initialize event handlers for this section
   * Sets up listeners for changes in dependency values from other sections.
   */
  function initializeEventHandlers() {
    if (!window.TEUI.StateManager) return;
    const sm = window.TEUI.StateManager;

    // Create a list of all unique dependencies needed by this section's calculations
    // Restoring S13 dependencies (d_122, h_124, d_123, m_121)
    // ✅ COMPLETE DUAL-ENGINE DEPENDENCY PAIRS: 100% State Isolation Support
    // Every dependency has Target/Reference pair for "Independent Models" capability
    // Ordered alphabetically for easy scanning and maintenance
    const dependencies = [
      // Additional gains and losses
      "d_122",
      "ref_d_122", // Additional gains
      "d_123",
      "ref_d_123", // Additional parameters

      // Building Geometry (Independent Models: different building sizes)
      "h_15",
      "ref_h_15", // Conditioned area
      "h_124",
      "ref_h_124", // Occupant losses

      // S10 Radiant Gains (Independent Models: different solar performance)
      "i_80",
      "ref_i_80", // Utilization factors

      // S11 Envelope Dependencies (Independent Models: different envelope performance)
      "i_97",
      "ref_i_97", // Envelope loss factors
      "i_98",
      "ref_i_98", // Total envelope loss
      "i_103",
      "ref_i_103", // Additional loss factors

      // S09 Internal Gains (Independent Models: different occupancy/internal loads)
      "k_71",
      "ref_k_71", // Total internal gains (cooling season)

      // Solar and Cross-Section Gains (Independent Models: different solar/radiant performance)
      "k_79",
      "ref_k_79", // Solar gains
      "k_97",
      "ref_k_97", // Additional gain factors
      "k_98",
      "ref_k_98", // Total envelope gain
      "k_103",
      "ref_k_103", // Additional gain factors

      // S13 Mechanical Loads (Independent Models: different HVAC systems)
      "d_122",
      "ref_d_122", // S13 V.3.1
      "d_123",
      "ref_d_123", // S13 V.3.3
      "h_124",
      "ref_h_124", // S13 V.4.2
    ];

    // Remove duplicates
    const uniqueDependencies = [...new Set(dependencies)];

    // ✅ S15 PROVEN PATTERN: Add listeners with complete calculation + UI update
    const addCalculationListener = (key) => {
      sm.addListener(key, () => {
        // ✅ DEBUG: Log critical S13 dependency changes
        if (["d_122", "ref_d_122", "m_121", "ref_m_121"].includes(key)) {
          console.log(
            `[S14 LISTENER] 🔥 ${key} changed - triggering calculateAll() + UI update`,
          );
        }
        calculateAll();
        ModeManager.updateCalculatedDisplayValues();
      });
    };

    // Add listeners for all unique dependencies
    uniqueDependencies.forEach((dep) => {
      addCalculationListener(dep);
    });

    // ✅ CONSISTENT PATTERN: Add climate listeners using same pattern
    const climateFields = ["d_20", "d_21", "h_22", "d_22"];
    climateFields.forEach((field) => {
      addCalculationListener(field);
      addCalculationListener(`ref_${field}`); // Add Reference versions too
    });

    // CRITICAL: Listen for d_13 changes to update reference indicators
    sm.addListener("d_13", () => {
      console.log("[Section14] d_13 changed - updating reference indicators");
      updateReferenceIndicator();
    });

    console.log(
      `[Section14] ✅ Added comprehensive listeners for ${uniqueDependencies.length} dependencies + ${climateFields.length * 2} climate fields`,
    );
  }

  /**
   * Called when section is rendered
   */
  function onSectionRendered() {
    console.log(
      "S14: Section rendered - initializing Pattern A Dual-State Module.",
    );

    // 1. Initialize the ModeManager and its internal states
    ModeManager.initialize();

    // 2. Setup the section-specific toggle switch in the header
    injectHeaderControls();

    // 3. Register dependencies
    if (window.TEUI.StateManager) {
      registerDependencies();
    } else {
      console.warn(
        "StateManager not ready during sect14 onSectionRendered dependency registration.",
      );
    }

    // 4. Initialize event handlers
    initializeEventHandlers();

    // 5. Sync UI to the default (Target) state
    ModeManager.refreshUI();

    // 6. Run initial calculations for both engines
    calculateAll();

    console.log("S14: Pattern A initialization complete.");
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

    // Event handling and initialization - REQUIRED
    initializeEventHandlers: initializeEventHandlers,
    onSectionRendered: onSectionRendered,

    // ✅ CRITICAL: Export ModeManager for FieldManager routing
    ModeManager: ModeManager,
  };
})();

// Event listeners removed in ORDERING branch

// Add an initialized flag to prevent multiple runs
if (
  window.TEUI &&
  window.TEUI.SectionModules &&
  window.TEUI.SectionModules.sect14
) {
  window.TEUI.SectionModules.sect14.initialized = false;
}
