# Section 01 Consumer Section Refactor Workplan

**Target Date: August 1st, 2025**
**Status: DUAL-STATE Architecture Compliant**

## 🎯 **Refactor Objectives**

### **S01 Consumer Section Goals:**

- ✅ **Eliminate B Pattern contamination** (`getAppNumericValue()` complexity)
- ✅ **Implement clean external dependencies** (`getGlobalNumericValue()` pattern)
- ✅ **Remove dual-state interference** (like the k_10 bug we just fixed)
- ✅ **Maintain existing display/animation functionality**
- ✅ **Preserve state-agnostic dashboard behavior**

### **S01 Architecture Role:**

- 🏛️ **Consumer Section** → Reads results from upstream Pattern A sections
- 🎯 **Display Only** → Shows Reference (E), Target (H), Actual (K) simultaneously
- 🚫 **No Internal State** → No TargetState/ReferenceState objects needed
- 🔗 **Clean Dependencies** → Uses approved external dependency patterns

---

## 📋 **Implementation Plan**

### **Phase 1: Analysis & B Pattern Detection (15 mins)**

```
□ Scan for B Pattern contamination using DUAL-STATE guide:
  grep -n "target_\|getAppNumericValue" sections/4011-Section01.js
□ Map current external dependencies from upstream sections:
  - S02: h_15 (area), i_41 (embodied carbon), h_13 (service life)
  - S04: f_32, j_32, k_32, g_32 (energy/emissions totals)
  - S15: ref_h_136 (reference TEUI final calculation)
□ Identify which dependencies need ref_ prefixed versions
□ Document display targets: Reference (E), Target (H), Actual (K) columns
```

### **Phase 2: Clean External Dependencies (30 mins)**

```
□ Implement DUAL-STATE compliant getGlobalNumericValue() helper:
  function getGlobalNumericValue(fieldId) {
    const rawValue = window.TEUI?.StateManager?.getValue(fieldId);
    return window.TEUI.parseNumeric(rawValue) || 0;
  }
□ Replace ALL getAppNumericValue() calls with getGlobalNumericValue()
□ Remove the complex dual-state interference logic we added today
□ Ensure clean separation: unprefixed reads for current values,
  ref_ prefixed reads for reference calculations
```

### **Phase 3: Simplified Consumer Calculations (20 mins)**

```
□ Simplify k_10 (Actual TEUI) calculation:
  k_10 = getGlobalNumericValue("f_32") / getGlobalNumericValue("h_15")
□ Ensure h_10 (Target TEUI) reads correctly:
  h_10 = getGlobalNumericValue("j_32") / getGlobalNumericValue("h_15")
□ Ensure e_10 (Reference TEUI) reads correctly:
  e_10 = getGlobalNumericValue("ref_h_136") // Final reference calc from S15
□ Apply same clean pattern to all dashboard calculations
```

### **Phase 4: External Dependency Cleanup (15 mins)**

```
□ Review StateManager listeners - ensure they watch correct sources
□ Remove any remaining target_ prefixed contamination
□ Verify S01 has no internal state management (consumer only)
□ Test that upstream Pattern A sections provide correct values
```

### **Phase 5: Consumer Section Validation (20 mins)**

```
□ Test Reference column (E): Displays results from ref_ calculations
□ Test Target column (H): Displays results from unprefixed calculations
□ Test Actual column (K): Displays utility bill-based calculations
□ Verify area slider in S02 updates S01 calculations immediately
□ Verify global Reference toggle doesn't break S01 display
□ Test gauge animations with clean data sources
```

---

## 🔧 **Code Changes Required**

### **Current Problem Pattern (B Pattern Contamination):**

```javascript
// ❌ B Pattern contamination - complex dual-state interference
function getAppNumericValue(fieldId, defaultValue = 0) {
  let value = defaultValue;
  const targetValue = window.TEUI?.StateManager?.getValue?.(
    `target_${fieldId}`,
  );
  if (targetValue !== undefined && targetValue !== null && targetValue !== "") {
    // Complex fallback logic that creates dual-state interference...
  }
  const fallbackValue = window.TEUI?.StateManager?.getValue?.(fieldId);
  // More complex logic...
  return value;
}

// Usage that caused k_10 drift:
const appArea = getAppNumericValue("h_15", 1);
const appActualEnergy = getAppNumericValue("f_32", 0);
```

