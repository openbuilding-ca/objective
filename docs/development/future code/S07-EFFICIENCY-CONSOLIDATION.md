# S07 EFFICIENCY CONSOLIDATION - WORKPLAN

**Created**: 2025-11-29
**Branch**: `S07-TWEAK`
**Parent Branch**: `2025-11-27-UI-TWEAKS`
**Status**: 🔧 In Progress

---

## 🎯 OBJECTIVE

Consolidate S07's dual efficiency factors (`d_52` + `k_52`) into the single efficiency field `d_52`, with slider display from 50-450 if d_51=Heatpump, 50-100 if d_51=Electric, and  50-98% if d_51= Gas or Oil, with an automatically parsed field at `e_52` (98% becomes 0.98) for calculating emissions, fuel volumes, etc. as required to eliminate user confusion and potential state mixing. All formulas will reference only `e_52` (COP/EF/AFUE efficiency), and `d_52` slider input will be the sole user interface for defining hot water equipment efficiency.

---

## 📋 CURRENT STATE ANALYSIS

### **Existing Field Architecture:**

1. **`d_52`** (User Input Slider - KEEP)
   - Range: 50-450% (dynamic based on `d_51` system type)
   - Heatpump: 100-450% (step 10)
   - Gas/Oil: 50-98% (step 1)
   - Electric: 90-100% (step 1)
   - Location: Row 52, Column D

2. **`e_52`** (Calculated COP- KEEP)
   - Formula: `d_52 / 100`
   - Example: 300% → 3.00 COP
   - Location: Row 52, Column E
   - Label: "COPdhw"

3. **`k_52`** (AFUE Input - Gas/Oil Only)
   - Type: Editable field
   - Default: 0.90
   - Location: Row 52, Column K
   - Label: "W.4.2 AFUE"
   - **⚠️ TO BE RETIRED**

### **Current Formula Dependencies:**

**Formulas Reading `k_52` or `ref_k_52`:**
- Line 1072: `calculateHeatingSystem()` - `const afue = getSectionNumericValue("k_52", 0.9, isReferenceCalculation);`
- Line 1126: `calculateEmissionsAndLosses()` - `const afue = getSectionNumericValue("k_52", 0.9, isReferenceCalculation);`
- Line 619: Field definition - `dependencies: ["d_51", "j_52", "d_53", "k_52"]` for `e_51`
- Line 630: Field definition - `dependencies: ["d_51", "j_50", "d_52", "k_52"]` for `j_51`
- Line 774: Field definition - `dependencies: ["d_51", "j_52", "k_52"]` for `j_54`
- Line 782: Field definition - `dependencies: ["d_51", "j_52", "d_53", "k_52"]` for `k_54`

**Formulas Reading `d_52`:**
- Line 1067-1071: `calculateHeatingSystem()` - `const efficiencyInput = getSectionNumericValue("d_52", 300, isReferenceCalculation);`
- Line 1077: `const efficiency = efficiencyInput / 100;` → stores as `e_52`
- Line 1186-1189: `calculateEmissionsAndLosses()` - `const efficiency = getSectionNumericValue("e_52", 1, isReferenceCalculation);`

---

## 🔧 IMPLEMENTATION PLAN

### **PHASE 1: FORMULA CONSOLIDATION** ⚡ (Target vs Reference Models)

**Task 1.1**: Replace `k_52` reads with `e_52` in `calculateHeatingSystem()`
- **Location**: Lines 1067-1084
- **Current Pattern**:
  ```javascript
  const efficiencyInput = getSectionNumericValue("d_52", 300, isReferenceCalculation);
  const afue = getSectionNumericValue("k_52", 0.9, isReferenceCalculation);
  const efficiency = efficiencyInput / 100;
  setSectionValue("e_52", efficiency, isReferenceCalculation);

  const netThermalDemand =
    systemType === "Heatpump" || systemType === "Electric"
      ? hotWaterEnergyDemand / efficiency
      : hotWaterEnergyDemand / afue;
  ```
- **New Pattern**:
  ```javascript
  const efficiencyInput = getSectionNumericValue("d_52", 300, isReferenceCalculation);
  const efficiency = efficiencyInput / 100;
  setSectionValue("e_52", efficiency, isReferenceCalculation);

  // ✅ CONSOLIDATED: All system types that formerly used k_52 now use e_52 (efficiency/COP/AFUE unified)
  const netThermalDemand = hotWaterEnergyDemand / efficiency;
  ```
