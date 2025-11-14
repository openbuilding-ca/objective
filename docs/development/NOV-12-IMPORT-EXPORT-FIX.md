# Import/Export Precision Fix - November 12, 2025

## 🎯 Problem Statement

CSV export/import is losing precision on critical mechanical system fields, causing calculated totals to drift after round-trip export→import cycles. This is particularly problematic for large buildings where small efficiency differences compound significantly.

### Affected Fields

**Section 13 (Mechanical Loads):**
- `d_118` - HRV/ERV SRE % (currently 0dp, needs 2dp support)
- `j_115` - AFUE Gas/Oil (needs consistent 2dp)
- `j_116` - Cooling COP (needs consistent 2dp) **[NOT CURRENTLY EXPORTED]**
- `l_118` - ACH Ventilation Rate (needs consistent 2dp)

**Reference Field (Working Correctly):**
- `k_52` (Section 07) - AFUE for DHW (correctly stores/exports/imports as 2dp decimal like "0.90")

---

## 🔍 Root Cause Analysis

### Why k_52 Works Correctly

**Field Definition (Section07.js:678-684):**
```javascript
k: {
  fieldId: "k_52",
  type: "editable",           // ✅ CRITICAL: Plain editable, not percentage
  value: "0.90",              // ✅ Stored as decimal string
  classes: ["user-input"],
  tooltip: true,
  label: "AFUE (Gas/Oil Efficiency)",
}
```

**Editable Handler (Section07.js:1477):**
```javascript
const formatType = fieldId === "k_52" ? "number-2dp" : "number-2dp-comma";
const valueToStore = numericValue.toString(); // ✅ Stores full precision
```

**ExcelMapper Import Normalization (ExcelMapper.js:585-605):**
```javascript
if (fieldId === "k_52") {
  // Handles both percentage (90%) and decimal (0.90) formats from Excel
  if (numVal > 1) {
    extractedValue = (numVal / 100).toFixed(2); // 90 → "0.90"
  } else {
    extractedValue = numVal.toFixed(2);         // 0.90 → "0.90"
  }
}
```

**CSV Export (FileHandler.js:821-822):**
```javascript
const targetValue = this.stateManager.getValue(fieldId) ?? "";
targetValues.push(escapeCSV(targetValue)); // ✅ Exports stored value as-is: "0.90"
```

**Result:** Full precision round-trip (0.90 → "0.90" → 0.90)

---

### Why d_118, j_115, j_116, l_118 Lose Precision

**1. d_118 (HRV Efficiency) - Type Mismatch Issue**

**Field Definition (Section13.js:1177-1183):**
```javascript
d: {
  fieldId: "d_118",
  type: "percentage",        // ⚠️ ISSUE: Percentage slider (0-100 integer)
  value: "89",               // Integer value, no decimals
  min: 0,
  max: 100,
  step: 1,                   // ⚠️ ISSUE: Integer steps only
```

**Problem:** Field defined as percentage slider with integer steps, but Excel source has values like "89.4%" that should be "0.894" for calculations.

**ExcelMapper Normalization (ExcelMapper.js:532-557):**
```javascript
if (fieldId === "d_118") {
  if (numVal >= 0 && numVal <= 1) {
    extractedValue = Math.round(numVal * 100).toString(); // 0.894 → "89" (LOSES 0.4%)
  }
}
```

**Impact:** For a large building with 445,280 kWh/yr ventilation energy (Section13.js:1386), losing 0.4% precision means:
- Lost recovery: 445,280 × 0.004 = **1,781 kWh/yr error**
- Propagates through d_121, i_121, m_121 calculations

---

**2. j_115 (AFUE Gas/Oil) - Export Field Missing**

**Field Definition (Section13.js:1032-1036):**
```javascript
j: {
  fieldId: "j_115",
  type: "editable",          // ✅ Correct: Plain editable like k_52
  value: "0.90",             // ✅ Correct: Decimal format
  section: "mechanicalLoads",
}
```

**FileHandler.js Export List (line 809):**
```javascript
// Section 13: Mechanical Loads
"d_113", "f_113", "j_115", "d_116", "d_118", "g_118", "l_118", "d_119", "l_119", "k_120",
```

**Status:** ✅ Field IS in export list

**ExcelMapper Mapping (ExcelMapper.js:188):**
```javascript
J115: "j_115",  // ✅ Mapped
```

**Problem:** Despite being mapped and in export list, review actual precision handling in state storage.

---

**3. j_116 (Cooling COP) - NOT EXPORTED AT ALL**

**Field Definition (Section13.js:1090-1095):**
```javascript
j: {
  fieldId: "j_116",
  type: "editable",          // ✅ Correct: Plain editable
  value: "2.66",             // ✅ Correct: Decimal with 2dp
  section: "mechanicalLoads",
  classes: ["user-input", "editable"],
}
```

**FileHandler.js Export List (line 809):**
```javascript
// Section 13: Mechanical Loads
"d_113", "f_113", "j_115", "d_116", "d_118", "g_118", "l_118", "d_119", "l_119", "k_120",
//                                   ❌ j_116 MISSING
```

**ExcelMapper Mapping:** ❌ **NOT MAPPED** (neither REPORT nor REFERENCE sheets)

**Calculated Dependency (Section13.js:880-889):**
```javascript
// f_113 (HSPF) slider exists - when d_113="Heatpump", j_116 is calculated from f_113
// HOWEVER: User can also manually edit j_116 for non-heatpump or custom scenarios
```

**Conditional Logic Required:**
- **IF** `d_113 === "Heatpump"` → j_116 is **calculated** from f_113, skip import
- **ELSE** → j_116 is **user-editable**, import the value

---

**4. l_118 (ACH Ventilation Rate) - Precision Loss**

**Field Definition (Section13.js:1216-1221):**
```javascript
l: {
  fieldId: "l_118",
  type: "editable",          // ✅ Correct: Plain editable
  value: "3",                // ⚠️ ISSUE: Integer default, but supports decimals
  section: "mechanicalLoads",
  tooltip: true,
}
```

**Status:** ✅ Field IS in export list

**Problem:** Default value is integer "3", but field should support decimals like "3.50" (from ReferenceState.js:118). State storage may be rounding or truncating.

---

## 📋 Workplan

### Implementation Order

**IMPORTANT:** Complete each phase fully and test before proceeding to next phase.

1. ✅ **Phase 1** - Analysis & Documentation (COMPLETE)
2. ✅ **Phase 2** - Fix d_118 field definition + add event handler (COMPLETE - **PARTIAL ISSUES REMAIN**)
3. ✅ **Phase 2.5** - Fix j_115 mode switch override bug (COMPLETE)
4. ✅ **Phase 2.6** - Fix refreshUI() display formatting (COMPLETE)
5. ⏸️ **Phase 2.7** - Fix j_116 userModified + ghosting (IN PROGRESS)
6. ⏸️ **Phase 3** - Fix d_118 import rounding (4.80 → 5.00) (CRITICAL BUG)
7. ⏸️ **Phase 4** - Array-based normalization in ExcelMapper
8. ⏸️ **Phase 5** - Add j_116 to ExcelMapper with conditional logic
9. ⏸️ **Phase 6** - Test full CSV export/import precision cycle
10. ⏸️ **Phase 7** - Apply to Reference sheet

---

## 🚨 CURRENT STATUS - November 12, 2025 (Session 3)

### ✅ FIXES COMPLETED

**1. j_115 Mode Switch Override Bug (Commits: d6a10dd, 205879d)**
- **Problem:** j_115 imported correctly as "0.92" but reverted to "0.90" after mode switch (Target ↔ Reference)
- **Root Cause:** `handleHeatingSystemChangeForGhosting()` unconditionally overwrote j_115 with default "0.90"
- **Fix:** Added `j_115_userModified` flag tracking to TargetState/ReferenceState, added check in ghosting handler
- **Status:** ✅ FIXED - j_115 now preserves user values across mode switches

**2. Display Precision Loss (Commit: bb99e35)**
- **Problem:** Fields displayed as "0.9", "89", "3" instead of "0.90", "89.00", "3.00"
- **Root Cause:** refreshUI() used raw textContent without formatting
- **Fix:** Applied `formatNumber(value, "number-2dp")` to all contenteditable fields, updated l_118 default to "3.00"
- **Status:** ✅ FIXED - All editable fields now display with 2dp precision

**3. j_116 Mode Switch Override Bug (Commit: 06fe634)**
- **Problem:** j_116 (Cooling COP) user edits reset to "2.66" after mode switch
- **Root Cause:** j_116 NOT in userModified flag tracking
- **Fix:** Added j_116 to userModified tracking in both TargetState and ReferenceState, added check in ghosting handler
- **Status:** ✅ FIXED - Same pattern as j_115

**4. d_118 Import Rounding Bug (Commit: ea7651b)**
- **Problem:** Imported value "4.80" became "5.00" after import
- **Root Cause:** ExcelMapper.js used `Math.round()` from old integer slider days
- **Fix:** Changed to `.toFixed(2)` for decimal preservation in lines 549/552
- **Status:** ✅ FIXED - d_118 now imports and displays "4.80" correctly

**5. Section13.js fieldFormats Verbosity Reduction (Commit: b7207ae)**
- **Problem:** fieldFormats object was 47 lines with verbose inline comments
- **Fix:** Condensed to 19 lines by grouping fields on same line, keeping only category comments
- **Status:** ✅ FIXED - Code is more maintainable and easier to scan

**6. j_116 Export with Precision Formatting (Commit: 273aa19, cf150c7)**
- **Problem:** j_116 not exported at all, and U-values (g_88-g_93) needed 3dp precision
- **Fix (273aa19):** Added j_116 to FileHandler export list (line 809)
- **Fix (cf150c7):** Added export formatting - j_116 exports with 2dp (2.66, 3.30), U-values with 3dp
- **Status:** ✅ FIXED - j_116 exports correctly, U-values maintain thermal accuracy

**7. Import UserModified Flag Not Set (Commit: 719b909)**
- **Problem:** After importing j_115=0.92, mode switch reset it to default 0.90
- **Root Cause:** Import uses source="imported" but userModified flag only set for source="user-modified"
- **Fix:** Modified TargetState/ReferenceState setValue() to treat "imported" same as "user-modified"
- **Status:** ✅ FIXED - Imported j_115/j_116/f_113 values persist across mode switches

**8. j_116 Import Mappings Added (Commit: 43affe8)**
- **Problem:** j_116 exported but did NOT import (not in ExcelMapper mappings)
- **Fix:** Added J116 → j_116 and J116 → ref_j_116 to ExcelMapper import mappings
- **Status:** ✅ FIXED - j_116 values now import correctly and display in DOM after refreshUI timing fix

**9. DOM Not Updating After Import (Commit: 42e9c9b)**
- **Problem:** Imported j_116 values in StateManager and used in calculations, but DOM showed defaults
- **Root Cause:** refreshUI() called BEFORE syncFromGlobalState() updated TargetState/ReferenceState
- **Fix:** Added refreshUI() call AFTER syncFromGlobalState() in syncPatternASections loop
- **Status:** ✅ FIXED - Imported values now display immediately in DOM

**10. Conditional j_116 Export - Simplified Approach (Commit: 661d32f)**
- **Problem:** Need to prevent j_116 import when d_113="Heatpump" (calculated field)
- **User's Elegant Solution:** Instead of complex conditional IMPORT, use conditional EXPORT
- **Implementation:** When exporting j_116, check if d_113="Heatpump" → export empty string, else export formatted value
- **Why It Works:** Empty CSV values naturally skipped by import validation; Heatpump projects never export j_116 → can't overwrite calculated value
- **Status:** ✅ FIXED - Simpler, safer, more maintainable than conditional import approach

### ❌ REMAINING CRITICAL ISSUES

