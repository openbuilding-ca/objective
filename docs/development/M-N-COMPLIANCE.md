# M-N Column Compliance Pattern Guide

**Purpose**: This document provides a standardized pattern for implementing compliance checks in columns M (comparison/reference values) and N (pass/fail indicators) across all TEUI sections.

## Overview

The M-N compliance pattern allows sections to compare calculated or user-input values against reference standards, code requirements, or reference model values, providing visual pass/fail feedback, especially useful for plans examiners/OBOA or other Building Code Officials, as well as designers, as visual feedback on compliance divergence. 

## Column Roles

### Column M: Reference/Comparison Values
- **Purpose**: Displays the threshold, limit, or reference value for comparison
- **Value Sources** (in order of priority):
  1. **Code/Standard Lookup**: Value from `CodeValues.js` based on selected standard (e.g., OBC requirements)
  2. **Reference Model Comparison**: Value from `ref_` prefixed field in Reference state
  3. **Static Calculation**: Fixed formula or constant (e.g., NBC upper limit of 26°C)
  4. **Conditional Logic**: Value determined by occupancy type, climate zone, or other factors

### Column N: Pass/Fail Indicators
- **Purpose**: Visual compliance indicator comparing actual value against M column threshold
- **Display**: Symbol (✓ or ✗) with color styling
- **Logic**: Boolean comparison determining pass/fail state

---

## Implementation Patterns

### Pattern 1: Code/Standard Comparison (S03 Example: m_23/n_23)

**Use Case**: Compare against building code requirements that vary by occupancy type.

**M Column (m_23 - OBC Required Heating Setpoint)**:
```javascript
function calculateOBCHeatingSetpoint() {
  const occupancyType = getModeAwareGlobalValue("d_12"); // From Section 02
  let obcHeatingSetpoint;

  // OBC baseline logic (occupancy-dependent)
  if (
    occupancyType === "C-Residential" ||
    occupancyType === "B2-Care and Treatment" ||
    occupancyType === "B3-Detention Care & Treatment" ||
    occupancyType.includes("Care")
  ) {
    obcHeatingSetpoint = 22;
  } else {
    obcHeatingSetpoint = 18;
  }

  setFieldValue("m_23", obcHeatingSetpoint);
  return obcHeatingSetpoint;
}
```

**N Column (n_23 - Heating Setpoint Compliance)**:
```javascript
function calculateHeatingCompliance() {
  const actualSetpoint = getNumericValue("h_23");
  const obcRequirement = getNumericValue("m_23");

  // Pass if actual >= required, fail if actual < required
  const isCompliant = actualSetpoint >= obcRequirement;

  // Set the symbol as text (S08 pattern)
  setFieldValue("n_23", isCompliant ? "✓" : "✗");

  // Apply CSS class directly to DOM element (S08 pattern)
  setElementClass("n_23", isCompliant ? "checkmark" : "warning");

  return isCompliant;
}
```

**Field Definitions**:
```javascript
// Row 23 cells:
m: {
  fieldId: "m_23",
  type: "calculated",
  label: "OBC Required Heating Setpoint",
  value: "22",
  section: "climateCalculations",
  dependencies: ["d_12"], // Triggers recalc when occupancy changes
  tooltip: true,
},
n: {
  fieldId: "n_23",
  type: "calculated",
  label: "Heating Setpoint Compliance",
  value: "✓",
  section: "climateCalculations",
  dependencies: ["h_23", "m_23"], // Triggers when either value changes
  tooltip: true,
},
```

---

### Pattern 2: Static Limit Comparison (S03 Example: m_24/n_24)

**Use Case**: Compare against fixed code limits (e.g., NBC cooling upper limit).

**M Column (m_24 - NBC Upper Cooling Limit)**:
```javascript
function calculateNBCCoolingLimit() {
  const nbcUpperLimit = 26; // NBC standard upper limit in °C
  setFieldValue("m_24", nbcUpperLimit);
  return nbcUpperLimit;
}
```

