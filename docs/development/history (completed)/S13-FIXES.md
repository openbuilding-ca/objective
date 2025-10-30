# S13-FIXES.md: SURGICAL RESTORATION WORKPLAN

**Section 13 (Mechanical Loads) - Critical Launch Week Recovery**

## 🎯 **MISSION CRITICAL OBJECTIVE**

Restore S13 to 100% Excel parity for Target pathway, then achieve Reference pathway accuracy.
**Timeline: 1 week to launch** - This is the summit of Everest for this app.

---

## 📊 **AUDIT FINDINGS: WORKING 13.js vs BROKEN A31.js**

| **DUAL-STATE-CHEATSHEET.md PHASE**      | **WORKING 13.js**                           | **BROKEN A31.js**           |
| --------------------------------------- | ------------------------------------------- | --------------------------- |
| **Phase 1: Pattern B**                  | ✅ CLEAN                                    | ✅ CLEAN                    |
| **Phase 2: Current State Anti-Pattern** | ❌ **19 getFieldValue() violations**        | ✅ **FIXED (only 3 left)**  |
| **Phase 3: DOM Updates**                | ❓ **UNKNOWN**                              | ✅ **FIXED**                |
| **Phase 4: switchMode**                 | ✅ **Display-only**                         | ✅ **Display-only**         |
| **Phase 5: Duplicate Defaults**         | ❓ **UNKNOWN**                              | ✅ **FIXED**                |
| **Phase 6: Mode-Aware Reading**         | ✅ **PARTIAL (has isReferenceCalculation)** | ✅ **COMPLETE**             |
| **ModeManager Export**                  | ✅ **YES**                                  | ✅ **YES**                  |
| **External Dependency Listeners**       | ✅ **PARTIAL (d*127, some ref* pairs)**     | ✅ **COMPLETE (all pairs)** |

### **🏆 DECISION: BUILD ON WORKING 13.js**

- **Rationale**: Working sliders/dropdowns + functional Target calculations = solid foundation
- **Risk**: Much lower than trying to restore A31.js functionality
- **Effort**: Surgical fixes vs complete functionality restoration

---

## 🚀 **PHASE 1: TARGET PATHWAY RESTORATION (PRIORITY 1)**

**Goal**: 100% Excel parity for Target calculations

### **STEP 1A: AUDIT TARGET CALCULATION FUNCTIONS**

**Identify which functions are broken and need restoration:**

1. **calculateHeatingSystem()** - Lines 2426-2505

   - ✅ **Status**: Has `isReferenceCalculation` parameter
   - ✅ **Mode-Aware**: Uses `getSectionValue()` for section fields
   - ❌ **Issue**: Still uses `getGlobalNumericValue()` for external deps
   - 🔧 **Fix**: Ensure Target mode reads unprefixed external values

2. **calculateCoolingSystem()** - Lines 2510-2609

   - ❌ **Issue**: Line 2514 uses `getFieldValue("d_116")` for Target
   - ❌ **Issue**: Line 2519 uses `getFieldValue("m_129")`
   - ❌ **Issue**: Line 2521 uses `getFieldValue("j_113")`
   - 🔧 **Fix**: Replace with `TargetState.getValue()` or mode-aware external reading

3. **calculateVentilationEnergy()** - Lines 2704-2730

   - ❌ **Issue**: Line 2705 uses `getFieldValue("d_120")`
   - ❌ **Issue**: Line 2706 uses `getGlobalNumericValue("d_20")` (not mode-aware)
   - 🔧 **Fix**: Make external dependency reading mode-aware

4. **calculateCoolingVentilation()** - Lines 2735-2819

   - ❌ **Issue**: Multiple `getFieldValue()` calls (lines 2740, 2741, 2742, 2743, 2744)
   - 🔧 **Fix**: Replace with mode-aware reading

5. **calculateFreeCooling()** - Lines 2824-3305
   - ❌ **Issue**: Line 2859 `getFieldValue("d_59")`
   - ❌ **Issue**: Multiple other `getFieldValue()` calls
   - 🔧 **Fix**: Mode-aware external dependency reading

### **STEP 1B: VERIFY TARGET CALCULATION CHAIN**

**Test Target pathway functions in isolation:**

- [ ] Target heating calculations match Excel
- [ ] Target cooling calculations match Excel
- [ ] Target ventilation calculations match Excel
- [ ] Target free cooling calculations match Excel

---

## 🔄 **PHASE 2: CURRENT STATE ANTI-PATTERN ELIMINATION**

**Goal**: Fix all 19 getFieldValue() violations

