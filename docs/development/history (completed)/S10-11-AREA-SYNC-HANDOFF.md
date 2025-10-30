# S10-11 Area Sync Implementation - Agent Handoff Document

**Branch:** `S10-11-AREA-SYNC`
**Priority:** Medium - Quality of Life Improvement
**Risk:** Medium - Previously broke app, needs careful implementation

---

## Problem Statement

**Current Behavior:**

- Users enter window/door areas in S10 (Building Enclosure) at fields `d_73-d_78`
- Users must ALSO enter the same areas in S11 (Transmission Losses) at fields `d_88-d_93`
- This creates duplicate data entry and potential inconsistencies
- Previous sync implementation was surgically removed (Sept 2025, commits db3a48a, dd9b7bf)

**Desired Behavior:**

- S10 is the "source of truth" for window/door areas (fields `d_73` through `d_78`)
- S11 should automatically "mirror" or "read" these values (fields `d_88` through `d_93`)
- This sync must work in BOTH Target mode AND Reference mode
- **Excel Import:** When importing, S10 areas import → publish to StateManager → S11 reads → calculations run sequentially per row
- **User Edits:** Any S10 area edit immediately triggers S11 counterpart update
- **Reference Standard (d_13):** Area values are NOT affected by reference overlay - only U-values and other characteristics change per ReferenceValues.js

---

## Field Mapping

S11 should read from S10 as follows:

| S11 Field (display) | S10 Field (source) | Description       |
| ------------------- | ------------------ | ----------------- |
| `d_88`              | `d_73`             | Window Area North |
| `d_89`              | `d_74`             | Window Area East  |
| `d_90`              | `d_75`             | Window Area South |
| `d_91`              | `d_76`             | Window Area West  |
| `d_92`              | `d_77`             | Door Area         |
| `d_93`              | `d_78`             | Skylight Area     |

---

## Technical Context

### Dual-State Architecture

Both S10 and S11 use Pattern A architecture with:

- **TargetState**: User's design values
- **ReferenceState**: Code compliance baseline values
- **ModeManager**: Switches between modes

### State Prefixes

- Target mode: Read from `d_73`, `d_74`, etc.
- Reference mode: Read from `ref_d_73`, `ref_d_74`, etc.

---

## Previous Implementations

### September 2025: Surgical Removal (commits db3a48a, dd9b7bf)

**What Existed:**

- `areaSourceMap` object mapping S11 → S10 fields (e.g., `88: "d_73"`)
- Mode-aware listeners for both Target (`d_73-d_78`) and Reference (`ref_d_73-ref_d_78`)
- Calculation engine integration reading S10 values during S11 calcs
- Display sync updating S11 input fields when S10 changed

**Why It Was Removed:**

- Code comments indicate "S11 now self-contained like row 85"
- 110 lines of sync code surgically removed
- S11 area fields changed from "calculated" to "editable"
- **CRITICAL:** Implementation crashed app after dual-engine refactor
- Subsequent re-implementation attempt also crashed app

### Earlier Attempt (Pre-September)

**What Broke:**

- Syntax errors and recursion issues
- Likely caused listener loops between S10 and S11
- App became unstable

**Why It Failed:**

- Insufficient dual-state awareness in listeners
- May have triggered infinite recalculation loops
- Improper handling of import sequence

---

## Key Technical Considerations (Based on User Clarification)

### 1. S10 Reference Defaults Are Incomplete

**Issue:** Fields `d_76`, `d_77`, `d_78` have NO explicit Reference overrides in S10

- Currently inherit from FieldDefinition (same as Target: 159.00, 100.66, 0.00)
- S11 has "+1" differentiation values (160.00, 101.66, 1.00) that won't match
- **Action Required:** Add explicit Reference defaults to S10 OR accept inheritance behavior

### 2. S11 Reference Defaults Must Be Cleared

**Issue:** S11 currently has independent Reference defaults ("+1" values for differentiation)

