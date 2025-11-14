# Wet Bulb Temperature Convergence Investigation
**Date:** November 14, 2025
**Branch:** dependency3
**Issue:** Target TEUI does not converge after changing h_15 (conditioned area) and returning to original value

## The Problem

**Symptom:**
- Change h_15 (conditioned area) → TEUI changes ✅
- Change h_15 back to original value → TEUI does NOT return to original value ❌
- **Workaround (Target mode):** Toggle d_116 (Cooling) AND d_113 (Heating System) → TEUI corrects
- **Reference mode:** Still works with just d_116 toggle ✅

**Timing:** Issue appeared after implementing simple wet bulb temperature formula (commit c81ace8)

## What Changed

### Commit c81ace8: "Fix: Use simple wet bulb temperature formula for Excel parity"

**File:** `src/core/Cooling.js`
**Change:** Lines 503-511

**BEFORE (Averaged formula):**
```javascript
const twbSimple = tdb - (tdb - (tdb - (100 - rh) / 5)) * (0.1 + 0.9 * (rh / 100));
const twbCorrected = tdb - (tdb - (tdb - (100 - rh) / 5)) * (0.3 + 0.7 * (rh / 100));

// Average of both
stateObj.wetBulbTemperature = (twbSimple + twbCorrected) / 2;
```

**AFTER (Simple formula only):**
```javascript
const twbSimple = tdb - (tdb - (tdb - (100 - rh) / 5)) * (0.1 + 0.9 * (rh / 100));

// ✅ CORRECTED (ANDYs13 branch): USE twbSimple INSTEAD for Excel parity (no averaging)
stateObj.wetBulbTemperature = twbSimple;
```

**Impact:** This changes the wet bulb temperature calculation, which affects:
- Saturation vapor pressure (pSatAvg) via `calculateAtmosphericValues()`
- Humidity ratios (A61, A62, A63)
- Latent load factor (A6)
- Cooling demand calculations (m_129, d_117, etc.)

## Investigation Findings

### 1. Wet Bulb Temperature Flow

**Calculation Chain:**
1. `calculateStage1(mode)` called (lines 574-595)
2. → `calculateWetBulbTemperature(stateObj)` (line 584)
3. → `calculateAtmosphericValues(stateObj, mode)` (line 587) - uses wetBulbTemperature
4. → `calculateHumidityRatios(stateObj)` (line 590)
5. → `calculateLatentLoadFactor(stateObj)` (line 593)

**Key Point:** `wetBulbTemperature` is stored in `stateObj` (TargetState or ReferenceState), NOT in StateManager.

### 2. Climate Data Listeners

**Cooling.js lines 1013-1061** - Listeners are properly configured:
- `l_20` (Target night-time temp) → recalculates Stage 1 for BOTH modes ✅
- `ref_l_20` (Reference night-time temp) → recalculates Stage 1 for BOTH modes ✅
- `l_21` (Target cooling season RH%) → recalculates Stage 1 for BOTH modes ✅
- `ref_l_21` (Reference cooling season RH%) → recalculates Stage 1 for BOTH modes ✅

**No listener issues detected.**

### 3. Section 13 Convergence Loop

**Section13.js lines 69-78** - Critical fields that trigger recalculation in Target mode:
```javascript
const criticalFields = [
  "d_113",   // ✅ Heating System
  "d_116",   // ✅ Cooling System
  "f_113",   // HSPF
  "d_118",   // HRV/ERV SRE %
  "g_118",   // Ventilation Method
  "d_119",   // Rate Per Person
  "j_115",   // AFUE
  "l_118",   // ACH
];
```

**Missing from critical fields:**
- `j_116` (Cooling COP) - NOT in the list
- Climate fields (`l_20`, `l_21`) - NOT in the list (handled by Cooling.js listeners instead)

### 4. Dependency Tracking

From Logs.md ZenMaster analysis:
- **i_122** has dependency: `cooling_latentLoadFactor` (🔍 CHECK-SRC - not found in FieldManager)
- **h_124** has dependency: `cooling_freeCoolingLimit` (🔍 CHECK-SRC - not found in FieldManager)
- **m_124** has dependency: `cooling_daysActiveCooling` (🔍 CHECK-SRC - not found in FieldManager)

**These are internal Cooling.js calculated values that don't exist in StateManager!**

## Hypothesis: Missing Convergence Trigger

### Theory A: j_116 Missing from criticalFields

When h_15 changes:
1. Cooling calculations run → update m_129 (cooling demand)
2. m_129 changes → affects d_117 (cooling load)
3. d_117 changes → affects j_116 calculation (in Heatpump mode)
4. **BUT:** j_116 is NOT in criticalFields → doesn't trigger recalculation
5. Result: Incomplete convergence ❌

**Test:** Add `j_116` to criticalFields array and see if convergence improves.

**✅ IMPLEMENTED:** Added j_116 to criticalFields in Section13.js (see line 218 below)

### Theory B: Wet Bulb Change Affects Convergence Speed

