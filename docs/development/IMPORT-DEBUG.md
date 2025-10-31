# IMPORT DEBUG - Race Condition Investigation

**Created**: 2025-10-31
**Status**: 🔍 **ACTIVE INVESTIGATION**
**Issue**: Import breaks Reference calculations; switching S11/S13 modes "fixes" values

---

## 🔴 **CRITICAL OBSERVATIONS**

### **Observation 1: S01 Dashboard e_10/h_10 Cross-Contamination**

**Symptom:**
- Import with S11 in **Target mode** → `e_10` (Reference TEUI) shows **wrong value**
- Switch S11 to **Reference mode** → `e_10` **corrects itself**
- Import with S11 in **Reference mode** → `h_10` (Target TEUI) shows **wrong value**
- Switch S11 to **Target mode** → `h_10` **corrects itself**

**Pattern:** Whichever mode S11 is NOT in during import gets the wrong calculation.

**Why This Matters:** Both `calculateTargetModel()` and `calculateReferenceModel()` run during post-import `calculateAll()`, but the inactive mode's calculations don't "take" properly.

---

### **Observation 2: S13 HSPF Slider Contamination**

**Symptom:**
- **d_118 slider (COP)**: Works correctly in both modes after import
  - Target mode: Shows Target value with correct thumb position
  - Reference mode: Shows Reference value with correct thumb position

- **f_13 slider (HSPF)**: Breaks after import
  - Target mode: Shows imported value (10), slider **vanishes**
  - Reference mode: Shows imported value (10) instead of ReferenceValues.js (7.1), slider **vanishes**

**Expected Behavior for f_13:**
- Target mode: Show imported value (10) with slider thumb positioned correctly
- Reference mode: Show ReferenceValues.js overlay (7.1) with slider thumb positioned correctly

**Actual Behavior:**
- Both modes show Target imported value (10)
- Slider UI vanishes entirely in both modes

---

## 🧪 **HYPOTHESIS: Race Condition**

### **The Race:**

1. **Import Phase** (listeners muted):
   ```
   FileHandler imports data → StateManager (global)
   updateStateFromImportData() writes:
     - d_118 = 10 (Target)
     - ref_d_118 = X (Reference)
     - f_13 = 10 (Target)
     - ref_f_13 = Y (Reference)
   ```

2. **Sync Phase** (Pattern A sections):
   ```
   syncPatternASections() calls:
     - S11.TargetState.syncFromGlobalState()
     - S11.ReferenceState.syncFromGlobalState()
     - S13.TargetState.syncFromGlobalState()
     - S13.ReferenceState.syncFromGlobalState()
   ```

3. **Unmute Phase**:
   ```
   unmuteListeners() → listeners active
   ```

4. **Calculation Phase**:
   ```
   calculateAll() runs:
     - calculateTargetModel() for all sections
     - calculateReferenceModel() for all sections
   ```

5. **ReferenceValues Overlay** (S13 specific):
   ```
   S13.ReferenceState.setDefaults() should load:
     - f_13: 7.1 (from ReferenceValues.js)
   ```

### **The Competition:**

**When does ReferenceValues overlay happen?**
- On page load: `ReferenceState.initialize()` → `setDefaults()`
- On import: `syncFromGlobalState()` → **should respect ReferenceValues overlay**
- On ref_d_13 change: `onReferenceStandardChange()` → `setDefaults()`

**The Problem:**
Import's `syncFromGlobalState()` may be **overwriting** ReferenceValues overlay with imported Target values or global ref_ values, instead of preserving the ReferenceValues.js defaults.

---

## 📊 **EVIDENCE FROM CONSOLE LOGS**

### **Log Analysis 2025-10-31 (Import Test)**

**Test Setup:**
- Import broken Excel file with S11 in Target mode
- Observe S01 dashboard e_10 (Reference TEUI) value
- Toggle S11 to Reference mode, observe changes

**Results:**
```
After import: e_10 = 387.3 (WRONG - expected ~172.7)
After S11 Reference toggle: e_10 = 191.5 (closer but still wrong)
After S13 Reference toggles + Cooling off/on: e_10 = 176.7 (very close to expected 172.7)
```

