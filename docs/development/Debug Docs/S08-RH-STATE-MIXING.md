# S08 RH State Mixing Investigation (i_59, l_20, l_21)

**Status**: UNSOLVED after 2 days of investigation
**Priority**: CRITICAL - Blocks accurate Target vs Reference comparisons
**Date Range**: November 3-4, 2025
**Branch**: investigate-i59-from-nov3

---

## Problem Statement

When changing **i_59** (Relative Humidity %), **l_20** (ACH Heating), or **l_21** (ACH Cooling) in **Target mode** in Section 08:

### Expected Behavior
- Target value changes (e.g., i_59: 45% → 70%)
- Target calculations update (h_10 changes) ✅
- Reference calculations remain unchanged (e_10 stays constant) ✅
- ref_i_59, ref_l_20, ref_l_21 remain at their original Reference values ✅

### Actual Behavior
- Target value changes correctly ✅
- **Target calculations update using the NEW value** ✅
- **Reference calculations ALSO update using the NEW Target value** ❌ CONTAMINATION
- **ref_i_59 stays constant** ✅ (not the issue)
- **BOTH e_10 AND h_10 change** ❌ WRONG

### Symptom Summary
**Something is reading unprefixed values for BOTH Target AND Reference calculations**, ignoring the ref_prefixed values entirely.

---

## Critical Evidence

### 1. Dual Publication Confirmed Working
All three fields correctly publish BOTH prefixed and unprefixed values:

**Section08.js (lines 224-226)**:
```javascript
// i_59 (RH%) - Published by both Target and Reference engines
window.TEUI.StateManager.setValue("i_59", newValue, "input");
window.TEUI.StateManager.setValue("ref_i_59", newValue, "input");
```

**Section08.js (lines 185-194)**:
```javascript
// l_20 (ACH Heating) and l_21 (ACH Cooling)
window.TEUI.StateManager.setValue("l_20", l_20_value, "calculated");
window.TEUI.StateManager.setValue("l_21", l_21_value, "calculated");
window.TEUI.StateManager.setValue("ref_l_20", ref_l_20_value, "calculated");
window.TEUI.StateManager.setValue("ref_l_21", ref_l_21_value, "calculated");
```

### 2. Values ARE Being Published to StateManager
Console logs confirm both values exist in StateManager:
- `i_59 = 70%` (Target)
- `ref_i_59 = 45%` (Reference)
- Both logged in Logs.md after changes

### 3. The Contamination Path

**Trace Script Results (VENT-TRACE-SCRIPT.js)**:
- Changed i_59 from 45% → 70% in Target mode
- Result: `ref_i_63` changed from 2080 → 4380 (Reference value contaminated!)
- Calculation: 4380 / 365 = 12 hours/day = **TARGET g_63 value being used for Reference**

**Call Stack**:
```
i_59 change → Cooling.js calculates ventilation →
ref_h_120 (Reference vent rate) changes →
ref_d_136 (Reference cooling) changes →
ref_j_32 (Reference energy) changes →
e_10 (Reference TEUI total) changes
```

### 4. Section Totals Evidence
When i_59 changes in Target mode:
- **h_10** (Target total): 182.2 → 197.7 ✅ CORRECT
- **e_10** (Reference total): 197.7 → 199.5 ❌ WRONG (should stay constant)

### 5. Reference Mode Changes Do Nothing
**Critical Symptom**: Changing i_59 slider in **Reference mode** produces NO changes at all in e_10.
- Expected: e_10 should change, h_10 should stay constant
- Actual: Nothing changes
- **Conclusion**: Reference engine is not reading ref_i_59 at all

---

## What We've Tried (All Failed)

### ❌ Attempt 1: Remove S08 Self-Listeners (Nov 3)
**Hypothesis**: S08 listening to its own ref_i_59 caused cross-contamination
**Action**: Removed ref_i_59 self-listener from Section08.js
**Result**: No change - contamination persists
**Why It Failed**: Self-listening wasn't the issue

