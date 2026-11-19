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
        d: { content: "D", classes: ["section-subheader"] },
        e: { content: "E", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "G", classes: ["section-subheader"] },
        h: { content: "H", classes: ["section-subheader"] },
        i: { content: "I", classes: ["section-subheader"] },
        j: { content: "J", classes: ["section-subheader"] },
        k: { content: "K", classes: ["section-subheader"] },
        l: {
          content: "Prices of Energy",
          classes: ["section-subheader", "text-center"],
          colspan: 3,
        },
        m: { content: "M" },
        n: { content: "N" },
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
          semanticPath: "building.majorOccupancy",
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
        // The ASHRAE 62.1 space type within the Major Occupancy: its Rp and Ra
        // set the outdoor air V.1.4 checks (Andy 2026-11-18; VentilationRates.js).
        // The options follow B.1 (syncSpaceTypeDropdown); with no parent value
        // getOptions offers every space type, so an import validates any of them.
        e: {
          fieldId: "e_12",
          semanticPath: "building.ventilationSpaceType",
          type: "dropdown",
          dropdownId: "dd_e_12",
          label: "Space Type (ASHRAE 62.1)",
          value: "Auditorium seating area",
          section: "buildingInfo",
          tooltip: true,
          getOptions: function (occupancy) {
            const rates = window.TEUI.VentilationRates;
            if (!rates) return [];
            const types = occupancy
              ? rates.optionsFor(occupancy)
              : Object.keys(rates.spaceTypes);
            return types.map(t => ({ value: t, name: t }));
          },
        },
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
          semanticPath: "building.reportingPeriod",
          type: "year_slider",
          label: "Reporting Period",
          value: "2022",
          min: 2015,
          max: 2050,
          step: 1,
          section: "buildingInfo",
          tooltip: true, // Year Data Entered
        },
        i: { content: "" }, // Empty but needed for alignment
        j: { content: "" }, // Empty but needed for alignment
        k: { content: "Electricity", classes: ["text-end"] },
        l: {
          fieldId: "l_12",
          semanticPath: "energy.price.electricity",
          type: "editable",
          value: "$0.1300",
          label: "Electricity Price: $/kWh Avg.", // Price per kWh
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
          semanticPath: "reference.standard",
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
        e: {
          type: "button",
          buttonId: "setValuesBtn",
          fieldId: "e_13", // Field ID for tooltip support
          content: "Set Values",
          classes: ["btn", "btn-sm", "btn-danger"],
          tooltip: true, // Enable tooltip support
        }, // Set Values button
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
          semanticPath: "building.serviceLife",
          type: "year_slider",
          label: "Service Life: yrs.",
          value: "50",
          min: 30,
          max: 100,
          step: 10,
          section: "buildingInfo",
          tooltip: true, // Select a period in Years
        },
        i: { content: "" }, // Empty but needed for alignment
        j: { content: "" }, // Empty but needed for alignment
        k: { content: "Gas", classes: ["text-end"] },
        l: {
          fieldId: "l_13",
          semanticPath: "energy.price.gas",
          type: "editable",
          value: "$0.5070",
          label: "Gas Price: $/m³", // Price per m³
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
          semanticPath: "reference.actualTargetUse",
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
          semanticPath: "building.projectName",
          type: "editable",
          label: "Project Name",
          value: "Three Feathers Terrace",
          classes: ["wide-text", "no-wrap"],
          section: "buildingInfo",
          tooltip: true, // Project Name
        },
        i: { content: "" }, // Empty but needed for alignment
        j: { content: "" }, // Empty but needed for alignment
        k: { content: "Propane", classes: ["text-end"] },
        l: {
          fieldId: "l_14",
          semanticPath: "energy.price.propane",
          type: "editable",
          value: "$1.6200",
          label: "Propane Price: $/kg", // Price per kg
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
          semanticPath: "reference.carbonBenchmark",
          type: "dropdown",
          dropdownId: "dd_d_15",
          value: "Self Reported",
          section: "buildingInfo",
          tooltip: true, // Carbon Benchmark
          options: [
            { value: "BR18 (Denmark)", name: "BR18 (Denmark)" },
            { value: "IPCC AR6 EPC", name: "IPCC AR6 EPC" },
            { value: "IPCC AR6 EA", name: "IPCC AR6 EA" },
            { value: "TGS4", name: "Typical Values" },
            { value: "TGS4 Tier 2", name: "TGS4 Tier 2" },
            { value: "TGS4 Tier 3", name: "TGS4 Tier 3" },
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
          semanticPath: "building.conditionedFloorArea",
          type: "editable",
          label: "Conditioned Area: m²",
          value: "1427.20", // ✅ FIXED: Raw value without comma for calculation stability
          classes: ["user-input", "editable"],
          section: "buildingInfo",
          tooltip: true, // Net Conditioned Area
        },
        i: { content: "" }, // Empty but needed for alignment
        j: { content: "" }, // Empty but needed for alignment
        k: { content: "Wood", classes: ["text-end"] },
        l: {
          fieldId: "l_15",
          semanticPath: "energy.price.wood",
          type: "editable",
          value: "$180.00",
          label: "Wood Price: $/m³", // Price per m³
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
      label: "Embodied Carbon Target: kgCO₂e/m²",
      cells: {
        c: { label: "Embodied Carbon Target: kgCO₂e/m²" },
        d: {
          fieldId: "d_16",
          semanticPath: "reference.embodiedCarbonTarget",
          type: "derived",
          value: "345.82",
          section: "buildingInfo",
          tooltip: true, // S4. Targets
          dependencies: ["d_15"], // Carbon benchmarking standard selection
          conditionalDeps: ["i_39", "i_41"], // i_39 used when d_15="TGS4", i_41 used when d_15="Self Reported"
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
          semanticPath: "building.certifier",
          type: "editable",
          label: "Certifier",
          value: "Thomson Architecture, Inc.",
          section: "buildingInfo",
          tooltip: true, // Certifier
        },
        i: { content: "" }, // Empty but needed for alignment
        j: { content: "" }, // Empty but needed for alignment
        k: { content: "Oil", classes: ["text-end"] },
        l: {
          fieldId: "l_16",
          semanticPath: "energy.price.oil",
          type: "editable",
          value: "$1.5000",
          label: "Oil Price: $/litre", // Price per litre
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
          semanticPath: "building.licenseNumber",
          type: "editable",
          label: "License Number",
          value: "8154",
          section: "buildingInfo",
          tooltip: true, // License or Authorization
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
          if (cell.semanticPath)
            fields[cell.fieldId].semanticPath = cell.semanticPath; // Phase 5: Include semantic path
          if (cell.dropdownId)
            fields[cell.fieldId].dropdownId = cell.dropdownId;
          if (cell.options) fields[cell.fieldId].options = cell.options;
          if (cell.getOptions)
            fields[cell.fieldId].getOptions = cell.getOptions;
          if (cell.dependencies)
            fields[cell.fieldId].dependencies = cell.dependencies;
          if (cell.conditionalDeps)
            fields[cell.fieldId].conditionalDeps = cell.conditionalDeps;
          if (cell.uiDeps) fields[cell.fieldId].uiDeps = cell.uiDeps;
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
    Object.values(sectionRows).forEach(row => {
      if (!row.cells) return;

      Object.values(row.cells).forEach(cell => {
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
    columns.forEach(col => {
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
   * Setup Carbon Standard dropdown event handler
   * Follows the dropdown handler pattern from the framework
   */
  function setupCarbonStandardDropdown() {
    const dropdown = document.querySelector(
      'select[data-dropdown-id="dd_d_15"], select[data-field-id="d_15"]'
    );
    if (!dropdown) return;

    // Remove any existing handlers to avoid duplicates
    dropdown.removeEventListener("change", handleCarbonStandardChange);

    // Add the event listener
    dropdown.addEventListener("change", handleCarbonStandardChange);
  }

  /**
   * Handle Carbon Standard dropdown change
   * ✅ PATTERN A: Use setModeValue() to save to current state
   */
  function handleCarbonStandardChange(e) {
    const selectedValue = e.target.value;
    const fieldId = e.target.getAttribute("data-field-id") || "d_15";

    if (e.isTrusted) {
      window.TEUI.sect02.userInteracted = true;
    }

    // Save to current state (Target or Reference) via setModeValue
    setModeValue(fieldId, selectedValue, "user-modified");
  }

  /**
   * Handle Major Occupancy dropdown change (d_12)
   * Saves to current state (Target or Reference) via setModeValue
   */
  function handleMajorOccupancyChange(e) {
    const selectedValue = e.target.value;
    const fieldId = e.target.getAttribute("data-field-id") || "d_12";

    if (e.isTrusted) {
      window.TEUI.sect02.userInteracted = true;
    }

    setModeValue(fieldId, selectedValue, "user-modified");
  }

  /**
   * Handle Actual/Target Use dropdown change (d_14)
   * Saves to current state (Target or Reference) via setModeValue
   */
  function handleActualTargetChange(e) {
    const selectedValue = e.target.value;
    const fieldId = e.target.getAttribute("data-field-id") || "d_14";

    if (e.isTrusted) {
      window.TEUI.sect02.userInteracted = true;
    }

    setModeValue(fieldId, selectedValue, "user-modified");
  }

  /**
   * Handle Building Code dropdown change (d_13)
   * Saves to current state (Target or Reference) via setModeValue
   */
  function handleBuildingCodeChange(e) {
    const selectedValue = e.target.value;
    const fieldId = e.target.getAttribute("data-field-id") || "d_13";

    if (e.isTrusted) {
      window.TEUI.sect02.userInteracted = true;
    }

    setModeValue(fieldId, selectedValue, "user-modified");
  }

  /**
   * ✅ PHASE 4: Apply ReferenceValues - SIMPLIFIED (delegates to FileHandler)
   * FileHandler already has the proven Import Quarantine pattern from Excel imports
   * No need to duplicate that logic here - Section02 handles UI events only
   */
  function applyReferenceValuesOverlay() {
    const currentMode = window.TEUI.ReferenceToggle?.isReferenceMode() ? "reference" : "target";

    // Get the selected standard for current mode
    const standard =
      currentMode === "reference"
        ? window.TEUI.StateManager.getValue("ref_d_13")
        : window.TEUI.StateManager.getValue("d_13");

    console.log(
      `[S02] Applying ReferenceValues: mode=${currentMode}, standard=${standard}`
    );

    // Delegate to FileHandler - it knows how to do this correctly!
    if (window.TEUI?.FileHandler?.applyReferenceValuesFromStandard) {
      window.TEUI.FileHandler.applyReferenceValuesFromStandard(
        standard,
        currentMode
      );
    } else {
      console.error(
        "[S02] FileHandler.applyReferenceValuesFromStandard() not available"
      );
    }
  }

  /**
   * Initialize event handlers for this section
   */
  function initializeEventHandlers() {
    // ✅ PHASE 4: Wire "Set Values" button to apply ReferenceValues overlay
    const setValuesBtn = document.getElementById("setValuesBtn");
    if (setValuesBtn) {
      setValuesBtn.addEventListener("click", () => {
        console.log(
          `[S02] "Set Values" button clicked in ${window.TEUI.ReferenceToggle?.isReferenceMode() ? "REFERENCE" : "TARGET"} mode`
        );
        applyReferenceValuesOverlay();
      });
      console.log('[S02] "Set Values" button wired successfully');
    } else {
      console.warn('[S02] "Set Values" button not found - check button ID');
    }

    // Set up dropdown handlers using event delegation on the section container
    const sectionElement = document.getElementById("buildingInfo");
    if (sectionElement) {
      sectionElement.removeEventListener("change", handleSectionDropdownChange);
      sectionElement.addEventListener("change", handleSectionDropdownChange);
    }

    // Set initial values on dropdown if not already set
    if (!window.TEUI.sect02.initialized) {
      const dropdown = document.querySelector(
        'select[data-dropdown-id="dd_d_15"], select[data-field-id="d_15"]'
      );
      if (dropdown && window.TEUI?.StateManager) {
        const currentValue = window.TEUI.StateManager.getValue("d_15");
        if (!currentValue) {
          window.TEUI.StateManager.setValue("d_15", dropdown.value, "default");
        }
      }
      window.TEUI.sect02.initialized = true;
    }

    // Area field blur/keydown handled by ensureAllFieldsUseProperStyling()

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
        // Save to current state (Target or Reference) via setModeValue
        setModeValue("h_12", newYear, "user-modified");
      });
    }

    // ✅ CRITICAL FIX: Service life slider events (h_13)
    const serviceLifeSlider = document.querySelector(
      'input[data-field-id="h_13"]'
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
        // Save to current state (Target or Reference) via setModeValue
        setModeValue("h_13", newServiceLife, "user-modified");
      });
    }

    // Add listener for changes from external sections
    if (window.TEUI && window.TEUI.StateManager) {
      // Graph handles cross-section computation — only keep UI-only listeners
      window.TEUI.StateManager.addListener("d_12", updateCriticalOccupancyFlag);
      window.TEUI.StateManager.addListener(
        "ref_d_12",
        updateCriticalOccupancyFlag
      );
      // The 62.1 space types follow the occupancy, in either model
      window.TEUI.StateManager.addListener("d_12", syncSpaceTypeDropdown);
      window.TEUI.StateManager.addListener("ref_d_12", syncSpaceTypeDropdown);
    }
  }

  /**
   * The 62.1 space type dropdown (e_12) for the current mode: the occupancy's
   * space types, the stored one selected - or, when the occupancy does not
   * offer it (a new occupancy, an older file), the occupancy's default,
   * stored. The engine reads the same default (VentilationRates.resolve), so
   * the state only follows what is already in effect.
   */
  function syncSpaceTypeDropdown() {
    const rates = window.TEUI.VentilationRates;
    const select = document.querySelector('select[data-field-id="e_12"]');
    if (!rates || !select) return;

    const occupancy = getModeValue("d_12") || getFieldDefault("d_12");
    const stored = getModeValue("e_12");
    const inEffect = rates.resolve(occupancy, stored);

    select.innerHTML = "";
    for (const type of rates.optionsFor(occupancy)) {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      select.appendChild(option);
    }
    select.value = inEffect;

    if (stored !== inEffect) setModeValue("e_12", inEffect, "default");
  }

  /** Called by ReferenceToggle when the mode switches. */
  function onModeSwitch() {
    syncSpaceTypeDropdown();
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
      case "e_12":
        setModeValue("e_12", e.target.value, "user-modified");
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
      window.TEUI.ReferenceToggle?.isReferenceMode()
        ? window.TEUI.StateManager?.getValue("ref_d_12") || "" // ✅ FIXED: No fallback to Target values
        : window.TEUI.StateManager?.getValue("d_12") || "";
    const sectionHeader = document.querySelector(
      "#buildingInfo .section-header"
    ); // Target the Section 2 header
    if (!sectionHeader) {
      console.warn("Section 2 header not found for critical flag.");
      return false;
    }

    let flagSpan = sectionHeader.querySelector(
      ".critical-occupancy-header-flag"
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
              iconSpan.nextSibling.nextSibling || null
            );
          } else {
            // Fallback: insert at beginning
            sectionHeader.insertBefore(
              flagSpan,
              sectionHeader.firstChild.nextSibling
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
    isSect02Initialized = true; // ✅ RACE CONDITION FIX: Set flag BEFORE external listeners

    // ✅ RACE CONDITION FIX: Initialize event handlers AFTER initialization flag is set
    // This prevents external listeners from triggering calculateAll() before we're ready
    initializeEventHandlers();

    // Ensure all editable fields (h_14, h_15, i_16, i_17, l_12-l_16) have
    // proper styling, contenteditable, and blur/keydown handlers.
    ensureAllFieldsUseProperStyling();

    // Initialize critical occupancy flag
    updateCriticalOccupancyFlag();

    // The 62.1 space types for the occupancy in this mode
    syncSpaceTypeDropdown();

    // Apply validation tooltips to fields
    if (window.TEUI.TooltipManager && window.TEUI.TooltipManager.initialized) {
      // Wait a short moment for DOM to fully settle, then apply tooltips
      setTimeout(() => {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }
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
    userInputFields.forEach(fieldId => {
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

            // ✅ CRITICAL FIX: Save to current state (Target or Reference) via setModeValue
            // setModeValue handles mode-aware publishing to StateManager
            setModeValue(fieldId, valueToSave, "user-modified");
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
    derivedFields.forEach(fieldId => {
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
  // Area adjustment slider functions removed - now using direct numeric input

  /**
   * Sync cost field displays with proper CAD formatting
   * Uses global window.TEUI.formatNumber with correct CAD format types
   * Only formats fields that have been modified or have valid numeric values
   */
  function syncCostFieldDisplays() {
    const costFields = ["l_12", "l_13", "l_14", "l_15", "l_16"];
    costFields.forEach(fieldId => {
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
              0
            );
            if (numericValue > 0 && window.TEUI?.StateManager) {
              window.TEUI.StateManager.setValue(
                fieldId,
                numericValue.toString(),
                "default"
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

  // TargetState/ReferenceState/ModeManager removed — graph + SM is the single source of truth.

  function getModeValue(fieldId) {
    const isRef = window.TEUI.ReferenceToggle?.isReferenceMode();
    return window.TEUI.StateManager?.getValue(isRef ? `ref_${fieldId}` : fieldId);
  }

  function setModeValue(fieldId, value, source = "user-modified") {
    const isRef = window.TEUI.ReferenceToggle?.isReferenceMode();
    const key = isRef ? `ref_${fieldId}` : fieldId;
    if (window.TEUI.StateManager?.setValue) {
      window.TEUI.StateManager.setValue(key, value, source);
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

    // Public API for cost field formatting
    syncCostFieldDisplays: syncCostFieldDisplays,

    // The 62.1 space type dropdown follows the occupancy (FileHandler calls
    // it after an import; ReferenceToggle calls onModeSwitch)
    syncSpaceTypeDropdown: syncSpaceTypeDropdown,
    onModeSwitch: onModeSwitch,
  };
})();
