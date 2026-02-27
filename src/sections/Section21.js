/**
 * Section21.js - CSA F280 Compliance Report
 *
 * Provides UI for F280-specific user inputs (designer certification,
 * equipment capacity, project metadata) and displays read-only summary
 * of all F280 report field values pulled from the computation graph.
 *
 * ARCHITECTURE: Simplified Pattern A (display-focused)
 * - F280ComplianceNodes.js handles all peak load & compliance calculations
 * - This section reads computed values from StateManager
 * - Own calculations are minimal (field validation, display refresh)
 *
 * References:
 *   - CSA F280-12 (R2025)
 *   - SectionXX.js (Pattern A template)
 *   - Section07.js (proven Pattern A reference)
 */
window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

window.TEUI.SectionModules.sect21 = (function () {
  //==========================================================================
  // 1. FIELD DEFINITIONS (Single Source of Truth)
  //==========================================================================

  // Text-type fields that should NOT be parsed as numeric on blur
  const TEXT_FIELDS = new Set([
    "f280_proj_num",
    "f280_code_ref",
    "f280_dsgn_name",
    "f280_dsgn_co",
    "f280_cert_num",
    "f280_svc_org",
  ]);

  const sectionRows = {
    // Unit header
    header: {
      id: "S21-ID",
      rowId: "S21-ID",
      cells: {
        c: {
          content: "SECTION 21. CSA F280 Compliance",
          classes: ["section-subheader"],
        },
        d: { content: "Value", classes: ["section-subheader"] },
        e: { content: "", classes: ["section-subheader"] },
        f: { content: "Unit", classes: ["section-subheader"] },
        g: { content: "", classes: ["section-subheader"] },
        h: { content: "Value", classes: ["section-subheader"] },
        i: { content: "", classes: ["section-subheader"] },
        j: { content: "Unit", classes: ["section-subheader"] },
        k: { content: "", classes: ["section-subheader"] },
        l: { content: "", classes: ["section-subheader"] },
        m: { content: "", classes: ["section-subheader"] },
        n: { content: "Status", classes: ["section-subheader"] },
      },
    },

    // ---- Group 1: F280 Form Metadata ----
    subheader_meta: {
      id: "F.0A",
      rowId: "F.0A",
      label: "F280 Form Metadata",
      cells: {
        c: {
          content: "F280 Form Metadata",
          classes: ["group-header"],
        },
        d: { content: "\u00A0", classes: ["section-subheader"] },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    1: {
      id: "F.1",
      rowId: "F.1",
      label: "Project Number",
      cells: {
        c: { label: "Project Number" },
        d: {
          fieldId: "f280_proj_num",
          type: "editable",
          value: "",
          classes: ["user-input"],
          tooltip: true,
          label: "F280 Project Number",
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    2: {
      id: "F.2",
      rowId: "F.2",
      label: "Compliance Type",
      cells: {
        c: { label: "Compliance Type" },
        d: {
          fieldId: "f280_comp_type",
          type: "calculated",
          value: "Whole House",
          label: "Compliance Type (Whole House only)",
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    3: {
      id: "F.3",
      rowId: "F.3",
      label: "Code Reference",
      cells: {
        c: { label: "Code Reference" },
        d: {
          fieldId: "f280_code_ref",
          type: "editable",
          value: "NBC 2020: 9.33.5.1, 9.36.3.2, 9.36.5.15(5), 9.36.8.9",
          classes: ["user-input"],
          tooltip: true,
          label: "Applicable Code Reference",
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    // ---- Group 2: Design Conditions (Read-Only) ----
    subheader_design: {
      id: "F.0B",
      rowId: "F.0B",
      label: "Design Conditions",
      cells: {
        c: {
          content: "Design Conditions",
          classes: ["group-header"],
        },
        d: { content: "Value", classes: ["section-subheader"] },
        e: {},
        f: { content: "Unit", classes: ["section-subheader"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    4: {
      id: "F.4",
      rowId: "F.4",
      label: "Indoor Heating Setpoint",
      cells: {
        c: { label: "Indoor Heating Setpoint" },
        d: {
          fieldId: "f280_d_h23",
          type: "calculated",
          value: "0",
          label: "Indoor Heating Setpoint",
        },
        e: {},
        f: { content: "\u00B0C", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    5: {
      id: "F.5",
      rowId: "F.5",
      label: "Indoor Cooling Setpoint",
      cells: {
        c: { label: "Indoor Cooling Setpoint" },
        d: {
          fieldId: "f280_d_h24",
          type: "calculated",
          value: "0",
          label: "Indoor Cooling Setpoint",
        },
        e: {},
        f: { content: "\u00B0C", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    6: {
      id: "F.6",
      rowId: "F.6",
      label: "Outdoor Design Temp (Heating)",
      cells: {
        c: { label: "Outdoor Design Temp (Heating)" },
        d: {
          fieldId: "f280_d_d23",
          type: "calculated",
          value: "0",
          label: "Outdoor Design Temperature - Heating",
        },
        e: {},
        f: { content: "\u00B0C", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    7: {
      id: "F.7",
      rowId: "F.7",
      label: "Outdoor Design Temp (Cooling)",
      cells: {
        c: { label: "Outdoor Design Temp (Cooling)" },
        d: {
          fieldId: "f280_d_d24",
          type: "calculated",
          value: "0",
          label: "Outdoor Design Temperature - Cooling",
        },
        e: {},
        f: { content: "\u00B0C", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    8: {
      id: "F.8",
      rowId: "F.8",
      label: "Heating Degree Days",
      cells: {
        c: { label: "Heating Degree Days" },
        d: {
          fieldId: "f280_d_d20",
          type: "calculated",
          value: "0",
          label: "Heating Degree Days",
        },
        e: {},
        f: { content: "HDD", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    9: {
      id: "F.9",
      rowId: "F.9",
      label: "Cooling Degree Days",
      cells: {
        c: { label: "Cooling Degree Days" },
        d: {
          fieldId: "f280_d_d21",
          type: "calculated",
          value: "0",
          label: "Cooling Degree Days",
        },
        e: {},
        f: { content: "CDD", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    10: {
      id: "F.10",
      rowId: "F.10",
      label: "Conditioned Floor Area",
      cells: {
        c: { label: "Conditioned Floor Area" },
        d: {
          fieldId: "f280_d_h15",
          type: "calculated",
          value: "0",
          label: "Conditioned Floor Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    11: {
      id: "F.11",
      rowId: "F.11",
      label: "Conditioned Volume",
      cells: {
        c: { label: "Conditioned Volume" },
        d: {
          fieldId: "f280_d_d105",
          type: "calculated",
          value: "0",
          label: "Conditioned Volume",
        },
        e: {},
        f: { content: "m\u00B3", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    12: {
      id: "F.12",
      rowId: "F.12",
      label: "Number of Storeys",
      cells: {
        c: { label: "Number of Storeys" },
        d: {
          fieldId: "f280_d_d103",
          type: "calculated",
          value: "0",
          label: "Number of Storeys",
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    // ---- Group 3: Envelope Summary (Read-Only) ----
    subheader_envelope: {
      id: "F.0C",
      rowId: "F.0C",
      label: "Envelope Summary",
      cells: {
        c: {
          content: "Envelope Summary",
          classes: ["group-header"],
        },
        d: { content: "Area", classes: ["section-subheader"] },
        e: {},
        f: { content: "m\u00B2", classes: ["section-subheader"] },
        g: {},
        h: { content: "U-value", classes: ["section-subheader"] },
        i: {},
        j: {
          content: "W/m\u00B2K",
          classes: ["section-subheader"],
        },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    13: {
      id: "F.13",
      rowId: "F.13",
      label: "Walls (Above Grade)",
      cells: {
        c: { label: "Walls (Above Grade)" },
        d: {
          fieldId: "f280_d_d86",
          type: "calculated",
          value: "0",
          label: "Wall Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_g86",
          type: "calculated",
          value: "0",
          label: "Wall U-value",
        },
        i: {},
        j: { content: "W/m\u00B2K", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    14: {
      id: "F.14",
      rowId: "F.14",
      label: "Roof / Ceiling",
      cells: {
        c: { label: "Roof / Ceiling" },
        d: {
          fieldId: "f280_d_d85",
          type: "calculated",
          value: "0",
          label: "Roof Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_g85",
          type: "calculated",
          value: "0",
          label: "Roof U-value",
        },
        i: {},
        j: { content: "W/m\u00B2K", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    15: {
      id: "F.15",
      rowId: "F.15",
      label: "Windows North",
      cells: {
        c: { label: "Windows North" },
        d: {
          fieldId: "f280_d_d89",
          type: "calculated",
          value: "0",
          label: "North Window Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_g89",
          type: "calculated",
          value: "0",
          label: "North Window U-value",
        },
        i: {},
        j: { content: "W/m\u00B2K", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    16: {
      id: "F.16",
      rowId: "F.16",
      label: "Windows East",
      cells: {
        c: { label: "Windows East" },
        d: {
          fieldId: "f280_d_d89b",
          type: "calculated",
          value: "0",
          label: "East Window Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_g89b",
          type: "calculated",
          value: "0",
          label: "East Window U-value",
        },
        i: {},
        j: { content: "W/m\u00B2K", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    17: {
      id: "F.17",
      rowId: "F.17",
      label: "Windows South",
      cells: {
        c: { label: "Windows South" },
        d: {
          fieldId: "f280_d_d89c",
          type: "calculated",
          value: "0",
          label: "South Window Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_g89c",
          type: "calculated",
          value: "0",
          label: "South Window U-value",
        },
        i: {},
        j: { content: "W/m\u00B2K", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    18: {
      id: "F.18",
      rowId: "F.18",
      label: "Windows West",
      cells: {
        c: { label: "Windows West" },
        d: {
          fieldId: "f280_d_d89d",
          type: "calculated",
          value: "0",
          label: "West Window Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_g89d",
          type: "calculated",
          value: "0",
          label: "West Window U-value",
        },
        i: {},
        j: { content: "W/m\u00B2K", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    19: {
      id: "F.19",
      rowId: "F.19",
      label: "Doors",
      cells: {
        c: { label: "Doors" },
        d: {
          fieldId: "f280_d_d88",
          type: "calculated",
          value: "0",
          label: "Door Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_g88",
          type: "calculated",
          value: "0",
          label: "Door U-value",
        },
        i: {},
        j: { content: "W/m\u00B2K", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    20: {
      id: "F.20",
      rowId: "F.20",
      label: "Skylights",
      cells: {
        c: { label: "Skylights" },
        d: {
          fieldId: "f280_d_d93",
          type: "calculated",
          value: "0",
          label: "Skylight Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_g93",
          type: "calculated",
          value: "0",
          label: "Skylight U-value",
        },
        i: {},
        j: { content: "W/m\u00B2K", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    21: {
      id: "F.21",
      rowId: "F.21",
      label: "Below-Grade Walls",
      cells: {
        c: { label: "Below-Grade Walls" },
        d: {
          fieldId: "f280_d_d94",
          type: "calculated",
          value: "0",
          label: "Below-Grade Wall Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_g94",
          type: "calculated",
          value: "0",
          label: "Below-Grade Wall U-value",
        },
        i: {},
        j: { content: "W/m\u00B2K", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    22: {
      id: "F.22",
      rowId: "F.22",
      label: "Slab-on-Grade",
      cells: {
        c: { label: "Slab-on-Grade" },
        d: {
          fieldId: "f280_d_d95",
          type: "calculated",
          value: "0",
          label: "Slab Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_g95",
          type: "calculated",
          value: "0",
          label: "Slab U-value",
        },
        i: {},
        j: { content: "W/m\u00B2K", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    // ---- Group 4: Air Tightness & Ventilation (Read-Only) ----
    subheader_air: {
      id: "F.0D",
      rowId: "F.0D",
      label: "Air Tightness & Ventilation",
      cells: {
        c: {
          content: "Air Tightness & Ventilation",
          classes: ["group-header"],
        },
        d: { content: "Value", classes: ["section-subheader"] },
        e: {},
        f: { content: "Unit", classes: ["section-subheader"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    23: {
      id: "F.23",
      rowId: "F.23",
      label: "NRL50",
      cells: {
        c: { label: "NRL50 (Normalized Leakage)" },
        d: {
          fieldId: "f280_d_g108",
          type: "calculated",
          value: "0",
          label: "NRL50",
        },
        e: {},
        f: { content: "L/s/m\u00B2", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    24: {
      id: "F.24",
      rowId: "F.24",
      label: "ACH50",
      cells: {
        c: { label: "ACH50 (Air Changes at 50Pa)" },
        d: {
          fieldId: "f280_d_d109",
          type: "calculated",
          value: "0",
          label: "ACH50",
        },
        e: {},
        f: { content: "ACH", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    25: {
      id: "F.25",
      rowId: "F.25",
      label: "Ventilation Rate",
      cells: {
        c: { label: "Ventilation Rate" },
        d: {
          fieldId: "f280_d_d120",
          type: "calculated",
          value: "0",
          label: "Ventilation Rate",
        },
        e: {},
        f: { content: "L/s", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    26: {
      id: "F.26",
      rowId: "F.26",
      label: "HRV/ERV Efficiency (ATRE)",
      cells: {
        c: { label: "HRV/ERV Efficiency (ATRE)" },
        d: {
          fieldId: "f280_d_d118",
          type: "calculated",
          value: "0",
          label: "HRV/ERV Efficiency",
        },
        e: {},
        f: { content: "%", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    // ---- Group 5: F280 Peak Load Results (Read-Only) ----
    subheader_results: {
      id: "F.0E",
      rowId: "F.0E",
      label: "F280 Peak Load Results",
      cells: {
        c: {
          content: "F280 Peak Load Results",
          classes: ["group-header"],
        },
        d: { content: "Watts", classes: ["section-subheader"] },
        e: {},
        f: { content: "W", classes: ["section-subheader"] },
        g: {},
        h: { content: "BTU/h", classes: ["section-subheader"] },
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    27: {
      id: "F.27",
      rowId: "F.27",
      label: "Peak Envelope Heat Loss",
      cells: {
        c: { label: "Peak Envelope Heat Loss" },
        d: {
          fieldId: "f280_d_hl_env",
          type: "calculated",
          value: "0",
          label: "Peak Envelope Heat Loss",
        },
        e: {},
        f: { content: "W", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    28: {
      id: "F.28",
      rowId: "F.28",
      label: "Peak Infiltration Heat Loss",
      cells: {
        c: { label: "Peak Infiltration Heat Loss" },
        d: {
          fieldId: "f280_d_hl_inf",
          type: "calculated",
          value: "0",
          label: "Peak Infiltration Heat Loss",
        },
        e: {},
        f: { content: "W", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    29: {
      id: "F.29",
      rowId: "F.29",
      label: "Peak Ventilation Heat Loss",
      cells: {
        c: { label: "Peak Ventilation Heat Loss" },
        d: {
          fieldId: "f280_d_hl_vent",
          type: "calculated",
          value: "0",
          label: "Peak Ventilation Heat Loss",
        },
        e: {},
        f: { content: "W", classes: ["text-left"] },
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    30: {
      id: "F.30",
      rowId: "F.30",
      label: "Total Design Heat Loss",
      cells: {
        c: { label: "Total Design Heat Loss" },
        d: {
          fieldId: "f280_d_hl_total",
          type: "calculated",
          value: "0",
          label: "Total Design Heat Loss (W)",
        },
        e: {},
        f: { content: "W", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_hl_btu",
          type: "calculated",
          value: "0",
          label: "Total Design Heat Loss (BTU/h)",
        },
        i: {},
        j: { content: "BTU/h", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    31: {
      id: "F.31",
      rowId: "F.31",
      label: "Nominal Cooling Capacity",
      cells: {
        c: { label: "Nominal Cooling Capacity" },
        d: {
          fieldId: "f280_d_cl_total",
          type: "calculated",
          value: "0",
          label: "Nominal Cooling Capacity (W)",
        },
        e: {},
        f: { content: "W", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_h_cl_btu",
          type: "calculated",
          value: "0",
          label: "Nominal Cooling Capacity (BTU/h)",
        },
        i: {},
        j: { content: "BTU/h", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    // ---- Group 6: Equipment Sizing (User Input + Compliance) ----
    subheader_equipment: {
      id: "F.0F",
      rowId: "F.0F",
      label: "Equipment Sizing",
      cells: {
        c: {
          content: "Equipment Sizing",
          classes: ["group-header"],
        },
        d: { content: "Installed", classes: ["section-subheader"] },
        e: {},
        f: { content: "W", classes: ["section-subheader"] },
        g: {},
        h: { content: "Sizing Ratio", classes: ["section-subheader"] },
        i: {},
        j: { content: "%", classes: ["section-subheader"] },
        k: {},
        l: {},
        m: {},
        n: { content: "Pass", classes: ["section-subheader"] },
      },
    },

    32: {
      id: "F.32",
      rowId: "F.32",
      label: "Installed Heating Capacity",
      cells: {
        c: { label: "Installed Heating Capacity" },
        d: {
          fieldId: "f280_cap_heat",
          type: "editable",
          value: "0",
          classes: ["user-input"],
          tooltip: true,
          label: "Installed Heating Capacity (W)",
        },
        e: {},
        f: { content: "W", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_d_sz_heat_ratio",
          type: "calculated",
          value: "0",
          label: "Heating Sizing Ratio",
        },
        i: {},
        j: { content: "%", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {
          fieldId: "f280_d_sz_heat",
          type: "calculated",
          value: "",
          label: "Heating Sizing Compliance",
        },
      },
    },

    33: {
      id: "F.33",
      rowId: "F.33",
      label: "Installed Cooling Capacity",
      cells: {
        c: { label: "Installed Cooling Capacity" },
        d: {
          fieldId: "f280_cap_cool",
          type: "editable",
          value: "0",
          classes: ["user-input"],
          tooltip: true,
          label: "Installed Cooling Capacity (W)",
        },
        e: {},
        f: { content: "W", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: "f280_d_sz_cool_ratio",
          type: "calculated",
          value: "0",
          label: "Cooling Sizing Ratio",
        },
        i: {},
        j: { content: "%", classes: ["text-left"] },
        k: {},
        l: {},
        m: {},
        n: {
          fieldId: "f280_d_sz_cool",
          type: "calculated",
          value: "",
          label: "Cooling Sizing Compliance",
        },
      },
    },

    // ---- Group 7: Designer Certification (User Input) ----
    subheader_designer: {
      id: "F.0G",
      rowId: "F.0G",
      label: "Designer Certification",
      cells: {
        c: {
          content: "Designer Certification",
          classes: ["group-header"],
        },
        d: { content: "\u00A0", classes: ["section-subheader"] },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    34: {
      id: "F.34",
      rowId: "F.34",
      label: "Designer Name",
      cells: {
        c: { label: "Designer Name" },
        d: {
          fieldId: "f280_dsgn_name",
          type: "editable",
          value: "",
          classes: ["user-input"],
          tooltip: true,
          label: "Designer Full Name",
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    35: {
      id: "F.35",
      rowId: "F.35",
      label: "Designer Company",
      cells: {
        c: { label: "Designer Company" },
        d: {
          fieldId: "f280_dsgn_co",
          type: "editable",
          value: "",
          classes: ["user-input"],
          tooltip: true,
          label: "Designer Company Name",
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    36: {
      id: "F.36",
      rowId: "F.36",
      label: "Certification Type",
      cells: {
        c: { label: "Certification Type" },
        d: {
          fieldId: "f280_cert_type",
          type: "dropdown",
          dropdownId: "f280_cert_type",
          value: "Other",
          tooltip: true,
          label: "Certification Type",
          options: [
            "NRCan EA",
            "TECA",
            "P.Eng",
            "OAA",
            "BCIN",
            "Other",
          ],
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    37: {
      id: "F.37",
      rowId: "F.37",
      label: "Certification Number",
      cells: {
        c: { label: "Certification Number" },
        d: {
          fieldId: "f280_cert_num",
          type: "editable",
          value: "",
          classes: ["user-input"],
          tooltip: true,
          label: "Certificate / License Number",
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    38: {
      id: "F.38",
      rowId: "F.38",
      label: "Service Organization",
      cells: {
        c: { label: "Service Organization" },
        d: {
          fieldId: "f280_svc_org",
          type: "editable",
          value: "",
          classes: ["user-input"],
          tooltip: true,
          label: "NRCan Service Organization (required for NRCan EA)",
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    39: {
      id: "F.39",
      rowId: "F.39",
      label: "Responsibility Declaration",
      cells: {
        c: { label: "Responsibility Declaration" },
        d: {
          fieldId: "f280_attest",
          type: "dropdown",
          dropdownId: "f280_attest",
          value: "No",
          tooltip: true,
          label: "Responsibility Declaration",
          options: ["Yes", "No"],
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    // ---- Group 8: Overall Compliance ----
    subheader_overall: {
      id: "F.0H",
      rowId: "F.0H",
      label: "Compliance Status",
      cells: {
        c: {
          content: "Compliance Status",
          classes: ["group-header"],
        },
        d: { content: "\u00A0", classes: ["section-subheader"] },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: { content: "Status", classes: ["section-subheader"] },
      },
    },

    40: {
      id: "F.40",
      rowId: "F.40",
      label: "F280 Overall Compliance",
      cells: {
        c: { label: "F280 Overall Compliance" },
        d: {},
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {
          fieldId: "f280_d_overall",
          type: "calculated",
          value: "",
          label: "F280 Overall Compliance",
        },
      },
    },
  };

  //==========================================================================
  // 2. ACCESSOR METHODS (FieldManager Integration)
  //==========================================================================

  function getFields() {
    const fields = {};
    Object.values(sectionRows).forEach(row => {
      if (!row.cells) return;
      Object.values(row.cells).forEach(cell => {
        if (cell.fieldId) {
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.label || cell.content || row.label,
            defaultValue: cell.value || "",
            section: "f280Compliance",
          };
          if (cell.dropdownId)
            fields[cell.fieldId].dropdownId = cell.dropdownId;
          if (cell.options) fields[cell.fieldId].options = cell.options;
          if (cell.dependencies)
            fields[cell.fieldId].dependencies = cell.dependencies;
        }
      });
    });
    return fields;
  }

  function getDropdownOptions() {
    const options = {};
    Object.values(sectionRows).forEach(row => {
      if (!row.cells) return;
      Object.values(row.cells).forEach(cell => {
        if (cell.type === "dropdown" && cell.dropdownId && cell.options) {
          options[cell.dropdownId] = cell.options.map(opt => ({
            value: opt,
            name: opt,
          }));
        }
      });
    });
    return options;
  }

  // Explicit row ordering to prevent JavaScript numeric-key-first iteration
  const ROW_ORDER = [
    "header",
    "subheader_meta", 1, 2, 3,
    "subheader_design", 4, 5, 6, 7, 8, 9, 10, 11, 12,
    "subheader_envelope", 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
    "subheader_air", 23, 24, 25, 26,
    "subheader_results", 27, 28, 29, 30, 31,
    "subheader_equipment", 32, 33,
    "subheader_designer", 34, 35, 36, 37, 38, 39,
    "subheader_overall", 40,
  ];

  function getLayout() {
    const layoutRows = [];
    ROW_ORDER.forEach(function (key) {
      if (sectionRows[key]) {
        layoutRows.push(createLayoutRow(sectionRows[key]));
      }
    });
    return { rows: layoutRows };
  }

  function createLayoutRow(row) {
    const rowDef = { id: row.id, cells: [{}, {}] };
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
    columns.forEach(col => {
      const cell = row.cells?.[col] || {};
      if (col === "c" && !cell.label && row.label) cell.label = row.label;
      rowDef.cells.push(cell);
    });
    return rowDef;
  }

  //==========================================================================
  // 3. STATE OBJECTS (Pattern A Dual-State Architecture)
  //==========================================================================

  // Editable field IDs owned by this section
  const EDITABLE_FIELDS = [
    "f280_proj_num",
    "f280_code_ref",
    "f280_cap_heat",
    "f280_cap_cool",
    "f280_dsgn_name",
    "f280_dsgn_co",
    "f280_cert_type",
    "f280_cert_num",
    "f280_svc_org",
    "f280_attest",
  ];

  // Display-only field IDs (read from StateManager, rendered in section)
  const DISPLAY_FIELDS = [
    // Design conditions
    "f280_d_h23",
    "f280_d_h24",
    "f280_d_d23",
    "f280_d_d24",
    "f280_d_d20",
    "f280_d_d21",
    "f280_d_h15",
    "f280_d_d105",
    "f280_d_d103",
    // Envelope area
    "f280_d_d86",
    "f280_d_d85",
    "f280_d_d89",
    "f280_d_d89b",
    "f280_d_d89c",
    "f280_d_d89d",
    "f280_d_d88",
    "f280_d_d93",
    "f280_d_d94",
    "f280_d_d95",
    // Envelope U-values
    "f280_h_g86",
    "f280_h_g85",
    "f280_h_g89",
    "f280_h_g89b",
    "f280_h_g89c",
    "f280_h_g89d",
    "f280_h_g88",
    "f280_h_g93",
    "f280_h_g94",
    "f280_h_g95",
    // Air tightness & ventilation
    "f280_d_g108",
    "f280_d_d109",
    "f280_d_d120",
    "f280_d_d118",
    // F280 peak load results
    "f280_d_hl_env",
    "f280_d_hl_inf",
    "f280_d_hl_vent",
    "f280_d_hl_total",
    "f280_h_hl_btu",
    "f280_d_cl_total",
    "f280_h_cl_btu",
    // Equipment sizing results
    "f280_d_sz_heat_ratio",
    "f280_d_sz_heat",
    "f280_d_sz_cool_ratio",
    "f280_d_sz_cool",
    // Compliance
    "f280_d_overall",
  ];

  // Mapping from section display field IDs to StateManager source field IDs
  const SOURCE_MAP = {
    // Design conditions
    f280_d_h23: "h_23",
    f280_d_h24: "h_24",
    f280_d_d23: "d_23",
    f280_d_d24: "d_24",
    f280_d_d20: "d_20",
    f280_d_d21: "d_21",
    f280_d_h15: "h_15",
    f280_d_d105: "d_105",
    f280_d_d103: "d_103",
    // Envelope areas
    f280_d_d86: "d_86",
    f280_d_d85: "d_85",
    f280_d_d89: "d_89",
    f280_d_d89b: "d_89b",
    f280_d_d89c: "d_89c",
    f280_d_d89d: "d_89d",
    f280_d_d88: "d_88",
    f280_d_d93: "d_93",
    f280_d_d94: "d_94",
    f280_d_d95: "d_95",
    // Envelope U-values
    f280_h_g86: "g_86",
    f280_h_g85: "g_85",
    f280_h_g89: "g_89",
    f280_h_g89b: "g_89b",
    f280_h_g89c: "g_89c",
    f280_h_g89d: "g_89d",
    f280_h_g88: "g_88",
    f280_h_g93: "g_93",
    f280_h_g94: "g_94",
    f280_h_g95: "g_95",
    // Air tightness & ventilation
    f280_d_g108: "g_108",
    f280_d_d109: "d_109",
    f280_d_d120: "d_120",
    f280_d_d118: "d_118",
    // F280 computed values (legacy IDs from F280ComplianceNodes.js)
    f280_d_hl_env: "f280_hl_env",
    f280_d_hl_inf: "f280_hl_inf",
    f280_d_hl_vent: "f280_hl_vent",
    f280_d_hl_total: "f280_hl_total",
    f280_h_hl_btu: "f280_hl_btu",
    f280_d_cl_total: "f280_cl_total",
    f280_h_cl_btu: "f280_cl_btu",
    // Equipment sizing compliance
    f280_d_sz_heat_ratio: "f280_sz_heat_ratio",
    f280_d_sz_heat: "f280_sz_heat",
    f280_d_sz_cool_ratio: "f280_sz_cool_ratio",
    f280_d_sz_cool: "f280_sz_cool",
    // Overall compliance
    f280_d_overall: "f280_overall",
  };

  const TargetState = {
    values: {},

    getValue: function (fieldId) {
      return this.values[fieldId] !== undefined ? this.values[fieldId] : null;
    },

    setValue: function (fieldId, value) {
      this.values[fieldId] = value;
    },

    getNumericValue: function (fieldId, defaultValue) {
      defaultValue = defaultValue === undefined ? 0 : defaultValue;
      const value = this.getValue(fieldId);
      if (value === null || value === undefined || value === "")
        return defaultValue;
      const parsed =
        window.TEUI?.parseNumeric?.(value, defaultValue) ?? parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    },

    setDefaults: function () {
      console.log("[S21] TargetState: Initializing from FieldDefinitions");
      this.values.f280_proj_num =
        ModeManager.getFieldDefault("f280_proj_num") || "";
      this.values.f280_comp_type = "Whole House";
      this.values.f280_code_ref =
        ModeManager.getFieldDefault("f280_code_ref") ||
        "NBC 2020: 9.33.5.1, 9.36.3.2, 9.36.5.15(5), 9.36.8.9";
      this.values.f280_cap_heat =
        ModeManager.getFieldDefault("f280_cap_heat") || "0";
      this.values.f280_cap_cool =
        ModeManager.getFieldDefault("f280_cap_cool") || "0";
      this.values.f280_dsgn_name =
        ModeManager.getFieldDefault("f280_dsgn_name") || "";
      this.values.f280_dsgn_co =
        ModeManager.getFieldDefault("f280_dsgn_co") || "";
      this.values.f280_cert_type =
        ModeManager.getFieldDefault("f280_cert_type") || "Other";
      this.values.f280_cert_num =
        ModeManager.getFieldDefault("f280_cert_num") || "";
      this.values.f280_svc_org =
        ModeManager.getFieldDefault("f280_svc_org") || "";
      this.values.f280_attest =
        ModeManager.getFieldDefault("f280_attest") || "No";

      // Publish to StateManager
      if (window.TEUI?.StateManager) {
        EDITABLE_FIELDS.forEach(fieldId => {
          if (this.values[fieldId] !== undefined) {
            window.TEUI.StateManager.setValue(
              fieldId,
              this.values[fieldId],
              "default"
            );
          }
        });
        console.log("[S21] TargetState: Published defaults to StateManager");
      }
    },
  };

  const ReferenceState = {
    values: {},

    getValue: function (fieldId) {
      return this.values[fieldId] !== undefined ? this.values[fieldId] : null;
    },

    setValue: function (fieldId, value) {
      this.values[fieldId] = value;
    },

    getNumericValue: function (fieldId, defaultValue) {
      defaultValue = defaultValue === undefined ? 0 : defaultValue;
      const value = this.getValue(fieldId);
      if (value === null || value === undefined || value === "")
        return defaultValue;
      const parsed =
        window.TEUI?.parseNumeric?.(value, defaultValue) ?? parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    },

    setDefaults: function () {
      console.log("[S21] ReferenceState: Initializing defaults");
      // Reference model uses same defaults for F280
      this.values.f280_proj_num = "";
      this.values.f280_comp_type = "Whole House";
      this.values.f280_code_ref =
        "NBC 2020: 9.33.5.1, 9.36.3.2, 9.36.5.15(5), 9.36.8.9";
      this.values.f280_cap_heat = "0";
      this.values.f280_cap_cool = "0";
      this.values.f280_dsgn_name = "";
      this.values.f280_dsgn_co = "";
      this.values.f280_cert_type = "Other";
      this.values.f280_cert_num = "";
      this.values.f280_svc_org = "";
      this.values.f280_attest = "No";

      // Publish to StateManager with ref_ prefix
      if (window.TEUI?.StateManager) {
        EDITABLE_FIELDS.forEach(fieldId => {
          if (this.values[fieldId] !== undefined) {
            window.TEUI.StateManager.setValue(
              `ref_${fieldId}`,
              this.values[fieldId],
              "default"
            );
          }
        });
        console.log("[S21] ReferenceState: Published defaults to StateManager");
      }
    },
  };

  //==========================================================================
  // 4. MODE MANAGER (Facade Coordination)
  //==========================================================================

  const ModeManager = {
    currentMode: "target",

    switchMode: function (mode) {
      console.log(`[S21] switchMode: ${this.currentMode} -> ${mode}`);
      this.currentMode = mode;
      this.refreshUI();
      this.updateCalculatedDisplayValues();
      this.syncToggleUI(mode);
    },

    syncToggleUI: function (mode) {
      window.TEUI.ToggleUISync?.syncToggleUI(
        this._toggleElements,
        mode,
        "S21"
      );
    },

    refreshUI: function () {
      console.log(`[S21] refreshUI: mode=${this.currentMode}`);
      const fields = getFields();
      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;

      Object.keys(fields).forEach(fieldId => {
        const storedValue = currentState.getValue(fieldId);
        const element = document.querySelector(
          `[data-field-id="${fieldId}"]`
        );
        if (!element) return;

        const fieldDefault = this.getFieldDefault(fieldId);
        const valueToShow = storedValue !== null ? storedValue : fieldDefault;

        let targetElement = element;
        if (element.tagName === "TD") {
          targetElement =
            element.querySelector("select") ||
            element.querySelector('[contenteditable="true"]') ||
            element;
        }

        if (targetElement.hasAttribute("contenteditable")) {
          targetElement.textContent = valueToShow || "";
        } else if (targetElement.matches("select")) {
          targetElement.value = valueToShow || "";
          if (storedValue === null && fieldDefault) {
            currentState.setValue(fieldId, fieldDefault);
          }
        }
      });
    },

    updateCalculatedDisplayValues: function () {
      const mode = this.currentMode;

      DISPLAY_FIELDS.forEach(displayFieldId => {
        const sourceFieldId = SOURCE_MAP[displayFieldId];
        if (!sourceFieldId) return;

        const smKey =
          mode === "reference" ? `ref_${sourceFieldId}` : sourceFieldId;
        const value = window.TEUI?.StateManager?.getValue(smKey);

        const element = document.querySelector(
          `[data-field-id="${displayFieldId}"]`
        );
        if (!element) return;

        let displayValue = value;
        if (displayValue === "" || displayValue === null || displayValue === undefined) {
          element.textContent = "";
          return;  // Don't format empty values as "0"
        }

        // Format numeric values, leave checkmarks and text as-is
        if (displayValue === "\u2713" || displayValue === "\u2717") {
          element.textContent = displayValue;
          // Apply green/red CSS classes like other sections (S07/S13 pattern)
          element.classList.remove("checkmark", "warning");
          element.classList.add(displayValue === "\u2713" ? "checkmark" : "warning");
        } else {
          const num = parseFloat(String(displayValue).replace(/,/g, ""));
          if (!isNaN(num)) {
            element.textContent =
              window.TEUI?.formatNumber?.(num, "number-2dp-comma") ??
              displayValue;
          } else {
            element.textContent = displayValue;
          }
        }
      });
    },

    getValue: function (fieldId) {
      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;
      return currentState.getValue(fieldId);
    },

    setValue: function (fieldId, value, source) {
      source = source || "user-modified";
      console.log(
        `[S21] ModeManager.setValue: ${fieldId} = "${value}" (mode=${this.currentMode})`
      );
      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;
      currentState.setValue(fieldId, value);

      // Sync to StateManager
      if (this.currentMode === "target") {
        window.TEUI?.StateManager?.setValue(fieldId, value, source);
      } else {
        window.TEUI?.StateManager?.setValue(`ref_${fieldId}`, value, source);
      }
    },

    getFieldDefault: function (fieldId) {
      for (var rowKey in sectionRows) {
        var row = sectionRows[rowKey];
        if (row.cells) {
          for (var cellKey in row.cells) {
            var cell = row.cells[cellKey];
            if (cell.fieldId === fieldId && cell.value !== undefined) {
              return cell.value;
            }
          }
        }
      }
      return null;
    },
  };

  // Expose for ComponentBridge compatibility
  window.TEUI.sect21 = { ModeManager: ModeManager };

  //==========================================================================
  // 5. HELPER FUNCTIONS
  //==========================================================================

  function updateServiceOrgVisibility() {
    var certType = ModeManager.getValue("f280_cert_type") || "Other";
    var shouldGhost = certType !== "NRCan EA";
    setFieldGhosted("f280_svc_org", shouldGhost);
  }

  function setFieldGhosted(fieldId, shouldBeGhosted) {
    var valueCell = document.querySelector(
      'td[data-field-id="' + fieldId + '"]'
    );
    if (valueCell) {
      valueCell.classList.toggle("disabled-input", shouldBeGhosted);
      var input = valueCell.querySelector(
        'input, select, [contenteditable="true"]'
      );
      if (input) {
        if (input.hasAttribute("contenteditable")) {
          input.contentEditable = !shouldBeGhosted;
        } else {
          input.disabled = shouldBeGhosted;
        }
      }
    }
  }

  //==========================================================================
  // 6. CALCULATION ENGINES (Simplified - reads from StateManager)
  //==========================================================================

  // Map from Section21 field IDs to computation graph semantic paths
  var SEMANTIC_MAP = {
    f280_cap_heat: "f280.installedHeatingCapacity",
    f280_cap_cool: "f280.installedCoolingCapacity",
    f280_dsgn_name: "f280.designer.name",
    f280_dsgn_co: "f280.designer.company",
    f280_cert_type: "f280.designer.certType",
    f280_cert_num: "f280.designer.certNumber",
    f280_svc_org: "f280.designer.serviceOrg",
    f280_attest: "f280.designer.attestation",
    f280_proj_num: "f280.projectNumber",
    f280_comp_type: "f280.complianceType",
    f280_code_ref: "f280.codeReference",
  };

  function calculateTargetModel() {
    // Write F280 user inputs directly to the computation graph state
    // using semantic paths — no legacy StateManager intermediary
    var ci = window.TEUI?.ComputationIntegration;
    if (!ci?.isInitialized?.()) return;

    var graphState = ci.getState();
    var modelId = graphState.getActiveModelId();

    // Equipment capacity (numeric)
    var heatCap = TargetState.getNumericValue("f280_cap_heat", 0);
    graphState.setValueForModel(modelId, "f280.installedHeatingCapacity", heatCap);

    var coolCap = TargetState.getNumericValue("f280_cap_cool", 0);
    graphState.setValueForModel(modelId, "f280.installedCoolingCapacity", coolCap);

    // Designer fields (string, except attestation which is boolean)
    graphState.setValueForModel(modelId, "f280.designer.name",
      TargetState.getValue("f280_dsgn_name") || "");
    graphState.setValueForModel(modelId, "f280.designer.company",
      TargetState.getValue("f280_dsgn_co") || "");
    graphState.setValueForModel(modelId, "f280.designer.certType",
      TargetState.getValue("f280_cert_type") || "Other");
    graphState.setValueForModel(modelId, "f280.designer.certNumber",
      TargetState.getValue("f280_cert_num") || "");
    graphState.setValueForModel(modelId, "f280.designer.serviceOrg",
      TargetState.getValue("f280_svc_org") || "");

    var attestVal = TargetState.getValue("f280_attest");
    graphState.setValueForModel(modelId, "f280.designer.attestation",
      attestVal === "Yes" ? true : false);

    // Form metadata
    graphState.setValueForModel(modelId, "f280.projectNumber",
      TargetState.getValue("f280_proj_num") || "");
    graphState.setValueForModel(modelId, "f280.complianceType", "Whole House");
    graphState.setValueForModel(modelId, "f280.codeReference",
      TargetState.getValue("f280_code_ref") || "");
  }

  function calculateReferenceModel() {
    // Reference model mirrors target for F280 (same equipment, same designer)
    // No separate reference calculations needed for F280 compliance
  }

  function calculateAll() {
    calculateReferenceModel();
    calculateTargetModel();

    // Compute: values are already in the graph state from calculateTargetModel(),
    // so we just run the engine and sync results back to StateManager for display
    var ci = window.TEUI?.ComputationIntegration;
    if (ci?.isInitialized?.()) {
      ci.computeAll();
      ci.syncToStateManager();
    }

    // Refresh display with newly computed values
    ModeManager.updateCalculatedDisplayValues();
  }

  //==========================================================================
  // 7. EVENT HANDLING
  //==========================================================================

  function handleEditableBlur(event) {
    var fieldElement = event.target.closest("[data-field-id]") || event.target;
    var fieldId = fieldElement.getAttribute("data-field-id");
    if (!fieldId) return;

    var rawValue = fieldElement.textContent.trim();

    if (TEXT_FIELDS.has(fieldId)) {
      // Text field: store raw string value, no numeric parsing
      var currentValue = ModeManager.getValue(fieldId);
      if (currentValue !== rawValue) {
        ModeManager.setValue(fieldId, rawValue, "user-modified");
        calculateAll();
        ModeManager.updateCalculatedDisplayValues();
      }
    } else {
      // Numeric field: parse and format
      var numericValue =
        window.TEUI?.parseNumeric?.(rawValue, NaN) ??
        parseFloat(rawValue.replace(/[$,%]/g, ""));

      if (isNaN(numericValue)) {
        var previousValue = ModeManager.getValue(fieldId) || "0";
        numericValue =
          window.TEUI?.parseNumeric?.(previousValue, 0) ?? 0;
      }

      var valueToStore = numericValue.toString();
      var formattedDisplay =
        window.TEUI?.formatNumber?.(numericValue, "number-0dp-comma") ??
        valueToStore;
      fieldElement.textContent = formattedDisplay;

      var currentVal = ModeManager.getValue(fieldId);
      if (currentVal !== valueToStore) {
        ModeManager.setValue(fieldId, valueToStore, "user-modified");
        calculateAll();
        ModeManager.updateCalculatedDisplayValues();
      }
    }
  }

  function handleDropdownChange(e) {
    var fieldId =
      e.target.getAttribute("data-field-id") ||
      e.target.getAttribute("data-dropdown-id");
    var value = e.target.value;

    console.log('[S21] Dropdown changed: ' + fieldId + ' = "' + value + '"');

    if (fieldId) {
      ModeManager.setValue(fieldId, value, "user-modified");

      // Update Service Org visibility when cert type changes
      if (fieldId === "f280_cert_type") {
        updateServiceOrgVisibility();
      }

      calculateAll();
      ModeManager.updateCalculatedDisplayValues();
    }
  }

  function initializeEventHandlers() {
    var sectionElement = document.getElementById("f280Compliance");
    if (!sectionElement) return;

    // Editable text and numeric fields
    var editableFieldIds = [
      "f280_proj_num",
      "f280_code_ref",
      "f280_cap_heat",
      "f280_cap_cool",
      "f280_dsgn_name",
      "f280_dsgn_co",
      "f280_cert_num",
      "f280_svc_org",
    ];

    editableFieldIds.forEach(function (fieldId) {
      var field = sectionElement.querySelector(
        '[data-field-id="' + fieldId + '"]'
      );
      if (
        field &&
        field.classList.contains("editable") &&
        !field.hasEditableListeners
      ) {
        field.setAttribute("contenteditable", "true");
        field.classList.add("user-input");
        field.addEventListener("blur", handleEditableBlur);
        field.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            this.blur();
          }
        });
        field.hasEditableListeners = true;
      }
    });

    // Dropdowns
    var dropdowns = sectionElement.querySelectorAll(
      "select[data-dropdown-id]"
    );
    dropdowns.forEach(function (dropdown) {
      if (!dropdown.hasDropdownListener) {
        dropdown.addEventListener("change", handleDropdownChange);
        dropdown.hasDropdownListener = true;
      }
    });

    // External dependency listeners (update display when source values change)
    if (window.TEUI?.StateManager) {
      // Unique source field IDs to listen to
      var sourceFields = new Set();
      Object.values(SOURCE_MAP).forEach(function (sourceId) {
        sourceFields.add(sourceId);
      });

      sourceFields.forEach(function (sourceId) {
        window.TEUI.StateManager.addListener(sourceId, function () {
          ModeManager.updateCalculatedDisplayValues();
        });
      });
    }
  }

  //==========================================================================
  // 8. LIFECYCLE & PUBLIC API
  //==========================================================================

  function onSectionRendered() {
    console.log("[S21] Section rendered - initializing F280 Compliance module");

    // Initialize state defaults
    TargetState.setDefaults();
    ReferenceState.setDefaults();

    // Initialize event handlers
    initializeEventHandlers();

    // Initial calculations
    calculateAll();

    // Update display
    ModeManager.updateCalculatedDisplayValues();

    // Apply Service Org ghosting
    updateServiceOrgVisibility();

    // Apply tooltips
    if (window.TEUI.TooltipManager?.initialized) {
      setTimeout(function () {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }

    console.log("[S21] Initialization complete");
  }

  return {
    getFields: getFields,
    getDropdownOptions: getDropdownOptions,
    getLayout: getLayout,
    initializeEventHandlers: initializeEventHandlers,
    onSectionRendered: onSectionRendered,
    calculateAll: calculateAll,

    // Pattern A exports
    ModeManager: ModeManager,
    TargetState: TargetState,
    ReferenceState: ReferenceState,
  };
})();

// Global namespace exposure
document.addEventListener("DOMContentLoaded", function () {
  var module = window.TEUI.SectionModules.sect21;
  if (module) {
    window.TEUI.sect21.calculateAll = module.calculateAll;
  }
});

// Safe global wrapper
window.calculateSection21 = function () {
  if (window.section21CalculationRunning) return;
  window.section21CalculationRunning = true;
  try {
    if (window.TEUI?.SectionModules?.sect21?.calculateAll) {
      window.TEUI.SectionModules.sect21.calculateAll();
    }
  } catch (e) {
    console.error("Error in Section21 calculation wrapper:", e);
  } finally {
    window.section21CalculationRunning = false;
  }
};
