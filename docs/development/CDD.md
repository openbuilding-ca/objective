# CDD User-Editable Field - Simple Implementation

**Created**: 2025-10-31
**Updated**: 2025-10-31 (Radically simplified)
**Status**: 📋 **READY FOR IMPLEMENTATION** - Simple editable field pattern
**Goal**: Make Section 03 CDD field (d_21) user-editable with climate data defaults

---

## 📋 **OBJECTIVE**

Make the CDD (Cooling Degree Days) field in Section 03 behave like Section 11's U-value fields (g_88-g_93):

### **Requirements:**
1. **Always user-editable** - Field never locks (like m_19 "Days Cooling")
2. **Climate data as default** - Loads suggested value from ClimateValues.js based on Province/City
3. **User can override** - Any edits persist in TargetState/ReferenceState until location changes
4. **Location change** - New climate data overwrites user value (new suggested default)
5. **Missing data** - Shows "Unavailable" as placeholder text, user can enter value
6. **Mode switching** - Target and Reference track independently (dual-state already works)

---

## 💡 **KEY INSIGHT: FOLLOW SECTION 11 PATTERN**

**Section 11 already solves this!** Fields g_88-g_93 are:
- Type: `"editable"` (always user-editable, never lock)
- Have defaults from ReferenceValues.js (like our ClimateValues.js)
- User can override anytime
- No complex locking or preservation logic needed

**Apply the same pattern to d_21!**

---

## ✅ **SIMPLE SOLUTION (3 Changes)**

### **Change 1: Make Field Editable (Line ~788)**

Change field type from `"derived"` to `"editable"`:

```javascript
d: {
  fieldId: "d_21",
  type: "editable",  // ✅ Changed from "derived" - always editable like g_88
  value: "196",      // Default for Alexandria, ON
  section: "climateCalculations",
  classes: ["user-input", "editable"],  // ✅ Add styling classes
},
```

### **Change 2: Climate Data Returns "Unavailable" (Line ~626)**

When CDD unavailable, return "Unavailable" instead of "N/A":

```javascript
const climateValues = {
  d_20: hdd !== null && hdd !== undefined && hdd !== 666 ? hdd : "N/A",
  d_21: cdd !== null && cdd !== undefined && cdd !== 666 ? cdd : "Unavailable", // ✅ Changed
  j_19: determineClimateZone(hdd),
  d_23: selectedJanTemp,
  d_24: cityData.July_2_5_Tdb || "34",
  l_22: cityData["Elev ASL (m)"] || "80",
};
```

### **Change 3: Add d_21 to TargetState/ReferenceState Defaults**

In `setDefaults()` for both states (lines ~36-56 and ~114-138), add d_21:

**TargetState.setDefaults():**
```javascript
setDefaults: function () {
  this.state = {
    d_19: getFieldDefault("d_19"), // Province
    h_19: getFieldDefault("h_19"), // City
    h_20: getFieldDefault("h_20"), // Timeframe
    h_21: getFieldDefault("h_21"), // Capacitance
    m_19: getFieldDefault("m_19"), // Cooling days
    l_20: getFieldDefault("l_20"), // Summer night temp
    l_21: getFieldDefault("l_21"), // Summer RH%
    l_22: getFieldDefault("l_22"), // Elevation
    l_24: getFieldDefault("l_24"), // Cooling override
    i_21: getFieldDefault("i_21"), // Capacitance %
    d_21: getFieldDefault("d_21"), // ✅ ADD: CDD (user-editable with climate defaults)
  };
}
```

**ReferenceState.setDefaults():** Same change.

---

## 🎯 **HOW IT WORKS**

### **On Page Load:**
1. TargetState/ReferenceState initialize with d_21 from localStorage OR field default (196)
2. `calculateAll()` runs → fetches climate data for selected location
3. Climate CDD value updates TargetState/ReferenceState (replaces default)
4. User sees climate value in editable field

### **When User Edits CDD:**
1. User clicks field, enters new value (e.g., 250)
2. `handleEditableBlur()` saves to TargetState → localStorage
3. Calculations run with user value
4. Value persists across page reloads

### **When User Changes Location:**
1. Province/City dropdown changes
2. `calculateAll()` runs → fetches NEW climate data
3. New CDD overwrites user value (new suggested default)
4. If no climate data → shows "Unavailable", user can enter value

### **Mode Switching:**
1. Target has user CDD = 250 (editable)
2. Reference has climate CDD = 196 (editable)
3. Switch modes → each shows its own value
4. No cross-contamination (dual-state isolation works)

---

## 🧪 **TESTING PROTOCOL**

### **Test 1: Default Climate Data**
1. Fresh load → Alexandria, ON
2. ✅ d_21 shows "196" (climate default)
3. ✅ Field is editable (blue border on click)

### **Test 2: User Override**
1. Click d_21, change to "250"
2. ✅ Calculations use 250
3. ✅ Refresh page → 250 persists

### **Test 3: Location Change with Data**
1. User CDD = 250
2. Change city to Ottawa
3. ✅ d_21 shows "230" (Ottawa's climate CDD)
4. ✅ User value overwritten

### **Test 4: Location Change without Data**
1. Change to city without CDD
2. ✅ d_21 shows "Unavailable"
3. ✅ Field editable, user can enter value

### **Test 5: Mode Isolation**
1. Target: User CDD = 250
2. Reference: Climate CDD = 196
3. ✅ Switch modes → each shows its value
4. ✅ No cross-contamination

---

## 📚 **ARCHITECTURAL PATTERN**

**This follows existing patterns:**
- ✅ **Section 11 Pattern**: g_88-g_93 U-values (always editable, ReferenceValues defaults)
- ✅ **m_19 "Days Cooling"**: User-editable field with suggested default
- ✅ **Dual-State Architecture**: TargetState/ReferenceState handle isolation
- ✅ **No special logic**: Field behaves like any other editable field

**No complex features needed:**
- ❌ No dynamic locking/unlocking
- ❌ No preservation logic in calculation engines
- ❌ No custom event handlers
- ❌ No state tracking metadata

---

## 📋 **IMPLEMENTATION STEPS**

1. **Change 1**: Update field definition (line ~788) - type: "editable", add classes
2. **Change 2**: Update climate fallback (line ~626) - "N/A" → "Unavailable"
3. **Change 3**: Add d_21 to TargetState.setDefaults() (line ~36-56)
4. **Change 4**: Add d_21 to ReferenceState.setDefaults() (line ~114-138)
5. **Test**: Run 5 test scenarios above
6. **Verify**: No state contamination, values persist correctly

---

## 🎯 **SUCCESS CRITERIA**

### **Functional:**
- ✅ Field always editable (never locks)
- ✅ Climate data loads as suggested default
- ✅ User can override and value persists
- ✅ Location changes overwrite with new climate data
- ✅ "Unavailable" shows when climate data missing
- ✅ Target/Reference track independently

### **Architectural:**
- ✅ No special logic beyond existing patterns
- ✅ Reuses existing infrastructure (handleEditableBlur, TargetState)
- ✅ Follows Section 11 editable field pattern
- ✅ No state contamination

### **Simplicity:**
- ✅ Only 3-4 small changes
- ✅ No new functions
- ✅ No complex logic
- ✅ Easy to maintain

---

**Status**: Ready for implementation with radically simplified approach
