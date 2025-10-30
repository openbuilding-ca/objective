# Tooltip Implementation Status

**Last Updated:** Oct 8, 2025

## Summary

Successfully implemented a comprehensive tooltip system for TEUI 4.0, extracting Excel Data Validation messages and applying them as Bootstrap popovers across the application.

**Total Tooltips Extracted:** 107 from TEUIv3042.xlsx
**Total Tooltips Mapped:** 104 field_ids
**Total Tooltips Applied:** 19 fields (S02: 13, S03: 6)
**Live Deployment:** https://arossti.github.io/OBJECTIVE/

---

## Completed Sections

### ✅ Section 02 - Building Information (100%)

**Status:** Complete & Deployed
**Fields:** 13 tooltips applied
**Branch:** TOOLTIPS
**Commit:** `7a26607` (initial), `ccd6a47` (S03), `ba6efd8` (comprehensive)

**Tooltip Coverage:**

| Field ID | Cell | Title                    | Type        |
| -------- | ---- | ------------------------ | ----------- |
| d_12     | D12  | Major Occupancy          | dropdown    |
| d_13     | D13  | Reference Standards      | dropdown    |
| d_14     | D14  | Select a Method          | dropdown    |
| d_15     | D15  | Carbon Benchmark         | dropdown    |
| d_16     | D16  | S4. Targets              | derived     |
| h_12     | H12  | Year Data Entered        | year_slider |
| h_13     | H13  | Select a period in Years | year_slider |
| h_14     | H14  | Project Name             | editable    |
| h_15     | H15  | Net Conditioned Area     | editable    |
| i_16     | H16  | Certifier                | editable    |
| i_17     | H17  | License or Authorization | editable    |
| l_12     | L12  | Assume $0.13/kwh         | editable    |
| l_13     | L13  | Assume $0.507 (Ontario)  | editable    |

**Plus 5 cost fields:** l_14, l_15, l_16 (energy costs)

---

### ✅ Section 03 - Climate (100%)

**Status:** Complete & Deployed
**Fields:** 6 tooltips applied
**Branch:** TOOLTIPS
**Commit:** `ccd6a47`

**Tooltip Coverage:**

| Field ID | Cell | Title                       | Type              |
| -------- | ---- | --------------------------- | ----------------- |
| d_19     | D19  | Select a Province           | dropdown          |
| h_19     | H19  | Municipality                | dropdown          |
| m_19     | M19  | Cooling Days are Increasing | editable          |
| h_20     | H20  | Weather Data Range          | dropdown          |
| h_21     | H21  | Select Calculation Method   | dropdown          |
| i_21     | I21  | Capacitance Factor          | percentage_slider |

**Integration:** Added to `onSectionRendered()` callback after `ClimateDataService.ensureAvailable()`

---

## Available Tooltips (Not Yet Applied)

### ⏳ Section 04 - Actual vs Target Energy

**Available Tooltips:** 12 fields

**Energy Use Fields:**

- d_27 (D27) - Electricity
- d_28 (D28) - Gas
- d_29 (D29) - Propane
- d_30 (D30) - Oil
- d_31 (D31) - Wood
- d_32 (D32) - Biomass Guidance

**Additional Climate:**

- l_20 (L20) - Cooling Season Mean Overnight °C
- l_21 (L21) - Cooling Outdoor Mean RH%
- l_22 (L22) - Elevation ASL in metres
- l_23 (L23) - Cooling Guidance
- l_24 (L24) - Cooling Guidance
- h_24 (H24) - Cooling Guidance
- d_25 (D25) - Cooling Guidance

**Emission Factors:**

- l_33 (L33) - High Level Nuclear Waste
- h_35 (H35) - PER Factors

**Status:** Need to add `tooltip: true` flags to Section 04 field definitions

---

### ⏳ Section 05 - Emissions

**Available Tooltips:** 2 fields

- d_39 (D39) - Building Typology
- i_41 (I41) - Externally Defined Value

**Status:** Need to add `tooltip: true` flags to Section 05 field definitions

---

### ⏳ Section 06 - Renewable Energy

**Available Tooltips:** 1 field

- m_43 (M43) - Default is 0 (Exterior/Site/Other Loads)

**Status:** Need to add `tooltip: true` flags to Section 06 field definitions

---

### ⏳ Section 07 - Water Use

**Available Tooltips:** 12 fields

**Water Use Method:**

- d_49 (D49) - DHW/SHW Use Method (lpppd)
- e_49 (E49) - Litres/Per-Person/Day
- f_49 (F49) - Litres/Per-Person/Day
- h_49 (H49) - Enter Percapita Metered Use
- e_50 (E50) - Occupancy-Dependent Calculation
- f_50 (F50) - Litres/Per-Person/Day

**DHW Equipment:**

