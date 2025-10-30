# Reference Model System - Implementation Workplan

> **Status**: Planning Phase
> **Goal**: Clean up and complete the Reference Model overlay system
> **Last Updated**: 2025-01-12

---

## Overview: What We Have

The TEUI calculator has a **legacy Reference Model system** that needs cleanup and completion. The bones are excellent - the dual calculation engine architecture is solid and working well. However, the documentation became confusing, and some visual feedback features were lost during refactoring.

### Core Architecture (Already Working ✓)

1. **Dual Calculation Engines**: Both Target and Reference models calculate in parallel, automatically, whenever ANY input changes. This works beautifully for:

   - User-modified input fields (numeric, text, dropdown, slider)
   - Imported values from external Excel files
   - **This performance must NOT regress**

2. **Perfect State Isolation**:

   - Target model values stored in StateManager without prefix: `d_52`, `f_85`, `j_115`
   - Reference model values stored with `ref_` prefix: `ref_d_52`, `ref_f_85`, `ref_j_115`
   - Target calculations NEVER affect Reference calculations and vice versa

3. **Sacred Calculation Formulas**:
   - All calculation formulas are Excel-vetted with 100.00% parity
   - **NEVER modify calculation logic or formulas**
   - We only SET input values; calculations always run automatically

---

## Understanding the Reference System

### Two Distinct Concepts (Source of Confusion)

The confusion in the old documentation came from mixing these two concepts:

#### 1. **Display Toggle** (View-Only)

- **Purpose**: Switch the UI to VIEW either Target or Reference calculated values
- **Action**: Changes which values are displayed in the UI
- **Does NOT**: Set, change, or calculate anything
- **Controls**:
  - Master toggle (index.html dropdown) - switches ALL sections at once
  - Section toggles (individual section headers) - switch one section at a time

#### 2. **Reference Value Setting** (Writes Data)

- **Purpose**: SET/WRITE input values into the Reference model
- **Action**: Populates Reference model inputs, then both engines recalculate
- **Methods**:
  - **A) User Manual Entry**: User edits fields while viewing Reference mode
  - **B) File Import**: Excel import populates both Target AND Reference from external file
  - **C) Reference Setup Modes**: Dropdown commands (ref_d_13) that copies/overlays values based on corresponding ReferenceValues for ref_d_13 selected.

### The Reference Setup Modes (Three Scenarios)

These are commands from the Reference dropdown in index.html:

#### **Mode 1: Mirror Target**

- **What it does**: Copies ALL Target input values → Reference input values (making two copies of the same building model, Target and Reference)
- **Then**: Both engines recalculate (Reference should match Target initially)
- **Use case**: "Start with identical building, then customize specific Reference values"
- **Example**:
  - Target: 1500m² Toronto heatpump building
  - Reference: 1500m² Toronto heatpump building (initially identical)
  - User can then edit specific Reference value(s) ie. 'set Reference to Gas heating' - to test variations

#### **Mode 2: Mirror Target + Reference Overlay** (Most Common)

- **What it does**:
  1. Copies ALL Target input values → Reference input values as per Mode 1,
  2. THEN overlays specific values from `ReferenceValues.js` based on `ref_d_13` setting
  3. THEN both engines recalculate. This then gives us the same building in Reference as in Target with the Building Code minimum required levels of insulation and equipment efficiencies.
- **ReferenceValues.js subset includes**:
  - Building envelope U-values/RSI-values (walls, roofs, floors, windows)
  - HVAC system efficiencies (AFUE, HSPF, COP)
  - DHW system efficiencies
  - Internal gains (occupant loads, lighting loads)
  - SHGC values
  - Ventilation rates and efficiencies
- **ReferenceValues.js does NOT include**:
  - Building geometry (areas, volumes, WWR)
  - Location/climate data
  - Energy costs
  - Occupancy schedules
- **Use case**: "Compare my building design against code minimum requirements"
- **Example**:
  - Target: 1500m² Toronto heatpump building with high-performance envelope
  - Reference: Same building geometry/location, but with OBC minimum U-values and efficiencies
  - Visual comparison shows how much better design performs vs. code minimum, and sets efficiency tiers automatically per S01 functions (already works this way)