The simple formula produces different wet bulb temperatures than the averaged formula.
- Averaged formula: More conservative (middle ground between two methods)
- Simple formula: Could be higher or lower depending on RH

**Possibility:** The new wet bulb values require an extra iteration to converge, but the convergence loop only runs once per user input change.

### Theory C: Internal State Not Propagating

`wetBulbTemperature` is stored in internal state objects (TargetState/ReferenceState in Cooling.js), not in StateManager.

**Flow:**
1. h_15 changes → calculations run
2. Cooling.js updates internal `stateObj.wetBulbTemperature`
3. Section 13 calculations run → use old wetBulbTemperature?
4. Second pass needed to sync

**Question:** Does Section 13's `calculateAll()` call Cooling.js calculations in the right order?

## Recommended Investigation Steps

### Step 1: Add Debug Logging
Add console.log to track wet bulb temperature changes:

```javascript
// In Cooling.js calculateWetBulbTemperature() after line 507:
console.log(`[Cooling] Wet bulb calc (${mode}): tdb=${tdb}, rh=${rh}, twb=${stateObj.wetBulbTemperature}`);
```

### Step 2: Check Calculation Order
Verify that when h_15 changes, calculations run in this order:
1. Cooling.js Stage 1 (wet bulb, atmospheric, humidity, latent load)
2. Cooling.js Stage 2 (free cooling capacity)
3. Cooling.js Stage 3 (mechanical cooling demand - uses h_15)
4. Section 13 calculations (heating/cooling loads)

### Step 3: Test j_116 in criticalFields
Add `j_116` to the criticalFields array (line 69-78) and test if convergence improves.

### Step 4: Compare Target vs Reference Behavior
**Why does Reference mode work with just d_116 toggle?**
- Check if ReferenceState handles wetBulbTemperature differently
- Look for differences in calculation flow between Target and Reference

## Questions for User

1. **Did this convergence issue exist BEFORE the wet bulb formula change?**
   - If NO → wet bulb change is likely the cause
   - If YES → might be pre-existing issue, wet bulb change just made it more noticeable

2. **What exactly doesn't converge?**
   - Is it m_129 (cooling demand)?
   - Is it d_117 (cooling load)?
   - Is it the final h_10 TEUI?
   - Can you provide before/after values?

3. **How many toggles are needed now vs before?**
   - Before: d_116 toggle only
   - After: d_116 AND d_113 toggle
   - Does order matter?

## Test Case from User (Nov 14, 2025)

**Baseline:** h_10 = 93.7 after initialization ✅

**Issue Flow:**
1. Add 1,000m² to h_15 → h_10 changes (expected)
2. Remove 1,000m² from h_15 → h_10 = **98.8** ❌ (should be 93.7)
3. Toggle d_116 OFF (No Cooling) → h_10 = **90.9** ✅ (correct)
4. Toggle d_116 ON (Cooling) → h_10 = **90.9** ❌ (stuck, should recalculate)
5. Toggle d_113 to different fuel, then back to Heatpump → h_10 = **93.7** ✅ (correct!)

**Key Insight:** Step 4 shows that toggling d_116 back ON does NOT trigger cooling calculations to flow through the chain. This suggests j_116 is not in the convergence loop.

**Comparison with Remote Main (Before j_116 fixes):**
- Remote main (before COPc fixes): Only needs d_116 toggle to correct ✅
- Current branch (after wet bulb fix): Needs d_116 AND d_113 toggle ❌

**Conclusion:** The wet bulb formula change exposed a missing convergence trigger for j_116.

## Solution Implemented

**Branch:** NOV14-COOLFIX
**File:** `src/sections/Section13.js`
**Change:** Added `j_116` to criticalFields array (line 73)

**Before:**
```javascript
const criticalFields = [
  "d_113",
  "d_116",
  "f_113",
  "d_118",
  "g_118",
  "d_119",
  "j_115",
  "l_118",
];
```

**After:**
```javascript
const criticalFields = [
  "d_113",
  "d_116",
  "f_113",
  "j_116",  // ✅ NOV14-COOLFIX: Added for cooling calculation convergence
  "d_118",
  "g_118",
  "d_119",
  "j_115",
  "l_118",
];
```

**Expected Result:** When j_116 changes (either from user input or calculation), it will trigger `calculateAll()` to run a second convergence pass, ensuring all cooling calculations propagate through the chain.

## Root Cause Found! (Nov 14, 2025)

**The Real Issue:** Section 15 was missing d_116 listeners!

### Investigation Trail:
1. User reported: "Calculations get stuck at S04 which feeds S01"
2. Checked S04 listeners → All properly configured ✅
3. Checked S15 (feeds d_136 to S04) → **d_116/ref_d_116 NOT in listener list!** ❌

### The Broken Flow:
```
d_116 changes → S15 doesn't recalculate → d_136 stays stale → S04 listener doesn't fire → h_10 stuck
```

