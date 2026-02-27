#### CRITICAL BUG: State Mixing After S18 Decarbonize - S13 d_113 Field

**Discovered**: 2025-11-27
**Updated**: 2025-11-29 - Isolated to S13 d_113 field
**Priority**: HIGH
**Affects**: Target model calculations after S18 Decarbonize + Reference mode toggle
**Root Cause**: S18 Decarbonize value-setting for S13 d_113 (Heating System) field

---

## BREAKTHROUGH: Bug Isolated to ONE Field

After extensive testing with multiple Excel files:
- ✅ Most Gas→Heatpump imports + Decarbonize work perfectly
- ❌ ONE specific file exhibits state mixing
- 🎯 **Root cause**: The `d_113` (Primary Heating System) field value in that specific file

**The smoking gun**: When that file's d_113 value is imported, then S18 Decarbonize changes it to "Heatpump", the state mixing bug occurs. With other files' d_113 values, no bug!

---

## Summary

**Architecture Context**:
- **S01**: State-agnostic (always displays both Target and Reference values side-by-side)
- **S07**: Dual-mode Pattern A section (SHW system - NOT THE ISSUE)
- **S13**: Dual-mode Pattern A section (Heating/Cooling systems - **ISSUE LOCATION**)
- **S18**: State-agnostic (parallel coordinates graph displays both Target and Reference lines simultaneously)

**Trigger Pattern**:
1. Import **specific** Excel file with Gas heating system (sets `d_113="Gas"`, `ref_d_113="Gas"`)
2. Click S18 "Decarbonize" button (converts Target to `d_113="Heatpump"`, `f_113="12.5"`)
3. Toggle global mode to Reference
4. Toggle back to Target mode
5. **BUG**: Target `h_10` value oscillates between 248.9 and 167.0 on each toggle

**Key Discovery**:
- Bug does NOT occur with other Gas building files!
- Bug is specific to how ONE file's d_113 data interacts with S18 Decarbonize
- S07 fields (d_51, d_52) are NOT the issue - they work correctly in all files
- S13 fields (d_113, f_113, j_115) are the issue

---

## The Specific Bug Pattern

### S13 Field Structure

**Heating System Selector**: `d_113` / `ref_d_113`
- Values: "Gas", "Oil", "Heatpump", "Electric", etc.

**Conditional Efficiency Fields** (selected based on d_113):
- `f_113`: HSPF for Heatpump/Electric systems (e.g., 12.5)
- `j_115`: AFUE for Gas/Oil systems (e.g., 0.90)

**Similar to S07 pattern**:
- d_51 selector determines whether to use d_52 (COP) or k_52 (AFUE)
- d_113 selector determines whether to use f_113 (HSPF) or j_115 (AFUE)

### What S18 Decarbonize Does

When converting heating from Gas → Heatpump:

```javascript
// Step 1: Set fuel type to Heatpump
if (sect13?.TargetState) {
  sect13.TargetState.setValue("d_113", "Heatpump");
}
stateManager.setValue("d_113", "Heatpump", "user-modified");

// Step 2: Let section recalculate
if (sect13?.calculateAll) {
  sect13.calculateAll();
}

// Step 3: Set efficiency (f_113 is now the active field for Heatpump)
if (sect13?.TargetState) {
  sect13.TargetState.setValue("f_113", "12.5");
}
stateManager.setValue("f_113", "12.5", "user-modified");
```

**The issue**: Something about how this specific file's d_113 value is stored/handled causes the Target model to use Reference efficiency values during subsequent calculations.

---

## 🔥 BREAKTHROUGH: Field Lock Issue Identified (2025-11-29)

**Root Cause Hypothesis**: j_115 field remains locked/non-editable after S18 Decarbonize

### The Problem Sequence

1. **Import file** with d_113="Gas" and j_115=0.90
   - After import, j_115 field is **locked/non-editable** (user cannot change it)
   - This is correct for the initial import state

2. **Manual d_113 change works correctly**:
   - User manually changes d_113 dropdown from "Heatpump" to "Gas" in S13 UI
   - Dropdown change event fires
   - j_115 field **becomes editable** ✅ (correct behavior)
   - f_113 field becomes disabled
   - This is the expected UI behavior

