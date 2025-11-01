# Import Debug Investigation - S13 HSPF Slider Bug

**Created**: 2025-10-31
**Status**: 🔍 **ROOT CAUSE IDENTIFIED** - Type mismatch + 12.5 default fallback
**Priority**: HIGH - Blocks Heatpump project imports

---

## 🎯 **CRITICAL DISCOVERY: The "12.5 Default Anomaly"**

### **Symptom**

When importing Heatpump projects, the HSPF slider (f_113) in Section 13:
- **BREAKS** when Target f_113 ≠ 12.5 (slider vanishes, Reference shows Target value)
- **WORKS** when Target f_113 = 12.5 (slider visible, Reference shows correct ReferenceValues 7.1)

### **Test Results from Multiple Import Files**

| Import Scenario | Target f_113 | ref_f_113 Import | Result |
|----------------|--------------|------------------|--------|
| Electricity system | (ghosted) | N/A | ✅ Slider ghosted, f_113 = 12.5 - WORKS |
| Gas system | (ghosted) | N/A | ✅ Slider ghosted, f_113 = 12.5 - WORKS |
| Heatpump, f_113 = **12.5** | 12.5 | Commented out | ✅ Slider visible, Reference = 7.1 - **WORKS!** |
| Heatpump, f_113 = 10 | 10 | Commented out | ❌ Slider BREAKS, Reference = 10 (contaminated) |
| Heatpump, f_113 = 5 | 5 | Commented out | ❌ Slider BREAKS, Reference = 5 (contaminated) |
| Heatpump, f_113 = 15 | 15 | Commented out | ❌ Slider BREAKS, Reference = 15 (contaminated) |
| Heatpump, f_113 = 10 | 10 | **Explicitly = 8** | ✅ Slider WORKS, Reference = 8 - **WORKS!** |

**Key Finding**: Bug ONLY occurs when:
1. Heatpump system (slider must be visible, not ghosted)
2. Target f_113 ≠ 12.5 (field default)
3. ref_f_113 NOT imported from REFERENCE sheet (ExcelMapper commented out)

---

## 🔍 **ROOT CAUSE: Type Mismatch + Fallback Contamination**

### **Issue 1: Wrong Field Type**

**Section13.js line 887-895:**
```javascript
f: {
  fieldId: "f_113",
  type: "coefficient", // ❌ WRONG - not a recognized slider type
  value: "12.5",       // ← Field default
  min: 3.5,
  max: 20,
  step: 0.1,
  // Comment says: "Changed from editable to coefficient slider type"
  // But type is "coefficient" not "coefficient_slider"!
}
```

**Compare with S10 SHGC sliders (f_73-f_78) that WORK:**
```javascript
f_73: {
  fieldId: "f_73",
  type: "coefficient_slider", // ✅ CORRECT - recognized slider type
  value: "0.50",
  min: 0.2,
  max: 0.6,
  step: 0.05,
}
```

**Also compare with S13 d_118 ERV slider that WORKS:**
```javascript
d_118: {
  fieldId: "d_118",
  type: "percentage", // ✅ CORRECT - recognized slider type
  value: "89",
  min: 0,
  max: 100,
  step: 1,
}
```

**Recognized Slider Types** (FieldManager.js):
- ✅ `"coefficient_slider"` - has slider initialization handler
- ✅ `"percentage"` - has slider initialization handler
- ✅ `"year_slider"` - has slider initialization handler
- ❌ `"coefficient"` - **NO slider handler** - treated as display-only field

### **Issue 2: The 12.5 Fallback Mask**

