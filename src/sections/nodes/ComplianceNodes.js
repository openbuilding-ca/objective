/**
 * ComplianceNodes.js - Cross-Model Compliance Ratio Computation Nodes
 *
 * This module implements the cross-model comparison mechanism for compliance ratios.
 * Compliance ratios compare Target model values against Reference model values.
 *
 * Pattern:
 * 1. Register "reference.*" input nodes for Reference model values
 * 2. After both models compute, Reference values are copied to Target's reference.* inputs
 * 3. Compliance ratio nodes depend on both target values and reference.* inputs
 *
 * Key calculations:
 * - m_115: AFUE compliance ratio (target_j_115 / ref_j_115)
 * - m_116: COPc compliance ratio (target_j_116 / ref_j_116)
 * - m_117: Cooling intensity compliance ratio (INVERTED: ref_f_117 / target_f_117)
 * - m_113: HSPF compliance ratio (target_f_113 / ref_f_113)
 * - n_115, n_116, n_117, n_113: Pass/fail symbols
 * - n_124: Free cooling compliance status
 *
 * Parnas Tables: docs/parnas-tables/mechanical/
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

  // ============================================================================
  // REFERENCE INPUT NODES
  // These are populated from the Reference model after computation
  // ============================================================================

  const ComplianceInputs = [
    // AFUE (Annual Fuel Utilization Efficiency)
    {
      id: "reference.mechanical.heating.afue",
      legacyId: "ref_j_115",
      defaultValue: 0.92,
      classification: "C",
      section: "S13",
      label: "Reference AFUE"
    },
    // HSPF (Heat Pump Seasonal Performance Factor)
    {
      id: "reference.mechanical.heating.hspf",
      legacyId: "ref_f_113",
      defaultValue: 12.5,
      classification: "C",
      section: "S13",
      label: "Reference HSPF"
    },
    // Cooling COP (dedicated system)
    {
      id: "reference.mechanical.cooling.copDedicated",
      legacyId: "ref_j_116",
      defaultValue: 2.66,
      classification: "C",
      section: "S13",
      label: "Reference Cooling COP"
    },
    // Cooling COP in effect (heat pump: from its HSPF; Reference: the
    // standard's minimum COPc) - what m_116 compares. No legacyId: never a
    // field, never in a file.
    {
      id: "reference.mechanical.cooling.effectiveCop",
      defaultValue: 0,
      classification: "C",
      section: "S13",
      label: "Reference Effective Cooling COP"
    },
    // Cooling Intensity
    {
      id: "reference.mechanical.cooling.intensity",
      legacyId: "ref_f_117",
      defaultValue: 0,
      classification: "C",
      section: "S13",
      label: "Reference Cooling Intensity",
      unit: "kWh/m2"
    },
    // SRE (Sensible Recovery Efficiency)
    {
      id: "reference.mechanical.ventilation.efficiency",
      legacyId: "ref_d_118",
      defaultValue: 55,
      classification: "C",
      section: "S13",
      label: "Reference SRE",
      unit: "%"
    },
    // Ventilation Rate
    {
      id: "reference.mechanical.ventilation.ratePerPerson",
      legacyId: "ref_d_119",
      defaultValue: 10,
      classification: "C",
      section: "S13",
      label: "Reference Ventilation Rate",
      unit: "L/s/person"
    },
    // Days of Mechanical Cooling
    {
      id: "reference.mechanical.cooling.mechanicalDays",
      legacyId: "ref_m_124",
      defaultValue: 0,
      classification: "C",
      section: "S13",
      label: "Reference Mechanical Cooling Days",
      unit: "days"
    }
  ];

  // ============================================================================
  // COMPLIANCE RATIO COMPUTATION NODES
  // ============================================================================

  const ComplianceNodes = [
    // ========================================================================
    // HSPF Compliance Ratio (m_113)
    // ========================================================================
    {
      id: "compliance.hspf.ratio",
      legacyId: "m_113",
      dependencies: [
        "mechanical.heating.hspf",
        "reference.mechanical.heating.hspf"
      ],
      classification: "C",
      section: "S13",
      label: "HSPF Compliance Ratio",
      compute: (inputs) => {
        // Parnas table: standard compliance ratio pattern
        // Higher HSPF is better, so target/ref * 100 for percentage
        const targetHSPF = parseNum(inputs["mechanical.heating.hspf"], 0);
        const refHSPF = parseNum(inputs["reference.mechanical.heating.hspf"], 0);

        if (refHSPF > 0) {
          return +((targetHSPF / refHSPF) * 100).toFixed(0);
        }
        return 100; // Default to 100% if no reference
      }
    },
    {
      id: "compliance.hspf.pass",
      legacyId: "n_113",
      dependencies: ["compliance.hspf.ratio"],
      classification: "C",
      section: "S13",
      label: "HSPF Compliance Status",
      compute: (inputs) => {
        const ratio = parseNum(inputs["compliance.hspf.ratio"], 100);
        return ratio >= 100 ? "✓" : "✗";
      }
    },

    // ========================================================================
    // AFUE Compliance Ratio (m_115)
    // ========================================================================
    {
      id: "compliance.afue.ratio",
      legacyId: "m_115",
      dependencies: [
        "mechanical.heating.afue",
        "reference.mechanical.heating.afue"
      ],
      classification: "C",
      section: "S13",
      label: "AFUE Compliance Ratio",
      compute: (inputs) => {
        // Parnas table: afue-compliance-ratio.json
        // Higher AFUE is better, so target/ref * 100 for percentage
        const targetAFUE = parseNum(inputs["mechanical.heating.afue"], 0);
        const refAFUE = parseNum(inputs["reference.mechanical.heating.afue"], 0);

        if (refAFUE > 0) {
          return +((targetAFUE / refAFUE) * 100).toFixed(0);
        }
        return 100; // Default to 100% if no reference
      }
    },
    {
      id: "compliance.afue.pass",
      legacyId: "n_115",
      dependencies: ["compliance.afue.ratio"],
      classification: "C",
      section: "S13",
      label: "AFUE Compliance Status",
      compute: (inputs) => {
        const ratio = parseNum(inputs["compliance.afue.ratio"], 100);
        return ratio >= 100 ? "✓" : "✗";
      }
    },

    // ========================================================================
    // Cooling COP Compliance Ratio (m_116)
    // ========================================================================
    {
      id: "compliance.copc.ratio",
      legacyId: "m_116",
      dependencies: [
        "mechanical.cooling.effectiveCop",
        "reference.mechanical.cooling.effectiveCop"
      ],
      classification: "C",
      section: "S13",
      label: "Cooling COP Compliance Ratio",
      compute: (inputs) => {
        // Parnas table: copc-compliance-ratio.json
        // Higher COP is better, so target/ref * 100 for percentage. The COP IN
        // EFFECT on each side (2026-11-04): it compared the dedicated j_116,
        // which a heat pump never uses - its greyed 2.66 default against the
        // standard's 3.3 read 81 % whatever the HSPF. "No Cooling" has no COP
        // to compare (0): the row is ghosted, 100 %.
        const targetCOP = parseNum(inputs["mechanical.cooling.effectiveCop"], 0);
        const refCOP = parseNum(inputs["reference.mechanical.cooling.effectiveCop"], 0);

        if (targetCOP > 0 && refCOP > 0) {
          return +((targetCOP / refCOP) * 100).toFixed(0);
        }
        return 100; // Default to 100% if no reference
      }
    },
    {
      id: "compliance.copc.pass",
      legacyId: "n_116",
      dependencies: ["compliance.copc.ratio"],
      classification: "C",
      section: "S13",
      label: "Cooling COP Compliance Status",
      compute: (inputs) => {
        const ratio = parseNum(inputs["compliance.copc.ratio"], 100);
        return ratio >= 100 ? "✓" : "✗";
      }
    },

    // ========================================================================
    // Cooling Intensity Compliance Ratio (m_117) - INVERTED
    // ========================================================================
    {
      id: "compliance.coolingIntensity.ratio",
      legacyId: "m_117",
      dependencies: [
        "mechanical.cooling.intensity",
        "reference.mechanical.cooling.intensity"
      ],
      classification: "C",
      section: "S13",
      label: "Cooling Intensity Compliance Ratio",
      compute: (inputs) => {
        // Parnas table: cooling-intensity-compliance-ratio.json
        // INVERTED: Lower intensity is better, so ref/target * 100 for percentage
        const targetIntensity = parseNum(inputs["mechanical.cooling.intensity"], 0);
        const refIntensity = parseNum(inputs["reference.mechanical.cooling.intensity"], 0);

        if (targetIntensity > 0) {
          return +((refIntensity / targetIntensity) * 100).toFixed(0);
        }
        return 100; // Default to 100% if no target intensity
      }
    },
    {
      id: "compliance.coolingIntensity.pass",
      legacyId: "n_117",
      dependencies: ["compliance.coolingIntensity.ratio"],
      classification: "C",
      section: "S13",
      label: "Cooling Intensity Compliance Status",
      compute: (inputs) => {
        const ratio = parseNum(inputs["compliance.coolingIntensity.ratio"], 100);
        return ratio >= 100 ? "✓" : "✗";
      }
    },

    // ========================================================================
    // SRE Compliance Ratio (m_118)
    // ========================================================================
    {
      id: "compliance.sre.ratio",
      legacyId: "m_118",
      dependencies: [
        "mechanical.ventilation.efficiency",
        "reference.mechanical.ventilation.efficiency"
      ],
      classification: "C",
      section: "S13",
      label: "SRE Compliance Ratio",
      compute: (inputs) => {
        // Higher SRE is better, so target/ref * 100 for percentage
        const targetSRE = parseNum(inputs["mechanical.ventilation.efficiency"], 0);
        const refSRE = parseNum(inputs["reference.mechanical.ventilation.efficiency"], 0);

        if (refSRE > 0) {
          return +((targetSRE / refSRE) * 100).toFixed(0);
        }
        return 100;
      }
    },
    {
      id: "compliance.sre.pass",
      legacyId: "n_118",
      dependencies: ["compliance.sre.ratio"],
      classification: "C",
      section: "S13",
      label: "SRE Compliance Status",
      compute: (inputs) => {
        const ratio = parseNum(inputs["compliance.sre.ratio"], 100);
        return ratio >= 100 ? "✓" : "✗";
      }
    },

    // ========================================================================
    // Ventilation Rate: the code's outdoor air (V.1.4, m_119)
    // ========================================================================
    // Andy 2026-11-18: the check compares what the system delivers with what
    // the code requires of THIS building - OBC 2024 / NBC 2025 Art.
    // 6.3.1.1.(2), ASHRAE 62.1-2016's Ventilation Rate Procedure:
    //   required  Vbz = Rp x occupants + Ra x floor area (VentilationRates.js,
    //             Rp and Ra by the B.1 space type)
    //   delivered the rate while occupied, by the Ventil. Method - ACH x volume
    //             / 3.6 (Volume) or L/s per person x occupants (Occupant); a
    //             schedule does not enter: the minimum applies while occupied.
    // It was Target per-person / Reference per-person whatever the method: the
    // default building (Volume by Schedule, which never uses its per-person
    // rate) read 67% X from the file's Reference 12.50.
    {
      id: "ventilation.requiredOutdoorAir",
      // A Part 9 building (C-Residential, 3 storeys or less, footprint 600 m2
      // or less, not under a Part 3 energy standard - Andy 2026-11-18) takes
      // OBC Table 9.32.3.3's fan minimum per dwelling unit instead
      // (VentilationRates.requiredForBuilding).
      dependencies: [
        "building.majorOccupancy",
        "building.ventilationSpaceType",
        "building.referenceStandard",
        "occupancy.occupants",
        "occupancy.bedrooms",
        "occupancy.dwellingUnits",
        "volume.numStoreys",
        "building.conditionedFloorArea"
      ],
      classification: "C",
      section: "S13",
      label: "Required Outdoor Air (ASHRAE 62.1 Vbz, or OBC 9.32.3.3 for a Part 9 house)",
      unit: "L/s",
      compute: (inputs) => {
        const rates = window.TEUI.VentilationRates;
        if (!rates) return 0;
        return +rates
          .requiredForBuilding({
            occupancy: inputs["building.majorOccupancy"],
            spaceType: inputs["building.ventilationSpaceType"],
            standard: inputs["building.referenceStandard"],
            occupants: parseNum(inputs["occupancy.occupants"], 0),
            bedrooms: inputs["occupancy.bedrooms"],
            units: inputs["occupancy.dwellingUnits"],
            storeys: parseNum(inputs["volume.numStoreys"], 1),
            area: parseNum(inputs["building.conditionedFloorArea"], 0)
          })
          .ls.toFixed(2);
      }
    },
    {
      id: "ventilation.deliveredOccupied",
      dependencies: [
        "mechanical.ventilation.method",
        "mechanical.ventilation.ach",
        "mechanical.ventilation.ratePerPerson",
        "volume.conditioned",
        "occupancy.occupants"
      ],
      classification: "C",
      section: "S13",
      label: "Outdoor Air Delivered While Occupied",
      unit: "L/s",
      compute: (inputs) => {
        const method = inputs["mechanical.ventilation.method"] || "Volume by Schedule";
        if (method.startsWith("Occupant")) {
          return +(
            parseNum(inputs["mechanical.ventilation.ratePerPerson"], 0) *
            parseNum(inputs["occupancy.occupants"], 0)
          ).toFixed(2);
        }
        return +(
          (parseNum(inputs["mechanical.ventilation.ach"], 0) *
            parseNum(inputs["volume.conditioned"], 0)) /
          3.6
        ).toFixed(2);
      }
    },
    {
      id: "compliance.ventRate.ratio",
      legacyId: "m_119",
      dependencies: ["ventilation.deliveredOccupied", "ventilation.requiredOutdoorAir"],
      classification: "C",
      section: "S13",
      label: "Outdoor Air Delivered / Required (ASHRAE 62.1)",
      compute: (inputs) => {
        const delivered = parseNum(inputs["ventilation.deliveredOccupied"], 0);
        const required = parseNum(inputs["ventilation.requiredOutdoorAir"], 0);
        if (required > 0) {
          return +((delivered / required) * 100).toFixed(0);
        }
        return 100;
      }
    },
    {
      id: "compliance.ventRate.pass",
      legacyId: "n_119",
      dependencies: ["compliance.ventRate.ratio"],
      classification: "C",
      section: "S13",
      label: "Ventilation Rate Compliance Status",
      compute: (inputs) => {
        const ratio = parseNum(inputs["compliance.ventRate.ratio"], 100);
        return ratio >= 100 ? "✓" : "✗";
      }
    },

    // ========================================================================
    // Free Cooling Compliance (n_124)
    // ========================================================================
    {
      id: "compliance.freeCooling.status",
      legacyId: "n_124",
      dependencies: ["cooling.daysActiveCooling"],
      classification: "C",
      section: "S13",
      label: "Free Cooling Compliance Status",
      compute: (inputs) => {
        // Parnas table: free-cooling-compliance.json
        // m_124 is the number of days requiring mechanical cooling
        const mechanicalDays = parseNum(inputs["cooling.daysActiveCooling"], 0);
        return mechanicalDays <= 0 ? "✓" : "⚠";
      }
    }
  ];

  // ============================================================================
  // REFERENCE OUTPUT TO TARGET INPUT MAPPING
  // This mapping defines which Reference model outputs should be copied to
  // Target model reference.* inputs after Reference model computation.
  // ============================================================================

  const REF_OUTPUT_TO_TARGET_INPUT_MECHANICAL = {
    // Mechanical performance values
    "mechanical.heating.afue":            "reference.mechanical.heating.afue",
    "mechanical.heating.hspf":            "reference.mechanical.heating.hspf",
    "mechanical.cooling.copDedicated":    "reference.mechanical.cooling.copDedicated",
    "mechanical.cooling.effectiveCop":    "reference.mechanical.cooling.effectiveCop",
    "mechanical.cooling.intensity":       "reference.mechanical.cooling.intensity",
    "mechanical.ventilation.efficiency":  "reference.mechanical.ventilation.efficiency",
    "mechanical.ventilation.ratePerPerson": "reference.mechanical.ventilation.ratePerPerson",
    "cooling.daysActiveCooling": "reference.mechanical.cooling.mechanicalDays"
  };

  // ============================================================================
  // REGISTRATION
  // ============================================================================

  function registerComplianceNodes(graph) {
    // Register reference inputs
    for (const input of ComplianceInputs) {
      graph.registerInput(input);
    }

    // Register compliance ratio computed nodes
    for (const node of ComplianceNodes) {
      graph.registerNode(node);
    }

    console.log(
      `[ComplianceNodes] Registered ${ComplianceInputs.length} reference inputs and ${ComplianceNodes.length} compliance nodes`
    );
  }

  function registerComplianceFields() {
    const Registry = window.TEUI.FieldRegistry;
    if (!Registry) return;

    for (const input of ComplianceInputs) {
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

    for (const node of ComplianceNodes) {
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

  window.TEUI.ComputationNodes.Compliance = {
    inputs: ComplianceInputs,
    nodes: ComplianceNodes,
    register: registerComplianceNodes,
    registerFields: registerComplianceFields,
    REF_OUTPUT_TO_TARGET_INPUT: REF_OUTPUT_TO_TARGET_INPUT_MECHANICAL
  };

  console.log("[ComplianceNodes] Module loaded");
})();
