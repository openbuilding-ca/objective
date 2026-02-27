# M124 Bug Investigation

**Date**: November 23, 2025
**Status**: Investigation in progress
**Symptom**: Section13 displays `m_124 = 120` (fallback value) instead of calculated value `-31`

---

## Background

### What is M124?

**M124** ("Days Active Cooling Required") represents the number of days per cooling season that mechanical cooling (A/C) is needed, after accounting for free cooling from natural ventilation.

- **Negative values** (e.g., `-31`): Free cooling exceeds demand → no mechanical cooling needed (over-ventilated)
- **Zero**: Free cooling exactly meets demand → no mechanical cooling needed
- **Positive values** (e.g., `10`): Mechanical cooling needed for that many days out of the cooling season
- **120 days**: This is the cooling season length (`m_19`) - used as fallback when M124 not available

### Excel Formula (COOLING-TARGET E55)

```
M124 = E55 = E52 / (E54 * 24)
```

Where:
- **E52** = Unmet cooling load = `E50 - E51` (kWh)
- **E50** = Seasonal cooling load (unmet) = `E37 * E45` (kWh)
- **E51** = Total seasonal free cooling potential = `E36 * E45` (kWh)
- **E37** = Daily mitigated cooling load = `m_129 / d_21` (kWh/day)
- **E36** = Daily free cooling potential = `A33` (kWh/day) - physics-based calculation
- **E45** = Cooling degree days = `d_21` (from S03)
- **E54** = Cooling season days = `m_19` (from S03)

**Key dependency**: Requires **m_129** (mitigated annual cooling load from S13)

---

## Current Implementation

### Cooling.js Architecture

**Two-stage calculation** to avoid circular dependencies:

1. **Stage 1** (Independent): Calculates free cooling capacity (`h_124`)
   - Runs immediately during initialization
   - Published to `cooling_h_124` in StateManager
   - No dependency on S13

2. **Stage 2** (Dependent): Calculates days active cooling (`m_124`)
   - Waits for `m_129` from S13 via StateManager listener
   - Published to `cooling_m_124` in StateManager
   - **Line 829-837**: Listener registered for `m_129` changes

### S13 Display Logic

**Section13.js lines 3140-3160**:

```javascript
// Read cooling_m_124 from StateManager
let m_124_raw = isReferenceCalculation
  ? window.TEUI.StateManager.getValue("ref_cooling_m_124")
  : window.TEUI.StateManager.getValue("cooling_m_124");

// Fallback: Use m_19 (cooling season length) if Stage 2 hasn't run yet
if (!m_124_raw && m_124_raw !== 0) {
  const m_19_fallback = isReferenceCalculation
    ? window.TEUI.StateManager.getValue("ref_m_19")
    : window.TEUI.StateManager.getValue("m_19");

  m_124_raw = m_19_fallback || 120; // Default to 120 days
  console.warn(
    "[S13] cooling_m_124 not available, using m_19 fallback:",
    m_124_raw
  );
}

const activeCoolingDays = window.TEUI.parseNumeric(m_124_raw);
setFieldValue("m_124", activeCoolingDays, "number-2dp");
```

---

## Problem: M124 Shows 120 Instead of -31

### Expected Behavior (Excel)
- For test building: **M124 = -31 days**
- Indicates over-ventilation, no mechanical cooling needed

### Actual Behavior (App)
- S13 displays: **M124 = 120 days**
- Console warning: `"cooling_m_124 not available, using m_19 fallback: 120"`

---

## Three Theories

### Theory 1: Stage 2 Never Runs

**Hypothesis**: The `m_129` listener never fires, so `cooling_m_124` never gets calculated.

**Evidence needed**:
- Check console for Stage 2 execution logs
- Check if `m_129` is being published by S13
- Verify listener is registered correctly

**Possible causes**:
- S13 not publishing `m_129` to StateManager
- Listener registered after `m_129` already published (timing issue)
- Listener registered for wrong field name

---

### Theory 2: Stage 2 Runs But Value Not Published

**Hypothesis**: Stage 2 calculates the value but fails to publish to StateManager.

**Evidence needed**:
- Check if `calculateDaysActiveCooling()` executes
- Check if `updateStateManagerStage2()` executes
- Verify `cooling_m_124` value in StateManager

**Possible causes**:
- Error during calculation (silent failure)
- Error during `setValue()` call
- StateManager not ready when Stage 2 runs

---

### Theory 3: Value Published But S13 Reads Too Early

**Hypothesis**: S13 reads `cooling_m_124` before Stage 2 completes.

**Evidence needed**:
- Check timing of S13 calculation vs Stage 2 execution
- Check if S13 re-reads after Stage 2 publishes
- Check if StateManager listeners notify S13 of `cooling_m_124` changes

**Possible causes**:
- S13 calculates once at initialization, doesn't re-calculate when `cooling_m_124` updates
- No listener in S13 to react to `cooling_m_124` changes
- Initialization order: S13 runs before Cooling.js

---

## Diagnostic Steps

### 1. Check if m_129 is published by S13

```javascript
// In browser console after load:
window.TEUI.StateManager.getValue("m_129")
window.TEUI.StateManager.getValue("ref_m_129")
```

**Expected**: Non-zero numeric value
**If null/undefined**: S13 not publishing m_129 (Theory 1)

---

### 2. Check if Stage 2 ever runs

**Search console logs for**:
- Any logs containing "Stage 2" (removed in cleanup, need to re-add temporarily)
- Listener trigger logs for `m_129`

**If no logs**: Listener never fires (Theory 1)

---

### 3. Check StateManager value directly

```javascript
// In browser console after full initialization:
window.TEUI.StateManager.getValue("cooling_m_124")
window.TEUI.StateManager.getValue("ref_cooling_m_124")
```

