# VOLUME-RESPONSIVE-TARGET: Batch Publishing Experiment

**Status:** Planning
**Created:** 2025-10-28
**Goal:** Make Target mode h_10 responsive to small volume changes (200m³) like Reference mode

---

## Problem Statement

**Current Behavior:**
- Reference mode: 200m³ volume change → e_10 updates (197.7 → 198.1, Δ=0.4)
- Target mode: 200m³ volume change → h_10 doesn't update (93.7 → 93.7, Δ=0.0)

**Root Cause:**
Target mode produces energy deltas (~1.04 kWh / 200m³) that don't cross the 1-decimal-place rounding threshold in S01 (93.7207 vs 93.7214 both round to 93.7).

**Hypothesis:**
Reference mode's batch publishing via `storeReferenceResults()` preserves precision better than Target's individual `setFieldValue()` calls in `updateTargetModelDOMValues()`.

---

## Test Results (Baseline)

### Console Diagnostics Script

Run in browser console while in **Target mode**:

```javascript
// Baseline test - record initial values
console.log("=== BASELINE TEST ===");
console.log("d_105:", window.TEUI.StateManager.getValue("d_105"));
console.log("d_120:", window.TEUI.StateManager.getValue("d_120"));
console.log("m_121:", window.TEUI.StateManager.getValue("m_121"));
console.log("d_136:", window.TEUI.StateManager.getValue("d_136"));
console.log("j_32:", window.TEUI.StateManager.getValue("j_32"));
console.log("h_10:", window.TEUI.StateManager.getValue("h_10"));
console.log("Display h_10:", document.querySelector('[data-field-id="h_10"] .key-value')?.textContent);
```

**Result at d_105 = 8200m³:**
```
d_105: 8200
d_120: 3416.6666666666665    (full precision)
m_121: 50205.32000000001     (full precision)
d_136: 133758.26501520345    (full precision)
j_32: 133758.26501520345     (full precision)
h_10: 93.7 (display)
```

**Result at d_105 = 8000m³ (from earlier logs):**
```
j_32: 133757.22783115375
h_10: 93.7 (display) - SAME VALUE
```

**Delta for 200m³ change:**
- Energy: 1.04 kWh absolute (0.0008% relative)
- TEUI: 0.0007 kWh/m² (below 1dp rounding threshold)

---

## Proposed Solution: Batch Publishing for Target Mode

### Current Architecture (Target Mode)

**S13 calculateTargetModel()** → **updateTargetModelDOMValues()** → Individual **setFieldValue()** calls

```javascript
// Current: Individual publishing (lines 3215-3330)
function updateTargetModelDOMValues(
  copResults,
  heatingResults,
  coolingResults,
  ventilationRatesResults,
  ventilationEnergyResults,
  coolingVentilationResults,
  freeCoolingResults,
  unmitigatedResults,
  mitigatedResults,
) {
  // 80+ individual setFieldValue() calls
  if (ventilationRatesResults.d_120 !== undefined)
    setFieldValue("d_120", ventilationRatesResults.d_120, "number-2dp-comma");
  if (ventilationEnergyResults.m_121 !== undefined)
    setFieldValue("m_121", ventilationEnergyResults.m_121, "number-2dp-comma");
  // ... etc
}
```

### Proposed Architecture (Target Mode)

**S13 calculateTargetModel()** → **storeTargetResults()** → Batch publish like Reference

```javascript
// Proposed: Batch publishing (mirror storeReferenceResults pattern)
function storeTargetResults(
  copResults,
  heatingResults,
  coolingResults,
  unmitigatedResults,
  mitigatedResults,
  ventilationRatesResults,
  ventilationEnergyResults,
  coolingVentilationResults,
  freeCoolingResults,
) {
  if (!window.TEUI?.StateManager) return;

  // Combine all Target calculation results
  const allResults = {
    ...copResults,
    ...heatingResults,
    ...coolingResults,
    ...unmitigatedResults,
    ...mitigatedResults,
    ...ventilationRatesResults,
    ...ventilationEnergyResults,
    ...coolingVentilationResults,
    ...freeCoolingResults,
  };

  // Store Target results WITHOUT prefix for downstream consumption
  Object.entries(allResults).forEach(([fieldId, value]) => {
    if (value !== null && value !== undefined) {
      window.TEUI.StateManager.setValue(
        fieldId,
        value.toString(),
        "calculated",
      );
    }
  });

  // Update DOM separately (preserve formatting)
  updateTargetModelDOMValues(allResults);
}
```

---

## Implementation Plan

### Phase 1: Create Batch Publishing Function (30 min)

**File:** `OBJECTIVE 4011RF/sections/4012-Section13.js`

**Tasks:**
1. Create `storeTargetResults()` function (mirror lines 3333-3372)
2. Separate StateManager publishing from DOM updates
3. Create simplified `updateTargetModelDOM()` for formatting only

**Location:** Insert after `storeReferenceResults()` (after line 3372)

### Phase 2: Refactor calculateTargetModel() (15 min)

**File:** `OBJECTIVE 4011RF/sections/4012-Section13.js`

**Changes in calculateTargetModel() (lines 3149-3210):**
```javascript
// Before:
updateTargetModelDOMValues(
  copResults,
  heatingResults,
  coolingResults,
  ventilationRatesResults,
  ventilationEnergyResults,
  coolingVentilationResults,
  freeCoolingResults,
  unmitigatedResults,
  mitigatedResults,
);

// After:
storeTargetResults(
  copResults,
  heatingResults,
  coolingResults,
  unmitigatedResults,
  mitigatedResults,
  ventilationRatesResults,
  ventilationEnergyResults,
  coolingVentilationResults,
  freeCoolingResults,
);
```