**S15 Error Pattern:**
```
Section15.js:1423 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
```
- This error repeats multiple times in logs
- S15's calculateReferenceModel() IS running but cannot find upstream values from S11
- S15 falls back to initialization defaults

**S11 Evidence:**
```
[S11] REF CLIMATE READ: ref_d_19=Ontario, ref_h_19=Alexandria
[S11] Writing ref penalty: ref_i_97=40886.40
```
- S11's calculateReferenceModel() IS running during post-import calculateAll()
- S11 logs show it's attempting to write ref_ values
- But S15 doesn't see these values immediately after

**Key Finding:**
User observation: "This S11 mode switch, followed by S13 toggles of Reference mode, the Cooling off, then Cooling on again gets our Reference e_10 value to 176.7, where we expect 172.7"

**Analysis:**
- S15 complains it can't find Reference values from S11
- Multiple mode switches + recalculations gradually improve the value (387.3 → 191.5 → 176.7)
- This suggests **calculation cascade not completing** during initial post-import calculateAll()
- Hypothesis: S11 writes ref_ values, but downstream sections (S15, etc.) don't see them OR run before S11 completes

---

## 🔍 **KEY QUESTIONS TO INVESTIGATE**

### **Q1: Calculation Cascade Ordering (PRIORITY)**

**Does calculateAll() execute sections in the wrong order, causing downstream sections to run before upstream dependencies complete?**

**Evidence:**
- S15 reports missing ref_g_101, ref_d_101, ref_i_104 from S11
- S11 logs show it IS writing ref_ values
- Multiple mode toggles gradually fix the value (387.3 → 191.5 → 176.7)
- This pattern suggests incomplete cascade, not missing calculations

**Hypothesis:**
During post-import calculateAll(), sections may execute in parallel or wrong order:
```
BAD: S15.calculateReferenceModel() runs BEFORE S11.calculateReferenceModel() completes
     ↓
     S15 tries to read ref_g_101, ref_d_101, ref_i_104 → NOT FOUND
     ↓
     S15 uses fallback defaults → wrong calculations
     ↓
     User toggles modes → triggers new calculateAll() with different timing
     ↓
     This time S11 completes first → S15 finds values → better result
```

**Debug Strategy:**
Add timestamps to track execution order in calculateReferenceModel():

```javascript
// In S11.calculateReferenceModel()
console.log(`[S11-REF-CALC] START at ${Date.now()}`);
// ... calculations ...
console.log(`[S11-REF-CALC] Writing ref_g_101=${value_g_101} at ${Date.now()}`);
window.TEUI.StateManager.setValue('ref_g_101', value_g_101, 'calculated');
console.log(`[S11-REF-CALC] END at ${Date.now()}`);

// In S15.calculateReferenceModel()
console.log(`[S15-REF-CALC] START at ${Date.now()}`);
const ref_g_101 = window.TEUI.StateManager.getValue('ref_g_101');
console.log(`[S15-REF-CALC] Reading ref_g_101=${ref_g_101} at ${Date.now()}`);
if (!ref_g_101) {
  console.log(`[S15-REF-CALC] MISSING ref_g_101 - using fallback`);
}
console.log(`[S15-REF-CALC] END at ${Date.now()}`);
```

**Expected:** S11 START → S11 END → S15 START → S15 END

**If Wrong Order:** S15 runs before S11 completes → root cause identified

---

### **Q2: S11 Reference Calculation Timing**

**Does S11's `calculateReferenceModel()` run during post-import `calculateAll()`?**

**Debug Strategy:**
Add console logs to S11's `calculateReferenceModel()`:
```javascript
function calculateReferenceModel() {
  console.log('[S11-DEBUG] calculateReferenceModel() START');
  console.log('[S11-DEBUG] Current mode:', ModeManager.currentMode);
  // ... calculations ...
  console.log('[S11-DEBUG] Writing ref_g_101:', value_g_101);
  console.log('[S11-DEBUG] Writing ref_d_101:', value_d_101);
  console.log('[S11-DEBUG] Writing ref_i_104:', value_i_104);
  window.TEUI.StateManager.setValue('ref_g_101', value_g_101, 'calculated');
  console.log('[S11-DEBUG] calculateReferenceModel() END');
}
```

**Expected:** Should see this log during post-import `calculateAll()`

