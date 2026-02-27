/**
 * TransmissionLossNodes.js - Envelope Transmission Losses (Section 11)
 *
 * Calculates heat loss through envelope components:
 * - RSI/U-value conversions
 * - Heat loss by component (air-facing and ground-facing)
 * - Surface temperatures
 * - Thermal bridge penalties
 * - Subtotals and percentages
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  // Component definitions - matches Section11.js legacy structure
  // NOTE: Ground-facing heat gain uses capacitance factor (i_21 / 100) with fallback to 0.5
  const AIR_FACING_COMPONENTS = [
    { row: 85, id: "roof", label: "Roof/Ceiling", input: "rsi" },
    { row: 86, id: "walls", label: "Walls Above Grade", input: "rsi" },
    { row: 87, id: "exposedFloor", label: "Exposed Floor", input: "rsi" },
    { row: 88, id: "doors", label: "Doors", input: "uvalue" },
    { row: 89, id: "windowNorth", label: "Window North", input: "uvalue" },
    { row: 90, id: "windowEast", label: "Window East", input: "uvalue" },
    { row: 91, id: "windowSouth", label: "Window South", input: "uvalue" },
    { row: 92, id: "windowWest", label: "Window West", input: "uvalue" },
    { row: 93, id: "skylights", label: "Skylights", input: "uvalue" }
  ];

  const GROUND_FACING_COMPONENTS = [
    { row: 94, id: "wallsBelowGrade", label: "Walls Below Grade", input: "rsi" },
    { row: 95, id: "slabOnGrade", label: "Slab on Grade", input: "rsi" }
  ];

  const ALL_COMPONENTS = [...AIR_FACING_COMPONENTS, ...GROUND_FACING_COMPONENTS];

  function parseNum(value, defaultVal = 0) {
    if (value === null || value === undefined || value === "N/A") return defaultVal;
    if (value === "Unavailable") return defaultVal;
    const num = parseFloat(String(value).replace(/,/g, ""));
    return isNaN(num) ? defaultVal : num;
  }

  function isUnavailable(value) {
    return value === "Unavailable" || value === "N/A";
  }

  function register(graph) {
    const inputs = [];

    // ========================================================================
    // INPUTS - Component areas and thermal properties
    // ========================================================================
    ALL_COMPONENTS.forEach(({ row, id, label, input }) => {
      // Area input
      inputs.push({
        id: `transmissionLoss.${id}.area`,
        legacyId: `d_${row}`,
        section: "S11",
        classification: "C",
        label: `${label} Area (m²)`,
        defaultValue: 0
      });

      // RSI input (for components that use RSI as primary input)
      if (input === "rsi") {
        inputs.push({
          id: `transmissionLoss.${id}.rsi`,
          legacyId: `f_${row}`,
          section: "S11",
          classification: "C",
          label: `${label} RSI (m²K/W)`,
          defaultValue: 5.0
        });
      }

      // U-value input (for components that use U-value as primary input)
      if (input === "uvalue") {
        inputs.push({
          id: `transmissionLoss.${id}.uValue`,
          legacyId: `g_${row}`,
          section: "S11",
          classification: "C",
          label: `${label} U-Value (W/m²K)`,
          defaultValue: 2.0
        });
      }

      // R-improvement input (for components that can have added insulation)
      inputs.push({
        id: `transmissionLoss.${id}.rImprovement`,
        legacyId: `e_${row}`,
        section: "S11",
        classification: "C",
        label: `${label} R-Improvement`,
        defaultValue: 0
      });
    });

    // Interior floor area input (d_96)
    inputs.push({
      id: "transmissionLoss.interiorFloorArea",
      legacyId: "d_96",
      section: "S11",
      classification: "C",
      label: "Interior Floor Area (m²)",
      defaultValue: 0
    });

    // Thermal bridge penalty input (d_97)
    inputs.push({
      id: "transmissionLoss.thermalBridgePenalty",
      legacyId: "d_97",
      section: "S11",
      classification: "C",
      label: "Thermal Bridge Penalty (%)",
      defaultValue: 20
    });

    graph.registerInputs(inputs);

    // ========================================================================
    // U-VALUE / RSI CONVERSIONS
    // ========================================================================
    ALL_COMPONENTS.forEach(({ row, id, label, input }) => {
      if (input === "rsi") {
        // RSI input -> compute U-value
        graph.registerNode({
          id: `transmissionLoss.${id}.uValue`,
          legacyId: `g_${row}`,
          section: "S11",
          classification: "C",
          dependencies: [`transmissionLoss.${id}.rsi`],
          label: `${label} U-Value (W/m²K)`,
          compute: (inputs) => {
            const rsi = parseNum(inputs[`transmissionLoss.${id}.rsi`], 5);
            return rsi > 0 ? 1 / rsi : 0;
          }
        });
      } else {
        // U-value input -> compute RSI
        graph.registerNode({
          id: `transmissionLoss.${id}.rsi`,
          legacyId: `f_${row}`,
          section: "S11",
          classification: "C",
          dependencies: [`transmissionLoss.${id}.uValue`],
          label: `${label} RSI (m²K/W)`,
          compute: (inputs) => {
            const uValue = parseNum(inputs[`transmissionLoss.${id}.uValue`], 2);
            return uValue > 0 ? 1 / uValue : 0;
          }
        });
      }
    });

    // ========================================================================
    // HEAT LOSS CALCULATIONS - Air-Facing Components
    // ========================================================================
    AIR_FACING_COMPONENTS.forEach(({ row, id, label }) => {
      graph.registerNode({
        id: `transmissionLoss.${id}.heatLoss`,
        legacyId: `i_${row}`,
        section: "S11",
        classification: "C",
        dependencies: [
          `transmissionLoss.${id}.area`,
          `transmissionLoss.${id}.uValue`,
          "climate.heating.degreedays"
        ],
        label: `${label} Heat Loss (kWh/yr)`,
        compute: (inputs) => {
          const hdd = inputs["climate.heating.degreedays"];
          if (isUnavailable(hdd)) return "Unavailable";

          const area = parseNum(inputs[`transmissionLoss.${id}.area`]);
          const uValue = parseNum(inputs[`transmissionLoss.${id}.uValue`]);
          // Heat loss = Area × U-value × HDD × 24 / 1000
          return (area * uValue * parseNum(hdd) * 24) / 1000;
        }
      });

      graph.registerNode({
        id: `transmissionLoss.${id}.heatGain`,
        legacyId: `k_${row}`,
        section: "S11",
        classification: "C",
        dependencies: [
          `transmissionLoss.${id}.area`,
          `transmissionLoss.${id}.uValue`,
          "climate.cooling.degreedays"
        ],
        label: `${label} Heat Gain (kWh/yr)`,
        compute: (inputs) => {
          const cdd = inputs["climate.cooling.degreedays"];
          // Legacy returns 0 for heat gains when CDD unavailable
          if (isUnavailable(cdd)) return 0;

          const area = parseNum(inputs[`transmissionLoss.${id}.area`]);
          const uValue = parseNum(inputs[`transmissionLoss.${id}.uValue`]);
          // Heat gain = Area × U-value × CDD × 24 / 1000
          return (area * uValue * parseNum(cdd) * 24) / 1000;
        }
      });
    });

    // ========================================================================
    // HEAT LOSS CALCULATIONS - Ground-Facing Components
    // ========================================================================
    GROUND_FACING_COMPONENTS.forEach(({ row, id, label }) => {
      graph.registerNode({
        id: `transmissionLoss.${id}.heatLoss`,
        legacyId: `i_${row}`,
        section: "S11",
        classification: "C",
        dependencies: [
          `transmissionLoss.${id}.area`,
          `transmissionLoss.${id}.uValue`,
          "climate.groundFacing.hdd"
        ],
        label: `${label} Heat Loss (kWh/yr)`,
        compute: (inputs) => {
          const groundHdd = inputs["climate.groundFacing.hdd"];
          if (isUnavailable(groundHdd)) return "Unavailable";

          const area = parseNum(inputs[`transmissionLoss.${id}.area`]);
          const uValue = parseNum(inputs[`transmissionLoss.${id}.uValue`]);
          // Heat loss = Area × U-value × Ground HDD × 24 / 1000
          return (area * uValue * parseNum(groundHdd) * 24) / 1000;
        }
      });

      graph.registerNode({
        id: `transmissionLoss.${id}.heatGain`,
        legacyId: `k_${row}`,
        section: "S11",
        classification: "C",
        dependencies: [
          `transmissionLoss.${id}.area`,
          `transmissionLoss.${id}.uValue`,
          "climate.groundFacing.cdd",
          "building.capacitance.percentage"
        ],
        label: `${label} Heat Gain (kWh/yr)`,
        compute: (inputs) => {
          const groundCdd = parseNum(inputs["climate.groundFacing.cdd"], 0);
          const area = parseNum(inputs[`transmissionLoss.${id}.area`]);
          const uValue = parseNum(inputs[`transmissionLoss.${id}.uValue`]);
          // Legacy Section11.js: capacitanceFactor = i_21 / 100, fallback to 0.5
          let capacitanceFactor = parseNum(inputs["building.capacitance.percentage"], 0) / 100;
          if (capacitanceFactor === 0 || isNaN(capacitanceFactor)) {
            capacitanceFactor = 0.5;
          }
          // Heat gain = Area × U-value × (capacitance × groundCDD × 24) / 1000
          return (area * uValue * capacitanceFactor * groundCdd * 24) / 1000;
        }
      });
    });

    // ========================================================================
    // SUBTOTALS - Air-Facing (row 91)
    // ========================================================================
    graph.registerNode({
      id: "transmissionLoss.airFacing.totalArea",
      section: "S11",
      classification: "C",
      dependencies: AIR_FACING_COMPONENTS.map(c => `transmissionLoss.${c.id}.area`),
      label: "Air-Facing Total Area (m²)",
      compute: (inputs) => {
        return AIR_FACING_COMPONENTS.reduce((sum, c) => {
          return sum + parseNum(inputs[`transmissionLoss.${c.id}.area`]);
        }, 0);
      }
    });

    graph.registerNode({
      id: "transmissionLoss.airFacing.totalHeatLoss",
      section: "S11",
      classification: "C",
      dependencies: AIR_FACING_COMPONENTS.map(c => `transmissionLoss.${c.id}.heatLoss`),
      label: "Air-Facing Total Heat Loss (kWh/yr)",
      compute: (inputs) => {
        return AIR_FACING_COMPONENTS.reduce((sum, c) => {
          return sum + parseNum(inputs[`transmissionLoss.${c.id}.heatLoss`]);
        }, 0);
      }
    });

    graph.registerNode({
      id: "transmissionLoss.airFacing.totalHeatGain",
      section: "S11",
      classification: "C",
      dependencies: AIR_FACING_COMPONENTS.map(c => `transmissionLoss.${c.id}.heatGain`),
      label: "Air-Facing Total Heat Gain (kWh/yr)",
      compute: (inputs) => {
        return AIR_FACING_COMPONENTS.reduce((sum, c) => {
          return sum + parseNum(inputs[`transmissionLoss.${c.id}.heatGain`]);
        }, 0);
      }
    });

    graph.registerNode({
      id: "transmissionLoss.airFacing.weightedUValue",
      section: "S11",
      classification: "C",
      dependencies: [
        ...AIR_FACING_COMPONENTS.map(c => `transmissionLoss.${c.id}.area`),
        ...AIR_FACING_COMPONENTS.map(c => `transmissionLoss.${c.id}.uValue`),
        "transmissionLoss.airFacing.totalArea",
        "transmissionLoss.thermalBridgePenalty"
      ],
      label: "Air-Facing Weighted U-Value (W/m²K)",
      compute: (inputs) => {
        const totalArea = parseNum(inputs["transmissionLoss.airFacing.totalArea"]);
        if (totalArea === 0) return 0;

        const weightedSum = AIR_FACING_COMPONENTS.reduce((sum, c) => {
          const area = parseNum(inputs[`transmissionLoss.${c.id}.area`]);
          const uValue = parseNum(inputs[`transmissionLoss.${c.id}.uValue`]);
          return sum + (area * uValue);
        }, 0);

        // Include thermal bridge penalty factor as per legacy Section12.js formula:
        // g_101 = (SUMPRODUCT(g_85:g_95, d_85:d_95) / SUM(d_85:d_95)) × (1 + d_97/100)
        const penaltyPercent = parseNum(inputs["transmissionLoss.thermalBridgePenalty"], 5);
        const tbFactor = 1 + penaltyPercent / 100;
        return (weightedSum / totalArea) * tbFactor;
      }
    });

    // ========================================================================
    // SUBTOTALS - Ground-Facing (row 95)
    // ========================================================================
    graph.registerNode({
      id: "transmissionLoss.groundFacing.totalArea",
      section: "S11",
      classification: "C",
      dependencies: GROUND_FACING_COMPONENTS.map(c => `transmissionLoss.${c.id}.area`),
      label: "Ground-Facing Total Area (m²)",
      compute: (inputs) => {
        return GROUND_FACING_COMPONENTS.reduce((sum, c) => {
          return sum + parseNum(inputs[`transmissionLoss.${c.id}.area`]);
        }, 0);
      }
    });

    graph.registerNode({
      id: "transmissionLoss.groundFacing.totalHeatLoss",
      section: "S11",
      classification: "C",
      dependencies: GROUND_FACING_COMPONENTS.map(c => `transmissionLoss.${c.id}.heatLoss`),
      label: "Ground-Facing Total Heat Loss (kWh/yr)",
      compute: (inputs) => {
        return GROUND_FACING_COMPONENTS.reduce((sum, c) => {
          return sum + parseNum(inputs[`transmissionLoss.${c.id}.heatLoss`]);
        }, 0);
      }
    });

    graph.registerNode({
      id: "transmissionLoss.groundFacing.totalHeatGain",
      section: "S11",
      classification: "C",
      dependencies: GROUND_FACING_COMPONENTS.map(c => `transmissionLoss.${c.id}.heatGain`),
      label: "Ground-Facing Total Heat Gain (kWh/yr)",
      compute: (inputs) => {
        return GROUND_FACING_COMPONENTS.reduce((sum, c) => {
          return sum + parseNum(inputs[`transmissionLoss.${c.id}.heatGain`]);
        }, 0);
      }
    });

    // NOTE: There is no i_96/k_96 in Section11.js - the thermal bridge penalty
    // is calculated as i_97/k_97 = i_98/k_98 * penalty%

    // ========================================================================
    // COMPONENT SUBTOTALS (row 98) - i_98 = SUM(i_85:i_95)
    // From Section11.js line 3132-3140: i_98 is the sum of components only
    // ========================================================================
    graph.registerNode({
      id: "transmissionLoss.components.subtotalHeatLoss",
      legacyId: "i_98",
      section: "S11",
      classification: "C",
      dependencies: [
        "transmissionLoss.airFacing.totalHeatLoss",
        "transmissionLoss.groundFacing.totalHeatLoss"
      ],
      label: "Envelope Components Subtotal Heat Loss (kWh/yr)",
      compute: (inputs) => {
        // i_98 = SUM(i_85:i_95) - components only, excludes thermal bridge penalty
        return parseNum(inputs["transmissionLoss.airFacing.totalHeatLoss"]) +
               parseNum(inputs["transmissionLoss.groundFacing.totalHeatLoss"]);
      }
    });

    graph.registerNode({
      id: "transmissionLoss.components.subtotalHeatGain",
      legacyId: "k_98",
      section: "S11",
      classification: "C",
      dependencies: [
        "transmissionLoss.airFacing.totalHeatGain",
        "transmissionLoss.groundFacing.totalHeatGain"
      ],
      label: "Envelope Components Subtotal Heat Gain (kWh/yr)",
      compute: (inputs) => {
        return parseNum(inputs["transmissionLoss.airFacing.totalHeatGain"]) +
               parseNum(inputs["transmissionLoss.groundFacing.totalHeatGain"]);
      }
    });

    // ========================================================================
    // THERMAL BRIDGE PENALTY (row 97) - i_97 = i_98 * (d_97 / 100)
    // From Section11.js line 2702: penaltyHeatloss = componentHeatlossSubtotal * validatedPenalty
    // ========================================================================
    graph.registerNode({
      id: "transmissionLoss.total.area",
      section: "S11",
      classification: "C",
      dependencies: [
        "transmissionLoss.airFacing.totalArea",
        "transmissionLoss.groundFacing.totalArea"
      ],
      label: "Total Envelope Area (m²)",
      compute: (inputs) => {
        return parseNum(inputs["transmissionLoss.airFacing.totalArea"]) +
               parseNum(inputs["transmissionLoss.groundFacing.totalArea"]);
      }
    });

    graph.registerNode({
      id: "transmissionLoss.thermalBridgePenalty.heatLoss",
      legacyId: "i_97",
      section: "S11",
      classification: "C",
      dependencies: [
        "transmissionLoss.components.subtotalHeatLoss",
        "transmissionLoss.thermalBridgePenalty"
      ],
      label: "Thermal Bridge Penalty Heat Loss (kWh/yr)",
      compute: (inputs) => {
        // i_97 = i_98 * (penalty% / 100) - From Section11.js line 2702
        const subtotal = parseNum(inputs["transmissionLoss.components.subtotalHeatLoss"]);
        const penaltyPercent = parseNum(inputs["transmissionLoss.thermalBridgePenalty"], 5);
        return subtotal * (penaltyPercent / 100);
      }
    });

    graph.registerNode({
      id: "transmissionLoss.thermalBridgePenalty.heatGain",
      legacyId: "k_97",
      section: "S11",
      classification: "C",
      dependencies: [
        "transmissionLoss.components.subtotalHeatGain",
        "transmissionLoss.thermalBridgePenalty"
      ],
      label: "Thermal Bridge Penalty Heat Gain (kWh/yr)",
      compute: (inputs) => {
        const subtotal = parseNum(inputs["transmissionLoss.components.subtotalHeatGain"]);
        const penaltyPercent = parseNum(inputs["transmissionLoss.thermalBridgePenalty"], 5);
        return subtotal * (penaltyPercent / 100);
      }
    });

    // ========================================================================
    // PERCENTAGES (j columns for each component)
    // ========================================================================
    ALL_COMPONENTS.forEach(({ row, id, label }) => {
      graph.registerNode({
        id: `transmissionLoss.${id}.heatLossPercent`,
        legacyId: `j_${row}`,
        section: "S11",
        classification: "C",
        // Legacy uses i_98 (component subtotal WITHOUT penalty) as denominator
        dependencies: [`transmissionLoss.${id}.heatLoss`, "transmissionLoss.components.subtotalHeatLoss"],
        label: `${label} Heat Loss %`,
        compute: (inputs) => {
          const componentLoss = parseNum(inputs[`transmissionLoss.${id}.heatLoss`]);
          const subtotal = parseNum(inputs["transmissionLoss.components.subtotalHeatLoss"]);
          return subtotal > 0 ? componentLoss / subtotal : 0;
        }
      });

      graph.registerNode({
        id: `transmissionLoss.${id}.heatGainPercent`,
        legacyId: `l_${row}`,
        section: "S11",
        classification: "C",
        // Legacy uses k_98 (component subtotal) as denominator, with NEGATIVE sign
        dependencies: [`transmissionLoss.${id}.heatGain`, "transmissionLoss.components.subtotalHeatGain"],
        label: `${label} Heat Gain %`,
        compute: (inputs) => {
          const componentGain = parseNum(inputs[`transmissionLoss.${id}.heatGain`]);
          const subtotal = parseNum(inputs["transmissionLoss.components.subtotalHeatGain"]);
          // Legacy formula: -heatgain / totals.gain
          return Math.abs(subtotal) > 0.001 ? -componentGain / subtotal : 0;
        }
      });
    });

    // ========================================================================
    // TOTAL WITH PENALTY (for percentage calculations)
    // Grand total = i_97 + i_98 (penalty + components)
    // ========================================================================
    graph.registerNode({
      id: "transmissionLoss.total.heatLoss",
      section: "S11",
      classification: "C",
      dependencies: [
        "transmissionLoss.thermalBridgePenalty.heatLoss",
        "transmissionLoss.components.subtotalHeatLoss"
      ],
      label: "Total Heat Loss with Penalty (kWh/yr)",
      compute: (inputs) => {
        return parseNum(inputs["transmissionLoss.thermalBridgePenalty.heatLoss"]) +
               parseNum(inputs["transmissionLoss.components.subtotalHeatLoss"]);
      }
    });

    graph.registerNode({
      id: "transmissionLoss.total.heatGain",
      section: "S11",
      classification: "C",
      dependencies: [
        "transmissionLoss.thermalBridgePenalty.heatGain",
        "transmissionLoss.components.subtotalHeatGain"
      ],
      label: "Total Heat Gain with Penalty (kWh/yr)",
      compute: (inputs) => {
        return parseNum(inputs["transmissionLoss.thermalBridgePenalty.heatGain"]) +
               parseNum(inputs["transmissionLoss.components.subtotalHeatGain"]);
      }
    });

    console.log("[TransmissionLossNodes] Registered", inputs.length, "inputs");
  }

  window.TEUI.ComputationNodes.TransmissionLoss = { register, AIR_FACING_COMPONENTS, GROUND_FACING_COMPONENTS };
  console.log("[TransmissionLossNodes] Module loaded");
})();
