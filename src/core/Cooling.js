/**
 * 4011-Cooling.js
 * Cooling calculations module for TEUI Calculator 4.011
 *
 * This module implements the calculations from COOLING-TARGET.csv and provides
 * integration with Section13 (Mechanical Loads) and other sections that need
 * cooling-related data.
 *
 * ====================================================================
 * IMPLEMENTATION NOTES
 * ====================================================================
 *
 * This module implements several complex psychrometric and thermal calculations:
 *
 * 1. LATENT LOAD FACTOR (A6): Ratio affecting cooling energy needed for humidity control
 *    - Formula: 1 + (Cooling Season Mean RH / Night-Time Temp)
 *    - Used by Section13 for ventilation cooling energy calculations
 *
 * 2. FREE COOLING LIMIT (A33): Maximum cooling energy available from ventilation
 *    - Based on mass air flow, temperature differential, and humidity capacity
 *    - Used to calculate potential passive cooling percentage
 *
 * 3. WET BULB TEMPERATURE (E64-E66): Measures combined temperature/humidity effects
 *    - Uses linear approximation formulas based on dry bulb temp and RH
 *    - Important for cooling capacity calculations
 *
 * Formulas are implemented from COOLING-TARGET.csv with appropriate
 * variable naming and code organization for maintainability.
 *
 * ====================================================================
 * CROSS-MODULE INTEGRATION POINTS
 * ====================================================================
 *
 * SECTION13 INTEGRATION:
 * - Section13.js references values through:
 *   1. Direct getter methods (getLatentLoadFactor(), etc.)
 *   2. StateManager values (cooling_latentLoadFactor, etc.)
 *   3. Event listener for 'cooling-calculations-loaded'
 *
 * STATEMANAGER COORDINATION:
 * - Stores key calculated values with "cooling_" prefix
 * - Sets dependencies using registerDependency() for proper recalculation ordering
 * - Listens for changes to external dependencies (cooling setpoint, building data)
 *
 * INITIALIZATION SEQUENCE:
 * 1. Module is loaded (manually or via import in index.html)
 * 2. DOMContentLoaded or teui-statemanager-ready triggers initialize()
 * 3. Module pulls initial values from StateManager when available
 * 4. Module performs initial calculations
 * 5. Module dispatches 'cooling-calculations-loaded' event
 * 6. Section13 updates its calculated values based on cooling data
 *
 * ====================================================================
 * TESTING GUIDELINES
 * ====================================================================
 *
 * To verify correct operation:
 *
 * 1. Open browser console and check for initialization messages
 * 2. Verify cooling_latentLoadFactor value in StateManager matches Excel
 * 3. Check values in Section13 (row 124) match expected free cooling capacity
 * 4. Change cooling setpoint temperature and verify cooling values update
 * 5. Check Section13 values against Excel for same input conditions
 *
 * Known issues to look for:
 * - Numerical precision differs between JS and Excel calculations
 * - Temperature unit conversion errors common with psychrometric calculations
 * - Days of active cooling may be negative if free cooling > cooling load
 *
 * The module is designed to work independently but integrates with StateManager
 * when available. It provides fallback calculations when external data is not available.
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};

// Cooling Calculations Module
window.TEUI.CoolingCalculations = (function () {
  /**
   * Helper function to get values from StateManager in a mode-aware way
   * ✅ PATTERN A REFACTOR (Nov 3, 2025): Accept explicit mode parameter instead of using shared state
   * @param {string} fieldId - The field ID to get from StateManager
   * @param {any} defaultValue - Default value to return if the field doesn't exist
   * @param {string} mode - "target" or "reference" to determine prefix
   * @returns {string} The value from StateManager with appropriate mode prefix
   */
  function getModeAwareValue(fieldId, defaultValue = null, mode = "target") {
    if (!window.TEUI?.StateManager) return defaultValue;

    // Determine prefix based on explicit mode parameter (not shared state)
    const prefix = mode === "reference" ? "ref_" : "";

    // Get the value with appropriate prefix
    const value = window.TEUI.StateManager.getValue(`${prefix}${fieldId}`);
    return value !== null && value !== undefined ? value : defaultValue;
  }

  /**
   * ============================================================================
   * PATTERN A DUAL-STATE ARCHITECTURE (Nov 3, 2025)
   * ============================================================================
   * Separate state objects for Target and Reference to eliminate state mixing.
   * Previous architecture used single shared `state` object causing last-write-wins
   * contamination between Target and Reference calculations.
   *
   * See: docs/development/S08-RH-STATE-MIXING.md for investigation details
   * See: docs/development/C-RF-WP.md for refactoring workplan
   */

  // Physical constants (truly immutable - never change during calculation)
  const CONSTANTS = {
    groundTemp: 10, // A7 - Ground temperature for radiant cooling
    airMass: 1.204, // E3 - Mass of air kg/m³
    specificHeatCapacity: 1005, // E4 - Specific heat capacity J/(kg•K)
    latentHeatVaporization: 2501000, // E6 - Latent heat of vaporization J/kg
  };

  // Helper to create fresh state object (used for both Target and Reference)
  function createStateObject() {
    return {
      // Input values (read from StateManager)
      coolingSetTemp: null, // A8 - h_24 from S03
      indoorRH: null, // A52 - i_59 from S08
      buildingVolume: null, // A9 - d_105 from S12
      buildingArea: null, // A15 - h_15 from S02
      coolingDegreeDays: null, // A21 - d_21 from S03

      // ✅ NEW (Nov 3, 2025): Dynamic climate values from S03
      nightTimeTemp: 20.43, // A3 - l_20 from S03 (default, read from StateManager)
      coolingSeasonMeanRH: 0.5585, // A4 - l_21 from S03 (default, read from StateManager)

      // Calculated intermediate values
      atmPressure: 101325, // E13/E15 - Adjusted for elevation
      partialPressure: 0,
      pSatAvg: 0,
      pSatIndoor: 0,
      partialPressureIndoor: 0,
      humidityRatioIndoor: 0,
      humidityRatioAvg: 0,
      humidityRatioDifference: 0,
      wetBulbTemperature: 0,

      // Output values
      latentLoadFactor: 0, // A6 - Published to StateManager
      freeCoolingLimit: 0, // A33/H124 - Published to StateManager
      daysActiveCooling: 0, // E55/M124 - Published to StateManager

      // Recursion protection flags
      calculatingStage1: false,
      calculatingStage2: false,
    };
  }

  // ✅ PATTERN A: Separate state for Target and Reference models
  const TargetState = createStateObject();
  const ReferenceState = createStateObject();

  // Module-level state (not calculation state)
  const moduleState = {
    initialized: false,
  };

  /**
   * Get the appropriate state object for the given mode
   * @param {string} mode - "target" or "reference"
   * @returns {Object} The state object for that mode
   */
  function getStateForMode(mode) {
    return mode === "reference" ? ReferenceState : TargetState;
  }

  /**
   * Calculate latent load factor based on humidity ratios and temperature differential
   * This implements the formula from cell A6 in COOLING-TARGET.csv
   * ✅ PATTERN A REFACTOR: Accept explicit state parameter for isolation
   *
   * Excel Formula: A6 = 1 + A64/A55
   * Where:
   *   A64 = A54 × E3 × E6 × A63 (Latent Cooling Load)
   *   A55 = H26 × E3 × E4 × (A49 - H27) (Sensible Cooling Load)
   *
   * Since A54 = H26 = h_120/3600, these cancel out, simplifying to:
   *   A6 = 1 + [E6 × A63] / [E4 × (A49 - H27)]
   *   A6 = 1 + [latentHeatVaporization × humidityRatioDifference] / [specificHeatCapacity × (nightTimeTemp - coolingSetTemp)]
   *
   * @param {Object} stateObj - The state object (TargetState or ReferenceState)
   * @returns {number} The calculated latent load factor
   */
  function calculateLatentLoadFactor(stateObj) {
    // Excel A6 formula: 1 + A64/A55
    // A64 = 2,501,000 J/kg × humidityRatioDifference (kg/kg)
    // A55 = 1005 J/(kg•K) × temperatureDifferential (K)

    const numerator =
      CONSTANTS.latentHeatVaporization * stateObj.humidityRatioDifference; // E6 × A63
    const denominator =
      CONSTANTS.specificHeatCapacity *
      (stateObj.nightTimeTemp - stateObj.coolingSetTemp); // E4 × (A49 - H27)

    // Avoid division by zero
    if (denominator === 0) {
      console.warn(
        "[Cooling] Temperature differential is zero, using fallback latent load factor"
      );
      return 1.0;
    }

    return 1 + numerator / denominator;
  }

  /**
   * Calculate atmospheric values derived from temperature and humidity
   * This implements formulas around cells E11-E24 in COOLING-TARGET.csv
   * ✅ PATTERN A REFACTOR: Accept explicit state parameter and mode for isolation
   *
   * @param {Object} stateObj - The state object (TargetState or ReferenceState)
   * @param {string} mode - "target" or "reference" for mode-aware reads
   */
  function calculateAtmosphericValues(stateObj, mode = "target") {
    // Calculate saturation vapor pressure (Tetens formula) at WET BULB temperature
    // Excel A56: 610.94 * EXP(17.625 * A50 / (A50 + 243.04))
    // Where A50 = E64 (wet bulb temp, calculated in calculateWetBulbTemperature)
    // NOTE: Must call calculateWetBulbTemperature() BEFORE this function
    const pSatAvg =
      610.94 *
      Math.exp(
        (17.625 * stateObj.wetBulbTemperature) /
          (stateObj.wetBulbTemperature + 243.04)
      );

    // Calculate partial pressure of water vapor
    // Excel A58 = A56 * A57
    // Where A57 = 0.7 (Outdoor Seasonal Relative Humidity %)
    // NOTE: A57 (0.7) is DIFFERENT from A4 (0.5585 coolingSeasonMeanRH)!
    const outdoorSeasonalRH = 0.7; // A57 from COOLING-TARGET.csv line 57
    const partialPressure = pSatAvg * outdoorSeasonalRH;

    // Calculate indoor saturation vapor pressure
    const pSatIndoor =
      610.94 *
      Math.exp(
        (17.625 * stateObj.coolingSetTemp) / (stateObj.coolingSetTemp + 243.04)
      );

    // Calculate indoor partial pressure using dynamic indoor RH% from S08
    // ✅ PATTERN A: Read i_59 with explicit mode parameter (no shared state)
    const i_59_value = window.TEUI.parseNumeric(
      getModeAwareValue("i_59", "45", mode)
    );
    console.log(
      `[Cooling] 🔍 i_59 READ: mode=${mode}, i_59_value=${i_59_value}, will use indoorRH=${i_59_value ? i_59_value / 100 : 0.45}`
    );
    stateObj.indoorRH = i_59_value ? i_59_value / 100 : 0.45; // Convert percentage to decimal, default 45%
    const partialPressureIndoor = pSatIndoor * stateObj.indoorRH; // A52: Indoor RH% from S08 i_59

    // Update state with calculated values
    stateObj.pSatAvg = pSatAvg;
    stateObj.partialPressure = partialPressure;
    stateObj.pSatIndoor = pSatIndoor;
    stateObj.partialPressureIndoor = partialPressureIndoor;
  }

  /**
   * Calculate humidity ratios used for latent load calculations
   * This implements formulas from cells E61-E63 in COOLING-TARGET.csv
   * ✅ PATTERN A REFACTOR: Accept explicit state parameter for isolation
   *
   * @param {Object} stateObj - The state object (TargetState or ReferenceState)
   */
  function calculateHumidityRatios(stateObj) {
    // Atmospheric pressure for calculation (sea level standard)
    const atmosphericPressure = 101325; // Pa

    // Calculate humidity ratio indoor
    // Excel A61: 0.62198 * partialPressureIndoor / (atmosphericPressure - partialPressureIndoor)
    const humidityRatioIndoor =
      (0.62198 * stateObj.partialPressureIndoor) /
      (atmosphericPressure - stateObj.partialPressureIndoor);

    // Calculate humidity ratio at average conditions
    // Excel A62: 0.62198 * partialPressure / (atmosphericPressure - partialPressure)
    const humidityRatioAvg =
      (0.62198 * stateObj.partialPressure) /
      (atmosphericPressure - stateObj.partialPressure);

    // Calculate humidity ratio difference
    // Excel A63: A62 - A61
    const humidityRatioDifference = humidityRatioAvg - humidityRatioIndoor;

    // Update state
    stateObj.humidityRatioIndoor = humidityRatioIndoor;
    stateObj.humidityRatioAvg = humidityRatioAvg;
    stateObj.humidityRatioDifference = humidityRatioDifference;
  }

  /**
   * Calculate free cooling capacity
   * This implements the formulas leading to cell A33 in COOLING-TARGET.csv
   * ✅ PATTERN A REFACTOR: Accept explicit state parameter and mode for isolation
   *
   * @param {Object} stateObj - The state object (TargetState or ReferenceState)
   * @param {string} mode - "target" or "reference" for mode-aware reads
   * @returns {number} The calculated free cooling limit (kWh/yr)
   */
  function calculateFreeCoolingLimit(stateObj, mode = "target") {
    // ✅ EXCEL PARITY: Use exact S13 formula instead of simplified approximation
    // Based on S13's calculateFreeCoolingLimit function (Excel A33 * M19)

    // Get necessary values with explicit mode parameter
    const ventFlowRateM3hr =
      window.TEUI.parseNumeric(getModeAwareValue("h_120", "0", mode)) || 0;
    const ventFlowRateM3s = ventFlowRateM3hr / 3600;
    const massFlowRateKgS = ventFlowRateM3s * CONSTANTS.airMass; // kg/s

    const Cp = CONSTANTS.specificHeatCapacity; // J/kg·K
    const T_indoor = stateObj.coolingSetTemp; // °C
    const T_outdoor_night = stateObj.nightTimeTemp; // °C (from S03 l_20)
    const coolingDays =
      window.TEUI.parseNumeric(getModeAwareValue("m_19", "120", mode)) || 120;

    // Excel A16: Temp Diff = A8 - A3 (Indoor - Outdoor)
    const tempDiff = T_indoor - T_outdoor_night; // Match Excel A16 formula

    // Excel A31: Q̇ = ṁ * cₚ * ΔT (Heat Removal Power in Watts)
    const sensiblePowerWatts = massFlowRateKgS * Cp * tempDiff;

    // Free cooling only works when indoor is warmer than outdoor (tempDiff > 0)
    let sensibleCoolingPowerWatts = 0;
    if (tempDiff > 0) {
      // Indoor warmer than outdoor = cooling potential exists
      sensibleCoolingPowerWatts = sensiblePowerWatts; // Use positive value directly
    }

    // Convert Sensible Power to Daily Sensible Energy (kWh/day) - Based on Excel A33
    const dailySensibleCoolingKWh = sensibleCoolingPowerWatts * 0.024; // Correct Factor: (J/s) * (86400 s/day) / (3.6e6 J/kWh) = 0.024

    // Calculate Annual Potential Limit (kWh/yr) - Based on Excel A33 * M19
    const potentialLimit = dailySensibleCoolingKWh * coolingDays;

    // Store the Excel-based calculation result
    stateObj.freeCoolingLimit = potentialLimit;

    console.log(
      `[Cooling] Free cooling calc (${mode}): massFlow=${massFlowRateKgS.toFixed(3)} kg/s, ΔT=${tempDiff.toFixed(1)}°C → ${dailySensibleCoolingKWh.toFixed(2)} kWh/day → ${potentialLimit.toFixed(2)} kWh/yr`
    );

    return potentialLimit;
  }

  /**
   * Update atmospheric pressure based on elevation from S03
   * Implements COOLING-TARGET E15 logic: E13 * EXP(-E14/8434)
   * ✅ PATTERN A REFACTOR: Accept explicit state parameter and mode for isolation
   *
   * @param {Object} stateObj - The state object (TargetState or ReferenceState)
   * @param {string} mode - "target" or "reference" for mode-aware reads
   */
  function updateAtmosphericPressure(stateObj, mode = "target") {
    const elevation =
      window.TEUI.parseNumeric(getModeAwareValue("l_22", "80", mode)) || 80; // Project elevation from S03
    const seaLevelPressure = 101325; // E13 - Standard atmospheric pressure at sea level
    stateObj.atmPressure = seaLevelPressure * Math.exp(-elevation / 8434); // E15 logic

    console.log(
      `[Cooling] Atmospheric pressure updated (${mode}): elevation=${elevation}m → atmPressure=${stateObj.atmPressure.toFixed(0)}Pa`
    );
  }

  /**
   * Calculate days of active cooling required
   * This implements the formula in cell E55 of COOLING-TARGET.csv
   * ✅ PATTERN A REFACTOR: Accept explicit state parameter and mode
   *
   * @param {Object} stateObj - The state object (TargetState or ReferenceState)
   * @param {string} mode - "target" or "reference" for mode-aware reads
   * @returns {number} Days of active cooling required
   */
  function calculateDaysActiveCooling(stateObj, mode = "target") {
    // ✅ EXCEL PARITY: Implement COOLING-TARGET.csv internal logic for E55 calculation
    // COOLING-TARGET E55: =E52/(E54*24) where E52=(E50-E51)
    // E50 = E37*E45 = (REPORT!M129 * REPORT!D21)
    // E51 = E36*E45 = (daily_free_cooling_kWh * REPORT!D21)
    // E54 = REPORT!M19 = cooling season days

    // Get base values from StateManager with explicit mode parameter
    const m_129_annual =
      window.TEUI.parseNumeric(getModeAwareValue("m_129", "0", mode)) || 0; // Annual mitigated cooling load
    const d_21 =
      window.TEUI.parseNumeric(getModeAwareValue("d_21", "120", mode)) || 120; // E45: CDD
    const m_19 =
      window.TEUI.parseNumeric(getModeAwareValue("m_19", "120", mode)) || 120; // E54: Cooling season days

    // ✅ CRITICAL FIX: E37 should be daily mitigated cooling load, not annual
    // E37 = m_129 / CDD = daily cooling load that gets multiplied back by CDD in E50
    const E37_daily_mitigated_cooling = d_21 > 0 ? m_129_annual / d_21 : 0;

    // Calculate COOLING-TARGET internal values
    // E36 = A33 = Daily free cooling potential (kWh/day) - calculated from ventilation physics
    const E36_daily_free_cooling_kWh = calculateDailyFreeCoolingPotential(
      stateObj,
      mode
    ); // A33 equivalent

    // COOLING-TARGET E50: Seasonal cooling load = E37 * E45
    const E50_seasonal_cooling_load = E37_daily_mitigated_cooling * d_21;

    // COOLING-TARGET E51: Seasonal free cooling potential = E36 * E45
    const E51_seasonal_free_cooling = E36_daily_free_cooling_kWh * d_21;

    // COOLING-TARGET E52: Unmet cooling load = E50 - E51
    const E52_unmet_cooling_load =
      E50_seasonal_cooling_load - E51_seasonal_free_cooling;

    // COOLING-TARGET E55: Days active cooling = E52 / (E54 * 24)
    let E55_days_active_cooling = 0;
    if (m_19 > 0) {
      E55_days_active_cooling = E52_unmet_cooling_load / (m_19 * 24);
    }

    // ✅ EXCEL COMMENT: "Obviously negative days of free cooling is not possible -
    // the goal here is to get close to zero - anything less than zero is overkill ventilation-wise"
    // So we preserve the raw calculation (can be negative) as per Excel methodology

    console.log(
      `[Cooling m_124 COOLING-TARGET (${mode})] m_129_annual=${m_129_annual}, E37_daily=${E37_daily_mitigated_cooling}, E45(d_21)=${d_21}, E50=${E50_seasonal_cooling_load}, E51=${E51_seasonal_free_cooling}, E52=${E52_unmet_cooling_load}, E54(m_19)=${m_19}, E55(result)=${E55_days_active_cooling}`
    );

    stateObj.daysActiveCooling = E55_days_active_cooling;
    return E55_days_active_cooling; // Return exact COOLING-TARGET Excel calculation result
  }

  /**
   * Calculate daily free cooling potential (COOLING-TARGET A33/E36)
   * Implements the physics chain: A28→A29→A30→A31→A32→A33
   * ✅ PATTERN A REFACTOR: Accept explicit state parameter and mode
   *
   * @param {Object} stateObj - The state object (TargetState or ReferenceState)
   * @param {string} mode - "target" or "reference" for mode-aware reads
   * @returns {number} Daily free cooling potential (kWh/day)
   */
  function calculateDailyFreeCoolingPotential(stateObj, mode = "target") {
    // COOLING-TARGET A28: Ventilation Rate l/s (with summer boost)
    // =IF(REPORT!L119="None", REPORT!D120, REPORT!D120*REPORT!L119)
    const d_120 =
      window.TEUI.parseNumeric(getModeAwareValue("d_120", "0", mode)) || 0; // Base ventilation rate l/s
    const l_119 = getModeAwareValue("l_119", "None", mode) || "None"; // Summer boost factor

    let A28_ventilation_rate_ls = d_120;
    if (l_119 !== "None" && l_119 !== "") {
      const boostFactor = window.TEUI.parseNumeric(l_119) || 1.0;
      A28_ventilation_rate_ls = d_120 * boostFactor;
    }

    // COOLING-TARGET A29: m3/second = A28/1000
    const A29_ventilation_rate_m3s = A28_ventilation_rate_ls / 1000;

    // COOLING-TARGET A30: Mass-Flow Rate = A29 * E3 (air density)
    const A30_mass_flow_rate_kgs = A29_ventilation_rate_m3s * CONSTANTS.airMass; // E3 = 1.204 kg/m3

    // COOLING-TARGET A16: Temp difference = A8 - A3 (indoor - outdoor night temp)
    const h_24 =
      window.TEUI.parseNumeric(getModeAwareValue("h_24", "24", mode)) || 24; // A8: Indoor setpoint
    const A16_temp_diff = h_24 - stateObj.nightTimeTemp; // A8 - A3 (from S03 l_20)

    // COOLING-TARGET A31: Heat removal power = A30 * E4 * A16 (J/s or Watts)
    const A31_heat_removal_watts =
      A30_mass_flow_rate_kgs * CONSTANTS.specificHeatCapacity * A16_temp_diff;

    // COOLING-TARGET A32: Heat removed in one day (Joules) = A31 * 86400
    const A32_daily_heat_removal_joules = A31_heat_removal_watts * 86400;

    // COOLING-TARGET A33: Heat removed in one day (kWh) = A32 / 3600000
    const A33_daily_free_cooling_kWh = A32_daily_heat_removal_joules / 3600000;

    console.log(
      `[Cooling A33 PHYSICS (${mode})] d_120=${d_120}, l_119=${l_119}, A28=${A28_ventilation_rate_ls}, A29=${A29_ventilation_rate_m3s}, A30=${A30_mass_flow_rate_kgs}, A16=${A16_temp_diff}, A31=${A31_heat_removal_watts}, A32=${A32_daily_heat_removal_joules}, A33=${A33_daily_free_cooling_kWh}`
    );

    return A33_daily_free_cooling_kWh; // E36 equivalent
  }

  /**
   * Calculate cooling system integration with S13 heating systems
   * Implements Excel formulas for d_117, l_114, and cross-section outputs
   */

  /**
   * Calculate CED Unmitigated (d_129) - Excel: K71+K79+K97+K104+K103+D122
   */

  /**
   * Calculate wet bulb temperature from dry bulb and RH
   * This implements formulas in cells E64-E66 of COOLING-TARGET.csv
   */
  /**
   * Calculate wet bulb temperature from dry bulb temperature and relative humidity
   * ✅ PATTERN A REFACTOR: Accept explicit state parameter for isolation
   *
   * @param {Object} stateObj - The state object (TargetState or ReferenceState)
   * @returns {number} The calculated wet bulb temperature
   */
  function calculateWetBulbTemperature(stateObj) {
    // Linear equation to obtain Twb from Tdb and RH% at 15h00 LST
    // Formula: = Tdb - (Tdb - (Tdb - (100 - RH)/5)) * (0.1 + 0.9 * (RH / 100))
    const tdb = stateObj.nightTimeTemp; // Using night-time temp as dry bulb (from S03 l_20)
    const rh = stateObj.coolingSeasonMeanRH * 100; // Convert to percentage (from S03 l_21)

    const twbSimple =
      tdb - (tdb - (tdb - (100 - rh) / 5)) * (0.1 + 0.9 * (rh / 100));

    // ✅ CORRECTED (ANDYs13 branch): USE twbSimple INSTEAD for Excel parity (no averaging)
    stateObj.wetBulbTemperature = twbSimple;

    return stateObj.wetBulbTemperature;
  }

  /**
   * ============================================================================
   * STAGE 1: Ventilation & Free Cooling (INDEPENDENT)
   * ============================================================================
   * Calculates free cooling capacity and latent load factor based ONLY on:
   * - Climate data (temperatures, humidity, degree days)
   * - Building geometry (volume, area)
   * - Ventilation settings (rates, methods, boost factors)
   *
   * CRITICAL: This stage has ZERO dependency on m_129 or d_116
   * This eliminates the bootstrap problem by breaking the circular dependency
   *
   * Outputs: h_124 (free cooling capacity), latentLoadFactor
   * @param {string} mode - "target" or "reference" to determine which state values to use
   */
  /**
   * ✅ PATTERN A REFACTOR: Use isolated state objects for Target and Reference
   * @param {string} mode - "target" or "reference"
   */
  function calculateStage1(mode = "target") {
    // ✅ PATTERN A: Get the appropriate state object for this mode
    const stateObj = getStateForMode(mode);

    // Recursion protection (per-state)
    if (stateObj.calculatingStage1) {
      console.log(
        `[Cooling Stage 1] ⚠️ Already calculating (mode=${mode}) - skipping to prevent recursion`
      );
      return;
    }

    stateObj.calculatingStage1 = true;
    console.log(
      `[Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=${mode})...`
    );

    try {
      // ✅ PATTERN A: Read fresh values with explicit mode parameter (no shared state)
      const h_24 = getModeAwareValue("h_24", "24", mode);
      stateObj.coolingSetTemp = h_24 ? parseFloat(h_24) : 24;

      const d_21 = getModeAwareValue("d_21", "196", mode);
      stateObj.coolingDegreeDays = d_21 ? parseFloat(d_21) : 196;

      const d_105 = getModeAwareValue("d_105", "8000", mode);
      stateObj.buildingVolume = d_105
        ? parseFloat(d_105.toString().replace(/,/g, ""))
        : 8000;

      const h_15 = getModeAwareValue("h_15", "1427.2", mode);
      stateObj.buildingArea = h_15
        ? parseFloat(h_15.toString().replace(/,/g, ""))
        : 1427.2;

      const i_59 = getModeAwareValue("i_59", "45", mode);
      stateObj.indoorRH = i_59 ? parseFloat(i_59) / 100 : 0.45;

      // ✅ NEW (Nov 3, 2025): Read dynamic climate values from S03
      const l_20 = getModeAwareValue("l_20", "20.43", mode);
      stateObj.nightTimeTemp = l_20 ? parseFloat(l_20) : 20.43;

      const l_21 = getModeAwareValue("l_21", "55.85", mode);
      stateObj.coolingSeasonMeanRH = l_21 ? parseFloat(l_21) / 100 : 0.5585; // Convert from % to decimal

      // CRITICAL CALCULATION ORDER (matching Excel COOLING-TARGET.csv):
      // 1. Calculate wet bulb temp (E64) - needed for pSatAvg calculation
      // 2. Calculate atmospheric values using wet bulb temp (A56 uses A50 = E64)
      // 3. Calculate humidity ratios (A61, A62, A63)
      // 4. Calculate latent load factor (A6 uses A63)

      // ✅ PATTERN A: Pass explicit state object to all calculation functions
      // Step 1: Calculate wet bulb temperature FIRST (needed for A50)
      calculateWetBulbTemperature(stateObj);

      // Step 2: Calculate atmospheric values (A56 pSatAvg uses wet bulb temp A50)
      calculateAtmosphericValues(stateObj, mode);

      // Step 3: Calculate humidity ratios (calculates humidityRatioDifference = A63)
      calculateHumidityRatios(stateObj);

      // Step 4: Calculate latent load factor (now has humidityRatioDifference available)
      stateObj.latentLoadFactor = calculateLatentLoadFactor(stateObj);

      // Step 5: Calculate free cooling limit (h_124)
      calculateFreeCoolingLimit(stateObj, mode);

      // 📊 STATEMANAGER: Publish Stage 1 results with explicit mode
      updateStateManagerStage1(mode, stateObj);

      // Dispatch event to notify S13 that Stage 1 cooling calculations are ready
      dispatchCoolingEvent("stage1", mode);

      console.log(
        `[Cooling Stage 1] ✅ Complete (${mode}): h_124=${stateObj.freeCoolingLimit.toFixed(2)} kWh/yr, latentLoadFactor=${stateObj.latentLoadFactor.toFixed(3)}`
      );
    } finally {
      stateObj.calculatingStage1 = false;
    }
  }

  /**
   * ============================================================================
   * STAGE 2: Active Cooling System (DEPENDENT & CONDITIONAL)
   * ============================================================================
   * Calculates days of active cooling required (m_124) based on:
   * - m_129 (mitigated cooling load from S13)
   * - h_124 (free cooling capacity from Stage 1)
   *
   * CRITICAL CONDITIONS:
   * 1. Only runs if d_116 ≠ "No Cooling"
   * 2. Only runs AFTER S13 has calculated m_129
   *
   * This breaks the circular dependency by running AFTER m_129 is known
   *
   * Outputs: m_124 (days active cooling required)
   * @param {string} mode - "target" or "reference" to determine which state values to use
   */
  /**
   * ✅ PATTERN A REFACTOR: Use isolated state objects for Target and Reference
   * @param {string} mode - "target" or "reference"
   */
  function calculateStage2(mode = "target") {
    // ✅ PATTERN A: Get the appropriate state object for this mode
    const stateObj = getStateForMode(mode);

    // Recursion protection (per-state)
    if (stateObj.calculatingStage2) {
      console.log(
        `[Cooling Stage 2] ⚠️ Already calculating (mode=${mode}) - skipping to prevent recursion`
      );
      return;
    }

    // CRITICAL: Check if active cooling system exists
    const d_116 = getModeAwareValue("d_116", "No Cooling", mode);
    if (d_116 === "No Cooling") {
      console.log(
        `[Cooling Stage 2] ⏭️ Skipping - No active cooling system (d_116="${d_116}")`
      );
      // Set m_124 to 0 since no active cooling
      stateObj.daysActiveCooling = 0;
      const prefix = mode === "reference" ? "ref_" : "";
      window.TEUI?.StateManager?.setValue(
        `${prefix}cooling_m_124`,
        "0",
        "calculated"
      );
      return;
    }

    stateObj.calculatingStage2 = true;
    console.log(
      `[Cooling Stage 2] 🚀 Starting active cooling calculations (mode=${mode})...`
    );

    try {
      // ✅ PATTERN A: Pass explicit state object and mode
      calculateDaysActiveCooling(stateObj, mode);

      // 📊 STATEMANAGER: Publish Stage 2 results with explicit parameters
      updateStateManagerStage2(mode, stateObj);

      // Dispatch event to notify S13 that Stage 2 cooling calculations are ready
      dispatchCoolingEvent("stage2", mode);

      console.log(
        `[Cooling Stage 2] ✅ Complete (${mode}): m_124=${stateObj.daysActiveCooling.toFixed(2)} days`
      );
    } finally {
      stateObj.calculatingStage2 = false;
    }
  }

  /**
   * Main calculation orchestrator - NOW calls Stage 1 only
   * Stage 2 is triggered by StateManager listener when m_129 changes
   * This eliminates the bootstrap problem by breaking the circular dependency
   * @param {string} mode - "target" or "reference" to determine which state values to use
   */
  function calculateAll(mode = "target") {
    console.log(`[Cooling] 🚀 calculateAll("${mode}") → Running Stage 1 only`);
    console.trace(`[Cooling] 🔍 TRACE: Who called calculateAll("${mode}")?`);

    // Run Stage 1 (independent calculations)
    calculateStage1(mode);

    // Stage 2 will be triggered by StateManager listener when m_129 changes
    // This eliminates the bootstrap problem
  }

  /**
   * 📊 STATEMANAGER INTEGRATION - STAGE 1: Publish ventilation & free cooling results
   * Stage 1 publishes ONLY values that can be calculated WITHOUT m_129 dependency
   * This includes: h_124, latentLoadFactor, and all psychrometric intermediate values
   */
  /**
   * Publish Stage 1 results to StateManager
   * ✅ PATTERN A REFACTOR: Accept explicit mode and state parameters
   *
   * @param {string} mode - "target" or "reference"
   * @param {Object} stateObj - The state object (TargetState or ReferenceState)
   */
  function updateStateManagerStage1(mode, stateObj) {
    if (typeof window.TEUI.StateManager === "undefined") return;

    const sm = window.TEUI.StateManager;

    // ✅ PATTERN A: Use explicit mode parameter (no shared state)
    const prefix = mode === "reference" ? "ref_" : "";
    console.log(
      `[Cooling Stage 1] 📊 Publishing results with prefix="${prefix}" (mode=${mode})`
    );

    // STAGE 1 OUTPUTS: Free cooling capacity and latent load factor
    sm.setValue(
      `${prefix}cooling_h_124`,
      stateObj.freeCoolingLimit.toString(),
      "calculated"
    ); // Free Cooling Capacity (h_124)

    sm.setValue(
      `${prefix}cooling_latentLoadFactor`,
      (stateObj.latentLoadFactor || 0).toString(),
      "calculated"
    ); // Latent Load Factor

    // Intermediate psychrometric calculations for S13 integration
    sm.setValue(
      `${prefix}cooling_wetBulbTemperature`,
      (stateObj.wetBulbTemperature || 0).toString(),
      "calculated"
    ); // Wet Bulb Temp

    sm.setValue(
      `${prefix}cooling_atmosphericPressure`,
      stateObj.atmPressure.toString(),
      "calculated"
    ); // Atmospheric pressure

    sm.setValue(
      `${prefix}cooling_partialPressure`,
      stateObj.partialPressure.toString(),
      "calculated"
    ); // Partial pressure

    sm.setValue(
      `${prefix}cooling_humidityRatio`,
      stateObj.humidityRatioDifference.toString(),
      "calculated"
    ); // Humidity ratio difference
  }

  /**
   * 📊 STATEMANAGER INTEGRATION - STAGE 2: Publish active cooling results
   * Stage 2 publishes values that DEPEND on m_129 from S13
   * This includes: m_124 (days active cooling) and d_124 (free cooling percentage)
   * ✅ PATTERN A REFACTOR: Accept explicit mode and state parameters
   *
   * @param {string} mode - "target" or "reference"
   * @param {Object} stateObj - The state object (TargetState or ReferenceState)
   */
  function updateStateManagerStage2(mode, stateObj) {
    if (typeof window.TEUI.StateManager === "undefined") return;

    const sm = window.TEUI.StateManager;

    // ✅ PATTERN A: Use explicit mode parameter (no shared state)
    const prefix = mode === "reference" ? "ref_" : "";
    console.log(
      `[Cooling Stage 2] 📊 Publishing results with prefix="${prefix}" (mode=${mode})`
    );

    // STAGE 2 OUTPUTS: Active cooling days and free cooling percentage
    sm.setValue(
      `${prefix}cooling_m_124`,
      stateObj.daysActiveCooling.toString(),
      "calculated"
    ); // Days Active Cooling (m_124)

    // Calculate d_124 (free cooling percentage) if we have cooling load
    const m_129 =
      window.TEUI.parseNumeric(getModeAwareValue("m_129", "0", mode)) || 0;
    const freeCoolingPercent =
      m_129 > 0 ? (stateObj.freeCoolingLimit / m_129) * 100 : 0;

    sm.setValue(
      `${prefix}cooling_d_124`,
      freeCoolingPercent.toString(),
      "calculated"
    ); // Free Cooling %
  }

  // ✅ PATTERN A: Legacy publication functions removed
  // publishCoolingResults() and updateStateManager() have been replaced by:
  // - updateStateManagerStage1(mode, stateObj) for Stage 1 results
  // - updateStateManagerStage2(mode, stateObj) for Stage 2 results
  // These new functions accept explicit mode and state parameters for proper isolation

  /**
   * Dispatch a custom event to notify other modules that cooling calculations are ready
   * @param {string} stage - Optional stage identifier ("stage1", "stage2", or undefined for legacy)
   */
  /**
   * Dispatch cooling calculation events
   * ✅ PATTERN A REFACTOR: Accept explicit mode parameter (optional, for debugging)
   *
   * @param {string} stage - "stage1", "stage2", or null for "all"
   * @param {string} mode - Optional mode for logging ("target" or "reference")
   */
  function dispatchCoolingEvent(stage, mode = null) {
    const eventName = stage
      ? `cooling-calculations-${stage}`
      : "cooling-calculations-loaded";

    // Note: Event detail kept minimal as listeners should read from StateManager directly
    const event = new CustomEvent(eventName, {
      detail: {
        stage: stage || "all",
        mode: mode, // Include mode for debugging
      },
    });

    document.dispatchEvent(event);
    console.log(
      `[Cooling] 📢 Dispatched event: ${eventName}${mode ? ` (mode=${mode})` : ""}`
    );
  }

  /**
   * Register this module's dependencies with StateManager
   */
  function registerWithStateManager() {
    if (typeof window.TEUI.StateManager === "undefined") return;

    const sm = window.TEUI.StateManager;

    // Register dependencies on climate data
    sm.registerDependency("d_21", "cooling_freeCoolingLimit"); // CDD affects free cooling
    sm.registerDependency("h_24", "cooling_latentLoadFactor"); // Cooling setpoint affects latent load

    // Register dependencies on building data
    sm.registerDependency("d_105", "cooling_freeCoolingLimit"); // Building volume affects cooling
    sm.registerDependency("h_15", "cooling_freeCoolingLimit"); // Building area affects cooling intensity
    sm.registerDependency("i_59", "cooling_latentLoadFactor"); // Indoor RH% from S08 affects latent load
    sm.registerDependency("m_19", "cooling_daysActiveCooling"); // Cooling season days affects active cooling calculation

    // ============================================================================
    // CRITICAL: m_129 listener triggers Stage 2 (solves bootstrap problem)
    // ============================================================================
    // This is the KEY to eliminating the bootstrap problem:
    // - Stage 1 runs independently, calculates h_124
    // - S13 uses h_124 to calculate m_129
    // - This listener triggers Stage 2 when m_129 is ready
    // - Stage 2 calculates m_124 using m_129
    console.log(
      `[Cooling] 🔗 Registering m_129 listener to trigger Stage 2 (Target mode)`
    );
    sm.addListener("m_129", function (newValue) {
      console.log(
        `[Cooling] 🎯 m_129 changed: ${newValue} → triggering Stage 2 for TARGET mode`
      );

      // ✅ PATTERN A: No need to cache in shared state - Stage 2 reads directly from StateManager
      // Trigger Stage 2 for Target mode only (m_129 is Target-specific)
      calculateStage2("target");
    });

    // Listen for ref_m_129 (Reference mode mitigated cooling load)
    console.log(
      `[Cooling] 🔗 Registering ref_m_129 listener to trigger Stage 2 (Reference mode)`
    );
    sm.addListener("ref_m_129", function (newValue) {
      console.log(
        `[Cooling] 🎯 ref_m_129 changed: ${newValue} → triggering Stage 2 for REFERENCE mode`
      );

      // Trigger Stage 2 for Reference mode
      calculateStage2("reference");
    });

    // ============================================================================
    // Listen for d_116 (cooling system type) changes
    // ============================================================================
    // If user changes from "No Cooling" to an active system, trigger Stage 2
    // If user changes to "No Cooling", skip Stage 2
    console.log(
      `[Cooling] 🔗 Registering d_116 listener for cooling system changes`
    );
    sm.addListener("d_116", function (newValue) {
      console.log(
        `[Cooling] 🌡️ Cooling system changed: d_116="${newValue}" → triggering Stage 2 for both modes`
      );

      // ✅ DUAL-ENGINE: Trigger Stage 2 for BOTH modes
      // (it will check d_116 internally and skip if "No Cooling")
      calculateStage2("target");
      calculateStage2("reference");
    });

    // ✅ PATTERN A: d_129 listener removed - now obsolete
    // m_129 (mitigated cooling load) is used instead, with separate listeners
    // for m_129 (Target) and ref_m_129 (Reference) triggering Stage 2

    // Listen for indoor RH% changes from S08 i_59 slider (Target mode)
    console.log(
      `[Cooling] 🔗 Registering i_59 listener for indoor humidity changes`
    );
    sm.addListener("i_59", function (newValue) {
      console.log(
        `[Cooling] 🌡️ Indoor RH% changed: i_59=${newValue}% → recalculating both engines`
      );

      // ✅ FIX: Don't pre-set shared state.indoorRH - let each engine read its own value
      // Each engine will read mode-aware value (i_59 for Target, ref_i_59 for Reference)
      calculateStage1("target");
      calculateStage1("reference");
    });

    // Listen for indoor RH% changes from S08 ref_i_59 slider (Reference mode)
    console.log(
      `[Cooling] 🔗 Registering ref_i_59 listener for indoor humidity changes`
    );
    sm.addListener("ref_i_59", function (newValue) {
      console.log(
        `[Cooling] 🌡️ Indoor RH% changed: ref_i_59=${newValue}% → recalculating both engines`
      );

      // ✅ FIX: Don't pre-set shared state.indoorRH - let each engine read its own value
      // Each engine will read mode-aware value (i_59 for Target, ref_i_59 for Reference)
      calculateStage1("target");
      calculateStage1("reference");
    });

    // D117/L114 now calculated by S13, not Cooling.js - listeners removed

    // ✅ PATTERN A: h_124 listener removed - now obsolete
    // Free cooling limit is calculated internally by calculateStage1() for each mode
    // No need to listen for h_124 changes from S13

    // ✅ FIX: Listen for l_119 (summer boost) changes to trigger complete m_124 recalculation
    // This ensures m_124 updates when ventilation parameters change
    sm.addListener("l_119", function (newValue) {
      console.log(
        `[Cooling] Summer boost changed: l_119=${newValue} → recalculating free cooling for both modes`
      );

      // ✅ DUAL-ENGINE: Summer boost affects Stage 1 (free cooling capacity) for BOTH modes
      calculateStage1("target");
      calculateStage1("reference");
    });

    // ✅ NEW: Listen for h_24 (Target cooling setpoint) changes from S03
    // Cooling setpoint affects temperature differential for free cooling calculations
    console.log(
      `[Cooling] 🔗 Registering h_24 listener for cooling setpoint changes`
    );
    sm.addListener("h_24", function (newValue) {
      console.log(
        `[Cooling] 🌡️ Target cooling setpoint changed: h_24=${newValue}°C → recalculating Stage 1 (Target mode)`
      );

      // Cooling setpoint affects Stage 1 free cooling calculations
      calculateStage1("target");
    });

    // ✅ NEW: Listen for ref_h_24 (Reference cooling setpoint) changes from S03
    sm.addListener("ref_h_24", function (newValue) {
      console.log(
        `[Cooling] 🌡️ Reference cooling setpoint changed: ref_h_24=${newValue}°C → recalculating Stage 1 (Reference mode)`
      );

      // Cooling setpoint affects Stage 1 free cooling calculations
      calculateStage1("reference");
    });

    // ✅ FIX: Listen for d_120 (base ventilation rate) changes
    // This ensures m_124 updates when base ventilation rate changes
    sm.addListener("d_120", function (newValue) {
      console.log(
        `[Cooling] Base ventilation rate changed: d_120=${newValue} → recalculating free cooling for both modes`
      );

      // ✅ DUAL-ENGINE: Base ventilation affects Stage 1 (free cooling capacity) for BOTH modes
      calculateStage1("target");
      calculateStage1("reference");
    });

    // ✅ FIX: Listen for l_22 (elevation) changes from S03 location selection
    // This ensures atmospheric pressure updates when location changes
    sm.addListener("l_22", function (newValue) {
      console.log(
        `[Cooling] Elevation changed: l_22=${newValue}m → updating atmospheric pressure for both modes`
      );
      updateAtmosphericPressure(); // Recalculate atmospheric pressure

      // ✅ DUAL-ENGINE: Atmospheric pressure affects humidity calculations in Stage 1 for BOTH modes
      calculateStage1("target");
      calculateStage1("reference");
    });

    // ✅ NEW (Nov 3, 2025): Listen for l_20 (Target night-time temp) changes from S03
    // Night-time temperature affects free cooling capacity calculations
    console.log(
      `[Cooling] 🔗 Registering l_20 listener for night-time temperature changes`
    );
    sm.addListener("l_20", function (newValue) {
      console.log(
        `[Cooling] 🌡️ Target night-time temp changed: l_20=${newValue}°C → recalculating Stage 1 for both engines`
      );

      // ✅ DUAL-ENGINE: Recalculate BOTH modes because:
      // - We don't know which sections are in Target vs Reference mode
      // - Both columns (Target h_10 and Reference e_10) need to stay updated
      // - Pattern A isolation ensures each engine reads its own values
      calculateStage1("target");
      calculateStage1("reference");
    });

    // ✅ NEW (Nov 3, 2025): Listen for ref_l_20 (Reference night-time temp) changes from S03
    sm.addListener("ref_l_20", function (newValue) {
      console.log(
        `[Cooling] 🌡️ Reference night-time temp changed: ref_l_20=${newValue}°C → recalculating Stage 1 for both engines`
      );

      // ✅ DUAL-ENGINE: Recalculate BOTH modes (same reason as l_20 listener above)
      calculateStage1("target");
      calculateStage1("reference");
    });

    // ✅ NEW (Nov 3, 2025): Listen for l_21 (Target cooling season mean RH%) changes from S03
    // Cooling season RH% affects latent load factor and humidity ratio calculations
    console.log(
      `[Cooling] 🔗 Registering l_21 listener for cooling season RH% changes`
    );
    sm.addListener("l_21", function (newValue) {
      console.log(
        `[Cooling] 🌡️ Target cooling season RH% changed: l_21=${newValue}% → recalculating Stage 1 for both engines`
      );

      // ✅ DUAL-ENGINE: Recalculate BOTH modes (same reason as l_20 listener above)
      calculateStage1("target");
      calculateStage1("reference");
    });

    // ✅ NEW (Nov 3, 2025): Listen for ref_l_21 (Reference cooling season mean RH%) changes from S03
    sm.addListener("ref_l_21", function (newValue) {
      console.log(
        `[Cooling] 🌡️ Reference cooling season RH% changed: ref_l_21=${newValue}% → recalculating Stage 1 for both engines`
      );

      // ✅ DUAL-ENGINE: Recalculate BOTH modes (same reason as l_20 listener above)
      calculateStage1("target");
      calculateStage1("reference");
    });
  }

  /**
   * Initialize the module
   * ✅ PATTERN A REFACTOR: Removed old state object, now uses moduleState for initialization flag only
   */
  function initialize(params = {}) {
    // Already initialized - avoid duplicate initialization
    if (moduleState.initialized) return;

    // Try to get values from StateManager if available
    if (typeof window.TEUI.StateManager !== "undefined") {
      // ✅ PATTERN A: Initialization now reads values directly into Target/Reference states
      // during calculateAll() for each mode. No need to pre-populate a shared state object.

      // Calculate atmospheric pressure from elevation for both modes
      updateAtmosphericPressure(TargetState, "target");
      updateAtmosphericPressure(ReferenceState, "reference");

      // ✅ TWO-STAGE ARCHITECTURE: Initialize cooling_m_124 to 0 for both modes
      // This prevents S13 errors before Stage 2 runs
      // Stage 2 will update these values when m_129 becomes available
      window.TEUI.StateManager.setValue("cooling_m_124", "0", "calculated");
      window.TEUI.StateManager.setValue("ref_cooling_m_124", "0", "calculated");
      console.log(
        "[Cooling] 🔧 Initialized cooling_m_124=0 for both modes (will be updated by Stage 2)"
      );

      // Register with StateManager
      registerWithStateManager();
    }

    // Run initial calculations for both Target and Reference modes
    console.log("[Cooling] 🚀 Running initial calculations for both modes...");
    calculateAll("target");
    calculateAll("reference");

    // Mark as initialized
    moduleState.initialized = true;
  }

  // Public API
  // ✅ PATTERN A REFACTOR: Updated to work with dual-state architecture
  return {
    // Initialization
    initialize: initialize,

    // Calculation methods
    calculateAll: calculateAll, // Runs Stage 1, Stage 2 triggered by m_129 listener
    calculateStage1: calculateStage1, // Ventilation & free cooling (independent)
    calculateStage2: calculateStage2, // Active cooling (dependent on m_129)

    // ✅ PATTERN A: Getters now accept mode parameter to specify Target or Reference
    getLatentLoadFactor: function (mode = "target") {
      const stateObj = getStateForMode(mode);
      return stateObj.latentLoadFactor;
    },

    getFreeCoolingLimit: function (mode = "target") {
      const stateObj = getStateForMode(mode);
      return stateObj.freeCoolingLimit;
    },

    getDaysActiveCooling: function (mode = "target") {
      const stateObj = getStateForMode(mode);
      return stateObj.daysActiveCooling;
    },

    getWetBulbTemperature: function (mode = "target") {
      const stateObj = getStateForMode(mode);
      return stateObj.wetBulbTemperature;
    },

    // Method to recalculate cooling for a specific mode
    recalculate: function (mode = "target") {
      calculateAll(mode);
    },

    // Debug method to get state values for a specific mode
    getDebugInfo: function (mode = "target") {
      const stateObj = getStateForMode(mode);
      return {
        mode: mode,
        state: { ...stateObj },
        moduleState: { ...moduleState },
      };
    },

    // Get both Target and Reference states (useful for debugging state isolation)
    getAllStates: function () {
      return {
        target: { ...TargetState },
        reference: { ...ReferenceState },
        moduleState: { ...moduleState },
      };
    },
  };
})();

