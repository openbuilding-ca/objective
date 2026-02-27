# S11 TRANSMISSION LOSSES - CRITICAL FIXES (REVISED)

**Date**: August 11, 2025 (Post-Debug Session)  
**Status**: **COMPLEX STATE CONTAMINATION** - Multiple Root Causes Identified  
**Goal**: Fix S11 dual-state architecture violations causing persistent state mixing

---

## 🚨 **CRITICAL DISCOVERY: MULTIPLE ARCHITECTURAL VIOLATIONS**

### **Enhanced Root Cause Analysis**

After extensive debugging with diagnostic logging, we've discovered this is **NOT** a simple display issue, but **fundamental dual-engine state isolation failures** with multiple interconnected root causes.

### **The REAL Problems:**

1. **🔥 PRIMARY**: Target calculations read Reference state when UI is in Reference mode
2. **🔥 SECONDARY**: Target calculations write to Reference state when UI is in Reference mode
3. **🔥 TERTIARY**: Incomplete display update coverage for component calculated fields

---

## 📊 **CONCRETE EVIDENCE FROM DEBUG LOGS**

### **The Smoking Gun: Math Proof of Contamination**

**Logs showed**: `🚨 [S11] TARGET RESULTS STORED: i_97=23812.91, i_98=119064.57`

**Math Check**: `23812.91 ÷ 119064.57 = 0.20` = **20%** (Target TB%)

**What's happening**:

- ✅ Reference model calculates correctly: `ref_i_97=89298.43`
- ❌ **Target model uses WRONG inputs**: `119064.57` (Reference `i_98`) × `20%` (Target TB%) = `23812.91`

**ROOT CAUSE**: Target calculations reading Reference component totals instead of Target component totals!

### **Contamination Flow Both Ways**:

- Target calculations use Reference `i_98` values when UI is in Reference mode
- Target results (`23812.91`) get written to Reference state, overwriting correct Reference calculations
- Display in Reference mode reads this contaminated value

---

## 🎯 **SURGICAL FIX STRATEGY (SEQUENTIAL ONLY)**

### ⚠️ **CRITICAL WARNING**: EXACT SEQUENCE REQUIRED

These fixes are **interdependent** and must be applied in **exact sequence** with testing after each step. **Previous attempts failed because we applied them in bulk or out of order.**

---

### **STEP 1**: Fix Target State Read Contamination

**Priority**: **CRITICAL** (Root cause of 23,812.91)  
**Risk**: LOW (Only changes Target calculation inputs)  
**Location**: `calculateTargetModel()` around lines 1456-1458

**The Problem**:

```javascript
// ❌ CURRENT (Reads based on UI mode)
const heatloss = getNumericValue(`i_${config.row}`) || 0;
// When UI mode = "reference" → reads Reference values!
```

**The Fix**:

```javascript
// ✅ TARGET FIX (Always reads Target state)
const area =
  window.TEUI.parseNumeric(TargetState.getValue(`d_${config.row}`)) || 0;
const heatloss =
  window.TEUI.parseNumeric(TargetState.getValue(`i_${config.row}`)) || 0;
const heatgain =
  window.TEUI.parseNumeric(TargetState.getValue(`k_${config.row}`)) || 0;
```

**Also fix TB penalty reads** around lines 1473-1474:

```javascript
// ✅ TARGET PENALTY FIX
const penaltyHeatlossI =
  window.TEUI.parseNumeric(TargetState.getValue("i_97")) || 0;
const penaltyHeatgainK =
  window.TEUI.parseNumeric(TargetState.getValue("k_97")) || 0;
```

**🧪 STEP 1 TEST - MUST PASS BEFORE STEP 2**:

- Switch S11 to Reference mode, adjust TB% slider
- ✅ **MUST VERIFY**: No more 23,812.91 values appear anywhere
- ✅ **MUST VERIFY**: Target calculations use Target component totals (i_98 ≈ 77,409)
- ❌ **MAY STILL SEE**: UI shows Target values in Reference mode (fixed in Step 3)
- ❌ **MAY STILL SEE**: Some state mixing (fixed in Step 2)

