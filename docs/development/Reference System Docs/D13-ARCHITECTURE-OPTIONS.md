# d_13 Reference Standard Architecture: Implementation Guide

**Date**: 2025-11-10 (Updated: 2025-11-19)
**Status**: ✅ **OPTION 3 SELECTED - PHASES 1-6 COMPLETE - PHASE 4 NEEDS ARCHITECTURAL FIX**
**Branch**: `D13-UPDATE`
**Purpose**: Originally presented three architectural approaches for CTO review - Now serves as implementation guide for Option 3
**Context**: Resolving m_65 compliance calculation showing 238% instead of 100% (and all other M/N Target Model Value/Reference Model Value comparison calculations)

---

## 🎯 IMPLEMENTATION READY - START HERE (Fresh Agent Briefing)

**Last Updated**: November 19, 2025
**Current Status**: Phases 1-6 complete, Phase 4 needs architectural fix, then proceed to Phase 7

### What's Been Accomplished (Phases 1-6)

✅ **Phase 1**: Audited all d_13/ref_d_13 listener behavior across 7 sections
✅ **Phase 2**: Made all d_13 listeners passive (no automatic ReferenceState updates)
✅ **Phase 3**: Added passive ref_d_13 listeners to all sections
✅ **Phase 4**: Wired "Set Values" button (BUT implementation is incomplete - see below)
✅ **Phase 5**: Updated all ReferenceState methods to read ref_d_13 (not d_13)
✅ **Phase 6**: Added TargetState.applyReferenceValues() methods to all sections

### 🚨 CRITICAL: Phase 4 Needs Architectural Fix

**The Problem**: Current `Section02.applyReferenceValuesOverlay()` implementation (lines 1070-1130) is missing the **Import Quarantine pattern**, causing:
- DOM not updating with new values
- Calculations firing prematurely
- Value "drift" on repeated button clicks
- Inconsistent h_10 (S01 grand total) results

**The Solution**: **Delegate to FileHandler instead of implementing in Section02**

### Why Delegate to FileHandler?

✅ **Single Responsibility** - FileHandler owns all "bulk value application" operations
✅ **Code Reuse** - Import Quarantine pattern already exists and works perfectly
✅ **Maintainability** - One place to fix, not two
✅ **Consistency** - "Set Values" button treats ReferenceValues.js as internal import source
✅ **Proven** - FileHandler's Excel import works perfectly every time

### What You Need to Implement (2 Simple Tasks)

#### Task 1: Add Method to FileHandler.js
**File**: `src/core/FileHandler.js`
**Location**: After existing import methods (~line 735+)
**Method Name**: `applyReferenceValuesFromStandard(standard, targetMode)`
**Implementation**: Full 5-phase Import Quarantine pattern
**Reference**: See [SETTING-VALUES.md](./SETTING-VALUES.md) lines 327-442 for complete code

#### Task 2: Simplify Section02.js Button Handler
**File**: `src/sections/Section02.js`
**Action**: Replace existing `applyReferenceValuesOverlay()` function (lines 1070-1130)
**New Implementation**: Simple delegation (~15 lines instead of 80+)
**Reference**: See [SETTING-VALUES.md](./SETTING-VALUES.md) lines 295-325 for complete code

### Test After Implementation

1. **Target mode**: d_13 = "PH Classic", click "Set Values" → d_66 should become 1.1
2. **Reference mode**: ref_d_13 = "OBC SB10 5.5-6 Z6", click "Set Values" → ref_d_66 should become 2.0
3. **Verify isolation**: Switch modes - values should NOT contaminate each other
4. **Verify stability**: Repeat steps 1-2 multiple times - no value drift, h_10 remains stable

### Then Proceed to Phase 7 (Integration Testing)

After Tasks 1-2 are complete and tested, proceed to **Phase 7: Integration Testing & Validation** (see section below at line 1271)

### Key Reference Documents

- **[SETTING-VALUES.md](./SETTING-VALUES.md)** - Complete implementation details, FileHandler's proven pattern
- **[ReferenceValues.js](../../src/core/ReferenceValues.js)** - Internal import source (code baseline values by standard)
- **Commit df1bf7e** - Where SETTING-VALUES.md was created with pattern analysis

---

## 🎯 SELECTED APPROACH: Option 3 - Explicit "Set Values" Button

**Decision Date**: 2025-11-18
**Implementation Branch**: `D13-UPDATE`

### Key Benefits of Option 3:
- ✅ Perfect state isolation (d_13 and ref_d_13 completely independent)
- ✅ Dual-purpose button: Applies ReferenceValues to Target OR Reference model
- ✅ NEW behavior: Target mode can load code-minimum baseline values
- ✅ User control: Explicit action required (no accidental contamination)
- ✅ Fixes 238% bug architecturally (no cross-contamination possible)
- ✅ Button infrastructure already built (commit 305f52f)

