# Excel Mapper - Import/Export System Documentation

## Overview

This document tracks the Excel import/export system architecture, focusing on:

1. Dual-state import (Target REPORT sheet + Reference REFERENCE sheet)
2. State management and value state priorities
3. Import quarantine pattern to prevent calculated defaults from overwriting imports
4. Pattern A section integration (S02, S03, S04, S05, S06, S08, S15)

**Full debugging history archived in:** `MAPPER-FULL-DEBUG-OCT4.md`

---

## 🔥 Critical Bug Fix - Import Overwrite Issue (Oct 4, 2025)

### Problem Statement

**Symptom:** Reference values imported correctly but displayed incorrectly

- Excel REFERENCE sheet H15: 11167 (imported ✅)
- StateManager after import: ref_h_15 = "11167" (stored ✅)
- UI display: 1427.20 (WRONG ❌ - stale default showing instead)

### Root Cause

**Stack Trace Evidence (The Smoking Gun):**

```
[StateManager DEBUG] ref_h_15 setValue: "1427.20" (state: calculated, prev: 11167)

Stack trace:
setValue @ 4011-StateManager.js:354
(anonymous) @ 4012-Section02.js:839          ← storeReferenceResults()
storeReferenceResults @ 4012-Section02.js:837
calculateReferenceModel @ 4012-Section02.js:803
calculateAll @ 4012-Section02.js:928
calculateAndRefresh @ 4012-Section02.js:1145  ← LISTENER TRIGGERED!
(anonymous) @ 4011-StateManager.js:551        ← notifyListeners()
setValue @ 4011-StateManager.js:409
(anonymous) @ 4011-FileHandler.js:324         ← DURING IMPORT!
```

**What Happened:**

1. Import stored: `ref_h_15 = "11167"` (state: "imported") ✅
2. Import triggered S02 listener during import sequence ❌
3. S02 calculated with stale isolated state (not yet synced)
4. S02 published: `ref_h_15 = "1427.20"` (state: "calculated") ❌
5. **CALCULATED overwrote IMPORTED** (no state priority enforcement)

### The Bug in S02

```javascript
// 4012-Section02.js:817-850 (BEFORE FIX)
function storeReferenceResults() {
  const referenceResults = {
    h_12: ReferenceState.getValue("h_12"), // ❌ INPUT FIELD
    h_13: ReferenceState.getValue("h_13"), // ❌ INPUT FIELD
    d_12: ReferenceState.getValue("d_12"), // ❌ INPUT FIELD
    d_13: ReferenceState.getValue("d_13"), // ❌ INPUT FIELD
    h_15: ReferenceState.getValue("h_15"), // ❌ INPUT FIELD (THE BUG!)
    l_12: ReferenceState.getValue("l_12"), // ❌ INPUT FIELD
    // ... more INPUT fields ...
    d_16: ReferenceState.getValue("d_16"), // ✅ CALCULATED FIELD
  };

  Object.entries(referenceResults).forEach(([fieldId, value]) => {
    window.TEUI.StateManager.setValue(
      `ref_${fieldId}`,
      String(value),
      "calculated", // ❌ WRONG! INPUT fields should never have "calculated" state
    );
  });
}
```

**Problem:** S02 was publishing INPUT fields (h_15, d_13, etc.) with "calculated" state, overwriting imported values.

---

## ✅ Solution Implemented (Oct 4, 2025)

### Three-Part Fix (~50 lines of code)

#### 1. StateManager.js - Import Quarantine Infrastructure

**Added OVER_RIDDEN state (line 161):**

```javascript
const VALUE_STATES = {
  DEFAULT: "default",
  IMPORTED: "imported",
  USER_MODIFIED: "user-modified",
  OVER_RIDDEN: "over-ridden", // NEW: ReferenceValues overlays
  CALCULATED: "calculated",
  DERIVED: "derived",
};
```

**Added listener muting (lines 172, 547-551, 1817-1829):**

```javascript
let listenersActive = true; // Flag to mute listeners during import quarantine

function notifyListeners(fieldId, newValue, oldValue, state) {
  // Check if listeners are muted (import quarantine)
  if (!listenersActive) {
    console.log(
      `[StateManager] Skipped listener for ${fieldId} (quarantine active)`,
    );
    return;
  }
  // ... existing notification logic ...
}

function muteListeners() {
  listenersActive = false;
  console.log("[StateManager] 🔒 Listeners MUTED (import quarantine active)");
}

function unmuteListeners() {
  listenersActive = true;
  console.log("[StateManager] 🔓 Listeners UNMUTED (import quarantine ended)");
}
```

**Impact:** Enables import quarantine pattern to prevent premature calculations

---

#### 2. FileHandler.js - Import Quarantine Pattern

**Wrapped import sequence (lines 141-168):**

```javascript
// 🔒 START IMPORT QUARANTINE - Mute listeners to prevent premature calculations
console.log("[FileHandler] 🔒 IMPORT QUARANTINE START - Muting listeners");
window.TEUI.StateManager.muteListeners();

try {
  // Import Target values (REPORT sheet)
  this.updateStateFromImportData(importedData, 0, false);
  console.log(
    `[FileHandler] Imported ${Object.keys(importedData).length} Target values`,
  );

  // Import Reference values (REFERENCE sheet)
  this.processImportedExcelReference(workbook);

  // ✅ CRITICAL: Sync Pattern A sections AFTER both imports
  this.syncPatternASections();
  console.log(
    "[FileHandler] ✅ Pattern A sections synced with imported values",
  );
} finally {
  // 🔓 END IMPORT QUARANTINE - Always unmute, even if import fails
  window.TEUI.StateManager.unmuteListeners();
  console.log("[FileHandler] 🔓 IMPORT QUARANTINE END - Unmuting listeners");
}

// Trigger clean recalculation with all imported values loaded
console.log(
  "[FileHandler] Triggering post-import calculation with fresh values...",
);
this.calculator.calculateAll();
```

**Impact:** Prevents S02 (and other sections) from calculating during import with stale values

---

#### 3. Section02.js - Removed INPUT Fields from Publishing

**Fixed storeReferenceResults() (lines 825-850):**

```javascript
/**
 * ✅ FIX (Oct 4, 2025): Only publish CALCULATED outputs, NOT input fields
 * INPUT fields (h_15, d_13, l_12, etc.) are managed by:
 * - User input → StateManager.setValue("ref_h_15", value, "user-modified")
 * - Import → StateManager.setValue("ref_h_15", value, "imported")
 * - ReferenceValues → StateManager.setValue("ref_f_85", value, "over-ridden")
 *
 * Section calculations should ONLY publish calculated outputs!
 */
function storeReferenceResults() {
  if (!window.TEUI?.StateManager) return;

  // ✅ ONLY publish CALCULATED outputs from Reference model calculations
  const referenceResults = {
    d_16: ReferenceState.getValue("d_16"), // Carbon target (CALCULATED) ✅
    // ❌ REMOVED INPUT FIELDS - they are NOT calculated by S02:
    // h_12, h_13, d_12, d_13, d_14, d_15, h_15, l_12, l_13, l_14, l_15, l_16
  };

  Object.entries(referenceResults).forEach(([fieldId, value]) => {
    if (value !== null && value !== undefined) {
      window.TEUI.StateManager.setValue(
        `ref_${fieldId}`,
        String(value),
        "calculated",
      );
    }
  });

  console.log(
    "[S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)",
  );
}
```

