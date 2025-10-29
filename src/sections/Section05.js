/**
 * 4012-Section05.js
 * CO2e Emissions (Section 5) - Lifetime Emissions Intensity
 *
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

// Section 5: CO2e Emissions Module
window.TEUI.SectionModules.sect05 = (function () {
  //==========================================================================
  // DUAL-STATE ARCHITECTURE (Self-Contained State Module - Pattern A)
  //==========================================================================

  // PATTERN 1: Internal State Objects (Self-Contained + Persistent)
  const TargetState = {
    state: {},
    listeners: {},
    initialize: function () {
      const savedState = localStorage.getItem("S05_TARGET_STATE");
      if (savedState) {
        this.state = JSON.parse(savedState);
      } else {
        this.setDefaults();
      }
    },
    setDefaults: function () {
      // ✅ PHASE 5 FIX: Read defaults from field definitions (single source of truth)
      this.state = {
        d_39: this.getFieldDefault("d_39") || "Pt.3 Mass Timber", // Typology-Based Carbon Intensity
        i_41: this.getFieldDefault("i_41") || "345.82", // Modelled Value kgCO2e/m2
      };
    },

    // Helper function to read defaults from field definitions (single source of truth)
    getFieldDefault: function (fieldId) {
      const fields = getFields();
      const field = fields[fieldId];
      if (field && field.defaultValue) {
        let value = field.defaultValue;
        // ✅ CRITICAL: Strip comma formatting to prevent calculation corruption
        if (typeof value === "string" && value.includes(",")) {
          value = value.replace(/,/g, "");
        }
        return value;
      }
      return null;
    },
    saveState: function () {
      localStorage.setItem("S05_TARGET_STATE", JSON.stringify(this.state));
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
    syncFromGlobalState: function (fieldIds = ["d_39", "i_41"]) {
      fieldIds.forEach((fieldId) => {
        const globalValue = window.TEUI.StateManager.getValue(fieldId);
        if (globalValue !== null && globalValue !== undefined) {
          this.setValue(fieldId, globalValue, "imported");
          console.log(
            `S05 TargetState: Synced ${fieldId} = ${globalValue} from global StateManager`,
          );
        }
      });
    },
  };

  const ReferenceState = {
    state: {},
    listeners: {},
    initialize: function () {
      const savedState = localStorage.getItem("S05_REFERENCE_STATE");
      if (savedState) {
        this.state = JSON.parse(savedState);
      } else {
        this.setDefaults();
      }
    },
    setDefaults: function () {
      // ✅ PHASE 5 FIX: Read base defaults from field definitions, then apply Reference overrides
      const currentStandard =
        window.TEUI?.StateManager?.getValue?.("d_13") || "OBC SB10 5.5-6 Z6";
      const referenceValues =
        window.TEUI?.ReferenceValues?.[currentStandard] || {};

      // Start with field definition defaults, then apply Reference overrides
      this.state = {
        d_39: referenceValues.d_39 || "Pt.3 Steel", // ✅ Reference typology for building code
        i_41: referenceValues.i_41 || this.getFieldDefault("i_41") || "345.82", // Reference embodied carbon value
      };

      console.log(
        `S05: Reference defaults loaded from standard: ${currentStandard}`,
      );
    },

    // Helper function to read defaults from field definitions (single source of truth)
    getFieldDefault: function (fieldId) {
      const fields = getFields();
      const field = fields[fieldId];
      if (field && field.defaultValue) {
        let value = field.defaultValue;
        // ✅ CRITICAL: Strip comma formatting to prevent calculation corruption
        if (typeof value === "string" && value.includes(",")) {
          value = value.replace(/,/g, "");
        }
        return value;
      }
      return null;
    },
    // Listen for changes to the reference standard and reload defaults
    onReferenceStandardChange: function () {
      console.log("S05: Reference standard changed, reloading defaults");
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
      localStorage.setItem("S05_REFERENCE_STATE", JSON.stringify(this.state));
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
     * NOTE: i_41 is NOT synced - it's calculated as i_41 = i_39 in Reference mode
     */
    syncFromGlobalState: function (fieldIds = ["d_39"]) {
      fieldIds.forEach((fieldId) => {
        const refFieldId = `ref_${fieldId}`;
        const globalValue = window.TEUI.StateManager.getValue(refFieldId);
        if (globalValue !== null && globalValue !== undefined) {
          this.setValue(fieldId, globalValue, "imported");
          console.log(
            `S05 ReferenceState: Synced ${fieldId} = ${globalValue} from global StateManager (${refFieldId})`,
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
        ["d_39", "i_41"].forEach((id) => {
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

      // ✅ BRIDGE: Sync Target changes to StateManager (NO PREFIX)
      if (this.currentMode === "target" && window.TEUI?.StateManager) {
        window.TEUI.StateManager.setValue(fieldId, value, "user-modified");
      }

      // ✅ BRIDGE: Sync Reference changes to StateManager (WITH ref_ PREFIX)
      if (this.currentMode === "reference" && window.TEUI?.StateManager) {
        window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, "user-modified");
      }
    },

    switchMode: function (mode) {
      if (this.currentMode === mode) return;
      this.currentMode = mode;
      console.log(`S05: Switched to ${mode.toUpperCase()} mode`);

      // ✅ CORRECTED: Only refresh UI, don't re-run calculations
      // Both engines should already have calculated values stored in StateManager
      this.refreshUI();
      this.updateCalculatedDisplayValues(); // Update calculated field displays only
    },

    refreshUI: function () {
      const sectionElement = document.getElementById("emissions");
      if (!sectionElement) return;

      const currentState = this.getCurrentState();
      const fieldsToSync = ["d_39", "i_41"]; // Input fields only

      fieldsToSync.forEach((fieldId) => {
        const stateValue = currentState.getValue(fieldId);
        if (stateValue === undefined || stateValue === null) return;

        const element = sectionElement.querySelector(
          `[data-field-id="${fieldId}"]`,
        );
        if (!element) return;

        // ✅ PATTERN A: Simple dropdown pattern (like S10/S12) - NO SAFETY CHECKS
        const dropdown =
          element.tagName === "SELECT"
            ? element
            : element.querySelector("select");

        if (dropdown) {
          dropdown.value = stateValue; // Simple and direct - like working sections
        } else if (element.hasAttribute("contenteditable")) {
          element.textContent = stateValue;
        }
      });
    },

    updateCalculatedDisplayValues: function () {
      // Update all calculated fields to show values for current mode
      const calculatedFields = [
        "d_38",
        "g_38",
        "i_38",
        "i_39",
        "i_40",
        "d_40",
        "d_41",
        "m_38",
        "l_39",
        "l_40",
        "l_41",
        "n_39",
        "n_40",
        "n_41", // L/M percentage and status columns
      ];
      console.log(
        `🔄 [S05] updateCalculatedDisplayValues: mode=${this.currentMode}`,
      );

      calculatedFields.forEach((fieldId) => {
        const element = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (element) {
          // Read the correct value from StateManager based on mode
          let value;
          if (this.currentMode === "reference") {
            // Reference mode: Read ONLY ref_ prefixed values.
            value = window.TEUI.StateManager.getValue(`ref_${fieldId}`);
          } else {
            // Target mode: Read unprefixed values.
            value = window.TEUI.StateManager.getValue(fieldId);
          }

          // If a value isn't found in the correct state, use a safe default. NEVER fall back.
          if (value === null || value === undefined) {
            value = "0"; // Use a neutral default
          }

          if (value !== null && value !== undefined) {
            // Use appropriate formatting - percentages and checkmarks don't need number formatting
            let formattedValue;
            if (fieldId.startsWith("l_")) {
              // Percentage fields - value should already be formatted
              formattedValue = value;
            } else if (fieldId.startsWith("n_")) {
              // Status checkmark fields
              formattedValue = value;
            } else {
              // Numeric fields
              formattedValue = window.TEUI.formatNumber
                ? window.TEUI.formatNumber(value, "number-2dp-comma")
                : value;
            }
            element.textContent = formattedValue;
          }
        }
      });
    },

    resetState: function () {
      console.log("S05: Resetting state and clearing localStorage.");

      // Reset both states to their current dynamic defaults
      TargetState.setDefaults();
      TargetState.saveState();
      ReferenceState.setDefaults();
      ReferenceState.saveState();

      console.log("S05: States have been reset to defaults.");

      // After resetting, refresh the UI and recalculate
      this.refreshUI();
      calculateAll();
      this.updateCalculatedDisplayValues(); // Update DOM with calculated values
    },
  };

  // Expose ModeManager for debugging and cross-section communication
  window.TEUI.SectionModules = window.TEUI.SectionModules || {};
  window.TEUI.SectionModules.sect05 = window.TEUI.SectionModules.sect05 || {};
  window.TEUI.SectionModules.sect05.ModeManager = ModeManager;

  //==========================================================================
  // FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  // Define rows with integrated field definitions
  const sectionRows = {
    // ALWAYS PUT UNIT SUBHEADER FIRST - this ensures it appears at the top of the section
    header: {
      id: "05-ID",
      rowId: "05-ID",
      label: "Emissions Units Header",
      cells: {
        c: { content: "C", classes: ["section-subheader"] },
        d: { content: "Metric Tons (MT)", classes: ["section-subheader"] },
        e: { content: "E", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "kgCO2e/m2/yr", classes: ["section-subheader"] },
        h: { content: "", classes: ["section-subheader", "spacer"] },
        i: {
          content: "kgCO2e/m2*Service Life",
          classes: ["section-subheader"],
        },
        j: { content: "J", classes: ["section-subheader"] },
        k: { content: "K", classes: ["section-subheader"] },
        l: { content: "L", classes: ["section-subheader"] },
        m: { content: "M", classes: ["section-subheader"] },
        n: { content: "N", classes: ["section-subheader"] },
      },
    },

    // Row 38: E.1.2 GHGI Operational (B6) Emissions/yr
    38: {
      id: "E.1.2",
      rowId: "E.1.2",
      label: "GHGI Operational (B6) Emissions/yr",
      cells: {
        c: { content: "GHGI Operational (B6) Emissions/yr", type: "label" },
        d: {
          fieldId: "d_38",
          type: "calculated",
          value: "0.00",
          section: "emissions",
        },
        e: { content: "MT CO2e/yr" }, // Unit for d_38
        f: { content: "E.1.4", classes: ["label-prefix"] }, // Label for i_38 based on Excel G38 position
        g: {
          fieldId: "g_38", // Annual kgCO2e/m2 - This value should appear in this column per app screenshot
          type: "calculated",
          value: "0.00",
          section: "emissions",
        },
        h: { content: "" }, // Unit for g_38 removed, now spacer
        i: {
          fieldId: "i_38", // Lifetime kgCO2e/m2 (g_38 * h_13) - This value appears in Excel I38
          type: "calculated",
          value: "0.00",
          section: "emissions",
        },
        j: {
          // Changed from calculated field to static text label, matching Excel J38
          content: "(B6 Annual Emissions * Service Life)",
          classes: ["descriptive-text", "text-center"], // Added text-center for potential better fit
        },
        k: { content: "" }, // Previously "(Lifetime Emissions)", now covered by j_38 label
        l: { content: "", classes: ["spacer"] }, // Keep as spacer or remove if not needed
        m: {
          fieldId: "m_38",
          type: "calculated",
          value: "N/A",
          section: "emissions",
        },
        // n: {} // Column N can be omitted if empty
      },
    },

    // Row 39: E.3.1 Typology-Based Carbon Intensity (A1-3)
    39: {
      id: "E.3.1",
      rowId: "E.3.1",
      label: "Typology-Based Carbon Intensity (A1-3)",
      cells: {
        c: { content: "Typology-Based Carbon Intensity (A1-3)", type: "label" },
        d: {
          fieldId: "d_39",
          type: "dropdown",
          dropdownId: "dd_d_39",
          value: "Pt.3 Mass Timber",
          section: "emissions",
          tooltip: true, // Building Typology
          options: [
            { value: "Pt.9 Res. Stick Frame", name: "Pt.9 Res. Stick Frame" },
            { value: "Pt.9 Small Mass Timber", name: "Pt.9 Small Mass Timber" },
            { value: "Pt.3 Mass Timber", name: "Pt.3 Mass Timber" },
            { value: "Pt.3 Concrete", name: "Pt.3 Concrete" },
            { value: "Pt.3 Steel", name: "Pt.3 Steel" },
            { value: "Pt.3 Office", name: "Pt.3 Office" },
            { value: "Modelled Value", name: "Modelled Value" },
          ],
        },
        e: { content: "", classes: ["spacer"] }, // Spacer
        f: { content: "E.3.2", classes: ["label-prefix"] },
        g: { content: "Typology-Based Cap (TGS4)", classes: ["label-main"] },
        h: { content: "", classes: ["spacer"] }, // Spacer for alignment before value in col I
        i: {
          fieldId: "i_39", // Value displayed in Column I
          type: "calculated",
          value: "350.00",
          section: "emissions",
          dependencies: ["d_39", "i_41"], // i_41 is needed if d_39 is "Modelled Value"
        },
        j: { content: "" }, // Unit for i_39 removed, now spacer
        k: { content: "", classes: ["spacer"] }, // Spacer
        l: {
          fieldId: "l_39",
          type: "calculated",
          value: "0%",
          section: "emissions",
          dependencies: ["i_39", "i_40", "d_40", "i_41"], // Broad dependencies for percentage
        },
        m: {
          fieldId: "n_39",
          type: "calculated",
          value: "✓",
          classes: ["checkmark"],
          section: "emissions",
          dependencies: ["l_39"],
        }, // Status checkmark in M
      },
    },

    // Row 40: E.3.3 Total Embedded Carbon Emitted (A1-3)
    40: {
      id: "E.3.3",
      rowId: "E.3.3",
      label: "Total Embedded Carbon Emitted (A1-3)",
      cells: {
        c: { content: "Total Embedded Carbon Emitted (A1-3)", type: "label" },
        d: {
          fieldId: "d_40",
          type: "calculated",
          value: "0.00",
          section: "emissions",
          dependencies: ["i_41", "d_106"],
        },
        e: { content: "MT CO2e/Service Life" },
        f: { content: "S.4", classes: ["label-prefix"] },
        g: { content: "Embodied Carbon Target", classes: ["label-main"] },
        h: { content: "", classes: ["spacer"] },
        i: {
          fieldId: "i_40", // Value displayed in Column I
          type: "calculated",
          value: "0.00",
          section: "emissions",
          dependencies: ["d_16"],
        },
        j: { content: "" }, // Unit for i_40 removed, now spacer
        k: { content: "", classes: ["spacer"] },
        l: {
          fieldId: "l_40",
          type: "calculated",
          value: "0%",
          section: "emissions",
          dependencies: ["i_39", "i_40", "d_40", "i_41"],
        },
        m: {
          fieldId: "n_40",
          type: "calculated",
          value: "✓",
          classes: ["checkmark"],
          section: "emissions",
          dependencies: ["l_40"],
        },
      },
    },

    // Row 41: E.1.3 Lifetime Avoided (B6) Emissions
    41: {
      id: "E.1.3",
      rowId: "E.1.3",
      label: "Lifetime Avoided (B6) Emissions",
      cells: {
        c: { content: "Lifetime Avoided (B6) Emissions", type: "label" },
        d: {
          fieldId: "d_41",
          type: "calculated",
          value: "0.00",
          section: "emissions",
          dependencies: ["ref_d_38", "d_38", "h_13"], // ref_d_38 is a placeholder concept
        },
        e: { content: "MT CO2e" },
        f: { content: "E.3.4", classes: ["label-prefix"] },
        g: { content: "Modelled Value (A1-3)", classes: ["label-main"] },
        h: { content: "", classes: ["spacer"] },
        i: {
          fieldId: "i_41",
          type: "editable", // Target: user-editable, Reference: calculated (ghosted)
          value: "345.82",
          section: "emissions",
          classes: ["user-input"],
          tooltip: true, // Externally Defined Value
          // ✅ IMPLEMENTED (Oct 1, 2025): Reference mode i_41 = i_39 (typology-based cap)
          // Target mode: User-defined modelled value (345.82 default)
          // Reference mode: Calculated from typology (Steel/Mass Timber/Concrete)
          // Field automatically ghosts in Reference mode (updateCalculatedDisplayValues)
        },
        l: {
          fieldId: "l_41",
          type: "calculated",
          value: "0%",
          section: "emissions",
          dependencies: ["i_39", "i_40", "d_40", "i_41"],
        },
        m: {
          fieldId: "n_41",
          type: "calculated",
          value: "✓",
          classes: ["checkmark"],
          section: "emissions",
          dependencies: ["l_41"],
        },
      },
    },
  };

  //==========================================================================
  // EVENT HANDLING AND CALCULATIONS
  //==========================================================================

  //==========================================================================
  // LAYOUT GENERATION (Essential for Rendering)
  //==========================================================================

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

        // Remove field-specific properties that aren't needed for rendering
        delete cell.getOptions;
        delete cell.section;
        delete cell.dependencies;

        rowDef.cells.push(cell);
      } else {
        // Add empty cell if not defined
        rowDef.cells.push({});
      }
    });

    return rowDef;
  }

  //==========================================================================
  // FIELD MANAGER INTEGRATION (Essential for FieldManager)
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
            label: cell.content || row.label,
            defaultValue: cell.value || "",
            section: cell.section || "emissions",
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

  //==========================================================================
  // EXTERNAL DEPENDENCIES (Clean Interface - Pattern A)
  //==========================================================================

  function getGlobalNumericValue(fieldId) {
    // ✅ CLEAN: Read external dependencies without prefixes
    const rawValue = window.TEUI?.StateManager?.getValue(fieldId);
    return window.TEUI.parseNumeric(rawValue) || 0;
  }

  function getSectionValue(fieldId, isReferenceCalculation = false) {
    // ✅ DUAL-ENGINE PATTERN: Get section-local values based on calculation context
    if (isReferenceCalculation) {
      return ReferenceState.getValue(fieldId);
    } else {
      return TargetState.getValue(fieldId);
    }
  }

  //==========================================================================
  // DUAL-ENGINE CALCULATIONS (Clean Pattern A)
  //==========================================================================

  /**
   * Calculate GHGI Operational Emissions
   * Excel Target D38 = IF(D14="Utility Bills", G32/1000, K32/1000)
   * Excel Reference D38 = K32/1000 (always uses Reference target emissions)
   */
  function calculateGHGI(isReferenceCalculation = false) {
    const h_15_value = isReferenceCalculation
      ? getGlobalNumericValue("ref_h_15") // Reference reads Reference upstream
      : getGlobalNumericValue("h_15"); // Target reads Target upstream

    let emissionsValue, d_38_result;

    if (isReferenceCalculation) {
      // Reference mode: D38 = ref_k_32 / 1000 (always Reference target emissions)
      const ref_k_32 = getGlobalNumericValue("ref_k_32") || 0; // From S04 Reference
      emissionsValue = ref_k_32;
      d_38_result = ref_k_32 / 1000; // MT CO2e/yr
    } else {
      // Target mode: D38 = IF(D14="Utility Bills", G32/1000, K32/1000)
      const d_14 = getGlobalNumericValue("d_14") || "Targeted Use"; // Reporting mode from S02
      const g_32 = getGlobalNumericValue("g_32") || 0; // Actual emissions from S04
      const k_32 = getGlobalNumericValue("k_32") || 0; // Target emissions from S04

      if (d_14 === "Utility Bills") {
        emissionsValue = g_32; // Use actual (utility bills)
      } else {
        emissionsValue = k_32; // Use target (design/modelled)
      }
      d_38_result = emissionsValue / 1000; // MT CO2e/yr
    }

    // g_38 = emissions / h_15 (annual kgCO2e/m²)
    const g_38_result = h_15_value > 0 ? emissionsValue / h_15_value : 0;

    // Store results in appropriate state
    if (isReferenceCalculation) {
      window.TEUI.StateManager.setValue("ref_d_38", d_38_result, "calculated");
      window.TEUI.StateManager.setValue("ref_g_38", g_38_result, "calculated");
    } else {
      window.TEUI.StateManager.setValue("d_38", d_38_result, "calculated");
      window.TEUI.StateManager.setValue("g_38", g_38_result, "calculated");
    }
  }

  /**
   * Calculate Typology-Based Carbon Intensity (i_39)
   */
  function calculateTypologyBasedCap(typology, isReferenceCalculation = false) {
    // ✅ EXCEL FORMULA IMPLEMENTATION: =IF(D39="Pt.9 Res. Stick Frame",125,IF(D39="Pt.9 Small Mass Timber",250,...
    if (typology === "Modelled Value") {
      // When "Modelled Value" is selected, use I41 (i_41) value
      const i_41_value = isReferenceCalculation
        ? ReferenceState.getValue("i_41")
        : TargetState.getValue("i_41");
      return window.TEUI.parseNumeric(i_41_value) || 0;
    }

    // Direct typology mapping from Excel formula
    const caps = {
      "Pt.9 Res. Stick Frame": 125,
      "Pt.9 Small Mass Timber": 250,
      "Pt.3 Mass Timber": 350,
      "Pt.3 Concrete": 550,
      "Pt.3 Steel": 650,
      "Pt.3 Office": 600,
    };
    return caps[typology] || 0; // Return 0 if typology not found (equivalent to "Pls. Select a Value")
  }

  /**
   * Calculate Lifetime Operational kgCO2e/m2 (i_38 = g_38 * h_13)
   */
  function calculate_i_38(isReferenceCalculation = false) {
    const g_38_field = isReferenceCalculation ? "ref_g_38" : "g_38";
    const g_38_value = window.TEUI.StateManager.getValue(g_38_field) || 0;
    const h_13_value = isReferenceCalculation
      ? getGlobalNumericValue("ref_h_13") // Reference reads Reference upstream
      : getGlobalNumericValue("h_13"); // Target reads Target upstream

    const i_38_result = g_38_value * h_13_value;

    if (isReferenceCalculation) {
      window.TEUI.StateManager.setValue("ref_i_38", i_38_result, "calculated");
    } else {
      window.TEUI.StateManager.setValue("i_38", i_38_result, "calculated");
    }
  }

  /**
   * Calculate Target kgCO2e/m2 (i_40 = d_16)
   */
  function calculate_i_40(isReferenceCalculation = false) {
    const d_16_value_raw = isReferenceCalculation
      ? getGlobalNumericValue("ref_d_16") // Reference reads Reference upstream
      : getGlobalNumericValue("d_16"); // Target reads Target upstream

    let result;
    if (d_16_value_raw === "N/A" || isNaN(d_16_value_raw)) {
      result = "N/A";
    } else {
      result = d_16_value_raw;
    }

    if (isReferenceCalculation) {
      window.TEUI.StateManager.setValue("ref_i_40", result, "calculated");
    } else {
      window.TEUI.StateManager.setValue("i_40", result, "calculated");
    }
  }

  /**
   * Calculate Total Embedded MT CO2e
   * Excel: Target D40 = I41 × D106 / 1000 (user modelled value)
   * Excel: Reference D40 = I39 × D106 / 1000 (typology-based cap)
   */
  function calculate_d_40(isReferenceCalculation = false) {
    const d_106_value = isReferenceCalculation
      ? getGlobalNumericValue("ref_d_106") // Reference reads Reference upstream
      : getGlobalNumericValue("d_106"); // Target reads Target upstream

    let carbonValue;
    if (isReferenceCalculation) {
      // Reference mode: Check if user selected "Modelled Value" exception
      const d_39_typology = ReferenceState.getValue("d_39") || "";

      if (d_39_typology === "Modelled Value") {
        // Exception: User can define i_41 in Reference mode
        // D40 = I41 × D106 / 1000
        const i_41_value = getSectionValue("i_41", true);
        carbonValue = window.TEUI.parseNumeric(i_41_value) || 0;
      } else {
        // Standard: D40 = I39 × D106 / 1000 (typology-based cap)
        const i_39_value = window.TEUI.StateManager.getValue("ref_i_39");
        carbonValue = window.TEUI.parseNumeric(i_39_value) || 0;
      }
    } else {
      // Target mode: Always D40 = I41 × D106 / 1000 (user modelled value)
      const i_41_value = getSectionValue("i_41", false);
      carbonValue = window.TEUI.parseNumeric(i_41_value) || 0;
    }

    const d_40_result = (carbonValue * d_106_value) / 1000; // Result in MT CO2e

    if (isReferenceCalculation) {
      window.TEUI.StateManager.setValue("ref_d_40", d_40_result, "calculated");
    } else {
      window.TEUI.StateManager.setValue("d_40", d_40_result, "calculated");
    }
  }

  /**
   * Calculate Lifetime Avoided MT CO2e (d_41)
   * Excel D41 = (REFERENCE!D38 - REPORT!D38) × H13
   *
   * NOTE: This is a COMPARISON value (Reference vs Target) - intentionally state-agnostic
   * Both Target and Reference modes show the same value (avoided emissions from Target design)
   */
  function calculate_d_41(isReferenceCalculation = false) {
    // Read from BOTH states for comparison
    const d_38 = window.TEUI.StateManager.getValue("d_38") || 0; // Target operational emissions
    const ref_d_38 = window.TEUI.StateManager.getValue("ref_d_38") || 0; // Reference operational emissions
    const h_13 = getGlobalNumericValue("h_13") || 50; // Service life (same for both modes)

    // Avoided emissions: Reference baseline minus Target performance
    const d_41_result = (ref_d_38 - d_38) * h_13;

    // Store in appropriate state (same value, different key)
    if (isReferenceCalculation) {
      window.TEUI.StateManager.setValue("ref_d_41", d_41_result, "calculated");
    } else {
      window.TEUI.StateManager.setValue("d_41", d_41_result, "calculated");
    }
  }

  /**
   * Calculate percentage compliance (L columns) and status (M columns)
   */
  function calculatePercentages(isReferenceCalculation = false) {
    // Get values for percentage calculations
    const i_39_value = isReferenceCalculation
      ? window.TEUI.StateManager.getValue("ref_i_39") || 0
      : window.TEUI.StateManager.getValue("i_39") || 0;
    const i_40_value = isReferenceCalculation
      ? window.TEUI.StateManager.getValue("ref_i_40") || 0
      : window.TEUI.StateManager.getValue("i_40") || 0;
    const d_40_value = isReferenceCalculation
      ? window.TEUI.StateManager.getValue("ref_d_40") || 0
      : window.TEUI.StateManager.getValue("d_40") || 0;
    const i_41_value = getSectionValue("i_41", isReferenceCalculation);

    // Parse numeric values
    const typologyCap = window.TEUI.parseNumeric(i_39_value) || 350;
    const carbonTarget = window.TEUI.parseNumeric(i_40_value);
    const totalEmitted = window.TEUI.parseNumeric(d_40_value) || 0;
    const modelledValue = window.TEUI.parseNumeric(i_41_value) || 0;

    // Handle N/A case
    if (carbonTarget === "N/A" || isNaN(carbonTarget)) {
      const naFields = ["l_39", "l_40", "l_41"];
      const okFields = ["n_39", "n_40", "n_41"];

      naFields.forEach((fieldId) => {
        if (isReferenceCalculation) {
          window.TEUI.StateManager.setValue(
            `ref_${fieldId}`,
            "N/A",
            "calculated",
          );
        } else {
          window.TEUI.StateManager.setValue(fieldId, "N/A", "calculated");
        }
      });

      okFields.forEach((fieldId) => {
        if (isReferenceCalculation) {
          window.TEUI.StateManager.setValue(
            `ref_${fieldId}`,
            "✓",
            "calculated",
          );
        } else {
          window.TEUI.StateManager.setValue(fieldId, "✓", "calculated");
        }
      });
      return;
    }

    // Calculate percentages (as fractions for proper formatting)
    const typologyPercent = typologyCap !== 0 ? carbonTarget / typologyCap : 0;
    const targetPercent = totalEmitted !== 0 ? carbonTarget / totalEmitted : 0;
    const modelledPercent =
      carbonTarget !== 0 ? modelledValue / carbonTarget : 0;

    // Store percentage results
    const percentFields = [
      { field: "l_39", value: typologyPercent },
      { field: "l_40", value: targetPercent },
      { field: "l_41", value: modelledPercent },
    ];

    percentFields.forEach(({ field, value }) => {
      const formattedValue = window.TEUI.formatNumber
        ? window.TEUI.formatNumber(value, "percent-0dp")
        : Math.round(value * 100) + "%";

      if (isReferenceCalculation) {
        window.TEUI.StateManager.setValue(
          `ref_${field}`,
          formattedValue,
          "calculated",
        );
      } else {
        window.TEUI.StateManager.setValue(field, formattedValue, "calculated");
      }
    });

    // Set checkmarks for status columns
    const statusFields = ["n_39", "n_40", "n_41"];
    statusFields.forEach((fieldId) => {
      if (isReferenceCalculation) {
        window.TEUI.StateManager.setValue(`ref_${fieldId}`, "✓", "calculated");
      } else {
        window.TEUI.StateManager.setValue(fieldId, "✓", "calculated");
      }
    });

    // Simple m_38 compliance
    const m_38_result = isReferenceCalculation ? "100%" : "N/A";
    if (isReferenceCalculation) {
      window.TEUI.StateManager.setValue("ref_m_38", m_38_result, "calculated");
    } else {
      window.TEUI.StateManager.setValue("m_38", m_38_result, "calculated");
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
      // Read typology from Reference state
      const typology = ReferenceState.getValue("d_39");
      const cap = calculateTypologyBasedCap(typology, true);
      window.TEUI.StateManager.setValue("ref_i_39", cap, "calculated");

      // ✅ FIX (Oct 5, 2025): In Reference mode, i_41 = i_39 (Excel formula)
      // Target mode: i_41 is user input (pure input field)
      // Reference mode: i_41 = i_39 (calculated from typology)
      window.TEUI.StateManager.setValue("ref_i_41", cap, "calculated");
      ReferenceState.setValue("i_41", cap, "calculated");

      // Run all calculations in Reference context
      calculateGHGI(true);
      calculate_i_38(true);
      calculate_i_40(true);
      calculate_d_40(true); // Uses i_39 in Reference mode (different formula than Target)
      calculate_d_41(true); // Uses ref_k_32/1000 in Reference mode
      calculatePercentages(true);

      // console.log("[S05] Reference model calculations complete");
    } catch (error) {
      console.error("[S05] Error in Reference Model calculations:", error);
    }
  }

  /**
   * TARGET MODEL ENGINE: Calculate all values using Target state
   */
  function calculateTargetModel() {
    try {
      // Read typology from Target state
      const typology = TargetState.getValue("d_39");
      const cap = calculateTypologyBasedCap(typology, false);
      window.TEUI.StateManager.setValue("i_39", cap, "calculated");

      // Run all calculations in Target context
      calculateGHGI(false);
      calculate_i_38(false);
      calculate_i_40(false);
      calculate_d_40(false);
      calculate_d_41(false);
      calculatePercentages(false);

      // console.log("[S05] Target model calculations complete");
    } catch (error) {
      console.error("[S05] Error in Target Model calculations:", error);
    }
  }

  /**
   * ✅ DUAL-ENGINE: Always run both engines in parallel
   */
  function calculateAll() {
    // console.log("[S05] Running dual-engine calculations...");
    calculateTargetModel(); // Stores unprefixed values in StateManager
    calculateReferenceModel(); // Stores ref_ prefixed values in StateManager
    // console.log("[S05] Dual-engine calculations complete");
  }

  //==========================================================================
  // EVENT HANDLERS (Clean Pattern A)
  //==========================================================================

  /**
   * Initialize all event handlers for this section
   */
  function initializeEventHandlers() {
    // 1. Event handler for the Typology dropdown
    const typologyDropdown = document.querySelector(
      '[data-field-id="d_39"], [data-dropdown-id="dd_d_39"]',
    );
    if (typologyDropdown) {
      typologyDropdown.addEventListener("change", (e) => {
        const typology = e.target.value;
        ModeManager.setValue("d_39", typology, "user-modified");
        calculateAll(); // Trigger both engines
        ModeManager.updateCalculatedDisplayValues(); // Update DOM with new calculated values
      });
    } else {
      console.warn(
        `⚠️ [S05] Typology dropdown not found! Selector: [data-field-id="d_39"], [data-dropdown-id="dd_d_39"]`,
      );
    }

    // 2. Event handlers for editable fields
    const editableFields = ["i_41"];
    editableFields.forEach((fieldId) => {
      const field = document.querySelector(`[data-field-id="${fieldId}"]`);
      if (field && !field.hasEditableListeners) {
        // ✅ CRITICAL: Prevent newlines on Enter key (copy from S04/S08/S09 pattern)
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

    // 3. ✅ PATTERN 2: Listen for BOTH Target and Reference dependencies
    if (window.TEUI.StateManager) {
      const dependencies = [
        "h_13",
        "ref_h_13", // Service life (both modes)
        "g_32",
        "ref_g_32", // from S04 (both modes)
        "k_32",
        "ref_k_32", // from S04 (both modes)
        "h_15",
        "ref_h_15", // Conditioned Area (both modes)
        "d_16",
        "ref_d_16", // Embodied Carbon Target (both modes)
        "d_106",
        "ref_d_106", // Total Floor Area (both modes)
      ];

      // Create a wrapper function that calculates AND updates DOM
      const calculateAndRefresh = () => {
        calculateAll();
        ModeManager.updateCalculatedDisplayValues();
      };

      dependencies.forEach((depId) => {
        window.TEUI.StateManager.removeListener(depId, calculateAndRefresh);
        window.TEUI.StateManager.addListener(depId, calculateAndRefresh);
      });

      // 4. ✅ S05→S02 RELATIONSHIP: Listen for Carbon Standard changes and update d_16
      const updateCarbonTarget = (fieldId) => {
        const isReference = fieldId === "ref_d_15";
        const d_15_value = window.TEUI.StateManager.getValue(fieldId);
        let d_16_value;

        // Excel formula logic: =IF(D15="BR18 (Denmark)",500,IF(D15="IPCC AR6 EPC"...
        switch (d_15_value) {
          case "BR18 (Denmark)":
          case "TGS4":
            d_16_value = 500;
            break;
          case "CaGBC ZCB D":
          case "CaGBC ZCB P":
            d_16_value = 425;
            break;
          case "IPCC AR6 EPC":
            // TODO: Look up from S3-Carbon-Standards K7 when available
            d_16_value = 400; // Placeholder
            break;
          case "IPCC AR6 EA":
            // TODO: Look up from S3-Carbon-Standards L7 when available
            d_16_value = 450; // Placeholder
            break;
          case "Self Reported":
            // Use current i_41 value from S05
            d_16_value = getSectionValue("i_41", isReference);
            break;
          default:
            d_16_value = "N/A";
        }

        // Update S02's d_16 field
        const targetField = isReference ? "ref_d_16" : "d_16";
        window.TEUI.StateManager.setValue(
          targetField,
          d_16_value,
          "calculated",
        );
        console.log(
          `[S05→S02] Updated ${targetField} = ${d_16_value} based on ${fieldId} = ${d_15_value}`,
        );
      };

      // Listen for both Target and Reference Carbon Standard changes
      window.TEUI.StateManager.removeListener("d_15", () =>
        updateCarbonTarget("d_15"),
      );
      window.TEUI.StateManager.addListener("d_15", () =>
        updateCarbonTarget("d_15"),
      );
      window.TEUI.StateManager.removeListener("ref_d_15", () =>
        updateCarbonTarget("ref_d_15"),
      );
      window.TEUI.StateManager.addListener("ref_d_15", () =>
        updateCarbonTarget("ref_d_15"),
      );
    }
  }

  /**
   * Creates and injects the Target/Reference toggle and Reset button into the section header.
   */
  function injectHeaderControls() {
    const sectionHeader = document.querySelector("#emissions .section-header");
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
    resetButton.title = "Reset Section 05 to Defaults";
    resetButton.style.cssText =
      "padding: 4px 8px; font-size: 0.8em; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;";

    resetButton.addEventListener("click", (event) => {
      event.stopPropagation();
      if (
        confirm(
          "Are you sure you want to reset all inputs in this section to their defaults? This will clear any saved data for Section 05.",
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
    // console.log("S05: Pattern A initialization starting...");

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

    // console.log("S05: Pattern A initialization complete.");
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
