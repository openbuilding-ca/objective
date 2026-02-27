/**
 * OccupancyNodes.js - Building Occupancy (Section 09)
 *
 * Occupant count for per-capita calculations
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  function register(graph) {
    const inputs = [
      { id: "occupancy.occupants", legacyId: "d_63", section: "S09", classification: "C", label: "Number of Occupants", defaultValue: 4 },
      { id: "occupancy.occupantDensity", legacyId: "h_63", section: "S09", classification: "C", label: "Occupant Density (m²/person)", defaultValue: 35 },
      { id: "occupancy.occupiedHours", legacyId: "i_63", section: "S09", classification: "C", label: "Occupied Hours per Year", defaultValue: 4380 },
      { id: "occupancy.totalHours", legacyId: "j_63", section: "S09", classification: "C", label: "Total Hours per Year", defaultValue: 8760 },
    ];

    graph.registerInputs(inputs);

    // Calculate occupants from area and density if not directly input
    graph.registerNode({
      id: "occupancy.calculatedOccupants",
      section: "S09",
      classification: "C",
      dependencies: ["building.conditionedFloorArea", "occupancy.occupantDensity"],
      label: "Calculated Occupants",
      compute: (inputs) => {
        const area = parseFloat(inputs["building.conditionedFloorArea"]) || 0;
        const density = parseFloat(inputs["occupancy.occupantDensity"]) || 35;
        return density > 0 ? Math.ceil(area / density) : 1;
      },
    });

    console.log("[OccupancyNodes] Registered", inputs.length, "inputs");
  }

  window.TEUI.ComputationNodes.Occupancy = { register };
  console.log("[OccupancyNodes] Module loaded");
})();
