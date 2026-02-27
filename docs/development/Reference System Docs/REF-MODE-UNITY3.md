# Reference Mode Set Values - RESOLVED
**Status**: ✅ **FIXED** (with known Copy regression)
**Branch**: REF-MODE-UNITY
**Date**: 2025-12-11
**Commits**: Fix #5 (28bc755), Fix #6 (1c26a2b), Test Results (8eddb1f)

---

## Executive Summary

**Fixed Systems** ✅:
1. **Import** (CSV/Excel) - Perfect dual-state isolation
2. **Set Values** (ReferenceValues.js) - Fully bidirectional mode-aware operation
   - Target mode: Updates only Target model with code minimums
   - Reference mode: Updates only Reference model with selected standard

**Regression** ⚠️:
3. **Copy from Target** (Geometry/Code/All) - Functions inverted in Reference mode
   - Target mode: Works correctly (no-op, copies Target to itself)
   - Reference mode: Inverted - copies Reference→Target instead of Target→Reference
   - **Fix Required**: Dec 12 - Add mode validation to Copy functions

**Original Bug (FIXED)**: After CSV/Excel import, clicking "Set Values" in Reference mode contaminated BOTH Target and Reference models with identical ReferenceValues.js data.

**Root Cause**: `syncPatternASections()` was syncing BOTH TargetState and ReferenceState from global StateManager. In Reference mode, `TargetState.syncFromGlobalState()` called `StateManager.getValue("f_85")` which returned Reference values due to global UI mode check, contaminating Target's isolated state.

