/**
 * DOMBridge.js - Stamps graph-computed values to DOM
 *
 * The computation graph is the single source of truth.
 * After graph computation, DOMBridge reads all computed values
 * and stamps them to DOM elements via [data-field-id] selectors
 * with proper formatting per field.
 *
 * This replaces per-section updateCalculatedDisplayValues() methods.
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};

  // ==========================================================================
  // FORMAT MAP: legacyId -> formatType
  // Default is "number-2dp-comma". Only exceptions listed here.
  // ==========================================================================

  const FORMAT = {
    // S01 Key Values - 1 decimal place
    e_6: "number-1dp", e_8: "number-1dp", e_10: "number-1dp",
    h_6: "number-1dp", h_8: "number-1dp", h_10: "number-1dp",
    k_6: "number-1dp", k_8: "number-1dp", k_10: "number-1dp",
    // S01 - raw strings (percentages like "48%", tiers like "tier3")
    m_6: "raw", m_8: "raw", m_10: "raw",
    j_8: "raw", j_10: "raw",
    i_10: "raw", f_10: "raw",

    // S02 metadata/text fields
    h_14: "raw", i_16: "raw", i_17: "raw",
    l_12: "cad-4dp", l_13: "cad-4dp", l_14: "cad-4dp", l_15: "cad-2dp", l_16: "cad-4dp",

    // S03 Climate
    j_19: "number-1dp", m_19: "integer",
    d_20: "integer", d_21: "integer",
    d_22: "integer", h_22: "integer",
    d_23: "integer", h_23: "integer",
    d_24: "integer", h_24: "integer",
    d_25: "integer", l_22: "integer", l_24: "integer",
    d_140b: "integer", h_140b: "integer", // S15 T.6.10 / T.6.11: F280's loss and sensible gain, W
    l_140b: "number-2dp", m_140b: "integer", // S15 T.6.12: x LM (Cl. 6.3.1) = the nominal gain Annex J compares
    e_23: "integer-nocomma", i_23: "integer-nocomma",
    e_24: "integer-nocomma", i_24: "integer-nocomma",
    e_25: "integer-nocomma",
    m_23: "integer", m_24: "integer",
    n_23: "raw", n_24: "raw",

    // S04 Energy: emission factor integers, nuclear waste 4dp
    l_27: "integer",
    l_28: "integer", l_29: "integer", l_30: "integer", l_31: "integer",
    l_33: "number-4dp",

    // S05 Embodied Carbon - raw strings
    m_38: "raw", m_39: "raw", m_40: "raw", m_41: "raw",
    n_38: "raw", n_39: "raw", n_40: "raw", n_41: "raw",

    // S06 Renewable Energy: subtotals as integer, inputs without commas
    d_43: "integer", i_43: "integer", i_45: "integer",
    d_44: "integer-nocomma", d_45: "integer-nocomma", d_46: "integer-nocomma",
    i_44: "integer-nocomma", i_46: "integer-nocomma", k_45: "integer-nocomma",

    // S07 Water Heating: integer occupancy, compliance ratios
    h_49: "number-2dp", i_49: "integer", k_49: "integer",
    h_50: "number-2dp", i_50: "integer", j_50: "number-2dp", e_50: "number-2dp",
    m_49: "raw", m_50: "raw", m_52: "raw", m_53: "raw",
    n_49: "raw", n_50: "raw", n_52: "raw", n_53: "raw",

    // S08 Air Quality: integer targets and compliance
    d_56: "integer", d_57: "integer", d_58: "integer", d_59: "integer",
    k_56: "integer", k_57: "integer", k_58: "integer",
    m_56: "integer-percent", m_57: "integer-percent", m_58: "integer-percent",
    m_59: "raw",
    n_56: "raw", n_57: "raw", n_58: "raw", n_59: "raw",

    // S09 Occupancy: integer counts and hours
    d_63: "integer", h_63: "integer", m_63: "integer",
    g_63: "integer-nocomma", j_63: "integer-nocomma", i_63: "integer-nocomma",

    // S09 Internal Gains: densities as 1dp, seasonal split percentages
    d_65: "number-1dp", d_66: "number-2dp", d_67: "number-1dp",
    g_64: "number-2dp",
    j_64: "percent-2dp", j_65: "percent-2dp", j_66: "percent-2dp", j_67: "percent-2dp",
    j_69: "percent-2dp", j_71: "percent-2dp",
    l_64: "percent-2dp", l_65: "percent-2dp", l_66: "percent-2dp", l_67: "percent-2dp",
    l_69: "percent-2dp", l_71: "percent-2dp",
    // S09 Internal Gains: compliance ratios and checkmarks
    m_65: "raw", m_66: "raw", m_67: "raw",
    n_65: "raw", n_66: "raw", n_67: "raw",

    // S10 Radiant Gains: percentages and subtotal indicators
    j_73: "percent-2dp", j_74: "percent-2dp", j_75: "percent-2dp",
    j_76: "percent-2dp", j_77: "percent-2dp", j_78: "percent-2dp",
    l_73: "percent-2dp", l_74: "percent-2dp", l_75: "percent-2dp",
    l_76: "percent-2dp", l_77: "percent-2dp", l_78: "percent-2dp",
    j_79: "integer", l_79: "integer",
    g_81: "percent-2dp",

    // S11 Envelope: area percentages, thermal bridge decimal, heat loss/gain %
    h_85: "percent-2dp", h_86: "percent-2dp", h_87: "percent-2dp",
    h_88: "percent-2dp", h_89: "percent-2dp", h_90: "percent-2dp",
    h_91: "percent-2dp", h_92: "percent-2dp", h_93: "percent-2dp",
    h_94: "percent-2dp", h_95: "percent-2dp", h_98: "raw",
    g_85: "number-3dp", g_86: "number-3dp", g_87: "number-3dp",
    g_88: "number-3dp", g_89: "number-3dp", g_90: "number-3dp",
    g_91: "number-3dp", g_92: "number-3dp", g_93: "number-3dp",
    g_94: "number-3dp", g_95: "number-3dp",
    e_97: "number-3dp",
    j_85: "percent-2dp", j_86: "percent-2dp", j_87: "percent-2dp",
    j_88: "percent-2dp", j_89: "percent-2dp", j_90: "percent-2dp",
    j_91: "percent-2dp", j_92: "percent-2dp", j_93: "percent-2dp",
    j_94: "percent-2dp", j_95: "percent-2dp",
    l_85: "percent-2dp", l_86: "percent-2dp", l_87: "percent-2dp",
    l_88: "percent-2dp", l_89: "percent-2dp", l_90: "percent-2dp",
    l_91: "percent-2dp", l_92: "percent-2dp", l_93: "percent-2dp",
    l_94: "percent-2dp", l_95: "percent-2dp",
    j_97: "percent-2dp", j_98: "percent-2dp",
    l_97: "percent-2dp", l_98: "percent-2dp",
    // S11 Envelope: compliance ratios and checkmarks
    m_85: "raw", m_86: "raw", m_87: "raw", m_88: "raw",
    m_89: "raw", m_90: "raw", m_91: "raw", m_92: "raw",
    m_93: "raw", m_94: "raw", m_95: "raw", m_97: "raw",
    n_85: "raw", n_86: "raw", n_87: "raw", n_88: "raw",
    n_89: "raw", n_90: "raw", n_91: "raw", n_92: "raw",
    n_93: "raw", n_94: "raw", n_95: "raw", n_97: "raw",
    // S11 Envelope: surface temperatures with condensation risk emoji
    o_85: "condensation", o_86: "condensation", o_87: "condensation",
    o_88: "condensation", o_89: "condensation", o_90: "condensation",
    o_91: "condensation", o_92: "condensation", o_93: "condensation",
    o_94: "condensation", o_95: "condensation",

    // S08 Humidity guidance
    k_59: "raw",

    // S12 Volume Metrics: WWR as percent, NLA10 (cm2/m2) to 2dp as NBC's tables state it, compliance text and checkmarks
    d_107: "percent-2dp", d_110: "number-2dp",
    // B.19.13 / B.19.14: AIM-2's air-leakage rates, AC/H (F280 Cl. 5.2.3, 6.2.6)
    d_112f: "number-4dp", g_112f: "number-4dp",
    i_110: "integer",
    l_101: "percent-2dp", l_102: "percent-2dp", l_103: "percent-2dp", l_104: "percent-0dp",
    m_104: "raw", n_104: "raw",
    m_107: "raw", n_107: "raw",
    m_109: "raw", n_109: "raw",
    m_110: "raw", n_110: "raw",

    // S13 Ventilation: SRE, ACH, per-person rate and unit conversions
    d_118: "number-2dp", l_118: "number-2dp",
    d_119: "number-2dp", f_119: "number-2dp", h_119: "number-2dp",

    // S13 Cooling: latent load factor display
    h_122: "percent-0dp",
    // S13 Cooling: compliance ratios and pass/fail checkmarks
    m_113: "integer-percent", m_115: "integer-percent", m_116: "integer-percent",
    m_117: "integer-percent", m_118: "integer-percent", m_119: "integer-percent",
    n_113: "raw", n_115: "raw", n_116: "raw",
    n_117: "raw", n_118: "raw", n_119: "raw",
    n_124: "raw",
    m_124: "integer",

    // S14 Energy breakdown
    m_131: "number-2dp-comma",

    // S15 TEUI Summary: costs, loads, ratios
    h_135: "number-2dp-comma",
    d_141: "cad-2dp", h_141: "cad-2dp", l_141: "cad-2dp",
    d_142: "cad-2dp", h_142: "number-2dp-comma",
    d_143: "number-1dp", h_143: "number-1dp", l_143: "number-1dp",
    d_144: "percent-0dp", h_144: "percent-0dp", l_144: "percent-0dp",
    d_145: "number-2dp-comma",
  };

  // The opening rows after the first (Openings.js) format as their group's first row: S10's j/l, S11's
  // g/h/j/l/m/n/o
  // (an opaque row after the first, S11's only, as B.5)
  [...window.TEUI.Openings.SLOTS, ...window.TEUI.Openings.OPAQUE_SLOTS].forEach(o => {
    if (o.s10) FORMAT[`j_${o.s10}`] = FORMAT[`l_${o.s10}`] = "percent-2dp";
    Object.assign(FORMAT, {
      [`g_${o.s11}`]: "number-3dp",
      [`h_${o.s11}`]: "percent-2dp",
      [`j_${o.s11}`]: "percent-2dp",
      [`l_${o.s11}`]: "percent-2dp",
      [`m_${o.s11}`]: "raw",
      [`n_${o.s11}`]: "raw",
      [`o_${o.s11}`]: "condensation",
    });
  });

  // S01 fields always read from Target model (S01 renders all 3 columns itself)
  const S01_FIELDS = new Set([
    "e_6", "e_8", "e_10", "h_6", "h_8", "h_10", "k_6", "k_8", "k_10",
    "f_10", "i_10", "j_8", "j_10", "m_6", "m_8", "m_10",
  ]);

  // S01 animated fields — skipped by stampAll, handled by postStamp with animation
  const S01_ANIMATED = new Set([
    "e_6", "e_8", "e_10", "h_6", "h_8", "h_10", "k_6", "k_8", "k_10",
  ]);

  // Tier field → value field mapping (set data-tier attribute)
  const TIER_MAP = { e_10: "f_10", h_10: "i_10" };

  // S11 surface temperature → condensation risk companion node (cr_ fields)
  const CONDENSATION_FIELDS = [
    "o_85", "o_86", "o_87", "o_88", "o_89",
    "o_90", "o_91", "o_92", "o_93", "o_94", "o_95",
    "o_101", "o_102",
    ...[...window.TEUI.Openings.SLOTS, ...window.TEUI.Openings.OPAQUE_SLOTS].map(o => `o_${o.s11}`),
  ];

  // ==========================================================================
  // STAMP ALL
  // ==========================================================================

  /**
   * Read computed values from MultiModelState and write to DOM.
   * Runs as final step in the calculation pipeline.
   */
  function stampAll() {
    const CI = window.TEUI.ComputationIntegration;
    if (!CI?.isInitialized?.()) return;

    const graph = CI.getGraph();
    const state = CI.getState();
    if (!graph || !state) return;

    const isRef = window.TEUI.ReferenceToggle?.isReferenceMode?.() || false;
    const targetModelId = state.getActiveModelId();
    const refModelId = isRef ? CI.getRefModelId() : null;
    if (!targetModelId) return;

    const fmt = window.TEUI.formatNumber;
    const parse = window.TEUI.parseNumeric;
    if (!fmt || !parse) return;

    // Build legacyId → semanticPath lookup from graph nodes
    const legacyToSemantic = new Map();
    const nodeIds = graph.getAllNodeIds ? graph.getAllNodeIds() : [];
    for (const nodeId of nodeIds) {
      const node = graph.getNode(nodeId);
      if (node?.legacyId) legacyToSemantic.set(node.legacyId, nodeId);
    }
    const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];
    for (const inputId of inputIds) {
      const input = graph.getInput(inputId);
      if (input?.legacyId) legacyToSemantic.set(input.legacyId, inputId);
    }

    let stamped = 0;

    for (const [legacyId, semanticPath] of legacyToSemantic) {
      // Skip animated S01 fields — postStamp handles them with animation
      if (S01_ANIMATED.has(legacyId)) continue;

      // Choose model: S01 always Target, others depend on reference mode
      const modelId = S01_FIELDS.has(legacyId) ? targetModelId
        : (refModelId || targetModelId);

      const value = state.getValueForModel(modelId, semanticPath);
      if (value === undefined || value === null) continue;

      const el = document.querySelector(`[data-field-id="${legacyId}"]`);
      if (!el) continue;

      // Skip user-input elements only if actively being edited
      if (el.hasAttribute("contenteditable") && document.activeElement === el) continue;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") continue;
      if (el.querySelector("input, select, textarea")) continue;

      const formatType = FORMAT[legacyId] || "number-2dp-comma";

      // Condensation fields handled by stampCondensationIndicators
      if (formatType === "condensation") continue;

      if (formatType === "raw") {
        el.textContent = String(value);
        // Apply checkmark/warning classes for compliance status indicators
        if (value === "✓") {
          el.classList.remove("warning");
          el.classList.add("checkmark");
        } else if (value === "✗") {
          el.classList.remove("checkmark");
          el.classList.add("warning");
        }
        stamped++;
        continue;
      }

      if (formatType === "integer-percent") {
        const n = parse(value, NaN);
        if (!isNaN(n)) {
          el.textContent = Math.round(n) + "%";
          stamped++;
        }
        continue;
      }

      const n = parse(value, NaN);
      if (!isNaN(n)) {
        el.textContent = fmt(n, formatType);
        stamped++;
      } else if (typeof value === "string" && value !== "") {
        // Non-numeric computed values (e.g., "Unavailable" for CDD)
        el.textContent = value;
        stamped++;
      }

      // Computed nodes in contenteditable fields: gray when climate-derived,
      // blue when user override is active
      if (el.hasAttribute("contenteditable") && graph.getNode(semanticPath)?.compute) {
        const overridePath = semanticPath + ".userOverride";
        const overrideVal = state.getValueForModel(modelId, overridePath);
        if (overrideVal !== null && overrideVal !== undefined && overrideVal !== "") {
          el.classList.add("user-modified");
        } else {
          el.classList.remove("user-modified");
        }
      }
    }

    // Stamp Section01 data attributes (tier badges, status indicators)
    stampSection01Attributes(state, targetModelId, legacyToSemantic, parse);

    // Stamp S11 condensation risk indicators (🌵/💧 + surface temp)
    stampCondensationIndicators(state, refModelId || targetModelId, legacyToSemantic, parse, fmt);

    // Stamp gain/loss indicator dots for S09, S10, S11
    stampGainLossIndicators();

    console.log(`[DOMBridge] Stamped ${stamped} values`);
  }

  /**
   * Set data-tier and data-status attributes on Section01 elements.
   * CSS ::before pseudo-elements render tier badges and checkmarks.
   */
  function stampSection01Attributes(state, modelId, lookup, parse) {
    // Tier attributes
    for (const [valueField, tierField] of Object.entries(TIER_MAP)) {
      const el = document.querySelector(`[data-field-id="${valueField}"]`);
      const tierPath = lookup.get(tierField);
      if (el && tierPath) {
        const tier = state.getValueForModel(modelId, tierPath);
        if (tier) el.dataset.tier = String(tier);
      }
    }

    // Status attributes for percentage fields
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
  }

  /**
   * Stamp S11 condensation risk indicators.
   * Graph computes cr_85-cr_95 ("risk"/"safe"/""); bridge renders 💧/🌵 + temp.
   */
  function stampCondensationIndicators(state, modelId, lookup, parse, fmt) {
    for (const oField of CONDENSATION_FIELDS) {
      const el = document.querySelector(`[data-field-id="${oField}"]`);
      if (!el) continue;

      const tempPath = lookup.get(oField);
      if (!tempPath) continue;
      const tempValue = state.getValueForModel(modelId, tempPath);

      // No assembly (area = 0) → empty cell
      if (tempValue === "" || tempValue === undefined || tempValue === null) {
        el.textContent = "";
        continue;
      }

      const temp = parse(tempValue, NaN);
      if (isNaN(temp)) { el.textContent = ""; continue; }

      // Read companion condensation risk node (cr_ field)
      const crField = "cr_" + oField.slice(2); // o_85 → cr_85
      const riskPath = lookup.get(crField);
      const risk = riskPath ? state.getValueForModel(modelId, riskPath) : "";

      const emoji = risk === "risk" ? "\uD83D\uDCA7" : risk === "safe" ? "\uD83C\uDF35" : "";
      const formatted = fmt(temp, "number-2dp-comma");
      el.textContent = emoji ? emoji + " " + formatted : formatted;
    }
  }

  /**
   * Stamp input elements (dropdowns, sliders, editable fields) for the current mode.
   * Called on mode switch so user-input fields reflect the correct model's values.
   * stampAll() skips INPUT/SELECT/TEXTAREA elements to avoid overwriting during edits;
   * this function explicitly updates them when the mode changes.
   */
  function stampInputsForMode() {
    const CI = window.TEUI.ComputationIntegration;
    if (!CI?.isInitialized?.()) return;

    const graph = CI.getGraph();
    const state = CI.getState();
    if (!graph || !state) return;

    const isRef = window.TEUI.ReferenceToggle?.isReferenceMode?.() || false;
    const targetModelId = state.getActiveModelId();
    const refModelId = isRef ? CI.getRefModelId() : null;
    const modelId = refModelId || targetModelId;
    if (!modelId) return;

    const FM = window.TEUI.FieldManager;
    const allFields = FM?.getAllFields?.();
    if (!allFields) return;

    const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];
    let stamped = 0;

    for (const semanticPath of inputIds) {
      // Skip reference.* bridge inputs — not user-visible fields
      if (semanticPath.startsWith("reference.")) continue;

      const inputNode = graph.getInput(semanticPath);
      const legacyId = inputNode?.legacyId;
      if (!legacyId) continue;

      const fieldDef = allFields[legacyId];
      if (!fieldDef) continue;

      const value = state.getValueForModel(modelId, semanticPath);
      if (value === undefined || value === null) continue;

      FM.updateFieldDisplay(legacyId, String(value), fieldDef);
      stamped++;
    }

    console.log(`[DOMBridge] Stamped ${stamped} inputs for ${isRef ? "reference" : "target"} mode`);

    // The sections' display rules run AFTER the stamp, as after a recompute: a mode switch stamped the
    // model's stored inputs over them (2026-11-20: S09's lighting under the Reference's F280 Mode On
    // showed the stored 1.5, not its 0 in effect; S03 G.4.5's ghosting followed the other model)
    runPostStamp();
  }

  /** The sections' postStamp hooks (display mirrors, key values, the rules that ghost or lock an input). */
  function runPostStamp() {
    const modules = window.TEUI.SectionModules || {};
    for (const key of ["sect01", "sect03", "sect10", "sect11", "sect12", "sect13", "sect16", "sect19", "sect21"]) {
      if (modules[key]?.postStamp) modules[key].postStamp();
    }
  }

  // ==========================================================================
  // GAIN/LOSS INDICATOR DOTS (S09, S10, S11)
  // ==========================================================================

  const GAIN_CLASSES = ["gain-high", "gain-medium", "gain-low"];
  const LOSS_CLASSES = ["loss-high", "loss-medium", "loss-low"];

  function setIndicator(fieldId, colorClass, baseClass) {
    const el = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (!el) return;
    el.classList.remove(...GAIN_CLASSES, ...LOSS_CLASSES, "gain-indicator", "loss-indicator");
    if (colorClass) {
      el.classList.add(baseClass, colorClass, "text-left-indicator");
    }
  }

  // Heating gain: higher % is better (green ≥30, yellow ≥10, red <10)
  function heatingGainClass(pct) {
    const v = Math.abs(pct);
    if (v >= 30) return "gain-high";
    if (v >= 10) return "gain-medium";
    return "gain-low";
  }

  // Cooling gain: lower % is better (green <5, yellow <15, red ≥15)
  function coolingGainClass(pct) {
    const v = Math.abs(pct);
    if (v >= 15) return "gain-low";
    if (v >= 5) return "gain-medium";
    return "gain-high";
  }

  // S10 heating: green ≥33, yellow ≥10, red <10
  function heatingGainClassS10(pct) {
    const v = Math.abs(pct);
    if (v >= 33) return "gain-high";
    if (v >= 10) return "gain-medium";
    return "gain-low";
  }

  // Heat loss contribution: red ≥15, yellow ≥5, green <5
  function lossContribClass(pct) {
    const v = Math.abs(pct);
    if (v >= 15) return "loss-high";
    if (v >= 5) return "loss-medium";
    return "loss-low";
  }

  function readPct(fieldId) {
    const el = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (!el) return 0;
    return parseFloat(String(el.textContent).replace(/[%,]/g, "")) || 0;
  }

  function stampGainLossIndicators() {
    // S09: Occupant + Internal Gains (rows 64-67, 69)
    for (const row of [64, 65, 66, 67, 69]) {
      const jPct = readPct(`j_${row}`);
      const lPct = readPct(`l_${row}`);
      setIndicator(`j_${row}`, heatingGainClass(jPct), "gain-indicator");
      setIndicator(`l_${row}`, coolingGainClass(lPct), "gain-indicator");
    }

    // S10: Radiant Gains (the opening rows, Openings.js)
    for (const row of window.TEUI.Openings.ALL.map(o => o.s10)) {
      const jPct = readPct(`j_${row}`);
      const lPct = readPct(`l_${row}`);
      setIndicator(`j_${row}`, heatingGainClassS10(jPct), "gain-indicator");
      setIndicator(`l_${row}`, coolingGainClass(lPct), "gain-indicator");
    }

    // S11: Transmission Losses (rows 85-95, 97, and the openings' twins after the first)
    for (const row of [85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 97, ...window.TEUI.Openings.SLOTS.map(o => o.s11), ...window.TEUI.Openings.OPAQUE_SLOTS.map(o => o.s11)]) {
      const jPct = readPct(`j_${row}`);
      const lPct = readPct(`l_${row}`);
      setIndicator(`j_${row}`, lossContribClass(jPct), "loss-indicator");
      setIndicator(`l_${row}`, coolingGainClass(lPct), "gain-indicator");
    }

  }

  // ==========================================================================
  // GHOSTING - an input that does not apply to this building (Andy: "greying out values that are not
  // relevant for a given building type or standard"). One helper, read by every section: the value cell
  // and its label take .disabled-input, the input stops taking edits (a select: styles.css :disabled).
  // ==========================================================================

  function ghostField(fieldId, ghosted) {
    const valueCell = document.querySelector(`td[data-field-id="${fieldId}"]`);
    if (!valueCell) return;
    valueCell.classList.toggle("disabled-input", ghosted);
    const input = valueCell.querySelector('input, select, [contenteditable="true"]');
    if (input) {
      if (input.hasAttribute("contenteditable")) input.contentEditable = !ghosted;
      else input.disabled = ghosted;
    }
    if (valueCell.hasAttribute("contenteditable")) valueCell.contentEditable = !ghosted;
    const labelCell = valueCell.previousElementSibling;
    if (labelCell && labelCell.tagName === "TD" && !labelCell.hasAttribute("data-field-id")) {
      labelCell.classList.toggle("disabled-input", ghosted);
    }
  }

  // ==========================================================================
  // EXPORT
  // ==========================================================================

  window.TEUI.DOMBridge = { stampAll, stampInputsForMode, runPostStamp, ghostField };

  console.log("[DOMBridge] Module loaded");
})();