3. **S18 Decarbonize d_113 change fails**:
   - S18 uses `stateManager.setValue("d_113", "Heatpump")` to bypass UI
   - **No dropdown change event fires** ❌
   - j_115 field **remains locked/non-editable** ❌ (BUG!)
   - f_113 field does not become properly enabled
   - State says d_113="Heatpump" but UI field lock states haven't updated

### Why This Causes State Mixing

**The calculation error cascade**:

1. S18 Decarbonize sets d_113="Heatpump" and f_113="12.5" in StateManager ✅
2. But j_115 field remains locked/disabled in the UI ❌
3. When calculations run and check which efficiency field to use:
   - d_113="Heatpump" → should use f_113 (HSPF 12.5, COP 3.66)
   - But f_113 field is still disabled/locked ❌
   - Falls back to reading j_115=0.90 (Gas AFUE) ❌
4. Result: Target model calculates with Gas efficiency instead of Heatpump efficiency
5. This manifests as:
   - h_10 = 167.0 instead of 248.9 (wrong carbon intensity)
   - j_32 = 1.86M instead of 2.78M (wrong energy consumption)

**Key insight**: The bug is not about StateManager values being wrong. The StateManager has the correct values! The bug is that **UI field lock states** (contenteditable/disabled attributes) don't update when S18 writes directly to StateManager, causing calculation logic to read from the wrong efficiency field.

### Comparison: Manual vs S18 Changes

| Action | d_113 Write Method | Dropdown Event? | j_115 Lock State | Result |
|--------|-------------------|-----------------|------------------|--------|
| **User manual edit** | Dropdown change → event handler → StateManager | ✅ Fires | ✅ Updates correctly | ✅ Works |
| **S18 Decarbonize** | S18 → StateManager.setValue() directly | ❌ Bypassed | ❌ Stuck in old state | ❌ Bug |

### The Fix Direction

**S18 Decarbonize needs to trigger UI field lock updates** after setValue():

Option A: Trigger the dropdown change event programmatically
Option B: Call S13's field enable/disable logic directly ✅ **IMPLEMENTED**
Option C: Have StateManager notify UI of changes (observer pattern)

---

## 🔧 PARTIAL FIX IMPLEMENTED (2025-11-29)

**Commit**: `b9d3dd7` - "Fix: S18 Decarbonize now triggers field lock updates for S07/S13"

**What was fixed**: S18 Decarbonize now calls field lock update functions after setValue()

```javascript
// ParallelCoordinates.js - S07 SHW System
stateManager.setValue("d_51", "Heatpump", "user-modified");

// 🔥 NEW: Update field lock states
const currentWaterMethod = stateManager.getValue("d_49") || "User Defined";
if (sect07?.updateSection7Visibility) {
  sect07.updateSection7Visibility(currentWaterMethod, "Heatpump");
}

// ParallelCoordinates.js - S13 Heating System
stateManager.setValue("d_113", "Heatpump", "user-modified");

// 🔥 NEW: Update field lock states
if (sect13?.handleHeatingSystemChangeForGhosting) {
  sect13.handleHeatingSystemChangeForGhosting("Heatpump");
}
```

**Result**:
- ✅ S18 Decarbonize button now properly enables/disables fields
- ❌ **BUG STILL OCCURS** - Import workflow has same issue!

---

## 🚨 REMAINING ISSUE: Import Field Lock Bug

**New Discovery (2025-11-29)**: The bug persists because **Excel/CSV import has the same field lock issue as S18 Decarbonize had**.

### The Import Problem

**Scenario**:
1. Default state: d_113="Heatpump", f_113 enabled, j_115 disabled ✅
2. Import Excel with d_113="Gas", j_115=0.90
3. FileHandler.updateStateFromImportData() calls:
   ```javascript
   stateManager.setValue("d_113", "Gas", "imported");
   stateManager.setValue("j_115", "0.90", "imported");
   ```
4. **BUG**: j_115 field remains **locked/disabled** after import ❌
5. User cannot edit j_115 even though d_113="Gas"
6. S18 Decarbonize converts d_113 back to "Heatpump"
7. Field lock states are still wrong from import → state mixing occurs

