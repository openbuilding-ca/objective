# 3-Tier Reset System - Implementation Plan

**Branch**: `reset` (original), `reset2` (Nov 6 fixes)
**Date**: November 4-6, 2025
**Status**: Implementation + Debugging + Missing Fixes Applied

---

## RESET2 BRANCH - MISSING FIXES APPLIED (Nov 6, 2025)

**Current HEAD**: `107c700` - Fix: Add syncFromGlobalState() before refreshUI() in reset flow

**Commits on reset2**:
1. `9e394cd` - Fix: Add Section 14 to all Pattern A refresh lists
2. `107c700` - Fix: Add syncFromGlobalState() before refreshUI() in reset flow

**What Was Missing from Original PR**:
- ❌ Section 14 missing from all Pattern A refresh lists (4 locations)
- ❌ syncFromGlobalState() not called before refreshUI() (documented as "Option B" below but never implemented!)
- ✅ Listener muting during restore (already present from cb28e92)

**Testing Note**: User temporarily reverting to cb28e92 to verify original reset functionality before applying new fixes.

---

## ISSUE: Incomplete Restore After Undo Changes (Nov 4, 2025)

### Problem Description

After importing a file and then using "Undo Changes" to revert to imported state:

**Expected**: TEUI Target total should be 511.4 (the imported value)
**Actual**: TEUI Target total shows 154.8 (incorrect)

This suggests that either:
1. Not all imported values are being saved to `lastImportedState` during import
2. Not all imported values are being restored during revert
3. `calculateAll()` is not running with the complete set of restored values

### Symptoms

- Imported values appear correctly in DOM after import
- After "Undo Changes", some calculations are incorrect
- S01 TEUI/TEDI totals do not match imported values
- Pattern A sections may not be fully synced

### Questions to Answer

1. **What fields does ExcelMapper map?** - Read ExcelMapper.js to see all mapped fields
2. **Are all mapped fields saved to lastImportedState?** - Check if FileHandler → StateManager saves all fields
3. **Are all mapped fields in localStorage?** - Check TEUI_Last_Imported_State after import
4. **Does revert restore all fields?** - Check if revertToLastImportedState() processes all saved fields
5. **Does calculateAll() run completely?** - Check if all sections recalculate after revert

### Diagnostic Script

**Location**: `docs/development/RESET-DIAGNOSTIC-SCRIPT.js`

**How to Use**:

1. Open browser console
2. Copy/paste the entire RESET-DIAGNOSTIC-SCRIPT.js file into console
3. Run `resetDiagnostics.runAllDiagnostics()` at key moments:
   - **After import** (before modifications)
   - **After modifications**
   - **After "Undo Changes"**

**What to Look For**:

| Diagnostic | Purpose | Expected Result | If Fails |
|------------|---------|----------------|----------|
| #1 Check lastImportedState | Verify imported state was saved | ~126 fields (matching ExcelMapper) | Missing fields → FileHandler not saving all imports |
| #2 Check StateManager | Verify current state | Field counts by state type | Incorrect state labels → setValue() not using "imported" |
| #3 Check TEUI Fields | Verify calculation inputs | h_121-h_126 values match import | Missing values → calculateAll() not running |
| #4 Compare States | Find mismatches | All imported fields match current | Mismatches → revert not restoring all fields |
| #5 Trace Revert | Watch revert execution | All fields restored, no errors | Errors → identify failing fields |

**Specific Things to Check**:

1. **Field Count**: ExcelMapper has ~126 mapped fields. Does lastImportedState have ~126 entries?
2. **Key Fields**: Are h_15 (area), h_121-h_126 (TEUI components) in lastImportedState?
3. **State Labels**: After import, are fields marked as "imported" or "user-modified"?
4. **Restore Count**: Does revert restore all ~126 fields or only some?
5. **Pattern A Sections**: Do S02-S15 refresh after revert?

### Investigation Pathway

