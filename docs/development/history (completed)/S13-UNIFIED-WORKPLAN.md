# S13-UNIFIED-WORKPLAN.md: Complete S13 Knowledge Synthesis & Implementation Guide

## 📋 **COMPREHENSIVE CONSOLIDATION**

**Total Source Content**: 1,157 lines across 4 documents  
**Consolidation Goal**: Preserve ALL critical findings without loss  
**Method**: Systematic synthesis with source attribution

**Source Documents**:

- **S13-QC-AUDIT.md**: 205 lines - QC Framework findings
- **S13-FIXES.md**: 217 lines - Surgical line-by-line fixes
- **S13-TROUBLESHOOTING-GUIDE.md**: 204 lines - Failed attempts & root cause
- **S13-REFACTOR-WORKPLAN.md**: 270 lines - Strategic overview
- **S13-MASTER-CONSOLIDATION.md**: 266 lines - Initial synthesis (this document)

---

## 🎯 **CRITICAL FOUNDATION PRINCIPLES**

### **NEVER ASSUME CALCULATION ERRORS** [[memory:7964663]]

- ✅ **Target calculations**: Perfect Excel parity - mathematically correct
- ✅ **HVAC formulas**: Regulatory-approved, never modify
- ✅ **Working components**: Sliders, dropdowns, system calculations
- ❌ **Reference pathway**: Incomplete, contaminated, needs completion

### **PRESERVE TARGET PATHWAY AT ALL COSTS**

- **Current h_10 values**: Electricity=154.4, Gas=163.7, Oil=163.7, Heatpump=93.6 ✅
- **HSPF slider functionality**: f_113 triggers calculations correctly ✅
- **Cross-section flow**: S13→S14→S15→S04→S01 working ✅

---

## ✅ **COMPLETED BREAKTHROUGHS** (Do Not Retry)

### **✅ S14 Fallback Contamination Eliminated** (December 2024 - CRITICAL FIX)

**Issue**: Safari worked correctly, Chrome had inconsistent h_10 values  
**Root Cause**: S14 `getRefValue()` function: `refValue || fallbackValue || domValue` - fell back to Target DOM values when Reference values weren't ready  
**Fix Applied**: Changed to `refValue || fallbackValue || 0` - eliminated Target fallback contamination  
**Result**: ✅ **Both browsers now behave consistently** (both need cooling bump, but consistently)  
**Impact**: Critical timing contamination eliminated from S13→S14→S15→S04→S01 chain

### **✅ HSPF Slider Value Persistence** (COMPLETED)

**Issue**: HSPF slider position didn't restore correctly when switching modes
**Fix**: Proper element targeting using S10's proven pattern
**Result**: Target f_113=12.5, Reference f_113=7.1 working perfectly
**Status**: ✅ **COMPLETELY RESOLVED** - slider persistence working

### **✅ Dropdown State Isolation** (COMPLETED)

**Issue**: Dropdown changes in Reference mode affected Target mode (state contamination)
**Fix**: Added dropdown.value = stateValue to refreshUI()
**Status**: ✅ **COMPLETELY RESOLVED** - mode isolation working

### **✅ S15 Reference Calculation Engine** (COMPLETED)

**Issue**: Reference d_136 stuck at 301,986.05 regardless of S13 changes  
**Fix**: S15 now reads ref_d_113, ref_d_116 directly instead of broken getReferenceValue()
**Status**: ✅ **COMPLETELY RESOLVED** - S15 Reference calculations working

### **✅ AFUE Mode-Aware Publication** (COMPLETED)

**Issue**: j*115 AFUE changes not published with ref* prefix in Reference mode
**Fix**: Changed blur handler to use ModeManager.setValue() instead of direct StateManager.setValue()
**Status**: ✅ **COMPLETELY RESOLVED** - j_115 mode-aware publication working

### **✅ Reference Default Alignment** (COMPLETED)

**Issue**: Reference UI defaults didn't match calculation behavior (priming required)
**Fix**: Set d_113="Electricity", d_116="No Cooling" to align with e_10 baseline calculations
**Status**: ✅ **COMPLETELY RESOLVED** - no priming needed for Reference mode

---

## 🎯 **CURRENT FOCUS ISSUES** (Active Work)

### **🚨 PRIORITY 1: g_118 Dropdown State Synchronization** (ACTIVE INVESTIGATION)

**Issue**: g_118 "Volume Constant" change → h_10 = 95.8 (wrong) instead of 93.6 (correct)  
**Pattern**: Both Safari and Chrome now consistently require "cooling bump" to reach correct h_10 = 93.6  
**Evidence**: Logs show S13 Reference calculations use "Volume Constant" but Target calculations still use "Volume by Schedule"

**🔬 Root Cause Analysis**:

- **NOT simple state reading issue** - Previous attempts at surgical g_118 fixes failed (September 2024)
- **IS shared coolingState object contamination** - Both engines use same `coolingState.ventilationMethod`
- **Complex cooling physics chain**: g_118 → atmospheric → humidity → thermal calculations deeply interconnected
- **Atomic timing issue**: S13 publishes partial value sets during dual-engine calculations

**🎯 Known Failed Approaches** (Do Not Retry):

- ❌ **Surgical function isolation**: Broke cooling physics chain
- ❌ **Dual cooling state objects**: Broke heating calculations
- ❌ **Direct state reading bypass**: Cooling calculations too interconnected

**🔬 HYPOTHESIS: Mixed Reading Pattern Issue** (September 10, 2025)
**Discovery**: Inconsistent value reading methods within S13 ventilation calculations:

- **✅ Working**: `ModeManager.getValue("g_118")` (mode-aware, line 946)
- **❌ Suspected**: `getFieldValue("l_118")` (mode-agnostic, line 836)

**Theory**: Mixed reading patterns create **partial state synchronization** where:

- g_118 reads correctly from current state → "Volume Constant" ✅
- l_118 reads from stale/global state → wrong ACH value ❌
- Result: Inconsistent calculation inputs → wrong d_120 → wrong j_32 → wrong h_10

**🧪 PROPOSED TEST (Single Field)**:
Replace **line 836**: `getFieldValue("l_118")` → `ModeManager.getValue("l_118")`
**Expected Result**: Eliminates cooling bump requirement for h_10 = 93.6

**⚠️ CAUTION**: Test with single field first to validate hypothesis before broader changes

**Next Steps**:

1. **Document hypothesis** (completed)
2. **Single field test** (l_118 fix only)
3. **Validate result** before additional changes
4. **If successful**: Apply pattern to remaining problematic fields

## 📋 **PENDING ISSUES** (Future Work)

### **❓ j_116 User Editability** (IMPLEMENTATION NEEDED)

