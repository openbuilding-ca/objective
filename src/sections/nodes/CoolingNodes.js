/**
 * CoolingNodes.js - Psychrometric and Free Cooling Computation Nodes
 *
 * This module implements the cooling calculations from Cooling.js as graph nodes,
 * enabling full computation graph cutover without legacy dependency.
 *
 * Two-Stage Architecture:
 * - Stage 1 (Independent): Free cooling limit (h_124), latent load factor
 * - Stage 2 (Dependent): Days of active cooling (m_124) - needs m_129
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
    // Climate inputs (from S03) - NOT registered elsewhere
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
    // Free Cooling Raw Potential (cooling_h_124) - Intermediate
    // ========================================================================
    {
      id: "cooling.freeCoolingRaw",
      legacyId: "cooling_h_124",
      dependencies: [
        "ventilation.volumeRate",
        "climate.cooling.nightTemp",
        "climate.cooling.setpoint",
        "climate.coolingDays"
      ],
      classification: "C",
      section: "S13",
      label: "Free Cooling Raw Potential",
      unit: "kWh/yr",
      compute: (inputs) => {
        // Parnas table: free-cooling-limit.json (raw calculation)
        // cooling_h_124 = (h_120/3600) × 1.204 × 1005 × (h_24 - l_20) × 0.024 × m_19

        const flowRateM3hr = parseNum(inputs["ventilation.volumeRate"], 0);
        const nightTemp = parseNum(inputs["climate.cooling.nightTemp"], 20.43);
        const setpoint = parseNum(inputs["climate.cooling.setpoint"], 24);
        const seasonDays = parseNum(inputs["climate.coolingDays"], 120);

        // Temperature differential
        const tempDiff = setpoint - nightTemp;

        // Free cooling only works when indoor is warmer than outdoor
        if (tempDiff <= 0) {
          return 0;
        }

        // Convert m³/hr to m³/s
        const flowRateM3s = flowRateM3hr / 3600;

        // Mass flow rate (kg/s)
        const massFlowRate = flowRateM3s * CONSTANTS.airDensity;

        // Sensible heat removal power (W)
        const sensiblePowerWatts = massFlowRate * CONSTANTS.specificHeatCapacity * tempDiff;

        // Convert to daily energy (kWh/day)
        // Factor: (W) × (86400 s/day) / (3600000 J/kWh) = W × 0.024
        const dailyEnergyKWh = sensiblePowerWatts * 0.024;

        // Annual potential (kWh/yr)
        const annualEnergy = dailyEnergyKWh * seasonDays;

        return +annualEnergy.toFixed(2);
      }
    },

    // ========================================================================
    // Free Cooling Limit (h_124) - KEY OUTPUT (with setback adjustment)
    // ========================================================================
    {
      id: "cooling.freeCoolingLimit",
      legacyId: "h_124",
      dependencies: [
        "cooling.freeCoolingRaw",
        "mechanical.ventilation.method",
        "mechanical.ventilation.unoccupiedSetback"
      ],
      classification: "C",
      section: "S13",
      label: "Free Cooling Limit",
      unit: "kWh/yr",
      compute: (inputs) => {
        // Section13.js calculateFreeCooling() applies setback adjustment
        // - If "constant" ventilation → use full potential
        // - If "schedule" ventilation → multiply by setback factor (k_120 / 100)

        const rawPotential = parseNum(inputs["cooling.freeCoolingRaw"], 0);
        const ventMethod = (inputs["mechanical.ventilation.method"] || "").toLowerCase();
        const setbackPercent = parseNum(inputs["mechanical.ventilation.unoccupiedSetback"], 0);

        // Apply setback only for scheduled ventilation
        if (ventMethod.includes("schedule")) {
          // setbackPercent is 0-100, convert to factor 0-1
          const setbackFactor = Math.min(1, Math.max(0, setbackPercent / 100));
          return +(rawPotential * setbackFactor).toFixed(2);
        }

        // Constant ventilation or unclear method: use full potential
        return +rawPotential.toFixed(2);
      }
    },

    // ========================================================================
    // Daily Free Cooling Potential (used by Stage 2)
    // ========================================================================
    {
      id: "cooling.dailyFreeCoolingPotential",
      legacyId: "cooling_dailyFreeCooling",
      dependencies: [
        "ventilation.volumetricRate",
        "mechanical.ventilation.summerBoost",
        "climate.cooling.nightTemp",
        "climate.cooling.setpoint"
      ],
      classification: "C",
      section: "S13",
      label: "Daily Free Cooling Potential",
      unit: "kWh/day",
      compute: (inputs) => {
        // COOLING-TARGET A28-A33 chain
        const baseRateLs = parseNum(inputs["ventilation.volumetricRate"], 0);
        const summerBoost = inputs["mechanical.ventilation.summerBoost"];
        const nightTemp = parseNum(inputs["climate.cooling.nightTemp"], 20.43);
        const setpoint = parseNum(inputs["climate.cooling.setpoint"], 24);

        // Apply summer boost if specified
        let ventRateLs = baseRateLs;
        if (summerBoost && summerBoost !== "None" && summerBoost !== "") {
          const boostFactor = parseNum(summerBoost, 1.0);
          ventRateLs = baseRateLs * boostFactor;
        }

        // Convert L/s to m³/s
        const ventRateM3s = ventRateLs / 1000;

        // Mass flow rate (kg/s)
        const massFlowRate = ventRateM3s * CONSTANTS.airDensity;

        // Temperature differential
        const tempDiff = setpoint - nightTemp;

        // Heat removal power (W)
        const heatRemovalWatts = massFlowRate * CONSTANTS.specificHeatCapacity * tempDiff;

        // Daily energy (kWh/day)
        // A32: Joules = Watts × 86400
        // A33: kWh = Joules / 3600000
        const dailyJoules = heatRemovalWatts * 86400;
        const dailyKWh = dailyJoules / 3600000;

        return +dailyKWh.toFixed(4);
      }
    }
  ];

  // ============================================================================
  // COMPUTED NODES - STAGE 2 (Dependent on m_129)
  // ============================================================================

  const CoolingNodesStage2 = [
    // ========================================================================
    // Days of Active Cooling (m_124) - KEY OUTPUT
    // ========================================================================
    {
      id: "cooling.daysActiveCooling",
      legacyId: "m_124",
      dependencies: [
        "energy.ced.mitigated",
        "cooling.dailyFreeCoolingPotential",
        "climate.cooling.degreedays",
        "climate.coolingDays",
        "mechanical.cooling.systemType"
      ],
      classification: "C",
      section: "S13",
      label: "Days of Active Cooling",
      unit: "days",
      compute: (inputs) => {
        // Parnas table: days-active-cooling.json
        // m_124 = (E50 - E51) / (m_19 × 24)

        const systemType = inputs["mechanical.cooling.systemType"];

        // No cooling if system is "No Cooling"
        if (systemType === "No Cooling") {
          return 0;
        }

        const m_129 = parseNum(inputs["energy.ced.mitigated"], 0); // Annual mitigated cooling load
        const dailyFreeCooling = parseNum(inputs["cooling.dailyFreeCoolingPotential"], 0);
        const d_21 = parseNum(inputs["climate.cooling.degreedays"], 120); // CDD
        const m_19 = parseNum(inputs["climate.coolingDays"], 120); // Cooling season days

        if (m_19 <= 0 || d_21 <= 0) {
          return 0;
        }

        // E37: Daily mitigated cooling = m_129 / CDD
        const dailyMitigatedCooling = m_129 / d_21;

        // E50: Seasonal cooling load = E37 × d_21
        const E50 = dailyMitigatedCooling * d_21;

        // E51: Seasonal free cooling = daily × d_21
        const E51 = dailyFreeCooling * d_21;

        // E52: Unmet cooling load
        const E52 = E50 - E51;

        // E55: Days active cooling = E52 / (m_19 × 24)
        const daysActiveCooling = E52 / (m_19 * 24);

        // Note: Can be negative (oversized ventilation)
        // Round to integer to match Section13.js line 3282: Math.round(activeCoolingDays)
        return Math.round(daysActiveCooling);
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
