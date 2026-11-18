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
  // NOTE: every heat GAIN (k column) is the component's share of the ISO 52016-1
  // monthly cooling need (cooling.iso52016); the heat losses are unchanged
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

  // Interior surface film resistance by component (m²K/W), by direction of heat flow. Used for the
  // surface temperatures (o_85-o_95) and as each RSI row's floor: no assembly's total resistance can
  // fall below its own surface film, so an RSI of 0 (an uninsulated assembly) still loses heat.
  const R_SI_MAP = {
    roof: 0.10,           // upward heat flow
    walls: 0.13,          // horizontal
    exposedFloor: 0.17,   // downward
    doors: 0.13,          // horizontal
    windowNorth: 0.13,    // horizontal
    windowEast: 0.13,     // horizontal
    windowSouth: 0.13,    // horizontal
    windowWest: 0.13,     // horizontal
    skylights: 0.10,      // upward
    wallsBelowGrade: 0.13, // horizontal
    slabOnGrade: 0.17     // downward
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

  // S10→S11 area bridge: rows 88-93 in S11 mirror rows 73-78 from S10
  const AREA_BRIDGE = {
    88: 73,  // doors
    89: 74,  // window north
    90: 75,  // window east
    91: 76,  // window south
    92: 77,  // window west
    93: 78   // skylights
  };

  function register(graph) {
    const inputs = [];
    const bridgeNodes = [];

    // ========================================================================
    // INPUTS - Component areas and thermal properties
    // ========================================================================
    ALL_COMPONENTS.forEach(({ row, id, label, input }) => {
      // Area: for rows with S10 bridge, register as computed node (not input)
      if (AREA_BRIDGE[row]) {
        const s10Row = AREA_BRIDGE[row];
        bridgeNodes.push({
          id: `transmissionLoss.${id}.area`,
          legacyId: `d_${row}`,
          section: "S11",
          classification: "C",
          label: `${label} Area (m²) [bridged from S10]`,
          dependencies: [`radiantGains.row${s10Row}.area`],
          compute: (deps) => parseNum(deps[`radiantGains.row${s10Row}.area`])
        });
      } else {
        // Non-bridged areas remain as inputs
        inputs.push({
          id: `transmissionLoss.${id}.area`,
          legacyId: `d_${row}`,
          section: "S11",
          classification: "C",
          label: `${label} Area (m²)`,
          defaultValue: 0
        });
      }

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

      // R-imperial is computed after inputs are registered (see below)
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

    // Register S10→S11 area bridge nodes (d_73→d_88, d_74→d_89, etc.)
    bridgeNodes.forEach(node => graph.registerNode(node));

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
            // Was `rsi > 0 ? 1 / rsi : 0`: an RSI of 0 read as U 0, zero heat loss on the row, the
            // opposite of an uninsulated assembly. The row's own surface film is the least it can be.
            return 1 / Math.max(rsi, R_SI_MAP[id]);
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
    // R-IMPERIAL = RSI × 5.678
    // ========================================================================
    ALL_COMPONENTS.forEach(({ row, id, label }) => {
      graph.registerNode({
        id: `transmissionLoss.${id}.rImperial`,
        legacyId: `e_${row}`,
        section: "S11",
        classification: "C",
        dependencies: [`transmissionLoss.${id}.rsi`],
        label: `${label} R-Imperial (ft²·°F·hr/Btu)`,
        compute: (inputs) => {
          const rsi = parseNum(inputs[`transmissionLoss.${id}.rsi`]);
          return rsi * 5.678;
        }
      });
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

      // The component's share of the unmitigated ISO 52016-1 monthly need
      // (cooling.iso52016, CoolingNodes.js): its transmission inflow in the
      // months the outdoor side is warmer, plus solar on its outer surface
      graph.registerNode({
        id: `transmissionLoss.${id}.heatGain`,
        legacyId: `k_${row}`,
        section: "S11",
        classification: "C",
        dependencies: ["cooling.iso52016"],
        label: `${label} Heat Gain (kWh/yr)`,
        compute: (inputs) => inputs["cooling.iso52016"]?.rows?.[id] ?? 0
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

      // The component's share of the unmitigated ISO 52016-1 monthly need
      // (cooling.iso52016, CoolingNodes.js): its transmission inflow in the
      // months the outdoor side is warmer, against the year's mean outdoor
      // temperature (ISO 52016-1 6.6.5.1)
      graph.registerNode({
        id: `transmissionLoss.${id}.heatGain`,
        legacyId: `k_${row}`,
        section: "S11",
        classification: "C",
        dependencies: ["cooling.iso52016"],
        label: `${label} Heat Gain (kWh/yr)`,
        compute: (inputs) => inputs["cooling.iso52016"]?.rows?.[id] ?? 0
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
      // The thermal bridges' share of the unmitigated ISO 52016-1 monthly need
      // (the penalty % on every component's conductance, cooling.iso52016)
      dependencies: ["cooling.iso52016"],
      label: "Thermal Bridge Penalty Heat Gain (kWh/yr)",
      compute: (inputs) => inputs["cooling.iso52016"]?.rows?.tb ?? 0
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

    // ========================================================================
    // AREA PERCENTAGES (h_85-h_95)
    // Air-facing (85-93): d_row / totalAreaAe
    // Ground-facing (94-95): d_row / totalAreaAg
    // ========================================================================
    AIR_FACING_COMPONENTS.forEach(({ row, id, label }) => {
      graph.registerNode({
        id: `transmissionLoss.${id}.areaPercent`,
        legacyId: `h_${row}`,
        section: "S11",
        classification: "C",
        dependencies: [`transmissionLoss.${id}.area`, "transmissionLoss.airFacing.totalArea"],
        label: `${label} Area %`,
        compute: (inputs) => {
          const area = parseNum(inputs[`transmissionLoss.${id}.area`]);
          const total = parseNum(inputs["transmissionLoss.airFacing.totalArea"], 1);
          return total > 0 ? area / total : 0;
        }
      });
    });

    GROUND_FACING_COMPONENTS.forEach(({ row, id, label }) => {
      graph.registerNode({
        id: `transmissionLoss.${id}.areaPercent`,
        legacyId: `h_${row}`,
        section: "S11",
        classification: "C",
        dependencies: [`transmissionLoss.${id}.area`, "transmissionLoss.groundFacing.totalArea"],
        label: `${label} Area %`,
        compute: (inputs) => {
          const area = parseNum(inputs[`transmissionLoss.${id}.area`]);
          const total = parseNum(inputs["transmissionLoss.groundFacing.totalArea"], 1);
          return total > 0 ? area / total : 0;
        }
      });
    });

    // ========================================================================
    // TOTAL ENVELOPE AREA (d_98) = SUM(d_85:d_95) - excludes d_96 interior floor
    // ========================================================================
    graph.registerNode({
      id: "transmissionLoss.total.envelopeArea",
      legacyId: "d_98",
      section: "S11",
      classification: "C",
      dependencies: ALL_COMPONENTS.map(c => `transmissionLoss.${c.id}.area`),
      label: "Total Envelope Area (m²)",
      compute: (inputs) => {
        return ALL_COMPONENTS.reduce((sum, c) => {
          return sum + parseNum(inputs[`transmissionLoss.${c.id}.area`]);
        }, 0);
      }
    });

    // h_98: Area percentage total (always 1.0 / 100%)
    graph.registerNode({
      id: "transmissionLoss.total.areaPercent",
      legacyId: "h_98",
      section: "S11",
      classification: "C",
      dependencies: [],
      label: "Total Area Percentage",
      compute: () => "100%"
    });

    // e_97: Thermal bridge penalty as decimal = d_97 / 100, clamped 0-1
    graph.registerNode({
      id: "transmissionLoss.thermalBridgePenalty.decimal",
      legacyId: "e_97",
      section: "S11",
      classification: "C",
      dependencies: ["transmissionLoss.thermalBridgePenalty"],
      label: "Thermal Bridge Penalty (decimal)",
      compute: (inputs) => {
        const pct = parseNum(inputs["transmissionLoss.thermalBridgePenalty"], 5);
        return Math.max(0, Math.min(1, pct / 100));
      }
    });

    // e_98: R-improvement total — not calculated in legacy code
    graph.registerNode({
      id: "transmissionLoss.total.rImprovement",
      legacyId: "e_98",
      section: "S11",
      classification: "C",
      dependencies: [],
      label: "Total R-Improvement",
      compute: () => 0
    });

    // ========================================================================
    // THERMAL BRIDGE & TOTAL PERCENTAGES (j_97, j_98, l_97, l_98)
    // ========================================================================
    graph.registerNode({
      id: "transmissionLoss.thermalBridgePenalty.heatLossPercent",
      legacyId: "j_97",
      section: "S11",
      classification: "C",
      dependencies: [
        "transmissionLoss.thermalBridgePenalty.heatLoss",
        "transmissionLoss.components.subtotalHeatLoss"
      ],
      label: "Thermal Bridge Heat Loss %",
      compute: (inputs) => {
        const penalty = parseNum(inputs["transmissionLoss.thermalBridgePenalty.heatLoss"]);
        const subtotal = parseNum(inputs["transmissionLoss.components.subtotalHeatLoss"]);
        return subtotal > 0 ? penalty / subtotal : 0;
      }
    });

    graph.registerNode({
      id: "transmissionLoss.total.heatLossPercent",
      legacyId: "j_98",
      section: "S11",
      classification: "C",
      dependencies: [],
      label: "Total Heat Loss % (100%)",
      compute: () => 1.0
    });

    graph.registerNode({
      id: "transmissionLoss.thermalBridgePenalty.heatGainPercent",
      legacyId: "l_97",
      section: "S11",
      classification: "C",
      dependencies: [
        "transmissionLoss.thermalBridgePenalty.heatGain",
        "transmissionLoss.components.subtotalHeatGain"
      ],
      label: "Thermal Bridge Heat Gain %",
      compute: (inputs) => {
        const penalty = parseNum(inputs["transmissionLoss.thermalBridgePenalty.heatGain"]);
        const subtotal = parseNum(inputs["transmissionLoss.components.subtotalHeatGain"]);
        return Math.abs(subtotal) > 0.001 ? -penalty / subtotal : 0;
      }
    });

    graph.registerNode({
      id: "transmissionLoss.total.heatGainPercent",
      legacyId: "l_98",
      section: "S11",
      classification: "C",
      dependencies: [],
      label: "Total Heat Gain % (-100%)",
      compute: () => -1.0
    });

    // ========================================================================
    // SURFACE TEMPERATURES (o_85-o_95)
    // T_si = T_interior - (U × ΔT × R_si)
    // R_si varies by component type (R_SI_MAP, top of file); exterior temp varies air vs ground
    // ========================================================================

    AIR_FACING_COMPONENTS.forEach(({ row, id, label }) => {
      graph.registerNode({
        id: `transmissionLoss.${id}.surfaceTemp`,
        legacyId: `o_${row}`,
        section: "S11",
        classification: "C",
        dependencies: [
          `transmissionLoss.${id}.area`,
          `transmissionLoss.${id}.uValue`,
          "climate.heating.setpoint",
          "climate.temperature.winterAverage"
        ],
        label: `${label} Surface Temperature (°C)`,
        compute: (inputs) => {
          const area = parseNum(inputs[`transmissionLoss.${id}.area`]);
          if (area === 0) return "";
          const uValue = parseNum(inputs[`transmissionLoss.${id}.uValue`]);
          const tInterior = parseNum(inputs["climate.heating.setpoint"], 21);
          const tExterior = parseNum(inputs["climate.temperature.winterAverage"], -5);
          const deltaT = tInterior - tExterior;
          const rSi = R_SI_MAP[id] || 0.13;
          const tSi = tInterior - (uValue * deltaT * rSi);
          return Math.round(tSi * 100) / 100;
        }
      });
    });

    GROUND_FACING_COMPONENTS.forEach(({ row, id, label }) => {
      graph.registerNode({
        id: `transmissionLoss.${id}.surfaceTemp`,
        legacyId: `o_${row}`,
        section: "S11",
        classification: "C",
        dependencies: [
          `transmissionLoss.${id}.area`,
          `transmissionLoss.${id}.uValue`,
          "climate.heating.setpoint"
        ],
        label: `${label} Surface Temperature (°C)`,
        compute: (inputs) => {
          const area = parseNum(inputs[`transmissionLoss.${id}.area`]);
          if (area === 0) return "";
          const uValue = parseNum(inputs[`transmissionLoss.${id}.uValue`]);
          const tInterior = parseNum(inputs["climate.heating.setpoint"], 21);
          const groundTemp = 10; // constant
          const deltaT = tInterior - groundTemp;
          const rSi = R_SI_MAP[id] || 0.17;
          const tSi = tInterior - (uValue * deltaT * rSi);
          return Math.round(tSi * 100) / 100;
        }
      });
    });

    // ========================================================================
    // CONDENSATION RISK INDICATORS (rows 85-95)
    // Passivhaus threshold: risk when T_surface < T_interior - 4.2°C
    // Returns "risk" or "safe"; DOMBridge renders 💧 or 🌵
    // ========================================================================
    const RISK_THRESHOLD = 4.2;

    ALL_COMPONENTS.forEach(({ row, id, label }) => {
      graph.registerNode({
        id: `transmissionLoss.${id}.condensationRisk`,
        legacyId: `cr_${row}`,
        section: "S11",
        classification: "C",
        dependencies: [
          `transmissionLoss.${id}.surfaceTemp`,
          "climate.heating.setpoint"
        ],
        label: `${label} Condensation Risk`,
        compute: (inputs) => {
          const surfaceTemp = inputs[`transmissionLoss.${id}.surfaceTemp`];
          if (surfaceTemp === "" || surfaceTemp === null || surfaceTemp === undefined) return "";
          const tInterior = parseNum(inputs["climate.heating.setpoint"], 21);
          return parseNum(surfaceTemp) < (tInterior - RISK_THRESHOLD) ? "risk" : "safe";
        }
      });
    });

    console.log("[TransmissionLossNodes] Registered", inputs.length, "inputs");
  }

  window.TEUI.ComputationNodes.TransmissionLoss = { register, AIR_FACING_COMPONENTS, GROUND_FACING_COMPONENTS };
  console.log("[TransmissionLossNodes] Module loaded");
})();