**Root Cause**: FileHandler.updateStateFromImportData() writes values directly to StateManager without triggering S13's `handleHeatingSystemChangeForGhosting()` function.

### What FileHandler Needs to Do

**After importing d_113 (both Target and Reference modes)**:

```javascript
// In FileHandler.updateStateFromImportData() or syncPatternASections()

// For S07 (SHW system)
const d_51 = stateManager.getValue("d_51");
const d_49 = stateManager.getValue("d_49") || "User Defined";
if (sect07?.updateSection7Visibility) {
  sect07.updateSection7Visibility(d_49, d_51);
}

// For S13 (Heating system) - TARGET mode
const d_113 = stateManager.getValue("d_113");
if (sect13?.handleHeatingSystemChangeForGhosting) {
  sect13.handleHeatingSystemChangeForGhosting(d_113);
}

// For S13 (Heating system) - REFERENCE mode
// Need to trigger field lock updates for Reference mode too!
const ref_d_113 = stateManager.getValue("ref_d_113");
if (sect13?.handleHeatingSystemChangeForGhosting) {
  // Question: Does handleHeatingSystemChangeForGhosting() work for Reference mode?
  // Or does it only update the current mode's field locks?
  // May need a separate call or mode switch before calling
}
```

### ✅ COMPLETE FIX IMPLEMENTED (2025-11-29)

**Location**: `FileHandler.syncPatternASections()` - PHASE 2.5 (after Pattern A sync, before S11 window sync)

**Implementation**:
```javascript
// FileHandler.js - Line ~899-935

// Update S07 field locks based on imported d_51 (SHW system)
const sect07 = window.TEUI?.SectionModules?.sect07;
if (sect07?.updateSection7Visibility) {
  const d_51 = this.stateManager.getValue("d_51");
  const d_49 = this.stateManager.getValue("d_49") || "User Defined";
  if (d_51) {
    sect07.updateSection7Visibility(d_49, d_51);
  }
}

// Update S13 field locks based on imported d_113 (Heating system)
const sect13 = window.TEUI?.SectionModules?.sect13;
if (sect13?.handleHeatingSystemChangeForGhosting) {
  const d_113 = this.stateManager.getValue("d_113");
  if (d_113) {
    sect13.handleHeatingSystemChangeForGhosting(d_113);
  }
}
```

**Key Insights**:
1. ✅ `handleHeatingSystemChangeForGhosting()` is **NOT mode-aware**
   - It directly manipulates DOM elements by `data-field-id`
   - These DOM elements are **shared** between Target and Reference modes
   - Only need to call once (uses Target d_113 value, updates shared fields)

2. ✅ Placement in `syncPatternASections()` is correct
   - Runs AFTER both Target and Reference imports complete
   - Runs BEFORE `calculateAll()` (which needs correct field lock states)
   - Runs in IMPORT QUARANTINE (listeners still muted, safe to update DOM)

3. ✅ Import sequence now matches manual workflow:
   - Import: StateManager.setValue("d_113", "Gas") → handleHeatingSystemChangeForGhosting("Gas")
   - Manual: Dropdown change event → StateManager.setValue("d_113", "Gas") → handleHeatingSystemChangeForGhosting("Gas")
   - S18 Decarbonize: StateManager.setValue("d_113", "Heatpump") → handleHeatingSystemChangeForGhosting("Heatpump")

**Expected Result**: Import → Decarbonize → Mode Toggle should now work without state mixing! 🎯

---

## 🚨 ACTUAL ROOT CAUSE DISCOVERED (2025-11-29) - Diagnostic Logs Analysis

### Diagnostic Evidence from Logs.md

**Critical Discovery**: The diagnostic script revealed that **S13 does NOT have a `refreshUI()` guard** to prevent dropdown change events during mode switches!

**Smoking Gun Evidence** (Logs.md lines 273-285):

