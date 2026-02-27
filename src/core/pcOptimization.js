/**
 * pcOptimization.js
 * Optimization preset handlers for Section 18 Parallel Coordinates
 *
 * Refactored from ParallelCoordinates.js (Nov 30, 2025)
 * Replaces ~850 lines of duplicated optimization code with ~150 lines of data-driven logic
 *
 * This module provides:
 * - OPTIMIZATION_PRESETS: Configuration for 4 optimization strategies
 * - updateField(): Helper to update TargetState + StateManager + recalculate
 * - applyOptimizationPreset(): Unified handler that applies any preset
 * - 4 wrapper functions: handleDecarbonize, handleOptimize, handleSuperOptimize, handlePassivHausIfy
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};
window.TEUI.PCOptimization = (function () {
  "use strict";

  // ══════════════════════════════════════════════════════════════════════
  // OPTIMIZATION PRESETS CONFIGURATION
  // Data-driven approach replaces 4 nearly-identical handler functions
  // ══════════════════════════════════════════════════════════════════════

  const OPTIMIZATION_PRESETS = {
    /**
     * DECARBONIZE: Minimize GHGI by switching fossil fuel systems to heat pumps
     * Focus: SHW and Heating only (fuel switching)
     */
    decarbonize: {
      name: "Decarbonize",
      description: "Switch fossil fuel systems to heat pumps",
      debugFlag: "TEUI_DEBUG_DECARBONIZE",
      fields: [
        // SHW: Switch to Heatpump if Oil/Gas, ensure 300% COP
        {
          section: "sect07",
          field: "d_51",
          value: "Heatpump",
          condition: sm =>
            sm.getValue("d_51") === "Oil" || sm.getValue("d_51") === "Gas",
          preCalc: true, // Recalculate before setting next field
          visibilityUpdate: (section, sm) => {
            const currentWaterMethod = sm.getValue("d_49") || "User Defined";
            if (section?.updateSection7Visibility) {
              section.updateSection7Visibility(currentWaterMethod, "Heatpump");
            }
          },
          label: sm => `${sm.getValue("d_51")} SHW → Heatpump`,
        },
        {
          section: "sect07",
          field: "d_52",
          value: "300",
          condition: sm => {
            const d_51 = sm.getValue("d_51");
            if (d_51 === "Heatpump") {
              const d_52 = parseFloat(sm.getValue("d_52")) || 0;
              return d_52 < 300;
            }
            return d_51 === "Oil" || d_51 === "Gas"; // Will be Heatpump after previous step
          },
          label: sm => {
            const d_52 = parseFloat(sm.getValue("d_52")) || 0;
            return d_52 > 0 && d_52 < 300
              ? `SHW raised to 300%`
              : `Heatpump 300%`;
          },
        },

        // Heating: Switch to Heatpump if Oil/Gas, ensure HSPF 12.5
        {
          section: "sect13",
          field: "d_113",
          value: "Heatpump",
          condition: sm =>
            sm.getValue("d_113") === "Oil" || sm.getValue("d_113") === "Gas",
          preCalc: true,
          visibilityUpdate: section => {
            if (section?.handleHeatingSystemChangeForGhosting) {
              section.handleHeatingSystemChangeForGhosting("Heatpump");
            }
          },
          label: sm => `${sm.getValue("d_113")} Heating → Heatpump`,
        },
        {
          section: "sect13",
          field: "f_113",
          value: "12.5",
          condition: sm => {
            const d_113 = sm.getValue("d_113");
            if (d_113 === "Heatpump") {
              const f_113 = parseFloat(sm.getValue("f_113")) || 0;
              return f_113 < 12.5;
            }
            return d_113 === "Oil" || d_113 === "Gas"; // Will be Heatpump after previous step
          },
          label: sm => {
            const f_113 = parseFloat(sm.getValue("f_113")) || 0;
            return f_113 > 0 && f_113 < 12.5
              ? `Heating raised to HSPF 12.5`
              : `Heatpump HSPF 12.5`;
          },
        },
      ],
      successMessage: (changes, sm) => {
        const d_51 = sm.getValue("d_51");
        const d_113 = sm.getValue("d_113");
        const isFullyOptimized =
          (d_51 === "Heatpump" || d_51 === "Electric") &&
          (d_113 === "Heatpump" || d_113 === "Electric");

        if (changes.length === 0 && isFullyOptimized) {
          return "Nice! Your building is already zero emissions!";
        }
        return changes.join(", ");
      },
    },

    /**
     * OPTIMIZE: Balanced cost/performance optimization
     * Focus: All 8 parameters, moderate efficiency improvements
     */
    optimize: {
      name: "Optimize",
      description: "Balanced cost/performance optimization",
      fields: [
        // SHW: Switch to Heatpump for 300%+ efficiency
        {
          section: "sect07",
          field: "d_51",
          value: "Heatpump",
          condition: sm => sm.getValue("d_51") !== "Heatpump",
          preCalc: true,
          label: () => "SHW → Heatpump",
        },
        {
          section: "sect07",
          field: "d_52",
          value: "300",
          label: () => "SHW 300%",
        },
        {
          section: "sect07",
          field: "d_53",
          value: "50",
          label: () => "DWHR 50%",
        },

        // Heating: Conditional on fuel type
        {
          section: "sect13",
          field: "j_115",
          value: "0.98",
          condition: sm => {
            const d_113 = sm.getValue("d_113");
            return d_113 === "Oil" || d_113 === "Gas";
          },
          label: () => "Heating AFUE 98%",
        },
        {
          section: "sect13",
          field: "f_113",
          value: "12.5",
          condition: sm => sm.getValue("d_113") === "Heatpump",
          label: () => "Heating HSPF 12.5",
        },

        // MVHR
        {
          section: "sect13",
          field: "d_118",
          value: "85",
          label: () => "MVHR 85%",
        },

        // Thermal Bridging
        {
          section: "sect11",
          field: "d_97",
          value: "20",
          label: () => "TB 20%",
        },

        // Net Gains
        {
          section: "sect10",
          field: "d_80",
          value: "NRC 60%",
          label: () => "nGains 60%",
        },

        // ACH50: Dropdown flip pattern
        {
          section: "sect12",
          field: "d_108",
          value: "MEASURED",
          preCalc: true,
          label: () => null, // Don't show dropdown change in feedback
        },
        {
          section: "sect12",
          field: "g_109",
          value: "1.00",
          label: () => "ACH50 1.00",
        },
      ],
      successMessage: changes => `Optimized: ${changes.join(", ")}`,
    },

    /**
     * SUPER OPTIMIZE: Aggressive multi-objective optimization
     * Focus: High efficiency improvements, TB% = 10% (vs PassivHaus 5%)
     */
    superOptimize: {
      name: "Super Optimize",
      description: "Aggressive optimization with high efficiency targets",
      fields: [
        // SHW: Switch to Heatpump for 400%+ efficiency
        {
          section: "sect07",
          field: "d_51",
          value: "Heatpump",
          condition: sm => sm.getValue("d_51") !== "Heatpump",
          preCalc: true,
          label: () => "SHW → Heatpump",
        },
        {
          section: "sect07",
          field: "d_52",
          value: "400",
          label: () => "SHW 400%",
        },
        {
          section: "sect07",
          field: "d_53",
          value: "70",
          label: () => "DWHR 70%",
        },

        // Heating: Conditional on fuel type
        {
          section: "sect13",
          field: "j_115",
          value: "0.98",
          condition: sm => {
            const d_113 = sm.getValue("d_113");
            return d_113 === "Oil" || d_113 === "Gas";
          },
          label: () => "Heating AFUE 98%",
        },
        {
          section: "sect13",
          field: "f_113",
          value: "15",
          condition: sm => sm.getValue("d_113") === "Heatpump",
          label: () => "Heating HSPF 15",
        },

        // MVHR
        {
          section: "sect13",
          field: "d_118",
          value: "95",
          label: () => "MVHR 95%",
        },

        // Thermal Bridging: 10% (KEY DIFFERENCE from PassivHaus)
        {
          section: "sect11",
          field: "d_97",
          value: "10",
          label: () => "TB 10%",
        },

        // Net Gains: PHPP Method
        {
          section: "sect10",
          field: "d_80",
          value: "PH Method",
          label: () => "nGains PHPP",
        },

        // ACH50: Dropdown flip pattern
        {
          section: "sect12",
          field: "d_108",
          value: "MEASURED",
          preCalc: true,
          label: () => null,
        },
        {
          section: "sect12",
          field: "g_109",
          value: "0.60",
          label: () => "ACH50 0.60",
        },
      ],
      successMessage: changes => `Super Optimized: ${changes.join(", ")}`,
    },

    /**
     * PASSIVHAUS: PassivHaus standard compliance
     * Focus: Maximum efficiency, TB% = 5% (KEY DIFFERENCE from SuperOptimize)
     */
    passivhaus: {
      name: "PassivHaus-ify",
      description: "PassivHaus standard compliance targets",
      fields: [
        // SHW: Switch to Heatpump for 400%+ efficiency
        {
          section: "sect07",
          field: "d_51",
          value: "Heatpump",
          condition: sm => sm.getValue("d_51") !== "Heatpump",
          preCalc: true,
          label: () => "SHW → Heatpump",
        },
        {
          section: "sect07",
          field: "d_52",
          value: "400",
          label: () => "SHW 400%",
        },
        {
          section: "sect07",
          field: "d_53",
          value: "70",
          label: () => "DWHR 70%",
        },

        // Heating: Conditional on fuel type
        {
          section: "sect13",
          field: "j_115",
          value: "0.98",
          condition: sm => {
            const d_113 = sm.getValue("d_113");
            return d_113 === "Oil" || d_113 === "Gas";
          },
          label: () => "Heating AFUE 98%",
        },
        {
          section: "sect13",
          field: "f_113",
          value: "15",
          condition: sm => sm.getValue("d_113") === "Heatpump",
          label: () => "Heating HSPF 15",
        },

        // MVHR
        {
          section: "sect13",
          field: "d_118",
          value: "95",
          label: () => "MVHR 95%",
        },

        // Thermal Bridging: 5% (KEY DIFFERENCE from SuperOptimize)
        { section: "sect11", field: "d_97", value: "5", label: () => "TB 5%" },

        // Net Gains: PHPP Method
        {
          section: "sect10",
          field: "d_80",
          value: "PH Method",
          label: () => "nGains PHPP",
        },

        // ACH50: Dropdown flip pattern
        {
          section: "sect12",
          field: "d_108",
          value: "MEASURED",
          preCalc: true,
          label: () => null,
        },
        {
          section: "sect12",
          field: "g_109",
          value: "0.60",
          label: () => "ACH50 0.60",
        },
      ],
      successMessage: changes => `PassivHaus: ${changes.join(", ")}`,
    },
  };

  // ══════════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Update a field in both TargetState and StateManager
   * Follows the standard pattern used across all optimization handlers
   *
   * @param {string} sectionId - Section module ID (e.g., "sect07")
   * @param {string} fieldId - Field ID to update (e.g., "d_52")
   * @param {string} value - Value to set
   */
  function updateField(sectionId, fieldId, value) {
    const section = window.TEUI?.SectionModules?.[sectionId];
    const stateManager = window.TEUI?.StateManager;

    // Update section's TargetState
    if (section?.TargetState) {
      section.TargetState.setValue(fieldId, value);
    }

    // Update global StateManager
    if (stateManager) {
      stateManager.setValue(fieldId, value, "user-modified");
    }

    // Trigger recalculation
    if (section?.calculateAll) {
      section.calculateAll();
    }

    // Refresh UI
    if (section?.ModeManager?.refreshUI) {
      section.ModeManager.refreshUI();
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // UNIFIED OPTIMIZATION HANDLER
  // Replaces 4 individual handlers with data-driven approach
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Apply an optimization preset
   *
   * @param {string} presetName - Preset key from OPTIMIZATION_PRESETS
   * @param {function} showFeedback - Feedback display function
   * @param {function} refresh - Graph refresh function
   */
  function applyOptimizationPreset(presetName, showFeedback, refresh) {
    console.log(`[PCOptimization] ${presetName} action triggered`);

    const stateManager = window.TEUI?.StateManager;
    if (!stateManager) {
      console.error("[PCOptimization] StateManager not available");
      return;
    }

    const preset = OPTIMIZATION_PRESETS[presetName];
    if (!preset) {
      console.error(`[PCOptimization] Unknown preset: ${presetName}`);
      return;
    }

    // 🔍 DIAGNOSTIC: Capture state BEFORE optimization (if debug enabled)
    const debugEnabled = preset.debugFlag && window[preset.debugFlag] === true;
    let stateBefore = null;

    if (debugEnabled) {
      console.log(`[${preset.name}] === DIAGNOSTIC START ===`);
      stateBefore = captureState(stateManager);
      console.log(`[${preset.name}] STATE BEFORE:`, stateBefore);
    }

    // Apply each field update in the preset
    const changes = [];
    const sectionsModified = new Set();

    for (const update of preset.fields) {
      // Skip if condition not met
      if (update.condition && !update.condition(stateManager)) {
        continue;
      }

      const section = window.TEUI?.SectionModules?.[update.section];

      // If preCalc flag set, recalculate section first (for dropdown switches)
      if (update.preCalc && section?.calculateAll) {
        section.calculateAll();
      }

      // Apply visibility updates if specified (for dropdown field switching)
      if (update.visibilityUpdate) {
        update.visibilityUpdate(section, stateManager);
      }

      // Apply the update
      updateField(update.section, update.field, update.value);
      sectionsModified.add(update.section);

      // Track change for feedback (if label provided)
      if (update.label) {
        const label =
          typeof update.label === "function"
            ? update.label(stateManager)
            : update.label;
        if (label) {
          changes.push(label);
        }
      }
    }

    // Force final recalculation for all modified sections
    sectionsModified.forEach(sectionId => {
      const section = window.TEUI?.SectionModules?.[sectionId];
      if (section?.calculateAll) {
        section.calculateAll();
      }
      if (section?.ModeManager?.refreshUI) {
        section.ModeManager.refreshUI();
      }
    });

    // 🔍 DIAGNOSTIC: Capture state AFTER optimization (if debug enabled)
    if (debugEnabled && stateBefore) {
      const stateAfter = captureState(stateManager);
      console.log(`[${preset.name}] STATE AFTER:`, stateAfter);

      // Check if Reference state was modified (BUG if true)
      const refChanged =
        JSON.stringify(stateBefore.reference) !==
        JSON.stringify(stateAfter.reference);
      if (refChanged) {
        console.error(
          `[${preset.name}] ⚠️  BUG DETECTED: Reference state was modified!`
        );
        console.error(
          `[${preset.name}] Reference BEFORE:`,
          stateBefore.reference
        );
        console.error(
          `[${preset.name}] Reference AFTER:`,
          stateAfter.reference
        );
      } else {
        console.log(`[${preset.name}] ✅ Reference state unchanged (correct)`);
      }
      console.log(`[${preset.name}] === DIAGNOSTIC END ===`);
    }

    // Show feedback and refresh
    if (changes.length > 0) {
      const message =
        typeof preset.successMessage === "function"
          ? preset.successMessage(changes, stateManager)
          : preset.successMessage || changes.join(", ");

      showFeedback(message, 6000);
      console.log(`[${preset.name}] Optimization complete - refreshing graph`);

      setTimeout(() => {
        refresh();
      }, 200);
    } else {
      // No changes made - use preset's custom message if available
      const noChangeMessage =
        typeof preset.successMessage === "function"
          ? preset.successMessage([], stateManager)
          : "No changes needed";

      showFeedback(noChangeMessage, 4000);
      console.log(`[${preset.name}] No changes needed`);
    }
  }

  /**
   * Capture current state for diagnostic comparison
   * @param {object} stateManager - StateManager instance
   * @returns {object} State snapshot
   */
  function captureState(stateManager) {
    return {
      target: {
        d_51: stateManager.getValue("d_51"),
        d_52: stateManager.getValue("d_52"),
        k_52: stateManager.getValue("k_52"),
        d_113: stateManager.getValue("d_113"),
        f_113: stateManager.getValue("f_113"),
        j_115: stateManager.getValue("j_115"),
      },
      reference: {
        ref_d_51: stateManager.getValue("ref_d_51"),
        ref_d_52: stateManager.getValue("ref_d_52"),
        ref_k_52: stateManager.getValue("ref_k_52"),
        ref_d_113: stateManager.getValue("ref_d_113"),
        ref_f_113: stateManager.getValue("ref_f_113"),
        ref_j_115: stateManager.getValue("ref_j_115"),
      },
    };
  }

  // ══════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // Expose handler functions for ParallelCoordinates.js to call
  // ══════════════════════════════════════════════════════════════════════

  return {
    /**
     * Decarbonize optimization handler
     * Minimizes GHGI by switching fossil fuel systems to heat pumps
     */
    handleDecarbonize: function (showFeedback, refresh) {
      applyOptimizationPreset("decarbonize", showFeedback, refresh);
    },

    /**
     * Optimize handler
     * Balanced cost/performance optimization (moderate efficiency improvements)
     */
    handleOptimize: function (showFeedback, refresh) {
      applyOptimizationPreset("optimize", showFeedback, refresh);
    },

    /**
     * Super Optimize handler
     * Aggressive multi-objective optimization (high efficiency improvements)
     * TB% = 10% (vs PassivHaus 5%)
     */
    handleSuperOptimize: function (showFeedback, refresh) {
      applyOptimizationPreset("superOptimize", showFeedback, refresh);
    },

    /**
     * PassivHaus-ify handler
     * PassivHaus standard compliance targets
     * TB% = 5% (vs SuperOptimize 10%)
     */
    handlePassivHausIfy: function (showFeedback, refresh) {
      applyOptimizationPreset("passivhaus", showFeedback, refresh);
    },

    // Expose for testing/debugging
    OPTIMIZATION_PRESETS: OPTIMIZATION_PRESETS,
  };
})();

console.log("[pcOptimization] Optimization module loaded");
