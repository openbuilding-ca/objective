# State Contamination Bug: Target d_13 Changes Affecting Reference Model

**Date**: 2025-11-10
**Status**: Active Investigation
**Severity**: Critical - Breaks fundamental dual-state architecture assumption

## Problem Statement

When a user changes `d_13` (Reference Standard) in **Target mode**, this change is contaminating the **Reference model's** baseline values. This violates the core principle of 100% state isolation between Target and Reference models.

### Observed Symptom

**Test Case**: Set both Target and Reference models to use "PH Classic" reference standard at d_13.
- Expected: d_65 = 2.1 W/m² in both models, m_65 = 100% (perfect compliance)
- Actual: d_65 = 2.1 W/m² in Target, but m_65 shows **238%** instead of 100%

**Root Cause Hypothesis**: Target model's d_13 changes are triggering `ReferenceState.onReferenceStandardChange()`, which updates the Reference model's ReferenceValues.js overlay system. This means the Reference model's baseline is being altered by Target model user actions.

## Dual-State Architecture Overview

### The Two Independent Systems

1. **Target Model**
   - User-editable fields: `d_13`, `d_65`, `h_65`, etc.
   - Represents the actual building being designed
   - Can have any values (user inputs + calculations)

2. **Reference Model**
   - User-editable fields: `ref_d_13`, `ref_d_65`, `ref_h_65`, etc.
   - Represents the code-compliant baseline for comparison
   - Uses ReferenceValues.js overlay to apply legislated baseline values

### Critical Isolation Requirement

**The Target model must NEVER affect the Reference model, and vice versa.**

Each model has:
- Separate field namespace (d_13 vs ref_d_13)
- Separate state storage (TargetState vs ReferenceState)
- Separate calculation flows (calculateTargetModel() vs calculateReferenceModel())
- Separate UI modes (Target mode vs Reference mode)

### ReferenceValues.js Overlay System

ReferenceValues.js contains legislated code baseline values for different reference standards:
- "PH Classic": d_65 = 2.1 W/m²
- "PHIUS 2021": d_65 = 3.2 W/m²
- etc.

When `ref_d_13` changes in Reference mode, `ReferenceState.onReferenceStandardChange(newStandard)` is called to load the appropriate baseline values from ReferenceValues.js.

**KEY INSIGHT**: This overlay system should ONLY be triggered by `ref_d_13` changes, NOT by `d_13` changes.

## Bug Locations Identified

### ✅ ARCHITECTURAL CONTEXT (from 4012-CHEATSHEET.md)

**Anti-Pattern 6: Cross-Section Listener Contamination**

Sections should:
- ✅ Listen to **StateManager** for external dependencies (both unprefixed AND ref_ prefixed)
- ✅ Target field changes (d_13) → trigger Target model calculations only
- ✅ Reference field changes (ref_d_13) → trigger Reference model calculations + ReferenceState overlay updates
- ❌ NEVER have d_13 listener call `ReferenceState.onReferenceStandardChange()`

**Correct Pattern:**
```javascript
// ✅ Listen to Target standard changes
window.TEUI.StateManager.addListener("d_13", () => {
  calculateTargetModel(); // Only Target recalculates, NO ReferenceState contamination
});

// ✅ Listen to Reference standard changes
window.TEUI.StateManager.addListener("ref_d_13", () => {
  ReferenceState.onReferenceStandardChange(); // Only ref_d_13 should trigger this
  calculateReferenceModel(); // Only Reference recalculates
});
```

### Pattern Found in Multiple Sections

**CONFIRMED ANTIPATTERN**: Sections 05, 06, 11, 12, 13, 14 all contain this bug in ModeManager.init():

```javascript
// ❌ ANTIPATTERN: d_13 listener contaminating ReferenceState
if (window.TEUI?.StateManager?.addListener) {
  window.TEUI.StateManager.addListener("d_13", () => {
    ReferenceState.onReferenceStandardChange(); // ❌ BUG! Target changes contaminate Reference
  });
}
```

**Problem**: This listens to `d_13` (Target model field) and calls `ReferenceState.onReferenceStandardChange()`, which updates the Reference model's ReferenceValues.js overlay. This means Target model d_13 changes are altering Reference model baseline values.

### Section09 Had a Different Implementation

Section09 previously had this pattern (commit 6e3e052, now reverted):

```javascript
sm.addListener("d_13", () => {
  const newStandard = sm.getValue("d_13");
  if (newStandard && ReferenceState.onReferenceStandardChange) {
    ReferenceState.onReferenceStandardChange(newStandard); // ❌ BUG!
  }
  calculateTargetModel();
});
```

This was "fixed" to:

```javascript
sm.addListener("d_13", () => {
  // Target standard changed - only affects Target model calculations
  // DO NOT contaminate ReferenceState here!
  calculateTargetModel();
  updateAllReferenceIndicators();
  ModeManager.updateCalculatedDisplayValues();
});

sm.addListener("ref_d_13", () => {
  // Reference standard changed - update ReferenceState with new ReferenceValues
  const newStandard = sm.getValue("ref_d_13");
  if (newStandard && ReferenceState.onReferenceStandardChange) {
    ReferenceState.onReferenceStandardChange(newStandard);
    if (ModeManager.currentMode === "reference") {
      ModeManager.refreshUI();
    }
  }
  calculateReferenceModel();
  updateAllReferenceIndicators();
  ModeManager.updateCalculatedDisplayValues();
});
```

**However**: This fix was reverted because it may not be correct. Need to understand the full picture before applying fixes.

## Critical Finding: ReferenceState.setDefaults() Reading Wrong Field

**Section 11 Example (line 208-213):**
```javascript
setDefaults: function () {
  // ❌ BUG: Reading from d_13 (Target field) for Reference model initialization
  const currentStandard =
    window.TEUI?.StateManager?.getValue?.("d_13") || "OBC SB10 5.5-6 Z6";
  const referenceValues =
    window.TEUI?.ReferenceValues?.[currentStandard] || {};
  // ... applies referenceValues to ReferenceState
}
```

**Problem**: Reference model's `setDefaults()` is reading from **d_13** (Target model field) instead of **ref_d_13** (Reference model field). This creates hard-wired contamination at initialization!

**Combined Effect**:
1. ReferenceState.setDefaults() reads d_13 → uses Target's reference standard
2. d_13 listener calls ReferenceState.onReferenceStandardChange() → updates Reference overlay when Target changes
3. Result: Reference model is completely controlled by Target model's d_13 value

**Correct Pattern**:
```javascript
// ✅ ReferenceState should read ref_d_13
setDefaults: function () {
  const currentStandard =
    window.TEUI?.StateManager?.getValue?.("ref_d_13") || "OBC SB10 5.5-6 Z6";
  const referenceValues =
    window.TEUI?.ReferenceValues?.[currentStandard] || {};
  // ... applies referenceValues to ReferenceState
}
```

## Questions to Answer

### 1. Why do sections listen to d_13 at all?

If d_13 is a Target model field, why do sections need to listen to it? What Target model calculations depend on d_13?

**Investigation needed**: Check if Target model calculations actually use d_13 values, or if this listener is purely for triggering Reference model updates (which would be wrong).

### 2. What is the correct listener pattern?

Should sections:
- A) Listen to `d_13` → trigger Target calculations (NO ReferenceState updates)
- B) Listen to `ref_d_13` → trigger Reference calculations + ReferenceState updates
- C) Both A and B
- D) Something else entirely?

### 3. Where is ref_d_13 handled?

Currently only Section09 has a `ref_d_13` listener. Why don't other sections have this?

**Investigation needed**: Check if `ref_d_13` is handled centrally somewhere (Section02? ModeManager?) or if each section needs its own listener.

### 4. What does d_13 actually control?

Is d_13 used for:
- A) Setting which ReferenceValues to use for Target model calculations?
- B) Something else in Target model?
- C) Nothing in Target model (legacy code)?

### 5. Section02 vs other sections

Section02 is where d_13/ref_d_13 are defined. How does Section02 handle these changes? Does it propagate them correctly?

**Investigation needed**: Read Section02's d_13/ref_d_13 listeners carefully.

## Investigation Plan

1. **Review Section02** - Understand how d_13/ref_d_13 are defined and handled at the source
2. **Review ReferenceState.js** - Understand what `onReferenceStandardChange()` does exactly
3. **Review ModeManager** - Understand mode switching and state isolation mechanisms
4. **Review StateManager** - Understand field propagation and listener patterns
5. **Check Target calculations** - Do any Target model calculations actually use d_13?
6. **Document correct pattern** - Define the canonical listener pattern for d_13/ref_d_13
7. **Design comprehensive fix** - Fix all affected sections consistently
8. **Test thoroughly** - Verify no state contamination in multiple scenarios

## Testing Requirements

Before any fix is committed, must verify:

1. **Scenario 1**: Change d_13 in Target mode
   - Target model should recalculate if d_13 affects Target calculations
   - Reference model should NOT change at all
   - Compliance percentages (m_65, etc.) should remain stable if Reference hasn't changed

2. **Scenario 2**: Change ref_d_13 in Reference mode
   - Reference model should load new ReferenceValues and recalculate
   - Target model should NOT change at all
   - Compliance percentages should update to reflect new Reference baseline

