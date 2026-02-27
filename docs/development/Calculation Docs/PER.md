# PER (Primary Energy Renewable) Calculation - S04 Implementation

**Date:** 2025-11-20
**Branch:** S04-PER-CALC
**Field:** h_35
**Status:** 🎯 PLANNED

---

## Overview

**PER (Primary Energy Renewable)** is a Passive House metric calculated field that applies **only to Passive House (PH) standards**. It weights different energy end-uses by their primary energy conversion factors.

**Field:** h_35 (Section04)
- **Previous:** User-defined input with default value 1.00
- **New:** Calculated field (mode-aware for Target and Reference)
- **Format:** 2 decimal places (e.g., "1.23")

---

## Excel Formula

```excel
H35 = IF(ISNUMBER(SEARCH("PH",D13)),
         IF(SUM(J27,J28,J29,J30,J31)=0,
            1,
            ((D114*1.5) + (D117*1.2) + ((J27-D114-D117)*1.15) + (J28*1.75) + (J29*1.75) + (J30*2.3) + (J31*1.1)) / SUM(J27,J28,J29,J30,J31)
         ),
         1
      )
```

---

## Logic Breakdown

### Condition 1: Check if PH Standard
```javascript
if (d_13.includes("PH")) {
  // Calculate PER
} else {
  // Not PH standard → PER = 1.00
}
```

### Condition 2: Check for Zero Total Energy
```javascript
const totalEnergy = j_27 + j_28 + j_29 + j_30 + j_31;
if (totalEnergy === 0) {
  return 1.00; // No energy use → default PER
}
```

### Condition 3: Calculate Weighted PER
```javascript
const numerator = (d_114 * 1.5) +           // Space heating × 1.5
                  (d_117 * 1.2) +           // Space cooling × 1.2
                  ((j_27 - d_114 - d_117) * 1.15) + // Other HVAC × 1.15
                  (j_28 * 1.75) +           // DHW × 1.75
                  (j_29 * 1.75) +           // Plug loads × 1.75
                  (j_30 * 2.3) +            // Lighting × 2.3
                  (j_31 * 1.1);             // Renewable offset × 1.1

const denominator = totalEnergy;
const per = numerator / denominator;
return per;
```

---

## Field Mapping (DOM Field IDs)

### Inputs (Dependencies)

| Excel | DOM Field ID | Description | Section |
|-------|--------------|-------------|---------|
| D13 | `d_13` | Building Standard (Target) | S02 |
| D13 | `ref_d_13` | Building Standard (Reference) | S02 |
| D114 | `d_114` | Space Heating Energy (Target) | S13 |
| D114 | `ref_d_114` | Space Heating Energy (Reference) | S13 |
| D117 | `d_117` | Space Cooling Energy (Target) | S13 |
| D117 | `ref_d_117` | Space Cooling Energy (Reference) | S13 |
| J27 | `j_27` | Total HVAC Energy (Target) | S04 |
| J27 | `ref_j_27` | Total HVAC Energy (Reference) | S04 |
| J28 | `j_28` | DHW Energy (Target) | S04 |
| J28 | `ref_j_28` | DHW Energy (Reference) | S04 |
| J29 | `j_29` | Plug Load Energy (Target) | S04 |
| J29 | `ref_j_29` | Plug Load Energy (Reference) | S04 |
| J30 | `j_30` | Lighting Energy (Target) | S04 |
| J30 | `ref_j_30` | Lighting Energy (Reference) | S04 |
| J31 | `j_31` | Renewable Offset (Target) | S04 |
| J31 | `ref_j_31` | Renewable Offset (Reference) | S04 |

### Output

| Excel | DOM Field ID | Description |
|-------|--------------|-------------|
| H35 | `h_35` | PER (Target) |
| H35 | `ref_h_35` | PER (Reference) |

---

## Primary Energy Conversion Factors

**Source:** PHPP 10.6 (Canada-specific factors)

