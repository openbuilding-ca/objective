# d_12 State Mixing Diagnostic Report

**Date:** October 14, 2025
**Issue:** Reference mode changes to d_12 in S02 cause Target model contamination
**Status:** ROOT CAUSE IDENTIFIED BUT NOT YET FIXED

---

## Problem Statement

When user toggles S02 to Reference mode and changes d_12 dropdown:

- **Expected:** Only `ref_d_12` written → Only Reference model recalculates → Target h_10 stays stable at 93.7
- **Actual:** Both `d_12` AND `ref_d_12` written → Both models recalculate → Target h_10 changes to 89.1, then drifts on repeated changes (93.7 → 93.2)

---

## Key Architectural Insight

**Both engines running is NOT the problem.** Per 4012-CHEATSHEET.md, `calculateAll()` MUST run both Target and Reference engines for complete downstream data.

**The actual problem:** Something is writing the unprefixed `d_12` value when it should ONLY write `ref_d_12` in Reference mode.

---

## Investigation Timeline

### Attempt 1: Mode-Selective Listeners (REJECTED)

**Hypothesis:** S03 and S10 calling `calculateAll()` on `ref_d_12` changes causes both engines to run
**Attempted Fix:** Make listeners mode-selective (only run appropriate engine)
**Result:** FAILED - User correctly rejected this approach as it violates architecture
**Why It Failed:** Both engines SHOULD run - the issue is contaminated input, not calculation flow
**Commits:** d2a7600, dbf203b (reverted to 07b69fa)

### Attempt 2: S09 External Dependency Reading (INCONCLUSIVE)

**Hypothesis:** S09's `getFieldValueModeAware()` reads unprefixed values regardless of mode
**Attempted Fix:** Make S09 read `ref_d_12` when in Reference mode
**Result:** PARTIAL - S09 code was already correct, but logged evidence showed Target engine reading changed values
**Key Discovery:** S09 Target engine reads "B2-Care and Treatment" from `d_12` even though only `ref_d_12` should have changed

### Attempt 3: Debug Logging Infrastructure (SUCCESSFUL DIAGNOSTIC)

**Added logging to:**

- StateManager.setValue() - Track all d_12/ref_d_12 writes
- S02 ModeManager.setValue() - Track what mode S02 thinks it's in
- S09 calculateModel() - Track what buildingType each engine reads
- FieldManager routeToSectionModeManager() - Track dropdown routing

**Critical Evidence Found:**

```
[StateManager DEBUG] d_12 setValue: "B1-Detention" (state: user-modified, prev: A-Assembly)
[S02 ModeManager] setValue d_12: currentMode="reference", will write to StateManager key="ref_d_12"
[StateManager DEBUG] ref_d_12 setValue: "B1-Detention" (state: user-modified, prev: A-Assembly)
```

**This proves:**

1. Unprefixed `d_12` IS being written (WRONG!)
2. S02 ModeManager is in correct mode ("reference")
3. S02 ModeManager correctly writes `ref_d_12` (CORRECT!)
4. But unprefixed write happens FIRST, before S02's handler

### Attempt 4: Stop Event Propagation (FAILED)

**Hypothesis:** FieldManager's auto-attached listener fires alongside S02's custom handler, causing double-write
**Attempted Fix:** Add `e.stopImmediatePropagation()` in `handleMajorOccupancyChange()` to prevent FieldManager from firing
**Result:** FAILED - Unprefixed `d_12` still written even with propagation stopped
**Commit:** fbace18
**Why It Failed:** The unprefixed write happens BEFORE S02's handler can stop propagation, suggesting the source is not a bubble/capture listener

---

## Root Cause Analysis

### What We Know For Certain

1. **The Write Happens:** Unprefixed `d_12` gets written to StateManager when changing dropdown in Reference mode
2. **The Timing:** It happens at user interaction moment, BEFORE S02's handler logs
3. **The Source Is Unknown:** Neither FieldManager nor S02 ModeManager logs show before the unprefixed write
4. **The Contamination Path:**
   - Unprefixed `d_12` written with new value
   - S09 Target engine reads changed `d_12` value
   - S09 publishes changed `i_71` (Target internal gains)
   - S10 Target engine recalculates with changed gains
   - S10 publishes changed `i_79` (Target heating energy)
   - S01 calculates h_10 with changed Target energy
   - Result: h_10 drifts

### What We Don't Know

**WHO is writing the unprefixed d_12?**

Candidates ruled out:

- ✅ S02 ModeManager.setValue() - Logs show it's in correct mode, writes correct key
- ✅ FieldManager routeToSectionModeManager() - No logs showing it's called (or logs not captured?)
- ❌ **Unknown listener/handler** - Something fires before our instrumented code

Candidates still possible:

- Direct DOM onChange attribute in HTML
- Legacy StateManager auto-sync mechanism
- FieldManager listener attached differently than expected
- Some other event handler registered we haven't found

---

## Debugging Approach Recommendations

### Short Term: Find the Ghost Writer

1. **Add console.trace() to StateManager.setValue()** when d_12 is written - this will show the full call stack
2. **Inspect the actual SELECT element in browser DevTools** - check if it has inline `onChange` or multiple listeners
3. **Add breakpoint in StateManager.setValue()** for d_12 writes - step through to see caller
4. **Search codebase for direct StateManager.setValue("d_12")** calls outside of ModeManager

### Long Term: Architecture Fix

If we can't prevent the unprefixed write, consider:

1. **Make StateManager.setValue() mode-aware** - Refuse unprefixed writes when section is in Reference mode
2. **Remove FieldManager's auto-listeners** for sections with custom handlers
3. **Add field metadata flag** `customHandler: true` to prevent auto-listener attachment
4. **Implement proper event listener priority** system

---

## Test Protocol

To verify any fix:

1. Load app → Note h_10 = 93.7
2. Toggle S02 to Reference mode
3. Change d_12: "A-Assembly" → "B1-Detention"
4. **PASS:** h_10 stays 93.7 (Target unchanged)
5. Change d_12: "B1-Detention" → "A-Assembly"
6. **PASS:** h_10 still 93.7 (no drift/accumulation)

---

## Files Modified During Investigation

**With Debug Logging (need to be reverted):**

- 4011-StateManager.js (lines 359-364)
- 4012-Section02.js (lines 1844-1861, 1899-1901)
- 4012-Section09.js (line 2010)
- 4011-FieldManager.js (lines 189-191, 213-215)

**With Attempted Fix (need to be reverted):**

- 4012-Section02.js (line 996 - `e.stopImmediatePropagation()`)

**Commits to Revert:**

- fbace18 - Stop event propagation fix
- 48fbe87 - Detailed mode tracking
- 59a2c56 - d_12/i_71 tracing
- Keep: 07b69fa - Diagnostic commit (clean state)

---

## Summary for Next Agent

**The Problem:** Unprefixed `d_12` is being written to StateManager when only `ref_d_12` should be written in Reference mode.

**The Mystery:** We can't find WHERE this write is coming from. It's not from the instrumented code paths.

**The Evidence:** StateManager logs show the unprefixed write happening, but no handler logs appear before it.

**The Task:** Find what code is calling `StateManager.setValue("d_12", value)` when the dropdown changes in Reference mode, and prevent it.

**Debugging Tool:** Add `console.trace()` to StateManager.setValue() when fieldId === "d_12" to capture the call stack.
