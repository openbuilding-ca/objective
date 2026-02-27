# Global Reference Toggle Only - Remove Section-Specific Toggles

**Date**: November 20, 2025
**Branch**: `D13-UPDATE`
**Status**: 🎯 PLANNED - Eliminate mode awareness confusion

---

## Problem Statement

The application currently has TWO mode switching mechanisms:

1. **Global Toggle** (`window.TEUI.ModeManager` in index.html) - Production feature ✅
2. **Section-Specific Toggles** (local `ModeManager` in each section) - Development/testing feature ⚠️

This creates mode awareness confusion:
- Section code reads `ModeManager.currentMode` (local instance)
- Global toggle changes `window.TEUI.ModeManager.currentMode` (global instance)
- These can be out of sync, causing state contamination bugs
- Example: S09 state contamination bug (commits a1a0fbe, b057ae9, bdd45b0)
- Local reset buttons also add confusion about state management

**Goal**: ONE source of truth for current mode - the global toggle only.

---

## Current Architecture Analysis

### Section-Specific ModeManager Pattern

Each section (S02-S16) has:

```javascript
const ModeManager = {
  currentMode: "target",  // Local state - can drift from global!

  initialize: function() { ... },

  setValue: function(fieldId, value, state) {
    // Uses local currentMode to determine namespace
    if (this.currentMode === "reference") {
      ReferenceState.setValue(fieldId, value);
      window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, state);
    } else {
      TargetState.setValue(fieldId, value);
      window.TEUI.StateManager.setValue(fieldId, value, state);
    }
  },

  refreshUI: function() { ... },
  updateCalculatedDisplayValues: function() { ... },

  // Toggle functionality (development feature)
  toggleMode: function() {
    this.currentMode = this.currentMode === "target" ? "reference" : "target";
    this.refreshUI();
  }
};
```

### Global ModeManager (Production)

Located in index.html or core file:
- `window.TEUI.ModeManager.currentMode` - Single source of truth
- Global toggle button updates this value
- Should be the ONLY mode switch in production

---

## Implementation Plan

### Phase 0: MANDATORY - Read Architecture Guidelines

**BEFORE STARTING ANY WORK**: Read `docs/CLAUDE.md` in full, especially:

> **Before making changes**: Review existing code patterns and architecture documents. **Don't reinvent** - the codebase has 8 months of careful architectural decisions.

**Key Principles - MINIMAL CHANGES ONLY**:
- ✅ **DO**: Delete the `injectHeaderControls()` function (typically ~80 lines)
- ✅ **DO**: Remove the call to `injectHeaderControls()` (typically in initialization)
- ✅ **DO**: Keep EVERYTHING else - all ModeManager properties and methods
- ❌ **DON'T**: Touch `ModeManager.currentMode` - the global toggle already syncs it via `switchMode()`
- ❌ **DON'T**: Replace any `ModeManager.currentMode` reads with `window.TEUI.ModeManager.currentMode`
- ❌ **DON'T**: Remove `currentMode` property, `switchMode()` method, or ANY helper functions
- ❌ **DON'T**: Re-engineer calculation engines, mode-aware wrappers, or ANY working code

**THE ONLY CHANGE**: Remove the local header UI controls function and its call. That's it.

**WHY THIS WORKS**: `ReferenceToggle.js` already calls `section.modeManager.switchMode(mode)` on each section's local ModeManager when the global toggle is clicked. The local `ModeManager.currentMode` IS the mode - it's synced by the global toggle, not replaced by it.

### Phase 1: Test Pattern on One Section ✅ COMPLETED

**Section02** - COMPLETED (November 20, 2025)

Successfully removed `injectHeaderControls()` and verified:
- ✅ No local toggle appears in section header
- ✅ Global toggle controls Section02 mode
- ✅ Calculations work in both Target and Reference modes
- ✅ All inputs (sliders, dropdowns) work correctly
- ✅ "Set Values" button works in both modes

