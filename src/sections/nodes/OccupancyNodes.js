/**
 * OccupancyNodes.js - Building Occupancy (Section 09)
 *
 * Occupant count and occupied hours for per-capita calculations.
 * g_63 (daily hours) is the CSV input; i_63 (annual hours) = g_63 × 365.
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

  function register(graph) {
    const inputs = [
      { id: "occupancy.occupants", legacyId: "d_63", section: "S09", classification: "C", label: "Number of Occupants", defaultValue: 4 },
      // Bedrooms in the dwelling unit - a Part 9 house's ventilation rule
      // (OBC Table 9.32.3.3, VentilationRates.js). "" derives them from the
      // occupants; "More than 5" sends the check to ASHRAE 62.1.
      { id: "occupancy.bedrooms", legacyId: "l_63", section: "S09", classification: "C", label: "Bedrooms (Part 9 dwelling unit)", defaultValue: "" },
      { id: "occupancy.occupantDensity", legacyId: "h_63", section: "S09", classification: "C", label: "Occupant Density (m²/person)", defaultValue: 35 },
      { id: "occupancy.occupiedHoursPerDay", legacyId: "g_63", section: "S09", classification: "C", label: "Occupied Hours per Day", defaultValue: 12 },
      { id: "occupancy.totalHours", legacyId: "j_63", section: "S09", classification: "C", label: "Total Hours per Year", defaultValue: 8760 },
    ];

    graph.registerInputs(inputs);

    // i_63: Annual occupied hours = g_63 × 365
    graph.registerNode({
      id: "occupancy.occupiedHours",
      legacyId: "i_63",
      section: "S09",
      classification: "C",
      dependencies: ["occupancy.occupiedHoursPerDay"],
      label: "Occupied Hours per Year",
      compute: (inputs) => {
        const dailyHours = parseFloat(inputs["occupancy.occupiedHoursPerDay"]) || 12;
        return dailyHours * 365;
      },
    });

    // Calculate occupants from area and density if not directly input
    graph.registerNode({
      id: "occupancy.calculatedOccupants",
      section: "S09",
      classification: "C",
      dependencies: ["building.conditionedFloorArea", "occupancy.occupantDensity"],
      label: "Calculated Occupants",
      compute: (inputs) => {
        const area = parseNum(inputs["building.conditionedFloorArea"]) || 0;
        const density = parseFloat(inputs["occupancy.occupantDensity"]) || 35;
        return density > 0 ? Math.ceil(area / density) : 1;
      },
    });

    console.log("[OccupancyNodes] Registered", inputs.length, "inputs and 2 computed nodes");
  }

  window.TEUI.ComputationNodes.Occupancy = { register };
  console.log("[OccupancyNodes] Module loaded");
})();