### ❌ Attempt 2: Fix Cooling.js Dual-Engine Pattern (Nov 4)
**Hypothesis**: Running both engines on every change caused contamination
**Action**: Modified Cooling.js to only run Target engine for Target inputs
**Result**: Broke calculations, immediately reverted
**Why It Failed**: Dual-engine pattern is INTENTIONAL. Both must run to keep both columns updated. The bug is in contaminated READS, not in running both engines.

### ❌ Attempt 3: Remove Anti-Pattern 7 Self-Listeners (Nov 4)
**Hypothesis**: Other sections listening to their own outputs caused issues
**Action**: Removed self-listeners from Section03.js, Section08.js
**Result**: No effect on i_59 contamination
**Why It Failed**: Not related to the RH contamination issue

### ❌ Attempt 4: Add calculateAll() to FieldManager (Nov 4)
**Hypothesis**: Sections needed to recalculate after slider changes
**Action**: Added calculateAll() call after ModeManager routing in FieldManager.js
**Result**: ⚠️ Improved consistency but didn't fix contamination
**Why It Failed**: Calculation sequencing wasn't the root cause

### ❌ Attempt 5: Fix S09 to Read from StateManager Instead of Local State (Nov 4)
**Hypothesis**: S09 reading d_63/g_63 from local ReferenceState (initialized with Target defaults) caused ref_i_63 contamination
**Action**: Changed calculateModel() to read d_63/g_63 from StateManager with proper prefixing
**Result**: **BROKE S09 CALCULATIONS** - h_10 drifts from 93.7 → 91.6, only corrects when toggling cooling off/on (cooling bump). **DID NOT FIX i_59 contamination at all.**
**Why It Failed**: Local state reads are correct for section calculations. S09 needs to read user inputs from local state for its own calculations, then publish derived values like i_63 to StateManager. The issue is elsewhere.
**Status**: REVERTED

**Important Note**: The original S09 implementation is correct. The "cooling bump" (toggling d_116 off/on) fixing the drift is a critical clue - it suggests **Cooling.js is reading contaminated intermediate values** during its calculation pipeline, and a full recalculation chain corrects the state. The bug is NOT in S09's calculation logic, but in how Cooling.js reads values during multi-stage calculations.

### ❌ Attempt 6: Isolate Event Listeners (Nov 4)
**Hypothesis**: The dual-engine pattern, where both Target and Reference engines run on any input change, was causing a race condition or state overwrite.
**Action**: Modified the `StateManager` listeners in `Cooling.js` so that a change to a Target value (e.g., `i_59`) would only trigger the Target engine (`calculateStage1("target")`), and a change to a Reference value (`ref_i_59`) would only trigger the Reference engine.
**Result**: No change. The state mixing persisted exactly as before.
**Why It Failed**: This invalidated a core architectural principle: both columns must remain up-to-date. The issue is not that both engines run, but what values they read when they run. The `getModeAwareValue` function should handle this, but it appears to be failing.
**Status**: REVERTED

### ❌ Attempt 7: Refactor Calculation Functions (Nov 4)
**Hypothesis**: Calculation functions like `calculateAtmosphericValues` were performing redundant, mode-unaware reads from `StateManager`, overwriting the correctly read values from `calculateStage1`.
**Action**: Refactored `calculateAtmosphericValues` and `calculateWetBulbTemperature` to remove all `StateManager` reads. They were modified to rely exclusively on the `stateObj` passed to them, which is populated in `calculateStage1` with mode-aware values.
**Result**: No change. The state mixing persisted.
**Why It Failed**: While this was a sound architectural improvement, it did not address the root cause. The contamination is happening before these functions are even called, suggesting the initial read in `calculateStage1` is where the problem lies, despite appearing correct.
**Status**: REVERTED

---

## Current Hypothesis: Cooling.js Contaminated Reads

**Strong Suspicion**: Cooling.js is reading **unprefixed** values for BOTH Target AND Reference calculations, completely ignoring ref_prefixed values.

### Evidence Supporting This Theory