**Pattern Established:**
1. Find and delete `injectHeaderControls()` function
2. Delete the call to `injectHeaderControls()`
3. Keep all ModeManager methods intact
4. Test with global toggle

### Phase 2: Apply Pattern to All Sections (S03-S16)

**Sections Completed**: S02 ✅, S03 ✅, S04 ✅, S05 ✅, S06 ✅, S07 ✅, S08 ✅, S09 ✅, S10 ✅, S11 ✅, S12 ✅, S13 ✅, S14 ✅, S15 ✅, S16 ✅

**All sections complete!** ✅

**⚠️ SPECIAL CASE - Section03:** ✅ COMPLETED (November 23, 2025)
- ✅ Weather Data button preserved with `event.stopPropagation()` fix
- ✅ Toggle controls and reset button removed
- ✅ Global toggle controls mode switching
- ✅ Calculations verified in both modes

**📋 NEXT STEP:**
1. **Section04** - Standard pattern (no special buttons to preserve)

**Per-Section Steps** (REPEAT EXACTLY WHAT WORKED IN PHASE 1):

1. **Find the header controls function**:
   - Search for `injectHeaderControls` or similar
   - Usually 70-100 lines creating toggle/reset UI

2. **Delete it**:
   - Delete entire function
   - Delete the one line that calls it
   - **DO NOT TOUCH ANYTHING ELSE**

3. **Test**:
   - Load app, verify no local controls appear
   - Test global toggle works for this section
   - Quick check: one calculation in each mode

4. **Commit**:
   - Commit after EACH successful section
   - Message: "Remove local toggle controls from SectionXX"

### Phase 2.5: Add Key Values Header Toggle (NEW FEATURE) ✅ COMPLETED

**Goal:** Add a second global toggle in the Key Values header for convenient mode switching without scrolling.

**Location:** Key Values section header (`Section01.js`)
- Between: console message display (left) and collapse controls (- and → on right)
- Similar to existing section header layout

**Status:** ✅ COMPLETED (November 23, 2025)
- Global toggle added to Key Values header
- Reset button calls `TEUI.StateManager.resetTier3_FactoryReset()` (same as main Factory Reset)
- Both toggles sync bidirectionally via `ReferenceToggle.js`
- Spacing adjusted for optimal layout (8px margin between controls and feedback area)

**Implementation Details:**

1. **Copy visual pattern from Section05**:
   - Use `injectHeaderControls()` function structure from Section05
   - Reuse toggle switch HTML/CSS pattern (slider, state indicator)
   - Include reset button (to be modified later per user request)

2. **Make it GLOBAL instead of local**:
   ```javascript
   // Section05 (local toggle):
   toggleSwitch.addEventListener("click", () => {
     ModeManager.switchMode(targetMode); // Only affects S05
   });

   // Section01 (global toggle):
   toggleSwitch.addEventListener("click", () => {
     window.TEUI.ReferenceToggle.switchMode(targetMode); // Affects ALL sections
   });
   ```

3. **Sync with main global toggle**:
   - Listen for global mode changes via `window.TEUI.ModeManager`
   - Update Key Values toggle UI when main toggle is clicked
   - Both toggles stay in sync automatically

4. **Reset button behavior** (placeholder for now):
   - Include similar to Section05 pattern
   - User will specify reset behavior later
   - Options: global reset vs Section01-only reset

**File to modify:**
- `src/sections/Section01.js` - Add `injectKeyValuesHeaderControls()` function

**Key architectural difference:**
- Section05's toggle: Local mode switch (only S05)
- Section01's toggle: Global mode switch (all sections via `ReferenceToggle.js`)

