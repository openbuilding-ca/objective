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
 * TWO STREAMS (Andy 2026-11-19): these nodes are the F280 stream - always F280's methods (BASESIMP,
 * AIM-2, Cl. 6.2's design-hour gains), whatever S03 G.4.3 / S12 B.19.1 say; those choose the ANNUAL
 * stream's methods, and only under F280 Mode (ground.methodInEffect, airTightness.infiltrationMethodInEffect).
 *   - Peak envelope heat loss:      U·A × DTDh above grade + BASESIMP below (Cl. 5.2.1, 5.2.2.1)
 *   - Peak infiltration heat loss:  AIM-2, Cl. 5.2.3
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

      // F280 Mode (S21 F.00; Andy 2026-11-19): two streams. Off - the default - hides every F280-only
      // input and S21, and the annual stream runs on OBJECTIVE's methods whatever G.4.3 / B.19.1 hold
      // (their values are kept). On shows them, and those two selectors choose the ANNUAL method too.
      // S21 computes F280's way either way (BASESIMP, AIM-2, Cl. 6.2's design-hour gains). "G": one mode
      // for Target and Reference.
      {
        id: "f280.mode",
        legacyId: "f280_mode",
        section: "SF280",
        classification: "G",
        label: "F280 Mode",
        defaultValue: "Off"
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
    // THE ANNUAL STREAM'S METHODS (Andy 2026-11-19, two streams): S03 G.4.3 and S12 B.19.1 choose the
    // annual figures' ground and air-leakage methods only under F280 Mode; Off, OBJECTIVE's, whatever
    // the hidden selectors hold. Every annual consumer reads these, never the selectors.
    // ========================================================================

    graph.registerNode({
      id: "ground.methodInEffect",
      section: "S03",
      classification: "C",
      dependencies: ["f280.mode", "ground.method"],
      label: "Ground Heat-Loss Method in Effect (annual)",
      compute: (inputs) => (inputs["f280.mode"] === "On" && inputs["ground.method"] === "BASESIMP" ? "BASESIMP" : "OBJECTIVE")
    });

    graph.registerNode({
      id: "airTightness.infiltrationMethodInEffect",
      section: "S12",
      classification: "C",
      dependencies: ["f280.mode", "airTightness.infiltrationMethod"],
      label: "Infiltration Method in Effect (annual)",
      compute: (inputs) => (inputs["f280.mode"] === "On" && inputs["airTightness.infiltrationMethod"] === "AIM2" ? "AIM2" : "OBJECTIVE")
    });

    // ========================================================================
    // F280 PEAK ENVELOPE HEAT LOSS (CSA F280-12 Cl. 5.2.1, 5.2.2)
    // Parnas: docs/parnas-tables/f280/peak-envelope-heat-loss.json
    //
    // The F280 stream's own: above grade U·A × DTDh (S15 d_137's air-facing half) + BELOW grade by
    // BASESIMP, Cl. 5.2.2.1 ("the spreadsheet calculation called BasementHLR.xls shall be used"),
    // whatever S03 G.4.3 says (it read d_137, which followed G.4.3 - 2026-11-19, two streams).
    // ========================================================================

    graph.registerNode({
      id: "f280.peakEnvelopeHeatLoss",
      legacyId: "f280_hl_env",
      section: "SF280",
      classification: "C",
      dependencies: [
        "envelope.airFacing.uValue",
        "envelope.airFacing.area",
        "climate.heating.obcSetpoint", // the DESIGN set-point (F280 Cl. 4.2: 22 °C)
        "climate.temperature.coldest",
        "ground.basesimp"
      ],
      label: "F280 Peak Envelope Heat Loss (W)",
      compute: (inputs) => {
        // BASESIMP missing an input: Unavailable (its reason on S03 G.4.10), never a 0 W foundation
        const bs = inputs["ground.basesimp"];
        if (!bs || bs.error) return "Unavailable";
        const dT = Math.max(0, parseNum(inputs["climate.heating.obcSetpoint"], 22) - parseNum(inputs["climate.temperature.coldest"], -22));
        const air = parseNum(inputs["envelope.airFacing.uValue"]) * parseNum(inputs["envelope.airFacing.area"]) * dT;
        return Math.round(air + bs.heatingLoad);
      }
    });

    // ========================================================================
    // F280 PEAK AIR-LEAKAGE HEAT LOSS (CSA F280-12 Cl. 5.2.3): HLairb = LRairh × Vb / 3.6 × DTDh × 1.2,
    // LRairh = AIM2.xls's ("the output from the spreadsheet"). The F280 stream's own, whatever S12 B.19.1
    // says (2026-11-19, two streams; it took OBJECTIVE's N-factor unless B.19.1 was AIM-2). AIM-2 missing
    // an input: Unavailable.
    // ========================================================================

    graph.registerNode({
      id: "f280.peakInfiltrationHeatLoss",
      legacyId: "f280_hl_inf",
      section: "SF280",
      classification: "C",
      dependencies: [
        "climate.heating.obcSetpoint", // the DESIGN set-point (F280 Cl. 4.2: 22 °C)
        "climate.temperature.coldest",
        "airTightness.aim2",
        "volume.conditioned"
      ],
      label: "F280 Peak Infiltration Heat Loss (W)",
      compute: (inputs) => {
        const r = inputs["airTightness.aim2"];
        if (!r || r.error) return "Unavailable";
        const dT = parseNum(inputs["climate.heating.obcSetpoint"], 22) - parseNum(inputs["climate.temperature.coldest"], -22);
        return Math.round(r.design.heating.natural * parseNum(inputs["volume.conditioned"]) / 3.6 * Math.max(0, dT) * F280_AIR);
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
    // F280 PEAK AIR-LEAKAGE HEAT GAIN (CSA F280-12 Cl. 6.2.6): HGsalb = LRairc × Vb / 3.6 × DTDc × 1.2 -
    // AIM-2's, whatever S12 B.19.1 says (two streams, as the loss).
    // ========================================================================

    graph.registerNode({
      id: "f280.peakInfiltrationHeatGain",
      section: "SF280",
      classification: "C",
      dependencies: ["climate.temperature.hottest", "climate.cooling.setpoint", "airTightness.aim2", "volume.conditioned"],
      label: "F280 Peak Air-Leakage Heat Gain (W)",
      compute: (inputs) => {
        const r = inputs["airTightness.aim2"];
        if (!r || r.error) return "Unavailable";
        const deltaT = parseNum(inputs["climate.temperature.hottest"], 34) - parseNum(inputs["climate.cooling.setpoint"], 24);
        return r.design.cooling.natural * parseNum(inputs["volume.conditioned"]) / 3.6 * Math.max(0, deltaT) * F280_AIR;
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
    // F280 PEAK SOLAR HEAT GAIN THROUGH GLAZING (CSA F280-12 Cl. 6.2.2.1)
    //
    // HGct = A × (SHGC × Solar + DTDc / RSI): the DTDc / RSI half is the enclosure term (d_138's U·A·ΔT
    // carries the windows), so this is Σ A × SHGC × Solar over S10's glazing rows 73-78, each row's
    // summer shading (h_) taken off (Andy 2026-11-18: shading is each row's slider; F280-1's sliders
    // carry Annex A's shaded area treated as north). Solar = Solar0 by the row's facing (the clause's
    // table, W/m²) × LFactor = 1 + (latitude − 40) × 0.0375, held to 0.7-1.3, on S, SE and SW only.
    // The latitude is F280's own for S03's city (F280Weather.js; a city F280 does not list takes its
    // nearest's). OBJECTIVE's "Average" facing has no Solar0: it takes the mean of the eight compass
    // points' Solar (Andy 2026-11-19: "Yes that's a right assumption"). It replaces S15's season-average solar
    // (the glazing rows' ISO 52016 share ÷ cooling-season hours, F280-1 289 W).
    // ========================================================================

    const F280_SOLAR0 = {
      North: 93, NorthEast: 194, East: 285, SouthEast: 252, South: 160, SouthWest: 252, West: 285, NorthWest: 194,
      Skylight: 534 // the clause's "Horizontal"
    };
    const LATITUDE_CORRECTED = new Set(["South", "SouthEast", "SouthWest"]);
    const f280Solar = (facing, lFactor) => {
      if (facing === "Average") {
        const compass = Object.keys(F280_SOLAR0).filter((k) => k !== "Skylight");
        return compass.reduce((sum, k) => sum + f280Solar(k, lFactor), 0) / compass.length;
      }
      const solar0 = F280_SOLAR0[facing];
      if (solar0 === undefined) return undefined;
      return solar0 * (LATITUDE_CORRECTED.has(facing) ? lFactor : 1);
    };
    const GLAZING_ROWS = [73, 74, 75, 76, 77, 78];

    graph.registerNode({
      id: "f280.peakSolarHeatGain",
      section: "SF280",
      classification: "C",
      dependencies: [
        "climate.location.province",
        "climate.location.city",
        ...GLAZING_ROWS.flatMap((r) => ["area", "orientation", "shgc", "summerShading"].map((k) => `radiantGains.row${r}.${k}`))
      ],
      label: "F280 Peak Solar Heat Gain through Glazing (W)",
      compute: (inputs) => {
        const weather = window.TEUI.F280Weather?.lookup(inputs["climate.location.province"], inputs["climate.location.city"]);
        if (!weather) return "Unavailable"; // no F280 latitude for the city (an NBC group heading)
        const lFactor = Math.min(1.3, Math.max(0.7, 1 + (weather.lat - 40) * 0.0375));
        let total = 0;
        for (const r of GLAZING_ROWS) {
          const area = parseNum(inputs[`radiantGains.row${r}.area`]);
          const shgc = parseNum(inputs[`radiantGains.row${r}.shgc`]);
          if (!(area > 0) || !(shgc > 0)) continue;
          const solar = f280Solar(inputs[`radiantGains.row${r}.orientation`], lFactor);
          if (solar === undefined) return "Unavailable"; // a facing the clause's table has no row for
          const shading = parseNum(inputs[`radiantGains.row${r}.summerShading`]) / 100;
          total += area * shgc * solar * (1 - shading);
        }
        return total;
      }
    });

    // ========================================================================
    // F280 TOTAL SENSIBLE HEAT GAIN (CSA F280-12 Cl. 6.2.9)
    //
    // S15's d_139 terms by OBJECTIVE's own inputs (Andy 2026-11-18: match gains by OBJECTIVE's
    // inputs) - the enclosure (d_138), internal gains (plug + lighting + equipment × area), the
    // occupants' sensible gain as a season average (÷ cooling days × 24) - with d_139's season-average
    // ventilation and solar replaced by the design-condition terms, Cl. 6.2.7 and Cl. 6.2.2.1, plus the
    // air leakage (Cl. 6.2.6).
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
        "internal.occupants.coolingGain",
        "cooling.iso52016",
        "climate.coolingDays",
        "f280.peakSolarHeatGain",
        "f280.peakInfiltrationHeatGain",
        "f280.peakVentilationHeatGain"
      ],
      label: "F280 Total Sensible Heat Gain (W)",
      compute: (inputs) => {
        if (inputs["f280.peakInfiltrationHeatGain"] === "Unavailable") return "Unavailable";
        if (inputs["f280.peakVentilationHeatGain"] === "Unavailable") return "Unavailable";
        if (inputs["f280.peakSolarHeatGain"] === "Unavailable") return "Unavailable";
        const enclosure = parseNum(inputs["energy.peakCooling.enclosureKw"]) * 1000;
        const density = parseNum(inputs["internal.plugLoadDensity"]) + parseNum(inputs["internal.lightingDensity"]) +
          parseNum(inputs["internal.equipmentDensity"]);
        const internal = density * parseNum(inputs["building.conditionedFloorArea"], 1);
        const latent = inputs["cooling.iso52016"]?.latent;
        const occupantsKwh = parseNum(inputs["internal.occupants.coolingGain"]) - (latent?.people ?? 0);
        const hours = parseNum(inputs["climate.coolingDays"], 120) * 24;
        const occupants = hours > 0 ? (occupantsKwh / hours) * 1000 : 0;
        return enclosure + internal + occupants + parseNum(inputs["f280.peakSolarHeatGain"]) +
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
