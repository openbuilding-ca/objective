/**
 * SectionXX.js - TEUI 4.012 Dual-State Pattern A Template
 * Updated: 2025.12.06 - Streamlined to 728 lines (47% reduction from 1353)
 *
 * CRITICAL ARCHITECTURE:
 * - Dual-engine calculations (Target + Reference run in parallel)
 * - UI toggle is display-only (no calculations in switchMode)
 * - State sovereignty (isolated TargetState/ReferenceState)
 * - Dual storage pattern (local state + StateManager sync)
 *
 * DOCUMENTATION:
 * - Architecture: @docs/TECHNICAL2.md (Section 5: Module Architecture)
 * - This template is referenced in TECHNICAL2.md as canonical Pattern A implementation
 *
 * PROVEN PATTERNS:
 * - Section07.js (Water Use) - Latest refactored Pattern A with M-N compliance
 * - Section11.js (Envelope) - Complex calculations reference
 * - Section13.js (Mechanical Loads) - Multi-mode calculations reference
 *
 * STRUCTURE (9 logical blocks):
 * 1. Field Definitions    → 2. Accessor Methods     → 3. State Objects
 * 4. Mode Manager         → 5. Helper Functions     → 6. Calculation Engines
 * 7. UI Management        → 8. Event Handling       → 9. Lifecycle & Public API
 */

window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

