/**
 * 4012-Section07.js
 * Water Use (Section 7) module for TEUI Calculator 4.012
 *
 * Refactored to use the standardized dual-engine architecture.
 *
 * 🚨 LOG ERRORS TO RESOLVE: S07 ref_d_63 fallback contamination (S09 timing issue)
 */

window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

window.TEUI.SectionModules.sect07 = (function () {
  //==========================================================================
  // PATTERN A: DUAL-STATE ARCHITECTURE
  //==========================================================================

  // State objects for Target and Reference models
  const TargetState = {
    values: {},
    getValue: function (fieldId) {
      return this.values[fieldId] || null;
    },
    setValue: function (fieldId, value) {
      this.values[fieldId] = value;
    },

    /**
     * ✅ PHASE 2: Sync from global StateManager after import
     * Bridges global StateManager → isolated TargetState for imported values
     */
    syncFromGlobalState: function (
      fieldIds = ["d_49", "e_49", "e_50", "d_51", "d_52", "d_53", "k_52"],
    ) {
      fieldIds.forEach((fieldId) => {
        const globalValue = window.TEUI.StateManager.getValue(fieldId);
        if (globalValue !== null && globalValue !== undefined) {
          this.setValue(fieldId, globalValue);
          console.log(
            `S07 TargetState: Synced ${fieldId} = ${globalValue} from global StateManager`,
          );
        }
      });
    },

    // ✅ DUAL-STATE-CHEATSHEET.md COMPLIANCE: Initialize from FieldDefinitions (single source of truth)
    setDefaults: function () {
      console.log(
        `🔧 [S07] TargetState.setDefaults: Initializing from FieldDefinitions`,
      );
      this.values.d_49 = ModeManager.getFieldDefault("d_49") || "User Defined";
      this.values.d_51 = ModeManager.getFieldDefault("d_51") || "Heatpump";
      console.log(
        `✅ [S07] TargetState.setDefaults: d_49="${this.values.d_49}", d_51="${this.values.d_51}"`,
      );

      // ✅ CRITICAL: Publish defaults to StateManager for cross-section communication
      if (window.TEUI?.StateManager) {
        window.TEUI.StateManager.setValue("d_49", this.values.d_49, "default");
        window.TEUI.StateManager.setValue("d_51", this.values.d_51, "default");
        console.log(
          `🌐 [S07] TargetState.setDefaults: Published to StateManager`,
        );
      }
    },
    getNumericValue: function (fieldId, defaultValue = 0) {
      const value = this.getValue(fieldId);
      if (value === null || value === undefined || value === "")
        return defaultValue;
      const parsed =
        window.TEUI?.parseNumeric?.(value, defaultValue) ?? parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
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

    /**
     * ✅ PHASE 2: Sync from global StateManager after import
     * Bridges global StateManager → isolated ReferenceState for imported values
     */
    syncFromGlobalState: function (
      fieldIds = ["d_49", "e_49", "e_50", "d_51", "d_52", "d_53", "k_52"],
    ) {
      fieldIds.forEach((fieldId) => {
        const refFieldId = `ref_${fieldId}`;
        const globalValue = window.TEUI.StateManager.getValue(refFieldId);
        if (globalValue !== null && globalValue !== undefined) {
          this.setValue(fieldId, globalValue);
          console.log(
            `S07 ReferenceState: Synced ${fieldId} = ${globalValue} from global StateManager (${refFieldId})`,
          );
        }
      });
    },

    // ✅ DUAL-STATE-CHEATSHEET.md COMPLIANCE: Initialize from FieldDefinitions (single source of truth)
    setDefaults: function () {
      console.log(
        `🔧 [S07] ReferenceState.setDefaults: Initializing Reference-specific defaults`,
      );
      this.values.d_49 = ModeManager.getFieldDefault("d_49") || "User Defined";
      this.values.d_51 = "Electric"; // Reference default: Electric system
      this.values.d_52 = "90"; // Reference default: 90% efficiency
      console.log(
        `✅ [S07] ReferenceState.setDefaults: d_49="${this.values.d_49}", d_51="${this.values.d_51}", d_52="${this.values.d_52}"`,
      );

      // ✅ CRITICAL: Publish Reference defaults to StateManager with ref_ prefix
      if (window.TEUI?.StateManager) {
        window.TEUI.StateManager.setValue(
          "ref_d_49",
          this.values.d_49,
          "default",
        );
        window.TEUI.StateManager.setValue(
          "ref_d_51",
          this.values.d_51,
          "default",
        );
        window.TEUI.StateManager.setValue(
          "ref_d_52",
          this.values.d_52,
          "default",
        );
        console.log(
          `🔗 [S07] ReferenceState.setDefaults: Published d_49, d_51="Electric", d_52="90%" with ref_ prefix`,
        );
      }
    },
    getNumericValue: function (fieldId, defaultValue = 0) {
      const value = this.getValue(fieldId);
      if (value === null || value === undefined || value === "")
        return defaultValue;
      const parsed =
        window.TEUI?.parseNumeric?.(value, defaultValue) ?? parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    },
  };

  // Mode manager for UI state switching (display-only)
  const ModeManager = {
    currentMode: "target", // "target" or "reference"

    switchMode: function (mode) {
      console.log(
        `🔄 [S07] switchMode: Switching from "${this.currentMode}" to "${mode}"`,
      );
      this.currentMode = mode;
      this.refreshUI();
      this.updateCalculatedDisplayValues(); // ✅ DOM update without calculations
      console.log(`✅ [S07] switchMode: Switch to "${mode}" completed`);
    },

    refreshUI: function () {
      console.log(
        `🔄 [S07] refreshUI: Starting refresh for mode=${this.currentMode}`,
      );

      // Update input fields to show current mode's values
      const fields = getFields();
      Object.keys(fields).forEach((fieldId) => {
        const currentState =
          this.currentMode === "target" ? TargetState : ReferenceState;
        const storedValue = currentState.getValue(fieldId);
        const element = document.querySelector(`[data-field-id="${fieldId}"]`);

        console.log(
          `🔍 [S07] refreshUI: fieldId=${fieldId}, storedValue=${storedValue}, elementFound=${!!element}`,
        );

        if (element) {
          // ✅ PATTERN A: Get field default from sectionRows definition
          const fieldDefault = this.getFieldDefault(fieldId);
          const valueToShow = storedValue !== null ? storedValue : fieldDefault;

          // ✅ CRITICAL FIX: Look for SELECT inside TD if element is a table cell
          let targetElement = element;
          let elementType = element.tagName || element.type;

          if (element.tagName === "TD") {
            // Look for SELECT or INPUT inside the TD
            const selectInside = element.querySelector("select");
            const inputInside = element.querySelector('input[type="range"]');
            const editableInside = element.querySelector(
              '[contenteditable="true"]',
            );

            if (selectInside) {
              targetElement = selectInside;
              elementType = "SELECT";
            } else if (inputInside) {
              targetElement = inputInside;
              elementType = "range";
            } else if (editableInside) {
              targetElement = editableInside;
              elementType = "contenteditable";
            }
          }

          console.log(
            `📋 [S07] refreshUI: fieldId=${fieldId}, default=${fieldDefault}, valueToShow=${valueToShow}, elementType=${elementType}`,
          );

          if (
            elementType === "contenteditable" ||
            targetElement.hasAttribute("contenteditable")
          ) {
            console.log(
              `✏️ [S07] refreshUI: Setting contenteditable ${fieldId} = "${valueToShow || ""}"`,
            );
            targetElement.textContent = valueToShow || "";
          } else if (elementType === "SELECT") {
            console.log(
              `🔽 [S07] refreshUI: Setting dropdown ${fieldId} from "${targetElement.value}" to "${valueToShow || ""}" (mode=${this.currentMode})`,
            );
            targetElement.value = valueToShow || "";
            console.log(
              `🔽 [S07] refreshUI: Dropdown ${fieldId} now shows "${targetElement.value}"`,
            );
            // Store the default if no value was stored yet
            if (storedValue === null && fieldDefault) {
              console.log(
                `💾 [S07] refreshUI: Storing default ${fieldId} = "${fieldDefault}" to ${this.currentMode} state`,
              );
              currentState.setValue(fieldId, fieldDefault);
            }
          } else if (
            elementType === "range" ||
            targetElement.type === "range"
          ) {
            console.log(
              `🎚️ [S07] refreshUI: Setting slider ${fieldId} = "${valueToShow || ""}"`,
            );

            // ✅ CRITICAL FIX: Update d_52 slider range based on d_51 system type (Bug #8 fix)
            if (fieldId === "d_52") {
              const systemType = currentState.getValue("d_51") || "Heatpump";
              console.log(
                `🎚️ [S07] refreshUI: Updating d_52 slider range for system="${systemType}"`,
              );

              // Update range based on system type (following S10 pattern)
              if (systemType === "Electric") {
                targetElement.min = 90;
                targetElement.max = 100;
                targetElement.step = 1;
              } else if (systemType === "Gas" || systemType === "Oil") {
                targetElement.min = 50;
                targetElement.max = 98;
                targetElement.step = 1;
              } else {
                // Heatpump
                targetElement.min = 100;
                targetElement.max = 450;
                targetElement.step = 10;
              }
              console.log(
                `🎚️ [S07] refreshUI: d_52 slider range updated to min=${targetElement.min}, max=${targetElement.max}, step=${targetElement.step}`,
              );
            }

            // ✅ S10/S11 PATTERN: Parse to numeric, set as number, use nextElementSibling
            const numericValue =
              window.TEUI?.parseNumeric?.(valueToShow, 0) ?? 0;
            targetElement.value = numericValue; // Set as NUMBER, not string

            const display = targetElement.nextElementSibling; // Use nextElementSibling like S10/S11
            if (display) {
              display.textContent = `${numericValue}%`;
            }

            // Store the default if no value was stored yet
            if (storedValue === null && fieldDefault) {
              currentState.setValue(fieldId, fieldDefault);
            }
          }
        }
      });

      console.log(
        `✅ [S07] refreshUI: Completed refresh for mode=${this.currentMode}`,
      );
    },

    // Helper function to get field defaults from sectionRows definition
    getFieldDefault: function (fieldId) {
      console.log(
        `🔍 [S07] getFieldDefault: Looking for default for fieldId=${fieldId}`,
      );
      for (const rowKey in sectionRows) {
        const row = sectionRows[rowKey];
        if (row.cells) {
          for (const cellKey in row.cells) {
            const cell = row.cells[cellKey];
            if (cell.fieldId === fieldId && cell.value !== undefined) {
              console.log(
                `✅ [S07] getFieldDefault: Found default for ${fieldId} = "${cell.value}"`,
              );
              return cell.value;
            }
          }
        }
      }
      console.log(`❌ [S07] getFieldDefault: No default found for ${fieldId}`);
      return null;
    },

    updateCalculatedDisplayValues: function () {
      // Update calculated display fields in DOM based on current mode
      const mode = this.currentMode;

      // Get calculated values from appropriate state
      const calculatedFields = [
        "h_49",
        "h_50",
        "i_49",
        "i_50",
        "j_50",
        "j_51",
        "j_52",
        "j_53",
        "j_54",
        "k_49",
        "k_51",
        "k_52",
        "k_54",
        "e_51",
        "e_52",
        "e_53",
        "d_54",
        "n_49",
        "n_50",
        "n_52",
      ];

      calculatedFields.forEach((fieldId) => {
        const targetValue = TargetState.getValue(fieldId);
        const referenceValue = ReferenceState.getValue(fieldId);

        let displayValue;
        if (mode === "reference") {
          // In Reference mode, show Reference values or fallback to 0 if null
          displayValue = referenceValue !== null ? referenceValue : "0";
        } else {
          // In Target mode, show Target values
          displayValue = targetValue !== null ? targetValue : "0";
        }

        const element = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (element) {
          const formatType = getFieldFormat(fieldId);
          const formattedValue =
            window.TEUI?.formatNumber?.(displayValue, formatType) ??
            displayValue;
          element.textContent = formattedValue;
          element.classList.toggle("negative-value", Number(displayValue) < 0);
        }
      });
    },

    getValue: function (fieldId) {
      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;
      const value = currentState.getValue(fieldId);
      console.log(
        `📖 [S07] ModeManager.getValue: ${fieldId} = "${value}" (mode=${this.currentMode})`,
      );
      return value;
    },

    setValue: function (fieldId, value, source = "user-modified") {
      console.log(
        `💾 [S07] ModeManager.setValue: Setting ${fieldId} = "${value}" (mode=${this.currentMode}, source=${source})`,
      );
      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;
      currentState.setValue(fieldId, value);

      // ✅ CRITICAL BRIDGE: Sync Target changes to StateManager for downstream sections (S02 pattern)
      if (this.currentMode === "target") {
        console.log(
          `🌐 [S07] ModeManager.setValue: Also storing to global StateManager: ${fieldId} = "${value}"`,
        );
        window.TEUI?.StateManager?.setValue(fieldId, value, source);
      }

      // ✅ CRITICAL BRIDGE: Sync Reference changes to StateManager with ref_ prefix (S02 pattern)
      if (this.currentMode === "reference" && window.TEUI?.StateManager) {
        console.log(
          `🔗 [S07] ModeManager.setValue: Also storing to global StateManager: ref_${fieldId} = "${value}"`,
        );
        window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, source);
      }
    },
  };

  //==========================================================================
  // CONSOLIDATED FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  const sectionRows = {
    header: {
      id: "S07-ID",
      rowId: "S07-ID",
      cells: {
        c: { content: "C", classes: ["section-subheader"] },
        d: { content: "Targeted", classes: ["section-subheader"] },
        e: { content: "E", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "G", classes: ["section-subheader"] },
        h: { content: "litres/pp/day", classes: ["section-subheader"] },
        i: { content: "litres/yr", classes: ["section-subheader"] },
        j: { content: "Annual kWh/yr", classes: ["section-subheader"] },
        k: { content: "Annual ekWh/yr", classes: ["section-subheader"] },
        l: { content: "L", classes: ["section-subheader"] },
        m: { content: "Ref", classes: ["section-subheader"] },
        n: { content: "N", classes: ["section-subheader"] },
      },
    },
    49: {
      id: "W.1.0",
      label: "Total Hot+Cold Water Use (Method)",
      cells: {
        c: { label: "Total Hot+Cold Water Use (Method)" },
        d: {
          fieldId: "d_49",
          type: "dropdown",
          dropdownId: "d_49",
          value: "User Defined",
          tooltip: true, // DHW/SHW Use Method (lpppd)
          options: [
            "User Defined",
            "By Engineer",
            "PHPP Method",
            "NBC Method",
            "OBC Method",
            "Luxury",
          ],
        },
        e: {
          fieldId: "e_49",
          type: "editable",
          value: "40.00",
          classes: ["user-input"],
          tooltip: true, // Litres/Per-Person/Day
        },
        f: { content: "lpppd (User Defined)", classes: ["text-left"] },
        h: { fieldId: "h_49", type: "calculated", value: "40.00" },
        i: { fieldId: "i_49", type: "calculated", value: "1,839,600" },
        j: { content: "Net Emissions", classes: ["text-left"] },
        k: { fieldId: "k_49", type: "calculated", value: "0.00" },
        l: { content: "kgCO2e/yr", classes: ["text-left"] },
        m: { content: "✓", classes: ["checkmark"] },
        n: { fieldId: "n_49", type: "calculated", value: "15%" },
      },
    },
    50: {
      id: "W.1.2",
      label: "DHW Use (40% of W.1.0)",
      cells: {
        c: { label: "DHW Use (40% of W.1.0)" },
        d: { content: "" },
        e: {
          fieldId: "e_50",
          type: "editable",
          value: "10,000.00",
          classes: ["user-input"],
          tooltip: true, // Occupancy-Dependent Calculation
        },
        f: { content: "kWh/yr (IF By Engineer)", classes: ["text-left"] },
        h: { fieldId: "h_50", type: "calculated", value: "16.00" },
        i: { fieldId: "i_50", type: "calculated", value: "735,840" },
        j: { fieldId: "j_50", type: "calculated", value: "38,484.43" },
        m: { content: "✓", classes: ["checkmark"] },
        n: { fieldId: "n_50", type: "calculated", value: "15%" },
      },
    },
    51: {
      id: "W.3.1",
      label: "DHW or SHW Energy Source",
      cells: {
        c: { label: "DHW or SHW Energy Source" },
        d: {
          fieldId: "d_51",
          type: "dropdown",
          dropdownId: "d_51",
          value: "Heatpump",
          tooltip: true, // DHW/SHW Heating Source
          options: ["Heatpump", "Gas", "Oil", "Electric"],
        },
        e: { fieldId: "e_51", type: "calculated", value: "0.00" },
        f: { content: "Gas m³/yr", classes: ["text-left"] },
        g: { content: "W.3.2", classes: ["text-left"] },
        h: { content: "Net Thermal Demand", classes: ["text-left"] },
        j: { fieldId: "j_51", type: "calculated", value: "12,828.14" },
        k: { fieldId: "k_51", type: "calculated", value: "12,828.14" },
        l: { content: "W.3.3 Net Elect. Demand", classes: ["text-left"] },
      },
    },
    52: {
      id: "W.4.1",
      label: "DHW or SHW Efficiency Factor (EF)",
      cells: {
        c: { label: "DHW or SHW Efficiency Factor (EF)" },
        d: {
          fieldId: "d_52",
          type: "percentage",
          value: "300",
          min: 50,
          max: 400,
          step: 2,
          classes: ["user-input"],
          tooltip: true, // If Heatpump Selected
        },
        e: { fieldId: "e_52", type: "calculated", value: "3.00" },
        f: { content: "COPdhw", classes: ["text-left"] },
        g: { content: "W.5.2", classes: ["text-left"] },
        h: { content: "Net Demand-Recovered", classes: ["text-left"] },
        j: { fieldId: "j_52", type: "calculated", value: "12,828.14" },
        k: {
          fieldId: "k_52",
          type: "editable",
          value: "0.90",
          classes: ["user-input"],
          tooltip: true, // AFUE
        },
        l: { content: "W.4.2 AFUE", classes: ["text-left"] },
        m: { content: "✓", classes: ["checkmark"] },
        n: { fieldId: "n_52", type: "calculated", value: "100%" },
      },
    },
    53: {
      id: "W.5.1",
      label: "Drain Water Heat Recovery Efficiency",
      cells: {
        c: { label: "Drain Water Heat Recovery Efficiency" },
        d: {
          fieldId: "d_53",
          type: "percentage",
          value: "0",
          min: 0,
          max: 70,
          step: 1,
          classes: ["user-input"],
          tooltip: true, // Range of DWHR Efficiency
        },
        e: { fieldId: "e_53", type: "calculated", value: "0.00" },
        f: { content: "kWh/yr", classes: ["text-left"] },
        g: { content: "W.5.3", classes: ["text-left"] },
        h: { content: "(W.2.W) SHW Wasted", classes: ["text-left"] },
        j: { fieldId: "j_53", type: "calculated", value: "12,828.14" },
        m: { content: "!", classes: ["warning"] },
        n: { fieldId: "n_53", type: "calculated", value: "0%" },
      },
    },
    54: {
      id: "W.6.1",
      label: "System Losses (% → W.1.3 Eqpt Gains)",
      cells: {
        c: { label: "System Losses (% → W.1.3 Eqpt Gains)" },
        d: { fieldId: "d_54", type: "calculated", value: "0.00" },
        f: { content: "kWh/yr", classes: ["text-left"] },
        g: { content: "W.X", classes: ["text-right"] },
        h: { content: "Exhaust (if Gas or Oil)", classes: ["text-left"] },
        j: { fieldId: "j_54", type: "calculated", value: "0.00" },
        k: { fieldId: "k_54", type: "calculated", value: "0.00" },
        l: { content: "W.3.4 Net Oil Demand Ltrs", classes: ["text-left"] },
        m: { content: "", classes: ["text-left"] },
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
            section: "waterUse",
          };
          // Add additional properties for dropdown fields
          if (cell.dropdownId)
            fields[cell.fieldId].dropdownId = cell.dropdownId;
          if (cell.options) fields[cell.fieldId].options = cell.options;
          if (cell.min !== undefined) fields[cell.fieldId].min = cell.min;
          if (cell.max !== undefined) fields[cell.fieldId].max = cell.max;
          if (cell.step !== undefined) fields[cell.fieldId].step = cell.step;
        }
      });
    });
    return fields;
  }

  function getDropdownOptions() {
    const options = {};
    Object.values(sectionRows).forEach((row) => {
      if (!row.cells) return;
      Object.values(row.cells).forEach((cell) => {
        if (cell.type === "dropdown" && cell.dropdownId && cell.options) {
          options[cell.dropdownId] = cell.options.map((opt) => ({
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

  // ✅ PATTERN A: Expose ModeManager to global namespace for ComponentBridge compatibility
  window.TEUI.sect07 = { ModeManager: ModeManager };

  //==========================================================================
  // HELPER FUNCTIONS (Standardized)
  //==========================================================================
  // ✅ PATTERN A: Helper functions using explicit state access
  function getSectionValue(fieldId, isReferenceCalculation = false) {
    if (isReferenceCalculation) {
      return ReferenceState.getValue(fieldId);
    } else {
      return TargetState.getValue(fieldId);
    }
  }

  function getSectionNumericValue(
    fieldId,
    defaultValue = 0,
    isReferenceCalculation = false,
  ) {
    if (isReferenceCalculation) {
      return ReferenceState.getNumericValue(fieldId, defaultValue);
    } else {
      return TargetState.getNumericValue(fieldId, defaultValue);
    }
  }

  function setSectionValue(fieldId, value, isReferenceCalculation = false) {
    if (isReferenceCalculation) {
      ReferenceState.setValue(fieldId, value);
    } else {
      TargetState.setValue(fieldId, value);
      // ✅ Store Target values to StateManager for cross-section communication
      window.TEUI?.StateManager?.setValue(
        fieldId,
        value.toString(),
        "calculated",
      );
    }
  }

  function getFieldFormat(fieldId) {
    const formatMap = {
      h_49: "number-2dp",
      i_49: "integer-comma",
      h_50: "number-2dp",
      i_50: "integer-comma",
      j_50: "number-2dp-comma",
      n_49: "percent-0dp",
      n_50: "percent-0dp",
      e_52: "number-2dp",
      j_51: "number-2dp-comma",
      e_53: "number-2dp-comma",
      j_52: "number-2dp-comma",
      j_53: "number-2dp-comma",
      e_51: "number-2dp-comma",
      k_51: "number-2dp-comma",
      d_54: "number-2dp-comma",
      j_54: "number-2dp-comma",
      k_54: "number-2dp-comma",
      k_49: "number-2dp-comma",
    };
    return formatMap[fieldId] || "number-2dp-comma";
  }

  //==========================================================================
  // CALCULATION FUNCTIONS
  //==========================================================================
  function calculateWaterUse(isReferenceCalculation = false) {
    // ✅ PATTERN A: Explicit state access while preserving Excel formulas
    const method =
      getSectionValue("d_49", isReferenceCalculation) || "User Defined";

    // 🔧 STRATEGIC FALLBACK LOGGING: External dependency with fallback tracking
    let occupants;
    if (isReferenceCalculation) {
      const refValue = window.TEUI?.StateManager?.getValue("ref_d_63");
      if (refValue !== null && refValue !== undefined) {
        occupants = parseFloat(refValue) || 0;
      } else {
        console.warn(
          `[S07] 🚨 CRITICAL: ref_d_63 missing, using default 0 for Reference calculation`,
        );
        occupants = 0;
      }
    } else {
      occupants = parseFloat(window.TEUI?.StateManager?.getValue("d_63")) || 0;
    }

    const userDefinedValue = getSectionNumericValue(
      "e_49",
      40,
      isReferenceCalculation,
    );
    const engineerValue = getSectionNumericValue(
      "e_50",
      10000,
      isReferenceCalculation,
    );

    let litersPerPersonDay = 0;
    let hotWaterEnergyDemand = 0;

    // ✅ PRESERVE: Exact Excel formula logic unchanged
    switch (method) {
      case "User Defined":
        litersPerPersonDay = userDefinedValue;
        break;
      case "By Engineer":
        hotWaterEnergyDemand = engineerValue;
        break;
      case "PHPP Method":
        litersPerPersonDay = 62.5;
        break;
      case "NBC Method":
        litersPerPersonDay = 220;
        break;
      case "OBC Method":
        litersPerPersonDay = 275;
        break;
      case "Luxury":
        litersPerPersonDay = 400;
        break;
      default:
        litersPerPersonDay = 40;
    }

    // ✅ PRESERVE: Exact Excel calculation formulas unchanged
    if (method !== "By Engineer") {
      hotWaterEnergyDemand =
        litersPerPersonDay * 0.4 * occupants * 0.0523 * 365;
    } else {
      const waterHeatFactor = 0.0524;
      litersPerPersonDay =
        occupants > 0
          ? engineerValue / (365 * waterHeatFactor * occupants * 0.4)
          : 0;
    }

    // ✅ PATTERN A: Store to appropriate state
    setSectionValue("h_49", litersPerPersonDay, isReferenceCalculation);
    setSectionValue(
      "i_49",
      litersPerPersonDay * occupants * 365,
      isReferenceCalculation,
    );
    setSectionValue("h_50", litersPerPersonDay * 0.4, isReferenceCalculation);
    setSectionValue(
      "i_50",
      litersPerPersonDay * 0.4 * occupants * 365,
      isReferenceCalculation,
    );
    setSectionValue("j_50", hotWaterEnergyDemand, isReferenceCalculation);
  }

  function calculateHeatingSystem(isReferenceCalculation = false) {
    // ✅ PATTERN A: Explicit state access while preserving Excel formulas
    const hotWaterEnergyDemand = getSectionNumericValue(
      "j_50",
      0,
      isReferenceCalculation,
    );
    // 🔧 STRATEGIC FALLBACK LOGGING: Track when fallbacks are used
    let systemType;
    if (isReferenceCalculation) {
      const refValue = window.TEUI?.StateManager?.getValue("ref_d_51");
      if (refValue) {
        systemType = refValue;
      } else {
        console.warn(
          `[S07] 🚨 CRITICAL: ref_d_51 missing, using default "Heatpump" for Reference calculation`,
        );
        systemType = "Heatpump";
      }
    } else {
      systemType = window.TEUI?.StateManager?.getValue("d_51") || "Heatpump";
    }
    const efficiencyInput = getSectionNumericValue(
      "d_52",
      300,
      isReferenceCalculation,
    );
    const afue = getSectionNumericValue("k_52", 0.9, isReferenceCalculation);
    const recoveryPercent =
      getSectionNumericValue("d_53", 0, isReferenceCalculation) / 100;

    // ✅ PRESERVE: Exact Excel calculation formulas unchanged
    const efficiency = efficiencyInput / 100;
    setSectionValue("e_52", efficiency, isReferenceCalculation);

    const netThermalDemand =
      systemType === "Heatpump" || systemType === "Electric"
        ? hotWaterEnergyDemand / efficiency
        : hotWaterEnergyDemand / afue;
    setSectionValue("j_51", netThermalDemand, isReferenceCalculation);

    const energyRecovered = netThermalDemand * recoveryPercent;
    setSectionValue("e_53", energyRecovered, isReferenceCalculation);

    const netDemandAfterRecovery = netThermalDemand - energyRecovered;
    setSectionValue("j_52", netDemandAfterRecovery, isReferenceCalculation);
    setSectionValue("j_53", netDemandAfterRecovery, isReferenceCalculation);

    const netElectricalDemand =
      systemType === "Heatpump" || systemType === "Electric"
        ? netDemandAfterRecovery
        : 0;
    setSectionValue("k_51", netElectricalDemand, isReferenceCalculation);
  }

  function calculateEmissionsAndLosses(isReferenceCalculation = false) {
    // ✅ PATTERN A: Explicit state access while preserving Excel formulas
    // 🔧 STRATEGIC FALLBACK LOGGING: Track when fallbacks are used
    let systemType;
    if (isReferenceCalculation) {
      const refValue = window.TEUI?.StateManager?.getValue("ref_d_51");
      if (refValue) {
        systemType = refValue;
      } else {
        console.warn(
          `[S07] 🚨 CRITICAL: ref_d_51 missing, using default "Heatpump" for Reference calculation`,
        );
        systemType = "Heatpump";
      }
    } else {
      systemType = window.TEUI?.StateManager?.getValue("d_51") || "Heatpump";
    }

    console.log(
      `[S07] calculateEmissionsAndLosses: systemType="${systemType}" (${isReferenceCalculation ? "REF" : "TGT"})`,
    );
    const netDemandAfterRecovery = getSectionNumericValue(
      "j_52",
      0,
      isReferenceCalculation,
    );
    const afue = getSectionNumericValue("k_52", 0.9, isReferenceCalculation);
    const hotWaterEnergyDemand = getSectionNumericValue(
      "j_50",
      0,
      isReferenceCalculation,
    );
    const waterUseMethod =
      getSectionValue("d_49", isReferenceCalculation) || "User Defined";

    // ✅ PRESERVE: Exact Excel calculation formulas unchanged
    let gasVolume = 0;
    let oilVolume = 0;
    if (systemType === "Gas") {
      // ✅ Excel parity: E51=J52*(1-D53)/(0.0373*277.7778*K52)
      // 0.0373 GJ/m³ × 277.7778 kWh/GJ = 10.357 kWh/m³
      const conversionFactor = 0.0373 * 277.7778;
      gasVolume =
        afue > 0 ? netDemandAfterRecovery / (conversionFactor * afue) : 0;
      console.log(
        `[S07] 🔥 Gas calc: demand=${netDemandAfterRecovery}, afue=${afue} → e_51=${gasVolume}, k_54=0 (cleared)`,
      );
    } else if (systemType === "Oil") {
      const conversionFactor = 10.18; // 36.72 * 0.2777778
      oilVolume =
        afue > 0 ? netDemandAfterRecovery / (conversionFactor * afue) : 0;
      console.log(
        `[S07] 🛢️ Oil calc: demand=${netDemandAfterRecovery}, afue=${afue} → k_54=${oilVolume}, e_51=0 (cleared)`,
      );
    } else {
      console.log(
        `[S07] ⚡ Non-fossil fuel: ${systemType} → e_51=0, k_54=0 (both cleared)`,
      );
    }

    // 🔧 CRITICAL: Always set BOTH values - zero out the non-selected fuel to prevent contamination
    setSectionValue("e_51", gasVolume, isReferenceCalculation);
    setSectionValue("k_54", oilVolume, isReferenceCalculation);

    // ✅ PATTERN A: External dependencies - read from upstream sections with mode awareness
    const oilEmissionsFactor = isReferenceCalculation
      ? window.TEUI?.StateManager?.getValue("ref_l_30") || 2753
      : window.TEUI?.StateManager?.getValue("l_30") || 2753;
    const gasEmissionsFactor = isReferenceCalculation
      ? window.TEUI?.StateManager?.getValue("ref_l_28") || 1921
      : window.TEUI?.StateManager?.getValue("l_28") || 1921;

    const dhwEmissions =
      (systemType === "Oil"
        ? oilVolume * oilEmissionsFactor
        : systemType === "Gas"
          ? gasVolume * gasEmissionsFactor
          : 0) / 1000;
    setSectionValue("k_49", dhwEmissions, isReferenceCalculation);

    const exhaustLosses =
      systemType === "Gas" || systemType === "Oil"
        ? netDemandAfterRecovery * (1 - afue)
        : 0;
    setSectionValue("j_54", exhaustLosses, isReferenceCalculation);

    const efficiency = getSectionNumericValue(
      "e_52",
      1,
      isReferenceCalculation,
    );
    const systemLosses =
      efficiency <= 1
        ? hotWaterEnergyDemand * (waterUseMethod === "PHPP Method" ? 0.25 : 0.1)
        : 0;
    setSectionValue("d_54", systemLosses, isReferenceCalculation);

    // ✅ PATTERN A: Store to StateManager for cross-section communication (S10 dependency)
    if (!isReferenceCalculation) {
      window.TEUI?.StateManager?.setValue(
        "h_69",
        systemLosses.toString(),
        "calculated",
      );
    }
  }

  function calculateCompliance(isReferenceCalculation = false) {
    // ✅ PATTERN A: Explicit state access while preserving Excel formulas
    const litersPerPersonDay = getSectionNumericValue(
      "h_49",
      0,
      isReferenceCalculation,
    );
    const hotWaterLitersPerDay = getSectionNumericValue(
      "h_50",
      0,
      isReferenceCalculation,
    );
    const efficiency = getSectionNumericValue(
      "e_52",
      1,
      isReferenceCalculation,
    );
    const recoveryPercent =
      getSectionNumericValue("d_53", 0, isReferenceCalculation) / 100;

    // ✅ PRESERVE: Exact Excel calculation formulas unchanged
    // ESLint: These appear as constant conditions but preserve Excel formula structure
    const waterUsePercentRaw = litersPerPersonDay / 275; // 275 is Excel constant
    const dhwUsePercentRaw = hotWaterLitersPerDay / 110; // 110 is Excel constant
    const efficiencyPercentRaw = efficiency / 0.9; // 0.9 is Excel constant

    setSectionValue(
      "n_49",
      window.TEUI?.formatNumber?.(waterUsePercentRaw, "percent-0dp") ?? "0%",
      isReferenceCalculation,
    );
    setSectionValue(
      "n_50",
      window.TEUI?.formatNumber?.(dhwUsePercentRaw, "percent-0dp") ?? "0%",
      isReferenceCalculation,
    );
    setSectionValue(
      "n_52",
      window.TEUI?.formatNumber?.(efficiencyPercentRaw, "percent-0dp") ??
        "100%",
      isReferenceCalculation,
    );
    setSectionValue(
      "n_53",
      window.TEUI?.formatNumber?.(recoveryPercent, "percent-0dp") ?? "0%",
      isReferenceCalculation,
    );
  }

  // ✅ PATTERN A: Dual-engine calculations with explicit state access
  function calculateTargetModel() {
    try {
      calculateWaterUse(false); // false = Target calculation
      calculateHeatingSystem(false);
      calculateEmissionsAndLosses(false);
      calculateCompliance(false);

      // ✅ PATTERN A: Store Target results to StateManager for downstream sections
      const targetFields = [
        "h_49",
        "h_50",
        "i_49",
        "i_50",
        "j_50",
        "j_51",
        "j_52",
        "j_53",
        "j_54",
        "k_49",
        "k_51",
        "k_52",
        "k_54",
        "e_51",
        "e_52",
        "e_53",
        "d_54",
      ];

      targetFields.forEach((fieldId) => {
        const value = TargetState.getValue(fieldId);
        if (value !== null) {
          window.TEUI?.StateManager?.setValue(
            fieldId,
            value.toString(),
            "calculated",
          );
        }
      });
    } catch (error) {
      console.error("[S07] Error in Target Model calculations:", error);
    }
  }

  function calculateReferenceModel() {
    try {
      calculateWaterUse(true); // true = Reference calculation
      calculateHeatingSystem(true);
      calculateEmissionsAndLosses(true);
      calculateCompliance(true);

      // ✅ PATTERN A: Store Reference results to StateManager for downstream sections
      const referenceFields = [
        "h_49",
        "h_50",
        "i_49",
        "i_50",
        "j_50",
        "j_51",
        "j_52",
        "j_53",
        "j_54",
        "k_49",
        "k_51",
        "k_52",
        "k_54",
        "e_51",
        "e_52",
        "e_53",
        "d_54",
      ];

      referenceFields.forEach((fieldId) => {
        const value = ReferenceState.getValue(fieldId);
        if (value !== null) {
          window.TEUI?.StateManager?.setValue(
            `ref_${fieldId}`,
            value.toString(),
            "calculated",
          );
        }
      });
    } catch (error) {
      console.error("[S07] Error in Reference Model calculations:", error);
    }
  }

  function calculateAll() {
    calculateTargetModel();
    calculateReferenceModel();
  }

  //==========================================================================
  // UI MANAGEMENT FUNCTIONS (From Original Code)
  //==========================================================================
  function updateSection7Visibility(waterMethod, systemType) {
    const isUserDefined = waterMethod === "User Defined";
    setFieldGhosted("e_49", !isUserDefined);
    const f49Cell = document.querySelector(
      '.data-table tr[data-id="W.1.0"] td:nth-child(6)',
    );
    if (f49Cell) f49Cell.classList.toggle("disabled-input", !isUserDefined);

    const isByEngineer = waterMethod === "By Engineer";
    setFieldGhosted("e_50", !isByEngineer);
    const e50Cell = document.querySelector(
      '.data-table tr[data-id="W.1.2"] td:nth-child(5)',
    );
    const f50Cell = document.querySelector(
      '.data-table tr[data-id="W.1.2"] td:nth-child(6)',
    );
    if (e50Cell) e50Cell.classList.toggle("disabled-input", !isByEngineer);
    if (f50Cell) f50Cell.classList.toggle("disabled-input", !isByEngineer);

    const isGas = systemType === "Gas";
    const isOil = systemType === "Oil";
    const isFossilFuel = isGas || isOil;

    setFieldGhosted("e_51", !isGas);
    const f51Cell = document.querySelector(
      '.data-table tr[data-id="W.3.1"] td:nth-child(6)',
    );
    if (f51Cell) f51Cell.classList.toggle("disabled-input", !isGas);

    setFieldGhosted("k_54", !isOil);
    setFieldGhosted("d_52", isFossilFuel);
    setFieldGhosted("e_52", isFossilFuel);
    setFieldGhosted("k_52", !isFossilFuel);
  }

  function setFieldGhosted(fieldId, shouldBeGhosted) {
    const valueCell = document.querySelector(`td[data-field-id="${fieldId}"]`);
    if (valueCell) {
      valueCell.classList.toggle("disabled-input", shouldBeGhosted);
      const input = valueCell.querySelector(
        'input, select, [contenteditable="true"]',
      );
      if (input) {
        if (input.hasAttribute("contenteditable"))
          input.contentEditable = !shouldBeGhosted;
        else input.disabled = shouldBeGhosted;
      }
      if (valueCell.hasAttribute("contenteditable"))
        valueCell.contentEditable = !shouldBeGhosted;
    }
  }

  //==========================================================================
  // EVENT HANDLING (Enhanced with Original Functions)
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

    const formatType = fieldId === "k_52" ? "number-2dp" : "number-2dp-comma";
    const valueToStore = numericValue.toString();
    const formattedDisplay =
      window.TEUI?.formatNumber?.(numericValue, formatType) ?? valueToStore;
    fieldElement.textContent = formattedDisplay;

    // ✅ PATTERN A: Use ModeManager.setValue for proper state separation
    const currentValue = ModeManager.getValue(fieldId);
    if (currentValue !== valueToStore) {
      ModeManager.setValue(fieldId, valueToStore, "user-modified");
      calculateAll();
      ModeManager.updateCalculatedDisplayValues(); // ✅ DOM update after calculations
    }
  }

  function handleGenericDropdownChange(e) {
    const fieldId =
      e.target.getAttribute("data-field-id") ||
      e.target.getAttribute("data-dropdown-id");
    const value = e.target.value;

    console.log(
      `🔽 [S07] handleGenericDropdownChange: fieldId=${fieldId}, value="${value}", mode=${ModeManager.currentMode}`,
    );

    if (fieldId) {
      // ✅ PATTERN A: Use ModeManager.setValue for proper state separation
      console.log(
        `💾 [S07] handleGenericDropdownChange: Storing ${fieldId}="${value}" in ${ModeManager.currentMode} mode`,
      );
      ModeManager.setValue(fieldId, value, "user-modified");

      if (fieldId === "d_51") handleDHWSourceChange(e);

      const currentWaterMethod = ModeManager.getValue("d_49") || "User Defined";
      const currentSystemType = ModeManager.getValue("d_51") || "Heatpump";
      console.log(
        `🔍 [S07] handleGenericDropdownChange: Read back values - waterMethod="${currentWaterMethod}", systemType="${currentSystemType}"`,
      );
      updateSection7Visibility(currentWaterMethod, currentSystemType);
      calculateAll();
      ModeManager.updateCalculatedDisplayValues(); // ✅ DOM update after calculations
    }
  }

  function handleSliderChange(e) {
    const fieldId = e.target.getAttribute("data-field-id");
    const value = e.target.value;
    const displaySpan = document.querySelector(
      `span[data-display-for="${fieldId}"]`,
    );

    if (displaySpan) displaySpan.textContent = value + "%";

    if (fieldId && (e.type === "change" || e.type === "input")) {
      // ✅ PATTERN A: Use ModeManager.setValue for proper state separation
      ModeManager.setValue(fieldId, value, "user-modified");

      if (e.type === "change") {
        calculateAll();
        ModeManager.updateCalculatedDisplayValues(); // ✅ DOM update after calculations
      }
    }
  }

  function handleDHWSourceChange(event) {
    const selectedSource = event.target.value;
    console.log(
      `[S07] handleDHWSourceChange called: selectedSource="${selectedSource}"`,
    );
    const d52Slider = document.querySelector(
      'input[type="range"][data-field-id="d_52"]',
    );
    const d52Display = document.querySelector(`span[data-display-for="d_52"]`);

    let newMinValue = 50,
      newMaxValue = 400,
      newStep = 2,
      newValue = 300;

    if (selectedSource === "Gas" || selectedSource === "Oil") {
      newMinValue = 50;
      newMaxValue = 98;
      newStep = 1;
      newValue = 90;
    } else if (selectedSource === "Electric") {
      newMinValue = 90;
      newMaxValue = 100;
      newStep = 1;
      newValue = 100;
    } else {
      newMinValue = 100;
      newMaxValue = 450;
      newStep = 10;
      newValue = 300;
    }

    console.log(
      `[S07] Setting d_52 slider: min=${newMinValue}, max=${newMaxValue}, value=${newValue}`,
    );

    if (window.TEUI?.StateManager) {
      if (selectedSource === "Gas" || selectedSource === "Oil") {
        // 🔧 Gas/Oil: Update k_52 (AFUE field) - d_52 slider not used for these
        const afueValue = (newValue / 100).toFixed(2); // Convert 90% to 0.90
        window.TEUI.StateManager.setValue("k_52", afueValue, "system-update");
        window.TEUI.StateManager.setValue(
          `ref_k_52`,
          afueValue,
          "system-update",
        );
        console.log(
          `[S07] Updated ${selectedSource}: k_52=${afueValue} (AFUE)`,
        );
      } else {
        // 🔧 Electric/Heatpump: Update d_52 (efficiency slider)
        window.TEUI.StateManager.setValue(
          "d_52",
          newValue.toString(),
          "system-update",
        );
        window.TEUI.StateManager.setValue(
          `ref_d_52`,
          newValue.toString(),
          "system-update",
        );
        console.log(
          `[S07] Updated ${selectedSource}: d_52=${newValue}% (efficiency)`,
        );
      }
    }
    if (d52Slider) {
      d52Slider.min = newMinValue;
      d52Slider.max = newMaxValue;
      d52Slider.step = newStep;
      d52Slider.value = newValue;

      // Find display element (use nextElementSibling - confirmed working)
      let displayElement = d52Display || d52Slider.nextElementSibling;
      if (displayElement) {
        displayElement.textContent = `${newValue}%`;
        console.log(
          `[S07] Updated slider display: ${selectedSource} → d_52=${newValue}%`,
        );
      }

      // 🔧 CRITICAL: Update local state based on fuel type
      if (selectedSource === "Gas" || selectedSource === "Oil") {
        const afueValue = (newValue / 100).toFixed(2);
        ModeManager.setValue("k_52", afueValue, "system-update");
      } else {
        ModeManager.setValue("d_52", newValue.toString(), "system-update");
      }
      calculateAll();
      ModeManager.updateCalculatedDisplayValues();
    } else {
      console.log(`[S07] ERROR: d_52 slider not found in DOM!`);
    }
  }

  function initializeEventHandlers() {
    const sectionElement = document.getElementById("waterUse");
    if (!sectionElement) return;

    // Setup editable field handlers
    const editableFields = ["e_49", "e_50", "k_52"];
    editableFields.forEach((fieldId) => {
      const field = sectionElement.querySelector(
        `[data-field-id="${fieldId}"]`,
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

    // Setup dropdown handlers
    const dropdowns = sectionElement.querySelectorAll(
      "select[data-dropdown-id]",
    );
    dropdowns.forEach((dropdown) => {
      if (!dropdown.hasDropdownListener) {
        dropdown.addEventListener("change", handleGenericDropdownChange);
        dropdown.hasDropdownListener = true;
      }
    });

    // Setup slider handlers
    const sliders = sectionElement.querySelectorAll('input[type="range"]');
    sliders.forEach((slider) => {
      if (!slider.hasSliderListener) {
        slider.addEventListener("input", handleSliderChange);
        slider.addEventListener("change", handleSliderChange);
        slider.hasSliderListener = true;
      }
    });

    // StateManager listeners for external dependencies
    if (window.TEUI?.StateManager) {
      // ✅ PATTERN A: Dual-mode listeners for ALL external dependencies
      window.TEUI.StateManager.addListener("d_63", calculateAll); // Occupancy (Target)
      window.TEUI.StateManager.addListener("ref_d_63", calculateAll); // Occupancy (Reference)
      window.TEUI.StateManager.addListener("l_30", calculateAll); // Oil emissions factor (Target)
      window.TEUI.StateManager.addListener("ref_l_30", calculateAll); // Oil emissions factor (Reference)
      window.TEUI.StateManager.addListener("l_28", calculateAll); // Gas emissions factor (Target)
      window.TEUI.StateManager.addListener("ref_l_28", calculateAll); // Gas emissions factor (Reference)
    }
  }

  //==========================================================================
  // HEADER CONTROLS (Pattern A Mode Switching)
  //==========================================================================
  function injectHeaderControls() {
    const sectionHeader = document.querySelector("#waterUse .section-header");
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
    resetButton.title = "Reset Section 07 to Defaults";
    resetButton.style.cssText =
      "padding: 4px 8px; font-size: 0.8em; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;";

    resetButton.addEventListener("click", (event) => {
      event.stopPropagation();
      if (
        confirm(
          "Are you sure you want to reset all inputs in this section to their defaults? This will clear any saved data for Section 07.",
        )
      ) {
        // Reset both states
        TargetState.values = {};
        ReferenceState.values = {};
        ModeManager.currentMode = "target";
        calculateAll();
        ModeManager.updateCalculatedDisplayValues();
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
      console.log(`🎛️ [S07] Toggle switch clicked: isReference=${isReference}`);
      if (isReference) {
        slider.style.transform = "translateX(20px)";
        toggleSwitch.style.backgroundColor = "#28a745";
        stateIndicator.textContent = "REFERENCE";
        stateIndicator.style.backgroundColor = "rgba(40, 167, 69, 0.7)";
        console.log(`🔄 [S07] Toggle: Switching to REFERENCE mode`);
        ModeManager.switchMode("reference");
      } else {
        slider.style.transform = "translateX(0px)";
        toggleSwitch.style.backgroundColor = "#ccc";
        stateIndicator.textContent = "TARGET";
        stateIndicator.style.backgroundColor = "rgba(0, 123, 255, 0.5)";
        console.log(`🔄 [S07] Toggle: Switching to TARGET mode`);
        ModeManager.switchMode("target");
      }
    });

    // Append all controls to the container, then the container to the header
    controlsContainer.appendChild(resetButton);
    controlsContainer.appendChild(stateIndicator);
    controlsContainer.appendChild(toggleSwitch);
    sectionHeader.appendChild(controlsContainer);
  }

  function onSectionRendered() {
    // 1. ✅ CRITICAL: Initialize state defaults from FieldDefinitions (DUAL-STATE-CHEATSHEET.md compliance)
    console.log(
      `🚀 [S07] onSectionRendered: Initializing state defaults from FieldDefinitions`,
    );
    TargetState.setDefaults();
    ReferenceState.setDefaults();

    // 2. Initialize event handlers
    initializeEventHandlers();

    // 3. Inject header controls for mode switching
    injectHeaderControls();

    // 4. Initialize visibility based on current values (now properly initialized from FieldDefinitions)
    const initialWaterMethod =
      ModeManager.getFieldDefault("d_49") || "User Defined";
    const initialSystemType = ModeManager.getFieldDefault("d_51") || "Heatpump";
    updateSection7Visibility(initialWaterMethod, initialSystemType);

    // 4. Run initial calculations
    calculateAll();

    // 5. Update DOM display
    ModeManager.updateCalculatedDisplayValues();

    // 6. Apply validation tooltips to fields
    if (window.TEUI.TooltipManager && window.TEUI.TooltipManager.initialized) {
      setTimeout(() => {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }
  }

  //==========================================================================
  // PUBLIC API
  //==========================================================================
  return {
    getFields,
    getDropdownOptions,
    getLayout,
    initializeEventHandlers,
    onSectionRendered,
    calculateAll,
    calculateWaterUse,
    calculateHeatingSystem,
    updateSection7Visibility,
    setFieldGhosted,
    handleGenericDropdownChange,
    handleSliderChange,
    handleDHWSourceChange,
    injectHeaderControls,
    // ✅ PATTERN A: Expose state objects for external access
    ModeManager: ModeManager,

    // ✅ PHASE 2: Expose state objects for import sync
    TargetState: TargetState,
    ReferenceState: ReferenceState,
  };
})();

// Expose critical functions to global namespace for cross-module access
document.addEventListener("DOMContentLoaded", function () {
  const module = window.TEUI.SectionModules.sect07;
  if (module) {
    window.TEUI.sect07.calculateWaterUse = module.calculateWaterUse;
    window.TEUI.sect07.calculateHeatingSystem = module.calculateHeatingSystem;
    window.TEUI.sect07.calculateAll = module.calculateAll;
    window.TEUI.sect07.updateSection7Visibility =
      module.updateSection7Visibility;
  }
});

// Create a globally accessible safe version of calculateAll
window.calculateWaterUse = function () {
  if (window.waterUseCalculationRunning) return;
  window.waterUseCalculationRunning = true;
  try {
    if (window.TEUI?.SectionModules?.sect07?.calculateAll) {
      window.TEUI.SectionModules.sect07.calculateAll();
    } else if (window.TEUI?.sect07?.calculateAll) {
      window.TEUI.sect07.calculateAll();
    }
  } catch (e) {
    console.error("Error in water use calculation wrapper:", e);
  } finally {
    window.waterUseCalculationRunning = false;
  }
};
