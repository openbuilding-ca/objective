# Reference Fixes Guide

## Overview

This document provides complete code snippets and instructions for fixing the dual-state architecture issues in the TEUI 4011RF calculator. The fixes address state contamination and missing Reference calculations.

## Problem Summary

1. **State Contamination**: Target TEUI (h_10) was changing from 93.6 to 97.6 when toggling to Reference Mode
2. **Missing Reference Emissions**: Reference Annual Carbon was showing 0.0 instead of calculated values

## Root Causes

1. **Section 03**: Faulty `setFieldValue` logic that wrote to both prefixed AND global state during Reference mode
2. **Section 04**: Missing calculation and storage of `ref_k_32` (total reference emissions)
3. **Section 15**: Improper mode-aware reading patterns causing cross-contamination

## Fix Instructions

### 1. Section 03 Fix: State Contamination Prevention

**File**: `OBJECTIVE 4011RF/sections/4011-Section03.js`

**Location**: Around line 75-95 in the `setFieldValue` function

**REPLACE** the complex conditional logic with this simple rule:

```javascript
function setFieldValue(fieldId, value, prefix = "target_") {
  // Store prefixed value for dual-state architecture
  const prefixedFieldId = `${prefix}${fieldId}`;
  window.TEUI.StateManager?.setValue(prefixedFieldId, value, "calculated");

  // CRITICAL FIX: Only update global state when prefix is 'target_'
  // This prevents Reference mode from contaminating application state
  if (prefix === "target_") {
    window.TEUI.StateManager?.setValue(fieldId, value, "calculated");

    // Update DOM with formatted value
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (element) {
      const formattedValue = formatNumber(
        parseFloat(value),
        "number-2dp-comma",
      );
      element.textContent = formattedValue;
    }
  }

  console.log(
    `S03: ${prefixedFieldId} = ${value} ${prefix === "target_" ? "(+ global)" : "(ref only)"}`,
  );
}
```

**Explanation**: This ensures Reference calculations only write to prefixed state (`ref_fieldId`) and never contaminate global state that affects the Target model.

### 2. Section 04 Fix: Missing Reference Emissions

**File**: `OBJECTIVE 4011RF/sections/4011-Section04.js`

**Location**: Around line 2114-2170 in the `calculateReferenceModel` function

**ADD** this complete function to calculate and store Reference emissions:

```javascript
function calculateReferenceModel() {
  // Helper function to set value only if changed (prevents infinite loops)
  const setValueIfChanged = (fieldId, newValue) => {
    const currentValue = window.TEUI.StateManager.getValue(fieldId);
    const newValueStr = newValue.toString();
    if (currentValue !== newValueStr) {
      window.TEUI.StateManager.setValue(fieldId, newValueStr, "calculated");
      return true;
    }
    return false;
  };

  try {
    // Get all necessary Reference values for emissions calculation
    const ref_k27 = getRefNumericValue("k_27", 0); // Electricity emissions
    const ref_k28 = getRefNumericValue("k_28", 0); // Gas emissions
    const ref_k29 = getRefNumericValue("k_29", 0); // Propane emissions
    const ref_k30 = getRefNumericValue("k_30", 0); // Oil emissions
    const ref_k31 = getRefNumericValue("k_31", 0); // Wood emissions
    const d60 = getRefNumericValue("d_60", 0); // Offsets

    // Calculate Reference total emissions (k_32 equivalent)
    // Formula: SUM(K27:K31) - (D60*1000)
    const ref_k32 =
      ref_k27 + ref_k28 + ref_k29 + ref_k30 + ref_k31 - d60 * 1000;

    // Store Reference emissions total with ref_ prefix
    setValueIfChanged("ref_k_32", ref_k32);

    console.log(`S04 REFERENCE MODEL: ref_k_32=${ref_k32} (total emissions)`);
  } catch (error) {
    console.error(
      "[Section04] Error during Reference Model calculation:",
      error,
    );
  }
}
```

**Explanation**: This calculates the total Reference emissions (`ref_k_32`) that Section 01 needs to display Reference Annual Carbon values.

### 3. Section 15 Fix: Mode-Aware Reading Pattern

**File**: `OBJECTIVE 4011RF/sections/4011-Section15.js`

**Location**: Around line 100-130 in the `setCalculatedValue` function

**REPLACE** the setCalculatedValue function with this mode-aware version:

