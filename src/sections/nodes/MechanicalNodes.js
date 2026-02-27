/**
 * MechanicalNodes.js - Mechanical System Calculation Nodes
 *
 * Part of the Multi-Model Architecture refactoring (Phase 2, Task 2.4)
 * See: docs/REFACTORING_PLAN.md
 *
 * This module expresses Section 13 (Mechanical Loads) calculations as computation nodes.
 * Key calculations:
 * - COP calculations from HSPF
 * - Heating system demand and fuel impact
 * - Cooling system demand
 * - Ventilation rates and energy
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  function parseNum(value, defaultVal = 0) {
    if (value === null || value === undefined || value === "N/A") return defaultVal;
    if (value === "Unavailable") return defaultVal;
    const num = parseFloat(String(value).replace(/,/g, ""));
    return isNaN(num) ? defaultVal : num;
  }

  function isUnavailable(value) {
    return value === "Unavailable" || value === "N/A";
  }

  // ============================================================================
  // INPUT NODES
  // ============================================================================

  const MechanicalInputs = [
    // Heating System
    {
      id: "mechanical.heating.systemType",
      legacyId: "d_113",
      defaultValue: "Heatpump",
      classification: "C",
      section: "S13",
      label: "Primary Heating System Type"
    },
    {
      id: "mechanical.heating.hspf",
      legacyId: "f_113",
      defaultValue: 12.5,
      classification: "C",
      section: "S13",
      label: "HSPF (Heat Pump Seasonal Performance Factor)"
    },
    {
      id: "mechanical.heating.afue",
      legacyId: "j_115",
      defaultValue: 0.9,
      classification: "C",
      section: "S13",
      label: "AFUE (Annual Fuel Utilization Efficiency)"
    },

    // Cooling System
    {
      id: "mechanical.cooling.systemType",
      legacyId: "d_116",
      defaultValue: "Cooling",
      classification: "C",
      section: "S13",
      label: "Cooling System Type"
    },
    {
      id: "mechanical.cooling.copDedicated",
      legacyId: "j_116",
      defaultValue: 2.66,
      classification: "C",
      section: "S13",
      label: "Cooling COP (Dedicated System)"
    },

    // Ventilation
    {
      id: "mechanical.ventilation.method",
      legacyId: "g_118",
      defaultValue: "HRV",
      classification: "C",
      section: "S13",
      label: "Ventilation Method"
    },
    {
      id: "mechanical.ventilation.efficiency",
      legacyId: "d_118",
      defaultValue: 55,
      classification: "C",
      section: "S13",
      label: "ERV/HRV Sensible Recovery Efficiency",
      unit: "%"
    },
    {
      id: "mechanical.ventilation.ach",
      legacyId: "l_118",
      defaultValue: 3.0,
      classification: "C",
      section: "S13",
      label: "Air Changes per Hour (ACH)"
    },
    {
      id: "mechanical.ventilation.ratePerPerson",
      legacyId: "d_119",
      defaultValue: 10,
      classification: "C",
      section: "S13",
      label: "Ventilation Rate per Person",
      unit: "L/s/person"
    },
    {
      id: "mechanical.ventilation.summerBoost",
      legacyId: "l_119",
      defaultValue: 0,
      classification: "C",
      section: "S13",
      label: "Summer Ventilation Boost",
      unit: "%"
    },
    {
      id: "mechanical.ventilation.unoccupiedSetback",
      legacyId: "k_120",
      defaultValue: 0,
      classification: "C",
      section: "S13",
      label: "Unoccupied Setback",
      unit: "%"
    },

    // NOTE: External dependencies from other modules (no legacyIds to avoid duplicates):
    // - energy.ted.heating (d_127) from EnergyNodes
    // - energy.ced.unmitigated (d_129) from EnergyNodes
    // - volume.conditioned (d_105) from VolumeMetricsNodes
    // - building.conditionedFloorArea (h_15) from BuildingInfoNodes
  ];

  // ============================================================================
  // COMPUTATION NODES
  // ============================================================================

  const MechanicalNodes = [
    // ========================================================================
    // COP CALCULATIONS
    // ========================================================================
    {
      id: "mechanical.heating.copHeat",
      legacyId: "h_113",
      dependencies: ["mechanical.heating.systemType", "mechanical.heating.hspf"],
      classification: "C",
      section: "S13",
      label: "Heating COP",
      compute: (inputs) => {
        const systemType = inputs["mechanical.heating.systemType"];
        const hspf = parseNum(inputs["mechanical.heating.hspf"], 12.5);

        // COPheat = HSPF / 3.412 (only for heat pumps)
        if (systemType === "Heatpump" && hspf > 0) {
          return +(hspf / 3.412).toFixed(4);
        }
        return 1; // Gas/Oil systems have effective COP of 1
      }
    },
    {
      id: "mechanical.heating.copCoolDerived",
      legacyId: "j_113",
      dependencies: ["mechanical.heating.copHeat"],
      classification: "C",
      section: "S13",
      label: "Cooling COP (Derived from Heat Pump)",
      compute: (inputs) => {
        const copHeat = parseNum(inputs["mechanical.heating.copHeat"], 1);
        // COPcool = max(1, COPheat - 1)
        return +Math.max(1, copHeat - 1).toFixed(4);
      }
    },
    {
      id: "mechanical.heating.ceer",
      dependencies: ["mechanical.heating.copCoolDerived"],
      classification: "C",
      section: "S13",
      label: "CEER (Combined Energy Efficiency Ratio)",
      compute: (inputs) => {
        const copCool = parseNum(inputs["mechanical.heating.copCoolDerived"], 1);
        // CEER = 3.412 × COPcool
        return +(3.412 * copCool).toFixed(2);
      }
    },

    // ========================================================================
    // HEATING DEMAND
    // ========================================================================
    {
      id: "mechanical.heating.demand",
      legacyId: "d_114",
      dependencies: [
        "mechanical.heating.systemType",
        "mechanical.heating.copHeat",
        "energy.ted.heating"
      ],
      classification: "C",
      section: "S13",
      label: "Heating System Electrical Demand",
      unit: "kWh/yr",
      compute: (inputs) => {
        const systemType = inputs["mechanical.heating.systemType"];
        const copHeat = parseNum(inputs["mechanical.heating.copHeat"], 1);
        const ted = parseNum(inputs["energy.ted.heating"], 0);

        // For heat pump: demand = TED / COPheat
        // For gas/oil: demand = TED (electrical demand is minimal, tracked separately)
        if (systemType === "Heatpump" && copHeat > 0) {
          return +(ted / copHeat).toFixed(4);
        }
        return +ted.toFixed(4);
      }
    },
    {
      id: "mechanical.heating.heatingSink",
      legacyId: "l_113",
      dependencies: [
        "mechanical.heating.systemType",
        "mechanical.heating.demand",
        "mechanical.heating.copHeat"
      ],
      classification: "C",
      section: "S13",
      label: "Heat Pump Heat Sink (Free Energy)",
      unit: "kWh/yr",
      compute: (inputs) => {
        const systemType = inputs["mechanical.heating.systemType"];
        const demand = parseNum(inputs["mechanical.heating.demand"], 0);
        const copHeat = parseNum(inputs["mechanical.heating.copHeat"], 1);

        // Sink = demand × (COP - 1) for heat pumps only
        if (systemType === "Heatpump") {
          return +(demand * (copHeat - 1)).toFixed(4);
        }
        return 0;
      }
    },
    {
      id: "mechanical.heating.fuelImpact",
      legacyId: "d_115",
      dependencies: [
        "mechanical.heating.systemType",
        "mechanical.heating.afue",
        "energy.ted.heating"
      ],
      classification: "C",
      section: "S13",
      label: "Fuel Energy Impact",
      unit: "kWh/yr",
      compute: (inputs) => {
        const systemType = inputs["mechanical.heating.systemType"];
        const afue = parseNum(inputs["mechanical.heating.afue"], 0.9);
        const ted = parseNum(inputs["energy.ted.heating"], 0);

        // Fuel impact = TED / AFUE for gas/oil systems
        if ((systemType === "Gas" || systemType === "Oil") && afue > 0) {
          return +(ted / afue).toFixed(2);
        }
        return 0;
      }
    },
    {
      id: "mechanical.heating.gasConsumption",
      legacyId: "h_115",
      dependencies: ["mechanical.heating.systemType", "mechanical.heating.fuelImpact"],
      classification: "C",
      section: "S13",
      label: "Gas Consumption",
      unit: "m³/yr",
      compute: (inputs) => {
        const systemType = inputs["mechanical.heating.systemType"];
        const fuelImpact = parseNum(inputs["mechanical.heating.fuelImpact"], 0);

        if (systemType === "Gas") {
          // Gas energy content: 10.36 kWh/m³
          return +(fuelImpact / 10.36).toFixed(2);
        }
        return 0;
      }
    },
    {
      id: "mechanical.heating.oilConsumption",
      legacyId: "f_115",
      dependencies: ["mechanical.heating.systemType", "mechanical.heating.fuelImpact"],
      classification: "C",
      section: "S13",
      label: "Oil Consumption",
      unit: "L/yr",
      compute: (inputs) => {
        const systemType = inputs["mechanical.heating.systemType"];
        const fuelImpact = parseNum(inputs["mechanical.heating.fuelImpact"], 0);

        if (systemType === "Oil") {
          // Oil energy content: 10.2 kWh/L
          return +(fuelImpact / 10.2).toFixed(2);
        }
        return 0;
      }
    },

    // ========================================================================
    // SPACE HEATING EMISSIONS
    // ========================================================================
    {
      id: "mechanical.heating.emissions",
      legacyId: "f_114",
      dependencies: [
        "mechanical.heating.systemType",
        "mechanical.heating.oilConsumption",
        "mechanical.heating.gasConsumption",
        "emissions.factor.oil",
        "emissions.factor.gas"
      ],
      classification: "C",
      section: "S13",
      label: "Space Heating Emissions",
      unit: "kg CO2e/yr",
      compute: (inputs) => {
        const systemType = inputs["mechanical.heating.systemType"];
        const oilVolume = parseNum(inputs["mechanical.heating.oilConsumption"], 0);
        const gasVolume = parseNum(inputs["mechanical.heating.gasConsumption"], 0);
        const oilFactor = parseNum(inputs["emissions.factor.oil"], 2753);
        const gasFactor = parseNum(inputs["emissions.factor.gas"], 1921);

        // Parnas table: space-heating-emissions.json
        // Oil systems: (oilVolume × oilFactor) / 1000
        // Gas systems: (gasVolume × gasFactor) / 1000
        // Electric/Heatpump/District: 0 (Scope 2 tracked separately)
        if (systemType === "Oil") {
          return +((oilVolume * oilFactor) / 1000).toFixed(2);
        } else if (systemType === "Gas") {
          return +((gasVolume * gasFactor) / 1000).toFixed(2);
        }
        return 0;
      }
    },

    // ========================================================================
    // COOLING DEMAND
    // ========================================================================
    {
      id: "mechanical.cooling.effectiveCop",
      dependencies: [
        "mechanical.cooling.systemType",
        "mechanical.heating.systemType",
        "mechanical.heating.copCoolDerived",
        "mechanical.cooling.copDedicated"
      ],
      classification: "C",
      section: "S13",
      label: "Effective Cooling COP",
      compute: (inputs) => {
        const coolingType = inputs["mechanical.cooling.systemType"];
        const heatingType = inputs["mechanical.heating.systemType"];
        const copFromHeatpump = parseNum(inputs["mechanical.heating.copCoolDerived"], 1);
        const copDedicated = parseNum(inputs["mechanical.cooling.copDedicated"], 2.66);

        if (coolingType === "No Cooling") return 0;
        if (heatingType === "Heatpump") return copFromHeatpump;
        if (coolingType === "Cooling") return copDedicated;
        return 0;
      }
    },
    {
      id: "mechanical.cooling.electricalDemand",
      legacyId: "d_117",
      dependencies: [
        "mechanical.cooling.systemType",
        "mechanical.cooling.effectiveCop",
        "energy.ced.mitigated"
      ],
      classification: "C",
      section: "S13",
      label: "Cooling Electrical Demand",
      unit: "kWh/yr",
      compute: (inputs) => {
        const coolingType = inputs["mechanical.cooling.systemType"];
        const cop = parseNum(inputs["mechanical.cooling.effectiveCop"], 1);
        const coolingDemand = parseNum(inputs["energy.ced.mitigated"], 0);

        if (coolingType === "No Cooling" || cop === 0) return 0;
        return +(coolingDemand / cop).toFixed(4);
      }
    },
    {
      id: "mechanical.cooling.coolingSink",
      legacyId: "l_116",
      dependencies: [
        "mechanical.cooling.electricalDemand",
        "mechanical.cooling.effectiveCop",
        "mechanical.heating.systemType",
        "mechanical.cooling.systemType"
      ],
      classification: "C",
      section: "S13",
      label: "Cooling Heat Sink (Dedicated)",
      unit: "kWh/yr",
      compute: (inputs) => {
        const heatingType = inputs["mechanical.heating.systemType"] || "";
        const coolingType = inputs["mechanical.cooling.systemType"] || "No Cooling";

        // l_116 is only for dedicated cooling, not heatpump cooling
        // When heating is Heatpump, the sink goes to l_114 instead
        if (heatingType === "Heatpump" || coolingType !== "Cooling") {
          return 0;
        }

        const demand = parseNum(inputs["mechanical.cooling.electricalDemand"], 0);
        const cop = parseNum(inputs["mechanical.cooling.effectiveCop"], 1);

        if (cop > 1) {
          return +(demand * (cop - 1)).toFixed(2);
        }
        return 0;
      }
    },
    {
      id: "mechanical.cooling.intensity",
      legacyId: "f_117",
      dependencies: [
        "mechanical.cooling.electricalDemand",
        "building.conditionedFloorArea"
      ],
      classification: "C",
      section: "S13",
      label: "Cooling Intensity",
      unit: "kWh/m²",
      compute: (inputs) => {
        const demand = parseNum(inputs["mechanical.cooling.electricalDemand"], 0);
        const area = parseNum(inputs["building.conditionedFloorArea"], 5000);

        if (area > 0) {
          return +(demand / area).toFixed(2);
        }
        return 0;
      }
    },

    // ========================================================================
    // VENTILATION
    // ========================================================================
    {
      id: "mechanical.ventilation.rateLs",
      // Note: legacyId "d_120" is mapped in VentilationNodes
      dependencies: [
        "mechanical.ventilation.method",
        "mechanical.ventilation.ach",
        "volume.conditioned"
      ],
      classification: "C",
      section: "S13",
      label: "Ventilation Rate",
      unit: "L/s",
      compute: (inputs) => {
        const method = inputs["mechanical.ventilation.method"];
        const ach = parseNum(inputs["mechanical.ventilation.ach"], 3.0);
        const volume = parseNum(inputs["volume.conditioned"], 8000);

        // Rate = volume × ACH / 3.6 (convert m³/hr to L/s)
        if (method === "Natural" || method === "None") {
          return 0;
        }
        return +((volume * ach) / 3.6).toFixed(2);
      }
    },
    {
      id: "mechanical.ventilation.rateM3h",
      // Note: legacyId "h_120" is mapped in VentilationNodes
      dependencies: ["mechanical.ventilation.rateLs"],
      classification: "C",
      section: "S13",
      label: "Ventilation Rate",
      unit: "m³/h",
      compute: (inputs) => {
        const rateLs = parseNum(inputs["mechanical.ventilation.rateLs"], 0);
        // Convert L/s to m³/h
        return +(rateLs * 3.6).toFixed(2);
      }
    },
    {
      id: "mechanical.ventilation.recoveryFactor",
      dependencies: [
        "mechanical.ventilation.method",
        "mechanical.ventilation.efficiency"
      ],
      classification: "C",
      section: "S13",
      label: "Heat Recovery Factor",
      compute: (inputs) => {
        const method = inputs["mechanical.ventilation.method"];
        const efficiency = parseNum(inputs["mechanical.ventilation.efficiency"], 55);

        // HRV/ERV has recovery, exhaust-only doesn't
        if (method === "HRV" || method === "ERV") {
          return +(efficiency / 100).toFixed(2);
        }
        return 0; // No recovery for exhaust-only
      }
    },
    {
      id: "mechanical.ventilation.heatingEnergyLoss",
      // Note: legacyId "h_121" is mapped in VentilationNodes as energyRecovered
      dependencies: [
        "mechanical.ventilation.rateLs",
        "mechanical.ventilation.recoveryFactor",
        "climate.heating.degreedays"
      ],
      classification: "C",
      section: "S13",
      label: "Ventilation Heating Energy Loss",
      unit: "kWh/yr",
      compute: (inputs) => {
        const hdd = inputs["climate.heating.degreedays"];
        if (isUnavailable(hdd)) return "Unavailable";

        const rateLs = parseNum(inputs["mechanical.ventilation.rateLs"], 0);
        const recovery = parseNum(inputs["mechanical.ventilation.recoveryFactor"], 0);

        // Energy loss = rate × (1 - recovery) × HDD × 24 × 1.2 / 1000
        // 1.2 = volumetric heat capacity of air (kJ/m³·K)
        const effectiveRate = rateLs * (1 - recovery);
        return +((effectiveRate * parseNum(hdd) * 24 * 1.2) / 1000).toFixed(2);
      }
    }
  ];

  // ============================================================================
  // REGISTRATION
  // ============================================================================

  function registerMechanicalNodes(graph) {
    for (const input of MechanicalInputs) {
      graph.registerInput(input);
    }
    for (const node of MechanicalNodes) {
      graph.registerNode(node);
    }
    console.log(
      `[MechanicalNodes] Registered ${MechanicalInputs.length} inputs and ${MechanicalNodes.length} nodes`
    );
  }

  function registerMechanicalFields() {
    const Registry = window.TEUI.FieldRegistry;
    if (!Registry) return;

    for (const input of MechanicalInputs) {
      Registry.register({
        legacyId: input.legacyId,
        semanticPath: input.id,
        classification: input.classification,
        section: input.section,
        label: input.label,
        unit: input.unit,
        defaultValue: input.defaultValue
      });
    }
    for (const node of MechanicalNodes) {
      Registry.register({
        legacyId: node.legacyId,
        semanticPath: node.id,
        classification: node.classification,
        section: node.section,
        label: node.label,
        unit: node.unit
      });
    }
  }

  // ============================================================================
  // EXPORT
  // ============================================================================

  window.TEUI.ComputationNodes.Mechanical = {
    inputs: MechanicalInputs,
    nodes: MechanicalNodes,
    register: registerMechanicalNodes,
    registerFields: registerMechanicalFields
  };

  console.log("[MechanicalNodes] Module loaded");
})();