1. **i_59, l_20, l_21 are all cooling-related inputs** - all three exhibit identical contamination behavior
2. **ref_i_63 contamination** (2080 → 4380) suggests ventilation calculations using wrong values
3. **"Cooling bump" fixes drift in both scenarios**:
   - Reverted S09: h_10 drifts, corrects when toggling d_116 (No Cooling → Cooling)
   - Modified S09: h_10 drifts, corrects when toggling d_116 (No Cooling → Cooling)
   - **Implication**: The drift is caused by Cooling.js reading contaminated intermediate values during its multi-stage calculation pipeline
4. **S08 Reference mode changes to i_59 do nothing** - suggests Reference engine not reading ref_i_59 at all

### What to Check in Cooling.js

Look for these patterns in `/src/core/Cooling.js`:

```javascript
// ❌ WRONG (suspected current behavior):
function calculateStage1(mode) {
  const rh = StateManager.getValue("i_59"); // Always reads unprefixed!
  const achHeating = StateManager.getValue("l_20"); // Always reads unprefixed!
  const achCooling = StateManager.getValue("l_21"); // Always reads unprefixed!
  // ... calculations affect BOTH Target and Reference
}

// ✅ CORRECT (what it should be):
function calculateStage1(mode) {
  const rh = StateManager.getValue(mode === "reference" ? "ref_i_59" : "i_59");
  const achHeating = StateManager.getValue(mode === "reference" ? "ref_l_20" : "l_20");
  const achCooling = StateManager.getValue(mode === "reference" ? "ref_l_21" : "l_21");
  // ... mode-aware reading
}
```

---

## Dual-Engine Pattern (CRITICAL - DO NOT BREAK)

**Pattern**: BOTH Target and Reference engines MUST calculate on ANY input change.

**Why**: Sections can be in different modes. When Target i_59 changes:
- Target column shows new calculations with new i_59 ✅
- Reference column must stay constant using ref_i_59 ✅
- Both engines run, but each reads its own prefixed values ✅

**DO NOT** try to "optimize" by only running one engine. The fix is ensuring **mode-aware reads**, not preventing dual execution.

---

## Key Files and Investigation Points

### Cooling.js ⚠️ PRIMARY SUSPECT
- **Path**: `/src/core/Cooling.js`
- **Lines to Investigate**:
  - Lines 919-943: Target listeners (i_59, l_20, l_21)
  - Lines 1017-1059: Reference listeners (ref_i_59, ref_l_20, ref_l_21)
  - Lines 1070-1265: `calculateStage1()` function
  - Lines 1270-1440: `calculateStage2()` function
- **Suspected Issue**: Reading unprefixed values regardless of mode parameter
- **What to Search For**:
  - `StateManager.getValue("i_59")` without mode-aware prefix
  - `StateManager.getValue("l_20")` without mode-aware prefix
  - `StateManager.getValue("l_21")` without mode-aware prefix
  - Any hardcoded unprefixed reads in calculation functions

### Section08.js ✅ VERIFIED WORKING
- **Path**: `/src/sections/Section08.js`
- **Publication**: Lines 185-194 (l_20/l_21), Lines 224-226 (i_59)
- **Status**: Correctly publishes both prefixed and unprefixed values

### Section13.js ⚠️ DOWNSTREAM VICTIM
- **Path**: `/src/sections/Section13.js`
- **Lines**: 2603-2652 (calculateVentilationRates)
- **Reads**: ref_i_63 for Reference ventilation calculations
- **Status**: May be reading contaminated ref_i_63 from S09

### Section09.js ⚠️ VENTILATION CONTAMINATION
- **Path**: `/src/sections/Section09.js`
- **Lines**: 1910-1918 (publishes ref_i_63)
- **Issue**: Publishes ref_i_63 = g_63 * 365, where g_63 comes from local state
- **Local State Initialization**: Lines 129-130 initialize d_63 and g_63 from TARGET defaults
- **Why This Matters**: ref_i_63 = 4380 instead of 2080 because it uses Target g_63=12 instead of Reference g_63
- **Note**: Changing S09 to read from StateManager breaks calculations. The issue is NOT here.

---

## Diagnostic Scripts

