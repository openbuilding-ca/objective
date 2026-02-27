# h_23 (Tset Heating) State Persistence Bug - RESOLVED

**Status:** ✅ RESOLVED
**Date:** 2025-11-20
**Branch:** G-REF-ONLY
**Fix Commit:** d2befa2

---

## Bug Summary

**Symptom:**
When d_12 = Critical Occupancy (C-Residential, B2/B3 Care) AND user switches d_13 FROM PH standard TO non-PH standard, h_23 remained stuck at 18°C instead of updating to 22°C.

**Required Behavior:**
- IF d_12 = Critical Occupancy (C-Residential, B2/B3 Care)
- AND d_13 = non-PH standard (e.g., "OBC SB10 5.5-6 Z6")
- THEN h_23 MUST = 22°C
- (Bug: h_23 stayed stuck at 18°C)

**Trigger:**
User changes d_13 standard dropdown AFTER setting d_12 to Critical Occupancy

**Workaround:**
Toggle d_12 dropdown to any value and back to Critical Occupancy

---

## Root Cause

Section03 had **no listeners for d_13 changes** (removed in earlier SMOOTH-MOVE-S02 work to prevent 48-cycle cascade). This meant h_23 calculation never ran when d_13 changed, so it couldn't detect the switch from PH → non-PH standards.

**The h_23 Calculation Logic (Section03.js lines 2033-2072):**
```javascript
function calculateHeatingSetpoint() {
  const referenceStandard = getModeAwareGlobalValue("d_13");
  const occupancyType = getModeAwareGlobalValue("d_12");

  // Priority 1: PH standards always get 18°C
  if (referenceStandard?.toUpperCase().includes("PH")) {
    heatingSetpoint = 18;
  } else {
    // Priority 2: Critical Occupancy gets 22°C for non-PH standards
    if (occupancyType === "C-Residential" ||
        occupancyType === "B2-Care and Treatment" ||
        occupancyType === "B3-Detention Care & Treatment" ||
        occupancyType.includes("Care")) {
      heatingSetpoint = 22;
    } else {
      heatingSetpoint = 18; // Other occupancies
    }
  }

  setFieldValue("h_23", heatingSetpoint);
  return heatingSetpoint;
}
```

**The logic was correct**, but Section03 never recalculated when d_13 changed because it had no listeners for d_13.

---

## Solution

### 1. Enhanced Section02 Initialization (Section02.js lines 1855-1893)

Sync BOTH Target and Reference states to StateManager on page load to prevent initial state desynchronization:

```javascript
initialize: function () {
  try {
    TargetState.setDefaults();
    TargetState.loadState();
    ReferenceState.setDefaults();
    ReferenceState.loadState();

    // ✅ STATE SYNC FIX: Sync both Target AND Reference states to StateManager
    if (window.TEUI?.StateManager) {
      const fieldsToSync = ["d_12", "d_13", "d_14", "d_15", "h_12", "h_13", ...];

      // Sync Target values (unprefixed)
      fieldsToSync.forEach(id => {
        const val = TargetState.getValue(id);
        if (val != null && val !== "") {
          window.TEUI.StateManager.setValue(id, val, "default");
        }
      });

      // Sync Reference values (ref_ prefixed)
      fieldsToSync.forEach(id => {
        const refId = `ref_${id}`;
        const val = ReferenceState.getValue(id);
        if (val != null && val !== "") {
          window.TEUI.StateManager.setValue(refId, val, "default");
        }
      });
    }
  } catch (e) {
    console.warn("[S02] initialize: state initialization error", e);
  }
}
```

### 2. Restored d_13 Listeners in Section03 (Section03.js lines 2536-2550)

Added listeners for d_13 changes to trigger h_23 recalculation:

```javascript
// ✅ h_23 BUG FIX: Restore d_13 listeners for h_23 temperature calculation
// h_23 (Tset Heating) depends on BOTH d_12 (occupancy) AND d_13 (standard)
window.TEUI.StateManager.addListener("d_13", function () {
  calculateAll(); // Recalculates h_23 based on current d_13 and d_12 values
  ModeManager.updateCalculatedDisplayValues();
});

window.TEUI.StateManager.addListener("ref_d_13", function () {
  calculateAll(); // Recalculates ref_h_23 based on current ref_d_13 and ref_d_12 values
  ModeManager.updateCalculatedDisplayValues();
});
```

### 3. Added Diagnostic Logging (Section02.js lines 1941-1955)

For future debugging:

```javascript
setValue: function (fieldId, value, source = "calculated") {
  const currentState = this.currentMode === "target" ? TargetState : ReferenceState;
  currentState.setValue(fieldId, value, source);

  if (this.currentMode === "target" && window.TEUI?.StateManager) {
    if (fieldId === "d_12") {
      console.log(`[S02 ModeManager] 🔵 Writing TARGET d_12="${value}" to StateManager`);
    }
    window.TEUI.StateManager.setValue(fieldId, value, source);
  }

  if (this.currentMode === "reference" && window.TEUI?.StateManager) {
    if (fieldId === "d_12") {
      console.log(`[S02 ModeManager] 🔵 Writing REFERENCE ref_d_12="${value}" to StateManager`);
    }
    window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, source);
  }
}
```

---

## Verification Testing

**Test Scenario:**
1. Load page with d_13 = "OBC SB10", d_12 = "A-Assembly" → h_23 = 18°C ✅
2. Change d_13 to "PH Classic" → h_23 = 18°C ✅
3. Change d_12 to "C-Residential" (Critical) → h_23 = 18°C (PH overrides) ✅
4. Change d_13 back to "OBC SB10 5.5-6 Z6" → **h_23 = 22°C** ✅ **FIXED!**

**Performance:**
- Console logs: **~2,124 lines** (down from 35,000+)
- No 48-cycle cascade reintroduced
- Calculation logic runs cleanly

---

## Architectural Safety

**Why this doesn't bring back the cascade:**

1. **No PH override logic in listeners** - Just triggers `calculateAll()`
2. **Calculation reads from StateManager** - Uses current values of d_12 and d_13
3. **No circular feedback** - Section03 doesn't modify d_13, only calculates h_23
4. **Clean separation** - PH-specific values still come from ReferenceValues.js via "Set Values" button
5. **Mode-aware** - Both `d_13` and `ref_d_13` listeners handle their respective modes

---

## Files Changed

1. **Section02.js** - Enhanced initialization to sync states to StateManager, added diagnostic logging
2. **Section03.js** - Restored d_13/ref_d_13 listeners for h_23 recalculation

---

## Commits

- `7d805d2` - Documentation baseline (safe restore point)
- `d2befa2` - **The fix** ✅

---

## Related Issues

This bug was originally thought to be:
- d_12 resetting to default when d_13 changed (incorrect theory)
- StateManager not receiving user changes (partially correct)
- Calculation timing issues (incorrect theory)

**Actual cause:** Section03 simply wasn't listening to d_13 changes, so h_23 never recalculated when the building standard changed.

---

**Status:** ✅ **RESOLVED** - h_23 now correctly updates based on both d_12 (occupancy) and d_13 (building standard) changes.
