# CDD Dynamic Editability Feature - Implementation Analysis

**Created**: 2025-10-31
**Updated**: 2025-10-31 (Simplified approach)
**Status**: 📋 **READY FOR IMPLEMENTATION** - Simple dynamic field behavior
**Goal**: Make Section 03 CDD field (d_21) dynamically editable when climate data unavailable

---

## 📋 **OBJECTIVE**

Enhance Section 03 user experience when CDD (Cooling Degree Days) climate data is missing from ClimateValues.js:

### **Requirements:**
1. **When CDD unavailable**: Field shows "Unavailable" and becomes user-editable (like `m_19` "Days Cooling")
2. **When CDD available**: Field shows climate data and is locked (non-editable)
3. **User-entered values**: Remain editable with user-input styling (bold blue) UNTIL location changes
4. **Location changes with NEW CDD data**: Overwrites user value, locks field
5. **Location changes STILL unavailable**: Clears to "Unavailable", stays editable
6. **Mode switching**: Target and Reference track their CDD values independently (already works via existing dual-state)

---

## 💡 **KEY INSIGHT: KISS PRINCIPLE**

**We don't need complex state tracking!** Just make the field behavior dynamic based on whether climate data is available:

- **Climate data exists** → Field is locked (calculated/derived field)
- **Climate data missing** → Field is editable (user-input field)
- **User enters value** → Stays editable (but looks like user-input)
- **New location with data** → Becomes locked again (calculated field)

**This is exactly how other fields work** - no special tracking needed!

---

## ❌ **WHAT WE TRIED (FAILED APPROACH)**

### **Attempt 1: Simple State Attribute Tracking**

**Implementation:**
- Changed "N/A" to "Unavailable" text for missing CDD
- Added `data-cdd-source` DOM attribute to track "user" vs "system" source
- Created `updateCDDFieldEditability()` function to toggle contentEditable
- Added `handleCDDBlur()` for user input processing
- Used `clearUserEnteredCDDValue()` on location changes

**Problems Discovered:**

1. **State Bleeding Between Modes**
   - Switching from Target to Reference mode showed "Unavailable" even when Reference location had valid CDD data
   - User-entered values in Target mode disappeared when switching to Reference
   - Reference user-entered values contaminated Target when switching back

2. **State Source Tracking Complexity**
   - Started with DOM attributes (`data-cdd-source`)
   - Tried adding metadata objects to TargetState/ReferenceState
   - Attempted StateManager fields (`d_21_source`, `ref_d_21_source`)
   - Each approach added complexity without solving isolation

3. **Dual-Engine Architecture Violation**
   - Initial approach called `calculateAll()` in `switchMode()` (anti-pattern!)
   - User input handler didn't properly preserve values during recalculation
   - Climate data fetch didn't properly isolate Target vs Reference CDD

---

## 🚨 **ROOT CAUSE ANALYSIS**

### **Core Issue: Insufficient State Isolation**

Per **4012-CHEATSHEET.md Anti-Pattern 1: State Contamination via Fallbacks**:

> **The Correct Pattern:** Logic must be strictly isolated. If a Reference value does not exist, it should use a defined default or show '0', but it must **never** use a Target value.

**Our Implementation Failed Because:**

1. **Incomplete Mode-Aware Reading**
   - `updateCDDFieldEditability()` checked current mode but didn't properly isolate state
   - DOM attribute tracking (`data-cdd-source`) not sufficient for dual-state isolation

2. **Preservation Logic Issues**
   - User-entered values preserved during calculation BUT not during mode switches
   - Climate data fetch didn't distinguish between:
     - Target location with unavailable CDD
     - Reference location with available CDD
     - User-entered override for either mode

3. **StateManager Publication Gaps**
   - CDD source tracking (`d_21_source`) added to StateManager
   - But mode switching didn't properly refresh from isolated state objects

---

## ✅ **PROPER DUAL-STATE ARCHITECTURE PATTERNS**

### **From 4012-CHEATSHEET.md Section: Core Architectural Principles**

#### **Principle 1: Dual-Engine Calculations**
> `calculateAll()` **MUST** run both `calculateTargetModel()` and `calculateReferenceModel()` in parallel on every data change.

**Application to CDD:**
- Both engines must run simultaneously
- Each engine must independently fetch climate data for its location
- User-entered CDD overrides must be preserved per-engine

#### **Principle 2: UI Toggle is Display-Only**
> The `switchMode()` function **MUST NOT** trigger calculations. It is a UI filter that only changes which pre-calculated state is displayed.

**What We Did Wrong:**
```javascript
// ❌ WRONG: Added calculateAll() to switchMode()
switchMode: function (mode) {
  calculateAll(); // ❌ Anti-pattern!
  this.refreshUI();
}
```