**If Missing:** Reference calc not running → mode-dependent bug in calculateAll()

**If Present:** Reference calc runs but values don't persist → overwrite bug

---

### **Q2: ReferenceValues Overlay Timing**

**When does S13's ReferenceState.setDefaults() run relative to import sync?**

**Current Flow (FileHandler.js lines 162-232):**
```javascript
// 1. Import data (muted)
this.updateStateFromImportData(importedData, 0, false);

// 2. Sync Pattern A (writes imported ref_ values to local state)
this.syncPatternASections();

// 3. Unmute
window.TEUI.StateManager.unmuteListeners();

// 4. Calculate
this.calculator.calculateAll();

// 5. Refresh UI
patternASections.forEach(section => {
  section.ModeManager.refreshUI();
  section.ModeManager.updateCalculatedDisplayValues();
});
```

**The Issue:**
`syncPatternASections()` calls `ReferenceState.syncFromGlobalState()`, which may be copying imported `ref_f_13` over the ReferenceValues.js default (7.1).

**Debug Strategy:**
Add logs to S13.ReferenceState:
```javascript
syncFromGlobalState: function(fieldIds) {
  fieldIds.forEach(fieldId => {
    const globalValue = window.TEUI.StateManager.getValue(`ref_${fieldId}`);
    const currentValue = this.state[fieldId];
    console.log(`[S13-REF-SYNC] ${fieldId}: current=${currentValue}, global ref_=${globalValue}`);

    if (globalValue !== null && globalValue !== undefined) {
      this.state[fieldId] = globalValue;
      console.log(`[S13-REF-SYNC] ${fieldId} OVERWRITTEN with global ref_${fieldId}=${globalValue}`);
    }
  });
}
```

---

### **Q3: Mode-Aware Calculation Execution**

**Does current mode affect which calculation engine completes successfully?**

**Hypothesis:**
- Import with S11 in Target mode → `calculateReferenceModel()` doesn't complete properly
- Import with S11 in Reference mode → `calculateTargetModel()` doesn't complete properly

**Evidence:**
User reports switching S11 mode after import "fixes" the broken calculation.

**Debug Strategy:**
Add execution tracking to calculateAll():
```javascript
function calculateAll() {
  console.log('[CALC-ALL] START - Current S11 mode:', window.TEUI.SectionModules.sect11.ModeManager.currentMode);

  console.log('[CALC-ALL] Running calculateTargetModel()...');
  calculateTargetModel();
  console.log('[CALC-ALL] calculateTargetModel() COMPLETE');

  console.log('[CALC-ALL] Running calculateReferenceModel()...');
  calculateReferenceModel();
  console.log('[CALC-ALL] calculateReferenceModel() COMPLETE');

  console.log('[CALC-ALL] END');
}
```

---

### **Q4: Slider UI Vanishing**

**Why does f_13 slider vanish but d_118 slider works?**

**Difference between sliders:**
- d_118 (COP): Pattern A field (local state)
- f_13 (HSPF): Pattern A field (local state) BUT may have ReferenceValues overlay

**Hypothesis:**
Slider vanishing is a symptom of state contamination. The slider initialization reads a value that's in an inconsistent state (e.g., undefined, null, or wrong type).

**Debug Strategy:**
Check FieldManager slider initialization for f_13:
```javascript
initializeSliders: function() {
  const sliderElement = document.querySelector('[data-field-id="f_13"]');
  const currentValue = ModeManager.getValue('f_13');
  console.log('[SLIDER-DEBUG] f_13 initialization - mode:', ModeManager.currentMode, 'value:', currentValue, 'type:', typeof currentValue);
}
```

---

## 🎯 **ROOT CAUSE CANDIDATES**

### **Candidate 1: syncFromGlobalState() Overwrites ReferenceValues**

**Location:** Pattern A sections (S11, S13, etc.)

**Problem:**
```javascript
// ReferenceState.syncFromGlobalState()
syncFromGlobalState: function(fieldIds) {
  fieldIds.forEach(fieldId => {
    const globalValue = window.TEUI.StateManager.getValue(`ref_${fieldId}`);
    if (globalValue !== null && globalValue !== undefined) {
      this.state[fieldId] = globalValue; // ❌ Overwrites ReferenceValues.js defaults!
    }
  });
}
```

