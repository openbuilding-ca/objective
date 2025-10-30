# S13-QC-AUDIT.md: Section 13 Quality Control Analysis

## 🔍 **DUAL-STATE-CHEATSHEET.md AUDIT RESULTS**

**Date**: December 3, 2025  
**QC Framework**: 3,533 violations detected (40,643 monitor calls)  
**Focus**: Section 13 (Mechanical Loads) - Most complex HVAC section

---

## 📋 **PHASE 1: PATTERN B CONTAMINATION SCAN**

### ✅ **RESULT: CLEAN**

```bash
grep -n "target_\|ref_" sections/4011-Section13.js
# No matches found - no Pattern B prefixed contamination
```

**Status**: ✅ **PASSED** - No toxic Pattern B contamination detected

---

## 📋 **PHASE 2: ANTI-PATTERN DETECTION**

### ❌ **CRITICAL ISSUE: Missing S02 setFieldValue Pattern**

**Current S13 Pattern**:

```javascript
// ❌ USES: setCalculatedValue() (19+ instances found)
setCalculatedValue("d_117", coolingLoad_d117, "number-2dp-comma");
setCalculatedValue("f_117", intensity_f117, "number-2dp");
```

**Required S02 Pattern** (from S04-REPAIR.md):

```javascript
// ✅ SHOULD USE: setFieldValue() for mode-aware storage
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

### ❌ **CRITICAL ISSUE: No Mode-Aware Storage in Calculation Engines**

**Current S13 calculateReferenceModel()**:

```javascript
function calculateReferenceModel() {
  // ❌ PROBLEM: Still uses setCalculatedValue()
  // ❌ PROBLEM: No mode switching like S02 pattern
  const copResults = calculateCOPValues(true); // Parameter-based approach
}
```

**Required S02 Pattern**:

```javascript
function calculateReferenceModel() {
  // ✅ S02 PATTERN: Temporarily switch to reference mode
  const originalMode = ModeManager.currentMode;
  ModeManager.currentMode = "reference";

  runCalculations(); // All setFieldValue() calls go to Reference state

  ModeManager.currentMode = originalMode; // Restore
}
```

---

## 🚨 **PHASE 3: CRITICAL ARCHITECTURAL GAPS**

### **Gap 1: Missing S02 setFieldValue Implementation**

**Status**: ❌ **MISSING** - S13 still uses old `setCalculatedValue()` pattern  
**Impact**: Reference calculations likely not storing `ref_` prefixed values properly  
**Fix Required**: Copy S02's `setFieldValue()` function exactly

### **Gap 2: Parameter-Based vs Mode-Aware Approach**

**Current**: `calculateCOPValues(true)` - parameter indicates Reference calculation  
**S02 Pattern**: `calculateCOPValues()` - mode-aware storage handles Reference automatically  
**Issue**: Parameter approach is brittle and doesn't follow proven pattern

### **Gap 3: Complex Fallback Logic in getRefValue**

**Current**:

```javascript
const getRefValue = (fieldId) => {
  return (
    window.TEUI?.StateManager?.getValue(`ref_${fieldId}`) ||
    window.TEUI?.StateManager?.getReferenceValue(fieldId) ||
    0 // Fixed: no Target fallback
  );
};
```

**S02 Pattern**: Direct state access without fallbacks

```javascript
// S02 just reads from ReferenceState directly - no complex fallback logic needed
const value = ReferenceState.getValue(fieldId);
```

---

## 📊 **QC FRAMEWORK FINDINGS (3,533 Violations)**

Based on QC monitoring results, S13 likely contributes to:

### **Missing Reference Values** (2,582 violations detected)

- Missing `ref_d_117` (cooling loads for S15)
- Missing `ref_f_114` (heating emissions for S04)
- Missing `ref_m_121` (ventilation loads for S15)

### **Stale Values** (600 violations detected)

- Complex HVAC calculations not updating downstream sections
- Reference calculations not triggering properly

---

## 🎯 **RECOMMENDED FIX STRATEGY (S02 Pattern)**

### **Phase 1: Copy S02 setFieldValue Function (15 minutes)**

1. Copy exact `setFieldValue()` function from S02
2. Replace all 19+ `setCalculatedValue()` calls with `setFieldValue()`
3. Remove `formatType` parameters (S02 pattern doesn't use them)

### **Phase 2: Implement Mode-Aware Calculation Engines (30 minutes)**

```javascript
function calculateReferenceModel() {
  const originalMode = ModeManager.currentMode;
  ModeManager.currentMode = "reference";

  // All existing calculation functions work unchanged
  runIntegratedCoolingCalculations();
  const copResults = calculateCOPValues(); // Remove (true) parameter
  const heatingResults = calculateHeatingSystem(); // Remove parameters

  ModeManager.currentMode = originalMode;
}

function calculateTargetModel() {
  const originalMode = ModeManager.currentMode;
  ModeManager.currentMode = "target";

  // Same calculation functions, mode-aware storage
  runIntegratedCoolingCalculations();
  const copResults = calculateCOPValues();
  const heatingResults = calculateHeatingSystem();

  ModeManager.currentMode = originalMode;
}
```

### **Phase 3: Remove Parameter-Based Approach (20 minutes)**

1. Remove `isReferenceCalculation` parameters from all functions
2. Functions use `ModeManager.currentMode` to determine behavior
3. Simplifies function signatures and eliminates parameter-passing complexity

---

## 🧲 **QC FRAMEWORK TESTING STRATEGY**

### **Before Fix**:

Run QC Monitor → Expect ~2,500+ violations from S13 missing Reference values

### **After Fix**:

Run QC Monitor → Should see dramatic reduction in:

- `MISSING_REFERENCE_VALUE` violations
- `STALE_VALUE` violations
- `FALLBACK_READ` violations

### **Success Criteria**:

- S13 Reference values (`ref_d_117`, `ref_f_114`, `ref_m_121`) appear in StateManager
- QC violation count drops significantly
- Reference mode shows different values than Target mode

---

## 💡 **ARCHITECTURAL INSIGHT**

**S13 Status**: Has dual-state architecture foundation but **missing the proven S02 storage pattern**

**The Issue**: S13 uses complex parameter-based approach instead of the simple, proven mode-aware storage that works in S02, S05, S06, S07, S09, S12

**The Fix**: Apply exact S02 pattern - no improvisation, just proven code replication

**QC Framework Advantage**: We can now measure fix effectiveness with precise violation counting instead of guessing!

---

## 🎯 **RECOMMENDATION**

**Priority**: **HIGH** - S13 is likely the largest contributor to the 3,533 QC violations

**Approach**: Apply proven S02 pattern exactly (resist urge to "improve" it)

**Testing**: Use QC Framework to measure before/after violation counts

**Timeline**: ~65 minutes for complete S02 pattern implementation

This transforms S13 from a complex parameter-based system to a simple, mode-aware storage system that follows the proven architecture used successfully in 7+ other sections.