```
[STEP 1] Import file
         ↓
         ├─→ ExcelMapper.mapExcelToReportModel() returns ~126 fields
         ├─→ FileHandler.updateStateFromImportData() processes each field
         ├─→ StateManager.setValue(fieldId, value, "imported") called
         │   └─→ ✅ CHECK: Is field added to lastImportedState? (line 396)
         ├─→ StateManager.saveState() called (debounced)
         │   └─→ ✅ CHECK: Is TEUI_Last_Imported_State written to localStorage?
         └─→ Calculator.calculateAll() + Pattern A refresh

[STEP 2] Make modifications
         ↓
         └─→ Modified fields get state "user-modified"

[STEP 3] Undo Changes button
         ↓
         ├─→ StateManager.resetTier1_UndoChanges()
         ├─→ StateManager.revertToLastImportedState()
         │   ├─→ ✅ CHECK: Does lastImportedState have all fields?
         │   ├─→ Loop through lastImportedState entries
         │   │   └─→ setValue(fieldId, value, "system_reverted_to_import")
         │   ├─→ Calculator.calculateAll()
         │   │   └─→ ✅ CHECK: Do h_121-h_126 recalculate?
         │   └─→ Pattern A section refresh
         │       └─→ ✅ CHECK: Do S01 values update?
         └─→ Expected: TEUI = 511.4
             Actual: TEUI = 154.8 ❌
```

### Suspected Issues

1. **Not all fields saved to lastImportedState**
   - ExcelMapper maps ~126 fields
   - FileHandler may skip some (Pattern A fields?)
   - Check if S02-S15 fields are saved

2. **Pattern A fields not in StateManager**
   - Pattern A sections (S02-S15) use isolated state
   - May not be in main StateManager.fields map
   - syncPatternASections() may not save to lastImportedState

3. **calculateAll() not recalculating everything**
   - May need to force recalculation of all sections
   - Pattern A sections may need explicit recalc

4. **Pattern A refresh not updating DOM**
   - refreshUI() and updateCalculatedDisplayValues() may not be sufficient
   - May need to call section-specific calculate methods

---

## DIAGNOSTIC RESULTS (Nov 4, 2025)

### ⚠️ CRITICAL FINDING: Storage Not Working!

**User Test Results** (Nov 5, 2025):
- Modified 11 fields after import: d_31, h_12, h_15, h_19, d_39, d_51, d_52, d_64, d_97, d_113, d_118
- Clicked "Undo Changes" → **NOT ONE field restored to imported value!**
- This confirms the problem is STORAGE/RESTORE, not calculations

**Root Cause Hypothesis**: Pattern A sections use isolated state (TargetState/ReferenceState).
These fields may NOT be going through `StateManager.setValue()` with state="imported" during import,
so they never get saved to `lastImportedState`.

### Investigation Tools

**SIMPLE TEST** (Run in browser console):

```javascript
// STEP 1: After import (before any modifications)
const importedState = JSON.parse(localStorage.getItem("TEUI_Last_Imported_State"));
console.log("Fields in lastImportedState:", Object.keys(importedState).length);
console.log("Test fields:", ["d_31", "h_12", "h_15", "d_39"].map(f => `${f}=${importedState[f]}`));

// STEP 2: After you modify fields d_31, h_12, h_15, d_39
console.log("Current StateManager values:", ["d_31", "h_12", "h_15", "d_39"].map(f => `${f}=${TEUI.StateManager.getValue(f)}`));

// STEP 3: Check if lastImportedState still has original values
const stillThere = JSON.parse(localStorage.getItem("TEUI_Last_Imported_State"));
console.log("Still in memory:", ["d_31", "h_12", "h_15", "d_39"].map(f => `${f}=${stillThere[f]}`));

// STEP 4: After clicking "Undo Changes"
console.log("After restore:", ["d_31", "h_12", "h_15", "d_39"].map(f => `${f}=${TEUI.StateManager.getValue(f)}`));
```

**What this tells us:**
- Step 1: Are imported values being stored to `lastImportedState`?
- Step 3: Does `lastImportedState` survive user modifications?
- Step 4: Are values actually restored, or do they stay at user-modified values?

**Advanced Diagnostic**: `STORAGE-TRACE.js` - Intercepts setValue calls
- Run before import to see which fields are saved with "imported" state
- Run `checkStoredFields()` after import to verify storage

---

## 🔬 4-STEP DIAGNOSTIC TEST RESULTS (Nov 5, 2025)

### Test Configuration
- **Test fields**: d_31, h_12, h_15, d_39
- **Imported values**: d_31=0, h_12=2023, h_15=11167, d_39="Pt.3 Steel"
- **Modified values**: d_31=5, h_12=2041, h_15=12167, d_39="Modelled Value"

### Test Results

**STEP 1 - Storage After Import: ✅ SUCCESS**
```
Fields in lastImportedState: 249
Test fields: d_31=0, h_12=2023, h_15=11167, d_39=Pt.3 Steel
```
✅ Import mechanism works correctly
✅ All 249 imported fields captured in localStorage

