# **S12 TROUBLESHOOTING GUIDE - DUAL-STATE REFERENCE MODE**

**Date**: December 29, 2024  
**Status**: **✅ RESOLVED - State Mixing Fixed**  
**Section**: S12 (Ventilation & DHW)  
**Last Updated**: December 30, 2024 - Morning Session

---

## **🎯 OBJECTIVE**

**COMPLETED**: Fixed S12 Reference mode calculations, S15 integration, and eliminated critical state mixing.
**REMAINING**: None. Section is fully Pattern A compliant and stable.

---

## **📊 S12 SECTION OVERVIEW**

### **Function**: Ventilation & Domestic Hot Water (DHW) calculations

### **Key Calculations**:

- **Ventilation Heat Recovery**: Based on climate data (HDD/CDD)
- **DHW Energy**: Hot water heating requirements
- **Key Outputs**: `g_101`, `d_101`, `i_104` (required by S15)

### **External Dependencies**:

- **S03 Climate**: `d_20` (HDD), `d_21` (CDD), `d_22` (GF HDD), `h_22` (GF CDD)
- **S02 Building**: Area and occupancy data
- **Upstream Flow**: Receives values, provides to S13→S14→S15

### **Critical S15 Dependencies**:

From logs: S15 reports "Missing critical upstream Reference values: `ref_g_101`, `ref_d_101`, `ref_i_104`"

- **These are S12's PRIMARY outputs to downstream sections**

---

## **🚨 CRITICAL ISSUE IDENTIFIED (NOW RESOLVED)**

### **STATE MIXING CONFIRMED & FIXED** (December 30, 2024):

**Test**: Change `d_103` in S12 **Reference mode**  
**Expected**: Only `e_10` (Reference TEUI) should change  
**Actual (Fixed)**: **Only `e_10` changes**. `h_10` (Target) remains stable. ✅

This indicates **perfect state isolation has been achieved**.

---

## **✅ IMPLEMENTATION COMPLETED**

### **Final Fixes**:

1.  **✅ Explicit Data Flow**: Refactored all calculation functions to accept parameters and return results as objects. This creates an explicit data chain for both `calculateTargetModel()` and `calculateReferenceModel()`, ensuring no intermediate values are read from the global state.
2.  **✅ Eliminated Ambiguous Reads**: Removed all calls to the problematic `getNumericValue()` for intermediate results within the calculation chains, which was the root cause of the state mixing.
3.  **✅ Perfect State Isolation**: The Reference calculation pipeline now uses exclusively Reference data from start to finish.

### **Previously Fixed**:

1. **✅ S14 ModeManager Export**: Added missing `ModeManager: ModeManager,` to return statement
2. **✅ S15 Double-Prefix Bug**: Fixed listener setup preventing downstream flow
3. **✅ S12 Dual-Engine Pattern**: Restored proper `calculateReferenceModel()` + `calculateTargetModel()`
4. **✅ S12 Reference Persistence**: Added S11-style Reference Value Persistence Pattern
5. **✅ S12 Mode-Aware setCalculatedValue**: Fixed `isReferenceCalculation` parameter routing
6. **✅ S12 Circular Dependency**: Fixed `calculateEnvelopeTotals` reading its own outputs prematurely
7. **✅ S12 Internal Listeners**: Added missing listeners for `d_103`, `g_103`, `d_105`, `d_108`, `g_109`
8. **✅ S12 getNumericValue Fix**: Made mode-aware for proper user input vs calculated value reads

### **Architecture Status**:

- **S12**: ✅ Fully Pattern A dual-state compliant and stable.
- **S14**: ✅ ModeManager exported, ready for full implementation
- **S15**: ✅ Fixed listeners, no more missing upstream value warnings

---

## **✅ ROOT CAUSE & SOLUTION**

### **Root Cause Confirmed: Internal State Mixing**

The investigation confirmed **Theory 1: S12 Internal State Mixing**. The core issue was that calculation sub-functions (e.g., `calculateEnvelopeHeatLossGain`, `calculateAirLeakageHeatLoss`) were using a generic `getNumericValue()` helper. This helper read intermediate results (like areas and U-values) from the global `StateManager`, which always contained the **Target** model's data.

When `calculateReferenceModel()` was running, it would inadvertently pull in these Target values, corrupting its calculations and causing the state mixing where Reference mode changes affected the Target TEUI.

### **Solution Implemented: Explicit Calculation Chains**

The fix involved refactoring the calculation logic to create two pure, isolated data pipelines—one for Target and one for Reference.

1.  **Functions Return Results**: All calculation sub-functions were modified to `return` an object containing their results, rather than relying on side effects.
2.  **Explicit Data Passing**: The main `calculateTargetModel()` and `calculateReferenceModel()` orchestrators were updated to create an explicit data flow. The returned results from one function are now passed as parameters to the next function in the sequence.
3.  **Ambiguous Reads Eliminated**: With the explicit data flow, all calls to `getNumericValue()` for intermediate results were removed, ensuring each calculation chain only uses data from its own mode.

This architectural change guarantees perfect state isolation within Section 12, resolving the bug completely.

---

## **📋 WHAT WORKS vs WHAT'S BROKEN**

### **✅ EVERYTHING IS CONFIRMED WORKING**:

1. **S12 Dual-Engine Calculations**: Both `calculateReferenceModel()` and `calculateTargetModel()` execute correctly and in isolation.
2. **S12→S15 Data Flow**: No more "Missing critical upstream Reference values" warnings.
3. **S15 Downstream Integration**: S15 correctly receives S12 Reference outputs.
4. **S12 Reference UI Updates**: Values display correctly in Reference mode.
5. **S12 Mode-Aware Input Handling**: User inputs correctly route to Reference vs Target state.
6. **✅ Perfect State Isolation**: Reference mode user changes **ONLY** affect Reference TEUI. Target TEUI is stable.

### **❌ NO REMAINING ISSUES**

---

## **📈 COMMIT STATUS**

### **Git Repository Status**:

- **Branch**: `CB-retirement`
- **Commit to be made**: Fix for S12 state mixing.
- **Files Modified**: `sections/4011-Section12.js`, `documentation/S12-TROUBLESHOOTING-GUIDE.md`

---

## **🎯 SUCCESS CRITERIA MET**

### **Primary Goal**: **ELIMINATE STATE MIXING - ✅ ACHIEVED**

**Test**: Change `d_103` in S12 Reference mode.  
**Result**: Only `e_10` changes, `h_10` remains stable. ✅

### **Secondary Goals**:

1. **Root Cause Identification**: ✅ Pinpointed internal state mixing via ambiguous `getNumericValue()` calls.
2. **S14 Full Implementation**: Ready for next session.
3. **Comprehensive Isolation**: ✅ Proven perfect state separation within S12.

### **Success Metrics**:

- ✅ **Perfect State Isolation**: Reference ↔ Target completely independent.
- ✅ **S12 Reliability**: Matches S10/S11 proven stability.
- ✅ **Complete Architecture**: S12 is now fully Pattern A compliant.

---

## **🚀 SECTION COMPLETE**

This troubleshooting guide is now concluded. The issue is fully resolved, and the section is stable.

---

**End of S12 Troubleshooting Guide**

**✅ CRITICAL STATE MIXING ISSUE RESOLVED**