#### **Mode 3: Independent Models**

- **What it does**: Nothing - models remain completely independent, same state as after initialization, or immediately after an excel file import
- **Use case**: "Compare any two completely different building scenarios"
- **Example**:
  - Target: 1500m² Toronto heatpump building in 2024
  - Reference: 2000m² Vancouver gas building in 2030
  - Complete freedom for custom comparisons

---

## How Values Flow Through the System

### When User Edits a Field in Reference Mode

1. User toggles to Reference view (sees red UI, sees ref_d_52 values)
2. User edits `d_52` field (DHW efficiency)
3. Edit writes to `ref_d_52` in StateManager
4. Both calculation engines run automatically (as they always do)
5. Target model unchanged (still using `d_52`)
6. Reference model recalculates using new `ref_d_52` value
7. UI updates to show new Reference calculated values

### When "Mirror Target + Reference Overlay" Runs

**Recommended Implementation Pattern** (using quarantine pattern from FileHandler):

```javascript
// 🔒 START QUARANTINE - Mute listeners to prevent premature calculations
window.TEUI.StateManager.muteListeners();

try {
  // PASS 1: Copy all Target inputs → Reference
  copyAllTargetInputsToReference();

  // PASS 2: Overlay ReferenceValues.js subset
  const standard = StateManager.getValue("ref_d_13") || "OBC SB12 3.1.1.2.C1";
  const refValues = TEUI.ReferenceValues[standard] || {};
  applyReferenceValuesOverlay(refValues);

  // Sync all Pattern A sections
  syncPatternASections();
} finally {
  // 🔓 END QUARANTINE - Always unmute
  window.TEUI.StateManager.unmuteListeners();
}

// Trigger clean recalculation with all values loaded
calculator.calculateAll();

// Refresh all Pattern A section UIs
refreshAllPatternAUIs();
```

**Both approaches should yield identical results**. The quarantine pattern is cleaner and matches the proven FileHandler pattern from Excel imports (which maps all input cells).

---

## Current State vs Desired State

### What Works ✓

1. **Dual calculation engines**: Perfect parallel calculation of Target and Reference
2. **State isolation**: Target and Reference values never contaminate each other
3. **User input in Reference mode**: Editing ref\_ fields works correctly
4. **File import**: Excel import populates both Target and Reference correctly
5. **CSS styling exists**: Red Reference theme CSS classes already defined in styles.css
6. **Section-level toggles**: Individual sections can switch to show Reference values

### What Needs Work 🔧

#### **Phase 1: Core Functionality** (Priority)

1. **Master Toggle Display Switching**

   - **Current**: Master toggle only changes CSS (red theme), but sections still show Target values
   - **Desired**: Master toggle calls `switchMode("reference")` on ALL sections simultaneously
   - **Result**: User sees red UI AND sees actual ref\_ values in all sections at once

2. **Reference Setup Mode Functions**

   - **Current**: Functions exist but may have bugs (TargetState access issues noted in old docs)
   - **Desired**: Clean implementations of Mirror Target, Mirror + Overlay, Independent
   - **Use**: Quarantine pattern from FileHandler for clean value setting

3. **ReferenceValues.js Integration**
   - **Current**: ReferenceValues.js exists with all building code standards
   - **Desired**: "Mirror + Overlay" properly applies subset of ref\_ values from selected standard
   - **Trigger**: Based on `ref_d_13` field value (Reference building code standard selector)

#### **Phase 2: Visual Feedback** (Secondary)

4. **Reference Overlay Highlighting**

   - **Purpose**: Show which fields came from ReferenceValues.js overlay
   - **Style**: Red italic bold font (CSS classes already exist)
   - **Behavior**:
     - Field shows red italic when value came from ReferenceValues.js
     - If user edits that field, style changes to blue bold (user-modified)
     - User override takes precedence over ReferenceValues.js

5. **Target/Reference Difference Highlighting**
   - **Purpose**: Show which fields differ between Target and Reference models
   - **Style**: Highlight fields where Target value ≠ Reference value
   - **Benefit**: User can quickly see where models diverge

