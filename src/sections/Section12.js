/**
 * 4012-Section12.js
 * Volume and Surface Metrics (Section 12) module for TEUI Calculator 4.012. Note added 2025.12.15: Make sure skylights d_93, ref_d_93, do not form part of WWR calcs at d_107. Excel had this and we fixed it.
 */

window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

window.TEUI.SectionModules.sect12 = (function () {
  let isInitialized = false;
  let s12ListenersAdded = false;
  let lastReferenceResults = {}; // ✅ S11 PATTERN: Store Reference results for persistence

  //==========================================================================
  // DUAL-STATE ARCHITECTURE (Self-Contained State Module)
  //==========================================================================

  // PATTERN A: Internal State Objects (Self-Contained + Persistent)
  const TargetState = {
    state: {},
    listeners: {},
    initialize: function () {
      const savedState = localStorage.getItem("S12_TARGET_STATE");
      if (savedState) {
        this.state = JSON.parse(savedState);
      } else {
        this.setDefaults();
      }
    },
    setDefaults: function () {
      // S12-specific defaults - MUST match sectionRows values CONSOLIDATE THESE TO FIELD DEFINITIONS PER 4012-CHEATSHEET.md
      this.state = {
        d_103: "1.5", // Number of stories (dropdown)
        g_103: "Normal", // Exposure (dropdown)
        d_105: "8319.50", // Conditioned volume (editable)
        g_106: "5.15", // Typical floor-to-floor height (editable)
        d_108: "AL-1B", // ✅ FIXED: Use AL-1B method (was MEASURED) to get proper 93.6 TEUI
        g_109: "1.30", // Measured value (conditional editable, N/A when not MEASURED)
      };
    },
    /**
     * ✅ PHASE 2: Sync from global StateManager after import
     */
    syncFromGlobalState: function (
      fieldIds = ["d_103", "g_103", "d_105", "g_106", "d_108", "g_109"]
    ) {
      fieldIds.forEach(fieldId => {
        const globalValue = window.TEUI.StateManager.getValue(fieldId);
        if (globalValue !== null && globalValue !== undefined) {
          this.setValue(fieldId, globalValue, "imported");
          console.log(
            `S12 TargetState: Synced ${fieldId} = ${globalValue} from global StateManager`
          );
        }
      });
    },

    /**
     * ✅ PHASE 6: Apply code-minimum baseline values from ReferenceValues
     * Called by "Set Values" button to overlay reference values onto Target model
     * ⚠️ STATE ISOLATION SAFEGUARD: Only writes to unprefixed fields (Target model)
     */
    applyReferenceValues: function (standard) {
      const referenceValues = window.TEUI?.ReferenceValues?.[standard] || {};

      console.log(
        `[S12 TargetState] Applying code-minimum values from "${standard}"`
      );

      Object.keys(referenceValues).forEach(fieldId => {
        if (referenceValues[fieldId] !== undefined) {
          // ✅ Writes to d_103, g_103, etc., NOT ref_d_103
          this.state[fieldId] = referenceValues[fieldId];
          console.log(
            `[S12 TargetState] ${fieldId} = ${referenceValues[fieldId]} (from ${standard})`
          );
        }
      });

      this.saveState();
      console.log(
        `[S12 TargetState] Code-minimum values from "${standard}" applied to Target model`
      );
    },

    saveState: function () {
      localStorage.setItem("S12_TARGET_STATE", JSON.stringify(this.state));
    },
    setValue: function (fieldId, value, source = "user") {
      this.state[fieldId] = value;
      // ✅ FIXED: Save state for any user action (user or user-modified)
      if (source === "user" || source === "user-modified") {
        this.saveState();
        console.log(
          `S12 TargetState: Saved state after ${source} changed ${fieldId} to ${value}`
        );
      }
    },
    getValue: function (fieldId) {
      return this.state[fieldId];
    },
  };

  const ReferenceState = {
    state: {},
    listeners: {},
    initialize: function () {
      console.log(`[S12 DEBUG] ReferenceState.initialize() called`);
      const savedState = localStorage.getItem("S12_REFERENCE_STATE");
      if (savedState) {
        console.log(`[S12 DEBUG] Found saved Reference state in localStorage`);
        this.state = JSON.parse(savedState);
        console.log(`[S12 DEBUG] ReferenceState loaded:`, this.state);

        // ✅ CRITICAL: Re-publish to StateManager even when loading from localStorage
        // This ensures values are available for CSV export after page refresh (S10 pattern)
        if (window.TEUI?.StateManager) {
          const referenceFields = [
            "d_103",
            "g_103",
            "d_105",
            "g_106",
            "d_108",
            "g_109",
          ];
          console.log(
            `[S12 DEBUG] Re-publishing ${referenceFields.length} Reference fields from localStorage...`
          );
          referenceFields.forEach(fieldId => {
            const value = this.state[fieldId];
            if (value !== null && value !== undefined) {
              console.log(`[S12 DEBUG] Publishing ref_${fieldId} = ${value}`);
              window.TEUI.StateManager.setValue(
                `ref_${fieldId}`,
                value,
                "default"
              );
            } else {
              console.warn(
                `[S12 DEBUG] Skipping ref_${fieldId} - value is null/undefined`
              );
            }
          });
          console.log(`[S12 DEBUG] Reference field publishing complete`);
        }
      } else {
        this.setDefaults();
      }
    },
    setDefaults: function () {
      console.log(
        `[S12 DEBUG] ReferenceState.setDefaults() called - no localStorage, using defaults`
      );
      // ✅ DYNAMIC LOADING: Get current reference standard from dropdown ref_d_13
      const currentStandard =
        window.TEUI?.StateManager?.getValue?.("ref_d_13") ||
        "OBC SB10 5.5-6 Z6";
      const referenceValues =
        window.TEUI?.ReferenceValues?.[currentStandard] || {};
      console.log(`[S12 DEBUG] Using reference standard: ${currentStandard}`);

      // Apply reference values to S12 fields with fallbacks - these are fine
      this.state = {
        d_103: referenceValues.d_103 || "1.5", // Stories - MATCHES Target 1.0
        g_103: referenceValues.g_103 || "Exposed", // Exposure - DIFFERENT: Exposed vs Target Normal
        d_105: "8319.50", // Volume - MATCHES:Target 8319.50
        g_106: "5.15", // Typical floor-to-floor height - Generally >2.5m
        d_108: referenceValues.d_108 || "MEASURED", // Blower door method - DIFFERENT: Reference uses MEASURED vs Target AL-1B
        g_109: referenceValues.g_109 || "1.30", // Measured - DIFFERENT method: But same result as AL-1B
      };
      console.log(`[S12 DEBUG] ReferenceState defaults set:`, this.state);

      // ✅ CRITICAL: Publish Reference defaults to StateManager (S10/S11/S04 pattern)
      if (window.TEUI?.StateManager) {
        console.log(
          `[S12 DEBUG] StateManager available - Publishing ${6} Reference default fields...`
        );
        const referenceFields = [
          "d_103",
          "g_103",
          "d_105",
          "g_106",
          "d_108",
          "g_109",
        ];
        referenceFields.forEach(fieldId => {
          const value = this.state[fieldId];
          if (value !== null && value !== undefined) {
            console.log(
              `[S12 DEBUG] Publishing ref_${fieldId} = ${value} (from defaults)`
            );
            window.TEUI.StateManager.setValue(
              `ref_${fieldId}`,
              value,
              "default"
            );
          } else {
            console.warn(
              `[S12 DEBUG] Skipping ref_${fieldId} - value is null/undefined`
            );
          }
        });
        console.log(`[S12 DEBUG] Reference defaults publishing complete`);
      } else {
        console.error(
          `[S12 DEBUG] ❌ StateManager NOT AVAILABLE - cannot publish Reference defaults!`
        );
      }

      console.log(
        `S12: Reference defaults loaded from standard: ${currentStandard}`
      );
    },
    // MANDATORY: Include onReferenceStandardChange for d_13 changes
    onReferenceStandardChange: function () {
      console.log("S12: Reference standard changed, reloading defaults");
      this.setDefaults();
      this.saveState();
      // Only refresh UI if currently in reference mode
      if (ModeManager.currentMode === "reference") {
        ModeManager.refreshUI();
        calculateAll();
      }
    },
    saveState: function () {
      localStorage.setItem("S12_REFERENCE_STATE", JSON.stringify(this.state));
    },
    /**
     * ✅ PHASE 2: Sync from global StateManager after import
     */
    syncFromGlobalState: function (
      fieldIds = ["d_103", "g_103", "d_105", "g_106", "d_108", "g_109"]
    ) {
      fieldIds.forEach(fieldId => {
        const refFieldId = `ref_${fieldId}`;
        const globalValue = window.TEUI.StateManager.getValue(refFieldId);
        if (globalValue !== null && globalValue !== undefined) {
          this.setValue(fieldId, globalValue, "imported");
          console.log(
            `S12 ReferenceState: Synced ${fieldId} = ${globalValue} from global StateManager (${refFieldId})`
          );
        }
      });
    },
    setValue: function (fieldId, value, source = "user") {
      this.state[fieldId] = value;
      // ✅ FIXED: Save state for any user action (user or user-modified)
      if (source === "user" || source === "user-modified") {
        this.saveState();
        console.log(
          `S12 ReferenceState: Saved state after ${source} changed ${fieldId} to ${value}`
        );
      }
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

      // ✅ PHASE 3 CLEANUP: PASSIVE d_13/ref_d_13 listeners removed
      // "Set Values" button handles value application via FileHandler
      // Note: CRITICAL d_13 listener at line ~2927 will also be removed
    },
    switchMode: function (mode) {
      if (
        this.currentMode === mode ||
        (mode !== "target" && mode !== "reference")
      )
        return;
      this.currentMode = mode;
      console.log(`S12: Switched to ${mode.toUpperCase()} mode`);

      this.refreshUI();
      // Display-only: update UI without triggering calculations
      this.updateCalculatedDisplayValues();

      // ✅ FIX: Re-evaluate conditional editability after mode switch
      // This ensures g_109 is properly editable/locked based on mode and d_108 value
      handleConditionalEditability();

      // ✅ NEW: Sync visual toggle UI when mode changes (from global or local toggle)
      this.syncToggleUI(mode);
    },

    // Update displayed calculated values based on current mode
    updateCalculatedDisplayValues: function () {
      if (!window.TEUI?.StateManager) return;

      const calculatedFields = [
        "d_101",
        "d_102",
        "d_104",
        // d_105 removed - it's USER INPUT (editable), not calculated
        "d_106",
        "d_107",
        "g_101",
        "g_102",
        "g_104", // ✅ EXCEL PARITY: Added g_104 weighted U-value
        "g_105",
        "g_107", // Total Wall Area checksum
        "g_108",
        "g_109",
        "g_110",
        "h_101",
        "h_102",
        "i_101",
        "i_102",
        "i_103",
        "i_104",
        "i_105",
        "i_107", // Total Window & Door Heat Loss
        "i_110",
        "j_101",
        "j_102",
        "k_101",
        "k_102",
        "k_103",
        "k_104",
        "l_101",
        "l_102",
        "l_103",
        "l_104",
        "m_104",
        "n_104", // ✅ M-N-COMPLIANCE: Passive House compliance checkmark
        "m_107",
        "n_107", // ✅ M-N-COMPLIANCE: WWR compliance checkmark
        "m_109",
        "n_109", // ✅ M-N-COMPLIANCE: ACH50 compliance checkmark
        "m_110",
        "n_110", // ✅ M-N-COMPLIANCE: ELA compliance checkmark
        "d_109",
        "d_110",
        "o_101", // ✅ MRT: Air-facing aggregate surface temperature
        "o_102", // ✅ MRT: Ground-facing aggregate surface temperature
        "o_104", // ✅ MRT: Total building aggregate surface temperature
      ];

      calculatedFields.forEach(fieldId => {
        let valueToDisplay;

        // ✅ FIX: Read global Reference toggle state instead of local currentMode
        // This ensures S12 displays correct values when Reference mode is active globally
        // even if S12's local ModeManager.currentMode hasn't been synced
        const isReferenceMode =
          window.TEUI?.ReferenceToggle?.isReferenceMode?.() || false;

        if (isReferenceMode) {
          // ✅ STRICT MODE ISOLATION: Reference mode reads ONLY ref_ values
          // Never fall back to Target values (Anti-Pattern 1 from CHEATSHEET)
          valueToDisplay = window.TEUI.StateManager.getValue(`ref_${fieldId}`);
          // If ref_ value doesn't exist, use 0 or safe default, NEVER the Target value
          if (valueToDisplay === null || valueToDisplay === undefined) {
            valueToDisplay = "0"; // Safe default for display
          }
        } else {
          // In Target mode, show regular values
          valueToDisplay = window.TEUI.StateManager.getValue(fieldId);
        }

        if (valueToDisplay !== null && valueToDisplay !== undefined) {
          const element = document.querySelector(
            `[data-field-id="${fieldId}"]`
          );
          if (element && !element.hasAttribute("contenteditable")) {
            // Only update calculated fields, not user-editable ones

            // ✅ M-N-COMPLIANCE: Handle raw format fields (m_104, m_107, m_109, m_110, n_* columns)
            if (
              fieldId === "m_104" ||
              fieldId === "m_107" ||
              fieldId === "m_109" ||
              fieldId === "m_110" ||
              fieldId.startsWith("n_")
            ) {
              // Raw text fields - display as-is (already formatted strings)
              element.textContent = valueToDisplay;

              // ✅ FIX: Reapply CSS classes for n_* status fields on mode switch
              if (fieldId.startsWith("n_")) {
                element.classList.remove("checkmark", "warning");
                element.classList.add(
                  valueToDisplay === "✓" ? "checkmark" : "warning"
                );
              }
            } else if (fieldId.startsWith("o_")) {
              // ✅ MRT: Surface temperature fields with condensation risk indicators
              const numericValue = window.TEUI.parseNumeric(valueToDisplay);
              if (numericValue !== 0 && !isNaN(numericValue)) {
                // Get interior temperature from Section03 for Passivhaus threshold calculation
                const interiorTemp = getGlobalNumericValue("h_23");
                const hasRisk = hasCondensationRisk(numericValue, interiorTemp);
                const emoji = hasRisk ? "💧" : "🌵";
                const formattedTemp = formatNumber(numericValue, "number");
                element.textContent = `${emoji} ${formattedTemp}`;
              } else {
                element.textContent = "";
              }
            } else {
              // Numeric fields - parse and format
              const numericValue = window.TEUI.parseNumeric(valueToDisplay);
              if (!isNaN(numericValue)) {
                let formattedValue;
                // Use appropriate formatting based on field type
                if (
                  fieldId.startsWith("g_") &&
                  (fieldId.includes("101") ||
                    fieldId.includes("102") ||
                    fieldId === "g_104")
                ) {
                  formattedValue = formatNumber(numericValue, "W/m2");
                } else if (
                  fieldId === "g_105" ||
                  fieldId === "i_105" ||
                  fieldId === "d_107"
                ) {
                  // Volume/Area ratio, Area/Volume ratio, and WWR as percentages with 2dp
                  formattedValue = window.TEUI.formatNumber(
                    numericValue,
                    "percent-2dp"
                  );
                } else if (fieldId.startsWith("l_")) {
                  // Match the precision used in setCalculatedValue()
                  // l_101, l_102, l_103 use 2dp, l_104+ uses 0dp
                  const percentFormat =
                    fieldId === "l_101" ||
                    fieldId === "l_102" ||
                    fieldId === "l_103"
                      ? "percent-2dp"
                      : "percent-0dp";
                  formattedValue = window.TEUI.formatNumber(
                    numericValue,
                    percentFormat
                  );
                } else if (
                  // ✅ FIX: Large values (areas, kWh) should use commas for readability
                  [
                    "d_101",
                    "d_102",
                    "d_104",
                    "d_106",
                    "i_101",
                    "i_102",
                    "i_103",
                    "i_104",
                    "i_107",
                    "k_101",
                    "k_102",
                    "k_103",
                    "k_104",
                  ].includes(fieldId)
                ) {
                  formattedValue = window.TEUI.formatNumber(
                    numericValue,
                    "number-2dp-comma"
                  );
                } else {
                  formattedValue = window.TEUI.formatNumber(
                    numericValue,
                    "number-2dp"
                  );
                }
                element.textContent = formattedValue;
              }
            }
          }
        }
      });

      // console.log(
      //   `[Section12] Calculated display values updated for ${this.currentMode} mode`
      // );
    },
    resetState: function () {
      console.log("S12: Resetting state and clearing localStorage.");
      TargetState.setDefaults();
      TargetState.saveState();
      ReferenceState.setDefaults();
      ReferenceState.saveState();
      console.log("S12: States have been reset to defaults.");

      this.refreshUI();
      calculateAll();
    },
    getCurrentState: function () {
      return this.currentMode === "target" ? TargetState : ReferenceState;
    },
    getValue: function (fieldId) {
      return this.getCurrentState().getValue(fieldId);
    },
    setValue: function (fieldId, value, source = "user") {
      this.getCurrentState().setValue(fieldId, value, source);

      // ✅ FIX: Publish BOTH Target and Reference changes to StateManager
      // This ensures downstream sections receive updates in both modes
      if (this.currentMode === "target") {
        // Target mode: publish unprefixed value
        window.TEUI.StateManager.setValue(fieldId, value, "user-modified");
      } else if (this.currentMode === "reference") {
        // Reference mode: publish with ref_ prefix
        window.TEUI.StateManager.setValue(
          `ref_${fieldId}`,
          value,
          "user-modified"
        );
      }
    },
    refreshUI: function () {
      const sectionElement = document.getElementById("volumeSurfaceMetrics");
      if (!sectionElement) return;

      const currentState = this.getCurrentState();

      // S12-specific fields to sync
      const fieldsToSync = [
        "d_103",
        "g_103",
        "d_105",
        "g_106",
        "d_108",
        "g_109",
      ];

      fieldsToSync.forEach(fieldId => {
        const stateValue = currentState.getValue(fieldId);
        if (stateValue === undefined || stateValue === null) return;

        const element = sectionElement.querySelector(
          `[data-field-id="${fieldId}"]`
        );
        if (!element) return;

        // ✅ PATTERN A: Simple dropdown pattern (like S10) - NO SAFETY CHECKS
        const dropdown = element.matches("select")
          ? element
          : element.querySelector("select");

        if (dropdown) {
          dropdown.value = stateValue; // Simple and direct - like working sections
        } else if (element.hasAttribute("contenteditable")) {
          // ✅ FIX: Format numeric values to 2dp for consistency
          const numericValue = window.TEUI.parseNumeric(stateValue);
          if (
            !isNaN(numericValue) &&
            (fieldId === "g_109" || fieldId === "d_105" || fieldId === "g_106")
          ) {
            element.textContent = window.TEUI.formatNumber(
              numericValue,
              "number-2dp"
            );
          } else {
            element.textContent = stateValue;
          }
        }
      });

      // ✅ FIX: Re-evaluate conditional editability after refreshing UI
      // This ensures g_109 is properly editable when d_108="MEASURED" after import
      handleConditionalEditability();
    },

    // ✅ NEW: Sync visual toggle switch and indicator to match current mode
    // Called both when user clicks local toggle AND when global toggle switches mode
    syncToggleUI: function (mode) {
      // Use centralized ToggleUISync utility
      window.TEUI.ToggleUISync.syncToggleUI(this._toggleElements, mode, "S12");
    },
  };

  // MANDATORY: Global exposure
  window.TEUI.sect12 = window.TEUI.sect12 || {};
  window.TEUI.sect12.ModeManager = ModeManager;
  window.TEUI.sect12.TargetState = TargetState;
  window.TEUI.sect12.ReferenceState = ReferenceState;

  //==========================================================================
  // FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  const sectionRows = {
    header: {
      id: "12-ID",
      rowId: "12-ID",
      label: "Volume and Surface Metrics Units",
      cells: {
        c: {
          content: "SECTION 12. Volume and Surface Metrics",
          classes: ["section-header"],
          colspan: 4,
        },
        d: { content: "", classes: ["section-subheader"] },
        e: { content: "", classes: ["section-subheader"] },
        f: { content: "", classes: ["section-subheader"] },
        g: {
          content: "U-Value\nW/m²·K",
          classes: ["section-subheader", "align-right"],
        },
        h: {
          content: "Loss Rate\nkWh/m²",
          classes: ["section-subheader", "align-right"],
        },
        i: {
          content: "Heatloss\nkWh/Htg. Season",
          classes: ["section-subheader", "align-right"],
        },
        j: {
          content: "Gain Rate\nkWh/m²",
          classes: ["section-subheader", "align-right"],
        },
        k: {
          content: "Heatgain\nkWh/Cool Season",
          classes: ["section-subheader", "align-right"],
        },
        l: {
          content: "Heatloss %",
          classes: ["section-subheader", "align-right"],
        },
        m: {
          content: "Reference",
          classes: ["section-subheader", "align-right"],
        },
        n: { content: "N", classes: ["section-subheader", "align-center"] },
        o: {
          content: "MRT °C",
          classes: ["section-subheader", "align-right"],
        },
      },
    },
    101: {
      id: "B.16",
      rowId: "B.16",
      label: "Total Area Exposed to Air (Ae)",
      cells: {
        c: { label: "Total Area Exposed to Air (Ae)" },
        d: {
          fieldId: "d_101",
          semanticPath: "geometry.airFacing.area",
          type: "calculated",
          value: "2476.62",
          section: "volumeSurfaceMetrics",
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
          ],
          classes: ["text-air-facing"],
        },
        e: { content: "m²", classes: ["unit-label"] },
        f: { content: "U-Val. for Ae", classes: ["label-main"] },
        g: {
          fieldId: "g_101",
          semanticPath: "geometry.airFacing.uValue",
          type: "calculated",
          value: "0.278",
          section: "volumeSurfaceMetrics",
          dependencies: [
            "g_85",
            "h_85",
            "g_86",
            "h_86",
            "g_87",
            "h_87",
            "g_88",
            "h_88",
            "g_89",
            "h_89",
            "g_90",
            "h_90",
            "g_91",
            "h_91",
            "g_92",
            "h_92",
            "g_93",
            "h_93",
            "d_97",
          ],
          classes: ["text-air-facing"],
          label: "U-Value for Air-Exposed Envelope (Ae)",
        },
        h: {
          fieldId: "h_101",
          semanticPath: "geometry.airFacing.lossRate",
          type: "calculated",
          value: "30.73",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_101", "d_20"],
          label: "Heat Loss Rate per m² (Ae Envelope): kWh/m²",
        },
        i: {
          fieldId: "i_101",
          semanticPath: "geometry.airFacing.heatLoss",
          type: "calculated",
          value: "76,103.69",
          section: "volumeSurfaceMetrics",
          dependencies: ["h_101", "d_101"],
          label: "Total Heat Loss (Ae Envelope): kWh/yr",
        },
        j: {
          fieldId: "j_101",
          semanticPath: "geometry.airFacing.gainRate",
          type: "calculated",
          value: "1.31",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_101", "d_21"],
          label: "Heat Gain Rate per m² (Ae Envelope): kWh/m²",
        },
        k: {
          fieldId: "k_101",
          semanticPath: "geometry.airFacing.heatGain",
          type: "calculated",
          value: "3,242.68",
          section: "volumeSurfaceMetrics",
          dependencies: ["j_101", "d_101"],
          label: "Total Heat Gain (Ae Envelope): kWh/yr",
        },
        l: {
          fieldId: "l_101",
          semanticPath: "geometry.airFacing.lossPercent",
          type: "calculated",
          value: "65.57%",
          section: "volumeSurfaceMetrics",
          dependencies: ["i_101", "i_104"],
          classes: ["percentage-value"],
          label: "Ae Heat Loss as % of Total",
        },
        m: { content: "", classes: ["reference-value"] },
        n: { content: "" },
        o: {
          fieldId: "o_101",
          semanticPath: "geometry.airFacing.surfaceTemp",
          type: "calculated",
          value: "0.00",
          dependencies: ["g_101", "h_23", "d_25", "d_101"],
          label: "Air-facing Aggregate: Interior Surface Temperature °C",
          tooltip: true,
        },
      },
    },
    102: {
      id: "B.17",
      rowId: "B.17",
      label: "Total Area Exposed to Ground (Ag)",
      cells: {
        c: { label: "Total Area Exposed to Ground (Ag)" },
        d: {
          fieldId: "d_102",
          semanticPath: "geometry.groundFacing.area",
          type: "calculated",
          value: "1100.93",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_94", "d_95"],
          classes: ["text-ground-facing"],
        },
        e: { content: "m²", classes: ["unit-label"] },
        f: { content: "U-Val. for Ag", classes: ["label-main"] },
        g: {
          fieldId: "g_102",
          semanticPath: "geometry.groundFacing.uValue",
          type: "calculated",
          value: "0.324",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_94", "h_94", "g_95", "h_95", "d_97"],
          conditionalDeps: ["d_94", "d_95"],
          classes: ["text-ground-facing"],
          label: "U-Value for Ground-Exposed Envelope (Ag)",
        },
        h: {
          fieldId: "h_102",
          semanticPath: "geometry.groundFacing.lossRate",
          type: "calculated",
          value: "15.26",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_102", "d_22"],
          label: "Heat Loss Rate per m² (Ag Envelope): kWh/m²",
        },
        i: {
          fieldId: "i_102",
          semanticPath: "geometry.groundFacing.heatLoss",
          type: "calculated",
          value: "16,788.25",
          section: "volumeSurfaceMetrics",
          dependencies: ["h_102", "d_102"],
          label: "Total Heat Loss (Ag Envelope): kWh/yr",
        },
        j: {
          fieldId: "j_102",
          semanticPath: "geometry.groundFacing.gainRate",
          type: "calculated",
          value: "-13.08",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_102", "h_22"],
          label: "Heat Gain Rate per m² (Ag Envelope): kWh/m²",
        },
        k: {
          fieldId: "k_102",
          semanticPath: "geometry.groundFacing.heatGain",
          type: "calculated",
          value: "-14,389.92",
          section: "volumeSurfaceMetrics",
          dependencies: ["j_102", "d_102"],
          label: "Total Heat Gain (Ag Envelope): kWh/yr",
        },
        l: {
          fieldId: "l_102",
          semanticPath: "geometry.groundFacing.lossPercent",
          type: "calculated",
          value: "14.46%",
          section: "volumeSurfaceMetrics",
          dependencies: ["i_102", "i_104"],
          label: "Ag Heat Loss as % of Total",
          classes: ["percentage-value"],
        },
        m: { content: "", classes: ["reference-value"] },
        n: { content: "" },
        o: {
          fieldId: "o_102",
          semanticPath: "geometry.groundFacing.surfaceTemp",
          type: "calculated",
          value: "0.00",
          dependencies: ["g_102", "h_23", "d_102"],
          label: "Ground-facing Aggregate: Interior Surface Temperature °C",
          tooltip: true,
        },
      },
    },
    103: {
      id: "B.18.3",
      rowId: "B.18.3",
      label: "Heating Natural Air Leakage Heatloss",
      cells: {
        c: { label: "Heating Natural Air Leakage Heatloss" },
        d: {
          fieldId: "d_103",
          semanticPath: "airLeakage.stories",
          type: "dropdown",
          dropdownId: "dd_d_103",
          value: "1.5",
          section: "volumeSurfaceMetrics",
          tooltip: true, // Select Stories
          options: [
            { value: "1", name: "1" },
            { value: "1.5", name: "1.5" },
            { value: "2", name: "2" },
            { value: "3", name: "3" },
            { value: "4", name: "4" },
            { value: "5", name: "5" },
            { value: "6", name: "6" },
          ],
        },
        e: { content: "Stories", classes: ["unit-label"] },
        f: { content: "B.18.3 Shielding", classes: ["label-main"] },
        g: {
          fieldId: "g_103",
          semanticPath: "airLeakage.shielding",
          type: "dropdown",
          dropdownId: "dd_g_103",
          value: "Normal",
          section: "volumeSurfaceMetrics",
          tooltip: true, // Exposure (no tooltip in manager, but keeping for future)
          options: [
            { value: "Shielded", name: "Shielded" },
            { value: "Normal", name: "Normal" },
            { value: "Exposed", name: "Exposed" },
          ],
        },
        h: {},
        i: {
          fieldId: "i_103",
          semanticPath: "airLeakage.heatingHeatLoss",
          type: "calculated",
          value: "23,178.39",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_108", "g_110", "d_101", "d_20"],
          label: "Air Leakage Heat Loss (Heating Season)",
        },
        j: {},
        k: {
          fieldId: "k_103",
          semanticPath: "airLeakage.coolingHeatGain",
          type: "calculated",
          value: "987.60",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_108", "g_110", "d_101", "d_21"],
          label: "Air Leakage Heat Gain (Cooling Season)",
        },
        l: {
          fieldId: "l_103",
          semanticPath: "airLeakage.lossPercent",
          type: "calculated",
          value: "19.97%",
          section: "volumeSurfaceMetrics",
          dependencies: ["i_103", "i_104"],
          classes: ["percentage-value"],
          label: "Air Leakage Heat Loss as % of Total",
        },
        m: { content: "", classes: ["reference-value"] },
        n: { content: "" },
      },
    },
    104: {
      id: "T.4",
      rowId: "T.4",
      label: "Building U-Value Combined Total & Transmission Losses & Gains",
      cells: {
        c: {
          label:
            "Building U-Value Combined Total & Transmission Losses & Gains",
          classes: ["total-row-text"],
        },
        d: {
          fieldId: "d_104",
          semanticPath: "envelope.total.area",
          type: "calculated",
          value: "3577.04",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_101", "d_102"],
          classes: ["total-row-text"],
          label: "Total Envelope Area (Air + Ground): m²",
        },
        e: { content: "m²", classes: ["unit-label"] },
        f: {},
        g: {
          fieldId: "g_104",
          semanticPath: "envelope.total.uValue",
          type: "calculated",
          value: "0.292",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_101", "d_101", "g_102", "d_102"],
          classes: ["total-row-text"],
          label: "Area-Weighted Average U-Value (Building Envelope): W/m²·K",
        },
        h: {},
        i: {
          fieldId: "i_104",
          semanticPath: "envelope.total.heatLoss",
          type: "calculated",
          value: "116,070.33",
          section: "volumeSurfaceMetrics",
          dependencies: ["i_101", "i_102", "i_103"],
          classes: ["total-row-text"],
          label: "Total Envelope Heat Loss (All Components): kWh/yr",
        },
        j: {},
        k: {
          fieldId: "k_104",
          semanticPath: "envelope.total.heatGain",
          type: "calculated",
          value: "-10,160.19",
          section: "volumeSurfaceMetrics",
          dependencies: ["k_101", "k_102"],
          conditionalDeps: ["h_21", "k_98"],
          classes: ["total-row-text"],
          label: "Total Envelope Heat Gain (Conditional)",
        },
        l: {
          fieldId: "l_104",
          semanticPath: "envelope.total.lossPercent",
          type: "calculated",
          value: "100%",
          section: "volumeSurfaceMetrics",
          tooltip: true, // Total Excludes B.12 TB Penalty
          classes: ["percentage-value", "total-row-text"],
          dependencies: ["l_101", "l_102", "l_103"],
          label: "Total Heat Loss Percentage (Should Equal 100%)",
        },
        m: {
          fieldId: "m_104",
          semanticPath: "envelope.total.complianceRatio",
          type: "calculated",
          value: "N/A",
          section: "volumeSurfaceMetrics",
          classes: ["reference-value", "total-row-text"],
          label: "Passive House Compliance Percentage",
        },
        n: {
          fieldId: "n_104",
          semanticPath: "envelope.total.complianceStatus",
          type: "calculated",
          value: "✓",
          section: "volumeSurfaceMetrics",
          classes: ["total-row-text"],
          dependencies: ["m_104"],
          label: "Passive House Compliance Status",
        },
        o: {
          fieldId: "o_104",
          semanticPath: "envelope.total.surfaceTemp",
          type: "calculated",
          value: "0.00",
          dependencies: ["g_104", "h_23", "d_25", "d_101", "d_102"],
          label: "Total Building Aggregate: Interior Surface Temperature °C",
          tooltip: true,
          classes: ["total-row-text"],
        },
      },
    },
    105: {
      id: "B.13",
      rowId: "B.13",
      label: "Total Conditioned Volume",
      cells: {
        c: { label: "Total Conditioned Volume" },
        d: {
          fieldId: "d_105",
          semanticPath: "geometry.conditionedVolume",
          type: "editable",
          value: "8319.50", // Our only required Target default set here
          section: "volumeSurfaceMetrics",
          tooltip: true, // Conditioned Volume
          classes: ["user-input"],
        },
        e: { content: "m³", classes: ["unit-label"] },
        f: { content: "Volume/Area", classes: ["label-main"] },
        g: {
          fieldId: "g_105",
          semanticPath: "geometry.volumeToAreaRatio",
          type: "calculated",
          value: "3.23",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_105", "d_101"],
          label: "Volume to Area Ratio: m³/m²",
        },
        h: { content: "Area/Volume", classes: ["text-center"] },
        i: {
          fieldId: "i_105",
          semanticPath: "geometry.areaToVolumeRatio",
          type: "calculated",
          value: "0.31",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_101", "d_105"],
          label: "Area to Volume Ratio: m²/m³",
        },
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },
    106: {
      id: "B.14",
      rowId: "B.14",
      label: "Total Floor Area (Cond. + Uncond.)",
      cells: {
        c: { label: "Total Floor Area (Cond. + Uncond.)" },
        d: {
          fieldId: "d_106",
          semanticPath: "geometry.totalFloorArea",
          type: "calculated",
          value: "1130.12",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_87", "d_95", "d_96"],
        },
        e: { content: "m²", classes: ["unit-label"] },
        f: { content: "Typ. F2F Ht.", classes: ["label-main"] },
        g: {
          fieldId: "g_106",
          semanticPath: "geometry.floorToFloorHeight",
          type: "editable",
          value: "5.15",
          section: "volumeSurfaceMetrics",
          tooltip: true, // Typical Floor-to-Floor Height
          classes: ["user-input"],
        },
        h: { content: "Ht. in Metres", classes: ["unit-label"] },
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },
    107: {
      id: "B.15",
      rowId: "B.15",
      label: "Window:Wall Ratio (WWR)",
      cells: {
        c: { label: "Window:Wall Ratio (WWR)" },
        d: {
          fieldId: "d_107",
          semanticPath: "geometry.windowWallRatio",
          type: "calculated",
          value: "0.33",
          section: "volumeSurfaceMetrics",
          dependencies: [
            "d_88",
            "d_89",
            "d_90",
            "d_91",
            "d_92",
            "d_93",
            "d_86",
          ],
        },
        e: { content: "%", classes: ["unit-label"] },
        f: { content: "Total Wall Area", classes: ["label-main"] },
        g: {
          fieldId: "g_107",
          semanticPath: "geometry.totalWallArea",
          type: "calculated",
          value: "0.00",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_86", "d_88", "d_89", "d_90", "d_91", "d_92"],
          tooltip: true,
          label: "Total Wall Area (Opaque + Windows)",
        },
        h: { content: "m²", classes: ["unit-label"] },
        i: {
          fieldId: "i_107",
          semanticPath: "geometry.windowDoorHeatLoss",
          type: "calculated",
          value: "0.00",
          section: "volumeSurfaceMetrics",
          dependencies: ["i_88", "i_89", "i_90", "i_91", "i_92"],
          label: "Total Window & Door Heat Loss: kWh/yr",
        },
        j: { content: "kWh/yr", classes: ["unit-label"] },
        k: {},
        l: {},
        m: {
          fieldId: "m_107",
          semanticPath: "geometry.wwrComplianceRatio",
          type: "calculated",
          value: "61%",
          section: "volumeSurfaceMetrics",
          classes: ["percentage-value"],
          dependencies: ["d_107"],
          label: "WWR Ratio to Reference Standard",
        },
        n: {
          fieldId: "n_107",
          semanticPath: "geometry.wwrComplianceStatus",
          type: "calculated",
          value: "✓",
          section: "volumeSurfaceMetrics",
          dependencies: ["m_107"],
          label: "WWR Compliance Status",
        },
      },
    },
    108: {
      id: "B.18.1",
      rowId: "B.18.1",
      label: "NRL₅₀ Target Method",
      cells: {
        c: { label: "NRL₅₀ Target Method" },
        d: {
          fieldId: "d_108",
          semanticPath: "airLeakage.nrl50Method",
          type: "dropdown",
          dropdownId: "dd_d_108",
          value: "AL-1B",
          section: "volumeSurfaceMetrics",
          tooltip: true, // A.2 NRL50 * Ae
          options: [
            { value: "MEASURED", name: "Measured" },
            { value: "PH_CLASSIC", name: "PH Classic" },
            { value: "PH_LOW", name: "PH Low" },
            { value: "PH_PLUS", name: "PH+" },
            { value: "AL-1A", name: "AL-1A" },
            { value: "AL-2A", name: "AL-2A" },
            { value: "AL-3A", name: "AL-3A" },
            { value: "AL-4A", name: "AL-4A" },
            { value: "AL-5A", name: "AL-5A" },
            { value: "AL-1B", name: "AL-1B" },
            { value: "AL-2B", name: "AL-2B" },
            { value: "AL-3B", name: "AL-3B" },
            { value: "AL-4B", name: "AL-4B" },
            { value: "AL-5B", name: "AL-5B" },
            { value: "AL-6B", name: "AL-6B" },
          ],
        },
        e: { content: "", classes: ["unit-label"] },
        f: { content: "B.18.1 Target", classes: ["label-main"] },
        g: {
          fieldId: "g_108",
          semanticPath: "airLeakage.nrl50Target",
          type: "calculated",
          value: "1.17",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_108", "g_109", "d_105", "d_101"],
          label: "NRL₅₀ Target Value: L/s·m²",
        },
        h: { content: "L/s•m²", classes: ["unit-label"] },
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },
    109: {
      id: "B.18.2",
      rowId: "B.18.2",
      label: "ACH₅₀ Target (Converts B.18.1)",
      cells: {
        c: { label: "ACH₅₀ Target (Converts B.18.1)" },
        d: {
          fieldId: "d_109",
          semanticPath: "airLeakage.ach50Target",
          type: "calculated",
          value: "1.30",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_108", "d_101", "d_105"],
        },
        e: { content: "ACH", classes: ["unit-label"] },
        f: { content: "B.18.2 Measured", classes: ["label-main"] },
        g: {
          fieldId: "g_109",
          semanticPath: "airLeakage.ach50Measured",
          type: "editable",
          value: "1.30",
          section: "volumeSurfaceMetrics",
          tooltip: true, // Calculation Dependency
          classes: ["user-input"],
        },
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {
          fieldId: "m_109",
          semanticPath: "airLeakage.ach50ComplianceRatio",
          type: "calculated",
          value: "115%",
          section: "volumeSurfaceMetrics",
          classes: ["percentage-value"],
          dependencies: ["g_109", "d_109"],
          label: "ACH₅₀ Ratio (Measured/Target)",
        },
        n: {
          fieldId: "n_109",
          semanticPath: "airLeakage.ach50ComplianceStatus",
          type: "calculated",
          value: "✓",
          section: "volumeSurfaceMetrics",
          dependencies: ["m_109"],
          label: "ACH₅₀ Compliance Status",
        },
      },
    },
    110: {
      id: "B.18.4",
      rowId: "B.18.4",
      label: "Ae₁₀ or ELA₁₀ (m²)",
      cells: {
        c: { label: "Ae₁₀ or ELA₁₀ (m²)" },
        d: {
          fieldId: "d_110",
          semanticPath: "airLeakage.ela10",
          type: "calculated",
          value: "2.898",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_109", "d_105"],
          label: "Ae₁₀ or ELA₁₀: m²",
        },
        e: { content: "m²", classes: ["unit-label"] },
        f: { content: "B.18.5.1 n-Factor", classes: ["label-main"] },
        g: {
          fieldId: "g_110",
          semanticPath: "airLeakage.nFactor",
          type: "calculated",
          value: "16.7",
          section: "volumeSurfaceMetrics",
          tooltip: true, // n-Factor Description
          dependencies: ["j_19", "d_103", "g_103"],
          label: "n-Factor for Air Leakage Calculation",
        },
        h: { content: "B.18.3 Ae₁₀ Zone", classes: ["text-center"] },
        i: {
          fieldId: "i_110",
          semanticPath: "airLeakage.climateZone",
          type: "calculated",
          value: "2",
          section: "volumeSurfaceMetrics",
          dependencies: ["j_19"],
          label: "Air Leakage Climate Zone Number",
        },
        j: {},
        k: {},
        l: {},
        m: {
          fieldId: "m_110",
          semanticPath: "airLeakage.elaComplianceRatio",
          type: "calculated",
          value: "173%",
          section: "volumeSurfaceMetrics",
          classes: ["percentage-value"],
          dependencies: ["d_110"],
          label: "ELA₁₀ Ratio to Reference Standard",
        },
        n: {
          fieldId: "n_110",
          semanticPath: "airLeakage.elaComplianceStatus",
          type: "calculated",
          value: "✓",
          section: "volumeSurfaceMetrics",
          dependencies: ["m_110"],
          label: "ELA₁₀ Compliance Status",
        },
      },
    },
  };

  //==========================================================================
  // ACCESSOR METHODS
  //==========================================================================

  function getFields() {
    const fields = {};
    Object.entries(sectionRows).forEach(([rowKey, row]) => {
      if (rowKey === "header" || rowKey === "subheader") return;
      if (!row.cells) return;
      Object.entries(row.cells).forEach(([colKey, cell]) => {
        if (cell.fieldId && cell.type) {
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.label || row.label,
            defaultValue: cell.value || "",
            section: cell.section || "volumeSurfaceMetrics",
            dependencies: cell.dependencies || [],
          };
          if (cell.semanticPath)
            fields[cell.fieldId].semanticPath = cell.semanticPath;
          if (cell.dropdownId)
            fields[cell.fieldId].dropdownId = cell.dropdownId;
          if (cell.options) fields[cell.fieldId].options = cell.options;
          if (cell.getOptions)
            fields[cell.fieldId].getOptions = cell.getOptions;
          if (cell.min !== undefined) fields[cell.fieldId].min = cell.min;
          if (cell.max !== undefined) fields[cell.fieldId].max = cell.max;
          if (cell.step !== undefined) fields[cell.fieldId].step = cell.step;
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
    if (sectionRows["subheader"]) {
      layoutRows.push(createLayoutRow(sectionRows["subheader"]));
    }
    Object.entries(sectionRows).forEach(([key, row]) => {
      if (key !== "header" && key !== "subheader") {
        layoutRows.push(createLayoutRow(row));
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
      "o", // MRT Surface Temperature (condensation risk feature)
    ];
    columns.forEach(col => {
      if (row.cells && row.cells[col]) {
        const cell = { ...row.cells[col] };
        if (col === "c") {
          if (cell.type === "label" && cell.content && !cell.label) {
            cell.label = cell.content;
            delete cell.type;
            delete cell.content;
          } else if (!cell.label && !cell.content && row.label) {
            cell.label = row.label;
          }
        }
        delete cell.getOptions;
        delete cell.section;
        delete cell.dependencies;
        rowDef.cells.push(cell);
      } else {
        if (col === "c" && !row.cells?.c && row.label) {
          rowDef.cells.push({ label: row.label });
        } else {
          rowDef.cells.push({});
        }
      }
    });
    return rowDef;
  }

  //==========================================================================
  // HELPER FUNCTIONS
  //==========================================================================

  function getNumericValue(fieldId) {
    // Use global parseNumeric, retrieving value via getFieldValue
    return window.TEUI.parseNumeric(getFieldValue(fieldId)) || 0;
  }

  function getGlobalNumericValue(fieldId) {
    // ✅ PATTERN A: For values EXTERNAL to this section (from global StateManager)
    const rawValue = window.TEUI?.StateManager?.getValue(fieldId);
    return window.TEUI.parseNumeric(rawValue) || 0;
  }

  /**
   * Get external string dependency from StateManager (Pattern A)
   */
  function getGlobalStringValue(fieldId) {
    const rawValue = window.TEUI?.StateManager?.getValue(fieldId);
    return rawValue ? rawValue.toString() : "";
  }

  function getSectionValue(fieldId, isReferenceCalculation = false) {
    // ✅ DUAL-ENGINE PATTERN: Get section-local values based on calculation context
    if (isReferenceCalculation) {
      return ReferenceState.getValue(fieldId);
    } else {
      return TargetState.getValue(fieldId);
    }
  }

  function getFieldValue(fieldId) {
    if (window.TEUI?.StateManager?.getValue) {
      const stateValue = window.TEUI.StateManager.getValue(fieldId);
      if (stateValue !== null && stateValue !== undefined) {
        return stateValue;
      }
    }
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (element) {
      if (element.tagName === "SELECT") {
        return element.value;
      }
      return element.textContent.trim();
    }
    return null;
  }

  /**
   * Formats a number according to the project's display rules.
   * Handles specific formats like percentages, W/m2, etc.
   * @param {number} value - The number to format.
   * @param {string} [format='number'] - The type of format ('number', 'percent', 'W/m2').
   * @returns {string} The formatted number as a string.
   */
  function formatNumber(value, format = "number") {
    // Handle null or undefined values
    if (value === null || value === undefined || isNaN(value)) {
      // Return appropriate default based on format
      return format === "percent" ? "0%" : format === "W/m2" ? "0.000" : "0.00";
    }

    const num = Number(value);

    // Handle percentage format
    if (format === "percent") {
      // Convert decimal to percentage with 2 decimal places
      return (
        (num * 100).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + "%"
      );
    }
    // Handle U-Value format - 3 decimal places
    else if (format === "W/m2") {
      return num.toLocaleString("en-US", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });
    }
    // Default format - 2 decimal places
    else {
      return num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  }

  /**
   * Helper function to set a calculated field value in StateManager and update the DOM.
   * Uses the global window.TEUI.formatNumber for formatting.
   * @param {string} fieldId - The ID of the field to update.
   * @param {*} rawValue - The raw, unformatted value to store in StateManager.
   * @param {string} formatType - The format type for display (e.g., 'number', 'percent-auto', 'integer', 'raw', 'number-3dp').
   */
  function setCalculatedValue(
    fieldId,
    rawValue,
    formatType = "number",
    isReferenceCalculation = false
  ) {
    // Ensure rawValue is numeric for calculations where appropriate
    const numericValue =
      typeof rawValue === "string"
        ? window.TEUI.parseNumeric(rawValue)
        : rawValue;

    // Determine the correct format type based on field ID conventions
    let determinedFormatType;

    // Determine format based on fieldId for precision matching Excel
    if (fieldId === "g_101" || fieldId === "g_102" || fieldId === "g_104") {
      determinedFormatType = "W/m2"; // Use W/m2 format for U-values (3dp) - matches Section 11
    } else if (fieldId === "d_110") {
      determinedFormatType = "number-3dp"; // ELA
    } else if (fieldId === "g_110") {
      determinedFormatType = "number-1dp"; // N-Factor
    } else if (fieldId === "i_110") {
      determinedFormatType = "integer"; // Zone number
    } else if (fieldId === "d_107") {
      determinedFormatType = "percent-2dp"; // WWR % with 2dp
    } else if (fieldId === "g_105" || fieldId === "i_105") {
      determinedFormatType = "percent-2dp"; // Volume/Area and Area/Volume ratios as percentages
    } else if (
      fieldId === "l_101" ||
      fieldId === "l_102" ||
      fieldId === "l_103"
    ) {
      determinedFormatType = "percent-2dp"; // Heatloss component %
    } else if (
      fieldId === "m_104" ||
      fieldId === "m_107" ||
      fieldId === "m_109" ||
      fieldId === "m_110" ||
      fieldId.startsWith("n_")
    ) {
      determinedFormatType = "raw"; // M-N compliance columns: already formatted, use as-is
    } else if (fieldId === "l_104") {
      determinedFormatType = "percent-0dp"; // Total % (no decimals)
    } else if (
      [
        "d_101",
        "d_102",
        "d_106",
        "i_101",
        "i_102",
        "i_103",
        "i_104",
        "i_107",
        "k_101",
        "k_102",
        "k_103",
        "k_104",
      ].includes(fieldId)
    ) {
      determinedFormatType = "number-2dp-comma"; // Areas and kWh values with commas
    } else {
      // Default for other calculated numbers (rates, ratios, ACH50 etc.)
      determinedFormatType = "number-2dp";
    }

    // Override if a specific format was passed and it's not the default 'number'
    if (formatType !== "number") {
      determinedFormatType = formatType;
    }

    // ✅ MODE-AWARE: Set value in appropriate state based on calculation context
    const stateFieldId = isReferenceCalculation ? `ref_${fieldId}` : fieldId;

    if (window.TEUI?.StateManager?.setValue) {
      const currentStr = window.TEUI.StateManager.getValue(stateFieldId);
      const currentNum = window.TEUI.parseNumeric(currentStr);
      const newNum = Number.isFinite(numericValue) ? numericValue : 0;
      const epsilon = 1e-9;
      if (!(Math.abs((currentNum || 0) - newNum) < epsilon)) {
        window.TEUI.StateManager.setValue(
          stateFieldId,
          String(newNum),
          "calculated"
        );
      } else {
        // No material change; skip DOM update
        return;
      }
    } else {
      console.error(
        "StateManager not available to set value for",
        stateFieldId
      );
      return;
    }

    // For 'W/m2' format, use local formatNumber function
    let formattedValue;
    if (determinedFormatType === "W/m2") {
      formattedValue = formatNumber(numericValue, "W/m2");
    } else {
      // For other formats, use the global formatter
      formattedValue = window.TEUI.formatNumber(
        numericValue,
        determinedFormatType
      );
    }

    // ✅ MODE-AWARE DOM UPDATE: Reference calculations don't directly update DOM
    if (!isReferenceCalculation) {
      // Target calculations update DOM immediately
      const element = document.querySelector(`[data-field-id="${fieldId}"]`);
      if (element) {
        if (element.tagName === "SELECT" || element.tagName === "INPUT") {
          element.value = formattedValue; // Update input/select value
        } else {
          element.textContent = formattedValue; // Update other element text content
        }
        element.classList.add("calculated-value");
        element.classList.remove("user-input", "editable", "PendingValue");
        element.removeAttribute("contenteditable");
      } else {
        // console.warn("DOM element not found for calculated field:", fieldId);
      }
    }
    // Reference calculations store values only; DOM updates handled by ModeManager.updateCalculatedDisplayValues()
  }

  function setElementClass(fieldId, className, removeClasses = []) {
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (element) {
      removeClasses.forEach(cls => element.classList.remove(cls));
      if (className) element.classList.add(className);
    }
  }

  //==========================================================================
  // REFERENCE INDICATOR CONFIGURATION
  //==========================================================================

  // T-cell comparison configuration for Section 12
  const referenceComparisons = {
    d_107: {
      type: "lower-is-better",
      tCell: "t_107",
      description: "Window:Wall Ratio",
    },
    g_109: {
      type: "lower-is-better",
      tCell: "t_109",
      description: "ACH50 Measured",
    },
  };

  /**
   * Update reference indicators for all configured fields
   */
  function updateAllReferenceIndicators() {
    try {
      Object.keys(referenceComparisons).forEach(fieldId => {
        updateReferenceIndicator(fieldId);
      });
    } catch (error) {
      console.error("[Section12] Error updating reference indicators:", error);
    }
  }

  /**
   * Update reference indicator (M and N columns) for a specific field
   * @param {string} fieldId - The application field ID to update
   */
  function updateReferenceIndicator(fieldId) {
    const config = referenceComparisons[fieldId];
    if (!config) return;

    // Get current value
    const currentValue =
      window.TEUI?.parseNumeric?.(getFieldValue(fieldId)) || 0;

    // Get reference value
    const referenceValue =
      window.TEUI?.StateManager?.getTCellValue?.(fieldId) ||
      window.TEUI?.StateManager?.getReferenceValue?.(config.tCell);

    const rowId = fieldId.match(/\d+$/)?.[0]; // Extract row number from field ID
    if (!rowId) return;

    const mFieldId = `m_${rowId}`;
    const nFieldId = `n_${rowId}`;

    // Check if M and N column elements exist before trying to update them
    const mElement = document.querySelector(`[data-field-id="${mFieldId}"]`);
    const nElement = document.querySelector(`[data-field-id="${nFieldId}"]`);

    if (!mElement || !nElement) {
      // Skip reference indicators for rows that don't have M/N columns
      return;
    }

    // If no reference value found, show N/A
    if (!referenceValue || referenceValue === 0) {
      setCalculatedValue(mFieldId, "N/A", "raw");
      if (nElement) {
        nElement.textContent = "";
        nElement.classList.remove("checkmark", "warning");
      }
      return;
    }

    // Calculate percentage based on comparison type
    let percentage = 100;
    let isGood = true;

    if (config.type === "lower-is-better") {
      // For lower-is-better, reference/current gives percentage
      percentage = (referenceValue / currentValue) * 100;
      isGood = currentValue <= referenceValue;
    } else if (config.type === "higher-is-better") {
      // For higher-is-better, current/reference gives percentage
      percentage = (currentValue / referenceValue) * 100;
      isGood = currentValue >= referenceValue;
    }

    // Cap percentage at reasonable bounds
    if (percentage > 999) percentage = 999;
    if (percentage < 0) percentage = 0;

    // Update M column with percentage
    setCalculatedValue(mFieldId, percentage / 100, "percent");

    // Update N column with checkmark/warning (nElement already declared above)
    if (nElement) {
      nElement.textContent = isGood ? "✓" : "✗";
      setElementClass(nFieldId, isGood ? "checkmark" : "warning", [
        "checkmark",
        "warning",
      ]);
    }
  }

  //==========================================================================
  // CALCULATION FUNCTIONS
  //==========================================================================

  function calculateVolumeMetrics(isReferenceCalculation = false) {
    // ✅ MODE-AWARE: Read area values based on calculation type
    let d85, d86, d87, d88, d89, d90, d91, d92, d93, d94, d95, d96;

    if (isReferenceCalculation) {
      // ✅ STRICT READS: Reference areas ONLY, no fallback to Target (CHEATSHEET Anti-Pattern 1)
      d85 = parseFloat(getGlobalNumericValue("ref_d_85")) || 0;
      d86 = parseFloat(getGlobalNumericValue("ref_d_86")) || 0;
      d87 = parseFloat(getGlobalNumericValue("ref_d_87")) || 0;
      d88 = parseFloat(getGlobalNumericValue("ref_d_88")) || 0;
      d89 = parseFloat(getGlobalNumericValue("ref_d_89")) || 0;
      d90 = parseFloat(getGlobalNumericValue("ref_d_90")) || 0;
      d91 = parseFloat(getGlobalNumericValue("ref_d_91")) || 0;
      d92 = parseFloat(getGlobalNumericValue("ref_d_92")) || 0;
      d93 = parseFloat(getGlobalNumericValue("ref_d_93")) || 0;
      d94 = parseFloat(getGlobalNumericValue("ref_d_94")) || 0;
      d95 = parseFloat(getGlobalNumericValue("ref_d_95")) || 0;
      d96 = parseFloat(getGlobalNumericValue("ref_d_96")) || 0;
    } else {
      // ✅ STRICT READS: Target areas ONLY
      d85 = parseFloat(getGlobalNumericValue("d_85")) || 0;
      d86 = parseFloat(getGlobalNumericValue("d_86")) || 0;
      d87 = parseFloat(getGlobalNumericValue("d_87")) || 0;
      d88 = parseFloat(getGlobalNumericValue("d_88")) || 0;
      d89 = parseFloat(getGlobalNumericValue("d_89")) || 0;
      d90 = parseFloat(getGlobalNumericValue("d_90")) || 0;
      d91 = parseFloat(getGlobalNumericValue("d_91")) || 0;
      d92 = parseFloat(getGlobalNumericValue("d_92")) || 0;
      d93 = parseFloat(getGlobalNumericValue("d_93")) || 0;
      d94 = parseFloat(getGlobalNumericValue("d_94")) || 0;
      d95 = parseFloat(getGlobalNumericValue("d_95")) || 0;
      d96 = parseFloat(getGlobalNumericValue("d_96")) || 0;
    }
    // ✅ DUAL-ENGINE: Use correct state based on calculation context
    const d105_vol = parseFloat(
      window.TEUI.parseNumeric(
        getSectionValue("d_105", isReferenceCalculation)
      ) || 0
    );

    // Calculate with full precision
    const d101_areaAir = d85 + d86 + d87 + d88 + d89 + d90 + d91 + d92 + d93;
    const d102_areaGround = d94 + d95 === 0 ? 0.0000001 : d94 + d95;
    const d104_totalArea = d101_areaAir + d102_areaGround;
    const d106_floorArea = d87 + d95 + d96;

    // Calculate ratios with full precision
    const g105_volAreaRatio = d101_areaAir > 0 ? d105_vol / d101_areaAir : 0;
    const i105_areaVolRatio = d105_vol > 0 ? d101_areaAir / d105_vol : 0;

    // ✅ MODE-AWARE: setCalculatedValue() now handles Reference vs Target appropriately
    setCalculatedValue(
      "d_101",
      d101_areaAir,
      "number-2dp-comma",
      isReferenceCalculation
    );
    setCalculatedValue(
      "d_102",
      d102_areaGround,
      "number-2dp-comma",
      isReferenceCalculation
    );
    setCalculatedValue(
      "d_104",
      d104_totalArea,
      "number-2dp-comma",
      isReferenceCalculation
    );
    setCalculatedValue(
      "d_106",
      d106_floorArea,
      "number-2dp-comma",
      isReferenceCalculation
    );
    setCalculatedValue(
      "g_105",
      g105_volAreaRatio,
      "percent-2dp",
      isReferenceCalculation
    );
    setCalculatedValue(
      "i_105",
      i105_areaVolRatio,
      "percent-2dp",
      isReferenceCalculation
    );

    // ❌ REMOVED: d_105 is USER INPUT, not calculated
    // DO NOT call setCalculatedValue on d_105 - it overwrites user edits!
    // d_105 is already published to StateManager via ModeManager.setValue when user edits it
    // Calling setCalculatedValue here was causing Reference mode edits to be ignored

    // Return calculated values for Reference engine storage
    return {
      d_101: d101_areaAir,
      d_102: d102_areaGround,
      d_104: d104_totalArea,
      // d_105: Removed from return - it's user input, not calculated
      d_106: d106_floorArea,
      g_105: g105_volAreaRatio,
      i_105: i105_areaVolRatio,
    };
  }

  function calculateCombinedUValue(isReferenceCalculation = false) {
    // ✅ MODE-AWARE: Read area totals based on calculation context
    const d101_areaAir = isReferenceCalculation
      ? parseFloat(getGlobalNumericValue("ref_d_101")) || 0
      : parseFloat(getGlobalNumericValue("d_101")) || 0;
    const d102_areaGround = isReferenceCalculation
      ? parseFloat(getGlobalNumericValue("ref_d_102")) || 0
      : parseFloat(getGlobalNumericValue("d_102")) || 0;
    // ✅ STATEMANAGER: Read U-values from StateManager (single source of truth)
    // S11 publishes both Target (g_XX) and Reference (ref_g_XX) U-values
    function getUValueFromS11(componentId, useReference) {
      const fieldId = `g_${componentId}`;
      const prefixedId = useReference ? `ref_${fieldId}` : fieldId;

      // Try U-value first (g_XX or ref_g_XX)
      const gVal = window.TEUI.parseNumeric(
        window.TEUI.StateManager.getValue(prefixedId)
      );
      if (!isNaN(gVal) && isFinite(gVal) && gVal > 0) {
        return gVal;
      }

      // Try RSI conversion (f_XX → 1/RSI or ref_f_XX → 1/RSI)
      const rsiFieldId = `f_${componentId}`;
      const prefixedRsiId = useReference ? `ref_${rsiFieldId}` : rsiFieldId;
      const fVal = window.TEUI.parseNumeric(
        window.TEUI.StateManager.getValue(prefixedRsiId)
      );
      if (!isNaN(fVal) && isFinite(fVal) && fVal > 0) {
        return 1 / fVal;
      }

      // ✅ STRICT: No fallback, return 0 (listeners will trigger recalc when values available)
      return 0;
    }

    const useRef = !!isReferenceCalculation;
    if (useRef) {
      // console.log("[S12] U-agg PASS: Reference calculation running");
    }
    const g85 = getUValueFromS11("85", useRef);
    const g86 = getUValueFromS11("86", useRef);
    const g87 = getUValueFromS11("87", useRef);
    const g88 = getUValueFromS11("88", useRef);
    const g89 = getUValueFromS11("89", useRef);
    const g90 = getUValueFromS11("90", useRef);
    const g91 = getUValueFromS11("91", useRef);
    const g92 = getUValueFromS11("92", useRef);
    const g93 = getUValueFromS11("93", useRef);
    const g94 = getUValueFromS11("94", useRef);
    const g95 = getUValueFromS11("95", useRef);

    // ✅ MODE-AWARE: Read areas from StateManager based on calculation context
    const d85 = useRef
      ? parseFloat(getGlobalNumericValue("ref_d_85")) || 0
      : parseFloat(getGlobalNumericValue("d_85")) || 0;
    const d86 = useRef
      ? parseFloat(getGlobalNumericValue("ref_d_86")) || 0
      : parseFloat(getGlobalNumericValue("d_86")) || 0;
    const d87 = useRef
      ? parseFloat(getGlobalNumericValue("ref_d_87")) || 0
      : parseFloat(getGlobalNumericValue("d_87")) || 0;
    const d88 = useRef
      ? parseFloat(getGlobalNumericValue("ref_d_88")) || 0
      : parseFloat(getGlobalNumericValue("d_88")) || 0;
    const d89 = useRef
      ? parseFloat(getGlobalNumericValue("ref_d_89")) || 0
      : parseFloat(getGlobalNumericValue("d_89")) || 0;
    const d90 = useRef
      ? parseFloat(getGlobalNumericValue("ref_d_90")) || 0
      : parseFloat(getGlobalNumericValue("d_90")) || 0;
    const d91 = useRef
      ? parseFloat(getGlobalNumericValue("ref_d_91")) || 0
      : parseFloat(getGlobalNumericValue("d_91")) || 0;
    const d92 = useRef
      ? parseFloat(getGlobalNumericValue("ref_d_92")) || 0
      : parseFloat(getGlobalNumericValue("d_92")) || 0;
    const d93 = useRef
      ? parseFloat(getGlobalNumericValue("ref_d_93")) || 0
      : parseFloat(getGlobalNumericValue("d_93")) || 0;
    const d94 = useRef
      ? parseFloat(getGlobalNumericValue("ref_d_94")) || 0
      : parseFloat(getGlobalNumericValue("d_94")) || 0;
    const d95 = useRef
      ? parseFloat(getGlobalNumericValue("ref_d_95")) || 0
      : parseFloat(getGlobalNumericValue("d_95")) || 0;

    // ✅ STRICT: Read TB% from S11 sovereign state without fallbacks
    // Reference pass → S11.ReferenceState.d_97; Target pass → S11.TargetState.d_97
    let d97_tbPenaltyPercent = 50; // Default only if S11 not loaded yet

    const s11 = window.TEUI?.SectionModules?.sect11;
    if (s11?.ReferenceState?.getValue && s11?.TargetState?.getValue) {
      const stateValue = window.TEUI.parseNumeric(
        useRef
          ? s11.ReferenceState.getValue("d_97")
          : s11.TargetState.getValue("d_97")
      );

      if (!isNaN(stateValue) && isFinite(stateValue)) {
        d97_tbPenaltyPercent = stateValue;
      } else {
        console.warn(
          `[S12] TB% missing from S11 ${useRef ? "Reference" : "Target"}State, using default 50%`
        );
      }
    } else {
      console.warn(
        `[S12] S11 module not loaded for TB%, using default 50% - recalc will occur when S11 initializes`
      );
    }

    // IMPORTANT: d_97 comes from Section 11's slider which stores percentage as a whole number (e.g., 20 for 20%)
    // We must divide by 100 to get the decimal factor (0.2) before using in calculations
    const tbFactor = 1 + d97_tbPenaltyPercent / 100; // Convert percentage to decimal before adding 1

    // Calculate with maximum precision
    const sumProductAir =
      d85 * g85 +
      d86 * g86 +
      d87 * g87 +
      d88 * g88 +
      d89 * g89 +
      d90 * g90 +
      d91 * g91 +
      d92 * g92 +
      d93 * g93;

    // Maintain at least 6 decimal places throughout calculation
    const g101_uAir =
      d101_areaAir > 0 ? (sumProductAir / d101_areaAir) * tbFactor : 0;

    const sumProductGround = d94 * g94 + d95 * g95;
    const g102_uGround =
      d102_areaGround > 0 ? (sumProductGround / d102_areaGround) * tbFactor : 0;

    // 🔎 DEBUG: concise trace for U-aggregation behavior per pass
    // console.log(
    //   `[S12] U-agg ${useRef ? "REF" : "TGT"}: TB%=${d97_tbPenaltyPercent} → g_101=${g101_uAir.toFixed(
    //     6
    //   )}, g_102=${g102_uGround.toFixed(6)}`
    // );

    const totalArea = parseFloat(d101_areaAir) + parseFloat(d102_areaGround);
    const d104_uCombined =
      totalArea > 0
        ? (g101_uAir * d101_areaAir + g102_uGround * d102_areaGround) /
          totalArea
        : 0;

    // Update DOM for both passes via StateManager writes and display refresh
    setCalculatedValue("g_101", g101_uAir, "W/m2", isReferenceCalculation);
    setCalculatedValue("g_102", g102_uGround, "W/m2", isReferenceCalculation);
    setCalculatedValue("g_104", d104_uCombined, "W/m2", isReferenceCalculation); // ✅ EXCEL PARITY: g_104 not d_104

    // Return calculated values for Reference engine storage
    return {
      g_101: g101_uAir,
      g_102: g102_uGround,
      g_104: d104_uCombined, // ✅ EXCEL PARITY: g_104 not d_104
    };
  }

  function calculateWWR(isReferenceCalculation = false) {
    // ✅ MODE-AWARE: Read area values based on calculation type (from Section 11)
    // Note: d_93 (doors/skylights) excluded from WWR per Excel formula and line 3 comment
    let d86, d88, d89, d90, d91, d92;
    let i88, i89, i90, i91, i92;

    if (isReferenceCalculation) {
      // ✅ STRICT READS: Reference values ONLY, no fallback to Target (CHEATSHEET Anti-Pattern 1)
      d86 = parseFloat(getGlobalNumericValue("ref_d_86")) || 0;
      d88 = parseFloat(getGlobalNumericValue("ref_d_88")) || 0;
      d89 = parseFloat(getGlobalNumericValue("ref_d_89")) || 0;
      d90 = parseFloat(getGlobalNumericValue("ref_d_90")) || 0;
      d91 = parseFloat(getGlobalNumericValue("ref_d_91")) || 0;
      d92 = parseFloat(getGlobalNumericValue("ref_d_92")) || 0;
      i88 = parseFloat(getGlobalNumericValue("ref_i_88")) || 0;
      i89 = parseFloat(getGlobalNumericValue("ref_i_89")) || 0;
      i90 = parseFloat(getGlobalNumericValue("ref_i_90")) || 0;
      i91 = parseFloat(getGlobalNumericValue("ref_i_91")) || 0;
      i92 = parseFloat(getGlobalNumericValue("ref_i_92")) || 0;
    } else {
      // ✅ STRICT READS: Target values ONLY
      d86 = parseFloat(getGlobalNumericValue("d_86")) || 0;
      d88 = parseFloat(getGlobalNumericValue("d_88")) || 0;
      d89 = parseFloat(getGlobalNumericValue("d_89")) || 0;
      d90 = parseFloat(getGlobalNumericValue("d_90")) || 0;
      d91 = parseFloat(getGlobalNumericValue("d_91")) || 0;
      d92 = parseFloat(getGlobalNumericValue("d_92")) || 0;
      i88 = parseFloat(getGlobalNumericValue("i_88")) || 0;
      i89 = parseFloat(getGlobalNumericValue("i_89")) || 0;
      i90 = parseFloat(getGlobalNumericValue("i_90")) || 0;
      i91 = parseFloat(getGlobalNumericValue("i_91")) || 0;
      i92 = parseFloat(getGlobalNumericValue("i_92")) || 0;
    }

    // Calculate with full precision
    // ✅ EXCEL PARITY: WWR = SUM(D88:D92)/(D86+SUM(D88:D92))
    // Note: Excludes d_93 (doors/skylights) per line 3 comment and Excel formula
    const windowArea = d88 + d89 + d90 + d91 + d92; // D88:D92 only (windows)
    const totalWallArea = d86 + windowArea; // Opaque wall + windows
    const wwr = totalWallArea > 0 ? windowArea / totalWallArea : 0;

    // Update g_107: Total Wall Area (checksum field matching Excel G107=D86+SUM(D88:D92))
    // Note: Excludes doors (d_93) to match Excel formula
    const totalWallAreaChecksum = d86 + d88 + d89 + d90 + d91 + d92;
    setCalculatedValue(
      "g_107",
      totalWallAreaChecksum,
      "area-2dp",
      isReferenceCalculation
    );

    // Calculate i_107: Total Window & Door Heat Loss (sum of i_88 through i_92)
    const totalWindowDoorHeatloss = i88 + i89 + i90 + i91 + i92;
    setCalculatedValue(
      "i_107",
      totalWindowDoorHeatloss,
      "number-2dp-comma",
      isReferenceCalculation
    );

    // Update WWR value with standard formatter
    setCalculatedValue("d_107", wwr, "percent-2dp", isReferenceCalculation);

    // ✅ M-N-COMPLIANCE: m_107/n_107 now calculated by calculateOperationalCompliance()
    // Old placeholder calculation removed

    return {
      d_107: wwr,
      g_107: totalWallAreaChecksum,
      i_107: totalWindowDoorHeatloss,
    };
  }

  function calculateACH50Target(isReferenceCalculation = false, volumeResults) {
    // ✅ DUAL-ENGINE: Use correct state based on calculation context
    const d108_method = getSectionValue("d_108", isReferenceCalculation);

    // Get numeric values with full precision
    // ✅ NO FALLBACKS: Let NaN propagate if g_109 is invalid - error hard, don't mask failures
    const g109_measured = parseFloat(
      window.TEUI.parseNumeric(getSectionValue("g_109", isReferenceCalculation))
    );
    const d101_areaAir = volumeResults.d_101;
    // ✅ NO FALLBACKS: Let NaN propagate if d_105 is invalid
    const d105_vol = parseFloat(
      window.TEUI.parseNumeric(getSectionValue("d_105", isReferenceCalculation))
    );

    // Target values for different methods
    let g108_nrl50Target = 0;
    const nrlTargets = {
      "AL-1A": 0.89,
      "AL-2A": 0.71,
      "AL-3A": 0.53,
      "AL-4A": 0.35,
      "AL-5A": 0.21,
      "AL-1B": 1.17,
      "AL-2B": 0.98,
      "AL-3B": 0.78,
      "AL-4B": 0.59,
      "AL-5B": 0.39,
      "AL-6B": 0.23,
    };

    // Convert ACH to NRL with full precision
    const achToNrl = ach =>
      d101_areaAir > 0 && d105_vol > 0
        ? (ach * d105_vol) / (d101_areaAir * 3.6)
        : 0;

    if (d108_method === "MEASURED") {
      g108_nrl50Target = achToNrl(g109_measured);
    } else if (d108_method === "PH_CLASSIC") {
      g108_nrl50Target = achToNrl(0.6);
    } else if (d108_method === "PH_LOW") {
      g108_nrl50Target = achToNrl(1.0);
    } else if (d108_method === "PH_PLUS") {
      g108_nrl50Target = 0.1;
    } else {
      g108_nrl50Target = nrlTargets[d108_method] || 0;
    }

    // Update NRL50 target with standard formatter
    setCalculatedValue(
      "g_108",
      g108_nrl50Target,
      "number-2dp",
      isReferenceCalculation
    );

    // Calculate ACH50 target with full precision
    const ach50Target =
      d105_vol > 0 && d101_areaAir > 0
        ? g108_nrl50Target * (d101_areaAir / d105_vol) * 3.6
        : 0;

    // Update ACH50 target with standard formatter
    setCalculatedValue(
      "d_109",
      ach50Target,
      "number-2dp",
      isReferenceCalculation
    );

    // ✅ M-N-COMPLIANCE: m_109 now calculated by calculateOperationalCompliance()
    // Old ratio calculation removed to prevent format fighting

    return {
      g_108: g108_nrl50Target,
      d_109: ach50Target,
    };
  }

  function calculateAe10(
    isReferenceCalculation = false,
    volumeResults,
    ach50Results
  ) {
    // Get values with full precision
    const ach50Target = ach50Results.d_109;
    // ✅ DUAL-ENGINE: Use correct state based on calculation context
    const volume = parseFloat(
      window.TEUI.parseNumeric(
        getSectionValue("d_105", isReferenceCalculation)
      ) || 0
    );

    // Calculate with full precision
    const ae10 = volume > 0 ? (ach50Target * volume) / 3600 : 0;

    // Update with standard formatter
    setCalculatedValue("d_110", ae10, "number-3dp", isReferenceCalculation);

    // ✅ M-N-COMPLIANCE: m_110 now calculated by calculateOperationalCompliance()
    // Old ratio calculation removed to prevent format fighting

    return {
      d_110: ae10,
    };
  }

  function calculateNFactor(isReferenceCalculation = false) {
    // Get values with full precision
    const climateZone = parseFloat(getGlobalNumericValue("j_19")) || 6;
    // ✅ DUAL-ENGINE: Use correct state based on calculation context
    const stories =
      parseFloat(
        window.TEUI.parseNumeric(
          getSectionValue("d_103", isReferenceCalculation)
        ) || 0
      ) || 1.0;
    const shielding =
      getSectionValue("g_103", isReferenceCalculation) || "Normal";

    // Determine zone number
    let zoneNum = 2;
    if (climateZone <= 4) zoneNum = 1;
    else if (climateZone >= 7) zoneNum = 3;

    // Update zone number with integer formatter
    setCalculatedValue(
      "i_110",
      zoneNum.toString(),
      "integer",
      isReferenceCalculation
    );

    // Determine shielding key
    const shieldingKey =
      shielding === "Shielded"
        ? "Shielded"
        : shielding === "Exposed"
          ? "Exposed"
          : "Normal";

    // N-factor lookup table with precise values (extended to 6 stories)
    const nFactorTable = {
      1: {
        Shielded: {
          1: 18.6,
          1.5: 16.7,
          2: 14.8,
          3: 13.0,
          4: 11.2,
          5: 9.4,
          6: 7.6,
        },
        Normal: {
          1: 15.5,
          1.5: 14.0,
          2: 12.4,
          3: 10.9,
          4: 9.4,
          5: 7.9,
          6: 6.4,
        },
        Exposed: {
          1: 14.0,
          1.5: 12.6,
          2: 11.2,
          3: 9.8,
          4: 13.0,
          5: 13.0,
          6: 13.0,
        },
      },
      2: {
        Shielded: {
          1: 22.2,
          1.5: 20.0,
          2: 17.8,
          3: 15.5,
          4: 13.2,
          5: 10.9,
          6: 8.6,
        },
        Normal: {
          1: 18.5,
          1.5: 16.7,
          2: 14.8,
          3: 13.0,
          4: 11.2,
          5: 9.4,
          6: 7.6,
        },
        Exposed: {
          1: 16.7,
          1.5: 15.0,
          2: 13.3,
          3: 11.7,
          4: 10.1,
          5: 8.5,
          6: 6.9,
        },
      },
      3: {
        Shielded: {
          1: 25.8,
          1.5: 23.1,
          2: 20.6,
          3: 18.1,
          4: 15.6,
          5: 13.1,
          6: 10.6,
        },
        Normal: {
          1: 21.5,
          1.5: 19.4,
          2: 17.2,
          3: 15.1,
          4: 13.0,
          5: 10.9,
          6: 8.8,
        },
        Exposed: {
          1: 19.4,
          1.5: 17.4,
          2: 15.5,
          3: 13.5,
          4: 11.5,
          5: 9.5,
          6: 7.5,
        },
      },
    };

    // Determine story key with full precision (extended to 6 stories)
    // Table has keys: 1, 1.5, 2, 3, 4, 5, 6 (no 2.5, 3.5, etc.)
    let storyKey = 1; // !!!should this default be set as 1.0? Or is this not a default?
    if (stories <= 1) storyKey = 1;
    else if (stories > 1 && stories <= 1.75) storyKey = 1.5;
    else if (stories > 1.75 && stories < 2.5) storyKey = 2;
    else if (stories >= 2.5 && stories < 3.5) storyKey = 3;
    else if (stories >= 3.5 && stories < 4.5) storyKey = 4;
    else if (stories >= 4.5 && stories < 5.5) storyKey = 5;
    else storyKey = 6; // 5.5+ stories

    // Get n-factor with full precision
    let nFactor = nFactorTable[2]["Normal"][1.5];
    if (nFactorTable[zoneNum]?.[shieldingKey]?.[storyKey]) {
      nFactor = nFactorTable[zoneNum][shieldingKey][storyKey];
    }

    // Update n-factor with standard formatter
    setCalculatedValue("g_110", nFactor, "number-1dp", isReferenceCalculation);

    return {
      i_110: zoneNum,
      g_110: nFactor,
    };
  }

  /**
   * ✅ M-N-COMPLIANCE: Calculate Passive House compliance based on g_104 U-value
   * Thresholds: <0.15 = "PH level", <0.20 = "Very Good", <0.30 = "Good", >=0.30 = "Meh"
   */
  function calculatePassiveHouseCompliance(isReferenceCalculation = false) {
    // Get g_104 (combined U-value) from StateManager (mode-aware)
    const fieldId = isReferenceCalculation ? "ref_g_104" : "g_104";
    const g104Str = window.TEUI.StateManager.getValue(fieldId);
    const g104 = window.TEUI.parseNumeric(g104Str) || 0;

    let complianceText = "Meh";
    let isGood = false;

    if (g104 < 0.15) {
      complianceText = "PH level";
      isGood = true;
    } else if (g104 < 0.2) {
      complianceText = "Very Good";
      isGood = true;
    } else if (g104 < 0.3) {
      complianceText = "Good";
      isGood = true;
    }

    // ✅ M-N-COMPLIANCE: Store to StateManager for mode-aware display
    const checkmark = isGood ? "✓" : "✗";

    if (isReferenceCalculation) {
      window.TEUI.StateManager.setValue(
        "ref_m_104",
        complianceText,
        "calculated"
      );
      window.TEUI.StateManager.setValue("ref_n_104", checkmark, "calculated");
    } else {
      window.TEUI.StateManager.setValue("m_104", complianceText, "calculated");
      window.TEUI.StateManager.setValue("n_104", checkmark, "calculated");
    }

    // Apply CSS class for n_104 (both modes need styling)
    const nElement = document.querySelector('[data-field-id="n_104"]');
    if (nElement) {
      nElement.classList.remove("checkmark", "warning");
      nElement.classList.add(isGood ? "checkmark" : "warning");
    }

    return {
      m_104: complianceText,
      n_104: isGood ? "✓" : "✗",
    };
  }

  /**
   * ✅ M-N-COMPLIANCE: Calculate compliance for WWR, ACH50, and ELA ratios
   * m_107: Shows d_107 value with occupancy-based thresholds
   * m_109: ref_d_109 / d_109 (lower is better)
   * m_110: ref_d_110 / d_110 (lower is better)
   */
  function calculateOperationalCompliance(isReferenceCalculation = false) {
    // Get occupancy type from StateManager (mode-aware)
    const occupancyFieldId = isReferenceCalculation ? "ref_d_12" : "d_12";
    const occupancyType =
      window.TEUI.StateManager.getValue(occupancyFieldId) || "";

    // m_107: WWR Compliance - show d_107 value directly
    // Read raw numeric value from StateManager (stored as decimal, e.g., 0.3306 for 33.06%)
    const d107FieldId = isReferenceCalculation ? "ref_d_107" : "d_107";
    const d107Str = window.TEUI.StateManager.getValue(d107FieldId);
    // ✅ NO FALLBACKS: Let NaN propagate if d_107 is invalid
    const d107 = window.TEUI.parseNumeric(d107Str);

    // ✅ FORMAT ONCE: Format to percentage string immediately with 0dp
    let m107Text;
    if (window.TEUI?.formatNumber) {
      m107Text = window.TEUI.formatNumber(d107, "percent-0dp");
    } else {
      // Fallback if formatNumber not available
      m107Text = Math.round(d107 * 100) + "%";
    }

    // Store formatted string to StateManager
    if (isReferenceCalculation) {
      window.TEUI.StateManager.setValue("ref_m_107", m107Text, "calculated");
    } else {
      window.TEUI.StateManager.setValue("m_107", m107Text, "calculated");
    }

    // n_107: Check thresholds based on occupancy type
    let wwrThreshold;
    if (occupancyType === "C-Residential") {
      wwrThreshold = 0.22; // 22%
    } else {
      wwrThreshold = 0.4; // 40%
    }

    const wwrPass = d107 <= wwrThreshold;
    const n107Symbol = wwrPass ? "✓" : "✗";

    if (isReferenceCalculation) {
      window.TEUI.StateManager.setValue("ref_n_107", n107Symbol, "calculated");
    } else {
      window.TEUI.StateManager.setValue("n_107", n107Symbol, "calculated");
      // ✅ Apply CSS class in Target mode only
      setElementClass("n_107", wwrPass ? "checkmark" : "warning", [
        "checkmark",
        "warning",
      ]);
    }

    // m_109: ACH50 Compliance Ratio - Excel: =REFERENCE!D109/D109
    // Formula: ref_d_109 / d_109
    // Passing grade is >= 100% (Reference must be >= Target to pass)
    // In Reference mode: ref_d_109 / ref_d_109 = 100%
    // In Target mode: ref_d_109 / d_109 (e.g., 1.5/1.0 = 150% PASS, 1.5/2.0 = 75% FAIL)
    const refD109Str = window.TEUI.StateManager.getValue("ref_d_109");
    const d109FieldId = isReferenceCalculation ? "ref_d_109" : "d_109";
    const d109Str = window.TEUI.StateManager.getValue(d109FieldId);

    // ✅ NO FALLBACKS: Let NaN propagate if d_109 values are invalid - error hard!
    const refD109 = window.TEUI.parseNumeric(refD109Str);
    const d109 = window.TEUI.parseNumeric(d109Str);

    // ✅ Excel formula: ref_d_109 / d_109
    const m109Ratio = d109 > 0 ? refD109 / d109 : 0;

    // ✅ FORMAT ONCE: Format to percentage string immediately with 0dp
    let m109Text;
    if (window.TEUI?.formatNumber) {
      m109Text = window.TEUI.formatNumber(m109Ratio, "percent-0dp");
    } else {
      // Fallback if formatNumber not available
      m109Text = Math.round(m109Ratio * 100) + "%";
    }

    if (isReferenceCalculation) {
      window.TEUI.StateManager.setValue("ref_m_109", m109Text, "calculated");
    } else {
      window.TEUI.StateManager.setValue("m_109", m109Text, "calculated");
    }

    // ✅ Pass if ratio >= 99.5% (0.5% tolerance for floating-point precision and calculation method differences)
    // This handles cases where AL-1B vs MEASURED methods produce slightly different values (e.g., 1.304 vs 1.300)
    const ach50Pass = m109Ratio >= 0.995;
    const n109Symbol = ach50Pass ? "✓" : "✗";

    if (isReferenceCalculation) {
      window.TEUI.StateManager.setValue("ref_n_109", n109Symbol, "calculated");
    } else {
      window.TEUI.StateManager.setValue("n_109", n109Symbol, "calculated");
      // ✅ Apply CSS class in Target mode only
      setElementClass("n_109", ach50Pass ? "checkmark" : "warning", [
        "checkmark",
        "warning",
      ]);
    }

    // m_110: ELA Ratio (d_110 / ref_d_110) - lower is better (Target vs Reference)
    // In Reference mode: ref_d_110 / ref_d_110 = 100%
    // In Target mode: d_110 / ref_d_110 = actual ratio
    const refD110Str = window.TEUI.StateManager.getValue("ref_d_110");
    const d110FieldId = isReferenceCalculation ? "ref_d_110" : "d_110";
    const d110Str = window.TEUI.StateManager.getValue(d110FieldId);

    // ✅ NO FALLBACKS: Let NaN propagate if d_110 values are invalid - error hard!
    const refD110 = window.TEUI.parseNumeric(refD110Str);
    const d110 = window.TEUI.parseNumeric(d110Str);

    const m110Ratio = refD110 > 0 ? d110 / refD110 : 1.0;
    // ✅ FORMAT ONCE: Format to percentage string immediately with 0dp
    let m110Text;
    if (window.TEUI?.formatNumber) {
      m110Text = window.TEUI.formatNumber(m110Ratio, "percent-0dp");
    } else {
      // Fallback if formatNumber not available
      m110Text = Math.round(m110Ratio * 100) + "%";
    }

    if (isReferenceCalculation) {
      window.TEUI.StateManager.setValue("ref_m_110", m110Text, "calculated");
    } else {
      window.TEUI.StateManager.setValue("m_110", m110Text, "calculated");
    }

    // ✅ Lower is better for ELA: passes if Target <= Reference + 0.5% tolerance
    // 0.5% tolerance handles floating-point precision and minor calculation method differences
    const elaPass = m110Ratio <= 1.005;
    const n110Symbol = elaPass ? "✓" : "✗";

    if (isReferenceCalculation) {
      window.TEUI.StateManager.setValue("ref_n_110", n110Symbol, "calculated");
    } else {
      window.TEUI.StateManager.setValue("n_110", n110Symbol, "calculated");
      // ✅ Apply CSS class in Target mode only
      setElementClass("n_110", elaPass ? "checkmark" : "warning", [
        "checkmark",
        "warning",
      ]);
    }

    return {
      m_107: m107Text,
      n_107: n107Symbol,
      m_109: m109Text,
      n_109: n109Symbol,
      m_110: m110Text,
      n_110: n110Symbol,
    };
  }

  function calculateAirLeakageHeatLoss(
    isReferenceCalculation = false,
    volumeResults,
    ach50Results,
    nFactorResults
  ) {
    // Get necessary values with full precision using parseFloat
    const g108_nrl50Target = ach50Results.g_108; // NRL50 Target (L/s*m2)
    const g110_nFactor = nFactorResults.g_110;

    // ✅ FIX: Read climate data based on calculation type (S03 canonical pattern)
    let d20_hdd, d21_cdd;
    if (isReferenceCalculation) {
      // ✅ FIXED: Reference calculations read ONLY ref_ prefixed values
      d20_hdd = getGlobalNumericValue("ref_d_20");
      d21_cdd = getGlobalNumericValue("ref_d_21");
      // console.log(
      //   `[S12] 🔵 REF CLIMATE READ: d_20=${d20_hdd}, d_21=${d21_cdd}`
      // );
    } else {
      // ✅ PATTERN A: Target calculations read unprefixed values
      d20_hdd = getGlobalNumericValue("d_20");
      d21_cdd = getGlobalNumericValue("d_21");
      // console.log(
      //   `[S12] 🎯 TGT CLIMATE READ: d_20=${d20_hdd}, d_21=${d21_cdd}`
      // );
    }

    const d101_areaAir = volumeResults.d_101;
    const h15_conditionedArea = parseFloat(getGlobalNumericValue("h_15")); // Get Conditioned Floor Area from S2

    // Constants from Excel formula structure
    const leakageFactor = 1.21; // Factor representing conversion and heat capacity (Ws/m³K?)
    const hoursPerDay = 24;
    const wattsToKw = 1000;

    // Base calculation factor with full precision
    const baseLeakageCoefficient =
      g110_nFactor > 0
        ? (leakageFactor * g108_nrl50Target * d101_areaAir) / g110_nFactor
        : 0;

    // Calculate with full precision
    const i103_heatloss =
      (baseLeakageCoefficient * d20_hdd * hoursPerDay) / wattsToKw;
    const k103_heatgain =
      (baseLeakageCoefficient * d21_cdd * hoursPerDay) / wattsToKw;

    // ✅ MODE-AWARE: setCalculatedValue() now handles Reference vs Target appropriately
    setCalculatedValue(
      "i_103",
      i103_heatloss,
      "number-2dp-comma",
      isReferenceCalculation
    );
    setCalculatedValue(
      "k_103",
      k103_heatgain,
      "number-2dp-comma",
      isReferenceCalculation
    );

    // Return calculated values for Reference engine storage
    return {
      i_103: i103_heatloss,
      k_103: k103_heatgain,
    };
  }

  function calculateEnvelopeHeatLossGain(
    isReferenceCalculation = false,
    volumeResults,
    uValueResults
  ) {
    // Get values with full precision using parseFloat
    const d101_areaAir = volumeResults.d_101;
    const d102_areaGround = volumeResults.d_102;
    const g101_uAir = uValueResults.g_101;
    const g102_uGround = uValueResults.g_102;

    // ✅ FIX: Read climate data based on calculation type (S03 canonical pattern)
    let d20_hdd, d21_cdd, d22_gfHDD, h22_gfCDD;
    if (isReferenceCalculation) {
      // ✅ FIXED: Reference calculations read ONLY ref_ prefixed values (no fallbacks)
      d20_hdd = getGlobalNumericValue("ref_d_20") || 0;
      d21_cdd = getGlobalNumericValue("ref_d_21") || 0;
      d22_gfHDD = getGlobalNumericValue("ref_d_22") || 0;
      h22_gfCDD = getGlobalNumericValue("ref_h_22") || 0;
    } else {
      // ✅ PATTERN A: Clean external dependencies via getGlobalNumericValue
      d20_hdd = getGlobalNumericValue("d_20");
      d21_cdd = getGlobalNumericValue("d_21");
      d22_gfHDD = getGlobalNumericValue("d_22");
      h22_gfCDD = getGlobalNumericValue("h_22");
    }

    // Constants
    const hoursPerDay = 24;
    const wattsToKw = 1000;

    // Air-facing envelope calculations (maintain full precision)
    const h101_lossRateAir = (g101_uAir * d20_hdd * hoursPerDay) / wattsToKw;
    const i101_heatlossAir = h101_lossRateAir * d101_areaAir;
    const j101_gainRateAir = (g101_uAir * d21_cdd * hoursPerDay) / wattsToKw;
    const k101_heatgainAir = j101_gainRateAir * d101_areaAir;

    // Ground-facing envelope calculations (maintain full precision)
    const h102_lossRateGround =
      (g102_uGround * d22_gfHDD * hoursPerDay) / wattsToKw;
    const i102_heatlossGround = h102_lossRateGround * d102_areaGround;
    const j102_gainRateGround =
      (g102_uGround * h22_gfCDD * hoursPerDay) / wattsToKw;
    const k102_heatgainGround = j102_gainRateGround * d102_areaGround;

    // ✅ MODE-AWARE: setCalculatedValue() now handles Reference vs Target appropriately
    setCalculatedValue(
      "h_101",
      h101_lossRateAir,
      "number-2dp",
      isReferenceCalculation
    );
    setCalculatedValue(
      "i_101",
      i101_heatlossAir,
      "number-2dp-comma",
      isReferenceCalculation
    );
    setCalculatedValue(
      "j_101",
      j101_gainRateAir,
      "number-2dp",
      isReferenceCalculation
    );
    setCalculatedValue(
      "k_101",
      k101_heatgainAir,
      "number-2dp-comma",
      isReferenceCalculation
    );
    setCalculatedValue(
      "h_102",
      h102_lossRateGround,
      "number-2dp",
      isReferenceCalculation
    );
    setCalculatedValue(
      "i_102",
      i102_heatlossGround,
      "number-2dp-comma",
      isReferenceCalculation
    );
    setCalculatedValue(
      "j_102",
      j102_gainRateGround,
      "number-2dp",
      isReferenceCalculation
    );
    setCalculatedValue(
      "k_102",
      k102_heatgainGround,
      "number-2dp-comma",
      isReferenceCalculation
    );

    // Return calculated values for Reference engine storage
    return {
      h_101: h101_lossRateAir,
      i_101: i101_heatlossAir,
      j_101: j101_gainRateAir,
      k_101: k101_heatgainAir,
      h_102: h102_lossRateGround,
      i_102: i102_heatlossGround,
      j_102: j102_gainRateGround,
      k_102: k102_heatgainGround,
    };
  }

  function calculateEnvelopeTotals(
    isReferenceCalculation = false,
    volumeResults = null,
    uValueResults = null,
    airLeakageResults = null,
    envelopeResults = null
  ) {
    // ✅ MODE-AWARE: Read values based on calculation type
    let i101,
      i102,
      i103,
      k101,
      k102,
      k103,
      h21_capacitanceSetting,
      k98_totalEnvelopeGainS11;

    if (isReferenceCalculation) {
      // Reference calculation: Read from passed-in results, not global state
      i101 = envelopeResults.i_101;
      i102 = envelopeResults.i_102;
      i103 = airLeakageResults.i_103;
      k101 = envelopeResults.k_101;
      k102 = envelopeResults.k_102;
      k103 = airLeakageResults.k_103;
      h21_capacitanceSetting =
        getGlobalStringValue("ref_h_21") ||
        getFieldValue("h_21") ||
        "Capacitance";
      k98_totalEnvelopeGainS11 =
        parseFloat(getGlobalNumericValue("ref_k_98")) ||
        parseFloat(getNumericValue("k_98")) ||
        0;
    } else {
      // Target calculation: Read from passed-in results
      i101 = envelopeResults.i_101;
      i102 = envelopeResults.i_102;
      i103 = airLeakageResults.i_103;
      k101 = envelopeResults.k_101;
      k102 = envelopeResults.k_102;
      k103 = airLeakageResults.k_103;
      h21_capacitanceSetting = getFieldValue("h_21");
      k98_totalEnvelopeGainS11 = parseFloat(getNumericValue("k_98"));
    }

    // ✅ MISSING CALCULATION: g_104 weighted average U-value (Excel: =(G101*D101/(SUM(D101:D102)+0.000001) + G102*D102/(SUM(D101:D102)+0.000001)))
    let d101_areaAir, d102_areaGround, g101_uAir, g102_uGround;

    if (isReferenceCalculation) {
      // Reference calculation: Use values from current calculation pass, not StateManager
      // (StateManager values haven't been stored yet during calculation)
      d101_areaAir = volumeResults?.d_101 || 0;
      d102_areaGround = volumeResults?.d_102 || 0;
      g101_uAir = uValueResults?.g_101 || 0;
      g102_uGround = uValueResults?.g_102 || 0;
    } else {
      // Target calculation: Read unprefixed values from passed results
      d101_areaAir = volumeResults?.d_101 || 0;
      d102_areaGround = volumeResults?.d_102 || 0;
      g101_uAir = uValueResults?.g_101 || 0;
      g102_uGround = uValueResults?.g_102 || 0;
    }

    const totalArea = d101_areaAir + d102_areaGround + 0.000001; // Avoid division by zero
    const g104_weightedUValue =
      (g101_uAir * d101_areaAir + g102_uGround * d102_areaGround) / totalArea;

    // Calculate total loss with full precision (Excel: =SUM(I101:I103))
    const i104_totalLoss = i101 + i102 + i103;

    // Conditional calculation for k_104 based on Capacitance setting (Excel: =IF(H21="Capacitance", K98, SUM(K101:K102)))
    let k104_totalGain;
    if (h21_capacitanceSetting === "Capacitance") {
      // Use Section 11's total envelope gain (includes solar etc.)
      k104_totalGain = k98_totalEnvelopeGainS11;
    } else {
      // Use SUM(K101:K102) - Air + Ground transmission gain only (exclude leakage k_103)
      k104_totalGain = k101 + k102;
    }

    // ✅ MODE-AWARE: setCalculatedValue() now handles Reference vs Target appropriately
    setCalculatedValue(
      "g_104",
      g104_weightedUValue,
      "W/m2",
      isReferenceCalculation
    ); // ✅ EXCEL PARITY: g_104 matches Excel G104
    setCalculatedValue(
      "i_104",
      i104_totalLoss,
      "number-2dp-comma",
      isReferenceCalculation
    );
    setCalculatedValue(
      "k_104",
      k104_totalGain,
      "number-2dp-comma",
      isReferenceCalculation
    );

    // Calculate percentages with full precision
    const l101 = i104_totalLoss > 0 ? i101 / i104_totalLoss : 0;
    const l102 = i104_totalLoss > 0 ? i102 / i104_totalLoss : 0;
    const l103 = i104_totalLoss > 0 ? i103 / i104_totalLoss : 0;
    const l104 = l101 + l102 + l103;

    // ✅ MODE-AWARE: setCalculatedValue() now handles Reference vs Target appropriately
    setCalculatedValue("l_101", l101, "percent-2dp", isReferenceCalculation);
    setCalculatedValue("l_102", l102, "percent-2dp", isReferenceCalculation);
    setCalculatedValue("l_103", l103, "percent-2dp", isReferenceCalculation);
    setCalculatedValue("l_104", l104, "percent-0dp", isReferenceCalculation);

    // ✅ FIX: Return calculated values for Reference engine storage
    return {
      g_104: g104_weightedUValue, // ✅ EXCEL PARITY: g_104 matches Excel G104
      i_104: i104_totalLoss,
      k_104: k104_totalGain,
      l_101: l101,
      l_102: l102,
      l_103: l103,
      l_104: l104,
    };
  }

  /**
   * Calculate Mean Radiant Temperature (MRT) surface temperatures for Section 12
   * Uses same formula as Section 11: T_si = T_interior - (U × ΔT × R_si)
   * @param {boolean} isReferenceCalculation - Whether this is a Reference calculation
   */
  function calculateMRTSurfaceTemperatures(isReferenceCalculation = false) {
    const interiorTemp = getGlobalNumericValue("h_23");
    const winterAvgTemp = getGlobalNumericValue("d_25");
    const groundTemp = 10;

    // Get values from current calculation context
    const d101_areaAir = isReferenceCalculation
      ? parseFloat(getGlobalNumericValue("ref_d_101")) || 0
      : parseFloat(getGlobalNumericValue("d_101")) || 0;

    const d102_areaGround = isReferenceCalculation
      ? parseFloat(getGlobalNumericValue("ref_d_102")) || 0
      : parseFloat(getGlobalNumericValue("d_102")) || 0;

    const g101_uAir = isReferenceCalculation
      ? parseFloat(getGlobalNumericValue("ref_g_101")) || 0
      : parseFloat(getGlobalNumericValue("g_101")) || 0;

    const g102_uGround = isReferenceCalculation
      ? parseFloat(getGlobalNumericValue("ref_g_102")) || 0
      : parseFloat(getGlobalNumericValue("g_102")) || 0;

    const g104_uCombined = isReferenceCalculation
      ? parseFloat(getGlobalNumericValue("ref_g_104")) || 0
      : parseFloat(getGlobalNumericValue("g_104")) || 0;

    // Calculate o_101: Air-facing aggregate
    // Formula: T_si = T_interior - (U × ΔT × R_si)
    // R_si = 0.13 (wall-dominated, conservative choice)
    let o101_surfaceTemp = null;
    if (d101_areaAir > 0) {
      const deltaT_air = interiorTemp - winterAvgTemp;
      o101_surfaceTemp = interiorTemp - g101_uAir * deltaT_air * 0.13;
      o101_surfaceTemp = Math.round(o101_surfaceTemp * 100) / 100;
    }

    // Calculate o_102: Ground-facing aggregate
    // Formula: T_si = T_interior - (U × ΔT × R_si)
    // R_si = 0.17 (downward heat flow)
    let o102_surfaceTemp = null;
    if (d102_areaGround > 0) {
      const deltaT_ground = interiorTemp - groundTemp;
      o102_surfaceTemp = interiorTemp - g102_uGround * deltaT_ground * 0.17;
      o102_surfaceTemp = Math.round(o102_surfaceTemp * 100) / 100;
    }

    // Calculate o_104: Total building aggregate
    // Uses area-weighted temperature difference
    // Formula: T_si = T_interior - (U × ΔT_weighted × R_si)
    // R_si = 0.13 (conservative choice for mixed aggregate)
    let o104_surfaceTemp = null;
    const totalArea = d101_areaAir + d102_areaGround;
    if (totalArea > 0) {
      const deltaT_air = interiorTemp - winterAvgTemp;
      const deltaT_ground = interiorTemp - groundTemp;
      const deltaT_weighted =
        (deltaT_air * d101_areaAir + deltaT_ground * d102_areaGround) /
        totalArea;
      o104_surfaceTemp = interiorTemp - g104_uCombined * deltaT_weighted * 0.13;
      o104_surfaceTemp = Math.round(o104_surfaceTemp * 100) / 100;
    }

    // Set calculated values
    if (o101_surfaceTemp !== null) {
      setCalculatedValue(
        "o_101",
        o101_surfaceTemp,
        "number",
        isReferenceCalculation
      );
    } else {
      setCalculatedValue("o_101", "", "number", isReferenceCalculation);
    }

    if (o102_surfaceTemp !== null) {
      setCalculatedValue(
        "o_102",
        o102_surfaceTemp,
        "number",
        isReferenceCalculation
      );
    } else {
      setCalculatedValue("o_102", "", "number", isReferenceCalculation);
    }

    if (o104_surfaceTemp !== null) {
      setCalculatedValue(
        "o_104",
        o104_surfaceTemp,
        "number",
        isReferenceCalculation
      );
    } else {
      setCalculatedValue("o_104", "", "number", isReferenceCalculation);
    }

    return {
      o_101: o101_surfaceTemp,
      o_102: o102_surfaceTemp,
      o_104: o104_surfaceTemp,
    };
  }

  /**
   * Determine if surface temperature indicates condensation risk
   * Per Passivhaus standard: Risk threshold = T_interior - 4.2°C
   * @param {number|null} surfaceTemp - Interior surface temperature (°C)
   * @param {number} interiorTemp - Indoor setpoint h_23 (°C)
   * @returns {boolean} - True if surface temp < (T_interior - 4.2°C) (condensation risk)
   */
  function hasCondensationRisk(surfaceTemp, interiorTemp) {
    if (surfaceTemp === null || surfaceTemp === undefined) {
      return false;
    }
    const riskThreshold = interiorTemp - 4.2;
    return surfaceTemp < riskThreshold;
  }

  function calculateAll() {
    // ✅ DUAL-ENGINE: Always run BOTH engines as per DUAL-STATE-CHEATSHEET mandate
    calculateReferenceModel(); // Reads ReferenceState → stores ref_ prefixed
    calculateTargetModel(); // Reads TargetState → stores unprefixed

    // ✅ PRIMARY PUBLISH: This is now the single, definitive point for publishing
    // all calculated Reference values from S12. This ensures the calculation
    // pass is complete before notifying downstream sections.
    if (window.TEUI?.StateManager && lastReferenceResults) {
      Object.entries(lastReferenceResults).forEach(([fieldId, value]) => {
        window.TEUI.StateManager.setValue(
          `ref_${fieldId}`,
          (value ?? "").toString(),
          "calculated"
        );
      });
    }

    // ✅ FIX: Also ensure user input Reference fields are published
    // These should be published during initialization, but as a safety net,
    // re-publish them here to ensure they're always available for CSV export
    if (window.TEUI?.StateManager) {
      const userInputFields = ["d_103", "g_103", "d_105", "d_108", "g_109"];
      userInputFields.forEach(fieldId => {
        const value = ReferenceState.getValue(fieldId);
        if (value !== null && value !== undefined) {
          window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, "default");
        }
      });
    }

    // ✅ M-N-COMPLIANCE: Calculate operational compliance AFTER Reference values are published
    // This ensures ref_d_109 and ref_d_110 are available when Target mode reads them
    calculateOperationalCompliance(true); // Reference mode: ref_m_109, ref_m_110
    calculateOperationalCompliance(false); // Target mode: m_109, m_110 (reads ref_d_109, ref_d_110)

    // console.log(`[S12DEBUG] Dual-engine calculations complete`);
    // Always refresh displayed calculated values after a calculation pass
    ModeManager.updateCalculatedDisplayValues?.();
  }

  /**
   * REFERENCE MODEL ENGINE: Calculate all values using Reference state
   * Uses Reference state values for section-local inputs
   */
  function calculateReferenceModel() {
    // console.log("[Section12] Running Reference Model calculations...");

    try {
      // ✅ DUAL-ENGINE: Calculate all metrics using Reference state values
      const volumeResults = calculateVolumeMetrics(true); // true = isReferenceCalculation
      const uValueResults = calculateCombinedUValue(true);
      const wwrResults = calculateWWR(true);
      const nFactorResults = calculateNFactor(true);
      const ach50Results = calculateACH50Target(true, volumeResults);
      const ae10Results = calculateAe10(true, volumeResults, ach50Results);
      const airLeakageResults = calculateAirLeakageHeatLoss(
        true,
        volumeResults,
        ach50Results,
        nFactorResults
      );
      const envelopeResults = calculateEnvelopeHeatLossGain(
        true,
        volumeResults,
        uValueResults
      );
      const envelopeTotalsResults = calculateEnvelopeTotals(
        true,
        volumeResults,
        uValueResults,
        airLeakageResults,
        envelopeResults
      );

      // ✅ M-N-COMPLIANCE: Calculate Passive House compliance (ref_m_104/n_104)
      calculatePassiveHouseCompliance(true);

      // ⚠️ M-N-COMPLIANCE: calculateOperationalCompliance() moved to calculateAll()
      // to ensure ref_d_109/ref_d_110 are published before Target reads them

      // ✅ MRT: Calculate Mean Radiant Temperature surface temperatures
      const mrtResults = calculateMRTSurfaceTemperatures(true);

      // Store Reference Model results with ref_ prefix for downstream sections
      storeReferenceResults(
        volumeResults,
        uValueResults,
        wwrResults,
        nFactorResults,
        ach50Results,
        ae10Results,
        airLeakageResults,
        envelopeResults,
        envelopeTotalsResults,
        mrtResults
      );

      // Update reference indicators after all calculations
      updateAllReferenceIndicators();
    } catch (error) {
      console.error("Error during Section 12 calculateReferenceModel:", error);
    }

    // console.log("[Section12] Reference Model calculations complete");
  }

  /**
   * Store Reference Model calculation results with ref_ prefix for downstream sections (S14, S15, S04, S01)
   */
  function storeReferenceResults(
    volumeResults,
    uValueResults,
    wwrResults,
    nFactorResults,
    ach50Results,
    ae10Results,
    airLeakageResults,
    envelopeResults,
    envelopeTotalsResults,
    mrtResults
  ) {
    if (!window.TEUI?.StateManager) return;

    // Store Reference calculation results with ref_ prefix
    const allResults = {
      ...volumeResults,
      ...uValueResults,
      ...wwrResults,
      ...nFactorResults,
      ...ach50Results,
      ...ae10Results,
      ...airLeakageResults,
      ...envelopeResults,
      ...envelopeTotalsResults, // ✅ FIX: Include envelope totals (i_104, k_104, etc.)
      ...mrtResults, // ✅ MRT: Include MRT surface temperatures
    };

    // ✅ S11 PATTERN: Store results for later re-writing
    lastReferenceResults = { ...allResults };
  }

  /**
   * TARGET MODEL ENGINE: Calculate all values using Target state
   * Uses Target state values for section-local inputs
   */
  function calculateTargetModel() {
    // console.log("[Section12] Running Target Model calculations...");

    try {
      // ✅ DUAL-ENGINE: Calculate all metrics using Target state values
      const volumeResults = calculateVolumeMetrics(false); // false = Target calculation
      const uValueResults = calculateCombinedUValue(false);
      calculateWWR(false);
      const nFactorResults = calculateNFactor(false);
      const ach50Results = calculateACH50Target(false, volumeResults);
      calculateAe10(false, volumeResults, ach50Results);
      const airLeakageResults = calculateAirLeakageHeatLoss(
        false,
        volumeResults,
        ach50Results,
        nFactorResults
      );
      const envelopeResults = calculateEnvelopeHeatLossGain(
        false,
        volumeResults,
        uValueResults
      );
      calculateEnvelopeTotals(
        false,
        volumeResults,
        uValueResults,
        airLeakageResults,
        envelopeResults
      );

      // ✅ M-N-COMPLIANCE: Calculate Passive House compliance (m_104/n_104)
      calculatePassiveHouseCompliance(false);

      // ⚠️ M-N-COMPLIANCE: calculateOperationalCompliance() moved to calculateAll()
      // to ensure ref_d_109/ref_d_110 are published before Target reads them

      // ✅ MRT: Calculate Mean Radiant Temperature surface temperatures
      calculateMRTSurfaceTemperatures(false);

      // Update reference indicators after all calculations
      updateAllReferenceIndicators();
    } catch (error) {
      console.error("Error during Section 12 calculateTargetModel:", error);
    }

    // console.log("[Section12] Target Model calculations complete");
  }

  //==========================================================================
  // EVENT HANDLING AND INITIALIZATION
  //==========================================================================

  function registerDependencies() {
    if (!window.TEUI?.StateManager) {
      return;
    }
    const fields = getFields();
    let count = 0;
    Object.entries(fields).forEach(([fieldId, fieldDef]) => {
      if (fieldDef.dependencies && Array.isArray(fieldDef.dependencies)) {
        fieldDef.dependencies.forEach(depId => {
          if (
            window.TEUI.StateManager.getValue(depId) !== null ||
            document.querySelector(`[data-field-id="${depId}"]`)
          ) {
            window.TEUI.StateManager.registerDependency(depId, fieldId);
            count++;
          }
        });
      }
    });
  }

  function initializeEventHandlers() {
    const sectionElement = document.getElementById("volumeSurfaceMetrics");
    if (!sectionElement) return;

    // ✅ S10 PROVEN PATTERN: Inline dropdown handlers (like working sections)
    const dropdowns = sectionElement.querySelectorAll("select");
    dropdowns.forEach(dropdown => {
      // Prevent attaching listeners multiple times
      if (dropdown.hasS12Listener) return;

      dropdown.addEventListener("change", function () {
        const fieldId = this.getAttribute("data-field-id");
        if (!fieldId) return;

        ModeManager.setValue(fieldId, this.value, "user-modified");

        // Handle conditional g_109 logic for d_108
        if (fieldId === "d_108") {
          handleConditionalEditability();
        }

        calculateAll();
      });
      dropdown.hasS12Listener = true;
    });

    const editableFields = sectionElement.querySelectorAll(
      '[contenteditable="true"].user-input'
    );
    editableFields.forEach(field => {
      // Prevent attaching listeners multiple times
      if (field.hasS12Listener) return;

      field.addEventListener("focus", handleFieldFocus);
      field.addEventListener("focusout", handleFieldFocusOut);
      // Blur and Keydown are attached globally now, but keeping local pattern for robustness
      field.addEventListener("blur", handleFieldBlur, true);
      field.addEventListener("keydown", handleFieldKeydown, true);
      field.hasS12Listener = true;
    });

    // Initialize conditional editability state
    handleConditionalEditability();

    // ✅ BIDIRECTIONAL SYNC: S12 listens to WOMBAT (S19) mirror field changes
    // Mirror relationships: d_105 (S12) ↔ d_151 (S19), d_103 (S12) ↔ d_150 (S19)
    if (window.TEUI?.StateManager) {
      // Target volume from WOMBAT
      window.TEUI.StateManager.addListener("d_151", newValue => {
        const currentValue = ModeManager.getValue("d_105");
        if (currentValue !== newValue) {
          console.log(
            `[S12→WOMBAT] Syncing d_105 = ${newValue} from WOMBAT d_151`
          );
          ModeManager.setValue("d_105", newValue, "external");

          // Update DOM for d_105
          if (window.TEUI?.FieldManager) {
            const fieldDef = window.TEUI.FieldManager.getField("d_105");
            if (fieldDef) {
              window.TEUI.FieldManager.updateFieldDisplay(
                "d_105",
                newValue,
                fieldDef
              );
            }
          }

          calculateAll();
          ModeManager.updateCalculatedDisplayValues();
        }
      });

      // Target stories from WOMBAT
      window.TEUI.StateManager.addListener("d_150", newValue => {
        const currentValue = ModeManager.getValue("d_103");
        if (currentValue !== newValue) {
          console.log(
            `[S12→WOMBAT] Syncing d_103 = ${newValue} from WOMBAT d_150`
          );
          ModeManager.setValue("d_103", newValue, "external");

          // Update DOM for d_103 dropdown
          const dropdown = document.querySelector(
            'select[data-field-id="d_103"]'
          );
          if (dropdown) {
            dropdown.value = newValue;
          }

          calculateAll();
          ModeManager.updateCalculatedDisplayValues();
        }
      });

      // Reference volume from WOMBAT
      window.TEUI.StateManager.addListener("ref_d_151", newValue => {
        const currentValue = ReferenceState.getValue("d_105");
        if (currentValue !== newValue) {
          console.log(
            `[S12→WOMBAT] Syncing ref_d_105 = ${newValue} from WOMBAT ref_d_151`
          );
          ReferenceState.setValue("d_105", newValue);
          window.TEUI.StateManager.setValue("ref_d_105", newValue, "external");

          // ✅ FIX: Explicit DOM update for d_105 when in Reference mode
          if (
            ModeManager.currentMode === "reference" &&
            window.TEUI?.FieldManager
          ) {
            const fieldDef = window.TEUI.FieldManager.getField("d_105");
            if (fieldDef) {
              window.TEUI.FieldManager.updateFieldDisplay(
                "d_105",
                newValue,
                fieldDef
              );
              console.log(
                `[S12→WOMBAT] ✅ Refreshed d_105 DOM = ${newValue} (Reference mode)`
              );
            }
          }

          calculateAll();
          ModeManager.updateCalculatedDisplayValues();
        }
      });

      // Reference stories from WOMBAT
      window.TEUI.StateManager.addListener("ref_d_150", newValue => {
        const currentValue = ReferenceState.getValue("d_103");
        if (currentValue !== newValue) {
          console.log(
            `[S12→WOMBAT] Syncing ref_d_103 = ${newValue} from WOMBAT ref_d_150`
          );
          ReferenceState.setValue("d_103", newValue);
          window.TEUI.StateManager.setValue("ref_d_103", newValue, "external");

          // ✅ FIX: Explicit DOM update for d_103 dropdown when in Reference mode
          if (ModeManager.currentMode === "reference") {
            const dropdown = document.querySelector(
              'select[data-field-id="d_103"]'
            );
            if (dropdown) {
              dropdown.value = newValue;
              console.log(
                `[S12→WOMBAT] ✅ Refreshed d_103 DOM = ${newValue} (Reference mode)`
              );
            }
          }

          calculateAll();
          ModeManager.updateCalculatedDisplayValues();
        }
      });

      console.log("[S12] ✅ Bidirectional WOMBAT sync listeners initialized");
    }
  }

  // ✅ REMOVED: Now using S10's inline dropdown handler pattern

  function handleFieldFocus(event) {
    event.target.classList.add("editing");
  }

  function handleFieldFocusOut(event) {
    event.target.classList.remove("editing");
  }

  function handleFieldBlur(event) {
    const field = event.target;
    const fieldId = field.getAttribute("data-field-id");
    if (!fieldId) return;

    const numValue = window.TEUI.parseNumeric(field.textContent);
    if (!isNaN(numValue) && isFinite(numValue)) {
      const formattedValue = window.TEUI.formatNumber(numValue, "number-2dp");
      field.textContent = formattedValue;

      // ✅ DUAL-STATE: Store value using ModeManager
      ModeManager.setValue(fieldId, String(numValue), "user-modified");
      calculateAll();
    }
  }

  function handleFieldKeydown(event) {
    const field = event.target;
    if (
      field.hasAttribute("contenteditable") &&
      field.getAttribute("contenteditable") === "true"
    ) {
      if (event.key === "Enter") {
        event.preventDefault();
        field.blur();
      }
    }
  }

  function handleConditionalEditability() {
    const d108Dropdown = document.querySelector(
      'select[data-field-id="d_108"]'
    );
    const g109Cell = document.querySelector('[data-field-id="g_109"]');

    if (!d108Dropdown || !g109Cell) return;

    // ✅ DUAL-STATE: Use ModeManager to get current value
    const currentD108Value =
      ModeManager.getValue("d_108") || d108Dropdown.value;
    const isMeasured = currentD108Value === "MEASURED";

    if (isMeasured) {
      g109Cell.setAttribute("contenteditable", "true");
      g109Cell.classList.add("user-input", "editable");
      g109Cell.classList.remove("disabled-input", "ghosted");
      g109Cell.style.backgroundColor = "#f0f8ff";
      g109Cell.style.color = "#000";

      // ✅ FIX: Read from current state instead of hardcoding Target default
      const currentValue = ModeManager.getValue("g_109");

      // If the cell is empty or N/A when switching to Measured, restore from state or use hardcoded default
      if (
        !g109Cell.textContent.trim() ||
        g109Cell.textContent.trim() === "N/A"
      ) {
        // ✅ HARDCODED DEFAULT: Use 1.30 for both Target and Reference to match typical AL-1B calculation
        // This prevents calculations from changing when switching to MEASURED mode
        // User can manually override this value if needed
        const defaultValue = "1.30";
        const rawValue = currentValue || defaultValue;
        console.log(
          `[g_109 Default] currentValue="${currentValue}", using rawValue="${rawValue}"`
        );

        // ✅ FIX: Format to 2dp for consistency
        const numericValue = window.TEUI.parseNumeric(rawValue);
        const displayValue = window.TEUI.formatNumber(
          numericValue,
          "number-2dp"
        );
        g109Cell.textContent = displayValue;

        // Only setValue if we're using the default (not already in state)
        if (!currentValue) {
          ModeManager.setValue("g_109", defaultValue, "calculated");
          console.log(`[g_109 Default] Set g_109 to default: ${defaultValue}`);
        }
      } else {
        // ✅ FIX: Even if cell has content, ensure it's formatted to 2dp
        const numericValue = window.TEUI.parseNumeric(g109Cell.textContent);
        if (!isNaN(numericValue)) {
          g109Cell.textContent = window.TEUI.formatNumber(
            numericValue,
            "number-2dp"
          );
        }
      }
    } else {
      g109Cell.setAttribute("contenteditable", "false");
      g109Cell.classList.remove("user-input", "editable");
      g109Cell.classList.add("disabled-input", "ghosted");
      g109Cell.style.backgroundColor = "#f8f9fa";
      g109Cell.style.color = "#6c757d";
      g109Cell.textContent = "N/A";
      // ✅ DON'T set g_109 to "0" - preserve the value in state
      // This way, if user switches back to MEASURED, the value is still there
      // The N/A display is enough to show the field is not used
      console.log(`[g_109] Locked (not MEASURED mode), preserving state value`);
    }
  }

  function onSectionRendered() {
    if (isInitialized) return;

    console.log(
      "S12: Section rendered - initializing Pattern A Dual-State Module."
    );

    // 1. Initialize the ModeManager and its internal states
    ModeManager.initialize();

    // 2. Setup the section-specific toggle switch in the header

    // 3. Initialize event handlers for this section
    initializeEventHandlers();

    // 4. Sync UI to the default (Target) state
    ModeManager.refreshUI();

    // 5. Add StateManager listeners (including robot fingers 🤖👆)
    addStateManagerListeners();

    // 6. Apply validation tooltips to fields
    if (window.TEUI.TooltipManager && window.TEUI.TooltipManager.initialized) {
      setTimeout(() => {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }

    // 7. Register with StateManager and dependencies
    registerWithStateManager();
    registerDependencies();

    // 8. Perform initial calculations
    calculateAll();

    // 9. Initialize conditional field state
    handleConditionalEditability();

    // 10. Add section-specific styles
    addCheckmarkStyles();

    isInitialized = true;
    console.log("S12: Pattern A initialization complete.");
  }

  function registerWithStateManager() {
    if (!window.TEUI?.StateManager) return;
    const fields = getFields();
    Object.entries(fields).forEach(([fieldId, fieldDef]) => {
      const currentValue = window.TEUI.StateManager.getValue(fieldId);
      if (
        currentValue === null ||
        currentValue === undefined ||
        window.TEUI.StateManager.getDebugInfo(fieldId)?.state === "default"
      ) {
        if (
          fieldDef.defaultValue !== undefined &&
          fieldDef.defaultValue !== null &&
          fieldDef.defaultValue !== ""
        ) {
          window.TEUI.StateManager.setValue(
            fieldId,
            fieldDef.defaultValue,
            "default"
          );
        }
      }
    });
  }

  function addStateManagerListeners() {
    if (!window.TEUI?.StateManager) return;
    if (s12ListenersAdded) {
      console.log(
        "[S12] ⚠️ Listeners already added, skipping duplicate registration"
      );
      return;
    }
    const externalDependencies = [
      // Section 11 Inputs influencing U-Values (g_101, g_102) and Areas (d_101, d_102)
      "d_85",
      "f_85",
      "g_85", // Roof
      "d_86",
      "f_86",
      "g_86", // Walls AG
      "d_87",
      "f_87",
      "g_87", // Floor Exp
      "d_88",
      "g_88", // Doors (Area d_88 comes from S10, listen to g_88 U-Value)
      "d_89",
      "g_89", // Win N (Area d_89 comes from S10, listen to g_89 U-Value)
      "d_90",
      "g_90", // Win E (Area d_90 comes from S10, listen to g_90 U-Value)
      "d_91",
      "g_91", // Win S (Area d_91 comes from S10, listen to g_91 U-Value)
      "d_92",
      "g_92", // Win W (Area d_92 comes from S10, listen to g_92 U-Value)
      "d_93",
      "g_93", // Skylights (Area d_93 comes from S10, listen to g_93 U-Value)
      "d_94",
      "f_94",
      "g_94", // Walls BG
      "d_95",
      "f_95",
      "g_95", // Floor Slab
      "d_96", // Interior Floor Area (Used for d_106)
      // Section 11 Thermal Bridge Penalty
      "d_97",
      // Section 3 Climate Data (removed d_20, d_21, d_22, h_22 - have explicit listeners)
      "j_19", // Climate Zone (for N-Factor)
      "h_21", // Capacitance Setting (for k_104)
    ];
    // ✅ OPTIMIZED: Listen to Reference U-values AND areas per g_101 formula needs
    // Formula: g_101 = (SUMPRODUCT(g_85:g_95, d_85:d_95) / SUM(d_85:d_95)) × (1 + d_97/100)
    // We read values from S11.ReferenceState (sovereign), so listen to published values for recalc trigger
    const referenceUValueDeps = [
      "ref_g_85",
      "ref_g_86",
      "ref_g_87",
      "ref_g_88",
      "ref_g_89",
      "ref_g_90",
      "ref_g_91",
      "ref_g_92",
      "ref_g_93",
      "ref_g_94",
      "ref_g_95",
      // Note: ref_f_XX (RSI) listeners removed - S12 reads U-values directly from S11.ReferenceState
      // S11 converts RSI→U internally, so we don't need to listen to both
      "ref_d_97", // Reference TB% when stored with prefix
    ];

    // ✅ FIX: Listen to Reference area changes (d_101, d_102, d_104 depend on these)
    const referenceAreaDeps = [
      "ref_d_85", // Roof area
      "ref_d_86", // Walls AG area
      "ref_d_87", // Floor Exp area
      "ref_d_88", // Doors area
      "ref_d_89", // Win N area
      "ref_d_90", // Win E area
      "ref_d_91", // Win S area
      "ref_d_92", // Win W area
      "ref_d_93", // Skylights area
      "ref_d_94", // Walls BG area
      "ref_d_95", // Floor Slab area
      "ref_d_96", // Interior Floor area
    ];
    // Ensure both Target and Reference TB% changes trigger S12
    window.TEUI.StateManager.addListener("d_97", newValue => {
      // console.log(`[S12] Listener: d_97 changed → recalc`);
      calculateAll();
    });
    window.TEUI.StateManager.addListener("ref_d_97", newValue => {
      // console.log(`[S12] Listener: ref_d_97 changed → recalc`);
      calculateAll();
    });

    // Add other external dependency listeners
    const otherDeps = externalDependencies.filter(dep => dep !== "d_97");
    otherDeps.forEach(depId => {
      window.TEUI.StateManager.addListener(
        depId,
        (newValue, oldValue, eventFieldId, state) => {
          if (eventFieldId === depId) {
            calculateAll();
          }
        }
      );
    });

    // Add reference-prefixed U-value listeners
    referenceUValueDeps.forEach(depId => {
      window.TEUI.StateManager.addListener(
        depId,
        (newValue, oldValue, eventFieldId, state) => {
          if (eventFieldId === depId) {
            calculateAll();
          }
        }
      );
    });

    // ✅ FIX: Add reference-prefixed area listeners (was missing - caused bug where ref_d_86 changes didn't update d_101)
    // ✅ PERFORMANCE FIX: Explicit DOM refresh after calculateAll() for immediate UI update (S13 pattern)
    referenceAreaDeps.forEach(depId => {
      window.TEUI.StateManager.addListener(
        depId,
        (newValue, oldValue, eventFieldId, state) => {
          if (eventFieldId === depId) {
            calculateAll();
            // ✅ CRITICAL: Explicit DOM refresh ensures immediate UI update in Reference mode
            // Without this, updates lag behind by one calculation cycle
            ModeManager.updateCalculatedDisplayValues?.();
          }
        }
      );
    });

    // ✅ FIX: Add reference-prefixed heatloss listeners for i_107 calculation
    // When Reference window/door heatloss values change in S11, recalculate WWR-related metrics
    const referenceHeatlossDepsi_107 = [
      "ref_i_88", // Doors heatloss
      "ref_i_89", // Win N heatloss
      "ref_i_90", // Win E heatloss
      "ref_i_91", // Win S heatloss
      "ref_i_92", // Win W heatloss
    ];
    referenceHeatlossDepsi_107.forEach(depId => {
      window.TEUI.StateManager.addListener(
        depId,
        (newValue, oldValue, eventFieldId) => {
          if (eventFieldId === depId) {
            calculateAll();
            // ✅ CRITICAL: Explicit DOM refresh ensures immediate UI update in Reference mode
            ModeManager.updateCalculatedDisplayValues?.();
          }
        }
      );
    });

    // ✅ PHASE 3 CLEANUP: d_13 listener removed
    // "Set Values" button now handles 100% of value application via FileHandler
    // FileHandler.applyReferenceValuesFromStandard() triggers calculateAll() after value sync

    // ✅ CRITICAL: Listen for Target climate data changes to trigger recalculation
    window.TEUI.StateManager.addListener("d_20", (newValue, oldValue) => {
      calculateAll();
    });
    window.TEUI.StateManager.addListener("d_21", newValue => {
      calculateAll();
    });
    window.TEUI.StateManager.addListener("d_22", newValue => {
      calculateAll();
    });
    window.TEUI.StateManager.addListener("h_22", newValue => {
      calculateAll();
    });

    // ✅ CRITICAL: Listen for Reference climate data changes to trigger recalculation
    window.TEUI.StateManager.addListener("ref_d_20", newValue => {
      calculateAll();
    });
    window.TEUI.StateManager.addListener("ref_d_21", newValue => {
      calculateAll();
    });
    window.TEUI.StateManager.addListener("ref_d_22", newValue => {
      calculateAll();
    });
    window.TEUI.StateManager.addListener("ref_h_22", newValue => {
      calculateAll();
    });

    // ✅ S07 PATTERN: NO listeners for S12's own input fields
    // User edits call handleFieldBlur → ModeManager.setValue → calculateAll
    // ModeManager.setValue publishes to StateManager (both ref_ and unprefixed)
    // No need for listeners to create double calculations

    // ⚠️ MIRROR FIELD SYNC: WOMBAT → Section 12 (d_151→d_105, d_150→d_103)
    // WOMBAT has mirror fields that display S12's volume/stories
    // When edited in WOMBAT, sync back to S12's internal state and recalculate
    window.TEUI.StateManager.addListener("d_151", newValue => {
      if (TargetState.getValue("d_105") !== newValue) {
        TargetState.setValue("d_105", newValue, "external");
        calculateAll(); // Trigger full recalculation and UI update
        console.log(`[S12] Synced d_105 = ${newValue} from WOMBAT (d_151)`);
      }
    });

    window.TEUI.StateManager.addListener("ref_d_151", newValue => {
      if (ReferenceState.getValue("d_105") !== newValue) {
        ReferenceState.setValue("d_105", newValue, "external");
        calculateAll(); // Trigger full recalculation and UI update
        console.log(
          `[S12] Synced ref_d_105 = ${newValue} from WOMBAT (ref_d_151)`
        );
      }
    });

    window.TEUI.StateManager.addListener("d_150", newValue => {
      if (TargetState.getValue("d_103") !== newValue) {
        TargetState.setValue("d_103", newValue, "external");
        calculateAll(); // Trigger full recalculation and UI update
        console.log(`[S12] Synced d_103 = ${newValue} from WOMBAT (d_150)`);
      }
    });

    window.TEUI.StateManager.addListener("ref_d_150", newValue => {
      if (ReferenceState.getValue("d_103") !== newValue) {
        ReferenceState.setValue("d_103", newValue, "external");
        calculateAll(); // Trigger full recalculation and UI update
        console.log(
          `[S12] Synced ref_d_103 = ${newValue} from WOMBAT (ref_d_150)`
        );
      }
    });

    s12ListenersAdded = true;
    console.log(
      "[S12] ✅ CLIMATE LISTENERS ADDED - Ready for d_20/d_21 changes"
    );
  }

  function addCheckmarkStyles() {
    let styleElement = document.getElementById("sect12-styles");
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "sect12-styles";
      styleElement.textContent = `
                .checkmark { color: green; font-weight: bold; }
                .warning { color: red; font-weight: bold; }
                .editable { background-color: #f0f8ff; cursor: text; }
                .editing { outline: 1px solid blue; background-color: #e6f2ff; }
                /* .calculated-value { background-color: #f8f9fa; } REMOVED - Style handled globally */
                .highlighted-result { font-weight: bold; background-color: #fff3cd; }
            `;
      document.head.appendChild(styleElement);
    }
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
    calculateAll: calculateAll,
    calculateTargetModel: calculateTargetModel, // ✅ CRITICAL: Expose for state-isolated forced recalculation
    calculateReferenceModel: calculateReferenceModel, // ✅ CRITICAL: Expose for S11 robot fingers 🤖👆 in Reference mode
    calculateCombinedUValue: calculateCombinedUValue,
    ModeManager: ModeManager, // ✅ CRITICAL FIX: Enable FieldManager integration
    // ✅ PHASE 2: Expose state objects for import sync
    TargetState: TargetState,
    ReferenceState: ReferenceState,
    // ✅ BACKUP: Expose initialization state and force method for S03 integration
    get isInitialized() {
      return isInitialized;
    },
    forceInitialization: onSectionRendered,
  };
})();
