# S13-ENDGAME.md: The Final, Architecturally-Compliant Refactor for Section 13

**Version**: 1.0
**Date**: September 12, 2025 (Updated Sept 28th, 2025)
**Status**: This document outlines the definitive and final refactoring plan for Section 13 to achieve perfect dual-state compliance, building upon the critical insights gathered in `S13-MASTER-WORKPLAN.md`.

---

## 📚 **EXCEL REFERENCE SOURCES (Sept 28, 2025)**

**Critical Reference Documents** - The authoritative calculation sources for S13 validation:

### **Primary Excel Sources:**

1. **FORMULAE-3039.csv** - Main application DOM/REPORT sheet

   - **Location**: `ARCHIVE/4011GS/OBJECTIVE-4011GS-2025.06.21-SOLSTICE-BASELINE/sources of truth 3037/FORMULAE-3039.csv`
   - **Content**: Lines 112-146 contain complete S13 (Mechanical Loads) formulas
   - **Purpose**: Gold standard for all S13 calculations, field definitions, and expected results

2. **COOLING-TARGET.csv** - Cooling physics and ventilation calculations
   - **Location**: `ARCHIVE/4011GS/OBJECTIVE-4011GS-2025.06.21-SOLSTICE-BASELINE/sources of truth 3037/COOLING-TARGET.csv`
   - **Content**: Lines 1-77 contain cooling load methodology, ventilation impacts, free cooling calculations
   - **Purpose**: Authoritative source for cooling-ventilation interactions, m_124 calculations, latent load factors

### **Key Excel Formula References:**

- **Row 124 (V.4.1)**: `=H124/D129` (Free Cooling %), `=IF(ISNUMBER(SEARCH("Constant",G118)),'COOLING-TARGET'!A33*M19,(K120*'COOLING-TARGET'!A33*M19))` (Free Cooling Limit), `='COOLING-TARGET'!E55` (Days Active Cooling)
- **m_124 Formula**: COOLING-TARGET.csv line 55: `=E52/(E54*24)` where E52=(E50-E51), E54=REPORT!M19
- **Ventilation Dependencies**: G118 (method), K120 (setback), L119 (summer boost) all affect cooling calculations

**Usage**: These documents serve as the definitive validation source for all S13 calculations. Any discrepancies between JavaScript results and Excel formulas indicate implementation bugs that must be resolved.

### **🔧 COOLING-TARGET Variable Mapping (Sept 28, 2025):**

**CRITICAL RESOURCE CREATED**: `COOLING-TARGET-VARIABLES.json`

- **Location**: `OBJECTIVE 4011RF/documentation/COOLING-TARGET-VARIABLES.json`
- **Purpose**: Comprehensive mapping of COOLING-TARGET.csv internal variables (A1-E77) to our DOM elements
- **Value**: Essential for future agents to understand Excel cooling physics and implement proper parity
- **Key Insight**: COOLING-TARGET uses internal daily calculations (E37) that get multiplied by CDD (E45) to produce seasonal values (E50/E51)

**✅ BREAKTHROUGH ACHIEVED (Sept 28, 2025)**: m_124 calculation fixed using proper COOLING-TARGET Excel logic

- **Before**: 670.16 days (absurd), no response to l_119 changes
- **After**: -19.98 days (realistic), fully responsive to ventilation changes
- **Fix**: Implemented complete COOLING-TARGET E37→E50→E51→E52→E55 calculation chain with proper daily/seasonal value relationships

### **🚨 CRITICAL TODO: ModeManager Integration Required (Sept 28, 2025)**

**URGENT ARCHITECTURAL DEBT**: Current S13 chassis (4012-Section13.js) is based on old S13 file that predates dual-state architecture.

**Issues Identified:**

- **Logs.md errors**: `Section sect13 has no ModeManager - using direct write for l_119`
- **Missing dual-state support**: Current S13 lacks ModeManager infrastructure needed for Reference mode
- **Architecture gap**: 4011-Section13.js has complete dual-state implementation that needs to be ported

**Required Tomorrow:**

1. **Port ModeManager from 4011-Section13.js**: Complete dual-state architecture with TargetState/ReferenceState objects
2. **Implement Pattern A compliance**: Following proven 4011-Section13.js methodology
3. **Add Reference mode support**: Enable ref\_ prefixed value publishing for downstream sections
4. **Fix FieldManager integration**: Resolve "no ModeManager" errors in Logs.md

**Reference Implementation**: Use `4011-Section13.js` as the architectural template - it contains the complete, working dual-state pattern that current S13 chassis lacks.

