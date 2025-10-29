/**
 * OBC-Section09.js
 * Energy, Sound and Alternative Solutions (Section 9) module for OBC Matrix
 *
 * Based on OBC Matrix Part 3 structure covering rows 82-89
 * Includes Energy Efficiency, Sound Transmission Design, and Alternative Solutions
 */

// Create section-specific namespace for global references
window.OBC = window.OBC || {};
window.OBC.sect09 = window.OBC.sect09 || {};
window.OBC.sect09.initialized = false;
window.OBC.sect09.userInteracted = false;

// Section 9: Compliance & Design Module
window.OBC.SectionModules.sect09 = (function () {
  //==========================================================================
  // SECTION CONFIGURATION
  //==========================================================================

  const SECTION_CONFIG = {
    name: "energySoundComply",
    excelRowStart: 82,
    excelRowEnd: 89,
    hasCalculations: false,
    hasDropdowns: true,
    needsCSS: false,
  };

  //==========================================================================
  // DROPDOWN OPTIONS
  //==========================================================================

  const dropdownOptions = {
    compliancePaths: [
      { value: "-", name: "Select..." },
      { value: "Prescriptive", name: "Prescriptive" },
      { value: "Performance", name: "Performance" },
      { value: "Alternative Solution", name: "Alternative Solution" },
    ],
    yesNoOptions: [
      { value: "-", name: "Select..." },
      { value: "Yes", name: "Yes" },
      { value: "No", name: "No" },
      { value: "N/A", name: "N/A" },
    ],
    stcRatingOptions: [
      { value: "-", name: "Select..." },
      {
        value: "STC50_SB3_9111",
        name: "Min. STC rating of 50 based on SB-3 and 9.11.1.4",
      },
      {
        value: "STC50_ASTM_E90_9111",
        name: "Min. STC rating of 50 tested to ASTM E90 and 9.11.1.4",
      },
      {
        value: "STC47_ASTM_E336_5812",
        name: "Min. STC rating of 47 measured to ASTM E336 as per 5.8.1.2.(2)(a)",
      },
      {
        value: "STC47_5814_detailed",
        name: "Min. STC rating of 47 in accordance with 5.8.1.4 (detailed method)",
      },
      {
        value: "STC47_5814_simplified",
        name: "Min. STC rating of 47 in accordance with 5.8.1.4 / .5 (simplified method)",
      },
    ],
    climateZones: [
      { value: "-", name: "Select..." },
      { value: "4", name: "4" },
      { value: "5", name: "5" },
      { value: "6", name: "6" },
      { value: "7A", name: "7A" },
      { value: "7B", name: "7B" },
      { value: "8", name: "8" },
    ],
  };

  //==========================================================================
  // CONSOLIDATED FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  const sectionRows = {
    // SUBHEADER ROW
    header: {
      id: "9.82h",
      rowId: "9.82h",
      label: "Compliance & Design Header",
      cells: {
        b: { content: "9.h" },
        c: { label: "Energy Efficiency", classes: ["section-subheader"] },
        d: { content: "D", classes: ["section-subheader"] },
        e: { content: "E", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "G", classes: ["section-subheader"] },
        h: { content: "H", classes: ["section-subheader"] },
        i: { content: "I", classes: ["section-subheader"] },
        j: { content: "J", classes: ["section-subheader"] },
        k: { content: "K", classes: ["section-subheader"] },
        l: { content: "OBC 12.2.1.2.", classes: ["section-subheader"] },
        m: { content: "M", classes: ["section-subheader"] },
        n: { content: "N", classes: ["section-subheader"] },
        o: { content: "Notes", classes: ["section-subheader", "notes-column"] },
      },
    },

    // Row 82: 3.24 Energy Efficiency
    9.82: {
      id: "9.82",
      rowId: "9.82",
      label: "Compliance Path",
      cells: {
        b: { content: "3.24" },
        c: { label: "Compliance Path" },
        d: {
          fieldId: "e_82",
          type: "editable",
          value: "ie. OBC SB12 3.1.1.2.C4",
          section: SECTION_CONFIG.name,
          classes: ["user-input", "span3"],
        },
        l: { content: "12.2.1.2." },
        o: {
          fieldId: "o_82",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 83: Climate Zone
    9.83: {
      id: "9.83",
      rowId: "9.83",
      label: "CLIMATE ZONE",
      cells: {
        c: { label: "Climate Zone" },
        d: {
          fieldId: "f_83",
          type: "editable",
          value: "ZONE 4",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        e: { content: "HDD (18ºC):" },
        f: {
          fieldId: "k_83",
          type: "editable",
          value: "5555",
          section: SECTION_CONFIG.name,
          classes: ["user-input", "span4"],
        },
        l: { content: "SB-1 Table 2" },
        o: {
          fieldId: "o_83",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 84h: Sound Transmission Design Header
    "9.84h": {
      id: "9.84h",
      rowId: "9.84h",
      label: "Sound Transmission Design Header",
      cells: {
        b: { content: "3.25" },
        c: {
          label: "Sound Transmission Design",
          classes: ["section-subheader"],
        },
        d: { content: "Options:", classes: ["section-subheader"] },
        e: { content: "", classes: ["section-subheader"] },
        f: { content: "", classes: ["section-subheader"] },
        g: { content: "", classes: ["section-subheader"] },
        h: { content: "", classes: ["section-subheader"] },
        i: { content: "", classes: ["section-subheader"] },
        j: { content: "", classes: ["section-subheader"] },
        k: { content: "", classes: ["section-subheader"] },
        l: { content: "", classes: ["section-subheader"] },
        m: { content: "", classes: ["section-subheader"] },
        n: { content: "", classes: ["section-subheader"] },
        o: { content: "Notes", classes: ["section-subheader", "notes-column"] },
      },
    },

    // Row 84: Sound Transmission Design
    9.84: {
      id: "9.84",
      rowId: "9.84",
      label: "SOUND TRANSMISSION DESIGN",
      cells: {
        b: { content: "" },
        c: { label: "More than one dwelling unit above another?" },
        d: {
          fieldId: "i_84",
          type: "dropdown",
          dropdownId: "dd_i_84",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.yesNoOptions,
        },
        o: {
          fieldId: "o_84",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 85: Sound Transmission Notes
    9.85: {
      id: "9.85",
      rowId: "9.85",
      label: "Sound Transmission Notes",
      cells: {
        c: { label: "Notes on Sound Transmission Design" },
        d: {
          fieldId: "e_85",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        o: {
          fieldId: "o_85",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 86: Option Implemented
    9.86: {
      id: "9.86",
      rowId: "9.86",
      label: "Option Implemented",
      cells: {
        c: { label: "Option Implemented" },
        d: {
          fieldId: "f_86",
          type: "dropdown",
          dropdownId: "dd_f_86",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-lg"],
          options: dropdownOptions.stcRatingOptions,
        },
        o: {
          fieldId: "o_86",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 86h: Alternative Solutions Header
    "9.86h": {
      id: "9.86h",
      rowId: "9.86h",
      label: "Alternative Solutions Header",
      cells: {
        b: { content: "3.26" },
        c: { label: "Alternative Solutions", classes: ["section-subheader"] },
        d: { content: "", classes: ["section-subheader"] },
        e: { content: "", classes: ["section-subheader"] },
        f: { content: "", classes: ["section-subheader"] },
        g: { content: "", classes: ["section-subheader"] },
        h: { content: "", classes: ["section-subheader"] },
        i: { content: "", classes: ["section-subheader"] },
        j: { content: "", classes: ["section-subheader"] },
        k: { content: "", classes: ["section-subheader"] },
        l: {
          content: "[A]1.2.1.1. and [C]2.1.",
          classes: ["section-subheader"],
        },
        m: { content: "", classes: ["section-subheader"] },
        n: { content: "", classes: ["section-subheader"] },
        o: { content: "Notes", classes: ["section-subheader", "notes-column"] },
      },
    },

    // Row 87: Alternative Solutions - EXPANDABLE TRIGGER ROW
    9.87: {
      id: "9.87",
      rowId: "9.87",
      label: "ALTERNATIVE SOLUTIONS",
      cells: {
        a: {
          content: "", // Will be populated by ExpandableRows utility
          classes: ["expandable-row-trigger"],
          attributes: {
            "data-expandable-group": "alternative-solutions",
            "data-expandable-rows": "9.88,9.89",
            "data-default-visible": "1", // Shows only the trigger row initially
          },
        },
        b: { content: "" },
        c: { label: "Alternative Solution 1" },
        d: {
          fieldId: "d_87",
          type: "editable",
          value:
            "ie. Enhanced egress lighting system exceeding prescriptive requirements",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_87",
          type: "editable",
          value:
            "ie. Alternative solution providing equivalent safety performance",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 88: Alternative Solutions Details 1
    9.88: {
      id: "9.88",
      rowId: "9.88",
      label: "Alternative Solutions Details 1",
      cells: {
        b: { content: "88" },
        c: { label: "Alternative Solution 2" },
        d: {
          fieldId: "d_88",
          type: "editable",
          value: "ie. Performance-based structural fire protection design",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_88",
          type: "editable",
          value:
            "ie. Engineered solution with structural engineer certification",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 89: Alternative Solutions Details 2
    9.89: {
      id: "9.89",
      rowId: "9.89",
      label: "Alternative Solutions Details 2",
      cells: {
        b: { content: "89" },
        c: { label: "Alternative Solution 3" },
        d: {
          fieldId: "d_89",
          type: "editable",
          value:
            "ie. Fire separation performance based on advanced modeling analysis",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_89",
          type: "editable",
          value:
            "ie. Engineered solution with professional engineer certification",
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
      if (rowKey === "header" || rowKey === "9.84h" || rowKey === "9.86h")
        return; // Exclude headers and subheaders
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
        {}, // Column B - auto-populated
      ],
    };

    // Handle column A if defined (for expandable rows)
    if (row.cells && row.cells.a) {
      rowDef.cells[0] = { ...row.cells.a };
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
  // EVENT HANDLING (OBC MATRIX PATTERN)
  //==========================================================================

  function initializeEventHandlers() {
    // Initializing Section 09 event handlers

    if (window.OBC?.StateManager?.initializeGlobalInputHandlers) {
      window.OBC.StateManager.initializeGlobalInputHandlers();
    }
  }

  function onSectionRendered() {
    // Section 09 rendered
    initializeEventHandlers();
    window.OBC.sect09.initialized = true;
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
  };
})();
