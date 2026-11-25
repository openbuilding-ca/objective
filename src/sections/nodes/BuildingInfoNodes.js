/**
 * BuildingInfoNodes.js - Building Information Inputs (Section 02)
 *
 * Part of the Multi-Model Architecture refactoring
 * See: docs/REFACTORING_PLAN.md
 *
 * S02 provides base inputs that all other sections depend on:
 * - Conditioned floor area (h_15)
 * - Service life (h_13)
 * - Reference standard (d_13)
 * - Actual/Target mode (d_14)
 * - Carbon standard (d_15)
 * - Major occupancy (d_12)
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  // Carbon targets by standard (kgCO2e/m²)
  const CARBON_TARGETS = {
    "Self Reported": null,
    "BR18 (Denmark)": 500,
    "IPCC AR6 EPC": 169.49,
    "IPCC AR6 EA": 8.69,
    "CaGBC ZCB D": 425,
    "CaGBC ZCB P": 425,
    "LEED BD+C v4.1": 500,
    "LEED BD+C v4.1 (40%)": 300,
    "Zero Carbon Building": 250,
    "Passive House": 200,
    "CaGBC Zero Carbon": 175,
  };

  // TGS4 Adopted Embodied Carbon Caps (kgCO2e/m²)
  // Source: City of Toronto TGS Version 4 (adopted values, not Figure 1)
  // Caps do NOT vary by material type — Ryan Zizzo, Mantle Climate
  const TGS4_CAPS = {
    "Part 9 Low-Rise Residential": { "TGS4 Tier 2": 250, "TGS4 Tier 3": null },
    "Part 3 Residential/Commercial": { "TGS4 Tier 2": 350, "TGS4 Tier 3": 250 },
    "Part 3 Other": { "TGS4 Tier 2": 400, "TGS4 Tier 3": 275 },
  };

  /**
   * Maps Major Occupancy + storey count to TGS4 building category.
   * Part 9: residential ≤3 storeys (OBC threshold).
   * Part 3: everything else.
   * See: docs/parnas-tables/emissions/tgs4-building-category.json
   */
  function getTGS4Category(occupancy, storeys) {
    if (occupancy === "C-Residential") {
      return storeys <= 3 ? "Part 9 Low-Rise Residential" : "Part 3 Residential/Commercial";
    }
    if (occupancy === "D-Business & Personal Services" || occupancy === "E-Mercantile") {
      return "Part 3 Residential/Commercial";
    }
    return "Part 3 Other";
  }

  function parseNum(value, defaultVal = 0) {
    if (value === null || value === undefined || value === "N/A") return defaultVal;
    const num = parseFloat(String(value).replace(/,/g, ""));
    return isNaN(num) ? defaultVal : num;
  }

  /**
   * Register all Building Info nodes with the computation graph
   * @param {ComputationGraph} graph
   */
  function register(graph) {
    // ========================================================================
    // INPUT NODES - User editable values
    // ========================================================================

    const inputs = [
      {
        id: "building.conditionedFloorArea",
        legacyId: "h_15",
        section: "S02",
        classification: "G", // Geometry - shared across models
        label: "Conditioned Floor Area (m²)",
        defaultValue: 1427.2,
        validation: { min: 1, max: 1000000 },
      },
      {
        id: "building.serviceLife",
        legacyId: "h_13",
        section: "S02",
        classification: "A", // Model-specific
        label: "Service Life (years)",
        defaultValue: 50,
        validation: { min: 1, max: 100 },
      },
      {
        id: "building.numStoreys",
        legacyId: "d_16_storeys", // Note: different from embodied carbon d_16
        section: "S02",
        classification: "G",
        label: "Number of Storeys",
        defaultValue: 2,
        validation: { min: 1, max: 100 },
      },
      {
        id: "building.ceilingHeight",
        legacyId: "h_17",
        section: "S02",
        classification: "G",
        label: "Ceiling Height (m)",
        defaultValue: 2.7,
        validation: { min: 2, max: 10 },
      },
      {
        id: "building.majorOccupancy",
        legacyId: "d_12",
        section: "S02",
        classification: "A",
        label: "Major Occupancy",
        defaultValue: "A-Assembly",
      },
      // The ASHRAE 62.1 space type within the Major Occupancy (S02 B.1, the
      // dropdown beside it; VentilationRates.js) - its Rp and Ra set the outdoor air V.1.4 checks.
      // Empty or not offered by the occupancy: the occupancy's default.
      {
        id: "building.ventilationSpaceType",
        legacyId: "e_12",
        section: "S02",
        classification: "A",
        label: "Space Type (ASHRAE 62.1)",
        defaultValue: "",
      },
      {
        id: "building.referenceStandard",
        legacyId: "d_13",
        section: "S02",
        classification: "A",
        label: "Reference Standard",
        defaultValue: "OBC SB10 5.5-6 Z6",
      },
      {
        id: "building.analysisMode",
        legacyId: "d_14",
        section: "S02",
        classification: "A",
        label: "Analysis Mode (Utility Bills / Target)",
        defaultValue: "Utility Bills",
      },
      {
        id: "building.carbonStandard",
        legacyId: "d_15",
        section: "S02",
        classification: "A",
        label: "Carbon Benchmarking Standard",
        defaultValue: "Self Reported",
      },
      {
        id: "building.typologySelection",
        legacyId: "d_39",
        section: "S05",
        classification: "A", // Model-specific: Reference can have different typology
        label: "Typology Selection",
        defaultValue: "Pt.3 Mass Timber",
      },
      {
        id: "building.userModelledEmbodiedCarbon",
        legacyId: "i_41",
        section: "S04",
        classification: "A",
        label: "User Modelled Embodied Carbon (kgCO2e/m²)",
        defaultValue: 345.82,
      },
      // S02 metadata/text inputs
      {
        id: "building.projectName",
        legacyId: "h_14",
        section: "S02",
        classification: "G",
        label: "Project Name",
        defaultValue: "Three Feathers Terrace",
      },
      {
        id: "building.certifier",
        legacyId: "i_16",
        section: "S02",
        classification: "G",
        label: "Certifier Name",
        defaultValue: "Thomson Architecture, Inc.",
      },
      {
        id: "building.licenseNumber",
        legacyId: "i_17",
        section: "S02",
        classification: "G",
        label: "License Number",
        defaultValue: "8154",
      },
      // S02 energy price inputs
      {
        id: "energy.price.electricity",
        legacyId: "l_12",
        section: "S02",
        classification: "A",
        label: "Electricity Price ($/kWh)",
        defaultValue: "$0.1300",
      },
      {
        id: "energy.price.gas",
        legacyId: "l_13",
        section: "S02",
        classification: "A",
        label: "Gas Price ($/m³)",
        defaultValue: "$0.5070",
      },
      {
        id: "energy.price.propane",
        legacyId: "l_14",
        section: "S02",
        classification: "A",
        label: "Propane Price ($/kg)",
        defaultValue: "$1.6200",
      },
      {
        id: "energy.price.wood",
        legacyId: "l_15",
        section: "S02",
        classification: "A",
        label: "Wood Price ($/m³)",
        defaultValue: "$180.00",
      },
      {
        id: "energy.price.oil",
        legacyId: "l_16",
        section: "S02",
        classification: "A",
        label: "Oil Price ($/litre)",
        defaultValue: "$1.5000",
      },
    ];

    // Register all inputs
    graph.registerInputs(inputs);

    // ========================================================================
    // COMPUTED NODES
    // ========================================================================

    // Typology Embodied Carbon (i_39): d_39 → embodied carbon lookup
    // Replaces INPUT i_39 with COMPUTED node matching S05.calculateTypologyBasedCap()
    const TYPOLOGY_CAPS = {
      "Pt.9 Res. Stick Frame": 125,
      "Pt.9 Small Mass Timber": 250,
      "Pt.3 Mass Timber": 350,
      "Pt.3 Concrete": 550,
      "Pt.3 Steel": 650,
      "Pt.3 Office": 600,
    };

    graph.registerNode({
      id: "building.typologyEmbodiedCarbon",
      legacyId: "i_39",
      section: "S05",
      classification: "C",
      dependencies: [
        "building.typologySelection",
        "building.userModelledEmbodiedCarbon"
      ],
      label: "Typology Embodied Carbon (kgCO2e/m²)",
      compute: (inputs) => {
        const typology = inputs["building.typologySelection"] || "";
        if (typology === "Modelled Value") {
          return parseFloat(inputs["building.userModelledEmbodiedCarbon"]) || 0;
        }
        return TYPOLOGY_CAPS[typology] || 0;
      },
    });

    // Embodied Carbon Target (based on carbon standard selection)
    // See: docs/parnas-tables/emissions/embodied-carbon-target.json
    graph.registerNode({
      id: "building.embodiedCarbonTarget",
      legacyId: "d_16",
      section: "S02",
      classification: "C",
      dependencies: [
        "building.carbonStandard",
        "building.typologyEmbodiedCarbon",
        "building.userModelledEmbodiedCarbon",
        "building.majorOccupancy",
        "building.numStoreys"
      ],
      label: "Embodied Carbon Target (kgCO2e/m²)",
      compute: (inputs) => {
        const standard = inputs["building.carbonStandard"] || "Self Reported";
        const typologyValue = parseFloat(inputs["building.typologyEmbodiedCarbon"]) || 0;
        const userModelledValue = parseFloat(inputs["building.userModelledEmbodiedCarbon"]) || 345.82;

        if (standard === "Not Reported") {
          return "N/A";
        }

        // TGS4 Tier 2/3: adopted caps by occupancy category
        if (standard === "TGS4 Tier 2" || standard === "TGS4 Tier 3") {
          const occupancy = inputs["building.majorOccupancy"] || "A-Assembly";
          const storeys = parseFloat(inputs["building.numStoreys"]) || 2;
          const category = getTGS4Category(occupancy, storeys);
          const cap = TGS4_CAPS[category]?.[standard];
          return cap ?? "N/A";
        }

        // TGS4 "Typical Values": backward compat, uses material-based typology
        if (standard === "TGS4") {
          return typologyValue;
        }

        // Fixed standard targets (BR18, IPCC, CaGBC, LEED, etc.)
        const target = CARBON_TARGETS[standard];
        if (target !== null && target !== undefined) {
          return target;
        }

        // Self Reported and default use user modelled value (i_41)
        return userModelledValue;
      },
    });

    // Building Volume
    graph.registerNode({
      id: "building.volume",
      section: "S02",
      classification: "G",
      dependencies: [
        "building.conditionedFloorArea",
        "building.ceilingHeight",
      ],
      label: "Building Volume (m³)",
      compute: (inputs) => {
        const area = parseNum(inputs["building.conditionedFloorArea"]) || 0;
        const height = parseFloat(inputs["building.ceilingHeight"]) || 2.7;
        return area * height;
      },
    });

    // Floor Area per Storey
    graph.registerNode({
      id: "building.floorAreaPerStorey",
      section: "S02",
      classification: "G",
      dependencies: [
        "building.conditionedFloorArea",
        "building.numStoreys",
      ],
      label: "Floor Area per Storey (m²)",
      compute: (inputs) => {
        const area = parseNum(inputs["building.conditionedFloorArea"]) || 0;
        const storeys = parseFloat(inputs["building.numStoreys"]) || 1;
        return storeys > 0 ? area / storeys : area;
      },
    });

    // Is Target Mode (boolean for conditional logic)
    graph.registerNode({
      id: "building.isTargetMode",
      section: "S02",
      classification: "A",
      dependencies: ["building.analysisMode"],
      label: "Is Target Mode",
      compute: (inputs) => {
        const mode = inputs["building.analysisMode"] || "Utility Bills";
        return mode !== "Utility Bills";
      },
    });

    console.log("[BuildingInfoNodes] Registered", inputs.length, "inputs");
  }

  // Export
  window.TEUI.ComputationNodes.BuildingInfo = {
    register,
    CARBON_TARGETS,
    TGS4_CAPS,
    getTGS4Category,
  };

  console.log("[BuildingInfoNodes] Module loaded");
})();