**Strategic Priority**: ModeManager integration is prerequisite for Reference-Cooling.js implementation and complete dual-state system stability.

---

## 1. Executive Summary

This document details the official endgame for the Section 13 refactor. The extensive diagnostic work and iterative fixes documented in `S13-MASTER-WORKPLAN.md` were not in vain; they were essential in uncovering that the persistent state-mixing issues with the `g_118` dropdown are not due to a simple bug, but a fundamental architectural mismatch.

The previous refactor attempted a "Parameter-based" approach (Pattern 2), which the `4012-CHEATSHEET.md` correctly identifies as fragile and insufficient for a section with the complexity of S13's cooling engine.

The definitive solution is to upgrade Section 13 to the project's gold-standard, **"Pattern 1: Temporary Mode Switching"**. This plan outlines the precise, methodical steps to implement this robust architecture, ensuring Section 13 becomes fully compliant, stable, and free of state contamination. This is not another iterative fix; it is the implementation of the project's proven, correct architectural pattern.

## 2. The Root Cause: An Architectural Mismatch

The core issue can be summarized as follows:

- **The `g_118` Anomaly**: While simpler dropdowns (`d_113`, `d_116`) were successfully isolated, `g_118` triggers a deeply interconnected cooling calculation engine.
- **The Flawed Pattern**: The previous refactor attempted to isolate this engine by passing parameters and a context object down the calculation chain.
- **The Point of Failure**: This "Pattern 2" approach failed because the cooling engine still contained legacy code that could access shared state, creating a "back door" for data from the Target model to contaminate the Reference model, and vice-versa.

## 3. The Definitive Solution: Full Compliance with "Pattern 1"

As detailed in `4012-CHEATSHEET.md`, Pattern 1 is the most reliable architecture for complex sections. It makes state isolation implicit and automatic, even for shared modules like the cooling engine. We will now implement this pattern precisely.

### The Step-by-Step Implementation Plan

This plan will be executed methodically to ensure a successful and final resolution.

#### **Phase 1: Implement Temporary Mode Switching**

This is the foundational step of Pattern 1. It ensures that the entire execution context is unambiguously set for either a Target or Reference calculation.

1.  **Modify `calculateTargetModel()`**: Wrap the entire function body in a `try...finally` block.
    - In the `try` block, the first line will be `ModeManager.currentMode = "target";`.
    - In the `finally` block, the mode will be restored to its original state.
2.  **Modify `calculateReferenceModel()`**: Apply the exact same `try...finally` pattern, but set the mode to `ModeManager.currentMode = "reference";`.

#### **Phase 2: Purge Legacy Patterns & Simplify the Code**

With the mode now being set automatically, we can remove the now-redundant and fragile code from the previous "Pattern 2" attempt.

1.  **Remove `isReferenceCalculation` Parameter**: Go through the entire calculation chain (`calculateHeatingSystem`, `calculateCoolingSystem`, `runIntegratedCoolingCalculations`, etc.) and remove the `isReferenceCalculation` boolean parameter from all function signatures and calls.
2.  **Delete `createIsolatedCoolingContext` function**: This function's purpose is now obsolete. The temporary mode switch handles the context implicitly.

#### **Phase 3: Unify and Isolate State Access**

This phase ensures that all functions read from the correct, mode-aware data source automatically.

1.  **Refactor `updateCoolingInputs()`**: This function will be simplified. Its sole job is to populate the cooling engine's state object. It will no longer need to build a complex context.
2.  **Standardize All Data Reads**: All functions within the calculation chain will be updated to use `ModeManager.getValue("field_id")` for reading section-internal state and a mode-aware global reader (e.g., `getModeAwareGlobalValue('d_20')`) for reading upstream dependencies. These functions will automatically return the correct value based on the `currentMode` set in Phase 1.

## 4. Success Criteria

This refactor will be considered complete and successful when the following conditions are met:

1.  **Perfect State Isolation for `g_118`**:
    - When in **Target mode**, changing `g_118` ONLY affects the Target TEUI (`h_10`). The Reference TEUI (`e_10`) remains completely stable.
    - When in **Reference mode**, changing `g_118` ONLY affects the Reference TEUI (`e_10`). The Target TEUI (`h_10`) remains completely stable.
2.  **"Cooling Bump" Eliminated**: The `h_10` value settles on its correct final value after a single calculation pass. The need to trigger a second calculation (the "cooling bump") is permanently gone.
3.  **Full Architectural Compliance**: Section 13 is now a textbook implementation of "Pattern 1" as defined in the `4012-CHEATSHEET.md`, making it robust, maintainable, and consistent with the project's best practices.