| Energy End-Use | Factor | Reasoning |
|----------------|--------|-----------|
| Space Heating (D114) | 1.5 | Electric heating primary energy factor |
| Space Cooling (D117) | 1.2 | Electric cooling primary energy factor |
| Other HVAC (J27 - D114 - D117) | 1.15 | Ventilation/pumps/fans |
| DHW (J28) | 1.75 | Hot water heating |
| Plug Loads (J29) | 1.75 | Equipment energy |
| Lighting (J30) | 2.3 | Lighting primary energy |
| Renewables (J31) | 1.1 | Renewable generation credit |

---

## Implementation Plan

### Phase 1: Update Field Definition (Section04.js)

**Current:**
```javascript
h_35: {
  fieldId: "h_35",
  type: "editable",
  value: "1.00", // User-defined default
  // ...
}
```

**New:**
```javascript
h_35: {
  fieldId: "h_35",
  type: "calculated", // Changed from "editable"
  value: "1.00", // Default for non-PH standards
  numberFormat: "0.00", // 2 decimal places
  // ...
}
```

### Phase 2: Implement Calculation Function

**Location:** Section04.js (near other calculation functions)

```javascript
/**
 * Calculate PER (Primary Energy Renewable) for Passive House standards
 * Excel formula: H35 = IF(ISNUMBER(SEARCH("PH",D13)), ...)
 *
 * @param {boolean} isReferenceCalculation - True for Reference mode
 * @returns {number} PER value (typically 1.00 for non-PH, calculated for PH)
 */
function calculatePER(isReferenceCalculation = false) {
  // Read building standard (mode-aware)
  const standard = isReferenceCalculation
    ? getModeAwareValue("ref_d_13") || ""
    : getModeAwareValue("d_13") || "";

  // Check if PH standard
  if (!standard.toUpperCase().includes("PH")) {
    return 1.00; // Non-PH standard → PER = 1.00
  }

  // Read energy values (mode-aware)
  const prefix = isReferenceCalculation ? "ref_" : "";
  const d_114 = parseFloat(getModeAwareValue(`${prefix}d_114`)) || 0; // Space heating
  const d_117 = parseFloat(getModeAwareValue(`${prefix}d_117`)) || 0; // Space cooling
  const j_27 = parseFloat(getModeAwareValue(`${prefix}j_27`)) || 0; // Total HVAC
  const j_28 = parseFloat(getModeAwareValue(`${prefix}j_28`)) || 0; // DHW
  const j_29 = parseFloat(getModeAwareValue(`${prefix}j_29`)) || 0; // Plug loads
  const j_30 = parseFloat(getModeAwareValue(`${prefix}j_30`)) || 0; // Lighting
  const j_31 = parseFloat(getModeAwareValue(`${prefix}j_31`)) || 0; // Renewables

  // Calculate total energy
  const totalEnergy = j_27 + j_28 + j_29 + j_30 + j_31;

  // Check for zero total (avoid division by zero)
  if (totalEnergy === 0) {
    return 1.00;
  }

  // Calculate weighted numerator (primary energy)
  const otherHVAC = j_27 - d_114 - d_117; // Other HVAC (ventilation, pumps, etc.)
  const numerator =
    (d_114 * 1.5) +        // Space heating × 1.5
    (d_117 * 1.2) +        // Space cooling × 1.2
    (otherHVAC * 1.15) +   // Other HVAC × 1.15
    (j_28 * 1.75) +        // DHW × 1.75
    (j_29 * 1.75) +        // Plug loads × 1.75
    (j_30 * 2.3) +         // Lighting × 2.3
    (j_31 * 1.1);          // Renewables × 1.1

  const per = numerator / totalEnergy;
  return per;
}
```

### Phase 3: Integrate into Calculation Engines

**Target Model:**
```javascript
function calculateTargetModel() {
  // ... existing calculations ...

  // Calculate PER (h_35)
  const h_35 = calculatePER(false);
  setCalculatedValue("h_35", h_35.toFixed(2));

  // ... rest of calculations ...
}
```

**Reference Model:**
```javascript
function calculateReferenceModel() {
  // ... existing calculations ...

  // Calculate PER (ref_h_35)
  const ref_h_35 = calculatePER(true);
  setReferenceCalculatedValue("h_35", ref_h_35.toFixed(2));

  // ... rest of calculations ...
}
```

