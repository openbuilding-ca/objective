// Excel mapper for TEUI Calculator - Need to update for DOM-based Field-Name-Mappings
// Maps between Excel file structure and the calculator's data model updated 2025.10.19

// Script Block 1: Core Configuration and Initial Data Structure
const CONFIG = {
  // System Value Limits and Defaults
  EMISSIONS: {
    GAS_INTENSITY: 1921, // gCO2e/m3
    GAS_ENERGY_DENSITY: 10.36, // ekWh/m3
    DEFAULT_GAS_COST: 0.507, // $/m3 Ontario average
    DEFAULT_ELECTRICITY_COST: 0.13, // $/kWh Ontario average
  },
  // Excel cell mapping configuration (added REFERENCE)
  EXCEL_MAPPING: {
    SHEETS: {
      ENERGY_BALANCE: "ENERGY BALANCE",
      REPORT: "REPORT",
      NBC2025C2: "NBC-2025-C2",
      REFERENCE: "REFERENCE",
    },
    // Placeholder for the old/combined mapping structure
    // We will define a specific mapping for Report sheet import later
    NODE_VALUES: {
      // Example mappings from previous structure (to be replaced/refined)
      "e-6": "REPORT!E6", // Adjusted sheet assumption
      "T.1_target": "REPORT!C5",
      "T.1_actual": "REPORT!D5",
      // ... other mappings ... (deleted climate mappings as this is internal now)
    },
  },
};

// Placeholder for the old mapping (referenced by existing code) - will be deprecated
const excelMapping = CONFIG.EXCEL_MAPPING.NODE_VALUES || {};

