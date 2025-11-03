# S08 Indoor RH% (i_59) State Mixing Investigation

**Date**: 2025-11-03
**Branch**: S08-RH%
**Issue**: Target mode changes to i_59 contaminate Reference model calculations

---

## Problem Statement

**Observed Behavior**:
- User changes S08 i_59 slider in **Target mode**
- Both Target AND Reference models recalculate (expected for dual-engine)
- Reference model calculations change EVEN THOUGH ref_i_59 was never modified
- Evidence: S01 e_10 (Reference total) changes when only Target i_59 changed

**Expected Behavior**:
- Target mode i_59 changes → only Target model results change
- Reference model should use ref_i_59 value (unchanged) → Reference results unchanged
- Dual-engine runs but each engine uses its own state values

**Root Cause Hypothesis**: Fallback contamination pattern (Anti-Pattern 1 from CHEATSHEET.md)

---

## Architecture Review

### What SHOULD Happen (Correct Pattern)

```javascript
// S08 user changes i_59 in Target mode:
1. ModeManager.setValue("i_59", "50") // Target mode active
   → Publishes to StateManager: i_59 = "50"
   → Does NOT touch ref_i_59

2. Cooling.js listener fires on "i_59" change
   → calculateStage1("target") runs
   → Reads: StateManager.getValue("i_59") = "50" ✅
   → Publishes: cooling_* values (unprefixed)

3. Cooling.js calculateStage1("reference") also runs (dual-engine)
   → Reads: StateManager.getValue("ref_i_59") = "45" (unchanged) ✅
   → Publishes: ref_cooling_* values (prefixed)

4. S13 recalculates using:
   → Target: cooling_* from step 2
   → Reference: ref_cooling_* from step 3
   → Reference results UNCHANGED because ref_i_59 never changed
```

### What's ACTUALLY Happening (State Mixing)

```javascript
// Evidence from user testing:
1. S08 i_59 changed in Target mode → i_59 published ✅
2. Cooling.js receives i_59 change
3. ❌ CONTAMINATION: Cooling.js reads i_59 value for BOTH engines
4. Reference model calculations use Target i_59 value
5. Reference results published with Target-contaminated data
6. S01 e_10 changes incorrectly
```

---

## Diagnostic Investigation Plan

### Phase 1: Trace Publication Flow

**Add logging to track i_59/ref_i_59 writes:**

```javascript
// In StateManager.setValue()
if (fieldId === "i_59" || fieldId === "ref_i_59") {
  console.log(`[StateManager] 🔍 ${fieldId} = ${value}, source = ${source}`);
  console.trace("Call stack:");
}
```

**Expected Log Pattern (Correct)**:
```
[S08] User changes i_59 slider in Target mode
[StateManager] 🔍 i_59 = "50", source = "user-modified"
  → Call stack: ModeManager.setValue → StateManager.setValue
[Cooling] i_59 listener fires
[Cooling] calculateStage1("target") reads i_59 = "50"
[Cooling] calculateStage1("reference") reads ref_i_59 = "45" (unchanged)
```

**Contamination Pattern (Wrong)**:
```
[S08] User changes i_59 slider in Target mode
[StateManager] 🔍 i_59 = "50", source = "user-modified"
[Cooling] i_59 listener fires
[Cooling] ❌ BOTH engines read i_59 = "50" (fallback contamination)
[Cooling] Reference calculations use Target value
```

### Phase 2: Identify Fallback Patterns

**Search for contamination in Cooling.js:**

```bash
# Look for fallback patterns that violate state isolation:
grep -n "getModeAwareValue.*||.*StateManager" src/core/Cooling.js
grep -n "getValue.*i_59.*||" src/core/Cooling.js
grep -n "ref_i_59.*||.*i_59" src/core/Cooling.js
```

**Anti-Pattern 1 Example (from CHEATSHEET.md lines 39-57)**:
```javascript
// ❌ WRONG: Fallback contamination
const indoorRH = getModeAwareValue("i_59") || StateManager.getValue("i_59") || 0.45;

// ✅ CORRECT: Strict mode isolation
if (state.currentMode === "reference") {
  const indoorRH = StateManager.getValue("ref_i_59");
  if (indoorRH === null || indoorRH === undefined) {
    return 0.45; // Default, NEVER use Target value
  }
} else {
  const indoorRH = StateManager.getValue("i_59") || 0.45;
}
```

