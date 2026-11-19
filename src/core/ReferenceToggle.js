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
   * G/C/A Field Classification Mapping (2025-11-27)
   * Based on CSV metadata row 4 from TEUIv4011-DualState-Three_Feathers_Terrace.csv
   * G = Geometry fields (areas, volumes, location, occupancy)
   * C = Code/Performance fields (RSI, equipment, SHGC, U-values)
   * A = All other fields
   *
   * See docs/development/Field-Classification-GCA.md for complete documentation
   */
  const FIELD_CLASSIFICATION = {
    // Row 1-10
    d_12: "C",
    e_12: "C", // the 62.1 space type travels with its occupancy
    d_13: "C",
    d_14: "A",
    d_15: "C",
    h_12: "C",
    h_13: "C",
    h_14: "A",
    h_15: "G",
    i_16: "A",
    i_17: "A",
    // Row 11-20
    l_12: "A",
    l_13: "A",
    l_14: "A",
    l_15: "A",
    l_16: "A",
    d_19: "G",
    h_19: "G",
    h_20: "G",
    h_21: "G",
    i_21: "G",
    // Row 21-30
    m_19: "G",
    l_20: "G",
    l_21: "G",
    l_24: "G",
    d_27: "A",
    d_28: "A",
    d_29: "A",
    d_30: "A",
    d_31: "A",
    l_28: "A",
    // Row 31-40
    l_29: "A",
    l_30: "A",
    l_31: "A",
    h_35: "C",
    d_39: "C",
    i_41: "C",
    d_44: "A",
    d_45: "A",
    d_46: "A",
    i_44: "A",
    // Row 41-50
    k_45: "A",
    i_46: "A",
    m_43: "A",
    d_49: "C",
    e_49: "C",
    e_50: "C",
    d_51: "C",
    d_52: "C",
    d_53: "C",
    k_52: "C",
    // Row 51-60
    d_56: "C",
    d_57: "C",
    d_58: "C",
    d_59: "C",
    i_59: "C",
    g_59: "C",
    d_63: "C",
    l_63: "C", // bedrooms travel with the occupants (Part 9 ventilation)
    m_63: "C", // dwelling units, likewise
    g_63: "G",
    d_64: "G",
    d_66: "G",
    d_68: "G",
    // Row 61-70
    g_67: "G",
    d_73: "G",
    d_74: "G",
    d_75: "G",
    d_76: "G",
    d_77: "G",
    d_78: "G",
    e_73: "G",
    e_74: "G",
    e_75: "G",
    // Row 71-80
    e_76: "G",
    e_77: "G",
    e_78: "G",
    f_73: "C",
    f_74: "C",
    f_75: "C",
    f_76: "C",
    f_77: "C",
    f_78: "C",
    g_73: "G",
    // Row 81-90
    g_74: "G",
    g_75: "G",
    g_76: "G",
    g_77: "G",
    g_78: "G",
    h_73: "G",
    h_74: "G",
    h_75: "G",
    h_76: "G",
    h_77: "G",
    // Row 91-100
    h_78: "G",
    d_80: "C",
    d_85: "G",
    f_85: "C",
    d_86: "C",
    f_86: "C",
    d_87: "C",
    f_87: "C",
    g_88: "C",
    g_89: "C",
    // Row 101-110
    g_90: "C",
    g_91: "C",
    g_92: "C",
    g_93: "C",
    d_94: "G",
    f_94: "C",
    d_95: "G",
    f_95: "C",
    d_96: "G",
    d_97: "C",
    // Row 111-120
    d_103: "C",
    g_103: "C",
    d_105: "G",
    d_108: "C",
    g_109: "C",
    d_113: "C",
    f_113: "C",
    j_115: "C",
    j_116: "C",
    d_116: "C",
    // Row 121-127
    d_118: "C",
    e_118: "C",
    l_122: "C",
    i_122: "C",
    g_118: "C",
    l_118: "C",
    d_119: "C",
    l_119: "C",
    k_120: "C",
    d_142: "C",
  };

  /**
   * Get field classification category (G/C/A)
   * @param {string} fieldId - Field identifier
   * @returns {string|null} - 'G', 'C', 'A', or null if not classified
   */
  function getFieldClassification(fieldId) {
    return FIELD_CLASSIFICATION[fieldId] || null;
  }

  /**
   * Pattern A Compatible: Get all sections with dual-state ModeManager
   * FIXED: Updated for current dual-state architecture
   */
  /**
   * Sync per-section toggle UI visuals (the local target/reference toggle switches).
   * Iterates SectionModules that still have _toggleElements stored.
   */
  function syncAllToggleUI(mode) {
    const sectionIds = [
      "sect02", "sect03", "sect04", "sect05", "sect06", "sect07",
      "sect08", "sect09", "sect10", "sect11", "sect12", "sect13",
      "sect14", "sect15", "sect16", "sect19",
    ];

    sectionIds.forEach(id => {
      try {
        const mod = window.TEUI?.SectionModules?.[id];
        if (mod?._toggleElements) {
          window.TEUI.ToggleUISync.syncToggleUI(mod._toggleElements, mode, id);
        }
      } catch (e) {
        // Skip sections without toggle elements
      }
    });
  }

  /**
   * Notify sections that expose an onModeSwitch callback.
   * Sections use this to update conditional UI (ghosting, editability).
   */
  function notifySectionsOfModeChange(mode) {
    const modules = window.TEUI?.SectionModules || {};
    Object.keys(modules).forEach(id => {
      try {
        if (typeof modules[id]?.onModeSwitch === "function") {
          modules[id].onModeSwitch(mode);
        }
      } catch (e) {
        console.error(`[ReferenceToggle] Error notifying ${id}:`, e);
      }
    });
  }

  /**
   * Master Display Toggle - Switch ALL sections with coordinated styling.
   * No longer iterates ModeManagers — just applies CSS classes and notifies sections.
   */
  function switchAllSectionsMode(mode) {
    // Apply CSS classes for global Reference styling
    const isReference = mode === "reference";
    document.body.classList.toggle("viewing-reference-inputs", isReference);
    document.body.classList.toggle("viewing-reference-values", isReference);
    document.body.classList.toggle("reference-mode", isReference);
    document.documentElement.classList.toggle("reference-mode", isReference);

    // Sync per-section toggle UI visuals
    syncAllToggleUI(mode);

    // Update conditional UI (ghosting/editability) for sections that need it
    notifySectionsOfModeChange(mode);

    // Update Key Values header toggle UI to match global mode
    updateKeyValuesToggleUI(mode);
  }

  /**
   * Update Key Values header toggle UI to match global mode
   * Called when main global toggle switches modes
   */
  function updateKeyValuesToggleUI(mode) {
    // Check if Key Values toggle elements exist
    if (!window.TEUI.ReferenceToggle.keyValuesToggleElements) {
      return; // Key Values toggle not yet initialized
    }

    const { toggleSwitch, slider, stateIndicator } =
      window.TEUI.ReferenceToggle.keyValuesToggleElements;

    if (mode === "reference") {
      slider.style.transform = "translateX(20px)";
      toggleSwitch.style.backgroundColor = "#dc3545"; // Red
      // Key Values toggle doesn't have stateIndicator element, only main global toggle does
      if (stateIndicator) {
        stateIndicator.textContent = "REFERENCE";
        stateIndicator.style.backgroundColor = "rgba(220, 53, 69, 0.5)";
      }
    } else {
      slider.style.transform = "translateX(0)";
      toggleSwitch.style.backgroundColor = "#ccc"; // Gray
      // Key Values toggle doesn't have stateIndicator element, only main global toggle does
      if (stateIndicator) {
        stateIndicator.textContent = "TARGET";
        stateIndicator.style.backgroundColor = "rgba(0, 123, 255, 0.5)";
      }
    }
  }

  /**
   * Get current global mode
   * Used by Key Values toggle to determine mode before switching
   */
  function getCurrentMode() {
    return isShowingReference ? "reference" : "target";
  }

  /**
   * Switch mode (external API for toggles)
   * Used by Key Values toggle to switch all sections
   */
  function switchMode(mode) {
    isShowingReference = mode === "reference";
    switchAllSectionsMode(mode);

    // Graph stamps computed values for the correct model
    if (window.TEUI?.Calculator?.calculateAll) {
      window.TEUI.Calculator.calculateAll();
    }

    // Stamp input elements (dropdowns, sliders, editable fields) for the new mode
    if (window.TEUI?.DOMBridge?.stampInputsForMode) {
      window.TEUI.DOMBridge.stampInputsForMode();
    }

    // Update main toggle button text if it exists
    const runRefBtn = document.getElementById(RUN_REFERENCE_BUTTON_ID);
    if (runRefBtn) {
      runRefBtn.textContent = isShowingReference
        ? BUTTON_TEXT_SHOW_TARGET
        : BUTTON_TEXT_SHOW_REFERENCE;
    }
  }

  /**
   * Pattern A Compatible: Update all calculated display values based on current mode
   */
  function updateAllCalculatedDisplays() {
    // Graph handles all display updates via Calculator.calculateAll()
    if (window.TEUI?.Calculator?.calculateAll) {
      window.TEUI.Calculator.calculateAll();
    }
  }

  function initialize() {
    // ✅ NEW (2025-11-27): Wire three mirror function buttons

    // Button 1: Mirror Geometry (geometry/configuration only)
    const mirrorGeometryBtn = document.getElementById("mirrorGeometryBtn");
    if (mirrorGeometryBtn) {
      mirrorGeometryBtn.addEventListener("click", e => {
        e.preventDefault();
        console.log("[ReferenceToggle] User clicked: Geometry");
        mirrorGeometry();
      });
    }

    // Button 2: Mirror Geometry + Code (geometry + ReferenceValues overlay)
    const mirrorGeometryPlusCodeBtn = document.getElementById(
      "mirrorGeometryPlusCodeBtn"
    );
    if (mirrorGeometryPlusCodeBtn) {
      mirrorGeometryPlusCodeBtn.addEventListener("click", e => {
        e.preventDefault();
        console.log("[ReferenceToggle] User clicked: Geometry + Code");
        mirrorGeometryPlusCode();
      });
    }

    // Button 3: Mirror All Inputs (perfect clone)
    const mirrorAllInputsBtn = document.getElementById("mirrorAllInputsBtn");
    if (mirrorAllInputsBtn) {
      mirrorAllInputsBtn.addEventListener("click", e => {
        e.preventDefault();
        console.log("[ReferenceToggle] User clicked: All Inputs");
        mirrorAllInputs();
      });
    }

    // Setup Display Toggle buttons
    const showReferenceBtn = document.getElementById("showReferenceBtn");
    if (showReferenceBtn) {
      showReferenceBtn.addEventListener("click", e => {
        e.preventDefault();
        switchAllSectionsMode("reference");
        if (window.TEUI?.Calculator?.calculateAll) window.TEUI.Calculator.calculateAll();
        if (window.TEUI?.DOMBridge?.stampInputsForMode) window.TEUI.DOMBridge.stampInputsForMode();
      });
    }

    const showTargetBtn = document.getElementById("showTargetBtn");
    if (showTargetBtn) {
      showTargetBtn.addEventListener("click", e => {
        e.preventDefault();
        switchAllSectionsMode("target");
        if (window.TEUI?.Calculator?.calculateAll) window.TEUI.Calculator.calculateAll();
        if (window.TEUI?.DOMBridge?.stampInputsForMode) window.TEUI.DOMBridge.stampInputsForMode();
      });
    }

    // Keep existing Reference Inputs view button
    const viewRefInputsBtn = document.getElementById(
      VIEW_REFERENCE_INPUTS_BUTTON_ID
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
      "[ReferenceToggle] Master Reference Toggle initialization complete"
    );
  }

  /**
   * MAIN FUNCTION: Toggle between showing Target and Reference calculated values
   * This is the new "Show Reference" functionality with proper red UI styling
   */
  function toggleReferenceDisplay() {
    isShowingReference = !isShowingReference;
    const targetMode = isShowingReference ? "reference" : "target";

    // Switch all sections (CSS classes, toggle UI, conditional UI)
    switchAllSectionsMode(targetMode);

    // Update all calculated display values
    updateAllCalculatedDisplays();

    // Stamp input elements for the new mode
    if (window.TEUI?.DOMBridge?.stampInputsForMode) {
      window.TEUI.DOMBridge.stampInputsForMode();
    }

    // Update button text
    const runRefBtn = document.getElementById(RUN_REFERENCE_BUTTON_ID);
    if (runRefBtn) {
      runRefBtn.textContent = isShowingReference
        ? BUTTON_TEXT_SHOW_TARGET
        : BUTTON_TEXT_SHOW_REFERENCE;
    }
  }

  /**
   * Handle reference standard (d_13) changes
   */
  function handleStandardChange(event) {
    const newStandardKey = event.target.value;
    console.log(
      `[ReferenceToggle] Reference standard changed to: ${newStandardKey}`
    );

    if (window.TEUI?.StateManager) {
      // Update the global standard
      window.TEUI.StateManager.setValue(
        STANDARD_SELECTOR_ID,
        newStandardKey,
        "user-modified"
      );

      // Reference standard changes are handled by ComputationIntegration.populateReferenceModel()
      // which reads from ReferenceValues.js and writes to the reference model in MultiModelState.

      // Trigger recalculations
      if (window.TEUI?.Calculator?.calculateAll) {
        window.TEUI.Calculator.calculateAll();
      }
      if (window.TEUI?.DOMBridge?.stampInputsForMode) {
        window.TEUI.DOMBridge.stampInputsForMode();
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
      isViewingReferenceInputs
    );

    // Update button text
    const viewRefInputsBtn = document.getElementById(
      VIEW_REFERENCE_INPUTS_BUTTON_ID
    );
    if (viewRefInputsBtn) {
      viewRefInputsBtn.textContent = isViewingReferenceInputs
        ? BUTTON_TEXT_SHOW_TARGET_INPUTS
        : BUTTON_TEXT_HIGHLIGHT_REFERENCE_VALUES;
    }

    // This feature needs to be implemented to highlight Reference input fields
    // from ReferenceValues.js vs calculated values
    console.log(
      `[ReferenceToggle] Reference inputs view: ${isViewingReferenceInputs ? "ON" : "OFF"}`
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
          getUINameForSection(sectionId)
        );
        return Object.keys(fields);
      }

      // Fallback: Try direct section module access
      if (window.TEUI?.SectionModules?.[sectionId]?.getFields) {
        const fields = window.TEUI.SectionModules[sectionId].getFields();
        return Object.keys(fields);
      }

      console.warn(
        `[ReferenceToggle] Could not get field IDs for section ${sectionId}`
      );
      return [];
    } catch (error) {
      console.error(
        `[ReferenceToggle] Error getting field IDs for ${sectionId}:`,
        error
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
   * HELPER: Apply mirror highlighting to fields in Reference model
   * @param {Array<string>} fieldIds - Array of field IDs that were copied
   * @param {string} mode - Mirror mode: 'geometry', 'geometry-plus-code', 'all'
   */
  function applyMirrorHighlights(fieldIds, mode) {
    console.log(
      `[ReferenceToggle] 🎨 Applying mirror highlights to ${fieldIds.length} fields (mode: ${mode})`
    );

    // Small delay to ensure DOM is updated after setValue calls
    setTimeout(() => {
      let highlightCount = 0;
      let notFoundCount = 0;
      const notFoundFields = [];

      fieldIds.forEach(fieldId => {
        // Skip d_13 (never copied)
        if (fieldId === "d_13") return;

        // Get field classification
        const classification = getFieldClassification(fieldId);
        if (!classification) {
          // Field not in classification map - skip
          console.warn(
            `[ReferenceToggle] Field ${fieldId} not in G/C/A classification map`
          );
          return;
        }

        // Determine if this field should be highlighted based on mode
        let shouldHighlight = false;
        if (mode === "geometry") {
          shouldHighlight = classification === "G";
        } else if (mode === "geometry-plus-code") {
          shouldHighlight = classification === "G" || classification === "C";
        } else if (mode === "all") {
          shouldHighlight = true; // All fields (G + C + A)
        }

        if (!shouldHighlight) return;

        // Try multiple selector strategies to find the field element
        let element = null;

        // Strategy 1: Direct data-field-id attribute (most reliable)
        const selectors = [
          `[data-field-id="ref_${fieldId}"]`,
          `[data-field-id="${fieldId}"]`,
        ];

        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            // Found element(s) - highlight all (input, container, etc.)
            elements.forEach(el => {
              el.classList.add("mirror-highlight");
              highlightCount++;
            });
            element = elements[0];
            break;
          }
        }

        // Strategy 2: Find input/select/textarea by name attribute
        if (!element) {
          const nameSelectors = [
            `input[name="ref_${fieldId}"]`,
            `select[name="ref_${fieldId}"]`,
            `textarea[name="ref_${fieldId}"]`,
          ];
          for (const selector of nameSelectors) {
            element = document.querySelector(selector);
            if (element) {
              element.classList.add("mirror-highlight");
              // Also highlight parent td if it exists
              const td = element.closest("td");
              if (td) {
                td.classList.add("mirror-highlight");
              }
              highlightCount++;
              break;
            }
          }
        }

        if (!element) {
          notFoundCount++;
          notFoundFields.push(fieldId);
        }
      });

      console.log(
        `[ReferenceToggle] ✨ Applied ${highlightCount} mirror highlights`
      );

      if (notFoundCount > 0) {
        console.warn(
          `[ReferenceToggle] ⚠️  Could not find DOM elements for ${notFoundCount} fields`
        );
        if (notFoundFields.length <= 10) {
          console.warn(
            `[ReferenceToggle] Not found: [${notFoundFields.join(", ")}]`
          );
        }
      }

      // Setup one-time removal listener
      if (highlightCount > 0) {
        setupHighlightRemovalListener();
      }
    }, 300); // 300ms delay to ensure Pattern A section UIs have refreshed
  }

  /**
   * HELPER: Setup one-time listener to remove highlights on next calculation
   * Highlights persist until user edits a field (triggering recalculation)
   */
  function setupHighlightRemovalListener() {
    // Remove any existing listener
    if (window.TEUI.ReferenceToggle._highlightRemovalHandler) {
      if (window.TEUI?.Clock) {
        // Try to remove from Clock if it exists
        window.TEUI.Clock._calculationCompleteCallbacks = (
          window.TEUI.Clock._calculationCompleteCallbacks || []
        ).filter(
          cb => cb !== window.TEUI.ReferenceToggle._highlightRemovalHandler
        );
      }
      window.TEUI.ReferenceToggle._highlightRemovalHandler = null;
    }

    // Create new handler
    const removeHighlights = function () {
      console.log(
        "[ReferenceToggle] Calculation complete - removing mirror highlights"
      );

      const highlightedElements =
        document.querySelectorAll(".mirror-highlight");
      highlightedElements.forEach(el => {
        // Add fade-out class for smooth transition
        el.classList.add("mirror-highlight-fade-out");
        // Remove highlight class after animation
        setTimeout(() => {
          el.classList.remove("mirror-highlight");
          el.classList.remove("mirror-highlight-fade-out");
        }, 300);
      });

      // Remove this callback after firing once
      if (window.TEUI?.Clock?._calculationCompleteCallbacks) {
        window.TEUI.Clock._calculationCompleteCallbacks =
          window.TEUI.Clock._calculationCompleteCallbacks.filter(
            cb => cb !== removeHighlights
          );
      }
      window.TEUI.ReferenceToggle._highlightRemovalHandler = null;
    };

    // Store handler reference for cleanup
    window.TEUI.ReferenceToggle._highlightRemovalHandler = removeHighlights;

    // Hook into Clock's calculation complete event (if available)
    if (window.TEUI?.Clock) {
      // Initialize callbacks array if it doesn't exist
      if (!window.TEUI.Clock._calculationCompleteCallbacks) {
        window.TEUI.Clock._calculationCompleteCallbacks = [];
      }
      window.TEUI.Clock._calculationCompleteCallbacks.push(removeHighlights);
      console.log(
        "[ReferenceToggle] Highlight removal listener installed - highlights will clear on next calculation"
      );
    } else {
      // Fallback: If Clock not available, use StateManager listener as proxy for field changes
      console.warn(
        "[ReferenceToggle] Clock not available - using StateManager listener as fallback"
      );
      const stateChangeHandler = () => {
        removeHighlights();
        window.TEUI.StateManager.removeListener(stateChangeHandler);
      };
      window.TEUI.StateManager.addListener(stateChangeHandler);
    }
  }

  /**
   * Helper: Determine if a field should be copied based on mirror mode
   * @param {string} fieldId - Field identifier (e.g., 'd_13', 'f_85')
   * @param {string} mode - Mirror mode: 'geometry', 'geometry-plus-code', 'all'
   * @returns {boolean} - True if field should be copied
   */
  function shouldCopyFieldForMode(fieldId, mode) {
    // Explicit exclusions for ALL modes
    if (fieldId === "d_13") return false; // Building standard - user sets independently

    // Mode: 'all' - copy everything except d_13
    if (mode === "all") return true;

    // Mode: 'geometry' or 'geometry-plus-code' - exclude performance fields (Category 2)
    // Performance field patterns based on CSV export analysis
    const performancePatterns = [
      /^[a-z]_(39|41)$/, // Typology selection, User modelled embodied carbon (code/performance features)
      /^[a-z]_(51|52|53)$/, // DHW system type, efficiency, DWHR
      /^[a-z]_(66|67)$/, // Lighting density, equipment efficiency
      /^f_(73|74|75|76|77|78)$/, // SHGC values (window/door solar heat gain)
      /^[a-z]_80$/, // Gains utilization factor (n-Factor)
      /^f_(85|86|87|94|95)$/, // RSI values (thermal resistance)
      /^g_(88|89|90|91|92|93)$/, // U-values (window/door thermal transmittance)
      /^[a-z]_97$/, // Thermal bridge penalty
      /^[a-z]_(113|115|116|118|119|120)$/, // Equipment types and performance
    ];

    // Check if field matches any performance pattern
    for (const pattern of performancePatterns) {
      if (pattern.test(fieldId)) {
        return false; // Exclude from geometry modes
      }
    }

    // Default: include in geometry modes
    return true;
  }

  /**
   * HELPER: Refresh Pattern A section UIs after bulk StateManager operations
   * Uses same pattern as FileHandler.js:488-520
   */
  function refreshPatternAUIs() {
    const patternASections = [
      "sect02",
      "sect03",
      "sect04",
      "sect05",
      "sect06",
      "sect07",
      "sect08",
      "sect09",
      "sect10",
      "sect11",
      "sect12",
      "sect13",
      "sect14",
      "sect15",
    ];

    // Graph handles all display updates via Calculator.calculateAll()
    if (window.TEUI?.Calculator?.calculateAll) {
      window.TEUI.Calculator.calculateAll();
    }
    console.log("[ReferenceToggle] ✅ Pattern A section UIs refreshed");
  }

  /**
   * 1. Mirror Geometry: Copy ONLY geometric/configuration fields from Target to Reference
   * Excludes performance parameters (RSI values, equipment efficiencies, etc.)
   * Use case: "Same building shape, different performance specs"
   *
   * REWRITTEN 2025-11-27: Uses FileHandler/StateManager pattern instead of section-level operations
   */
  function mirrorGeometry() {
    try {
      console.log("[ReferenceToggle] 🔗 Mirror Geometry: Starting...");

      // Get all field IDs using FieldManager (proven approach)
      const allFieldsObj =
        window.TEUI?.FieldManager?.getAllUserEditableFields?.() || {};
      const allFields = Object.keys(allFieldsObj); // Convert object to array of field IDs

      if (allFields.length === 0) {
        console.error(
          "[ReferenceToggle] Could not get field list from FieldManager"
        );
        return;
      }

      // Filter to geometry fields only (exclude performance fields)
      const geometryFields = allFields.filter(fieldId => {
        return shouldCopyFieldForMode(fieldId, "geometry");
      });

      const skippedCount = allFields.length - geometryFields.length;
      console.log(
        `[ReferenceToggle] Copying ${geometryFields.length} geometry fields, skipping ${skippedCount} performance fields`
      );

      // QUARANTINE START - Use FileHandler pattern
      window.TEUI.StateManager.muteListeners();

      try {
        let copiedCount = 0;
        geometryFields.forEach(fieldId => {
          if (fieldId === "d_13") return; // Never copy building standard

          const targetValue = window.TEUI.StateManager.getValue(fieldId);
          if (
            targetValue !== null &&
            targetValue !== undefined &&
            targetValue !== ""
          ) {
            // Write to Reference state with ref_ prefix
            window.TEUI.StateManager.setValue(
              `ref_${fieldId}`,
              targetValue,
              "mirror"
            );
            copiedCount++;
          }
        });

        console.log(
          `[ReferenceToggle] ✅ Copied ${copiedCount} geometry values to Reference state via StateManager`
        );

        // Sync Pattern A sections (critical for UI updates!)
        // ⚠️ CRITICAL: Copy operations must sync BOTH states (skipTargetSync=false, skipReferenceSync=false)
        // This is different from Set Values which is mode-aware. Copy explicitly writes ref_* fields
        // and needs both TargetState (unchanged) and ReferenceState (updated) to sync properly.
        if (window.TEUI?.FileHandler?.syncPostImportUI) {
          window.TEUI.FileHandler.syncPostImportUI(false, false, false); // skipAreaSync, skipTargetSync, skipReferenceSync
        } else {
          console.warn(
            "[ReferenceToggle] FileHandler.syncPostImportUI not available - UI may not update"
          );
        }
      } finally {
        // QUARANTINE END - Always unmute
        window.TEUI.StateManager.unmuteListeners();
      }

      // Clean recalculation
      if (window.TEUI?.Calculator?.calculateAll) {
        window.TEUI.Calculator.calculateAll();
      }
      if (window.TEUI?.DOMBridge?.stampInputsForMode) {
        window.TEUI.DOMBridge.stampInputsForMode();
      }

      // Refresh Pattern A section UIs
      refreshPatternAUIs();

      // Apply highlights
      applyMirrorHighlights(geometryFields, "geometry");

      console.log("🔗 Mirror Geometry: Complete");
      console.log(
        "✅ Geometry fields copied (areas, volumes, location, occupancy)"
      );
      console.log(
        "❌ Performance fields skipped (RSI values, equipment efficiencies)"
      );
    } catch (error) {
      console.error("[ReferenceToggle] Mirror Geometry failed:", error);
      // Ensure listeners are unmuted even on error
      if (window.TEUI?.StateManager?.unmuteListeners) {
        window.TEUI.StateManager.unmuteListeners();
      }
    }
  }

  /**
   * 2. Mirror Geometry + Code: Copy geometry fields, then overlay ReferenceValues.js
   * Use case: "Compare my design vs building code minimums" (most common)
   *
   * REWRITTEN 2025-11-27: Uses FileHandler/StateManager pattern instead of section-level operations
   */
  function mirrorGeometryPlusCode() {
    try {
      console.log("[ReferenceToggle] 🔗 Mirror Geometry + Code: Starting...");

      // Step 1: Copy geometry fields (same as mirrorGeometry, but don't call it to track all fields for highlighting)
      const allFieldsObj =
        window.TEUI?.FieldManager?.getAllUserEditableFields?.() || {};
      const allFields = Object.keys(allFieldsObj); // Convert object to array of field IDs

      if (allFields.length === 0) {
        console.error(
          "[ReferenceToggle] Could not get field list from FieldManager"
        );
        return;
      }

      const geometryFields = allFields.filter(fieldId => {
        return shouldCopyFieldForMode(fieldId, "geometry");
      });

      console.log(
        `[ReferenceToggle] Step 1: Copying ${geometryFields.length} geometry fields`
      );

      // QUARANTINE START
      window.TEUI.StateManager.muteListeners();

      try {
        // Copy geometry fields
        let geomCopiedCount = 0;
        geometryFields.forEach(fieldId => {
          if (fieldId === "d_13") return; // Never copy building standard

          const targetValue = window.TEUI.StateManager.getValue(fieldId);
          if (
            targetValue !== null &&
            targetValue !== undefined &&
            targetValue !== ""
          ) {
            window.TEUI.StateManager.setValue(
              `ref_${fieldId}`,
              targetValue,
              "mirror"
            );
            geomCopiedCount++;
          }
        });

        console.log(
          `[ReferenceToggle] ✅ Copied ${geomCopiedCount} geometry values`
        );

        // Step 2: Overlay ReferenceValues.js code minimums
        const standard =
          window.TEUI.StateManager.getValue("ref_d_13") ||
          window.TEUI.StateManager.getValue("d_13") ||
          "OBC SB12 3.1.1.2.C1";

        const refValues = window.TEUI?.ReferenceValues?.[standard] || {};

        console.log(
          `[ReferenceToggle] Step 2: Applying code minimums from "${standard}"`
        );

        let codeCopiedCount = 0;
        Object.entries(refValues).forEach(([fieldId, value]) => {
          window.TEUI.StateManager.setValue(
            `ref_${fieldId}`,
            value,
            "reference"
          );
          codeCopiedCount++;
        });

        console.log(
          `[ReferenceToggle] ✅ Applied ${codeCopiedCount} code minimum values`
        );

        // Sync Pattern A sections
        // ⚠️ CRITICAL: Copy operations must sync BOTH states (skipTargetSync=false, skipReferenceSync=false)
        // This is different from Set Values which is mode-aware. Copy explicitly writes ref_* fields
        // and needs both TargetState (unchanged) and ReferenceState (updated) to sync properly.
        if (window.TEUI?.FileHandler?.syncPostImportUI) {
          window.TEUI.FileHandler.syncPostImportUI(false, false, false); // skipAreaSync, skipTargetSync, skipReferenceSync
        }
      } finally {
        // QUARANTINE END - Always unmute
        window.TEUI.StateManager.unmuteListeners();
      }

      // Clean recalculation
      if (window.TEUI?.Calculator?.calculateAll) {
        window.TEUI.Calculator.calculateAll();
      }
      if (window.TEUI?.DOMBridge?.stampInputsForMode) {
        window.TEUI.DOMBridge.stampInputsForMode();
      }

      // Refresh Pattern A section UIs
      refreshPatternAUIs();

      // Highlight G + C fields
      applyMirrorHighlights(allFields, "geometry-plus-code");

      console.log("🔗 Mirror Geometry + Code: Complete");
      console.log(
        "📋 Reference model now uses Target geometry with code minimum performance"
      );
    } catch (error) {
      console.error("[ReferenceToggle] Mirror Geometry + Code failed:", error);
      // Ensure listeners are unmuted even on error
      if (window.TEUI?.StateManager?.unmuteListeners) {
        window.TEUI.StateManager.unmuteListeners();
      }
    }
  }

  /**
   * 3. Mirror All Inputs: Copy ALL fields from Target to Reference (perfect clone)
   * Excludes only d_13 (building standard - user sets independently)
   * Use case: "Start with identical models, then tweak one specific parameter"
   *
   * REWRITTEN 2025-11-27: Uses FileHandler/StateManager pattern instead of section-level operations
   */
  function mirrorAllInputs() {
    try {
      console.log("[ReferenceToggle] 🔗 Mirror All Inputs: Starting...");

      // Get all field IDs using FieldManager (proven approach)
      const allFieldsObj =
        window.TEUI?.FieldManager?.getAllUserEditableFields?.() || {};
      const allFields = Object.keys(allFieldsObj); // Convert object to array of field IDs

      if (allFields.length === 0) {
        console.error(
          "[ReferenceToggle] Could not get field list from FieldManager"
        );
        return;
      }

      console.log(
        `[ReferenceToggle] Copying ${allFields.length} fields (excluding d_13)`
      );

      // QUARANTINE START - Use FileHandler pattern
      window.TEUI.StateManager.muteListeners();

      try {
        let copiedCount = 0;
        allFields.forEach(fieldId => {
          if (fieldId === "d_13") return; // Never copy building standard

          const targetValue = window.TEUI.StateManager.getValue(fieldId);
          if (
            targetValue !== null &&
            targetValue !== undefined &&
            targetValue !== ""
          ) {
            // Write to Reference state with ref_ prefix
            window.TEUI.StateManager.setValue(
              `ref_${fieldId}`,
              targetValue,
              "mirror"
            );
            copiedCount++;
          }
        });

        console.log(
          `[ReferenceToggle] ✅ Perfect clone: ${copiedCount} fields copied to Reference state via StateManager`
        );

        // Sync Pattern A sections (critical for UI updates!)
        // ⚠️ CRITICAL: Copy operations must sync BOTH states (skipTargetSync=false, skipReferenceSync=false)
        // This is different from Set Values which is mode-aware. Copy explicitly writes ref_* fields
        // and needs both TargetState (unchanged) and ReferenceState (updated) to sync properly.
        if (window.TEUI?.FileHandler?.syncPostImportUI) {
          window.TEUI.FileHandler.syncPostImportUI(false, false, false); // skipAreaSync, skipTargetSync, skipReferenceSync
        } else {
          console.warn(
            "[ReferenceToggle] FileHandler.syncPostImportUI not available - UI may not update"
          );
        }
      } finally {
        // QUARANTINE END - Always unmute
        window.TEUI.StateManager.unmuteListeners();
      }

      // Clean recalculation
      if (window.TEUI?.Calculator?.calculateAll) {
        window.TEUI.Calculator.calculateAll();
      }
      if (window.TEUI?.DOMBridge?.stampInputsForMode) {
        window.TEUI.DOMBridge.stampInputsForMode();
      }

      // Refresh Pattern A section UIs
      refreshPatternAUIs();

      // Apply highlights to all fields
      applyMirrorHighlights(allFields, "all");

      console.log("🔗 Mirror All Inputs: Complete");
      console.log(
        "✅ Perfect clone created - Reference model is now identical to Target model"
      );
      console.log(
        "ℹ️  Excluded: d_13 (building standard) - user can set Reference standard independently"
      );
    } catch (error) {
      console.error("[ReferenceToggle] Mirror All Inputs failed:", error);
      // Ensure listeners are unmuted even on error
      if (window.TEUI?.StateManager?.unmuteListeners) {
        window.TEUI.StateManager.unmuteListeners();
      }
    }
  }

  /**
   * LEGACY: Mirror Target - Copy all Target values to Reference state
   * @deprecated Use mirrorAllInputs() instead
   * Reads target values from SM and writes them as ref_ keys.
   */
  function mirrorTarget() {
    try {
      const SM = window.TEUI?.StateManager;
      if (!SM) return;

      let totalFieldsCopied = 0;
      const sectionIds = [
        "sect02", "sect03", "sect04", "sect05", "sect06", "sect07",
        "sect08", "sect09", "sect10", "sect11", "sect12", "sect13",
        "sect14", "sect15", "sect16", "sect19",
      ];

      sectionIds.forEach(id => {
        const fieldIds = getFieldIdsForSection(id);
        fieldIds.forEach(fieldId => {
          const value = SM.getValue(fieldId);
          if (value !== null && value !== undefined && value !== "") {
            SM.setValue(`ref_${fieldId}`, value, "mirrored");
            totalFieldsCopied++;
          }
        });
      });

      console.log(
        `Mirror Target: Copied ${totalFieldsCopied} fields to ref_ keys`
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
      const SM = window.TEUI?.StateManager;
      if (!SM) return;

      const standard = SM.getValue("d_13") || "OBC SB12 3.1.1.2.C1";
      const refValues = window.TEUI?.ReferenceValues?.[standard] || {};

      // First execute Mirror Target to copy all Target values
      mirrorTarget();

      // Then overlay ReferenceValues subset for building code compliance
      let totalOverlayFields = 0;
      const sectionIds = [
        "sect02", "sect03", "sect04", "sect05", "sect06", "sect07",
        "sect08", "sect09", "sect10", "sect11", "sect12", "sect13",
        "sect14", "sect15", "sect16", "sect19",
      ];

      sectionIds.forEach(id => {
        const fieldIds = getFieldIdsForSection(id);
        Object.entries(refValues).forEach(([fieldId, value]) => {
          if (fieldIds.includes(fieldId)) {
            SM.setValue(`ref_${fieldId}`, value, "reference-standard");
            totalOverlayFields++;
          }
        });
      });

      console.log(
        `Mirror Target + Reference: Applied ${totalOverlayFields} reference standard values`
      );
    } catch (error) {
      console.error(
        "[ReferenceToggle] Mirror Target + Reference failed:",
        error
      );
    }
  }

  /**
   * 3. Reference Independence: No setup needed - sections already independent
   */
  function enableReferenceIndependence() {
    console.log(
      "🔓 Reference Independence: Sections are already independent by default"
    );
    // No action needed - dual-state architecture already provides independence
  }

  return {
    initialize,
    isReferenceMode,
    getCompareValue,
    toggleReferenceDisplay,
    switchAllSectionsMode, // Expose for external use
    // ✅ NEW: Three mirror functions (2025-11-27)
    mirrorGeometry, // Copy geometry/configuration only
    mirrorGeometryPlusCode, // Copy geometry + overlay ReferenceValues.js
    mirrorAllInputs, // Copy everything (perfect clone)
    // LEGACY: Old mirror functions (deprecated, keeping for backwards compatibility)
    mirrorTarget, // @deprecated Use mirrorAllInputs() instead
    mirrorTargetWithReference, // @deprecated Use mirrorGeometryPlusCode() instead
    enableReferenceIndependence,
    // ✅ NEW: Expose for Key Values header toggle
    getCurrentMode, // Get current global mode
    switchMode, // Switch all sections to a mode
  };
})();