### Phase 4: Add to Display Updates

Ensure `h_35` is included in `updateCalculatedDisplayValues()`:

```javascript
const calculatedFields = [
  // ... existing fields ...
  "h_35", // PER calculation
  // ...
];
```

### Phase 5: Add StateManager Listeners

If h_35 needs to update when dependencies change:

```javascript
// Listen to building standard changes
StateManager.addListener("d_13", () => {
  calculateAll();
  ModeManager.updateCalculatedDisplayValues();
});

StateManager.addListener("ref_d_13", () => {
  calculateAll();
  ModeManager.updateCalculatedDisplayValues();
});

// S13 already publishes d_114, d_117, ref_d_114, ref_d_117
// S04 already has listeners for these values
```

---

## Testing Checklist

### Test 1: Non-PH Standard
1. Set d_13 = "OBC SB10 5.5-6 Z6" (non-PH)
2. **Expected:** h_35 = 1.00
3. **Check:** Value displays with 2 decimal places

### Test 2: PH Standard with Normal Energy Use
1. Set d_13 = "PH Classic"
2. Load typical building with energy values
3. **Expected:** h_35 calculates weighted average (e.g., 1.45)
4. **Check:** Value updates based on energy mix

### Test 3: PH Standard with Zero Energy
1. Set d_13 = "PH Classic"
2. Set all energy inputs to 0
3. **Expected:** h_35 = 1.00 (default for zero energy)

### Test 4: Reference Mode
1. Switch to Reference mode
2. Set ref_d_13 = "PH Low Energy"
3. **Expected:** ref_h_35 calculates independently from h_35
4. **Check:** Target and Reference PER values can differ

### Test 5: Dynamic Updates
1. Change d_114 (space heating) value
2. **Expected:** h_35 recalculates immediately
3. **Check:** PER updates reflect new energy mix

---

## Edge Cases

1. **Division by Zero:** If total energy = 0, return 1.00
2. **Negative Energy:** Shouldn't happen, but handle gracefully (use Math.abs?)
3. **Missing Dependencies:** Default to 0 for missing energy values
4. **Invalid Standard:** If d_13 is undefined/null, treat as non-PH (PER = 1.00)

---

## Number Formatting

**Current Issue:** h_35 may not display with 2 decimal places

**Fix:** Ensure field definition and StateManager use correct format:

```javascript
// In field definition:
numberFormat: "0.00"

// When setting value:
setCalculatedValue("h_35", per.toFixed(2));

// Display format helper (if needed):
function formatPER(value) {
  return parseFloat(value).toFixed(2);
}
```

---

## Dependencies Summary

**Section04 depends on:**
- **S02:** d_13, ref_d_13 (building standard)
- **S13:** d_114, ref_d_114 (space heating energy)
- **S13:** d_117, ref_d_117 (space cooling energy)
- **S04 (internal):** j_27-j_31 (energy totals by end-use)

**Sections depending on S04:**
- **S01:** Dashboard may display PER for PH projects

---

## Implementation Order

1. ✅ Create PER.md documentation (this file)
2. ⏳ Update h_35 field definition (type: "calculated", numberFormat: "0.00")
3. ⏳ Implement `calculatePER(isReferenceCalculation)` function
4. ⏳ Integrate into `calculateTargetModel()` and `calculateReferenceModel()`
5. ⏳ Add h_35 to `updateCalculatedDisplayValues()`
6. ⏳ Test all scenarios (PH/non-PH, Target/Reference, edge cases)
7. ⏳ Commit changes

---

## Notes

- **PER only applies to Passive House standards** - this is why the formula checks for "PH" in d_13
- **Primary energy factors** weight different end-uses by their upstream energy consumption
- **Higher PER = less efficient** energy mix (more reliance on high-primary-energy sources)
- **PER = 1.00** is the baseline/default for non-PH standards

---

**Next Step:** Review this document, then proceed with implementation Phase 1 (field definition update).