After toggling to Reference mode:
```
🎛️  HEATING SYSTEM SELECTOR:
   d_113 (Target):     Gas          ❌ OVERWRITTEN!
   ref_d_113 (Ref):    Gas          ✅ Correct
   S13 Mode:           reference

⚡ EFFICIENCY FIELDS:
   f_113 (HSPF - Target):    7.1    ❌ OVERWRITTEN!
   ref_f_113 (HSPF - Ref):   7.1    ✅ Correct
```

**What should have happened**: Target d_113 should remain "Heatpump" (unchanged).

**What actually happened**: When S13.refreshUI() switched to Reference mode and updated the dropdown to show "Gas", the dropdown change event fired and **OVERWROTE the global StateManager's Target d_113 value**!

### The Mechanism

1. **Initial State**: d_113 (Target) = "Heatpump", ref_d_113 (Ref) = "Gas"
2. **User toggles to Reference mode**
3. **S13.refreshUI() executes**:
   - Reads ref_d_113 = "Gas" from ReferenceState ✅
   - Updates DOM dropdown element to show "Gas" ✅
   - **Dropdown change event fires** ❌
   - Event handler calls `ModeManager.setValue("d_113", "Gas")` ❌
   - **Overwrites global StateManager's TARGET d_113!** ❌
4. **Result**: Target d_113 now = "Gas" (contaminated with Reference value)

### Why h_113 (COPheat) Doesn't Change

**Key observation** (Logs.md line 285, 557):
```
h_113 (COPheat - Target): 3.663540445486518  ← ALWAYS 3.66!
```

The calculated efficiency **never changes** because the calculation has already run and cached the value. The contamination doesn't affect calculations until the NEXT recalculation cycle (which happens on the next mode toggle).

### Pattern Comparison with S07

**S07 works correctly** (Lines 133-137, 413-417) because it properly updates dropdowns during mode switches without contamination. S07 must have guards that S13 lacks.

### The Required Fix

**S13 needs the SAME `_isRefreshing` guard pattern that protects dropdown change events during refreshUI()!**

```javascript
// S13 needs this pattern (like S07 has):
const ModeManager = {
  currentMode: "target",
  _isRefreshing: false,  // 🔥 ADD THIS

  refreshUI: function() {
    this._isRefreshing = true;  // 🔥 SET FLAG
    // ... update dropdowns
    this._isRefreshing = false; // 🔥 CLEAR FLAG
  }
}

// In dropdown change handler:
function handleDropdownChange(e) {
  if (ModeManager._isRefreshing) {  // 🔥 CHECK FLAG
    return; // Ignore events during UI refresh
  }
  // ... normal handling
}
```

This prevents dropdown change events from firing during mode switches, eliminating state contamination.

### ❌ FIX ATTEMPT FAILED (2025-11-29) - Commit 70dd307

**What was implemented**: Added `_isRefreshing` guard pattern to S13 ModeManager

**Changes made**:
1. Added `ModeManager._isRefreshing = false` flag (line 291)
2. Set `_isRefreshing = true` at start of `refreshUI()` (line 488)
3. Clear `_isRefreshing = false` at end of `refreshUI()` (line 578)
4. Added guard check in `handleDropdownChange()`: `if (ModeManager._isRefreshing) return;` (line 2339)

**Expected Result**: Prevent dropdown change events during mode switches, eliminating d_113 contamination

**Actual Result**: ❌ **BUG PERSISTS** - State mixing still occurs after Import → Decarbonize → Mode Toggle

**New Diagnostic Evidence After Fix**:
The Logs.md diagnostic (lines 273-285) was run BEFORE this fix. Need new diagnostic run to see:
- Does d_113 still change from "Heatpump" to "Gas" after Reference toggle?
- If YES: The guard isn't working (events still firing)
- If NO but bug persists: The contamination mechanism is different than we thought

**Hypothesis**: Either:
1. The guard pattern isn't sufficient (events bypass the check somehow)
2. The contamination happens through a different mechanism than dropdown change events
3. There's another code path writing to d_113 during mode switches that we haven't identified

**Next Investigation Step**: Run diagnostic script again with the guard in place to see if the contamination pattern changes.

---

## 🎯 BREAKTHROUGH: Bug Isolated to S13 Mode Switch (2025-11-29)

**Critical Discovery**: The bug is NOT about Import or S18 Decarbonize!

