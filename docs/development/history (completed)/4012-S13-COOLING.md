# 4012-S13-COOLING.md: g_118 State Isolation Strategy & Cooling Dependencies

## 📋 **PROBLEM STATEMENT**

**Issue**: g_118 ventilation method dropdown causes **state bleed** - Target mode changes affect both h_10 (Target) and e_10 (Reference) totals.

**Status**: **LAST REMAINING S13 DUAL-STATE ISSUE** - all other fields (d_113, f_113, d_116, d_118) have perfect state isolation.

**Root Cause**: **Shared coolingState object contamination** - both Target and Reference calculation engines use the same `coolingState.ventilationMethod` value.

---

## 🎯 **CURRENT STATE ANALYSIS (Commit: 3c3856c)**

### **✅ WORKING PATTERN 1 IMPLEMENTATIONS:**

**Perfect State Isolation Achieved:**

- ✅ **d_113** (Heating System): Direct state reading (`TargetState.getValue("d_113")` vs `ReferenceState.getValue("d_113")`)
- ✅ **f_113** (HSPF Slider): Direct state reading + mode-aware event handling
- ✅ **d_116** (Cooling System): Pattern 1 conversion (`ModeManager.getValue("d_116")`)
- ✅ **d_118** (Ventilation Efficiency): Pattern 1 conversion (`ModeManager.getValue("d_118")`)

**Why These Work:**

- **Direct state access**: Each engine reads from its own state object
- **No shared objects**: No contamination between engines
- **Pattern 1 automatic routing**: Temporary mode switching makes all reads mode-aware

### **❌ REMAINING ISSUE: g_118 (Ventilation Method)**

**Why g_118 Fails:**

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
