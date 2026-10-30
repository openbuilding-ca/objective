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
 * d_122, d_123) all read that one node. The psychrometric nodes below (wet
 * bulb, humidity ratios, latent load factor) still run on l_20 / l_21 until
 * step 7 replaces the latent load with F280 Annex B's.
 *
 * Parnas Tables: docs/parnas-tables/cooling/
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  // ============================================================================
  // CONSTANTS (from Cooling.js)
  // ============================================================================

  const CONSTANTS = {
    airDensity: 1.204,           // kg/m³ - Mass of air at standard conditions
    specificHeatCapacity: 1005,  // J/(kg·K) - Specific heat capacity of air
    latentHeatVaporization: 2501000, // J/kg - Latent heat of vaporization
    outdoorSeasonalRH: 0.7,      // A57 - Outdoor seasonal relative humidity
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  function parseNum(value, defaultVal = 0) {
    if (value === null || value === undefined || value === "N/A") return defaultVal;
    if (value === "Unavailable") return defaultVal;
    const num = parseFloat(String(value).replace(/,/g, ""));
    return isNaN(num) ? defaultVal : num;
  }

  /**
   * Calculate saturation vapor pressure using Tetens formula
   * @param {number} temp - Temperature in °C
   * @returns {number} Saturation vapor pressure in Pa
   */
  function saturationVaporPressure(temp) {
    return 610.94 * Math.exp((17.625 * temp) / (temp + 243.04));
  }

  /**
   * Calculate wet bulb temperature from dry bulb and RH
   * Excel: E64-E66 linear approximation
   * @param {number} tdb - Dry bulb temperature °C
   * @param {number} rhPercent - Relative humidity %
   * @returns {number} Wet bulb temperature °C
   */
  function wetBulbTemperature(tdb, rhPercent) {
    return tdb - (tdb - (tdb - (100 - rhPercent) / 5)) * (0.1 + 0.9 * (rhPercent / 100));
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
  const ISO_DEPENDENCIES = [
    "climate.station",
    "climate.cooling.setpoint",
    "climate.heating.setpoint",
    "building.indoorRH",
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
    "waterHeating.systemLosses"
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
  const CoolingInputs = [
    // Climate inputs (from S03) - canonical registration for l_20/l_21
    {
      id: "climate.cooling.nightTemp",
      legacyId: "l_20",
      defaultValue: 20.43,
      classification: "G",
      section: "S03",
      label: "Night-Time Temperature",
      unit: "°C"
    },
    {
      id: "climate.cooling.seasonMeanRH",
      legacyId: "l_21",
      defaultValue: 55.85,
      classification: "G",
      section: "S03",
      label: "Cooling Season Mean RH",
      unit: "%"
    },
    // Building inputs - NOT registered elsewhere
    {
      id: "building.indoorRH",
      legacyId: "i_59",
      defaultValue: 45,
      classification: "C",
      section: "S08",
      label: "Indoor Relative Humidity",
      unit: "%"
    }
    // NOTE: mechanical.ventilation.summerBoost (l_119) is registered in MechanicalNodes
  ];

  // ============================================================================
  // COMPUTED NODES - STAGE 1 (Independent)
  // ============================================================================

  const CoolingNodesStage1 = [
    // ========================================================================
    // Wet Bulb Temperature
    // ========================================================================
    {
      id: "cooling.wetBulbTemperature",
      legacyId: "cooling_wetBulbTemperature",
      dependencies: [
        "climate.cooling.nightTemp",
        "climate.cooling.seasonMeanRH"
      ],
      classification: "C",
      section: "S13",
      label: "Wet Bulb Temperature",
      unit: "°C",
      compute: (inputs) => {
        const tdb = parseNum(inputs["climate.cooling.nightTemp"], 20.43);
        const rh = parseNum(inputs["climate.cooling.seasonMeanRH"], 55.85);
        return +wetBulbTemperature(tdb, rh).toFixed(4);
      }
    },

    // ========================================================================
    // Humidity Ratios (for latent load factor calculation)
    // ========================================================================
    {
      id: "cooling.humidityRatio.outdoor",
      legacyId: "cooling_humidityRatioAvg",
      dependencies: ["cooling.wetBulbTemperature"],
      classification: "C",
      section: "S13",
      label: "Outdoor Humidity Ratio",
      unit: "kg/kg",
      compute: (inputs) => {
        const twb = parseNum(inputs["cooling.wetBulbTemperature"], 15);
        const pSat = saturationVaporPressure(twb);
        const partialPressure = pSat * CONSTANTS.outdoorSeasonalRH;
        const atmPressure = 101325;
        const humidityRatio = (0.62198 * partialPressure) / (atmPressure - partialPressure);
        return +humidityRatio.toFixed(6);
      }
    },
    {
      id: "cooling.humidityRatio.indoor",
      legacyId: "cooling_humidityRatioIndoor",
      dependencies: [
        "climate.cooling.setpoint",
        "building.indoorRH"
      ],
      classification: "C",
      section: "S13",
      label: "Indoor Humidity Ratio",
      unit: "kg/kg",
      compute: (inputs) => {
        const setpoint = parseNum(inputs["climate.cooling.setpoint"], 24);
        const indoorRH = parseNum(inputs["building.indoorRH"], 45) / 100;
        const pSatIndoor = saturationVaporPressure(setpoint);
        const partialPressureIndoor = pSatIndoor * indoorRH;
        const atmPressure = 101325;
        const humidityRatio = (0.62198 * partialPressureIndoor) / (atmPressure - partialPressureIndoor);
        return +humidityRatio.toFixed(6);
      }
    },
    {
      id: "cooling.humidityRatio.difference",
      legacyId: "cooling_humidityRatio",
      dependencies: [
        "cooling.humidityRatio.outdoor",
        "cooling.humidityRatio.indoor"
      ],
      classification: "C",
      section: "S13",
      label: "Humidity Ratio Difference",
      unit: "kg/kg",
      compute: (inputs) => {
        const outdoor = parseNum(inputs["cooling.humidityRatio.outdoor"], 0);
        const indoor = parseNum(inputs["cooling.humidityRatio.indoor"], 0);
        return +(outdoor - indoor).toFixed(6);
      }
    },

    // ========================================================================
    // Latent Load Factor (A6)
    // ========================================================================
    {
      id: "cooling.latentLoadFactor",
      legacyId: "cooling_latentLoadFactor",
      dependencies: [
        "climate.cooling.nightTemp",
        "climate.cooling.setpoint",
        "cooling.humidityRatio.difference"
      ],
      classification: "C",
      section: "S13",
      label: "Latent Load Factor",
      compute: (inputs) => {
        // Formula: A6 = 1 + [latentHeatVaporization × humidityRatioDiff] / [Cp × (nightTemp - setpoint)]
        const nightTemp = parseNum(inputs["climate.cooling.nightTemp"], 20.43);
        const setpoint = parseNum(inputs["climate.cooling.setpoint"], 24);
        const humidityRatioDiff = parseNum(inputs["cooling.humidityRatio.difference"], 0);

        const numerator = CONSTANTS.latentHeatVaporization * humidityRatioDiff;
        const denominator = CONSTANTS.specificHeatCapacity * (nightTemp - setpoint);

        if (denominator === 0) {
          return 1.0; // Avoid division by zero
        }

        return +(1 + numerator / denominator).toFixed(4);
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
            parseNum(inputs["waterHeating.systemLosses"])
        };
        return ISO.annual(b, station.months, CS.freeCooling(station, setpoint, indoorRH));
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
    register: registerCoolingNodes,
    constants: CONSTANTS
  };

  console.log("[CoolingNodes] Module loaded");
})();
