# COOLING-CAPACITANCE BUG

## Issue Summary

Reference mode cooling calculations are broken in two related ways:

1. **Capacitance toggle issue**: S03's capacitance toggle (h_21) has no effect in Reference mode, despite working perfectly in Target mode
2. **Zero cooling load**: S13 shows 0 cooling load in Reference mode (d_117) when cooling toggle (d_116) is enabled

## Symptoms

### Working in Target Mode

- S03 capacitance toggle (h_21) switches thermal absorption on/off
- Capacitance slider (i_21) controls 0-100% absorption
- S11 ground-facing elements (rows 94-95) show negative heat gain when capacitance is on
- S13 cooling calculations work correctly

### Broken in Reference Mode

- S03 capacitance toggle (h_21) appears to have no effect
- S11 ground-facing elements (k_94, k_95) DO update correctly (Reference → Reference works)
- S13 cooling load (d_117) shows 0 when cooling toggle (d_116) is enabled
- Value chain breaks somewhere between S11 and S13

## Data Flow Analysis

### Expected Flow

```
S03 (h_21 toggle, i_21 slider)
  ↓
S11 ground-facing opaque elements (rows 94-95)
  → k_94: ground-facing heat gain
  → k_95: ground-facing heat gain (with capacitance)
  ↓
S13 cooling calculations
  → d_116: cooling toggle
  → d_117: reference cooling load
```

### Current Behavior

- ✅ S03 Reference → S11 Reference: WORKS
- ❌ S11 Reference → S13 Reference: BREAKS

## Similar to g_101 Bug

This bug shares characteristics with our recent g_101 fix:

- Target mode works perfectly
- Reference mode breaks in the calculation chain
- Likely involves missing Reference mode state paths
- May involve fallback anti-patterns

## Investigation Plan

1. **S03 Analysis**

   - [ ] Read h_21 toggle implementation
   - [ ] Read i_21 slider implementation
   - [ ] Check Reference mode state paths
   - [ ] Verify publications to S11

2. **S11 Analysis**

   - [ ] Read k_94 and k_95 calculations
   - [ ] Check ground-facing element logic
   - [ ] Verify capacitance integration
   - [ ] Check publications to S13

3. **S13 Analysis** ⚠️ EXTREME CAUTION - MOST COMPLEX SECTION

   - [ ] Read d_116 cooling toggle implementation
   - [ ] Read d_117 cooling load calculation
   - [ ] Trace where S11 values are consumed
   - [ ] Check for Reference mode state paths
   - [ ] Look for fallback anti-patterns

4. **Root Cause Identification**
   - [ ] Identify where the chain breaks
   - [ ] Determine if issue is in S03, S11, S13, or bridging code
   - [ ] Check ReferenceManager for missing integrations

## Notes

- S13 is the MOST complex section file - proceed with extreme caution
- NO CODE CHANGES until analysis is complete
- May need to check StateManager, ReferenceManager, and bridging code

## Analysis Session - 2025-10-17

### Investigation Findings

#### 1. S03 Capacitance Implementation ✅