**Code pattern:**
```javascript
function injectKeyValuesHeaderControls() {
  const sectionHeader = document.querySelector("#keyValues .section-header");
  if (!sectionHeader || sectionHeader.querySelector(".local-controls-container")) {
    return; // Already setup or header not found
  }

  // Create controls container
  const controlsContainer = document.createElement("div");
  controlsContainer.className = "local-controls-container";

  // Create reset button (placeholder)
  const resetButton = document.createElement("button");
  resetButton.innerHTML = "🔄 Reset";
  // ... styling ...

  // Create toggle switch and state indicator
  const stateIndicator = document.createElement("span");
  stateIndicator.textContent = "TARGET";

  const toggleSwitch = document.createElement("div");
  const slider = document.createElement("div");
  toggleSwitch.appendChild(slider);

  // ✅ CRITICAL: Use global toggle instead of local
  toggleSwitch.addEventListener("click", event => {
    event.stopPropagation();
    const currentMode = window.TEUI.ReferenceToggle?.getCurrentMode?.() || "target";
    const targetMode = currentMode === "target" ? "reference" : "target";

    // Switch ALL sections via global toggle
    if (window.TEUI.ReferenceToggle?.switchMode) {
      window.TEUI.ReferenceToggle.switchMode(targetMode);
    }
  });

  // ✅ CRITICAL: Listen for global mode changes to sync UI
  if (window.TEUI.ModeManager) {
    window.TEUI.ModeManager.addListener("mode", (newMode) => {
      // Update toggle UI to match global state
      updateToggleUI(toggleSwitch, slider, stateIndicator, newMode);
    });
  }

  // Append controls to header
  controlsContainer.appendChild(resetButton);
  controlsContainer.appendChild(stateIndicator);
  controlsContainer.appendChild(toggleSwitch);
  sectionHeader.appendChild(controlsContainer);
}

function updateToggleUI(toggleSwitch, slider, stateIndicator, mode) {
  if (mode === "reference") {
    slider.style.transform = "translateX(20px)";
    toggleSwitch.style.backgroundColor = "#dc3545"; // Red
    stateIndicator.textContent = "REFERENCE";
    stateIndicator.style.backgroundColor = "rgba(220, 53, 69, 0.5)";
  } else {
    slider.style.transform = "translateX(0)";
    toggleSwitch.style.backgroundColor = "#ccc"; // Gray
    stateIndicator.textContent = "TARGET";
    stateIndicator.style.backgroundColor = "rgba(0, 123, 255, 0.5)";
  }
}
```

**Testing:**
- Click Key Values toggle → verify all sections switch modes
- Click main global toggle → verify Key Values toggle updates
- Verify both toggles stay in sync
- Test in both Target and Reference modes
- Verify calculations in S01 reflect correct mode

### Phase 3: Button Row Cleanup (S18 Debug Section)

**Goal:** Clean up index.html button row by moving debug-related buttons to Section18 (Notes/Debug section)

**Tasks:**

1. **Move "Zen Mode" button to Section18 header**:
   - Current location: index.html button row
   - New location: Section18 header (alongside existing debug toggle)
   - Pattern: Similar to Section03's Weather Data button
   - Add `event.stopPropagation()` to prevent header collapse

2. **Remove "DEBUG QC" button from index.html button row**:
   - Current location: index.html button row
   - Reason: Section18 already has a debug toggle that should serve the same purpose
   - Action: Delete button, verify Section18 debug toggle works as expected
   - **TODO**: Confirm DEBUG QC and Section18 debug toggle have same functionality before deleting

3. **Verify Section18 debug toggle functionality**:
   - Test what the current Section18 debug toggle does
   - Compare with DEBUG QC button behavior
   - Ensure no functionality is lost

**Files to modify:**
- `index.html` - Remove buttons from button row
- `src/sections/Section18.js` - Add Zen Mode button to header

### Phase 4: Final Cleanup and Verification

1. **Check for unused utilities** (DO NOT DELETE WITHOUT USER APPROVAL):
   - `src/core/ToggleUISync.js` - may still be used by something
   - Search codebase for any remaining `injectHeaderControls` references
   - **Ask user before deleting any core files**

2. **Update documentation**:
   - CLAUDE.md - note that only global toggle exists
   - 4012-CHEATSHEET.md - clarify mode-awareness uses global ModeManager
   - Add note about removing section toggles (this workplan)

