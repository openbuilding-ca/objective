/**
 * OBC-Section10.js
 * Notes (Section 10) module for OBC Matrix
 *
 * Based on OBC Matrix Part 3 structure covering rows 90-96
 * Includes Notes and Footer Information
 */

// Create section-specific namespace for global references
window.OBC = window.OBC || {};
window.OBC.sect10 = window.OBC.sect10 || {};
window.OBC.sect10.initialized = false;
window.OBC.sect10.userInteracted = false;

// Section 10: Notes Module
window.OBC.SectionModules.sect10 = (function () {
  //==========================================================================
  // SECTION CONFIGURATION
  //==========================================================================

  const SECTION_CONFIG = {
    name: "notes",
    excelRowStart: 90,
    excelRowEnd: 96,
    hasCalculations: false,
    hasDropdowns: false,
    needsCSS: false,
  };

  //==========================================================================
  // CONSOLIDATED FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  const sectionRows = {
    // SUBHEADER ROW
    header: {
      id: "10.h",
      rowId: "10.h",
      label: "Notes Header",
      cells: {
        b: { content: "10.h", classes: ["section-subheader"] },
        c: { content: "NOTES", classes: ["section-subheader"] },
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
        o: { content: "O", classes: ["section-subheader"] },
      },
    },

    // Row 90: 3.00 Notes - EXPANDABLE TRIGGER ROW
    "10.90": {
      id: "10.90",
      rowId: "10.90",
      label: "NOTES",
      cells: {
        a: {
          content: "", // Will be populated by ExpandableRows utility
          classes: ["expandable-row-trigger"],
          attributes: {
            "data-expandable-group": "project-notes",
            "data-expandable-rows": "10.91,10.92,10.93,10.94,10.95",
            "data-default-visible": "1", // Shows only the trigger row initially
          },
        },
        b: { content: "3.00" },
        c: { content: "NOTES" },
        d: {
          fieldId: "d_90",
          type: "editable",
          value:
            "ie. Building permit application submitted 2024-06-01. Planning approval required for zoning compliance.",
          section: SECTION_CONFIG.name,
          classes: ["user-input", "notes-field"],
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
        o: { content: "" },
      },
    },

    // Row 91: Notes Content Line 1
    10.91: {
      id: "10.91",
      rowId: "10.91",
      label: "Notes Line 1",
      cells: {
        b: { content: "91" },
        c: { content: "" },
        d: {
          fieldId: "d_91",
          type: "editable",
          value:
            "ie. HCRA, Tarion and ONHWPA requirements in effect for All Residential Occupancies",
          section: SECTION_CONFIG.name,
          classes: ["user-input", "notes-field"],
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
        o: { content: "" },
      },
    },

    // Row 92: Notes Content Line 2
    10.92: {
      id: "10.92",
      rowId: "10.92",
      label: "Notes Line 2",
      cells: {
        b: { content: "92" },
        c: { content: "" },
        d: {
          fieldId: "d_92",
          type: "editable",
          value:
            "ie. CSA Standard CSA S-478 Durability In Buildings is applicable",
          section: SECTION_CONFIG.name,
          classes: ["user-input", "notes-field"],
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
        o: { content: "" },
      },
    },

    // Row 93: Notes Content Line 3
    10.93: {
      id: "10.93",
      rowId: "10.93",
      label: "Notes Line 3",
      cells: {
        b: { content: "93" },
        c: { content: "" },
        d: {
          fieldId: "d_93",
          type: "editable",
          value:
            "ie. All Doors and Windows shall be Designed and Installed per CSA requirements ie. AAMA/WDMA/CSA 101/I.S.2/A440",
          section: SECTION_CONFIG.name,
          classes: ["user-input", "notes-field"],
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
        o: { content: "" },
      },
    },

    // Row 94: Notes Content Line 4
    10.94: {
      id: "10.94",
      rowId: "10.94",
      label: "Notes Line 4",
      cells: {
        b: { content: "94" },
        c: { content: "" },
        d: {
          fieldId: "d_94",
          type: "editable",
          value:
            "ie. AHJ Attests that they have reviewed professional design at requirements of OAA/PEO Table @https://www.peo.on.ca/sites/default/files/2019-09/PEO-OAA%20Joint%20Bulletin.pdf and have checked that the Designers carry the requisite qualifications",
          section: SECTION_CONFIG.name,
          classes: ["user-input", "notes-field"],
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
        o: { content: "" },
      },
    },

    // Row 95: Notes Content Line 5
    10.95: {
      id: "10.95",
      rowId: "10.95",
      label: "Notes Line 5",
      cells: {
        b: { content: "95" },
        c: { content: "" },
        d: {
          fieldId: "d_95",
          type: "editable",
          value:
            "ie. Landscape architect: GHI Landscape Design. Tree preservation plan approved by City.",
          section: SECTION_CONFIG.name,
          classes: ["user-input", "notes-field"],
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
        o: { content: "" },
      },
    },

    // Row 96f: Combined Footer with OBC Reference and Copyright
    "10.96f": {
      id: "10.96f",
      rowId: "10.96f",
      label: "Combined Footer",
      cells: {
        d: {
          content:
            "ALL REFERENCES ARE TO DIVISION B OF THE OBC UNLESS PRECEDED BY [A] FOR DIVISION A AND [C] FOR DIVISION C\n© Ontario Association of Architects",
          classes: ["footer-note-wide"],
          attributes: {
            colspan: "6",
          },
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
    // No dropdowns in Notes section
    return {};
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
    // Initializing Section 10 event handlers

    if (window.OBC?.StateManager?.initializeGlobalInputHandlers) {
      window.OBC.StateManager.initializeGlobalInputHandlers();
    }
  }

  function onSectionRendered() {
    // Section 10 rendered
    initializeEventHandlers();
    window.OBC.sect10.initialized = true;
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
