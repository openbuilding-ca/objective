/**
 * F280ComplianceNodes.js - CSA F280-12 Peak Load & Sizing Compliance
 *
 * Builds on peak load values computed in EnergyNodes.js (d_137-d_140)
 * with F280-specific requirements: infiltration/ventilation peak loads,
 * equipment sizing compliance checks, and designer certification validation.
 *
 * Peak loads from EnergyNodes.js:
 *   energy.peakHeating.enclosureKw  (d_137) — envelope heating peak (kW)
 *   energy.peakCooling.enclosureKw  (d_138) — envelope cooling peak (kW)
 *   energy.peakCooling.totalKw      (d_139) — cooling + gains peak (kW)
 *   energy.peakHeating.intensity    (d_140) — max heating intensity (W/m²)
 *
 * F280 additions (this module):
 *   - Peak infiltration heat loss:  AIM-2, Cl. 5.2.3 (or OBJECTIVE's 1.21 × NRL50 × Ae/N × deltaT)
 *   - Peak ventilation heat loss:   Cl. 5.2.3.2, HLvairb = PVC × DTDh × 1.2 × (1 − E)
 *   - F280 total design heat loss:  Q_total = envelope + Q_inf + Q_vent
 *   - Sensible heat gain, Cl. 6.2.9: enclosure + internal + solar + occupants + air leakage (Cl. 6.2.6)
 *     + ventilation (Cl. 6.2.7, HGsvb = PVC × DTDc × 1.2 × (1 − ATRE)); the nominal cooling
 *     capacity is that × the latent load factor (Cl. 6.3)
 *   - Equipment sizing compliance:  heating >= 100%, cooling 80-125%
 *   - Designer certification validation (NRCan EA, TECA, P.Eng, OAA, BCIN)
 *
 * Parnas Tables: docs/parnas-tables/f280/
 *
 * References:
 *   - CSA F280-12 (R2025) Sections 5.2, 6.3, 7.1
 *   - NBC 9.33.5.1, 9.36.3.2, 9.36.5.15
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

  // Volumetric heat capacity of air: rho × Cp = 1.204 × 1005 / 1000 = 1.21 W·s/(L·K) - OBJECTIVE's own
  // (the N-factor leakage path)
  const AIR_HEAT_CAPACITY = 1.21;

  // F280's own factor, W per L/s·K: every air equation in the standard writes 1.2 (Cl. 5.2.3, 5.2.3.2,
  // 6.2.6, 6.2.7)
  const F280_AIR = 1.2;

  // W to BTU/h conversion factor
  const W_TO_BTU = 3.41214;

  // Ground temperature constant (degC) per F280 methodology
  const GROUND_TEMP = 10;

  // Small cooling system threshold (W) - 6000W = 1.7 tons
  const SMALL_SYSTEM_THRESHOLD = 6000;

  // Small system allowable excess (W) - 1750W = 0.49 tons
  const SMALL_SYSTEM_EXCESS = 1750;

  function register(graph) {
    // ========================================================================
    // F280 INPUT NODES - Equipment capacity and designer certification
    // ========================================================================

    const inputs = [
      // Equipment sizing inputs
      {
        id: "f280.installedHeatingCapacity",
        legacyId: "f280_cap_heat",
        section: "SF280",
        classification: "C",
        label: "Installed Heating Capacity (W)",
        defaultValue: 0,
        unit: "W"
      },
      {
        id: "f280.installedCoolingCapacity",
        legacyId: "f280_cap_cool",
        section: "SF280",
        classification: "C",
        label: "Installed Cooling Capacity (W)",
        defaultValue: 0,
        unit: "W"
      },

      // Designer certification inputs
      {
        id: "f280.designer.name",
        legacyId: "f280_dsgn_name",
        section: "SF280",
        classification: "A",
        label: "Designer Name",
        defaultValue: ""
      },
      {
        id: "f280.designer.company",
        legacyId: "f280_dsgn_co",
        section: "SF280",
        classification: "A",
        label: "Designer Company",
        defaultValue: ""
      },
      {
        id: "f280.designer.certType",
        legacyId: "f280_cert_type",
        section: "SF280",
        classification: "A",
        label: "Certification Type",
        defaultValue: "Other"
      },
      {
        id: "f280.designer.certNumber",
        legacyId: "f280_cert_num",
        section: "SF280",
        classification: "A",
        label: "Certification Number",
        defaultValue: ""
      },
      {
        id: "f280.designer.serviceOrg",
        legacyId: "f280_svc_org",
        section: "SF280",
        classification: "A",
        label: "Service Organization",
        defaultValue: ""
      },
      {
        id: "f280.designer.attestation",
        legacyId: "f280_attest",
        section: "SF280",
        classification: "A",
        label: "Responsibility Declaration",
        defaultValue: false
      },

      // F280 form metadata
      {
        id: "f280.projectNumber",
        legacyId: "f280_proj_num",
        section: "SF280",
        classification: "A",
        label: "F280 Project Number",
        defaultValue: ""
      },
      {
        id: "f280.complianceType",
        legacyId: "f280_comp_type",
        section: "SF280",
        classification: "A",
        label: "Compliance Type",
        defaultValue: "Whole House"
      },
      {
        id: "f280.codeReference",
        legacyId: "f280_code_ref",
        section: "SF280",
        classification: "A",
        label: "Code Reference",
        defaultValue: "NBC 2020: 9.33.5.1, 9.36.3.2, 9.36.5.15(5), 9.36.8.9"
      }
    ];

    graph.registerInputs(inputs);

    // ========================================================================
    // F280 PEAK ENVELOPE HEAT LOSS (CSA F280-12 Section 5.2)
    // Parnas: docs/parnas-tables/f280/peak-envelope-heat-loss.json
    //
    // Uses energy.peakHeating.enclosureKw (d_137) from EnergyNodes.js,
    // converted from kW to Watts.
    // ========================================================================

    graph.registerNode({
      id: "f280.peakEnvelopeHeatLoss",
      legacyId: "f280_hl_env",
      section: "SF280",
      classification: "C",
      dependencies: ["energy.peakHeating.enclosureKw"],
      label: "F280 Peak Envelope Heat Loss (W)",
      compute: (inputs) => {
        // Unavailable stays Unavailable (BASESIMP missing an input, S03 G.4.3): never a 0 W envelope
        if (inputs["energy.peakHeating.enclosureKw"] === "Unavailable") return "Unavailable";
        const kw = parseNum(inputs["energy.peakHeating.enclosureKw"]);
        return Math.round(kw * 1000);
      }
    });

    // ========================================================================
    // F280 PEAK INFILTRATION HEAT LOSS (CSA F280-12 Section 5.2.5)
    // Parnas: docs/parnas-tables/f280/peak-infiltration-heat-loss.json
    //
    // Q_inf = 1.21 × NRL50 × Ae / N × deltaT
    // ========================================================================

    graph.registerNode({
      id: "f280.peakInfiltrationHeatLoss",
      legacyId: "f280_hl_inf",
      section: "SF280",
      classification: "C",
      dependencies: [
        "airTightness.nrl50",
        "envelope.airFacing.area",
        "airTightness.nFactor",
        "climate.heating.obcSetpoint", // the DESIGN set-point (F280 Cl. 4.2: 22 °C)
        "climate.temperature.coldest",
        "airTightness.infiltrationMethod",
        "airTightness.aim2",
        "volume.conditioned"
      ],
      label: "F280 Peak Infiltration Heat Loss (W)",
      compute: (inputs) => {
        // S12 B.19.1 = AIM-2: Cl. 5.2.3 itself, HLairb = LRairh x Vb / 3.6 x DTDh x 1.2 (LRairh = AIM2.xls's)
        if (inputs["airTightness.infiltrationMethod"] === "AIM2") {
          const r = inputs["airTightness.aim2"];
          if (!r || r.error) return "Unavailable";
          const dT = parseNum(inputs["climate.heating.obcSetpoint"], 22) - parseNum(inputs["climate.temperature.coldest"], -22);
          return Math.round(r.design.heating.natural * parseNum(inputs["volume.conditioned"]) / 3.6 * Math.max(0, dT) * 1.2);
        }
        const nrl50 = parseNum(inputs["airTightness.nrl50"]);
        const areaAir = parseNum(inputs["envelope.airFacing.area"]);
        const nFactor = parseNum(inputs["airTightness.nFactor"], 13);
        const setpoint = parseNum(inputs["climate.heating.obcSetpoint"], 22);
        const designTemp = parseNum(inputs["climate.temperature.coldest"], -22);

        if (nFactor <= 0 || areaAir <= 0) return 0;

        const deltaT = setpoint - designTemp;
        if (deltaT <= 0) return 0;

        // Q_inf = 1.21 × NRL50 × area / N-factor × deltaT
        const baseCoeff = (AIR_HEAT_CAPACITY * nrl50 * areaAir) / nFactor;
        return Math.round(baseCoeff * deltaT);
      }
    });

    // ========================================================================
    // F280 PEAK VENTILATION HEAT LOSS (CSA F280-12 Cl. 5.2.3.2: HLvairb = PVC × DTDh × 1.2 × (1 − E))
    // Parnas: docs/parnas-tables/f280/peak-ventilation-heat-loss.json
    //
    // PVC in L/s: ventilation.volumetricRate (d_120), the rate the annual ventilation loss (d_121)
    // uses. It read ventilation.volumeRate (h_120, m³/h = L/s × 3.6), which put the F280 ventilation
    // loss 3.6× high (2026-11-18). E = S13's recovery efficiency (d_118; F280 asks the HRV's apparent
    // sensible effectiveness at the design temperature, CAN/CSA-C439). The factor is the clause's 1.2,
    // not OBJECTIVE's 1.21 (2026-11-19: F280-1 724 → 718 W).
    // ========================================================================

    graph.registerNode({
      id: "f280.peakVentilationHeatLoss",
      legacyId: "f280_hl_vent",
      section: "SF280",
      classification: "C",
      dependencies: [
        "ventilation.volumetricRate", // L/s
        "mechanical.ventilation.efficiency",
        "climate.heating.obcSetpoint", // the DESIGN set-point (F280 Cl. 4.2: 22 °C)
        "climate.temperature.coldest"
      ],
      label: "F280 Peak Ventilation Heat Loss (W)",
      compute: (inputs) => {
        const ventRate = parseNum(inputs["ventilation.volumetricRate"]); // L/s
        const efficiency = parseNum(inputs["mechanical.ventilation.efficiency"]);
        const setpoint = parseNum(inputs["climate.heating.obcSetpoint"], 22);
        const designTemp = parseNum(inputs["climate.temperature.coldest"], -22);

        if (ventRate <= 0) return 0;

        const deltaT = setpoint - designTemp;
        if (deltaT <= 0) return 0;

        // Net ventilation loss after heat recovery
        const recoveryFactor = Math.max(0, Math.min(1, 1 - efficiency / 100));

        // HLvairb = PVC × DTDh × 1.2 × (1 − E)
        return Math.round(ventRate * deltaT * F280_AIR * recoveryFactor);
      }
    });

    // ========================================================================
    // F280 TOTAL DESIGN HEAT LOSS (CSA F280-12 Section 5.2.7)
    // Parnas: docs/parnas-tables/f280/total-design-heat-loss.json
    //
    // Q_total = Q_envelope + Q_infiltration + Q_ventilation
    // This is THE primary F280 output for heating equipment sizing
    // ========================================================================

    graph.registerNode({
      id: "f280.totalDesignHeatLoss",
      legacyId: "f280_hl_total",
      section: "SF280",
      classification: "C",
      dependencies: [
        "f280.peakEnvelopeHeatLoss",
        "f280.peakInfiltrationHeatLoss",
        "f280.peakVentilationHeatLoss"
      ],
      label: "F280 Total Design Heat Loss (W)",
      compute: (inputs) => {
        if (inputs["f280.peakEnvelopeHeatLoss"] === "Unavailable") return "Unavailable";
        if (inputs["f280.peakInfiltrationHeatLoss"] === "Unavailable") return "Unavailable";
        const envelope = parseNum(inputs["f280.peakEnvelopeHeatLoss"]);
        const infiltration = parseNum(inputs["f280.peakInfiltrationHeatLoss"]);
        const ventilation = parseNum(inputs["f280.peakVentilationHeatLoss"]);

        return Math.round(envelope + infiltration + ventilation);
      }
    });

    // ========================================================================
    // F280 TOTAL DESIGN HEAT LOSS IN BTU/h
    // Parnas: docs/parnas-tables/f280/total-design-heat-loss-btu.json
    // ========================================================================

    graph.registerNode({
      id: "f280.totalDesignHeatLossBTU",
      legacyId: "f280_hl_btu",
      section: "SF280",
      classification: "C",
      dependencies: ["f280.totalDesignHeatLoss"],
      label: "F280 Total Design Heat Loss (BTU/h)",
      compute: (inputs) => {
        const watts = parseNum(inputs["f280.totalDesignHeatLoss"]);
        return Math.round(watts * W_TO_BTU);
      }
    });

    // ========================================================================
    // F280 PEAK AIR-LEAKAGE HEAT GAIN (CSA F280-12 Cl. 6.2.6)
    // Under AIM-2 (S12 B.19.1): HGsalb = LRairc × Vb / 3.6 × DTDc × 1.2. Otherwise OBJECTIVE's
    // N-factor leakage at the cooling ΔT.
    // ========================================================================

    graph.registerNode({
      id: "f280.peakInfiltrationHeatGain",
      section: "SF280",
      classification: "C",
      dependencies: [
        "airTightness.nrl50",
        "envelope.airFacing.area",
        "airTightness.nFactor",
        "climate.temperature.hottest",
        "climate.cooling.setpoint",
        "airTightness.infiltrationMethod",
        "airTightness.aim2",
        "volume.conditioned"
      ],
      label: "F280 Peak Air-Leakage Heat Gain (W)",
      compute: (inputs) => {
        const deltaT = parseNum(inputs["climate.temperature.hottest"], 34) - parseNum(inputs["climate.cooling.setpoint"], 24);
        if (inputs["airTightness.infiltrationMethod"] === "AIM2") {
          const r = inputs["airTightness.aim2"];
          if (!r || r.error) return "Unavailable";
          return r.design.cooling.natural * parseNum(inputs["volume.conditioned"]) / 3.6 * Math.max(0, deltaT) * F280_AIR;
        }
        const nFactor = parseNum(inputs["airTightness.nFactor"], 13);
        if (!(nFactor > 0) || !(deltaT > 0)) return 0;
        // 1.21 × NRL50 × Ae / N × ΔT
        return AIR_HEAT_CAPACITY * parseNum(inputs["airTightness.nrl50"]) * parseNum(inputs["envelope.airFacing.area"]) / nFactor * deltaT;
      }
    });

    // ========================================================================
    // F280 PEAK VENTILATION HEAT GAIN (CSA F280-12 Cl. 6.2.7: HGsvb = PVC × DTDc × 1.2 × (1 − ATRE))
    //
    // PVC = d_120 (L/s), as the loss (Cl. 5.2.3.2). ATRE = S13 l_123, the HRV/ERV's adjusted total
    // recovery efficiency from CAN/CSA-C439's cooling test, % - 0 by default, the clause's "or zero if there
    // is no ATRE reported" (Andy 2026-11-19); not d_118, the heating-season sensible figure. Before
    // 2026-11-19 the F280 gain carried only S15's season-average ventilation (d_122's sensible part, 0 on
    // F280-1), not this.
    // ========================================================================

    graph.registerNode({
      id: "f280.peakVentilationHeatGain",
      section: "SF280",
      classification: "C",
      dependencies: [
        "ventilation.volumetricRate",
        "climate.temperature.hottest",
        "climate.cooling.setpoint",
        "mechanical.ventilation.atre"
      ],
      label: "F280 Peak Ventilation Heat Gain (W)",
      compute: (inputs) => {
        const pvc = parseNum(inputs["ventilation.volumetricRate"]);
        const deltaT = parseNum(inputs["climate.temperature.hottest"], 34) - parseNum(inputs["climate.cooling.setpoint"], 24);
        const atre = parseNum(inputs["mechanical.ventilation.atre"]) / 100;
        if (!(atre >= 0 && atre <= 1)) return "Unavailable"; // an ATRE outside 0-100 %: no number
        return pvc > 0 && deltaT > 0 ? pvc * deltaT * F280_AIR * (1 - atre) : 0;
      }
    });

    // ========================================================================
    // F280 TOTAL SENSIBLE HEAT GAIN (CSA F280-12 Cl. 6.2.9)
    //
    // S15's d_139 terms by OBJECTIVE's own inputs (Andy 2026-11-18: match gains by OBJECTIVE's
    // inputs) - the enclosure (d_138), internal gains (plug + lighting + equipment × area), the glazing
    // rows' cooling gain and the occupants' sensible gain as season averages (÷ cooling days × 24) -
    // with d_139's season-average ventilation replaced by Cl. 6.2.7's design-condition term, plus the
    // air leakage (Cl. 6.2.6). ⚠ The solar is still the season average, not Cl. 6.2.2.1's design hour.
    // ========================================================================

    graph.registerNode({
      id: "f280.totalSensibleHeatGain",
      section: "SF280",
      classification: "C",
      dependencies: [
        "energy.peakCooling.enclosureKw",
        "internal.plugLoadDensity",
        "internal.lightingDensity",
        "internal.equipmentDensity",
        "building.conditionedFloorArea",
        "radiantGains.subtotal.coolingGain",
        "internal.occupants.coolingGain",
        "cooling.iso52016",
        "climate.coolingDays",
        "f280.peakInfiltrationHeatGain",
        "f280.peakVentilationHeatGain"
      ],
      label: "F280 Total Sensible Heat Gain (W)",
      compute: (inputs) => {
        if (inputs["f280.peakInfiltrationHeatGain"] === "Unavailable") return "Unavailable";
        if (inputs["f280.peakVentilationHeatGain"] === "Unavailable") return "Unavailable";
        const enclosure = parseNum(inputs["energy.peakCooling.enclosureKw"]) * 1000;
        const density = parseNum(inputs["internal.plugLoadDensity"]) + parseNum(inputs["internal.lightingDensity"]) +
          parseNum(inputs["internal.equipmentDensity"]);
        const internal = density * parseNum(inputs["building.conditionedFloorArea"], 1);
        const latent = inputs["cooling.iso52016"]?.latent;
        const occupantsKwh = parseNum(inputs["internal.occupants.coolingGain"]) - (latent?.people ?? 0);
        const hours = parseNum(inputs["climate.coolingDays"], 120) * 24;
        const seasonAverage = hours > 0 ? (parseNum(inputs["radiantGains.subtotal.coolingGain"]) + occupantsKwh) / hours * 1000 : 0;
        return enclosure + internal + seasonAverage +
          parseNum(inputs["f280.peakInfiltrationHeatGain"]) + parseNum(inputs["f280.peakVentilationHeatGain"]);
      }
    });

    // ========================================================================
    // F280 NOMINAL COOLING CAPACITY (CSA F280-12 Cl. 6.3)
    // Parnas: docs/parnas-tables/f280/nominal-cooling-capacity.json
    //
    // The total sensible heat gain (Cl. 6.2.9) × the latent load factor (never below 1): the factor is
    // taken over this same sensible (CoolingNodes), so this is sensible + the design latent, Annex B's HGb.
    // ========================================================================

    graph.registerNode({
      id: "f280.nominalCoolingCapacity",
      legacyId: "f280_cl_total",
      section: "SF280",
      classification: "C",
      dependencies: ["f280.totalSensibleHeatGain", "cooling.latentLoadFactor"],
      label: "F280 Nominal Cooling Capacity (W)",
      compute: (inputs) => {
        if (inputs["f280.totalSensibleHeatGain"] === "Unavailable") return "Unavailable";
        if (inputs["cooling.latentLoadFactor"] === "Unavailable") return "Unavailable";
        const llf = Math.max(1.0, parseNum(inputs["cooling.latentLoadFactor"], 1.15));
        return Math.round(parseNum(inputs["f280.totalSensibleHeatGain"]) * llf);
      }
    });

    // F280 Nominal Cooling in BTU/h
    graph.registerNode({
      id: "f280.nominalCoolingCapacityBTU",
      legacyId: "f280_cl_btu",
      section: "SF280",
      classification: "C",
      dependencies: ["f280.nominalCoolingCapacity"],
      label: "F280 Nominal Cooling Capacity (BTU/h)",
      compute: (inputs) => {
        const watts = parseNum(inputs["f280.nominalCoolingCapacity"]);
        return Math.round(watts * W_TO_BTU);
      }
    });

    // ========================================================================
    // F280 HEATING SIZING COMPLIANCE (CSA F280-12 Section 5.2.7)
    // Parnas: docs/parnas-tables/f280/heating-sizing-compliance.json
    //
    // Installed capacity must be >= 100% of design heat loss
    // ========================================================================

    graph.registerNode({
      id: "f280.heatingSizingRatio",
      legacyId: "f280_sz_heat_ratio",
      section: "SF280",
      classification: "C",
      dependencies: [
        "f280.installedHeatingCapacity",
        "f280.totalDesignHeatLoss"
      ],
      label: "F280 Heating Sizing Ratio (%)",
      compute: (inputs) => {
        const installed = parseNum(inputs["f280.installedHeatingCapacity"]);
        const required = parseNum(inputs["f280.totalDesignHeatLoss"]);

        if (required <= 0) return 100;
        if (installed <= 0 && required > 0) return 0;

        return Math.round((installed / required) * 100);
      }
    });

    graph.registerNode({
      id: "f280.heatingSizingCompliance",
      legacyId: "f280_sz_heat",
      section: "SF280",
      classification: "C",
      dependencies: ["f280.heatingSizingRatio"],
      label: "F280 Heating Sizing Compliance",
      compute: (inputs) => {
        const ratio = parseNum(inputs["f280.heatingSizingRatio"]);
        return ratio >= 100 ? "\u2713" : "\u2717";
      }
    });

    // ========================================================================
    // F280 COOLING SIZING COMPLIANCE (CSA F280-12 Section 6.3.1)
    // Parnas: docs/parnas-tables/f280/cooling-sizing-compliance.json
    //
    // Installed must be 80-125% of nominal (small system exception applies)
    // ========================================================================

    graph.registerNode({
      id: "f280.coolingSizingRatio",
      legacyId: "f280_sz_cool_ratio",
      section: "SF280",
      classification: "C",
      dependencies: [
        "f280.installedCoolingCapacity",
        "f280.nominalCoolingCapacity"
      ],
      label: "F280 Cooling Sizing Ratio (%)",
      compute: (inputs) => {
        const installed = parseNum(inputs["f280.installedCoolingCapacity"]);
        const nominal = parseNum(inputs["f280.nominalCoolingCapacity"]);

        if (nominal <= 0) return installed <= 0 ? 100 : 0;

        return Math.round((installed / nominal) * 100);
      }
    });

    graph.registerNode({
      id: "f280.coolingSizingCompliance",
      legacyId: "f280_sz_cool",
      section: "SF280",
      classification: "C",
      dependencies: [
        "f280.coolingSizingRatio",
        "f280.installedCoolingCapacity",
        "f280.nominalCoolingCapacity"
      ],
      label: "F280 Cooling Sizing Compliance",
      compute: (inputs) => {
        const ratio = parseNum(inputs["f280.coolingSizingRatio"]);
        const installed = parseNum(inputs["f280.installedCoolingCapacity"]);
        const nominal = parseNum(inputs["f280.nominalCoolingCapacity"]);

        // No cooling system: compliant if no load
        if (installed <= 0 && nominal <= 0) return "\u2713";
        if (installed <= 0 && nominal > 0) return "\u2717";

        // Small system exception: nominal < 6000W may exceed by up to 1750W
        if (nominal > 0 && nominal < SMALL_SYSTEM_THRESHOLD) {
          return installed <= (nominal + SMALL_SYSTEM_EXCESS) ? "\u2713" : "\u2717";
        }

        // Standard rule: 80% to 125%
        return (ratio >= 80 && ratio <= 125) ? "\u2713" : "\u2717";
      }
    });

    // ========================================================================
    // F280 DESIGNER CERTIFICATION VALIDATION
    // Parnas: docs/parnas-tables/f280/designer-certification.json
    // ========================================================================

    graph.registerNode({
      id: "f280.certificationValid",
      legacyId: "f280_cert_valid",
      section: "SF280",
      classification: "A",
      dependencies: [
        "f280.designer.name",
        "f280.designer.certType",
        "f280.designer.certNumber",
        "f280.designer.serviceOrg",
        "f280.designer.attestation"
      ],
      label: "F280 Certification Valid",
      compute: (inputs) => {
        const name = inputs["f280.designer.name"] || "";
        const certType = inputs["f280.designer.certType"] || "";
        const certNumber = inputs["f280.designer.certNumber"] || "";
        const serviceOrg = inputs["f280.designer.serviceOrg"] || "";
        const attestation = inputs["f280.designer.attestation"];

        // Required: name, cert number, and attestation
        if (!name.trim()) return "\u2717";
        if (!certNumber.trim()) return "\u2717";
        if (!attestation) return "\u2717";

        // NRCan EA requires Service Organization
        if (certType === "NRCan EA" && !serviceOrg.trim()) return "\u2717";

        return "\u2713";
      }
    });

    // ========================================================================
    // F280 OVERALL COMPLIANCE STATUS
    //
    // Aggregates all F280 compliance checks into a single status
    // ========================================================================

    graph.registerNode({
      id: "f280.overallCompliance",
      legacyId: "f280_overall",
      section: "SF280",
      classification: "C",
      dependencies: [
        "f280.heatingSizingCompliance",
        "f280.coolingSizingCompliance",
        "f280.certificationValid"
      ],
      label: "F280 Overall Compliance Status",
      compute: (inputs) => {
        const heating = inputs["f280.heatingSizingCompliance"];
        const cooling = inputs["f280.coolingSizingCompliance"];
        const cert = inputs["f280.certificationValid"];

        const allPass = heating === "\u2713" && cooling === "\u2713" && cert === "\u2713";
        return allPass ? "\u2713" : "\u2717";
      }
    });

    console.log("[F280ComplianceNodes] Registered F280 peak load and compliance nodes");
  }

  window.TEUI.ComputationNodes.F280Compliance = { register };
  console.log("[F280ComplianceNodes] Module loaded");
})();
