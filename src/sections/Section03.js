/**
 * 4012-Section03.js - ENHANCED WITH DUALSTATE ARCHITECTURE
 * Climate Calculations (Section 3) module for TEUI Calculator 4.012
 *
 * BREAKTHROUGH: Integrated proven Target/Reference state isolation
 * Using ClimateValues JSON for data lookup (no Excel import needed)
 *
 * ✅ SMOOTH-MOVE-S02: No d_13 listeners - PH values from ReferenceValues.js
 * h_23 (Tset Heating) values come from ReferenceValues.js via "Set Values" button
 * d_13 changes are passive until user triggers Import Quarantine workflow
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

// Section 3: Climate Calculations Module with DualState Architecture
window.TEUI.SectionModules.sect03 = (function () {
  // TargetState/ReferenceState/ModeManager removed — graph + SM is the single source of truth.

  function getModeValue(fieldId) {
    const isRef = window.TEUI.ReferenceToggle?.isReferenceMode();
    return window.TEUI.StateManager?.getValue(isRef ? `ref_${fieldId}` : fieldId);
  }

  function setModeValue(fieldId, value, source = "user-modified") {
    const isRef = window.TEUI.ReferenceToggle?.isReferenceMode();
    const key = isRef ? `ref_${fieldId}` : fieldId;
    if (window.TEUI.StateManager?.setValue) {
      window.TEUI.StateManager.setValue(key, value, source);
    }
  }

  //==========================================================================
  // CLIMATE DATA SERVICE - Direct ClimateValues.js Access
  //==========================================================================

  /**
   * ClimateDataService - Direct access to ClimateValues.js data
   * Copied verbatim from 4012 S03 Unified Toggle Test.html
   */
  const ClimateDataService = {
    ensureAvailable: function (callback, maxRetries = 10) {
      let attempts = 0;

      const checkData = () => {
        attempts++;
        console.log(
          `S03: Checking climate data availability (attempt ${attempts}/${maxRetries})`
        );

        if (
          window.TEUI?.ClimateData &&
          Object.keys(window.TEUI.ClimateData).length > 0
        ) {
          console.log(
            "S03: Climate data available",
            Object.keys(window.TEUI.ClimateData)
          );
          callback(window.TEUI.ClimateData);
          return;
        }

        if (attempts >= maxRetries) {
          console.error(
            "S03: Error - Climate data not available after max retries"
          );
          return;
        }

        const delay = Math.min(100 * Math.pow(2, attempts), 2000);
        console.log(`S03: Will retry in ${delay}ms`);
        setTimeout(checkData, delay);
      };

      checkData();
    },

    getProvinces: function () {
      if (!window.TEUI?.ClimateData) return [];
      return Object.keys(window.TEUI.ClimateData).sort();
    },

    getCitiesForProvince: function (province) {
      if (!window.TEUI?.ClimateData || !window.TEUI.ClimateData[province])
        return [];
      return Object.keys(window.TEUI.ClimateData[province]).sort();
    },

    getCityData: function (province, city) {
      if (
        !window.TEUI?.ClimateData ||
        !window.TEUI.ClimateData[province] ||
        !window.TEUI.ClimateData[province][city]
      ) {
        return null;
      }
      return window.TEUI.ClimateData[province][city];
    },

    getProvinceFullName: function (abbr) {
      const provinceNames = {
        AB: "Alberta",
        BC: "British Columbia",
        MB: "Manitoba",
        NB: "New Brunswick",
        NL: "Newfoundland and Labrador",
        NS: "Nova Scotia",
        NT: "Northwest Territories",
        NU: "Nunavut",
        ON: "Ontario",
        PE: "Prince Edward Island",
        QC: "Québec",
        SK: "Saskatchewan",
        YT: "Yukon",
      };
      return provinceNames[abbr] || abbr;
    },
  };

  //==========================================================================
  // CLIMATE DATA PROCESSING - Pure Functions for Dual-State Architecture
  //==========================================================================

  function getClimateDataForState() {
    /* graph computes */
  }

  //==========================================================================
  // PART 1: CONSOLIDATED FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  // Define rows with integrated field definitions for a fully consolidated approach
  const sectionRows = {
    // Unit Subheader Row - MUST BE FIRST for proper rendering order
    header: {
      id: "03-ID",
      rowId: "03-ID",
      label: "Climate Units",
      cells: {
        c: { content: "C", classes: ["section-subheader"] },
        d: { content: "ºC", classes: ["section-subheader"] },
        e: { content: "ºF", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "G", classes: ["section-subheader"] },
        h: { content: "ºC", classes: ["section-subheader"] },
        i: { content: "ºF", classes: ["section-subheader"] },
        j: { content: "J", classes: ["section-subheader"] },
        k: { content: "K", classes: ["section-subheader"] },
        l: { content: "L", classes: ["section-subheader"] },
        m: { content: "M", classes: ["section-subheader"] },
        n: { content: "N", classes: ["section-subheader"] },
      },
    },

    // Row 19: Province, City, Climate Zone
    19: {
      id: "L.1.1",
      rowId: "L.1.1",
      label: "Province",
      cells: {
        c: { content: "Province", type: "label" },
        d: {
          fieldId: "d_19",
          semanticPath: "climate.province",
          type: "dropdown",
          label: "Province",
          dropdownId: "dd_d_19",
          value: "ON",
          section: "climateCalculations",
          span: 2, // spans the empty E: "Newfoundland and Labrador" shows whole
          tooltip: true, // Select a Province
          options: [{ value: "", name: "Select Province" }],
          getOptions: function () {
            const provinces = ClimateDataService.getProvinces();
            return provinces.map(province => ({
              value: province,
              name: ClimateDataService.getProvinceFullName(province),
            }));
          },
        },
        f: { content: "L.1.2", classes: ["label-prefix"] },
        g: { content: "City", classes: ["label-main"] },
        h: {
          fieldId: "h_19",
          semanticPath: "climate.city",
          type: "dropdown",
          label: "City",
          dropdownId: "dd_h_19",
          value: "Alexandria",
          section: "climateCalculations",
          tooltip: true, // Municpality
          dependencies: ["d_19"],
          options: [{ value: "", name: "Select City" }],
          getOptions: function (provinceValue) {
            if (!provinceValue) {
              provinceValue =
                getModeValue("d_19") ||
                document.querySelector('[data-dropdown-id="dd_d_19"]')?.value;
            }

            const cities =
              ClimateDataService.getCitiesForProvince(provinceValue);
            return cities.map(city => ({
              value: city,
              name: city,
            }));
          },
        },
        i: { content: "Climate Zone" },
        j: {
          fieldId: "j_19",
          semanticPath: "climate.zone",
          type: "derived",
          label: "Climate Zone",
          value: "6.0",
          section: "climateCalculations",
          dependencies: ["d_20"],
        },
        k: { content: "L.3.3", classes: ["label-prefix"] },
        l: { content: "Days Cooling", classes: ["label-main"] },
        m: {
          fieldId: "m_19",
          semanticPath: "climate.coolingDays",
          type: "editable",
          label: "Days Cooling",
          value: "120",
          section: "climateCalculations",
          tooltip: true, // Cooling Days are Increasing, 120 to 140 in the GTHA
          classes: ["user-input", "editable"],
        },
      },
    },

    // Row 20: Heating Degree Days
    20: {
      id: "L.2.1",
      rowId: "L.2.1",
      label: "Heating Degree Days (HDD)",
      cells: {
        c: { content: "Heating Degree Days (HDD)", type: "label" },
        d: {
          fieldId: "d_20",
          semanticPath: "climate.hdd",
          type: "derived",
          label: "Heating Degree Days (HDD)",
          value: "4600",
          section: "climateCalculations",
          dependencies: ["d_19", "h_19"],
        },
        f: { content: "L.2.2", classes: ["label-prefix"] },
        g: { content: "Current or Future Values", classes: ["label-main"] },
        h: {
          fieldId: "h_20",
          semanticPath: "climate.timeframe",
          type: "dropdown",
          label: "Current or Future Weather Values",
          dropdownId: "dd_h_20",
          value: "Present",
          section: "climateCalculations",
          tooltip: true, // Weather Data Range
          options: [
            { value: "Present", name: "Present (1991-2020)" },
            { value: "Future", name: "Future (2021-2050)" },
          ],
        },
        // NEW: Summer Night Temperature field (l_20) - Cooling Refactor Phase 5.1.1
        // Replaces: j_20 "HDD Reference Lookup" and k "HDD - Energy Star"
        // TODO: Add tooltips with links to HDD/CDD reference resources later
        j: { content: "L.2.0", classes: ["label-prefix"] },
        k: { content: "Summer Night Mean", classes: ["label-main"] }, // Mean Night-time Outdoor Temp
        l: {
          fieldId: "l_20",
          semanticPath: "climate.cooling.nightTemp",
          type: "calculated",
          label: "Summer Night (Seasonal Mean) ºC",
          section: "climateCalculations",
          dependencies: ["h_19"],
          tooltip: true, // the station's Jun-Aug mean daily minimum (ClimateNodes)
        },
        m: { content: "ºC", classes: ["unit-label"] },
      },
    },

    // Row 21: Cooling Degree Days
    21: {
      id: "L.2.3",
      rowId: "L.2.3",
      label: "Cooling Degree Days (CDD)",
      cells: {
        c: {
          content:
            'Cooling Degree Days (<a href="https://climateatlas.ca/map/canada/cooldd_2060_85#" target="_blank" rel="noopener noreferrer">CDD</a>)',
          type: "label",
          htmlContent: true, // ✅ Enable HTML rendering for clickable link
        },
        d: {
          fieldId: "d_21",
          semanticPath: "climate.cdd",
          type: "editable", // ✅ Changed from "derived" - always editable like g_88
          label: "Cooling Degree Days (CDD)",
          value: "196",
          section: "climateCalculations",
          classes: ["user-input", "editable"], // ✅ Add styling for editable field
          tooltip: true, // ✅ Shows help with Climate Atlas link when unavailable
        },
        f: { content: "G.4.2", classes: ["label-prefix"] },
        g: { content: "Capacitance", classes: ["label-main"] },
        h: {
          fieldId: "h_21",
          semanticPath: "building.capacitanceMethod",
          type: "dropdown",
          label: "Capacitance Method",
          dropdownId: "dd_h_21",
          value: "Capacitance",
          section: "climateCalculations",
          tooltip: true, // Select Calculation Method
          options: [
            { value: "Static", name: "Static" },
            { value: "Capacitance", name: "Capacitance" },
          ],
        },
        i: {
          fieldId: "i_21",
          semanticPath: "building.capacitanceFactor",
          type: "percentage",
          label: "Capacitance Factor %",
          value: "50",
          min: 0,
          max: 100,
          step: 5,
          section: "climateCalculations",
          tooltip: true, // Capacitance Factor
          defaultValue: "50",
          conditionalDeps: ["h_21"], // Set to 0 when h_21="Static"
        },
        // NEW: Summer RH% field (l_21) - Cooling Refactor Phase 5.1.1
        // Replaces: j_21 "CDD Reference Lookup" and k "CDD - Energy Star"
        // TODO: Add tooltips with links to HDD/CDD reference resources later
        j: { content: "L.2.2", classes: ["label-prefix"] },
        k: { content: "Summer Mean RH", classes: ["label-main"] },
        l: {
          fieldId: "l_21",
          semanticPath: "climate.cooling.seasonMeanRH",
          type: "calculated",
          label: "Summer Mean RH%",
          section: "climateCalculations",
          dependencies: ["h_19"],
          tooltip: true, // the station's Jun-Aug mean RH (ClimateNodes)
        },
        m: { content: "%", classes: ["unit-label"] },
      },
    },

    // Row 22: Ground Facing HDD, Ground Facing CDD, Elevation
    22: {
      id: "L.2.4",
      rowId: "L.2.4",
      label: "Ground Facing GF HDD",
      cells: {
        c: { content: "Ground Facing GF HDD", type: "label" },
        d: {
          fieldId: "d_22",
          semanticPath: "climate.groundFacingHdd",
          type: "derived",
          label: "Ground Facing GF HDD",
          value: "1960",
          section: "climateCalculations",
          dependencies: ["d_20"],
        },
        e: { content: "ºC•days", classes: ["unit-label"] },
        f: { content: "L.2.5", classes: ["label-prefix"] },
        g: { content: "GF CDD", classes: ["label-main"] },
        h: {
          fieldId: "h_22",
          semanticPath: "climate.groundFacingCdd",
          type: "calculated",
          label: "Ground Facing CDD",
          value: "-1680",
          section: "climateCalculations",
          dependencies: ["d_21"],
        },
        i: { content: "ºC•days", classes: ["unit-label"] },
        j: { content: "L.1.3", classes: ["label-prefix"] },
        k: { content: "Elevation (ASL)", classes: ["label-main"] },
        l: {
          fieldId: "l_22",
          semanticPath: "climate.elevation",
          type: "editable",
          label: "Elevation (ASL): metres",
          value: "80",
          section: "climateCalculations",
          classes: ["user-input", "editable"],
          dependencies: ["d_19", "h_19"], // Populated from city climate data lookup
        },
        m: { content: "m", classes: ["unit-label"] },
      },
    },

    // Row 23: Coldest Days, Heating Setpoint
    23: {
      id: "L.3.1",
      rowId: "L.3.1",
      label: "Coldest Days (Location Specific)",
      cells: {
        c: { content: "Coldest Days (Location Specific)", type: "label" },
        d: {
          fieldId: "d_23",
          semanticPath: "climate.coldestTemp",
          type: "derived",
          value: "-24",
          section: "climateCalculations",
          dependencies: ["d_19", "h_19", "d_12"],
        },
        e: {
          fieldId: "e_23",
          semanticPath: "climate.coldestTempF",
          type: "calculated",
          value: "-11",
          section: "climateCalculations",
          dependencies: ["d_23"],
        },
        f: { content: "B.1.2", classes: ["label-prefix"] },
        g: { content: "Tset Heating", classes: ["label-main"] },
        h: {
          fieldId: "h_23",
          semanticPath: "building.heatingSetpoint",
          type: "calculated",
          section: "climateCalculations",
          dependencies: ["d_12"],
        },
        i: {
          fieldId: "i_23",
          semanticPath: "building.heatingSetpointF",
          type: "calculated",
          value: "66",
          section: "climateCalculations",
          dependencies: ["h_23"],
        },
        m: {
          fieldId: "m_23",
          semanticPath: "reference.heatingSetpointMin",
          type: "calculated",
          label: "OBC Required Heating Setpoint",
          value: "22",
          section: "climateCalculations",
          dependencies: ["d_12"], // Excel: =XLOOKUP(D12, OccType, MinIndoorTemp)
          tooltip: true,
        },
        n: {
          fieldId: "n_23",
          semanticPath: "compliance.heatingSetpoint",
          type: "calculated",
          label: "Heating Setpoint Compliance",
          value: "✓",
          section: "climateCalculations",
          dependencies: ["h_23", "m_23"], // ✓ if h_23 >= m_23, ✗ if h_23 < m_23
          tooltip: true,
        },
      },
    },

    // Row 24: Hottest Days, Cooling Setpoint & Override
    24: {
      id: "L.3.2",
      rowId: "L.3.2",
      label: "Hottest Days (Location Specific)",
      cells: {
        c: { content: "Hottest Days (Location Specific)", type: "label" },
        d: {
          fieldId: "d_24",
          semanticPath: "climate.hottestTemp",
          type: "derived",
          value: "34",
          section: "climateCalculations",
          dependencies: ["d_19", "h_19"],
        },
        e: {
          fieldId: "e_24",
          semanticPath: "climate.hottestTempF",
          type: "calculated",
          value: "98",
          section: "climateCalculations",
          dependencies: ["d_24"],
        },
        f: { content: "B.1.3", classes: ["label-prefix"] },
        g: { content: "Tset Cooling", classes: ["label-main"] },
        h: {
          fieldId: "h_24",
          semanticPath: "building.coolingSetpoint",
          type: "calculated",
          section: "climateCalculations",
          dependencies: ["d_12"],
          tooltip: true, // automatic Cooling setpoint based on occupancy type
        },
        i: {
          fieldId: "i_24",
          semanticPath: "building.coolingSetpointF",
          type: "calculated",
          value: "78",
          section: "climateCalculations",
          dependencies: ["h_24", "l_24"],
        },
        j: { content: "B.1.4", classes: ["label-prefix"] },
        k: { content: "Cooling Override", classes: ["label-main"] },
        l: {
          fieldId: "l_24",
          semanticPath: "building.coolingOverride",
          type: "editable",
          label: "Cooling Override",
          value: "24",
          section: "climateCalculations",
          classes: ["user-input", "editable"],
          tooltip: true, // User-defined cooling setpoint override (ºC)
        },
        m: {
          fieldId: "m_24",
          semanticPath: "reference.coolingSetpointMax",
          type: "calculated",
          label: "NBC Upper Limit",
          value: "26",
          section: "climateCalculations",
          dependencies: [], // Static value - NBC acceptable upper limit for cooling (replaces ASHRAE 90.1)
          tooltip: true,
        },
        n: {
          fieldId: "n_24",
          semanticPath: "compliance.coolingSetpoint",
          type: "calculated",
          label: "Cooling Setpoint Compliance",
          value: "✓",
          section: "climateCalculations",
          dependencies: ["h_24", "m_24"], // ✓ if h_24 <= m_24, ✗ if h_24 > m_24
          tooltip: true,
        },
      },
    },

    // Row 25: Winter Average Temperature (for condensation risk assessment)
    25: {
      id: "L.3.3",
      rowId: "L.3.3",
      label: "Winter Average Temp. (Location Specific)",
      cells: {
        b: { content: "L.3.3", classes: ["label-prefix"] },
        c: {
          content: "Winter Average Temp. (Location Specific)",
          type: "label",
        },
        d: {
          fieldId: "d_25",
          semanticPath: "climate.winterAverageTemp",
          type: "calculated",
          value: "0",
          section: "climateCalculations",
          dependencies: ["d_20", "m_19"],
          tooltip: true, // Winter average temperature calculated from HDD and heating season days
        },
        e: {
          fieldId: "e_25",
          semanticPath: "climate.winterAverageTempF",
          type: "calculated",
          value: "32",
          section: "climateCalculations",
          dependencies: ["d_25"],
        },
        // G.4.3, the ground heat-loss method, retired 2026-11-19: S21 F280 Mode chooses it (BASESIMP On,
        // OBJECTIVE's Off; ground.methodInEffect).
        j: { content: "G.4.4", classes: ["label-prefix"] },
        k: { content: "Foundation Config.", classes: ["label-main"] },
        l: {
          fieldId: "l_25",
          semanticPath: "ground.basesimp.configuration",
          type: "dropdown",
          label: "Foundation Configuration (BASESIMP)",
          dropdownId: "dd_l_25",
          value: "1",
          section: "climateCalculations",
          span: 3, // spans the empty M and N
          tooltip: true,
          getOptions: function () {
            const configs = window.TEUI.BasesimpData?.configs || {};
            return Object.entries(configs).map(([n, c]) => ({ value: n, name: c.name }));
          },
        },
      },
    },

    // Rows 26 and 26b: BASESIMP's inputs (CSA F280-12 Cl. 5.2.2.1), shown under F280 Mode On
    26: {
      id: "G.4.5",
      rowId: "G.4.5",
      label: "Depth Below Grade (m)",
      cells: {
        b: { content: "G.4.5", classes: ["label-prefix"] },
        c: { content: "Depth Below Grade (m)", type: "label" },
        d: {
          fieldId: "d_26",
          semanticPath: "ground.basesimp.depth",
          type: "editable",
          label: "Depth Below Grade",
          value: "2.06",
          section: "climateCalculations",
          classes: ["user-input", "editable"],
          tooltip: true,
        },
        f: { content: "G.4.6", classes: ["label-prefix"] },
        g: { content: "Exposed Perimeter (m)", classes: ["label-main"] },
        h: {
          fieldId: "h_26",
          semanticPath: "ground.basesimp.exposedPerimeter",
          type: "editable",
          label: "Exposed Perimeter",
          value: "0",
          section: "climateCalculations",
          classes: ["user-input", "editable"],
          tooltip: true,
        },
        j: { content: "G.4.7", classes: ["label-prefix"] },
        k: { content: "Soil Conductivity (W/mK)", classes: ["label-main"] },
        l: {
          fieldId: "l_26",
          semanticPath: "ground.basesimp.soilConductivity",
          type: "editable",
          label: "Soil Conductivity",
          value: "0.85",
          section: "climateCalculations",
          classes: ["user-input", "editable"],
          tooltip: true,
        },
      },
    },
    "26b": {
      id: "G.4.8",
      rowId: "G.4.8",
      label: "Water Table Depth (m)",
      cells: {
        b: { content: "G.4.8", classes: ["label-prefix"] },
        c: { content: "Water Table Depth (m)", type: "label" },
        d: {
          fieldId: "d_26b",
          semanticPath: "ground.basesimp.waterTable",
          type: "editable",
          label: "Water Table Depth",
          value: "8",
          section: "climateCalculations",
          classes: ["user-input", "editable"],
          tooltip: true,
        },
        f: { content: "G.4.9", classes: ["label-prefix"] },
        g: { content: "Deep Ground Temp. (F280) °C", classes: ["label-main"] },
        h: {
          fieldId: "h_26b",
          semanticPath: "ground.basesimp.deepGround",
          type: "calculated",
          value: "",
          section: "climateCalculations",
          tooltip: true,
        },
        j: { content: "G.4.10", classes: ["label-prefix"] },
        k: { content: "BASESIMP Peak Heat Loss (W)", classes: ["label-main"] },
        l: {
          fieldId: "l_26b",
          semanticPath: "ground.basesimp.peakHeatLoss",
          type: "calculated",
          value: "",
          section: "climateCalculations",
          tooltip: true,
        },
      },
    },
  };

  //==========================================================================
  // PART 2: ACCESSOR METHODS TO EXTRACT FIELDS AND LAYOUT
  //==========================================================================

  /**
   * Extract field definitions from the integrated layout
   * This separates the fields from the layout for compatibility with existing code
   */
  function getFields() {
    const fields = {};

    // Extract field definitions from layout rows
    Object.values(sectionRows).forEach(row => {
      if (!row.cells) return;

      Object.values(row.cells).forEach(cell => {
        if (cell.fieldId && cell.type) {
          // Create a field definition with relevant properties
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.label || cell.content || row.label,
            defaultValue: cell.value || "",
            section: cell.section || "climateCalculations",
          };

          // Copy additional field properties if they exist
          if (cell.semanticPath)
            fields[cell.fieldId].semanticPath = cell.semanticPath; // Phase 5: Include semantic path
          if (cell.dropdownId)
            fields[cell.fieldId].dropdownId = cell.dropdownId;
          if (cell.options) fields[cell.fieldId].options = cell.options;
          if (cell.getOptions)
            fields[cell.fieldId].getOptions = cell.getOptions;
          if (cell.dependencies)
            fields[cell.fieldId].dependencies = cell.dependencies;
          if (cell.min !== undefined) fields[cell.fieldId].min = cell.min;
          if (cell.max !== undefined) fields[cell.fieldId].max = cell.max;
          if (cell.step !== undefined) fields[cell.fieldId].step = cell.step;
          if (cell.classes) fields[cell.fieldId].classes = cell.classes;
        }
      });
    });

    return fields;
  }

  /**
   * Extract dropdown options from the integrated layout
   */
  function getDropdownOptions() {
    const options = {};

    // Extract dropdown options from cells with dropdownId
    Object.values(sectionRows).forEach(row => {
      if (!row.cells) return;

      Object.values(row.cells).forEach(cell => {
        if (cell.dropdownId && cell.options) {
          options[cell.dropdownId] = cell.options;
        }
      });
    });

    return options;
  }

  /**
   * Generate layout from integrated row definitions
   * FIXED: Now properly places the header row first
   */
  function getLayout() {
    // Create array with rows in the correct order
    const layoutRows = [];

    // STEP 1: First add the header row if it exists
    if (sectionRows["header"]) {
      layoutRows.push(createLayoutRow(sectionRows["header"]));
    }

    // STEP 2: Add all remaining rows in the proper order (excluding the header)
    Object.entries(sectionRows).forEach(([key, row]) => {
      if (key !== "header") {
        layoutRows.push(createLayoutRow(row));
      }
    });

    return { rows: layoutRows };
  }

  /**
   * Helper function to convert a row definition to the layout format expected by the renderer
   */
  function createLayoutRow(row) {
    // Create standard row structure
    const rowDef = {
      id: row.id,
      cells: [
        {}, // Empty column A
        {}, // ID column B (auto-populated)
      ],
    };

    // Add cells C through N based on the row definition
    const columns = [
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
    ];

    // For each column, add the cell definition if it exists in the row
    columns.forEach(col => {
      if (row.cells && row.cells[col]) {
        // Create a simplified cell definition for the renderer
        // without the extra field properties
        const cell = { ...row.cells[col] };

        // Special handling for column C to ensure row labels work
        if (col === "c" && cell.type === "label" && cell.content) {
          // When we have a cell in column C with type "label", ensure it has a label property
          // which the renderer needs to display properly
          cell.label = cell.content;
        }

        // Remove field-specific properties that aren't needed for rendering
        delete cell.getOptions;
        delete cell.section;
        delete cell.dependencies;

        rowDef.cells.push(cell);
      } else {
        // Add empty cell if not defined
        // Special handling for column C - use row's label if column C is missing
        if (col === "c" && !row.cells?.c && row.label) {
          // If column C is missing but we have a row label, use that
          rowDef.cells.push({ label: row.label });
        } else {
          // Otherwise add empty cell
          rowDef.cells.push({});
        }
      }
    });

    return rowDef;
  }

  /**
   * ✅ PHASE 3: Retrieves a field's default value from the sectionRows definition.
   * This is the single source of truth for non-climate default values.
   * Climate data should come from ClimateValues.js, not hardcoded defaults.
   * @param {string} fieldId The ID of the field (e.g., "d_19")
   * @returns {string|null} The default value or null if not found.
   */
  function getFieldDefault(fieldId) {
    for (const row of Object.values(sectionRows)) {
      if (row.cells) {
        for (const cell of Object.values(row.cells)) {
          if (cell.fieldId === fieldId && cell.value !== undefined) {
            return cell.value;
          }
        }
      }
    }
    return null;
  }

  //==========================================================================
  // EVENT HANDLING AND CALCULATIONS
  //==========================================================================

  // All event handling and calculation functions remain unchanged

  /**
   * Helper: Get element by multiple possible selectors
   */
  function getElement(selectors) {
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  /**
   * Handle province selection change - ✅ PHASE 3: Simplified for dual-state architecture
   */
  function handleProvinceChange(e) {
    const provinceValue = e?.target?.value;
    if (!provinceValue) return;

    console.log("Section03: Province selected:", provinceValue);

    // Update state (mode-aware StateManager sync)
    setModeValue("d_19", provinceValue, "user-modified");

    // Update city dropdown for this province (UI only)
    updateCityDropdown(provinceValue);

    // Note: calculateAll() will be called by the city dropdown's auto-selection
    // If city doesn't auto-select, we would add calculateAll() here
  }

  /**
   * Update city dropdown based on selected province - Using ClimateDataService
   */
  function updateCityDropdown(provinceValue) {
    const cityDropdown = getElement(['[data-dropdown-id="dd_h_19"]']);
    if (!cityDropdown) return;

    // Clear existing options
    cityDropdown.innerHTML = '<option value="">Select City</option>';

    if (!provinceValue) {
      cityDropdown.disabled = true;
      return;
    }

    // Get cities from ClimateDataService
    const cities = ClimateDataService.getCitiesForProvince(provinceValue);

    if (cities.length === 0) {
      console.log("No cities found for province:", provinceValue);
      cityDropdown.disabled = true;
      return;
    }

    // Add city options
    cities.forEach(city => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      cityDropdown.appendChild(option);
    });

    cityDropdown.disabled = false;

    // Auto-select city from current state if it exists in this province
    const currentCity = getModeValue("h_19");
    if (currentCity && cities.includes(currentCity)) {
      cityDropdown.value = currentCity;
      setModeValue("h_19", currentCity, "init");
    } else if (provinceValue === "ON" && cities.includes("Alexandria")) {
      // Default to Alexandria for Ontario
      cityDropdown.value = "Alexandria";
      setModeValue("h_19", "Alexandria", "init");
    } else if (cities.length > 0) {
      // Default to first city
      cityDropdown.value = cities[0];
      setModeValue("h_19", cities[0], "init");
    }

    console.log(
      "City dropdown updated for",
      provinceValue,
      "- selected:",
      cityDropdown.value
    );
  }

  // updateWeatherData() removed — graph handles climate data computation

  /**
   * Determine climate zone based on HDD
   */
  function determineClimateZone(hdd) {
    // Excel Formula: =IF(D20<3000, 4, IF(D20<4000, 5, IF(D20<5000, 6, IF(D20<6000, 7.1, IF(D20<7000, 7.2, 8))))) )
    if (hdd === null || hdd === undefined || hdd === "") return "6.0"; // Default if HDD is missing

    const numericHdd = parseFloat(hdd);
    if (isNaN(numericHdd)) return "6.0"; // Default if HDD is not a number

    if (numericHdd < 3000) return "4.0";
    if (numericHdd < 4000) return "5.0";
    if (numericHdd < 5000) return "6.0";
    if (numericHdd < 6000) return "7.1"; // Corrected from 7.0
    if (numericHdd < 7000) return "7.2"; // Added missing check
    return "8.0"; // Correct: returns 8.0 only if HDD >= 7000
  }

  /**
   * Display weather data in modal - Using ClimateDataService
   */
  function showWeatherData() {
    const provinceValue =
      getModeValue("d_19") ||
      getElement(['[data-dropdown-id="dd_d_19"]'])?.value;
    const cityValue =
      getModeValue("h_19") ||
      getElement(['[data-dropdown-id="dd_h_19"]'])?.value;

    if (!provinceValue || !cityValue) {
      alert("Please select a province and city first.");
      return;
    }

    // Get city data using ClimateDataService
    const cityData = ClimateDataService.getCityData(provinceValue, cityValue);

    if (!cityData) {
      alert(`City data not found for ${cityValue}, ${provinceValue}`);
      return;
    }

    // Field mapping with meaningful names and units
    const fieldMapping = {
      // Basic Information
      Location: { name: "Location", unit: "", category: "Basic" },
      "Elev ASL (m)": {
        name: "Elevation Above Sea Level",
        unit: "m",
        category: "Basic",
      },

      // Temperature Data
      January_2_5: {
        name: "January Design Temperature (2.5%)",
        unit: "°C",
        category: "Temperature",
      },
      January_1: {
        name: "January Design Temperature (1%)",
        unit: "°C",
        category: "Temperature",
      },
      July_2_5_Tdb: {
        name: "July Dry Bulb Temperature (2.5%)",
        unit: "°C",
        category: "Temperature",
      },
      July_2_5_Twb: {
        name: "July Wet Bulb Temperature (2.5%)",
        unit: "°C",
        category: "Temperature",
      },
      Future_July_2_5_Tdb: {
        name: "Future July Dry Bulb (2021-2050)",
        unit: "°C",
        category: "Temperature",
      },
      Future_July_2_5_Twb: {
        name: "Future July Wet Bulb (2021-2050)",
        unit: "°C",
        category: "Temperature",
      },

      // Degree Days
      HDD18: {
        name: "Heating Degree Days (Base 18°C)",
        unit: "°C·days",
        category: "Degree Days",
      },
      HDD15: {
        name: "Heating Degree Days (Base 15°C)",
        unit: "°C·days",
        category: "Degree Days",
      },
      HDD18_2021_2050: {
        name: "Future HDD (2021-2050)",
        unit: "°C·days",
        category: "Degree Days",
      },
      CDD24: {
        name: "Cooling Degree Days (Base 24°C)",
        unit: "°C·days",
        category: "Degree Days",
      },
      CDD24_2021_2050: {
        name: "Future CDD (2021-2050)",
        unit: "°C·days",
        category: "Degree Days",
      },

      // Extreme Temperature
      Over_30Tdb_2021_2050: {
        name: "Days Over 30°C (2021-2050)",
        unit: "days",
        category: "Extreme",
      },
      Extreme_Hot_Tdb_1991_2020: {
        name: "Extreme Maximum Temperature",
        unit: "°C",
        category: "Extreme",
      },

      // Precipitation
      Rain_15_min_mm: {
        name: "15-Minute Rainfall",
        unit: "mm",
        category: "Precipitation",
      },
      Rain_15_min_mm_New: {
        name: "15-Minute Rainfall (Updated)",
        unit: "mm",
        category: "Precipitation",
      },
      "Rain_1_day_1/50mm": {
        name: "One Day Rainfall (1-in-50 year)",
        unit: "mm",
        category: "Precipitation",
      },
      "Rain_1_day_1/50mm_New": {
        name: "One Day Rainfall (Updated)",
        unit: "mm",
        category: "Precipitation",
      },
      Rain_Annual_mm: {
        name: "Annual Rainfall",
        unit: "mm",
        category: "Precipitation",
      },
      Rain_Annual_mm_New: {
        name: "Annual Rainfall (Updated)",
        unit: "mm",
        category: "Precipitation",
      },
      Moisture_Index_New: {
        name: "Moisture Index",
        unit: "",
        category: "Precipitation",
      },
      Precip_Annual_mm: {
        name: "Annual Total Precipitation",
        unit: "mm",
        category: "Precipitation",
      },
      Precip_Annual_mm_New: {
        name: "Annual Precipitation (Updated)",
        unit: "mm",
        category: "Precipitation",
      },

      // Wind & Snow
      "Driving_Rain_Wind_Pa_1/5": {
        name: "Driving Rain Wind Pressure (1-in-5)",
        unit: "Pa",
        category: "Wind",
      },
      "Driving_Rain_Wind_Pa_1/5_New": {
        name: "Driving Rain Wind (Updated)",
        unit: "Pa",
        category: "Wind",
      },
      "Snow_kPa_1/50_Ss": {
        name: "Snow Load (1-in-50) Ss",
        unit: "kPa",
        category: "Snow",
      },
      "Snow_kPa_1/50_Sr": {
        name: "Snow Load (1-in-50) Sr",
        unit: "kPa",
        category: "Snow",
      },
      "Snow_kPa_1/1000_Ss": {
        name: "Snow Load (1-in-1000) Ss",
        unit: "kPa",
        category: "Snow",
      },
      "Snow_kPa_1/1000_Sr": {
        name: "Snow Load (1-in-1000) Sr",
        unit: "kPa",
        category: "Snow",
      },
      "Wind_Hourly_kPa_1/10": {
        name: "Hourly Wind Pressure (1-in-10)",
        unit: "kPa",
        category: "Wind",
      },
      "Wind_Hourly_kPa_1/10_New": {
        name: "Hourly Wind (Updated)",
        unit: "kPa",
        category: "Wind",
      },
      "Wind_Hourly_kPa_1/50": {
        name: "Hourly Wind Pressure (1-in-50)",
        unit: "kPa",
        category: "Wind",
      },
      "Wind_Hourly_kPa_1/50_New": {
        name: "Hourly Wind (1-in-50 Updated)",
        unit: "kPa",
        category: "Wind",
      },
      "Wind_Hourly_kPa_1/500_New": {
        name: "Hourly Wind (1-in-500)",
        unit: "kPa",
        category: "Wind",
      },

      // Seasonal Averages
      Winter_Tdb_Avg: {
        name: "Winter Average Temperature",
        unit: "°C",
        category: "Seasonal",
      },
      Winter_Windspeed_Avg: {
        name: "Winter Average Wind Speed",
        unit: "m/s",
        category: "Seasonal",
      },
      Summer_Tdb_Avg: {
        name: "Summer Average Temperature",
        unit: "°C",
        category: "Seasonal",
      },
      Summer_Twb_Avg: {
        name: "Summer Average Wet Bulb",
        unit: "°C",
        category: "Seasonal",
      },
      Summer_RH_1500_LST: {
        name: "Summer RH at 15:00",
        unit: "%",
        category: "Seasonal",
      },
    };

    // Set modal title and content
    const modalTitle = document.getElementById("weatherDataModalLabel");
    const modalContent = document.getElementById("weatherDataContent");

    if (modalTitle) {
      modalTitle.textContent = `Weather Data for ${cityValue}, ${ClimateDataService.getProvinceFullName(provinceValue)}`;
    }

    if (modalContent) {
      // Group data by category
      const categorizedData = {};
      Object.entries(cityData).forEach(([key, value]) => {
        const mapping = fieldMapping[key];
        if (mapping) {
          if (!categorizedData[mapping.category]) {
            categorizedData[mapping.category] = [];
          }
          categorizedData[mapping.category].push({ key, value, mapping });
        }
      });

      // Format the climate data with categories
      let formattedData = "";
      const categoryOrder = [
        "Basic",
        "Temperature",
        "Degree Days",
        "Extreme",
        "Precipitation",
        "Wind",
        "Snow",
        "Seasonal",
      ];

      categoryOrder.forEach(category => {
        if (categorizedData[category] && categorizedData[category].length > 0) {
          formattedData += `<div style="margin-top: 16px; margin-bottom: 8px; font-weight: bold; color: #0066cc; border-bottom: 2px solid #0066cc;">${category}</div>`;

          categorizedData[category].forEach(({ key, value, mapping }) => {
            // Skip null values or 666 markers
            if (value === null || value === 666) {
              return;
            }

            const displayValue = mapping.unit
              ? `${value} ${mapping.unit}`
              : value;
            formattedData += `<div style="display: flex; padding: 6px 0; border-bottom: 1px solid #f0f0f0;">
              <div style="flex: 1.5; font-weight: 400; color: #333;">${mapping.name}</div>
              <div style="flex: 1; text-align: right; color: #666;">${displayValue}</div>
            </div>`;
          });
        }
      });

      modalContent.innerHTML = formattedData;
    }

    // Show modal
    const modal = document.getElementById("weatherDataModal");
    if (modal) new bootstrap.Modal(modal).show();
  }


  /**
   * Creates and injects the Weather Data button into the section header.
   * Note: Toggle/Reset controls removed - global toggle in index.html controls mode switching.
   */
  function injectHeaderControls() {
    const sectionHeader = document.querySelector(
      "#climateCalculations .section-header"
    );
    if (
      !sectionHeader ||
      sectionHeader.querySelector(".local-controls-container")
    ) {
      return; // Already setup or header not found
    }

    const controlsContainer = document.createElement("div");
    controlsContainer.className = "local-controls-container";
    controlsContainer.style.cssText =
      "display: flex; align-items: center; margin-left: auto; gap: 10px;";

    // --- Create Weather Data Button ---
    const weatherButton = document.createElement("button");
    weatherButton.textContent = "Weather Data";
    weatherButton.id = "s03WeatherDataBtn";
    weatherButton.title = "Show detailed weather data for current city";
    weatherButton.style.cssText =
      "padding: 4px 8px; font-size: 0.8em; background-color: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer;";

    weatherButton.addEventListener("click", function (event) {
      event.stopPropagation(); // Prevent header collapse
      showWeatherData();
    });

    // Append Weather Data button to container, then container to header
    controlsContainer.appendChild(weatherButton);
    sectionHeader.appendChild(controlsContainer);

    console.log("S03: Weather Data button setup complete");
  }

  /**
   * Initialize all event handlers
   */
  function initializeEventHandlers() {
    // Province dropdown change
    const provinceDropdown = getElement(['[data-dropdown-id="dd_d_19"]']);
    if (provinceDropdown) {
      // Remove any existing listeners
      const newProvinceDropdown = provinceDropdown.cloneNode(true);
      provinceDropdown.parentNode.replaceChild(
        newProvinceDropdown,
        provinceDropdown
      );

      // Add new listener
      newProvinceDropdown.addEventListener("change", handleProvinceChange);
    }

    // City dropdown change
    const cityDropdown = getElement(['[data-dropdown-id="dd_h_19"]']);
    if (cityDropdown) {
      // Remove any existing listeners
      const newCityDropdown = cityDropdown.cloneNode(true);
      cityDropdown.parentNode.replaceChild(newCityDropdown, cityDropdown);

      // Add new listener - ✅ PHASE 3: Simplified to match h_21 working pattern
      newCityDropdown.addEventListener("change", function () {
        const selectedCity = this.value;
        console.log("Section03: City selected:", selectedCity);
        setModeValue("h_19", selectedCity, "user-modified");
      });
    }

    // Present/Future timeframe dropdown
    const timeframeDropdown = getElement(['[data-dropdown-id="dd_h_20"]']);
    if (timeframeDropdown) {
      // Remove any existing listeners
      const newTimeframeDropdown = timeframeDropdown.cloneNode(true);
      timeframeDropdown.parentNode.replaceChild(
        newTimeframeDropdown,
        timeframeDropdown
      );

      // Add new listener - ✅ PHASE 3: Simplified to match h_21 working pattern
      newTimeframeDropdown.addEventListener("change", function () {
        const selectedTimeframe = this.value;
        console.log("S03: Timeframe selected:", selectedTimeframe);
        setModeValue("h_20", selectedTimeframe, "user-modified");
      });
    }

    // ✅ CRITICAL: Capacitance dropdown (h_21) - AFFECTS GFCDD CALCULATION
    const capacitanceDropdown = getElement(['[data-dropdown-id="dd_h_21"]']);
    if (capacitanceDropdown) {
      // Remove any existing listeners
      const newCapacitanceDropdown = capacitanceDropdown.cloneNode(true);
      capacitanceDropdown.parentNode.replaceChild(
        newCapacitanceDropdown,
        capacitanceDropdown
      );

      // Add new listener
      newCapacitanceDropdown.addEventListener("change", function () {
        const selectedCapacitance = this.value;
        console.log("S03: Capacitance setting changed:", selectedCapacitance);
        setModeValue("h_21", selectedCapacitance, "user");

        // If "Static" is chosen, force the percentage to 0
        if (selectedCapacitance === "Static") {
          setModeValue("i_21", "0", "system");
        }
      });
    }

    // G.4.4 BASESIMP configuration
    ["l_25"].forEach(fieldId => {
      const dropdown = getElement([`[data-dropdown-id="dd_${fieldId}"]`]);
      if (!dropdown) return;
      const fresh = dropdown.cloneNode(true);
      dropdown.parentNode.replaceChild(fresh, dropdown);
      fresh.addEventListener("change", function () {
        setModeValue(fieldId, this.value, "user-modified");
        updateGroundUI();
      });
    });
    updateGroundUI();

    // Weather data buttons
    ["showWeatherDataBtn", "weatherDataBtn"].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.removeEventListener("click", showWeatherData);
        btn.addEventListener("click", showWeatherData);
      }
    });

    // Add handlers for ALL editable fields in this section (e.g., m_19, l_24)
    const sectionElement = document.getElementById("climateCalculations");
    if (sectionElement) {
      const editableFields = sectionElement.querySelectorAll(
        ".editable.user-input"
      );
      editableFields.forEach(field => {
        if (!field.hasEditableListeners) {
          // Add a flag to prevent duplicate listeners
          field.setAttribute("contenteditable", "true");
          field.addEventListener("blur", handleEditableBlur); // Use the general blur handler
          // Add the general keydown handler to prevent Enter newlines
          field.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              this.blur();
            }
          });
          field.hasEditableListeners = true; // Set the flag
        }
      });
    }

    // ✅ INITIALIZE SLIDERS VIA FIELDMANAGER (Standard Architecture)
    if (window.TEUI?.FieldManager?.initializeSliders) {
      window.TEUI.FieldManager.initializeSliders("climateCalculations");
      console.log("S03: Sliders initialized via FieldManager");
    } else {
      console.warn("S03: FieldManager.initializeSliders not available");
    }

    // Graph handles cross-section computation via wildcard listener.
    // No per-section StateManager listeners needed.
  }

  /**
   * Handle blur events on editable fields
   */
  function handleEditableBlur(event) {
    const fieldId = this.getAttribute("data-field-id");
    if (!fieldId) return;

    const newValue = this.textContent.trim();
    const numericValue = window.TEUI.parseNumeric(newValue, NaN); // Try parsing

    if (!isNaN(numericValue)) {
      // Format display for valid numbers
      const formatType = Number.isInteger(numericValue)
        ? "integer"
        : "number-2dp"; // Default format
      this.textContent = window.TEUI.formatNumber(numericValue, formatType);

      // MODE-AWARE: Update StateManager
      setModeValue(fieldId, numericValue.toString(), "user-modified");
    } else if (newValue === "" && fieldId === "d_21") {
      // CDD cleared: remove user override, fall back to climate data lookup
      setModeValue(fieldId, "", "user-modified");
    } else {
      // Revert to previous value if input is invalid
      const previousValue = getModeValue(fieldId) || "0";
      const prevNumericValue = window.TEUI.parseNumeric(previousValue, 0);
      const formatType = Number.isInteger(prevNumericValue)
        ? "integer"
        : "number-2dp";
      this.textContent = window.TEUI.formatNumber(prevNumericValue, formatType);
      console.warn(
        `Invalid input for ${fieldId}: ${newValue}. Reverted to ${this.textContent}.`
      );
    }
  }

  /**
   * Populate province dropdown using ClimateDataService
   */
  function populateProvinceDropdown() {
    const provinceSelect = getElement(['[data-dropdown-id="dd_d_19"]']);
    if (!provinceSelect) return;

    // Clear existing options except the first one
    while (provinceSelect.options.length > 1) {
      provinceSelect.remove(1);
    }

    const provinces = ClimateDataService.getProvinces();
    provinces.forEach(province => {
      const option = document.createElement("option");
      option.value = province;
      option.textContent = ClimateDataService.getProvinceFullName(province);
      provinceSelect.appendChild(option);
    });

    // console.log("S03: Populated province dropdown with options:", provinces);

    // Set default province from current state
    const defaultProvince = getModeValue("d_19") || "ON";
    provinceSelect.value = defaultProvince;

    if (provinceSelect.value) {
      setModeValue("d_19", provinceSelect.value, "init");

      // Sync dd_d_19 for cross-section communication
      if (window.TEUI?.StateManager) {
        window.TEUI.StateManager.setValue(
          "dd_d_19",
          provinceSelect.value,
          "default"
        );
        console.log(
          `S03: Synced province "${provinceSelect.value}" to StateManager for cross-section communication`
        );
      }

      // Trigger city dropdown update
      updateCityDropdown(provinceSelect.value);
    }
  }

  /**
   * Called when section is rendered - Enhanced for DualState
   */
  function onSectionRendered() {
    console.log(
      "S03: Section rendered - initializing Self-Contained State Module."
    );

    // 1. Setup the section-specific toggle switch in the header
    injectHeaderControls();

    // 2. Ensure ClimateData is available before proceeding
    ClimateDataService.ensureAvailable(function () {
      // console.log("S03: ClimateData available - initializing dropdowns");

      // Populate province dropdown
      populateProvinceDropdown();

      // Set up event handlers
      initializeEventHandlers();

      // Apply validation tooltips to fields
      if (
        window.TEUI.TooltipManager &&
        window.TEUI.TooltipManager.initialized
      ) {
        setTimeout(() => {
          window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
        }, 300);
      }

      console.log("S03: Self-Contained State Module initialization complete");
    });
  }

  /**
   * Sync province/city dropdowns after CSV/Excel import.
   * Import sets d_19/h_19 in StateManager but doesn't repopulate dropdown options.
   * Called from FileHandler.syncPostImportUI() after import.
   */
  function syncLocationDropdowns() {
    const SM = window.TEUI?.StateManager;
    if (!SM) return;

    const province = SM.getValue("d_19");
    const city = SM.getValue("h_19");
    if (!province) return;

    // Sync to StateManager
    setModeValue("d_19", province, "init");
    if (city) setModeValue("h_19", city, "init");

    // Set province dropdown value
    const provinceDropdown = getElement(['[data-dropdown-id="dd_d_19"]']);
    if (provinceDropdown) {
      provinceDropdown.value = province;
    }

    // Repopulate city dropdown for the imported province
    updateCityDropdown(province);

    // Override auto-selected city with imported city value
    if (city) {
      const cityDropdown = getElement(['[data-dropdown-id="dd_h_19"]']);
      if (cityDropdown) {
        cityDropdown.value = city;
      }
      setModeValue("h_19", city, "init");
    }

    console.log(`S03: Location dropdowns synced - ${province}/${city}`);
  }

  /**
   * G.4.4-G.4.10 for the current model: the dropdown shows the stored choice. BASESIMP's inputs are never
   * greyed: shown only under F280 Mode (S21), where they drive F280's sizing and, On, the annual figures
   * (Andy 2026-11-19). When
   * BASESIMP cannot run, G.4.10 says why (the node's error) on hover.
   */
  function updateGroundUI() {
    const config = String(getModeValue("l_25") || "1");
    const configSelect = getElement(['[data-dropdown-id="dd_l_25"]']);
    if (configSelect && configSelect.value !== config) configSelect.value = config;

    // G.4.5 does not apply to a slab on grade: BASESIMP's slab method takes its own 0.05 m
    // (TransmissionLossNodes basesimpFor), so the depth is ghosted rather than shown as if read
    const known = !!window.TEUI.BasesimpData?.configs?.[Number(config)];
    window.TEUI.DOMBridge?.ghostField("d_26", known && window.TEUI.Basesimp.isSlab(Number(config)));

    const cell = document.querySelector('td[data-field-id="l_26b"]');
    const state = window.TEUI.ComputationIntegration?.getState?.();
    if (cell && state) {
      const r = state.getValueForModel(state.getActiveModelId(), "ground.basesimp");
      cell.title = r?.error
        ? `BASESIMP cannot run: ${r.error}`
        : r?.configuration
          ? `${r.configuration}; ${r.geometry.length.toFixed(2)} x ${r.geometry.width.toFixed(2)} m, ` +
            `height ${r.geometry.height.toFixed(2)} m; F280 weather: ${r.weather.city}`
          : "";
    }
  }

  //==========================================================================
  // PART 5: PUBLIC API - Enhanced with DualState
  //==========================================================================

  return {
    // Field definitions and layout
    getFields: getFields,
    getDropdownOptions: getDropdownOptions,
    getLayout: getLayout,

    // Event handling and initialization
    initializeEventHandlers: initializeEventHandlers,
    onSectionRendered: onSectionRendered,
    postStamp: updateGroundUI,

    // Utility functions
    showWeatherData: showWeatherData,
    syncLocationDropdowns: syncLocationDropdowns,

  };
})();