---

## Implementation Questions - RESOLVED ✓

### 1. Field Discovery Method ✓

**Question**: How do we get the list of all input field IDs for each section?

**Answer**: Read from StateManager as single source of truth for Target and Reference model values.

**Implementation**: Use ExcelMapper field mapping structure as the authoritative list:

- `ExcelMapper.excelReportInputMapping` contains all Target field IDs
- `ExcelMapper.excelReferenceInputMapping` contains all Reference field IDs (with `ref_` prefix)
- This matches the proven file import pattern
- Can create a helper method: `getAllInputFieldIds()` that returns Object.keys from the mapping

**Benefits**:

- Same field list used for Excel import (proven, tested)
- Single source of truth
- No need to query individual sections
- Centralized and easy to maintain

### 2. ReferenceValues Application Level ✓

**Question**: Where should ReferenceValues overlay be applied?

**Answer**: At StateManager level using quarantine pattern, matching FileHandler import method.

**Implementation**:

```javascript
// 🔒 START QUARANTINE
window.TEUI.StateManager.muteListeners();

try {
  // Set all Reference values directly in StateManager with ref_ prefix
  Object.entries(refValues).forEach(([fieldId, value]) => {
    StateManager.setValue(`ref_${fieldId}`, value, "reference-standard");
  });
} finally {
  // 🔓 END QUARANTINE
  window.TEUI.StateManager.unmuteListeners();
}

// Then calculate once
calculator.calculateAll();
```

**Benefits**:

- Matches proven FileHandler pattern (KWW - Keep What Works)
- Clean values, no state mixing
- Most efficient and performant
- Centralized, easy to manage
- Visual overlay styling applied separately via CSS classes

### 3. Highlighting Function Location ✓

**Question**: Where does the highlighting logic currently live (or should live)?

**Answer**: Primarily in ReferenceManager.js (Option A), which already has `createReferenceHandler()` factory.

**Current State**:

- ReferenceManager.js has highlighting logic in `updateReferenceDisplay()` method
- Uses CSS classes: `reference-locked`, `data-locked` attributes
- Locks/unlocks fields based on `isCodeDefinedField()` and `isEditableInReferenceMode()`
- This code needs restoration/completion after refactoring

**Future Enhancement**: For visual overlay styling (red italic for ReferenceValues fields, highlighting differences):

- Apply CSS classes via ReferenceManager methods
- Classes already exist in styles.css
- Just need to apply them based on field source/state

**Benefits**:

- Keeps highlighting logic centralized
- Already exists (needs restoration)
- Works with existing CSS system

### 4. Calculation Timing ✓

**Question**: For "Mirror Target + Reference Overlay", when should calculations run?

**Answer**: Option B - Only once after both passes complete (quarantine pattern).

**Implementation**:

```javascript
// 🔒 START QUARANTINE - Mute listeners
window.TEUI.StateManager.muteListeners();

try {
  // PASS 1: Copy all Target inputs → Reference
  copyAllTargetInputsToReference();

  // PASS 2: Overlay ReferenceValues.js subset
  applyReferenceValuesOverlay(refValues);

  // Sync all Pattern A sections
  syncPatternASections();
} finally {
  // 🔓 END QUARANTINE - Always unmute
  window.TEUI.StateManager.unmuteListeners();
}

// THEN calculate once with all values settled
calculator.calculateAll();
```

**Benefits**:

- Matches FileHandler proven pattern (KWW)
- Cleaner, avoids double calculation
- More efficient
- No intermediate state visible to user
- Both approaches yield identical totals (as confirmed)

---

## Success Criteria

### Phase 1 Complete When:

1. **Master toggle works**: Click master toggle → ALL sections switch to Reference mode, showing actual ref\_ values
2. **Mirror Target works**: Click "Mirror Target" → Reference model inputs match Target model inputs exactly
3. **Mirror + Overlay works**: Click "Mirror + Overlay" → Reference gets Target values PLUS ReferenceValues.js subset
4. **No regressions**: User editing and file import still work perfectly
5. **No state mixing**: Target values never affected by Reference operations
6. **Calculations sacred**: No changes to any calculation formulas

