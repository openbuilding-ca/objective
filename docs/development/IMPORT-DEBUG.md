# Import Debug Investigation

**Created**: 2025-10-31
**Last Updated**: 2025-10-31 evening

---

## ✅ **S13 HSPF Slider Bug - RESOLVED**

**Status**: FIXED & TESTED
**Commit**: a0b685d
**Priority**: COMPLETE

### **Root Cause**

Two-part issue:
1. **Type mismatch**: f_113 used `"coefficient"` instead of `"coefficient_slider"` (no slider handler)
2. **ReferenceValues contamination**: syncFromGlobalState() synced overlay fields from import

### **The "12.5 Default Anomaly"**

Bug only visible when:
- Heatpump system (slider unghosted)
- Target f_113 ≠ 12.5 (field default)
- ref_f_113 NOT imported from REFERENCE sheet

**Test Results:**

| Import Scenario | Target f_113 | Result |
|----------------|--------------|--------|
| Electricity/Gas system | (ghosted) | ✅ WORKS |
| Heatpump, f_113 = **12.5** | 12.5 | ✅ WORKS (fallback masked bug) |
| Heatpump, f_113 = 10 | 10 | ❌ BROKE (before fix) |
| Heatpump, f_113 = 5 | 5 | ❌ BROKE (before fix) |
| Heatpump, f_113 ≠ 12.5 | ANY | ❌ BROKE (before fix) |

### **The Fix**

**Section13.js changes:**

1. **Type fix** ([Section13.js:888](src/sections/Section13.js#L888)):
```javascript
// BEFORE:
type: "coefficient", // ❌ No slider handler

// AFTER:
type: "coefficient_slider", // ✅ Recognized slider type (like S10 SHGC sliders)
```

2. **Skip logic** ([Section13.js:227-238](src/sections/Section13.js#L227-L238)):
```javascript
syncFromGlobalState: function (fieldIds = [...]) {
  // ✅ ReferenceValues overlay fields - should NOT sync from import
  const referenceValueFields = ["f_113", "d_118", "j_115"];

  fieldIds.forEach((fieldId) => {
    // Skip ReferenceValues overlay fields
    if (referenceValueFields.includes(fieldId)) {
      console.log(`[S13-REF-SYNC] Skipping ${fieldId} - uses ReferenceValues overlay`);
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

### **Success Criteria - All Achieved**

- ✅ f_113 slider visible and functional after Heatpump import (any f_113 value)
- ✅ Reference f_113 shows ReferenceValues default (7.1), NOT Target value
- ✅ No Target-to-Reference contamination for S13 ReferenceValues fields
- ✅ Gas/Electricity imports: No regression (slider properly ghosted)
- ✅ User can still manually edit overlay fields if needed

---

## ❌ **S11 → S15 Cascade Issue - UNDER INVESTIGATION**

**Status**: UNRESOLVED
**Priority**: HIGH
**Next Action**: Requires different debugging approach

### **Symptom**

After import, S01 dashboard e_10 (Reference TEUI) shows incorrect value:
- Import: e_10 = 387.3 (expected ~172.7)
- After S11 Reference toggle: e_10 = 191.5
- After S13 toggles + recalc: e_10 = 176.7 (close to expected 172.7)

**Pattern**: Requires manual mode switches to complete calculations correctly.

### **S15 Error Pattern**

```
Section15.js:1423 [S15] Missing critical upstream Reference values:
ref_g_101, ref_d_101, ref_i_104
```

- S15's calculateReferenceModel() runs but cannot find upstream values from S11
- S15 falls back to initialization defaults
- S11 logs show it IS writing ref_ values, but S15 doesn't see them

### **What We Tried**

**Skip logic for S11 U-values** (g_88-g_93):
- Applied same ReferenceValues overlay skip logic as S13
- Result: ❌ Did NOT resolve cascade issue
- Conclusion: S11 problem is different from S13 slider issue

### **Why S11 Differs from S13**

1. **S10 area sync dependency**: S11 syncs areas from S10 before calculating
2. **Calculation cascade timing**: S15 may run before S11 completes
3. **U-values**: May have additional dependencies or timing issues
4. **Not just ReferenceValues**: Issue may be calculation order, not contamination

### **Next Investigation Steps**

1. **Cascade timing analysis**:
   - Add timestamp logging to S11.calculateReferenceModel()
   - Add timestamp logging to S15.calculateReferenceModel()
   - Verify execution order: Does S15 run before S11 completes?

2. **Dependency tracking**:
   - Check if S10 area sync interferes with S11 calculations
   - Verify ref_g_101, ref_d_101, ref_i_104 write/read sequence
   - Log StateManager state at key points

3. **Mode-dependent behavior**:
   - Import with S11 in Target mode → Reference calculations incomplete
   - Import with S11 in Reference mode → Target calculations incomplete
   - Suggests mode-specific calculation blocking or order issue

---

## 🔧 **ARCHITECTURAL NOTES**

### **ReferenceValues Overlay Pattern**

Certain fields in Reference model should ALWAYS use values from ReferenceValues.js based on current reference standard (d_13), NOT imported from Excel.

**Fields with ReferenceValues Overlay:**
- **S13**: f_113 (HSPF), d_118 (ERV), j_115 (AFUE) - ✅ FIXED
- **S11**: g_88-g_93 (U-values) - ❌ CASCADE ISSUE PERSISTS

**How it should work:**
1. Page load: ReferenceState.setDefaults() loads ReferenceValues based on d_13
2. Import: syncFromGlobalState() SKIPS overlay fields, preserves ReferenceValues
3. d_13 change: onReferenceStandardChange() updates ReferenceValues overlay
4. User edit: User can manually override (marked as "user-modified")

### **Pattern A Dual-State Architecture**

Sections 02-15 use isolated TargetState/ReferenceState objects:
- **TargetState**: User's project data (imported from REPORT sheet)
- **ReferenceState**: Reference model data (uses ReferenceValues for overlay fields)
- **ModeManager**: Switches display without triggering calculations

**Import Flow** (FileHandler.js):
1. Mute listeners
2. Import Target data (REPORT sheet) → StateManager → TargetState.syncFromGlobalState()
3. Import Reference data (REFERENCE sheet) → StateManager → ReferenceState.syncFromGlobalState()
4. Unmute listeners
5. calculateAll() + refreshUI()

---

**Last Updated**: 2025-10-31 evening
**S13 Status**: ✅ FIXED & COMMITTED (a0b685d)
**S11 Status**: 🔍 REQUIRES FURTHER INVESTIGATION