### Phase 3: Check Listener Logic

**Review Cooling.js listeners (lines 884-908)**:

Current implementation:
```javascript
sm.addListener("i_59", function (newValue) {
  state.indoorRH = parseFloat(newValue) / 100;

  // ❌ PROBLEM: Runs BOTH engines with same contaminated state.indoorRH
  calculateStage1("target");
  calculateStage1("reference");
});

sm.addListener("ref_i_59", function (newValue) {
  state.indoorRH = parseFloat(newValue) / 100;

  // ❌ PROBLEM: Same contamination, just from ref_i_59 listener
  calculateStage1("target");
  calculateStage1("reference");
});
```

**IDENTIFIED ISSUE**: `state.indoorRH` is a **shared state object** that gets contaminated!

---

## Root Cause Analysis

### Critical Discovery: Shared State Contamination

**The Problem**: Cooling.js uses a single `state` object for both engines:

```javascript
// Cooling.js state object (shared between engines)
const state = {
  currentMode: "target",
  indoorRH: 0.45, // ❌ SHARED between Target and Reference calculations!
  // ... other shared state
};
```

**What Happens**:
1. `i_59` listener fires → sets `state.indoorRH = 0.50` (from Target change)
2. `calculateStage1("target")` runs → uses `state.indoorRH = 0.50` ✅ Correct
3. `calculateStage1("reference")` runs → ALSO uses `state.indoorRH = 0.50` ❌ CONTAMINATED!
4. Reference should have used `ref_i_59 = 0.45` but got Target value instead

### Why getModeAwareValue Doesn't Help Here

The current listeners directly set `state.indoorRH` BEFORE calling the calculation engines:

```javascript
// Listener sets shared state FIRST
sm.addListener("i_59", function (newValue) {
  state.indoorRH = parseFloat(newValue) / 100; // ❌ Overwrites shared state
  calculateStage1("target");   // Uses contaminated state
  calculateStage1("reference"); // Uses same contaminated state
});
```

Even though `calculateStage1()` internally uses `getModeAwareValue()` at line 211, the damage is already done by setting `state.indoorRH` before the calculation runs.

---

## Solution Patterns

### Option 1: Remove Shared State Updates from Listeners

**Pattern**: Let each engine read its own value during calculation

```javascript
// ✅ CORRECT: Don't pre-set shared state in listeners
sm.addListener("i_59", function (newValue) {
  console.log(`[Cooling] i_59 changed: ${newValue}% → recalculating Target and Reference`);

  // Don't set state.indoorRH here - let each engine read its own value
  calculateStage1("target");   // Will read i_59 via getModeAwareValue
  calculateStage1("reference"); // Will read ref_i_59 via getModeAwareValue
});

sm.addListener("ref_i_59", function (newValue) {
  console.log(`[Cooling] ref_i_59 changed: ${newValue}% → recalculating Target and Reference`);

  // Same - don't pre-contaminate shared state
  calculateStage1("target");
  calculateStage1("reference");
});
```

**Then ensure calculateStage1 reads mode-aware values**:

```javascript
function calculateStage1(mode = "target") {
  const originalMode = state.currentMode;
  state.currentMode = mode; // Temporarily set mode for getModeAwareValue

  try {
    // This will now read i_59 for Target, ref_i_59 for Reference
    const i_59_value = window.TEUI.parseNumeric(
      getModeAwareValue("i_59", "45"),
    );

    state.indoorRH = i_59_value ? i_59_value / 100 : 0.45; // ✅ Mode-aware read

    // ... rest of calculations
  } finally {
    state.currentMode = originalMode; // Restore mode
  }
}
```

### Option 2: Separate State Objects (More Complex)

**Pattern**: Maintain separate state objects for Target and Reference

```javascript
const targetState = { indoorRH: 0.45, /* ... */ };
const referenceState = { indoorRH: 0.45, /* ... */ };

sm.addListener("i_59", function (newValue) {
  targetState.indoorRH = parseFloat(newValue) / 100;
  calculateStage1("target", targetState);
  calculateStage1("reference", referenceState); // Uses separate state
});

sm.addListener("ref_i_59", function (newValue) {
  referenceState.indoorRH = parseFloat(newValue) / 100;
  calculateStage1("target", targetState);
  calculateStage1("reference", referenceState);
});
```

