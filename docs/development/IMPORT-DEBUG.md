# Import Debug Investigation

**Created**: 2025-10-31
**Last Updated**: 2025-10-31 evening

---

## ✅ **S13 HSPF Slider Bug - RESOLVED**

**Status**: FIXED & TESTED
**Commits**: a0b685d (initial fix), 3d43a59 (d_118 fix), [current] (skip logic removal)
**Priority**: COMPLETE

### **Root Cause**

**Single Issue**: f_113 used `"coefficient"` instead of `"coefficient_slider"` (no slider handler in FieldManager)

**Initial Misdiagnosis**: We thought skip logic was needed to prevent ReferenceValues contamination, but testing proved otherwise.

### **The "12.5 Default Anomaly"**

Bug only visible when:
- Heatpump system (slider unghosted)
- Target f_113 ≠ 12.5 (field default)
- This allowed us to notice the type mismatch

**Test Results:**

| Import Scenario | Target f_113 | Result |
|----------------|--------------|--------|
| Electricity/Gas system | (ghosted) | ✅ WORKS |
| Heatpump, f_113 = **12.5** | 12.5 | ✅ WORKS (fallback masked bug) |
| Heatpump, f_113 = 10 | 10 | ❌ BROKE (before fix) |
| Heatpump, f_113 = 5 | 5 | ❌ BROKE (before fix) |
| Heatpump, f_113 ≠ 12.5 | ANY | ❌ BROKE (before fix) |

### **The Fix**

**Section13.js - ONE change only:**

**Type fix** ([Section13.js:888](src/sections/Section13.js#L888)):
```javascript
// BEFORE:
type: "coefficient", // ❌ No slider handler

// AFTER:
type: "coefficient_slider", // ✅ Recognized slider type (like S10 SHGC sliders)
```

### **🧪 Skip Logic Testing (Nov 1, 2025)**

**Hypothesis**: Skip logic might have been technical debt, not actual fix.

**Test Results**:
- ✅ f_113 imports correctly from Excel WITHOUT skip logic
- ✅ f_113 still responds to d_13 Standard changes WITHOUT skip logic
- ✅ j_115 (AFUE) works correctly WITHOUT skip logic
- ✅ All import scenarios passing WITHOUT skip logic

**Conclusion**: Type fix was the ENTIRE solution. Skip logic was unnecessary and has been **REMOVED** (commit [current]).

**What Actually Happens**:
- ReferenceState.setDefaults() sets f_113 = 7.1 (from ReferenceValues.js)
- Import syncFromGlobalState() CAN overwrite with Excel value
- onReferenceStandardChange() d_13 listener re-applies ReferenceValues when Standard changes
- This natural flow works perfectly without any skip logic

### **Success Criteria - All Achieved**

- ✅ f_113 slider visible and functional after Heatpump import (any f_113 value)
- ✅ Reference f_113 uses ReferenceValues defaults AND can import from Excel
- ✅ d_13 Standard changes properly update f_113/j_115 via onReferenceStandardChange()
- ✅ Gas/Electricity imports: No regression (slider properly ghosted)
- ✅ Cleaner code without unnecessary skip logic (reduced technical debt)

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

### **ReferenceValues Overlay Pattern** ⚠️ REVISED

**Previous Understanding** (INCORRECT): Certain fields require skip logic to prevent import contamination.

**Correct Understanding** (Nov 1, 2025): ReferenceValues overlay works through natural flow:

**How it actually works:**
1. **Page load**: ReferenceState.setDefaults() loads ReferenceValues based on d_13
2. **Import**: syncFromGlobalState() CAN overwrite with Excel values (no skip logic needed)
3. **d_13 change**: onReferenceStandardChange() listener re-applies ReferenceValues
4. **User edit**: User can manually override at any time

**Why skip logic was unnecessary:**
- ReferenceValues defaults set on page load
- d_13 changes trigger onReferenceStandardChange() which resets to code values
- Natural event-driven flow handles everything
- Skip logic was adding complexity without benefit

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

### **🔍 REVISED UNDERSTANDING** ⚠️

**Previous Theory (WRONG)**: We thought there were two categories requiring different skip logic.

**Correct Understanding** (Tested Nov 1, 2025):

**ALL Reference fields can import from Excel normally.** No skip logic is needed anywhere.

**Why This Works:**
- ReferenceValues defaults set on page load (ReferenceState.setDefaults())
- Import CAN overwrite these defaults with Excel values
- When user changes d_13 Standard, onReferenceStandardChange() listener resets code-mandated fields
- Natural event-driven architecture handles everything automatically

**Field Categories (for understanding, NOT for skip logic):**

#### **ReferenceValues-Based Fields** (can still import!)
- **f_113** (HSPF), **j_115** (AFUE), **g_88-g_93** (U-values)
- Have code-based defaults from ReferenceValues.js
- Excel CAN import these (e.g., if modeling a specific existing system)
- User changing d_13 Standard resets them via onReferenceStandardChange()

#### **Regular Reference Fields** (always import)
- **d_118** (ERV%), **g_118** (Vent method), **i_41** (Air tightness in Target)
- Design choices for Reference model
- Excel imports these normally

**Key Insight**: Skip logic was NEVER needed. Type fix alone solved S13 HSPF slider issue.

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
