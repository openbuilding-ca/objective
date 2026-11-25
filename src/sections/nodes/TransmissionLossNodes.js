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
  // The opaque rows (Openings.js; Andy 2026-11-20): each its own component, its type (c_) and, above
  // grade, its facing (cf_) chosen per row. The old component ids - roof, walls, exposedFloor,
  // wallsBelowGrade, slabOnGrade - are now the per-TYPE sums (OPAQUE TYPE SUMS below), so every reader of
  // the fixed rows (BASESIMP, S12, S21, Wombat's footprint, the reference RSIs) reads its type's total.
  const O = window.TEUI.Openings;
  const opaqueComponent = o => ({
    row: o.s11,
    id: o.id,
    label: `Opaque ${O.s11RowId(o)}`,
    input: "rsi",
    opaque: o
  });

  const AIR_FACING_COMPONENTS = [
    ...O.ABOVE.map(opaqueComponent),
    { row: 88, id: "doors", label: "Doors", input: "uvalue" },
    { row: 89, id: "windowNorth", label: "Window North", input: "uvalue" },
    { row: 90, id: "windowEast", label: "Window East", input: "uvalue" },
    { row: 91, id: "windowSouth", label: "Window South", input: "uvalue" },
    { row: 92, id: "windowWest", label: "Window West", input: "uvalue" },
    { row: 93, id: "skylights", label: "Skylights", input: "uvalue" },
    // The opening rows after the first (Openings.js): each S10 door / window row's S11 twin, its area
    // from S10 (AREA_BRIDGE), its own U-value
    ...window.TEUI.Openings.SLOTS.map(o => ({
      row: o.s11,
      id: o.id,
      label: o.kind === "door" ? `Door ${window.TEUI.Openings.s11RowId(o)}` : `Window ${window.TEUI.Openings.s11RowId(o)}`,
      input: "uvalue"
    }))
  ];

  const GROUND_FACING_COMPONENTS = O.BELOW.map(opaqueComponent);

  const ALL_COMPONENTS = [...AIR_FACING_COMPONENTS, ...GROUND_FACING_COMPONENTS];

  // Interior surface film resistance by component (m²K/W), by direction of heat flow. Used for the
  // surface temperatures (o_85-o_95) and as each RSI row's floor: no assembly's total resistance can
  // fall below its own surface film, so an RSI of 0 (an uninsulated assembly) still loses heat.
  // An opaque row's film is its TYPE's (Openings.TYPES: roof 0.10 up, walls 0.13, floors 0.17 down) -
  // filmFor() below, which reads the row's type input.
  const R_SI_MAP = {
    doors: 0.13,          // horizontal
    windowNorth: 0.13,    // horizontal
    windowEast: 0.13,     // horizontal
    windowSouth: 0.13,    // horizontal
    windowWest: 0.13,     // horizontal
    skylights: 0.10,      // upward
    // the opening rows after the first: doors and windows in a wall, horizontal
    ...Object.fromEntries(window.TEUI.Openings.SLOTS.map(o => [o.id, 0.13]))
  };

  // A component's type and film: an opaque row's type from its input (the Openings default when unset)
  const typeIn = (c, inputs) => (O.TYPES[inputs[`transmissionLoss.${c.id}.type`]] ? inputs[`transmissionLoss.${c.id}.type`] : c.opaque.type);
  const filmFor = (c, inputs) => (c.opaque ? O.TYPES[typeIn(c, inputs)].film : R_SI_MAP[c.id]);
  const typeDeps = c => (c.opaque ? [`transmissionLoss.${c.id}.type`] : []);

  function parseNum(value, defaultVal = 0) {
    if (value === null || value === undefined || value === "N/A") return defaultVal;
    if (value === "Unavailable") return defaultVal;
    const num = parseFloat(String(value).replace(/,/g, ""));
    return isNaN(num) ? defaultVal : num;
  }

  function isUnavailable(value) {
    return value === "Unavailable" || value === "N/A";
  }

  /**
   * A method node's guard (acceptsUnavailable): the first input that is "Unavailable", as the node's
   * { error }, or null when none is. `handled` are inputs the method checks itself.
   */
  function unavailableAsError(inputs, handled = []) {
    const missing = Object.keys(inputs).find(k => inputs[k] === "Unavailable" && !handled.includes(k));
    return missing ? { error: `${missing} is Unavailable` } : null;
  }

  // S10→S11 area bridge: every opening's S11 row mirrors its S10 row (88-93 ← 73-78, 88a ← 73a ...)
  const AREA_BRIDGE = Object.fromEntries(window.TEUI.Openings.ALL.map(o => [o.s11, o.s10]));

  function register(graph) {
    const inputs = [];
    const bridgeNodes = [];

    // ========================================================================
    // INPUTS - Component areas and thermal properties
    // ========================================================================
    ALL_COMPONENTS.forEach(({ row, id, label, input, opaque }) => {
      // An opaque row's type (c_, the label cell's dropdown) and, above grade, its facing (cf_): the
      // first rows face Average (the compass mean every wall took before), a new row North
      if (opaque) {
        inputs.push({
          id: `transmissionLoss.${id}.type`,
          legacyId: `c_${row}`,
          section: "S11",
          classification: "C",
          label: `${label} Element Type`,
          defaultValue: opaque.type
        });
        // its H (dh_, the S11 column beside L): a below-grade wall's is BASESIMP's wall height
        // (transmissionLoss.wallsBelowGrade.height); blank (0) is "not given"
        inputs.push({
          id: `transmissionLoss.${id}.height`,
          legacyId: `dh_${row}`,
          section: "S11",
          classification: "C",
          label: `${label} Height (m)`,
          defaultValue: 0
        });
        if (opaque.group === "above") {
          inputs.push({
            id: `transmissionLoss.${id}.facing`,
            legacyId: `cf_${row}`,
            section: "S11",
            classification: "C",
            label: `${label} Wall Facing`,
            defaultValue: O.isSlot(opaque) ? "North" : "Average"
          });
        }
      }

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
    ALL_COMPONENTS.forEach((c) => {
      const { row, id, label, input } = c;
      if (input === "rsi") {
        // RSI input -> compute U-value
        graph.registerNode({
          id: `transmissionLoss.${id}.uValue`,
          legacyId: `g_${row}`,
          section: "S11",
          classification: "C",
          dependencies: [`transmissionLoss.${id}.rsi`, ...typeDeps(c)],
          label: `${label} U-Value (W/m²K)`,
          compute: (inputs) => {
            const rsi = parseNum(inputs[`transmissionLoss.${id}.rsi`], 5);
            // Was `rsi > 0 ? 1 / rsi : 0`: an RSI of 0 read as U 0, zero heat loss on the row, the
            // opposite of an uninsulated assembly. The row's own surface film is the least it can be.
            return 1 / Math.max(rsi, filmFor(c, inputs));
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
    GROUND_FACING_COMPONENTS.forEach((c) => {
      const { row, id, label } = c;
      graph.registerNode({
        id: `transmissionLoss.${id}.heatLoss`,
        legacyId: `i_${row}`,
        section: "S11",
        classification: "C",
        dependencies: [
          `transmissionLoss.${id}.area`,
          `transmissionLoss.${id}.uValue`,
          ...typeDeps(c),
          "transmissionLoss.wallsBelowGrade.area",
          "transmissionLoss.slabOnGrade.area",
          "climate.groundFacing.hdd",
          "ground.methodInEffect",
          "ground.basesimp"
        ],
        label: `${label} Heat Loss (kWh/yr)`,
        compute: (inputs) => {
          // F280 Mode On (BASESIMP): the row's share of the foundation's heating-season loss
          // (ground.basesimp.annual: walls = above grade + their below-grade share, slab = the rest),
          // split over the rows of its type by area (one row of a type takes it whole)
          if (inputs["ground.methodInEffect"] === "BASESIMP") {
            const bs = inputs["ground.basesimp"];
            if (!bs || bs.error) return "Unavailable";
            const type = typeIn(c, inputs);
            const loss = type === "slabOnGrade" ? bs.annual.slab : bs.annual.walls;
            const total = parseNum(inputs[`transmissionLoss.${type}.area`]);
            const area = parseNum(inputs[`transmissionLoss.${id}.area`]);
            // a type with no area keeps its loss on its first row (a slab's edge strip reaches B.9's
            // walls figure with no below-grade wall, as it always did)
            if (!(total > 0)) return O.TYPES[type].base === String(row) ? loss : 0;
            return loss * (area / total);
          }
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
    // OPAQUE TYPE SUMS (Andy 2026-11-20): transmissionLoss.<type>.* over the rows of its grade that hold
    // the type - the ids the fixed rows had, so BASESIMP, S12, S21, F280, Wombat and the reference RSIs
    // read the type's total. area, heatLoss, heatGain: sums. uValue: UA / A. rsi: the AREA-WEIGHTED INPUT
    // RSI (BASESIMP reads it as the added insulation, so a single uninsulated row stays 0, not its film).
    // With no area, U and RSI are the first row of the type's: one row of a type reads exactly as it did.
    // ========================================================================
    Object.entries(O.TYPES).forEach(([type, t]) => {
      const pool = (t.grade === "above" ? AIR_FACING_COMPONENTS : GROUND_FACING_COMPONENTS).filter(c => c.opaque);
      const deps = suffixes => pool.flatMap(c => [`transmissionLoss.${c.id}.type`, ...suffixes.map(s => `transmissionLoss.${c.id}.${s}`)]);
      const rowsOf = inputs => pool.filter(c => typeIn(c, inputs) === type);
      const sum = (inputs, s) => rowsOf(inputs).reduce((total, c) => total + parseNum(inputs[`transmissionLoss.${c.id}.${s}`]), 0);
      const weighted = (inputs, perRow) => {
        const rows = rowsOf(inputs);
        const area = rows.reduce((a, c) => a + parseNum(inputs[`transmissionLoss.${c.id}.area`]), 0);
        if (area > 0) return rows.reduce((s, c) => s + parseNum(inputs[`transmissionLoss.${c.id}.area`]) * perRow(c), 0) / area;
        return rows.length ? perRow(rows[0]) : 0;
      };
      graph.registerNode({
        id: `transmissionLoss.${type}.area`,
        section: "S11",
        classification: "C",
        dependencies: deps(["area"]),
        label: `${t.label}: Total Area (m²)`,
        compute: (inputs) => sum(inputs, "area")
      });
      graph.registerNode({
        id: `transmissionLoss.${type}.uValue`,
        section: "S11",
        classification: "C",
        dependencies: deps(["area", "uValue"]),
        label: `${t.label}: U-Value, area-weighted (W/m²K)`,
        compute: (inputs) => weighted(inputs, c => parseNum(inputs[`transmissionLoss.${c.id}.uValue`]))
      });
      graph.registerNode({
        id: `transmissionLoss.${type}.rsi`,
        section: "S11",
        classification: "C",
        dependencies: deps(["area", "rsi"]),
        label: `${t.label}: RSI, area-weighted input (m²K/W)`,
        compute: (inputs) => weighted(inputs, c => parseNum(inputs[`transmissionLoss.${c.id}.rsi`]))
      });
      graph.registerNode({
        id: `transmissionLoss.${type}.heatLoss`,
        section: "S11",
        classification: "C",
        dependencies: deps(["heatLoss"]),
        label: `${t.label}: Total Heat Loss (kWh/yr)`,
        compute: (inputs) => sum(inputs, "heatLoss")
      });
      graph.registerNode({
        id: `transmissionLoss.${type}.heatGain`,
        section: "S11",
        classification: "C",
        dependencies: deps(["heatGain"]),
        label: `${t.label}: Total Heat Gain (kWh/yr)`,
        compute: (inputs) => sum(inputs, "heatGain")
      });
      // the type's height (m): the area-weighted H of its rows that give one (an H and an area);
      // 0 when none does. BASESIMP's wall height is the below-grade walls' (Andy 2026-11-20).
      graph.registerNode({
        id: `transmissionLoss.${type}.height`,
        section: "S11",
        classification: "C",
        dependencies: deps(["area", "height"]),
        label: `${t.label}: Height, area-weighted over the rows with H (m)`,
        compute: (inputs) => {
          const rows = rowsOf(inputs).filter(
            c => parseNum(inputs[`transmissionLoss.${c.id}.height`]) > 0 && parseNum(inputs[`transmissionLoss.${c.id}.area`]) > 0
          );
          const area = rows.reduce((a, c) => a + parseNum(inputs[`transmissionLoss.${c.id}.area`]), 0);
          if (!(area > 0)) return 0;
          return rows.reduce((s, c) => s + parseNum(inputs[`transmissionLoss.${c.id}.area`]) * parseNum(inputs[`transmissionLoss.${c.id}.height`]), 0) / area;
        }
      });
      // the type's TALLEST H (m) over its rows with an area: a wall row is a facade, its H the facade's
      // full height, so the tallest above-grade wall is the house's height above its basement (S12 B.19.4,
      // Andy 2026-11-20); 0 when no row gives one
      graph.registerNode({
        id: `transmissionLoss.${type}.maxHeight`,
        section: "S11",
        classification: "C",
        dependencies: deps(["area", "height"]),
        label: `${t.label}: Tallest H over the rows with an area (m)`,
        compute: (inputs) =>
          rowsOf(inputs)
            .filter(c => parseNum(inputs[`transmissionLoss.${c.id}.area`]) > 0)
            .reduce((m, c) => Math.max(m, parseNum(inputs[`transmissionLoss.${c.id}.height`])), 0)
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

    AIR_FACING_COMPONENTS.forEach((c) => {
      const { row, id, label } = c;
      graph.registerNode({
        id: `transmissionLoss.${id}.surfaceTemp`,
        legacyId: `o_${row}`,
        section: "S11",
        classification: "C",
        dependencies: [
          `transmissionLoss.${id}.area`,
          `transmissionLoss.${id}.uValue`,
          ...typeDeps(c),
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
          const rSi = filmFor(c, inputs) || 0.13;
          const tSi = tInterior - (uValue * deltaT * rSi);
          return Math.round(tSi * 100) / 100;
        }
      });
    });

    GROUND_FACING_COMPONENTS.forEach((c) => {
      const { row, id, label } = c;
      graph.registerNode({
        id: `transmissionLoss.${id}.surfaceTemp`,
        legacyId: `o_${row}`,
        section: "S11",
        classification: "C",
        dependencies: [
          `transmissionLoss.${id}.area`,
          `transmissionLoss.${id}.uValue`,
          ...typeDeps(c),
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
          const rSi = filmFor(c, inputs) || 0.17;
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

    // ========================================================================
    // BASESIMP - the foundation's heat loss by CSA F280-12 Cl. 5.2.2.1 (S03 G.4.4-G.4.10)
    // ========================================================================
    graph.registerNode({
      id: "ground.basesimp",
      section: "S03",
      classification: "C",
      dependencies: [
        "ground.basesimp.configuration",
        "ground.basesimp.depth",
        "ground.basesimp.exposedPerimeter",
        "wombat.footprint.perimeter",
        "ground.basesimp.soilConductivity",
        "ground.basesimp.waterTable",
        "transmissionLoss.slabOnGrade.area",
        "transmissionLoss.wallsBelowGrade.area",
        "transmissionLoss.slabOnGrade.rsi",
        "transmissionLoss.wallsBelowGrade.rsi",
        "transmissionLoss.wallsBelowGrade.height",
        "climate.location.province",
        "climate.location.city",
        "climate.heating.obcSetpoint",
        "climate.cooling.setpoint",
        "climate.temperature.coldest",
        "climate.temperature.hottest",
        // the heating season (OBJECTIVE's annual figure): its length, set-point and outdoor mean
        "climate.coolingDays",
        "climate.heating.setpoint",
        "climate.temperature.winterAverage"
      ],
      label: "BASESIMP foundation heat loss (F280 Cl. 5.2.2.1)",
      // A method's result, read with F280 Mode Off too (S12 h_102, S11 rows 94-95, S15 d_137 take their
      // OBJECTIVE form then): an input it cannot have is its { error }, never "Unavailable", which would
      // stop those readers before they reach their own method check (Mark, #134: a model with no slab and
      // no exposed floor read Unavailable down to TEUI). Its F280 readers turn the error into Unavailable.
      // Wombat's perimeter is Unavailable exactly when there is no footprint, which basesimpFor names.
      acceptsUnavailable: true,
      compute: (inputs) => unavailableAsError(inputs, ["wombat.footprint.perimeter"]) ?? basesimpFor(inputs)
    });

    graph.registerNode({
      id: "ground.basesimp.deepGround",
      legacyId: "h_26b",
      section: "S03",
      classification: "C",
      // From F280's weather table for S03's city, whether or not BASESIMP has its geometry: it read
      // BASESIMP's result, so any missing BASESIMP input (G.4.6 perimeter 0, no slab) showed it
      // Unavailable for every city (Andy 2026-11-19)
      dependencies: ["climate.location.province", "climate.location.city"],
      label: "Deep Ground Temperature (F280)",
      compute: (inputs) =>
        window.TEUI.F280Weather?.lookup(inputs["climate.location.province"], inputs["climate.location.city"])?.deepGround ??
        "Unavailable"
    });

    graph.registerNode({
      id: "ground.basesimp.peakHeatLoss",
      legacyId: "l_26b",
      section: "S03",
      classification: "C",
      dependencies: ["ground.basesimp"],
      label: "BASESIMP Peak Heat Loss (W)",
      compute: (inputs) => {
        const r = inputs["ground.basesimp"];
        return r && !r.error ? r.heatingLoad : "Unavailable";
      }
    });

    console.log("[TransmissionLossNodes] Registered", inputs.length, "inputs");
  }

  /**
   * BasementHLR.xls's inputs from the model (F280 Cl. 5.2.2.1 a)-q)):
   *   a) the outside length and width come from S11's slab area A and the exposed perimeter P (G.4.6):
   *      P at least a square's (4 x sqrt A) is the outline of a rectangle of area A, all of it exposed
   *      (L + W = P / 2, L x W = A); a shorter P is a square of area A with only P exposed - the
   *      workbook's own attached-house case (Input!G7). The height is S11's below-grade wall area / P;
   *      the depth below grade is G.4.5. F280 Archetype 1 this way: 1387 W, F280's room-by-room 1384 W.
   *      A SLAB configuration (G.4.4 SCN / SCB / SCA) is NRCan's SlabOnGradeHLR.xls instead: height 0,
   *      depth 0.05 m (its Input!B11:B12), no below-grade wall, S11's slab RSI the one added insulation.
   *   b) c) d) soil, water table and configuration: G.4.7, G.4.8, G.4.4.
   *   e) f) the ADDED insulation: S11's below-grade wall RSI (all as interior: BasementHLR reads the
   *      walls' insulation only as max(interior, exterior) or their sum, so the split never changes a
   *      result) and S11's slab RSI.
   *   i) j) k) heating degree days, deep ground temperature, monthly dry bulbs: F280's weather table
   *      for S03's city (F280Weather.js; a city F280 does not list takes its nearest F280 location's).
   *   l) m) n) room and design temperatures: S03's design set-point and L.3.1 / L.3.2.
   *   o) no radiant slab; q) no openings in the above-grade foundation wall (OBJECTIVE does not
   *      separate them).
   * Returns Basesimp.compute()'s result plus the geometry and weather used, or { error } naming what
   * is missing - never a substitute value.
   */
  function basesimpFor(inputs) {
    const B = window.TEUI.Basesimp;
    const W = window.TEUI.F280Weather;
    if (!B || !W) return { error: "BASESIMP is not loaded" };
    const area = parseNum(inputs["transmissionLoss.slabOnGrade.area"]);
    const wallArea = parseNum(inputs["transmissionLoss.wallsBelowGrade.area"]);
    // G.4.6 blank: Wombat's footprint perimeter, the whole outline (S19 19.2b; Andy 2026-11-19)
    const typedPerimeter = parseNum(inputs["ground.basesimp.exposedPerimeter"]);
    const perimeter = typedPerimeter > 0 ? typedPerimeter : parseNum(inputs["wombat.footprint.perimeter"]);
    const configuration = parseNum(inputs["ground.basesimp.configuration"], 1);
    if (!window.TEUI.BasesimpData?.configs?.[configuration]) {
      return { error: `no BASESIMP configuration #${configuration}` };
    }
    const name = window.TEUI.BasesimpData.configs[configuration].name;
    // FoundationCC's SC* configurations are slabs on grade: NRCan's SlabOnGradeHLR.xls, height 0 and its
    // depth 0.05 m (its Input!B11:B12); every other is a basement by BasementHLR.xls
    const slab = B.isSlab(configuration);
    if (!(area > 0)) return { error: "no slab area (S11 D.4.11)" };
    if (slab && wallArea > 0) {
      return { error: `S03 G.4.4 is ${name}, a slab on grade, but S11 has ${wallArea} m2 of below-grade wall: choose a basement configuration` };
    }
    if (!slab && !(wallArea > 0)) {
      return { error: `S11 has no below-grade wall, so S03 G.4.4 (${name}, a basement) needs a slab-on-grade configuration (SCN, SCB or SCA)` };
    }
    if (!(perimeter > 0)) return { error: "no exposed perimeter (S03 G.4.6, or Wombat's footprint, S19 19.2b)" };
    // The basement wall's height: S11's below-grade wall rows' H where given (their area-weighted H,
    // Andy 2026-11-20: "take Ht. from the Bsmt wall ht"); otherwise their area over the perimeter, as before
    const heightFromRows = parseNum(inputs["transmissionLoss.wallsBelowGrade.height"]);
    const heightFrom = slab ? "slab" : heightFromRows > 0 ? "S11 H" : "area / perimeter";
    const height = slab ? 0 : heightFromRows > 0 ? heightFromRows : wallArea / perimeter;
    const depth = slab ? 0.05 : parseNum(inputs["ground.basesimp.depth"]);
    if (!slab && (!(depth > 0) || depth > height)) {
      return { error: `depth below grade ${depth} m must be above 0 and at most the wall height ${height.toFixed(2)} m` };
    }
    const province = inputs["climate.location.province"];
    const city = inputs["climate.location.city"];
    const weather = W.lookup(province, city);
    if (!weather) return { error: `F280's weather table does not list ${city}, ${province}` };

    const side = Math.sqrt(area);
    let length, width, exposedPerimeter;
    if (perimeter >= 4 * side) {
      const half = perimeter / 2;
      const root = Math.sqrt(half * half - 4 * area);
      length = (half + root) / 2;
      width = (half - root) / 2;
      exposedPerimeter = 0; // the whole outline
    } else {
      length = width = side;
      exposedPerimeter = perimeter;
    }
    const result = B.compute({
      configuration,
      length,
      width,
      height,
      depth,
      soilk: parseNum(inputs["ground.basesimp.soilConductivity"]),
      wtable: parseNum(inputs["ground.basesimp.waterTable"]),
      interior: parseNum(inputs["transmissionLoss.wallsBelowGrade.rsi"]),
      exterior: 0,
      slab: parseNum(inputs["transmissionLoss.slabOnGrade.rsi"]),
      overlap: 0,
      exposedPerimeter,
      windowArea: 0,
      doorArea: 0,
      hdd: weather.hdd,
      deepGround: weather.deepGround,
      monthly: weather.monthly,
      heating: {
        month: 1,
        room: parseNum(inputs["climate.heating.obcSetpoint"], 22),
        design: parseNum(inputs["climate.temperature.coldest"]),
        slab: 0
      },
      cooling: {
        month: 7,
        room: parseNum(inputs["climate.cooling.setpoint"], 24),
        design: parseNum(inputs["climate.temperature.hottest"])
      }
    });
    // OBJECTIVE's annual figure: the heating season's loss (Basesimp.seasonLoss) - 365 - Days Cooling
    // days centred on the coldest day, at the ENERGY set-point, the above-grade strip against S03 L.3.3's
    // winter average (Andy 2026-11-19, "that is what drives the heating season split")
    const days = 365 - parseNum(inputs["climate.coolingDays"], 120);
    const outdoorMean = parseNum(inputs["climate.temperature.winterAverage"], NaN);
    if (!Number.isFinite(outdoorMean)) return { error: "no winter average temperature (S03 L.3.3)" };
    const annual = B.seasonLoss(result, {
      room: parseNum(inputs["climate.heating.setpoint"], 21),
      outdoorMean,
      deepGround: weather.deepGround,
      days
    });
    // Each input is checked above, so a result that is not a number is BASESIMP's own failure: say so,
    // never name an input that is there (Mark, #134: a depth equal to the wall height read as "no
    // winter average temperature")
    if (!Number.isFinite(annual.total) || !Number.isFinite(result.heatingLoad)) {
      return { error: "BASESIMP gave no number for these inputs" };
    }
    return { ...result, geometry: { length, width, height, heightFrom, depth, perimeter, perimeterFromWombat: !(typedPerimeter > 0) }, weather, annual };
  }

  window.TEUI.ComputationNodes.TransmissionLoss = {
    register,
    AIR_FACING_COMPONENTS,
    GROUND_FACING_COMPONENTS,
    basesimpFor
  };
  console.log("[TransmissionLossNodes] Module loaded");
})();
