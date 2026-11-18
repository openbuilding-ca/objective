/**
 * 4012-Section09.js
 * Occupant + Internal Gains (Section 9) module for TEUI Calculator 4.012
 *
 * Uses the consolidated declarative approach where field definitions
 * are integrated directly into the layout structure.
 *
 * ✅ SMOOTH-MOVE-S02: No d_13 listeners - PH values from ReferenceValues.js
 * d_65/d_66 (plug loads) come from ReferenceValues.js via "Set Values" button
 * d_13 changes are passive until user triggers Import Quarantine workflow
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

// Create a section-specific namespace for global references
window.TEUI.sect09 = window.TEUI.sect09 || {};

// Global variable to track initialization state
window.TEUI.sect09.initialized = false;
window.TEUI.sect09.userInteracted = false;

// Section 9: Occupant + Internal Gains Module
window.TEUI.SectionModules.sect09 = (function () {
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
  // CONSOLIDATED FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  // Define rows with integrated field definitions
  const sectionRows = {
    // UNIT SUBHEADER - MUST COME FIRST
    header: {
      id: "09-ID",
      rowId: "09-ID",
      label: "Internal Gains Units",
      cells: {
        c: { content: "C", classes: ["section-subheader"] },
        d: { content: "Unit Qty", classes: ["section-subheader"] },
        e: { content: "E", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "G", classes: ["section-subheader"] },
        h: { content: "Annual\nkWh/yr", classes: ["section-subheader"] },
        i: {
          content: "Htg Gain\nkWh/yr",
          classes: ["section-subheader", "text-right"],
        },
        j: { content: "Htg Gain\n%", classes: ["section-subheader"] },
        k: { content: "Cooling Gain\nkWh/yr", classes: ["section-subheader"] },
        l: { content: "Htg Gain\n%", classes: ["section-subheader"] },
        m: { content: "Reference", classes: ["section-subheader"] },
        n: { content: "N", classes: ["section-subheader"] },
      },
    },

    // Row 63: G.1.1 Occupants per Building (declared)
    63: {
      id: "G.1.1",
      rowId: "G.1.1",
      label: "Occupants per Building (declared)",
      cells: {
        c: { label: "Occupants per Building (declared)" },
        d: {
          fieldId: "d_63",
          semanticPath: "internal.occupants.count",
          type: "editable",
          value: "126",
          section: "occupantInternalGains",
          classes: ["user-input"],
          tooltip: true, // Occupants
          label: "Occupant Count",
        },
        e: { content: "G.1.3", classes: ["label-prefix"] },
        f: { content: "Occupied Hrs/Day", classes: ["label-main"] },
        g: {
          fieldId: "g_63",
          semanticPath: "internal.occupants.hoursPerDay",
          type: "dropdown",
          dropdownId: "dd_g_63",
          value: "12",
          section: "occupantInternalGains",
          tooltip: true, // Occupied Hours
          label: "Occupied Hours/Day",
          options: [
            { value: "0", name: "0" },
            { value: "8", name: "8" },
            { value: "10", name: "10" },
            { value: "12", name: "12" },
            { value: "16", name: "16" },
            { value: "24", name: "24" },
          ],
        },
        i: {
          fieldId: "i_63",
          semanticPath: "internal.occupants.hoursPerYear",
          type: "calculated",
          value: "4380",
          section: "occupantInternalGains",
          dependencies: ["g_63"],
          classes: ["text-right"],
          label: "Annual Occupied Hours",
        },
        j: { content: "/ 8760", classes: ["text-left"] },
        // Bedrooms per dwelling unit, and the dwelling units: a Part 9
        // building's ventilation rule, OBC Table 9.32.3.3 - units x the
        // minimum for the bedrooms (V.1.4; VentilationRates.js). "From
        // occupants" ("") derives the bedrooms: occupants per unit - 1, at
        // least 1.
        k: { content: "Bedrooms / Units", classes: ["label-main"] },
        l: {
          fieldId: "l_63",
          semanticPath: "occupancy.bedrooms",
          type: "dropdown",
          dropdownId: "dd_l_63",
          value: "",
          section: "occupantInternalGains",
          tooltip: true,
          label: "Bedrooms (Part 9 dwelling unit)",
          options: [
            { value: "", name: "From occupants" },
            { value: "1", name: "1" },
            { value: "2", name: "2" },
            { value: "3", name: "3" },
            { value: "4", name: "4" },
            { value: "5", name: "5" },
            { value: "More than 5", name: "More than 5" },
          ],
        },
        m: {
          fieldId: "m_63",
          semanticPath: "occupancy.dwellingUnits",
          type: "editable",
          value: "1",
          section: "occupantInternalGains",
          classes: ["user-input"],
          tooltip: true,
          label: "Dwelling Units",
        },
      },
    },

    // Row 64: G.1.2 Occupant Activity
    64: {
      id: "G.1.2",
      rowId: "G.1.2",
      label: "Occupant Activity",
      cells: {
        c: { label: "Occupant Activity" },
        d: {
          fieldId: "d_64",
          semanticPath: "internal.occupants.activityLevel",
          type: "dropdown",
          dropdownId: "dd_d_64",
          value: "Normal",
          section: "occupantInternalGains",
          tooltip: true, // Average Daily Metabolic Rate
          label: "Occupant Activity Level",
          options: [
            { value: "Relaxed", name: "Relaxed" },
            { value: "Normal", name: "Normal" },
            { value: "Active", name: "Active" },
            { value: "Hyperactive", name: "Hyperactive" },
          ],
        },
        e: { content: "G.1.4", classes: ["label-prefix"] },
        f: { content: "Watts/pp (S+L)", classes: ["label-main"] },
        g: {
          fieldId: "g_64",
          semanticPath: "internal.occupants.wattsPerPerson",
          type: "calculated",
          value: "117",
          section: "occupantInternalGains",
          dependencies: ["d_64"],
          label: "Occupant Heat Output: W/person",
        },
        h: {
          fieldId: "h_64",
          semanticPath: "internal.occupants.annualEnergy",
          type: "calculated",
          value: "64,696.02",
          section: "occupantInternalGains",
          dependencies: ["g_64", "d_63", "g_63"],
          label: "Total Occupant Energy: kWh/yr",
        },
        i: {
          fieldId: "i_64",
          semanticPath: "internal.occupants.heatingGain",
          type: "calculated",
          value: "43,426.10",
          section: "occupantInternalGains",
          dependencies: ["h_64", "m_19"],
          label: "Occupant Heating Gain: kWh/yr",
        },
        j: {
          fieldId: "j_64",
          semanticPath: "internal.occupants.heatingGainPercent",
          type: "calculated",
          value: "43.39%",
          section: "occupantInternalGains",
          dependencies: ["i_64", "i_71"],
          label: "Occupant Heating Gain: %",
        },
        k: {
          fieldId: "k_64",
          semanticPath: "internal.occupants.coolingGain",
          type: "calculated",
          value: "21,269.93",
          section: "occupantInternalGains",
          dependencies: ["h_64", "m_19"],
          label: "Occupant Cooling Gain: kWh/yr",
        },
        l: {
          fieldId: "l_64",
          semanticPath: "internal.occupants.coolingGainPercent",
          type: "calculated",
          value: "43.39%",
          section: "occupantInternalGains",
          dependencies: ["k_64", "k_71"],
          label: "Occupant Cooling Gain: %",
        },
      },
    },

    // Row 65: P.1 Plug Loads
    65: {
      id: "P.1",
      rowId: "P.1",
      label: "Plug Loads",
      cells: {
        c: { label: "Plug Loads" },
        d: {
          fieldId: "d_65",
          semanticPath: "internal.plugLoad.density",
          type: "calculated",
          value: "7",
          section: "occupantInternalGains",
          tooltip: true, // Default determined by Occupancy
          conditionalDeps: ["d_13", "d_12"],
          label: "Plug Load Density: W/m²",
        },
        h: {
          fieldId: "h_65",
          semanticPath: "internal.plugLoad.annualEnergy",
          type: "calculated",
          value: "43,757.95",
          section: "occupantInternalGains",
          dependencies: ["i_65", "k_65"],
          label: "Plug Load Energy: kWh/yr",
        },
        i: {
          fieldId: "i_65",
          semanticPath: "internal.plugLoad.heatingGain",
          type: "calculated",
          value: "29,371.78",
          section: "occupantInternalGains",
          dependencies: ["d_65", "i_63", "h_15", "m_19"],
          label: "Plug Load Heating Gain: kWh/yr",
        },
        j: {
          fieldId: "j_65",
          semanticPath: "internal.plugLoad.heatingGainPercent",
          type: "calculated",
          value: "29.35%",
          section: "occupantInternalGains",
          dependencies: ["i_65", "i_71"],
          label: "Plug Load Heating Gain: %",
        },
        k: {
          fieldId: "k_65",
          semanticPath: "internal.plugLoad.coolingGain",
          type: "calculated",
          value: "14,386.18",
          section: "occupantInternalGains",
          dependencies: ["d_65", "i_63", "h_15", "m_19"],
          label: "Plug Load Cooling Gain: kWh/yr",
        },
        l: {
          fieldId: "l_65",
          semanticPath: "internal.plugLoad.coolingGainPercent",
          type: "calculated",
          value: "29.35%",
          section: "occupantInternalGains",
          dependencies: ["k_65", "k_71"],
          label: "Plug Load Cooling Gain: %",
        },
        m: {
          fieldId: "m_65",
          semanticPath: "internal.plugLoad.compliance",
          type: "calculated",
          value: "100%",
          section: "occupantInternalGains",
          dependencies: ["d_65", "ref_d_65"],
          label: "Plug Load Compliance: %",
        },
        n: {
          fieldId: "n_65",
          semanticPath: "internal.plugLoad.complianceStatus",
          type: "calculated",
          value: "✓",
          section: "occupantInternalGains",
          dependencies: ["m_65"],
          label: "Plug Load Compliance Status",
        },
      },
    },

    // Row 66: P.2 Lighting Loads
    66: {
      id: "P.2",
      rowId: "P.2",
      label: "Lighting Loads",
      cells: {
        c: { label: "Lighting Loads" },
        d: {
          fieldId: "d_66",
          semanticPath: "internal.lighting.density",
          type: "editable",
          value: "1.5",
          section: "occupantInternalGains",
          classes: ["user-input"],
          tooltip: true, // Default is 1.5
          label: "Lighting Density: W/m²",
        },
        h: {
          fieldId: "h_66",
          semanticPath: "internal.lighting.annualEnergy",
          type: "calculated",
          value: "9,376.70",
          section: "occupantInternalGains",
          dependencies: ["i_66", "k_66"],
          label: "Lighting Energy: kWh/yr",
        },
        i: {
          fieldId: "i_66",
          semanticPath: "internal.lighting.heatingGain",
          type: "calculated",
          value: "6,293.95",
          section: "occupantInternalGains",
          dependencies: ["d_66", "i_63", "h_15", "m_19"],
          label: "Lighting Heating Gain: kWh/yr",
        },
        j: {
          fieldId: "j_66",
          semanticPath: "internal.lighting.heatingGainPercent",
          type: "calculated",
          value: "6.29%",
          section: "occupantInternalGains",
          dependencies: ["i_66", "i_71"],
          label: "Lighting Heating Gain: %",
        },
        k: {
          fieldId: "k_66",
          semanticPath: "internal.lighting.coolingGain",
          type: "calculated",
          value: "3,082.75",
          section: "occupantInternalGains",
          dependencies: ["d_66", "i_63", "h_15", "m_19"],
          label: "Lighting Cooling Gain: kWh/yr",
        },
        l: {
          fieldId: "l_66",
          semanticPath: "internal.lighting.coolingGainPercent",
          type: "calculated",
          value: "6.29%",
          section: "occupantInternalGains",
          dependencies: ["k_66", "k_71"],
          label: "Lighting Cooling Gain: %",
        },
        m: {
          fieldId: "m_66",
          semanticPath: "internal.lighting.compliance",
          type: "calculated",
          value: "133%",
          section: "occupantInternalGains",
          dependencies: ["d_66", "ref_d_66"],
          label: "Lighting Compliance: %",
        },
        n: {
          fieldId: "n_66",
          semanticPath: "internal.lighting.complianceStatus",
          type: "calculated",
          value: "✓",
          section: "occupantInternalGains",
          dependencies: ["m_66"],
          label: "Lighting Compliance Status",
        },
      },
    },

    // Row 67: P.3.1 Equipment Loads
    67: {
      id: "P.3.1",
      rowId: "P.3.1",
      label: "Equipment Loads",
      cells: {
        c: { label: "Equipment Loads" },
        d: {
          fieldId: "d_67",
          semanticPath: "internal.equipment.density",
          type: "calculated",
          value: "5.00",
          section: "occupantInternalGains",
          tooltip: true, // Default Determined by Occupancy
          conditionalDeps: ["d_12", "g_67", "d_68"],
          label: "Equipment Density: W/m²",
        },
        e: { content: "P.3.3", classes: ["label-prefix"] },
        f: { content: "Equipment Spec", classes: ["label-main"] },
        g: {
          fieldId: "g_67",
          semanticPath: "internal.equipment.efficiencySpec",
          type: "dropdown",
          dropdownId: "dd_g_67",
          value: "Efficient",
          section: "occupantInternalGains",
          tooltip: true, // Efficient or Regular Energy Spec
          label: "Equipment Efficiency Spec",
          options: [
            { value: "Regular", name: "Regular" },
            { value: "Efficient", name: "Efficient" },
          ],
        },
        h: {
          fieldId: "h_67",
          semanticPath: "internal.equipment.annualEnergy",
          type: "calculated",
          value: "31,255.68",
          section: "occupantInternalGains",
          dependencies: ["d_67", "i_63", "h_15"],
          label: "Equipment Energy: kWh/yr",
        },
        i: {
          fieldId: "i_67",
          semanticPath: "internal.equipment.heatingGain",
          type: "calculated",
          value: "20,979.84",
          section: "occupantInternalGains",
          dependencies: ["h_67", "m_19"],
          label: "Equipment Heating Gain: kWh/yr",
        },
        j: {
          fieldId: "j_67",
          semanticPath: "internal.equipment.heatingGainPercent",
          type: "calculated",
          value: "20.96%",
          section: "occupantInternalGains",
          dependencies: ["i_67", "i_71"],
          label: "Equipment Heating Gain: %",
        },
        k: {
          fieldId: "k_67",
          semanticPath: "internal.equipment.coolingGain",
          type: "calculated",
          value: "10,275.84",
          section: "occupantInternalGains",
          dependencies: ["h_67", "m_19"],
          label: "Equipment Cooling Gain: kWh/yr",
        },
        l: {
          fieldId: "l_67",
          semanticPath: "internal.equipment.coolingGainPercent",
          type: "calculated",
          value: "20.96%",
          section: "occupantInternalGains",
          dependencies: ["k_67", "k_71"],
          label: "Equipment Cooling Gain: %",
        },
        m: {
          fieldId: "m_67",
          semanticPath: "internal.equipment.compliance",
          type: "calculated",
          value: "100%",
          section: "occupantInternalGains",
          dependencies: ["g_67", "ref_g_67"],
          label: "Equipment Compliance: %",
        },
        n: {
          fieldId: "n_67",
          semanticPath: "internal.equipment.complianceStatus",
          type: "calculated",
          value: "✓",
          section: "occupantInternalGains",
          dependencies: ["m_67"],
          label: "Equipment Compliance Status",
        },
      },
    },

    // Row 68: P.3.2 Elevator Loads
    68: {
      id: "P.3.2",
      rowId: "P.3.2",
      label: "Elevator Loads (W/m² → Eqpt Gains)",
      cells: {
        c: { label: "Elevator Loads (W/m² → Eqpt Gains)" },
        d: {
          fieldId: "d_68",
          semanticPath: "internal.elevator.status",
          type: "dropdown",
          dropdownId: "dd_d_68",
          value: "No Elevators",
          section: "occupantInternalGains",
          tooltip: true, // Include Elevator Load
          label: "Elevator Status",
          options: [
            { value: "Elevators", name: "Elevators" },
            { value: "No Elevators", name: "No Elevators" },
          ],
        },
      },
    },

    // Row 69: W.1.3 DHW System Losses
    69: {
      id: "W.1.3",
      rowId: "W.1.3",
      label: "DHW System Losses",
      cells: {
        c: { label: "DHW System Losses" },
        h: {
          fieldId: "h_69",
          semanticPath: "internal.dhwLosses.annualEnergy",
          type: "calculated",
          value: "0.00",
          section: "occupantInternalGains",
          dependencies: ["d_54"],
          label: "DHW System Losses: kWh/yr",
        },
        i: {
          fieldId: "i_69",
          semanticPath: "internal.dhwLosses.heatingGain",
          type: "calculated",
          value: "0.00",
          section: "occupantInternalGains",
          dependencies: ["h_69", "m_19"],
          label: "DHW Heating Gain: kWh/yr",
        },
        j: {
          fieldId: "j_69",
          semanticPath: "internal.dhwLosses.heatingGainPercent",
          type: "calculated",
          value: "0.00%",
          section: "occupantInternalGains",
          dependencies: ["i_69", "i_71"],
          label: "DHW Heating Gain: %",
        },
        k: {
          fieldId: "k_69",
          semanticPath: "internal.dhwLosses.coolingGain",
          type: "calculated",
          value: "0.00",
          section: "occupantInternalGains",
          dependencies: ["h_69", "m_19"],
          label: "DHW Cooling Gain: kWh/yr",
        },
        l: {
          fieldId: "l_69",
          semanticPath: "internal.dhwLosses.coolingGainPercent",
          type: "calculated",
          value: "0.00%",
          section: "occupantInternalGains",
          dependencies: ["k_69", "k_71"],
          label: "DHW Cooling Gain: %",
        },
      },
    },

    // Row 70: G.2 Plug/Light/Eqpt. Subtotals
    70: {
      id: "G.2",
      rowId: "G.2",
      label: "Plug/Light/Eqpt. Subtotals",
      cells: {
        c: { label: "Plug/Light/Eqpt. Subtotals" },
        h: {
          fieldId: "h_70",
          semanticPath: "internal.subtotal.annualEnergy",
          type: "calculated",
          value: "84,390.34",
          section: "occupantInternalGains",
          dependencies: ["h_65", "h_66", "h_67"],
          label: "Plug/Light/Eqpt Subtotal: kWh/yr",
        },
        i: {
          fieldId: "i_70",
          semanticPath: "internal.subtotal.heatingGain",
          type: "calculated",
          value: "56,645.57",
          section: "occupantInternalGains",
          dependencies: ["i_65", "i_66", "i_67"],
          label: "Plug/Light/Eqpt Heating Subtotal: kWh/yr",
        },
        k: {
          fieldId: "k_70",
          semanticPath: "internal.subtotal.coolingGain",
          type: "calculated",
          value: "27,744.77",
          section: "occupantInternalGains",
          dependencies: ["k_65", "k_66", "k_67"],
          label: "Plug/Light/Eqpt Cooling Subtotal: kWh/yr",
        },
      },
    },

    // Row 71: Internal Gains Totals
    71: {
      id: "Totals",
      rowId: "Totals",
      label: "Internal Gains Totals",
      cells: {
        c: { label: "Internal Gains Totals" },
        h: {
          fieldId: "h_71",
          semanticPath: "internal.total.annualEnergy",
          type: "calculated",
          value: "149,086.36",
          section: "occupantInternalGains",
          dependencies: ["h_64", "h_70", "h_69"],
          label: "Total Internal Gains: kWh/yr",
        },
        i: {
          fieldId: "i_71",
          semanticPath: "internal.total.heatingGain",
          type: "calculated",
          value: "100,071.67",
          section: "occupantInternalGains",
          dependencies: ["i_64", "i_70", "i_69"],
          label: "Total Heating Gains: kWh/yr",
        },
        j: {
          fieldId: "j_71",
          semanticPath: "internal.total.heatingGainPercent",
          type: "calculated",
          value: "100%",
          section: "occupantInternalGains",
          dependencies: ["j_64", "j_65", "j_66", "j_67", "j_69"],
          label: "Total Heating Gains: %",
        },
        k: {
          fieldId: "k_71",
          semanticPath: "internal.total.coolingGain",
          type: "calculated",
          value: "49,014.69",
          section: "occupantInternalGains",
          dependencies: ["k_64", "k_70", "k_69"],
          label: "Total Cooling Gains: kWh/yr",
        },
        l: {
          fieldId: "l_71",
          semanticPath: "internal.total.coolingGainPercent",
          type: "calculated",
          value: "100%",
          section: "occupantInternalGains",
          dependencies: ["l_64", "l_65", "l_66", "l_67", "l_69"],
          label: "Total Cooling Gains: %",
        },
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
            section: cell.section || "occupantInternalGains",
            semanticPath: cell.semanticPath || null, // Phase 5: Include semantic path
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

  //==========================================================================
  // EVENT HANDLING (calculations handled by ComputationGraph)
  //==========================================================================

  /**
   * Initialize all event handlers for this section
   */
  function initializeEventHandlers() {
    const sectionElement = document.getElementById("occupantInternalGains");
    if (!sectionElement) return;

    // Add handlers for editable fields
    const editableFields = sectionElement.querySelectorAll(
      '.user-input, [contenteditable="true"]'
    );
    editableFields.forEach(field => {
      // Make text fields editable
      if (field.classList.contains("user-input")) {
        field.setAttribute("contenteditable", "true");
      }

      // Handle blur event for text fields
      field.addEventListener("blur", function () {
        const fieldId = this.getAttribute("data-field-id");
        if (!fieldId) return;

        // Handle numeric values
        if (this.getAttribute("contenteditable") === "true") {
          // Get and clean the value
          const newValue = this.textContent.trim();

          // Performance: Check if value actually changed before recalculating
          const oldValue = getModeValue(fieldId);
          const oldNumeric = window.TEUI.parseNumeric(oldValue);
          const newNumeric = window.TEUI.parseNumeric(newValue);
          const valueChanged = oldNumeric !== newNumeric;

          // Store via mode-aware helper (dual-state aware)
          setModeValue(fieldId, newValue, "user-modified");

          // Format the display using global helper if it's a valid number
          const numericValue = window.TEUI.parseNumeric(newValue);
          if (!isNaN(numericValue)) {
            // Use 'integer' format if it's a whole number, otherwise 'number'
            const formatType = Number.isInteger(numericValue)
              ? "integer"
              : "number";
            this.textContent = window.TEUI.formatNumber(
              numericValue,
              formatType
            );
          } else {
            // Handle non-numeric input
            this.textContent = window.TEUI.formatNumber(0, "number");
            setModeValue(fieldId, "0", "user-modified");
          }

          // Graph handles recalculation via StateManager listener
        }
      });

      // Handle Enter key
      field.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault(); // Prevent adding a newline
          this.blur(); // Remove focus to trigger the blur event
        }
      });
    });

    // Add dropdown change event handlers (following S13 working pattern)
    const dropdowns = sectionElement.querySelectorAll("select");
    // console.log(`[S09DB] DOM SETUP: Found ${dropdowns.length} dropdowns in section`);

    dropdowns.forEach((dropdown, index) => {
      const fieldId = dropdown.getAttribute("data-field-id");
      const currentValue = dropdown.value;
      // console.log(`[S09DB] DOM SETUP: Dropdown ${index}: fieldId="${fieldId}", value="${currentValue}", id="${dropdown.id}"`);

      // Remove any existing handlers to avoid duplicates (S13 pattern)
      dropdown.removeEventListener("change", handleDropdownChange);

      // Add the event listener (S13 pattern)
      dropdown.addEventListener("change", handleDropdownChange);
    });

    // Add special handling for equipment dropdowns
    setupEquipmentDropdownListeners();

  }

  /**
   * Handle dropdown changes (following S13 working pattern)
   * Store dropdown changes in current state via mode-aware helper
   */
  function handleDropdownChange(e) {
    const fieldId = e.target.getAttribute("data-field-id");

    if (!fieldId) {
      console.log(`[S09DB] ERROR: No fieldId found on dropdown!`);
      return;
    }

    const newValue = e.target.value;
    if (fieldId === "d_64") {
      const mode = window.TEUI.ReferenceToggle?.isReferenceMode() ? "reference" : "target";
      console.log(
        `[S09] d_64 changed: ${newValue}, mode=${mode}`
      );
    }

    // Store via mode-aware helper (dual-state aware)
    // StateManager will automatically trigger Clock timing on "user-modified" state
    setModeValue(fieldId, newValue, "user-modified");

    // Graph handles recalculation via StateManager listener
  }

  /**
   * Register with StateManager and set proper default values
   */
  function registerWithStateManager() {
    if (!window.TEUI?.StateManager) return;

    // Register default values with default state (not user-modified)
    if (window.TEUI.StateManager.setValue) {
      window.TEUI.StateManager.setValue("g_67", "Efficient", "default");
      window.TEUI.StateManager.setValue("d_68", "No Elevators", "default");
      window.TEUI.StateManager.setValue("d_67", "5.00", "default");
    }
    // Graph owns dependency registration and computation
  }

  /**
   * Called when the section is rendered
   */
  function onSectionRendered() {
    // Publish essential Reference values for downstream sections
    if (window.TEUI?.StateManager?.setValue) {
      window.TEUI.StateManager.setValue("ref_d_63", "126", "default");
      window.TEUI.StateManager.setValue("ref_d_64", "Normal", "default");
      window.TEUI.StateManager.setValue("j_63", "8760", "calculated");
      window.TEUI.StateManager.setValue("ref_j_63", "8760", "calculated");
    }

    // Initialize event handlers
    initializeEventHandlers();

    // 4. Register with state manager and integrator
    registerWithStateManager();
    // Initialize default dropdown values
    if (
      !(window.TEUI.sect09.initialized && window.TEUI.sect09.userInteracted)
    ) {
      const efficiencyDropdown = document.querySelector(
        'select[data-field-id="g_67"]'
      );
      const elevatorDropdown = document.querySelector(
        'select[data-field-id="d_68"]'
      );

      if (efficiencyDropdown) {
        efficiencyDropdown.value = "Efficient";
        if (window.TEUI?.StateManager?.setValue) {
          window.TEUI.StateManager.setValue("g_67", "Efficient", "default");
        }
      }
      if (elevatorDropdown) {
        elevatorDropdown.value = "No Elevators";
        if (window.TEUI?.StateManager?.setValue) {
          window.TEUI.StateManager.setValue("d_68", "No Elevators", "default");
        }
      }
      window.TEUI.sect09.initialized = true;
    }

    // Add checkmark styles
    addCheckmarkStyles();

    // Apply tooltips after DOM is fully rendered
    if (window.TEUI.TooltipManager && window.TEUI.TooltipManager.initialized) {
      setTimeout(() => {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }
  }

  /**
   * Set up direct event listeners for equipment-related dropdowns
   * This ensures they trigger equipment load calculations immediately
   */
  function setupEquipmentDropdownListeners() {
    // Map of fieldIds to their descriptions for more generic handling
    const dropdownFields = [
      { fieldId: "g_67", description: "Equipment efficiency" },
      { fieldId: "d_68", description: "Elevator status" },
      // ❌ REMOVED d_12: S09 should NOT listen to S02's dropdown directly
      // S09 already has StateManager listeners for d_12/ref_d_12 (lines 2301-2309)
      // Listening to the dropdown causes state mixing because S09's mode
      // may be target while S02's dropdown is in reference mode
    ];

    // Set up listeners for all relevant dropdowns
    dropdownFields.forEach(field => {
      const dropdown = document.querySelector(
        `select[data-field-id="${field.fieldId}"]`
      );
      if (!dropdown) return;

      // Remove existing listeners by cloning
      const newDropdown = dropdown.cloneNode(true);
      if (dropdown.parentNode) {
        dropdown.parentNode.replaceChild(newDropdown, dropdown);
      }

      // Add change listener
      newDropdown.addEventListener("change", function (e) {
        const fieldId = this.getAttribute("data-field-id"); // Get fieldId here
        if (!fieldId) return; // Exit if no fieldId

        // Flag as user interacted for original section09 dropdowns
        if (
          (field.fieldId === "g_67" || field.fieldId === "d_68") &&
          e.isTrusted
        ) {
          if (window.TEUI && window.TEUI.sect09) {
            window.TEUI.sect09.userInteracted = true;
          }
        }

        // Store via mode-aware helper (dual-state aware)
        const state = e.isTrusted ? "user-modified" : "calculated";
        setModeValue(field.fieldId, this.value, state);
        // Graph handles recalculation via StateManager listener
      });
    });
  }

  /**
   * Helper function to set class on an element
   */
  function setElementClass(fieldId, className) {
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (element) {
      // Remove existing style classes
      element.classList.remove("checkmark", "warning");
      // Add new class
      element.classList.add(className);
    }
  }

  // Add CSS styles for checkmarks and X marks
  function addCheckmarkStyles() {
    // Check if the styles already exist
    let styleElement = document.getElementById("checkmark-styles");
    if (!styleElement) {
      // Create style element
      styleElement = document.createElement("style");
      styleElement.id = "checkmark-styles";
      styleElement.textContent = `
                .checkmark {
                    color: green;
                    font-weight: bold;
                }
                .warning {
                    color: red;
                    font-weight: bold;
                }
            `;
      document.head.appendChild(styleElement);
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

    // Registration functions
    registerWithStateManager: registerWithStateManager,
    setupEquipmentDropdownListeners: setupEquipmentDropdownListeners,
  };
})();

// Initialize when the section is rendered - THIS IS THE PRIMARY INITIALIZATION POINT
document.addEventListener("teui-section-rendered", function (event) {
  if (event.detail?.sectionId === "occupantInternalGains") {
    // PERFORMANCE FIX: Execute initialization immediately to avoid requestAnimationFrame violations
    // Heavy initialization work should not be in animation frames (causes 99-116ms violations)
    if (window.TEUI?.SectionModules?.sect09?.onSectionRendered) {
      window.TEUI.SectionModules.sect09.onSectionRendered();
    }
  }
});

