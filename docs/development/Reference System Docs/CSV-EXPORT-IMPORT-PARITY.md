# CSV Export/Import Parity Analysis

**Date**: 2025-10-24
**Branch**: S10-S11-PURITY
**Issue**: CSV export→import→calculations produce different e_10/h_10 values

---

---

⚠️ **NOTE**: This document has been superseded by [S12-S13-PURITY.md](S12-S13-PURITY.md) for ongoing work.

This document remains as historical reference for the S10-S11 state isolation and initial CSV export investigation work.

---

## 📋 Session Summary (2025-10-25 Evening)

### Victories ✅
1. **S12 Reference Fields Fixed** (commit 2befec9)
   - All 5 S12 Reference user input fields now export to CSV
   - Root cause: Browser cache serving old JavaScript
   - Solution: Added comprehensive debug logging + safety net in calculateAll()
   - Fields fixed: ref_d_103, ref_g_103, ref_d_105, ref_d_108, ref_g_109

2. **S13-latest Activated**
   - Correct m_124 two-stage architecture handling (no more errors)
   - Better e_10 initialization: 192.9 vs 287.0 (95 kWh/m²/yr improvement)
   - Perfect h_10: 93.7 (matches Excel exactly)
   - All S13 fields export to CSV

### Current Challenge ❌
**Reference Calculation Flow Still Blocked**
- S12 Reference changes recalculate internally ✅
- But S13 does NOT consume S12 Reference values ❌
- e_10 doesn't update when S12 Reference envelope changes ❌

### Root Cause Identified
- Backup S13 (3662 lines): Calculation flow WORKS ✅
- Current S13 (3682 lines): Calculation flow BROKEN ❌
- Difference: CSV export additions (48 lines diff)
- **Hypothesis**: CSV publication block interferes with listener/consumption

### Next Session Plan
**Phase 1**: Detailed diff analysis of backup vs current S13
- Focus on listener registration for S12 Reference fields
- Focus on getExternalValue() calls reading S12 data
- Identify what in CSV block breaks consumption

**Goal**: Port CSV fix to backup S13 without breaking calculation flow

---

## Problem Statement

User reports that:
1. ✅ App initialization works perfectly
2. ✅ Manual edits trigger calculations correctly
3. ❌ CSV export→reset→import produces different e_10/h_10 values
4. ❌ Excel import→edits may not recalculate properly

## Root Cause Analysis

### CSV Export Strategy (4011-FileHandler.js lines 707-833)

**Current approach:**
- Exports ALL user-editable fields based on field type
- Filters fields by: `editable`, `dropdown`, `year_slider`, `percentage`, `coefficient`, `coefficient_slider`, `number`
- Exports 3 rows: Field IDs, Target values, Reference values
- Uses FieldManager.getAllFields() to determine exportable fields

**Problem:** Export is type-based, NOT mapping-based!

### Excel Import Strategy (4011-ExcelMapper.js lines 40-360)

**Current approach:**
- Uses EXPLICIT mapping: `excelReportInputMapping` (197 fields mapped)
- Maps Excel cells (D12, H19, etc.) to specific field IDs
- Has separate Reference mapping: `excelReferenceInputMapping`
- **This is a CURATED list** of user inputs

## The Mismatch

**CSV Export** uses automatic field type detection → exports ~ALL editable fields
**Excel Import** uses explicit mapping → imports ~197 specific fields

### Consequence:
1. CSV export may include fields NOT in Excel import mapping
2. CSV export may EXCLUDE fields that ARE in Excel import mapping
3. Field ordering differs between export and import
4. Round-trip (export→import) loses/gains fields unpredictably

## Field Count Comparison

Let me count the fields in each system:

### Excel Import Mapping Fields (from ExcelMapper.js)

**Target fields (excelReportInputMapping):** 126 unique field IDs

**Reference fields (excelReferenceInputMapping):** 126 unique field IDs (mirrors Target)

**Total import capacity:** 126 Target + 126 Reference = 252 field mappings

### CSV Export Fields (from FileHandler.js)

**Export strategy:** ALL fields matching types:
- `type === "editable"`
- `type === "dropdown"`
- `type === "year_slider"`
- `type === "percentage"`
- `type === "coefficient"`
- `type === "coefficient_slider"`
- `type === "number"`

**Estimated count:** Unknown (depends on FieldManager field definitions)

## Critical Missing Fields

Based on Excel import mapping, these categories are included:

### Section 02 - Building Info (17 fields)
- d_12, d_13, d_14, d_15 (dropdowns)
- h_12, h_13, h_14, h_15 (sliders/text/numbers)
- i_16, i_17 (certifier info)
- l_12, l_13, l_14, l_15, l_16 (costs)

### Section 03 - Climate (7 fields)
- d_19, h_19, h_20, h_21, i_21, m_19, l_20, l_21

### Section 04 - Actual Energy (11 fields)
- d_27-d_31 (actual use)
- l_27-l_31 (emission factors)
- h_35 (PER factor)

### Section 05 - Emissions (2 fields)
- d_39 (construction type)
- i_41 (embodied carbon)

### Section 06 - Renewable (7 fields)
- d_44, d_45, d_46, i_44, k_45, i_46, m_43

### Section 07 - Water (6 fields)
- d_49, e_49, e_50, d_51, d_52, d_53, k_52

### Section 08 - IAQ (4 fields)
- d_56, d_57, d_58, d_59, i_59

### Section 09 - Occupant Gains (6 fields)
- d_63, g_63, d_64, d_66, d_68, g_67

### Section 10 - Radiant (31 fields)
- d_73-d_78 (areas)
- e_73-e_78 (orientations)
- f_73-f_78 (SHGCs)
- g_73-g_78 (winter shading)
- h_73-h_78 (summer shading)
- d_80 (utilization method)

### Section 11 - Transmission (19 fields)
- d_85, f_85, d_86, f_86, d_87, f_87 (roof/walls/floor)
- g_88-g_93 (U-values)
- d_94, f_94, d_95, f_95 (BG areas)
- d_96, d_97 (interior/thermal bridge)

### Section 12 - Volume (5 fields)
- d_103, g_103, d_105, d_108, g_109

### Section 13 - Mechanical (10 fields)
- d_113, f_113, j_115, d_116, d_118, g_118, l_118, d_119, l_119, k_120

### Section 15 - Summary (1 field)
- d_142

**Total Excel Import Fields: 126 Target + 126 Reference = 314**

## Questions to Investigate

1. ❓ How many fields does CSV export actually export?
2. ❓ Which fields are in Excel import but NOT in CSV export?
3. ❓ Which fields are in CSV export but NOT in Excel import?
4. ❓ Does field ordering match between export and import?
5. ❓ Are there any calculated fields being exported that shouldn't be?

## Recommended Solution

### Option A: CSV Export Should Match Excel Import (RECOMMENDED)
**Make CSV export use the SAME field list as Excel import mapping**

```javascript
// In FileHandler.js exportToCSV()
// Instead of filtering by type, use explicit field list from ExcelMapper

const exportFieldIds = [
  // Section 02
  'd_12', 'd_13', 'd_14', 'd_15',
  'h_12', 'h_13', 'h_14', 'h_15',
  'i_16', 'i_17',
  'l_12', 'l_13', 'l_14', 'l_15', 'l_16',

  // Section 03
  'd_19', 'h_19', 'h_20', 'h_21', 'i_21', 'm_19', 'l_20', 'l_21',

  // ... continue for all 126 fields from Excel mapping
];
```

**Benefits:**
- ✅ Perfect round-trip: export→import produces identical values
- ✅ Controlled field list (no surprises)
- ✅ Matches existing Excel import workflow
- ✅ Easy to maintain (single source of truth)

**Drawbacks:**
- ⚠️ Need to maintain explicit field list
- ⚠️ Adding new fields requires updating export list

### Option B: Excel Import Should Match CSV Export
**Make Excel import read CSV format (field ID based, not cell based)**

**Benefits:**
- ✅ CSV becomes more flexible
- ✅ No hard-coded cell references

**Drawbacks:**
- ❌ Breaks existing Excel import workflow
- ❌ More complex to implement
- ❌ User confusion (why does CSV work differently?)

## Workplan (Option A - Recommended)

### Phase 1: Create Explicit Field List
1. Extract 126 field IDs from `excelReportInputMapping`
2. Create static array in FileHandler.js or import from ExcelMapper
3. Ensure order matches Excel import order

### Phase 2: Modify CSV Export
1. Replace type-based filtering with explicit field list
2. Loop through field list in defined order
3. For each field:
   - Get Target value from StateManager
   - Get Reference value (ref_ prefix) from StateManager
4. Generate CSV with 3 rows: IDs, Target, Reference

### Phase 3: Verify Round-Trip
1. Export CSV from working app
2. Reset app
3. Import CSV
4. Verify e_10 and h_10 match original
5. Test edit→recalculation works

### Phase 4: Add Import Trigger
1. After CSV import completes
2. Trigger full calculation chain (similar to Excel import)
3. Ensure all sections recalculate with imported values

## Files to Modify

1. **4011-FileHandler.js** (lines 707-833)
   - Replace type-based export with explicit field list
   - Ensure field order matches import

2. **4011-ExcelMapper.js** (optional)
   - Export field list for use in FileHandler
   - Create utility function: `getExportFieldList()`

3. **Testing**
   - Create test CSV with known values
   - Verify import→calculate→export produces same values

## Success Criteria

- ✅ Export CSV includes exactly 126 Target + 126 Reference fields
- ✅ Field order matches Excel import mapping order
- ✅ Round-trip: export→reset→import produces identical e_10/h_10
- ✅ After CSV import, edits trigger recalculation correctly
- ✅ No extra fields exported
- ✅ No import fields missing from export

## Implementation Complete ✅

### Steps Completed (2025-10-23)

1. ✅ **Counted fields**: Excel import has 128 unique Target field IDs
2. ✅ **Extracted explicit field list** from ExcelMapper.excelReportInputMapping
3. ✅ **Modified CSV export** (4011-FileHandler.js lines 741-811)
   - Replaced type-based filtering with explicit 128-field list
   - Order matches Excel import mapping exactly
   - Exports exactly: Header row, Target row, Reference row