**11. Import Calculation Order Bug - d_113 Dependency (OPTIONAL - EVALUATE AFTER TESTING)**
- **Previous Problem:** When importing file with d_113="Gas", Reference e_10 calculated incorrectly (>900 instead of 838.0)
- **Conditional Export Solution:** By using conditional EXPORT instead of conditional IMPORT, this may no longer be an issue
- **Hypothesis:** Empty j_116 values in Heatpump CSVs mean no overwrite → calculated value preserved → calculation order less critical
- **Status:** ⏸️ EVALUATE AFTER TESTING - May not need priority field import anymore if conditional export resolves the issue

### 📊 Test Results - Session 3

**Working:**
- ✅ j_115 imports correctly as "0.92" and persists across mode switches (Fix: commit 719b909)
- ✅ j_116 user edits persist across mode switches (when d_113 ≠ Heatpump)
- ✅ j_116 exports with 2dp precision (2.66, 3.30) instead of 16+ decimals (Fix: commit cf150c7)
- ✅ j_116 imports correctly and displays in DOM (Fix: commits 43affe8, 42e9c9b)
- ✅ j_116 conditional export - Heatpump projects export empty string, Gas/Oil export value (Fix: commit 661d32f)
- ✅ U-values (g_88-g_93) export with 3dp precision for thermal accuracy (Fix: commit cf150c7)
- ✅ d_118 imports and displays "4.80" correctly (no rounding)
- ✅ Display shows "0.90", "0.92", "3.00", "4.80" with 2dp precision
- ✅ l_118 has correct "3.00" default
- ✅ Array-based normalization reduces ExcelMapper code duplication (commit 32a632e)

**To Test:**
- ⏳ Verify e_10 (Reference total) calculates correctly with conditional j_116 export approach
- ⏳ Test full round-trip: Heatpump project exports j_116="" → import skips → calculated value preserved
- ⏳ Test full round-trip: Gas project exports j_116="2.67" → import applies → user value preserved

---

### Phase 1: Field Type & Precision Audit ✅ **[ANALYSIS COMPLETE]**

- [x] **Task 1.1:** Document k_52 success pattern (editable + 2dp storage)
- [x] **Task 1.2:** Identify why d_118 loses precision (percentage type + integer step)
- [x] **Task 1.3:** Confirm j_115 is mapped and exported (✅ confirmed)
- [x] **Task 1.4:** Confirm j_116 is NOT mapped/exported (❌ confirmed missing)
- [x] **Task 1.5:** Confirm l_118 precision handling (potential rounding in storage)

---

### Phase 2: Fix d_118 (HRV Efficiency) - Support 2dp Precision

**Current Behavior:**
- Slider: Integer 0-100 (step: 1)
- Storage: "89" (no decimals)
- Excel Import: 89.4% → 89% (loses 0.4%)

**Proposed Fix:**

**Option A: Change to Editable Numeric Field (like j_115, j_116, k_52)** ⭐ **RECOMMENDED**

Convert d_118 from percentage slider to editable numeric field, following proven k_52 pattern:

```javascript
// Section13.js field definition (BEFORE - remove slider markup)
d: {
  fieldId: "d_118",
  type: "percentage",       // ❌ REMOVE: Slider with integer steps
  value: "89",
  min: 0,
  max: 100,
  step: 1,
}

// Section13.js field definition (AFTER - editable field)
d: {
  fieldId: "d_118",
  type: "editable",         // ✅ Change to editable (like j_115, j_116, k_52)
  value: "89.00",           // ✅ 2dp default
  classes: ["user-input"],  // ✅ Add styling classes
  section: "mechanicalLoads",
  tooltip: true,            // Keep existing tooltip
  label: "HRV/ERV SRE %",
}
```

**Benefits:**
- ✅ **User can type exact values:** 89.4, 89.67, 50.25, etc.
- ✅ **No slider precision issues:** User types "89.4" directly
- ✅ **Consistent with other coefficients:** Matches j_115, j_116, k_52 UX
- ✅ **Full 0-100 range:** No slider step constraints
- ✅ **Simpler implementation:** Reuse existing editable field handlers

**Tradeoffs:**
- ⚠️ Loses visual slider feedback (but gains precision)
- ⚠️ Users must know valid range (0-100%) - can add validation

---

**Option B: Keep Slider with 0.1 Steps** ❌ **NOT RECOMMENDED**

**Why this fails:**
```javascript
// Slider with 0.1 steps across 0-100 range
step: 0.1,  // Creates 1000 positions (100 / 0.1)
```

**Problems:**
- 🚫 **Nearly impossible to land on desired value** (1000 slider positions)
- 🚫 **Poor mobile/touch experience** (too sensitive)
- 🚫 **Pixel precision issues** (slider thumb too fine-grained)
- 🚫 **User frustration** trying to hit 89.4 vs 89.3 vs 89.5

**Conclusion:** 0.1 step sliders are impractical for 0-100 range. Users need direct numeric input.

---

**Option C: Change to Coefficient Slider (0-1 range)** ❌ **NOT RECOMMENDED**
```javascript
d: {
  fieldId: "d_118",
  type: "coefficient_slider",
  value: "0.89",            // Store as 0-1 decimal
  min: 0,
  max: 1,
  step: 0.001,              // 0.1% precision in 0-1 range
}
```

**Problems:**
- 🚫 **Still 1000 slider positions** (1.0 / 0.001)
- 🚫 **Changes user mental model** (89% → 0.89 is confusing)
- 🚫 **Inconsistent with field label** ("SRE %" implies percentage display)

---

**Recommendation:** **Option A - Editable Numeric Field**
- Proven pattern (k_52, j_115, j_116 all work correctly)
- User types exact value they want (89.4, 67.25, etc.)
- Simple implementation, reuses existing handlers
- Maintains 2dp precision through export/import

---

**Task 2.2: Add d_118 Event Handler for Calculations**

After changing the field definition, verify d_118 triggers proper recalculation. The field will automatically be picked up by the existing `handleEditableBlur` handler (lines 2021-2075) because it has `classes: ["user-input"]`.

**Verify existing handler pattern** (Section13.js lines 1746-1766):
```javascript
// This code already exists - editable fields are auto-detected
const editableFields = sectionElement.querySelectorAll(".editable.user-input");
editableFields.forEach((field) => {
  field.setAttribute("contenteditable", "true");
  field.addEventListener("blur", handleEditableBlur);  // ✅ Auto-attached
});
```

**Add d_118 calculation trigger** to `handleEditableBlur` function (after line 2070):
```javascript
// Section13.js - handleEditableBlur() - Add after j_115 block
if (fieldId === "j_116") {
  calculateAll(); // Keep this trigger for COP changes
  ModeManager.updateCalculatedDisplayValues();
}

// ✅ ADD THIS BLOCK for d_118:
if (fieldId === "d_118") {
  calculateAll(); // HRV/ERV efficiency affects ventilation energy calcs
  ModeManager.updateCalculatedDisplayValues();
}
```

**Behavior:**
1. User types "89.4" → blur event fires
2. `handleEditableBlur` parses "89.4" → numericValue = 89.4
3. Formats display as "89.40" (2dp format)
4. Stores "89.4" to StateManager via `ModeManager.setValue()`
5. Triggers `calculateAll()` → ventilation energy recalculates
6. Updates DOM with new calculated values

**Mode-awareness:**
- ✅ Uses `ModeManager.setValue()` (not direct StateManager) for proper Target/Reference handling
- ✅ Respects current mode (Target vs Reference)
- ✅ Publishes changes to StateManager after mode checks

---

### Phase 3: Implement Array-Based Normalization (Eliminate Code Bloat)

**Problem:** Field-by-field normalization creates massive code duplication and maintenance burden.

**Solution:** Define arrays for different numeric types, apply normalization in loops.

---

**Task 3.1: Define Numeric Field Arrays in ExcelMapper**

Add at the top of `mapExcelToReportModel()` and `mapExcelToReferenceModel()`:

```javascript
// ExcelMapper.js - Add after extractedValue initialization, before field loop

// ✅ DECIMAL COEFFICIENT FIELDS (0-1 range, store as "0.90" format)
// These are AFUE/COP values that may come from Excel as percentage (90%) or decimal (0.90)
const decimalCoefficientFields = [
  "k_52",   // S07: DHW AFUE
  "j_115",  // S13: Heating AFUE (Gas/Oil)
  "j_116",  // S13: Cooling COP
];

// ✅ STANDARD 2DP NUMERIC FIELDS (store as "3.50" format)
// These are rates/factors that should preserve 2 decimal places
const standard2dpFields = [
  "l_118",  // S13: ACH Ventilation Rate
  "d_119",  // S13: Per Person Ventilation Rate (l/s per person)
  "f_113",  // S13: HSPF (already handled by coefficient_slider, but include for consistency)
];

// ✅ PERCENTAGE NUMERIC FIELDS (0-100 range, store as "89.40" format)
// These are percentage values that need decimal precision (not integer sliders)
const percentage2dpFields = [
  "d_118",  // S13: HRV/ERV SRE % (NOW EDITABLE, not slider)
  "d_52",   // S07: DHW Efficiency Factor % (slider, but may need 2dp support)
  "d_53",   // S07: DWHR Recovery % (slider)
  "d_97",   // S11: Thermal Bridge Penalty %
  "d_59",   // S08: Indoor RH %
];
```

---

**Task 3.2: Apply Array-Based Normalization**

Replace individual `if (fieldId === "...")` blocks with loop-based normalization:

```javascript
// ExcelMapper.js - mapExcelToReportModel() - AFTER all individual field extractions

// ✅ NORMALIZE: Decimal Coefficient Fields (0-1 range)
if (decimalCoefficientFields.includes(fieldId)) {
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
      extractedValue = (numVal / 100).toFixed(2); // 90 → "0.90"
    } else {
      extractedValue = numVal.toFixed(2);         // 0.90 → "0.90"
    }
  } else {
    // Field-specific defaults
    const defaults = { "k_52": "0.90", "j_115": "0.90", "j_116": "2.66" };
    extractedValue = defaults[fieldId] || "1.00";
  }
}

// ✅ NORMALIZE: Standard 2dp Numeric Fields
if (standard2dpFields.includes(fieldId)) {
  const numVal = parseFloat(extractedValue);
  if (!isNaN(numVal)) {
    extractedValue = numVal.toFixed(2); // 3.5 → "3.50"
  } else {
    // Field-specific defaults
    const defaults = { "l_118": "3.00", "d_119": "14.00", "f_113": "12.50" };
    extractedValue = defaults[fieldId] || "0.00";
  }
}

// ✅ NORMALIZE: Percentage 2dp Fields (0-100 range)
if (percentage2dpFields.includes(fieldId)) {
  let numVal;
  if (typeof extractedValue === "string" && extractedValue.endsWith("%")) {
    numVal = parseFloat(extractedValue.replace("%", ""));
  } else if (typeof extractedValue === "number") {
    // If 0-1 decimal (0.894), convert to percentage (89.40)
    numVal = (extractedValue >= 0 && extractedValue <= 1)
      ? extractedValue * 100
      : extractedValue;
  } else {
    numVal = parseFloat(extractedValue);
  }

  if (!isNaN(numVal)) {
    extractedValue = numVal.toFixed(2); // 89.4 → "89.40"
  } else {
    // Field-specific defaults
    const defaults = {
      "d_118": "89.00",
      "d_52": "300.00",
      "d_53": "0.00",
      "d_97": "5.00",
      "d_59": "45.00"
    };
    extractedValue = defaults[fieldId] || "0.00";
  }
}
```

---

**Task 3.3: Apply Same Arrays to Reference Normalization**

In `mapExcelToReferenceModel()`, use same arrays but check `baseFieldId`:

```javascript
// ExcelMapper.js - mapExcelToReferenceModel() - Use same arrays

const baseFieldId = fieldId.replace(/^ref_/, "");

// ✅ NORMALIZE: Decimal Coefficient Fields
if (decimalCoefficientFields.includes(baseFieldId)) {
  // ... same logic as Target fields
}

// ✅ NORMALIZE: Standard 2dp Numeric Fields
if (standard2dpFields.includes(baseFieldId)) {
  // ... same logic as Target fields
}

// ✅ NORMALIZE: Percentage 2dp Fields
if (percentage2dpFields.includes(baseFieldId)) {
  // ... same logic as Target fields
}
```