**Impact:** S02 no longer overwrites imported INPUT fields with calculated state

---

### Test Results

**Test Case:** Import Excel with ref_h_15 = 11167

**Before Fix:**

- Import reads: 11167 ✅
- StateManager stores: ref_h_15 = "11167" (state: "imported") ✅
- S02 listener fires during import ❌
- S02 overwrites: ref_h_15 = "1427.20" (state: "calculated") ❌
- **Result:** UI shows 1427.20 (WRONG - stale default)

**After Fix:**

- Import reads: 11167 ✅
- Listeners muted (quarantine active) ✅
- StateManager stores: ref_h_15 = "11167" (state: "imported") ✅
- Sync Pattern A sections: S02.ReferenceState syncs 11167 ✅
- Listeners unmuted ✅
- Clean calculateAll() with fresh values ✅
- S02 storeReferenceResults() publishes ONLY d_16 (not h_15) ✅
- **Result:** UI shows 11167 (CORRECT - imported value preserved)

**User Confirmation:**

> "For the first time now we see 11167 for h_15 in both Target and Reference model h_15 values, and we did not appear to break functionality."

---

## 🏛️ State Architecture Clarification (Oct 4, 2025)

### Two Meanings of "State"

The term "state" has **two distinct meanings** in this application:

#### 1. Value States (metadata about how a value was set)

**For INPUT/EDITABLE fields (h_15, d_13, ref_f_85, etc.):**

- `DEFAULT` - Initial value at app startup (weakest)
- `USER-MODIFIED` - User typed/selected value in UI
- `OVER-RIDDEN` - ReferenceValues overlay applied (when d_13 changes)
- `IMPORTED` - Value loaded from Excel file

**For CALCULATED fields (j_32, k_32, ref_j_32, etc.) - ONLY:**

- `CALCULATED` - Computed result from input values
- `DERIVED` - Secondary calculation

#### 2. Model States (which building model)

- `Target` - The proposed/design building model
- `Reference` - The code-compliant baseline building model

### Critical Rules

**INPUT Fields:**

- Can have: DEFAULT, USER-MODIFIED, OVER-RIDDEN, IMPORTED
- **Last write wins** among USER-MODIFIED, OVER-RIDDEN, IMPORTED (non-hierarchical)
- **NEVER** have CALCULATED or DERIVED states
- Examples: h_15 (area), d_13 (building code), l_12 (electricity price)

**CALCULATED Fields:**

- **ONLY** have CALCULATED or DERIVED states
- Never user-modified, over-ridden, or imported
- Examples: j_32 (TEUI), k_32 (TEDI), d_16 (carbon target)

**State Isolation:**

- Target and Reference models are completely independent
- ref_h_15 changes don't affect h_15 and vice versa
- Both can have same or different value states

### State Priority Matrix

| Current State | Can Be Replaced By                               | Cannot Be Replaced By                 |
| ------------- | ------------------------------------------------ | ------------------------------------- |
| DEFAULT       | IMPORTED, USER_MODIFIED, OVER_RIDDEN, CALCULATED | (none - weakest)                      |
| USER_MODIFIED | IMPORTED, OVER_RIDDEN                            | DEFAULT, CALCULATED                   |
| OVER_RIDDEN   | IMPORTED, USER_MODIFIED                          | DEFAULT, CALCULATED                   |
| IMPORTED      | USER_MODIFIED, OVER_RIDDEN                       | DEFAULT, CALCULATED                   |
| CALCULATED    | (should only be on calculated fields)            | (INPUT fields should never have this) |

**⚠️ CURRENT LIMITATION:** State priority not enforced in setValue() - last write always wins. This is why import quarantine is necessary.

---

## 📐 Architecture Consistency Analysis

### Reference System Components

**FileHandler.js (Import):**

- **Responsibility:** Load values from external Excel file → StateManager
- **Scope:** One-time operation (user-triggered file upload)
- **Target:** Both Target and Reference states (REPORT + REFERENCE sheets)
- **State Applied:** IMPORTED

**ReferenceValues.js (Code Standards):**

- **Responsibility:** Store building code minimum values (static data)
- **Scope:** Reference to data only (no state modification logic)
- **Target:** Reference state only
- **State Applied:** N/A (data source only)

**ReferenceToggle.js (Display + Setup):**

- **Responsibility 1:** Switch display between Target/Reference (display-only)
- **Responsibility 2:** Copy Target → Reference (Mirror Target setup)
- **Responsibility 3:** Apply ReferenceValues overlays (Mirror + Reference setup)
- **Scope:** User-triggered setup operations + display toggling
- **Target:** Reference state (reads from Target, writes to Reference)
- **State Applied:** "mirrored", "reference-standard" (should standardize to IMPORTED, OVER_RIDDEN)

**ReferenceManager.js (Coordination):**

- **Responsibility:** Coordinate access to ReferenceValues based on d_13 selection
- **Scope:** Query/helper module (no direct state modification)
- **Target:** Both states (identifies code-defined fields, manages standard selection)
- **State Applied:** N/A (coordination only)

### Integration Validation

**✅ No Functional Duplication:** Each module has distinct, non-overlapping responsibilities

**✅ Pattern Consistency:**

- All use ModeManager facade pattern
- All use StateManager `ref_` prefix
- All respect Target/Reference isolation

**✅ Terminology Alignment:**

- VALUE_STATES consistent across modules
- Model States (Target/Reference) orthogonal to Value States
- OVER_RIDDEN state integrates with existing patterns

**✅ Import Quarantine Compatibility:**

- Doesn't interfere with Mirror Target (operates on isolated section state)
- Doesn't interfere with ReferenceValues overlay (controlled application, no cascading)
- Only affects global StateManager listener chain during import

---

## 📋 Pattern A Sections - Import Sync Status

### Sections Complete (Oct 5-6, 2025)

All Pattern A dual-state sections have import sync implemented:

- ✅ **S02** - Building Info (Oct 4, 2025)
- ✅ **S03** - Climate Calculations (Oct 5, 2025)
- ✅ **S04** - Actual Target Energy (Oct 5, 2025)
- ✅ **S05** - Emissions (Oct 5, 2025)
- ✅ **S06** - On-Site Energy (Oct 5, 2025)
- ✅ **S07** - Renewables (Oct 5, 2025)
- ✅ **S08** - Indoor Air Quality (Oct 5, 2025)
- ✅ **S09** - Occupancy & Gains (Oct 5, 2025)
- ✅ **S10** - Building Enclosure (Oct 5, 2025)
- ✅ **S11** - Transmission Losses (Oct 5, 2025)
- ✅ **S12** - Volume Metrics (Oct 6, 2025)
- ⏳ **S13** - Mechanical Loads (Oct 6, 2025 - calculation fixes in progress, import sync ready)
- ✅ **S15** - TEUI Summary (Oct 5, 2025)

### Fix Pattern (Apply to Each Section)

