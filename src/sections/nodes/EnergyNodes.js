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

    // ==== Section 04: Raw Energy Use from Utility Bills (d_27, d_28, d_30) ====
    // These are raw user inputs. The "actual" values (f_27..f_31) are computed
    // in EmissionsNodes from these raw inputs + unit conversions + renewables.
    {
      id: "energy.raw.electricity",
      legacyId: "d_27",
      defaultValue: 0,
      classification: "C",
      section: "S04",
      label: "Raw Electricity from Bills",
      unit: "kWh/yr"
    },
    {
      id: "energy.raw.gas",
      legacyId: "d_28",
      defaultValue: 0,
      classification: "C",
      section: "S04",
      label: "Raw Gas from Bills",
      unit: "m³/yr"
    },
    {
      id: "energy.raw.oil",
      legacyId: "d_30",
      defaultValue: 0,
      classification: "C",
      section: "S04",
      label: "Raw Oil from Bills",
      unit: "L/yr"
    },

    // ==== Section 09: k_71 (internal.coolingLoad.occupants) now computed in InternalGainsNodes ====
    // ==== Section 07: k_51 (energy.dhw.netElectrical) now computed in WaterHeatingNodes as waterHeating.netElectricalDemand ====
    // ==== Section 09: h_70 (energy.plugLoads.subtotal) now computed in InternalGainsNodes ====

    // ==== Section 15: Heatpump Cost Premium (user-editable) ====
    {
      id: "energy.cost.heatpumpPremium",
      legacyId: "d_142",
      defaultValue: 30000,
      classification: "G",
      section: "S15",
      label: "Heatpump Cost Premium ($)",
    },
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
    },

    // ========================================================================
    // S14: ADDITIONAL DISPLAY FIELDS
    // ========================================================================

    // d_130: CEDI Cooling Load (W/m²) = (d_129 / 8760 × 1000) / h_15
    {
      id: "energy.cedi.loadWm2",
      legacyId: "d_130",
      dependencies: ["energy.ced.unmitigated", "building.conditionedFloorArea"],
      classification: "C",
      section: "S14",
      label: "CEDI Load (W/m²)",
      compute: (inputs) => {
        const d129 = parseNum(inputs["energy.ced.unmitigated"], 0);
        const area = parseNum(inputs["building.conditionedFloorArea"], 1);
        return area > 0 ? (d129 / 8760 * 1000) / area : 0;
      }
    },

    // d_131: TEL (Total Envelope Heat Loss) = i_97 + i_98 + i_103
    {
      id: "energy.tel.heatloss",
      legacyId: "d_131",
      dependencies: [
        "transmissionLoss.thermalBridgePenalty.heatLoss",
        "transmissionLoss.components.subtotalHeatLoss",
        "airTightness.heatLoss"
      ],
      classification: "C",
      section: "S14",
      label: "Total Envelope Heat Loss (TEL)",
      unit: "kWh/yr",
      compute: (inputs) => {
        const i97 = parseNum(inputs["transmissionLoss.thermalBridgePenalty.heatLoss"], 0);
        const i98 = parseNum(inputs["transmissionLoss.components.subtotalHeatLoss"], 0);
        const i103 = parseNum(inputs["airTightness.heatLoss"], 0);
        return i97 + i98 + i103;
      }
    },

    // d_132: CEG (Total Envelope Heat Gain) = k_97 + k_98 + k_103
    {
      id: "energy.ceg.heatgain",
      legacyId: "d_132",
      dependencies: [
        "transmissionLoss.thermalBridgePenalty.heatGain",
        "transmissionLoss.components.subtotalHeatGain",
        "airTightness.heatGain"
      ],
      classification: "C",
      section: "S14",
      label: "Total Envelope Heat Gain (CEG)",
      unit: "kWh/yr",
      compute: (inputs) => {
        const k97 = parseNum(inputs["transmissionLoss.thermalBridgePenalty.heatGain"], 0);
        const k98 = parseNum(inputs["transmissionLoss.components.subtotalHeatGain"], 0);
        const k103 = parseNum(inputs["airTightness.heatGain"], 0);
        return k97 + k98 + k103;
      }
    },

    // h_130: CEDI Mitigated (W/m²) = (m_129 / 8760 × 1000) / h_15
    {
      id: "energy.cedi.mitigatedWm2",
      legacyId: "h_130",
      dependencies: ["energy.ced.mitigated", "building.conditionedFloorArea"],
      classification: "C",
      section: "S14",
      label: "CEDI Mitigated (W/m²)",
      compute: (inputs) => {
        const m129 = parseNum(inputs["energy.ced.mitigated"], 0);
        const area = parseNum(inputs["building.conditionedFloorArea"], 1);
        return area > 0 ? (m129 / 8760 * 1000) / area : 0;
      }
    },

    // h_131: TELI (Heatloss Intensity) = d_131 / h_15
    {
      id: "energy.teli.intensity",
      legacyId: "h_131",
      dependencies: ["energy.tel.heatloss", "building.conditionedFloorArea"],
      classification: "C",
      section: "S14",
      label: "TELI (kWh/m²/yr)",
      compute: (inputs) => {
        const tel = parseNum(inputs["energy.tel.heatloss"], 0);
        const area = parseNum(inputs["building.conditionedFloorArea"], 1);
        return area > 0 ? tel / area : 0;
      }
    },

    // h_132: CEGI (Heat Gain Intensity) = d_132 / h_15
    {
      id: "energy.cegi.intensity",
      legacyId: "h_132",
      dependencies: ["energy.ceg.heatgain", "building.conditionedFloorArea"],
      classification: "C",
      section: "S14",
      label: "CEGI (kWh/m²/yr)",
      compute: (inputs) => {
        const ceg = parseNum(inputs["energy.ceg.heatgain"], 0);
        const area = parseNum(inputs["building.conditionedFloorArea"], 1);
        return area > 0 ? ceg / area : 0;
      }
    },

    // m_131: TELI/TEDI Ratio (cost pro-rating)
    {
      id: "energy.teli.tediRatio",
      legacyId: "m_131",
      dependencies: ["energy.teli.intensity", "energy.tedi"],
      classification: "C",
      section: "S14",
      label: "TELI/TEDI Ratio",
      compute: (inputs) => {
        const teli = parseNum(inputs["energy.teli.intensity"], 0);
        const tedi = parseNum(inputs["energy.tedi"], 0);
        return tedi > 0 ? teli / tedi : 0;
      }
    },

    // ========================================================================
    // S15: PEAK LOADS + COSTS + TEUI COMPARISON
    // ========================================================================

    // d_137: Peak Heating Load (Enclosure Only)
    //   = (G101×D101 × (H23−D23) + D102×G102 × (H23−10)) / 1000
    // Ground-facing surfaces see the ground at 10 °C, as the annual method does (climate.groundFacing.hdd);
    // they used to take the outdoor design temperature, as if a slab sat in January air (Andy 2026-11-18).
    // F280 Mode On, BASESIMP (Andy 2026-11-19): the ground-facing term is instead the foundation's January
    // design load by CSA F280-12 Cl. 5.2.2.1 (ground.basesimp, BasementHLR.xls's Loads!B49), which
    // covers the whole below-grade wall (its above-grade strip included) and the slab - S11 rows 94-95,
    // the same surfaces as D102. When BASESIMP cannot run (a missing input), so does this: Unavailable.
    {
      id: "energy.peakHeating.enclosureKw",
      legacyId: "d_137",
      dependencies: [
        "envelope.airFacing.uValue",
        "envelope.airFacing.area",
        "envelope.groundFacing.uValue",
        "envelope.groundFacing.area",
        "climate.heating.obcSetpoint", // the DESIGN set-point (sizing), not the energy one
        "climate.temperature.coldest",
        "ground.methodInEffect",
        "ground.basesimp"
      ],
      classification: "C",
      section: "S15",
      label: "Peak Heating Load - Enclosure Only (kW)",
      compute: (inputs) => {
        const g101 = parseNum(inputs["envelope.airFacing.uValue"], 0);
        const d101 = parseNum(inputs["envelope.airFacing.area"], 0);
        const g102 = parseNum(inputs["envelope.groundFacing.uValue"], 0);
        const d102 = parseNum(inputs["envelope.groundFacing.area"], 0);
        const setpoint = parseNum(inputs["climate.heating.obcSetpoint"], 22);
        const coldest = parseNum(inputs["climate.temperature.coldest"], -22);
        const groundTemp = 10; // OBJECTIVE's ground (ClimateNodes, TransmissionLossNodes, VolumeMetricsNodes)
        const airDeltaT = Math.max(0, setpoint - coldest);
        const air = g101 * d101 * airDeltaT;
        if (inputs["ground.methodInEffect"] === "BASESIMP") {
          const bs = inputs["ground.basesimp"];
          if (!bs || bs.error) return "Unavailable";
          return (air + bs.heatingLoad) / 1000;
        }
        const groundDeltaT = Math.max(0, setpoint - groundTemp);
        return (air + d102 * g102 * groundDeltaT) / 1000;
      }
    },

    // d_138: Peak Cooling Load (Enclosure Only)
    //   = (G101×D101 × (D24−H24) + D102×G102 × MAX(0, 10−H24)) / 1000
    // Ground-facing surfaces see the ground at 10 °C, below the cooling setpoint: no gain at the design
    // hour, and no credit either - a credit would undersize the cooling (Andy: over, never under; F280
    // takes no below-grade gain). They used to take the outdoor design temperature, a gain.
    {
      id: "energy.peakCooling.enclosureKw",
      legacyId: "d_138",
      dependencies: [
        "envelope.airFacing.uValue",
        "envelope.airFacing.area",
        "envelope.groundFacing.uValue",
        "envelope.groundFacing.area",
        "climate.temperature.hottest",
        "climate.cooling.setpoint"
      ],
      classification: "C",
      section: "S15",
      label: "Peak Cooling Load - Enclosure Only (kW)",
      compute: (inputs) => {
        const g101 = parseNum(inputs["envelope.airFacing.uValue"], 0);
        const d101 = parseNum(inputs["envelope.airFacing.area"], 0);
        const g102 = parseNum(inputs["envelope.groundFacing.uValue"], 0);
        const d102 = parseNum(inputs["envelope.groundFacing.area"], 0);
        const hottest = parseNum(inputs["climate.temperature.hottest"], 34);
        const coolSetpoint = parseNum(inputs["climate.cooling.setpoint"], 24);
        const groundTemp = 10; // OBJECTIVE's ground, as above
        const airDeltaT = Math.max(0, hottest - coolSetpoint);
        const groundDeltaT = Math.max(0, groundTemp - coolSetpoint);
        return (g101 * d101 * airDeltaT + d102 * g102 * groundDeltaT) / 1000;
      }
    },

    // d_139: Peak Cooling Load (Enclosure + Gains)
    // = d_138 (the enclosure, ground-facing at 10 °C) + (D65+D66+D67)×H15 / 1000
    //   + (K79 + D122 + K64) / (M19×24)
    // Free cooling (h_124) is no longer subtracted (Andy 2026-10-30): at the
    // design hour there is none. The peak is SENSIBLE: D122 and K64 carry
    // the annual latent load (F280 Annex B), taken back out here - the
    // latent enters the sizing once, at F280's design conditions
    // (cooling.latentLoadFactor).
    {
      id: "energy.peakCooling.totalKw",
      legacyId: "d_139",
      dependencies: [
        "energy.peakCooling.enclosureKw",
        "internal.plugLoadDensity",
        "internal.lightingDensity",
        "internal.equipmentDensity",
        "building.conditionedFloorArea",
        "radiantGains.subtotal.coolingGain",
        "ventilation.heatGain",
        "internal.occupants.coolingGain",
        "cooling.iso52016",
        "climate.coolingDays"
      ],
      classification: "C",
      section: "S15",
      label: "Peak Cooling Load - Enclosure + Gains (kW)",
      compute: (inputs) => {
        // Enclosure cooling in kW (already computed)
        const enclosureKw = parseNum(inputs["energy.peakCooling.enclosureKw"], 0);
        // Internal gains density (W/m²) × area → kW
        const d65 = parseNum(inputs["internal.plugLoadDensity"], 0);
        const d66 = parseNum(inputs["internal.lightingDensity"], 0);
        const d67 = parseNum(inputs["internal.equipmentDensity"], 0);
        const area = parseNum(inputs["building.conditionedFloorArea"], 1);
        const internalGainsKw = (d65 + d66 + d67) * area / 1000;
        // Annual kWh gains → average kW during cooling season
        const k79 = parseNum(inputs["radiantGains.subtotal.coolingGain"], 0);
        const latent = inputs["cooling.iso52016"]?.latent;
        const d122 = parseNum(inputs["ventilation.heatGain"], 0) - (latent?.vent ?? 0);
        const k64 = parseNum(inputs["internal.occupants.coolingGain"], 0) - (latent?.people ?? 0);
        const coolingDays = parseNum(inputs["climate.coolingDays"], 120);
        let result = enclosureKw + internalGainsKw;
        if (coolingDays > 0) {
          result += (k79 + d122 + k64) / (coolingDays * 24);
        }
        return result;
      }
    },

    // d_140: Maximum Heating Load Intensity = (d_137 × 1000) / h_15
    {
      id: "energy.peakHeating.intensity",
      legacyId: "d_140",
      dependencies: ["energy.peakHeating.enclosureKw", "building.conditionedFloorArea"],
      classification: "C",
      section: "S15",
      label: "Peak Heating Load Intensity (W/m²)",
      compute: (inputs) => {
        const d137 = parseNum(inputs["energy.peakHeating.enclosureKw"], 0);
        const area = parseNum(inputs["building.conditionedFloorArea"], 1);
        return area > 0 ? (d137 * 1000) / area : 0;
      }
    },

    // d_141: Annual Electricity Cost (Pre-HP) = d_135 × l_12
    {
      id: "energy.cost.preHP",
      legacyId: "d_141",
      dependencies: ["energy.total.targeted", "energy.price.electricity"],
      classification: "C",
      section: "S15",
      label: "Annual Electricity Cost (Pre-HP)",
      unit: "$/yr",
      compute: (inputs) => {
        const d135 = parseNum(inputs["energy.total.targeted"], 0);
        const price = parseNum(inputs["energy.price.electricity"], 0);
        return d135 * price;
      }
    },

    // d_142: Heatpump Cost Premium — now an input (moved to EnergyInputs)

    // d_143: Reference TEUI = e_10
    {
      id: "energy.reference.teui",
      legacyId: "d_143",
      dependencies: ["keyValues.reference.teui"],
      classification: "C",
      section: "S15",
      label: "Reference TEUI",
      compute: (inputs) => parseNum(inputs["keyValues.reference.teui"], 0),
    },

    // d_144: TEUI Reduction % = 1 - (h_143 / d_143)
    {
      id: "energy.teui.reductionPercent",
      legacyId: "d_144",
      dependencies: ["teuiSummary.target.teui", "energy.reference.teui"],
      classification: "C",
      section: "S15",
      label: "TEUI Reduction (%)",
      compute: (inputs) => {
        const target = parseNum(inputs["teuiSummary.target.teui"], 0);
        const ref = parseNum(inputs["energy.reference.teui"], 0);
        return ref > 0 ? 1 - (target / ref) : 0;
      }
    },

    // h_138: Peak Cooling Load (Tons) = d_138 × 0.2843451361
    {
      id: "energy.peakCooling.tons",
      legacyId: "h_138",
      dependencies: ["energy.peakCooling.enclosureKw"],
      classification: "C",
      section: "S15",
      label: "Peak Cooling Load (Tons)",
      compute: (inputs) => {
        const d138 = parseNum(inputs["energy.peakCooling.enclosureKw"], 0);
        return d138 * 0.2843451361;
      }
    },

    // h_139: Peak Cooling Load with Gains (Tons)
    {
      id: "energy.peakCoolingGains.tons",
      legacyId: "h_139",
      dependencies: ["energy.peakCooling.totalKw"],
      classification: "C",
      section: "S15",
      label: "Peak Cooling with Gains (Tons)",
      compute: (inputs) => {
        const d139 = parseNum(inputs["energy.peakCooling.totalKw"], 0);
        return d139 * 0.2843451361;
      }
    },

    // h_140: Maximum Cooling Load Intensity = (d_138 × 1000) / h_15
    {
      id: "energy.peakCooling.intensity",
      legacyId: "h_140",
      dependencies: ["energy.peakCooling.enclosureKw", "building.conditionedFloorArea"],
      classification: "C",
      section: "S15",
      label: "Peak Cooling Load Intensity (W/m²)",
      compute: (inputs) => {
        const d138 = parseNum(inputs["energy.peakCooling.enclosureKw"], 0);
        const area = parseNum(inputs["building.conditionedFloorArea"], 1);
        return area > 0 ? (d138 * 1000) / area : 0;
      }
    },

    // h_141: Annual Electricity Cost (Post-HP) = d_136 × l_12
    {
      id: "energy.cost.postHP",
      legacyId: "h_141",
      dependencies: ["energy.total.all", "energy.price.electricity"],
      classification: "C",
      section: "S15",
      label: "Annual Electricity Cost (Post-HP)",
      unit: "$/yr",
      compute: (inputs) => {
        const d136 = parseNum(inputs["energy.total.all"], 0);
        const price = parseNum(inputs["energy.price.electricity"], 0);
        return d136 * price;
      }
    },

    // h_142: ROI (Heatpump payback) = d_142 / (d_141 - h_141)
    {
      id: "energy.roi.heatpump",
      legacyId: "h_142",
      dependencies: ["energy.cost.heatpumpPremium", "energy.cost.preHP", "energy.cost.postHP", "mechanical.heating.systemType"],
      classification: "C",
      section: "S15",
      label: "Heatpump ROI (years)",
      compute: (inputs) => {
        const system = inputs["mechanical.heating.systemType"] || "Electricity";
        if (system !== "Heatpump") return 0;
        const premium = parseNum(inputs["energy.cost.heatpumpPremium"], 30000);
        const preHP = parseNum(inputs["energy.cost.preHP"], 0);
        const postHP = parseNum(inputs["energy.cost.postHP"], 0);
        const savings = preHP - postHP;
        return savings > 0 ? premium / savings : 0;
      }
    },

    // h_143: Target TEUI = h_10
    {
      id: "teuiSummary.target.teui",
      legacyId: "h_143",
      dependencies: ["keyValues.target.teui"],
      classification: "C",
      section: "S15",
      label: "Target TEUI",
      compute: (inputs) => parseNum(inputs["keyValues.target.teui"], 0),
    },

    // h_144: Target vs Actual TEUI Ratio = h_143 / l_143
    {
      id: "energy.targetActual.ratio",
      legacyId: "h_144",
      dependencies: ["teuiSummary.target.teui", "teuiSummary.actual.teui"],
      classification: "C",
      section: "S15",
      label: "Target/Actual TEUI Ratio",
      compute: (inputs) => {
        const target = parseNum(inputs["teuiSummary.target.teui"], 0);
        const actual = inputs["teuiSummary.actual.teui"];
        if (actual === "N/A" || actual === null || actual === undefined) return "N/A";
        const actualNum = parseNum(actual, 0);
        return actualNum > 0 ? target / actualNum : "N/A";
      }
    },

    // l_137: Peak Heating Load (BTU) = d_137 × 3412.14245
    {
      id: "energy.peakHeating.btu",
      legacyId: "l_137",
      dependencies: ["energy.peakHeating.enclosureKw"],
      classification: "C",
      section: "S15",
      label: "Peak Heating Load (BTU)",
      compute: (inputs) => {
        const d137 = parseNum(inputs["energy.peakHeating.enclosureKw"], 0);
        return d137 * 3412.14245;
      }
    },

    // l_138: Peak Cooling Load (BTU) = d_138 × 3412.14245
    {
      id: "energy.peakCooling.btu",
      legacyId: "l_138",
      dependencies: ["energy.peakCooling.enclosureKw"],
      classification: "C",
      section: "S15",
      label: "Peak Cooling Load (BTU)",
      compute: (inputs) => {
        const d138 = parseNum(inputs["energy.peakCooling.enclosureKw"], 0);
        return d138 * 3412.14245;
      }
    },

    // l_139: Peak Cooling Load with Gains (BTU)
    {
      id: "energy.peakCoolingGains.btu",
      legacyId: "l_139",
      dependencies: ["energy.peakCooling.totalKw"],
      classification: "C",
      section: "S15",
      label: "Peak Cooling with Gains (BTU)",
      compute: (inputs) => {
        const d139 = parseNum(inputs["energy.peakCooling.totalKw"], 0);
        return d139 * 3412.14245;
      }
    },

    // l_143: Actual TEUI (from Utility Bills) = k_10 if reporting mode = "Utility Bills"
    {
      id: "teuiSummary.actual.teui",
      legacyId: "l_143",
      dependencies: ["keyValues.actual.teui", "building.analysisMode"],
      classification: "C",
      section: "S15",
      label: "Actual TEUI",
      compute: (inputs) => {
        const mode = inputs["building.analysisMode"] || "";
        if (mode === "Utility Bills") {
          return parseNum(inputs["keyValues.actual.teui"], 0);
        }
        return "N/A";
      }
    },

    // l_144: Actual vs Target TEUI Ratio = l_143 / h_143
    {
      id: "energy.actualTarget.ratio",
      legacyId: "l_144",
      dependencies: ["teuiSummary.actual.teui", "teuiSummary.target.teui"],
      classification: "C",
      section: "S15",
      label: "Actual/Target TEUI Ratio",
      compute: (inputs) => {
        const actual = inputs["teuiSummary.actual.teui"];
        if (actual === "N/A") return "N/A";
        const actualNum = parseNum(actual, 0);
        const target = parseNum(inputs["teuiSummary.target.teui"], 0);
        return target > 0 ? actualNum / target : "N/A";
      }
    },

    // h_135: TEUI = d_135 / h_15 (total targeted energy / conditioned floor area)
    {
      id: "energy.teui.targeted",
      legacyId: "h_135",
      dependencies: ["energy.total.targeted", "building.conditionedFloorArea"],
      classification: "C",
      section: "S15",
      label: "TEUI (kWh/m²/yr)",
      compute: (inputs) => {
        const total = parseNum(inputs["energy.total.targeted"], 0);
        const area = parseNum(inputs["building.conditionedFloorArea"], 0);
        return area > 0 ? total / area : 0;
      }
    },

    // l_141: Other Energy Cost = (L13*D28) + (D29*L14) + (L15*D31) + (L16*D30)
    {
      id: "energy.cost.otherFuel",
      legacyId: "l_141",
      dependencies: [
        "energy.price.gas", "energy.raw.gas",
        "energy.actual.propane.kg", "energy.price.propane",
        "energy.price.wood", "forestry.woodVolume",
        "energy.price.oil", "energy.raw.oil"
      ],
      classification: "C",
      section: "S15",
      label: "Other Energy Cost ($)",
      compute: (inputs) => {
        const l13 = parseNum(inputs["energy.price.gas"]);
        const d28 = parseNum(inputs["energy.raw.gas"]);
        const d29 = parseNum(inputs["energy.actual.propane.kg"]);
        const l14 = parseNum(inputs["energy.price.propane"]);
        const l15 = parseNum(inputs["energy.price.wood"]);
        const d31 = parseNum(inputs["forestry.woodVolume"]);
        const l16 = parseNum(inputs["energy.price.oil"]);
        const d30 = parseNum(inputs["energy.raw.oil"]);
        return (l13 * d28) + (d29 * l14) + (l15 * d31) + (l16 * d30);
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
