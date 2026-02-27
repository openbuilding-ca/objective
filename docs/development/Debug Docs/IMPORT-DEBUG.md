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

#### **Issue 3: ref_g_118 (S13)** ✅ FIXED

**Symptom:** Both Target and Reference g_118 show "Volume by Schedule" (initialized default) instead of Excel values

**Expected Values:**
- REPORT sheet (Target g_118): "Occupant Constant"
- REFERENCE sheet (Reference ref_g_118): "Volume Constant"

**Diagnostic Investigation (Nov 1, 2025 evening):**

Added debug logging to trace import pipeline - NO ExcelMapper logs appeared for g_118 import, confirming cell was never read from Excel.

**Root Cause:**

**ExcelMapper.js had WRONG Excel column mapping.**

[ExcelMapper.js:190](src/core/ExcelMapper.js#L190) and [line 348](src/core/ExcelMapper.js#L348):
```javascript
// BEFORE (WRONG):
H118: "g_118",      // ❌ Wrong column! H is for h_118 fields
H118: "ref_g_118",  // ❌ Wrong column!

// AFTER (CORRECT):
G118: "g_118",      // ✅ Column G for g_* fields
G118: "ref_g_118",  // ✅ Column G for g_* fields
```

**Why This Happened:**
- Field naming convention: g_118 field should map to column G, row 118
- ExcelMapper was incorrectly mapping to column H (which would be h_118)
- Excel DOES contain the data in G118, but ExcelMapper was looking in wrong column

**The Fix:**
Changed ExcelMapper mapping from H118 → G118 for both Target and Reference

**Why This Differs from HSPF Bug:**
- HSPF: Field type mismatch (slider initialization) - FieldManager issue
- g_118: Wrong Excel column mapping - ExcelMapper issue

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

## 🔍 **S11 CASCADE INVESTIGATION** (Nov 2, 2025)

**Status**: DIAGNOSTIC PHASE
**Next Action**: Run s11-import-debug.js during import to trace value flow

### **Cascade Dependency Chain**

After import, the calculation cascade should flow:

```
S11.calculateAll()
  ├─ calculateTargetModel() → Writes i_98, k_98, i_97, k_97
  └─ calculateReferenceModel() → Writes ref_i_98, ref_k_98, ref_i_97, ref_k_97
     ↓
S12.calculateAll()
  ├─ Reads ref_i_98 (S11 total envelope loss)
  └─ calculateReferenceModel() → Writes ref_g_101, ref_d_101, ref_i_104
     ↓
S13.calculateAll()
  └─ calculateReferenceModel() → Writes ref_m_121
     ↓
S15.calculateAll()
  ├─ Reads ref_i_104 (from S12)
  ├─ Reads ref_g_101, ref_d_101 (from S12)
  ├─ Reads ref_m_121 (from S13)
  └─ calculateReferenceModel() → Calculates Reference totals
     ↓
S01.updateTEUIDisplay()
  └─ Displays e_10 (Reference TEUI)
```

### **User's Observations**

1. After import, e_10 shows **387.3** (expected ~172.7)
2. Manual S11 mode toggle to Reference → e_10 changes to **191.5**
3. S13 mode toggles + recalc → e_10 reaches **176.7** (close to 172.7)
4. S14, S15, S04 show "interim partially calculated values" (not defaults)

**Interpretation**: Calculations ARE running, but producing incorrect intermediate values. This suggests:
- S11 Reference calculations may not be completing or publishing values
- S12 may be reading undefined/null from S11 and using fallbacks
- Cascade propagates incomplete data to S15 → S01

### **Investigation Results** ✅ ROOT CAUSE FOUND

**Diagnostic Script**: [s11-import-debug.js](docs/development/s11-import-debug.js)

**Test Results** (Nov 2, 2025):

Debug logs reveal calculation execution order during import:

```
82707.50ms: S12.calculateAll() STARTED  ← S12 RUNS FIRST!
  S12 reads S11 values:
    ref_i_98 = 81772.79 (from PREVIOUS calculation, not current import)
    ref_k_98 = 1689.65
    ref_i_97 = 40886.39
    ref_k_97 = 844.82

82831.70ms: S12.calculateAll() FINISHED
  S12 writes:
    ref_g_101 = 0.578
    ref_d_101 = 274.9
    ref_i_104 = 30601.64

82833.70ms: S11.calculateAll() STARTED  ← S11 RUNS AFTER S12!
  S11 Reference outputs BEFORE: (same values from previous calc)
    ref_i_98 = 81772.79

82844.50ms: S11.calculateAll() FINISHED
  S11 Reference outputs AFTER: (UNCHANGED - see analysis below)
    ref_i_98 = 81772.79 (should have updated to new imported values!)

82849.60ms: S15.calculateAll() STARTED
  S15 reads S12 values:
    ref_i_104 = 30601.64 (calculated with STALE S11 data)
```

**ROOT CAUSE IDENTIFIED**:

🚨 **Calculator.js calculation order is WRONG** ([Calculator.js:488-507](src/core/Calculator.js#L488-L507))

```javascript
const calcOrder = [
  "sect02",
  "sect03",
  "sect08",
  "sect09",
  "sect12", // ❌ LINE 493: S12 runs FIRST
  "sect10",
  "sect11", // ❌ LINE 495: S11 runs AFTER S12 (WRONG!)
  "sect07",
  "sect13",
  ...
];
```

**Dependency Analysis:**

- **S11 → S12**: S12 reads `ref_i_98` (S11 total envelope loss) for its Reference calculations
- **S12 ← S11**: S11 does NOT read anything from S12 (gets areas from S10)

**Current (WRONG) order**: S12 → S11
- S12 calculates using STALE ref_i_98 from previous session/calculation
- S11 calculates correctly but TOO LATE for S12 to use

**Why Electricity/Gas imports work but Heatpump doesn't:**
- Different S13 calculation paths for different heating systems
- Heatpump systems have more complex energy calculations that amplify the cascade error
- Electricity/Gas systems may have simpler calculations that mask the stale data issue

### **THE FIX**

**File**: [Calculator.js:488-507](src/core/Calculator.js#L488-L507)

**Change calculation order** to respect dependency S11 → S12:

```javascript
const calcOrder = [
  "sect02", // Building Info
  "sect03", // Climate
  "sect08", // IAQ
  "sect09", // Internal Gains
  "sect10", // Radiant Gains (i80 for S15)
  "sect11", // ✅ Transmission Losses (writes ref_i_98)
  "sect12", // ✅ Volume Metrics (reads ref_i_98 from S11)
  "sect07", // Water Use (k51 for S15)
  "sect13", // Mechanical Loads
  "sect06", // Renewable Energy
  "sect14", // TEDI Summary
  "sect04", // ✅ Actual/Target Energy (AFTER S14 per user confirmation)
  "sect05", // Emissions (consumes S04)
  "sect15", // TEUI Summary
  "sect16", // Sankey
  "sect17", // Dependency Graph
  "sect01", // Key Values (consumes S15, S05)
];
```

**Changes:**
1. Move "sect11" from line 495 to BEFORE "sect12" (line 493)
2. Update comment: "Volume Metrics (reads ref_i_98 from S11)"
3. Verify sect04 is after sect14 (already correct per user)

---

**Last Updated**: 2025-11-02

## 📊 **STATUS SUMMARY**

| Issue | Status | Type | Resolution |
|-------|--------|------|------------|
| **S13 HSPF Slider** | ✅ FIXED | Code Bug | Type fix: "coefficient" → "coefficient_slider" (commit a0b685d, c799192) |
| **ref_d_118 (ERV%)** | ✅ FIXED | Code Bug | Removed from skip list (commit 3d43a59) |
| **ref_i_41 (S05)** | ✅ FIXED | Code Bug | Made calculated in Reference (i_41 = i_39) (commit 3d43a59) |
| **ref_g_118 (Vent Method)** | ✅ FIXED | Code Bug | ExcelMapper wrong column: H118 → G118 (commit 6d47c66) |
| **S11 Calc Order** | ✅ FIXED | Calc Order Bug | Calculator.js: Swapped S11/S12 order - S11 before S12 |
| **S11 Import Cascade** | ✅ FIXED | Timing Bug | Added isImportActive flag for dual-state sync during import (Nov 2) |

---

## ✅ **S11 IMPORT CASCADE FIX** (Nov 2, 2025)

### The Bug

After importing Excel files with Heatpump heating systems, e_10 (Reference TEUI) displayed an incorrect value (~387.3 instead of ~172.7). The issue was resolved by manually toggling S11 to Reference mode and back, which triggered proper area synchronization.

**Symptoms**:
- e_10 incorrect immediately after import
- Manual S11 Reference toggle fixes the value
- Electricity/Gas heating systems not affected
- Debug logs showed S11.calculateReferenceModel() running but ref_i_98 (envelope losses) remaining unchanged

### Root Cause Analysis

Through detailed investigation using diagnostic scripts (s11-import-debug.js) and 16,045 lines of debug logs, discovered:

1. **Timing Issue**: `isInitializationPhase` flag in Section11.js (line 2437) set to `false` after DOMContentLoaded
2. **Import Happens Later**: FileHandler's import process occurs AFTER DOMContentLoaded
3. **Sync Blocked**: `needsDualSync` condition (line 1216) required `isInitializationPhase = true`, which failed during import
4. **Stale Values**: Reference areas (ref_d_73 - ref_d_78) imported but not synced to S11.ReferenceState
5. **Wrong Calculations**: S11's calculateReferenceModel() ran with stale area values from previous session

**Why Manual Toggle Worked**:
- Switching to Reference mode called syncAreasFromS10() while `currentMode = "reference"`
- This triggered normal mode-aware sync, populating Reference areas correctly
- Subsequent calculations used correct area values

### The Fix

**Files Modified**:
- [Section11.js:23](../../src/sections/Section11.js#L23) - Added `isImportActive` flag
- [Section11.js:1216](../../src/sections/Section11.js#L1216) - Modified `needsDualSync` condition
- [Section11.js:2488-2491](../../src/sections/Section11.js#L2488-L2491) - Exposed `setImportActive()` function
- [FileHandler.js:700-710](../../src/core/FileHandler.js#L700-L710) - Wrapped syncAreasFromS10() with import flag control

**Implementation**:

```javascript
// Section11.js - Added new flag
let isImportActive = false; // Allow DUAL-STATE SYNC during import

// Section11.js - Modified sync condition
const needsDualSync =
  (isInitializationPhase || isImportActive) && // ← Added isImportActive
  currentMode === "target" &&
  (refArea_d88 === undefined || refArea_d88 !== stateManager_refArea);

// Section11.js - Exposed setter
setImportActive: (active) => {
  isImportActive = active;
  console.log(`[S11 Area Sync] Import phase ${active ? "STARTED" : "ENDED"}`);
}

// FileHandler.js - Control flag during import
if (window.TEUI?.SectionModules?.sect11?.setImportActive) {
  window.TEUI.SectionModules.sect11.setImportActive(true);
}
window.TEUI.SectionModules.sect11.syncAreasFromS10();
if (window.TEUI?.SectionModules?.sect11?.setImportActive) {
  window.TEUI.SectionModules.sect11.setImportActive(false);
}
```

**How It Works**:
1. FileHandler sets `isImportActive = true` before calling syncAreasFromS10()
2. syncAreasFromS10() evaluates `(isInitializationPhase || isImportActive)` → true
3. Dual-state sync executes, populating BOTH TargetState and ReferenceState areas
4. FileHandler sets `isImportActive = false` after sync completes
5. S11's calculateReferenceModel() now uses correct Reference area values
6. No manual S11 Reference toggle required

### Testing Results ✅

**VERIFIED** - Nov 2, 2025: Import has 100% parity with Excel!

- [x] Import Excel file with Heatpump system (previously required S11 Reference toggle) - **WORKS**
- [x] Verify e_10 displays correct value (~172.7) immediately after import - **CORRECT**
- [x] Verify Electricity/Gas systems continue to work correctly - **WORKS**
- [x] No manual S11 Reference toggle required - **CONFIRMED**

**Result**: The isImportActive flag successfully enables dual-state sync during import, ensuring Reference areas are properly synced before S11's calculateReferenceModel() runs. Import now achieves 100% parity with Excel values on first calculation pass.

### Related Investigation

This bug was discovered while investigating a separate h_24 contamination issue (see [h24-cascade-trace.md](h24-cascade-trace.md)). The two issues are distinct:
- **S11 Import Cascade** (this fix): Reference areas not synced during import
- **h_24 Contamination**: Reference totals changing when editing Target climate values (still under investigation)