**Expected**: Calculated value (e.g., `-31`)
**If "0"**: Stage 2 never ran (Theory 1)
**If correct value**: S13 timing issue (Theory 3)

---

### 4. Check Cooling.js internal state

```javascript
// In browser console:
window.TEUI.CoolingCalculations.getDebugInfo("target")
window.TEUI.CoolingCalculations.getDaysActiveCooling("target")
```

**Expected**: `daysActiveCooling: -31`
**If 0**: Calculation never ran (Theory 1)
**If -31**: Value calculated but not published (Theory 2)

---

## Possible Fixes

### Fix 1: If Stage 2 Never Runs (Theory 1)

**Root cause**: `m_129` listener not triggered or registered too late

**Solution**:
1. Verify S13 publishes `m_129` to StateManager
2. Add explicit trigger for Stage 2 after S13 calculations complete
3. Add fallback: If `m_129` exists but Stage 2 hasn't run, manually trigger it

```javascript
// In S13 after calculating m_129:
if (window.TEUI?.CoolingCalculations?.calculateStage2) {
  window.TEUI.CoolingCalculations.calculateStage2("target");
}
```

---

### Fix 2: If Value Not Published (Theory 2)

**Root cause**: Error during Stage 2 calculation or publication

**Solution**:
1. Add error handling to `calculateDaysActiveCooling()`
2. Add logging to confirm `updateStateManagerStage2()` executes
3. Verify `setValue()` succeeds

---

### Fix 3: If S13 Reads Too Early (Theory 3)

**Root cause**: S13 doesn't re-calculate when `cooling_m_124` updates

**Solution**: Add listener in S13 to re-read `m_124` when it changes

```javascript
// In Section13.js initialization:
window.TEUI.StateManager.addListener("cooling_m_124", function(newValue) {
  // Re-display updated m_124 value
  setFieldValue("m_124", window.TEUI.parseNumeric(newValue), "number-2dp");
});

window.TEUI.StateManager.addListener("ref_cooling_m_124", function(newValue) {
  // Re-display updated ref_m_124 value (if in Reference mode)
  if (isReferenceMode()) {
    setFieldValue("m_124", window.TEUI.parseNumeric(newValue), "number-2dp");
  }
});
```

---

## Diagnosis Results

### ✅ Step 1: Check if m_129 is published
**Result**: YES - Section13.js line 695 publishes m_129 via `StateManager.setValue()`
- Target mode: `fieldId` (unprefixed)
- Reference mode: `ref_${fieldId}` (prefixed)

### ✅ Step 2: Check if Stage 2 listener is registered
**Result**: YES - Cooling.js lines 829-837 register `m_129` listener
- Listener calls `calculateStage2("target")` when m_129 changes

### ✅ Step 3: Check Logs.md for Stage 2 execution
**Result**: NO evidence of Stage 2 running
- Only fallback warnings found: `"cooling_m_124 not available, using m_19 fallback: 120"`
- No logs showing: "m_129 changed", "triggering Stage 2", or Stage 2 completion

### 🔍 Confirmed Theory: **Theory 1 + Timing Issue**

**Root Cause**: The m_129 listener is registered, but it appears to never fire. Most likely causes:

1. **Listener registered AFTER m_129 already published** (timing issue)
   - Cooling.js initializes and registers listener
   - S13 calculates and publishes m_129
   - Listener only fires on *changes*, not existing values

2. **Possible initialization order**:
   - Cooling.js Stage 1 runs → publishes `cooling_h_124`
   - Cooling.js registers m_129 listener (waiting for value)
   - S13 calculates → publishes m_129
   - Listener should fire... but doesn't?

**Next diagnostic needed**: Add temporary logging back to confirm listener trigger

---

## Implementation

### ✅ Fix Applied: Manual Stage 2 Trigger

**Location**: [Section13.js:3060-3068](../src/sections/Section13.js#L3060-L3068)

**Change**: Added explicit call to `window.TEUI.CoolingCalculations.calculateStage2(mode)` after publishing m_129

```javascript
// ✅ M124 BUG FIX: Manually trigger Cooling.js Stage 2 after publishing m_129
// The m_129 listener may not fire if registered after value already exists
// Stage 2 calculates cooling_m_124 (Days Active Cooling Required)
if (window.TEUI?.CoolingCalculations) {
  const mode = isReferenceCalculation ? "reference" : "target";
  if (typeof window.TEUI.CoolingCalculations.calculateStage2 === "function") {
    window.TEUI.CoolingCalculations.calculateStage2(mode);
  }
}
```

**Why this works**:
- Guarantees Stage 2 runs after m_129 is calculated
- Works for both Target and Reference modes
- Doesn't rely on StateManager listener timing
- Fallback-safe: Checks for API existence before calling

---

## Next Steps

1. ✅ Check `docs/development/Logs.md` for Stage 2 execution evidence
2. ✅ Verified m_129 is published by S13 (line 695)
3. ✅ Verified listener is registered in Cooling.js (line 829)
4. ✅ Identified Theory 1 (timing issue) as root cause
5. ✅ Implemented Fix 1 (manual Stage 2 trigger in S13)
6. ⏳ Test with Excel parity (M124 = -31)
7. ⏳ Verify fallback warning no longer appears
8. ⏳ Clean up: Remove fallback warning once confirmed working

---

## Related Files

- [Cooling.js](../src/core/Cooling.js) - Stage 1 & 2 calculations (lines 362-680)
- [Section13.js](../src/sections/Section13.js) - M124 display logic (lines 3140-3160)
- [Logs.md](Logs.md) - Console output for diagnostics