### Reproduction Steps WITHOUT Import or Decarbonize

1. **Start with default state** (d_113="Heatpump")
2. **Manually change d_113 to "Gas"** in Target mode via S13 dropdown
3. **Toggle to Reference mode**
4. **Result**: h_10 state mixing appears! ❌

**Conclusion**:
- Import is NOT the issue
- S18 Decarbonize is NOT the issue
- **S13 mode switching itself has a fundamental flaw**
- The contamination happens during `ModeManager.switchMode()` / `refreshUI()`

### What This Means

**The _isRefreshing guard (commit 70dd307) may have worked!**
- The diagnostic logs (Logs.md) were captured BEFORE the guard was added
- Need new diagnostic run to confirm if guard prevents the d_113 contamination
- If guard worked but bug persists, contamination is through a different code path

**S13 needs to work more like S07**:
- S07 has proper guards and mode isolation
- S07 doesn't exhibit this state mixing behavior
- S13's ModeManager implementation differs from S07's pattern

### Next Steps

1. **Re-run diagnostic** with _isRefreshing guard in place
2. **Compare S13 vs S07** ModeManager implementations line-by-line
3. **Investigate circular reference**: h_10 may be causing calculation loops
4. **Consider j_35 (Row 35)** as alternative metric for S18 Parallel Coordinates

### Circular Reference Hypothesis

**Potential Issue**: S18 Parallel Coordinates reading h_10 (Row 10, calculated final TEUI) may create circular dependencies:
- S18 reads h_10 for TEUI axis display
- h_10 depends on calculations from S13 (j_32 heating energy)
- S13 calculations may trigger during mode switches
- This could cause h_10 to recalculate during S18 graph updates
- Recalculation during mode toggle could contaminate state

**Proposed Solution** (pcConfig.js lines 237-238):
- Use `j_35` (S04 Row 35) instead of `h_10` (S01 Row 10) for TEUI axis
- j_35 is upstream, calculated earlier in dependency chain
- Breaks potential circular reference loop
- Faster, more direct access to TEUI value
- Reference mode would use `ref_j_35` instead of `e_10`

**Preparation Work Needed**:
- Verify j_35 contains same/equivalent value as h_10
- Check if ref_j_35 exists and is properly populated
- Ensure j_35 is calculated before S18 graph renders
- Test that j_35 updates correctly during mode switches

---

## ✅ PARTIAL SUCCESS: j_35 Circular Reference Fix (2025-11-29) - Commit f27168d

**Implementation**: Changed S18 Parallel Coordinates TEUI axis from h_10 (S01) to j_35 (S04)

### What Was Changed

**pcConfig.js TEUI axis** (lines 229-244):
```javascript
{
  id: "teui",
  label: "TEUI",
  unit: "kWh/m²·yr",
  description: "Total Energy Use Intensity",
  optimal: "lower",

  // 🔥 FIX (Nov 29): Use j_35 from S04 instead of h_10 from S01
  // This breaks potential circular reference loop between S18 ↔ S01 ↔ S13
  // j_35 is calculated upstream in dependency chain (S04 Row 35)
  // j_35 = j_32 (total target energy) / h_15 (conditioned area)
  targetField: "j_35", // S04 Row 35 - Target TEUI (calculated earlier in chain)
  referenceField: "ref_j_35", // S04 publishes ref_j_35 in Reference mode

  domain: [0, 999],
},
```

**Previous Implementation**:
- targetField: "h_10" (S01 Row 10 - Target TEUI, calculated downstream)
- referenceField: "e_10" (S01 Row 10 - Reference TEUI, correct field but wrong pattern)

**New Implementation**:
- targetField: "j_35" (S04 Row 35 - calculated upstream)
- referenceField: "ref_j_35" (S04 Row 35 - proper ref_ prefix pattern)

### Verification

**S04 Publication**: Section04.js properly publishes j_35 to StateManager:
- Lines 1100-1123: `setFieldValue()` function publishes with ref_ prefix in Reference mode
- Lines 1434-1439: `j_35 = j_32 / h_15` calculation and publication
- ✅ Both j_35 and ref_j_35 are available to S18