### **CRITICAL getFieldValue() VIOLATIONS TO FIX:**

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

### **FIX PATTERNS:**

**For Section Fields (d_113, f_113, etc.):**

```javascript
// ❌ BEFORE:
const value = getFieldValue("d_113");

// ✅ AFTER:
const value = isReferenceCalculation
  ? ReferenceState.getValue("d_113")
  : TargetState.getValue("d_113");
```

**For External Dependencies (d_59, m_19, etc.):**

```javascript
// ❌ BEFORE:
const value = getFieldValue("d_59");

// ✅ AFTER:
const value =
  window.TEUI.parseNumeric(
    isReferenceCalculation
      ? getGlobalNumericValue("ref_d_59")
      : getGlobalNumericValue("d_59"),
  ) || 0;
```

---

## 🔗 **PHASE 3: EXTERNAL DEPENDENCY LISTENER PAIRS**

**Goal**: Complete DUAL-STATE-CHEATSHEET.md Phase 2.5 compliance

### **MISSING DUAL-LISTENER PAIRS:**

```javascript
// ✅ HAS: d_127 (Target only)
// ❌ MISSING: ref_d_127 (Reference pair)

// ❌ MISSING: d_63/ref_d_63 (occupancy)
// ❌ MISSING: i_63/ref_i_63 (occupied hours)
// ❌ MISSING: j_63/ref_j_63 (total hours)
// ❌ MISSING: d_105/ref_d_105 (volume)
// ❌ MISSING: h_15/ref_h_15 (area)
```

### **LISTENER PAIR PATTERN:**

```javascript
// Target listener
sm.addListener("d_63", () => {
  if (ModeManager.currentMode === "target") {
    calculateAll();
  }
});

// Reference listener
sm.addListener("ref_d_63", () => {
  if (ModeManager.currentMode === "reference") {
    calculateAll();
  }
});
```

---

## 🧪 **PHASE 4: TESTING & VALIDATION**

**Goal**: Verify Excel parity and state isolation

### **TARGET PATHWAY TESTING:**

- [ ] **Heating System Changes**: d_113 dropdown → verify h_115, f_115, d_114, l_113
- [ ] **HSPF Slider**: f_113 → verify heating calculations
- [ ] **Cooling System**: d_116 → verify cooling calculations
- [ ] **Ventilation**: d_118, f_118 → verify ventilation energy
- [ ] **Excel Comparison**: All Target values match Excel exactly

### **REFERENCE PATHWAY TESTING:**

- [ ] **Reference Mode Switch**: No Target contamination
- [ ] **Reference Calculations**: Match Excel Reference methodology
- [ ] **State Isolation**: Reference changes only affect e_10, not h_10

---

## ⚠️ **CRITICAL SUCCESS FACTORS**

### **DO NOT BREAK:**

1. **Working Sliders**: f_113 (HSPF), f_118 (ventilation efficiency)
2. **Working Dropdowns**: d_113 (heating), d_116 (cooling), d_118 (ventilation)
3. **Ghosting Logic**: Conditional UI based on system selections
4. **Target Calculations**: Current Excel parity for Target pathway

### **MUST ACHIEVE:**

1. **State Isolation**: Reference changes don't affect Target
2. **Mode-Aware Reading**: All external dependencies read correct state
3. **Complete Listeners**: All external dependencies have Target/Reference pairs
4. **Excel Parity**: Both Target and Reference match Excel exactly

---

## 🎯 **IMPLEMENTATION STRATEGY**

### **STEP-BY-STEP APPROACH:**

1. **One Function at a Time**: Fix individual calculation functions
2. **Test After Each Fix**: Verify no regression in Target functionality
3. **Incremental Commits**: Save working state after each successful fix
4. **Excel Validation**: Compare each function's output with Excel
5. **State Isolation Testing**: Verify Reference doesn't contaminate Target

### **ROLLBACK PLAN:**

- Keep working 13.js as backup
- Test each fix thoroughly before proceeding
- Revert immediately if Target functionality breaks

---

## 📋 **NEXT STEPS**

**IMMEDIATE ACTIONS:**

1. **Function-by-Function Audit**: Identify which Target calculations are broken
2. **Surgical getFieldValue() Fixes**: Replace with mode-aware patterns
3. **External Dependency Listeners**: Add missing ref\_ pairs
4. **Excel Validation Testing**: Verify Target pathway matches Excel
5. **Reference Pathway Implementation**: Once Target is solid

**READY TO BEGIN SURGICAL FIXES** - Let's summit Everest! 🏔️