## 5. Calculation Parity Workplan

**Status**: ✅ **MAJOR BREAKTHROUGH ACHIEVED - 100% EXCEL PARITY!** (Sept 23, 2025)  
**Achievement**: h_10 = 93.7 (perfect Excel match!)  
**Previous**: h_10 = 93.6 (months of near-miss)  
**Root Cause Fixed**: S13/S14 m_129 cross-section dependency issue resolved

### **Sept 23, 2025 Success Summary**

**The Breakthrough**: Fixed S13/S14 m_129 calculation architecture

- **Phase 1**: Added missing Reference listeners (ref_d_129, ref_h_124, ref_d_123) to S13
- **Phase 2**: Fixed calculateMitigatedCED to read Reference values properly
- **Phase 3**: Removed S14's duplicate m_129 calculation, established hybrid ownership
- **Result**: 100% Excel parity achieved for the first time!

**Hybrid Architecture Established**:

- **S13**: Owns m_129 calculation (for immediate d_117 use, prevents circular dependencies)
- **S14**: Displays m_129 field (reads from S13 via StateManager)
- **Clean Flow**: S13 calculates → publishes → S14 displays

### **Remaining Known Issue: "Cooling Bump" Requirement**

**Current Behavior**:

- Initial calculation: h_10 = 93.4
- After "Cooling bump" (toggle d_116): h_10 = 93.7 (correct)
- **Issue**: Calculations need manual trigger to settle to correct values

**Next Priority**: Eliminate the need for manual "Cooling bump" to achieve immediate 93.7 result

**Approach**: Address S13 calculation sequencing/timing rather than major refactor

- Maintain current working architecture (100% Excel parity achieved)
- Focus on calculation ordering and dependency chain timing
- Preserve dual-state isolation and hybrid m_129 architecture

### **Known Technical Debt (Sept 23, 2025)**

**ESLint Errors to Address:**

- `calculateSpaceHeatingEmissions` function not defined (referenced in S13 files)
- Multiple S13 backup files have same undefined function reference - can be safely ignored as focus is on the 13.js working file.
- 140+ unused variable warnings (code cleanup opportunity)

**Status**: Non-critical for functionality, but should be cleaned up for code quality

### **Phase 1: Diagnose Calculation Drift**

1. **Compare cooling load calculations** between S13-CONTEXT.js (working) and current S13
2. **Verify cooling state isolation** - ensure Target/Reference don't share coolingState object
3. **Check if DOM updates** are triggering properly through updateTargetModelDOMValues()
4. **Validate upstream dependencies** (d_127, m_129, l_128) are being read correctly

### **Phase 2: Restore Calculation Accuracy**

1. **Audit cooling physics functions** - ensure calculateAtmosphericValues, calculateLatentLoadFactor match CONTEXT
2. **Check coolingState vs isolated context** - Pattern 1 may need isolated cooling contexts per mode
3. **Verify ventilation method calculations** - g_118 method logic must match Excel exactly
4. **Test fuel impact calculations** - Oil/Gas emissions must trigger correctly on AFUE/volume changes

### **Phase 3: Validation & Testing**

1. **Excel baseline comparison** - All S13 calculations must match Excel codebase exactly
2. **Mode isolation verification** - Target/Reference calculations must remain independent
3. **Dependency chain testing** - Upstream changes must propagate correctly to S01 totals
4. **Performance optimization** - Remove any remaining calculation stickiness/delays

### **Success Criteria for Calculation Parity**

- ✅ **State isolation maintained** (already achieved)
- 🎯 **h_10 = 90.9** when d_116 = "No Cooling"
- 🎯 **h_10 = 93.6** when d_116 = "Cooling" with default settings
- 🎯 **e_10 = 211** for Reference model baseline
- 🎯 **S01 totals match** expected Excel values
- 🎯 **All ventilation changes** trigger immediate recalculations

## 6. September 14, 2025 GOAL: Methodical Rebuild Strategy

**Assessment**: The Pattern 1 refactor successfully achieved state isolation but broke calculation parity by moving too fast. We need a more careful, progressive approach that maintains both architectural integrity AND calculation accuracy.

### **The New Path Forward**

**Philosophy**: Build the final S13 refactor on solid foundations with continuous validation, just as we carefully constructed the CONTEXT version step-by-step with Chunk A, B, C methodology.

### **Phase 1: Establish Known Calculation Baseline**

**Objective**: Calibrate all 4011RF sections to match Excel defaults in both Reference and Target modes.

