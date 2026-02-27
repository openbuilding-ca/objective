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

  //==========================================================================
  // DUAL-STATE ARCHITECTURE (Self-Contained State Module)
  //==========================================================================

  // PATTERN 1: Internal State Objects (Self-Contained + Persistent)
  const TargetState = {
    state: {},
    listeners: {},
    initialize: function () {
      const savedState = localStorage.getItem("S11_TARGET_STATE");
      if (savedState) {
        this.state = JSON.parse(savedState);
      } else {
        this.setDefaults();
      }
    },
    setDefaults: function () {
      // These defaults MUST match the 'value' properties in the sectionRows definition
      this.state = {
        d_85: "1411.52",
        f_85: "9.35", // Roof
        d_86: "705.27",
        f_86: "6.69", // Walls Above Grade
        d_87: "0.00",
        f_87: "9.52", // Floor Exposed
        // ✅ DRY CLEANUP: Area defaults d_88-d_93 removed - populated by syncAreasFromS10() only
        // d_88: "7.50", // Door area (matches S10 Target default)
        g_88: "1.500", // Doors U-value (Target default, not ReferenceValues)
        // d_89: "81.14", // Window North area (matches S10 Target default)
        g_89: "0.900", // Window North U-value (Target default, not ReferenceValues)
        // d_90: "3.83", // Window East area (matches S10 Target default)
        g_90: "0.900", // Window East U-value (Target default, not ReferenceValues)
        // d_91: "159.00", // Window South area (matches S10 Target default)
        g_91: "0.900", // Window South U-value (Target default, not ReferenceValues)
        // d_92: "100.66", // Window West area (matches S10 Target default)
        g_92: "0.900", // Window West U-value (Target default, not ReferenceValues)
        // d_93: "0.00", // Skylights area (matches S10 Target default)
        g_93: "0.900", // Skylights U-value (Target default, not ReferenceValues)
        d_94: "0.00",
        f_94: "4.00", // Walls Below Grade
        d_95: "1100.92",
        f_95: "3.70", // Floor Slab
        d_96: "29.70", // Interior Floors
        d_97: "20", // Thermal Bridge Penalty %
      };
    },
    /**
     * ✅ PHASE 2: Sync from global StateManager after import
     */
    syncFromGlobalState: function () { /* graph is source of truth */ },

    /**
     * ✅ PHASE 6: Apply code-minimum baseline values from ReferenceValues
     * Called by "Set Values" button to overlay reference values onto Target model
     * ⚠️ STATE ISOLATION SAFEGUARD: Only writes to unprefixed fields (Target model)
     */
    applyReferenceValues: function (standard) {
      const referenceValues = window.TEUI?.ReferenceValues?.[standard] || {};

      console.log(
        `[S11 TargetState] Applying code-minimum values from "${standard}"`
      );

      Object.keys(referenceValues).forEach(fieldId => {
        if (referenceValues[fieldId] !== undefined) {
          // ✅ Writes to d_85, f_85, etc., NOT ref_d_85
          this.state[fieldId] = referenceValues[fieldId];
          console.log(
            `[S11 TargetState] ${fieldId} = ${referenceValues[fieldId]} (from ${standard})`
          );
        }
      });

      this.saveState();
      console.log(
        `[S11 TargetState] Code-minimum values from "${standard}" applied to Target model`
      );
    },

    saveState: function () {
      localStorage.setItem("S11_TARGET_STATE", JSON.stringify(this.state));
    },
    setValue: function (fieldId, value) {
      this.state[fieldId] = value;
      this.saveState();
    },
    getValue: function (fieldId) {
      return this.state[fieldId];
    },
  };

  const ReferenceState = {
    state: {},
    listeners: {},
    initialize: function () {
      const savedState = localStorage.getItem("S11_REFERENCE_STATE");
      if (savedState) {
        this.state = JSON.parse(savedState);
      } else {
        this.setDefaults();
      }
    },
    setDefaults: function () {
      // ✅ DYNAMIC LOADING: Get current reference standard from dropdown ref_d_13
      const currentStandard =
        window.TEUI?.StateManager?.getValue?.("ref_d_13") ||
        "OBC SB10 5.5-6 Z6";
      const referenceValues =
        window.TEUI?.ReferenceValues?.[currentStandard] || {};

      // Apply reference values to this section's fields, with fallbacks for missing values
      this.state = {
        // Area values (d_) - Reference defaults are Target +1 for clear differentiation
        d_85: "1411.52",
        f_85: referenceValues.f_85 || "5.30", // Roof
        d_86: "705.27",
        f_86: referenceValues.f_86 || "4.10", // Walls Above Grade
        d_87: "0.00",
        f_87: referenceValues.f_87 || "6.60", // Floor Exposed
        // ✅ S10-S11 AREA SYNC: d_88-d_93 areas will sync from S10 (no independent Reference defaults)
        // d_88, d_89, d_90, d_91, d_92, d_93 removed - will be populated by syncAreasFromS10()
        g_88: referenceValues.g_88 || "1.990", // Doors U-value (from ReferenceValues)
        g_89: referenceValues.g_89 || "1.420", // Window North U-value (from ReferenceValues)
        g_90: referenceValues.g_90 || "1.420", // Window East U-value (from ReferenceValues)
        g_91: referenceValues.g_91 || "1.420", // Window South U-value (from ReferenceValues)
        g_92: referenceValues.g_92 || "1.420", // Window West U-value (from ReferenceValues)
        g_93: referenceValues.g_93 || "1.420", // Skylights U-value (from ReferenceValues)
        d_94: "0.00",
        f_94: referenceValues.f_94 || "1.80", // Walls Below Grade
        d_95: "1100.92",
        f_95: referenceValues.f_95 || "3.50", // Floor Slab
        d_96: "29.70", // Interior Floors (not in codes)
        d_97: referenceValues.d_97 || "50", // Thermal Bridge Penalty %
      };

      // ✅ CRITICAL: Publish Reference defaults to StateManager (S10 pattern)
      // This fixes the QC violations: ref_d_85, ref_d_86, ref_d_89-d_92, ref_d_95 UNDEFINED_FIELD
      if (window.TEUI?.StateManager) {
        const referenceFields = [
          "d_85",
          "d_86",
          "d_87",
          // d_88-d_93 removed - will be synced from S10 via syncAreasFromS10()
          "d_94",
          "d_95",
          "d_96",
          "d_97", // Area and component fields
          "f_85",
          "f_86",
          "f_87",
          "f_94",
          "f_95", // RSI values
          "g_88",
          "g_89",
          "g_90",
          "g_91",
          "g_92",
          "g_93", // U-values
        ];
        referenceFields.forEach(fieldId => {
          const value = this.state[fieldId];
          if (value !== null && value !== undefined) {
            window.TEUI.StateManager.setValue(
              `ref_${fieldId}`,
              value,
              "default"
            );
            console.log(
              `[S11 REF DEFAULTS] Published ref_${fieldId}=${value} to StateManager`
            );
          }
        });
      }

      console.log(
        `S11: Reference defaults loaded from standard: ${currentStandard}`
      );
    },

    // Listen for changes to the reference standard and reload defaults
    onReferenceStandardChange: function () {
      console.log("S11: Reference standard changed, reloading defaults");

      // Preserve user-modified area values (design choices, not code requirements)
      const preservedAreas = {};
      const areaFields = ["d_85", "d_86", "d_87", "d_94", "d_95", "d_96"];

      areaFields.forEach(fieldId => {
        // For Reference mode, always preserve current values
        if (ModeManager.currentMode === "reference") {
          preservedAreas[fieldId] = this.state[fieldId];
        }
        // For Target mode, preserve areas from TargetState
        else {
          preservedAreas[fieldId] = TargetState.getValue(fieldId);
        }
      });

      // Load new reference values (this updates RSI/U-values from ReferenceValues.js)
      this.setDefaults();

      // Restore preserved area values
      Object.assign(this.state, preservedAreas);
      this.saveState();

      console.log(
        "S11: Reference standard updated, areas preserved, performance values updated"
      );

      // Graph handles recalculation when reference standard changes
    },

    saveState: function () {
      localStorage.setItem("S11_REFERENCE_STATE", JSON.stringify(this.state));
    },
    syncFromGlobalState: function () { /* graph is source of truth */ },
    setValue: function (fieldId, value) {
      this.state[fieldId] = value;
      this.saveState();
    },
    getValue: function (fieldId) {
      return this.state[fieldId];
    },
  };

  // PATTERN 2: The ModeManager Facade
  const ModeManager = {
    currentMode: "target",
    initialize: function () {
      TargetState.initialize();
      ReferenceState.initialize();

      // Listen for reference standard changes
      // ✅ PHASE 3 CLEANUP: d_13 listeners removed - FileHandler handles value application
      // "Set Values" button in Section02 delegates to FileHandler.applyReferenceValuesFromStandard()
      // which applies ReferenceValues using Import Quarantine pattern
    },
    switchMode: function (mode) {
      if (
        this.currentMode === mode ||
        (mode !== "target" && mode !== "reference")
      )
        return;
      this.currentMode = mode;
      console.log(`S11: Switched to ${mode.toUpperCase()} mode`);

      this.refreshUI();

      // ✅ NEW: Sync visual toggle UI when mode changes (from global or local toggle)
      this.syncToggleUI(mode);
    },
    resetState: function () {
      console.log(
        "S11: Resetting state and clearing localStorage for Section 11."
      );
      TargetState.setDefaults();
      TargetState.saveState();
      ReferenceState.setDefaults(); // This will reload from current d_13 selection
      ReferenceState.saveState();
      console.log("S11: States have been reset to defaults.");
    },
    getCurrentState: function () {
      return this.currentMode === "target" ? TargetState : ReferenceState;
    },
    getValue: function (fieldId) {
      return this.getCurrentState().getValue(fieldId);
    },
    setValue: function (fieldId, value, source = "user") {
      this.getCurrentState().setValue(fieldId, value, source);

      // Bridge to StateManager for cross-section propagation
      if (this.currentMode === "target") {
        const writeSource =
          source === "user-modified" || source === "user"
            ? "user-modified"
            : source || "calculated";
        window.TEUI.StateManager.setValue(fieldId, value, writeSource);
        // Graph handles S12 recalculation via dependency chain
      } else if (this.currentMode === "reference") {
        // Write Reference-side updates with ref_ prefix
        const writeSource =
          source === "user-modified" || source === "user"
            ? "user-modified"
            : source || "calculated";
        if (fieldId === "d_97") {
          console.log(
            `[S11] ModeManager REF write: ref_d_97=${value} (src=${writeSource})`
          );
        }
        window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, writeSource);
        // Graph handles S12 recalculation via dependency chain
      }
    },
    refreshUI: function () { /* DOMBridge.stampAll() handles display */ },
    updateCalculatedDisplayValues: function () { /* DOMBridge.stampAll() handles display */ },

    // ✅ NEW: Sync visual toggle switch and indicator to match current mode
    // Called both when user clicks local toggle AND when global toggle switches mode
    syncToggleUI: function (mode) {
      // Use centralized ToggleUISync utility
      window.TEUI.ToggleUISync.syncToggleUI(this._toggleElements, mode, "S11");
    },
  };

  // Expose globally for cross-section communication
  window.TEUI.sect11 = window.TEUI.sect11 || {};
  window.TEUI.sect11.ModeManager = ModeManager;

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
      label: "Doors",
      cells: {
        c: { label: "Doors" },
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
      label: "Window Area North",
      cells: {
        c: { label: "Window Area North" },
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
      label: "Window Area East",
      cells: {
        c: { label: "Window Area East" },
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
      label: "Window Area South",
      cells: {
        c: { label: "Window Area South" },
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
      label: "Window Area West",
      cells: {
        c: { label: "Window Area West" },
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
    if (sectionRows["header"])
      layoutRows.push(createLayoutRow(sectionRows["header"]));
    Object.entries(sectionRows).forEach(([key, row]) => {
      if (key !== "header") layoutRows.push(createLayoutRow(row));
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
      const currentMode = ModeManager.currentMode; // "target" or "reference"

      // ✅ FIX: Detect if this is initial/import sync requiring dual-state population
      // Check if ReferenceState areas are unpopulated OR don't match StateManager
      // This handles BOTH initialization (undefined) AND import (stale values)
      const refArea_d88 = ReferenceState.getValue("d_88");
      const stateManager_refArea =
        window.TEUI.StateManager.getValue("ref_d_73");

      const needsDualSync =
        (isInitializationPhase || isImportActive) && // ✅ FIX: During initialization OR import, not user edits
        currentMode === "target" &&
        (refArea_d88 === undefined || refArea_d88 !== stateManager_refArea);

      if (needsDualSync) {
        console.log(
          `[S11 Area Sync] DUAL-STATE SYNC - populating BOTH Target and Reference states`
        );
        console.log(
          `[S11 Area Sync] Reason: d_88=${refArea_d88}, ref_d_73 in StateManager=${stateManager_refArea}`
        );
      } else {
        console.log(`[S11 Area Sync] Starting sync in ${currentMode} mode`);
      }

      // ✅ PERFORMANCE (2025.12.07): Batch state updates to prevent listener cascade
      // Baseline: 234ms init, 360ms S10 area change | Optimized: 227ms init, 352ms S10 area change
      // Collect all updates first, then apply them in one pass
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

        // ✅ FIX: During dual-state sync, populate BOTH states
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
            // Queue state update
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

      // ✅ PERFORMANCE: Apply all state updates silently (no StateManager publication yet)
      console.log(
        `[S11 Area Sync] Applying ${targetUpdates.length} target updates, ${refUpdates.length} reference updates`
      );

      targetUpdates.forEach(({ field, value }) => {
        TargetState.setValue(field, value, "calculated");
      });

      refUpdates.forEach(({ field, value }) => {
        ReferenceState.setValue(field, value, "calculated");
      });

      // ✅ PERFORMANCE: Update DOM elements directly without triggering ModeManager.setValue
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
        if (ModeManager.currentMode !== "target") return;
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

  // Condensation risk helpers removed — graph computes surface temperatures
  // calculateComponentRow, calculateThermalBridgePenalty removed — graph computes
  // getFieldFormat, updateReferenceIndicators removed — graph handles indicators
  // calculateReferenceModel, calculateTargetModel removed — graph computes

  function calculateAll() { /* graph computes */ }

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

    // ✅ DUAL-STATE: Store value using the ModeManager facade.
    ModeManager.setValue(currentFieldId, rawValueToStore, "user-modified");
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

          // ✅ DUAL-STATE: Update via ModeManager (handles both state and StateManager sync)
          const src = "user-modified";
          ModeManager.setValue("d_97", percentageValue.toString(), src);
          console.log(
            `[S11] Slider input d_97=${percentageValue} (localMode=${ModeManager.currentMode})`
          );
          // Graph handles recalculation via dependency chain
        });

        // ARCHITECTURAL COMPLIANCE: Final change event relies on StateManager dependency chain
        d97Slider.addEventListener("change", function () {
          const percentageValue = parseFloat(this.value);
          if (isNaN(percentageValue)) return;

          // ✅ DUAL-STATE: Final value goes through ModeManager - handles state and dependency chain
          const src = "user-modified";
          ModeManager.setValue("d_97", percentageValue.toString(), src);
          console.log(
            `[S11] Slider change d_97=${percentageValue} (localMode=${ModeManager.currentMode})`
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
    console.log(
      "S11: Section rendered - initializing Self-Contained State Module."
    );

    // 1. Initialize the ModeManager and its internal states
    ModeManager.initialize();

    // 2. Initialize event handlers for this section
    initializeEventHandlers();

    // Expose ModeManager globally for cross-section communication (e.g., global toggle)
    if (window.TEUI) {
      window.TEUI.sect11 = window.TEUI.sect11 || {};
      window.TEUI.sect11.ModeManager = ModeManager;
      console.log(
        "S11: ModeManager exposed globally for cross-section integration."
      );
    }

    // ✅ S10-S11 AREA SYNC: Mark S11 as initialized (CRITICAL for crash prevention)
    isS11Initialized = true;
    console.log(
      "[S11 Area Sync] S11 initialization complete - sync functions now enabled"
    );

    // Graph handles initial calculations via dependency chain
    isInitializationPhase = false;

    // 6. Apply validation tooltips to fields
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
    calculateAll,

    // ✅ CRITICAL FIX: Export ModeManager for dual-state field routing
    ModeManager: ModeManager,

    // ✅ PHASE 2: Expose state objects for import sync
    TargetState: TargetState,
    ReferenceState: ReferenceState,

    // ✅ FIX (Oct 10): Expose S10 area sync for FileHandler post-import call
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

// REMOVED Event Listeners
// // Initialize when the section is rendered
// document.addEventListener('teui-section-rendered', (event) => {
//     if (event.detail?.sectionId === 'transmissionLosses') {
//         // Small delay to ensure other sections are ready and StateManager has values
//         setTimeout(() => { window.TEUI.SectionModules.sect11?.onSectionRendered(); }, 50);
//     }
// });
//
// // Fallback to rendering complete event (ensure it runs even if teui-section-rendered is missed)
// document.addEventListener('teui-rendering-complete', () => {
//     setTimeout(() => { if (document.getElementById('transmissionLosses')) window.TEUI.SectionModules.sect11?.onSectionRendered(); }, 250);
// });