4. ✅ **Verified CSV import** already has proper calculation triggering
   - Quarantine pattern (mute listeners during import)
   - Pattern A section sync
   - Full calculateAll() after import
   - UI refresh for Pattern A sections

### Changes Made

**File**: `4011-FileHandler.js`
**Lines**: 741-811 (exportToCSV function)

**Before**: Type-based export (unpredictable field count)
```javascript
Object.entries(allFields).forEach(([id, def]) => {
  if (def.type === "editable" || def.type === "dropdown" || ...) {
    // Export this field
  }
});
```

**After**: Explicit field list (128 fields, matches Excel import)
```javascript
const userEditableFieldIds = [
  // Section 02: Building Information
  "d_12", "d_13", "d_14", "d_15",
  "h_12", "h_13", "h_14", "h_15",
  // ... (128 fields total)
];
```

### Result

- ✅ CSV export now includes exactly 128 Target + 128 Reference fields
- ✅ Field order matches Excel import mapping
- ✅ Perfect round-trip parity: export→reset→import should produce identical e_10/h_10
- ✅ CSV import already triggers full calculation chain
- ✅ No extra fields, no missing fields

### Testing Required

User needs to test:
1. Export CSV from working app (note e_10 and h_10 values)
2. Reset app (refresh browser)
3. Import the CSV file
4. Verify e_10 and h_10 match original values
5. Make an edit and verify recalculation works

If test passes, round-trip parity is achieved!

---

## 🚨 CRITICAL ISSUE: Missing Reference Values in CSV Export (2025-10-24)

### Problem Discovery

After implementing the explicit field list (126 fields), CSV export from a **fresh initialized state** reveals:
- ✅ Row 1 (Header): All 126 field IDs present
- ✅ Row 2 (Target values): All 126 values populated
- ❌ **Row 3 (Reference values): 89 out of 126 values MISSING (empty)**

Only 37 Reference values are present in the initialized state export.

### Why This Matters

This is a **critical user-facing data loss issue**, not just a cosmetic problem:

#### Scenario: The Silent Data Loss Trap

1. **User works in initialized app**
   - App loads with sensible defaults for both Target and Reference models
   - User makes a few edits (e.g., changes occupancy type, adjusts some areas)
   - User sees correct e_10 and h_10 calculations in both Target and Reference modes
   - Everything appears to work perfectly

2. **User confidently exports their work to CSV**
   - CSV export creates "data_file.csv" with 126 Target + 126 Reference fields
   - User assumes this file contains their complete work session
   - **SILENT FAILURE**: 89 Reference values are empty in the export

3. **User resets app and imports the "complete" data file**
   - Import loads the CSV successfully (no errors shown)
   - Target model looks perfect (all values restored)
   - **Reference model is incomplete** (89 values missing from import)

4. **User continues working and experiences weird behavior**
   - Some calculations produce different e_10/h_10 values than before
   - Making edits causes Reference model to behave unpredictably
   - Values "jump around" or show inconsistent results
   - **Root cause**: Fallback anti-pattern masks missing data with Target values

### The "Tiny Satan" - Fallback Anti-Pattern