- **Dependencies**: Both Target and Reference models

**Task 1.2**: Replace `k_52` reads with `e_52` in `calculateEmissionsAndLosses()`
- **Location**: Lines 1126, 1141-1143, 1148-1150, 1182
- **Current Pattern**:
  ```javascript
  const afue = getSectionNumericValue("k_52", 0.9, isReferenceCalculation);

  if (systemType === "Gas") {
    gasVolume = afue > 0 ? netDemandAfterRecovery / (conversionFactor * afue) : 0;
  } else if (systemType === "Oil") {
    oilVolume = afue > 0 ? netDemandAfterRecovery / (conversionFactor * afue) : 0;
  }

  const exhaustLosses =
    systemType === "Gas" || systemType === "Oil"
      ? netDemandAfterRecovery * (1 - afue)
      : 0;
  ```
- **New Pattern**:
  ```javascript
  const efficiency = getSectionNumericValue("e_52", 1, isReferenceCalculation);

  if (systemType === "Gas") {
    gasVolume = efficiency > 0 ? netDemandAfterRecovery / (conversionFactor * efficiency) : 0;
  } else if (systemType === "Oil") {
    oilVolume = efficiency > 0 ? netDemandAfterRecovery / (conversionFactor * efficiency) : 0;
  }

  const exhaustLosses =
    systemType === "Gas" || systemType === "Oil"
      ? netDemandAfterRecovery * (1 - efficiency)
      : 0;
  ```
- **Dependencies**: Both Target and Reference models

---

### **PHASE 2: FIELD DEFINITION CLEANUP** 📋 (sectionRows)

**Task 2.1**: Update dependency arrays to remove `k_52` references, while ENSURING k_52 dependencies transfer to e_52 instead. 
- **Location**: Lines 619, 630, 774, 782
- **Changes**:
  - `e_51` dependencies: `["d_51", "j_52", "d_53", "k_52"]` → `["d_51", "j_52", "d_53", "e_52"]`
  - `j_51` dependencies: `["d_51", "j_50", "d_52", "k_52"]` → `["d_51", "j_50", "e_52"]`
  - `j_54` dependencies: `["d_51", "j_52", "k_52"]` → `["d_51", "j_52", "e_52"]`
  - `k_54` dependencies: `["d_51", "j_52", "d_53", "k_52"]` → `["d_51", "j_52", "d_53", "e_52"]`

**Task 2.2**: Remove `k_52` field definition from Row 52
- **Location**: Lines 677-685
- **Current**:
  ```javascript
  k: {
    fieldId: "k_52",
    type: "editable",
    value: "0.90",
    classes: ["user-input"],
    tooltip: true, // AFUE
    label: "AFUE (Gas/Oil Efficiency)",
  },
  l: { content: "W.4.2 AFUE", classes: ["text-left"] },
  ```
- **New**:
  ```javascript
  k: { content: "", classes: ["text-left"] },
  l: { content: "", classes: ["text-left"] },
  ```

---

### **PHASE 3: STATE MANAGEMENT CLEANUP** 🗂️ (Target & Reference States)

**Task 3.1**: Remove `k_52` from state initialization
- **Location**: Lines 115, 680 (ReferenceState.setDefaults)
- **Remove**:
  ```javascript
  this.values.k_52 = ModeManager.getFieldDefault("k_52") || "0.90";
  window.TEUI.StateManager.setValue("ref_k_52", this.values.k_52, "default");
  ```

**Task 3.2**: Remove `k_52` from syncFromGlobalState
- **Location**: Lines 33, 90 (fieldIds arrays)
- **Current**: `["d_49", "e_49", "e_50", "d_51", "d_52", "d_53", "k_52"]`
- **New**: `["d_49", "e_49", "e_50", "d_51", "d_52", "d_53"]`

---

### **PHASE 4: EVENT HANDLER CLEANUP** 🎛️ (UI Interactions)

**Task 4.1**: Remove `k_52` from editable fields list
- **Location**: Line 1704
- **Current**: `const editableFields = ["e_49", "e_50", "k_52"];`
- **New**: `const editableFields = ["e_49", "e_50"];`

**Task 4.2**: Remove `k_52` conditional formatting logic
- **Location**: Line 1519 (`handleEditableBlur`)
- **Current**: `const formatType = fieldId === "k_52" ? "number-2dp" : "number-2dp-comma";`
- **New**: `const formatType = "number-2dp-comma";` (no conditional needed)