**🚨 DO NOT PROCEED TO STEP 2 UNTIL STEP 1 WORKS CORRECTLY**

---

### **STEP 2**: Fix setCalculatedValue() Write Contamination

**Priority**: **HIGH** (Prevents Target→Reference overwrites)  
**Risk**: MEDIUM (Changes where Target calculations write)  
**Location**: `setCalculatedValue()` around line 871

**The Problem**:

```javascript
// ❌ CURRENT (Routes based on UI mode)
ModeManager.setValue(fieldId, rawValue.toString(), "calculated");
// When UI mode = "reference" → writes to ReferenceState!
```

**The Fix**:

```javascript
// ✅ TARGET WRITE FIX (Always writes to Target state + StateManager)
TargetState.setValue(fieldId, rawValue.toString(), "calculated");
window.TEUI.StateManager.setValue(fieldId, rawValue.toString(), "calculated");
```

**🧪 STEP 2 TEST - MUST PASS BEFORE STEP 3**:

- Test mode switching and slider adjustments in both modes
- ✅ **MUST VERIFY**: Reference mode changes don't affect Target TEUI (h_10)
- ✅ **MUST VERIFY**: Target mode changes don't affect Reference TEUI (e_10)
- ✅ **MUST VERIFY**: No contamination of Reference state by Target calculations

**🚨 DO NOT PROCEED TO STEP 3 UNTIL STEP 2 WORKS CORRECTLY**

---

### **STEP 3**: Expand Display Update Coverage

**Priority**: MEDIUM (UI display completeness)  
**Risk**: LOW (Only affects display logic)  
**Location**: `updateCalculatedDisplayValues()` around line 368

**The Problem**:

```javascript
// ❌ CURRENT (Only totals)
const calculatedFields = ["i_97", "k_97", "d_98", "i_98", "k_98"];
```

**The Fix**:

```javascript
// ✅ DISPLAY COVERAGE FIX (All calculated fields)
const calculatedFields = [
  // Component calculated fields (rows 85-95)
  "i_85",
  "k_85",
  "i_86",
  "k_86",
  "i_87",
  "k_87",
  "i_88",
  "k_88",
  "i_89",
  "k_89",
  "i_90",
  "k_90",
  "i_91",
  "k_91",
  "i_92",
  "k_92",
  "i_93",
  "k_93",
  "i_94",
  "k_94",
  "i_95",
  "k_95",
  // TB penalty and totals (rows 97-98)
  "i_97",
  "k_97",
  "d_98",
  "i_98",
  "k_98",
];
```

**🧪 STEP 3 TEST - FINAL VERIFICATION**:

- Switch to Reference mode
- ✅ **MUST VERIFY**: ALL calculated fields show Reference values (not zeros)
- ✅ **MUST VERIFY**: Component rows (85-95) show Reference calculated values
- ✅ **MUST VERIFY**: Totals rows (97-98) show Reference calculated values

---

## 🧪 **COMPREHENSIVE TEST PROTOCOL**

### **Pre-Test Baseline (MANDATORY)**

1. **Revert to clean state**: `git restore sections/4011-Section11.js`
2. **Document baseline values** in both Target and Reference modes
3. **Confirm issue exists**: Reference mode shows stale 23,812.91

### **After EACH Step**

**STEP 1 Success Criteria**:

- [ ] No 23,812.91 values appear in logs or UI
- [ ] Target calculations use Target i_98 (≈77,409), not Reference i_98 (≈119,064)
- [ ] Logs show: `TARGET RESULTS STORED: i_97=15481.99` (not 23812.91)

**STEP 2 Success Criteria**:

- [ ] Reference mode TB% changes → only Reference TEUI (e_10) changes
- [ ] Target mode TB% changes → only Target TEUI (h_10) changes
- [ ] No cross-contamination between Target and Reference states

**STEP 3 Success Criteria**:

- [ ] Reference mode shows Reference values for ALL calculated fields
- [ ] Component % heatloss values are NOT zero in Reference mode
- [ ] Both component rows and totals display correctly