- d_51 (D51) - DHW/SHW Heating Source
- d_52 (D52) - If Heatpump Selected
- d_53 (D53) - Range of DWHR Efficiency
- d_54 (D54) - Enter Percapita Metered Use

**Gas Exhaust:**

- e_54 (E54) - Gas Exhaust Energy
- g_54 (G54) - Gas Exhaust Energy
- h_54 (H54) - Gas Exhaust Energy
- l_54 (L54) - Gas Exhaust Energy

**Additional:**

- d_59 (D59) - RH% Annual Average
- i_59 (I59) - RH% Annual Average
- d_60 (D60) - Biomass Guidance

**Status:** Need to add `tooltip: true` flags to Section 07 field definitions

---

### ⏳ Section 08+ - Building Envelope & Advanced

**Available Tooltips:** 50+ fields

**Occupancy (S08?):**

- d_63 (D63) - Occupants
- g_63 (G63) - Occupied Hours
- d_64 (D64) - Average Daily Metabolic Rate
- d_65 (D65) - Default determined by Occupancy
- d_66 (D66) - Default is 1.5
- d_67 (D67) - Default Determined by Occupancy
- g_67 (G67) - Efficient or Regular Energy Spec
- d_68 (D68) - Include Elevator Load

**Solar Gains (Glazing):**

- e_73-78 (E73-E78) - Select an Orientation (6 orientations)
- f_73-78 (F73-F78) - Solar Heat Gain Coefficient (6 orientations)

**Thermal Mass:**

- d_80 (D80) - A Note on Methods (NRC vs PHPP)
- g_80 (G80) - A Note on Methods
- d_81 (D81) - Cooling Guidance
- m_72 (M72) - Gains Factor Derivation
- o_84 (O84) - Thermal Phase Lag

**Building Construction:**

- d_96 (D96) - B.11 Interior Floors
- d_97 (D97) - TB Penalty
- j_98 (J98) - Total Excludes B.12 TB Penalty
- l_98 (L98) - Total Excludes B.12 TB Penalty

**Envelope Details:**

- d_103 (D103) - Select Stories
- j_104 (J104) - Checksum
- l_104 (L104) - Total Excludes B.12 TB Penalty
- d_105 (D105) - Conditioned Volume

**Airtightness:**

- d_108 (D108) - A.2 NRL50 \* Ae
- g_109 (G109) - Calculation Dependency
- h_109 (H109) - Calculation Dependency
- g_110 (G110) - n-Factor Description
- j_110 (J110) - Climate Zone per n-Factor Table

**Mechanical Systems:**

- d_113 (D113) - Select Primary Heating System
- f_113 (F113) - HSPF Dictates COP, CEER
- d_116 (D116) - Cooling Provided?
- d_118 (D118) - Typ. Range 50-90%

**Ventilation:**

- g_118 (G118) - Select Ventilation Method
- l_118 (L118) - ACH Value
- d_119 (D119) - Ventilation Guidance
- l_119 (L119) - Ventilation Boost Rate
- k_120 (K120) - Unoccupied Ventilation Setback %

**Other:**

- m_124 (M124) - Negative Values (cooling days)
- m_141 (M141) - Assume $0.122 (Ontario)

**Status:** Need to identify which section files these belong to and add flags

---

## Architecture

### Centralized Tooltip Management

**Data Source:** [4011-TooltipManager.js](../4011-TooltipManager.js)
**Pattern:** Single Source of Truth

```
Excel REPORT Sheet (Data Validation)
    ↓ (extract-validation.py --comprehensive)
validation-tooltips.json (107 tooltips)
    ↓ (convert-tooltips-to-js.py)
4011-TooltipManager.js → VALIDATION_TOOLTIPS object (104 mapped)
    ↓ (automatic lookup)
Section files (tooltip: true flags only)
    ↓ (applyTooltipsToSection)
Bootstrap Popovers on hover
```

### Benefits of Centralized Architecture

✅ Single source of truth for all tooltip data
✅ Easy to regenerate from Excel
✅ No duplication across section files
✅ Consistent behavior app-wide
✅ Simple flag-based integration (`tooltip: true`)

---

## Extraction Tools

### Main Script: `extract-validation.py`

**Purpose:** Extract Data Validation input messages from Excel REPORT sheet

**Usage:**

```bash
# Default mode - extract predefined mapped cells
python3 extract-validation.py "/path/to/TEUIv3042.xlsx"

# Comprehensive mode - scan ALL cells in rows 12-145
python3 extract-validation.py "/path/to/TEUIv3042.xlsx" --comprehensive
```

**Output:** `OBJECTIVE 4011RF/data/validation-tooltips.json`

**Last Run:** Oct 8, 2025 (comprehensive mode)
**Result:** 107 tooltips found, 104 mapped to field_ids

### Converter Script: `convert-tooltips-to-js.py`

**Purpose:** Convert JSON tooltips to JavaScript object format with field_id keys