**Solution:**
ReferenceValues overlay fields should NOT be synced from global state during import. They should maintain their ReferenceValues.js defaults.

**Example (S13 f_13):**
```javascript
syncFromGlobalState: function(fieldIds = [...]) {
  // ✅ NEW: Skip fields that use ReferenceValues overlay
  const referenceValueFields = ['f_13', 'f_14', 'f_15']; // From ReferenceValues.js

  fieldIds.forEach(fieldId => {
    // Skip ReferenceValues overlay fields
    if (referenceValueFields.includes(fieldId)) {
      console.log(`[S13-SYNC] Skipping ${fieldId} - uses ReferenceValues overlay`);
      return;
    }

    const globalValue = window.TEUI.StateManager.getValue(`ref_${fieldId}`);
    if (globalValue !== null && globalValue !== undefined) {
      this.state[fieldId] = globalValue;
    }
  });
}
```

---

### **Candidate 2: Mode-Dependent Calculation Blocking**

**Location:** Calculation engines (calculateAll)

**Problem:**
Calculation engines may have hidden mode checks that prevent one engine from running when in the wrong mode.

**Example Anti-Pattern:**
```javascript
function calculateReferenceModel() {
  // ❌ ANTI-PATTERN: Don't skip calculation based on current mode
  if (ModeManager.currentMode !== 'reference') {
    console.log('[S11] Skipping Reference calc - not in Reference mode');
    return;
  }
  // ... calculations ...
}
```

**Solution:**
Both engines must ALWAYS run during `calculateAll()`, regardless of current mode.

---

### **Candidate 3: DOM Update Mode Blocking**

**Location:** updateCalculatedDisplayValues()

**Problem:**
Pattern A sections use `updateCalculatedDisplayValues()` to write calculated values to DOM. If this function checks current mode and only updates for matching mode, the inactive mode's calculations won't persist to UI.

**Example:**
```javascript
updateCalculatedDisplayValues: function() {
  calculatedFields.forEach(fieldId => {
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (!element) return;

    // ❌ POTENTIAL ISSUE: Does this respect mode properly?
    const value = ModeManager.getValue(fieldId);
    element.textContent = value;
  });
}
```

**Solution:**
DOM updates must be mode-aware and update the correct state values without cross-contamination.

---

## 🧩 **INVESTIGATION PLAN**

### **Phase 1: Calculation Cascade Timing (PRIORITY)**

**Focus:** Determine if S15 runs before S11 completes during post-import calculateAll()

Add timestamp logging to track execution order:

1. **S11.calculateReferenceModel():**
   - Log START with timestamp
   - Log each ref_ value write (ref_g_101, ref_d_101, ref_i_104) with timestamp
   - Log END with timestamp

2. **S15.calculateReferenceModel():**
   - Log START with timestamp
   - Log each upstream ref_ value read with timestamp
   - Log MISSING value warnings with timestamp
   - Log END with timestamp

3. **Calculator.calculateAll():**
   - Log execution order of sections
   - Track which sections run calculateReferenceModel() in what sequence

**Expected Result:**
```
[CALC-ALL] Running calculateReferenceModel() for all sections...
[S11-REF-CALC] START at 1234567890
[S11-REF-CALC] Writing ref_g_101=X at 1234567895
[S11-REF-CALC] END at 1234567900
[S15-REF-CALC] START at 1234567905
[S15-REF-CALC] Reading ref_g_101=X at 1234567910 ✅
[S15-REF-CALC] END at 1234567915
```

**If Bug Exists:**
```
[CALC-ALL] Running calculateReferenceModel() for all sections...
[S11-REF-CALC] START at 1234567890
[S15-REF-CALC] START at 1234567891 ❌ TOO EARLY!
[S15-REF-CALC] Reading ref_g_101=null at 1234567892 ❌ NOT FOUND
[S15-REF-CALC] MISSING ref_g_101 - using fallback
[S11-REF-CALC] Writing ref_g_101=X at 1234567895 ⚠️ TOO LATE!
```

### **Phase 1b: Secondary Logging (If cascade timing correct)**

If S11 completes before S15 runs, add additional logs:

1. **StateManager.setValue():**
   - Log when ref_g_101, ref_d_101, ref_i_104 are written to StateManager
   - Log caller context (which section is writing)

