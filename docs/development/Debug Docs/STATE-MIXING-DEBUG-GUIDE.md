# 🚨 STATE MIXING DEBUG GUIDE

## **CRITICAL ISSUE IDENTIFIED**

**Problem**: Perfect state isolation is NOT achieved. Reference mode changes in S13 are contaminating Target values in S01. Furthermore, Target mode fuel changes in S07 and S13 are incorrectly triggering updates to the Reference column (E) in S01.

**Evidence**: Target TEUI `h_10` changes from `93.6` (correct heatpump) to `154.3` (electricity) or `156` (gas) when ONLY Reference mode edits are made in S13.

## **SESSION RECAP (CODE-FOCUSED LIGHTHOUSE)**

This session focused on diagnosing and fixing a severe performance issue (a "calculation storm") that was causing extreme application lag and generating massive log files (>8,000 lines). The root cause was a recursive calculation loop between sections.

**Key Architectural Problem Identified**: A mix of a central procedural calculation trigger (`Calculator.calculateAll`) and numerous section-level reactive listeners created an environment where sections were triggering each other in an infinite loop (e.g., S14 updates -> S13 listener runs -> S13 updates -> S14 listener runs -> ...).

### **Fix #1: Consolidated Fuel Listeners (Attempted)**

- **Hypothesis**: Granular and potentially out-of-order listeners for fuel changes were causing inconsistent state.
- **Action**: In `sections/4011-Section04.js`, the separate listeners for `d_113`, `f_115`, `h_115`, etc., were consolidated into a single, robust callback, mirroring a proven pattern from an archived, functional version of the code.
- **Code Snippet (Implemented in `setupEventHandlers` in `4011-Section04.js`):**

  ```javascript
  const handleFuelSystemUpdate = () => {
    console.log(`[S04] Unified fuel system listener triggered.`);
    calculateRow28(); // Recalculate complete gas row
    calculateRow30(); // Recalculate complete oil row
    calculateF32();
    calculateG32();
    calculateJ32();
    calculateK32();
    ModeManager.updateCalculatedDisplayValues();
  };

  // Point all fuel-related dependencies to the single handler
  window.TEUI.StateManager.addListener("d_51", handleFuelSystemUpdate);
  window.TEUI.StateManager.addListener("d_113", handleFuelSystemUpdate);
  window.TEUI.StateManager.addListener("e_51", handleFuelSystemUpdate);
  window.TEUI.StateManager.addListener("h_115", handleFuelSystemUpdate);
  window.TEUI.StateManager.addListener("k_54", handleFuelSystemUpdate);
  window.TEUI.StateManager.addListener("f_115", handleFuelSystemUpdate);
  // ... plus listeners for ref_ prefixed versions ...
  ```

- **Result**: This was a correct architectural improvement for robustness, but it did not solve the calculation storm, proving the issue was a deeper recursion problem.

### **Fix #2: Global Calculation Lock (The "Traffic Cop")**

- **Hypothesis**: The root cause was recursive listener-driven recalculations firing _during_ a master calculation pass.
- **Action**: A global "traffic cop" flag (`window.TEUI.isCalculating`) was implemented to create a mutex (mutual exclusion lock), ensuring only one master calculation sequence can run at a time.
- **Code Implementation**:

  1.  **In `4011-Calculator.js`**, a global flag was added and the main `calculateAll` function was wrapped:

      ```javascript
      // At the top of the module
      window.TEUI.isCalculating = false;

      function calculateAll() {
        if (window.TEUI.isCalculating) {
          console.warn("[Calculator] Suppressing nested calculateAll call.");
          return;
        }
        window.TEUI.isCalculating = true;

        try {
          // ... original calcOrder loop ...
        } finally {
          // Always reset the flag
          window.TEUI.isCalculating = false;
        }
      }
      ```

  2.  **In `sections/4011-Section13.js` and `sections/4011-Section14.js`**, key cross-section listeners were guarded:
      ```javascript
      // Example from S13's listener for d_127 from S14
      sm.addListener("d_127", () => {
        if (window.TEUI.isCalculating) return; // Suppress if global calculation is running
        console.log("[S13] 📡 🔥 d_127 (TED) listener triggered...");
        calculateAll();
      });
      ```