**N Column (n_24 - Cooling Setpoint Compliance)**:
```javascript
function calculateCoolingCompliance() {
  const actualSetpoint = getNumericValue("h_24");
  const nbcUpperLimit = getNumericValue("m_24");

  // Pass if actual <= limit, fail if actual > limit
  const isCompliant = actualSetpoint <= nbcUpperLimit;

  // Set the symbol as text (S08 pattern)
  setFieldValue("n_24", isCompliant ? "✓" : "✗");

  // Apply CSS class directly to DOM element (S08 pattern)
  setElementClass("n_24", isCompliant ? "checkmark" : "warning");

  return isCompliant;
}
```

---

### Pattern 3: Reference Model Comparison (S11 Example: m_85/n_85)

**Use Case**: Compare Target model value against Reference model value.

**M Column (m_85 - Reference Model Percentage)**:
```javascript
// In updateReferenceIndicators(rowNumber):
const currentValue = getNumericValue(valueSourceFieldId); // Target RSI
const referenceValue = ReferenceState.getValue(referenceFieldId); // ref_e_85
const referenceNumeric = window.TEUI.parseNumeric(referenceValue) || 0;

let referencePercent = 0;
if (componentType === "rsi") {
  // RSI: Higher is better (current ÷ reference × 100%)
  if (referenceNumeric > 0 && !isNaN(currentValue)) {
    referencePercent = (currentValue / referenceNumeric) * 100;
  }
}

setCalculatedValue(mFieldId, referencePercent / 100, "percent"); // Format as %
```

**N Column (n_85 - RSI Compliance)**:
```javascript
// In updateReferenceIndicators(rowNumber):
const isGood = currentValue >= referenceNumeric; // Pass if Target >= Reference

const nElement = document.querySelector(`[data-field-id="${nFieldId}"]`);
if (nElement) nElement.textContent = isGood ? "✓" : "✗";
setElementClass(nFieldId, isGood); // Pass boolean to helper
```

---

### Pattern 4: Multi-Threshold Comparison (S08 Example: m_56/n_56)

**Use Case**: Compare against health/safety thresholds (e.g., radon, CO2, TVOC).

**M Column (m_56 - Radon as % of Limit)**:
```javascript
const radonValue = getNumericValue("d_56");
const radonPercent = radonValue / 150; // 150 Bq/m³ limit
setCalculatedValue("m_56", radonPercent); // Display as %
```

**N Column (n_56 - Radon Compliance)**:
```javascript
setCalculatedValue("n_56", radonValue <= 150 ? "✓" : "✗");
setElementClass("n_56", radonValue <= 150 ? "checkmark" : "warning");
```

---

## Required Components

### 1. Helper Functions

Every section implementing M-N compliance needs:

```javascript
/**
 * Apply CSS class to DOM element for compliance indicators (S08 pattern)
 * Only applies in Target mode - Reference mode should not override Target's visual indicators
 * @param {string} fieldId - The field ID to target
 * @param {string} className - The class name to add ("checkmark" or "warning")
 */
function setElementClass(fieldId, className) {
  // ⚠️ CRITICAL: Only apply styling in Target mode
  // Without this check, Reference calculations will overwrite Target's compliance styling
  if (ModeManager.currentMode !== "target") return;

  const element = document.querySelector(`[data-field-id="${fieldId}"]`);
  if (element) {
    element.classList.remove("checkmark", "warning");
    if (className) element.classList.add(className);
  }
}
```

**CRITICAL**: The mode check (`if (ModeManager.currentMode !== "target") return;`) is **REQUIRED** for dual-state sections (S03, S08, S11, etc.). Without it, Reference mode calculations will overwrite Target mode's visual indicators, causing incorrect colors (e.g., green X instead of red X).

---

### 2. Field Definition Requirements

**M Column Field**:
```javascript
m: {
  fieldId: "m_XX",
  type: "calculated",
  label: "Descriptive Name of Threshold/Limit",
  value: "default_value",
  section: "sectionName",
  dependencies: ["related_field_ids"], // Fields that trigger recalculation
  tooltip: true, // Enable tooltip explaining what this represents
}
```

**N Column Field**:
```javascript
n: {
  fieldId: "n_XX",
  type: "calculated",
  label: "Compliance Status",
  value: "✓", // Default to pass symbol
  section: "sectionName",
  dependencies: ["h_XX", "m_XX"], // Must include both compared fields
  tooltip: true, // Enable tooltip explaining pass/fail criteria
}
```