- These will conflict with syncing from S10
- **Action Required:** Remove S11 Reference overrides for `d_88-d_93`, let them sync from S10

### 3. Reference Standard (d_13) Overlay Behavior

**Important:** When `d_13` changes and ReferenceValues.js overlays reference values:

- Area fields (`d_73-d_78` in S10, `d_88-d_93` in S11) are NOT affected
- Only U-values and other characteristics overlay from reference standards
- Area sync should continue working normally during/after reference overlay

### 4. Excel Import Sequence Requirements

**Critical Flow:**

1. S10 areas import from Excel → publish to StateManager
2. S11 reads S10 values (NOT Excel S11 values) → syncs to S11 state
3. Calculations run sequentially per row in S10, then S11
4. Reference values must also follow this pattern (import S10 ref → sync to S11 ref)

### 5. Historical Implementation Pattern

**Pattern Used (Sept 2025, before crashes):**

- Used `areaSourceMap` for field mapping
- Mode-aware listeners for Target and Reference states
- Calculation engine read via `getGlobalNumericValue(sourceFieldId)`
- Display sync updated input elements in real-time
- **WARNING:** This pattern crashed app after dual-engine refactor
- **WARNING:** Re-implementation attempt also crashed app
- Root cause unknown - likely listener timing, recursion, or state initialization order

---

## Crash Risk Mitigation Strategy

### Root Causes of Previous Crashes (Hypothesis)

1. **Listener Registration Timing:** Listeners may have fired before S11 state initialized
2. **Infinite Recursion:** S11 setValue() may have triggered S10 listeners inadvertently
3. **Mode Switch Race Conditions:** Sync during mode transition may have caused state corruption
4. **Import Sequence Violation:** Sync may have fired during Excel import before all values loaded
5. **Calculation Loop Triggers:** Area sync may have triggered full recalc, which triggered sync, etc.

### Required Safeguards (MANDATORY)

#### 1. Initialization Guard

```javascript
let isS11Initialized = false;

// At end of S11 initialization
isS11Initialized = true;

// In syncAreasFromS10()
if (!isS11Initialized) {
  console.warn("[S11 Area Sync] Blocked - S11 not initialized yet");
  return;
}
```

#### 2. Sync-in-Progress Flag (Prevent Recursion)

```javascript
let isSyncingFromS10 = false;

function syncAreasFromS10() {
  if (isSyncingFromS10) {
    console.warn("[S11 Area Sync] Blocked - sync already in progress");
    return;
  }

  isSyncingFromS10 = true;
  try {
    // ... sync logic ...
  } finally {
    isSyncingFromS10 = false;
  }
}
```

#### 3. Listener Mode Guard (Prevent Cross-Contamination)

```javascript
// In listener setup - ONLY fire if mode matches
window.TEUI.StateManager.addListener("d_73", (newValue) => {
  if (ModeManager.getCurrentMode() !== "target") return; // GUARD
  if (!isS11Initialized) return; // GUARD
  syncAreasFromS10();
});
```

#### 4. Silent setValue (Prevent Recalc Triggers)

```javascript
// Use "silent" flag if available to prevent calculation cascade
TargetState.setValue(s11Field, areaValue, "calculated", { silent: true });
```

#### 5. Debouncing (Prevent Rapid-Fire Syncs)

```javascript
let syncTimeout = null;

function debouncedSyncAreasFromS10() {
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    syncAreasFromS10();
  }, 50); // Wait 50ms after last change
}
```

### Testing Protocol (Before Deploying)

1. **Test in isolation:** Comment out all listener registrations, manually call sync function
2. **Test one listener:** Add only Target mode listener for d_73, verify no crashes
3. **Test all Target listeners:** Add all 6 Target listeners, verify no crashes
4. **Test Reference listeners:** Add Reference listeners after Target proven stable
5. **Test mode switching:** Rapidly switch modes 20+ times, monitor console
6. **Test import:** Import Excel file, watch for crashes during/after import
7. **Test reference overlay:** Apply d_13 changes, verify areas unaffected