---

### **PHASE 5: SLIDER RANGE VALIDATION** 🎚️ (Gas/Oil Constraints)

**Task 5.1**: Add validation to `handleDHWSourceChange()` for Gas/Oil efficiency limits
- **Location**: Lines 1603-1634 (system type change logic)
- **Enhancement**:
  ```javascript
  if (selectedSource === "Gas" || selectedSource === "Oil") {
    newMinValue = 50;
    newMaxValue = 98;
    newStep = 1;
    newValue = preservedValue || 90; // Use preserved value or default to 90

    // ✅ NEW: Validate preserved value is within Gas/Oil range
    if (preservedValue && (preservedValue < 50 || preservedValue > 98)) {
      console.warn(`[S07] Preserved value ${preservedValue}% outside Gas/Oil range (50-98%), resetting to 90%`);
      newValue = 90;
    }
  }
  ```

**Task 5.2**: Add validation to `handleSliderChange()` for real-time enforcement
- **Location**: Lines 1564-1582
- **Enhancement**:
  ```javascript
  if (fieldId === "d_52") {
    const systemType = ModeManager.getValue("d_51") || "Heatpump";
    const numValue = parseFloat(value);

    // ✅ NEW: Enforce Gas/Oil limits
    if ((systemType === "Gas" || systemType === "Oil") && (numValue < 50 || numValue > 98)) {
      console.warn(`[S07] ${systemType} efficiency ${numValue}% outside allowed range (50-98%)`);
      // Note: Slider already constrained by min/max attributes, this is defensive
    }
  }
  ```

---

### **PHASE 6: CONDITIONAL GHOSTING REMOVAL** 👻 (UI Visibility)

**Task 6.1**: Remove `k_52` ghosting logic from `updateSection7Visibility()`
- **Location**: Lines 1481 (`setFieldGhosted("k_52", !isFossilFuel);`)
- **Remove**: Entire line (k_52 field no longer exists)

**Task 6.2**: Remove efficiency slider ghosting to enable unified interface
- **Location**: Lines 1479-1480
- **Current**:
  ```javascript
  setFieldGhosted("d_52", isFossilFuel);
  setFieldGhosted("e_52", isFossilFuel);
  ```
- **Action**: Remove both `setFieldGhosted()` calls for d_52 and e_52
- **Rationale**: Users can now adjust efficiency 50-98% for Gas/Oil via slider (with constraints enforced by slider min/max attributes set in `handleDHWSourceChange()`)

**Task 6.3**: Preserve existing emissions field ghosting logic
- **Location**: Lines 1472-1478 (updateSection7Visibility)
- **CRITICAL**: **DO NOT REMOVE** existing ghosting for:
  - `e_51` (Gas Volume) - ghosted when NOT Gas
  - `k_54` (Oil Volume) - ghosted when NOT Oil
  - Gas emissions fields - ghosted when Heatpump/Electric
  - Oil emissions fields - ghosted when Gas
- **Action**: Keep all conditional ghosting EXCEPT d_52/e_52

---

### **PHASE 7: STATEMANAGER PUBLICATION CLEANUP** 🌐 (Cross-Section Dependencies)

**Task 7.1**: Remove `k_52` from `handleDHWSourceChange()` StateManager writes
- **Location**: Lines 1640-1652
- **Current Pattern**:
  ```javascript
  if (selectedSource === "Gas" || selectedSource === "Oil") {
    const afueValue = (newValue / 100).toFixed(2);
    window.TEUI.StateManager.setValue("k_52", afueValue, "system-update");
    window.TEUI.StateManager.setValue(`ref_k_52`, afueValue, "system-update");
  }
  ```
- **New Pattern**: Remove entirely (efficiency now handled through d_52 → e_52 flow)

**Task 7.2**: Ensure `e_52` is published for both Target and Reference models
- **Location**: Lines 913-920 (setSectionValue helper)
- **Verify**: Already publishes to StateManager ✅ (no changes needed)

**Task 7.3**: Remove `k_52` from calculated fields storage arrays
- **Location**: Lines 1363-1381 (calculateTargetModel) and 1406-1424 (calculateReferenceModel)
- **Current**: `targetFields` and `referenceFields` arrays include `"k_52"`
- **New**: Remove `"k_52"` from both arrays

---

### **PHASE 8: REFERENCE MODEL DEFAULTS** 🔧 (Reference-Specific Values)