**Dependency Chain**:
- S04 (upstream) → calculates j_35 from j_32 and h_15
- S13 (mid-chain) → calculates heating/cooling energy
- S01 (downstream) → calculates final carbon intensity h_10
- S18 now reads j_35 instead of h_10, breaking circular reference loop

### Improvements Achieved ✅

1. **S18 Table TEUI Display Fixed**:
   - TEUI axis in Parallel Coordinates table now shows correct values
   - e_10 was correct (Reference TEUI) but does not need ref_ prefix as S01 is state agnostic. 
   - Now uses j_35 (Target TEUI) and ref_j_35 (Reference TEUI) from upstream S04, which results in accurate TEUI display in the TEUI table coumn values (was broken before)

2. **Graph Stability Improved**:
   - Graph no longer nosedives at SHW% axis when refreshed in Reference mode
   - Broken circular reference loop: S18 → h_10 → S01 → j_32 → S13 calculations
   - More performant: j_35 calculated earlier in dependency chain

3. **Proper Field Naming**:
   - Fixed incorrect referenceField from "e_10" (GHGI) to "ref_j_35" (TEUI)
   - Now follows standard ref_ prefix pattern consistently

### Limitations - Bug Still Persists ❌

**Core State Mixing Issue Remains**:
- h_10 oscillation between 248.9 and 167.0 STILL OCCURS after Import → Mode Toggle
- The j_35 fix improved S18 display and graph stability
- BUT did NOT fix the underlying S13 mode switching contamination issue
- The bug is in S13's mode switching mechanism, not in S18's field selection

**What This Tells Us**:
- The circular reference hypothesis was partially correct (it DID affect S18 display)
- But circular reference was NOT the root cause of state mixing
- Root cause remains in S13 ModeManager's refreshUI() / mode switching logic
- Need to continue investigating S13's mode isolation mechanism

### Next Investigation Steps

1. **Re-run diagnostic script** with j_35 fix in place to see if contamination pattern changes
2. **Compare j_35 vs h_10** values during mode toggles to verify they track correctly
3. **Continue S13 investigation**: The _isRefreshing guard may not be sufficient
4. **Explore S07 vs S13** ModeManager differences - why does S07 work correctly?

---

## Investigation Focus: S18 Value-Setting

### Questions to Answer

1. **What's different about the problematic file's d_113 value?**
   - Is it stored as a string vs number?
   - Are there hidden characters or formatting issues?
   - Does it have a different data type in localStorage?

2. **How does S18 write to both TargetState AND StateManager?**
   - Does this double-write cause a sync issue?
   - Should S18 only write to StateManager (like manual edits do)?
   - Is the order of writes critical?

3. **Why does the bug only appear AFTER mode toggle?**
   - What happens during mode toggle that reads/writes d_113?
   - Does S13.refreshUI() have similar issues to S07 (which we ruled out)?
   - Are dropdown change events firing during mode switch?

4. **How does S13 select between f_113 (HSPF) and j_115 (AFUE)?**
   - Is the field selection logic correct?
   - Does it check d_113 or ref_d_113 when calculating Target values?
   - Could there be a condition where it reads the wrong selector?

---

## What We've Ruled Out

### ✅ NOT the Issue: Import Logic
- File import has worked correctly for 8+ months
- Diagnostic logging shows import sets correct values
- Both Target and Reference states populated properly after import
- **Multiple other files import and work perfectly**

### ✅ NOT the Issue: S01 Display
- S01 is state-agnostic and correctly displays whatever StateManager provides
- S01 does not perform calculations that would cause state mixing
- h_10 changes are a **symptom**, not the cause

### ✅ NOT the Issue: S07 (SHW System)
- Extensive testing shows S07 works correctly
- Multiple Gas→Heatpump files convert d_51 correctly
- S07.refreshUI() does not cause the bug (we tested with and without fixes)
- Manual user edits in S07 do NOT cause state mixing

### ✅ NOT the Issue: S18 Decarbonize Write Logic (Generally)
- Diagnostic logging shows Decarbonize correctly sets values
- Reference state remains unchanged ✅
- **Works correctly with most files** - only fails with ONE file
- The pattern of writes (TargetState + StateManager) is consistent across all files

