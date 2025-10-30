# S02 MAJOR OCCUPANCY (d_12) CONTAMINATION REPAIR PLAN

## 🚨 PROBLEM STATEMENT

When changing `d_12` (Major Occupancy) in **Reference mode** from "A-Assembly" to "B3-Detention Care & Treatment":

- **Expected**: Only `e_10` (Reference TEUI) should change
- **Actual**: Both `e_10` AND `h_10` (Target TEUI) change, indicating state mixing contamination

## 🔍 CRITICAL FINDINGS (December 2024)

### ✅ FIXES COMPLETED:

1. **S02 Dropdown Events**: Fixed event delegation - dropdown changes now fire correctly
2. **S04 Mode Isolation**: Added `calculateTargetModel()` mode isolation (matches S02/S03 pattern)
3. **S15 Mode Isolation**: Added `calculateTargetModel()` mode isolation (matches S02/S03 pattern)
4. **Contamination Source Identified**: Target energy `j_32` still contaminated despite fixes

### 🚨 CONTAMINATION EVIDENCE (Final Test):

- **Line 4839**: `d_12 dropdown change: B3-Detention Care & Treatment, mode=reference` ✅
- **Line 4844**: `J32: 179526.53828704086` ❌ **Target energy contaminated**
- **Line 4942**: `UPDATING h_10: 125.8 (from j_32=179526.53828704086)` ❌ **S01 uses contaminated value**
- **Expected**: `j_32` should remain at baseline (~133574), not increase to 179526

### 🎯 ROOT CAUSE STATUS:

**Target energy `j_32` contamination persists** despite S04/S15 mode isolation fixes. The contamination is **deeper in the dependency chain** than initially diagnosed.

## 📊 EVIDENCE FROM LOGS (Line 5269-5371)

### ✅ What's Working:

1. **Dropdown events fire correctly**: Line 5269 shows Reference mode change detected
2. **ref_d_12 published correctly**: Line 5366 shows `ref_d_12=B3-Detention Care & Treatment` stored
3. **Reference calculations flow correctly**: Line 5276 shows `ref_j_32` updated from `229301` to `298063`
4. **S09 Reference listeners trigger**: Lines 5293-5312 show proper Reference dependency chain

### 🚨 What's Broken:

1. **StateManager vs Display disconnect**: Logs show `h_10=93.0` but UI shows `h_10=125.8`
2. **Target contamination**: Reference mode change somehow affects Target TEUI display

## 🔍 ROOT CAUSE ANALYSIS

### Hypothesis 1: S01 Display Logic Issue

- S01 may be reading wrong values for `h_10` display
- Possible fallback contamination in S01's `updateTEUIDisplay` function
- S01 may be reading `ref_j_32` instead of `j_32` for Target calculations

### Hypothesis 2: Missing Target State Isolation

- S02's Reference change may be contaminating Target state somewhere
- Possible missing `ref_` prefix in state publication
- Target calculations may be reading Reference values

### Hypothesis 3: S04 Dual-Engine Contamination

- S04 may be mixing Reference and Target calculations
- Target model may be consuming Reference inputs
- S04's `j_32` (Target) vs `ref_j_32` (Reference) isolation may be broken

## 🎯 SYSTEMATIC REPAIR PLAN

### Phase 1: S01 Display Investigation

**Objective**: Verify if S01 is correctly reading Target vs Reference values

1. **Examine S01's `updateTEUIDisplay` function**:

   - Check if `h_10` calculation uses `j_32` (Target) or `ref_j_32` (Reference)
   - Look for fallback contamination patterns like `ref_j_32 || j_32`
   - Verify `e_10` calculation uses `ref_j_32` exclusively

2. **Add strategic logging to S01**:

   ```javascript
   console.log(
     `[S01DB] h_10 calculation: using j_32=${j_32}, NOT ref_j_32=${ref_j_32}`,
   );
   console.log(
     `[S01DB] e_10 calculation: using ref_j_32=${ref_j_32}, NOT j_32=${j_32}`,
   );
   ```

3. **Test isolation**:
   - Change `d_12` in Reference mode
   - Verify logs show correct value sources for each calculation

### Phase 2: S02 State Publication Audit

**Objective**: Ensure S02 publishes values with correct prefixes

1. **Audit S02's `ModeManager.setValue`**:

   - Verify Reference mode changes publish with `ref_` prefix
   - Verify Target mode changes publish without prefix
   - Check for any cross-contamination in publication logic