**1. Identify INPUT vs CALCULATED fields:**

```javascript
// INPUT fields (user-editable, importable):
// - Location, climate zone, occupancy, equipment selections, etc.
// - These should NOT be published by storeReferenceResults()

// CALCULATED fields (computed outputs):
// - TEUI, TEDI, loads, totals, etc.
// - These SHOULD be published for downstream sections
```

**2. Update storeReferenceResults():**

```javascript
function storeReferenceResults() {
  // ✅ ONLY publish CALCULATED outputs
  const referenceResults = {
    // Keep only truly calculated fields
    // Remove all INPUT fields
  };

  Object.entries(referenceResults).forEach(([fieldId, value]) => {
    if (value !== null && value !== undefined) {
      window.TEUI.StateManager.setValue(
        `ref_${fieldId}`,
        String(value),
        "calculated",
      );
    }
  });

  console.log(
    "[SXX] Reference CALCULATED results stored (INPUT fields excluded)",
  );
}
```

**3. Test import for that section's fields**

---

## 🎯 Implementation Checklist

### Completed (Oct 4, 2025)

- ✅ Add OVER_RIDDEN to VALUE_STATES constant
- ✅ Implement listener muting (muteListeners/unmuteListeners)
- ✅ Add import quarantine to FileHandler
- ✅ Fix S02 storeReferenceResults
- ✅ Test ref_h_15 import (11167 preserved correctly)
- ✅ Document architecture consistency analysis
- ✅ Verify no breaking changes

### Pending

- ⏳ **S13 Import Sync:** Apply saved commit `639e119` after calculation bugs are fixed
- ⏳ **S11 Area Sync:** Implement S10→S11 window/door area sync (remove duplicate data entry)

### Future Enhancements (Optional)

- ⏳ Update ReferenceToggle state names ("mirrored" → IMPORTED, "reference-standard" → OVER_RIDDEN)
- ⏳ Add state validation to setValue() (prevent CALCULATED on INPUT fields)
- ⏳ Remove debug logging after full deployment complete

---

## 📊 Commits

**Oct 4, 2025 Session - Import Quarantine Infrastructure:**

- `f8bf50c` - Add architecture consistency analysis for import fix
- `319f78c` - Implement import quarantine fix - prevent calculated defaults from overwriting imports
- `201f111` - Document successful import fix implementation and test results
- `a273a61` - Streamline MAPPER.md - archive full debug session, focus on solutions

**Oct 5, 2025 Session - Pattern A Import Sync (S03-S12):**

- `89aa4c1` - Fix S03 storeReferenceResults - remove INPUT fields (location)
- `e45ed91` - Add S03 ReferenceState.syncFromGlobalState() for location sync
- `20fe5d2` - Fix percentage cell import - convert Excel decimal to app percentage
- `712d980` - Improve percentage detection - check both format string and display value
- `42148e4` - Fix S12 climate data updates: Add missing storeTargetResults() and forced recalculation
- `667628c` - Fix S12 U-value updates: Add forced recalculation for S11 changes
- `f27e77b` - CRITICAL: Fix state isolation - use Target-only recalculation
- `8fcbb3e` - Optimize performance: Limit forced recalculation to user changes only
- `8ec6bbc` - S05 and S06 import sync complete
- `7ec2981` - S07 and S08 import sync complete with 3-step pattern documented
- `dbaccf9` - S09 import sync complete
- `6801eb0` - S10 import sync complete (all 31 fields including sliders)
- `3dc84d7` - Fix S11 import sync - transmission losses with TODO for S10 area sync
- `0fc4ee7` - Fix S12 import sync - volume metrics with 5 fields

**Oct 6, 2025 Session - S13 Calculation Fixes:**

- `286a27d` - Fix S13 slider.value update in refreshUI
- `ae66290` - CRITICAL: S12 publishes ref_d_105 (THE FIX for S13 ventilation)
- `37359d5` - Clean up S13 diagnostic logging (STABLE BASELINE)
- `d40de0d` - Document S13 known issues and implementation plans

**Total Implementation:**

- ~500 lines of production code across 3 sessions
- ~12 hours total (analysis + implementation + testing)
- Zero breaking changes to state isolation architecture
- Full Pattern A import sync (S02-S12) complete

---

## ✅ Section 03 Climate - Complete (Oct 5, 2025)

### Three Fixes Required

**Issue 1: Location Import (Milton → Alexandria)**

- **Problem:** Imported ref_h_19 = "Milton, Ontario" displayed as "Alexandria, Ontario" in Reference mode
- **Root Cause:** S03 storeReferenceResults() published INPUT fields (d_19, h_19, h_20) with "calculated" state, overwriting imports
- **Fix:** Removed INPUT fields from storeReferenceResults(), only publish CALCULATED climate data

**Issue 2: Missing ReferenceState Sync**

- **Problem:** Even with fix #1, imported location didn't sync to S03's isolated ReferenceState
- **Root Cause:** S03 ReferenceState lacked syncFromGlobalState() method (TargetState had it)
- **Fix:** Added ReferenceState.syncFromGlobalState() to read ref_d_19, ref_h_19 from global StateManager

**Issue 3: Percentage Slider Import (50% → 0.5%)**

- **Problem:** Imported i_21 = 50% displayed as 0.5% with slider at far left
- **Root Cause:** Excel stores 50% as 0.5 (decimal), but app expects 50 (percentage value)
- **Fix:** ExcelMapper.extractCellValue() detects percentage format (cell.z or cell.w includes "%") and multiplies by 100

### Implementation Details

#### S03 storeReferenceResults() - Removed INPUT Fields

```javascript
// BEFORE (Publishing INPUT fields - BAD)
const referenceResults = {
  d_19: ReferenceState.getValue("d_19"), // ❌ Province (INPUT)
  h_19: ReferenceState.getValue("h_19"), // ❌ City (INPUT)
  h_20: ReferenceState.getValue("h_20"), // ❌ Weather toggle (INPUT)
  d_20: ReferenceState.getValue("d_20"), // HDD (CALCULATED)
  // ... etc
};

// AFTER (Only CALCULATED outputs - GOOD)
const referenceResults = {
  // ❌ REMOVED: d_19, h_19, h_20 (INPUT fields)
  d_20: ReferenceState.getValue("d_20"), // HDD (CALCULATED) ✅
  d_21: ReferenceState.getValue("d_21"), // CDD (CALCULATED) ✅
  j_19: ReferenceState.getValue("j_19"), // Climate zone (CALCULATED) ✅
  // ... etc
};
```

#### S03 ReferenceState.syncFromGlobalState() - Added Method

```javascript
syncFromGlobalState: function (fieldIds = ["d_19", "h_19", "i_21"]) {
  fieldIds.forEach((fieldId) => {
    const refFieldId = `ref_${fieldId}`;
    const globalValue = window.TEUI.StateManager.getValue(refFieldId);
    if (globalValue !== null && globalValue !== undefined) {
      this.setValue(fieldId, globalValue, "imported");
      console.log(`S03 ReferenceState: Synced ${fieldId} = ${globalValue} from (${refFieldId})`);
    }
  });
}
```

#### ExcelMapper.extractCellValue() - Percentage Detection

