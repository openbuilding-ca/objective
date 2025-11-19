# SETTING-VALUES.md

**How FileHandler Correctly Handles Import: The Gold Standard**

This document analyzes FileHandler's import process to understand the correct pattern for setting values, managing listeners, and triggering calculations. This pattern produces correct results every time and should be replicated for the "Set Values" button.

---

## ✅ IMPLEMENTATION STATUS (Nov 19, 2025)

**Phase 4 Complete**: FileHandler delegation implemented and working correctly.

### Key Implementation Detail: Mode-Aware Application

The "Set Values" button is **mode-aware** and only applies values to the currently active model:

- **Target Mode**: Clicking "Set Values" only applies to Target model (TargetState) - Reference model untouched
- **Reference Mode**: Clicking "Set Values" only applies to Reference model (ReferenceState) - Target model untouched

This prevents state contamination and preserves default values in Target mode after initialization. The targetMode parameter passed to `FileHandler.applyReferenceValuesFromStandard()` determines which isolated state receives the values.

---

## The Problem

When "Set Values" button applies ReferenceValues overlays:
1. DOM in S09 does not update with the new value
2. Calculations may not fire correctly
3. Values "drift" on repeated button presses and mode switches
4. h_10 (S01 grand total) shows inconsistent results

**However, FileHandler's import process works perfectly every time:**
- DOM refreshes correctly with imported values
- All calculations cascade and "land" at correct S01 Key Values totals
- No value drift or inconsistency

---

## FileHandler Import Process: Step-by-Step

### Phase 1: IMPORT QUARANTINE - Mute Listeners

