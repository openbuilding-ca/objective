# Reference System UI/Mode Switch Workplan

> **Status**: ✅ COMPLETE - All sections S02-S16 implemented
> **Goal**: Complete the global Reference mode display system by linking dropdown commands to section controls
> **Scope**: UI/mode switching only - constrained to "Show Reference" and "Show Target" commands
> **Last Updated**: 2025-11-03 (Final completion with S16 Sankey)

---

## Implementation Status

### ✅ COMPLETE: All Pattern A Sections (S02-S16)

**Phase 1 Commits (S02-S08):**
- `d2186b5` - Test: Add toggle UI sync to S02 for global Reference switch
- `508752a` - Refactor: Remove duplicate UI code from S02 toggle handler
- `670327a` - Feat: Apply toggle UI sync pattern to S03
- `e149029` - Feat: Apply toggle UI sync pattern to S04
- `f4a663d` - Feat: Apply toggle UI sync pattern to S05
- `70a49ca` - Feat: Apply toggle UI sync pattern to S06
- `e25a616` - Feat: Apply toggle UI sync pattern to S07
- `58258ff` - Feat: Standardize S08 controls and apply toggle UI sync pattern
- `9db5fcc` - Fix: Add S05-S07 to global Reference toggle section list
- `00f7639` - Fix: Expose S05 and S06 ModeManager on window.TEUI namespace

**Phase 2 Commits (S09-S15):**
- `27ab4e3` - Docs: Update REF-SWITCH.md completion status
- `2905574` - Feat: Apply toggle UI sync pattern to S10
- `f1e863c` - Feat: Add S09 to global Reference system + apply pattern
- `a376a25` - Feat: Apply toggle UI sync pattern to S11
- `d8568eb` - Feat: Apply toggle UI sync pattern to S12
- `acbef27` - Feat: Apply toggle UI sync pattern to S13
- `eb13b74` - Feat: Apply toggle UI sync pattern to S14 & S15 (final sections)

**Final Commits (Cleanup & Documentation):**
- `fc4ab9c` - Docs: Update S13 header comments (user changes)
- `2c2436f` - UI: Comment out incomplete Reference Setup methods in dropdown

**Phase 3 Commits (S16 Sankey Diagram):**
- `81ebd1d` - Feat: Add S16 Sankey Reference mode support with mode-aware value reading
- `8a8bf93` - Debug: Add comprehensive logging to S16 Reference mode switching
- `6bc0daa` - Fix: Expose S16 ModeManager on correct namespace for ReferenceToggle
- `deb39eb` - Refactor: Remove debug logging from S16 Reference mode implementation
- `e076b68` - Refactor: Centralize `ToggleUISync` utility (CTO - eliminates code duplication across all sections)

**Verified Working:**
1. ✅ Global "Show Reference" → All 15 sections (S02-S16) show Reference values + red toggle UI
2. ✅ Global "Show Target" → All 15 sections (S02-S16) show Target values + blue toggle UI
3. ✅ Local section toggles → Sync with global state perfectly
4. ✅ No code duplication (single source of truth for UI updates)
5. ✅ Reference and Target imports work perfectly across all sections
6. ✅ System supports all value entry and reference overlay changes
7. ✅ S16 Sankey diagrams (Heating, Cooling, Emissions) display correct Reference model data

**Key Issues Resolved:**
1. **Missing Sections in ReferenceToggle.js**: S05, S06, S07, S09 were not listed in `getAllDualStateSections()` array
2. **Inconsistent ModeManager Exposure**: S05, S06 only exposed ModeManager on `window.TEUI.SectionModules.sect0X` but ReferenceToggle expected `window.TEUI.sect0X`
3. **S08 Standardization**: S08 had different control structure (missing Reset button, different function names)
4. **S09 Discovery**: Initially missed - documentation incorrectly stated S09 lacked Pattern A architecture
5. **S16 Namespace Mismatch**: Module returned to `window.TEUI.SectionModules.sect16` but ReferenceToggle expected `window.TEUI.sect16.ModeManager`

---

## Executive Summary

The Reference system UI is **100% COMPLETE** with all 14 Pattern A sections (S02-S15) fully working. The global "Show Reference" and "Show Target" commands now successfully switch all sections simultaneously with perfect visual synchronization.

### ✅ What Works (Complete)

1. **CSS Styling System**: Complete red/blue theming for Reference/Target modes
2. **Dropdown UI**: Clean dropdown with "Display Toggle" section (incomplete methods hidden to prevent user confusion)
3. **Section ModeManagers**: All 14 Pattern A sections have working dual-state architecture
4. **ReferenceToggle.js**: Core switching logic with `switchAllSectionsMode()` tested across all sections
5. **Button Event Handlers**: All dropdown buttons wired to appropriate functions
6. **Global CSS Application**: Body-level classes apply/remove correctly across all sections
7. **All Sections (S02-S15)**: Complete 4-step toggle UI sync pattern implementation
8. **Import/Export System**: Reference and Target imports work perfectly across all sections
9. **Value Entry System**: System supports all value entry and reference overlay changes
10. **Toggle UI Sync**: Local and global toggles stay perfectly synchronized (single source of truth)