```javascript
if (cell.t === "n") {
  // Check cell.z (format string) OR cell.w (display value) for %
  const hasPercentFormat =
    (cell.z && cell.z.includes("%")) || (cell.w && cell.w.includes("%"));
  if (hasPercentFormat) {
    // Excel 0.5 → App 50
    return cell.v * 100;
  }
  return cell.v; // Regular number
}
```

### Test Results

**Before Fixes:**

- Location: Milton, Ontario (Target) / Alexandria, Ontario (Reference) ❌
- Capacitance: 50% (Target) / 0.5% slider at far left (Reference) ❌

**After Fixes:**

- Location: Milton, Ontario (both Target and Reference) ✅
- Capacitance: 50% slider at center (both Target and Reference) ✅
- Climate data: Correct for Milton (4164 HDD, 237 CDD) ✅

### Pattern Learned: Percentage Sliders

**Excel Storage vs App Storage:**

- Excel: Percentage cells store decimal (50% = 0.5 in cell.v)
- App: Sliders expect integer (50 for 50%)
- Format detection: Check `cell.z` (format string) OR `cell.w` (display "50%")
- Conversion: `cell.v * 100` when percentage detected

**Applies to any percentage field imports (not just i_21)**

---

## 🚨 CRITICAL BUG - Calculation Chain Blocked After Import (Oct 5, 2025)

### Problem Statement

**Calculation flow works perfectly BEFORE import, but breaks AFTER import:**

**BEFORE Import (Working ✅):**

```
User changes S03 city → Milton (3920 HDD) to Attawapiskat (7100 HDD)
→ S03 calculates new climate data
→ S10 updates
→ S11 updates heatloss
→ S12 updates (?)
→ S13 updates
→ S14 updates
→ S15 updates energy use
→ S04 calculates costs
→ S01 h_10 TEUI updates ✅
```

**AFTER Import (BLOCKED ❌):**

```
User changes S03 city → Milton (3920 HDD) to Attawapiskat (7100 HDD)
→ S03 calculates new climate data ✅
→ S10 updates ✅
→ S11 updates heatloss ✅
→ S12 DOES NOT UPDATE ❌
→ S13 updates ✅
→ S14 updates ✅
→ S15 REMAINS STALE ❌ ← CRITICAL!
→ S04 never receives updated values
→ S01 h_10 TEUI REMAINS STALE ❌
```

### Critical Impact

**S15 remaining current is IMPERATIVE** - S04 needs S15 energy values to update S01 dashboard.

The calculation chain is broken somewhere between:

- S11 (updating) → S12 (not updating)
- S14 (updating) → S15 (remaining stale)

### Investigation Notes

**What We Know:**

1. Import quarantine pattern works correctly (mute → import → sync → unmute → calculateAll)
2. S03 publishes Target climate data to global StateManager correctly
3. S11 has listeners for d_20, d_21 and they fire correctly
4. The chain works perfectly when NO import has occurred
5. Something about the import process permanently breaks the listener chain

**Hypothesis:**

- Import might not be restoring all section listeners correctly
- Pattern A sections might have publishing gaps (missing storeTargetResults functions)
- Listener registration might be conditional on initialization state

**Next Steps:**

- Trace exact point where chain breaks (S11→S12 vs S14→S15)
- Verify all Pattern A sections publish Target results to global StateManager
- Confirm listener registration survives import sequence

### Status: ✅ RESOLVED (Oct 5, 2025)

**Root cause identified and fixed - calculation chain fully restored.**

---

## 🔧 S11-S12 Calculation Flow Fixes (Oct 5, 2025)

### Problem Identified During Import Testing

**Stale Value Issues After Import:**

- S12 formulas H101=(D$20*G101*24)/1000 and H102=(D$22*G102*24)/1000 not updating when S03 published climate changes
- S12 aggregate U-values (g_101, g_102) not updating when S11 published U-value changes (f_85, g_85, etc.)
- Excel formulas G101=(SUMPRODUCT*TB%) and G102=(SUMPRODUCT*TB%) remained stale

### Root Cause Analysis

**StateManager Listener System Failure:**

- S03 published climate data (d_20, d_22) correctly to StateManager
- S11 published U-value data (f_85, g_85) correctly to StateManager
- S12 listeners were registered but **never triggered** when upstream sections published changes
- S12 continued reading stale values via "robot fingers" from upstream section states

### Solutions Implemented

#### 1. S03→S12 Climate Data Flow

**Missing Target Results Publication:**

- **Issue:** S03 had `storeReferenceResults()` but missing `storeTargetResults()`
- **Fix:** Added `storeTargetResults()` to publish calculated climate data (d_22, h_22) for Target mode
- **Backup:** Added forced S12 recalculation after S03 climate data publication

#### 2. S11→S12 U-Value Flow

**Listener System Bypass:**

- **Issue:** S12 listeners not triggering when S11 published U-value changes
- **Fix:** Added forced S12 recalculation after S11 U-value changes (f*, g*, d_97)
- **Result:** Excel formulas now update immediately when U-values change

#### 3. State Isolation Preservation

**Dual-Engine Contamination:**

- **Issue:** Forced `calculateAll()` ran both Target AND Reference engines, causing state mixing
- **Fix:** Changed to `calculateTargetModel()` only for Target mode changes
- **Result:** Perfect state isolation maintained (months of work preserved)

#### 4. Performance Optimization

**Excessive Recalculation Cascade:**

- **Issue:** Every U-value change triggered recalculation, causing 900ms+ initialization, 200ms+ updates
- **Fix:** Limited forced recalculation to `user-modified` changes only (not calculated cascades)
- **Result:** Restored 650ms initialization, 20ms updates

### Commits Applied

- `42148e4` - Fix S12 climate data updates: Add missing storeTargetResults() and forced recalculation
- `667628c` - Fix S12 U-value updates: Add forced recalculation for S11 changes
- `f27e77b` - CRITICAL: Fix state isolation - use Target-only recalculation
- `8fcbb3e` - Optimize performance: Limit forced recalculation to user changes only

### Impact

**✅ Calculation Chain Fully Restored:**

- S03 climate changes → S12 formulas update → S15 TEUI updates → S04 costs update → S01 dashboard updates
- S11 U-value changes → S12 aggregate U-values update → downstream calculations flow correctly
- Excel formula parity maintained with optimal performance
- Perfect state isolation preserved

**Pattern A sections can now proceed safely with import workplan completion.**

---

## ✅ S05-S06 Import Sync Complete (Oct 5, 2025)

### Problem: Values Clearing on Mode Switch

**Symptom:**

- S05 i_41: Imported 600 in Target, but reverted to default 345.82 on mode switch
- S06 m_43: Imported 800000, but cleared to 0 on mode switch to Reference
- Values appeared in DOM after import but vanished when toggling between Target/Reference

### Root Cause Analysis

**Three Critical Issues Found:**

1. **Missing Module Exposure (S05 & S06)**

   - syncFromGlobalState() methods existed but weren't accessible
   - Module export only exposed ModeManager, NOT TargetState/ReferenceState
   - FileHandler couldn't call section.TargetState.syncFromGlobalState()