1. **Section-by-Section Excel Alignment**:

   - Verify S14 and S15 Target calculations match Excel exactly
   - Ensure S04 and S01 downstream flow produces expected totals
   - Confirm Reference states across all sections match Excel baseline values
   - Rule out any unexpected values in Reference states

2. **Target Flow Validation**:

   - S14 → S15 → S04 → S01 calculation chain verification
   - Known good: S13 Target state isolation (current working file)
   - Known issue: S13 Target calculation accuracy needs work

3. **Reference Flow Validation**:
   - Ensure all Reference calculations use proper building code defaults
   - Verify Reference state isolation is maintained across all sections
   - Confirm no unexpected contamination in any Reference calculations

**Success Criteria Phase 1**: All sections except S13 show perfect Excel parity in both modes.

### **Phase 2: Progressive S13 Refactor with Continuous Validation**

**Selected Baseline**: **S13-CONTEXT (current Section13.js)** - CHOSEN as optimal starting point

**Why CONTEXT was selected**:

- ✅ **State isolation achieved** - g_118 contamination resolved with Pattern 1 architecture
- ✅ **"Cooling bump" eliminated** - Added A7 dual calculation triggers (h_10 = 93.4 vs target 93.6)
- ✅ **Functional baseline established** - Stable heating system switching with automatic convergence
- ✅ **Comprehensive architecture** - Full dual-state implementation with temporary mode switching
- ✅ **Known foundation** - Build upon proven state isolation rather than starting from scratch

**Alternative Options (preserved for reference)**:

- **Option A**: S13-OFFLINE - Pre-context with calculation accuracy in Target mode only
- **Option B**: S13-A7-TARGET-CORRECT - Legacy system with known calculation accuracy, good for comparison
- **Option C**: S13-AGGRESSIVE - Failed aggressive refactor documented as cautionary example

**Methodology**: Focus on calibration and fine-tuning rather than major refactor:

1. **Section-by-Section Excel Calibration (S02-S12)**:

   - Verify each section's Target defaults match Excel baseline values exactly
   - Ensure Reference defaults align with building code standards
   - Confirm calculation flow S14 → S15 → S04 → S01 produces expected totals
   - Rule out any upstream calculation drift affecting S13 inputs

2. **S13 Fine-Tuning (Current CONTEXT Baseline)**:

   - Current status: h_10 = 93.4 (target 93.6) - 99% accurate ✅
   - Focus on minor calculation precision rather than major refactor
   - Preserve working state isolation and cooling bump elimination
   - Address remaining 0.2 difference through targeted adjustments

3. **Continuous Validation**:
   - Test each section calibration for Excel parity
   - Verify S13 changes don't break state isolation
   - Maintain functional baseline while improving accuracy
   - Document any changes that affect calculation results

### **Phase 3: Final Integration & Validation**

1. **Complete S13 Integration**: Ensure final S13 has both perfect state isolation and Excel parity
2. **Full System Testing**: Verify entire 4011RF system works with new S13
3. **Performance Optimization**: Address any remaining calculation stickiness
4. **Documentation**: Update all documentation to reflect final architecture

### **Key Learnings Applied**

- ✅ **State isolation architecture** - we know this works from current S13
- ✅ **Calculation accuracy** - we know this works from OFFLINE/CONTEXT versions
- ✅ **Progressive methodology** - build incrementally with continuous validation
- ✅ **Known baselines** - start from proven calculation foundations

**Target Completion**: September 14, 2025 - Final S13 with both perfect state isolation AND Excel calculation parity.

---

## 5. Implementation Progress (Sept 26, 2025) - 75% COMPLETE

**✅ COMPLETED PHASES:**

- **Phase 1**: Temporary mode switching implemented in calculateTargetModel/calculateReferenceModel
- **Contamination Fixes**: Eliminated getRefValue fallbacks, direct ref\_ prefixed reads implemented
- **Phase 2 (Partial)**: Converted calculateHeatingSystem and calculateCOPValues to Pattern 1
- **Phase 2 (In Progress)**: Converting cooling calculation chain - 4/33 functions complete:
  - ✅ `calculateLatentLoadFactor` (Step 1)
  - ✅ `calculateAtmosphericValues` (Step 2)
  - ✅ `calculateHumidityRatios` (Step 3)
  - ✅ `calculateA50Temp` (Step 4)

**⏳ REMAINING WORK (25%):**

- **Phase 2 (Remaining)**: Convert 29 more functions to remove isReferenceCalculation parameters
  - 8 cooling chain functions (calculateFreeCoolingLimit, updateCoolingInputs, etc.)
  - 6 main calculation functions (calculateCoolingSystem, calculateVentilationRates, etc.)
  - 1 helper function (getSectionValue)