### Phase 2 Complete When:

7. **Overlay highlighting works**: Fields from ReferenceValues.js show red italic styling
8. **User override styling works**: Editing overlaid field changes style to blue bold
9. **Difference highlighting works**: Fields that differ between Target/Reference are highlighted
10. **Persistent across toggles**: Highlighting persists when switching between Target/Reference views

---

## Implementation Approach

### Recommended Strategy

1. **Read existing code thoroughly** (avoid architectural violations):

   - README.md - Common pitfalls, StateManager patterns
   - DUAL-STATE-CHEATSHEET.md - Pattern A implementation
   - FileHandler.js - Quarantine pattern for value setting
   - Existing ReferenceToggle.js - Current implementation state

2. **Answer clarifying questions above** (avoid guessing)

3. **Implement Phase 1** (core functionality):

   - Fix master toggle to actually switch all section modes
   - Implement clean Mirror Target using quarantine pattern
   - Implement Mirror + Overlay with ReferenceValues.js integration
   - Test extensively (no regressions on user input or file import)

4. **Implement Phase 2** (visual feedback):

   - Restore/implement overlay highlighting
   - Restore/implement difference highlighting
   - Test visual consistency across all sections

5. **Documentation cleanup**:
   - Archive old Master-Reference-Roadmap.md
   - Update DUAL-STATE-CHEATSHEET.md with working Reference patterns
   - Add clear examples to README.md

---

## Anti-Patterns to Avoid

### Absolutely Forbidden:

1. **Never modify calculation formulas** - they are Excel-vetted and sacred
2. **Never use setTimeout** - use Dependency.js or StateManager patterns
3. **Never directly manipulate DOM** - all updates through StateManager.setValue()
4. **Never contaminate state** - Target and Reference must remain perfectly isolated
5. **Never bypass StateManager** - single source of truth for all values

### Required Patterns:

1. **Use ModeManager facade**: `section.ModeManager.getValue()` and `setValue()`
2. **Use quarantine pattern**: Mute listeners, set values, unmute, then calculate
3. **Use existing CSS classes**: Don't create new styling systems
4. **Use ref\_ prefix pattern**: All Reference values stored with `ref_` prefix in StateManager
5. **Follow FileHandler patterns**: Proven approach for bulk value setting

---

## Implementation Attempt #1 - LESSONS LEARNED (Oct 13, 2025)

**Status**: ❌ REVERTED - Accumulated too much technical debt

We attempted to implement Mirror Target/Reference functions using a bulk StateManager approach. After 15+ commits and debugging sessions, we reverted to avoid technical debt. Here's what we learned:

### ✅ What We Discovered (CRITICAL for next attempt)

1. **Field ID Format**

   - ExcelMapper uses: `D12`, `H15`, `D39` (uppercase, no underscore)
   - StateManager uses: `d_12`, `h_15`, `d_39` (lowercase WITH underscore)
   - **Conversion needed**: `D12` → `d_12` using regex `/^([A-Z]+)(\d+)$/`

2. **StateManager Does Store Target Values**

   - `StateManager.getValue("d_39")` returns Target value ✅
   - `StateManager.getValue("ref_d_39")` returns Reference value ✅
   - FileHandler exports prove this works

3. **Sections Have Internal State Objects**

   - Each section has `TargetState` and `ReferenceState` objects
   - These need `syncFromGlobalState()` to read from StateManager
   - Only ~12 of 15 sections have this method implemented
   - Only 2 sections successfully synced using our approach (sect12, sect13)

4. **Calculation Engine Doesn't Auto-Sync**
   - `Calculator.calculateAll()` runs calculations
   - But it doesn't trigger section sync from StateManager
   - Sections read from their internal state, not directly from StateManager
   - If internal state not synced, calculations use stale values

### ❌ Why Our Approach Failed

1. **Wrong execution order**: We synced AFTER calculations, should be BEFORE
2. **Section access broken**: `window.TEUI[sectionId]` didn't work for most sections
3. **Missing sync methods**: Not all sections implement `syncFromGlobalState()`
4. **Calculated values not stored**: `ref_e_10` stayed null even after calculations
5. **UI stale**: Even with values in StateManager, sections didn't display them

