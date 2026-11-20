/**
 * 4012-Section01.js
 * Key Values (Section 1) module for TEUI Calculator 4.012
 */

window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

window.TEUI.SectionModules.sect01 = (function () {
  // Animation state tracking
  const activeAnimations = {};
  const previousValues = {};

  //==========================================================================
  // PART 1: FIELD DEFINITIONS
  //==========================================================================

  // Field definitions primarily for StateManager tracking and reference
  const fields = {
    // T.1 Lifetime Carbon
    e_6: {
      type: "calculated",
      semanticPath: "keyValues.lifetimeCarbon.reference",
      label: "Lifetime Carbon Ref",
      defaultValue: "24.4",
      section: "keyValues",
      dependencies: ["ref_e_6"], // Excel: =REFERENCE!E6
    },
    h_6: {
      type: "calculated",
      semanticPath: "keyValues.lifetimeCarbon.target",
      label: "Lifetime Carbon Target",
      defaultValue: "11.7",
      section: "keyValues",
      dependencies: ["i_41", "h_13", "h_8"], // Excel: =I41/H13+H8
    },
    k_6: {
      type: "calculated",
      semanticPath: "keyValues.lifetimeCarbon.actual",
      label: "Lifetime Carbon Actual",
      defaultValue: "11.7",
      section: "keyValues",
      dependencies: ["d_14", "i_41", "h_13", "k_8"], // Excel: =IF(D14="Utility Bills", I41/H13+K8, "N/A")
    },
    // T.2 Annual Carbon
    e_8: {
      type: "calculated",
      semanticPath: "keyValues.annualCarbon.reference",
      label: "Annual Carbon Ref",
      defaultValue: "17.4",
      section: "keyValues",
      dependencies: ["ref_e_8"], // Excel: =REFERENCE!E8
    },
    h_8: {
      type: "calculated",
      semanticPath: "keyValues.annualCarbon.target",
      label: "Annual Carbon Target",
      defaultValue: "4.7",
      section: "keyValues",
      dependencies: ["k_32", "h_15"], // Excel: =K32/H15
    },
    k_8: {
      type: "calculated",
      semanticPath: "keyValues.annualCarbon.actual",
      label: "Annual Carbon Actual",
      defaultValue: "4.8",
      section: "keyValues",
      dependencies: ["d_14", "g_32", "h_15"], // Excel: =IF(D14="Utility Bills", G32/H15, "N/A")
    },
    j_8: {
      type: "calculated",
      semanticPath: "keyValues.annualCarbon.reductionPercent",
      label: "Annual Carbon %",
      defaultValue: "14%",
      section: "keyValues",
      dependencies: ["e_8", "h_8"], // Calculated from reduction percentage
    },
    // T.3 TEUI
    e_10: {
      type: "calculated",
      semanticPath: "keyValues.teui.reference",
      label: "TEUI Ref",
      defaultValue: "341.2",
      section: "keyValues",
      dependencies: ["ref_e_10"], // Excel: =REFERENCE!E10
    },
    f_10: {
      type: "calculated",
      semanticPath: "keyValues.teui.referenceTier",
      label: "TEUI Ref Tier",
      defaultValue: "tier1",
      section: "keyValues",
      dependencies: ["d_13", "d_144"], // Excel: Tier calculation based on d_13 standard and d_144 reduction
    },
    h_10: {
      type: "calculated",
      semanticPath: "keyValues.teui.target",
      label: "TEUI Target",
      defaultValue: "93.0",
      section: "keyValues",
      dependencies: ["j_32", "h_15"], // Excel: =J32/H15
    },
    i_10: {
      type: "calculated",
      semanticPath: "keyValues.teui.targetTier",
      label: "TEUI Target Tier",
      defaultValue: "tier3",
      section: "keyValues",
      dependencies: ["d_13", "d_144"], // Excel: Tier calculation based on d_13 standard and d_144 reduction
    },
    j_10: {
      type: "calculated",
      semanticPath: "keyValues.teui.reductionPercent",
      label: "TEUI %",
      defaultValue: "41%",
      section: "keyValues",
      dependencies: ["e_10", "h_10"], // Calculated from reduction percentage
    },
    k_10: {
      type: "calculated",
      semanticPath: "keyValues.teui.actual",
      label: "TEUI Actual",
      defaultValue: "93.1",
      section: "keyValues",
      dependencies: ["d_14", "f_32", "h_15"], // Excel: =IF(D14="Targeted Use", "N/A", (F32/H15))
    },
    // Inputs (Placeholder definitions for clarity)
    f_32: {
      type: "calculated",
      semanticPath: "keyValues.source.actualEnergy",
      label: "Source: Actual Energy",
      defaultValue: "0",
      section: "keyValues",
    },
    j_32: {
      type: "calculated",
      semanticPath: "keyValues.source.targetEnergy",
      label: "Source: Target Energy",
      defaultValue: "0",
      section: "keyValues",
    },

    i_41: {
      type: "calculated",
      semanticPath: "keyValues.source.embodiedCarbon",
      label: "Source: Embodied Carbon",
      defaultValue: "0",
      section: "keyValues",
    },

    k_32: {
      type: "calculated",
      semanticPath: "keyValues.source.targetEmissions",
      label: "Source: Target Emissions",
      defaultValue: "0",
      section: "keyValues",
    },
    g_32: {
      type: "calculated",
      semanticPath: "keyValues.source.actualEmissions",
      label: "Source: Actual Emissions",
      defaultValue: "0",
      section: "keyValues",
    },
    d_13: {
      type: "calculated",
      semanticPath: "keyValues.source.referenceStandard",
      label: "Reference Standard",
      defaultValue: "",
      section: "keyValues",
    },
    // Percentage fields (M column)
    m_6: {
      type: "calculated",
      semanticPath: "keyValues.lifetimeCarbon.percentage",
      label: "Lifetime Carbon %",
      defaultValue: "N/A",
      section: "keyValues",
      dependencies: ["i_40", "d_15", "i_41", "h_13", "k_8", "h_8", "i_39"],
    },
    m_8: {
      type: "calculated",
      semanticPath: "keyValues.annualCarbon.percentage",
      label: "Annual Carbon %",
      defaultValue: "14%",
      section: "keyValues",
      dependencies: ["d_14", "k_8", "e_8", "h_8"],
    },
    m_10: {
      type: "calculated",
      semanticPath: "keyValues.teui.percentage",
      label: "TEUI %",
      defaultValue: "41%",
      section: "keyValues",
      dependencies: ["d_14", "k_10", "e_10", "h_10"],
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
            height: 36px !important;
            min-height: 36px !important;
            max-height: 36px !important;
            display: flex !important;
            align-items: center !important;
        }
        #keyValues .section-header .section-controls,
        #keyValues .section-header .excel-loader {
            display: flex;
            align-items: center;
            margin: 0 !important;
        }
        #keyValues .section-header #feedback-area,
        #keyValues .section-header #clock-area {
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
        .key-values-percent-cell { width: 10%; position: relative; text-align: right; vertical-align: middle !important; }
        .key-title-combined { font-family: "Arial Black", Gadget, sans-serif; font-size: 1.5rem; font-weight: 900; line-height: 1.1; display: block; margin-bottom: 4px; text-align: left; margin-left: 20px; }
        .key-title-id { color: #7f7f7f; margin-right: 8px; }
        .key-explanation { font-size: 0.75rem; font-weight: bold; color: #555; margin-bottom: 4px; display: block; line-height: 1.1; text-align: right; padding-right: 10px; }
        .title-explanation { font-size: 0.75rem; font-weight: bold; color: #555; display: block; line-height: 1.1; margin-left: 20px; margin-bottom: 4px; }
        .key-value { font-family: "Arial Black", Gadget, sans-serif; font-size: 2rem; font-weight: 900; line-height: 1; display: block; text-align: right; margin: 0; padding: 0; white-space: nowrap; padding-right: 10px; }
        .percent-value { font-family: "Arial Black", Gadget, sans-serif; font-size: 2rem; font-weight: 900; color: #777; opacity: 0.5; text-align: right; display: block; padding-right: 10px; line-height: 1; margin: 0; white-space: nowrap; }
        .cost-indicator { display: inline; font-size: 0.75rem; font-weight: bold; color: #555; margin-left: 5px; }

        /* CSS-driven reference column styling (via column ancestry) */
        .key-values-ref-cell .key-value { color: #8B0000; }
        .key-values-ref-cell .key-explanation { color: #8B0000; opacity: 0.9; }
        .key-values-ref-cell .cost-indicator { color: #8B0000; opacity: 0.9; }

        /* Tier indicator via data-tier attribute + ::before pseudo-element */
        /* ::before content is NOT part of textContent, so DOMBridge stamping won't affect it */
        .key-value[data-tier]::before {
          content: attr(data-tier);
          display: inline-block;
          font-size: 2rem;
          font-weight: 900;
          color: #777;
          margin-right: 20px;
          opacity: 0.5;
          vertical-align: baseline;
        }
        .key-values-ref-cell .key-value[data-tier]::before { color: #8B0000; opacity: 0.5; }

        /* Checkmark/warning via data-status attribute + ::before pseudo-element */
        .percent-value[data-status="pass"]::before {
          content: "\\2713";
          color: #28a745;
          font-size: 1.2rem;
          font-family: Arial, sans-serif;
          margin-right: 4px;
        }
        .percent-value[data-status="fail"]::before {
          content: "\\2717";
          color: #dc3545;
          font-size: 1.2rem;
          font-family: Arial, sans-serif;
          margin-right: 4px;
        }

        .linear-gauge-container { width: 92%; height: 6px; background-color: #f1f1f1; border-radius: 3px; overflow: hidden; margin: 3px 0 3px auto; position: relative; margin-right: 20px; }
        .linear-gauge-bar { height: 100%; width: 0%; background-color: #5bc0de; transition: width 1s ease-in-out; border-radius: 3px; }
        .gauge-excellent { background-color: #28a745; }
        .gauge-good { background-color: #5bc0de; }
        .gauge-warning { background-color: #f0ad4e; }
        .gauge-poor { background-color: #d9534f; }
        .key-title-container { display: flex; flex-direction: column; }
        .teui-warning { color: #8B0000; font-family: "Arial Black", Gadget, sans-serif; font-size: 1.5rem; font-weight: 900; }
        .key-title-mode-text {
            font-weight: bold;
            margin-left: 8px;
            font-size: 1.5rem;
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

  // HTML template: data-field-id on inner <span> (not <td>) so DOMBridge
  // stamps only the numeric value without destroying explanation text.
  // data-s01-expl on explanation spans (invisible to DOMBridge).
  function getKeyValuesHTML() {
    return `
            <table class="key-values-table">
                <tbody>
                    <tr>
                      <td class="key-values-label-cell"><div class="key-title-container"><span class="title-explanation">Lifetime Emissions Intensity kgCO2e/m\u00B2/Service Life (Yrs)</span><span class="key-title-combined" id="title-t1"><span class="key-title-id">T.1</span>Lifetime Carbon <span class="key-title-mode-text"></span></span><div id="lifetime-carbon-gauge" class="linear-gauge-container"><div class="linear-gauge-bar"></div></div></div></td>
                      <td class="key-values-ref-cell"><span class="key-explanation" data-s01-expl="e_6">Reference 100% (Baseline)</span><span class="key-value" data-field-id="e_6">24.4</span></td>
                      <td class="key-values-target-cell"><span class="key-explanation" data-s01-expl="h_6">Targeted (Design) 71% Reduction</span><span class="key-value" data-field-id="h_6">11.7</span></td>
                      <td class="key-values-actual-cell"><span class="key-explanation" data-s01-expl="k_6">Actual (Utility Bills)</span><span class="key-value" data-field-id="k_6">11.7</span></td>
                      <td class="key-values-percent-cell"><span class="percent-value" data-field-id="m_6" data-status="na">N/A</span></td>
                    </tr>
                    <tr>
                      <td class="key-values-label-cell"><div class="key-title-container"><span class="title-explanation">Annual Operational Emissions Intensity kgCO2e/m\u00B2</span><span class="key-title-combined" id="title-t2"><span class="key-title-id">T.2</span>Annual Carbon <span class="key-title-mode-text"></span></span><div id="annual-carbon-gauge" class="linear-gauge-container"><div class="linear-gauge-bar"></div></div></div></td>
                      <td class="key-values-ref-cell"><span class="key-explanation" data-s01-expl="e_8">Reference 100% (Baseline)</span><span class="key-value" data-field-id="e_8">17.4</span></td>
                      <td class="key-values-target-cell"><span class="key-explanation" data-s01-expl="h_8">Targeted (Design) 86% Reduction</span><span class="key-value" data-field-id="h_8">4.7</span></td>
                      <td class="key-values-actual-cell"><span class="key-explanation" data-s01-expl="k_8">Actual (Utility Bills)</span><span class="key-value" data-field-id="k_8">4.8</span></td>
                      <td class="key-values-percent-cell"><span class="percent-value" data-field-id="m_8" data-status="pass">14%</span></td>
                    </tr>
                    <tr>
                      <td class="key-values-label-cell"><div class="key-title-container"><span class="title-explanation">Total Annual Operational Energy Use Intensity kWh/m\u00B2/yr</span><span class="key-title-combined" id="title-t3"><span class="key-title-id">T.3</span>TEUI <span class="key-title-mode-text"></span></span><div id="teui-gauge" class="linear-gauge-container"><div class="linear-gauge-bar"></div></div></div></td>
                      <td class="key-values-ref-cell"><span class="key-explanation" data-s01-expl="e_10">Reference 100% (Baseline) <span class="cost-indicator"></span></span><span class="key-value" data-field-id="e_10" data-tier="tier1">341.2</span></td>
                      <td class="key-values-target-cell"><span class="key-explanation" data-s01-expl="h_10">Targeted (Design) 59% Reduction <span class="cost-indicator"></span></span><span class="key-value" data-field-id="h_10" data-tier="tier3">93.0</span></td>
                      <td class="key-values-actual-cell"><span class="key-explanation" data-s01-expl="k_10">Actual (Utility Bills) <span class="cost-indicator"></span></span><span class="key-value" data-field-id="k_10">93.1</span></td>
                      <td class="key-values-percent-cell"><span class="percent-value" data-field-id="m_10" data-status="pass">41%</span></td>
                    </tr>
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
  // EXPLANATION TEXT
  //==========================================================================

  function updateExplanationText(fieldId, targetValue, referenceValue) {
    const element = document.querySelector(`[data-s01-expl="${fieldId}"]`);
    if (!element) return;

    if (referenceValue > 0) {
      const reduction = 1 - targetValue / referenceValue;
      const reductionPercent = Math.round(reduction * 100);
      element.textContent = `Targeted (Design) ${reductionPercent}% Reduction`;
    }
  }

  function updateActualExplanationText(fieldId, actualValue, referenceValue, useType) {
    const element = document.querySelector(`[data-s01-expl="${fieldId}"]`);
    if (!element) return;

    if (
      useType === "Utility Bills" &&
      referenceValue > 0 &&
      typeof actualValue === "number" &&
      isFinite(actualValue)
    ) {
      const reduction = 1 - actualValue / referenceValue;
      const reductionPercent = Math.round(reduction * 100);
      element.textContent = `Actual (Utility Bills) ${reductionPercent}% Reduction`;
    } else {
      element.textContent = "Actual (Utility Bills)";
    }
  }

  //==========================================================================
  // DISPLAY FUNCTIONS (with count-up/down animation for key values)
  //==========================================================================

  const fieldsToAnimate = [
    "e_6", "e_8", "e_10", "h_6", "h_8", "h_10",
    "k_6", "k_8", "k_10",
  ];

  function getCurrentNumericValue(element) {
    if (!element) return NaN;
    const numericSpan = element.querySelector(".numeric-value");
    let textContent = numericSpan ? numericSpan.textContent : element.textContent;
    if (!numericSpan) {
      const clone = element.cloneNode(true);
      clone.querySelectorAll(".tier-indicator, .checkmark").forEach(el => el.remove());
      textContent = clone.textContent;
    }
    const cleanedText = textContent.replace(/[^\d.-]/g, "").trim();
    return window.TEUI?.parseNumeric?.(cleanedText, NaN) ?? NaN;
  }

  function stampFieldValue(element, fieldId, formattedValue) {
    // Tier badges are rendered by CSS ::before via data-tier attribute.
    // Just set the numeric text content here.
    element.textContent = formattedValue;
    if (fieldId === "e_10" || fieldId === "e_6" || fieldId === "e_8") {
      element.classList.add("ref-value");
    }
  }

  function updateDisplayValue(fieldId, value, fromValue) {
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (!element) return;

    if (fieldsToAnimate.includes(fieldId)) {
      const startValue = fromValue !== undefined ? fromValue : getCurrentNumericValue(element);
      const endValue = window.TEUI?.parseNumeric?.(value, 0) ?? 0;
      const duration = 500;

      if (!isNaN(startValue) && !isNaN(endValue) && Math.abs(startValue - endValue) > 0.01) {
        if (activeAnimations[fieldId]) {
          cancelAnimationFrame(activeAnimations[fieldId]);
        }
        const startTime = performance.now();
        const animateStep = timestamp => {
          const progress = Math.min(1, (timestamp - startTime) / duration);
          const eased = 1 - Math.pow(1 - progress, 2);
          const current = startValue + (endValue - startValue) * eased;
          const formatted = window.TEUI?.formatNumber?.(current, "number-1dp") ?? current.toString();
          stampFieldValue(element, fieldId, formatted);
          if (progress < 1) {
            activeAnimations[fieldId] = requestAnimationFrame(animateStep);
          } else {
            const final = window.TEUI?.formatNumber?.(endValue, "number-1dp") ?? endValue.toString();
            stampFieldValue(element, fieldId, final);
            delete activeAnimations[fieldId];
          }
        };
        activeAnimations[fieldId] = requestAnimationFrame(animateStep);
        return;
      }
    }

    // Non-animated fallback
    stampFieldValue(element, fieldId, value);
  }

  //==========================================================================
  // GAUGES AND WARNINGS
  //==========================================================================

  function updateAllGauges() {
    updateLinearGauge("lifetime-carbon-gauge");
    updateLinearGauge("annual-carbon-gauge");
    updateLinearGauge("teui-gauge");
  }

  function updateLinearGauge(gaugeId) {
    const gaugeBar = document.querySelector(`#${gaugeId} .linear-gauge-bar`);
    if (!gaugeBar) return;

    const SM = window.TEUI?.StateManager;
    if (!SM) return;
    const parse = window.TEUI.parseNumeric;

    let actualValue = 0, referenceValue = 0;
    if (gaugeId === "teui-gauge") {
      const useType = SM.getValue("d_14") || "Targeted Use";
      referenceValue = parse(SM.getValue("e_10"), 0);
      actualValue = useType === "Utility Bills"
        ? parse(SM.getValue("k_10"), 0)
        : parse(SM.getValue("h_10"), 0);
    } else if (gaugeId === "annual-carbon-gauge") {
      const useType = SM.getValue("d_14") || "Targeted Use";
      referenceValue = parse(SM.getValue("e_8"), 0);
      actualValue = useType === "Utility Bills"
        ? parse(SM.getValue("k_8"), 0)
        : parse(SM.getValue("h_8"), 0);
    } else if (gaugeId === "lifetime-carbon-gauge") {
      const useType = SM.getValue("d_14") || "Targeted Use";
      referenceValue = parse(SM.getValue("e_6"), 0);
      actualValue = useType === "Utility Bills"
        ? parse(SM.getValue("k_6"), 0)
        : parse(SM.getValue("h_6"), 0);
    }

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
  }

  function checkTargetExceedsReference() {
    const SM = window.TEUI?.StateManager;
    if (!SM) return;
    const parse = window.TEUI.parseNumeric;

    const e_10 = parse(SM.getValue("e_10"), 0);
    const h_10 = parse(SM.getValue("h_10"), 0);

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

    indicators.forEach(indicator => {
      const textElement = document.querySelector(indicator.textElId);
      const gaugeBarElement = document.querySelector(indicator.gaugeBarElId);

      if (textElement) {
        textElement.textContent = modeTextContent;
        textElement.style.opacity = "0.5";

        if (gaugeBarElement) {
          let determinedColor = "inherit";
          for (const className in colorMap) {
            if (gaugeBarElement.classList.contains(className)) {
              determinedColor = colorMap[className];
              break;
            }
          }
          textElement.style.color = determinedColor;
        } else {
          textElement.style.color = "inherit";
        }
      }
    });
  }

  //==========================================================================
  // POST-STAMP: Supplementary display after DOMBridge stamps values
  //==========================================================================

  /**
   * Build a Map of legacyId → graph-computed value for the Target model.
   * Returns null if the graph is not available.
   */
  function buildGraphValueMap() {
    const CI = window.TEUI?.ComputationIntegration;
    if (!CI?.isInitialized?.()) return null;
    const graph = CI.getGraph();
    const gState = CI.getState();
    if (!graph || !gState) return null;
    const modelId = gState.getActiveModelId();
    if (!modelId) return null;

    const map = new Map();
    for (const nodeId of (graph.getAllNodeIds?.() || [])) {
      const node = graph.getNode(nodeId);
      if (node?.legacyId) {
        map.set(node.legacyId, gState.getValueForModel(modelId, nodeId));
      }
    }
    for (const inputId of (graph.getAllInputIds?.() || [])) {
      const input = graph.getInput(inputId);
      if (input?.legacyId) {
        map.set(input.legacyId, gState.getValueForModel(modelId, inputId));
      }
    }
    return map;
  }

  /**
   * Called after DOMBridge.stampAll() stamps graph-computed values to DOM.
   * Handles supplementary display that DOMBridge doesn't cover:
   * - data-tier attributes for tier badges (CSS ::before)
   * - data-status attributes for checkmark/warning (CSS ::before)
   * - Explanation text (reduction percentages)
   * - Gauges, mode indicators, warnings
   *
   * No calculations — reads values from graph state (MultiModelState), falling
   * back to StateManager when graph is unavailable.
   */
  function postStamp() {
    const SM = window.TEUI?.StateManager;
    if (!SM) return;
    const parse = window.TEUI.parseNumeric;

    // Build graph value reader: legacyId → graph-computed value
    const graphValues = buildGraphValueMap();

    function getValue(fid) {
      if (graphValues && graphValues.has(fid)) {
        const v = graphValues.get(fid);
        if (v !== undefined && v !== null) return v;
      }
      return SM.getValue(fid);
    }

    const useType = getValue("d_14") || "Targeted Use";

    // Read graph-computed values and animate key fields
    const vals = {};
    for (const fid of ["e_6","e_8","e_10","h_6","h_8","h_10","k_6","k_8","k_10"]) {
      // A figure the graph could not give (an F280 method without its inputs) shows as a dash, never 0.0
      // (it read 0.0 for Hemmingford under F280 Mode On, 2026-11-19); the hover says where to look.
      const el = document.querySelector(`[data-field-id="${fid}"]`);
      if (getValue(fid) === "Unavailable") {
        if (activeAnimations[fid]) cancelAnimationFrame(activeAnimations[fid]);
        delete activeAnimations[fid];
        if (el) {
          stampFieldValue(el, fid, "—");
          el.title = "Unavailable: a method this model uses is missing an input (S03 G.4.10 BASESIMP, S12 B.19.13 AIM-2, S15 T.6.10 / T.6.11)";
        }
        vals[fid] = NaN;
        previousValues[fid] = undefined;
        continue;
      }
      if (el) el.title = "";
      vals[fid] = parse(getValue(fid), 0);
      const formatted = window.TEUI?.formatNumber?.(vals[fid], "number-1dp") ?? vals[fid].toString();
      const prev = previousValues[fid];
      updateDisplayValue(fid, formatted, prev);
      previousValues[fid] = vals[fid];
    }
    const { e_6, e_8, e_10, h_6, h_8, h_10, k_6, k_8, k_10 } = vals;

    // Update tier attributes
    const h10El = document.querySelector('[data-field-id="h_10"]');
    if (h10El) {
      h10El.dataset.tier = getValue("i_10") || "tier3";
    }
    const e10El = document.querySelector('[data-field-id="e_10"]');
    if (e10El) {
      e10El.dataset.tier = getValue("f_10") || "tier1";
    }

    // Update status attributes for percentage fields
    for (const pctField of ["m_6", "m_8", "m_10"]) {
      const el = document.querySelector(`[data-field-id="${pctField}"]`);
      if (!el) continue;
      const text = el.textContent;
      if (text === "N/A") {
        el.dataset.status = "na";
      } else {
        const n = parse(text, 0);
        el.dataset.status = n <= 100 ? "pass" : "fail";
      }
    }

    // Update explanation text for Target columns
    if (Number.isFinite(h_6) && Number.isFinite(e_6)) updateExplanationText("h_6", h_6, e_6);
    if (Number.isFinite(h_8) && Number.isFinite(e_8)) updateExplanationText("h_8", h_8, e_8);
    if (Number.isFinite(h_10) && Number.isFinite(e_10)) updateExplanationText("h_10", h_10, e_10);

    // Update explanation text for Actual columns
    if (Number.isFinite(k_6) && Number.isFinite(e_6)) updateActualExplanationText("k_6", k_6, e_6, useType);
    if (Number.isFinite(k_8) && Number.isFinite(e_8)) updateActualExplanationText("k_8", k_8, e_8, useType);
    if (Number.isFinite(k_10) && Number.isFinite(e_10)) updateActualExplanationText("k_10", k_10, e_10, useType);

    // Update gauges, mode indicators, warnings
    updateAllGauges();
    updateTitleModeIndicators();
    checkTargetExceedsReference();
  }

  //==========================================================================
  // GLOBAL HEADER CONTROLS (TARGET/REFERENCE TOGGLE + RESET)
  //==========================================================================

  function injectKeyValuesHeaderControls() {
    const sectionHeader = document.querySelector("#keyValues .section-header");
    if (!sectionHeader || sectionHeader.querySelector("#s01-reset-icon")) {
      return;
    }

    const rightContainer = sectionHeader.querySelector(".ms-auto");
    if (!rightContainer) return;

    const expandBtn = sectionHeader.querySelector("#expand-collapse-all");
    if (!expandBtn) return;

    // --- Create Global Factory Reset Icon ---
    const resetIcon = document.createElement("i");
    resetIcon.id = "s01-reset-icon";
    resetIcon.className = "bi bi-bootstrap-reboot";
    resetIcon.title = "Factory Reset - Clear ALL data and reset to defaults";
    resetIcon.style.cssText =
      "z-index: 111; position: relative; color: white; font-size: 1.5em; cursor: pointer; margin-left: 15px; margin-right: 12px;";

    resetIcon.addEventListener("click", event => {
      event.stopPropagation();
      if (
        confirm("Factory reset? This will clear ALL data and cannot be undone.")
      ) {
        if (window.TEUI?.StateManager?.resetTier3_FactoryReset) {
          window.TEUI.StateManager.resetTier3_FactoryReset();
        }
      }
    });

    // --- Create Global Toggle Switch ---
    const toggleSwitch = document.createElement("div");
    toggleSwitch.style.cssText =
      "z-index: 111; position: relative; width: 40px; height: 20px; background-color: #ccc; border-radius: 10px; cursor: pointer; margin-left: 15px; margin-right: 15px;";
    toggleSwitch.title = "Reference / Display Toggle";

    const slider = document.createElement("div");
    slider.style.cssText =
      "position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background-color: white; border-radius: 50%; transition: transform 0.2s;";

    toggleSwitch.appendChild(slider);

    toggleSwitch.addEventListener("click", event => {
      event.stopPropagation();
      const currentMode =
        window.TEUI.ReferenceToggle?.getCurrentMode?.() || "target";
      const targetMode = currentMode === "target" ? "reference" : "target";
      if (window.TEUI.ReferenceToggle?.switchMode) {
        window.TEUI.ReferenceToggle.switchMode(targetMode);
      }
    });

    if (window.TEUI.ReferenceToggle) {
      window.TEUI.ReferenceToggle.keyValuesToggleElements = {
        toggleSwitch: toggleSwitch,
        slider: slider,
      };
      const currentMode =
        window.TEUI.ReferenceToggle.getCurrentMode?.() || "target";
      updateKeyValuesToggleUI(toggleSwitch, slider, currentMode);
    }

    rightContainer.insertBefore(toggleSwitch, expandBtn);
    rightContainer.insertBefore(resetIcon, expandBtn);
  }

  function updateKeyValuesToggleUI(toggleSwitch, slider, mode) {
    if (mode === "reference") {
      slider.style.transform = "translateX(20px)";
      toggleSwitch.style.backgroundColor = "#dc3545";
    } else {
      slider.style.transform = "translateX(0)";
      toggleSwitch.style.backgroundColor = "#ccc";
    }
  }

  //==========================================================================
  // INITIALIZATION
  //==========================================================================

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
      "#keyValues .section-header .toggle-icon"
    );
    toggleIcon?.remove();
  }

  function onSectionRendered() {
    addCustomStyling();
    renderKeyValuesSection();
    removeToggleIcon();
    injectKeyValuesHeaderControls();
    // No SM listeners — values flow through graph → DOMBridge.stampAll() → postStamp()
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
    postStamp: postStamp,
    updateDisplayValue: updateDisplayValue,
  };
})();
