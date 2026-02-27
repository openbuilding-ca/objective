# S04-REPAIR.md: State Mixing Fix Using Proven Architecture

## 🎯 **PROBLEM CONFIRMED**

**Root Cause**: S04 uses a **Function Override Pattern** that fails when Reference listeners trigger calculations outside the override scope.

**Evidence from Logs (Line 1488)**:

```
[S01DB] upstream snapshot {ref_j_32: 229309.58900641365, ref_k_32: 8255.145204230892, j_32: 162035.12770869245, k_32: 8263.791513143315}
```

**State Mixing**: Both Target (`j_32`) and Reference (`ref_j_32`) values change when S10 area input changes in Target mode.

## 🚨 **CRITICAL FUNCTION TO PRESERVE: Smart Grid Intensity Pattern**

**⚠️ MUST NOT BREAK**: S04's sophisticated emissions factor system has been broken multiple times and is **critical for total emissions calculations** in S04, S01, and S15.

### **🔧 Smart Grid Intensity Architecture (PRESERVE EXACTLY):**

**1. Complete Ontario XLOOKUP Equivalent:**

```javascript
const GRID_INTENSITY_FACTORS = {
  ON: { default: 51, 2015: 46, 2016: 40, 2017: 18 /* ... */ },
  AB: { default: 650 }, // Year-independent
  BC: { default: 12 }, // Year-independent
  // ... other provinces
};
```

**2. Mode-Aware Emission Factor Lookup:**

```javascript
function getElectricityEmissionFactor(isReferenceCalculation = false) {
  if (isReferenceCalculation) {
    provinceRaw = getGlobalStringValue("ref_d_19") || "ON";
    year = getGlobalNumericValue("ref_h_12") || 2022;
  } else {
    provinceRaw = getGlobalStringValue("d_19") || "ON";
    year = getGlobalNumericValue("h_12") || 2022;
  }
  return getElectricityFactor(province, year);
}
```

**3. Critical Dual-State Listeners (MUST PRESERVE):**

```javascript
// Target mode listeners
StateManager.addListener("d_19", () => calculateAll()); // Province → emission factors
StateManager.addListener("h_12", () => calculateAll()); // Year → Ontario factors

// Reference mode listeners
StateManager.addListener("ref_d_19", () => calculateReferenceModel()); // Ref province
StateManager.addListener("ref_h_12", () => calculateReferenceModel()); // Ref year
```

**Key Behaviors:**

- **Ontario + Year**: Updates based on S02 reporting year (2015-2041+ lookup table)
- **Other Provinces**: Year-independent values (AB=650, BC=12, etc.)
- **Perfect dual-state isolation**: Target and Reference use separate province/year values
- **Real-time updates**: Responds immediately to S02/S03 changes

**Why This is Critical:**

- **S04 total emissions** (j_32, k_32) depend on accurate emission factors
- **S01 dashboard** (h_10, e_10) displays these totals
- **S15 ratios** (d_145) compare Target vs Reference emissions
- **Regulatory compliance**: Accurate emission factors essential for code compliance

---

## 🏗️ **ARCHITECTURE COMPLIANCE (README.md)**

**README.md Section 8**: "Follow the established dependency order" and "use standardized helper"
**README.md Pattern**: "setCalculatedValue("cf_d_12", result); // Helper handles state and formatting"

**✅ PROVEN SUCCESSFUL PATTERN**: S02, S05, S06, S07, S09, S12, S13 all use **mode-aware storage** via temporary mode switching.

---

## 🚨 **WHY S04-GEMINI-FINDINGS.md FAILED**

**The Previous Approach**:

1. ❌ **Created new methods** (`runCalculations(isReferenceCalculation)`)
2. ❌ **Added parameter passing** through entire calculation chain
3. ❌ **Broke existing calculation functions** that were working
4. ❌ **Ignored proven S02 pattern** that works in 7+ sections

**Result**: "CRASH AND BURN" - destroyed calculations entirely

---

## ✅ **PROVEN SOLUTION: S02 Pattern (Keep What Works)**

**Use the EXACT same pattern that works in S02, S05, S06, S07, S09, S12, S13:**