### 🎯 What This Enables

- **One-Click Global Switching**: Users can instantly switch between Target and Reference models across all 14 sections
- **Perfect State Consistency**: No sections get "stuck" in wrong mode - all transitions are atomic
- **Foundation for Future Work**: This implementation provides the foundation for "Mirror Target" and "Mirror Target + Reference" setup functions
- **Production Ready**: System is fully tested and ready for production use

### 📚 Lessons Learned

1. **ModeManager Exposure Consistency**: All sections must expose ModeManager on `window.TEUI.sect0X` (not just `window.TEUI.SectionModules.sect0X`)
2. **ReferenceToggle.js Section List**: All dual-state sections must be listed in `getAllDualStateSections()` array - easy to miss new sections
3. **Testing Strategy**: Test after each complex section (S10-S13) rather than batching, due to denser codebases
4. **Section Discovery**: S09 was initially missed - always verify ModeManager existence rather than relying on documentation

---

## Current State Analysis

### From 4012-REFERENCE.md (Lines 154-183)

**What Works:**
- Dual calculation engines running in parallel ✅
- Perfect state isolation (Target/Reference never mix) ✅
- User input in Reference mode working ✅
- File import populating both models ✅
- CSS styling exists and is comprehensive ✅
- Section-level toggles functional ✅
- **Master Toggle Display Switching**: ✅ **COMPLETE** - All sections switch values globally

**What Remains (Out of Scope for This Workplan):**
- **Reference Setup Mode Functions**: "Mirror Target" and "Mirror Target + Reference" (paused work, separate implementation)
- **ReferenceValues.js Integration**: Highlight overlay system (paused work, separate implementation)

### From Master-Reference-Roadmap.md (Lines 1130-1200)

**Work Paused Status (August 21, 2025):**
- Display toggle infrastructure: ✅ COMPLETED
- Section discovery: ✅ COMPLETED
- Button integration: ✅ COMPLETED
- Field discovery system: ✅ COMPLETED
- **What remains**: Fix missing methods and ensure `updateCalculatedDisplayValues()` calls

**Success Criteria for Resuming Work:**
- Perfect state isolation: ✅ Already achieved
- S13 contamination fixed: ✅ Resolved
- Import/export working: ✅ Working
- Default consistency: ✅ Maintained
- Cross-section clean: ✅ Clean `ref_` prefix isolation

---

## Problem Statement (RESOLVED ✅)

### User Experience Issue

**Original Problem (RESOLVED):**
1. User clicks "Reference" dropdown → Opens menu
2. User clicks "Show Reference" → Red UI appears
3. **BUT**: All sections still show Target values (blue toggle icons)
4. User must manually click each section's toggle to see Reference values

**Current Behavior (WORKING):**
1. User clicks "Reference" dropdown → Opens menu
2. User clicks "Show Reference" → Red UI appears
3. **AND**: ✅ All 14 sections automatically switch to Reference values
4. ✅ All section toggle icons show "Reference" (red) state
5. ✅ Perfect synchronization between local and global toggles

### Root Cause (FIXED)

The original implementation in [ReferenceToggle.js](src/core/ReferenceToggle.js) had three issues:

**Original Issues (ALL FIXED):**
1. ❌ `updateCalculatedDisplayValues()` may not exist on all ModeManager implementations
2. ❌ No visual update to section header toggles after global switch
3. ❌ No verification that section actually switched modes successfully

**Solution Implemented:**
- Added `syncToggleUI()` method to all 14 Pattern A sections
- Each section's `switchMode()` now calls `syncToggleUI()` to update visual toggle UI
- Toggle click handlers simplified to delegate all UI updates to `syncToggleUI()`
- Single source of truth eliminates code duplication and ensures consistency

---

## Scope Definition

### In Scope ✅

**This workplan focuses ONLY on display/UI switching:**
1. "Show Reference" command → All sections display Reference values
2. "Show Target" command → All sections display Target values
3. Section toggle icons sync with global mode
4. CSS styling coordination (red/blue themes)
5. Error handling for sections missing required methods
6. Visual feedback consistency across all sections

### Out of Scope ❌

**Explicitly NOT included in this workplan:**
1. "Mirror Target" setup function (paused work, separate implementation)
2. "Mirror Target + Reference" overlay function (paused work, separate implementation)
3. "Reference Independence" setup (already complete - no-op function)
4. ReferenceValues.js integration and highlighting
5. Import/export functionality
6. State isolation improvements
7. New calculation logic or formula changes