**Task 3.2: Update Default Values in Section Definitions**

```javascript
// Section13.js - Update default values to show 2dp precision
j: {
  fieldId: "j_115",
  type: "editable",
  value: "0.90",  // ✅ Already correct
}

l: {
  fieldId: "l_118",
  type: "editable",
  value: "3.00",  // ✅ Change from "3" to "3.00"
}
```

**Task 3.3: Verify StateManager Storage Preserves Precision**

Test that when storing "0.94" or "3.50", StateManager doesn't truncate to "0.9" or "3.5"

Check: `StateManager.setValue("j_115", "0.94", "user-modified")`
Verify: `StateManager.getValue("j_115") === "0.94"` (not "0.9")

---

### Phase 4: Add j_116 (Cooling COP) to Export/Import with Conditional Logic

**Task 4.1: Add to FileHandler Export List**

```javascript
// FileHandler.js line 809 - Add j_116 after j_115
// Section 13: Mechanical Loads
"d_113", "f_113", "j_115", "j_116", "d_116", "d_118", "g_118", "l_118", "d_119", "l_119", "k_120",
//                          ^^^^^^^^ ADD THIS
```

**Task 4.2: Add to ExcelMapper Mappings**

```javascript
// ExcelMapper.js - excelReportInputMapping (add after J115)
J116: "j_116",  // Cooling COP (editable)

// ExcelMapper.js - excelReferenceInputMapping (add after J115)
J116: "ref_j_116",  // Cooling COP (editable)
```

**Task 4.3: Add Conditional Import Logic in FileHandler**

```javascript
// FileHandler.js - updateStateFromImportData() - Add special handling before validation loop

// ✅ CONDITIONAL IMPORT: j_116 (Cooling COP)
// If d_113="Heatpump", j_116 is calculated from f_113 → skip import
// Otherwise, j_116 is user-editable → import the value
if (importedData.hasOwnProperty("j_116")) {
  const heatingSystem = importedData.d_113 || this.stateManager.getValue("d_113");

  if (heatingSystem === "Heatpump") {
    console.log("[FileHandler] d_113=Heatpump detected - skipping j_116 import (calculated from f_113)");
    delete importedData.j_116; // Remove from import to preserve calculated value
  } else {
    console.log(`[FileHandler] d_113=${heatingSystem} - importing j_116 as user-editable value`);
    // Keep j_116 in importedData for normal import flow
  }
}

// ✅ REFERENCE MODE: Same logic for ref_j_116
if (importedData.hasOwnProperty("ref_j_116")) {
  const refHeatingSystem = importedData.ref_d_113 || this.stateManager.getValue("ref_d_113");

  if (refHeatingSystem === "Heatpump") {
    console.log("[FileHandler] ref_d_113=Heatpump detected - skipping ref_j_116 import");
    delete importedData.ref_j_116;
  } else {
    console.log(`[FileHandler] ref_d_113=${refHeatingSystem} - importing ref_j_116`);
  }
}
```

**Task 4.4: Add j_116 Normalization to ExcelMapper**

```javascript
// ExcelMapper.js - mapExcelToReportModel() - Add normalization
if (fieldId === "j_116") {
  const numVal = parseFloat(extractedValue);
  if (!isNaN(numVal)) {
    extractedValue = numVal.toFixed(2); // Ensure 2dp: "2.66"
  } else {
    extractedValue = "2.66"; // Default COP for cooling
  }
}
```

**Task 4.5: Update Section13 Calculation Logic**

Ensure that when d_113 changes FROM non-Heatpump TO Heatpump, j_116 gets recalculated from j_113:

```javascript
// Section13.js - In heating system change handler
if (newHeatingSystem === "Heatpump") {
  // Recalculate j_116 from j_113 (cooling COP from heating COP)
  const j_113_value = TargetState.getValue("j_113") || 2.7;
  const j_116_calculated = j_113_value; // Or whatever the formula is
  TargetState.setValue("j_116", j_116_calculated.toFixed(2), "calculated");
}
```

---

### Phase 5: Testing & Validation

**Test Case 1: k_52 Baseline (Should Pass)**
1. Set k_52 = 0.94
2. Export CSV
3. Verify CSV contains: `...,0.94,...`
4. Import CSV
5. Verify k_52 = 0.94 (not 0.9)

**Test Case 2: d_118 Precision (Current: FAIL → Target: PASS)**
1. Set d_118 = 89.4%
2. Export CSV
3. Verify CSV contains: `...,89.40,...` (or `...,89.4,...`)
4. Import CSV
5. Verify d_118 = 89.4% (not 89%)
6. Verify calculated fields use 0.894 for recovery (not 0.89)

**Test Case 3: j_115 Precision**
1. Set j_115 = 0.94
2. Export CSV
3. Verify CSV contains: `...,0.94,...`
4. Import CSV
5. Verify j_115 = 0.94

**Test Case 4: l_118 Precision**
1. Set l_118 = 3.50
2. Export CSV
3. Verify CSV contains: `...,3.50,...` (not `...,3.5,...` or `...,4,...`)
4. Import CSV
5. Verify l_118 = 3.50

**Test Case 5: j_116 Conditional Import**

**5a. Heatpump System (Calculated)**
1. Set d_113 = "Heatpump", f_113 = 12.5
2. Verify j_116 is calculated (not editable)
3. Export CSV (j_116 exports current calculated value)
4. Manually edit CSV to set j_116 = 9.99 (wrong value)
5. Import CSV
6. **Expected:** j_116 should IGNORE imported 9.99 and recalculate from f_113
7. Verify j_116 matches calculated value from f_113 (not 9.99)

**5b. Non-Heatpump System (User-Editable)**
1. Set d_113 = "Gas", j_116 = 2.85
2. Export CSV
3. Verify CSV contains: `...,2.85,...`
4. Change j_116 to 3.10 in CSV
5. Import CSV
6. **Expected:** j_116 should UPDATE to 3.10 (import honored)
7. Verify j_116 = 3.10

**Test Case 6: Large Building Impact**
1. Set up large building (h_15 = 10000 m²)
2. Set d_118 = 89.4% (precise)
3. Calculate ventilation energy and verify high precision results
4. Export → Import cycle
5. Verify no drift in final TEUI calculations (h_10 value)

---

### Phase 6: Reference Sheet Handling

Apply same fixes to REFERENCE sheet mappings in ExcelMapper.js:

**Task 6.1: Add ref_j_116 Normalization**
```javascript
// ExcelMapper.js - mapExcelToReferenceModel()
if (baseFieldId === "j_116") {
  const numVal = parseFloat(extractedValue);
  if (!isNaN(numVal)) {
    extractedValue = numVal.toFixed(2);
  } else {
    extractedValue = "2.66";
  }
}
```

**Task 6.2: Update Reference d_118, j_115, l_118**
Apply same normalization logic as Target fields (see Phase 3)

---

## 📊 Success Metrics

1. **Precision Preservation:** All AFUE/COP/ACH values maintain 2dp precision through export→import
2. **Calculation Accuracy:** Large building TEUI calculations remain stable after round-trip (no drift)
3. **Conditional Logic:** j_116 correctly skips import for Heatpump systems, imports for others
4. **User Experience:** No breaking changes to UI (sliders still work, just with 0.1 precision)
5. **Reference Parity:** Reference mode maintains same precision as Target mode

---

## 🚨 Critical Notes

### DO NOT Change These Working Patterns:
- ✅ k_52 format (0.90 decimal string) - **PROVEN TO WORK**
- ✅ FileHandler CSV export/import structure - **WORKING CORRECTLY**
- ✅ ExcelMapper normalization pattern - **CORRECT APPROACH**

### DO Change These Issues:
- ❌ d_118 slider step from 1 to 0.1
- ❌ d_118 default value from "89" to "89.00"
- ❌ l_118 default value from "3" to "3.00"
- ❌ Add j_116 to export list and ExcelMapper mappings
- ❌ Add conditional import logic for j_116

### Key Architectural Points:
1. **State Storage is King:** Values stored in StateManager dictate export precision
2. **Type Matters:** "editable" preserves decimals, "percentage" with step:1 truncates
3. **ExcelMapper Normalization:** Critical bridge between Excel formats and internal storage
4. **Round-Trip Testing:** Always test export→import→verify cycle

---

## 📅 Implementation Order

1. **Phase 2** (d_118 fix) - **HIGHEST IMPACT** - Large buildings need this
2. **Phase 3** (j_115, l_118 verification) - **QUICK WIN** - May already work, just verify
3. **Phase 4** (j_116 addition) - **MODERATE COMPLEXITY** - New conditional logic
4. **Phase 5** (Testing) - **CRITICAL** - Validate all changes
5. **Phase 6** (Reference mode) - **COMPLETENESS** - Ensure dual-state consistency

---

## 🔧 Files to Modify

### Primary Changes:
1. **src/sections/Section13.js** - Update field definitions (d_118 step, l_118 default)
2. **src/core/ExcelMapper.js** - Add normalizations for d_118, j_115, j_116, l_118
3. **src/core/FileHandler.js** - Add j_116 to export list + conditional import logic

### Verification Required:
4. **src/core/StateManager.js** - Verify string precision is preserved (no truncation)

### Testing:
5. Create test CSV files with precise values (89.40, 0.94, 3.50, 2.66)
6. Test both Target and Reference import/export flows

---

## 🔧 TECHNICAL SOLUTION: Import Calculation Order Fix

### Problem Summary
When importing Excel files with d_113="Gas", Reference e_10 miscalculates (>900 vs expected 838.0). If d_113 is manually set to "Gas" FIRST, then the same file imports correctly.

### Root Cause
Import process sets ALL fields simultaneously with listeners muted, then unmutes and triggers calculations. But Section 13 calculations depend on d_113 (heating system type) being set FIRST to properly initialize conditional fields (j_115, j_116, ghosting states).

### Solution Approach

**Option A: Priority Field Import (RECOMMENDED)**

Add a two-phase import process for Section 13 fields:

```javascript
// FileHandler.js - Add priority field handling

// Phase 1: Set priority fields FIRST (with listeners active)
const priorityFields = ['d_13', 'd_113', 'ref_d_13', 'ref_d_113']; // Heating system selectors

// Phase 2: Set remaining fields after priority fields are established
const remainingFields = allFields.filter(f => !priorityFields.includes(f));

// Implementation:
1. Mute listeners
2. Set priority fields (d_13, d_113) → unmute → trigger conditional UI updates
3. Mute listeners again
4. Set remaining Section 13 fields
5. Unmute listeners → trigger full calculations
```

**Why this works:**
- d_113 triggers `handleHeatingSystemChangeForGhosting()` which sets up conditional field states
- j_115 is only active when d_113 ≠ "Heatpump" (ghosted otherwise)
- j_116 is only active when d_113 ≠ "Heatpump" AND d_116 = "Cooling"
- Setting d_113 FIRST ensures these conditions are evaluated BEFORE importing coefficient values

**Option B: Defer Calculations Until All Fields Set (NOT RECOMMENDED)**

Track when import is in progress, defer ALL calculations until complete. Problem: May miss critical validation or cascade updates.

---

## 🎯 j_116 Conditional Import Logic

### Requirements
- **Export:** Always export j_116 (regardless of heating system type)
- **Import:** Conditionally import based on d_113 value:
  - If d_113 = "Heatpump" → SKIP j_116 (field is calculated, not user-editable)
  - If d_113 ≠ "Heatpump" → IMPORT j_116 (field is user-editable)

### Implementation Strategy