3. **Final integration test**:
   - Load app fresh
   - Switch to Reference mode via global toggle
   - Click "Set Values" with PH Classic selected
   - Verify ref_d_65, ref_d_66 update correctly
   - Switch back to Target mode
   - Verify d_65, d_66 unchanged (state isolation)
   - Test all 14 sections' basic functionality
   - Run full calculation cascade test (d_80, d_97 changes)

---

## Success Criteria

✅ **ONE source of truth**: Only `window.TEUI.ModeManager.currentMode` determines mode
✅ **No local toggles**: Section headers have no mode toggle buttons
✅ **State isolation**: Target and Reference models remain independent
✅ **Global toggle works**: All sections respond to global mode switch
✅ **Calculations correct**: No state contamination in any section
✅ **Import/Export works**: FileHandler operations respect global mode
✅ **Set Values works**: ReferenceValues.js applies correctly in both modes

---

## Rollback Plan

If issues arise:
1. **Per-section rollback**: Revert individual section files to before changes
2. **Full rollback point**: Current HEAD (commit bdd45b0) has working global toggle
3. **Test branch**: Create `global-ref-only` branch before starting work

---

## Risk Assessment

**Low Risk**:
- Global ModeManager already exists and works
- Pattern is simple: replace local reference with global reference
- Changes are incremental (one section at a time)
- Easy to test after each change

**Medium Risk**:
- Some sections might have custom toggle logic we don't understand yet
- Helper methods might have side effects beyond mode switching
- Could break if global ModeManager doesn't have expected methods

**Mitigation**:
- Test S09 first (we know it well from recent fixes)
- Keep local helper methods (setValue, refreshUI) - only change mode source
- Test thoroughly after each section update
- Commit after each successful section conversion

---

## Implementation Order (Recommended)

1. **S09** - We just fixed state contamination here, know it well ✅
2. **S02** - Simple inputs section, good test case
3. **S10** - Internal gains, has complex calculations
4. **S11** - Envelope, thermal bridge logic
5. **S12** - Mechanical systems, dropdown logic
6. **S13** - Heating/cooling loops
7. **S14** - Final energy calculations
8. **S03-S08** - Simpler sections, lower risk
9. **S15-S16** - Last sections to convert

---

## Code Pattern Reference

### What Gets Deleted:

```javascript
/**
 * Inject Target/Reference toggle controls into section header
 */
function injectHeaderControls() {
  const sectionHeader = document.querySelector("#sectionId .section-header");
  // ... 70-100 lines creating reset button, toggle switch, state indicator ...
  // DELETE ALL OF THIS
}
```

And the call to it:
```javascript
// DELETE THIS LINE:
injectHeaderControls();
```

### What Stays EXACTLY THE SAME:

```javascript
const ModeManager = {
  currentMode: "target",  // ✅ KEEP THIS - global toggle syncs it

  setValue: function(fieldId, value, state) {
    if (this.currentMode === "reference") {  // ✅ KEEP THIS - still works
      ReferenceState.setValue(fieldId, value);
      window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, state);
    } else {
      TargetState.setValue(fieldId, value);
      window.TEUI.StateManager.setValue(fieldId, value, state);
    }
  },

  switchMode: function(mode) {  // ✅ KEEP THIS - global toggle calls it
    this.currentMode = mode;
    this.refreshUI();
    // ...
  },

  refreshUI: function() { ... },  // ✅ KEEP THIS
  initialize: function() { ... },  // ✅ KEEP THIS
  getValue: function(fieldId) { ... },  // ✅ KEEP THIS
  updateCalculatedDisplayValues: function() { ... }  // ✅ KEEP THIS
};

// ✅ KEEP ALL helper functions like:
function getNumericValue() { ... }
function setFieldValue() { ... }
function getModeAwareGlobalValue() { ... }
// etc.
```

---

## Architecture - How This Works

**Q: Why don't we need to replace `ModeManager.currentMode` with `window.TEUI.ModeManager.currentMode`?**

**A**: Because `ReferenceToggle.js` (the global toggle) already syncs the local section ModeManagers:

```javascript
// From ReferenceToggle.js line 71-82:
function switchAllSectionsMode(mode) {
  const sections = getAllDualStateSections();
  sections.forEach(section => {
    if (section.modeManager && typeof section.modeManager.switchMode === "function") {
      section.modeManager.switchMode(mode);  // ← Updates local ModeManager.currentMode
      // ...
    }
  });
}
```

When you click the global toggle, it calls `switchMode(mode)` on EACH section's local `ModeManager`, which updates their local `currentMode` property and refreshes their UI. The local `ModeManager.currentMode` IS the source of truth - it's just controlled by the global toggle instead of local toggle buttons.

**Q: What sections have local toggles?**

**A**: S02-S16 have the `injectHeaderControls()` pattern. S01 (summary) does not need changes.

---

**Estimated Time**: 15 sections × 5 minutes each = ~75 minutes

**Branch**: Already on `G-REF-ONLY` branch

---

## Console Logging Analysis - Initialization Spam

**Date**: November 23, 2025
**Analysis**: Reviewed console output during app initialization to identify noisy sections

### Log Frequency by Section (Worst to Least)

Based on analysis of initialization logs, the following sections generate excessive console output:

1. **Section13 (Mechanical Loads)** - 833 log lines
   - **Primary culprit**: Cooling.js integration with 515 log lines
   - **Issue**: Trace logs with full stack traces (62 occurrences of `🔍 TRACE`)
   - **Issue**: Published value logs (93 occurrences of `🔗 Published`)
   - **Issue**: Recursion warnings (9 occurrences of "Already calculating")
   - **Recommendation**: Remove trace stack traces from production, convert published value logs to debug-only

2. **Section04 (Energy & Carbon)** - 427 log lines
   - **Primary culprit**: PER (Primary Energy Ratio) calculation spam
   - **Issue**: 368 instances of `[S04 PER] 🔍 CALCULATING PER` during initialization
   - **Root cause**: PER calculation triggered repeatedly for both target and reference modes on every state change
   - **Recommendation**: Add guard to prevent logging during initialization phase, or reduce to single summary log

3. **Section12 (Volume Surface Metrics)** - 390 log lines
   - **Issue**: Calculation cascade logs during initialization
   - **Pattern**: Repeated `setCalculatedValue` and `calculateVolumeMetrics` calls
   - **Recommendation**: Suppress verbose calculation logs during initialization

4. **Section15 (TEUI Summary)** - 346 log lines
   - **Issue**: Stack traces from calculation calls
   - **Issue**: "Missing critical upstream Reference values" warnings during initialization (expected)
   - **Recommendation**: Suppress initialization-phase dependency warnings

5. **Section14 (TEDI Summary)** - 190 log lines
   - **Issue**: Similar to S15, calculation cascade during initialization

6. **Section11 (Transmission Losses)** - 151 log lines
   - **Issue**: 80+ climate read logs and area sync messages
   - **Pattern**: `[S11] 🔵 REF CLIMATE READ` and `[S11 Area Sync]` messages
   - **Recommendation**: Reduce verbosity of climate reads and area sync during initialization

7. **Section10 (Radiant Gains)** - 55 log lines
   - **Issue**: 42 instances of `[S10 DEBUG] calculateAll() triggered`
   - **Recommendation**: Convert DEBUG logs to conditional debug mode only

### Recommendations Summary

**High Priority (>300 lines):**
- **S13/Cooling.js**: Remove stack trace logs, make published values debug-only
- **S04**: Gate PER calculation logs during initialization
- **S12**: Suppress calculation verbosity during init

**Medium Priority (150-350 lines):**
- **S15**: Suppress initialization-phase dependency warnings
- **S14**: Reduce calculation cascade logging
- **S11**: Make climate reads and area sync less verbose

**Low Priority (<100 lines):**
- **S10**: Convert DEBUG logs to conditional
- **S03-S09**: Already relatively quiet (under 100 lines each)

**Total Reduction Potential**: ~2000+ console log lines during initialization could be eliminated or gated behind debug flags.