See [Implementation Workplan](#implementation-workplan) at end of document for detailed task breakdown.

---

## Current Symptom

**Test Case**: Set Target AND Reference d_13 to "PH Classic" (d_65 baseline = 2.1 W/m², based on nested lookup in Section09.js, tied to Occupancy Selection at d_12)
- **Expected**: m_65 = 100% when d_65 = 2.1 (perfect compliance)
- **Presently**: Reference model m_65 = 238% (incorrect)

**Root Issue**: d_13 and ref_d_13 should be independent.

---

## OPTION 1: "No State Mix" (Strict Dual-State Isolation)

### Architectural Principle

**d_13 and ref_d_13 are completely independent fields**

- d_13 = Target model's reference standard
- ref_d_13 = Reference model's reference standard
- NO synchronization between them
- Each model has sovereign control over its reference standard

### How It Should Work

Example 1.
```
Target Model Default (d_13 = "OBC SB10 5.5-6 Z6"):
├─ Uses d_65 Default lookup based on Occupancy set at Section09.js (7 for A-Assembly)
└─ Default: d_65 = 7

User sets Reference Model (ref_d_13 = "PH Classic"):
├─ Uses 2.1 based on 'PH' in ref_d_13 selection
└─ ref_d_65 = 2.1

Compliance: m_65 = d_65/ref_d_65 or (7 / 2.1) * 100 = 333% X FAIL
d_65>ref_d_65 by ~333% receives a red X at n_65, and m_65 displays 333%
```
Example 2.
```
Target Model Default (d_13 = "OBC SB10 5.5-6 Z6"):
├─ Uses f_85 Default or Imported or User-Modified value set at Section11.js (9.35 on Initialization), whichever value was last set.
└─ Default: f_85 = 9.35
└─ ReferenceValues.js: f_85 = 5.30
User presses 'Set Values' and f_85 value of 9.35 gets over-written by 5.30

Reference Model, user selects ref_d_13 = "PH Classic", then presses Reference Mode's 'Set Values' :
├─ f_85 loads 4.87 based on ReferenceValues.js (PH standards do not set minimum insulation levels, so NBC level is used in ReferenceValues.js lookup for PH Classic Standard)
└─ ref_f_85 = 4.87

Target Compliance: m_85 = f_85/ref_f_85 or (5.30 / 4.87) * 100 = 109% ✓ PASS
Green ✓ at n_85, and m_85 displays 109%

Reference Compliance: ref_m_85 = ref_f_85/f_85 or (4.87 / 5.30) * 100 = 92% X FAIL
Red X at ref_n_85, and ref_m_85 displays 109%. This shows that based on the standard selected in the Target model, the Reference Value is lower/inferior and must be remedied. The opposite may be true (Target worse than Reference) in which case user gets visual feedback that Target model value must be improved. 
```

### Implementation Requirements

**ReferenceState.setDefaults()**: Must read from `ref_d_13`
```javascript
const currentStandard =
  window.TEUI?.StateManager?.getValue?.("ref_d_13") || "OBC SB10 5.5-6 Z6";
```

**Listener Pattern**: Separate listeners, no cross-contamination
```javascript
// Target standard changes - affects Target only
window.TEUI.StateManager.addListener("d_13", () => {
  calculateTargetModel(); // Target only uses d_13 if a user presses 'Set Values'
});

// Reference standard changes - affects Reference only when ref_d_13 is selected and 'Set Values' applies values from ReferenceValues.js
window.TEUI.StateManager.addListener("ref_d_13", () => {
  ReferenceState.onReferenceStandardChange();
  calculateReferenceModel();
});
```
Update Note: Methods above must listen for 'Set Values' button-click at e_13, not d_13 dropdown changes 

### Pros

✅ **Perfect state isolation** - aligns with dual-state architecture principles
✅ **Flexibility** - Target and Reference can use different standards (ie SB12 C4 for Heatpump in Target, SB12 A3 in Reference for Gas Furnace)
✅ **Clear separation** - no synchronization complexity
✅ **Architectural purity** - follows established patterns from other sections

### Cons

❌ **Extra UI complexity** - Need to manage two dropdown selections

### Current Status

**Currently BROKEN (or synchronized, depending on how you think of it) in sections 05, 06, 11, 12, 13, 14**:
- ReferenceState.setDefaults() reads `d_13` (wrong field)
- d_13 listener calls ReferenceState.onReferenceStandardChange() (contamination)

**Would require fixing**:
- 6 sections need ReferenceState.setDefaults() to read `ref_d_13`
- 6 sections need d_13 listener removed from ReferenceState updates
- Section09 already partially correct (has ref_d_13 listener)

---

## OPTION 2: "One D13 Setting" (Synchronized Reference Standard - current function, inconsistent application!)

### Architectural Principle

**d_13 is the single source of truth for BOTH models' reference standard** Reference Standard sets Reference model. Easy to explain. 

- d_13 = Primary control for reference standard
- ref_d_13 = Mirror field that displays same value as d_13
- Bidirectional sync: changing either updates both
- One reference standard selection applies to both models

### How It Works

```
User selects d_13 = "PH Classic":
├─ Target Model: Uses user input values (d_65 = 2.1)
└─ Reference Model: Uses PH Classic code baseline (ref_d_65 = 2.1)

User selects d_13 = "PHIUS 2021":
├─ Target Model: Uses user input values (d_65 = 2.1)
└─ Reference Model: Uses PHIUS 2021 code baseline (ref_d_65 = 3.2)

Compliance: m_65 = (d_65 / ref_d_65) * 100
           = (2.1 / 2.1) * 100 = 100% (PH Classic)
           = (2.1 / 3.2) * 100 = 65.6% (PHIUS 2021)
```

### Implementation Requirements (pretty much what we have now)

**ReferenceState.setDefaults()**: Reads from `d_13` (current implementation ✅)
```javascript
const currentStandard =
  window.TEUI?.StateManager?.getValue?.("d_13") || "OBC SB10 5.5-6 Z6";
```

**Listener Pattern**: d_13 controls Reference overlay (current implementation ✅)
```javascript
// d_13 changes affect Reference model ReferenceValues overlay
window.TEUI.StateManager.addListener("d_13", (newValue) => {
  // Update Reference model with new ReferenceValues
  ReferenceState.onReferenceStandardChange(newValue);

  // Sync ref_d_13 to match d_13
  window.TEUI.StateManager.setValue("ref_d_13", newValue, "system-sync");

  // Recalculate both models
  calculateAll();
});
```

**Missing Implementation**: ref_d_13 synchronization
```javascript
// Need to add: Ensure ref_d_13 always mirrors d_13
// At initialization: ref_d_13 = d_13
// On d_13 change: update ref_d_13
// Optional: On ref_d_13 change: update d_13 (bidirectional)
```

### Pros

✅ **Simplicity** - One reference standard control for entire application
✅ **Maintainability** - No complex T-Cell or ReferenceValue lookups in M/N calcs, is just value/ref_value = XXX% pass/fail.
✅ **User experience** - Intuitive: "What code am I designing to?"
✅ **Teaching** - Easier to explain to users
✅ **Mostly working** - Current implementation 90% there, just needs ref_d_13 sync

### Cons

❌ **Less flexibility** - Can't compare Target against different reference standard, ie PH Classive vs. PH EnerPHit
❌ **Violates dual-state purity** - Target setting affects Reference model - but intentional
❌ **Architectural debt** - Diverges from established dual-state patterns
❌ **Cheatsheet conflict** - Contradicts Anti-Pattern 6 guidance

### Current Status

**Currently PARTIALLY WORKING**:
- 6 sections correctly have ReferenceState.setDefaults() reading `d_13` ✅
- 6 sections correctly have d_13 listener updating ReferenceState ✅
- Section09 has ref_d_13 listener (may cause conflicts?)

**Missing piece causing 238% bug**:
- ref_d_13 not synchronized with d_13
- Need to add sync logic at initialization and on change
- Compliance calculations may be reading wrong values

---

## OPTION 3: "Explicit Set Values Button" (Perfect Isolation + User Control)

### Architectural Principle

**Complete state isolation with explicit user action for Reference overlay**

- d_13 = Target model's reference standard (for M/N compliance display in Target mode)
- ref_d_13 = Reference model's reference standard (independent control)
- NO automatic synchronization between d_13 and ref_d_13
- Reference model values from ReferenceValues.js ONLY applied when:
  1. User is in Reference mode
  2. User explicitly clicks "Set Values" button

### How It Works

```
Target Mode:
├─ User changes d_13 dropdown → Updates d_13 value only
├─ "Set Values" button VISIBLE and enabled (NEW: dual-purpose button!)
├─ User clicks "Set Values" → TargetState receives/applies values overlay from ReferenceValues.js and Target DOM refreshes UI
├─ Target model populated with code-minimum baseline values
└─ User can see "what if we just built to code minimum?"

Reference Mode:
├─ User changes ref_d_13 dropdown → Updates ref_d_13 value only
├─ "Set Values" button visible and enabled
├─ User clicks "Set Values" → ReferenceState receives overlay from ReferenceValues.js
└─ Reference model receives code baseline values

M/N Compliance Calculation (Simple):
├─ m_65 = (f_85 / ref_f_85) * 100 (sometimes this is ref_f_85/f_85, we can review on a field by field bassis)
├─ Just value/ref_value - no complex additional lookups required
└─ Works consistently regardless of how values were set
```

### Implementation Requirements

**EFFICIENCY NOTE**: Rather than removing existing listeners, we **rewire** them to the button. The current d_13 listeners already call the correct `ReferenceState.onReferenceStandardChange()` logic - we just need to move that trigger from automatic → explicit button click.

**1. Rewire existing d_13 listener logic to button** (S05, S06, S09, S11, S12, S13, S14):
```javascript
// ❌ CHANGE FROM (automatic trigger):
window.TEUI.StateManager.addListener("d_13", () => {
  ReferenceState.onReferenceStandardChange();  // This logic is correct!
});

// ✅ CHANGE TO (passive listener - no automatic overlay):
window.TEUI.StateManager.addListener("d_13", () => {
  // Just store the selection - overlay applied by button click
  // No automatic ReferenceState update
});
```

**2. Add ref_d_13 listener** (passive, stores selection only):
```javascript
// ✅ ADD THIS:
window.TEUI.StateManager.addListener("ref_d_13", () => {
  // NO automatic overlay - wait for "Set Values" button click
  // Just store the selection
});
```

**3. Wire "Set Values" button in S02 (DUAL-PURPOSE - rewires existing logic)**:
```javascript
// In Section02.js initializeEventHandlers()
const setValuesBtn = document.getElementById("setValuesBtn");
if (setValuesBtn) {
  setValuesBtn.addEventListener("click", () => {
    if (ModeManager.currentMode === "reference") {
      // Reference mode: Apply ReferenceValues overlay to Reference model
      applyReferenceValuesOverlay("reference");
    } else {
      // Target mode: Apply ReferenceValues to Target model (code-minimum scenario)
      applyReferenceValuesOverlay("target");
    }
  });
}

function applyReferenceValuesOverlay(targetMode) {
  // Get the selected standard
  const standard = targetMode === "reference"
    ? window.TEUI.StateManager.getValue("ref_d_13")
    : window.TEUI.StateManager.getValue("d_13");

  // Apply to all sections with ReferenceValues
  [5, 6, 9, 11, 12, 13, 14].forEach(sectionNum => {
    const sectionModule = window.TEUI.SectionModules[`sect${String(sectionNum).padStart(2, '0')}`];

    if (targetMode === "reference") {
      // Apply to Reference model
      if (sectionModule?.ReferenceState?.onReferenceStandardChange) {
        sectionModule.ReferenceState.onReferenceStandardChange();
      }
    } else {
      // Apply to Target model (populate with code-minimum values)
      if (sectionModule?.TargetState?.applyReferenceValues) {
        sectionModule.TargetState.applyReferenceValues(standard);
      }
    }
  });

  console.log(`[S02] ReferenceValues from "${standard}" applied to ${targetMode.toUpperCase()} model`);

  // Recalculate and refresh UI
  if (typeof calculateAll === 'function') calculateAll();
  ModeManager.refreshUI();
  ModeManager.updateCalculatedDisplayValues();
}
```

**NEW: TargetState.applyReferenceValues() method** (add to each section):
```javascript
// In each section's TargetState object
applyReferenceValues: function(standard) {
  const referenceValues = window.TEUI?.ReferenceValues?.[standard] || {};

  // ⚠️ STATE ISOLATION SAFEGUARD: Only write to unprefixed fields (Target model)
  Object.keys(referenceValues).forEach(fieldId => {
    if (referenceValues[fieldId] !== undefined) {
      this.state[fieldId] = referenceValues[fieldId];  // ✅ Writes to d_65, NOT ref_d_65
      console.log(`[TargetState] Applied ${fieldId} = ${referenceValues[fieldId]} from ${standard}`);
    }
  });

  this.saveState();
  console.log(`[TargetState] Code-minimum values from ${standard} applied`);
}
```

**4. ReferenceState.setDefaults()**: Read from `ref_d_13`:
```javascript
const currentStandard =
  window.TEUI?.StateManager?.getValue?.("ref_d_13") || "OBC SB10 5.5-6 Z6";
```

**5. ReferenceState.onReferenceStandardChange()**: Verify state isolation safeguard:
```javascript
// ⚠️ STATE ISOLATION SAFEGUARD: Must ONLY write to ref_ prefixed fields
onReferenceStandardChange: function() {
  const standard = window.TEUI?.StateManager?.getValue?.("ref_d_13") || "OBC SB10 5.5-6 Z6";
  const referenceValues = window.TEUI?.ReferenceValues?.[standard] || {};

  Object.keys(referenceValues).forEach(fieldId => {
    const refFieldId = `ref_${fieldId}`;  // ✅ ALWAYS prefix with ref_
    if (referenceValues[fieldId] !== undefined) {
      this.state[refFieldId] = referenceValues[fieldId];  // ✅ Writes to ref_d_65, NOT d_65
    }
  });

  this.saveState();
}
```

**6. Mode-aware button visibility**:
```javascript
// In S02 ModeManager.switchMode()
const setValuesBtn = document.getElementById("setValuesBtn");
if (setValuesBtn) {
  // Button visible in BOTH modes (dual-purpose)
  setValuesBtn.style.display = "inline-block";
}
```

### Pros

✅ **Perfect state isolation** - d_13 and ref_d_13 are completely independent
✅ **User control** - Explicit action required to apply Reference overlay
✅ **Clear workflow** - User selects standard, then clicks button to apply
✅ **No accidental contamination** - Target changes never affect Reference
✅ **Architectural purity** - Follows dual-state principles perfectly
✅ **Flexibility** - Can select different standards for Target vs Reference
✅ **Teaching opportunity** - Button action makes ReferenceValues overlay explicit and understandable

### Cons

❌ **Extra step** - User must click button after selecting ref_d_13
❌ **Potential confusion** - Some users may not understand why button is needed
❌ **Implementation effort** - Need to wire button to trigger overlay across 7 sections
⚠️ **Initial learning curve** - Users need to understand the two-step process

### Current Status

**Button infrastructure**: ✅ Complete (just added in commit 305f52f)
- Button exists in S02 row 13, column E
- Styled to match dropdowns
- Tooltip support enabled (e_13)
- No functionality wired yet

**Architecture changes needed**:
1. **Rewire** d_13 listeners in 7 sections (S05, S06, S09, S11, S12, S13, S14) - make them passive (no automatic overlay)
2. Add ref_d_13 listeners (passive, store selection only)
3. Wire button click handler to trigger overlay (rewires existing `ReferenceState.onReferenceStandardChange()` logic)
4. Add new `TargetState.applyReferenceValues()` method to each section
5. Update `ReferenceState.setDefaults()` to read ref_d_13 (not d_13)
6. Verify `ReferenceState.onReferenceStandardChange()` only writes to ref_ prefixed fields
7. Button visible in BOTH modes (dual-purpose functionality)
8. Test thoroughly across all sections

**State Mixing Prevention Safeguards**:
- `ReferenceState` methods MUST ONLY write to `ref_` prefixed fields (ref_d_65, ref_d_113, etc.)
- `TargetState` methods MUST ONLY write to unprefixed fields (d_65, d_113, etc.)
- `ReferenceState.setDefaults()` MUST read from `ref_d_13` (not d_13)
- `TargetState.applyReferenceValues()` MUST read from `d_13` (not ref_d_13)
- M/N compliance calculation: `m_65 = (d_65 / ref_d_65) * 100` - simple value/ref_value (no cross-contamination possible)

### User Experience Flow

**Scenario A: User working in Target mode (Code-Minimum Population)**
1. User sees d_13 dropdown (selects reference standard for M/N compliance)
2. Changes d_13 → Stores selection only, no immediate effect on Target values
3. "Set Values" button visible and enabled
4. Clicks "Set Values" button → Target model populated with code-minimum baseline values from ReferenceValues.js
5. Target now shows "what if we just built to code minimum?"
6. M/N compliance: `m_65 = (d_65 / ref_d_65) * 100` uses Target/Reference values

**Scenario B: User working in Reference mode (Code Baseline)**
1. User sees ref_d_13 dropdown (selects code baseline standard)
2. Changes ref_d_13 → Stores selection only, no immediate effect
3. "Set Values" button visible and enabled
4. Clicks "Set Values" button → Reference model receives code baseline values from ReferenceValues.js
5. Reference calculations update with selected code baseline
6. Target model unaffected - perfect isolation maintained

**Scenario C: User switching between modes**
1. Target mode: d_13 = "PH Classic", clicks "Set Values" → Target gets PH Classic baseline (d_65 = 2.1)
2. Switch to Reference mode: ref_d_13 = "PHIUS 2021", clicks "Set Values" → Reference gets PHIUS baseline (ref_d_65 = 3.2)
3. M/N compliance: m_65 = (2.1 / 3.2) * 100 = 65.6%
4. Switch back to Target: Still shows PH Classic values (d_65 = 2.1)
5. Perfect isolation maintained - each model has independent values

**Scenario D: Why the 238% bug disappears with Option 3**
- Target: d_65 = 2.1 (from d_13 "PH Classic" overlay)
- Reference: ref_d_65 = 2.1 (from ref_d_13 "PH Classic" overlay)
- M/N compliance: m_65 = (2.1 / 2.1) * 100 = 100% ✅
- No cross-contamination possible because each model explicitly sets its own values
- No automatic listeners that could write to wrong fields

---

## Comparison Matrix

| Aspect | Option 1: No State Mix | Option 2: One D13 Setting | Option 3: Explicit Button |
|--------|----------------------|-------------------------|--------------------------|
| **State Isolation** | ✅ Perfect | ⚠️ Intentional coupling | ✅ Perfect |
| **Implementation Effort** | ❌ Fix 6 sections | ✅ Add sync logic only | ⚠️ Moderate - wire button + remove listeners |
| **User Experience** | ❌ Two dropdowns (confusing) | ✅ One dropdown (simple) | ✅ Two dropdowns + explicit button |
| **Flexibility** | ✅ Independent standards | ❌ Locked together | ✅ Independent standards |
| **Maintenance** | ⚠️ Complex M/N calcs | ✅ Simple M/N calcs | ✅ Simple M/N calcs |
| **Architecture Alignment** | ✅ Follows cheatsheet | ❌ Diverges from patterns | ✅ Perfect alignment |
| **Teaching/Learning** | ❌ More complex | ✅ Easier to explain | ✅ Educational - makes overlay explicit |
| **User Control** | ⚠️ Implicit (automatic) | ⚠️ Implicit (automatic) | ✅ Explicit (button click) |
| **Accidental Changes** | ⚠️ Possible if confused | ⚠️ Target affects Reference | ✅ Impossible - explicit action required |
| **Button Infrastructure** | ❌ Not needed | ❌ Not needed | ✅ Already built (commit 305f52f) |

---

## Investigation Required (Before Decision)

⚠️ **NOTE**: If Option 3 is chosen, most of this investigation becomes **irrelevant** because:
- The 238% bug disappears (perfect state isolation prevents cross-contamination)
- M/N compliance uses simple `value/ref_value` calculation (no complex lookups)
- Each model explicitly sets its own values via button click (no automatic listeners)

### Question 1: Does Target Model Use d_13?

**Answer**: YES - Target uses d_13 for M/N compliance labels in Target mode.

**Option 3 impact**:
- Target mode: d_13 selects which ReferenceValues to populate Target with (code-minimum scenario)
- Reference mode: ref_d_13 selects which ReferenceValues to populate Reference with (code baseline)
- Both models remain completely independent

### Question 2: What's Causing 238%?

**Current diagnosis**:
- Likely state mixing - ReferenceState methods writing to unprefixed fields, or vice versa
- OR ref_d_13 not synchronized with d_13 in Option 2 architecture
- OR inverted calculation (ref_d_65 / d_65 instead of d_65 / ref_d_65)

**Option 3 impact**:
- **238% bug becomes impossible** because:
  - Each model has explicit, separate overlay trigger
  - State isolation safeguards prevent cross-writes
  - M/N compliance: `m_65 = (d_65 / ref_d_65) * 100` - simple, no lookups
  - No automatic listeners that could contaminate wrong model

Debug compliance calculation (if investigating Options 1 or 2):
```javascript
console.log('d_13 =', window.TEUI.StateManager.getValue('d_13'));
console.log('ref_d_13 =', window.TEUI.StateManager.getValue('ref_d_13'));
console.log('d_65 =', window.TEUI.StateManager.getValue('d_65'));
console.log('ref_d_65 =', window.TEUI.StateManager.getValue('ref_d_65'));
console.log('m_65 = (d_65 / ref_d_65) * 100');
```

### Question 3: User Workflow Expectations?

**Scenario A**: User wants to design to PH Classic, compare against PH Classic
- Option 2: One dropdown, simple (but 238% bug risk)
- Option 3: Select d_13="PH Classic", click "Set Values" in Target mode → d_65=2.1; Select ref_d_13="PH Classic", click "Set Values" in Reference mode → ref_d_65=2.1; m_65 = 100% ✅

**Scenario B**: User wants to design to PH Classic, but compare against PHIUS 2021
- Option 1: Two independent dropdowns (architectural complexity)
- Option 3: Select d_13="PH Classic", click "Set Values" in Target → d_65=2.1; Select ref_d_13="PHIUS 2021", click "Set Values" in Reference → ref_d_65=3.2; m_65 = 65.6% ✅

**Scenario C**: User wants code-minimum scenario in Target mode (NEW - OAA meeting Nov 11)
- Option 1: Not supported
- Option 2: Not supported
- Option 3: Select d_13="PHIUS 2021", click "Set Values" in Target → Target populated with PHIUS code-minimum values; user can see "what if we just built to code?" ✅

---

## Recommendation Path

### Step 1: Debug Current State

1. Add logging to identify exact values causing 238%
2. Verify d_13 vs ref_d_13 values
3. Verify d_65 vs ref_d_65 values
4. Identify which value is incorrect

### Step 2: Decide Architecture

**If Option 1 (No State Mix)**:
- Fix 6 sections: ReferenceState.setDefaults() read ref_d_13
- Fix 6 sections: Remove d_13 → ReferenceState.onReferenceStandardChange()
- Add ref_d_13 listeners where missing
- Update 4012-CHEATSHEET.md with d_13/ref_d_13 pattern

**If Option 2 (One D13 Setting)**:
- Add d_13 → ref_d_13 synchronization
- Ensure ref_d_13 initialized from d_13
- Update 4012-CHEATSHEET.md to document this exception
- Test compliance calculations with synchronized values

### Step 3: Test Thoroughly

- Verify m_65 = 100% when d_65 = ref_d_65
- Verify compliance works across all M/N fields
- Test mode switching behavior
- Verify no state contamination in other sections

---

## Next Steps

1. **CTO Review**: Decide which architectural option to pursue
2. **Debug 238% symptom**: Identify exact cause with logging
3. **Implement chosen option**: Systematic fixes with testing
4. **Update documentation**: Reflect chosen architecture in cheatsheet
5. **Test thoroughly**: Verify compliance calculations work correctly

---

## Nov 11 Bug Investigation: d_13 Cascade Failure

**Date**: 2025-11-11
**Branch**: `dependency2`
**Status**: Bug is **architectural**, requires Option 3 implementation

### Summary

During dependency mapping work on S11, discovered that changing d_13 (Reference Standard dropdown) in Reference mode does not trigger downstream cascade to update e_10 (TEUI) without manual mode switch. Investigation revealed this is not a simple logic bug but an architectural issue with how ReferenceValues overlays propagate through the calculation chain.

### Related Commits

- **1b23dac**: Safe baseline (reverted to this after fix attempts failed)
- **c981154**: Revert commit documenting fix attempts and conclusion

### Documentation

- [S10-S11-SYNC-BUG.md](S10-S11-SYNC-BUG.md) - Complete diagnostic investigation and test results
- [d13-cascade-diagnostic-2025-11-11T20-31-55.md](d13-cascade-diagnostic-2025-11-11T20-31-55.md) - Browser console diagnostic output

### Root Cause Analysis

**What happens**:
1. User changes d_13 dropdown in Reference mode (e.g., Z6 → Z5)
2. S11's `onReferenceStandardChange()` correctly loads new ReferenceValues and recalculates
3. S11 publishes updated values (ref_i_97, ref_k_97) via StateManager
4. **BUT**: Downstream sections (S12, S13, S14, S01) don't react - no cascade triggered
5. e_10 (TEUI) does not update until user manually switches modes
6. Mode switch triggers S12 via area changes, which then cascades normally

**Why it happens**:
- S11's local `calculateAll()` publishes values but doesn't trigger downstream listeners
- S12/S13/S14 don't listen to ref_i_97/ref_k_97 changes directly
- They only listen to climate data and area changes
- The cascade architecture expects area changes as the primary trigger
- ReferenceValues overlay change is a "silent" data update with no automatic propagation

**Why simple fixes fail**:
- Attempted fix: Manually trigger `S12.calculateAll()` after S11 calculation
- Result: Breaks calculation ordering, introduces drift (195.4 vs 197.6)
- This approach is an architectural hack that bypasses proper listener patterns
- Cooling logic and other complex interdependencies break with forced cascade

### Conclusion

The bug is **architectural** and cannot be fixed with simple logic patches. The dual-state system was designed with implicit coupling between d_13 and Reference overlay application. Attempts to fix the cascade without addressing the underlying architecture create new bugs.

**Recommended Solution**: **Option 3 implementation** (Explicit "Set Values" button)

Option 3 solves this by:
1. Removing automatic ReferenceValues overlay on d_13/ref_d_13 change
2. Making overlay application explicit via button click
3. Perfect state isolation - no implicit triggers
4. User control - explicit action required for overlay
5. No cascade complexity - button triggers full recalculation cleanly

### Strategic Decision Required

**Context**: Dependency mapping work (S01-S09 complete) was purpose of `dependency2` branch. Stopped at S09 due to M/N complexity related to d_13 issues.

**Two paths forward**:

**Path A: Continue Dependency Mapping (S10-S15)**
- ✅ **COMPLETED** November 15, 2025
- All sections S01-S15 have dependencies correctly mapped and labeled
- S17 Dependency Graph perfectly represents the calculation model
- Work completed with known d_13 limitation (acceptable for mapping exercise)

**Path B: Shift to Option 3 Implementation**
- ✅ **SELECTED** November 18, 2025
- Fixes d_13 cascade bug architecturally
- Will "radically simplify" M/N compliance work afterward
- Button infrastructure already built (commit 305f52f)
- Clean state isolation makes all dependency work easier

**Decision**: Dependency mapping complete. Now implementing Option 3 to fix d_13 architecture issues.

---

## Implementation Workplan

**Branch**: `D13-UPDATE`
**Approach**: Incremental implementation with testing at each step
**Sections to modify**: S02, S05, S06, S09, S11, S12, S13, S14

---

### Phase 1: Preparation & Investigation

#### Task 1.1: Audit Current d_13 Listener Behavior
**Objective**: Identify all locations where d_13 changes trigger ReferenceState updates

**Actions**:
- [ ] Search codebase for `addListener("d_13"` patterns
- [ ] Document which sections call `ReferenceState.onReferenceStandardChange()` on d_13 change
- [ ] Verify current behavior: does d_13 change automatically update Reference model?
- [ ] List all sections with automatic d_13 → ReferenceState coupling

**Expected sections**: S05, S06, S09, S11, S12, S13, S14

**Test**: N/A (documentation task)

**Deliverable**: List of files and line numbers with d_13 listener logic

---

#### Task 1.2: Verify Button Infrastructure
**Objective**: Confirm "Set Values" button exists and is properly styled

**Actions**:
- [ ] Locate button in [Section02.html](../../sections/Section02.html) at row 13, column E
- [ ] Verify button has ID `setValuesBtn` or similar
- [ ] Check tooltip field ID (e_13) exists
- [ ] Confirm button is visible in both Target and Reference modes
- [ ] Verify no existing click handler is wired

**Test**: Visual inspection in browser - button should be visible but non-functional

**Deliverable**: Confirm button ID and readiness for wiring

---

### Phase 2: Unwire Automatic d_13 Triggers (Target → Reference Contamination Removal)

#### Task 2.1: Remove d_13 → ReferenceState Automatic Trigger (Section 05)
**Objective**: Make d_13 listener passive in S05 - no automatic ReferenceState updates

**File**: `sections/Section05.js`

**Actions**:
- [ ] Locate d_13 listener in `initializeEventHandlers()` or similar
- [ ] Comment out or remove `ReferenceState.onReferenceStandardChange()` call
- [ ] Keep listener active (stores selection value in StateManager)
- [ ] Add comment: `// PASSIVE: d_13 changes stored only - overlay applied by "Set Values" button`

**Before**:
```javascript
window.TEUI.StateManager.addListener("d_13", () => {
  ReferenceState.onReferenceStandardChange();  // ❌ Remove this
  // other logic...
});
```

**After**:
```javascript
window.TEUI.StateManager.addListener("d_13", () => {
  // PASSIVE: d_13 changes stored only - overlay applied by "Set Values" button
  // other logic... (if any)
});
```

**Test**:
1. Load application in browser
2. Switch to Target mode
3. Change d_13 dropdown from "OBC SB10 5.5-6 Z6" → "PH Classic"
4. Switch to Reference mode
5. **Expected**: Reference model values should NOT change (no automatic overlay)
6. Verify ref_d_65, ref_d_113, etc. remain at previous values

**Deliverable**: S05 d_13 listener is passive

---

#### Task 2.2: Remove d_13 → ReferenceState Automatic Trigger (Section 06)
**Objective**: Make d_13 listener passive in S06

**File**: `sections/Section06.js`

**Actions**: Same as Task 2.1 for S06

**Test**: Same as Task 2.1 (verify S06 Reference values don't auto-update)

**Deliverable**: S06 d_13 listener is passive

---

#### Task 2.3: Remove d_13 → ReferenceState Automatic Trigger (Section 09)
**Objective**: Make d_13 listener passive in S09

**File**: `sections/Section09.js`

**Actions**: Same as Task 2.1 for S09

**Note**: S09 may already have ref_d_13 listener - verify and keep it

**Test**: Same as Task 2.1 (verify S09 Reference values don't auto-update)

**Deliverable**: S09 d_13 listener is passive

---

#### Task 2.4: Remove d_13 → ReferenceState Automatic Trigger (Section 11)
**Objective**: Make d_13 listener passive in S11

**File**: `sections/Section11.js`

**Actions**: Same as Task 2.1 for S11

**Test**: Same as Task 2.1 (verify S11 Reference values don't auto-update)

**Deliverable**: S11 d_13 listener is passive

---

#### Task 2.5: Remove d_13 → ReferenceState Automatic Trigger (Section 12)
**Objective**: Make d_13 listener passive in S12

**File**: `sections/Section12.js`

**Actions**: Same as Task 2.1 for S12

**Test**: Same as Task 2.1 (verify S12 Reference values don't auto-update)

**Deliverable**: S12 d_13 listener is passive

---

#### Task 2.6: Remove d_13 → ReferenceState Automatic Trigger (Section 13)
**Objective**: Make d_13 listener passive in S13

**File**: `sections/Section13.js`

**Actions**: Same as Task 2.1 for S13

**Test**: Same as Task 2.1 (verify S13 Reference values don't auto-update)

**Deliverable**: S13 d_13 listener is passive

---

#### Task 2.7: Remove d_13 → ReferenceState Automatic Trigger (Section 14)
**Objective**: Make d_13 listener passive in S14

**File**: `sections/Section14.js`

**Actions**: Same as Task 2.1 for S14

**Test**: Same as Task 2.1 (verify S14 Reference values don't auto-update)

**Deliverable**: S14 d_13 listener is passive

---

#### Task 2.8: Verify All d_13 Listeners Are Passive
**Objective**: Comprehensive test across all sections

**Test**:
1. Load application
2. Target mode: Change d_13 to "PH Classic"
3. Switch to Reference mode
4. Open browser console, run:
   ```javascript
   console.log('ref_d_65:', window.TEUI.StateManager.getValue('ref_d_65'));
   console.log('ref_d_113:', window.TEUI.StateManager.getValue('ref_d_113'));
   console.log('ref_f_85:', window.TEUI.StateManager.getValue('ref_f_85'));
   // ... check other ref_ fields
   ```
5. **Expected**: All ref_ values should be UNCHANGED (still at defaults, not PH Classic values)

**Deliverable**: Confirmation that d_13 changes no longer automatically affect Reference model

---

### Phase 3: Add ref_d_13 Listeners (Passive - Store Selection Only)

#### Task 3.1: Verify ref_d_13 Exists in StateManager
**Objective**: Confirm ref_d_13 field is registered in state system

**Actions**:
- [ ] Check if ref_d_13 is already defined in StateManager initialization
- [ ] If missing, add ref_d_13 to state schema
- [ ] Set default value: "OBC SB10 5.5-6 Z6"

**Test**: Browser console - `window.TEUI.StateManager.getValue('ref_d_13')` should return default value

**Deliverable**: ref_d_13 field exists in StateManager

---

#### Task 3.2: Add Passive ref_d_13 Listeners (All Sections)
**Objective**: Add listeners that store ref_d_13 changes without triggering overlays

**Files**: S05, S06, S09, S11, S12, S13, S14

**Actions** (per section):
- [ ] Add ref_d_13 listener in `initializeEventHandlers()`:
```javascript
window.TEUI.StateManager.addListener("ref_d_13", (newValue) => {
  // PASSIVE: ref_d_13 changes stored only - overlay applied by "Set Values" button
  console.log(`[S0X] ref_d_13 changed to: ${newValue} (no automatic overlay)`);
});
```

**Test**:
1. Load application
2. Switch to Reference mode
3. Change ref_d_13 dropdown from "OBC SB10 5.5-6 Z6" → "PH Classic"
4. Check browser console for log message
5. Verify ref_d_65, ref_d_113, etc. remain UNCHANGED (no overlay applied)

**Deliverable**: ref_d_13 listeners are passive in all sections

---

### Phase 4: Wire "Set Values" Button - Delegate to FileHandler

#### Task 4.1: Add applyReferenceValuesFromStandard() Method to FileHandler
**Objective**: Add new method to FileHandler that applies ReferenceValues using proven Import Quarantine pattern

**File**: `src/core/FileHandler.js`

**CRITICAL**: This method treats ReferenceValues.js as an internal import source and uses the same pattern as Excel imports

**Actions**:
- [ ] Add new method `applyReferenceValuesFromStandard(standard, targetMode)` to FileHandler
- [ ] **PHASE 1**: Mute listeners (Import Quarantine) - prevents premature calculations
- [ ] **PHASE 2a**: Apply values to isolated section states (TargetState or ReferenceState based on mode)
- [ ] **PHASE 2b**: Sync values TO global StateManager (so other sections can see changes)
- [ ] **PHASE 2c**: Refresh DOM to show new input values (first refresh)
- [ ] **PHASE 3**: Unmute listeners (in finally block - ensures unmute even if errors)
- [ ] **PHASE 4**: Trigger complete calculation cascade (calculateAll)
- [ ] **PHASE 5**: Final DOM refresh to show calculated results (second refresh)

**Code**: See [SETTING-VALUES.md](./SETTING-VALUES.md) for complete FileHandler method implementation (lines 327-442)

**Why This Pattern Works** (see [SETTING-VALUES.md](SETTING-VALUES.md) for detailed analysis):
1. **Import Quarantine** prevents premature calculations with incomplete data
2. **Explicit State Sync** ensures Pattern A isolated states match global StateManager
3. **Two DOM Refreshes**: First shows input values, second shows calculated results
4. **Complete Cascade**: calculateAll() runs once with all values in place
5. **No Value Drift**: Consistent, correct results every time (matches FileHandler import behavior)
6. **Code Reuse**: Same proven pattern as Excel imports, maintained in one place

**Test**: Will test after Task 4.2 (button wiring) is complete

**Deliverable**: `applyReferenceValuesFromStandard()` method exists in FileHandler.js with full Import Quarantine pattern

---

#### Task 4.2: Simplify Section02 Button Handler to Delegate to FileHandler
**Objective**: Wire button to delegate to FileHandler instead of implementing logic in Section02

**File**: `sections/Section02.js`

**Actions**:
- [ ] Locate `initializeEventHandlers()` in Section02.js
- [ ] Find "Set Values" button by ID (`setValuesBtn`)
- [ ] Replace existing `applyReferenceValuesOverlay()` function (lines 1070-1130) with simple delegation
- [ ] Add click event listener that calls FileHandler method

**Code**: See [SETTING-VALUES.md](./SETTING-VALUES.md) for complete button handler implementation (lines 295-325)

**Simplified approach**:
```javascript
// In Section02.js initializeEventHandlers()
const setValuesBtn = document.getElementById("setValuesBtn");
if (setValuesBtn) {
  setValuesBtn.addEventListener("click", () => {
    const currentMode = window.TEUI?.ModeManager?.currentMode || "target";
    const standard = currentMode === "reference"
      ? window.TEUI.StateManager.getValue("ref_d_13")
      : window.TEUI.StateManager.getValue("d_13");

    console.log(`[S02] "Set Values" button clicked - delegating to FileHandler`);

    // Delegate to FileHandler - it knows how to do this correctly!
    if (window.TEUI?.FileHandler?.applyReferenceValuesFromStandard) {
      window.TEUI.FileHandler.applyReferenceValuesFromStandard(standard, currentMode);
    } else {
      console.error("[S02] FileHandler.applyReferenceValuesFromStandard() not available");
    }
  });
}
```

**Test** (Both Modes - Phase 4 Complete):
1. Load application
2. **Target mode**: Change d_13 to "PH Classic", click "Set Values"
   - **Expected**: Console shows FileHandler applying values to Target model
   - d_66 changes to 1.1 (PH Classic lighting load)
   - UI updates immediately
3. Switch to **Reference mode**
4. Change ref_d_13 to "OBC SB10 5.5-6 Z6", click "Set Values"
   - **Expected**: Console shows FileHandler applying values to Reference model
   - ref_d_66 changes to 2.0 (OBC baseline)
   - UI updates immediately
5. Switch back to Target mode
   - **Expected**: Target values UNCHANGED (d_66 still 1.1, no contamination)

**Deliverable**: Button successfully delegates to FileHandler.applyReferenceValuesFromStandard() in both modes

---

### Phase 5: Update ReferenceState.setDefaults() and onReferenceStandardChange()

#### Task 5.1: Update ReferenceState.setDefaults() to Read ref_d_13 (Section 05)
**Objective**: Ensure ReferenceState initialization reads from ref_d_13, not d_13

**File**: `sections/Section05.js`

**Actions**:
- [ ] Locate `ReferenceState.setDefaults()` method
- [ ] Find line that reads standard: `const currentStandard = window.TEUI?.StateManager?.getValue?.("d_13")` ❌
- [ ] Change to: `const currentStandard = window.TEUI?.StateManager?.getValue?.("ref_d_13") || "OBC SB10 5.5-6 Z6"` ✅

**Before**:
```javascript
setDefaults: function() {
  const currentStandard = window.TEUI?.StateManager?.getValue?.("d_13") || "OBC SB10 5.5-6 Z6"; // ❌ Wrong
  // ...
}
```

**After**:
```javascript
setDefaults: function() {
  const currentStandard = window.TEUI?.StateManager?.getValue?.("ref_d_13") || "OBC SB10 5.5-6 Z6"; // ✅ Correct
  // ...
}
```

**Test**:
1. Reload application (clears localStorage)
2. Set ref_d_13 = "PH Classic"
3. Switch to Reference mode
4. Click "Set Values"
5. **Expected**: Reference values initialize from PH Classic, not default

**Deliverable**: S05 ReferenceState.setDefaults() reads ref_d_13

---

#### Task 5.2: Update ReferenceState.setDefaults() (Section 06, 09, 11, 12, 13, 14)
**Objective**: Same as Task 5.1 for remaining sections

**Files**: S06, S09, S11, S12, S13, S14

**Actions**: Same as Task 5.1 for each section

**Test**: Same as Task 5.1

**Deliverable**: All ReferenceState.setDefaults() methods read ref_d_13

---

#### Task 5.3: Verify ReferenceState.onReferenceStandardChange() State Isolation
**Objective**: Confirm ReferenceState methods ONLY write to ref_ prefixed fields

**Files**: S05, S06, S09, S11, S12, S13, S14

**Actions**:
- [ ] Locate `ReferenceState.onReferenceStandardChange()` in each section
- [ ] Verify method reads from `ref_d_13` (not d_13)
- [ ] Verify method ONLY writes to ref_ prefixed fields (ref_d_65, ref_d_113, ref_f_85, etc.)
- [ ] Add safeguard comments if missing

**Expected Pattern**:
```javascript
onReferenceStandardChange: function() {
  // ⚠️ STATE ISOLATION SAFEGUARD: Must ONLY write to ref_ prefixed fields
  const standard = window.TEUI?.StateManager?.getValue?.("ref_d_13") || "OBC SB10 5.5-6 Z6";
  const referenceValues = window.TEUI?.ReferenceValues?.[standard] || {};

  Object.keys(referenceValues).forEach(fieldId => {
    const refFieldId = `ref_${fieldId}`;  // ✅ ALWAYS prefix with ref_
    if (referenceValues[fieldId] !== undefined) {
      this.state[refFieldId] = referenceValues[fieldId];  // ✅ Writes to ref_d_65, NOT d_65
    }
  });

  this.saveState();
  console.log(`[ReferenceState] Applied values from ${standard} to Reference model`);
}
```

**Test**:
1. Reference mode: ref_d_13 = "PH Classic", click "Set Values"
2. Browser console:
   ```javascript
   console.log('d_65:', window.TEUI.StateManager.getValue('d_65'));     // Should NOT be 2.1
   console.log('ref_d_65:', window.TEUI.StateManager.getValue('ref_d_65')); // Should be 2.1
   ```
3. **Expected**: Only ref_ fields are modified, unprefixed fields untouched

**Deliverable**: All ReferenceState.onReferenceStandardChange() methods have state isolation safeguards

---

### Phase 6: Add TargetState.applyReferenceValues() (NEW - Code-Minimum Scenario)

#### Task 6.1: Add TargetState.applyReferenceValues() Method (Section 05)
**Objective**: Create method to apply ReferenceValues to Target model (code-minimum baseline)

**File**: `sections/Section05.js`

**Actions**:
- [ ] Add new method to TargetState object: `applyReferenceValues(standard)`
- [ ] Method reads ReferenceValues from specified standard
- [ ] Method ONLY writes to unprefixed fields (d_65, d_113, etc.) - NOT ref_ fields
- [ ] Method calls saveState() and logs action

**Code**:
```javascript
// In Section05.js TargetState object
applyReferenceValues: function(standard) {
  // ⚠️ STATE ISOLATION SAFEGUARD: Only write to unprefixed fields (Target model)
  const referenceValues = window.TEUI?.ReferenceValues?.[standard] || {};

  console.log(`[S05 TargetState] Applying code-minimum values from "${standard}"`);

  Object.keys(referenceValues).forEach(fieldId => {
    if (referenceValues[fieldId] !== undefined) {
      // ✅ Writes to d_65, NOT ref_d_65
      this.state[fieldId] = referenceValues[fieldId];
      console.log(`[S05 TargetState] ${fieldId} = ${referenceValues[fieldId]} (from ${standard})`);
    }
  });

  this.saveState();
  console.log(`[S05 TargetState] Code-minimum values from "${standard}" applied to Target model`);
},
```

**Test**:
1. Load application
2. **Target mode**: d_13 = "PH Classic"
3. Note current Target values (e.g., d_65 might be 7.0)
4. Click "Set Values" button
5. **Expected**:
   - Console logs show TargetState.applyReferenceValues() being called
   - d_65 changes to 2.1 (PH Classic code-minimum)
   - d_113 changes to PH Classic values
   - UI updates to show new Target values
6. Switch to Reference mode
7. **Expected**: Reference values should be UNCHANGED (no contamination)

**Deliverable**: S05 TargetState.applyReferenceValues() method works correctly

---

#### Task 6.2: Add TargetState.applyReferenceValues() (Section 06, 09, 11, 12, 13, 14)
**Objective**: Same as Task 6.1 for remaining sections

**Files**: S06, S09, S11, S12, S13, S14

**Actions**: Same as Task 6.1 for each section

**Test**: Same as Task 6.1

**Deliverable**: All sections have TargetState.applyReferenceValues() method

---

### **⚠️ ARCHITECTURAL IMPROVEMENT: Delegate to FileHandler Instead of Section02**

**Status**: Phase 6 completed (commit df1bf7e) but Phase 4 Task 4.1 should be redesigned for better architecture.

**Problem**: The current `Section02.applyReferenceValuesOverlay()` implementation (lines 1070-1130) is missing the **Import Quarantine pattern**, causing:
- DOM not updating with new values in S09 and other sections
- Calculations firing prematurely or not at all
- Value "drift" on repeated button presses and mode switches
- Inconsistent h_10 (S01 grand total) results

**Root Cause Analysis**: See [SETTING-VALUES.md](./SETTING-VALUES.md) for detailed analysis of FileHandler's proven Import Quarantine pattern that works perfectly every time.

**Reference Commit**: df1bf7e (November 18, 2025)
- Created SETTING-VALUES.md documenting FileHandler's gold standard pattern
- Updated Task 4.1 code example with correct Import Quarantine pattern
- Included ReferenceValues.js changes (t_66→d_66, t_65 commented out)
- Included TooltipManager.js tooltip clarifications

**Architectural Decision (November 19, 2025)**: **Delegate to FileHandler instead of duplicating code in Section02**

### Why Delegate to FileHandler?

✅ **Single Responsibility** - FileHandler owns all "bulk value application" operations
✅ **Code Reuse** - Import Quarantine pattern exists in one place
✅ **Maintainability** - Future fixes happen once, work everywhere
✅ **Consistency** - ReferenceValues overlay behaves exactly like Excel import
✅ **Proven Pattern** - FileHandler's import process works perfectly every time

### What Must Be Implemented:

**1. Add new method to FileHandler.js** (~line 735+):
   - `applyReferenceValuesFromStandard(standard, targetMode)`
   - Uses full 5-phase Import Quarantine pattern
   - Treats ReferenceValues.js as internal import source

**2. Simplify Section02.js button handler** (lines 1070-1130):
   - Replace entire `applyReferenceValuesOverlay()` function
   - Just delegate to `FileHandler.applyReferenceValuesFromStandard()`
   - ~5 lines instead of 80+ lines

**Complete Implementation**: See [SETTING-VALUES.md](./SETTING-VALUES.md) for full code examples

**Files Requiring Updates**:
- [FileHandler.js](../../src/core/FileHandler.js) - Add new method `applyReferenceValuesFromStandard()`
- [Section02.js](../../src/sections/Section02.js) - Simplify button handler to delegate to FileHandler

**Test After Implementation**:
1. Target mode: Select d_13 = "PH Classic", click "Set Values"
2. Verify S09 DOM updates with d_66 = 1.1 (PH Classic lighting load)
3. Switch to d_13 = "OBC SB10 5.5-6 Z6", click "Set Values"
4. Verify h_10 returns to consistent baseline value
5. Repeat steps 1-4 multiple times
6. **Expected**: No value drift, DOM updates correctly, h_10 remains stable

**Action Required**: Complete this implementation BEFORE proceeding to Phase 7 testing.

---

### Phase 7: Integration Testing & Validation

#### Task 7.1: Test Dual-Purpose Button (Both Modes)
**Objective**: Verify button works correctly in both Target and Reference modes

**Test Scenario A: Target Mode - Code-Minimum Population**
1. Load application (Target mode)
2. Set Target values manually: d_65 = 5.0, d_113 = 10.0
3. Select d_13 = "PH Classic"
4. Click "Set Values"
5. **Expected**:
   - d_65 overwrites to 2.1 (PH Classic code-minimum)
   - d_113 overwrites to PH Classic value
   - User sees "what if we just built to code minimum?"
6. Switch to Reference mode
7. **Expected**: Reference values unchanged (no contamination)

**Test Scenario B: Reference Mode - Code Baseline Population**
1. Switch to Reference mode
2. Select ref_d_13 = "PHIUS 2021"
3. Click "Set Values"
4. **Expected**:
   - ref_d_65 updates to 3.2 (PHIUS 2021 baseline)
   - ref_d_113 updates to PHIUS values
5. Switch to Target mode
6. **Expected**: Target values unchanged (still showing PH Classic values from Scenario A)

**Test Scenario C: Independent Standards (Core Validation)**
1. Target mode: d_13 = "PH Classic", click "Set Values" → d_65 = 2.1
2. Reference mode: ref_d_13 = "PHIUS 2021", click "Set Values" → ref_d_65 = 3.2
3. Check M/N compliance: m_65 = (2.1 / 3.2) * 100 = 65.6% ✅
4. Verify both models maintain independent values

**Deliverable**: Button works correctly in both modes, perfect state isolation maintained

---

#### Task 7.2: Verify 238% Bug is Fixed
**Objective**: Confirm original bug (m_65 = 238%) is resolved

**Test**:
1. Load application
2. Target mode: d_13 = "PH Classic", click "Set Values" → d_65 = 2.1
3. Reference mode: ref_d_13 = "PH Classic", click "Set Values" → ref_d_65 = 2.1
4. Check browser console:
   ```javascript
   const d_65 = window.TEUI.StateManager.getValue('d_65');
   const ref_d_65 = window.TEUI.StateManager.getValue('ref_d_65');
   const m_65 = (d_65 / ref_d_65) * 100;
   console.log(`m_65 = (${d_65} / ${ref_d_65}) * 100 = ${m_65}%`);
   ```
5. **Expected**: m_65 = 100% (perfect compliance) ✅
6. Verify UI shows green ✓ at n_65 and m_65 displays 100%

**Deliverable**: 238% bug is resolved - m_65 correctly shows 100% when d_65 = ref_d_65

---

#### Task 7.3: Cross-Section Validation (All M/N Fields)
**Objective**: Verify compliance calculations work correctly across all sections

**Test**:
1. Set Target and Reference to same standard (e.g., "OBC SB10 5.5-6 Z6")
2. Click "Set Values" in both modes
3. Check all M/N fields across sections:
   - S05: m_65 (Lighting Power Density)
   - S06: m_113 (Plug Load Density)
   - S09: (various occupancy-related metrics)
   - S11: m_85, m_97, etc. (envelope metrics)
   - S12: (mechanical metrics)
   - S13: (renewable energy metrics)
   - S14: (water metrics)
4. **Expected**: All M/N values = 100% (perfect compliance)
5. Change Target values manually
6. **Expected**: M/N values recalculate correctly, green ✓ or red ✗ as appropriate

**Deliverable**: All M/N compliance calculations work correctly across all sections

---

#### Task 7.4: Mode Switching Stability Test
**Objective**: Verify state isolation maintained during mode switches

**Test**:
1. Target mode: Set d_13 = "PH Classic", click "Set Values"
2. Reference mode: Set ref_d_13 = "PHIUS 2021", click "Set Values"
3. Switch Target → Reference → Target → Reference (multiple cycles)
4. **Expected**:
   - Target values remain PH Classic (d_65 = 2.1)
   - Reference values remain PHIUS 2021 (ref_d_65 = 3.2)
   - No drift or contamination
   - UI updates correctly on each switch

**Deliverable**: Mode switching maintains perfect state isolation

---

### Phase 8: Documentation & Cleanup

#### Task 8.1: Update 4012-CHEATSHEET.md
**Objective**: Document the new d_13/ref_d_13 architecture pattern

**File**: `docs/development/4012-CHEATSHEET.md`

**Actions**:
- [ ] Add section explaining d_13/ref_d_13 independence
- [ ] Document "Set Values" button dual-purpose behavior
- [ ] Add examples of code-minimum scenario (Target mode)
- [ ] Add examples of code baseline scenario (Reference mode)
- [ ] Update Anti-Pattern guidance if needed

**Deliverable**: Cheatsheet updated with Option 3 architecture

---

#### Task 8.2: Add Implementation Notes to This Document
**Objective**: Record any deviations, challenges, or discoveries during implementation

**Actions**:
- [ ] Document any unexpected issues encountered
- [ ] Note any sections that behaved differently than expected
- [ ] Record actual button IDs or DOM structure if different from assumptions
- [ ] List any additional files modified beyond original plan

**Deliverable**: Complete implementation record

---

#### Task 8.3: Code Comments and Console Logging
**Objective**: Ensure code is well-documented and debuggable

**Actions**:
- [ ] Add STATE ISOLATION SAFEGUARD comments where critical
- [ ] Ensure all console.log statements are informative
- [ ] Add JSDoc comments to new methods (applyReferenceValues, applyReferenceValuesOverlay)
- [ ] Verify no commented-out code left behind

**Deliverable**: Clean, well-documented code

---

### Phase 9: Commit & Merge

#### Task 9.1: Create Commit with Descriptive Message
**Objective**: Commit changes with clear explanation

**Commit Message Template**:
```
Feat: Implement Option 3 - Explicit "Set Values" Button Architecture

- Unwired d_13 automatic triggers from ReferenceState (S05-S14)
- Added passive ref_d_13 listeners (store selection only)
- Wired "Set Values" button in S02 (dual-purpose: Target & Reference)
- Added TargetState.applyReferenceValues() methods (NEW - code-minimum scenario)
- Updated ReferenceState.setDefaults() to read ref_d_13 (not d_13)
- Verified state isolation safeguards in ReferenceState.onReferenceStandardChange()

Fixes:
- ✅ 238% compliance bug resolved (m_65 now correctly shows 100%)
- ✅ Perfect state isolation (d_13 and ref_d_13 fully independent)
- ✅ No automatic contamination between Target and Reference models

New Feature:
- Target mode "Set Values" button now populates code-minimum baseline values
- Users can explore "what if we just built to code minimum?" scenarios

Sections modified: S02, S05, S06, S09, S11, S12, S13, S14

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Actions**:
- [ ] Stage all modified files
- [ ] Run git status to verify changes
- [ ] Commit with above message template
- [ ] Verify commit includes all expected files

**Deliverable**: Clean commit on `D13-UPDATE` branch

---

#### Task 9.2: Test on Clean Clone (Optional but Recommended)
**Objective**: Verify implementation works on fresh checkout

**Actions**:
- [ ] Clone repository to new location
- [ ] Checkout `D13-UPDATE` branch
- [ ] Load application in browser
- [ ] Run all Phase 7 integration tests
- [ ] Verify no errors or warnings

**Deliverable**: Confirmation that implementation is portable

---

#### Task 9.3: Merge to Main Branch
**Objective**: Integrate changes into main codebase

**Actions**:
- [ ] Checkout main branch
- [ ] Merge `D13-UPDATE` branch
- [ ] Resolve any conflicts (unlikely if working alone)
- [ ] Push to remote

**Deliverable**: Option 3 implementation merged to main

---

## Progress Tracking

**Current Status**: ✅ Phase 6 Complete - TargetState.applyReferenceValues() Added (Testing & Debugging)

**Completed Tasks**: 19 / 50+ (Tasks 1.1, 1.2, 2.1-2.8, 3.1-3.2, 4.1-4.2, 5.1-5.3, 6.1-6.2)

**Last Updated**: 2025-11-18

**Safe Revert Points**:
- [x] **Baseline commit**: Documentation updated with Option 3 workplan (commit 3790e94)
- [x] **Phase 1 complete**: Audit and verification (commit 17d88bb)
- [x] **Phase 2 complete**: All d_13 listeners unwired (commit 5471a0b)
- [x] **Phase 3 complete**: All ref_d_13 listeners added - both dropdowns now passive (commit e9fc7c1)
- [x] **Phase 4 complete**: "Set Values" button wired for Reference mode (commit e0f2dec)
- [x] **Phase 5 complete**: ReferenceState methods read ref_d_13 (commits c43c7b5, 386a13e)
- [x] **Phase 6 complete**: TargetState.applyReferenceValues() added (commits a1c63c0, bd06efc - CURRENT)
- [ ] Final implementation complete (all tests pass)

---

## Notes & Discoveries

### Task 1.1: Audit Results (COMPLETED 2025-11-18)

**Sections with d_13 → ReferenceState.onReferenceStandardChange() coupling:**
1. ✅ **Section05.js** (Line 191-193)
2. ✅ **Section06.js** (Line 172-174)
3. ✅ **Section09.js** (Line 2419-2424) - Also has ref_d_13 listener at line 2432!
4. ✅ **Section11.js** (Line 388-390)
5. ✅ **Section12.js** (Line 191-193)
6. ✅ **Section13.js** (Line 293-295)
7. ✅ **Section14.js** (Line 117-119)
8. ✅ **SectionXX.js** (Line 642-643) - Template file

**Additional d_13 listeners (non-ReferenceState):**
- **Section03.js** (Line 2526): Calls `calculateAll()` for PH override logic
- **Section03.js** (Line 2533): Already has `ref_d_13` listener! ✅
- **Section12.js** (Line 2899): Calls `calculateAll()` + `updateAllReferenceIndicators()`
- **Section13.js** (Line 2485): Calls `updateAllReferenceIndicators()`
- **Section14.js** (Line 1470): Calls `updateReferenceIndicator()`

**Total listeners to modify:** 7 sections (S05, S06, S09, S11, S12, S13, S14)

### Task 1.2: Button Infrastructure (COMPLETED 2025-11-18)

**Button confirmed in Section02.js:**
- ✅ Button ID: `setValuesBtn`
- ✅ Field ID: `e_13` (for tooltip support)
- ✅ Content: "Set Values"
- ✅ Classes: `["btn", "btn-sm", "btn-danger"]`
- ✅ Tooltip: Enabled
- ✅ Location: Section02.js line 153-158
- ✅ No existing click handler (confirmed - ready to wire)

### Phase 2: Unwire d_13 Listeners (COMPLETED 2025-11-18)

**All 7 sections successfully modified:**
1. ✅ **Section05.js** (Line 192) - Made d_13 listener PASSIVE
2. ✅ **Section06.js** (Line 173) - Made d_13 listener PASSIVE
3. ✅ **Section09.js** (Line 2420) - Made d_13 listener PASSIVE (preserved calculateTargetModel + indicator updates)
4. ✅ **Section11.js** (Line 389) - Made d_13 listener PASSIVE
5. ✅ **Section12.js** (Line 191) - Made d_13 listener PASSIVE
6. ✅ **Section13.js** (Line 293) - Made d_13 listener PASSIVE
7. ✅ **Section14.js** (Line 117) - Made d_13 listener PASSIVE

**Pattern applied consistently:**
```javascript
// PASSIVE: d_13 changes stored only - overlay applied by "Set Values" button
window.TEUI.StateManager.addListener("d_13", () => {
  // No automatic ReferenceState update - button triggers overlay
});
```

**Verification results (Task 2.8):**
- Grep search confirmed NO remaining `ReferenceState.onReferenceStandardChange()` calls in d_13 listeners
- Only SectionXX.js (template file) retains old pattern - as expected
- Section03.js and Section12.js have separate d_13 listeners for calculations only (not ReferenceState contamination)
- All production sections now have perfect state isolation

**Key achievement:** d_13 changes no longer automatically contaminate Reference model ✅

### Phase 3: Add ref_d_13 Listeners (COMPLETED 2025-11-18)

**All 7 sections now have passive ref_d_13 listeners:**
1. ✅ **Section05.js** (Line 197-199) - Added passive ref_d_13 listener
2. ✅ **Section06.js** (Line 178-180) - Added passive ref_d_13 listener
3. ✅ **Section09.js** (Line 2426-2432) - Fixed existing ref_d_13 listener (made passive)
4. ✅ **Section11.js** (Line 394-396) - Added passive ref_d_13 listener
5. ✅ **Section12.js** (Line 196-198) - Added passive ref_d_13 listener
6. ✅ **Section13.js** (Line 298-300) - Added passive ref_d_13 listener
7. ✅ **Section14.js** (Line 122-124) - Added passive ref_d_13 listener

**Pattern applied consistently:**
```javascript
// PASSIVE: ref_d_13 changes stored only - overlay applied by "Set Values" button
window.TEUI.StateManager.addListener("ref_d_13", () => {
  // No automatic ReferenceState update - button triggers overlay
});
```

**Section09 special case:**
- Existing ref_d_13 listener (line 2426) was calling `ReferenceState.onReferenceStandardChange()`
- Removed automatic overlay trigger
- Preserved `calculateReferenceModel()` and `updateAllReferenceIndicators()` calls
- Maintains calculation consistency without triggering overlay

**Task 3.1 verification:**
- ref_d_13 field confirmed working in StateManager
- Fields auto-created on first use (no pre-registration required)
- Section03.js and Section09.js already had ref_d_13 listeners
- All other sections needed listeners added

**Key achievement:** Both d_13 AND ref_d_13 are now completely passive - no automatic overlays ✅

### Phase 4: Wire "Set Values" Button (COMPLETED 2025-11-18)

**Function created: applyReferenceValuesOverlay() in Section02.js (Line 1100-1151)**
- Dual-purpose function applies ReferenceValues to Target OR Reference model based on current mode
- Reads appropriate standard: ref_d_13 (Reference mode) or d_13 (Target mode)
- Iterates through sections [5, 6, 9, 11, 12, 13, 14] with ReferenceValues
- Reference mode: Calls ReferenceState.onReferenceStandardChange() ✅
- Target mode: Calls TargetState.applyReferenceValues() (will add in Phase 6)
- Triggers full recalculation and UI refresh after overlay

**Button wired in initializeEventHandlers() (Line 1160-1170)**
- Button ID confirmed: `setValuesBtn`
- Click handler reads ModeManager.currentMode and calls applyReferenceValuesOverlay()
- Console logging for debugging button clicks and overlay application
- Graceful error handling if button not found

**Testing readiness**:
- ✅ Reference mode: Ready to test immediately (ReferenceState.onReferenceStandardChange exists)
- ⏳ Target mode: Will be functional after Phase 6 (TargetState.applyReferenceValues not yet implemented)
- Console warns gracefully for missing Target mode methods until Phase 6

**Key achievement:** "Set Values" button now functional for Reference mode ✅

**Testing results (Reference mode - 2025-11-18)**:
- ✅ Button click successfully applies ReferenceValues to Reference model
- ✅ Value changes confirmed in S11 and other sections with ReferenceValues
- ✅ State isolation maintained (no Target contamination)
- ⚠️ **Known issue**: S11 calculations can get "stuck" after overlay (see [Issue #29](https://github.com/openbuilding-ca/objective/issues/29))
  - Root cause: Area sync issue from S10→S11 (unrelated to Phase 4 implementation)
  - Workaround: Mode switch triggers recalculation and "releases" stuck values
  - Note: ReferenceValues overlay IS working correctly - this is a pre-existing S10/S11 sync bug

### Phase 5: Update ReferenceState Methods (COMPLETED 2025-11-18)

**All 7 sections successfully updated to read ref_d_13 instead of d_13:**

**Tasks 5.1-5.2: ReferenceState.setDefaults() updates (commit c43c7b5)**
1. ✅ **Section05.js** (Line 93) - Changed d_13 → ref_d_13 in setDefaults()
2. ✅ **Section06.js** (Line 84) - Changed d_13 → ref_d_13 in setDefaults()
3. ✅ **Section09.js** (Line 122) - Changed d_13 → ref_d_13 in setDefaults()
4. ✅ **Section11.js** (Line 211) - Changed d_13 → ref_d_13 in setDefaults()
5. ✅ **Section12.js** (Line 104) - Changed d_13 → ref_d_13 in setDefaults()
6. ✅ **Section13.js** (Line 134) - Changed d_13 → ref_d_13 in setDefaults()
7. ✅ **Section14.js** (Line 69) - Changed d_13 → ref_d_13 in setDefaults()

**Task 5.3: ReferenceState.onReferenceStandardChange() verification (commit 386a13e)**
- ✅ Section05: Calls setDefaults() (now reads ref_d_13) ✓
- ✅ Section06: Calls setDefaults() (now reads ref_d_13) ✓
- ✅ Section09: Receives standard as parameter (no fix needed) ✓
- ✅ Section11: Calls setDefaults() (now reads ref_d_13) ✓
- ✅ Section12: Calls setDefaults() (now reads ref_d_13) ✓
- ✅ Section13: **FIXED** - Changed d_13 → ref_d_13 at line 156 ✓
- ✅ Section14: Calls setDefaults() (now reads ref_d_13) ✓

**Key achievement:** Perfect state isolation - ReferenceState methods now consistently read from Reference dropdown (ref_d_13) and write ONLY to ref_ prefixed fields ✅

**Result:** Reference model initialization and updates are completely independent from Target model. No cross-contamination possible.

**Testing (2025-11-18):**
- ✅ Phase 5 changes tested locally - all working correctly
- ✅ Reference model reads from ref_d_13 successfully
- ✅ No cross-contamination between Target and Reference models
- Ready to proceed with Phase 6

### Phase 6: Add TargetState.applyReferenceValues() (COMPLETED 2025-11-18)

**All 6 sections successfully updated with applyReferenceValues() method:**

**Tasks 6.1-6.2: TargetState.applyReferenceValues() implementation (commits a1c63c0, bd06efc)**
1. ✅ **Section05.js** (Lines 83-98) - Added applyReferenceValues() to TargetState
2. ✅ **Section06.js** (Lines 74-89) - Added applyReferenceValues() to TargetState
3. ✅ **Section09.js** (Lines 102-117) - Added applyReferenceValues() to TargetState
4. ✅ **Section11.js** (Lines 191-206) - Added applyReferenceValues() to TargetState
5. ✅ **Section12.js** (Lines 62-77) - Added applyReferenceValues() to TargetState
6. ✅ **Section13.js** (Lines 124-139) - Added applyReferenceValues() to TargetState

**Section14 excluded**: Data consumer only - removed from implementation after analysis

**Updated Section02.applyReferenceValuesOverlay():**
- Removed S14 from sectionsWithReferenceValues array (line 1109)
- Added comment: "S14/S15 excluded - they're data consumers only"
- Now correctly applies to only [5, 6, 9, 11, 12, 13]

**Key features implemented:**
- STATE ISOLATION SAFEGUARD: Methods only write to unprefixed fields (Target model)
- Reads from window.TEUI.ReferenceValues[standard] parameter
- Calls saveState() after applying values
- Comprehensive console logging for debugging
- Perfect separation from Reference model (no ref_ field access)

**Key achievement:** Dual-purpose "Set Values" button architecture complete ✅
- Target mode: Has applyReferenceValues() method (NEW feature)
- Reference mode: Has onReferenceStandardChange() method (existing)

**Testing (2025-11-18) - INITIAL ISSUES (RESOLVED):**
⚠️ **Issue 1**: "Set Values" button not applying ReferenceValues in Target mode as expected
⚠️ **Issue 2**: d_13 dropdown changes sometimes trigger automatic ReferenceValues overlays without button click

**Root Cause**: Stale localStorage state from pre-Phase 2 architecture
- Old architecture had active d_13 listeners triggering automatic overlays
- Cached state was interfering with new passive listener design
- **Resolution**: Clear browser caches and localStorage

**Testing (2025-11-18) - POST-CACHE-CLEAR:**
✅ "Set Values" button now working correctly in both modes
✅ Button successfully applies ReferenceValues to Target model
✅ Button successfully applies ReferenceValues to Reference model
✅ State isolation maintained (no cross-contamination observed)
⚠️ S10/S11 sync issue interfering with smooth recalculation (pre-existing bug, unrelated to Phase 6)
- See Issue #29 - Area sync issue from S10→S11
- Workaround: Mode switch triggers recalculation
- Does not affect correctness of "Set Values" button implementation

**Status**: Phase 6 functionally complete. "Set Values" button working as designed. S10/S11 sync issue is separate concern to address later.

---

## Quick Reference: Key Files to Modify

| File | Tasks | Purpose |
|------|-------|---------|
| `sections/Section02.js` | 4.1, 4.2 | Wire "Set Values" button, add `applyReferenceValuesOverlay()` |
| `sections/Section05.js` | 2.1, 3.2, 5.1, 5.3, 6.1 | Unwire d_13, add ref_d_13 listener, update ReferenceState, add TargetState method |
| `sections/Section06.js` | 2.2, 3.2, 5.2, 5.3, 6.2 | Same as S05 |
| `sections/Section09.js` | 2.3, 3.2, 5.2, 5.3, 6.2 | Same as S05 |
| `sections/Section11.js` | 2.4, 3.2, 5.2, 5.3, 6.2 | Same as S05 |
| `sections/Section12.js` | 2.5, 3.2, 5.2, 5.3, 6.2 | Same as S05 |
| `sections/Section13.js` | 2.6, 3.2, 5.2, 5.3, 6.2 | Same as S05 |
| `sections/Section14.js` | 2.7, 3.2, 5.2, 5.3, 6.2 | Same as S05 |
| `docs/development/4012-CHEATSHEET.md` | 8.1 | Update architecture documentation |

---

## Success Criteria

✅ **Architecture**:
- [ ] d_13 and ref_d_13 are completely independent
- [ ] No automatic ReferenceState updates on d_13 change
- [ ] "Set Values" button is sole trigger for ReferenceValues overlay
- [ ] Perfect state isolation maintained (Target vs Reference)

✅ **Functionality**:
- [ ] Target mode: Button populates code-minimum baseline values
- [ ] Reference mode: Button populates code baseline values
- [ ] M/N compliance calculations work correctly
- [ ] 238% bug is resolved (m_65 = 100% when d_65 = ref_d_65)

✅ **Testing**:
- [ ] All Phase 7 integration tests pass
- [ ] No console errors or warnings
- [ ] Mode switching is stable
- [ ] All sections work correctly

✅ **Documentation**:
- [ ] Cheatsheet updated
- [ ] Implementation notes recorded
- [ ] Code is well-commented
- [ ] Commit message is descriptive

---

## Risk Mitigation

**Risk**: Breaking existing functionality during unwiring
**Mitigation**: Test after each section modification (Tasks 2.1-2.7)

**Risk**: Button ID mismatch or DOM structure issues
**Mitigation**: Verify button infrastructure first (Task 1.2)

**Risk**: State contamination not fully eliminated
**Mitigation**: Extensive integration testing (Phase 7), console logging

**Risk**: Cascade failures (related to Nov 11 bug investigation)
**Mitigation**: "Set Values" button triggers full recalculation (calculateAll())

---

**END OF IMPLEMENTATION WORKPLAN**
