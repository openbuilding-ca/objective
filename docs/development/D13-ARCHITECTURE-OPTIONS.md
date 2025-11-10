# d_13 Reference Standard Architecture: Two Design Options

**Date**: 2025-11-10
**Purpose**: Present two architectural approaches for CTO review
**Context**: Resolving m_65 compliance calculation showing 238% instead of 100%

---

## Current Symptom

**Test Case**: Set d_13 to "PH Classic" (d_65 baseline = 2.1 W/m²)
- **Expected**: m_65 = 100% when d_65 = 2.1 (perfect compliance)
- **Actual**: m_65 = 238% (incorrect)

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
✅ **Flexibility** - Target and Reference can use different standards
✅ **Clear separation** - no synchronization complexity
✅ **Architectural purity** - follows established patterns from other sections

### Cons

❌ **Unclear Target usage** - Does Target model actually use d_13 for anything?
❌ **User confusion** - Why have two separate reference standard dropdowns?
❌ **Extra UI complexity** - Need to manage two dropdown selections
❌ **Comparison scenarios** - Hard to compare same standard across models

### Current Status

**Currently BROKEN in sections 05, 06, 11, 12, 13, 14**:
- ReferenceState.setDefaults() reads `d_13` (wrong field)
- d_13 listener calls ReferenceState.onReferenceStandardChange() (contamination)

**Would require fixing**:
- 6 sections need ReferenceState.setDefaults() to read `ref_d_13`
- 6 sections need d_13 listener removed from ReferenceState updates
- Section09 already partially correct (has ref_d_13 listener)

---

## OPTION 2: "One D13 Setting" (Synchronized Reference Standard)

### Architectural Principle

**d_13 is the single source of truth for BOTH models' reference standard**

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

### Implementation Requirements

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
✅ **Maintainability** - No complex T-Cell or ReferenceValue lookups in M/N calcs
✅ **User experience** - Intuitive: "What code am I designing to?"
✅ **Teaching** - Easier to explain to users
✅ **Mostly working** - Current implementation 90% there, just needs ref_d_13 sync

### Cons

❌ **Less flexibility** - Can't compare Target against different reference standard
❌ **Violates dual-state purity** - Target setting affects Reference model
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

## Comparison Matrix

| Aspect | Option 1: No State Mix | Option 2: One D13 Setting |
|--------|----------------------|-------------------------|
| **State Isolation** | ✅ Perfect | ⚠️ Intentional coupling |
| **Implementation Effort** | ❌ Fix 6 sections | ✅ Add sync logic only |
| **User Experience** | ❌ Two dropdowns | ✅ One dropdown |
| **Flexibility** | ✅ Independent standards | ❌ Locked together |
| **Maintenance** | ⚠️ Complex M/N calcs | ✅ Simple M/N calcs |
| **Architecture Alignment** | ✅ Follows cheatsheet | ❌ Diverges from patterns |
| **Teaching/Learning** | ❌ More complex | ✅ Easier to explain |

---

## Investigation Required (Before Decision)

### Question 1: Does Target Model Use d_13?

**Search for**: Target model calculations that reference d_13
- If YES → Option 1 makes sense (Target needs its own standard)
- If NO → Option 2 makes sense (d_13 only for Reference baseline)

### Question 2: What's Causing 238%?

Debug compliance calculation:
```javascript
console.log('d_13 =', window.TEUI.StateManager.getValue('d_13'));
console.log('ref_d_13 =', window.TEUI.StateManager.getValue('ref_d_13'));
console.log('d_65 =', window.TEUI.StateManager.getValue('d_65'));
console.log('ref_d_65 =', window.TEUI.StateManager.getValue('ref_d_65'));
console.log('m_65 = (d_65 / ref_d_65) * 100');
```

### Question 3: User Workflow Expectations?

**Scenario A**: User wants to design to PH Classic, compare against PH Classic
- Option 2 is perfect: One dropdown, simple

**Scenario B**: User wants to design to PH Classic, but compare against PHIUS 2021
- Option 1 required: Need independent standards

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
