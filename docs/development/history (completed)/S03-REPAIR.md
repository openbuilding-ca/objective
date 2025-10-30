# S03 State Isolation Repair Guide

## 🚨 **CRITICAL ISSUE: S03 Target Mode State Contamination**

**Date**: September 17, 2025  
**Status**: UNRESOLVED - Multiple failed attempts  
**Severity**: CRITICAL - Prevents dual-state architecture compliance

---

## 📋 **ISSUE SUMMARY**

Section 03 (Climate Calculations) has **asymmetric state isolation**:

### ✅ **WORKING: Reference Mode**

- **Reference location changes** → Only Reference pipeline affected
- **e_10 changes correctly** (211 → 244.6 for Alexandria → Attawapiskat)
- **h_10 remains stable** ✅ **Perfect isolation**

### ❌ **BROKEN: Target Mode**

- **Target location changes** → Both Target AND Reference pipelines affected
- **h_10 changes** (expected)
- **e_10 also changes** (unexpected contamination) ❌

---

## 🔍 **DETAILED BEHAVIOR MATRIX**

| S03 Field                 | Target Mode                 | Reference Mode        | Notes                     |
| ------------------------- | --------------------------- | --------------------- | ------------------------- |
| **h_19 (City)**           | ❌ Contaminates both models | ✅ Isolates correctly | Climate data lookup issue |
| **h_20 (Present/Future)** | ❌ Contaminates both models | ❌ Does nothing       | Missing StateManager sync |
| **h_21 (Capacitance)**    | ✅ Isolates correctly       | ❌ Does nothing       | Missing StateManager sync |

---

## 🧪 **FAILED REPAIR ATTEMPTS**

### **Attempt 1: ModeManager.setValue() Source Parameter Fix**

**Theory**: Hardcoded "user-modified" source was causing contamination  
**Implementation**: Made source parameter dynamic  
**Result**: ❌ **INFINITE LOOP** - App became unresponsive  
**Lesson**: Original source handling was correct, don't modify core patterns

### **Attempt 2: Dedicated Engine Climate Data Lookup**

**Theory**: Target engine needed separate climate data like Reference engine  
**Implementation**: Added TargetState.getValue() climate lookup to calculateTargetModel()  
**Result**: ❌ **BROKE UI UPDATES** - HDD/CDD stopped updating in Target mode  
**Lesson**: updateWeatherData() is essential for UI updates

### **Attempt 3: Mode-Aware updateWeatherData()**

**Theory**: updateWeatherData() should only run appropriate engine  
**Implementation**: if/else to run calculateTargetModel() vs calculateReferenceModel()  
**Result**: ❌ **BROKE REFERENCE CALCULATIONS** - e_10 changes minimal (211→212 vs expected 211→245)  
**Lesson**: Both engines need to run for complete downstream data

### **Attempt 4: Unified Handler Pattern**

**Theory**: Match h_21 working pattern (calculateAll() vs updateWeatherData())  
**Implementation**: Replace updateWeatherData() with calculateAll() in h_19/h_20  
**Result**: ❌ **BROKE WEATHER DATA LOOKUP** - HDD/CDD stopped updating  
**Lesson**: Climate data lookup from ClimateValues.js is essential

### **Attempt 5: Hybrid Approach**

**Theory**: Keep updateWeatherData() but add missing StateManager sync  
**Implementation**: Restored updateWeatherData() + added StateManager publication to h_20/h_21  
**Result**: ❌ **CONTAMINATION PERSISTS** - Target changes still affect both models  
**Lesson**: The issue is deeper than event handler patterns

---

## 🎯 **ROOT CAUSE ANALYSIS**

### **Key Insights:**

1. **Reference Mode Works Perfectly** ✅

   - Proves the dual-state architecture is fundamentally sound
   - Reference calculations use Reference state correctly
   - No contamination vector in Reference direction

