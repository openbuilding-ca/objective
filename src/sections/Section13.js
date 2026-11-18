/**
 * Section13.js - Mechanical Loads (HVAC)
 * Pattern A dead computation infrastructure stripped — graph computes all ~608 fields.
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

// Create section-specific namespace for global references
window.TEUI.sect13 = window.TEUI.sect13 || {};
window.TEUI.sect13.initialized = false;
window.TEUI.sect13.userInteracted = false;

// Section 13: Mechanical Loads Module
window.TEUI.SectionModules.sect13 = (function () {
  // TargetState/ReferenceState/ModeManager removed — graph + SM is the single source of truth.

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
  // CONSOLIDATED FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  /**
   * IMPORTANT: The section layout must follow these rules:
   * 1. Unit subheader MUST be the first row in the array with id "SECTXX-ID" or "header"
   * 2. Field definitions should be embedded directly in the cell objects
   * 3. Each row must have a unique ID that matches its Excel row number or label
   * 4. Cells must align perfectly with Excel column positions A-N
   * 5. Empty cells still need empty objects {} as placeholders to maintain alignment
   */

  // Define rows with integrated field definitions
  const sectionRows = {
    // UNIT SUBHEADER
    header: {
      id: "S13-ID",
      rowId: "S13-ID",
      label: "Mechanical Loads",
      cells: {
        c: {
          content: "SECTION 13. Mechanical Loads",
          classes: ["section-subheader", "section-title", "flex-cell"],
        },
        d: {
          content: "kWh/yr",
          classes: ["section-subheader", "flex-cell", "align-center"],
        },
        e: { content: "E", classes: ["section-subheader", "flex-cell"] },
        f: { content: "F", classes: ["section-subheader", "flex-cell"] },
        g: { content: "G", classes: ["section-subheader", "flex-cell"] },
        h: { content: "H", classes: ["section-subheader", "flex-cell"] },
        i: { content: "I", classes: ["section-subheader", "flex-cell"] },
        j: {
          content: "kWh/yr",
          classes: ["section-subheader", "flex-cell", "align-center"],
        },
        k: {
          content: "Reference",
          classes: ["section-subheader", "flex-cell", "align-center"],
        },
        l: { content: "L", classes: ["section-subheader", "flex-cell"] },
        m: { content: "M", classes: ["section-subheader", "flex-cell"] },
        n: { content: "N", classes: ["section-subheader", "flex-cell"] },
      },
    },

    // ROW 113: Primary Heating System
    113: {
      id: "M.1.0",
      rowId: "M.1.0",
      label: "Primary Heating System",
      cells: {
        c: { label: "Primary Heating System", classes: ["flex-cell"] },
        d: {
          fieldId: "d_113",
          semanticPath: "mechanical.heating.system",
          type: "dropdown",
          dropdownId: "dd_d_113",
          value: "Heatpump",
          section: "mechanicalLoads",
          tooltip: true,
          options: [
            { value: "Heatpump", name: "Heatpump" },
            { value: "Electricity", name: "Electricity" },
            { value: "Gas", name: "Gas" },
            { value: "Oil", name: "Oil" },
          ],
        },
        e: {
          content: "M.1.1 HSPF",
          classes: ["label-prefix"],
        },
        f: {
          fieldId: "f_113",
          semanticPath: "mechanical.heating.hspf",
          type: "coefficient_slider",
          value: "12.5",
          min: 3.5,
          max: 20,
          step: 0.1,
          section: "mechanicalLoads",
          tooltip: true,
          label: "Primary Heating System HSP or HSPF2",
        },
        g: {
          content: "M.1.2 COPheat",
          classes: ["label-prefix"],
        },
        h: {
          fieldId: "h_113",
          semanticPath: "mechanical.heating.copHeat",
          type: "calculated",
          value: "3.66",
          section: "mechanicalLoads",
          dependencies: ["d_113", "f_113"],
          label: "COP Heat (Heating System)",
        },
        i: {
          content: "M.1.3 COPcool",
          classes: ["label-prefix"],
        },
        j: {
          fieldId: "j_113",
          semanticPath: "mechanical.heating.copCool",
          type: "calculated",
          value: "2.7",
          section: "mechanicalLoads",
          dependencies: ["h_113"],
          label: "COP Cool (Derived from Heat)",
        },
        k: {
          content: "M.1.4 Sink",
          classes: ["label-prefix"],
        },
        l: {
          fieldId: "l_113",
          semanticPath: "mechanical.heating.sinkEnergy",
          type: "calculated",
          value: "86,642.65",
          section: "mechanicalLoads",
          dependencies: ["d_113", "d_114", "h_113"],
          label: "Heat Pump Sink Energy: kWh/yr",
        },
        m: {
          fieldId: "m_113",
          semanticPath: "mechanical.heating.hspfComplianceRatio",
          type: "calculated",
          value: "176%",
          section: "mechanicalLoads",
          dependencies: ["f_113", "ref_f_113"],
          label: "HSPF Ratio to Reference",
        },
        n: {
          fieldId: "n_113",
          semanticPath: "mechanical.heating.hspfComplianceStatus",
          type: "calculated",
          value: "✓",
          section: "mechanicalLoads",
          dependencies: ["m_113"],
          label: "HSPF Pass/Fail",
        },
      },
    },

    // ROW 114: Heating System Demand
    114: {
      id: "M.2.1",
      rowId: "M.2.1",
      label: "Heating System Demand",
      cells: {
        c: { label: "Heating System Demand", classes: ["flex-cell"] },
        d: {
          fieldId: "d_114",
          semanticPath: "mechanical.heating.demand",
          type: "calculated",
          value: "32,529.13",
          section: "mechanicalLoads",
          dependencies: ["d_113", "d_127"],
          conditionalDeps: ["h_113"],
          label: "Heating System Demand: kWh/yr",
        },
        e: {
          content: "Net Emissions",
          classes: ["label-prefix", "flex-cell"],
        },
        f: {
          fieldId: "f_114",
          semanticPath: "mechanical.heating.netEmissions",
          type: "calculated",
          value: "0.00",
          section: "mechanicalLoads",
          dependencies: ["d_113"],
          conditionalDeps: ["f_115", "l_30", "h_115", "l_28"],
          label: "Net Emissions (Fuel): kgCO2e/yr",
        },
        g: {
          content: "kgCO2e/yr",
          classes: ["label", "flex-cell"],
        },
        h: {},
        i: {
          content: "M.1.5. CEER",
          classes: ["label-prefix"],
        },
        j: {
          fieldId: "j_114",
          semanticPath: "mechanical.heating.ceer",
          type: "calculated",
          value: "9.1",
          section: "mechanicalLoads",
          dependencies: ["j_113"],
          label: "CEER (Combined Energy Efficiency Ratio)",
        },
        k: {
          content: "M.1.6 Sink",
          classes: ["label-prefix"],
        },
        l: {
          fieldId: "l_114",
          semanticPath: "mechanical.cooling.sinkEnergy",
          type: "calculated",
          value: "5,020.63",
          section: "mechanicalLoads",
          dependencies: ["d_113"],
          conditionalDeps: ["d_116", "d_117", "j_113"],
          label: "Cooling Sink Energy: kWh/yr",
        },
        m: {},
        n: {},
      },
    },

    // ROW 115: Heating Fuel Impact
    115: {
      id: "M.2.2",
      rowId: "M.2.2",
      label: "Heating Fuel Impact (ekWh/yr)",
      cells: {
        c: { label: "Heating Fuel Impact (ekWh/yr)", classes: ["flex-cell"] },
        d: {
          fieldId: "d_115",
          semanticPath: "mechanical.heating.fuelImpact",
          type: "calculated",
          value: "0.00",
          section: "mechanicalLoads",
          dependencies: ["d_113", "d_127", "j_115"],
          label: "Heating Fuel Impact: ekWh/yr",
        },
        e: {
          content: "M.2.3 Oil l/yr",
          classes: ["label-prefix"],
        },
        f: {
          fieldId: "f_115",
          semanticPath: "mechanical.heating.oilConsumption",
          type: "calculated",
          value: "0.00",
          section: "mechanicalLoads",
          dependencies: ["d_115"],
          label: "Oil Consumption: l/yr",
        },
        g: {
          content: "M.2.4 Gas m3/yr",
          classes: ["label-prefix"],
        },
        h: {
          fieldId: "h_115",
          semanticPath: "mechanical.heating.gasConsumption",
          type: "calculated",
          value: "0.00",
          section: "mechanicalLoads",
          dependencies: ["d_115"],
          label: "Gas Consumption: m³/yr",
        },
        i: {
          content: "M.2.5 AFUE",
          classes: ["label-prefix"],
        },
        j: {
          fieldId: "j_115",
          semanticPath: "mechanical.heating.afue",
          type: "editable",
          value: "0.90",
          section: "mechanicalLoads",
          label: "AFUE (Annual Fuel Utilization Efficiency)",
        },
        k: {
          content: "M.2.5 Exhaust",
          classes: ["label-prefix"],
        },
        l: {
          fieldId: "l_115",
          semanticPath: "mechanical.heating.exhaustEnergy",
          type: "calculated",
          value: "0.00",
          section: "mechanicalLoads",
          dependencies: ["d_113", "d_115", "d_114"],
          label: "Fuel System Exhaust: ekWh/yr",
        },
        m: {
          fieldId: "m_115",
          semanticPath: "mechanical.heating.afueComplianceRatio",
          type: "calculated",
          value: "109%",
          section: "mechanicalLoads",
          dependencies: ["j_115", "ref_j_115"],
          label: "AFUE Ratio to Reference",
        },
        n: {
          fieldId: "n_115",
          semanticPath: "mechanical.heating.afueComplianceStatus",
          type: "calculated",
          value: "✓",
          section: "mechanicalLoads",
          dependencies: ["m_115"],
          label: "AFUE Pass/Fail",
        },
      },
    },

    // ROW 116: Heatpump or Dedicated Cooling System
    116: {
      id: "M.3.0",
      rowId: "M.3.0",
      label: "Select Cooling System",
      cells: {
        c: {
          label: "Select Cooling System",
          classes: ["flex-cell"],
        },
        d: {
          fieldId: "d_116",
          semanticPath: "mechanical.cooling.system",
          type: "dropdown",
          dropdownId: "dd_d_116",
          value: "Heatpump Heats & Cools",
          section: "mechanicalLoads",
          span: 2, // spans the empty E: the choice's full name shows
          tooltip: true,
          // Andy 2026-11-18 (window.TEUI.CoolingSystem, MechanicalNodes): the
          // heat pump option is offered only when M.1.0 is Heatpump
          // (updateCoolingOptions); an old file's "Cooling" is read on import.
          options: [
            { value: "Heatpump Heats & Cools", name: "Heatpump Heats & Cools" },
            { value: "Separate Cooling", name: "Separate Cooling" },
            { value: "No Cooling", name: "No Cooling" },
          ],
        },
        e: {},
        f: {},
        g: {},
        h: {},
        i: {
          content: "M.3.3 COPcool",
          classes: ["label-prefix"],
        },
        j: {
          fieldId: "j_116",
          semanticPath: "mechanical.cooling.copCool",
          type: "editable",
          value: "2.66",
          section: "mechanicalLoads",
          classes: ["user-input", "editable"],
          label:
            "COP Cool (Separate Cooling; shows M.1.3 when the heat pump cools)",
        },
        k: {
          content: "M.3.4 Sink",
          classes: ["label-prefix"],
        },
        l: {
          fieldId: "l_116",
          semanticPath: "mechanical.cooling.dedicatedSinkEnergy",
          type: "calculated",
          value: "5,009.95",
          section: "mechanicalLoads",
          dependencies: ["d_116"],
          conditionalDeps: ["d_117", "j_116"],
          label: "Dedicated Cooling Sink Energy: kWh/yr",
        },
        m: {
          fieldId: "m_116",
          semanticPath: "mechanical.cooling.copComplianceRatio",
          type: "calculated",
          value: "124%",
          section: "mechanicalLoads",
          dependencies: ["j_116", "ref_j_116"],
          label: "COPcool Ratio to Reference",
        },
        n: {
          fieldId: "n_116",
          semanticPath: "mechanical.cooling.copComplianceStatus",
          type: "calculated",
          value: "✓",
          section: "mechanicalLoads",
          dependencies: ["m_116"],
          label: "COPcool Pass/Fail",
        },
      },
    },

    // ROW 117: Heatpump Cool Elect. Load
    117: {
      id: "M.3.5",
      rowId: "M.3.5",
      label: "Heatpump Cool Elect. Load",
      cells: {
        c: { label: "Heatpump Cool Elect. Load", classes: ["flex-cell"] },
        d: {
          fieldId: "d_117",
          semanticPath: "mechanical.cooling.electricalDemand",
          type: "calculated",
          value: "3,018.04",
          section: "mechanicalLoads",
          dependencies: ["d_116"],
          conditionalDeps: ["d_113", "m_129", "j_113", "j_116"],
          label: "Cooling Electrical Load: kWh/yr",
        },
        e: {},
        f: {
          fieldId: "f_117",
          semanticPath: "mechanical.cooling.intensityPerArea",
          type: "calculated",
          value: "2.11",
          section: "mechanicalLoads",
          dependencies: ["d_117", "h_15"],
          label: "Cooling Load Intensity: kWh/m²/yr",
        },
        g: {
          content: "kWh/m2/yr",
          classes: ["label"],
        },
        h: {},
        i: {
          content: "M.3.6 CEER",
          classes: ["label-prefix"],
        },
        j: {
          fieldId: "j_117",
          semanticPath: "mechanical.cooling.ceer",
          type: "calculated",
          value: "9.1",
          section: "mechanicalLoads",
          dependencies: ["j_116"],
          label: "CEER (Cooling)",
        },
        k: {},
        l: {},
        m: {
          fieldId: "m_117",
          semanticPath: "mechanical.cooling.intensityComplianceRatio",
          type: "calculated",
          value: "4%",
          section: "mechanicalLoads",
          dependencies: ["f_117", "ref_f_117"],
          label: "Cooling Intensity Ratio to Reference",
        },
        n: {
          fieldId: "n_117",
          semanticPath: "mechanical.cooling.intensityComplianceStatus",
          type: "calculated",
          value: "✓",
          section: "mechanicalLoads",
          dependencies: ["m_117"],
          label: "Cooling Intensity Pass/Fail",
        },
      },
    },

    // ROW 118: HRV/ERV/MVHR Efficiency (SRE)
    118: {
      id: "V.1.1",
      rowId: "V.1.1",
      label: "HRV/ERV/MVHR Efficiency (SRE)",
      cells: {
        c: { label: "HRV/ERV/MVHR Efficiency (SRE)", classes: ["flex-cell"] },
        d: {
          fieldId: "d_118",
          semanticPath: "ventilation.hrvEfficiency",
          type: "editable",
          value: "89.00",
          classes: ["user-input"],
          section: "mechanicalLoads",
          tooltip: true,
          label: "HRV/ERV/MVHR Sensible Recovery Efficiency (SRE): %",
        },
        e: {
          fieldId: "e_118",
          semanticPath: "ventilation.recoveryType",
          type: "dropdown",
          dropdownId: "dd_e_118",
          value: "HRV",
          section: "mechanicalLoads",
          tooltip: true,
          options: [
            { value: "HRV", name: "HRV" },
            { value: "ERV", name: "ERV" },
          ],
          label: "Heat Recovery Type (HRV: sensible only; ERV: sensible + latent)",
        },
        f: {
          content: "Ventil. Method",
          classes: ["label-prefix"],
        },
        g: {
          fieldId: "g_118",
          semanticPath: "ventilation.method",
          type: "dropdown",
          dropdownId: "dd_g_118",
          value: "Volume by Schedule",
          section: "mechanicalLoads",
          span: 2, // spans the empty H: the method's full name shows
          tooltip: true,
          options: [
            { value: "Volume Constant", name: "Volume Constant" },
            { value: "Volume by Schedule", name: "Volume by Schedule" },
            { value: "Occupant Constant", name: "Occupant Constant" },
            { value: "Occupant by Schedule", name: "Occupant by Schedule" },
          ],
          label: "Ventilation Method (Volume or Occupant Based)",
        },
        h: {},
        i: {
          content: "V.1.3",
          classes: ["label-prefix"],
        },
        j: {
          content: "ACH",
          classes: ["label"],
        },
        k: {},
        l: {
          fieldId: "l_118",
          semanticPath: "ventilation.ach",
          type: "editable",
          value: "3.00",
          section: "mechanicalLoads",
          tooltip: true,
          label: "ACH (Air Changes per Hour) for Volume-Based Ventilation",
        },
        m: {
          fieldId: "m_118",
          semanticPath: "ventilation.hrvComplianceRatio",
          type: "calculated",
          value: "162%",
          section: "mechanicalLoads",
          dependencies: ["d_118", "ref_d_118"],
          label: "SRE Ratio to Reference",
        },
        n: {
          fieldId: "n_118",
          semanticPath: "ventilation.hrvComplianceStatus",
          type: "calculated",
          value: "✓",
          section: "mechanicalLoads",
          dependencies: ["m_118"],
          label: "SRE Pass/Fail",
        },
      },
    },

    // ROW 119: Per Person Ventilation Rate
    119: {
      id: "V.1.4",
      rowId: "V.1.4",
      label: "Per Person Ventilation Rate",
      cells: {
        c: { label: "Per Person Ventilation Rate", classes: ["flex-cell"] },
        d: {
          fieldId: "d_119",
          semanticPath: "ventilation.perPersonRate",
          type: "editable",
          value: "14.00",
          section: "mechanicalLoads",
          tooltip: true,
          label: "Per Person Ventilation Rate: l/s per person",
        },
        e: {
          content: "l/s per person",
          classes: ["label"],
        },
        f: {
          fieldId: "f_119",
          semanticPath: "ventilation.perPersonRateCfm",
          type: "calculated",
          value: "29.66",
          section: "mechanicalLoads",
          dependencies: ["d_119"],
          label: "Per Person Ventilation Rate: cfm",
        },
        g: {
          content: "cfm",
          classes: ["label"],
        },
        h: {
          fieldId: "h_119",
          semanticPath: "ventilation.perPersonRateM3h",
          type: "calculated",
          value: "50.40",
          section: "mechanicalLoads",
          dependencies: ["d_119"],
          label: "Per Person Ventilation Rate: m³/hr",
        },
        i: {
          content: "m3/hr",
          classes: ["label"],
        },
        j: { content: "V.1.7", classes: ["label-prefix"] },
        k: {
          content: "Summer Boost",
          classes: ["label"],
        },
        l: {
          fieldId: "l_119",
          semanticPath: "ventilation.summerBoost",
          type: "dropdown",
          dropdownId: "dd_l_119",
          value: "None",
          section: "mechanicalLoads",
          tooltip: true,
          options: [
            { value: "None", name: "None" },
            { value: "1.10", name: "1.10x" },
            { value: "1.20", name: "1.20x" },
            { value: "1.30", name: "1.30x" },
            { value: "1.40", name: "1.40x" },
            { value: "1.50", name: "1.50x" },
            { value: "1.60", name: "1.60x" },
            { value: "1.70", name: "1.70x" },
            { value: "1.80", name: "1.80x" },
            { value: "1.90", name: "1.90x" },
            { value: "2.00", name: "2.00x" },
          ],
          label: "Summer Boost Multiplier",
        },
        m: {
          fieldId: "m_119",
          semanticPath: "ventilation.rateComplianceRatio",
          type: "calculated",
          value: "112%",
          section: "mechanicalLoads",
          tooltip: true,
          dependencies: ["l_118", "d_119", "g_118", "e_12", "d_13", "l_63"],
          label: "Outdoor Air Delivered / Required (ASHRAE 62.1)",
        },
        n: {
          fieldId: "n_119",
          semanticPath: "ventilation.rateComplianceStatus",
          type: "calculated",
          value: "✓",
          section: "mechanicalLoads",
          dependencies: ["m_119"],
          label: "Ventilation Rate Pass/Fail",
        },
      },
    },

    // ROW 120: Volumetric Ventilation Rate
    120: {
      id: "V.1.6",
      rowId: "V.1.6",
      label: "Volumetric Ventilation Rate",
      cells: {
        c: { label: "Volumetric Ventilation Rate", classes: ["flex-cell"] },
        d: {
          fieldId: "d_120",
          semanticPath: "ventilation.volumetricRate",
          type: "calculated",
          value: "3,333.33",
          section: "mechanicalLoads",
          dependencies: [
            "d_63",
            "i_63",
            "j_63",
            "d_105",
            "g_118",
            "l_118",
            "d_119",
          ],
          label: "Volumetric Ventilation Rate: l/s",
        },
        e: {
          content: "l/s",
          classes: ["label"],
        },
        f: {
          fieldId: "f_120",
          semanticPath: "ventilation.volumetricRateCfm",
          type: "calculated",
          value: "7,062.93",
          section: "mechanicalLoads",
          dependencies: ["d_120"],
          label: "Volumetric Ventilation Rate: cfm",
        },
        g: {
          content: "cfm",
          classes: ["label"],
        },
        h: {
          fieldId: "h_120",
          semanticPath: "ventilation.volumetricRateM3h",
          type: "calculated",
          value: "12,000.00",
          section: "mechanicalLoads",
          dependencies: ["d_120"],
          label: "Volumetric Ventilation Rate: m³/hr",
        },
        i: {
          content: "m3/hr",
          classes: ["label"],
        },
        j: { content: "V.1.7", classes: ["label-prefix"] },
        k: {
          fieldId: "k_120",
          semanticPath: "ventilation.unoccupiedSetback",
          type: "percentage",
          value: "90",
          min: 0,
          max: 100,
          step: 10,
          section: "mechanicalLoads",
          tooltip: true,
          classes: ["col-small"],
          label: "Unnoccupied Ventilation Setback (%)",
        },
        l: { content: "Unoccupied Setback", classes: ["label"] },
        m: {},
        n: {},
      },
    },

    // ROW 121: Heating Season Ventil. Energy
    121: {
      id: "V.2.1",
      rowId: "V.2.1",
      label: "Ventilation Heating Load",
      cells: {
        c: { label: "Ventilation Heating Load", classes: ["flex-cell"] },
        d: {
          fieldId: "d_121",
          semanticPath: "ventilation.heatingLoad",
          type: "calculated",
          value: "445,280.00",
          section: "mechanicalLoads",
          dependencies: ["d_120", "d_20"],
          label: "Ventilation Heating Load: kWh/yr",
          tooltip: true,
        },
        e: {
          content: "V.2.2",
          classes: ["label-prefix", "flex-cell"],
        },
        f: {
          content: "Ventilation Energy Recovered",
          classes: ["label", "flex-cell"],
        },
        g: {},
        h: {
          fieldId: "h_121",
          semanticPath: "ventilation.heatingRecovered",
          type: "calculated",
          value: "396,299.20",
          section: "mechanicalLoads",
          dependencies: ["d_121", "d_118"],
          label: "Heating Ventilation Energy Recovered: kWh/yr",
        },
        i: { content: "kWh/yr" },
        j: {
          content: "V.2.3",
          classes: ["label-prefix", "flex-cell"],
        },
        k: {
          content: "Net Htg. Vent. Losses",
          classes: ["label", "flex-cell"],
        },
        l: {},
        m: {
          fieldId: "m_121",
          semanticPath: "ventilation.netHeatingLoss",
          type: "calculated",
          value: "48,980.80",
          section: "mechanicalLoads",
          dependencies: ["d_121", "h_121"],
          label: "Net Heating Season Ventilation Losses: kWh/yr",
        },
        n: {},
      },
    },

    // ROW 122: Incoming Cooling Season Ventil. Energy
    122: {
      id: "V.3.1",
      rowId: "V.3.1",
      label: "Ventilation Cooling Load",
      cells: {
        c: {
          label: "Ventilation Cooling Load",
          classes: ["flex-cell"],
        },
        d: {
          fieldId: "d_122",
          semanticPath: "ventilation.coolingLoad",
          type: "calculated",
          value: "30,257.37",
          section: "mechanicalLoads",
          dependencies: [
            "d_21",
            "i_63",
            "d_116",
            "g_118",
            "l_119",
            "d_120",
            "h_122",
          ],
          tooltip: true,
          label: "Ventilation Cooling Load: kWh/Cooling Season",
        },
        e: {
          content: "V.3.2",
          classes: ["label-prefix", "flex-cell"],
        },
        f: {
          content: "Latent Load Factor",
          classes: ["label", "flex-cell"],
        },
        g: {},
        h: {
          fieldId: "h_122",
          semanticPath: "ventilation.latentLoadFactor",
          type: "calculated",
          value: "159%",
          section: "mechanicalLoads",
          dependencies: ["cooling_latentLoadFactor"],
          label: "Latent Load Factor (from Cooling Calculation): %",
        },
        i: {
          fieldId: "i_122",
          semanticPath: "cooling.latentMethod",
          type: "dropdown",
          dropdownId: "dd_i_122",
          value: "F280",
          section: "mechanicalLoads",
          tooltip: true,
          options: [
            { value: "F280", name: "F280" },
            { value: "OBJECTIVE", name: "OBJECTIVE" },
            { value: "ASHRAE140", name: "ASHRAE 140" },
          ],
          label: "Latent Load Method (F280 / OBJECTIVE / ASHRAE 140)",
        },
        j: {
          content: "ERV LRE",
          classes: ["label"],
        },
        k: {},
        l: {
          fieldId: "l_122",
          semanticPath: "ventilation.ervLatentEfficiency",
          type: "editable",
          value: "0.00",
          classes: ["user-input"],
          section: "mechanicalLoads",
          tooltip: true,
          label: "ERV Latent Recovery Efficiency (LRE): %",
        },
        m: {},
        n: {},
      },
    },

    // ROW 123: Outgoing Cooling Season Ventil. Energy
    123: {
      id: "V.3.3",
      rowId: "V.3.3",
      label: "Ventilation Heat Removal",
      cells: {
        c: {
          label: "Ventilation Heat Removal",
          classes: ["flex-cell"],
        },
        d: {
          fieldId: "d_123",
          semanticPath: "ventilation.heatRemoval",
          type: "calculated",
          value: "26,929.06",
          section: "mechanicalLoads",
          dependencies: ["d_118", "d_122"],
          tooltip: true,
          label: "Ventilation Heat Removal: kWh/Cooling Season",
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

    // ROW 124: Ventilation Free Cooling/Vent Capacity
    124: {
      id: "V.4.1",
      rowId: "V.4.1",
      label: "Ventilation Free Cooling Capacity",
      cells: {
        c: {
          label: "Free Cooling Capacity",
          classes: ["flex-cell"],
        },
        d: {
          fieldId: "d_124",
          semanticPath: "ventilation.freeCoolingCapacity",
          type: "calculated",
          value: "54%",
          section: "mechanicalLoads",
          dependencies: ["h_124", "d_129"],
          label: "Ventilation Free Cooling Capacity: %",
        },
        e: {
          content: "V.4.2",
          classes: ["label-prefix", "flex-cell"],
        },
        f: {
          content: "Free Cooling Limit",
          classes: ["label", "flex-cell"],
        },
        g: {},
        h: {
          fieldId: "h_124",
          semanticPath: "ventilation.freeCoolingLimit",
          type: "calculated",
          value: "37,322.60",
          section: "mechanicalLoads",
          dependencies: ["cooling_freeCoolingLimit", "m_19", "g_118"],
          conditionalDeps: ["k_120"],
          label: "Free Cooling Limit: kWh/yr",
        },
        i: {
          content: "kWh/yr",
          classes: ["label", "flex-cell"],
        },
        j: {},
        k: {
          content: "Days Active Cooling Req'd",
          classes: ["label", "flex-cell"],
        },
        l: {},
        m: {
          fieldId: "m_124",
          semanticPath: "ventilation.activeCoolingDays",
          type: "calculated",
          value: "96",
          section: "mechanicalLoads",
          tooltip: true,
          dependencies: ["cooling_daysActiveCooling", "h_124"],
          label: "Days Active Cooling Required (from Cooling Calc)",
        },
        n: {
          fieldId: "n_124",
          semanticPath: "ventilation.coolingDaysStatus",
          type: "calculated",
          value: "✓",
          section: "mechanicalLoads",
          dependencies: ["m_124"],
          label: "Mech Cooling Days Indicator",
        },
      },
    },
  };

  //==========================================================================
  // ACCESSOR METHODS
  //==========================================================================

  /**
   * Get a field's default value from the single source of truth (sectionRows)
   */
  function getFieldDefault(fieldId) {
    for (const row of Object.values(sectionRows)) {
      if (row.cells) {
        for (const cell of Object.values(row.cells)) {
          if (cell.fieldId === fieldId && cell.value !== undefined) {
            return cell.value;
          }
        }
      }
    }
    return null;
  }

  /**
   * Extract field definitions from the integrated layout
   */
  function getFields() {
    const fields = {};

    Object.entries(sectionRows).forEach(([rowKey, row]) => {
      if (rowKey === "header") return;
      if (!row.cells) return;

      Object.entries(row.cells).forEach(([colKey, cell]) => {
        if (cell.fieldId && cell.type) {
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.label || row.label,
            defaultValue: cell.value || "",
            section: cell.section || "mechanicalLoads",
          };

          if (cell.semanticPath)
            fields[cell.fieldId].semanticPath = cell.semanticPath;
          if (cell.dropdownId)
            fields[cell.fieldId].dropdownId = cell.dropdownId;
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
   */
  function getDropdownOptions() {
    const options = {};

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
   */
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

  /**
   * Helper function to convert a row definition to the layout format
   */
  function createLayoutRow(row) {
    const rowDef = {
      id: row.id,
      cells: [
        {}, // Empty column A
        {}, // ID column B (auto-populated)
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
    ];

    columns.forEach(col => {
      if (row.cells && row.cells[col]) {
        const cell = { ...row.cells[col] };

        if (!cell.classes) {
          cell.classes = ["flex-cell"];
        } else if (!cell.classes.includes("flex-cell")) {
          cell.classes.push("flex-cell");
        }

        if (col === "c") {
          if (cell.type === "label" && cell.content && !cell.label) {
            cell.label = cell.content;
            delete cell.type;
            delete cell.content;
          } else if (!cell.label && !cell.content && row.label) {
            cell.label = row.label;
          }
        }

        // Remove field-specific properties not needed for rendering
        delete cell.options;
        delete cell.section;
        delete cell.dependencies;
        delete cell.value;

        rowDef.cells.push(cell);
      } else {
        if (col === "c" && !row.cells?.c && row.label) {
          rowDef.cells.push({ label: row.label, classes: ["flex-cell"] });
        } else {
          rowDef.cells.push({ classes: ["flex-cell"] });
        }
      }
    });

    return rowDef;
  }

  //==========================================================================
  // EVENT HANDLING
  //==========================================================================

  /**
   * Initialize all event handlers for this section
   */
  function initializeEventHandlers() {
    const sectionElement = document.getElementById("mechanicalLoads");
    if (!sectionElement) {
      return;
    }

    // --- Standard Editable Field Handlers ---
    const editableFields = sectionElement.querySelectorAll(
      ".editable.user-input"
    );
    editableFields.forEach(field => {
      if (!field.hasEditableListeners) {
        field.setAttribute("contenteditable", "true");
        field.addEventListener("blur", handleEditableBlur);
        field.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            this.blur();
          }
        });
        field.hasEditableListeners = true;
      }
    });

    // --- StateManager Listeners ---
    if (window.TEUI && window.TEUI.StateManager) {
      const sm = window.TEUI.StateManager;

      // d_113 listener: ghosting UI only — graph handles computation
      sm.addListener("d_113", (newValue) => {
        handleHeatingSystemChangeForGhosting(newValue);
      });

      // Add direct HSPF slider handler (S11 proven pattern)
      const f113Slider = document.querySelector(
        'input[type="range"][data-field-id="f_113"]'
      );
      if (f113Slider && !f113Slider.hasSliderListener) {
        // Input event for display updates only (no calculations)
        f113Slider.addEventListener("input", function () {
          const hspfValue = parseFloat(this.value);
          if (isNaN(hspfValue)) return;

          const displaySpan = this.parentElement.querySelector(".slider-value");
          if (displaySpan) {
            displaySpan.textContent = hspfValue.toFixed(1);
          }
        });

        // Change event for final value commit (after thumb release)
        f113Slider.addEventListener("change", function () {
          const hspfValue = parseFloat(this.value);
          if (isNaN(hspfValue)) return;

          setModeValue("f_113", hspfValue.toString(), "user-modified");
          /* graph computes */
        });

        f113Slider.hasSliderListener = true;
      }

      // Add direct d_118 slider handler
      const d118Slider = document.querySelector(
        'input[type="range"][data-field-id="d_118"]'
      );
      if (d118Slider && !d118Slider.hasSliderListener) {
        d118Slider.addEventListener("input", function () {
          const efficiencyValue = parseFloat(this.value);
          if (isNaN(efficiencyValue)) return;

          const displaySpan = this.parentElement.querySelector(".slider-value");
          if (displaySpan) {
            displaySpan.textContent = efficiencyValue.toFixed(0) + "%";
          }

          setModeValue(
            "d_118",
            efficiencyValue.toString(),
            "user-modified"
          );
          /* graph computes */
        });

        d118Slider.addEventListener("change", function () {
          const efficiencyValue = parseFloat(this.value);
          if (isNaN(efficiencyValue)) return;

          setModeValue(
            "d_118",
            efficiencyValue.toString(),
            "user-modified"
          );
          /* graph computes */
        });

        d118Slider.hasSliderListener = true;
      }
    } else {
      console.error(
        "[Section13] StateManager not available to add listeners!"
      );
    }

    // --- Use Event Delegation for k_120 control ---
    if (sectionElement && !sectionElement.hasK120DelegateListener) {
      sectionElement.addEventListener("input", handleK120Input);
      sectionElement.addEventListener("change", handleK120Change);
      sectionElement.hasK120DelegateListener = true;
    }

    // --- Handler for k_120 input (display updates only, no calculations) ---
    function handleK120Input(e) {
      if (e.target && e.target.matches('[data-field-id="k_120"]')) {
        const sliderValueStr = e.target.value;
        const displaySpan = document.querySelector(
          `#mechanicalLoads span[data-display-for="k_120"]`
        );
        if (displaySpan) {
          const numericSliderValue = parseFloat(sliderValueStr);
          if (!isNaN(numericSliderValue)) {
            displaySpan.textContent = `${numericSliderValue.toFixed(0)}%`;
          }
        }
      }
    }

    // --- Handler for k_120 change (value commit after thumb release) ---
    function handleK120Change(e) {
      if (e.target && e.target.matches('[data-field-id="k_120"]')) {
        const controlElement = e.target;
        const fieldId = controlElement.getAttribute("data-field-id");
        const sliderValueStr = controlElement.value;

        if (!fieldId) return;

        if (window.TEUI.StateManager) {
          window.TEUI.StateManager.setValue(
            fieldId,
            sliderValueStr,
            "user-modified"
          );
        }

        /* graph computes */
      }
    }
  }

  /**
   * Handle blur events on editable fields
   */
  function handleEditableBlur(event) {
    const fieldId = this.getAttribute("data-field-id");
    if (!fieldId) return;

    const newValue = this.textContent.trim();
    const numericValue = window.TEUI.parseNumeric(newValue, NaN);

    if (!isNaN(numericValue)) {
      const formatType =
        fieldId === "j_115" || fieldId === "l_118"
          ? "number-2dp"
          : "number-2dp";
      const formattedDisplay = window.TEUI.formatNumber(
        numericValue,
        formatType
      );
      this.textContent = formattedDisplay;

      if (window.TEUI.StateManager) {
        const valueToStore = numericValue.toString();
        setModeValue(fieldId, valueToStore, "user-modified");

        if (fieldId === "j_116") {
          const currentStateValue = getModeValue("j_116");
          if (currentStateValue) {
            const numVal = window.TEUI.parseNumeric(currentStateValue);
            if (!isNaN(numVal)) {
              this.textContent = window.TEUI.formatNumber(
                numVal,
                "number-2dp"
              );
            }
          }
        }
      }
    } else {
      // Revert logic if input is not a number
      let previousValue = window.TEUI.StateManager?.getValue(fieldId);
      if (previousValue === null || previousValue === undefined) {
        const fields = getFields();
        const fieldDef = fields[fieldId];
        previousValue = fieldDef?.defaultValue || "0";
      }
      const prevNumericValue = window.TEUI.parseNumeric(previousValue, 0);
      const formatType =
        fieldId === "j_115" || fieldId === "l_118"
          ? "number-2dp"
          : "number-2dp";
      this.textContent = window.TEUI.formatNumber(prevNumericValue, formatType);
    }
  }

  /**
   * Called when the section is rendered
   */
  function onSectionRendered() {
    // 3. Initialize event handlers for this section
    initializeEventHandlers();

    // 4. Apply validation tooltips to fields
    if (window.TEUI.TooltipManager && window.TEUI.TooltipManager.initialized) {
      setTimeout(() => {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }

    if (window.TEUI?.StateManager?.setValue) {
      const fields = getFields();
      Object.entries(fields).forEach(([fieldId, fieldDef]) => {
        if (
          (fieldId === "d_119" ||
            fieldId === "j_115" ||
            fieldId === "j_116" ||
            fieldId === "l_118") &&
          fieldDef.defaultValue
        ) {
          if (window.TEUI.StateManager.getValue(fieldId) === null) {
            window.TEUI.StateManager.setValue(
              fieldId,
              fieldDef.defaultValue,
              "default"
            );
          }
        }
      });
    }

    /* graph computes — no calculateAll() or updateCalculatedDisplayValues() calls */

    // Set up dropdown event handlers
    setupDropdownEventHandlers();

    if (window.TEUI?.StateManager && window.TEUI?.formatNumber) {
      const fieldsToUpdate = ["d_119", "j_115", "j_116", "l_118"];
      fieldsToUpdate.forEach(fieldId => {
        const element = document.querySelector(
          `td[data-field-id="${fieldId}"]`
        );
        const stateValue = window.TEUI.StateManager.getValue(fieldId);
        if (element && stateValue !== null && stateValue !== undefined) {
          const numVal = window.TEUI.parseNumeric(stateValue, NaN);
          if (!isNaN(numVal)) {
            const formatType = "number-2dp";
            const formattedDisplay = window.TEUI.formatNumber(
              numVal,
              formatType
            );
            element.textContent = formattedDisplay;
          }
        }
      });
    }

    // An old file's or session's "Cooling" stored as what it means
    settleStoredCoolingChoice();

    // 5. Update conditional UI (ghosting) for current mode
    updateConditionalUI();

    // Set initial ghosting state after calculations might have populated values
    setTimeout(() => {
      const initialHeatingSystem =
        window.TEUI?.StateManager?.getValue("d_113") || "Heatpump";
      handleHeatingSystemChangeForGhosting(initialHeatingSystem);
    }, 100);
  }

  /**
   * Set up dropdown event handlers (following S09/S07/S02 pattern)
   */
  function setupDropdownEventHandlers() {
    const sectionElement = document.getElementById("mechanicalLoads");
    if (!sectionElement) return;

    const dropdowns = sectionElement.querySelectorAll("select");
    dropdowns.forEach(dropdown => {
      dropdown.removeEventListener("change", handleDropdownChange);
      dropdown.addEventListener("change", handleDropdownChange);
    });
  }

  /**
   * Handle dropdown changes (following S09 pattern)
   */
  function handleDropdownChange(e) {
    const fieldId = e.target.getAttribute("data-field-id");
    if (!fieldId) return;

    const newValue = e.target.value;

    setModeValue(fieldId, newValue, "user-modified");

    // Special handling for heating system changes
    if (fieldId === "d_113") {
      // The heat pump option needs a heat pump: without one the cooling
      // becomes Separate Cooling, at the standard's minimum COPc.
      const CS = window.TEUI.CoolingSystem;
      const cooling = getModeValue("d_116");
      if (
        CS &&
        cooling !== CS.NONE &&
        cooling !== CS.SEPARATE &&
        newValue !== "Heatpump"
      ) {
        enterSeparateCooling();
      }
      handleHeatingSystemChangeForGhosting(newValue);
    }

    // Choosing Separate Cooling fills M.3.3 with the standard's minimum; the
    // user then types the unit's own COPc over it (Andy 2026-11-18).
    if (
      fieldId === "d_116" &&
      newValue === window.TEUI.CoolingSystem?.SEPARATE
    ) {
      enterSeparateCooling();
    }

    // Special handling for cooling system (d_116) and recovery type (e_118) changes
    if (fieldId === "d_116" || fieldId === "e_118") {
      const currentHeatingSystem = getModeValue("d_113") || "Heatpump";
      handleHeatingSystemChangeForGhosting(currentHeatingSystem);
    }

    // Special handling for ventilation method changes
    if (fieldId === "g_118") {
      const currentACH = getModeValue("l_118");

      if (newValue === "Volume Constant") {
        const expectedACH = getFieldDefault("l_118") || "3";
        if (currentACH !== expectedACH) {
          // TODO: Add logic to update l_118 to expectedACH if needed
        }
      }
    }

    /* graph computes — no calculateAll() or updateCalculatedDisplayValues() calls */
  }

  //==========================================================================
  // THE COOLING CHOICE (M.3.0, d_116) - Andy 2026-11-18
  //==========================================================================
  // Heatpump Heats & Cools: the heat pump cools at M.1.3 (from HSPF); M.3.3
  // is locked and shows M.1.3. Separate Cooling: M.3.3 is the unit's own
  // COPc, editable. No Cooling: the load stands, unmet. The values and the
  // reading of an old file's "Cooling" are window.TEUI.CoolingSystem
  // (MechanicalNodes), the one source the engine also reads.

  /** The selected standard's minimum COPc (ReferenceValues j_116). */
  function standardMinimumCopCool() {
    const RV = window.TEUI.ReferenceValues || {};
    const standard = window.TEUI.StateManager?.getValue("d_13");
    const values = RV[standard] || RV["OBC SB12 3.1.1.2.C4"];
    return values?.j_116 ?? null;
  }

  /**
   * The current mode becomes Separate Cooling with M.3.3 at the standard's
   * minimum - on a user's choice only (an import carries its own M.3.3).
   */
  function enterSeparateCooling() {
    const CS = window.TEUI.CoolingSystem;
    if (!CS) return;
    if (getModeValue("d_116") !== CS.SEPARATE) {
      setModeValue("d_116", CS.SEPARATE, "user-modified");
    }
    const minimum = standardMinimumCopCool();
    if (minimum !== null) {
      setModeValue("j_116", String(minimum), "user-modified");
    }
  }

  /**
   * An old "Cooling", or the heat pump option without a heat pump, stored as
   * what it means - for Target and Reference - so the dropdown shows a real
   * option and the next save writes the new names.
   */
  function settleStoredCoolingChoice() {
    const CS = window.TEUI.CoolingSystem;
    const sm = window.TEUI.StateManager;
    if (!CS || !sm) return;
    for (const prefix of ["", "ref_"]) {
      const stored = sm.getValue(`${prefix}d_116`);
      if (stored === null || stored === undefined || stored === "") continue;
      const settled = CS.normalize(stored, sm.getValue(`${prefix}d_113`));
      if (settled !== stored) sm.setValue(`${prefix}d_116`, settled, "default");
    }
  }

  /** The heat pump option is offered only when M.1.0 is Heatpump. */
  function updateCoolingOptions(isHP, cooling) {
    const select = document.querySelector('select[data-field-id="d_116"]');
    if (!select) return;
    const CS = window.TEUI.CoolingSystem;
    for (const option of select.options) {
      if (option.value === CS.HEATPUMP) {
        option.hidden = !isHP;
        option.disabled = !isHP;
      }
    }
    if (select.value !== cooling) select.value = cooling;
  }

  /**
   * M.3.3 shows the COP the heat pump cools at while it cools - M.1.3 in the
   * Target, the standard's minimum in the Reference (Andy 2026-10-31) - and its
   * own value otherwise.
   */
  function refreshCopCoolDisplay(cooling) {
    const CS = window.TEUI.CoolingSystem;
    const cell = document.querySelector('td[data-field-id="j_116"]');
    if (!cell || !CS) return;
    const isRef = window.TEUI.ReferenceToggle?.isReferenceMode?.();
    let shown = getModeValue("j_116");
    if (cooling === CS.HEATPUMP) {
      shown = isRef ? standardMinimumCopCool() : getModeValue("j_113");
    }
    const value = window.TEUI.parseNumeric(shown, NaN);
    if (!isNaN(value)) {
      cell.textContent = window.TEUI.formatNumber(value, "number-2dp");
    }
  }

  /** The current mode's cooling choice: options, M.3.3, and its row's ghosting. */
  function updateCoolingUI(heatingSystem) {
    const CS = window.TEUI.CoolingSystem;
    if (!CS) return;
    const heating = heatingSystem || getModeValue("d_113");
    const cooling = CS.normalize(getModeValue("d_116"), heating);
    updateCoolingOptions(heating === "Heatpump", cooling);
    setFieldGhosted("j_116", cooling !== CS.SEPARATE);
    setFieldGhosted("l_116", cooling !== CS.SEPARATE);
    setFieldGhosted("m_116", cooling === CS.NONE);
    refreshCopCoolDisplay(cooling);
  }

  //==========================================================================
  // GHOSTING FUNCTIONS
  //==========================================================================

  // Helper function to apply/remove disabled styling
  function setFieldDisabled(fieldId, isDisabled) {
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (element) {
      const cell = element.closest("td");
      if (cell) {
        cell.classList.toggle("ghost-text", isDisabled);
        const slider = cell.querySelector('input[type="range"]');
        if (slider) slider.disabled = isDisabled;
      } else {
        element.classList.toggle("ghost-text", isDisabled);
      }
    }
  }

  /**
   * Helper to add/remove a ghosting class to a field's TD element.
   */
  function setFieldGhosted(fieldId, shouldBeGhosted) {
    const valueCell = document.querySelector(`td[data-field-id="${fieldId}"]`);

    if (valueCell) {
      valueCell.classList.toggle("disabled-input", shouldBeGhosted);

      const input = valueCell.querySelector(
        'input, select, [contenteditable="true"]'
      );
      if (input) {
        if (input.hasAttribute("contenteditable")) {
          input.contentEditable = !shouldBeGhosted;
        } else {
          input.disabled = shouldBeGhosted;
        }
      }
      if (valueCell.hasAttribute("contenteditable"))
        valueCell.contentEditable = !shouldBeGhosted;

      const labelCell = valueCell.previousElementSibling;
      if (
        labelCell &&
        labelCell.tagName === "TD" &&
        !labelCell.hasAttribute("data-field-id")
      ) {
        labelCell.classList.toggle("disabled-input", shouldBeGhosted);
      }
    }
  }

  /**
   * Handles changes to d_113 to apply/remove ghosting styles.
   * PRESERVED: Called from FileHandler.syncPostImportUI
   */
  function handleHeatingSystemChangeForGhosting(newValue) {
    const systemType = newValue;

    const isHP = systemType === "Heatpump";
    const isGas = systemType === "Gas";
    const isOil = systemType === "Oil";
    const isElectric = systemType === "Electricity";
    const isFossilFuel = isGas || isOil;

    // --- Ghosting based on Heating System ---

    // Heatpump specific fields
    setFieldGhosted("f_113", !isHP);
    setFieldGhosted("h_113", !isHP);
    setFieldGhosted("j_113", !isHP);
    setFieldGhosted("j_114", !isHP);
    setFieldGhosted("l_113", !isHP);

    // Gas specific fields
    setFieldGhosted("h_115", !isGas);

    // Oil specific fields
    setFieldGhosted("f_115", !isOil);

    // AFUE field (j_115) - Active only for Gas/Oil
    setFieldGhosted("j_115", !isFossilFuel);

    // Exhaust field (l_115) - Active only for Gas/Oil
    setFieldGhosted("l_115", !isFossilFuel);

    // --- ROW 116: the cooling choice (options, M.3.3, its sink) ---
    updateCoolingUI(systemType);

    // Row 122 l_122 (ERV latent recovery): active only for an ERV (e_118)
    const isERV = window.TEUI?.StateManager?.getValue("e_118") === "ERV";
    setFieldGhosted("l_122", !isERV);

    // Row 115: Heating Fuel Impact - Ghost entire row if not Gas or Oil
    const row115 = document.querySelector('tr[data-id="M.2.2"]');
    if (row115) {
      row115.classList.toggle("ghosted", !isFossilFuel);
      const controlsInRow = row115.querySelectorAll(
        'input, select, [contenteditable="true"]'
      );
      controlsInRow.forEach(control => {
        if (control.getAttribute("data-field-id") !== "j_115") {
          if (control.hasAttribute("contenteditable")) {
            control.contentEditable = isFossilFuel;
          } else {
            control.disabled = !isFossilFuel;
          }
        } else {
          setFieldGhosted("j_115", !isFossilFuel);
        }
      });
    }
  }

  /**
   * Standalone conditional UI update - reads current mode's d_113 to set ghosting.
   */
  function updateConditionalUI() {
    const currentHeatingSystem = getModeValue("d_113") || getFieldDefault("d_113") || "Heatpump";
    if (currentHeatingSystem) {
      handleHeatingSystemChangeForGhosting(currentHeatingSystem);
    }
  }

  /**
   * Called by ReferenceToggle when mode switches.
   */
  function onModeSwitch(mode) {
    updateConditionalUI();
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

    onModeSwitch: onModeSwitch,

    // After every DOMBridge stamp: it writes j_116 from the graph, so M.3.3's
    // mirror of M.1.3 (the heat pump cooling) is restored here, following HSPF.
    postStamp: () => updateCoolingUI(),

    // Ghosting functions
    setFieldGhosted: setFieldGhosted,
    handleHeatingSystemChangeForGhosting: handleHeatingSystemChangeForGhosting,
    setFieldDisabled: setFieldDisabled,
  };
})();

