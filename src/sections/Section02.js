/**
 * 4012-Section02.js
 * Building Information (Section 2) module for TEUI Calculator 4.012
 */

// Create section-specific namespace for global references
window.TEUI = window.TEUI || {};
window.TEUI.sect02 = window.TEUI.sect02 || {};
window.TEUI.sect02.initialized = false;
window.TEUI.sect02.userInteracted = false;
let isSect02Initialized = false; // Initialization flag to prevent race conditions

// Section 2: Building Information Module
window.TEUI.SectionModules.sect02 = (function () {
  //==========================================================================
  // CONSOLIDATED FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  // Define rows with integrated field definitions
  const sectionRows = {
    // UNIT SUBHEADER - MUST COME FIRST
    header: {
      id: "02-ID",
      rowId: "02-ID",
      label: "Building Info Units",
      cells: {
        c: {
          content: "SECTION 02. Building Information",
          classes: ["section-header"],
        },
        d: { content: "", classes: ["section-subheader"] },
        e: { content: "", classes: ["section-subheader"] },
        f: { content: "", classes: ["section-subheader"] },
        g: { content: "", classes: ["section-subheader"] },
        h: { content: "", classes: ["section-subheader"] },
        i: { content: "", classes: ["section-subheader"] },
        j: { content: "", classes: ["section-subheader"] },
        k: { content: "", classes: ["section-subheader"] },
        l: {
          content: "T.10 Cost of Energy by Source",
          classes: ["section-subheader", "text-center"],
          colspan: 3,
        },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 12: B.1 Major Occupancy
    12: {
      id: "B.1",
      rowId: "B.1",
      label: "Major Occupancy",
      cells: {
        c: { label: "Major Occupancy" },
        d: {
          fieldId: "d_12",
          type: "dropdown",
          dropdownId: "dd_d_12",
          value: "A-Assembly",
          section: "buildingInfo",
          tooltip: true, // Major Occupancy
          options: [
            { value: "A-Assembly", name: "A-Assembly" },
            { value: "B1-Detention", name: "B1-Detention" },
            { value: "B2-Care and Treatment", name: "B2-Care and Treatment" },
            {
              value: "B3-Detention Care & Treatment",
              name: "B3-Detention Care & Treatment",
            },
            { value: "C-Residential", name: "C-Residential" },
            {
              value: "D-Business & Personal Services",
              name: "D-Business & Personal Services",
            },
            { value: "E-Mercantile", name: "E-Mercantile" },
            { value: "F-Industrial", name: "F-Industrial" },
          ],
        },
        e: { content: "" }, // Empty but needed for alignment
        f: {
          content: "D.1",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: {
          content: "Reporting Period",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: {
          fieldId: "h_12",
          type: "year_slider",
          value: "2022",
          min: 2015,
          max: 2041,
          step: 1,
          section: "buildingInfo",
          tooltip: true, // Year Data Entered
          span: 2,
        },
        i: { content: "" }, // Empty but needed for alignment
        j: { content: "" }, // Empty but needed for alignment
        k: { content: "Electricity", classes: ["text-end"] },
        l: {
          fieldId: "l_12",
          type: "editable",
          value: "$0.1300",
          section: "buildingInfo",
          tooltip: true, // Assume $0.13/kwh
        },
        m: { content: "/kWh", classes: ["text-start"] },
        n: { content: "" }, // Empty but needed for alignment
      },
    },

    // Row 13: S.1 Reference Standard
    13: {
      id: "S.1",
      rowId: "S.1",
      label: "Reference Standard",
      cells: {
        c: { label: "Reference Standard" },
        d: {
          fieldId: "d_13",
          type: "dropdown",
          dropdownId: "dd_d_13",
          value: "OBC SB10 5.5-6 Z6",
          section: "buildingInfo",
          tooltip: true, // Reference Standards
          options: [
            { value: "OBC SB12 3.1.1.2.C4", name: "OBC SB12 3.1.1.2.C4" },
            { value: "OBC SB12 3.1.1.2.C1", name: "OBC SB12 3.1.1.2.C1" },
            { value: "OBC SB12 3.1.1.2.A3", name: "OBC SB12 3.1.1.2.A3" },
            { value: "OBC SB10 5.5-6 Z6", name: "OBC SB10 5.5-6 Z6" },
            {
              value: "OBC SB10 5.5-6 Z5 (2010)",
              name: "OBC SB10 5.5-6 Z5 (2010)",
            },
            { value: "NBC T1", name: "NBC T1" },
            { value: "NECB T1 (Z6)", name: "NECB T1 (Z6)" },
            { value: "CaGBC ZCB", name: "CaGBC ZCB" },
            { value: "PH Classic", name: "PH Classic" },
            { value: "PH Plus", name: "PH Plus" },
            { value: "PH Premium", name: "PH Premium" },
            { value: "EnerPHit", name: "EnerPHit" },
            { value: "PH Low Energy", name: "PH Low Energy" },
            { value: "ADD YOUR OWN HERE", name: "ADD YOUR OWN HERE" },
          ],
        },
        e: { content: "" }, // Empty but needed for alignment
        f: {
          content: "D.2",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: {
          content: "Service Life (yrs)",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: {
          fieldId: "h_13",
          type: "year_slider",
          value: "50",
          min: 30,
          max: 100,
          step: 10,
          section: "buildingInfo",
          tooltip: true, // Select a period in Years
          span: 2,
        },
        i: { content: "" }, // Empty but needed for alignment
        j: { content: "" }, // Empty but needed for alignment
        k: { content: "Gas", classes: ["text-end"] },
        l: {
          fieldId: "l_13",
          type: "editable",
          value: "$0.5070",
          section: "buildingInfo",
          tooltip: true, // Assume $0.507 (Ontario)
        },
        m: { content: "/m³", classes: ["text-start"] },
        n: { content: "" }, // Empty but needed for alignment
      },
    },

    // Row 14: S.2 Actual/Target Use
    14: {
      id: "S.2",
      rowId: "S.2",
      label: "Actual (Bills) or Targeted (Design) Use",
      cells: {
        c: { label: "Actual (Bills) or Targeted (Design) Use" },
        d: {
          fieldId: "d_14",
          type: "dropdown",
          dropdownId: "dd_d_14",
          value: "Utility Bills",
          section: "buildingInfo",
          tooltip: true, // Select a Method
          options: [
            { value: "Targeted Use", name: "Targeted Use" },
            { value: "Utility Bills", name: "Utility Bills" },
          ],
        },
        e: { content: "" }, // Empty but needed for alignment
        f: {
          content: "B.2",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: {
          content: "Project Name",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: {
          fieldId: "h_14",
          type: "editable",
          value: "Three Feathers Terrace",
          classes: ["wide-text", "no-wrap"],
          section: "buildingInfo",
          tooltip: true, // Project Name
          span: 2,
        },
        i: { content: "" }, // Empty but needed for alignment
        j: { content: "" }, // Empty but needed for alignment
        k: { content: "Propane", classes: ["text-end"] },
        l: {
          fieldId: "l_14",
          type: "editable",
          value: "$1.6200",
          section: "buildingInfo",
          tooltip: true, // Assume $1.62 (Ontario)
        },
        m: { content: "/kg", classes: ["text-start"] },
        n: { content: "" }, // Empty but needed for alignment
      },
    },

    // Row 15: S.3 Carbon Standard
    15: {
      id: "S.3",
      rowId: "S.3",
      label: "Carbon Benchmarking Standard",
      cells: {
        c: { label: "Carbon Benchmarking Standard" },
        d: {
          fieldId: "d_15",
          type: "dropdown",
          dropdownId: "dd_d_15",
          value: "Self Reported",
          section: "buildingInfo",
          tooltip: true, // Carbon Benchmark
          options: [
            { value: "BR18 (Denmark)", name: "BR18 (Denmark)" },
            { value: "IPCC AR6 EPC", name: "IPCC AR6 EPC" },
            { value: "IPCC AR6 EA", name: "IPCC AR6 EA" },
            { value: "TGS4", name: "TGS4" },
            { value: "CaGBC ZCB D", name: "CaGBC ZCB D" },
            { value: "CaGBC ZCB P", name: "CaGBC ZCB P" },
            { value: "Self Reported", name: "Self Reported" },
            { value: "Not Reported", name: "Not Reported" },
          ],
        },
        e: { content: "" }, // Empty but needed for alignment
        f: {
          content: "B.3",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: {
          content: "Conditioned Area",
          classes: ["label-main", "text-left", "no-wrap"],
        }, // validate as (Net m²)
        h: {
          fieldId: "h_15",
          type: "editable",
          value: "1427.20", // ✅ FIXED: Raw value without comma for calculation stability
          classes: ["user-input", "editable"],
          section: "buildingInfo",
          tooltip: true, // Net Conditioned Area
        },
        i: {
          fieldId: "i_15_slider",
          type: "generic_slider",
          min: -500, // Adjustment range min (+/- 500)
          max: 500, // Adjustment range max (+/- 500)
          step: 10,
          value: "0",
          controlsField: "h_15",
          section: "buildingInfo",
          classes: ["area-adjust-slider"], // Optional class for specific styling
        },
        j: { content: "" }, // Empty but needed for alignment
        k: { content: "Wood", span: 2, classes: ["text-end"] }, // Restored: Wood label back in K, added span:2 to fix alignment
        l: {
          fieldId: "l_15",
          type: "editable",
          value: "$180.00",
          section: "buildingInfo",
          tooltip: true, // Assume $180/m3 (Ontario)
        }, // Restored: Field l_15 back in L
        m: { content: "/m³", classes: ["text-start"] }, // Restored: Unit back in M
        n: { content: "" }, // Restored: N is empty
      },
    },

    // Row 16: S.4 Embodied Carbon Target
    16: {
      id: "S.4",
      rowId: "S.4",
      label: "Embodied Carbon Target (kgCO₂e/m²)",
      cells: {
        c: { label: "Embodied Carbon Target (kgCO₂e/m²)" },
        d: {
          fieldId: "d_16",
          type: "derived",
          value: "345.82",
          section: "buildingInfo",
          tooltip: true, // S4. Targets
        },
        e: { content: "" }, // Empty but needed for alignment
        f: {
          content: "A.1",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: {
          content: "Certifier:",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: {
          fieldId: "i_16",
          type: "editable",
          value: "Thomson Architecture, Inc.",
          section: "buildingInfo",
          tooltip: true, // Certifier
          span: 2,
        },
        i: { content: "" }, // Empty but needed for alignment
        j: { content: "" }, // Empty but needed for alignment
        k: { content: "Oil", classes: ["text-end"] },
        l: {
          fieldId: "l_16",
          type: "editable",
          value: "$1.5000",
          section: "buildingInfo",
          tooltip: true, // Assume $1.50 (Ontario)
        },
        m: { content: "/litre", classes: ["text-start"] },
        n: { content: "" }, // Empty but needed for alignment
      },
    },

    // Row 17: License Number
    17: {
      id: "L",
      rowId: "L",
      label: "",
      cells: {
        c: { content: "" }, // Empty but needed for alignment
        d: { content: "" }, // Empty but needed for alignment
        e: { content: "" }, // Empty but needed for alignment
        f: {
          content: "A.2",
          classes: ["label-prefix", "text-right", "no-wrap"],
        },
        g: {
          content: "Licence No:",
          classes: ["label-main", "text-left", "no-wrap"],
        },
        h: {
          fieldId: "i_17",
          type: "editable",
          value: "8154",
          section: "buildingInfo",
          tooltip: true, // License or Authorization
          span: 2,
        },
        i: { content: "" }, // Empty but needed for alignment
        j: { content: "" }, // Empty but needed for alignment
        k: { content: "" }, // Empty but needed for alignment
        l: { content: "" }, // Empty but needed for alignment
        m: { content: "" }, // Empty but needed for alignment
        n: { content: "" }, // Empty but needed for alignment
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
            section: cell.section || "buildingInfo",
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

  /**
   * Retrieves a field's default value from the sectionRows definition.
   * This is the single source of truth for all default values.
   * ✅ CRITICAL FIX: Returns numeric values without comma formatting for calculation stability
   * @param {string} fieldId The ID of the field (e.g., "d_12").
   * @returns {string|null} The default value or null if not found.
   */
  function getFieldDefault(fieldId) {
    for (const row of Object.values(sectionRows)) {
      if (row.cells) {
        for (const cell of Object.values(row.cells)) {
          if (cell.fieldId === fieldId && cell.value !== undefined) {
            let value = cell.value;
            // ✅ CRITICAL FIX: Remove comma formatting from numeric fields for calculation stability
            // This prevents floating-point corruption during state operations
            if (fieldId === "h_15" && typeof value === "string") {
              value = value.replace(/,/g, ""); // Remove commas: "1,427.20" → "1427.20"
            }
            return value;
          }
        }
      }
    }
    return null;
  }

  //==========================================================================
  // EVENT HANDLING AND CALCULATIONS
  //==========================================================================

  /**
   * Helper function to safely get numeric values with proper comma handling.
   * STANDARD MODE-AWARE PATTERN
   * This function reads from the correct state (`target_` or `ref_`) based on the current mode.
   */
  function getNumericValue(fieldId, defaultValue = 0) {
    // ✅ PATTERN A: EXPLICIT STATE ACCESS - No target_/ref_ prefix contamination
    let rawValue;

    if (ModeManager.currentMode === "reference") {
      // Reference mode: Read ONLY ref_ prefixed values for perfect state isolation
      rawValue = window.TEUI?.StateManager?.getValue(`ref_${fieldId}`);
    } else {
      // Target mode: Read unprefixed (standard) values
      rawValue = window.TEUI?.StateManager?.getValue(fieldId);
    }

    // If a value isn't found in the correct state, use the default. NEVER fall back to the other state.
    if (rawValue === null || rawValue === undefined) {
      rawValue = defaultValue;
    }

    return window.TEUI?.parseNumeric?.(rawValue, defaultValue) ?? defaultValue;
  }

  /**
   * ✅ PHASE 6: Mode-aware external dependency reader for Target/Reference pairs
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

  /**
   * Helper function to set a calculated value in the StateManager and update the DOM.
   * STANDARD MODE-AWARE PATTERN
   * This function writes to the correct state and only updates the global (unprefixed)
   * state when in 'target' mode to prevent state contamination.
   */
  function setFieldValue(fieldId, value, fieldType = "calculated") {
    // ✅ PATTERN A: EXPLICIT STATE ACCESS - Store in current state object
    const currentState =
      ModeManager.currentMode === "target" ? TargetState : ReferenceState;
    currentState.setValue(fieldId, value, fieldType);

    // Store in StateManager for cross-section communication
    if (ModeManager.currentMode === "target") {
      // Target mode: Store unprefixed for DOM binding and downstream consumption
      if (window.TEUI?.StateManager) {
        window.TEUI.StateManager.setValue(fieldId, value.toString(), fieldType);
      }
    } else {
      // Reference mode: Store with ref_ prefix for downstream consumption
      if (window.TEUI?.StateManager) {
        window.TEUI.StateManager.setValue(
          `ref_${fieldId}`,
          value.toString(),
          fieldType,
        );
      }
    }

    // ❌ ANTI-PATTERN REMOVED: Direct DOM write from a calculation helper has been eliminated.
    // The `ModeManager.updateCalculatedDisplayValues()` function is now solely responsible
    // for reading from StateManager and updating the UI, ensuring a single source of truth.
  }

  /**
   * Register calculations with StateManager
   * This is the standard approach from other working sections
   */
  function registerCalculations() {
    if (!window.TEUI || !window.TEUI.StateManager) {
      return;
    }

    try {
      // Register dependencies - these must be registered AFTER the calculation
      window.TEUI.StateManager.registerDependency("d_15", "d_16"); // d_16 depends on the standard selected
      window.TEUI.StateManager.registerDependency("i_41", "d_16"); // d_16 depends on i_41 when standard is 'Self Reported' or default
      window.TEUI.StateManager.registerDependency("i_39", "d_16"); // d_16 depends on i_39 when standard is 'TGS4'
    } catch (_error) {
      // console.warn("Error registering calculations:", _error);
    }
  }

  //==========================================================================
  // DUAL-ENGINE ARCHITECTURE
  //==========================================================================

  /**
   * Inject Target/Reference toggle controls into section header
   * Standard Pattern A implementation
   */
  function injectHeaderControls() {
    const sectionHeader = document.querySelector(
      "#buildingInfo .section-header",
    );
    if (
      !sectionHeader ||
      sectionHeader.querySelector(".local-controls-container")
    ) {
      return; // Already setup or header not found
    }

    // Create controls container
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "local-controls-container";
    controlsContainer.style.cssText =
      "display: flex; align-items: center; gap: 10px; margin-left: auto;";

    // Create Reset button
    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset";
    resetButton.style.cssText =
      "padding: 4px 8px; font-size: 12px; border: 1px solid #ccc; background: white; cursor: pointer; border-radius: 3px;";
    resetButton.addEventListener("click", (event) => {
      event.stopPropagation();
      if (confirm("Reset all values to defaults?")) {
        TargetState.setDefaults();
        ReferenceState.setDefaults();
        ModeManager.refreshUI();
        console.log("S02: Reset to defaults");
      }
    });

    // Create state indicator
    const stateIndicator = document.createElement("div");
    stateIndicator.textContent = "TARGET";
    stateIndicator.style.cssText =
      "padding: 4px 8px; font-size: 12px; font-weight: bold; color: white; background-color: rgba(0, 123, 255, 0.5); border-radius: 3px;";

    // Create toggle switch
    const toggleSwitch = document.createElement("div");
    toggleSwitch.style.cssText =
      "position: relative; width: 40px; height: 20px; background-color: #ccc; border-radius: 10px; cursor: pointer;";

    const slider = document.createElement("div");
    slider.style.cssText =
      "position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background-color: white; border-radius: 50%; transition: transform 0.2s;";

    toggleSwitch.appendChild(slider);

    // Toggle Switch Click Handler
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

    // Assemble controls
    controlsContainer.appendChild(resetButton);
    controlsContainer.appendChild(stateIndicator);
    controlsContainer.appendChild(toggleSwitch);
    sectionHeader.appendChild(controlsContainer);

    console.log("✅ S02: Header controls injected successfully");
  }

  /**
   * REFERENCE MODEL ENGINE: Calculate all values using Reference state.
   * STANDARD MODE-AWARE PATTERN.
   * Stores results with ref_ prefix to keep separate from Target values.
   */
  function calculateReferenceModel() {
    const originalMode = ModeManager.currentMode;
    ModeManager.currentMode = "reference"; // Directly set mode without triggering switchMode

    try {
      // ✅ CRITICAL FIX: Read from sovereign ReferenceState, not global StateManager with prefixes
      const carbonStandard = ReferenceState.getValue("d_15") || "Self Reported";

      // ✅ PHASE 6: Use mode-aware reading for external dependencies
      const modelledValueI41 =
        window.TEUI?.parseNumeric?.(getModeAwareGlobalValue("i_41"), 345.82) ??
        345.82;

      if (carbonStandard === "Not Reported") {
        setFieldValue("d_16", "N/A", "calculated");
        return;
      }

      if (carbonStandard === "TGS4") {
        const tgs4Value =
          window.TEUI?.parseNumeric?.(getModeAwareGlobalValue("i_39"), 0) ?? 0;
        setFieldValue("d_16", tgs4Value, "calculated");
        return;
      }

      const AR6_EPC_K5 = 3.39;
      const AR6_EA_L5 = 0.17;

      let targetValue;
      switch (carbonStandard) {
        case "BR18 (Denmark)":
          targetValue = 500;
          break;
        case "IPCC AR6 EPC":
          targetValue = AR6_EPC_K5;
          break;
        case "IPCC AR6 EA":
          targetValue = AR6_EA_L5;
          break;
        case "CaGBC ZCB D":
          targetValue = 425;
          break;
        case "CaGBC ZCB P":
          targetValue = 425;
          break;
        case "Self Reported":
          targetValue = modelledValueI41;
          break;
        default:
          targetValue = modelledValueI41;
      }
      setFieldValue("d_16", targetValue, "calculated");

      // Store Reference results for downstream sections
      storeReferenceResults();
    } catch (error) {
      console.error(
        "[Section02] Error in Reference Model calculations:",
        error,
      );
    } finally {
      ModeManager.currentMode = originalMode; // Restore original mode directly
    }
  }

  /**
   * Store Reference calculation results with ref_ prefix for downstream sections
   *
   * ✅ FIX (Oct 4, 2025): Only publish CALCULATED outputs, NOT input fields
   * INPUT fields (h_15, d_13, l_12, etc.) are managed by:
   * - User input → StateManager.setValue("ref_h_15", value, "user-modified")
   * - Import → StateManager.setValue("ref_h_15", value, "imported")
   * - ReferenceValues → StateManager.setValue("ref_f_85", value, "over-ridden")
   *
   * Section calculations should ONLY publish calculated outputs!
   */
  function storeReferenceResults() {
    if (!window.TEUI?.StateManager) return;

    // ✅ ONLY publish CALCULATED outputs from Reference model calculations
    const referenceResults = {
      d_16: ReferenceState.getValue("d_16"), // Carbon target (CALCULATED) ✅
      // ❌ REMOVED INPUT FIELDS - they are NOT calculated by S02:
      // h_12, h_13, d_12, d_13, d_14, d_15, h_15, l_12, l_13, l_14, l_15, l_16
      // These INPUT fields are set via user input, import, or ReferenceValues overlay
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
      "[S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)",
    );
  }

  /**
   * TARGET MODEL ENGINE: Calculate all values using Application state.
   * STANDARD MODE-AWARE PATTERN.
   */
  function calculateTargetModel() {
    const originalMode = ModeManager.currentMode;
    ModeManager.currentMode = "target"; // Directly set mode without triggering switchMode

    try {
      // ✅ CRITICAL FIX: Read from sovereign TargetState, not global StateManager
      const carbonStandard = TargetState.getValue("d_15") || "Self Reported";

      // ✅ PHASE 6: Use mode-aware reading for external dependencies
      const modelledValueI41 =
        window.TEUI?.parseNumeric?.(getModeAwareGlobalValue("i_41"), 345.82) ??
        345.82;

      if (carbonStandard === "Not Reported") {
        setFieldValue("d_16", "N/A", "calculated");
        return;
      }

      if (carbonStandard === "TGS4") {
        const tgs4Value =
          window.TEUI?.parseNumeric?.(getModeAwareGlobalValue("i_39"), 0) ?? 0;
        setFieldValue("d_16", tgs4Value, "calculated");
        return;
      }

      const AR6_EPC_K5 = 3.39;
      const AR6_EA_L5 = 0.17;

      let targetValue;
      switch (carbonStandard) {
        case "BR18 (Denmark)":
          targetValue = 500;
          break;
        case "IPCC AR6 EPC":
          targetValue = AR6_EPC_K5;
          break;
        case "IPCC AR6 EA":
          targetValue = AR6_EA_L5;
          break;
        case "CaGBC ZCB D":
          targetValue = 425;
          break;
        case "CaGBC ZCB P":
          targetValue = 425;
          break;
        case "Self Reported":
          targetValue = modelledValueI41;
          break;
        default:
          targetValue = modelledValueI41;
      }

      // Since mode is 'target', this will update `target_d_16` AND the global `d_16` for the DOM.
      setFieldValue("d_16", targetValue, "calculated");
    } catch (error) {
      console.error("[Section02] Error in Target Model calculations:", error);
    } finally {
      ModeManager.currentMode = originalMode; // Restore original mode directly
    }
  }

  /**
   * DUAL-ENGINE ORCHESTRATION
   * Replaces the original calculateAll function
   */
  function calculateAll() {
    if (!isSect02Initialized) {
      console.warn(
        "[S02] calculateAll() called before initialization completed. Aborting to prevent race condition.",
      );
      return;
    }
    calculateReferenceModel();
    calculateTargetModel();
  }

  /**
   * Setup Carbon Standard dropdown event handler
   * Follows the dropdown handler pattern from the framework
   */
  function setupCarbonStandardDropdown() {
    const dropdown = document.querySelector(
      'select[data-dropdown-id="dd_d_15"], select[data-field-id="d_15"]',
    );
    if (!dropdown) return;

    // Remove any existing handlers to avoid duplicates
    dropdown.removeEventListener("change", handleCarbonStandardChange);

    // Add the event listener
    dropdown.addEventListener("change", handleCarbonStandardChange);
  }

  /**
   * Handle Carbon Standard dropdown change
   * ✅ PATTERN A: Use ModeManager.setValue() to save to current state
   */
  function handleCarbonStandardChange(e) {
    const selectedValue = e.target.value;
    const fieldId = e.target.getAttribute("data-field-id") || "d_15";

    if (e.isTrusted) {
      window.TEUI.sect02.userInteracted = true;
    }

    // ✅ PATTERN A: Save to current state (Target or Reference) via ModeManager
    ModeManager.setValue(fieldId, selectedValue, "user-modified");

    // Recalculate all values
    calculateAll();
    // Update DOM with new calculated values
    ModeManager.updateCalculatedDisplayValues();
  }

  /**
   * Handle Major Occupancy dropdown change (d_12)
   * Saves to current state (Target or Reference) via ModeManager
   */
  function handleMajorOccupancyChange(e) {
    const selectedValue = e.target.value;
    const fieldId = e.target.getAttribute("data-field-id") || "d_12";

    if (e.isTrusted) {
      window.TEUI.sect02.userInteracted = true;
    }

    // ✅ CRITICAL FIX: Save to current state (Target or Reference) via ModeManager
    // This ensures user changes persist when toggling between modes
    ModeManager.setValue(fieldId, selectedValue, "user-modified");

    // Recalculate all values after occupancy change
    calculateAll();
    // Update DOM with new calculated values
    ModeManager.updateCalculatedDisplayValues();
  }

  /**
   * Handle Actual/Target Use dropdown change (d_14)
   * Saves to current state (Target or Reference) via ModeManager
   */
  function handleActualTargetChange(e) {
    const selectedValue = e.target.value;
    const fieldId = e.target.getAttribute("data-field-id") || "d_14";

    if (e.isTrusted) {
      window.TEUI.sect02.userInteracted = true;
    }

    // ✅ CRITICAL FIX: Save to current state (Target or Reference) via ModeManager
    // This ensures user changes persist when toggling between modes
    ModeManager.setValue(fieldId, selectedValue, "user-modified");

    // Recalculate all values after use type change
    calculateAll();
    // Update DOM with new calculated values
    ModeManager.updateCalculatedDisplayValues();
  }

  /**
   * Handle Building Code dropdown change (d_13)
   * Saves to current state (Target or Reference) via ModeManager
   */
  function handleBuildingCodeChange(e) {
    const selectedValue = e.target.value;
    const fieldId = e.target.getAttribute("data-field-id") || "d_13";

    if (e.isTrusted) {
      window.TEUI.sect02.userInteracted = true;
    }

    // ✅ CRITICAL FIX: Save to current state (Target or Reference) via ModeManager
    // This ensures user changes persist when toggling between modes
    ModeManager.setValue(fieldId, selectedValue, "user-modified");

    // Recalculate all values after building code change
    calculateAll();
    // Update DOM with new calculated values
    ModeManager.updateCalculatedDisplayValues();
  }

  /**
   * Initialize event handlers for this section
   */
  function initializeEventHandlers() {
    // Register calculations with StateManager
    registerCalculations();

    // Set up dropdown handlers using event delegation on the section container
    const sectionElement = document.getElementById("buildingInfo");
    if (sectionElement) {
      sectionElement.removeEventListener("change", handleSectionDropdownChange);
      sectionElement.addEventListener("change", handleSectionDropdownChange);
    }

    // Set initial values on dropdown if not already set
    if (!window.TEUI.sect02.initialized) {
      const dropdown = document.querySelector(
        'select[data-dropdown-id="dd_d_15"], select[data-field-id="d_15"]',
      );
      if (dropdown && window.TEUI?.StateManager) {
        const currentValue = window.TEUI.StateManager.getValue("d_15");
        if (!currentValue) {
          window.TEUI.StateManager.setValue("d_15", dropdown.value, "default");
        }
      }
      window.TEUI.sect02.initialized = true;
    }

    // ✅ RACE CONDITION FIX: Area initialization moved to onSectionRendered() after init flag

    // Area field blur event
    const areaField = document.querySelector('[data-field-id="h_15"]');
    if (areaField) {
      areaField.addEventListener("blur", updateAreaValue);
      areaField.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          this.blur();
        }
      });
    }

    // Area adjustment slider events
    const areaSlider = document.querySelector('[data-field-id="i_15_slider"]');
    if (areaSlider) {
      areaSlider.addEventListener("input", handleAreaSliderInput);
      areaSlider.addEventListener("change", handleAreaSliderChange);
    }

    // ✅ PATTERN A: Year slider events (h_12 - reporting year)
    const yearSlider = document.querySelector('input[data-field-id="h_12"]');
    if (yearSlider) {
      yearSlider.addEventListener("input", function (e) {
        const newYear = e.target.value;
        // Update display label
        const yearDisplay = this.nextElementSibling;
        if (yearDisplay) {
          yearDisplay.textContent = newYear;
        }
      });

      yearSlider.addEventListener("change", function (e) {
        const newYear = e.target.value;
        // ✅ PATTERN A: Save to current state (Target or Reference) via ModeManager
        ModeManager.setValue("h_12", newYear, "user-modified");

        // ✅ CRITICAL FIX: Only store Reference result for h_12 - do NOT trigger full recalculation
        // h_12 (reporting year) should NOT affect h_15 (area) or any S02 internal calculations
        if (ModeManager.currentMode === "reference") {
          // Only store the h_12 value for downstream sections (S04 needs ref_h_12 for emissions factors)
          storeReferenceResults();
        }
        // No calculateAll() or updateCalculatedDisplayValues() needed - h_12 doesn't affect S02 calculations
      });
    }

    // ✅ CRITICAL FIX: Service life slider events (h_13)
    const serviceLifeSlider = document.querySelector(
      'input[data-field-id="h_13"]',
    );
    if (serviceLifeSlider) {
      serviceLifeSlider.addEventListener("input", function (e) {
        const newServiceLife = e.target.value;
        // Update display label
        const serviceLifeDisplay = this.nextElementSibling;
        if (serviceLifeDisplay) {
          serviceLifeDisplay.textContent = newServiceLife;
        }
      });

      serviceLifeSlider.addEventListener("change", function (e) {
        const newServiceLife = e.target.value;
        // ✅ PATTERN A: Save to current state (Target or Reference) via ModeManager
        ModeManager.setValue("h_13", newServiceLife, "user-modified");

        // ✅ CRITICAL FIX: Only store Reference result for h_13 - do NOT trigger full recalculation
        // h_13 (service life) affects S01 calculations but NOT S02 internal calculations
        if (ModeManager.currentMode === "reference") {
          // Store the h_13 value for downstream sections (S01 needs ref_h_13 for lifetime carbon)
          storeReferenceResults();
        }
        // No calculateAll() or updateCalculatedDisplayValues() needed - h_13 doesn't affect S02 calculations
      });
    }

    // Add listener for changes from external sections (e.g., Section 5)
    if (window.TEUI && window.TEUI.StateManager) {
      // Create wrapper function that properly updates DOM after calculations
      const calculateAndRefresh = () => {
        calculateAll();
        ModeManager.updateCalculatedDisplayValues();
      };

      // When these external dependencies change, recalculate everything in this section.
      window.TEUI.StateManager.addListener("i_39", calculateAndRefresh);
      window.TEUI.StateManager.addListener("ref_i_39", calculateAndRefresh);
      window.TEUI.StateManager.addListener("i_41", calculateAndRefresh);
      window.TEUI.StateManager.addListener("ref_i_41", calculateAndRefresh);

      // Add listeners for occupancy changes to update critical flag
      window.TEUI.StateManager.addListener("d_12", updateCriticalOccupancyFlag);
      window.TEUI.StateManager.addListener(
        "ref_d_12",
        updateCriticalOccupancyFlag,
      );
    }
  }

  /**
   * Handle dropdown changes via event delegation
   */
  function handleSectionDropdownChange(e) {
    if (e.target.tagName !== "SELECT") return;

    const fieldId = e.target.getAttribute("data-field-id");
    if (!fieldId) return;

    switch (fieldId) {
      case "d_12":
        handleMajorOccupancyChange(e);
        break;
      case "d_13":
        handleBuildingCodeChange(e);
        break;
      case "d_14":
        handleActualTargetChange(e);
        break;
      case "d_15":
        handleCarbonStandardChange(e);
        break;
    }
  }

  /**
   * Update the critical occupancy flag display in Section 2 header
   */
  function updateCriticalOccupancyFlag() {
    // ✅ PHASE 6 FIX: Eliminate fallback contamination pattern (same fix as S15 m_43)
    // Reference calculations must ONLY read ref_ prefixed values for perfect state isolation
    const occupancyType =
      ModeManager.currentMode === "reference"
        ? window.TEUI.StateManager?.getValue("ref_d_12") || "" // ✅ FIXED: No fallback to Target values
        : window.TEUI.StateManager?.getValue("d_12") || "";
    const sectionHeader = document.querySelector(
      "#buildingInfo .section-header",
    ); // Target the Section 2 header
    if (!sectionHeader) {
      console.warn("Section 2 header not found for critical flag.");
      return false;
    }

    let flagSpan = sectionHeader.querySelector(
      ".critical-occupancy-header-flag",
    );
    let isCritical = occupancyType.includes("Care");

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
        if (sectionTitleText.includes("SECTION 2. Building Information")) {
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
      // If not critical, remove the span if it exists
      flagSpan?.remove();
    }

    return isCritical; // Return the status for other functions
  }

  /**
   * Called when section is rendered
   * Standard implementation from SectionXX template
   */
  function onSectionRendered() {
    // Initialize Pattern A Dual-State Module
    ModeManager.initialize();

    // Inject header controls for Target/Reference toggle
    injectHeaderControls();

    // ✅ PATTERN A: Defaults are now handled by TargetState.setDefaults() and ReferenceState.setDefaults()
    // No need to set defaults in StateManager - the dual-state architecture handles this

    isSect02Initialized = true; // ✅ RACE CONDITION FIX: Set flag BEFORE external listeners

    // ✅ RACE CONDITION FIX: Initialize event handlers AFTER initialization flag is set
    // This prevents external listeners from triggering calculateAll() before we're ready
    initializeEventHandlers();

    // ✅ RACE CONDITION FIX: Initialize area field AFTER initialization is complete
    // This prevents updateAreaValue() from calling calculateAll() before we're ready
    ensureAreaValueIsSet();

    // Run initial calculations
    calculateAll();
    // Update DOM with initial calculated values
    ModeManager.updateCalculatedDisplayValues();

    // ✅ PATTERN A: ModeManager.refreshUI() already handles cost field formatting
    // No need for separate syncCostFieldDisplays() - it conflicts with dual-state values
    ModeManager.refreshUI();

    // Initialize critical occupancy flag
    updateCriticalOccupancyFlag();

    // Apply validation tooltips to fields
    if (window.TEUI.TooltipManager && window.TEUI.TooltipManager.initialized) {
      // Wait a short moment for DOM to fully settle, then apply tooltips
      setTimeout(() => {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }
  }

  /**
   * Update the StateManager value for h_15 when conditioned area changes
   */
  function ensureAreaValueIsSet() {
    // Find the conditioned area field
    const areaField = document.querySelector('[data-field-id="h_15"]');
    if (!areaField) {
      return;
    }

    // Make sure it's editable
    if (!areaField.hasAttribute("contenteditable")) {
      areaField.setAttribute("contenteditable", "true");
      areaField.classList.add("user-input", "editable");

      // Add event listeners for editing
      areaField.addEventListener("focus", function () {
        this.classList.add("editing");
        // Store original value to detect changes
        this.dataset.originalValue = this.textContent.trim();
      });

      areaField.addEventListener("blur", function () {
        this.classList.remove("editing");
        updateAreaValue();
      });

      // Handle Enter key
      areaField.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault(); // Prevent adding a newline
          this.blur(); // Remove focus to trigger the blur event
        }
      });
    }

    // Get current value and update StateManager
    updateAreaValue();

    // Ensure all editable fields in this section use proper classes
    ensureAllFieldsUseProperStyling();
  }

  /**
   * Ensure all editable fields in the section use the proper classes
   */
  function ensureAllFieldsUseProperStyling() {
    // Fields that should be user editable
    const userInputFields = [
      "h_14", // Project Name
      "h_15", // Conditioned Area
      "i_16", // Certifier
      "i_17", // License No
      "l_12", // Electricity cost
      "l_13", // Gas cost
      "l_14", // Propane cost
      "l_15", // Wood cost
      "l_16", // Oil cost
    ];

    // Apply proper classes to all user input fields
    userInputFields.forEach((fieldId) => {
      const field = document.querySelector(`[data-field-id="${fieldId}"]`);
      if (field) {
        // Make sure it's properly styled and editable
        field.setAttribute("contenteditable", "true");
        field.classList.add("user-input", "editable");

        // Remove any existing inline styles
        field.removeAttribute("style");

        // Set up event listeners if not already present
        if (!field.hasEventListener) {
          field.addEventListener("focus", function () {
            this.classList.add("editing");
            this.dataset.originalValue = this.textContent.trim();
          });

          field.addEventListener("blur", function () {
            this.classList.remove("editing");

            let valueToSave = this.textContent.trim();

            // ✅ CSV EXPORT FIX: Strip currency formatting before saving to preserve full precision
            // Cost fields (l_12-l_16) are formatted for display but must be stored as numeric strings
            if (["l_12", "l_13", "l_14", "l_15", "l_16"].includes(fieldId)) {
              // Remove currency symbols and commas: "$1,234.5678" → "1234.5678"
              valueToSave = valueToSave.replace(/[$,]/g, "");
              // Ensure it's a valid number, keep full precision
              const parsed = parseFloat(valueToSave);
              if (!isNaN(parsed)) {
                valueToSave = parsed.toString(); // Preserve full precision as string
              }
            }

            // ✅ CRITICAL FIX: Save to current state (Target or Reference) via ModeManager
            // ModeManager.setValue handles mode-aware publishing to StateManager
            ModeManager.setValue(fieldId, valueToSave, "user-modified");
          });

          field.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
              e.preventDefault();
              this.blur();
            }
          });

          field.hasEventListener = true;
        }
      }
    });

    // Fields that should be derived values
    const derivedFields = [
      "d_16", // Embodied Carbon Target
    ];

    // Apply proper classes to derived fields
    derivedFields.forEach((fieldId) => {
      const field = document.querySelector(`[data-field-id="${fieldId}"]`);
      if (field) {
        // Remove editable attributes
        field.removeAttribute("contenteditable");
        field.classList.remove("user-input", "editable");
        field.classList.add("derived-value");

        // Remove any existing inline styles
        field.removeAttribute("style");
      }
    });
  }

  /**
   * Update area value in StateManager and trigger a full recalculation.
   * This is the correct pattern for a global input.
   */
  function updateAreaValue() {
    const areaField = document.querySelector('[data-field-id="h_15"]');
    if (!areaField) return;

    const areaValue =
      window.TEUI?.parseNumeric?.(areaField.textContent, 0) ?? 0;

    if (!isNaN(areaValue) && areaValue > 0) {
      // ✅ PATTERN A: Save to current state (Target or Reference) via ModeManager
      ModeManager.setValue("h_15", areaValue.toString(), "user-modified");

      // ✅ RACE CONDITION FIX: Let StateManager listeners handle the calculation cascade
      // S04 and S09 have h_15/ref_h_15 listeners that will trigger their calculateAll()
      // S02 doesn't need to call calculateAll() - it just publishes the area change
      console.log(
        `[S02] Area updated to ${areaValue} - letting downstream sections handle calculations`,
      );
    }
  }

  /**
   * Handle Area Slider input (live updates while dragging)
   */
  function handleAreaSliderInput(event) {
    const areaField = document.querySelector('[data-field-id="h_15"]');
    const slider = event.target;

    if (!areaField || !slider) return;

    try {
      // ✅ CRITICAL FIX: Get original area value from current mode's state for maximum reliability
      const originalAreaStr =
        ModeManager.getValue("h_15") ||
        slider.dataset.originalArea ||
        areaField.dataset.originalValue ||
        areaField.textContent.trim() ||
        "1427.20"; // Fallback to field definition default

      let originalArea = window.TEUI?.parseNumeric?.(originalAreaStr, 0) ?? 0;

      // Get adjustment value from slider's current position
      const adjustment = parseFloat(slider.value);
      if (isNaN(adjustment)) return;

      // Calculate potential new area
      let newArea = Math.max(10, originalArea + adjustment);

      // Update the text field display ONLY (formatted using global helper)
      areaField.textContent =
        window.TEUI?.formatNumber?.(newArea, "number-2dp-comma") ??
        newArea.toString();

      // Store the original value if it's not already stored for the 'change' event
      if (!slider.dataset.originalArea) {
        slider.dataset.originalArea = originalAreaStr;
      }
    } catch (_error) {
      // console.warn("Error handling area slider input:", _error);
    }
  }

  /**
   * Handle Area Slider change (final value on release)
   */
  function handleAreaSliderChange(event) {
    const areaField = document.querySelector('[data-field-id="h_15"]');
    const slider = event.target;

    if (!areaField || !slider) return;

    try {
      // Get current area value using global helper
      const currentAreaText = areaField.textContent.trim();
      let currentArea = window.TEUI?.parseNumeric?.(currentAreaText, 0) ?? 0;

      if (currentArea === 0) {
        // ✅ CRITICAL FIX: Try getting from current mode's state as a fallback
        const stateArea = ModeManager.getValue("h_15") || "1427.20"; // Fallback to field definition default
        currentArea = window.TEUI?.parseNumeric?.(stateArea, 0) ?? 0;
      }

      // Get adjustment value from slider's FINAL position
      const adjustment = parseFloat(slider.value);
      if (isNaN(adjustment)) return;

      // Calculate new area, ensuring it doesn't go below a minimum (e.g., 10)
      let newArea = Math.max(10, currentArea + adjustment);

      // Update the text field display using global helper
      areaField.textContent =
        window.TEUI?.formatNumber?.(newArea, "number-2dp-comma") ??
        newArea.toString();

      // Mark this as a user interaction
      window.TEUI.sect02.userInteracted = true;

      // ✅ PATTERN A: Save to current state (Target or Reference) via ModeManager
      ModeManager.setValue("h_15", newArea.toString(), "user-modified");

      // Reset the slider value back to 0 after applying the adjustment
      slider.value = 0;

      // Clear the stored original area value
      delete slider.dataset.originalArea;
    } catch (_error) {
      // console.warn("Error handling area slider change:", _error);
    }
  }

  /**
   * Sync cost field displays with proper CAD formatting
   * Uses global window.TEUI.formatNumber with correct CAD format types
   * Only formats fields that have been modified or have valid numeric values
   */
  function syncCostFieldDisplays() {
    const costFields = ["l_12", "l_13", "l_14", "l_15", "l_16"];
    costFields.forEach((fieldId) => {
      const element = document.querySelector(`[data-field-id="${fieldId}"]`);
      if (element) {
        // Get the current displayed value
        const currentDisplayValue = element.textContent.trim();

        // Only reformat if the field has been modified by user or has a non-default value
        const stateManagerValue =
          window.TEUI?.StateManager?.getValue?.(fieldId);

        // Skip formatting if:
        // 1. No value in StateManager (field hasn't been initialized)
        // 2. Current display already looks like a properly formatted currency
        if (!stateManagerValue || currentDisplayValue.startsWith("$")) {
          // Check if we need to ensure the field is properly set in StateManager
          if (!stateManagerValue && currentDisplayValue.startsWith("$")) {
            // Extract numeric value from the displayed currency and store it
            const numericValue = window.TEUI?.parseNumeric?.(
              currentDisplayValue,
              0,
            );
            if (numericValue > 0 && window.TEUI?.StateManager) {
              window.TEUI.StateManager.setValue(
                fieldId,
                numericValue.toString(),
                "default",
              );
            }
          }
          return; // Skip reformatting
        }

        // Only format if we have a valid numeric value from StateManager
        const rawValue = window.TEUI?.parseNumeric?.(stateManagerValue, 0);
        if (rawValue > 0) {
          // Apply specific CAD formatting based on field ID
          const formatType = fieldId === "l_15" ? "cad-2dp" : "cad-4dp"; // Wood uses 2dp, others use 4dp
          const formattedValue =
            window.TEUI?.formatNumber?.(rawValue, formatType) ??
            rawValue.toString();
          element.textContent = formattedValue;
        }
      }
    });
  }

  //==========================================================================
  // DUAL-STATE MODE MANAGEMENT
  //==========================================================================

  /**
   * TargetState: Manages Target (user's design) state with persistence
   */
  const TargetState = {
    data: {},
    storageKey: "S02_TARGET_STATE",

    loadState: function () {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const savedData = JSON.parse(saved);
          // ✅ CRITICAL FIX: Merge saved data with defaults, don't replace defaults
          this.data = { ...this.data, ...savedData };
          console.log(`S02: Loaded and merged Target state from localStorage`);
        }
      } catch (error) {
        console.warn(`S02: Error loading Target state:`, error);
        // ✅ CRITICAL FIX: Don't wipe defaults on error, keep existing defaults
        console.log(`S02: Keeping Target defaults due to localStorage error`);
      }
    },

    saveState: function () {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        // console.log(`S02: Saved Target state to localStorage`);
      } catch (error) {
        console.warn(`S02: Error saving Target state:`, error);
      }
    },

    getValue: function (fieldId) {
      return this.data[fieldId] || "";
    },

    setValue: function (fieldId, value, source = "calculated") {
      this.data[fieldId] = value;
      if (source === "user" || source === "user-modified") {
        this.saveState();
      }
    },

    setDefaults: function () {
      // ✅ ANTI-PATTERN FIX: Field definitions are single source of truth - no hardcoded fallbacks
      this.data = {
        d_12: getFieldDefault("d_12"),
        d_13: getFieldDefault("d_13"),
        d_14: getFieldDefault("d_14"),
        d_15: getFieldDefault("d_15"),
        h_12: getFieldDefault("h_12"),
        h_13: getFieldDefault("h_13"),
        h_14: getFieldDefault("h_14"),
        h_15: getFieldDefault("h_15"), // No fallback - field definition is source of truth
        i_16: getFieldDefault("i_16"),
        i_17: getFieldDefault("i_17"),
        l_12: getFieldDefault("l_12"),
        l_13: getFieldDefault("l_13"),
        l_14: getFieldDefault("l_14"),
        l_15: getFieldDefault("l_15"),
        l_16: getFieldDefault("l_16"),
      };
      console.log(
        `S02: Target defaults set from field definitions - single source of truth`,
      );
    },

    /**
     * ✅ PHASE 2: Sync from global StateManager after import
     * Bridges global StateManager → isolated TargetState for imported values
     */
    syncFromGlobalState: function (
      fieldIds = [
        "d_12",
        "d_13",
        "d_14",
        "d_15",
        "h_12",
        "h_13",
        "h_14",
        "h_15",
        "i_16",
        "i_17",
        "l_12",
        "l_13",
        "l_14",
        "l_15",
        "l_16",
      ],
    ) {
      fieldIds.forEach((fieldId) => {
        const globalValue = window.TEUI.StateManager.getValue(fieldId);
        if (globalValue !== null && globalValue !== undefined) {
          this.setValue(fieldId, globalValue, "imported");
          console.log(
            `S02 TargetState: Synced ${fieldId} = ${globalValue} from global StateManager`,
          );
        }
      });
    },
  };

  /**
   * ReferenceState: Manages Reference (building code minimums) state with persistence
   */
  const ReferenceState = {
    data: {},
    storageKey: "S02_REFERENCE_STATE",

    loadState: function () {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const savedData = JSON.parse(saved);
          // ✅ CRITICAL FIX: Merge saved data with defaults, don't replace defaults
          this.data = { ...this.data, ...savedData };
          console.log(
            `S02: Loaded and merged Reference state from localStorage`,
          );
        }
      } catch (error) {
        console.warn(`S02: Error loading Reference state:`, error);
        // ✅ CRITICAL FIX: Don't wipe defaults on error, keep existing defaults
        console.log(
          `S02: Keeping Reference defaults due to localStorage error`,
        );
      }
    },

    saveState: function () {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        // console.log(`S02: Saved Reference state to localStorage`);
      } catch (error) {
        console.warn(`S02: Error saving Reference state:`, error);
      }
    },

    getValue: function (fieldId) {
      return this.data[fieldId] || "";
    },

    setValue: function (fieldId, value, source = "calculated") {
      this.data[fieldId] = value;
      if (source === "user" || source === "user-modified") {
        this.saveState();
      }
    },

    setDefaults: function () {
      // ✅ ANTI-PATTERN FIX: Field definitions are single source of truth - no hardcoded fallbacks
      this.data = {
        // 1. Initialize with base defaults from field definitions only
        d_12: getFieldDefault("d_12"),
        d_14: getFieldDefault("d_14"),
        d_15: getFieldDefault("d_15"),
        h_13: getFieldDefault("h_13"),
        h_14: getFieldDefault("h_14"),
        h_15: getFieldDefault("h_15"), // No fallback - field definition is source of truth
        i_16: getFieldDefault("i_16"),
        i_17: getFieldDefault("i_17"),
        l_12: getFieldDefault("l_12"),
        l_13: getFieldDefault("l_13"),
        l_14: getFieldDefault("l_14"),
        l_15: getFieldDefault("l_15"),
        l_16: getFieldDefault("l_16"),

        // 2. Apply Reference State overrides (mode-specific values only)
        d_13: getFieldDefault("d_13"), // Same standard as Target for S02
        h_12: getFieldDefault("h_12"), // Same reporting period as Target for S02
      };
      console.log(
        `S02: Reference defaults set from field definitions - single source of truth with mode overrides`,
      );
    },

    /**
     * ✅ PHASE 2: Sync from global StateManager after import
     * Bridges global StateManager → isolated ReferenceState for imported values
     */
    syncFromGlobalState: function (
      fieldIds = [
        "d_12",
        "d_13",
        "d_14",
        "d_15",
        "h_12",
        "h_13",
        "h_14",
        "h_15",
        "i_16",
        "i_17",
        "l_12",
        "l_13",
        "l_14",
        "l_15",
        "l_16",
      ],
    ) {
      fieldIds.forEach((fieldId) => {
        const refFieldId = `ref_${fieldId}`;
        const globalValue = window.TEUI.StateManager.getValue(refFieldId);
        if (globalValue !== null && globalValue !== undefined) {
          this.setValue(fieldId, globalValue, "imported");
          console.log(
            `S02 ReferenceState: Synced ${fieldId} = ${globalValue} from global StateManager (ref_${fieldId})`,
          );
        }
      });
    },
  };

  const ModeManager = {
    currentMode: "target", // "target" or "reference"

    // Initialize the mode manager
    initialize: function () {
      // Properly initialize both Target and Reference states
      try {
        TargetState.setDefaults();
        TargetState.loadState();
        ReferenceState.setDefaults();
        ReferenceState.loadState();

        // ✅ CSV EXPORT FIX: Publish ALL Reference defaults to StateManager
        // Without this, CSV export shows empty Reference values (89 out of 126 missing)
        // FileHandler.exportToCSV() reads from StateManager, not from internal ReferenceState
        // Pattern: Conditionally publish if value doesn't exist (import-safe, non-destructive)
        if (window.TEUI?.StateManager) {
          ["d_12", "d_13", "d_14", "d_15", "h_12", "h_13", "h_14", "h_15",
           "i_16", "i_17", "l_12", "l_13", "l_14", "l_15", "l_16"].forEach(id => {
            const refId = `ref_${id}`;
            const val = ReferenceState.getValue(id);
            if (!window.TEUI.StateManager.getValue(refId) && val != null && val !== "") {
              window.TEUI.StateManager.setValue(refId, val, "calculated");
            }
          });
        }
      } catch (e) {
        console.warn("[S02] initialize: state initialization error", e);
      }
    },

    // Switch between Target and Reference modes with UI refresh only
    switchMode: function (mode) {
      if (mode !== "target" && mode !== "reference") {
        console.warn(`[S02] Invalid mode: ${mode}`);
        return;
      }
      this.currentMode = mode;
      console.log(`[S02] Switched to ${mode.toUpperCase()} mode`);

      // ✅ CRITICAL FIX: UI toggle is for DISPLAY ONLY - values are already calculated
      this.refreshUI(); // Update input fields from state
      this.updateCalculatedDisplayValues(); // Update calculated fields from StateManager

      // ✅ CRITICAL FIX: Update critical occupancy flag when mode changes
      updateCriticalOccupancyFlag();

      // ❌ REMOVED: calculateAll() - this is a UI action, not a data change
    },

    getValue: function (fieldId) {
      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;
      return currentState.getValue(fieldId);
    },

    setValue: function (fieldId, value, source = "calculated") {
      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;
      currentState.setValue(fieldId, value, source);

      // ✅ CRITICAL BRIDGE: Sync Target changes to StateManager for downstream sections
      if (this.currentMode === "target" && window.TEUI?.StateManager) {
        window.TEUI.StateManager.setValue(fieldId, value, source);
      }

      // ✅ CRITICAL BRIDGE: Sync Reference changes to StateManager with ref_ prefix
      if (this.currentMode === "reference" && window.TEUI?.StateManager) {
        window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, source);
      }
    },

    // Update UI input fields based on current mode's state (✅ S03 Pattern)
    refreshUI: function () {
      console.log(
        `[S02] Refreshing UI for ${this.currentMode.toUpperCase()} mode`,
      );

      const sectionElement = document.getElementById("buildingInfo");
      if (!sectionElement) return;

      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;

      // ✅ S03 PATTERN: Update Reference Standard dropdown using specific selector
      const referenceStandardDropdown = sectionElement.querySelector(
        '[data-dropdown-id="dd_d_13"]',
      );
      const d13Value = currentState.getValue("d_13");
      if (referenceStandardDropdown && d13Value) {
        referenceStandardDropdown.value = d13Value;
      }

      // ✅ S03 PATTERN: Update Carbon Standard dropdown using specific selector
      const carbonStandardDropdown = sectionElement.querySelector(
        '[data-dropdown-id="dd_d_15"]',
      );
      const d15Value = currentState.getValue("d_15");
      if (carbonStandardDropdown && d15Value) {
        carbonStandardDropdown.value = d15Value;
      }

      // ✅ CRITICAL FIX: Update Major Occupancy dropdown using specific selector
      const majorOccupancyDropdown = sectionElement.querySelector(
        '[data-dropdown-id="dd_d_12"]',
      );
      const d12Value = currentState.getValue("d_12");
      if (majorOccupancyDropdown && d12Value) {
        majorOccupancyDropdown.value = d12Value;
      }

      // ✅ CRITICAL FIX: Update Actual/Target Use dropdown using specific selector
      const actualTargetDropdown = sectionElement.querySelector(
        '[data-dropdown-id="dd_d_14"]',
      );
      const d14Value = currentState.getValue("d_14");
      if (actualTargetDropdown && d14Value) {
        actualTargetDropdown.value = d14Value;
      }

      // ✅ CRITICAL: Update reporting year slider (h_12, displayed as d_1)
      const yearSlider = sectionElement.querySelector(
        'input[data-field-id="h_12"]',
      );
      const yearValue = currentState.getValue("h_12"); // Actual field is h_12
      if (yearSlider && yearValue) {
        yearSlider.value = yearValue;
        // Update year display
        const yearDisplay = yearSlider.nextElementSibling;
        if (yearDisplay) {
          yearDisplay.textContent = yearValue;
        }
        console.log(
          `[S02] Updated h_12 (reporting year) slider = "${yearValue}" (${this.currentMode} mode)`,
        );
      }

      // ✅ CRITICAL FIX: Update service life slider (h_13)
      const serviceLifeSlider = sectionElement.querySelector(
        'input[data-field-id="h_13"]',
      );
      const serviceLifeValue = currentState.getValue("h_13"); // Service life field
      if (serviceLifeSlider && serviceLifeValue) {
        serviceLifeSlider.value = serviceLifeValue;
        // Update service life display
        const serviceLifeDisplay = serviceLifeSlider.nextElementSibling;
        if (serviceLifeDisplay) {
          serviceLifeDisplay.textContent = serviceLifeValue;
        }
        console.log(
          `[S02] Updated h_13 (service life) slider = "${serviceLifeValue}" (${this.currentMode} mode)`,
        );
      }

      // ✅ Update other editable fields using standard selectors
      const editableFields = [
        "h_15",
        "i_17",
        "l_12",
        "l_13",
        "l_14",
        "l_15",
        "l_16",
      ];

      editableFields.forEach((fieldId) => {
        const stateValue = currentState.getValue(fieldId);
        if (stateValue === undefined || stateValue === null) return;

        const element = sectionElement.querySelector(
          `[data-field-id="${fieldId}"]`,
        );
        if (!element) return;

        if (element.hasAttribute("contenteditable")) {
          let displayValue = stateValue;

          // Format currency fields properly
          if (["l_12", "l_13", "l_14", "l_15", "l_16"].includes(fieldId)) {
            const numericValue = window.TEUI?.parseNumeric?.(stateValue, 0);
            if (numericValue > 0) {
              const formatType = fieldId === "l_15" ? "cad-2dp" : "cad-4dp";
              displayValue =
                window.TEUI?.formatNumber?.(numericValue, formatType) ??
                stateValue;
            }
          }

          // ✅ CRITICAL FIX: Format h_15 area field consistently
          if (fieldId === "h_15") {
            const numericValue = window.TEUI?.parseNumeric?.(stateValue, 0);
            if (numericValue > 0) {
              displayValue =
                window.TEUI?.formatNumber?.(numericValue, "number-2dp-comma") ??
                stateValue;
            }
          }

          element.textContent = displayValue;
          console.log(
            `[S02] Updated ${fieldId} = "${displayValue}" (${this.currentMode} mode)`,
          );
        }
      });
    },

    /**
     * Update calculated fields display based on current mode
     * This updates DOM elements to show calculated values from StateManager
     */
    updateCalculatedDisplayValues: function () {
      // console.log(`🔄 [S02] updateCalculatedDisplayValues: mode=${this.currentMode}`);

      // Update calculated fields to show values for current mode
      const calculatedFields = ["d_16"]; // Embodied Carbon Target

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
            value = "0.00";
          }

          if (value !== null && value !== undefined) {
            // Format numeric fields appropriately
            const formattedValue =
              value === "N/A"
                ? "N/A"
                : window.TEUI.formatNumber
                  ? window.TEUI.formatNumber(value, "number-2dp-comma")
                  : value;

            element.textContent = formattedValue;
            // console.log(`[S02] Updated calculated field ${fieldId} = "${formattedValue}" (${this.currentMode} mode)`);
          }
        }
      });
    },
  };
  // Expose ModeManager for debugging and cross-section communication
  window.TEUI.sect02.ModeManager = ModeManager;

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

    // Public API for cost field formatting
    syncCostFieldDisplays: syncCostFieldDisplays,

    // ✅ PATTERN A: Expose ModeManager for dual-state routing
    ModeManager: ModeManager,

    // ✅ PHASE 2: Expose state objects for import sync
    TargetState: TargetState,
    ReferenceState: ReferenceState,
  };
})();