### **Target Consumer Section Pattern (DUAL-STATE Compliant):**

```javascript
// ✅ Clean external dependencies - DUAL-STATE guide approved
function getGlobalNumericValue(fieldId) {
  const rawValue = window.TEUI?.StateManager?.getValue(fieldId);
  return window.TEUI.parseNumeric(rawValue) || 0;
}

// Usage for consumer section:
const area = getGlobalNumericValue("h_15"); // From S02 (current state)
const actualEnergy = getGlobalNumericValue("f_32"); // From S04 (application)
const targetEnergy = getGlobalNumericValue("j_32"); // From S04 (calculated)
const refEnergy = getGlobalNumericValue("ref_j_32"); // From S04 (reference calc)

// Clean calculations:
const k_10 = actualEnergy / area; // Actual TEUI
const h_10 = targetEnergy / area; // Target TEUI
const e_10 = refEnergy / area; // Reference TEUI (or use ref_h_136 from S15)
```

### **Key Changes:**

1. **Remove getAppNumericValue()** - Replace with getGlobalNumericValue()
2. **Remove complex dual-state logic** - Let upstream sections handle Target/Reference
3. **Clean external dependencies** - No target\_ prefix contamination
4. **Consumer section pattern** - Read results, don't manage internal state

---

## 🎯 **Expected Outcomes**

### **After Consumer Section Refactor:**

- ✅ **k_10 calculation** naturally stable (no B Pattern interference)
- ✅ **Clean external dependencies**: Upstream Pattern A sections provide correct values
- ✅ **No B Pattern contamination** in Section 01 codebase
- ✅ **DUAL-STATE compliant** consumer section architecture
- ✅ **Simplified codebase** with clean data flow

### **Validation Criteria:**

- Reference column (E) displays correct reference calculations
- Target column (H) displays correct target calculations
- Actual column (K) displays correct utility bill calculations
- Area slider changes in S02 update S01 immediately
- Global Reference toggle works without breaking S01
- Gauge animations work smoothly with clean data sources
- Code is significantly simpler and more maintainable

---

## 📝 **Implementation Notes**

### **Consumer Section Characteristics:**

- **No ModeManager**: S01 doesn't manage internal Target/Reference state
- **External dependency pattern**: Uses getGlobalNumericValue() for all reads
- **Display aggregator**: Shows results from multiple upstream Pattern A sections
- **State agnostic**: Always displays Reference, Target, Actual simultaneously

### **DUAL-STATE Architecture Compliance:**

- **Line 1552 compliance**: "S01: Summary (Final consumer section)"
- **AI-FRIENDLY-PATTERNS compliance**: "Apply to ALL sections except S01"
- **Clean interface**: No target\_ prefixed contamination
- **Upstream dependency**: Relies on S02, S04, S15 Pattern A implementations

### **Testing Strategy:**

1. **B Pattern scan**: Verify no target\_/getAppNumericValue contamination
2. **External dependency test**: Confirm clean reads from upstream sections
3. **Integration test**: Verify area slider and global toggle functionality
4. **Regression test**: Ensure identical display functionality

---

## **DUAL-STATE Architecture Compliant! This refactor eliminates B Pattern contamination and establishes S01 as a proper consumer section.** 🏛️

## 🔍 **Refactoring Assessment (As of 2025-08-02)**

**Generated by AI Agent**

### **Overall Assessment: Partially Complete with Critical Flaw**

The refactoring of `4011-Section01.js` has been partially completed, but it retains a significant architectural flaw that violates the core principles of the consumer section pattern outlined in this workplan. While several key objectives were met, the section is not yet fully compliant.

### ✅ **What Was Completed Correctly**

- **`getAppNumericValue` Eliminated**: The primary goal of removing the old, complex `getAppNumericValue()` function was achieved.
- **Core Calculations Refactored**: The main calculation logic in `calculateTargetModel()` and `calculateReferenceModel()` now correctly uses the `getGlobalNumericValue()` helper to read data from upstream sections (S02, S04, S15).
- **No Internal State**: The section correctly avoids implementing its own `ModeManager` or internal `TargetState`/`ReferenceState` objects, adhering to its role as a display-only dashboard.
- **Clean Dependencies**: The `StateManager` listeners are correctly configured to watch for changes in final calculated values from upstream sections.

