/**
 * 4012-Section01.js
 * Key Values (Section 1) module for TEUI Calculator 4.012
 */

window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

window.TEUI.SectionModules.sect01 = (function () {
  // Animation state tracking
  const activeAnimations = {}; // Stores { fieldId: animationFrameId }

  //==========================================================================
  // PART 1: FIELD DEFINITIONS
  //==========================================================================

  // Field definitions primarily for StateManager tracking and reference
  const fields = {
    // T.1 Lifetime Carbon
    e_6: {
      type: "calculated",
      label: "Lifetime Carbon Ref",
      defaultValue: "24.4",
      section: "keyValues",
    },
    h_6: {
      type: "calculated",
      label: "Lifetime Carbon Target",
      defaultValue: "11.7",
      section: "keyValues",
    },
    k_6: {
      type: "calculated",
      label: "Lifetime Carbon Actual",
      defaultValue: "11.7",
      section: "keyValues",
    },
    // T.2 Annual Carbon
    e_8: {
      type: "calculated",
      label: "Annual Carbon Ref",
      defaultValue: "17.4",
      section: "keyValues",
    },
    h_8: {
      type: "calculated",
      label: "Annual Carbon Target",
      defaultValue: "4.7",
      section: "keyValues",
    },
    k_8: {
      type: "calculated",
      label: "Annual Carbon Actual",
      defaultValue: "4.8",
      section: "keyValues",
    },
    j_8: {
      type: "calculated",
      label: "Annual Carbon %",
      defaultValue: "14%",
      section: "keyValues",
    },
    // T.3 TEUI
    e_10: {
      type: "calculated",
      label: "TEUI Ref",
      defaultValue: "341.2",
      section: "keyValues",
    },
    f_10: {
      type: "calculated",
      label: "TEUI Ref Tier",
      defaultValue: "tier1",
      section: "keyValues",
    },
    h_10: {
      type: "calculated",
      label: "TEUI Target",
      defaultValue: "93.0",
      section: "keyValues",
    },
    i_10: {
      type: "calculated",
      label: "TEUI Target Tier",
      defaultValue: "tier3",
      section: "keyValues",
    },
    j_10: {
      type: "calculated",
      label: "TEUI %",
      defaultValue: "41%",
      section: "keyValues",
    },
    k_10: {
      type: "calculated",
      label: "TEUI Actual",
      defaultValue: "93.1",
      section: "keyValues",
    },
    // Inputs (Placeholder definitions for clarity)
    f_32: {
      type: "calculated",
      label: "Source: Actual Energy",
      defaultValue: "0",
      section: "keyValues",
    },
    j_32: {
      type: "calculated",
      label: "Source: Target Energy",
      defaultValue: "0",
      section: "keyValues",
    },

    i_41: {
      type: "calculated",
      label: "Source: Embodied Carbon",
      defaultValue: "0",
      section: "keyValues",
    },

    k_32: {
      type: "calculated",
      label: "Source: Target Emissions",
      defaultValue: "0",
      section: "keyValues",
    },
    g_32: {
      type: "calculated",
      label: "Source: Actual Emissions",
      defaultValue: "0",
      section: "keyValues",
    },
    d_13: {
      type: "calculated",
      label: "Reference Standard",
      defaultValue: "",
      section: "keyValues",
    },
    // Percentage fields (M column)
    m_6: {
      type: "calculated",
      label: "Lifetime Carbon %",
      defaultValue: "N/A",
      section: "keyValues",
    },
    m_8: {
      type: "calculated",
      label: "Annual Carbon %",
      defaultValue: "14%",
      section: "keyValues",
    },
    m_10: {
      type: "calculated",
      label: "TEUI %",
      defaultValue: "41%",
      section: "keyValues",
    },
  };

  //==========================================================================
  // PART 2: CUSTOM STYLING
  //==========================================================================

  const customCSS = `
        #keyValues {
            margin-bottom: 8px;
        }
        #keyValues .section-header {
            height: 40px !important;
            min-height: 40px !important;
            max-height: 40px !important;
            display: flex !important;
            align-items: center !important;
        }
        #keyValues .section-header .section-controls,
        #keyValues .section-header .excel-loader {
            display: flex;
            align-items: center;
            margin: 0 !important;
        }
        #keyValues .section-header #feedback-area {
            display: flex;
            align-items: center;
            line-height: 1;
            margin: 0;
            padding: 0;
        }
        #keyValues .section-header .toggle-icon {
            display: none !important;
        }
        #keyValues .section-content {
            padding: 0 !important;
        }
        .key-values-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #212529;
            font-family: Arial, sans-serif;
        }
        .key-values-table th, 
        .key-values-table td {
            border-left: none;
            border-right: none;
            padding: 5px 10px;
            vertical-align: top;
        }
        .key-values-table tr {
            border-bottom: 2px solid #212529;
            position: relative;
        }
        .key-values-header {
            background-color: #f1f1f1;
            text-align: center;
            font-weight: bold;
            font-size: 1rem;
            padding: 4px !important;
            height: 30px;
        }
        .key-values-label-cell { width: 30%; padding-left: 0 !important; }
        .key-values-ref-cell, .key-values-target-cell, .key-values-actual-cell { width: 17%; position: relative; }
        .key-values-percent-cell { width: 10%; position: relative; text-align: center; }
        .key-title-combined { font-family: "Arial Black", Gadget, sans-serif; font-size: 1.5rem; font-weight: 900; line-height: 1.1; display: block; margin-bottom: 4px; text-align: left; margin-left: 20px; }
        .key-title-id { color: #7f7f7f; margin-right: 8px; }
        .key-explanation { font-size: 0.75rem; font-weight: bold; color: #555; margin-bottom: 4px; display: block; line-height: 1.1; text-align: right; padding-right: 10px; }
        .title-explanation { font-size: 0.75rem; font-weight: bold; color: #555; display: block; line-height: 1.1; margin-left: 20px; margin-bottom: 4px; }
        .ref-explanation { color: #8B0000; opacity: 0.9; }
        .key-value { font-family: "Arial Black", Gadget, sans-serif; font-size: 2rem; font-weight: 900; line-height: 1; display: block; text-align: right; margin: 0; padding: 0; white-space: nowrap; padding-right: 10px; }
        .ref-value { color: #8B0000; }
        .percent-value { font-size: 1.3rem; color: #333; text-align: center; display: inline-block; }
        .tier-indicator { display: inline-block; font-size: 2rem; font-weight: 900; color: #777; margin-right: 8px; opacity: 0.5; vertical-align: baseline; }
        .t1-tag { color: #8B0000; }
        .t3-tag { color: #333; }
        .cost-indicator { display: inline; font-size: 0.75rem; font-weight: bold; color: #555; margin-left: 5px; }
        .ref-cost { color: #8B0000; opacity: 0.9; }
        /* Note: checkmark/warning styles now defined globally in 4011-styles.css */
        .linear-gauge-container { width: 92%; height: 12px; background-color: #f1f1f1; border-radius: 6px; overflow: hidden; margin: 6px 0 6px auto; position: relative; margin-right: 20px; }
        .linear-gauge-bar { height: 100%; width: 0%; background-color: #5bc0de; transition: width 1s ease-in-out; border-radius: 6px; }
        .gauge-excellent { background-color: #28a745; }
        .gauge-good { background-color: #5bc0de; }
        .gauge-warning { background-color: #f0ad4e; }
        .gauge-poor { background-color: #d9534f; }
        .key-title-container { display: flex; flex-direction: column; }
        .teui-warning { color: #8B0000; font-family: "Arial Black", Gadget, sans-serif; font-size: 1.5rem; font-weight: 900; }
        .key-title-mode-text {
            font-weight: bold; /* Matches Arial Black's typical boldness */
            margin-left: 8px; 
            font-size: 1.5rem; /* Match .key-title-combined */
            /* Color is inherited from .key-title-combined */
        }
        @media (max-width: 992px) { 
            .key-value { font-size: 1.7rem; } 
            .key-title-combined { font-size: 1.3rem; } 
            .key-title-mode-text { font-size: 1.3rem; }
        }
        @media (max-width: 768px) { 
            .key-value { font-size: 1.4rem; } 
            .key-title-combined { font-size: 1.1rem; } 
            .key-title-mode-text { font-size: 1.1rem; }
            .key-explanation { font-size: 0.65rem; } 
        }
    `;

  //==========================================================================
  // PART 3: DIRECT RENDERING
  //==========================================================================

  function getKeyValuesHTML() {
    return `
            <table class="key-values-table">
                <!-- Commented out for visual space (redundant subheader - saves ~35px)
                <thead><tr><th class="key-values-label-cell key-values-header">Key Values</th><th class="key-values-ref-cell key-values-header">Reference</th><th class="key-values-target-cell key-values-header">Target</th><th class="key-values-actual-cell key-values-header">Actual</th><th class="key-values-percent-cell key-values-header">%</th></tr></thead>
                -->
                <tbody>
                    <tr><td class="key-values-label-cell"><div class="key-title-container"><span class="title-explanation">Lifetime Emissions Intensity kgCO2e/m²/Service Life (Yrs)</span><span class="key-title-combined" id="title-t1"><span class="key-title-id">T.1</span>Lifetime Carbon <span class="key-title-mode-text"></span></span><div id="lifetime-carbon-gauge" class="linear-gauge-container"><div class="linear-gauge-bar"></div></div></div></td><td class="key-values-ref-cell" data-field-id="e_6"><span class="key-explanation ref-explanation">Reference 100% (Baseline)</span><span class="key-value ref-value">24.4</span></td><td class="key-values-target-cell" data-field-id="h_6"><span class="key-explanation">Targeted (Design) 71% Reduction</span><span class="key-value">11.7</span></td><td class="key-values-actual-cell" data-field-id="k_6"><span class="key-explanation">Actual (Utility Bills)</span><span class="key-value">11.7</span></td><td class="key-values-percent-cell" data-field-id="m_6"><span class="percent-value">N/A</span></td></tr>
                    <tr><td class="key-values-label-cell"><div class="key-title-container"><span class="title-explanation">Annual Operational Emissions Intensity kgCO2e/m²</span><span class="key-title-combined" id="title-t2"><span class="key-title-id">T.2</span>Annual Carbon <span class="key-title-mode-text"></span></span><div id="annual-carbon-gauge" class="linear-gauge-container"><div class="linear-gauge-bar"></div></div></div></td><td class="key-values-ref-cell" data-field-id="e_8"><span class="key-explanation ref-explanation">Reference 100% (Baseline)</span><span class="key-value ref-value">17.4</span></td><td class="key-values-target-cell" data-field-id="h_8"><span class="key-explanation">Targeted (Design) 86% Reduction</span><span class="key-value">4.7</span></td><td class="key-values-actual-cell" data-field-id="k_8"><span class="key-explanation">Actual (Utility Bills)</span><span class="key-value">4.8</span></td><td class="key-values-percent-cell" data-field-id="m_8"><span class="percent-value">14%</span></td></tr>
                    <tr><td class="key-values-label-cell"><div class="key-title-container"><span class="title-explanation">Total Annual Operational Energy Use Intensity kWh/m²/yr</span><span class="key-title-combined" id="title-t3"><span class="key-title-id">T.3</span>TEUI <span class="key-title-mode-text"></span></span><div id="teui-gauge" class="linear-gauge-container"><div class="linear-gauge-bar"></div></div></div></td><td class="key-values-ref-cell" data-field-id="e_10"><span class="key-explanation ref-explanation">Reference 100% (Baseline) <span class="cost-indicator ref-cost"></span></span><span class="key-value ref-value"><span class="tier-indicator t1-tag">tier1</span> <span class="numeric-value">341.2</span></span></td><td class="key-values-target-cell" data-field-id="h_10"><span class="key-explanation">Targeted (Design) 59% Reduction <span class="cost-indicator"></span></span><span class="key-value" data-tier-field="i_10"><span class="tier-indicator t3-tag">tier3</span> 93.0</span></td><td class="key-values-actual-cell" data-field-id="k_10"><span class="key-explanation">Actual (Utility Bills) <span class="cost-indicator"></span></span><span class="key-value">93.1</span></td><td class="key-values-percent-cell" data-field-id="m_10"><span class="percent-value">41%</span></td></tr>
                </tbody>
            </table>
        `;
  }

  function renderKeyValuesSection() {
    const sectionElement = document.getElementById("keyValues");
    const contentContainer = sectionElement?.querySelector(".section-content");
    if (contentContainer) {
      contentContainer.innerHTML = getKeyValuesHTML();
    }
  }

  //==========================================================================
  // PART 4: CONSUMER SECTION PATTERN - CLEAN EXTERNAL DEPENDENCIES
  //==========================================================================

  /**
   * DUAL-STATE compliant helper for external dependencies
   * ✅ CONSUMER SECTION PATTERN: Clean external dependency pattern
   * Upstream sections handle Target/Reference internally, S01 reads results
   */
  function getGlobalNumericValue(fieldId) {
    const rawValue = window.TEUI?.StateManager?.getValue(fieldId);
    return window.TEUI.parseNumeric(rawValue) || 0;
  }

  /**
   * Standardized helper function to set calculated values with proper formatting.
   * CRITICAL: Preserves Section 01's custom styling and HTML structure
   * @param {string} fieldId - The field ID to update
   * @param {number} rawValue - The raw numeric value to store
   * @param {string} formatType - The format type for display (e.g., 'number-1dp', 'number-2dp-comma')
   */
  function setCalculatedValue(
    fieldId,
    rawValue,
    formatType = "number-2dp-comma",
  ) {
    // Store raw value as string in StateManager for precision
    if (window.TEUI?.StateManager?.setValue) {
      const valueToStore = isFinite(rawValue) ? rawValue.toString() : "N/A";

      // ✅ CONSUMER SECTION PATTERN: Only write global unprefixed values
      // S01 must NOT contaminate target_/ref_ state - upstream sections handle that
      window.TEUI.StateManager.setValue(fieldId, valueToStore, "calculated");

      // console.log(`S01: ✅ DUAL UPDATE - ${fieldId}: target_${fieldId}=${valueToStore} AND ref_${fieldId}=${valueToStore} AND global ${fieldId}=${valueToStore}`);
    }

    // CRITICAL: Use updateDisplayValue to preserve custom styling instead of direct DOM manipulation
    // This maintains tier indicators, styling classes, and visual design
    let formattedValue;
    if (rawValue === "N/A" || !isFinite(rawValue)) {
      formattedValue = "N/A";
    } else {
      formattedValue =
        window.TEUI?.formatNumber?.(rawValue, formatType) ??
        rawValue.toString();
    }

    // Use the specialized updateDisplayValue function that preserves Section 01's styling
    updateDisplayValue(fieldId, formattedValue);
  }

  //==========================================================================
  // PURE DISPLAY CONSUMER: Direct Math from Upstream Values
  //==========================================================================

  // Removed calculation engines - S01 is now a pure display consumer

  //==========================================================================
  // SUPPLEMENTARY CALCULATIONS (Percentages & Explanations)
  //==========================================================================

  function calculatePercentagesAndExplanations(
    e_6,
    e_8,
    e_10,
    h_6,
    h_8,
    h_10,
    k_6,
    k_8,
    k_10,
    useType,
  ) {
    // ========================================
    // M_6 CALCULATION: Lifetime Carbon % (Excel formula)
    // M6=IF(I$40="N/A","N/A",IF(D15="BR18 (Denmark)",((I$41/H13)+K8)/12,IF(D15="IPCC AR6 EPC", 3.39, IF(D15="IPCC AR6 EA", 4.07,IF(D15="TGS4",((I$41/I39)),"N/A")))))
    // ========================================

    let m_6_result = "N/A";

    // Get dependencies from StateManager (Target state values only - S01 is state agnostic)
    const i_40 = window.TEUI?.StateManager?.getValue("i_40") || ""; // From S05
    const d_15 = window.TEUI?.StateManager?.getValue("d_15") || ""; // Carbon standard from S02
    const i_41 =
      window.TEUI?.parseNumeric?.(
        window.TEUI?.StateManager?.getValue("i_41"),
        0,
      ) ?? 0; // Embodied carbon from S05
    const h_13 =
      window.TEUI?.parseNumeric?.(
        window.TEUI?.StateManager?.getValue("h_13"),
        50,
      ) ?? 50; // Service life from S02
    const k_8_calc = useType === "Utility Bills" && !isNaN(k_8) ? k_8 : h_8; // Annual carbon (calculated above)
    const i_39 =
      window.TEUI?.parseNumeric?.(
        window.TEUI?.StateManager?.getValue("i_39"),
        0,
      ) ?? 0; // TGS4 value from S05

    // Excel formula logic: IF(I$40="N/A","N/A",...)
    if (i_40 === "N/A") {
      m_6_result = "N/A";
    } else {
      // IF(D15="BR18 (Denmark)",((I$41/H13)+K8)/12,...)
      if (d_15 === "BR18 (Denmark)") {
        if (h_13 > 0) {
          m_6_result = (i_41 / h_13 + k_8_calc) / 12;
          m_6_result = Math.round(m_6_result * 100) / 100; // Round to 2 decimal places
        }
      }
      // IF(D15="IPCC AR6 EPC", 3.39, ...)
      else if (d_15 === "IPCC AR6 EPC") {
        m_6_result = 3.39;
      }
      // IF(D15="IPCC AR6 EA", 4.07,...)
      else if (d_15 === "IPCC AR6 EA") {
        m_6_result = 4.07;
      }
      // IF(D15="TGS4",((I$41/I39)),"N/A")
      else if (d_15 === "TGS4") {
        if (i_39 > 0) {
          m_6_result = i_41 / i_39;
          m_6_result = Math.round(m_6_result * 100) / 100; // Round to 2 decimal places
        } else {
          m_6_result = "N/A";
        }
      }
      // Default case
      else {
        m_6_result = "N/A";
      }
    }

    // ========================================
    // M_8 and M_10 CALCULATION: Simple relationship to j_8/j_10
    // m_8 = 100% - j_8 (remaining percentage of reference)
    // m_10 = 100% - j_10 (remaining percentage of reference)
    // ========================================

    // Corrected calculations for j_8 and j_10 (reduction percentages)
    let annualCarbonReduction = 0;
    if (e_8 !== 0) {
      const valueToUse = useType === "Utility Bills" && !isNaN(k_8) ? k_8 : h_8;
      annualCarbonReduction = Math.round((1 - valueToUse / e_8) * 100); // REDUCTION percentage
    }

    let teuiReduction = 0;
    if (e_10 !== 0) {
      const valueToUse =
        useType === "Utility Bills" && !isNaN(k_10) ? k_10 : h_10;
      teuiReduction = Math.round((1 - valueToUse / e_10) * 100); // REDUCTION percentage
    }

    // Calculate m_8 and m_10 as complement of j_8 and j_10
    const m_8_result = 100 - annualCarbonReduction; // Remaining % of reference
    const m_10_result = 100 - teuiReduction; // Remaining % of reference

    // Format the percentage values (move outside StateManager block to fix scoping)
    const m_6_formatted =
      typeof m_6_result === "number"
        ? (window.TEUI?.formatNumber?.(m_6_result, "percent-0dp") ??
          `${Math.round(m_6_result * 100)}%`)
        : m_6_result;
    const m_8_formatted = `${m_8_result}%`;
    const m_10_formatted = `${m_10_result}%`;

    // Update percentages in StateManager
    if (window.TEUI?.StateManager) {
      const currentJ8 = window.TEUI.StateManager.getValue("j_8");
      const currentJ10 = window.TEUI.StateManager.getValue("j_10");
      const newJ8 = `${annualCarbonReduction}%`;
      const newJ10 = `${teuiReduction}%`;

      if (currentJ8 !== newJ8) {
        window.TEUI.StateManager.setValue("j_8", newJ8, "calculated");
      }
      if (currentJ10 !== newJ10) {
        window.TEUI.StateManager.setValue("j_10", newJ10, "calculated");
      }

      const currentM6 = window.TEUI.StateManager.getValue("m_6");
      const currentM8 = window.TEUI.StateManager.getValue("m_8");
      const currentM10 = window.TEUI.StateManager.getValue("m_10");

      if (currentM6 !== m_6_formatted) {
        window.TEUI.StateManager.setValue("m_6", m_6_formatted, "calculated");
      }
      if (currentM8 !== m_8_formatted) {
        window.TEUI.StateManager.setValue("m_8", m_8_formatted, "calculated");
      }
      if (currentM10 !== m_10_formatted) {
        window.TEUI.StateManager.setValue("m_10", m_10_formatted, "calculated");
      }
    }

    // Update all percentage displays with checkmark/X logic
    updatePercentageFieldWithCheckmark("m_6", m_6_formatted);
    updatePercentageFieldWithCheckmark("m_8", m_8_formatted);
    updatePercentageFieldWithCheckmark("m_10", m_10_formatted);

    // Update explanation text for Target columns
    updateExplanationText("h_6", h_6, e_6);
    updateExplanationText("h_8", h_8, e_8);
    updateExplanationText("h_10", h_10, e_10);

    // Update explanation text for Actual columns
    updateActualExplanationText("k_6", k_6, e_6, useType);
    updateActualExplanationText("k_8", k_8, e_8, useType);
    updateActualExplanationText("k_10", k_10, e_10, useType);
  }

  function updateExplanationText(fieldId, targetValue, referenceValue) {
    if (referenceValue > 0) {
      const reduction = 1 - targetValue / referenceValue;
      const reductionPercent = Math.round(reduction * 100);
      const explanationText = `Targeted (Design) ${reductionPercent}% Reduction`;

      // Debug logging to trace the calculation
      if (fieldId === "h_6") {
        console.log(
          `🔍 [S01] h_6 explanation: target=${targetValue}, ref=${referenceValue}, reduction=${reduction}, percent=${reductionPercent}%`,
        );
      }

      const explanationSpan = document.querySelector(
        `[data-field-id="${fieldId}"] .key-explanation`,
      );
      if (explanationSpan) {
        explanationSpan.textContent = explanationText;
      }
    }
  }

  function updateActualExplanationText(
    fieldId,
    actualValue,
    referenceValue,
    useType,
  ) {
    const explanationSpan = document.querySelector(
      `[data-field-id="${fieldId}"] .key-explanation`,
    );
    if (!explanationSpan) return;

    if (
      useType === "Utility Bills" &&
      referenceValue > 0 &&
      typeof actualValue === "number" &&
      isFinite(actualValue)
    ) {
      const reduction = 1 - actualValue / referenceValue;
      const reductionPercent = Math.round(reduction * 100);
      explanationSpan.textContent = `Actual (Utility Bills) ${reductionPercent}% Reduction`;
    } else {
      explanationSpan.textContent = "Actual (Utility Bills)";
    }
  }

  //==========================================================================
  // DISPLAY AND INTERACTION FUNCTIONS
  //==========================================================================

  function getCurrentNumericValue(element) {
    if (!element) return NaN;

    const numericSpan = element.querySelector(".numeric-value");
    let textContent = numericSpan
      ? numericSpan.textContent
      : element.textContent;

    if (!numericSpan) {
      const clone = element.cloneNode(true);
      clone
        .querySelectorAll(".tier-indicator, .checkmark")
        .forEach((el) => el.remove());
      textContent = clone.textContent;
    }

    const cleanedText = textContent.replace(/[^\d.-]/g, "").trim();
    return window.TEUI?.parseNumeric?.(cleanedText, NaN) ?? NaN;
  }

  function updateDisplayValue(fieldId, value, tierOverride = null) {
    const element = document.querySelector(
      `[data-field-id="${fieldId}"] .key-value, [data-field-id="${fieldId}"] .percent-value`,
    );
    if (!element) {
      return;
    }

    const fieldsToAnimate = [
      "e_6",
      "e_8",
      "e_10",
      "h_6",
      "h_8",
      "h_10",
      "k_6",
      "k_8",
      "k_10",
    ];

    if (fieldsToAnimate.includes(fieldId)) {
      const startValue = getCurrentNumericValue(element);
      const endValue = window.TEUI?.parseNumeric?.(value, 0) ?? 0;
      const duration = 500;

      if (
        !isNaN(startValue) &&
        !isNaN(endValue) &&
        Math.abs(startValue - endValue) > 0.01
      ) {
        if (activeAnimations[fieldId]) {
          cancelAnimationFrame(activeAnimations[fieldId]);
        }
        const startTime = performance.now();
        const animateStep = (timestamp) => {
          const elapsedTime = timestamp - startTime;
          const progress = Math.min(1, elapsedTime / duration);
          const easedProgress = 1 - Math.pow(1 - progress, 2);
          const currentValue =
            startValue + (endValue - startValue) * easedProgress;
          const formattedValue =
            window.TEUI?.formatNumber?.(currentValue, "number-1dp") ??
            currentValue.toString();

          if (fieldId === "h_10") {
            const tierValue =
              tierOverride ||
              window.TEUI.StateManager?.getValue("i_10") ||
              "tier3";
            const tierClass =
              tierValue.toLowerCase().replace(" ", "-") + "-tag";
            element.innerHTML = `<span class="tier-indicator ${tierClass}">${tierValue}</span> ${formattedValue}`;
          } else if (fieldId === "e_10") {
            // Reference TEUI with tier1 indicator
            const numericSpan = element.querySelector(".numeric-value");
            if (numericSpan) {
              numericSpan.textContent = formattedValue;
            } else {
              element.innerHTML = `<span class="tier-indicator t1-tag">tier1</span> <span class="numeric-value">${formattedValue}</span>`;
            }
            element.classList.add("ref-value");
          } else if (fieldId === "e_6" || fieldId === "e_8") {
            // Reference carbon values get ref-value styling
            element.textContent = formattedValue;
            element.classList.add("ref-value");
          } else {
            element.textContent = formattedValue;
          }

          if (progress < 1) {
            activeAnimations[fieldId] = requestAnimationFrame(animateStep);
          } else {
            const finalFormattedValue =
              window.TEUI?.formatNumber?.(endValue, "number-1dp") ??
              endValue.toString();
            if (fieldId === "h_10") {
              const tierValue =
                tierOverride ||
                window.TEUI.StateManager?.getValue("i_10") ||
                "tier3";
              const tierClass =
                tierValue.toLowerCase().replace(" ", "-") + "-tag";
              element.innerHTML = `<span class="tier-indicator ${tierClass}">${tierValue}</span> ${finalFormattedValue}`;
            } else if (fieldId === "e_10") {
              // Final Reference TEUI with tier1 indicator
              const numericSpan = element.querySelector(".numeric-value");
              if (numericSpan) {
                numericSpan.textContent = finalFormattedValue;
              } else {
                element.innerHTML = `<span class="tier-indicator t1-tag">tier1</span> <span class="numeric-value">${finalFormattedValue}</span>`;
              }
              element.classList.add("ref-value");
            } else if (fieldId === "e_6" || fieldId === "e_8") {
              // Reference carbon values get ref-value styling
              element.textContent = finalFormattedValue;
              element.classList.add("ref-value");
            } else {
              element.textContent = finalFormattedValue;
            }
            delete activeAnimations[fieldId];
          }
        };
        activeAnimations[fieldId] = requestAnimationFrame(animateStep);
        return;
      }
    }

    // Standard non-animated update
    if (fieldId === "h_10") {
      const tierValue =
        tierOverride || window.TEUI.StateManager?.getValue("i_10") || "tier3";
      const tierClass = tierValue.toLowerCase().replace(" ", "-") + "-tag";
      element.innerHTML = `<span class="tier-indicator ${tierClass}">${tierValue}</span> ${value}`;
    } else if (fieldId === "e_10") {
      const numericSpanE10 = element.querySelector(".numeric-value");
      if (numericSpanE10) {
        numericSpanE10.textContent = value;
      } else {
        element.textContent = value;
      }
      if (!element.querySelector(".tier-indicator.t1-tag")) {
        const tierSpan = document.createElement("span");
        tierSpan.className = "tier-indicator t1-tag";
        tierSpan.textContent = "tier1";
        element.prepend(tierSpan, " ");
      }
      element.classList.add("ref-value");
    } else if (fieldId === "e_6" || fieldId === "e_8") {
      element.textContent = value;
      element.classList.add("ref-value");
    } else if (fieldId === "j_8" || fieldId === "j_10") {
      const percentSpan = element.closest("td").querySelector(".percent-value");
      if (percentSpan) percentSpan.textContent = value;
    } else {
      element.textContent = value;
    }
  }

  function updatePercentageFieldWithCheckmark(fieldId, percentageValue) {
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (!element) return;

    const percentSpan = element.querySelector(".percent-value");
    if (!percentSpan) return;

    // Determine if we need checkmark or X
    let showCheckmark = false;
    if (percentageValue !== "N/A") {
      // Extract numeric percentage (remove % sign)
      const numericPercent =
        window.TEUI?.parseNumeric?.(percentageValue, 0) ?? 0;
      showCheckmark = numericPercent <= 100; // Pass if 100% or under, fail if over 100%
    }

    // Update the display using standard checkmark/warning classes (matches S10/S11/S13)
    if (percentageValue === "N/A") {
      percentSpan.innerHTML = "N/A";
    } else if (showCheckmark) {
      percentSpan.innerHTML = `<span class="checkmark">✓</span>${percentageValue}`;
    } else {
      percentSpan.innerHTML = `<span class="warning">✗</span>${percentageValue}`;
    }
  }

  // calculateTargetTier function removed - tier calculation now integrated in updateTEUIDisplay

  /**
   * PURE DISPLAY CONSUMER: Excel-compliant direct math from upstream values
   * ✅ NO CALCULATION ENGINES: Simple division and formatting only
   * ✅ NO STORAGE: Direct read → calculate → display
   */
  function updateTEUIDisplay() {
    // console.log("🎯 [S01] PURE DISPLAY CONSUMER: Starting Excel-compliant calculations...");

    const useType =
      window.TEUI.StateManager?.getValue("d_14") || "Targeted Use";
    const isUtilityMode = useType === "Utility Bills";

    // 🔍 CONTAMINATION TRACE: Log current TEUI values (same as m_43 debug pattern)
    const current_e_10 = window.TEUI.StateManager?.getValue("e_10") || "0.0";
    const current_h_10 = window.TEUI.StateManager?.getValue("h_10") || "0.0";
    console.log(
      `🔍 [S01DB] updateTEUIDisplay START: e_10=${current_e_10}, h_10=${current_h_10}, useType=${useType}`,
    );

    // ✅ CONSUMER PATTERN: Read upstream values directly from StateManager
    // Building data from S02 - CRITICAL FIX: Separate Target and Reference areas
    const targetArea = getGlobalNumericValue("h_15") || 1427.2;
    const referenceArea = getGlobalNumericValue("ref_h_15") || 1427.2; // ✅ CRITICAL FIX: Use field definition default, not Target contamination
    const targetServiceLife = getGlobalNumericValue("h_13") || 50; // ✅ TARGET BUILDING CONFIG
    const refServiceLife = getGlobalNumericValue("ref_h_13") || 50; // ✅ REFERENCE BUILDING CONFIG

    // Reference values from upstream sections (S04, S05, S15)
    const refEnergy = getGlobalNumericValue("ref_j_32") || 0; // From S04 Reference
    const refEmissions = getGlobalNumericValue("ref_k_32") || 0; // From S04 Reference
    const refEmbodiedCarbon = getGlobalNumericValue("ref_i_39") || 0; // From S05 Reference

    // Target values from upstream sections (S04, S05)
    const targetEnergy = getGlobalNumericValue("j_32") || 0; // From S04 Target
    const targetEmissions = getGlobalNumericValue("k_32") || 0; // From S04 Target
    const embodiedCarbon = getGlobalNumericValue("i_41") || 0; // From S05 Target

    // Actual values from upstream sections (S04)
    const actualEnergy = getGlobalNumericValue("f_32") || 0; // From S04 Actual
    const actualEmissions = getGlobalNumericValue("g_32") || 0; // From S04 Actual

    // console.log(`🔵 [S01] Upstream Reference: refEnergy=${refEnergy} (from ref_j_32), refEmissions=${refEmissions}, refEmbodiedCarbon=${refEmbodiedCarbon}`);
    // console.log(`🟢 [S01] Upstream Target: targetEnergy=${targetEnergy} (from j_32), targetEmissions=${targetEmissions}, embodiedCarbon=${embodiedCarbon}`);
    // console.log(`🟡 [S01] Upstream Actual: actualEnergy=${actualEnergy}, actualEmissions=${actualEmissions}`);
    // console.log(`🎯 [S01] Building: targetArea=${targetArea}, referenceArea=${referenceArea}, targetServiceLife=${targetServiceLife}, refServiceLife=${refServiceLife}, useType=${useType}`);

    // ========================================
    // COLUMN E (REFERENCE): Excel-compliant calculations
    // ✅ CRITICAL FIX: Use referenceArea for all Reference calculations
    // ========================================

    // e_10 = ref_j_32 / ref_h_15 (Reference TEUI)
    const e_10 =
      referenceArea > 0 ? Math.round((refEnergy / referenceArea) * 10) / 10 : 0;

    // e_8 = ref_k_32 / ref_h_15 (Reference Annual Carbon)
    const e_8 =
      referenceArea > 0
        ? Math.round((refEmissions / referenceArea) * 10) / 10
        : 0;

    // e_6 = ref_i_39 / ref_h_13 + e_8 (Reference Lifetime Carbon)
    const e_6 =
      refServiceLife > 0
        ? Math.round((refEmbodiedCarbon / refServiceLife + e_8) * 10) / 10
        : 0;

    // ========================================
    // COLUMN H (TARGET): Excel-compliant calculations
    // ========================================

    // h_10 = j_32 / h_15 (Target TEUI)
    const h_10 =
      targetArea > 0 ? Math.round((targetEnergy / targetArea) * 10) / 10 : 0;

    // h_8 = k_32 / h_15 (Target Annual Carbon)
    const h_8 =
      targetArea > 0 ? Math.round((targetEmissions / targetArea) * 10) / 10 : 0;

    // h_6 = i_41 / h_13 + h_8 (Target Lifetime Carbon)
    const h_6 =
      targetServiceLife > 0
        ? Math.round((embodiedCarbon / targetServiceLife + h_8) * 10) / 10
        : 0;

    // Debug logging for T.1 Lifetime Carbon
    console.log(
      `🔍 [S01] T.1 Calculation: e_6=${e_6} (ref), h_6=${h_6} (target) → reduction should be ${Math.round((1 - h_6 / e_6) * 100)}%`,
    );

    // ========================================
    // COLUMN K (ACTUAL): Excel-compliant calculations (Utility Bills mode only)
    // ========================================

    let k_10 = 0,
      k_8 = 0,
      k_6 = 0;
    if (isUtilityMode) {
      // k_10 = f_32 / h_15 (Actual TEUI)
      k_10 =
        targetArea > 0 ? Math.round((actualEnergy / targetArea) * 10) / 10 : 0;

      // k_8 = g_32 / h_15 (Actual Annual Carbon)
      k_8 =
        targetArea > 0
          ? Math.round((actualEmissions / targetArea) * 10) / 10
          : 0;

      // k_6 = i_41 / h_13 + k_8 (Actual Lifetime Carbon)
      k_6 =
        targetServiceLife > 0
          ? Math.round((embodiedCarbon / targetServiceLife + k_8) * 10) / 10
          : 0;
    }

    // console.log(`🔵 [S01] CALCULATED Reference COLUMN E: e_10=${e_10}, e_8=${e_8}, e_6=${e_6}`);
    // console.log(`🟢 [S01] CALCULATED Target COLUMN H: h_10=${h_10}, h_8=${h_8}, h_6=${h_6}`);
    // console.log(`🟡 [S01] CALCULATED Actual COLUMN K: k_10=${k_10}, k_8=${k_8}, k_6=${k_6}`);

    // ========================================
    // DISPLAY: Format and animate - NO STORAGE
    // ========================================

    // Column E (Reference) - Format and display
    const e10Formatted =
      window.TEUI?.formatNumber?.(e_10, "number-1dp") ?? e_10.toString();
    const e8Formatted =
      window.TEUI?.formatNumber?.(e_8, "number-1dp") ?? e_8.toString();
    const e6Formatted =
      window.TEUI?.formatNumber?.(e_6, "number-1dp") ?? e_6.toString();

    updateDisplayValue("e_10", e10Formatted);
    updateDisplayValue("e_8", e8Formatted);
    updateDisplayValue("e_6", e6Formatted);

    // Column H (Target) - Format and display with tier calculation
    const h10Formatted =
      window.TEUI?.formatNumber?.(h_10, "number-1dp") ?? h_10.toString();
    const h8Formatted =
      window.TEUI?.formatNumber?.(h_8, "number-1dp") ?? h_8.toString();
    const h6Formatted =
      window.TEUI?.formatNumber?.(h_6, "number-1dp") ?? h_6.toString();

    // Calculate tier for h_10 based on reduction from e_10
    const standard_d13 = window.TEUI.StateManager?.getValue("d_13") || "";
    let calculatedTier = "No Tier";
    if (e_10 > 0) {
      const reduction = 1 - h_10 / e_10;
      const standardLower = standard_d13.toLowerCase();
      const isCodeStandard =
        standardLower.includes("nbc") ||
        standardLower.includes("obc") ||
        standardLower.includes("necb");

      if (isCodeStandard) {
        if (reduction > 0.7) calculatedTier = "tier5";
        else if (reduction > 0.6) calculatedTier = "tier4";
        else if (reduction > 0.5) calculatedTier = "tier3";
        else if (reduction > 0.4) calculatedTier = "tier2";
        else calculatedTier = "tier1";
      } else {
        if (reduction > 0.6) calculatedTier = "tier4";
        else if (reduction > 0.45) calculatedTier = "tier3";
        else if (reduction > 0.2) calculatedTier = "tier2";
        else if (reduction > 0.1) calculatedTier = "tier1";
        else calculatedTier = "No Tier";
      }
    }

    // Store tier in StateManager for compatibility with other sections
    if (window.TEUI?.StateManager) {
      const currentTier = window.TEUI.StateManager.getValue("i_10");
      if (currentTier !== calculatedTier) {
        window.TEUI.StateManager.setValue("i_10", calculatedTier, "calculated");
      }
    }

    // 🔍 CONTAMINATION TRACE: Log h_10 updates to track contamination source
    console.log(
      `🔍 [S01DB] UPDATING h_10: ${h10Formatted} (from j_32=${targetEnergy}, area=${targetArea})`,
    );
    updateDisplayValue("h_10", h10Formatted, calculatedTier);
    updateDisplayValue("h_8", h8Formatted);
    updateDisplayValue("h_6", h6Formatted);

    // Column K (Actual) - Conditional on Utility Bills mode
    if (isUtilityMode) {
      const k10Formatted =
        window.TEUI?.formatNumber?.(k_10, "number-1dp") ?? k_10.toString();
      const k8Formatted =
        window.TEUI?.formatNumber?.(k_8, "number-1dp") ?? k_8.toString();
      const k6Formatted =
        window.TEUI?.formatNumber?.(k_6, "number-1dp") ?? k_6.toString();

      updateDisplayValue("k_10", k10Formatted);
      updateDisplayValue("k_8", k8Formatted);
      updateDisplayValue("k_6", k6Formatted);
    } else {
      updateDisplayValue("k_10", "N/A");
      updateDisplayValue("k_8", "N/A");
      updateDisplayValue("k_6", "N/A");
    }

    // Calculate percentages and explanations using the calculated values
    calculatePercentagesAndExplanations(
      e_6,
      e_8,
      e_10,
      h_6,
      h_8,
      h_10,
      k_6,
      k_8,
      k_10,
      useType,
    );

    // Update gauges and warnings
    updateAllGauges();
    checkTargetExceedsReference();

    // console.log("✅ [S01] PURE DISPLAY CONSUMER: All values calculated and displayed");
  }

  function updateAllGauges() {
    updateLinearGauge("lifetime-carbon-gauge");
    updateLinearGauge("annual-carbon-gauge");
    updateLinearGauge("teui-gauge");
  }

  function updateLinearGauge(gaugeId) {
    const gaugeBar = document.querySelector(`#${gaugeId} .linear-gauge-bar`);
    if (!gaugeBar) return;

    const { actualValue, referenceValue } = getGaugeValues(gaugeId);
    const percentValue =
      referenceValue !== 0
        ? Math.min(100, Math.max(0, 100 - (actualValue / referenceValue) * 100))
        : 0;
    const displayWidth = percentValue === 0 ? "4px" : `${percentValue}%`;
    gaugeBar.style.width = displayWidth;

    gaugeBar.className = "linear-gauge-bar";
    if (percentValue >= 75) gaugeBar.classList.add("gauge-excellent");
    else if (percentValue >= 50) gaugeBar.classList.add("gauge-good");
    else if (percentValue >= 25) gaugeBar.classList.add("gauge-warning");
    else gaugeBar.classList.add("gauge-poor");

    if (gaugeId === "teui-gauge") checkTargetExceedsReference();
  }

  function getGaugeValues(gaugeId) {
    const useType =
      window.TEUI.StateManager?.getValue("d_14") || "Targeted Use";
    const isUtilityMode = useType === "Utility Bills";

    // ✅ PURE CONSUMER: Read upstream values and calculate on-the-fly (same as updateTEUIDisplay)
    const targetArea = getGlobalNumericValue("h_15") || 1427.2;
    const referenceArea = getGlobalNumericValue("ref_h_15") || targetArea;
    const targetServiceLife = getGlobalNumericValue("h_13") || 50; // ✅ TARGET BUILDING CONFIG
    const refServiceLife = getGlobalNumericValue("ref_h_13") || 50; // ✅ REFERENCE BUILDING CONFIG

    const refEnergy = getGlobalNumericValue("ref_j_32") || 0;
    const refEmissions = getGlobalNumericValue("ref_k_32") || 0;
    const refEmbodiedCarbon = getGlobalNumericValue("ref_i_39") || 0;

    const targetEnergy = getGlobalNumericValue("j_32") || 0;
    const targetEmissions = getGlobalNumericValue("k_32") || 0;
    const embodiedCarbon = getGlobalNumericValue("i_41") || 0;

    const actualEnergy = getGlobalNumericValue("f_32") || 0;
    const actualEmissions = getGlobalNumericValue("g_32") || 0;

    // Calculate values directly (same math as updateTEUIDisplay)
    const e_10 =
      referenceArea > 0
        ? Math.round((refEnergy / referenceArea) * 10) / 10
        : 341.2;
    const e_8 =
      referenceArea > 0
        ? Math.round((refEmissions / referenceArea) * 10) / 10
        : 17.4;
    const e_6 =
      refServiceLife > 0
        ? Math.round((refEmbodiedCarbon / refServiceLife + e_8) * 10) / 10
        : 24.4;

    const h_10 =
      targetArea > 0 ? Math.round((targetEnergy / targetArea) * 10) / 10 : 93.0;
    const h_8 =
      targetArea > 0
        ? Math.round((targetEmissions / targetArea) * 10) / 10
        : 4.7;
    const h_6 =
      targetServiceLife > 0
        ? Math.round((embodiedCarbon / targetServiceLife + h_8) * 10) / 10
        : 11.7;

    let k_10 = 93.1,
      k_8 = 4.8,
      k_6 = 11.7; // defaults
    if (isUtilityMode) {
      k_10 =
        targetArea > 0
          ? Math.round((actualEnergy / targetArea) * 10) / 10
          : 93.1;
      k_8 =
        targetArea > 0
          ? Math.round((actualEmissions / targetArea) * 10) / 10
          : 4.8;
      k_6 =
        targetServiceLife > 0
          ? Math.round((embodiedCarbon / targetServiceLife + k_8) * 10) / 10
          : 11.7;
    }

    // Return appropriate values based on gauge type
    if (gaugeId === "teui-gauge") {
      return {
        actualValue: isUtilityMode ? k_10 : h_10,
        referenceValue: e_10,
      };
    } else if (gaugeId === "annual-carbon-gauge") {
      return {
        actualValue: isUtilityMode ? k_8 : h_8,
        referenceValue: e_8,
      };
    } else if (gaugeId === "lifetime-carbon-gauge") {
      return {
        actualValue: isUtilityMode ? k_6 : h_6,
        referenceValue: e_6,
      };
    } else {
      return { actualValue: 0, referenceValue: 100 };
    }
  }

  function checkTargetExceedsReference() {
    // ✅ PURE CONSUMER: Calculate values directly for warning check
    const targetArea = getGlobalNumericValue("h_15") || 1427.2;
    const referenceArea = getGlobalNumericValue("ref_h_15") || targetArea;
    const refEnergy = getGlobalNumericValue("ref_j_32") || 0;
    const targetEnergy = getGlobalNumericValue("j_32") || 0;

    const e_10 =
      referenceArea > 0
        ? Math.round((refEnergy / referenceArea) * 10) / 10
        : 341.2;
    const h_10 =
      targetArea > 0 ? Math.round((targetEnergy / targetArea) * 10) / 10 : 93.0;

    const gaugeContainer = document
      .getElementById("teui-gauge")
      ?.closest(".key-title-container");
    const teuiTitleEl = gaugeContainer?.querySelector(".key-title-combined");

    if (!teuiTitleEl) return;

    let warningEl = teuiTitleEl.querySelector(".teui-warning");
    if (h_10 > e_10) {
      if (!warningEl) {
        warningEl = document.createElement("span");
        warningEl.className = "teui-warning";
        warningEl.textContent = " TARGET>REFERENCE!";
        teuiTitleEl.appendChild(warningEl);
      }
    } else {
      warningEl?.remove();
    }
  }

  //==========================================================================
  // DUAL-ENGINE ORCHESTRATION
  //==========================================================================

  // Add recursion protection flag and debouncing
  let calculationInProgress = false;
  let calculationTimeout = null;
  // ⚠️ WARNING: ESLint flags isInitializing as unused, but may be needed for future initialization logic
  // DO NOT remove - preserved for development (June 13, 2025)
  let isInitializing = false;

  function updateTitleModeIndicators() {
    if (!window.TEUI || !window.TEUI.StateManager) return;

    const useType = window.TEUI.StateManager.getValue("d_14") || "Targeted Use";
    const modeTextContent = useType === "Utility Bills" ? "Actual" : "Targeted";

    const indicators = [
      {
        textElId: "#title-t1 .key-title-mode-text",
        gaugeBarElId: "#lifetime-carbon-gauge .linear-gauge-bar",
      },
      {
        textElId: "#title-t2 .key-title-mode-text",
        gaugeBarElId: "#annual-carbon-gauge .linear-gauge-bar",
      },
      {
        textElId: "#title-t3 .key-title-mode-text",
        gaugeBarElId: "#teui-gauge .linear-gauge-bar",
      },
    ];

    const colorMap = {
      "gauge-excellent": "#28a745",
      "gauge-good": "#5bc0de",
      "gauge-warning": "#f0ad4e",
      "gauge-poor": "#d9534f",
    };

    indicators.forEach((indicator) => {
      const textElement = document.querySelector(indicator.textElId);
      const gaugeBarElement = document.querySelector(indicator.gaugeBarElId);

      if (textElement) {
        textElement.textContent = modeTextContent;
        textElement.style.opacity = "0.5"; // Set 50% opacity

        if (gaugeBarElement) {
          let determinedColor = "inherit"; // Default to inherit parent color
          for (const className in colorMap) {
            if (gaugeBarElement.classList.contains(className)) {
              determinedColor = colorMap[className];
              break;
            }
          }
          textElement.style.color = determinedColor;
        } else {
          textElement.style.color = "inherit"; // Fallback if gauge bar not found
        }
      }
    });
  }

  function runAllCalculations() {
    // Debounce rapid calls to prevent race conditions
    if (calculationTimeout) {
      clearTimeout(calculationTimeout);
    }

    calculationTimeout = setTimeout(() => {
      // Add recursion protection
      if (calculationInProgress) {
        return;
      }

      calculationInProgress = true;

      // console.log("🚀 [S01] =================================");
      // console.log("🚀 [S01] PURE DISPLAY CONSUMER TRIGGERED");
      // console.log("🚀 [S01] =================================");

      try {
        // [S01DB] Dump upstream dependency snapshot for TEUI chain
        try {
          const snapshot = {
            ref_j_32: window.TEUI?.StateManager?.getValue("ref_j_32"),
            ref_k_32: window.TEUI?.StateManager?.getValue("ref_k_32"),
            j_32: window.TEUI?.StateManager?.getValue("j_32"),
            k_32: window.TEUI?.StateManager?.getValue("k_32"),
            ref_h_15: window.TEUI?.StateManager?.getValue("ref_h_15"),
            h_15: window.TEUI?.StateManager?.getValue("h_15"),
            ref_h_13: window.TEUI?.StateManager?.getValue("ref_h_13"),
            h_13: window.TEUI?.StateManager?.getValue("h_13"),
          };
        } catch (e) {
          // Snapshot failed
        }
        // ✅ PURE DISPLAY CONSUMER: Single function does all math and display
        updateTEUIDisplay(); // Calculates all values and updates display
        updateTitleModeIndicators(); // Update mode indicators

        // 🕐 PERFORMANCE CLOCK: Mark calculation chain completion (after h_10 finalized)
        if (window.TEUI?.Clock?.markCalculationEnd) {
          window.TEUI.Clock.markCalculationEnd();
        }

        // 🎯 USER INTERACTION TIMING: Mark end of user interaction → h_10 settlement chain
        if (window.TEUI?.Clock?.markUserInteractionEnd) {
          window.TEUI.Clock.markUserInteractionEnd();
        }

        console.log(
          "✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10",
        );
        // console.log("🚀 [S01] =================================");
      } finally {
        calculationInProgress = false;
      }
    }, 50); // 50ms debounce to prevent race conditions
  }

  //==========================================================================
  // INITIALIZATION
  //==========================================================================

  function initializeEventHandlers() {
    if (!window.TEUI || !window.TEUI.StateManager) return;

    // ✅ CONSUMER SECTION PATTERN: Listen to TRUE INPUT fields that affect calculations
    // S01 as consumer section only listens to user inputs that affect its display calculations
    const inputFieldsToWatch = [
      "d_14", // Use type (user dropdown) - affects Actual column display
      "d_13", // Reference standard (user dropdown) - affects Reference calculations
      "d_15", // Carbon standard (user dropdown) - affects m_6 calculation
      // REMOVED B Pattern contamination: No need to listen to calculated intermediate fields
      // Upstream sections (S04, S13, S15) handle their own dependencies
    ];

    // Listen to user input fields
    inputFieldsToWatch.forEach((fieldId) => {
      window.TEUI.StateManager.addListener(
        fieldId,
        // ⚠️ WARNING: ESLint flags these parameters as unused, but they are CALCULATION-CRITICAL
        // DO NOT prefix with underscore - causes calculation regression (June 13, 2025)
        (newValue, oldValue, sourceFieldId) => {
          // Debounce for d_51 which can trigger rapid changes
          if (fieldId === "d_51") {
            setTimeout(() => {
              runAllCalculations();
            }, 50);
          } else {
            runAllCalculations();
          }
        },
      );
    });

    // ✅ CONSUMER SECTION PATTERN: Listen to calculated fields from upstream Pattern A sections
    const calculatedFieldsToWatch = [
      // S04: Energy and emissions totals
      "j_32", // Target energy total
      "k_32", // Target emissions total
      "f_32", // Actual energy total
      "g_32", // Actual emissions total
      "ref_j_32", // Reference energy total
      "ref_k_32", // Reference emissions total

      // S02: Building information
      "h_15", // Conditioned area (Target)
      "ref_h_15", // Conditioned area (Reference)
      "h_13", // Service life (Target)
      "ref_h_13", // Service life (Reference)
      "i_41", // Embodied carbon

      // S15: Final Reference TEUI calculation (critical for Reference column)
      // REMOVED: "ref_h_136" - S01 calculates its own e_10 from ref_j_32 (same fix pattern as h_10)

      // S05: Reference embodied carbon
      "ref_i_39", // Reference embodied carbon
    ];

    calculatedFieldsToWatch.forEach((fieldId) => {
      window.TEUI.StateManager.addListener(
        fieldId,
        // ⚠️ WARNING: ESLint flags these parameters as unused, but they are CALCULATION-CRITICAL
        // DO NOT prefix with underscore - causes calculation regression (June 13, 2025)
        (newValue, oldValue, sourceFieldId) => {
          // Only recalculate if the value actually changed
          if (newValue !== oldValue) {
            if (fieldId === "g_32") {
              // Special handling for g_32 field changes (if needed in future)
            }
            runAllCalculations();
          }
        },
      );
    });

    runAllCalculations();
  }

  function addCustomStyling() {
    let styleElement = document.getElementById("key-values-custom-style");
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "key-values-custom-style";
      document.head.appendChild(styleElement);
      styleElement.textContent = customCSS;
    }
  }

  function removeToggleIcon() {
    const toggleIcon = document.querySelector(
      "#keyValues .section-header .toggle-icon",
    );
    toggleIcon?.remove();
  }

  function onSectionRendered() {
    addCustomStyling();
    renderKeyValuesSection();
    removeToggleIcon();
    initializeEventHandlers();
  }

  let isInitialized = false;

  function initializeOnce() {
    if (isInitialized) return;
    const sectionElement = document.getElementById("keyValues");
    if (sectionElement && window.TEUI?.StateManager) {
      onSectionRendered();
      isInitialized = true;
    }
  }

  //==========================================================================
  // PUBLIC API
  //==========================================================================

  return {
    getFields: () => fields,
    getDropdownOptions: () => ({}),
    getLayout: () => ({ rows: [] }),
    onSectionRendered: onSectionRendered,
    runAllCalculations: runAllCalculations,
    updateDisplayValue: updateDisplayValue, // Expose for cross-section use (S15 -> S01)
  };
})();