```javascript
// ExcelMapper.js - Add j_116 conditional import

// 1. Add j_116 to REPORT sheet mapping (Column K, Row 118)
if (fieldId === "j_116") {
  const cellRef = "K118";
  const cellValue = worksheet.getCell(cellRef).value;

  // Extract and normalize to 2dp (COP coefficient)
  if (cellValue !== null && cellValue !== undefined) {
    extractedValue = normalizeCoefficient(cellValue); // Returns "2.66" format
  }
}

// 2. Add conditional import check in FileHandler.js
// After Priority Phase (d_113 is already set)
const currentD113 = window.TEUI.StateManager.getValue('d_113');
const isHeatpump = currentD113 === "Heatpump";

// Skip j_116 if Heatpump (it's calculated in this mode)
if (fieldId === 'j_116' && isHeatpump) {
  console.log('[FileHandler] Skipping j_116 import - calculated when d_113=Heatpump');
  continue; // Skip this field
}

// 3. Add same logic for Reference sheet (ref_j_116)
const currentRefD113 = window.TEUI.StateManager.getValue('ref_d_113');
const isRefHeatpump = currentRefD113 === "Heatpump";

if (fieldId === 'ref_j_116' && isRefHeatpump) {
  console.log('[FileHandler] Skipping ref_j_116 import - calculated when ref_d_113=Heatpump');
  continue;
}
```

### Export Mapping (Always Export)
```javascript
// FileHandler.js - Add j_116 to export list (line ~809)
const section13Fields = [
  'd_13', 'd_113', 'f_113', 'j_113', 'h_113', 'd_114', 'f_114', 'l_113',
  'd_115', 'f_115', 'h_115', 'l_115', 'j_115', // ✅ j_115 already exported
  'd_116', 'l_116', 'l_114', 'd_117', 'j_116', // ✅ ADD j_116 here
  // ... rest of fields
];
```

---

## ✅ Definition of Done

### Phase 1-2: Core Fixes (Session 2-3)
- [x] Fix j_115 userModified flag and ghosting handler (commits d6a10dd, 205879d)
- [x] Fix refreshUI() display formatting for 2dp precision (commit bb99e35)
- [x] Fix j_116 userModified flag and ghosting handler (commit 06fe634)
- [x] Fix d_118 import rounding (4.80 → 5.00) (commit ea7651b)
- [x] Reduce Section13.js fieldFormats verbosity (commit b7207ae)
- [x] Array-based normalization in ExcelMapper (commit 32a632e)

### Phase 3: Export/Import Implementation (Session 3)
- [x] Add j_116 to FileHandler export list (commit 273aa19)
- [x] Export precision formatting: j_116 2dp, U-values 3dp (commit cf150c7)
- [x] Fix imported values not persisting across mode switches (commit 719b909)
- [x] Add j_116 to ExcelMapper import mappings (commit 43affe8)
- [x] Fix DOM not updating after import (refreshUI timing) (commit 42e9c9b)
- [x] Implement conditional j_116 EXPORT (simplified approach) (commit 661d32f)

### Phase 4: Testing & Validation (Ready for User Testing)
- [ ] Test j_116 conditional export: Heatpump → empty, Gas → value exported
- [ ] Test full CSV export/import precision cycle (j_115, j_116, d_118, l_118)
- [ ] Test import with d_113="Gas" → verify e_10 calculates correctly (was 838.8 vs Excel 837.9)
- [ ] Test j_116 round-trip: Gas project preserves user value after export→import
- [ ] Test j_116 round-trip: Heatpump project preserves calculated value after export→import
- [ ] Large building test case shows no calculation drift after round-trip
- [ ] Reference mode maintains same precision as Target mode

### Optional: Priority Import (Evaluate After Testing)
- [ ] Implement d_113 priority field import IF needed (two-phase import)
- [ ] Test if conditional export eliminates need for priority import

---

**Document Status:** Session 3 - Implementation In Progress
**Priority:** HIGH - Affects calculation accuracy for large buildings
**Risk:** MEDIUM - Import order changes affect calculation cascade
**Estimated Remaining Effort:** 2-3 hours (import order + j_116 mapping + testing)

---

## 🔍 ARCHITECTURAL ANALYSIS: e_50 vs j_115/j_116 (Session 3 - Nov 12)

### Problem Statement

After implementing S07 ghosting pattern (commit 3d8e3a6), DOM refreshUI remains buggy for j_115/j_116:
- Entered values don't "take" immediately (show after mode switch)
- Values entered after import show Target value on blur
- Mode switch required to see entered values
- State isolation appears broken despite following S07 pattern

### Root Cause Hypothesis

**Anti-Pattern 7 violation**: Section 13 likely has StateManager listeners for its **own input fields** (j_115, j_116), causing double calculations that interfere with normal DOM update flow.

Reference: `docs/development/history (completed)/4012-CHEATSHEET.md` Lines 211-295

### What e_50 Gets RIGHT (Section 07 Pattern)

**1. Clean Event Handler (handleEditableBlur - S07:1462-1490)**
```javascript
function handleEditableBlur(event) {
  const fieldElement = this;
  const fieldId = fieldElement.getAttribute("data-field-id");
  if (!fieldId) return;

  let rawTextValue = fieldElement.textContent.trim();
  let numericValue = window.TEUI?.parseNumeric?.(rawTextValue, NaN) ?? parseFloat(rawTextValue.replace(/[$,%]/g, ""));

  if (isNaN(numericValue)) {
    const previousValue = ModeManager.getValue(fieldId) || "0";
    numericValue = window.TEUI?.parseNumeric?.(previousValue, 0) ?? 0;
  }

  const formatType = fieldId === "k_52" ? "number-2dp" : "number-2dp-comma";
  const valueToStore = numericValue.toString();
  const formattedDisplay = window.TEUI?.formatNumber?.(numericValue, formatType) ?? valueToStore;
  fieldElement.textContent = formattedDisplay; // ✅ IMMEDIATE DOM UPDATE

  // ✅ PATTERN A: Use ModeManager.setValue for proper state separation
  const currentValue = ModeManager.getValue(fieldId);
  if (currentValue !== valueToStore) {
    ModeManager.setValue(fieldId, valueToStore, "user-modified"); // ✅ Publishes ref_e_50 in Reference mode
    calculateAll(); // ✅ Single calculation pass
    ModeManager.updateCalculatedDisplayValues(); // ✅ DOM update for calculated fields only
  }
}
```

**Key Success Factors:**
- ✅ Immediate `textContent` update (line 1481) - instant visual feedback
- ✅ `ModeManager.setValue()` publishes correct prefixed value to StateManager
- ✅ Single `calculateAll()` call - no listener interference
- ✅ `updateCalculatedDisplayValues()` only updates calculated fields, not editable ones

**2. NO Self-Listening (S07:1655-1702)**
```javascript
function initializeEventHandlers() {
  const sectionElement = document.getElementById("waterUse");
  if (!sectionElement) return;

  // ✅ Setup editable field handlers - NO StateManager listeners!
  const editableFields = ["e_49", "e_50", "k_52"];
  editableFields.forEach((fieldId) => {
    const field = sectionElement.querySelector(`[data-field-id="${fieldId}"]`);
    if (field && field.classList.contains("editable") && !field.hasEditableListeners) {
      field.setAttribute("contenteditable", "true");
      field.classList.add("user-input");
      field.addEventListener("blur", handleEditableBlur); // ✅ DOM listener only
      field.hasEditableListeners = true;
    }
  });
}
```

**Critical Insight:** S07 does NOT add StateManager listeners for `e_49`, `e_50`, or `k_52`. User edits trigger calculations via `handleEditableBlur` directly.

**3. External Dependencies Only (S07: StateManager Listeners)**
Section 07 ONLY listens to external dependencies (not shown in grep, but per architecture):
- Listens to `d_20` and `ref_d_20` from Section 03 (climate)
- Does NOT listen to its own input fields

### What j_115/j_116 Get WRONG (Section 13 - Suspected)

**1. handleEditableBlur Appears Correct (S13:2038-2088)**
```javascript
function handleEditableBlur(event) {
  const fieldId = this.getAttribute("data-field-id");
  if (!fieldId) return;

  const newValue = this.textContent.trim();
  const numericValue = window.TEUI.parseNumeric(newValue, NaN);

  if (!isNaN(numericValue)) {
    const formatType = fieldId === "j_115" || fieldId === "l_118" ? "number-2dp" : "number-2dp";
    const formattedDisplay = window.TEUI.formatNumber(numericValue, formatType);
    this.textContent = formattedDisplay; // ✅ Sets formatted display

    if (ModeManager && typeof ModeManager.setValue === "function") {
      ModeManager.setValue(fieldId, valueToStore, "user-modified"); // ✅ Uses ModeManager
    }

    if (fieldId === "j_115") {
      calculateAll(); // ✅ Triggers recalculation
      ModeManager.updateCalculatedDisplayValues();
    }
  }
}
```

**Handler logic looks correct!** So why doesn't it work?

**2. Suspected Anti-Pattern 7 Violation: Self-Listening**

**HYPOTHESIS:** Section 13 likely has StateManager listeners for j_115/j_116, causing:

```javascript
// ❌ SUSPECTED: Section 13 might have this anti-pattern
window.TEUI.StateManager.addListener("j_115", () => {
  calculateAll(); // Double calculation!
});
window.TEUI.StateManager.addListener("ref_j_115", () => {
  calculateAll(); // Double calculation!
});
```

**The Problem Chain (if this exists):**
1. User edits j_115 in Reference mode
2. `handleEditableBlur` → sets `this.textContent` to formatted value ✅
3. `handleEditableBlur` → `ModeManager.setValue("j_115", value)` → publishes `ref_j_115` ✅
4. `handleEditableBlur` → `calculateAll()` (first pass) ✅
5. ❌ **Self-listener fires** → `calculateAll()` (second pass) - interferes with DOM!
6. Second calculation or subsequent `refreshUI()` overwrites the DOM value
7. User sees wrong value until mode switch forces refreshUI

**3. Potential Issue: Ghosting Handler Still Interfering?**

Even after commit 3d8e3a6 removed DOM writes from `handleHeatingSystemChangeForGhosting()`, the ghosting handler is still called during:
- User dropdown changes (d_113)
- Mode switches (via `updateConditionalUI()`)

**Question:** Does the ghosting handler call `refreshUI()` or trigger DOM updates that overwrite user input?

### Debugging Action Items

**Priority 1: Check for Self-Listening Anti-Pattern**
```bash
# Search for StateManager listeners in Section 13
grep -n "StateManager.addListener.*j_115" src/sections/Section13.js
grep -n "StateManager.addListener.*j_116" src/sections/Section13.js
grep -n "StateManager.addListener.*ref_j_115" src/sections/Section13.js
grep -n "StateManager.addListener.*ref_j_116" src/sections/Section13.js
```