- **Result**: **SUCCESS**. This fix completely eliminated the calculation storm and the associated application lag. The recursive loop was broken, and the log file size returned to normal levels.

**Conclusion for Next Agent**: The performance issues have been resolved by implementing a global calculation lock. However, this fix revealed that the underlying **state mixing** bug (as described elsewhere in this guide) still exists. The application is now fast, but the calculations can still be incorrect due to this contamination. The next debugging session should focus entirely on the state mixing issue, with the `ComponentBridge.js` module as the primary suspect.

## **DEBUGGING METHODOLOGY**

### **Phase 1: Establish Baseline Understanding**

**REQUIRED READING** (in order):

1. `README.md` - Architecture overview
2. `DUAL-STATE-IMPLEMENTATION-GUIDE.md` - Pattern A vs Pattern B, dual-engine principles
3. Current issue evidence in `Logs.md` (lines 1066, 1279, 1538, 1548)

### **Phase 2: Trace Contamination Flow**

**CRITICAL PRINCIPLE**: Both Target and Reference engines should run in parallel, but they must be **mode-aware** in their storage operations.

**Key Questions**:

1. Which section is writing to global `j_32` during Reference operations?
2. Why is S15's Target engine storing to global state during Reference calculations?
3. Are the `setCalculatedValue()` overrides in Reference functions working correctly?

### **Phase 3: Systematic Diagnostic Logging**

**Target Functions for Logging**:

- `S15.calculateValues()` (lines 1795-1799) - Direct `h_10` writes
- `S04.calculateRow32()` - Global `j_32`/`k_32` writes
- Any `setCalculatedValue()` calls during Reference operations

**Logging Pattern**:

```javascript
console.log(
  `[DEBUG] ${sectionName} - Mode: ${currentMode}, Writing: ${field}=${value}`,
);
```

## **DUAL-ENGINE ARCHITECTURE FUNDAMENTALS**

### **S01 Dashboard/Consumer Pattern**:

S01 is a **pure data consumer** with **NO Target/Reference mode** because it displays all three building models simultaneously:

- **Column E (Reference)**: Reference Building Model values (`ref_j_32`, `ref_k_32`, etc.)
- **Column H (Target)**: Target Building Model values (`j_32`, `k_32`, etc.)
- **Column K (Actual)**: Utility bill values (`f_32`, `g_32`, etc.)

S01 **never stores calculated values** - it only reads and displays upstream calculations.

### **Parallel Dual-Engine Flow**:

**CORE PRINCIPLE**: Both Target and Reference calculations **always run in parallel** when ANY data changes, regardless of UI mode. The calculations are **mode-aware in their STORAGE operations**.

#### **Correct Flow (Reference Mode Change)**:

1. **User changes S13 Reference mode** → Triggers dual-engine calculations
2. **S13 Target Engine**: Runs, stores to `j_32`, `k_32` (unchanged values) ✅
3. **S13 Reference Engine**: Runs, stores to `ref_j_32`, `ref_k_32` (updated values) ✅
4. **S15 Target Engine**: Runs, stores to `j_32`, `k_32` (unchanged values) ✅
5. **S15 Reference Engine**: Runs, stores to `ref_j_32`, `ref_k_32` (updated values) ✅
6. **S04 Target Engine**: Runs, stores to `j_32`, `k_32` (unchanged values) ✅
7. **S04 Reference Engine**: Runs, stores to `ref_j_32`, `ref_k_32` (updated values) ✅
8. **S01 reads and displays**:
   - Column E: `ref_j_32`, `ref_k_32` (shows Reference changes) ✅
   - Column H: `j_32`, `k_32` (stays at Target defaults) ✅
   - Column K: `f_32`, `g_32` (utility bills, unchanged) ✅

