/**
 * OBC-Section05.js
 * Structural Requirements (Section 5) module for OBC Matrix
 *
 * Based on OBC Matrix Part 3 structure covering rows 53-57
 * Includes Importance Category and Seismic Category sections
 */

// Create section-specific namespace for global references
window.OBC = window.OBC || {};
window.OBC.sect05 = window.OBC.sect05 || {};
window.OBC.sect05.initialized = false;
window.OBC.sect05.userInteracted = false;

// Section 5: Structural Requirements Module
window.OBC.SectionModules.sect05 = (function () {
  //==========================================================================
  // SECTION CONFIGURATION
  //==========================================================================

  const SECTION_CONFIG = {
    name: "structuralRequirements",
    excelRowStart: 53,
    excelRowEnd: 57,
    hasCalculations: false,
    hasDropdowns: true,
    needsCSS: false,
  };

  //==========================================================================
  // DROPDOWN OPTIONS
  //==========================================================================

  const dropdownOptions = {
    importanceCategory: [
      { value: "Low", name: "Low" },
      { value: "Normal", name: "Normal" },
      { value: "High", name: "High" },
      { value: "Post-disaster", name: "Post-disaster" },
    ],

    // Conditional importance category modifiers based on main selection
    // Based on Lookups.csv: Tbl_ImpLow and Tbl_ImpHigh tables
    importanceCategoryModifiers: {
      Low: [
        { value: "-", name: "Select..." },
        { value: "Low Human Occupancy", name: "Low Human Occupancy" },
        { value: "Post-disaster Shelter", name: "Post-disaster Shelter" },
      ],
      Normal: [
        { value: "-", name: "Select..." },
        { value: "Minor Storage Building", name: "Minor Storage Building" },
        {
          value: "Explosive or Hazardous Substances",
          name: "Explosive or Hazardous Substances",
        },
      ],
      High: [
        { value: "-", name: "Select..." },
        {
          value: "Explosive or Hazardous Substances",
          name: "Explosive or Hazardous Substances",
        },
      ],
      "Post-disaster": [
        { value: "-", name: "Select..." },
        { value: "Post-disaster Shelter", name: "Post-disaster Shelter" },
        {
          value: "Explosive or Hazardous Substances",
          name: "Explosive or Hazardous Substances",
        },
      ],
    },

    seismicCategory: [
      { value: "-", name: "Select..." },
      { value: "SC1", name: "SC1" },
      { value: "SC2", name: "SC2" },
      { value: "SC3", name: "SC3" },
      { value: "SC4", name: "SC4" },
      { value: "SC5", name: "SC5" },
      { value: "SC6", name: "SC6" },
    ],

    siteClass: [
      { value: "-", name: "Select..." },
      { value: "A", name: "A - Hard Rock" },
      { value: "B", name: "B - Rock" },
      { value: "C", name: "C - Very Dense Soil/Soft Rock" },
      { value: "D", name: "D - Stiff Soil" },
      { value: "E", name: "E - Soft Soil" },
      { value: "F", name: "F - Other Soils" },
    ],

    seismicDesignRequired: [
      { value: "-", name: "Select..." },
      { value: "Required", name: "Required" },
      { value: "Not Required", name: "Not Required" },
      { value: "N/A", name: "N/A" },
    ],

    yesNoNA: [
      { value: "-", name: "Select..." },
      { value: "YES", name: "YES" },
      { value: "NO", name: "NO" },
      { value: "N/A", name: "N/A" },
    ],
  };

  //==========================================================================
  // CONSOLIDATED FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  const sectionRows = {
    // SUBHEADER ROW
    header: {
      id: "5.h",
      rowId: "5.h",
      label: "Structural Requirements Header",
      cells: {
        b: { content: "5.h" },
        c: {
          content: "STRUCTURAL REQUIREMENTS",
          classes: ["section-subheader"],
        },
        d: { content: "CATEGORY/CLASS", classes: ["section-subheader"] },
        e: { content: "E", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "G", classes: ["section-subheader"] },
        h: { content: "H", classes: ["section-subheader"] },
        i: { content: "I", classes: ["section-subheader"] },
        j: { content: "J", classes: ["section-subheader"] },
        k: { content: "K", classes: ["section-subheader"] },
        l: { content: "OBC REFERENCE", classes: ["section-subheader"] },
        m: { content: "M", classes: ["section-subheader"] },
        n: { content: "N", classes: ["section-subheader"] },
        o: { content: "Notes", classes: ["section-subheader", "notes-column"] },
      },
    },

    // Row 53: 3.16 Importance Category
    5.53: {
      id: "5.53",
      rowId: "5.53",
      label: "IMPORTANCE CATEGORY",
      cells: {
        b: { content: "3.16" },
        c: { label: "IMPORTANCE CATEGORY" },
        d: {
          fieldId: "d_53",
          type: "dropdown",
          dropdownId: "dd_d_53",
          value: "Low",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.importanceCategory,
        },
        e: {
          fieldId: "i_53", // Excel mapping: Column I, Row 53
          type: "dropdown",
          dropdownId: "dd_i_53", // Excel namespace: dd_i_53
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.importanceCategoryModifiers["Low"], // Default to Low options
        },
        l: { content: "4.1.2.1.(3), T4.1.2.1.B" },
        o: {
          fieldId: "o_53",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 54: 3.17 Seismic Category (NO dropdown - per Excel)
    5.54: {
      id: "5.54",
      rowId: "5.54",
      label: "SEISMIC CATEGORY",
      cells: {
        b: { content: "3.17" },
        c: { label: "SEISMIC CATEGORY" },
        d: { content: "-" }, // Static text, no dropdown per Excel
        l: { content: "4.1.8.4.(1)" },
        o: {
          fieldId: "o_54",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 55: Site Class (NO dropdown - per Excel)
    5.55: {
      id: "5.55",
      rowId: "5.55",
      label: "SITE CLASS",
      cells: {
        b: { content: "55" },
        c: { label: "SITE CLASS" },
        d: { content: "-" }, // Static text, no dropdown per Excel
        e: {
          fieldId: "e_55",
          type: "editable",
          value: "Site description...",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
          placeholder: "Describe site conditions",
        },
        l: { content: "T4.1.8.5.-B" },
        o: {
          fieldId: "o_55",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 56: Seismic Design Required
    5.56: {
      id: "5.56",
      rowId: "5.56",
      label: "SEISMIC DESIGN REQUIRED",
      cells: {
        b: { content: "56" },
        c: {
          label: "SEISMIC DESIGN REQUIRED FOR Table 4.1.8.18. items 6 to 22:",
        },
        i: {
          fieldId: "i_56",
          type: "dropdown",
          dropdownId: "dd_i_56",
          value: "-",
          section: SECTION_CONFIG.name,
          classes: ["dropdown-sm"],
          options: dropdownOptions.seismicDesignRequired,
        },
        l: { content: "4.1.8.18.(2)" },
        o: {
          fieldId: "o_56",
          type: "editable",
          value: "enter notes here...",
          section: SECTION_CONFIG.name,
          classes: ["notes-column", "user-input"],
        },
      },
    },

    // Row 57: Reason for Requirement
    5.57: {
      id: "5.57",
      rowId: "5.57",
      label: "REASON FOR REQUIREMENT",
      cells: {
        b: { content: "57" },
        c: { label: "REASON FOR REQUIREMENT" }, // ✅ FIXED: Moved to column C
        e: {
          fieldId: "e_57",
          type: "editable",
          value: "Neither SC1 nor SC2...",
          section: SECTION_CONFIG.name,
          classes: ["user-input"],
          placeholder: "Describe reasoning for seismic design requirement",
        },
        o: {
          fieldId: "o_57",
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

    // Add conditional dropdown options for importance category modifiers
    // Note: These will be dynamically updated based on the main category selection
    options["dd_i_53"] = dropdownOptions.importanceCategoryModifiers["Low"];

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
        {}, // Column A - empty spacer
        {}, // Column B - auto-populated
      ],
    };

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
  // CONDITIONAL DROPDOWN LOGIC
  //==========================================================================

  function updateImportanceCategoryModifier(importanceCategory) {
    const modifierDropdown = document.querySelector(
      '[data-dropdown-id="dd_i_53"]',
    );
    if (!modifierDropdown) {
      console.error("Section 05: Modifier dropdown not found");
      return;
    }

    // Get the appropriate options based on the selected importance category
    const options =
      dropdownOptions.importanceCategoryModifiers[importanceCategory] ||
      dropdownOptions.importanceCategoryModifiers["Low"];

    // Clear existing options
    modifierDropdown.innerHTML = "";

    // Add new options
    options.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.textContent = option.name;
      modifierDropdown.appendChild(optionElement);
    });

    // Reset to default selection
    modifierDropdown.value = "-";

    // Update state manager with correct Excel field mapping
    if (window.OBC?.StateManager?.setValue) {
      window.OBC.StateManager.setValue("i_53", "-", "user-modified"); // Excel Column I, Row 53
    }
  }

  //==========================================================================
  // EVENT HANDLING (OBC MATRIX PATTERN)
  //==========================================================================

  function initializeEventHandlers() {
    if (window.OBC?.StateManager?.initializeGlobalInputHandlers) {
      window.OBC.StateManager.initializeGlobalInputHandlers();
    }

    // Add conditional dropdown handling for importance category
    const importanceCategoryDropdown = document.querySelector(
      '[data-dropdown-id="dd_d_53"]',
    );
    if (importanceCategoryDropdown) {
      importanceCategoryDropdown.addEventListener("change", function (e) {
        updateImportanceCategoryModifier(e.target.value);
      });
    }
  }

  function onSectionRendered() {
    initializeEventHandlers();

    // Initialize the conditional dropdown with the default importance category value
    setTimeout(() => {
      const importanceCategoryDropdown = document.querySelector(
        '[data-dropdown-id="dd_d_53"]',
      );
      if (importanceCategoryDropdown) {
        updateImportanceCategoryModifier(
          importanceCategoryDropdown.value || "Low",
        );
      }
    }, 100); // Small delay to ensure DOM is ready

    window.OBC.sect05.initialized = true;
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
    updateImportanceCategoryModifier: updateImportanceCategoryModifier,
  };
})();
