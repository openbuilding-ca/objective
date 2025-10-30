# S12 g_101 Reference Mode Bug - Investigation Report

**Date:** October 17, 2025
**Status:** 🔴 OPEN - Requires systematic investigation
**Severity:** HIGH - Reference mode calculations incorrect

---

## Problem Summary

**Observed:** S12 Reference mode calculates g_101 (weighted average U-value for air-facing surfaces) as **0.348**, when Excel shows it should be **0.572**.

**Impact:** Reference building performance calculations are understated, making Target building appear less efficient than it actually is.

---

## The Formula (from Excel)

```
g_101 = (SUMPRODUCT(G85:G93, D85:D93) / SUM(D85:D93)) * (D97 + 1)
```

Where:

- **G85:G93** = U-values for each building component (roof, walls, doors, windows, etc.)
- **D85:D93** = Area for each component (m²)
- **D97** = Thermal bridge penalty percentage (TB%)
- **Result** = Area-weighted average U-value with TB penalty applied

---

## Investigation Results (Oct 17, 2025)

### What We Found

1. **✅ S11 DOM displays correct Reference U-values:**

   - Doors (g_88): **1.990 W/m²K** (Reference code minimum) ✓
   - Windows (g_89-g_92): **1.420 W/m²K** (Reference code minimum) ✓
   - Roof/walls (g_85-g_87): Correct Reference values ✓

2. **❌ S12 calculation uses wrong U-values:**

   ```
   [S12 DEBUG] Reading from S11.ReferenceState: g_88=1.99, f_88=0.502...
   ```

   Even though reading from S11.ReferenceState works, values don't update when editing.

3. **❌ S12 doesn't respond to live edits:**
   - Changed U-values to 5.0 in S11 Reference mode
   - S12's g_101 remained at 0.572 (stale values)
   - Indicates S12 is reading cached/stale state, not live values

### Attempted Fixes (All Reverted)

**Attempt 1: Mode-aware area reads**

