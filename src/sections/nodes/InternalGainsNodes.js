/**
 * InternalGainsNodes.js - Internal Gains (Section 09)
 *
 * Calculates occupant, plug load, lighting, and equipment internal gains.
 * These feed into radiant gains utilization (S10) and cooling load (S14).
 *
 * Key fields:
 * - d_64: Activity level dropdown → g_64 watts/person
 * - d_65: Plug load density (W/m²) - COMPUTED from standard & building type
 * - d_66: Lighting density (W/m²) - INPUT
 * - d_67: Equipment density (W/m²) - COMPUTED from building type, efficiency, elevators
 * - g_67: Equipment efficiency spec dropdown
 * - d_68: Elevator presence dropdown
 * - h_64-h_67: Annual energy by category (kWh/yr)
 * - h_70: Plug/Light/Equipment subtotal (kWh/yr)
 * - i_71: Internal heating gains (kWh/yr)
 * - k_71: Internal cooling load (kWh/yr)
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  function parseNum(value, defaultVal = 0) {
    if (value === null || value === undefined || value === "N/A") return defaultVal;
    const num = parseFloat(String(value).replace(/,/g, ""));
    return isNaN(num) ? defaultVal : num;
  }

  // Activity level to watts/person mapping (from SCHEDULES-3037.csv G32:G43)
  const ACTIVITY_WATTS = {
    Relaxed: 96.71,
    Normal: 117.23,
    Active: 219.81,
    Hyperactive: 424.95,
  };

  // Equipment loads by occupancy type, efficiency and elevator presence (W/m²): OBJECTIVE's
  // "Occupancy-Based Equipment Loads by Specification Type" table, compiled from NREL building data
  // (ComStock, comstock.nrel.gov), the Commercial and Residential Energy Consumption Surveys (CBECS,
  // RECS), NRC's National Energy Code for Buildings (NECB), ASHRAE Standard 90.1, the ASHRAE
  // Handbook and the Building Performance Institute (BPI). These reflect
  // measured use; CSA F280's peak allowance (4 W/m², Cl. 6.2.5) is lower (Andy 2026-11-18).
  const EQUIPMENT_LOADS_TABLE = {
    "A-Assembly": {
      Regular: { Elevators: 9.0, "No Elevators": 7.0 },
      Efficient: { Elevators: 7.0, "No Elevators": 5.0 },
    },
    "B1-Detention": {
      Regular: { Elevators: 10.0, "No Elevators": 8.0 },
      Efficient: { Elevators: 8.0, "No Elevators": 6.0 },
    },
    "B2-Care": {
      Regular: { Elevators: 25.0, "No Elevators": 20.0 },
      Efficient: { Elevators: 18.0, "No Elevators": 15.0 },
    },
    "B3-DetentionCare": {
      Regular: { Elevators: 20.0, "No Elevators": 18.0 },
      Efficient: { Elevators: 14.0, "No Elevators": 12.0 },
    },
    "C-Residential": {
      Regular: { Elevators: 6.0, "No Elevators": 5.0 },
      Efficient: { Elevators: 4.0, "No Elevators": 3.0 },
    },
    "D-Business": {
      Regular: { Elevators: 10.0, "No Elevators": 7.0 },
      Efficient: { Elevators: 7.0, "No Elevators": 5.0 },
    },
    "E-Mercantile": {
      Regular: { Elevators: 15.0, "No Elevators": 12.0 },
      Efficient: { Elevators: 12.0, "No Elevators": 10.0 },
    },
    "F-Industrial": {
      Regular: { Elevators: 17.0, "No Elevators": 15.0 },
      Efficient: { Elevators: 10.0, "No Elevators": 8.0 },
    },
    Hotels: {
      Regular: { "No Elevators": 10, Elevators: 12 },
      Efficient: { "No Elevators": 7, Elevators: 9 },
    },
    Warehouses: {
      Regular: { "No Elevators": 4, Elevators: 6 },
      Efficient: { "No Elevators": 3, Elevators: 4 },
    },
    Restaurants: {
      Regular: { "No Elevators": 18, Elevators: 20 },
      Efficient: { "No Elevators": 15, Elevators: 18 },
    },
  };

  // Default equipment load if lookup fails
  const DEFAULT_EQUIPMENT_LOAD = 5.0;

  /**
   * Format building type for lookup table key
   * From Section09.js formatBuildingTypeForLookup()
   */
  function formatBuildingTypeForLookup(rawType) {
    // If it's already in the right format, return it
    if (Object.keys(EQUIPMENT_LOADS_TABLE).includes(rawType)) {
      return rawType;
    }

    try {
      // Extract the category (e.g., "A - Assembly" -> "A")
      const categoryMatch = rawType.match(/^([A-F][0-9]?)\s*[-–]\s*/);
      if (categoryMatch) {
        const category = categoryMatch[1].trim();

        // Map category to lookup key
        if (category === "A") return "A-Assembly";
        if (category === "B1") return "B1-Detention";
        if (category === "B2") return "B2-Care";
        if (category === "B3") return "B3-DetentionCare";
        if (category === "C") return "C-Residential";
        if (category === "D") return "D-Business";
        if (category === "E") return "E-Mercantile";
        if (category === "F") return "F-Industrial";
      }

      // Try extracting just the first character as fallback
      if (rawType && rawType.length > 0) {
        const firstChar = rawType.charAt(0);
        if (firstChar === "A") return "A-Assembly";
        if (firstChar === "C") return "C-Residential";
        if (firstChar === "D") return "D-Business";
        if (firstChar === "E") return "E-Mercantile";
        if (firstChar === "F") return "F-Industrial";

        // Special case for B categories
        if (firstChar === "B") {
          if (rawType.includes("1") || rawType.includes("Detention")) {
            return "B1-Detention";
          } else if (
            rawType.includes("2") ||
            (rawType.includes("Care") && !rawType.includes("Detention"))
          ) {
            return "B2-Care";
          } else if (
            rawType.includes("3") ||
            (rawType.includes("Care") && rawType.includes("Detention"))
          ) {
            return "B3-DetentionCare";
          }
          return "B3-DetentionCare"; // Default B case
        }
      }
    } catch (e) {
      console.warn("[InternalGainsNodes] Error formatting building type:", e);
    }

    return "A-Assembly"; // Default fallback
  }

  function register(graph) {
    // ========================================================================
    // INPUTS - Section 09 user-editable values
    // ========================================================================
    const inputs = [
      { id: "internal.activityLevel", legacyId: "d_64", section: "S09", classification: "C", label: "Occupant Activity Level", defaultValue: "Normal" },
      // d_65 is now COMPUTED (see below)
      { id: "internal.lightingDensity", legacyId: "d_66", section: "S09", classification: "C", label: "Lighting Density (W/m²)", defaultValue: 1.5 },
      // d_67 is now COMPUTED (see below)
      { id: "internal.efficiencySpec", legacyId: "g_67", section: "S09", classification: "C", label: "Equipment Efficiency Spec", defaultValue: "Regular" },
      { id: "internal.elevators", legacyId: "d_68", section: "S09", classification: "C", label: "Elevator Presence", defaultValue: "No Elevators" },
    ];

    graph.registerInputs(inputs);

    // ========================================================================
    // COMPUTED NODES - Lookup-based density values
    // ========================================================================

    // d_65: Plug Load Density (W/m²) - Computed from standard and building type
    // Formula from Section09.js lines 2320-2349:
    //   PH Classic/Plus/Premium → 2.1 W/m²
    //   PHIUS/EnerPHit/PH Low Energy → 5 W/m²
    //   Residential/Care occupancies → 5 W/m²
    //   Otherwise → 7 W/m²
    graph.registerNode({
      id: "internal.plugLoadDensity",
      legacyId: "d_65",
      section: "S09",
      classification: "C",
      dependencies: ["building.referenceStandard", "building.majorOccupancy"],
      label: "Plug Load Density (W/m²)",
      compute: (inputs) => {
        const standard = inputs["building.referenceStandard"] || "";
        const buildingType = inputs["building.majorOccupancy"] || "";

        // Priority 1: PH Classic/Plus/Premium → 2.1 W/m²
        if (["PH Classic", "PH Plus", "PH Premium"].some(std => standard.includes(std))) {
          return 2.1;
        }

        // Priority 2: PHIUS/EnerPHit/PH Low Energy → 5 W/m²
        if (["PHIUS", "EnerPHit", "PH Low Energy"].some(std => standard.includes(std))) {
          return 5;
        }

        // Priority 3: Residential/Care occupancies → 5 W/m²
        const isResidentialOrCare =
          buildingType.includes("C-Residential") || buildingType.includes("C - Residential") ||
          buildingType.includes("B1-Detention") || buildingType.includes("B1 - Detention") ||
          buildingType.includes("B2-Care") || buildingType.includes("B2 - Care") ||
          buildingType.includes("B3-Detention") || buildingType.includes("B3 - Detention");

        // Residential 5 W/m²: NECB 2020 Table A-8.4.3.2.(2)-B, "Dwelling units – general", PEAK receptacle
        // load on Operating Schedule G (10.6 full-load h/day, Table A-8.4.3.2.(1)-G). Per NECB it includes
        // the dwelling's major appliances (Note A-8.4.3.2.(2)); not cited until 2026-11-18 (Andy).
        return isResidentialOrCare ? 5 : 7;
      },
    });

    // d_67: Equipment Density (W/m²) - Computed from building type, efficiency, elevators
    // Formula from Section09.js equipmentLoadsTable lookup
    graph.registerNode({
      id: "internal.equipmentDensity",
      legacyId: "d_67",
      section: "S09",
      classification: "C",
      dependencies: ["building.majorOccupancy", "internal.efficiencySpec", "internal.elevators"],
      label: "Equipment Density (W/m²)",
      compute: (inputs) => {
        const rawBuildingType = inputs["building.majorOccupancy"] || "A-Assembly";
        const efficiencyType = inputs["internal.efficiencySpec"] || "Regular";
        const elevatorStatus = inputs["internal.elevators"] || "No Elevators";

        const formattedType = formatBuildingTypeForLookup(rawBuildingType);

        // Lookup with fallbacks
        if (EQUIPMENT_LOADS_TABLE[formattedType]) {
          if (EQUIPMENT_LOADS_TABLE[formattedType][efficiencyType]) {
            const value = EQUIPMENT_LOADS_TABLE[formattedType][efficiencyType][elevatorStatus];
            if (value !== undefined) {
              return value;
            }
          }
        }

        return DEFAULT_EQUIPMENT_LOAD;
      },
    });

    // g_64: Activity level → watts/person (Sensible + Latent)
    graph.registerNode({
      id: "internal.occupants.wattsPerPerson",
      legacyId: "g_64",
      section: "S09",
      classification: "C",
      dependencies: ["internal.activityLevel"],
      label: "Occupant Watts per Person (S+L)",
      compute: (inputs) => {
        const level = inputs["internal.activityLevel"] || "Normal";
        return ACTIVITY_WATTS[level] || 117.23;
      },
    });

    // h_64: Occupant energy annual = (occupants × watts × annualHours) / 1000
    graph.registerNode({
      id: "internal.occupants.annual",
      legacyId: "h_64",
      section: "S09",
      classification: "C",
      dependencies: ["internal.occupants.wattsPerPerson", "occupancy.occupants", "occupancy.occupiedHours"],
      label: "Occupant Internal Gains (kWh/yr)",
      compute: (inputs) => {
        const watts = parseFloat(inputs["internal.occupants.wattsPerPerson"]) || 117.23;
        const occupants = parseFloat(inputs["occupancy.occupants"]) || 4;
        const hours = parseFloat(inputs["occupancy.occupiedHours"]) || 4380;
        return (watts * occupants * hours) / 1000;
      },
    });

    // h_65: Plug loads annual = (density × area × annualHours) / 1000
    graph.registerNode({
      id: "internal.plugLoads.annual",
      legacyId: "h_65",
      section: "S09",
      classification: "C",
      dependencies: ["internal.plugLoadDensity", "building.conditionedFloorArea", "occupancy.occupiedHours"],
      label: "Plug Load Internal Gains (kWh/yr)",
      compute: (inputs) => {
        const watts = parseFloat(inputs["internal.plugLoadDensity"]) || 7;
        const area = parseNum(inputs["building.conditionedFloorArea"]) || 0;
        const hours = parseFloat(inputs["occupancy.occupiedHours"]) || 4380;
        return (watts * area * hours) / 1000;
      },
    });

    // h_66: Lighting annual = (density × area × annualHours) / 1000
    graph.registerNode({
      id: "internal.lighting.annual",
      legacyId: "h_66",
      section: "S09",
      classification: "C",
      dependencies: ["internal.lightingDensity", "building.conditionedFloorArea", "occupancy.occupiedHours"],
      label: "Lighting Internal Gains (kWh/yr)",
      compute: (inputs) => {
        const watts = parseFloat(inputs["internal.lightingDensity"]) || 1.5;
        const area = parseNum(inputs["building.conditionedFloorArea"]) || 0;
        const hours = parseFloat(inputs["occupancy.occupiedHours"]) || 4380;
        return (watts * area * hours) / 1000;
      },
    });

    // h_67: Equipment annual = (density × area × annualHours) / 1000
    graph.registerNode({
      id: "internal.equipment.annual",
      legacyId: "h_67",
      section: "S09",
      classification: "C",
      dependencies: ["internal.equipmentDensity", "building.conditionedFloorArea", "occupancy.occupiedHours"],
      label: "Equipment Internal Gains (kWh/yr)",
      compute: (inputs) => {
        const watts = parseFloat(inputs["internal.equipmentDensity"]) || 3;
        const area = parseNum(inputs["building.conditionedFloorArea"]) || 0;
        const hours = parseFloat(inputs["occupancy.occupiedHours"]) || 4380;
        return (watts * area * hours) / 1000;
      },
    });

    // ========================================================================
    // SUBTOTAL AND SEASONAL SPLITS
    // ========================================================================

    // h_70: Plug/Light/Equipment subtotal (excludes occupants and DHW losses)
    graph.registerNode({
      id: "energy.plugLoads.subtotal",
      legacyId: "h_70",
      section: "S09",
      classification: "C",
      dependencies: ["internal.plugLoads.annual", "internal.lighting.annual", "internal.equipment.annual"],
      label: "Plug/Light/Equipment Subtotal (kWh/yr)",
      compute: (inputs) => {
        const plugs = parseFloat(inputs["internal.plugLoads.annual"]) || 0;
        const lighting = parseFloat(inputs["internal.lighting.annual"]) || 0;
        const equipment = parseFloat(inputs["internal.equipment.annual"]) || 0;
        return plugs + lighting + equipment;
      },
    });

    // i_71: Internal heating gains (heating season fraction)
    // = (h_70 + h_64 + d_54) × (365 - m_19) / 365
    graph.registerNode({
      id: "internal.heatingGains",
      legacyId: "i_71",
      section: "S09",
      classification: "C",
      dependencies: [
        "energy.plugLoads.subtotal",
        "internal.occupants.annual",
        "waterHeating.systemLosses",
        "climate.coolingDays"
      ],
      label: "Internal Gains - Heating Season (kWh/yr)",
      compute: (inputs) => {
        const h70 = parseFloat(inputs["energy.plugLoads.subtotal"]) || 0;
        const h64 = parseFloat(inputs["internal.occupants.annual"]) || 0;
        const d54 = parseFloat(inputs["waterHeating.systemLosses"]) || 0;
        const coolingDays = parseFloat(inputs["climate.coolingDays"]) || 0;
        const heatingFraction = (365 - coolingDays) / 365;
        return (h70 + h64 + d54) * heatingFraction;
      },
    });

    // k_71: Internal cooling load - the internal gains' share of the
    // unmitigated ISO 52016-1 monthly need (cooling.iso52016, CoolingNodes.js);
    // the gains run every month, annual x days / 365
    graph.registerNode({
      id: "internal.coolingLoad.occupants",
      legacyId: "k_71",
      section: "S09",
      classification: "C",
      dependencies: ["cooling.iso52016"],
      label: "Internal Gains - Cooling Season (kWh/yr)",
      compute: (inputs) => inputs["cooling.iso52016"]?.rows?.internal ?? 0,
    });

    // ========================================================================
    // DHW LOSSES + TOTAL ANNUAL
    // ========================================================================

    // h_69: DHW system losses (passthrough from d_54)
    graph.registerNode({
      id: "internal.dhwLosses.annual",
      legacyId: "h_69",
      section: "S09",
      classification: "C",
      dependencies: ["waterHeating.systemLosses"],
      label: "DHW System Losses (kWh/yr)",
      compute: (inputs) => parseFloat(inputs["waterHeating.systemLosses"]) || 0,
    });

    // h_71: Total annual internal gains (occupants + PLE subtotal + DHW losses)
    graph.registerNode({
      id: "internal.total.annual",
      legacyId: "h_71",
      section: "S09",
      classification: "C",
      dependencies: ["internal.occupants.annual", "energy.plugLoads.subtotal", "internal.dhwLosses.annual"],
      label: "Total Internal Gains (kWh/yr)",
      compute: (inputs) => {
        const h64 = parseFloat(inputs["internal.occupants.annual"]) || 0;
        const h70 = parseFloat(inputs["energy.plugLoads.subtotal"]) || 0;
        const h69 = parseFloat(inputs["internal.dhwLosses.annual"]) || 0;
        return h64 + h70 + h69;
      },
    });

    // ========================================================================
    // INDIVIDUAL SEASONAL SPLITS (heating = i_, cooling = k_)
    // heatingRatio = (365 - coolingDays) / 365
    // coolingRatio = coolingDays / 365
    // ========================================================================

    const gainRows = [
      { id: "occupants", legacySuffix: "64", annual: "internal.occupants.annual" },
      { id: "plugLoads", legacySuffix: "65", annual: "internal.plugLoads.annual" },
      { id: "lighting", legacySuffix: "66", annual: "internal.lighting.annual" },
      { id: "equipment", legacySuffix: "67", annual: "internal.equipment.annual" },
      { id: "dhwLosses", legacySuffix: "69", annual: "internal.dhwLosses.annual" },
    ];

    gainRows.forEach(({ id, legacySuffix, annual }) => {
      // Heating season split
      graph.registerNode({
        id: `internal.${id}.heatingGain`,
        legacyId: `i_${legacySuffix}`,
        section: "S09",
        classification: "C",
        dependencies: [annual, "climate.coolingDays"],
        label: `${id} Heating Gain (kWh/yr)`,
        compute: (inputs) => {
          const annualVal = parseFloat(inputs[annual]) || 0;
          const coolingDays = parseFloat(inputs["climate.coolingDays"]) || 0;
          return annualVal * (365 - coolingDays) / 365;
        },
      });

      // Cooling split: k_71's sensible part (the internal gains' share of the
      // ISO 52016-1 need) in proportion to this row's annual gain - the
      // internal total is h_70 + h_64 + d_54, and h_70 = h_65 + h_66 + h_67.
      // The occupants' latent (F280 Annex B, in k_71 too) is theirs alone.
      graph.registerNode({
        id: `internal.${id}.coolingGain`,
        legacyId: `k_${legacySuffix}`,
        section: "S09",
        classification: "C",
        dependencies: [
          annual,
          "internal.coolingLoad.occupants",
          "energy.plugLoads.subtotal",
          "internal.occupants.annual",
          "waterHeating.systemLosses",
          "cooling.iso52016",
        ],
        label: `${id} Cooling Gain (kWh/yr)`,
        compute: (inputs) => {
          const total =
            (parseFloat(inputs["energy.plugLoads.subtotal"]) || 0) +
            (parseFloat(inputs["internal.occupants.annual"]) || 0) +
            (parseFloat(inputs["waterHeating.systemLosses"]) || 0);
          const latent = inputs["cooling.iso52016"]?.latent?.people ?? 0;
          const own = id === "occupants" ? latent : 0;
          if (total <= 0) return own;
          const k71 = parseFloat(inputs["internal.coolingLoad.occupants"]) || 0;
          return ((k71 - latent) * (parseFloat(inputs[annual]) || 0)) / total + own;
        },
      });
    });

    // ========================================================================
    // PLE SUBTOTALS (i_70, k_70) - Plug/Light/Equipment only
    // ========================================================================

    graph.registerNode({
      id: "internal.pleSubtotal.heatingGain",
      legacyId: "i_70",
      section: "S09",
      classification: "C",
      dependencies: [
        "internal.plugLoads.heatingGain",
        "internal.lighting.heatingGain",
        "internal.equipment.heatingGain"
      ],
      label: "PLE Heating Subtotal (kWh/yr)",
      compute: (inputs) => {
        return (parseFloat(inputs["internal.plugLoads.heatingGain"]) || 0)
          + (parseFloat(inputs["internal.lighting.heatingGain"]) || 0)
          + (parseFloat(inputs["internal.equipment.heatingGain"]) || 0);
      },
    });

    graph.registerNode({
      id: "internal.pleSubtotal.coolingGain",
      legacyId: "k_70",
      section: "S09",
      classification: "C",
      dependencies: [
        "internal.plugLoads.coolingGain",
        "internal.lighting.coolingGain",
        "internal.equipment.coolingGain"
      ],
      label: "PLE Cooling Subtotal (kWh/yr)",
      compute: (inputs) => {
        return (parseFloat(inputs["internal.plugLoads.coolingGain"]) || 0)
          + (parseFloat(inputs["internal.lighting.coolingGain"]) || 0)
          + (parseFloat(inputs["internal.equipment.coolingGain"]) || 0);
      },
    });

    // ========================================================================
    // PERCENTAGES (j_ = heating%, l_ = cooling%)
    // ========================================================================

    gainRows.forEach(({ id, legacySuffix }) => {
      // Heating percentage
      graph.registerNode({
        id: `internal.${id}.heatingPercent`,
        legacyId: `j_${legacySuffix}`,
        section: "S09",
        classification: "C",
        dependencies: [`internal.${id}.heatingGain`, "internal.heatingGains"],
        label: `${id} Heating Gain %`,
        compute: (inputs) => {
          const gain = parseFloat(inputs[`internal.${id}.heatingGain`]) || 0;
          const total = parseFloat(inputs["internal.heatingGains"]) || 0;
          return total > 0 ? gain / total : 0;
        },
      });

      // Cooling percentage
      graph.registerNode({
        id: `internal.${id}.coolingPercent`,
        legacyId: `l_${legacySuffix}`,
        section: "S09",
        classification: "C",
        dependencies: [`internal.${id}.coolingGain`, "internal.coolingLoad.occupants"],
        label: `${id} Cooling Gain %`,
        compute: (inputs) => {
          const gain = parseFloat(inputs[`internal.${id}.coolingGain`]) || 0;
          const total = parseFloat(inputs["internal.coolingLoad.occupants"]) || 0;
          return total > 0 ? gain / total : 0;
        },
      });
    });

    // j_71: Total heating gains percentage (always 100%)
    graph.registerNode({
      id: "internal.total.heatingPercent",
      legacyId: "j_71",
      section: "S09",
      classification: "C",
      dependencies: [],
      label: "Total Heating Gain %",
      compute: () => 1.0,
    });

    // l_71: Total cooling gains percentage (always 100%)
    graph.registerNode({
      id: "internal.total.coolingPercent",
      legacyId: "l_71",
      section: "S09",
      classification: "C",
      dependencies: [],
      label: "Total Cooling Gain %",
      compute: () => 1.0,
    });

    console.log("[InternalGainsNodes] Registered", inputs.length, "inputs and 36 computed nodes");
  }

  window.TEUI.ComputationNodes.InternalGains = { register };
  console.log("[InternalGainsNodes] Module loaded");
})();
