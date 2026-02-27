# D13 Update - Performance vs. Functionality Regressions

**Date**: November 19, 2025
**Branch**: D13-UPDATE
**Status**: CRITICAL - Calculation propagation broken

---

## Summary

The D13 "Set Values" button implementation (Phases 4-5) introduced performance optimizations that **broke calculation propagation** in the application. While initialization time improved and the "Set Values" feature works, normal user interactions no longer trigger full calculation chains.

### Baseline (Before D13 Work)
- **Initialization**: ~200ms
- **Calculation Propagation**: ✅ Flawless - all sections update correctly
- **Set Values**: ❌ Not implemented

### Current State (After D13 Commits)
- **Initialization**: 240-262ms (with S11 fix) or 367ms (without)
- **Calculation Propagation**: ❌ **BROKEN** - changes don't cascade
- **Set Values**: ✅ Works correctly in both modes

---

## Root Cause Analysis

### What We Changed (Commit 15cdf65 + bcae34c)

**Section10.js** (lines 2979-2990):
- **Before**: Listeners called `calculateAll()`
- **After**: Listeners call `ModeManager.updateCalculatedDisplayValues()`

**Section14.js** (lines 1441-1446):
- **Before**: Listeners called `calculateAll()`
- **After**: Listeners call `ModeManager.updateCalculatedDisplayValues()`

**Section11.js** (lines 3095-3115):
- **Before**: Listeners called `calculateAll()`
- **After**: Listeners call `ModeManager.updateCalculatedDisplayValues()`

**Rationale**: Prevent recursive `calculateAll()` loops during FileHandler.applyReferenceValuesFromStandard()

### What Broke

**Test Case 1: S10 d_80 Dropdown (NRC Gains Factor Method)**

Expected behavior:
1. User changes d_80 dropdown
2. S10 calculates new gain factors
3. Calculator.calculateAll() cascades to S11 → S12 → S13 → S14 → S15 → S01
4. h_10 (TEUI grand total) updates

Actual behavior (from Logs.md lines 1540-1575):
1. ✅ User changes d_80 dropdown
2. ✅ S10.calculateAll() runs (dual-engine calculations complete)
3. ❌ **Calculator.calculateAll() never fires**
4. ❌ Changes don't propagate to downstream sections
5. ❌ h_10 does NOT update

**Test Case 2: S11 d_97 Slider (Thermal Bridge %)**

Expected behavior:
1. User changes d_97 slider
2. S11 calculates new thermal bridge penalty
3. Heating loads update in S12 → S13
4. Cooling loads update in S12 → S13
5. All downstream sections update

Actual behavior:
1. ✅ User changes d_97 slider
2. ✅ S11 calculates correctly
3. ✅ S12 updates (thermal mass impacts)
4. ⚠️ Cooling loop impacts reach S13
5. ❌ **Heating loop impacts DON'T reach S13**
6. ❌ Changes don't propagate to S14, S15, S01

---

## Why This Happened

### The Original Problem (Commit 15cdf65)

During `FileHandler.applyReferenceValuesFromStandard()`:
1. FileHandler calls `Calculator.calculateAll()` (line 872)
2. Calculations write results to StateManager (e.g., `ref_m_121`, `ref_d_122`)
3. **Section10/S14 listeners fire** on those StateManager changes
4. Those listeners called `calculateAll()` **again**
5. Recursive loop: 114 S10 fires + 148 S14 fires during one "Set Values" click

### The Fix We Applied

Changed listeners to only call `ModeManager.updateCalculatedDisplayValues()`:
- ✅ Eliminates recursion during FileHandler operations
- ✅ Reduces initialization time (367ms → 240ms)
- ❌ **Breaks normal user interaction calculation cascade**

### The Architecture Issue

**Two Different Scenarios:**

**Scenario A: FileHandler.applyReferenceValuesFromStandard() (Set Values button)**
- FileHandler explicitly calls `Calculator.calculateAll()` at the end
- Listeners should NOT call `calculateAll()` again
- Only need UI updates

**Scenario B: User Edits a Field (normal interaction)**
- User changes d_80, d_97, climate data, etc.
- Section's own `calculateAll()` runs (e.g., S10.calculateAll())
- **Listeners NEED to trigger Calculator.calculateAll()** to propagate
- Without this, changes stay local to the section

**The Problem**: We removed `calculateAll()` from listeners for both scenarios, breaking Scenario B.

---

## Evidence from Logs

### S10 d_80 Change (Logs.md lines 1540-1575)

```
1545: [S10 DROPDOWN CALC] calculateAll() triggered by d_80 in target mode
1546: [S10 DEBUG] calculateAll() triggered in target mode - running both engines
1547: [S10 DEBUG] Dual-engine calculations complete in target mode
```

**Missing**: No `Calculator.js:510 calculateAll` entry
**Missing**: No S11, S12, S13, S14, S15 calculation logs
**Missing**: No `[S01] CALCULATION CHAIN COMPLETE` entry

### Comparison: Successful Calculation Chain (Logs.md lines 590-601)

When calculations DO propagate (earlier in session):
```
590: (anonymous) @ Calculator.js:531
591: calculateAll @ Calculator.js:510
...
601: ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
```

This pattern is **absent** after d_80 changes.

---

## Attempted Solutions

### Attempt 1: Revert S11 Fix (Commit feb91d6)

**Action**: Reverted commit bcae34c to restore S11's `calculateAll()` listeners

**Results**:
- ✅ TB% slider (d_97) works again - values propagate correctly
- ❌ d_80 dropdown still broken
- ⚠️ Initialization time back to 367ms