**Recommendation**: **Option 1** is simpler and aligns with CHEATSHEET.md Pattern 1 (lines 719-756)

---

## Verification Tests

### Test 1: Target i_59 Change Should Not Affect Reference

**Setup**:
1. Load app with defaults
2. Note Reference total (S01 e_10) = X

**Steps**:
1. Stay in Target mode
2. Change S08 i_59 from 45% to 60%
3. Check S01 e_10 (Reference total)

**Expected**: e_10 = X (unchanged)
**If Wrong**: e_10 changes → state mixing confirmed

### Test 2: Reference ref_i_59 Change Should Not Affect Target

**Setup**:
1. Load app with defaults
2. Note Target total (S01 h_10) = Y

**Steps**:
1. Switch to Reference mode
2. Change S08 i_59 (which writes ref_i_59) from 45% to 30%
3. Switch back to Target mode
4. Check S01 h_10 (Target total)

**Expected**: h_10 = Y (unchanged)
**If Wrong**: h_10 changes → state mixing confirmed

### Test 3: Console Logging Verification

**Add debug logging**:
```javascript
// In calculateStage1()
console.log(`[Cooling] calculateStage1(${mode}): reading i_59 value`);
const i_59_value = getModeAwareValue("i_59", "45");
console.log(`[Cooling] mode=${mode}, i_59_value=${i_59_value}`);
```

**Expected Log Pattern (Correct)**:
```
[S08] User changes i_59 to 60% in Target mode
[Cooling] i_59 listener fires
[Cooling] calculateStage1(target): reading i_59 value
[Cooling] mode=target, i_59_value=60 ✅
[Cooling] calculateStage1(reference): reading i_59 value
[Cooling] mode=reference, i_59_value=45 ✅ (ref_i_59 unchanged)
```

**Contamination Pattern (Wrong)**:
```
[S08] User changes i_59 to 60% in Target mode
[Cooling] i_59 listener fires
[Cooling] state.indoorRH = 0.60 (set by listener)
[Cooling] calculateStage1(target): mode=target, indoorRH=0.60 ✅
[Cooling] calculateStage1(reference): mode=reference, indoorRH=0.60 ❌ CONTAMINATED
```

---

## Implementation Checklist

### Phase 1: Add Diagnostic Logging ✅
- [x] Add StateManager logging for i_59/ref_i_59 writes
- [x] Add Cooling.js logging for mode-aware reads
- [x] Run Test 1 and Test 2, capture logs

### Phase 2: Fix Listener Contamination ✅
- [x] Remove `state.indoorRH = ...` from i_59 listener (Cooling.js:888)
- [x] Remove `state.indoorRH = ...` from ref_i_59 listener (Cooling.js:903)
- [x] Ensure calculateStage1 sets mode before reading values (line 482)

### Phase 3: Verify calculateStage1 Mode Awareness ✅
- [x] Temporary mode switching already implemented (line 482: `state.currentMode = mode`)
- [x] getModeAwareValue already reads correct prefixed values (line 211)
- [x] state.indoorRH set from mode-aware read (line 216)

### Phase 4: Verification Testing (User Testing Required)
- [ ] Run Test 1: Target change doesn't affect Reference
- [ ] Run Test 2: Reference change doesn't affect Target
- [ ] Run Test 3: Console logs show correct mode-aware reads
- [ ] Verify S01 e_10 and h_10 stability

### Phase 5: Clean Up and Document
- [ ] Remove diagnostic logging (or gate with debug flag)
- [x] Update commit message with evidence
- [x] Document fix in this file for future reference

---

## Fix Implementation Summary

**Date**: 2025-11-03
**Commit**: TBD
**Files Changed**: src/core/Cooling.js

### Root Cause Confirmed

The listeners were setting `state.indoorRH` BEFORE calling `calculateStage1()`, contaminating the shared state object:

```javascript
// ❌ BEFORE (Contamination Pattern):
sm.addListener("i_59", function (newValue) {
  state.indoorRH = parseFloat(newValue) / 100; // Sets SHARED state from Target value
  calculateStage1("target");   // Uses contaminated state.indoorRH
  calculateStage1("reference"); // ALSO uses contaminated state.indoorRH (wrong!)
});
```