### Why S15 Needs d_116:
Section15.js lines 1793-1800 shows:
```javascript
const coolingType_d116 = sm.getValue("d_116");
let d117_effective = d117_actual_val;
if (coolingType_d116 === "No Cooling") {
  d117_effective = 0; // Zero out cooling load
}
// d_136 calculation uses d117_effective
```

**Without d_116 listener:** When user toggles d_116 back to "Cooling", S15 never recalculates, so d117_effective stays at 0, making d_136 wrong.

## Final Solution Implemented

**Branch:** NOV14-COOLFIX

**Fix 1: Section13.js (line 73)**
- Added `j_116` to criticalFields array
- Ensures cooling efficiency changes trigger convergence

**Fix 2: Section15.js (lines 2194-2195)**
- Added `d_116` and `ref_d_116` to dependencies array
- **This was the critical missing piece!**

### Complete Fix Chain:
```
d_116 changes
  → S15 listener fires
  → S15 recalculates d_136 (using correct d117_effective)
  → S04 listener fires (d_136 dependency)
  → S04 recalculates h_10
  → TEUI updates correctly ✅
```

## Testing Results (Nov 14, 2025)

**✅ SUCCESS: d_116 toggle workaround restored**
- User confirmed: Toggling d_116 (Cooling on/off) now correctly triggers recalculation
- This was the primary goal - maintain existing workaround functionality

**❌ LIMITATION: Broader convergence issues remain**
- Changes to h_15 (area), d_63 (occupants), g_63 (activity), d_64 (hours) still require "Cooling bump"
- This is a **fundamental architectural limitation** of the listener-based system, not a bug

## Why the "Cooling Bump" Workaround is Still Needed

### The Circular Dependency Problem

Listener-based systems can't handle multi-level convergence:

```
d_63 (occupants) changes
  → S09 recalculates gains
  → S13 reads new gains, recalculates m_129 (cooling demand)
  → Cooling.js reads m_129, recalculates cooling values
  → S13 reads cooling values, recalculates AGAIN (2nd order effect)
  → This might trigger MORE changes (3rd order effect)
  → ... convergence requires multiple passes
```

**The Issue:** Listeners execute in **arbitrary order** and only run **once per value change**. There's no automatic multi-pass convergence loop.

**The "Cooling Bump":** Manually forces a second calculation pass by toggling d_116

### Fields That Need the Workaround

Changes to these fields affect cooling calculations with 2nd/3rd order effects:
- **h_15** - Conditioned area (affects all per-area calculations)
- **d_63** - Number of occupants (affects internal gains)
- **g_63** - Activity level (affects metabolic gains)
- **d_64** - Hours occupied (affects gain duration)
- **l_20/l_21** - Climate data (affects psychrometric calculations)

### Why Adding More Listeners Won't Fix It

Adding listeners makes sections **aware** of changes, but doesn't solve **execution order** or **multi-pass convergence**.

Example failure:
1. d_63 changes → S13 listener fires → calculates m_129 = X
2. m_129 changes → Cooling.js listener fires → calculates cooling values
3. Cooling values change → S13 listener fires AGAIN → m_129 = Y (different!)
4. **Problem:** Step 3's m_129 change should trigger Cooling.js again, but listener already ran

## The Proper Solution (Future Work)

**Directed Acyclic Graph (DAG) + Topological Sort:**
1. Build dependency graph of ALL calculations
2. Sort topologically to find correct execution order
3. Execute calculations in sorted order
4. Detect cycles that need iterative convergence
5. Run convergence loop until values stabilize (or max iterations)

This is a **major architectural refactor** - planned but not feasible for current release.

### Implementation Plan Already Exists

**See**: [SEPT15-RACE-MITIGATION.md](SEPT15-RACE-MITIGATION.md) for complete implementation strategy:
- **Lines 1186-1300**: CTO-approved DAG approach (classic compiler pattern)
- **Lines 313-424**: Phase 1-4 migration roadmap
- **Lines 584-677**: Orchestrator.js skeleton code
- **Lines 1287-1300**: Existing Dependency.js infrastructure ready to use

**Prerequisites in Progress**:
- ✅ **Dependency mapping**: [Zen-Observations.md](Zen-Observations.md) - S01-S08 complete (1,544 links traced)
- 🔄 **S09-S15 mapping**: Pending (Zen-Observations lines 802-843)
- ✅ **Cooling.js labels**: COMPLETE (this branch) - resolves ZenMaster CHECK-SRC warnings

## Current Status

**What Works:**
- ✅ d_116 toggle workaround restored
- ✅ Section-to-section listeners properly configured
- ✅ Cooling.js values properly labeled and published
- ✅ Most single-order dependencies work automatically

**Known Limitations:**
- ⚠️ Multi-order effects require manual "Cooling bump"
- ⚠️ No automatic convergence detection
- ⚠️ Execution order not guaranteed

**Recommendation:**
- Document the "Cooling bump" workaround for users
- Plan DAG/topological sort refactor for next major version
- Current system is **good enough** for release with documented workarounds

**Status:** ✅ COMPLETE - Workaround restored, limitations documented