#### **Current Broken Flow**:

1. **S13 Reference change** → Correctly stores `ref_` values ✅
2. **Downstream engines** → Target engines incorrectly contaminate global state ❌
3. **S01 Column H** → Shows contaminated Target values ❌

### **Mode-Aware Storage Pattern**:

**Target Engine** should ALWAYS store to unprefixed fields (`j_32`, `k_32`)
**Reference Engine** should ALWAYS store to `ref_` prefixed fields (`ref_j_32`, `ref_k_32`)

**UI Mode Toggle** is just a **display filter** - it shows either Target or Reference values that are already calculated and stored in StateManager.

### **StateManager Registration Pattern**:

**CRITICAL**: Every calculation must be registered in StateManager with proper state isolation:

```javascript
// TARGET ENGINE - ALWAYS stores unprefixed
StateManager.setValue("j_32", targetValue);
StateManager.setValue("k_32", targetValue);
StateManager.setValue("h_10", targetTEUI);

// REFERENCE ENGINE - ALWAYS stores ref_ prefixed
StateManager.setValue("ref_j_32", referenceValue);
StateManager.setValue("ref_k_32", referenceValue);
StateManager.setValue("ref_h_10", referenceTEUI);
```

**The Problem**: Some Target engines are incorrectly storing updated values during Reference operations instead of preserving existing Target defaults.

**Expected**: When user changes Reference mode, Target values in StateManager should remain **completely unchanged** from their defaults or previous Target calculations.

### **Reference Standard Application (Clarified)**

- FieldDefinitions are the single source of truth for defaults. Do not duplicate defaults in state objects.
- Apply `ReferenceValues.js` subsets as an overlay to `ReferenceState` only, driven by `d_13`. Do not write these values into FieldDefinitions.
- For “Mirror Target + Overlay”, copy Target inputs into Reference once, then overlay the `ReferenceValues` subset for only those code-governed fields.
- The UI toggle (`switchMode`) is display-only; it must not call `calculateAll()`.

Canonical reference setup modes (for `ReferenceToggle.js`):

- Mirror Target
- Mirror Target + Overlay (Reference) [Default]
- Independent Models

These modes help test isolation and support practical code-minimum comparisons without contaminating Target defaults.

## **TEST SCENARIO: S13 Reference Mode Edits**

### **User Test Sequence**:

1. **Load app** with preset defaults
2. **Navigate to S13**, switch to **Reference UI mode**
3. **Change primary heating fuel** (`d_113`) from Electricity → Heatpump → Oil → Gas
4. **Observe S01 columns** for contamination

### **EXPECTED BEHAVIOR**:

**✅ S01 Column E (Reference)**: Should update to show Reference building calculations  
**✅ S01 Column H (Target)**: Should remain at `h_10=93.6` (heatpump default) - **NO CHANGES**  
**✅ S01 Column K (Actual)**: Should remain unchanged (utility bills)

### **ACTUAL BROKEN BEHAVIOR**:

**❌ S01 Column H (Target)**: Changes from `93.6` → `154.3` (electricity) → `156` (gas)  
**❌ Global j_32**: Changes during Reference operations  
**❌ State contamination**: Reference edits affecting Target model

### **CONTAMINATION EVIDENCE FROM LOGS**:

```
Line 1066: h_10=93.6 (✅ CORRECT - Target at heatpump default before contamination)
Line 1269: j_32 changed from 133574... to 220216... (❌ CONTAMINATION - Target j_32 changing during Reference op)
Line 1279: h_10=154.3 (❌ CONTAMINATED - Target TEUI showing electricity values)
Line 1538: j_32 changed from 220165... to 222610... (❌ CONTINUED CONTAMINATION)
Line 1548: h_10=156 (❌ FURTHER CONTAMINATION - Target TEUI showing gas values)
```

