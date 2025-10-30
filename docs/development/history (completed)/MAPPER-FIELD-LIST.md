# Excel Mapper Field List - Verification Reference

## Section 03 Climate Fields (NEWLY ADDED)

These fields are now imported from Excel instead of requiring separate weather file:

| Excel Cell | Field ID | Description                 | Type     |
| ---------- | -------- | --------------------------- | -------- |
| D19        | d_19     | Province                    | Dropdown |
| H19        | h_19     | City                        | Dropdown |
| H20        | h_20     | Current/Future Weather      | Dropdown |
| H21        | h_21     | Capacitance/Static          | Dropdown |
| I21        | i_21     | Capacitance Slider Position | Number   |
| M19        | m_19     | Days Cooling                | Number   |

## Complete REPORT Sheet Mapping (Target Values)

### Section 02: Building Information

- D12 → d_12 (Major Occupancy)
- D13 → d_13 (Reference Standard)
- D14 → d_14 (Actual/Target Use)
- D15 → d_15 (Carbon Standard)
- H12 → h_12 (Reporting Period)
- H13 → h_13 (Service Life)
- H14 → h_14 (Project Name)
- H15 → h_15 (Conditioned Area)
- H16 → i_16 (Certifier)
- H17 → i_17 (License No)
- L12 → l_12 (Elec Cost)
- L13 → l_13 (Gas Cost)
- L14 → l_14 (Propane Cost)
- L15 → l_15 (Wood Cost)
- L16 → l_16 (Oil Cost)

### Section 03: Climate Calculations ⭐ UPDATED

- D19 → d_19 (Province) ⭐ NEW
- H19 → h_19 (City) ⭐ NEW
- H20 → h_20 (Present/Future Weather)
- H21 → h_21 (Capacitance/Static)
- I21 → i_21 (Capacitance Slider) ⭐ NEW
- M19 → m_19 (Days Cooling)

### Section 04: Actual vs Target Energy

- D27 → d_27 (Actual Elec Use)
- D28 → d_28 (Actual Gas Use)
- D29 → d_29 (Actual Propane Use)
- D30 → d_30 (Actual Oil Use)
- D31 → d_31 (Actual Wood Use)
- L27 → l_27 (Elec Emission Factor)
- L28 → l_28 (Gas Emission Factor)
- L29 → l_29 (Propane Emission Factor)
- L30 → l_30 (Oil Emission Factor)
- L31 → l_31 (Wood Emission Factor)
- H35 → h_35 (PER Factor)

### Section 05: Emissions

- D39 → d_39 (Construction Type)
- I41 → i_41 (Modelled Embodied Carbon A1-3)

### Section 06: Renewable Energy

- D44 → d_44 (Photovoltaics kWh/yr)
- D45 → d_45 (Wind kWh/yr)
- D46 → d_46 (Remove EV Charging kWh/yr)
- I45 → i_45 (WWS Electricity kWh/yr)
- K45 → k_45 (Green Natural Gas m3/yr)
- I46 → i_46 (Other Removals kWh/yr)
- M43 → m_43 (P.5 Exterior/Site/Other Loads kWh)

### Section 07: Water Use

- D49 → d_49 (Water Use Method)
- E49 → e_49 (User Defined Water Use l/pp/day)
- E50 → e_50 (By Engineer DHW kWh/yr)
- D51 → d_51 (DHW Energy Source)
- D52 → d_52 (DHW EF/COP)
- D53 → d_53 (DHW Recovery Eff %)
- K52 → k_52 (SHW AFUE)

### Section 08: Indoor Air Quality

- D56 → d_56 (Radon Bq/m3)
- D57 → d_57 (CO2 ppm)
- D58 → d_58 (TVOC ppm)
- I59 → i_59 (Rel Humidity %)

### Section 09: Occupant Internal Gains

- D63 → d_63 (Occupants)
- G63 → g_63 (Occupied Hrs/Day)
- D64 → d_64 (Occupant Activity)
- D65 → d_65 (Plug Loads W/m2)
- D66 → d_66 (Lighting Loads W/m2)
- D67 → d_67 (Equipment Loads W/m2)
- D68 → d_68 (Elevator Loads)
- G67 → g_67 (Equipment Spec)

### Section 10: Radiant Gains

**Areas:**

- D73 → d_73 (Door Area)
- D74 → d_74 (Window Area North)
- D75 → d_75 (Window Area East)
- D76 → d_76 (Window Area South)
- D77 → d_77 (Window Area West)
- D78 → d_78 (Skylights Area)

**Orientations:**

- E73 → e_73 (Door Orientation)
- E74 → e_74 (Window North Orientation)
- E75 → e_75 (Window East Orientation)
- E76 → e_76 (Window South Orientation)
- E77 → e_77 (Window West Orientation)
- E78 → e_78 (Skylight Orientation)

**SHGCs:**