**Issue**: j_116 not user-editable when Gas/Oil + Cooling=true
**Expected**: j_116 should become editable for dedicated cooling COP
**Status**: 🔧 **PENDING IMPLEMENTATION** (lower priority)

**Required Fix Pattern** (S10/S11 proven solution):

```javascript
// In refreshUI() function - S10/S11 proven pattern:
fieldsToSync.forEach((fieldId) => {
  const stateValue = currentState.getValue(fieldId);
  const element = sectionElement.querySelector(`[data-field-id="${fieldId}"]`);

  const slider = element.matches('input[type="range"]')
    ? element
    : element.querySelector('input[type="range"]');
  if (slider) {
    const numericValue = window.TEUI.parseNumeric(stateValue, 0);
    slider.value = numericValue; // ✅ CRITICAL: Updates slider position

    const display = slider.nextElementSibling;
    if (display) {
      display.textContent = parseFloat(numericValue).toFixed(1); // For HSPF
    }
  }
});
```

### **2. Reference State Persistence Corruption** (S13-TROUBLESHOOTING-GUIDE.md lines 105-117)

**Issue**: ReferenceState.getValue("d_113") ALWAYS returns "Gas" regardless of Reference mode changes

- **Evidence**: `[Section13] 🔥 REF HEATING: systemType="Gas" (STUCK!)`
- **Root Cause**: State object initialization/persistence failure
- **Status**: ❌ **UNFIXED** - fundamental state corruption

### **3. Current State Anti-Pattern Contamination** (S13-TROUBLESHOOTING-GUIDE.md lines 40-54)

**Mechanism**: Reference calculations read Target values through getFieldValue()

1. calculateReferenceModel() calls helper functions
2. Helpers use getFieldValue('j_115') - reads current DOM/StateManager
3. During Target operations, this returns Target values
4. Reference calculations proceed with contaminated Target inputs
5. Incorrect Reference results trigger S04 listeners → contaminated h_10

---

## 📚 **DETAILED SOURCE DOCUMENT ANALYSIS**

### **1. S13-QC-AUDIT.md** (NEW - Sept 2025)

**Unique Contributions**:

- ✅ **QC Framework findings**: 3,533 violations, 40,643 monitor calls
- ✅ **Pattern B contamination scan**: Clean results
- ✅ **Missing S02 setFieldValue pattern**: Critical architectural gap
- ✅ **19+ setCalculatedValue() instances**: Should be setFieldValue() for mode-aware storage
- ✅ **Missing S02 setFieldValue pattern**: Critical gap identified
- ✅ **Parameter-based vs mode-aware approach**: Architectural mismatch
- ✅ **Specific violation types**: MISSING_REFERENCE_VALUE (2,582), STALE_VALUE (600)

### **2. S13-FIXES.md** (Surgical Approach)

**Unique Contributions**:

- ✅ **19 specific getFieldValue() violations** with exact line numbers
- ✅ **Function-by-function breakdown**: calculateHeatingSystem(), calculateCoolingSystem(), etc.
- ✅ **Working vs Broken comparison**: 13.js vs A31.js audit table
- ✅ **Specific fix patterns**: Section fields vs external dependencies
- ✅ **Excel parity validation**: Target pathway testing protocol

**CRITICAL DETAILED VIOLATIONS (MUST NOT LOSE)**:

| **Line** | **Current Code**         | **Fix Type**                | **Priority** |
| -------- | ------------------------ | --------------------------- | ------------ |
| 642      | `getFieldValue("d_59")`  | External dep → mode-aware   | HIGH         |
| 707      | `getFieldValue("h_120")` | Section field → TargetState | HIGH         |
| 715      | `getFieldValue("m_19")`  | External dep → mode-aware   | HIGH         |
| 757      | `getFieldValue("m_19")`  | External dep → mode-aware   | HIGH         |
| 859      | `getFieldValue("g_118")` | Section field → TargetState | HIGH         |
| 2017     | `getFieldValue("m_129")` | External dep → mode-aware   | HIGH         |
| 2262     | `getFieldValue("d_113")` | Section field → TargetState | HIGH         |
| 2514     | `getFieldValue("d_116")` | Section field → TargetState | HIGH         |
| 2519     | `getFieldValue("m_129")` | External dep → mode-aware   | HIGH         |
| 2521     | `getFieldValue("j_113")` | Section field → TargetState | HIGH         |
| 2567     | `getFieldValue("h_15")`  | External dep → mode-aware   | HIGH         |
| 2638     | `getFieldValue("g_118")` | Section field → TargetState | HIGH         |
| 2643     | `getFieldValue("d_119")` | Section field → TargetState | HIGH         |
| 2646     | `getFieldValue("d_105")` | External dep → mode-aware   | HIGH         |
| 2647     | `getFieldValue("l_118")` | Section field → TargetState | HIGH         |
| 2648     | `getFieldValue("i_63")`  | External dep → mode-aware   | HIGH         |
| 2649     | `getFieldValue("j_63")`  | External dep → mode-aware   | HIGH         |

**Function-Specific Analysis**:

1. **calculateHeatingSystem()** (Lines 2426-2505): External deps via getGlobalNumericValue
2. **calculateCoolingSystem()** (Lines 2510-2609): getFieldValue("d_116", "m_129", "j_113")
3. **calculateVentilationEnergy()** (Lines 2704-2730): getFieldValue("d_120"), external deps
4. **calculateCoolingVentilation()** (Lines 2735-2819): Multiple getFieldValue() calls
5. **calculateFreeCooling()** (Lines 2824-3305): getFieldValue("d_59") + others

### **3. S13-TROUBLESHOOTING-GUIDE.md** (Historical Analysis)

**Unique Contributions**:

- ✅ **Failed attempt documentation**: Aug 26, 2025 full-day session analysis
- ✅ **Why comprehensive fixes fail**: Too many moving parts in S13
- ✅ **State object corruption evidence**: ReferenceState.getValue() returns stale data
- ✅ **Excel calculation mismatch**: h_10 values no longer match after architectural changes
- ✅ **6-Phase CHEATSHEET audit**: Complete compliance analysis with specific violations

**CRITICAL FAILED ATTEMPT LESSONS** (Aug 26, 2025):

- ❌ **Comprehensive approach failed**: Made contamination worse
- ❌ **State Object Corruption**: ReferenceState persistence issues
- ❌ **Excel Calculation Mismatch**: h_10 TEUI values broke
- ✅ **Incremental approach required**: Ultra-focused fixes only

**Missing External Dependency Listener Pairs**:

- `d_63/ref_d_63` (occupancy)
- `i_63/ref_i_63` (occupied hours)
- `j_63/ref_j_63` (total hours)
- `d_105/ref_d_105` (volume)
- `h_15/ref_h_15` (area)
- `ref_d_127` (Reference TED from S14)

