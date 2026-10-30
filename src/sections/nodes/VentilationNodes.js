/**
 * VentilationNodes.js - Mechanical Ventilation (Section 13)
 *
 * Calculates ventilation energy:
 * - Ventilation rates (ACH, L/s)
 * - HRV/ERV efficiency
 * - Ventilation heat loss/gain
 * - Free cooling potential
 * - COP and heating/cooling system performance
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
    // NOTE: All S13 inputs are registered in MechanicalNodes.
    // This module uses mechanical.* paths for those inputs.

    // ========================================================================
    // VENTILATION RATES - from Section13 rows 119-120
    // ========================================================================

    // Volumetric ventilation rate (L/s) - d_120
    graph.registerNode({
      id: "ventilation.volumetricRate",
      legacyId: "d_120",
      section: "S13",
      classification: "C",
      dependencies: [
        "mechanical.ventilation.method",
        "mechanical.ventilation.ach",
        "mechanical.ventilation.ratePerPerson",
        "volume.conditioned",
        "occupancy.occupants",
        "occupancy.occupiedHours",
        "occupancy.totalHours"
      ],
      label: "Volumetric Ventilation Rate (L/s)",
      compute: (inputs) => {
        const method = inputs["mechanical.ventilation.method"] || "Volume by Schedule";
        const ach = parseNum(inputs["mechanical.ventilation.ach"], 3);
        const perPersonRate = parseNum(inputs["mechanical.ventilation.ratePerPerson"], 14);
        const volume = parseNum(inputs["volume.conditioned"], 6000);
        const occupants = parseNum(inputs["occupancy.occupants"], 20);
        const occupiedHours = parseNum(inputs["occupancy.occupiedHours"], 4380);
        const totalHours = parseNum(inputs["occupancy.totalHours"], 8760);
        const scheduleFactor = totalHours > 0 ? occupiedHours / totalHours : 0.5;

        if (method === "Volume Constant") {
          return (ach * volume) / 3.6;
        } else if (method === "Volume by Schedule") {
          return ((ach * volume) / 3.6) * scheduleFactor;
        } else if (method === "Occupant Constant") {
          return perPersonRate * occupants;
        } else if (method === "Occupant by Schedule") {
          return perPersonRate * occupants * scheduleFactor;
        } else {
          // Default to Volume by Schedule (matches legacy default)
          return ((ach * volume) / 3.6) * scheduleFactor;
        }
      }
    });

    // Volumetric ventilation rate in m³/h - h_120
    graph.registerNode({
      id: "ventilation.volumeRate",
      legacyId: "h_120",
      section: "S13",
      classification: "C",
      dependencies: ["ventilation.volumetricRate"],
      label: "Volumetric Ventilation Rate (m³/h)",
      compute: (inputs) => {
        const flowRate = parseNum(inputs["ventilation.volumetricRate"]);
        return flowRate * 3.6; // L/s to m³/h
      }
    });

    // ========================================================================
    // VENTILATION HEAT LOSS/GAIN - from Section13 rows 121-123
    // ========================================================================

    // Ventilation heating load (before recovery) - d_121
    graph.registerNode({
      id: "ventilation.grossHeatLoss",
      legacyId: "d_121",
      section: "S13",
      classification: "C",
      dependencies: ["ventilation.volumetricRate", "climate.heating.degreedays"],
      label: "Ventilation Heating Load (kWh/yr)",
      compute: (inputs) => {
        const hdd = inputs["climate.heating.degreedays"];
        if (isUnavailable(hdd)) return "Unavailable";

        const volumeRate = parseNum(inputs["ventilation.volumetricRate"]);
        // Formula from Section13: (1.21 * ventRate * hdd * 24) / 1000
        // 1.21 is volumetric heat capacity of air (kJ/(m³·K))
        return (1.21 * volumeRate * parseNum(hdd) * 24) / 1000;
      }
    });

    // Ventilation energy recovered - h_121
    graph.registerNode({
      id: "ventilation.energyRecovered",
      legacyId: "h_121",
      section: "S13",
      classification: "C",
      dependencies: ["ventilation.grossHeatLoss", "mechanical.ventilation.efficiency"],
      label: "Ventilation Energy Recovered (kWh/yr)",
      compute: (inputs) => {
        const grossLoss = parseNum(inputs["ventilation.grossHeatLoss"]);
        const efficiency = parseNum(inputs["mechanical.ventilation.efficiency"], 89) / 100;
        return grossLoss * efficiency;
      }
    });

    // Net heating season ventilation losses - m_121
    graph.registerNode({
      id: "ventilation.netHeatLoss",
      legacyId: "m_121",
      section: "S13",
      classification: "C",
      dependencies: ["ventilation.grossHeatLoss", "ventilation.energyRecovered"],
      label: "Net Ventilation Heat Loss (kWh/yr)",
      compute: (inputs) => {
        const grossLoss = parseNum(inputs["ventilation.grossHeatLoss"]);
        const recovered = parseNum(inputs["ventilation.energyRecovered"]);
        return grossLoss - recovered;
      }
    });

    // NOTE: cooling.latentLoadFactor is now computed by CoolingNodes.js
    // It uses psychrometric calculations (humidity ratios, wet bulb temp) to derive the factor

    // Ventilation cooling load - d_122: the ventilation's share of the
    // unmitigated ISO 52016-1 monthly need (cooling.iso52016, CoolingNodes.js)
    graph.registerNode({
      id: "ventilation.heatGain",
      legacyId: "d_122",
      section: "S13",
      classification: "C",
      dependencies: ["cooling.iso52016"],
      label: "Net Ventilation Heat Gain (kWh/yr)",
      compute: (inputs) => inputs["cooling.iso52016"]?.rows?.vent ?? 0
    });

    // Ventilation energy recovered (cooling season) - d_123: what heat
    // recovery saves of the monthly need, in the months warmer than the
    // setpoint only (the HRV bypasses its core otherwise)
    graph.registerNode({
      id: "ventilation.energyRecoveredCooling",
      legacyId: "d_123",
      section: "S13",
      classification: "C",
      dependencies: ["cooling.iso52016"],
      label: "Ventilation Energy Recovered Cooling (kWh/yr)",
      compute: (inputs) => inputs["cooling.iso52016"]?.recovered ?? 0
    });

    // ========================================================================
    // HEATING SYSTEM PERFORMANCE - from Section13 row 113-114
    // ========================================================================

    // Heating COP (derived from HSPF or AFUE) - no direct legacyId
    graph.registerNode({
      id: "heating.copDerived",
      section: "S13",
      classification: "C",
      dependencies: ["mechanical.heating.systemType", "mechanical.heating.hspf", "mechanical.heating.afue"],
      label: "Heating COP",
      compute: (inputs) => {
        const type = inputs["mechanical.heating.systemType"] || "Heatpump";
        const hspf = parseNum(inputs["mechanical.heating.hspf"], 10);
        const afue = parseNum(inputs["mechanical.heating.afue"], 0.95);

        if (type === "Heatpump") {
          // HSPF to COP: COP = HSPF / 3.412
          return hspf / 3.412;
        } else if (type === "Electricity") {
          return 1.0;
        } else {
          // Combustion systems - AFUE is already a decimal (0.95)
          return afue;
        }
      }
    });

    // Heating energy consumption
    // Note: No legacyId - this is an intermediate computation not stored in legacy system
    graph.registerNode({
      id: "heating.energyConsumption",
      section: "S13",
      classification: "C",
      dependencies: ["energy.ted.heating", "heating.copDerived"],
      label: "Heating Energy Consumption (kWh/yr)",
      compute: (inputs) => {
        const ted = parseNum(inputs["energy.ted.heating"]);
        const cop = parseNum(inputs["heating.copDerived"], 1);
        return cop > 0 ? ted / cop : ted;
      }
    });

    // ========================================================================
    // COOLING SYSTEM PERFORMANCE - from Section13 row 116-117
    // ========================================================================

    // Cooling energy
    // Note: No legacyId - this is an intermediate computation not stored in legacy system
    graph.registerNode({
      id: "cooling.energyConsumption",
      section: "S13",
      classification: "C",
      dependencies: ["energy.ced.unmitigated", "mechanical.cooling.effectiveCop"],
      label: "Cooling Energy Consumption (kWh/yr)",
      compute: (inputs) => {
        const ced = parseNum(inputs["energy.ced.unmitigated"]);
        const cop = parseNum(inputs["mechanical.cooling.effectiveCop"], 2.66);
        return cop > 0 ? ced / cop : ced;
      }
    });

    // ========================================================================
    // FREE COOLING - Now computed by CoolingNodes.js
    // ========================================================================
    // NOTE: The following nodes are now computed by CoolingNodes.js:
    // - cooling.freeCoolingLimit (h_124) - computed from ventilation flow, temps, season
    // - cooling.daysActiveCooling (m_124) - depends on energy.ced.mitigated (m_129)
    // - cooling.latentLoadFactor - from psychrometric calculations
    //
    // CoolingNodes.js should be registered BEFORE VentilationNodes.js so these
    // dependencies are available for ventilation heat gain calculations.

    console.log("[VentilationNodes] Registered ventilation computed nodes");
  }

  window.TEUI.ComputationNodes.Ventilation = { register };
  console.log("[VentilationNodes] Module loaded");
})();
