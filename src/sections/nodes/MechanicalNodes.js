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
  // THE COOLING CHOICE (M.3.0, d_116) - one source for the nodes, Section 13
  // and the file import (window.TEUI.CoolingSystem)
  // ============================================================================
  //
  // Andy 2026-11-18: three options - the heat pump heats AND cools (its COPcool
  // derived from HSPF, M.1.3), a separate cooling unit (its own COPcool, M.3.3,
  // which can sit beside a heat pump that only heats), or no cooling. The heat
  // pump option is offered only when M.1.0 is Heatpump.
  //
  // Files before 2026-11-18 store "Cooling": on a heat pump that meant the heat
  // pump cools (M.3.3 locked), otherwise a dedicated unit - normalize() reads it
  // that way, so every old file computes as it did.
  const COOLING = {
    HEATPUMP: "Heatpump Heats & Cools",
    SEPARATE: "Separate Cooling",
    NONE: "No Cooling",
    LEGACY: "Cooling",
  };

  function normalizeCooling(coolingType, heatingType) {
    const isHP = heatingType === "Heatpump";
    if (coolingType === COOLING.NONE) return COOLING.NONE;
    if (coolingType === COOLING.SEPARATE) return COOLING.SEPARATE;
    // The heat pump option, the legacy "Cooling", or unset (the default):
    // the heat pump cools if there is one, otherwise a separate unit.
    return isHP ? COOLING.HEATPUMP : COOLING.SEPARATE;
  }

  window.TEUI.CoolingSystem = Object.freeze({
    ...COOLING,
    normalize: normalizeCooling,
  });

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
      defaultValue: COOLING.HEATPUMP,
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
    // Which model this is - true only in the Reference model, set by
    // ComputationIntegration.populateReferenceModel. No legacyId: never a
    // field, never in a file.
    {
      id: "model.isReference",
      defaultValue: false,
      classification: "C",
      section: "S13",
      label: "Reference Model"
    },
    // The selected standard's minimum COPc (ReferenceValues j_116), set on the
    // Reference model by populateReferenceModel - read, not j_116, because the
    // CSV import SKIPS ref_j_116 for a heat pump and the previous project's
    // value stays behind (03's 0.00 reached 04-10 on 2026-10-31).
    {
      id: "model.referenceCopCool",
      defaultValue: null,
      classification: "C",
      section: "S13",
      label: "Reference Standard Minimum COPc"
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
      id: "mechanical.ventilation.recoveryType",
      legacyId: "e_118",
      defaultValue: "HRV",
      classification: "C",
      section: "S13",
      label: "Heat Recovery Type (HRV / ERV)"
    },
    {
      id: "mechanical.ventilation.ervLatentEfficiency",
      legacyId: "l_122",
      defaultValue: 0,
      classification: "C",
      section: "S13",
      label: "ERV Latent Recovery Efficiency",
      unit: "%"
    },
    {
      // F280 Cl. 6.2.7's ATRE: the HRV/ERV's adjusted total recovery efficiency from CAN/CSA-C439's
      // cooling test, "or zero if there is no ATRE reported" (Andy 2026-11-19)
      id: "mechanical.ventilation.atre",
      legacyId: "l_123",
      defaultValue: 0,
      classification: "C",
      section: "S13",
      label: "ATRE, Adjusted Total Recovery Efficiency (F280 Cl. 6.2.7)",
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
        "mechanical.cooling.copDedicated",
        "model.isReference",
        "model.referenceCopCool"
      ],
      classification: "C",
      section: "S13",
      label: "Effective Cooling COP",
      // Andy 2026-10-31: "Reference COP is just the minimum whatever reference
      // standard tells us it must be, in Reference mode only. In target mode,
      // HSPF can determine the COPc for a shared Heating/Cooling system, or if
      // gas or another heating system is selected (Non-heat-pump) then a user
      // can set whatever COPc matches the equipment's nameplate efficiency."
      // No cooling: 0 - the load stands, unmet. The heat pump heats and cools:
      // Target at its COPc from HSPF (M.1.3); Reference at ITS M.3.3, which
      // holds the standard's minimum by default (ReferenceValues j_116) and
      // takes a value typed on the Reference or mirrored from the Target (Andy
      // 2026-11-19, "Yes": a default, not a lock - it returned the standard's
      // minimum whatever was set; model.referenceCopCool remains the fallback
      // when the Reference has no M.3.3 at all). Separate cooling (Andy 2026-11-18):
      // M.3.3, the unit's own COPc, in either model and beside any heating -
      // a heat pump that only heats keeps its HSPF for heating alone.
      compute: (inputs) => {
        const heatingType = inputs["mechanical.heating.systemType"];
        const coolingType = normalizeCooling(inputs["mechanical.cooling.systemType"], heatingType);
        const copFromHeatpump = parseNum(inputs["mechanical.heating.copCoolDerived"], 1);
        const copDedicated = parseNum(inputs["mechanical.cooling.copDedicated"], 2.66);
        const isReference = inputs["model.isReference"] === true;
        const copStandard = parseNum(inputs["model.referenceCopCool"], 0);

        if (coolingType === COOLING.NONE) return 0;
        if (coolingType === COOLING.HEATPUMP) {
          if (isReference) {
            const copReference = parseNum(inputs["mechanical.cooling.copDedicated"], 0);
            if (copReference > 0) return copReference;
            if (copStandard > 0) return copStandard;
          }
          return copFromHeatpump;
        }
        return copDedicated;
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
        const coolingType = normalizeCooling(inputs["mechanical.cooling.systemType"], heatingType);

        // M.3.4: the separate unit's sink only. When the heat pump cools, its
        // sink is M.1.6 (l_114).
        if (coolingType !== COOLING.SEPARATE) {
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
    },

    // ========================================================================
    // S13 UNIT CONVERSIONS + DISPLAY FIELDS
    // ========================================================================

    // f_119: Per-person ventilation rate in CFM
    {
      id: "mechanical.ventilation.perPersonCfm",
      legacyId: "f_119",
      dependencies: ["mechanical.ventilation.ratePerPerson"],
      classification: "C",
      section: "S13",
      label: "Per-Person Ventilation Rate (CFM)",
      compute: (inputs) => {
        const ls = parseNum(inputs["mechanical.ventilation.ratePerPerson"], 10);
        return +(ls * 2.11888).toFixed(2);
      }
    },

    // h_119: Per-person ventilation rate in m³/h
    {
      id: "mechanical.ventilation.perPersonM3h",
      legacyId: "h_119",
      dependencies: ["mechanical.ventilation.ratePerPerson"],
      classification: "C",
      section: "S13",
      label: "Per-Person Ventilation Rate (m³/h)",
      compute: (inputs) => {
        const ls = parseNum(inputs["mechanical.ventilation.ratePerPerson"], 10);
        return +(ls * 3.6).toFixed(2);
      }
    },

    // f_120: Volumetric ventilation rate in CFM
    {
      id: "mechanical.ventilation.volumetricCfm",
      legacyId: "f_120",
      dependencies: ["mechanical.ventilation.rateLs"],
      classification: "C",
      section: "S13",
      label: "Volumetric Ventilation Rate (CFM)",
      compute: (inputs) => {
        const ls = parseNum(inputs["mechanical.ventilation.rateLs"], 0);
        return +(ls * 2.11888).toFixed(2);
      }
    },

    // j_114 (M.1.5): the heat pump's own CEER = 3.412 × M.1.3 COPcool, whatever
    // the cooling choice. It read "mechanical.cooling.cop", which no node or
    // input defines, so it showed 3.412 × the 2.66 fallback at every HSPF.
    {
      id: "mechanical.heating.ceer",
      legacyId: "j_114",
      dependencies: ["mechanical.heating.copCoolDerived"],
      classification: "C",
      section: "S13",
      label: "CEER (Heat Pump)",
      compute: (inputs) => {
        const cop = parseNum(inputs["mechanical.heating.copCoolDerived"], 1);
        return +(3.412 * cop).toFixed(2);
      }
    },

    // j_117 (M.3.6): the CEER of the cooling in effect = 3.412 × the COP the
    // model cools at - M.1.3 when the heat pump cools, M.3.3 for a separate
    // unit, 0 with no cooling.
    {
      id: "mechanical.cooling.ceer",
      legacyId: "j_117",
      dependencies: ["mechanical.cooling.effectiveCop"],
      classification: "C",
      section: "S13",
      label: "Cooling System CEER",
      compute: (inputs) => {
        const cop = parseNum(inputs["mechanical.cooling.effectiveCop"], 0);
        return +(3.412 * cop).toFixed(2);
      }
    },

    // l_114 (M.1.6): the heat pump's cooling sink, only when the heat pump
    // cools = cooling electricity × (the COP it cools at − 1). It read
    // "mechanical.cooling.cop", which nothing defines: it moved with HSPF
    // only through the electricity, always × (2.66 − 1) - 94,351 kWh at HSPF
    // 7.1 where 4,598 is right.
    {
      id: "mechanical.cooling.sinkEnergy",
      legacyId: "l_114",
      dependencies: [
        "mechanical.cooling.electricalDemand",
        "mechanical.cooling.effectiveCop",
        "mechanical.heating.systemType",
        "mechanical.cooling.systemType"
      ],
      classification: "C",
      section: "S13",
      label: "Cooling Sink Energy (kWh/yr)",
      compute: (inputs) => {
        const coolingType = normalizeCooling(
          inputs["mechanical.cooling.systemType"],
          inputs["mechanical.heating.systemType"]
        );
        if (coolingType !== COOLING.HEATPUMP) return 0;
        const cooling = parseNum(inputs["mechanical.cooling.electricalDemand"], 0);
        const cop = parseNum(inputs["mechanical.cooling.effectiveCop"], 1);
        return cop > 1 ? cooling * (cop - 1) : 0;
      }
    },

    // l_115: Heating exhaust energy (gas/oil only)
    {
      id: "mechanical.heating.exhaustEnergy",
      legacyId: "l_115",
      dependencies: ["mechanical.heating.fuelImpact", "mechanical.heating.demand", "mechanical.heating.systemType"],
      classification: "C",
      section: "S13",
      label: "Heating Exhaust Energy (kWh/yr)",
      compute: (inputs) => {
        const system = inputs["mechanical.heating.systemType"] || "Heatpump";
        if (system !== "Gas" && system !== "Oil") return 0;
        const fuelImpact = parseNum(inputs["mechanical.heating.fuelImpact"], 0);
        const demand = parseNum(inputs["mechanical.heating.demand"], 0);
        return fuelImpact - demand;
      }
    },

    // h_122: Latent Load Factor (display echo of cooling.latentLoadFactor)
    {
      id: "mechanical.cooling.latentLoadDisplay",
      legacyId: "h_122",
      dependencies: ["cooling.latentLoadFactor"],
      classification: "C",
      section: "S13",
      label: "Latent Load Factor (%)",
      compute: (inputs) => {
        const llf = parseNum(inputs["cooling.latentLoadFactor"], 1.0);
        return llf;
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
      if (!input.legacyId) continue; // model.*: not fields
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
