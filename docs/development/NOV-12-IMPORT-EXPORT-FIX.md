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
2. ⏸️ **Phase 2** - Fix d_118 field definition + add event handler → **TEST d_118 input/calculations**
3. ⏸️ **Phase 3** - Array-based normalization in ExcelMapper → **TEST Excel import precision**
4. ⏸️ **Phase 4** - Add j_116 to CSV export/import → **TEST j_116 conditional logic**
5. ⏸️ **Phase 5** - Update l_118 default + run full test suite → **TEST all precision**
6. ⏸️ **Phase 6** - Apply to Reference sheet → **TEST Reference import**

**Testing Between Phases:**
- After Phase 2: Verify d_118 editable field accepts input and triggers calculations
- After Phase 3: Import Excel file, verify all 2dp fields preserve precision
- After Phase 4: Test j_116 import with both Heatpump and non-Heatpump systems
- After Phase 5: Run full CSV export→import cycle, verify no drift
- After Phase 6: Test Reference sheet import

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

## ✅ Definition of Done

- [ ] All four fields (d_118, j_115, j_116, l_118) export with 2dp precision
- [ ] All four fields import with 2dp precision (no rounding/truncation)
- [ ] j_116 conditional import works (skip for Heatpump, import for others)
- [ ] Large building test case shows no calculation drift after round-trip
- [ ] Reference mode maintains same precision as Target mode
- [ ] No breaking changes to existing UI/UX
- [ ] All test cases pass (6 test scenarios defined in Phase 5)

---

**Document Status:** Analysis Complete - Ready for Implementation
**Priority:** HIGH - Affects calculation accuracy for large buildings
**Risk:** LOW - Following proven k_52 pattern, well-defined scope
**Estimated Effort:** 4-6 hours (including testing)
