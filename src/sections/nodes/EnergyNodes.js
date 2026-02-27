/**
 * EnergyNodes.js - Energy Results Calculation Nodes (TEDI/TEUI)
 *
 * Part of the Multi-Model Architecture refactoring (Phase 2, Task 2.5)
 * See: docs/REFACTORING_PLAN.md
 *
 * This module expresses Section 04/14/15 energy result calculations.
 * Key metrics:
 * - TED (Total Energy Demand for Heating) - d_127
 * - TEDI (Thermal Energy Demand Intensity) - h_127
 * - TEUI (Total Energy Use Intensity) - h_136
 *
 * Formulas derived from Section14.js and Section15.js:
 * - TED (d_127) = i_97 + i_98 + i_103 + m_121 - i_80
 * - TEDI (h_127) = d_127 / h_15
 * - d_135 = m_43 + k_51 + h_70 + d_117 + i_104 + m_121 - i_80
 * - d_136 depends on primary heating type (d_113)
 * - TEUI (h_136) = d_136 / h_15
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  // ============================================================================
  // HELPER
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
  // INPUT NODES (Upstream values needed for energy calculations)
  // ============================================================================

  const EnergyInputs = [
    // NOTE: Most inputs needed for energy calculations are computed by other modules:
    // - m_121 (ventilation heat loss) = ventilation.netHeatLoss from VentilationNodes
    // - k_98 (transmission heat gain) = transmissionLoss.components.subtotalHeatGain from TransmissionLossNodes
    // - k_79 (solar cooling load) = radiantGains.subtotal.coolingGain from RadiantGainsNodes
    // - i_80 (internal gains) = radiantGains.usableGains from RadiantGainsNodes
    // - d_122 (ventilation cooling gain) = ventilation.heatGain from VentilationNodes
    // - d_113, d_114, d_116, d_117 are in MechanicalNodes
    // - m_43 is in RenewableNodes

    // ==== Section 04: Actual Energy Use (User Inputs from Utility Bills) ====
    // Note: h_27, h_28, h_30, h_33 are COMPUTED by legacy Section04.js, not registered here
    {
      id: "energy.actual.electricity",
      legacyId: "d_27",
      defaultValue: 0,
      classification: "C",
      section: "S04",
      label: "Actual Total Electricity Use",
      unit: "kWh/yr"
    },
    {
      id: "energy.actual.gas",
      legacyId: "d_28",
      defaultValue: 0,
      classification: "C",
      section: "S04",
      label: "Actual Total Gas Use",
      unit: "m³/yr"
    },
    {
      id: "energy.actual.oil",
      legacyId: "d_30",
      defaultValue: 0,
      classification: "C",
      section: "S04",
      label: "Actual Total Oil Use",
      unit: "L/yr"
    },
    {
      id: "energy.actual.propane",
      legacyId: "d_33",
      defaultValue: 0,
      classification: "C",
      section: "S04",
      label: "Actual Total Propane Use",
      unit: "L/yr"
    },

    // ==== Section 09: k_71 (internal.coolingLoad.occupants) now computed in InternalGainsNodes ====
    // ==== Section 07: k_51 (energy.dhw.netElectrical) now computed in WaterHeatingNodes as waterHeating.netElectricalDemand ====
    // ==== Section 09: h_70 (energy.plugLoads.subtotal) now computed in InternalGainsNodes ====
  ];

  // ============================================================================
  // COMPUTATION NODES
  // ============================================================================

  const EnergyNodes = [
    // ========================================================================
    // THERMAL ENERGY DEMAND (Section 14)
    // Formula from Section14.js line 1148:
    // d_127 = i_97 + i_98 + i_103 + m_121 - i_80
    // ========================================================================
    {
      id: "energy.ted.heating",
      legacyId: "d_127",
      dependencies: [
        "transmissionLoss.thermalBridgePenalty.heatLoss",
        "transmissionLoss.components.subtotalHeatLoss",
        "airTightness.heatLoss",
        "ventilation.netHeatLoss",
        "radiantGains.usableGains"
      ],
      classification: "C",
      section: "S14",
      label: "Total Energy Demand for Heating (TED)",
      unit: "kWh/yr",
      compute: (inputs) => {
        // TED = i_97 + i_98 + i_103 + m_121 - i_80 (Section14.js line 1148)
        const i97 = parseNum(inputs["transmissionLoss.thermalBridgePenalty.heatLoss"], 0);
        const i98 = parseNum(inputs["transmissionLoss.components.subtotalHeatLoss"], 0);
        const i103 = parseNum(inputs["airTightness.heatLoss"], 0);
        const m121 = parseNum(inputs["ventilation.netHeatLoss"], 0);
        const i80 = parseNum(inputs["radiantGains.usableGains"], 0);

        return +(i97 + i98 + i103 + m121 - i80).toFixed(4);
      }
    },
    {
      id: "energy.tedi",
      legacyId: "h_127",
      dependencies: ["energy.ted.heating", "building.conditionedFloorArea"],
      classification: "C",
      section: "S14",
      label: "Thermal Energy Demand Intensity (TEDI)",
      unit: "kWh/m²/yr",
      compute: (inputs) => {
        // TEDI = d_127 / h_15 (Section14.js line 1152)
        const ted = parseNum(inputs["energy.ted.heating"], 0);
        const area = parseNum(inputs["building.conditionedFloorArea"], 1);

        return area > 0 ? +(ted / area).toFixed(2) : 0;
      }
    },
    {
      id: "energy.ted.envelope",
      legacyId: "d_128",
      dependencies: [
        "transmissionLoss.thermalBridgePenalty.heatLoss",
        "transmissionLoss.components.subtotalHeatLoss",
        "airTightness.heatLoss",
        "radiantGains.usableGains"
      ],
      classification: "C",
      section: "S14",
      label: "TED Envelope Only (no ventilation)",
      unit: "kWh/yr",
      compute: (inputs) => {
        // TED Envelope = i_97 + i_98 + i_103 - i_80 (Section14.js line 1156)
        const i97 = parseNum(inputs["transmissionLoss.thermalBridgePenalty.heatLoss"], 0);
        const i98 = parseNum(inputs["transmissionLoss.components.subtotalHeatLoss"], 0);
        const i103 = parseNum(inputs["airTightness.heatLoss"], 0);
        const i80 = parseNum(inputs["radiantGains.usableGains"], 0);

        return +(i97 + i98 + i103 - i80).toFixed(4);
      }
    },
    {
      id: "energy.tedi.envelope",
      legacyId: "h_128",
      dependencies: ["energy.ted.envelope", "building.conditionedFloorArea"],
      classification: "C",
      section: "S14",
      label: "TEDI Envelope Only",
      unit: "kWh/m²/yr",
      compute: (inputs) => {
        // h_128 = d_128 / h_15 (Section14.js line 1160)
        const ted = parseNum(inputs["energy.ted.envelope"], 0);
        const area = parseNum(inputs["building.conditionedFloorArea"], 1);

        return area > 0 ? +(ted / area).toFixed(2) : 0;
      }
    },

    // ========================================================================
    // COOLING ENERGY DEMAND (Section 14)
    // Formula from Section13.js line 3055-3056 (calculateCEDUnmitigated):
    // d_129 = k_71 + k_79 + k_97 + k_104 + k_103 + d_122
    // Note: Section14.js line 1164 has an older formula (k_98 instead of k_97+k_104)
    //       Section13.js is the authoritative source as it publishes to StateManager
    // ========================================================================
    {
      id: "energy.ced.unmitigated",
      legacyId: "d_129",
      dependencies: [
        "internal.coolingLoad.occupants",
        "radiantGains.subtotal.coolingGain",
        "transmissionLoss.thermalBridgePenalty.heatGain",
        "envelope.total.heatGain",
        "airTightness.heatGain",
        "ventilation.heatGain"
      ],
      classification: "C",
      section: "S14",
      label: "Cooling Energy Demand Unmitigated",
      unit: "kWh/yr",
      compute: (inputs) => {
        // CED = k_71 + k_79 + k_97 + k_104 + k_103 + d_122 (Section13.js line 3056)
        // k_71 = occupant cooling load
        // k_79 = radiant gains cooling
        // k_97 = thermal bridge penalty heat gain
        // k_104 = envelope total heat gain (capacitance conditional)
        // k_103 = air tightness heat gain
        // d_122 = ventilation heat gain
        const k71 = parseNum(inputs["internal.coolingLoad.occupants"], 0);
        const k79 = parseNum(inputs["radiantGains.subtotal.coolingGain"], 0);
        const k97 = parseNum(inputs["transmissionLoss.thermalBridgePenalty.heatGain"], 0);
        const k104 = parseNum(inputs["envelope.total.heatGain"], 0);
        const k103 = parseNum(inputs["airTightness.heatGain"], 0);
        const d122 = parseNum(inputs["ventilation.heatGain"], 0);

        return +(k71 + k79 + k97 + k104 + k103 + d122).toFixed(4);
      }
    },
    {
      id: "energy.cedi.unmitigated",
      legacyId: "h_129",
      dependencies: ["energy.ced.unmitigated", "building.conditionedFloorArea"],
      classification: "C",
      section: "S14",
      label: "Cooling Energy Demand Intensity (Unmitigated)",
      unit: "kWh/m²/yr",
      compute: (inputs) => {
        // h_129 = d_129 / h_15 (Section14.js line 1167-1168)
        const ced = parseNum(inputs["energy.ced.unmitigated"], 0);
        const area = parseNum(inputs["building.conditionedFloorArea"], 1);

        return area > 0 ? +(ced / area).toFixed(2) : 0;
      }
    },
    {
      id: "energy.ced.mitigated",
      legacyId: "m_129",
      dependencies: [
        "energy.ced.unmitigated",
        "cooling.freeCoolingLimit",
        "ventilation.energyRecoveredCooling"
      ],
      classification: "C",
      section: "S14",
      label: "Cooling Energy Demand Mitigated",
      unit: "kWh/yr",
      compute: (inputs) => {
        // m_129 = MAX(0, d_129 - h_124 - d_123) per Section13.js line 3078
        const d129 = parseNum(inputs["energy.ced.unmitigated"], 0);
        const h124 = parseNum(inputs["cooling.freeCoolingLimit"], 0);
        const d123 = parseNum(inputs["ventilation.energyRecoveredCooling"], 0);

        return Math.max(0, d129 - h124 - d123);
      }
    },

    // ========================================================================
    // TOTAL ENERGY USE (Section 15)
    // Formula from Section15.js lines 1749-1778:
    // d_135 = m_43 + k_51 + h_70 + d_117_effective + i_104 + m_121 - i_80
    // d_136 depends on d_113 (primary heating type):
    //   - "Electricity": d_136 = d_135
    //   - "Heatpump": d_136 = k_51 + d_117 + d_114 + m_43 + h_70
    //   - "Gas"/"Oil": d_136 = k_51 + d_117 + m_43 + h_70
    // h_136 = d_136 / h_15
    // ========================================================================
    {
      id: "energy.total.targeted",
      legacyId: "d_135",
      dependencies: [
        "renewable.exteriorLoads",
        "waterHeating.netElectricalDemand",
        "energy.plugLoads.subtotal",
        "mechanical.cooling.electricalDemand",
        "mechanical.cooling.systemType",
        "envelope.total.heatLoss",
        "ventilation.netHeatLoss",
        "radiantGains.usableGains"
      ],
      classification: "C",
      section: "S15",
      label: "TEU Targeted Electricity",
      unit: "kWh/yr",
      compute: (inputs) => {
        // d_135 = m_43 + k_51 + h_70 + d_117 + i_104 + m_121 - i_80
        // Note: d_117_effective = 0 if d_116 = "No Cooling"
        const m43 = parseNum(inputs["renewable.exteriorLoads"], 0);
        const k51 = parseNum(inputs["waterHeating.netElectricalDemand"], 0);
        const h70 = parseNum(inputs["energy.plugLoads.subtotal"], 0);
        const coolingType = inputs["mechanical.cooling.systemType"] || "No Cooling";
        const d117 = coolingType === "No Cooling" ? 0 : parseNum(inputs["mechanical.cooling.electricalDemand"], 0);
        const i104 = parseNum(inputs["envelope.total.heatLoss"], 0);
        const m121 = parseNum(inputs["ventilation.netHeatLoss"], 0);
        const i80 = parseNum(inputs["radiantGains.usableGains"], 0);

        return +(m43 + k51 + h70 + d117 + i104 + m121 - i80).toFixed(4);
      }
    },
    {
      id: "energy.total.all",
      legacyId: "d_136",
      dependencies: [
        "energy.total.targeted",
        "mechanical.heating.systemType",
        "mechanical.heating.demand",
        "mechanical.cooling.systemType",
        "mechanical.cooling.electricalDemand",
        "renewable.exteriorLoads",
        "waterHeating.netElectricalDemand",
        "energy.plugLoads.subtotal"
      ],
      classification: "C",
      section: "S15",
      label: "TEU Targeted Electricity if HP/Gas/Oil Bldg",
      unit: "kWh/yr",
      compute: (inputs) => {
        // d_136 formula from Section15.js lines 1761-1769
        const primaryHeating = inputs["mechanical.heating.systemType"] || "Electricity";
        const d135 = parseNum(inputs["energy.total.targeted"], 0);
        const k51 = parseNum(inputs["waterHeating.netElectricalDemand"], 0);
        const coolingType = inputs["mechanical.cooling.systemType"] || "No Cooling";
        const d117 = coolingType === "No Cooling" ? 0 : parseNum(inputs["mechanical.cooling.electricalDemand"], 0);
        const d114 = parseNum(inputs["mechanical.heating.demand"], 0);
        const m43 = parseNum(inputs["renewable.exteriorLoads"], 0);
        const h70 = parseNum(inputs["energy.plugLoads.subtotal"], 0);

        if (primaryHeating === "Electricity") {
          return d135;
        } else if (primaryHeating === "Heatpump") {
          return +(k51 + d117 + d114 + m43 + h70).toFixed(4);
        } else {
          // Gas or Oil - sum electrical loads only, exclude heating demand
          return +(k51 + d117 + m43 + h70).toFixed(4);
        }
      }
    },
    {
      id: "energy.teui",
      legacyId: "h_136",
      dependencies: ["energy.total.all", "building.conditionedFloorArea"],
      classification: "C",
      section: "S15",
      label: "Total Energy Use Intensity (TEUI)",
      unit: "kWh/m²/yr",
      compute: (inputs) => {
        // h_136 = d_136 / h_15 (Section15.js line 1777)
        const total = parseNum(inputs["energy.total.all"], 0);
        const area = parseNum(inputs["building.conditionedFloorArea"], 1);

        return area > 0 ? +(total / area).toFixed(2) : 0;
      }
    }
  ];

  // ============================================================================
  // REGISTRATION
  // ============================================================================

  function registerEnergyNodes(graph) {
    for (const input of EnergyInputs) {
      graph.registerInput(input);
    }
    for (const node of EnergyNodes) {
      graph.registerNode(node);
    }
    console.log(
      `[EnergyNodes] Registered ${EnergyInputs.length} inputs and ${EnergyNodes.length} nodes`
    );
  }

  function registerEnergyFields() {
    const Registry = window.TEUI.FieldRegistry;
    if (!Registry) return;

    for (const input of EnergyInputs) {
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
    for (const node of EnergyNodes) {
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

  window.TEUI.ComputationNodes.Energy = {
    inputs: EnergyInputs,
    nodes: EnergyNodes,
    register: registerEnergyNodes,
    registerFields: registerEnergyFields
  };

  console.log("[EnergyNodes] Module loaded");
})();