**Conclusion**: S10 listener removal (commit 15cdf65) broke d_80, predates S11 fix

---

## The Dilemma

### Option A: Revert All Listener Changes (Go Back to Commit 8e982f6)
**Pros**:
- ✅ Calculation propagation restored
- ✅ All user interactions work flawlessly

**Cons**:
- ❌ "Set Values" button triggers 262+ recursive calculateAll() calls
- ❌ Logs explode 4x in size
- ❌ Performance degradation
- ❌ Initialization: 367ms (vs. 200ms baseline)

### Option B: Smart Listener Detection
**Idea**: Listeners detect whether they're being called during FileHandler operations

**Possible Implementation**:
```javascript
// In FileHandler before calculateAll()
window.TEUI._fileHandlerActive = true;

// In listeners
window.TEUI.StateManager.addListener("ref_d_97", () => {
  if (!window.TEUI._fileHandlerActive) {
    calculateAll(); // Normal user interaction
  }
  ModeManager.updateCalculatedDisplayValues(); // Always update UI
});

// In FileHandler after calculateAll()
window.TEUI._fileHandlerActive = false;
```

**Pros**:
- ✅ Prevents recursion during FileHandler
- ✅ Preserves calculation cascade for user interactions

**Cons**:
- ⚠️ Global flag could be fragile
- ⚠️ Need to ensure flag is always cleared (try/finally)
- ⚠️ Complex to debug if flag gets stuck

### Option C: Materiality Threshold (Existing Pattern)
**Idea**: Use StateManager's materiality threshold to prevent unnecessary recalculations

**Location**: `src/core/StateManager.js` and `src/core/Calculator.js`

**Investigation Needed**:
- How does materiality threshold currently work?
- Does it apply to listener firing or just calculation execution?
- Could we tune it to prevent FileHandler recursion but allow normal propagation?

---

## Recommendation

**STOP AND DOCUMENT** before proceeding further. We have:

1. ✅ "Set Values" feature working correctly
2. ✅ M-N compliance audit complete
3. ❌ **Critical regression**: Calculation propagation broken
4. ⚠️ Performance optimization that caused the regression

**Next Steps** (in order):

1. **Commit this documentation** (D13-REGRESSIONS.md)
2. **Revert to known-good state** for calculation propagation
3. **Create new branch** for performance optimization investigation
4. **Research materiality threshold** approach in StateManager/Calculator
5. **Test smart detection approach** in isolation
6. **Only merge** when both features + performance are working

---

## Git History Reference

| Commit | Description | Init Time | Calc Propagation | Set Values |
|--------|-------------|-----------|------------------|------------|
| 1f59a1f | Before Phase 5 listener changes | ~200ms | ✅ **Works** | ✅ Works |
| 8e982f6 | Debug logging added | 367ms | ❌ d_80 broken | ✅ Works |
| 15cdf65 | S10/S14 listener fix (BROKE d_80) | 367ms | ❌ **Broken** | ✅ Works |
| bcae34c | S11 listener fix (BROKE d_97 heating) | 240ms | ❌ **Broken** | ✅ Works |
| feb91d6 | Revert S11 fix (d_97 restored) | 367ms | ❌ d_80 still broken | ✅ Works |
| 2d7d209 | Documentation (current) | 367ms | ❌ d_80 still broken | ✅ Works |

**Safest Rollback Point**: Commit `1f59a1f` (before Phase 5 - everything works, just has recursion during Set Values)

**Note**: Commit `8e982f6` already has the d_80 problem because it includes commit `15cdf65` which removed calculateAll() from Section10 listeners.

---

## Critical Discovery: Problem is NOT in Section Files

### Attempt 2: Restore Working S10/S11/S13 from Nov-UI-style (Commit 9dbbc84 - reverted)

**Action**: Replaced D13-UPDATE's S10/S11/S13 with working versions from Nov-UI-style branch (deployed app)

**Results**:
- ❌ **Calculations completely broken** - worse than before
- ❌ Imported working sections don't function in D13-UPDATE environment
- ✅ Proves problem is NOT in S10/S11/S13 themselves

**Conclusion**: The regression is caused by **core file changes** or architectural incompatibility, not section-level listener modifications.

**Core Files Changed in D13-UPDATE**:
- `src/core/FileHandler.js` - Added `applyReferenceValuesFromStandard()` method
- `src/core/ReferenceValues.js` - Modified reference value definitions
- `src/core/TooltipManager.js` - Unknown changes

**Core Files UNCHANGED** (confirmed):
- `src/core/Calculator.js` - No changes
- `src/core/StateManager.js` - No changes

**Implications**:
1. Removing `calculateAll()` from listeners (commits 15cdf65, bcae34c) broke calculation propagation
2. Working sections from Nov-UI-style don't work when placed in D13-UPDATE context
3. Problem is architectural violation per CLAUDE.md lines 140-144:
   - "DO NOT invent new calculation methods - Use existing patterns only"
   - "Both engines ALWAYS run on value changes - This is by design, not a bug"
   - "Never disable an engine to 'fix' calculation issues"

**Architecture Violation**: We disabled the calculation cascade mechanism (by removing `calculateAll()` from listeners) to work around FileHandler recursion. This violated the core architecture principle that calculations must propagate through the dependency chain.

**Correct Approach**: Fix why FileHandler triggers recursive listeners, not disable listeners themselves.

---

**Last Updated**: 2025-11-19 15:45 EST
**Author**: Claude Code
**Status**: CRITICAL - ROLLBACK REQUIRED TO COMMIT 1f59a1f
