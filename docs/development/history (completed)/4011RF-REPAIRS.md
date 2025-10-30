# TEUI Calculator Section Debugging Workplan - August 10 2025

This document serves as a working log and guidance for systematic section-by-section repairs to achieve full dual-state compliance.

---

## 🎯 **CURRENT SYSTEMATIC DEBUGGING WORKPLAN**

### **Issue Summary**:

After fixing S02 and S01 state isolation, we've identified **multiple interconnected calculation chain bugs**:

1. **S11** ✅ Updates properly when `d_13` reference standard changes
2. **S12** ❌ U-values (`g_101`, `g_102`) remain stale despite S11 updates
3. **S13** ❌ Doesn't calculate until manual intervention (e.g., `d_113` fuel change)
4. **S01** ❌ `e_10` doesn't update until manual calculation trigger

### **Root Cause**:

**Systematic dual-state pattern violations** across S10-S13 preventing proper calculation cascade from S02 → S11 → S12 → S13 → S01.

---

## 📋 **SYSTEMATIC REPAIR STRATEGY**

### **Phase 1: Section-by-Section DUAL-STATE-CHEATSHEET Audit**

**Audit each section (S10, S11, S12, S13) against all checklist phases:**

✅ **Phase 1**: Dual-engine calculations (`calculateTargetModel()` + `calculateReferenceModel()`)  
✅ **Phase 2**: Reference results storage with `ref_` prefixes in `storeReferenceResults()`  
✅ **Phase 3**: DOM updates via `updateCalculatedDisplayValues()` after every `calculateAll()`  
✅ **Phase 4**: Sovereign state reading (eliminate Pattern B contamination)  
✅ **Phase 5**: Remove duplicate defaults anti-pattern  
✅ **Phase 6**: Mode display isolation in `updateCalculatedDisplayValues()`

### **Phase 2: Priority Section Repairs**

#### **🔥 IMMEDIATE PRIORITY: S12 Repair**

**Problem**: S12 U-values don't update despite S11 providing updated values
**Hypothesis**: S12 has fundamental dual-state violations preventing response to upstream changes

**Investigation Plan**:

1. Audit S12's listener setup for S11 outputs
2. Check S12's calculation functions for Pattern B contamination
3. Verify S12's `updateCalculatedDisplayValues()` functionality
4. Test calculation cascade: S11 outputs → S12 inputs → S12 calculations → S12 DOM

#### **🔧 ARCHITECTURAL CONSIDERATION: S11/S12 Unification**

**Background**: Earlier analysis suggested merging S12 calculations into S11 for architectural simplicity

**Current Evidence Supporting Unification**:

- **Robot Fingers TB slider** requires immediate S12 DOM updates for UX
- **Cross-section dependency complexity** makes dual-state compliance difficult
- **S11 already working correctly** with dual-state patterns

**Unification Benefits**:

- **Eliminates cross-section race conditions**
- **Simplifies TB slider → U-value DOM updates** within single section
- **Reduces calculation chain complexity** (S11 → S12 becomes internal to S11)
- **Architecturally cleaner** than complex inter-section listeners

**Decision Point**: If S12 audit reveals extensive violations, consider S11/S12 unification over complex repairs

### **Phase 3: Sequential Section Repairs**

**Order**: S12 → S13 → S10 (based on calculation dependency chain)

1. **S12**: Fix U-value calculation and DOM update issues
2. **S13**: Ensure proper listener setup for S12 outputs, verify heating calculations
3. **S10**: Audit for any remaining dual-state violations

### ✅ Implemented Improvements (Aug 10, late PM)

- **S12 TB% Selection (d_97) Mode-Aware**: In `calculateCombinedUValue(isReferenceCalculation)`, TB% now comes from S11 state matching the calculation pass (ReferenceState for ref pass, TargetState for target pass). Prevents cross-hemisphere TB% contamination.
- **S12 Reference Listeners Added**: Attached listeners for `ref_g_85..95`, `ref_f_85..95`, and `ref_d_97` to ensure S12 recalculates on Reference-only changes from S11 without requiring UI toggles.
- **S12 U-agg Debug Log**: Added compact per-pass trace: `[S12] U-agg REF/TGT: TB%=X → g_101=…, g_102=…` to verify correctness in logs.
- **Change-Detection on Writes (S12)**: `setCalculatedValue` now stores values at full precision (per README) and uses an epsilon guard (1e-9) to write only on material change. Reduces redundant cascades without altering stored precision.

