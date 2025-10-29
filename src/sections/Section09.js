/**
 * 4012-Section09.js
 * Occupant + Internal Gains (Section 9) module for TEUI Calculator 4.012
 *
 * Uses the consolidated declarative approach where field definitions
 * are integrated directly into the layout structure.
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

// Create a section-specific namespace for global references
window.TEUI.sect09 = window.TEUI.sect09 || {};

// Global variable to track initialization state
window.TEUI.sect09.initialized = false;
window.TEUI.sect09.userInteracted = false;

// Section 9: Occupant + Internal Gains Module
window.TEUI.SectionModules.sect09 = (function () {
  //==========================================================================
  // PATTERN A: DUAL-STATE ARCHITECTURE (Self-Contained State Objects)
  //==========================================================================

  // Target State: User's design values
  const TargetState = {
    state: {},
    initialize: function () {
      const savedState = localStorage.getItem("S09_TARGET_STATE");
      if (savedState) {
        this.state = JSON.parse(savedState);
      } else {
        this.setDefaults();
      }
    },
    setDefaults: function () {
      // ✅ FIELD DEFINITIONS ARE SINGLE SOURCE OF TRUTH - No hardcoded duplicates
      this.state = {
        // User input fields - read from field definitions only
        d_63: this.getFieldDefault("d_63") || "126",
        g_63: this.getFieldDefault("g_63") || "12",
        d_64: this.getFieldDefault("d_64") || "Normal",
        d_65: this.getFieldDefault("d_65") || "7",
        d_66: this.getFieldDefault("d_66") || "1.5",
        g_67: this.getFieldDefault("g_67") || "Efficient",
        d_68: this.getFieldDefault("d_68") || "No Elevators",
        // Calculated values will be computed dynamically
      };
      console.log("S09: Target defaults loaded from field definitions");
    },

    getFieldDefault: function (fieldId) {
      // Read default from field definitions (single source of truth)
      const fieldDef =
        sectionRows &&
        Object.values(sectionRows).find(
          (row) =>
            row.cells &&
            Object.values(row.cells).find((cell) => cell.fieldId === fieldId),
        );
      if (fieldDef) {
        const cell = Object.values(fieldDef.cells).find(
          (cell) => cell.fieldId === fieldId,
        );
        return cell?.value;
      }
      return null;
    },
    /**
     * ✅ PHASE 2: Sync from global StateManager after import
     * Bridges global StateManager → isolated TargetState for imported values
     */
    syncFromGlobalState: function (
      fieldIds = [
        "d_63",
        "g_63",
        "d_64",
        "d_65",
        "d_66",
        "d_67",
        "d_68",
        "g_67",
      ],
    ) {
      fieldIds.forEach((fieldId) => {
        const globalValue = window.TEUI.StateManager.getValue(fieldId);
        if (globalValue !== null && globalValue !== undefined) {
          this.setValue(fieldId, globalValue);
          console.log(
            `S09 TargetState: Synced ${fieldId} = ${globalValue} from global StateManager`,
          );
        }
      });
    },
    saveState: function () {
      localStorage.setItem("S09_TARGET_STATE", JSON.stringify(this.state));
    },
    setValue: function (fieldId, value) {
      this.state[fieldId] = value;
      this.saveState();
    },
    getValue: function (fieldId) {
      return this.state[fieldId];
    },
  };

  // Reference State: Code minimum/baseline values
  const ReferenceState = {
    state: {},
    initialize: function () {
      const savedState = localStorage.getItem("S09_REFERENCE_STATE");
      if (savedState) {
        this.state = JSON.parse(savedState);
      } else {
        this.setDefaults();
      }
    },
    setDefaults: function () {
      // Get current reference standard for dynamic loading
      const currentStandard =
        window.TEUI?.StateManager?.getValue?.("d_13") || "OBC SB10 5.5-6 Z6";
      const referenceValues =
        window.TEUI?.ReferenceValues?.[currentStandard] || {};

      // ✅ FIELD DEFINITIONS ARE SINGLE SOURCE OF TRUTH - No hardcoded duplicates
      this.state = {
        // User input fields - read from field definitions, with Reference-specific overrides
        d_63: TargetState.getFieldDefault("d_63") || "126", // Same as Target (user's design)
        g_63: TargetState.getFieldDefault("g_63") || "12", // Same as Target (user's design)
        d_64: TargetState.getFieldDefault("d_64") || "Normal", // Same as Target
        d_65: TargetState.getFieldDefault("d_65") || "7", // Same as Target (user's design)
        d_66: referenceValues.t_66 || "2.0", // REFERENCE OVERRIDE: Dynamic from ReferenceValues.js
        g_67: "Regular", // REFERENCE OVERRIDE: Equipment spec = Regular (not Efficient)
        d_68: TargetState.getFieldDefault("d_68") || "No Elevators", // Same as Target
        // Calculated values will be computed dynamically
      };

      console.log(
        `S09: Reference defaults loaded from standard: ${currentStandard}, lighting: ${this.state.d_66}`,
      );
    },
    saveState: function () {
      localStorage.setItem("S09_REFERENCE_STATE", JSON.stringify(this.state));
    },
    setValue: function (fieldId, value) {
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
      fieldIds = [
        "d_63",
        "g_63",
        "d_64",
        "d_65",
        "d_66",
        "d_67",
        "d_68",
        "g_67",
      ],
    ) {
      fieldIds.forEach((fieldId) => {
        const refFieldId = `ref_${fieldId}`;
        const globalValue = window.TEUI.StateManager.getValue(refFieldId);
        if (globalValue !== null && globalValue !== undefined) {
          this.setValue(fieldId, globalValue);
          console.log(
            `S09 ReferenceState: Synced ${fieldId} = ${globalValue} from global StateManager (${refFieldId})`,
          );
        }
      });
    },
    // Dynamic reloading when reference standard changes
    onReferenceStandardChange: function (newStandard) {
      const referenceValues = window.TEUI?.ReferenceValues?.[newStandard] || {};

      // Update lighting loads dynamically, but preserve user-modified values for other fields
      this.state.d_66 = referenceValues.t_66 || "2.0";
      this.state.g_67 = "Regular"; // Always Regular for reference

      this.saveState();
      console.log(
        `S09: Reference values updated for standard: ${newStandard}, lighting: ${this.state.d_66}`,
      );
    },
  };

  // The ModeManager Facade
  const ModeManager = {
    currentMode: "target",
    initialize: function () {
      TargetState.initialize();
      ReferenceState.initialize();

      // ✅ CSV EXPORT FIX: Publish ALL Reference defaults to StateManager
      if (window.TEUI?.StateManager) {
        ["d_63", "g_63", "d_64", "d_66", "g_67", "d_68"].forEach((id) => {
          const refId = `ref_${id}`;
          const val = ReferenceState.getValue(id);
          if (!window.TEUI.StateManager.getValue(refId) && val != null && val !== "") {
            window.TEUI.StateManager.setValue(refId, val, "calculated");
          }
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
      console.log(`S09: Switched to ${mode.toUpperCase()} mode`);

      this.refreshUI();
      // ✅ DISPLAY-ONLY: Values are pre-calculated, just refresh UI
      this.updateCalculatedDisplayValues();
    },
    resetState: function () {
      console.log("S09: Resetting states to defaults");
      TargetState.setDefaults();
      TargetState.saveState();
      ReferenceState.setDefaults();
      ReferenceState.saveState();

      this.refreshUI();
      // Trigger calculation after reset
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
      // console.log(`[S09DB] ModeManager.setValue: ${fieldId}=${value}, mode=${this.currentMode}, source=${source}`);

      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;
      currentState.setValue(fieldId, value);

      // Bridge to global StateManager
      if (window.TEUI?.StateManager?.setValue) {
        if (this.currentMode === "target") {
          // Target changes go to StateManager for downstream sections
          window.TEUI.StateManager.setValue(fieldId, value, source);
          // console.log(`[S09DB] Stored in StateManager: ${fieldId}=${value}`);
        } else if (this.currentMode === "reference") {
          // Reference changes go to StateManager with ref_ prefix
          window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, source);
          // console.log(`[S09DB] Stored in StateManager: ref_${fieldId}=${value}`);
          // 🔍 KEY: Only log critical total internal gains for downstream debugging
          if (fieldId === "h_71") {
            console.log(
              `[S09] ✅ ref_h_71 updated: ${value} (for S15/S04 debugging)`,
            );
          }
        }
      }
    },
    refreshUI: function () {
      const sectionElement = document.getElementById("occupantInternalGains");
      if (!sectionElement) return;

      const currentState = this.getCurrentState();

      // Fields that should sync from state to UI (input fields)
      const fieldsToSync = [
        "d_63",
        "g_63",
        "d_64",
        "d_65",
        "d_66",
        "g_67",
        "d_68",
      ];

      fieldsToSync.forEach((fieldId) => {
        const stateValue = currentState.getValue(fieldId);
        if (stateValue === undefined || stateValue === null) return;

        // Update dropdown elements
        const dropdownElement = sectionElement.querySelector(
          `[data-dropdown-id="dd_${fieldId}"]`,
        );
        if (dropdownElement && dropdownElement.matches("select")) {
          dropdownElement.value = stateValue;
          return;
        }

        // Update editable elements
        const editableElement = sectionElement.querySelector(
          `[data-field-id="${fieldId}"]`,
        );
        if (
          editableElement &&
          editableElement.hasAttribute("contenteditable")
        ) {
          editableElement.textContent = stateValue;
          return;
        }

        // Update other field elements
        if (editableElement) {
          editableElement.textContent = stateValue;
        }
      });

      // Update calculated fields: Show Reference results in Reference mode, Target results in Target mode
      const calculatedFields = [
        "f_64",
        "i_63",
        "h_64",
        "i_64",
        "k_64",
        "h_65",
        "i_65",
        "k_65",
        "h_66",
        "i_66",
        "k_66",
        "d_65", // ✅ CRITICAL FIX: Include plug load density for Reference mode DOM updates
        "d_67",
        "h_67",
        "i_67",
        "k_67",
        "h_69",
        "i_69",
        "k_69",
        "h_70",
        "i_70",
        "k_70",
        "h_71",
        "i_71",
        "k_71",
      ];

      calculatedFields.forEach((fieldId) => {
        const element = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (!element) return;

        let value;
        if (this.currentMode === "reference") {
          // Show Reference calculation results
          value = window.TEUI?.StateManager?.getValue(`ref_${fieldId}`);
        } else {
          // Show Target calculation results
          value = window.TEUI?.StateManager?.getValue(fieldId);
        }

        if (value !== undefined && value !== null) {
          // Format value for display based on field type
          let formatType = "number";
          if (fieldId === "d_65" || fieldId === "d_67") {
            formatType = "number-1dp"; // Density values with 1 decimal place
          } else if (
            fieldId.startsWith("h_") ||
            fieldId.startsWith("i_") ||
            fieldId.startsWith("k_")
          ) {
            formatType = fieldId === "i_63" ? "raw" : "number-2dp-comma";
          }

          const formattedValue = window.TEUI.formatNumber(value, formatType);
          element.textContent = formattedValue;
        }
      });

      console.log(`S09: UI refreshed for ${this.currentMode} mode`);
    },

    /**
     * Update calculated display values based on current mode
     * MANDATORY: Called after every calculateAll() per DUAL-STATE-CHEATSHEET.md
     */
    updateCalculatedDisplayValues: function () {
      const sectionElement = document.getElementById("occupantInternalGains");
      if (!sectionElement) return;

      // All calculated fields that need DOM updates
      const calculatedFields = [
        "f_64",
        "i_63",
        "h_64",
        "i_64",
        "k_64",
        "h_65",
        "i_65",
        "k_65",
        "h_66",
        "i_66",
        "k_66",
        "d_65", // ✅ CRITICAL FIX: Include plug load density for Reference mode DOM updates
        "d_67",
        "h_67",
        "i_67",
        "k_67",
        "h_69",
        "i_69",
        "k_69",
        "h_70",
        "i_70",
        "k_70",
        "h_71",
        "i_71",
        "k_71",
      ];

      calculatedFields.forEach((fieldId) => {
        const element = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (!element) return;

        let value;
        // ✅ STRICT MODE ISOLATION: No fallbacks
        if (this.currentMode === "reference") {
          // Reference mode: Read from ref_ prefixed StateManager values
          value = window.TEUI?.StateManager?.getValue(`ref_${fieldId}`);
        } else {
          // Target mode: Read from unprefixed StateManager values
          value = window.TEUI?.StateManager?.getValue(fieldId);
        }

        if (value !== undefined && value !== null) {
          // Format value for display based on field type
          let formatType = "number";
          if (fieldId === "d_65" || fieldId === "d_67") {
            formatType = "number-1dp"; // Density values with 1 decimal place
          } else if (
            fieldId.startsWith("h_") ||
            fieldId.startsWith("i_") ||
            fieldId.startsWith("k_")
          ) {
            formatType = fieldId === "i_63" ? "raw" : "number-2dp-comma";
          }

          const formattedValue = window.TEUI.formatNumber(value, formatType);
          element.textContent = formattedValue;
        } else {
          // If value doesn't exist, show 0 or field default - NEVER cross-contaminate
          element.textContent = "0";
        }
      });

      console.log(
        `[S09] Updated calculated display values for ${this.currentMode} mode`,
      );
    },
  };

  // Expose globally for header controls
  window.TEUI.sect09 = window.TEUI.sect09 || {};
  window.TEUI.sect09.ModeManager = ModeManager;

  //==========================================================================
  // HEADER CONTROLS INJECTION
  //==========================================================================

  /**
   * Inject Target/Reference toggle and Reset button into section header
   */
  function injectHeaderControls() {
    const sectionHeader = document.querySelector(
      "#occupantInternalGains .section-header",
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
    resetButton.title = "Reset Section 09 to Defaults";
    resetButton.style.cssText =
      "padding: 4px 8px; font-size: 0.8em; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;";

    resetButton.addEventListener("click", (event) => {
      event.stopPropagation();
      if (
        confirm(
          "Are you sure you want to reset all inputs in this section to their defaults? This will clear any saved data for Section 09.",
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

    console.log("S09: Header controls injected successfully");
  }

  //==========================================================================
  // ADDED: STANDARD HELPER FUNCTIONS (Restored)
  //==========================================================================

  //==========================================================================
  // PATTERN A HELPER FUNCTIONS (Dual-State Aware)
  //==========================================================================

  /**
   * ⚠️ LEGACY WRAPPER: Get numeric value with explicit mode awareness
   * TODO: Replace legacy calculation functions with explicit state access
   */
  function getNumericValue(fieldId, defaultValue = 0) {
    const rawValue = getFieldValueModeAware(fieldId);
    if (window.TEUI && typeof window.TEUI.parseNumeric === "function") {
      return window.TEUI.parseNumeric(rawValue, defaultValue);
    }
    // Fallback parsing if global is not available (should not happen in normal operation)
    const parsed = parseFloat(String(rawValue).replace(/[$,%]/g, ""));
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * MODE-AWARE WRAPPER: Replaces ambiguous getFieldValueModeAware() with explicit state access
   * ✅ FIXES PHASE 2 ANTI-PATTERN: Provides explicit state routing
   */
  function getFieldValueModeAware(fieldId) {
    // Internal S09 fields: Use explicit current state access
    const internalFields = [
      "d_63",
      "g_63",
      "d_64",
      "f_64",
      "i_63",
      "d_65",
      "d_66",
      "g_67",
      "d_67",
      "d_68",
    ];

    if (internalFields.includes(fieldId)) {
      // ✅ EXPLICIT STATE ACCESS: Use current ModeManager state
      const currentState = ModeManager.getCurrentState();
      const value = currentState.getValue(fieldId);
      if (value !== null && value !== undefined) {
        return value;
      }
    }

    // External dependencies: Use StateManager with current mode awareness
    if (window.TEUI?.StateManager?.getValue) {
      // ✅ MODE-AWARE EXTERNAL ACCESS: Read from appropriate StateManager key
      const value = window.TEUI.StateManager.getValue(fieldId);
      if (value !== null && value !== undefined) {
        return value;
      }
    }

    // Fall back to DOM (should rarely be needed)
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (element) {
      if (element.tagName === "SELECT" || element.tagName === "INPUT") {
        return element.value;
      } else {
        return element.textContent;
      }
    }

    return "";
  }

  /**
   * Helper function to format building type for equipment loads lookup
   * Moved to module scope to be accessible by both calculateEquipmentLoads and calculateEquipmentDensityForReference
   */
  function formatBuildingTypeForLookup(rawType) {
    // If it's already in the right format, return it
    if (
      typeof equipmentLoadsTable !== "undefined" &&
      Object.keys(equipmentLoadsTable).includes(rawType)
    ) {
      return rawType;
    }

    try {
      // Extract the category (e.g., "A - Assembly" -> "A")
      const categoryMatch = rawType.match(/^([A-F][0-9]?)\s*[-–]\s*/);
      if (categoryMatch) {
        const category = categoryMatch[1].trim();

        // Map category to lookup key
        if (category === "A") return "A-Assembly";
        if (category === "B1") return "B1-Detention";
        if (category === "B2") return "B2-Care";
        if (category === "B3") return "B3-DetentionCare";
        if (category === "C") return "C-Residential";
        if (category === "D") return "D-Business";
        if (category === "E") return "E-Mercantile";
        if (category === "F") return "F-Industrial";
      }

      // Try extracting just the first character as fallback
      if (rawType.length > 0) {
        const firstChar = rawType.charAt(0);
        if (firstChar === "A") return "A-Assembly";
        if (firstChar === "C") return "C-Residential";
        if (firstChar === "D") return "D-Business";
        if (firstChar === "E") return "E-Mercantile";
        if (firstChar === "F") return "F-Industrial";

        // Special case for B categories
        if (firstChar === "B") {
          if (rawType.includes("1") || rawType.includes("Detention")) {
            return "B1-Detention";
          } else if (
            rawType.includes("2") ||
            (rawType.includes("Care") && !rawType.includes("Detention"))
          ) {
            return "B2-Care";
          } else if (
            rawType.includes("3") ||
            (rawType.includes("Care") && rawType.includes("Detention"))
          ) {
            return "B3-DetentionCare";
          }
          return "B3-DetentionCare"; // Default B case
        }
      }
    } catch (e) {
      console.warn("Error formatting building type:", e);
    }

    return "A-Assembly"; // Default fallback
  }

  // ✅ DUPLICATE REMOVED: Using the mode-aware version above

  /**
   * Set calculated value in both ModeManager (internal state) and StateManager (Target mode backward compatibility)
   */
  function setCalculatedValue(fieldId, rawValue, formatType = "number") {
    // Ensure rawValue is numeric for calculations where appropriate
    const numericValue =
      typeof rawValue === "string"
        ? window.TEUI.parseNumeric(rawValue)
        : rawValue;

    // Determine appropriate format type based on field ID
    let determinedFormatType = formatType;
    if (fieldId === "d_65" || fieldId === "d_67") {
      determinedFormatType = "number-1dp"; // Equipment/plug density with 1 decimal
    } else if (fieldId.startsWith("l_") && fieldId !== "l_12") {
      determinedFormatType = "percent-0dp"; // Percentages
    } else if (
      fieldId.startsWith("h_") ||
      fieldId.startsWith("i_") ||
      fieldId.startsWith("k_")
    ) {
      determinedFormatType = "number-2dp-comma"; // Energy values with commas
    }

    const valueToStore = String(numericValue);

    // Update appropriate state object
    if (ModeManager.currentMode === "reference") {
      ReferenceState.setValue(fieldId, valueToStore);
    } else {
      TargetState.setValue(fieldId, valueToStore);
    }

    // Bridge to StateManager for backward compatibility
    if (window.TEUI?.StateManager?.setValue) {
      if (ModeManager.currentMode === "target") {
        window.TEUI.StateManager.setValue(fieldId, valueToStore, "calculated");
      } else if (ModeManager.currentMode === "reference") {
        window.TEUI.StateManager.setValue(
          `ref_${fieldId}`,
          valueToStore,
          "calculated",
        );
      }
    }

    // ✅ CRITICAL FIX: Update DOM like S12 does
    if (ModeManager.currentMode === "target") {
      // Only update DOM in Target mode - Reference mode uses updateCalculatedDisplayValues()
      const element = document.querySelector(`[data-field-id="${fieldId}"]`);
      if (element) {
        // Format value using global formatter
        const formattedValue = window.TEUI?.formatNumber
          ? window.TEUI.formatNumber(numericValue, determinedFormatType)
          : valueToStore;

        if (element.tagName === "SELECT" || element.tagName === "INPUT") {
          element.value = formattedValue;
        } else {
          element.textContent = formattedValue;
        }
        element.classList.add("calculated-value");
        element.classList.remove("user-input", "editable", "PendingValue");
        element.removeAttribute("contenteditable");
      } else {
        console.warn("DOM element not found for calculated field:", fieldId);
      }
    }
  }
  //==========================================================================
  // EQUIPMENT LOADS LOOKUP TABLE
  //==========================================================================

  // Equipment loads by occupancy type, efficiency and elevator presence (W/m²)
  const equipmentLoadsTable = {
    "A-Assembly": {
      Regular: { Elevators: 9.0, "No Elevators": 7.0 },
      Efficient: { Elevators: 7.0, "No Elevators": 5.0 },
    },
    "B1-Detention": {
      Regular: { Elevators: 10.0, "No Elevators": 8.0 },
      Efficient: { Elevators: 8.0, "No Elevators": 6.0 },
    },
    "B2-Care": {
      Regular: { Elevators: 25.0, "No Elevators": 20.0 },
      Efficient: { Elevators: 18.0, "No Elevators": 15.0 },
    },
    "B3-DetentionCare": {
      Regular: { Elevators: 20.0, "No Elevators": 18.0 },
      Efficient: { Elevators: 14.0, "No Elevators": 12.0 },
    },
    "C-Residential": {
      Regular: { Elevators: 6.0, "No Elevators": 5.0 },
      Efficient: { Elevators: 4.0, "No Elevators": 3.0 },
    },
    "D-Business": {
      Regular: { Elevators: 10.0, "No Elevators": 7.0 },
      Efficient: { Elevators: 7.0, "No Elevators": 5.0 },
    },
    "E-Mercantile": {
      Regular: { Elevators: 15.0, "No Elevators": 12.0 },
      Efficient: { Elevators: 12.0, "No Elevators": 10.0 },
    },
    "F-Industrial": {
      Regular: { Elevators: 17.0, "No Elevators": 15.0 },
      Efficient: { Elevators: 10.0, "No Elevators": 8.0 },
    },
    Hotels: {
      Regular: { "No Elevators": 10, Elevators: 12 },
      Efficient: { "No Elevators": 7, Elevators: 9 },
    },
    Warehouses: {
      Regular: { "No Elevators": 4, Elevators: 6 },
      Efficient: { "No Elevators": 3, Elevators: 4 },
    },
    Restaurants: {
      Regular: { "No Elevators": 18, Elevators: 20 },
      Efficient: { "No Elevators": 15, Elevators: 18 },
    },
  };

  // Default value if lookup fails
  const defaultEquipmentLoad = 5; // W/m²

  //==========================================================================
  // CONSOLIDATED FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  // Define rows with integrated field definitions
  const sectionRows = {
    // UNIT SUBHEADER - MUST COME FIRST
    header: {
      id: "09-ID",
      rowId: "09-ID",
      label: "Internal Gains Units",
      cells: {
        c: { content: "C", classes: ["section-subheader"] },
        d: { content: "Unit Qty", classes: ["section-subheader"] },
        e: { content: "E", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "G", classes: ["section-subheader"] },
        h: { content: "Annual\nkWh/yr", classes: ["section-subheader"] },
        i: {
          content: "Htg Gain\nkWh/yr",
          classes: ["section-subheader", "text-right"],
        },
        j: { content: "Htg Gain\n%", classes: ["section-subheader"] },
        k: { content: "Cooling Gain\nkWh/yr", classes: ["section-subheader"] },
        l: { content: "Htg Gain\n%", classes: ["section-subheader"] },
        m: { content: "Reference", classes: ["section-subheader"] },
        n: { content: "N", classes: ["section-subheader"] },
      },
    },

    // Row 63: G.1.1 Occupants per Building (declared)
    63: {
      id: "G.1.1",
      rowId: "G.1.1",
      label: "Occupants per Building (declared)",
      cells: {
        c: { label: "Occupants per Building (declared)" },
        d: {
          fieldId: "d_63",
          type: "editable",
          value: "126",
          section: "occupantInternalGains",
          classes: ["user-input"],
          tooltip: true, // Occupants
        },
        e: { content: "G.1.3", classes: ["label-prefix"] },
        f: { content: "Occupied Hrs/Day", classes: ["label-main"] },
        g: {
          fieldId: "g_63",
          type: "dropdown",
          dropdownId: "dd_g_63",
          value: "12",
          section: "occupantInternalGains",
          tooltip: true, // Occupied Hours
          options: [
            { value: "0", name: "0" },
            { value: "8", name: "8" },
            { value: "10", name: "10" },
            { value: "12", name: "12" },
            { value: "16", name: "16" },
            { value: "24", name: "24" },
          ],
        },
        i: {
          fieldId: "i_63",
          type: "calculated",
          value: "4380",
          section: "occupantInternalGains",
          dependencies: ["g_63"],
          classes: ["text-right"],
        },
        j: { content: "/ 8760", classes: ["text-left"] },
      },
    },

    // Row 64: G.1.2 Occupant Activity
    64: {
      id: "G.1.2",
      rowId: "G.1.2",
      label: "Occupant Activity",
      cells: {
        c: { label: "Occupant Activity" },
        d: {
          fieldId: "d_64",
          type: "dropdown",
          dropdownId: "dd_d_64",
          value: "Normal",
          section: "occupantInternalGains",
          tooltip: true, // Average Daily Metabolic Rate
          options: [
            { value: "Relaxed", name: "Relaxed" },
            { value: "Normal", name: "Normal" },
            { value: "Active", name: "Active" },
            { value: "Hyperactive", name: "Hyperactive" },
          ],
        },
        e: { content: "G.1.4", classes: ["label-prefix"] },
        f: { content: "Watts/pp (S+L)", classes: ["label-main"] },
        g: {
          fieldId: "f_64",
          type: "calculated",
          value: "117",
          section: "occupantInternalGains",
          dependencies: ["d_64"],
        },
        h: {
          fieldId: "h_64",
          type: "calculated",
          value: "64,696.02",
          section: "occupantInternalGains",
          dependencies: ["f_64", "d_63", "g_63"],
        },
        i: {
          fieldId: "i_64",
          type: "calculated",
          value: "43,426.10",
          section: "occupantInternalGains",
          dependencies: ["h_64"],
        },
        j: {
          fieldId: "j_64",
          type: "calculated",
          value: "43.39%",
          section: "occupantInternalGains",
          dependencies: ["i_64", "i_71"],
        },
        k: {
          fieldId: "k_64",
          type: "calculated",
          value: "21,269.93",
          section: "occupantInternalGains",
          dependencies: ["h_64"],
        },
        l: {
          fieldId: "l_64",
          type: "calculated",
          value: "43.39%",
          section: "occupantInternalGains",
          dependencies: ["k_64", "k_71"],
        },
      },
    },

    // Row 65: P.1 Plug Loads
    65: {
      id: "P.1",
      rowId: "P.1",
      label: "Plug Loads",
      cells: {
        c: { label: "Plug Loads" },
        d: {
          fieldId: "d_65",
          type: "calculated",
          value: "7",
          section: "occupantInternalGains",
          tooltip: true, // Default determined by Occupancy
        },
        h: {
          fieldId: "h_65",
          type: "calculated",
          value: "43,757.95",
          section: "occupantInternalGains",
          dependencies: ["d_65", "h_15"],
        },
        i: {
          fieldId: "i_65",
          type: "calculated",
          value: "29,371.78",
          section: "occupantInternalGains",
          dependencies: ["h_65"],
        },
        j: {
          fieldId: "j_65",
          type: "calculated",
          value: "29.35%",
          section: "occupantInternalGains",
          dependencies: ["i_65", "i_71"],
        },
        k: {
          fieldId: "k_65",
          type: "calculated",
          value: "14,386.18",
          section: "occupantInternalGains",
          dependencies: ["h_65"],
        },
        l: {
          fieldId: "l_65",
          type: "calculated",
          value: "29.35%",
          section: "occupantInternalGains",
          dependencies: ["k_65", "k_71"],
        },
        m: {
          fieldId: "m_65",
          type: "calculated",
          value: "100%",
          section: "occupantInternalGains",
        },
        n: {
          fieldId: "n_65",
          type: "calculated",
          value: "✓",
          section: "occupantInternalGains",
          classes: ["checkmark"],
        },
      },
    },

    // Row 66: P.2 Lighting Loads
    66: {
      id: "P.2",
      rowId: "P.2",
      label: "Lighting Loads",
      cells: {
        c: { label: "Lighting Loads" },
        d: {
          fieldId: "d_66",
          type: "editable",
          value: "1.5",
          section: "occupantInternalGains",
          classes: ["user-input"],
          tooltip: true, // Default is 1.5
        },
        h: {
          fieldId: "h_66",
          type: "calculated",
          value: "9,376.70",
          section: "occupantInternalGains",
          dependencies: ["d_66", "h_15"],
        },
        i: {
          fieldId: "i_66",
          type: "calculated",
          value: "6,293.95",
          section: "occupantInternalGains",
          dependencies: ["h_66"],
        },
        j: {
          fieldId: "j_66",
          type: "calculated",
          value: "6.29%",
          section: "occupantInternalGains",
          dependencies: ["i_66", "i_71"],
        },
        k: {
          fieldId: "k_66",
          type: "calculated",
          value: "3,082.75",
          section: "occupantInternalGains",
          dependencies: ["h_66"],
        },
        l: {
          fieldId: "l_66",
          type: "calculated",
          value: "6.29%",
          section: "occupantInternalGains",
          dependencies: ["k_66", "k_71"],
        },
        m: {
          fieldId: "m_66",
          type: "calculated",
          value: "133%",
          section: "occupantInternalGains",
        },
        n: {
          fieldId: "n_66",
          type: "calculated",
          value: "✓",
          section: "occupantInternalGains",
          classes: ["checkmark"],
        },
      },
    },

    // Row 67: P.3.1 Equipment Loads
    67: {
      id: "P.3.1",
      rowId: "P.3.1",
      label: "Equipment Loads",
      cells: {
        c: { label: "Equipment Loads" },
        d: {
          fieldId: "d_67",
          type: "calculated",
          value: "5.00",
          section: "occupantInternalGains",
          tooltip: true, // Default Determined by Occupancy
        },
        e: { content: "P.3.3", classes: ["label-prefix"] },
        f: { content: "Equipment Spec", classes: ["label-main"] },
        g: {
          fieldId: "g_67",
          type: "dropdown",
          dropdownId: "dd_g_67",
          value: "Efficient",
          section: "occupantInternalGains",
          tooltip: true, // Efficient or Regular Energy Spec
          options: [
            { value: "Regular", name: "Regular" },
            { value: "Efficient", name: "Efficient" },
          ],
        },
        h: {
          fieldId: "h_67",
          type: "calculated",
          value: "31,255.68",
          section: "occupantInternalGains",
          dependencies: ["d_67", "g_67", "h_15"],
        },
        i: {
          fieldId: "i_67",
          type: "calculated",
          value: "20,979.84",
          section: "occupantInternalGains",
          dependencies: ["h_67"],
        },
        j: {
          fieldId: "j_67",
          type: "calculated",
          value: "20.96%",
          section: "occupantInternalGains",
          dependencies: ["i_67", "i_71"],
        },
        k: {
          fieldId: "k_67",
          type: "calculated",
          value: "10,275.84",
          section: "occupantInternalGains",
          dependencies: ["h_67"],
        },
        l: {
          fieldId: "l_67",
          type: "calculated",
          value: "20.96%",
          section: "occupantInternalGains",
          dependencies: ["k_67", "k_71"],
        },
        m: {
          fieldId: "m_67",
          type: "calculated",
          value: "100%",
          section: "occupantInternalGains",
        },
        n: {
          fieldId: "n_67",
          type: "calculated",
          value: "✓",
          section: "occupantInternalGains",
          classes: ["checkmark"],
        },
      },
    },

    // Row 68: P.3.2 Elevator Loads
    68: {
      id: "P.3.2",
      rowId: "P.3.2",
      label: "Elevator Loads (W/m² → Eqpt Gains)",
      cells: {
        c: { label: "Elevator Loads (W/m² → Eqpt Gains)" },
        d: {
          fieldId: "d_68",
          type: "dropdown",
          dropdownId: "dd_d_68",
          value: "No Elevators",
          section: "occupantInternalGains",
          tooltip: true, // Include Elevator Load
          options: [
            { value: "Elevators", name: "Elevators" },
            { value: "No Elevators", name: "No Elevators" },
          ],
        },
      },
    },

    // Row 69: W.1.3 DHW System Losses
    69: {
      id: "W.1.3",
      rowId: "W.1.3",
      label: "DHW System Losses",
      cells: {
        c: { label: "DHW System Losses" },
        h: {
          fieldId: "h_69",
          type: "calculated",
          value: "0.00",
          section: "occupantInternalGains",
          dependencies: ["d_54"],
        },
        i: {
          fieldId: "i_69",
          type: "calculated",
          value: "0.00",
          section: "occupantInternalGains",
          dependencies: ["h_69"],
        },
        j: {
          fieldId: "j_69",
          type: "calculated",
          value: "0.00%",
          section: "occupantInternalGains",
          dependencies: ["i_69", "i_71"],
        },
        k: {
          fieldId: "k_69",
          type: "calculated",
          value: "0.00",
          section: "occupantInternalGains",
          dependencies: ["h_69"],
        },
        l: {
          fieldId: "l_69",
          type: "calculated",
          value: "0.00%",
          section: "occupantInternalGains",
          dependencies: ["k_69", "k_71"],
        },
      },
    },

    // Row 70: G.2 Plug/Light/Eqpt. Subtotals
    70: {
      id: "G.2",
      rowId: "G.2",
      label: "Plug/Light/Eqpt. Subtotals",
      cells: {
        c: { label: "Plug/Light/Eqpt. Subtotals" },
        h: {
          fieldId: "h_70",
          type: "calculated",
          value: "84,390.34",
          section: "occupantInternalGains",
          dependencies: ["h_65", "h_66", "h_67", "h_69"],
        },
        i: {
          fieldId: "i_70",
          type: "calculated",
          value: "56,645.57",
          section: "occupantInternalGains",
          dependencies: ["i_65", "i_66", "i_67", "i_69"],
        },
        k: {
          fieldId: "k_70",
          type: "calculated",
          value: "27,744.77",
          section: "occupantInternalGains",
          dependencies: ["k_65", "k_66", "k_67", "k_69"],
        },
      },
    },

    // Row 71: Internal Gains Totals
    71: {
      id: "Totals",
      rowId: "Totals",
      label: "Internal Gains Totals",
      cells: {
        c: { label: "Internal Gains Totals" },
        h: {
          fieldId: "h_71",
          type: "calculated",
          value: "149,086.36",
          section: "occupantInternalGains",
          dependencies: ["h_64", "h_70"],
        },
        i: {
          fieldId: "i_71",
          type: "calculated",
          value: "100,071.67",
          section: "occupantInternalGains",
          dependencies: ["i_64", "i_70"],
        },
        j: {
          fieldId: "j_71",
          type: "calculated",
          value: "100%",
          section: "occupantInternalGains",
        },
        k: {
          fieldId: "k_71",
          type: "calculated",
          value: "49,014.69",
          section: "occupantInternalGains",
          dependencies: ["k_64", "k_70"],
        },
        l: {
          fieldId: "l_71",
          type: "calculated",
          value: "100%",
          section: "occupantInternalGains",
        },
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
        if (cell.fieldId && cell.type) {
          // Create field definition with all relevant properties
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.label || row.label,
            defaultValue: cell.value || "",
            section: cell.section || "occupantInternalGains",
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
        delete cell.dependencies;

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
  // EVENT HANDLING AND CALCULATIONS
  //==========================================================================

  /**
   * Calculate Occupant Activity watts based on activity level
   *
   * ✅ Excel parity: Values rounded to 2 decimals to match Excel display
   *
   * Formula: (Sensible_BTU * 0.29307107) + (Latent_BTU * 0.29307107)
   *
   * NOTE: Full-precision values are available (e.g., Active = 219.8033), but we
   * deliberately round to 2 decimals to match Excel's displayed/calculated values.
   * This ensures user-visible parity between app and Excel results, even though
   * higher precision could theoretically be used.
   */
  function calculateActivityWatts(activityLevel) {
    // Use precise values derived from SCHEDULES-3037.csv G32:G43
    const activityWatts = {
      Relaxed: 96.71, // (200*0.29307107)+(130*0.29307107) = 96.7135 → 96.71
      Normal: 117.23, // (215*0.29307107)+(185*0.29307107) = 117.2284 → 117.23
      Active: 219.81, // (240*0.29307107)+(510*0.29307107) = 219.8033 → 219.81 (was 219.8)
      Hyperactive: 424.95, // (510*0.29307107)+(940*0.29307107) = 424.9531 → 424.95
    };

    return activityWatts[activityLevel] || 117.23; // Default to Normal
  }

  /**
   * Calculate Occupied Hours based on daily hours
   */
  function calculateOccupiedHoursRatio(dailyHours) {
    const hours = parseInt(dailyHours, 10) || 0;

    // Handle special case of 0 hours
    if (hours === 0) {
      return "0"; // Unoccupied building like cold storage
    }

    const annualHours = hours * 365;
    return annualHours.toString(); // Just return the annual hours, not the ratio
  }

  /**
   * Calculate the heating/cooling split based on cooling days from Section 03
   * @returns {Object} Object with heatingRatio and coolingRatio properties
   */
  function calculateHeatingCoolingSplit() {
    // Get cooling days from Section 03, cell m_19
    const coolingDays =
      window.TEUI.parseNumeric(getFieldValueModeAware("m_19")) || 120; // Default to 120 if not set

    // Calculate heating days
    const heatingDays = 365 - coolingDays;

    // Calculate ratios
    const heatingRatio = heatingDays / 365;
    const coolingRatio = coolingDays / 365;

    return {
      heatingRatio: heatingRatio,
      coolingRatio: coolingRatio,
    };
  }

  /**
   * Calculate Annual kWh/yr for occupants
   */
  function calculateOccupantEnergy() {
    // Get values using parseNumeric
    const occupants = window.TEUI.parseNumeric(getFieldValueModeAware("d_63"));
    const dailyHours = window.TEUI.parseNumeric(getFieldValueModeAware("g_63"));
    const watts = window.TEUI.parseNumeric(getFieldValueModeAware("f_64"));

    // Calculate annual energy
    const annualHours = dailyHours * 365;
    const energy = (occupants * watts * annualHours) / 1000; // Convert W to kW

    // Get heating/cooling split
    const { heatingRatio, coolingRatio } = calculateHeatingCoolingSplit();

    // Update fields using local helper with format type
    setCalculatedValue("h_64", energy, "number");
    setCalculatedValue("i_64", energy * heatingRatio, "number"); // Heating portion
    setCalculatedValue("k_64", energy * coolingRatio, "number"); // Cooling portion

    return energy;
  }

  /**
   * Calculate Annual kWh/yr for plug loads
   */
  function calculatePlugLoads() {
    // Get values using parseNumeric
    const plugLoadDensity = window.TEUI.parseNumeric(
      getFieldValueModeAware("d_65"),
    );
    const conditionedArea = window.TEUI.parseNumeric(
      getFieldValueModeAware("h_15"),
    );

    // Calculate annual energy based on OCCUPIED HOURS (i_63) per Excel formula structure
    const occupiedHours = window.TEUI.parseNumeric(
      getFieldValueModeAware("i_63"),
    ); // Use annual occupied hours
    const energy = (plugLoadDensity * conditionedArea * occupiedHours) / 1000; // W/m² to kWh/yr using occupied hours

    // Get heating/cooling split - Use DYNAMIC ratio for Plug Loads per user request
    const { heatingRatio, coolingRatio } = calculateHeatingCoolingSplit();

    // Update energy fields using local helper with format type
    setCalculatedValue("h_65", energy, "number");
    setCalculatedValue("i_65", energy * heatingRatio, "number"); // Use dynamic heating ratio
    setCalculatedValue("k_65", energy * coolingRatio, "number"); // Use dynamic cooling ratio

    // Calculate percentage against reference value
    // Reference is 5 W/m² for residential/care or 7 W/m² for others
    const referenceStandard = getFieldValueModeAware("d_13") || "";
    const buildingType = getFieldValueModeAware("d_12") || "";

    const isResidentialOrCare =
      buildingType === "C - Residential" ||
      buildingType === "B1 - Detention" ||
      buildingType === "B2 - Care and Treatment" ||
      buildingType === "B3 - Detention Care & Treatment";

    const referencePlugLoad = isResidentialOrCare ? 5 : 7;

    const percentOfReference = (plugLoadDensity / referencePlugLoad) * 100;
    setCalculatedValue("m_65", percentOfReference, "percent-auto");

    // Set checkmark or X based on whether it's below reference
    if (plugLoadDensity <= referencePlugLoad) {
      setCalculatedValue("n_65", "✓", "raw"); // Store raw checkmark
      setElementClass("n_65", "checkmark"); // Keep direct class manipulation for this specific UI
    } else {
      setCalculatedValue("n_65", "✗", "raw"); // Store raw X
      setElementClass("n_65", "warning"); // Keep direct class manipulation
    }

    return energy;
  }

  /**
   * Calculate Annual kWh/yr for lighting loads
   */
  function calculateLightingLoads() {
    // Get values using parseNumeric
    const lightingDensity = window.TEUI.parseNumeric(
      getFieldValueModeAware("d_66"),
    );
    const conditionedArea = window.TEUI.parseNumeric(
      getFieldValueModeAware("h_15"),
    );

    // Calculate annual energy based on OCCUPIED HOURS (i_63) per Excel formula structure
    const occupiedHours = window.TEUI.parseNumeric(
      getFieldValueModeAware("i_63"),
    ); // Use annual occupied hours
    const energy = (lightingDensity * conditionedArea * occupiedHours) / 1000; // W/m² to kWh/yr using occupied hours

    // Get heating/cooling split - Use DYNAMIC ratio for Lighting Loads
    const { heatingRatio, coolingRatio } = calculateHeatingCoolingSplit();

    // Update fields using local helper with format type
    setCalculatedValue("h_66", energy, "number");
    setCalculatedValue("i_66", energy * heatingRatio, "number"); // Use dynamic heating ratio
    setCalculatedValue("k_66", energy * coolingRatio, "number"); // Use dynamic cooling ratio

    // Calculate percentage against reference value
    // Use dynamic reference value from ReferenceState
    const referenceLightingLoad =
      window.TEUI.parseNumeric(ReferenceState.getValue("d_66")) || 2.0;
    const percentOfReference = (lightingDensity / referenceLightingLoad) * 100;
    setCalculatedValue("m_66", percentOfReference, "percent-auto");

    // Set checkmark or X based on standard comparison
    if (percentOfReference <= 133) {
      setCalculatedValue("n_66", "✓", "raw");
      setElementClass("n_66", "checkmark");
    } else {
      setCalculatedValue("n_66", "✗", "raw");
      setElementClass("n_66", "warning");
    }

    return energy;
  }

  /**
   * Calculate Annual kWh/yr for equipment loads
   */
  function calculateEquipmentLoads() {
    try {
      // Get building type and efficiency settings
      const buildingType = getFieldValueModeAware("d_12") || "A-Assembly";
      const efficiencyType = getFieldValueModeAware("g_67") || "Efficient";
      const elevatorStatus = getFieldValueModeAware("d_68") || "No Elevators";

      // Format building type to match lookup table
      const formattedBuildingType = formatBuildingTypeForLookup(buildingType);

      // Lookup the equipment density value with fallbacks
      let densityValue = 5.0; // Default

      if (equipmentLoadsTable[formattedBuildingType]) {
        if (equipmentLoadsTable[formattedBuildingType][efficiencyType]) {
          if (
            equipmentLoadsTable[formattedBuildingType][efficiencyType][
              elevatorStatus
            ] !== undefined
          ) {
            densityValue =
              equipmentLoadsTable[formattedBuildingType][efficiencyType][
                elevatorStatus
              ];
          }
        }
      }

      // Update calculated density
      setCalculatedValue("d_67", densityValue, "number");

      // Calculate annual energy
      const floorArea = window.TEUI.parseNumeric(
        getFieldValueModeAware("h_15"),
      );
      const occupiedHours = window.TEUI.parseNumeric(
        getFieldValueModeAware("i_63"),
      );
      const annualEnergy =
        (densityValue * floorArea * occupiedHours) / 1000 || 0;

      // Get heating/cooling split
      const { heatingRatio, coolingRatio } = calculateHeatingCoolingSplit();

      const heatingPortion = annualEnergy * heatingRatio;
      const coolingPortion = annualEnergy * coolingRatio;

      // Update fields
      setCalculatedValue("h_67", annualEnergy, "number");
      setCalculatedValue("i_67", heatingPortion, "number");
      setCalculatedValue("k_67", coolingPortion, "number");

      // Equipment loads typically show 100% compliance since they're from lookup tables
      setCalculatedValue("m_67", 100, "percent-auto");
      setCalculatedValue("n_67", "✓", "raw");
      setElementClass("n_67", "checkmark");

      // Update percentages and totals
      calculateTotals();
    } catch (error) {
      // Error handling could be added here if needed
    }
  }

  /**
   * Calculate subtotals and totals
   */
  function calculateTotals() {
    // Get values for components
    const dhwLosses = window.TEUI.parseNumeric(getFieldValueModeAware("h_69"));
    // Split DHW losses using DYNAMIC ratio
    const { heatingRatio: dhwHeatingRatio, coolingRatio: dhwCoolingRatio } =
      calculateHeatingCoolingSplit();
    const dhwHeating = dhwLosses * dhwHeatingRatio;
    const dhwCooling = dhwLosses * dhwCoolingRatio;
    // Use local helper
    setCalculatedValue("i_69", dhwHeating, "number");
    setCalculatedValue("k_69", dhwCooling, "number");

    // Energy values
    const plugEnergy = window.TEUI.parseNumeric(getFieldValueModeAware("h_65"));
    const lightingEnergy = window.TEUI.parseNumeric(
      getFieldValueModeAware("h_66"),
    );
    const equipmentEnergy = window.TEUI.parseNumeric(
      getFieldValueModeAware("h_67"),
    );
    const occupantEnergy = window.TEUI.parseNumeric(
      getFieldValueModeAware("h_64"),
    );

    // Heating values
    const plugHeating = window.TEUI.parseNumeric(
      getFieldValueModeAware("i_65"),
    );
    const lightingHeating = window.TEUI.parseNumeric(
      getFieldValueModeAware("i_66"),
    );
    const equipmentHeating = window.TEUI.parseNumeric(
      getFieldValueModeAware("i_67"),
    );
    const occupantHeating = window.TEUI.parseNumeric(
      getFieldValueModeAware("i_64"),
    );

    // Cooling values
    const plugCooling = window.TEUI.parseNumeric(
      getFieldValueModeAware("k_65"),
    );
    const lightingCooling = window.TEUI.parseNumeric(
      getFieldValueModeAware("k_66"),
    );
    const equipmentCooling = window.TEUI.parseNumeric(
      getFieldValueModeAware("k_67"),
    );
    const occupantCooling = window.TEUI.parseNumeric(
      getFieldValueModeAware("k_64"),
    );

    // Calculate subtotals for H70 (Plug/Light/Eqpt. Subtotals - EXCLUDING DHW losses h_69)
    const pleTotalEnergy = plugEnergy + lightingEnergy + equipmentEnergy; // EXCLUDES dhwLosses (h_69)
    const pleHeatingTotal = plugHeating + lightingHeating + equipmentHeating; // EXCLUDES dhwHeating (i_69)
    const pleCoolingTotal = plugCooling + lightingCooling + equipmentCooling; // EXCLUDES dhwCooling (k_69)

    // Update subtotal fields using local helper
    setCalculatedValue("h_70", pleTotalEnergy, "number");
    setCalculatedValue("i_70", pleHeatingTotal, "number");
    setCalculatedValue("k_70", pleCoolingTotal, "number");

    // Calculate grand totals (H71, I71, K71 - THESE DO include DHW system losses and occupant energy)
    const totalEnergy = pleTotalEnergy + occupantEnergy + dhwLosses; // Add back dhwLosses for grand total
    const totalHeating = pleHeatingTotal + occupantHeating + dhwHeating; // Add back dhwHeating for grand total
    const totalCooling = pleCoolingTotal + occupantCooling + dhwCooling; // Add back dhwCooling for grand total

    // Update total fields using local helper
    setCalculatedValue("h_71", totalEnergy, "number");
    setCalculatedValue("i_71", totalHeating, "number");
    setCalculatedValue("k_71", totalCooling, "number");

    // Update percentage fields
    updatePercentages(totalHeating, totalCooling);
  }

  /**
   * Updates the percentage columns (J and L) based on calculated totals.
   */
  function updatePercentages(totalHeating, totalCooling) {
    const gainIndicatorClasses = ["gain-high", "gain-medium", "gain-low"];

    const setPercentage = (
      valueFieldId,
      percentageFieldId,
      total,
      isCooling = false,
    ) => {
      const value = window.TEUI.parseNumeric(
        getFieldValueModeAware(valueFieldId),
      );
      const percentageDecimal = total > 0 ? value / total : 0;
      setCalculatedValue(percentageFieldId, percentageDecimal, "percent-auto");

      let gainClass = "";
      const absPercentageValue = Math.abs(percentageDecimal * 100); // Work with 0-100 scale for thresholds

      if (isCooling) {
        // For Cooling: Low percentage is good (Green)
        if (absPercentageValue <= 5) {
          gainClass = "gain-high";
        } // Green (Low is good)
        else if (absPercentageValue <= 15) {
          gainClass = "gain-medium";
        } // Yellow
        else {
          gainClass = "gain-low";
        } // Red (High is bad)
      } else {
        // For Heating: High percentage is good (Green)
        if (absPercentageValue >= 30) {
          gainClass = "gain-high";
        } // Green (High is good)
        else if (absPercentageValue >= 10) {
          gainClass = "gain-medium";
        } // Yellow
        else {
          gainClass = "gain-low";
        } // Red (Low is bad)
      }
      setIndicatorClass(percentageFieldId, gainClass, gainIndicatorClasses);

      const element = document.querySelector(
        `[data-field-id="${percentageFieldId}"]`,
      );
      if (element) element.classList.add("text-left-indicator");
    };

    setPercentage("i_64", "j_64", totalHeating);
    setPercentage("k_64", "l_64", totalCooling, true);
    setPercentage("i_65", "j_65", totalHeating);
    setPercentage("k_65", "l_65", totalCooling, true);
    setPercentage("i_66", "j_66", totalHeating);
    setPercentage("k_66", "l_66", totalCooling, true);
    setPercentage("i_67", "j_67", totalHeating);
    setPercentage("k_67", "l_67", totalCooling, true);
    setPercentage("i_69", "j_69", totalHeating);
    setPercentage("k_69", "l_69", totalCooling, true);

    setCalculatedValue("j_71", 1.0, "percent-auto");
    setCalculatedValue("l_71", 1.0, "percent-auto");
  }

  //==========================================================================
  // DUAL-ENGINE ARCHITECTURE
  //==========================================================================

  /**
   * REFERENCE MODEL ENGINE: Calculate all values using Reference state
   * Stores results with ref_ prefix to keep separate from Target values
   */
  function calculateReferenceModel() {
    try {
      const results = calculateModel(ReferenceState, true);
      const prefix = "ref_";

      // Store all results in StateManager with "ref_" prefix
      Object.entries(results).forEach(([fieldId, value]) => {
        if (value !== null && value !== undefined) {
          window.TEUI.StateManager.setValue(
            prefix + fieldId,
            String(value),
            "calculated",
          );
        }
      });

      // ✅ CRITICAL FIX: Also update DOM when in Reference mode (matches Target pattern)
      if (ModeManager.currentMode === "reference") {
        // console.log(`[S09DB] calculateReferenceModel: Updating DOM (Reference mode)`);
        Object.entries(results).forEach(([fieldId, value]) => {
          // Use ModeManager.setValue to update both state and DOM
          ModeManager.setValue(fieldId, String(value), "calculated");
        });
      } else {
        // console.log(`[S09DB] calculateReferenceModel: Skipping DOM update (Target mode)`);
      }
      // CRITICAL: also publish values needed by downstream sections
      window.TEUI.StateManager.setValue(
        "ref_d_63",
        ReferenceState.getValue("d_63"),
        "calculated",
      );
      window.TEUI.StateManager.setValue(
        "ref_g_63",
        ReferenceState.getValue("g_63"),
        "calculated",
      );
      window.TEUI.StateManager.setValue(
        "ref_d_64",
        ReferenceState.getValue("d_64"),
        "calculated",
      );

      // ✅ CRITICAL: Publish ref_i_63 for S13 (annual occupied hours)
      // FIX (Oct 27, 2025): This was missing, causing state mixing when g_63 changes
      // S13 Reference engine was falling back to Target's i_63 value
      const ref_i_63 = ReferenceState.getValue("i_63");
      if (ref_i_63 !== null && ref_i_63 !== undefined) {
        window.TEUI.StateManager.setValue("ref_i_63", ref_i_63, "calculated");
        console.log(`[S09] 🔗 Published ref_i_63=${ref_i_63} for S13`);
      }

      // ✅ CRITICAL: Publish ref_i_71 for S10 (heating season internal gains)
      const ref_i_71 = ReferenceState.getValue("i_71");
      if (ref_i_71 !== null && ref_i_71 !== undefined) {
        window.TEUI.StateManager.setValue("ref_i_71", ref_i_71, "calculated");
        console.log(`[S09] 🔗 Published ref_i_71=${ref_i_71} for S10`);
      }
    } catch (error) {
      console.error("[S09] Error in Reference Model calculations:", error);
    }
  }

  /**
   * Helper function to calculate equipment density for Reference model
   */
  function calculateEquipmentDensityForReference() {
    const buildingType =
      window.TEUI?.StateManager?.getValue("ref_d_12") || "A-Assembly";
    const efficiencyType = ReferenceState.getValue("g_67") || "Regular"; // Reference always uses Regular
    const elevatorStatus = ReferenceState.getValue("d_68") || "No Elevators";

    const formattedBuildingType = formatBuildingTypeForLookup(buildingType);
    let densityValue = 5.0; // Default

    if (equipmentLoadsTable[formattedBuildingType]) {
      if (equipmentLoadsTable[formattedBuildingType][efficiencyType]) {
        if (
          equipmentLoadsTable[formattedBuildingType][efficiencyType][
            elevatorStatus
          ] !== undefined
        ) {
          densityValue =
            equipmentLoadsTable[formattedBuildingType][efficiencyType][
              elevatorStatus
            ];
        }
      }
    }

    return densityValue;
  }

  /**
   * TARGET MODEL ENGINE: Calculate all values using Target state
   * Updates DOM and bridges to StateManager for backward compatibility
   */
  function calculateTargetModel() {
    try {
      const results = calculateModel(TargetState, false);

      // ✅ CRITICAL FIX: Only call setCalculatedValue() when in Target mode
      // This prevents Target calculations from overwriting Reference mode display
      // console.log(`[S09DB] calculateTargetModel: currentMode=${ModeManager.currentMode}`);
      if (ModeManager.currentMode === "target") {
        // console.log(`[S09DB] calculateTargetModel: Updating DOM (Target mode)`);
        Object.entries(results).forEach(([fieldId, value]) => {
          setCalculatedValue(fieldId, value);
        });
      } else {
        // console.log(`[S09DB] calculateTargetModel: Skipping DOM update (Reference mode)`);
        // Still store in StateManager for backward compatibility, but don't update DOM
        Object.entries(results).forEach(([fieldId, value]) => {
          if (
            window.TEUI?.StateManager &&
            value !== null &&
            value !== undefined
          ) {
            window.TEUI.StateManager.setValue(
              fieldId,
              String(value),
              "calculated",
            );
          }
        });
      }

      updatePercentages(results.i_71, results.k_71);
      updateAllReferenceIndicators();
    } catch (error) {
      console.error("[S09] Error in Target Model calculations:", error);
    }
  }

  /**
   * UNIFIED MODEL CALCULATION ENGINE
   * This new function contains the complete calculation logic for this section.
   * It is called for both the Target and Reference models to ensure identical logic.
   *
   * @param {object} state - The state object to use for inputs (TargetState or ReferenceState).
   * @param {boolean} isReference - Flag to determine if this is a Reference calculation.
   * @returns {object} A comprehensive object with all calculated results.
   */
  function calculateModel(state, isReference) {
    // Get upstream dependencies, aware of the current mode
    const conditionedArea = window.TEUI.parseNumeric(
      window.TEUI.StateManager.getValue(isReference ? "ref_h_15" : "h_15"),
      0,
    );
    const dhwLosses = window.TEUI.parseNumeric(
      window.TEUI.StateManager.getValue(isReference ? "ref_d_54" : "d_54"),
      0,
    );
    const buildingType =
      window.TEUI.StateManager.getValue(isReference ? "ref_d_12" : "d_12") ||
      "A-Assembly";

    // Preliminary calculations based on the section's internal state
    const activityLevel = state.getValue("d_64");
    const activityWatts = calculateActivityWatts(activityLevel);
    const dailyHours = window.TEUI.parseNumeric(state.getValue("g_63"));
    // console.log(`[S09DB] calculateModel: state.getValue("g_63")="${state.getValue("g_63")}", dailyHours=${dailyHours}, isReference=${isReference}`);
    const annualHours = dailyHours * 365;
    // console.log(`[S09DB] calculateModel: annualHours = ${dailyHours} * 365 = ${annualHours}`);

    // Store these preliminary results back into the state object
    state.setValue("f_64", activityWatts.toString());
    state.setValue("i_63", annualHours.toString());

    // --- Main Energy Calculations ---
    const occupantEnergy =
      (window.TEUI.parseNumeric(state.getValue("d_63")) *
        activityWatts *
        annualHours) /
      1000;
    // ✅ PLUG LOADS: Complete Excel formula implementation
    // Excel: =IF(ISNUMBER(SEARCH("PH",D13)), 2.1, IF(OR(D12="C - Residential", D12="B1 - Detention", D12="B2 - Care and Treatment", D12="B3 - Detention, Care and Treatment"), 5, 7))

    // Get building standard (d_13) based on calculation mode
    const buildingStandard =
      window.TEUI.StateManager.getValue(isReference ? "ref_d_13" : "d_13") ||
      "";

    let plugLoadDensity;

    // Priority 1: Check for Passive House standards (contains "PH") → 2.1 W/m²
    if (buildingStandard.includes("PH")) {
      plugLoadDensity = 2.1;
    }
    // Priority 2: Check for residential/care occupancies → 5 W/m²
    else {
      const isResidentialOrCare =
        buildingType === "C-Residential" ||
        buildingType === "B1-Detention" ||
        buildingType === "B2-Care and Treatment" ||
        buildingType === "B3-Detention Care & Treatment"; // ✅ Fixed: matches S02 dropdown values

      plugLoadDensity = isResidentialOrCare ? 5 : 7;
    }

    state.setValue("d_65", plugLoadDensity.toString());

    const plugEnergy = (plugLoadDensity * conditionedArea * annualHours) / 1000;
    const lightingEnergy =
      (window.TEUI.parseNumeric(state.getValue("d_66")) *
        conditionedArea *
        annualHours) /
      1000;

    // Equipment loads are complex and depend on a lookup table
    const efficiencyType = state.getValue("g_67");
    const elevatorStatus = state.getValue("d_68");
    const formattedBuildingType = formatBuildingTypeForLookup(buildingType);
    let equipmentDensity = defaultEquipmentLoad;
    if (
      equipmentLoadsTable[formattedBuildingType]?.[efficiencyType]?.[
        elevatorStatus
      ] !== undefined
    ) {
      equipmentDensity =
        equipmentLoadsTable[formattedBuildingType][efficiencyType][
          elevatorStatus
        ];
    }
    const equipmentEnergy =
      (equipmentDensity * conditionedArea * annualHours) / 1000;
    state.setValue("d_67", equipmentDensity.toString()); // ✅ Use consistent formatting via setCalculatedValue

    // --- Heating/Cooling Splits ---
    const { heatingRatio, coolingRatio } =
      calculateHeatingCoolingSplit(isReference);

    // --- Assemble All Results ---
    const results = {
      f_64: activityWatts,
      i_63: annualHours,
      h_64: occupantEnergy,
      i_64: occupantEnergy * heatingRatio,
      k_64: occupantEnergy * coolingRatio,
      d_65: plugLoadDensity, // ✅ Include calculated plug load density
      h_65: plugEnergy,
      i_65: plugEnergy * heatingRatio,
      k_65: plugEnergy * coolingRatio,
      h_66: lightingEnergy,
      i_66: lightingEnergy * heatingRatio,
      k_66: lightingEnergy * coolingRatio,
      d_67: equipmentDensity,
      h_67: equipmentEnergy,
      i_67: equipmentEnergy * heatingRatio,
      k_67: equipmentEnergy * coolingRatio,
      h_69: dhwLosses,
      i_69: dhwLosses * heatingRatio,
      k_69: dhwLosses * coolingRatio,
    };

    // --- Calculate Subtotals and Totals ---
    const pleTotalEnergy = plugEnergy + lightingEnergy + equipmentEnergy;
    results.h_70 = pleTotalEnergy;
    results.i_70 = results.i_65 + results.i_66 + results.i_67;
    results.k_70 = results.k_65 + results.k_66 + results.k_67;

    const totalEnergy = pleTotalEnergy + occupantEnergy + dhwLosses;
    results.h_71 = totalEnergy;
    results.i_71 = results.i_70 + results.i_64 + results.i_69;
    results.k_71 = results.k_70 + results.k_64 + results.k_69;

    return results;
  }

  /**
   * DUAL-ENGINE ORCHESTRATION
   * Replaces the original calculateAll function
   */
  function calculateAll() {
    // console.log('[S09DB] calculateAll() triggered - running dual-engine calculations...');

    calculateReferenceModel();
    calculateTargetModel();

    // console.log('[S09DB] calculateAll() complete - both engines ran');
  }

  /**
   * Initialize all event handlers for this section
   */
  function initializeEventHandlers() {
    const sectionElement = document.getElementById("occupantInternalGains");
    if (!sectionElement) return;

    // Add handlers for editable fields
    const editableFields = sectionElement.querySelectorAll(
      '.user-input, [contenteditable="true"]',
    );
    editableFields.forEach((field) => {
      // Make text fields editable
      if (field.classList.contains("user-input")) {
        field.setAttribute("contenteditable", "true");
      }

      // Handle blur event for text fields
      field.addEventListener("blur", function () {
        const fieldId = this.getAttribute("data-field-id");
        if (!fieldId) return;

        // Handle numeric values
        if (this.getAttribute("contenteditable") === "true") {
          // Get and clean the value
          const newValue = this.textContent.trim();

          // Store via ModeManager (dual-state aware)
          if (ModeManager && typeof ModeManager.setValue === "function") {
            ModeManager.setValue(fieldId, newValue, "user-modified");
          }

          // Format the display using global helper if it's a valid number
          const numericValue = window.TEUI.parseNumeric(newValue);
          if (!isNaN(numericValue)) {
            // Use 'integer' format if it's a whole number, otherwise 'number'
            const formatType = Number.isInteger(numericValue)
              ? "integer"
              : "number";
            this.textContent = window.TEUI.formatNumber(
              numericValue,
              formatType,
            );
          } else {
            // Handle non-numeric input
            this.textContent = window.TEUI.formatNumber(0, "number");
            if (ModeManager && typeof ModeManager.setValue === "function") {
              ModeManager.setValue(fieldId, "0", "user-modified");
            }
          }

          // Recalculate
          calculateAll();
          ModeManager.updateCalculatedDisplayValues();
        }
      });

      // Handle Enter key
      field.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault(); // Prevent adding a newline
          this.blur(); // Remove focus to trigger the blur event
        }
      });
    });

    // Add dropdown change event handlers (following S13 working pattern)
    const dropdowns = sectionElement.querySelectorAll("select");
    // console.log(`[S09DB] DOM SETUP: Found ${dropdowns.length} dropdowns in section`);

    dropdowns.forEach((dropdown, index) => {
      const fieldId = dropdown.getAttribute("data-field-id");
      const currentValue = dropdown.value;
      // console.log(`[S09DB] DOM SETUP: Dropdown ${index}: fieldId="${fieldId}", value="${currentValue}", id="${dropdown.id}"`);

      // Remove any existing handlers to avoid duplicates (S13 pattern)
      dropdown.removeEventListener("change", handleDropdownChange);

      // Add the event listener (S13 pattern)
      dropdown.addEventListener("change", handleDropdownChange);
    });

    // Add special handling for equipment dropdowns
    setupEquipmentDropdownListeners();

    // Add cross-section dependency updates
    addStateManagerListeners();
  }

  /**
   * Handle dropdown changes (following S13 working pattern)
   * ✅ CRITICAL: Store dropdown changes in current state via ModeManager
   */
  function handleDropdownChange(e) {
    // console.log(`[S09DB] DROPDOWN EVENT FIRED! dropdown.value=${e.target.value}`);

    const fieldId = e.target.getAttribute("data-field-id");
    // console.log(`[S09DB] fieldId from dropdown: ${fieldId}`);

    if (!fieldId) {
      console.log(`[S09DB] ERROR: No fieldId found on dropdown!`);
      return;
    }

    const newValue = e.target.value;
    // 🔍 KEY: Only log d_64 changes for debugging downstream flow
    if (fieldId === "d_64") {
      console.log(
        `[S09] 🎯 d_64 changed: ${newValue}, mode=${ModeManager?.currentMode || "unknown"}`,
      );
    }

    // Store via ModeManager (dual-state aware)
    // ✅ StateManager will automatically trigger Clock timing on "user-modified" state
    if (ModeManager && typeof ModeManager.setValue === "function") {
      // console.log(`[S09DB] Calling ModeManager.setValue...`);
      ModeManager.setValue(fieldId, newValue, "user-modified");
    } else {
      console.log(`[S09DB] ERROR: ModeManager.setValue not available!`);
    }

    // Recalculate and update display
    // console.log(`[S09DB] About to call calculateAll() from dropdown handler`);
    calculateAll();
    // console.log(`[S09DB] About to call updateCalculatedDisplayValues()`);
    ModeManager.updateCalculatedDisplayValues();
  }

  /**
   * Add listeners for cross-section dependencies
   */
  function addStateManagerListeners() {
    if (!window.TEUI?.StateManager) return;

    const sm = window.TEUI.StateManager;

    // ✅ PATTERN A DUAL-ENGINE LISTENERS: Complete Target/Reference pairs

    // 1. Conditioned Area (h_15 / ref_h_15)
    sm.addListener("h_15", () => {
      calculateTargetModel();
      ModeManager.updateCalculatedDisplayValues();
    });
    sm.addListener("ref_h_15", () => {
      calculateReferenceModel();
      ModeManager.updateCalculatedDisplayValues();
    });

    // 2. DHW System Losses (d_54 / ref_d_54)
    sm.addListener("d_54", () => {
      const dhwLosses =
        window.TEUI.parseNumeric(getFieldValueModeAware("d_54")) || 0;
      setCalculatedValue("h_69", dhwLosses, "number");
      calculateTargetModel();
      ModeManager.updateCalculatedDisplayValues();
    });
    sm.addListener("ref_d_54", () => {
      // Reference DHW calculation
      const dhwLosses = window.TEUI.parseNumeric(sm.getValue("ref_d_54")) || 0;
      if (ModeManager.currentMode === "reference") {
        setCalculatedValue("h_69", dhwLosses, "number");
      }
      calculateReferenceModel();
      ModeManager.updateCalculatedDisplayValues();
    });

    // 3. Building Type (d_12 / ref_d_12)
    sm.addListener("d_12", () => {
      calculateTargetModel();
      ModeManager.updateCalculatedDisplayValues();
    });
    sm.addListener("ref_d_12", () => {
      // S02 Reference occupancy changed - recalculate affected values
      calculateReferenceModel();
      ModeManager.updateCalculatedDisplayValues();
    });

    // 4. Reference Standard (d_13 / ref_d_13)
    sm.addListener("d_13", () => {
      // Update Reference State with new standard values
      const newStandard = sm.getValue("d_13");
      if (newStandard && ReferenceState.onReferenceStandardChange) {
        ReferenceState.onReferenceStandardChange(newStandard);
        if (ModeManager.currentMode === "reference") {
          ModeManager.refreshUI();
        }
      }
      calculateTargetModel();
      updateAllReferenceIndicators();
      ModeManager.updateCalculatedDisplayValues();
    });
    sm.addListener("ref_d_13", () => {
      // Reference standard changes
      const newStandard = sm.getValue("ref_d_13");
      if (newStandard && ReferenceState.onReferenceStandardChange) {
        ReferenceState.onReferenceStandardChange(newStandard);
        if (ModeManager.currentMode === "reference") {
          ModeManager.refreshUI();
        }
      }
      calculateReferenceModel();
      updateAllReferenceIndicators();
      ModeManager.updateCalculatedDisplayValues();
    });

    // 5. Cooling Days (m_19 / ref_m_19)
    sm.addListener("m_19", () => {
      calculateTargetModel();
      ModeManager.updateCalculatedDisplayValues();
    });
    sm.addListener("ref_m_19", () => {
      calculateReferenceModel();
      ModeManager.updateCalculatedDisplayValues();
    });

    console.log(
      "[S09] ✅ Pattern A dual-engine listeners registered (5 Target/Reference pairs)",
    );
  }

  /**
   * Register with StateManager and set proper default values
   */
  function registerWithStateManager() {
    if (!window.TEUI?.StateManager) return;

    // Register default values with default state (not user-modified)
    // This ensures they are used as initial values but don't override user choices
    if (window.TEUI.StateManager.setValue) {
      window.TEUI.StateManager.setValue("g_67", "Efficient", "default");
      window.TEUI.StateManager.setValue("d_68", "No Elevators", "default");
      // Use local helper for initial calculated value setting
      setCalculatedValue("d_67", 5.0, "number");
    }

    // Register key fields that other sections might depend on
    const keysToRegister = [
      // Total internal gains values
      { id: "h_71", value: "0", state: "calculated" }, // Total internal gains
      { id: "i_71", value: "0", state: "calculated" }, // Heating internal gains
      { id: "k_71", value: "0", state: "calculated" }, // Cooling internal gains

      // Individual loads
      { id: "h_64", value: "0", state: "calculated" }, // Occupant energy
      { id: "h_65", value: "0", state: "calculated" }, // Plug loads
      { id: "h_66", value: "0", state: "calculated" }, // Lighting loads
      { id: "h_67", value: "0", state: "calculated" }, // Equipment loads
      { id: "h_69", value: "0", state: "calculated" }, // DHW system losses
    ];

    // Register each key
    keysToRegister.forEach((key) => {
      window.TEUI.StateManager.setValue(key.id, key.value, key.state);
    });

    // Register cross-section dependencies
    const dependencies = [
      // Building info dependencies
      {
        source: "d_12",
        target: "d_65",
        description: "Plug loads density based on building type",
      },
      {
        source: "d_12",
        target: "h_67",
        description: "Equipment loads based on building type",
      },
      {
        source: "d_13",
        target: "d_65",
        description: "Plug loads density based on reference standard",
      },
      {
        source: "h_15",
        target: "h_65",
        description: "Plug loads total based on conditioned area",
      },
      {
        source: "h_15",
        target: "h_66",
        description: "Lighting loads total based on conditioned area",
      },
      {
        source: "h_15",
        target: "h_67",
        description: "Equipment loads total based on conditioned area",
      },

      // Water use dependency
      { source: "d_54", target: "h_69", description: "DHW system losses" },

      // Cooling days dependency
      {
        source: "m_19",
        target: "i_64",
        description: "Heating/cooling split based on cooling days",
      },
      {
        source: "m_19",
        target: "i_65",
        description: "Heating/cooling split based on cooling days",
      },
      {
        source: "m_19",
        target: "i_66",
        description: "Heating/cooling split based on cooling days",
      },
      {
        source: "m_19",
        target: "i_67",
        description: "Heating/cooling split based on cooling days",
      },
      {
        source: "m_19",
        target: "k_64",
        description: "Heating/cooling split based on cooling days",
      },
      {
        source: "m_19",
        target: "k_65",
        description: "Heating/cooling split based on cooling days",
      },
      {
        source: "m_19",
        target: "k_66",
        description: "Heating/cooling split based on cooling days",
      },
      {
        source: "m_19",
        target: "k_67",
        description: "Heating/cooling split based on cooling days",
      },

      // Key dependencies affecting other sections
      {
        source: "i_71",
        target: "i_80",
        description: "Internal gains contribute to heating utilization factor",
      },
      {
        source: "h_71",
        target: "h_129",
        description: "Internal gains contribute to cooling loads",
      },
    ];

    // Register each dependency
    dependencies.forEach((dep) => {
      window.TEUI.StateManager.registerDependency(
        dep.source,
        dep.target,
        dep.description,
      );
    });
  }

  /**
   * Called when the section is rendered
   */
  function onSectionRendered() {
    // 1. Initialize Pattern A dual-state system
    ModeManager.initialize();

    // 2. ✅ CRITICAL FIX: Immediately publish essential Reference values for downstream sections
    // This prevents S07 from getting "ref_d_63 missing" errors during initialization
    if (window.TEUI?.StateManager?.setValue) {
      window.TEUI.StateManager.setValue(
        "ref_d_63",
        ReferenceState.getValue("d_63") || "126",
        "default",
      );
      window.TEUI.StateManager.setValue(
        "ref_d_64",
        ReferenceState.getValue("d_64") || "Normal",
        "default",
      );
      // ✅ FIX (Oct 27, 2025): Publish j_63 constant (8760 hours/year) for both modes
      // Eliminates FALLBACK_READ and potential state mixing when S13 reads this value
      window.TEUI.StateManager.setValue("j_63", "8760", "calculated");
      window.TEUI.StateManager.setValue("ref_j_63", "8760", "calculated");
      console.log(
        `[S09] 🔗 Published initial ref_d_63=${ReferenceState.getValue("d_63")} for S07`,
      );
      console.log(`[S09] 🔗 Published j_63=8760 and ref_j_63=8760 for S13`);
    }

    // 3. Inject header controls
    injectHeaderControls();

    // 4. Initialize event handlers
    initializeEventHandlers();

    // 5. Sync UI to current state
    ModeManager.refreshUI();

    // 6. ✅ SURGICAL FIX: Calculate and publish initial Reference values
    calculateAll();
    ModeManager.updateCalculatedDisplayValues();

    // 6. Register with state manager and integrator
    registerWithStateManager();
    registerWithSectionIntegrator();

    // Initialize default dropdown values and related calculated fields (Moved from setupValueEnforcement)
    // Check initialization/interaction flags to prevent overriding user changes
    if (
      !(window.TEUI.sect09.initialized && window.TEUI.sect09.userInteracted)
    ) {
      const efficiencyDropdown = document.querySelector(
        'select[data-field-id="g_67"]',
      );
      const elevatorDropdown = document.querySelector(
        'select[data-field-id="d_68"]',
      );
      const densityField = document.querySelector('[data-field-id="d_67"]');

      if (efficiencyDropdown) {
        efficiencyDropdown.value = "Efficient";
        if (window.TEUI?.StateManager?.setValue) {
          window.TEUI.StateManager.setValue("g_67", "Efficient", "default");
        }
      }
      if (elevatorDropdown) {
        elevatorDropdown.value = "No Elevators";
        if (window.TEUI?.StateManager?.setValue) {
          window.TEUI.StateManager.setValue("d_68", "No Elevators", "default");
        }
      }
      if (densityField) {
        // Use local helper for setting default display value
        densityField.textContent = window.TEUI.formatNumber(5.0, "number");
        if (window.TEUI?.StateManager?.setValue) {
          // Store raw default value in state manager
          window.TEUI.StateManager.setValue("d_67", "5.00", "default"); // Store as string
        }
      }
      window.TEUI.sect09.initialized = true;
      // Trigger calculation involving these defaults
      calculateEquipmentLoads();
    }

    // Add checkmark styles
    addCheckmarkStyles();

    // Run initial full calculation (will re-run parts if defaults were set)
    calculateAll();
    ModeManager.updateCalculatedDisplayValues();

    // Apply tooltips after DOM is fully rendered
    if (window.TEUI.TooltipManager && window.TEUI.TooltipManager.initialized) {
      setTimeout(() => {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }
  }

  /**
   * Register with SectionIntegrator
   */
  function registerWithSectionIntegrator() {
    if (!window.TEUI?.SectionIntegrator) return;

    // Create the integration registration
    const internalGainsIntegration = {
      name: "Internal Gains",
      sections: ["sect09", "sect11", "sect14"],
      description: "Internal heat gains for TEDI and energy calculations",
      values: [
        {
          fieldId: "h_71",
          name: "Total Internal Gains",
          unit: "kWh/yr",
          type: "energy-internal",
        },
        {
          fieldId: "i_71",
          name: "Heating Internal Gains",
          unit: "kWh/yr",
          type: "energy-heating",
        },
        {
          fieldId: "k_71",
          name: "Cooling Internal Gains",
          unit: "kWh/yr",
          type: "energy-cooling",
        },
      ],
      initialize: function () {
        // Initial calculation when integration is initialized
        calculateAll();
        ModeManager.updateCalculatedDisplayValues();
      },
    };

    // Register with SectionIntegrator if it has a registry
    if (
      typeof window.TEUI.SectionIntegrator.getRegisteredIntegrations ===
      "function"
    ) {
      const integrations =
        window.TEUI.SectionIntegrator.getRegisteredIntegrations();
      if (!integrations.internalGains) {
        // If the SectionIntegrator has a registeredIntegrations property
        if (window.TEUI.SectionIntegrator.registeredIntegrations) {
          window.TEUI.SectionIntegrator.registeredIntegrations.internalGains =
            internalGainsIntegration;
        }
      }
    }
  }

  /**
   * Set up direct event listeners for equipment-related dropdowns
   * This ensures they trigger equipment load calculations immediately
   */
  function setupEquipmentDropdownListeners() {
    // Map of fieldIds to their descriptions for more generic handling
    const dropdownFields = [
      { fieldId: "g_67", description: "Equipment efficiency" },
      { fieldId: "d_68", description: "Elevator status" },
      // ❌ REMOVED d_12: S09 should NOT listen to S02's dropdown directly
      // S09 already has StateManager listeners for d_12/ref_d_12 (lines 2301-2309)
      // Listening to the dropdown causes state mixing because S09's ModeManager
      // is in target mode while S02's dropdown is in reference mode
    ];

    // Set up listeners for all relevant dropdowns
    dropdownFields.forEach((field) => {
      const dropdown = document.querySelector(
        `select[data-field-id="${field.fieldId}"]`,
      );
      if (!dropdown) return;

      // Remove existing listeners by cloning
      const newDropdown = dropdown.cloneNode(true);
      if (dropdown.parentNode) {
        dropdown.parentNode.replaceChild(newDropdown, dropdown);
      }

      // Add change listener
      newDropdown.addEventListener("change", function (e) {
        const fieldId = this.getAttribute("data-field-id"); // Get fieldId here
        if (!fieldId) return; // Exit if no fieldId

        // Flag as user interacted for original section09 dropdowns
        if (
          (field.fieldId === "g_67" || field.fieldId === "d_68") &&
          e.isTrusted
        ) {
          if (window.TEUI && window.TEUI.sect09) {
            window.TEUI.sect09.userInteracted = true;
          }
        }

        // Store via ModeManager (dual-state aware)
        if (ModeManager && typeof ModeManager.setValue === "function") {
          const state = e.isTrusted ? "user-modified" : "calculated";
          ModeManager.setValue(field.fieldId, this.value, state);
        }

        // Trigger calculation - Ensure dependent calculations run
        calculateAll();
        ModeManager.updateCalculatedDisplayValues();
      });
    });
  }

  /**
   * Helper function to set class on an element
   */
  function setElementClass(fieldId, className) {
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (element) {
      // Remove existing style classes
      element.classList.remove("checkmark", "warning");
      // Add new class
      element.classList.add(className);
    }
  }

  // Add CSS styles for checkmarks and X marks
  function addCheckmarkStyles() {
    // Check if the styles already exist
    let styleElement = document.getElementById("checkmark-styles");
    if (!styleElement) {
      // Create style element
      styleElement = document.createElement("style");
      styleElement.id = "checkmark-styles";
      styleElement.textContent = `
                .checkmark {
                    color: green;
                    font-weight: bold;
                }
                .warning {
                    color: red;
                    font-weight: bold;
                }
            `;
      document.head.appendChild(styleElement);
    }
  }

  /**
   * Sets indicator classes (e.g., gain-high, gain-medium, gain-low) for a cell.
   * Removes existing indicator classes before adding the new one.
   * @param {string} fieldId - The data-field-id of the cell element.
   * @param {string} newClass - The new indicator class to add (or empty string to remove all).
   * @param {string[]} potentialClasses - An array of all possible indicator classes for this type.
   */
  function setIndicatorClass(fieldId, newClass, potentialClasses) {
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (element) {
      const baseClass = "gain-indicator"; // Always gain for this section
      element.classList.remove(...potentialClasses);
      if (newClass) {
        element.classList.add(newClass);
        if (!element.classList.contains(baseClass)) {
          element.classList.add(baseClass);
        }
      } else {
        element.classList.remove(baseClass);
      }
    }
  }

  //==========================================================================
  // REFERENCE INDICATOR CONFIGURATION
  //==========================================================================

  // T-cell comparison configuration for Section 09
  const referenceComparisons = {
    d_65: {
      type: "lower-is-better",
      tCell: "t_65",
      description: "Plug Loads W/m²",
    },
    d_66: {
      type: "lower-is-better",
      tCell: "t_66",
      description: "Lighting Loads W/m²",
    },
    g_67: {
      type: "higher-is-better",
      tCell: "t_67",
      description: "Equipment Efficiency Spec",
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
   * MODE-AWARE: Reference mode shows 100%/✓, Target mode shows actual comparison
   * @param {string} fieldId - The application field ID to update
   */
  function updateReferenceIndicator(fieldId) {
    const config = referenceComparisons[fieldId];
    if (!config) return;

    const rowId = fieldId.match(/\d+$/)?.[0];
    if (!rowId) return;

    const mFieldId = `m_${rowId}`;
    const nFieldId = `n_${rowId}`;

    // **REFERENCE MODE: Always show 100%/✓ (Perfect Compliance)**
    if (ModeManager.currentMode === "reference") {
      setCalculatedValue(mFieldId, 1.0, "percent-0dp"); // Always 100%
      const nElement = document.querySelector(`[data-field-id="${nFieldId}"]`);
      if (nElement) {
        nElement.textContent = "✓"; // Always pass
        setElementClass(nFieldId, "checkmark");
      }
      return;
    }

    // **TARGET MODE: Compare user design against Reference values**
    try {
      const currentValue = getNumericValue(fieldId);
      let referenceValue;
      let referencePercent = 1;
      let isGood = true;

      // Get appropriate reference value based on field
      if (fieldId === "d_65" || fieldId === "d_66") {
        // Rows 65, 66: Use dynamic values from ReferenceValues.js
        const currentStandard =
          window.TEUI?.StateManager?.getValue?.("d_13") || "OBC SB10 5.5-6 Z6";
        const referenceValues =
          window.TEUI?.ReferenceValues?.[currentStandard] || {};

        if (fieldId === "d_65") {
          // Plug loads: Use t_65 from ReferenceValues.js (typically 7.0 for most standards)
          referenceValue =
            window.TEUI.parseNumeric(referenceValues.t_65) || 7.0;
        } else if (fieldId === "d_66") {
          // Lighting loads: Use t_66 from ReferenceValues.js (typically 2.0 for most standards)
          referenceValue =
            window.TEUI.parseNumeric(referenceValues.t_66) || 2.0;
        }

        // For both plug and lighting: lower is better
        const currentValueNum = window.TEUI.parseNumeric(currentValue);
        const refValueNum = window.TEUI.parseNumeric(referenceValue);

        if (currentValueNum > 0 && refValueNum > 0) {
          referencePercent = refValueNum / currentValueNum; // Reference/Current for "lower is better"
          isGood = currentValueNum <= refValueNum;
        }
      } else if (fieldId === "g_67") {
        // Row 67: Simple comparison of Reference d_67 / Target d_67
        const targetEquipmentDensity = window.TEUI.parseNumeric(
          TargetState.getValue("d_67"),
        );
        const referenceEquipmentDensity = window.TEUI.parseNumeric(
          ReferenceState.getValue("d_67"),
        );

        if (targetEquipmentDensity > 0 && referenceEquipmentDensity > 0) {
          // Calculate: Reference / Target (e.g., 7.00 / 5.00 = 140%)
          referencePercent = referenceEquipmentDensity / targetEquipmentDensity;
          isGood = targetEquipmentDensity <= referenceEquipmentDensity;
        }
      }

      // Update Column M (Reference %)
      setCalculatedValue(mFieldId, referencePercent, "percent-0dp");

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
      // Fallback: show 100%/✓ on error
      setCalculatedValue(mFieldId, 1.0, "percent-0dp");
      const nElement = document.querySelector(`[data-field-id="${nFieldId}"]`);
      if (nElement) {
        nElement.textContent = "✓";
        setElementClass(nFieldId, "checkmark");
      }
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

    // ✅ PHASE 2: Expose state objects for import sync
    TargetState: TargetState,
    ReferenceState: ReferenceState,

    // Section-specific utility functions - OPTIONAL
    calculateAll: calculateAll,
    calculateOccupantEnergy: calculateOccupantEnergy,
    calculateLightingLoads: calculateLightingLoads,
    calculateEquipmentLoads: calculateEquipmentLoads,
    calculateTotals: calculateTotals,
    setupEquipmentDropdownListeners: setupEquipmentDropdownListeners,

    // Registration functions
    registerWithStateManager: registerWithStateManager,
    registerWithSectionIntegrator: registerWithSectionIntegrator,

    // Public values needed by other sections
    getInternalGainsTotal: function () {
      return getFieldValueModeAware("h_71");
    },
    getInternalGainsHeating: function () {
      return getFieldValueModeAware("i_71");
    },
    getInternalGainsCooling: function () {
      return getFieldValueModeAware("k_71");
    },
    // ✅ CRITICAL FIX: Expose ModeManager for FieldManager integration
    ModeManager: ModeManager,
  };
})();

// Initialize when the section is rendered - THIS IS THE PRIMARY INITIALIZATION POINT
document.addEventListener("teui-section-rendered", function (event) {
  if (event.detail?.sectionId === "occupantInternalGains") {
    // PERFORMANCE FIX: Execute initialization immediately to avoid requestAnimationFrame violations
    // Heavy initialization work should not be in animation frames (causes 99-116ms violations)
    if (window.TEUI?.SectionModules?.sect09?.onSectionRendered) {
      window.TEUI.SectionModules.sect09.onSectionRendered();
    }
  }
});

// Make sure we have the calculateTEUI function
if (
  typeof window.calculateTEUI !== "function" &&
  window.TEUI?.StateManager?.updateTEUICalculations
) {
  window.calculateTEUI = function () {
    window.TEUI.StateManager.updateTEUICalculations("global-fallback");
  };
}