- F73 → f_73 (Door SHGC)
- F74 → f_74 (Window North SHGC)
- F75 → f_75 (Window East SHGC)
- F76 → f_76 (Window South SHGC)
- F77 → f_77 (Window West SHGC)
- F78 → f_78 (Skylight SHGC)

**Winter Shading %:**

- G73 → g_73 (Door Winter Shading)
- G74 → g_74 (Window North Winter Shading)
- G75 → g_75 (Window East Winter Shading)
- G76 → g_76 (Window South Winter Shading)
- G77 → g_77 (Window West Winter Shading)
- G78 → g_78 (Skylight Winter Shading)

**Summer Shading %:**

- H73 → h_73 (Door Summer Shading)
- H74 → h_74 (Window North Summer Shading)
- H75 → h_75 (Window East Summer Shading)
- H76 → h_76 (Window South Summer Shading)
- H77 → h_77 (Window West Summer Shading)
- H78 → h_78 (Skylight Summer Shading)

**Method:**

- D80 → d_80 (Gains Utilisation Method)

### Section 11: Transmission Losses

- D85 → d_85 (Roof Area)
- F85 → f_85 (Roof RSI)
- D86 → d_86 (Walls AG Area)
- F86 → f_86 (Walls AG RSI)
- D87 → d_87 (Floor Exp Area)
- F87 → f_87 (Floor Exp RSI)
- G88 → g_88 (Window U-value)
- G89 → g_89 (Door U-value)
- G90 → g_90 (Skylight U-value)
- G91 → g_91 (Window U-value 2)
- G92 → g_92 (Door U-value 2)
- G93 → g_93 (Skylight U-value 2)
- D94 → d_94 (Walls BG Area)
- F94 → f_94 (Walls BG RSI)
- D95 → d_95 (Floor Slab Area)
- F95 → f_95 (Floor Slab RSI)
- D96 → d_96 (Interior Floor Area)
- D97 → d_97 (Thermal Bridge Penalty %)

### Section 12: Volume Metrics

- D103 → d_103 (Stories)
- G103 → g_103 (Shielding)
- D105 → d_105 (Total Conditioned Volume)
- D108 → d_108 (NRL50 Target Method)
- G109 → g_109 (Measured ACH50)

### Section 13: Mechanical Loads

- D113 → d_113 (Primary Heating System)
- F113 → f_113 (HSPF)
- J115 → j_115 (AFUE)
- D116 → d_116 (Cooling System)
- D118 → d_118 (HRV/ERV SRE %)
- H118 → g_118 (Ventilation Method)
- L118 → l_118 (ACH)
- D119 → d_119 (Rate Per Person)
- L119 → l_119 (Summer Boost)
- K120 → k_120 (Unoccupied Setback %)

### Section 15: TEUI Summary

- D142 → d_142 (Cost Premium HP)

---

## REFERENCE Sheet Mapping

**All fields above are duplicated with `ref_` prefix for the REFERENCE sheet.**

Example:

- REPORT: D12 → d_12
- REFERENCE: D12 → ref_d_12

The REFERENCE sheet uses identical Excel cell references but stores values in StateManager with the `ref_` prefix for dual-state architecture.

---

## Verification Checklist

### Before Testing Import:

- [ ] Verify all Excel cell references match your Excel template
- [ ] Check that dropdown normalizations match your dropdown option values
- [ ] Confirm field IDs match FieldManager definitions
- [ ] Review percentage field handling (d_52, d_53, d_118, k_120, etc.)

### During Import Testing:

- [ ] Import REPORT sheet → all target fields populate
- [ ] Import REFERENCE sheet → all ref\_ fields populate
- [ ] Province (d_19) and City (h_19) trigger ClimateValues.js correctly
- [ ] No console errors about missing fields
- [ ] Calculator.calculateAll() runs successfully

### Export Testing:

- [ ] Export CSV has 3 rows (headers, target, reference)
- [ ] Re-import exported CSV restores both states
- [ ] Filename format: `TEUIv4011-DualState-{ProjectName}.csv`

---

## Notes for Manual Review

1. **New Fields Added:**

   - d_19 (Province) - Should match ClimateValues.js province codes
   - h_19 (City) - Should match ClimateValues.js city names
   - i_21 (Capacitance slider) - Numeric value

2. **Fields to Double-Check:**

   - All percentage fields (d_52, d_53, d_118, k_120, d_97, d_59)
   - Dropdown normalizations (d_12, d_108, d_39, g_67)
   - Section 10 Radiant Gains (30+ fields in specific pattern)

3. **Reference Sheet:**

   - Completely optional - app works without it
   - If present, uses same cell refs as REPORT
   - All values prefixed with `ref_` in StateManager

4. **Removed Functionality:**
   - ExcelLocationHandler.js (archived)
   - "Load Locations" button (removed from UI)
   - location-excel-input (removed from HTML)
   - Weather data now derived from ClimateValues.js based on d_19/h_19

---

**Last Updated:** 2025-10-02  
**Baseline Commit:** 5a86eb1  
**Status:** Ready for Manual Verification & Testing