**Key Points**:
- **DO NOT** add `htmlContent: true` - we apply CSS classes directly to DOM
- **DO** include both compared fields in `dependencies` array
- **DO** use descriptive labels explaining what's being compared

---

### 3. Global CSS Classes (styles.css)

Already defined globally - **do not redefine in sections**:

```css
.checkmark {
  color: #28a745;      /* Green */
  font-weight: bold;
  font-size: 1.2rem;
  margin-right: 5px;
  display: inline-block;
}

.warning {
  color: #dc3545;      /* Red */
  font-weight: bold;
  font-size: 1.2rem;
  margin-right: 5px;
  display: inline-block;
}
```

---

### 4. Number Formatting

**M Column** formatting depends on value type:

```javascript
// For percentages (S08, S11):
setCalculatedValue("m_XX", percentValue, "percent"); // Handles % formatting

// For temperatures/numeric values (S03):
setFieldValue("m_23", numericValue); // No special formatting needed

// For ratios displayed as % (S11):
setCalculatedValue("m_85", ratio, "percent"); // ratio = 0.85 → displays "85%"
```

**N Column** formatting:
- Always plain text symbols: `"✓"` or `"✗"`
- CSS class provides color styling

---

## Calculation Flow

### When to Call Compliance Functions

1. **Initial Calculation**: During section's `calculateAll()` or equivalent
2. **Dependency Changes**: When any field in `dependencies` array changes
3. **Mode Switch**: When switching between Target/Reference modes (dual-state sections)

### Call Order (Critical!)

```javascript
// STEP 1: Calculate M column value FIRST
calculateThresholdValue(); // e.g., calculateOBCHeatingSetpoint()

// STEP 2: Calculate N column compliance SECOND (depends on M)
calculateCompliance(); // e.g., calculateHeatingCompliance()
```

**Example from S03**:
```javascript
function calculateTargetModel() {
  // ... other calculations ...

  calculateHeatingSetpoint();           // h_23: Actual value
  calculateOBCHeatingSetpoint();        // m_23: Threshold (MUST run first)
  calculateHeatingCompliance();         // n_23: Compare h_23 vs m_23

  calculateCoolingSetpoint_h24();       // h_24: Actual value
  calculateNBCCoolingLimit();           // m_24: Threshold (MUST run first)
  // ... later in updateCoolingDependents():
  calculateCoolingCompliance();         // n_24: Compare h_24 vs m_24
}
```

---

## Common Comparison Logic Patterns

### Higher is Better (RSI, Efficiency)
```javascript
const isCompliant = actualValue >= thresholdValue;
```

### Lower is Better (U-value, Energy Use, Pollutants)
```javascript
const isCompliant = actualValue <= thresholdValue;
```

### Range Check (Humidity, Temperature Range)
```javascript
const isCompliant = actualValue >= minThreshold && actualValue <= maxThreshold;
```

### Exact Match
```javascript
const isCompliant = actualValue === requiredValue;
```

---

## Tooltips

### M Column Tooltip Content
Should explain:
- What standard/code this represents
- How the value is determined
- Why this threshold matters

**Example (m_23)**:
```
OBC Required Heating Setpoint
The minimum indoor heating setpoint required by the Ontario Building Code.
Residential and Care occupancies require 22°C; all others require 18°C.
```

### N Column Tooltip Content
Should explain:
- What's being compared
- Pass/fail criteria
- Implications of failing

**Example (n_23)**:
```
Heating Setpoint Compliance
Compares your heating setpoint (h_23) against OBC requirements (m_23).
✓ Pass: Your setpoint meets or exceeds code requirements
✗ Fail: Your setpoint is below code minimum - increase to comply
```

---

## Troubleshooting

### Issue: Green X appears instead of Red X

**Symptoms**: Symbol shows ✗ but in green color instead of red.

**Root Causes**:
1. **❗ MOST COMMON**: Missing mode check in `setElementClass()` - Reference mode overwrites Target styling
2. **Inverted logic**: `isCompliant` boolean is backwards
3. **Class not applied**: `setElementClass()` not called or called with wrong parameter
4. **Timing issue**: Class applied before DOM element exists