### **Step 1: Replace Function Override with Mode-Aware Storage**

**Current S04 (BROKEN)**:

```javascript
// ❌ ANOMALY: Function override pattern
function calculateReferenceModel() {
  const originalSetCalculatedValue = setCalculatedValue;
  setCalculatedValue = setReferenceCalculatedValue; // Hijack global function

  runCalculations(); // Hope the override works

  setCalculatedValue = originalSetCalculatedValue; // Restore
}
```

**Fixed S04 (S02 PATTERN)**:

```javascript
// ✅ PROVEN: S02 mode-aware pattern
function calculateReferenceModel() {
  // Temporarily switch to reference mode during calculations
  const originalMode = ModeManager.currentMode;
  ModeManager.currentMode = "reference";

  runCalculations(); // All setFieldValue() calls go to Reference state

  ModeManager.currentMode = originalMode; // Restore
}
```

### **Step 2: Replace setCalculatedValue() with setFieldValue()**

**Use S02's proven `setFieldValue()` function**:

```javascript
// ✅ S02 PATTERN: Mode-aware storage (no parameters, no confusion)
function setFieldValue(fieldId, value, fieldType = "calculated") {
  // Uses ModeManager.currentMode to determine destination
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

---

## 🎯 **IMPLEMENTATION PLAN (README.md COMPLIANT)**

### **Phase 1: Minimal Function Replacement (No New Methods)**

1. Copy S02's `setFieldValue()` function exactly (proven pattern)
2. Replace all `setCalculatedValue()` calls with `setFieldValue()` calls
3. Remove parameters from `setFieldValue()` calls (no more `formatType`)

### **Phase 2: Mode-Aware Calculation Engines**

1. Update `calculateTargetModel()` to temporarily set `ModeManager.currentMode = "target"`
2. Update `calculateReferenceModel()` to temporarily set `ModeManager.currentMode = "reference"`
3. Remove the function override pattern entirely

### **Phase 3: Test and Validate**

1. Test area input (d_74) - should only affect h_10, not e_10
2. Test dropdown input (d_80) - should continue working as before
3. Verify S04 calculations remain Excel-compliant

---

## 🚨 **CRITICAL SUCCESS FACTORS**

### **DO NOT REPEAT S04-GEMINI-FINDINGS.md MISTAKES:**

1. ❌ **NO new methods** - use proven S02 pattern exactly
2. ❌ **NO parameter passing** - S02 uses mode-aware storage instead
3. ❌ **NO breaking calculation functions** - keep all calculation logic intact
4. ❌ **NO ignoring proven patterns** - S02 works in 7+ sections

### **✅ FOLLOW README.md PRINCIPLES:**

1. ✅ **Use standardized helper** (`setFieldValue` like S02)
2. ✅ **Follow established dependency order** (don't change calculation sequence)
3. ✅ **Sections communicate through StateManager** (maintain existing listeners)
4. ✅ **No direct module references** (keep StateManager as communication layer)

---

## 📋 **TESTING PROTOCOL**

### **Before Implementation:**

- Fresh browser load
- Enter 1000 in d_74 → Both e_10 and h_10 change ❌

### **After Implementation:**

- Fresh browser load
- Enter 1000 in d_74 → Only h_10 changes ✅
- Enter d_80 dropdown → Only h_10 changes ✅ (should continue working)

### **Validation:**

- All S04 calculations remain Excel-compliant
- No calculation logic changes - only storage mechanism changes
- S01 state mixing eliminated

---

## 🔄 **ROLLBACK PLAN**

**Safe Restore Point**: Current commit with Time Machine S04 file
**If Issues**: `git reset --hard HEAD~1` to restore working S04
**Documentation**: This document preserved for future reference

---

## 💡 **ARCHITECTURAL INSIGHT**

**The Real Lesson**: Consumer sections (S04, S01, S14, S15) need the **same mode-aware storage patterns** as producer sections (S02, S05, etc.). The "Function Override Pattern" was a clever workaround, but it creates brittle edge cases when listeners trigger calculations outside the override scope.

**The S02 pattern eliminates these edge cases entirely** by making storage inherently mode-aware, not context-dependent.