---

## Technical Architecture

### Dual-State Section Pattern (Pattern A)

From [DUAL-STATE-CHEATSHEET.md](docs/development/DUAL-STATE-CHEATSHEET.md):

**Core Components:**
1. **TargetState**: Manages Target model values and calculations
2. **ReferenceState**: Manages Reference model values and calculations
3. **ModeManager**: Facade that switches between states and updates display

**ModeManager Interface:**
```javascript
const ModeManager = {
  currentMode: "target" | "reference",
  switchMode(mode) { ... },           // Required
  getValue(fieldId) { ... },          // Required
  setValue(fieldId, value) { ... },   // Required
  refreshUI() { ... },                // Required
  updateCalculatedDisplayValues() { ... } // ⚠️ May not exist on all sections
};
```

### Section Discovery

From [ReferenceToggle.js:30-57](src/core/ReferenceToggle.js#L30-L57):

**Current Implementation:**
```javascript
function getAllDualStateSections() {
  const sectionIds = [
    "sect02", "sect03", "sect04", "sect08", "sect10",
    "sect11", "sect12", "sect13", "sect14", "sect15"
  ];

  return sectionIds
    .map(id => ({
      id,
      module: window.TEUI?.[id],
      modeManager: window.TEUI?.[id]?.ModeManager
    }))
    .filter(s => s.modeManager);
}
```

**Status**: ✅ Works correctly, finds ~9-10 sections

### CSS Styling System

From [styles.css:1398-1605](src/styles.css#L1398-L1605):

**Global CSS Classes:**
- `.viewing-reference-inputs` - Primary Reference mode class
- `.viewing-reference-values` - Reference values display
- `.reference-mode` - General Reference indicator
- `body.reference-mode` - Body-level styling trigger

**Section-Level Classes:**
- `.section-header.reference-mode` - Red header background (#8B0000)
- `.section-content.reference-mode` - Red borders
- `.field.reference-mode` - Field-level reference styling

**Status**: ✅ Comprehensive, working, no changes needed

---

## S02 Implementation Pattern (PROVEN - Apply to S03-S15)

### Overview

Section 02 now has a complete, working implementation that can be replicated to all other Pattern A sections. The pattern eliminates code duplication and ensures visual toggle UI stays in sync with mode state.

### Step 1: Store Toggle Element References

**Location**: In `injectHeaderControls()` function, after creating toggle elements

**Code to Add** (at end of function, before final console.log):

```javascript
// ✅ NEW: Store references to toggle elements on ModeManager for global toggle sync
ModeManager._toggleElements = {
  toggleSwitch: toggleSwitch,
  slider: slider,
  stateIndicator: stateIndicator
};
```

**Why**: Allows `ModeManager.syncToggleUI()` to access toggle elements without DOM queries.

**Files**: Section02.js lines 757-762 ✅ (reference implementation)

---

### Step 2: Add `syncToggleUI()` Method to ModeManager

**Location**: In `ModeManager` object definition, after `switchMode()` method

**Code to Add**:

```javascript
// ✅ NEW: Sync visual toggle switch and indicator to match current mode
// Called both when user clicks local toggle AND when global toggle switches mode
syncToggleUI: function (mode) {
  if (!this._toggleElements) {
    console.warn("[S0X] Toggle elements not yet initialized, skipping UI sync");
    return;
  }

  const { toggleSwitch, slider, stateIndicator } = this._toggleElements;
  const isReference = mode === "reference";

  // Update toggle switch visual state to match mode
  toggleSwitch.classList.toggle("active", isReference);

  if (isReference) {
    slider.style.transform = "translateX(20px)";
    toggleSwitch.style.backgroundColor = "#28a745";
    stateIndicator.textContent = "REFERENCE";
    stateIndicator.style.backgroundColor = "rgba(40, 167, 69, 0.7)";
  } else {
    slider.style.transform = "translateX(0px)";
    toggleSwitch.style.backgroundColor = "#ccc";
    stateIndicator.textContent = "TARGET";
    stateIndicator.style.backgroundColor = "rgba(0, 123, 255, 0.5)";
  }

  console.log(`[S0X] Synced toggle UI to ${mode.toUpperCase()} mode`);
},
```

**Why**: Single source of truth for all toggle UI updates. Works for both local and global toggle.

**Files**: Section02.js lines 1892-1919 ✅ (reference implementation)

---

### Step 3: Call `syncToggleUI()` from `switchMode()`

**Location**: In `ModeManager.switchMode()` method, after `updateCalculatedDisplayValues()` call

**Code to Add**:

```javascript
// ✅ NEW: Sync visual toggle UI when mode changes (from global or local toggle)
this.syncToggleUI(mode);
```

**Why**: Ensures toggle UI updates whenever mode changes, regardless of source (local click or global command).

**Files**: Section02.js line 1884 ✅ (reference implementation)

---

### Step 4: Simplify Local Toggle Click Handler

**Location**: In `injectHeaderControls()` function, toggle click event listener

**BEFORE** (14 lines, duplicate UI updates):
```javascript
toggleSwitch.addEventListener("click", (event) => {
  event.stopPropagation();
  const isReference = toggleSwitch.classList.toggle("active");
  if (isReference) {
    slider.style.transform = "translateX(20px)";
    toggleSwitch.style.backgroundColor = "#28a745";
    stateIndicator.textContent = "REFERENCE";
    stateIndicator.style.backgroundColor = "rgba(40, 167, 69, 0.7)";
    ModeManager.switchMode("reference");
  } else {
    slider.style.transform = "translateX(0px)";
    toggleSwitch.style.backgroundColor = "#ccc";
    stateIndicator.textContent = "TARGET";
    stateIndicator.style.backgroundColor = "rgba(0, 123, 255, 0.5)";
    ModeManager.switchMode("target");
  }
});
```

**AFTER** (4 lines, no duplicate code):
```javascript
// ✅ REFACTORED: Just toggle mode, let switchMode() handle all UI updates via syncToggleUI()
toggleSwitch.addEventListener("click", (event) => {
  event.stopPropagation();
  // Determine target mode by checking current mode (don't rely on classList)
  const targetMode = ModeManager.currentMode === "target" ? "reference" : "target";
  ModeManager.switchMode(targetMode);
});
```

**Why**: Eliminates code duplication. All UI updates now happen in `syncToggleUI()` (single source of truth).

**Files**: Section02.js lines 732-739 ✅ (reference implementation)

---

## Implementation Plan

### Phase 1: Apply S02 Pattern to Remaining Sections ✅ S02 COMPLETE

**Sections to Update**: S03, S04, S08, S10, S11, S12, S13, S14, S15

**For Each Section**:
1. Add `ModeManager._toggleElements` storage (Step 1)
2. Add `syncToggleUI()` method to ModeManager (Step 2)
3. Call `syncToggleUI()` from `switchMode()` (Step 3)
4. Simplify local toggle click handler (Step 4)

**Estimated Time**: ~15 minutes per section (total ~2 hours for all 9 sections)

**Benefits**:
- Global "Show Reference" switches ALL sections simultaneously
- Visual toggle UI stays in sync with mode state
- No code duplication across sections
- Single source of truth for UI updates

---

### Phase 2: Fix `updateCalculatedDisplayValues()` Calls (OPTIONAL)

**Problem**: Not all sections implement this method.

**Solution**: Add fallback to `refreshUI()` method.

**Code Changes** - [ReferenceToggle.js:63-97](src/core/ReferenceToggle.js#L63-L97):

```javascript
function switchAllSectionsMode(mode) {
  const sections = getAllDualStateSections();
  let switchedCount = 0;

  sections.forEach((section) => {
    try {
      if (section.modeManager && typeof section.modeManager.switchMode === "function") {
        section.modeManager.switchMode(mode);

        // ✅ NEW: Try updateCalculatedDisplayValues first, fallback to refreshUI
        if (typeof section.modeManager.updateCalculatedDisplayValues === "function") {
          section.modeManager.updateCalculatedDisplayValues();
        } else if (typeof section.modeManager.refreshUI === "function") {
          section.modeManager.refreshUI();
        } else {
          console.warn(`[ReferenceToggle] ${section.id} has no refreshUI or updateCalculatedDisplayValues method`);
        }

        switchedCount++;
      }
    } catch (error) {
      console.error(`[ReferenceToggle] Error switching ${section.id}:`, error);
    }
  });

  // ... rest of CSS application code
}
```

**Files Modified**: `src/core/ReferenceToggle.js`
**Lines Changed**: ~10 lines modified
**Risk**: Low - adds fallback, no breaking changes

---

### Phase 2: Sync Section Toggle Icons with Global Mode

**Problem**: Section header toggles don't update when global toggle is used.

**Solution**: Query and update all section toggle elements after global mode switch.

**Code Changes** - [ReferenceToggle.js:63-97](src/core/ReferenceToggle.js#L63-L97):

```javascript
function switchAllSectionsMode(mode) {
  // ... existing section switching code ...

  // ✅ NEW: Update section header toggle UI elements
  syncSectionToggleIcons(mode);

  // Apply existing CSS classes for global Reference styling
  const isReference = mode === "reference";
  document.body.classList.toggle("viewing-reference-inputs", isReference);
  document.body.classList.toggle("viewing-reference-values", isReference);
  document.body.classList.toggle("reference-mode", isReference);
  document.documentElement.classList.toggle("reference-mode", isReference);

  console.log(
    `🎨 Master Toggle: Switched ${switchedCount}/${sections.length} sections to ${mode.toUpperCase()} mode with global styling`
  );
  return switchedCount;
}

// ✅ NEW: Helper function to sync section toggle icons
function syncSectionToggleIcons(mode) {
  const sections = getAllDualStateSections();

  sections.forEach((section) => {
    // Find section header toggle button/icon
    const sectionContainer = document.querySelector(`#${section.id}`);
    if (!sectionContainer) return;

    const toggleButton = sectionContainer.querySelector('.section-toggle-button') ||
                        sectionContainer.querySelector('[data-toggle="mode"]');

    if (toggleButton) {
      // Update toggle icon/state to match mode
      toggleButton.classList.toggle('reference-mode', mode === 'reference');
      toggleButton.classList.toggle('target-mode', mode === 'target');

      // Update aria labels for accessibility
      const modeLabel = mode === 'reference' ? 'Reference' : 'Target';
      toggleButton.setAttribute('aria-label', `Switch to ${mode === 'reference' ? 'Target' : 'Reference'} mode`);
      toggleButton.setAttribute('title', `Currently showing ${modeLabel} values`);
    }
  });
}
```

**Files Modified**: `src/core/ReferenceToggle.js`
**Lines Added**: ~25 lines (new helper function)
**Risk**: Low - purely visual updates, no state changes

**Note**: This assumes section headers have toggle buttons with identifiable selectors. If not, we'll need to inspect actual section HTML to determine correct selectors.

---

### Phase 3: Add Master Toggle State Indicator

**Problem**: User can't easily tell which mode is currently active.

**Solution**: Update global toggle UI to show current state clearly.

**Code Changes** - [ReferenceToggle.js:209-257](src/core/ReferenceToggle.js#L209-L257):

```javascript
function toggleReferenceDisplay() {
  isShowingReference = !isShowingReference;
  const targetMode = isShowingReference ? "reference" : "target";

  console.log(
    `[ReferenceToggle] Switching ALL sections to ${targetMode.toUpperCase()} display mode`
  );

  const switchedCount = switchAllSectionsMode(targetMode);

  if (switchedCount > 0) {
    // Update all calculated display values
    updateAllCalculatedDisplays();

    // ✅ MODIFIED: Update button text AND visual state
    updateMasterToggleUI(isShowingReference);

    // Apply Reference mode styling
    document.body.classList.toggle("viewing-reference-inputs", isShowingReference);
    document.body.classList.toggle("viewing-reference-values", isShowingReference);
    document.body.classList.toggle("reference-mode", isShowingReference);
    document.documentElement.classList.toggle("reference-mode", isShowingReference);

    console.log(
      `[ReferenceToggle] Successfully toggled to ${targetMode.toUpperCase()} display mode with UI styling`
    );
  } else {
    console.warn("[ReferenceToggle] No sections were switched - reverting toggle");
    isShowingReference = !isShowingReference;
  }
}

// ✅ NEW: Update master toggle UI elements
function updateMasterToggleUI(isReference) {
  // Update dropdown button text
  const showRefBtn = document.getElementById("showReferenceBtn");
  const showTargetBtn = document.getElementById("showTargetBtn");

  if (showRefBtn) {
    showRefBtn.classList.toggle('active', isReference);
  }
  if (showTargetBtn) {
    showTargetBtn.classList.toggle('active', !isReference);
  }

  // Update main Reference dropdown button appearance
  const referenceDropdown = document.querySelector('.btn-danger');
  if (referenceDropdown) {
    referenceDropdown.textContent = isReference ? 'Reference (Active)' : 'Reference';
    referenceDropdown.classList.toggle('active', isReference);
  }

  // Update global toggle switch if it exists (from index.html)
  const toggleLabel = document.querySelector('label[for="globalToggleSwitch"]');
  if (toggleLabel) {
    toggleLabel.textContent = isReference ? 'Show Target' : 'Show Reference';
  }
}
```

**Files Modified**: `src/core/ReferenceToggle.js`
**Lines Added**: ~30 lines (new helper function)
**Risk**: Low - purely visual updates

---

### Phase 4: Add Keyboard Shortcuts (Optional Enhancement)

**Problem**: No quick way to toggle between modes.

**Solution**: Add keyboard shortcut (Ctrl+Shift+R) to toggle Reference mode.

**Code Changes** - [ReferenceToggle.js:128-203](src/core/ReferenceToggle.js#L128-L203):

```javascript
function initialize() {
  // ... existing button event handlers ...

  // ✅ NEW: Keyboard shortcut for quick toggle
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+R or Cmd+Shift+R to toggle Reference mode
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
      e.preventDefault();
      toggleReferenceDisplay();
      console.log('[ReferenceToggle] Toggled via keyboard shortcut');
    }
  });

  console.log("[ReferenceToggle] Master Reference Toggle initialization complete");
  console.log("[ReferenceToggle] Keyboard shortcut: Ctrl+Shift+R (or Cmd+Shift+R on Mac)");
}
```

**Files Modified**: `src/core/ReferenceToggle.js`
**Lines Added**: ~12 lines
**Risk**: Very low - optional enhancement, easily removable if unwanted

---

## Testing Plan

### Test 1: Basic Display Toggle

**Steps:**
1. Load application (all sections in Target mode by default)
2. Click "Reference" dropdown → Click "Show Reference"
3. Verify:
   - ✅ Red UI styling appears globally
   - ✅ ALL sections show Reference values (not Target)
   - ✅ All section header toggles show "Reference" state
   - ✅ Dropdown button shows "Reference (Active)"
4. Click "Reference" dropdown → Click "Show Target"
5. Verify:
   - ✅ Blue UI styling restored
   - ✅ ALL sections show Target values
   - ✅ All section header toggles show "Target" state
   - ✅ Dropdown button shows "Reference"

**Success Criteria**: All verifications pass, no console errors

---

### Test 2: Section Toggle Sync

**Steps:**
1. Start in Target mode (default)
2. Manually click Section 03 toggle → Switch to Reference
3. Verify:
   - ✅ Section 03 shows Reference values
   - ✅ Section 03 toggle icon shows "Reference" state
   - ✅ Other sections still show Target values
4. Click global "Show Reference"
5. Verify:
   - ✅ ALL sections now show Reference values
   - ✅ Section 03 toggle still shows "Reference" (no duplicate switch)
   - ✅ Other section toggles updated to "Reference"

**Success Criteria**: No sections get "stuck" or switch modes twice

---

### Test 3: Error Handling

**Steps:**
1. Open browser console
2. Temporarily remove `updateCalculatedDisplayValues()` from Section 03 ModeManager:
   ```javascript
   delete window.TEUI.sect03.ModeManager.updateCalculatedDisplayValues;
   ```
3. Click "Show Reference"
4. Verify:
   - ✅ Section 03 still switches to Reference mode (using `refreshUI()` fallback)
   - ✅ Console shows warning: `[ReferenceToggle] sect03 using refreshUI() fallback`
   - ✅ No errors thrown
   - ✅ Other sections switch correctly

**Success Criteria**: Graceful fallback, no crashes

---

### Test 4: Visual Feedback

**Steps:**
1. Start in Target mode
2. Observe dropdown button (should say "Reference")
3. Click "Show Reference"
4. Verify dropdown button says "Reference (Active)"
5. Verify all UI elements show Reference styling (red theme)
6. Click "Show Target"
7. Verify dropdown button reverts to "Reference"
8. Verify all UI elements show Target styling (blue theme)

**Success Criteria**: Clear visual indication of current mode at all times

---

### Test 5: Keyboard Shortcut (If Implemented)

**Steps:**
1. Start in Target mode
2. Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)
3. Verify mode switches to Reference
4. Press Ctrl+Shift+R again
5. Verify mode switches back to Target

**Success Criteria**: Keyboard shortcut works identically to clicking dropdown buttons

---

## Implementation Checklist

### Pre-Implementation
- [ ] Review 4012-REFERENCE.md for architectural constraints
- [ ] Review Master-Reference-Roadmap.md for historical context
- [ ] Review DUAL-STATE-CHEATSHEET.md for Pattern A requirements
- [ ] Confirm all Pattern A sections are listed in `getAllDualStateSections()`

### Phase 1: Fix Display Value Updates
- [ ] Modify `switchAllSectionsMode()` to try `updateCalculatedDisplayValues()` first
- [ ] Add fallback to `refreshUI()` if `updateCalculatedDisplayValues()` doesn't exist
- [ ] Add console warning for sections with neither method
- [ ] Test with all sections

### Phase 2: Sync Toggle Icons
- [ ] Inspect actual section HTML to find toggle button selectors
- [ ] Implement `syncSectionToggleIcons()` helper function
- [ ] Add calls to update toggle icons after mode switch
- [ ] Test visual sync across all sections

### Phase 3: Master Toggle UI
- [ ] Implement `updateMasterToggleUI()` helper function
- [ ] Update dropdown button text to show "(Active)" state
- [ ] Update individual menu item styling (if desired)
- [ ] Test visual feedback

### Phase 4: Keyboard Shortcut (Optional)
- [ ] Add keyboard event listener in `initialize()`
- [ ] Test keyboard shortcut functionality
- [ ] Document shortcut in UI or help text

### Testing
- [ ] Execute Test 1: Basic Display Toggle
- [ ] Execute Test 2: Section Toggle Sync
- [ ] Execute Test 3: Error Handling
- [ ] Execute Test 4: Visual Feedback
- [ ] Execute Test 5: Keyboard Shortcut (if implemented)

### Documentation
- [ ] Update comments in ReferenceToggle.js
- [ ] Note completion status in 4012-REFERENCE.md
- [ ] Note completion status in Master-Reference-Roadmap.md
- [ ] Add keyboard shortcut to user documentation (if implemented)

---

## Success Criteria

### Functional Requirements

1. **Global Mode Switching**: "Show Reference" and "Show Target" commands switch ALL sections simultaneously
2. **Visual Synchronization**: Section toggle icons update to match global mode
3. **CSS Coordination**: Red/blue themes apply/remove consistently
4. **Error Resilience**: Missing methods handled gracefully with fallbacks
5. **State Isolation**: Reference operations NEVER affect Target values (already guaranteed by architecture)

### User Experience Requirements

1. **Clear Feedback**: User always knows which mode is active
2. **Consistent Behavior**: All sections behave identically when toggled
3. **No Manual Steps**: User doesn't need to click individual section toggles
4. **Keyboard Access**: Quick toggle available via keyboard (optional)

### Technical Requirements

1. **No Architecture Changes**: Uses existing ModeManager pattern
2. **No Calculation Changes**: Display-only system, no formula modifications
3. **Performance**: Mode switch completes in <100ms
4. **Maintainability**: Clear code comments, follows existing patterns

---

## Risks and Mitigations

### Risk 1: Section Toggle Selectors Not Consistent

**Risk Level**: Medium

**Mitigation**:
- Inspect actual HTML for each section before implementing Phase 2
- Use multiple fallback selectors
- Log warnings for sections where toggles can't be found
- Consider this phase optional if selectors too inconsistent

### Risk 2: `updateCalculatedDisplayValues()` Not Implemented Everywhere

**Risk Level**: Low

**Mitigation**:
- Already planned in Phase 1
- Fallback to `refreshUI()` method
- Console warnings help identify problem sections
- Can be fixed section-by-section after initial implementation

### Risk 3: Keyboard Shortcut Conflicts

**Risk Level**: Low

**Mitigation**:
- Use uncommon combination (Ctrl+Shift+R)
- Check for conflicts with browser shortcuts
- Make this phase completely optional
- Easy to remove if causes issues

### Risk 4: CSS Styling Interactions

**Risk Level**: Very Low

**Mitigation**:
- Use existing CSS classes only (no new CSS)
- Body-level classes already proven to work
- No specificity issues expected

---

## Timeline Estimate

### Estimated Hours
- **Phase 1**: 1-2 hours (fallback logic + testing)
- **Phase 2**: 2-3 hours (HTML inspection + implementation + testing)
- **Phase 3**: 1 hour (UI updates + testing)
- **Phase 4**: 0.5 hours (keyboard shortcut - optional)
- **Testing**: 1-2 hours (comprehensive testing across all sections)
- **Documentation**: 0.5 hours (update docs)

**Total**: 6-9 hours (excluding optional Phase 4)

### Implementation Order
1. **Day 1**: Phases 1 + 3 (core functionality + visual feedback) - 3 hours
2. **Day 2**: Phase 2 (toggle sync) + Testing - 4-5 hours
3. **Day 3**: Phase 4 (optional) + Final testing + Documentation - 1 hour

**Recommended**: Implement Phases 1 and 3 first for immediate user benefit, defer Phase 2 if toggle selectors prove difficult.

---

## Notes

- **Constraint**: This workplan ONLY addresses UI/mode switching for "Show Reference" and "Show Target" commands
- **Out of Scope**: "Mirror Target", "Mirror Target + Reference", and "Reference Independence" are separate features with their own implementation plans (see 4012-REFERENCE.md lines 421-713)
- **Foundation**: All required infrastructure already exists - we're just wiring it together
- **Philosophy**: KWW (Keep What Works) - use existing patterns, don't reinvent

---

## Known Issues

### S16 Emission Node Labels Show 0.00 on First Render

**Status**: 🔍 INVESTIGATING (Not blocking, workaround exists)

**Symptom**: When emissions are toggled on in S16 Sankey diagram, emission node labels (E1 Scope 1, E2 Scope 2) show "(0.00 kg CO2e/yr)" on first render but display correct values after clicking "Refresh Sankey".

**What Works**:
- ✅ Link tooltips show correct emission values on first render
- ✅ Link widths are correct (visual flow shows proper scale)
- ✅ Node sizes are correct
- ✅ All non-emission node labels render correctly on first pass
- ✅ Second refresh shows correct emission values in node labels

**Root Cause**: D3 sankey layout timing issue. When `formatNodeLabel()` is called during `_preRenderInvisible()`, D3 has processed the sankey data but the emission nodes' `targetLinks` arrays are empty or not yet populated. The function attempts to calculate emission totals from `node.targetLinks.reduce()` which returns 0.

**Investigation Findings**:
- Diagnostic logging shows `node.value` IS correctly set by D3 on first render (e.g., E2 has `value: 6821618.619388841`)
- However, `node.targetLinks` array is empty (`targetLinks: 0`) when formatNodeLabel() runs
- Link tooltips work because they read `link.value` directly from the bound link data
- Node labels fail because they try to sum `node.targetLinks[].value`

**Attempted Fix**: Changed `formatNodeLabel()` to use `node.value` instead of `targetLinks.reduce()` - this broke Reference mode emissions rendering entirely (emissions disappeared). Reverted immediately.

**Proposed Solution**: Since link values are correct on first render, copy the emission value from the incoming link to the node label. For emission nodes, there's typically only one incoming link (Building → E1 Scope 1, Energy Input → E2 Scope 2), so the link value equals the node label value.

**Implementation Approach**:
```javascript
formatNodeLabel(node) {
  if (node.name && node.name.toLowerCase().includes("emissions")) {
    // OPTION 1: Wait for targetLinks to populate (current behavior - works on refresh)
    const totalEmissionsInGrams =
      node.targetLinks?.reduce((sum, link) => sum + link.value, 0) || 0;

    // OPTION 2: Use node.value directly (tried - broke Reference mode)
    // const totalEmissionsInGrams = node.value || 0;

    // OPTION 3: Find the incoming emission link and read its value
    // For emission nodes, find the link where target === this node
    // and isEmissions === true, then use that link's value

    const kgValue = totalEmissionsInGrams / 1000;
    return `${node.name} (${window.TEUI.formatNumber(kgValue, "number-2dp-comma")} kg CO2e/yr)`;
  }
  return node.name;
}
```

**Next Steps**:
1. Understand why using `node.value` broke Reference mode (need deeper investigation)
2. Try Option 3: Search for the emission link in the links array and read its value
3. Consider if this is a pre-render vs post-render timing issue that needs D3 lifecycle adjustment

**Workaround**: Users can click "Refresh Sankey" to see correct emission values. Not ideal UX but functional.

**Priority**: Low - does not block functionality, purely cosmetic on first render

---

## Code Refactoring Notes

### ToggleUISync Centralization (Commit e076b68)

**Author**: CTO (Mark Pavlidis)
**Date**: 2025-11-03
**Impact**: All sections S02-S16

**Changes**:
- Created centralized `src/core/ToggleUISync.js` utility
- All sections now call `window.TEUI.ToggleUISync.syncToggleUI()` instead of local implementations
- Eliminated ~262 lines of duplicated code across 15 sections
- Added optional debug logging controlled by `window.TEUI.config.debugReferenceMode`

**Benefits**:
- Single source of truth for toggle UI behavior
- Easier maintenance and bug fixes
- Consistent behavior across all sections
- Reduced codebase size
- Optional centralized debug logging

**Pattern**:
```javascript
// OLD (duplicated in each section)
syncToggleUI: function (mode) {
  if (!this._toggleElements) return;
  const { toggleSwitch, slider, stateIndicator } = this._toggleElements;
  // ... 20+ lines of duplicate UI update code ...
}