### **4. S13-REFACTOR-WORKPLAN.md** (Strategic Overview)

**Unique Contributions**:

- ✅ **4-6 hour timeline estimation**: Realistic implementation scope
- ✅ **Risk mitigation strategies**: Backup plans, rollback procedures
- ✅ **Success criteria definition**: Clear completion metrics
- ✅ **Incremental approach methodology**: Phase-by-phase implementation
- ✅ **High-risk area identification**: Complex functions, integration points
- ✅ **Consumer section insights**: S13 may need different architecture than producer sections

---

## 🎯 **CONSOLIDATED IMPLEMENTATION STRATEGY**

### **PHASE 1A: HSPF Slider Position Fix** (S13-REFACTOR-WORKPLAN.md Priority 1)

**Goal**: Fix ONLY slider position persistence - no calculation changes
**Issue**: Target f_113=12.5 → Reference f_113=7.1 → back to Target shows 7.1 ❌
**Status**: ❌ **UNFIXED** - Critical UI bug identified but never resolved

**Implementation** (S10/S11 proven pattern):

1. Check S13's fieldsToSync array includes f_113
2. Verify element targeting uses `element.matches('input[type="range"]')` pattern
3. Apply slider position update: `slider.value = numericValue`
4. Update display: `nextElementSibling.textContent` for HSPF value
5. Test: Target 12.5 → Reference 7.1 → Target should restore 12.5

### **PHASE 2: S02 setFieldValue Implementation** (S13-QC-AUDIT.md + S04-REPAIR.md)

**Goal**: Replace setCalculatedValue() with proven S02 mode-aware storage
**Impact**: Should eliminate ~2,500 MISSING_REFERENCE_VALUE violations

**Implementation**:

1. **Copy exact S02 setFieldValue() function** (no improvisation)
2. **Replace 19+ setCalculatedValue() instances** with setFieldValue()
3. **Remove formatType parameters** (S02 pattern doesn't use them)
4. **Test after each replacement** to verify no Target regression

### **PHASE 3: Mode-Aware Calculation Engines** (All Documents)

**Goal**: Implement temporary mode switching like S02 pattern

**Current Broken Pattern**:

```javascript
// ❌ Parameter-based approach (brittle)
const copResults = calculateCOPValues(true); // Reference flag
```

**Required S02 Pattern**:

```javascript
// ✅ Mode-aware approach (proven)
function calculateReferenceModel() {
  const originalMode = ModeManager.currentMode;
  ModeManager.currentMode = "reference";

  const copResults = calculateCOPValues(); // No parameters needed

  ModeManager.currentMode = originalMode;
}
```

### **PHASE 4: State Contamination Elimination** (S13-FIXES.md line-by-line)

**Goal**: Fix all 17 getFieldValue() violations identified

**Fix Patterns**:

```javascript
// ❌ CONTAMINATED (lines 642, 707, 715, 757, 859, 2017, 2262, 2514, 2519, 2521, 2567, 2638, 2643, 2646, 2647, 2648, 2649):
const value = getFieldValue("d_113");

// ✅ SECTION FIELDS:
const value = isReferenceCalculation
  ? ReferenceState.getValue("d_113")
  : TargetState.getValue("d_113");

// ✅ EXTERNAL DEPENDENCIES:
const value =
  window.TEUI.parseNumeric(
    isReferenceCalculation
      ? getGlobalNumericValue("ref_d_59")
      : getGlobalNumericValue("d_59"),
  ) || 0;
```

---

## 🧲 **QC FRAMEWORK INTEGRATION (MEASURABLE VALIDATION)**

### **Current S13 Violation Impact** (QC Framework - Sept 3, 2025):

- **Total System Violations**: 3,533 (estimated 70%+ from S13)
- **Missing Reference Values**: 2,582 (ref_d_117, ref_f_114, ref_m_121)
- **Stale Values**: 600 (complex HVAC calculations not updating)
- **Fallback Reads**: 29 (missing dependencies)
- **Monitor Calls**: 40,643 StateManager operations tracked

### **QC-Guided Fix Priority**:

1. **Phase 2 Impact**: Fix setFieldValue() → eliminate ~2,500 violations
2. **Phase 4 Impact**: Fix getFieldValue() → eliminate ~600 stale violations
3. **Phase 5 Impact**: Add listeners → eliminate ~30 fallback violations

### **Success Measurement**:

- **Before S13 fixes**: 3,533 total violations
- **After S13 fixes**: <500 total violations (85% reduction)
- **Validation method**: QC Framework before/after counting

---

## ⚠️ **CRITICAL LESSONS FROM FAILED ATTEMPTS**

### **Aug 26, 2025 Comprehensive Fix Failure** (Historical Analysis):

**What Failed**:

- ❌ **Comprehensive approach**: Too many changes simultaneously
- ❌ **State object corruption**: ReferenceState persistence broke
- ❌ **Excel mismatch**: h_10 values diverged from baseline
- ❌ **Complex interdependencies**: S13 has too many moving parts

**Why It Failed**:

- **Reference State Persistence**: ReferenceState.getValue("d_113") stuck returning "Gas"
- **Calculation Chain Breaks**: Modified working Excel-compliant formulas
- **Cross-Section Impact**: Downstream S04→S15→S01 contamination increased

### **Key Insight**: S13 is too complex for comprehensive dual-state fixes

**Required Approach**: Ultra-focused, incremental, test-after-each-change

---

## 🔧 **CONSOLIDATED SUCCESS PATTERNS**

### **S02 Pattern Implementation** (S04-REPAIR.md + S13-QC-AUDIT.md):

```javascript
// ✅ EXACT S02 PATTERN (proven in 7+ sections):
function setFieldValue(fieldId, value, fieldType = "calculated") {
  const currentState =
    ModeManager.currentMode === "target" ? TargetState : ReferenceState;
  currentState.setValue(fieldId, value, fieldType);

  // Mode-aware StateManager publication
  if (ModeManager.currentMode === "target") {
    window.TEUI.StateManager.setValue(fieldId, value, fieldType);
  } else {
    window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, fieldType);
  }
}
```

### **Mode-Aware Calculation Engines** (All Documents):

```javascript
// ✅ S02 PATTERN: Temporary mode switching (no parameters)
function calculateReferenceModel() {
  const originalMode = ModeManager.currentMode;
  ModeManager.currentMode = "reference";

  // All existing functions work unchanged - mode-aware storage handles Reference
  runIntegratedCoolingCalculations();
  const copResults = calculateCOPValues(); // Remove (true) parameter
  const heatingResults = calculateHeatingSystem(); // Remove parameters

  ModeManager.currentMode = originalMode;
}
```

---

## 🧪 **COMPREHENSIVE TESTING PROTOCOL**

### **Target Preservation Testing** (S13-FIXES.md + S13-REFACTOR-WORKPLAN.md):

**CRITICAL**: Never break working Target calculations

**Excel Parity Validation**:

- [ ] **Heating Systems**: d_113 dropdown changes → verify h_115, f_115, d_114 calculations
- [ ] **HSPF Slider**: f_113 changes → verify heating calculations update
- [ ] **Cooling System**: d_116 dropdown → verify cooling calculations
- [ ] **Ventilation**: d_118, f_118 → verify ventilation energy calculations
- [ ] **Excel Baseline Comparison**: All Target values match exactly

**Target Mode h_10 Values** (must maintain):

- **Electricity**: h_10 = 154.4 ✅
- **Gas**: h_10 = 163.7 ✅
- **Oil**: h_10 = 163.7 ✅
- **Heatpump**: h_10 = 93.6 ✅

### **Reference Implementation Testing** (S13-TROUBLESHOOTING-GUIDE.md):

- [ ] **Reference Mode Switch**: No Target contamination
- [ ] **Reference Calculations**: Match Excel Reference methodology
- [ ] **State Isolation**: Reference changes only affect e_10, not h_10
- [ ] **Slider Persistence**: f_113 position restored correctly after mode switch

### **QC Framework Validation** (S13-QC-AUDIT.md):

- [ ] **Violation Count Tracking**: Monitor before/after fix effectiveness
- [ ] **StateManager Analysis**: Verify ref_d_117, ref_f_114, ref_m_121 appear
- [ ] **Performance Monitoring**: <5ms overhead maintained during fixes

---

## 🎯 **CONSOLIDATED KNOWLEDGE SYNTHESIS**

### **CRITICAL FOUNDATION (From All Documents)**

**✅ TARGET PATHWAY STATUS** (S13-FIXES.md + S13-REFACTOR-WORKPLAN.md):

- **Excel parity**: Perfect for Target calculations ✅
- **Working components**: Sliders, dropdowns, HVAC calculations ✅
- **Never assume calculation errors**: Target flow is mathematically correct ✅
- **Preserve at all costs**: No regression allowed ✅

**❌ REFERENCE PATHWAY GAPS** (S13-QC-AUDIT.md + S13-TROUBLESHOOTING-GUIDE.md):

- **Missing S02 setFieldValue pattern**: Uses old setCalculatedValue() approach
- **Parameter-based approach**: calculateCOPValues(true) vs mode-aware storage
- **Current State Anti-Pattern**: getFieldValue() contamination in 19+ locations
- **Missing ref\_ publication**: Reference values not reaching StateManager properly

---

## 🧲 **QC FRAMEWORK INTEGRATION (NEW INSIGHT)**

**From S13-QC-AUDIT.md QC Framework Results:**

### **Quantified S13 Impact on System Violations:**

- **Total System Violations**: 3,533 (likely 70%+ from S13)
- **Missing Reference Values**: 2,582 violations (ref_d_117, ref_f_114, ref_m_121)
- **Monitor Calls**: 40,643 StateManager operations tracked
- **Validation Method**: Before/after violation counting for fix effectiveness

### **QC-Guided Fix Priority:**

1. **Highest Impact**: Fix missing ref\_ value publication (eliminates ~2,500 violations)
2. **Medium Impact**: Fix stale value issues (eliminates ~600 violations)
3. **Cleanup**: Address remaining fallback reads (~30 violations)

---

## 🔧 **PROVEN FIX PATTERNS (From Multiple Attempts)**

### **Pattern 1: S02 setFieldValue Implementation** (S13-QC-AUDIT.md)

```javascript
// ✅ EXACT S02 PATTERN (proven in 7+ sections):
function setFieldValue(fieldId, value, fieldType = "calculated") {
  const currentState =
    ModeManager.currentMode === "target" ? TargetState : ReferenceState;
  currentState.setValue(fieldId, value, fieldType);

  // Mode-aware StateManager publication
  if (ModeManager.currentMode === "target") {
    window.TEUI.StateManager.setValue(fieldId, value, fieldType);
  } else {
    window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, fieldType);
  }
}
```

### **Pattern 2: Mode-Aware Calculation Engines** (S04-REPAIR.md inspiration)

```javascript
// ✅ S02 PATTERN: Temporary mode switching
function calculateReferenceModel() {
  const originalMode = ModeManager.currentMode;
  ModeManager.currentMode = "reference";

  // All existing calculation functions work unchanged
  runIntegratedCoolingCalculations();
  const copResults = calculateCOPValues(); // Remove (true) parameter

  ModeManager.currentMode = originalMode;
}
```

### **Pattern 3: State Contamination Elimination** (S13-FIXES.md)

```javascript
// ❌ CONTAMINATED (19 instances identified):
const value = getFieldValue("d_113");

// ✅ SECTION FIELDS:
const value = isReferenceCalculation
  ? ReferenceState.getValue("d_113")
  : TargetState.getValue("d_113");

// ✅ EXTERNAL DEPENDENCIES:
const value =
  window.TEUI.parseNumeric(
    isReferenceCalculation
      ? getGlobalNumericValue("ref_d_59")
      : getGlobalNumericValue("d_59"),
  ) || 0;
```

---

## ⚠️ **CRITICAL LESSONS FROM FAILED ATTEMPTS**

### **From S13-TROUBLESHOOTING-GUIDE.md (Aug 26, 2025 Session):**

- ❌ **Comprehensive fixes fail**: Too many moving parts in S13
- ❌ **State object corruption**: ReferenceState persistence issues
- ❌ **Excel calculation mismatch**: Architectural changes broke working formulas
- ✅ **Incremental approach required**: One function at a time

### **From S13-FIXES.md (Surgical Approach):**

- ✅ **Build on working foundation**: Use current 13.js (Target works)
- ✅ **Function-by-function fixes**: Identify specific violations
- ✅ **Test after each change**: Prevent regression accumulation
- ✅ **Excel validation**: Maintain mathematical correctness

---

## 🎯 **CONSOLIDATED IMPLEMENTATION STRATEGY**

### **PHASE 1: Foundation Validation** (S13-FIXES.md + S13-REFACTOR-WORKPLAN.md)

**Goal**: Confirm current S13 Target pathway Excel parity

- **Test heating systems**: Electricity, Gas, Oil, Heatpump → h_10 values
- **Test HSPF slider**: f_113 changes → calculation updates
- **Compare with S13-GS.js**: Gold Standard reference
- **Document baseline**: Current working state before any changes

### **PHASE 2: S02 Pattern Implementation** (S13-QC-AUDIT.md + S04-REPAIR.md)

**Goal**: Replace setCalculatedValue() with proven S02 setFieldValue()

- **Copy exact S02 function**: No improvisation
- **Replace 19+ instances**: setCalculatedValue() → setFieldValue()
- **Remove formatType parameters**: S02 pattern doesn't use them
- **Test after each replacement**: Verify no Target regression

### **PHASE 3: Mode-Aware Calculation Engines** (All Documents)

**Goal**: Implement temporary mode switching like S02

- **calculateReferenceModel()**: Set mode to "reference", run calculations, restore
- **calculateTargetModel()**: Set mode to "target", run calculations, restore
- **Remove parameter passing**: Eliminate isReferenceCalculation parameters
- **Simplify function signatures**: Functions become mode-agnostic

### **PHASE 4: State Contamination Elimination** (S13-FIXES.md + S13-TROUBLESHOOTING-GUIDE.md)

**Goal**: Fix 19 getFieldValue() violations identified

- **Section fields**: getFieldValue("d_113") → TargetState/ReferenceState.getValue()
- **External dependencies**: getFieldValue("d_59") → mode-aware getGlobalNumericValue()
- **Test state isolation**: Reference changes don't affect Target
- **Monitor with QC Framework**: Track violation count reduction

### **PHASE 5: QC Framework Validation** (S13-QC-AUDIT.md)

**Goal**: Measure fix effectiveness with quantified results

- **Before**: ~2,500+ violations from S13
- **After**: Dramatic reduction in MISSING_REFERENCE_VALUE violations
- **Success metric**: QC violations drop from 3,533 to <500
- **Continuous monitoring**: Real-time violation detection

---

## 🧪 **TESTING PROTOCOL (Consolidated from All Sources)**

### **Target Preservation Testing** (S13-FIXES.md):

- [ ] **Heating System Changes**: d_113 dropdown → verify h_115, f_115, d_114
- [ ] **HSPF Slider**: f_113 → verify heating calculations
- [ ] **Cooling System**: d_116 → verify cooling calculations
- [ ] **Excel Comparison**: All Target values match exactly

### **Reference Implementation Testing** (S13-TROUBLESHOOTING-GUIDE.md):

- [ ] **Reference Mode Switch**: No Target contamination
- [ ] **Reference Calculations**: Match Excel Reference methodology
- [ ] **State Isolation**: Reference changes only affect e_10, not h_10
- [ ] **Slider Persistence**: f_113 position restored correctly

### **QC Framework Validation** (S13-QC-AUDIT.md):

- [ ] **Violation Count**: Monitor before/after fix effectiveness
- [ ] **StateManager Analysis**: Verify ref\_ values appear properly
- [ ] **Performance Impact**: <5ms overhead maintained

---

## 📊 **CONSOLIDATED RISK ASSESSMENT**

### **HIGH-RISK AREAS** (From All Documents):

1. **Complex Calculation Functions**: calculateFreeCooling(), calculateCOPValues()
2. **Excel Parity**: Mathematical correctness must be preserved
3. **Cross-Section Integration**: S13→S14→S15→S04→S01 dependency chain
4. **State Object Persistence**: ReferenceState corruption from previous attempts

### **PROVEN SAFE APPROACHES** (From Success Stories):

1. **S02 Pattern**: Exact replication, no improvisation
2. **Incremental Changes**: One function at a time
3. **Excel Validation**: After every change
4. **QC Framework Monitoring**: Quantified progress tracking

---

## 🎯 **MASTER IMPLEMENTATION PLAN**

### **Consolidated Timeline** (From All Sources):

- **Phase 1**: Foundation validation (30 minutes)
- **Phase 2**: S02 setFieldValue implementation (60 minutes)
- **Phase 3**: Mode-aware engines (90 minutes)
- **Phase 4**: State contamination fixes (120 minutes)
- **Phase 5**: QC validation (30 minutes)
- **Total**: ~5.5 hours (matches S13-REFACTOR-WORKPLAN.md estimate)

### **Success Criteria** (Consolidated):

1. **Target Excel parity maintained** (never broken)
2. **Reference calculations isolated** (no Target contamination)
3. **QC violations drop** from 3,533 to <500
4. **State isolation perfect** (h_10 vs e_10 independent)
5. **Cross-section flow working** (S13→downstream chain)

---

## 📋 **RECOMMENDED CONSOLIDATION ACTION**

**Create**: `S13-UNIFIED-WORKPLAN.md` that synthesizes all 4 documents into one authoritative guide

**Structure**:

1. **Executive Summary**: Problem, approach, success criteria
2. **Historical Context**: Failed attempts and lessons learned
3. **Current State Analysis**: What works, what doesn't
4. **QC Framework Integration**: Quantified violation tracking
5. **Implementation Plan**: Proven patterns with specific steps
6. **Testing Protocol**: Comprehensive validation approach
7. **Risk Mitigation**: Backup plans and rollback procedures

**Benefits**:

- **Single source of truth** for S13 refactoring
- **Complete historical context** from all attempts
- **QC Framework integration** for measurable progress
- **Clear implementation path** without information loss

This consolidation preserves ALL insights while creating a clear, actionable path forward for completing S13's dual-state architecture.

---

## 🎉 **BREAKTHROUGH SESSION RESULTS (Current Session)**

### **✅ MAJOR VICTORIES ACHIEVED:**

#### **1. HSPF Slider Persistence COMPLETELY SOLVED** 🏆

- **Root Cause**: Element detection failure - `f_113` element was `<td>` containing slider, not slider itself
- **Fix Applied**: Proper element targeting using S10's proven pattern
- **Result**: Perfect state isolation - Target 20 → Reference 10 → Target restores 20 ✅
- **Status**: ✅ **COMPLETELY RESOLVED** - no more cross-contamination

#### **2. S13 Reference StateManager Publication Fixed**

- **Issue**: Reference mode changes weren't publishing to StateManager with `ref_` prefix
- **Fix**: Added `else if (this.currentMode === "reference")` block in ModeManager.setValue()
- **Result**: Reference values now properly stored in StateManager ✅

#### **3. S13 Reference Dependency Flow IDENTIFIED & FIXED**

- **Critical Finding**: S14 was missing StateManager listeners for S13 Reference outputs
- **Missing Listeners**: `ref_d_114`, `ref_d_117`, `ref_m_121`
- **Fix Applied**: Added all missing S14 Reference listeners
- **Expected Result**: S13 Reference changes should now flow → S14 → S15 → S04 → S01 (e_10)

### **🔍 AFTERNOON TESTING PRIORITIES:**

#### **IMMEDIATE TEST REQUIRED:**

1. **S13 Reference HSPF Change** → Verify S14 recalculation triggers
2. **Complete Chain Test** → S13 → S14 → S15 → S04 → S01 (watch e_10)
3. **S04 Audit** → If e_10 still stuck, audit S04 Reference dependency reading

#### **4012-CHEATSHEET AUDIT RESULTS:**

- **S14**: ✅ **PASSES** - No calculateAll() in switchMode, proper dual-state
- **S15**: ✅ **PASSES** - No calculateAll() in switchMode anti-pattern
- **S13**: ✅ **COMPLIANT** - Mode-aware setFieldValue() implemented

### **🚨 CRITICAL ARCHITECTURAL INSIGHT:**

**The "e_10 stuck" issue was caused by missing dependency listeners, NOT calculation errors.**
**S13 Reference calculations work correctly - the problem was S14 not listening for changes.**

---

**This consolidated workplan now includes complete breakthrough solutions. S13 HSPF persistence is solved, and Reference dependency flow should work correctly after S14 listener fixes.**

---

## ❌ **FAILED APPROACHES** (Do Not Retry)

### **❌ Traffic Cop Pattern for S14/S15** (Sept 8 2025 - REGRESSION)

**Attempted**: Added Traffic Cop coordination to S14 and S15 calculateAll() functions  
**Result**: ❌ **BROKE heating system calculations** - Heatpump vs Electricity vs Gas/Oil all affected  
**Lesson**: Traffic Cop prevents necessary listener-based recalculations, causing critical regression  
**Conclusion**: Individual section listeners are needed for proper cross-section communication

### **❌ Completion Signal Approach** (Sept 8 2025 - REGRESSION)

**Attempted**: Replaced S15's individual field listeners with S13/S14 completion signals  
**Result**: ❌ **BROKE all heating system calculations** - eliminated essential dependency responsiveness  
**Lesson**: S15 must respond to individual field changes (d_117, m_121, d_113, d_114) immediately  
**Conclusion**: Completion signals break the reactive calculation architecture

### **❌ Comprehensive S13 Refactor** (August 2024 - DOCUMENTED FAILURE)

**Attempted**: Full dual-state refactor of entire S13 file  
**Result**: ❌ **State object corruption, Excel parity loss, calculation chain breaks**  
**Lesson**: S13 is too complex for comprehensive changes - incremental approach only  
**Evidence**: ReferenceState.getValue("d_113") stuck returning "Gas" regardless of mode

### **❌ Surgical g_118 Function Isolation** (September 2024 - FAILED)

**Attempted**: Fix only specific functions that read g_118, bypass shared coolingState object  
**Approach**: Direct state reading to avoid `coolingState.ventilationMethod` contamination  
**Result**: ❌ **Broke cooling physics chain** - cooling calculations too interconnected to isolate  
**Evidence**: Atmospheric, humidity, thermal calculations all depend on shared cooling state  
**Lesson**: **Cooling calculations require fundamental architectural redesign**, not surgical fixes

### **❌ Dual Cooling State Objects** (September 2024 - BROKE HEATING)

**Attempted**: Create separate `targetCoolingState` and `referenceCoolingState` objects  
**Result**: ❌ **Broke heating calculations** - lost atmospheric/humidity values when reassigning coolingState  
**Lesson**: Cooling state is too interconnected with heating calculations to split cleanly

### **❌ Comprehensive S10 Pattern Standardization** (September 10, 2024 - BROKE EXCEL PARITY)

**Attempted**: Apply S10 proven pattern to all S13 field reading at once  
**Result**: ❌ **Broke Excel parity** - e_10 = 152.3 instead of 211.6, fundamental calculation drift  
**Lesson**: S13 complexity requires incremental, field-by-field testing to preserve Excel parity  
**Evidence**: Broad changes alter core calculation behavior, violating "never assume calculation errors" principle

---

## 🔬 **CURRENT UNDERSTANDING: ATOMIC UPDATE TIMING ISSUE** (December 2024)

### **🎯 Breakthrough Pattern Identified:**

**Before S14 Fix**:

- **Safari**: Correct timing → h_10 = 93.6 ✅
- **Chrome**: Fast execution → wrong values → h_10 ≠ 93.6 ❌

**After S14 Fix**:

- **Both Safari & Chrome**: Consistent behavior → both need "cooling bump" to reach h_10 = 93.6
- **Progress**: Inconsistent → consistent (but still wrong until cooling bump)

### **🔧 Root Cause: S13 Internal State Synchronization**

**Evidence from Logs**:

- **S13 Reference calculations**: Use "Volume Constant" ✅ (correct)
- **S13 Target calculations**: Still use "Volume by Schedule" ❌ (wrong)
- **This proves**: g_118 dropdown change not properly synchronizing S13's internal Target state

### **🎯 Fix Target: S13 getFieldValue() Violations**

**Critical Lines Identified** (from detailed violations table):

- **Line 859**: `getFieldValue("g_118")` → should use `TargetState.getValue("g_118")`
- **Line 2638**: `getFieldValue("g_118")` → should use `TargetState.getValue("g_118")`
- **Line 2647**: `getFieldValue("l_118")` → should use `TargetState.getValue("l_118")`

**Theory**: These violations cause S13 Target calculations to read stale DOM/StateManager values instead of current TargetState values after dropdown changes.

---

## 🧩 **COOLING COMPLEXITY ANALYSIS** (Historical Context)

### **🔬 Why g_118 is Uniquely Complex:**

**Unlike other S13 fields, g_118 affects a shared coolingState object that contains:**

- **Atmospheric calculations** (pressure, temperature)
- **Humidity calculations** (psychrometric properties)
- **Thermal calculations** (heat transfer coefficients)
- **Ventilation method routing** (`coolingState.ventilationMethod`)

**The Challenge**: Both Target and Reference engines share the same `coolingState` object, causing contamination when g_118 changes affect the shared `ventilationMethod` property.

### **🔧 Architectural Implication:**

**Based on previous failed attempts**, g_118 dual-state isolation may require **v4.012 framework approach** with tuple-based calculations rather than incremental fixes to the current shared cooling state architecture.

**Current Strategy**: Attempt incremental getFieldValue() fixes first, but prepare for fundamental cooling architecture redesign if needed.

## 📊 **IMPLEMENTATION ROADMAP**

### **🎯 Immediate Next Steps:**

1. **Fix S13 getFieldValue() violations** at lines 859, 2638, 2647
2. **Test g_118 state synchronization** after fixes
3. **Validate cooling bump elimination** in both browsers
4. **If incremental fixes fail**: Consider v4.012 framework approach for cooling architecture

### **🏆 Success Metrics:**

- **h_10 = 93.6 consistently** without cooling bump requirement
- **g_118 changes only affect Target mode** when S13 in Target mode
- **State isolation maintained** across all S13 fields (rows 113-124)

### **📋 Documentation Status:**

- **✅ S15-FIX.md**: Moved to history (completed)
- **✅ Workplan**: Reorganized with clear completed/active/failed sections
- **✅ Progress**: S14 contamination fix documented as major breakthrough
- **🎯 Focus**: Clear priority on g_118 atomic timing issue

---

**This unified workplan now provides a complete roadmap for completing S13 dual-state architecture with clear historical context and focused next steps.**

- **Shared coolingState object**: `coolingState.ventilationMethod` used by both engines
- **Contamination vector**: Target engine sets value, Reference engine inherits contaminated value
- **Complex cooling interdependencies**: coolingState contains atmospheric, humidity, thermal calculations

---

## 🔬 **COOLING DEPENDENCY ANALYSIS**

### **g_118 Direct Dependencies:**

- **d_120** (Volumetric Ventilation Rate): Calculated in `calculateVentilationRates()`
- **h_124** (Free Cooling Potential): Calculated in `calculateFreeCooling()`

### **Cooling State Dependencies (Complex Chain):**

```
g_118 → coolingState.ventilationMethod → multiple cooling functions → atmospheric calculations → humidity calculations → thermal calculations
```

**The Challenge**: Cooling calculations are **deeply interconnected** - isolating one value breaks the entire cooling physics chain.

### **Evidence from Detective Logging:**

```
[S13 DETECTIVE] calculateFreeCooling: mode=reference, ventMethod="Volume Constant"  ✅ CORRECT
[S13 DETECTIVE] isReferenceCalculation=true, coolingState.ventilationMethod="Volume by Schedule"  ❌ CONTAMINATED!
```

**This proves**: Pattern 1 mode-aware reading works, but **shared coolingState object** gets contaminated.

---

## 🧪 **ATTEMPTED SOLUTIONS & LESSONS LEARNED**

### **❌ ATTEMPT 1: Dual Cooling.js Modules (Over-engineered)**

**Approach**: Create separate `Cooling.js` and `Cooling-Reference.js` modules
**Result**: **Over-complex** - S13 has internalized cooling calculations, doesn't use external modules
**Lesson**: Understand existing architecture before adding complexity

### **❌ ATTEMPT 2: Isolated Cooling State Objects (Broke Heating)**

**Approach**: Create `targetCoolingState` and `referenceCoolingState` objects
**Result**: **Broke heating calculations** - reassigning `coolingState` reference lost calculated atmospheric/humidity values
**Lesson**: Cooling state is too interconnected to isolate cleanly

### **✅ ATTEMPT 3: Pattern 1 Framework (Partial Success)**

**Approach**: Implement temporary mode switching in calculation engines
**Result**: **Works for simple fields** (d_113, d_116, d_118) but **fails for complex shared objects**
**Lesson**: Pattern 1 works when fields are read directly, fails when shared objects are involved

---

## 🎯 **STRATEGIC SOLUTIONS (RANKED BY VIABILITY)**

### **🏆 OPTION 1: SURGICAL g_118 FUNCTION ISOLATION (RECOMMENDED - FAILED SEPT 08, 2025)**

**Approach**: Fix **only the specific functions** that read g_118, bypass shared coolingState.

**Implementation Strategy**:

```javascript
// ✅ SURGICAL: In calculateVentilationRates()
const ventMethod = isReferenceCalculation
  ? ReferenceState.getValue("g_118")
  : TargetState.getValue("g_118");
// Don't use coolingState.ventilationMethod

// ✅ SURGICAL: In calculateFreeCooling()
const ventilationMethod = isReferenceCalculation
  ? ReferenceState.getValue("g_118")
  : TargetState.getValue("g_118");
// Don't use coolingState.ventilationMethod
```

**Advantages**:

- ✅ **Minimal risk**: Only touches g_118 reading, preserves all other cooling logic
- ✅ **Surgical precision**: Fixes contamination vector without side effects
- ✅ **Follows working pattern**: Same approach as d_113, d_116, d_118
- ✅ **Preserves cooling complexity**: All atmospheric/humidity/thermal calculations untouched

**Implementation Steps**:

1. **Target-only test**: Implement surgical fix for Target engine only
2. **Verify no regression**: Test heating systems, cooling systems still work
3. **Add Reference support**: Extend fix to Reference engine
4. **Complete testing**: Verify g_118 state isolation achieved

### **⚖️ OPTION 2: TARGET-FIRST COOLING PATHWAY (YOUR SUGGESTION)**

**Approach**: Implement isolated cooling **for Target calculations only** first, then tackle Reference.

**Implementation Strategy**:

```javascript
// Phase 1: Target-only isolation
function calculateTargetModel() {
  const originalMode = ModeManager.currentMode;
  ModeManager.currentMode = "target";

  // Create Target-specific cooling context
  const targetCoolingContext = { ...coolingState };
  targetCoolingContext.ventilationMethod = TargetState.getValue("g_118");

  // Use isolated context for Target calculations only
  runTargetCoolingCalculations(targetCoolingContext);

  ModeManager.currentMode = originalMode;
}
```

**Advantages**:

- ✅ **Incremental approach**: Solve Target isolation first
- ✅ **Lower risk**: Reference calculations unchanged initially
- ✅ **Test-driven**: Verify Target isolation before tackling Reference complexity

### **❌ OPTION 3: COMPLETE COOLING REDESIGN (HIGH RISK)**

**Approach**: Redesign entire cooling architecture with dual-state from ground up.

**Why Not Recommended**:

- ❌ **High complexity**: Cooling calculations are extremely interconnected
- ❌ **Regression risk**: Could break working heating/cooling functionality
- ❌ **Time investment**: Weeks of work for one dropdown field
- ❌ **Over-engineering**: Disproportionate effort for remaining issue

---

## 📋 **RECOMMENDED IMPLEMENTATION PLAN**

### **Phase 1: Surgical g_118 Isolation (Target-First)**

**Timeline**: 1-2 hours  
**Risk**: Low  
**Approach**: Fix g_118 reading in Target calculations only

**Steps**:

1. **Identify contamination points**: Functions that read `coolingState.ventilationMethod`
2. **Replace with direct state reading**: Use `TargetState.getValue("g_118")` in Target calculations
3. **Test Target isolation**: Verify g_118 Target changes don't affect Reference
4. **Preserve Reference behavior**: Leave Reference calculations unchanged initially

### **Phase 2: Reference g_118 Integration**

**Timeline**: 1 hour  
**Risk**: Medium  
**Approach**: Extend fix to Reference calculations

**Steps**:

1. **Add Reference g_118 reading**: Use `ReferenceState.getValue("g_118")` in Reference calculations
2. **Test complete isolation**: Verify both Target and Reference g_118 independence
3. **Validate calculation accuracy**: Ensure no Excel parity regression

### **Phase 3: Documentation & Completion**

**Timeline**: 30 minutes  
**Risk**: Low  
**Approach**: Document success pattern and update workplans

**Steps**:

1. **Update 4012-CHEATSHEET.md**: Add g_118 surgical fix pattern
2. **Update S13-UNIFIED-WORKPLAN.md**: Mark g_118 issue as resolved
3. **Create success template**: Pattern for future complex shared object issues

---

## 🎯 **SUCCESS CRITERIA**

### **Target Isolation Test:**

- [ ] Target g_118 change → h_10 updates, e_10 stays stable ✅
- [ ] Heating systems still work (Gas/Oil/Heatpump/Electricity) ✅
- [ ] Cooling systems still work (Cooling/No Cooling) ✅
- [ ] Ventilation efficiency still works (d_118 slider) ✅

### **Complete Isolation Test:**

- [ ] Reference g_118 change → e_10 updates, h_10 stays stable ✅
- [ ] Both modes maintain independent g_118 values ✅
- [ ] Excel parity maintained (h_10 ≈ 93.6 for Heatpump) ✅
- [ ] No calculation regression in any S13 field ✅

---

## 📚 **ARCHITECTURAL INSIGHTS**

### **Why g_118 is Different:**

1. **Shared Object Dependency**: Unlike other fields, g_118 affects shared `coolingState` object
2. **Complex Cooling Physics**: Cooling calculations involve atmospheric, humidity, thermal interdependencies
3. **Multiple Usage Points**: g_118 affects multiple calculation chains (d_120, h_124, cooling ventilation)

### **Pattern 1 Limitations:**

- ✅ **Works for direct state reading**: Fields read directly from state objects
- ❌ **Fails for shared objects**: When multiple engines share the same object reference
- 🎯 **Solution**: **Surgical bypass of shared objects** for contamination-prone values

### **Success Pattern for Complex Fields:**

```javascript
// ✅ SURGICAL PATTERN: Bypass shared objects for contamination-prone fields
function calculateComplexFunction(isReferenceCalculation = false) {
  // Read directly from state, bypass shared object
  const contaminationProneValue = isReferenceCalculation
    ? ReferenceState.getValue("fieldId")
    : TargetState.getValue("fieldId");

  // Use direct value, not shared object property
  // Keep all other shared object logic unchanged
}
```

---

## 🔧 **IMPLEMENTATION READINESS**

**Current State**: Ready for **Option 1 (Surgical g_118 Isolation)**

**Next Steps**:

1. **Map exact g_118 usage points** in S13 functions
2. **Implement Target-first surgical fix**
3. **Test Target isolation thoroughly**
4. **Extend to Reference calculations**
5. **Complete dual-state g_118 isolation**

**Expected Outcome**: **Complete S13 dual-state compliance** with all fields (rows 113-124) having perfect state isolation.

---

**This represents the final piece of the S13 dual-state architecture puzzle.** 🧩

---

## 📝 **POST-IMPLEMENTATION FINDINGS (Sept 9 2025 Session)**

### **What We Attempted:**

#### **Phase 1: Surgical ACH Isolation**

- **Implemented**: Replaced all `getFieldValue()` calls with `getSectionValue()` for l_118, d_119, l_119, k_120
- **Result**: ❌ ACH contamination persisted, values still mixed between modes
- **Why it Failed**: The contamination was happening at a deeper level than just the read operations

#### **Phase 2: Isolated Cooling Contexts**

- **Implemented**: Created `createIsolatedCoolingContext()` to separate Target and Reference cooling states
- **Result**: ✅ Fixed ACH contamination BUT ❌ broke calculation accuracy
- **Side Effects**:
  - h_10 drifted from expected 93.6 to 94.5 initially, then to 99.3
  - e_10 showed unexpected value of 152.3
  - Cooling calculations (j_116) showed wrong values (2.66 instead of 3.3)

#### **Phase 3: Ventilation Handler Fixes**

- **Implemented**:
  - Made k_120 handler use `ModeManager.setValue()` instead of direct StateManager
  - Added missing StateManager listeners for k_120
  - Changed all ventilation listeners to call `calculateAll()` instead of individual functions
- **Result**: ❌ No improvement in state persistence, calculations further degraded
- **Why it Failed**: The changes triggered calculation storms and interfered with the original flow

### **Root Causes of Failure:**

1. **Architectural Mismatch**: S13 was designed with shared state assumptions that are fundamentally incompatible with dual-state architecture. The cooling calculations are deeply interconnected through the shared `coolingState` object.

2. **Calculation Chain Complexity**: Each fix created ripple effects through the calculation chain. Fixing one contamination point often exposed or created others.

3. **Mode Switching Timing**: The Pattern 1 temporary mode switching approach works for simple fields but fails when complex shared objects (like `coolingState`) are involved.

4. **Baseline Drift**: The OFFLINE version we rolled back to correctly produced the expected e_10=211.6 and h_10 = 93.6.

### **Key Insights:**

1. **Shared Object Problem**: The fundamental issue is that both Target and Reference engines share the same `coolingState` object. Any attempt to isolate values within this shared context creates inconsistencies.

2. **Whack-a-Mole Pattern**: We were fixing symptoms (individual field contaminations) rather than the root cause (shared state architecture).

3. **Incremental Fixes Break**: Unlike other sections, S13's cooling calculations are so tightly coupled that incremental fixes tend to break more than they fix.

### **Recommendations for Future Attempts:**

**Update (Sept 10, 2025):** The UI persistence issues for `l_118` (ACH), `l_119` (Summer Boost), and `k_120` (Unoccupied Setback) have been successfully resolved. The fix involved correcting the `setDefaults` functions in both `TargetState` and `ReferenceState` and completing the `fieldsToSync` array and display logic in `ModeManager.refreshUI`. This resolves the state bleeding and ensures these fields persist correctly across mode switches.

2. **Document Baseline**: Restored S13 version that produces the correct h_10 and e_10 values before attempting any dual-state fixes. (Current S13 is correct, Sept 09, 10.32am, 2025)

3. **Consider Alternative Architecture**: The shared `coolingState` object may need to be completely redesigned rather than patched. Consider creating separate cooling modules for Target and Reference from the ground up.

4. **Limit Scope**: Focus on one specific issue at a time (e.g., just l_118 persistence) and ensure it works completely before moving to the next.

### **Why This Exceeds Current Context:**

The complexity of S13 with its integrated cooling physics, atmospheric calculations, humidity calculations, and thermal interdependencies creates a web of dependencies that is difficult to untangle within a conversational debugging context. Each attempted fix revealed new layers of complexity and interdependency that weren't apparent from the initial analysis.

The section appears to require a fundamental architectural redesign rather than surgical fixes to achieve true dual-state compliance.