### I59-TRACE-SCRIPT.js
**Purpose**: Intercepts StateManager reads/writes for i_59, ref_i_59, e_10, h_10
**Location**: `/docs/development/I59-TRACE-SCRIPT.js`

**Usage**:
1. Run script in console before changes
2. Run `TEUI.checkI59State()` to see baseline
3. Change i_59 slider in Target mode
4. Watch for RED logs (e_10 changes = contamination)
5. Run `TEUI.checkI59State()` again to compare

**Key Output**:
- Yellow: i_59 WRITE
- Green: i_59 READ
- Blue: h_10 WRITE (should happen)
- Red: e_10 WRITE (should NOT happen)

### VENT-TRACE-SCRIPT.js
**Purpose**: Tracks ventilation-related fields (ref_d_63, ref_i_63, ref_h_120, etc.)
**Location**: `/docs/development/VENT-TRACE-SCRIPT.js`

**Usage**:
1. Run script in console
2. Run `TEUI.checkVentInputs()` to see baseline
3. Change i_59 slider
4. Watch for ORANGE logs showing which ref_ values change
5. Run `TEUI.checkVentInputs()` again

**Key Finding**: ref_i_63 changes from 2080 → 4380 when i_59 changes

---

## Testing Instructions

### How to Reproduce Bug

1. **Fresh Start**: Clear browser cache, hard refresh
2. **Import Excel**: Load reference Excel file
3. **Verify Baseline**: Check S01 - e_10 should match Excel Reference TEUI
4. **Switch to Target Mode**: Ensure S08 is in Target mode
5. **Change i_59**: Move slider from 45% → 70%
6. **Observe**:
   - h_10 changes ✅ (expected)
   - **e_10 changes** ❌ (BUG - should stay constant)

### How to Verify Fix

1. Perform steps 1-5 above
2. **Expected After Fix**:
   - h_10 changes ✅
   - **e_10 stays constant** ✅
   - ref_i_59 stays at original Reference value ✅
3. **Switch to Reference Mode in S08**
4. **Change ref_i_59**: Move slider from 45% → 50%
5. **Expected After Fix**:
   - e_10 changes ✅
   - **h_10 stays constant** ✅
   - **Currently**: Nothing happens at all ❌

---

## Technical Context

### StateManager Publication Pattern
```javascript
// StateManager only fires listeners when values ACTUALLY change
if (field.value === value && field.state === state) {
  return false; // No notification if unchanged
}
```

### Mode-Aware Reading Pattern
```javascript
// ✅ CORRECT: Read with proper prefix based on mode
const value = StateManager.getValue(isReference ? "ref_fieldId" : "fieldId");
```

### Pattern A Dual-State Architecture
- **TargetState**: Local state cache for Target calculations
- **ReferenceState**: Local state cache for Reference calculations
- **StateManager**: Global state for cross-section communication
- **Rule**: For user inputs within a section, read from local state. For cross-section dependencies, read from StateManager with mode-aware prefixing.

---

## What NOT to Try Again

1. ❌ Don't remove dual-engine execution in Cooling.js
2. ❌ Don't modify S09 to read user inputs from StateManager instead of local state
3. ❌ Don't add more self-listeners to sections
4. ❌ Don't try to "optimize" by preventing Reference calculations when Target changes

---

## Next Steps for Investigation

### 1. Audit Cooling.js calculateStage1() and calculateStage2()

**Search for hardcoded unprefixed reads**:
```bash
cd src/core
grep -n 'getValue("i_59")' Cooling.js
grep -n 'getValue("l_20")' Cooling.js
grep -n 'getValue("l_21")' Cooling.js
```

**What to look for**:
- Any `StateManager.getValue("i_59")` that doesn't check mode
- Any `StateManager.getValue("l_20")` that doesn't check mode
- Any `StateManager.getValue("l_21")` that doesn't check mode

**Expected pattern** (what we should find):
```javascript
const rh = StateManager.getValue(mode === "reference" ? "ref_i_59" : "i_59");
```

**Contamination pattern** (what we suspect exists):
```javascript
const rh = StateManager.getValue("i_59"); // Always unprefixed!
```

### 2. Check Cooling.js Listeners