**Usage:**

```bash
python3 convert-tooltips-to-js.py "OBJECTIVE 4011RF/data/validation-tooltips.json"
```

**Output:** JavaScript object ready to paste into TooltipManager.js

**Features:**

- Maps cell references to field_ids automatically
- Separates mapped vs unmapped tooltips
- Outputs sorted by field_id for easy maintenance

---

## Integration Pattern

### Step 1: Add tooltip flag to field definition

```javascript
// In sections/4012-SectionXX.js
d: {
  fieldId: "d_27",
  type: "editable",
  value: 0,
  section: "energyUse",
  tooltip: true,  // ✅ Add this flag
},
```

### Step 2: Add TooltipManager call to onSectionRendered()

```javascript
function onSectionRendered() {
  // ... existing initialization ...

  // Apply validation tooltips to fields
  if (window.TEUI.TooltipManager && window.TEUI.TooltipManager.initialized) {
    setTimeout(() => {
      window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
    }, 300);
  }
}
```

**That's it!** TooltipManager automatically finds tooltip data and applies Bootstrap popovers.

---

## Testing Checklist

When adding tooltips to a new section:

- [ ] Verify tooltips exist in `4011-TooltipManager.js`
- [ ] Add `tooltip: true` to field definitions
- [ ] Add `applyTooltipsToSection()` call to `onSectionRendered()`
- [ ] Test in browser - hover over fields
- [ ] Check console for any errors
- [ ] Verify tooltip content matches Excel
- [ ] Test on mobile (touch to show tooltip)
- [ ] Commit changes to TOOLTIPS branch
- [ ] Deploy to gh-pages (optional - can batch deploys)

---

## Deployment History

| Date  | Commit    | Description                          | Tooltips Added |
| ----- | --------- | ------------------------------------ | -------------- |
| Oct 8 | `7a26607` | Initial S02 tooltips                 | 13 (S02)       |
| Oct 8 | `ccd6a47` | Add S03 tooltips + expand extraction | 6 (S03)        |
| Oct 8 | `ba6efd8` | Comprehensive tooltip harvest        | 85 (data only) |

**Current Branch:** TOOLTIPS
**Live Site:** https://arossti.github.io/OBJECTIVE/

---

## Next Steps

### Priority 1: Complete S04-S07

Add `tooltip: true` flags to remaining sections with available tooltips:

1. **S04 - Energy** (12 tooltips available)
2. **S07 - Water** (12 tooltips available)
3. **S05 - Emissions** (2 tooltips available)
4. **S06 - Renewable** (1 tooltip available)

### Priority 2: Identify S08+ Fields

Map remaining 50+ tooltips to their section files:

- Building envelope fields
- Solar gain/glazing fields
- Thermal mass fields
- Mechanical system fields
- Ventilation fields

### Priority 3: Add Help Toggle

Implement optional Help mode toggle in top button row to show/hide all tooltips globally.

---

## Files Modified

**Core System:**

- `4011-TooltipManager.js` - Central tooltip repository (104 tooltips)
- `index.html` - Added TooltipManager script tag

**Section Files:**

- `sections/4012-Section02.js` - Added 13 tooltip flags + integration
- `sections/4012-Section03.js` - Added 6 tooltip flags + integration

**Extraction Tools:**

- `extract-validation.py` - Main extraction script (supports --comprehensive)
- `extract-validation-section02.py` - Section-specific scanner (deprecated)
- `convert-tooltips-to-js.py` - JSON to JavaScript converter

**Documentation:**

- `documentation/TOOLTIP-IMPLEMENTATION-GUIDE.md` - Complete guide
- `documentation/TOOLTIP-SYSTEM.md` - Technical documentation
- `documentation/TOOLTIP-QUICKSTART.md` - Quick start guide
- `documentation/TOOLTIP-INTEGRATION.md` - Field definition patterns
- `documentation/SECTION02-TOOLTIPS.md` - S02 implementation summary
- `documentation/TOOLTIP-STATUS.md` - This file (status tracker)

**Data Files:**

- `data/validation-tooltips.json` - Comprehensive tooltip data (107 tooltips)
- `data/section02-validation-tooltips.json` - S02-specific data (deprecated)

---

## Git Branch Structure

```
main
  └─ TOOLTIPS (current work)
       ├─ 7a26607 - S02 tooltips initial
       ├─ ccd6a47 - S03 tooltips + extraction expansion
       └─ ba6efd8 - Comprehensive tooltip harvest (104 tooltips)
```

**Branch Status:** Active development on TOOLTIPS
**Ready to Merge:** No (incomplete - only S02/S03 done)
**Target:** Complete S04-S07 before merging to main

---

**Document Status:** Current as of Oct 8, 2025
**Maintained By:** Tooltip system implementation team
**Next Update:** After S04 completion