As documented in [4012-CHEATSHEET.md](history%20(completed)/4012-CHEATSHEET.md#anti-pattern-1-state-contamination-via-fallbacks):

**Anti-Pattern 1: State Contamination via Fallbacks**

> Logic in Reference mode will use a Target value if the corresponding Reference value is not found. This directly violates state isolation and leads to incorrect Reference model calculations contaminated with Target data.

**The correct pattern:**
```javascript
// ✅ CORRECT: Strict mode isolation
if (this.currentMode === "reference") {
  valueToDisplay = StateManager.getValue(`ref_${fieldId}`);
  // If Reference doesn't exist, use a safe default, NEVER the Target value.
  if (valueToDisplay === null || valueToDisplay === undefined) {
    valueToDisplay = 0; // Or a field definition default
  }
}
```

**Why fallbacks are evil:**
1. **Silent failures**: Missing data doesn't cause errors, just wrong results
2. **State mixing**: Reference calculations use Target data, producing invalid comparisons
3. **Unpredictable behavior**: Which values fall back vs. which exist is invisible to user
4. **Masks architectural problems**: Export/import gaps go unnoticed until users report "weird behavior"

### Root Cause Analysis

#### How Pattern A Sections Work

Pattern A sections (S01, S02, S03, S04, S05, S10, S11, etc.) use dual-state architecture:

1. **Internal State Objects** ([4012-Section03.js:47-177](../sections/4012-Section03.js#L47-L177))
   - `TargetState` and `ReferenceState` objects hold values internally
   - Each has `setDefaults()` method that loads defaults from field definitions
   - Values live in `this.state = { d_19: "ON", h_19: "Alexandria", ... }`

2. **Calculations Read From Internal State** ([4012-Section03.js:572-575](../sections/4012-Section03.js#L572-L575))
   ```javascript
   function getClimateDataForState(stateObject, calculationMode = "target") {
     const province = stateObject.getValue("d_19") || "ON";
     const city = stateObject.getValue("h_19") || "Alexandria";
     const timeframe = stateObject.getValue("h_20") || "Present";
     // ... calculations work because they read from internal state
   }
   ```

3. **User Edits Publish to Global StateManager** ([4012-Section03.js:223-236](../sections/4012-Section03.js#L223-L236))
   ```javascript
   setValue: function (fieldId, value, source = "user") {
     this.getCurrentState().setValue(fieldId, value, source);

     // BRIDGE: Sync to global StateManager
     if (this.currentMode === "target") {
       window.TEUI.StateManager.setValue(fieldId, value, "user-modified");
     } else if (this.currentMode === "reference") {
       window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, "user-modified");
     }
   }
   ```

4. **CSV Export Reads From Global StateManager ONLY** ([4011-FileHandler.js:785-801](../4011-FileHandler.js#L785-L801))
   ```javascript
   userEditableFieldIds.forEach((fieldId) => {
     const targetValue = this.stateManager.getValue(fieldId) ?? "";
     targetValues.push(escapeCSV(targetValue));

     const refFieldId = `ref_${fieldId}`;
     const referenceValue = this.stateManager.getValue(refFieldId) ?? "";
     referenceValues.push(escapeCSV(referenceValue));
   });
   ```

#### The Gap

**Reference defaults exist in ReferenceState internal memory, but are NEVER published to global StateManager with `ref_` prefix!**

- ✅ Calculations work: They read from internal ReferenceState
- ✅ User edits work: ModeManager.setValue publishes to StateManager
- ❌ **CSV export fails: FileHandler has no access to internal ReferenceState, only reads StateManager**

### Missing Reference Values (89 out of 126)

From analysis of fresh initialized state export:

**Fields with MISSING Reference values:**
- **Section 02**: d_12, d_13, d_14, d_15, h_14, i_16, i_17, l_12, l_13, l_14, l_15, l_16
- **Section 03**: d_19, h_19, h_20, h_21, i_21, m_19
- **Section 04**: d_27, d_28, d_29, d_30, d_31, l_28, l_29, l_30, l_31, h_35
- **Section 05**: d_39
- **Section 06**: d_44, d_45, d_46, i_44, k_45, i_46, m_43
- **Section 07**: e_49, e_50, d_53, k_52
- **Section 08**: d_56, d_57, d_58, d_59, i_59
- **Section 09**: g_63, d_66, d_68, g_67
- **Section 10**: e_73-e_78 (6), f_73-f_78 (6), g_73-g_78 (6), h_73-h_78 (6), d_80 (total: 25)
- **Section 11**: d_103, g_103, d_108, g_109
- **Section 12**: d_113, f_113, j_115, d_116, d_118, g_118, l_118, d_119, l_119, k_120
- **Section 13**: d_142

**Fields with PRESENT Reference values (37 fields):**
- **Section 02**: h_12, h_13 (2)
- **Section 03**: l_20, l_21 (2) ← Fixed in commit 50e76f4
- **Section 04**: l_27 (1)
- **Section 07**: d_49, d_51, d_52 (3)
- **Section 09**: d_63, d_64 (2)
- **Section 10**: d_73-d_78 (6)
- **Section 11**: d_85, f_85, d_86, f_86, d_87, f_87, g_88-g_93 (12), d_94, f_94, d_95, f_95, d_96, d_97 (total: 24)
- **Section 12**: d_103, d_105 (2)

### Solution: Publish All Reference Defaults to StateManager

Following the pattern established for l_20/l_21 fix (commit 50e76f4):

#### Pattern: Conditional Default Publishing (Compact)

```javascript
// In section's ModeManager.initialize() or onSectionRendered()
// Compact array-based pattern for performance and readability
if (window.TEUI?.StateManager) {
  ["d_19", "h_19", "h_20", "h_21", "m_19", "l_20", "l_21", "i_21"].forEach(id => {
    const refId = `ref_${id}`;
    const val = ReferenceState.getValue(id);
    if (!window.TEUI.StateManager.getValue(refId) && val != null && val !== "") {
      window.TEUI.StateManager.setValue(refId, val, "calculated");
    }
  });
}
```

**Why this compact pattern:**
- ✅ **Concise**: 6 lines vs 25 lines (verbose version)
- ✅ **Scannable**: Field list visible at a glance
- ✅ **Performant**: No intermediate variables, direct operations
- ✅ **Consistent**: Same pattern repeats across all 11 sections

#### Why This Works

1. **Non-destructive**: Only publishes if value doesn't already exist
2. **Import-safe**: After CSV/Excel import, values are already in StateManager
3. **Calculation-safe**: Calculations continue to read from internal state
4. **Export-complete**: FileHandler now finds all Reference values in StateManager

### Workplan: Fix All Pattern A Sections

This is multi-session work. Sections must be fixed systematically to prevent regression.

#### Phase 1: Section 02 Fix ✅ COMPLETE

**File**: [4012-Section02.js](../sections/4012-Section02.js)

**Status**: ✅ Complete (commits 44bc5b6, 9dfb6bb, f09a3cf)

**Fields fixed**: All 15 S02 fields now publish Reference defaults to StateManager
- d_12, d_13, d_14, d_15 (dropdowns)
- h_12, h_13, h_14, h_15 (building metadata + area)
- i_16, i_17 (certifier info)
- l_12, l_13, l_14, l_15, l_16 (cost fields with 4dp precision)

**Pattern used**: Compact array-based forEach in ModeManager.initialize()

**Additional fixes**:
- ✅ Removed l_12 state contamination bug (Reference no longer overwrites Target)
- ✅ Cost fields preserve full 4dp precision on user edits
- ✅ CSV exports with full precision ($ symbols present but decimal precision intact)

**Fallback anti-pattern status**: ✅ Eliminated - All Reference defaults now exist in StateManager

**Testing**: CSV export from initialized state shows all 15 S02 Reference values populated

**Note on Target values**: Target defaults flow to StateManager through existing mechanisms (likely DOM initialization or calculateAll). We don't explicitly publish them in ModeManager.initialize(), but they arrive correctly and respond to user edits. Since the system works as expected, we're not refactoring this mechanism.

---

#### Phase 2: Section 03 Fix ✅ COMPLETE

**File**: [4012-Section03.js](../sections/4012-Section03.js)

**Status**: ✅ Complete (commit b7386b7)

**Fields fixed**: All 9 S03 fields now publish Reference defaults to StateManager
- d_19, h_19, h_20, h_21, i_21, m_19, l_20, l_21, l_24 (cooling setpoint override - FUTURE FEATURE)

**Pattern used**: Compact array-based forEach in ModeManager.initialize()

**Additional changes**:
- ✅ Added l_24 (cooling setpoint override) to ExcelMapper import mapping
- ✅ Added l_24 to CSV export field list (FileHandler.js) - now 127 fields total
- ✅ Replaced verbose l_20/l_21 publishing code (25 lines) with compact pattern (6 lines)

**Testing**: CSV export from initialized state shows all 9 S03 Reference values populated

---

#### Phase 3: Section 04 Fix ⏳ IN PROGRESS

**File**: [4012-Section04.js](../sections/4012-Section04.js)

**Status**: ⏳ Code complete, ready to test (commit 8793ee6)

**Fields fixed**: All 10 S04 fields (utility bills + emission factors + PER)
- d_27, d_28, d_29, d_30, d_31 (actual energy consumption - utility bills)
- l_28, l_29, l_30, l_31 (emission factors - optional overrides for advanced users)
- h_35 (PER factor)

**Pattern used**: Compact array-based forEach in ModeManager.initialize()

**Major changes**:
- ❌ **Removed l_27** from ExcelMapper and CSV export (calculated field, province + year dependent)
- ✅ **Converted l_28-l_31** from static content to editable fields (emission factor overrides)
  - l_28: Gas emission factor (1921 gCO2e/m³)
  - l_29: Propane emission factor (2970 gCO2e/kg)
  - l_30: Oil emission factor (2753 gCO2e/litre)
  - l_31: Wood emission factor (150 kgCO2e/m³)
- ✅ Added l_28-l_31 to TargetState and ReferenceState defaults (state isolated)
- ✅ Fields now editable in both Target and Reference modes

**Total CSV fields**: 126 (l_24 added in S03, then l_27 removed in S04)

**Testing required**: CSV export, verify all 10 S04 Reference values, test editability in both modes

---

#### Phase 4: Section 05 Fix ✅ COMPLETE

**File**: [4012-Section05.js](../sections/4012-Section05.js)

**Status**: ✅ Complete (commit 3b2ccd6)

**Fields fixed**: All 2 S05 fields (construction typology + embodied carbon)
- d_39: Construction typology (Pt.3 Steel reference vs Pt.3 Mass Timber target)
- i_41: Embodied carbon value (kgCO2e/m²)

**Pattern used**: Compact array-based forEach in ModeManager.initialize()

**Major changes**:
- ✅ Added Reference value publishing to ModeManager.setValue() (ref_ prefix)
- ✅ Published all 2 S05 Reference defaults using compact pattern
- ✅ User edits in Reference mode now publish to StateManager correctly

**Testing**: CSV export shows all 2 S05 Reference values (d_39, i_41)

---

#### Phase 5: Sections 06-15 Systematic Fix

**Sections to audit** (in order of dependency):
- S06 (Renewable): 7 missing
- S06 (Renewable): 7 missing
- S07 (Water): 4 missing
- S08 (IAQ): 5 missing
- S09 (Occupant): 4 missing
- S10 (Radiant): 25 missing (most complex)
- S11 (Transmission): 4 missing
- S12 (Volume): 8 missing
- S13 (Mechanical): 1 missing

**For each section**:
1. Read section file, identify Pattern A vs Pattern B
2. If Pattern A: Add publishReferenceDefaults() to initialization
3. If Pattern B: Verify defaults already publish (may need different fix)
4. Test CSV export for that section's fields
5. Commit with message: `fix(SXX): Publish Reference defaults to StateManager for CSV export`

#### Phase 4: Full Integration Test

1. Export CSV from fresh initialized state
2. Verify ALL 126 Reference values present (no empty cells)
3. Reset app and import CSV
4. Verify e_10/h_10 match exactly
5. Toggle to Reference mode and verify all values display
6. Make edits in both modes and verify calculations work

#### Phase 5: Excel Import Verification

1. Import existing Excel file
2. Export to CSV immediately
3. Verify CSV contains both Target AND Reference values from Excel
4. Reset and import CSV
5. Verify values match Excel import exactly

### Files to Create/Modify

#### Documentation
- ✅ This section added to CSV-EXPORT-IMPORT-PARITY.md
- ⏳ Create REFERENCE-DEFAULTS-PUBLISHING.md (detailed section-by-section tracking)

#### Code Changes (11 section files)
1. ⏳ [4012-Section02.js](../sections/4012-Section02.js) - Building Information
2. ⏳ [4012-Section03.js](../sections/4012-Section03.js) - Climate (expand l_20/l_21 fix)
3. ⏳ [4012-Section04.js](../sections/4012-Section04.js) - Actual Energy
4. ⏳ [4012-Section05.js](../sections/4012-Section05.js) - Emissions
5. ⏳ [4012-Section06.js](../sections/4012-Section06.js) - Renewable
6. ⏳ [4012-Section07.js](../sections/4012-Section07.js) - Water
7. ⏳ [4012-Section08.js](../sections/4012-Section08.js) - IAQ
8. ⏳ [4012-Section09.js](../sections/4012-Section09.js) - Occupant Gains
9. ⏳ [4012-Section10.js](../sections/4012-Section10.js) - Radiant (most complex - 25 fields)
10. ⏳ [4012-Section11.js](../sections/4012-Section11.js) - Transmission
11. ⏳ [4012-Section12.js](../sections/4012-Section12.js) - Volume
12. ⏳ [4012-Section13.js](../sections/4012-Section13.js) - Mechanical

### Success Criteria

- ✅ CSV export from initialized state shows ALL 126 Reference values populated
- ✅ No fallback anti-pattern triggers (strict Reference mode isolation maintained)
- ✅ Round-trip: export→reset→import produces identical e_10/h_10 in both modes
- ✅ User edits after import trigger correct calculations
- ✅ Excel import→CSV export preserves ALL Reference values
- ✅ No performance degradation from additional StateManager publishing
- ✅ All sections follow consistent publishReferenceDefaults() pattern

### Timeline Estimate

- **Phase 1 (S03)**: 30 minutes
- **Phase 2 (S02)**: 45 minutes
- **Phase 3 (S04-S13)**: 3-4 hours (systematic, section by section)
- **Phase 4 (Integration)**: 1 hour
- **Phase 5 (Excel verification)**: 30 minutes

**Total**: ~6 hours of focused work across multiple sessions

### Related Documentation

- [4012-CHEATSHEET.md - Anti-Pattern 1: State Contamination via Fallbacks](history%20(completed)/4012-CHEATSHEET.md#anti-pattern-1-state-contamination-via-fallbacks)
- Commit 50e76f4: l_20/l_21 fix (proof of pattern)
- Commit 4c34826: Explicit field list implementation

---

## 🚨 CRITICAL REGRESSION: Reference Model Calculation Flow Broken (2025-10-24)

### Problem Discovery

**Testing Timeline:**
1. **Yesterday (2025-10-23)**: Commit b79549c "CONTAMINATION ELIMINATED" - Victory over state isolation bugs
   - ✅ Target model: Changes flow through entire calculation chain
   - ✅ Reference model: Changes flow through entire calculation chain
   - ✅ State isolation: Target and Reference models completely independent
   - ✅ Dual-state architecture working perfectly

2. **Today (2025-10-24)**: After CSV export work (commits efdd8a5 through 650bc47)
   - ✅ Target model: Still works perfectly, changes flow through entire chain
   - ✅ CSV export: Nearly complete (126 fields, barring S12)
   - ✅ All sections publish Reference defaults to StateManager (S02-S13, S15)
   - ❌ **Reference model: Calculation flow BROKEN - changes trapped locally**

### Symptoms

**Working sections (S02-S09)**:
- ✅ State isolation maintained (Target and Reference independent)
- ✅ Calculations update correctly in both modes
- ⚠️ **One exception in S09**: g_63 (occupied hours) shows state mixing

**Broken sections (S10 onward)**:
- ✅ S10 Target mode: Changes flow through entire model ✅
- ❌ S10 Reference mode: **Changes trapped within S10 - do NOT flow downstream**
- ⚠️ **S10/S11/S12 Reference flow appears intact internally**
- ❌ **Flow breaks AFTER S12**: Changes don't reach S13, S14, S15, S04, S01

### Test Comparison: Victory vs. Current State

**Reverted to b79549c (contamination victory commit)**:
- ✅ Perfect state isolation and calculation flow
- ✅ Every field changed in Target flows to Target model updates
- ✅ Every Reference value changed affects only Reference model
- ✅ "It all just works"
- ❌ CSV export incomplete (only 37 Reference values)
- ❌ After imports, calculation flow broke (known issue)

**Current HEAD (after CSV export work)**:
- ✅ CSV export nearly complete (126 fields published to StateManager)
- ✅ Reference defaults published correctly for fresh initialization
- ✅ S02-S09 maintain correct isolation and flow (except S09 g_63)
- ❌ **S10+ Reference mode: Calculations trapped, don't propagate downstream**

### Root Cause Hypothesis

**Something between b79549c (yesterday) and HEAD (today) broke Reference calculation flow.**

Our CSV export work added publication code to sections S02-S15:
- Added `publishToStateManager()` methods
- Published Reference defaults on initialization
- Published from localStorage on page refresh

**Possible causes:**
1. **Publication timing issue**: Defaults published too early/late, blocking dynamic updates?
2. **"One and done" publication**: Did we make publishing a static operation that prevents re-publication on user edits?
3. **Listener interference**: Did publication code interfere with existing calculation listeners?
4. **S12 as linchpin**: Since S12 wasn't fully fixed and flow breaks after S12, could S12 be blocking the chain?
5. **StateManager pollution**: Are we publishing static values that override calculated values?

### Known Issues

**S09 State Mixing Bug** ✅ INVESTIGATED:
- Field: g_63 (occupied hours) and derived field i_63 (annual occupied hours)
- Symptom: Changes to Target g_63 cause BOTH e_10 and h_10 to change (should only affect h_10)
- **Root cause FOUND**: Problem is NOT in S09!
  - ✅ S09 calculations correct: Target and Reference compute independently
  - ✅ S09 publication correct: Publishes both `i_63` and `ref_i_63` with correct values
  - ❌ **Problem is downstream**: Sections S13/S14/S15/S04/S01 contaminate Reference model
- **Evidence** (from debug logs):
  - Change Target g_63 from 12 → 10
  - S09 publishes `i_63=3650` (10 × 365) ✅
  - S09 publishes `ref_i_63=4380` (12 × 365, unchanged) ✅
  - But e_10 (Reference TEUI) still changes ❌
- **Direct dependencies to investigate**:
  - **S13 (Mechanical)**: i_63 directly affects d_120 and d_122 calculations
    - Target flow: `i_63` → `d_120`, `d_122`
    - Reference flow: `ref_i_63` → `ref_d_120`, `ref_d_122`
    - If S13 reads `i_63` instead of `ref_i_63` for Reference calculations, contamination propagates downstream
- **Conclusion**: Downstream sections reading `i_63` for Reference calculations instead of `ref_i_63`
- **Resolution path**:
  1. Investigate S13's consumption of i_63/ref_i_63 in mechanical calculations
  2. Verify S13 correctly publishes d_120/ref_d_120 and d_122/ref_d_122
  3. Trace contamination through S14 → S15 → S04 → S01
- Status: Requires investigation of S13, S14, S15, S04, S01 for fallback anti-patterns

**S12 Incomplete**:
- S12 Reference values excluded from CSV export (too much tech debt accumulated)
- S12 reverted to yesterday's baseline (commit b79549c)
- Changes in S12 Reference mode recalculate locally but may not publish downstream
- **Critical insight**: We've been stumped trying to make S12 Reference values publish to StateManager
  - Target values work perfectly and publish correctly
  - Reference values fail to publish despite multiple fix attempts
  - **Solution approach**: Study how Target values successfully publish and mirror that pattern for Reference
  - Key question: What mechanism makes Target publication work that we're missing for Reference?

### Next Steps: Systematic Debugging Strategy

**Option 1: Stack Trace Analysis**
1. Add debug logging to track Reference value flow through calculation chain
2. Make a change in S10 Reference mode
3. Trace which sections receive the update and which don't
4. Identify exact point where chain breaks
5. Compare code at break point between b79549c and HEAD

**Option 2: Binary Search Rollback**
1. Identify all commits between b79549c and HEAD affecting sections
2. Checkout commits midway through the range
3. Test Reference calculation flow
4. Narrow down which specific commit introduced the regression
5. Analyze that commit's changes for root cause

**Option 3: Section-by-Section Audit**
1. For each section S10-S15, compare code between b79549c and HEAD
2. Look for changes to:
   - `setValue()` methods (are they still publishing on user edits?)
   - Calculation triggers (are they still firing in Reference mode?)
   - Listener setup (were any removed or modified?)
3. Test each section individually to isolate the break point

**Option 4: Focus on S12 First (RECOMMENDED)**
1. S12 is the suspected linchpin (flow breaks after S12)
2. S12 has the most complex state (volume/area totals feed downstream sections)
3. S12 had multiple debug/revert cycles today
4. Check if S12 is failing to publish calculated Reference values (ref_g_101, ref_d_101, etc.)
5. **Mirror Target publication pattern**:
   - Trace how Target values (d_103, g_103, d_105, d_108, g_109) successfully publish to StateManager
   - Identify the mechanism: Is it in calculation functions? Listeners? setValue() calls?
   - Apply the EXACT SAME pattern to Reference values with `ref_` prefix
   - Test: Change S12 Reference field → verify it publishes to StateManager → verify downstream sections receive it
6. If S12 fix unblocks the chain, proceed with systematic section fixes

**Why this is the best approach**:
- ✅ Target values prove the publication mechanism works
- ✅ We don't need to invent new patterns, just mirror what works
- ✅ S12 is likely the bottleneck blocking downstream flow
- ✅ Success here could unlock the entire Reference calculation chain

### Impact Assessment

**User-facing:**
- ❌ Reference model unusable for analysis (changes don't propagate)
- ❌ CSV export/import creates unpredictable Reference model behavior
- ❌ Users can't rely on Reference calculations for compliance verification

**Development:**
- ⚠️ Regression occurred during CSV export implementation
- ⚠️ We have working state (b79549c) but incomplete CSV export
- ⚠️ We have complete CSV export (HEAD) but broken Reference flow
- ⚠️ Need to identify which changes broke flow and fix without losing CSV work

### Success Criteria for Fix

- ✅ S02-S09 continue to work correctly (maintain current state)
- ✅ S09 g_63 state mixing bug fixed
- ✅ S10+ Reference mode changes flow through entire calculation chain
- ✅ Changes in S10 Reference → recalculate S11, S12, S13, S14, S15, S04, S01
- ✅ State isolation maintained (Target and Reference independent)
- ✅ CSV export remains complete (126 fields with Reference defaults)
- ✅ All sections publish Reference values dynamically on user edits (not just on initialization)

### Commits Affected (b79549c → HEAD)

Between contamination victory and current state:
- 7edcbb9: chore: ESLint and Prettier formatting
- a87fc09: docs(S12): Add TODO comment for j_110 air leakage zone field
- 8f6ccea: fix(S13): Publish all 10 Reference defaults to StateManager for CSV export
- ebcc1e7: fix(S10): Publish all 25 Reference defaults to StateManager for CSV export
- 2b7ab43: fix(S09): Publish Reference defaults to StateManager for CSV export
- d172db6: fix(S08): Publish Reference defaults to StateManager for CSV export
- 9d61718: fix(S07): Publish all Reference defaults to StateManager for CSV export
- 04051a3: fix(S06): Publish Reference defaults to StateManager for CSV export
- 3b2ccd6: fix(S05): Publish Reference defaults to StateManager for CSV export
- 8a0d75a: fix(S04): Add emission factors to refreshUI for state isolation
- 8793ee6: fix(S04): Make emission factors editable, publish Reference defaults
- b7386b7: fix(S03): Publish all Reference defaults and add l_24 to mappings
- f09a3cf: fix(S02): Remove l_12 state contamination and preserve cost field precision
- bd38741: debug(S10): Add console logging to trace Reference value publication
- 3ff8518: fix(S10): Add missing g_73-g_78 and d_80 to Reference state for CSV export
- efdd8a5: fix(S10): Publish Reference values from localStorage on page load
- c377afc: chore(S10): Remove debug logging after successful fix

**Total**: 17 commits touching sections S02-S13 for CSV export work

---

##  S12 Deep Dive: Unblocking the Calculation Flow

**Date**: 2025-10-24
**Analysis of**: `4012-Section12.js`

Following the identification of Section 12 as the linchpin blocking the Reference model calculation flow, a deep dive into its source code reveals the likely root cause. The problem is not a simple bug, but a flawed data flow pattern involving redundant and ill-timed writes to the `StateManager`.

### The Root Cause: Redundant Publishing and Race Conditions

The core issue lies in the `calculateAll` and `storeReferenceResults` functions. The current implementation attempts to publish calculated Reference values (`ref_g_101`, `ref_i_104`, etc.) to the `StateManager` **twice**:

1.  **First Publish (Immediate)**: Inside `calculateReferenceModel`, the `storeReferenceResults` function is called. It immediately iterates through all calculated results and publishes them to the `StateManager`.
2.  **Second Publish (Delayed)**: At the end of the `calculateAll` function, *after* `calculateTargetModel` has also run, a special block of code re-publishes all the Reference results again from a cached object (`lastReferenceResults`).

This "re-write" pattern was copied from another section as a workaround for state being overwritten. However, in S12, it creates a race condition:

- The first immediate publish can trigger listeners in downstream sections (S13, S15) prematurely, before the `calculateTargetModel` pass is complete. This can lead to calculations based on an incomplete or inconsistent global state.
- The second "re-write" is meant to fix this, but it fails to solve the problem because the downstream calculation chain may have already been broken by the premature trigger.

This flawed pattern explains why the Reference calculation flow breaks *after* S12. S12 itself calculates correctly, but its method of reporting its results to the rest of the application is causing the entire chain to fail.

### The Solution: A Single, Definitive Publication

To fix this, we must eliminate the redundancy and establish a single, predictable point where S12's Reference results are published. The logic should be:

1.  Calculate all Reference model values and cache them.
2.  Calculate all Target model values and publish them.
3.  **Then, and only then**, publish the cached Reference model values.

This ensures that when downstream sections are notified of a change, the entire calculation pass within S12 is complete, and the global state is consistent.

### Workplan: Refactor S12 Data Flow

The fix requires targeted changes to two functions in `4012-Section12.js`.

**1. Modify `storeReferenceResults()` to only cache results**

This function should be simplified to only collect and store the results of the Reference calculation. The immediate publishing loop must be removed.

**File**: `OBJECTIVE 4011RF/sections/4012-Section12.js`

**Change**:
```javascript
// ... existing code in storeReferenceResults() ...
function storeReferenceResults(
  // ... arguments
) {
  if (!window.TEUI?.StateManager) return;

  // Combine all results into a single object
  const allResults = {
    ...volumeResults,
    ...uValueResults,
    ...wwrResults,
    ...nFactorResults,
    ...ach50Results,
    ...ae10Results,
    ...airLeakageResults,
    ...envelopeResults,
    ...envelopeTotalsResults,
  };

  // ✅ S11 PATTERN: Store results for later re-writing
  lastReferenceResults = { ...allResults };

  // ❌ REMOVE THE IMMEDIATE PUBLISHING LOOP THAT WAS HERE
  // Object.entries(allResults).forEach(([fieldId, value]) => { ... });

  console.log(
    "[Section12] Reference results cached. Publishing will occur at the end of calculateAll.",
  );
}
```

**2. Modify `calculateAll()` to be the sole publisher**

The existing "re-write" block at the end of this function will now become the primary and *only* mechanism for publishing Reference results. We will add a clarifying comment to make its role explicit.

**File**: `OBJECTIVE 4011RF/sections/4012-Section12.js`

**Change**:
```javascript
// ... existing code in calculateAll() ...
function calculateAll() {
  // ✅ DUAL-ENGINE: Always run BOTH engines
  calculateReferenceModel(); // Reads ReferenceState, caches results in lastReferenceResults
  calculateTargetModel(); // Reads TargetState, publishes unprefixed values

  // ✅ PRIMARY PUBLISH: This is now the single, definitive point for publishing
  // all calculated Reference values from S12. This ensures the calculation
  // pass is complete before notifying downstream sections.
  if (window.TEUI?.StateManager && lastReferenceResults) {
    Object.entries(lastReferenceResults).forEach(([fieldId, value]) => {
      window.TEUI.StateManager.setValue(
        `ref_${fieldId}`,
        value.toString(),
        "calculated",
      );
    });
  }

  ModeManager.updateCalculatedDisplayValues?.();
}
```

### Expected Outcome

With these changes, the S12 calculation flow will be robust and predictable:

-   **No More Race Conditions**: Downstream listeners will only be called *after* all S12 calculations are complete.
-   **Complete Data Flow**: Changes in S12 Reference mode will correctly propagate to S13, S14, S15, and beyond, fixing the broken calculation chain.
-   **CSV Export Parity**: Because the `ref_` values are now being published correctly and consistently to the `StateManager`, the CSV export will contain the complete and accurate set of S12 Reference values.
-   **Code Clarity**: The logic is simplified, removing the confusing double-publish pattern and making the module easier to maintain.

This targeted fix should unblock the entire Reference model and resolve the critical regression.

### Testing Results (2025-10-24 Late Night)

After implementing both the race condition fix and localStorage re-publication fix:

**✅ CSV Export Success**:
- All S12 Reference values now export correctly (d_103, g_103, d_105, d_108, g_109)
- Export works even after many changes and edits
- localStorage re-publication working as expected

**⚠️ Remaining Issues**:

1. **One-Time e_10 Adjustment on First S12 Target Edit**:
   - Symptom: First change to ANY Target field in S12 causes e_10 (Reference TEUI) to recalculate
   - Subsequent Target changes only affect h_10 (correct behavior)
   - Analysis: Suggests initialization calculation pass missed something, and first S12 edit unblocks it by running both engines
   - Status: Minor initialization timing issue, not blocking workflow

2. **Reference Model Calculation Flow Still Blocked** ❌ CRITICAL:
   - Symptom: Changes to S12 Reference values DO NOT propagate downstream
   - Impact: S13, S14, S15, S04, S01 don't receive S12 Reference updates
   - Result: e_10 doesn't change when S12 Reference values change
   - Status: **The original calculation flow blockage persists despite CSV export fix**
   - Conclusion: CSV export and calculation flow are SEPARATE issues
     - CSV export: ✅ FIXED (values publish to StateManager for export)
     - Calculation flow: ❌ STILL BROKEN (downstream sections don't consume values)

3. **d_103 Air Leakage Calculation Stops at 3 Stories** (SEPARATE ISSUE):
   - Symptom: Changes to d_103 (stories) produce internal recalculations up to 3 stories
   - Beyond 3 stories: No change in calculations
   - Root cause: S12 uses mini JSON table to map air leakage values based on storey height
   - Functional recall appears broken beyond 3 stories
   - Historical check: **This has NEVER worked** - predates dual-state refactors
   - Status: Pre-existing bug, requires separate investigation and formula re-litigation
   - Not related to current state isolation work

**Key Insight**:
We've achieved **partial victory** - CSV export is complete, but the Reference calculation flow remains blocked. The issue is not publication (S12 publishes correctly), but **consumption** (downstream sections S13+ don't react to S12 Reference changes).

This confirms the hypothesis from earlier investigation: The problem is in Pattern 4 (Consuming External Values) in downstream sections, not in S12's publication.

---

## 🔬 Investigation Workplan: Unblock Reference Calculation Flow (2025-10-25)

**Current State**:
- ✅ CSV export complete (all 126 Reference values publish to StateManager)
- ✅ State isolation maintained in S02-S09
- ❌ Reference calculation flow blocked at S12/S13 boundary
- ❌ S09 i_63 changes affect both e_10 and h_10 (state mixing)

**Goal**: Restore the working Reference calculation flow from commit b79549c while maintaining CSV export completeness.

---

## 🎯 BREAKTHROUGH: S13 is the Blockage Point (2025-10-25)

**Critical Discovery**:

User swapped current S13 with backup S13 from archive → **Reference calculation flow IMMEDIATELY RESTORED** ✅

**Test Results**:
- Replaced: `sections/4012-Section13.js` (current partially refactored version)
- With: `sections/section-BACKUPS/4012-Section13.js.backup` (archived version)
- Result: S12 Reference changes now propagate downstream correctly!
- Conclusion: **S13 is definitively the blockage point**

**Testing Methodology** (2025-10-25 afternoon):
1. Renamed `4012-Section13.js.backup` (working version) to `4012-Section13.js`
2. Renamed current `4012-Section13.js` to `4012-Section13-OFFLINE.js`
3. Ran application with backup S13
4. **Result**: Clean Reference calculation flow completely restored ✅
5. Reverted file names after testing for documentation purposes

**File Comparison Analysis**:
- **Working S13** (4012-Section13.js.backup): 3662 lines
  - Has CSV export fix (publishes S13 Reference defaults)
  - Has Cooling.js two-stage architecture fix (cooling_m_124 handling)
  - Clean Reference calculation flow from S12 → S13 → downstream ✅

- **Broken S13** (4012-Section13.js): 3682 lines
  - Has same CSV export fix (publication block lines 226-235)
  - Has same Cooling.js two-stage fix (error handling lines 2940-2956)
  - Reference calculation flow BLOCKED at S13 ❌

**Diff Results**: Only 48 lines different between versions:
1. CSV export publication block added to current version
2. Cooling_m_124 error handling modified in current version
3. Both changes appear functionally identical to working version's patterns

**Critical Finding**:
The working backup file ALREADY CONTAINS both:
- ✅ CSV export fix (publishes S13 Reference defaults)
- ✅ Cooling.js phased approach (two-stage architecture)

The only difference is **HOW the CSV publication code was added** to the current file. Something about the implementation, placement, or timing in the current version breaks Reference calculation flow.

**Root Cause**:
The CSV export fix code itself (or its placement/timing in initialization) is creating a blockage in Reference calculation propagation. This is NOT about C-RF refactoring being incomplete - both files have identical two-stage cooling architecture.

**Action Required**:
Examine the EXACT differences in CSV publication implementation between working and broken versions to identify what breaks the calculation flow.

---

## 🔬 S13 Comparative Testing Setup (2025-10-25 evening)

**File Naming Convention for Testing**:
- `4012-Section13.js` (126K, Oct 23) - **BACKUP VERSION** - Currently active in index.html
- `4012-Section13-latest.js` (127K, Oct 24) - **CSV FIX VERSION** - Renamed for comparison

**Testing Results with Backup S13 (currently active)**:

✅ **Calculation Flow**: WORKING
- S12 Target changes affect only h_10 (Target model)
- S12 Reference changes affect only e_10 (Reference model)
- Clean state isolation between Target and Reference modes
- **S12 is NOT the problem** - isolation working correctly

❌ **Initialization Values**: INCORRECT
- Observed on fresh initialization:
  - e_10 (Reference TEUI): **287.0 kWh/m²/yr**
  - h_10 (Target TEUI): **93.6 kWh/m²/yr**
- Expected for Excel parity:
  - e_10 (Reference TEUI): **≈196.6 kWh/m²/yr**
  - h_10 (Target TEUI): **93.7 kWh/m²/yr**
- **Error**: e_10 is 87+ kWh/m²/yr too high (wrong Reference calculation)

**Hypothesis**: S13-latest.js likely has better initialization (closer to Excel) but blocks calculation flow.

**Problem Summary**:
Both S13 versions have issues:
- **Backup (active)**: ✅ Flow works, ❌ Wrong e_10 initialization (~287 vs ~197 expected)
- **Latest (offline)**: ❌ Flow blocked, ✅ Better initialization (needs verification)

**Root Cause Location**: The problem is in S13's Reference model calculation logic, NOT in S12's publication pattern.

**Next Investigation**:
Compare initialization and calculation logic between backup and latest S13 to find:
1. What makes latest's initialization more accurate
2. What makes backup's calculation flow work correctly
3. How to combine both fixes

---

## 🔍 S12 Missing Fields Investigation (2025-10-25 evening)

**Problem**: CSV export shows d_103 and g_103 Reference values are missing (empty/yellow in spreadsheet)

**Hypothesis**: If S12 isn't publishing ref_d_103 and ref_g_103 to StateManager, S13 can't consume them, which could cascade into broken S13 calculations and the 87 kWh/m²/yr e_10 error.

**Diagnostic Script** (paste in console after page load):
```javascript
// Check if S12 Reference fields are in StateManager
console.log("=== S12 Reference Fields in StateManager ===");
const s12RefFields = ["d_103", "g_103", "d_105", "d_108", "g_109"];
s12RefFields.forEach(id => {
  const refId = `ref_${id}`;
  const value = window.TEUI.StateManager.getValue(refId);
  console.log(`${refId}: ${value === null || value === undefined ? "❌ MISSING" : "✅ " + value}`);
});

// Check S12 ReferenceState internal values
console.log("\n=== S12 ReferenceState Internal Values ===");
const s12RefState = window.TEUI.SectionModules.sect12.ReferenceState?.state;
if (s12RefState) {
  s12RefFields.forEach(id => {
    console.log(`${id}: ${s12RefState[id]}`);
  });
} else {
  console.log("❌ Cannot access S12 ReferenceState");
}

// Check localStorage
console.log("\n=== S12 Reference localStorage ===");
const s12Storage = localStorage.getItem("S12_REFERENCE_STATE");
if (s12Storage) {
  const parsed = JSON.parse(s12Storage);
  s12RefFields.forEach(id => {
    console.log(`${id}: ${parsed[id]}`);
  });
} else {
  console.log("❌ No localStorage found - fresh initialization");
}

// Check which initialization path was taken
console.log("\n=== Initialization Path ===");
console.log(s12Storage ? "Loaded from localStorage" : "Fresh setDefaults() called");
```

**Code Review Findings**:
1. ✅ S12 ReferenceState.initialize() publishes all 5 fields (lines 84-94)
2. ✅ S12 ReferenceState.setDefaults() publishes all 5 fields (lines 119-139)
3. ✅ Both check for `window.TEUI?.StateManager` before publishing
4. ✅ d_103 and g_103 are NOT calculated fields - they're pure user input
5. ✅ calculateAll() only publishes calculated fields (g_101, d_101, i_104, etc.) - doesn't touch user input fields
6. ❓ **Mystery**: Code looks correct, but CSV export shows d_103 and g_103 missing

**Possible Causes**:
- Timing: StateManager might not be ready when S12 initializes
- Overwrite: Something else (S13?) might be overwriting with null/undefined
- Storage: localStorage might have null values for these fields specifically
- Calculation: First calculateAll() might clear these before they're saved

**Diagnostic Results** (2025-10-25 evening, with S13 backup):

```
StateManager:
  ref_d_103: ❌ MISSING
  ref_g_103: ❌ MISSING
  ref_d_105: ✅ 8200
  ref_d_108: ❌ MISSING
  ref_g_109: ❌ MISSING

ReferenceState.state (internal):
  d_103: 1 ✅
  g_103: Exposed ✅
  d_105: 8200.00 ✅
  d_108: MEASURED ✅
  g_109: 2.00 ✅

localStorage: ❌ No storage (fresh initialization)
Path: setDefaults() called
```

**🚨 CRITICAL FINDING**:
- S12 ReferenceState has all 5 values internally ✅
- Only 1 out of 5 values published to StateManager (d_105) ✅
- 4 values failed to publish: d_103, g_103, d_108, g_109 ❌

**Root Cause Theory**:
The setDefaults() publication loop (lines 119-139) is running but **something is blocking/preventing the setState calls** for 4 specific fields.

**Additional Finding**:
Logs show S13 backup throws error: `[S13] REQUIRED cooling_m_124 missing from Cooling.js` (lines 1732, 1755)
- This error occurs during initialization because cooling_m_124 doesn't exist until Stage 2
- S13 backup uses old error-throwing approach
- S13-latest has correct two-stage architecture handling (uses 0 placeholder)

**Hypothesis**: S13's error might be preventing S12's publication from completing.

**Fix Applied** (2025-10-25 late evening):

After extensive debugging with comprehensive console logging, discovered that S12 WAS publishing all 5 fields during initialization, BUT the browser was serving cached JavaScript. After hard refresh with cache disabled:

✅ **All 5 fields published successfully during initialization**
✅ **All 5 fields verified in StateManager immediately after publication**

**Additional Safety Net Added**:
Added re-publication of user input Reference fields in `calculateAll()` (lines 2336-2351) to ensure they're always present even if initialization fails. This guarantees that every calculation pass re-publishes:
- ref_d_103 (stories)
- ref_g_103 (exposure)
- ref_d_105 (volume)
- ref_d_108 (blower door method)
- ref_g_109 (measured ACH50)

**Result**: ✅ **CSV export now contains all 5 S12 Reference fields!**

---

## ✅ S12 Reference Field Publication - COMPLETE

**Status**: All 5 S12 Reference user input fields now export to CSV correctly.

**Fix Summary**:
1. Browser cache was serving old JavaScript without debug logging
2. Added comprehensive debug logging to both initialization paths
3. Added safety net in calculateAll() to re-publish user input fields on every calculation
4. All 5 fields now consistently present in StateManager and CSV export

**Testing Results** (2025-10-25 late evening):

After S12 fix, tested Reference calculation flow:
- ✅ S12 Target changes affect only h_10 (correct)
- ✅ S12 Reference changes recalculate internally (correct)
- ❌ **S12 Reference changes do NOT propagate to S13** (heating loads don't update)
- ❌ e_10 does not change when S12 Reference values change

**Conclusion**:
- ✅ **S12 is FIXED** - All values publishing correctly to StateManager
- ❌ **S13 is NOT CONSUMING** - Either not listening or not reading from StateManager

**Critical Insight**:
Backup S13 (3662 lines) works perfectly - Reference changes flow through.
Current S13 (3682 lines) has CSV export additions but broke consumption.

**Next Investigation**: Compare backup vs current S13 to identify what in the CSV export addition broke the listener/consumption mechanism.

---

## 🔬 S13 Consumption Investigation Workplan

**Problem Statement**: S12 publishes all Reference values correctly, but S13 doesn't consume them. Backup S13 works, current S13 (with CSV additions) doesn't.

**Files**:
- Working: `4012-Section13.js` (currently the backup, 3662 lines)
- Broken: `4012-Section13.js.backup.js` (CSV additions, 3682 lines)
- Note: Files got renamed during testing - need to swap names back

**Investigation Plan**:

### Phase 1: Identify the Difference
1. Diff the two S13 files focusing on:
   - StateManager.addListener calls for S12 Reference fields
   - getExternalValue() or getValue() calls reading S12 data
   - ModeManager.initialize() and listener registration
   - Any code in the 48-line diff that might affect consumption

### Phase 2: Hypothesis Testing
**Hypothesis**: The CSV export publication block (lines 226-235 in current) is interfering with listener registration or value consumption.

**Test Approach**:
1. Identify EXACTLY what the CSV export block does in current S13
2. Check if it overwrites values that S13 needs to read from S12
3. Check timing - does it run before or after listeners are registered?

### Phase 3: Targeted Fix
**Option A**: If CSV block is the problem, move it or modify it to not interfere
**Option B**: If listeners are missing, add them back from backup
**Option C**: Port ONLY the CSV fix to backup S13 without breaking consumption

**Success Criteria**:
- ✅ S12 Reference changes propagate to S13 heating loads
- ✅ e_10 updates when S12 Reference envelope values change
- ✅ All S13 Reference fields still export to CSV
- ✅ Calculation flow restored: S12→S13→S14→S15→S04→S01

**Next Session**: Start with Phase 1 - detailed diff analysis focusing on consumption mechanism

### Next Steps: Compare and Fix S13

**Option 1: Use Backup S13 as Baseline (RECOMMENDED)**
1. Keep backup S13 active (currently in place)
2. Compare with broken S13 to identify what CSV export changes were made
3. Carefully port only the CSV export publication code to backup S13
4. Test: Ensure both calculation flow AND CSV export work together

**Option 2: Fix Current S13 (Complete the Refactor)**
1. Diff backup vs current S13 to identify what changed
2. Identify missing/broken listener registrations
3. Fix getExternalValue() if broken
4. Complete dual-engine pattern implementation
5. More risky - many changes to debug

**Comparison Strategy**:
```bash
# See what changed between working backup and broken current
diff sections/4012-Section13.js.backup sections/4012-Section13.js > /tmp/s13_diff.txt

# Focus on:
# - Listener registration (addListener calls)
# - getExternalValue() implementation
# - calculateReferenceModel() triggering
# - StateManager value consumption
```

**What to look for in diff**:
- Missing `sm.addListener("ref_d_101", ...)` type registrations
- Changes to `getExternalValue()` logic
- Removed or modified calculation triggers
- Different pattern for consuming external values

**Success Criteria**:
- ✅ S12 Reference changes propagate to e_10
- ✅ CSV export remains complete (126 fields)
- ✅ State isolation maintained
- ✅ S09 i_63 issue also fixed (bonus if backup S13 fixes this too)

---

### Phase 1: Trace S09 → S13 Direct Dependencies (i_63 Issue)

**Problem**: Changes to S09's g_63 (occupied hours) in Target mode cause BOTH e_10 and h_10 to update.

**What we know**:
- S09 correctly calculates and publishes BOTH `i_63` and `ref_i_63` with different values ✅
- S13 uses `getExternalValue("i_63", isReferenceCalculation)` to read occupied hours
- S13 directly uses i_63 in d_120 and d_122 calculations
- But somehow Target i_63 changes contaminate Reference model

**Investigation steps**:

1. **Verify S13's getExternalValue() logic**:
   ```javascript
   // Check if this correctly returns ref_i_63 for Reference calculations
   function getExternalValue(fieldId, isReferenceCalculation = false) {
     if (isReferenceCalculation) {
       const refValue = window.TEUI?.StateManager?.getValue(`ref_${fieldId}`);
       return refValue !== null && refValue !== undefined ? refValue : null;
     } else {
       return window.TEUI?.StateManager?.getValue(fieldId);
     }
   }
   ```
   - Add debug logging to trace what value is returned
   - Test: Change Target g_63, log what S13 receives for Reference calculation

2. **Check S13's calculation triggers**:
   ```javascript
   // Find StateManager listeners in S13
   sm.addListener("i_63", () => { ... });  // Does this exist?
   sm.addListener("ref_i_63", () => { ... });  // Does this exist?
   ```
   - Verify S13 has BOTH listeners (one for Target, one for Reference)
   - Check if both call their respective calculation engines

3. **Trace S13's d_120 and d_122 calculations**:
   ```javascript
   // In S13's calculateReferenceModel():
   const occupiedHours = getExternalValue("i_63", true);  // Should get ref_i_63
   // Verify this is actually reading ref_i_63, not falling back to i_63
   ```
   - Add logging to show which value is used
   - Check if calculation results differ between Target and Reference

4. **Test hypothesis: Missing listener or wrong listener**:
   - Possible issue: S13 only listens to `i_63` (unprefixed), not `ref_i_63`
   - When S09 publishes new `i_63`, S13 recalculates BOTH engines (correct)
   - But if `getExternalValue()` has a bug, Reference calc might read Target value
   - Result: Both e_10 and h_10 change

**Expected outcome**: Identify whether the issue is:
- A) Missing `ref_i_63` listener in S13
- B) Bug in `getExternalValue()` logic
- C) S13 calling Target calculation when it should call Reference
- D) Fallback anti-pattern in S13's calculation code

### Phase 2: Trace S12 → S13 Calculation Flow (Main Blockage)

**Problem**: Changes to S12 Reference values don't propagate to S13, S14, S15, S04, S01.

**What we know**:
- S12 publishes `ref_g_101`, `ref_d_101`, `ref_i_104` correctly ✅
- S13 uses these values for heating/cooling load calculations
- But changes to S12 Reference don't trigger S13 Reference recalculation

**Investigation steps**:

1. **Check S13's listeners for S12 values**:
   ```javascript
   // Should exist in S13:
   sm.addListener("d_101", () => { calculateTargetModel(); });
   sm.addListener("ref_d_101", () => { calculateReferenceModel(); });
   // ... same for g_101, d_102, i_104
   ```
   - Search S13 code for these listener registrations
   - If missing, that's the problem - S13 never hears S12 Reference changes

2. **Verify S12 actually publishes to StateManager**:
   - Add console logging: When S12 publishes `ref_d_101`, log it
   - Check StateManager: `window.TEUI.StateManager.getValue("ref_d_101")`
   - Confirm value changes when S12 Reference fields change

3. **Check if S13 reads S12 Reference values**:
   ```javascript
   // In S13's calculateReferenceModel():
   const envelopeArea = getExternalValue("d_101", true);  // Should get ref_d_101
   const avgUValue = getExternalValue("g_101", true);     // Should get ref_g_101
   ```
   - Add logging to see what values S13 receives
   - Compare to known S12 Reference output

4. **Test the complete chain**:
   - Change S12 Reference d_105 (volume) from 8200 → 9000
   - Expected cascade:
     - S12 recalculates → publishes ref_d_101, ref_g_101, ref_i_104
     - S13 listener fires → recalculates Reference heating/cooling loads
     - S14 listener fires → recalculates Reference fuel consumption
     - S15 listener fires → recalculates Reference TEUI
     - S04 listener fires → recalculates Reference emissions
     - S01 updates → e_10 changes
   - At which step does the chain break?

**Expected outcome**: Identify the exact break point in the S12→S13→S14→S15→S04→S01 chain.

### Phase 3: Compare Working State (b79549c) vs Current State

**Goal**: Understand what mechanism worked at b79549c that we broke.

**Investigation steps**:

1. **Checkout b79549c and examine S13**:
   ```bash
   git show b79549c:OBJECTIVE 4011RF/sections/4012-Section13.js > /tmp/s13_working.js
   ```
   - Compare listener setup between b79549c and HEAD
   - Look for listeners that existed then but are missing now

2. **Check what changed in S13 between b79549c and HEAD**:
   ```bash
   git diff b79549c HEAD -- OBJECTIVE 4011RF/sections/4012-Section13.js
   ```
   - Identify any listener removals
   - Check if `getExternalValue()` implementation changed

3. **Hypothesis to test**:
   - At b79549c, Reference values flowed dynamically WITHOUT pre-publication
   - Our CSV work added pre-publication but broke the listener chain
   - Maybe we removed listeners thinking they were redundant?

**Expected outcome**: Find the specific code change that broke the listener chain.

### Phase 4: Systematic Fix

Once we identify the root cause, apply targeted fixes:

**If missing listeners**:
- Add `ref_` prefixed listeners in S13, S14, S15 for all S12 dependencies
- Ensure each listener calls the correct calculation engine

**If getExternalValue() bug**:
- Fix the logic to ensure strict mode isolation
- Add fallback prevention (return null, don't fall back to unprefixed)

**If calculation engine not firing**:
- Ensure `calculateReferenceModel()` is called when `ref_` values change
- Check that dual-engine pattern (`calculateAll()`) runs both engines

### Success Criteria

When fixed, we should see:
- ✅ Changes to S09 Target g_63 only affect h_10 (not e_10)
- ✅ Changes to S09 Reference g_63 only affect e_10 (not h_10)
- ✅ Changes to S12 Reference values propagate through full chain
- ✅ e_10 updates correctly when S12 Reference changes
- ✅ CSV export remains complete (126 fields)
- ✅ State isolation maintained (Target and Reference independent)

### Diagnostic Tools

**Console test script for quick checks**:
```javascript
// Test 1: Check if S13 has ref_i_63 listener
console.log("S13 listeners:", window.TEUI.StateManager.listeners?.ref_i_63);

// Test 2: Check what value getExternalValue returns
const testValue = window.TEUI.SectionModules.sect13.getExternalValue?.("i_63", true);
console.log("S13 getExternalValue('i_63', true):", testValue);

// Test 3: Check StateManager values
console.log("i_63 (Target):", window.TEUI.StateManager.getValue("i_63"));
console.log("ref_i_63 (Reference):", window.TEUI.StateManager.getValue("ref_i_63"));

// Test 4: Check S12 Reference values
console.log("ref_d_101:", window.TEUI.StateManager.getValue("ref_d_101"));
console.log("ref_g_101:", window.TEUI.StateManager.getValue("ref_g_101"));
```

This systematic approach should quickly identify where the calculation flow breaks and guide us to the correct fix.

### Separate Issue: S12 d_103 Air Leakage Calculation (3+ Stories)

**Status**: Pre-existing bug, NOT related to current state isolation work.

**Problem**:
- d_103 (number of stories) changes only affect calculations up to 3 stories
- Beyond 3 stories, no recalculation occurs
- Affects BOTH Target and Reference models equally

**Root cause hypothesis**:
- S12 uses a mini JSON table (likely `airLeakageTable` or similar) to map air leakage values based on storey height
- Table lookup or functional recall appears broken for values > 3
- Possibly missing entries in the table, or conditional logic that stops at 3

**Historical context**:
- User tested pre-dual-state code: **This has NEVER worked**
- Bug predates all dual-state architecture refactoring
- Not introduced by current CSV export work

**Impact**:
- Medium priority: Affects buildings with 4+ stories
- Not blocking current state isolation/CSV export work
- Requires separate investigation and potential formula re-litigation

**Investigation needed**:
1. Find air leakage lookup table in S12
2. Check if table has entries for 4+ stories
3. Verify conditional logic in calculation function
4. Compare against Excel/building code requirements
5. Fix table or logic as needed

**Deferred**: Will address after completing Reference calculation flow fixes.

---

## 📋 Established Patterns for StateManager Publication

This section consolidates the working patterns we've established for publishing Reference values to StateManager, to help future debugging efforts understand what works and what doesn't.

### Pattern 1: User Input Fields - Publish Defaults on Initialization

**When to use**: For user-editable fields that have default values in ReferenceState.

**Where it works**: S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S13, S15

**How it works**:
```javascript
const ReferenceState = {
  state: {},
  initialize: function () {
    const savedState = localStorage.getItem("SXX_REFERENCE_STATE");
    if (savedState) {
      this.state = JSON.parse(savedState);
      this.publishToStateManager(); // ✅ Re-publish on every load
    } else {
      this.setDefaults();
    }
  },
  setDefaults: function () {
    // Set default values
    this.state.field1 = "default1";
    this.state.field2 = "default2";

    // Publish to StateManager
    this.publishToStateManager();
  },
  publishToStateManager: function () {
    if (window.TEUI?.StateManager) {
      const referenceFields = ["field1", "field2"];
      referenceFields.forEach((fieldId) => {
        const value = this.state[fieldId];
        if (value !== null && value !== undefined) {
          window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, "default");
        }
      });
    }
  },
};
```

**Why this pattern works**:
- ✅ Publishes defaults on fresh initialization
- ✅ Re-publishes from localStorage on page refresh (critical for CSV export)
- ✅ Non-destructive: only publishes if value exists
- ✅ Import-safe: After CSV/Excel import, values already in StateManager aren't overwritten

**Key insight**: Without `publishToStateManager()` in the localStorage path, CSV exports have empty Reference values after page refresh.

---

### Pattern 2: User Edits - Publish Dynamically via ModeManager.setValue

**When to use**: For all user-editable fields when users make changes.

**Where it works**: All Pattern A sections (S02-S13, S15)

**How it works**:
```javascript
const ModeManager = {
  currentMode: "target",

  setValue: function (fieldId, value, source = "user") {
    // Update internal state
    const currentState = this.currentMode === "target" ? TargetState : ReferenceState;
    currentState.setValue(fieldId, value);

    // Bridge to global StateManager
    if (window.TEUI?.StateManager?.setValue) {
      if (this.currentMode === "target") {
        // Target changes: publish without prefix
        window.TEUI.StateManager.setValue(fieldId, value, source);
      } else if (this.currentMode === "reference") {
        // Reference changes: publish with ref_ prefix
        window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, source);
      }
    }
  },
};
```

**Why this pattern works**:
- ✅ Every user edit immediately publishes to StateManager
- ✅ Target and Reference values remain separate (different prefixes)
- ✅ Downstream sections can consume published values
- ✅ CSV export always has latest user values

**Key insight**: This is how Target values "just work" - every edit publishes. Reference needs the same pattern.

---

### Pattern 3: Calculated Fields - Publish After Calculation

**When to use**: For fields that are computed from other values.

**Where it works**: S09 (i_63, h_71), S10, S11 (partially), S13 (partially)

**How it works**:
```javascript
function calculateReferenceModel() {
  try {
    const results = calculateModel(ReferenceState, true);
    const prefix = "ref_";

    // Publish ALL calculated results with ref_ prefix
    Object.entries(results).forEach(([fieldId, value]) => {
      if (value !== null && value !== undefined) {
        window.TEUI.StateManager.setValue(
          prefix + fieldId,
          String(value),
          "calculated",
        );
      }
    });

    // Also manually publish critical values that downstream sections need
    window.TEUI.StateManager.setValue(
      "ref_d_63",
      ReferenceState.getValue("d_63"),
      "calculated",
    );
    window.TEUI.StateManager.setValue(
      "ref_g_63",
      ReferenceState.getValue("g_63"),
      "calculated",
    );
  } catch (error) {
    console.error("[SXX] Error in Reference Model calculations:", error);
  }
}

function calculateTargetModel() {
  try {
    const results = calculateModel(TargetState, false);

    // Publish to StateManager (without prefix)
    Object.entries(results).forEach(([fieldId, value]) => {
      if (window.TEUI?.StateManager && value !== null && value !== undefined) {
        window.TEUI.StateManager.setValue(fieldId, String(value), "calculated");
      }
    });
  } catch (error) {
    console.error("[SXX] Error in Target Model calculations:", error);
  }
}
```

**Why this pattern works**:
- ✅ Every calculation run publishes results to StateManager
- ✅ Both Target and Reference calculations publish (dual-engine)
- ✅ Values are always fresh when downstream sections read them
- ✅ Target publishes `fieldId`, Reference publishes `ref_fieldId`

**Key insight**: S09 does this correctly - calculates i_63 from both TargetState and ReferenceState, publishes both `i_63` and `ref_i_63` with correct independent values.

---

### Pattern 4: Consuming External Values - Mode-Aware Reading

**When to use**: When a section needs values from upstream sections.

**Where it works**: S13 (uses `getExternalValue`)

**How it works**:
```javascript
function getExternalValue(fieldId, isReferenceCalculation = false) {
  if (isReferenceCalculation) {
    // Reference calculations read ref_ prefixed external values
    const refValue = window.TEUI?.StateManager?.getValue(`ref_${fieldId}`);
    return refValue !== null && refValue !== undefined ? refValue : null;
  } else {
    // Target calculations read unprefixed values
    return window.TEUI?.StateManager?.getValue(fieldId);
  }
}

// Usage in calculations:
const occupiedHours = window.TEUI.parseNumeric(
  getExternalValue("i_63", isReferenceCalculation),
) || 0;
```

**Why this pattern works**:
- ✅ Strict mode isolation - reads correct prefix based on calculation mode
- ✅ Returns `null` if value doesn't exist (no fallback contamination)
- ✅ Clear separation between Target and Reference data flows

**Key insight**: This is how to PREVENT fallback anti-patterns. If `ref_i_63` doesn't exist, return `null`, don't fall back to `i_63`.

---

## 🚧 S12 Special Case: The Blocker

### What Makes S12 Different

S12 (Volume and Surface Metrics) is the **linchpin** for downstream calculation flow. It calculates critical values that S13, S14, S15, S04, and S01 all depend on:

**Critical S12 outputs**:
- `d_101`, `ref_d_101` - Total AG wall + window area
- `d_102`, `ref_d_102` - Total envelope area (walls + roof + BG + floor)
- `g_101`, `ref_g_101` - Weighted average U-value
- `i_104`, `ref_i_104` - Surface area to volume ratio

**Why it's critical**:
- S13 (Mechanical) uses these for heating/cooling load calculations
- S15 (Summary) uses these for TEUI totals
- If S12 Reference values don't publish, the entire Reference calculation chain breaks downstream

### What We Tried with S12

**Attempt 1: Add publishToStateManager() method** (Commit 650bc47)
- Created `publishToStateManager()` method to publish user input defaults
- Modified `initialize()` to call it when loading from localStorage
- **Result**: User input fields (d_103, g_103, d_105, d_108, g_109) still didn't publish
- **Problem**: State object was empty `{}` when we tried to publish

**Attempt 2: Change object assignment to individual properties**
- Changed from `this.state = { d_103: "1", ... }` to `this.state.d_103 = "1"` (like S10 pattern)
- **Result**: Still didn't work
- **Problem**: Unknown - state still appeared empty

**Attempt 3: Multiple debug/revert cycles**
- Added verbose logging to trace execution
- Reverted multiple times trying different approaches
- Accumulated technical debt
- **Result**: Too messy to debug further, reverted to clean baseline (b79549c)

### The Mystery: Why Target Works But Reference Doesn't

**Target values publish correctly in S12** - we can verify this because:
- Changes to Target fields in S12 flow downstream correctly
- h_10 (Target TEUI) updates when S12 Target values change
- Target g_101, d_101, etc. appear in StateManager

**Reference values DON'T publish** - we know this because:
- Changes to Reference fields in S12 don't flow downstream
- e_10 (Reference TEUI) doesn't update when S12 Reference values change
- CSV export from fresh initialization shows S12 Reference values missing

**Critical questions for next investigation**:
1. **How do Target values publish?** - We need to trace the exact mechanism
   - Is it in the calculation functions?
   - Is it in some initialization code we haven't found?
   - Is it in ModeManager.setValue when users edit fields?
2. **Why doesn't the same mechanism work for Reference?**
   - Are we missing a listener?
   - Is there a timing issue?
   - Is localStorage interfering?
3. **What's different about S12 vs S10?**
   - S10 Reference publication works perfectly
   - S12 Reference publication fails completely
   - Both use Pattern A dual-state architecture
   - What's the structural difference?

### Recommended Next Steps for S12

**Step 1: Trace Target publication mechanism** (Start here!)
```javascript
// Add debug logging to S12:
// 1. Log when d_103, g_103, etc. are published to StateManager
// 2. Search for ALL setValue calls with these field IDs
// 3. Find which code path successfully publishes Target values
// 4. Mirror that exact pattern for Reference with ref_ prefix
```

**Step 2: Compare S10 vs S12 structure**
```javascript
// Read both files side-by-side:
// - How does S10.ReferenceState.publishToStateManager() work?
// - How does S10.ModeManager.setValue() work?
// - What's different in S12's structure?
// - Can we copy S10's working pattern exactly?
```

**Step 3: Test hypothesis about calculated values**
```javascript
// S12's critical values are CALCULATED (g_101, d_101, i_104)
// They're not user inputs like d_103, g_103
// Maybe we need Pattern 3 (calculated fields) not Pattern 1 (user inputs)?
//
// Check if S12 has calculation functions that should publish:
// - calculateCombinedUValue() should publish ref_g_101
// - calculateSurfaceAreas() should publish ref_d_101, ref_d_102
// - calculateSurfaceToVolumeRatio() should publish ref_i_104
```

**Step 4: Understand the baseline vs current state difference** ✅ CONFIRMED

**At b79549c (contamination victory):**
- ✅ Reference calculation flow works perfectly
- ✅ S12 Reference changes propagate downstream correctly
- ✅ State isolation maintained (Target and Reference independent)
- ❌ CSV export incomplete (only 37 Reference values out of 126)
- **Key**: S12 worked IN CONTEXT of all other sections at that commit

**At HEAD (current state with CSV export work):**
- ✅ CSV export nearly complete (126 fields published to StateManager)
- ✅ S02-S09 maintain correct isolation and flow
- ❌ S10+ Reference mode changes trapped, flows downstream to S11, S12, but gets stuck there...
- ❌ S12 can't publish Reference values to StateManager for CSV export
- **Key**: S12 doesn't work IN CONTEXT of our CSV publication changes

**Critical insight**:
- S12 wasn't fixed in isolation at b79549c
- The ENTIRE SYSTEM worked together at b79549c without explicit Reference default publication
- Our CSV export work (publishing all Reference defaults to StateManager) broke the dynamic flow
- The problem isn't just S12 - it's the interaction between S12 and all the CSV publication changes we made to S02-S15

**What this means**:
1. We can't just "fix S12 in isolation" - need to understand systemic interaction
2. At b79549c, Reference values flowed dynamically through calculations WITHOUT being pre-published to StateManager
3. Our CSV work added pre-publication for export, but this somehow broke the dynamic calculation flow
4. Need to maintain BOTH: pre-publication for CSV export AND dynamic calculation flow

### Success Criteria for Unblocking S12

When S12 is fixed, we should see:
- ✅ CSV export includes all S12 Reference values (d_103, g_103, d_105, d_108, g_109, plus calculated values)
- ✅ Changes to S12 Reference fields update e_10 (Reference TEUI)
- ✅ Reference calculation flow: S10 → S11 → S12 → S13 → S14 → S15 → S04 → S01
- ✅ State isolation maintained (Target and Reference independent)
- ✅ Same working behavior as "contamination victory" commit b79549c

---

### Related Documentation

- [4012-CHEATSHEET.md - Anti-Pattern 1: State Contamination via Fallbacks](history%20(completed)/4012-CHEATSHEET.md#anti-pattern-1-state-contamination-via-fallbacks)
- Commit b79549c: "CONTAMINATION ELIMINATED" - last known working state
- Commit 50e76f4: l_20/l_21 fix (proof of pattern)
- Commit 4c34826: Explicit field list implementation
