# d_13 Reference Standard Architecture: Two Design Options

**Date**: 2025-11-10
**Purpose**: Present two architectural approaches for CTO review
**Context**: Resolving m_65 compliance calculation showing 238% instead of 100%

---

## Current Symptom

**Test Case**: Set Target AND Reference d_13 to "PH Classic" (d_65 baseline = 2.1 W/m²)
- **Expected**: m_65 = 100% when d_65 = 2.1 (perfect compliance)
- **Actual**: Reference model m_65 = 238% (incorrect)

**Root Issue**: Unclear whether d_13 and ref_d_13 should be independent or synchronized.

---

## OPTION 1: "No State Mix" (Strict Dual-State Isolation)

### Architectural Principle

**d_13 and ref_d_13 are completely independent fields**

- d_13 = Target model's reference standard
- ref_d_13 = Reference model's reference standard
- NO synchronization between them
- Each model has sovereign control over its reference standard

### How It Works

```
Target Model (d_13 = "PH Classic"):
├─ Uses PH Classic for Target calculations? (unclear if Target needs this)
└─ User inputs: d_65 = 2.1

Reference Model (ref_d_13 = "PHIUS 2021"):
├─ Uses PHIUS 2021 code baseline from ReferenceValues.js
└─ Code values: ref_d_65 = 3.2

Compliance: m_65 = (2.1 / 3.2) * 100 = 65.6%
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
  calculateTargetModel(); // Does Target even use d_13?
});

// Reference standard changes - affects Reference only
window.TEUI.StateManager.addListener("ref_d_13", () => {
  ReferenceState.onReferenceStandardChange();
  calculateReferenceModel();
});
```

### Pros

✅ **Perfect state isolation** - aligns with dual-state architecture principles
✅ **Flexibility** - Target and Reference can use different standards (ie SB12 C4 for Heatpump in Target, SB12 A3 in Reference for Gas Furnace)
✅ **Clear separation** - no synchronization complexity
✅ **Architectural purity** - follows established patterns from other sections

### Cons

❌ **Unclear Target usage** - Does Target model actually use d_13 for anything? (Yes, M/N code compliance IN Target mode)
❌ **User confusion** - Why have two separate reference standard dropdowns? !IMPORTANT! This has been historically difficult to explain. 
❌ **Extra UI complexity** - Need to manage two dropdown selections
❌ **Comparison scenarios** - Hard to compare same standard across models, M-N Compliance requires double Reference-Values.js lookup instead of just value/ref_value for % comparisons. 

### Current Status

**Currently BROKEN (or synchronized, depending on how you think of it) in sections 05, 06, 11, 12, 13, 14**:
- ReferenceState.setDefaults() reads `d_13` (wrong field)
- d_13 listener calls ReferenceState.onReferenceStandardChange() (contamination)

**Would require fixing**:
- 6 sections need ReferenceState.setDefaults() to read `ref_d_13`
- 6 sections need d_13 listener removed from ReferenceState updates
- Section09 already partially correct (has ref_d_13 listener)

---

## OPTION 2: "One D13 Setting" (Synchronized Reference Standard - current best candidate)

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
├─ User changes d_13 dropdown → Updates d_13 value for M/N compliance calculation
├─ "Set Values" button VISIBLE and enabled (NEW: dual-purpose button!)
├─ User clicks "Set Values" → TargetState receives values from ReferenceValues.js
├─ Target model populated with code-minimum baseline values
└─ User can see "what if we just built to code minimum?"

Reference Mode:
├─ User changes ref_d_13 dropdown → Updates ref_d_13 value only
├─ "Set Values" button visible and enabled
├─ User clicks "Set Values" → ReferenceState receives overlay from ReferenceValues.js
└─ Reference model receives code baseline values

M/N Compliance Calculation (Simple):
├─ m_65 = (d_65 / ref_d_65) * 100
├─ Just value/ref_value - no complex lookups
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