**Location:** [FileHandler.js:154-158](../src/core/FileHandler.js#L154-L158)

```javascript
// 🔒 START IMPORT QUARANTINE - Mute listeners to prevent premature calculations
console.log("[FileHandler] 🔒 IMPORT QUARANTINE START - Muting listeners");
window.TEUI.StateManager.muteListeners();
```

**Purpose:**
- Prevents cascading calculations while values are being set
- Avoids partial calculations with incomplete/stale data
- Ensures all values are in place before any recalculation happens

**StateManager Implementation:** [StateManager.js:2246-2249](../src/core/StateManager.js#L2246-L2249)

```javascript
function muteListeners() {
  listenersActive = false;
  console.log("[StateManager] 🔒 Listeners MUTED (import quarantine active)");
}
```

---

### Phase 2: Set Values in StateManager

**Location:** [FileHandler.js:160-183](../src/core/FileHandler.js#L160-L183)

```javascript
try {
  // Import Target values (REPORT sheet)
  this.updateStateFromImportData(importedData, 0, false);
  console.log(`[FileHandler] Imported ${Object.keys(importedData).length} Target values`);

  // Import REFERENCE data from REFERENCE sheet (optional)
  this.processImportedExcelReference(workbook);

  // ✅ CRITICAL: Sync Pattern A sections AFTER both Target and Reference imports
  console.log("[FileHandler] 🔧 Syncing all Pattern A sections after BOTH imports complete...");
  this.syncPatternASections();
  console.log("[FileHandler] ✅ Pattern A sections synced with imported values");
} finally {
  // ...
}
```

**Key Details:**

#### 2a. Set Values in Global StateManager

**Location:** [FileHandler.js:518-578](../src/core/FileHandler.js#L518-L578)

```javascript
Object.entries(importedData).forEach(([fieldId, value]) => {
  // Reference fields: Store directly in StateManager without validation
  if (isReferenceField) {
    this.stateManager.setValue(fieldId, parsedValue, "imported");
    updatedCount++;
    return;
  }

  // Target fields: Validate and set
  if (isValid) {
    this.stateManager.setValue(fieldId, parsedValue, "imported");
    updatedCount++;

    // Update DOM display via FieldManager
    if (window.TEUI?.FieldManager?.updateFieldDisplay) {
      window.TEUI.FieldManager.updateFieldDisplay(fieldId, parsedValue, fieldDef);
    }
  }
});
```

**Critical Points:**
- Uses `StateManager.setValue()` for ALL field updates
- Updates DOM via `FieldManager.updateFieldDisplay()` for each field
- Validation happens BEFORE setting value
- All within try/finally to ensure unmute happens

#### 2b. Sync Pattern A Isolated States

**Location:** [FileHandler.js:659-734](../src/core/FileHandler.js#L659-L734)

```javascript
syncPatternASections() {
  const patternASections = [
    { id: "sect02", name: "S02" },
    { id: "sect05", name: "S05" },
    { id: "sect06", name: "S06" },
    { id: "sect09", name: "S09" },
    // ... etc
  ];

  patternASections.forEach(({ id, name }) => {
    const section = window.TEUI?.SectionModules?.[id];

    // Sync TargetState from global StateManager
    if (section?.TargetState?.syncFromGlobalState) {
      console.log(`[FileHandler] Syncing ${name} TargetState...`);
      section.TargetState.syncFromGlobalState();
    }

    // Sync ReferenceState from global StateManager
    if (section?.ReferenceState?.syncFromGlobalState) {
      console.log(`[FileHandler] Syncing ${name} ReferenceState...`);
      section.ReferenceState.syncFromGlobalState();
    }

    // ✅ CRITICAL: Refresh DOM after syncing state from imported values
    if (section?.ModeManager?.refreshUI) {
      section.ModeManager.refreshUI();
      console.log(`[FileHandler] ${name} DOM refreshed after sync`);
    }
  });
}
```

**Critical Points:**
- Pattern A sections have **isolated state** (TargetState/ReferenceState objects)
- Global StateManager values must be **explicitly synced** to isolated states
- **DOM refresh** happens AFTER state sync but BEFORE calculations
- This ensures isolated states have latest values before calculateAll() runs

---

### Phase 3: END IMPORT QUARANTINE - Unmute Listeners

**Location:** [FileHandler.js:184-190](../src/core/FileHandler.js#L184-L190)

```javascript
} finally {
  // 🔓 END IMPORT QUARANTINE - Always unmute, even if import fails
  window.TEUI.StateManager.unmuteListeners();
  console.log("[FileHandler] 🔓 IMPORT QUARANTINE END - Unmuting listeners");
}
```

**Purpose:**
- Restores normal listener notification
- Uses `finally` block to ensure unmute happens even if errors occur
- Listeners are now ready to respond to calculation results

**StateManager Implementation:** [StateManager.js:2255-2260](../src/core/StateManager.js#L2255-L2260)

```javascript
function unmuteListeners() {
  listenersActive = true;
  console.log("[StateManager] 🔓 Listeners UNMUTED (import quarantine ended)");
}
```

---

### Phase 4: Trigger Complete Cascade of Calculations

**Location:** [FileHandler.js:192-235](../src/core/FileHandler.js#L192-L235)

```javascript
// Trigger clean recalculation with all imported values loaded
console.log("[FileHandler] Triggering post-import calculation with fresh values...");
if (this.calculator && typeof this.calculator.calculateAll === "function") {
  this.calculator.calculateAll();

  // ✅ FIX: Refresh ALL Pattern A section UIs after calculateAll
  // Pattern A sections use isolated state - DOM must be refreshed to show updated values
  console.log("[FileHandler] 🔄 Refreshing Pattern A section UIs after import...");
  const patternASections = [
    "sect02", "sect03", "sect04", "sect05", "sect06",
    "sect07", "sect08", "sect09", "sect10", "sect11",
    "sect12", "sect13", "sect14", "sect15"
  ];

  patternASections.forEach(sectionId => {
    const section = window.TEUI?.SectionModules?.[sectionId];
    if (section?.ModeManager?.refreshUI) {
      section.ModeManager.refreshUI();

      // ✅ Also update calculated display values (some sections need both calls)
      if (section.ModeManager.updateCalculatedDisplayValues) {
        section.ModeManager.updateCalculatedDisplayValues();
      }
      console.log(`[FileHandler] ✅ ${sectionId} UI refreshed`);
    }
  });
}
```

**Critical Points:**
- `calculateAll()` runs with ALL values in place (no partial data)
- Listeners are UNMUTED, so calculations can cascade normally
- Pattern A section UIs refreshed AFTER calculations complete
- Some sections need BOTH `refreshUI()` AND `updateCalculatedDisplayValues()`

---

## Why This Works Every Time

### 1. Import Quarantine Pattern
- **Mute** → **Set All Values** → **Sync Isolated States** → **Unmute** → **Calculate**
- No premature calculations with incomplete data
- All sections have consistent state before calculations begin

### 2. Explicit State Synchronization
- Pattern A sections don't automatically see StateManager changes
- `syncFromGlobalState()` explicitly bridges the gap
- Ensures isolated states match global StateManager before calculations

### 3. DOM Refresh at Correct Times
- **First refresh:** After state sync, before calculations (shows input values)
- **Second refresh:** After calculations complete (shows calculated results)
- Both steps necessary for complete UI update

### 4. Complete Calculation Cascade
- `calculateAll()` runs exactly once with complete data
- All sections calculate in correct dependency order
- S01 totals reflect complete, correct calculation results

---

## The "Set Values" Button Problem

**Current Implementation (Section02.js:1070-1130):**

```javascript
applyReferenceValuesOverlay: function(mode) {
  const standard = mode === "target"
    ? this.state.d_13
    : this.state.ref_d_13;

  const sectionsWithReferenceValues = [5, 6, 9, 11, 12, 13];

  sectionsWithReferenceValues.forEach(sectionNum => {
    const sectionId = `sect${String(sectionNum).padStart(2, "0")}`;
    const section = window.TEUI?.SectionModules?.[sectionId];

    if (mode === "target" && section?.TargetState?.applyReferenceValues) {
      section.TargetState.applyReferenceValues(standard);
    } else if (mode === "reference" && section?.ReferenceState?.onReferenceStandardChange) {
      section.ReferenceState.onReferenceStandardChange(standard);
    }
  });
},
```

**Missing Elements:**

1. ❌ **No listener muting** - calculations may fire prematurely
2. ❌ **No DOM refresh** - UI doesn't update to show new values
3. ❌ **No calculateAll()** - calculations don't cascade completely
4. ❌ **No StateManager updates** - global StateManager not updated with new values
5. ❌ **No isolated state sync** - other sections don't see changes

---

## The Correct Pattern for "Set Values" - Delegate to FileHandler

**Architectural Principle**: The "Set Values" button should delegate to FileHandler, which already has the proven Import Quarantine pattern. This eliminates code duplication and ensures consistency.

### Why Delegate to FileHandler?

✅ **Single Responsibility** - FileHandler owns all "bulk value application" operations
✅ **Code Reuse** - Import Quarantine pattern exists in one place
✅ **Maintainability** - Future fixes happen once, work everywhere
✅ **Consistency** - ReferenceValues overlay behaves exactly like file import
✅ **Proven Pattern** - Uses the same pattern that works perfectly for Excel imports

### Section02 Responsibility: UI Event Handling Only

**File**: `sections/Section02.js`

```javascript
// In Section02.js initializeEventHandlers()
const setValuesBtn = document.getElementById("setValuesBtn");
if (setValuesBtn) {
  setValuesBtn.addEventListener("click", () => {
    const currentMode = window.TEUI?.ModeManager?.currentMode || "target";

    // Get the selected standard for current mode
    const standard = currentMode === "reference"
      ? window.TEUI.StateManager.getValue("ref_d_13")
      : window.TEUI.StateManager.getValue("d_13");

    console.log(`[S02] "Set Values" button clicked - delegating to FileHandler`);
    console.log(`[S02] Mode: ${currentMode}, Standard: ${standard}`);

    // Delegate to FileHandler - it knows how to do this correctly!
    if (window.TEUI?.FileHandler?.applyReferenceValuesFromStandard) {
      window.TEUI.FileHandler.applyReferenceValuesFromStandard(standard, currentMode);
    } else {
      console.error("[S02] FileHandler.applyReferenceValuesFromStandard() not available");
    }
  });
  console.log('[S02] "Set Values" button wired successfully');
} else {
  console.error('[S02] "Set Values" button not found - check button ID');
}
```

### FileHandler Responsibility: Apply ReferenceValues Using Import Quarantine Pattern

**File**: `src/core/FileHandler.js`

Add this new method to FileHandler (around line 735+, after existing import methods):

```javascript
/**
 * Apply ReferenceValues from ReferenceValues.js using the proven Import Quarantine pattern
 * This method is the "Set Values" button's backend - it treats ReferenceValues.js as an
 * internal import source and applies values using the same pattern as Excel imports.
 *
 * @param {string} standard - The standard name (e.g., "PH Classic", "OBC SB10 5.5-6 Z6")
 * @param {string} targetMode - Either "target" or "reference"
 */
applyReferenceValuesFromStandard: function(standard, targetMode) {
  console.log(`[FileHandler] Applying ReferenceValues from "${standard}" to ${targetMode.toUpperCase()} model`);

  // Get reference values for the selected standard
  const referenceValues = window.TEUI?.ReferenceValues?.[standard];
  if (!referenceValues) {
    console.error(`[FileHandler] No ReferenceValues found for standard: "${standard}"`);
    return;
  }

  const sectionsWithReferenceValues = [5, 6, 9, 11, 12, 13]; // S14/S15 excluded - data consumers only

  // 🔒 PHASE 1: IMPORT QUARANTINE START - Mute listeners
  console.log("[FileHandler] 🔒 IMPORT QUARANTINE START - Muting listeners");
  window.TEUI.StateManager.muteListeners();

  try {
    // ✅ PHASE 2a: Apply values to isolated section states
    sectionsWithReferenceValues.forEach(sectionNum => {
      const sectionId = `sect${String(sectionNum).padStart(2, '0')}`;
      const section = window.TEUI?.SectionModules?.[sectionId];

      if (!section) {
        console.warn(`[FileHandler] Section ${sectionId} not found`);
        return;
      }

      if (targetMode === "reference") {
        // Reference mode: Apply to ReferenceState (writes to ref_ fields)
        if (section?.ReferenceState?.onReferenceStandardChange) {
          section.ReferenceState.onReferenceStandardChange(standard);
          console.log(`[FileHandler] Applied ReferenceValues to ${sectionId} ReferenceState`);
        }
      } else {
        // Target mode: Apply to TargetState (writes to unprefixed fields)
        if (section?.TargetState?.applyReferenceValues) {
          section.TargetState.applyReferenceValues(standard);
          console.log(`[FileHandler] Applied ReferenceValues to ${sectionId} TargetState`);
        }
      }
    });

    // ✅ PHASE 2b: Sync isolated states TO global StateManager
    // (Required so other sections and calculations can see the changes)
    sectionsWithReferenceValues.forEach(sectionNum => {
      const sectionId = `sect${String(sectionNum).padStart(2, '0')}`;
      const section = window.TEUI?.SectionModules?.[sectionId];

      // Publish updated isolated state values to global StateManager
      if (section?.ModeManager?.publishToStateManager) {
        section.ModeManager.publishToStateManager();
        console.log(`[FileHandler] ${sectionId} published to StateManager`);
      }
    });

    // ✅ PHASE 2c: First DOM refresh (show new input values)
    sectionsWithReferenceValues.forEach(sectionNum => {
      const sectionId = `sect${String(sectionNum).padStart(2, '0')}`;
      const section = window.TEUI?.SectionModules?.[sectionId];

      if (section?.ModeManager?.refreshUI) {
        section.ModeManager.refreshUI();
        console.log(`[FileHandler] ${sectionId} DOM refreshed (input values)`);
      }
    });

  } finally {
    // 🔓 PHASE 3: IMPORT QUARANTINE END - Always unmute, even if errors occur
    console.log("[FileHandler] 🔓 IMPORT QUARANTINE END - Unmuting listeners");
    window.TEUI.StateManager.unmuteListeners();
  }

  // ✅ PHASE 4: Trigger complete calculation cascade
  console.log("[FileHandler] Triggering calculateAll() with complete data...");
  if (this.calculator && typeof this.calculator.calculateAll === "function") {
    this.calculator.calculateAll();

    // ✅ PHASE 5: Final DOM refresh (show calculated results)
    console.log("[FileHandler] 🔄 Refreshing all section UIs after calculations...");
    const allSections = [
      "sect02", "sect03", "sect04", "sect05", "sect06",
      "sect07", "sect08", "sect09", "sect10", "sect11",
      "sect12", "sect13", "sect14", "sect15"
    ];

    allSections.forEach(sectionId => {
      const section = window.TEUI?.SectionModules?.[sectionId];
      if (section?.ModeManager?.refreshUI) {
        section.ModeManager.refreshUI();
      }
      // Some sections need both refreshUI() AND updateCalculatedDisplayValues()
      if (section?.ModeManager?.updateCalculatedDisplayValues) {
        section.ModeManager.updateCalculatedDisplayValues();
      }
    });

    console.log(`[FileHandler] ✅ ReferenceValues from "${standard}" applied to ${targetMode.toUpperCase()} model`);
  } else {
    console.error("[FileHandler] Calculator.calculateAll() not available - calculations not triggered");
  }
},
```

---

## Key Takeaways

1. **Import Quarantine is Essential**
   - Mute → Set → Sync → Unmute → Calculate
   - Prevents race conditions and partial calculations

2. **Delegate to FileHandler for All Bulk Value Operations**
   - Don't duplicate Import Quarantine pattern in Section02
   - "Set Values" button treats ReferenceValues.js as an internal import source
   - FileHandler already has proven pattern that works perfectly

3. **Pattern A Sections Need Explicit Sync**
   - Isolated states don't automatically see changes
   - Must sync TO and FROM global StateManager

4. **DOM Refresh Happens Twice**
   - Once after setting values (shows inputs)
   - Once after calculations (shows results)

5. **StateManager is Source of Truth**
   - All sections must publish changes to StateManager
   - Calculations read from StateManager, not isolated states

6. **calculateAll() Runs Once with Complete Data**
   - No premature calculations
   - No value drift
   - Consistent, correct results every time

7. **Single Responsibility Principle**
   - Section02: UI event handling only (thin layer)
   - FileHandler: Data operations and bulk value application (expert layer)

---

## Related Code Locations

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| **Excel Import (Gold Standard)** |
| Import quarantine start | FileHandler.js | 154-158 | Mute listeners before import |
| Set values from Excel | FileHandler.js | 518-578 | Update StateManager with imported values |
| Sync Pattern A sections | FileHandler.js | 659-734 | Sync isolated states from StateManager |
| Import quarantine end | FileHandler.js | 184-190 | Unmute listeners after import |
| Trigger calculations | FileHandler.js | 192-235 | Run calculateAll() and refresh UIs |
| **"Set Values" Button (New)** |
| Button click handler | Section02.js | TBD | Delegates to FileHandler.applyReferenceValuesFromStandard() |
| Apply ReferenceValues | FileHandler.js | TBD (~735+) | NEW METHOD - Uses same Import Quarantine pattern |
| ReferenceValues data source | ReferenceValues.js | 1-632 | Internal "import" source - code baseline values |
| **StateManager Utilities** |
| muteListeners() | StateManager.js | 2246-2249 | Disable listener notifications |
| unmuteListeners() | StateManager.js | 2255-2260 | Enable listener notifications |
| Restore pattern example | StateManager.js | 1914-1989 | Similar mute/unmute pattern for restore |

---

**Document Created:** 2025-11-18
**Document Updated:** 2025-11-19
**Purpose:** Guide implementation of correct "Set Values" button behavior based on proven FileHandler import pattern

**Key Decision:** "Set Values" button delegates to FileHandler instead of duplicating Import Quarantine pattern in Section02. This treats ReferenceValues.js as an internal import source, ensuring consistency with Excel import behavior.