---

## Recommended Implementation Path

### 0. PREREQUISITE: Add All Safeguards Listed Above

**Before writing any sync code, implement:**

- Initialization guard
- Sync-in-progress flag
- Listener mode guards
- Debouncing mechanism

### 1. Fix S10 Reference Defaults (NEW STEP)

**File:** `sections/4012-Section10.js`

Add explicit Reference overrides for the three missing fields:

```javascript
// In ReferenceState.setDefaults() method
const referenceDefaults = {
  // ... existing overrides ...
  d_73: "5.00", // Already exists
  d_74: "60.00", // Already exists
  d_75: "2.50", // Already exists
  d_76: "159.00", // ADD THIS (or use different value if desired)
  d_77: "100.66", // ADD THIS (or use different value if desired)
  d_78: "0.00", // ADD THIS (or use different value if desired)
};
```

**Alternative:** Accept that d_76-d_78 inherit Target values (simplest approach)

### 2. Clear S11 Reference Defaults (NEW STEP)

**File:** `sections/4012-Section11.js`

Remove the "+1" differentiation values for Reference mode:

```javascript
// BEFORE (lines 202-212):
d_88: {
  fieldId: "d_88",
  type: "editable",
  value: "7.50",
  referenceOverride: "8.50"  // REMOVE THIS
},

// AFTER:
d_88: {
  fieldId: "d_88",
  type: "calculated",  // Also change type
  value: "0",          // Also change default to 0
  // NO referenceOverride - will sync from S10
},
```

**Repeat for all 6 area fields** (`d_88` through `d_93`)

### 4. Create Area Source Map (Restore Historical Pattern)

**Location:** Inside S11 module

```javascript
const areaSourceMap = {
  d_88: "d_73", // North windows
  d_89: "d_74", // East windows
  d_90: "d_75", // South windows
  d_91: "d_76", // West windows
  d_92: "d_77", // Doors
  d_93: "d_78", // Skylights
};
```

### 5. Implement Sync Function (Mode-Aware)

**Location:** Inside S11 module

```javascript
/**
 * Sync window/door areas from S10 into S11
 * Respects current calculation mode (Target vs Reference)
 */
function syncAreasFromS10() {
  const currentMode = ModeManager.getCurrentMode(); // "target" or "reference"

  Object.entries(areaSourceMap).forEach(([s11Field, s10Field]) => {
    // Determine source field based on mode
    const sourceFieldId =
      currentMode === "reference" ? `ref_${s10Field}` : s10Field;

    // Read from S10 via global StateManager
    const areaValue = window.TEUI.StateManager.getValue(sourceFieldId);

    if (areaValue !== null && areaValue !== undefined) {
      // Write to appropriate S11 state
      if (currentMode === "target") {
        TargetState.setValue(s11Field, areaValue, "calculated");
      } else {
        ReferenceState.setValue(s11Field, areaValue, "calculated");
      }

      console.log(
        `[S11 Area Sync] ${s11Field} = ${areaValue} (from ${sourceFieldId})`,
      );
    }
  });

  // Refresh S11 UI to show synced values
  refreshUI();
}
```

### 6. Setup S10 Area Listeners

**Location:** Inside S11's `initializeEventHandlers()` function

```javascript
/**
 * Listen for S10 area changes in both Target and Reference modes
 */
function setupS10AreaListeners() {
  const s10AreaFields = ["d_73", "d_74", "d_75", "d_76", "d_77", "d_78"];

  // Listen for Target mode changes
  s10AreaFields.forEach((fieldId) => {
    window.TEUI.StateManager.addListener(fieldId, (newValue) => {
      const currentMode = ModeManager.getCurrentMode();
      if (currentMode === "target") {
        syncAreasFromS10();
      }
    });
  });

  // Listen for Reference mode changes
  s10AreaFields.forEach((fieldId) => {
    window.TEUI.StateManager.addListener(`ref_${fieldId}`, (newValue) => {
      const currentMode = ModeManager.getCurrentMode();
      if (currentMode === "reference") {
        syncAreasFromS10();
      }
    });
  });

  console.log("[S11] S10 area listeners registered for both modes");
}
```

