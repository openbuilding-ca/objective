# Section 02 Refactoring Plan: Consolidating Defaults

**Created**: 2024-08-30

## 1. Objective

This document outlines the plan to complete the Pattern A refactoring of `4011-Section02.js` by addressing the final remaining issue: **consolidating default values**.

The goal is to eliminate the anti-pattern of hardcoding default values within the `TargetState` and `ReferenceState` objects, and instead use the `sectionRows` field definitions as the **single source of truth**. This aligns with the project's core architectural principles as defined in `DUAL-STATE-CHEATSHEET.md` (Phase 5).

## 2. The Problem: Duplicate Defaults and Calculation Instability

Currently, `4011-Section02.js` contains hardcoded default values in three places:

1.  The `sectionRows` definition (the correct single source of truth).
2.  The `TargetState.setDefaults()` method.
3.  The `ReferenceState.setDefaults()` method.

This duplication violates architectural principles and, as noted in `DUAL-STATE-CHEATSHEET.md` and from previous attempts, has led to critical bugs when refactoring was attempted:

- **Calculation Instability**: "Wild e_10 value oscillations" in the Section 01 dashboard.
- **State Mixing**: Incorrect values propagating through the system.
- **Maintenance Overhead**: Changes to a default value must be made in multiple places, creating a high risk of data drift and corruption.

The instability in `e_10` (Reference TEUI in S01) strongly suggests that the previous refactoring attempts failed to correctly initialize and publish key Reference values (like `ref_h_15`, conditioned area) to the global `StateManager` on which Section 01 depends.

## 3. The Solution: Adopt the Proven S09 Pattern

The proposed solution is to adopt the successful and documented defaults pattern from `4011-Section09.js`. This approach is proven to work without breaking calculation flow.

The implementation involves three main steps:

### Step 1: Create a `getFieldDefault()` Helper Function

A helper function will be added to the module to read default values directly from the `sectionRows` object. This centralizes the lookup logic.

```javascript
/**
 * Retrieves a field's default value from the sectionRows definition.
 * @param {string} fieldId The ID of the field (e.g., "d_12").
 * @returns {string|null} The default value or null if not found.
 */
function getFieldDefault(fieldId) {
  for (const row of Object.values(sectionRows)) {
    if (row.cells) {
      for (const cell of Object.values(row.cells)) {
        if (cell.fieldId === fieldId && cell.value !== undefined) {
          return cell.value;
        }
      }
    }
  }
  return null;
}
```

### Step 2: Refactor `TargetState.setDefaults()`

The hardcoded object in `TargetState.setDefaults()` will be replaced with calls to the new `getFieldDefault()` helper for every user-configurable field. This ensures the Target model always initializes with values directly from the single source of truth.

```javascript
// In TargetState object
setDefaults: function () {
  this.data = {
    d_12: getFieldDefault("d_12") || "A-Assembly",
    d_13: getFieldDefault("d_13") || "OBC SB10 5.5-6 Z6",
    d_14: getFieldDefault("d_14") || "Utility Bills",
    d_15: getFieldDefault("d_15") || "Self Reported",
    h_12: getFieldDefault("h_12") || "2022",
    h_13: getFieldDefault("h_13") || "50",
    h_14: getFieldDefault("h_14") || "Three Feathers Terrace",
    h_15: getFieldDefault("h_15") || "1,427.20", // Critical for e_10
    l_12: getFieldDefault("l_12") || "$0.1300",
    l_13: getFieldDefault("l_13") || "$0.5070",
    l_14: getFieldDefault("l_14") || "$1.6200",
    l_15: getFieldDefault("l_15") || "$180.00",
    l_16: getFieldDefault("l_16") || "$1.5000",
  };
  console.log("S02: Target defaults set from field definitions.");
},
```

### Step 3: Refactor `ReferenceState.setDefaults()`

This is the most critical step. The `ReferenceState.setDefaults()` method will also be refactored to first load all base values from the field definitions, and then **apply only the specific overrides** required for the Reference model. This maintains state isolation while ensuring all fields are correctly initialized.

```javascript
// In ReferenceState object
setDefaults: function () {
  this.data = {
    // 1. Initialize with base defaults from the single source of truth
    d_12: getFieldDefault("d_12") || "A-Assembly",
    d_14: getFieldDefault("d_14") || "Utility Bills",
    d_15: getFieldDefault("d_15") || "Self Reported",
    h_13: getFieldDefault("h_13") || "50",
    h_14: getFieldDefault("h_14") || "Three Feathers Terrace",
    h_15: getFieldDefault("h_15") || "1,427.20", // CRITICAL for e_10
    l_12: getFieldDefault("l_12") || "$0.1300",
    l_13: getFieldDefault("l_13") || "$0.5070",
    l_14: getFieldDefault("l_14") || "$1.6200",
    l_15: getFieldDefault("l_15") || "$180.00",
    l_16: getFieldDefault("l_16") || "$1.5000",

    // 2. Apply Reference-specific overrides
    d_13: "OBC SB10 5.5-6 Z5 (2010)", // Use an earlier building code for Reference
    h_12: "2020",                   // Use an earlier reporting year for Reference
  };
  console.log("S02: Reference defaults set from field definitions with overrides.");
},
```

## 4. Why This Approach Will Succeed

This plan directly addresses the root causes of the previous failures:

1.  **Preserves Initialization Flow**: It does not alter the `ModeManager.initialize()` logic. The critical step of publishing `ref_h_12`, `ref_h_13`, and `ref_h_15` to the global `StateManager` will still occur, but will now be fed with values sourced correctly and reliably from the field definitions.
2.  **Guarantees Critical Values**: By explicitly including `h_15` in both `setDefaults` methods, we ensure the conditioned area is always populated, preventing the calculation errors in S01's `e_10` that result from a missing area value.
3.  **Adheres to Best Practices**: This change brings Section 02 into full compliance with the architecture documented in `DUAL-STATE-CHEATSHEET.md`, making the code more maintainable, predictable, and robust.
4.  **Follows a Proven Pattern**: It precisely replicates the successful, non-breaking defaults implementation from Section 09.

By executing this plan, we can safely complete the refactoring of Section 02, eliminate the technical debt of duplicated defaults, and stabilize the calculation flow for the entire application.