**STEP 2 - StateManager After Modifications: ✅ SUCCESS**
```
Current StateManager values: d_31=5, h_12=2041, h_15=12167, d_39=Modelled Value
```
✅ User modifications captured correctly in StateManager

**STEP 3 - Storage Preservation: ✅ SUCCESS**
```
Still in memory: d_31=0, h_12=2023, h_15=11167, d_39=Pt.3 Steel
```
✅ lastImportedState NOT overwritten by user modifications
✅ Original imported values preserved intact

**STEP 4 - After "Undo Changes": ❌ CRITICAL FAILURE**
```
StateManager values: d_31=0, h_12=2023, h_15=11167, d_39=Pt.3 Steel  ✅ (StateManager has correct values)
DOM displays: d_31=5, h_12=2041, h_15=12167, d_39=Modelled Value     ❌ (UI shows old modified values)
Calculations: h_10=519.0 (should be 511.4), k_10=509 (based on d_31=5, not 0)  ❌ (Calculations use wrong values)
```

### 🚨 ROOT CAUSE IDENTIFIED

**The `revertToLastImportedState()` function is NOT being called!**

Evidence from console logs:
- ❌ Missing: `"[StateManager] 🔄 Refreshing Pattern A section UIs after revert..."`
- ❌ Missing: `"[StateManager] ✅ sect02 UI refreshed after revert"`
- ❌ Missing: `"[StateManager] Reverted to last imported state. 126 fields updated."`
- ❌ Missing: `"[Reset Tier 1] Reverted to imported state"`

What we DO see after clicking "Undo Changes":
```
Section11.js:1238 [S11 Area Sync] Starting sync in target mode
... (S11 calculations)
Section01.js:755 🔍 [S01DB] updateTEUIDisplay START
... (S01 calculations using WRONG values)
StateManager.js:598 [StateManager] Saved 249 imported fields to localStorage
```

### Analysis

**Storage Works Perfectly** (Steps 1-3):
- ✅ Import captures 249 fields correctly
- ✅ Values survive user modifications
- ✅ localStorage maintains original imported state

**Restore Logic NEVER RUNS** (Step 4):
- ✅ StateManager HAS correct restored values (console test shows this)
- ❌ But `revertToLastImportedState()` function never executed
- ❌ UI elements (DOM) never updated to show restored values
- ❌ Pattern A sections (S02, S04, S05) never had `refreshUI()` called
- ❌ Calculations ran with stale DOM values instead of restored StateManager values

**The Problem**:
The "Undo Changes" button click is not properly triggering the `resetTier1_UndoChanges()` → `revertToLastImportedState()` call chain.

### Field Pattern Analysis

Test fields by pattern:
- `d_31` → Section04 (Pattern A - isolated state, needs refreshUI)
- `h_12` → Section02 (Pattern A - isolated state, needs refreshUI)
- `h_15` → Section01 (Pattern B - direct StateManager)
- `d_39` → Section05 (Pattern A - isolated state, needs refreshUI)

**3 out of 4 fields are Pattern A** - they REQUIRE `ModeManager.refreshUI()` to update DOM even if StateManager has correct values.

### 🐛 NEW ISSUE FOUND: Section 13 d_113 Not Reverting (Nov 6, 2025)

**Problem:** After import → edit → "Undo Changes", most fields revert correctly EXCEPT Section 13's `d_113` (Primary Heating System dropdown).

**Test Case:**
- Imported file has `d_113 = "Gas"`
- User changes to `d_113 = "Heatpump"`
- Click "Undo Changes"
- **Expected:** Dropdown shows "Gas"
- **Actual:** Dropdown still shows "Heatpump"

**Root Cause:** Section 13 ReferenceState hardcodes default value during initialization