3. **Scenario 3**: Switch modes without changing values
   - UI should update to show correct mode's values
   - No calculations should be triggered
   - No state contamination

4. **Scenario 4**: Change d_13 in Target, then switch to Reference
   - Reference model should show its own d_13 value (ref_d_13)
   - Reference model should NOT have been affected by Target d_13 change

## Comprehensive Fix Plan

### Two-Part Bug Pattern Identified

**Bug Part 1: ReferenceState.setDefaults() Contamination**
- Sections 05, 06, 11, 12, 13, 14 all have `ReferenceState.setDefaults()` reading from `d_13` instead of `ref_d_13`
- This hard-wires Reference model initialization to Target model's reference standard

**Bug Part 2: d_13 Listener Contamination**
- Same sections have `d_13` listener calling `ReferenceState.onReferenceStandardChange()`
- This makes Reference model update whenever Target model d_13 changes

### The Fix (Two Parts)

**Part 1: Fix ReferenceState.setDefaults()**
```javascript
// ❌ BEFORE:
setDefaults: function () {
  const currentStandard =
    window.TEUI?.StateManager?.getValue?.("d_13") || "OBC SB10 5.5-6 Z6"; // ❌ Wrong field
  const referenceValues = window.TEUI?.ReferenceValues?.[currentStandard] || {};
  // ...
}

// ✅ AFTER:
setDefaults: function () {
  const currentStandard =
    window.TEUI?.StateManager?.getValue?.("ref_d_13") || "OBC SB10 5.5-6 Z6"; // ✅ Correct field
  const referenceValues = window.TEUI?.ReferenceValues?.[currentStandard] || {};
  // ...
}
```

**Part 2: Remove d_13 Listener**
```javascript
// ❌ BEFORE:
if (window.TEUI?.StateManager?.addListener) {
  window.TEUI.StateManager.addListener("d_13", () => {
    ReferenceState.onReferenceStandardChange(); // ❌ Contamination
  });
}

// ✅ AFTER:
// Remove this listener entirely - d_13 changes should NOT affect Reference model
// If sections need d_13 for Target calculations, add separate listener without ReferenceState call
```

**Part 3: Add ref_d_13 Listener (if missing)**
```javascript
// ✅ ADD: Only ref_d_13 should trigger ReferenceState updates
if (window.TEUI?.StateManager?.addListener) {
  window.TEUI.StateManager.addListener("ref_d_13", () => {
    const newStandard = window.TEUI.StateManager.getValue("ref_d_13");
    if (newStandard && ReferenceState.onReferenceStandardChange) {
      ReferenceState.onReferenceStandardChange(newStandard);
    }
    if (ModeManager.currentMode === "reference") {
      ModeManager.refreshUI();
    }
  });
}
```

### Implementation Order

1. **Section 05**: Fix both ReferenceState.setDefaults() and remove d_13 listener
2. **Section 06**: Fix both ReferenceState.setDefaults() and remove d_13 listener
3. **Section 11**: Fix both ReferenceState.setDefaults() and remove d_13 listener
4. **Section 12**: Fix both ReferenceState.setDefaults() and remove d_13 listener
5. **Section 13**: Fix both ReferenceState.setDefaults() and remove d_13 listener
6. **Section 14**: Fix both ReferenceState.setDefaults() and remove d_13 listener
7. **Section 09**: Already partially fixed (has ref_d_13 listener), just needs testing

### Testing Protocol

After each section fix:
1. **Refresh page** → verify initialization uses correct ref_d_13
2. **Change d_13 in Target mode** → verify Reference model NOT affected
3. **Change ref_d_13 in Reference mode** → verify Reference model updates correctly
4. **Test m_65, m_66, m_67 compliance** → verify 100% when both models use same standard

After all sections fixed:
1. Run full 4-scenario test suite
2. Verify no cross-contamination logs
3. Test compliance percentages across all sections
4. Commit with comprehensive testing evidence

## Next Steps

1. ✅ **Investigation Complete** - Root cause identified
2. ✅ **Fix Plan Documented** - Two-part fix for 6 sections
3. **Get User Approval** - Confirm fix approach before implementation
4. **Implement Systematically** - One section at a time with testing
5. **Comprehensive Testing** - All 4 scenarios across all sections
6. **Commit with Evidence** - Include test results in commit message

## References

- [M-N-COMPLIANCE.md](./M-N-COMPLIANCE.md) - Related compliance percentage patterns
- Section09.js lines 2402-2421 - Example listener pattern (reverted)
- Sections 05, 06, 11, 12, 13, 14 - ModeManager.init() listener pattern
