/**
 * 4012-Section08.js
 * Indoor Air Quality (Section 8) module for TEUI Calculator 4.012
 *
 * REFACTORED: Uses the self-contained DualState architecture proven in Section 03.
 * This pattern provides robust state isolation for Target and Reference modes.
 */

window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};
window.TEUI.sect08 = window.TEUI.sect08 || {};

window.TEUI.SectionModules.sect08 = (function () {
  //==========================================================================
  // DUAL-STATE ARCHITECTURE (Self-Contained Module Pattern)
  //==========================================================================

  const TargetState = {
    state: {},
    initialize: function () {
      this.setDefaults();
    },
    setDefaults: function () {
      const defaults = {};
      const fields = getFields();
      for (const fieldId in fields) {
        if (fields[fieldId].defaultValue) {
          defaults[fieldId] = fields[fieldId].defaultValue;
        }
      }
      this.state = defaults;
    },
    /**
     * ✅ PHASE 2: Sync from global StateManager after import
     * Bridges global StateManager → isolated TargetState for imported values
     */
    syncFromGlobalState: function (
      fieldIds = ["d_56", "d_57", "d_58", "d_59"],
    ) {
      fieldIds.forEach((fieldId) => {
        const globalValue = window.TEUI.StateManager.getValue(fieldId);
        if (globalValue !== null && globalValue !== undefined) {
          this.setValue(fieldId, globalValue);
          console.log(
            `S08 TargetState: Synced ${fieldId} = ${globalValue} from global StateManager`,
          );
        }
      });
    },
    setValue: function (fieldId, value) {
      this.state[fieldId] = value;
    },
    getValue: function (fieldId) {
      return this.state[fieldId];
    },
  };

  const ReferenceState = {
    state: {},
    initialize: function () {
      this.setDefaults();
    },
    setDefaults: function () {
      const defaults = {};
      const fields = getFields();
      for (const fieldId in fields) {
        if (fields[fieldId].defaultValue) {
          defaults[fieldId] = fields[fieldId].defaultValue;
        }
      }
      // Apply Reference-specific overrides - IS THIS CAUSING PROBLEMS??
      defaults["d_56"] = "150";
      defaults["d_57"] = "1000";
      defaults["d_58"] = "400";
      defaults["d_59"] = "45";
      defaults["i_59"] = "45";
      this.state = defaults;
    },
    /**
     * ✅ PHASE 2: Sync from global StateManager after import
     * Bridges global StateManager → isolated ReferenceState for imported values
     */
    syncFromGlobalState: function (
      fieldIds = ["d_56", "d_57", "d_58", "d_59"],
    ) {
      fieldIds.forEach((fieldId) => {
        const refFieldId = `ref_${fieldId}`;
        const globalValue = window.TEUI.StateManager.getValue(refFieldId);
        if (globalValue !== null && globalValue !== undefined) {
          this.setValue(fieldId, globalValue);
          console.log(
            `S08 ReferenceState: Synced ${fieldId} = ${globalValue} from global StateManager (${refFieldId})`,
          );
        }
      });
    },
    setValue: function (fieldId, value) {
      this.state[fieldId] = value;
    },
    getValue: function (fieldId) {
      return this.state[fieldId];
    },
  };

  const ModeManager = {
    currentMode: "target",
    initialize: function () {
      TargetState.initialize();
      ReferenceState.initialize();
    },
    switchMode: function (newMode) {
      if (
        this.currentMode === newMode ||
        (newMode !== "target" && newMode !== "reference")
      )
        return;
      this.currentMode = newMode;
      console.log(`S08: Switched to ${this.currentMode.toUpperCase()} mode.`);

      // ✅ CORRECTED: Only refresh UI, don't re-run calculations.
      // Both engines should already have calculated values stored in StateManager.
      this.updateUIForMode();
      this.updateCalculatedDisplayValues(); // This will handle the DOM updates.
    },
    updateUIForMode: function () {
      const sectionElement = document.getElementById("indoorAirQuality");
      if (!sectionElement) return;

      const currentState = this.getCurrentState();
      const fieldsToSync = ["d_56", "d_57", "d_58", "d_59", "i_59"];

      fieldsToSync.forEach((fieldId) => {
        const element = sectionElement.querySelector(
          `[data-field-id="${fieldId}"]`,
        );
        const stateValue = currentState.getValue(fieldId);

        if (!element || stateValue === undefined || stateValue === null) return;

        let slider =
          element.querySelector('input[type="range"]') ||
          (element.matches('input[type="range"]') ? element : null);

        if (slider) {
          slider.value = stateValue;
          const display = slider.nextElementSibling;
          if (display) display.textContent = `${stateValue}%`;
        } else if (element.isContentEditable) {
          element.textContent = stateValue;
        }
      });
    },

    updateCalculatedDisplayValues: function () {
      const calculatedFields = [
        "d_60",
        "k_56",
        "k_57",
        "k_58",
        "k_59",
        "m_56",
        "m_57",
        "m_58",
        "m_59",
        "n_56",
        "n_57",
        "n_58",
        "n_59",
      ];

      calculatedFields.forEach((fieldId) => {
        const element = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (element) {
          let value;
          // For this section, Target and Reference values are calculated from different inputs
          // but stored with the same fieldId in their respective state objects.
          if (this.currentMode === "reference") {
            value = ReferenceState.getValue(fieldId) || "0";
          } else {
            value = TargetState.getValue(fieldId) || "0";
          }

          const formatType = getFieldFormat(fieldId);
          const formattedValue =
            window.TEUI?.formatNumber?.(value, formatType) ?? value;
          element.textContent = formattedValue;
        }
      });
    },

    getCurrentState: function () {
      return this.currentMode === "target" ? TargetState : ReferenceState;
    },
    setValue: function (fieldId, value) {
      this.getCurrentState().setValue(fieldId, value);
      // Bridge to global StateManager for backward compatibility
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
    getValue: function (fieldId) {
      return this.getCurrentState().getValue(fieldId);
    },
  };

  // Expose ModeManager for the local toggle to use
  window.TEUI.sect08.ModeManager = ModeManager;

  //==========================================================================
  // HELPER FUNCTIONS (Simplified to use the new DualState pattern)
  //==========================================================================
  function getNumericValue(fieldId, defaultValue = 0) {
    const rawValue = ModeManager.getValue(fieldId);
    return window.TEUI?.parseNumeric?.(rawValue, defaultValue) ?? defaultValue;
  }

  function setCalculatedValue(fieldId, rawValue) {
    const valueToStore = isFinite(rawValue) ? rawValue.toString() : "N/A";

    // The calculation functions will be run for both models, so we need to know
    // which state to write to. We'll check the current UI mode for simplicity,
    // assuming calculations are triggered appropriately.
    if (ModeManager.currentMode === "reference") {
      ReferenceState.setValue(fieldId, valueToStore);
    } else {
      TargetState.setValue(fieldId, valueToStore);
    }
  }

  // getFieldFormat and setElementClass remain largely the same, but ensure they respect the current mode
  function getFieldFormat(fieldId) {
    const formatMap = {
      d_56: "number-0dp",
      d_57: "number-0dp",
      d_58: "number-0dp",
      d_59: "number-0dp",
      i_59: "number-0dp",
      d_60: "number-2dp-comma",
      k_56: "number-0dp",
      k_57: "number-0dp",
      k_58: "number-0dp",
      m_56: "percent-0dp",
      m_57: "percent-0dp",
      m_58: "percent-0dp",
      m_59: "percent-0dp",
      n_56: "raw",
      n_57: "raw",
      n_58: "raw",
      n_59: "raw",
    };
    return formatMap[fieldId] || "number-0dp";
  }

  function setElementClass(fieldId, className) {
    if (ModeManager.currentMode !== "target") return;
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (element) {
      element.classList.remove("checkmark", "warning");
      if (className) element.classList.add(className);
    }
  }

  //==========================================================================
  // CALCULATION LOGIC (Unchanged, now uses new helpers)
  //==========================================================================
  function calculateAll() {
    calculateWoodOffset();
    calculateAirQualityStatus();
  }

  function calculateWoodOffset() {
    // ✅ Read from StateManager (S04's calculated values)
    const d31_actualWoodUse = window.TEUI?.StateManager?.getValue("d_31") || 0;
    const k31_targetWoodEmissions =
      window.TEUI?.StateManager?.getValue("k_31") || 0;

    const d31_parsed = window.TEUI?.parseNumeric?.(d31_actualWoodUse, 0) ?? 0;
    const k31_parsed =
      window.TEUI?.parseNumeric?.(k31_targetWoodEmissions, 0) ?? 0;

    // Excel formula: =IF(D31 > 0, K31/1000, 0)
    const woodOffset = d31_parsed > 0 ? k31_parsed / 1000 : 0;

    setCalculatedValue("d_60", woodOffset);

    // ✅ CRITICAL: Store in StateManager for S04 to consume
    if (window.TEUI?.StateManager) {
      window.TEUI.StateManager.setValue("d_60", woodOffset, "calculated");
    }

    return woodOffset;
  }

  function calculateAirQualityStatus() {
    // ... (rest of the function is unchanged, it will now use the new helpers)
    setCalculatedValue("k_56", 150);
    setCalculatedValue("k_57", 1000);
    setCalculatedValue("k_58", 400);
    setCalculatedValue("k_59", "30-60");

    const radonValue = getNumericValue("d_56");
    const co2Value = getNumericValue("d_57");
    const tvocValue = getNumericValue("d_58");
    const heatingHumidity = getNumericValue("d_59");
    const coolingHumidity = getNumericValue("i_59");

    const radonPercent = radonValue / 150;
    setCalculatedValue("m_56", radonPercent);
    setCalculatedValue("n_56", radonValue <= 150 ? "✓" : "✗");
    setElementClass("n_56", radonValue <= 150 ? "checkmark" : "warning");

    const co2Percent = co2Value / 1000;
    setCalculatedValue("m_57", co2Percent);
    setCalculatedValue("n_57", co2Value <= 1000 ? "✓" : "✗");
    setElementClass("n_57", co2Value <= 1000 ? "checkmark" : "warning");

    const tvocPercent = tvocValue / 400;
    setCalculatedValue("m_58", tvocPercent);
    setCalculatedValue("n_58", tvocValue <= 400 ? "✓" : "✗");
    setElementClass("n_58", tvocValue <= 400 ? "checkmark" : "warning");

    const averageHumidity = (heatingHumidity + coolingHumidity) / 2;
    const humidityPercent = averageHumidity / 45;
    setCalculatedValue("m_59", humidityPercent);
    const isInRange =
      heatingHumidity >= 30 &&
      heatingHumidity <= 60 &&
      coolingHumidity >= 30 &&
      coolingHumidity <= 60;
    setCalculatedValue("n_59", isInRange ? "✓" : "✗");
    setElementClass("n_59", isInRange ? "checkmark" : "warning");
  }

  //==========================================================================
  // EVENT HANDLING (Simplified to use the new DualState pattern)
  //==========================================================================
  function handleUserInput(event) {
    const target = event.target;
    const fieldElement = target.closest("[data-field-id]");
    if (!fieldElement) return;

    const fieldId = fieldElement.getAttribute("data-field-id");
    const value = target.matches('input[type="range"]')
      ? target.value
      : target.textContent.trim();

    ModeManager.setValue(fieldId, value); // Let the ModeManager handle state

    if (target.matches('input[type="range"]')) {
      const display = target.nextElementSibling;
      if (display) display.textContent = `${value}%`;
    }

    calculateAll();
  }

  function initializeEventHandlers() {
    const sectionElement = document.getElementById("indoorAirQuality");
    if (!sectionElement) return;

    sectionElement.addEventListener("input", (e) => {
      if (e.target.matches('input[type="range"]')) handleUserInput(e);
    });

    sectionElement.addEventListener(
      "blur",
      (e) => {
        if (e.target.matches('[contenteditable="true"]')) handleUserInput(e);
      },
      true,
    );

    sectionElement.addEventListener("keydown", (e) => {
      if (e.target.matches('[contenteditable="true"]') && e.key === "Enter") {
        e.preventDefault();
        e.target.blur();
      }
    });

    // Listen to external dependencies via global StateManager
    if (window.TEUI?.StateManager) {
      const sm = window.TEUI.StateManager;
      const dependencies = ["d_31", "k_31"];
      dependencies.forEach((dep) => {
        sm.addListener(dep, calculateAll);
      });

      // ✅ FIX: Add listener for the reference RH% slider (i_59)
      // This bridges the global FieldManager update to the local ReferenceState,
      // ensuring that changes to the slider in reference mode are captured.
      sm.addListener("ref_i_59", (newValue) => {
        ReferenceState.setValue("i_59", newValue);
        console.log(`S08 ReferenceState: Synced i_59 = ${newValue} from global StateManager (ref_i_59)`);
      });
    }
  }

  //==========================================================================
  // SECTION-LOCAL TOGGLE (Unchanged)
  //==========================================================================
  function injectLocalToggle() {
    const sectionHeader = document.querySelector(
      "#indoorAirQuality .section-header",
    );
    if (
      !sectionHeader ||
      sectionHeader.querySelector(".local-toggle-container")
    )
      return;

    const toggleContainer = document.createElement("div");
    toggleContainer.className = "local-toggle-container";
    toggleContainer.style.cssText =
      "display: flex; align-items: center; margin-left: auto; gap: 10px;";

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

    toggleContainer.appendChild(stateIndicator);
    toggleContainer.appendChild(toggleSwitch);
    sectionHeader.appendChild(toggleContainer);
  }

  //==========================================================================
  // LAYOUT & INITIALIZATION
  //==========================================================================
  const sectionRows = {
    header: {
      id: "08-ID",
      rowId: "08-ID",
      cells: {
        c: { content: "C", classes: ["section-subheader"] },
        d: { content: "Targeted", classes: ["section-subheader"] },
        e: { content: "E", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "G", classes: ["section-subheader"] },
        h: { content: "H", classes: ["section-subheader"] },
        i: { content: "I", classes: ["section-subheader"] },
        j: { content: "J", classes: ["section-subheader"] },
        k: { content: "Guidance Limits", classes: ["section-subheader"] },
        l: { content: "L", classes: ["section-subheader"] },
        m: {
          content: "% per Health Canada/NBC",
          classes: ["section-subheader"],
        },
        n: { content: "Status", classes: ["section-subheader"] },
      },
    },
    56: {
      id: "A.2",
      label: "Radon (annual avg.)",
      cells: {
        c: { label: "Radon (annual avg.)" },
        d: {
          fieldId: "d_56",
          type: "editable",
          value: "50",
          classes: ["user-input"],
        },
        e: { content: "Bq/m³" },
        k: { fieldId: "k_56", type: "calculated", value: "150" },
        l: { content: "Bq/m³" },
        m: { fieldId: "m_56", type: "calculated", value: "0%" },
        n: {
          fieldId: "n_56",
          type: "calculated",
          value: "✓",
          classes: ["checkmark"],
        },
      },
    },
    57: {
      id: "A.3",
      label: "CO2 (annual avg.)",
      cells: {
        c: { label: "CO2 (annual avg.)" },
        d: {
          fieldId: "d_57",
          type: "editable",
          value: "550",
          classes: ["user-input"],
        },
        e: { content: "ppm" },
        k: { fieldId: "k_57", type: "calculated", value: "1000" },
        l: { content: "ppm" },
        m: { fieldId: "m_57", type: "calculated", value: "0%" },
        n: {
          fieldId: "n_57",
          type: "calculated",
          value: "✓",
          classes: ["checkmark"],
        },
      },
    },
    58: {
      id: "A.4",
      label: "TVOC (annual avg.)",
      cells: {
        c: { label: "TVOC (annual avg.)" },
        d: {
          fieldId: "d_58",
          type: "editable",
          value: "100",
          classes: ["user-input"],
        },
        e: { content: "ppm" },
        k: { fieldId: "k_58", type: "calculated", value: "400" },
        l: { content: "ppm" },
        m: { fieldId: "m_58", type: "calculated", value: "0%" },
        n: {
          fieldId: "n_58",
          type: "calculated",
          value: "✓",
          classes: ["checkmark"],
        },
      },
    },
    59: {
      id: "A.5.1",
      label: "Indoor Heating Season Avg.",
      cells: {
        c: { label: "Indoor Heating Season Avg." },
        d: {
          fieldId: "d_59",
          type: "percentage",
          value: "45",
          min: 0,
          max: 100,
          step: 1,
          classes: ["user-input"],
          tooltip: true, // RH% Annual Average
        },
        e: { content: "% RH" },
        f: { content: "A.5.2" },
        g: { label: "" },
        h: { content: "Indoor Cooling Season Avg." },
        i: {
          fieldId: "i_59",
          type: "percentage",
          value: "45",
          min: 0,
          max: 100,
          step: 1,
          classes: ["user-input"],
          tooltip: true, // RH% Annual Average
        },
        j: { content: "% RH" },
        k: { fieldId: "k_59", type: "calculated", value: "30-60" },
        l: { content: "%" },
        m: { fieldId: "m_59", type: "calculated", value: "0%" },
        n: {
          fieldId: "n_59",
          type: "calculated",
          value: "✓",
          classes: ["checkmark"],
        },
      },
    },
    60: {
      id: "A.6",
      label: "Wood Emissions Offset (Calculated)",
      cells: {
        c: { label: "Wood Emissions Offset (Calculated from Target Wood Use)" },
        d: {
          fieldId: "d_60",
          type: "calculated",
          value: "0.00",
          tooltip: true,
        },
        e: { content: "MT/yr CO2e" },
      },
    },
  };

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
            section: "indoorAirQuality",
          };
          if (cell.min !== undefined) fields[cell.fieldId].min = cell.min;
          if (cell.max !== undefined) fields[cell.fieldId].max = cell.max;
          if (cell.step !== undefined) fields[cell.fieldId].step = cell.step;
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
      const cell = row.cells?.[col] || {};
      if (col === "c" && !cell.label && row.label) cell.label = row.label;
      rowDef.cells.push(cell);
    });
    return rowDef;
  }

  function onSectionRendered() {
    ModeManager.initialize();
    addStatusStyles();
    injectLocalToggle();
    initializeEventHandlers();

    // ✅ CRITICAL: Setup S04 listeners for wood offset calculation
    setupS04Listeners();

    ModeManager.updateUIForMode();
    calculateAll();

    // ✅ Force calculation after a delay to catch S04 initialization
    setTimeout(() => {
      calculateWoodOffset();
    }, 500);

    // Apply validation tooltips to fields
    if (window.TEUI.TooltipManager && window.TEUI.TooltipManager.initialized) {
      setTimeout(() => {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }
  }

  /**
   * Setup listeners for S04 fields that affect d_60 (Wood Offset)
   */
  function setupS04Listeners() {
    if (window.TEUI?.StateManager) {
      // Listen for S04's actual wood use (d_31)
      window.TEUI.StateManager.addListener("d_31", () => {
        setTimeout(() => calculateWoodOffset(), 100); // Small delay to ensure S04 calculations complete
      });

      // Listen for S04's target wood emissions (k_31)
      window.TEUI.StateManager.addListener("k_31", () => {
        setTimeout(() => calculateWoodOffset(), 100); // Small delay to ensure S04 calculations complete
      });

      console.log("[S08] S04 listeners setup complete");
    } else {
      console.warn("[S08] StateManager not available for S04 listeners");
    }
  }

  function addStatusStyles() {
    if (!document.getElementById("air-quality-status-styles")) {
      const styleElement = document.createElement("style");
      styleElement.id = "air-quality-status-styles";
      styleElement.textContent = `
        .checkmark { color: #28a745 !important; font-weight: bold; font-size: 1.2em; }
        .warning { color: #dc3545 !important; font-weight: bold; font-size: 1.2em; }
      `;
      document.head.appendChild(styleElement);
    }
  }

  return {
    getFields,
    getDropdownOptions,
    getLayout,
    onSectionRendered,
    calculateAll,
    ModeManager, // Expose for external control if needed
    // ✅ PHASE 2: Expose state objects for import sync
    TargetState: TargetState,
    ReferenceState: ReferenceState,
  };
})();