// Initialize when StateManager becomes available
document.addEventListener("teui-statemanager-ready", function () {
  // Initialize with StateManager values
  window.TEUI.CoolingCalculations.initialize();
});

/**
 * ============================================================================
 * FIELD DEFINITIONS: Natural Language Labels for Dependency Graphs
 * ============================================================================
 *
 * Provides metadata for Cooling.js calculated values to enable:
 * - Natural language labels for dependency graphs and documentation
 * - IDE autocomplete support
 * - Consistent formatting rules
 * - Integration with FieldManager and ZenMaster tools
 */
window.TEUI.CoolingFields = {
  // Stage 1: Psychrometric Calculations (Independent)
  cooling_wetBulbTemperature: {
    label: "Wet Bulb Temperature",
    description: "Psychrometric wet bulb temperature from dry bulb temp and RH",
    type: "calculated",
    format: "number-2dp",
    unit: "°C",
    excelRef: "COOLING-TARGET A50/E64",
    dependencies: ["l_20", "l_21"],
    stage: 1,
  },
  ref_cooling_wetBulbTemperature: {
    label: "Wet Bulb Temperature (Reference)",
    description: "Reference model psychrometric wet bulb temperature",
    type: "calculated",
    format: "number-2dp",
    unit: "°C",
    dependencies: ["ref_l_20", "ref_l_21"],
    stage: 1,
  },

  cooling_latentLoadFactor: {
    label: "Latent Load Factor (A6)",
    description: "Psychrometric factor for latent cooling load calculation",
    type: "calculated",
    format: "number-3dp",
    unit: "",
    excelRef: "COOLING-TARGET A6",
    dependencies: ["l_20", "l_21", "h_24"],
    consumedBy: ["i_122"],
    stage: 1,
  },
  ref_cooling_latentLoadFactor: {
    label: "Latent Load Factor (Reference)",
    description: "Reference model latent load factor",
    type: "calculated",
    format: "number-3dp",
    unit: "",
    dependencies: ["ref_l_20", "ref_l_21", "ref_h_24"],
    consumedBy: ["ref_i_122"],
    stage: 1,
  },

  cooling_h_124: {
    label: "Free Cooling Limit (h_124)",
    description: "Maximum free cooling capacity from natural ventilation",
    type: "calculated",
    format: "number-2dp-comma",
    unit: "kWh/yr",
    excelRef: "COOLING-TARGET A33 * M19",
    dependencies: ["l_20", "h_24", "m_19", "g_118", "k_120"],
    consumedBy: ["h_124", "d_124"],
    stage: 1,
  },
  ref_cooling_h_124: {
    label: "Free Cooling Limit (Reference)",
    description: "Reference model maximum free cooling capacity",
    type: "calculated",
    format: "number-2dp-comma",
    unit: "kWh/yr",
    dependencies: [
      "ref_l_20",
      "ref_h_24",
      "ref_m_19",
      "ref_g_118",
      "ref_k_120",
    ],
    consumedBy: ["ref_h_124", "ref_d_124"],
    stage: 1,
  },

  // Stage 2: Active Cooling System (Conditional - requires m_129)
  cooling_m_124: {
    label: "Days Active Cooling (m_124)",
    description: "Days per year requiring active mechanical cooling",
    type: "calculated",
    format: "number-2dp",
    unit: "days/yr",
    excelRef: "COOLING-TARGET E55",
    dependencies: ["m_129", "cooling_h_124", "m_19"],
    consumedBy: ["m_124"],
    stage: 2,
  },
  ref_cooling_m_124: {
    label: "Days Active Cooling (Reference)",
    description: "Reference model days requiring active cooling",
    type: "calculated",
    format: "number-2dp",
    unit: "days/yr",
    dependencies: ["ref_m_129", "ref_cooling_h_124", "ref_m_19"],
    consumedBy: ["ref_m_124"],
    stage: 2,
  },

  cooling_d_124: {
    label: "Free Cooling Percentage (d_124)",
    description: "Percentage of cooling load met by free ventilation",
    type: "calculated",
    format: "percent-0dp",
    unit: "%",
    excelRef: "COOLING-TARGET H124/M129",
    dependencies: ["cooling_h_124", "m_129"],
    consumedBy: ["d_124"],
    stage: 2,
  },
  ref_cooling_d_124: {
    label: "Free Cooling Percentage (Reference)",
    description: "Reference model free cooling percentage",
    type: "calculated",
    format: "percent-0dp",
    unit: "%",
    dependencies: ["ref_cooling_h_124", "ref_m_129"],
    consumedBy: ["ref_d_124"],
    stage: 2,
  },
};

// Register with FieldManager if available
if (window.TEUI?.FieldManager?.registerFields) {
  window.TEUI.FieldManager.registerFields(window.TEUI.CoolingFields);
  console.log(
    "[CoolingFields] ✅ Registered 10 cooling calculation fields with FieldManager"
  );
}
