# Import Debug Investigation

**Created**: 2025-10-31
**Last Updated**: 2025-10-31 evening

---

## ✅ **S13 HSPF Slider Bug - RESOLVED**

**Status**: FIXED & TESTED
**Commit**: a0b685d
**Priority**: COMPLETE

### **Root Cause**

Two-part issue:
1. **Type mismatch**: f_113 used `"coefficient"` instead of `"coefficient_slider"` (no slider handler)
2. **ReferenceValues contamination**: syncFromGlobalState() synced overlay fields from import

### **The "12.5 Default Anomaly"**

Bug only visible when:
- Heatpump system (slider unghosted)
- Target f_113 ≠ 12.5 (field default)
- ref_f_113 NOT imported from REFERENCE sheet

**Test Results:**

| Import Scenario | Target f_113 | Result |
|----------------|--------------|--------|
| Electricity/Gas system | (ghosted) | ✅ WORKS |
| Heatpump, f_113 = **12.5** | 12.5 | ✅ WORKS (fallback masked bug) |
| Heatpump, f_113 = 10 | 10 | ❌ BROKE (before fix) |
| Heatpump, f_113 = 5 | 5 | ❌ BROKE (before fix) |
| Heatpump, f_113 ≠ 12.5 | ANY | ❌ BROKE (before fix) |

### **The Fix**

**Section13.js changes:**