**Hypothesis**: When f_113 has NO slider handler (wrong type), the field falls back to:
1. **Field definition default (12.5)** when no other value available
2. **This masks the import bug** when Target = 12.5 (fallback matches imported value)
3. **Bug becomes visible** when Target ≠ 12.5 (fallback doesn't match, contamination path exposed)

**The Contamination Path** (when Target ≠ 12.5):
1. Target f_113 = 10 imported from REPORT sheet → TargetState
2. REFERENCE sheet does NOT import ref_f_113 (commented out in ExcelMapper)
3. ReferenceState.syncFromGlobalState() looks for `ref_f_113` in StateManager
4. `ref_f_113` NOT FOUND in StateManager
5. **BUG**: Some fallback mechanism reads Target `f_113` instead of:
   - Field default (12.5), OR
   - ReferenceValues default (7.1)
6. ReferenceState contaminated with Target value (10)
7. Slider initialization fails (wrong type + wrong value)
8. Slider vanishes, Reference shows contaminated value

**When Target = 12.5** (Bug Masked):
1. Target f_113 = 12.5 imported → TargetState
2. ref_f_113 NOT FOUND in StateManager
3. Fallback reads Target f_113 = 12.5
4. **Accidentally matches field default (12.5)** → appears to work
5. ReferenceValues (7.1) still applied correctly somehow
6. Slider visible (but maybe not properly initialized as slider due to wrong type)

### **Issue 3: Ghosting Hides the Bug in Non-Heatpump Systems**

**Section13.js line 3550:**
```javascript
function handleHeatingSystemChangeForGhosting(newValue) {
  const isHP = newValue === "Heatpump";
  setFieldGhosted("f_113", !isHP); // HSPF only visible for Heatpump
}
```

**Why Gas/Electricity imports don't show the bug:**
- Slider is **ghosted** (hidden) when d_113 ≠ "Heatpump"
- Field shows default 12.5 but user can't interact with it
- No slider initialization attempted → no visible breakage

**Why Heatpump imports BREAK:**
- Slider is **unghosted** (visible) when d_113 = "Heatpump"
- Slider initialization attempted with wrong type ("coefficient" instead of "coefficient_slider")
- Contamination visible: Reference shows Target value instead of ReferenceValues

---

## 🧪 **DIAGNOSTIC TEST PLAN**

### **Test 1: Verify Type Mismatch**

**Objective**: Confirm "coefficient" type lacks slider initialization handler

**Method**:
1. Search FieldManager.js for slider type handlers
2. Verify "coefficient_slider" has handler, "coefficient" does not
3. Check if "coefficient" is treated as display-only field

**Expected**: FieldManager has no initializeSlider logic for plain "coefficient" type

### **Test 2: Trace Contamination Path**

**Objective**: Find WHERE Target f_113 bleeds into ReferenceState when ≠ 12.5

**Add logging to Section13.js**:

**A) ReferenceState.syncFromGlobalState() (line 212)**:
```javascript
syncFromGlobalState: function (fieldIds = [...]) {
  console.log('[S13-REF-SYNC] START');

  fieldIds.forEach((fieldId) => {
    const refFieldId = `ref_${fieldId}`;
    const globalValue = window.TEUI.StateManager.getValue(refFieldId);

    if (fieldId === "f_113") {
      console.log(`[S13-REF-SYNC] f_113 DIAGNOSTIC:`);
      console.log(`  - Looking for: ${refFieldId}`);
      console.log(`  - StateManager[ref_f_113]: ${globalValue}`);
      console.log(`  - ReferenceState.f_113 BEFORE: ${this.state.f_113}`);
      console.log(`  - TargetState.f_113: ${window.TEUI.Section13.TargetState.getValue("f_113")}`);
      console.log(`  - Field default: 12.5`);
      console.log(`  - ReferenceValues default: 7.1`);
    }

    if (globalValue !== null && globalValue !== undefined) {
      this.setValue(fieldId, globalValue, "imported");
      if (fieldId === "f_113") {
        console.log(`  - ReferenceState.f_113 AFTER: ${this.state.f_113}`);
      }
    } else if (fieldId === "f_113") {
      console.log(`  - ref_f_113 NOT FOUND in StateManager`);
      console.log(`  - ReferenceState.f_113 UNCHANGED: ${this.state.f_113}`);
    }
  });
}
```

**B) Add to calculateReferenceModel() (if it touches f_113)**:
```javascript
if (fieldId === "f_113") {
  console.log(`[S13-CALC-REF] Reading f_113 for calculations:`);
  console.log(`  - Source: ${source}`);
  console.log(`  - Value: ${value}`);
}
```

**Import broken file (f_113 = 10) and capture logs**

**Expected to find**: Exact code location where Target value overwrites ReferenceState

### **Test 3: Compare Working vs Broken Types**

| Field | Type | Default | Import Behavior |
|-------|------|---------|-----------------|
| f_73 (S10 SHGC) | `coefficient_slider` ✅ | 0.50 | Test with non-default value |
| d_118 (S13 ERV) | `percentage` ✅ | 89 | ✅ WORKS with any value |
| f_113 (S13 HSPF) | `coefficient` ❌ | 12.5 | ❌ BREAKS when ≠ 12.5 |

**Test S10 SHGC Import**:
1. Create Excel with f_73 = 0.35 (not default 0.50)
2. Import file
3. Check if slider works correctly
4. **Hypothesis**: Will WORK because type is "coefficient_slider"

**If S10 SHGC WORKS with non-default**: Type mismatch confirmed as root cause

---

## 🔧 **PROPOSED SOLUTIONS**

### **Solution 1: Fix Field Type (SIMPLE FIX)**

**Section13.js line 888:**
```javascript
// BEFORE:
type: "coefficient", // ❌ Wrong type

// AFTER:
type: "coefficient_slider", // ✅ Correct slider type
```

**Expected Result**:
- Slider initialization will work (recognized type)
- Import should work with any f_113 value
- Still need to verify ReferenceValues overlay preserved

**Risk**: Low - matches pattern used in S10 for SHGC sliders

### **Solution 2: Skip ReferenceValues Fields in syncFromGlobalState() (COMPREHENSIVE FIX)**

**Even if type fixed, still need to prevent Target contamination of ReferenceValues overlay fields**