class ExcelMapper {
  constructor() {
    this.mapping = excelMapping; // Keep old mapping for now if needed by existing export
    // Define the NEW specific mapping for user input import
    this.excelReportInputMapping = {
      // Section 02: Building Information (REPORT! Sheet)
      D12: "d_12", // Major Occupancy (Dropdown)
      D13: "d_13", // Reference Standard (Dropdown)
      D14: "d_14", // Actual/Target Use (Dropdown)
      D15: "d_15", // Carbon Standard (Dropdown)
      H12: "h_12", // Reporting Period (Slider -> Number)
      H13: "h_13", // Service Life (Slider -> Number)
      H14: "h_14", // Project Name (Editable Text)
      H15: "h_15", // Conditioned Area (Editable Number)
      H16: "i_16", // Certifier (Editable Text) - Assumed H16
      H17: "i_17", // License No (Editable Text) - Assumed H17
      L12: "l_12", // Elec Cost
      L13: "l_13", // Gas Cost
      L14: "l_14", // Propane Cost
      L15: "l_15", // Wood Cost
      L16: "l_16", // Oil Cost

      // Section 03: Climate Calculations (REPORT! Sheet)
      D19: "d_19", // Province (Dropdown)
      H19: "h_19", // City (Dropdown)
      H20: "h_20", // Present/Future Weather Toggle (Dropdown)
      H21: "h_21", // Capacitance/Static Toggle (Dropdown)
      I21: "i_21", // Capacitance Slider Position (Number)
      M19: "m_19", // Days Cooling (Editable Number)
      L20: "l_20", // Cooling Season Average overnight Temp ºC (Editable Number) FUTURE FEATURE
      L21: "l_21", // Cooling Season Average LST15h00 RH% (Editable Number) FUTURE FEATURE

      // Section 04: Actual vs Target Energy (REPORT! Sheet)
      D27: "d_27", // Actual Elec Use
      D28: "d_28", // Actual Gas Use
      D29: "d_29", // Actual Propane Use
      D30: "d_30", // Actual Oil Use
      D31: "d_31", // Actual Wood Use
      L27: "l_27", // Elec Emission Factor
      L28: "l_28", // Gas Emission Factor
      L29: "l_29", // Propane Emission Factor
      L30: "l_30", // Oil Emission Factor
      L31: "l_31", // Wood Emission Factor
      H35: "h_35", // PER Factor (Editable Number)

      // Section 05: Emissions (REPORT! Sheet)
      D39: "d_39", // Construction Type (Dropdown) - NEWLY ADDED
      // 'D60': 'd_60', // Offsets (tCO2e) - REMOVED, d_60 is now calculated in S05 based on wood use
      I41: "i_41", // Modelled Embodied Carbon (A1-3)

      // Section 06: Renewable Energy (REPORT! Sheet)
      D44: "d_44", // Photovoltaics kWh/yr
      D45: "d_45", // Wind kWh/yr
      D46: "d_46", // Remove EV Charging kWh/yr
      I45: "i_44", // WWS Electricity kWh/yr
      K45: "k_45", // Green Natural Gas m3/yr
      I46: "i_46", // Other Removals kWh/yr
      M43: "m_43", // P.5 Exterior/Site/Other Loads (kWh) - ADDED

      // Section 07: Water Use (REPORT! Sheet)
      D49: "d_49", // Water Use Method (Dropdown)
      E49: "e_49", // User Defined Water Use l/pp/day (Only used if d_49 is User Defined) BUG: f_49 not reading e_49!
      E50: "e_50", // By Engineer DHW kWh/yr (Now correctly maps to e_50 which is the new input field)
      D51: "d_51", // DHW System Type (Dropdown)
      D52: "d_52", // DHW EF/COP (Slider)
      D53: "d_53", // DHW Recovery Eff % (Slider)
      K52: "k_52", // SHW AFUE (Editable Number)

      // Section 08: Indoor Air Quality (REPORT! Sheet)
      D56: "d_56", // Radon Bq/m3
      D57: "d_57", // CO2 ppm
      D58: "d_58", // TVOC ppm
      D59: "d_59", // Indoor Heating Season RH % (Slider)
      I59: "i_59", // Indoor Cooling Season RH % (Slider) used in Cooling.js

      // Section 09: Occupant Internal Gains (REPORT! Sheet)
      D63: "d_63", // Occupants
      G63: "g_63", // Occupied Hrs/Day (Dropdown) - ADDED (Was I63 -> i_63, assumed G63 for g_63)
      // 'I63': 'i_63', // Occupied Hrs/Day (If this is different or still needed, clarify) - TO BE DELETED (derived from g_63)
      // 'J63': 'j_63', // Total Hrs/Year - This line should be commented out or removed.
      D64: "d_64", // Occupant Activity (Dropdown)
      //D65: "d_65", // Plug Loads W/m2 (derived from occupancy, not editable)
      D66: "d_66", // Lighting Loads W/m2
      //D67: "d_67", // Equipment Loads W/m2 (derived from occupancy, not editable)
      D68: "d_68", // Elevator Loads (Dropdown)
      G67: "g_67", // Equipment Spec (Dropdown)

      // Section 10: Radiant Gains (REPORT! Sheet)
      D73: "d_73", // Door Area
      D74: "d_74", // Window Area North
      D75: "d_75", // Window Area East
      D76: "d_76", // Window Area South
      D77: "d_77", // Window Area West
      D78: "d_78", // Skylights Area
      E73: "e_73",
      E74: "e_74",
      E75: "e_75",
      E76: "e_76",
      E77: "e_77",
      E78: "e_78", // Orientations (Dropdowns)
      F73: "f_73",
      F74: "f_74",
      F75: "f_75",
      F76: "f_76",
      F77: "f_77",
      F78: "f_78", // SHGCs (Editable Numbers)
      G73: "g_73",
      G74: "g_74",
      G75: "g_75",
      G76: "g_76",
      G77: "g_77",
      G78: "g_78", // Winter Shading % (Editable Numbers)
      H73: "h_73",
      H74: "h_74",
      H75: "h_75",
      H76: "h_76",
      H77: "h_77",
      H78: "h_78", // Summer Shading % (Editable Numbers)
      D80: "d_80", // Gains Utilisation Method (Dropdown)

      // Section 11: Transmission Losses (REPORT! Sheet)
      D85: "d_85",
      F85: "f_85", // Roof Area, RSI
      D86: "d_86",
      F86: "f_86", // Walls AG Area, RSI
      D87: "d_87",
      F87: "f_87", // Floor Exp Area, RSI
      G88: "g_88",
      G89: "g_89",
      G90: "g_90",
      G91: "g_91",
      G92: "g_92",
      G93: "g_93", // Window/Door/Skylight U-values
      D94: "d_94",
      F94: "f_94", // Walls BG Area, RSI
      D95: "d_95",
      F95: "f_95", // Floor Slab Area, RSI
      D96: "d_96", // Interior Floor Area
      D97: "d_97", // Thermal Bridge Penalty %

      // Section 12: Volume Metrics (REPORT! Sheet)
      D103: "d_103", // Stories
      G103: "g_103", // Shielding (Dropdown)
      D105: "d_105", // Total Conditioned Volume
      D108: "d_108", // NRL50 Target Method (Dropdown)
      G109: "g_109", // Measured ACH50 (Editable Number)

      // Section 13: Mechanical Loads (REPORT! Sheet)
      D113: "d_113", // Primary Heating System (Dropdown)
      F113: "f_113", // HSPF (Slider/Coefficient -> Number)
      J115: "j_115", // AFUE (Editable Number)
      D116: "d_116", // Cooling System (Dropdown)
      D118: "d_118", // HRV/ERV SRE % (Percentage Slider -> Number 0-100)
      H118: "g_118", // Ventilation Method (Dropdown)
      L118: "l_118", // ACH (Editable Number)
      D119: "d_119", // Rate Per Person (Editable Number)
      L119: "l_119", // Summer Boost (Dropdown)
      K120: "k_120", // Unoccupied Setback % (Percentage Dropdown/Slider) - NOTE: Stores value like "0.9"

      // Section 15: TEUI Summary (REPORT! Sheet)
      D142: "d_142", // Cost Premium HP (Editable Number)
    };

    // REFERENCE sheet mapping - mirrors REPORT mapping structure
    // Uses same Excel cell references but maps to ref_ prefixed field IDs
    this.excelReferenceInputMapping = {
      // Section 02: Building Information (REFERENCE! Sheet)
      D12: "ref_d_12",
      D13: "ref_d_13",
      D14: "ref_d_14",
      D15: "ref_d_15",
      H12: "ref_h_12",
      H13: "ref_h_13",
      H14: "ref_h_14",
      H15: "ref_h_15",
      H16: "ref_i_16",
      H17: "ref_i_17",
      L12: "ref_l_12",
      L13: "ref_l_13",
      L14: "ref_l_14",
      L15: "ref_l_15",
      L16: "ref_l_16",

      // Section 03: Climate Calculations (REFERENCE! Sheet)
      D19: "ref_d_19",
      H19: "ref_h_19",
      H20: "ref_h_20",
      H21: "ref_h_21",
      I21: "ref_i_21",
      M19: "ref_m_19",
      L20: "ref_l_20", // Cooling Season Average overnight Temp ºC (Editable Number) FUTURE FEATURE
      L21: "ref_l_21", // Cooling Season Average LST15h00 RH% (Editable Number) FUTURE FEATURE

      // Section 04: Actual vs Target Energy (REFERENCE! Sheet)
      D27: "ref_d_27",
      D28: "ref_d_28",
      D29: "ref_d_29",
      D30: "ref_d_30",
      D31: "ref_d_31",
      L27: "ref_l_27",
      L28: "ref_l_28",
      L29: "ref_l_29",
      L30: "ref_l_30",
      L31: "ref_l_31",
      H35: "ref_h_35",

      // Section 05: Emissions (REFERENCE! Sheet)
      D39: "ref_d_39",
      I41: "ref_i_41",

      // Section 06: Renewable Energy (REFERENCE! Sheet)
      D44: "ref_d_44",
      D45: "ref_d_45",
      D46: "ref_d_46",
      //I45: "ref_i_45", Calculated field, not user input
      K45: "ref_k_45", // Green Natural Gas m3/yr
      I46: "ref_i_46",
      M43: "ref_m_43",

      // Section 07: Water Use (REFERENCE! Sheet)
      D49: "ref_d_49",
      E49: "ref_e_49", //BUG: ref_f_49 not calculaing =ref_e_49!
      E50: "ref_e_50",
      D51: "ref_d_51",
      D52: "ref_d_52",
      D53: "ref_d_53",
      K52: "ref_k_52",

      // Section 08: Indoor Air Quality (REFERENCE! Sheet)
      D56: "ref_d_56",
      D57: "ref_d_57",
      D58: "ref_d_58",
      D59: "ref_d_59",

      // Section 09: Occupant Internal Gains (REFERENCE! Sheet)
      D63: "ref_d_63",
      G63: "ref_g_63",
      D64: "ref_d_64",
      //D65: "ref_d_65",
      D66: "ref_d_66",
      //D67: "ref_d_67",
      D68: "ref_d_68",
      G67: "ref_g_67",

      // Section 10: Radiant Gains (REFERENCE! Sheet)
      D73: "ref_d_73",
      D74: "ref_d_74",
      D75: "ref_d_75",
      D76: "ref_d_76",
      D77: "ref_d_77",
      D78: "ref_d_78",
      E73: "ref_e_73",
      E74: "ref_e_74",
      E75: "ref_e_75",
      E76: "ref_e_76",
      E77: "ref_e_77",
      E78: "ref_e_78",
      F73: "ref_f_73",
      F74: "ref_f_74",
      F75: "ref_f_75",
      F76: "ref_f_76",
      F77: "ref_f_77",
      F78: "ref_f_78",
      G73: "ref_g_73",
      G74: "ref_g_74",
      G75: "ref_g_75",
      G76: "ref_g_76",
      G77: "ref_g_77",
      G78: "ref_g_78",
      H73: "ref_h_73",
      H74: "ref_h_74",
      H75: "ref_h_75",
      H76: "ref_h_76",
      H77: "ref_h_77",
      H78: "ref_h_78",
      D80: "ref_d_80",

      // Section 11: Transmission Losses (REFERENCE! Sheet)
      D85: "ref_d_85",
      F85: "ref_f_85",
      D86: "ref_d_86",
      F86: "ref_f_86",
      D87: "ref_d_87",
      F87: "ref_f_87",
      G88: "ref_g_88",
      G89: "ref_g_89",
      G90: "ref_g_90",
      G91: "ref_g_91",
      G92: "ref_g_92",
      G93: "ref_g_93",
      D94: "ref_d_94",
      F94: "ref_f_94",
      D95: "ref_d_95",
      F95: "ref_f_95",
      D96: "ref_d_96",
      D97: "ref_d_97",

      // Section 12: Volume Metrics (REFERENCE! Sheet)
      D103: "ref_d_103",
      G103: "ref_g_103",
      D105: "ref_d_105",
      D108: "ref_d_108",
      G109: "ref_g_109",

      // Section 13: Mechanical Loads (REFERENCE! Sheet)
      D113: "ref_d_113",
      F113: "ref_f_113",
      J115: "ref_j_115",
      D116: "ref_d_116",
      D118: "ref_d_118",
      H118: "ref_g_118",
      L118: "ref_l_118",
      D119: "ref_d_119",
      L119: "ref_l_119",
      K120: "ref_k_120",

      // Section 15: TEUI Summary (REFERENCE! Sheet)
      D142: "ref_d_142",
    };
  }