window.TEUI.SectionModules.sectXX = (function () {
  //==========================================================================
  // 1. FIELD DEFINITIONS (Single Source of Truth)
  //==========================================================================

  const sectionRows = {
    // Unit header - ALWAYS FIRST
    header: {
      id: "SXX-ID",
      rowId: "SXX-ID",
      cells: {
        c: { content: "C", classes: ["section-subheader"] },
        d: { content: "D", classes: ["section-subheader"] },
        e: { content: "E", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "G", classes: ["section-subheader"] },
        h: { content: "H", classes: ["section-subheader"] },
        i: { content: "I", classes: ["section-subheader"] },
        j: { content: "J", classes: ["section-subheader"] },
        k: { content: "K", classes: ["section-subheader"] },
        l: { content: "L", classes: ["section-subheader"] },
        m: { content: "M", classes: ["section-subheader"] },
        n: { content: "N", classes: ["section-subheader"] },
      },
    },

    // Example row with various field types
    xx: {
      id: "X.1",
      rowId: "X.1",
      label: "Example Row Label",
      cells: {
        c: { label: "Example Row Label" },
        d: {
          fieldId: "d_xx",
          type: "dropdown",
          dropdownId: "d_xx",
          value: "Default Option",
          tooltip: true,
          label: "Dropdown Field",
          options: ["Option 1", "Option 2", "Option 3"],
        },
        e: {
          fieldId: "e_xx",
          type: "editable",
          value: "100.00",
          classes: ["user-input"],
          tooltip: true,
          label: "User Input Field",
        },
        f: { content: "units", classes: ["text-left"] },
        h: {
          fieldId: "h_xx",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_xx", "e_xx"],
          label: "Calculated Result",
        },
        i: {
          fieldId: "i_xx",
          type: "percentage",
          value: "50",
          min: 0,
          max: 100,
          step: 5,
          classes: ["user-input"],
          tooltip: true,
          label: "Slider Input",
        },
        j: { content: "%", classes: ["text-left"] },
        k: {},
        l: {},
        m: {
          fieldId: "m_xx",
          type: "calculated",
          value: "100%",
          dependencies: ["h_xx", "ref_h_xx"],
          label: "Compliance %",
        },
        n: {
          fieldId: "n_xx",
          type: "calculated",
          value: "✓",
          dependencies: ["m_xx"],
          label: "Compliance Status",
        },
      },
    },

    // Add more rows following this pattern
  };

  //==========================================================================
  // 2. ACCESSOR METHODS (FieldManager Integration)
  //==========================================================================

  function getFields() {
    const fields = {};
    Object.values(sectionRows).forEach(row => {
      if (!row.cells) return;
      Object.values(row.cells).forEach(cell => {
        if (cell.fieldId) {
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.label || cell.content || row.label,
            defaultValue: cell.value || "",
            section: "sectionXX",
          };
          if (cell.dropdownId)
            fields[cell.fieldId].dropdownId = cell.dropdownId;
          if (cell.options) fields[cell.fieldId].options = cell.options;
          if (cell.min !== undefined) fields[cell.fieldId].min = cell.min;
          if (cell.max !== undefined) fields[cell.fieldId].max = cell.max;
          if (cell.step !== undefined) fields[cell.fieldId].step = cell.step;
          if (cell.dependencies)
            fields[cell.fieldId].dependencies = cell.dependencies;
          if (cell.conditionalDeps)
            fields[cell.fieldId].conditionalDeps = cell.conditionalDeps;
        }
      });
    });
    return fields;
  }

  function getDropdownOptions() {
    const options = {};
    Object.values(sectionRows).forEach(row => {
      if (!row.cells) return;
      Object.values(row.cells).forEach(cell => {
        if (cell.type === "dropdown" && cell.dropdownId && cell.options) {
          options[cell.dropdownId] = cell.options.map(opt => ({
            value: opt,
            name: opt,
          }));
        }
      });
    });
    return options;
  }

  function getLayout() {
    const layoutRows = [];
    if (sectionRows["header"])
      layoutRows.push(createLayoutRow(sectionRows["header"]));
    Object.keys(sectionRows).forEach(key => {
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
    columns.forEach(col => {
      const cell = row.cells?.[col] || {};
      if (col === "c" && !cell.label && row.label) cell.label = row.label;
      rowDef.cells.push(cell);
    });
    return rowDef;
  }

  //==========================================================================
  // 3. STATE OBJECTS (Pattern A Dual-State Architecture)
  //==========================================================================

  const TargetState = {
    values: {},

    getValue: function (fieldId) {
      return this.values[fieldId] || null;
    },

    setValue: function (fieldId, value) {
      this.values[fieldId] = value;
    },

    getNumericValue: function (fieldId, defaultValue = 0) {
      const value = this.getValue(fieldId);
      if (value === null || value === undefined || value === "")
        return defaultValue;
      const parsed =
        window.TEUI?.parseNumeric?.(value, defaultValue) ?? parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    },

    setDefaults: function () {
      console.log("[SXX] TargetState: Initializing from FieldDefinitions");
      // Set defaults from field definitions
      this.values.d_xx =
        ModeManager.getFieldDefault("d_xx") || "Default Option";
      this.values.e_xx = ModeManager.getFieldDefault("e_xx") || "100.00";
      this.values.i_xx = ModeManager.getFieldDefault("i_xx") || "50";

      // Publish to StateManager for cross-section communication
      if (window.TEUI?.StateManager) {
        Object.keys(this.values).forEach(fieldId => {
          window.TEUI.StateManager.setValue(
            fieldId,
            this.values[fieldId],
            "default"
          );
        });
        console.log("[SXX] TargetState: Published defaults to StateManager");
      }
    },

    syncFromGlobalState: function (fieldIds = ["d_xx", "e_xx", "i_xx"]) {
      fieldIds.forEach(fieldId => {
        const globalValue = window.TEUI.StateManager.getValue(fieldId);
        if (globalValue !== null && globalValue !== undefined) {
          this.setValue(fieldId, globalValue);
          console.log(
            `[SXX] TargetState: Synced ${fieldId} = ${globalValue} from StateManager`
          );
        }
      });
    },
  };

  const ReferenceState = {
    values: {},

    getValue: function (fieldId) {
      return this.values[fieldId] || null;
    },

    setValue: function (fieldId, value) {
      this.values[fieldId] = value;
    },

    getNumericValue: function (fieldId, defaultValue = 0) {
      const value = this.getValue(fieldId);
      if (value === null || value === undefined || value === "")
        return defaultValue;
      const parsed =
        window.TEUI?.parseNumeric?.(value, defaultValue) ?? parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    },

    setDefaults: function () {
      console.log(
        "[SXX] ReferenceState: Initializing Reference-specific defaults"
      );

      // Get current reference standard
      const currentStandard =
        window.TEUI?.StateManager?.getValue?.("d_13") || "OBC SB10 5.5-6 Z6";
      const referenceValues =
        window.TEUI?.ReferenceValues?.[currentStandard] || {};

      // Foundation: Start with field defaults
      this.values.d_xx =
        ModeManager.getFieldDefault("d_xx") || "Default Option";
      this.values.e_xx = ModeManager.getFieldDefault("e_xx") || "100.00";
      this.values.i_xx = ModeManager.getFieldDefault("i_xx") || "50";

      // Selective overrides: Apply building code values if available
      if (referenceValues.d_xx) this.values.d_xx = referenceValues.d_xx;
      if (referenceValues.e_xx) this.values.e_xx = referenceValues.e_xx;
      if (referenceValues.i_xx) this.values.i_xx = referenceValues.i_xx;

      // Publish to StateManager with ref_ prefix
      if (window.TEUI?.StateManager) {
        Object.keys(this.values).forEach(fieldId => {
          window.TEUI.StateManager.setValue(
            `ref_${fieldId}`,
            this.values[fieldId],
            "default"
          );
        });
        console.log(
          `[SXX] ReferenceState: Published defaults for ${currentStandard}`
        );
      }
    },

    syncFromGlobalState: function (fieldIds = ["d_xx", "e_xx", "i_xx"]) {
      fieldIds.forEach(fieldId => {
        const refFieldId = `ref_${fieldId}`;
        const globalValue = window.TEUI.StateManager.getValue(refFieldId);
        if (globalValue !== null && globalValue !== undefined) {
          this.setValue(fieldId, globalValue);
          console.log(
            `[SXX] ReferenceState: Synced ${fieldId} = ${globalValue} from ${refFieldId}`
          );
        }
      });
    },
  };

  //==========================================================================
  // 4. MODE MANAGER (Facade Coordination)
  //==========================================================================

  const ModeManager = {
    currentMode: "target",

    switchMode: function (mode) {
      console.log(`[SXX] switchMode: ${this.currentMode} → ${mode}`);
      this.currentMode = mode;
      this.refreshUI();
      this.updateCalculatedDisplayValues();
      this.syncToggleUI(mode);
    },

    syncToggleUI: function (mode) {
      window.TEUI.ToggleUISync?.syncToggleUI(this._toggleElements, mode, "SXX");
    },

    refreshUI: function () {
      console.log(`[SXX] refreshUI: mode=${this.currentMode}`);
      const fields = getFields();
      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;

      Object.keys(fields).forEach(fieldId => {
        const storedValue = currentState.getValue(fieldId);
        const element = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (!element) return;

        const fieldDefault = this.getFieldDefault(fieldId);
        const valueToShow = storedValue !== null ? storedValue : fieldDefault;

        // Handle different input types
        let targetElement = element;
        if (element.tagName === "TD") {
          targetElement =
            element.querySelector("select") ||
            element.querySelector('input[type="range"]') ||
            element.querySelector('[contenteditable="true"]') ||
            element;
        }

        if (targetElement.hasAttribute("contenteditable")) {
          targetElement.textContent = valueToShow || "";
        } else if (targetElement.matches("select")) {
          targetElement.value = valueToShow || "";
          if (storedValue === null && fieldDefault) {
            currentState.setValue(fieldId, fieldDefault);
          }
        } else if (targetElement.matches('input[type="range"]')) {
          const numericValue = window.TEUI?.parseNumeric?.(valueToShow, 0) ?? 0;
          targetElement.value = numericValue;
          const display = targetElement.nextElementSibling;
          if (display) display.textContent = `${numericValue}%`;
          if (storedValue === null && fieldDefault) {
            currentState.setValue(fieldId, fieldDefault);
          }
        }
      });
    },

    updateCalculatedDisplayValues: function () {
      const mode = this.currentMode;
      const calculatedFields = ["h_xx", "m_xx", "n_xx"]; // Add your calculated fields

      calculatedFields.forEach(fieldId => {
        const targetValue = TargetState.getValue(fieldId);
        const referenceValue = ReferenceState.getValue(fieldId);

        let displayValue;
        if (mode === "reference") {
          displayValue = referenceValue !== null ? referenceValue : "0";
        } else {
          displayValue = targetValue !== null ? targetValue : "0";
        }

        const element = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (element) {
          let formattedValue;
          if (fieldId.startsWith("m_") || fieldId.startsWith("n_")) {
            formattedValue = displayValue; // Already formatted
          } else {
            const formatType = getFieldFormat(fieldId);
            formattedValue =
              window.TEUI?.formatNumber?.(displayValue, formatType) ??
              displayValue;
          }
          element.textContent = formattedValue;
          element.classList.toggle("negative-value", Number(displayValue) < 0);
        }
      });
    },

    getValue: function (fieldId) {
      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;
      return currentState.getValue(fieldId);
    },

    setValue: function (fieldId, value, source = "user-modified") {
      console.log(
        `[SXX] ModeManager.setValue: ${fieldId} = "${value}" (mode=${this.currentMode})`
      );
      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;
      currentState.setValue(fieldId, value);

      // Sync to StateManager (dual storage pattern)
      if (this.currentMode === "target") {
        window.TEUI?.StateManager?.setValue(fieldId, value, source);
      } else {
        window.TEUI?.StateManager?.setValue(`ref_${fieldId}`, value, source);
      }
    },

    getFieldDefault: function (fieldId) {
      for (const rowKey in sectionRows) {
        const row = sectionRows[rowKey];
        if (row.cells) {
          for (const cellKey in row.cells) {
            const cell = row.cells[cellKey];
            if (cell.fieldId === fieldId && cell.value !== undefined) {
              return cell.value;
            }
          }
        }
      }
      return null;
    },
  };

  // Expose for ComponentBridge compatibility
  window.TEUI.sectXX = { ModeManager: ModeManager };

  //==========================================================================
  // 5. HELPER FUNCTIONS
  //==========================================================================

  // Get section-internal value (explicit state access)
  function getSectionValue(fieldId, isReferenceCalculation = false) {
    return isReferenceCalculation
      ? ReferenceState.getValue(fieldId)
      : TargetState.getValue(fieldId);
  }

  function getSectionNumericValue(
    fieldId,
    defaultValue = 0,
    isReferenceCalculation = false
  ) {
    return isReferenceCalculation
      ? ReferenceState.getNumericValue(fieldId, defaultValue)
      : TargetState.getNumericValue(fieldId, defaultValue);
  }

  function setSectionValue(fieldId, value, isReferenceCalculation = false) {
    if (isReferenceCalculation) {
      ReferenceState.setValue(fieldId, value);
      window.TEUI?.StateManager?.setValue(
        `ref_${fieldId}`,
        value.toString(),
        "calculated"
      );
    } else {
      TargetState.setValue(fieldId, value);
      window.TEUI?.StateManager?.setValue(
        fieldId,
        value.toString(),
        "calculated"
      );
    }
  }

  // Get external dependency (mode-aware)
  function getGlobalValue(fieldId, isReferenceCalculation = false) {
    const key = isReferenceCalculation ? `ref_${fieldId}` : fieldId;
    return window.TEUI?.StateManager?.getValue(key);
  }

  function getGlobalNumericValue(
    fieldId,
    defaultValue = 0,
    isReferenceCalculation = false
  ) {
    const value = getGlobalValue(fieldId, isReferenceCalculation);
    return window.TEUI?.parseNumeric?.(value, defaultValue) ?? defaultValue;
  }

  function getFieldFormat(fieldId) {
    const formatMap = {
      h_xx: "number-2dp-comma",
      m_xx: "raw",
      n_xx: "raw",
    };
    return formatMap[fieldId] || "number-2dp-comma";
  }

  // M-N Compliance helper (Section07 pattern)
  function calculateComplianceRatio(
    targetField,
    refField,
    isReferenceCalculation
  ) {
    if (isReferenceCalculation) {
      return 1.0; // Reference always 100% (self-comparison)
    } else {
      const targetValue =
        window.TEUI.parseNumeric(
          window.TEUI.StateManager.getValue(targetField)
        ) || 0;
      const refValue =
        window.TEUI.parseNumeric(window.TEUI.StateManager.getValue(refField)) ||
        0;
      return refValue > 0 ? targetValue / refValue : 0;
    }
  }

  //==========================================================================
  // 6. CALCULATION ENGINES (Dual-Engine Pattern)
  //==========================================================================

  function calculateTargetModel() {
    console.log("[SXX] Calculating Target model");

    // Example calculation pattern
    const userInput = getSectionNumericValue("e_xx", 0, false);
    const externalValue = getGlobalNumericValue("d_20", 0, false); // HDD
    const result = userInput * externalValue;

    setSectionValue("h_xx", result, false);

    // Calculate compliance
    calculateCompliance(false);
  }

  function calculateReferenceModel() {
    console.log("[SXX] Calculating Reference model");

    // Example calculation pattern
    const userInput = getSectionNumericValue("e_xx", 0, true);
    const externalValue = getGlobalNumericValue("d_20", 0, true); // ref_d_20
    const result = userInput * externalValue;

    setSectionValue("h_xx", result, true);

    // Calculate compliance
    calculateCompliance(true);
  }

  function calculateCompliance(isReferenceCalculation = false) {
    // M-N compliance pattern (Section07)
    const m_xx_percent = calculateComplianceRatio(
      "h_xx",
      "ref_h_xx",
      isReferenceCalculation
    );
    const m_xx_formatted =
      window.TEUI?.formatNumber?.(m_xx_percent, "percent-0dp") ?? "100%";

    // Store M column
    if (isReferenceCalculation) {
      window.TEUI.StateManager.setValue(
        "ref_m_xx",
        m_xx_formatted,
        "calculated"
      );
    } else {
      window.TEUI.StateManager.setValue("m_xx", m_xx_formatted, "calculated");
    }
    setSectionValue("m_xx", m_xx_formatted, isReferenceCalculation);

    // N column checkmark
    const numericPercent = parseFloat(
      String(m_xx_formatted).replace("%", "").replace(/,/g, "")
    );
    const isCompliant = numericPercent >= 100;
    const status = isCompliant ? "✓" : "✗";

    if (isReferenceCalculation) {
      window.TEUI.StateManager.setValue("ref_n_xx", status, "calculated");
    } else {
      window.TEUI.StateManager.setValue("n_xx", status, "calculated");
    }
    setSectionValue("n_xx", status, isReferenceCalculation);
  }

  function calculateAll() {
    // CRITICAL: Reference first so ref_* values exist before Target compliance runs
    calculateReferenceModel();
    calculateTargetModel();
  }

  //==========================================================================
  // 7. UI MANAGEMENT
  //==========================================================================

  function updateVisibility(selectedValue) {
    // Example ghosting pattern (Section07)
    const isOption1 = selectedValue === "Option 1";
    setFieldGhosted("e_xx", !isOption1);
  }

  function setFieldGhosted(fieldId, shouldBeGhosted) {
    const valueCell = document.querySelector(`td[data-field-id="${fieldId}"]`);
    if (valueCell) {
      valueCell.classList.toggle("disabled-input", shouldBeGhosted);
      const input = valueCell.querySelector(
        'input, select, [contenteditable="true"]'
      );
      if (input) {
        if (input.hasAttribute("contenteditable")) {
          input.contentEditable = !shouldBeGhosted;
        } else {
          input.disabled = shouldBeGhosted;
        }
      }
    }
  }

  //==========================================================================
  // 8. EVENT HANDLING
  //==========================================================================

  function handleEditableBlur(event) {
    const fieldElement = this;
    const fieldId = fieldElement.getAttribute("data-field-id");
    if (!fieldId) return;

    let rawTextValue = fieldElement.textContent.trim();
    let numericValue =
      window.TEUI?.parseNumeric?.(rawTextValue, NaN) ??
      parseFloat(rawTextValue.replace(/[$,%]/g, ""));

    if (isNaN(numericValue)) {
      const previousValue = ModeManager.getValue(fieldId) || "0";
      numericValue = window.TEUI?.parseNumeric?.(previousValue, 0) ?? 0;
    }

    const valueToStore = numericValue.toString();
    const formattedDisplay =
      window.TEUI?.formatNumber?.(numericValue, "number-2dp-comma") ??
      valueToStore;
    fieldElement.textContent = formattedDisplay;

    const currentValue = ModeManager.getValue(fieldId);
    if (currentValue !== valueToStore) {
      ModeManager.setValue(fieldId, valueToStore, "user-modified");
      calculateAll();
      ModeManager.updateCalculatedDisplayValues();
    }
  }

  function handleDropdownChange(e) {
    const fieldId =
      e.target.getAttribute("data-field-id") ||
      e.target.getAttribute("data-dropdown-id");
    const value = e.target.value;

    console.log(`[SXX] Dropdown changed: ${fieldId} = "${value}"`);

    if (fieldId) {
      ModeManager.setValue(fieldId, value, "user-modified");
      updateVisibility(value);
      calculateAll();
      ModeManager.updateCalculatedDisplayValues();
    }
  }

  function handleSliderChange(e) {
    const fieldId = e.target.getAttribute("data-field-id");
    const value = e.target.value;
    const displaySpan = document.querySelector(
      `span[data-display-for="${fieldId}"]`
    );

    if (displaySpan) displaySpan.textContent = value + "%";

    if (fieldId && (e.type === "change" || e.type === "input")) {
      ModeManager.setValue(fieldId, value, "user-modified");
      if (e.type === "change") {
        calculateAll();
        ModeManager.updateCalculatedDisplayValues();
      }
    }
  }

  function initializeEventHandlers() {
    const sectionElement = document.getElementById("sectionXX"); // Replace with actual section ID
    if (!sectionElement) return;

    // Editable fields
    const editableFields = ["e_xx"]; // Add your editable fields
    editableFields.forEach(fieldId => {
      const field = sectionElement.querySelector(
        `[data-field-id="${fieldId}"]`
      );
      if (
        field &&
        field.classList.contains("editable") &&
        !field.hasEditableListeners
      ) {
        field.setAttribute("contenteditable", "true");
        field.classList.add("user-input");
        field.addEventListener("blur", handleEditableBlur);
        field.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            this.blur();
          }
        });
        field.hasEditableListeners = true;
      }
    });

    // Dropdowns
    const dropdowns = sectionElement.querySelectorAll(
      "select[data-dropdown-id]"
    );
    dropdowns.forEach(dropdown => {
      if (!dropdown.hasDropdownListener) {
        dropdown.addEventListener("change", handleDropdownChange);
        dropdown.hasDropdownListener = true;
      }
    });

    // Sliders
    const sliders = sectionElement.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
      if (!slider.hasSliderListener) {
        slider.addEventListener("input", handleSliderChange);
        slider.addEventListener("change", handleSliderChange);
        slider.hasSliderListener = true;
      }
    });

    // External dependencies (dual-mode listeners)
    if (window.TEUI?.StateManager) {
      window.TEUI.StateManager.addListener("d_20", calculateAll); // HDD (Target)
      window.TEUI.StateManager.addListener("ref_d_20", calculateAll); // HDD (Reference)
      // Add more external dependencies as needed
    }
  }

  //==========================================================================
  // 9. LIFECYCLE & PUBLIC API
  //==========================================================================

  function onSectionRendered() {
    console.log("[SXX] Section rendered - initializing Pattern A module");

    // Initialize state defaults
    TargetState.setDefaults();
    ReferenceState.setDefaults();

    // Initialize event handlers
    initializeEventHandlers();

    // Initial calculations
    calculateAll();

    // Update display
    ModeManager.updateCalculatedDisplayValues();

    // Apply tooltips
    if (window.TEUI.TooltipManager?.initialized) {
      setTimeout(() => {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }

    console.log("[SXX] Initialization complete");
  }

  return {
    getFields,
    getDropdownOptions,
    getLayout,
    initializeEventHandlers,
    onSectionRendered,
    calculateAll,

    // Pattern A exports
    ModeManager: ModeManager,
    TargetState: TargetState,
    ReferenceState: ReferenceState,
  };
})();

// Global namespace exposure
document.addEventListener("DOMContentLoaded", function () {
  const module = window.TEUI.SectionModules.sectXX;
  if (module) {
    window.TEUI.sectXX.calculateAll = module.calculateAll;
  }
});

// Safe global wrapper
window.calculateSectionXX = function () {
  if (window.sectionXXCalculationRunning) return;
  window.sectionXXCalculationRunning = true;
  try {
    if (window.TEUI?.SectionModules?.sectXX?.calculateAll) {
      window.TEUI.SectionModules.sectXX.calculateAll();
    }
  } catch (e) {
    console.error("Error in SectionXX calculation wrapper:", e);
  } finally {
    window.sectionXXCalculationRunning = false;
  }
};