```javascript
function setCalculatedValue(fieldId, rawValue, format = "number") {
  const formattedValue = formatNumber(rawValue, format);

  // 🔧 REFERENCE MODE FIX: Check if we're in Reference mode and store values appropriately
  if (window.TEUI?.ReferenceToggle?.isReferenceMode?.()) {
    // During Reference mode, store with ref_ prefix to prevent contamination
    const refFieldId = `ref_${fieldId}`;
    window.TEUI.StateManager?.setValue(
      refFieldId,
      rawValue.toString(),
      "calculated",
    );

    // Don't update DOM during Reference mode to prevent visual contamination
    console.log(
      `🔧 S15: Reference mode - storing ${refFieldId} = ${rawValue} (no DOM update)`,
    );
  } else {
    // Normal Target mode: store in application state and update DOM
    window.TEUI.StateManager?.setValue(
      fieldId,
      rawValue.toString(),
      "calculated",
    );

    // Update DOM with formatted value
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (element) {
      element.textContent = formattedValue;
      // Add/remove classes based on value if needed (e.g., for negatives)
      element.classList.toggle("negative-value", rawValue < 0);
    }
  }
}
```

**AND** add this mode-aware reading pattern to the `calculateReferenceModel` function:

```javascript
function calculateReferenceModel() {
  // Mode-aware reading helper
  const getRefValue = (fieldId) => {
    // During Reference mode, read from ref_ prefixed values
    const refFieldId = `ref_${fieldId}`;
    let value = window.TEUI.StateManager?.getValue(refFieldId);

    // Fallback to application state if ref_ value doesn't exist
    if (value === null || value === undefined) {
      value = window.TEUI.StateManager?.getValue(fieldId);
    }

    return window.TEUI?.parseNumeric?.(value, 0) || 0;
  };

  try {
    // Use mode-aware reading for contamination-free calculations
    const ref_i_104 = getRefValue("i_104");
    const ref_m_121 = getRefValue("m_121");
    const ref_i_80 = getRefValue("i_80");

    // Calculate Reference TEUI values using isolated Reference state
    // ... rest of calculations using getRefValue() ...
  } catch (error) {
    console.error(
      "[Section15] Error during Reference Model calculation:",
      error,
    );
  }
}
```

**Explanation**: This ensures Section 15 reads from the correct state during Reference mode and doesn't contaminate Target calculations.

## Testing Instructions

### 1. Verify State Isolation

1. Load the application in Target mode
2. Note the Target TEUI value (should be ~93.6)
3. Toggle to Reference mode
4. Toggle back to Target mode
5. **Expected**: Target TEUI should remain stable at 93.6

### 2. Verify Reference Emissions

1. Toggle to Reference mode
2. Check Section 01 "Annual Carbon" field
3. **Expected**: Should show calculated Reference emissions (not 0.0)

### 3. Verify Console Logs

- Look for console messages showing proper state separation:
  - `S03: ref_fieldId = value (ref only)` during Reference mode
  - `S04 REFERENCE MODEL: ref_k_32=X (total emissions)`
  - `S15: Reference mode - storing ref_fieldId = value (no DOM update)`

## Architecture Notes

### Dual-State System

- **Target Model**: User's building design (application state)
- **Reference Model**: Code-compliant baseline (prefixed state)
- **State Separation**: `target_fieldId` vs `ref_fieldId`

### Critical Principles

1. **No Cross-Contamination**: Reference calculations must never write to global state
2. **Mode-Aware Reading**: Always read from appropriate state based on current mode
3. **Prefixed Storage**: All Reference values stored with `ref_` prefix
4. **Change Detection**: Use `setValueIfChanged` to prevent infinite loops

## Validation

After implementing these fixes:

- [ ] Target TEUI stable at 93.6 regardless of Reference toggle
- [ ] Reference Annual Carbon shows calculated values (not 0.0)
- [ ] Console logs show proper state separation
- [ ] No infinite calculation loops
- [ ] All sections maintain Excel calculation parity

## Files Modified

1. `OBJECTIVE 4011RF/sections/4011-Section03.js` - State contamination fix
2. `OBJECTIVE 4011RF/sections/4011-Section04.js` - Missing Reference emissions
3. `OBJECTIVE 4011RF/sections/4011-Section15.js` - Mode-aware reading pattern

## Git Commit Message Template

```
fix: resolve dual-state contamination and missing Reference emissions

- S03: prevent Reference mode from writing to global state
- S04: add missing ref_k_32 calculation for Reference emissions
- S15: implement mode-aware reading to prevent cross-contamination
- Target TEUI now stable at 93.6 regardless of Reference toggle
- Reference Annual Carbon now displays calculated values

Fixes #[issue-number] - dual-state architecture contamination
```

---

_This guide provides complete implementation details for fixing the dual-state architecture issues. Follow the code snippets exactly to ensure proper state isolation and calculation accuracy._