**Critical Point**: The Target building model should maintain heatpump characteristics (`h_10=93.6`) regardless of Reference mode fuel changes. Any change to Target `j_32` or `h_10` during Reference operations indicates **mode-awareness failure** in upstream calculations.

## **DEBUGGING QUESTIONS FOR FRESH AGENT**

1. **Read the architecture guides** - Do you understand dual-engine principles?
2. **Examine the logs** - Can you see the exact contamination pattern?
3. **Identify the culprit** - Which section is writing global `j_32` during Reference ops?
4. **Propose focused fix** - How do we make that section mode-aware?

## **SUCCESS CRITERIA**

✅ **Perfect State Isolation**: Reference changes in S13 should NEVER affect Target values in S01  
✅ **Target column stability**: `h_10` stays at `93.6` during Reference operations  
✅ **Reference column functionality**: Values update correctly from `ref_` prefixed upstream data

## **FILES TO FOCUS ON**

- `sections/4011-Section15.js` (suspected Target engine contamination)
- `sections/4011-Section04.js` (global j_32/k_32 writes)
- `4011-SectionIntegrator.js` (orchestration logic)
- `documentation/Logs.md` (contamination evidence)
- `4011-ComponentBridge.js` (**NEW - Primary suspect for state mixing**)

## **NEXT STEPS (Strategy for Next Session)**

1.  **Primary Hypothesis**: `ComponentBridge.js` is the source of the state contamination. Its logic is likely incompatible with the new Pattern A architecture where sections manage their own state and communicate directly via prefixed values in `StateManager`.
2.  **First Action**: Investigate and then systematically disable `ComponentBridge.js` by commenting out its initialization and any `initDualStateSync()` calls. Test the S07/S13 fuel switching in both Target and Reference modes to see if this single action resolves the state mixing.
3.  **Contingency Plan**: If disabling `ComponentBridge.js` does not solve the issue, proceed with swapping in the archived (pre-dual-state) versions of S13 and/or S07 to isolate whether the fault lies in the new section logic itself or in how the rest of the system is interacting with it.

---

**Remember**: The issue is NOT the SectionIntegrator calling both engines - that's correct. The issue is that one of the engines is incorrectly storing to global state during mode-aware operations.

OTHER NOTES:

🔧 S13→S04 Fuel Flow Bug: Summary for Fresh Agent
🎯 CORE ISSUE
S04 is not properly receiving S13 fuel quantities (h_115 gas, f_115 oil), causing artificially low TEUI calculations (70.8 instead of expected 163.6/163.5 when using Gas/Oil heating systems).
📊 SYMPTOMS
Target TEUI: Shows 70.8 instead of 163.6 (Gas) or 163.5 (Oil)
Missing Data Flow: S13 calculates fuel volumes but S04 H28/H30 don't receive them
Excel Formulas Affected:
H28 = IF(AND($D$113="Gas", $D$51="Gas"), E51+H115, IF($D$51="Gas", E51, IF($D$113="Gas", H115, 0)))
H30 = IF(AND($D$113="Oil", $D$51="Oil"), $K$54+$F$115, IF($D$51="Oil", K54, IF($D$113="Oil", F115, 0)))

