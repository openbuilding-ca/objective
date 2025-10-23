// sections/4012-Section16C.js
// Cooling Season Sankey Diagram Module
// Modular file to keep S16.js manageable

window.TEUI = window.TEUI || {};
window.TEUI.CoolingSankey = (function () {
  "use strict";

  // Cooling Season Sankey Structure Template
  const COOLING_SANKEY_STRUCTURE_TEMPLATE = {
    nodes: [
      // Center node
      { name: "Building", color: "#4A96BA" }, // [0]

      // LEFT SIDE - ENERGY GAINED (Red/Orange Hues)
      { name: "B.4 Roof", color: "#FFB6A3" }, // [1] - Envelope transmission gains
      { name: "B.5 Walls Ae", color: "#FFB6A3" }, // [2] - Above grade wall gains
      { name: "B.7.0 Doors", color: "#FFB6A3" }, // [3] - Door transmission gains
      { name: "B.8.1 Window Area North", color: "#FFCC99" }, // [4] - North window transmission
      { name: "B.8.2 Window Area East", color: "#FFCC99" }, // [5] - East window transmission
      { name: "B.8.3 Window Area South", color: "#FFCC99" }, // [6] - South window transmission
      { name: "B.8.4 Window Area West", color: "#FFCC99" }, // [7] - West window transmission
      { name: "Skylights", color: "#FFCC99" }, // [8] - Skylight transmission
      { name: "B.9 Walls BG", color: "#FFB6A3" }, // [9] - Below grade walls (conditional)
      { name: "B.10 Floor Slab", color: "#FFB6A3" }, // [10] - Floor slab (conditional)
      { name: "G.7 Doors", color: "#FFCC99" }, // [11] - Door solar gains
      { name: "G.8.1 Windows N", color: "#FFCC99" }, // [12] - North window solar
      { name: "G.8.2 Windows E", color: "#FFCC99" }, // [13] - East window solar
      { name: "G.8.3 Windows S", color: "#FFCC99" }, // [14] - South window solar
      { name: "G.8.4 Windows W", color: "#FFCC99" }, // [15] - West window solar
      { name: "B.19.6 Air Leakage", color: "#FFA07A" }, // [16] - Air infiltration gains
      { name: "V.4.1 Incoming Ventil. Energy", color: "#FFDAB9" }, // [17] - Incoming ventilation
      { name: "B.12 TB Penalty", color: "#FFB6A3" }, // [18] - Thermal bridge penalty (conditional)
      { name: "G.1.2 Occupant Gains", color: "#FF8C69" }, // [19] - Internal gains from people
      { name: "Plug/Light/Eqpt. Subtotals", color: "#FFB6A3" }, // [20] - Equipment gains
      { name: "DHW System Losses", color: "#FFB6A3" }, // [21] - Hot water system losses

      // RIGHT SIDE - ENERGY REMOVED (Blue Hues)
      { name: "T.5.2 CED less Free Cool - VX", color: "#A5D3ED" }, // [22] - Cooling energy demand
      { name: "B.9 Walls BG (Removal)", color: "#A5D3ED" }, // [23] - Below grade cooling benefit
      { name: "B.10 Floor Slab (Removal)", color: "#A5D3ED" }, // [24] - Floor slab cooling benefit
      { name: "Ventilation Free Cooling/Vent Capacity", color: "#B0E0E6" }, // [25] - Free cooling
      { name: "V.3.3 Ventilation Exhaust", color: "#B0E0E6" }, // [26] - Exhaust ventilation
      { name: "B.12 TB Penalty (Removal)", color: "#A5D3ED" }, // [27] - TB penalty removal
    ],

    links: [
      // Energy Gained → Building (will be populated with actual values)
      { source: 1, target: 0, value: 0.0001, id: "RoofGain" },
      { source: 2, target: 0, value: 0.0001, id: "WallsAeGain" },
      { source: 3, target: 0, value: 0.0001, id: "DoorsGain" },
      { source: 4, target: 0, value: 0.0001, id: "WinNorthGain" },
      { source: 5, target: 0, value: 0.0001, id: "WinEastGain" },
      { source: 6, target: 0, value: 0.0001, id: "WinSouthGain" },
      { source: 7, target: 0, value: 0.0001, id: "WinWestGain" },
      { source: 8, target: 0, value: 0.0001, id: "SkylightsGain" },
      { source: 9, target: 0, value: 0.0001, id: "WallsBGGain" },
      { source: 10, target: 0, value: 0.0001, id: "FloorSlabGain" },
      { source: 11, target: 0, value: 0.0001, id: "DoorSolarGain" },
      { source: 12, target: 0, value: 0.0001, id: "WinNSolarGain" },
      { source: 13, target: 0, value: 0.0001, id: "WinESolarGain" },
      { source: 14, target: 0, value: 0.0001, id: "WinSSolarGain" },
      { source: 15, target: 0, value: 0.0001, id: "WinWSolarGain" },
      { source: 16, target: 0, value: 0.0001, id: "AirLeakageGain" },
      { source: 17, target: 0, value: 0.0001, id: "IncomingVentGain" },
      { source: 18, target: 0, value: 0.0001, id: "TBPenaltyGain" },
      { source: 19, target: 0, value: 0.0001, id: "OccupantGains" },
      { source: 20, target: 0, value: 0.0001, id: "EquipmentGains" },
      { source: 21, target: 0, value: 0.0001, id: "DHWLosses" },

      // Building → Energy Removed
      { source: 0, target: 22, value: 0.0001, id: "BuildingToCED" },
      { source: 0, target: 23, value: 0.0001, id: "BuildingToWallsBGRemoval" },
      { source: 0, target: 24, value: 0.0001, id: "BuildingToSlabRemoval" },
      { source: 0, target: 25, value: 0.0001, id: "BuildingToFreeCool" },
      { source: 0, target: 26, value: 0.0001, id: "BuildingToVentExhaust" },
      { source: 0, target: 27, value: 0.0001, id: "BuildingToTBRemoval" },
    ],
  };

  /**
   * Get cooling Sankey data from StateManager
   * Maps values from BALANCE.csv rows 44-69 to StateManager fields
   * Uses same pattern as heating Sankey for proper D3 numeric handling
   */
  function getCoolingSankeyData() {
    // Deep copy the template
    const sankeyData = {
      nodes: JSON.parse(
        JSON.stringify(COOLING_SANKEY_STRUCTURE_TEMPLATE.nodes),
      ),
      links: [],
    };

    // Get StateManager instance (same pattern as heating Sankey)
    const teuiState = window.TEUI.StateManager;
    if (!teuiState || typeof teuiState.getValue !== "function") {
      console.warn(
        "CoolingSankey: TEUI.StateManager not available. Using template defaults.",
      );
      return sankeyData;
    }

    // Helper function to safely get state value and convert to number
    // Critical: Must return valid number for D3, never NaN
    const getStateValue = (key) => {
      const rawValue = teuiState.getValue(key);
      const numValue = parseFloat(rawValue);
      return typeof numValue === "number" && !isNaN(numValue) && numValue > 0
        ? numValue
        : 0;
    };

    // Minimum threshold for link visibility (same as heating Sankey)
    const MIN_VALUE = 0.0001;

    // Map cooling season values from Calculator state
    // Reference: BALANCE.csv rows 46-68, columns D (gained) and F (removed)

    // ENERGY GAINED (Left Side) → Building
    const energyGainedLinks = [
      {
        source: 1,
        target: 0,
        value: getStateValue("k_85"),
        id: "RoofGain",
      }, // B.4 Roof
      {
        source: 2,
        target: 0,
        value: getStateValue("k_86"),
        id: "WallsAeGain",
      }, // B.5 Walls Ae
      {
        source: 2,
        target: 0,
        value: getStateValue("k_87"),
        id: "FloorAeGain",
      }, // B.6 Floor Ae (added - was missing!)
      {
        source: 3,
        target: 0,
        value: getStateValue("k_88"),
        id: "DoorsGain",
      }, // B.7.0 Doors
      {
        source: 4,
        target: 0,
        value: getStateValue("k_89"),
        id: "WinNorthGain",
      }, // B.8.1 Window North
      {
        source: 5,
        target: 0,
        value: getStateValue("k_90"),
        id: "WinEastGain",
      }, // B.8.2 Window East
      {
        source: 6,
        target: 0,
        value: getStateValue("k_91"),
        id: "WinSouthGain",
      }, // B.8.3 Window South
      {
        source: 7,
        target: 0,
        value: getStateValue("k_92"),
        id: "WinWestGain",
      }, // B.8.4 Window West
      {
        source: 8,
        target: 0,
        value: getStateValue("k_93"),
        id: "SkylightsGain",
      }, // Skylights
      {
        source: 11,
        target: 0,
        value: getStateValue("k_73"),
        id: "DoorSolarGain",
      }, // G.7 Doors
      {
        source: 12,
        target: 0,
        value: getStateValue("k_74"),
        id: "WinNSolarGain",
      }, // G.8.1 Windows N
      {
        source: 13,
        target: 0,
        value: getStateValue("k_75"),
        id: "WinESolarGain",
      }, // G.8.2 Windows E
      {
        source: 14,
        target: 0,
        value: getStateValue("k_76"),
        id: "WinSSolarGain",
      }, // G.8.3 Windows S
      {
        source: 15,
        target: 0,
        value: getStateValue("k_77"),
        id: "WinWSolarGain",
      }, // G.8.4 Windows W
      {
        source: 8,
        target: 0,
        value: getStateValue("k_78"),
        id: "SkylightsSolarGain",
      }, // G.8.5 Skylights Solar (added - was missing!)
      {
        source: 16,
        target: 0,
        value: getStateValue("k_103"),
        id: "AirLeakageGain",
      }, // B.19.6 Air Leakage
      {
        source: 17,
        target: 0,
        value: getStateValue("d_122"),
        id: "IncomingVentGain",
      }, // V.4.1 Incoming Ventilation
      {
        source: 19,
        target: 0,
        value: getStateValue("k_64"),
        id: "OccupantGains",
      }, // G.1.2 Occupant Gains
      {
        source: 20,
        target: 0,
        value: getStateValue("k_70"),
        id: "EquipmentGains",
      }, // Plug/Light/Eqpt
      {
        source: 21,
        target: 0,
        value: getStateValue("k_69"),
        id: "DHWLosses",
      }, // DHW System Losses
    ];

    // Handle conditional nodes: B.9 Walls BG, B.10 Floor Slab, B.12 TB Penalty
    // These flip sides based on capacitance/thermal mass effects
    // Logic from BALANCE.csv:
    //   - If K value > 0: Energy GAINED (ground warmer than building)
    //   - If K value ≤ 0: Energy REMOVED (ground absorbs heat from building)
    const getRawStateValue = (key) => {
      const rawValue = teuiState.getValue(key);
      const numValue = parseFloat(rawValue);
      return typeof numValue === "number" && !isNaN(numValue) ? numValue : 0;
    };

    const k_94 = getRawStateValue("k_94"); // B.9 Walls BG
    const k_95 = getRawStateValue("k_95"); // B.10 Floor Slab
    const k_97 = getRawStateValue("k_97"); // B.12 TB Penalty

    // GAINED side: Only if > 0 (Excel: IF(K94>0, K94, 0))
    if (k_94 > 0) {
      energyGainedLinks.push({
        source: 9,
        target: 0,
        value: k_94,
        id: "WallsBGGain",
      });
    }

    if (k_95 > 0) {
      energyGainedLinks.push({
        source: 10,
        target: 0,
        value: k_95,
        id: "FloorSlabGain",
      });
    }

    if (k_97 > 0) {
      energyGainedLinks.push({
        source: 18,
        target: 0,
        value: k_97,
        id: "TBPenaltyGain",
      });
    }

    // ENERGY REMOVED (Right Side) ← Building
    const energyRemovedLinks = [
      {
        source: 0,
        target: 22,
        value: getStateValue("m_129"),
        id: "BuildingToCED",
      }, // T.5.2 CED less Free Cool
      {
        source: 0,
        target: 26,
        value: getStateValue("d_123"),
        id: "BuildingToVentExhaust",
      }, // V.3.3 Ventilation Exhaust
    ];

    // REMOVED side: If ≤ 0, use ABS value (Excel: IF(K94<=0, ABS(K94), 0))
    // This includes capacitance/thermal mass absorption
    if (k_94 <= 0 && k_94 !== 0) {
      energyRemovedLinks.push({
        source: 0,
        target: 23,
        value: Math.abs(k_94),
        id: "BuildingToWallsBGRemoval",
      });
    }

    if (k_95 <= 0 && k_95 !== 0) {
      energyRemovedLinks.push({
        source: 0,
        target: 24,
        value: Math.abs(k_95),
        id: "BuildingToSlabRemoval",
      });
    }

    if (k_97 <= 0 && k_97 !== 0) {
      energyRemovedLinks.push({
        source: 0,
        target: 27,
        value: Math.abs(k_97),
        id: "BuildingToTBRemoval",
      });
    }

    // Ventilation Free Cooling (c_124 or h_124)
    const freeCooling = Math.max(
      getRawStateValue("c_124"),
      getRawStateValue("h_124"),
    );
    if (freeCooling > MIN_VALUE) {
      energyRemovedLinks.push({
        source: 0,
        target: 25,
        value: freeCooling,
        id: "BuildingToFreeCool",
      });
    }

    // Combine all links (DO NOT FILTER - show all values including zeros)
    const allLinks = [...energyGainedLinks, ...energyRemovedLinks];

    sankeyData.links = allLinks;

    // DEBUG: Compare with Excel values (commented out for production)
    /*
    console.group("🔵 COOLING SANKEY DEBUG");

    console.log("ENERGY GAINED (Left Side):");
    console.log("k_85 (Roof):", getStateValue("k_85"), "| Excel: 710.14");
    console.log("k_86 (Walls Ae):", getStateValue("k_86"), "| Excel: 501.32");
    console.log("k_87 (Floor Ae):", getStateValue("k_87"), "| Excel: 0");
    console.log("k_88 (Doors):", getStateValue("k_88"), "| Excel: 31.75");
    console.log("k_89 (Win North):", getStateValue("k_89"), "| Excel: 343.51");
    console.log("k_90 (Win East):", getStateValue("k_90"), "| Excel: 16.21");
    console.log("k_91 (Win South):", getStateValue("k_91"), "| Excel: 673.14");
    console.log("k_92 (Win West):", getStateValue("k_92"), "| Excel: 426.15");
    console.log("k_93 (Skylights):", getStateValue("k_93"), "| Excel: 0");
    console.log("k_94 (Walls BG):", getRawStateValue("k_94"), "| Excel: 0");
    console.log("k_95 (Floor Slab):", getRawStateValue("k_95"), "| Excel: 0");
    console.log("k_73 (G.7 Doors):", getStateValue("k_73"), "| Excel: 187.5");
    console.log("k_74 (G.8.1 Win N):", getStateValue("k_74"), "| Excel: 0");
    console.log("k_75 (G.8.2 Win E):", getStateValue("k_75"), "| Excel: 0");
    console.log("k_76 (G.8.3 Win S):", getStateValue("k_76"), "| Excel: 0");
    console.log("k_77 (G.8.4 Win W):", getStateValue("k_77"), "| Excel: 130.15");
    console.log("k_78 (Skylights):", getStateValue("k_78"), "| Excel: 0");
    console.log("k_103 (Air Leakage):", getStateValue("k_103"), "| Excel: 987.6");
    console.log("d_122 (Incoming Vent):", getStateValue("d_122"), "| Excel: 15,128.68");
    console.log("k_97 (TB Penalty):", getRawStateValue("k_97"), "| Excel: 0");
    console.log("k_64 (Occupant Gains):", getStateValue("k_64"), "| Excel: 21,269.93");
    console.log("k_70 (Plug/Light/Eqpt):", getStateValue("k_70"), "| Excel: 27,744.77");
    console.log("k_69 (DHW Losses):", getStateValue("k_69"), "| Excel: 0");

    const gainedSum = energyGainedLinks.reduce((sum, link) => sum + link.value, 0);
    console.log("✅ ENERGY GAINED SUM:", gainedSum.toFixed(2), "| Excel: 68,150.87");

    console.log("\nENERGY REMOVED (Right Side):");
    console.log("m_129 (CED):", getStateValue("m_129"), "| Excel: 10,709.00");
    console.log("k_94 (Walls BG removal):", getRawStateValue("k_94"), "| Excel: 0");
    console.log("k_95 (Floor Slab removal):", getRawStateValue("k_95"), "| Excel: 5,995.80");
    console.log("h_124 (Free Cooling):", getRawStateValue("h_124"), "| Excel: 37,322.82");
    console.log("c_124 (Free Cooling alt):", getRawStateValue("c_124"));
    console.log("d_123 (Vent Exhaust):", getStateValue("d_123"), "| Excel: 13,464.53");
    console.log("k_97 (TB Penalty removal):", getRawStateValue("k_97"), "| Excel: 658.71");

    const removedSum = energyRemovedLinks.reduce((sum, link) => sum + link.value, 0);
    console.log("✅ ENERGY REMOVED SUM:", removedSum.toFixed(2), "| Excel: 68,150.87");

    console.log("\n⚖️ BALANCE CHECK:");
    console.log("Gained:", gainedSum.toFixed(2));
    console.log("Removed:", removedSum.toFixed(2));
    console.log("Difference:", (gainedSum - removedSum).toFixed(2));
    console.log("Balanced?", Math.abs(gainedSum - removedSum) < 1 ? "✅ YES" : "❌ NO");

    console.log("\n📊 Links generated:", allLinks.length);
    console.groupEnd();
    */

    return sankeyData;
  }

  // Public API
  return {
    getCoolingSankeyData: getCoolingSankeyData,
    COOLING_SANKEY_STRUCTURE_TEMPLATE: COOLING_SANKEY_STRUCTURE_TEMPLATE,
  };
})();