From [Section13.js:110](../src/sections/Section13.js#L110):
```javascript
ReferenceState.initialize = function () {
  this.state = {};
  // Step 2: Apply Reference-specific overrides
  this.state.d_113 = "Heatpump";  // ⚠️ HARDCODED!
  // ...
}
```

**The Problem Chain:**
1. `revertToLastImportedState()` restores `d_113 = "Gas"` to StateManager ✅
2. Unmutes listeners and calls `calculateAll()` ✅
3. `calculateAll()` triggers Section 13 calculations
4. Section 13's `calculateReferenceModel()` calls `ReferenceState.initialize()`
5. `ReferenceState.initialize()` hardcodes `d_113 = "Heatpump"` ❌
6. This overwrites the just-restored "Gas" value
7. UI refresh shows "Heatpump" instead of "Gas"

**Evidence from console logs:**
```
[StateManager] 🔒 Muting listeners during restore...
[StateManager] Skipped listener for d_113 (quarantine active)
[StateManager] 🔓 Unmuting listeners after restore complete
[FieldManager] Routed d_113=Heatpump through sect13 ModeManager  ⚠️ WRONG!
[StateManager] ✅ sect13 UI refreshed after revert
```

**The Solution Options:**

**Option A:** Don't hardcode defaults in `ReferenceState.initialize()`
- Read from StateManager instead: `this.state.d_113 = StateManager.getValue("ref_d_113") || "Heatpump"`
- Benefits: Respects imported/restored values
- Risk: May affect other initialization scenarios

**Option B:** Call `syncFromGlobalState()` BEFORE `refreshUI()` during revert
- In `revertToLastImportedState()`, before the Pattern A refresh loop, add:
```javascript
patternASections.forEach((sectionId) => {
  const section = window.TEUI?.SectionModules?.[sectionId];
  // Sync isolated state FROM restored StateManager values
  if (section?.TargetState?.syncFromGlobalState) {
    section.TargetState.syncFromGlobalState();
  }
  if (section?.ReferenceState?.syncFromGlobalState) {
    section.ReferenceState.syncFromGlobalState();
  }
  // NOW refresh UI with correct isolated state
  if (section?.ModeManager?.refreshUI) {
    section.ModeManager.refreshUI();
  }
});
```
- Benefits: Ensures Pattern A isolated state syncs before UI refresh
- Risk: None - this is the proper sequence

**Recommended:** Option B - Add `syncFromGlobalState()` calls before `refreshUI()` in the revert process.

**Status:** Identified, not yet implemented. Requires testing to ensure it doesn't break other sections.

---

### 🔧 THE FIX (Nov 5, 2025)

**Root Cause:** Race condition between restore and Section11 listeners

**The Problem Chain:**
1. `revertToLastImportedState()` calls `setValue()` for each restored field
2. `setValue()` triggers `notifyListeners()`
3. Section11 has listeners on d_73-d_78 (Section10 area fields)
4. These listeners call `debouncedSyncAreasFromS10()`
5. Area Sync reads from **stale Pattern A section isolated state**
6. Area Sync calls `calculateAll()` with stale values
7. Calculations **overwrite** the just-restored StateManager values!

**Evidence from logs:**
```
StateManager.js:1752 [StateManager] Reverted to last imported state. 126 fields updated.
StateManager.js:1798 [Reset Tier 1] Reverted to imported state
VM3364:7 🔍 TRACE: resetTier1_UndoChanges() FINISHED
Section11.js:1238 [S11 Area Sync] Starting sync in target mode  ⚠️ PROBLEM!
Section11.js:1300 [S11 Area Sync] Triggering recalculation...
Section11.js:2085 [S11] calculateAll TRIGGERED
... (calculations using stale values)
Section01.js:924 🔍 [S01DB] UPDATING h_10: 519.0 (WRONG - should be 511.4)
```

**The Solution:** Mute StateManager listeners during restore

Modified `revertToLastImportedState()` in [StateManager.js:1658-1703](../src/core/StateManager.js#L1658-L1703):

```javascript
// Mute listeners during restore
console.log("[StateManager] 🔒 Muting listeners during restore...");
muteListeners();

// Restore all values (setValue() calls won't trigger listeners)
Object.entries(lastImportedState).forEach(([fieldId, importedValue]) => {
  setValue(fieldId, importedValue, "system_reverted_to_import");
  // ... update UI display
});

// Unmute BEFORE calculateAll so listeners work normally during calculations
console.log("[StateManager] 🔓 Unmuting listeners after restore complete");
unmuteListeners();

// NOW trigger calculations with correct restored values
window.TEUI.Calculator.calculateAll();
```

**Why this works:**
- Prevents premature listener-triggered calculations during multi-field restore
- Ensures ALL values restored to StateManager before ANY calculations run
- Pattern A sections refresh from correct StateManager values
- Calculations see consistent restored state, not mix of old/new

**Testing:**
1. Import file → Modify fields → Click "Undo Changes"
2. Expected: DOM shows imported values, calculations use imported values
3. Console should show: `🔒 Muting listeners` → `🔓 Unmuting listeners` → calculations

---

### 🎯 PREVIOUS (INCORRECT) ROOT CAUSE

**Problem**: h_121, h_122, h_123, h_125 are ALL `null` across all 3 stages

```
Stage 1 (After Import) | Stage 2 (After Mods) | Stage 3 (After Undo)
h_121: null           | h_121: null          | h_121: null
h_122: null           | h_122: null          | h_122: null
h_123: null           | h_123: null          | h_123: null
h_124: 36856.77 ✅    | h_124: 36856.77 ✅   | h_124: 36856.77 ✅
h_125: null           | h_125: null          | h_125: null
h_126: 83.50 ✅       | h_126: 83.50 ✅      | h_126: 83.50 ✅
```

**Impact**: TEUI calculation is wrong because 4 out of 6 components are missing!

- Expected TEUI (manual): 3.31 ekWh/m²/yr (only h_124 + h_126)
- Actual f_32: 5,678,628.43 ekWh/m²/yr (absurdly high)

### Key Findings

1. **✅ Import Works**: 249 fields saved to lastImportedState (more than ExcelMapper's 126!)
   - This includes both Target and Reference fields (ref_* prefix)
   - All imported fields match current state

2. **✅ Revert Works**: All 249 fields restored correctly
   - Stage 2 after mods: 7 mismatches (expected - these are user modifications)
   - Stage 3 after undo: All 249 match again ✅

3. **❌ S15 Calculations Not Running**: h_121, h_122, h_123, h_125 are `null`
   - These should be populated by Section15.js TEUI component calculations
   - h_124 and h_126 work (so partial calculation is happening)
   - calculateAll() is called but S15 isn't calculating all fields

### This is NOT a Reset Problem!

The "Undo Changes" feature is working perfectly:
- ✅ lastImportedState is saved
- ✅ All fields are restored
- ✅ calculateAll() is called
- ✅ Pattern A sections are refreshed

**The real problem**: Section 15 (TEUI components) is not calculating h_121, h_122, h_123, h_125.

This is a **separate S15 calculation bug** that exists BEFORE the reset feature was even implemented!

### Next Steps

1. Investigate Section15.js to see why h_121, h_122, h_123, h_125 are not calculated
2. Check if these fields are registered with StateManager
3. Check if S15 calculate method is being called by Calculator.calculateAll()
4. This should be a separate issue/branch, not part of reset implementation

---

## Overview

The current Reset button (`resetAllData()`) immediately clears all data and resets to defaults. This implementation plan outlines a 3-tier progressive reset system that provides better UX and data safety.

---

## Current Implementation Analysis

### Current Reset Behavior (index.html:828-841)

```javascript
function resetAllData() {
  if (TEUI && TEUI.StateManager) {
    // Clear all state including localStorage
    TEUI.StateManager.clear();
    console.log("TEUI StateManager: All data cleared including localStorage");

    // Reload the page to show clean state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }
}
```

**What it does**:
- Calls `StateManager.clear()` which clears all in-memory state AND localStorage
- Reloads the page
- **Result**: All user modifications and imported data are lost

**Sections covered**:
- Main state (TEUI_Calculator_State)
- All dual-state sections (S02-S15 TARGET/REFERENCE states)
- All localStorage entries

### StateManager Field Tracking

StateManager already tracks field sources via `VALUE_STATES` (StateManager.js:158-164):

```javascript
const VALUE_STATES = {
  DEFAULT: "default",           // Original default value
  IMPORTED: "imported",         // Value imported from saved data
  USER_MODIFIED: "user-modified", // Value changed by user
  OVER_RIDDEN: "over-ridden",   // Value overridden by ReferenceValues overlay
  CALCULATED: "calculated",     // Value calculated by the system
  DERIVED: "derived",           // Value derived from another field
};
```

**Key tracking variables**:
- `lastImportedState = {}` (line 176) - Stores the last imported state
- `fields.forEach()` saves only `USER_MODIFIED` and `IMPORTED` states (line 576-580)

**Existing method**:
- `revertToLastImportedState()` (line 1583) - Already exists but not wired to UI!

---

## Proposed 3-Tier Reset System

### User Flow

```
┌─────────────────────────────────────────────────────────────┐
│  STATE 0: App Initialized (Defaults Only)                   │
│  - All fields at default values                             │
│  - No localStorage state                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
          User makes field modifications
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STATE 1: User Modified (No Import)                         │
│  - Some fields modified by user                             │
│  - localStorage has user-modified state                     │
│                                                              │
│  RESET TIER 1: "Undo Changes" → Return to STATE 0           │
│  - Clear localStorage                                       │
│  - Reload page (shows defaults)                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
             User imports a file
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STATE 2: Imported Data Loaded                              │
│  - Fields populated from import                             │
│  - lastImportedState populated                              │
│  - localStorage has imported state                          │
│                                                              │
│  RESET TIER 1: "Undo Changes" → Return to STATE 2           │
│  - Revert to lastImportedState                              │
│  - Keep imported data intact                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
       User makes changes to imported values
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STATE 3: Imported + User Modified                          │
│  - Imported data + user changes                             │
│  - lastImportedState still available                        │
│  - localStorage has both imported and user-modified         │
│                                                              │
│  RESET TIER 1: "Undo Changes" → Return to STATE 2           │
│  - Revert to lastImportedState                              │
│  - Discard user modifications after import                  │
│                                                              │
│  RESET TIER 2: "Clear Import" → Return to STATE 0           │
│  - Clear lastImportedState                                  │
│  - Clear localStorage                                       │
│  - Reload page (shows defaults)                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
         User presses Reset again
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  RESET TIER 3: "Factory Reset"                              │
│  - Clear ALL localStorage (including dual-state sections)   │
│  - Clear all memory state                                   │
│  - Reload page                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: StateManager Enhancements

**File**: `src/core/StateManager.js`

#### 1.1 Add Reset State Tracking

Add tracking for what type of reset is available:

```javascript
let resetTier = 0; // 0 = fresh, 1 = has modifications, 2 = has import

function getResetTier() {
  // Check if there's imported data
  if (Object.keys(lastImportedState).length > 0) {
    return 2; // Has imported data
  }

  // Check if there are user modifications
  let hasUserModifications = false;
  fields.forEach((field) => {
    if (field.state === VALUE_STATES.USER_MODIFIED) {
      hasUserModifications = true;
    }
  });

  if (hasUserModifications) {
    return 1; // Has user modifications only
  }

  return 0; // Fresh/defaults
}
```

#### 1.2 Implement Tier-Specific Reset Methods

```javascript
/**
 * TIER 1 RESET: Undo user changes
 * - If imported data exists, revert to lastImportedState
 * - If no import, clear to defaults
 */
function resetTier1_UndoChanges() {
  const tier = getResetTier();

  if (tier === 2 || tier === 3) {
    // Has imported data - revert to it
    revertToLastImportedState(); // Already exists!
    console.log("[Reset Tier 1] Reverted to imported state");
  } else {
    // No imported data - clear to defaults
    resetTier2_ClearImport();
  }
}

/**
 * TIER 2 RESET: Clear imported data, return to defaults
 * - Clear lastImportedState
 * - Clear localStorage
 * - Reload page
 */
function resetTier2_ClearImport() {
  lastImportedState = {};
  clear(); // Existing method
  console.log("[Reset Tier 2] Cleared import data and localStorage");

  setTimeout(() => {
    window.location.reload();
  }, 100);
}

/**
 * TIER 3 RESET: Factory reset (same as current behavior)
 * - Clear everything
 * - Reload page
 */
function resetTier3_FactoryReset() {
  clear(); // Existing method handles everything
  console.log("[Reset Tier 3] Factory reset - all data cleared");

  setTimeout(() => {
    window.location.reload();
  }, 100);
}
```

#### 1.3 Update Public API

Add to the public API at the bottom of StateManager.js:

```javascript
return {
  // ... existing methods ...
  getResetTier,
  resetTier1_UndoChanges,
  resetTier2_ClearImport,
  resetTier3_FactoryReset,
};
```

---

### Phase 2: UI Updates

**File**: `index.html`

#### 2.1 Update Reset Button Behavior

Replace the current `resetAllData()` function (lines 828-841):

```javascript
/**
 * Progressive reset handler
 * Tier 1: Undo changes (revert to imported state or defaults)
 * Tier 2: Clear import (back to fresh defaults)
 * Tier 3: Factory reset (same as Tier 2, included for consistency)
 */
function handleResetButton() {
  if (!TEUI || !TEUI.StateManager) {
    console.error("StateManager not available");
    return;
  }

  const tier = TEUI.StateManager.getResetTier();

  switch(tier) {
    case 0:
      // Already at defaults
      alert("Already at default values. No reset needed.");
      break;

    case 1:
      // Has user modifications, no import
      if (confirm("Undo all changes and return to default values?")) {
        TEUI.StateManager.resetTier1_UndoChanges();
      }
      break;

    case 2:
      // Has imported data
      // First press: Offer to undo changes back to imported state
      if (confirm("Undo your changes and return to imported values?")) {
        TEUI.StateManager.resetTier1_UndoChanges();
      }
      break;

    default:
      console.error("Unknown reset tier:", tier);
  }
}
```

#### 2.2 Add Advanced Reset Menu (Optional Enhancement)

Consider adding a dropdown menu to the Reset button similar to the Reference button:

```html
<div class="btn-group me-2">
  <button
    id="reset-btn"
    type="button"
    class="btn btn-sm btn-success"
    onclick="handleResetButton()"
    title="Reset data"
  >
    <i class="bi bi-arrow-clockwise"></i> Reset
  </button>
  <button
    type="button"
    class="btn btn-sm btn-success dropdown-toggle dropdown-toggle-split"
    data-bs-toggle="dropdown"
    aria-expanded="false"
  >
    <span class="visually-hidden">Reset Options</span>
  </button>
  <ul class="dropdown-menu dropdown-menu-end">
    <li><h6 class="dropdown-header">Reset Options</h6></li>
    <li>
      <a class="dropdown-item" href="#" onclick="event.preventDefault(); TEUI.StateManager.resetTier1_UndoChanges();">
        Undo Changes
      </a>
    </li>
    <li>
      <a class="dropdown-item" href="#" onclick="event.preventDefault(); TEUI.StateManager.resetTier2_ClearImport();">
        Clear Import Data
      </a>
    </li>
    <li><hr class="dropdown-divider" /></li>
    <li>
      <a class="dropdown-item text-danger" href="#" onclick="event.preventDefault(); if(confirm('Factory reset? This will clear ALL data.')) TEUI.StateManager.resetTier3_FactoryReset();">
        Factory Reset
      </a>
    </li>
  </ul>
</div>
```

#### 2.3 Update Button Label Based on State

Add dynamic button text that shows what the reset will do:

```javascript
function updateResetButtonLabel() {
  const resetBtn = document.getElementById('reset-btn') || document.getElementById('reset-imported-btn');
  if (!resetBtn || !TEUI?.StateManager) return;

  const tier = TEUI.StateManager.getResetTier();
  const icon = '<i class="bi bi-arrow-clockwise"></i>';

  switch(tier) {
    case 0:
      resetBtn.innerHTML = `${icon} Reset`;
      resetBtn.disabled = true;
      resetBtn.title = "Already at default values";
      break;
    case 1:
      resetBtn.innerHTML = `${icon} Undo Changes`;
      resetBtn.disabled = false;
      resetBtn.title = "Undo changes and return to defaults";
      break;
    case 2:
      resetBtn.innerHTML = `${icon} Undo to Import`;
      resetBtn.disabled = false;
      resetBtn.title = "Undo changes and return to imported values";
      break;
  }
}

// Call after any state change
document.addEventListener('DOMContentLoaded', function() {
  // ... existing initialization ...
  updateResetButtonLabel();

  // Listen for state changes
  if (TEUI.StateManager) {
    const originalSetValue = TEUI.StateManager.setValue;
    TEUI.StateManager.setValue = function(...args) {
      const result = originalSetValue.apply(this, args);
      updateResetButtonLabel();
      return result;
    };
  }
});
```

---

### Phase 3: FileHandler Integration

**File**: `src/core/FileHandler.js`

#### 3.1 Track Import State

After successful import, ensure `lastImportedState` is properly populated.

**Current code** (line 113):
```javascript
const importedData = this.excelMapper.mapExcelToReportModel(workbook);
```

**Add after import** (around line 160):
```javascript
// Store imported state for reset functionality
if (this.stateManager && importedData && Object.keys(importedData).length > 0) {
  // Let StateManager know this is an import operation
  Object.entries(importedData).forEach(([fieldId, value]) => {
    this.stateManager.setValue(fieldId, value, this.stateManager.VALUE_STATES.IMPORTED);
  });

  console.log(`[FileHandler] Imported ${Object.keys(importedData).length} fields`);
}
```

This is likely already happening via the existing code, but verify `VALUE_STATES.IMPORTED` is being used.

---

### Phase 4: Testing Plan

#### Test Case 1: Fresh App → User Modifications

1. Load fresh app (clear localStorage first)
2. Modify a few fields (e.g., d_12, h_12)
3. Click Reset
4. **Expected**: Confirm dialog "Undo all changes and return to default values?"
5. Confirm
6. **Expected**: Page reloads, all fields at defaults

#### Test Case 2: Import → User Modifications → Reset Tier 1

1. Load fresh app
2. Import a CSV/Excel file
3. Modify a few fields
4. Click Reset
5. **Expected**: Confirm dialog "Undo your changes and return to imported values?"
6. Confirm
7. **Expected**: Modified fields revert to imported values (no page reload if using existing `revertToLastImportedState()`)

#### Test Case 3: Import → Reset Tier 2

1. Load fresh app
2. Import a CSV/Excel file
3. Open Reset dropdown menu
4. Click "Clear Import Data"
5. **Expected**: Confirm dialog
6. Confirm
7. **Expected**: Page reloads, all fields at defaults, import data cleared

#### Test Case 4: Import → Modifications → Dropdown Menu

1. Load fresh app
2. Import a CSV/Excel file
3. Modify some fields
4. Open Reset dropdown menu
5. Verify all 3 options are available:
   - "Undo Changes" (goes to imported state)
   - "Clear Import Data" (goes to defaults)
   - "Factory Reset" (goes to defaults)
6. Test each option

#### Test Case 5: No Changes → Reset Button Disabled

1. Load fresh app
2. Don't make any changes
3. **Expected**: Reset button is disabled with text "Reset"
4. Hover over button
5. **Expected**: Tooltip "Already at default values"

---

## Implementation Sequence

1. ✅ **Document current behavior** (this file)
2. **Phase 1**: Update StateManager.js with tier logic (30 min)
3. **Phase 2**: Update index.html with new reset handler (20 min)
4. **Phase 3**: Verify FileHandler integration (10 min)
5. **Phase 4**: Test all scenarios (30 min)
6. **Enhancement**: Add dropdown menu and dynamic button labels (optional, 20 min)

**Total estimated time**: 1.5-2 hours

---

## Files to Modify

1. **src/core/StateManager.js**
   - Add `getResetTier()`
   - Add `resetTier1_UndoChanges()`
   - Add `resetTier2_ClearImport()`
   - Add `resetTier3_FactoryReset()`
   - Update public API

2. **index.html**
   - Replace `resetAllData()` with `handleResetButton()`
   - Update button onclick handler (line 247)
   - Optional: Add dropdown menu
   - Optional: Add dynamic button label logic

3. **src/core/FileHandler.js**
   - Verify import uses `VALUE_STATES.IMPORTED`
   - Verify `lastImportedState` is populated correctly

---

## Edge Cases to Consider

1. **Partial import**: What if import only populates some fields?
   - **Solution**: Only revert fields that exist in `lastImportedState`

2. **Multiple imports**: What if user imports file A, then file B?
   - **Solution**: `lastImportedState` is overwritten each time (expected behavior)

3. **Import + calculated fields**: Imported data triggers calculations
   - **Solution**: Reset only reverts imported/user-modified fields, not calculated

4. **Dual-state sections**: Reference vs Target states
   - **Solution**: Existing `clear()` method already handles dual-state localStorage keys

5. **Browser refresh vs Reset**: User refreshes browser vs clicks Reset
   - **Solution**: Browser refresh loads from localStorage (preserves state), Reset clears localStorage

---

## Future Enhancements

1. **Reset history**: Track reset operations for undo/redo
2. **Partial reset**: Reset only specific sections
3. **Reset preview**: Show what will change before confirming
4. **Auto-save before reset**: Create a temporary backup before reset
5. **Export before reset**: Prompt user to export current state before resetting

---

## Approval Checklist

- [ ] Review implementation plan with CTO
- [ ] Confirm UX flow matches user expectations
- [ ] Confirm tier logic is correct
- [ ] Approve file modifications
- [ ] Approve testing plan
- [ ] Schedule implementation

---

## Notes

- The existing `revertToLastImportedState()` method (StateManager.js:1583) already implements most of Tier 1 functionality!
- Just need to wire it to the UI and add tier detection
- This is a relatively low-risk change since we're adding logic, not replacing existing reset behavior entirely
- Can implement progressively: Start with basic tier detection, then enhance with dropdown menu later
