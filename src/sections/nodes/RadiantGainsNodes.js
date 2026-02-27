/**
 * RadiantGainsNodes.js - Solar/Radiant Gains (Section 10)
 *
 * Calculates solar heat gains through glazing:
 * - Gain factors by orientation and climate zone
 * - Heating season gains (rows 73-78, subtotal 79)
 * - Cooling season gains (rows 73-78, subtotal 79)
 * - Utilization factors (rows 80-82)
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  // Gain factor lookup tables by orientation
  const GAIN_FACTORS = {
    northern: { // Climate zone > 6
      "North": 0.19, "NorthEast": 0.89, "East": 2.09, "SouthEast": 6.01,
      "South": 24.76, "SouthWest": 82.25, "West": 64.37, "NorthWest": 18.14,
      "Average": 24.84, "Skylight": 25.0
    },
    southern: { // Climate zone <= 6
      "North": 1.31, "NorthEast": 34.69, "East": 76.94, "SouthEast": 86.59,
      "South": 70.74, "SouthWest": 60.4, "West": 25.86, "NorthWest": 2.88,
      "Average": 50.0, "Skylight": 75.0
    }
  };

  function parseNum(value, defaultVal = 0) {
    if (value === null || value === undefined || value === "N/A") return defaultVal;
    if (value === "Unavailable") return defaultVal;
    const num = parseFloat(String(value).replace(/,/g, ""));
    return isNaN(num) ? defaultVal : num;
  }

  function isUnavailable(value) {
    return value === "Unavailable" || value === "N/A";
  }

  function getGainFactor(orientation, climateZone) {
    const factors = climateZone > 6 ? GAIN_FACTORS.northern : GAIN_FACTORS.southern;
    return factors[orientation] || factors["Average"];
  }

  function register(graph) {
    // ========================================================================
    // INPUTS - Glazing properties by orientation (rows 73-78)
    // ========================================================================
    const rows = [
      { row: 73, label: "Average/Doors" },
      { row: 74, label: "North" },
      { row: 75, label: "East" },
      { row: 76, label: "South" },
      { row: 77, label: "West" },
      { row: 78, label: "Skylight" }
    ];

    const inputs = [];

    // Register inputs for each glazing row
    rows.forEach(({ row, label }) => {
      inputs.push(
        { id: `radiantGains.row${row}.area`, legacyId: `d_${row}`, section: "S10", classification: "C", label: `${label} Area (m²)`, defaultValue: 0 },
        { id: `radiantGains.row${row}.orientation`, legacyId: `e_${row}`, section: "S10", classification: "C", label: `${label} Orientation`, defaultValue: label === "Skylight" ? "Skylight" : label },
        { id: `radiantGains.row${row}.shgc`, legacyId: `f_${row}`, section: "S10", classification: "C", label: `${label} SHGC`, defaultValue: 0.35 },
        { id: `radiantGains.row${row}.winterShading`, legacyId: `g_${row}`, section: "S10", classification: "C", label: `${label} Winter Shading (%)`, defaultValue: 0 },
        { id: `radiantGains.row${row}.summerShading`, legacyId: `h_${row}`, section: "S10", classification: "C", label: `${label} Summer Shading (%)`, defaultValue: 0 }
      );
    });

    // Utilization method input
    inputs.push(
      { id: "radiantGains.utilizationMethod", legacyId: "d_80", section: "S10", classification: "C", label: "Gains Utilization Method", defaultValue: "NRC 40%" }
    );

    // i_71 (internal.heatingGains) now computed in InternalGainsNodes

    graph.registerInputs(inputs);

    // ========================================================================
    // GAIN FACTOR CALCULATIONS (m_73 to m_78)
    // ========================================================================
    rows.forEach(({ row, label }) => {
      graph.registerNode({
        id: `radiantGains.row${row}.gainFactor`,
        legacyId: `m_${row}`,
        section: "S10",
        classification: "C",
        dependencies: [`radiantGains.row${row}.orientation`, "climate.zone"],
        label: `${label} Gain Factor`,
        compute: (inputs) => {
          const climateZone = inputs["climate.zone"];
          if (isUnavailable(climateZone)) return "Unavailable";

          const orientation = inputs[`radiantGains.row${row}.orientation`] || "Average";
          return getGainFactor(orientation, parseNum(climateZone, 6));
        }
      });
    });

    // ========================================================================
    // HEATING GAINS (i_73 to i_78)
    // ========================================================================
    rows.forEach(({ row, label }) => {
      graph.registerNode({
        id: `radiantGains.row${row}.heatingGain`,
        legacyId: `i_${row}`,
        section: "S10",
        classification: "C",
        dependencies: [
          `radiantGains.row${row}.area`,
          `radiantGains.row${row}.gainFactor`,
          `radiantGains.row${row}.shgc`,
          `radiantGains.row${row}.winterShading`
        ],
        label: `${label} Heating Gain (kWh/yr)`,
        compute: (inputs) => {
          const area = parseNum(inputs[`radiantGains.row${row}.area`]);
          const gainFactor = parseNum(inputs[`radiantGains.row${row}.gainFactor`]);
          const shgc = parseNum(inputs[`radiantGains.row${row}.shgc`], 0.35);
          const winterShading = parseNum(inputs[`radiantGains.row${row}.winterShading`]) / 100;

          const shgcNormalized = shgc / 0.5;
          return area * gainFactor * shgcNormalized * (1 - winterShading);
        }
      });
    });

    // ========================================================================
    // COOLING GAINS (k_73 to k_78)
    // ========================================================================
    rows.forEach(({ row, label }) => {
      graph.registerNode({
        id: `radiantGains.row${row}.coolingGain`,
        legacyId: `k_${row}`,
        section: "S10",
        classification: "C",
        dependencies: [
          `radiantGains.row${row}.area`,
          `radiantGains.row${row}.gainFactor`,
          `radiantGains.row${row}.shgc`,
          `radiantGains.row${row}.summerShading`,
          `radiantGains.row${row}.orientation`
        ],
        label: `${label} Cooling Gain (kWh/yr)`,
        compute: (inputs) => {
          const area = parseNum(inputs[`radiantGains.row${row}.area`]);
          const gainFactor = parseNum(inputs[`radiantGains.row${row}.gainFactor`]);
          const shgc = parseNum(inputs[`radiantGains.row${row}.shgc`], 0.35);
          const summerShading = parseNum(inputs[`radiantGains.row${row}.summerShading`]) / 100;
          const orientation = inputs[`radiantGains.row${row}.orientation`] || "Average";

          const shgcNormalized = shgc / 0.5;
          const coolingModifier = orientation === "Skylight" ? 1.25 : 0.5;

          return area * gainFactor * shgcNormalized * (1 - summerShading) * coolingModifier;
        }
      });
    });

    // ========================================================================
    // SUBTOTALS (row 79)
    // ========================================================================
    graph.registerNode({
      id: "radiantGains.subtotal.heatingGain",
      legacyId: "i_79",
      section: "S10",
      classification: "C",
      dependencies: rows.map(r => `radiantGains.row${r.row}.heatingGain`),
      label: "Total Solar Heating Gain (kWh/yr)",
      compute: (inputs) => {
        return rows.reduce((sum, r) => {
          return sum + parseNum(inputs[`radiantGains.row${r.row}.heatingGain`]);
        }, 0);
      }
    });

    graph.registerNode({
      id: "radiantGains.subtotal.coolingGain",
      legacyId: "k_79",
      section: "S10",
      classification: "C",
      dependencies: rows.map(r => `radiantGains.row${r.row}.coolingGain`),
      label: "Total Solar Cooling Gain (kWh/yr)",
      compute: (inputs) => {
        return rows.reduce((sum, r) => {
          return sum + parseNum(inputs[`radiantGains.row${r.row}.coolingGain`]);
        }, 0);
      }
    });

    // ========================================================================
    // PERCENTAGES (j_73-j_78, l_73-l_78)
    // ========================================================================
    rows.forEach(({ row, label }) => {
      graph.registerNode({
        id: `radiantGains.row${row}.heatingPercent`,
        legacyId: `j_${row}`,
        section: "S10",
        classification: "C",
        dependencies: [`radiantGains.row${row}.heatingGain`, "radiantGains.subtotal.heatingGain"],
        label: `${label} Heating Gain %`,
        compute: (inputs) => {
          const gain = parseNum(inputs[`radiantGains.row${row}.heatingGain`]);
          const total = parseNum(inputs["radiantGains.subtotal.heatingGain"]);
          return total > 0 ? gain / total : 0;
        }
      });

      graph.registerNode({
        id: `radiantGains.row${row}.coolingPercent`,
        legacyId: `l_${row}`,
        section: "S10",
        classification: "C",
        dependencies: [`radiantGains.row${row}.coolingGain`, "radiantGains.subtotal.coolingGain"],
        label: `${label} Cooling Gain %`,
        compute: (inputs) => {
          const gain = parseNum(inputs[`radiantGains.row${row}.coolingGain`]);
          const total = parseNum(inputs["radiantGains.subtotal.coolingGain"]);
          return total > 0 ? gain / total : 0;
        }
      });
    });

    // ========================================================================
    // UTILIZATION FACTORS (rows 80-82)
    // ========================================================================

    // Total gains (solar + internal)
    graph.registerNode({
      id: "radiantGains.totalGains",
      legacyId: "e_80",
      section: "S10",
      classification: "C",
      dependencies: ["radiantGains.subtotal.heatingGain", "internal.heatingGains"],
      label: "Total Gains (Solar + Internal)",
      compute: (inputs) => {
        const solarGains = parseNum(inputs["radiantGains.subtotal.heatingGain"]);
        const internalGains = parseNum(inputs["internal.heatingGains"]);
        return solarGains + internalGains;
      }
    });

    // Utilization factor
    // For PH Method, calculates PHPP utilization factor using gamma formula
    graph.registerNode({
      id: "radiantGains.utilizationFactor",
      legacyId: "g_80",
      section: "S10",
      classification: "C",
      dependencies: [
        "radiantGains.utilizationMethod",
        "radiantGains.totalGains",
        "transmissionLoss.thermalBridgePenalty.heatLoss",
        "airTightness.heatLoss",
        "ventilation.netHeatLoss",
        "transmissionLoss.components.subtotalHeatLoss"
      ],
      label: "Gains Utilization Factor",
      compute: (inputs) => {
        const method = inputs["radiantGains.utilizationMethod"] || "NRC 40%";

        // Fixed NRC methods
        switch (method) {
          case "NRC 0%": return 0;
          case "NRC 40%": return 0.4;
          case "NRC 50%": return 0.5;
          case "NRC 60%": return 0.6;
          case "NRC 80%": return 0.8;
          case "NRC 100%": return 1.0;
          case "Passive House": return 1.0;
        }

        // PH Method: Calculate PHPP utilization factor
        if (method === "PH Method") {
          const totalGains = parseNum(inputs["radiantGains.totalGains"], 0);
          const i97 = parseNum(inputs["transmissionLoss.thermalBridgePenalty.heatLoss"], 0);
          const i103 = parseNum(inputs["airTightness.heatLoss"], 0);
          const m121 = parseNum(inputs["ventilation.netHeatLoss"], 0);
          const i98 = parseNum(inputs["transmissionLoss.components.subtotalHeatLoss"], 0);

          const numerator = totalGains;
          const denominator = i97 + i103 + m121 + i98;

          if (denominator > 0) {
            const gamma = numerator / denominator;
            if (Math.abs(gamma - 1) < 1e-9) {
              return 5 / 6; // ~0.833
            }
            const a = 5;
            const gamma_a = Math.pow(gamma, a);
            const gamma_a_plus_1 = Math.pow(gamma, a + 1);
            const factor = (1 - gamma_a) / (1 - gamma_a_plus_1);
            return Math.max(0, Math.min(1, factor));
          }
          return numerator > 0 ? 1 : 0;
        }

        // Default fallback
        return 0.4;
      }
    });

    // Usable gains
    graph.registerNode({
      id: "radiantGains.usableGains",
      legacyId: "i_80",
      section: "S10",
      classification: "C",
      dependencies: ["radiantGains.totalGains", "radiantGains.utilizationFactor"],
      label: "Usable Gains (kWh/yr)",
      compute: (inputs) => {
        const totalGains = parseNum(inputs["radiantGains.totalGains"]);
        const utilizationFactor = parseNum(inputs["radiantGains.utilizationFactor"], 0.4);
        return totalGains * utilizationFactor;
      }
    });

    // PHPP method usable gains (row 81 - always calculated as reference)
    // Uses PHPP utilization factor formula: (1 - γ^a) / (1 - γ^(a+1)) where a=5
    graph.registerNode({
      id: "radiantGains.phppUsableGains",
      legacyId: "i_81",
      section: "S10",
      classification: "C",
      dependencies: [
        "radiantGains.totalGains",
        "transmissionLoss.thermalBridgePenalty.heatLoss",
        "airTightness.heatLoss",
        "ventilation.netHeatLoss",
        "transmissionLoss.components.subtotalHeatLoss"
      ],
      label: "PHPP Usable Gains (kWh/yr)",
      compute: (inputs) => {
        const totalGains = parseNum(inputs["radiantGains.totalGains"]);
        const i97 = parseNum(inputs["transmissionLoss.thermalBridgePenalty.heatLoss"]);
        const i103 = parseNum(inputs["airTightness.heatLoss"]);
        const m121 = parseNum(inputs["ventilation.netHeatLoss"]);
        const i98 = parseNum(inputs["transmissionLoss.components.subtotalHeatLoss"]);

        const denominator = i97 + i103 + m121 + i98;

        let phUtilizationFactor = 0.9;
        if (denominator > 0) {
          const gamma = totalGains / denominator;
          if (Math.abs(gamma - 1) < 1e-9) {
            phUtilizationFactor = 5 / 6;
          } else {
            const a = 5;
            const gamma_a = Math.pow(gamma, a);
            const gamma_a_plus_1 = Math.pow(gamma, a + 1);
            phUtilizationFactor = (1 - gamma_a) / (1 - gamma_a_plus_1);
            phUtilizationFactor = Math.max(0, Math.min(1, phUtilizationFactor));
          }
        } else {
          phUtilizationFactor = totalGains > 0 ? 1 : 0;
        }

        return totalGains * phUtilizationFactor;
      }
    });

    // Usable gains per area (internal calculation, no legacy equivalent)
    graph.registerNode({
      id: "radiantGains.usableGainsPerArea",
      section: "S10",
      classification: "C",
      dependencies: ["radiantGains.usableGains", "building.conditionedFloorArea"],
      label: "Usable Gains Intensity (kWh/m²/yr)",
      compute: (inputs) => {
        const usableGains = parseNum(inputs["radiantGains.usableGains"]);
        const area = parseNum(inputs["building.conditionedFloorArea"], 1);
        return area > 0 ? usableGains / area : 0;
      }
    });

    console.log("[RadiantGainsNodes] Registered", inputs.length, "inputs");
  }

  window.TEUI.ComputationNodes.RadiantGains = { register, GAIN_FACTORS };
  console.log("[RadiantGainsNodes] Module loaded");
})();
