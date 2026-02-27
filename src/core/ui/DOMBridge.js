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
    l_12: "raw", l_13: "raw", l_14: "raw", l_15: "raw", l_16: "raw",

    // S03 Climate
    j_19: "number-1dp",
    d_20: "integer", d_21: "integer",
    d_22: "integer", h_22: "integer",
    d_25: "integer", l_22: "integer", l_24: "integer",
    e_23: "integer-nocomma", i_23: "integer-nocomma",
    e_24: "integer-nocomma", i_24: "integer-nocomma",
    e_25: "integer-nocomma",
    m_23: "raw", m_24: "raw",
    n_23: "raw", n_24: "raw",

    // S04 Energy: emission factor integers, nuclear waste 4dp
    l_27: "integer",
    l_28: "integer", l_29: "integer", l_30: "integer", l_31: "integer",
    l_33: "number-4dp",

    // S05 Embodied Carbon - raw strings
    m_38: "raw", m_39: "raw", m_40: "raw", m_41: "raw",
    n_38: "raw", n_39: "raw", n_40: "raw", n_41: "raw",

    // S06 Renewable Energy: integer kWh/yr and m³/yr
    d_43: "integer", i_43: "integer", i_45: "integer",
    d_44: "integer", d_45: "integer", d_46: "integer",
    i_44: "integer", i_46: "integer", k_45: "integer",

    // S07 Water Heating: integer occupancy, compliance ratios
    h_49: "integer", i_49: "integer", k_49: "integer",
    m_49: "raw", m_50: "raw", m_52: "raw", m_53: "raw",
    n_49: "raw", n_50: "raw", n_52: "raw", n_53: "raw",
    h_50: "number-1dp",

    // S08 Air Quality: integer targets and compliance
    d_56: "integer", d_57: "integer", d_58: "integer", d_59: "integer",
    k_56: "integer", k_57: "integer", k_58: "integer",
    m_56: "integer-percent", m_57: "integer-percent", m_58: "integer-percent",
    m_59: "raw",
    n_56: "raw", n_57: "raw", n_58: "raw", n_59: "raw",

    // S09 Occupancy: integer counts and hours
    d_63: "integer", h_63: "integer",
    g_63: "integer-nocomma", j_63: "integer-nocomma", i_63: "integer-nocomma",

    // S09 Internal Gains: densities as 1dp, seasonal split percentages
    d_65: "number-1dp", d_66: "number-1dp", d_67: "number-1dp",
    g_64: "number-2dp",
    j_64: "percent-0dp", j_65: "percent-0dp", j_66: "percent-0dp", j_67: "percent-0dp",
    j_69: "percent-0dp", j_71: "percent-0dp",
    l_64: "percent-0dp", l_65: "percent-0dp", l_66: "percent-0dp", l_67: "percent-0dp",
    l_69: "percent-0dp", l_71: "percent-0dp",
    // S09 Internal Gains: compliance ratios and checkmarks
    m_65: "raw", m_66: "raw", m_67: "raw",
    n_65: "raw", n_66: "raw", n_67: "raw",

    // S10 Radiant Gains: subtotal indicators and utilization factor
    j_79: "integer", l_79: "integer",
    g_81: "percent-2dp",

    // S11 Envelope: area percentages, thermal bridge decimal, heat loss/gain %
    h_85: "percent-0dp", h_86: "percent-0dp", h_87: "percent-0dp",
    h_88: "percent-0dp", h_89: "percent-0dp", h_90: "percent-0dp",
    h_91: "percent-0dp", h_92: "percent-0dp", h_93: "percent-0dp",
    h_94: "percent-0dp", h_95: "percent-0dp", h_98: "raw",
    e_97: "number-3dp",
    j_97: "percent-0dp", j_98: "percent-0dp",
    l_97: "percent-0dp", l_98: "percent-0dp",
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

    // S12 Volume Metrics: WWR as percent, ELA10 as 3dp, compliance text and checkmarks
    d_107: "percent-2dp", d_110: "number-3dp",
    i_110: "integer",
    l_101: "percent-2dp", l_102: "percent-2dp", l_103: "percent-2dp", l_104: "percent-0dp",
    m_104: "raw", n_104: "raw",
    m_107: "raw", n_107: "raw",
    m_109: "raw", n_109: "raw",
    m_110: "raw", n_110: "raw",

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
    h_135: "number-2dp-comma", l_141: "number-2dp-comma",
    d_141: "number-2dp-comma", h_141: "number-2dp-comma",
    d_142: "number-2dp-comma", h_142: "number-2dp-comma",
    d_143: "number-1dp", h_143: "number-1dp", l_143: "number-1dp",
    d_144: "percent-0dp", h_144: "percent-0dp", l_144: "percent-0dp",
    d_145: "number-2dp-comma",
  };

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
    "o_90", "o_91", "o_92", "o_93", "o_94", "o_95"
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
      }
    }

    // Stamp Section01 data attributes (tier badges, status indicators)
    stampSection01Attributes(state, targetModelId, legacyToSemantic, parse);

    // Stamp S11 condensation risk indicators (🌵/💧 + surface temp)
    stampCondensationIndicators(state, refModelId || targetModelId, legacyToSemantic, parse, fmt);

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

  // ==========================================================================
  // EXPORT
  // ==========================================================================

  window.TEUI.DOMBridge = { stampAll };

  console.log("[DOMBridge] Module loaded");
})();
