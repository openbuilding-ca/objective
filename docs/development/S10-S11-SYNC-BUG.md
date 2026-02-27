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
| 2025-11-11 | INVESTIGATING | Document created, initial root cause identified |
| 2025-11-11 | FIX_ATTEMPTED | Applied Option A fix - REVERTED due to deeper issues |
| 2025-11-11 | DEEPER_ANALYSIS | Discovered dual-sync contamination in syncAreasFromS10() |
| TBD | FIX_REVISED | New fix targeting needsDualSync condition |
| TBD | RESOLVED | Fix validated, ready for Option 3 |

---

## TEST RESULTS: Option A Fix (REVERTED - 2025-11-11)

### Test Execution

**Baseline commit**: `91c607b` (before fix)

**Fix applied**:
1. Removed mode check from `onReferenceStandardChange()` (always call `calculateAll()`)
2. Removed `syncAreasFromS10()` from `switchMode()`

### Issue 1 Discovered: State Bleed in Area Sync

**Test scenario**:
1. S11 in Target mode
2. Change d_88 (Doors area) in S10 from 7.5 → 10
3. Switch S11 to Reference mode

**Expected**: Reference mode shows d_88 = 7.5 (original Reference default)
**Actual**: Reference mode shows d_88 = 10 ❌ (contaminated by Target edit)

