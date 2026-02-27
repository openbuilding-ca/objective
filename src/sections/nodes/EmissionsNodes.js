/**
 * EmissionsNodes.js - CO2e Emissions Calculations (S04/S05)
 *
 * Energy emissions from fuel consumption and lifetime carbon.
 *
 * Formulas derived from Section04.js and Section05.js:
 * - g_32 = g_27 + g_28 + g_29 + g_30 + g_31 - (d_60 * 1000) (Actual Emissions)
 * - k_32 = k_27 + k_28 + k_29 + k_30 + k_31 - (d_60 * 1000) (Target Emissions)
 * - h_8 = k_32 / h_15 (Target Annual Carbon from S01)
 * - g_38 = emissions / h_15 (Annual GHGI from S05)
 * - i_38 = g_38 * h_13 (Lifetime Operational from S05)
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

  function register(graph) {
    // ========================================================================
    // INPUTS - Individual row emissions (calculated by legacy system)
    // These are synced from StateManager for validation
    // ========================================================================
    const inputs = [
      // Actual energy consumption (f_27 through f_31)
      { id: "energy.actual.electricity", legacyId: "f_27", section: "S04", classification: "C", label: "Actual Electricity (kWh/yr)", defaultValue: 0 },
      { id: "energy.actual.gas", legacyId: "f_28", section: "S04", classification: "C", label: "Actual Gas (kWh/yr)", defaultValue: 0 },
      { id: "energy.actual.propane", legacyId: "f_29", section: "S04", classification: "C", label: "Actual Propane (kWh/yr)", defaultValue: 0 },
      { id: "energy.actual.oil", legacyId: "f_30", section: "S04", classification: "C", label: "Actual Oil (kWh/yr)", defaultValue: 0 },
      { id: "energy.actual.wood", legacyId: "f_31", section: "S04", classification: "C", label: "Actual Wood (kWh/yr)", defaultValue: 0 },

      // Actual emissions (g_27 through g_31)
      { id: "emissions.actual.electricity", legacyId: "g_27", section: "S04", classification: "C", label: "Actual Electricity Emissions (kg CO2e/yr)", defaultValue: 0 },
      { id: "emissions.actual.gas", legacyId: "g_28", section: "S04", classification: "C", label: "Actual Gas Emissions (kg CO2e/yr)", defaultValue: 0 },
      { id: "emissions.actual.propane", legacyId: "g_29", section: "S04", classification: "C", label: "Actual Propane Emissions (kg CO2e/yr)", defaultValue: 0 },
      { id: "emissions.actual.oil", legacyId: "g_30", section: "S04", classification: "C", label: "Actual Oil Emissions (kg CO2e/yr)", defaultValue: 0 },
      { id: "emissions.actual.wood", legacyId: "g_31", section: "S04", classification: "C", label: "Actual Wood Emissions (kg CO2e/yr)", defaultValue: 0 },

      // Target energy inputs needed for computed j_27-j_31
      // d_29: Propane actual usage (user utility bill input)
      { id: "energy.actual.propane.kg", legacyId: "d_29", section: "S04", classification: "A", label: "Total Propane Use (kg/yr)", defaultValue: 0 },
      // e_51 (waterHeating.gasVolume) now computed in WaterHeatingNodes
      // k_54 (waterHeating.oilVolume) now computed in WaterHeatingNodes

      // Emission factors (l_27 through l_31)
      // All are user-editable with defaults (l_27 can be overridden per CSV)
      { id: "emissions.factor.electricity", legacyId: "l_27", section: "S04", classification: "C", label: "Electricity Emission Factor (gCO2e/kWh)", defaultValue: 51 },
      { id: "emissions.factor.gas", legacyId: "l_28", section: "S04", classification: "C", label: "Gas Emission Factor (gCO2e/m³)", defaultValue: 1921 },
      { id: "emissions.factor.propane", legacyId: "l_29", section: "S04", classification: "C", label: "Propane Emission Factor (gCO2e/kg)", defaultValue: 2970 },
      { id: "emissions.factor.oil", legacyId: "l_30", section: "S04", classification: "C", label: "Oil Emission Factor (gCO2e/litre)", defaultValue: 2753 },
      { id: "emissions.factor.wood", legacyId: "l_31", section: "S04", classification: "C", label: "Wood Emission Factor (kgCO2e/m³)", defaultValue: 150 },

      // Embodied carbon inputs (S05)
      { id: "emissions.modelledEmbodied", legacyId: "i_41", section: "S05", classification: "C", label: "Modelled Embodied Carbon (kgCO2e/m²)", defaultValue: 350 },
    ];

    graph.registerInputs(inputs);

    // ========================================================================
    // TARGET ENERGY BY FUEL TYPE (j_27-j_31)
    // Previously registered as inputs, now computed nodes with proper dependencies
    // Section04.js lines 1206-1286
    // ========================================================================

    // j_27: Target Electricity = d_136 - d_43 - i_43
    // Total energy minus PV and wind/offsite renewables
    graph.registerNode({
      id: "energy.target.electricity",
      legacyId: "j_27",
      section: "S04",
      classification: "C",
      dependencies: [
        "energy.total.all",        // d_136
        "renewable.onsiteTotal",   // d_43 (PV generation)
        "renewable.offsiteTotal"   // i_43 (wind/offsite)
      ],
      label: "Target Electricity (kWh/yr)",
      compute: (inputs) => {
        // j_27 = h_27 - d_43 - i_43, where h_27 = d_136 (Section04.js line 1212)
        const d136 = parseNum(inputs["energy.total.all"], 0);
        const d43 = parseNum(inputs["renewable.onsiteTotal"], 0);
        const i43 = parseNum(inputs["renewable.offsiteTotal"], 0);
        return d136 - d43 - i43;
      },
    });

    // j_28: Target Gas = h_28 * 0.0373 * 277.7778 (volume to kWh)
    // h_28 = IF(AND(d_113="Gas", d_51="Gas"), e_51+h_115, IF(d_51="Gas", e_51, IF(d_113="Gas", h_115, 0)))
    graph.registerNode({
      id: "energy.target.gas",
      legacyId: "j_28",
      section: "S04",
      classification: "C",
      dependencies: [
        "mechanical.heating.systemType",    // d_113
        "waterHeating.systemType",          // d_51
        "waterHeating.gasVolume",           // e_51
        "mechanical.heating.gasConsumption" // h_115
      ],
      label: "Target Gas (kWh/yr)",
      compute: (inputs) => {
        // Section04.js lines 1220-1238
        const spaceHeatingFuel = inputs["mechanical.heating.systemType"] || "";
        const waterHeatingFuel = inputs["waterHeating.systemType"] || "";
        const waterGasVolume = parseNum(inputs["waterHeating.gasVolume"], 0);
        const spaceGasVolume = parseNum(inputs["mechanical.heating.gasConsumption"], 0);

        let h_28 = 0;
        if (spaceHeatingFuel === "Gas" && waterHeatingFuel === "Gas") {
          h_28 = waterGasVolume + spaceGasVolume;
        } else if (waterHeatingFuel === "Gas") {
          h_28 = waterGasVolume;
        } else if (spaceHeatingFuel === "Gas") {
          h_28 = spaceGasVolume;
        }

        // Convert m³ to kWh: h_28 * 0.0373 * 277.7778
        return h_28 * 0.0373 * 277.7778;
      },
    });

    // j_29: Target Propane = d_29 * 14.019 (kg to kWh)
    // Target mirrors actual for user-controlled fuel
    graph.registerNode({
      id: "energy.target.propane",
      legacyId: "j_29",
      section: "S04",
      classification: "C",
      dependencies: ["energy.actual.propane.kg"], // d_29
      label: "Target Propane (kWh/yr)",
      compute: (inputs) => {
        // Section04.js line 1249: j_29 = h_29 * 14.019, where h_29 = d_29
        const d29 = parseNum(inputs["energy.actual.propane.kg"], 0);
        return d29 * 14.019;
      },
    });

    // j_30: Target Oil = h_30 * 36.72 * 0.2777778 (litres to kWh)
    // h_30 = IF(AND(d_113="Oil", d_51="Oil"), k_54+f_115, IF(d_51="Oil", k_54, IF(d_113="Oil", f_115, 0)))
    graph.registerNode({
      id: "energy.target.oil",
      legacyId: "j_30",
      section: "S04",
      classification: "C",
      dependencies: [
        "mechanical.heating.systemType",     // d_113
        "waterHeating.systemType",           // d_51
        "waterHeating.oilVolume",            // k_54
        "mechanical.heating.oilConsumption"  // f_115
      ],
      label: "Target Oil (kWh/yr)",
      compute: (inputs) => {
        // Section04.js lines 1256-1274
        const spaceHeatingFuel = inputs["mechanical.heating.systemType"] || "";
        const waterHeatingFuel = inputs["waterHeating.systemType"] || "";
        const waterOilVolume = parseNum(inputs["waterHeating.oilVolume"], 0);
        const spaceOilVolume = parseNum(inputs["mechanical.heating.oilConsumption"], 0);

        let h_30 = 0;
        if (spaceHeatingFuel === "Oil" && waterHeatingFuel === "Oil") {
          h_30 = waterOilVolume + spaceOilVolume;
        } else if (waterHeatingFuel === "Oil") {
          h_30 = waterOilVolume;
        } else if (spaceHeatingFuel === "Oil") {
          h_30 = spaceOilVolume;
        }

        // Convert litres to kWh: h_30 * 36.72 * 0.2777778
        return h_30 * 36.72 * 0.2777778;
      },
    });

    // j_31: Target Wood = d_31 * 1000 (m³ to kWh)
    // Target mirrors actual for user-controlled fuel
    graph.registerNode({
      id: "energy.target.wood",
      legacyId: "j_31",
      section: "S04",
      classification: "C",
      dependencies: ["forestry.woodVolume"], // d_31
      label: "Target Wood (kWh/yr)",
      compute: (inputs) => {
        // Section04.js line 1285: j_31 = h_31 * 1000, where h_31 = d_31
        const d31 = parseNum(inputs["forestry.woodVolume"], 0);
        return d31 * 1000;
      },
    });

    // ========================================================================
    // GRID INTENSITY FACTORS (Reference for province-based defaults)
    // These can be used by the UI layer to set l_27 default based on province
    // When loading from CSV, l_27 is loaded as an input and overrides these
    // Section04.js GRID_INTENSITY_FACTORS
    // ========================================================================

    // Province-based grid intensity factors (gCO2e/kWh)
    const GRID_INTENSITY_FACTORS = {
      ON: { default: 51 },
      QC: { default: 1 },
      BC: { default: 12 },
      AB: { default: 650 },
      SK: { default: 720 },
      MB: { default: 3 },
      NS: { default: 600 },
      NB: { default: 340 },
      NL: { default: 30 },
      PE: { default: 12 },
      NT: { default: 180 },
      YT: { default: 2 },
      NU: { default: 200 },
    };

    // Expose for external use (e.g., UI layer setting province-based defaults)
    window.TEUI.EmissionsFactors = window.TEUI.EmissionsFactors || {};
    window.TEUI.EmissionsFactors.GRID_INTENSITY = GRID_INTENSITY_FACTORS;

    // Helper function to get province-based electricity factor
    window.TEUI.EmissionsFactors.getElectricityFactor = function(province) {
      const factors = GRID_INTENSITY_FACTORS[province] || GRID_INTENSITY_FACTORS["ON"];
      return factors.default;
    };

    // ========================================================================
    // TARGET EMISSIONS BY FUEL TYPE (k_27-k_31)
    // Formulas: energy × emission_factor / 1000 (convert g to kg)
    // Section04.js lines 1213, 1239, 1250, 1275, 1286
    // ========================================================================

    // k_27: Target Electricity Emissions = j_27 × l_27 / 1000
    graph.registerNode({
      id: "emissions.target.electricity",
      legacyId: "k_27",
      section: "S04",
      classification: "C",
      dependencies: ["energy.target.electricity", "emissions.factor.electricity"],
      label: "Target Electricity Emissions (kg CO2e/yr)",
      compute: (inputs) => {
        // Section04.js line 1213: k_27 = (h_27 - d_43 - i_43) * l_27 / 1000 = j_27 * l_27 / 1000
        const j27 = parseNum(inputs["energy.target.electricity"], 0);
        const l27 = parseNum(inputs["emissions.factor.electricity"], 51);
        return (j27 * l27) / 1000;
      },
    });

    // k_28: Target Gas Emissions = h_28 × l_28 / 1000
    // Note: Emissions calculated from VOLUME (h_28), not energy (j_28)
    graph.registerNode({
      id: "emissions.target.gas",
      legacyId: "k_28",
      section: "S04",
      classification: "C",
      dependencies: [
        "mechanical.heating.systemType",
        "waterHeating.systemType",
        "waterHeating.gasVolume",
        "mechanical.heating.gasConsumption",
        "emissions.factor.gas"
      ],
      label: "Target Gas Emissions (kg CO2e/yr)",
      compute: (inputs) => {
        // Section04.js line 1239: k_28 = h_28 × 1921 / 1000
        // h_28 = combined gas volume from space heating + water heating
        const spaceHeatingFuel = inputs["mechanical.heating.systemType"] || "";
        const waterHeatingFuel = inputs["waterHeating.systemType"] || "";
        const waterGasVolume = parseNum(inputs["waterHeating.gasVolume"], 0);
        const spaceGasVolume = parseNum(inputs["mechanical.heating.gasConsumption"], 0);
        const l28 = parseNum(inputs["emissions.factor.gas"], 1921);

        let h_28 = 0;
        if (spaceHeatingFuel === "Gas" && waterHeatingFuel === "Gas") {
          h_28 = waterGasVolume + spaceGasVolume;
        } else if (waterHeatingFuel === "Gas") {
          h_28 = waterGasVolume;
        } else if (spaceHeatingFuel === "Gas") {
          h_28 = spaceGasVolume;
        }

        return (h_28 * l28) / 1000;
      },
    });

    // k_29: Target Propane Emissions = h_29 × l_29 / 1000
    // Note: h_29 = d_29 (target mirrors actual for user-controlled fuel)
    graph.registerNode({
      id: "emissions.target.propane",
      legacyId: "k_29",
      section: "S04",
      classification: "C",
      dependencies: ["energy.actual.propane.kg", "emissions.factor.propane"],
      label: "Target Propane Emissions (kg CO2e/yr)",
      compute: (inputs) => {
        // Section04.js line 1250: k_29 = h_29 × 2970 / 1000, where h_29 = d_29
        const d29 = parseNum(inputs["energy.actual.propane.kg"], 0);
        const l29 = parseNum(inputs["emissions.factor.propane"], 2970);
        return (d29 * l29) / 1000;
      },
    });

    // k_30: Target Oil Emissions = h_30 × l_30 / 1000
    // Note: Emissions calculated from VOLUME (h_30), not energy (j_30)
    graph.registerNode({
      id: "emissions.target.oil",
      legacyId: "k_30",
      section: "S04",
      classification: "C",
      dependencies: [
        "mechanical.heating.systemType",
        "waterHeating.systemType",
        "waterHeating.oilVolume",
        "mechanical.heating.oilConsumption",
        "emissions.factor.oil"
      ],
      label: "Target Oil Emissions (kg CO2e/yr)",
      compute: (inputs) => {
        // Section04.js line 1275: k_30 = h_30 × 2753 / 1000
        // h_30 = combined oil volume from space heating + water heating
        const spaceHeatingFuel = inputs["mechanical.heating.systemType"] || "";
        const waterHeatingFuel = inputs["waterHeating.systemType"] || "";
        const waterOilVolume = parseNum(inputs["waterHeating.oilVolume"], 0);
        const spaceOilVolume = parseNum(inputs["mechanical.heating.oilConsumption"], 0);
        const l30 = parseNum(inputs["emissions.factor.oil"], 2753);

        let h_30 = 0;
        if (spaceHeatingFuel === "Oil" && waterHeatingFuel === "Oil") {
          h_30 = waterOilVolume + spaceOilVolume;
        } else if (waterHeatingFuel === "Oil") {
          h_30 = waterOilVolume;
        } else if (spaceHeatingFuel === "Oil") {
          h_30 = spaceOilVolume;
        }

        return (h_30 * l30) / 1000;
      },
    });

    // k_31: Target Wood Emissions = h_31 × l_31 (no /1000, factor already in kgCO2e)
    graph.registerNode({
      id: "emissions.target.wood",
      legacyId: "k_31",
      section: "S04",
      classification: "C",
      dependencies: ["forestry.woodVolume", "emissions.factor.wood"],
      label: "Target Wood Emissions (kg CO2e/yr)",
      compute: (inputs) => {
        // Section04.js line 1286: k_31 = h_31 × 150, where h_31 = d_31
        const d31 = parseNum(inputs["forestry.woodVolume"], 0);
        const l31 = parseNum(inputs["emissions.factor.wood"], 150);
        return d31 * l31;  // No /1000, l_31 already in kgCO2e/m³
      },
    });

    // ========================================================================
    // ROW 32 SUBTOTALS (Critical for S01 dashboard)
    // Section04.js lines 1323-1326
    // ========================================================================

    // Actual energy subtotal (f_32) = SUM(f_27:f_31)
    graph.registerNode({
      id: "energy.actual.total",
      legacyId: "f_32",
      section: "S04",
      classification: "C",
      dependencies: [
        "energy.actual.electricity",
        "energy.actual.gas",
        "energy.actual.propane",
        "energy.actual.oil",
        "energy.actual.wood"
      ],
      label: "Actual Energy Total (kWh/yr)",
      compute: (inputs) => {
        // f_32 = SUM(f_27:f_31) (Section04.js line 1323)
        const f27 = parseNum(inputs["energy.actual.electricity"]);
        const f28 = parseNum(inputs["energy.actual.gas"]);
        const f29 = parseNum(inputs["energy.actual.propane"]);
        const f30 = parseNum(inputs["energy.actual.oil"]);
        const f31 = parseNum(inputs["energy.actual.wood"]);
        return f27 + f28 + f29 + f30 + f31;
      },
    });

    // Actual emissions subtotal (g_32) = SUM(g_27:g_31) - (d_60 * 1000)
    graph.registerNode({
      id: "emissions.actual.subtotal",
      legacyId: "g_32",
      section: "S04",
      classification: "C",
      dependencies: [
        "emissions.actual.electricity",
        "emissions.actual.gas",
        "emissions.actual.propane",
        "emissions.actual.oil",
        "emissions.actual.wood",
        "forestry.annualOffset"
      ],
      label: "Actual Emissions Subtotal (kg CO2e/yr)",
      compute: (inputs) => {
        // g_32 = SUM(g_27:g_31) - (d_60 * 1000) (Section04.js line 1324)
        const g27 = parseNum(inputs["emissions.actual.electricity"]);
        const g28 = parseNum(inputs["emissions.actual.gas"]);
        const g29 = parseNum(inputs["emissions.actual.propane"]);
        const g30 = parseNum(inputs["emissions.actual.oil"]);
        const g31 = parseNum(inputs["emissions.actual.wood"]);
        const d60 = parseNum(inputs["forestry.annualOffset"]); // MT/yr
        return g27 + g28 + g29 + g30 + g31 - (d60 * 1000);
      },
    });

    // Target energy subtotal (j_32) = SUM(j_27:j_31)
    graph.registerNode({
      id: "energy.target.total",
      legacyId: "j_32",
      section: "S04",
      classification: "C",
      dependencies: [
        "energy.target.electricity",
        "energy.target.gas",
        "energy.target.propane",
        "energy.target.oil",
        "energy.target.wood"
      ],
      label: "Target Energy Total (kWh/yr)",
      compute: (inputs) => {
        // j_32 = SUM(j_27:j_31) (Section04.js line 1325)
        const j27 = parseNum(inputs["energy.target.electricity"]);
        const j28 = parseNum(inputs["energy.target.gas"]);
        const j29 = parseNum(inputs["energy.target.propane"]);
        const j30 = parseNum(inputs["energy.target.oil"]);
        const j31 = parseNum(inputs["energy.target.wood"]);
        return j27 + j28 + j29 + j30 + j31;
      },
    });

    // Target emissions subtotal (k_32) = SUM(k_27:k_31) - (d_60 * 1000)
    graph.registerNode({
      id: "emissions.target.subtotal",
      legacyId: "k_32",
      section: "S04",
      classification: "C",
      dependencies: [
        "emissions.target.electricity",
        "emissions.target.gas",
        "emissions.target.propane",
        "emissions.target.oil",
        "emissions.target.wood",
        "forestry.annualOffset"
      ],
      label: "Target Emissions Subtotal (kg CO2e/yr)",
      compute: (inputs) => {
        // k_32 = SUM(k_27:k_31) - (d_60 * 1000) (Section04.js line 1326)
        const k27 = parseNum(inputs["emissions.target.electricity"]);
        const k28 = parseNum(inputs["emissions.target.gas"]);
        const k29 = parseNum(inputs["emissions.target.propane"]);
        const k30 = parseNum(inputs["emissions.target.oil"]);
        const k31 = parseNum(inputs["emissions.target.wood"]);
        const d60 = parseNum(inputs["forestry.annualOffset"]); // MT/yr
        return k27 + k28 + k29 + k30 + k31 - (d60 * 1000);
      },
    });

    // ========================================================================
    // NOTE: h_8 and e_8 (Annual Carbon) are calculated in KeyValuesNodes.js
    // to avoid duplicate legacyId registrations
    // ========================================================================

    // ========================================================================
    // SECTION 05: GHGI Calculations
    // Section05.js lines 844-853
    // ========================================================================

    // Annual GHGI (g_38) = emissions / h_15
    graph.registerNode({
      id: "emissions.ghgi.annual",
      legacyId: "g_38",
      section: "S05",
      classification: "C",
      dependencies: ["emissions.target.subtotal", "building.conditionedFloorArea"],
      label: "Annual GHG Intensity (kg CO2e/m²/yr)",
      compute: (inputs) => {
        // g_38 = emissions / h_15 (Section05.js line 845)
        const emissions = parseNum(inputs["emissions.target.subtotal"]);
        const h15 = parseNum(inputs["building.conditionedFloorArea"], 1);
        return h15 > 0 ? emissions / h15 : 0;
      },
    });

    // Lifetime operational emissions (i_38) = g_38 * h_13
    graph.registerNode({
      id: "emissions.ghgi.lifetime",
      legacyId: "i_38",
      section: "S05",
      classification: "C",
      dependencies: ["emissions.ghgi.annual", "building.serviceLife"],
      label: "Lifetime Operational Emissions (kg CO2e/m²)",
      compute: (inputs) => {
        // i_38 = g_38 * h_13 (Section05.js line 892)
        const g38 = parseNum(inputs["emissions.ghgi.annual"]);
        const h13 = parseNum(inputs["building.serviceLife"], 50);
        return g38 * h13;
      },
    });

    // Total lifetime carbon (operational + embodied)
    graph.registerNode({
      id: "emissions.lifetime.total",
      section: "S05",
      classification: "C",
      dependencies: ["emissions.ghgi.lifetime", "emissions.modelledEmbodied"],
      label: "Total Lifetime Carbon (kg CO2e/m²)",
      compute: (inputs) => {
        const operational = parseNum(inputs["emissions.ghgi.lifetime"]);
        const embodied = parseNum(inputs["emissions.modelledEmbodied"]);
        return operational + embodied;
      },
    });

    console.log("[EmissionsNodes] Registered", inputs.length, "inputs");
  }

  window.TEUI.ComputationNodes.Emissions = { register };
  console.log("[EmissionsNodes] Module loaded");
})();
