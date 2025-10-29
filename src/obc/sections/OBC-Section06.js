/**
 * OBC-Section06.js
 * Occupant Safety & Accessibility (Section 6) module for OBC Matrix
 *
 * Based on OBC Matrix Part 3 structure covering rows 58-65
 * Includes Occupant Load, Barrier-Free Design, and Hazardous Substances
 */

// Create section-specific namespace for global references
window.OBC = window.OBC || {};
window.OBC.sect06 = window.OBC.sect06 || {};
window.OBC.sect06.initialized = false;
window.OBC.sect06.userInteracted = false;

// Section 6: Occupant Safety & Accessibility Module
window.OBC.SectionModules.sect06 = (function () {
  //==========================================================================
  // SECTION CONFIGURATION
  //==========================================================================

  const SECTION_CONFIG = {
    name: "occupantSafety",
    excelRowStart: 58,
    excelRowEnd: 65,
    hasCalculations: true, // Has occupant load totals
    hasDropdowns: true,
    needsCSS: false,
  };

  //==========================================================================
  // DROPDOWN OPTIONS
  //==========================================================================

  const dropdownOptions = {
    yesNoOptions: [
      { value: "-", name: "Select..." },
      { value: "Yes", name: "Yes" },
      { value: "No", name: "No" },
      { value: "N/A", name: "N/A" },
    ],
    // Occupancy types - REMOVED: Now using text inputs instead of dropdowns
    // occupancyTypes: [
    //   { value: "-", name: "Select..." },
    // ],
    // Based On dropdown options for occupant load calculations
    basedOnOptions: [
      { value: "-", name: "Select..." },
      { value: "m2_per_person", name: "m² per person" },
      { value: "design_of_space", name: "Design of space" },
      { value: "number_of_seats", name: "Number of seats" },
      { value: "no_sleeping_rooms", name: "No. of sleeping rooms" },
      { value: "no_parking_spaces", name: "No. of parking spaces" },
    ],
    // Posted Limit Required dropdown options
    postedLimitOptions: [
      { value: "-", name: "Select..." },
      { value: "Yes", name: "Yes" },
      { value: "No", name: "No" },
    ],
  };

  //==========================================================================
  // CONSOLIDATED FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  const sectionRows = {
    // SUBHEADER ROW
    header: {
      id: "6.h",
      rowId: "6.h",
      label: "Occupant Safety Header",
      cells: {
        b: { content: "6.h" },
        c: { content: "OCCUPANT SAFETY", classes: ["section-subheader"] },
        d: { content: "OCCUPANT LOAD", classes: ["section-subheader"] },
        e: { content: "FLOOR LEVEL/AREA", classes: ["section-subheader"] },
        f: { content: "OCCUPANCY TYPE", classes: ["section-subheader"] },
        g: { content: "", classes: ["section-subheader"] },
        h: {
          content: "OCCUPANT LOAD (PERSONS)",
          classes: ["section-subheader"],
        },
        i: { content: "BASED ON", classes: ["section-subheader"] },
        j: { content: "POSTED LIMIT REQUIRED", classes: ["section-subheader"] },
        k: { content: "", classes: ["section-subheader"] },
        l: {
          content: "OBC 3.1.17. and 3.1.17.1.(2)",
          classes: ["section-subheader"],
        },
        m: { content: "", classes: ["section-subheader"] },
        n: { content: "", classes: ["section-subheader"] },
        o: { content: "Notes", classes: ["section-subheader", "notes-column"] },
      },
    },

    // Row 59: Occupant Load Row 1 - EXPANDABLE TRIGGER ROW
    6.59: {
      id: "6.59",
      rowId: "6.59",
      label: "Occupant Load 1",
      cells: {
        a: {
          content: "", // Will be populated by ExpandableRows utility
          classes: ["expandable-row-trigger"],
          attributes: {
            "data-expandable-group": "occupant-loads",
            "data-expandable-rows": "6.60,6.61",
            "data-default-visible": "1", // Shows only the trigger row initially
          },
        },
        b: { content: "59" },
        c: { content: "" },
        d: { content: "" },
        e: {
          fieldId: "d_59",
          type: "editable",
          value: "Ground Floor",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        f: {
          fieldId: "f_59",
          type: "editable",
          value: "Retail",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        h: {
          fieldId: "i_59",
          type: "num-editable",
          value: "50",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        i: {
          fieldId: "j_59",
          type: "dropdown",
          dropdownId: "dd_j_59",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-md"],
          options: dropdownOptions.basedOnOptions,
        },
        j: {
          fieldId: "k_59",
          type: "dropdown",
          dropdownId: "dd_k_59",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.postedLimitOptions,
        },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_59",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 60: Occupant Load Row 2
    "6.60": {
      id: "6.60",
      rowId: "6.60",
      label: "Occupant Load 2",
      cells: {
        b: { content: "60" },
        c: { content: "" },
        d: { content: "" },
        e: {
          fieldId: "d_60",
          type: "editable",
          value: "Second Floor",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        f: {
          fieldId: "f_60",
          type: "editable",
          value: "Restaurant",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        h: {
          fieldId: "i_60",
          type: "num-editable",
          value: "0.00",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        i: {
          fieldId: "j_60",
          type: "dropdown",
          dropdownId: "dd_j_60",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-md"],
          options: dropdownOptions.basedOnOptions,
        },
        j: {
          fieldId: "k_60",
          type: "dropdown",
          dropdownId: "dd_k_60",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.postedLimitOptions,
        },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_60",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 61: Occupant Load Row 3
    6.61: {
      id: "6.61",
      rowId: "6.61",
      label: "Occupant Load 3",
      cells: {
        b: { content: "61" },
        c: { content: "" },
        d: { content: "" },
        e: {
          fieldId: "d_61",
          type: "editable",
          value: "Basement",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        f: {
          fieldId: "f_61",
          type: "editable",
          value: "Storage",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        h: {
          fieldId: "i_61",
          type: "num-editable",
          value: "0.00",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        i: {
          fieldId: "j_61",
          type: "dropdown",
          dropdownId: "dd_j_61",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-md"],
          options: dropdownOptions.basedOnOptions,
        },
        j: {
          fieldId: "k_61",
          type: "dropdown",
          dropdownId: "dd_k_61",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.postedLimitOptions,
        },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_61",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 62: Occupant Load Total
    6.62: {
      id: "6.62",
      rowId: "6.62",
      label: "TOTAL",
      cells: {
        d: { content: "" },
        e: { content: "TOTAL" },
        h: {
          fieldId: "i_62",
          type: "calculated",
          value: "50",
          section: SECTION_CONFIG.name,
          classes: ["calculated-value"],
        },
        o: {
          fieldId: "o_62",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 6.62a: Barrier-Free Design Header
    "6.62a": {
      id: "6.62a",
      rowId: "6.62a",
      label: "Barrier-Free Design",
      cells: {
        b: { content: "3.08", classes: ["section-subheader"] },
        c: { content: "", classes: ["section-subheader"] },
        d: { content: "Barrier-Free Design", classes: ["section-subheader"] },
        e: { content: "", classes: ["section-subheader"] },
        f: { content: "", classes: ["section-subheader"] },
        g: { content: "", classes: ["section-subheader"] },
        h: { content: "", classes: ["section-subheader"] },
        i: { content: "", classes: ["section-subheader"] },
        j: { content: "", classes: ["section-subheader"] },
        k: { content: "", classes: ["section-subheader"] },
        l: { content: "OBC 3.8.", classes: ["section-subheader"] },
        m: { content: "", classes: ["section-subheader"] },
        n: { content: "", classes: ["section-subheader"] },
        o: {
          content: "Notes",
          classes: ["section-subheader", "notes-column"],
        },
      },
    },

    // Row 63: 3.19 Barrier-Free Design
    6.63: {
      id: "6.63",
      rowId: "6.63",
      label: "Barrier-Free Design",
      cells: {
        d: { content: "Barrier-Free Design", type: "label" },
        e: {
          fieldId: "d_63",
          type: "dropdown",
          dropdownId: "dd_d_63",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.yesNoOptions,
        },
        f: {
          fieldId: "f_63",
          type: "editable",
          value: "provide explanation here...",
          section: SECTION_CONFIG.name,
          classes: ["user-input", "span3"],
        },
        l: { content: "3.8." },
        o: {
          fieldId: "o_63",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 64: Barrier-Free Entrances
    6.64: {
      id: "6.64",
      rowId: "6.64",
      label: "Barrier-Free Entrances",
      cells: {
        d: { content: "Barrier-Free Entrances", type: "label" },
        e: {
          fieldId: "d_64",
          type: "num-editable",
          value: "0",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        f: {
          fieldId: "f_64",
          type: "editable",
          value:
            "state quantity to the left and provide an explanation here...",
          section: SECTION_CONFIG.name,
          classes: ["user-input", "span3"],
        },
        l: { content: "3.1.8.2." },
        o: {
          fieldId: "o_64",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 65: 3.20 Hazardous Substances
    6.65: {
      id: "6.65",
      rowId: "6.65",
      label: "Hazardous Substances",
      cells: {
        d: { content: "Hazardous Substances", type: "label" },
        e: {
          fieldId: "d_65",
          type: "dropdown",
          dropdownId: "dd_d_65",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.yesNoOptions,
        },
        f: {
          fieldId: "f_65",
          type: "editable",
          value: "provide explanation here...",
          section: SECTION_CONFIG.name,
          classes: ["user-input", "span3"],
        },
        l: { content: "3.3.1.2. & 3.3.1.19." },
        o: {
          fieldId: "o_65",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },
  };

  //==========================================================================
  // ACCESSOR METHODS (REQUIRED FOR FIELDMANAGER)
  //==========================================================================

  function getFields() {
    const fields = {};

    Object.entries(sectionRows).forEach(([rowKey, row]) => {
      if (rowKey === "header") return;
      if (!row.cells) return;

      Object.entries(row.cells).forEach(([_colKey, cell]) => {
        if (cell.fieldId && cell.type) {
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.label || row.label,
            defaultValue: cell.value || "",
            section: cell.section || SECTION_CONFIG.name,
          };

          if (cell.dropdownId)
            fields[cell.fieldId].dropdownId = cell.dropdownId;
          if (cell.options) fields[cell.fieldId].options = cell.options;
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
        if (cell.dropdownId && cell.options) {
          options[cell.dropdownId] = cell.options;
        }
      });
    });

    return options;
  }

  function getLayout() {
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

  function createLayoutRow(row) {
    const rowDef = {
      id: row.id,
      cells: [
        {}, // Column A - empty spacer (will be populated if row has 'a' cell)
        {}, // Column B - will be populated from row.cells.b
      ],
    };

    // Handle column A if defined (for expandable rows)
    if (row.cells && row.cells.a) {
      rowDef.cells[0] = { ...row.cells.a };
    }

    // Handle column B if defined
    if (row.cells && row.cells.b) {
      const cell = { ...row.cells.b };
      delete cell.section;
      rowDef.cells[1] = cell;
    }

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
      "o",
    ];

    columns.forEach((col) => {
      if (row.cells && row.cells[col]) {
        const cell = { ...row.cells[col] };
        delete cell.section;
        rowDef.cells.push(cell);
      } else {
        rowDef.cells.push({});
      }
    });

    return rowDef;
  }

  //==========================================================================
  // CALCULATION FUNCTIONS
  //==========================================================================

  function getNumericValue(fieldId, defaultValue = 0) {
    // Try StateManager first, then fallback to DOM (COPY FROM SECTION 03)
    if (window.OBC?.StateManager?.getValue) {
      const stateValue = window.OBC.StateManager.getValue(fieldId);
      if (stateValue !== null && stateValue !== undefined) {
        const numericValue = window.OBC.parseNumeric
          ? window.OBC.parseNumeric(stateValue, defaultValue)
          : parseFloat(stateValue.toString().replace(/,/g, ""));
        return isNaN(numericValue) ? defaultValue : numericValue;
      }
    }

    // Fallback to DOM (COPY FROM SECTION 03)
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (!element) return defaultValue;

    let value = "";
    if (element.type === "checkbox") {
      return element.checked;
    } else if (element.tagName === "INPUT") {
      value = element.value || "";
    } else if (element.contentEditable === "true") {
      value = element.textContent || "";
    } else {
      value = element.textContent || "";
    }

    const cleanValue = value
      .toString()
      .replace(/,/g, "")
      .replace(/[^\d.-]/g, "");
    const numericValue = parseFloat(cleanValue);
    return isNaN(numericValue) ? defaultValue : numericValue;
  }

  function setCalculatedValue(
    fieldId,
    rawValue,
    formatType = "number-0dp-comma",
  ) {
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (element) {
      // Use TEUI formatNumber if available, otherwise fallback with proper thousands separators
      let formattedValue;
      if (typeof rawValue === "number") {
        if (window.OBC?.formatNumber) {
          formattedValue = window.OBC.formatNumber(rawValue, formatType);
        } else {
          // Ensure thousands separators are included in fallback
          formattedValue = rawValue.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            useGrouping: true, // Explicitly enable thousands separators
          });
        }
      } else {
        formattedValue = rawValue;
      }

      element.textContent = formattedValue;

      // Add calculated value styling and remove user input styling (COPY FROM SECTION 03)
      element.classList.add("calculated-value");
      element.classList.remove("user-input", "user-modified", "editing-intent");
      element.removeAttribute("contenteditable");

      // Register value with StateManager
      if (window.OBC?.StateManager?.setValue) {
        window.OBC.StateManager.setValue(
          fieldId,
          rawValue.toString(),
          "calculated",
        );
      }
    }
  }

  function calculateOccupantLoadTotal() {
    // Add recursion protection (COPY FROM SECTION 03)
    if (window.sectionCalculationInProgress) {
      return;
    }

    window.sectionCalculationInProgress = true;

    try {
      const load1 = getNumericValue("i_59");
      const load2 = getNumericValue("i_60");
      const load3 = getNumericValue("i_61");

      const total = load1 + load2 + load3;
      setCalculatedValue("i_62", total, "number-0dp-comma");
    } finally {
      window.sectionCalculationInProgress = false;
    }
  }

  //==========================================================================
  // EVENT HANDLING (OBC MATRIX PATTERN)
  //==========================================================================

  function initializeEventHandlers() {
    // Use the global input handler from OBC-StateManager.js (COPY FROM SECTION 03)
    if (window.OBC?.StateManager?.initializeGlobalInputHandlers) {
      window.OBC.StateManager.initializeGlobalInputHandlers();
    }

    // Register StateManager listeners for calculation triggers (COPY FROM SECTION 03)
    if (window.OBC?.StateManager?.addListener) {
      const calculationTriggers = ["i_59", "i_60", "i_61"];

      calculationTriggers.forEach((fieldId) => {
        window.OBC.StateManager.addListener(fieldId, () => {
          if (!window.sectionCalculationInProgress) {
            calculateOccupantLoadTotal();
          }
        });
      });
    }

    // ALSO add direct DOM event listeners as backup for immediate responsiveness (COPY FROM SECTION 03)
    const triggerFields = ["i_59", "i_60", "i_61"];

    triggerFields.forEach((fieldId) => {
      const element = document.querySelector(`[data-field-id="${fieldId}"]`);
      if (element) {
        // Add input event listeners for immediate calculation updates
        ["blur", "input", "change"].forEach((eventType) => {
          element.addEventListener(eventType, () => {
            // Small delay to allow StateManager to update first
            setTimeout(() => {
              if (!window.sectionCalculationInProgress) {
                calculateOccupantLoadTotal();
              }
            }, 50);
          });
        });
      }
    });

    window.OBC.sect06.initialized = true;
  }

  function onSectionRendered() {
    // Initialize event handlers (COPY FROM SECTION 03)
    if (!window.OBC.sect06.initialized) {
      initializeEventHandlers();
    }

    // Perform initial calculations after a brief delay to ensure full initialization (COPY FROM SECTION 03)
    setTimeout(() => {
      calculateOccupantLoadTotal();
    }, 100);
  }

  //==========================================================================
  // PUBLIC API
  //==========================================================================

  return {
    getFields: getFields,
    getDropdownOptions: getDropdownOptions,
    getLayout: getLayout,
    initializeEventHandlers: initializeEventHandlers,
    onSectionRendered: onSectionRendered,

    // Calculation functions (COPY FROM SECTION 03)
    calculateOccupantLoadTotal: calculateOccupantLoadTotal,
    getNumericValue: getNumericValue,
    setCalculatedValue: setCalculatedValue,
  };
})();