**Task 8.1**: Update ReferenceState.setDefaults() to set d_52 for Reference building code
- **Location**: Lines 105-160 (Section07.js)
- **Current**:
  ```javascript
  this.values.d_51 = "Electric"; // Reference default: Electric system
  this.values.d_52 = "90"; // Reference default: 90% efficiency
  ```
- **Action**: Keep as "90" for Reference model compliance baseline ✅ (Confirmed: Electric system default 90% = 0.90 COP)

**Task 8.2**: Update Section18.js (Parallel Coordinates) to write d_52 instead of k_52
- **Location**: src/sections/Section18.js (ParallelCoordinates implementation)
- **Action**: Find any `k_52` or `ref_k_52` writes and replace with `d_52`/`ref_d_52`
- **Files to Check**: pcConfig.js and related parallel coordinates configuration

**Task 8.3**: Update import/export infrastructure for k_52 retirement
- **CSV Export Logic**: Remove k_52 from CSV export (FileHandler.js)
- **Excel Import Logic - Modern Files**: If k_52 cell is empty, skip (normal case for new files)
- **Excel Import Logic - Legacy Files**: If k_52 has a value AND d_51 is "Gas" or "Oil":
  ```javascript
  // Legacy k_52 import handling (Gas/Oil only)
  if (k_52_value && (d_51 === "Gas" || d_51 === "Oil")) {
    // Convert AFUE decimal (0.94) to percentage (94%)
    d_52 = k_52_value * 100;
    // Example: k_52=0.94 → d_52=94%
  }
  ```
- **Rationale**: Legacy Excel files may have k_52 values (0.90, 0.94, etc.) for Gas/Oil systems. Convert to percentage for d_52 slider.
- **Edge Case**: If k_52 exists but d_51 is Heatpump/Electric, ignore k_52 (use d_52 from file or default)
- **Note**: No Excel export functionality exists, only CSV export needs updating 
---

## 🧪 TESTING PROTOCOL

### **Test 1: Heatpump System (Target Model)**
1. Set `d_51` = "Heatpump"
2. Adjust `d_52` slider to 300%
3. **Expected**: `e_52` = 3.00, calculations use 3.00 for COP
4. **Verify**: `j_51` (Net Thermal Demand) = `j_50 / 3.00`

### **Test 2: Gas System (Target Model)**
1. Set `d_51` = "Gas"
2. Adjust `d_52` slider to 94%
3. **Expected**: `e_52` = 0.94, calculations use 0.94 for AFUE
4. **Verify**:
   - `j_51` (Net Thermal Demand) = `j_50 / 0.94`
   - `e_51` (Gas Volume) calculated using efficiency 0.94
   - `j_54` (Exhaust) = `j_52 * (1 - 0.94)`

### **Test 3: Oil System (Target Model)**
1. Set `d_51` = "Oil"
2. Adjust `d_52` slider to 85%
3. **Expected**: `e_52` = 0.85, calculations use 0.85 for AFUE
4. **Verify**: `k_54` (Oil Volume) calculated using efficiency 0.85

### **Test 4: Electric System (Target Model)**
1. Set `d_51` = "Electric"
2. Adjust `d_52` slider to 95%
3. **Expected**: `e_52` = 0.95, calculations use 0.95 for efficiency

### **Test 5: Reference Model Isolation**
1. Switch to Reference mode
2. Set `ref_d_51` = "Gas"
3. Adjust `ref_d_52` slider to 90%
4. **Expected**:
   - `ref_e_52` = 0.90
   - Reference calculations use 0.90
   - Target values unchanged
5. **Verify**: No Target contamination

### **Test 6: Mode Switching Persistence**
1. Set Target: d_51="Heatpump", d_52=300%
2. Set Reference: d_51="Gas", d_52=90%
3. Switch between modes
4. **Expected**: Both modes retain independent values
5. **Verify**: Slider positions and calculations persist correctly

### **Test 7: System Type Change Preservation**
1. Set d_51="Heatpump", d_52=350%
2. Change to d_51="Gas"
3. **Expected**: d_52 resets to 90% (or preserved value if in valid range)
4. Change back to d_51="Heatpump"
5. **Expected**: d_52 returns to 350% (preserved value)

### **Test 8: Import/Export Functionality**

**Export Test:**
1. **CSV Export**: Verify k_52 is NOT included in exported CSV files
   - Export a project with all fuel types
   - **Expected**: CSV header and data rows do not contain k_52 column