### 🎯 The Right Approach: Study FileHandler

**FileHandler successfully does what we need**:

- Reads Target values from StateManager (`getValue(id)`)
- Writes Reference values to StateManager (`setValue(ref_${id})`)
- Calls `updateStateFromImportData()` which handles sync properly
- Triggers calculations at the right time
- UI updates correctly

**Next attempt should**:

1. Study `FileHandler.processImportedCSV()` and `FileHandler.importExcelReferenceData()`
2. Use the EXACT same pattern they use
3. Call the SAME helper methods they call
4. Don't invent new sync mechanisms

### 📋 Revised Implementation Strategy

**Phase 0: Study FileHandler Pattern** (NEW - do this first!)

- Read FileHandler code thoroughly
- Document the exact sequence of operations
- Identify which helper methods trigger section syncs
- Map out the proven data flow

**Phase 1: Mirror Using FileHandler Pattern**

- Use `updateStateFromImportData()` or equivalent
- Follow proven sync sequence
- Leverage existing quarantine pattern from FileHandler
- Test with ONE section first before scaling

**Phase 2: Add ReferenceValues Overlay**

- Only after Mirror Target works 100%
- Use same proven patterns

**Phase 3: Visual Feedback**

- Only after core functionality works

---

## Next Steps

1. ~~Answer implementation questions above~~ ✅ DONE (documented above)
2. ~~Review and approve this workplan~~ ⏸️ PAUSED - need FileHandler study first
3. **NEW: Study FileHandler import pattern** ← START HERE
4. **Revise workplan** based on FileHandler findings
5. **Implement using proven patterns** (not custom approach)

---

## Notes

- **Section toggles**: Keep for now (useful for debugging and selective viewing), may retire later
- **Performance critical**: Must not regress excellent current performance of dual calculation engines
- **Excel parity**: Must maintain 100% calculation accuracy
- **State isolation**: Perfect separation between Target and Reference is non-negotiable
- **KWW (Keep What Works)**: FileHandler import works perfectly - mirror that pattern exactly

---

## Analysis of Existing Reference Files

### 4011-ReferenceValues.js (626 lines)

**Purpose**: Data file containing building code standards (OBC, NBC, etc.) with minimum U-values, efficiencies, etc.

**Current State**:

- ✅ **Well structured**: Clean object mapping of standards to field values
- ✅ **Complete data**: Has multiple building code standards defined
- ✅ **Helper functions**: `getStandardFields()`, `getStandards()`, etc.
- ✅ **Documentation**: Clear comments about what each value represents

**Assessment**: **Keep as-is, no changes needed**

**Rationale**:

- This is pure data, working perfectly
- Used by both import and overlay systems
- Helper functions are useful
- No refactoring needed

---

### 4011-ReferenceManager.js (357 lines)

**Purpose**: Service to manage access to reference standard values and handle display updates

**Current State**:

- 🟡 **Partially implemented**: Has good foundation but mixing concerns
- ✅ **Good parts**:
  - `getValue()`, `getTargetCell()` helpers for ReferenceValues lookup
  - `isCodeDefinedField()`, `isEditableInReferenceMode()` field classification
  - `createReferenceHandler()` factory for section-specific handling
- 🔴 **Problem areas**:
  - Lines 35-57: Uses `setTimeout()` (Anti-pattern - should be removed)
  - Lines 13-19: `fetchInitialStandard()` - reads from d_13 but should use ref_d_13 for Reference mode
  - Lines 217-333: `updateReferenceDisplay()` - Direct DOM manipulation, should use StateManager
  - Line 262: Locking fields with `disabled` - We decided NOT to lock, just style differently

**Recommendations**:

1. **SIMPLIFY** - Remove DOM manipulation code:

   - Delete `updateReferenceDisplay()` method (lines 217-298)
   - Delete `restoreDisplay()` method (lines 300-333)
   - Delete `createReferenceHandler()` factory (lines 155-334)
   - **Reason**: We're using quarantine pattern + StateManager, not direct DOM manipulation

