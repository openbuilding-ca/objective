/**
 * KeyValuesNodes.js - Dashboard Key Values (S01)
 *
 * Consumer section that calculates and displays:
 * - T.1 Lifetime Carbon (e_6, h_6, k_6)
 * - T.2 Annual Carbon (e_8, h_8, k_8)
 * - T.3 TEUI (e_10, h_10, k_10)
 * - Tier indicators (f_10, i_10)
 * - Percentages (j_8, j_10, m_6, m_8, m_10)
 *
 * Formulas derived from Section01.js:
 * - e_10 = ref_j_32 / ref_h_15 (Reference TEUI)
 * - h_10 = j_32 / h_15 (Target TEUI)
 * - e_8 = ref_k_32 / ref_h_15 (Reference Annual Carbon)
 * - h_8 = k_32 / h_15 (Target Annual Carbon)
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
    // INPUTS - User selections affecting display
    // ========================================================================
    const inputs = [
      { id: "keyValues.useType", legacyId: "d_14", section: "S01", classification: "G", label: "Use Type", defaultValue: "Targeted Use" },
    ];

    graph.registerInputs(inputs);

    // ========================================================================
    // REFERENCE MODEL INPUTS - Needed for reference column calculations
    // These come from the Reference model system via StateManager
    // ========================================================================

    graph.registerInput({
      id: "reference.energy.total",
      legacyId: "ref_j_32",
      section: "S01",
      classification: "C",
      label: "Reference Total Energy (kWh/yr)",
      defaultValue: 0,
    });

    graph.registerInput({
      id: "reference.emissions.subtotal",
      legacyId: "ref_k_32",
      section: "S01",
      classification: "C",
      label: "Reference Emissions Subtotal (kgCO2e/yr)",
      defaultValue: 0,
    });

    graph.registerInput({
      id: "reference.building.conditionedFloorArea",
      legacyId: "ref_h_15",
      section: "S01",
      classification: "C",
      label: "Reference Floor Area (m²)",
      defaultValue: 1,
    });

    graph.registerInput({
      id: "reference.emissions.embodied",
      legacyId: "ref_i_41",
      section: "S01",
      classification: "C",
      label: "Reference Embodied Emissions (kgCO2e)",
      defaultValue: 0,
    });

    graph.registerInput({
      id: "reference.building.serviceLife",
      legacyId: "ref_h_13",
      section: "S01",
      classification: "C",
      label: "Reference Service Life (years)",
      defaultValue: 50,
    });

    // ========================================================================
    // REFERENCE COLUMN (E) - Calculated from reference model values
    // ========================================================================

    // e_10 = ref_j_32 / ref_h_15 (Reference TEUI)
    graph.registerNode({
      id: "keyValues.reference.teui",
      legacyId: "e_10",
      section: "S01",
      classification: "C",
      dependencies: ["reference.energy.total", "reference.building.conditionedFloorArea"],
      label: "Reference TEUI (kWh/m²/yr)",
      compute: (inputs) => {
        const refEnergy = parseNum(inputs["reference.energy.total"]);
        const refArea = parseNum(inputs["reference.building.conditionedFloorArea"], 1);
        return refArea > 0 ? Math.round((refEnergy / refArea) * 10) / 10 : 0;
      },
    });

    // e_8 = ref_k_32 / ref_h_15 (Reference Annual Carbon)
    graph.registerNode({
      id: "keyValues.reference.annualCarbon",
      legacyId: "e_8",
      section: "S01",
      classification: "C",
      dependencies: ["reference.emissions.subtotal", "reference.building.conditionedFloorArea"],
      label: "Reference Annual Carbon (kgCO2e/m²/yr)",
      compute: (inputs) => {
        const refEmissions = parseNum(inputs["reference.emissions.subtotal"]);
        const refArea = parseNum(inputs["reference.building.conditionedFloorArea"], 1);
        return refArea > 0 ? Math.round((refEmissions / refArea) * 10) / 10 : 0;
      },
    });

    // e_6 = ref_i_41 / ref_h_13 + e_8 (Reference Lifetime Carbon)
    graph.registerNode({
      id: "keyValues.reference.lifetimeCarbon",
      legacyId: "e_6",
      section: "S01",
      classification: "C",
      dependencies: ["reference.emissions.embodied", "reference.building.serviceLife", "keyValues.reference.annualCarbon"],
      label: "Reference Lifetime Carbon (kgCO2e/m²)",
      compute: (inputs) => {
        const refEmbodied = parseNum(inputs["reference.emissions.embodied"]);
        const refServiceLife = parseNum(inputs["reference.building.serviceLife"], 50);
        const e_8 = parseNum(inputs["keyValues.reference.annualCarbon"]);
        return refServiceLife > 0
          ? Math.round((refEmbodied / refServiceLife + e_8) * 10) / 10
          : 0;
      },
    });

    // ========================================================================
    // TARGET COLUMN (H) - Calculated from target values
    // ========================================================================

    // h_10 = j_32 / h_15 (Target TEUI) OR use computed TEUI from energy.teui
    graph.registerNode({
      id: "keyValues.target.teui",
      legacyId: "h_10",
      section: "S01",
      classification: "C",
      dependencies: ["energy.target.total", "building.conditionedFloorArea"],
      label: "Target TEUI (kWh/m²/yr)",
      compute: (inputs) => {
        const targetEnergy = parseNum(inputs["energy.target.total"]);
        const targetArea = parseNum(inputs["building.conditionedFloorArea"], 1);
        return targetArea > 0 ? Math.round((targetEnergy / targetArea) * 10) / 10 : 0;
      },
    });

    // h_8 = k_32 / h_15 (Target Annual Carbon)
    graph.registerNode({
      id: "keyValues.target.annualCarbon",
      legacyId: "h_8",
      section: "S01",
      classification: "C",
      dependencies: ["emissions.target.subtotal", "building.conditionedFloorArea"],
      label: "Target Annual Carbon (kgCO2e/m²/yr)",
      compute: (inputs) => {
        const targetEmissions = parseNum(inputs["emissions.target.subtotal"]);
        const targetArea = parseNum(inputs["building.conditionedFloorArea"], 1);
        return targetArea > 0 ? Math.round((targetEmissions / targetArea) * 10) / 10 : 0;
      },
    });

    // h_6 = i_41 / h_13 + h_8 (Target Lifetime Carbon)
    graph.registerNode({
      id: "keyValues.target.lifetimeCarbon",
      legacyId: "h_6",
      section: "S01",
      classification: "C",
      dependencies: ["emissions.modelledEmbodied", "building.serviceLife", "keyValues.target.annualCarbon"],
      label: "Target Lifetime Carbon (kgCO2e/m²)",
      compute: (inputs) => {
        const embodied = parseNum(inputs["emissions.modelledEmbodied"]);
        const serviceLife = parseNum(inputs["building.serviceLife"], 50);
        const h_8 = parseNum(inputs["keyValues.target.annualCarbon"]);
        return serviceLife > 0
          ? Math.round((embodied / serviceLife + h_8) * 10) / 10
          : 0;
      },
    });

    // ========================================================================
    // ACTUAL COLUMN (K) - From utility bills
    // ========================================================================

    // k_10 = f_32 / h_15 (Actual TEUI)
    graph.registerNode({
      id: "keyValues.actual.teui",
      legacyId: "k_10",
      section: "S01",
      classification: "C",
      dependencies: ["energy.actual.total", "building.conditionedFloorArea", "keyValues.useType"],
      label: "Actual TEUI (kWh/m²/yr)",
      compute: (inputs) => {
        const useType = inputs["keyValues.useType"] || "Targeted Use";
        if (useType !== "Utility Bills") return "N/A";

        const actualEnergy = parseNum(inputs["energy.actual.total"]);
        const area = parseNum(inputs["building.conditionedFloorArea"], 1);
        return area > 0 ? Math.round((actualEnergy / area) * 10) / 10 : 0;
      },
    });

    // k_8 = g_32 / h_15 (Actual Annual Carbon)
    graph.registerNode({
      id: "keyValues.actual.annualCarbon",
      legacyId: "k_8",
      section: "S01",
      classification: "C",
      dependencies: ["emissions.actual.subtotal", "building.conditionedFloorArea", "keyValues.useType"],
      label: "Actual Annual Carbon (kgCO2e/m²/yr)",
      compute: (inputs) => {
        const useType = inputs["keyValues.useType"] || "Targeted Use";
        if (useType !== "Utility Bills") return "N/A";

        const actualEmissions = parseNum(inputs["emissions.actual.subtotal"]);
        const area = parseNum(inputs["building.conditionedFloorArea"], 1);
        return area > 0 ? Math.round((actualEmissions / area) * 10) / 10 : 0;
      },
    });

    // k_6 = i_41 / h_13 + k_8 (Actual Lifetime Carbon)
    graph.registerNode({
      id: "keyValues.actual.lifetimeCarbon",
      legacyId: "k_6",
      section: "S01",
      classification: "C",
      dependencies: ["emissions.modelledEmbodied", "building.serviceLife", "keyValues.actual.annualCarbon", "keyValues.useType"],
      label: "Actual Lifetime Carbon (kgCO2e/m²)",
      compute: (inputs) => {
        const useType = inputs["keyValues.useType"] || "Targeted Use";
        if (useType !== "Utility Bills") return "N/A";

        const embodied = parseNum(inputs["emissions.modelledEmbodied"]);
        const serviceLife = parseNum(inputs["building.serviceLife"], 50);
        const k_8 = parseNum(inputs["keyValues.actual.annualCarbon"]);

        if (typeof k_8 === "string") return "N/A";

        return serviceLife > 0
          ? Math.round((embodied / serviceLife + k_8) * 10) / 10
          : 0;
      },
    });

    // ========================================================================
    // TIER CALCULATIONS
    // ========================================================================

    // i_10 = Tier based on TEUI reduction from reference
    graph.registerNode({
      id: "keyValues.target.tier",
      legacyId: "i_10",
      section: "S01",
      classification: "C",
      dependencies: ["keyValues.target.teui", "keyValues.reference.teui", "building.referenceStandard"],
      label: "Target TEUI Tier",
      compute: (inputs) => {
        const h_10 = parseNum(inputs["keyValues.target.teui"]);
        const e_10 = parseNum(inputs["keyValues.reference.teui"]);
        const standard = inputs["building.referenceStandard"] || "";

        if (e_10 <= 0) return "No Tier";

        const reduction = 1 - h_10 / e_10;
        const standardLower = standard.toLowerCase();
        const isCodeStandard =
          standardLower.includes("nbc") ||
          standardLower.includes("obc") ||
          standardLower.includes("necb");

        if (isCodeStandard) {
          if (reduction > 0.7) return "tier5";
          if (reduction > 0.6) return "tier4";
          if (reduction > 0.5) return "tier3";
          if (reduction > 0.4) return "tier2";
          return "tier1";
        } else {
          if (reduction > 0.6) return "tier4";
          if (reduction > 0.45) return "tier3";
          if (reduction > 0.2) return "tier2";
          if (reduction > 0.1) return "tier1";
          return "No Tier";
        }
      },
    });

    // f_10 = Reference tier (always tier1)
    graph.registerNode({
      id: "keyValues.reference.tier",
      legacyId: "f_10",
      section: "S01",
      classification: "C",
      dependencies: [],
      label: "Reference TEUI Tier",
      compute: () => "tier1",
    });

    // ========================================================================
    // PERCENTAGE CALCULATIONS
    // ========================================================================

    // j_8 = Annual Carbon reduction percentage
    graph.registerNode({
      id: "keyValues.annualCarbon.reductionPercent",
      legacyId: "j_8",
      section: "S01",
      classification: "C",
      dependencies: ["keyValues.reference.annualCarbon", "keyValues.target.annualCarbon", "keyValues.actual.annualCarbon", "keyValues.useType"],
      label: "Annual Carbon Reduction %",
      compute: (inputs) => {
        const e_8 = parseNum(inputs["keyValues.reference.annualCarbon"]);
        const h_8 = parseNum(inputs["keyValues.target.annualCarbon"]);
        const k_8 = inputs["keyValues.actual.annualCarbon"];
        const useType = inputs["keyValues.useType"] || "Targeted Use";

        if (e_8 === 0) return "0%";

        const valueToUse = useType === "Utility Bills" && typeof k_8 === "number" ? k_8 : h_8;
        const reduction = Math.round((1 - valueToUse / e_8) * 100);
        return `${reduction}%`;
      },
    });

    // j_10 = TEUI reduction percentage
    graph.registerNode({
      id: "keyValues.teui.reductionPercent",
      legacyId: "j_10",
      section: "S01",
      classification: "C",
      dependencies: ["keyValues.reference.teui", "keyValues.target.teui", "keyValues.actual.teui", "keyValues.useType"],
      label: "TEUI Reduction %",
      compute: (inputs) => {
        const e_10 = parseNum(inputs["keyValues.reference.teui"]);
        const h_10 = parseNum(inputs["keyValues.target.teui"]);
        const k_10 = inputs["keyValues.actual.teui"];
        const useType = inputs["keyValues.useType"] || "Targeted Use";

        if (e_10 === 0) return "0%";

        const valueToUse = useType === "Utility Bills" && typeof k_10 === "number" ? k_10 : h_10;
        const reduction = Math.round((1 - valueToUse / e_10) * 100);
        return `${reduction}%`;
      },
    });

    // m_8 = Annual Carbon remaining percentage (100% - j_8)
    graph.registerNode({
      id: "keyValues.annualCarbon.remainingPercent",
      legacyId: "m_8",
      section: "S01",
      classification: "C",
      dependencies: ["keyValues.annualCarbon.reductionPercent"],
      label: "Annual Carbon Remaining %",
      compute: (inputs) => {
        const j_8 = inputs["keyValues.annualCarbon.reductionPercent"] || "0%";
        const reduction = parseNum(j_8.replace("%", ""));
        return `${100 - reduction}%`;
      },
    });

    // m_10 = TEUI remaining percentage (100% - j_10)
    graph.registerNode({
      id: "keyValues.teui.remainingPercent",
      legacyId: "m_10",
      section: "S01",
      classification: "C",
      dependencies: ["keyValues.teui.reductionPercent"],
      label: "TEUI Remaining %",
      compute: (inputs) => {
        const j_10 = inputs["keyValues.teui.reductionPercent"] || "0%";
        const reduction = parseNum(j_10.replace("%", ""));
        return `${100 - reduction}%`;
      },
    });

    // m_6 = Lifetime Carbon percentage (complex formula based on carbon standard)
    // Formula: IF(I40="N/A","N/A",IF(D15="BR18",((I41/H13)+K8)/12,IF(D15="IPCC EPC",3.39,IF(D15="IPCC EA",4.07,IF(D15="TGS4",I41/I39,"N/A")))))
    graph.registerNode({
      id: "keyValues.lifetimeCarbon.percent",
      legacyId: "m_6",
      section: "S01",
      classification: "C",
      dependencies: [
        "emissions.modelledEmbodied",
        "building.serviceLife",
        "building.carbonStandard",
        "building.typologyEmbodiedCarbon",
        "building.embodiedCarbonTarget",
        "keyValues.actual.annualCarbon",
        "keyValues.target.annualCarbon",
        "keyValues.useType",
        "emissions.typologyStatus"
      ],
      label: "Lifetime Carbon %",
      compute: (inputs) => {
        const d_15 = inputs["building.carbonStandard"] || "";
        const i_41 = parseNum(inputs["emissions.modelledEmbodied"]);
        const i_39 = parseNum(inputs["building.typologyEmbodiedCarbon"]);
        const h_13 = parseNum(inputs["building.serviceLife"], 50);
        const k_8 = inputs["keyValues.actual.annualCarbon"];
        const h_8 = parseNum(inputs["keyValues.target.annualCarbon"]);
        const useType = inputs["keyValues.useType"] || "Targeted Use";
        const i_40 = inputs["emissions.typologyStatus"] || "";

        // If i_40 is N/A, return N/A
        if (i_40 === "N/A") {
          return "N/A";
        }

        const k_8_calc = useType === "Utility Bills" && typeof k_8 === "number" ? k_8 : h_8;

        // Excel formula logic
        if (d_15 === "BR18 (Denmark)") {
          if (h_13 > 0) {
            const result = (i_41 / h_13 + k_8_calc) / 12;
            return `${Math.round(result * 100)}%`;
          }
        } else if (d_15 === "IPCC AR6 EPC" || d_15 === "IPCC AR6 EA") {
          const d_16 = parseNum(inputs["building.embodiedCarbonTarget"]);
          if (d_16 > 0) {
            const result = i_41 / d_16;
            return `${Math.round(result * 100)}%`;
          }
          return "N/A";
        } else if (d_15 === "TGS4 Tier 2" || d_15 === "TGS4 Tier 3") {
          // TGS4 Tier 2/3: i_41 / d_16 (modelled embodied carbon vs adopted cap)
          const d_16 = parseNum(inputs["building.embodiedCarbonTarget"]);
          if (d_16 > 0) {
            const result = i_41 / d_16;
            return `${Math.round(result * 100)}%`;
          }
          return "N/A";
        } else if (d_15 === "TGS4") {
          // TGS4 "Typical Values": backward compat, i_41 / i_39
          if (i_39 > 0) {
            const result = i_41 / i_39;
            return `${Math.round(result * 100)}%`;
          }
          return "N/A";
        }

        return "N/A";
      },
    });

    console.log("[KeyValuesNodes] Registered", inputs.length, "inputs");
  }

  window.TEUI.ComputationNodes.KeyValues = { register };
  console.log("[KeyValuesNodes] Module loaded");
})();