// NEW (delegates to centralized utility)
syncToggleUI: function (mode) {
  window.TEUI.ToggleUISync.syncToggleUI(this._toggleElements, mode, 'S16');
}
```

**No Behavior Changes**: This is purely a refactoring for code quality - all functionality remains identical.

---

## References

### Primary Documentation
- [4012-REFERENCE.md](4012-REFERENCE.md) - Complete Reference system implementation guide
- [Master-Reference-Roadmap.md](Master-Reference-Roadmap.md) - Historical context and paused work status
- [DUAL-STATE-CHEATSHEET.md](DUAL-STATE-CHEATSHEET.md) - Pattern A architecture patterns

### Code Files
- [src/core/ReferenceToggle.js](../src/core/ReferenceToggle.js) - Main toggle logic
- [src/core/ReferenceManager.js](../src/core/ReferenceManager.js) - Reference value management
- [src/styles.css](../src/styles.css) - CSS styling system (lines 1398-1605)
- [index.html](../index.html) - Dropdown UI structure (lines 165-217)

### Key Sections
- Lines 154-183 of 4012-REFERENCE.md: Current state vs desired state
- Lines 1130-1200 of Master-Reference-Roadmap.md: Work paused status and completion criteria
- Lines 30-57 of ReferenceToggle.js: Section discovery implementation
- Lines 63-97 of ReferenceToggle.js: Mode switching logic
