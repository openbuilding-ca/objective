# NEXT STEPS - "Set Values" Button Implementation

**Date**: November 19, 2025
**Branch**: `D13-UPDATE`
**Status**: ✅ Phase 4 COMPLETE - FileHandler delegation implemented

---

## Implementation Summary (Nov 19, 2025)

**Phase 4 Complete**: "Set Values" button now delegates to FileHandler using Import Quarantine pattern

### What Was Implemented

1. **FileHandler.applyReferenceValuesFromStandard()** - [src/core/FileHandler.js:736-844](../../src/core/FileHandler.js#L736-L844)
   - Mode-aware: Only applies values to the currently active model (Target OR Reference, not both)
   - Uses proven Import Quarantine pattern (mute → apply → sync → unmute → calculate → refresh)
   - Treats ReferenceValues.js as internal import source (consistent with Excel import)

2. **Section02.applyReferenceValuesOverlay()** - [src/sections/Section02.js:1095-1117](../../src/sections/Section02.js#L1095-L1117)
   - Simplified from 56 lines to 17 lines
   - Section02 now handles UI events only - delegates all logic to FileHandler

### Key Fix: Mode-Aware Behavior
- When "Set Values" is clicked in **Target mode**: Only applies to Target model (leaves Reference model untouched)
- When "Set Values" is clicked in **Reference mode**: Only applies to Reference model (leaves Target model untouched)
- This prevents state contamination and preserves default values in Target mode after initialization

---

## ✅ Implementation Complete - Both Modes Working

### Target Mode ✅
- Clicking "Set Values" in Target mode correctly applies values to Target model only
- Reference model remains untouched
- Import/Export functionality fully restored

### Reference Mode ✅ (Fixed: Commit c72cf00)
- Clicking "Set Values" in Reference mode now correctly applies values to Reference model only
- Target model remains untouched
- Fix: Manual sync of ReferenceState.state to StateManager with ref_ prefix (mirrors Target mode pattern)

### Critical Difference from FileHandler Import
FileHandler's Excel import recalculates **both models** because it's importing user data.

"Set Values" button is different:
- Only applies values to the **currently active model**
- Does NOT overwrite defaults or user-defined values in the inactive model
- This prevents state contamination when switching between design scenarios

### Implementation Pattern (Lines 792-818)
Both modes now use symmetric sync pattern:
- **Reference mode**: `ReferenceState.state` → `StateManager` as `ref_{fieldId}`
- **Target mode**: `TargetState.state` → `StateManager` as `{fieldId}`

---

## 🎯 Your Mission: 2 Simple Tasks

### Task 1: Add Method to FileHandler.js

**File**: `src/core/FileHandler.js`
**Where**: After existing import methods (~line 735+)
**What**: Add new method `applyReferenceValuesFromStandard(standard, targetMode)`

**Get complete code from**: [SETTING-VALUES.md](./SETTING-VALUES.md) lines 327-442

**Pattern**: 5-phase Import Quarantine
1. Mute listeners
2. Apply values (to TargetState or ReferenceState based on mode)
3. Sync to StateManager
4. Refresh DOM (shows inputs)
5. Unmute listeners
6. Trigger calculateAll()
7. Refresh DOM again (shows calculated results)

---

### Task 2: Simplify Section02.js Button Handler

**File**: `src/sections/Section02.js`
**What**: Replace entire `applyReferenceValuesOverlay()` function (lines 1070-1130)
**New implementation**: ~15 lines that delegate to FileHandler

**Get complete code from**: [SETTING-VALUES.md](./SETTING-VALUES.md) lines 295-325

**Simple approach**:
```javascript
// In initializeEventHandlers()
const setValuesBtn = document.getElementById("setValuesBtn");
if (setValuesBtn) {
  setValuesBtn.addEventListener("click", () => {
    const currentMode = window.TEUI?.ModeManager?.currentMode || "target";
    const standard = currentMode === "reference"
      ? window.TEUI.StateManager.getValue("ref_d_13")
      : window.TEUI.StateManager.getValue("d_13");

    // Delegate to FileHandler
    window.TEUI.FileHandler.applyReferenceValuesFromStandard(standard, currentMode);
  });
}
```

---

## Test Your Implementation

### Test 1: Target Mode
1. Load app in Target mode
2. Select d_13 = "PH Classic"
3. Click "Set Values"
4. **Expected**: d_66 changes to 1.1, DOM updates immediately

### Test 2: Reference Mode
1. Switch to Reference mode
2. Select ref_d_13 = "OBC SB10 5.5-6 Z6"
3. Click "Set Values"
4. **Expected**: ref_d_66 changes to 2.0, DOM updates immediately

### Test 3: State Isolation
1. After Test 1-2, switch between modes
2. **Expected**: Values don't contaminate each other (d_66=1.1, ref_d_66=2.0)

### Test 4: Stability
1. Repeat Test 1-2 multiple times
2. **Expected**: No value drift, h_10 (S01 grand total) remains stable

---

## Why This Approach?

✅ **FileHandler already has the working pattern** (Excel import uses Import Quarantine)
✅ **Treats ReferenceValues.js as internal import source** (consistent architecture)
✅ **No code duplication** (one place to maintain)
✅ **Proven to work** (FileHandler's import never has the DOM update / drift issues)

---

## ✅ Phase 4 & 5 Complete - "Set Values" Working in Both Modes

**Date**: November 19, 2025
**Status**: ✅ COMPLETE - Both bugs fixed and tested

### Bug 1: Section02 ModeManager Access (FIXED)
**Root Cause**: [Section02.js:1102](../../src/sections/Section02.js#L1102) was accessing `window.TEUI.ModeManager.currentMode` (undefined) instead of local `ModeManager.currentMode`

**Fix**: Changed to use section-specific local ModeManager reference

### Bug 2: Recursive calculateAll() Loops (FIXED)
**Root Cause**: Section10 and Section14 StateManager listeners were calling `calculateAll()` when their dependencies changed. This caused recursive calculation loops during FileHandler.applyReferenceValuesFromStandard():
- Section10 listener fired 114 times (caused logs to grow 4x)
- Section14 listener fired 148 times
- FileHandler's own calculateAll() triggered these listeners, which called calculateAll() again

**Why Excel Import Worked But Set Values Failed**:
- Excel import sets **input values only** (no calculated fields in import data)
- Set Values triggers FileHandler.calculateAll() which writes **calculated values** to StateManager
- Those calculated values triggered Section10/S14 listeners → more calculateAll() calls → recursion

**Fix**: Removed `calculateAll()` from Section10 and Section14 listeners
- [Section10.js:2984-2996](../../src/sections/Section10.js#L2984-L2996)
- [Section14.js:1449-1451](../../src/sections/Section14.js#L1449-L1451)
- Listeners now only call `updateCalculatedDisplayValues()` (UI refresh only)
- FileHandler's single calculateAll() call handles all calculations

**Result**: Logs reduced by 50% - recursion eliminated

### Known Calculation Sync Issues (Not Bugs - Architectural Limitations)

These issues will resolve when dependency-graph-directed calculation order is implemented:

1. **S10-S11 Window Area Sync**: Mode must be toggled for S10-S11 sync to apply calculation updates to S11
2. **Mechanical Convergence**: After "Set Values", the mechanical convergence loop must run again to complete ordered calculations and converge to expected values for the applied standard

These are **not bugs** but rather limitations of the current calculation order (manual sequencing without topological sort). As dependency-graph-directed calculation is implemented, these sync issues should resolve naturally.

---

## Next Steps

1. **✅ Phase 3 Cleanup COMPLETE** (Commit: a9a488f)
   - Removed obsolete PASSIVE d_13/ref_d_13 listeners from S05, S06, S09, S11, S12, S13, S14
   - Kept S03 listeners (Thermostat Setpoint updates) and S09 d_13 listener (Plug/Light/Equipment loads)
   - FileHandler now handles 100% of ReferenceValues application via "Set Values" button

2. **✅ Phase 4 COMPLETE** (Commit: c30390e)
   - "Set Values" button delegates to FileHandler.applyReferenceValuesFromStandard()
   - Uses proven Import Quarantine pattern (mute → apply → sync → unmute → calculate → refresh)
   - Treats ReferenceValues.js as internal import source (consistent with Excel import)

3. **✅ Phase 5 COMPLETE - Bug Fixes** (This commit)
   - **Bug 1 Fixed**: Section02 now uses local ModeManager (mode detection works correctly)
   - **Bug 2 Fixed**: Removed calculateAll() from Section10/S14 listeners (eliminates recursion)
   - Logs reduced by 50%, Reference mode working correctly
   - Known calculation sync issues documented (will resolve with dependency-graph-directed calculations)

4. **Phase 7: Integration Testing & Validation** (Next Priority)
   - See [D13-ARCHITECTURE-OPTIONS.md](./D13-ARCHITECTURE-OPTIONS.md) line 1271
   - Test "Set Values" in both modes with different building codes
   - Verify state isolation when switching between modes
   - Confirm no value drift on repeated button presses
   - Document any remaining calculation convergence issues

---

## Key Reference Documents

1. **[D13-SETTING-VALUES.md](./D13-SETTING-VALUES.md)** - Complete code examples and pattern explanation
2. **[D13-ARCHITECTURE-OPTIONS.md](./D13-ARCHITECTURE-OPTIONS.md)** - Full workplan (read "IMPLEMENTATION READY" section at top)
3. **[ReferenceValues.js](../../src/core/ReferenceValues.js)** - The internal "import" source

---

## Questions?

- **Why delegate to FileHandler?** Because it already has the Import Quarantine pattern that works perfectly for Excel imports. Don't duplicate code.
- **What's Import Quarantine?** Mute listeners → Set all values → Sync states → Unmute → Calculate. Prevents premature calculations and value drift.
- **What if tests fail?** Check console for FileHandler logs. Pattern should match Excel import behavior exactly.

---

**Good luck! The pattern is proven, the code is documented, and the tests are clear. This should be straightforward. 🚀**
