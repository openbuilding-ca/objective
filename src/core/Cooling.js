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
   * @param {string} fieldId - The field ID to get from StateManager
   * @param {any} defaultValue - Default value to return if the field doesn't exist
   * @returns {string} The value from StateManager with appropriate mode prefix
   */
  function getModeAwareValue(fieldId, defaultValue = null) {
    if (!window.TEUI?.StateManager) return defaultValue;

    // Determine prefix based on current mode
    const prefix = state.currentMode === "reference" ? "ref_" : "";

    // Get the value with appropriate prefix
    const value = window.TEUI.StateManager.getValue(`${prefix}${fieldId}`);
    return value !== null && value !== undefined ? value : defaultValue;
  }

  // Private state to store calculation values and intermediate results
  const state = {
    // Default values from COOLING-TARGET.csv - these can be overridden
    // TODO: Future build - these will come from S03 climate data as user inputs
    nightTimeTemp: 20.43, // A3 - Night-Time Temp Outside in ºC (USER DEFINED - future S03 integration)
    coolingSeasonMeanRH: 0.5585, // A4 - Cooling Season Mean RH (USER DEFINED - future S03 integration)
    latentLoadFactor: 0, // A6 - Will be calculated (1 + RH/Temp ratio)
    groundTemp: 10, // A7 - Temperature of ground in ºC (can simulate radiant cooling)
    airMass: 1.204, // E3 - Mass of air kg/m3
    specificHeatCapacity: 1005, // E4 - Specific heat capacity of air J/(kg•K)
    latentHeatVaporization: 2501000, // E6 - Latent heat of vaporization J/kg
    coolingSetTemp: null, // A8 - Indoor design temperature from S03 h_24 (REQUIRED from StateManager)
    indoorRH: null, // A52 - Indoor RH% from S08 i_59 (REQUIRED from StateManager for latent load)
    currentMode: "target", // Current calculation mode (target or reference)

    // Calculated values (COOLING-TARGET.csv only)
    freeCoolingLimit: 0, // A33 - Free cooling capacity (daily kWh)
    daysActiveCooling: 0, // E55 - Days active cooling required

    // Atmospheric calculation properties (from COOLING-TARGET.csv)
    atmPressure: 101325, // E13/E15 - Standard atmospheric pressure, adjusted for elevation
    partialPressure: 0, // Calculated - Partial pressure of water vapor
    pSatAvg: 0, // Calculated - Average saturation pressure
    pSatIndoor: 0, // Calculated - Indoor saturation pressure
    partialPressureIndoor: 0, // Calculated - Indoor partial pressure

    // Humidity calculation properties (from COOLING-TARGET.csv)
    humidityRatioIndoor: 0, // Calculated - Indoor humidity ratio
    humidityRatioAvg: 0, // Calculated - Average humidity ratio
    humidityRatioDifference: 0, // Calculated - Humidity ratio difference

    // Temperature calculations
    wetBulbTemperature: 0, // Calculated - Wet bulb temperature

    // Building-specific values - MUST be read from StateManager (no defaults per CHEATSHEET)
    buildingVolume: null, // A9/D105 - Volume from S12 d_105 (REQUIRED from StateManager)
    buildingArea: null, // A15/H15 - Conditioned area from S02 h_15 (REQUIRED from StateManager)

    // Weather data - MUST be read from StateManager (no defaults per CHEATSHEET)
    coolingDegreeDays: null, // A21/D21 - CDD from S03 d_21 (REQUIRED from StateManager)

    // Misc state
    initialized: false,
    calculating: false, // Recursion protection (legacy)
    calculatingStage1: false, // Stage 1 recursion protection
    calculatingStage2: false, // Stage 2 recursion protection
  };

  /**
   * Calculate latent load factor based on humidity ratios and temperature differential
   * This implements the formula from cell A6 in COOLING-TARGET.csv
   *
   * Excel Formula: A6 = 1 + A64/A55
   * Where:
   *   A64 = A54 × E3 × E6 × A63 (Latent Cooling Load)
   *   A55 = H26 × E3 × E4 × (A49 - H27) (Sensible Cooling Load)
   *
   * Since A54 = H26 = h_120/3600, these cancel out, simplifying to:
   *   A6 = 1 + [E6 × A63] / [E4 × (A49 - H27)]
   *   A6 = 1 + [latentHeatVaporization × humidityRatioDifference] / [specificHeatCapacity × (nightTimeTemp - coolingSetTemp)]
   */
  function calculateLatentLoadFactor() {
    // Excel A6 formula: 1 + A64/A55
    // A64 = 2,501,000 J/kg × humidityRatioDifference (kg/kg)
    // A55 = 1005 J/(kg•K) × temperatureDifferential (K)

    const numerator =
      state.latentHeatVaporization * state.humidityRatioDifference; // E6 × A63
    const denominator =
      state.specificHeatCapacity * (state.nightTimeTemp - state.coolingSetTemp); // E4 × (A49 - H27)

    // Avoid division by zero
    if (denominator === 0) {
      console.warn(
        "[Cooling] Temperature differential is zero, using fallback latent load factor",
      );
      return 1.0;
    }

    return 1 + numerator / denominator;
  }

  /**
   * Calculate atmospheric values derived from temperature and humidity
   * This implements formulas around cells E11-E24 in COOLING-TARGET.csv
   */
  function calculateAtmosphericValues() {
    // Calculate saturation vapor pressure (Tetens formula) at WET BULB temperature
    // Excel A56: 610.94 * EXP(17.625 * A50 / (A50 + 243.04))
    // Where A50 = E64 (wet bulb temp, calculated in calculateWetBulbTemperature)
    // NOTE: Must call calculateWetBulbTemperature() BEFORE this function
    const pSatAvg =
      610.94 *
      Math.exp(
        (17.625 * state.wetBulbTemperature) /
          (state.wetBulbTemperature + 243.04),
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
        (17.625 * state.coolingSetTemp) / (state.coolingSetTemp + 243.04),
      );

    // Calculate indoor partial pressure using dynamic indoor RH% from S08
    // Always read fresh i_59 value to ensure latest indoor RH% is used - now MODE-AWARE!
    const i_59_value = window.TEUI.parseNumeric(
      getModeAwareValue("i_59", "45"),
    );
    console.log(
      `[Cooling] 🔍 i_59 READ: mode=${state.currentMode}, i_59_value=${i_59_value}, will use indoorRH=${i_59_value ? i_59_value / 100 : 0.45}`,
    );
    state.indoorRH = i_59_value ? i_59_value / 100 : 0.45; // Convert percentage to decimal, default 45%
    const partialPressureIndoor = pSatIndoor * state.indoorRH; // A52: Indoor RH% from S08 i_59

    // Update state with calculated values
    state.pSatAvg = pSatAvg;
    state.partialPressure = partialPressure;
    state.pSatIndoor = pSatIndoor;
    state.partialPressureIndoor = partialPressureIndoor;
  }

  /**
   * Calculate humidity ratios used for latent load calculations
   * This implements formulas from cells E61-E63 in COOLING-TARGET.csv
   */
  function calculateHumidityRatios() {
    // Atmospheric pressure for calculation (sea level standard)
    const atmosphericPressure = 101325; // Pa

    // Calculate humidity ratio indoor
    // Excel A61: 0.62198 * partialPressureIndoor / (atmosphericPressure - partialPressureIndoor)
    const humidityRatioIndoor =
      (0.62198 * state.partialPressureIndoor) /
      (atmosphericPressure - state.partialPressureIndoor);

    // Calculate humidity ratio at average conditions
    // Excel A62: 0.62198 * partialPressure / (atmosphericPressure - partialPressure)
    const humidityRatioAvg =
      (0.62198 * state.partialPressure) /
      (atmosphericPressure - state.partialPressure);

    // Calculate humidity ratio difference
    // Excel A63: A62 - A61
    const humidityRatioDifference = humidityRatioAvg - humidityRatioIndoor;

    // Update state
    state.humidityRatioIndoor = humidityRatioIndoor;
    state.humidityRatioAvg = humidityRatioAvg;
    state.humidityRatioDifference = humidityRatioDifference;
  }

  /**
   * Calculate free cooling capacity
   * This implements the formulas leading to cell A33 in COOLING-TARGET.csv
   */
  function calculateFreeCoolingLimit() {
    // ✅ EXCEL PARITY: Use exact S13 formula instead of simplified approximation
    // Based on S13's calculateFreeCoolingLimit function (Excel A33 * M19)

    // Get necessary values - now MODE-AWARE!
    const ventFlowRateM3hr =
      window.TEUI.parseNumeric(getModeAwareValue("h_120", "0")) || 0;
    const ventFlowRateM3s = ventFlowRateM3hr / 3600;
    const massFlowRateKgS = ventFlowRateM3s * state.airMass; // kg/s

    const Cp = state.specificHeatCapacity; // J/kg·K
    const T_indoor = state.coolingSetTemp; // °C
    const T_outdoor_night = state.nightTimeTemp; // °C
    const coolingDays =
      window.TEUI.parseNumeric(getModeAwareValue("m_19", "120")) || 120;

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
    state.freeCoolingLimit = potentialLimit;

    console.log(
      `[Cooling] Free cooling calc: massFlow=${massFlowRateKgS.toFixed(3)} kg/s, ΔT=${tempDiff.toFixed(1)}°C → ${dailySensibleCoolingKWh.toFixed(2)} kWh/day → ${potentialLimit.toFixed(2)} kWh/yr`,
    );

    return potentialLimit;
  }

  /**
   * Update atmospheric pressure based on elevation from S03
   * Implements COOLING-TARGET E15 logic: E13 * EXP(-E14/8434)
   */
  function updateAtmosphericPressure() {
    const elevation =
      window.TEUI.parseNumeric(getModeAwareValue("l_22", "80")) || 80; // Project elevation from S03 - now MODE-AWARE!
    const seaLevelPressure = 101325; // E13 - Standard atmospheric pressure at sea level
    state.atmPressure = seaLevelPressure * Math.exp(-elevation / 8434); // E15 logic

    console.log(
      `[Cooling] Atmospheric pressure updated: elevation=${elevation}m → atmPressure=${state.atmPressure.toFixed(0)}Pa`,
    );
  }

  /**
   * Calculate days of active cooling required
   * This implements the formula in cell E55 of COOLING-TARGET.csv
   */
  function calculateDaysActiveCooling() {
    // ✅ EXCEL PARITY: Implement COOLING-TARGET.csv internal logic for E55 calculation
    // COOLING-TARGET E55: =E52/(E54*24) where E52=(E50-E51)
    // E50 = E37*E45 = (REPORT!M129 * REPORT!D21)
    // E51 = E36*E45 = (daily_free_cooling_kWh * REPORT!D21)
    // E54 = REPORT!M19 = cooling season days

    // Get base values from StateManager - now MODE-AWARE!
    const m_129_annual =
      window.TEUI.parseNumeric(getModeAwareValue("m_129", "0")) || 0; // Annual mitigated cooling load
    const d_21 =
      window.TEUI.parseNumeric(getModeAwareValue("d_21", "120")) || 120; // E45: CDD
    const m_19 =
      window.TEUI.parseNumeric(getModeAwareValue("m_19", "120")) || 120; // E54: Cooling season days

    // ✅ CRITICAL FIX: E37 should be daily mitigated cooling load, not annual
    // E37 = m_129 / CDD = daily cooling load that gets multiplied back by CDD in E50
    const E37_daily_mitigated_cooling = d_21 > 0 ? m_129_annual / d_21 : 0;

    // Calculate COOLING-TARGET internal values
    // E36 = A33 = Daily free cooling potential (kWh/day) - calculated from ventilation physics
    const E36_daily_free_cooling_kWh = calculateDailyFreeCoolingPotential(); // A33 equivalent

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
      `[Cooling m_124 COOLING-TARGET] m_129_annual=${m_129_annual}, E37_daily=${E37_daily_mitigated_cooling}, E45(d_21)=${d_21}, E50=${E50_seasonal_cooling_load}, E51=${E51_seasonal_free_cooling}, E52=${E52_unmet_cooling_load}, E54(m_19)=${m_19}, E55(result)=${E55_days_active_cooling}`,
    );

    state.daysActiveCooling = E55_days_active_cooling;
    return E55_days_active_cooling; // Return exact COOLING-TARGET Excel calculation result
  }

  /**
   * Calculate daily free cooling potential (COOLING-TARGET A33/E36)
   * Implements the physics chain: A28→A29→A30→A31→A32→A33
   */
  function calculateDailyFreeCoolingPotential() {
    // COOLING-TARGET A28: Ventilation Rate l/s (with summer boost)
    // =IF(REPORT!L119="None", REPORT!D120, REPORT!D120*REPORT!L119)
    const d_120 =
      window.TEUI.parseNumeric(window.TEUI.StateManager.getValue("d_120")) || 0; // Base ventilation rate l/s
    const l_119 = window.TEUI.StateManager.getValue("l_119") || "None"; // Summer boost factor

    let A28_ventilation_rate_ls = d_120;
    if (l_119 !== "None" && l_119 !== "") {
      const boostFactor = window.TEUI.parseNumeric(l_119) || 1.0;
      A28_ventilation_rate_ls = d_120 * boostFactor;
    }

    // COOLING-TARGET A29: m3/second = A28/1000
    const A29_ventilation_rate_m3s = A28_ventilation_rate_ls / 1000;

    // COOLING-TARGET A30: Mass-Flow Rate = A29 * E3 (air density)
    const A30_mass_flow_rate_kgs = A29_ventilation_rate_m3s * state.airMass; // E3 = 1.204 kg/m3

    // COOLING-TARGET A16: Temp difference = A8 - A3 (indoor - outdoor night temp)
    const h_24 =
      window.TEUI.parseNumeric(window.TEUI.StateManager.getValue("h_24")) || 24; // A8: Indoor setpoint
    const A16_temp_diff = h_24 - state.nightTimeTemp; // A8 - A3

    // COOLING-TARGET A31: Heat removal power = A30 * E4 * A16 (J/s or Watts)
    const A31_heat_removal_watts =
      A30_mass_flow_rate_kgs * state.specificHeatCapacity * A16_temp_diff;

    // COOLING-TARGET A32: Heat removed in one day (Joules) = A31 * 86400
    const A32_daily_heat_removal_joules = A31_heat_removal_watts * 86400;

    // COOLING-TARGET A33: Heat removed in one day (kWh) = A32 / 3600000
    const A33_daily_free_cooling_kWh = A32_daily_heat_removal_joules / 3600000;

    console.log(
      `[Cooling A33 PHYSICS] d_120=${d_120}, l_119=${l_119}, A28=${A28_ventilation_rate_ls}, A29=${A29_ventilation_rate_m3s}, A30=${A30_mass_flow_rate_kgs}, A16=${A16_temp_diff}, A31=${A31_heat_removal_watts}, A32=${A32_daily_heat_removal_joules}, A33=${A33_daily_free_cooling_kWh}`,
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
  function calculateWetBulbTemperature() {
    // Linear equation to obtain Twb from Tdb and RH% at 15h00 LST
    // Formula: = Tdb - (Tdb - (Tdb - (100 - RH)/5)) * (0.1 + 0.9 * (RH / 100))
    const tdb = state.nightTimeTemp; // Using night-time temp as dry bulb
    const rh = state.coolingSeasonMeanRH * 100; // Convert to percentage

    const twbSimple =
      tdb - (tdb - (tdb - (100 - rh) / 5)) * (0.1 + 0.9 * (rh / 100));

    // Second formula with dewpoint correction factor
    const twbCorrected =
      tdb - (tdb - (tdb - (100 - rh) / 5)) * (0.3 + 0.7 * (rh / 100));

    // Average of both
    state.wetBulbTemperature = (twbSimple + twbCorrected) / 2;

    return state.wetBulbTemperature;
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
  function calculateStage1(mode = "target") {
    // Recursion protection
    if (state.calculatingStage1) {
      console.log(
        `[Cooling Stage 1] ⚠️ Already calculating (mode=${mode}) - skipping to prevent recursion`,
      );
      return;
    }

    state.calculatingStage1 = true;
    console.log(
      `[Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=${mode})...`,
    );

    // Store current mode for mode-aware reads/writes
    state.currentMode = mode;

    try {
      // Read fresh values from StateManager before calculating - MODE-AWARE!
      const h_24 = getModeAwareValue("h_24", "24");
      state.coolingSetTemp = h_24 ? parseFloat(h_24) : 24;

      const d_21 = getModeAwareValue("d_21", "196");
      state.coolingDegreeDays = d_21 ? parseFloat(d_21) : 196;

      const d_105 = getModeAwareValue("d_105", "8000");
      state.buildingVolume = d_105
        ? parseFloat(d_105.toString().replace(/,/g, ""))
        : 8000;

      const h_15 = getModeAwareValue("h_15", "1427.2");
      state.buildingArea = h_15
        ? parseFloat(h_15.toString().replace(/,/g, ""))
        : 1427.2;

      const i_59 = getModeAwareValue("i_59", "45");
      state.indoorRH = i_59 ? parseFloat(i_59) / 100 : 0.45;

      // CRITICAL CALCULATION ORDER (matching Excel COOLING-TARGET.csv):
      // 1. Calculate wet bulb temp (E64) - needed for pSatAvg calculation
      // 2. Calculate atmospheric values using wet bulb temp (A56 uses A50 = E64)
      // 3. Calculate humidity ratios (A61, A62, A63)
      // 4. Calculate latent load factor (A6 uses A63)

      // Step 1: Calculate wet bulb temperature FIRST (needed for A50)
      calculateWetBulbTemperature();

      // Step 2: Calculate atmospheric values (A56 pSatAvg uses wet bulb temp A50)
      calculateAtmosphericValues();

      // Step 3: Calculate humidity ratios (calculates humidityRatioDifference = A63)
      calculateHumidityRatios();

      // Step 4: Calculate latent load factor (now has humidityRatioDifference available)
      state.latentLoadFactor = calculateLatentLoadFactor();

      // Step 5: Calculate free cooling limit (h_124)
      calculateFreeCoolingLimit();

      // 📊 STATEMANAGER: Publish Stage 1 results
      updateStateManagerStage1();

      // Dispatch event to notify S13 that Stage 1 cooling calculations are ready
      dispatchCoolingEvent("stage1");

      console.log(
        `[Cooling Stage 1] ✅ Complete: h_124=${state.freeCoolingLimit.toFixed(2)} kWh/yr, latentLoadFactor=${state.latentLoadFactor.toFixed(3)}`,
      );
    } finally {
      state.calculatingStage1 = false;
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
  function calculateStage2(mode = "target") {
    // Recursion protection
    if (state.calculatingStage2) {
      console.log(
        `[Cooling Stage 2] ⚠️ Already calculating (mode=${mode}) - skipping to prevent recursion`,
      );
      return;
    }

    // CRITICAL: Check if active cooling system exists
    const d_116 = getModeAwareValue("d_116", "No Cooling");
    if (d_116 === "No Cooling") {
      console.log(
        `[Cooling Stage 2] ⏭️ Skipping - No active cooling system (d_116="${d_116}")`,
      );
      // Set m_124 to 0 since no active cooling
      state.daysActiveCooling = 0;
      const prefix = mode === "reference" ? "ref_" : "";
      window.TEUI?.StateManager?.setValue(
        `${prefix}cooling_m_124`,
        "0",
        "calculated",
      );
      return;
    }

    state.calculatingStage2 = true;
    console.log(
      `[Cooling Stage 2] 🚀 Starting active cooling calculations (mode=${mode})...`,
    );

    // Store current mode for mode-aware reads/writes
    state.currentMode = mode;

    try {
      // Calculate days of active cooling required (reads m_129 from StateManager)
      calculateDaysActiveCooling();

      // 📊 STATEMANAGER: Publish Stage 2 results
      updateStateManagerStage2();

      // Dispatch event to notify S13 that Stage 2 cooling calculations are ready
      dispatchCoolingEvent("stage2");

      console.log(
        `[Cooling Stage 2] ✅ Complete: m_124=${state.daysActiveCooling.toFixed(2)} days`,
      );
    } finally {
      state.calculatingStage2 = false;
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
  function updateStateManagerStage1() {
    if (typeof window.TEUI.StateManager === "undefined") return;

    const sm = window.TEUI.StateManager;

    // ✅ MODE-AWARE: Add prefix for Reference mode
    const prefix = state.currentMode === "reference" ? "ref_" : "";
    console.log(
      `[Cooling Stage 1] 📊 Publishing results with prefix="${prefix}" (mode=${state.currentMode})`,
    );

    // STAGE 1 OUTPUTS: Free cooling capacity and latent load factor
    sm.setValue(
      `${prefix}cooling_h_124`,
      state.freeCoolingLimit.toString(),
      "calculated",
    ); // Free Cooling Capacity (h_124)

    sm.setValue(
      `${prefix}cooling_latentLoadFactor`,
      (state.latentLoadFactor || 0).toString(),
      "calculated",
    ); // Latent Load Factor

    // Intermediate psychrometric calculations for S13 integration
    sm.setValue(
      `${prefix}cooling_wetBulbTemperature`,
      (state.wetBulbTemperature || 0).toString(),
      "calculated",
    ); // Wet Bulb Temp

    sm.setValue(
      `${prefix}cooling_atmosphericPressure`,
      state.atmPressure.toString(),
      "calculated",
    ); // Atmospheric pressure

    sm.setValue(
      `${prefix}cooling_partialPressure`,
      state.partialPressure.toString(),
      "calculated",
    ); // Partial pressure

    sm.setValue(
      `${prefix}cooling_humidityRatio`,
      state.humidityRatioDifference.toString(),
      "calculated",
    ); // Humidity ratio difference
  }

  /**
   * 📊 STATEMANAGER INTEGRATION - STAGE 2: Publish active cooling results
   * Stage 2 publishes values that DEPEND on m_129 from S13
   * This includes: m_124 (days active cooling) and d_124 (free cooling percentage)
   */
  function updateStateManagerStage2() {
    if (typeof window.TEUI.StateManager === "undefined") return;

    const sm = window.TEUI.StateManager;

    // ✅ MODE-AWARE: Add prefix for Reference mode
    const prefix = state.currentMode === "reference" ? "ref_" : "";
    console.log(
      `[Cooling Stage 2] 📊 Publishing results with prefix="${prefix}" (mode=${state.currentMode})`,
    );

    // STAGE 2 OUTPUTS: Active cooling days and free cooling percentage
    sm.setValue(
      `${prefix}cooling_m_124`,
      state.daysActiveCooling.toString(),
      "calculated",
    ); // Days Active Cooling (m_124)

    sm.setValue(
      `${prefix}cooling_d_124`,
      ((state.freeCoolingLimit / state.coolingLoad) * 100).toString(),
      "calculated",
    ); // Free Cooling %
  }

  /**
   * 📊 STATEMANAGER INTEGRATION: Publish calculated cooling values (LEGACY - kept for compatibility)
   * S13 reads these values from StateManager for display and further calculations
   * Now MODE-AWARE to support both Target and Reference models
   * NOTE: This is being phased out in favor of Stage 1 and Stage 2 functions
   */
  function updateStateManager() {
    if (typeof window.TEUI.StateManager === "undefined") return;

    const sm = window.TEUI.StateManager;

    // ✅ MODE-AWARE: Add prefix for Reference mode
    const prefix = state.currentMode === "reference" ? "ref_" : "";
    console.log(
      `[Cooling] 📊 Publishing results with prefix="${prefix}" (mode=${state.currentMode})`,
    );

    // Publish ALL cooling calculations to StateManager (complete S13 rows 113-124 coverage)
    sm.setValue(
      `${prefix}cooling_m_124`,
      state.daysActiveCooling.toString(),
      "calculated",
    ); // Days Active Cooling
    sm.setValue(
      `${prefix}cooling_h_124`,
      state.freeCoolingLimit.toString(),
      "calculated",
    ); // Free Cooling Capacity
    sm.setValue(
      `${prefix}cooling_d_124`,
      ((state.freeCoolingLimit / state.coolingLoad) * 100).toString(),
      "calculated",
    ); // Free Cooling %

    // D117, L114, D122, D123 are calculated by S13, not Cooling.js

    // Intermediate cooling calculations for S13 integration
    sm.setValue(
      `${prefix}cooling_latentLoadFactor`,
      (state.latentLoadFactor || 0).toString(),
      "calculated",
    ); // Latent Load Factor
    sm.setValue(
      `${prefix}cooling_wetBulbTemperature`,
      (state.wetBulbTemperature || 0).toString(),
      "calculated",
    ); // Wet Bulb Temp

    // Atmospheric and humidity calculations for S13 integration
    sm.setValue(
      `${prefix}cooling_atmosphericPressure`,
      state.atmPressure.toString(),
      "calculated",
    ); // Atmospheric pressure
    sm.setValue(
      `${prefix}cooling_partialPressure`,
      state.partialPressure.toString(),
      "calculated",
    ); // Partial pressure
    sm.setValue(
      `${prefix}cooling_humidityRatio`,
      state.humidityRatioDifference.toString(),
      "calculated",
    ); // Humidity ratio difference

    // Cross-section outputs for S14 (moved from S14/S13 for tight cooling integration)
  }

  /**
   * Dispatch a custom event to notify other modules that cooling calculations are ready
   * @param {string} stage - Optional stage identifier ("stage1", "stage2", or undefined for legacy)
   */
  function dispatchCoolingEvent(stage) {
    const eventName = stage
      ? `cooling-calculations-${stage}`
      : "cooling-calculations-loaded";

    const event = new CustomEvent(eventName, {
      detail: {
        stage: stage || "all",
        latentLoadFactor: state.latentLoadFactor,
        freeCoolingLimit: state.freeCoolingLimit,
        daysActiveCooling: state.daysActiveCooling,
      },
    });

    document.dispatchEvent(event);
    console.log(`[Cooling] 📢 Dispatched event: ${eventName}`);
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
      `[Cooling] 🔗 Registering m_129 listener to trigger Stage 2 (Target mode)`,
    );
    sm.addListener("m_129", function (newValue) {
      console.log(
        `[Cooling] 🎯 m_129 changed: ${newValue} → triggering Stage 2 for TARGET mode`,
      );
      state.coolingLoad = parseFloat(newValue.replace(/,/g, "")) || 0;

      // Trigger Stage 2 for Target mode only (m_129 is Target-specific)
      calculateStage2("target");
    });

    // Listen for ref_m_129 (Reference mode mitigated cooling load)
    console.log(
      `[Cooling] 🔗 Registering ref_m_129 listener to trigger Stage 2 (Reference mode)`,
    );
    sm.addListener("ref_m_129", function (newValue) {
      console.log(
        `[Cooling] 🎯 ref_m_129 changed: ${newValue} → triggering Stage 2 for REFERENCE mode`,
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
      `[Cooling] 🔗 Registering d_116 listener for cooling system changes`,
    );
    sm.addListener("d_116", function (newValue) {
      console.log(
        `[Cooling] 🌡️ Cooling system changed: d_116="${newValue}" → triggering Stage 2 for both modes`,
      );

      // ✅ DUAL-ENGINE: Trigger Stage 2 for BOTH modes
      // (it will check d_116 internally and skip if "No Cooling")
      calculateStage2("target");
      calculateStage2("reference");
    });

    // Listen for cooling load updates (legacy - now handled by m_129 listener)
    sm.addListener("d_129", function (newValue) {
      // Update cooling load and recalculate
      state.coolingLoad = parseFloat(newValue.replace(/,/g, "")) || 0;
      calculateDaysActiveCooling();
      updateStateManager(); // 📊 STATEMANAGER: Publish updated results
    });

    // Listen for indoor RH% changes from S08 i_59 slider
    console.log(
      `[Cooling] 🔗 Registering i_59 listener for indoor humidity changes`,
    );
    sm.addListener("i_59", function (newValue) {
      console.log(
        `[Cooling] 🌡️ Indoor RH% changed: i_59=${newValue}% → updating latent load calculations`,
      );
      state.indoorRH = parseFloat(newValue) / 100; // Convert percentage to decimal

      // ✅ DUAL-ENGINE: Indoor RH affects Stage 1 calculations for BOTH modes
      calculateStage1("target");
      calculateStage1("reference");
    });

    // D117/L114 now calculated by S13, not Cooling.js - listeners removed

    // ✅ FIX: Listen for h_124 (free cooling limit) changes from S13
    // This fixes the m_124 dependency chain: l_119 → d_122/d_123 → h_124 → m_124
    sm.addListener("h_124", function (newValue) {
      console.log(
        `[Cooling] Free cooling limit changed: h_124=${newValue} → recalculating m_124 (days active cooling)`,
      );
      state.freeCoolingLimit = parseFloat(newValue.replace(/,/g, "")) || 0;
      calculateDaysActiveCooling(); // Recalculate m_124 with new h_124
      updateStateManager(); // Publish updated cooling_m_124 to StateManager
    });

    // ✅ FIX: Listen for l_119 (summer boost) changes to trigger complete m_124 recalculation
    // This ensures m_124 updates when ventilation parameters change
    sm.addListener("l_119", function (newValue) {
      console.log(
        `[Cooling] Summer boost changed: l_119=${newValue} → recalculating free cooling for both modes`,
      );

      // ✅ DUAL-ENGINE: Summer boost affects Stage 1 (free cooling capacity) for BOTH modes
      calculateStage1("target");
      calculateStage1("reference");
    });

    // ✅ NEW: Listen for h_24 (Target cooling setpoint) changes from S03
    // Cooling setpoint affects temperature differential for free cooling calculations
    console.log(
      `[Cooling] 🔗 Registering h_24 listener for cooling setpoint changes`,
    );
    sm.addListener("h_24", function (newValue) {
      console.log(
        `[Cooling] 🌡️ Target cooling setpoint changed: h_24=${newValue}°C → recalculating Stage 1 (Target mode)`,
      );

      // Cooling setpoint affects Stage 1 free cooling calculations
      calculateStage1("target");
    });

    // ✅ NEW: Listen for ref_h_24 (Reference cooling setpoint) changes from S03
    sm.addListener("ref_h_24", function (newValue) {
      console.log(
        `[Cooling] 🌡️ Reference cooling setpoint changed: ref_h_24=${newValue}°C → recalculating Stage 1 (Reference mode)`,
      );

      // Cooling setpoint affects Stage 1 free cooling calculations
      calculateStage1("reference");
    });

    // ✅ FIX: Listen for d_120 (base ventilation rate) changes
    // This ensures m_124 updates when base ventilation rate changes
    sm.addListener("d_120", function (newValue) {
      console.log(
        `[Cooling] Base ventilation rate changed: d_120=${newValue} → recalculating free cooling for both modes`,
      );

      // ✅ DUAL-ENGINE: Base ventilation affects Stage 1 (free cooling capacity) for BOTH modes
      calculateStage1("target");
      calculateStage1("reference");
    });

    // ✅ FIX: Listen for l_22 (elevation) changes from S03 location selection
    // This ensures atmospheric pressure updates when location changes
    sm.addListener("l_22", function (newValue) {
      console.log(
        `[Cooling] Elevation changed: l_22=${newValue}m → updating atmospheric pressure for both modes`,
      );
      updateAtmosphericPressure(); // Recalculate atmospheric pressure

      // ✅ DUAL-ENGINE: Atmospheric pressure affects humidity calculations in Stage 1 for BOTH modes
      calculateStage1("target");
      calculateStage1("reference");
    });
  }

  /**
   * Initialize the module
   */
  function initialize(params = {}) {
    // Already initialized - avoid duplicate initialization
    if (state.initialized) return;

    // Allow overriding default values with provided parameters
    Object.keys(params).forEach((key) => {
      if (key in state) {
        state[key] = params[key];
      }
    });

    // Try to get values from StateManager if available
    if (typeof window.TEUI.StateManager !== "undefined") {
      // Get cooling setpoint
      // Read values from StateManager (lenient initialization - still need to use StateManager.getValue here
      // since we don't have a currentMode set yet during initialization)
      // These values will be updated with mode-aware reading during calculateAll()
      const coolingSetpoint = window.TEUI.StateManager.getValue("h_24");
      state.coolingSetTemp = coolingSetpoint ? parseFloat(coolingSetpoint) : 24;

      const cdd = window.TEUI.StateManager.getValue("d_21");
      state.coolingDegreeDays = cdd ? parseFloat(cdd) : 196;

      const volume = window.TEUI.StateManager.getValue("d_105");
      state.buildingVolume = volume
        ? parseFloat(volume.toString().replace(/,/g, ""))
        : 8000;

      const area = window.TEUI.StateManager.getValue("h_15");
      state.buildingArea = area
        ? parseFloat(area.toString().replace(/,/g, ""))
        : 1427.2;

      const indoorRH = window.TEUI.StateManager.getValue("i_59");
      state.indoorRH = indoorRH ? parseFloat(indoorRH) / 100 : 0.45;

      // Calculate atmospheric pressure from elevation (COOLING-TARGET E15 logic)
      updateAtmosphericPressure(); // Calculate initial atmospheric pressure from S03 elevation

      // Get cooling load (for D129/M129 calculations)
      const coolingLoad = window.TEUI.StateManager.getValue("d_129");
      if (coolingLoad) {
        state.coolingLoad = parseFloat(coolingLoad.replace(/,/g, ""));
      }

      // ✅ TWO-STAGE ARCHITECTURE: Initialize cooling_m_124 to 0 for both modes
      // This prevents S13 errors before Stage 2 runs
      // Stage 2 will update these values when m_129 becomes available
      window.TEUI.StateManager.setValue("cooling_m_124", "0", "calculated");
      window.TEUI.StateManager.setValue("ref_cooling_m_124", "0", "calculated");
      console.log(
        "[Cooling] 🔧 Initialized cooling_m_124=0 for both modes (will be updated by Stage 2)",
      );

      // Register with StateManager
      registerWithStateManager();
    }

    // Run initial calculations (default to target mode)
    calculateAll("target");

    // Mark as initialized
    state.initialized = true;
  }

  // Public API
  return {
    // Initialization
    initialize: initialize,

    // Calculation methods
    calculateAll: calculateAll, // Runs Stage 1, Stage 2 triggered by m_129 listener
    calculateStage1: calculateStage1, // Ventilation & free cooling (independent)
    calculateStage2: calculateStage2, // Active cooling (dependent on m_129)

    // Getters for calculated values
    getLatentLoadFactor: function () {
      return state.latentLoadFactor;
    },

    getFreeCoolingLimit: function () {
      return state.freeCoolingLimit;
    },

    getDaysActiveCooling: function () {
      return state.daysActiveCooling;
    },

    getWetBulbTemperature: function () {
      return state.wetBulbTemperature;
    },

    // Method to update specific inputs and recalculate - now MODE-AWARE!
    updateValue: function (key, value, mode = "target") {
      if (key in state) {
        state[key] = value;
        calculateAll(mode);
      }
    },

    // 📊 STATEMANAGER METHODS: Standard section integration pattern
    // (calculateAll already defined above)

    // Method to recalculate cooling (standard section pattern) - now MODE-AWARE!
    recalculate: function (mode = "target") {
      calculateAll(mode); // Recalculate and publish to StateManager for specified mode
    },

    // Method to update cooling load and recalculate days of active cooling - now MODE-AWARE!
    updateCoolingLoad: function (load, mode = "target") {
      state.coolingLoad = load;
      state.currentMode = mode; // Set current mode for mode-aware calculations
      calculateDaysActiveCooling();
      updateStateManager(); // 📊 STATEMANAGER: Publish updated results with correct prefix
    },

    // Debug method to get all state values
    getDebugInfo: function () {
      return { ...state };
    },
  };
})();

// Initialize when StateManager becomes available
document.addEventListener("teui-statemanager-ready", function () {
  // Initialize with StateManager values
  window.TEUI.CoolingCalculations.initialize();
});