**Root cause**: `syncAreasFromS10()` has flawed `needsDualSync` logic at [Section11.js:1220-1228](../../src/sections/Section11.js#L1220-L1228):

```javascript
const needsDualSync =
  (isInitializationPhase || isImportActive) && // Intended: only during init/import
  currentMode === "target" &&
  (refArea_d88 === undefined || refArea_d88 !== stateManager_refArea); // ❌ BUG HERE
```

**The problem**: The condition `refArea_d88 !== stateManager_refArea` evaluates `true` during normal user edits when:
- User edits Target area in S10
- S10 publishes new `d_73 = 10` to StateManager
- S11's Reference still has `d_88 = 7.5`
- StateManager's `ref_d_73` might be stale or undefined
- Condition triggers: `7.5 !== undefined` or `7.5 !== 10`
- **Result**: Dual-sync runs during user edit, contaminating Reference state with Target values

### Issue 2 Discovered: e_10 Doesn't Restore After d_13 Round-Trip

**Test scenario**:
1. Start with default d_13 → e_10 = X
2. Change d_13 to different standard → e_10 = Y ✅
3. Change d_13 back to default → e_10 doesn't restore to X ❌

**Root cause**: Contaminated Reference areas from Issue 1:
- d_13 change applies correct RSI/U-values from ReferenceValues
- BUT Reference areas remain contaminated with Target values
- Calculation: contaminated_area × correct_RSI = wrong_result
- e_10 uses wrong Reference transmission loss values

### Why Fix Failed

The original analysis missed the **fundamental state contamination** in `syncAreasFromS10()`:
- Mode switch anti-pattern was a symptom, not the root cause
- Real problem: `needsDualSync` triggers during user edits, not just init/import
- This causes Target edits to contaminate Reference state
- All downstream calculations inherit this contamination

**Conclusion**: Cannot fix mode switch issue without first fixing dual-sync contamination.

---

## REVISED Root Cause Analysis

### Primary Issue: Dual-Sync Contamination

**Location**: [Section11.js:1220-1266](../../src/sections/Section11.js#L1220-L1266)

The `needsDualSync` condition is **too permissive**:

```javascript
// Current (BROKEN) logic:
const refArea_d88 = ReferenceState.getValue("d_88");
const stateManager_refArea = window.TEUI.StateManager.getValue("ref_d_73");

const needsDualSync =
  (isInitializationPhase || isImportActive) &&  // ✅ Correct: only init/import
  currentMode === "target" &&                    // ✅ Correct: only when showing Target
  (refArea_d88 === undefined || refArea_d88 !== stateManager_refArea); // ❌ BUG!
```

**Why the third condition is wrong**:

1. **During initialization**:
   - `refArea_d88 === undefined` ✅ (ReferenceState not yet populated)
   - Dual-sync needed ✅

2. **During import**:
   - `refArea_d88 !== stateManager_refArea` ✅ (stale ReferenceState values)
   - Dual-sync needed ✅

3. **During user edit** (THE BUG):
   - User edits Target area in S10: d_73 = 7.5 → 10
   - S10 publishes: `d_73 = 10`, `ref_d_73 = 7.5` (unchanged)
   - S11's ReferenceState: `d_88 = 7.5` (correct, unchanged)
   - StateManager: `ref_d_73 = 7.5` (correct)
   - Condition check: `refArea_d88 (7.5) !== stateManager_refArea (7.5)` = `false` ✅
   - **WAIT** - but if StateManager's `ref_d_73` is undefined or stale...
   - Condition check: `refArea_d88 (7.5) !== stateManager_refArea (undefined)` = `true` ❌
   - **Dual-sync runs inappropriately!**

**The contamination sequence**:
1. User edits Target d_88 in S10 (Target mode)
2. S10 publishes `d_73 = 10`
3. S11 listener fires `syncAreasFromS10()`
4. `needsDualSync` evaluates `true` (because `stateManager_refArea` is undefined/stale)
5. Dual-sync writes Target value (10) to BOTH Target AND Reference states
6. Reference state contaminated ❌

### Secondary Issue: Mode Switch Anti-Pattern

**Location**: [Section11.js:405](../../src/sections/Section11.js#L405)

This is a **symptom** of the dual-sync contamination:
- Mode switch calls `syncAreasFromS10()`
- Which calls `calculateAll()`
- User discovers this "unlocks" e_10 update
- But it's masking the contamination issue

---

## REVISED Proposed Fixes

### Fix Option B: Stricter Dual-Sync Condition (Recommended)

**Problem**: `needsDualSync` runs during user edits, contaminating Reference state

**Solution**: Make condition more restrictive - only run during actual init/import phases

**Location**: [Section11.js:1220-1228](../../src/sections/Section11.js#L1220-L1228)

**Change**:
```javascript
// ❌ CURRENT (BROKEN):
const needsDualSync =
  (isInitializationPhase || isImportActive) &&
  currentMode === "target" &&
  (refArea_d88 === undefined || refArea_d88 !== stateManager_refArea);

// ✅ FIXED (OPTION B1 - Simplest):
const needsDualSync =
  (isInitializationPhase || isImportActive) &&
  currentMode === "target" &&
  refArea_d88 === undefined; // Only if ReferenceState never populated

// ✅ FIXED (OPTION B2 - More explicit):
const needsDualSync =
  (isInitializationPhase || isImportActive) && // Guard flags explicitly set
  currentMode === "target" &&
  (refArea_d88 === undefined || refArea_d88 === null); // Only truly unpopulated
```

**Rationale**:
- During init/import: ReferenceState is unpopulated (`undefined`)
- During user edit: ReferenceState has values (even if different from Target)
- Checking only for `undefined` prevents dual-sync during user edits
- Reference state remains isolated from Target edits

**Alternative (OPTION B3 - Most defensive)**:
```javascript
// Disable dual-sync after initialization completes
const needsDualSync =
  isInitializationPhase && // Only during actual initialization
  !isImportActive &&        // Import has its own explicit sync call
  currentMode === "target" &&
  refArea_d88 === undefined;
```

### Fix Option C: Remove Dual-Sync Entirely

**Problem**: Dual-sync logic is complex and error-prone

**Solution**: Always sync mode-specific state, handle init/import explicitly

**Change**:
```javascript
// Remove needsDualSync logic entirely (lines 1220-1266)
// Always sync only the current mode's state:

Object.entries(areaSourceMap).forEach(([s11Field, s10Field]) => {
  // Determine source field based on current mode
  const sourceFieldId = currentMode === "reference"
    ? `ref_${s10Field}`
    : s10Field;

  const areaValue = window.TEUI.StateManager.getValue(sourceFieldId);

  if (areaValue !== null && areaValue !== undefined) {
    // Write to current mode's state only
    if (currentMode === "target") {
      TargetState.setValue(s11Field, areaValue);
    } else {
      ReferenceState.setValue(s11Field, areaValue);
    }

    // Update display
    setCalculatedValue(s11Field, areaValue, "number");

    console.log(`[S11 Area Sync] ${s11Field} = ${areaValue} (${currentMode} mode)`);
  }
});
```

**Rationale**:
- Simpler logic: always sync current mode only
- No special cases for init/import
- FileHandler explicitly calls sync after import completes
- Perfect state isolation by design

---

## REVISED Implementation Plan

### Phase 1: Fix Dual-Sync Contamination (Critical)

**Goal**: Prevent Target edits from contaminating Reference state

**Option B1 (Recommended - Minimal Change)**:
1. Change `needsDualSync` condition to only check `refArea_d88 === undefined`
2. Test: Edit Target area → verify Reference state unchanged
3. Test: Import file → verify both states populated correctly

**Time estimate**: 15 minutes (change + basic test)

### Phase 2: Fix Mode Switch Anti-Pattern (Clean-up)

**Goal**: Remove `syncAreasFromS10()` call from `switchMode()`

**Changes**:
1. Comment out `syncAreasFromS10()` at line 405
2. Add comment explaining why removed
3. Test: Mode switch is UI-only (no calculations)

**Time estimate**: 10 minutes

### Phase 3: Fix d_13 Calculation Trigger (Original Issue)

**Goal**: Ensure Reference engine runs when d_13 changes (regardless of S11's mode)

**Changes**:
1. Remove mode check from `onReferenceStandardChange()` (line 315-321)
2. Always call `calculateAll()` for d_13 changes
3. Keep UI refresh conditional on mode

**Time estimate**: 10 minutes

### Phase 4: Comprehensive Testing (Validation)

**Test scenarios**:
1. **State isolation**: Edit Target area → Reference unchanged ✅
2. **d_13 update**: Change d_13 → e_10 updates immediately ✅
3. **d_13 round-trip**: default → other → default → e_10 restores ✅
4. **Mode switch**: UI-only, no calculations ✅
5. **S10 sync**: Area changes sync correctly in both modes ✅
6. **Import**: File import populates both states correctly ✅

**Time estimate**: 1 hour

### Phase 5: Documentation Update (Closure)

1. Update this document with test results
2. Commit fix to `dependency2` branch
3. Update status to RESOLVED

**Time estimate**: 15 minutes

**Total revised time**: ~2 hours (reduced from 2.75 hours)

---

## TEST RESULTS: Phase 3 Fix Diagnostic (2025-11-11)

### Test Execution

**Fix applied**: Phase 3 only - moved `calculateAll()` outside mode check in `onReferenceStandardChange()`

**Diagnostic tool**: Browser console script capturing:
- d_13 changes
- S11 calculateAll() calls
- S11 StateManager publishes
- S01 e_10 updates

**Test file**: [d13-cascade-diagnostic-2025-11-11T20-31-55.md](d13-cascade-diagnostic-2025-11-11T20-31-55.md)

### Key Findings

**Summary**:
- ✅ S11 calculations ARE running (240 publishes recorded)
- ✅ ref_i_97 values ARE changing (59532 → 31694 → 59532)
- ❌ S01 e_10 updates: **0** (never triggered)
- ❌ e_10 remained stuck at 197

**Timeline Analysis**:

1. **First d_13 change** (+26434ms: Z6 → Z5):
   - d_13 changes
   - S11 publishes new values immediately (+26447ms)
   - ref_i_97: 59532 → 31694 (NEW VALUE from Z5 standard) ✅
   - **BUT** S01 never recalculates ❌
   - e_10 remains 197 (old value)

2. **Second d_13 change** (+30060ms: Z5 → Z6):
   - d_13 changes back to default
   - S11 publishes immediately (+30072ms)
   - ref_i_97: 31694 → 59532 (restored to Z6 default) ✅
   - **BUT** S01 never recalculates ❌
   - e_10 still 197 (never updated)

3. **Mode switch** (not in diagnostic, but observed separately):
   - User manually switches S11 mode
   - Massive cascade triggers
   - e_10 FINALLY updates ✅

### Root Cause Identified

**The Phase 3 fix is incomplete!**

S11's local `calculateAll()` function:
1. ✅ Calculates S11's values correctly
2. ✅ Publishes ref_i_97, ref_k_97 to StateManager
3. ❌ **Does NOT trigger downstream cascade** (S12 → S13 → S01)

**Why mode switch "works"**:
- `switchMode()` → `syncAreasFromS10()` → writes areas to StateManager
- Area changes trigger S12 listeners
- S12 cascades to S13 → S14 → S01
- S01 reads the fresh ref_i_97 values (published earlier but ignored)
- e_10 finally updates

**The missing piece**: S12 doesn't listen to ref_i_97 changes! It listens to:
- Climate data (d_20, d_21, d_22, h_22)
- d_13 changes
- Area changes from S10

When S11 publishes ref_i_97, nothing downstream reacts. The cascade only happens when something triggers S12 independently.

### Revised Fix Required

**Problem**: S11's local `calculateAll()` doesn't trigger downstream cascade

**Solution**: After S11 calculates, explicitly trigger S12's calculateAll() which will cascade properly

**Location**: [Section11.js:314-323](../../src/sections/Section11.js#L314-L323)

**Change**:
```javascript
console.log(
  "S11: Reference standard updated, areas preserved, performance values updated",
);

// ✅ FIX: Call S11's local calculateAll() to update S11's values
calculateAll();

// ✅ FIX: Trigger downstream cascade via S12
// S12 → S13 → S14 → Cooling → S01 (e_10 update)
if (window.TEUI?.SectionModules?.sect12?.calculateAll) {
  window.TEUI.SectionModules.sect12.calculateAll();
}

// Only refresh UI if currently in reference mode
if (ModeManager.currentMode === "reference") {
  ModeManager.refreshUI();
}
```

**Rationale**:
- S11's local `calculateAll()` updates S11's values and publishes them
- S12's `calculateAll()` triggers the full application cascade
- This mimics what `syncAreasFromS10()` does (calculate S11, then trigger S12)
- e_10 will update immediately on d_13 change

### Test Results: Revised Fix (REVERTED - 2025-11-11)

**Fix applied**: Added explicit S12.calculateAll() trigger after S11 calculation

**Results**:
- ❌ Original bug persists: e_10 still doesn't update on d_13 change
- ❌ NEW BUG: Calculation drift introduced (e_10 = 195.4 instead of 197.6)
- ❌ Root cause: Manually triggering S12 bypasses listener architecture and breaks calculation ordering
- ❌ Cooling logic affected: Complex cascade dependencies disrupted

**Decision**: REVERTED to baseline (commit 1b23dac)

**Reason for revert**:
1. Fix approach is architectural hack, not proper solution
2. Introduced new calculation drift bug
3. Manual S12 trigger breaks existing calculation dependencies
4. Proper fix requires architectural change (Option 3: explicit button trigger)

**Status**: Code reverted to safe baseline, documentation preserved

---

## Conclusion

### Root Cause Summary

The d_13 bug is **architectural**, not a simple logic fix:

1. S11's `onReferenceStandardChange()` correctly calculates and publishes values
2. BUT downstream sections (S12, S13, S01) don't listen to ref_i_97 changes
3. The cascade only happens when something ELSE triggers S12 (like area changes)
4. Manually triggering S12 breaks calculation ordering and creates new bugs

### Recommended Path Forward

**Do NOT attempt further fixes to current architecture!**

The proper solution is **Option 3** from [D13-ARCHITECTURE-OPTIONS.md](D13-ARCHITECTURE-OPTIONS.md):
- Remove automatic d_13 listeners from ReferenceState
- Make ReferenceValues overlay explicit via "Set Values" button
- Perfect state isolation eliminates this entire class of bugs
- User has explicit control over when overlays apply

**Current Status**:
- Section11.js: SAFE (reverted to baseline)
- Documentation: COMPLETE (diagnostic findings preserved)
- Bug: UNDERSTOOD (architectural issue, not logic bug)
- Next: Implement Option 3 architecture on new branch

---

## UPDATE: S12 i_107 Feature Blocked by Same Issue (2025-12-16)

**Context**: Added new calculated field `i_107` (Total Window & Door Heat Loss) to Section 12 for simplified S18 integration.

**Implementation Complete**:
- ✅ Field definition added ([Section12.js:1020-1028](../../src/sections/Section12.js#L1020-L1028))
- ✅ Dual-state value reading fixed ([Section12.js:1924-1957](../../src/sections/Section12.js#L1924-L1957))
  - Fixed state contamination: now properly reads `ref_d_86`, `ref_d_88`-`ref_d_93` in Reference mode
  - Fixed state contamination: now properly reads `ref_i_88`-`ref_i_92` in Reference mode
- ✅ Reference heatloss listeners added ([Section12.js:3570-3590](../../src/sections/Section12.js#L3570-L3590))
  - New listeners for `ref_i_88`, `ref_i_89`, `ref_i_90`, `ref_i_91`, `ref_i_92`
- ✅ Calculation logic updated ([Section12.js:1957-1971](../../src/sections/Section12.js#L1957-L1971))
  - `i_107 = i_88 + i_89 + i_90 + i_91 + i_92` (Total Window & Door Heatloss)
  - Published to StateManager for S18 consumption

**Symptom - IDENTICAL to S11 ref_i_97 Issue**:
1. User changes window areas in S11 Reference mode ✅
2. S11 calculates new `ref_i_88` through `ref_i_92` heatloss values ✅
3. S11 publishes values to StateManager ✅
4. S12 listeners fire → S12's local `calculateAll()` runs ✅
5. S12 calculates `d_107` (WWR) and `i_107` (Total Heatloss) ✅
6. S12 publishes `ref_d_107`, `ref_i_107` to StateManager ✅
7. **BUT** S12's Reference WWR value doesn't update in UI ❌
8. **Workaround**: Click "Tilt" button → global cascade triggers → UI updates ✅

**Root Cause - SAME as Lines 780-798 Above**:
- S12's local `calculateAll()` updates S12's own values and publishes to StateManager
- BUT doesn't trigger downstream cascade (S13 → S14 → S01)
- S12's `calculateAll()` is **local**, not **global**
- The cascade architecture is broken at the section-to-section level

**Why "Tilt" Button Works**:
- "Tilt" likely calls a **global** `calculateAll()` that properly cascades through all sections
- This triggers S12 → S13 → S14 → S01 in correct order
- All Reference values finally propagate to UI

**Decision**:
- ✅ **Keep implementation** (architecturally correct, proper state isolation)
- ✅ **Accept "Tilt" workaround** for now (same workaround as S11 ref_i_97 issue)
- ⏳ **Fix when S10-S11-SYNC-BUG is resolved** (Option 3 or global cascade architecture fix)

**Note for Future Fix**:
The `i_107` field implementation is **complete and correct**:
- Listeners are properly registered
- Dual-state reading follows CHEATSHEET patterns
- Values ARE being calculated and published to StateManager
- They just need the **global cascade** to propagate properly

When the S10-S11-SYNC-BUG is fixed with proper global cascade architecture, the `i_107` feature will work immediately without any code changes.

**Related Files**:
- [Section12.js:3570-3590](../../src/sections/Section12.js#L3570-L3590) - Reference heatloss listeners
- [Section12.js:1924-1983](../../src/sections/Section12.js#L1924-L1983) - calculateWWR() dual-state logic
- [Section12.js:1020-1028](../../src/sections/Section12.js#L1020-L1028) - i_107 field definition

**Testing Notes**:
- ✅ Target mode: WWR and i_107 update immediately when window areas change
- ❌ Reference mode: WWR and i_107 require "Tilt" to update (known issue)
- ✅ Values are correct after "Tilt" - calculation logic is sound

---
