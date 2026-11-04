/**
 * 4012-TooltipManager.js
 * Manages validation tooltips from Excel for TEUI Calculator fields
 *
 * Tooltip data extracted from TEUIv3042.xlsx REPORT sheet Data Validation Nov 8, 2025
 * Last updated: Nov 16, 2025 - manual edits for clarity with URI references for the nerds
 * Source: extract-validation.py script (since deleted)
 */

(function (window) {
  "use strict";

  // Comprehensive extraction from TEUIv3042.xlsx - 107 tooltips total
  const VALIDATION_TOOLTIPS = {
    // Section 02 Project & Method Data
    d_12: {
      cell: "D12",
      title: "Major Occupancy",
      message:
        "Select a Major Occupancy (NBC Reference) from the Drop-Down_x000a_Affects: Tset Heating and Equipment Loads",
    },
    h_12: {
      cell: "H12",
      title: "Year Data Entered",
      message:
        "Select a Reporting Period. This will determine Annualized Emissions Factors and Forecasted Factors per the Toronto Atmospheric Fund. ",
    },
    l_12: {
      cell: "L12",
      title: "Assume $0.13/kwh",
      message:
        "Delivery Charges, Debt Retirement, Rebates, TOU rates and Taxes May Vary. Enter Gross Value to closer approximate complete Utility Bill Costs",
    },
    d_13: {
      cell: "D13",
      title: "Reference Standards",
      message:
        "Select a Building Code Prescriptive Path option, or NECB Base Tier, or any other baseline scenario._x000a_Then press 'Set Values' to over-write Insulation, Airtightness, and System Efficiencies to the Code Minimums required by the Selected Standard",
    },
    e_13: {
      cell: "E13",
      title: "Set Defaults",
      message:
        "User may enter values higher than any Building-Code requied values with no penalty. _x000a_Pressing 'Set Values' will over-write any custom Insulation, Airtightness, and System Efficiencies to the Code Minimums required by the Selected Standard",
    },
    h_13: {
      cell: "H13",
      title: "Select a period in Years",
      message:
        "Period related to durability level of building. 30 = Stick Frame Residential. 50 = ICI buildings. 80 = Long-life buildings and 100 = legacy class buildings (Historic, Monumental, etc). Larger number = larger denominator for Lifetime Carbon. ",
    },
    l_13: {
      cell: "L13",
      title: "Assume $0.507 (Ontario)",
      message:
        "Adjust for Different Regions, be sure to add any regulatory or other fees, charges, tax & delivery to totals. ",
    },
    d_14: {
      cell: "D14",
      title: "Select a Method",
      message:
        "Targeted Use: All Design Phases - modelled values_x000a_Utility Bills: Read from Meters, 12mos. Post-Occupancy",
    },
    h_14: {
      cell: "H14",
      title: "Project Name",
      message:
        "You may anonymize any owner info here. Use a project number or location or secret code name. Useful also for naming variations of your OBJECTIVE models ie. Run 1, 2, 3, etc.",
    },
    l_14: {
      cell: "L14",
      title: "Assume $1.62 (Ontario)",
      message:
        "Adjust for Different Regions, be sure to add any regulatory or other fees, charges, tax & delivery to totals. ",
    },
    d_15: {
      cell: "D15",
      title: "Carbon Benchmark",
      message:
        "Enter relevant standard otherwise 'Self Reported'. If no A1-3 Embodied carbon has been calculated using another tool, select 'Not Reported' to use default values (Upset Limits from TGS4)_x000a_Reference: https://openbuilding.ca/2024/07/22/teui-s-3-carbon-benchmarking-standard/",
    },
    h_15: {
      cell: "H15",
      title: "Net Conditioned Area",
      message:
        "Net Conditioned Area is measured from the interior face of any wall. _x000a_https://openbuilding.ca/2024/06/23/teui-b-3-conditioned-area/ ",
    },
    l_15: {
      cell: "L15",
      title: "Assume $180/m3 (Ontario)",
      message:
        "Adjust for Different Regions, be sure to add any tax & delivery to totals. ",
    },
    d_16: {
      cell: "D16",
      title: "S4. Targets",
      message:
        "IPCC AR6 EPC = Equal PerCapita method to limit to 1.5°C_x000a_IPCC AR6 EA = Equity-Adjusted method to limit to 1.5°C_x000a_Reference: https://openbuilding.ca/2024/07/22/teui-s-3-carbon-benchmarking-standard/",
    },
    i_16: {
      cell: "H16",
      title: "Certifier",
      message:
        "The name of the entity that holds a Certificate of Practice if Architect, or the Certificate of Authourization if Engineer. If the firm is a BCIN firm, enter the name of that entity. This is a prerequisite to be considered a 'Certifier' by OpenBuilding",
    },
    l_16: {
      cell: "L16",
      title: "Assume $1.50 (Ontario)",
      message:
        "Adjust for Different Regions, be sure to add any charges, fees, tax & delivery to totals. ",
    },
    i_17: {
      cell: "H17",
      title: "License or Authorization",
      message:
        "Enter here the OAA CofP Number, or PEO issued Cert. of Auth here, or if BCIN the BCIN No. ",
    },
    // Section 03 Climate & Location Data
    d_19: {
      cell: "D19",
      title: "Select a Province",
      message: "Enter the 2-digit Province abbreviation",
    },
    h_19: {
      cell: "H19",
      title: "Municpality",
      message: "Select a Muncipality from the Drop-Down",
    },
    m_19: {
      cell: "M19",
      title: "Cooling Days are Increasing",
      message:
        "120 is Typical in Canada, but with warming climate, this can add 20-40 days. This will affect both cooling setpoints and occupant schedules. ",
    },
    h_20: {
      cell: "H20",
      title: "Weather Data Range",
      message:
        "Present: Historical to Current Values Used (2025)_x000a_Future: 2021-2050 Projected Values Used",
    },
    l_20: {
      cell: "L20",
      title: "Cooling Season Mean Overnight °C",
      message:
        "Night-Time Temp Outside in °C (≈ Summer Mean Jun-Aug) USER DEFINED or from Weather File",
    },
    d_21: {
      cell: "D21",
      title: "Cooling Degree Days",
      message:
        "If Unavailable, you can enter a custom value here. Click the CDD link left to find values from ClimateAtlas.ca.",
    },
    h_21: {
      cell: "H21",
      title: "Select Calculation Method",
      message:
        "Static: Conventional Thermal Transfer_x000a_Capacitance: Simulates Thermal Mass Transfer & Storage Characteristics (uses G.4.2) - 50% assumes equilibrium reached_x000a__x000a_Capacitance only if sub-grade surfaces form part of conditioned volume",
    },
    i_21: {
      cell: "I21",
      title: "Capacitance Factor",
      message:
        "Fakes a value (0-50% max.) for ground-facing elements, that absorb some excess thermal energy. Cooling season is short in Canada and massy elements eventually reach equilibrium/steady-state. Enter 0% when subgrade elements are not part of the conditioned volume",
    },
    l_21: {
      cell: "L21",
      title: "Cooling Outdoor Mean RH%",
      message:
        "Cooling Season Mean RH in % at 15h00 LST (Jun-Sept) USER DEFINED or from Weather File",
    },
    l_22: {
      cell: "L22",
      title: "Elevation ASL in metres",
      message: "Fetches ASL value from CANADA Climate Worksheet",
    },
    l_23: {
      cell: "L23",
      title: "Cooling Guidance",
      message:
        "ASHRAE may permit 26°C, where NBC 2025 may require 24°C. Residents will often set lower. Use 24°C as Default for design. ",
    },
    m_23: {
      cell: "M23",
      title: "OBC Required Heating Setpoint",
      message:
        "Thermostat Setpoint: This compares the Tset value determined by Major Occupancy, against the value set by the selected Reference Standard (ie. PH Classic). A fail/X just means there is a difference between the Building Code and the Reference Standard's Modelled value.",
    },
    h_24: {
      cell: "H24",
      title: "Cooling Setpoint °C",
      message:
        "ASHRAE may permit 26°C, where NBC 2025 may require 24°C. Residents will often set lower. Use 24°C as Default for design. ",
    },
    l_24: {
      cell: "L24",
      title: "Cooling Override °C",
      message:
        "24°C as Default for design. Target model only: enter a higher value to reduce cooling system loads, or a lower one (down to 18°C, where systems commonly cap) to model occupants who set cooling colder than the code assumes. The Reference model always uses the code's 24°C.",
    },
    m_24: {
      cell: "M24",
      title: "NBC Upper Cooling Limit",
      message:
        "NECB/NBC now establish an upper limit for Tset Cooling of 26ºC. Users often will set lower values in practice. A realistic value of 22ºC-24ºC as a typical cooling setpoint should be considered. Users can over-ride these values.",
    },
    // Section 04 Energy Use Data
    d_27: {
      cell: "D27",
      title: "Actual Electricity Use",
      message:
        "Enter a number here only if you have Utility Bill data. If none are yet available, be sure to select 'S.2 Targeted Use' mode. ",
    },
    d_28: {
      cell: "D28",
      title: "Actual Gas Use",
      message:
        "Enter a number here only if you have Utility Bill data. If none are yet available, be sure to select 'S.2 Targeted Use' mode. ",
    },
    d_29: {
      cell: "D29",
      title: "Actual Propane Use",
      message:
        "Enter a number here only if you have Utility Bill data. If none are yet available, be sure to select 'S.2 Targeted Use' mode._x000a_OBJECTIVE does not calculate Propane use as an energy source, use 'Gas' instead ",
    },
    d_30: {
      cell: "D30",
      title: "Actual Oil Use",
      message:
        "Enter a number here only if you have Utility Bill data. If none are yet available, be sure to select 'S.2 Targeted Use' mode. ",
    },
    d_31: {
      cell: "D31",
      title: "Actual Wood Use",
      message:
        "Biomass Guidance: If a form of Biomass thermal energy has been selected, the emissions will be offset automatically here, since according to IPCC and Canadian LULUCF methodologies, Biomass emissions are calculated based on forest inventories, and not as a scope 1 emission._x000a_OBJECTIVE does not calculate Wood use as an energy supply option due to its generally imtermittent use. ",
    },
    l_33: {
      cell: "L33",
      title: "High Level Nuclear Waste",
      message:
        "Waste factor considers amount of high-level nuclear waste generated on a kWh basis for Ontario, with a grid mix of ~60% nuclear averaged on a given year. This waste requires long-term storage of 500 to 1,000,000 yrs to be rendered 'safe' for all life. ☢️ ",
    },
    l_34: {
      cell: "L34",
      title: "High Level Nuclear Waste",
      message:
        "Waste factor considers amount of high-level nuclear waste generated on a kWh basis for Ontario, with a grid mix of ~60% nuclear averaged on a given year. This waste requires long-term storage of 500 to 1,000,000 yrs to be rendered 'safe' for all life. ☢️ ",
    },
    h_35: {
      cell: "H35",
      title: "PER Factors",
      message:
        "For 100% electric buildings in Canada, PHPP adds a PER of 1.5. 1.0 represents Site Energy or Site EUI. We would recommend entry of 1.0 UNLESS you are comparing your model to PHPP-generated results for side-by-side comparison.",
    },
    // Section 05 Emissions Data
    d_39: {
      cell: "D39",
      title: "Building Typology",
      message:
        "Select a Building Typology_x000a_Or select 'Modelled Value' if you have calclated it with external software. ",
    },
    //  Section 06 Renewable Energy Data
    i_41: {
      cell: "I41",
      title: "Externally Defined Value",
      message:
        "ONLY Select this option if Embodied Carbon must be calculated using an external tool. otherwise a guidance value will be calculated from the Building Construction Typology selected to the left. ",
    },
    m_43: {
      cell: "M43",
      title: "Default is 0",
      message:
        "Only enter if planned outdoor loads are known, ie. Exterior Lighting, Pumps, Heat-Tracing, Snow-Melting, etc. ",
    },
    // Section 07 Service or Domestic Hot Water Data
    d_49: {
      cell: "D49",
      title: "DHW/SHW Use Method (lpppd)",
      message:
        "PHPP Method: 62.5 Total, 25 DHW_x000a_NBC Method: 220 Total, 88 DHW_x000a_OBC Method: 275 Total, 110 DHW_x000a_Luxury: 400 Total, 160 DHW_x000a__x000a_By Engineer: Uses kWh value calculated externally",
    },
    e_49: {
      cell: "E49",
      title: "Litres/Per-Person/Day",
      message:
        "Enter a value for Total Water Per Day. If you are trying to match values from a water meter, divide the meter value by 365 and then again by #Occupants. ",
    },
    h_49: {
      cell: "H49",
      title: "Enter Percapita Metered Use",
      message:
        "Assume 220 litres/pp/day per NBC 9.36. Assume 40% of this is DHW or 88 litres/pp/day DHW. ",
    },
    e_50: {
      cell: "E50",
      title: "Occupancy-Dependent Calculation",
      message:
        "If non-Residential Occupancy Selected, this number will be used",
    },
    d_51: {
      cell: "D51",
      title: "DHW/SHW Heating Source",
      message:
        "Select DHW Energy Source from the drop-down options and enther the efficiency accordingly.",
    },
    d_52: {
      cell: "D52",
      title: "If Heatpump Selected",
      message: "EF can be greater than 100%, ie. COP 1.5 = 150%",
    },
    // ✅ k_52 RETIRED: Field removed after S07 efficiency consolidation (all fuel types now use d_52 slider)
    d_53: {
      cell: "D53",
      title: "Range of DWHR Efficiency",
      message:
        "0-75%, with 40% a common Residential Unit Efficiency_x000a_This is considered a high impact energy conservation measure for DHW systems with rapid ROI and decarbonization impacts. ",
    },
    e_54: {
      cell: "E54",
      title: "Gas Exhaust Energy",
      message:
        "Related to equipment efficiency, this takes the remainder of un-utilized energy in kWh and maps to a waste-flow. ie. 90% efficient equipment results in a 10% total net energy waste. Equipment efficienct is set at W.4 ",
    },
    g_54: {
      cell: "G54",
      title: "Gas Exhaust Energy",
      message:
        "Related to equipment efficiency, this takes the remainder of un-utilized energy in kWh and maps to a waste-flow. ie. 90% efficient equipment results in a 10% total net energy waste. Equipment efficienct is set at W.4 ",
    },
    h_54: {
      cell: "H54",
      title: "Gas Exhaust Energy",
      message:
        "Related to equipment efficiency, this takes the remainder of un-utilized energy in kWh and maps to a waste-flow. ie. 90% efficient equipment results in a 10% total net energy waste. Equipment efficienct is set at W.4 ",
    },
    l_54: {
      cell: "L54",
      title: "Gas Exhaust Energy",
      message:
        "Related to equipment efficiency, this takes the remainder of un-utilized energy in kWh and maps to a waste-flow. ie. 90% efficient equipment results in a 10% total net energy waste. Equipment efficienct is set at W.4 ",
    },
    // Section 08 IAQ & Atmosphere Control Data
    d_59: {
      cell: "D59",
      title: "Interior Heating Season RH% Average",
      message:
        "Enter the Interior Heating Season Average RH% when available. This presently has no impact on OBJECTIVE calculations.",
    },
    g_59: {
      cell: "G59",
      title: "Indoor State for the Latent Cooling Load",
      message:
        "The humidity the cooling system is CONTROLLED to - a setpoint, not a sensor reading. F280 50%: CSA F280's 9.3 g/kg (24 °C, 50% RH), the default. Target RH: the setpoint at the cooling season RH slider. Sets the latent load and which hours count as drier for free cooling. Rooms that run wetter than the target (kitchens, bathrooms) are a moisture and air-quality issue, not extra cooling energy.",
    },
    i_59: {
      cell: "I59",
      title: "Interior Cooling Season RH% Average",
      message:
        "The RH% the cooling system is controlled to in the cooling season. With the latent basis (G59) set to Target RH it sets the latent cooling load (CSA F280 Annex B, on the climate station's monthly humidity) and which hours count as drier for free cooling; with F280 50% those use 9.3 g/kg instead. It always feeds the RH air-quality check.",
    },
    d_60: {
      cell: "D60",
      title: "Biomass Guidance",
      message:
        "If a form of Biomass thermal energy has been selected, the emissions will be offset automatically here, since according to IPCC and Canadian LULUCF methodologies, Biomass emissions are calculated based on forest inventories, and not as a scope 1 emission.",
    },
    // Section 09 Internal Gains Data
    d_63: {
      cell: "D63",
      title: "Occupants",
      message:
        "Enter the number of declared Occupants (ie. per OBC) but consider full Occupant loads rarely occur. If Occupant loads are known, enter the typical average. ",
    },
    g_63: {
      cell: "G63",
      title: "Occupied Hours",
      message:
        "0 = Typically Unoccupied_x000a_8 = Typical Biz. Hours_x000a_10 = Extended Biz. Hours_x000a_12 = Typical Res. Profile_x000a_16 = WFH Profile_x000a_24 = Intensive Use Profile",
    },
    d_64: {
      cell: "D64",
      title: "Average Daily Metabolic Rate",
      message: "Activity Levels lookup: Schedules tab, per ASHRAE values. ",
    },
    d_65: {
      cell: "D65",
      title: "Default determined by Occupancy",
      message: "Default determined by Occupancy",
    },
    d_66: {
      cell: "D66",
      title: "Default is 1.5",
      message: "Default is 1.5",
    },
    d_67: {
      cell: "D67",
      title: "Default Determined by Occupancy",
      message: "Default Determined by Occupancy",
    },
    g_67: {
      cell: "G67",
      title: "Efficient or Regular Energy Spec",
      message:
        "Select whether this is a Low Energy Specification or Regular Energy",
    },
    d_68: {
      cell: "D68",
      title: "Include Elevator Load",
      message:
        "Select Yes or No to indicate whether an elevator forms part of the Equipment load.",
    },
    // Section 10 Solar Gains Data
    d_73: {
      //generic opening input tooltip, copy down to d_74 thru d_78
      cell: "D73",
      title: "Enter an Area in m²",
      message:
        "Aggregate Area value of Openings by Type, for each orientation in m². Measured from Rough Opening Dimensions",
    },
    e_73: {
      cell: "E73",
      title: "Select an Orientation",
      message:
        "This determines gains based on the Solar Gains Factor in Column 'M'",
    },
    f_73: {
      cell: "F73",
      title: "Solar Heat Gain Coefficient",
      message:
        "0.5 = 50% Gain Permitted (Default)_x000a_Higher Numbers Increase Solar Heat Gain (Reduces Heating)_x000a_Lower Numbers Reduce Solar Heat Gain (Reduces Cooling)",
    },
    m_73: {
      cell: "M72",
      title: "Gains Factor Derivation",
      message:
        "From Hourly Modelling for Toronto Latitude: 0.5 SHGC at Mid-wall placement self-shading and 40% DST and 52% TST Assumed",
    },
    d_74: {
      //generic opening input tooltip, copy down to d_74 thru d_78
      cell: "D74",
      title: "Enter an Area in m²",
      message:
        "Aggregate Area value of Openings by Type, for each orientation in m². Measured from Rough Opening Dimensions",
    },
    e_74: {
      cell: "E74",
      title: "Select an Orientation",
      message:
        "This determines gains based on the Solar Gains Factor in Column 'M'",
    },
    f_74: {
      cell: "F74",
      title: "Solar Heat Gain Coefficient",
      message:
        "0.5 = 50% Gain Permitted (Default)_x000a_Higher Numbers Increase Solar Heat Gain (Reduces Heating)_x000a_Lower Numbers Reduce Solar Heat Gain (Reduces Cooling)",
    },
    d_75: {
      //generic opening input tooltip, copy down to d_74 thru d_78
      cell: "D75",
      title: "Enter an Area in m²",
      message:
        "Aggregate Area value of Openings by Type, for each orientation in m². Measured from Rough Opening Dimensions",
    },
    e_75: {
      cell: "E75",
      title: "Select an Orientation",
      message:
        "This determines gains based on the Solar Gains Factor in Column 'M'",
    },
    f_75: {
      cell: "F75",
      title: "Solar Heat Gain Coefficient",
      message:
        "0.5 = 50% Gain Permitted (Default)_x000a_Higher Numbers Increase Solar Heat Gain (Reduces Heating)_x000a_Lower Numbers Reduce Solar Heat Gain (Reduces Cooling)",
    },
    d_76: {
      //generic opening input tooltip, copy down to d_74 thru d_78
      cell: "D76",
      title: "Enter an Area in m²",
      message:
        "Aggregate Area value of Openings by Type, for each orientation in m². Measured from Rough Opening Dimensions",
    },
    e_76: {
      cell: "E76",
      title: "Select an Orientation",
      message:
        "This determines gains based on the Solar Gains Factor in Column 'M'",
    },
    f_76: {
      cell: "F76",
      title: "Solar Heat Gain Coefficient",
      message:
        "0.5 = 50% Gain Permitted (Default)_x000a_Higher Numbers Increase Solar Heat Gain (Reduces Heating)_x000a_Lower Numbers Reduce Solar Heat Gain (Reduces Cooling)",
    },
    d_77: {
      //generic opening input tooltip, copy down to d_74 thru d_78
      cell: "D77",
      title: "Enter an Area in m²",
      message:
        "Aggregate Area value of Openings by Type, for each orientation in m². Measured from Rough Opening Dimensions",
    },
    e_77: {
      cell: "E77",
      title: "Select an Orientation",
      message:
        "This determines gains based on the Solar Gains Factor in Column 'M'",
    },
    f_77: {
      cell: "F77",
      title: "Solar Heat Gain Coefficient",
      message:
        "0.5 = 50% Gain Permitted (Default)_x000a_Higher Numbers Increase Solar Heat Gain (Reduces Heating)_x000a_Lower Numbers Reduce Solar Heat Gain (Reduces Cooling)",
    },
    d_78: {
      //generic opening input tooltip, copy down to d_74 thru d_78
      cell: "D78",
      title: "Enter an Area in m²",
      message:
        "Aggregate Area value of Openings by Type, for each orientation in m². Measured from Rough Opening Dimensions",
    },
    e_78: {
      cell: "E78",
      title: "Select an Orientation",
      message:
        "This determines average radiant gains based on the Solar Gains Factor in Column 'M'. Skylights are considered 'flat' (75kWh/m2/yr). If skylights are pitched Southwards, this Gains Factor may be closer to 100 kWh/m2/yr. ",
    },
    f_78: {
      cell: "F78",
      title: "Solar Heat Gain Coefficient",
      message:
        "0.5 = 50% Gain Permitted (Default)_x000a_Higher Numbers Increase Solar Heat Gain (Reduces Heating)_x000a_Lower Numbers Reduce Solar Heat Gain (Reduces Cooling)",
    },
    d_80: {
      cell: "D80",
      title: "A Note on Methods:",
      message:
        "NRC: 0% = Intermittent Occupancies_x000a_NRC: 40% = Light-Wood Framed Buildings_x000a_NRC: 50% = Light-Wood Buildings + Transfer Strategies_x000a_NRC: 60% = Massive Buildings + Transfer Strategies_x000a_PH Method: Approximation of PHPP",
    },
    g_80: {
      cell: "G80",
      title: "A Note on Methods:",
      message:
        "NRC: 40-60% for Canadian Light-Wood Framed Buildings_x000a_PHPP: Calculated (use for PH projects). _x000a__x000a_Intermittent Occupancy and Low Mass buildings should enter 0%_x000a_High Mass Buildings with regular occupancy can use 60%",
    },
    o_84: {
      cell: "O84",
      title: "Thermal Phase Lag",
      message:
        "Calculated Time in Hours for Interior to Reach Exterior Temperature in Heating and Cooling Peaks w/o Mechanical Intervention",
    },
    // Section 11 Building Envelope Data
    d_96: {
      cell: "D96",
      title: "B.11 Interior Floors",
      message:
        "This input value DOES NOT participate in heatloss calculations, and includes conditioned and non-conditioned area ONLY as a denominator for Embodied Carbon Intensity metrics and standards in E.3.2. ",
    },
    d_97: {
      cell: "D97",
      title: "TB Penalty",
      message:
        "For PH projects enter min. 5% to account for Construction Error, Unaccounted for TB. Enter between 5- 70% depending on level of effort to mitigate Thermal Bridges.  ",
    },
    j_98: {
      cell: "J98",
      title: "Total % Excludes B.12 TB Penalty", //understand why these fail per console
      message: "",
    },
    l_98: {
      cell: "L98",
      title: "Total % Excludes B.12 TB Penalty", //understand why these fail per console
      message: "",
    },
    // Section 12 Volume and Surface Metrics
    d_103: {
      cell: "D103",
      title: "Select Stories",
      message:
        "Up to 3 stories per NRC Test Data. 4-6 storey options are theoretical extrapolations._x000a_(https://building-performance.org/bpa-journal/ach50-achnat/)",
    },
    g_103: {
      cell: "G103",
      title: "Exposure Level",
      message:
        "Select a level of wind exposure to simulate air-leakage effects due to pressure.",
    },
    j_104: {
      cell: "J104",
      title: "Checksum",
      message:
        "Just running value totals from tables rather than aggregate-U-value based healtloss totals. ",
    },
    l_104: {
      cell: "L104",
      title: "Total Excludes B.12 TB Penalty",
      message: "",
    },
    d_105: {
      cell: "D105",
      title: "Conditioned Volume ",
      message:
        "Measure this conditioned volume as bounded by the interior-most faces of all walls, roofs, floors facing Ae and Ag. Treat entire building as one-zone, including conditioned basements.",
    },
    d_108: {
      cell: "D108",
      title: "A.2 NRL50 * Ae",
      message:
        "Select an Airtighness Level. 'Measured' will override defined targets from NECB/NBC. A-suffix = Guarded or Multi-Zone method, B-Suffix = Unguarded or One-Zone method per NBC 9.36.6.4. Use 'Measured' for Part 3 Buildings.",
    },
    g_109: {
      cell: "G109",
      title: "Calculation Dependency",
      message:
        "This field will not form part of calculations unless B.18.1 'Measured' is selected as the _x000a_Method. ",
    },
    h_109: {
      cell: "H109",
      title: "Calculation Dependency",
      message:
        "This field will not form part of calculations unless B.18.1 'Measured' is selected as the Method. ",
    },
    g_110: {
      cell: "G110",
      title: "n-Factor Description",
      message: "Naturalizes air leakage from pressure test results",
    },
    j_110: {
      cell: "J110",
      title: "Climate Zone per n-Factor Table",
      message:
        "Most of Canada uses Zone 2. _x000a_Southern SK & MB use Zone 1. _x000a_Southern BC uses Zone 3. _x000a_refer to Map on NRL50 n-Factors tab if uncertain",
    },
    // Section 13 Mechanical Loads
    d_113: {
      cell: "D113",
      title: "Select Primary Heating System",
      message:
        "Select Electric, Heatpump or Gas and note defined efficiency inputs (HSPF or AFUE). Electricity is assumed 100% efficient. ",
    },
    f_113: {
      cell: "F113",
      title: "HSPF Dictates COP, CEER",
      message:
        "Enter Value Required by Reference Standard. Typ. range is 7-14. Only applies when 'Heatpump' Option is Selected from the dropdown to the left. _x000a__x000a_You may use the HSPF or HSPF2 equipment rating, noting HSPF2 is ~0.85 of HSPF due to harsher test conditions. This value an outsized influence on TEUI - Choose Well!",
    },
    d_116: {
      cell: "D116",
      title: "Select Cooling System",
      message:
        "No: No Cooling Provided_x000a_Yes: Cooling by Primary M.1.0 System if Heatpump otherwise;_x000a_Yes: Dedicated Cooling System (When Electricity/Gas/Oil) ",
    },
    d_118: {
      cell: "D118",
      title: "Typ. Range 50-90%",
      message: "Refer to Reference Standard Requirements",
    },
    g_118: {
      cell: "G118",
      title: "Select Ventilation Method",
      message:
        "Volume Constant: Volume Rate 24/7_x000a_Volume by Schedule: Volume Rate * Schedule_x000a_Occupant: Occupant Rate 24/7_x000a_Occupant by Schedule: Occupant Rate * Schedule _x000a_(aka. Demand-Based, typ. CO2 Monitored)",
    },
    l_118: {
      cell: "L118",
      title: "ACH Value",
      message:
        "Refer to ASHRAE 90.1_x000a_Offices: 4-6_x000a_Schools: 3-6_x000a_Retail: 3-5_x000a_Healthcare: 6-15_x000a_Residential: 0.35-1.0",
    },
    d_119: {
      cell: "D119",
      title: "Ventilation Guidance",
      message: "8.33 l/s is Default, 12.5 l/s is considered best practice",
    },
    e_118: {
      cell: "E118",
      title: "Heat Recovery Type",
      message:
        "HRV: recovers sensible heat only (the SRE). ERV: also recovers moisture - enter its rated Latent Recovery Efficiency in the ERV LRE field (row V.3.1, beside the Latent Load Factor), from the unit's HVI / CSA C439 data sheet. Only an ERV reduces the latent cooling load.",
    },
    i_122: {
      cell: "I122",
      title: "Latent Load Method",
      message:
        "F280: CSA F280 Annex B as written - the design latent gives an ERV no credit. OBJECTIVE: our own method - the design latent credits the ERV's LRE and uses the S08 indoor state. ASHRAE 140: Class II extracts no latent heat (Section 12.2.1.13), so the latent load is zero and cooling is sensible only. ASHRAE 140 is for validation tests only - do not use it for real building design. The annual latent credits an ERV under F280 and OBJECTIVE alike, so the two give the same TEUI and differ only in the design latent (equipment sizing).",
    },
    l_122: {
      cell: "L122",
      title: "ERV Latent Recovery Efficiency (LRE)",
      message:
        "The ERV's rated latent recovery (moisture transfer) at the cooling test condition, from its HVI / CSA C439 data sheet. Reduces the ventilation's latent load by this share. Active only when the recovery type is ERV.",
    },
    l_119: {
      cell: "L119",
      title: "Summer Boost",
      message:
        'Multiplies the mechanical ventilation rate in the cooling season, on the hours when outdoor air is cooler and drier than indoors, as an automated economiser would. This is free cooling: it reduces the cooling need and never adds load. It has no effect on heating. "None" means no free cooling beyond ordinary ventilation. Passive and stack venting, whether controlled by users or Building Automation Systems (BAS) such as clerestory-window exhaust, is not modelled here.',
    },
    k_120: {
      cell: "K120",
      title: "Unoccupied Ventilation Setback %",
      message:
        "Per Engineer. Affects Free Cooling Capacity. ie. 90% = 90% of Occupied Ventilation Rate applied to Unoccupied Hours. ",
    },
    d_121: {
      cell: "D121",
      title: "Ventilation Heating Load",
      message:
        "Heating Season Fresh Air Load: This is the burden of heating system load related to bringing in ventilation air from outside that is both colder than, and less humid than indoor air, and so has both sensible and a latent cooling load components. Mitigated by MVHR Efficiency %.",
    },
    d_122: {
      cell: "D122",
      title: "Ventilation Cooling Load",
      message:
        "aka. Incomining Cooling Season Ventilation Load from Outside Air. aka. Fresh Air Load: This is the burden of heat gain related to bringing in ventilation air from outside that is both warmer than, and more humid than indoor air, and so has both sensible and a latent cooling load components. ",
    },
    d_123: {
      cell: "D123",
      title: "Ventilation Heat Removal",
      message:
        "This is the amount of thermal energy that can be dumped by ventilation alone, noting what goes out must come in. Free cooling design optimizes ventilation overnight when outdoor air is generally less humid and cooler, flushing warm, humid air building from daytime activity. Consider NOT setting back ventilation rate overnight for cooling season to maximize this benefit. ",
    },
    m_124: {
      cell: "M124",
      title: "Negative Values",
      message:
        "Negative Days Active Cooling Rewuired simply means no days require mechanical cooling - Passive Strategies for Free Cooling ie. Night-time ventilation *MAY* be adequate.",
    },
    // Section 14 TEDI & TELI
    m_141: {
      cell: "M141",
      title: "Assume $0.122 (Ontario)",
      message:
        "Adjust for Different Regions, be sure to add any tax & delivery to totals. ",
    },
    // Section 15 TEUI
    d_142: {
      cell: "D142",
      title: "Capital Cost Premium",
      message:
        "Add here the capital cost premium for Heatpump vs. Conventional Equipment",
    },
    // Section 18 Parallel Coordinates - Optimization Buttons
    s18_decarbonize: {
      cell: "S18",
      title: "Decarbonize",
      message:
        "Eliminate Scope 1 Emissions (on-site fuel combustion) by switching fossil fuel systems for Service Hot Water (SHW) and Space Heat to Heat pumps._x000a__x000a_SHW → Heatpump 300%, Heating → Heatpump HSPF 12.5",
    },
    s18_optimize: {
      cell: "S18",
      title: "Optimize",
      message:
        "Apply balanced cost/performance optimization with moderate efficiency improvements. Improves envelope, ventilation, and system efficiencies to practical high-performance levels. Will not remove or 'Decarbonize' any existing fossil-fuel burning equipment, but will upgrade systems if they are gas or are already electrified._x000a__x000a_SHW 300%, DWHR 50%, Heating HSPF 12.5 (if Heatpump) or AFUE 98% (if Gas), MVHR 85%, TB 20%, nGains 60%, ACH50 1.00",
    },
    s18_super_optimize: {
      cell: "S18",
      title: "Super Optimize",
      message:
        "Apply aggressive multi-objective optimization with high efficiency improvements. Pushes Ventilation, and System Efficiencies to near-maximum practical levels._x000a__x000a_SHW 400%, DWHR 70%, Heating HSPF 15 or AFUE 98%, MVHR 95%, TB 10%, nGains PHPP, ACH50 0.60",
    },
    s18_passivhaus: {
      cell: "S18",
      title: "PassivHaus-ify",
      message:
        "Apply PassivHaus-level optimization targeting PER ≤ 120 kWh/m²/yr (may not be met w/o RSI increases). Applies maximum efficiency equipment improvements with low 5% thermal bridge penalty. Future enhancement: loop to arrive at PER targeting._x000a__x000a_SHW 400%, DWHR 70%, Heating HSPF 15 or AFUE 98%, MVHR 95%, TB 5%, nGains PHPP-method, ACH50 0.60",
    },
  };
  // End of VALIDATION_TOOLTIPS

  class TooltipManager {
    constructor() {
      this.tooltips = VALIDATION_TOOLTIPS;
      this.initialized = true;
      this.enabled = localStorage.getItem("tooltipsEnabled") !== "false"; // Default to enabled
    }

    /**
     * Get tooltip data for a specific field
     * @param {string} fieldId - Field ID (e.g., "d_12", "h_14")
     * @returns {object|null} Tooltip data or null if not found
     */
    getTooltip(fieldId) {
      return this.tooltips?.[fieldId] || null;
    }

    /**
     * Apply tooltip to an HTML element
     * @param {HTMLElement} element - The input/select/button element
     * @param {string} fieldId - Field ID to look up tooltip
     * @param {object|boolean} config - True to use JSON data, or custom tooltip object
     */
    applyTooltip(element, fieldId, config = true) {
      if (!element) {
        console.warn(
          `[TooltipManager] No element provided for field: ${fieldId}`
        );
        return;
      }

      let tooltipData;

      // Use custom tooltip or load from JSON
      if (config === true) {
        tooltipData = this.getTooltip(fieldId);
      } else if (typeof config === "object" && config !== null) {
        tooltipData = config;
      }

      if (!tooltipData) {
        return;
      }

      // Clean Excel newlines (_x000a_ → <br>)
      const cleanMessage = (tooltipData.message || "")
        .replace(/_x000a_/g, "<br>")
        .trim();

      if (!cleanMessage) {
        console.warn(
          `[TooltipManager] Empty tooltip message for field: ${fieldId}`
        );
        return;
      }

      // Apply Bootstrap popover attributes
      element.setAttribute("data-bs-toggle", "popover");
      element.setAttribute("data-bs-trigger", "hover focus");
      element.setAttribute("data-bs-placement", "top");
      element.setAttribute("data-bs-html", "true");
      element.setAttribute("data-bs-title", tooltipData.title || "Info");
      element.setAttribute("data-bs-content", cleanMessage);

      // Initialize Bootstrap popover
      try {
        const popover = new bootstrap.Popover(element, {
          delay: { show: 500, hide: 100 },
          container: "body",
          sanitize: false, // Allow HTML content
        });

        // If tooltips are currently disabled, disable this popover immediately
        if (!this.enabled) {
          popover.disable();
        }
      } catch (error) {
        console.error(
          `[TooltipManager] Error initializing popover for ${fieldId}:`,
          error
        );
      }
    }

    /**
     * Apply tooltips to all fields in a section based on field definitions
     * @param {object} sectionRows - Section row definitions with cells containing fieldId and tooltip properties
     */
    applyTooltipsToSection(sectionRows) {
      if (!this.initialized) {
        console.warn(
          "[TooltipManager] Tooltips not loaded yet. Call loadTooltips() first."
        );
        return;
      }

      let appliedCount = 0;

      Object.entries(sectionRows).forEach(([rowKey, row]) => {
        if (rowKey === "header" || !row.cells) return;

        Object.entries(row.cells).forEach(([colKey, cell]) => {
          if (cell.fieldId && cell.tooltip) {
            // Find the DOM element (fields use data-field-id attribute, not id)
            const element = document.querySelector(
              `[data-field-id="${cell.fieldId}"]`
            );

            if (element) {
              this.applyTooltip(element, cell.fieldId, cell.tooltip);
              appliedCount++;
            }
          }
        });
      });
    }

    /**
     * Initialize all Bootstrap popovers on the page
     * Call this after DOM is fully rendered
     */
    initializeAllPopovers() {
      const popoverTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="popover"]')
      );

      popoverTriggerList.map(popoverTriggerEl => {
        return new bootstrap.Popover(popoverTriggerEl, {
          delay: { show: 500, hide: 100 },
          container: "body",
          sanitize: false,
        });
      });
    }

    /**
     * Enable tooltips globally
     */
    enableTooltips() {
      this.enabled = true;
      localStorage.setItem("tooltipsEnabled", "true");

      // Enable all existing popovers
      document
        .querySelectorAll('[data-bs-toggle="popover"]')
        .forEach(element => {
          const popover = bootstrap.Popover.getInstance(element);
          if (popover) {
            popover.enable();
          }
        });
    }

    /**
     * Disable tooltips globally
     */
    disableTooltips() {
      this.enabled = false;
      localStorage.setItem("tooltipsEnabled", "false");

      // Disable all existing popovers
      document
        .querySelectorAll('[data-bs-toggle="popover"]')
        .forEach(element => {
          const popover = bootstrap.Popover.getInstance(element);
          if (popover) {
            popover.hide();
            popover.disable();
          }
        });
    }

    /**
     * Toggle tooltips on/off
     * @returns {boolean} New state (true = enabled, false = disabled)
     */
    toggleTooltips() {
      if (this.enabled) {
        this.disableTooltips();
      } else {
        this.enableTooltips();
      }
      return this.enabled;
    }

    /**
     * Check if tooltips are currently enabled
     * @returns {boolean}
     */
    isEnabled() {
      return this.enabled;
    }
  }

  // Create and export singleton instance
  window.TEUI = window.TEUI || {};
  window.TEUI.TooltipManager = new TooltipManager();
})(window);
