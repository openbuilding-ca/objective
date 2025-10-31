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

```
Section15.js:1423 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
```

**Analysis:**
- S15 complains it can't find Reference values from S11
- This suggests S11's `calculateReferenceModel()` either:
  1. Didn't run during post-import `calculateAll()`
  2. Ran but didn't write ref_ values to StateManager
  3. Ran and wrote values, but they were immediately overwritten

---

## 🔍 **KEY QUESTIONS TO INVESTIGATE**

### **Q1: S11 Reference Calculation Timing**

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

### **Phase 1: Logging (No Code Changes)**

Add comprehensive console logs to track:

1. **Import Flow:**
   - FileHandler: When sync happens, what values are synced
   - StateManager: What ref_ values are written during import

2. **Calculation Flow:**
   - S11: When calculateReferenceModel() runs, what values it writes
   - S15: When calculateReferenceModel() runs, what upstream values it reads

3. **ReferenceValues Overlay:**
   - S13: When setDefaults() runs, what values it sets
   - S13: When syncFromGlobalState() runs, does it overwrite ReferenceValues

4. **Mode Switching:**
   - What happens when user switches S11 mode after import
   - Does it trigger calculateAll()? (Should not!)

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

1. Add debug logging (Phase 1)
2. Perform import test with logs enabled
3. Analyze log output to identify exact failure point
4. Document findings here before implementing fix
5. Create targeted fix based on evidence

**NO CODE CHANGES until we understand the exact root cause from logs.**