2. **Target Mode Has Hidden Contamination Vector** ❌

   - Target changes somehow affect Reference calculations
   - NOT an event handler issue (we've tried multiple patterns)
   - NOT a source parameter issue (that caused infinite loops)
   - Likely in `updateWeatherData()` function itself or calculation engine logic

3. **The `updateWeatherData()` Contamination Hypothesis**
   - This function is called from Target mode changes
   - It reads Target city data but applies to both engines
   - Even with mode-aware fixes, contamination persists
   - Suggests the issue is in how this function interacts with the calculation engines

---

## 🔬 **REQUIRED INVESTIGATION**

### **Next Steps for Fresh Agent:**

1. **Deep Trace `updateWeatherData()` Function**

   - Add logging to see exactly what data each engine receives
   - Verify Target engine gets Attawapiskat data, Reference gets Alexandria data
   - Check if shared variables contaminate between engines

2. **Compare Working vs Broken Patterns**

   - **h_21 (working)**: Direct calculateAll() - why does this isolate correctly?
   - **h_19/h_20 (broken)**: updateWeatherData() → calculateAll() - what's different?
   - **Reference mode (working)**: What makes Reference isolation perfect?

3. **Investigate Calculation Engine State Reading**

   - Verify calculateTargetModel() reads only from TargetState
   - Verify calculateReferenceModel() reads only from ReferenceState
   - Check for shared objects or variables between engines

4. **Test Minimal Reproduction**
   - Isolate the exact contamination point
   - Create minimal test case that reproduces the issue
   - Verify fix doesn't break other functionality

---

## 📚 **ARCHITECTURAL CONTEXT**

### **What We Know Works:**

- ✅ **S13 d_113 state isolation** - Fixed with dual StateManager listeners
- ✅ **S13 g_118 state isolation** - Fixed with Pattern 1 architecture
- ✅ **S03 Reference mode** - Perfect isolation already working
- ✅ **S03 h_21 Target mode** - Isolates correctly with calculateAll()

### **What Remains Broken:**

- ❌ **S03 h_19/h_20 Target mode** - Contaminates Reference calculations
- ❌ **S03 h_20/h_21 Reference mode** - Doesn't trigger downstream updates
- ❌ **S13 g_118 state isolation** - Still unresolved despite Pattern 1 refactor

### **Critical Success Pattern:**

The **h_21 Target mode pattern** is the only S03 dropdown that achieves perfect state isolation. Understanding why this works while h_19/h_20 don't is key to solving the contamination issue.

---

## 🎯 **RECOMMENDED APPROACH**

1. **Stop whack-a-mole fixes** - Each attempt breaks something else
2. **Deep dive into `updateWeatherData()` contamination mechanism**
3. **Create minimal test case** for isolated debugging
4. **Apply surgical fix** based on exact contamination point
5. **Test systematically** to ensure no regressions

**Success Criteria**: Target mode h_19 change (Alexandria → Attawapiskat) should:

- ✅ **Update S03 weather display** (HDD: 4600 → 7100)
- ✅ **Only affect h_10** (Target TEUI changes)
- ✅ **Leave e_10 stable** (Reference TEUI unchanged)

---

## 📁 **BASELINE FILES**

- **4011-Section03-OFFLINE.js**: Known working baseline (Reference mode perfect, Target mode contaminated)
- **4011-Section03.js**: Current working file (reverted to OFFLINE after failed attempts)

**CRITICAL**: Always revert to OFFLINE baseline after failed attempts to prevent cumulative technical debt.

---

## ✅ **PROPOSED SOLUTION: Architectural Alignment**

**Date**: September 17, 2025  
**Confidence**: HIGH - Aligns with proven Pattern A architecture

### **Diagnosis Confirmation**

The analysis in this document is correct. The root cause of the state contamination is the direct call to `updateWeatherData()` from the `d_19` (Province) and `h_19` (City) event handlers. This call performs calculations and state updates _before_ the `calculateAll()` function can orchestrate the dual engines, breaking the strict state isolation required by the architecture.

The working `h_21` (Capacitance) dropdown proves the correct pattern: **Event Handler → Update State → `calculateAll()`**.

### **The Solution: Integrate Climate Logic into the Dual Engines**

The solution is to refactor the climate data lookup logic out of the event-driven `updateWeatherData()` function and place it directly inside the `calculateTargetModel()` and `calculateReferenceModel()` engines. This ensures that climate data is always fetched using the correct, isolated state for each model.

---

### **Implementation Steps**

#### **Step 1: Create a Centralized, Mode-Agnostic Climate Data Function**

First, create a new helper function inside the S03 module. This function's only job is to take a state object (`TargetState` or `ReferenceState`), read the location settings from it, and return the corresponding climate data. It does not modify any state itself.

```javascript
/**
 * Fetches and calculates climate data based on the provided state object.
 * This function is pure; it reads from a state object but does not modify it.
 * @param {object} stateObject - Either TargetState or ReferenceState.
 * @returns {object} An object containing all calculated climate values.
 */
function getClimateDataForState(stateObject) {
  const province = stateObject.getValue("d_19") || "ON";
  const city = stateObject.getValue("h_19") || "Alexandria";
  const timeframe = stateObject.getValue("h_20") || "Present";
  const cityData = ClimateDataService.getCityData(province, city);

  if (!cityData) {
    console.warn(`S03: No climate data for ${city}, ${province}`);
    return {}; // Return empty object if no data
  }

  const hdd =
    timeframe === "Future" ? cityData.HDD18_2021_2050 : cityData.HDD18;
  const cdd =
    timeframe === "Future" ? cityData.CDD24_2021_2050 : cityData.CDD24;

  const climateValues = {
    d_20: hdd,
    d_21: cdd,
    j_19: determineClimateZone(hdd),
    d_23: cityData.January_2_5,
    d_24: cityData.July_2_5_Tdb,
    l_22: cityData["Elev ASL (m)"],
  };

  // Add other derived climate values here if necessary...

  return climateValues;
}
```

#### **Step 2: Integrate Climate Logic into `calculateTargetModel()`**

Modify `calculateTargetModel` to call the new helper function at the beginning. It will then use the returned data to update its own (`TargetState`) values before proceeding with other calculations.

```javascript
function calculateTargetModel() {
  // Ensure Target engine always uses Target state regardless of UI mode
  const originalMode = ModeManager.currentMode;
  try {
    ModeManager.currentMode = "target";

    // ✅ 1. Get climate data based on TargetState
    const climateValues = getClimateDataForState(TargetState);

    // ✅ 2. Update TargetState with the new climate data
    Object.entries(climateValues).forEach(([key, value]) => {
      TargetState.setValue(key, value, "calculated");
    });

    // ✅ 3. Proceed with the rest of the original calculations
    calculateHeatingSetpoint();
    calculateCoolingSetpoint_h24();
    calculateTemperatures();
    calculateGroundFacing();
    updateCoolingDependents();
    updateCriticalOccupancyFlag();
  } finally {
    // Restore prior UI mode
    ModeManager.currentMode = originalMode;
  }
}
```

#### **Step 3: Integrate Climate Logic into `calculateReferenceModel()`**

Modify `calculateReferenceModel` to do the same, but for `ReferenceState`. This ensures perfect isolation.

```javascript
function calculateReferenceModel() {
  try {
    // ✅ 1. Get climate data based on ReferenceState
    const climateValues = getClimateDataForState(ReferenceState);

    // ✅ 2. Update ReferenceState with the new climate data
    Object.entries(climateValues).forEach(([key, value]) => {
      ReferenceState.setValue(key, value, "calculated");
    });

    // Force Reference mode temporarily for other calculations
    const originalMode = ModeManager.currentMode;
    ModeManager.currentMode = "reference";

    // ✅ 3. Proceed with the rest of the original calculations
    calculateHeatingSetpoint();
    calculateCoolingSetpoint_h24();
    calculateTemperatures();
    calculateGroundFacing();
    updateCoolingDependents();

    // Restore original mode
    ModeManager.currentMode = originalMode;

    // ✅ 4. Store all Reference results for downstream sections
    storeReferenceResults();
  } catch (error) {
    console.error("Error during Section 03 calculateReferenceModel:", error);
  }
}
```

#### **Step 4: Simplify Event Handlers and Remove `updateWeatherData()`**

Finally, simplify the dropdown event handlers to match the working `h_21` pattern and remove the now-redundant `updateWeatherData` function entirely.

```javascript
// In initializeEventHandlers():

// ✅ SIMPLIFIED City dropdown change handler
newCityDropdown.addEventListener("change", function () {
  const selectedCity = this.value;
  ModeManager.setValue("h_19", selectedCity, "user"); // Just update state
  calculateAll(); // Let the engines handle the logic
});

// ✅ SIMPLIFIED Province dropdown change handler
newProvinceDropdown.addEventListener("change", function (e) {
  const provinceValue = e?.target?.value;
  if (!provinceValue) return;
  ModeManager.setValue("d_19", provinceValue, "user"); // Just update state
  updateCityDropdown(provinceValue); // Update UI for cities

  // IMPORTANT: The city dropdown will auto-select, firing its own change event
  // which will trigger calculateAll(). No need to call it here.
  // If it didn't, we would add calculateAll() here too.
});

// ❌ REMOVE or comment out the old function
/*
function updateWeatherData() {
    // ... all old logic is now inside the calculation engines ...
}
*/
```

### **Why This Solution Works**

- **Architectural Compliance**: It forces all calculations, including climate data lookups, to happen within the orchestrated `calculateAll()` flow, respecting the dual-engine pattern.
- **Perfect State Isolation**: `calculateTargetModel` now _only_ knows about `TargetState`, and `calculateReferenceModel` _only_ knows about `ReferenceState`. There is no shared function that can be contaminated by the UI mode.
- **Single Responsibility**: The new `getClimateDataForState` function does one thing: it fetches data. The engine functions are responsible for updating their own state. Event handlers are responsible for capturing user input.
- **Meets Success Criteria**:
  - ✅ Target location change will update S03 weather display.
  - ✅ It will **only affect `h_10`** because `calculateReferenceModel` will run using the unchanged `ReferenceState` (still Alexandria).
  - ✅ **`e_10` will remain stable** as a result.

---

## 🔍 **ADDITIONAL IMPLEMENTATION CONSIDERATIONS**

**Date**: September 17, 2025  
**Reviewer**: Claude  
**Status**: Critical additions based on architectural review

### **1. Pattern 1 (Temporary Mode Switching) Alignment**

The proposed solution correctly implements **Pattern 1** from 4012-CHEATSHEET.md. This is crucial because S03 has external dependencies and complex climate data lookups. The temporary mode switching ensures all helper functions become mode-aware automatically.

**Key Pattern 1 Requirements Met:**

- ✅ Uses `try/finally` blocks to ensure mode restoration
- ✅ Mode switching happens at the engine level, not in event handlers
- ✅ All existing helper functions (`calculateHeatingSetpoint`, etc.) automatically inherit correct mode

### **2. Critical Missing Elements to Address**

#### **2.1 StateManager Publication**

The current solution updates local state but may miss StateManager publication. Add this to both engine functions:

```javascript
// After updating local state with climate values
Object.entries(climateValues).forEach(([key, value]) => {
  // Update local state
  TargetState.setValue(key, value, "calculated");

  // ✅ CRITICAL: Also update StateManager for cross-section access
  if (ModeManager.currentMode === "target") {
    window.TEUI.StateManager.setValue(key, value.toString(), "calculated");
  }
});
```

#### **2.2 The h_20 (Present/Future) Handler**

The repair document correctly identifies h_20 as broken but doesn't address its fix. The h_20 dropdown needs the same treatment:

```javascript
// In initializeEventHandlers():
const timeframeDropdown = document.querySelector('[data-field-id="h_20"]');
if (timeframeDropdown) {
  timeframeDropdown.addEventListener("change", function () {
    const value = this.value;
    ModeManager.setValue("h_20", value, "user-modified");
    calculateAll(); // ✅ Let engines handle climate updates
  });
}
```

#### **2.3 ModeManager.updateCalculatedDisplayValues()**

The solution must ensure DOM updates happen after calculations:

```javascript
// Add to the end of calculateAll():
function calculateAll() {
  calculateTargetModel();
  calculateReferenceModel();

  // ✅ CRITICAL: Update DOM with calculated values
  ModeManager.updateCalculatedDisplayValues();
}
```

### **3. State Publication for Downstream Sections**

The existing `storeReferenceResults()` function needs to include ALL climate values that downstream sections depend on:

```javascript
function storeReferenceResults() {
  const referenceResults = {
    // Existing values...
    h_19: ReferenceState.getValue("h_19"), // City
    d_19: ReferenceState.getValue("d_19"), // Province
    h_20: ReferenceState.getValue("h_20"), // Timeframe
    d_20: ReferenceState.getValue("d_20"), // HDD
    d_21: ReferenceState.getValue("d_21"), // CDD
    j_19: ReferenceState.getValue("j_19"), // Climate Zone
    d_23: ReferenceState.getValue("d_23"), // Design Temp Heat
    d_24: ReferenceState.getValue("d_24"), // Design Temp Cool
    l_22: ReferenceState.getValue("l_22"), // Elevation
    // ... other climate values
  };

  Object.entries(referenceResults).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      window.TEUI.StateManager.setValue(
        `ref_${key}`,
        value.toString(),
        "calculated",
      );
    }
  });
}
```

### **4. Initialization Sequence Consideration**

The current `onSectionRendered()` function calls `updateWeatherData()` during initialization. After implementing the solution, ensure initialization still works:

```javascript
function onSectionRendered() {
  console.log("[S03] Section rendered, initializing...");

  // Initialize states
  ModeManager.initialize();

  // Set initial province/city if needed
  if (!TargetState.getValue("d_19")) {
    TargetState.setValue("d_19", "ON");
    TargetState.setValue("h_19", "Alexandria");
  }
  if (!ReferenceState.getValue("d_19")) {
    ReferenceState.setValue("d_19", "ON");
    ReferenceState.setValue("h_19", "Alexandria");
  }

  // Calculate both models with initial values
  calculateAll();

  // Inject header controls
  injectHeaderControls();
}
```

### **5. Testing Protocol**

After implementation, test the following sequence:

1. **Load app** → Verify both h_10 and e_10 show correct defaults
2. **In Target mode**: Change city to Attawapiskat
   - ✅ h_10 should change to ~105.8
   - ✅ e_10 should remain at 211.6
   - ✅ HDD display should show ~7100
3. **Switch to Reference mode**:
   - ✅ City dropdown should still show Alexandria
   - ✅ HDD display should show ~4600
   - ✅ e_10 should still be 211.6
4. **In Reference mode**: Change city to Toronto
   - ✅ e_10 should now change
   - ✅ h_10 should remain at ~105.8
5. **Switch back to Target mode**:
   - ✅ City should show Attawapiskat
   - ✅ Values should match step 2

### **6. Risk Assessment**

**Low Risk**: This solution aligns with proven patterns from S02, S10, and S13 implementations.

**Potential Issues**:

- Climate data loading may have timing issues if `ClimateDataService` is async
- The `updateCityDropdown()` function needs careful handling to avoid triggering extra events
- Existing listeners from other sections expecting `updateWeatherData` calls need verification

### **7. Alternative Consideration**

If the above solution proves too invasive, an alternative "minimal change" approach exists:

Make `updateWeatherData()` mode-aware by wrapping it with Pattern 1:

```javascript
function updateWeatherData() {
    // Save original values for both states
    const targetLocation = {
        province: TargetState.getValue("d_19"),
        city: TargetState.getValue("h_19")
    };
    const referenceLocation = {
        province: ReferenceState.getValue("d_19"),
        city: ReferenceState.getValue("h_19")
    };

    // Update Target model
    ModeManager.currentMode = "target";
    updateWeatherDataForMode(targetLocation);

    // Update Reference model
    ModeManager.currentMode = "reference";
    updateWeatherDataForMode(referenceLocation);

    // Restore UI mode
    ModeManager.currentMode = // ... original mode
}
```

However, the main solution is preferred as it better aligns with the architectural principles.

---

## 📊 **ARCHITECTURAL CLARIFICATION: S03 as Data Provider**

**Date**: September 17, 2025  
**Critical Understanding**: S03's role in the application architecture

### **S03's Primary Function**

S03 is fundamentally a **data provider section**, not a calculation engine. Its core responsibilities are:

1. **Fetch climate data** from `ClimateValues.js` based on location selections
2. **Populate StateManager** with HDD, CDD, design temperatures, elevation, etc.
3. **Provide this data** for downstream sections to consume

S03's calculations are minimal:

- Temperature setpoints based on occupancy type
- Simple ground temperature calculations
- Climate zone determination from HDD

### **Critical Sequencing for the Solution**

The proposed solution MUST follow this sequence to ensure proper data flow:

```javascript
function calculateTargetModel() {
  const originalMode = ModeManager.currentMode;
  try {
    ModeManager.currentMode = "target";

    // 1. FIRST: Get climate data based on TargetState location
    const climateValues = getClimateDataForState(TargetState);

    // 2. SECOND: Update both local state AND StateManager immediately
    Object.entries(climateValues).forEach(([key, value]) => {
      TargetState.setValue(key, value);
      // ✅ CRITICAL: Publish to StateManager so downstream sections can access
      window.TEUI.StateManager.setValue(key, value.toString(), "calculated");
    });

    // 3. THIRD: Update the UI display for climate values
    ModeManager.refreshUI(); // Updates DOM to show new HDD, CDD, etc.

    // 4. FOURTH: Run the minimal calculations that depend on climate data
    calculateHeatingSetpoint();
    calculateCoolingSetpoint_h24();
    calculateTemperatures();
    updateCoolingDependents();
    updateCriticalOccupancyFlag();
  } finally {
    ModeManager.currentMode = originalMode;
  }
}
```

### **Why This Sequence Matters**

1. **Climate data fetching and StateManager updates MUST happen first**

   - Ensures downstream sections have immediate access to new values
   - Prevents race conditions where sections read stale data

2. **UI updates can happen concurrently or immediately after state updates**

   - Since StateManager is updated, DOM can be refreshed anytime after
   - The `refreshUI()` call ensures climate values display immediately

3. **S03's minimal calculations should happen last**
   - These depend on climate data being already available in state
   - Setpoints and temperatures are derived from the primary climate data

### **Implementation Checklist for Data Provider Pattern**

- [ ] Climate data fetch returns ALL values downstream sections need:

  - HDD (`d_20`), CDD (`d_21`)
  - Design temperatures (`d_23`, `d_24`)
  - Climate zone (`j_19`)
  - Elevation (`l_22`)
  - Location identifiers (`d_19`, `h_19`, `h_20`)

- [ ] StateManager publication happens IMMEDIATELY after data fetch
- [ ] Both local state AND StateManager are updated
- [ ] UI refresh occurs to display new climate values
- [ ] Reference engine stores all values with `ref_` prefix

### **Success Validation**

The solution is correct when:

1. **Changing Target location** immediately updates HDD/CDD display in UI
2. **StateManager contains** new climate values for downstream access
3. **Reference values remain unchanged** (perfect state isolation)
4. **Downstream sections** receive correct climate data without delay

This architecture ensures S03 fulfills its role as the authoritative source of climate data for the entire application while maintaining dual-state isolation.
