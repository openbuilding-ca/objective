/**
 * 4011-ReferenceToggle.js
 * MODERNIZED FOR PATTERN A DUAL-STATE ARCHITECTURE
 * Module to handle switching between Target and Reference Model views across ALL sections.
 */

// Create TEUI namespace if it doesn't exist
window.TEUI = window.TEUI || {};

TEUI.ReferenceToggle = (function () {
  let isShowingReference = false; // Track if we're currently showing Reference values
  const STANDARD_SELECTOR_ID = "d_13"; // ID of the reference standard dropdown

  // Button IDs and text constants
  const RUN_REFERENCE_BUTTON_ID = "runReferenceBtn";
  const VIEW_REFERENCE_INPUTS_BUTTON_ID = "viewReferenceInputsBtn";

  // Updated button text for Pattern A architecture
  const BUTTON_TEXT_SHOW_REFERENCE = "Show Reference";
  const BUTTON_TEXT_SHOW_TARGET = "Show Target";
  const BUTTON_TEXT_HIGHLIGHT_REFERENCE_VALUES = "Highlight Reference Values";
  const BUTTON_TEXT_SHOW_TARGET_INPUTS = "Show Target Inputs";

  let isViewingReferenceInputs = false;

  /**
   * Pattern A Compatible: Get all sections with dual-state ModeManager
   * FIXED: Updated for current dual-state architecture
   */
  function getAllDualStateSections() {
    const sectionIds = [
      "sect02",
      "sect03",
      "sect04",
      "sect08",
      "sect10",
      "sect11",
      "sect12",
      "sect13",
      "sect14",
      "sect15",
    ];

    const dualStateSections = sectionIds
      .map((id) => ({
        id,
        module: window.TEUI?.[id],
        modeManager: window.TEUI?.[id]?.ModeManager,
      }))
      .filter((s) => s.modeManager);

    console.log(
      `[ReferenceToggle] Found ${dualStateSections.length} dual-state sections:`,
      dualStateSections.map((s) => s.id),
    );
    return dualStateSections;
  }

  /**
   * PHASE 3: Master Display Toggle - Switch ALL sections with coordinated styling
   * UPDATED: Now applies existing CSS classes for global Reference styling
   */
  function switchAllSectionsMode(mode) {
    const sections = getAllDualStateSections();
    let switchedCount = 0;

    // Switch all section ModeManagers
    sections.forEach((section) => {
      try {
        if (
          section.modeManager &&
          typeof section.modeManager.switchMode === "function"
        ) {
          section.modeManager.switchMode(mode);
          section.modeManager.updateCalculatedDisplayValues();
          switchedCount++;
        }
      } catch (error) {
        console.error(
          `[ReferenceToggle] Error switching ${section.id}:`,
          error,
        );
      }
    });

    // Apply existing CSS classes for global Reference styling
    const isReference = mode === "reference";
    document.body.classList.toggle("viewing-reference-inputs", isReference);
    document.body.classList.toggle("viewing-reference-values", isReference);
    document.body.classList.toggle("reference-mode", isReference);
    document.documentElement.classList.toggle("reference-mode", isReference);

    console.log(
      `🎨 Master Toggle: Switched ${switchedCount}/${sections.length} sections to ${mode.toUpperCase()} mode with global styling`,
    );
    return switchedCount;
  }

  /**
   * Pattern A Compatible: Update all calculated display values based on current mode
   */
  function updateAllCalculatedDisplays() {
    const dualStateSections = getAllDualStateSections();

    dualStateSections.forEach((section) => {
      try {
        if (
          section.modeManager &&
          typeof section.modeManager.updateCalculatedDisplayValues ===
            "function"
        ) {
          section.modeManager.updateCalculatedDisplayValues();
        } else if (
          section.modeManager &&
          typeof section.modeManager.refreshUI === "function"
        ) {
          section.modeManager.refreshUI();
        }
      } catch (error) {
        console.error(
          `[ReferenceToggle] Error updating display for ${section.id}:`,
          error,
        );
      }
    });
  }

  function initialize() {
    // PHASE 4: Wire new dropdown buttons to setup functions

    // Setup Reference Setup buttons
    const mirrorTargetBtn = document.getElementById("mirrorTargetBtn");
    if (mirrorTargetBtn) {
      mirrorTargetBtn.addEventListener("click", (e) => {
        e.preventDefault();
        mirrorTarget();
      });
    }

    const mirrorTargetReferenceBtn = document.getElementById(
      "mirrorTargetReferenceBtn",
    );
    if (mirrorTargetReferenceBtn) {
      mirrorTargetReferenceBtn.addEventListener("click", (e) => {
        e.preventDefault();
        mirrorTargetWithReference();
      });
    }

    const referenceIndependenceBtn = document.getElementById(
      "referenceIndependenceBtn",
    );
    if (referenceIndependenceBtn) {
      referenceIndependenceBtn.addEventListener("click", (e) => {
        e.preventDefault();
        enableReferenceIndependence();
      });
    }

    // Setup Display Toggle buttons
    const showReferenceBtn = document.getElementById("showReferenceBtn");
    if (showReferenceBtn) {
      showReferenceBtn.addEventListener("click", (e) => {
        e.preventDefault();
        switchAllSectionsMode("reference");
      });
    }

    const showTargetBtn = document.getElementById("showTargetBtn");
    if (showTargetBtn) {
      showTargetBtn.addEventListener("click", (e) => {
        e.preventDefault();
        switchAllSectionsMode("target");
      });
    }

    // Keep existing Reference Inputs view button
    const viewRefInputsBtn = document.getElementById(
      VIEW_REFERENCE_INPUTS_BUTTON_ID,
    );
    if (viewRefInputsBtn) {
      viewRefInputsBtn.addEventListener("click", toggleReferenceInputsView);
      viewRefInputsBtn.textContent = BUTTON_TEXT_HIGHLIGHT_REFERENCE_VALUES;
    }

    // Keep existing reference standard change handler
    const standardSelector =
      document.getElementById(STANDARD_SELECTOR_ID) ||
      document.querySelector(`[data-field-id='${STANDARD_SELECTOR_ID}']`);
    if (standardSelector) {
      const actualSelect =
        standardSelector.tagName === "SELECT"
          ? standardSelector
          : standardSelector.querySelector("select");
      if (actualSelect) {
        actualSelect.addEventListener("change", handleStandardChange);
      }
    }

    console.log(
      "[ReferenceToggle] Master Reference Toggle initialization complete",
    );
  }

  /**
   * MAIN FUNCTION: Toggle between showing Target and Reference calculated values
   * This is the new "Show Reference" functionality with proper red UI styling
   */
  function toggleReferenceDisplay() {
    isShowingReference = !isShowingReference;
    const targetMode = isShowingReference ? "reference" : "target";

    console.log(
      `[ReferenceToggle] Switching ALL sections to ${targetMode.toUpperCase()} display mode`,
    );

    // Switch all dual-state sections to the target mode
    const switchedCount = switchAllSectionsMode(targetMode);

    if (switchedCount > 0) {
      // Update all calculated display values
      updateAllCalculatedDisplays();

      // Update button text
      const runRefBtn = document.getElementById(RUN_REFERENCE_BUTTON_ID);
      if (runRefBtn) {
        runRefBtn.textContent = isShowingReference
          ? BUTTON_TEXT_SHOW_TARGET
          : BUTTON_TEXT_SHOW_REFERENCE;
      }

      // 🎨 CRITICAL: Apply RED Reference mode styling to entire UI
      // Use the SAME CSS class that "Highlight Reference Values" uses
      document.body.classList.toggle(
        "viewing-reference-inputs",
        isShowingReference,
      );
      document.body.classList.toggle(
        "viewing-reference-values",
        isShowingReference,
      );

      // Also apply additional classes for comprehensive styling
      document.body.classList.toggle("reference-mode", isShowingReference);
      const htmlElement = document.documentElement;
      htmlElement.classList.toggle("reference-mode", isShowingReference);

      console.log(
        `[ReferenceToggle] Successfully toggled to ${targetMode.toUpperCase()} display mode with UI styling`,
      );
    } else {
      console.warn(
        "[ReferenceToggle] No sections were switched - reverting toggle",
      );
      isShowingReference = !isShowingReference; // Revert if nothing was switched
    }
  }

  /**
   * Handle reference standard (d_13) changes
   */
  function handleStandardChange(event) {
    const newStandardKey = event.target.value;
    console.log(
      `[ReferenceToggle] Reference standard changed to: ${newStandardKey}`,
    );

    if (window.TEUI?.StateManager) {
      // Update the global standard
      window.TEUI.StateManager.setValue(
        STANDARD_SELECTOR_ID,
        newStandardKey,
        "user-modified",
      );

      // Notify all sections with ReferenceValues.js dependencies
      const dualStateSections = getAllDualStateSections();
      dualStateSections.forEach((section) => {
        try {
          // Look for sections that have onReferenceStandardChange method in their ReferenceState
          if (section.module.ReferenceState?.onReferenceStandardChange) {
            section.module.ReferenceState.onReferenceStandardChange(
              newStandardKey,
            );
            console.log(
              `[ReferenceToggle] Updated ${section.id} for new reference standard`,
            );
          }
        } catch (error) {
          console.error(
            `[ReferenceToggle] Error updating ${section.id} for standard change:`,
            error,
          );
        }
      });

      // Trigger recalculations
      if (window.TEUI?.Calculator?.calculateAll) {
        window.TEUI.Calculator.calculateAll();
      }

      console.log(`[ReferenceToggle] Reference standard update complete`);
    }
  }

  /**
   * Legacy function for "Show Reference Inputs" - shows which inputs were applied from ReferenceValues
   * This highlights actual Reference inputs vs calculated values
   */
  function toggleReferenceInputsView() {
    isViewingReferenceInputs = !isViewingReferenceInputs;

    // Add/Remove body class for styling
    document.body.classList.toggle(
      "viewing-reference-inputs",
      isViewingReferenceInputs,
    );

    // Update button text
    const viewRefInputsBtn = document.getElementById(
      VIEW_REFERENCE_INPUTS_BUTTON_ID,
    );
    if (viewRefInputsBtn) {
      viewRefInputsBtn.textContent = isViewingReferenceInputs
        ? BUTTON_TEXT_SHOW_TARGET_INPUTS
        : BUTTON_TEXT_HIGHLIGHT_REFERENCE_VALUES;
    }

    // This feature needs to be implemented to highlight Reference input fields
    // from ReferenceValues.js vs calculated values
    console.log(
      `[ReferenceToggle] Reference inputs view: ${isViewingReferenceInputs ? "ON" : "OFF"}`,
    );

    // TODO: Implement visual highlighting of Reference input fields
    // This should show which fields come from ReferenceValues.js based on d_13 selection
  }

  /**
   * Legacy compatibility function
   */
  function isReferenceMode() {
    return isShowingReference;
  }

  /**
   * Get comparison value - now reads from StateManager with ref_ prefix
   */
  function getCompareValue(fieldId) {
    if (window.TEUI?.StateManager) {
      return window.TEUI.StateManager.getValue(`ref_${fieldId}`);
    }
    return null;
  }

  /**
   * PHASE 2: Three Reference Setup Functions
   * These implement the core functionality from Master-Reference-Roadmap.md
   */

  /**
   * HELPER: Get field IDs for a section using FieldManager
   */
  function getFieldIdsForSection(sectionId) {
    try {
      // Use FieldManager to get field definitions for this section
      if (window.TEUI?.FieldManager?.getFieldsBySection) {
        const fields = window.TEUI.FieldManager.getFieldsBySection(
          getUINameForSection(sectionId),
        );
        return Object.keys(fields);
      }

      // Fallback: Try direct section module access
      if (window.TEUI?.SectionModules?.[sectionId]?.getFields) {
        const fields = window.TEUI.SectionModules[sectionId].getFields();
        return Object.keys(fields);
      }

      console.warn(
        `[ReferenceToggle] Could not get field IDs for section ${sectionId}`,
      );
      return [];
    } catch (error) {
      console.error(
        `[ReferenceToggle] Error getting field IDs for ${sectionId}:`,
        error,
      );
      return [];
    }
  }

  /**
   * HELPER: Convert section ID to UI name for FieldManager
   */
  function getUINameForSection(sectionId) {
    const mapping = {
      sect01: "keyValues",
      sect02: "buildingInfo",
      sect03: "climateCalculations",
      sect04: "actualTargetEnergy",
      sect05: "emissions",
      sect06: "onSiteEnergy",
      sect07: "waterUse",
      sect08: "indoorAirQuality",
      sect09: "occupantInternalGains",
      sect10: "envelopeRadiantGains",
      sect11: "envelopeTransmissionLosses",
      sect12: "volumeSurfaceMetrics",
      sect13: "mechanicalLoads",
      sect14: "tediSummary",
      sect15: "teuiSummary",
    };
    return mapping[sectionId] || sectionId;
  }

  /**
   * 1. Mirror Target: Copy all Target values to Reference state
   * CORRECTED: Uses proper ModeManager facade pattern
   */
  function mirrorTarget() {
    try {
      const sections = getAllDualStateSections();
      console.log(
        `[ReferenceToggle] Mirror Target: Processing ${sections.length} sections`,
      );

      let totalFieldsCopied = 0;

      sections.forEach((section, index) => {
        console.log(`[ReferenceToggle] Processing ${section.id}...`);

        // Get field IDs for this section
        const fieldIds = getFieldIdsForSection(section.id);
        console.log(
          `[ReferenceToggle] Found ${fieldIds.length} fields for ${section.id}`,
        );

        if (fieldIds.length === 0) {
          console.warn(
            `[ReferenceToggle] No fields found for ${section.id} - skipping`,
          );
          return;
        }

        // Save current mode
        const originalMode = section.modeManager.currentMode;

        // Switch to target mode to read values
        section.modeManager.switchMode("target");

        // Read all Target values using ModeManager facade
        const targetValues = {};
        fieldIds.forEach((fieldId) => {
          const value = section.modeManager.getValue(fieldId);
          if (value !== null && value !== undefined && value !== "") {
            targetValues[fieldId] = value;
          }
        });

        console.log(
          `[ReferenceToggle] Read ${Object.keys(targetValues).length} Target values from ${section.id}`,
        );

        // Switch to reference mode to write values
        section.modeManager.switchMode("reference");

        // Copy Target values to Reference state
        Object.entries(targetValues).forEach(([fieldId, value]) => {
          section.modeManager.setValue(fieldId, value, "mirrored");
          totalFieldsCopied++;
        });

        // Restore original mode and refresh UI
        section.modeManager.switchMode(originalMode);
        section.modeManager.refreshUI();

        console.log(
          `[ReferenceToggle] Copied ${Object.keys(targetValues).length} values to Reference state for ${section.id}`,
        );
      });

      console.log(
        `🔗 Mirror Target: Successfully copied ${totalFieldsCopied} total fields across ${sections.length} sections`,
      );
      console.log(
        "🎯 Test: Switch to Reference mode to verify e_10 (Reference TEUI) equals h_10 (Target TEUI)",
      );
    } catch (error) {
      console.error("[ReferenceToggle] Mirror Target failed:", error);
    }
  }

  /**
   * 2. Mirror Target + Reference: Copy Target + overlay ReferenceValues subset
   * CORRECTED: Uses proper ModeManager facade and ReferenceValues.js integration
   */
  function mirrorTargetWithReference() {
    try {
      const standard =
        window.TEUI?.StateManager?.getValue("d_13") || "OBC SB12 3.1.1.2.C1";
      const refValues = window.TEUI?.ReferenceValues?.[standard] || {};

      console.log(
        `[ReferenceToggle] Mirror Target + Reference: Using standard "${standard}"`,
      );
      console.log(
        `[ReferenceToggle] Found ${Object.keys(refValues).length} reference values for this standard`,
      );

      // First execute Mirror Target to copy all Target values
      mirrorTarget();

      // Then overlay ReferenceValues subset for building code compliance
      const sections = getAllDualStateSections();
      let totalOverlayFields = 0;

      sections.forEach((section) => {
        console.log(
          `[ReferenceToggle] Applying ReferenceValues overlay to ${section.id}...`,
        );

        // Save current mode
        const originalMode = section.modeManager.currentMode;

        // Switch to reference mode to apply overlay
        section.modeManager.switchMode("reference");

        // Apply ReferenceValues overlay (building code minimums)
        const appliedFields = [];
        Object.entries(refValues).forEach(([fieldId, value]) => {
          // Only apply if this section manages this field
          const fieldIds = getFieldIdsForSection(section.id);
          if (fieldIds.includes(fieldId)) {
            section.modeManager.setValue(fieldId, value, "reference-standard");
            appliedFields.push(fieldId);
            totalOverlayFields++;
          }
        });

        // Restore original mode and refresh UI
        section.modeManager.switchMode(originalMode);
        section.modeManager.refreshUI();

        if (appliedFields.length > 0) {
          console.log(
            `[ReferenceToggle] Applied ${appliedFields.length} reference standard values to ${section.id}: [${appliedFields.join(", ")}]`,
          );
        }
      });

      console.log(
        `🔗 Mirror Target + Reference: Applied ${totalOverlayFields} reference standard values across all sections`,
      );
      console.log(
        `📋 Standard: "${standard}" - building code minimums now overlay Target inputs`,
      );
    } catch (error) {
      console.error(
        "[ReferenceToggle] Mirror Target + Reference failed:",
        error,
      );
    }
  }

  /**
   * 3. Reference Independence: No setup needed - sections already independent
   */
  function enableReferenceIndependence() {
    console.log(
      "🔓 Reference Independence: Sections are already independent by default",
    );
    // No action needed - dual-state architecture already provides independence
  }

  return {
    initialize,
    isReferenceMode,
    getCompareValue,
    toggleReferenceDisplay,
    switchAllSectionsMode, // Expose for external use
    getAllDualStateSections, // Expose for debugging
    // New setup functions
    mirrorTarget,
    mirrorTargetWithReference,
    enableReferenceIndependence,
  };
})();