2. **StateManager.getValue():**
   - Log when S15 tries to read these values
   - Log what's actually in StateManager at that moment

### **Phase 2: Reproduce & Capture**

1. Import test file with S11 in Target mode
2. Capture console logs
3. Switch to S11 Reference mode
4. Capture what changes

### **Phase 3: Root Cause Identification**

Based on logs, identify:
- Where Reference calculations fail to complete
- Where ReferenceValues get overwritten with imported values
- Where mode contamination occurs

### **Phase 4: Targeted Fix**

Fix ONLY the identified root cause without refactoring other working code.

---

## 📝 **NOTES**

- **Anti-Pattern Removed:** S11's `switchMode()` no longer calls `calculateAll()` (commit c982156)
- **Remaining Issue:** Import still requires manual mode switch to complete calculations
- **Key Insight:** This is NOT a calculateAll() problem - calculations run, but values don't persist correctly
- **Focus Area:** ReferenceValues overlay system competing with imported ref_ values

---

## 🚧 **NEXT STEPS**

### **NEW PRIORITY: Debug S13 HSPF Slider (Easier Entry Point)**

**Rationale:**
- S13 d_118 (ERV) slider: **WORKS** after import (slider visible, correct thumb position, mode-aware)
- S13 f_113 (HSPF) slider: **BREAKS** after import (slider vanishes, shows Target value in Reference mode)
- Both fields use ReferenceValues.js overlay
- Both are in same section (S13)
- **Working comparison available** → easier to isolate root cause

**Investigation Complete - REVISED Root Cause Theory:**

### **Field Comparison:**

**f_113 (HSPF - BREAKS on Heatpump import, WORKS on Gas import):**
```javascript
// Section13.js lines 887-896
fieldId: "f_113",
type: "coefficient",
value: "12.5",
min: 3.5,
max: 20,
step: 0.1,
```

**d_118 (ERV - WORKS on all imports):**
```javascript
// Section13.js lines 1184-1191
fieldId: "d_118",
type: "percentage",
value: "89",
min: 0,
max: 100,
step: 1,
```

### **REVISED Root Cause: ReferenceValues Overlay + Ghosting Timing Conflict**

**Location:** Section13.js ghosting logic (line 3550) + ReferenceState.setDefaults() (line 130)

**Key Discovery:**

**Why f_113 BREAKS on Heatpump import but WORKS on Gas import:**

```javascript
// Section13.js line 3550
setFieldGhosted("f_113", !isHP); // HSPF Slider ghosted unless Heatpump
```