### 🔧 Planned Refinements (next test cycle)

- **Epsilon Threshold Review**: Validate 1e-9 materiality guard vs Excel parity; tune if logs show micro-churn. Display precision remains via global formatters, not storage.
- **S12 Toggle Must Be Display-Only**: Current `ModeManager.switchMode()` in S12 still calls `calculateAll()`, which explains why toggling S12 “releases” the cascade. Planned fix: remove `calculateAll()` from the toggle; keep `refreshUI()` and `updateCalculatedDisplayValues()` only.
- **S11 → S12 Reference Propagation**: Ensure S11 writes Reference-side updates to StateManager (e.g., `ref_d_97` for TB% and relevant `ref_g_xx/ref_f_xx`) when editing in S11 Reference mode so S12’s existing ref\_ listeners trigger automatically (no UI toggle required).
- **Stopgap (if needed)**: If ref* events aren’t fully wired, pragmatically call `TEUI.SectionModules.sect12.calculateAll()` at the end of S11 TB% save. This is a documented exception until ref* propagation is reliable.
- **Test Protocol**: In Reference mode, change S11 TB%; expect S12 `ref_g_101/ref_g_102` and S01 `e_10` to update without toggling S12. In Target mode, expect only target values to change and Reference to persist.
- **Downstream Churn Reduction**: Apply similar store-if-changed guards to S14/S15 totals to cut repeated identical recomputes visible in logs.
- **Optional Architecture Step**: Emit aggregate U-values (target/ref) from S11 to StateManager or unify U-aggregation into S11 to remove robot-fingers latency, if needed after the above.

### **Phase 4: End-to-End Validation**

**Test full calculation cascade**: S02 `d_13` change → S11 → S12 → S13 → S01 `e_10` update
**Success criteria**: No manual intervention required for calculation flow

---

## 🔍 **STARTING POINT: S12 INVESTIGATION**

### **S12 Audit Checklist**:

**🚨 CRITICAL EVIDENCE FROM LOGS.MD ANALYSIS**:
**ROOT CAUSE CONFIRMED**: S12 is the calculation cascade bottleneck. Logs show:

- ✅ **d_113 fuel changes**: S13 → S04 → S01 cascade works (lines 7101-7119)
- ❌ **dd_d_13 standard changes**: S11 updates, but S12 U-values (`g_101`, `g_102`) stay stale
- ❌ **No S11→S12 listener response**: S12 doesn't trigger when S11 assembly values change
- **Result**: Flow stops at S12, preventing S13/S01 updates until manual intervention