2. **Incorrect Field Sync Lists (S05)**

   - TargetState only synced d_39, missing i_41
   - ReferenceState tried to sync i_41 (should be calculated, not imported)
   - Excel formula: Reference i_41 = i_39 (typology-based cap)

3. **Missing Calculation (S05 Reference)**
   - Reference mode didn't calculate i_41 = i_39
   - Comment said "IMPLEMENTED" but actual calculation was missing

### Fixes Applied

#### 1. Expose State Objects (S05 & S06)

**Before:**

```javascript
return {
  ModeManager: ModeManager,
};
```

**After:**

```javascript
return {
  ModeManager: ModeManager,
  // ✅ PHASE 2: Expose state objects for import sync
  TargetState: TargetState,
  ReferenceState: ReferenceState,
};
```

#### 2. Fix S05 Sync Lists

**TargetState (line 66):**

```javascript
syncFromGlobalState: function (fieldIds = ["d_39", "i_41"]) {
  // ✅ Now syncs BOTH d_39 and i_41 from import
```

**ReferenceState (line 151):**

```javascript
syncFromGlobalState: function (fieldIds = ["d_39"]) {
  // ✅ Removed i_41 - it's calculated, not imported
  // NOTE: i_41 is NOT synced - it's calculated as i_41 = i_39 in Reference mode
```

#### 3. Add S05 Reference i_41 Calculation (line 1007)

```javascript
function calculateReferenceModel() {
  const typology = ReferenceState.getValue("d_39");
  const cap = calculateTypologyBasedCap(typology, true);
  window.TEUI.StateManager.setValue("ref_i_39", cap, "calculated");

  // ✅ FIX (Oct 5, 2025): In Reference mode, i_41 = i_39 (Excel formula)
  window.TEUI.StateManager.setValue("ref_i_41", cap, "calculated");
  ReferenceState.setValue("i_41", cap, "calculated");

  // ... rest of calculations
}
```

### Test Results

**Before Fixes:**

- S05 Target i_41: 600 → 345.82 (reverts to default on mode switch) ❌
- S05 Reference i_41: Shows default 345.82 instead of calculated 350 ❌
- S06 Target m_43: 800000 → 0 (clears on mode switch) ❌
- S06 Reference m_43: 0 (not synced) ❌

**After Fixes:**

- S05 Target i_41: 600 (persists on mode switch) ✅
- S05 Reference i_41: 350 (calculated from Steel typology) ✅
- S06 Target m_43: 800000 (persists on mode switch) ✅
- S06 Reference m_43: 800000 (synced from import) ✅

### ⭐ COMPLETE FIX PATTERN for Pattern A Import Sync

**When adding import sync to any Pattern A section, you MUST complete ALL THREE steps:**

#### Step 1: Add syncFromGlobalState() Methods to Section File

**TargetState.syncFromGlobalState():**

```javascript
const TargetState = {
  // ... existing methods ...

  /**
   * ✅ PHASE 2: Sync from global StateManager after import
   * Bridges global StateManager → isolated TargetState for imported values
   */
  syncFromGlobalState: function (fieldIds = ["field1", "field2", "field3"]) {
    fieldIds.forEach((fieldId) => {
      const globalValue = window.TEUI.StateManager.getValue(fieldId);
      if (globalValue !== null && globalValue !== undefined) {
        this.setValue(fieldId, globalValue);
        console.log(
          `S0X TargetState: Synced ${fieldId} = ${globalValue} from global StateManager`,
        );
      }
    });
  },
};
```

**ReferenceState.syncFromGlobalState():**

```javascript
const ReferenceState = {
  // ... existing methods ...

  /**
   * ✅ PHASE 2: Sync from global StateManager after import
   * Bridges global StateManager → isolated ReferenceState for imported values
   */
  syncFromGlobalState: function (fieldIds = ["field1", "field2", "field3"]) {
    fieldIds.forEach((fieldId) => {
      const refFieldId = `ref_${fieldId}`;
      const globalValue = window.TEUI.StateManager.getValue(refFieldId);
      if (globalValue !== null && globalValue !== undefined) {
        this.setValue(fieldId, globalValue);
        console.log(
          `S0X ReferenceState: Synced ${fieldId} = ${globalValue} from global StateManager (${refFieldId})`,
        );
      }
    });
  },
};
```

#### Step 2: Expose State Objects in Module Return Statement

**Module Export Pattern:**

```javascript
return {
  getFields: getFields,
  getLayout: getLayout,
  ModeManager: ModeManager,

  // ✅ REQUIRED for FileHandler import sync
  TargetState: TargetState,
  ReferenceState: ReferenceState,
};
```

#### Step 3: Add Section to FileHandler.syncPatternASections() Array

**File:** `4011-FileHandler.js` (around line 459)

```javascript
const patternASections = [
  { id: "sect02", name: "S02" },
  { id: "sect03", name: "S03" },
  { id: "sect04", name: "S04" },
  { id: "sect05", name: "S05" },
  { id: "sect06", name: "S06" },
  { id: "sect07", name: "S07" }, // ✅ Add your section here
  { id: "sect08", name: "S08" },
  { id: "sect15", name: "S15" },
];
```

**⚠️ CRITICAL:** Missing ANY of these 3 steps will cause import to fail silently!

**Common Symptoms When Steps Are Missing:**

- **Missing Step 1 or 2:** FileHandler logs "S0X TargetState.syncFromGlobalState() not available"
- **Missing Step 3:** No FileHandler sync logs for that section at all
- **Result:** Values import to global StateManager but isolated state uses defaults → values clear on mode switch

#### Debugging Checklist

After implementing, verify in browser console logs after import:

```
✅ [FileHandler] Syncing S0X TargetState...
✅ S0X TargetState: Synced field1 = value1 from global StateManager
✅ [FileHandler] Syncing S0X ReferenceState...
✅ S0X ReferenceState: Synced field1 = value1 from global StateManager (ref_field1)
```

If you DON'T see these logs:

1. **Hard refresh browser** (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. **Delete browser cache/history** if needed
3. Check FileHandler array includes your section (Step 3)
4. Check module exposes TargetState/ReferenceState (Step 2)

#### Field Classification for Sync

**Which fields to include in sync array:**

- **Target Input Fields:** Sync from Excel import (e.g., S05 i_41, S06 m_43)
- **Reference Input Fields:** Sync if independent (e.g., S06 m_43)
- **Reference Calculated Fields:** DON'T sync, calculate instead (e.g., S05 i_41 = i_39)

### Commits Applied (Oct 5, 2025)

- `8ec6bbc` - S05 and S06 import sync complete
- `7ec2981` - S07 and S08 import sync complete with 3-step pattern documented
- `dbaccf9` - S09 import sync complete
- `6801eb0` - S10 import sync complete (all 31 fields including sliders)

---

## ⚠️ TODO: S11 Window/Door Area Sync from S10 (Oct 6+ work)

**Current Status (Oct 5, 2025):**

- S11 d_88-d_93 (window/door areas) are **user-editable** and **import from Excel**
- This creates duplicate data entry (user enters in S10, then again in S11 Excel import)

**Original Design (surgically removed during refactor):**

- S11 should **read** d_88-d_93 areas from S10 d_73-d_78
- Target mode: Read from `d_73-d_78`
- Reference mode: Read from `ref_d_73-ref_d_78`
- S11 area fields should be **readonly** (type: "calculated")

**Challenge:**

- Dual-state architecture makes S10→S11 sync complex
- Need listeners that trigger on S10 changes in both modes
- Must sync after import (S10 imports first, then S11 needs to pull areas)
- Initial attempt caused syntax errors and recursion issues

**Solution Path for Oct 6+:**

1. Restore `areaSourceMap` in S11 (maps d_88→d_73, d_89→d_74, etc.)
2. Add `setupS10AreaListeners()` with dual-state awareness
3. Add `syncAreasFromS10()` called after import and mode switches
4. Change S11 area fields from "editable" to "calculated"
5. Test thoroughly without breaking existing functionality

**For Now:**

- S11 imports all 24 fields including window areas (works but duplicates S10)
- User can manually edit S11 areas if they differ from S10
- This is safe fallback until proper S10→S11 sync is implemented

---

## 🔍 Remaining Work - S07-S15 Import Sync (Oct 5, 2025)

### Issue 1: S11 RSI Values Not Importing

**Symptom:**

- Excel REPORT F85: 5.28 (imported value)
- ExcelMapper line 155: F85 → f_85 (mapped correctly ✅)
- S11 display after import: f_85 = 9.35 (stale default ❌)

**Root Cause Found:**

1. **S11 is Pattern A** (has TargetState, ReferenceState, ModeManager)
2. **S11 missing from FileHandler.syncPatternASections()** - Only syncs S02, S03, S04, S05, S06, S08, S15 (lines 459-466)
3. **S11 missing syncFromGlobalState() methods** - No way to pull imported values from global StateManager into isolated state

**Fix Required:**

- Add `TargetState.syncFromGlobalState()` to S11 (pattern from S02/S03)
- Add `ReferenceState.syncFromGlobalState()` to S11 (pattern from S02/S03)
- Add `{ id: "sect11", name: "S11" }` to FileHandler.syncPatternASections() array

### Issue 2: S04 Not Updating After S15 Changes

**Current Behavior:**

- S03 climate change → S15 calculates new d_136 (target electricity) ✅
- S15 publishes d_136 to global StateManager via setTargetValue() (line 104) ✅
- S04 has listener for d_136 registered (line 1302) ✅
- **S04 listener not firing → S01 dashboard remains stale ❌**

**Investigation Findings:**

- S15 DOES publish: `window.TEUI.StateManager.setValue(fieldId, valueToStore, "calculated")` in setTargetValue()
- S04 DOES listen: `window.TEUI.StateManager.addListener("d_136", calculateAndRefresh)`
- Listeners may be registered DURING import quarantine and lost
- Listener registration may be conditional on initialization state

**Next Steps:**

1. Add console.log to S04 d_136 listener to confirm registration
2. Add console.log to S15 setTargetValue() to confirm d_136 publication
3. Check if listeners are cleared/re-registered during import
4. Verify S04 initialization completes BEFORE import starts

### Status: IN PROGRESS

**Priority: CRITICAL** - S04 → S01 flow is essential for dashboard updates.

---

## 📚 Related Documentation

- **4012-S13-DEBUG.md** - S13 Mechanical Loads known issues, fixes, and testing checklist (Oct 6, 2025)
- **Master-Reference-Roadmap.md** - Reference system architecture and anti-patterns
- **README.md** - State terminology clarification (Oct 4, 2025 section)
- **DUAL-STATE-CHEATSHEET.md** - Pattern A implementation patterns
- **history/MAPPER-FULL-DEBUG-OCT4.md** - Complete debugging session archive (3,273 lines, moved to history)

---

## 📖 S13 Mechanical Loads - Import Sync Status (Oct 6, 2025)

**Current Status:**

- ✅ S13 Reference mode ventilation calculations **WORKING** (commit `37359d5`)
- ✅ S12 publishes `ref_d_105` (conditioned volume) - critical fix for S13 calculation chain
- ✅ Slider values update correctly on mode switch
- ❌ Import sync **NOT YET IMPLEMENTED** (pattern ready, waiting for calculation bug fixes)

**Known Issues (see [4012-S13-DEBUG.md](4012-S13-DEBUG.md) for details):**

1. **Number Formatting:** Percentages show as decimals (1.7 instead of 170%) in Reference mode
2. **Free Cooling Math:** d_124 and m_129 show 0.00 in Reference mode (should calculate)

**S13 Import Sync Preparation:**

- 11 user input fields identified for import: d_113, f_113, j_115, d_116, j_116, d_118, g_118, l_118, d_119, l_119, k_120
- syncFromGlobalState() pattern documented in S13-DEBUG.md
- Commit `639e119` has complete implementation (saved, not yet applied)
- **Decision:** Fix calculation bugs first (formatting, cooling math), then apply import sync

**Next Steps for S13:**

1. Fix number formatting in Reference mode (low risk)
2. Fix free cooling calculations (high risk - requires mode-aware reads)
3. Apply import sync from saved commit `639e119` (low risk - proven pattern)

See [4012-S13-DEBUG.md](4012-S13-DEBUG.md) for detailed implementation plans, risk assessments, and testing checklists.

---

_Last Updated: October 10, 2025 - S11 Reference import bug documented_

---

## 🚨 CRITICAL BUG - S11 Reference Area Import Failure (Oct 10, 2025)

### Problem Statement

**ALL S11 Reference area fields show defaults after Excel import, not imported values:**

**Observed Behavior:**

- Excel REFERENCE sheet: D85, D87, D95, D96 contain formulas `=REPORT!D85`, `=REPORT!D87`, etc.
- Excel displays calculated values correctly in REFERENCE sheet cells
- After import: **ALL S11 Reference fields show hardcoded defaults**
  - `ref_d_85`: Shows `1411.52` (default) instead of imported value
  - `ref_d_87`: Shows `0.00` (default) instead of imported value
  - `ref_d_95`: Shows `1100.42` (default) instead of imported value
  - `ref_d_96`: Shows `29.70` (default) instead of imported value

**Downstream Impact:**

- S12 Reference d_106 calculation uses wrong areas → incorrect result (1130.20 defaults)
- S05 Reference d_40 (Total Embedded Carbon) uses wrong d_106 → incorrect calculation
- Reference model calculations do NOT match Excel Reference model

### Root Cause Investigation

**Key Discovery:** `ref_d_85` imports correctly and works, but `ref_d_87`, `ref_d_95`, `ref_d_96` do NOT.

**Question:** What's different about `ref_d_85` vs the others?

**Hypothesis Paths:**

1. **Excel Formula Detection Issue:**

   - ExcelMapper.mapExcelToReferenceModel() has formula detection logic (lines 707-725)
   - Checks if `cell.f` starts with `"REPORT!"` or `"=REPORT!"`
   - If formula detected, reads from REPORT sheet instead
   - **Problem:** SheetJS may not always populate `cell.f` depending on Excel file format
   - **Alternative:** Trust calculated `cell.v` (Option 1 - tried and reverted)

2. **StateManager Storage Issue:**

   - Import stores `ref_d_87`, `ref_d_95`, `ref_d_96` correctly
   - S11 ReferenceState.syncFromGlobalState() reads from StateManager
   - **Problem:** Values might not persist to StateManager or sync fails silently

3. **S12 Fallback Logic Issue:**

   - S12 reads Reference areas with fallback: `parseFloat(getGlobalNumericValue("ref_d_87")) || parseFloat(getGlobalNumericValue("d_87")) || 0`
   - **Problem:** If `ref_d_87 = "0.00"`, parses to `0`, which is falsy → falls back to Target value
   - JavaScript `||` operator treats numeric `0` as falsy

4. **S11 Default Overwrite Issue:**
   - S11 ReferenceState.setDefaults() hardcodes area values
   - These might be overwriting imported values after sync

### Why This Matters

**Excel Architecture:**

- REFERENCE sheet formulas reference REPORT sheet (Target) values
- Reference model uses **SAME geometry** as Target model
- Only thermal performance values (RSI/U-values) differ by code standard

**App Architecture (More Flexible):**

- App ALLOWS Reference to have independent geometry values
- This gives users flexibility Excel doesn't have
- **But** import should respect Excel's formula-based values

### Attempted Fixes

**Option 1: Trust Calculated Values (Oct 10, 2025)** - **REVERTED**

- Removed formula detection logic
- Directly read `cell.v` (Excel's calculated value)
- **Rationale:** Excel evaluates `=REPORT!D87` and stores result in `cell.v`
- **Status:** Reverted at user request for deeper investigation
- **Commit:** `58c595a` (reverted to `80cc47a`)

### Solution Strategies

**Option 1: Trust Calculated Cell Values**

- Remove formula detection entirely
- Read whatever value Excel calculated in REFERENCE sheet
- **Pros:** Simple, works with any Excel file format
- **Cons:** If Excel formula broken, imports wrong value
- **Status:** Tried, reverted for investigation

**Option 2: Enhanced Formula Detection**

- Keep formula detection but handle `cell.f` missing
- Better logging for debugging
- **Pros:** Handles both formula and value cases
- **Cons:** More complex, may still fail if SheetJS doesn't populate `cell.f`

**Option 3: Force REPORT Values for Area Fields**

- For specific area fields (d_85-d_96), ALWAYS read from REPORT sheet
- Ignore REFERENCE sheet values for geometry
- **Pros:** Ensures geometric consistency with Excel
- **Cons:** Removes app's flexibility for independent Reference geometry

**Option 4: Fix S12 Fallback Logic** (Most Likely Root Cause)

- Change from falsy check (`||`) to null/undefined check
- `const ref_d87 = getGlobalNumericValue("ref_d_87"); d87 = ref_d87 !== null && ref_d87 !== undefined ? parseFloat(ref_d87) : parseFloat(getGlobalNumericValue("d_87")) || 0;`
- **Pros:** Preserves legitimate zero values, allows fallback only when truly missing
- **Cons:** Need to apply pattern to ALL area fields in S12

### Investigation Plan

**Tonight's Session Goals:**

1. **Verify import storage:** Add logging to confirm `ref_d_87`, `ref_d_95`, `ref_d_96` stored in StateManager
2. **Verify sync:** Add logging to confirm S11.ReferenceState.syncFromGlobalState() reads values
3. **Compare `ref_d_85` behavior:** Why does it work when others don't?
4. **Test fallback logic:** Check if S12's `||` fallback is treating `0` as missing value
5. **Choose solution:** Based on findings, implement Option 1, 3, or 4

### Expected Excel Values

From test CSV (TEUIv4011-DualState-Sherwood_CC.csv):

- Target `d_87`: `0` (Floor Exposed)
- Target `d_95`: `11167` (Floor Slab)
- Target `d_96`: `398` (Interior Floors)

**If Excel REFERENCE formulas work correctly:**

- Reference `d_87`: Should equal Target `0` (via `=REPORT!D87`)
- Reference `d_95`: Should equal Target `11167` (via `=REPORT!D95`)
- Reference `d_96`: Should equal Target `398` (via `=REPORT!D96`)
- Reference `d_106`: Should equal Target `d_106` = `0 + 11167 + 398 = 11565`

**Current incorrect behavior:**

- Reference shows defaults: `d_87=0.00`, `d_95=1100.42`, `d_96=29.70`
- Reference `d_106` = `0 + 1100.42 + 29.70 = 1130.12` ❌

### Priority

**CRITICAL** - Reference model calculations depend on correct area values. This blocks:

- Reference model TEUI calculations
- Reference vs Target comparison accuracy
- CSV export/import roundtrip (exports wrong values, re-imports wrong values)
- Public launch readiness

### Related Issues

- S12 Volume Metrics calculation (depends on correct d_106)
- S05 Embedded Carbon calculation (depends on correct d_40, which depends on d_106)
- CSV export format (may be exporting incorrect Reference defaults)

### ✅ SOLUTION IMPLEMENTED (Oct 10, 2025)

**Root Cause Found:** Import timing issue with S10→S11 area sync

**The Problem:**

1. S11.ReferenceState.syncFromGlobalState() synced ref_d_85, ref_d_87, ref_d_95, ref_d_96 from StateManager ✅
2. Then **immediately** called `syncAreasFromS10()`
3. `syncAreasFromS10()` called `refreshUI()` and `calculateAll()`
4. These ran **DURING import quarantine** before FileHandler.calculateAll()
5. Calculations used default values, overwrote imported values ❌

**The Fix (Commit `76ec774`):**

**S11 Changes:**

- Removed `syncAreasFromS10()` calls from both `TargetState.syncFromGlobalState()` and `ReferenceState.syncFromGlobalState()`
- Added `syncAreasFromS10` to public API export
- Added comment explaining FileHandler will call it manually

**FileHandler Changes:**

- Added Phase 2.5: Manual `syncAreasFromS10()` call AFTER all Pattern A sections synced
- Ensures S10 values imported before syncing to S11

**Why This Works:**

**Import Flow (Fixed):**

1. Quarantine starts → Listeners muted
2. S10 imports → d_73-d_78 stored in StateManager
3. S11 imports → d_85-d_96 stored in StateManager
4. FileHandler.syncPatternASections() calls:
   - S10.TargetState.syncFromGlobalState() ✅
   - S10.ReferenceState.syncFromGlobalState() ✅
   - S11.TargetState.syncFromGlobalState() ✅ (d_85, d_87, d_95, d_96 synced, no premature calculations)
   - S11.ReferenceState.syncFromGlobalState() ✅ (ref_d_85, ref_d_87, ref_d_95, ref_d_96 synced, no premature calculations)
5. FileHandler calls `syncAreasFromS10()` ONCE ✅ (d_88-d_93 synced from S10)
6. Quarantine ends → Listeners unmuted
7. Clean `calculateAll()` with all imported values ✅

**Normal Usage (Still Works):**

- User changes S10 window area → Listener fires → `debouncedSyncAreasFromS10()` → S11 updates ✅
- User switches modes → `ModeManager.switchMode()` → `syncAreasFromS10()` → S11 updates ✅

**Testing Plan:**

1. ✅ ~~Add diagnostic logging~~ - Root cause identified
2. ✅ ~~Compare ref_d_85 vs ref_d_87/d_95/d_96~~ - Timing issue found
3. ✅ ~~Identify exact failure point~~ - syncAreasFromS10() premature call
4. ✅ ~~Choose and implement fix~~ - Defer S10 sync to FileHandler
5. ⏳ Test with actual Excel file import
6. ⏳ Verify CSV export contains correct values
7. ⏳ Test CSV re-import roundtrip

**Status:** Fix committed, ready for user testing

---

Theory: Why Import Breaks State Isolation during partial refactors... (But Our MAPPER.md Fixes Won't)
Let me analyze the mechanism that's causing state mixing after import but not before.
The Core Mechanism
Before Import (State Isolation Works ✅):

1. App loads → Each section calls TargetState.initialize() / ReferenceState.initialize()
2. States load from localStorage OR call setDefaults()
3. Isolated states are populated with defaults
4. User changes field → ModeManager.setValue() → Updates isolated state + publishes to global
5. Listener fires → Section reads from isolated state → Calculates → Publishes to global
6. State isolation maintained: Target changes don't affect Reference, vice versa
   After Import (State Mixing Occurs ❌):
7. Import quarantine starts → Listeners muted
8. Excel values written to global StateManager (h_15="11167", ref_h_15="11167")
9. FileHandler calls syncFromGlobalState() for Pattern A sections (S02, S03, S04, S05, S06)
10. ❌ S07-S15 DON'T have syncFromGlobalState() → Isolated states still have DEFAULTS
11. Listeners unmute → calculateAll() fires for all sections
12. 🔥 STATE MIXING: Sections read from MIXED sources:
    - Pattern A (synced): Read imported values from isolated state ✅
    - Non-synced sections: Read DEFAULTS from isolated state ❌
    - When they calculate, they use robot fingers to read upstream values
    - Robot fingers read from GLOBAL StateManager (has imports)
    - They calculate with imports + defaults MIX
    - Publish results that contaminate downstream
      Why Changes to i_59 (S08 RH%) Cause State Mixing
      The Cascade Failure:
      User changes i_59 in S08 after import
      S08 has isolated state with DEFAULTS (not synced from import)
      S08 calculates using:
      Its own field: i_59 (user just changed) ✅
      Upstream fields: Read via robot fingers from global StateManager
      Global has IMPORTS for some sections, DEFAULTS for others
      S08 publishes mixed results to global StateManager
      S13 listener fires (complex section, reads many upstream values)
      S13 reads from global StateManager (now contaminated with mixed values)
      S13's dual-engine calculates with contaminated data
      Reference calculations use Target-contaminated values (or vice versa)
      State mixing visible in UI
      Why This DIDN'T Happen Before Import
      Before import, there was NO MIXING because:
      All sections started with consistent defaults
      LocalStorage had clean state from previous session
      No "half-imported, half-default" scenario existed
      When user changed a field, the cascade used all-defaults or all-user-values
      Clean state throughout
      After import, MIXING happens because:
      Global StateManager has imports (some sections)
      Isolated states have defaults (sections without syncFromGlobalState)
      Sections calculate using robot fingers that read global (imports)
      But their isolated state has defaults
      Two sources of truth diverge
      Why Our Fix WILL Maintain State Isolation
      The fix (adding syncFromGlobalState to ALL sections) ensures:
      Single Source of Truth Restored:
      Import → Global StateManager → syncFromGlobalState() → Isolated State
      All sections now have IMPORTS in isolated state (not defaults)
      Consistent Calculation Context:
      Target calculations:

- Read from TargetState (has Target imports)
- Read upstream via robot fingers → Global StateManager (has Target imports)
- Publish to Global StateManager (Target prefix or no prefix)

Reference calculations:

- Read from ReferenceState (has Reference imports)
- Read upstream via robot fingers → Global StateManager (has ref\_ imports)
- Publish to Global StateManager (ref* prefix)
  No Mixed Data:
  Every section's isolated state matches global StateManager
  Robot fingers read clean imported values
  Calculations use all-imports (not half-imports, half-defaults)
  The Mechanism of State Mixing (Technical)
  Why i_59 change cascades into mixing: S08 calculates → Uses getValue() which checks:
  getValue: function(fieldId) {
  if (ReferenceMode) {
  return StateManager.getValue(`ref*${fieldId}`); // Robot finger
  } else {
  return StateManager.getValue(fieldId); // Robot finger
  }
  }
  If S08's isolated state has defaults but global StateManager has imports:
  S08 reads its own i_59 from isolated state (default or user change)
  S08 reads upstream d_20 from global (import)
  Mixed calculation: i_59 (default) + d_20 (import) = contaminated result
  Publishes contaminated result to global
  S13 reads contaminated value
  S13's Reference calculation gets Target-contaminated data (or vice versa)
  Assurance: Our Pattern Won't Make It Worse
  Why I'm confident:
  Pattern Already Proven in S02, S03, S04, S05, S06:
  They have clean state isolation POST-import
  Mode switching works perfectly
  No contamination visible
  The Pattern is Additive (Not Destructive):
  We're ONLY adding syncFromGlobalState() methods
  We're ONLY exposing existing TargetState/ReferenceState objects
  We're NOT changing calculation logic
  We're NOT changing ModeManager routing
  We're NOT touching listener registration
  Root Cause is ABSENCE, Not Presence:
  State mixing comes from MISSING sync
  Adding sync FIXES the gap
  It doesn't introduce new mechanisms
  S13 Complexity is Orthogonal:
  S13's complexity is in its calculations (mechanical systems)
  That complexity existed before import
  Our fix only ensures S13 reads CLEAN imported data
  We don't touch S13's calculation logic
  What Could Go Wrong (Low Risk)
  Potential issues (all fixable):
  Wrong fields in sync list:
  Syncing a calculated field instead of an input field
  Fix: Review field types, only sync editable/input fields
  Missing field in sync list:
  Input field not synced, still defaults
  Fix: Add missing field to syncFromGlobalState() array
  Reference field that should be calculated:
  Like S05 i_41 (we already found and fixed this pattern)
  Fix: Remove from ReferenceState sync, add to calculateReferenceModel()
  None of these make state isolation WORSE. They just mean some fields don't import correctly (fixable).
  Conclusion: Safe to Proceed
  Your state isolation is safe because:
  We're following the exact pattern that works in S02-S06
  We're not modifying dual-engine logic
  We're not changing ModeManager routing
  We're only adding sync methods (fills gap, doesn't break existing)
  S13's complexity is in calculations, not state management (we don't touch that)
  The uphill battle is WORTH IT because:
  Each section fixed makes the next easier (pattern is clear)
  State mixing gets BETTER with each section (not worse)
  By the time we reach S13, upstream sections (S03, S05, S08, S11) will be clean
  S13 will read clean data from upstream, calculate cleanly, publish cleanly
  You can proceed confidently. The pattern is sound, proven in 5 sections already, and the mechanism is well-understood. Rest well! Tomorrow we'll systematically complete S07-S15 with the confidence that we're FIXING state mixing, not creating it. 🛡️