**Section13.js ReferenceState.syncFromGlobalState() (line 212)**:
```javascript
syncFromGlobalState: function (fieldIds = [...]) {
  // Define fields that use ReferenceValues overlay (should NOT sync from import)
  const referenceValueFields = ["f_113", "d_118", "j_115"];

  fieldIds.forEach((fieldId) => {
    // Skip ReferenceValues overlay fields - they maintain standard-based defaults
    if (referenceValueFields.includes(fieldId)) {
      console.log(`[S13-SYNC] Skipping ${fieldId} - uses ReferenceValues overlay`);
      return;
    }

    const refFieldId = `ref_${fieldId}`;
    const globalValue = window.TEUI.StateManager.getValue(refFieldId);
    if (globalValue !== null && globalValue !== undefined) {
      this.setValue(fieldId, globalValue, "imported");
    }
  });
}
```

**Apply same to S11.ReferenceState.syncFromGlobalState()**:
- Skip g_88, g_89, g_90, g_91, g_92, g_93 (U-values)

**Why Both Fixes Needed**:
1. **Type fix**: Makes slider initialization work
2. **Skip logic**: Prevents Target values from contaminating Reference ReferenceValues overlay

---

## 📋 **IMPLEMENTATION PLAN**

### **Phase 1: Quick Test (Type Fix Only)**
1. Change f_113 type from "coefficient" to "coefficient_slider"
2. Clear browser data (fresh state)
3. Import Heatpump file with f_113 = 10
4. **Expected**: Slider appears, but Reference might still show 10 (contamination)

### **Phase 2: Add Skip Logic**
1. Add skip logic to S13.ReferenceState.syncFromGlobalState()
2. Add skip logic to S11.ReferenceState.syncFromGlobalState()
3. Clear browser data
4. Import Heatpump file with f_113 = 10
5. **Expected**: Slider appears, Reference shows 7.1 (ReferenceValues default)

### **Phase 3: Verify S11 → S15 Cascade**
1. Import file that previously broke S11 → S15 cascade
2. Check if S01 dashboard e_10 now correct on first import (no mode toggling needed)
3. **Hypothesis**: U-value contamination was breaking cascade, skip logic should fix it

---

## 📊 **RELATED ISSUES**

### **S11 → S15 Cascade Problem**

**Symptom**: After import, S01 dashboard e_10 (Reference TEUI) = 387.3 (expected ~172.7). Requires manual S11/S13 mode toggles to fix (387.3 → 191.5 → 176.7).

**S15 Error**: "Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104 from S11"

**Connection to f_113 Bug**:
- S11 U-values (g_88-g_93) use ReferenceValues.js overlay (same pattern as f_113)
- Import may contaminate S11 Reference U-values with Target values
- Contaminated U-values → wrong S11 calculations → wrong values sent to S15
- Manual mode toggle forces recalculation with correct ReferenceValues → fixes cascade

**Solution**: Same skip logic for S11.ReferenceState.syncFromGlobalState()

---

## 🧩 **BACKGROUND CONTEXT**

### **ReferenceValues Overlay System**

Certain fields in Reference model should ALWAYS use values from ReferenceValues.js based on current reference standard (d_13), NOT imported from project Excel files.

**Fields with ReferenceValues Overlay**:
- **S13**: f_113 (HSPF), d_118 (ERV), j_115 (AFUE)
- **S11**: g_88-g_93 (U-values for walls, windows, doors, floors, roof, slab)

**How it should work**:
1. **Page load**: ReferenceState.setDefaults() loads ReferenceValues based on d_13
2. **Import**: syncFromGlobalState() should SKIP overlay fields, preserve ReferenceValues
3. **d_13 change**: onReferenceStandardChange() updates ReferenceValues overlay
4. **User edit**: User can manually override (marked as "user-modified")

**Current bug**: syncFromGlobalState() doesn't skip overlay fields → Target values contaminate Reference

### **Pattern A Dual-State Architecture**

Sections 02-15 use isolated TargetState/ReferenceState objects:
- **TargetState**: User's project data (imported from REPORT sheet)
- **ReferenceState**: Reference model data (should use ReferenceValues for overlay fields)
- **ModeManager**: Switches between Target/Reference display without triggering calculations

**Import Flow** (FileHandler.js lines 153-199):
1. Mute listeners
2. Import Target data (REPORT sheet) → StateManager → TargetState.syncFromGlobalState()
3. Import Reference data (REFERENCE sheet) → StateManager → ReferenceState.syncFromGlobalState()
4. Unmute listeners
5. calculateAll() + refreshUI()

**Bug**: Step 3 syncs ALL fields from StateManager to ReferenceState, including overlay fields that should maintain ReferenceValues defaults.

---

## 🎯 **SUCCESS CRITERIA**

- ✅ f_113 slider visible and functional after Heatpump import (any f_113 value)
- ✅ Reference f_113 shows ReferenceValues default (7.1), NOT Target value
- ✅ S11 U-values in Reference mode use ReferenceValues defaults, NOT Target values
- ✅ S01 dashboard e_10 correct immediately after import (no manual mode toggling)
- ✅ No Target-to-Reference contamination for any ReferenceValues overlay field
- ✅ User can still manually edit overlay fields if needed (marked as "user-modified")

---

**Last Updated**: 2025-10-31 evening
**Next Action**: Implement Phase 1 (type fix) and test