### 7. Hook into Import Sequence

**Location:** S11's `syncFromGlobalState()` method (should already exist)

Add call to `syncAreasFromS10()` after field sync:

```javascript
syncFromGlobalState: function(fieldIds) {
  // ... existing sync code ...

  // After syncing regular fields, sync areas from S10
  syncAreasFromS10();
}
```

### 8. Hook into Mode Switch

**Location:** S11's ModeManager switch handler

Ensure `syncAreasFromS10()` is called when switching between Target/Reference:

```javascript
ModeManager.onModeChange(() => {
  // ... existing mode switch code ...

  // Sync areas after mode switch
  syncAreasFromS10();
});
```

---

## Testing Checklist

### Test 1: User Input Flow (Target Mode)

- [ ] Change window area in S10 Target mode
- [ ] Verify S11 Target mode updates automatically
- [ ] Verify S11 calculations use updated area

### Test 2: User Input Flow (Reference Mode)

- [ ] Switch to Reference mode
- [ ] Change window area in S10 Reference mode
- [ ] Verify S11 Reference mode updates automatically
- [ ] Verify Reference calculations use updated area

### Test 3: Excel Import Flow

- [ ] Import Excel file with known window/door areas
- [ ] Verify S10 shows imported values
- [ ] Verify S11 mirrors S10 values (not Excel S11 values)
- [ ] Verify both Target and Reference modes sync correctly

### Test 4: Reference Standard Application

- [ ] Apply Reference Standard dropdown (`d_13`)
- [ ] Verify Reference mode updates
- [ ] Verify S11 Reference areas sync from S10 Reference areas
- [ ] Verify no cross-contamination with Target mode

### Test 5: No Infinite Loops

- [ ] Monitor console for excessive calculation triggers
- [ ] Verify app remains responsive
- [ ] Check that calculations settle within ~100ms

### Test 6: Edge Cases

- [ ] Test with zero area values
- [ ] Test with very large area values
- [ ] Test rapid mode switching
- [ ] Test rapid S10 value changes

---

## Files to Modify

1. **`sections/4012-Section10.js`** (OPTIONAL)

   - Add explicit Reference overrides for `d_76`, `d_77`, `d_78` if differentiation needed
   - OR accept that these inherit Target defaults (simplest)

2. **`sections/4012-Section11.js`** (PRIMARY WORK)
   - Remove Reference overrides for `d_88`-`d_93` (clear "+1" differentiation values)
   - Change field types for `d_88`-`d_93` from "editable" to "calculated"
   - Change Target defaults for `d_88`-`d_93` from matching S10 to "0"
   - Add module-level guard flags (`isS11Initialized`, `isSyncingFromS10`, `syncTimeout`)
   - Add `areaSourceMap` constant
   - Add `syncAreasFromS10()` function with ALL safeguards
   - Add `debouncedSyncAreasFromS10()` wrapper
   - Add `setupS10AreaListeners()` function with mode guards
   - Call `setupS10AreaListeners()` from `initializeEventHandlers()`
   - Add `syncAreasFromS10()` call to mode switch handler (after mode change completes)
   - Add `syncAreasFromS10()` call to `syncFromGlobalState()` (at end, after all imports)
   - Set `isS11Initialized = true` at end of initialization

---

## Red Flags / Anti-Patterns to Avoid

### CRITICAL - App Crash Risks

❌ **DON'T:** Register listeners before S11 initialization completes
❌ **DON'T:** Call sync functions without recursion guards
❌ **DON'T:** Allow sync to fire during mode transitions
❌ **DON'T:** Allow sync to fire during Excel import (before complete)
❌ **DON'T:** Trigger calculations from within sync functions

### CRITICAL - State Management