🏗️ ARCHITECTURE CONTEXT
Pattern A Dual-State: All sections use TargetState/ReferenceState + ModeManager
S04 Listeners: Already correctly set up for h_115, f_115, d_113 changes
S13 Calculations: Working internally, stores to DOM via setCalculatedValue()
Cross-Section Flow: Should use StateManager for inter-section communication
✅ WORKING REFERENCE
The archived (non-dual-state) S04 version correctly receives S13 fuel data and produces expected TEUI values.
❌ FAILED ATTEMPT
Adding storeTargetResults() to S13's calculateTargetModel() caused state mixing where Target S13 changes incorrectly updated Reference values (column E) in S01.
🔍 DEBUGGING STRATEGY NEEDED
Compare Data Flow: Archived vs. current S13→S04 communication patterns
StateManager Analysis: How should Pattern A sections share calculated values?
State Isolation: Ensure Target/Reference values never contaminate each other
Listener Architecture: Verify S04 can properly receive S13 fuel quantities
Incremental Testing: Small, careful changes with immediate verification
🎯 SUCCESS CRITERIA
TEUI changes from ~70.8 → 163.6 (Gas) / 163.5 (Oil) when S13 uses fossil fuels (Oil works, Gas does not, unless the fuel system chosen immediately before gas is alower EUI, suggesting a race condition or missing data)
No state mixing between Target/Reference modes
S04 H28/H30 Excel formulas work correctly with S13 + S07 fuel inputs
Both Target AND Reference mode calculations flow properly
📁 KEY FILES
OBJECTIVE 4011RF/sections/4011-Section13.js - Fuel calculation source
OBJECTIVE 4011RF/sections/4011-Section04.js - Energy summary consumer
OBJECTIVE 4011RF/sections/4011-Section01.js - Energy summary consumer/dashboard, state agnostic, shows all three states, Reference, Target and Actual in cols E, H, K, respectively.
ARCHIVE/4011GS/.../4011-Section04.js - Working reference implementation pre-dual-state refactor, just to see what listeners are listening to, kWh or Fuel Volumes, this could be key as Oil and Gas have the same system demand so listening to demand will not trigger recalculation and hence volumes of fuel, etc.
Current branch: CB-retirement (recently reverted failed fix, clean working state)

The S01 j_32 listeners ARE firing (last one at line 6740), but S04's d_113 listener is NOT firing in the recent test!
This suggests the issue might be that d_113 was already set to "Gas" so no StateManager change event fired. Let me check what d_113 value change actually occurred:
🎯 FOUND THE ROOT CAUSE!
Looking at the sequence:
Line 6795: [S13] d_113 → Gas (user dropdown change detected by S13)
Line 6796: S13 starts dual calculations
Line 6815: S13 stores fuel values correctly
❌ NO S04 d_113 listener fires!
The S04 StateManager listener for d_113 is completely broken! S04 never gets notified when d_113 changes.
Let me check S04's listener registration code:
🕵️ HYPOTHESIS: d_113 Value Already Set!
The listener registration looks correct, but it worked earlier in the session and now doesn't. This suggests d_113 might already be "Gas" so no change event fires!

---

### **August 5, 2025, 12:42am - NEW FINDING**

**Action Taken**: `ComponentBridge.js` has been disabled by commenting out its initialization in `index.html` and `4011-Calculator.js`. This was a necessary step to simplify the architecture and rule out the bridge as the source of state mixing.

**Analysis of New Logs**: With `ComponentBridge` disabled, the root cause of state mixing is now unobscured. The logs clearly show that `4011-Section04.js` is not mode-aware. Specifically, its calculation functions (`calculateH28`, `calculateH30`) are incorrectly using the **Target** state (e.g., `d_113` for fuel type) when they should be using **Reference** state (`ref_d_113`) during Reference model calculations.

**Evidence from Logs (Example)**:

```
[S04] calculateH28 DEBUG:
     Space heating fuel (d_113): 'Oil'
```

This log line shows that during a Reference calculation (triggered by a change to a `ref_` prefixed value), the function is checking the unprefixed `d_113`, which holds the Target model's fuel type ('Oil', from user testing), instead of the correct `ref_d_113` ('Gas', the Reference default).

**Path Forward (Next Session)**:

1.  **Targeted Refactor**: The primary focus is now `OBJECTIVE 4011RF/sections/4011-Section04.js`.
2.  **Make Calculations Mode-Aware**: Modify the calculation functions within `Section04.js` (like `calculateH28`, `calculateH30`, and any others that contribute to the energy/emissions summary) to correctly read from either the Target state (unprefixed variables) or the Reference state (`ref_` prefixed variables) based on the context of the calculation being performed.
3.  **Validate**: After refactoring, re-run the S13/S07 fuel switching tests and confirm that S01's Target and Reference columns update independently and without contamination.