2. **FIX** - Standard selection listener:

   - Line 35: Change `StateManager.addListener("d_13"...)` to listen to `ref_d_13` for Reference mode
   - Remove `setTimeout` anti-pattern (lines 49-56)
   - **Reason**: Reference model should track its own standard selection

3. **KEEP** - Helper functions are useful:

   - `getValue(fieldId)` - lookup ReferenceValues for current standard ✓
   - `getTargetCell(fieldId)` - get target DOM cell ID ✓
   - `isCodeDefinedField(fieldId)` - check if field comes from building code ✓
   - `isEditableInReferenceMode(fieldId)` - field classification ✓

4. **ADD** - New helper for visual styling:
   - `applyOverlayHighlighting(fieldId)` - apply CSS class to show field came from ReferenceValues
   - Uses existing CSS classes, doesn't manipulate values

**Simplified Structure**:

```javascript
TEUI.ReferenceManager = {
  // Lookup helpers (keep)
  getValue(fieldId) {
    /* ... */
  },
  getTargetCell(fieldId) {
    /* ... */
  },
  getCurrentStandardFields() {
    /* ... */
  },

  // Field classification (keep)
  isCodeDefinedField(fieldId) {
    /* ... */
  },
  isEditableInReferenceMode(fieldId) {
    /* ... */
  },

  // Visual styling helper (add)
  applyOverlayHighlighting(fieldIds) {
    /* ... */
  },

  // Standard tracking (fix)
  initialize() {
    // Listen to ref_d_13, not d_13
    // Remove setTimeout anti-pattern
  },
};
```

**Lines to Delete**: ~200 lines (DOM manipulation code)
**Lines to Fix**: ~30 lines (standard listener, initialization)
**Lines to Add**: ~20 lines (highlighting helper)
**Net Result**: Simpler, cleaner, follows architecture

---

### 4011-ReferenceToggle.js (589 lines)

**Purpose**: Handle switching between Target/Reference views and setup modes (Mirror, Overlay, etc.)

**Current State**:

- 🟡 **Partially working**: Core toggle works, setup modes implemented but may need refinement
- ✅ **Good parts**:
  - Lines 30-57: `getAllDualStateSections()` - correctly finds Pattern A sections ✓
  - Lines 63-97: `switchAllSectionsMode()` - properly switches all sections with CSS ✓
  - Lines 421-492: `mirrorTarget()` - uses ModeManager facade pattern correctly ✓
  - Lines 498-564: `mirrorTargetWithReference()` - correct structure ✓
  - Lines 129-203: Button wiring and initialization ✓
- 🟡 **Needs refinement**:
  - Lines 364-415: `getFieldIdsForSection()` - should use ExcelMapper mapping instead
  - Lines 421-492: `mirrorTarget()` - should use quarantine pattern, not per-section switches
  - Lines 498-564: `mirrorTargetWithReference()` - should apply overlay in quarantine
- 🔴 **Unused/legacy code**:
  - Lines 310-337: `toggleReferenceInputsView()` - incomplete, can be simplified
  - Lines 262-304: `handleStandardChange()` - may be redundant with ReferenceManager listener

**Recommendations**:

1. **REFACTOR** - Mirror Target to use quarantine pattern:

```javascript
function mirrorTarget() {
  // Get all field IDs from ExcelMapper
  const fieldIds = Object.keys(window.TEUI.ExcelMapper.excelReportInputMapping);

  // 🔒 START QUARANTINE
  window.TEUI.StateManager.muteListeners();

  try {
    // Copy all Target → Reference in one pass
    fieldIds.forEach((fieldId) => {
      const targetValue = StateManager.getValue(fieldId);
      if (targetValue !== null && targetValue !== undefined) {
        StateManager.setValue(`ref_${fieldId}`, targetValue, "mirrored");
      }
    });

    // Sync Pattern A sections
    syncPatternASections();
  } finally {
    // 🔓 END QUARANTINE
    window.TEUI.StateManager.unmuteListeners();
  }

  // Calculate once with all values set
  Calculator.calculateAll();

  // Refresh all section UIs
  refreshAllPatternAUIs();
}
```

2. **REFACTOR** - Mirror + Overlay to use quarantine pattern:

```javascript
function mirrorTargetWithReference() {
  const standard = StateManager.getValue("ref_d_13") || "OBC SB12 3.1.1.2.C1";
  const refValues = TEUI.ReferenceValues[standard] || {};

  // 🔒 START QUARANTINE
  window.TEUI.StateManager.muteListeners();

  try {
    // PASS 1: Copy all Target → Reference
    const fieldIds = Object.keys(
      window.TEUI.ExcelMapper.excelReportInputMapping,
    );
    fieldIds.forEach((fieldId) => {
      const targetValue = StateManager.getValue(fieldId);
      if (targetValue !== null && targetValue !== undefined) {
        StateManager.setValue(`ref_${fieldId}`, targetValue, "mirrored");
      }
    });

    // PASS 2: Overlay ReferenceValues subset
    Object.entries(refValues).forEach(([fieldId, value]) => {
      StateManager.setValue(`ref_${fieldId}`, value, "reference-standard");
    });

    // Sync Pattern A sections
    syncPatternASections();
  } finally {
    // 🔓 END QUARANTINE
    window.TEUI.StateManager.unmuteListeners();
  }

  // Calculate once
  Calculator.calculateAll();

  // Refresh UIs
  refreshAllPatternAUIs();

  // Apply visual highlighting for overlaid fields
  ReferenceManager.applyOverlayHighlighting(Object.keys(refValues));
}
```

3. **SIMPLIFY** - Remove per-section field discovery:

   - Delete `getFieldIdsForSection()` (lines 364-391)
   - Delete `getUINameForSection()` (lines 396-415)
   - **Reason**: Use ExcelMapper as single source of field list

4. **KEEP** - Display toggle infrastructure:

   - `switchAllSectionsMode()` ✓
   - `getAllDualStateSections()` ✓
   - Button initialization ✓

5. **ENHANCE** - Add helper methods:
   - `syncPatternASections()` - call sync on all Pattern A sections
   - `refreshAllPatternAUIs()` - refresh all section UIs after bulk updates

**Lines to Delete**: ~80 lines (per-section field discovery, unused handlers)
**Lines to Refactor**: ~150 lines (Mirror functions to use quarantine)
**Lines to Add**: ~40 lines (helper methods)
**Net Result**: Cleaner, faster, matches FileHandler pattern

---

## Implementation Strategy - File by File

### Phase 1: Core Functionality (Priority)

#### Step 1: ReferenceToggle.js Refactoring

**Goal**: Make Mirror Target and Mirror + Overlay work correctly with quarantine pattern

**Changes**:

1. Add `syncPatternASections()` helper
2. Add `refreshAllPatternAUIs()` helper
3. Refactor `mirrorTarget()` to use quarantine + ExcelMapper field list
4. Refactor `mirrorTargetWithReference()` to use quarantine pattern
5. Remove per-section field discovery methods
6. Test: Verify e_10 (Reference TEUI) equals h_10 (Target TEUI) after Mirror Target

**Files Modified**: `4011-ReferenceToggle.js`
**Lines Changed**: ~150 lines refactored, ~80 deleted, ~40 added
**Test After**: Mirror Target functionality

---

#### Step 2: ReferenceManager.js Simplification

**Goal**: Remove DOM manipulation, keep helpers, fix standard listener

**Changes**:

1. Delete `createReferenceHandler()` factory (not needed with quarantine pattern)
2. Delete `updateReferenceDisplay()` method (DOM manipulation)
3. Delete `restoreDisplay()` method (DOM manipulation)
4. Fix `initialize()` to listen to `ref_d_13` instead of `d_13`
5. Remove `setTimeout` anti-pattern
6. Keep all helper functions (getValue, isCodeDefinedField, etc.)

**Files Modified**: `4011-ReferenceManager.js`
**Lines Changed**: ~30 fixed, ~200 deleted
**Test After**: Standard selection in Reference mode

---

#### Step 3: Master Toggle Fix

**Goal**: Make master toggle actually switch all sections to show Reference values

**Changes**:

1. Verify `switchAllSectionsMode()` calls `section.modeManager.switchMode()`
2. Verify global CSS classes are applied correctly
3. Test with all sections to ensure synchronization

**Files Modified**: `4011-ReferenceToggle.js` (minor verification only)
**Lines Changed**: ~10 lines tested/verified
**Test After**: Master toggle shows ref\_ values in ALL sections

---

### Phase 2: Visual Feedback (Secondary)

#### Step 4: Overlay Highlighting

**Goal**: Show which fields came from ReferenceValues.js with red italic styling

**Changes**:

1. Add `applyOverlayHighlighting(fieldIds)` to ReferenceManager
2. Apply CSS class `reference-overlay-value` to highlighted fields
3. Remove highlighting when user edits field (change to user-modified style)

**Files Modified**: `4011-ReferenceManager.js`
**Lines Changed**: ~20 added
**Test After**: Visual styling for overlaid fields

---

#### Step 5: Difference Highlighting

**Goal**: Highlight fields where Target ≠ Reference

**Changes**:

1. Add `highlightDifferences()` method to ReferenceToggle
2. Compare Target vs Reference values in StateManager
3. Apply CSS class `reference-diff-highlight` to differing fields

**Files Modified**: `4011-ReferenceToggle.js`
**Lines Changed**: ~30 added
**Test After**: Visual difference highlighting

---

## Testing Checklist

### Phase 1 Tests (Core Functionality)

- [ ] **Test 1.1**: Mirror Target copies all fields

  - Action: Click "Mirror Target"
  - Verify: All `ref_` values match non-prefixed values in StateManager
  - Check: e_10 (Reference TEUI) = h_10 (Target TEUI)

- [ ] **Test 1.2**: Mirror + Overlay applies building code values

  - Action: Select building code standard, click "Mirror + Overlay"
  - Verify: Geometry values match Target (h_15, d_19, etc.)
  - Verify: U-values match ReferenceValues.js for selected standard
  - Check: Reference TEUI uses code minimum envelope/equipment

- [ ] **Test 1.3**: Master toggle switches all sections

  - Action: Click master "Show Reference" button
  - Verify: ALL sections show ref\_ values (not just CSS change)
  - Verify: Red UI theme applied globally
  - Check: Toggle back to Target mode restores all sections

- [ ] **Test 1.4**: No regressions in user editing

  - Action: Edit a field in Target mode
  - Verify: Target calculation updates correctly
  - Action: Toggle to Reference, edit a ref\_ field
  - Verify: Reference calculation updates, Target unchanged

- [ ] **Test 1.5**: No regressions in file import
  - Action: Import Excel file with Target and Reference data
  - Verify: Both models populate correctly
  - Verify: Calculations run correctly for both
  - Check: No state mixing between models

### Phase 2 Tests (Visual Feedback)

- [ ] **Test 2.1**: Overlay highlighting appears

  - Action: Run "Mirror + Overlay"
  - Verify: Fields from ReferenceValues.js show red italic styling
  - Verify: Other fields show normal styling

- [ ] **Test 2.2**: User override removes highlighting

  - Action: Edit a red italic overlaid field
  - Verify: Styling changes to blue bold (user-modified)
  - Verify: Value persists in StateManager

- [ ] **Test 2.3**: Difference highlighting shows divergence
  - Action: Run "Mirror Target", then edit one Reference field
  - Verify: Edited field highlights as different from Target
  - Verify: Highlighting persists across toggle

---

## Summary

**Current State**:

- 3 files, ~1,572 total lines
- Bones are good, needs refactoring and completion
- Some DOM manipulation anti-patterns to remove
- Setup modes partially implemented

**After Refactoring**:

- Cleaner, simpler code (~400 fewer lines)
- Follows proven FileHandler quarantine pattern
- No DOM manipulation (StateManager only)
- Complete Phase 1 functionality
- Foundation for Phase 2 visual enhancements

**Key Philosophy**: KWW (Keep What Works)

- Keep dual calculation engines untouched ✓
- Keep ExcelMapper field list ✓
- Keep StateManager patterns ✓
- Keep existing CSS classes ✓
- Remove DOM manipulation ✗
- Remove setTimeout anti-patterns ✗