**1. Listener Setup Audit** (🔥 **PRIORITY #1**):

- [ ] **CRITICAL**: Check if S12 listens to S11's output fields (RSI values, assembly data)
  - **Look for**: S11 outputs like wall/roof/foundation RSI, assembly thermal properties
  - **Expected**: S12 should have `StateManager.addListener()` calls for S11 results
- [ ] Verify listener callbacks trigger `calculateAll()` properly
- [ ] Confirm listeners are attached during initialization
- [ ] **Test**: Change `dd_d_13` in S02 → verify S12 `calculateAll()` triggers automatically

**2. Cross-Section Dependency Audit** (🔥 **PRIORITY #2**):

- [ ] **CRITICAL**: Identify exactly which S11 outputs S12 needs for U-value calculations
  - **Look for**: How `g_101`, `g_102` U-values are calculated from S11 data
  - **Check**: S12 calculation functions read from S11 stored results (`ref_` prefixed)
- [ ] Verify S12 `storeReferenceResults()` includes U-values with `ref_` prefixes for S13
- [ ] **Test**: Manual S11 value change → S12 should recalculate → S13 should receive updates

**3. Calculation Function Audit**:

- [ ] Check for Pattern B contamination (`getGlobalNumericValue()` vs sovereign state)
- [ ] Verify dual-engine structure (`calculateTargetModel()` + `calculateReferenceModel()`)
- [ ] **COMPARE**: S12 vs working S13 pattern (S13 responds to upstream changes correctly)

**4. DOM Update Audit**:

- [ ] Verify `updateCalculatedDisplayValues()` exists and functions correctly
- [ ] Check that `calculateAll()` calls are followed by DOM updates
- [ ] Test mode switching displays correct values
- [ ] **Specific**: Verify `g_101`, `g_102` DOM elements update when S11 changes

**5. State Isolation Audit**:

- [ ] Verify Target calculations read from `TargetState`
- [ ] Verify Reference calculations read from `ReferenceState`
- [ ] Check for any hardcoded defaults not in field definitions

**🎯 DEBUGGING STRATEGY**:

1. **Start with Listener Setup** - this is the most likely culprit based on logs
2. **If listeners missing/broken** → Quick fix: Add proper S11 output listeners
3. **If listeners exist but don't work** → Consider S11/S12 unification approach
4. **Test cascade**: S02 `dd_d_13` change → S11 → S12 → S13 → S01 without manual intervention

### **S12 vs S11/S12 Unification Decision Matrix**:

| **Repair S12 Separately**          | **Unify S12 into S11**                      |
| ---------------------------------- | ------------------------------------------- |
| ✅ Preserves current architecture  | ✅ Eliminates cross-section race conditions |
| ✅ Isolated section responsibility | ✅ Simplifies TB slider → DOM updates       |
| ❌ Complex inter-section listeners | ✅ Reduces calculation chain complexity     |
| ❌ Race condition potential        | ✅ Builds on S11's working patterns         |
| ❌ TB slider UX complications      | ✅ Architecturally cleaner                  |

**Recommendation**: Start with S12 audit. If extensive violations found, proceed with S11/S12 unification.

---

## 📖 **COMPLETED REPAIRS ARCHIVE**

---

## ✅ **S01 TEUI Denominator Fix - COMPLETED**

### **Problem**:

S01's `updateTEUIDisplay` function incorrectly used the same `area` variable (from global `h_15`) as the denominator for calculating **both** Target TEUI and Reference TEUI. This caused Reference calculations to be contaminated by Target area changes.

### **Solution Implemented**:

**Fixed the Reference calculations to use proper state isolation:**

```javascript
// ❌ BEFORE (State contamination):
const area = getGlobalNumericValue("h_15") || 1427.2;
const e_10 = area > 0 ? Math.round((refEnergy / area) * 10) / 10 : 0; // Wrong!

// ✅ AFTER (Proper state isolation):
const targetArea = getGlobalNumericValue("h_15") || 1427.2;
const referenceArea = getGlobalNumericValue("ref_h_15") || targetArea;
const e_10 =
  referenceArea > 0 ? Math.round((refEnergy / referenceArea) * 10) / 10 : 0; // Correct!
```

### **Specific Changes Made**:

1. **Separate Target and Reference areas**: `targetArea` vs `referenceArea`
2. **Updated Reference Column E calculations**: All use `referenceArea` and `refServiceLife`
   - `e_10 = ref_j_32 / ref_h_15` (Reference TEUI)
   - `e_8 = ref_k_32 / ref_h_15` (Reference Annual Carbon)
   - `e_6 = ref_i_39 / ref_h_13 + e_8` (Reference Lifetime Carbon)
3. **Updated Target Column H calculations**: All use `targetArea`
4. **Updated Actual Column K calculations**: All use `targetArea` (shares Target building parameters)
5. **Added missing listeners**: `ref_h_15` and `ref_h_13` for Reference building changes
6. **Fixed gauge and warning functions**: Use correct area variables

### **Result**:

S01 Reference column (`e_10`, `e_8`, `e_6`) now correctly uses Reference building parameters and will NOT be contaminated when Target area (`h_15`) changes.

---

## ✅ **S02 Area Slider State-Mixing Fix - COMPLETED**

### **Problem**:

The S02 conditioned area slider (`h_15`) was not fully mode-aware. The slider's event handlers read the original area value from the global `StateManager` instead of the current mode's state, causing incorrect calculations in Reference mode.

### **Solution Implemented**:

**Made slider functions fully mode-aware:**

```javascript
// ❌ BEFORE (Pattern B contamination):
const originalAreaStr = window.TEUI.StateManager?.getValue("h_15");

// ✅ AFTER (Mode-aware):
const originalAreaStr = ModeManager.getValue("h_15");
```

### **Specific Changes Made**:

1. **Fixed `handleAreaSliderInput()`**: Now reads from `ModeManager.getValue("h_15")` instead of global StateManager
2. **Fixed `handleAreaSliderChange()`**: Uses mode-aware state reading for fallback values
3. **Added default area values**: Both `TargetState` and `ReferenceState` now have `h_15: "1427.20"` defaults
4. **Preserved existing mode-aware saving**: `ModeManager.setValue()` was already correct

### **Result**:

S02 area slider now properly maintains separate Target and Reference area values. When switching between modes, each state retains its own area value without contamination.

---

## 🎯 **Testing Validation**

These fixes should resolve the specific issues identified in the original testing:

1. **Target Mode occupancy changes** → Should no longer affect Reference TEUI calculations
2. **Mode switching** → Area values should remain isolated between Target and Reference states
3. **Reference Standard changes** → Should now properly trigger recalculations in S01 using correct Reference areas

Both S01 and S02 now fully comply with dual-state architecture and maintain proper state isolation.

---

## 🚨 **NEXT PHASE: Service Life & Reporting Year State Mixing**

### **Problem Identified**:

Despite the area fixes above, S01's Reference Column E values still update when changes are made to S02's **Target mode** reporting year (`h_12`) and service life (`h_13`) sliders. This indicates **continued state contamination** in the calculation chain.

### **Root Cause Analysis**:

Based on code investigation, the issue stems from **critical dependencies between emissions factors and building parameters**:

**🔍 KEY INSIGHT**: S04 emissions factors depend on **both province (S03 `d_19`) AND reporting year (S02 `h_12`)** via Excel XLOOKUP logic. This creates a complex calculation chain:

```
S02 (h_12 reporting year) + S03 (d_19 province) → S04 (emissions factors) → S13/S07 (heating/cooling) → S15 (totals) → S01 (TEUI display)
```

**Contamination Vectors Identified**:

1. **S02 State Writing**: `storeReferenceResults()` includes `h_12` ✅ BUT missing `h_13` (service life)
2. **S04 Emissions Calculation**: Has proper mode-aware `getElectricityEmissionFactor()` ✅
3. **S04 Listeners**: Has `ref_h_12` listener ✅ BUT may not trigger on S02 Reference slider changes
4. **S13 Emissions Reading**: Uses NON-mode-aware `getGlobalNumericValue("l_30")` ❌ (state contamination!)
5. **S01 Service Life**: May still read Target `h_13` instead of Reference `ref_h_13` for lifetime calculations

### **Investigation Strategy**:

#### **Phase 1: Verify S02 State Storage & Triggering**

**Objective**: Confirm S02 properly stores AND triggers downstream updates

**Critical Issue Found**: `storeReferenceResults()` includes `h_12` but missing `h_13`

**Check Points**:

1. **Add Missing Service Life**: Add `h_13` to `storeReferenceResults()` function
2. **Verify Trigger Chain**: Confirm Reference slider changes trigger `storeReferenceResults()`
3. **Test State Storage**: Verify `ref_h_12` and `ref_h_13` appear in StateManager on Reference changes

#### **Phase 2: Fix S04→S13→S07 Emissions Factor Chain**

**Objective**: Ensure emissions factors maintain Target/Reference isolation

**Critical Issue Found**: S13 and S07 read emissions factors without mode awareness

**Check Points**:

1. **S13 Space Heating Emissions (lines 2502-2503)**:

   ```javascript
   // ❌ CURRENT - NOT mode-aware:
   const oilEmissionsFactor = getGlobalNumericValue("l_30") || 2753;
   const gasEmissionsFactor = getGlobalNumericValue("l_28") || 1921;

   // ✅ SHOULD BE - Mode-aware:
   const oilEmissionsFactor = isReferenceCalculation
     ? getGlobalNumericValue("ref_l_30") ||
       getGlobalNumericValue("l_30") ||
       2753
     : getGlobalNumericValue("l_30") || 2753;
   ```

2. **S07 DHW Emissions**: Already has mode-aware emissions reading ✅

3. **S04 Listener Chain**: Verify `ref_h_12` changes trigger emissions recalculation → S13 → S15 → S01

#### **Phase 3: Audit S01 Service Life Dependencies**

**Objective**: Ensure S01 uses Reference service life for Reference calculations

**Check Points**:

1. **Service Life Reading**: Verify S01 uses `ref_h_13` for Reference lifetime calculations
2. **Listener Setup**: Confirm S01 listens to `ref_h_13` changes (already added ✅)
3. **Calculation Chain**: Verify Reference service life affects Reference Column E properly

### **Repair Implementation Plan**:

#### **Step 1: Fix S02 State Storage**

**Priority: HIGH** - Missing service life in Reference state storage

```javascript
// Add h_13 to storeReferenceResults() function (line 788):
const referenceResults = {
  h_12: ReferenceState.getValue("h_12"), // ✅ Already present
  h_13: ReferenceState.getValue("h_13"), // ❌ MISSING - ADD THIS
  d_13: ReferenceState.getValue("d_13"),
  // ... rest unchanged
};
```

#### **Step 2: Fix S13 Emissions Factor Reading**

**Priority: CRITICAL** - Direct state contamination in heating calculations

```javascript
// Fix calculateSpaceHeatingEmissions() in S13 (lines 2502-2503):
// ❌ CURRENT - contaminated:
const oilEmissionsFactor = getGlobalNumericValue("l_30") || 2753;
const gasEmissionsFactor = getGlobalNumericValue("l_28") || 1921;

// ✅ FIXED - mode-aware (like S07 pattern):
const oilEmissionsFactor = isReferenceCalculation
  ? getGlobalNumericValue("ref_l_30") || getGlobalNumericValue("l_30") || 2753
  : getGlobalNumericValue("l_30") || 2753;
const gasEmissionsFactor = isReferenceCalculation
  ? getGlobalNumericValue("ref_l_28") || getGlobalNumericValue("l_28") || 1921
  : getGlobalNumericValue("l_28") || 1921;
```

#### **Step 3: Verify S04 Listener Triggering**

**Priority: MEDIUM** - Ensure Reference changes propagate correctly

- Test that S02 Reference slider changes trigger S04's `ref_h_12` listener
- Verify S04 `calculateReferenceModel()` updates emissions factors
- Confirm cascade: S04 → S13 → S15 → S01 for Reference calculations

#### **Step 4: Audit S01 Service Life Usage**

**Priority: LOW** - Verify no remaining Target contamination

- Check if S01 Reference calculations use `ref_h_13` correctly (likely already fixed)
- Verify service life affects Reference lifetime carbon calculations properly

### **Testing Protocol**:

1. **Baseline Test**: Record current Reference Column E values in S01
2. **Target Mode Change**: Switch S02 to Target mode, change reporting year and service life
3. **Verification**: Confirm Reference Column E values in S01 remain unchanged
4. **Reference Mode Test**: Switch S02 to Reference mode, change parameters
5. **Validation**: Confirm Reference Column E values update appropriately

### **Success Criteria**:

- ✅ Target mode parameter changes do NOT affect Reference calculations
- ✅ Reference mode parameter changes DO affect Reference calculations appropriately
- ✅ Complete state isolation between Target and Reference building parameters
- ✅ All downstream sections respect Reference parameter independence