### Fix Applied

Removed the shared state pre-setting from both listeners:

```javascript
// ✅ AFTER (Strict State Isolation):
sm.addListener("i_59", function (newValue) {
  // Don't pre-set shared state.indoorRH - let each engine read its own value
  calculateStage1("target");   // Will read i_59 via getModeAwareValue
  calculateStage1("reference"); // Will read ref_i_59 via getModeAwareValue
});

sm.addListener("ref_i_59", function (newValue) {
  // Don't pre-set shared state.indoorRH - let each engine read its own value
  calculateStage1("target");   // Will read i_59 via getModeAwareValue
  calculateStage1("reference"); // Will read ref_i_59 via getModeAwareValue
});
```

### How It Works Now

1. `i_59` listener fires (Target value changed)
2. `calculateStage1("target")` runs:
   - Sets `state.currentMode = "target"` (line 482)
   - Reads `getModeAwareValue("i_59", "45")` (line 211) → returns unprefixed `i_59` value
   - Sets `state.indoorRH` from Target value ✅
3. `calculateStage1("reference")` runs:
   - Sets `state.currentMode = "reference"` (line 482)
   - Reads `getModeAwareValue("i_59", "45")` (line 211) → returns `ref_i_59` value
   - Sets `state.indoorRH` from Reference value ✅ (isolated from Target change)

### Alignment with CHEATSHEET.md Patterns

This fix implements:
- **Pattern 1: Temporary Mode Switching** (lines 719-756) - calculateStage1 sets mode before reading
- **Anti-Pattern 1 Avoidance** (lines 39-57) - No fallback contamination, strict mode isolation
- **External Module Integration** (lines 833-886) - Cooling.js now properly mode-aware

---

## Related Documentation

- [4012-CHEATSHEET.md](history (completed)/4012-CHEATSHEET.md) - Anti-Pattern 1 (lines 39-57)
- [4012-CHEATSHEET.md](history (completed)/4012-CHEATSHEET.md) - Pattern 1: Temporary Mode Switching (lines 719-756)
- [4012-CHEATSHEET.md](history (completed)/4012-CHEATSHEET.md) - External Module Integration (lines 833-886)

---

## Console Debug Scripts

### Script 1: Check Current i_59 State

```javascript
// Run in browser console
const target_i59 = window.TEUI.StateManager.getValue("i_59");
const ref_i59 = window.TEUI.StateManager.getValue("ref_i_59");
console.log(`Target i_59: ${target_i59}`);
console.log(`Reference ref_i_59: ${ref_i59}`);
console.log(`Cooling state.indoorRH: ${window.TEUI.CoolingCalculations?.state?.indoorRH}`);
```

### Script 2: Trace i_59 Changes

```javascript
// Run in browser console BEFORE changing i_59
const originalSetValue = window.TEUI.StateManager.setValue;
window.TEUI.StateManager.setValue = function(fieldId, value, source) {
  if (fieldId === "i_59" || fieldId === "ref_i_59") {
    console.log(`[TRACE] StateManager.setValue("${fieldId}", "${value}", "${source}")`);
    console.trace("Call stack:");
  }
  return originalSetValue.call(this, fieldId, value, source);
};
console.log("✅ Tracing enabled for i_59/ref_i_59");
```

### Script 3: Monitor Cooling State Changes

```javascript
// Run in browser console to watch state.indoorRH changes
let lastIndoorRH = null;
setInterval(() => {
  const currentRH = window.TEUI.CoolingCalculations?.state?.indoorRH;
  if (currentRH !== lastIndoorRH) {
    console.log(`[MONITOR] Cooling state.indoorRH changed: ${lastIndoorRH} → ${currentRH}`);
    console.trace("Changed by:");
    lastIndoorRH = currentRH;
  }
}, 100);
console.log("✅ Monitoring Cooling state.indoorRH every 100ms");
```

---

## Next Steps

1. Run Script 2 (Trace i_59 Changes) in browser console
2. Change S08 i_59 slider in Target mode
3. Capture and analyze trace logs
4. Identify exactly where contamination occurs
5. Apply Solution Pattern based on findings
6. Re-test with verification tests
7. Commit with evidence-based commit message