**Expected Result:** NO listeners for these fields (they are Section 13's own inputs)

**Priority 2: Verify switchMode Flow**
```javascript
// S13 switchMode (lines 281-301)
switchMode: function (mode) {
  this.currentMode = mode;
  this.refreshUI(); // ← Does this overwrite user input?
  this.updateConditionalUI(); // ← Does ghosting handler interfere?
  this.updateCalculatedDisplayValues();
  this.syncToggleUI(mode);
}
```

**Question:** Does `refreshUI()` read from TargetState/ReferenceState and overwrite DOM, even for fields the user just edited?

**Priority 3: Verify refreshUI Respects User Edits**

In S07, `refreshUI()` updates ALL fields from state. This works because:
1. User edit → immediate `textContent` update
2. User edit → `ModeManager.setValue()` → updates TargetState/ReferenceState
3. User edit → `calculateAll()` runs once
4. No self-listeners to trigger additional refreshUI

In S13, if there are self-listeners:
1. User edit → immediate `textContent` update ✅
2. User edit → `ModeManager.setValue()` → updates TargetState/ReferenceState ✅
3. User edit → `calculateAll()` runs ✅
4. ❌ Self-listener fires → `calculateAll()` or `refreshUI()` runs again
5. ❌ Second update overwrites DOM with stale value

### Recommended Fix (Do NOT implement yet - verify hypothesis first)

1. **Remove self-listeners for j_115, j_116, f_113, d_119, l_118** (all S13 editable inputs)
2. **Keep external dependency listeners** (e.g., d_20 from climate, f_15 from envelope)
3. **Verify handleEditableBlur calls calculateAll() directly** (already does)
4. **Ensure ModeManager.setValue() publishes to StateManager** (already does)

### Architecture Compliance Checklist (Per 4012-CHEATSHEET.md)

- [ ] Anti-Pattern 6: NO cross-section DOM listeners (S13 only listens to own fields)
- [ ] Anti-Pattern 7: NO self-listening (S13 should NOT listen to j_115/j_116/etc via StateManager)
- [ ] Editable fields trigger calculations via handleEditableBlur directly
- [ ] ModeManager.setValue() publishes to StateManager for cross-section communication
- [ ] External dependencies use StateManager listeners (d_20, ref_d_20, etc.)
- [ ] Own input fields use DOM listeners only (blur, change events)

### Findings from Section 13 Investigation

**✅ NO Self-Listeners Found (Nov 12, 2025)**

```bash
$ grep -n "StateManager.addListener.*j_115\|j_116\|ref_j_115\|ref_j_116" Section13.js
# No results - Anti-Pattern 7 NOT present
```

**Section 13 StateManager Listeners (Correct Pattern)**
```bash
$ grep -n "StateManager.addListener" Section13.js
276:        window.TEUI.StateManager.addListener("d_13", () => {
```

Only listens to `d_13` (Reference standard from Section 02) - external dependency. ✅ CORRECT per architecture.

**Anti-Pattern 7 is NOT the root cause.** Something else is wrong.

### Alternative Hypothesis: refreshUI/updateCalculatedDisplayValues Interference

**Issue:** Section 13's `updateCalculatedDisplayValues()` might be updating editable fields, not just calculated ones.

**Evidence from user report:**
> "A value entered after import shows the Target value on blur"

**Potential Flow:**
1. User types j_116 = "3.31" in Reference mode
2. `handleEditableBlur` → sets `this.textContent = "3.31"` ✅
3. `handleEditableBlur` → `ModeManager.setValue("j_116", "3.31")` → publishes `ref_j_116` ✅
4. `handleEditableBlur` → `calculateAll()` → runs both engines ✅
5. `handleEditableBlur` → `ModeManager.updateCalculatedDisplayValues()` ← **SUSPECT**
6. ❌ Does `updateCalculatedDisplayValues()` include j_116 in its fieldFormats and overwrite it?

**Check Required:** Does S13's `calculatedFields` array incorrectly include editable fields (j_115, j_116)?

### Next Investigation Steps

1. **Examine S13 `updateCalculatedDisplayValues()` function** (lines ~304-380)
   - Check if `fieldFormats` or `calculatedFields` includes j_115/j_116
   - These should ONLY include calculated fields, not editable ones

2. **Examine S13 `refreshUI()` function** (lines 397-478)
   - Check if `fieldsToSync` includes j_115/j_116
   - These ARE editable inputs, so they should be in refreshUI
   - But refreshUI should read from TargetState/ReferenceState, not overwrite with defaults

3. **Compare to S07 pattern:**
   - S07's `updateCalculatedDisplayValues()` only updates calculated fields
   - S07's `refreshUI()` updates all fields (dropdowns, editables, sliders)
   - These two functions have distinct responsibilities

### Suspected Root Cause

**S13's `updateCalculatedDisplayValues()` might include j_116 in its field list**, causing it to overwrite the user's DOM edit with a stale StateManager value.

**Why this would cause the reported bugs:**
- User edit → immediate DOM update ✅
- calculateAll() → engines compute correct values ✅
- `updateCalculatedDisplayValues()` → overwrites j_116 DOM with stale value ❌
- Mode switch → `refreshUI()` reads correct value from state → displays correctly ✅

This would explain why values "show after mode switch" - because refreshUI correctly reads from state, but updateCalculatedDisplayValues incorrectly overwrites during the blur handler.

### CONFIRMED: j_116 in updateCalculatedDisplayValues() (Line 323)

```javascript
// S13 updateCalculatedDisplayValues() - Line 308-326
const fieldFormats = {
  // Percentages (0dp)
  m_115: "percent-0dp", m_116: "percent-0dp", m_117: "percent-0dp",

  // Large numbers with commas (2dp)
  d_114: "number-2dp-comma", l_113: "number-2dp-comma", ...

  // Small numbers without commas (2dp)
  h_113: "number-2dp", j_113: "number-2dp", j_114: "number-2dp",
  j_116: "number-2dp",  // ❌ PROBLEM: j_116 is conditionally editable!
  f_117: "number-2dp", j_117: "number-2dp", ...
};
```

**The Issue:** j_116 is included in `fieldFormats`, which means `updateCalculatedDisplayValues()` tries to update it.

**The Protection (Line 348):**
```javascript
if (element && !element.hasAttribute("contenteditable")) {
  // Only update if NOT contenteditable
  element.textContent = formattedValue;
}
```

**Why protection might fail:**
1. **Timing issue**: contenteditable attribute might not be set when updateCalculatedDisplayValues() runs
2. **Ghosting interference**: After unghosting, contenteditable might be "false" (string) not false (boolean)
3. **Conditional state**: j_116 switches between calculated (Heatpump) and editable (Gas/Oil)

### Root Cause Identified

**j_116 should NOT be in fieldFormats** when d_113 != "Heatpump". It's conditionally calculated/editable:
- **d_113="Heatpump"**: j_116 is calculated from j_113 (COP) - SHOULD be in fieldFormats ✅
- **d_113="Gas/Oil/Electricity"**: j_116 is user-editable - should NOT be in fieldFormats ❌

**Current behavior:** j_116 is ALWAYS in fieldFormats, regardless of d_113 value.

**Impact:**
- Gas/Oil mode: User edits j_116 → blur handler updates DOM → calculateAll() runs → updateCalculatedDisplayValues() overwrites j_116 with StateManager value (might be stale or from wrong mode)
- Heatpump mode: j_116 calculated from j_113 → updateCalculatedDisplayValues() correctly updates it ✅

### Comparison to j_115

Let me check if j_115 has the same problem:

```javascript
// S13 fieldFormats (line 323)
h_113: "number-2dp", j_113: "number-2dp", j_114: "number-2dp", j_116: "number-2dp",
```

j_115 is **NOT** in fieldFormats! ✅ This is correct because j_115 is always editable (never calculated).

### The Fix (User needs to verify/test before implementing)

**Option A: Remove j_116 from fieldFormats entirely**
- PRO: Simple, j_116 never updated by updateCalculatedDisplayValues()
- CON: In Heatpump mode, j_116 won't display calculated value correctly

**Option B: Conditional inclusion based on d_113**
- PRO: Correct behavior for both modes
- CON: More complex, needs mode-aware field list

**Option C: Strengthen contenteditable check**
- Keep j_116 in fieldFormats but improve the protection
- Check if element is truly editable (not ghosted)

### Recommended Approach (S07 Pattern)

Looking at S07, **e_50 is NEVER in fieldFormats** because it's an editable input field, even though it's conditionally ghosted based on d_49 (water use method).

**S07 Pattern:**
- Editable fields (e_49, e_50, k_52) → NOT in fieldFormats
- Calculated fields (h_49, j_50, etc.) → IN fieldFormats
- Ghosting only controls visual state, not whether field is in update list

**Apply to S13:**
- j_115 (AFUE) → editable → NOT in fieldFormats ✅ (already correct)
- j_116 (COP) → conditionally editable → should NOT be in fieldFormats
- j_113, h_113, j_114 → calculated → IN fieldFormats ✅ (correct)

**For Heatpump mode** (j_116 calculated from j_113):
- The calculation engine (calculateCoolingSystem) updates j_116
- But the DOM update should happen through refreshUI or direct write, not updateCalculatedDisplayValues
- Or: Only include j_116 in fieldFormats when d_113="Heatpump"

### Action Required

User should test removing j_116 from fieldFormats (line 323) and see if:
1. ✅ Editable behavior works (Gas/Oil mode)
2. ❌ Calculated display broken (Heatpump mode)?

If Heatpump mode display breaks, need conditional approach.

---

## 🐛 FINAL BUG: Reference Mode DOM Display (Session 3 - Nov 12 Continued)

### Test Results After Fixes

**After removing j_116 from fieldFormats (commit b717071):**
- ✅ Import works better
- ❌ Reference mode j_116 entry still shows Target value after blur
- ❌ Requires mode double-tap to see entered Reference value

**After adding j_116 to ReferenceState criticalFields:**
- ✅ Good addition, doesn't break anything
- ❌ Still doesn't fix Reference mode DOM display issue

### Symptom Analysis

User reports: "No matter what value I try to enter, the Target mode appears in the Reference mode's place after enter."

**Example:**
- Target j_116 = 2.0
- Switch to Reference, enter j_116 = 4.0
- After blur, DOM shows 2.0 (Target value) instead of 4.0
- Mode switch to Target and back to Reference → NOW shows 4.0 correctly
- Value IS in StateManager (ref_j_116 = "4.0") ✅
- Value persists across mode switches ✅
- Problem is ONLY immediate DOM display after blur in Reference mode ❌

### New Hypothesis: contenteditable Protection Check Failing

**The Issue:** We removed j_116 from updateCalculatedDisplayValues() fieldFormats, but j_116 IS in refreshUI() fieldsToSync (line 411). When refreshUI reads from state, it should display correctly, but something is overwriting it with the Target value.

**Theory:** The blur handler's immediate DOM write (line 2064) gets overwritten by a subsequent function call that reads the WRONG value from state.

**Critical Code Paths:**

1. **handleEditableBlur writes DOM immediately (S13:2064):**
```javascript
this.textContent = formattedDisplay; // Shows "4.00"
```

2. **ReferenceState.setValue criticalFields (S13:211-216) calls:**
```javascript
calculateAll();
ModeManager.updateCalculatedDisplayValues(); // j_116 NOT in fieldFormats anymore ✅
```

3. **But something ELSE must be overwriting the DOM...**

**Possible culprits:**
- A. calculateAll() triggers something that reads unprefixed j_116 instead of ref_j_116
- B. refreshUI() is being called somewhere and reading from wrong state
- C. contenteditable protection in refreshUI (line 468) is failing
- D. getValue() fallback returning Target value instead of Reference value

### Contenteditable Protection Theory

Looking at refreshUI() line 468-476:
```javascript
} else if (element.getAttribute("contenteditable") === "true") {
  // Update editable fields for mode persistence
  const numericValue = window.TEUI.parseNumeric(stateValue);
  if (!isNaN(numericValue)) {
    element.textContent = window.TEUI.formatNumber(numericValue, "number-2dp");
  }
}
```

This SHOULD update j_116 from ReferenceState, but if `stateValue` comes from wrong source, it would show Target value.

**Question:** Does `currentState.getValue("j_116")` in Reference mode correctly return ReferenceState.j_116, or is there a fallback to Target?

### Proposed Fix

**Option 1: Check if getValue() has Target fallback**
Look at ReferenceState.getValue() line 219-223 to see if it falls back to TargetState or getFieldDefault().

**Option 2: Add defensive check in refreshUI**
Only update editable fields during mode switch, not during calculations.

**Option 3: Move DOM write after all calculations**
Ensure handleEditableBlur's DOM write happens LAST, after all state updates and calculations complete.

**Option 4: User's suggestion - Dual field variants**
Create separate field definitions for j_116 editable vs calculated modes, adapting based on d_113 value.

### Fix Attempt 1: ModeManager.refreshUI() - TOO AGGRESSIVE ❌

**Hypothesis:** The DOM write at line 2064 gets overwritten by subsequent calculation flow. Adding `ModeManager.refreshUI()` after calculations should re-apply the correct state value.

**Implementation:**
```javascript
if (fieldId === "j_116") {
  calculateAll();
  ModeManager.updateCalculatedDisplayValues();
  ModeManager.refreshUI(); // ✅ Force full UI refresh after calculations
}
```

**Test Results:**
- ✅ Initial blur display works correctly - j_116 shows entered value in Reference mode
- ❌ **Mode persistence broken** - Switching back to Target shows Target value, then switching back to Reference shows Target value again
- Reference mode unable to maintain its own value after mode switches

**Root Cause:** `refreshUI()` updates ALL fields (dropdowns, editables, sliders) from current mode's state. While this fixes the immediate blur display, it's too aggressive and breaks the delicate mode isolation that preserves separate Target/Reference values.

### Fix Attempt 2: Surgical DOM Update - SUCCESS ✅

**Hypothesis:** Instead of refreshing ALL UI elements, read only j_116 from the correct mode's state and update only that specific DOM element.

**Implementation (Section13.js lines 2091-2103):**
```javascript
if (fieldId === "j_116") {
  calculateAll();
  ModeManager.updateCalculatedDisplayValues();

  // ✅ Surgical DOM update: Re-apply formatted value from state after calculations
  // refreshUI() is too aggressive and breaks mode persistence
  const currentStateValue = ModeManager.getValue("j_116");
  if (currentStateValue) {
    const numericValue = window.TEUI.parseNumeric(currentStateValue);
    if (!isNaN(numericValue)) {
      this.textContent = window.TEUI.formatNumber(numericValue, "number-2dp");
    }
  }
}
```

**Test Results:**
- ✅ Immediate blur display works - j_116 shows entered value in Reference mode
- ✅ Mode persistence maintained - Target and Reference values stay separate
- ✅ No "double-toggle dance" required
- ✅ Mode switches work correctly - each mode displays its own value

**Why This Works:**
1. Line 2064: Initial DOM write shows user's formatted input
2. Lines 2092-2093: `calculateAll()` and `updateCalculatedDisplayValues()` run (j_116 not in fieldFormats, so no overwrite)
3. Lines 2096-2101: Re-read from `ModeManager.getValue("j_116")` which returns the correct mode-specific value:
   - In Target mode: returns TargetState.j_116
   - In Reference mode: returns ReferenceState.j_116
4. Update only the j_116 DOM element, leaving all other fields untouched
5. Mode persistence maintained because only j_116 updated, not all fields

**Pattern Match:** This follows the S07 e_50 pattern for conditionally editable fields that need special handling in both Target and Reference modes.

### Remaining Issue: Fresh Initialization Default Value Display

**Symptom:** When first switching to Reference mode after selecting Gas at d_113 (fresh initialization, no import), j_116 displays the Target value instead of the Reference default (3.30).

**Status:** Minor issue - calculations use correct 3.30 default from StateManager, but DOM displays Target value on first Reference mode switch. Matters less when importing files (imported values display correctly), only affects fresh initialization flow.

**Root Cause Analysis:**

1. **The Problem Flow:**
   - User enters j_116="2.0" in Target mode
   - User switches to Reference mode after selecting Gas at d_113
   - DOM shows "2.00" (Target value) instead of "3.30" (expected Gas/Oil default)

2. **Why Reference Default Doesn't Appear:**
   - ReferenceState.setDefaults() line 148 sets: `this.state.j_116 = referenceValues.j_116 || "2.66"`
   - This only runs during initialization, not when d_113 changes to Gas
   - When ReferenceState.state.j_116 is undefined, getValue() falls back to `getFieldDefault("j_116")`
   - getFieldDefault() reads from sectionRows line 1112: `value: "2.66"` (Heatpump default)
   - But when d_113="Gas", user expects "3.30" (Gas furnace equivalent COP)

3. **The Contextual Default Problem:**
   - Field definition at line 1112 has static Heatpump-context default: "2.66"
   - No logic exists for contextual defaults based on d_113 value
   - When d_113="Gas" or "Oil", expected default should be "3.30" (higher because Gas/Oil systems don't use electric resistance heating)

4. **Why You See Target Value Instead of 2.66:**
   - refreshUI() line 422: `const stateValue = currentState.getValue(fieldId);`
   - Should return "2.66" from getFieldDefault(), but DOM shows Target "2.00"
   - Suggests refreshUI() might not be updating j_116 on first mode switch, leaving Target value in DOM

**Recommended Solution: Option 3 - Update j_116 When d_113 Changes in Reference Mode**

Mirror the pattern used for f_113/j_115 in `onReferenceStandardChange()` (lines 161-166), but apply to d_113 changes instead of d_13 changes.

**Implementation Plan (for Nov 12):**

1. **Add d_113 change handler in ReferenceState:**
   ```javascript
   // Similar to onReferenceStandardChange() lines 152-177
   onHeatingSystemChange: function() {
     const currentHeatingSystem = this.state.d_113 || "Heatpump";

     // Only update j_116 if not user-modified
     if (!this.state.j_116_userModified) {
       if (currentHeatingSystem === "Heatpump") {
         this.state.j_116 = "2.66"; // Heatpump COP default
       } else if (currentHeatingSystem === "Gas" || currentHeatingSystem === "Oil") {
         this.state.j_116 = "3.30"; // Gas/Oil equivalent COP
       } else {
         this.state.j_116 = "2.66"; // Fallback to Heatpump default
       }

       this.saveState();

       // Only refresh if currently in Reference mode
       if (ModeManager.currentMode === "reference") {
         ModeManager.refreshUI();
         calculateAll();
         ModeManager.updateCalculatedDisplayValues();
       }
     }
   }
   ```

2. **Call onHeatingSystemChange() when d_113 changes in Reference mode:**
   - In ReferenceState.setValue(), when fieldId === "d_113"
   - Or in handleHeatingSystemChangeForGhosting() when in Reference mode

3. **Also call during setDefaults() initialization:**
   - After setting d_113="Heatpump", call onHeatingSystemChange() to set contextual j_116 default

**Why This Approach:**
- ✅ Follows existing f_113/j_115 pattern from onReferenceStandardChange()
- ✅ Respects user-modified flag (won't overwrite manual entries)
- ✅ Contextual defaults based on heating system type
- ✅ Maintains mode isolation (only affects Reference mode)
- ✅ Clean architecture - state updates trigger UI refresh

**Alternative Options Considered:**

**Option 1: Contextual Default in getFieldDefault()** - ❌ Rejected
- Would need to check d_113 value every time
- getFieldDefault() is meant to be simple fallback, not context-aware
- Creates coupling between field defaults and state

**Option 2: Initialize j_116 in setDefaults() Based on d_113** - ❌ Rejected
- Chicken-egg problem: setDefaults runs before user changes d_113
- Doesn't handle d_113 changes after initialization
- Would need additional handler anyway

**Option 4: Update j_116 in refreshUI() When Mode Switches** - ❌ Rejected
- refreshUI() should read state, not modify it
- Violates separation of concerns (display vs state management)
- Would trigger on every mode switch, not just d_113 changes

### Summary: Session 3 Complete (Nov 12, 2025)

**Completed:**
1. ✅ j_116 removed from fieldFormats (commit b717071)
2. ✅ j_116 added to criticalFields (commit bc0e357)
3. ✅ Surgical DOM update fix implemented and tested successfully (commit a12b880)
4. ✅ Documentation updated with analysis and implementation plan

**Next Session (Nov 12 continued):**
1. Implement Option 3: ReferenceState.onHeatingSystemChange() for contextual j_116 defaults
2. Test fresh initialization flow: Gas at d_113 should show j_116="3.30" default
3. Test user-modified flag: Manual j_116 entry should persist even when d_113 changes
4. Test import flow: Imported j_116 values should still override defaults

---

## 🔄 ATTEMPTED FIX: Contextual j_116 Defaults Based on d_113 (Session 3 - Nov 12 Continued)

### Problem Statement

**Target Value Bleed:** When switching to Reference mode for the first time after selecting Gas at d_113, j_116 displays the Target value (e.g., "2.00") instead of the Reference default (should be "3.30" for Gas/Oil systems).

**Expected Behavior:**
- Heatpump systems: j_116 default = "2.66" (typical heat pump COP)
- Gas/Oil systems: j_116 default = "3.30" (higher equivalent because no electric resistance heating)
- Reference mode should show these defaults on first initialization, not bleed through Target values

### Attempted Solution: ReferenceState.onHeatingSystemChange() Handler

**Approach:** Mirror the pattern used for `onReferenceStandardChange()` (lines 152-177), which sets f_113/j_115 defaults when d_13 (Reference standard) changes.

**Implementation (Section13.js):**

1. **Added onHeatingSystemChange() handler (Lines 179-207):**
```javascript
// ✅ NEW: Contextual j_116 defaults based on d_113 heating system type
onHeatingSystemChange: function () {
  const currentHeatingSystem = this.state.d_113 || "Heatpump";

  // Only update j_116 if not user-modified
  if (!this.state.j_116_userModified) {
    if (currentHeatingSystem === "Heatpump") {
      this.state.j_116 = "2.66"; // Heatpump COP default
    } else if (
      currentHeatingSystem === "Gas" ||
      currentHeatingSystem === "Oil"
    ) {
      this.state.j_116 = "3.30"; // Gas/Oil equivalent COP
    } else {
      this.state.j_116 = "2.66"; // Fallback to Heatpump default
    }

    this.saveState();

    // Only refresh if currently in Reference mode
    if (ModeManager.currentMode === "reference") {
      ModeManager.refreshUI();
      calculateAll();
      ModeManager.updateCalculatedDisplayValues();
    }
  }
}
```

2. **Wired handler to d_113 changes in setValue() (Lines 226-229):**
```javascript
if (source === "user" || source === "user-modified") {
  this.saveState();

  // ✅ CONTEXTUAL DEFAULTS: Update j_116 when d_113 changes
  if (fieldId === "d_113") {
    this.onHeatingSystemChange();
  }

  // ... rest of setValue logic
}
```

3. **Called handler during setDefaults() initialization (Line 153):**
```javascript
this.state.j_115 = referenceValues.j_115 || "0.90";
this.state.j_116 = referenceValues.j_116 || "2.66";
this.state.l_118 = referenceValues.l_118 || "3.50";

// ✅ Set contextual j_116 default based on d_113 value
this.onHeatingSystemChange();
```

### Test Results: FAILED

**Issue 1: Default Value Overwrite**
- User reported: "we see 2.66 as the ghosted default, when we know the value in StateManager is 3.30"
- Root cause: Called `onHeatingSystemChange()` at end of setDefaults() (line 153)
- Since d_113="Heatpump" at initialization, handler overwrote j_116 from "3.3" (ReferenceValues) to "2.66" (Heatpump default)
- **Fix Attempt:** Removed the `onHeatingSystemChange()` call from setDefaults()

**Reasoning:**
- ReferenceValues already has correct default ("3.3" for all standards)
- Handler only needs to fire when user explicitly changes d_113
- Preserves Reference standard defaults at initialization

**Issue 2: Broke f_113 Slider Updates in Reference Mode**
- User reported: "Now when Reference mode has 'Heatpump set and the user adjusts the f_113 HSPF efficiency slider, the j_116 value no longer updates like it does and should in Target mode"
- Impact: j_116 recalculates invisibly (calculations work) but DOM doesn't update
- Root issue: **refreshUI() parity problem** between Target and Reference modes

**User's Critical Analysis:**
> "Target mode works perfectly. Reference mode does not match methods for what Target mode does. Since we have made several changes since the last commit, I think we should 1. Revert to our last commit and then 2. Document what we have tried then 3. Consider why Target RefreshUI tracks with the right default, d_113 options, defaults and adapts to HSPF slider changes visibly in the DOM, where Reference mode does none of those three things."

### Why The Fix Failed

**The Real Problem:** This wasn't a contextual defaults issue - it's a **refreshUI() behavior difference** between Target and Reference modes.

**Target Mode (Working):**
- When f_113 slider changes in Heatpump mode
- j_116 recalculates AND DOM updates visibly
- refreshUI() properly updates j_116 display

**Reference Mode (Broken):**
- When f_113 slider changes in Heatpump mode
- j_116 recalculates (calculations work)
- DOM doesn't update (still shows old value)
- refreshUI() not updating j_116 properly

**Why Contextual Defaults Made It Worse:**
- Added a handler that calls `refreshUI()` when d_113 changes
- But the underlying refreshUI() issue in Reference mode remains
- Created more code complexity without fixing the root cause

### Revert Action

**Reverted to commit a12b880** - removed all onHeatingSystemChange() implementation:
```bash
git checkout a12b880 -- src/sections/Section13.js
```

**Files Affected:**
- Section13.js: Removed onHeatingSystemChange(), removed wiring in setValue(), removed call in setDefaults()

### Next Steps: Fix refreshUI() Parity Issue

**Investigation Required:**
1. Compare Target vs Reference refreshUI() behavior for calculated fields
2. Identify why Target mode updates j_116 DOM when f_113 changes, but Reference mode doesn't
3. Examine if the issue is in:
   - ModeManager.refreshUI() function
   - ReferenceState getValue() fallback logic
   - Calculation engine publishing values to wrong state keys
   - DOM update timing in Reference mode

**Correct Approach:**
- Fix the refreshUI() disparity FIRST
- Then revisit contextual defaults if still needed
- Don't add complexity to work around underlying architectural issues

### Lessons Learned

1. **Symptom vs Root Cause:** "Target value bleed" was a symptom, not the root cause
2. **Test Thoroughly:** Fix appeared to work for static defaults but broke dynamic updates
3. **Reference Mode Parity:** Any fix must maintain parity with Target mode behavior
4. **Revert Early:** When a fix creates new problems, revert and reassess before continuing
5. **Document Failures:** Failed attempts teach us where NOT to look for solutions

### Status

**REVERTED** - Contextual defaults approach abandoned

**Action Items:**
1. ✅ Revert to commit a12b880
2. ✅ Document failed attempt in NOV-12-IMPORT-EXPORT-FIX.md
3. ✅ Investigate refreshUI() parity issue between Target and Reference modes
4. ⏸️ Consider if the real issue is in ModeManager, not ReferenceState

---

## 🔍 ROOT CAUSE ANALYSIS: refreshUI() Disparity Between Target and Reference Modes

### Investigation Summary

**User's Observation:**
> "Target RefreshUI tracks with the right default, d_113 options, defaults and adapts to HSPF slider changes visibly in the DOM, where Reference mode does none of those three things."

**Symptom:** When f_113 (HSPF) slider changes in Heatpump mode:
- **Target mode:** j_116 DOM updates visibly with calculated value from j_113 ✅
- **Reference mode:** j_116 recalculates correctly (StateManager has right value) but DOM doesn't update ❌

### The Flow When f_113 Slider Changes

**Section13.js Lines 1836-1846 - f_113 Slider Change Handler:**
```javascript
f113Slider.addEventListener("change", function () {
  const hspfValue = parseFloat(this.value);
  if (isNaN(hspfValue)) return;

  // ✅ DUAL-STATE: Update via ModeManager (handles state isolation)
  ModeManager.setValue("f_113", hspfValue.toString(), "user-modified");

  // Only after thumb release
  calculateAll();  // ← Calculates both Target and Reference engines
  ModeManager.updateCalculatedDisplayValues();  // ← Updates DOM from calculations
});
```

**What Happens in Heatpump Mode:**
1. f_113 slider changes (user drags HSPF slider)
2. `ModeManager.setValue("f_113", value)` updates TargetState or ReferenceState
3. `calculateAll()` runs:
   - Calls `calculateReferenceModel()` → calculates ref_j_113, ref_j_116
   - Calls `calculateTargetModel()` → calculates j_113, j_116
4. `updateCalculatedDisplayValues()` should update j_116 DOM... but doesn't in Reference mode

### Root Cause: j_116 NOT in fieldFormats

**Section13.js Lines 324-326 - updateCalculatedDisplayValues():**
```javascript
// ✅ S07 PATTERN: j_116 REMOVED - conditionally editable (Gas/Oil), not always calculated
// When d_113="Heatpump", j_116 is calculated but DOM updates via refreshUI, not updateCalculatedDisplayValues
h_113: "number-2dp", j_113: "number-2dp", j_114: "number-2dp",
// ← j_116 NOT HERE
```

**Why j_116 Was Removed (Commit b717071):**
- j_116 is conditionally editable: editable in Gas/Oil mode, calculated in Heatpump mode
- Including it in `fieldFormats` caused it to overwrite user edits in Gas/Oil mode
- The comment says "DOM updates via refreshUI, not updateCalculatedDisplayValues"

**The Problem:** refreshUI() doesn't update j_116 when it's GHOSTED!

### Why refreshUI() Fails to Update j_116

**Section13.js Lines 468-477 - refreshUI() Editable Field Handler:**
```javascript
} else if (element.getAttribute("contenteditable") === "true") {
  // Update editable fields for mode persistence (d_119, j_115, j_116, l_118, d_118)
  const numericValue = window.TEUI.parseNumeric(stateValue);
  if (!isNaN(numericValue)) {
    element.textContent = window.TEUI.formatNumber(numericValue, "number-2dp");
  }
}
```

**The Condition Check:** `element.getAttribute("contenteditable") === "true"`

**When d_113="Heatpump":**
- j_116 field is GHOSTED (greyed out, not user-editable)
- `element.getAttribute("contenteditable")` returns `"false"` (string)
- Condition fails → j_116 DOM not updated

**When d_113="Gas" or "Oil":**
- j_116 field is UNGHOSTED (editable)
- `element.getAttribute("contenteditable")` returns `"true"`
- Condition passes → j_116 DOM updates from state

### Why Target Mode "Works" and Reference Mode "Doesn't"

**Hypothesis:** The issue affects BOTH modes equally, but user perceives it differently:

**In Target Mode:**
- User changes f_113 slider
- j_116 DOM doesn't update via refreshUI() (ghosted)
- j_116 DOM doesn't update via updateCalculatedDisplayValues() (not in fieldFormats)
- **BUT:** User doesn't notice because they're focused on the slider, not watching j_116

**In Reference Mode:**
- User changes f_113 slider
- j_116 DOM doesn't update via refreshUI() (ghosted)
- j_116 DOM doesn't update via updateCalculatedDisplayValues() (not in fieldFormats)
- **User notices** because Reference mode calculations trigger and other calculated fields update, but j_116 doesn't

**Alternative Hypothesis:** Target mode has different ghosting state or DOM update path that makes it work.

### The Fix Options

**Option 1: Add j_116 to updateCalculatedDisplayValues() ONLY when Ghosted**
```javascript
// Section13.js - updateCalculatedDisplayValues()
const fieldFormats = {
  h_113: "number-2dp", j_113: "number-2dp", j_114: "number-2dp",
  // Conditionally add j_116 when d_113="Heatpump" (calculated, ghosted)
};

// Before the forEach loop:
const heatingSystem = this.getValue("d_113");
if (heatingSystem === "Heatpump") {
  fieldFormats.j_116 = "number-2dp"; // Only add when calculated
}
```

**PRO:** Updates j_116 DOM when it's calculated
**CON:** Adds conditional logic complexity

**Option 2: Update refreshUI() to Handle Ghosted Editable Fields**
```javascript
// Section13.js - refreshUI()
} else if (element.hasAttribute("contenteditable")) {  // ← Changed from === "true"
  // Update ALL editable fields (ghosted or not)
  const numericValue = window.TEUI.parseNumeric(stateValue);
  if (!isNaN(numericValue)) {
    element.textContent = window.TEUI.formatNumber(numericValue, "number-2dp");
  }
}
```

**PRO:** Simpler, handles all contenteditable fields (including ghosted)
**CON:** Might update fields that shouldn't be updated

**Option 3: Update j_116 DOM Directly in calculateCoolingSystem()**
```javascript
// Section13.js - After calculating j_116_display
setFieldValue("j_116", j_116_display, "number-2dp");
```

**PRO:** Direct, explicit DOM update
**CON:** Bypasses the centralized refreshUI pattern

### ❌ INITIAL HYPOTHESIS WAS WRONG - Deeper Root Cause Found

**User's Critical Insight:**
> "To clarify, the issue is not with Target mode or j_116 DOM - it updates perfectly (even when ghosted) with f_113 HSPF slider changes. It is the ref_j_116 and Reference mode DOM that does nothing."

**Re-analysis:** Target mode works perfectly! The issue is ONLY in Reference mode.

### The REAL Data Flow Problem

**Target Mode (WORKS):**
1. `calculateTargetModel()` calculates j_116_display
2. `calculateCoolingSystem(false, ...)` line 2583: **`setFieldValue("j_116", j_116_display)`** ✅ Direct DOM update
3. DOM updates immediately

**Reference Mode (BROKEN):**
1. `calculateReferenceModel()` calculates j_116_display
2. `calculateCoolingSystem(true, ...)` line 2581: **`if (!isReferenceCalculation)`** - SKIPS DOM update ❌
3. Line 2598: Returns `j_116: j_116_display` in results object
4. `storeReferenceResults()` stores it as `ref_j_116` in StateManager ✅
5. **ReferenceState.state.j_116 is NEVER synced** ❌
6. `refreshUI()` → `ReferenceState.getValue("j_116")` returns OLD stale value ❌
7. DOM never updates

**The Missing Sync:**
- `syncFromGlobalState()` exists (lines 227-254) to sync StateManager → ReferenceState
- It reads `ref_j_116` from StateManager and writes to `ReferenceState.state.j_116`
- **BUT it's never called after calculations!** Only used for imports

### Corrected Fix Options

**Option 1: Call syncFromGlobalState After Calculations (Most Architecturally Correct)**

Add sync after Reference calculations:
```javascript
// Section13.js - calculateReferenceModel() after storeReferenceResults()
storeReferenceResults(
  copResults,
  heatingResults,
  coolingResults,
  unmitigatedResults,
  mitigatedResults,
  ventilationRatesResults,
  ventilationEnergyResults,
  coolingVentilationResults,
  freeCoolingResults,
);

// ✅ NEW: Sync calculated ref_j_116 back to ReferenceState
ReferenceState.syncFromGlobalState(["j_116"]);
```

**PRO:**
- Uses existing sync mechanism
- Architecturally clean
- Works for all calculated Reference fields
- refreshUI() will then read correct value

**CON:**
- Need to call sync selectively (only for calculated fields, not user-editable ones)
- Might overwrite user edits if not careful

**Option 2: Update refreshUI() to Read Directly from StateManager in Reference Mode**

Change refreshUI() line 422 from:
```javascript
const stateValue = currentState.getValue(fieldId);
```

To:
```javascript
let stateValue;
if (this.currentMode === "reference" && fieldId === "j_116") {
  // Read calculated Reference value directly from StateManager
  stateValue = window.TEUI.StateManager.getValue(`ref_${fieldId}`) || currentState.getValue(fieldId);
} else {
  stateValue = currentState.getValue(fieldId);
}
```

**PRO:**
- Targeted fix for j_116 only
- Reads fresh calculated value from StateManager
- Doesn't affect other fields

**CON:**
- Special-case code (not generalizable)
- Bypasses ReferenceState (architectural inconsistency)

**Option 3: Add j_116 to updateCalculatedDisplayValues() in Reference Mode**

Change updateCalculatedDisplayValues() lines 336-345 to read ref_j_116 directly:
```javascript
if (this.currentMode === "reference") {
  // STRICT MODE: Reference shows ONLY ref_ values
  valueToDisplay = window.TEUI.StateManager.getValue(`ref_${fieldId}`);

  // ✅ Special case: j_116 when d_113="Heatpump" (calculated, not in fieldFormats)
  if (fieldId === "j_116") {
    const heatingSystem = this.getValue("d_113");
    if (heatingSystem === "Heatpump" && valueToDisplay) {
      const element = document.querySelector(`[data-field-id="j_116"]`);
      if (element) {
        const numericValue = window.TEUI.parseNumeric(valueToDisplay);
        element.textContent = window.TEUI.formatNumber(numericValue, "number-2dp");
      }
    }
  }
}
```

**PRO:**
- Keeps calculated field updates in updateCalculatedDisplayValues()
- Only updates when d_113="Heatpump" (calculated mode)

**CON:**
- j_116 not in fieldFormats, so this is special-case code

### Recommended Solution: Option 1 (Architecturally Cleanest)

Call `ReferenceState.syncFromGlobalState(["j_116"])` after calculations to sync calculated values back to ReferenceState. This follows the existing data flow pattern and makes refreshUI() work correctly.

**Implementation:**
```javascript
// Section13.js - After line 3163 in calculateReferenceModel()
storeReferenceResults(...);

// ✅ Sync calculated fields back to ReferenceState for DOM updates
// Only sync calculated fields (j_116 when Heatpump), not user-editable ones
const heatingSystem = ReferenceState.getValue("d_113");
if (heatingSystem === "Heatpump") {
  ReferenceState.syncFromGlobalState(["j_116"]); // Sync calculated COP
}
```

**Testing Required:**
1. Reference mode, d_113=Heatpump, drag f_113 slider → j_116 should update visibly ✅
2. Reference mode, d_113=Gas, edit j_116 manually → should NOT be overwritten by sync ✅
3. Target mode unchanged (still works) ✅
## ✅ SOLUTION: j_116 Reference Mode DOM Update Issue (Session 4 - November 13, 2025)

### The Problem
**Symptom:** In Reference mode with d_113="Heatpump", dragging the f_113 (HSPF) slider does NOT visibly update the j_116 field in the DOM, even though:
- Calculations execute correctly (e_10 recalculates properly) ✅
- `ref_j_116` is correctly written to StateManager ✅
- Target mode works perfectly (j_116 updates visibly when f_113 changes) ✅

### Root Cause Analysis

The issue was in `updateCalculatedDisplayValues()` at line 365:

**BROKEN CODE:**
```javascript
if (element && !element.hasAttribute("contenteditable")) {
  // Update DOM
}
```

**The Bug:** This condition checks if the element does NOT have a `contenteditable` attribute at all. But j_116 DOES have the attribute when in Heatpump mode - it's set to `contenteditable="false"` (ghosted/calculated state).

**The Logic Failure:**
- j_116 has `contenteditable="false"` when d_113="Heatpump" (calculated/ghosted)
- `hasAttribute("contenteditable")` returns `true` (attribute exists)
- `!element.hasAttribute("contenteditable")` returns `false`
- **DOM update is SKIPPED** ❌

### The Fix

Changed the condition to check the VALUE of the attribute, not just its existence:

**FIXED CODE (Section13.js:368):**
```javascript
if (element && element.getAttribute("contenteditable") !== "true") {
  // Update DOM for calculated fields (contenteditable="false" or no attribute)
  const numericValue = window.TEUI.parseNumeric(valueToDisplay);
  if (!isNaN(numericValue)) {
    const formatType = fieldFormats[fieldId] || "number-2dp";
    const formattedValue = window.TEUI.formatNumber(numericValue, formatType);
    element.textContent = formattedValue;
  }
}
```

**The Corrected Logic:**
- j_116 has `contenteditable="false"` (ghosted/calculated)
- `getAttribute("contenteditable")` returns `"false"`
- `element.getAttribute("contenteditable") !== "true"` returns `true`
- **DOM update happens** ✅

### Why This Makes Sense

**When d_113 = "Heatpump":**
- j_116 is calculated from f_113 (HSPF slider)
- j_116 becomes `contenteditable="false"` (ghosted/not user-editable)
- Should be updated by `updateCalculatedDisplayValues()` ✅

**When d_113 = "Gas" or "Oil":**
- j_116 is user-editable
- j_116 becomes `contenteditable="true"`
- Should be updated by `refreshUI()`, not `updateCalculatedDisplayValues()` ✅

### Verification
- ✅ Reference mode, d_113="Heatpump", drag f_113 slider → j_116 updates in real-time
- ✅ Target mode unchanged (still works perfectly)
- ✅ No state isolation issues
- ✅ No recursion or performance issues

**Status:** FIXED and verified working
**Commit:** d3d750d (Docs: Add DEBUG-J116-FLOW.js test script)

---

## 🐛 REMAINING ISSUE: j_116 Reference Default Display (Low Priority)

### The Problem
**Symptom:** When switching d_113 heating system types in Reference mode:
- Start with d_113="Heatpump" → j_116 shows calculated value (e.g., 2.66) ✅
- Switch to d_113="Gas" → j_116 shows stale 2.66 instead of Reference default 3.3 ❌
- Workaround: Toggle Target→Reference modes → j_116 then shows correct 3.3 ✅

**Expected Behavior:**
When switching from "Heatpump" to any other fuel type in Reference mode, j_116 should immediately display the Reference default (3.3 from ReferenceValues.js) without requiring a mode toggle.

### Root Cause Analysis

**The Flow:**
1. `ReferenceState.setDefaults()` (line 148) sets: `this.state.j_116 = referenceValues.j_116 || "2.66"`
2. When d_113="Heatpump", calculations overwrite `ReferenceState.state.j_116` with calculated value
3. When switching d_113 to "Gas/Oil", that stale calculated value persists in ReferenceState.state
4. `refreshUI()` (line 439) calls `ReferenceState.getValue("j_116")` → returns stale 2.66
5. DOM shows wrong value

**The Disconnect:**
- ✅ Calculations use correct 3.3 (e_10 calculates correctly)
- ✅ StateManager.getValue("ref_j_116") has correct default after calculations
- ❌ ReferenceState.state.j_116 has stale calculated value from Heatpump mode
- ❌ refreshUI() reads from ReferenceState.state, not StateManager

### Investigation Questions

1. **Does ReferenceValues.js load correctly?**
   - Add logging to `setDefaults()` to verify `referenceValues.j_116` actually returns "3.3"
   - Check if fallback `|| "2.66"` is being used instead

2. **When should j_116 revert to default?**
   - Should d_113 change listener reset j_116 when switching away from Heatpump?
   - Should there be a "contextual default" handler like attempted in earlier sessions?
   - Should refreshUI() read from StateManager instead of ReferenceState for calculated fields?

3. **Why does mode toggle fix it?**
   - Trace what happens during switchMode() that makes j_116 display correctly
   - Does switchMode() call something that re-syncs ReferenceState?

### Attempted Fixes (Reverted)

**Attempt 1:** Added logic in d_113 listener to reset j_116 to Reference default
- Result: Did not work, stale value persisted
- Reverted: Back to clean state

**Attempt 2:** Modified ReferenceState.getValue() to read from ReferenceValues for j_116
- Result: Did not work, stale value persisted
- Reverted: Back to clean state

**Attempt 3 (Session Nov 13, 2025):** Changed `refreshUI()` contenteditable check from `=== "true"` to `hasAttribute()`
- **Rationale:** Thought j_116 was being skipped during mode switch due to contenteditable="false" (ghosted state)
- **Change:** Line 485: `element.getAttribute("contenteditable") === "true"` → `element.hasAttribute("contenteditable")`
- **Result:** Did not fix the issue - j_116 still shows 2.66 instead of 3.30
- **Reverted:** git checkout src/sections/Section13.js

**Attempt 4 (Session Nov 13, 2025):** Modified `refreshUI()` to read j_116 from StateManager instead of ReferenceState
- **Rationale:** Discovered ReferenceState.state.j_116 has stale "2.66" while StateManager has correct "3.30"
- **Change:** Lines 439-447: Added special case to read `ref_j_116` from StateManager for j_116 in Reference mode
- **Assumption:** Thought j_116 was "calculated and stored in StateManager"
- **User Correction:** j_116 is NOT calculated - it has Reference default 3.30 from ReferenceValues.js overlay/fallback
- **Result:** Did not fix the issue
- **Reverted:** git checkout src/sections/Section13.js
- **Key Learning:** The 3.30 value comes from **ReferenceValues.js defaults**, not from calculations

### Baseline for Next Session

**Clean Commit:** d3d750d (Docs: Add DEBUG-J116-FLOW.js test script)
**Branch:** NOV12-IMPORT-FIX
**Files to Review:**
- [Section13.js:130-150](src/sections/Section13.js#L130-L150) - ReferenceState.setDefaults()
- [Section13.js:220-236](src/sections/Section13.js#L220-L236) - ReferenceState.getValue()
- [Section13.js:414-497](src/sections/Section13.js#L414-L497) - ModeManager.refreshUI()
- [Section13.js:1822-1838](src/sections/Section13.js#L1822-L1838) - d_113 change listener

**Next Steps:**
1. Add debug logging to trace actual values during fuel type switch
2. Verify ReferenceValues.js is loaded and j_116: "3.3" is accessible
3. Understand why mode toggle causes correct value to appear
4. Implement surgical fix based on findings

**Priority:** Low (cosmetic issue, doesn't affect calculations)
**Impact:** Minor UX issue requiring mode toggle workaround

---

## 🔍 NEW ANALYSIS: Fresh Eyes Review (Session Nov 13, 2025 Continued)

### Key Discovery: The Real Data Flow

After reverting failed attempts and re-reading the code with fresh eyes, here's what actually happens:

**The Source of Truth for j_116 in Reference Mode:**

1. **ReferenceValues.js** contains the standard defaults (e.g., `j_116: "3.30"` for OBC SB10)
2. **ReferenceState.setDefaults()** (line 148) initializes: `this.state.j_116 = referenceValues.j_116 || "2.66"`
3. **When d_113="Heatpump":** Calculations compute COP and write to BOTH:
   - `StateManager.setValue("ref_j_116", calculatedValue)` ✅
   - The DOM gets updated via `updateCalculatedDisplayValues()` ✅
   - BUT: Does it also update `ReferenceState.state.j_116`? **Need to verify**
4. **When switching d_113 from "Heatpump" to "Gas":**
   - `refreshUI()` is called
   - Reads `ReferenceState.getValue("j_116")`
   - If ReferenceState.state.j_116 still has stale calculated value → shows wrong value ❌

### Critical Question: Where Does ReferenceState.state.j_116 Get Updated?

**Search needed:**
- Does any calculation function write to `ReferenceState.state.j_116`?
- Or does it ONLY get written during initialization (line 148)?
- When mode toggle works, what syncs it back to the correct default?

### New Hypothesis: The d_113 Dropdown Handler Missing Reset Logic

When d_113 changes from "Heatpump" to any other fuel type in Reference mode, the dropdown change handler should:

1. Detect the change: "Heatpump" → "Gas/Oil/Electric"
2. Reset `ReferenceState.state.j_116` back to the ReferenceValues default
3. Call `refreshUI()` to update DOM

**BUT:** The current d_113 listener (lines 1822-1838) likely doesn't have this reset logic.

### Proposed Investigation Path

**Step 1:** Check if ReferenceValues.js actually has j_116: "3.30"
- Add console.log in setDefaults() to verify what `referenceValues.j_116` returns
- Confirm it's not using the fallback "2.66"

**Step 2:** Trace what happens during mode toggle that fixes it
- Add logging to switchMode() to see if it calls setDefaults() or syncFromGlobalState()
- Identify the mechanism that restores the correct value

**Step 3:** Implement targeted fix in d_113 change handler
- When switching FROM "Heatpump" TO anything else in Reference mode:
  - Reset ReferenceState.state.j_116 to ReferenceValues default
  - Call refreshUI() to update DOM

### Potential Solution (Untested)

Add to d_113 dropdown change listener around line 1822:

```javascript
dropdown.addEventListener("change", function () {
  const newValue = this.value;
  const oldValue = currentState.getValue("d_113"); // Get previous value

  // ... existing code ...

  // ✅ NEW: Reset j_116 to Reference default when switching FROM Heatpump
  if (ModeManager.currentMode === "reference" &&
      oldValue === "Heatpump" &&
      newValue !== "Heatpump") {
    const currentStandard = window.TEUI?.StateManager?.getValue?.("d_13") || "OBC SB10 5.5-6 Z6";
    const referenceValues = window.TEUI?.ReferenceValues?.[currentStandard] || {};
    const defaultJ116 = referenceValues.j_116 || "3.30";

    ReferenceState.setValue("j_116", defaultJ116);
    // refreshUI() is already called below
  }

  // ... existing refreshUI() call ...
});
```

**Next Session:** Verify ReferenceValues.js has correct defaults, then test this targeted fix.