**Debug Steps**:
```javascript
// Add console logging to compliance function:
function calculateHeatingCompliance() {
  const actualSetpoint = getNumericValue("h_23");
  const obcRequirement = getNumericValue("m_23");
  const isCompliant = actualSetpoint >= obcRequirement;

  console.log(`[S03] n_23 Compliance: h_23=${actualSetpoint}, m_23=${obcRequirement}, isCompliant=${isCompliant}`);

  setFieldValue("n_23", isCompliant ? "✓" : "✗");
  setElementClass("n_23", isCompliant ? "checkmark" : "warning");

  // Verify class was applied:
  const element = document.querySelector('[data-field-id="n_23"]');
  console.log(`[S03] n_23 class list:`, element?.classList.toString());

  return isCompliant;
}
```

**Solutions**:
1. **ADD MODE CHECK** to `setElementClass()` (see Required Components section)
2. Verify comparison logic matches "Higher/Lower is Better" pattern
3. Ensure `setElementClass()` is called AFTER `setFieldValue()`
4. Check console logs to confirm Reference mode is overwriting Target styling

**Real Example from S03 (Nov 2025)**:
```
Line 26-28: Target mode applies "warning" (h_23=18 < m_23=22) ✓ CORRECT
Line 30-32: Reference mode overwrites with "checkmark" (h_23=18 = m_23=18) ✗ WRONG
Result: Green checkmark displayed instead of red X
Fix: Added `if (ModeManager.currentMode !== "target") return;` to setElementClass()
```

### Issue: Compliance doesn't update when dependencies change

**Symptoms**: M or N values don't recalculate when related fields change.

**Solutions**:
1. Add missing dependencies to field definition's `dependencies` array
2. Add StateManager listeners for cross-section dependencies (e.g., d_12, d_13)
3. Ensure compliance function is called in `calculateAll()` flow

### Issue: Wrong number format in M column

**Symptoms**: M column shows "0.85" instead of "85%" or vice versa.

**Solutions**:
- Use `setCalculatedValue(fieldId, value, "percent")` for percentage display
- Use `setFieldValue(fieldId, value)` for raw numeric display
- Check StateManager number format configuration

---

## Reference Implementations

### Working Examples
- **S03**: Code-based comparison (m_23/n_23, m_24/n_24)
- **S08**: Health threshold comparison (m_56-59/n_56-59)
- **S11**: Reference model comparison (m_85-95/n_85-95)

### Key Files
- **Field Rendering**: `src/core/FieldManager.js` (lines 586-723)
- **Global CSS**: `src/styles.css` (lines 2097-2112)
- **State Management**: `src/core/StateManager.js`
- **Mode Management**: `src/core/ModeManager.js`

---

## Quick Reference Checklist

When implementing M-N compliance:

- [ ] M column calculation function created and called BEFORE N
- [ ] N column compliance function compares correct values
- [ ] Both M and N field definitions include `dependencies` array
- [ ] `setElementClass()` helper function exists in section
- [ ] Compliance function calls `setFieldValue()` then `setElementClass()`
- [ ] Comparison logic matches "Higher/Lower is Better" pattern
- [ ] Global CSS classes (`.checkmark`, `.warning`) used - not redefined
- [ ] Tooltips explain what's compared and pass/fail criteria
- [ ] Cross-section dependencies have StateManager listeners
- [ ] Console logging added for debugging (remove after verification)

---

## Implementation Status

### ✅ Completed Sections
- **S03** (Climate Calculations): Code-based comparison (m_23/n_23, m_24/n_24)
- **S05** (Envelope): Component performance comparison
- **S07** (Lighting): Lighting performance comparison
- **S08** (Indoor Air Quality): Health threshold comparison (m_56-59/n_56-59)

### 🚧 Pending Implementation
- **S09** (Renewables): M/N compliance not yet implemented
- **S11** (Embodied Carbon): Reference model comparison (m_85-95/n_85-95) - partial implementation
- **S13** (Costs): Cost comparison - not yet implemented

### ❌ Not Applicable
- **S01, S02, S04, S06, S10, S12**: Do not require M/N compliance fields

---

## Advanced Pattern: Dual-Mode Styling (Target + Reference)

