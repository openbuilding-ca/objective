/**
 * 4012-Section06.js
 * Renewable Energy (Section 6) - Onsite/Offsite Energy Sources
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

// Section 6: Renewable Energy Module
window.TEUI.SectionModules.sect06 = (function () {
  //==========================================================================
  // DUAL-STATE ARCHITECTURE (Self-Contained State Module - Pattern A)
  //==========================================================================

  // PATTERN 1: Internal State Objects (Self-Contained + Persistent)
  const TargetState = {
    state: {},
    listeners: {},
    initialize: function () {
      const savedState = localStorage.getItem("S06_TARGET_STATE");
      if (savedState) {
        this.state = JSON.parse(savedState);
      } else {
        this.setDefaults();
      }
    },
    setDefaults: function () {
      this.state = {
        // Editable renewable energy fields - all default to 0
        d_44: "0.00", // Photovoltaics (kWh/yr)
        d_45: "0.00", // Wind (kWh/yr)
        d_46: "0.00", // Remove EV Charging from TEUI (kWh/yr)
        i_44: "0.00", // WWS Electricity (kWh/yr)
        i_46: "0.00", // Reserved other removals (kWh/yr)
        k_45: "0.00", // Green Natural Gas (m³)
        m_43: "0.00", // Exterior/Site/Other Loads (kWh/yr)
      };
    },
    saveState: function () {
      localStorage.setItem("S06_TARGET_STATE", JSON.stringify(this.state));
    },
    setValue: function (fieldId, value, source = "user") {
      this.state[fieldId] = value;
      this.saveState();
    },
    getValue: function (fieldId) {
      return this.state[fieldId];
    },

    /**
     * ✅ PHASE 2: Sync from global StateManager after import
     * Bridges global StateManager → isolated TargetState for imported values
     */
    syncFromGlobalState: function (
      fieldIds = ["d_44", "d_45", "d_46", "i_45", "k_45", "i_46", "m_43"],
    ) {
      fieldIds.forEach((fieldId) => {
        const globalValue = window.TEUI.StateManager.getValue(fieldId);
        if (globalValue !== null && globalValue !== undefined) {
          this.setValue(fieldId, globalValue, "imported");
          console.log(
            `S06 TargetState: Synced ${fieldId} = ${globalValue} from global StateManager`,
          );
        }
      });
    },
  };

  const ReferenceState = {
    state: {},
    listeners: {},
    initialize: function () {
      const savedState = localStorage.getItem("S06_REFERENCE_STATE");
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

      // Apply reference values with fallbacks - renewable energy typically 0 for reference
      this.state = {
        d_44: referenceValues.d_44 || "0.00", // Photovoltaics
        d_45: referenceValues.d_45 || "0.00", // Wind
        d_46: referenceValues.d_46 || "0.00", // Remove EV Charging
        i_44: referenceValues.i_44 || "0.00", // WWS Electricity
        i_46: referenceValues.i_46 || "0.00", // Reserved removals
        k_45: referenceValues.k_45 || "0.00", // Green Natural Gas
        m_43: referenceValues.m_43 || "0.00", // Exterior/Site loads
      };

      console.log(
        `S06: Reference defaults loaded from standard: ${currentStandard}`,
      );
    },
    // Listen for changes to the reference standard and reload defaults
    onReferenceStandardChange: function () {
      console.log("S06: Reference standard changed, reloading defaults");
      this.setDefaults();
      this.saveState();
      // Only refresh UI if currently in reference mode
      if (ModeManager.currentMode === "reference") {
        ModeManager.refreshUI();
        calculateAll();
        // ✅ PHASE 3 FIX: Update DOM after calculations (DUAL-STATE-CHEATSHEET requirement)
        ModeManager.updateCalculatedDisplayValues();
      }
    },
    saveState: function () {
      localStorage.setItem("S06_REFERENCE_STATE", JSON.stringify(this.state));
    },
    setValue: function (fieldId, value, source = "user") {
      this.state[fieldId] = value;
      this.saveState();
    },
    getValue: function (fieldId) {
      return this.state[fieldId];
    },

    /**
     * ✅ PHASE 2: Sync from global StateManager after import
     * Bridges global StateManager → isolated ReferenceState for imported values
     */
    syncFromGlobalState: function (
      fieldIds = ["d_44", "d_45", "d_46", "i_45", "k_45", "i_46", "m_43"],
    ) {
      fieldIds.forEach((fieldId) => {
        const refFieldId = `ref_${fieldId}`;
        const globalValue = window.TEUI.StateManager.getValue(refFieldId);
        if (globalValue !== null && globalValue !== undefined) {
          this.setValue(fieldId, globalValue, "imported");
          console.log(
            `S06 ReferenceState: Synced ${fieldId} = ${globalValue} from global StateManager (${refFieldId})`,
          );
        }
      });
    },
  };

  // PATTERN 2: ModeManager Facade (Unified Interface)
  const ModeManager = {
    currentMode: "target",

    initialize: function () {
      TargetState.initialize();
      ReferenceState.initialize();

      // ✅ CSV EXPORT FIX: Publish ALL Reference defaults to StateManager
      if (window.TEUI?.StateManager) {
        ["d_44", "d_45", "d_46", "i_44", "k_45", "i_46", "m_43"].forEach((id) => {
          const refId = `ref_${id}`;
          const val = ReferenceState.getValue(id);
          if (!window.TEUI.StateManager.getValue(refId) && val != null && val !== "") {
            window.TEUI.StateManager.setValue(refId, val, "calculated");
          }
        });
      }

      // Listen for reference standard changes
      if (window.TEUI?.StateManager?.addListener) {
        window.TEUI.StateManager.addListener("d_13", () => {
          ReferenceState.onReferenceStandardChange();
        });
      }
    },

    getCurrentState: function () {
      return this.currentMode === "target" ? TargetState : ReferenceState;
    },

    getValue: function (fieldId) {
      return this.getCurrentState().getValue(fieldId);
    },

    setValue: function (fieldId, value, source = "user") {
      this.getCurrentState().setValue(fieldId, value, source);

      // ✅ CRITICAL STATE MIXING FIX: Proper dual-state publication
      if (this.currentMode === "target") {
        // Target changes to StateManager for downstream sections (unprefixed)
        window.TEUI.StateManager.setValue(fieldId, value, "user-modified");
      } else if (this.currentMode === "reference") {
        // ✅ MISSING: Reference changes must be published with ref_ prefix
        window.TEUI.StateManager.setValue(
          `ref_${fieldId}`,
          value,
          "user-modified",
        );
      }
    },

    switchMode: function (mode) {
      if (this.currentMode === mode) return;
      this.currentMode = mode;
      console.log(`S06: Switched to ${mode.toUpperCase()} mode`);

      // ✅ CORRECTED: Only refresh UI, don't re-run calculations
      // Both engines should already have calculated values stored in StateManager
      this.refreshUI();
      this.updateCalculatedDisplayValues(); // Update calculated field displays only
    },

    refreshUI: function () {
      const sectionElement = document.getElementById("onSiteEnergy");
      if (!sectionElement) return;

      const currentState = this.getCurrentState();
      const fieldsToSync = [
        "d_44",
        "d_45",
        "d_46",
        "i_44",
        "i_46",
        "k_45",
        "m_43",
      ]; // All editable fields

      fieldsToSync.forEach((fieldId) => {
        const stateValue = currentState.getValue(fieldId);
        if (stateValue === undefined || stateValue === null) return;

        const element = sectionElement.querySelector(
          `[data-field-id="${fieldId}"]`,
        );
        if (!element) return;

        // ✅ PATTERN A: Simple contenteditable pattern (like S05)
        if (element.hasAttribute("contenteditable")) {
          element.textContent = stateValue;
        }
      });
    },

    updateCalculatedDisplayValues: function () {
      // Update all calculated fields to show values for current mode
      const calculatedFields = ["d_43", "i_43", "i_45"];
      console.log(
        `🔄 [S06] updateCalculatedDisplayValues: mode=${this.currentMode}`,
      );

      calculatedFields.forEach((fieldId) => {
        const element = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (element) {
          // ✅ FIXED: No fallback to Target values - Reference should show Reference values only
          let value;
          if (this.currentMode === "reference") {
            value = window.TEUI.StateManager.getValue(`ref_${fieldId}`);
            // If Reference value doesn't exist, default to 0 (not Target value)
            if (value === null || value === undefined) {
              value = 0;
            }
          } else {
            value = window.TEUI.StateManager.getValue(fieldId) || 0;
          }

          const formattedValue = window.TEUI.formatNumber
            ? window.TEUI.formatNumber(value, "number-2dp-comma")
            : value;
          element.textContent = formattedValue;
        }
      });
    },

    resetState: function () {
      console.log("S06: Resetting state and clearing localStorage.");

      // Reset both states to their current dynamic defaults
      TargetState.setDefaults();
      TargetState.saveState();
      ReferenceState.setDefaults();
      ReferenceState.saveState();

      console.log("S06: States have been reset to defaults.");

      // After resetting, refresh the UI and recalculate
      this.refreshUI();
      calculateAll();
      this.updateCalculatedDisplayValues(); // Update DOM with calculated values
    },
  };

  // Expose ModeManager for debugging and cross-section communication
  window.TEUI.SectionModules = window.TEUI.SectionModules || {};
  window.TEUI.SectionModules.sect06 = window.TEUI.SectionModules.sect06 || {};
  window.TEUI.SectionModules.sect06.ModeManager = ModeManager;

  //==========================================================================
  // FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  const sectionRows = {
    header: {
      id: "06-ID",
      rowId: "06-ID",
      label: "Renewable Energy Units",
      cells: {
        c: { content: "C", classes: ["section-subheader"] },
        d: { content: "kWh/yr", classes: ["section-subheader"] },
        e: { content: "E", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "G", classes: ["section-subheader"] },
        h: { content: "H", classes: ["section-subheader"] },
        i: { content: "kWh/yr", classes: ["section-subheader"] },
        j: { content: "J", classes: ["section-subheader"] },
        k: { content: "K", classes: ["section-subheader"] },
        l: { content: "L", classes: ["section-subheader"] },
        m: { content: "kWh/yr", classes: ["section-subheader"] },
        n: { content: "N", classes: ["section-subheader"] },
      },
    },
    43: {
      id: "R.1",
      rowId: "R.1",
      label: "Onsite Energy Subtotals",
      cells: {
        c: { label: "Onsite Energy Subtotals" },
        d: { fieldId: "d_43", type: "calculated", value: "0.00" },
        f: { content: "R.5", classes: ["label-prefix"] },
        g: { content: "Offsite Renewable (REC)", classes: ["label-main"] },
        h: {},
        i: { fieldId: "i_43", type: "calculated", value: "0.00" },
        j: { content: "P.5", classes: ["label-prefix"] },
        k: { content: "Exterior/Site/Other Loads", classes: ["label-main"] },
        m: {
          fieldId: "m_43",
          type: "editable",
          value: "0.00",
          classes: ["user-input"],
          tooltip: true, // Default is 0
        },
      },
    },
    44: {
      id: "R.2",
      rowId: "R.2",
      label: "Photovoltaics",
      cells: {
        c: { label: "Photovoltaics" },
        d: {
          fieldId: "d_44",
          type: "editable",
          value: "0.00",
          classes: ["user-input"],
          tooltip: true, // Photovoltaics (no tooltip data available in TooltipManager)
        },
        f: { content: "R.6", classes: ["label-prefix"] },
        g: { content: "WWS Electricity", classes: ["label-main"] },
        h: {},
        i: {
          fieldId: "i_44",
          type: "editable",
          value: "0.00",
          classes: ["user-input"],
          tooltip: true, // WWS Electricity (no tooltip data available)
        },
      },
    },
    45: {
      id: "R.3",
      rowId: "R.3",
      label: "Wind",
      cells: {
        c: { label: "Wind" },
        d: {
          fieldId: "d_45",
          type: "editable",
          value: "0.00",
          classes: ["user-input"],
          tooltip: true, // Wind (no tooltip data available)
        },
        f: { content: "R.7", classes: ["label-prefix"] },
        g: { content: "Green Natural Gas", classes: ["label-main"] },
        h: {},
        i: { fieldId: "i_45", type: "calculated", value: "0.00" },
        j: { content: "ekWh/yr" },
        k: {
          fieldId: "k_45",
          type: "editable",
          value: "0.00",
          classes: ["user-input"],
          tooltip: true, // Green Natural Gas (no tooltip data available)
        },
        l: { content: "m³" },
      },
    },
    46: {
      id: "R.4",
      rowId: "R.4",
      label: "Remove EV Charging from TEUI",
      cells: {
        c: { label: "Remove EV Charging from TEUI" },
        d: {
          fieldId: "d_46",
          type: "editable",
          value: "0.00",
          classes: ["user-input"],
          tooltip: true, // Remove EV Charging (no tooltip data available)
        },
        f: { content: "R.8", classes: ["label-prefix"] },
        g: { content: "Reserved (other removals)", classes: ["label-main"] },
        h: {},
        i: {
          fieldId: "i_46",
          type: "editable",
          value: "0.00",
          classes: ["user-input"],
          tooltip: true, // Reserved other removals (no tooltip data available)
        },
      },
    },
  };

  //==========================================================================
  // ACCESSOR METHODS (Standardized)
  //==========================================================================
  function getFields() {
    const fields = {};
    Object.values(sectionRows).forEach((row) => {
      if (!row.cells) return;
      Object.values(row.cells).forEach((cell) => {
        if (cell.fieldId) {
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.label || row.label,
            defaultValue: cell.value || "",
            section: "onSiteEnergy",
          };
        }
      });
    });
    return fields;
  }

  function getDropdownOptions() {
    return {};
  }

  function getLayout() {
    const layoutRows = [];
    if (sectionRows["header"])
      layoutRows.push(createLayoutRow(sectionRows["header"]));
    Object.keys(sectionRows).forEach((key) => {
      if (key !== "header") layoutRows.push(createLayoutRow(sectionRows[key]));
    });
    return { rows: layoutRows };
  }

  function createLayoutRow(row) {
    const rowDef = { id: row.id, cells: [{}, {}] };
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
    columns.forEach((col) => {
      if (row.cells && row.cells[col]) {
        const cell = { ...row.cells[col] };
        if (col === "c" && !cell.label && row.label) cell.label = row.label;
        rowDef.cells.push(cell);
      } else {
        rowDef.cells.push({});
      }
    });
    return rowDef;
  }

  //==========================================================================
  // EXTERNAL DEPENDENCIES (Clean Interface - Pattern A)
  //==========================================================================

  function getSectionValue(fieldId, isReferenceCalculation = false) {
    // ✅ DUAL-ENGINE PATTERN: Get section-local values based on calculation context
    if (isReferenceCalculation) {
      return ReferenceState.getValue(fieldId);
    } else {
      return TargetState.getValue(fieldId);
    }
  }

  //==========================================================================
  // DUAL-ENGINE CALCULATIONS (Clean Pattern A - Preserve Excel Formulas)
  //==========================================================================

  /**
   * ✅ EXCEL FORMULA PRESERVED: d_43 = d_44 + d_45 + d_46 (Onsite Energy Subtotal)
   */
  function calculateOnSiteSubtotal(isReferenceCalculation = false) {
    const d_44_value =
      window.TEUI.parseNumeric(
        getSectionValue("d_44", isReferenceCalculation),
      ) || 0;
    const d_45_value =
      window.TEUI.parseNumeric(
        getSectionValue("d_45", isReferenceCalculation),
      ) || 0;
    const d_46_value =
      window.TEUI.parseNumeric(
        getSectionValue("d_46", isReferenceCalculation),
      ) || 0;

    // ✅ EXACT EXCEL FORMULA: Sum of all onsite renewable inputs
    const d_43_result = d_44_value + d_45_value + d_46_value;

    if (isReferenceCalculation) {
      console.log(
        `🔵 [S06-REF] Storing ref_d_43 = ${d_43_result} (from d_44=${d_44_value}, d_45=${d_45_value}, d_46=${d_46_value})`,
      );
      window.TEUI.StateManager.setValue("ref_d_43", d_43_result, "calculated");
    } else {
      console.log(
        `🟢 [S06-TAR] Storing d_43 = ${d_43_result} (from d_44=${d_44_value}, d_45=${d_45_value}, d_46=${d_46_value})`,
      );
      window.TEUI.StateManager.setValue("d_43", d_43_result, "calculated");
    }

    // 🚨 TODO: Ensure S06 publishes m_43 (exterior/site loads) to StateManager for downstream sections
    // Currently m_43 is only stored in local state, but S15 needs both m_43 and ref_m_43 for calculations
  }

  /**
   * ✅ EXCEL FORMULA PRESERVED: i_43 = i_44 + i_46 (Offsite Renewable subtotal)
   */
  function calculateOffsiteRenewable(isReferenceCalculation = false) {
    const i_44_value =
      window.TEUI.parseNumeric(
        getSectionValue("i_44", isReferenceCalculation),
      ) || 0;
    const i_46_value =
      window.TEUI.parseNumeric(
        getSectionValue("i_46", isReferenceCalculation),
      ) || 0;

    // ✅ EXACT EXCEL FORMULA: Sum of offsite renewable inputs
    const i_43_result = i_44_value + i_46_value;

    if (isReferenceCalculation) {
      window.TEUI.StateManager.setValue("ref_i_43", i_43_result, "calculated");
    } else {
      window.TEUI.StateManager.setValue("i_43", i_43_result, "calculated");
    }
  }

  /**
   * ✅ EXCEL FORMULA PRESERVED: i_45 = k_45 * 10.3321 (Green Natural Gas energy conversion)
   * 10.3321 is the regulatory-approved conversion factor from m³ to kWh
   */
  function calculateGreenNaturalGasEnergy(isReferenceCalculation = false) {
    const k_45_value =
      window.TEUI.parseNumeric(
        getSectionValue("k_45", isReferenceCalculation),
      ) || 0;

    // ✅ EXACT EXCEL FORMULA: Gas volume * conversion factor
    const i_45_result = k_45_value * 10.3321;

    if (isReferenceCalculation) {
      window.TEUI.StateManager.setValue("ref_i_45", i_45_result, "calculated");
    } else {
      window.TEUI.StateManager.setValue("i_45", i_45_result, "calculated");
    }
  }

  //==========================================================================
  // DUAL-ENGINE ARCHITECTURE (Clean Pattern A)
  //==========================================================================

  /**
   * REFERENCE MODEL ENGINE: Calculate all values using Reference state
   */
  function calculateReferenceModel() {
    try {
      // Run all calculations in Reference context
      calculateOnSiteSubtotal(true);
      calculateGreenNaturalGasEnergy(true);
      calculateOffsiteRenewable(true);

      // console.log("[S06] Reference model calculations complete");
    } catch (error) {
      console.error("[S06] Error in Reference Model calculations:", error);
    }
  }

  /**
   * TARGET MODEL ENGINE: Calculate all values using Target state
   */
  function calculateTargetModel() {
    try {
      // Run all calculations in Target context
      calculateOnSiteSubtotal(false);
      calculateGreenNaturalGasEnergy(false);
      calculateOffsiteRenewable(false);

      // console.log("[S06] Target model calculations complete");
    } catch (error) {
      console.error("[S06] Error in Target Model calculations:", error);
    }
  }

  /**
   * ✅ DUAL-ENGINE: Always run both engines in parallel
   */
  function calculateAll() {
    // console.log("[S06] Running dual-engine calculations...");
    calculateTargetModel(); // Stores unprefixed values in StateManager
    calculateReferenceModel(); // Stores ref_ prefixed values in StateManager
    // console.log("[S06] Dual-engine calculations complete");
  }

  //==========================================================================
  // EVENT HANDLERS (Clean Pattern A)
  //==========================================================================

  /**
   * Initialize all event handlers for this section
   */
  function initializeEventHandlers() {
    // 1. Event handlers for editable fields (all renewable energy inputs)
    const editableFields = [
      "d_44", // Photovoltaics
      "d_45", // Wind
      "d_46", // Remove EV Charging
      "i_44", // WWS Electricity
      "i_46", // Reserved removals
      "k_45", // Green Natural Gas
      "m_43", // Exterior/Site loads
    ];

    editableFields.forEach((fieldId) => {
      const field = document.querySelector(`[data-field-id="${fieldId}"]`);
      if (field && !field.hasEditableListeners) {
        // ✅ CRITICAL: Prevent newlines on Enter key (copy from S05 pattern)
        field.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault(); // Prevent adding a newline
            field.blur(); // Remove focus to trigger the blur event
          }
        });

        field.addEventListener("blur", () => {
          const newValue = field.textContent.trim();

          // ✅ CLEAN: Update via ModeManager
          ModeManager.setValue(fieldId, newValue, "user-modified");
          calculateAll(); // Trigger both engines
          ModeManager.updateCalculatedDisplayValues(); // Update DOM with new calculated values
        });
        field.hasEditableListeners = true;
      }
    });
  }

  /**
   * Creates and injects the Target/Reference toggle and Reset button into the section header.
   */
  function injectHeaderControls() {
    const sectionHeader = document.querySelector(
      "#onSiteEnergy .section-header",
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
    resetButton.innerHTML = "🔄 Reset";
    resetButton.title = "Reset Section 06 to Defaults";
    resetButton.style.cssText =
      "padding: 4px 8px; font-size: 0.8em; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;";

    resetButton.addEventListener("click", (event) => {
      event.stopPropagation();
      if (
        confirm(
          "Are you sure you want to reset all inputs in this section to their defaults? This will clear any saved data for Section 06.",
        )
      ) {
        ModeManager.resetState();
      }
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
    controlsContainer.appendChild(stateIndicator);
    controlsContainer.appendChild(toggleSwitch);
    sectionHeader.appendChild(controlsContainer);
  }

  /**
   * Called when the section is rendered
   * This is a good place to initialize values and run initial calculations
   */
  function onSectionRendered() {
    console.log("S06: Pattern A initialization starting...");

    // 1. Initialize dual-state architecture
    ModeManager.initialize();

    // 2. Initialize event handlers
    initializeEventHandlers();

    // 3. Inject header controls for testing
    injectHeaderControls();

    // 4. Sync initial UI state
    ModeManager.refreshUI();

    // 5. Perform initial calculations for this section
    calculateAll();

    // 6. Update DOM with calculated values
    ModeManager.updateCalculatedDisplayValues();

    // 7. Apply validation tooltips to fields
    if (window.TEUI.TooltipManager && window.TEUI.TooltipManager.initialized) {
      setTimeout(() => {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }

    console.log("S06: Pattern A initialization complete.");
  }

  //==========================================================================
  // PUBLIC API
  //==========================================================================

  return {
    // Field definitions and layout - REQUIRED
    getFields: getFields,
    getDropdownOptions: getDropdownOptions,
    getLayout: getLayout,

    // Event handling and initialization - REQUIRED
    initializeEventHandlers: initializeEventHandlers,
    onSectionRendered: onSectionRendered,

    // Section-specific utility functions - OPTIONAL
    calculateAll: calculateAll,

    // ✅ PATTERN A: Expose ModeManager for cross-section communication
    ModeManager: ModeManager,

    // ✅ PHASE 2: Expose state objects for import sync
    TargetState: TargetState,
    ReferenceState: ReferenceState,
  };
})();