- Made S12 read `ref_d_85-ref_d_95` for Reference mode
- Result: Broke nothing, fixed nothing
- Reverted: Areas are same between modes (building geometry doesn't change)

**Attempt 2: Mode-aware U-value fallback**

- Changed fallback to read `ref_g_XX` instead of `g_XX`
- Made fallback work correctly with StateManager
- Result: g_101 = 0.572 ✓ BUT using fallback, not sovereign state
- Reverted: Violates CHEATSHEET principle - fallbacks mask bugs

**Attempt 3: Fix S11 module path**

- Changed `window.TEUI.sect11` → `window.TEUI.SectionModules.sect11`
- S12 successfully reads from S11.ReferenceState
- Result: Reads stale values, doesn't respond to edits
- Reverted: Still not solving root cause

### Root Cause Analysis

The issue is **NOT** in S12's reading logic. The issue is one of:

**Option A: S11 ReferenceState not updating**

- User edits U-values in S11 Reference mode
- S11's ReferenceState doesn't get updated
- S12 reads stale values from S11.ReferenceState

**Option B: S12 not recalculating**

- S11 updates its ReferenceState correctly
- S12 doesn't listen to changes and recalculate
- S12 shows cached results from initial calculation

**Option C: State synchronization timing**

- S11 updates ReferenceState AFTER S12 reads it
- Race condition between S11 calculations and S12 reads
- Need proper listener/event flow

---

## Architectural Context (from CHEATSHEET)

### The Correct Pattern (State Sovereignty)

According to CHEATSHEET.md:

- **Sections own their own state** (TargetState, ReferenceState)
- **Cross-section reads** should prefer sovereign state over StateManager
- **Fallbacks mask bugs** and should be eliminated systematically

```javascript
// ✅ CORRECT: Read from S11's sovereign state
const s11 = window.TEUI.SectionModules.sect11;
const uValue = s11.ReferenceState.getValue("g_88"); // Should be live, dynamic

// ❌ ANTI-PATTERN: Fall back to StateManager
const uValue = window.TEUI.StateManager.getValue("ref_g_88"); // Static, cached
```

### Dual-Engine Pattern

Both `calculateTargetModel()` and `calculateReferenceModel()` run in parallel on every `calculateAll()` call. S12 should:

1. Read live values from S11's state objects
2. Calculate weighted averages
3. Store results to both local state AND StateManager

---

## What We Know Works

1. ✅ **S10 area publishing** - Now publishes both `ref_d_73-d_78` AND `ref_d_88-d_93` for S11/S12 consumption
2. ✅ **S12 reads correct module path** - `window.TEUI.SectionModules.sect11` works
3. ✅ **S11 displays correct values** - UI shows proper Reference U-values
4. ✅ **Fallback produces correct math** - When reading from StateManager, g_101 = 0.572 matches Excel

---

## Next Steps for Investigation

### Phase 1: Verify S11 State Updates

**Test in browser console:**

```javascript
// Switch to Reference mode in S11
// Edit g_88 (doors) to 5.0
// Then check:
window.TEUI.SectionModules.sect11.ReferenceState.getValue("g_88");
// Expected: "5.0" or 5.0
// If still 1.99, S11's ReferenceState isn't updating
```

### Phase 2: Verify S12 Listener Setup

**Check if S12 listens to S11 changes:**

```bash
grep "addListener.*g_8[5-9]" sections/4012-Section12.js
grep "addListener.*ref_g_" sections/4012-Section12.js
```

Expected: S12 should have listeners for S11's U-value changes to trigger recalculation.

### Phase 2.5: Eliminate Silent Failure Fallbacks (CRITICAL)

**Problem:** S12's `getUValueFromS11()` function has fallback logic that masks failures:

```javascript
// Current implementation (ANTI-PATTERN per CHEATSHEET)
function getUValueFromS11(componentId, useReference) {
  try {
    const s11 = window.TEUI?.SectionModules?.sect11;
    const state = useReference ? s11?.ReferenceState : s11?.TargetState;
    if (state?.getValue) {
      const gVal = window.TEUI.parseNumeric(state.getValue(`g_${componentId}`));
      if (!isNaN(gVal) && isFinite(gVal) && gVal > 0) return gVal;
      // ... try RSI conversion ...
    }
  } catch (e) {
    // fall through to global fallback ← MASKS ERRORS
  }
  // Fallback to global StateManager values ← SILENT FAILURE
  const gGlobal = window.TEUI.parseNumeric(
    getGlobalNumericValue(`g_${componentId}`),
  );
  if (!isNaN(gGlobal) && isFinite(gGlobal) && gGlobal > 0) return gGlobal;
  // ... more fallbacks ...
  return 0; // ← MASKS MISSING DATA
}
```

**Why This Is Bad (per CHEATSHEET):**

1. **Hides state update failures** - If S11's state isn't updating, fallback reads stale StateManager values
2. **Prevents dynamic calculations** - Fallback values are static, don't respond to user edits
3. **Masks architectural issues** - Silent failures prevent discovering root causes
4. **Violates state sovereignty** - Cross-section reads should fail loudly when state is unavailable

**Recommended Pattern (Fail-Fast):**

```javascript
// ✅ STRICT: Fail loudly when S11 state is unavailable
function getUValueFromS11(componentId, useReference) {
  const s11 = window.TEUI?.SectionModules?.sect11;
  if (!s11) {
    console.error(`[S12] CRITICAL: S11 module not available`);
    return null; // Let caller handle missing dependency
  }

  const state = useReference ? s11.ReferenceState : s11.TargetState;
  if (!state?.getValue) {
    console.error(
      `[S12] CRITICAL: S11 ${useReference ? "Reference" : "Target"}State not available`,
    );
    return null;
  }

  // Try U-value first
  const gVal = window.TEUI.parseNumeric(state.getValue(`g_${componentId}`));
  if (!isNaN(gVal) && isFinite(gVal) && gVal > 0) return gVal;

  // Try RSI conversion
  const fVal = window.TEUI.parseNumeric(state.getValue(`f_${componentId}`));
  if (!isNaN(fVal) && isFinite(fVal) && fVal > 0) return 1 / fVal;

  // ❌ NO FALLBACK - Missing value is a bug that needs fixing
  console.warn(
    `[S12] Missing U-value for component ${componentId} in ${useReference ? "Reference" : "Target"} mode`,
  );
  return null;
}

// In calculateCombinedUValue():
const g85 = getUValueFromS11("85", useRef);
if (g85 === null) {
  console.error(`[S12] Cannot calculate g_101: missing g_85 from S11`);
  return; // Don't calculate with incomplete data
}
```

**Benefits of Fail-Fast:**

1. **Immediate error detection** - Missing state produces clear console errors
2. **Forces proper fixes** - Can't mask architectural issues with fallbacks
3. **Dynamic calculations** - Only live state values are used
4. **State sovereignty** - Respects CHEATSHEET principle of sovereign state reads

**Implementation Priority:** HIGH - Should be done BEFORE fixing the g_101 calculation bug, as fallbacks currently mask the real issue.

### Phase 3: Trace Calculation Flow

**Add strategic logging to S11:**

```javascript
// In S11's ModeManager.setValue() or ReferenceState.setValue()
console.log(`[S11] ReferenceState.setValue(${fieldId}, ${value})`);
```

**Add strategic logging to S12:**

```javascript
// In S12's calculateReferenceModel()
console.log(`[S12] calculateReferenceModel() triggered`);
```

Track when S11 updates and when S12 recalculates.

---

## Files Involved

### Modified (Oct 17)

- `OBJECTIVE 4011RF/sections/4012-Section10.js` - ✅ KEPT (area publishing enhancement)
- `OBJECTIVE 4011RF/sections/4012-Section12.js` - ⏪ REVERTED (removed patchwork fixes)

### Need Investigation

- `OBJECTIVE 4011RF/sections/4012-Section11.js` - Check ReferenceState update logic
- `OBJECTIVE 4011RF/sections/4012-Section12.js` - Check listener setup for S11 dependencies

---

## Success Criteria

When bug is fixed:

1. ✅ S12 Reference mode g_101 shows **0.572** (matches Excel)
2. ✅ Editing U-values in S11 Reference mode **immediately updates** S12's g_101
3. ✅ No fallback to StateManager - reads from **S11's sovereign state**
4. ✅ Calculation is **dynamic** - responds to all user edits in real-time
5. ✅ Target mode still works correctly (g_101 ≈ 0.278)

---

## Technical Debt Summary

**Added during investigation:**

- S10 now publishes redundant area field IDs (both S10 and S11 IDs)
- Debug logging throughout S12 (can be removed after fix)

**Removed during cleanup:**

- Patchwork mode-aware fallbacks in S12
- Debug logging for U-value reads
- Mode-aware area reads (unnecessary - areas are same)

**Net result:** Cleaner than before investigation started.

---

## TODO: Remove Duplicate Publishing

**Issue:** S10 and S11 both publish `ref_d_88-ref_d_93` (window/door areas).

**Current state:**

- S10 publishes: `ref_d_73-d_78` AND `ref_d_88-d_93` (new)
- S11 syncs from S10's `ref_d_73-d_78` → stores as `d_88-d_93` in ReferenceState
- S11 publishes: `ref_d_88-d_93` (line 1751-1756 in 4012-Section11.js)

**Problem:** Duplicate publishing creates confusion about single source of truth.

**Recommended cleanup:**

1. **Keep S10 publishing** `ref_d_88-d_93` (simplest, most direct)
2. **Remove from S11** lines 1751-1756 in `areaFields` array
3. S11 still needs to publish `ref_d_85, ref_d_86, ref_d_87, ref_d_94, ref_d_95, ref_d_96` (non-window/door areas)

**Code location:**

```javascript
// OBJECTIVE 4011RF/sections/4012-Section11.js:1747-1760
const areaFields = [
  "d_85",
  "d_86",
  "d_87",
  "d_88",
  "d_89",
  "d_90",
  "d_91",
  "d_92",
  "d_93", // ← REMOVE these 6 (S10 publishes them)
  "d_94",
  "d_95",
  "d_96",
];
```

**Priority:** LOW - Works correctly as-is, just redundant. Clean up during next S11 maintenance.

---

## Related Documentation

- `documentation/history (completed)/4012-CHEATSHEET.md` - State sovereignty principles
- `documentation/history (completed)/UNTANGLE.md` - Fallback contamination patterns
- `OBJECTIVE 4011RF/4011-ReferenceValues.js` - Reference building code U-values

---

## ✅ **FIXED (October 17, 2025)**

### **Root Cause Identified**

S12 was accessing `window.TEUI.sect11` (compatibility shim with only `ModeManager`) instead of `window.TEUI.SectionModules.sect11` (full module with `ReferenceState`/`TargetState`). This caused S12 to fall back to stale StateManager values.

**Result:** Reference g_101 calculated as **0.348 W/m²K** instead of **0.572 W/m²K** because it was reading Target U-values instead of Reference U-values.

### **Diagnostic Process**

1. **Created debug script** ([G101-DEBUG-SCRIPT.md](G101-DEBUG-SCRIPT.md)) to trace U-values, areas, and TB%
2. **Found discrepancy**: Manual calculation = 0.572 ✅ | S12 StateManager = 0.348 ❌
3. **Identified**: S12 `getUValueFromS11()` was accessing wrong module path
4. **Verified**: All U-values from S11.ReferenceState were correct in diagnostic, but S12's actual calculation used wrong values

### **Fix Applied**

**Commit 0934120**: Fixed module path access

- **File**: `sections/4012-Section12.js`
- **Line 1510**: `getUValueFromS11()` now accesses `window.TEUI.SectionModules.sect11`
- **Line 1572**: TB% reading now accesses `window.TEUI.SectionModules.sect11`

**Commit d714537**: Optimized listeners for performance

- **Removed**: 11 RSI listeners (`ref_f_85` through `ref_f_95`)
- **Kept**: 11 U-value listeners (`ref_g_85` through `ref_g_95`)
- **Rationale**: S11 converts RSI→U internally, so S12 only needs final U-values per formula:
  ```
  g_101 = (SUMPRODUCT(g_85:g_95, d_85:d_95) / SUM(d_85:d_95)) × (1 + d_97/100)
  ```

**Commit 169eaff**: Eliminated fallback anti-patterns

- **Critical Issue**: Silent fallbacks could cause Reference calculations to use Target values
- **getUValueFromS11()**: Removed try-catch fallback to unprefixed StateManager (would use Target U-values!)
- **TB% reading**: Removed 5-level fallback chain ending with unprefixed d_97 (would use Target TB%!)
- **Now**: Functions fail loudly (console.warn) when values missing, preserving state sovereignty
- **Benefit**: Prevents silent cross-mode contamination during initialization or state issues

### **Verification**

✅ Reference g_101 now calculates correctly at **0.572 W/m²K**
✅ Reduced listener count from 23 to 12 for faster response
✅ S12 recalculates immediately on S11 U-value changes
✅ No fallback to stale StateManager values

### **Architectural Compliance**

Per CHEATSHEET.md:

- ✅ **State Sovereignty**: Reads from S11's sovereign state objects
- ✅ **Correct Module Path**: Uses `SectionModules` not compat shim
- ✅ **Optimized Listeners**: Only listens to direct formula dependencies
- ✅ **Dual-Engine Pattern**: Reference and Target calculations fully isolated

---

**Issue resolved.** Reference model now has full parity with Target model for g_101 calculation.