### Issue: Styling Disappears When Switching Modes

**Symptoms**: In sections with dual-state architecture (Target/Reference modes), the checkmark/warning colors work in one mode but not the other when switching.

**Root Cause**: The `setElementClass()` function only applies styling during calculation. When switching modes, `updateCalculatedDisplayValues()` updates the text content (✓/✗ symbols) but doesn't reapply the CSS classes.

**Solution Pattern** (S08 Implementation - Nov 2025):

```javascript
updateCalculatedDisplayValues: function () {
  const calculatedFields = ["n_56", "n_57", "n_58", "n_59", /* ... */];

  calculatedFields.forEach((fieldId) => {
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (element) {
      // Get value from current mode's state
      let value;
      if (this.currentMode === "reference") {
        value = ReferenceState.getValue(fieldId) || "0";
      } else {
        value = TargetState.getValue(fieldId) || "0";
      }

      const formatType = getFieldFormat(fieldId);
      const formattedValue = formatType === "raw"
        ? value
        : (window.TEUI?.formatNumber?.(value, formatType) ?? value);
      element.textContent = formattedValue;

      // ✅ CRITICAL: Reapply CSS classes for status fields after updating text
      if (fieldId.startsWith("n_") && formatType === "raw") {
        element.classList.remove("checkmark", "warning");
        element.classList.add(value === "✓" ? "checkmark" : "warning");
      }
    }
  });
}
```

**Key Points**:
1. **DO** reapply classes in `updateCalculatedDisplayValues()` for dual-mode sections
2. **DO** remove the mode check from `setElementClass()` if using this pattern
3. **DO** check the symbol value (✓ vs ✗) to determine the correct class
4. This ensures styling persists when switching between Target and Reference modes

---

## Advanced Pattern: Reference Mode User Overrides (S09 Challenge)

### The Problem

**Context**: Section 09 (Internal Gains) allows users to override Reference model defaults:
- d_65 (Plug Load Density): Can override ReferenceValues.js default
- d_66 (Lighting Density): Can override 1.5 W/m² default
- g_67 (Equipment Efficiency): Can override "Efficient" default

**Reference Model Philosophy**: Should always show 100% compliance (the baseline by definition)

**The Challenge**: When user overrides Reference defaults, what should M-column show?
- Original philosophy: ref_d_66 / d_66 in Target mode
- Edge case: User changes ref_d_66 from 1.5 → 2.0 in Reference mode
- Question: Compare against original 1.5 or edited 2.0?

### Solution Options (For Future Implementation)

#### Option 1: "Original Reference" State Snapshot (Most Complete)

**Concept**: Store the original ReferenceValues.js defaults separately from user-editable Reference state.

```javascript
// On Reference mode initialization:
ReferenceState.setDefaults(); // Sets d_66 = 1.5 from ReferenceValues.js
ReferenceState.captureOriginalDefaults(); // NEW: Store ref_original_d_66 = 1.5

// M-column calculation (Target mode):
const compliance = ref_d_66 / d_66; // Compare Target vs current Reference

// M-column calculation (Reference mode):
const compliance = ref_d_66 / ref_original_d_66; // Compare edited Reference vs original Reference
```

**Pros**:
- Pure implementation of "comparison against code baseline"
- Shows when user has deviated from ReferenceValues.js defaults
- Handles all edge cases consistently
- Clear semantic meaning: "How far from original reference?"

**Cons**:
- Requires storing `ref_original_*` values (small memory overhead)
- Adds complexity to state management
- Need to decide: Should editing Reference mode update "original" or not?

**When to Use**: When it's important to track deviations from code-prescribed baselines.

---

#### Option 2: Trust ReferenceValues.js as Source of Truth (Always Fetch)

**Concept**: Always fetch reference values directly from ReferenceValues.js, never from state.

```javascript
// Import at top of section:
import { ReferenceValues } from '../core/ReferenceValues.js';

// M-column calculation:
const buildingType = getModeAwareGlobalValue("d_12");
const referenceStandard = getModeAwareGlobalValue("d_13");

// Always fetch fresh from ReferenceValues.js (authoritative source)
const referencePlugLoad = ReferenceValues.getPlugLoadDensity(buildingType, referenceStandard);

// Get current value from appropriate state
const currentValue = ModeManager.currentMode === "reference"
  ? ReferenceState.getValue("d_65")
  : TargetState.getValue("d_65");

const compliance = referencePlugLoad / currentValue;
setCalculatedValue("m_65", compliance, "percent-auto");
```