**Correct Pattern:**
```javascript
// ✅ CORRECT: Only refresh UI, calculations already done
switchMode: function (mode) {
  this.refreshUI();
  this.updateCalculatedDisplayValues();
}
```

#### **Principle 3: State Sovereignty**
> Each section manages its own `TargetState` and `ReferenceState`. It does not read `target_` or `ref_` prefixed values from other sections for its internal calculations.

**Application to CDD:**
- CDD source tracking belongs in TargetState and ReferenceState
- Not in separate metadata objects
- Not just in DOM attributes
- Not just in StateManager auxiliary fields

---

## 🎯 **SIMPLIFIED SOLUTION (4 Small Changes)**

### **Change 1: Climate Data Returns "Unavailable" (Already Done!)**

In `getClimateDataForState()` around line 626:

```javascript
const climateValues = {
  d_20: hdd !== null && hdd !== undefined && hdd !== 666 ? hdd : "N/A",
  d_21: cdd !== null && cdd !== undefined && cdd !== 666 ? cdd : "Unavailable", // ✅ Changed from "N/A"
  j_19: determineClimateZone(hdd),
  d_23: selectedJanTemp,
  d_24: cityData.July_2_5_Tdb || "34",
  l_22: cityData["Elev ASL (m)"] || "80",
};
```

### **Change 2: Preserve User Values When Climate Unavailable**

In `calculateTargetModel()` and `calculateReferenceModel()` around line 1798:

```javascript
// ✅ STEP 2: Update both local state AND StateManager immediately
Object.entries(climateValues).forEach(([key, value]) => {
  // Special handling for d_21 (CDD): preserve user-entered values
  if (key === "d_21" && value === "Unavailable") {
    const currentValue = TargetState.getValue("d_21");
    // Only overwrite with "Unavailable" if current value is also unavailable/empty
    if (currentValue && currentValue !== "Unavailable" && currentValue !== "N/A") {
      console.log(`[S03] Preserving user-entered CDD value: ${currentValue}`);
      return; // Skip updating this field - keep user value
    }
  }

  TargetState.setValue(key, value, "calculated");
  window.TEUI.StateManager.setValue(key, value.toString(), "calculated");
});
```

**Same pattern for ReferenceState in `calculateReferenceModel()`**

### **Change 3: Dynamic Editability Function**

Add new function after `updateCriticalOccupancyFlag()`:

```javascript
/**
 * ✅ NEW: Update CDD field (d_21) editability based on data availability
 * When CDD data is unavailable, make field editable like m_19 (Days Cooling)
 * When CDD data is available, lock the field (derived from climate data)
 */
function updateCDDFieldEditability() {
  const cddField = document.querySelector('[data-field-id="d_21"]');
  if (!cddField) return;

  const cddValue = ModeManager.getValue("d_21");
  const isUnavailable = cddValue === "Unavailable" || cddValue === "N/A";

  if (isUnavailable) {
    // Make field editable when data is unavailable
    cddField.contentEditable = "true";
    cddField.classList.add("user-input", "editable");

    // Add event listeners if not already present
    if (!cddField.hasEditableListeners) {
      cddField.addEventListener("blur", handleEditableBlur); // ✅ Use existing handler!
      cddField.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          this.blur();
        }
      });
      cddField.hasEditableListeners = true;
    }
  } else {
    // Lock field when valid climate data is available
    cddField.contentEditable = "false";
    cddField.classList.remove("user-input", "editable");
    cddField.hasEditableListeners = false;
  }
}
```

### **Change 4: Call Editability Update After Calculations**

In `calculateAll()` around line 1771:

```javascript
function calculateAll() {
  // ALWAYS run BOTH engines in parallel for complete downstream data
  calculateTargetModel(); // Updates Target values (unprefixed)
  calculateReferenceModel(); // Stores ref_ values for downstream sections

  // MANDATORY: Update DOM display after calculations (strict isolation)
  ModeManager.updateCalculatedDisplayValues();

  // ✅ NEW: Update CDD field editability based on data availability
  updateCDDFieldEditability();
}
```

**That's it!** No complex state tracking, no new metadata, no custom handlers.

---

## 🧪 **TESTING PROTOCOL**

### **Test 1: Target Mode - Unavailable CDD**
1. Set Target location to city without CDD data
2. ✅ Field shows "Unavailable" and is editable (grey italic default style)
3. Enter CDD value (e.g., 200)
4. ✅ Field shows "200" with user-input styling (bold blue)
5. ✅ Calculations run with user value
6. Switch to Reference mode and back
7. ✅ Target user value preserved (200, still editable with user-input style)

