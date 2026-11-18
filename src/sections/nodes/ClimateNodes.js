/**
 * ClimateNodes.js - Climate Calculation Nodes for Incremental Computation
 *
 * Part of the Multi-Model Architecture refactoring (Phase 2, Task 2.2)
 * See: docs/REFACTORING_PLAN.md
 *
 * This module expresses Section03 (Climate) calculations as computation nodes.
 * These nodes can be registered with ComputationGraph for incremental updates.
 *
 * Key calculations:
 * - Climate data lookup (HDD, CDD, temperatures from ClimateValues.js)
 * - Climate zone determination based on HDD
 * - Heating/Cooling setpoints based on occupancy type
 * - Ground-facing degree days (GF HDD, GF CDD)
 * - Temperature conversions (C to F)
 */
(function () {
  "use strict";

  // Ensure namespaces exist
  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Safely parse a numeric value
   */
  function parseNum(value, defaultVal = 0) {
    if (value === null || value === undefined || value === "N/A") return defaultVal;
    if (value === "Unavailable") return defaultVal;
    const num = parseFloat(String(value).replace(/,/g, ""));
    return isNaN(num) ? defaultVal : num;
  }

  /**
   * A station's June-August mean of a monthly field, weighted by the months'
   * days (30, 31, 31); null until the station has loaded (ClimateStation
   * .request recalculates on arrival) or where the city has no station.
   */
  const SUMMER_MONTHS = [
    [5, 30],
    [6, 31],
    [7, 31],
  ];
  function summerMean(stationId, field) {
    const station = window.TEUI?.ClimateStation?.request(stationId);
    const values = station?.months?.[field];
    if (!values) return null;
    const days = SUMMER_MONTHS.reduce((sum, [, d]) => sum + d, 0);
    const total = SUMMER_MONTHS.reduce((sum, [m, d]) => sum + values[m] * d, 0);
    return +(total / days).toFixed(2);
  }

  /**
   * Check if value is unavailable
   */
  function isUnavailable(value) {
    return value === "Unavailable" || value === "N/A";
  }

  /**
   * Get climate data from ClimateValues.js
   * @param {string} province - Province code (ON, BC, etc.)
   * @param {string} city - City name
   * @returns {object|null} Climate data for the city
   */
  function getClimateData(province, city) {
    const climateData = window.TEUI?.ClimateData;
    if (!climateData || !province || !city) return null;

    const provinceData = climateData[province.trim().toUpperCase()];
    if (!provinceData) return null;

    // Try exact match first
    if (provinceData[city]) return provinceData[city];

    // Try trimmed match
    const trimmedCity = city.trim();
    if (provinceData[trimmedCity]) return provinceData[trimmedCity];

    // Try case-insensitive match
    const cityLower = trimmedCity.toLowerCase();
    for (const [key, data] of Object.entries(provinceData)) {
      if (key.toLowerCase() === cityLower) {
        return data;
      }
    }

    return null;
  }

  // ============================================================================
  // INPUT NODES (User-editable)
  // ============================================================================

  const ClimateInputs = [
    {
      id: "climate.location.province",
      legacyId: "d_19",
      defaultValue: "ON",
      classification: "G",
      section: "S03",
      label: "Province"
    },
    {
      id: "climate.location.city",
      legacyId: "h_19",
      defaultValue: "Alexandria",
      classification: "G",
      section: "S03",
      label: "City"
    },
    {
      id: "climate.timeframe",
      legacyId: "h_20",
      defaultValue: "Present",
      classification: "G",
      section: "S03",
      label: "Climate Timeframe",
      validate: (v) => ["Present", "Future"].includes(v)
    },
    {
      id: "building.capacitance.setting",
      legacyId: "h_21",
      defaultValue: "Capacitance",
      classification: "C",
      section: "S03",
      label: "Thermal Capacitance Setting"
    },
    {
      id: "building.capacitance.percentage",
      legacyId: "i_21",
      defaultValue: 50,
      classification: "C",
      section: "S03",
      label: "Capacitance Percentage",
      unit: "%"
    },
    {
      id: "climate.coolingDays",
      legacyId: "m_19",
      defaultValue: 120,
      classification: "G",
      section: "S03",
      label: "Cooling Season Days"
    },
    {
      id: "climate.cooling.override",
      legacyId: "l_24",
      defaultValue: 24,
      classification: "C",
      section: "S03",
      label: "Cooling Setpoint Override",
      unit: "°C"
    },
    // Editable-computed override: CDD is computed from climate lookup but
    // user can type a value (many Canadian cities have CDD24=666=unavailable).
    // No legacyId — routing from d_21 is handled in recomputeForInput.
    {
      id: "climate.cooling.degreedays.userOverride",
      defaultValue: null,
      classification: "C",
      section: "S03",
      label: "CDD User Override"
    },
    // d_12, d_13: canonical inputs live in BuildingInfoNodes
    // (building.majorOccupancy, building.referenceStandard)
    // l_20, l_21: computed from the climate station (below, after
    // climate.station) - no longer inputs
  ];

  // ============================================================================
  // COMPUTATION NODES
  // ============================================================================

  const ClimateNodes = [
    // ========================================================================
    // CLIMATE STATION - the CWEC 2020 (else NASA POWER) station the cooling
    // reads (ClimateStation.js, ClimateStations.js). The id only; the station
    // itself loads on demand and the cooling node reads it from the cache.
    // ========================================================================
    {
      id: "climate.station",
      dependencies: ["climate.location.province", "climate.location.city"],
      classification: "G",
      section: "S03",
      label: "Climate Station",
      compute: (inputs) => {
        const CS = window.TEUI?.ClimateStation;
        const province = String(inputs["climate.location.province"] || "").trim().toUpperCase();
        const city = String(inputs["climate.location.city"] || "").trim();
        return CS ? CS.stationFor(province, city) : null;
      }
    },

    // ========================================================================
    // SUMMER NIGHT MEAN (l_20) + SUMMER MEAN RH (l_21) - the station's own
    // June-August, day-weighted: the mean daily MINIMUM and the mean RH.
    // Were user inputs defaulting to 20.43 °C / 55.85 % (a GTA summer, Andy
    // 2026-10-30: "I did not have the resources to dig in to every single
    // climate location"); Andy 2026-11-04: "allow the Summer Night Mean and
    // Summer Mean RH fields to reflect the data ... They can cease to be
    // user-editable". Shown in S03 only - the cooling reads the station's
    // months itself (CoolingISO52016), so neither moves an energy number.
    // ========================================================================
    {
      id: "climate.cooling.nightTemp",
      legacyId: "l_20",
      dependencies: ["climate.station"],
      classification: "G",
      section: "S03",
      label: "Summer Night Mean (mean daily minimum, Jun-Aug)",
      unit: "°C",
      compute: (inputs) => summerMean(inputs["climate.station"], "t_min")
    },
    {
      id: "climate.cooling.seasonMeanRH",
      legacyId: "l_21",
      dependencies: ["climate.station"],
      classification: "G",
      section: "S03",
      label: "Summer Mean RH (Jun-Aug)",
      unit: "%",
      compute: (inputs) => summerMean(inputs["climate.station"], "rh_mean")
    },

    // ========================================================================
    // CLIMATE DATA LOOKUP NODES
    // ========================================================================
    {
      id: "climate.heating.degreedays",
      legacyId: "d_20",
      dependencies: [
        "climate.location.province",
        "climate.location.city",
        "climate.timeframe"
      ],
      classification: "G",
      section: "S03",
      label: "Heating Degree Days (HDD)",
      unit: "°C·days",
      compute: (inputs) => {
        const province = inputs["climate.location.province"];
        const city = inputs["climate.location.city"];
        const timeframe = inputs["climate.timeframe"];
        const data = getClimateData(province, city);

        if (!data) return "Unavailable"; // No climate data for this location

        const hdd = timeframe === "Future" ? data.HDD18_2021_2050 : data.HDD18;
        // 666 means unavailable in ClimateValues.js
        if (hdd === null || hdd === 666) {
          return "Unavailable";
        }
        return hdd;
      }
    },
    {
      id: "climate.cooling.degreedays",
      legacyId: "d_21",
      dependencies: [
        "climate.location.province",
        "climate.location.city",
        "climate.timeframe",
        "climate.cooling.degreedays.userOverride"
      ],
      classification: "G",
      section: "S03",
      label: "Cooling Degree Days (CDD)",
      unit: "°C·days",
      compute: (inputs) => {
        // User override takes priority (many cities have CDD=unavailable)
        const override = inputs["climate.cooling.degreedays.userOverride"];
        if (override !== null && override !== undefined && override !== "") {
          const num = parseFloat(override);
          if (!isNaN(num) && num > 0) return num;
        }

        // Fall back to climate data lookup
        const province = inputs["climate.location.province"];
        const city = inputs["climate.location.city"];
        const timeframe = inputs["climate.timeframe"];
        const data = getClimateData(province, city);

        if (!data) return "Unavailable";

        const cdd = timeframe === "Future" ? data.CDD24_2021_2050 : data.CDD24;
        // 666 means unavailable in ClimateValues.js
        if (cdd === null || cdd === 666) {
          // Fall back to present if future unavailable
          if (timeframe === "Future" && data.CDD24 !== null && data.CDD24 !== 666) {
            return data.CDD24;
          }
          return "Unavailable";
        }
        return cdd;
      }
    },
    {
      id: "climate.temperature.coldest",
      legacyId: "d_23",
      dependencies: [
        "climate.location.province",
        "climate.location.city",
        "building.majorOccupancy"
      ],
      classification: "G",
      section: "S03",
      label: "Coldest Day Temperature",
      unit: "°C",
      compute: (inputs) => {
        const province = inputs["climate.location.province"];
        const city = inputs["climate.location.city"];
        const occupancy = inputs["building.majorOccupancy"];
        const data = getClimateData(province, city);

        if (!data) return -24;

        // Care facilities use 1% design temp, others use 2.5%
        const isCritical = occupancy === "Care";
        return isCritical
          ? (data.January_1 || data.January_2_5 || -26)
          : (data.January_2_5 || -24);
      }
    },
    {
      id: "climate.temperature.hottest",
      legacyId: "d_24",
      dependencies: ["climate.location.province", "climate.location.city"],
      classification: "G",
      section: "S03",
      label: "Hottest Day Temperature",
      unit: "°C",
      compute: (inputs) => {
        const province = inputs["climate.location.province"];
        const city = inputs["climate.location.city"];
        const data = getClimateData(province, city);

        return data?.July_2_5_Tdb || 34;
      }
    },
    // The wet bulb coincident with d_24 (NBC C-2's July 2.5 %) - F280's Ho
    // for the design latent gain (cooling.latentLoadFactor)
    {
      id: "climate.temperature.hottestWetBulb",
      dependencies: ["climate.location.province", "climate.location.city"],
      classification: "G",
      section: "S03",
      label: "Hottest Day Coincident Wet Bulb",
      unit: "°C",
      compute: (inputs) => {
        const data = getClimateData(
          inputs["climate.location.province"],
          inputs["climate.location.city"]
        );
        return data?.July_2_5_Twb ?? 23;
      }
    },
    {
      id: "climate.elevation",
      legacyId: "l_22",
      dependencies: ["climate.location.province", "climate.location.city"],
      classification: "G",
      section: "S03",
      label: "Elevation",
      unit: "m",
      compute: (inputs) => {
        const province = inputs["climate.location.province"];
        const city = inputs["climate.location.city"];
        const data = getClimateData(province, city);

        return data?.["Elev ASL (m)"] || 80;
      }
    },
    {
      id: "climate.temperature.winterAverage",
      legacyId: "d_25",
      dependencies: ["climate.location.province", "climate.location.city"],
      classification: "G",
      section: "S03",
      label: "Winter Average Temperature",
      unit: "°C",
      compute: (inputs) => {
        const province = inputs["climate.location.province"];
        const city = inputs["climate.location.city"];
        const data = getClimateData(province, city);

        return data?.Winter_Tdb_Avg ?? -7;
      }
    },

    // ========================================================================
    // CLIMATE ZONE
    // ========================================================================
    {
      id: "climate.zone",
      legacyId: "j_19",
      dependencies: ["climate.heating.degreedays"],
      classification: "G",
      section: "S03",
      label: "Climate Zone",
      compute: (inputs) => {
        const hdd = inputs["climate.heating.degreedays"];
        if (isUnavailable(hdd)) return "Unavailable";

        const hddNum = parseNum(hdd);
        // Excel Formula: =IF(D20<3000, 4, IF(D20<4000, 5, IF(D20<5000, 6, IF(D20<6000, 7.1, IF(D20<7000, 7.2, 8)))))
        if (hddNum < 3000) return "4.0";
        if (hddNum < 4000) return "5.0";
        if (hddNum < 5000) return "6.0";
        if (hddNum < 6000) return "7.1";
        if (hddNum < 7000) return "7.2";
        return "8.0";
      }
    },

    // ========================================================================
    // SETPOINTS
    // ========================================================================
    {
      id: "climate.heating.setpoint",
      legacyId: "h_23",
      dependencies: ["building.majorOccupancy", "building.referenceStandard"],
      classification: "C",
      section: "S03",
      label: "Heating Setpoint (energy)",
      unit: "°C",
      // The ENERGY set-point: what the annual model heats to. The DESIGN (sizing) set-point is
      // climate.heating.obcSetpoint (m_23), used by S15's peaks and S21 / F280. Andy 2026-11-18: separate
      // the two; critical occupancies keep the code's 22 °C ("We cannot over-ride that as it is a code
      // requirement"); PH is 20 °C, PHPP's own (it was 18, which no source gives).
      compute: (inputs) => {
        const occupancy = inputs["building.majorOccupancy"] || "Other";
        const standard = inputs["building.referenceStandard"] || "OBC SB-10";
        const isPH = standard && standard.toUpperCase().includes("PH");
        const isCare = occupancy.includes("Care");
        const isResidential = occupancy.includes("Residential");
        // Part 9 houses on a performance path: NBC's tiers and OBC's SB-12.
        const isPart9 = standard.startsWith("NBC T") || standard.startsWith("OBC SB12");

        // Care occupancies are critical under every standard: the code's 22 °C, never overridden.
        if (isCare) return 22;
        // Passive House: PHPP 9.6a's interior temperature winter, 20 °C (Verification sheet; its Check
        // sheet warns above 20).
        if (isPH) return 20;
        // Part 9 houses: 20 °C. NBC 2025 Sentence 9.36.6.4.(5): 20 °C in living spaces (19 °C in
        // basements). OBC SB-12's performance path uses EnerGuide's operating conditions (ERS v15.2
        // §4.6.2.2, Table 2: 21 °C day / 18 °C night, "a constant weighted average of 20 degrees
        // Celsius"; 19 °C basements). One zone here, so the living-space value. Not critical occupancy:
        // a Part 9 house is residential (Andy 2026-11-18).
        if (isResidential && isPart9) return 20;
        // Residential under Part 3 (OBC SB10, NECB): critical occupancy, 22 °C.
        if (isResidential) return 22;
        return 18; // Default for other occupancies
      }
    },
    {
      id: "climate.heating.obcSetpoint",
      legacyId: "m_23",
      dependencies: ["building.majorOccupancy"],
      classification: "C",
      section: "S03",
      label: "OBC Heating Setpoint (Building Code Baseline; the DESIGN set-point)",
      unit: "°C",
      // The DESIGN (sizing) set-point: what the heating must hold at the outdoor design temperature.
      // NBC 2025 9.33.3.1.(1) and CSA F280-12 Cl. 4.2 both give 22 °C in living spaces. S15's peaks and
      // S21 / F280 read this; the annual model reads climate.heating.setpoint.
      compute: (inputs) => {
        const occupancy = inputs["building.majorOccupancy"] || "Other";

        // Building code baseline - no PH override
        // Use includes() to match values like "C-Residential", "D-Residential MURB", etc.
        const isCriticalOccupancy =
          occupancy.includes("Residential") || occupancy.includes("Care");

        if (isCriticalOccupancy) {
          return 22; // OBC requires 22°C for residential/care
        }
        return 18;
      }
    },
    {
      id: "climate.cooling.setpoint",
      legacyId: "h_24",
      dependencies: [
        "building.majorOccupancy",
        "climate.cooling.override",
        "model.isReference",
      ],
      classification: "C",
      section: "S03",
      label: "Cooling Setpoint",
      unit: "°C",
      // Andy 2026-11-04: "users ROUTINELY crank cooling down by dragging Tset
      // for Cooling lower, resulting in higher ACTUAL cooling loads. The
      // over-ride is the best way to model this 'bad user' behaviour. It
      // should be allowed for the Target model, but the Reference model should
      // still use the hard-coded code-established value. I think a lower bound
      // of 18ºC is reasonable as that is what actual systems often cap at."
      // Was Excel H24=IF(L24>24, L24, 24): an override could only raise it.
      compute: (inputs) => {
        if (inputs["model.isReference"] === true) return 24;
        const override = parseNum(inputs["climate.cooling.override"], 24);
        return Math.max(18, override);
      }
    },
    {
      id: "climate.cooling.nbcLimit",
      legacyId: "m_24",
      dependencies: [],
      classification: "C",
      section: "S03",
      label: "NBC Cooling Upper Limit",
      unit: "°C",
      compute: () => 26 // NBC standard upper limit
    },

    // ========================================================================
    // COMPLIANCE CHECKS
    // ========================================================================
    {
      id: "climate.heating.compliance",
      legacyId: "n_23",
      dependencies: [
        "climate.heating.setpoint",
        "climate.heating.obcSetpoint",
        "building.majorOccupancy",
        "building.referenceStandard"
      ],
      classification: "C",
      section: "S03",
      label: "Heating Compliance",
      compute: (inputs) => {
        const actual = parseNum(inputs["climate.heating.setpoint"], 21);
        const occupancy = inputs["building.majorOccupancy"] || "Other";
        const standard = inputs["building.referenceStandard"] || "";
        // A Part 9 house (NBC tiers, OBC SB-12) is modelled at the code's own energy set-point, 20 °C
        // (NBC 9.36.6.4.(5); SB-12 / EnerGuide); everything else is held to the design baseline.
        const part9House =
          occupancy.includes("Residential") && (standard.startsWith("NBC T") || standard.startsWith("OBC SB12"));
        const required = part9House ? 20 : parseNum(inputs["climate.heating.obcSetpoint"], 22);

        // Pass if actual >= required
        return actual >= required ? "✓" : "✗";
      }
    },
    {
      id: "climate.cooling.compliance",
      legacyId: "n_24",
      dependencies: ["climate.cooling.setpoint", "climate.cooling.nbcLimit"],
      classification: "C",
      section: "S03",
      label: "Cooling Compliance",
      compute: (inputs) => {
        const actual = parseNum(inputs["climate.cooling.setpoint"], 24);
        const limit = parseNum(inputs["climate.cooling.nbcLimit"], 26);

        // Pass if actual <= limit
        return actual <= limit ? "✓" : "✗";
      }
    },

    // ========================================================================
    // GROUND-FACING DEGREE DAYS
    // ========================================================================
    {
      id: "climate.groundFacing.hdd",
      legacyId: "d_22",
      dependencies: ["climate.heating.setpoint", "climate.coolingDays"],
      classification: "G",
      section: "S03",
      label: "Ground Facing HDD",
      unit: "°C·days",
      compute: (inputs) => {
        const heatingSetpoint = parseNum(inputs["climate.heating.setpoint"], 21);
        const coolingDays = parseNum(inputs["climate.coolingDays"], 120);
        const heatingDays = 365 - coolingDays;

        // GF HDD = (TsetHeat - 10) × heatingDays
        // 10°C is the assumed ground temperature
        return Math.round((heatingSetpoint - 10) * heatingDays);
      }
    },
    {
      id: "climate.groundFacing.cdd",
      legacyId: "h_22",
      dependencies: [
        "climate.cooling.setpoint",
        "climate.coolingDays",
        "building.capacitance.setting",
        "building.capacitance.percentage"
      ],
      classification: "G",
      section: "S03",
      label: "Ground Facing CDD",
      unit: "°C·days",
      compute: (inputs) => {
        // From Section03.js line 1832-1849: calculateGroundFacing()
        const coolingSetpoint = parseNum(inputs["climate.cooling.setpoint"], 24);
        const coolingDays = parseNum(inputs["climate.coolingDays"], 120);
        const capacitanceSetting = inputs["building.capacitance.setting"] || "Static";

        // Ground temp is 10°C
        const groundTemp = 10;

        let gfcdd;
        if (capacitanceSetting === "Static") {
          // Static: MAX(0, (10 - TsetCool) * DaysCooling)
          gfcdd = Math.max(0, (groundTemp - coolingSetpoint) * coolingDays);
        } else {
          // Capacitance mode: (10 - TsetCool) * DaysCooling (can be negative)
          gfcdd = (groundTemp - coolingSetpoint) * coolingDays;
        }

        return Math.round(gfcdd);
      }
    },

    // ========================================================================
    // TEMPERATURE CONVERSIONS
    // ========================================================================
    {
      id: "climate.temperature.coldestF",
      legacyId: "e_23",
      dependencies: ["climate.temperature.coldest"],
      classification: "G",
      section: "S03",
      label: "Coldest Day Temperature (Fahrenheit)",
      unit: "°F",
      compute: (inputs) => {
        const celsius = parseNum(inputs["climate.temperature.coldest"], -24);
        return Math.round((celsius * 9) / 5 + 32);
      }
    },
    {
      id: "climate.temperature.hottestF",
      legacyId: "e_24",
      dependencies: ["climate.temperature.hottest"],
      classification: "G",
      section: "S03",
      label: "Hottest Day Temperature (Fahrenheit)",
      unit: "°F",
      compute: (inputs) => {
        const celsius = parseNum(inputs["climate.temperature.hottest"], 34);
        return Math.round((celsius * 9) / 5 + 32);
      }
    },
    {
      id: "climate.temperature.winterAverageF",
      legacyId: "e_25",
      dependencies: ["climate.temperature.winterAverage"],
      classification: "G",
      section: "S03",
      label: "Winter Average Temperature (Fahrenheit)",
      unit: "°F",
      compute: (inputs) => {
        const celsius = parseNum(inputs["climate.temperature.winterAverage"], -7);
        // Note: e_25 is NOT rounded in legacy (unlike e_23/e_24)
        return (celsius * 9) / 5 + 32;
      }
    },

    // ========================================================================
    // SETPOINT FAHRENHEIT CONVERSIONS
    // ========================================================================
    {
      id: "climate.heating.setpointF",
      legacyId: "i_23",
      dependencies: ["climate.heating.setpoint"],
      classification: "C",
      section: "S03",
      label: "Heating Setpoint (Fahrenheit)",
      unit: "°F",
      compute: (inputs) => {
        const celsius = parseNum(inputs["climate.heating.setpoint"], 21);
        return Math.round((celsius * 9) / 5 + 32);
      }
    },
    {
      id: "climate.cooling.setpointF",
      legacyId: "i_24",
      dependencies: ["climate.cooling.setpoint"],
      classification: "C",
      section: "S03",
      label: "Cooling Setpoint (Fahrenheit)",
      unit: "°F",
      compute: (inputs) => {
        const celsius = parseNum(inputs["climate.cooling.setpoint"], 24);
        return Math.round((celsius * 9) / 5 + 32);
      }
    }
  ];

  // ============================================================================
  // REGISTRATION HELPER
  // ============================================================================

  /**
   * Register all climate nodes with a computation graph
   * @param {ComputationGraph} graph
   */
  function registerClimateNodes(graph) {
    // Register inputs
    for (const input of ClimateInputs) {
      graph.registerInput(input);
    }

    // Register computation nodes
    for (const node of ClimateNodes) {
      graph.registerNode(node);
    }

    console.log(
      `[ClimateNodes] Registered ${ClimateInputs.length} inputs and ${ClimateNodes.length} computation nodes`
    );
  }

  /**
   * Register climate fields with the FieldRegistry
   */
  function registerClimateFields() {
    const Registry = window.TEUI.FieldRegistry;
    if (!Registry) {
      console.warn("[ClimateNodes] FieldRegistry not available");
      return;
    }

    // Register inputs
    for (const input of ClimateInputs) {
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

    // Register computation nodes
    for (const node of ClimateNodes) {
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

  window.TEUI.ComputationNodes.Climate = {
    inputs: ClimateInputs,
    nodes: ClimateNodes,
    register: registerClimateNodes,
    registerFields: registerClimateFields
  };

  console.log("[ClimateNodes] Module loaded");
})();