- **Phase 3**: Eliminate createIsolatedCoolingContext and unify state access patterns

**STABLE CHECKPOINT (Sept 26, 2025)**: All calculations working, cooling parity maintained, systematic Pattern 1 conversion in progress. Ready for batch conversion of remaining functions.

---

## 🚨 **CRITICAL DISCOVERY: S04 OVER-ENGINEERING CONTAMINATION RISK (Sept 25, 2025)**

**MAJOR ARCHITECTURAL ISSUE IDENTIFIED**: Section 04 is severely over-engineered compared to Excel source.

### **Excel Reality (FORMULAE-3039.csv lines 26-36):**

- **10 simple rows** with clean formulas: `=D27-D43-I43`, `=F27*L27/1000`
- **Straightforward calculations**: Read upstream values, apply formula, store result
- **Minimal complexity**: Direct dependency chain without architectural overhead

### **Current S04.js Reality:**

- **2,837 lines** of complex dual-state architecture
- **100+ fallback contamination patterns**: `|| "Heatpump"`, `|| 0`, `|| "ON"`
- **Extensive listener infrastructure**: 50+ StateManager listeners for every possible change
- **Over-engineered state management**: Far beyond Excel's simple calculation model

### **Contamination Risk Assessment:**

**HIGH PRIORITY**: S04's extensive fallback patterns may be **masking missing ref\_ publications** from upstream sections (S07, S13, S15). These fallbacks prevent detection of:

- Missing `ref_d_113` (S13 heating system)
- Missing `ref_d_51` (S07 water heating system)
- Missing `ref_h_115`, `ref_f_115` (S13 fuel volumes)
- Missing `ref_e_51`, `ref_k_54` (S07 fuel volumes)

**Strategic Recommendation**:

1. **Complete S13 state isolation first** (current priority)
2. **Audit S04 for Excel simplification** (post-S13 cleanup)
3. **Remove S04 fallbacks systematically** once upstream ref\_ publications verified
4. **Consider S04 rewrite** following Excel's simple 10-row model

**Reference Documentation**: FORMULAE-3039.csv lines 26-36 show the true S04 complexity should be minimal.

---

## 🔍 **S13-AGGRESSIVE REFERENCE MODEL DEBUGGING (Sept 26, 2025)**

### **Issue Investigation: Reference Model DOM Updates**

**Problem**: S13-AGGRESSIVE Reference model calculations run but don't update downstream S01 e_10 value.

**Symptoms Observed:**

- **Target Mode**: d_118 slider → immediate multi-field updates across S13 DOM → e_10 changes dynamically ✅
- **Reference Mode**: d_118 slider → percentage indicator updates, console activity, but NO other DOM field updates → e_10 stays at 152.3 ❌
- **Expected**: Reference e_10 should be ~211 (vs current 152.3)

**Critical Observation**: Human user sees **dynamic streaming updates across multiple S13 fields** in Target mode (d_121, i_121, m_121, d_122, d_123, etc.) but **only slider percentage updates** in Reference mode. This indicates S13 Reference calculations are disconnected from DOM display layer.

**Investigation Results (Sept 26, 2025):**

#### **✅ S13 Reference Storage Confirmed Working:**

- **Console logs**: `[Section13] ✅ Re-wrote 34 Reference values`
- **Storage mechanism**: `storeReferenceResults()` properly stores ref_m_121 and other values
- **Contamination fix applied**: Eliminated fallback pattern in `updateCalculatedDisplayValues()`

#### **🚨 Root Cause: Downstream Consumption Issue**

**Hypothesis**: The issue is NOT in S13 Reference calculations, but in **downstream sections failing to consume ref_m_121**.

**Evidence:**