**Location**: [4012-Section03.js:1684-1700](../sections/4012-Section03.js#L1684-L1700)

- **h_21**: Dropdown toggle with options "Static" or "Capacitance"
- **i_21**: Percentage slider (0-100%) for capacitance factor
- **Calculation**: Ground-Facing CDD (h_22)
  - If h_21 = "Static": `MAX(0, (10 - TsetCool) * DaysCooling)`
  - If h_21 = "Capacitance": `(10 - TsetCool) * DaysCooling` (can be negative)

**Reference Mode Publishing**: ✅ WORKS

- S03's `storeReferenceResults()` publishes `h_22` as `ref_h_22` to StateManager
- Location: [4012-Section03.js:1843](../sections/4012-Section03.js#L1843)

**Verdict**: S03 is working correctly for both Target and Reference modes.

---

#### 2. S11 Ground-Facing Elements ✅

**Location**: [4012-Section11.js:1453-1463](../sections/4012-Section11.js#L1453-L1463)

- **k_94**: Ground-facing slab heat gain (calculated)
- **k_95**: Ground-facing basement/crawl heat gain (calculated)
- **Formula**: Uses `capacitanceFactor_i21 * h_22 * 24` as heatgain multiplier

**Reference Mode Reading**: ✅ WORKS

```javascript
if (isReferenceCalculation) {
  const ref_h22 = getGlobalNumericValue("ref_h_22") || 0;
  heatgainMultiplier = capacitanceFactor_i21 * ref_h22 * 24;
  console.log(`[S11] 🔵 REF CLIMATE READ: h_22=${ref_h22}`);
}
```

**State Path Listeners**: ✅ WORKS

- S11 has listeners for both `h_22` (Target) and `ref_h_22` (Reference)
- Location: [4012-Section11.js:2187, 2193](../sections/4012-Section11.js#L2187-L2193)

**Verdict**: S11 correctly reads `ref_h_22` from S03 and calculates ground-facing heat gains for Reference mode.

---

#### 3. S13 Cooling System - ROOT CAUSE FOUND 🔴

**Problem 1: Hardcoded "No Cooling" in ReferenceState**
**Location**: [4012-Section13.js:113](../sections/4012-Section13.js#L113)

```javascript
ReferenceState.initializeDefaults: function () {
  // ...
  this.state.d_116 = "No Cooling";  // 🔴 HARDCODED!
  // ...
}
```

This hardcoded value prevents Reference mode from EVER calculating cooling loads, regardless of user input.

**Problem 2: Cooling Load Calculation Logic**
**Location**: [4012-Section13.js:2438-2464](../sections/4012-Section13.js#L2438-L2464)

```javascript
const coolingSystemType = ModeManager.getValue("d_116") || "No Cooling";
// ...
if (coolingSystemType === "No Cooling") {
  coolingLoad_d117 = 0; // 🔴 Always zero in Reference mode!
  coolingSink_l116 = 0;
  coolingSink_l114 = 0;
  j_116_display = 0;
}
```

**Why d_117 shows 0 in Reference mode**:

1. User toggles d_116 to "Cooling" in Reference mode UI
2. But ReferenceState.initializeDefaults() overrides it back to "No Cooling"
3. Cooling calculation reads "No Cooling" from ReferenceState
4. Sets d_117 = 0

---

### Root Cause Analysis

#### Primary Issue: S13 Reference Mode Configuration

The issue is NOT in S03 or S11. Both sections work perfectly. The problem is in **S13's ReferenceState initialization**.

**Why this matters**:

- Users need to test Cooling/No Cooling scenarios in the Reference model
- This bug prevents testing cooling scenarios in Reference mode
- It also means capacitance effects or indoor RH% (i_59)set in S08 on cooling cannot be observed in Reference mode

#### Capacitance Toggle Issue (h_21)

The capacitance toggle DOES work, but its effects cannot be seen in Reference mode because:

1. S03 → S11 chain works perfectly
2. S11 calculates correct ground-facing heat gains (including negative values from capacitance)
3. BUT S13 Reference mode has d_116 = "No Cooling" hardcoded
4. So cooling calculations never run, and capacitance effects on cooling are invisible

---

### Decision Point: What Should We Fix?

#### Option 1: Allow User-Controlled Cooling in Reference Mode ⚠️

**Change**: Remove hardcoded `d_116 = "No Cooling"` from ReferenceState
**Pros**:

- Allows testing cooling scenarios in Reference mode
- Makes capacitance effects visible
- More flexible for "what-if" scenarios

**Cons**:

- **Breaks code compliance logic**
- Reference buildings per OBC/NBC have no mechanical cooling
- May confuse users about what "Reference" means
- Could produce invalid code compliance comparisons

#### Option 2: Keep Current Architecture, Document Limitation ✅ RECOMMENDED

**Change**: No code changes
**Action**: Document that Reference mode cooling is intentionally disabled per building codes

**Rationale**:

- Architecturally correct for code compliance
- Capacitance IS working - it affects heating calculations
- Reference buildings per codes don't have mechanical cooling
- Target mode is the correct place to test cooling scenarios with capacitance

#### Option 3: Create Hybrid Mode (Future Enhancement)

**Change**: Add new "Custom Reference" mode
**Scope**: Too large for current bug fix
**Deferred**: Document as future enhancement

---

### Root Cause Analysis - DEEPER INVESTIGATION NEEDED ⚠️

**This IS a bug** - a calculation parity failure between Target and Reference modes.

**Updated Findings from Logs.md**:

The issue is MORE COMPLEX than initially diagnosed:

1. **d_116 toggle DOES trigger calculations** ✅

   - `[FieldManager] Routed d_116=Cooling through sect13 ModeManager`
   - `[Cooling] 🚀 Starting cooling calculations (mode=reference)...`

2. **BUT cooling demand m_129 = 0** ❌

   - When d_116 changes: `m_129_annual=0, E37_daily=0`
   - After g_118 "priming": `m_129_annual=44203.21, E37_daily=225.52`

3. **The real problem**:
   - Cooling calculations RUN, but `m_129` (cooling demand) is ZERO
   - Something in the calculation chain is not ready/available when d_116 changes
   - g_118 (ventilation method) change triggers a FULLER recalculation that properly updates m_129
   - This suggests m_129 depends on upstream values that aren't updated in the d_116 code path

**Initial Fix Attempts** (partial success):

- ✅ Added d_116 to user-modified tracking
- ✅ Removed mode check from ReferenceState.setValue calculations
- ❌ Still doesn't fully work - m_129 remains zero

**Why This Matters**:

- Building codes can include cooling systems in Reference buildings when the design includes cooling
- Users MUST be able to test Reference mode with cooling (calculation parity)
- The default "No Cooling" is correct for INITIAL state, but users should be able to override it
- This is the same pattern used for f_113 and j_115 (preserved user modifications)

---

### Next Steps for Investigation

**Questions to Answer**:

1. **Where is m_129 (cooling demand) calculated?**

   - Need to find the function that calculates cooling demand
   - Understand what inputs it needs
   - Check if those inputs are available when d_116 changes

2. **What does g_118 trigger that d_116 doesn't?**

   - g_118 change successfully "primes" the system
   - What additional recalculation does it trigger?
   - Is there a missing dependency or listener?

3. **Is m_129 calculated BEFORE the cooling load calculation?**

   - Perhaps m_129 needs to be calculated first
   - Then cooling load (d_117) uses m_129
   - Order of operations may be wrong in d_116 path

4. **Are there state listeners missing?**
   - Check if d_116 needs to publish/trigger additional state updates
   - Compare d_116 listeners vs g_118 listeners

---

## Debugging Strategy: console.trace() Approach

**Date:** October 18, 2025

### Relevance of d_12 State Mixing Bug Debugging Approach

The d_12 bug debugging approach (documented in [d_12-STATE-MIXING-DIAGNOSTIC-REPORT.md](history (completed)/d_12-STATE-MIXING-DIAGNOSTIC-REPORT.md)) used `console.trace()` to capture call stacks when mysterious state writes occurred.

**d_12 Bug Pattern:**

- Symptom: Unprefixed `d_12` being written when only `ref_d_12` should be written
- Mystery: Couldn't find WHERE the write was coming from
- Solution: Added `console.trace()` to StateManager.setValue() to capture full call stack
- Result: Revealed the "ghost writer" by showing exact function call chain

**Our m_129=0 Bug Pattern:**

- Symptom: m_129 calculates as 0 when triggered by d_116, but correctly when triggered by g_118
- Mystery: Can't find WHY m_129 calculation returns 0 in d_116 path
- Both paths trigger cooling calculations, but produce different results

### Applicability Assessment: ✅ HIGHLY RELEVANT

**Similarities:**

1. **Mystery behavior**: Both bugs involve "something" happening (or not happening) with unclear origin
2. **Different code paths**: d_12 had multiple handlers; m_129 has d_116 vs g_118 trigger paths
3. **Logs show symptom but not cause**: Both show the RESULT (unprefixed write / m_129=0) but not the WHY

**Key Difference:**

- d_12 bug: Needed to find WHO was calling a function
- m_129 bug: Need to understand WHY a calculation returns 0

### Proposed Debugging Approach

Add strategic `console.trace()` calls to trace the m_129 calculation path:

#### 1. Trace m_129 Calculation Origin

```javascript
// In S13 where m_129 is calculated
if (m_129 === 0 || m_129_annual === 0) {
  console.log(
    `[DEBUG m_129] Calculated as ZERO: m_129=${m_129}, m_129_annual=${m_129_annual}`,
  );
  console.trace("Call stack when m_129=0:");
}
```

#### 2. Trace Critical Input Values

```javascript
// Where cooling demand inputs are gathered
console.log(
  `[DEBUG m_129 INPUTS] mode=${mode}, coolingSystemType=${coolingSystemType}`,
);
console.log(`[DEBUG m_129 INPUTS] S11 values: k_94=${k_94}, k_95=${k_95}`);
console.log(
  `[DEBUG m_129 INPUTS] Climate: CDD=${CDD}, capacitance=${capacitanceFactor}`,
);
if (someValueIsZeroOrMissing) {
  console.trace("Call stack when critical input is missing:");
}
```

#### 3. Compare d_116 vs g_118 Paths

```javascript
// In d_116 handler
console.log(`[DEBUG TRIGGER] d_116 changed to: ${value}`);
console.trace("d_116 trigger path:");

// In g_118 handler
console.log(`[DEBUG TRIGGER] g_118 changed to: ${value}`);
console.trace("g_118 trigger path:");
```

### Expected Insights

This approach should reveal:

1. **Call Stack Differences**: Why g_118 path has m_129>0 but d_116 path has m_129=0
2. **Calculation Order**: Whether m_129 is calculated before needed inputs are ready
3. **Missing Dependencies**: Which upstream values are 0/undefined in d_116 path but available in g_118 path
4. **Listener Chain**: Which recalculations fire in g_118 path but not d_116 path

### Implementation Strategy

1. **Add traces to S13 m_129 calculation** - Capture when it returns 0
2. **Add traces to d_116 and g_118 handlers** - Compare trigger paths
3. **Test both scenarios**:
   - Toggle d_116: "No Cooling" → "Cooling" (captures m_129=0 path)
   - Change g_118: Any value change (captures m_129>0 path)
4. **Compare stack traces** - Identify where paths diverge

### Success Criteria

When we see the stack traces, we should be able to answer:

- What functions are called in g_118 path that aren't called in d_116 path?
- Are there intermediate calculation steps that d_116 path skips?
- Does m_129 calculation depend on values that g_118 updates but d_116 doesn't?

---

## ROOT CAUSE IDENTIFIED - October 18, 2025

### THE ACTUAL ROOT CAUSE: Cooling.js Initialization Flaw ⚠️

**Target vs Reference Calculation Parity Violation**

After tracing why Target mode works perfectly but Reference mode fails, the root cause is found in **Cooling.js initialization**:

**Location**: [4012-Cooling.js:693-747](../4012-Cooling.js#L693-L747)

```javascript
function initialize(params = {}) {
  // Try to get values from StateManager if available
  if (typeof window.TEUI.StateManager !== "undefined") {
    // ❌ BUG: Reads ONLY unprefixed values (Target mode)
    const coolingSetpoint = window.TEUI.StateManager.getValue("h_24"); // NO ref_ prefix
    state.coolingSetTemp = coolingSetpoint ? parseFloat(coolingSetpoint) : 24;

    const cdd = window.TEUI.StateManager.getValue("d_21"); // NO ref_ prefix
    state.coolingDegreeDays = cdd ? parseFloat(cdd) : 196;

    const volume = window.TEUI.StateManager.getValue("d_105"); // NO ref_ prefix
    state.buildingVolume = volume
      ? parseFloat(volume.toString().replace(/,/g, ""))
      : 8000;

    const area = window.TEUI.StateManager.getValue("h_15"); // NO ref_ prefix
    state.buildingArea = area
      ? parseFloat(area.toString().replace(/,/g, ""))
      : 1427.2;

    const indoorRH = window.TEUI.StateManager.getValue("i_59"); // NO ref_ prefix
    state.indoorRH = indoorRH ? parseFloat(indoorRH) / 100 : 0.45;
  }

  // ❌ BUG: Only calculates Target mode on initialization
  calculateAll("target");

  state.initialized = true;
}
```

### Why Target Mode Works Perfectly

**Target mode initialization flow:**

1. App loads → StateManager populated with S02/S03/S08/S12 values
2. Cooling.js `initialize()` runs → reads unprefixed values ✅
3. Calls `calculateAll("target")` → populates Target cooling values ✅
4. User toggles d_116 → S13 calls `CoolingCalculations.calculateAll("target")` ✅
5. Cooling.js reads fresh values via `getModeAwareValue()` (no prefix) ✅
6. **Everything works because Target values were initialized and exist**

### Why Reference Mode Fails

**Reference mode "cold start" flow:**

1. App loads → StateManager populated with **unprefixed** values only
2. Cooling.js `initialize()` runs → reads unprefixed values (Target)
3. Calls `calculateAll("target")` → **NEVER calls with "reference"** ❌
4. User switches to Reference mode → Changes d_116 to "Cooling"
5. S13 calls `CoolingCalculations.calculateAll("reference")`
6. Cooling.js tries to read `ref_h_24`, `ref_d_21`, `ref_d_105`, `ref_h_15`, `ref_i_59`
7. **ALL RETURN NULL - Reference values were NEVER initialized** ❌
8. Falls back to defaults or 0 → m_129 = 0 ❌

**After g_118 "priming":**

1. g_118 change triggers `Calculator.calculateAll()`
2. **Full cascade runs S02 → S03 → S08 → S12**
3. These sections publish `ref_` prefixed values to StateManager ✅
4. NOW when Cooling.js calls `getModeAwareValue()`, `ref_*` values exist ✅
5. m_129 calculates correctly ✅

### The Smoking Gun (Secondary Issue)

**Location**: [4012-Section13.js:2234-2244](../sections/4012-Section13.js#L2234-L2244)

```javascript
// 🔧 FIX (Oct 7, 2025): Force complete calculator cascade when g_118 changes
// This ensures cooling calculations get proper climate/volume/area values
// which are initialized during full Calculator.calculateAll() but not S13-only calcs
if (fieldId === "g_118") {
  setTimeout(() => {
    if (window.TEUI?.Calculator?.calculateAll) {
      window.TEUI.Calculator.calculateAll(); // ← THIS IS THE "PRIMING"!
    }
  }, 50); // Small delay ensures S13 values published first
}
```

### What This Reveals

**g_118 "priming" works because**:

- g_118 change calls `calculateAll()` (local S13 calculations)
- THEN calls `window.TEUI.Calculator.calculateAll()` (FULL cascade across ALL sections)
- The full cascade populates upstream values (from S03/S08/S11) that m_129 needs
- Those values persist in StateManager, making subsequent changes work

**d_116 fails because**:

- d_116 change calls `calculateAll()` (local S13 calculations only)
- Does NOT call `Calculator.calculateAll()` (no full cascade)
- Upstream dependencies (climate data, building volume, area, humidity) aren't ready
- m_129 calculation reads zeros/nulls from StateManager → returns 0

### The Dependency Chain

m_129 (cooling demand) depends on values calculated in **other sections**:

1. **4012-Cooling.js** needs:

   - `d_105` (building volume) from S12
   - `h_15` (building area) from S02
   - `d_21` (CDD) from S03
   - `h_24` (cooling setpoint) from S03
   - `i_59` (indoor RH%) from S08

2. **Without full cascade**:

   - These values are null/0 in Cooling.js state
   - Latent load factor = 0
   - Free cooling limit = 0
   - m_129 = 0

3. **With full cascade** (g_118 path):
   - Calculator.calculateAll() runs S02 → S03 → S08 → S12 → S13
   - All upstream values populate correctly
   - Cooling.js gets valid inputs
   - m_129 calculates correctly

### Why "Laggy" After Priming

After g_118 priming, the values exist in StateManager state. But:

- Changes to capacitance (h_21) or humidity (i_59) only trigger their local section
- Those sections publish to StateManager
- But Cooling.js doesn't recalculate unless triggered
- Values appear "laggy" because the dependency chain is incomplete

### The Fix (Surgical Approach)

**Option 1: Add Calculator.calculateAll() to d_116 handler** ⚠️ RISKY

- Copy the g_118 pattern to d_116
- Could cause performance issues (full cascade on every cooling toggle)
- May have side effects we haven't discovered

**Option 2: Add proper dependency listeners to Cooling.js** ✅ RECOMMENDED

- Cooling.js should listen for changes to its dependencies
- When h_15, d_21, h_24, i_59, etc. change → recalculate
- More targeted, less risky
- Follows proper dependency management pattern

**Option 3: Ensure Calculator.calculateAll() runs on app load** ✅ REQUIRED

- Verify full cascade runs during initialization
- Ensures all values populated before user interactions
- Prevents the "need to prime" issue on first use

### CALCULATION PARITY FIX: Ensure Reference Values Are Initialized

The proper fix that achieves **calculation parity with Target mode** requires ensuring Reference values exist in StateManager before Cooling.js needs them.

#### Option 1: Ensure Calculator.calculateAll() Runs on App Initialization ✅ RECOMMENDED

**Why g_118 "priming" works**: It triggers `Calculator.calculateAll()` which runs the full cascade S02→S03→S08→S12, populating ALL `ref_*` values.

**The Fix**: Ensure this cascade happens **BEFORE** user interactions, not as a workaround.

**Code Change**: [4011-Calculator.js](../4011-Calculator.js) or initialization sequence

Verify that on app load:

1. Calculator.calculateAll() runs (it does - see line 519)
2. It calculates **BOTH** Target AND Reference models
3. All sections publish ref\_\* values to StateManager
4. **THEN** Cooling.js initializes

**Current Issue**: Cooling.js might initialize before Calculator runs the full cascade.

**Test**: Check initialization sequence in console logs:

```
[Calculator] Running calculateAll...
[Section02] Publishing ref_h_15...
[Section03] Publishing ref_d_21, ref_h_24...
[Section08] Publishing ref_i_59...
[Section12] Publishing ref_d_105...
[Cooling] Initializing...  ← Should come AFTER ref_ values exist
```

#### Option 2: Add Calculator.calculateAll() to d_116 Handler (Workaround)

**This is a WORKAROUND, not the root fix**. It papers over the initialization problem.

**Code Change**: [4012-Section13.js:2234-2244](../sections/4012-Section13.js#L2234-L2244)

```javascript
// 🔧 FIX (Oct 7, 2025): Force complete calculator cascade when g_118 changes
if (fieldId === "g_118") {
  setTimeout(() => {
    if (window.TEUI?.Calculator?.calculateAll) {
      window.TEUI.Calculator.calculateAll();
    }
  }, 50);
}

// 🔧 WORKAROUND (Oct 18, 2025): Apply same cascade to d_116
// NOTE: This is a workaround for Cooling.js initialization issue
// Proper fix is to ensure ref_ values exist before Cooling.js initializes
if (fieldId === "d_116") {
  setTimeout(() => {
    if (window.TEUI?.Calculator?.calculateAll) {
      window.TEUI.Calculator.calculateAll();
    }
  }, 50);
}
```

**Why this is a workaround:**

- ❌ Triggers full cascade on every d_116 change (performance hit)
- ❌ Doesn't fix the root cause (initialization order)
- ❌ Doesn't achieve calculation parity (different code paths)
- ❌ Still has "laggy" behavior for h_21, i_59 changes

#### Option 3: Fix Cooling.js to Not Require Pre-initialization ✅ ARCHITECTURAL FIX

**The Target Way**: Target mode doesn't need values pre-initialized because unprefixed values always exist in StateManager.

**Make Reference mode work the same way**:

**Code Change**: [4012-Cooling.js:693-747](../4012-Cooling.js#L693-L747)

Remove initialization dependency on StateManager values - let `calculateAll(mode)` read fresh values each time:

```javascript
function initialize(params = {}) {
  // ❌ REMOVE: Don't pre-load values during init
  // Let calculateAll() read fresh values mode-aware each time

  // Register with StateManager
  registerWithStateManager();

  // ✅ NEW: Run initial calculations for BOTH modes
  calculateAll("target"); // Initialize Target cooling values
  calculateAll("reference"); // Initialize Reference cooling values

  state.initialized = true;
}
```

**Why This Achieves Parity:**

1. ✅ Both modes initialized equally
2. ✅ No dependency on pre-existing ref\_ values
3. ✅ calculateAll() always reads fresh via getModeAwareValue()
4. ✅ Same code path for both modes
5. ✅ No workarounds needed in S13
6. ✅ Matches Target mode architecture exactly

---

## CORRECTED UNDERSTANDING - October 18, 2025

### THE "m_129 = 0" WAS NOT A BUG! ⚠️

**Critical Realization**: We were chasing a phantom bug.

**Why m_129 = 0 is CORRECT behavior**:

- When Ventilation = "Constant Volume" (default setting)
- Free cooling from ventilation provides 100% cooling capacity
- Mechanical cooling load legitimately = 0
- **This is working as designed!** ✅

**From Logs.md**:

```
[Cooling m_124 COOLING-TARGET] m_129_annual=0, E37_daily=0  ← CORRECT when free cooling = 100%
```

### What ARE the Real Bugs?

The actual user-reported issues are **NOT about m_129 = 0**. They are:

1. ❌ **Capacitance toggle (h_21) doesn't affect cooling calculations in Reference mode (S03)**
2. ❌ **Indoor RH% slider (i_59) doesn't affect cooling calculations in Reference mode (S08)**

These are likely **input routing issues** - user changes in Reference mode aren't:

- Being routed to Reference state correctly, OR
- Triggering Reference recalculations, OR
- Being read by cooling calculations

### Proper Test Scenario

To test cooling bugs, use a scenario where mechanical cooling IS needed:

**Setup**:

- Heating system: Electricity (triggers cooling in Reference)
- Cooling system: Cooling (enabled)
- Ventilation: Volume by Schedule (NOT constant - reduces free cooling)

**Then test**:

- Change capacitance (h_21) → should affect cooling load
- Change indoor RH% (i_59) → should affect latent cooling load

### Investigation Path Forward

1. **Test proper scenario** (Elec + Cooling + Scheduled vent)
2. **Verify m_129 > 0** (mechanical cooling needed)
3. **Test h_21 capacitance** in Reference mode - does it recalculate?
4. **Test i_59 RH%** in Reference mode - does it recalculate?
5. **Use console.trace()** if inputs aren't routing correctly

### Lessons Learned

- ❌ Don't assume m_129=0 is a bug without understanding physics
- ❌ Don't implement "fixes" before confirming the symptom is actually wrong behavior
- ✅ Test with proper scenarios where the effect SHOULD be visible
- ✅ Understand the domain (free cooling can eliminate mechanical cooling need)

---

## ROOT CAUSES IDENTIFIED - October 18, 2025 ✅

### Diagnostic Results from COOLING-REF-DEBUG-SCRIPT.md

**Test Scenario**: Electricity heating + Cooling enabled + Scheduled ventilation

**Findings**:

#### ❌ ISSUE 1: S03 not publishing ref_h_21 to StateManager

```
Reference h_21:           null (StateManager)          ← MISSING!
Reference h_21:           Capacitance (S03.ReferenceState)  ← EXISTS locally
Reference i_21:           null% (StateManager)          ← MISSING!
```

**Impact**:

- Capacitance value stored locally in S03 but not accessible to downstream sections
- ref_h_22 (Ground-Facing CDD) calculation uses stale/default values
- S11 ground-facing heat gains (k_95) identical for both modes despite different capacitance settings

#### ❌ ISSUE 2: S08 not publishing ref_i_59 to StateManager

```
Reference i_59:           null% (StateManager)          ← MISSING!
Reference i_59:           50% (S08.ReferenceState)      ← EXISTS LOCALLY
```

**Impact**:

- Indoor RH% stored locally in S08 but not accessible to Cooling.js
- Latent load factor identical for both modes despite different RH%
- Cooling.js reads stale/default RH% value

**Evidence**:

```
Target latent load:       1.746353948454419 (factor)
Reference latent load:    1.746353948454419 (factor)  ← IDENTICAL despite different RH%!
```

### The Fix: StateManager Publication

Both S03 and S08 need to publish user-modified Reference inputs to StateManager with `ref_` prefix.

#### Fix 1: S03 Capacitance Publication

**File**: `4012-Section03.js`

S03 needs to publish when capacitance changes in Reference mode:

```javascript
// When h_21 changes in Reference mode
if (isReferenceCalculation || ModeManager.currentMode === "reference") {
  // Publish to StateManager for downstream sections
  window.TEUI.StateManager.setValue("ref_h_21", h_21_value, "user-modified");

  // If capacitance slider (i_21) also changed
  window.TEUI.StateManager.setValue("ref_i_21", i_21_value, "user-modified");
}
```

**What to look for**:

- Find where h_21 dropdown handler publishes to StateManager
- Check if it publishes BOTH unprefixed (Target) AND ref\_ prefixed (Reference)
- Add ref\_ publication if missing

#### Fix 2: S08 Indoor RH% Publication

**File**: `4012-Section08.js`

S08 needs to publish when indoor RH% changes in Reference mode:

```javascript
// When i_59 changes in Reference mode
if (isReferenceCalculation || ModeManager.currentMode === "reference") {
  // Publish to StateManager for Cooling.js and other downstream sections
  window.TEUI.StateManager.setValue("ref_i_59", i_59_value, "user-modified");
}
```

**What to look for**:

- Find where i_59 slider handler publishes to StateManager
- Check if it publishes with ref\_ prefix in Reference mode
- Add ref\_ publication if missing

### Expected Behavior After Fix

**After fixing S03 publication**:

- Changing h_21 from Static → Capacitance in Reference mode
- Should update ref_h_22 (Ground-Facing CDD)
- Should update ref_k_95 (S11 ground-facing cooling)
- Should affect ref_d_129 and ref_m_129 (cooling demand)

**After fixing S08 publication**:

- Changing i_59 slider in Reference mode
- Should update ref_cooling_latentLoadFactor
- Should affect ref_d_129 and ref_m_129 (cooling demand)

### Pattern: User Input Publication

This follows the established pattern from other sections:

**Dual-Engine Pattern**: User inputs must be published TWICE:

1. **Unprefixed** for Target mode (always)
2. **ref\_ prefixed** for Reference mode (when in Reference mode or for Reference calculations)

**Example from other sections** (S02, S09, S11):

```javascript
// Dropdown change handler
element.addEventListener("change", function () {
  const value = this.value;

  // Target mode publication
  StateManager.setValue(fieldId, value, "user-modified");

  // Reference mode publication (if in Reference mode)
  if (ModeManager.currentMode === "reference") {
    StateManager.setValue(`ref_${fieldId}`, value, "user-modified");
  }
});
```

S03 and S08 likely have this pattern but may be missing the `ref_` publication for these specific fields.

---

## Deeper Investigation & Surgical Plan - October 18, 2025

### The "Location Works" Paradox

A key question was raised: If the local `ModeManager` in S03 is out of sync, why do location changes (`d_19`) in Reference mode correctly update the Reference model?

This pointed to a more nuanced bug. The issue isn't a total failure of the local `ModeManager`, but a difference in how event handlers for various fields are implemented within `4012-Section03.js`.

### Investigation Findings: Divergent Code Paths

A direct analysis of `4012-Section03.js` reveals the precise cause:

1.  **Successful Path (Location - `d_19`):** The event handler for the location dropdown correctly calls `ModeManager.setValue("d_19", ...)`. This function contains the critical logic to check the local `currentMode` and correctly publish a `ref_` prefixed value to the global `StateManager` when in Reference mode. This is the correct implementation.

2.  **Flawed Path (Capacitance Dropdown - `h_21`):** The event handler for the capacitance dropdown incorrectly calls `DualState.setValue("h_21", ...)`. While `DualState` is an alias for `ModeManager`, this specific implementation path bypasses the crucial logic that checks the mode and publishes the `ref_` prefixed value. It defaults to publishing the unprefixed value, which Reference mode ignores.

3.  **Flawed Path (Capacitance Slider - `i_21`):** The slider's event handling is managed by the global `FieldManager`. A listener in S03 is supposed to bridge this change back to the local state, but this bridge is also flawed and fails to ensure the `ref_i_21` value is published to the global `StateManager`.

**Conclusion:** The bug is a publication failure specific to the capacitance controls. They use different and incorrect event handling paths compared to the location control.

### Surgical Repair Plan

The fix is to align the capacitance controls' event handlers with the working pattern used by the location control.

1.  **Target File:** `4012-Section03.js`.
2.  **Action for `h_21` (Dropdown):** Modify the `'change'` event listener for the capacitance dropdown. Ensure it calls `ModeManager.setValue("h_21", ...)` instead of `DualState.setValue(...)` to engage the correct mode-aware publication logic.
3.  **Action for `i_21` (Slider):** Modify the `StateManager` listener for `i_21`. The logic that bridges the update from `FieldManager` must also be routed through `ModeManager.setValue("i_21", ...)` to ensure the `ref_i_21` value is published correctly when in Reference mode.
4.  **Validation:** After the changes, test that modifying `h_21` and `i_21` in Reference mode results in `ref_h_21` and `ref_i_21` appearing in the global `StateManager`, which should in turn cause S11 and S13 to update correctly.

This surgical approach avoids broad changes and directly addresses the identified point of failure, minimizing the risk of unintended side effects.

---

## Final Resolution - October 19, 2025

After multiple attempts, the final root cause was identified as a two-part failure in the data flow for reference mode calculations involving the capacitance slider (`i_21`). While the capacitance dropdown (`h_21`) was eventually fixed, the slider's value was not being correctly consumed by Section 11.

### Root Cause Analysis

1.  **S03 State Bridging Failure:** Section 03's local `ReferenceState` was not being updated when the `i_21` slider was moved in reference mode. The global `FieldManager` correctly published the `ref_i_21` value to the global `StateManager`, but S03 was missing a listener to capture this change and update its internal `ReferenceState`. This caused S03's own calculations (like `ref_h_22`) to use a stale value for capacitance.

2.  **S11 Calculation Logic Flaw:** Section 11 was correctly recalculating when triggered by changes in S03. However, within its `calculateComponentRow` function, it was **always reading the target mode capacitance value (`i_21`)** instead of the reference mode value (`ref_i_21`) during reference calculations. This meant that even when S03 sent the correct triggers, S11 would perform the calculation with the wrong input data.

### The Fix (Commit `70ab424`)

The solution required fixes in both `4012-Section03.js` and `4012-Section11.js`.

#### 1. Fix in `4012-Section03.js`

A dedicated `StateManager` listener was added to the `initializeEventHandlers` function. This listener specifically listens for `ref_i_21` and ensures that any change from the global `FieldManager` is correctly bridged into S03's local `ReferenceState`.

```javascript
// In sections/4012-Section03.js

// ... inside initializeEventHandlers ...
// Add listener for the reference capacitance slider
window.TEUI.StateManager.addListener("ref_i_21", (newValue) => {
  this.ReferenceState.setValue("i_21", newValue);
});
```

#### 2. Fix in `4012-Section11.js`

The `calculateComponentRow` function was made fully mode-aware. A check for `isReferenceCalculation` was added at the point where the capacitance factor was being determined. If in a reference calculation, the function now correctly fetches `ref_i_21` from the global `StateManager`.

```javascript
// In sections/4012-Section11.js

// ... inside calculateComponentRow ...
let capacitanceFactor_i21;
if (isReferenceCalculation) {
  capacitanceFactor_i21 = getGlobalNumericValue("ref_i_21") / 100;
} else {
  capacitanceFactor_i21 = getGlobalNumericValue("i_21") / 100;
}
// ... rest of calculation uses the correct capacitanceFactor_i21
```

### Outcome

With these two changes, the entire data chain for reference mode was repaired:

1.  Moving the `i_21` slider in reference mode correctly updates S03's internal state.
2.  S03's calculations use the correct, updated capacitance value.
3.  S11 is triggered to recalculate and now uses the correct `ref_i_21` value.
4.  The final cooling calculations are now correctly affected by the capacitance slider in reference mode, achieving full calculation parity with target mode.

---

## i_59 Indoor RH% Bug Investigation - October 19, 2025

After resolving the capacitance bugs, a related issue with the S08 Indoor RH% slider (`i_59`) was investigated. The symptom is identical: the slider works in Target mode but has no effect on cooling calculations in Reference mode.

### Analysis

The root cause was diagnosed as a two-part problem:

1.  **Publication Failure (S08)**: `4012-Section08.js` was not publishing the `ref_i_59` value to the global `StateManager` when in Reference mode. This was fixed by adding the appropriate publication logic to the `i_59` event handler.
2.  **Listening Failure (Cooling.js)**: `4012-Cooling.js` was only listening for `i_59` and had no listener for `ref_i_59`.

### Repair Attempts & Regressions

Several attempts were made to fix the listening failure in `4012-Cooling.js`, but each introduced significant regressions:

1.  **First Attempt (Dual Engine Recalculation)**: The initial fix modified the `i_59` listener to trigger a recalculation of both the Target and Reference models.

    - **Result**: This introduced severe "state mixing," where changes in Reference mode incorrectly altered Target mode calculations. This approach was reverted.

2.  **Second Attempt (Separate Listeners)**: Following the architectural principle of using paired listeners, separate listeners for `i_59` (Target) and `ref_i_59` (Reference) were implemented. Each listener was responsible for triggering a full recalculation of its respective model (`calculateAll('target')` or `calculateAll('reference')`).
    - **Result**: This also led to state mixing and a "one-shot" bug, where the first change in Reference mode would work, but all subsequent calculations would be blocked. This change was also reverted.

### Current Status & Next Steps

- **`4012-Section08.js`**: Contains the uncommitted fix for the publication failure. This change is stable and correct.
- **`4012-Cooling.js`**: Has been reverted to its original state, which still contains the listening failure.

**Conclusion**: The problem within `4012-Cooling.js` is more complex than a simple missing listener. The regressions suggest that the internal state management of `Cooling.js` is not robust enough to handle the dual-engine calculation pattern without causing state contamination. Further work is required to refactor the state handling within `Cooling.js` to be fully compliant with the project's dual-state architecture before this bug can be resolved without side effects. This work is postponed for now.

---

## Fresh Investigation - October 19, 2025 (Evening Session)

After deploying the capacitance fix (commit `70ab424`) to gh-pages and resolving deployment script issues, we returned to investigate the `i_59` (Indoor RH%) bug with fresh perspective.

### Key Discoveries

#### 1. S08 Publication Works Correctly ✅

**Test Results** (from Logs.md):

```
Target (i_59): 45
Reference (ref_i_59): 62
✅ SUCCESS: 'ref_i_59' is present in the StateManager.
```

**Finding**: S08's ModeManager.setValue() publishes `ref_i_59` correctly when S08 is in Reference mode. The architecture is sound.

**Code verified** ([4012-Section08.js:194-206](../sections/4012-Section08.js#L194-L206)):

- Slider event handler calls `ModeManager.setValue(fieldId, value)` ✅
- ModeManager checks `currentMode` and publishes with `ref_` prefix when in Reference mode ✅
- No architectural changes needed ✅

#### 2. Cooling.js Mode Awareness Works ✅

**Code verified** ([4012-Cooling.js:464](../4012-Cooling.js#L464)):

- S13 calls `CoolingCalculations.calculateAll("reference")` when in Reference mode
- Cooling.js sets `state.currentMode = mode` based on parameter
- `getModeAwareValue()` reads with `ref_` prefix when in Reference mode

#### 3. The Real Problem: Cooling.js Mode Stuck in Target 🔴

**Critical Log Evidence** (Logs.md line -5):

```
Current Mode: target  ← WRONG! Should be "reference"
Internal Indoor RH: 0.45  ← Reading target i_59, not ref_i_59
```

**Despite:**

- S08 being in Reference mode
- S13 being in Reference mode
- ref_i_59 = 62 in StateManager

**Cooling.js is executing in Target mode!**

#### 4. Suspicious Calculation Flow

**Log sequence** (Logs.md lines -43 to -31):

```
[FieldManager] Routed i_59=47 through sect08 ModeManager
[Multiple clock events]
S08 ReferenceState: Synced i_59 = 45 from global StateManager (ref_i_59)
[Cooling] 🚀 Starting cooling calculations (mode=reference)...
[Cooling] 📊 Publishing results with prefix="ref_" (mode=reference)
```

**Then immediately** (lines -24 to -20):

```
[Cooling] 🚀 Starting cooling calculations (mode=target)...
[Cooling] 📊 Publishing results with prefix="" (mode=target)
```

**Observation**: Cooling.js runs TWICE - once in Reference mode, then again in Target mode. The Target calculation may be overwriting the Reference results!

### Working Theory

**Hypothesis**: When the i_59 slider changes:

1. ✅ S08 publishes `ref_i_59` correctly
2. ✅ S13 Reference calculations trigger
3. ✅ Cooling.js calculates in Reference mode
4. ❌ **Something triggers a second Target calculation**
5. ❌ Target calculation overwrites/interferes with Reference results
6. ❌ User sees no change because Target values dominate

**Possible causes**:

- A StateManager listener triggering both Target and Reference recalculations
- S13 calling Cooling.js twice (once for each mode) during the same update cycle
- Cross-section listener contamination (Anti-Pattern #6)
- FieldManager routing causing dual triggers

### Workplan for Tomorrow

#### Phase 1: Identify Dual Calculation Trigger

1. **Add console.trace() to Cooling.js calculateAll()**

   - Location: Line 461 (start of calculateAll)
   - Log the call stack to see WHO is calling Cooling.js in each mode
   - Identify if there's a listener causing dual triggers

2. **Check S13's calculation flow**

   - Review where S13 calls `CoolingCalculations.calculateAll()`
   - Verify it's not being called for both modes during same cycle
   - Check if S13 has listeners that might trigger Target recalculation

3. **Audit StateManager listeners**
   - Search for listeners on `i_59` and `ref_i_59`
   - Identify which sections listen and what they trigger
   - Look for listeners that call calculateAll() without mode awareness

#### Phase 2: Implement Targeted Fix

Based on Phase 1 findings, likely solutions:

**Option A: If dual trigger from S13**

- Ensure S13 only calls Cooling.js once per user interaction
- May need to debounce or sequence calculations properly

**Option B: If listener contamination**

- Remove or fix listeners causing cross-mode triggering
- Follow CHEATSHEET Anti-Pattern #6 guidance
- Ensure listeners are mode-specific

**Option C: If Cooling.js state persistence**

- Ensure Cooling.js fully resets state between mode calculations
- May need to isolate Target and Reference state more strictly

#### Phase 3: Validation

1. Move i_59 slider in Reference mode
2. Verify only ONE Cooling.js calculation runs (in Reference mode)
3. Verify ref_d_117 (cooling load) changes appropriately
4. Test that higher RH% → lower latent load → lower total cooling load
5. Verify Target mode still works correctly

### Expected Outcome

When working:

- Moving i_59 slider with S08/S13 in Reference mode
- `ref_d_117` should update to reflect new latent load
- Higher ALLOWABLE RH% (e.g., 70%) should show LOWER cooling load than lower RH% (e.g., 45%)
  - Higher allowable RH% means occupants tolerate more humidity
  - Less latent cooling required
  - Total cooling load decreases

---

## Diagnostic Results - October 20, 2025

After running diagnostics with console.trace() and i_59 value logging, we confirmed the following:

### ✅ What IS Working

1. **S08 Publication** ✅

   - S08 correctly publishes `ref_i_59` to StateManager when in Reference mode
   - Confirmed: `ref_i_59 = 77` in StateManager (Logs.md line -93)
   - ModeManager.setValue() architecture is sound

2. **Cooling.js Mode Awareness** ✅

   - Cooling.js correctly reads `ref_i_59` when in Reference mode
   - Confirmed: `mode=reference, i_59_value=77, will use indoorRH=0.77` (Logs.md line -93)
   - getModeAwareValue() is working correctly

3. **Dual-Engine Pattern** ✅

   - Both Target and Reference calculations run as designed (not a bug)
   - Reference calculation uses ref_i_59 (77%)
   - Target calculation uses i_59 (45%)
   - No state mixing - each engine reads its own values

4. **Different Calculation Results** ✅

   - Reference m_129: 15,402 kWh
   - Target m_129: 10,679 kWh
   - Values ARE different, calculations ARE running

5. **S13 calculateCoolingSystem()** ✅
   - Returns d_117 value for both Target and Reference (line 2521)
   - Reference results stored via storeReferenceResults() (lines 3264, 3277-3285)
   - Should publish ref_d_117 to StateManager

### ❌ What Is NOT Working

**SYMPTOM**: `ref_d_117` (Reference cooling load) does not change when `ref_i_59` changes

**Expected**: Moving i_59 slider from 45% → 77% should DECREASE ref_d_117 (less latent cooling needed)

**Actual**: ref_d_117 remains unchanged regardless of ref_i_59 value

### 🔍 What We Still Don't Know

**Critical Unknown**: Does ref_d_117 actually get published to StateManager?

We confirmed:

- ✅ Cooling.js reads ref_i_59 correctly
- ✅ S13 calculateCoolingSystem() calculates d_117 value
- ✅ S13 returns d_117 in coolingResults object
- ✅ storeReferenceResults() should publish it as ref_d_117

**But we have NOT confirmed**:

- ❓ Does ref_d_117 actually appear in StateManager?
- ❓ If yes, is the UI reading and displaying it?
- ❓ If no, where in the chain does it fail to publish?

### 🤔 Theories (Unconfirmed)

**Theory A: d_117 calculation doesn't use i_59**

- Cooling.js calculates latent load using i_59
- But d_117 might be calculated from m_129 (mitigated cooling demand)
- If m_129 doesn't change with i_59, then d_117 won't change either
- Need to trace: Does i_59 → latent load → d_129 → m_129 → d_117?

**Theory B: Publication failure**

- calculateCoolingSystem() returns d_117
- But storeReferenceResults() might not be receiving it correctly
- Or the publication loop might skip it

**Theory C: UI display issue**

- ref_d_117 IS published and updated
- But the UI field doesn't refresh/display the new value
- Less likely given capacitance fix works fine

### 📋 Next Investigation Steps

1. **Add diagnostic to confirm StateManager publication**

   ```javascript
   // In S13 storeReferenceResults(), after line 3285
   console.log(`[S13] 🔍 Published ref_d_117 =`, allResults.d_117);
   ```

2. **Check if d_117 calculation depends on i_59**

   - Review COOLING-TARGET-VARIABLES.json
   - Trace the formula chain: i_59 → latent load → cooling demand → d_117
   - Confirm that changing i_59 SHOULD change d_117

3. **Verify m_129 changes with i_59**

   - Check if ref_m_129 changes when ref_i_59 changes
   - m_129 is the cooling demand that feeds into d_117 calculation
   - If m_129 doesn't change, d_117 won't change

4. **Simplify the problem**
   - Instead of chasing through S13 hall of mirrors
   - Ask: What Excel formula calculates d_117?
   - Does that formula include i_59 (directly or indirectly)?
   - If not, this might be a fundamental calculation gap

### 🎯 Current Status

**We are NOT closer to solving this yet** because we have confirmed the architecture works (publication, mode-awareness, dual-engine) but haven't identified:

1. WHERE the calculation chain breaks (if at all)
2. WHETHER d_117 is even supposed to change with i_59
3. WHAT the actual formula dependencies are

**Next session should focus on**: Understanding the FORMULA, not the architecture. Use COOLING-TARGET-VARIABLES.json to trace the dependency chain from i_59 to d_117.

---