  /**
   * NEW function specifically for importing user data from REPORT sheet.
   */
  mapExcelToReportModel(workbook) {
    const importedData = {};
    const sheetName = CONFIG.EXCEL_MAPPING.SHEETS.REPORT;
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      console.error(`Sheet named '${sheetName}' not found in the workbook.`);
      console.log("🔍 Available sheets:", workbook.SheetNames);
      return null; // Indicate error
    }

    // 🔍 DEBUG: Check what's actually in the location cells
    console.log("🔍 [ExcelMapper] Reading REPORT sheet location cells:");
    console.log("  D19 cell object:", worksheet["D19"]);
    console.log("  H19 cell object:", worksheet["H19"]);
    if (worksheet["D19"])
      console.log("  D19 value:", this.extractCellValue(worksheet["D19"]));
    if (worksheet["H19"])
      console.log("  H19 value:", this.extractCellValue(worksheet["H19"]));

    Object.entries(this.excelReportInputMapping).forEach(
      ([cellRef, fieldId]) => {
        // Construct the full cell reference with the sheet name for clarity if needed
        // const fullCellRef = `${sheetName}!${cellRef}`;
        const cell = worksheet[cellRef]; // Directly access using cell ref on the correct sheet
        if (cell !== undefined) {
          let extractedValue = this.extractCellValue(cell);
          // Normalize d_12 (Major Occupancy) values from Excel to match JS option values
          if (fieldId === "d_12" && typeof extractedValue === "string") {
            if (extractedValue === "A - Assembly")
              extractedValue = "A-Assembly";
            else if (extractedValue === "B1 - Detention")
              extractedValue = "B1-Detention";
            // B2 - Care and Treatment already matches B2-Care and Treatment if we normalize hyphens generally
            // B3 - Detention, Care and Treatment -> B3-Detention Care & Treatment
            else if (extractedValue === "B3 - Detention, Care and Treatment")
              extractedValue = "B3-Detention Care & Treatment";
            // General hyphen and potential comma normalization for robustness, applied after specific cases
            // This handles "B2 - Care and Treatment" -> "B2-Care and Treatment"
            // And would also catch the B3 case if the specific check above was not present
            extractedValue = extractedValue.replace(/\s+-\s+/g, "-"); // Replace space-hyphen-space with hyphen
            if (extractedValue.startsWith("B3-")) {
              extractedValue = extractedValue.replace(/,\s+/g, " "); // Remove comma after Detention for B3 case
            }
          }
          // Normalize d_108 (NRL50 Target Method) values from Excel
          if (fieldId === "d_108" && typeof extractedValue === "string") {
            if (extractedValue === "Measured") extractedValue = "MEASURED";
            else if (extractedValue === "PH Classic")
              extractedValue = "PH_CLASSIC";
            else if (extractedValue === "PH Low") extractedValue = "PH_LOW";
            else if (extractedValue === "PH+") extractedValue = "PH_PLUS";
            // AL-* values already match
          }
          // Normalize d_59 (RH%) value from Excel
          if (fieldId === "d_59") {
            if (
              typeof extractedValue === "number" &&
              extractedValue >= 0 &&
              extractedValue <= 1
            ) {
              // If Excel stores 45% as 0.45
              extractedValue = (extractedValue * 100).toString();
            } else if (
              typeof extractedValue === "string" &&
              extractedValue.endsWith("%")
            ) {
              // If Excel stores "45%"
              extractedValue = parseFloat(
                extractedValue.replace("%", ""),
              ).toString();
            } else if (typeof extractedValue === "number") {
              // If Excel stores just the number 45 for 45%
              extractedValue = extractedValue.toString();
            }
            // Ensure it's a string for consistency, defaulting to "0" if parsing failed
            if (isNaN(parseFloat(extractedValue))) {
              extractedValue = "0";
            }
          }
          // Normalize d_53 (DHW Recovery Eff %) value from Excel
          if (fieldId === "d_53") {
            let numVal;
            if (typeof extractedValue === "string") {
              if (extractedValue.endsWith("%")) {
                numVal = parseFloat(extractedValue.replace("%", ""));
              } else {
                numVal = parseFloat(extractedValue);
              }
            } else if (typeof extractedValue === "number") {
              numVal = extractedValue;
            }

            if (!isNaN(numVal)) {
              // If numVal is a decimal (e.g., 0.50 for 50%), convert to whole percentage.
              // Heuristic: if it's <= 1 (and non-negative), assume it's a decimal factor.
              if (numVal >= 0 && numVal <= 1) {
                extractedValue = Math.round(numVal * 100).toString();
              } else {
                // Otherwise, assume it's already a whole percentage (e.g., 50)
                extractedValue = Math.round(numVal).toString();
              }
            } else {
              extractedValue = "0"; // Default if parsing failed
            }
          }
          // Normalize d_52 (DHW Eff Factor %) value from Excel
          if (fieldId === "d_52") {
            let numVal;
            if (typeof extractedValue === "string") {
              if (extractedValue.endsWith("%")) {
                numVal = parseFloat(extractedValue.replace("%", ""));
              } else {
                numVal = parseFloat(extractedValue);
              }
            } else if (typeof extractedValue === "number") {
              numVal = extractedValue;
            }

            if (!isNaN(numVal)) {
              // If Excel provides a factor/COP (e.g., 0.8, 2.5, 3.0), convert to percentage for the slider (50-400 range)
              // Heuristic: if value is small (e.g., <= 10, as COP 10 = 1000%), assume it's a factor.
              if (numVal <= 10) {
                // Assuming factors/COPs are generally <= 10 (i.e., up to 1000%)
                extractedValue = (numVal * 100).toString();
              } else {
                // Assume it's already a percentage (e.g., 80 for 80%, 300 for 300%)
                extractedValue = numVal.toString();
              }
            } else {
              extractedValue = "0"; // Default if parsing failed
            }
          }
          // Normalize d_39 (Construction Type) from Excel variations
          if (fieldId === "d_39" && typeof extractedValue === "string") {
            const val = extractedValue.trim().toLowerCase();
            if (
              val.includes("pt.9") &&
              val.includes("res") &&
              val.includes("stick")
            ) {
              extractedValue = "Pt.9 Res. Stick Frame";
            } else if (
              val.includes("pt.9") &&
              val.includes("small") &&
              val.includes("mass timber")
            ) {
              extractedValue = "Pt.9 Small Mass Timber";
            } else if (val.includes("pt.3") && val.includes("mass timber")) {
              extractedValue = "Pt.3 Mass Timber";
            } else if (val.includes("pt.3") && val.includes("concrete")) {
              extractedValue = "Pt.3 Concrete";
            } else if (val.includes("pt.3") && val.includes("steel")) {
              extractedValue = "Pt.3 Steel";
            } else if (val.includes("pt.3") && val.includes("office")) {
              extractedValue = "Pt.3 Office";
            } else if (val.includes("modelled") || val.includes("modeled")) {
              // Allow for spelling variation
              extractedValue = "Modelled Value";
            }
            // Add more specific normalizations if needed based on common Excel inputs
          }
          // Normalize g_67 (Equipment Spec) from "Low Energy" to "Efficient"
          if (
            fieldId === "g_67" &&
            typeof extractedValue === "string" &&
            extractedValue.trim().toLowerCase() === "low energy"
          ) {
            extractedValue = "Efficient";
          }
          // Normalize d_118 (HRV/ERV SRE %) value from Excel
          if (fieldId === "d_118") {
            let numVal;
            if (typeof extractedValue === "string") {
              if (extractedValue.endsWith("%")) {
                numVal = parseFloat(extractedValue.replace("%", ""));
              } else {
                numVal = parseFloat(extractedValue);
              }
            } else if (typeof extractedValue === "number") {
              numVal = extractedValue;
            }

            if (!isNaN(numVal)) {
              // If numVal is a decimal (e.g., 0.89 for 89%), convert to whole percentage.
              // Heuristic: if it's <= 1 (and non-negative), assume it's a decimal factor.
              if (numVal >= 0 && numVal <= 1) {
                extractedValue = Math.round(numVal * 100).toString(); // Use Math.round for safety
              } else {
                // Otherwise, assume it's already a whole percentage (e.g., 89)
                extractedValue = Math.round(numVal).toString(); // Round to handle potential decimals if any
              }
            } else {
              extractedValue = "0"; // Default if parsing failed
            }
          }
          // Normalize d_97 (Thermal Bridge Penalty %) value from Excel
          if (fieldId === "d_97") {
            if (
              typeof extractedValue === "number" &&
              extractedValue >= 0 &&
              extractedValue <= 1
            ) {
              // If Excel stores 30% as 0.3, convert to 30
              extractedValue = (extractedValue * 100).toString();
            } else if (
              typeof extractedValue === "string" &&
              extractedValue.endsWith("%")
            ) {
              // If Excel stores "30%"
              extractedValue = parseFloat(
                extractedValue.replace("%", ""),
              ).toString();
            } else if (typeof extractedValue === "number") {
              // If Excel stores just the number 30 for 30%
              extractedValue = extractedValue.toString();
            }
            // Ensure it's a string for consistency, defaulting to "0" if parsing failed
            if (isNaN(parseFloat(extractedValue))) {
              extractedValue = "0"; // Or a more appropriate default like "5"
            }
          }
          // Normalize k_52 (SHW AFUE) value from Excel
          if (fieldId === "k_52") {
            let numVal;
            if (typeof extractedValue === "string") {
              if (extractedValue.endsWith("%")) {
                numVal = parseFloat(extractedValue.replace("%", ""));
                // Convert percentage to decimal (e.g., 90% → 0.90)
                numVal = numVal / 100;
              } else {
                numVal = parseFloat(extractedValue);
              }
            } else if (typeof extractedValue === "number") {
              numVal = extractedValue;
            }

            if (!isNaN(numVal)) {
              // If numVal is > 1, assume it's a percentage that needs conversion to decimal
              if (numVal > 1) {
                extractedValue = (numVal / 100).toFixed(2);
              } else {
                // Assume it's already a decimal factor (e.g., 0.90)
                extractedValue = numVal.toFixed(2);
              }
            } else {
              extractedValue = "0.90"; // Default AFUE if parsing failed
            }
          }
          // Normalize k_120 (Unoccupied Setback %) value from Excel
          if (fieldId === "k_120") {
            let numVal;
            if (typeof extractedValue === "string") {
              if (extractedValue.endsWith("%")) {
                numVal = parseFloat(extractedValue.replace("%", ""));
              } else {
                numVal = parseFloat(extractedValue);
              }
            } else if (typeof extractedValue === "number") {
              numVal = extractedValue;
            }

            if (!isNaN(numVal)) {
              // If numVal is a decimal (e.g., 0.10 for 10%), convert to whole percentage.
              // Heuristic: if it's <= 1 (and non-negative), assume it's a decimal factor.
              if (numVal >= 0 && numVal <= 1) {
                extractedValue = Math.round(numVal * 100).toString();
              } else {
                // Otherwise, assume it's already a whole percentage (e.g., 10 for 10%)
                // Ensure it's within the slider's typical 0-100 range if it's a percentage
                extractedValue = Math.min(
                  Math.max(Math.round(numVal), 0),
                  100,
                ).toString();
              }
            } else {
              extractedValue = "0"; // Default if parsing failed (slider min is 0)
            }
          }
          importedData[fieldId] = extractedValue;
        }
      },
    );