**Import Tests:**
2. **Modern Excel Import** (k_52 cell empty):
   - Import Excel file with d_52=300%, k_52 cell empty
   - **Expected**: d_52=300% imported, e_52=3.00 calculated, k_52 ignored

3. **Legacy Excel Import - Gas System** (k_52 has value):
   - Import Excel file with d_51="Gas", k_52=0.94, d_52 blank or outdated
   - **Expected**: d_52 set to 94% (k_52 × 100), e_52=0.94 calculated
   - **Verify**: Gas calculations use efficiency 0.94

4. **Legacy Excel Import - Oil System** (k_52 has value):
   - Import Excel file with d_51="Oil", k_52=0.85, d_52 blank or outdated
   - **Expected**: d_52 set to 85% (k_52 × 100), e_52=0.85 calculated

5. **Legacy Excel Import - Heatpump System** (k_52 ignored):
   - Import Excel file with d_51="Heatpump", k_52=0.90 (legacy value), d_52=300%
   - **Expected**: d_52=300% used (k_52 ignored for non-fossil fuels), e_52=3.00 

---

## ✅ SUCCESS CRITERIA

- [ ] **Phase 1**: All formulas reference `e_52` instead of `k_52`
- [ ] **Phase 2**: Field definitions cleaned (k_52 removed)
- [ ] **Phase 3**: State initialization cleaned (no k_52 references)
- [ ] **Phase 4**: Event handlers cleaned (no k_52 editable field)
- [ ] **Phase 5**: Slider validation enforces Gas/Oil limits
- [ ] **Phase 6**: d_52/e_52 ghosting removed, existing emissions ghosting preserved
- [ ] **Phase 7**: StateManager publications cleaned (no k_52)
- [ ] **Phase 8**: Reference model defaults verified + Section18.js updated + Import/Export updated
- [ ] **Testing**: All 8 test scenarios pass (including 5 import/export sub-tests)
- [ ] **Regression**: Existing calculations produce same results
- [ ] **State Isolation**: No Target/Reference contamination

---

## 🚨 CRITICAL CONSIDERATIONS

### **Dual-State Architecture Compliance**

**1. Both Target and Reference Engines Must Update:**
- Every `k_52` → `e_52` replacement must occur in BOTH:
  - `calculateTargetModel()` → reads `e_52` (unprefixed)
  - `calculateReferenceModel()` → reads `ref_e_52` (prefixed via StateManager)

**2. StateManager Publication Pattern:**
- `setSectionValue()` helper (lines 902-921) already handles dual publication
- Target: Stores to `TargetState` + publishes `e_52` to StateManager
- Reference: Stores to `ReferenceState` + publishes `ref_e_52` to StateManager

**3. External Dependencies:**
- ⚠️ **VERIFY**: No other sections read `k_52` or `ref_k_52` from StateManager
- Run: `grep -r "k_52\|ref_k_52" src/sections/ src/utils/ docs/`
- Expected: Only S07 and import/export infrastructure references found
- **Section18.js (Parallel Coordinates)**: Check for k_52 writes in pcConfig.js

**4. Legacy Import Strategy:**
- **Modern files**: k_52 cell empty → ignored (normal case)
- **Legacy files with Gas/Oil**: k_52=0.94 → convert to d_52=94% (× 100)
- **Legacy files with Heatpump/Electric**: k_52 ignored (use d_52 value)
- **Implementation**: FileHandler.js import logic handles conversion automatically

**5. Calculation Precedents:**
- `e_52` depends on `d_52` (user input)
- `j_51`, `e_51`, `j_54`, `k_54` depend on `e_52`
- Calculation order preserved: `d_52` → `e_52` → downstream fields

---

## 📝 ROLLBACK PLAN

**If Issues Arise:**
1. Backup already created: `Section07.js.backup-YYYYMMDD-HHMMSS`
2. Branch isolation: Work contained in `S07-TWEAK` branch
3. Rollback command: `git checkout src/sections/Section07.js` (from parent branch)
4. Merge only when all tests pass

---

## 📚 REFERENCES

- **Dual-State Cheatsheet**: `docs/development/history (completed)/4012-CHEATSHEET.md`
- **Excel Source**: FORMULAE-3039.csv (verify S07 formulas if needed)
- **Backup File**: `src/sections/Section07.js.backup-YYYYMMDD-HHMMSS`
- **Field Definitions**: Section07.js lines 455-790 (sectionRows)

---

**END OF WORKPLAN**