1. **Type fix** ([Section13.js:888](src/sections/Section13.js#L888)):
```javascript
// BEFORE:
type: "coefficient", // ❌ No slider handler

// AFTER:
type: "coefficient_slider", // ✅ Recognized slider type (like S10 SHGC sliders)
```

2. **Skip logic** ([Section13.js:227-238](src/sections/Section13.js#L227-L238)):
```javascript
syncFromGlobalState: function (fieldIds = [...]) {
  // ✅ ReferenceValues overlay fields - should NOT sync from import
  const referenceValueFields = ["f_113", "d_118", "j_115"];

  fieldIds.forEach((fieldId) => {
    // Skip ReferenceValues overlay fields
    if (referenceValueFields.includes(fieldId)) {
      console.log(`[S13-REF-SYNC] Skipping ${fieldId} - uses ReferenceValues overlay`);
      return;
    }

    const refFieldId = `ref_${fieldId}`;
    const globalValue = window.TEUI.StateManager.getValue(refFieldId);
    if (globalValue !== null && globalValue !== undefined) {
      this.setValue(fieldId, globalValue, "imported");
    }
  });
}
```

### **Success Criteria - All Achieved**

- ✅ f_113 slider visible and functional after Heatpump import (any f_113 value)
- ✅ Reference f_113 shows ReferenceValues default (7.1), NOT Target value
- ✅ No Target-to-Reference contamination for S13 ReferenceValues fields
- ✅ Gas/Electricity imports: No regression (slider properly ghosted)
- ✅ User can still manually edit overlay fields if needed

---

## ❌ **S11 → S15 Cascade Issue - UNDER INVESTIGATION**

**Status**: UNRESOLVED
**Priority**: HIGH
**Next Action**: Requires different debugging approach

### **Symptom**

After import, S01 dashboard e_10 (Reference TEUI) shows incorrect value:
- Import: e_10 = 387.3 (expected ~172.7)
- After S11 Reference toggle: e_10 = 191.5
- After S13 toggles + recalc: e_10 = 176.7 (close to expected 172.7)

**Pattern**: Requires manual mode switches to complete calculations correctly.

### **S15 Error Pattern**

```
Section15.js:1423 [S15] Missing critical upstream Reference values:
ref_g_101, ref_d_101, ref_i_104
```

- S15's calculateReferenceModel() runs but cannot find upstream values from S11
- S15 falls back to initialization defaults
- S11 logs show it IS writing ref_ values, but S15 doesn't see them

### **What We Tried**

**Skip logic for S11 U-values** (g_88-g_93):
- Applied same ReferenceValues overlay skip logic as S13
- Result: ❌ Did NOT resolve cascade issue
- Conclusion: S11 problem is different from S13 slider issue

### **Why S11 Differs from S13**

1. **S10 area sync dependency**: S11 syncs areas from S10 before calculating
2. **Calculation cascade timing**: S15 may run before S11 completes
3. **U-values**: May have additional dependencies or timing issues
4. **Not just ReferenceValues**: Issue may be calculation order, not contamination

### **Next Investigation Steps**

1. **Cascade timing analysis**:
   - Add timestamp logging to S11.calculateReferenceModel()
   - Add timestamp logging to S15.calculateReferenceModel()
   - Verify execution order: Does S15 run before S11 completes?

2. **Dependency tracking**:
   - Check if S10 area sync interferes with S11 calculations
   - Verify ref_g_101, ref_d_101, ref_i_104 write/read sequence
   - Log StateManager state at key points

3. **Mode-dependent behavior**:
   - Import with S11 in Target mode → Reference calculations incomplete
   - Import with S11 in Reference mode → Target calculations incomplete
   - Suggests mode-specific calculation blocking or order issue

---

## 🔧 **ARCHITECTURAL NOTES**

### **ReferenceValues Overlay Pattern**

Certain fields in Reference model should ALWAYS use values from ReferenceValues.js based on current reference standard (d_13), NOT imported from Excel.

**Fields with ReferenceValues Overlay:**
- **S13**: f_113 (HSPF), d_118 (ERV), j_115 (AFUE) - ✅ FIXED
- **S11**: g_88-g_93 (U-values) - ❌ CASCADE ISSUE PERSISTS

**How it should work:**
1. Page load: ReferenceState.setDefaults() loads ReferenceValues based on d_13
2. Import: syncFromGlobalState() SKIPS overlay fields, preserves ReferenceValues
3. d_13 change: onReferenceStandardChange() updates ReferenceValues overlay
4. User edit: User can manually override (marked as "user-modified")

### **Pattern A Dual-State Architecture**

Sections 02-15 use isolated TargetState/ReferenceState objects:
- **TargetState**: User's project data (imported from REPORT sheet)
- **ReferenceState**: Reference model data (uses ReferenceValues for overlay fields)
- **ModeManager**: Switches display without triggering calculations

**Import Flow** (FileHandler.js):
1. Mute listeners
2. Import Target data (REPORT sheet) → StateManager → TargetState.syncFromGlobalState()
3. Import Reference data (REFERENCE sheet) → StateManager → ReferenceState.syncFromGlobalState()
4. Unmute listeners
5. calculateAll() + refreshUI()

---

## 🔄 **THREE NEW IMPORT FAILURES - WORKPLAN**

**Status**: INVESTIGATION COMPLETE - READY FOR IMPLEMENTATION
**Priority**: HIGH
**Next Session**: Apply fixes based on learnings from S13 HSPF bug

### **The Three Failures**

1. **ref_i_41** (S05, [ExcelMapper.js:246](src/core/ExcelMapper.js#L246)) - Air tightness @ 50Pa
   - Excel: Contains numeric value
   - Target i_41: ✅ Imports correctly
   - Reference ref_i_41: ❌ Does NOT import (shows initialized default)

2. **ref_d_118** (S13, [ExcelMapper.js:347](src/core/ExcelMapper.js#L347)) - ERV/HRV Sensible Recovery Efficiency %
   - Excel REFERENCE sheet: 60%
   - Target d_118: ✅ Imports correctly
   - Reference ref_d_118: ❌ Shows 81% (ReferenceValues default, not Excel import)

3. **ref_g_118** (S13, [ExcelMapper.js:348](src/core/ExcelMapper.js#L348)) - Ventilation Method dropdown
   - Excel REFERENCE sheet: Contains selected ventilation method
   - Target g_118: ✅ Imports correctly
   - Reference ref_g_118: ❌ Shows "Volume by Schedule" (initialized default)

---

### **🔍 WORKING THEORY - The Skip List Distinction**

**Key Insight from S13 HSPF Fix:**

We successfully fixed f_113 by adding skip logic, but we **over-applied** the pattern. There are TWO categories of Reference fields:

#### **Category 1: ReferenceValues Overlay Fields (Code-Mandated Standards)**

These are equipment efficiency STANDARDS mandated by building codes (NBC, NECB, etc.). They change based on d_13 (Reference Standard selection). **These should NOT import from Excel.**

**Examples:**
- **f_113** (HSPF) - Heat pump heating efficiency standard
- **j_115** (AFUE) - Furnace efficiency standard
- **g_88-g_93** (U-values) - Envelope assembly thermal performance standards

**Why skip import?**
- These represent regulatory requirements, not design choices
- Values come from ReferenceValues.js based on selected code (d_13)
- User shouldn't import outdated code values from Excel
- When d_13 changes (e.g., NBC 2015 → NBC 2020), these auto-update

**Implementation:** Add to skip list in syncFromGlobalState()

#### **Category 2: Regular Reference Fields (Design Choices)**

These are project-specific design choices for the Reference model. They describe what equipment/systems were SELECTED, not what standards mandate. **These SHOULD import from Excel.**

**Examples:**
- **d_118** (ERV% efficiency) - Specific ERV/HRV unit selected for Reference model
- **g_118** (Ventilation method) - How ventilation is delivered (constant, scheduled, etc.)
- **i_41** (Air tightness @ 50Pa) - Measured/designed air leakage rate

**Why allow import?**
- These represent actual design decisions for the Reference building
- Excel REFERENCE sheet contains the as-designed Reference model
- User needs to import their specific Reference design choices
- Not code-mandated values (though may be informed by code minimums)

**Implementation:** Keep in fieldIds list, do NOT add to skip list

---

### **🔧 ROOT CAUSE ANALYSIS**

#### **Issue 1: ref_i_41 (S05)**

**Finding:** [Section05.js:151](src/sections/Section05.js#L151)
```javascript
// ReferenceState.syncFromGlobalState()
syncFromGlobalState: function (fieldIds = ["d_39"]) {
  // ❌ i_41 is NOT in the fieldIds array!
  // Only d_39 is being synced for Reference
```

**Root Cause:** Missing from ReferenceState fieldIds list

**Expected Behavior:**
- TargetState syncs: ["d_39", "i_41"] ✅
- ReferenceState syncs: ["d_39"] ❌ Should be ["d_39", "i_41"]

#### **Issue 2: ref_d_118 (S13)**

**Finding:** [Section13.js:229](src/sections/Section13.js#L229)
```javascript
// ReferenceState.syncFromGlobalState()
const referenceValueFields = ["f_113", "d_118", "j_115"];
// ❌ d_118 is in the skip list but shouldn't be!
```

**Root Cause:** Incorrectly categorized as ReferenceValues overlay field

**Why This Happened:**
- During S13 HSPF fix, we assumed d_118 (ERV%) was a code standard like HSPF/AFUE
- Actually, d_118 represents the SELECTED ERV/HRV unit efficiency (design choice)
- ReferenceValues.js provides a DEFAULT (81%), but Excel should override it with actual design (60%)

**Expected Behavior:**
- f_113 (HSPF): Skip import, use ReferenceValues ✅ CORRECT
- j_115 (AFUE): Skip import, use ReferenceValues ✅ CORRECT
- d_118 (ERV%): Import from Excel ❌ CURRENTLY SKIPPED (wrong!)

#### **Issue 3: ref_g_118 (S13)**

**Finding:** [Section13.js:220](src/sections/Section13.js#L220)
```javascript
// ReferenceState.syncFromGlobalState()
syncFromGlobalState: function (fieldIds = [
  "d_113", "f_113", "j_115", "d_116", "j_116",
  "d_118", "g_118", // ✅ g_118 IS in the fieldIds list
  "l_118", "d_119", "l_119", "k_120"
]) {
```

**Root Cause:** g_118 IS in the list and NOT in skip list. Need to investigate:
1. Is ExcelMapper correctly reading from Excel?
2. Is value null/undefined in Excel?
3. Is there a dropdown-specific import issue?

**Investigation Required:** Need to check if dropdown fields have special handling requirements

---

### **📋 FIX PROPOSAL WORKPLAN**

#### **Phase 1: Add i_41 to Section05 ReferenceState Sync** (5 mins)

**File:** [Section05.js:151](src/sections/Section05.js#L151)

**Change:**
```javascript
// BEFORE:
syncFromGlobalState: function (fieldIds = ["d_39"]) {

// AFTER:
syncFromGlobalState: function (fieldIds = ["d_39", "i_41"]) {
```

**Test:**
1. Import Excel file with ref_i_41 value
2. Switch to S05 Reference mode
3. Verify i_41 shows Excel value (not initialized default)

#### **Phase 2: Remove d_118 from S13 Skip List** (5 mins)

**File:** [Section13.js:229](src/sections/Section13.js#L229)

**Change:**
```javascript
// BEFORE:
const referenceValueFields = ["f_113", "d_118", "j_115"];

// AFTER:
const referenceValueFields = ["f_113", "j_115"];
// Only f_113 (HSPF) and j_115 (AFUE) are code standards
// d_118 (ERV%) is a design choice - should import from Excel
```

**Test:**
1. Import Excel file with ref_d_118 = 60%
2. Switch to S13 Reference mode
3. Verify d_118 slider shows 60% (not 81% ReferenceValues default)

#### **Phase 3: Investigate ref_g_118 Import** (15 mins)

**Diagnostic Steps:**

1. **Check ExcelMapper read:**
   - Add console log in [ExcelMapper.js:348](src/core/ExcelMapper.js#L348)
   - Verify Excel cell value is being read correctly

2. **Check StateManager storage:**
   - After import, check `window.TEUI.StateManager.getValue("ref_g_118")`
   - Verify value made it to StateManager

3. **Check syncFromGlobalState execution:**
   - Add console log in [Section13.js:243](src/sections/Section13.js#L243)
   - Verify g_118 sync is executing (not being skipped)

4. **Check dropdown field handling:**
   - Verify dropdown fields have special import requirements
   - Check if dropdown options validation is rejecting import value

**Possible Fixes:**
- If StateManager doesn't have value → ExcelMapper issue
- If StateManager has value but sync fails → syncFromGlobalState issue
- If sync works but display wrong → dropdown refresh issue

#### **Phase 4: Test All Three Imports** (10 mins)

**Test Matrix:**

| Field | Excel Value | Expected Result | Status |
|-------|-------------|----------------|---------|
| ref_i_41 | (numeric) | Shows Excel value | 🔧 TO FIX |
| ref_d_118 | 60% | Shows 60%, not 81% | 🔧 TO FIX |
| ref_g_118 | (dropdown) | Shows Excel selection | 🔍 TO INVESTIGATE |

**Success Criteria:**
- All three Reference fields import correctly from Excel
- f_113 (HSPF) and j_115 (AFUE) still maintain ReferenceValues defaults (not regressing)
- No cascade issues or calculation errors
- Mode switching works correctly

---

### **📚 ARCHITECTURAL CLARIFICATION**

**Updated ReferenceValues Overlay Pattern:**

The skip list should contain ONLY code-mandated equipment efficiency standards that change based on d_13 (Reference Standard selection).

**✅ SHOULD Skip Import (ReferenceValues Overlay):**
- **S13**: f_113 (HSPF), j_115 (AFUE) - Equipment efficiency STANDARDS
- **S11**: g_88-g_93 (U-values) - Envelope assembly thermal performance STANDARDS

**✅ SHOULD Import from Excel (Design Choices):**
- **S13**: d_118 (ERV%), g_118 (Ventilation method), d_116 (Cooling system), j_116 (COPc), l_118 (ACH), etc.
- **S11**: (all other fields besides U-values)
- **S05**: i_41 (Air tightness)
- **All sections**: Most fields are design choices, not code standards

**Rule of Thumb:**
- If it changes when d_13 changes → ReferenceValues overlay (skip import)
- If it describes what was built/designed → Regular field (import from Excel)

---

**Last Updated**: 2025-10-31 evening
**S13 HSPF Status**: ✅ FIXED & COMMITTED (a0b685d)
**S11 Cascade Status**: 🔍 REQUIRES FURTHER INVESTIGATION
**Three Import Failures**: 📋 WORKPLAN COMPLETE - READY TO IMPLEMENT
