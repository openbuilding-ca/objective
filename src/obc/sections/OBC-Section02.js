/**
 * OBC-Section02.js
 * Building Occupancy (Section 2) module for OBC Matrix
 *
 * This file contains field definitions, layout templates, and rendering logic
 * specific to the Building Occupancy section for the OBC Matrix application.
 *
 * Based on OBC Matrix Part 3 structure covering rows 10-20 with user inputs in column D.
 */

// Create section-specific namespace for global references
window.OBC = window.OBC || {};
window.OBC.sect02 = window.OBC.sect02 || {};
window.OBC.sect02.initialized = false;
window.OBC.sect02.userInteracted = false;

// Section 2: Building Occupancy Module
window.OBC.SectionModules.sect02 = (function () {
  //==========================================================================
  // CONSOLIDATED FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  // Define shared occupancy options (used by all occupancy dropdowns)
  const occupancyOptions = [
    { value: "-", name: "Select Occupancy Classification" },
    { value: "A1", name: "A1-Performing Arts (Viewing and Production)" },
    { value: "A2", name: "A2-Other assembly occupancies" },
    { value: "A3", name: "A3-Arenas" },
    { value: "A4", name: "A4-Open-Air Assemblies" },
    { value: "B1", name: "B1-Detention Occupancies" },
    { value: "B2", name: "B2-Care and Treatment Occupancies" },
    { value: "B3", name: "B3-Care Occupancies" },
    { value: "C", name: "C-Residential" },
    { value: "D", name: "D-Business & Personal Services" },
    { value: "E", name: "E-Mercantile" },
    { value: "F1", name: "F1-High Hazard Industrial" },
    { value: "F2", name: "F2-Medium Hazard Industrial" },
    { value: "F3", name: "F3-Low Hazard Industrial" },
    { value: "G1", name: "G1-High-hazard Agricultural Occupancies" },
    {
      value: "G2",
      name: "G2-Agricultural Occupancies not Elsewhere Classified in Group G",
    },
    { value: "G3", name: "G3-Greenhouse Agricultural Occupancies" },
    {
      value: "G4",
      name: "G4-Agricultural Occupancies with no Human Occupants",
    },
  ];

  // Define rows with integrated field definitions
  const sectionRows = {
    // HEADER ROW
    header: {
      id: "2.00",
      rowId: "2.00",
      label: "Building Occupancy",
      cells: {
        b: { content: "B", classes: ["section-subheader"] },
        c: { content: "", classes: ["section-subheader"] },
        d: {
          content: "O.Reg. 163/24 | LAST CODE AMENDMENT | O.Reg. 447/24",
          classes: ["section-subheader"],
        },
        e: { content: "", classes: ["section-subheader"] },
        f: { content: "", classes: ["section-subheader"] },
        g: { content: "", classes: ["section-subheader"] },
        h: { content: "", classes: ["section-subheader"] },
        i: { content: "", classes: ["section-subheader"] },
        j: { content: "", classes: ["section-subheader"] },
        k: { content: "", classes: ["section-subheader"] },
        l: { content: "OBC [A] 1.3.3.2.", classes: ["section-subheader"] },
        m: { content: "", classes: ["section-subheader"] },
        n: { content: "", classes: ["section-subheader"] },
        o: {
          content: "Notes",
          classes: ["section-subheader", "notes-column"],
        },
      },
    },

    // Row 2.11: 3.01 Project Type
    2.11: {
      id: "2.11",
      rowId: "2.11",
      label: "PROJECT TYPE",
      cells: {
        b: { label: "3.01" },
        c: { label: "PROJECT TYPE" },
        d: {
          fieldId: "d_11",
          type: "dropdown",
          dropdownId: "dd_d_11",
          value: "-",
          section: "buildingOccupancy",
          classes: ["dropdown-md"],
          options: [
            { value: "-", name: "Select Project Type" },
            { value: "New Construction", name: "New Construction" },
            { value: "Addition", name: "Addition" },
            { value: "Renovation", name: "Renovation" },
            { value: "Addition & Renovation", name: "Addition & Renovation" },
            { value: "Change of Use", name: "Change of Use" },
          ],
        },
        e: {
          fieldId: "e_11",
          type: "editable",
          value:
            "Enter description... ie. 'New 1000 sq. ft. restaurant with 200 sq. ft. kitchen'",
          section: "buildingOccupancy",
          classes: ["no-wrap"],
          colspan: 6, // Span columns E-J
        },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "", classes: ["obc-reference"] },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_11",
          type: "editable",
          value: "enter notes here...",
          section: "buildingOccupancy",
          classes: ["no-wrap", "notes-column"],
        },
      },
    },

    // Row 2.13: 3.02 Major Occupancy Classification Header
    2.13: {
      id: "2.13",
      rowId: "2.13",
      label: "MAJOR OCCUPANCY CLASSIFICATION",
      cells: {
        b: { label: "3.02", classes: ["section-subheader"] },
        c: {
          label: "MAJOR OCCUPANCY CLASSIFICATION",
          classes: ["section-subheader"],
        },
        d: { label: "OCCUPANCY TYPE", classes: ["section-subheader"] },
        e: { label: "USE DESCRIPTION", classes: ["section-subheader"] },
        f: { content: "", classes: ["section-subheader"] },
        g: { content: "", classes: ["section-subheader"] },
        h: { content: "", classes: ["section-subheader"] },
        i: { content: "", classes: ["section-subheader"] },
        j: { content: "", classes: ["section-subheader"] },
        k: { content: "", classes: ["section-subheader"] },
        l: {
          content: "OBC 3.1.2.",
          classes: ["section-subheader", "obc-reference"],
        },
        m: { content: "", classes: ["section-subheader"] },
        n: { content: "", classes: ["section-subheader"] },
        o: { content: "", classes: ["section-subheader", "notes-column"] },
      },
    },

    // Row 2.14: First occupancy dropdown row (with expand/collapse button)
    2.14: {
      id: "2.14",
      rowId: "2.14",
      label: "",
      cells: {
        a: {
          content: "", // Will be populated by ExpandableRows utility
          classes: ["expandable-row-trigger"],
          attributes: {
            "data-expandable-group": "occupancy-classifications",
            "data-expandable-rows": "2.15,2.16,2.17,2.18",
            "data-default-visible": "1",
          },
        },
        b: { content: "14" },
        c: { content: "" },
        d: {
          fieldId: "d_14",
          type: "dropdown",
          dropdownId: "dd_d_14",
          value: "A2",
          section: "buildingOccupancy",
          options: occupancyOptions,
          classes: ["dropdown-md"],
        },
        e: {
          fieldId: "e_14",
          type: "editable",
          value: 'Provide Description of Use, ie. "Restaurant"', //, ie. "Restaurant", "Medical Office", etc. (to be added as tooltip)
          section: "buildingOccupancy",
          classes: ["no-wrap"],
          colspan: 6, // Span columns E-J
        },
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
          fieldId: "o_14",
          type: "editable",
          value: "enter notes here...",
          section: "buildingOccupancy",
          classes: ["no-wrap", "notes-column"],
        },
      },
    },

    // Row 2.15: Second occupancy dropdown row
    2.15: {
      id: "2.15",
      rowId: "2.15",
      label: "",
      cells: {
        b: { content: "15.0" },
        c: { content: "" },
        d: {
          fieldId: "d_15",
          type: "dropdown",
          dropdownId: "dd_d_15",
          value: "F1",
          section: "buildingOccupancy",
          options: occupancyOptions,
          classes: ["dropdown-md"],
        },
        e: {
          fieldId: "e_15",
          type: "editable",
          value: "Provide Description of Use", //, ie. "Restaurant", "Medical Office", etc. (to be added as tooltip)
          section: "buildingOccupancy",
          classes: ["no-wrap"],
          colspan: 6, // Span columns E-J
        },
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
          fieldId: "o_15",
          type: "editable",
          value: "enter notes here...",
          section: "buildingOccupancy",
          classes: ["no-wrap", "notes-column"],
        },
      },
    },

    // Row 2.16: Third occupancy dropdown row
    2.16: {
      id: "2.16",
      rowId: "2.16",
      label: "",
      cells: {
        b: { content: "16.0" },
        c: { content: "" },
        d: {
          fieldId: "d_16",
          type: "dropdown",
          dropdownId: "dd_d_16",
          value: "A3",
          section: "buildingOccupancy",
          options: occupancyOptions,
          classes: ["dropdown-md"],
        },
        e: {
          fieldId: "e_16",
          type: "editable",
          value: "Provide Description of Use", //, ie. "Restaurant", "Medical Office", etc. (to be added as tooltip)
          section: "buildingOccupancy",
          classes: ["no-wrap"],
          colspan: 6, // Span columns E-J
        },
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
          fieldId: "o_16",
          type: "editable",
          value: "enter notes here...",
          section: "buildingOccupancy",
          classes: ["no-wrap", "notes-column"],
        },
      },
    },

    // Row 2.17: Fourth occupancy dropdown row
    2.17: {
      id: "2.17",
      rowId: "2.17",
      label: "",
      cells: {
        b: { content: "17.0" },
        c: { content: "" },
        d: {
          fieldId: "d_17",
          type: "dropdown",
          dropdownId: "dd_d_17",
          value: "B1",
          section: "buildingOccupancy",
          options: occupancyOptions,
          classes: ["dropdown-md"],
        },
        e: {
          fieldId: "e_17",
          type: "editable",
          value: "Provide Description of Use", //, ie. "Restaurant", "Medical Office", etc. (to be added as tooltip)
          section: "buildingOccupancy",
          classes: ["no-wrap"],
          colspan: 6, // Span columns E-J
        },
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
          fieldId: "o_17",
          type: "editable",
          value: "enter notes here...",
          section: "buildingOccupancy",
          classes: ["no-wrap", "notes-column"],
        },
      },
    },

    // Row 2.18: Fifth occupancy dropdown row
    2.18: {
      id: "2.18",
      rowId: "2.18",
      label: "",
      cells: {
        b: { content: "18.0" },
        c: { content: "" },
        d: {
          fieldId: "d_18",
          type: "dropdown",
          dropdownId: "dd_d_18",
          value: "E",
          section: "buildingOccupancy",
          options: occupancyOptions,
          classes: ["dropdown-md"],
        },
        e: {
          fieldId: "e_18",
          type: "editable",
          value: "Provide Description of Use", //, ie. "Restaurant", "Medical Office", etc. (to be added as tooltip)
          section: "buildingOccupancy",
          classes: ["no-wrap"],
          colspan: 6, // Span columns E-J
        },
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
          fieldId: "o_18",
          type: "editable",
          value: "enter notes here...",
          section: "buildingOccupancy",
          classes: ["no-wrap", "notes-column"],
        },
      },
    },

    // Row 2.19: 3.03 Superimposed Major Occupancies
    2.19: {
      id: "2.19",
      rowId: "2.19",
      label: "Superimposed Major Occupancies",
      cells: {
        b: { label: "3.03" },
        c: { label: "Superimposed Major Occupancies" },
        d: {
          fieldId: "d_19",
          type: "dropdown",
          dropdownId: "dd_d_19",
          value: "-",
          section: "buildingOccupancy",
          classes: ["dropdown-sm"],
          options: [
            { value: "-", name: "Select Yes/No" },
            { value: "Yes", name: "Yes" },
            { value: "No", name: "No" },
          ],
        },
        e: {
          fieldId: "e_19",
          type: "editable",
          value: "If Yes, provide explanation here...",
          section: "buildingOccupancy",
          classes: ["no-wrap"],
          colspan: 6, // Span columns E-J
        },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "3.2.2.7.", classes: ["obc-reference"] },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_19",
          type: "editable",
          value: "enter notes here...",
          section: "buildingOccupancy",
          classes: ["no-wrap", "notes-column"],
        },
      },
    },
  };

  //==========================================================================
  // UTILITY FUNCTIONS
  //==========================================================================

  function getFields() {
    const fields = {};
    Object.keys(sectionRows).forEach((rowKey) => {
      const row = sectionRows[rowKey];
      Object.keys(row.cells).forEach((cellKey) => {
        const cell = row.cells[cellKey];
        if (cell.fieldId) {
          fields[cell.fieldId] = {
            type: cell.type,
            value: cell.value,
            section: cell.section,
            min: cell.min,
            max: cell.max,
            step: cell.step,
            options: cell.options,
            dropdownId: cell.dropdownId,
            classes: cell.classes,
            placeholder: cell.placeholder,
            colspan: cell.colspan,
            span: cell.span,
          };
        }
      });
    });
    return fields;
  }

  function getDropdownOptions() {
    const dropdowns = {};
    Object.keys(sectionRows).forEach((rowKey) => {
      const row = sectionRows[rowKey];
      Object.keys(row.cells).forEach((cellKey) => {
        const cell = row.cells[cellKey];
        if (cell.type === "dropdown" && cell.options) {
          dropdowns[cell.dropdownId || cell.fieldId] = cell.options;
        }
      });
    });
    return dropdowns;
  }

  function getLayout() {
    // Process rows in specific order: header first, then all other rows
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

  function createLayoutRow(row) {
    // Create standard row structure
    const rowDef = {
      id: row.id,
      cells: [
        {}, // Empty column A (will be populated if row has 'a' cell)
        {}, // ID column B (auto-populated)
      ],
    };

    // Handle column A if defined
    if (row.cells && row.cells.a) {
      rowDef.cells[0] = { ...row.cells.a };
    }

    // Add cells C through O based on the row definition (matching Excel structure)
    // Skip "b" since Column B is auto-populated by FieldManager
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

  //==========================================================================
  // STATE MANAGEMENT
  //==========================================================================

  function getFieldValue(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return "";

    if (field.type === "checkbox") {
      return field.checked;
    } else if (field.type === "number" || field.type === "range") {
      return parseFloat(field.value) || 0;
    } else {
      return field.value || "";
    }
  }

  function getNumericValue(fieldId, defaultValue = 0) {
    const value = getFieldValue(fieldId);
    const numericValue = parseFloat(value);
    return isNaN(numericValue) ? defaultValue : numericValue;
  }

  function setCalculatedValue(fieldId, value) {
    const element = document.getElementById(fieldId);
    if (element) {
      if (typeof value === "number") {
        element.textContent = value.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
      } else {
        element.textContent = value;
      }
    }
  }

  //==========================================================================
  // EXPANDABLE OCCUPANCY ROWS - Now handled by universal ExpandableRows utility
  //==========================================================================

  // Legacy functions kept for backward compatibility (now use universal system)
  function toggleOccupancyRows() {
    console.log("Legacy toggleOccupancyRows called - using universal system");
    if (window.OBC?.ExpandableRows) {
      window.OBC.ExpandableRows.addRow("occupancy-classifications");
    }
  }

  function addOccupancyRow() {
    if (window.OBC?.ExpandableRows) {
      window.OBC.ExpandableRows.addRow("occupancy-classifications");
    }
  }

  function removeOccupancyRow() {
    if (window.OBC?.ExpandableRows) {
      window.OBC.ExpandableRows.removeRow("occupancy-classifications");
    }
  }

  // Make functions available globally for backward compatibility
  window.OBC.sect02.toggleOccupancyRows = toggleOccupancyRows;
  window.OBC.sect02.addOccupancyRow = addOccupancyRow;
  window.OBC.sect02.removeOccupancyRow = removeOccupancyRow;

  //==========================================================================
  // EVENT HANDLERS
  //==========================================================================

  function initializeEventHandlers() {
    // Initializing Section 02 event handlers

    // ✅ MANDATORY: Use global input handler for graceful behavior
    if (window.OBC?.StateManager?.initializeGlobalInputHandlers) {
      window.OBC.StateManager.initializeGlobalInputHandlers();
    }

    window.OBC.sect02.initialized = true;
  }

  function onSectionRendered() {
    // Section 02 rendered - Building Occupancy (OBC Matrix)

    // Initialize any section-specific functionality after rendering
    if (!window.OBC.sect02.initialized) {
      initializeEventHandlers();
    }

    // Note: Expandable rows are now handled by the universal ExpandableRows utility
    // which auto-initializes after rendering is complete
  }

  // CSS styles are now handled by the universal ExpandableRows utility

  //==========================================================================
  // PUBLIC API
  //==========================================================================

  return {
    getFields: getFields,
    getDropdownOptions: getDropdownOptions,
    getLayout: getLayout,
    onSectionRendered: onSectionRendered,

    // State management functions
    getFieldValue: getFieldValue,
    getNumericValue: getNumericValue,
    setCalculatedValue: setCalculatedValue,

    // Legacy expandable rows functions (now handled by universal system)
    toggleOccupancyRows: toggleOccupancyRows,
    addOccupancyRow: addOccupancyRow,
    removeOccupancyRow: removeOccupancyRow,
  };
})();
