/**
 * WaterHeatingNodes.js - Water Heating System (Section 07)
 *
 * Matches legacy Section07.js calculation logic exactly.
 * Key fields:
 * - d_49: Water Use Method dropdown
 * - e_49: User Defined litres/person/day
 * - e_50: By Engineer direct kWh/yr input
 * - j_50: Calculated hot water energy demand
 * - d_51: System type (Heatpump, Gas, Oil, Electric)
 * - d_52: Efficiency %
 * - d_53: Drain Water Heat Recovery Efficiency (0-70%)
 * - k_51: Net Electrical Demand (calculated)
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  // Fuel type energy factors (kWh per unit)
  const FUEL_FACTORS = {
    "Electric": { unit: "kWh", factor: 1 },
    "Gas": { unit: "m³", factor: 10.3321 },
    "Propane": { unit: "L", factor: 7.0833 },
    "Oil": { unit: "L", factor: 10.7444 },
    "Heatpump": { unit: "kWh", factor: 1 },
  };

  // Litres per person per day by method
  const METHOD_LPPPD = {
    "User Defined": null,  // Uses e_49 input
    "By Engineer": null,   // Uses e_50 direct input
    "PHPP Method": 62.5,
    "NBC Method": 220,
    "OBC Method": 275,
    "Luxury": 400,
  };

  function register(graph) {
    const inputs = [
      { id: "waterHeating.method", legacyId: "d_49", section: "S07", classification: "C", label: "Water Use Method", defaultValue: "User Defined" },
      { id: "waterHeating.userDefinedLpppd", legacyId: "e_49", section: "S07", classification: "C", label: "User Defined Water Use (L/person/day)", defaultValue: 40 },
      { id: "waterHeating.byEngineerKwh", legacyId: "e_50", section: "S07", classification: "C", label: "By Engineer Energy Demand (kWh/yr)", defaultValue: 10000 },
      { id: "waterHeating.systemType", legacyId: "d_51", section: "S07", classification: "C", label: "Water Heating System Type", defaultValue: "Heatpump" },
      { id: "waterHeating.efficiency", legacyId: "d_52", section: "S07", classification: "C", label: "Water Heating Efficiency (%)", defaultValue: 300 },
      { id: "waterHeating.dwhrEfficiency", legacyId: "d_53", section: "S07", classification: "C", label: "Drain Water Heat Recovery Efficiency (%)", defaultValue: 0 },
    ];

    graph.registerInputs(inputs);

    // Litres per person per day (computed from method)
    graph.registerNode({
      id: "waterHeating.lpppd",
      legacyId: "h_49",
      section: "S07",
      classification: "C",
      dependencies: ["waterHeating.method", "waterHeating.userDefinedLpppd", "waterHeating.byEngineerKwh", "occupancy.occupants"],
      label: "Litres per Person per Day",
      compute: (inputs) => {
        const method = inputs["waterHeating.method"] || "User Defined";
        const userDefined = parseFloat(inputs["waterHeating.userDefinedLpppd"]) || 40;
        const byEngineer = parseFloat(inputs["waterHeating.byEngineerKwh"]) || 10000;
        const occupants = parseFloat(inputs["occupancy.occupants"]) || 4;

        if (method === "By Engineer") {
          // Reverse-calculate lpppd from kWh
          const waterHeatFactor = 0.0524;
          return occupants > 0 ? byEngineer / (365 * waterHeatFactor * occupants * 0.4) : 0;
        } else if (method === "User Defined") {
          return userDefined;
        } else {
          return METHOD_LPPPD[method] || 40;
        }
      },
    });

    // Hot water energy demand (j_50 in legacy)
    graph.registerNode({
      id: "waterHeating.energyDemand",
      legacyId: "j_50",
      section: "S07",
      classification: "C",
      dependencies: ["waterHeating.method", "waterHeating.lpppd", "waterHeating.byEngineerKwh", "occupancy.occupants"],
      label: "Hot Water Energy Demand (kWh/yr)",
      compute: (inputs) => {
        const method = inputs["waterHeating.method"] || "User Defined";
        const lpppd = parseFloat(inputs["waterHeating.lpppd"]) || 40;
        const byEngineer = parseFloat(inputs["waterHeating.byEngineerKwh"]) || 10000;
        const occupants = parseFloat(inputs["occupancy.occupants"]) || 4;

        if (method === "By Engineer") {
          return byEngineer;
        } else {
          // Formula: lpppd * 0.4 * occupants * 0.0523 * 365
          return lpppd * 0.4 * occupants * 0.0523 * 365;
        }
      },
    });

    // Net electrical demand (k_51) - only for Heatpump/Electric systems
    graph.registerNode({
      id: "waterHeating.netElectricalDemand",
      legacyId: "k_51",
      section: "S07",
      classification: "C",
      dependencies: ["waterHeating.energyDemand", "waterHeating.efficiency", "waterHeating.systemType", "waterHeating.dwhrEfficiency"],
      label: "Net Electrical Demand (kWh/yr)",
      compute: (inputs) => {
        const systemType = inputs["waterHeating.systemType"] || "Electric";

        // k_51 is only non-zero for Heatpump or Electric
        if (systemType !== "Heatpump" && systemType !== "Electric") {
          return 0;
        }

        const demand = parseFloat(inputs["waterHeating.energyDemand"]) || 0;
        const efficiency = parseFloat(inputs["waterHeating.efficiency"]) || 100;
        const dwhrEfficiency = parseFloat(inputs["waterHeating.dwhrEfficiency"]) || 0;

        // Net thermal demand after efficiency
        const netThermalDemand = efficiency > 0 ? demand / (efficiency / 100) : demand;

        // Apply DWHR recovery
        const energyRecovered = netThermalDemand * (dwhrEfficiency / 100);
        return netThermalDemand - energyRecovered;
      },
    });

    // Efficiency as decimal (e_52)
    graph.registerNode({
      id: "waterHeating.efficiencyDecimal",
      legacyId: "e_52",
      section: "S07",
      classification: "C",
      dependencies: ["waterHeating.efficiency"],
      label: "Water Heating Efficiency (decimal)",
      compute: (inputs) => {
        const efficiency = parseFloat(inputs["waterHeating.efficiency"]) || 100;
        return efficiency / 100;
      },
    });

    // Net thermal demand (j_51)
    graph.registerNode({
      id: "waterHeating.netThermalDemand",
      legacyId: "j_51",
      section: "S07",
      classification: "C",
      dependencies: ["waterHeating.energyDemand", "waterHeating.efficiencyDecimal"],
      label: "Net Thermal Demand (kWh/yr)",
      compute: (inputs) => {
        const demand = parseFloat(inputs["waterHeating.energyDemand"]) || 0;
        const effDecimal = parseFloat(inputs["waterHeating.efficiencyDecimal"]) || 1;
        return effDecimal > 0 ? demand / effDecimal : demand;
      },
    });

    // Energy recovered via DWHR (e_53)
    graph.registerNode({
      id: "waterHeating.energyRecovered",
      legacyId: "e_53",
      section: "S07",
      classification: "C",
      dependencies: ["waterHeating.netThermalDemand", "waterHeating.dwhrEfficiency"],
      label: "Energy Recovered via DWHR (kWh/yr)",
      compute: (inputs) => {
        const netDemand = parseFloat(inputs["waterHeating.netThermalDemand"]) || 0;
        const dwhrEff = parseFloat(inputs["waterHeating.dwhrEfficiency"]) || 0;
        return netDemand * (dwhrEff / 100);
      },
    });

    // Net demand after recovery (j_52)
    graph.registerNode({
      id: "waterHeating.netDemandAfterRecovery",
      legacyId: "j_52",
      section: "S07",
      classification: "C",
      dependencies: ["waterHeating.netThermalDemand", "waterHeating.energyRecovered"],
      label: "Net Demand After Recovery (kWh/yr)",
      compute: (inputs) => {
        const netDemand = parseFloat(inputs["waterHeating.netThermalDemand"]) || 0;
        const recovered = parseFloat(inputs["waterHeating.energyRecovered"]) || 0;
        return netDemand - recovered;
      },
    });

    // System losses (d_54)
    graph.registerNode({
      id: "waterHeating.systemLosses",
      legacyId: "d_54",
      section: "S07",
      classification: "C",
      dependencies: ["waterHeating.efficiencyDecimal", "waterHeating.energyDemand", "waterHeating.method"],
      label: "Water Heating System Losses (kWh/yr)",
      compute: (inputs) => {
        const effDecimal = parseFloat(inputs["waterHeating.efficiencyDecimal"]) || 1;
        const demand = parseFloat(inputs["waterHeating.energyDemand"]) || 0;
        const method = inputs["waterHeating.method"] || "User Defined";
        if (effDecimal <= 1) {
          const factor = method === "PHPP Method" ? 0.25 : 0.1;
          return demand * factor;
        }
        return 0;
      },
    });

    // Gas volume (e_51)
    graph.registerNode({
      id: "waterHeating.gasVolume",
      legacyId: "e_51",
      section: "S07",
      classification: "C",
      dependencies: ["waterHeating.systemType", "waterHeating.netDemandAfterRecovery", "waterHeating.efficiencyDecimal"],
      label: "Water Heating Gas Volume (m³/yr)",
      compute: (inputs) => {
        const type = inputs["waterHeating.systemType"] || "Electric";
        if (type !== "Gas") return 0;
        const netDemand = parseFloat(inputs["waterHeating.netDemandAfterRecovery"]) || 0;
        const effDecimal = parseFloat(inputs["waterHeating.efficiencyDecimal"]) || 1;
        const divisor = 0.0373 * 277.7778 * effDecimal;
        return divisor > 0 ? netDemand / divisor : 0;
      },
    });

    // Oil volume (k_54)
    graph.registerNode({
      id: "waterHeating.oilVolume",
      legacyId: "k_54",
      section: "S07",
      classification: "C",
      dependencies: ["waterHeating.systemType", "waterHeating.netDemandAfterRecovery", "waterHeating.efficiencyDecimal"],
      label: "Water Heating Oil Volume (L/yr)",
      compute: (inputs) => {
        const type = inputs["waterHeating.systemType"] || "Electric";
        if (type !== "Oil") return 0;
        const netDemand = parseFloat(inputs["waterHeating.netDemandAfterRecovery"]) || 0;
        const effDecimal = parseFloat(inputs["waterHeating.efficiencyDecimal"]) || 1;
        const divisor = 10.18 * effDecimal;
        return divisor > 0 ? netDemand / divisor : 0;
      },
    });

    console.log("[WaterHeatingNodes] Registered", inputs.length, "inputs");
  }

  window.TEUI.ComputationNodes.WaterHeating = { register, FUEL_FACTORS, METHOD_LPPPD };
  console.log("[WaterHeatingNodes] Module loaded");
})();