### ❌ **What Is Incomplete or Incorrect**

#### **1. Major Flaw: Continued "B Pattern" Contamination**

The most significant issue is that **Section 01 is still acting as a data producer for prefixed state, not just a consumer**.

- **Problem**: The `setCalculatedValue()` function (line 289 in `4011-Section01.js`) incorrectly writes `target_` and `ref_` prefixed values back into the global `StateManager`.

  ```javascript
  // Problematic code in setCalculatedValue()
  window.TEUI.StateManager.setValue(
    `target_${fieldId}`, // ❌ VIOLATION: S01 should not write target_ state
    valueToStore,
    "calculated",
  );
  window.TEUI.StateManager.setValue(
    `ref_${fieldId}`, // ❌ VIOLATION: S01 should not write ref_ state
    valueToStore,
    "calculated",
  );
  ```

- **Architectural Violation**: This workplan explicitly defines Section 01 as a **consumer section**. Its role is to read final values from other sections and display them. It must _not_ be responsible for creating or managing the application's `target_` or `ref_` state. This logic is a remnant of the "B Pattern" that this refactor was designed to eliminate.

#### **2. Redundant Code**

- **Problem**: In `calculateReferenceModel()`, there is a block of code (lines 401-417) that manually sets `ref_e_10`, `ref_e_8`, and `ref_e_6` in the `StateManager`.
- **Violation**: This is redundant because the `setCalculatedValue()` function already (incorrectly) performs this action. This block should be removed.

### **Recommendations for Completion**

To finalize this refactoring and achieve full compliance with the consumer section pattern, the following actions are required:

1.  **Fix `setCalculatedValue()`**:

    - Modify this function to **remove the blocks that write `target_${fieldId}` and `ref_${fieldId}`**.
    - Its only responsibilities should be:
      1.  Updating the global, unprefixed value in `StateManager` for backward compatibility (`window.TEUI.StateManager.setValue(fieldId, ...)`).
      2.  Updating the Section 01 DOM display via `updateDisplayValue()`.

2.  **Remove Redundant Code**:

    - Delete the unnecessary `StateManager.setValue` block from `calculateReferenceModel()` (lines 401-417).

3.  **Standardize Helper Usage**:
    - Refactor remaining data-read functions (`updateTEUIDisplay`, `getGaugeValues`, etc.) to consistently use `getGlobalNumericValue()` instead of older patterns like `getApplicationValue()`.

Once these changes are implemented, `4011-Section01.js` will correctly function as a clean, state-agnostic consumer section, and this refactoring can be considered complete.

---

## 🎯 **CRITICAL ARCHITECTURAL FIX (August 2025)**

**Generated by AI Agent after Log Analysis**

### **Root Cause: S01 Has Unnecessary Calculation Engines**

After analyzing the execution logs, the fundamental issue is clear: **S01 should NOT have calculation engines at all**. It should be a pure **display consumer** that reads upstream values and does simple division for display.

### **Current Problem Pattern:**

```javascript
// ❌ WRONG: S01 is calculating and storing values
function calculateReferenceModel() {
  const referenceTEUI = getGlobalNumericValue("ref_h_136") || 341.2;
  const refTargetEmissions = getGlobalNumericValue("ref_k_32") || 14740.8;
  // ... complex calculations ...
  setCalculatedValue("e_10", referenceTEUI, "number-1dp"); // ❌ STORING
}

function updateTEUIDisplay() {
  // ❌ WRONG: Trying to read stored values that don't exist
  const e10RefRaw = window.TEUI.StateManager?.getValue("ref_e_10") || "341.2";
}
```

### **Correct Consumer Pattern:**

