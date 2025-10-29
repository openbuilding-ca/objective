/**
 * OBC-Section07.js
 * Fire Resistance & Spatial Separation (Section 7) module for OBC Matrix
 *
 * Based on OBC Matrix Part 3 structure covering rows 66-76
 * Includes Required Fire Resistance Ratings and Spatial Separation
 */

// Create section-specific namespace for global references
window.OBC = window.OBC || {};
window.OBC.sect07 = window.OBC.sect07 || {};
window.OBC.sect07.initialized = false;
window.OBC.sect07.userInteracted = false;

// Section 7: Fire Resistance & Spatial Separation Module
window.OBC.SectionModules.sect07 = (function () {
  //==========================================================================
  // SECTION CONFIGURATION
  //==========================================================================

  const SECTION_CONFIG = {
    name: "fireResistance",
    excelRowStart: 66,
    excelRowEnd: 76,
    hasCalculations: false,
    hasDropdowns: true,
    needsCSS: false,
  };

  //==========================================================================
  // DROPDOWN OPTIONS
  //==========================================================================

  const dropdownOptions = {
    // TODO: Add fire resistance rating options from CSV
    fireRatings: [
      { value: "-", name: "Select..." },
      { value: "0.75", name: "0.75" },
      { value: "1", name: "1" },
      { value: "1.5", name: "1.5" },
      { value: "2", name: "2" },
      { value: "3", name: "3" },
      { value: "4", name: "4" },
    ],
    yesNoOptions: [
      { value: "-", name: "Select..." },
      { value: "Yes", name: "Yes" },
      { value: "No", name: "No" },
      { value: "N/A", name: "N/A" },
    ],
    constructionTypeOptions: [
      { value: "-", name: "Select..." },
      { value: "Combustible Permitted", name: "Combustible Permitted" },
      { value: "Noncombustible Req'd", name: "Noncombustible Req'd" },
      {
        value: "Encapsulated Mass Timber Permitted",
        name: "Encapsulated Mass Timber Permitted",
      },
    ],
    claddingTypeOptions: [
      { value: "-", name: "Select..." },
      { value: "Combustible Permitted", name: "Combustible Permitted" },
      { value: "Noncombustible Req'd", name: "Noncombustible Req'd" },
    ],
  };

  //==========================================================================
  // CONSOLIDATED FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  const sectionRows = {
    // SUBHEADER ROW
    header: {
      id: "7.66",
      rowId: "7.66",
      label: "Fire Resistance Header",
      cells: {
        b: { content: "7.h" },
        c: { content: "FIRE RESISTANCE", classes: ["section-subheader"] },
        d: { content: "HORIZONTAL ASSEMBLY", classes: ["section-subheader"] },
        e: { content: "", classes: ["section-subheader"] },
        f: { content: "", classes: ["section-subheader"] },
        g: { content: "", classes: ["section-subheader"] },
        h: { content: "RATING (Hrs)", classes: ["section-subheader"] },
        i: {
          content: "SUPPORTING ASSEMBLY (Hrs)",
          classes: ["section-subheader"],
        },
        j: {
          content: "NONCOMBUSTIBLE IN LIEU OF RATING?",
          classes: ["section-subheader"],
        },
        k: { content: "", classes: ["section-subheader"] },
        l: {
          content: "OBC 3.2.2.20-83., 3.2.1.2., 3.2.1.4., 3.2.2.15.",
          classes: ["section-subheader"],
        },
        m: { content: "", classes: ["section-subheader"] },
        n: { content: "", classes: ["section-subheader"] },
        o: { content: "Notes", classes: ["section-subheader", "notes-column"] },
      },
    },

    // Row 67: Storeys Below Grade
    7.67: {
      id: "7.67",
      rowId: "7.67",
      label: "Storeys Below Grade",
      cells: {
        d: { content: "Storeys Below Grade" },
        h: {
          fieldId: "h_67",
          type: "dropdown",
          dropdownId: "dd_h_67",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.fireRatings,
        },
        i: {
          fieldId: "i_67",
          type: "dropdown",
          dropdownId: "dd_i_67",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.fireRatings,
        },
        j: {
          fieldId: "j_67",
          type: "dropdown",
          dropdownId: "dd_j_67",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.yesNoOptions,
        },
        o: {
          fieldId: "o_67",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 68: Floors Over Basement
    7.68: {
      id: "7.68",
      rowId: "7.68",
      label: "Floors Over Basement",
      cells: {
        d: { content: "Floors Over Basement" },
        h: {
          fieldId: "h_68",
          type: "dropdown",
          dropdownId: "dd_h_68",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.fireRatings,
        },
        i: {
          fieldId: "i_68",
          type: "dropdown",
          dropdownId: "dd_i_68",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.fireRatings,
        },
        j: {
          fieldId: "j_68",
          type: "dropdown",
          dropdownId: "dd_j_68",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.yesNoOptions,
        },
        o: {
          fieldId: "o_68",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 69: Floors
    7.69: {
      id: "7.69",
      rowId: "7.69",
      label: "Floors",
      cells: {
        d: { content: "Floors" },
        h: {
          fieldId: "h_69",
          type: "dropdown",
          dropdownId: "dd_h_69",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.fireRatings,
        },
        i: {
          fieldId: "i_69",
          type: "dropdown",
          dropdownId: "dd_i_69",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.fireRatings,
        },
        j: {
          fieldId: "j_69",
          type: "dropdown",
          dropdownId: "dd_j_69",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.yesNoOptions,
        },
        o: {
          fieldId: "o_69",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 70: Mezzanine
    "7.70": {
      id: "7.70",
      rowId: "7.70",
      label: "Mezzanine",
      cells: {
        d: { content: "Mezzanine" },
        h: {
          fieldId: "h_70",
          type: "dropdown",
          dropdownId: "dd_h_70",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.fireRatings,
        },
        i: {
          fieldId: "i_70",
          type: "dropdown",
          dropdownId: "dd_i_70",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.fireRatings,
        },
        j: {
          fieldId: "j_70",
          type: "dropdown",
          dropdownId: "dd_j_70",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.yesNoOptions,
        },
        o: {
          fieldId: "o_70",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 71: Roof
    7.71: {
      id: "7.71",
      rowId: "7.71",
      label: "Roof",
      cells: {
        d: { content: "Roof" },
        j: { content: "N/A" },
        o: {
          fieldId: "o_71",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 72: 3.22 Spatial Separation - INTERMEDIATE HEADER ROW
    7.72: {
      id: "7.72",
      rowId: "7.72",
      label: "Spatial Separation",
      cells: {
        b: { content: "3.22", classes: ["section-subheader"] },
        c: { content: "", classes: ["section-subheader"] },
        d: { content: "Spatial Separation", classes: ["section-subheader"] },
        e: { content: "EBF AREA (m²)", classes: ["section-subheader"] },
        f: { content: "L.D. (m)", classes: ["section-subheader"] },
        g: { content: "L/H OR H/L", classes: ["section-subheader"] },
        h: {
          content: "% UPO PERMITTED / ACTUAL",
          classes: ["section-subheader"],
        },
        i: { content: "REQUIRED FRR (H)", classes: ["section-subheader"] },
        j: { content: "CONSTRUCTION TYPE", classes: ["section-subheader"] },
        k: { content: "CLADDING TYPE", classes: ["section-subheader"] },
        l: { content: "OBC 3.2.3.", classes: ["section-subheader"] },
        m: { content: "", classes: ["section-subheader"] },
        n: { content: "", classes: ["section-subheader"] },
        o: {
          content: "Notes",
          classes: ["section-subheader", "notes-column"],
        },
      },
    },

    // Row 73: Spatial Separation Row 1 - EXPANDABLE TRIGGER ROW
    7.73: {
      id: "7.73",
      rowId: "7.73",
      label: "Spatial Separation 1",
      cells: {
        a: {
          content: "", // Will be populated by ExpandableRows utility
          classes: ["expandable-row-trigger"],
          attributes: {
            "data-expandable-group": "spatial-separation",
            "data-expandable-rows": "7.74,7.75,7.76",
            "data-default-visible": "1", // Shows only the trigger row initially
          },
        },
        b: { content: "73" },
        c: { content: "" },
        d: {
          fieldId: "d_73",
          type: "editable",
          value: "Exposing Face",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        e: {
          fieldId: "e_73",
          type: "num-editable",
          value: "0",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        f: {
          fieldId: "f_73",
          type: "num-editable",
          value: "0",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        g: {
          fieldId: "g_73",
          type: "editable",
          value: "/",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        h: {
          fieldId: "h_73",
          type: "editable",
          value: "/",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        i: {
          fieldId: "i_73",
          type: "dropdown",
          dropdownId: "dd_i_73",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.fireRatings,
        },
        j: {
          fieldId: "j_73",
          type: "dropdown",
          dropdownId: "dd_j_73",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-md"],
          options: dropdownOptions.constructionTypeOptions,
        },
        k: {
          fieldId: "k_73",
          type: "dropdown",
          dropdownId: "dd_k_73",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-md"],
          options: dropdownOptions.claddingTypeOptions,
        },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_73",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 74: Spatial Separation Row 2 - EXPANDABLE ROW
    7.74: {
      id: "7.74",
      rowId: "7.74",
      label: "Spatial Separation 2",
      cells: {
        b: { content: "74" },
        c: { content: "" },
        d: {
          fieldId: "d_74",
          type: "editable",
          value: "Exposing Face",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        e: {
          fieldId: "e_74",
          type: "num-editable",
          value: "0",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        f: {
          fieldId: "f_74",
          type: "num-editable",
          value: "0",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        g: {
          fieldId: "g_74",
          type: "editable",
          value: "/",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        h: {
          fieldId: "h_74",
          type: "editable",
          value: "/",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        i: {
          fieldId: "i_74",
          type: "dropdown",
          dropdownId: "dd_i_74",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.fireRatings,
        },
        j: {
          fieldId: "j_74",
          type: "dropdown",
          dropdownId: "dd_j_74",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-md"],
          options: dropdownOptions.constructionTypeOptions,
        },
        k: {
          fieldId: "k_74",
          type: "dropdown",
          dropdownId: "dd_k_74",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-md"],
          options: dropdownOptions.claddingTypeOptions,
        },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_74",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 75: Spatial Separation Row 3 - EXPANDABLE ROW
    7.75: {
      id: "7.75",
      rowId: "7.75",
      label: "Spatial Separation 3",
      cells: {
        b: { content: "75" },
        c: { content: "" },
        d: {
          fieldId: "d_75",
          type: "editable",
          value: "Exposing Face",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        e: {
          fieldId: "e_75",
          type: "num-editable",
          value: "0",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        f: {
          fieldId: "f_75",
          type: "num-editable",
          value: "0",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        g: {
          fieldId: "g_75",
          type: "editable",
          value: "/",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        h: {
          fieldId: "h_75",
          type: "editable",
          value: "/",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        i: {
          fieldId: "i_75",
          type: "dropdown",
          dropdownId: "dd_i_75",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.fireRatings,
        },
        j: {
          fieldId: "j_75",
          type: "dropdown",
          dropdownId: "dd_j_75",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-md"],
          options: dropdownOptions.constructionTypeOptions,
        },
        k: {
          fieldId: "k_75",
          type: "dropdown",
          dropdownId: "dd_k_75",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-md"],
          options: dropdownOptions.claddingTypeOptions,
        },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_75",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 76: Spatial Separation Row 4 - EXPANDABLE ROW
    7.76: {
      id: "7.76",
      rowId: "7.76",
      label: "Spatial Separation 4",
      cells: {
        b: { content: "76" },
        c: { content: "" },
        d: {
          fieldId: "d_76",
          type: "editable",
          value: "Exposing Face",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        e: {
          fieldId: "e_76",
          type: "num-editable",
          value: "0",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        f: {
          fieldId: "f_76",
          type: "num-editable",
          value: "0",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        g: {
          fieldId: "g_76",
          type: "editable",
          value: "/",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        h: {
          fieldId: "h_76",
          type: "editable",
          value: "/",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
        },
        i: {
          fieldId: "i_76",
          type: "dropdown",
          dropdownId: "dd_i_76",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.fireRatings,
        },
        j: {
          fieldId: "j_76",
          type: "dropdown",
          dropdownId: "dd_j_76",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-md"],
          options: dropdownOptions.constructionTypeOptions,
        },
        k: {
          fieldId: "k_76",
          type: "dropdown",
          dropdownId: "dd_k_76",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-md"],
          options: dropdownOptions.claddingTypeOptions,
        },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_76",
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
  // EVENT HANDLING (OBC MATRIX PATTERN)
  //==========================================================================

  function initializeEventHandlers() {
    // Initializing Section 07 event handlers

    if (window.OBC?.StateManager?.initializeGlobalInputHandlers) {
      window.OBC.StateManager.initializeGlobalInputHandlers();
    }
  }

  function onSectionRendered() {
    // Section 07 rendered
    initializeEventHandlers();
    window.OBC.sect07.initialized = true;
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
