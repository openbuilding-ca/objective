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

  // Activity level to watts/person mapping (from SCHEDULES-3037.csv G32:G43)
  const ACTIVITY_WATTS = {
    Relaxed: 96.71,
    Normal: 117.23,
    Active: 219.81,
    Hyperactive: 424.95,
  };

  // Equipment loads by occupancy type, efficiency and elevator presence (W/m²)
  // From Section09.js equipmentLoadsTable
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
        const area = parseFloat(inputs["building.conditionedFloorArea"]) || 0;
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
        const area = parseFloat(inputs["building.conditionedFloorArea"]) || 0;
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
        const area = parseFloat(inputs["building.conditionedFloorArea"]) || 0;
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

    // k_71: Internal cooling load (cooling season fraction)
    // = (h_70 + h_64 + d_54) × m_19 / 365
    graph.registerNode({
      id: "internal.coolingLoad.occupants",
      legacyId: "k_71",
      section: "S09",
      classification: "C",
      dependencies: [
        "energy.plugLoads.subtotal",
        "internal.occupants.annual",
        "waterHeating.systemLosses",
        "climate.coolingDays"
      ],
      label: "Internal Gains - Cooling Season (kWh/yr)",
      compute: (inputs) => {
        const h70 = parseFloat(inputs["energy.plugLoads.subtotal"]) || 0;
        const h64 = parseFloat(inputs["internal.occupants.annual"]) || 0;
        const d54 = parseFloat(inputs["waterHeating.systemLosses"]) || 0;
        const coolingDays = parseFloat(inputs["climate.coolingDays"]) || 0;
        const coolingFraction = coolingDays / 365;
        return (h70 + h64 + d54) * coolingFraction;
      },
    });

    console.log("[InternalGainsNodes] Registered", inputs.length, "inputs and 10 computed nodes (including d_65/d_67 lookups)");
  }

  window.TEUI.ComputationNodes.InternalGains = { register };
  console.log("[InternalGainsNodes] Module loaded");
})();