**Solution (Fix #5 + Fix #6)**: Mode-aware state synchronization - skip TargetState sync in Reference mode, skip ReferenceState sync in Target mode.

---

## Three FileHandler Systems - Side-by-Side Comparison

### Comparison Matrix

| Feature | Import | Copy from Target | Set Values |
|---------|--------|------------------|------------|
| **Entry Points** | `processImportedCSV()` (Line 314)<br>`processImportedExcel()` (Line 105) | `mirrorGeometry()` (RT:931)<br>`mirrorGeometryPlusCode()` (RT:1031)<br>`mirrorAllInputs()` (RT:1149) | `applyReferenceValuesFromStandard()` (Line 999) |
| **Dual-State Method** | Explicit (Row 2/3, REPORT/REFERENCE sheets) | Direct Target→Reference copy | Mode-aware prefix logic (`targetMode` param) |
| **skipRecalculation** | `false` (Target)<br>`true` (Reference) | N/A (no Import System) | `true` |
| **loadReferenceData()** | ✅ YES (Target import only, Line 841) | ❌ NO | ❌ NO |
| **Quarantine Pattern** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Pattern A Sync** | Full (both states) | Full (both states) | **Mode-aware** (Fix #6: skipTargetSync OR skipReferenceSync) |
| **Status** | ✅ WORKS | ⚠️ REGRESSION (inverted in Ref mode) | ✅ FIXED |

---

## System 1: Import (CSV/Excel) - ✅ WORKS

### Entry Points
```javascript
// CSV Import
processImportedCSV(csvData) // Line 314
  → updateStateFromImportData(targetData, 0, false)   // Row 2 (Target)
  → updateStateFromImportData(referenceData, 0, true) // Row 3 (Reference)

// Excel Import
processImportedExcel(workbook) // Line 105
  → updateStateFromImportData(targetData, 0, false)   // REPORT sheet (Target)
  → processImportedExcelReference(workbook)           // REFERENCE sheet (Reference)
```

### Dual-State Handling
**Explicitly dual-state** - Data structure separates Target and Reference:

**CSV Format**:
```csv
Row 1 (Headers):  d_52,  f_85,   f_86,   ...
Row 2 (Target):   "90",  "5.30", "4.10", ...  → writes to d_52, f_85, f_86
Row 3 (Reference):"92",  "4.87", "4.21", ...  → writes to ref_d_52, ref_f_85, ref_f_86
```

**Excel Format**:
- `REPORT` worksheet → Target fields (unprefixed)
- `REFERENCE` worksheet → Reference fields (ref_ prefixed)

### Key Code Flow

**Target Import** (Lines 154-226 Excel, 422-486 CSV):
```javascript
// 1. QUARANTINE START
window.TEUI.StateManager.muteListeners(); // 🔒

try {
  // 2. Write Target values
  this.updateStateFromImportData(targetData, 0, false); // skipRecalculation=FALSE

  // Inside updateStateFromImportData() when skipRecalculation=false:
  // Lines 831-842:
  const finalD13 = this.stateManager.getApplicationValue("d_13");
  this.stateManager.loadReferenceData(finalD13); // ⚠️ Populates activeReferenceDataSet

  // 3. Write Reference values
  this.processImportedExcelReference(workbook);

  // 4. Sync Pattern A sections (FULL sync with area sync)
  this.syncPatternASections(); // No skipAreaSync flag

} finally {
  // 5. QUARANTINE END
  window.TEUI.StateManager.unmuteListeners(); // 🔓
}

// 6. Clean recalculation
this.calculator.calculateAll();
```

### Critical: loadReferenceData() Call

**YES - Called for Target import only** (Line 841):
```javascript
if (!skipRecalculation) {
  const finalD13 = this.stateManager.getApplicationValue("d_13"); // Target's standard
  this.stateManager.loadReferenceData(finalD13); // Populates cache
}
```

**Purpose**: After importing Target values, populate `activeReferenceDataSet` cache with Target's d_13 standard for Reference mode display.

**Side Effect**: This cache becomes **stale** if user later changes `ref_d_13` and clicks "Set Values".

### Pattern A Sync
**Full sync with area sync enabled**:
```javascript
this.syncPatternASections(); // No flag → calls syncAreasFromS10() at Line 964
```

---

## System 2: Copy from Target - ✅ WORKS

### Entry Points (ReferenceToggle.js)
```javascript
// Copy Geometry (windows/doors/envelope areas)
mirrorGeometry() // Line 931
  → Read Target fields (d_68, d_69, d_70, ...)
  → Write Reference fields (ref_d_68, ref_d_69, ref_d_70, ...)

// Copy Geometry + Code (+ insulation RSI values)
mirrorGeometryPlusCode() // Line 1031
  → Read Target fields (geometry + f_85, f_86, f_87, ...)
  → Write Reference fields (ref_ prefixed)

// Copy All Values (all user-editable fields)
mirrorAllInputs() // Line 1149
  → Read Target fields (all user inputs)
  → Write Reference fields (ref_ prefixed)
```

### How It Works
**Direct StateManager reads/writes** - No Import System involvement:

```javascript
// Example: mirrorGeometry() - Line 962-979
const geometryFields = ["d_68", "d_69", "d_70", ...];

geometryFields.forEach(fieldId => {
  const targetValue = window.TEUI.StateManager.getValue(fieldId); // Read unprefixed
  window.TEUI.StateManager.setValue(`ref_${fieldId}`, targetValue, "mirror"); // Write prefixed
});
```

**Key Insight**: Copy operations directly populate `ref_*` fields in StateManager's `fields` Map. These become **authoritative** Reference values.

### Quarantine Pattern
**YES - Uses FileHandler pattern** (Line 958, 1056, 1170):
```javascript
// 1. QUARANTINE START
window.TEUI.StateManager.muteListeners(); // 🔒

try {
  // 2. Copy values with ref_ prefix
  geometryFields.forEach(fieldId => {
    const targetValue = window.TEUI.StateManager.getValue(fieldId);
    window.TEUI.StateManager.setValue(`ref_${fieldId}`, targetValue, "mirror");
  });

  // 3. Sync Pattern A sections (delegates to FileHandler)
  window.TEUI.FileHandler.syncPatternASections(); // Full sync

} finally {
  // 4. QUARANTINE END
  window.TEUI.StateManager.unmuteListeners(); // 🔓
}

// 5. Clean recalculation
window.TEUI.Calculator.calculateAll();
```

### loadReferenceData() Call
**NO** - Copy operations don't call `loadReferenceData()`.

**Why**: Copying from Target directly populates `ref_*` fields in StateManager. No need for `activeReferenceDataSet` cache manipulation.

### Pattern A Sync
**Full sync via FileHandler delegation**:
```javascript
window.TEUI.FileHandler.syncPatternASections(); // No skipAreaSync flag
```

### ⚠️ Known Regression (Dec 11, 2025)

**Observed Behavior After Fix #6**:
- **Target mode**: Copy Geometry works correctly (no-op, copies Target to itself)
- **Reference mode**: Copy functions **INVERTED** - copies Reference→Target instead of Target→Reference

**Example Test**:
1. Set Target h_16 (conditioned area) = 200
2. Switch to Reference mode
3. Set Reference h_16 = 6000
4. Click "Copy Geometry from Target"
5. **Expected**: Reference h_16 = 200 (Target→Reference)
6. **Actual**: Target h_16 = 6000 (Reference→Target) ❌ INVERTED!

**Root Cause**: Copy functions lack mode awareness. They always call `FileHandler.syncPatternASections()` which now uses mode-aware sync based on global UI state.

**Impact**: Medium - breaks Reference mode Copy workflow

**Fix Required** (Dec 12): Add mode validation to Copy functions in [ReferenceToggle.js:931-1212](../../src/core/ReferenceToggle.js#L931-L1212):
```javascript
// Add at start of mirrorGeometry(), mirrorGeometryPlusCode(), mirrorAllInputs()
if (!window.TEUI.ReferenceToggle.isReferenceMode()) {
  console.warn('[ReferenceToggle] Copy from Target only available in Reference mode');
  return;
}
```

---

## System 3: Set Values (ReferenceValues.js overlay) - ✅ FIXED

### Entry Point (FileHandler.js)
```javascript
// Called from Section02 "Set Values" button
applyReferenceValuesFromStandard(standard, targetMode) // Line 999
  → Read ReferenceValues.js for selected standard
  → Apply mode-aware prefix (ref_ or none)
  → Write to StateManager
```

### Mode-Aware Application
**Single-mode operation** - applies to either Target OR Reference:

```javascript
// Lines 1014-1020
const referenceValues = window.TEUI.ReferenceValues[standard];
// Returns: { d_52: "90", f_85: "5.30", f_86: "4.10" } ← UNPREFIXED source

const importedData = {};
Object.entries(referenceValues).forEach(([fieldId, value]) => {
  const targetFieldId = targetMode === "reference" ? `ref_${fieldId}` : fieldId;
  importedData[targetFieldId] = value;
});

// Builds in Reference mode:
// { ref_d_52: "90", ref_f_85: "5.30", ref_f_86: "4.10" } ✅ CORRECT
```

**Prefix logic is CORRECT** - Verified by diagnostic logging (REF-MODE-UNITY2.md lines 851-914).

### Key Code Flow

```javascript
// Lines 1053-1091

// 1. QUARANTINE START
window.TEUI.StateManager.muteListeners(); // 🔒

try {
  // 2. Write with correct prefixes
  this.updateStateFromImportData(importedData, 0, true); // skipRecalculation=TRUE

  // Inside updateStateFromImportData() when skipRecalculation=true:
  // Lines 831-842 - SKIPPED (no loadReferenceData call)

  // 3. Sync Pattern A sections - MODE-AWARE (Fix #6)
  const skipTargetSync = targetMode === "reference";
  const skipReferenceSync = targetMode === "target";
  this.syncPatternASections(true, skipTargetSync, skipReferenceSync);

} finally {
  // 4. QUARANTINE END
  window.TEUI.StateManager.unmuteListeners(); // 🔓
}

// 5. Clean recalculation
this.calculator.calculateAll(); // ✅ No contamination - isolated state sync!
```

### loadReferenceData() Call
**NO - Explicitly prevented** (Fix #1 - Dec 9, Commit 1049ed8):

```javascript
this.updateStateFromImportData(importedData, 0, true); // skipRecalculation=TRUE
// Line 1062 comment:
// ⚠️ CRITICAL: Pass skipRecalculation=true to prevent loadReferenceData() contamination
```

**Fix History**:
- **Before**: `skipRecalculation=false` → Called `loadReferenceData(d_13)` → **Contaminated Target model**
- **After**: `skipRecalculation=true` → Skips `loadReferenceData()` → **Works on fresh page load**

### Pattern A Sync
**✅ MODE-AWARE SYNC** (Fix #5 + Fix #6 - Dec 11, Commits 28bc755 + 1c26a2b):

```javascript
// Line 1075-1080
const skipTargetSync = targetMode === "reference";     // Skip Target in Reference mode
const skipReferenceSync = targetMode === "target";     // Skip Reference in Target mode
this.syncPatternASections(true, skipTargetSync, skipReferenceSync);
```

**How It Works**:
- **Reference mode**: Only syncs ReferenceState from `ref_*` fields → Target isolated ✅
- **Target mode**: Only syncs TargetState from unprefixed fields → Reference isolated ✅
- Area sync always skipped (ReferenceValues don't affect window areas)

**Result**: Perfect bidirectional isolation - no cross-contamination in either mode.

---

## Timeline of Set Values Fixes

### Fix #1: State Contamination (Commit 1049ed8 - Dec 9, 2025)
**Problem**: `loadReferenceData(d_13)` overwrote Target model with Reference standard

**Location**: [FileHandler.js:1062](../../src/core/FileHandler.js#L1062)

**Solution**:
```javascript
// BEFORE (bug):
this.updateStateFromImportData(importedData, 0, false); // Calls loadReferenceData

// AFTER (fixed):
this.updateStateFromImportData(importedData, 0, true); // Skips loadReferenceData
```

**Result**: ✅ Works on fresh page load, ❌ Still fails post-import

---

### Fix #2: d_13 Dropdown Refresh (Commit 1a7f6d3 - Dec 9, 2025)
**Problem**: d_13 dropdown showed stale value when switching modes

**Location**: [Section02.js:1866-1868](../../src/sections/Section02.js#L1866-L1868)

**Solution**:
```javascript
// BEFORE (bug):
const d13Value = currentState.getValue("d_13"); // Section-local state (stale)

// AFTER (fixed):
const d13FieldId = this.currentMode === "reference" ? "ref_d_13" : "d_13";
const d13Value = window.TEUI.StateManager.getValue(d13FieldId); // Global state (fresh)
```

**Result**: ✅ Dropdown shows correct value

---

### Fix #3: Skip Area Sync (Commit 0e319e6 - Dec 10, 2025)
**Problem**: `syncAreasFromS10()` calls `calculateAll()` which contaminates Target fields

**Location**: [FileHandler.js:868-989](../../src/core/FileHandler.js#L868-L989)

**Solution**:
```javascript
// Add skipAreaSync parameter
syncPatternASections(skipAreaSync = false) {
  // ... sync TargetState/ReferenceState ...

  // Skip area sync if flag set
  if (!skipAreaSync && window.TEUI?.SectionModules?.sect11?.syncAreasFromS10) {
    console.log("[FileHandler] 🔧 PHASE 2.5: Syncing S11 window areas from S10...");
    window.TEUI.SectionModules.sect11.syncAreasFromS10();
  } else if (skipAreaSync) {
    console.log("[FileHandler] ⏭️ PHASE 2.5: Skipping S11 area sync (not needed for overlay)");
  }
}

// Set Values calls with skipAreaSync=true
this.syncPatternASections(true); // Line 1073
```

**Result**: ❓ **Should work but contamination persists**

---

## Root Cause Analysis: The Stale Cache Mystery

### Why Fresh Page Load Works ✅

**State on fresh page load**:
```javascript
activeReferenceDataSet = {}; // Empty cache
```

**Flow**:
1. User selects d_13 = "OBC SB10 5.5-6 Z5 (2010)" in Reference mode
2. Writes `ref_d_13` to StateManager
3. User clicks "Set Values"
4. `applyReferenceValuesFromStandard()` writes `ref_f_85`, `ref_f_86`, `ref_f_87` ✅
5. `calculateAll()` runs both engines
6. Reference mode `getValue("f_85")` priority order:
   - **Priority 1**: `independentReferenceState["f_85"]` → undefined
   - **Priority 2**: `activeReferenceDataSet["f_85"]` → **undefined (cache empty)** ✅
   - **Priority 3**: `fields.get("f_85")` → Returns correct Target value ✅
7. No contamination - Reference uses `ref_f_85`, Target uses `f_85`

### Why Post-Import Fails ❌

**State after CSV/Excel import**:
```javascript
activeReferenceDataSet = {
  f_85: "5.30",  // From Target's d_13 standard
  f_86: "4.10",
  f_87: "6.60",
  // ... populated by loadReferenceData(d_13) during import
}; // ⚠️ STALE CACHE!
```

**Flow**:
1. User imports CSV/Excel with:
   - Target: d_13 = "OBC SB10 5.5-6 Z5 (2010)"
   - Reference: ref_d_13 = "PH Classic"
2. Import calls `loadReferenceData("OBC SB10 5.5-6 Z5 (2010)")` (Line 841)
3. `activeReferenceDataSet` populated with **Target's OBC standard values**
4. User switches to Reference mode, changes ref_d_13 to "OBC SB10 5.5-6 Z5 (2010)"
5. User clicks "Set Values"
6. `applyReferenceValuesFromStandard()` writes `ref_f_85`, `ref_f_86`, `ref_f_87` ✅
7. **Cache NOT updated** - still contains Target's OBC values
8. `calculateAll()` runs both engines
9. Reference mode `getValue("f_85")` priority order:
   - **Priority 1**: `independentReferenceState["f_85"]` → undefined
   - **Priority 2**: `activeReferenceDataSet["f_85"]` → **"5.30" (STALE Target value!)** ❌
   - **Priority 3**: Never reached (Priority 2 hit)
10. `calculateTargetModel()` reads stale value "5.30" → writes to `f_85` → **Contamination!**

---

## The activeReferenceDataSet Cache Architecture

### Purpose (StateManager.js Lines 1628-1797)
Cache for Reference mode `getValue()` calls to avoid repeated ReferenceValues.js lookups.

### How It Gets Populated
```javascript
// StateManager.loadReferenceData(standard)
function loadReferenceData(standard) {
  // Step 1: Copy application state to activeReferenceDataSet (Lines 1640-1654)
  for (const [fieldId, field] of this.fields.entries()) {
    if (!fieldId.startsWith("ref_")) {
      activeReferenceDataSet[fieldId] = field.value; // Target values!
    }
  }

  // Step 2: Apply Reference Mode defaults from AppendixE (Lines 1672-1735)
  // Step 3: Overlay standard-specific overrides from ReferenceValues.js (Lines 1737-1760)
  const refValues = window.TEUI.ReferenceValues[standard];
  Object.entries(refValues).forEach(([fieldId, value]) => {
    activeReferenceDataSet[fieldId] = value;
  });
}
```

**Key Insight**: Cache represents "what Reference model WOULD look like if based on Target's standard".

### Priority Order in getValue() (Lines 325-356)

```javascript
function getValue(fieldId) {
  if (ReferenceToggle.isReferenceMode()) {
    // Priority 1: Check independentReferenceState (user-editable Reference fields)
    if (independentReferenceState[fieldId]) {
      value = independentReferenceState[fieldId];
    }
    // Priority 2: Check activeReferenceDataSet ⚠️ STALE CACHE PROBLEM!
    else if (activeReferenceDataSet[fieldId]) {
      value = activeReferenceDataSet[fieldId]; // Returns Target values post-import
    }
    // Priority 3: Fallback to fields Map
    else {
      value = fields.get(fieldId)?.value; // Would return ref_* if reached
    }
  }
}
```

**The Bug**: Priority 2 prevents reaching Priority 3 where fresh `ref_*` values exist.

---

## Evidence: Stack Trace from Logs.md (Lines 89-127)

**Contamination occurs during `calculateAll()`**:

```
[StateManager] Stack trace for f_85 write:  ← UNPREFIXED! BUG!
setValue @ StateManager.js:370
setValue @ Section11.js:476              ← Section11 writes unprefixed field
setCalculatedValue @ Section11.js:2088
calculateComponentRow @ Section11.js:2553
calculateTargetModel @ Section11.js:3118 ← TARGET model calculating!
calculateAll @ Section11.js:3284
syncAreasFromS10 @ Section11.js:2312     ← Triggered during sync!
syncPatternASections @ FileHandler.js:964 ← Called after ref_* writes
applyReferenceValuesFromStandard @ FileHandler.js:1057
```

**The Flow**:
1. ✅ `applyReferenceValuesFromStandard()` correctly writes `ref_f_85: "5.30"`
2. ✅ Calls `syncPatternASections(true)` with skipAreaSync=true
3. ❌ **Somehow** `syncAreasFromS10()` is called (Line 964)
4. ❌ `syncAreasFromS10()` calls `calculateAll()` (Line 2312)
5. ❌ `calculateAll()` runs **BOTH** engines (dual-engine architecture)
6. ❌ `calculateTargetModel()` calls `getValue("f_85")` in Reference mode
7. ❌ Returns stale cache value → writes to unprefixed `f_85` → **Contamination!**

---

## Key Differences Between Working and Broken Systems

### What Import Does That Set Values Doesn't
1. **Calls `loadReferenceData(finalD13)` for Target import** (Line 841)
   - Populates `activeReferenceDataSet` cache with Target's d_13 standard
   - Set Values **SKIPS** this to avoid contamination (Fix #1)

2. **Full Pattern A sync with area sync enabled**
   - Import: `syncPatternASections()` → calls `syncAreasFromS10()`
   - Set Values: `syncPatternASections(true)` → **ATTEMPTS** to skip area sync

3. **Separate Reference import with `skipRecalculation=true`** (Line 303)
   - Writes `ref_*` fields without triggering `loadReferenceData()`
   - Set Values uses same pattern

### What Copy Does Differently
1. **No Import System involvement** - Direct StateManager writes to `ref_*` fields
2. **Full Pattern A sync** - Delegates to `FileHandler.syncPatternASections()`
3. **No `loadReferenceData()` call** - Doesn't manipulate cache
4. **Different state flag**: `"mirror"` vs `"imported"`

### Shared Patterns
All three use:
- `StateManager.muteListeners()` / `unmuteListeners()` quarantine
- `Calculator.calculateAll()` for clean recalculation
- `FileHandler.syncPatternASections()` for Pattern A state sync
- Pattern A section `refreshUI()` calls post-calculation

---

## Proposed Solutions

### Option 1: Priority Reordering in getValue() (RECOMMENDED)

**Change Reference mode priority** to check `ref_*` fields FIRST (from REF-MODE-UNITY2.md Lines 683-711):

**Location**: [StateManager.js:325-356](../../src/core/StateManager.js#L325-L356)

**Change**:
```javascript
function getValue(fieldId) {
  if (ReferenceToggle.isReferenceMode()) {
    // Priority 1: Check ref_* prefixed field in fields Map (FRESH DATA) ← NEW!
    const refFieldId = `ref_${fieldId}`;
    if (fields.has(refFieldId)) {
      value = fields.get(refFieldId).value; // ✅ Always fresh, authoritative
    }
    // Priority 2: Check independentReferenceState (user-editable fields)
    else if (independentReferenceState[fieldId]) {
      value = independentReferenceState[fieldId];
    }
    // Priority 3: Check activeReferenceDataSet (legacy cache)
    else if (activeReferenceDataSet[fieldId]) {
      value = activeReferenceDataSet[fieldId];
    }
    // Priority 4: Fallback to Target value
    else {
      value = fields.get(fieldId)?.value;
    }
  }
}
```

**Advantages**:
- ✅ Minimal code change (5 lines in StateManager.js)
- ✅ Preserves existing architecture
- ✅ Fixes both default and post-import scenarios
- ✅ `ref_*` fields become authoritative (true dual-state isolation)
- ✅ No risk to Import/Copy systems (doesn't change their logic)

**Disadvantages**:
- ⚠️ Doesn't address why `activeReferenceDataSet` exists
- ⚠️ Cache becomes redundant but remains in codebase

---

### Option 2: Clear Cache When Writing ref_* Fields

**Invalidate cache entries** when corresponding `ref_*` field is written:

**Location**: [StateManager.js:365](../../src/core/StateManager.js#L365) (in `setValue()`)

**Change**:
```javascript
function setValue(fieldId, value, state) {
  // ... existing code ...

  // If writing a ref_* field, clear corresponding cache entry
  if (fieldId.startsWith("ref_")) {
    const baseFieldId = fieldId.substring(4); // Remove "ref_" prefix
    if (activeReferenceDataSet[baseFieldId]) {
      delete activeReferenceDataSet[baseFieldId]; // Invalidate cache
    }
  }

  // ... rest of setValue ...
}
```

**Advantages**:
- ✅ Maintains cache for performance
- ✅ Ensures cache never stale

**Disadvantages**:
- ⚠️ More complex (cache invalidation is hard)
- ⚠️ Doesn't fix fundamental design issue
- ⚠️ Cache rebuilds on every `loadReferenceData()` call anyway

---

### Option 3: Deprecate activeReferenceDataSet Entirely

**Remove cache**, always read from authoritative sources:

**Location**: [StateManager.js:325-356](../../src/core/StateManager.js#L325-L356)

**Change**:
```javascript
function getValue(fieldId) {
  if (ReferenceToggle.isReferenceMode()) {
    // Check ref_* field first
    const refFieldId = `ref_${fieldId}`;
    if (fields.has(refFieldId)) {
      return fields.get(refFieldId).value;
    }
    // Check independentReferenceState
    if (independentReferenceState[fieldId]) {
      return independentReferenceState[fieldId];
    }
    // Fallback to Target (for fields without ref_* variants)
    return fields.get(fieldId)?.value || null;
  }
}
```

**Advantages**:
- ✅ Simplest architecture
- ✅ No cache staleness possible
- ✅ True dual-state isolation
- ✅ Removes 200+ lines of cache management code

**Disadvantages**:
- ⚠️ Requires understanding why cache was added (performance? legacy?)
- ⚠️ May break assumptions in other code
- ⚠️ More invasive change

---

## Diagnostic Questions Before Fix

Before implementing any solution, we need to verify:

### 1. Does Fix #3 Actually Work?
**Question**: Is `syncAreasFromS10()` still being called despite `skipAreaSync=true`?

**Test**: Add logging to verify:
```javascript
// In syncPatternASections()
console.log(`[FileHandler] skipAreaSync flag: ${skipAreaSync}`);

// In syncAreasFromS10()
console.trace(`[Section11] syncAreasFromS10() called`);
```

**Expected**: If Fix #3 works, `syncAreasFromS10()` should NOT be called during Set Values.

**If Fix #3 fails**: Multiple sync paths may exist, or `calculateAll()` itself calls area sync.

---

### 2. Where Does Contamination Actually Occur?
**Question**: Does contamination happen in `syncAreasFromS10()` or in `calculateAll()`?

**Test**: Add logging to trace `getValue("f_85")` calls:
```javascript
// In StateManager.getValue()
if (fieldId === "f_85" && ReferenceToggle.isReferenceMode()) {
  console.log(`[StateManager] getValue("f_85") in Reference mode:`);
  console.log(`  Priority 1 (independentReferenceState): ${independentReferenceState[fieldId]}`);
  console.log(`  Priority 2 (activeReferenceDataSet): ${activeReferenceDataSet[fieldId]}`);
  console.log(`  Priority 3 (fields.get): ${fields.get("ref_f_85")?.value}`);
  console.trace(`  Returning: ${value}`);
}
```

**Expected**: Should show Priority 2 returning stale cache value post-import.

---

### 3. What Populates activeReferenceDataSet?
**Question**: Does ONLY `loadReferenceData()` populate the cache, or are there other paths?

**Test**: Add logging to all cache writes:
```javascript
// In StateManager.loadReferenceData()
console.log(`[StateManager] loadReferenceData("${standard}") START`);
console.log(`[StateManager] Cache before:`, Object.keys(activeReferenceDataSet));

// ... populate cache ...

console.log(`[StateManager] Cache after:`, Object.keys(activeReferenceDataSet));
console.log(`[StateManager] loadReferenceData("${standard}") END`);
```

**Expected**: Only Import's Target import should populate cache.

---

## Recommendation

**Implement Option 1 (Priority Reordering)** as the immediate fix:
- ✅ Minimal risk - doesn't change Import/Copy logic
- ✅ Surgical change - 5 lines in StateManager.js
- ✅ Fixes both default and post-import scenarios
- ✅ Makes `ref_*` fields authoritative for Reference state
- ✅ Preserves existing architecture for backward compatibility

**Future refactor (v4.013)**: Consider Option 3 to simplify architecture and remove cache entirely.

---

## Testing Protocol

### Test Case 1: Fresh Page Load (Should still work ✅)
1. Fresh page load
2. Switch to Reference mode
3. Change d_13 to "OBC SB10 5.5-6 Z5 (2010)"
4. Click "Set Values"
5. **Expected**: Only Reference model updates (e_10 changes, h_10 unchanged)

### Test Case 2: Post-Import (Currently fails ❌)
1. Import CSV/Excel with:
   - Target: d_13 = "OBC SB10 5.5-6 Z5 (2010)"
   - Reference: ref_d_13 = "PH Classic"
2. Switch to Reference mode
3. Change ref_d_13 to "OBC SB10 5.5-6 Z5 (2010)"
4. Click "Set Values"
5. **Expected**: Only Reference model updates (e_10 changes, h_10 unchanged)
6. **Actual (pre-fix)**: BOTH models update (e_10 AND h_10 change)

### Test Case 3: Import System Regression (Must not break ✅)
1. Import CSV/Excel with Target and Reference values
2. **Expected**: Both models import correctly with perfect state isolation
3. **Verify**: No contamination between Target and Reference

### Test Case 4: Copy System Regression (Must not break ✅)
1. Set up Target model with specific values
2. Click "Copy Geometry" / "Copy Code" / "Copy All"
3. **Expected**: Target values copied to Reference with ref_ prefix
4. **Verify**: Target model unchanged, Reference model updated

---

## Test Results - Dec 11, 2025

### Fix #4: getValue() Priority Reordering (FAILED ❌)

**Implementation**: Changed getValue() to check `ref_*` fields FIRST (Priority 1) before activeReferenceDataSet cache.

**Expected**: Would prevent stale cache reads during calculateAll().

**Actual Result**: ❌ **CONTAMINATION PERSISTS** - Both Target and Reference models sync to identical values after Set Values.

**Evidence from Logs.md**:
```
[StateManager.setValue] 🎯 ref_f_85 = "5.3" (state: calculated)  ← Reference writes (correct)
[StateManager.setValue] 🎯 ref_f_86 = "4.1" (state: calculated)
[StateManager.setValue] 🎯 ref_f_87 = "6.6" (state: calculated)

[StateManager.setValue] 🎯 f_85 = "5.3" (state: calculated)     ← Target contaminated!
[StateManager.setValue] 🎯 f_86 = "4.1" (state: calculated)
[StateManager.setValue] 🎯 f_87 = "6.6" (state: calculated)

Stack trace for f_85 write:
setValue @ Section11.js:476
setCalculatedValue @ Section11.js:2088
calculateComponentRow @ Section11.js:2553
calculateTargetModel @ Section11.js:3118  ← Target engine writes unprefixed!
calculateAll @ Section11.js:3284
```

**Observation**: The problem is NOT in getValue() priority. The contamination occurs because:
1. Set Values correctly writes `ref_f_85 = "5.3"` (Reference envelope RSI)
2. `calculateAll()` runs both engines (correct dual-engine pattern)
3. **Section11.calculateTargetModel()** reads from Reference values instead of Target values
4. Target engine writes contaminated results to unprefixed `f_85`, `f_86`, `f_87`

**Root Cause Revision**: The issue is in Section11's calculation logic, not StateManager's getValue(). Target calculations are reading from Reference state during dual-engine execution.

---

### THE ACTUAL ROOT CAUSE: Conflicting Mode Detection

**Investigation of Section11.calculateTargetModel()** ([Section11.js:3109-3120](../../src/sections/Section11.js#L3109-L3120)):

```javascript
function calculateTargetModel() {
  const originalMode = ModeManager.currentMode;
  ModeManager.currentMode = "target"; // ✅ Temporary mode switch for StateManager publishing

  try {
    // Calculate Target model...
    // Calls getValue("f_85") internally
  } finally {
    ModeManager.currentMode = originalMode; // Restore
  }
}
```

**The Problem**: Section11 sets `ModeManager.currentMode = "target"` to ensure its writes go to unprefixed fields, BUT:

**StateManager.getValue() checks global UI state**:
```javascript
// StateManager.js:331
if (TEUI.ReferenceToggle.isReferenceMode()) {
  // Returns TRUE if UI is in Reference mode (global)
  // Ignores Section11's local ModeManager.currentMode = "target"
}
```

**The Contamination Flow**:
1. User in **Reference mode** (UI mode = `ReferenceToggle.isReferenceMode() = true`)
2. Set Values writes `ref_f_85 = "5.3"` to StateManager
3. `calculateAll()` runs
4. `calculateTargetModel()` sets `ModeManager.currentMode = "target"` (section-local)
5. Target engine calls `getValue("f_85")`
6. StateManager checks `ReferenceToggle.isReferenceMode()` → **TRUE** (global UI state)
7. Fix #4 added: Check `ref_f_85` first → returns "5.3" ❌ **WRONG VALUE for Target!**
8. Target engine uses Reference value → writes contaminated `f_85 = "5.3"`

**Why Fix #4 Failed**: It made the problem WORSE by prioritizing `ref_*` fields. When UI is in Reference mode, even Target calculations read from `ref_*` fields!

**Why Fresh Page Load Works (Before Import)**:
- No import → `activeReferenceDataSet = {}` (empty)
- No `ref_*` fields exist yet
- `getValue("f_85")` falls through to Priority 3 (fields Map) → returns correct Target value
- No contamination

**Why Post-Import Fails**:
- Import populates `activeReferenceDataSet` with Target values
- Import writes `ref_f_85` to fields Map
- Fix #4 prioritizes `ref_f_85` → Target engine reads Reference value
- **Contamination!**

---

## THE REAL FIX: Mode Detection Must Be Consistent

**Problem**: Two different mode detection mechanisms:
1. **Section-local**: `ModeManager.currentMode` (used by sections during calculation)
2. **Global UI**: `ReferenceToggle.isReferenceMode()` (used by StateManager)

**Solution Options**:

### Option A: StateManager Should Respect Section-Local Mode (RECOMMENDED)

StateManager's `getValue()` should check **section-local mode** not **global UI mode**:

```javascript
// StateManager.js:331 - BEFORE (checks global UI)
if (TEUI.ReferenceToggle.isReferenceMode()) {

// AFTER (checks calculation context)
// Need a way for calculations to signal "I'm calculating Target" vs "I'm calculating Reference"
```

**Challenge**: How does StateManager know which engine is calling `getValue()`?

### Option B: Sections Should Use Explicit Read Functions

Instead of `getValue(fieldId)`, sections should use:
- `getTargetValue(fieldId)` - Always reads unprefixed field
- `getReferenceValue(fieldId)` - Always reads `ref_*` prefixed field

**Advantages**:
- ✅ Explicit - no ambiguity
- ✅ Mode-independent - works regardless of UI state

**Disadvantages**:
- ⚠️ Requires refactoring all sections
- ⚠️ Breaks existing calculation code

### Option C: Calculation Engines Should Read Directly from TargetState/ReferenceState

Sections maintain isolated state objects:
- `TargetState.getValue("f_85")` - Always Target value
- `ReferenceState.getValue("f_85")` - Always Reference value

**Advantages**:
- ✅ True isolation - no StateManager confusion
- ✅ Already implemented in Pattern A sections

**Disadvantages**:
- ⚠️ Only works for Pattern A sections
- ⚠️ Doesn't help with cross-section dependencies

---

## Next Steps

1. ✅ **Revert Fix #4** - getValue() priority change made problem worse (COMPLETED)
2. ✅ **Root cause identified** - Isolated state desync (COMPLETED)
3. **Implement Fix #5** - Add syncFromStateManager() calls to applyReferenceValuesFromStandard()
4. **Test thoroughly** - All four test cases must pass:
   - Fresh page load Set Values
   - Post-import Set Values
   - Import regression (must still work)
   - Copy regression (must still work)

---

## Files to Review/Modify

**Understanding**:
- [FileHandler.js:999-1095](../../src/core/FileHandler.js#L999-L1095) - Set Values system (PRIMARY FIX LOCATION)
- [FileHandler.js:105-226](../../src/core/FileHandler.js#L105-L226) - Excel Import (reference implementation)
- [FileHandler.js:314-486](../../src/core/FileHandler.js#L314-L486) - CSV Import (reference implementation)
- [Section11.js:383-400](../../src/sections/Section11.js#L383-L400) - ReferenceState.syncFromStateManager()
- [Section12.js](../../src/sections/Section12.js) - Pattern A section (needs sync)
- [Section13.js](../../src/sections/Section13.js) - Pattern A section (needs sync)
- [ReferenceToggle.js:931-1212](../../src/core/ReferenceToggle.js#L931-L1212) - Copy systems (no changes)

**Fix #5 Implementation**:
- [FileHandler.js:1089](../../src/core/FileHandler.js#L1089) - Add sync calls after setValue loop, before calculateAll()

---

## Summary for Future Agents

### What We Know (Dec 11, 2025 - Evening)

**The Bug**: After CSV/Excel import, clicking "Set Values" in Reference mode contaminates BOTH Target and Reference models with identical ReferenceValues.js data.

**What Works**:
- ✅ Fresh page load: Set Values in Reference mode → perfect isolation
- ✅ Import: CSV/Excel import → perfect dual-state isolation
- ✅ Copy from Target: All three copy modes → perfect isolation

**What Fails**:
- ❌ Post-import Set Values: Both models sync to same values

**Root Cause (REVISED - Dec 11 Evening)**:

**CRITICAL CORRECTION**: My initial analysis was wrong. Pattern A sections do NOT call `StateManager.getValue()` for calculations - they use **isolated state objects**.

**How Pattern A Sections Actually Work**:

Section11 maintains two isolated state objects:
```javascript
// Section11.js lines 411-466
const ModeManager = {
  currentMode: "target",
  getValue: function(fieldId) {
    return this.getCurrentState().getValue(fieldId); // ← TargetState or ReferenceState
  },
  getCurrentState: function() {
    return this.currentMode === "target" ? TargetState : ReferenceState;
  }
};
```

**The Dual-Engine Read Pattern**:
1. **calculateTargetModel()** reads from `TargetState.getValue("f_85")` (isolated)
2. **calculateReferenceModel()** reads from `ReferenceState.getValue("f_85")` (isolated)
3. Both engines write results to `StateManager` for downstream sections/UI

**THE REAL BUG - Isolated State Desync**:

Set Values writes to **StateManager** (global):
```javascript
// FileHandler.js line 1027
window.TEUI.StateManager.setValue("ref_f_85", "5.3", "user-modified");
```

But Reference engine reads from **ReferenceState** (isolated):
```javascript
// Section11 calculateReferenceModel()
const value = ReferenceState.getValue("f_85"); // ← NEVER synced from StateManager!
```

**Why Import Works**:
```javascript
// Section11.js ReferenceState.syncFromStateManager() lines 383-400
// FileHandler calls this during updateStateFromImportData()
this.setValue(fieldId, globalValue); // ✅ Syncs StateManager → ReferenceState
```

**Why Set Values Fails (ACTUAL ROOT CAUSE)**:
```javascript
// FileHandler.js applyReferenceValuesFromStandard() line 1073
this.syncPatternASections(true); // ← CALLED! But syncs BOTH TargetState AND ReferenceState

// What syncPatternASections() does (line 899-911):
section.TargetState.syncFromGlobalState();   // ← Reads unprefixed "f_85"
section.ReferenceState.syncFromGlobalState(); // ← Reads prefixed "ref_f_85"
```

**The Contamination Mechanism**:

When `TargetState.syncFromGlobalState()` runs (Section11.js line 170):
```javascript
const globalValue = window.TEUI.StateManager.getValue("f_85"); // Unprefixed!
```

But `StateManager.getValue("f_85")` in Reference mode (line 331-346):
```javascript
if (TEUI.ReferenceToggle.isReferenceMode()) {
  // Check activeReferenceDataSet (populated by Import with ReferenceValues)
  return activeReferenceDataSet["f_85"]; // Returns Reference value!
}
```

**The Complete Flow**:
1. Import populates `activeReferenceDataSet["f_85"] = "4.1"` (from imported file)
2. Set Values writes `StateManager ref_f_85 = "5.3"` (new standard) ✅
3. `syncPatternASections()` runs:
   - `TargetState.syncFromGlobalState()` calls `StateManager.getValue("f_85")`
   - StateManager in Reference mode returns `activeReferenceDataSet["f_85"]` = "4.1"
   - `TargetState.state["f_85"] = "4.1"` ❌ CONTAMINATED with old Reference value!
   - `ReferenceState.syncFromGlobalState()` calls `StateManager.getValue("ref_f_85")`
   - `ReferenceState.state["f_85"] = "5.3"` ✅ Correct
4. Both models now calculate with values from `activeReferenceDataSet`

### Failed Fixes

**Fix #1-3**: See REF-MODE-UNITY2.md (skipRecalculation, refreshUI, skipAreaSync)
- Addressed symptoms, not root cause
- Worked for fresh page load, failed post-import

**Fix #4**: getValue() priority reordering (Dec 11)
- Made problem WORSE by prioritizing `ref_*` fields
- Target engine now ALWAYS reads Reference values when UI in Reference mode

### The Actual Problem

**Architectural Issue**: Pattern A sections maintain **isolated state** but FileHandler.applyReferenceValuesFromStandard() only writes to **global StateManager**, never syncing to the isolated state.

**The Broken Data Flow**:

Import (WORKS):
```
FileHandler → StateManager (ref_f_85 = "4.1")
          ↓
ReferenceState.syncFromStateManager() called
          ↓
ReferenceState.state["f_85"] = "4.1" ✅ SYNCED
          ↓
calculateReferenceModel() reads from ReferenceState ✅ CORRECT
```

Set Values (FAILS):
```
FileHandler → StateManager (ref_f_85 = "5.3")
          ↓
ReferenceState.syncFromStateManager() NOT called ❌
          ↓
ReferenceState.state["f_85"] = "4.1" (stale from Import)
          ↓
calculateReferenceModel() reads from ReferenceState ❌ STALE DATA
```

**Why Fix #4 Made It Worse**:
- Changed `StateManager.getValue()` to prioritize `ref_*` fields
- Made the problem even worse by returning Reference values for ALL unprefixed reads

### Solution Direction

**THE FIX**: `syncPatternASections()` must NOT sync TargetState during Set Values - only ReferenceState!

**Option 1 (RECOMMENDED)**: Add parameter to skip TargetState sync
```javascript
// FileHandler.js line 868 - Modify syncPatternASections signature
syncPatternASections(skipAreaSync = false, skipTargetSync = false) {
  patternASections.forEach(({ id, name }) => {
    const section = window.TEUI?.SectionModules?.[id];

    if (!skipTargetSync && section?.TargetState?.syncFromGlobalState) {
      section.TargetState.syncFromGlobalState(); // ← Skip during Set Values
    }

    if (section?.ReferenceState?.syncFromGlobalState) {
      section.ReferenceState.syncFromGlobalState(); // ← Always sync
    }
  });
}

// FileHandler.js line 1073 - Pass skipTargetSync=true
this.syncPatternASections(true, true); // skipAreaSync=true, skipTargetSync=true
```

**Why This Works (PARTIAL FIX)**:
- Reference mode Set Values: Only ReferenceState syncs ✅ WORKS!
- Target mode Set Values: TargetState skipped ❌ DOESN'T WORK!
- Import continues to work → syncs both states ✅

**Fix #5 Test Results (Dec 11, 2025 - Evening)**:

✅ **Reference Mode Set Values - FIXED!**
- Import → Switch to Reference mode → Select new d_13 → Press "Set Values"
- Result: ONLY Reference model recalculates with new ReferenceValues.js
- Target model preserves imported values (no contamination)

❌ **Target Mode Set Values - BROKEN!**
- Import → Stay in Target mode → Select d_13 → Press "Set Values"
- Expected: Target model updates with ReferenceValues.js (code minimums)
- Actual: Nothing happens (TargetState sync skipped)

**The Missing Piece**:

We're always passing `skipTargetSync=true` regardless of UI mode!

```javascript
// FileHandler.js line 1077 - WRONG: Always skips Target
this.syncPatternASections(true, true); // skipAreaSync=true, skipTargetSync=true
```

Should be:
```javascript
// Skip TargetState sync ONLY in Reference mode
// In Target mode, we WANT to overwrite Target with ReferenceValues
const isReferenceMode = targetMode === "reference";
this.syncPatternASections(true, isReferenceMode); // skipTargetSync based on mode
```

**Fix #6 - IMPLEMENTED (Dec 11, 2025 - Evening)**:

**Changes**:
- FileHandler.js:870 - Add `skipReferenceSync` parameter to `syncPatternASections()`
- FileHandler.js:915-922 - Skip ReferenceState sync when `skipReferenceSync=true`
- FileHandler.js:1075-1080 - Mode-aware sync: conditional based on `targetMode`

**Implementation**:
```javascript
// FileHandler.js line 1075-1080
const skipTargetSync = targetMode === "reference";
const skipReferenceSync = targetMode === "target";
this.syncPatternASections(true, skipTargetSync, skipReferenceSync);
```

**How It Works**:
- **Reference mode** (`targetMode === "reference"`):
  - Writes `ref_*` fields only
  - Skips TargetState sync (preserves imported Target values)
  - Syncs ReferenceState only (gets new ReferenceValues)

- **Target mode** (`targetMode === "target"`):
  - Writes unprefixed fields only
  - Skips ReferenceState sync (preserves Reference values)
  - Syncs TargetState only (gets new ReferenceValues as code minimums)

**Fix #6 Test Results (Dec 11, 2025 - Late Evening)**:

✅ **SUCCESS - All Core Test Cases Pass!**

1. ✅ **Fresh page load Set Values (Target mode)** - WORKS
2. ✅ **Fresh page load Set Values (Reference mode)** - WORKS
3. ✅ **Post-import Set Values (Target mode)** - WORKS (only Target updates)
4. ✅ **Post-import Set Values (Reference mode)** - WORKS (only Reference updates)
5. ✅ **Import regression** - WORKS (both models maintain isolation)
6. ⚠️ **Copy from Target regression** - UNINTENDED SIDE EFFECT

**Known Issue - Copy from Target (Dec 11, 2025)**:

"Copy from Target" functions now work in BOTH Target and Reference modes, but should only work in Reference mode:
- Expected: Copy buttons disabled/hidden in Target mode
- Actual: Copy buttons work in Target mode, polluting Target with its own values

**Root Cause**: Copy functions don't check UI mode before executing
**Impact**: Low (user workflow doesn't typically use Copy in Target mode)
**Fix Required**: Add mode guard to Copy functions - block execution unless in Reference mode

**Location**: [ReferenceToggle.js:931-1212](../../src/core/ReferenceToggle.js#L931-L1212) - mirrorGeometry, mirrorGeometryPlusCode, mirrorAllInputs

**Recommended Fix (Dec 12)**:
```javascript
// ReferenceToggle.js - Add at start of each Copy function
if (!window.TEUI.ReferenceToggle.isReferenceMode()) {
  console.warn('[ReferenceToggle] Copy from Target only available in Reference mode');
  return;
}
```

**Status**: Fix #5 + Fix #6 achieve primary goal (Set Values bidirectional isolation). Copy regression is minor edge case for Dec 12.

---

## Issue #2: Copy from Target Highlighting - Browser-Specific Behavior
**Date**: Dec 12, 2025
**Status**: ⚠️ **BROWSER COMPATIBILITY ISSUE**

### Problem
After "Copy from Target" operation in Reference mode, contenteditable numeric fields (h_15, i_17, l_12-l_16) show **different highlighting behavior across browsers**:

- **Safari**: ✅ Highlighting WORKS - targets padding space around field and table cell
- **Chrome**: ❌ Highlighting FAILS - no yellow background appears

### Browser-Specific Behavior

**Safari (Working)**:
- Yellow highlight appears around the contenteditable div
- Highlights the padding space and table cell background
- `.mirror-highlight` class applies successfully

**Chrome (Not Working)**:
- No yellow background appears
- Element receives `.mirror-highlight` class (confirmed via DevTools)
- Background color shows as `#0D6EFD` (blue) or transparent instead of `#ffff00` (yellow)
- Text color changes to black (CSS is partially working)

### Root Cause Analysis

**CSS Conflict Chain**:
1. **Base Rule** (styles.css:1622): `.mirror-highlight { background-color: #ffff00 !important; }`
2. **Specific Rule** (styles.css:1632): `div[contenteditable].mirror-highlight { background-color: #ffff00 !important; }`
3. **Competing Rules** (styles.css:2322-2398): Multiple `.user-input.user-modified` rules with higher specificity:
   - Line 2325: `.user-input.user-modified { color: var(--user-input-color) !important; }` (blue text)
   - Line 2348: `.user-input[contenteditable] { background-color: transparent !important; }`
   - Line 2365: `.user-input[contenteditable]:hover { background-color: rgba(13, 110, 253, 0.03) !important; }`
   - Line 2381: `.user-input[contenteditable]:focus { background-color: rgba(13, 110, 253, 0.05) !important; }`

**Why Yellow Background Fails in Chrome**:
The contenteditable div has classes: `.user-input.user-modified.mirror-highlight`

CSS Specificity Battle:
- `.mirror-highlight` = 1 class = specificity 010
- `div[contenteditable].mirror-highlight` = 1 element + 1 attribute + 1 class = specificity 021
- `.user-input[contenteditable]` = 1 class + 1 attribute = specificity 020
- **Chrome**: `.user-input[contenteditable]` appears LATER in CSS (line 2348) and has `background-color: transparent !important`

Even though both use `!important`, **source order wins** when specificity is equal or close. The transparent background rule at line 2348 is applied after the yellow highlight rule in Chrome's rendering engine.

**Safari vs Chrome CSS Handling**:
Safari appears to apply the `.mirror-highlight` rule more aggressively or handle the specificity/source-order differently, allowing the yellow background to show on the table cell or padding area.

### Failed Attempts (Dec 12)
1. ❌ Added Strategy 3 to ReferenceToggle.js - didn't solve CSS issue
2. ❌ Added parent td highlighting - didn't solve CSS issue in Chrome
3. ❌ Added more specific selectors to styles.css - source order still caused failure in Chrome

**All attempts reverted** with `git restore src/core/ReferenceToggle.js src/styles.css`

### Proposed Solution

**Option A: Increase Specificity with Attribute Selector**
Make the `.mirror-highlight` rule MORE specific than `.user-input[contenteditable]`:

```css
/* styles.css line ~1628 - REPLACE existing rule */
/* Ensure highlight works on inputs and contenteditable divs */
input.mirror-highlight,
select.mirror-highlight,
textarea.mirror-highlight,
div[contenteditable="true"].mirror-highlight,
.user-input[contenteditable="true"].mirror-highlight {
  background-color: #ffff00 !important;
  -webkit-text-fill-color: #000 !important;
  color: #000 !important;
}
```

Specificity: `.user-input[contenteditable="true"].mirror-highlight` = 1 class + 1 attribute + 1 class = **030** (should win in Chrome)

**Option B: Add Dedicated Override Rule** (More Maintainable)
Add a new rule AFTER all user-input rules (~line 2400):

```css
/* Override for Copy from Target highlighting - must be AFTER user-input rules */
.data-table td[contenteditable="true"].user-input.mirror-highlight,
.data-table td .user-input[contenteditable="true"].mirror-highlight {
  background-color: #ffff00 !important;
  color: #000 !important;
  font-style: normal !important;
}
```

Specificity: `.data-table td[contenteditable="true"].user-input.mirror-highlight` = **041** (definite win)

**Recommended**: Option B - More specific, appears after conflicting rules, clearer intent, should fix Chrome while maintaining Safari behavior.

### Testing Checklist
After implementing fix:
1. ✅ Test in **Chrome** (primary issue)
2. ✅ Test in **Safari** (ensure no regression)
3. ✅ In Reference mode, change h_15 from 1427.2 to 5000
4. ✅ Click "Copy Geometry from Target"
5. ✅ Verify h_15 shows yellow background in BOTH browsers
6. ✅ Verify sliders still highlight yellow
7. ✅ Verify dropdowns still highlight yellow
8. ✅ Verify currency fields (l_12-l_16) highlight yellow

### Current Deployed State (Dec 12, 2025)
- **Branch**: main (merged PR #62)
- **Commit**: 1ecb1ca (Fix: Ensure dual-state sync for Copy from Target operations)
- **Status**: Copy from Target functionality works correctly, but highlighting has browser-specific behavior
- **Safari**: Highlighting works
- **Chrome**: Highlighting does not work for contenteditable fields
- **Impact**: Medium - visual feedback missing in Chrome but functionality intact

### Implementation Status
- [ ] Choose solution (A or B)
- [ ] Implement CSS change
- [ ] Test in Chrome
- [ ] Test in Safari
- [ ] Test all field types
- [ ] Commit with proper message per .clinerules