    return importedData;
  }

  /**
   * NEW function for importing reference data from REFERENCE sheet.
   * ✅ FIX: Handle formula cells (=REPORT!H15) vs user-entered values
   * - If cell has formula referencing REPORT sheet → use REPORT value
   * - If cell has user-entered value → use that value (user override)
   */
  mapExcelToReferenceModel(workbook) {
    const importedData = {};
    const sheetName = CONFIG.EXCEL_MAPPING.SHEETS.REFERENCE;
    const reportSheetName = CONFIG.EXCEL_MAPPING.SHEETS.REPORT;
    const worksheet = workbook.Sheets[sheetName];
    const reportWorksheet = workbook.Sheets[reportSheetName];

    console.log(
      `[ExcelMapper] mapExcelToReferenceModel called. Sheet '${sheetName}' exists: ${!!worksheet}`,
    );

    if (!worksheet) {
      console.warn(
        `Sheet named '${sheetName}' not found in the workbook. Skipping reference import.`,
      );
      return {}; // Return empty object, not null - this is optional data
    }

    console.log(`[ExcelMapper] Starting REFERENCE sheet processing...`);
    console.log(`[ExcelMapper] REFERENCE worksheet exists:`, !!worksheet);
    console.log(
      `[ExcelMapper] Sample cells from REFERENCE:`,
      Object.keys(worksheet).slice(0, 20),
    );

    Object.entries(this.excelReferenceInputMapping).forEach(
      ([cellRef, fieldId]) => {
        const cell = worksheet[cellRef];

        // 🔍 DEBUG: Enhanced logging for H15
        if (cellRef === "H15") {
          console.log(`[ExcelMapper H15] Checking cell H15...`);
          console.log(`[ExcelMapper H15] Cell exists:`, cell !== undefined);
          console.log(`[ExcelMapper H15] Cell object:`, cell);
          console.log(`[ExcelMapper H15] Field ID:`, fieldId);
        }

        // 🔍 DEBUG: Log whether key cells exist
        if (cellRef === "H15" || cellRef === "D13") {
          console.log(
            `[ExcelMapper DEBUG] ${cellRef} exists: ${cell !== undefined}, cell:`,
            cell,
          );
        }

        if (cell !== undefined) {
          let extractedValue;

          // 🔍 DEBUG: Log cell structure to understand what we're working with
          if (cellRef === "H15" || cellRef === "D13") {
            console.log(`[ExcelMapper DEBUG] ${cellRef} cell:`, {
              value: cell.v,
              formula: cell.f,
              type: cell.t,
              hasFormula: !!cell.f,
              startsWithREPORT: cell.f?.startsWith("=REPORT!"),
            });
          }

          // ✅ Check if cell contains a formula referencing REPORT sheet
          // SheetJS stores formulas WITHOUT the leading = (e.g., "REPORT!H15" not "=REPORT!H15")
          if (
            cell.f &&
            (cell.f.startsWith("REPORT!") || cell.f.startsWith("=REPORT!"))
          ) {
            // Extract REPORT sheet cell reference (e.g., "REPORT!H15" → "H15")
            const reportCellRef = cell.f.replace(/^=?REPORT!/, "");

            // Read from REPORT sheet instead
            const reportCell = reportWorksheet?.[reportCellRef];
            if (reportCell) {
              extractedValue = this.extractCellValue(reportCell);
              console.log(
                `[ExcelMapper] ${cellRef} has formula ${cell.f}, using REPORT!${reportCellRef} = ${extractedValue}`,
              );
            } else {
              extractedValue = this.extractCellValue(cell); // Fallback
            }
          } else {
            // User-entered value (no formula or different formula)
            extractedValue = this.extractCellValue(cell);
            if (cellRef === "H15" || cellRef === "D13") {
              console.log(
                `[ExcelMapper DEBUG] ${cellRef} no REPORT formula, using cell value: ${extractedValue}`,
              );
            }
          }

          // Apply same normalizations as REPORT sheet but for reference fields
          // Remove ref_ prefix temporarily for normalization checks
          const baseFieldId = fieldId.replace(/^ref_/, "");

          // Normalize d_12 (Major Occupancy)
          if (baseFieldId === "d_12" && typeof extractedValue === "string") {
            if (extractedValue === "A - Assembly")
              extractedValue = "A-Assembly";
            else if (extractedValue === "B1 - Detention")
              extractedValue = "B1-Detention";
            else if (extractedValue === "B3 - Detention, Care and Treatment")
              extractedValue = "B3-Detention Care & Treatment";
            extractedValue = extractedValue.replace(/\s+-\s+/g, "-");
            if (extractedValue.startsWith("B3-")) {
              extractedValue = extractedValue.replace(/,\s+/g, " ");
            }
          }

          // Normalize d_108 (NRL50 Target Method)
          if (baseFieldId === "d_108" && typeof extractedValue === "string") {
            if (extractedValue === "Measured") extractedValue = "MEASURED";
            else if (extractedValue === "PH Classic")
              extractedValue = "PH_CLASSIC";
            else if (extractedValue === "PH Low") extractedValue = "PH_LOW";
            else if (extractedValue === "PH+") extractedValue = "PH_PLUS";
          }

          // Normalize percentage fields (d_59, d_53, d_52, d_118, d_97, k_120)
          if (baseFieldId === "d_59" || baseFieldId === "d_97") {
            if (
              typeof extractedValue === "number" &&
              extractedValue >= 0 &&
              extractedValue <= 1
            ) {
              extractedValue = (extractedValue * 100).toString();
            } else if (
              typeof extractedValue === "string" &&
              extractedValue.endsWith("%")
            ) {
              extractedValue = parseFloat(
                extractedValue.replace("%", ""),
              ).toString();
            } else if (typeof extractedValue === "number") {
              extractedValue = extractedValue.toString();
            }
            if (isNaN(parseFloat(extractedValue))) {
              extractedValue = "0";
            }
          }

          // Normalize d_53, d_118, k_120 (percentage sliders)
          if (
            baseFieldId === "d_53" ||
            baseFieldId === "d_118" ||
            baseFieldId === "k_120"
          ) {
            let numVal;
            if (typeof extractedValue === "string") {
              numVal = extractedValue.endsWith("%")
                ? parseFloat(extractedValue.replace("%", ""))
                : parseFloat(extractedValue);
            } else if (typeof extractedValue === "number") {
              numVal = extractedValue;
            }
            if (!isNaN(numVal)) {
              if (numVal >= 0 && numVal <= 1) {
                extractedValue = Math.round(numVal * 100).toString();
              } else {
                extractedValue = Math.round(numVal).toString();
              }
            } else {
              extractedValue = "0";
            }
          }

          // Normalize d_52 (DHW Eff Factor)
          if (baseFieldId === "d_52") {
            let numVal;
            if (typeof extractedValue === "string") {
              numVal = extractedValue.endsWith("%")
                ? parseFloat(extractedValue.replace("%", ""))
                : parseFloat(extractedValue);
            } else if (typeof extractedValue === "number") {
              numVal = extractedValue;
            }
            if (!isNaN(numVal)) {
              if (numVal <= 10) {
                extractedValue = (numVal * 100).toString();
              } else {
                extractedValue = numVal.toString();
              }
            } else {
              extractedValue = "0";
            }
          }

          // Normalize d_39 (Construction Type)
          if (baseFieldId === "d_39" && typeof extractedValue === "string") {
            const val = extractedValue.trim().toLowerCase();
            if (
              val.includes("pt.9") &&
              val.includes("res") &&
              val.includes("stick")
            ) {
              extractedValue = "Pt.9 Res. Stick Frame";
            } else if (
              val.includes("pt.9") &&
              val.includes("small") &&
              val.includes("mass timber")
            ) {
              extractedValue = "Pt.9 Small Mass Timber";
            } else if (val.includes("pt.3") && val.includes("mass timber")) {
              extractedValue = "Pt.3 Mass Timber";
            } else if (val.includes("pt.3") && val.includes("concrete")) {
              extractedValue = "Pt.3 Concrete";
            } else if (val.includes("pt.3") && val.includes("steel")) {
              extractedValue = "Pt.3 Steel";
            } else if (val.includes("pt.3") && val.includes("office")) {
              extractedValue = "Pt.3 Office";
            } else if (val.includes("modelled") || val.includes("modeled")) {
              extractedValue = "Modelled Value";
            }
          }

          // Normalize g_67 (Equipment Spec)
          if (
            baseFieldId === "g_67" &&
            typeof extractedValue === "string" &&
            extractedValue.trim().toLowerCase() === "low energy"
          ) {
            extractedValue = "Efficient";
          }

          // Normalize k_52 (SHW AFUE)
          if (baseFieldId === "k_52") {
            let numVal;
            if (typeof extractedValue === "string") {
              if (extractedValue.endsWith("%")) {
                numVal = parseFloat(extractedValue.replace("%", "")) / 100;
              } else {
                numVal = parseFloat(extractedValue);
              }
            } else if (typeof extractedValue === "number") {
              numVal = extractedValue;
            }
            if (!isNaN(numVal)) {
              if (numVal > 1) {
                extractedValue = (numVal / 100).toFixed(2);
              } else {
                extractedValue = numVal.toFixed(2);
              }
            } else {
              extractedValue = "0.90";
            }
          }

          importedData[fieldId] = extractedValue;
        }
      },
    );

    return importedData;
  }

  // --- Existing methods (potentially keep for backward compat or full export) ---
  mapExcelToModel(workbook) {
    const result = {};
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]; // Uses first sheet
    Object.entries(this.mapping).forEach(([fieldId, cellRef]) => {
      const cell = worksheet[cellRef];
      if (cell !== undefined) {
        result[fieldId] = this.extractCellValue(cell);
      }
    });
    return result;
  }

  createWorkbook(data) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([]);
    Object.entries(this.mapping).forEach(([fieldId, cellRef]) => {
      if (data[fieldId] !== undefined) {
        const colRow = this.cellRefToColRow(cellRef);
        if (colRow) {
          // Check if conversion was successful
          const value = data[fieldId];
          XLSX.utils.sheet_add_aoa(worksheet, [[value]], { origin: colRow });
        }
      }
    });
    XLSX.utils.book_append_sheet(workbook, worksheet, "TEUI Calculator");
    return workbook;
  }

  extractCellValue(cell) {
    if (!cell) return null; // Handle cases where cell might be null/undefined

    // ✅ FIX (Oct 5, 2025): Handle percentage cells
    // Excel stores percentages as decimals (50% = 0.5), but our app expects 50
    // Check if cell has percentage formatting:
    // - cell.z (format string like "0%") OR
    // - cell.w (formatted display like "50%")
    if (cell.t === "n") {
      const hasPercentFormat =
        (cell.z && cell.z.includes("%")) || (cell.w && cell.w.includes("%"));
      if (hasPercentFormat) {
        // Multiply by 100 to convert decimal to percentage (Excel 0.5 → App 50)
        return cell.v * 100;
      }
      return cell.v; // Regular number
    }

    if (cell.t === "s") return cell.v; // String
    if (cell.t === "b") return cell.v; // Boolean
    if (cell.t === "d") return cell.v; // Date
    return cell.v; // Default
  }

  cellRefToColRow(cellRef) {
    const match = cellRef.match(/([A-Z]+)(\d+)/);
    if (!match) return null;
    const [, colLetters, rowStr] = match;
    let col = 0;
    for (let i = 0; i < colLetters.length; i++) {
      col = col * 26 + (colLetters.charCodeAt(i) - "A".charCodeAt(0) + 1);
    }
    col--;
    const row = parseInt(rowStr, 10) - 1;
    return { c: col, r: row };
  }

  /**
   * Extract validation tooltips from REPORT sheet cells
   * Returns object mapping field IDs to tooltip data
   * Note: XLSX.js has limited data validation support, this extracts cell comments
   * For full validation messages, use the Python extraction script (extract-validation.py)
   */
  extractValidationTooltips(workbook) {
    const tooltips = {};
    const sheetName = CONFIG.EXCEL_MAPPING.SHEETS.REPORT;
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      console.warn(`Sheet '${sheetName}' not found for tooltip extraction`);
      return tooltips;
    }

    // Iterate through all mapped input cells
    Object.entries(this.excelReportInputMapping).forEach(
      ([cellRef, fieldId]) => {
        const cell = worksheet[cellRef];

        if (cell) {
          // Extract cell comment if present (XLSX.js does support this)
          if (cell.c && cell.c.length > 0) {
            const comment = cell.c[0];
            tooltips[fieldId] = {
              cell: cellRef,
              comment: comment.t || comment.a || "", // .t is text, .a is author
            };
          }

          // Note: Data validation input messages are NOT directly accessible via XLSX.js
          // Use extract-validation.py script to generate full validation JSON
        }
      },
    );

    console.log(
      `[ExcelMapper] Extracted ${Object.keys(tooltips).length} cell comments from REPORT sheet`,
    );
    return tooltips;
  }
}

// Create and export instance
window.TEUI = window.TEUI || {};
window.TEUI.ExcelMapper = new ExcelMapper();
