/**
 * VolumeMetricsNodes.js - Building Volume & Surface Metrics (Section 12)
 *
 * Calculates envelope areas, heat loss rates, and totals per Section12.js formulas:
 * - d_101 = Total Air-Facing Area (Ae) = SUM(d_85:d_93)
 * - d_102 = Total Ground-Facing Area (Ag) = SUM(d_94:d_95)
 * - g_101 = Weighted U-Value for Ae
 * - h_101 = Heat Loss Rate per m² (Ae) = (g_101 × HDD × 24) / 1000
 * - i_101 = Total Heat Loss (Ae) = h_101 × d_101
 * - i_102 = Total Heat Loss (Ag) = h_102 × d_102
 * - i_103 = Air Leakage Heat Loss
 * - i_104 = Total Envelope Heat Loss = i_101 + i_102 + i_103
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  function parseNum(value, defaultVal = 0) {
    if (value === null || value === undefined || value === "N/A") return defaultVal;
    if (value === "Unavailable") return defaultVal;
    const num = parseFloat(String(value).replace(/,/g, ""));
    return isNaN(num) ? defaultVal : num;
  }

  function isUnavailable(value) {
    return value === "Unavailable" || value === "N/A";
  }

  // N-factor lookup table from Section12.js calculateNFactor()
  // Indexed by [climateZone][shielding][stories]
  const N_FACTOR_TABLE = {
    1: {
      Shielded: { 1: 18.6, 1.5: 16.7, 2: 14.8, 3: 13.0, 4: 11.2, 5: 9.4, 6: 7.6 },
      Normal:   { 1: 15.5, 1.5: 14.0, 2: 12.4, 3: 10.9, 4: 9.4, 5: 7.9, 6: 6.4 },
      Exposed:  { 1: 14.0, 1.5: 12.6, 2: 11.2, 3: 9.8, 4: 13.0, 5: 13.0, 6: 13.0 }
    },
    2: {
      Shielded: { 1: 22.2, 1.5: 20.0, 2: 17.8, 3: 15.5, 4: 13.2, 5: 10.9, 6: 8.6 },
      Normal:   { 1: 18.5, 1.5: 16.7, 2: 14.8, 3: 13.0, 4: 11.2, 5: 9.4, 6: 7.6 },
      Exposed:  { 1: 16.7, 1.5: 15.0, 2: 13.3, 3: 11.7, 4: 10.1, 5: 8.5, 6: 6.9 }
    },
    3: {
      Shielded: { 1: 25.8, 1.5: 23.1, 2: 20.6, 3: 18.1, 4: 15.6, 5: 13.1, 6: 10.6 },
      Normal:   { 1: 21.5, 1.5: 19.4, 2: 17.2, 3: 15.1, 4: 13.0, 5: 10.9, 6: 8.8 },
      Exposed:  { 1: 19.4, 1.5: 17.4, 2: 15.5, 3: 13.5, 4: 11.5, 5: 9.5, 6: 7.5 }
    }
  };

  function getStoryKey(stories) {
    if (stories <= 1) return 1;
    if (stories <= 1.75) return 1.5;
    if (stories < 2.5) return 2;
    if (stories < 3.5) return 3;
    if (stories < 4.5) return 4;
    if (stories < 5.5) return 5;
    return 6;
  }

  function register(graph) {
    const inputs = [
      // Volume inputs (from Section12.js field mappings)
      { id: "volume.floorToFloorHeight", legacyId: "g_106", section: "S12", classification: "C", label: "Floor-to-Floor Height (m)", defaultValue: 2.7 },
      { id: "volume.numStoreys", legacyId: "d_103", section: "S12", classification: "C", label: "Number of Storeys", defaultValue: 1.5 },
      { id: "airTightness.shielding", legacyId: "g_103", section: "S12", classification: "C", label: "Shielding", defaultValue: "Normal" },

      // Air tightness inputs
      { id: "airTightness.method", legacyId: "d_108", section: "S12", classification: "C", label: "Air Tightness Method", defaultValue: "AL-1B" },
      { id: "airTightness.measuredAch50", legacyId: "g_109", section: "S12", classification: "C", label: "Measured ACH50", defaultValue: 3.0 },

      // Conditioned volume (user input or from S02)
      { id: "volume.conditioned", legacyId: "d_105", section: "S12", classification: "C", label: "Conditioned Volume (m³)", defaultValue: 0 },
    ];

    graph.registerInputs(inputs);

    // ========================================================================
    // ENVELOPE AREA TOTALS (Row 101, 102)
    // From Section12.js line 1697: d_101 = sum of air-facing component areas
    // ========================================================================

    // d_101: Total Air-Facing Area (Ae) - uses d_91 from TransmissionLossNodes
    graph.registerNode({
      id: "envelope.airFacing.area",
      legacyId: "d_101",
      section: "S12",
      classification: "C",
      dependencies: ["transmissionLoss.airFacing.totalArea"],
      label: "Total Air-Facing Envelope Area (Ae) (m²)",
      compute: (inputs) => {
        // d_101 = sum of air-facing component areas from S11
        return parseNum(inputs["transmissionLoss.airFacing.totalArea"]);
      }
    });

    // d_102: Total Ground-Facing Area (Ag) - uses d_95 from TransmissionLossNodes
    graph.registerNode({
      id: "envelope.groundFacing.area",
      legacyId: "d_102",
      section: "S12",
      classification: "C",
      dependencies: ["transmissionLoss.groundFacing.totalArea"],
      label: "Total Ground-Facing Envelope Area (Ag) (m²)",
      compute: (inputs) => {
        // d_102 = sum of ground-facing component areas from S11
        return parseNum(inputs["transmissionLoss.groundFacing.totalArea"]);
      }
    });

    // d_104: Total Envelope Area
    graph.registerNode({
      id: "envelope.total.area",
      legacyId: "d_104",
      section: "S12",
      classification: "C",
      dependencies: ["envelope.airFacing.area", "envelope.groundFacing.area"],
      label: "Total Envelope Area (m²)",
      compute: (inputs) => {
        return parseNum(inputs["envelope.airFacing.area"]) +
               parseNum(inputs["envelope.groundFacing.area"]);
      }
    });

    // ========================================================================
    // WEIGHTED U-VALUES (Row 101, 102)
    // From Section12.js calculateCombinedUValue function
    // ========================================================================

    // g_101: Weighted U-Value for Air-Facing Envelope
    graph.registerNode({
      id: "envelope.airFacing.uValue",
      legacyId: "g_101",
      section: "S12",
      classification: "C",
      dependencies: ["transmissionLoss.airFacing.weightedUValue"],
      label: "Weighted U-Value for Air-Facing (W/m²K)",
      compute: (inputs) => {
        return parseNum(inputs["transmissionLoss.airFacing.weightedUValue"]);
      }
    });

    // g_102: Weighted U-Value for Ground-Facing Envelope
    // Note: Ground-facing components typically have different U-values
    // Includes thermal bridge penalty factor as per legacy Section12.js formula
    graph.registerNode({
      id: "envelope.groundFacing.uValue",
      legacyId: "g_102",
      section: "S12",
      classification: "C",
      dependencies: [
        "transmissionLoss.wallsBelowGrade.area",
        "transmissionLoss.wallsBelowGrade.uValue",
        "transmissionLoss.slabOnGrade.area",
        "transmissionLoss.slabOnGrade.uValue",
        "transmissionLoss.groundFacing.totalArea",
        "transmissionLoss.thermalBridgePenalty"
      ],
      label: "Weighted U-Value for Ground-Facing (W/m²K)",
      compute: (inputs) => {
        const totalArea = parseNum(inputs["transmissionLoss.groundFacing.totalArea"], 1);
        if (totalArea === 0) return 0;

        // Weighted average of ground-facing component U-values
        const wallsArea = parseNum(inputs["transmissionLoss.wallsBelowGrade.area"]);
        const wallsU = parseNum(inputs["transmissionLoss.wallsBelowGrade.uValue"]);
        const slabOnArea = parseNum(inputs["transmissionLoss.slabOnGrade.area"]);
        const slabOnU = parseNum(inputs["transmissionLoss.slabOnGrade.uValue"]);

        const weightedSum = (wallsArea * wallsU) + (slabOnArea * slabOnU);

        // Include thermal bridge penalty factor: g_102 = weighted_avg × (1 + d_97/100)
        const penaltyPercent = parseNum(inputs["transmissionLoss.thermalBridgePenalty"], 5);
        const tbFactor = 1 + penaltyPercent / 100;
        return (weightedSum / totalArea) * tbFactor;
      }
    });

    // ========================================================================
    // HEAT LOSS RATES (Row 101, 102)
    // From Section12.js line 2556: h_101 = (g_101 × HDD × 24) / 1000
    // ========================================================================

    // h_101: Heat Loss Rate per m² (Air-Facing)
    graph.registerNode({
      id: "envelope.airFacing.heatLossRate",
      legacyId: "h_101",
      section: "S12",
      classification: "C",
      dependencies: ["envelope.airFacing.uValue", "climate.heating.degreedays"],
      label: "Heat Loss Rate (Ae) (kWh/m²/yr)",
      compute: (inputs) => {
        const hdd = inputs["climate.heating.degreedays"];
        if (isUnavailable(hdd)) return "Unavailable";
        // h_101 = (g_101 × HDD × 24) / 1000
        const uValue = parseNum(inputs["envelope.airFacing.uValue"]);
        return (uValue * parseNum(hdd) * 24) / 1000;
      }
    });

    // h_102: Heat Loss Rate per m² (Ground-Facing)
    graph.registerNode({
      id: "envelope.groundFacing.heatLossRate",
      legacyId: "h_102",
      section: "S12",
      classification: "C",
      dependencies: ["envelope.groundFacing.uValue", "climate.groundFacing.hdd"],
      label: "Heat Loss Rate (Ag) (kWh/m²/yr)",
      compute: (inputs) => {
        const groundHdd = inputs["climate.groundFacing.hdd"];
        if (isUnavailable(groundHdd)) return "Unavailable";
        // h_102 = (g_102 × Ground HDD × 24) / 1000
        const uValue = parseNum(inputs["envelope.groundFacing.uValue"]);
        return (uValue * parseNum(groundHdd) * 24) / 1000;
      }
    });

    // ========================================================================
    // ENVELOPE HEAT LOSSES (Row 101, 102)
    // From Section12.js line 2557: i_101 = h_101 × d_101
    // ========================================================================

    // i_101: Total Heat Loss (Air-Facing)
    graph.registerNode({
      id: "envelope.airFacing.totalHeatLoss",
      legacyId: "i_101",
      section: "S12",
      classification: "C",
      dependencies: ["envelope.airFacing.heatLossRate", "envelope.airFacing.area"],
      label: "Total Heat Loss (Ae) (kWh/yr)",
      compute: (inputs) => {
        // i_101 = h_101 × d_101
        const rate = parseNum(inputs["envelope.airFacing.heatLossRate"]);
        const area = parseNum(inputs["envelope.airFacing.area"]);
        return rate * area;
      }
    });

    // i_102: Total Heat Loss (Ground-Facing)
    graph.registerNode({
      id: "envelope.groundFacing.totalHeatLoss",
      legacyId: "i_102",
      section: "S12",
      classification: "C",
      dependencies: ["envelope.groundFacing.heatLossRate", "envelope.groundFacing.area"],
      label: "Total Heat Loss (Ag) (kWh/yr)",
      compute: (inputs) => {
        // i_102 = h_102 × d_102
        const rate = parseNum(inputs["envelope.groundFacing.heatLossRate"]);
        const area = parseNum(inputs["envelope.groundFacing.area"]);
        return rate * area;
      }
    });

    // ========================================================================
    // ENVELOPE HEAT GAINS (Row 101, 102)
    // Migrated from EnvelopeNodes.js during consolidation
    // ========================================================================

    // Heat gains (rows 101-102): each envelope's share of the unmitigated
    // ISO 52016-1 monthly need (cooling.iso52016, CoolingNodes.js) - the sum
    // of its S11 components' shares, opaque solar included; the j column is
    // that per m².
    const AIR_KEYS = ["roof", "walls", "exposedFloor", "doors", "windowNorth", "windowEast",
      "windowSouth", "windowWest", "skylights"];
    const GROUND_KEYS = ["wallsBelowGrade", "slabOnGrade"];
    const share = (inputs, keys) =>
      keys.reduce((s, k) => s + (inputs["cooling.iso52016"]?.rows?.[k] ?? 0), 0);

    // k_101: Total Heat Gain (Air-Facing)
    graph.registerNode({
      id: "envelope.airFacing.totalHeatGain",
      legacyId: "k_101",
      section: "S12",
      classification: "C",
      dependencies: ["cooling.iso52016"],
      label: "Total Heat Gain (Ae) (kWh/yr)",
      compute: (inputs) => share(inputs, AIR_KEYS)
    });

    // j_101: Heat Gain Rate (Air-Facing)
    graph.registerNode({
      id: "envelope.airFacing.heatGainRate",
      legacyId: "j_101",
      section: "S12",
      classification: "C",
      dependencies: ["envelope.airFacing.totalHeatGain", "envelope.airFacing.area"],
      label: "Heat Gain Rate (Ae) (kWh/m²)",
      compute: (inputs) => {
        const area = parseNum(inputs["envelope.airFacing.area"], 0);
        return area > 0 ? parseNum(inputs["envelope.airFacing.totalHeatGain"]) / area : 0;
      }
    });

    // k_102: Total Heat Gain (Ground-Facing)
    graph.registerNode({
      id: "envelope.groundFacing.totalHeatGain",
      legacyId: "k_102",
      section: "S12",
      classification: "C",
      dependencies: ["cooling.iso52016"],
      label: "Total Heat Gain (Ag) (kWh/yr)",
      compute: (inputs) => share(inputs, GROUND_KEYS)
    });

    // j_102: Heat Gain Rate (Ground-Facing)
    graph.registerNode({
      id: "envelope.groundFacing.heatGainRate",
      legacyId: "j_102",
      section: "S12",
      classification: "C",
      dependencies: ["envelope.groundFacing.totalHeatGain", "envelope.groundFacing.area"],
      label: "Heat Gain Rate (Ag) (kWh/m²)",
      compute: (inputs) => {
        const area = parseNum(inputs["envelope.groundFacing.area"], 0);
        return area > 0 ? parseNum(inputs["envelope.groundFacing.totalHeatGain"]) / area : 0;
      }
    });

    // ========================================================================
    // AIR LEAKAGE - NRL50 and Heat Loss (Row 103, 108)
    // From Section12.js calculateACH50Target and calculateAirLeakageHeatLoss
    // ========================================================================

    // NRL50 preset lookup values (from Section12.js line 2076-2090)
    const NRL50_PRESETS = {
      "AL-1A": 0.89,
      "AL-2A": 0.71,
      "AL-3A": 0.53,
      "AL-4A": 0.35,
      "AL-1B": 1.17,
      "AL-2B": 0.94,
      "AL-3B": 0.70,
      "AL-4B": 0.47
    };

    // g_108: NRL50 Target (Normalized Leakage Rate at 50Pa in L/s/m²)
    // From Section12.js line 2096-2106
    graph.registerNode({
      id: "airTightness.nrl50",
      legacyId: "g_108",
      section: "S12",
      classification: "C",
      dependencies: [
        "airTightness.method",
        "airTightness.measuredAch50",
        "volume.conditioned",
        "envelope.airFacing.area"
      ],
      label: "NRL50 Target (L/s·m²)",
      compute: (inputs) => {
        const method = inputs["airTightness.method"] || "AL-1B";
        const measuredAch50 = parseNum(inputs["airTightness.measuredAch50"], 3);
        const volume = parseNum(inputs["volume.conditioned"]);
        const areaAir = parseNum(inputs["envelope.airFacing.area"]);

        // Helper: Convert ACH50 to NRL50
        // NRL50 = ACH50 × volume / (area × 3.6)
        const achToNrl = (ach) => {
          return areaAir > 0 && volume > 0 ? (ach * volume) / (areaAir * 3.6) : 0;
        };

        if (method === "MEASURED") {
          return achToNrl(measuredAch50);
        } else if (method === "PH_CLASSIC") {
          return achToNrl(0.6);
        } else if (method === "PH_LOW") {
          return achToNrl(1.0);
        } else if (method === "PH_PLUS") {
          return 0.1;
        } else {
          // Use preset value from lookup table
          return NRL50_PRESETS[method] || 1.17;
        }
      }
    });

    // d_109: ACH50 Target (calculated from NRL50)
    // From Section12.js line 2117-2119
    graph.registerNode({
      id: "airTightness.ach50Target",
      legacyId: "d_109",
      section: "S12",
      classification: "C",
      dependencies: [
        "airTightness.nrl50",
        "envelope.airFacing.area",
        "volume.conditioned"
      ],
      label: "ACH50 Target",
      compute: (inputs) => {
        const nrl50 = parseNum(inputs["airTightness.nrl50"]);
        const areaAir = parseNum(inputs["envelope.airFacing.area"]);
        const volume = parseNum(inputs["volume.conditioned"]);
        // ACH50 = NRL50 × (area / volume) × 3.6
        return volume > 0 && areaAir > 0 ? nrl50 * (areaAir / volume) * 3.6 : 0;
      }
    });

    // g_110: N-Factor (calculated from climate zone, shielding, stories)
    // From Section12.js calculateNFactor() lines 2219-2368
    graph.registerNode({
      id: "airTightness.nFactor",
      legacyId: "g_110",
      section: "S12",
      classification: "C",
      dependencies: [
        "climate.zone",
        "airTightness.shielding",
        "volume.numStoreys"
      ],
      label: "N-Factor",
      compute: (inputs) => {
        const climateZone = parseNum(inputs["climate.zone"], 6);
        const shielding = inputs["airTightness.shielding"] || "Normal";
        const stories = parseNum(inputs["volume.numStoreys"], 1.5);

        // Determine zone number from climate zone (1-3)
        let zoneNum = 2;
        if (climateZone <= 4) zoneNum = 1;
        else if (climateZone >= 7) zoneNum = 3;

        // Determine shielding key
        const shieldingKey = shielding === "Shielded" ? "Shielded"
          : shielding === "Exposed" ? "Exposed"
          : "Normal";

        // Get story key
        const storyKey = getStoryKey(stories);

        // Lookup N-factor, default to Normal zone 2, 1.5 stories
        const nFactor = N_FACTOR_TABLE[zoneNum]?.[shieldingKey]?.[storyKey]
          ?? N_FACTOR_TABLE[2]["Normal"][1.5];

        return nFactor;
      }
    });

    // i_103: Air Leakage Heat Loss
    // From Section12.js line 2564-2571:
    // baseLeakageCoefficient = (1.21 × NRL50 × area_air) / N_factor
    // i_103 = (baseLeakageCoefficient × HDD × 24) / 1000
    graph.registerNode({
      id: "airTightness.heatLoss",
      legacyId: "i_103",
      section: "S12",
      classification: "C",
      dependencies: [
        "airTightness.nrl50",
        "envelope.airFacing.area",
        "airTightness.nFactor",
        "climate.heating.degreedays"
      ],
      label: "Air Leakage Heat Loss (kWh/yr)",
      compute: (inputs) => {
        const hdd = inputs["climate.heating.degreedays"];
        if (isUnavailable(hdd)) return "Unavailable";

        const nrl50 = parseNum(inputs["airTightness.nrl50"]);
        const areaAir = parseNum(inputs["envelope.airFacing.area"]);
        const nFactor = parseNum(inputs["airTightness.nFactor"], 13);

        // Legacy formula: (1.21 × NRL50 × area / N_factor × HDD × 24) / 1000
        const leakageFactor = 1.21;
        const baseLeakageCoefficient = nFactor > 0
          ? (leakageFactor * nrl50 * areaAir) / nFactor
          : 0;

        return (baseLeakageCoefficient * parseNum(hdd) * 24) / 1000;
      }
    });

    // k_103: Air Leakage Heat Gain - the leakage's share of the unmitigated
    // ISO 52016-1 monthly need (cooling.iso52016, CoolingNodes.js)
    graph.registerNode({
      id: "airTightness.heatGain",
      legacyId: "k_103",
      section: "S12",
      classification: "C",
      dependencies: ["cooling.iso52016"],
      label: "Air Leakage Heat Gain (kWh/yr)",
      compute: (inputs) => inputs["cooling.iso52016"]?.rows?.leak ?? 0
    });

    // ========================================================================
    // TOTAL ENVELOPE HEAT LOSS (Row 104)
    // From Section12.js line 2700: i_104 = i_101 + i_102 + i_103
    // ========================================================================

    // i_104: Total Envelope Heat Loss (used in TEUI d_135 calculation)
    graph.registerNode({
      id: "envelope.total.heatLoss",
      legacyId: "i_104",
      section: "S12",
      classification: "C",
      dependencies: [
        "envelope.airFacing.totalHeatLoss",
        "envelope.groundFacing.totalHeatLoss",
        "airTightness.heatLoss"
      ],
      label: "Total Envelope Heat Loss (kWh/yr)",
      compute: (inputs) => {
        // i_104 = i_101 + i_102 + i_103
        // Use default 0 to handle "Unavailable" values gracefully
        const i101 = parseNum(inputs["envelope.airFacing.totalHeatLoss"], 0);
        const i102 = parseNum(inputs["envelope.groundFacing.totalHeatLoss"], 0);
        const i103 = parseNum(inputs["airTightness.heatLoss"], 0);
        return i101 + i102 + i103;
      }
    });

    // k_104: Total Envelope Heat Gain
    // Excel: =IF(H21="Capacitance", K98, SUM(K101:K102))
    // NOTE: k_103 (air leakage heat gain) is NOT included in this sum
    // NOTE: since the ISO 52016-1 cooling, k_101 + k_102 and k_98 are the same
    //       sum - S11's components' shares of the monthly need - so the
    //       Capacitance setting no longer changes the cooling (thermal mass is
    //       C_m from S05's typology, inside the need).
    graph.registerNode({
      id: "envelope.total.heatGain",
      legacyId: "k_104",
      section: "S12",
      classification: "C",
      dependencies: [
        "envelope.airFacing.totalHeatGain",
        "envelope.groundFacing.totalHeatGain",
        "transmissionLoss.components.subtotalHeatGain",
        "building.capacitance.setting"
      ],
      label: "Total Envelope Heat Gain (kWh/yr)",
      compute: (inputs) => {
        const capacitanceSetting = inputs["building.capacitance.setting"] || "No Capacitance";

        if (capacitanceSetting === "Capacitance") {
          // Use k_98 from Section 11 (component sums)
          return parseNum(inputs["transmissionLoss.components.subtotalHeatGain"], 0);
        } else {
          // k_104 = k_101 + k_102 from Section 12 (weighted U-values × area)
          const k101 = parseNum(inputs["envelope.airFacing.totalHeatGain"], 0);
          const k102 = parseNum(inputs["envelope.groundFacing.totalHeatGain"], 0);
          return k101 + k102;
        }
      }
    });

    // ========================================================================
    // COMBINED ENVELOPE METRICS
    // ========================================================================

    // g_104: Combined Weighted U-value
    graph.registerNode({
      id: "envelope.combined.uValue",
      legacyId: "g_104",
      section: "S12",
      classification: "C",
      dependencies: [
        "envelope.airFacing.uValue",
        "envelope.airFacing.area",
        "envelope.groundFacing.uValue",
        "envelope.groundFacing.area"
      ],
      label: "Combined Envelope U-Value (W/m²K)",
      compute: (inputs) => {
        // g_104 = (g_101 × d_101 + g_102 × d_102) / (d_101 + d_102)
        const g101 = parseNum(inputs["envelope.airFacing.uValue"]);
        const d101 = parseNum(inputs["envelope.airFacing.area"]);
        const g102 = parseNum(inputs["envelope.groundFacing.uValue"]);
        const d102 = parseNum(inputs["envelope.groundFacing.area"]);
        const totalArea = d101 + d102 + 0.000001; // Avoid division by zero
        return (g101 * d101 + g102 * d102) / totalArea;
      }
    });

    // ========================================================================
    // d_107: Window-to-Wall Ratio (WWR)
    // Excel: =SUM(D88:D92)/(D86+SUM(D88:D92))   excludes skylights d_93
    // ========================================================================
    graph.registerNode({
      id: "envelope.wwr",
      legacyId: "d_107",
      section: "S12",
      classification: "C",
      dependencies: [
        "transmissionLoss.walls.area",
        "transmissionLoss.doors.area",
        "transmissionLoss.windowNorth.area",
        "transmissionLoss.windowEast.area",
        "transmissionLoss.windowSouth.area",
        "transmissionLoss.windowWest.area"
      ],
      label: "Window-to-Wall Ratio",
      compute: (inputs) => {
        const d86 = parseNum(inputs["transmissionLoss.walls.area"]);
        const d88 = parseNum(inputs["transmissionLoss.doors.area"]);
        const d89 = parseNum(inputs["transmissionLoss.windowNorth.area"]);
        const d90 = parseNum(inputs["transmissionLoss.windowEast.area"]);
        const d91 = parseNum(inputs["transmissionLoss.windowSouth.area"]);
        const d92 = parseNum(inputs["transmissionLoss.windowWest.area"]);
        const windowArea = d88 + d89 + d90 + d91 + d92;
        const totalWallArea = d86 + windowArea;
        return totalWallArea > 0 ? windowArea / totalWallArea : 0;
      }
    });

    // ========================================================================
    // d_110: Equivalent Leakage Area at 10 Pa (ELA10)
    // Formula: ACH50 × Volume / 3600
    // ========================================================================
    graph.registerNode({
      id: "airTightness.ela10",
      legacyId: "d_110",
      section: "S12",
      classification: "C",
      dependencies: [
        "airTightness.ach50Target",
        "volume.conditioned"
      ],
      label: "Equivalent Leakage Area at 10 Pa (m²)",
      compute: (inputs) => {
        const ach50 = parseNum(inputs["airTightness.ach50Target"]);
        const volume = parseNum(inputs["volume.conditioned"]);
        return volume > 0 ? (ach50 * volume) / 3600 : 0;
      }
    });

    // ========================================================================
    // TOTAL FLOOR AREA + DISPLAY METRICS (S12 ungraphed)
    // ========================================================================

    // d_106: Total Floor Area (conditioned + unconditioned)
    // = d_87 (exposed floor) + d_95 (slab) + d_96 (interior floor)
    graph.registerNode({
      id: "geometry.totalFloorArea",
      legacyId: "d_106",
      section: "S12",
      classification: "C",
      dependencies: [
        "transmissionLoss.exposedFloor.area",
        "transmissionLoss.slabOnGrade.area",
        "transmissionLoss.interiorFloorArea"
      ],
      label: "Total Floor Area (m²)",
      compute: (inputs) => {
        const d87 = parseNum(inputs["transmissionLoss.exposedFloor.area"]);
        const d95 = parseNum(inputs["transmissionLoss.slabOnGrade.area"]);
        const d96 = parseNum(inputs["transmissionLoss.interiorFloorArea"]);
        return d87 + d95 + d96;
      },
    });

    // g_105: Volume to Area Ratio (m³/m²)
    graph.registerNode({
      id: "geometry.volumeToAreaRatio",
      legacyId: "g_105",
      section: "S12",
      classification: "C",
      dependencies: ["volume.conditioned", "envelope.airFacing.area"],
      label: "Volume/Area Ratio (m³/m²)",
      compute: (inputs) => {
        const vol = parseNum(inputs["volume.conditioned"]);
        const area = parseNum(inputs["envelope.airFacing.area"]);
        return area > 0 ? vol / area : 0;
      },
    });

    // i_105: Area to Volume Ratio (m²/m³)
    graph.registerNode({
      id: "geometry.areaToVolumeRatio",
      legacyId: "i_105",
      section: "S12",
      classification: "C",
      dependencies: ["envelope.airFacing.area", "volume.conditioned"],
      label: "Area/Volume Ratio (m²/m³)",
      compute: (inputs) => {
        const area = parseNum(inputs["envelope.airFacing.area"]);
        const vol = parseNum(inputs["volume.conditioned"]);
        return vol > 0 ? area / vol : 0;
      },
    });

    // g_107: Total Wall Area (opaque + windows, excludes skylights)
    graph.registerNode({
      id: "geometry.totalWallArea",
      legacyId: "g_107",
      section: "S12",
      classification: "C",
      dependencies: [
        "transmissionLoss.walls.area",
        "transmissionLoss.doors.area",
        "transmissionLoss.windowNorth.area",
        "transmissionLoss.windowEast.area",
        "transmissionLoss.windowSouth.area",
        "transmissionLoss.windowWest.area"
      ],
      label: "Total Wall Area (m²)",
      compute: (inputs) => {
        return parseNum(inputs["transmissionLoss.walls.area"])
          + parseNum(inputs["transmissionLoss.doors.area"])
          + parseNum(inputs["transmissionLoss.windowNorth.area"])
          + parseNum(inputs["transmissionLoss.windowEast.area"])
          + parseNum(inputs["transmissionLoss.windowSouth.area"])
          + parseNum(inputs["transmissionLoss.windowWest.area"]);
      },
    });

    // i_107: Total Window & Door Heat Loss
    graph.registerNode({
      id: "geometry.windowDoorHeatLoss",
      legacyId: "i_107",
      section: "S12",
      classification: "C",
      dependencies: [
        "transmissionLoss.doors.heatLoss",
        "transmissionLoss.windowNorth.heatLoss",
        "transmissionLoss.windowEast.heatLoss",
        "transmissionLoss.windowSouth.heatLoss",
        "transmissionLoss.windowWest.heatLoss"
      ],
      label: "Window/Door Heat Loss (kWh/yr)",
      compute: (inputs) => {
        return parseNum(inputs["transmissionLoss.doors.heatLoss"])
          + parseNum(inputs["transmissionLoss.windowNorth.heatLoss"])
          + parseNum(inputs["transmissionLoss.windowEast.heatLoss"])
          + parseNum(inputs["transmissionLoss.windowSouth.heatLoss"])
          + parseNum(inputs["transmissionLoss.windowWest.heatLoss"]);
      },
    });

    // i_110: Air Leakage Climate Zone Number (1/2/3 from climate zone)
    graph.registerNode({
      id: "airTightness.climateZoneNum",
      legacyId: "i_110",
      section: "S12",
      classification: "C",
      dependencies: ["climate.zone"],
      label: "Air Leakage Climate Zone",
      compute: (inputs) => {
        const cz = parseNum(inputs["climate.zone"], 6);
        if (cz <= 4) return 1;
        if (cz < 7) return 2;
        return 3;
      },
    });

    // l_101-l_104: Heat loss percentages
    graph.registerNode({
      id: "envelope.airFacing.lossPercent",
      legacyId: "l_101",
      section: "S12",
      classification: "C",
      dependencies: ["envelope.airFacing.totalHeatLoss", "envelope.total.heatLoss"],
      label: "Air-Facing Heat Loss %",
      compute: (inputs) => {
        const loss = parseNum(inputs["envelope.airFacing.totalHeatLoss"]);
        const total = parseNum(inputs["envelope.total.heatLoss"]);
        return total > 0 ? loss / total : 0;
      },
    });

    graph.registerNode({
      id: "envelope.groundFacing.lossPercent",
      legacyId: "l_102",
      section: "S12",
      classification: "C",
      dependencies: ["envelope.groundFacing.totalHeatLoss", "envelope.total.heatLoss"],
      label: "Ground-Facing Heat Loss %",
      compute: (inputs) => {
        const loss = parseNum(inputs["envelope.groundFacing.totalHeatLoss"]);
        const total = parseNum(inputs["envelope.total.heatLoss"]);
        return total > 0 ? loss / total : 0;
      },
    });

    graph.registerNode({
      id: "airLeakage.lossPercent",
      legacyId: "l_103",
      section: "S12",
      classification: "C",
      dependencies: ["airTightness.heatLoss", "envelope.total.heatLoss"],
      label: "Air Leakage Heat Loss %",
      compute: (inputs) => {
        const loss = parseNum(inputs["airTightness.heatLoss"]);
        const total = parseNum(inputs["envelope.total.heatLoss"]);
        return total > 0 ? loss / total : 0;
      },
    });

    graph.registerNode({
      id: "envelope.total.lossPercent",
      legacyId: "l_104",
      section: "S12",
      classification: "C",
      dependencies: ["envelope.airFacing.lossPercent", "envelope.groundFacing.lossPercent", "airLeakage.lossPercent"],
      label: "Total Heat Loss % (checksum)",
      compute: (inputs) => {
        return parseNum(inputs["envelope.airFacing.lossPercent"])
          + parseNum(inputs["envelope.groundFacing.lossPercent"])
          + parseNum(inputs["airLeakage.lossPercent"]);
      },
    });

    // ========================================================================
    // AGGREGATE SURFACE TEMPERATURES (o_101, o_102, o_104)
    // T_si = T_interior - (U × ΔT × R_si) using weighted U-values
    // ========================================================================

    // o_101: Air-facing aggregate surface temperature
    graph.registerNode({
      id: "envelope.airFacing.surfaceTemp",
      legacyId: "o_101",
      section: "S12",
      classification: "C",
      dependencies: [
        "envelope.airFacing.area",
        "envelope.airFacing.uValue",
        "climate.heating.setpoint",
        "climate.temperature.winterAverage"
      ],
      label: "Air-Facing Aggregate Surface Temp (°C)",
      compute: (inputs) => {
        const area = parseNum(inputs["envelope.airFacing.area"]);
        if (area <= 0) return "";
        const uValue = parseNum(inputs["envelope.airFacing.uValue"]);
        const tInt = parseNum(inputs["climate.heating.setpoint"], 21);
        const tExt = parseNum(inputs["climate.temperature.winterAverage"], -5);
        const deltaT = tInt - tExt;
        return Math.round((tInt - uValue * deltaT * 0.13) * 100) / 100;
      }
    });

    // o_102: Ground-facing aggregate surface temperature
    graph.registerNode({
      id: "envelope.groundFacing.surfaceTemp",
      legacyId: "o_102",
      section: "S12",
      classification: "C",
      dependencies: [
        "envelope.groundFacing.area",
        "envelope.groundFacing.uValue",
        "climate.heating.setpoint"
      ],
      label: "Ground-Facing Aggregate Surface Temp (°C)",
      compute: (inputs) => {
        const area = parseNum(inputs["envelope.groundFacing.area"]);
        if (area <= 0) return "";
        const uValue = parseNum(inputs["envelope.groundFacing.uValue"]);
        const tInt = parseNum(inputs["climate.heating.setpoint"], 21);
        const groundTemp = 10;
        const deltaT = tInt - groundTemp;
        return Math.round((tInt - uValue * deltaT * 0.17) * 100) / 100;
      }
    });

    // ========================================================================
    // CONDENSATION RISK INDICATORS (cr_101, cr_102)
    // Same Passivhaus threshold as S11: risk when T_surface < T_interior - 4.2°C
    // ========================================================================
    const RISK_THRESHOLD = 4.2;

    graph.registerNode({
      id: "envelope.airFacing.condensationRisk",
      legacyId: "cr_101",
      section: "S12",
      classification: "C",
      dependencies: [
        "envelope.airFacing.surfaceTemp",
        "climate.heating.setpoint"
      ],
      label: "Air-Facing Condensation Risk",
      compute: (inputs) => {
        const surfaceTemp = inputs["envelope.airFacing.surfaceTemp"];
        if (surfaceTemp === "" || surfaceTemp === null || surfaceTemp === undefined) return "";
        const tInterior = parseNum(inputs["climate.heating.setpoint"], 21);
        return parseNum(surfaceTemp) < (tInterior - RISK_THRESHOLD) ? "risk" : "safe";
      }
    });

    graph.registerNode({
      id: "envelope.groundFacing.condensationRisk",
      legacyId: "cr_102",
      section: "S12",
      classification: "C",
      dependencies: [
        "envelope.groundFacing.surfaceTemp",
        "climate.heating.setpoint"
      ],
      label: "Ground-Facing Condensation Risk",
      compute: (inputs) => {
        const surfaceTemp = inputs["envelope.groundFacing.surfaceTemp"];
        if (surfaceTemp === "" || surfaceTemp === null || surfaceTemp === undefined) return "";
        const tInterior = parseNum(inputs["climate.heating.setpoint"], 21);
        return parseNum(surfaceTemp) < (tInterior - RISK_THRESHOLD) ? "risk" : "safe";
      }
    });

    // o_104: Total building aggregate surface temperature (area-weighted ΔT)
    graph.registerNode({
      id: "envelope.total.surfaceTemp",
      legacyId: "o_104",
      section: "S12",
      classification: "C",
      dependencies: [
        "envelope.airFacing.area",
        "envelope.groundFacing.area",
        "envelope.combined.uValue",
        "climate.heating.setpoint",
        "climate.temperature.winterAverage"
      ],
      label: "Total Aggregate Surface Temp (°C)",
      compute: (inputs) => {
        const d101 = parseNum(inputs["envelope.airFacing.area"]);
        const d102 = parseNum(inputs["envelope.groundFacing.area"]);
        const totalArea = d101 + d102;
        if (totalArea <= 0) return "";
        const g104 = parseNum(inputs["envelope.combined.uValue"]);
        const tInt = parseNum(inputs["climate.heating.setpoint"], 21);
        const tExtAir = parseNum(inputs["climate.temperature.winterAverage"], -5);
        const groundTemp = 10;
        const deltaTAir = tInt - tExtAir;
        const deltaTGround = tInt - groundTemp;
        const deltaTWeighted = (deltaTAir * d101 + deltaTGround * d102) / totalArea;
        return Math.round((tInt - g104 * deltaTWeighted * 0.13) * 100) / 100;
      }
    });

    console.log("[VolumeMetricsNodes] Registered", inputs.length, "inputs");
  }

  window.TEUI.ComputationNodes.VolumeMetrics = { register };
  console.log("[VolumeMetricsNodes] Module loaded");
})();