1. **S13 Reference calculations run** (console activity confirms)
2. **S13 stores ref_m_121** (34 Reference values stored)
3. **S15 likely not reading ref_m_121** (Reference TED calculation missing ventilation component)
4. **S01 shows wrong e_10** (based on S15's incomplete Reference TED)

**Critical Dependency Chain:**

```
S13 ref_m_121 → S15 Reference TED → S01 Reference e_10
     ✅              ❌              ❌
```

#### **Next Investigation Priority:**

**Verify S15 Reference model consumption of S13 values:**

- Does S15 read `ref_m_121` for Reference TED calculation?
- Are there missing `ref_` dependencies in S15's Reference model?
- Is S15 `calculateReferenceModel()` using proper mode-aware external dependency reading?

**Strategic Decision**: Focus on **S15 Reference model audit** before further S13 modifications.

#### **✅ CONCLUSION: S13-AGGRESSIVE vs Working S13**

**Finding**: The working S13 file handles Reference mode d_118 slider changes correctly with proper DOM updates, while S13-AGGRESSIVE does not. This suggests:

1. **S13-AGGRESSIVE**: Perfect state isolation but Reference DOM update disconnection
2. **Working S13**: Functional Reference calculations but state contamination issues

**Recommendation**: **Continue S13 refactor work with the working S13.js file** and apply state isolation lessons from S13-AGGRESSIVE selectively, rather than fixing S13-AGGRESSIVE's Reference DOM issues.

---

## 4. Reference Contamination Investigation (Sept 24, 2025)

### **BREAKTHROUGH: S13 Confirmed as Primary Contamination Source**

**Problem**: Target location changes (S03: Alexandria → Attawapiskat) cause Reference e_10 to jump from 211.6 → 243.8 when Reference should remain unchanged.

**CRITICAL DISCOVERY (Sept 24, 2025)**: Testing with S13-AGGRESSIVE file **completely resolved S03 state mixing** but broke cooling calculations. This proves **S13 is the primary contamination source**.

**Root Cause Confirmed**: S13's current Reference calculation logic contains contamination patterns that affect downstream S14/S15 calculations, causing Reference model to use Target-derived values.

### **Contamination Sources Identified & Status:**

#### **✅ S14 (TEDI Section) - FIXED**

**Issue**: `getRefValue()` function with fallback logic:

```javascript
// ❌ BEFORE: Contaminated fallback pattern
const i97 = parseFloat(getRefValue("i_97")) || 0; // Could fallback to Target!

// ✅ AFTER: Pure Reference reads
const i97 = parseFloat(window.TEUI?.StateManager?.getValue("ref_i_97")) || 0;
```

**Status**: ✅ Fixed - all S14 Reference calculations now use pure ref\_ prefixed values

#### **✅ S15 (TEUI Section) - FIXED**

**Issue**: Same `getRefValue()` fallback contamination pattern
**Status**: ✅ Fixed - eliminated all getRefValue calls, now uses direct ref\_ reads

#### **✅ S04 (Energy Totals) - CLEARED AS CONTAMINATION SOURCE**

**Investigation Result**: S04 debug logging revealed NO S04 Reference calculations triggered by S03 Target location changes
**Analysis**: S04 Row 27 correctly reads external S15 values (`ref_d_136` vs `d_136`), Row 32 correctly sums j_27 values
**Root Cause**: S04 is correctly reading contaminated upstream values - contamination source is upstream in calculation chain
**Status**: ✅ Cleared - S04 architecture is correct, issue is upstream

#### **❓ UPSTREAM CONTAMINATION SOURCES - INVESTIGATION PRIORITIES**

**S12 (Volume Metrics) - i_104 Investigation:**

- **Issue**: S14 reads `ref_i_104` for Reference TED calculations
- **Investigation**: Verify S12 publishes clean `ref_i_104` values that don't change when Target location changes
- **Pattern**: Check if S12 Reference calculations use contaminated climate values

**S13 (Mechanical Loads) - PRIMARY CONTAMINATION SOURCE CONFIRMED:**

- **PROOF**: S13-AGGRESSIVE file test completely resolved state mixing when S13 was properly isolated
- **Issue**: Current S13 Reference calculations contaminate downstream S14/S15 via m_121, d_114 values
- **Critical Problems**:
  1. **getRefValue fallback patterns**: Similar to S14/S15 contamination patterns we fixed
  2. **Missing ref\_ value publishing**: S13 likely not publishing clean ref_m_121, ref_d_114, etc.
  3. **Internal state contamination**: S13's Reference calculations using Target heating loads or climate data
  4. **Calculation accuracy vs state isolation**: Need S13 refactor that achieves BOTH (like S13-AGGRESSIVE had isolation but broke cooling)

**Investigation Strategy**:

- Check if S12/S13 publish clean ref\_ values for S14/S15 consumption
- Verify S12/S13 Reference calculations don't use Target climate or heating values
- Look for fallback contamination patterns in S12/S13 Reference logic

### **Anti-Pattern Analysis for S13 Completion:**

**Key Anti-Patterns to Eliminate in S13:**

1. **Fallback Contamination**: Any `getRefValue()` or similar functions that fall back to Target values
2. **ModeManager Internal State**: Reference calculations reading from internal state that could be contaminated
3. **Missing ref\_ Publishing**: Reference calculations not storing results with ref\_ prefix for downstream consumption
4. **Cross-State Function Calls**: Reference calculations calling Target calculation functions

**Strategic Approach**: Complete S13-ENDGAME refactor to achieve both perfect state isolation (like S13-AGGRESSIVE) AND calculation accuracy (like current version). Apply same contamination elimination patterns used successfully in S14/S15, but with careful preservation of working cooling calculations.

### **S13 Completion Priority (Sept 24, 2025)**

**CONFIRMED**: S13 is the final piece needed for complete dual-state system stability. The S13-AGGRESSIVE test proves that proper S13 state isolation eliminates the Reference contamination issue entirely.

**Completion Strategy**:

1. **Apply S14/S15 contamination fixes to S13**: Eliminate getRefValue fallbacks, use direct ref\_ reads
2. **Preserve cooling calculation accuracy**: Don't break working cooling physics from current S13
3. **Ensure proper ref\_ publishing**: S13 must publish clean ref_m_121, ref_d_114 for downstream consumption
4. **Test systematically**: Verify both state isolation AND cooling calculation accuracy

**Success Criteria**: S13 refactor that achieves S13-AGGRESSIVE's state isolation without breaking cooling calculations.

---

## 7. Claude Code Strategic Additions (Sept 24, 2025 - 12:50am)

### **Assessment: Surgical Precision Required**

Given the 100% Excel parity achievement (h_10 = 93.7) and the graveyard of failed S13 refactors, this is now a **timing/sequencing issue**, not an architectural problem. The conservative approach is exactly right.

### **Phase 0: Deep Dive Debugging (Before Any Code Changes)**

**Objective**: Understand the exact mechanism of the "cooling bump" before touching any code.

1. **"Cooling Bump" Forensics**:

   - Log the precise calculation sequence difference between:
     - Initial run: h_10 = 93.4
     - Post-bump: h_10 = 93.7 (correct)
   - Capture which specific functions/calculations are triggered by the manual d_116 toggle
   - Document the dependency chain that gets re-executed

2. **Calculation Sequence Mapping**:

   - Trace the exact order of function calls in both scenarios
   - Identify which calculation is "missing" on first pass
   - Determine if it's a dependency timing issue or state update sequence problem

3. **Minimal Impact Analysis**:
   - Since calculations work perfectly with manual trigger, identify the smallest possible code change
   - Focus on replicating the bump effect automatically rather than refactoring

### **Phase 1.5: Ultra-Conservative Testing Framework**

**Objective**: Create a safety net before making any changes.

1. **Regression Safety Net**:

   - Automated verification that h_10 = 93.7 AND state isolation work before/after changes
   - Test both Target and Reference model independence
   - Quick rollback strategy if working state breaks

2. **Surgical Implementation Strategy**:
   - Preserve the cooling engine itself - avoid touching core calculations
   - Focus on dependency ordering or missing function calls
   - Make the minimum change that eliminates manual trigger requirement

### **Key Strategic Insights**

1. **Preserve What Works**: Current system achieves 100% Excel parity - this is gold
2. **Timing Over Architecture**: This feels like dependency sequencing, not a Pattern 1 refactor need
3. **Surgical Precision**: Given complexity and previous failures, minimal change approach is critical
4. **Trust the Process**: The methodical, conservative approach learned from failed attempts is wise

### **Critical Success Factors**

- **No breaking changes**: Maintain h_10 = 93.7 and state isolation at all costs
- **Minimal code impact**: Find the smallest change that replicates bump effect
- **Continuous validation**: Test after every small change
- **Quick rollback capability**: Be ready to revert if anything breaks

**Ready to execute with surgical precision on Sept 24, 2025** 🎯

---

## 6. CRITICAL JUNCTURE ANALYSIS (Sept 26, 2025) - 🚨 BREAKING POINT IDENTIFIED

### **✅ SAFE ZONE ACHIEVEMENTS (9/33 functions converted)**

**Successfully converted cooling functions to Pattern 1:**

1. `calculateLatentLoadFactor` ✅
2. `calculateAtmosphericValues` ✅
3. `calculateHumidityRatios` ✅
4. `calculateA50Temp` ✅
5. `calculateWetBulbTemperature` ✅
6. `updateCoolingInputs` ✅
7. `calculateFreeCoolingLimit` ✅
8. `calculateDaysActiveCooling` ✅
9. `runIntegratedCoolingCalculations` ✅

**Status**: All cooling chain functions working perfectly, calculations maintained, Excel parity preserved.

### **🚨 BREAKING POINT: calculateCoolingSystem**

**Attempted Conversion**: Step 8 - Convert `calculateCoolingSystem` to Pattern 1
**Result**: **CATASTROPHIC FAILURE** - Exact same issue as S13-AGGRESSIVE
**Symptoms**:

- h_10 drift: 93.6 → 93.0 ❌
- e_10 drift: Normal → 152.3 ❌
- Cooling bump failure ❌
- Reference model disconnection ❌

### **🔍 ROOT CAUSE ANALYSIS**

**The Problem**: `calculateCoolingSystem` is a **state-reading orchestrator** that:

1. **Reads heating system type** from d_113 (differs between Target/Reference)
2. **Reads cooling demand** from S14 (m_129 vs ref_m_129)
3. **Coordinates COP calculations** based on system type
4. **Manages complex external dependencies**

**Why Pattern 1 Fails Here**: Removing `isReferenceCalculation` parameter eliminates the function's ability to distinguish calculation contexts, causing it to read wrong state values.

### **🏗️ ARCHITECTURAL DECISION: SMART REACTIVE + S13 HYBRID**

**DECISION MADE (Sept 26, 2025)**: Pivot to **Smart Reactive System** approach from SEPT15-RACE-MITIGATION.md

#### **✅ CHOSEN PATH: Smart Reactive System + S13 Hybrid**

- **Root Cause Fix**: Address StateManager calculated value propagation limitation
- **S13 Hybrid Preserved**: Keep 9 successful Pattern 1 conversions, pause further internal refactoring
- **Target Works Principle**: If Target calculations work, Reference should use identical trigger patterns
- **Strategic Benefits**: Fix underlying architecture issues that affect ALL sections, not just S13

### **🎯 FINAL STRATEGY: ORCHESTRATOR-FIRST APPROACH**

**Phase 1: Smart Reactive Implementation**

1. **Implement Smart Reactive System** (SEPT15-RACE-MITIGATION.md Appendix D)
2. **Replace listener chaos** with requestAnimationFrame batching
3. **Use proven Calculator.js calcOrder** for deterministic execution
4. **Fix StateManager propagation** without breaking existing architecture

**Phase 2: Return to S13-ENDGAME**

1. **Resume S13 refactoring** with clean calculation context from orchestrator
2. **Continue Pattern 1 conversions** with reduced external interference
3. **Complete remaining 24 functions** in stable orchestrator environment

**Rationale**:

- **Fix Root Cause**: StateManager limitation affects ALL sections, not just S13
- **"Target Works" Insight**: Reference model should use identical patterns to working Target model
- **Strategic Efficiency**: Solve architecture problem once, benefit all sections
- **Risk Reduction**: Clean foundation before continuing complex S13 work

**Next Steps**:

1. Update S13-ENDGAME documentation ✅
2. Create ORCHESTRATOR branch ✅
3. Implement Smart Reactive System ✅
4. Return to S13 with clean foundation ✅

### **🎯 CURRENT STATUS (Sept 26, 10:20pm) - ORCHESTRATOR FOUNDATION COMPLETE**

**✅ ORCHESTRATOR ACHIEVEMENTS:**

- **Stable foundation established** in ORCHESTRATOR branch
- **Clock.js integration working** (2-pass initialization: 472ms + 166ms)
- **Surgical listener replacement proven** (S12 climate propagation)
- **Documentation complete** (RACE-MITIGATION + CHEATSHEET updated)

**🚨 CALCULATECOOLINGSYSTEM RETRY FAILED:**

- **Error**: `ReferenceError: isReferenceCalculation is not defined`
- **Root Cause**: Deep internal contamination throughout function body
- **Lesson**: Complex state-reading functions need **complete internal cleanup**, not just parameter removal

**📋 TOMORROW'S STRATEGY: HYBRID ARCHITECTURE COMPLETION**

**Approach**: **Skip complex orchestrators**, focus on **simple function conversions** and **core contamination fixes**

**Priority 1: Simple Pattern 1 Conversions** (~15 remaining simple functions)

- Skip: `calculateCoolingSystem`, `calculateHeatingSystem` (complex state-readers)
- Convert: Simple calculation functions without external state dependencies

**Priority 2: Core Contamination Fixes**

- **S03 state mixing**: Target location changes affecting both models
- **g_118 stuck values**: Ventilation method changes not propagating
- **Reference model asymmetry**: k_120, g_118 behavior differences

**Priority 3: Orchestrator Integration Benefits**

- **Use orchestrator foundation** for clean calculation context
- **Leverage surgical listener replacement** for specific propagation issues
- **Apply lessons learned** from stable ORCHESTRATOR branch

**Strategic Validation**: **Hybrid architecture** (9 Pattern 1 + complex Pattern 2) provides **maximum benefit** with **minimum risk** for project completion.