❌ **DON'T:** Create listeners that trigger S10 calculations from S11
❌ **DON'T:** Use `setValue()` without specifying state ("calculated" vs "user-modified")
❌ **DON'T:** Mix Target and Reference field IDs in same listener
❌ **DON'T:** Call `syncAreasFromS10()` from within `calculateAll()` (infinite loop risk)
❌ **DON'T:** Assume S10 values exist before S10 initialization

### CRITICAL - Testing

❌ **DON'T:** Deploy without incremental testing (one listener at a time)
❌ **DON'T:** Skip console monitoring during testing
❌ **DON'T:** Test in production environment first

### Best Practices

✅ **DO:** Only READ from S10, never WRITE back
✅ **DO:** Respect current mode when determining source field
✅ **DO:** Use ALL safeguards (guards, flags, debouncing)
✅ **DO:** Log sync operations liberally for debugging
✅ **DO:** Call sync after major state changes (import complete, mode switch complete)
✅ **DO:** Test incrementally - comment out listeners until each proven stable
✅ **DO:** Monitor console for warnings/errors during all tests
✅ **DO:** Have rollback plan ready (revert commit)

---

## Rollback Plan

If implementation causes issues:

1. Revert field types back to "editable"
2. Remove listener setup from `initializeEventHandlers()`
3. Remove sync calls from mode switch and import
4. Users continue manual entry (current behavior)

---

## Documentation References

- **MAPPER.md line 977-1011:** Original problem documentation
- **AGENT.md:** Dual-state architecture overview
- **4012-Section02.js, 4012-Section03.js:** Pattern A examples with sync methods

---

## Success Criteria

✅ S11 window/door areas automatically mirror S10 values
✅ Works in both Target and Reference modes
✅ Works after Excel import
✅ Works after Reference Standard application
✅ No infinite calculation loops
✅ No performance degradation
✅ No cross-contamination between modes

---

## Notes for Agent

### SEVERITY WARNING

- This feature has **crashed the app twice** during previous implementation attempts
- Root cause of crashes is unknown (likely timing, recursion, or state initialization)
- This is NOT a simple feature - treat as **HIGH RISK** despite being labeled "quality of life"
- **DO NOT** proceed without implementing ALL safeguards listed in "Crash Risk Mitigation"
- **DO NOT** skip incremental testing - test one listener at a time
- **DO NOT** assume historical pattern will work - it crashed after dual-engine refactor

### Implementation Strategy

- **Incremental approach mandatory:** Comment out listeners, test sync function in isolation first
- **One listener at a time:** Add Target d_73 listener only, test thoroughly before adding others
- **Console monitoring:** Watch for errors, warnings, recursion indicators
- **Rollback ready:** Be prepared to revert immediately if any instability appears
- Take time to understand dual-state architecture before coding
- Use console logging liberally - every sync operation should log
- Reference S02/S03 for Pattern A dual-state examples

### User Clarifications (from conversation)

1. **Excel Import:** S10 areas import first → publish to StateManager → S11 reads (NOT from Excel S11 values)
2. **User Edits:** Any S10 area edit immediately triggers S11 update
3. **Reference Standard (d_13):** Area values NOT affected by overlay - only U-values/characteristics change
4. **Calculations:** Must run sequentially per row after import (S10 first, then S11)
5. **Reference Model:** Both Target and Reference areas must sync (d_73-d_78 and ref_d_73-ref_d_78)

### Decision Points for Agent

1. **S10 Reference Defaults:** Add explicit overrides for d_76-d_78, or accept inheritance? (Recommend: accept inheritance for simplicity)
2. **Debounce Timing:** 50ms recommended, but adjust if needed based on testing
3. **Silent setValue:** If TargetState.setValue() doesn't support `silent` flag, may need alternative approach
4. **Listener Registration:** Should listeners be removed on cleanup? (Pattern A sections don't currently do this)

Proceed with extreme caution. If you encounter ANY instability, stop immediately and document findings. 🚨