### Phase 3: Refactor updateTargetModelDOMValues() (15 min)

**File:** `OBJECTIVE 4011RF/sections/4012-Section13.js`

**Changes:**
1. Rename to `updateTargetModelDOM()`
2. Remove all `setFieldValue()` calls
3. Keep only DOM formatting/update logic
4. Read values from StateManager instead of parameters

**Or:** Keep calling `setFieldValue()` but have it skip StateManager publication (add flag)

### Phase 4: Test & Validate (20 min)

**Tests:**
1. Run baseline console script (record values)
2. Change volume by 200m³ (8000 → 8200)
3. Run console script again
4. Verify h_10 changed on display
5. Test large changes still work (8000 → 20000)
6. Test Reference mode still works

**Success Criteria:**
- 200m³ change produces different h_10 value
- Cascade still works: S12 → S13 → S15 → S04 → S01
- Reference mode unaffected

---

## Testing Scripts

### Before Implementation
```javascript
// Test 1: Record baseline at 8000m³
console.log("=== TEST 1: Baseline at d_105=8000 ===");
console.log("j_32:", window.TEUI.StateManager.getValue("j_32"));
console.log("h_10:", window.TEUI.StateManager.getValue("h_10"));
console.log("Display:", document.querySelector('[data-field-id="h_10"] .key-value')?.textContent);

// Change d_105 to 8200 in UI, then run:

// Test 2: Record after 200m³ change
console.log("=== TEST 2: After change to d_105=8200 ===");
console.log("j_32:", window.TEUI.StateManager.getValue("j_32"));
console.log("h_10:", window.TEUI.StateManager.getValue("h_10"));
console.log("Display:", document.querySelector('[data-field-id="h_10"] .key-value')?.textContent);

// Expected BEFORE fix:
// TEST 1: j_32=133757.228, h_10=93.7
// TEST 2: j_32=133758.265, h_10=93.7 (NO CHANGE - BAD)

// Expected AFTER fix:
// TEST 1: j_32=133757.228, h_10=93.7
// TEST 2: j_32=133758.265, h_10=93.8 (or different value - GOOD)
```

### After Implementation
```javascript
// Comprehensive validation
console.log("=== POST-IMPLEMENTATION VALIDATION ===");

// Check all intermediate values have full precision
const fields = ["d_105", "d_120", "m_121", "d_136", "j_32", "h_10"];
fields.forEach(fieldId => {
  const value = window.TEUI.StateManager.getValue(fieldId);
  console.log(`${fieldId}: ${value} (length: ${value?.toString().length})`);
});

// Check if values are being published during calculation
window.TEUI.StateManager.addListener("j_32", (newVal, oldVal) => {
  console.log(`🔔 j_32 changed: ${oldVal} → ${newVal} (delta: ${parseFloat(newVal) - parseFloat(oldVal)})`);
});
```

---

## Risks & Mitigation

### Risk 1: Breaking Existing Target Mode Calculations
**Mitigation:**
- Keep `updateTargetModelDOMValues()` as-is initially
- Add `storeTargetResults()` alongside it
- Test thoroughly before removing old code

### Risk 2: Double Publishing
**Mitigation:**
- Ensure `storeTargetResults()` publishes ONCE per calculation
- Remove StateManager calls from `setFieldValue()` when used from DOM update

### Risk 3: No Improvement
**Mitigation:**
- If batch publishing doesn't help, investigate calculation sensitivity
- May need to increase precision of intermediate calculations
- May need to change S01 rounding from 1dp to 2dp (but affects all other modes)

---

## Alternative Approaches (if batch publishing fails)

### Option A: Increase S01 Precision
Change S01 h_10 calculation from:
```javascript
const h_10 = Math.round((targetEnergy / targetArea) * 10) / 10; // 1dp
```
To:
```javascript
const h_10 = Math.round((targetEnergy / targetArea) * 100) / 100; // 2dp
```

**Pros:** Guaranteed to show small changes
**Cons:** Changes display format across entire app

### Option B: Amplify Ventilation Sensitivity
Investigate why Reference mode has 400x larger energy deltas per m³ than Target mode. Possibly:
- Different ACH rates
- Different occupancy factors
- Different heat recovery effectiveness

### Option C: Change Detection Threshold
Modify S01 listener to trigger on smaller absolute changes:
```javascript
if (Math.abs(parseFloat(newValue) - parseFloat(oldValue)) > 0.5) {
  runAllCalculations();
}
```

**Pros:** Respects rounding but shows "pending" state
**Cons:** Adds complexity

---

## Next Steps

1. Review this workplan with user
2. Get approval to proceed with Phase 1
3. Create feature branch: `feature/volume-responsive-target`
4. Implement batch publishing
5. Test with scripts above
6. Commit if successful, revert if not

---

## Success Metrics

- [ ] 200m³ volume change triggers visible h_10 update
- [ ] Small changes (200-1000m³) produce proportional h_10 changes
- [ ] Large changes (10,000m³) still work correctly
- [ ] Reference mode behavior unchanged
- [ ] No performance regression (<200ms calculation time)
- [ ] All existing tests pass

---

## Notes

- This experiment tests if batch publishing improves precision
- If it doesn't help, the issue is calculation sensitivity, not publishing mechanics
- Reference mode's higher sensitivity suggests Target calculations may have different assumptions
- May need to trace why Reference produces 0.4 kWh/m² per 200m³ vs Target's 0.0007 kWh/m²
