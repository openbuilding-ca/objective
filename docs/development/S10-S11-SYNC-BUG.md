# S10-S11 Sync Bug: Mode Switch Triggering Calculations

**Date**: 2025-11-11
**Severity**: Medium (Anti-Pattern Violation)
**Status**: Under Investigation
**Related**: D13-ARCHITECTURE-OPTIONS.md (Option 3 implementation planning)

---

## Symptom

When changing the `d_13` Reference Standard dropdown:
1. Reference model receives new values in all sections ✅
2. Both engines run (Target + Reference) ✅
3. **BUT**: `e_10` TEUI total value for Reference model does NOT update in state-agnostic S01 ❌
4. **Workaround**: Manually switching S11 into Reference mode (local toggle) "unlocks" the calculation
5. After mode switch, `e_10` updates with correct Reference values ✅

**Expected behavior**: `e_10` should update immediately when `d_13` changes, without requiring manual mode switch.

---

## Root Cause Analysis

### Primary Anti-Pattern Violation

**Location**: [Section11.js:405](../../src/sections/Section11.js#L405)

```javascript
switchMode: function (mode) {
  // ...
  this.currentMode = mode;
  console.log(`S11: Switched to ${mode.toUpperCase()} mode`);

  this.refreshUI();

  // ❌ ANTI-PATTERN: Calling syncAreasFromS10() during mode switch
  syncAreasFromS10();

  // ❌ REMOVED ANTI-PATTERN: calculateAll() should NOT be called during mode switch
  // Mode switch is display-only; calculations happen on data changes via calculateAll()

  // Ensure displayed values reflect the selected mode
  if (typeof this.updateCalculatedDisplayValues === "function") {
    this.updateCalculatedDisplayValues();
  }

  this.syncToggleUI(mode);
},
```

### The Problem Chain

**Step 1**: `switchMode()` calls `syncAreasFromS10()` at line 405

**Step 2**: `syncAreasFromS10()` calls `calculateAll()` at line 1301:

```javascript
function syncAreasFromS10() {
  // ... guard checks and area syncing logic ...

  // Force UI refresh to show synced values in DOM
  console.log("[S11 Area Sync] Refreshing UI...");
  ModeManager.refreshUI();

  // ❌ ANTI-PATTERN: Trigger full recalculation during mode switch
  console.log("[S11 Area Sync] Triggering recalculation...");
  calculateAll();  // THIS CAUSES THE PROBLEM!

  console.log("[S11 Area Sync] Sync completed successfully");
}
```

**Why this violates cheatsheet guidelines**:
- **Mode switch = UI state change** (show Target vs Reference values)
- **Mode switch should NEVER trigger calculations**
- Calculations should only run on **data changes** (d_13 change, user input, area changes)

### Secondary Issue: Why e_10 Gets "Blocked"

The symptom suggests that when `d_13` changes initially:
1. Reference engine runs in all sections (S05, S06, S09, S11, S12, S13, S14) ✅
2. S11 publishes `ref_i_98`, `ref_k_98` to StateManager ✅
3. **BUT** S01 doesn't receive or doesn't use S11's Reference values for `e_10` calculation ❌

**Possible causes**:
1. **Timing issue**: S01 calculates `e_10` BEFORE S11's `calculateReferenceModel()` completes
2. **Missing trigger**: S11's Reference results don't trigger S01 recalculation
3. **State contamination**: S01 reading wrong values (Target instead of Reference)
4. **Calculation order**: `calculateAll()` processing sections in wrong order

---

## Investigation Questions

### Q1: Does d_13 listener trigger calculateReferenceModel() in S11?

**Location**: [Section11.js:387-391](../../src/sections/Section11.js#L387-L391)

```javascript
// Listen for reference standard changes
if (window.TEUI?.StateManager?.addListener) {
  window.TEUI.StateManager.addListener("d_13", () => {
    ReferenceState.onReferenceStandardChange();
  });
}
```

**Check**:
- Does `ReferenceState.onReferenceStandardChange()` call `calculateAll()` or `calculateReferenceModel()`?
- Looking at [Section11.js:285-321](../../src/sections/Section11.js#L285-L321):

```javascript
onReferenceStandardChange: function () {
  console.log("S11: Reference standard changed, reloading defaults");

  // Preserve user-modified area values
  const preservedAreas = {};
  // ... preservation logic ...

  // Load new reference values (this updates RSI/U-values from ReferenceValues.js)
  this.setDefaults();

  // Restore preserved area values
  Object.assign(this.state, preservedAreas);
  this.saveState();

  // Only refresh UI if currently in reference mode
  if (ModeManager.currentMode === "reference") {
    ModeManager.refreshUI();
    // ✅ CORRECT: Reference standard change (d_13) is a DATA CHANGE requiring recalculation
    calculateAll();  // <-- CALLS calculateAll() only if in Reference mode!
  }
}
```

**ISSUE FOUND**: Line 319 only calls `calculateAll()` if `ModeManager.currentMode === "reference"`.

**If S11 is in Target mode when d_13 changes**:
- `ReferenceState.onReferenceStandardChange()` updates ReferenceState ✅
- BUT does NOT call `calculateAll()` ❌
- Reference engine doesn't run in S11 ❌
- S11 doesn't publish new `ref_i_98`, `ref_k_98` values ❌
- S01's `e_10` can't update because S11's Reference values are stale ❌

### Q2: Is calculateAll() running both engines?

**Check**: Does global `calculateAll()` function call both:
- `calculateTargetModel()` for all sections
- `calculateReferenceModel()` for all sections

**If not**: This would explain why Reference values don't update when S11 is in Target mode.

### Q3: What does mode switch + syncAreasFromS10() do?

When user manually switches S11 to Reference mode:
1. `switchMode("reference")` calls `syncAreasFromS10()`
2. `syncAreasFromS10()` calls `calculateAll()` (line 1301)
3. `calculateAll()` runs Reference engine for all sections
4. S11's Reference engine finally publishes `ref_i_98`, `ref_k_98`
5. S01 recalculates `e_10` with correct Reference values

**This "unlocks" the calculation but violates anti-pattern: mode switch should NOT trigger calculations.**

---

## Troubleshooting Workplan

### Phase 1: Verify Dual-Engine Execution (30 min)

**Goal**: Confirm whether `calculateAll()` runs both engines for all sections

**Steps**:
1. Add console logging to global `calculateAll()` function (in app.js or main.js):
   ```javascript
   console.log('[calculateAll] Starting dual-engine calculation');
   ```

2. Add logging to S11's engine functions:
   ```javascript
   // In calculateTargetModel()
   console.log('[S11 Target Engine] Running...');

   // In calculateReferenceModel()
   console.log('[S11 Reference Engine] Running...');
   ```

3. Test sequence:
   - Start in Target mode (S11 showing Target values)
   - Change `d_13` dropdown to different standard
   - Check console for engine execution logs

**Expected**: Both engines should run regardless of S11's current mode
**If only Target engine runs**: This is the root cause

### Phase 2: Verify d_13 Listener Behavior (15 min)

**Goal**: Confirm `ReferenceState.onReferenceStandardChange()` behavior when S11 is in Target mode

**Steps**:
1. Add logging to `onReferenceStandardChange()` at line 315:
   ```javascript
   console.log(`[S11] ReferenceStandardChange: currentMode=${ModeManager.currentMode}`);
   ```

2. Add logging before conditional `calculateAll()` call at line 319:
   ```javascript
   if (ModeManager.currentMode === "reference") {
     console.log('[S11] Calling calculateAll() because in Reference mode');
     ModeManager.refreshUI();
     calculateAll();
   } else {
     console.log('[S11] ⚠️ SKIPPING calculateAll() because in Target mode');
   }
   ```

3. Test sequence:
   - Start in Target mode
   - Change `d_13` dropdown
   - Check if `calculateAll()` is skipped

**Expected**: If skipped, this confirms the root cause

### Phase 3: Check S01 Calculation Dependencies (30 min)

**Goal**: Verify S01's `e_10` calculation reads correct Reference values from S11

**Steps**:
1. Find S01's `e_10` calculation logic (likely in Section01.js)
2. Add logging to show which S11 values it reads:
   ```javascript
   const s11_ref_i98 = window.TEUI.StateManager.getValue('ref_i_98');
   console.log(`[S01] Calculating e_10 using ref_i_98=${s11_ref_i98}`);
   ```

3. Test sequence:
   - Change `d_13` dropdown
   - Check console for S01's read values
   - Compare with S11's published values

**Expected**: Should show whether S01 is reading stale or correct values

### Phase 4: Remove Anti-Pattern from switchMode() (15 min)

**Goal**: Remove `syncAreasFromS10()` call from mode switch to eliminate anti-pattern

**Location**: [Section11.js:405](../../src/sections/Section11.js#L405)

**Change**:
```javascript
switchMode: function (mode) {
  if (
    this.currentMode === mode ||
    (mode !== "target" && mode !== "reference")
  )
    return;
  this.currentMode = mode;
  console.log(`S11: Switched to ${mode.toUpperCase()} mode`);

  this.refreshUI();

  // ❌ REMOVED: syncAreasFromS10() should NOT be called during mode switch
  // syncAreasFromS10();
  // REASON: Mode switch is UI-only, should not trigger calculations or data syncs
  // S10 area changes already trigger syncAreasFromS10() via StateManager listeners

  // Ensure displayed values reflect the selected mode
  if (typeof this.updateCalculatedDisplayValues === "function") {
    this.updateCalculatedDisplayValues();
  }

  this.syncToggleUI(mode);
},
```

**Test**: Verify that S10 area changes still sync correctly without manual mode switch

---

## Proposed Fixes

### Option A: Fix Current Architecture (Quick - Recommended for Pre-Option 3)

**Problem**: `ReferenceState.onReferenceStandardChange()` only calls `calculateAll()` when S11 is in Reference mode.

**Fix Location**: [Section11.js:315-321](../../src/sections/Section11.js#L315-L321)

**Change**:
```javascript
onReferenceStandardChange: function () {
  console.log("S11: Reference standard changed, reloading defaults");

  // Preserve user-modified area values
  const preservedAreas = {};
  // ... preservation logic ...

  // Load new reference values
  this.setDefaults();

  // Restore preserved area values
  Object.assign(this.state, preservedAreas);
  this.saveState();

  // ✅ FIX: ALWAYS call calculateAll() for Reference standard changes
  // Reference standard change is a DATA CHANGE affecting Reference model
  // Both engines must run to update all sections' Reference values
  calculateAll();

  // Only refresh UI if currently in reference mode
  if (ModeManager.currentMode === "reference") {
    ModeManager.refreshUI();
  }
}
```

**Rationale**:
- `d_13` change = DATA change, always requires recalculation
- Both engines (Target + Reference) should run regardless of current UI mode
- UI refresh (`refreshUI()`) should only happen if showing Reference mode
- This aligns with dual-engine architecture: engines run independently of UI state

### Option B: Verify Dual-Engine in calculateAll() (Comprehensive)

**If `calculateAll()` doesn't run both engines**:

Add explicit Reference engine calls to `calculateAll()`:
```javascript
function calculateAll() {
  console.log('[calculateAll] Running dual-engine calculations');

  // Target engine for all sections
  [5, 6, 9, 10, 11, 12, 13, 14].forEach(num => {
    const section = window.TEUI.SectionModules[`sect${String(num).padStart(2, '0')}`];
    if (section?.calculateTargetModel) {
      section.calculateTargetModel();
    }
  });

  // Reference engine for all sections
  [5, 6, 9, 10, 11, 12, 13, 14].forEach(num => {
    const section = window.TEUI.SectionModules[`sect${String(num).padStart(2, '0')}`];
    if (section?.calculateReferenceModel) {
      section.calculateReferenceModel();
    }
  });

  // State-agnostic sections (S01, S02, S03, S04)
  // ... existing logic ...
}
```

---

## Recommendation: Fix Before or After Option 3?

### Recommendation: **FIX BEFORE Option 3 Implementation**

**Reasoning**:

#### 1. Independent Issues
- **This bug**: Mode switch triggering calculations (anti-pattern violation)
- **Option 3**: d_13/ref_d_13 architecture change (explicit button trigger)
- These are **separate concerns** that can be fixed independently

#### 2. Clean Foundation for Option 3
**If we fix now**:
- Option 3 implementation starts with clean dual-engine architecture ✅
- No confusion between "mode switch bug" vs "Option 3 changes" ✅
- Testing Option 3 won't be contaminated by existing bugs ✅

**If we wait**:
- Option 3 implementation might inherit or mask this bug ❌
- Harder to distinguish between old bugs and new Option 3 issues ❌
- Risk of fixing same issue twice in different ways ❌

#### 3. Low Risk, High Value
**Fix complexity**: Low (1-2 line changes)
- Remove `syncAreasFromS10()` from `switchMode()` (line 405)
- Remove mode check from `calculateAll()` call in `onReferenceStandardChange()` (line 315-321)

**Testing scope**: Moderate (verify d_13 changes update e_10 correctly)

**Impact**: High (restores correct dual-engine behavior)

#### 4. Option 3 Will Change This Code Anyway
Under Option 3:
- `d_13` listener becomes passive (no automatic `onReferenceStandardChange()`)
- Reference overlay only applied via button click
- This bug's code will be **removed/replaced** during Option 3 implementation

**BUT**: Fixing now ensures:
- We understand current architecture's correct behavior
- Option 3 changes are measured against known-good baseline
- Any new bugs in Option 3 are clearly attributable to Option 3 changes

---

## Implementation Plan

### Step 1: Apply Option A Fix (Quick Win)
1. Remove mode check from `onReferenceStandardChange()` (always call `calculateAll()`)
2. Remove `syncAreasFromS10()` from `switchMode()`
3. Test: Change `d_13` while S11 in Target mode → verify `e_10` updates immediately

**Time estimate**: 30 minutes (change + test)

### Step 2: Add Diagnostic Logging (Investigation)
1. Add Phase 1-3 logging from troubleshooting workplan
2. Run test sequence, collect logs
3. Document findings in this file

**Time estimate**: 1 hour (logging + testing + documentation)

### Step 3: Verify Fix Quality (Validation)
1. Test all d_13 change scenarios (Target mode, Reference mode, mixed modes)
2. Verify S10 area sync still works correctly
3. Verify mode switch is UI-only (no calculations triggered)
4. Update this document with test results

**Time estimate**: 1 hour (comprehensive testing)

### Step 4: Commit and Document (Closure)
1. Commit fix to `dependency2` branch
2. Update this document with "RESOLVED" status
3. Reference this fix in Option 3 implementation notes

**Time estimate**: 15 minutes

**Total time**: ~2.75 hours

---

## Next Steps

1. **CTO Review**: Confirm fix-before-Option-3 approach
2. **Apply Step 1 fix**: Remove anti-pattern violations
3. **Run diagnostics**: Add logging and collect data
4. **Validate fix**: Comprehensive testing
5. **Proceed to Option 3**: Start implementation with clean foundation

---

## Related Documents

- [D13-ARCHITECTURE-OPTIONS.md](D13-ARCHITECTURE-OPTIONS.md) - Option 3 architecture specification
- [4012-CHEATSHEET.md](history%20%28completed%29/4012-CHEATSHEET.md) - Anti-Pattern 8: Mode Switch Calculations
- [Section11.js](../../src/sections/Section11.js) - Current implementation

---

## Status Log

| Date | Status | Notes |
|------|--------|-------|
| 2025-11-11 | INVESTIGATING | Document created, root cause identified |
| TBD | FIX_APPLIED | Option A fix implemented |
| TBD | RESOLVED | Fix validated, ready for Option 3 |