```javascript
// ✅ CORRECT: Pure display consumer - no calculation engines needed
function updateTEUIDisplay() {
  // Column E (Reference): Direct math from upstream ref_ values
  const refEnergy = getGlobalNumericValue("ref_j_32") || 0; // From S04 Reference
  const refEmissions = getGlobalNumericValue("ref_k_32") || 0; // From S04 Reference
  const refEmbodiedCarbon = getGlobalNumericValue("ref_i_39") || 0; // From S05 Reference
  const area = getGlobalNumericValue("h_15") || 1; // From S02
  const serviceLife = getGlobalNumericValue("h_13") || 50; // From S02

  // Simple Excel-compliant calculations
  const e_10 = area > 0 ? refEnergy / area : 0; // ref_j_32/h_15
  const e_8 = area > 0 ? refEmissions / area : 0; // ref_k_32/h_15
  const e_6 = serviceLife > 0 ? refEmbodiedCarbon / serviceLife + e_8 : 0; // ref_i_39/h_13 + e_8

  // Column H (Target): Direct math from upstream unprefixed values
  const targetEnergy = getGlobalNumericValue("j_32") || 0; // From S04 Target
  const targetEmissions = getGlobalNumericValue("k_32") || 0; // From S04 Target
  const embodiedCarbon = getGlobalNumericValue("i_41") || 0; // From S05 Target

  const h_10 = area > 0 ? targetEnergy / area : 0; // j_32/h_15
  const h_8 = area > 0 ? targetEmissions / area : 0; // k_32/h_15
  const h_6 = serviceLife > 0 ? embodiedCarbon / serviceLife + h_8 : 0; // i_41/h_13 + h_8

  // Column K (Actual): Direct math from actual values (Utility Bills mode only)
  const useType = window.TEUI.StateManager?.getValue("d_14") || "Targeted Use";
  if (useType === "Utility Bills") {
    const actualEnergy = getGlobalNumericValue("f_32") || 0; // From S04 Actual
    const actualEmissions = getGlobalNumericValue("g_32") || 0; // From S04 Actual

    const k_10 = area > 0 ? actualEnergy / area : 0; // f_32/h_15
    const k_8 = area > 0 ? actualEmissions / area : 0; // g_32/h_15
    const k_6 = serviceLife > 0 ? embodiedCarbon / serviceLife + k_8 : 0; // i_41/h_13 + k_8

    updateDisplayValue("k_10", formatNumber(k_10, "number-1dp"));
    updateDisplayValue("k_8", formatNumber(k_8, "number-1dp"));
    updateDisplayValue("k_6", formatNumber(k_6, "number-1dp"));
  } else {
    updateDisplayValue("k_10", "N/A");
    updateDisplayValue("k_8", "N/A");
    updateDisplayValue("k_6", "N/A");
  }

  // Format and display - NO STORAGE
  updateDisplayValue("e_10", formatNumber(e_10, "number-1dp"));
  updateDisplayValue("e_8", formatNumber(e_8, "number-1dp"));
  updateDisplayValue("e_6", formatNumber(e_6, "number-1dp"));
  updateDisplayValue("h_10", formatNumber(h_10, "number-1dp"));
  updateDisplayValue("h_8", formatNumber(h_8, "number-1dp"));
  updateDisplayValue("h_6", formatNumber(h_6, "number-1dp"));
}
```

### **Required Changes:**

1. **REMOVE** `calculateReferenceModel()` and `calculateTargetModel()` functions entirely
2. **REMOVE** all `setCalculatedValue()` calls for `e_6`, `e_8`, `e_10`, `h_6`, `h_8`, `h_10`, `k_6`, `k_8`, `k_10`
3. **CONVERT** `updateTEUIDisplay()` to pure display consumer that:
   - Reads `ref_j_32`, `ref_k_32`, `ref_i_39` for Column E calculations
   - Reads `j_32`, `k_32`, `i_41` for Column H calculations
   - Reads `f_32`, `g_32`, `i_41` for Column K calculations (Utility Bills mode only)
   - Does simple division math directly in display function
   - No storage - just format and display
4. **SIMPLIFY** `runAllCalculations()` to only call `updateTEUIDisplay()` and tier calculation
5. **PRESERVE** tier calculation and gauge logic as separate functions

### **Result:**

- **Column E** will ALWAYS show Reference values (`ref_` sources)
- **Column H** will ALWAYS show Target values (unprefixed sources)
- **Column K** will ALWAYS show Actual values (conditional on Utility Bills mode)
- **No state mixing** - each column reads from correct upstream sources
- **No calculation engines** - pure display consumer as intended
- **Excel compliance** - matches Excel formulas exactly

This transforms S01 from a **calculation + display hybrid** to a **pure display consumer**, eliminating the architectural confusion that caused Reference values to never update in Column E.
