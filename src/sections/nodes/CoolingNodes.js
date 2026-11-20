/**
 * CoolingNodes.js - Psychrometric and Free Cooling Computation Nodes
 *
 * This module implements the cooling calculations from Cooling.js as graph nodes,
 * enabling full computation graph cutover without legacy dependency.
 *
 * The cooling need is ISO 52016-1's monthly method on the location's climate
 * station (cooling.iso52016 -> src/core/CoolingISO52016.js, ABCD-OBJECTIVE-PRO
 * §4.1 step 6). Free cooling (h_124), days of active cooling (m_124) and the
 * gain rows the need is attributed to (k_64-k_79, k_85-k_97, k_101-k_103,
 * d_122, d_123) all read that one node, the annual latent load included
 * (F280 Annex B, step 7). The latent load factor is F280 Annex B's design
 * form, for sizing. l_20 / l_21 (S03's night-time temperature and season RH)
 * are still shown but no longer feed the energy path.
 *
 * Parnas Tables: docs/parnas-tables/cooling/
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  // ============================================================================
  // HELPERS
  // ============================================================================

  /** W/K per L/s of air - F280ComplianceNodes' AIR_HEAT_CAPACITY. */
  const AIR_HEAT_CAPACITY = 1.21;

  function parseNum(value, defaultVal = 0) {
    if (value === null || value === undefined || value === "N/A") return defaultVal;
    if (value === "Unavailable") return defaultVal;
    const num = parseFloat(String(value).replace(/,/g, ""));
    return isNaN(num) ? defaultVal : num;
  }

  // The building as cooling.iso52016 reads it. S11's air-facing rows with
  // their tilt (for the sky view) and whether opaque (solar on the outer
  // surface); a window's or door's solar is S10's glazing row instead.
  const AIR_COMPONENTS = [
    ["roof", "roof", true],
    ["walls", "wall", true],
    ["exposedFloor", "floor", true],
    ["doors", "wall", false],
    ["windowNorth", "wall", false],
    ["windowEast", "wall", false],
    ["windowSouth", "wall", false],
    ["windowWest", "wall", false],
    ["skylights", "roof", false]
  ];
  const GROUND_COMPONENTS = ["wallsBelowGrade", "slabOnGrade"];
  const GLAZING_ROWS = [73, 74, 75, 76, 77, 78];
  // LIMITATION: no climate.timeframe (h_20) and no climate.cooling.degreedays
  // (d_21) here. The station is one CWEC 2020 typical year with no future
  // period, so "Future" moves heating (HDD18_2021_2050) but models no warmer
  // summer: the cooling need moves only where the future HDD changes the
  // climate zone and with it airTightness.nFactor. d_21 feeds nothing. S03
  // says so (h_20 / d_21 tooltips, d_21 ghosted). Whether to model future
  // cooling is a building-science decision still to be made.
  const ISO_DEPENDENCIES = [
    "climate.station",
    "climate.cooling.setpoint",
    "climate.heating.setpoint",
    "building.indoorRH",
    "building.coolingLatentBasis",
    "building.conditionedFloorArea",
    "building.typologySelection",
    ...[...AIR_COMPONENTS.map(([key]) => key), ...GROUND_COMPONENTS].flatMap((key) => [
      `transmissionLoss.${key}.area`,
      `transmissionLoss.${key}.uValue`
    ]),
    "transmissionLoss.thermalBridgePenalty",
    ...GLAZING_ROWS.flatMap((row) => [
      `radiantGains.row${row}.area`,
      `radiantGains.row${row}.orientation`,
      `radiantGains.row${row}.shgc`,
      `radiantGains.row${row}.summerShading`
    ]),
    "ventilation.volumetricRate",
    "mechanical.ventilation.summerBoost",
    "mechanical.ventilation.efficiency",
    "airTightness.nrl50",
    "envelope.airFacing.area",
    "airTightness.nFactor",
    "energy.plugLoads.subtotal",
    "internal.occupants.annual",
    "waterHeating.systemLosses",
    "occupancy.occupants",
    "occupancy.occupiedHours",
    "mechanical.ventilation.recoveryType",
    "mechanical.ventilation.ervLatentEfficiency",
    "cooling.latentMethod"
  ];

  // ============================================================================
  // INPUT NODES
  // ============================================================================

  // Inputs that are NOT registered elsewhere
  // Other inputs are already registered:
  //   - climate.coolingDays (m_19) in ClimateNodes
  //   - climate.cooling.setpoint (h_24) in ClimateNodes
  //   - ventilation.volumeRate (h_120) in VentilationNodes
  //   - ventilation.volumetricRate (d_120) in VentilationNodes
  // (l_20 / l_21 are computed from the climate station now - ClimateNodes)
  const CoolingInputs = [
    // Building inputs - NOT registered elsewhere
    {
      id: "building.indoorRH",
      legacyId: "i_59",
      defaultValue: 45,
      classification: "C",
      section: "S08",
      label: "Indoor Relative Humidity",
      unit: "%"
    },
    // The indoor state the coil is controlled to, for the latent load AND
    // free cooling's "drier" test (Andy 2026-10-31: a CONTROL setpoint, not a
    // sensor reading): "F280" = CSA F280's Hi, 9.3 g/kg (24 °C / 50 %);
    // "Target" = the setpoint at i_59's RH. A measured indoor RH belongs to
    // the hourly engine (P7), as an hourly series beside the station's.
    {
      id: "building.coolingLatentBasis",
      legacyId: "g_59",
      defaultValue: "F280",
      classification: "C",
      section: "S08",
      label: "Indoor State for the Latent Cooling Load"
    },
    // The latent method (S13 i_122; Andy 2026-10-31): F280 (the Annex as
    // written, no ERV credit at design) · OBJECTIVE (our own: the ERV credited
    // at design too) · ASHRAE140 (Class II: no latent heat extraction at all)
    {
      id: "cooling.latentMethod",
      legacyId: "i_122",
      defaultValue: "F280",
      classification: "C",
      section: "S13",
      label: "Latent Load Method"
    }
    // NOTE: mechanical.ventilation.summerBoost (l_119) is registered in MechanicalNodes
  ];

  // ============================================================================
  // COMPUTED NODES - STAGE 1 (Independent)
  // ============================================================================

  const CoolingNodesStage1 = [
    // ========================================================================
    // Latent Load Factor - F280-12 Annex B.6.3.1's direct method at DESIGN,
    // by the latent method (i_122: F280 as written · OBJECTIVE credits an
    // ERV · ASHRAE140 none, so llf = 1):
    // (sensible + latent) / sensible, so f280.nominalCoolingCapacity's
    // total x max(1, llf) is the Annex's HGb = Σ HGsr + HGlp + HGlal + HGlav
    // (it "replaces" 6.3.1's 1.3). Sensible = d_139 + the infiltration gain
    // the F280 node adds (the same 1.21 x NRL50 x Ae / N x ΔT); latent = 67 W
    // per occupant + 3 W per L/s per g/kg on leakage and ventilation, DHD =
    // Ho - 9.3 g/kg, Ho at the July 2.5 % dry bulb and its coincident wet
    // bulb, at standard pressure (as F280's Table 5 OHR). Before the scripts
    // load: F280's 1.3.
    // ========================================================================
    {
      id: "cooling.latentLoadFactor",
      legacyId: "cooling_latentLoadFactor",
      dependencies: [
        "energy.peakCooling.totalKw",
        "airTightness.nrl50",
        "envelope.airFacing.area",
        "airTightness.nFactor",
        "climate.temperature.hottest",
        "climate.temperature.hottestWetBulb",
        "climate.cooling.setpoint",
        "ventilation.volumetricRate",
        "occupancy.occupants",
        "cooling.latentMethod",
        "mechanical.ventilation.recoveryType",
        "mechanical.ventilation.ervLatentEfficiency",
        "building.coolingLatentBasis",
        "building.indoorRH"
      ],
      classification: "C",
      section: "S13",
      label: "Latent Load Factor",
      compute: (inputs) => {
        const CS = window.TEUI?.ClimateStation;
        const ISO = window.TEUI?.CoolingISO52016;
        if (!CS || !ISO) return 1.3;
        const nFactor = parseNum(inputs["airTightness.nFactor"], 13);
        const leakLs = nFactor > 0
          ? (parseNum(inputs["airTightness.nrl50"]) * parseNum(inputs["envelope.airFacing.area"])) / nFactor
          : 0;
        const tdb = parseNum(inputs["climate.temperature.hottest"], 34);
        const dT = tdb - parseNum(inputs["climate.cooling.setpoint"], 24);
        const sensibleW =
          parseNum(inputs["energy.peakCooling.totalKw"]) * 1000 +
          (dT > 0 ? AIR_HEAT_CAPACITY * leakLs * dT : 0);
        if (sensibleW <= 0) return 1;
        const ho = CS.humidityRatioFromWetBulb(
          tdb,
          parseNum(inputs["climate.temperature.hottestWetBulb"], 23),
          ISO.F280_PRESSURE
        );
        // OBJECTIVE's indoor state is S08's basis (F280's 9.3 g/kg, or the
        // setpoint at i_59's RH - at the same standard pressure as ho)
        const hi =
          inputs["building.coolingLatentBasis"] === "Target"
            ? CS.humidityRatio(
                parseNum(inputs["climate.cooling.setpoint"], 24),
                parseNum(inputs["building.indoorRH"], 45),
                ISO.F280_PRESSURE
              )
            : ISO.F280_INDOOR_W;
        const latentW = ISO.designLatent({
          occupants: parseNum(inputs["occupancy.occupants"], 4),
          ventLs: parseNum(inputs["ventilation.volumetricRate"]),
          leakLs,
          ho,
          method: inputs["cooling.latentMethod"] || "F280",
          hi,
          recoveryType: inputs["mechanical.ventilation.recoveryType"],
          ervLatentPercent: parseNum(inputs["mechanical.ventilation.ervLatentEfficiency"])
        });
        return +(1 + latentW / sensibleW).toFixed(4);
      }
    },

    // ========================================================================
    // ISO 52016-1 monthly cooling (src/core/CoolingISO52016.js) - the one
    // node that balances the year on the climate station; the ids below and
    // the gain rows in S09-S13 read their share of it. null until the
    // station has loaded (ClimateStation.request recalculates on arrival).
    // ========================================================================
    {
      id: "cooling.iso52016",
      dependencies: ISO_DEPENDENCIES,
      classification: "C",
      section: "S13",
      label: "ISO 52016-1 Monthly Cooling",
      compute: (inputs) => {
        const CS = window.TEUI?.ClimateStation;
        const ISO = window.TEUI?.CoolingISO52016;
        const station = CS && ISO ? CS.request(inputs["climate.station"]) : null;
        if (!station) return null;
        const setpoint = parseNum(inputs["climate.cooling.setpoint"], 24);
        const indoorRH = parseNum(inputs["building.indoorRH"], 45);
        const component = ([key, tilt, opaque]) => ({
          key,
          tilt,
          opaque,
          A: parseNum(inputs[`transmissionLoss.${key}.area`]),
          U: parseNum(inputs[`transmissionLoss.${key}.uValue`])
        });
        const nFactor = parseNum(inputs["airTightness.nFactor"], 13);
        const b = {
          setpoint,
          heatingSetpoint: parseNum(inputs["climate.heating.setpoint"], 22),
          floorArea: parseNum(inputs["building.conditionedFloorArea"]),
          typology: inputs["building.typologySelection"],
          air: AIR_COMPONENTS.map(component),
          ground: GROUND_COMPONENTS.map((key) => component([key, "ground", true])),
          tbPercent: parseNum(inputs["transmissionLoss.thermalBridgePenalty"], 5),
          glazing: GLAZING_ROWS.map((row) => ({
            key: `glazing${row}`,
            A: parseNum(inputs[`radiantGains.row${row}.area`]),
            shgc: parseNum(inputs[`radiantGains.row${row}.shgc`], 0.35),
            summerShading: parseNum(inputs[`radiantGains.row${row}.summerShading`]),
            orientation: inputs[`radiantGains.row${row}.orientation`] || "Average"
          })),
          ventLs: parseNum(inputs["ventilation.volumetricRate"]),
          boost: Math.max(1, parseNum(inputs["mechanical.ventilation.summerBoost"], 1)),
          hrvPercent: parseNum(inputs["mechanical.ventilation.efficiency"], 89),
          leakLs: nFactor > 0
            ? (parseNum(inputs["airTightness.nrl50"]) * parseNum(inputs["envelope.airFacing.area"])) / nFactor
            : 0,
          internalKWh:
            parseNum(inputs["energy.plugLoads.subtotal"]) +
            parseNum(inputs["internal.occupants.annual"]) +
            parseNum(inputs["waterHeating.systemLosses"]),
          occupants: parseNum(inputs["occupancy.occupants"], 4),
          occupiedHours: parseNum(inputs["occupancy.occupiedHours"], 4380),
          recoveryType: inputs["mechanical.ventilation.recoveryType"] || "HRV",
          ervLatentPercent: parseNum(inputs["mechanical.ventilation.ervLatentEfficiency"]),
          latentMethod: inputs["cooling.latentMethod"] || "F280"
        };
        // S08's basis sets the indoor state for latent AND the drier test
        const wIn =
          inputs["building.coolingLatentBasis"] === "Target" ? undefined : ISO.F280_INDOOR_W;
        return ISO.annual(b, station.months, CS.freeCooling(station, setpoint, indoorRH, wIn));
      }
    },

    // ========================================================================
    // Free Cooling Potential (cooling_h_124) - the boost's extra flow over the
    // cooler-AND-drier hours, before the need caps it
    // ========================================================================
    {
      id: "cooling.freeCoolingRaw",
      legacyId: "cooling_h_124",
      dependencies: ["cooling.iso52016"],
      classification: "C",
      section: "S13",
      label: "Free Cooling Potential",
      unit: "kWh/yr",
      compute: (inputs) => +(inputs["cooling.iso52016"]?.freeCoolingPotential ?? 0).toFixed(2)
    },

    // ========================================================================
    // Free Cooling (h_124) - KEY OUTPUT: what the extra flow saves, after heat
    // recovery, the need capping it through η (ISO 52016-1 6.6.6)
    // ========================================================================
    {
      id: "cooling.freeCoolingLimit",
      legacyId: "h_124",
      dependencies: ["cooling.iso52016"],
      classification: "C",
      section: "S13",
      label: "Free Cooling Limit",
      unit: "kWh/yr",
      compute: (inputs) => +(inputs["cooling.iso52016"]?.freeCooling ?? 0).toFixed(2)
    }
  ];

  // ============================================================================
  // COMPUTED NODES - STAGE 2
  // ============================================================================

  const CoolingNodesStage2 = [
    // ========================================================================
    // Days of Active Cooling (m_124) - KEY OUTPUT: Σ days x f_C, the share of
    // each month that is cooling, Q_C,nd / (Q_C,nd + Q_H,nd) (the EPB
    // workbook's Calc_C_m col. X), on the mitigated need
    // ========================================================================
    {
      id: "cooling.daysActiveCooling",
      legacyId: "m_124",
      dependencies: ["cooling.iso52016", "mechanical.cooling.systemType"],
      classification: "C",
      section: "S13",
      label: "Days of Active Cooling",
      unit: "days",
      compute: (inputs) => {
        if (inputs["mechanical.cooling.systemType"] === "No Cooling") return 0;
        return Math.round(inputs["cooling.iso52016"]?.coolingDays ?? 0);
      }
    },

    // ========================================================================
    // Free Cooling Percentage (d_124)
    // Legacy formula uses d_129 (unmitigated CED), returns ratio (0-1)
    // ========================================================================
    {
      id: "cooling.freeCoolingPercent",
      legacyId: "d_124",
      dependencies: [
        "cooling.freeCoolingLimit",
        "energy.ced.unmitigated"
      ],
      classification: "C",
      section: "S13",
      label: "Free Cooling Percentage",
      unit: "ratio",
      compute: (inputs) => {
        // Legacy: percentFreeCooling = finalFreeCoolingLimit / coolingLoadUnmitigated
        const freeCoolingLimit = parseNum(inputs["cooling.freeCoolingLimit"], 0);
        const d_129 = parseNum(inputs["energy.ced.unmitigated"], 0);

        if (d_129 <= 0) {
          return 0;
        }

        // Return ratio (0-1) to match legacy format
        return +(freeCoolingLimit / d_129).toFixed(4);
      }
    }
  ];

  // ============================================================================
  // REGISTRATION
  // ============================================================================

  function registerCoolingNodes(graph) {
    // Register inputs
    for (const input of CoolingInputs) {
      graph.registerInput(input);
    }

    // Register Stage 1 nodes (independent)
    for (const node of CoolingNodesStage1) {
      graph.registerNode(node);
    }

    // Register Stage 2 nodes (dependent)
    for (const node of CoolingNodesStage2) {
      graph.registerNode(node);
    }

    console.log(
      `[CoolingNodes] Registered ${CoolingInputs.length} inputs and ${CoolingNodesStage1.length + CoolingNodesStage2.length} computed nodes`
    );
  }

  // ============================================================================
  // EXPORT
  // ============================================================================

  window.TEUI.ComputationNodes.Cooling = {
    inputs: CoolingInputs,
    nodesStage1: CoolingNodesStage1,
    nodesStage2: CoolingNodesStage2,
    nodes: [...CoolingNodesStage1, ...CoolingNodesStage2],
    register: registerCoolingNodes
  };

  console.log("[CoolingNodes] Module loaded");
})();