**Gas Import (Slider WORKS - but shouldn't matter since ghosted):**
1. ExcelMapper: `ref_f_113 = 10` (imported from REFERENCE sheet)
2. ReferenceState.setDefaults(): `ref_f_113 = 7.1` (ReferenceValues overlay)
3. Ghosting: `setFieldGhosted("f_113", true)` → **slider hidden/inactive**
4. No visible conflict - slider isn't displayed, so ReferenceValues/import competition doesn't matter

**Heatpump Import (Slider BREAKS):**
1. ExcelMapper: `ref_f_113 = 10` (imported from REFERENCE sheet)
2. ReferenceState.setDefaults(): `ref_f_113 = 7.1` (ReferenceValues overlay)
3. Ghosting: `setFieldGhosted("f_113", false)` → **slider MUST be visible**
4. **CONFLICT:** Import value (10) vs ReferenceValues overlay (7.1)
5. Timing issue in: import sync → ReferenceValues overlay → ghosting → refreshUI sequence
6. **Result:** Slider initialization gets inconsistent state → vanishes

**Why d_118 ALWAYS WORKS:**
- No ghosting logic - always visible regardless of heating system
- No conditional state changes during import
- ReferenceValues overlay (d_118 = 81) doesn't compete with ghosting state

### **Connection to S11 Issue:**

**User insight:** "This ReferenceValues issue may be related to why S11 isn't working as expected after import. ReferenceValues IS setting U-values and RSI values based on ref_d_13 selection at the SAME time it is trying to map values on import..."

**S11 Pattern (Building Envelope):**
- ReferenceState.setDefaults() loads U-values from ReferenceValues.js based on `ref_d_13` (reference standard)
- Import also writes `ref_g_88` through `ref_g_93` (U-values) from REFERENCE sheet
- **SAME COMPETITION:** ReferenceValues overlay vs imported values
- But S11 fields are always visible (no ghosting) - so why does it break?

**Hypothesis:** The issue isn't ghosting-specific - it's the **timing of ReferenceValues.setDefaults() relative to import sync**.

### **The Race Condition:**

**FileHandler.js import flow (lines 153-199):**
```javascript
// 1. Mute listeners
StateManager.muteListeners();

// 2. Import Target data
updateStateFromImportData(importedData, 0, false);

// 3. Import Reference data
processImportedExcelReference(workbook);

// 4. Sync Pattern A sections (writes imported ref_ values to local state)
syncPatternASections(); // ← Calls ReferenceState.syncFromGlobalState()

// 5. Unmute listeners
StateManager.unmuteListeners();

// 6. Calculate and refresh
calculateAll();
patternASections.forEach(section => {
  section.ModeManager.refreshUI();
  section.ModeManager.updateCalculatedDisplayValues();
});
```

**The Problem:**

`syncPatternASections()` at step 4 calls `ReferenceState.syncFromGlobalState()`, which writes imported `ref_` values to ReferenceState.

**BUT** when did `ReferenceState.setDefaults()` run to load ReferenceValues overlay?

- On page load: `ReferenceState.initialize()` → `setDefaults()` ✅
- On import: Does `syncFromGlobalState()` **overwrite** the ReferenceValues overlay? ❌

**Solution Direction:**
ReferenceValues overlay fields (f_113, d_118, g_88-g_93) should NOT be overwritten by import sync. They should maintain their ReferenceValues.js defaults based on current reference standard.

---

### **Gas Import Analysis - Hypothesis CONFIRMED**

**Logs.md Analysis (Gas Import):**

**Key Finding:** **ZERO f_113/HSPF logs** during entire Gas import sequence.

**What logs show:**
- S07 logs: `systemType="Gas"` confirmed (lines 1245, 2853, 4371-4376)
- S13 logs: Only cooling/ventilation calculations (d_120, d_122, d_129)
- **NO f_113 slider initialization**
- **NO HSPF calculations**
- **NO ghosting logs**
- **NO ReferenceValues overlay logs for f_113**

**Interpretation:**

When d_113 = "Gas":
1. f_113 slider is **ghosted** via `setFieldGhosted("f_113", true)` (Section13.js:3550)
2. Ghosted sliders don't trigger initialization logs
3. refreshUI() skips ghosted fields or hides them
4. **No visible conflict** even if ReferenceValues (7.1) competes with import value (10)
5. User can't see slider → no breakage reported

**This confirms the hypothesis:**
- The issue is NOT FieldManager rendering
- The issue is NOT missing "coefficient" type handler
- The issue IS **ReferenceValues overlay timing when slider must be visible**

**Predicted Heatpump Import Behavior:**

When d_113 = "Heatpump":
1. f_113 slider is **active** via `setFieldGhosted("f_113", false)`
2. Slider MUST initialize during refreshUI()
3. ReferenceValues overlay (7.1) competes with import value (10)
4. **Visible conflict** → slider gets inconsistent state
5. Result: Slider vanishes or shows wrong value

---

## 🎯 **SOLUTION: Skip ReferenceValues Overlay During Import Sync**

### **Critical Discovery (2025-10-31 pm):**

**Test Result:** Commenting out ExcelMapper `ref_f_113` import did NOT fix the issue!
- Reference mode still shows f_113 = 10 (not 7.1)
- Slider still broken

**Investigation:**
1. ✅ ExcelMapper: ref_f_113 commented out (line 344) - NOT importing
2. ✅ localStorage: No S13 Reference state saved (or matches imported values)
3. ✅ S10/S11 localStorage: Exact match of imported values
4. ❌ **syncFromGlobalState()**: Still has f_113 in fieldIds list (line 215)

**The Smoking Gun:**

Even though ref_f_113 is NOT imported from Excel, `syncFromGlobalState()` still tries to sync it. Where does it get ref_f_113 = 10?

**Answer:** StateManager might have ref_f_113 from:
1. Previous session (before we commented out ExcelMapper)
2. CSV export initialization code (line 246) publishing ReferenceState to StateManager
3. **OR**: The Target value (f_113 = 10) is bleeding through somehow

**Next Test:**
1. Remove f_113, d_118, j_115 from Section13.syncFromGlobalState() fieldIds list (line 215-219)
2. Clear browser cache/localStorage/cookies completely
3. Import Heatpump file again
4. Check if f_113 slider shows 7.1 in Reference mode

**Also apply same fix to S11:**
- Remove g_88, g_89, g_90, g_91, g_92, g_93 from Section11.ReferenceState.syncFromGlobalState() fieldIds list
- This may fix the S11 → S15 cascade issue if it's related to U-value contamination

### **Root Cause Summary:**

Pattern A sections use `syncFromGlobalState()` during import to copy imported `ref_` values from StateManager to ReferenceState. BUT this overwrites ReferenceValues overlay fields that should maintain their standard-based defaults.

**Affected Fields:**
- **S13**: f_113 (HSPF), d_118 (ERV), j_115 (AFUE) - from ReferenceValues.js based on d_13
- **S11**: g_88-g_93 (U-values) - from ReferenceValues.js based on d_13
- Any other fields with ReferenceValues overlay pattern

### **Proposed Fix:**

**Location:** `ReferenceState.syncFromGlobalState()` in Pattern A sections (S11, S13, etc.)

**Current Code (S13 example - lines 212-234):**
```javascript
syncFromGlobalState: function (fieldIds = [...]) {
  fieldIds.forEach((fieldId) => {
    const refFieldId = `ref_${fieldId}`;
    const globalValue = window.TEUI.StateManager.getValue(refFieldId);
    if (globalValue !== null && globalValue !== undefined) {
      this.setValue(fieldId, globalValue, "imported"); // ❌ Overwrites ReferenceValues overlay!
    }
  });
}
```

**Fixed Code:**
```javascript
syncFromGlobalState: function (fieldIds = [...]) {
  // ✅ Define fields that use ReferenceValues overlay (should NOT sync from import)
  const referenceValueFields = ["f_113", "d_118", "j_115"]; // HSPF, ERV, AFUE

  fieldIds.forEach((fieldId) => {
    // Skip fields that use ReferenceValues overlay
    if (referenceValueFields.includes(fieldId)) {
      console.log(`[S13-SYNC] Skipping ${fieldId} - uses ReferenceValues overlay`);
      return;
    }

    const refFieldId = `ref_${fieldId}`;
    const globalValue = window.TEUI.StateManager.getValue(refFieldId);
    if (globalValue !== null && globalValue !== undefined) {
      this.setValue(fieldId, globalValue, "imported"); // ✅ Only sync non-overlay fields
    }
  });
}
```

**Apply same pattern to:**
- **S11.ReferenceState.syncFromGlobalState()** - skip g_88, g_89, g_90, g_91, g_92, g_93 (U-values)
- Any other Pattern A sections with ReferenceValues overlays

### **Why This Works:**

1. **On page load**: ReferenceState.initialize() → setDefaults() loads ReferenceValues overlay ✅
2. **On import**: syncFromGlobalState() **skips** overlay fields → preserves ReferenceValues ✅
3. **On d_13 change**: onReferenceStandardChange() → setDefaults() updates overlay with new standard ✅
4. **User override**: User can still manually edit fields → marked as user-modified ✅

**Benefits:**
- ✅ Fixes S13 f_113 HSPF slider vanishing on Heatpump import
- ✅ Fixes S11 U-values contamination on import
- ✅ Fixes S11 → S15 cascade issues (if related to U-value contamination)
- ✅ Maintains separation: Imported project data vs. Reference standard defaults
- ✅ Minimal code change - just skip list in syncFromGlobalState()

---

### **Original Plan (S11 → S15 Cascade - Defer if S13 fix solves it)**

1. Add debug logging (Phase 1)
2. Perform import test with logs enabled
3. Analyze log output to identify exact failure point
4. Document findings here before implementing fix
5. Create targeted fix based on evidence

**Note:** S13 slider fix may reveal root cause that also fixes S11 → S15 Reference cascade issue.

**NO CODE CHANGES until we understand the exact root cause from comparison analysis.**
