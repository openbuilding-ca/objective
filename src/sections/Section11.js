/**
 * 4012-Section11.js
 * Refactored Transmission Losses (Section 11) module for TEUI Calculator 4.012
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

// Section 11: Transmission Losses Module
window.TEUI.SectionModules.sect11 = (function () {
  //==========================================================================
  // CONFIGURATION
  //==========================================================================

  //==========================================================================
  // ✅ S10-S11 AREA SYNC: Guard flags and state variables (CRASH PREVENTION)
  //==========================================================================
  let isS11Initialized = false; // Prevents sync before initialization completes
  let isSyncingFromS10 = false; // Prevents recursion in sync function
  let syncTimeout = null; // For debouncing rapid sync calls
  let isInitializationPhase = true; // ✅ FIX: Disable DUAL-STATE SYNC after initialization
  let isImportActive = false; // ✅ FIX: Allow DUAL-STATE SYNC during import (set by FileHandler)

  // componentTypes removed — graph handles all indicator calculations

  //==========================================================================
  // ✅ S10-S11 AREA SYNC: Field mapping (RESTORED from Sept 2025 removal)
  //==========================================================================
  const areaSourceMap = {
    d_88: "d_73", // S11 Doors → S10 Doors
    d_89: "d_74", // S11 Window North → S10 Window North
    d_90: "d_75", // S11 Window East → S10 Window East
    d_91: "d_76", // S11 Window South → S10 Window South
    d_92: "d_77", // S11 Window West → S10 Window West
    d_93: "d_78", // S11 Skylights → S10 Skylights
  };

  // componentConfig removed — graph handles all component row calculations

  // List of all editable fields in this section
  const editableFields = [
    "d_85",
    "f_85",
    "d_86",
    "f_86",
    "d_87",
    "f_87", // Air-facing RSI inputs
    "d_88", // Door area (now editable like row 85)
    "g_88",
    "d_89", // Window North area (now editable like row 85)
    "g_89",
    "d_90", // Window East area (now editable like row 85)
    "g_90",
    "d_91", // Window South area (now editable like row 85)
    "g_91",
    "d_92", // Window West area (now editable like row 85)
    "g_92",
    "d_93", // Skylight area (now editable like row 85)
    "g_93", // Window/Door U-value inputs
    "d_94",
    "f_94",
    "d_95",
    "f_95", // Ground-facing RSI inputs
    "d_96", // Interior Floor Area
    "d_97", // Thermal Bridge Penalty slider
  ];

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
  // LAYOUT DEFINITION (sectionRows)
  //==========================================================================
  const sectionRows = {
    header: {
      id: "11-ID",
      rowId: "11-ID",
      label: "Transmission Losses Units",
      cells: {
        c: { content: "", classes: ["section-subheader"] },
        d: {
          content: "Areas m²",
          classes: ["section-subheader", "align-center"],
        },
        e: {
          content: "Rimp ft²F•hr/Btu",
          classes: ["section-subheader", "align-center"],
        },
        f: {
          content: "RSI K•m²/W",
          classes: ["section-subheader", "align-center"],
        },
        g: {
          content: "U-Value W/m²•K",
          classes: ["section-subheader", "align-center"],
        },
        h: {
          content: "% of Ae & Ag",
          classes: ["section-subheader", "align-center"],
        },
        i: {
          content: "Heatloss\nkWh/Heating",
          classes: ["section-subheader", "align-center"],
        },
        j: {
          content: "Heatloss %",
          classes: ["section-subheader", "align-center"],
        },
        k: {
          content: "Heatgain\nkWh/Cooling",
          classes: ["section-subheader", "align-center"],
        },
        l: {
          content: "Heatgain %",
          classes: ["section-subheader", "align-center"],
        },
        m: {
          content: "Reference",
          classes: ["section-subheader", "align-center"],
        }, // Updated label
        n: {
          content: "Status",
          classes: ["section-subheader", "align-center"],
        }, // Updated label
        o: {
          content: "Surface °C",
          classes: ["section-subheader", "align-center"],
        },
      },
    },
    85: {
      id: "B.4",
      rowId: "B.4",
      label: "Roof",
      cells: {
        c: { label: "Roof" },
        d: {
          fieldId: "d_85",
          semanticPath: "envelope.roof.area",
          type: "editable",
          value: "1411.52",
          label: "Roof: Area m²",
        },
        e: {
          fieldId: "e_85",
          semanticPath: "envelope.roof.rValueImperial",
          type: "calculated",
          value: "0.00",
          dependencies: ["f_85"],
          label: "Roof: R-Value Imperial",
        },
        f: {
          fieldId: "f_85",
          semanticPath: "envelope.roof.rsiValue",
          type: "editable",
          value: "9.35",
          label: "Roof: RSI Value K·m²/W",
        },
        g: {
          fieldId: "g_85",
          semanticPath: "envelope.roof.uValue",
          type: "calculated",
          value: "0.00",
          dependencies: ["f_85"],
          label: "Roof: U-Value W/m²·K",
        },
        h: {
          fieldId: "h_85",
          semanticPath: "envelope.roof.percentOfEnvelope",
          type: "calculated",
          value: "0%",
          dependencies: ["d_85", "d_101"],
          classes: ["text-air-facing"],
          label: "Roof: % of Total Envelope Area",
        },
        i: {
          fieldId: "i_85",
          semanticPath: "envelope.roof.heatLoss",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_85", "d_20", "f_85"],
          label: "Roof: Heat Loss kWh/yr",
        },
        j: {
          fieldId: "j_85",
          semanticPath: "envelope.roof.heatLossPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["i_85", "i_98"],
          label: "Roof: Heat Loss %",
        },
        k: {
          fieldId: "k_85",
          semanticPath: "envelope.roof.heatGain",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_85", "d_21", "f_85"],
          label: "Roof: Heat Gain kWh/Cooling Season",
        },
        l: {
          fieldId: "l_85",
          semanticPath: "envelope.roof.heatGainPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["k_85", "k_98"],
          label: "Roof: Heat Gain %",
        },
        m: {
          fieldId: "m_85",
          semanticPath: "envelope.roof.complianceRatio",
          type: "calculated",
          value: "0%",
          dependencies: ["f_85", "t_85"],
          label: "Roof: Reference Compliance Ratio",
        },
        n: { fieldId: "n_85", semanticPath: "envelope.roof.complianceStatus", type: "calculated", value: "✓" },
        o: {
          fieldId: "o_85",
          semanticPath: "envelope.roof.surfaceTemperature",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_85", "g_85", "h_23", "d_25"],
          label: "Roof: Interior Surface Temperature °C",
          tooltip: true,
        },
      },
    },
    86: {
      id: "B.5",
      rowId: "B.5",
      label: "Walls Above Grade (Exclude Openings!)",
      cells: {
        c: { label: "Walls Above Grade (Exclude Openings!)" },
        d: {
          fieldId: "d_86",
          semanticPath: "envelope.wallsAbove.area",
          type: "editable",
          value: "705.27",
          label: "Walls Above Grade: Area m²",
        },
        e: {
          fieldId: "e_86",
          semanticPath: "envelope.wallsAbove.rValueImperial",
          type: "calculated",
          value: "0.00",
          dependencies: ["f_86"],
          label: "Walls Above Grade: R-Value Imperial",
        },
        f: {
          fieldId: "f_86",
          semanticPath: "envelope.wallsAbove.rsiValue",
          type: "editable",
          value: "6.69",
          label: "Walls Above Grade: RSI Value K·m²/W",
        },
        g: {
          fieldId: "g_86",
          semanticPath: "envelope.wallsAbove.uValue",
          type: "calculated",
          value: "0.00",
          dependencies: ["f_86"],
          label: "Walls Above Grade: U-Value W/m²·K",
        },
        h: {
          fieldId: "h_86",
          semanticPath: "envelope.wallsAbove.percentOfEnvelope",
          type: "calculated",
          value: "0%",
          dependencies: ["d_86", "d_101"],
          classes: ["text-air-facing"],
          label: "Walls Above Grade: % of Total Envelope Area",
        },
        i: {
          fieldId: "i_86",
          semanticPath: "envelope.wallsAbove.heatLoss",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_86", "d_20", "f_86"],
          label: "Walls Above Grade: Heat Loss kWh/yr",
        },
        j: {
          fieldId: "j_86",
          semanticPath: "envelope.wallsAbove.heatLossPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["i_86", "i_98"],
          label: "Walls Above Grade: Heat Loss %",
        },
        k: {
          fieldId: "k_86",
          semanticPath: "envelope.wallsAbove.heatGain",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_86", "d_21", "f_86"],
          label: "Walls Above Grade: Heat Gain kWh/Cooling Season",
        },
        l: {
          fieldId: "l_86",
          semanticPath: "envelope.wallsAbove.heatGainPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["k_86", "k_98"],
          label: "Walls Above Grade: Heat Gain %",
        },
        m: {
          fieldId: "m_86",
          semanticPath: "envelope.wallsAbove.complianceRatio",
          type: "calculated",
          value: "0%",
          dependencies: ["f_86", "t_86"],
          label: "Walls Above Grade: Reference Compliance Ratio",
        },
        n: { fieldId: "n_86", semanticPath: "envelope.wallsAbove.complianceStatus", type: "calculated", value: "✓" },
        o: {
          fieldId: "o_86",
          semanticPath: "envelope.wallsAbove.surfaceTemperature",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_86", "g_86", "h_23", "d_25"],
          label: "Walls Above Grade: Interior Surface Temperature °C",
          tooltip: true,
        },
      },
    },
    87: {
      id: "B.6",
      rowId: "B.6",
      label: "Floor Exposed",
      cells: {
        c: { label: "Floor Exposed" },
        d: {
          fieldId: "d_87",
          semanticPath: "envelope.floorExposed.area",
          type: "editable",
          value: "0.00",
          label: "Floor Exposed: Area m²",
        },
        e: {
          fieldId: "e_87",
          semanticPath: "envelope.floorExposed.rValueImperial",
          type: "calculated",
          value: "0.00",
          dependencies: ["f_87"],
          label: "Floor Exposed: R-Value Imperial",
        },
        f: {
          fieldId: "f_87",
          semanticPath: "envelope.floorExposed.rsiValue",
          type: "editable",
          value: "9.52",
          label: "Floor Exposed: RSI Value K·m²/W",
        },
        g: {
          fieldId: "g_87",
          semanticPath: "envelope.floorExposed.uValue",
          type: "calculated",
          value: "0.00",
          dependencies: ["f_87"],
          label: "Floor Exposed: U-Value W/m²·K",
        },
        h: {
          fieldId: "h_87",
          semanticPath: "envelope.floorExposed.percentOfEnvelope",
          type: "calculated",
          value: "0%",
          dependencies: ["d_87", "d_101"],
          classes: ["text-air-facing"],
          label: "Floor Exposed: % of Total Envelope Area",
        },
        i: {
          fieldId: "i_87",
          semanticPath: "envelope.floorExposed.heatLoss",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_87", "d_20", "f_87"],
          label: "Floor Exposed: Heat Loss kWh/yr",
        },
        j: {
          fieldId: "j_87",
          semanticPath: "envelope.floorExposed.heatLossPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["i_87", "i_98"],
          label: "Floor Exposed: Heat Loss %",
        },
        k: {
          fieldId: "k_87",
          semanticPath: "envelope.floorExposed.heatGain",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_87", "d_21", "f_87"],
          label: "Floor Exposed: Heat Gain kWh/Cooling Season",
        },
        l: {
          fieldId: "l_87",
          semanticPath: "envelope.floorExposed.heatGainPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["k_87", "k_98"],
          label: "Floor Exposed: Heat Gain %",
        },
        m: {
          fieldId: "m_87",
          semanticPath: "envelope.floorExposed.complianceRatio",
          type: "calculated",
          value: "0%",
          dependencies: ["f_87", "t_87"],
          label: "Floor Exposed: Reference Compliance Ratio",
        },
        n: { fieldId: "n_87", semanticPath: "envelope.floorExposed.complianceStatus", type: "calculated", value: "✓" },
        o: {
          fieldId: "o_87",
          semanticPath: "envelope.floorExposed.surfaceTemperature",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_87", "g_87", "h_23", "d_25"],
          label: "Floor Exposed: Interior Surface Temperature °C",
          tooltip: true,
        },
      },
    },
    88: {
      id: "B.7.0",
      rowId: "B.7.0",
      label: "Door",
      cells: {
        c: { label: "Door" },
        d: {
          fieldId: "d_88",
          semanticPath: "envelope.doors.area",
          type: "calculated",
          value: "",
          dependencies: ["d_73"],
          label: "S11: Doors: Area m²",
        }, // ✅ S10-S11 AREA SYNC: Will sync from S10 d_73
        e: {
          fieldId: "e_88",
          semanticPath: "envelope.doors.rValueImperial",
          type: "calculated",
          value: "0.00",
          dependencies: ["f_88"],
          label: "Doors: R-Value Imperial",
        },
        f: {
          fieldId: "f_88",
          semanticPath: "envelope.doors.rsiValue",
          type: "calculated",
          value: "0.00",
          dependencies: ["g_88"],
          label: "Doors: RSI Value K·m²/W",
        },
        g: {
          fieldId: "g_88",
          semanticPath: "envelope.doors.uValue",
          type: "editable",
          value: "1.990",
          label: "Doors: U-Value W/m²·K",
        },
        h: {
          fieldId: "h_88",
          semanticPath: "envelope.doors.percentOfEnvelope",
          type: "calculated",
          value: "0%",
          dependencies: ["d_88", "d_101"],
          classes: ["text-air-facing"],
          label: "Doors: % of Total Envelope Area",
        },
        i: {
          fieldId: "i_88",
          semanticPath: "envelope.doors.heatLoss",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_88", "d_20", "f_88"],
          label: "Doors: Heat Loss kWh/yr",
        },
        j: {
          fieldId: "j_88",
          semanticPath: "envelope.doors.heatLossPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["i_88", "i_98"],
          label: "Doors: Heat Loss %",
        },
        k: {
          fieldId: "k_88",
          semanticPath: "envelope.doors.heatGain",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_88", "d_21", "f_88"],
          label: "Doors: Heat Gain kWh/Cooling Season",
        },
        l: {
          fieldId: "l_88",
          semanticPath: "envelope.doors.heatGainPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["k_88", "k_98"],
          label: "Doors: Heat Gain %",
        },
        m: {
          fieldId: "m_88",
          semanticPath: "envelope.doors.complianceRatio",
          type: "calculated",
          value: "0%",
          dependencies: ["t_88", "g_88"],
          label: "Doors: Reference Compliance Ratio",
        },
        n: { fieldId: "n_88", semanticPath: "envelope.doors.complianceStatus", type: "calculated", value: "✓" },
        o: {
          fieldId: "o_88",
          semanticPath: "envelope.doors.surfaceTemperature",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_88", "g_88", "h_23", "d_25"],
          label: "Doors: Interior Surface Temperature °C",
          tooltip: true,
        },
      },
    },
    89: {
      id: "B.8.1",
      rowId: "B.8.1",
      label: "Window",
      cells: {
        c: { label: "Window" },
        d: {
          fieldId: "d_89",
          semanticPath: "envelope.windowNorth.area",
          type: "calculated",
          value: "",
          dependencies: ["d_74"],
          label: "S11: Window Area North: Area m²",
        }, // ✅ S10-S11 AREA SYNC: Will sync from S10 d_74
        e: {
          fieldId: "e_89",
          semanticPath: "envelope.windowNorth.rValueImperial",
          type: "calculated",
          value: "0.00",
          dependencies: ["f_89"],
          label: "Window Area North: R-Value Imperial",
        },
        f: {
          fieldId: "f_89",
          semanticPath: "envelope.windowNorth.rsiValue",
          type: "calculated",
          value: "0.00",
          dependencies: ["g_89"],
          label: "Window Area North: RSI Value K·m²/W",
        },
        g: {
          fieldId: "g_89",
          semanticPath: "envelope.windowNorth.uValue",
          type: "editable",
          value: "1.420",
          label: "Window Area North: U-Value W/m²·K",
        },
        h: {
          fieldId: "h_89",
          semanticPath: "envelope.windowNorth.percentOfEnvelope",
          type: "calculated",
          value: "0%",
          dependencies: ["d_89", "d_101"],
          classes: ["text-air-facing"],
          label: "Window Area North: % of Total Envelope Area",
        },
        i: {
          fieldId: "i_89",
          semanticPath: "envelope.windowNorth.heatLoss",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_89", "d_20", "f_89"],
          label: "Window Area North: Heat Loss kWh/yr",
        },
        j: {
          fieldId: "j_89",
          semanticPath: "envelope.windowNorth.heatLossPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["i_89", "i_98"],
          label: "Window Area North: Heat Loss %",
        },
        k: {
          fieldId: "k_89",
          semanticPath: "envelope.windowNorth.heatGain",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_89", "d_21", "f_89"],
          label: "Window Area North: Heat Gain kWh/Cooling Season",
        },
        l: {
          fieldId: "l_89",
          semanticPath: "envelope.windowNorth.heatGainPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["k_89", "k_98"],
          label: "Window Area North: Heat Gain %",
        },
        m: {
          fieldId: "m_89",
          semanticPath: "envelope.windowNorth.complianceRatio",
          type: "calculated",
          value: "0%",
          dependencies: ["t_89", "g_89"],
          label: "Window Area North: Reference Compliance Ratio",
        },
        n: { fieldId: "n_89", semanticPath: "envelope.windowNorth.complianceStatus", type: "calculated", value: "✓" },
        o: {
          fieldId: "o_89",
          semanticPath: "envelope.windowNorth.surfaceTemperature",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_89", "g_89", "h_23", "d_25"],
          label: "Window North: Interior Surface Temperature °C",
          tooltip: true,
        },
      },
    },
    90: {
      id: "B.8.2",
      rowId: "B.8.2",
      label: "Window",
      cells: {
        c: { label: "Window" },
        d: {
          fieldId: "d_90",
          semanticPath: "envelope.windowEast.area",
          type: "calculated",
          value: "",
          dependencies: ["d_75"],
          label: "S11: Window Area East: Area m²",
        }, // ✅ S10-S11 AREA SYNC: Will sync from S10 d_75
        e: {
          fieldId: "e_90",
          semanticPath: "envelope.windowEast.rValueImperial",
          type: "calculated",
          value: "0.00",
          dependencies: ["f_90"],
          label: "Window Area East: R-Value Imperial",
        },
        f: {
          fieldId: "f_90",
          semanticPath: "envelope.windowEast.rsiValue",
          type: "calculated",
          value: "0.00",
          dependencies: ["g_90"],
          label: "Window Area East: RSI Value K·m²/W",
        },
        g: {
          fieldId: "g_90",
          semanticPath: "envelope.windowEast.uValue",
          type: "editable",
          value: "1.420",
          label: "Window Area East: U-Value W/m²·K",
        },
        h: {
          fieldId: "h_90",
          semanticPath: "envelope.windowEast.percentOfEnvelope",
          type: "calculated",
          value: "0%",
          dependencies: ["d_90", "d_101"],
          classes: ["text-air-facing"],
          label: "Window Area East: % of Total Envelope Area",
        },
        i: {
          fieldId: "i_90",
          semanticPath: "envelope.windowEast.heatLoss",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_90", "d_20", "f_90"],
          label: "Window Area East: Heat Loss kWh/yr",
        },
        j: {
          fieldId: "j_90",
          semanticPath: "envelope.windowEast.heatLossPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["i_90", "i_98"],
          label: "Window Area East: Heat Loss %",
        },
        k: {
          fieldId: "k_90",
          semanticPath: "envelope.windowEast.heatGain",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_90", "d_21", "f_90"],
          label: "Window Area East: Heat Gain kWh/Cooling Season",
        },
        l: {
          fieldId: "l_90",
          semanticPath: "envelope.windowEast.heatGainPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["k_90", "k_98"],
          label: "Window Area East: Heat Gain %",
        },
        m: {
          fieldId: "m_90",
          semanticPath: "envelope.windowEast.complianceRatio",
          type: "calculated",
          value: "0%",
          dependencies: ["t_90", "g_90"],
          label: "Window Area East: Reference Compliance Ratio",
        },
        n: { fieldId: "n_90", semanticPath: "envelope.windowEast.complianceStatus", type: "calculated", value: "✓" },
        o: {
          fieldId: "o_90",
          semanticPath: "envelope.windowEast.surfaceTemperature",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_90", "g_90", "h_23", "d_25"],
          label: "Window East: Interior Surface Temperature °C",
          tooltip: true,
        },
      },
    },
    91: {
      id: "B.8.3",
      rowId: "B.8.3",
      label: "Window",
      cells: {
        c: { label: "Window" },
        d: {
          fieldId: "d_91",
          semanticPath: "envelope.windowSouth.area",
          type: "calculated",
          value: "",
          dependencies: ["d_76"],
          label: "S11: Window Area South: Area m²",
        }, // ✅ S10-S11 AREA SYNC: Will sync from S10 d_76
        e: {
          fieldId: "e_91",
          semanticPath: "envelope.windowSouth.rValueImperial",
          type: "calculated",
          value: "0.00",
          dependencies: ["f_91"],
          label: "Window Area South: R-Value Imperial",
        },
        f: {
          fieldId: "f_91",
          semanticPath: "envelope.windowSouth.rsiValue",
          type: "calculated",
          value: "0.00",
          dependencies: ["g_91"],
          label: "Window Area South: RSI Value K·m²/W",
        },
        g: {
          fieldId: "g_91",
          semanticPath: "envelope.windowSouth.uValue",
          type: "editable",
          value: "1.420",
          label: "Window Area South: U-Value W/m²·K",
        },
        h: {
          fieldId: "h_91",
          semanticPath: "envelope.windowSouth.percentOfEnvelope",
          type: "calculated",
          value: "0%",
          dependencies: ["d_91", "d_101"],
          classes: ["text-air-facing"],
          label: "Window Area South: % of Total Envelope Area",
        },
        i: {
          fieldId: "i_91",
          semanticPath: "envelope.windowSouth.heatLoss",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_91", "d_20", "f_91"],
          label: "Window Area South: Heat Loss kWh/yr",
        },
        j: {
          fieldId: "j_91",
          semanticPath: "envelope.windowSouth.heatLossPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["i_91", "i_98"],
          label: "Window Area South: Heat Loss %",
        },
        k: {
          fieldId: "k_91",
          semanticPath: "envelope.windowSouth.heatGain",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_91", "d_21", "f_91"],
          label: "Window Area South: Heat Gain kWh/Cooling Season",
        },
        l: {
          fieldId: "l_91",
          semanticPath: "envelope.windowSouth.heatGainPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["k_91", "k_98"],
          label: "Window Area South: Heat Gain %",
        },
        m: {
          fieldId: "m_91",
          semanticPath: "envelope.windowSouth.complianceRatio",
          type: "calculated",
          value: "0%",
          dependencies: ["t_91", "g_91"],
          label: "Window Area South: Reference Compliance Ratio",
        },
        n: { fieldId: "n_91", semanticPath: "envelope.windowSouth.complianceStatus", type: "calculated", value: "✓" },
        o: {
          fieldId: "o_91",
          semanticPath: "envelope.windowSouth.surfaceTemperature",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_91", "g_91", "h_23", "d_25"],
          label: "Window South: Interior Surface Temperature °C",
          tooltip: true,
        },
      },
    },
    92: {
      id: "B.8.4",
      rowId: "B.8.4",
      label: "Window",
      cells: {
        c: { label: "Window" },
        d: {
          fieldId: "d_92",
          semanticPath: "envelope.windowWest.area",
          type: "calculated",
          value: "",
          dependencies: ["d_77"],
          label: "S11: Window Area West: Area m²",
        }, // ✅ S10-S11 AREA SYNC: Will sync from S10 d_77
        e: {
          fieldId: "e_92",
          semanticPath: "envelope.windowWest.rValueImperial",
          type: "calculated",
          value: "0.00",
          dependencies: ["f_92"],
          label: "Window Area West: R-Value Imperial",
        },
        f: {
          fieldId: "f_92",
          semanticPath: "envelope.windowWest.rsiValue",
          type: "calculated",
          value: "0.00",
          dependencies: ["g_92"],
          label: "Window Area West: RSI Value K·m²/W",
        },
        g: {
          fieldId: "g_92",
          semanticPath: "envelope.windowWest.uValue",
          type: "editable",
          value: "1.420",
          label: "Window Area West: U-Value W/m²·K",
        },
        h: {
          fieldId: "h_92",
          semanticPath: "envelope.windowWest.percentOfEnvelope",
          type: "calculated",
          value: "0%",
          dependencies: ["d_92", "d_101"],
          classes: ["text-air-facing"],
          label: "Window Area West: % of Total Envelope Area",
        },
        i: {
          fieldId: "i_92",
          semanticPath: "envelope.windowWest.heatLoss",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_92", "d_20", "f_92"],
          label: "Window Area West: Heat Loss kWh/yr",
        },
        j: {
          fieldId: "j_92",
          semanticPath: "envelope.windowWest.heatLossPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["i_92", "i_98"],
          label: "Window Area West: Heat Loss %",
        },
        k: {
          fieldId: "k_92",
          semanticPath: "envelope.windowWest.heatGain",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_92", "d_21", "f_92"],
          label: "Window Area West: Heat Gain kWh/Cooling Season",
        },
        l: {
          fieldId: "l_92",
          semanticPath: "envelope.windowWest.heatGainPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["k_92", "k_98"],
          label: "Window Area West: Heat Gain %",
        },
        m: {
          fieldId: "m_92",
          semanticPath: "envelope.windowWest.complianceRatio",
          type: "calculated",
          value: "0%",
          dependencies: ["t_92", "g_92"],
          label: "Window Area West: Reference Compliance Ratio",
        },
        n: { fieldId: "n_92", semanticPath: "envelope.windowWest.complianceStatus", type: "calculated", value: "✓" },
        o: {
          fieldId: "o_92",
          semanticPath: "envelope.windowWest.surfaceTemperature",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_92", "g_92", "h_23", "d_25"],
          label: "Window West: Interior Surface Temperature °C",
          tooltip: true,
        },
      },
    },
    93: {
      id: "B.8.5",
      rowId: "B.8.5",
      label: "Skylights",
      cells: {
        c: { label: "Skylights" },
        d: {
          fieldId: "d_93",
          semanticPath: "envelope.skylight.area",
          type: "calculated",
          value: "",
          dependencies: ["d_78"],
          label: "S11: Skylights: Area m²",
        }, // ✅ S10-S11 AREA SYNC: Will sync from S10 d_78
        e: {
          fieldId: "e_93",
          semanticPath: "envelope.skylight.rValueImperial",
          type: "calculated",
          value: "0.00",
          dependencies: ["f_93"],
          label: "Skylights: R-Value Imperial",
        },
        f: {
          fieldId: "f_93",
          semanticPath: "envelope.skylight.rsiValue",
          type: "calculated",
          value: "0.00",
          dependencies: ["g_93"],
          label: "Skylights: RSI Value K·m²/W",
        },
        g: {
          fieldId: "g_93",
          semanticPath: "envelope.skylight.uValue",
          type: "editable",
          value: "1.420",
          label: "Skylights: U-Value W/m²·K",
        },
        h: {
          fieldId: "h_93",
          semanticPath: "envelope.skylight.percentOfEnvelope",
          type: "calculated",
          value: "0%",
          dependencies: ["d_93", "d_101"],
          classes: ["text-air-facing"],
          label: "Skylights: % of Total Envelope Area",
        },
        i: {
          fieldId: "i_93",
          semanticPath: "envelope.skylight.heatLoss",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_93", "d_20", "f_93"],
          label: "Skylights: Heat Loss kWh/yr",
        },
        j: {
          fieldId: "j_93",
          semanticPath: "envelope.skylight.heatLossPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["i_93", "i_98"],
          label: "Skylights: Heat Loss %",
        },
        k: {
          fieldId: "k_93",
          semanticPath: "envelope.skylight.heatGain",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_93", "d_21", "f_93"],
          label: "Skylights: Heat Gain kWh/Cooling Season",
        },
        l: {
          fieldId: "l_93",
          semanticPath: "envelope.skylight.heatGainPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["k_93", "k_98"],
          label: "Skylights: Heat Gain %",
        },
        m: {
          fieldId: "m_93",
          semanticPath: "envelope.skylight.complianceRatio",
          type: "calculated",
          value: "0%",
          dependencies: ["t_93", "g_93"],
          label: "Skylights: Reference Compliance Ratio",
        },
        n: { fieldId: "n_93", semanticPath: "envelope.skylight.complianceStatus", type: "calculated", value: "✓" },
        o: {
          fieldId: "o_93",
          semanticPath: "envelope.skylight.surfaceTemperature",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_93", "g_93", "h_23", "d_25"],
          label: "Skylights: Interior Surface Temperature °C",
          tooltip: true,
        },
      },
    },
    94: {
      id: "B.9",
      rowId: "B.9",
      label: "Walls Below Grade (Conditioned Space)",
      cells: {
        c: { label: "Walls Below Grade (Conditioned Space)" },
        d: {
          fieldId: "d_94",
          semanticPath: "envelope.wallsBelow.area",
          type: "editable",
          value: "0.00",
          label: "Walls Below Grade: Area m²",
        },
        e: {
          fieldId: "e_94",
          semanticPath: "envelope.wallsBelow.rValueImperial",
          type: "calculated",
          value: "0.00",
          dependencies: ["f_94"],
          label: "Walls Below Grade: R-Value Imperial",
        },
        f: {
          fieldId: "f_94",
          semanticPath: "envelope.wallsBelow.rsiValue",
          type: "editable",
          value: "4.00",
          label: "Walls Below Grade: RSI Value K·m²/W",
        },
        g: {
          fieldId: "g_94",
          semanticPath: "envelope.wallsBelow.uValue",
          type: "calculated",
          value: "0.00",
          dependencies: ["f_94"],
          label: "Walls Below Grade: U-Value W/m²·K",
        },
        h: {
          fieldId: "h_94",
          semanticPath: "envelope.wallsBelow.percentOfEnvelope",
          type: "calculated",
          value: "0%",
          dependencies: ["d_94", "d_102"],
          classes: ["text-ground-facing"],
          label: "Walls Below Grade: % of Total Envelope Area",
        },
        i: {
          fieldId: "i_94",
          semanticPath: "envelope.wallsBelow.heatLoss",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_94", "d_22", "f_94"],
          label: "Walls Below Grade: Heat Loss kWh/yr",
        },
        j: {
          fieldId: "j_94",
          semanticPath: "envelope.wallsBelow.heatLossPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["i_94", "i_98"],
          label: "Walls Below Grade: Heat Loss %",
        },
        k: {
          fieldId: "k_94",
          semanticPath: "envelope.wallsBelow.heatGain",
          type: "calculated",
          value: "0.00",
          dependencies: ["i_21", "d_94", "h_22", "f_94"],
          label: "Walls Below Grade: Heat Gain kWh/Cooling Season",
        },
        l: {
          fieldId: "l_94",
          semanticPath: "envelope.wallsBelow.heatGainPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["k_94", "k_98"],
          label: "Walls Below Grade: Heat Gain %",
        },
        m: {
          fieldId: "m_94",
          semanticPath: "envelope.wallsBelow.complianceRatio",
          type: "calculated",
          value: "0%",
          dependencies: ["f_94", "t_94"],
          label: "Walls Below Grade: Reference Compliance Ratio",
        },
        n: { fieldId: "n_94", semanticPath: "envelope.wallsBelow.complianceStatus", type: "calculated", value: "✓" },
        o: {
          fieldId: "o_94",
          semanticPath: "envelope.wallsBelow.surfaceTemperature",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_94", "g_94", "h_23"],
          label: "Walls Below Grade: Interior Surface Temperature °C",
          tooltip: true,
        },
      },
    },
    95: {
      id: "B.10",
      rowId: "B.10",
      label: "Floor Slab (Conditioned Space)",
      cells: {
        c: { label: "Floor Slab (Conditioned Space)" },
        d: {
          fieldId: "d_95",
          semanticPath: "envelope.slab.area",
          type: "editable",
          value: "1100.92",
          label: "Floor Slab: Area m²",
        },
        e: {
          fieldId: "e_95",
          semanticPath: "envelope.slab.rValueImperial",
          type: "calculated",
          value: "0.00",
          dependencies: ["f_95"],
          label: "Floor Slab: R-Value Imperial",
        },
        f: {
          fieldId: "f_95",
          semanticPath: "envelope.slab.rsiValue",
          type: "editable",
          value: "3.70",
          label: "Floor Slab: RSI Value K·m²/W",
        },
        g: {
          fieldId: "g_95",
          semanticPath: "envelope.slab.uValue",
          type: "calculated",
          value: "0.00",
          dependencies: ["f_95"],
          label: "Floor Slab: U-Value W/m²·K",
        },
        h: {
          fieldId: "h_95",
          semanticPath: "envelope.slab.percentOfEnvelope",
          type: "calculated",
          value: "100%",
          dependencies: ["d_95", "d_102"],
          classes: ["text-ground-facing"],
          label: "Floor Slab: % of Total Envelope Area",
        },
        i: {
          fieldId: "i_95",
          semanticPath: "envelope.slab.heatLoss",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_95", "d_22", "f_95"],
          label: "Floor Slab: Heat Loss kWh/yr",
        },
        j: {
          fieldId: "j_95",
          semanticPath: "envelope.slab.heatLossPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["i_95", "i_98"],
          label: "Floor Slab: Heat Loss %",
        },
        k: {
          fieldId: "k_95",
          semanticPath: "envelope.slab.heatGain",
          type: "calculated",
          value: "0.00",
          dependencies: ["i_21", "d_95", "h_22", "f_95"],
          label: "Floor Slab: Heat Gain kWh/Cooling Season",
        },
        l: {
          fieldId: "l_95",
          semanticPath: "envelope.slab.heatGainPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["k_95", "k_98"],
          label: "Floor Slab: Heat Gain %",
        },
        m: {
          fieldId: "m_95",
          semanticPath: "envelope.slab.complianceRatio",
          type: "calculated",
          value: "0%",
          dependencies: ["f_95", "t_95"],
          label: "Floor Slab: Reference Compliance Ratio",
        },
        n: { fieldId: "n_95", semanticPath: "envelope.slab.complianceStatus", type: "calculated", value: "✓" },
        o: {
          fieldId: "o_95",
          semanticPath: "envelope.slab.surfaceTemperature",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_95", "g_95", "h_23"],
          label: "Floor Slab: Interior Surface Temperature °C",
          tooltip: true,
        },
      },
    },
    96: {
      id: "B.11",
      rowId: "B.11",
      label: "B.11 Interior Floors (incl. garages)",
      cells: {
        c: { label: "B.11 Interior Floors (incl. garages)" },
        d: {
          fieldId: "d_96",
          semanticPath: "envelope.interiorFloors.area",
          type: "editable",
          value: "29.70",
          tooltip: true,
          label: "Interior Floors: Area m²",
        },
        e: { content: "-" },
        f: { content: "-" },
        g: { content: "-" },
        h: { content: "-" },
        i: { content: "-" },
        j: { content: "-" },
        k: { content: "-" },
        l: { content: "-" },
        m: {},
        n: {},
        o: {},
      },
    },
    97: {
      id: "B.12",
      rowId: "B.12",
      label: "Thermal Bridge Penalty %",
      cells: {
        c: { label: "Thermal Bridge Penalty (%)" },
        d: {
          fieldId: "d_97",
          semanticPath: "envelope.thermalBridge.penaltyFactor",
          type: "percentage", // Changed from editable to percentage
          value: "20", // Default value 20%
          min: 5, // **** CHANGED: Set min to 5 ****
          max: 100, // Max 100%
          step: 5, // Step 5%
          label: "Thermal Bridge Penalty: Factor %",
          section: "envelope",
          tooltip: true, // TB Penalty
        },
        e: { fieldId: "e_97", semanticPath: "envelope.thermalBridge.penaltyDecimal", type: "calculated", value: "0.200" }, // Placeholder for decimal equivalent
        f: { content: "0.00", classes: ["label-prefix"] },
        i: {
          fieldId: "i_97",
          semanticPath: "envelope.thermalBridge.heatLoss",
          type: "calculated",
          value: "0.00",
          section: "envelope",
          dependencies: ["i_98", "d_97"],
          label: "TB Penalty Heat Loss kWh/yr",
        },
        j: {
          fieldId: "j_97",
          semanticPath: "envelope.thermalBridge.heatLossPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["i_97", "i_98"],
          label: "Combined Total Envelope TB Penalty Heat Loss %",
        },
        k: {
          fieldId: "k_97",
          semanticPath: "envelope.thermalBridge.heatGain",
          type: "calculated",
          value: "0.00",
          section: "envelope",
          dependencies: ["h_21", "k_98", "d_97"],
          label: "TB Penalty Cooling Season Heat Gain kWh",
        },
        l: {
          fieldId: "l_97",
          semanticPath: "envelope.thermalBridge.heatGainPercent",
          type: "calculated",
          value: "0%",
          dependencies: ["k_97", "k_98"],
          label: "Combined TB Penalty Cooling Season Heat Gain %",
        },
        m: {
          fieldId: "m_97",
          semanticPath: "envelope.thermalBridge.costImpact",
          type: "calculated",
          value: "0%",
          dependencies: ["i_97", "l_12", "k_97"],
          label: "Penalty Cost Impact",
        },
        n: { fieldId: "n_97", semanticPath: "envelope.thermalBridge.complianceStatus", type: "calculated", value: "✓" },
      },
    },
    98: {
      id: "ET",
      rowId: "ET",
      label: "ET",
      cells: {
        c: { label: "Envelope Totals" },
        d: {
          fieldId: "d_98",
          semanticPath: "envelope.total.area",
          type: "calculated",
          value: "0.00",
          dependencies: [
            "d_85",
            "d_86",
            "d_87",
            "d_88",
            "d_89",
            "d_90",
            "d_91",
            "d_92",
            "d_93",
            "d_94",
            "d_95",
          ],
          label: "Total Envelope Area m²",
        },
        e: {
          fieldId: "e_98",
          semanticPath: "envelope.total.avgRValueImperial",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_94", "d_95", "g_101", "g_102"],
          label: "Avg. R-Value Imperial",
        },
        f: {},
        g: {},
        h: {
          fieldId: "h_98",
          semanticPath: "envelope.total.percentOfEnvelope",
          type: "calculated",
          value: "100%",
          dependencies: [
            "h_85",
            "h_86",
            "h_87",
            "h_88",
            "h_89",
            "h_90",
            "h_91",
            "h_92",
            "h_93",
          ],
          label: "Total % of Envelope",
        },
        i: {
          fieldId: "i_98",
          semanticPath: "envelope.total.heatLoss",
          type: "calculated",
          value: "0.00",
          section: "envelope",
          dependencies: [
            "i_85",
            "i_86",
            "i_87",
            "i_88",
            "i_89",
            "i_90",
            "i_91",
            "i_92",
            "i_93",
            "i_94",
            "i_95",
          ],
          label: "Total Heat Loss kWh/yr",
        },
        j: {
          fieldId: "j_98",
          semanticPath: "envelope.total.heatLossPercent",
          type: "calculated",
          value: "100%",
          tooltip: true,
          dependencies: [
            "j_85",
            "j_86",
            "j_87",
            "j_88",
            "j_89",
            "j_90",
            "j_91",
            "j_92",
            "j_93",
            "j_94",
            "j_95",
          ],
          label: "Total Heat Loss %",
        },
        k: {
          fieldId: "k_98",
          semanticPath: "envelope.total.heatGain",
          type: "calculated",
          value: "0.00",
          section: "envelope",
          dependencies: [
            "k_85",
            "k_86",
            "k_87",
            "k_88",
            "k_89",
            "k_90",
            "k_91",
            "k_92",
            "k_93",
            "k_94",
            "k_95",
          ],
          label: "Total Heat Gain kWh",
        },
        l: {
          fieldId: "l_98",
          semanticPath: "envelope.total.heatGainPercent",
          type: "calculated",
          value: "100%",
          tooltip: true,
          dependencies: [
            "l_85",
            "l_86",
            "l_87",
            "l_88",
            "l_89",
            "l_90",
            "l_91",
            "l_92",
            "l_93",
            "l_94",
            "l_95",
          ],
          label: "Total Heat Gain %",
        },
        m: {},
        n: {},
      },
    },
  };

  // The openings' twins after the first (Openings.js; Andy 2026-11-20: "If a window row is created in
  // S10, S11 needs to ape it"): door rows B.7.2-B.7.4 take row 88's shape, window rows B.8.6-B.8.12
  // row 89's - the area S10's (calculated), the U-value their own. Shown and hidden with their S10 row.
  const OPENINGS = window.TEUI.Openings;
  OPENINGS.SLOTS.forEach(o => {
    const door = o.kind === "door";
    const base = door ? "88" : "89";
    const row = OPENINGS.cloneRow(sectionRows[base], base, o.s11, {
      id: OPENINGS.s11RowId(o),
      label: door ? "Door" : "Window",
      pathFrom: door ? "doors" : "windowNorth",
      pathTo: o.id,
      textPattern: door ? /\bDoors?\b/g : /\bWindow( Area)? North\b/g,
      textTo: door ? `Door ${OPENINGS.s11RowId(o)}` : `Window ${OPENINGS.s11RowId(o)}`,
    });
    row.cells.d.dependencies = [`d_${o.s10}`]; // its area is its S10 row's
    sectionRows[o.s11] = row;
    areaSourceMap[`d_${o.s11}`] = `d_${o.s10}`;
    editableFields.push(`g_${o.s11}`);
  });

  // The rows in order: each opening's twins with its group (object keys put 88a after every number)
  const ROW_ORDER = [
    "header",
    ...Object.keys(sectionRows).filter(k => k !== "header" && Number(k) < 88),
    ...OPENINGS.DOORS.map(o => o.s11),
    ...OPENINGS.WINDOWS.map(o => o.s11),
    ...Object.keys(sectionRows).filter(k => k !== "header" && Number(k) > 93),
  ];

  //==========================================================================
  // ACCESSOR METHODS
  //==========================================================================

  function getFields() {
    const fields = {};
    Object.values(sectionRows).forEach(row => {
      if (!row.cells) return;
      Object.values(row.cells).forEach(cell => {
        if (cell.fieldId && cell.type) {
          // Copy all relevant properties from the cell definition
          fields[cell.fieldId] = {
            ...cell, // Spread operator to copy all properties
            defaultValue: cell.value, // Keep defaultValue mapping for consistency
          };
          // Remove original value key if necessary, as it's mapped to defaultValue
          // delete fields[cell.fieldId].value;
        }
      });
    });
    return fields;
  }

  function getDropdownOptions() {
    return {};
  }

  function getLayout() {
    const layoutRows = [];
    ROW_ORDER.forEach(key => {
      if (sectionRows[key]) layoutRows.push(createLayoutRow(sectionRows[key]));
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
      "o", // Surface Temperature (condensation risk feature)
    ];
    columns.forEach(col => {
      const cell = row.cells?.[col] ? { ...row.cells[col] } : {};
      if (col === "c" && !cell.label && row.label) cell.label = row.label;
      // Only remove properties confirmed unnecessary for rendering
      delete cell.section;
      delete cell.dependencies;
      delete cell.getOptions;
      rowDef.cells.push(cell);
    });
    return rowDef;
  }

  //==========================================================================
  // HELPER FUNCTIONS (Refactored for Self-Contained State Module)
  //==========================================================================

  // getNumericValue, getGlobalNumericValue, getFieldValue, setCalculatedValue removed — graph computes

  /**
   * Formats a number according to the project's display rules.
   * Handles specific formats like percentages, currency, W/m2.
   * @param {number} value - The number to format.
   * @param {string} [format='number'] - The type of format.
   * @returns {string} The formatted number as a string.
   */
  function formatNumber(value, format = "number") {
    if (value === null || value === undefined || isNaN(value)) {
      // Return 0 or 0% based on expected format
      return format === "percent" ? "0%" : format === "W/m2" ? "0.000" : "0.00";
    }

    const num = Number(value);

    if (format === "percent") {
      // Multiply decimal by 100, then format to 2 decimal places and add %
      return (
        (num * 100).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + "%"
      );
    } else if (format === "W/m2") {
      // U-Values (3 decimals)
      return num.toLocaleString("en-US", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });
    } else {
      // Default: kWh, RSI, Rimp, Area etc. (2 decimals)
      return num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  }

  // setElementClass, setIndicatorClass removed — graph handles indicator styling

  //==========================================================================
  // ✅ S10-S11 AREA SYNC FUNCTIONS (CRASH-SAFE with all safeguards)
  //==========================================================================

  /**
   * Syncs window/door area values from S10 into S11
   * Respects current calculation mode (Target vs Reference)
   * CRITICAL: Only reads from S10, never writes back
   */
  function syncAreasFromS10() {
    // GUARD 1: Block if S11 not yet initialized
    if (!isS11Initialized) {
      console.warn("[S11 Area Sync] Blocked - S11 not initialized yet");
      return;
    }

    // GUARD 2: Prevent recursion
    if (isSyncingFromS10) {
      console.warn("[S11 Area Sync] Blocked - sync already in progress");
      return;
    }

    isSyncingFromS10 = true;

    try {
      const isRef = window.TEUI.ReferenceToggle?.isReferenceMode();
      const currentMode = isRef ? "reference" : "target";

      // Detect if this is initial/import sync requiring dual-state population
      // Check if ref areas in StateManager are unpopulated
      const refArea_d88 = window.TEUI.StateManager?.getValue("ref_d_88");
      const stateManager_refArea =
        window.TEUI.StateManager.getValue("ref_d_73");

      const needsDualSync =
        (isInitializationPhase || isImportActive) &&
        currentMode === "target" &&
        (refArea_d88 === undefined || refArea_d88 !== stateManager_refArea);

      if (needsDualSync) {
        console.log(
          `[S11 Area Sync] DUAL-STATE SYNC - populating BOTH Target and Reference states`
        );
        console.log(
          `[S11 Area Sync] Reason: ref_d_88=${refArea_d88}, ref_d_73 in StateManager=${stateManager_refArea}`
        );
      } else {
        console.log(`[S11 Area Sync] Starting sync in ${currentMode} mode`);
      }

      // PERFORMANCE: Batch state updates to prevent listener cascade
      const targetUpdates = [];
      const refUpdates = [];
      const domUpdates = [];

      Object.entries(areaSourceMap).forEach(([s11Field, s10Field]) => {
        // Determine source fields
        const targetSourceField = s10Field;
        const refSourceField = `ref_${s10Field}`;

        // Read from S10 via global StateManager
        const targetValue =
          window.TEUI.StateManager.getValue(targetSourceField);
        const refValue = window.TEUI.StateManager.getValue(refSourceField);

        // During dual-state sync, populate BOTH states
        if (needsDualSync) {
          // Queue Target state update
          if (targetValue !== null && targetValue !== undefined) {
            targetUpdates.push({ field: s11Field, value: targetValue });
          }

          // Queue Reference state update (ensures ref areas available for first calc)
          if (refValue !== null && refValue !== undefined) {
            refUpdates.push({ field: s11Field, value: refValue });
          }

          // Queue DOM update with Target value (we're in Target mode)
          domUpdates.push({ field: s11Field, value: targetValue });
        } else {
          // Normal mode-aware sync
          const sourceFieldId =
            currentMode === "reference" ? refSourceField : targetSourceField;
          const areaValue = window.TEUI.StateManager.getValue(sourceFieldId);

          if (areaValue !== null && areaValue !== undefined) {
            // Queue state update — write to appropriate SM key
            if (currentMode === "target") {
              targetUpdates.push({ field: s11Field, value: areaValue });
            } else {
              refUpdates.push({ field: s11Field, value: areaValue });
            }

            // Queue DOM update
            domUpdates.push({ field: s11Field, value: areaValue });
          } else {
            console.warn(
              `[S11 Area Sync] ${sourceFieldId} is null/undefined, skipping ${s11Field}`
            );
          }
        }
      });

      // PERFORMANCE: Apply all state updates via StateManager
      console.log(
        `[S11 Area Sync] Applying ${targetUpdates.length} target updates, ${refUpdates.length} reference updates`
      );

      targetUpdates.forEach(({ field, value }) => {
        window.TEUI.StateManager.setValue(field, value, "calculated");
      });

      refUpdates.forEach(({ field, value }) => {
        window.TEUI.StateManager.setValue(`ref_${field}`, value, "calculated");
      });

      // PERFORMANCE: Update DOM elements directly
      domUpdates.forEach(({ field, value }) => {
        const formattedValue = formatNumber(value, "number");
        const element = document.querySelector(`[data-field-id="${field}"]`);
        if (element) {
          element.textContent = formattedValue;
          element.classList.toggle("negative-value", value < 0);
        }
      });

      // Graph handles recalculation via dependency chain
      console.log("[S11 Area Sync] Sync completed successfully");
    } catch (error) {
      console.error("[S11 Area Sync] ❌ CRITICAL ERROR during sync:");
      console.error("[S11 Area Sync] Error message:", error.message);
      console.error("[S11 Area Sync] Error stack:", error.stack);
      console.error("[S11 Area Sync] Full error object:", error);
    } finally {
      isSyncingFromS10 = false;
    }
  }

  /**
   * Debounced version of syncAreasFromS10 to prevent rapid-fire syncs
   * Waits 50ms after last change before executing sync
   */
  function debouncedSyncAreasFromS10() {
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      syncAreasFromS10();
    }, 50);
  }

  /**
   * Setup listeners for S10 area field changes
   * CRITICAL: All listeners start COMMENTED OUT for incremental testing
   * GUARD: Only fires if mode matches and S11 is initialized
   */
  function setupS10AreaListeners() {
    const s10AreaFields = ["d_73", "d_74", "d_75", "d_76", "d_77", "d_78"];

    console.log("[S11] Setting up S10 area listeners...");

    // ✅ ENABLED: All listeners active with guards
    // Listen for Target mode changes
    s10AreaFields.forEach(fieldId => {
      window.TEUI.StateManager.addListener(fieldId, newValue => {
        // GUARD: Only fire if Target mode active
        if (window.TEUI.ReferenceToggle?.isReferenceMode()) return;
        // GUARD: Only fire if S11 initialized
        if (!isS11Initialized) return;

        console.log(
          `[S11 Listener] ${fieldId} changed to ${newValue} (Target mode)`
        );
        debouncedSyncAreasFromS10();
      });
    });

    // Listen for Reference mode changes
    s10AreaFields.forEach(fieldId => {
      window.TEUI.StateManager.addListener(`ref_${fieldId}`, newValue => {
        // ✅ MODE GUARD REMOVED: In dual-state architecture, sections have independent modes.
        // S12 can be in Reference mode while S11 is in Target mode. When S12 publishes
        // ref_i_103, S10 fires and publishes ref_d_73-78. S11 must respond regardless of
        // its current mode - the dual-engine architecture ensures both engines run anyway.
        // GUARD: Only fire if S11 initialized
        if (!isS11Initialized) return;

        console.log(
          `[S11 Listener] ref_${fieldId} changed to ${newValue} (Reference mode)`
        );
        debouncedSyncAreasFromS10();
      });
    });

    console.log("[S11] ✅ S10 area listeners registered for both modes");
  }

  // Legacy helpers removed — graph computes surface temperatures + condensation risk (cr_85-cr_95)
  //==========================================================================
  // EVENT HANDLING & INITIALIZATION
  //==========================================================================

  /**
   * TODO: Optimize initial calculation flow.
   * The current sequence involves rendering with defaults (often "0.00"),
   * then running calculateAll which updates the values, causing a visual "flash".
   * This flash was previously resolved in the ORDERING refactor branch but was
   * re-introduced with the dual-engine reference system. It is a minor glitch but a known one.
   * Future improvements could involve:
   * - Calculating values *before* initial render.
   * - Using placeholders ("---") instead of "0.00" as defaults.
   * - Optimizing the calculateAll sequence itself.
   * For now, the flash is accepted as known behavior.
   */
  function handleFieldBlur(_event) {
    const fieldElement = this;
    const currentFieldId = fieldElement.getAttribute("data-field-id");
    if (!currentFieldId) return;
    let valueStr = fieldElement.textContent.trim().replace(/,/g, "");
    let displayValue = "0.00";
    let rawValueToStore = "0";

    let numValue = window.TEUI.parseNumeric(valueStr, NaN);

    if (!isNaN(numValue)) {
      // Successfully parsed a number
      rawValueToStore = numValue.toString(); // Store the raw number string *first* for all valid number cases

      // Apply specific formatting based on field type
      if (currentFieldId === "d_97") {
        // Thermal Bridge Penalty (%)
        // Convert input number to decimal (assume input "20" means 20% -> 0.2)
        let decimalValue = numValue / 100;
        // Clamp the DECIMAL value between 0 and 1
        decimalValue = Math.max(0, Math.min(1, decimalValue));
        rawValueToStore = decimalValue.toString(); // Overwrite with clamped decimal value for storage
        displayValue = formatNumber(decimalValue * 100, "number"); // Display as number 0-100, not percentage string
      } else if (currentFieldId.startsWith("g_")) {
        // U-Value (3 decimals)
        displayValue = formatNumber(numValue, "W/m2"); // Use specific format
      } else {
        // Default: Area (d_), RSI (f_) - 2 decimals
        displayValue = formatNumber(numValue, "number");
      }
    } else {
      // Handle invalid input (set to 0 or 0%)
      if (currentFieldId === "d_97") {
        displayValue = "0%";
        rawValueToStore = "0"; // Store 0 for invalid TBP
      } else if (currentFieldId.startsWith("g_")) {
        displayValue = formatNumber(0, "W/m2");
        rawValueToStore = "0";
      } else {
        displayValue = formatNumber(0, "number");
        rawValueToStore = "0";
      }
    }
    fieldElement.textContent = displayValue;

    // Store value via mode-aware helper.
    setModeValue(currentFieldId, rawValueToStore, "user-modified");
    // Graph handles recalculation via dependency chain
  }

  function initializeEventHandlers() {
    editableFields.forEach(fieldId => {
      const field = document.querySelector(`[data-field-id="${fieldId}"]`);
      // Attach listeners only to fields actually found and marked as editable
      if (field?.classList.contains("editable")) {
        if (!field.hasEditableListeners) {
          // Prevent adding multiple listeners
          field.addEventListener("keydown", e => {
            if (e.key === "Enter") {
              e.preventDefault();
              field.blur();
            }
          });
          field.addEventListener("blur", handleFieldBlur.bind(field)); // Ensure 'this' context
          field.addEventListener("focus", () => field.classList.add("editing"));
          field.addEventListener("focusout", () =>
            field.classList.remove("editing")
          );
          field.hasEditableListeners = true; // Mark as listener attached
        }
      }
      // Removed console.warn for missing/non-editable fields
    });

    // *** ADDED: Specific listener for d_97 slider ***
    const d97Slider = document.querySelector(
      'input[type="range"][data-field-id="d_97"]'
    );
    if (d97Slider) {
      if (!d97Slider.hasSliderListener) {
        // Prevent adding multiple listeners
        // LIVE FEEDBACK: Update StateManager + immediate calculations for responsive UI
        d97Slider.addEventListener("input", function () {
          const percentageValue = parseFloat(this.value);
          if (isNaN(percentageValue)) return;

          // Update the display span
          const displaySpan = this.parentElement.querySelector(".slider-value");
          if (displaySpan) {
            displaySpan.textContent = percentageValue.toFixed(0) + "%";
          }

          // Store via mode-aware helper (handles both state and StateManager sync)
          const src = "user-modified";
          setModeValue("d_97", percentageValue.toString(), src);
          const mode = window.TEUI.ReferenceToggle?.isReferenceMode() ? "reference" : "target";
          console.log(
            `[S11] Slider input d_97=${percentageValue} (localMode=${mode})`
          );
          // Graph handles recalculation via dependency chain
        });

        // ARCHITECTURAL COMPLIANCE: Final change event relies on StateManager dependency chain
        d97Slider.addEventListener("change", function () {
          const percentageValue = parseFloat(this.value);
          if (isNaN(percentageValue)) return;

          // Final value goes through mode-aware helper - handles state and dependency chain
          const src = "user-modified";
          setModeValue("d_97", percentageValue.toString(), src);
          const mode = window.TEUI.ReferenceToggle?.isReferenceMode() ? "reference" : "target";
          console.log(
            `[S11] Slider change d_97=${percentageValue} (localMode=${mode})`
          );
          // Graph handles recalculation via dependency chain
        });

        d97Slider.hasSliderListener = true; // Mark as listener attached
      }
    } else {
      console.warn("Slider for d_97 not found during initialization.");
    }
    // *** END ADDED ***

    // Graph handles cross-section computation (climate, capacitance, thermal bridge)
    // via wildcard listener. S10→S11 area sync kept (below) for field ID bridging.

    // ✅ S10-S11 AREA SYNC: Setup listeners for S10 area changes (commented out initially)
    setupS10AreaListeners();
  }

  function onSectionRendered() {
    console.log("S11: Section rendered.");

    // Initialize event handlers for this section
    initializeEventHandlers();

    // S10-S11 AREA SYNC: Mark S11 as initialized (CRITICAL for crash prevention)
    isS11Initialized = true;
    console.log(
      "[S11 Area Sync] S11 initialization complete - sync functions now enabled"
    );

    // Graph handles initial calculations via dependency chain
    isInitializationPhase = false;

    // The openings' twins show and hide with their S10 rows; S11's +/- do the same as S10's
    OPENINGS.installControls("S11");
    document.addEventListener("teui-openings-changed", () => OPENINGS.applyVisibility("S11"));

    // Apply validation tooltips to fields
    if (window.TEUI.TooltipManager && window.TEUI.TooltipManager.initialized) {
      setTimeout(() => {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }
  }

  // referenceHandler removed — graph handles reference model

  //==========================================================================
  // PUBLIC API
  //==========================================================================
  return {
    getFields,
    getDropdownOptions,
    getLayout,
    initializeEventHandlers,
    onSectionRendered,
    // After each stamp: an opening's twin shows when its S10 row does
    postStamp: () => OPENINGS.applyVisibility("S11"),
    // S10 area sync for FileHandler post-import call
    syncAreasFromS10: syncAreasFromS10,

    // ✅ FIX (Nov 2): Expose import flag control for FileHandler
    setImportActive: active => {
      isImportActive = active;
      console.log(
        `[S11 Area Sync] Import phase ${active ? "STARTED" : "ENDED"} - Dual-state sync ${active ? "ENABLED" : "DISABLED"}`
      );
    },
  };
})();

