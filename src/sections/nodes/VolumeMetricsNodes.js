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

  // AIM2.xls's selections from S12's dropdown codes (Aim2Data's names)
  const AIM2_STOREYS = { 1: "One", 1.5: "One & Half", 2: "Two", 2.5: "Two & Half", 3: "Three" };
  const AIM2_BALANCE = ["Balanced", "Exhaust only", "Supply only"];

  /**
   * AIM2.xls's inputs from the model (CSA F280-12 Cl. 5.2.3): the house's ACH50 (S12 B.18.2, d_109) and,
   * for "Custom", its ELA at 10 Pa (B.19.3, cm2) - or one of AIM2's prescribed air-tightness types, which
   * carry their own ACH50 and ELA; the volume d_105; storeys d_103 (AIM-2's table covers 1-3); the
   * ventilation L/s (S13 d_120) as Balanced / Exhaust only / Supply only; the January / July design wind
   * from F280's weather table (F280Weather.js); the design temperatures S03 B.1.2 (design set-point),
   * B.1.3, L.3.1, L.3.2. The annual rate (Aim2.seasonalRate) runs the same house through the climate
   * station's twelve months (mean temperature, mean wind, HDD weights) at the energy set-point; it is
   * absent until the station has loaded (ClimateStation.request recalculates on arrival).
   * Returns { design, seasonal, inputs } or { error } naming what is missing - never a substitute value.
   */
  function aim2For(inputs) {
    const A = window.TEUI.Aim2;
    const W = window.TEUI.F280Weather;
    if (!A || !W) return { error: "AIM-2 is not loaded" };
    const volume = parseNum(inputs["volume.conditioned"]);
    if (!(volume > 0)) return { error: "no conditioned volume (S12 d_105)" };
    const storeys = AIM2_STOREYS[parseNum(inputs["volume.numStoreys"])];
    if (!storeys) return { error: `AIM-2 covers houses of 1 to 3 storeys (S12 d_103 = ${inputs["volume.numStoreys"]})` };
    // B.19.4 blank: the storeys x S12's Typ. F2F Ht. (g_106; Andy 2026-11-19: "It's Typ. F2F Ht. in S12").
    // F280-1's Annex-derived 5.53 m over 2 storeys is 2.77 m a storey.
    const typedHeight = parseNum(inputs["aim2.ceilingHeight"]);
    const height = typedHeight > 0
      ? typedHeight
      : parseNum(inputs["volume.numStoreys"]) * parseNum(inputs["volume.floorToFloorHeight"]);
    if (!(height > 0)) return { error: "no highest-ceiling height above grade (S12 B.19.4, or d_103 x g_106)" };
    const tightness = inputs["aim2.tightness"] || "Custom";
    const ach50 = parseNum(inputs["airTightness.ach50Target"]);
    // B.19.3 blank for Custom: the ELA from B.18.2's ACH50 at AIM2's nearest prescribed type's flow
    // exponent - the ELA S12 B.18.4 (NLA10) already takes without a measured one.
    const typedEla = parseNum(inputs["aim2.ela"]);
    const ela = tightness !== "Custom" || typedEla > 0
      ? typedEla
      : ach50 > 0 ? A.elaFromAch50(ach50, volume, A.typicalN(ach50).n) : 0;
    if (tightness === "Custom" && !(ela > 0)) return { error: "no ELA at 10 Pa for Custom (S12 B.19.3), and no ACH50 (B.18.2) to derive one" };
    const city = inputs["climate.location.city"];
    const weather = W.lookup(inputs["climate.location.province"], city);
    if (!weather) return { error: `F280's weather table does not list ${city}` };
    const vent = parseNum(inputs["ventilation.volumetricRate"]);
    const balance = inputs["aim2.ventilationBalance"] || "Balanced";
    if (!AIM2_BALANCE.includes(balance)) return { error: `unknown ventilation balance "${balance}"` };
    const p = {
      indoorHeating: parseNum(inputs["climate.heating.obcSetpoint"], 22),
      indoorCooling: parseNum(inputs["climate.cooling.setpoint"], 24),
      designHeating: parseNum(inputs["climate.temperature.coldest"]),
      designCooling: parseNum(inputs["climate.temperature.hottest"]),
      janWind: weather.janWind,
      julWind: weather.julWind,
      stationTerrain: parseNum(inputs["aim2.stationTerrain"], 3),
      anemometerHeight: 10,
      siteTerrain: parseNum(inputs["aim2.siteTerrain"], 4),
      wallShielding: parseNum(inputs["aim2.wallShielding"], 2),
      flueShielding: parseNum(inputs["aim2.flueShielding"], 2),
      buildingType: inputs["aim2.buildingType"] || "Detached",
      storeys,
      foundation: inputs["aim2.foundation"] || "Full",
      tightness,
      ach50,
      ela,
      elaPa: 10,
      volume,
      ceilingHeight: height,
      flues: [parseNum(inputs["aim2.flueDiameter"])],
      supplyLs: balance === "Exhaust only" ? 0 : vent,
      exhaustLs: balance === "Supply only" ? 0 : vent,
      furnaceFlueLs: 0
    };
    let design;
    try {
      design = A.compute(p);
    } catch (e) {
      return { error: e.message };
    }
    let seasonal = null;
    const CS = window.TEUI.ClimateStation;
    const station = CS && inputs["climate.station"] ? CS.request(inputs["climate.station"]) : null;
    if (station?.months) {
      const m = station.months;
      seasonal = A.seasonalRate(p, parseNum(inputs["climate.heating.setpoint"], 21), m.t_mean, m.wind_mean, m.hdd18);
    }
    return { design, seasonal, inputs: p, weather, derived: { ceilingHeight: !(typedHeight > 0), ela: tightness === "Custom" && !(typedEla > 0) } };
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

      // B.19.2-B.19.14: AIM-2's inputs (F280 Mode picks the method) (CSA F280-12 Cl. 5.2.3, AIM2.xls;
      // src/core/Aim2.js). Defaults: OBJECTIVE's N-factor; AIM-2's site as F280's archetypes (H.1-H.4:
      // "Low crops x/H > 20", "Light local shielding" walls and flue), the station open flat (AIM2.xls's).
      { id: "aim2.tightness", legacyId: "g_111", section: "S12", classification: "C", label: "Air Tightness (AIM-2)", defaultValue: "Custom" },
      { id: "aim2.ela", legacyId: "d_112", section: "S12", classification: "C", label: "ELA at 10 Pa for Custom (cm²)", defaultValue: 0 },
      { id: "aim2.ceilingHeight", legacyId: "g_112", section: "S12", classification: "C", label: "Highest Ceiling Above Grade (m)", defaultValue: 0 },
      { id: "aim2.siteTerrain", legacyId: "d_112b", section: "S12", classification: "C", label: "Building Site Terrain", defaultValue: 4 },
      { id: "aim2.stationTerrain", legacyId: "g_112b", section: "S12", classification: "C", label: "Weather Station Terrain", defaultValue: 3 },
      { id: "aim2.wallShielding", legacyId: "d_112c", section: "S12", classification: "C", label: "Wall Shielding", defaultValue: 2 },
      { id: "aim2.flueShielding", legacyId: "g_112c", section: "S12", classification: "C", label: "Flue Shielding", defaultValue: 2 },
      { id: "aim2.buildingType", legacyId: "d_112d", section: "S12", classification: "C", label: "House Type", defaultValue: "Detached" },
      { id: "aim2.foundation", legacyId: "g_112d", section: "S12", classification: "C", label: "Foundation Type", defaultValue: "Full" },
      { id: "aim2.ventilationBalance", legacyId: "d_112e", section: "S12", classification: "C", label: "Ventilation Balance", defaultValue: "Balanced" },
      { id: "aim2.flueDiameter", legacyId: "g_112e", section: "S12", classification: "C", label: "Flue Diameter (mm)", defaultValue: 0 },
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
      dependencies: [
        "envelope.groundFacing.uValue",
        "climate.groundFacing.hdd",
        "ground.methodInEffect",
        "ground.basesimp",
        "envelope.groundFacing.area"
      ],
      label: "Heat Loss Rate (Ag) (kWh/m²/yr)",
      compute: (inputs) => {
        // F280 Mode On (BASESIMP): the foundation's heating-season loss per m2 of ground-facing area, so
        // i_102 = h_102 x d_102 is BASESIMP's (ground.basesimp.annual, S11 rows 94-95 the same split)
        if (inputs["ground.methodInEffect"] === "BASESIMP") {
          const bs = inputs["ground.basesimp"];
          const area = parseNum(inputs["envelope.groundFacing.area"]);
          if (!bs || bs.error || !(area > 0)) return "Unavailable";
          return bs.annual.total / area;
        }
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
      dependencies: ["envelope.groundFacing.heatLossRate", "envelope.groundFacing.area", "ground.methodInEffect"],
      label: "Total Heat Loss (Ag) (kWh/yr)",
      compute: (inputs) => {
        // BASESIMP missing an input: Unavailable, never 0 kWh (the OBJECTIVE path keeps its old reading)
        if (inputs["ground.methodInEffect"] === "BASESIMP" && inputs["envelope.groundFacing.heatLossRate"] === "Unavailable") {
          return "Unavailable";
        }
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

    // The Airtightness Levels, NBC 2025 Tables 9.36.5.4.-A (single and attached zones, guarded) and
    // 9.36.5.4.-B (attached zones, unguarded); the same values as NBC 2020 Tables 9.36.6.4.-A/-B. Each
    // level's maximum ACH50, NLA10 (cm2/m2) and NLR50 (L/s.m2); a level is met by any one of the three
    // (9.36.5.4.(1)). Read from the code 2026-11-19: the old NRL50-only table (from the legacy
    // Section12.js) had AL-2B 0.94, AL-3B 0.70, AL-4B 0.47 (the code: 0.98, 0.78, 0.59), and no AL-5A,
    // AL-5B or AL-6B, which the B.18.1 dropdown offers and which fell back to AL-1B's 1.17.
    const AIRTIGHTNESS_LEVELS = {
      "AL-1A": { ach50: 2.5, nla10: 1.20, nlr50: 0.89 },
      "AL-2A": { ach50: 2.0, nla10: 0.96, nlr50: 0.71 },
      "AL-3A": { ach50: 1.5, nla10: 0.72, nlr50: 0.53 },
      "AL-4A": { ach50: 1.0, nla10: 0.48, nlr50: 0.35 },
      "AL-5A": { ach50: 0.6, nla10: 0.29, nlr50: 0.21 },
      "AL-1B": { ach50: 3.0, nla10: 1.92, nlr50: 1.17 },
      "AL-2B": { ach50: 2.5, nla10: 1.6, nlr50: 0.98 },
      "AL-3B": { ach50: 2.0, nla10: 1.28, nlr50: 0.78 },
      "AL-4B": { ach50: 1.5, nla10: 0.96, nlr50: 0.59 },
      "AL-5B": { ach50: 1.0, nla10: 0.64, nlr50: 0.39 },
      "AL-6B": { ach50: 0.6, nla10: 0.38, nlr50: 0.23 },
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
        }
        const level = AIRTIGHTNESS_LEVELS[method];
        if (!level) throw new Error(`S12 B.18.1: "${method}" is not an Airtightness Level (NBC 9.36.5.4.)`);
        return level.nlr50;
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

    // ========================================================================
    // AIM-2 (S12 B.19.2-B.19.14): CSA F280-12 Cl. 5.2.3's air-leakage rate (AIM2.xls, src/core/Aim2.js)
    // at the design condition, and the heating season's mean rate for the annual figure
    // ========================================================================
    graph.registerNode({
      id: "airTightness.aim2",
      section: "S12",
      classification: "C",
      dependencies: [
        "aim2.tightness", "aim2.ela", "aim2.ceilingHeight", "aim2.siteTerrain", "aim2.stationTerrain",
        "aim2.wallShielding", "aim2.flueShielding", "aim2.buildingType", "aim2.foundation",
        "aim2.ventilationBalance", "aim2.flueDiameter",
        "airTightness.ach50Target", "volume.conditioned", "volume.numStoreys", "volume.floorToFloorHeight",
        "ventilation.volumetricRate",
        "climate.location.province", "climate.location.city", "climate.station",
        "climate.heating.obcSetpoint", "climate.heating.setpoint", "climate.cooling.setpoint",
        "climate.temperature.coldest", "climate.temperature.hottest"
      ],
      label: "AIM-2 air leakage (F280 Cl. 5.2.3)",
      compute: (inputs) => aim2For(inputs)
    });

    graph.registerNode({
      id: "aim2.heatingRate",
      legacyId: "d_112f",
      section: "S12",
      classification: "C",
      dependencies: ["airTightness.aim2"],
      label: "LRairh: Air Leakage, Heating Design (AC/H)",
      compute: (inputs) => {
        const r = inputs["airTightness.aim2"];
        return r && !r.error ? r.design.heating.natural : "Unavailable";
      }
    });

    graph.registerNode({
      id: "aim2.coolingRate",
      legacyId: "g_112f",
      section: "S12",
      classification: "C",
      dependencies: ["airTightness.aim2"],
      label: "LRairc: Air Leakage, Cooling Design (AC/H)",
      compute: (inputs) => {
        const r = inputs["airTightness.aim2"];
        return r && !r.error ? r.design.cooling.natural : "Unavailable";
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
        "climate.heating.degreedays",
        "airTightness.infiltrationMethodInEffect",
        "airTightness.aim2",
        "volume.conditioned"
      ],
      label: "Air Leakage Heat Loss (kWh/yr)",
      compute: (inputs) => {
        const hdd = inputs["climate.heating.degreedays"];
        if (isUnavailable(hdd)) return "Unavailable";
        const leakageFactor = 1.21;

        // F280 Mode On (AIM-2): the same form with AIM-2's heating-season mean rate in place of the
        // N-factor's (airTightness.aim2.seasonal, AC/H -> L/s = rate x volume / 3.6)
        if (inputs["airTightness.infiltrationMethodInEffect"] === "AIM2") {
          const r = inputs["airTightness.aim2"];
          if (!r || r.error || !r.seasonal) return "Unavailable";
          const ls = (r.seasonal.rate * parseNum(inputs["volume.conditioned"])) / 3.6;
          return (leakageFactor * ls * parseNum(hdd) * 24) / 1000;
        }

        const nrl50 = parseNum(inputs["airTightness.nrl50"]);
        const areaAir = parseNum(inputs["envelope.airFacing.area"]);
        const nFactor = parseNum(inputs["airTightness.nFactor"], 13);

        // Legacy formula: (1.21 × NRL50 × area / N_factor × HDD × 24) / 1000
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
        // i_102 is Unavailable only when BASESIMP cannot run (F280 Mode On): then so is the total
        if (inputs["envelope.groundFacing.totalHeatLoss"] === "Unavailable") return "Unavailable";
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
    // d_110: NLA10, the Normalized Leakage Area at 10 Pa, cm2/m2 (NBC 2025 9.36.5.2.(1)(d), Tables
    // 9.36.5.4.-A/-B; Andy 2026-11-19: "modify the B.18.4 to cm2/m2")
    // = the ELA at 10 Pa (cm2) / the air-facing envelope area (d_101, the area NRL50 uses).
    // History: it read ACH50 x volume / 3600, the 50 Pa FLOW in m3/s (to 2026-11-19, F280-1 0.304), then
    // the ELA in m2 (e056780, F280-1 0.0394); the code states airtightness as NLA10, not a bare ELA.
    // The ELA: under AIM-2 (F280 Mode On), AIM-2's in effect - the prescribed type's, or the Custom measured
    // one (B.19.3, the only MEASURED NLA10: 9.36.5.3.(3) wants a multi-point test). Otherwise derived
    // from the ACH50 at the flow exponent of AIM2.xls's nearest prescribed type (Aim2.typicalN).
    // ========================================================================
    graph.registerNode({
      id: "airTightness.nla10",
      legacyId: "d_110",
      section: "S12",
      classification: "C",
      dependencies: [
        "airTightness.ach50Target",
        "volume.conditioned",
        "envelope.airFacing.area",
        "airTightness.infiltrationMethodInEffect",
        "airTightness.aim2"
      ],
      label: "NLA10, Normalized Leakage Area at 10 Pa (cm²/m²)",
      compute: (inputs) => {
        const ach50 = parseNum(inputs["airTightness.ach50Target"]);
        const volume = parseNum(inputs["volume.conditioned"]);
        const area = parseNum(inputs["envelope.airFacing.area"]);
        if (!(area > 0)) return 0;
        if (inputs["airTightness.infiltrationMethodInEffect"] === "AIM2") {
          const r = inputs["airTightness.aim2"];
          if (r && !r.error) return r.design.ela / area;
        }
        const A = window.TEUI.Aim2;
        if (!A || !(volume > 0) || !(ach50 > 0)) return 0;
        return A.elaFromAch50(ach50, volume, A.typicalN(ach50).n) / area;
      }
    });

    // The NLA10 maximum of B.18.1's Airtightness Level (NBC Tables 9.36.5.4.-A/-B), or 0 when B.18.1 is
    // Measured or a PH preset (no NBC level): m_110 then compares against the Reference's NLA10
    graph.registerNode({
      id: "airTightness.nla10Limit",
      section: "S12",
      classification: "C",
      dependencies: ["airTightness.method"],
      label: "NLA10 maximum of the B.18.1 Airtightness Level (cm²/m²)",
      compute: (inputs) => AIRTIGHTNESS_LEVELS[inputs["airTightness.method"]]?.nla10 ?? 0
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