2. **Audit S02's `storeReferenceResults`**:
   - Verify it only stores Reference values with `ref_` prefix
   - Ensure it doesn't overwrite Target values

### Phase 3: S04 Dual-Engine Isolation Audit

**Objective**: Ensure S04 maintains strict Target/Reference separation

1. **Audit S04's calculation functions**:

   - `calculateTargetModel()` should only read unprefixed values
   - `calculateReferenceModel()` should only read `ref_` prefixed values
   - No fallback patterns between Target and Reference

2. **Audit S04's `setCalculatedValue` calls**:
   - Target calculations should call `setCalculatedValue("j_32", value)`
   - Reference calculations should call `setReferenceCalculatedValue("j_32", value)` → publishes as `ref_j_32`

### Phase 4: S09 Dependency Chain Audit

**Objective**: Ensure S09 properly isolates Target/Reference occupancy calculations

1. **Verify S09's `d_12` and `ref_d_12` listeners**:

   - `d_12` listener should only trigger Target calculations
   - `ref_d_12` listener should only trigger Reference calculations
   - No cross-contamination between the two

2. **Audit S09's calculation functions**:
   - Target calculations should read `d_12` (unprefixed)
   - Reference calculations should read `ref_d_12` (prefixed)

## 🧪 TESTING PROTOCOL

### Before Fix:

1. Record baseline: `e_10` and `h_10` values in both modes
2. Switch to Reference mode
3. Change `d_12` from "A-Assembly" to "B3-Detention Care & Treatment"
4. Document: Which values change (should be `e_10` only)

### After Each Phase:

1. Repeat the same test
2. Verify logs show correct value sources
3. Confirm UI matches StateManager values
4. Document any remaining contamination

### Success Criteria:

- ✅ Reference mode `d_12` change affects only `e_10`
- ✅ Target mode `d_12` change affects only `h_10`
- ✅ StateManager values match UI display
- ✅ No fallback contamination patterns in logs

## 🎯 PRIORITY ORDER

1. **Phase 1 (S01)**: Most likely source of display disconnect
2. **Phase 3 (S04)**: Critical calculation hub - highest impact
3. **Phase 2 (S02)**: Source of the change - verify publication logic
4. **Phase 4 (S09)**: Downstream consumer - verify dependency isolation

## 📝 IMPLEMENTATION NOTES

- **One phase at a time**: Complete and test each phase before proceeding
- **Minimal logging**: Add only essential debugging, remove after fix
- **No architectural changes**: Focus on fixing contamination, not redesigning
- **Preserve working calculations**: Don't modify Excel-compliant formulas
- **StateManager consistency**: Ensure all values flow through proper channels

## 🚨 CRITICAL QUESTIONS TO ANSWER

1. **What does S01 actually read** for `h_10` and `e_10` calculations?
2. **Is S04 correctly isolating** Target (`j_32`) vs Reference (`ref_j_32`) calculations?
3. **Why do logs show `h_10=93.0`** but UI shows `h_10=125.8`?
4. **Is there a timing issue** between StateManager updates and DOM updates?

This plan focuses on **systematic investigation** rather than random fixes, targeting the most likely contamination sources based on the evidence.

## 🧹 CLEANUP REQUIRED WHEN FIXED

**CRITICAL**: Remove ALL debugging logging when contamination is resolved:

### S02 Logging to Remove:

- `🔍 [S02DB] d_12 dropdown change` logging in `handleMajorOccupancyChange()`
- `🔍 [S02DB] d_12 setValue` logging in `ModeManager.setValue()`
- `🔍 [S02DB] Target/Reference d_12 published` logging
- `🔍 [S02DB] storeReferenceResults` logging
- `🔍 [S02DB] Delegated event listener` setup logging

### S01 Logging to Remove:

- `🔍 [S01DB] UPDATING h_10` logging in `updateTEUIDisplay()`
- `🔍 [S01DB] updateTEUIDisplay START` logging
- `🔍 [S01DB] upstream snapshot` logging

### S09 Logging to Remove:

- S02 Reference occupancy listener logging (cleaned already)

**Restore clean, production-ready console output once contamination is eliminated.**

## 📋 NEXT SESSION PRIORITIES

1. **Deep audit S04/S15 calculation chains** - mode isolation fixes didn't eliminate contamination
2. **Investigate shared calculation functions** - may be reading wrong state despite mode setting
3. **Check for timing issues** - Reference calculations may be affecting Target calculations through shared resources
4. **Consider dependency graph analysis** - contamination may be through indirect dependency paths