**Lines 919-943**: Target listeners
**Lines 1017-1059**: Reference listeners

**Verify**:
- Do Target listeners pass `"target"` mode parameter?
- Do Reference listeners pass `"reference"` mode parameter?
- Do the calculation functions actually use the mode parameter?

### 3. Add Debug Logging to Cooling.js

**Temporary diagnostic code**:
```javascript
function calculateStage1(mode) {
  console.log(`[Cooling] calculateStage1 called with mode: ${mode}`);

  const i_59_fieldId = mode === "reference" ? "ref_i_59" : "i_59";
  const i_59_value = StateManager.getValue(i_59_fieldId);
  console.log(`[Cooling] Reading ${i_59_fieldId} = ${i_59_value}`);

  // ... rest of calculation
}
```

**Run test**:
1. Change i_59 in Target mode from 45% → 70%
2. Check logs - should see:
   ```
   [Cooling] calculateStage1 called with mode: target
   [Cooling] Reading i_59 = 70
   [Cooling] calculateStage1 called with mode: reference
   [Cooling] Reading ref_i_59 = 45  // Should be unchanged!
   ```

### 4. Test Hypothesis

**If logs show**:
```
[Cooling] calculateStage1 called with mode: target
[Cooling] Reading i_59 = 70
[Cooling] calculateStage1 called with mode: reference
[Cooling] Reading i_59 = 70  // ❌ WRONG - reading unprefixed!
```

**Then the fix is**: Ensure all reads in calculateStage1/2 use mode-aware prefixing.

---

## Previous Investigation History (Nov 3, 2025)

### Nov 3 Investigation - Shared State Contamination
Initial investigation on Nov 3 identified shared state contamination in Cooling.js listeners:

**Root Cause Found (Nov 3)**:
```javascript
// ❌ BEFORE (Contamination Pattern):
sm.addListener("i_59", function (newValue) {
  state.indoorRH = parseFloat(newValue) / 100; // Sets SHARED state from Target value
  calculateStage1("target");   // Uses contaminated state.indoorRH
  calculateStage1("reference"); // ALSO uses contaminated state.indoorRH (wrong!)
});
```

**Fix Applied (Nov 3)**:
Removed shared state pre-setting from listeners:
```javascript
// ✅ AFTER (lines 888-903):
sm.addListener("i_59", function (newValue) {
  // Don't pre-set shared state.indoorRH - let each engine read its own value
  calculateStage1("target");   // Will read i_59 via getModeAwareValue
  calculateStage1("reference"); // Will read ref_i_59 via getModeAwareValue
});
```

**Verification (Nov 3)**:
Console logs confirmed state isolation was working:
```
[StateManager READ] i_59 = "65"     ✅ Target engine reads new value
[StateManager READ] ref_i_59 = "45" ✅ Reference engine reads UNCHANGED value
```

**Nov 3 Conclusion**: Fix worked at Cooling.js level, but S01 e_10 contamination persisted, suggesting downstream issue.

### Why Nov 3 Fix Didn't Resolve Current Issue
The Nov 3 fix addressed shared state contamination in listeners, but the current issue (Nov 4) appears to be deeper in the calculation functions themselves. The diagnostic scripts now show that Reference mode changes produce NO changes at all, suggesting the Reference engine isn't reading ref_i_59 anywhere in the calculation pipeline.

---

## Summary

After 2 days of investigation, we know:
- ✅ S08 correctly publishes both i_59 AND ref_i_59
- ✅ StateManager correctly stores both values
- ✅ Dual-engine pattern is correct and should not be changed
- ❌ Something (likely Cooling.js calculation functions) is reading unprefixed values for BOTH engines
- ❌ Reference calculations are using Target values instead of Reference values
- ❌ Reference mode changes to i_59 do nothing at all
- ❌ This affects e_10 (Reference TEUI total) incorrectly

**The fix is NOT in publication, it's in READS within the calculation functions.**

**Strong Lead**: Cooling.js `calculateStage1()` and `calculateStage2()` likely contain hardcoded unprefixed reads that ignore the mode parameter.