### **Final Integration Test**

1. **Target Mode Test**: TB% 20% → 30%

   - ✅ Target TEUI (h_10) changes appropriately
   - ❌ Reference TEUI (e_10) unchanged
   - ✅ All S11 Target fields update correctly

2. **Reference Mode Test**: TB% 75% → 80%

   - ✅ Reference TEUI (e_10) changes appropriately
   - ❌ Target TEUI (h_10) unchanged
   - ✅ All S11 Reference fields show Reference values (not zeros)

3. **State Isolation Test**:
   - Switch between modes → each shows its own calculated values
   - Mode changes alone don't trigger calculations
   - Cross-section dependencies work correctly

---

## 🚨 **FAILURE MODES TO AVOID**

### **CRITICAL: What NOT To Do**

1. **❌ Bulk Application**: Applying all fixes at once without testing each step
2. **❌ Out of Sequence**: Applying Step 3 before Step 1 WILL break display logic
3. **❌ Incomplete Reversion**: Not fully reverting before starting compounds issues
4. **❌ Premature Optimization**: Adding diagnostic logging during fixes

### **We've Already Failed These Ways**:

- Applied fixes in bulk → created new bugs while fixing others
- Mixed architectural changes with bug fixes → impossible to isolate issues
- Modified working functions based on assumptions → broke core calculations

---

## 🔄 **ROLLBACK PROTOCOL**

**If ANY step causes regression**:

1. **IMMEDIATE REVERT**: `git restore sections/4011-Section11.js`
2. **IDENTIFY ISSUE**: Determine which specific change caused the problem
3. **INCREMENTAL RETRY**: Apply only the working fixes from previous steps
4. **NO COMBINED ATTEMPTS**: This approach has already failed multiple times

**Commit Strategy**: Only commit after ALL THREE steps work correctly together

---

## 💡 **ARCHITECTURAL INSIGHTS**

### **Key Learning from This Session**

**The Fundamental Problem**: S11's dual-engine implementation violates state sovereignty by using UI-mode-dependent functions (`getNumericValue()`, `ModeManager.setValue()`) within calculation engines.

**Best Practice Discovery**: Calculation engines should be **mode-agnostic**:

```javascript
// ✅ CORRECT PATTERN
function calculateTargetModel() {
  // Always read from TargetState, regardless of UI mode
  const value = TargetState.getValue(fieldId);

  // Always write to TargetState + StateManager, regardless of UI mode
  TargetState.setValue(fieldId, result);
  window.TEUI.StateManager.setValue(fieldId, result);
}

function calculateReferenceModel() {
  // Always read from ReferenceState, regardless of UI mode
  const value = ReferenceState.getValue(fieldId);

  // Always write to ReferenceState + ref_ StateManager, regardless of UI mode
  ReferenceState.setValue(fieldId, result);
  window.TEUI.StateManager.setValue(`ref_${fieldId}`, result);
}
```

**UI Layer Should Be Mode-Aware**:

```javascript
// ✅ CORRECT: Only UI/display logic uses ModeManager
function updateCalculatedDisplayValues() {
  const value =
    this.currentMode === "reference"
      ? window.TEUI.StateManager.getValue(`ref_${fieldId}`)
      : window.TEUI.StateManager.getValue(fieldId);
}
```

### **Why This Matters**

This architectural violation pattern likely exists in other sections. The S11 fix serves as a **template for identifying and fixing similar state contamination issues** throughout the codebase.

---

## 📝 **SESSION SUCCESS CRITERIA**

- ✅ **No 23,812.91**: This specific contaminated value never appears
- ✅ **State Isolation**: Target/Reference calculations use their own state exclusively
- ✅ **Complete Display**: All calculated fields update based on current mode
- ✅ **Cross-Section Flow**: Downstream sections receive correct values
- ✅ **No Regressions**: Target mode calculations remain stable

**If ALL criteria met**: We've solved the core dual-state architecture violation in S11 and established a pattern for fixing similar issues in other sections.

---

**End of Revised S11 Fixes Workplan**
