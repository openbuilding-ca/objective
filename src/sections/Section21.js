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

  // Semantic field IDs — keys match graph node names from F280ComplianceNodes.js
  const FIELDS = {
    // === F280 OWN INPUTS (editable) ===
    // Project metadata
    f280Mode:                     "f280_mode",
    projectNumber:                "f280_proj_num",
    complianceType:               "f280_comp_type",
    codeReference:                "f280_code_ref",
    // Equipment capacity
    installedHeatingCapacity:     "f280_cap_heat",
    installedCoolingCapacity:     "f280_cap_cool",
    // Designer certification
    designerName:                 "f280_dsgn_name",
    designerCompany:              "f280_dsgn_co",
    certType:                     "f280_cert_type",
    certNumber:                   "f280_cert_num",
    serviceOrg:                   "f280_svc_org",
    attestation:                  "f280_attest",

    // === DISPLAY MIRRORS (read-only, sourced from other sections) ===
    // Design conditions (S03)
    tsetHeating:                  "f280.building.heatingSetpoint",
    tsetCooling:                  "f280.building.coolingSetpoint",
    temperatureColdest:           "f280.climate.coldestTemp",
    temperatureHottest:           "f280.climate.hottestTemp",
    heatingDegreeDays:            "f280.climate.hdd",
    coolingDegreeDays:            "f280.climate.cdd",
    conditionedFloorArea:         "f280.building.conditionedFloorArea",
    conditionedVolume:            "f280.geometry.conditionedVolume",
    numStoreys:                   "f280.airLeakage.stories",
    // Envelope areas (S11)
    wallAreaAboveGrade:           "f280.envelope.wallsAbove.area",
    ceilingRoofArea:              "f280.envelope.roof.area",
    windowAreaNorth:              "f280.envelope.windowNorth.area",
    windowAreaEast:               "f280.envelope.windowEast.area",
    windowAreaSouth:              "f280.envelope.windowSouth.area",
    windowAreaWest:               "f280.envelope.windowWest.area",
    doorArea:                     "f280.envelope.doors.area",
    skylightArea:                 "f280.envelope.skylight.area",
    wallAreaBelowGrade:           "f280.envelope.wallsBelow.area",
    slabArea:                     "f280.envelope.slab.area",
    // Envelope U-values (S11)
    uWallAboveGrade:              "f280.envelope.wallsAbove.uValue",
    uCeilingRoof:                 "f280.envelope.roof.uValue",
    uWindowNorth:                 "f280.envelope.windowNorth.uValue",
    uWindowEast:                  "f280.envelope.windowEast.uValue",
    uWindowSouth:                 "f280.envelope.windowSouth.uValue",
    uWindowWest:                  "f280.envelope.windowWest.uValue",
    uDoor:                        "f280.envelope.doors.uValue",
    uSkylight:                    "f280.envelope.skylight.uValue",
    uWallBelowGrade:              "f280.envelope.wallsBelow.uValue",
    uSlab:                        "f280.envelope.slab.uValue",
    // Air tightness & ventilation (S12/S13)
    nrl50:                        "f280.airLeakage.nrl50",
    ach50Target:                  "f280.airLeakage.ach50Target",
    ventilationVolumetricRate:    "f280.ventilation.volumetricRate",
    ventilationEfficiency:        "f280.ventilation.hrvEfficiency",

    // === F280 COMPUTED RESULTS (read-only) ===
    // Peak loads
    peakEnvelopeHeatLoss:         "f280.peakEnvelopeHeatLoss",
    peakInfiltrationHeatLoss:     "f280.peakInfiltrationHeatLoss",
    peakVentilationHeatLoss:      "f280.peakVentilationHeatLoss",
    totalDesignHeatLoss:          "f280.totalDesignHeatLoss",
    totalDesignHeatLossBTU:       "f280.totalDesignHeatLossBTU",
    nominalCoolingCapacity:       "f280.nominalCoolingCapacity",
    nominalCoolingCapacityBTU:    "f280.nominalCoolingCapacityBTU",
    // Equipment sizing
    heatingSizingRatio:           "f280.heatingSizingRatio",
    heatingSizingCompliance:      "f280.heatingSizingCompliance",
    coolingSizingRatio:           "f280.coolingSizingRatio",
    coolingSizingCompliance:      "f280.coolingSizingCompliance",
    // Overall compliance
    overallCompliance:            "f280.overallCompliance",
  };

  // Text-type fields that should NOT be parsed as numeric on blur
  const TEXT_FIELDS = new Set([
    FIELDS.projectNumber,
    FIELDS.codeReference,
    FIELDS.designerName,
    FIELDS.designerCompany,
    FIELDS.certNumber,
    FIELDS.serviceOrg,
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

    // ---- F280 Mode (Andy 2026-11-19): two streams; Off hides every F280-only input and S21 below ----
    mode: {
      id: "F.00",
      rowId: "F.00",
      label: "F280 Mode",
      cells: {
        c: { label: "F280 Mode" },
        d: {
          fieldId: FIELDS.f280Mode,
          type: "dropdown",
          dropdownId: "f280_mode",
          value: "Off",
          tooltip: true,
          label: "F280 Mode",
          options: ["Off", "On"],
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
          fieldId: FIELDS.projectNumber,
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
          fieldId: FIELDS.complianceType,
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
          fieldId: FIELDS.codeReference,
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
          fieldId: FIELDS.tsetHeating,
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
          fieldId: FIELDS.tsetCooling,
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
          fieldId: FIELDS.temperatureColdest,
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
          fieldId: FIELDS.temperatureHottest,
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
          fieldId: FIELDS.heatingDegreeDays,
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
          fieldId: FIELDS.coolingDegreeDays,
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
          fieldId: FIELDS.conditionedFloorArea,
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
          fieldId: FIELDS.conditionedVolume,
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
          fieldId: FIELDS.numStoreys,
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
          fieldId: FIELDS.wallAreaAboveGrade,
          type: "calculated",
          value: "0",
          label: "Wall Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: FIELDS.uWallAboveGrade,
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
          fieldId: FIELDS.ceilingRoofArea,
          type: "calculated",
          value: "0",
          label: "Roof Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: FIELDS.uCeilingRoof,
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
          fieldId: FIELDS.windowAreaNorth,
          type: "calculated",
          value: "0",
          label: "North Window Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: FIELDS.uWindowNorth,
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
          fieldId: FIELDS.windowAreaEast,
          type: "calculated",
          value: "0",
          label: "East Window Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: FIELDS.uWindowEast,
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
          fieldId: FIELDS.windowAreaSouth,
          type: "calculated",
          value: "0",
          label: "South Window Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: FIELDS.uWindowSouth,
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
          fieldId: FIELDS.windowAreaWest,
          type: "calculated",
          value: "0",
          label: "West Window Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: FIELDS.uWindowWest,
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
          fieldId: FIELDS.doorArea,
          type: "calculated",
          value: "0",
          label: "Door Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: FIELDS.uDoor,
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
          fieldId: FIELDS.skylightArea,
          type: "calculated",
          value: "0",
          label: "Skylight Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: FIELDS.uSkylight,
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
          fieldId: FIELDS.wallAreaBelowGrade,
          type: "calculated",
          value: "0",
          label: "Below-Grade Wall Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: FIELDS.uWallBelowGrade,
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
          fieldId: FIELDS.slabArea,
          type: "calculated",
          value: "0",
          label: "Slab Area",
        },
        e: {},
        f: { content: "m\u00B2", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: FIELDS.uSlab,
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
          fieldId: FIELDS.nrl50,
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
          fieldId: FIELDS.ach50Target,
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
          fieldId: FIELDS.ventilationVolumetricRate,
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
          fieldId: FIELDS.ventilationEfficiency,
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
          fieldId: FIELDS.peakEnvelopeHeatLoss,
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
          fieldId: FIELDS.peakInfiltrationHeatLoss,
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
          fieldId: FIELDS.peakVentilationHeatLoss,
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
          fieldId: FIELDS.totalDesignHeatLoss,
          type: "calculated",
          value: "0",
          label: "Total Design Heat Loss (W)",
        },
        e: {},
        f: { content: "W", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: FIELDS.totalDesignHeatLossBTU,
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
          fieldId: FIELDS.nominalCoolingCapacity,
          type: "calculated",
          value: "0",
          label: "Nominal Cooling Capacity (W)",
        },
        e: {},
        f: { content: "W", classes: ["text-left"] },
        g: {},
        h: {
          fieldId: FIELDS.nominalCoolingCapacityBTU,
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
          fieldId: FIELDS.installedHeatingCapacity,
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
          fieldId: FIELDS.heatingSizingRatio,
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
          fieldId: FIELDS.heatingSizingCompliance,
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
          fieldId: FIELDS.installedCoolingCapacity,
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
          fieldId: FIELDS.coolingSizingRatio,
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
          fieldId: FIELDS.coolingSizingCompliance,
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
          fieldId: FIELDS.designerName,
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
          fieldId: FIELDS.designerCompany,
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
          fieldId: FIELDS.certType,
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
          fieldId: FIELDS.certNumber,
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
          fieldId: FIELDS.serviceOrg,
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
          fieldId: FIELDS.attestation,
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
          fieldId: FIELDS.overallCompliance,
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
    "mode",
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
    FIELDS.f280Mode,
    FIELDS.projectNumber,
    FIELDS.codeReference,
    FIELDS.installedHeatingCapacity,
    FIELDS.installedCoolingCapacity,
    FIELDS.designerName,
    FIELDS.designerCompany,
    FIELDS.certType,
    FIELDS.certNumber,
    FIELDS.serviceOrg,
    FIELDS.attestation,
  ];

  // Display-only field IDs (read from StateManager, rendered in section)
  const DISPLAY_FIELDS = [
    // Design conditions
    FIELDS.tsetHeating, FIELDS.tsetCooling,
    FIELDS.temperatureColdest, FIELDS.temperatureHottest,
    FIELDS.heatingDegreeDays, FIELDS.coolingDegreeDays,
    FIELDS.conditionedFloorArea, FIELDS.conditionedVolume, FIELDS.numStoreys,
    // Envelope areas
    FIELDS.wallAreaAboveGrade, FIELDS.ceilingRoofArea,
    FIELDS.windowAreaNorth, FIELDS.windowAreaEast,
    FIELDS.windowAreaSouth, FIELDS.windowAreaWest,
    FIELDS.doorArea, FIELDS.skylightArea,
    FIELDS.wallAreaBelowGrade, FIELDS.slabArea,
    // Envelope U-values
    FIELDS.uWallAboveGrade, FIELDS.uCeilingRoof,
    FIELDS.uWindowNorth, FIELDS.uWindowEast,
    FIELDS.uWindowSouth, FIELDS.uWindowWest,
    FIELDS.uDoor, FIELDS.uSkylight,
    FIELDS.uWallBelowGrade, FIELDS.uSlab,
    // Air tightness & ventilation
    FIELDS.nrl50, FIELDS.ach50Target, FIELDS.ventilationVolumetricRate, FIELDS.ventilationEfficiency,
    // F280 peak load results
    FIELDS.peakEnvelopeHeatLoss, FIELDS.peakInfiltrationHeatLoss,
    FIELDS.peakVentilationHeatLoss, FIELDS.totalDesignHeatLoss,
    FIELDS.totalDesignHeatLossBTU, FIELDS.nominalCoolingCapacity,
    FIELDS.nominalCoolingCapacityBTU,
    // Equipment sizing results
    FIELDS.heatingSizingRatio, FIELDS.heatingSizingCompliance,
    FIELDS.coolingSizingRatio, FIELDS.coolingSizingCompliance,
    // Compliance
    FIELDS.overallCompliance,
  ];

  // Mapping from section display field IDs to StateManager source field IDs
  // Maps S21 display field → { semantic, legacy } for graph-first reads with SM fallback.
  // Semantic paths from graph nodes (ClimateNodes, VolumeMetricsNodes, F280ComplianceNodes).
  // S11 envelope fields use semanticPath annotations (not yet graph nodes) so legacy key is required.
  // SOURCE_MAP: display fieldId → semantic path
  // Paths match the data-semantic attributes on source section cells.
  // Values resolved via graph state or SM (reverse-lookup at runtime).
  const SOURCE_MAP = {
    // Design conditions (S03)
    [FIELDS.tsetHeating]:             "reference.heatingSetpointMin", // the DESIGN set-point (m_23; F280 Cl. 4.2), not the energy one
    [FIELDS.tsetCooling]:             "building.coolingSetpoint",
    [FIELDS.temperatureColdest]:      "climate.coldestTemp",
    [FIELDS.temperatureHottest]:      "climate.hottestTemp",
    [FIELDS.heatingDegreeDays]:       "climate.hdd",
    [FIELDS.coolingDegreeDays]:       "climate.cdd",
    [FIELDS.conditionedFloorArea]:    "building.conditionedFloorArea",
    [FIELDS.conditionedVolume]:       "geometry.conditionedVolume",
    [FIELDS.numStoreys]:              "airLeakage.stories",
    // Envelope areas (S11)
    [FIELDS.wallAreaAboveGrade]:      "transmissionLoss.walls.area", // the type sums (Openings.js): every row of the type
    [FIELDS.ceilingRoofArea]:         "transmissionLoss.roof.area",
    [FIELDS.windowAreaNorth]:         "envelope.windowNorth.area",
    [FIELDS.windowAreaEast]:          "envelope.windowEast.area",
    [FIELDS.windowAreaSouth]:         "envelope.windowSouth.area",
    [FIELDS.windowAreaWest]:          "envelope.windowWest.area",
    [FIELDS.doorArea]:                "envelope.doors.area",
    [FIELDS.skylightArea]:            "envelope.skylight.area",
    [FIELDS.wallAreaBelowGrade]:      "transmissionLoss.wallsBelowGrade.area",
    [FIELDS.slabArea]:                "transmissionLoss.slabOnGrade.area",
    // Envelope U-values (S11)
    [FIELDS.uWallAboveGrade]:         "transmissionLoss.walls.uValue",
    [FIELDS.uCeilingRoof]:            "transmissionLoss.roof.uValue",
    [FIELDS.uWindowNorth]:            "envelope.windowNorth.uValue",
    [FIELDS.uWindowEast]:             "envelope.windowEast.uValue",
    [FIELDS.uWindowSouth]:            "envelope.windowSouth.uValue",
    [FIELDS.uWindowWest]:             "envelope.windowWest.uValue",
    [FIELDS.uDoor]:                   "envelope.doors.uValue",
    [FIELDS.uSkylight]:              "envelope.skylight.uValue",
    [FIELDS.uWallBelowGrade]:         "transmissionLoss.wallsBelowGrade.uValue",
    [FIELDS.uSlab]:                   "transmissionLoss.slabOnGrade.uValue",
    // Air tightness & ventilation (S12/S13)
    [FIELDS.nrl50]:                   "airLeakage.nrl50Target",
    [FIELDS.ach50Target]:             "airLeakage.ach50Target",
    [FIELDS.ventilationVolumetricRate]: "ventilation.volumetricRate",
    [FIELDS.ventilationEfficiency]:   "ventilation.hrvEfficiency",
    // F280 computed results (graph nodes)
    [FIELDS.peakEnvelopeHeatLoss]:    "f280.peakEnvelopeHeatLoss",
    [FIELDS.peakInfiltrationHeatLoss]: "f280.peakInfiltrationHeatLoss",
    [FIELDS.peakVentilationHeatLoss]: "f280.peakVentilationHeatLoss",
    [FIELDS.totalDesignHeatLoss]:     "f280.totalDesignHeatLoss",
    [FIELDS.totalDesignHeatLossBTU]:  "f280.totalDesignHeatLossBTU",
    [FIELDS.nominalCoolingCapacity]:  "f280.nominalCoolingCapacity",
    [FIELDS.nominalCoolingCapacityBTU]: "f280.nominalCoolingCapacityBTU",
    // Equipment sizing compliance (graph nodes)
    [FIELDS.heatingSizingRatio]:      "f280.heatingSizingRatio",
    [FIELDS.heatingSizingCompliance]: "f280.heatingSizingCompliance",
    [FIELDS.coolingSizingRatio]:      "f280.coolingSizingRatio",
    [FIELDS.coolingSizingCompliance]: "f280.coolingSizingCompliance",
    // Overall compliance (graph node)
    [FIELDS.overallCompliance]:       "f280.overallCompliance",
  };

  // TargetState/ReferenceState/ModeManager removed — graph + SM is the single source of truth.

  function getFieldDefault(fieldId) {
    for (const rowKey in sectionRows) {
      const row = sectionRows[rowKey];
      if (row.cells) {
        for (const cellKey in row.cells) {
          const cell = row.cells[cellKey];
          if (cell.fieldId === fieldId && cell.value !== undefined) {
            return cell.value;
          }
        }
      }
    }
    return null;
  }

  // Expose for ComponentBridge compatibility
  window.TEUI.sect21 = window.TEUI.sect21 || {};

  //==========================================================================
  // MODE-AWARE STATE HELPERS
  //==========================================================================

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
  // 5. HELPER FUNCTIONS
  //==========================================================================

  /**
   * F280 Mode (S21 F.00; Andy 2026-11-19: "can Off HIDE all of the F280 fields that do not strictly
   * belong or form part of OBJECTIVE analysis"). Off hides them; their values are kept, and no hidden
   * field moves a result (the annual stream reads ground.methodInEffect / airTightness.infiltrationMethodInEffect,
   * OBJECTIVE's under Off). Rows go whole; a field sharing a row with OBJECTIVE fields goes with the
   * label cells before it (labels = how many). The mode is per model: what shows follows the model on
   * screen (Target or Reference). h_122 (the DESIGN latent load factor, F280 sizing) hides
   * its value only: its row label also heads i_122, the latent method, which the annual stream reads.
   */
  const F280_ONLY_ROWS = [
    "G.4.5", "G.4.8", // S03: depth, perimeter, soil k; water table, deep ground, BASESIMP's load
    "B.19.2", "B.19.3", "B.19.5", "B.19.7", "B.19.9", "B.19.11", "B.19.13", // S12: AIM-2
    "T.6.10", // S15: the F280 design loss and sensible gain
  ];
  const F280_ONLY_CELLS = [
    { id: "l_25", labels: 2 }, // S03 G.4.4 Foundation Config.
    { id: "l_123", labels: 2 }, // S13 ATRE (F280)
    { id: "h_122", labels: 0 }, // S13 V.3.2 the design latent load factor
  ];
  function applyF280Mode() {
    const on = (getModeValue(FIELDS.f280Mode) || "Off") === "On";
    F280_ONLY_ROWS.forEach(id => {
      document.querySelectorAll(`tr[data-id="${id}"]`).forEach(tr => tr.classList.toggle("f280-hidden-row", !on));
    });
    F280_ONLY_CELLS.forEach(({ id, labels }) => {
      let td = document.querySelector(`td[data-field-id="${id}"]`);
      for (let k = 0; td && k <= labels; k++, td = td.previousElementSibling) {
        td.classList.toggle("f280-hidden-cell", !on);
      }
    });
    applyF280Gains(on);
    // S21: everything below the mode row
    const s21 = document.getElementById("f280Compliance");
    s21?.querySelectorAll("tr[data-id]").forEach(tr => {
      const id = tr.getAttribute("data-id");
      if (id !== "F.00" && id !== "S21-ID") tr.classList.toggle("f280-hidden-row", !on);
    });
    const select = s21?.querySelector(`select[data-field-id="${FIELDS.f280Mode}"]`);
    if (select && select.value !== (on ? "On" : "Off")) select.value = on ? "On" : "Off";
  }

  /**
   * S09 under F280 Mode On holds F280's internal gains, calculated (Andy 2026-11-19: "as hardcodes (not user
   * editable), so it is clear these are calculated (black, not blue text)"): G.1.4 70 W per person (Cl.
   * 6.2.4), plug loads max(4 W/m2, 800 W) (Cl. 6.2.5), equipment 0 - the graph's (InternalGainsNodes
   * F280_GAINS). Lighting is an input: under On it shows its value in effect, 0, locked; the user's value is
   * kept for Off. The inputs F280's figures do not read go grey (the house rule, 2026-11-18): occupant
   * activity, the equipment spec, elevators.
   */
  function applyF280Gains(on) {
    const cell = document.querySelector('td[data-field-id="d_66"]');
    if (cell) {
      cell.classList.toggle("user-input", !on);
      if (on) cell.classList.remove("user-modified");
      cell.setAttribute("contenteditable", on ? "false" : "true");
      const value = on ? 0 : window.TEUI.parseNumeric(getModeValue("d_66"), NaN);
      if (!isNaN(value)) cell.textContent = window.TEUI.formatNumber(value, "number-2dp");
    }
    ["d_64", "g_67", "d_68"].forEach(id => setFieldGhosted(id, on));
    const label = document.querySelector('td[data-field-id="g_64"]')?.previousElementSibling;
    if (label) label.textContent = on ? "Watts/pp (F280, S)" : "Watts/pp (S+L)";
  }

  function updateServiceOrgVisibility() {
    var certType = getModeValue(FIELDS.certType) || "Other";
    var shouldGhost = certType !== "NRCan EA";
    setFieldGhosted(FIELDS.serviceOrg, shouldGhost);
  }

  function setFieldGhosted(fieldId, shouldBeGhosted) {
    window.TEUI.DOMBridge?.ghostField(fieldId, shouldBeGhosted);
  }

  /**
   * Build a reverse lookup: semanticPath → legacy fieldId from all section
   * cell definitions. Cached after first call.
   */
  var _semanticToFieldId = null;
  function getSemanticToFieldId() {
    if (_semanticToFieldId) return _semanticToFieldId;
    _semanticToFieldId = {};
    var modules = window.TEUI?.SectionModules || {};
    for (var key in modules) {
      var mod = modules[key];
      if (!mod?.getFields) continue;
      try {
        var fields = mod.getFields();
        for (var fieldId in fields) {
          var field = fields[fieldId];
          if (field.semanticPath) {
            _semanticToFieldId[field.semanticPath] = fieldId;
          }
        }
      } catch (_) { /* skip */ }
    }
    return _semanticToFieldId;
  }

  /**
   * Stamp display-only fields from graph state or SM (via semantic reverse-lookup).
   * Called on render, after each graph recompute (postStamp), and on mode switch.
   *
   * Resolution order:
   * 1. Graph state (MultiModelState) — for values stored as graph nodes
   * 2. SM via reverse-lookup (semanticPath → fieldId) — for values computed
   *    by section calculateAll but not yet registered as graph nodes
   */
  function stampDisplayFields() {
    var section = document.getElementById("f280Compliance");
    if (!section) return;

    var ci = window.TEUI?.ComputationIntegration;
    var graphState = ci?.isInitialized?.() ? ci.getState() : null;
    var modelId = graphState?.getActiveModelId?.();
    var sm = window.TEUI?.StateManager;
    var lookup = getSemanticToFieldId();

    Object.entries(SOURCE_MAP).forEach(function ([displayId, semanticPath]) {
      var value = null;

      // 1. Try graph state
      if (graphState && modelId) {
        value = graphState.getValueForModel(modelId, semanticPath);
      }

      // 2. Fallback: SM via semantic → fieldId reverse lookup
      if ((value == null || value === "") && sm) {
        var fieldId = lookup[semanticPath];
        if (fieldId) {
          value = sm.getValue(fieldId);
        }
      }

      if (value == null || value === "") return;

      var el = section.querySelector('[data-field-id="' + displayId + '"]');
      if (el) {
        el.textContent = value;
        if (value === "\u2713") el.dataset.status = "pass";
        else if (value === "\u2717") el.dataset.status = "fail";
      }
    });
  }

  //==========================================================================
  // 6. EVENT HANDLING
  //==========================================================================

  function handleEditableBlur(event) {
    var fieldElement = event.target.closest("[data-field-id]") || event.target;
    var fieldId = fieldElement.getAttribute("data-field-id");
    if (!fieldId) return;

    var rawValue = fieldElement.textContent.trim();

    if (TEXT_FIELDS.has(fieldId)) {
      // Text field: store raw string value, no numeric parsing
      var currentValue = getModeValue(fieldId);
      if (currentValue !== rawValue) {
        setModeValue(fieldId, rawValue, "user-modified");
      }
    } else {
      // Numeric field: parse and format
      var numericValue =
        window.TEUI?.parseNumeric?.(rawValue, NaN) ??
        parseFloat(rawValue.replace(/[$,%]/g, ""));

      if (isNaN(numericValue)) {
        var previousValue = getModeValue(fieldId) || "0";
        numericValue =
          window.TEUI?.parseNumeric?.(previousValue, 0) ?? 0;
      }

      var valueToStore = numericValue.toString();
      var formattedDisplay =
        window.TEUI?.formatNumber?.(numericValue, "number-0dp-comma") ??
        valueToStore;
      fieldElement.textContent = formattedDisplay;

      var currentVal = getModeValue(fieldId);
      if (currentVal !== valueToStore) {
        setModeValue(fieldId, valueToStore, "user-modified");
      }
    }
  }

  function handleDropdownChange(e) {
    var fieldId =
      e.target.getAttribute("data-field-id") ||
      e.target.getAttribute("data-dropdown-id");
    var value = e.target.value;

    console.log('[S21] Dropdown changed: ' + fieldId + ' = "' + value + '"');

    if (fieldId === FIELDS.f280Mode) {
      // per model, like every setting (Andy 2026-11-19): the model on screen
      setModeValue(fieldId, value, "user-modified");
      applyF280Mode();
      return;
    }
    if (fieldId) {
      setModeValue(fieldId, value, "user-modified");

      // Update Service Org visibility when cert type changes
      if (fieldId === FIELDS.certType) {
        updateServiceOrgVisibility();
      }
    }
  }

  function initializeEventHandlers() {
    var sectionElement = document.getElementById("f280Compliance");
    if (!sectionElement) return;

    // Editable text and numeric fields
    var editableFieldIds = [
      FIELDS.projectNumber, FIELDS.codeReference,
      FIELDS.installedHeatingCapacity, FIELDS.installedCoolingCapacity,
      FIELDS.designerName, FIELDS.designerCompany,
      FIELDS.certNumber, FIELDS.serviceOrg,
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

    // Display field updates handled by DOMBridge.stampAll() via graph recomputation
  }

  //==========================================================================
  // 7. LIFECYCLE & PUBLIC API
  //==========================================================================

  function onSectionRendered() {
    console.log("[S21] Section rendered - initializing F280 Compliance module");

    // Publish field defaults to StateManager
    if (window.TEUI?.StateManager) {
      EDITABLE_FIELDS.forEach(fieldId => {
        const defaultVal = getFieldDefault(fieldId);
        if (defaultVal != null) {
          window.TEUI.StateManager.setValue(fieldId, defaultVal, "default");
        }
      });
    }

    // Stamp display fields with current SM source values
    stampDisplayFields();

    // Initialize event handlers
    initializeEventHandlers();

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

  /**
   * Called by ReferenceToggle when mode switches.
   */
  function onModeSwitch(mode) {
    stampDisplayFields();
    updateServiceOrgVisibility();
    applyF280Mode();
  }

  return {
    getFields: getFields,
    getDropdownOptions: getDropdownOptions,
    getLayout: getLayout,
    initializeEventHandlers: initializeEventHandlers,
    onSectionRendered: onSectionRendered,
    onModeSwitch: onModeSwitch,
    postStamp: function () {
      stampDisplayFields();
      applyF280Mode();
    },
  };
})();