**Pros**:
- No additional state storage needed
- ReferenceValues.js remains single source of truth
- Works correctly even if user overrides Reference defaults
- Clear: "Compliance always measured against code values"

**Cons**:
- Duplicates lookup logic already in Reference initialization
- Couples compliance calculation to ReferenceValues.js API
- Slightly more computation (re-fetches on every calculation)

**When to Use**: When code compliance must always reference authoritative standards, regardless of user edits.

---

#### Option 3: Force 100% in Reference Mode (Pragmatic - Recommended)

**Concept**: Reference mode always shows 100% compliance. Target mode compares against Reference state.

```javascript
// In calculatePlugLoadCompliance() or similar:
if (ModeManager.currentMode === "reference") {
  // Reference mode: Always 100% compliant (it IS the reference)
  setCalculatedValue("m_65", 1.0, "percent-auto"); // 100%
  setCalculatedValue("n_65", "✓", "raw");

  // Reapply class for dual-mode styling (S08 pattern)
  const element = document.querySelector('[data-field-id="n_65"]');
  if (element) {
    element.classList.remove("checkmark", "warning");
    element.classList.add("checkmark");
  }
} else {
  // Target mode: Compare against Reference values
  const refValue = window.TEUI.parseNumeric(ReferenceState.getValue("d_65")) || 7;
  const targetValue = window.TEUI.parseNumeric(TargetState.getValue("d_65")) || 7;
  const compliance = targetValue > 0 ? refValue / targetValue : 0;

  setCalculatedValue("m_65", compliance, "percent-auto");
  setCalculatedValue("n_65", compliance >= 1.0 ? "✓" : "✗", "raw");

  // Apply class
  const element = document.querySelector('[data-field-id="n_65"]');
  if (element) {
    element.classList.remove("checkmark", "warning");
    element.classList.add(compliance >= 1.0 ? "checkmark" : "warning");
  }
}
```

**Pros**:
- **Zero bloat**: Simple mode check, no new storage or lookups
- **Philosophy match**: "Reference model IS 100% by definition"
- **User intent respect**: If user overrides, they're saying "this IS my reference now"
- **Target mode accuracy**: Still shows accurate ref_d_65/d_65 comparison
- **Simplest implementation**: Minimal code, easy to understand

**Cons**:
- Doesn't explicitly show when user has overridden Reference defaults
- Could be confusing if user expects to see "compliance against original code values"
- Reference mode M-column becomes somewhat redundant (always 100%)

**When to Use**: When Reference mode represents "the user's chosen baseline" rather than strictly "code minimum". Best for scenarios where informed users may legitimately want to use stricter-than-code reference values.

---

### Implementation Recommendation

**For Section 09 (and similar user-editable Reference sections)**:

Start with **Option 3 (Force 100%)** because:

1. **Matches existing philosophy**: Other sections treat Reference mode as "the baseline = 100%"
2. **Minimal complexity**: No state management changes needed
3. **User empowerment**: Allows informed users to set their own reference standards
4. **Target mode clarity**: Target vs Reference comparison remains meaningful

**Future consideration**: If code compliance tracking becomes critical (e.g., for official plan reviews), consider implementing **Option 1 (Original Snapshot)** or **Option 2 (Always Fetch)** to distinguish between:
- Code-prescribed reference values (from ReferenceValues.js)
- User-modified reference values (edited in Reference mode)

### Related Sections

This pattern applies to any section where:
- Reference mode values can be user-edited (not just display-only)
- Compliance is measured as a ratio/percentage (not absolute thresholds)
- Both Target and Reference modes need M/N compliance indicators

**Current applicability**: S09 (Internal Gains) - d_65, d_66, g_67

---

**Last Updated**: 2025-11-10
**Sections Using Pattern**: S03, S05, S07, S08
**Global CSS Defined**: src/styles.css lines 2097-2112
