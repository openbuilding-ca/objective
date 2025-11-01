/**
 * 4012-Section13.js.oct25 - OFFLINE VERSION (Taken out of calculation flow Oct 25, 2025)
 *
 * ⚠️ FILE STATUS: DO NOT USE IN ACTIVE CALCULATIONS
 * This file has been renamed to .oct25 and removed from calculation flow.
 *
 * Why offline:
 * - Has BROKEN state isolation (significant state mixing across sections)
 * - Target changes contaminate Reference values
 * - Changes in other sections cause unwanted updates in both Target AND Reference models
 * - Architecture issue deeper than CSV export block (tested, not the cause)
 *
 * What it does well:
 * - Good e_10 initialization (~192.9, close to Excel parity)
 * - Good h_10 value (~93.7)
 * - Has CSV export for Reference fields
 *
 * This file contains the CSV export improvements and m_124 two-stage handling,
 * but the state mixing makes it unsuitable for production. Kept for reference
 * to understand what gives better e_10 initialization.
 *
 * Active file: 4012-Section13.js (backup version with good state isolation)
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

// Create section-specific namespace for global references
window.TEUI.sect13 = window.TEUI.sect13 || {};
window.TEUI.sect13.initialized = false;
window.TEUI.sect13.userInteracted = false;
// Add initialization for recursion flags
window.TEUI.sect13.calculatingFreeCooling = false;
window.TEUI.sect13.freeCalculationInProgress = false;

// Section 13: Mechanical Loads Module
window.TEUI.SectionModules.sect13 = (function () {
  //==========================================================================
  // REFERENCE VALUE PERSISTENCE PATTERN (S11 Pattern)
  //==========================================================================

  // ✅ PHASE 5: Module-level storage to prevent race conditions
  let lastReferenceResults = {};

  //==========================================================================
  // DUAL-STATE ARCHITECTURE (Self-Contained State Module)
  //==========================================================================

  // PATTERN A: Internal State Objects (Self-Contained + Persistent)
  const TargetState = {
    state: {},
    listeners: {},
    initialize: function () {
      const savedState = localStorage.getItem("S13_TARGET_STATE");
      if (savedState) {
        this.state = JSON.parse(savedState);
      } else {
        this.setDefaults();
      }
    },
    setDefaults: function () {
      // SINGLE SOURCE OF TRUTH: Field definitions in sectionRows (per CHEATSHEET)
      // Initialize empty state - values read from field definitions via getFieldDefault()
      this.state = {};
    },
    saveState: function () {
      localStorage.setItem("S13_TARGET_STATE", JSON.stringify(this.state));
    },
    setValue: function (fieldId, value, source = "user") {
      this.state[fieldId] = value;
      if (source === "user" || source === "user-modified") {
        this.saveState();
      }
    },
    getValue: function (fieldId) {
      // CHEATSHEET PATTERN: Fallback to field definitions (single source of truth)
      return this.state[fieldId] !== undefined
        ? this.state[fieldId]
        : getFieldDefault(fieldId);
    },
    // ✅ PHASE 2: Import sync - bridge global StateManager → TargetState
    syncFromGlobalState: function (
      fieldIds = [
        "d_113", // Primary Heating System
        "f_113", // HSPF
        "j_115", // AFUE
        "d_116", // Cooling System
        "j_116", // COPc (cooling efficiency)
        "d_118", // HRV/ERV SRE %
        "g_118", // Ventilation Method
        "l_118", // ACH
        "d_119", // Rate Per Person
        "l_119", // Summer Boost
        "k_120", // Unoccupied Setback %
      ],
    ) {
      fieldIds.forEach((fieldId) => {
        const globalValue = window.TEUI.StateManager.getValue(fieldId);
        if (globalValue !== null && globalValue !== undefined) {
          this.setValue(fieldId, globalValue, "imported");
        }
      });
    },
  };

  const ReferenceState = {
    state: {},
    listeners: {},
    initialize: function () {
      const savedState = localStorage.getItem("S13_REFERENCE_STATE");
      if (savedState) {
        this.state = JSON.parse(savedState);
      } else {
        this.setDefaults();
      }
    },
    setDefaults: function () {
      // CHEATSHEET PATTERN: Initialize from field definitions, then apply Reference overrides
      const currentStandard =
        window.TEUI?.StateManager?.getValue?.("d_13") || "OBC SB10 5.5-6 Z6";
      const referenceValues =
        window.TEUI?.ReferenceValues?.[currentStandard] || {};

      // Step 1: Initialize empty (values come from field definitions via getFieldDefault)
      this.state = {};

      // Step 2: Apply Reference-specific overrides set to run on initialization (note e_10 value 287.0 as of 2025.10.20, where excel is 196.6)
      this.state.d_113 = "Heatpump";
      this.state.f_113 = referenceValues.f_113 || "7.1";
      this.state.d_116 = "Cooling";
      this.state.d_118 = referenceValues.d_118 || "81";
      this.state.d_119 = referenceValues.d_119 || "8.33";
      this.state.g_118 = "Volume by Schedule";
      this.state.j_115 = referenceValues.j_115 || "0.90";
      this.state.j_116 = referenceValues.j_116 || "2.66";
      this.state.l_118 = referenceValues.l_118 || "3.50"; // ACH gets over-written by ReferenceValues.js (expected)
    },
    // MANDATORY: Include onReferenceStandardChange for d_13 changes
    onReferenceStandardChange: function () {
      // ✅ S09 PATTERN: Selective update - preserve user-modified values
      const currentStandard =
        window.TEUI?.StateManager?.getValue?.("d_13") || "OBC SB10 5.5-6 Z6";
      const referenceValues =
        window.TEUI?.ReferenceValues?.[currentStandard] || {};

      // Only update system defaults, preserve user-modified slider values
      // Users can set Reference HSPF to 10 for comparison even if standard default is 7.1
      if (!this.state.f_113_userModified) {
        this.state.f_113 = referenceValues.f_113 || "7.1";
      }
      if (!this.state.j_115_userModified) {
        this.state.j_115 = referenceValues.j_115 || "0.90";
      }
      // Always update system type (this determines calculation methodology)
      this.state.d_113 = referenceValues.d_113 || "Gas";

      this.saveState();

      // Only refresh UI if currently in reference mode
      if (ModeManager.currentMode === "reference") {
        ModeManager.refreshUI();
        calculateAll();
        ModeManager.updateCalculatedDisplayValues();
      }
    },
    saveState: function () {
      localStorage.setItem("S13_REFERENCE_STATE", JSON.stringify(this.state));
    },
    setValue: function (fieldId, value, source = "user") {
      this.state[fieldId] = value;

      // Mark fields as user-modified to preserve during d_13 changes
      if (
        source === "user-modified" &&
        (fieldId === "f_113" || fieldId === "j_115")
      ) {
        this.state[`${fieldId}_userModified`] = true;
      }

      if (source === "user" || source === "user-modified") {
        this.saveState();

        // Trigger recalculations when key Reference fields change
        // BUT ONLY when currently in Reference mode (respects mode isolation)
        // calculateAll() runs BOTH Target and Reference calculations (efficient)
        const criticalFields = [
          "d_113",
          "d_116",
          "f_113",
          "d_118",
          "d_119",
          "j_115",
          "l_118",
        ];
        if (
          criticalFields.includes(fieldId) &&
          ModeManager.currentMode === "reference"
        ) {
          calculateAll(); // Runs both models - efficient and keeps both current
          ModeManager.updateCalculatedDisplayValues();
        }
      }
    },
    getValue: function (fieldId) {
      // CHEATSHEET PATTERN: Check state first (Reference overrides), then field definitions
      return this.state[fieldId] !== undefined
        ? this.state[fieldId]
        : getFieldDefault(fieldId);
    },
    // ✅ PHASE 2: Import sync - bridge global StateManager → ReferenceState
    syncFromGlobalState: function (
      fieldIds = [
        "d_113", // Primary Heating System
        "f_113", // HSPF
        "j_115", // AFUE
        "d_116", // Cooling System
        "j_116", // COPc (cooling efficiency)
        "d_118", // HRV/ERV SRE %
        "g_118", // Ventilation Method
        "l_118", // ACH
        "d_119", // Rate Per Person
        "l_119", // Summer Boost
        "k_120", // Unoccupied Setback %
      ],
    ) {
      // ✅ ReferenceValues overlay fields - should NOT sync from import
      // These maintain standard-based defaults from ReferenceValues.js based on d_13
      const referenceValueFields = ["f_113", "d_118", "j_115"];

      fieldIds.forEach((fieldId) => {
        // Skip ReferenceValues overlay fields - they use ReferenceState.setDefaults()
        if (referenceValueFields.includes(fieldId)) {
          console.log(
            `[S13-REF-SYNC] Skipping ${fieldId} - uses ReferenceValues overlay`,
          );
          return;
        }

        const refFieldId = `ref_${fieldId}`;
        const globalValue = window.TEUI.StateManager.getValue(refFieldId);
        if (globalValue !== null && globalValue !== undefined) {
          this.setValue(fieldId, globalValue, "imported");
        }
      });
    },
  };

  // PATTERN 2: The ModeManager Facade
  const ModeManager = {
    currentMode: "target",
    initialize: function () {
      TargetState.initialize();
      ReferenceState.initialize();

      // ✅ CSV EXPORT FIX: Publish ALL Reference defaults to StateManager
      if (window.TEUI?.StateManager) {
        ["d_113", "f_113", "j_115", "d_116", "d_118", "g_118", "l_118", "d_119", "l_119", "k_120"].forEach((id) => {
          const refId = `ref_${id}`;
          const val = ReferenceState.getValue(id);
          if (!window.TEUI.StateManager.getValue(refId) && val != null && val !== "") {
            window.TEUI.StateManager.setValue(refId, val, "calculated");
          }
        });
      }

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

      this.refreshUI();
      // CRITICAL: Update ghosting for new mode's system
      this.updateConditionalUI();
      // UI toggle is for DISPLAY ONLY - values are already calculated
      // Removed calculateAll() - mode switch should only update display, not trigger calculations
      this.updateCalculatedDisplayValues();
    },

    // Update displayed calculated values based on current mode
    updateCalculatedDisplayValues: function () {
      if (!window.TEUI?.StateManager) return;

      // ✅ FIX (Oct 6, 2025): Field-specific format map matching setFieldValue() calls
      // Mirrors the format types used in calculation functions for consistency
      const fieldFormats = {
        // Percentages (0 decimal places)
        m_115: "percent-0dp", // AFUE efficiency
        m_116: "percent-0dp", // Cooling EUI ratio
        m_117: "percent-0dp", // Cooling intensity
        i_122: "percent-0dp", // Latent load factor
        d_124: "percent-0dp", // Free cooling %

        // Numbers with comma separators (2 decimal places)
        d_114: "number-2dp-comma", // Heating sink
        l_113: "number-2dp-comma", // Heating demand
        d_115: "number-2dp-comma", // Gas volume
        f_115: "number-2dp-comma", // Oil volume
        h_115: "number-2dp-comma", // Gas volume alt
        l_115: "number-2dp-comma", // Heating sink alt
        f_114: "number-2dp-comma", // Heating fuel impact
        l_116: "number-2dp-comma", // Cooling sink
        l_114: "number-2dp-comma", // Cooling sink alt
        d_117: "number-2dp-comma", // Cooling load
        d_120: "number-2dp-comma", // Vent rate L/s
        f_120: "number-2dp-comma", // Vent rate CFM
        h_120: "number-2dp-comma", // Vent rate m³/hr
        d_121: "number-2dp-comma", // Heating vent energy
        i_121: "number-2dp-comma", // Recovered energy
        m_121: "number-2dp-comma", // Net heat loss
        d_122: "number-2dp-comma", // Cooling vent energy
        d_123: "number-2dp-comma", // Vent energy recovered
        h_124: "number-2dp-comma", // Free cooling limit
        m_129: "number-2dp-comma", // CED mitigated
        d_129: "number-2dp-comma", // CED unmitigated

        // Numbers without commas (2 decimal places) - COPs and smaller values
        h_113: "number-2dp", // COP
        j_113: "number-2dp", // COP
        j_114: "number-2dp", // COP
        j_116: "number-2dp", // COP cooling
        f_117: "number-2dp", // Cooling factor
        j_117: "number-2dp", // Cooling value
        f_119: "number-2dp", // Per-person rate
        h_119: "number-2dp", // Per-person rate
        m_124: "number-2dp", // Active cooling days
      };

      const calculatedFields = Object.keys(fieldFormats);

      calculatedFields.forEach((fieldId) => {
        let valueToDisplay;

        if (this.currentMode === "reference") {
          // STRICT MODE: Reference shows ONLY ref_ values
          valueToDisplay = window.TEUI.StateManager.getValue(`ref_${fieldId}`);
          if (valueToDisplay === null || valueToDisplay === undefined) {
            valueToDisplay = "0";
          }
        } else {
          // Target mode: show regular values
          valueToDisplay = window.TEUI.StateManager.getValue(fieldId);
        }

        if (valueToDisplay !== null && valueToDisplay !== undefined) {
          const element = document.querySelector(
            `[data-field-id="${fieldId}"]`,
          );
          if (element && !element.hasAttribute("contenteditable")) {
            const numericValue = window.TEUI.parseNumeric(valueToDisplay);
            if (!isNaN(numericValue)) {
              // ✅ Use field-specific format from map (S10 pattern)
              const formatType = fieldFormats[fieldId] || "number-2dp";
              const formattedValue = window.TEUI.formatNumber(
                numericValue,
                formatType,
              );
              element.textContent = formattedValue;
            }
          }
        }
      });
    },
    resetState: function () {
      delete TargetState.state.f_113_userModified;
      delete TargetState.state.j_115_userModified;
      delete ReferenceState.state.f_113_userModified;
      delete ReferenceState.state.j_115_userModified;

      TargetState.setDefaults();
      TargetState.saveState();
      ReferenceState.setDefaults();
      ReferenceState.saveState();

      this.refreshUI();
      this.updateConditionalUI();
      calculateAll();
      this.updateCalculatedDisplayValues();
    },
    getCurrentState: function () {
      return this.currentMode === "target" ? TargetState : ReferenceState;
    },
    getValue: function (fieldId) {
      return this.getCurrentState().getValue(fieldId);
    },
    setValue: function (fieldId, value, source = "user") {
      this.getCurrentState().setValue(fieldId, value, source);

      // ✅ S10 SUCCESS PATTERN: Mode-aware StateManager publication
      if (this.currentMode === "target") {
        // Target mode: Store unprefixed for downstream consumption
        window.TEUI.StateManager.setValue(fieldId, value, "user-modified");
      } else if (this.currentMode === "reference") {
        // Reference mode writes with ref_ prefix
        window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, source);
      }
    },
    refreshUI: function () {
      const sectionElement = document.getElementById("mechanicalLoads");
      if (!sectionElement) return;

      const currentState = this.getCurrentState();

      // S13-specific fields to sync (including all user-editable fields)
      const fieldsToSync = [
        "d_113",
        "f_113",
        "d_116",
        "j_116",
        "d_118",
        "g_118",
        "d_119",
        "j_115",
        "l_118",
        "l_119",
        "k_120",
      ];

      fieldsToSync.forEach((fieldId) => {
        const stateValue = currentState.getValue(fieldId);

        if (stateValue === undefined || stateValue === null) return;

        const element = sectionElement.querySelector(
          `[data-field-id="${fieldId}"]`,
        );
        if (!element) return;

        // ✅ S10 SUCCESS PATTERN: Proper element detection
        const slider = element.matches('input[type="range"]')
          ? element
          : element.querySelector('input[type="range"]');
        const dropdown = element.matches("select")
          ? element
          : element.querySelector("select");

        if (slider) {
          // ✅ S10 SUCCESS PATTERN: Handle sliders/coefficient fields
          const numericValue = window.TEUI.parseNumeric(stateValue, 0);

          // ✅ S10 SUCCESS PATTERN: Update slider value
          slider.value = numericValue;

          // ✅ S10 SUCCESS PATTERN: Update display (use slider's nextElementSibling)
          const display = slider.nextElementSibling;
          if (display) {
            if (fieldId === "f_113") {
              display.textContent = numericValue.toFixed(1); // HSPF range format (e.g., "12.5")
            } else if (fieldId === "f_117") {
              display.textContent = numericValue.toFixed(1); // SEER range format (e.g., "18.0")
            } else if (
              fieldId === "d_118" ||
              fieldId === "f_119" ||
              fieldId === "k_120"
            ) {
              display.textContent = numericValue.toFixed(0) + "%"; // Percentage slider format (e.g., "89%")
            } else if (fieldId === "f_118") {
              display.textContent = (numericValue * 100).toFixed(0) + "%"; // Decimal efficiency format (e.g., "89%")
            } else {
              display.textContent = stateValue; // Default format
            }
          }
        } else if (dropdown) {
          // Update dropdown selections for mode persistence
          dropdown.value = stateValue;
        } else if (element.getAttribute("contenteditable") === "true") {
          // Update editable fields for mode persistence (d_119, j_115, j_116, l_118)
          element.textContent = stateValue;
        }
      });

      this.updateCalculatedDisplayValues();
    },

    // CRITICAL: Mode-aware conditional UI updates
    updateConditionalUI: function () {
      const currentHeatingSystem = this.getValue("d_113");
      if (currentHeatingSystem) {
        handleHeatingSystemChangeForGhosting(currentHeatingSystem);
      }
    },
  };

  // MANDATORY: Global exposure
  window.TEUI.sect13 = window.TEUI.sect13 || {};
  window.TEUI.sect13.ModeManager = ModeManager;
  window.TEUI.sect13.TargetState = TargetState;
  window.TEUI.sect13.ReferenceState = ReferenceState;

  //==========================================================================
  // HEADER CONTROLS INJECTION
  //==========================================================================

  /**
   * Creates and injects the Target/Reference toggle and Reset button into the section header.
   */
  function injectHeaderControls() {
    const sectionHeader = document.querySelector(
      "#mechanicalLoads .section-header, #mechanicalLoads .section-title",
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
    resetButton.title = "Reset Section 13 to Defaults";
    resetButton.style.cssText =
      "padding: 4px 8px; font-size: 0.8em; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;";

    resetButton.addEventListener("click", (event) => {
      event.stopPropagation();
      if (
        confirm(
          "Are you sure you want to reset all inputs in this section to their defaults? This will clear any saved data for Section 13.",
        )
      ) {
        ModeManager.resetState();
      }
    });

    // Toggle Switch (exact copy from S12)
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
  //==========================================================================

  function getGlobalNumericValue(fieldId) {
    // For values EXTERNAL to this section (from global StateManager)
    const rawValue = window.TEUI?.StateManager?.getValue(fieldId);
    return window.TEUI.parseNumeric(rawValue) || 0;
  }

  /**
   * Get section-local value based on calculation context (not UI mode)
   * @param {string} fieldId - The field identifier
   * @param {boolean} isReferenceCalculation - Whether this is for Reference calculation
   * @returns {string|number} - The value from appropriate state
   */
  function getSectionValue(fieldId, isReferenceCalculation = false) {
    if (isReferenceCalculation) {
      return ReferenceState.getValue(fieldId);
    } else {
      return TargetState.getValue(fieldId);
    }
  }

  /**
   * Safely parses a numeric value from StateManager, using the global parseNumeric.
   * @param {string} fieldId - The ID of the field to retrieve the value for.
   * @returns {number} The parsed numeric value, or 0 if parsing fails.
   */
  function getNumericValue(fieldId) {
    const rawValue = window.TEUI?.StateManager?.getValue(fieldId);
    // Use the global parseNumeric if available
    return window.TEUI?.parseNumeric?.(rawValue) || 0;
  }

  /**
   * 🔧 BUG #5 FIX: Get external dependency value with mode awareness
   * This prevents state mixing when reading values from other sections (S02, S03, S08, S09, S11)
   * Pattern matches Bug #4 fix (lines 2537-2539) for HDD mode-aware reading
   * @param {string} fieldId - The field to read from another section
   * @param {boolean} isReferenceCalculation - Whether reading for Reference model
   * @returns {string|null} - Mode-aware value (ref_ prefixed for Reference, unprefixed for Target)
   */
  function getExternalValue(fieldId, isReferenceCalculation = false) {
    if (isReferenceCalculation) {
      // Reference calculations read ref_ prefixed external values
      const refValue = window.TEUI?.StateManager?.getValue(`ref_${fieldId}`);
      return refValue !== null && refValue !== undefined ? refValue : null;
    } else {
      // Target calculations read unprefixed values
      return window.TEUI?.StateManager?.getValue(fieldId);
    }
  }

  /**
   * Helper to get field value, preferring StateManager but falling back to DOM.
   * @param {string} fieldId
   * @returns {string | null} Value as string or null if not found.
   */
  function getFieldValue(fieldId) {
    if (window.TEUI?.StateManager?.getValue) {
      const value = window.TEUI.StateManager.getValue(fieldId);
      if (value !== null && value !== undefined) {
        return value.toString();
      }
    }
    const element = document.querySelector(
      `[data-field-id="${fieldId}"],[data-dropdown-id="${fieldId}"]`,
    );
    if (element) {
      return element.value !== undefined ? element.value : element.textContent;
    }
    return null;
  }

  /**
   * Sets a calculated value in the StateManager and updates the corresponding DOM element.
   * @param {string} fieldId - The ID of the field to update.
   * @param {number} rawValue - The raw calculated numeric value.
   * @param {string} [formatType='number-2dp-comma'] - The format type string (e.g., 'number-2dp-comma', 'percent-1dp', 'integer').
   */
  function setFieldValue(
    fieldId,
    value,
    formatType = "number-2dp-comma",
    fieldType = "calculated",
  ) {
    const valueToStore =
      value !== null && value !== undefined ? String(value) : "0";

    // ✅ S02 PATTERN: Use current UI mode to determine which state to update
    const currentState =
      ModeManager.currentMode === "target" ? TargetState : ReferenceState;
    currentState.setValue(fieldId, valueToStore, fieldType);

    // ✅ S02 PATTERN: Mode-aware StateManager publication
    if (ModeManager.currentMode === "target") {
      // Target mode: Store unprefixed for downstream consumption
      if (window.TEUI?.StateManager) {
        window.TEUI.StateManager.setValue(fieldId, valueToStore, fieldType);

        // Track StateManager publications (commented out for clean logs)
        // if (["d_122", "m_121", "f_114", "d_114", "j_115", "d_117", "f_119", "h_119"].includes(fieldId)) {
        // }
      }
    } else {
      // Reference mode: Store with ref_ prefix for downstream consumption
      if (window.TEUI?.StateManager) {
        window.TEUI.StateManager.setValue(
          `ref_${fieldId}`,
          valueToStore,
          fieldType,
        );

        // Track StateManager publications (commented out for clean logs)
        // if (["d_122", "m_121", "f_114", "d_114", "j_115", "d_117", "f_119", "h_119"].includes(fieldId)) {
        // }
      }
    }

    // ✅ S13 ENHANCEMENT: Add DOM update with formatting (preserving original setCalculatedValue behavior)
    const formattedValue =
      window.TEUI?.formatNumber?.(value, formatType) ??
      value?.toString() ??
      "N/A";

    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (element) {
      element.textContent = formattedValue;
      element.classList.toggle("negative-value", isFinite(value) && value < 0);
    }
  }

  // --- Integrated Cooling Calculation State & Logic ---

  // T-cell comparison configuration for Section 13
  const referenceComparisons = {
    f_113: {
      type: "higher-is-better",
      tCell: "t_113",
      description: "Heating HSPF",
    },
    j_115: {
      type: "higher-is-better",
      tCell: "t_115",
      description: "AFUE Gas/Oil",
    },
    j_116: {
      type: "higher-is-better",
      tCell: "t_116",
      description: "Cooling COP",
    },
    d_118: {
      type: "higher-is-better",
      tCell: "t_118",
      description: "HRV/ERV SRE %",
    },
    d_119: {
      type: "higher-is-better",
      tCell: "t_119",
      description: "Vent Rate L/s per person",
    },
  };

  /**
   * Update reference indicators for all configured fields
   */
  function updateAllReferenceIndicators() {
    try {
      Object.keys(referenceComparisons).forEach((fieldId) => {
        updateReferenceIndicator(fieldId);
      });
    } catch (error) {
      console.error("Error updating reference indicators:", error);
    }
  }

  /**
   * Update reference indicator (M and N columns) for a specific field
   * @param {string} fieldId - The application field ID to update
   */
  function updateReferenceIndicator(fieldId) {
    const config = referenceComparisons[fieldId];
    if (!config) return;

    const currentValue =
      window.TEUI?.parseNumeric?.(getFieldValue(fieldId)) || 0;

    const referenceValue =
      window.TEUI?.StateManager?.getTCellValue?.(fieldId) ||
      window.TEUI?.StateManager?.getReferenceValue?.(config.tCell);

    const rowId = fieldId.match(/\d+$/)?.[0];
    if (!rowId) return;

    const mFieldId = `m_${rowId}`;
    const nFieldId = `n_${rowId}`;

    if (!referenceValue && referenceValue !== 0) {
      // console.warn(`No reference value found for ${fieldId} - showing N/A`); // Ensure this is commented
      setFieldValue(mFieldId, "N/A", "raw");

      const nElement = document.querySelector(`[data-field-id="${nFieldId}"]`);
      if (nElement) {
        nElement.textContent = "–";
        setElementClass(nFieldId, ""); // No special class
      }
      return;
    }

    try {
      let referencePercent = 1;
      let isGood = true;

      const refValueNum = parseFloat(referenceValue);
      const currentValueNum = parseFloat(currentValue);

      if (config.type === "lower-is-better") {
        // For values where lower is better
        referencePercent =
          currentValueNum > 0 ? refValueNum / currentValueNum : 0;
        isGood = currentValueNum <= refValueNum;
      } else if (config.type === "higher-is-better") {
        // For values where higher is better (e.g., HSPF, AFUE, COP)
        referencePercent = refValueNum > 0 ? currentValueNum / refValueNum : 0;
        isGood = currentValueNum >= refValueNum;
      }

      // Update Column M (Reference %)
      setFieldValue(mFieldId, referencePercent, "percent-0dp");

      // Update Column N (Pass/Fail checkmark)
      const nElement = document.querySelector(`[data-field-id="${nFieldId}"]`);
      if (nElement) {
        nElement.textContent = isGood ? "✓" : "✗";
        setElementClass(nFieldId, isGood ? "checkmark" : "warning");
      }
    } catch (error) {
      console.error(
        `Error updating reference indicators for ${fieldId}:`,
        error,
      );
    }
  }

  //==========================================================================
  // CONSOLIDATED FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  /**
   * IMPORTANT: The section layout must follow these rules:
   * 1. Unit subheader MUST be the first row in the array with id "SECTXX-ID" or "header"
   * 2. Field definitions should be embedded directly in the cell objects
   * 3. Each row must have a unique ID that matches its Excel row number or label
   * 4. Cells must align perfectly with Excel column positions A-N
   * 5. Empty cells still need empty objects {} as placeholders to maintain alignment
   */

  // Define rows with integrated field definitions
  const sectionRows = {
    // UNIT SUBHEADER
    header: {
      id: "S13-ID",
      rowId: "S13-ID",
      label: "Mechanical Loads",
      cells: {
        c: {
          content: "SECTION 13. Mechanical Loads",
          classes: ["section-subheader", "section-title", "flex-cell"],
        },
        d: {
          content: "kWh/yr",
          classes: ["section-subheader", "flex-cell", "align-center"],
        },
        e: { content: "", classes: ["section-subheader", "flex-cell"] },
        f: { content: "", classes: ["section-subheader", "flex-cell"] },
        g: { content: "", classes: ["section-subheader", "flex-cell"] },
        h: { content: "", classes: ["section-subheader", "flex-cell"] },
        i: { content: "", classes: ["section-subheader", "flex-cell"] },
        j: {
          content: "kWh/yr",
          classes: ["section-subheader", "flex-cell", "align-center"],
        },
        k: {
          content: "Reference",
          classes: ["section-subheader", "flex-cell", "align-center"],
        },
        l: { content: "", classes: ["section-subheader", "flex-cell"] },
        m: { content: "", classes: ["section-subheader", "flex-cell"] },
        n: { content: "", classes: ["section-subheader", "flex-cell"] },
      },
    },

    // ROW 113: Primary Heating System
    113: {
      id: "M.1.0",
      rowId: "M.1.0",
      label: "Primary Heating System",
      cells: {
        c: { label: "Primary Heating System", classes: ["flex-cell"] },
        d: {
          fieldId: "d_113",
          type: "dropdown",
          dropdownId: "dd_d_113",
          value: "Heatpump",
          section: "mechanicalLoads",
          tooltip: true, // Select Primary Heating System
          options: [
            { value: "Heatpump", name: "Heatpump" },
            { value: "Electricity", name: "Electricity" },
            { value: "Gas", name: "Gas" },
            { value: "Oil", name: "Oil" },
          ],
        },
        e: {
          content: "M.1.1 HSPF",
          classes: ["label-prefix"],
        },
        f: {
          fieldId: "f_113",
          type: "coefficient_slider", // ✅ Fixed: was "coefficient" (no handler), now "coefficient_slider"
          value: "12.5", // Default value
          min: 3.5, // Min value
          max: 20, // Max value
          step: 0.1, // Step increment
          section: "mechanicalLoads",
          tooltip: true, // HSPF Dictates COP, CEER
          // Removed classes: ["user-input", "editable"]
        },
        g: {
          content: "M.1.2 COPheat",
          classes: ["label-prefix"],
        },
        h: {
          fieldId: "h_113",
          type: "calculated",
          value: "3.66",
          section: "mechanicalLoads",
          dependencies: ["d_113", "f_113"],
        },
        i: {
          content: "M.1.3 COPcool",
          classes: ["label-prefix"],
        },
        j: {
          fieldId: "j_113",
          type: "calculated",
          value: "2.7",
          section: "mechanicalLoads",
          dependencies: ["h_113"],
        },
        k: {
          content: "M.1.4 Sink",
          classes: ["label-prefix"],
        },
        l: {
          fieldId: "l_113",
          type: "calculated",
          value: "86,642.65",
          section: "mechanicalLoads",
          dependencies: ["d_113", "d_114", "h_113"],
        },
        m: {
          fieldId: "m_113",
          type: "calculated",
          value: "176%",
          section: "mechanicalLoads",
          dependencies: ["f_113"],
        },
        n: {},
      },
    },

    // ROW 114: Heating System Demand
    114: {
      id: "M.2.1",
      rowId: "M.2.1",
      label: "Heating System Demand",
      cells: {
        c: { label: "Heating System Demand", classes: ["flex-cell"] },
        d: {
          fieldId: "d_114",
          type: "calculated",
          value: "32,529.13",
          section: "mechanicalLoads",
          dependencies: ["d_113", "d_127", "h_113"],
        },
        e: {
          content: "Net Emissions",
          classes: ["label-prefix", "flex-cell"],
        },
        f: {
          fieldId: "f_114",
          type: "calculated",
          value: "0.00",
          section: "mechanicalLoads",
          dependencies: ["d_113", "f_115", "l_30", "h_115", "l_28"],
        },
        g: {
          content: "kgCO2e/yr",
          classes: ["label", "flex-cell"],
        },
        h: {},
        i: {
          content: "M.1.5. CEER",
          classes: ["label-prefix"],
        },
        j: {
          fieldId: "j_114",
          type: "calculated",
          value: "9.1",
          section: "mechanicalLoads",
          dependencies: ["j_113"],
        },
        k: {
          content: "M.1.6 Sink",
          classes: ["label-prefix"],
        },
        l: {
          fieldId: "l_114",
          type: "calculated",
          value: "5,020.63",
          section: "mechanicalLoads",
          dependencies: ["d_113", "d_116", "d_117", "j_113"],
        },
        m: {},
        n: {},
      },
    },

    // ROW 115: Heating Fuel Impact
    115: {
      id: "M.2.2",
      rowId: "M.2.2",
      label: "Heating Fuel Impact (ekWh/yr)",
      cells: {
        c: { label: "Heating Fuel Impact (ekWh/yr)", classes: ["flex-cell"] },
        d: {
          fieldId: "d_115",
          type: "calculated",
          value: "0.00",
          section: "mechanicalLoads",
          dependencies: ["d_113", "d_127", "j_115"],
        },
        e: {
          content: "M.2.3 Oil l/yr",
          classes: ["label-prefix"],
        },
        f: {
          fieldId: "f_115",
          type: "calculated",
          value: "0.00",
          section: "mechanicalLoads",
          dependencies: ["d_115"],
        },
        g: {
          content: "M.2.4 Gas m3/yr",
          classes: ["label-prefix"],
        },
        h: {
          fieldId: "h_115",
          type: "calculated",
          value: "0.00",
          section: "mechanicalLoads",
          dependencies: ["d_115"],
        },
        i: {
          content: "M.2.5 AFUE",
          classes: ["label-prefix"],
        },
        j: {
          fieldId: "j_115",
          type: "editable",
          value: "0.90",
          section: "mechanicalLoads",
        },
        k: {
          content: "M.2.5 Exhaust",
          classes: ["label-prefix"],
        },
        l: {
          fieldId: "l_115",
          type: "calculated",
          value: "0.00",
          section: "mechanicalLoads",
          dependencies: ["d_113", "d_115", "d_114"],
        },
        m: {
          fieldId: "m_115",
          type: "calculated",
          value: "109%",
          section: "mechanicalLoads",
          dependencies: ["j_115"],
        },
        n: {},
      },
    },

    // ROW 116: Heatpump or Dedicated Cooling System
    116: {
      id: "M.3.0",
      rowId: "M.3.0",
      label: "Heatpump or Dedicated Cooling System",
      cells: {
        c: {
          label: "Heatpump or Dedicated Cooling System",
          classes: ["flex-cell"],
        },
        d: {
          fieldId: "d_116",
          type: "dropdown",
          dropdownId: "dd_d_116",
          value: "Cooling",
          section: "mechanicalLoads",
          tooltip: true, // Cooling Provided?
          options: [
            { value: "Cooling", name: "Cooling" },
            { value: "No Cooling", name: "No Cooling" },
          ],
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {
          content: "M.3.3 COPcool",
          classes: ["label-prefix"],
        },
        j: {
          fieldId: "j_116",
          type: "editable",
          value: "2.66",
          section: "mechanicalLoads",
          classes: ["user-input", "editable"],
        },
        k: {
          content: "M.3.4 Sink",
          classes: ["label-prefix"],
        },
        l: {
          fieldId: "l_116",
          type: "calculated",
          value: "5,009.95",
          section: "mechanicalLoads",
          dependencies: ["d_116", "d_117", "j_116"],
        },
        m: {
          fieldId: "m_116",
          type: "calculated",
          value: "124%",
          section: "mechanicalLoads",
          dependencies: ["j_116"],
        },
        n: {},
      },
    },

    // ROW 117: Heatpump Cool Elect. Load
    117: {
      id: "M.3.5",
      rowId: "M.3.5",
      label: "Heatpump Cool Elect. Load",
      cells: {
        c: { label: "Heatpump Cool Elect. Load", classes: ["flex-cell"] },
        d: {
          fieldId: "d_117",
          type: "calculated",
          value: "3,018.04",
          section: "mechanicalLoads",
          dependencies: ["d_116", "d_113", "m_129", "j_113", "j_116"],
        },
        e: {},
        f: {
          fieldId: "f_117",
          type: "calculated",
          value: "2.11",
          section: "mechanicalLoads",
          dependencies: ["d_117", "h_15"],
        },
        g: {
          content: "kWh/m2/yr",
          classes: ["label"],
        },
        h: {},
        i: {
          content: "M.3.6 CEER",
          classes: ["label-prefix"],
        },
        j: {
          fieldId: "j_117",
          type: "calculated",
          value: "9.1",
          section: "mechanicalLoads",
          dependencies: ["j_116"],
        },
        k: {},
        l: {},
        m: {
          fieldId: "m_117",
          type: "calculated",
          value: "4%",
          section: "mechanicalLoads",
          dependencies: ["f_117"],
        },
        n: {},
      },
    },

    // ROW 118: HRV/ERV/MVHR Efficiency (SRE)
    118: {
      id: "V.1.1",
      rowId: "V.1.1",
      label: "HRV/ERV/MVHR Efficiency (SRE)",
      cells: {
        c: { label: "HRV/ERV/MVHR Efficiency (SRE)", classes: ["flex-cell"] },
        d: {
          fieldId: "d_118",
          type: "percentage",
          value: "89",
          min: 0,
          max: 100,
          step: 1,
          section: "mechanicalLoads",
          tooltip: true, // Typ. Range 50-90%
        },
        e: {},
        f: {
          content: "Ventil. Method",
          classes: ["label-prefix"],
        },
        g: {
          fieldId: "g_118",
          type: "dropdown",
          dropdownId: "dd_g_118",
          value: "Volume by Schedule",
          section: "mechanicalLoads",
          tooltip: true, // Select Ventilation Method
          options: [
            { value: "Volume Constant", name: "Volume Constant" }, // ADDED MISSING
            { value: "Volume by Schedule", name: "Volume by Schedule" },
            { value: "Occupant Constant", name: "Occupant Constant" },
            { value: "Occupant by Schedule", name: "Occupant by Schedule" },
          ],
        },
        h: {},
        i: {
          content: "V.1.3",
          classes: ["label-prefix"],
        },
        j: {
          content: "ACH", //(Only if Volume-Based)
          classes: ["label"],
        },
        k: {},
        l: {
          fieldId: "l_118",
          type: "editable",
          value: "3",
          section: "mechanicalLoads",
          tooltip: true, // ACH Value
        },
        m: {
          fieldId: "m_118",
          type: "calculated",
          value: "162%",
          section: "mechanicalLoads",
          dependencies: ["d_118"],
        },
        n: {},
      },
    },

    // ROW 119: Per Person Ventilation Rate
    119: {
      id: "V.1.4",
      rowId: "V.1.4",
      label: "Per Person Ventilation Rate",
      cells: {
        c: { label: "Per Person Ventilation Rate", classes: ["flex-cell"] },
        d: {
          fieldId: "d_119",
          type: "editable",
          value: "14.00", // RESTORED default value
          section: "mechanicalLoads",
          tooltip: true, // Ventilation Guidance
        },
        e: {
          content: "l/s per person",
          classes: ["label"],
        },
        f: {
          fieldId: "f_119",
          type: "calculated",
          value: "29.66",
          section: "mechanicalLoads",
          dependencies: ["d_119"],
        },
        g: {
          content: "cfm",
          classes: ["label"],
        },
        h: {
          fieldId: "h_119",
          type: "calculated",
          value: "50.40",
          section: "mechanicalLoads",
          dependencies: ["d_119"],
        },
        i: {
          content: "m3/hr",
          classes: ["label"],
        },
        j: { content: "V.1.7", classes: ["label-prefix"] }, // New Label ID
        k: {
          content: "Summer Boost",
          classes: ["label"],
        },
        l: {
          fieldId: "l_119",
          type: "dropdown",
          dropdownId: "dd_l_119",
          value: "None",
          section: "mechanicalLoads",
          tooltip: true, // Ventilation Boost Rate
          options: [
            // CORRECTED OPTIONS
            { value: "None", name: "None" },
            { value: "1.10", name: "1.10x" },
            { value: "1.20", name: "1.20x" },
            { value: "1.30", name: "1.30x" },
            { value: "1.40", name: "1.40x" },
            { value: "1.50", name: "1.50x" },
            { value: "1.60", name: "1.60x" },
            { value: "1.70", name: "1.70x" },
            { value: "1.80", name: "1.80x" },
            { value: "1.90", name: "1.90x" },
            { value: "2.00", name: "2.00x" },
          ],
        },
        m: {
          fieldId: "m_119",
          type: "calculated",
          value: "112%",
          section: "mechanicalLoads",
          dependencies: ["d_119"],
        },
        n: {},
      },
    },

    // ROW 120: Volumetric Ventilation Rate
    120: {
      id: "V.1.6",
      rowId: "V.1.6",
      label: "Volumetric Ventilation Rate",
      cells: {
        c: { label: "Volumetric Ventilation Rate", classes: ["flex-cell"] },
        d: {
          fieldId: "d_120",
          type: "calculated",
          value: "3,333.33",
          section: "mechanicalLoads",
          dependencies: [
            "h_118",
            "d_63",
            "d_119",
            "i_63",
            "j_63",
            "l_118",
            "d_105",
          ],
        },
        e: {
          content: "l/s",
          classes: ["label"],
        },
        f: {
          fieldId: "f_120",
          type: "calculated",
          value: "7,062.93",
          section: "mechanicalLoads",
          dependencies: ["d_120"],
        },
        g: {
          content: "cfm",
          classes: ["label"],
        },
        h: {
          fieldId: "h_120",
          type: "calculated",
          value: "12,000.00",
          section: "mechanicalLoads",
          dependencies: ["d_120"],
        },
        i: {
          content: "m3/hr",
          classes: ["label"],
        },
        j: { content: "V.1.7", classes: ["label-prefix"] }, // Label for k_120 Unoccupied Ventilation Setback
        k: {
          fieldId: "k_120",
          type: "percentage",
          value: "90",
          min: 0, // ADD min for standard slider behavior
          max: 100, // ADD max
          step: 10, // ADD step (e.g., 10 for 10% increments, or 1 for 1%)
          section: "mechanicalLoads",
          tooltip: true, // Unoccupied Ventilation Setback %
          classes: ["col-small"],
        },
        l: { content: "Unoccupied Setback", classes: ["label"] }, // Unoccupied Setback label
        m: {},
        n: {},
      },
    },

    // ROW 121: Heating Season Ventil. Energy
    121: {
      id: "V.2.1",
      rowId: "V.2.1",
      label: "Heating Season Ventil. Energy",
      cells: {
        c: { label: "Heating Season Ventil. Energy", classes: ["flex-cell"] },
        d: {
          fieldId: "d_121",
          type: "calculated",
          value: "445,280.00",
          section: "mechanicalLoads",
          dependencies: ["d_120", "d_20"],
        },
        e: {
          content: "V.2.2",
          classes: ["label-prefix", "flex-cell"],
        },
        f: {
          content: "Htg. Vent. Energy Recovered",
          classes: ["label", "flex-cell"],
        },
        g: {},
        h: {},
        i: {
          fieldId: "i_121",
          type: "calculated",
          value: "396,299.20",
          section: "mechanicalLoads",
          dependencies: ["d_121", "d_118"],
        },
        j: {
          content: "V.2.3",
          classes: ["label-prefix", "flex-cell"],
        },
        k: {
          content: "Net Htg. Vent. Losses", //Net Heating Season Ventilation Losses
          classes: ["label", "flex-cell"],
        },
        l: {},
        m: {
          fieldId: "m_121",
          type: "calculated",
          value: "48,980.80",
          section: "mechanicalLoads",
          dependencies: ["d_121", "i_121"],
        },
        n: {},
      },
    },

    // ROW 122: Incoming Cooling Season Ventil. Energy - References Cooling calculations
    122: {
      id: "V.3.1",
      rowId: "V.3.1",
      label: "Incoming Cooling Season Ventil. Energy",
      cells: {
        c: {
          label: "Incoming Cooling Season Ventil. Energy",
          classes: ["flex-cell"],
        },
        d: {
          fieldId: "d_122",
          type: "calculated",
          value: "30,257.37",
          section: "mechanicalLoads",
          dependencies: [
            "h_118",
            "l_119",
            "d_120",
            "d_21",
            "i_63",
            "j_63",
            "i_122",
          ],
        },
        e: {
          content: "V.3.2",
          classes: ["label-prefix", "flex-cell"],
        },
        f: {
          content: "Latent Load Factor (Calc'd)",
          classes: ["label", "flex-cell"],
        },
        g: {},
        h: {},
        i: {
          fieldId: "i_122",
          type: "calculated",
          value: "159%",
          section: "mechanicalLoads",
          dependencies: ["cooling_latentLoadFactor"],
        },
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    // ROW 123: Outgoing Cooling Season Ventil. Energy
    123: {
      id: "V.3.3",
      rowId: "V.3.3",
      label: "Outgoing Cooling Season Ventil. Energy",
      cells: {
        c: {
          label: "Outgoing Cooling Season Ventil. Energy",
          classes: ["flex-cell"],
        },
        d: {
          fieldId: "d_123",
          type: "calculated",
          value: "26,929.06",
          section: "mechanicalLoads",
          dependencies: ["d_118", "d_122"],
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    // ROW 124: Ventilation Free Cooling/Vent Capacity - References Cooling calculations
    124: {
      id: "V.4.1",
      rowId: "V.4.1",
      label: "Ventilation Free Cooling/Vent Capacity",
      cells: {
        c: {
          label: "Ventilation Free Cooling/Vent Capacity",
          classes: ["flex-cell"],
        },
        d: {
          fieldId: "d_124",
          type: "calculated",
          value: "54%",
          section: "mechanicalLoads",
          dependencies: ["h_124", "d_129"],
        },
        e: {
          content: "V.4.2",
          classes: ["label-prefix", "flex-cell"],
        },
        f: {
          content: "Free Cooling Limit",
          classes: ["label", "flex-cell"],
        },
        g: {},
        h: {
          fieldId: "h_124",
          type: "calculated",
          value: "37,322.60",
          section: "mechanicalLoads",
          dependencies: ["cooling_freeCoolingLimit", "m_19", "g_118", "k_120"], // Added g_118, k_120
        },
        i: {
          content: "kWh/yr",
          classes: ["label", "flex-cell"],
        },
        j: {},
        k: {
          content: "Days Active Cooling Req'd",
          classes: ["label", "flex-cell"],
        },
        l: {},
        m: {
          fieldId: "m_124",
          type: "calculated",
          value: "96",
          section: "mechanicalLoads",
          tooltip: true, // Negative Values
          dependencies: ["cooling_daysActiveCooling", "h_124"], // Added h_124 dependency
        },
        n: {},
      },
    },
  };

  //==========================================================================
  // ACCESSOR METHODS
  //==========================================================================

  /**
   * ✅ NEW HELPER: Get a field's default value from the single source of truth (sectionRows)
   * This is part of the "Phase 5: Default Values Anti-Pattern" fix.
   * @param {string} fieldId - The ID of the field to get the default for.
   * @returns {string | null} The default value, or null if not found.
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
    return null; // Return null if no default value is found
  }

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
            section: cell.section || "mechanicalLoads",
          };

          // Copy additional field properties if they exist
          if (cell.dropdownId)
            fields[cell.fieldId].dropdownId = cell.dropdownId;
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

    const layoutRows = [];

    if (sectionRows["header"]) {
      layoutRows.push(createLayoutRow(sectionRows["header"]));
    }

    Object.entries(sectionRows).forEach(([key, row]) => {
      if (key !== "header") {
        layoutRows.push(createLayoutRow(row));
      }
    });

    return { rows: layoutRows };
  }

  /**
   * Helper function to convert a row definition to the layout format
   */
  function createLayoutRow(row) {
    const rowDef = {
      id: row.id,
      cells: [
        {}, // Empty column A
        {}, // ID column B (auto-populated)
      ],
    };

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

        if (!cell.classes) {
          cell.classes = ["flex-cell"];
        } else if (!cell.classes.includes("flex-cell")) {
          cell.classes.push("flex-cell");
        }

        if (col === "c") {
          if (cell.type === "label" && cell.content && !cell.label) {
            cell.label = cell.content;
            delete cell.type;
            delete cell.content;
          } else if (!cell.label && !cell.content && row.label) {
            cell.label = row.label;
          }
        }

        // Remove field-specific properties not needed for rendering
        delete cell.options;
        delete cell.section;
        delete cell.dependencies;
        delete cell.value; // Default value not needed for layout

        rowDef.cells.push(cell);
      } else {
        if (col === "c" && !row.cells?.c && row.label) {
          rowDef.cells.push({ label: row.label, classes: ["flex-cell"] });
        } else {
          rowDef.cells.push({ classes: ["flex-cell"] });
        }
      }
    });

    return rowDef;
  }

  //==========================================================================
  // EVENT HANDLING AND CALCULATIONS
  //==========================================================================

  /**
   * Initialize all event handlers for this section
   */
  function initializeEventHandlers() {
    const sectionElement = document.getElementById("mechanicalLoads");
    if (!sectionElement) {
      // console.warn("Section 13 container #mechanicalLoads not found. Cannot initialize handlers.");
      return;
    }

    // --- Standard Editable Field Handlers ---
    const editableFields = sectionElement.querySelectorAll(
      ".editable.user-input",
    );
    editableFields.forEach((field) => {
      // Prevent adding listeners multiple times
      if (!field.hasEditableListeners) {
        field.setAttribute("contenteditable", "true");
        // Use standard blur handler
        field.addEventListener("blur", handleEditableBlur);
        // Add keydown listener to handle Enter key
        field.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault(); // Prevent adding newline
            e.stopPropagation(); // Prevent event bubbling
            this.blur(); // Trigger blur to save value
          }
        });
        field.hasEditableListeners = true; // Mark as having listeners attached
      }
    });

    // --- StateManager Listeners ---
    if (window.TEUI && window.TEUI.StateManager) {
      const sm = window.TEUI.StateManager; // Alias for brevity

      // Add StateManager listener for d_113 to eliminate "cooling bump" requirement
      // This ensures complete calculation cycle + downstream updates (A7 proven pattern)
      sm.addListener("d_113", (newValue, oldValue) => {
        // Apply ghosting for new heating system
        handleHeatingSystemChangeForGhosting(newValue);

        // ✅ PATTERN 2: Run dual-engine calculations for proper Target/Reference state handling
        calculateAll();
        ModeManager.updateCalculatedDisplayValues(); // ✅ CRITICAL: Update DOM after calculations
        if (
          window.TEUI &&
          window.TEUI.StateManager &&
          typeof window.TEUI.StateManager.updateTEUICalculations === "function"
        ) {
          window.TEUI.StateManager.updateTEUICalculations(
            "S13_d113_fuel_switch",
          );
        }
      });

      // ✅ Reference mode d_113 changes are now handled by ReferenceState.setValue()
      // When user changes dropdowns in Reference mode, ReferenceState.setValue() triggers
      // calculateAll() and updateCalculatedDisplayValues() for d_113 changes

      // Add direct HSPF slider handler (S11 proven pattern)
      const f113Slider = document.querySelector(
        'input[type="range"][data-field-id="f_113"]',
      );
      if (f113Slider && !f113Slider.hasSliderListener) {
        // Input event for display updates only (no calculations)
        f113Slider.addEventListener("input", function () {
          const hspfValue = parseFloat(this.value);
          if (isNaN(hspfValue)) return;

          // Update display immediately (live feedback)
          const displaySpan = this.parentElement.querySelector(".slider-value");
          if (displaySpan) {
            displaySpan.textContent = hspfValue.toFixed(1);
          }

          // Just display updates during dragging
        });

        // Change event for final calculations (after thumb release)
        f113Slider.addEventListener("change", function () {
          const hspfValue = parseFloat(this.value);
          if (isNaN(hspfValue)) return;

          // ✅ DUAL-STATE: Update via ModeManager (handles state isolation)
          ModeManager.setValue("f_113", hspfValue.toString(), "user-modified");

          // Only after thumb release
          calculateAll();
          ModeManager.updateCalculatedDisplayValues();
        });

        f113Slider.hasSliderListener = true;
      }

      // Add direct d_118 slider handler (CRITICAL: Must calculate during drag!)
      const d118Slider = document.querySelector(
        'input[type="range"][data-field-id="d_118"]',
      );
      if (d118Slider && !d118Slider.hasSliderListener) {
        // Input event for live feedback AND calculations during dragging
        // NOTE: This appears to be a calculation storm but is CRITICAL for accuracy
        // Removing calculations from "input" event causes major drift (h_10: 93→126.2)
        // The multiple calculation cycles during drag appear to help values settle correctly
        d118Slider.addEventListener("input", function () {
          const efficiencyValue = parseFloat(this.value);
          if (isNaN(efficiencyValue)) return;

          // Update display immediately (live feedback)
          const displaySpan = this.parentElement.querySelector(".slider-value");
          if (displaySpan) {
            displaySpan.textContent = efficiencyValue.toFixed(0) + "%";
          }

          // CRITICAL: Calculations during dragging (required for accuracy)
          ModeManager.setValue(
            "d_118",
            efficiencyValue.toString(),
            "user-modified",
          );
          calculateAll();
          ModeManager.updateCalculatedDisplayValues();
        });

        // Change event for final calculations (after thumb release)
        d118Slider.addEventListener("change", function () {
          const efficiencyValue = parseFloat(this.value);
          if (isNaN(efficiencyValue)) return;

          // ✅ DUAL-STATE: Update via ModeManager (handles state isolation)
          ModeManager.setValue(
            "d_118",
            efficiencyValue.toString(),
            "user-modified",
          );

          // Final calculation after thumb release
          calculateAll();
          ModeManager.updateCalculatedDisplayValues();
        });

        d118Slider.hasSliderListener = true;
      }

      // Remove StateManager listener that causes calculation storms
      // Direct slider event handlers (input/change) provide better performance control
      // sm.addListener("f_113", calculateCOPValues); // REMOVED - causes storms in Reference mode

      // Listener for d_116 (Cooling System) changes
      sm.addListener("d_116", () => {
        // This listener ensures that changes to d_116 from any source
        // (not just the dropdown) trigger a full recalculation.
        calculateAll();
        ModeManager.updateCalculatedDisplayValues();
      });

      // Listener for d_118 (Ventilation Efficiency) changes
      sm.addListener("d_118", () => {
        // Note: Direct slider handlers now provide the immediate calculation flow
      });

      // Dropdown handler already triggers calculateAll() properly with dual-engine
      // sm.addListener("g_118", () => {
      //   calculateVentilationValues(); // This was not mode-aware, causing contamination
      //   calculateFreeCooling();
      //   calculateMitigatedCED();
      // });

      // Listener for d_119 (Per Person Rate) changes
      sm.addListener("d_119", calculateVentilationRates);

      // Listener for l_119 (Summer Boost) changes
      sm.addListener("l_119", calculateCoolingVentilation);

      // --- Listeners for m_129 Dependencies --- Corrected in troubleshooting
      // sm.addListener("d_129", calculateMitigatedCED); // Function moved to Cooling.js
      // sm.addListener("h_124", calculateMitigatedCED); // Function moved to Cooling.js
      // sm.addListener("d_123", calculateMitigatedCED); // Function moved to Cooling.js
      // -----------------------------------------

      // Helper function for external dependency changes - DUAL-STATE PATTERN COMPLIANT
      const calculateAndRefresh = () => {
        calculateAll();
        ModeManager.updateCalculatedDisplayValues();
      };

      // Only essential S03 climate values that S13 actually needs
      sm.addListener("d_20", calculateAndRefresh); // HDD - needed for heating calculations
      sm.addListener("d_21", calculateAndRefresh); // CDD - needed for cooling calculations
      // Removed: d_23, d_24, h_23, h_24 - S13 doesn't directly use these (S11/S12 handle them)
      sm.addListener("i_104", () => {
        calculateAndRefresh();
      }); // Total Trans Loss
      sm.addListener("ref_i_104", () => {
        calculateAndRefresh();
      }); // Reference Total Trans Loss (from S12)

      sm.addListener("k_104", calculateAndRefresh); // Total Ground Loss
      sm.addListener("ref_k_104", calculateAndRefresh); // Reference Total Ground Loss (from S12)

      // ✅ FIX (Oct 27, 2025): Listen for volume changes from S12
      // Volume affects ventilation calculations (d_120, d_122, etc.) when g_118 uses volumetric methods
      sm.addListener("d_105", calculateAndRefresh); // Conditioned Volume (from S12)
      sm.addListener("ref_d_105", calculateAndRefresh); // Reference Conditioned Volume (from S12)

      sm.addListener("i_71", () => {
        calculateAndRefresh();
      }); // Total Occ Gains
      sm.addListener("ref_i_71", () => {
        calculateAndRefresh();
      }); // Reference Total Occ Gains (from S09)

      sm.addListener("i_79", calculateAndRefresh); // Total App Gains
      sm.addListener("ref_i_79", calculateAndRefresh); // Reference Total App Gains (from S10)

      sm.addListener("d_127", () => {
        // ✅ PATTERN 2: Run dual-engine calculations for proper Target/Reference state handling
        calculateAndRefresh();
      }); // TED (from S14, for d_114)
      sm.addListener("ref_d_127", () => {
        calculateAndRefresh();
      }); // Reference TED (from S14, for d_114) - CRITICAL for Reference flow

      // ✅ Additional S14 listener
      sm.addListener("l_128", calculateAndRefresh); // From S14
      sm.addListener("ref_l_128", calculateAndRefresh); // Reference from S14
    } else {
      console.error(
        "[Section13] ❌ StateManager not available to add listeners!",
      );
    }

    // --- Use Event Delegation for k_120 control ---
    if (sectionElement && !sectionElement.hasK120DelegateListener) {
      sectionElement.addEventListener("input", handleK120Input); // Display only
      sectionElement.addEventListener("change", handleK120Change); // Calculate on release
      sectionElement.hasK120DelegateListener = true;
    } else if (!sectionElement) {
      // console.warn("[S13 Init] Could not find #mechanicalLoads element to attach delegated listener.");
    }

    // --- Handler for k_120 input (display updates only, no calculations) ---
    function handleK120Input(e) {
      if (e.target && e.target.matches('[data-field-id="k_120"]')) {
        const sliderValueStr = e.target.value;
        const displaySpan = document.querySelector(
          `#mechanicalLoads span[data-display-for="k_120"]`,
        );
        if (displaySpan) {
          const numericSliderValue = parseFloat(sliderValueStr);
          if (!isNaN(numericSliderValue)) {
            displaySpan.textContent = `${numericSliderValue.toFixed(0)}%`;
          }
        }
      }
    }

    // --- Handler for k_120 change (calculations after thumb release) ---
    function handleK120Change(e) {
      if (e.target && e.target.matches('[data-field-id="k_120"]')) {
        const controlElement = e.target;
        const fieldId = controlElement.getAttribute("data-field-id");
        const sliderValueStr = controlElement.value;

        if (!fieldId) return;

        // Store value in StateManager
        if (window.TEUI.StateManager) {
          window.TEUI.StateManager.setValue(
            fieldId,
            sliderValueStr,
            "user-modified",
          );
        }

        // Calculate only after thumb release
        calculateAll();
        ModeManager.updateCalculatedDisplayValues();
      }
    }
  }

  /**
   * Handle blur events on editable fields (Standard Handler - Defined inside IIFE)
   */
  function handleEditableBlur(event) {
    const fieldId = this.getAttribute("data-field-id");
    if (!fieldId) return;

    // if (fieldId === 'l_118') {
    // }

    const newValue = this.textContent.trim();
    const numericValue = window.TEUI.parseNumeric(newValue, NaN);

    // --- Add Log for j_115 ---
    // if (fieldId === 'j_115') {
    // }
    // --- End Log ---

    if (!isNaN(numericValue)) {
      const formatType =
        fieldId === "j_115" || fieldId === "l_118"
          ? "number-2dp"
          : "number-2dp"; // Default format
      const formattedDisplay = window.TEUI.formatNumber(
        numericValue,
        formatType,
      );
      this.textContent = formattedDisplay; // Set formatted display

      if (window.TEUI.StateManager) {
        const valueToStore = numericValue.toString();
        // --- Add Log for j_115 ---
        // if (fieldId === 'j_115') {
        // }
        // --- End Log ---
        // if (fieldId === 'l_118') {
        // }
        // Use mode-aware ModeManager.setValue for user inputs (especially j_115 AFUE)
        if (ModeManager && typeof ModeManager.setValue === "function") {
          ModeManager.setValue(fieldId, valueToStore, "user-modified");
        } else {
          // Fallback to direct StateManager if ModeManager not available
          window.TEUI.StateManager.setValue(
            fieldId,
            valueToStore,
            "user-modified",
          );
        }

        if (fieldId === "j_115") {
          calculateAll(); // Keep this trigger for AFUE changes
          ModeManager.updateCalculatedDisplayValues();
        }
        if (fieldId === "j_116") {
          calculateAll();
          ModeManager.updateCalculatedDisplayValues();
        }
        if (fieldId === "l_118") {
          calculateAll();
          ModeManager.updateCalculatedDisplayValues();
        }
        if (fieldId === "d_119") {
          calculateAll();
          ModeManager.updateCalculatedDisplayValues(); // ✅ CRITICAL: Update displayed calculated fields immediately
        }
      }
    } else {
      // Revert logic if input is not a number
      let previousValue = window.TEUI.StateManager?.getValue(fieldId);
      // If StateManager has no value, fallback to the defined default from the layout
      if (previousValue === null || previousValue === undefined) {
        const fieldDef = getField(fieldId); // Use the module's getField helper
        previousValue = fieldDef?.defaultValue || "0";
      }
      const prevNumericValue = window.TEUI.parseNumeric(previousValue, 0);
      const formatType =
        fieldId === "j_115" || fieldId === "l_118"
          ? "number-2dp"
          : "number-2dp";
      this.textContent = window.TEUI.formatNumber(prevNumericValue, formatType);
      // console.warn(`Invalid input for ${fieldId}: "${newValue}". Reverted to ${this.textContent}.`);
    }
  }

  /**
   * Called when the section is rendered
   * This is a good place to initialize values and run initial calculations
   */
  function onSectionRendered() {
    // 1. Initialize the ModeManager and its internal states
    ModeManager.initialize();

    // 2. Setup the section-specific toggle switch in the header
    injectHeaderControls();

    // Log initial DOM state
    // const d119ElementInitial = document.querySelector('td[data-field-id="d_119"]');
    // const j115ElementInitial = document.querySelector('td[data-field-id="j_115"]');

    if (window.TEUI?.StateManager?.setValue) {
      // window.TEUI.StateManager.setValue('k_120', '0.9', 'default'); // Default to 90% << OLD BEHAVIOR
    }

    // 3. Initialize event handlers for this section
    initializeEventHandlers();
    registerWithStateManager();

    // 4. Apply validation tooltips to fields
    if (window.TEUI.TooltipManager && window.TEUI.TooltipManager.initialized) {
      setTimeout(() => {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }

    if (window.TEUI?.StateManager?.setValue) {
      const fields = getFields(); // Get field definitions for this section
      Object.entries(fields).forEach(([fieldId, fieldDef]) => {
        // Check if it's one of the problematic editable fields with a defined default
        if (
          (fieldId === "d_119" ||
            fieldId === "j_115" ||
            fieldId === "j_116" ||
            fieldId === "l_118") &&
          fieldDef.defaultValue
        ) {
          // ADDED j_116, l_118
          // Check if StateManager *doesn't* already have a value (to avoid overwriting user/imported data later)
          if (window.TEUI.StateManager.getValue(fieldId) === null) {
            window.TEUI.StateManager.setValue(
              fieldId,
              fieldDef.defaultValue,
              "default",
            );
          }
          // else {
          // }
        }
      });
    }
    // --- END ADDED ---

    // Log DOM state BEFORE calculateAll

    calculateAll(); // Run initial calculations first
    ModeManager.updateCalculatedDisplayValues(); // ✅ CRITICAL: Update DOM with all calculated values including f_114

    // Set up dropdown event handlers (like S09, S07, S02)
    setupDropdownEventHandlers();

    if (window.TEUI?.StateManager && window.TEUI?.formatNumber) {
      const fieldsToUpdate = ["d_119", "j_115", "j_116", "l_118"]; // ADDED j_116, l_118
      fieldsToUpdate.forEach((fieldId) => {
        const element = document.querySelector(
          `td[data-field-id="${fieldId}"]`,
        );
        const stateValue = window.TEUI.StateManager.getValue(fieldId);
        if (element && stateValue !== null && stateValue !== undefined) {
          const numericValue = window.TEUI.parseNumeric(stateValue, NaN);
          if (!isNaN(numericValue)) {
            const formatType = "number-2dp"; // Assuming 2 decimal places for both
            const formattedDisplay = window.TEUI.formatNumber(
              numericValue,
              formatType,
            );
            element.textContent = formattedDisplay;
          }
        }
      });
    }
    // --- END ADDED ---

    // 4. Sync UI to the default (Target) state
    ModeManager.refreshUI();

    // 5. Update conditional UI (ghosting) for current mode
    ModeManager.updateConditionalUI();

    // Set initial ghosting state after calculations might have populated values
    setTimeout(() => {
      // Use timeout to ensure initial state is settled
      const initialHeatingSystem = getFieldValue("d_113") || "Heatpump"; // Get current value or default
      handleHeatingSystemChangeForGhosting(initialHeatingSystem);
    }, 100); // Short delay might be needed
  }

  /**
   * Set up dropdown event handlers (following S09/S07/S02 pattern)
   * ✅ CRITICAL FIX: This was missing in S13, causing dropdown changes to not be saved
   */
  function setupDropdownEventHandlers() {
    const sectionElement = document.getElementById("mechanicalLoads");
    if (!sectionElement) return;

    // Set up event handlers for all dropdowns in this section
    const dropdowns = sectionElement.querySelectorAll("select");
    dropdowns.forEach((dropdown) => {
      // Remove any existing handlers to avoid duplicates
      dropdown.removeEventListener("change", handleDropdownChange);

      // Add the event listener
      dropdown.addEventListener("change", handleDropdownChange);
    });
  }

  /**
   * Handle dropdown changes (following S09 pattern)
   * ✅ CRITICAL: Store dropdown changes in current state via ModeManager
   */
  function handleDropdownChange(e) {
    const fieldId = e.target.getAttribute("data-field-id");
    if (!fieldId) return;

    const newValue = e.target.value;

    // Store via ModeManager (dual-state aware)
    if (ModeManager && typeof ModeManager.setValue === "function") {
      ModeManager.setValue(fieldId, newValue, "user-modified");

      // Confirm StateManager publication for d_113 (commented out for clean logs)
      // if (fieldId === "d_113") {
      //   if (ModeManager.currentMode === "reference") {
      //     const published = window.TEUI?.StateManager?.getValue("ref_d_113");
      //   } else {
      //     const published = window.TEUI?.StateManager?.getValue("d_113");
      //   }
      // }
    }

    // Special handling for heating system changes
    if (fieldId === "d_113") {
      handleHeatingSystemChangeForGhosting(newValue);
    }

    // Special handling for cooling system changes (d_116)
    if (fieldId === "d_116") {
      const currentHeatingSystem = ModeManager.getValue("d_113") || "Heatpump";
      // Re-apply ghosting when cooling system changes
      handleHeatingSystemChangeForGhosting(currentHeatingSystem);
      // Note: j_116 value will be set correctly by calculateCoolingSystem()
      // (0 for No Cooling, j_113 for Heatpump, user value for dedicated)
    }

    // Special handling for ventilation method changes
    if (fieldId === "g_118") {
      // Check what l_118 value should be used for this method
      const currentACH = ModeManager.getValue("l_118");

      // For Volume Constant, l_118 should be 3.0 by default
      if (newValue === "Volume Constant") {
        const expectedACH = getFieldDefault("l_118") || "3";
        if (currentACH !== expectedACH) {
        }
      }
    }

    // Recalculate and update display
    calculateAll();
    ModeManager.updateCalculatedDisplayValues();

    // 🔧 FIX (Oct 7, 2025): Force complete calculator cascade when g_118 changes
    // Ventilation method affects d_121 → S14 d_127 → S13 d_114 → h_10 (TEUI)
    // Problem: "calculated" values don't trigger downstream sections
    // Solution: Force Calculator.js to run complete cascade (temporary until Orchestrator implemented)
    // This eliminates the "Cooling Bump" workaround requirement
    if (fieldId === "g_118") {
      setTimeout(() => {
        if (window.TEUI?.Calculator?.calculateAll) {
          window.TEUI.Calculator.calculateAll();
        }
      }, 50); // Small delay ensures S13 values published first
    }
  }

  /**
   * Register this section's dependencies with StateManager
   */
  function registerWithStateManager() {
    if (!window.TEUI.StateManager) return;

    const sm = window.TEUI.StateManager;

    // Helper function for external dependency changes - DUAL-STATE PATTERN COMPLIANT
    const calculateAndRefresh = () => {
      calculateAll();
      ModeManager.updateCalculatedDisplayValues();
    };

    // Register dependencies from other sections
    sm.registerDependency("d_20", "d_121");
    sm.registerDependency("d_21", "d_122");
    sm.registerDependency("d_105", "d_120");
    sm.registerDependency("d_63", "d_120");
    sm.registerDependency("h_15", "f_117");
    sm.registerDependency("d_127", "d_114");
    sm.registerDependency("l_128", "d_117");
    sm.registerDependency("l_128", "h_130");
    sm.registerDependency("g_118", "h_124");
    sm.registerDependency("k_120", "h_124");
    sm.registerDependency("d_129", "m_129");
    sm.registerDependency("h_124", "m_129");
    sm.registerDependency("d_123", "m_129");

    // Added Dependencies for AFUE (j_115)
    sm.registerDependency("j_115", "d_115"); // AFUE affects Fuel Impact
    sm.registerDependency("j_115", "l_115"); // AFUE affects Exhaust (via d_115)
    sm.registerDependency("j_115", "m_115"); // AFUE affects % comparison
    // Dependencies for Exhaust (l_115) based on formula = d_115 - d_114
    sm.registerDependency("d_115", "l_115");
    sm.registerDependency("d_114", "l_115");

    // NEW: Dependencies for Space Heating Emissions (f_114)
    sm.registerDependency("d_113", "f_114"); // Heating system type affects emissions
    sm.registerDependency("f_115", "f_114"); // Oil volume affects emissions
    sm.registerDependency("h_115", "f_114"); // Gas volume affects emissions
    sm.registerDependency("l_30", "f_114"); // Oil emissions factor
    sm.registerDependency("l_28", "f_114"); // Gas emissions factor

    // CRITICAL: Listen for d_13 changes to update reference indicators
    sm.addListener("d_13", () => {
      updateAllReferenceIndicators();
    });

    // Listen for Reference climate data changes to trigger recalculation
    sm.addListener("ref_d_20", (newValue) => {
      calculateAll();
      ModeManager.updateCalculatedDisplayValues();
    });
    sm.addListener("ref_d_21", (newValue) => {
      calculateAll();
      ModeManager.updateCalculatedDisplayValues();
    });
    sm.addListener("ref_d_22", (newValue) => {
      calculateAll();
      ModeManager.updateCalculatedDisplayValues();
    });
    sm.addListener("ref_h_22", (newValue) => {
      calculateAll();
      ModeManager.updateCalculatedDisplayValues();
    });

    // Listen for Cooling.js results to trigger S13 recalculations
    sm.addListener("cooling_latentLoadFactor", calculateAndRefresh); // i_122 affects D122/D123
    sm.addListener("cooling_h_124", calculateAndRefresh); // Free cooling capacity affects H124, D124
    sm.addListener("cooling_m_124", calculateAndRefresh); // Days active cooling affects M124

    // Listen for S08 indoor RH% changes (affects cooling calculations)
    sm.addListener("i_59", calculateAndRefresh); // Target indoor RH%
    sm.addListener("ref_i_59", calculateAndRefresh); // Reference indoor RH%
  }

  /**
   * ✅ PHASE 2: Calculate COPh and COPc values with automatic mode awareness (ENDGAME Pattern 1)
   */
  function calculateCOPValues() {
    // ✅ PHASE 2: Automatic mode-aware reading via ModeManager
    const hspf = window.TEUI.parseNumeric(ModeManager.getValue("f_113")) || 0;
    const systemType = ModeManager.getValue("d_113");

    let copheat = 1;
    if (systemType === "Heatpump" && hspf > 0) {
      copheat = hspf / 3.412;
    }
    let copcool = Math.max(1, copheat - 1);
    const ceer = 3.412 * copcool;

    // Return calculated values for the calculation chain. DOM updates are handled by the orchestrator.
    return {
      h_113: copheat,
      j_113: copcool,
      j_114: ceer,
    };
  }

  /**
   * ✅ PHASE 2: Calculate heating system with automatic mode-aware data flow (ENDGAME Pattern 1)
   * This function consolidates heating demand, fuel impact, and emissions
   * Mode awareness is now automatic via temporary mode switching
   * @param {Object} copResults - Results from COP calculations
   * @param {number} tedValue - Total Energy Demand value
   * @returns {Object} Complete heating system results
   */
  function calculateHeatingSystem(copResults = {}, tedValue = 0) {
    // ✅ PHASE 2: Automatic mode-aware reading (no isReferenceCalculation parameter needed)
    const systemType = ModeManager.getValue("d_113");
    const afue = window.TEUI.parseNumeric(ModeManager.getValue("j_115")) || 1;

    const copHeat = copResults.h_113 || 1;

    // Check if S13 publishes heating system selection
    if (ModeManager.currentMode === "reference") {
    }

    let heatingDemand_d114 = 0;
    let heatingSink_l113 = 0;
    let fuelImpact_d115 = 0;
    let oilLitres_f115 = 0;
    let gasM3_h115 = 0;
    let exhaust_l115 = 0;
    let emissions_f114 = 0;

    // Calculate heating demand and sink
    if (systemType === "Heatpump") {
      if (copHeat > 0) {
        heatingDemand_d114 = tedValue / copHeat;
        heatingSink_l113 = heatingDemand_d114 * (copHeat - 1);
      } else {
        heatingDemand_d114 = tedValue;
        heatingSink_l113 = 0;
      }
    } else {
      heatingDemand_d114 = tedValue;
      heatingSink_l113 = 0;
    }

    // Calculate fuel impact for gas and oil systems
    if ((systemType === "Gas" || systemType === "Oil") && afue > 0) {
      fuelImpact_d115 = tedValue / afue;
      exhaust_l115 = fuelImpact_d115 - heatingDemand_d114;

      if (systemType === "Gas") {
        gasM3_h115 = fuelImpact_d115 / 10.36;
      } else {
        oilLitres_f115 = fuelImpact_d115 / 10.2;
      }
    }

    // ✅ PHASE 2: Automatic mode-aware emissions factor reading (ENDGAME Pattern 1)
    if (systemType === "Oil") {
      // Automatic mode-aware reading - no manual mode checking needed
      const oilEmissionsFactor =
        ModeManager.currentMode === "reference"
          ? parseFloat(window.TEUI?.StateManager?.getValue("ref_l_30")) || 2753
          : getGlobalNumericValue("l_30") || 2753;
      emissions_f114 = (oilLitres_f115 * oilEmissionsFactor) / 1000;
    } else if (systemType === "Gas") {
      // Automatic mode-aware reading - no manual mode checking needed
      const gasEmissionsFactor =
        ModeManager.currentMode === "reference"
          ? parseFloat(window.TEUI?.StateManager?.getValue("ref_l_28")) || 1921
          : getGlobalNumericValue("l_28") || 1921;
      emissions_f114 = (gasM3_h115 * gasEmissionsFactor) / 1000;
    }

    // Return all results for the calculation chain
    return {
      d_114: heatingDemand_d114,
      l_113: heatingSink_l113,
      d_115: fuelImpact_d115,
      f_115: oilLitres_f115,
      h_115: gasM3_h115,
      l_115: exhaust_l115,
      m_115: afue > 0 ? 1 / afue : 0,
      f_114: emissions_f114,
    };
  }

  /**
   * Calculate cooling system values
   */
  function calculateCoolingSystem(
    isReferenceCalculation = false,
    copResults = {},
  ) {
    const coolingSystemType = ModeManager.getValue("d_116") || "No Cooling";
    const heatingSystemType = ModeManager.getValue("d_113");

    // Read M129 from StateManager (calculated in this section)
    const coolingDemand_m129 = isReferenceCalculation
      ? parseFloat(window.TEUI?.StateManager?.getValue("ref_m_129")) || 0
      : window.TEUI.parseNumeric(window.TEUI.StateManager.getValue("m_129")) ||
        0;

    // Use fresh j_113 value from copResults, not stale DOM
    const copcool_hp_j113 = copResults.j_113 || 0;

    // Read J116 (dedicated cooling COP) - 0 is valid for No Cooling
    const j116_raw = getSectionValue("j_116", isReferenceCalculation);
    let copcool_dedicated_j116 = 2.66; // Default
    if (j116_raw !== null && j116_raw !== undefined) {
      copcool_dedicated_j116 = window.TEUI.parseNumeric(j116_raw); // 0 is valid!
    }

    let coolingLoad_d117 = 0;
    let coolingSink_l116 = 0; // Dedicated Cooling Sink
    let coolingSink_l114 = 0; // Heatpump Cooling Sink
    let j_116_display = 0; // What to display for j_116

    // Excel D117 formula: IF(D116="No Cooling", 0, IF(D113="Heatpump", M129/J113, IF(D116="Cooling", M129/J116)))
    if (coolingSystemType === "No Cooling") {
      coolingLoad_d117 = 0;
      coolingSink_l116 = 0;
      coolingSink_l114 = 0;
      j_116_display = 0;
    } else if (heatingSystemType === "Heatpump") {
      // Heatpump cooling: use J113 (heatpump COP)
      if (copcool_hp_j113 > 0) {
        coolingLoad_d117 = coolingDemand_m129 / copcool_hp_j113;
        // Excel L114 formula: IF(D113="Heatpump", IF(D116="Cooling", ((D117*J113)-D117), 0), 0)
        coolingSink_l114 = coolingLoad_d117 * (copcool_hp_j113 - 1);
      }
      coolingSink_l116 = 0; // No dedicated cooling sink for heatpump
      j_116_display = copcool_hp_j113; // Display J113 value (calculated, not user input)
    } else if (coolingSystemType === "Cooling") {
      // Dedicated cooling system: use J116 (user editable)
      if (copcool_dedicated_j116 > 0) {
        coolingLoad_d117 = coolingDemand_m129 / copcool_dedicated_j116;
        coolingSink_l116 = coolingLoad_d117 * (copcool_dedicated_j116 - 1);
      }
      coolingSink_l114 = 0; // No heatpump cooling sink for dedicated
      j_116_display = copcool_dedicated_j116; // Display user's J116 value
    }

    // Calculate derived values
    const area_h15 = window.TEUI.parseNumeric(getFieldValue("h_15")) || 0;
    const intensity_f117 = area_h15 > 0 ? coolingLoad_d117 / area_h15 : 0;
    const ceer_j117 = 3.412 * j_116_display; // CEER based on displayed COP

    // Reference comparison values
    const ref_cop_cool_T116 = 3.35;
    const ref_intensity_T117 = 138;
    const m116_value =
      j_116_display > 0 ? ref_cop_cool_T116 / j_116_display : 0;
    const m117_value =
      ref_intensity_T117 > 0 ? intensity_f117 / ref_intensity_T117 : 0;

    // Only update DOM for Target calculations
    if (!isReferenceCalculation) {
      // J116: ALWAYS set (0 for No Cooling, j_113 for Heatpump, user value for dedicated)
      setFieldValue("j_116", j_116_display, "number-2dp");

      setFieldValue("l_116", coolingSink_l116, "number-2dp-comma");
      setFieldValue("l_114", coolingSink_l114, "number-2dp-comma");
      setFieldValue("d_117", coolingLoad_d117, "number-2dp-comma");
      setFieldValue("f_117", intensity_f117, "number-2dp");
      setFieldValue("j_117", ceer_j117, "number-1dp");
      setFieldValue("m_116", m116_value, "percent-0dp");
      setFieldValue("m_117", m117_value, "percent-0dp");

      calculateCoolingVentilation();
    }

    // Return calculated values for Reference engine storage
    return {
      j_116: j_116_display,
      l_116: coolingSink_l116,
      l_114: coolingSink_l114,
      d_117: coolingLoad_d117,
      f_117: intensity_f117,
      j_117: ceer_j117,
      m_116: m116_value,
      m_117: m117_value,
    };
  }

  /**
   * Calculate ventilation values based on efficiency and method
   */
  function calculateVentilationValues() {
    calculateVentilationRates();
    calculateVentilationEnergy();
    calculateCoolingVentilation();
  }

  /**
   * Calculate ventilation rates based on method (g_118) and per-person rate (d_119)
   */
  function calculateVentilationRates(isReferenceCalculation = false) {
    const ratePerPerson =
      window.TEUI.parseNumeric(
        getSectionValue("d_119", isReferenceCalculation),
      ) || 0;
    const cfm = ratePerPerson * 2.11888;
    const m3hr = ratePerPerson * 3.6;

    setFieldValue("f_119", cfm, "number-2dp");
    setFieldValue("h_119", m3hr, "number-2dp");

    // Now calculate d_120 (Volumetric Rate) as it depends on d_119 and g_118
    // Read ventilation method from isolated cooling context
    const ventMethod = getSectionValue("g_118", isReferenceCalculation);
    const ratePerPerson_d119 =
      window.TEUI.parseNumeric(
        isReferenceCalculation
          ? getSectionValue("d_119", true)
          : getFieldValue("d_119"),
      ) || 0;

    // 🔧 BUG #5 FIX: Read external dependencies with mode awareness to prevent state mixing
    const volume =
      window.TEUI.parseNumeric(
        getExternalValue("d_105", isReferenceCalculation),
      ) || 0;
    const ach = window.TEUI.parseNumeric(ModeManager.getValue("l_118")) || 0;

    // 🔧 BUG #5 FIX: Read occupancy values mode-aware (from S08 and S09)
    const occupiedHours =
      window.TEUI.parseNumeric(
        getExternalValue("i_63", isReferenceCalculation),
      ) || 0;
    const totalHours =
      window.TEUI.parseNumeric(
        getExternalValue("j_63", isReferenceCalculation),
      ) || 8760;
    const occupants_d63 =
      window.TEUI.parseNumeric(
        getExternalValue("d_63", isReferenceCalculation),
      ) || 0;

    let ventRateLs = 0;

    if (ventMethod === "Occupant Constant") {
      ventRateLs = ratePerPerson_d119 * occupants_d63;
    } else if (ventMethod === "Occupant by Schedule") {
      ventRateLs =
        totalHours > 0
          ? ratePerPerson_d119 * occupants_d63 * (occupiedHours / totalHours)
          : 0;
    } else if (ventMethod === "Volume by Schedule") {
      ventRateLs =
        totalHours > 0 && volume > 0
          ? ((ach * volume) / 3.6) * (occupiedHours / totalHours)
          : 0;
    } else if (ventMethod === "Volume Constant") {
      ventRateLs = volume > 0 ? (ach * volume) / 3.6 : 0;
    } else {
      // Default to Volume Constant
      ventRateLs = volume > 0 ? (ach * volume) / 3.6 : 0;
    }

    const ventilationRateLs_d120 = ventRateLs;

    const ventilationRateM3h_h120 = ventilationRateLs_d120 * 3.6;

    // ✅ FIX (Oct 27, 2025): Store ventilation values for BOTH Target AND Reference
    // Previously only stored Target values, causing Reference to fall back to Target d_120
    if (!isReferenceCalculation) {
      // Target: Update DOM
      setFieldValue("d_120", ventilationRateLs_d120, "number-2dp-comma");
      setFieldValue("f_120", ventRateLs * 2.11888, "number-2dp-comma"); // cfm conversion
      setFieldValue("h_120", ventilationRateM3h_h120, "number-2dp-comma"); // m3/hr
    } else {
      // Reference: Store with ref_ prefix for downstream calculations
      window.TEUI.StateManager.setValue("ref_d_120", ventilationRateLs_d120.toString(), "calculated");
      window.TEUI.StateManager.setValue("ref_f_120", (ventRateLs * 2.11888).toString(), "calculated");
      window.TEUI.StateManager.setValue("ref_h_120", ventilationRateM3h_h120.toString(), "calculated");
      console.log(`[S13] 🔗 Published ref_d_120=${ventilationRateLs_d120.toFixed(2)} L/s for Reference ventilation energy calc`);
    }

    // ✅ PATTERN 1: Mode-aware reading (automatic with temporary mode switching)
    const sre_d118 =
      window.TEUI.parseNumeric(ModeManager.getValue("d_118")) || 0;
    // Commented out - m_118 is now handled by reference indicator system
    // setFieldValue('m_118', sre_d118 / 100, 'percent-0dp');

    // Return calculated values for Reference engine storage
    return {
      f_119: cfm,
      h_119: m3hr,
      d_120: ventilationRateLs_d120,
      f_120: ventRateLs * 2.11888,
      h_120: ventilationRateM3h_h120,
    };
  }

  /**
   * Calculate ventilation energy exchange during heating season
   */
  function calculateVentilationEnergy(
    isReferenceCalculation = false,
    ventRateD120 = null,
  ) {
    // 🔧 BUG #5 FIX: Accept d_120 as parameter OR read mode-aware from StateManager
    // This prevents reading Target d_120 when calculating Reference ventilation energy
    let ventRate = 0;
    if (ventRateD120 !== null) {
      ventRate = window.TEUI.parseNumeric(ventRateD120) || 0;
    } else {
      // Fallback: read from StateManager mode-aware
      ventRate =
        window.TEUI.parseNumeric(
          getExternalValue("d_120", isReferenceCalculation),
        ) || 0;
    }

    // 🔧 BUG #4 FIX: Read mode-aware HDD for ventilation energy calculation
    // This fixes 12-month state mixing issue where Reference calculations used Target climate data
    const hdd = isReferenceCalculation
      ? getGlobalNumericValue("ref_d_20") // Reference reads ref_d_20 (independent location)
      : getGlobalNumericValue("d_20"); // Target reads d_20 (independent location)

    // ✅ PATTERN 1: Mode-aware reading (automatic with temporary mode switching)
    const d_118_value = ModeManager.getValue("d_118");
    const efficiency = (window.TEUI.parseNumeric(d_118_value) || 0) / 100;
    const heatingVentEnergy = (1.21 * ventRate * hdd * 24) / 1000;
    const recoveredEnergy = heatingVentEnergy * efficiency;
    const netHeatLoss = heatingVentEnergy - recoveredEnergy;

    // Only update DOM for Target calculations
    if (!isReferenceCalculation) {
      setFieldValue("d_121", heatingVentEnergy, "number-2dp-comma");
      setFieldValue("i_121", recoveredEnergy, "number-2dp-comma");
      setFieldValue("m_121", netHeatLoss, "number-2dp-comma");
    }

    // Return calculated values for Reference engine storage
    return {
      d_121: heatingVentEnergy,
      i_121: recoveredEnergy,
      m_121: netHeatLoss,
    };
  }

  /**
   * Calculate ventilation energy exchange during cooling season
   */
  function calculateCoolingVentilation(
    isReferenceCalculation = false,
    ventRateD120 = null,
  ) {
    // 🔧 BUG #5 FIX: Accept d_120 as parameter OR read mode-aware
    let ventilationRateLs_d120 = 0;
    if (ventRateD120 !== null) {
      ventilationRateLs_d120 = window.TEUI.parseNumeric(ventRateD120) || 0;
    } else {
      ventilationRateLs_d120 =
        window.TEUI.parseNumeric(
          getExternalValue("d_120", isReferenceCalculation),
        ) || 0;
    }

    // 🔧 BUG #5 FIX: Read external dependencies mode-aware (CDD from S03, occupancy from S08/S09)
    const cdd_d21 =
      window.TEUI.parseNumeric(
        getExternalValue("d_21", isReferenceCalculation),
      ) || 0;
    const occupiedHours_i63 =
      window.TEUI.parseNumeric(
        getExternalValue("i_63", isReferenceCalculation),
      ) || 0;
    const totalHours_j63 =
      window.TEUI.parseNumeric(
        getExternalValue("j_63", isReferenceCalculation),
      ) || 8760;
    const occupancyFactor =
      totalHours_j63 > 0 ? occupiedHours_i63 / totalHours_j63 : 0;
    // Read latent load factor from Cooling.js (will be 0 until Cooling.js works)
    const latentLoadFactor_i122 =
      window.TEUI.parseNumeric(
        window.TEUI.StateManager.getValue("cooling_latentLoadFactor"),
      ) || 1.0;
    const summerBoostRawValue = ModeManager.getValue("l_119");
    const summerBoostFactor =
      summerBoostRawValue === "None" || summerBoostRawValue === ""
        ? 1.0
        : window.TEUI.parseNumeric(summerBoostRawValue) || 1.0;
    // ✅ PATTERN 1: Mode-aware reading (automatic with temporary mode switching)
    const coolingSystem_d116 = ModeManager.getValue("d_116") || "No Cooling";
    const baseConstant = 1.21;
    // ✅ PATTERN 1: Mode-aware reading (automatic with temporary mode switching)
    const sre_d118 =
      (window.TEUI.parseNumeric(ModeManager.getValue("d_118")) || 0) / 100;

    let ventEnergyCoolingIncoming_d122 = 0;

    // Match the Excel formula structure exactly (D122)
    if (coolingSystem_d116 === "Cooling") {
      if (summerBoostRawValue === "None" || summerBoostRawValue === "") {
        ventEnergyCoolingIncoming_d122 =
          ((baseConstant * ventilationRateLs_d120 * cdd_d21 * 24) / 1000) *
          occupancyFactor *
          latentLoadFactor_i122;
      } else {
        ventEnergyCoolingIncoming_d122 =
          ((baseConstant * ventilationRateLs_d120 * cdd_d21 * 24) / 1000) *
          occupancyFactor *
          summerBoostFactor *
          latentLoadFactor_i122;
      }
    } else {
      // Assumes "No Cooling"
      if (summerBoostRawValue === "None" || summerBoostRawValue === "") {
        ventEnergyCoolingIncoming_d122 =
          ((baseConstant * ventilationRateLs_d120 * cdd_d21 * 24) / 1000) *
          latentLoadFactor_i122;
      } else {
        ventEnergyCoolingIncoming_d122 =
          ((baseConstant * ventilationRateLs_d120 * cdd_d21 * 24) / 1000) *
          summerBoostFactor *
          latentLoadFactor_i122;
      }
    }

    const ventEnergyRecovered_d123 = ventEnergyCoolingIncoming_d122 * sre_d118;

    // ✅ FIX (Oct 27, 2025): Store cooling ventilation values for BOTH Target AND Reference
    // Previously only stored Target values, causing Reference CED calculations to use Target d_122
    if (!isReferenceCalculation) {
      // Target: Update DOM
      setFieldValue("i_122", latentLoadFactor_i122, "percent-0dp");
      setFieldValue(
        "d_122",
        ventEnergyCoolingIncoming_d122,
        "number-2dp-comma",
      );
      setFieldValue("d_123", ventEnergyRecovered_d123, "number-2dp-comma");
    } else {
      // Reference: Store with ref_ prefix for CED calculations
      window.TEUI.StateManager.setValue("ref_i_122", latentLoadFactor_i122.toString(), "calculated");
      window.TEUI.StateManager.setValue("ref_d_122", ventEnergyCoolingIncoming_d122.toString(), "calculated");
      window.TEUI.StateManager.setValue("ref_d_123", ventEnergyRecovered_d123.toString(), "calculated");
      console.log(`[S13] 🔗 Published ref_d_122=${ventEnergyCoolingIncoming_d122.toFixed(2)} kWh/yr for Reference CED calc`);
    }

    return {
      incoming: ventEnergyCoolingIncoming_d122,
      recovered: ventEnergyRecovered_d123,
      i_122: latentLoadFactor_i122,
      d_122: ventEnergyCoolingIncoming_d122,
      d_123: ventEnergyRecovered_d123,
    };
  }

  /**
   * Calculate CED Unmitigated (d_129) - Excel: K71+K79+K98+K104+K103+D122
   * Moved from Cooling.js - needs D122 from S13
   */
  function calculateCEDUnmitigated(isReferenceCalculation = false) {
    // Read from appropriate state based on mode
    const k71 = getGlobalNumericValue(
      isReferenceCalculation ? "ref_k_71" : "k_71",
    );
    const k79 = getGlobalNumericValue(
      isReferenceCalculation ? "ref_k_79" : "k_79",
    );
    const k97 = getGlobalNumericValue(
      isReferenceCalculation ? "ref_k_97" : "k_97",
    );
    const k104 = getGlobalNumericValue(
      isReferenceCalculation ? "ref_k_104" : "k_104",
    );
    const k103 = getGlobalNumericValue(
      isReferenceCalculation ? "ref_k_103" : "k_103",
    );
    // ✅ FIX (Oct 27, 2025): Make d_122 read mode-aware
    // Was reading unprefixed d_122 (Target value) even in Reference calculations
    const d122 = window.TEUI.parseNumeric(
      getExternalValue("d_122", isReferenceCalculation)
    ) || 0;

    // Excel formula: D129 = K71+K79+K97+K104+K103+D122 (FIXED: was K98, should be K97)
    const cedUnmitigated = k71 + k79 + k97 + k104 + k103 + d122;

    // ✅ FIX (Oct 27, 2025): Store CED values for BOTH Target AND Reference
    if (!isReferenceCalculation) {
      // Target: Update DOM
      setFieldValue("d_129", cedUnmitigated, "number-2dp-comma");
    } else {
      // Reference: Store with ref_ prefix for CED mitigated calculation
      window.TEUI.StateManager.setValue("ref_d_129", cedUnmitigated.toString(), "calculated");
      console.log(`[S13] 🔗 Published ref_d_129=${cedUnmitigated.toFixed(2)} kWh/yr for Reference CED mitigated calc`);
    }

    return { d_129: cedUnmitigated };
  }

  /**
   * Calculate CED Mitigated (m_129) - Excel: MAX(0, D129 - H124 - D123)
   * Moved from Cooling.js - needs D123 from S13
   */
  function calculateCEDMitigated(isReferenceCalculation = false) {
    // ✅ FIX (Oct 6, 2025): Mode-aware reads for Reference calculation
    const d129 =
      window.TEUI.parseNumeric(
        isReferenceCalculation
          ? window.TEUI.StateManager.getValue("ref_d_129")
          : getFieldValue("d_129"),
      ) || 0;

    const h124 =
      window.TEUI.parseNumeric(
        isReferenceCalculation
          ? window.TEUI.StateManager.getValue("ref_h_124")
          : getFieldValue("h_124"),
      ) || 0;

    const d123 =
      window.TEUI.parseNumeric(
        isReferenceCalculation
          ? window.TEUI.StateManager.getValue("ref_d_123")
          : getFieldValue("d_123"),
      ) || 0;

    // Excel formula: M129 = MAX(0, D129 - H124 - D123)
    const cedMitigated = Math.max(0, d129 - h124 - d123);

    // ✅ Update DOM for both Target and Reference (mode-aware via ModeManager.currentMode)
    setFieldValue("m_129", cedMitigated, "number-2dp-comma");

    return { m_129: cedMitigated };
  }

  /**
   * Calculate free cooling capacity and related metrics
   */
  function calculateFreeCooling(isReferenceCalculation = false) {
    // Add recursion protection
    if (window.TEUI.sect13.freeCalculationInProgress) {
      return 0;
    }
    window.TEUI.sect13.freeCalculationInProgress = true;

    let finalFreeCoolingLimit = 0;
    let potentialLimit = 0;
    let setbackFactor = 1.0;
    const ventilationMethod =
      getSectionValue("g_118", isReferenceCalculation) || "Constant";
    const setbackValueStr = ModeManager.getValue("k_120");

    // ✅ FIX (Oct 6, 2025): Mode-aware read for h_120
    const ventRateM3hr_h120 =
      window.TEUI.parseNumeric(
        isReferenceCalculation
          ? window.TEUI.StateManager.getValue("ref_h_120")
          : getFieldValue("h_120"),
      ) || 0;

    try {
      // ✅ FIX (Oct 6, 2025): Mode-aware read for cooling_h_124
      const h_124_raw = isReferenceCalculation
        ? window.TEUI.StateManager.getValue("ref_cooling_h_124")
        : window.TEUI.StateManager.getValue("cooling_h_124");
      potentialLimit = window.TEUI.parseNumeric(h_124_raw) || 0;

      if (setbackValueStr) {
        // const parsedFactor = window.TEUI.parseNumeric(setbackValueStr); // OLD - assumed decimal
        let parsedNumForFactor = window.TEUI.parseNumeric(setbackValueStr); // Now gets a value like 90
        if (
          !isNaN(parsedNumForFactor) &&
          parsedNumForFactor >= 0 &&
          parsedNumForFactor <= 100
        ) {
          setbackFactor = parsedNumForFactor / 100; // Convert to decimal 0.0 - 1.0
        } else {
          setbackFactor = 1.0; // Default to no setback if value is odd
        }
        // if (!isNaN(parsedFactor) && parsedFactor >= 0 && parsedFactor <= 1) { // OLD check
        //     setbackFactor = parsedFactor;
        // }
      }

      // Determine the final free cooling limit based on ventilation method (Excel H124 logic)
      if (ventilationMethod.toLowerCase().includes("constant")) {
        finalFreeCoolingLimit = potentialLimit; // Use full potential for constant ventilation
      } else if (ventilationMethod.toLowerCase().includes("schedule")) {
        finalFreeCoolingLimit = potentialLimit * setbackFactor; // Apply setback factor for scheduled ventilation
      } else {
        finalFreeCoolingLimit = potentialLimit; // Default to full potential if method is unclear
      }

      // ✅ Update values (mode-aware via ModeManager.currentMode)
      setFieldValue("h_124", finalFreeCoolingLimit, "number-2dp-comma");

      // Calculate D124 (% Free Cooling Capacity)
      // ✅ FIX (Oct 6, 2025): Mode-aware read for d_129
      const coolingLoadUnmitigated =
        window.TEUI.parseNumeric(
          isReferenceCalculation
            ? window.TEUI.StateManager.getValue("ref_d_129")
            : getFieldValue("d_129"),
        ) || 0;

      let percentFreeCooling = 0;
      if (coolingLoadUnmitigated > 0) {
        percentFreeCooling = finalFreeCoolingLimit / coolingLoadUnmitigated;
      }
      setFieldValue("d_124", percentFreeCooling, "percent-0dp");

      // Read m_124 from Cooling.js via StateManager (mode-aware)
      // ✅ FIX (Oct 6, 2025): Mode-aware read for cooling_m_124
      // ✅ FIX (Oct 27, 2025): Fallback to m_19 (cooling season days) if cooling_m_124 not yet available
      let m_124_raw = isReferenceCalculation
        ? window.TEUI.StateManager.getValue("ref_cooling_m_124")
        : window.TEUI.StateManager.getValue("cooling_m_124");

      // Fallback: Use m_19 (cooling season length) from S03 if Stage 2 hasn't run yet
      if (!m_124_raw && m_124_raw !== 0) {
        const m_19_fallback = isReferenceCalculation
          ? window.TEUI.StateManager.getValue("ref_m_19")
          : window.TEUI.StateManager.getValue("m_19");

        m_124_raw = m_19_fallback || 120; // Default to 120 days if m_19 also unavailable
        console.warn("[S13] cooling_m_124 not available, using m_19 fallback:", m_124_raw);
      }

      const activeCoolingDays = window.TEUI.parseNumeric(m_124_raw);
      setFieldValue("m_124", activeCoolingDays, "number-2dp");
    } catch (error) {
      console.error("[S13 Error] Error during calculateFreeCooling:", error);
      finalFreeCoolingLimit = 0;
    } finally {
      window.TEUI.sect13.freeCalculationInProgress = false;
    }
    return finalFreeCoolingLimit;
  }

  /**
   * Calculate all values for this section
   * ✅ INCLUDES S11 PERSISTENCE PATTERN: Prevents Reference value race conditions
   */
  function calculateAll() {
    // Prevent race conditions from mode changes during calculation
    const modeAtCalculationStart = ModeManager.currentMode;

    // ✅ DUAL-ENGINE: Always run both engines in parallel
    try {
      calculateReferenceModel(); // Reads ReferenceState → stores ref_ prefixed

      calculateTargetModel(); // Reads TargetState → stores unprefixed

      // ✅ PHASE 5: S11 PERSISTENCE PATTERN - Re-write Reference results to prevent race conditions
      // Use captured mode instead of current mode to prevent race conditions
      if (
        Object.keys(lastReferenceResults).length > 0 &&
        window.TEUI?.StateManager
      ) {
        const shouldRewrite = modeAtCalculationStart === "reference";

        if (shouldRewrite) {
          Object.entries(lastReferenceResults).forEach(([fieldId, value]) => {
            if (value !== null && value !== undefined) {
              window.TEUI.StateManager.setValue(
                `ref_${fieldId}`,
                value.toString(),
                "calculated-persistent",
              );
            }
          });
        } else {
        }
      }
    } catch (error) {
      console.error("[Section13] ❌ ERROR in calculateAll:", error);
    }
  }

  /**
   * REFERENCE MODEL ENGINE: Calculate all Column E values using Reference state
   * ✅ PATTERN 1: Temporary mode switching (S02 proven pattern)
   */
  function calculateReferenceModel() {
    const originalMode = ModeManager.currentMode;

    try {
      // Temporary mode switching (CHEATSHEET Pattern 1)
      ModeManager.currentMode = "reference";

      // Read Reference TED from S14
      const tedValueRef =
        parseFloat(window.TEUI?.StateManager?.getValue("ref_d_127")) || 0;

      // S13 core calculations (heating, ventilation) - use unified functions
      const copResults = calculateCOPValues();
      const heatingResults = calculateHeatingSystem(copResults, tedValueRef);
      const ventilationRatesResults = calculateVentilationRates(true);

      // 🔧 BUG #5 FIX: Pass calculated d_120 to prevent reading Target value
      const ventilationEnergyResults = calculateVentilationEnergy(
        true,
        ventilationRatesResults.d_120,
      );

      // ✅ CALCULATION ORDER FIX: Call Cooling.js directly before it's needed
      // ✅ BUG #9 FIX: Pass mode parameter to make cooling calculations mode-aware
      window.TEUI.CoolingCalculations.calculateAll("reference");

      // Cooling season ventilation (D122/D123) - S13 calculates these
      // 🔧 BUG #5 FIX: Pass calculated d_120 to prevent reading Target value
      const coolingVentilationResults = calculateCoolingVentilation(
        true,
        ventilationRatesResults.d_120,
      );

      // CED calculations (D129/M129) - now in S13, after D122 exists
      const unmitigatedResults = calculateCEDUnmitigated(true);

      // Free cooling (H124) - needs D129
      const freeCoolingResults = {
        h_124: calculateFreeCooling(true),
      };

      // Cooling system (D117, L114, L116) - needs M129
      const mitigatedResults = calculateCEDMitigated(true);
      const coolingResults = calculateCoolingSystem(true, copResults);

      // Store Reference Model results with ref_ prefix for downstream sections
      storeReferenceResults(
        copResults,
        heatingResults,
        coolingResults,
        unmitigatedResults,
        mitigatedResults,
        ventilationRatesResults,
        ventilationEnergyResults,
        coolingVentilationResults,
        freeCoolingResults,
      );
    } catch (error) {
      console.error(
        "[Section13] Error in Reference Model calculations:",
        error,
      );
    } finally {
      // ✅ PHASE 1: Always restore original mode (ENDGAME Pattern 1)
      ModeManager.currentMode = originalMode;
    }
  }

  /**
   * TARGET MODEL ENGINE: Calculate all Column H values using Application state
   * ✅ PATTERN 1: Temporary mode switching (S02 proven pattern)
   */
  function calculateTargetModel() {
    const originalMode = ModeManager.currentMode;
    ModeManager.currentMode = "target"; // Temporarily switch mode

    try {
      // Get external dependency values
      const tedValue = window.TEUI.parseNumeric(getFieldValue("d_127")) || 0;

      // S13 core calculations (heating, ventilation)
      const copResults = calculateCOPValues();
      const heatingResults = calculateHeatingSystem(copResults, tedValue);
      const ventilationRatesResults = calculateVentilationRates(false);
      // 🔧 BUG #5 FIX: Pass calculated d_120 for consistency (Target reads from StateManager anyway)
      const ventilationEnergyResults = calculateVentilationEnergy(
        false,
        ventilationRatesResults.d_120,
      );

      // ✅ CALCULATION ORDER FIX: Call Cooling.js directly before it's needed
      // ✅ BUG #9 FIX: Pass mode parameter to make cooling calculations mode-aware
      window.TEUI.CoolingCalculations.calculateAll("target");

      // Cooling season ventilation (D122/D123) - S13 calculates these
      // 🔧 BUG #5 FIX: Pass calculated d_120 for consistency
      const coolingVentilationResults = calculateCoolingVentilation(
        false,
        ventilationRatesResults.d_120,
      );

      // CED calculations (D129/M129) - now in S13, after D122 exists
      const unmitigatedResults = calculateCEDUnmitigated(false);

      // Free cooling (H124) - needs D129
      const freeCoolingResults = {
        h_124: calculateFreeCooling(false),
      };

      // Cooling system (D117, L114, L116) - needs M129
      const mitigatedResults = calculateCEDMitigated(false);
      const coolingResults = calculateCoolingSystem(false, copResults);

      // Update DOM with Target calculation results
      updateTargetModelDOMValues(
        copResults,
        heatingResults,
        coolingResults,
        ventilationRatesResults,
        ventilationEnergyResults,
        coolingVentilationResults,
        freeCoolingResults,
        unmitigatedResults,
        mitigatedResults,
      );

      // Update reference indicators after calculations
      updateAllReferenceIndicators();
    } catch (error) {
      console.error("[Section13] Error in Target Model calculations:", error);
    } finally {
      ModeManager.currentMode = originalMode; // ✅ CRITICAL: Always restore mode
    }
  }

  /**
   * ✅ UPDATE DOM: Update DOM elements with Target calculation results
   */
  function updateTargetModelDOMValues(
    copResults,
    heatingResults,
    coolingResults,
    ventilationRatesResults,
    ventilationEnergyResults,
    coolingVentilationResults,
    freeCoolingResults,
    unmitigatedResults,
    mitigatedResults,
  ) {
    // COP Values
    if (copResults.h_113 !== undefined)
      setFieldValue("h_113", copResults.h_113, "number-2dp");
    if (copResults.j_113 !== undefined)
      setFieldValue("j_113", copResults.j_113, "number-2dp");
    if (copResults.j_114 !== undefined)
      setFieldValue("j_114", copResults.j_114, "number-2dp");

    // Heating System Results
    if (heatingResults.d_114 !== undefined)
      setFieldValue("d_114", heatingResults.d_114, "number-2dp-comma");
    if (heatingResults.l_113 !== undefined)
      setFieldValue("l_113", heatingResults.l_113, "number-2dp-comma");
    if (heatingResults.d_115 !== undefined)
      setFieldValue("d_115", heatingResults.d_115, "number-2dp-comma");
    if (heatingResults.f_115 !== undefined)
      setFieldValue("f_115", heatingResults.f_115, "number-2dp-comma");
    if (heatingResults.h_115 !== undefined)
      setFieldValue("h_115", heatingResults.h_115, "number-2dp-comma");
    if (heatingResults.l_115 !== undefined)
      setFieldValue("l_115", heatingResults.l_115, "number-2dp-comma");
    if (heatingResults.m_115 !== undefined)
      setFieldValue("m_115", heatingResults.m_115, "percent-0dp");
    if (heatingResults.f_114 !== undefined)
      setFieldValue("f_114", heatingResults.f_114, "number-2dp-comma");

    // Cooling System Results
    if (coolingResults.j_116 !== undefined)
      setFieldValue("j_116", coolingResults.j_116, "number-2dp");
    if (coolingResults.l_116 !== undefined)
      setFieldValue("l_116", coolingResults.l_116, "number-2dp-comma");
    if (coolingResults.l_114 !== undefined)
      setFieldValue("l_114", coolingResults.l_114, "number-2dp-comma");
    if (coolingResults.d_117 !== undefined)
      setFieldValue("d_117", coolingResults.d_117, "number-2dp-comma");
    if (coolingResults.f_117 !== undefined)
      setFieldValue("f_117", coolingResults.f_117, "number-2dp");
    if (coolingResults.j_117 !== undefined)
      setFieldValue("j_117", coolingResults.j_117, "number-1dp");
    if (coolingResults.m_116 !== undefined)
      setFieldValue("m_116", coolingResults.m_116, "percent-0dp");
    if (coolingResults.m_117 !== undefined)
      setFieldValue("m_117", coolingResults.m_117, "percent-0dp");

    // Ventilation Rates Results
    if (ventilationRatesResults.f_119 !== undefined)
      setFieldValue("f_119", ventilationRatesResults.f_119, "number-2dp");
    if (ventilationRatesResults.h_119 !== undefined)
      setFieldValue("h_119", ventilationRatesResults.h_119, "number-2dp");
    if (ventilationRatesResults.d_120 !== undefined)
      setFieldValue("d_120", ventilationRatesResults.d_120, "number-2dp-comma");
    if (ventilationRatesResults.f_120 !== undefined)
      setFieldValue("f_120", ventilationRatesResults.f_120, "number-2dp-comma");
    if (ventilationRatesResults.h_120 !== undefined)
      setFieldValue("h_120", ventilationRatesResults.h_120, "number-2dp-comma");

    // Ventilation Energy Results
    if (ventilationEnergyResults.d_121 !== undefined)
      setFieldValue(
        "d_121",
        ventilationEnergyResults.d_121,
        "number-2dp-comma",
      );
    if (ventilationEnergyResults.i_121 !== undefined)
      setFieldValue(
        "i_121",
        ventilationEnergyResults.i_121,
        "number-2dp-comma",
      );
    if (ventilationEnergyResults.m_121 !== undefined)
      setFieldValue(
        "m_121",
        ventilationEnergyResults.m_121,
        "number-2dp-comma",
      );

    // Cooling Ventilation Results
    if (coolingVentilationResults.i_122 !== undefined)
      setFieldValue("i_122", coolingVentilationResults.i_122, "percent-0dp");
    if (coolingVentilationResults.d_122 !== undefined)
      setFieldValue(
        "d_122",
        coolingVentilationResults.d_122,
        "number-2dp-comma",
      );
    if (coolingVentilationResults.d_123 !== undefined)
      setFieldValue(
        "d_123",
        coolingVentilationResults.d_123,
        "number-2dp-comma",
      );

    // Free Cooling Results
    if (freeCoolingResults.h_124 !== undefined)
      setFieldValue("h_124", freeCoolingResults.h_124, "number-2dp-comma");

    // CED Results
    if (unmitigatedResults.d_129 !== undefined)
      setFieldValue("d_129", unmitigatedResults.d_129, "number-2dp-comma");
    if (mitigatedResults.m_129 !== undefined)
      setFieldValue("m_129", mitigatedResults.m_129, "number-2dp-comma");
  }

  /**
   * Store Reference Model calculation results with ref_ prefix for downstream sections (S14, S15, S04, S01)
   * ✅ INCLUDES S11 PERSISTENCE PATTERN: Store in module-level cache
   */
  function storeReferenceResults(
    copResults,
    heatingResults,
    coolingResults,
    unmitigatedResults,
    mitigatedResults,
    ventilationRatesResults,
    ventilationEnergyResults,
    coolingVentilationResults,
    freeCoolingResults,
  ) {
    if (!window.TEUI?.StateManager) return;

    // Combine all Reference calculation results
    const allResults = {
      ...copResults,
      ...heatingResults,
      ...coolingResults,
      ...unmitigatedResults,
      ...mitigatedResults,
      ...ventilationRatesResults,
      ...ventilationEnergyResults,
      ...coolingVentilationResults,
      ...freeCoolingResults,
    };

    // ✅ PHASE 5: Store Reference results in module-level cache for persistence pattern
    lastReferenceResults = { ...allResults };

    // Store Reference results with ref_ prefix for downstream consumption
    Object.entries(allResults).forEach(([fieldId, value]) => {
      if (value !== null && value !== undefined) {
        window.TEUI.StateManager.setValue(
          `ref_${fieldId}`,
          value.toString(),
          "calculated",
        );
      }
    });
  }

  /**

  //==========================================================================
  // SIMPLIFIED REFERENCE MODEL FUNCTIONS (Pattern 2 - Like S14/S15)
  //==========================================================================

  /**
   * REFERENCE MODEL: Calculate heating system values using Reference inputs
   * SIMPLIFIED: No boolean parameters, dedicated Reference function
   */
  function calculateReferenceModelHeatingSystem() {
    // Use exact S13-BACKUP methodology - same formulas, Reference state inputs
    const systemType = ReferenceState.getValue("d_113");
    const tedReference =
      parseFloat(window.TEUI?.StateManager?.getValue("ref_d_127")) || 0; // Read Reference TED from S14
    const hspf =
      window.TEUI.parseNumeric(ReferenceState.getValue("f_113")) || 3.5;

    // TEMPORARY DEBUG: Check what we're actually reading for ref_d_127
    const directRead = window.TEUI?.StateManager?.getValue("ref_d_127");
    const fallbackRead = window.TEUI?.StateManager?.getReferenceValue("d_127");
    const domRead = window.TEUI.parseNumeric(
      document.getElementById("d_127")?.value,
    );

    // Reading reference TED value (debug logging removed)

    let heatingDemand_d114 = 0;
    let heatingSink_l113 = 0;
    let isHeatpump = systemType === "Heatpump";

    if (isHeatpump) {
      const local_copheat = hspf > 0 ? hspf / 3.412 : 1;
      if (local_copheat > 0) {
        heatingDemand_d114 = tedReference / local_copheat;
        heatingSink_l113 = heatingDemand_d114 * (local_copheat - 1);
      } else {
        heatingDemand_d114 = tedReference;
        heatingSink_l113 = 0;
      }
    } else {
      heatingDemand_d114 = tedReference;
      heatingSink_l113 = 0;
    }

    // Calculate fuel impact for Reference
    const fuelImpactResults = calculateReferenceModelHeatingFuelImpact(
      systemType,
      tedReference,
      heatingDemand_d114,
    );

    return {
      d_114: heatingDemand_d114,
      l_113: heatingSink_l113,
      ...fuelImpactResults,
    };
  }

  /**
   * REFERENCE MODEL: Calculate heating fuel impact for gas and oil systems
   */
  function calculateReferenceModelHeatingFuelImpact(
    systemType,
    tedReference,
    heatingDemand_d114,
  ) {
    const afue =
      window.TEUI.parseNumeric(ReferenceState.getValue("j_115")) || 1;

    let fuelImpact = 0,
      oilLitres = 0,
      gasM3 = 0,
      exhaust = 0;

    if ((systemType === "Gas" || systemType === "Oil") && afue > 0) {
      fuelImpact = tedReference / afue;
      exhaust = fuelImpact - heatingDemand_d114;

      if (systemType === "Gas") {
        gasM3 = fuelImpact / 10.36;
      } else {
        oilLitres = fuelImpact / 10.2;
      }
    }

    // Space heating emissions now calculated inline or via different method
    const emissions = 0; // Placeholder - emissions calculation handled elsewhere

    return {
      d_115: fuelImpact,
      f_115: oilLitres,
      h_115: gasM3,
      l_115: exhaust,
      m_115: afue > 0 ? 1 / afue : 0,
    };
  }

  //==========================================================================
  // GHOSTING FUNCTIONS (Must be defined BEFORE return statement)
  //==========================================================================

  // Helper function to apply/remove disabled styling
  function setFieldDisabled(fieldId, isDisabled) {
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (element) {
      const cell = element.closest("td");
      if (cell) {
        cell.classList.toggle("ghost-text", isDisabled);
        const slider = cell.querySelector('input[type="range"]');
        if (slider) slider.disabled = isDisabled;
      } else {
        element.classList.toggle("ghost-text", isDisabled);
      }
    }
  }

  /**
   * Helper to add/remove a ghosting class to a field's TD element.
   * @param {string} fieldId
   * @param {boolean} shouldBeGhosted
   */
  function setFieldGhosted(fieldId, shouldBeGhosted) {
    const valueCell = document.querySelector(`td[data-field-id="${fieldId}"]`);

    if (valueCell) {
      // Ghost the value cell itself
      valueCell.classList.toggle("disabled-input", shouldBeGhosted);

      // Disable/enable controls within the value cell
      const input = valueCell.querySelector(
        'input, select, [contenteditable="true"]',
      ); // Target input, select, or editable
      if (input) {
        if (input.hasAttribute("contenteditable")) {
          input.contentEditable = !shouldBeGhosted;
        } else {
          input.disabled = shouldBeGhosted;
        }
      }
      // Ensure contenteditable is explicitly removed/set if needed, even if no input found
      if (valueCell.hasAttribute("contenteditable"))
        valueCell.contentEditable = !shouldBeGhosted;

      // Ghost the preceding label cell (if it exists and seems like a label)
      const labelCell = valueCell.previousElementSibling;
      if (
        labelCell &&
        labelCell.tagName === "TD" &&
        !labelCell.hasAttribute("data-field-id")
      ) {
        // Basic check: is it a TD and not another value cell?
        // Optional stricter check: if (labelCell && labelCell.classList.contains('label-prefix')) { ... }
        labelCell.classList.toggle("disabled-input", shouldBeGhosted);
      }
    } else {
      // console.warn(`Ghosting: Element for field ${fieldId} not found.`);
    }
  }

  /**
   * Handles changes to d_113 to apply/remove ghosting styles.
   */
  function handleHeatingSystemChangeForGhosting(newValue) {
    const systemType = newValue; // e.g., "Gas", "Oil", "Heatpump", "Electricity"

    // Determine active state based on system type
    const isHP = systemType === "Heatpump";
    const isGas = systemType === "Gas";
    const isOil = systemType === "Oil";
    const isElectric = systemType === "Electricity";
    const isFossilFuel = isGas || isOil;

    // --- Ghosting based on Heating System ---

    // Heatpump specific fields
    setFieldGhosted("f_113", !isHP); // HSPF Slider
    setFieldGhosted("h_113", !isHP); // COPheat (Calc)
    setFieldGhosted("j_113", !isHP); // COPcool (HP specific)
    setFieldGhosted("j_114", !isHP); // CEER (HP specific)
    setFieldGhosted("l_113", !isHP); // Heatpump Sink

    // Gas specific fields
    setFieldGhosted("h_115", !isGas); // Target Gas Use (m3/yr)

    // Oil specific fields
    setFieldGhosted("f_115", !isOil); // Target Oil Use (l/yr)

    // AFUE field (j_115) - Active only for Gas/Oil
    setFieldGhosted("j_115", !isFossilFuel);

    // Exhaust field (l_115) - Active only for Gas/Oil
    setFieldGhosted("l_115", !isFossilFuel);

    // --- ROW 116 GHOSTING: Dedicated Cooling System Logic ---
    // CORRECTED LOGIC: Row 116 fields after d_116 dropdown only ghost when "No Cooling" selected
    // This applies to ALL heating systems - even Heatpump can have cooling
    const currentCoolingSystem =
      window.TEUI?.sect13?.ModeManager?.getValue("d_116") ||
      window.TEUI?.StateManager?.getValue("d_116");
    const isCoolingActive = currentCoolingSystem === "Cooling";

    // Row 116 j_116 field: Ghost when "No Cooling" OR when "Heatpump" (calculated from j_113)
    const shouldGhostJ116 = !isCoolingActive || isHP; // Ghost if No Cooling OR Heatpump
    setFieldGhosted("j_116", shouldGhostJ116);

    // When switching TO non-Heatpump with Cooling active, ensure j_116 has user default
    if (!isHP && isCoolingActive) {
      const currentJ116 = ModeManager.getValue("j_116");
      if (!currentJ116 || currentJ116 === "0") {
        // Reset to field definition default if empty or 0
        const defaultJ116 = getFieldDefault("j_116") || "2.66";
        ModeManager.setValue("j_116", defaultJ116, "system-update");
        const j116Element = document.querySelector('[data-field-id="j_116"]');
        if (
          j116Element &&
          j116Element.getAttribute("contenteditable") === "true"
        ) {
          j116Element.textContent = window.TEUI.formatNumber(
            parseFloat(defaultJ116),
            "number-2dp",
          );
        }
      }
    }

    // Row 116 other fields: Ghost only when "No Cooling"
    setFieldGhosted("l_116", !isCoolingActive); // Sink - ghost when No Cooling
    setFieldGhosted("m_116", !isCoolingActive); // Reference % - ghost when No Cooling

    if (isFossilFuel) {
      const afueField = "j_115";
      let newAFUEString = "0.90"; // Fallback default

      if (
        window.TEUI &&
        window.TEUI.StateManager &&
        window.TEUI.ReferenceValues
      ) {
        const currentD13 = window.TEUI.StateManager.getValue("d_13");
        // Attempt to get AFUE from ReferenceValues based on d_13
        // This assumes a structure like: ReferenceValues.getStandardData(standardKey).j_115
        // Or ReferenceValues.getSpecificReferenceValue(standardKey, fieldId)
        let referenceAFUE = undefined;
        if (typeof window.TEUI.ReferenceValues.getStandardData === "function") {
          const standardData =
            window.TEUI.ReferenceValues.getStandardData(currentD13);
          if (standardData && standardData.j_115) {
            referenceAFUE = standardData.j_115;
          }
        } else if (
          typeof window.TEUI.ReferenceValues.getSpecificReferenceValue ===
          "function"
        ) {
          referenceAFUE = window.TEUI.ReferenceValues.getSpecificReferenceValue(
            currentD13,
            "j_115",
          );
        } else if (window.TEUI.ReferenceValues[currentD13]) {
          // Direct access pattern
          referenceAFUE = window.TEUI.ReferenceValues[currentD13].j_115;
        }

        if (referenceAFUE !== undefined) {
          newAFUEString = referenceAFUE.toString();
        } else {
        }

        // For now, this prioritizes ReferenceValue for the standard, then 0.90.
      }

      // ✅ MODE-AWARE: Set AFUE value using ModeManager instead of global StateManager
      if (window.TEUI?.sect13?.ModeManager) {
        window.TEUI.sect13.ModeManager.setValue(
          afueField,
          newAFUEString,
          "system-update",
        );

        const afueElement = document.querySelector(
          `[data-field-id="${afueField}"]`,
        );
        if (
          afueElement &&
          afueElement.getAttribute("contenteditable") === "true"
        ) {
          // Ensure newAFUEString is parsed as a number for formatting
          afueElement.textContent = window.TEUI.formatNumber(
            parseFloat(newAFUEString),
            "number-2dp",
          );
        }
      } else if (window.TEUI?.StateManager?.setValue) {
        // Fallback to global StateManager
        window.TEUI.StateManager.setValue(
          afueField,
          newAFUEString,
          "system-update",
        );
      }
    }
    // --- END ADDED / MODIFIED ---

    // Row 116 ghosting logic is already implemented above
    // Row 117 fields are never ghosted - they always show cooling calculations

    // Row 115: Heating Fuel Impact - Ghost entire row if not Gas or Oil
    const row115 = document.querySelector('tr[data-id="M.2.2"]');
    if (row115) {
      row115.classList.toggle("ghosted", !isFossilFuel);
      // Also disable/enable controls within the row
      const controlsInRow = row115.querySelectorAll(
        'input, select, [contenteditable="true"]',
      );
      controlsInRow.forEach((control) => {
        if (control.getAttribute("data-field-id") !== "j_115") {
          // Don't disable j_115 based on row ghosting alone
          if (control.hasAttribute("contenteditable")) {
            control.contentEditable = isFossilFuel;
          } else {
            control.disabled = !isFossilFuel;
          }
        } else {
          // Handle j_115 separately based on its specific logic
          setFieldGhosted("j_115", !isFossilFuel);
        }
      });
    } else {
      // console.warn("[S13 Ghosting] Could not find row TR element for M.2.2");
    }
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
    calculateCoolingSystem: calculateCoolingSystem,
    calculateVentilationValues: calculateVentilationValues,
    calculateFreeCooling: calculateFreeCooling,
    // sm.addListener('d_113', handleHeatingSystemChangeForGhosting),
    // *** END ADDED ***

    // Removed getNumericValue from public API
    ModeManager: ModeManager, // ✅ CRITICAL FIX: Enable FieldManager integration

    // ✅ PHASE 3: Expose state objects for import sync
    TargetState: TargetState,
    ReferenceState: ReferenceState,

    // Expose ghosting functions that are called from within module
    setFieldGhosted: setFieldGhosted,
    handleHeatingSystemChangeForGhosting: handleHeatingSystemChangeForGhosting,
    setFieldDisabled: setFieldDisabled,
  };
})();

// Ensure global access point for calculateAll remains
window.TEUI.sect13.calculateAll = function () {
  if (window.TEUI.SectionModules.sect13) {
    window.TEUI.SectionModules.sect13.calculateAll();
    window.TEUI.SectionModules.sect13.ModeManager.updateCalculatedDisplayValues();
  }
};