### **Test 2: Reference Mode - Available CDD**
1. Set Reference location to Alexandria, ON (has CDD = 196)
2. Switch to Reference mode
3. ✅ Field shows "196" and is locked (non-editable)
4. ✅ No contamination from Target user-entered value

### **Test 3: Location Change - New Data Available**
1. Target mode with user-entered CDD = 200
2. Change city to Ottawa (has CDD = 230)
3. ✅ User CDD overwritten with climate data (230)
4. ✅ Field locks (becomes non-editable)
5. ✅ Calculations use new climate value

### **Test 4: Location Change - Still Unavailable**
1. Target mode with user-entered CDD = 200
2. Change city to remote location (no CDD data)
3. ✅ Field resets to "Unavailable"
4. ✅ Field remains editable
5. ✅ User can enter new value for new location

### **Test 5: Persistence Across Refresh**
1. Enter user CDD = 200 in Target mode
2. Refresh page
3. ✅ User CDD value restored (200)
4. ✅ Field remains editable with user-input styling
5. ✅ Calculations use restored value

### **Test 6: Mode Isolation**
1. Target: User-entered CDD = 200 (editable)
2. Reference: Climate CDD = 196 (locked)
3. Switch between modes 5+ times
4. ✅ Each mode maintains its own value and editability state
5. ✅ No cross-contamination

---

## 📚 **RELEVANT CHEATSHEET SECTIONS**

### **Core Principles We Must Follow:**
- ✅ **Principle 2**: UI toggle display-only (no calculateAll in switchMode)
- ✅ **Principle 3**: State sovereignty (CDD source in TargetState/ReferenceState)
- ✅ **Principle 4**: Reference results shared (publish ref_d_21 to StateManager)

### **Anti-Patterns We Hit:**
- ❌ **Anti-Pattern 1**: State contamination via fallbacks
- ❌ **Anti-Pattern 2**: Direct DOM writes from calculation logic (initial attempts)

### **Correct Patterns to Apply:**
- ✅ **Pattern A**: Self-contained state module with TargetState/ReferenceState
- ✅ **Dual-Engine**: Both engines run in parallel, preserve user overrides
- ✅ **refreshUI**: Mode switching only updates display from pre-calculated states

---

## 🎯 **SUCCESS CRITERIA**

### **Functional Requirements:**
- ✅ CDD field editable when data unavailable (shows "Unavailable", grey italic)
- ✅ CDD field locked when climate data available (non-editable)
- ✅ User-entered values remain editable with user-input styling (bold blue)
- ✅ Location changes with new CDD data: overwrites user value, locks field
- ✅ Location changes still unavailable: resets to "Unavailable", stays editable
- ✅ Values persist across page reloads via TargetState/ReferenceState

### **Architectural Requirements:**
- ✅ No state contamination between Target and Reference (dual-state already works)
- ✅ No calculateAll() in switchMode() (not added)
- ✅ Uses existing handleEditableBlur() - no custom handlers
- ✅ User values preserved during recalculation (skip logic in climate fetch)
- ✅ Mode switching only calls refreshUI() (no changes to that)

### **User Experience:**
- ✅ Clear visual feedback (editable=blue, locked=black text)
- ✅ User-input styling (bold blue) automatic via CSS classes
- ✅ Smooth mode switching without losing data (dual-state handles it)
- ✅ Intuitive behavior: data overwrites user, unavailable stays editable

### **Simplicity:**
- ✅ Only 4 small code changes
- ✅ No new metadata tracking
- ✅ No special state objects
- ✅ Reuses existing infrastructure

---

## 📋 **IMPLEMENTATION STEPS**

1. **Change 1**: Update "N/A" to "Unavailable" in `getClimateDataForState()` (line 626)
2. **Change 2**: Add preservation logic to both calculation engines (lines 1798 & 1862)
3. **Change 3**: Add `updateCDDFieldEditability()` function (after line 2072)
4. **Change 4**: Call `updateCDDFieldEditability()` in `calculateAll()` (line 1771)
5. **Test**: Run complete testing protocol above
6. **Verify**: No state contamination, mode switching works correctly

---

## 💡 **KEY LEARNINGS**

1. **State Isolation is Hard**: Simple approaches (DOM attributes, metadata objects) insufficient
2. **Follow the Architecture**: CHEATSHEET patterns exist for a reason - deviating causes issues
3. **Test Incrementally**: Don't batch multiple changes - test after each phase
4. **Mode Switching is Display-Only**: Never add calculation logic to switchMode()
5. **State Objects are Sovereign**: Track field metadata in TargetState/ReferenceState, not externally

---

**Status**: Ready for proper implementation following dual-state architecture patterns