### ✅ NOT the Issue: pcConfig.js Field Selection
- Axis value reading logic is correct
- Properly uses mode parameter to select Target vs Reference fields
- Correctly implements conditional logic (COP vs AFUE based on system type)
- **Works correctly when StateManager has correct values**

---

## Diagnostic Evidence

### Test Results Summary

**Files Tested**: 5+ different Gas building files
**Result**:
- 4 files: ✅ No state mixing after Decarbonize + mode toggle
- 1 file: ❌ State mixing occurs (h_10 oscillates 248.9 ↔ 167.0)

**Specific Field Identified**: `d_113` (Primary Heating System)

### Logs from Problematic File

**After Decarbonize (Target mode):**
```
h_10 = 248.90516122530227 ✅
j_32 = 2779523.9354029503 ✅ (Target energy - Heatpump efficiency)
```

**After Toggle to Reference, then back to Target:**
```
h_10 = 166.98456781056296 ❌ WRONG!
j_32 = 1864716.6687405566 ❌ Target energy CHANGED!
```

**The calculation error**: Target j_32 drops by ~900k, suggesting Target calculations are using Gas efficiency (0.90) instead of Heatpump efficiency (HSPF 12.5 / COP 3.66).

---

## Investigation Tasks

### 1. Compare d_113 Values Across Files

**Action**: Export and compare the actual stored values
```javascript
// In problematic file
console.log("d_113 type:", typeof stateManager.getValue("d_113"));
console.log("d_113 value:", JSON.stringify(stateManager.getValue("d_113")));
console.log("d_113 from localStorage:", localStorage.getItem("d_113"));

// In working file
// ... same checks
```

**Look for**:
- String vs number differences
- Hidden characters
- Encoding issues
- Unexpected data types

### 2. Add S13-Specific Diagnostic Logging

**Location**: Section13.js calculation functions

**What to log**:
- Which efficiency field is being selected (f_113 vs j_115)
- Value of d_113 when making the selection
- Whether calculation is for Target or Reference model
- Any conditional logic that switches between fields

### 3. Trace S18 Decarbonize Write Sequence for d_113

**Monitor**:
1. TargetState.setValue("d_113", "Heatpump") - does this succeed?
2. StateManager.setValue("d_113", "Heatpump") - does this succeed?
3. Are both writes synchronous?
4. Does calculateAll() run before both writes complete?
5. What is the actual value in StateManager immediately after?

### 4. Check S13 refreshUI() During Mode Toggle

**Similar to S07 investigation**:
- Does S13.refreshUI() update dropdown programmatically?
- Do dropdown change events fire during mode switch?
- Could this trigger unwanted calculations?

---

## Next Steps

1. **Isolate the d_113 data difference** between working and failing files
2. **Add S13 diagnostic logging** similar to what we added for S07
3. **Monitor S18 Decarbonize** specifically for d_113/f_113/j_115 writes
4. **Test hypothesis**: Is S18 writing to TargetState causing a sync issue with StateManager?

---

## Files to Investigate

### Primary Focus
- **src/sections/Section13.js** - Heating/Cooling calculations
  - ModeManager.getValue() / setValue()
  - Field selection logic for f_113 vs j_115
  - refreshUI() - does it have same issue as S07?

- **src/core/ParallelCoordinates.js** - S18 Decarbonize button
  - Lines 1520-1570: Heating system conversion
  - Double-write pattern (TargetState + StateManager)
  - calculateAll() timing

### Supporting Files
- **src/core/pcConfig.js** - Graph axis value reading
  - heating_efficiency axis configuration
  - Field selection based on d_113

- **src/core/StateManager.js** - Global state storage
  - getValue() / setValue() implementation
  - localStorage sync timing

---

## References

- **S13 Heating Conversion**: [ParallelCoordinates.js:1520-1570](../../src/core/ParallelCoordinates.js#L1520-L1570)
- **S13 Section Code**: [Section13.js](../../src/sections/Section13.js)
- **Graph Heating Efficiency**: [pcConfig.js](../../src/core/pcConfig.js)
- **Test Logs**: [Logs.md](../Logs.md)
