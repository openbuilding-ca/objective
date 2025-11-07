# ZenMaster Comprehensive Test Protocol

**Purpose:** Capture ALL dependency paths including conditional logic by testing multiple scenarios

**Goal:** Distinguish true phantom dependencies from conditional/UI dependencies

---

## Pre-Test Setup

1. **Clear Previous Data:**
   ```javascript
   zenReset()
   ```

2. **Enable ZenMaster:**
   ```javascript
   zenEnable()
   ```

3. **Verify Status:**
   ```javascript
   zenStatus()
   // Should show: enabled: true, accessEvents: 0
   ```

---

## Test Scenario 1: Baseline Full Calculation

**Purpose:** Capture dependencies with default/current values

### Steps:
1. ZenMaster already enabled from setup
2. Navigate to Section 01 (Key Values)
3. Make a small change to trigger recalculation:
   - Change Reporting Year (d_14) dropdown
   - Or toggle between Actual/Target (d_14)
4. Wait for calculation to complete

**Expected Result:**
- All primary calculation paths traced
- Main energy/emissions dependencies captured
- Provides baseline for comparison

---

## Test Scenario 2: All Energy Types Enabled

**Purpose:** Trigger dependencies for all fuel types

### Steps:
1. Ensure ZenMaster still enabled
2. Navigate to Section 04 (Energy Use)
3. **Enable ALL energy sources** with non-zero values:
   - Row 27: Total Electricity Use → Enter value (e.g., 1000 kWh)
   - Row 28: Total Fossil Gas Use → Enter value (e.g., 500 m³)
   - Row 29: Total Propane Use → Enter value (e.g., 100 L)
   - Row 30: Total Oil Use → Enter value (e.g., 200 L)
   - Row 31: Total Wood Use → Enter value (e.g., 5 cords)
4. Trigger recalculation (change reporting year again if needed)

**Expected Dependencies Captured:**
- l_12 (Electricity Price)
- l_13 (Gas Price)
- l_14 (Propane Price)
- l_15 (Wood Price)
- l_16 (Oil Price)
- All emission factors for each fuel type

---

## Test Scenario 3: Province and Climate Variations

**Purpose:** Trigger province-specific climate data dependencies

### Steps:
1. Ensure ZenMaster still enabled
2. Navigate to Section 03 (Climate)
3. **Change Province:**
   - d_19 (Province) → Select different province (e.g., Ontario)
   - Wait for municipality dropdown to update
   - h_19 (Municipality) → Select different city
4. **Observe climate data changes:**
   - d_20 (HDD) should update
   - d_21 (CDD) should update
   - d_23, d_24 (Coldest/Hottest Days) should update
5. Trigger recalculation

**Expected Dependencies Captured:**
- d_19 → h_19 (province affects municipality options)
- d_19 → d_20, d_21 (province affects climate data)
- h_19 → d_23, d_24 (municipality affects design days)

---

## Test Scenario 4: Heating System Variations

**Purpose:** Test conditional dependencies based on heating system type

### Steps:
1. Ensure ZenMaster still enabled
2. Navigate to Section 13 (Mechanical Loads)
3. **Test Electric Heating:**
   - d_113 (Primary Heating System) → Select "Electric Resistance"
   - Trigger recalculation
   - Note which dependencies are captured
4. **Test Gas Heating:**
   - d_113 → Select "Natural Gas Furnace"
   - Trigger recalculation
   - Note NEW dependencies captured
5. **Test Heat Pump:**
   - d_113 → Select "Air Source Heat Pump"
   - Trigger recalculation
   - Note NEW dependencies captured
6. **Test Oil/Propane/Wood:**
   - Repeat for other heating types

**Expected Dependencies Captured:**
- d_113 → different fuel dependencies (l_13, l_14, l_15, l_16)
- d_113 → h_113, j_113, l_113 (heating type affects calculations)
- d_114, d_115 dependencies change based on heating type

---

## Test Scenario 5: Cooling System Enabled

**Purpose:** Trigger cooling-specific dependencies

### Steps:
1. Ensure ZenMaster still enabled
2. Navigate to Section 13 (Mechanical Loads)
3. **Enable Cooling:**
   - d_116 (Heatpump or Dedicated Cooling System) → Select "Yes" or specific type
   - d_117 (Heatpump Cool Elect. Load) → Enter value
4. Trigger recalculation

**Expected Dependencies Captured:**
- d_116 → d_117 (cooling system affects electric load)
- d_129 (CED Cooling Load Unmitigated)
- m_129 (CED Cooling Load)
- h_124 (Ventilation Free Cooling)
- cooling_* constants

---

## Test Scenario 6: HRV/ERV Ventilation

**Purpose:** Trigger ventilation system dependencies

### Steps:
1. Ensure ZenMaster still enabled
2. Navigate to Section 13 (Mechanical Loads)
3. **Enable HRV/ERV:**
   - d_118 (HRV/ERV/MVHR Efficiency SRE) → Enter value > 0 (e.g., 0.75)
   - d_119 (Per Person Ventilation Rate) → Enter value if not set
4. Trigger recalculation

**Expected Dependencies Captured:**
- d_118 → i_121 (HRV efficiency affects heating season ventilation)
- d_120 (Volumetric Ventilation Rate)
- d_121 (Heating Season Ventil. Energy)
- d_122 (Incoming Cooling Season Ventil. Energy)
- d_123 (Outgoing Cooling Season Ventil. Energy)
- d_124 (Ventilation Free Cooling)

---

## Test Scenario 7: Reference Standard Changes

**Purpose:** Trigger reference model dependencies

### Steps:
1. Ensure ZenMaster still enabled
2. Navigate to Section 02 (Building Info)
3. **Change Reference Standard:**
   - h_13 (Reference Standard) → Select different standard (e.g., NBC 2015 → NBC 2020)
   - d_15 (Carbon Benchmarking Standard) → Change if applicable
4. Trigger recalculation

**Expected Dependencies Captured:**
- h_13 → ref_* fields (reference standard affects baseline calculations)
- d_38, ref_d_38 (operational emissions)
- d_41 (lifetime avoided emissions)

---

## Test Scenario 8: Occupancy and Internal Gains

**Purpose:** Trigger occupancy-based dependencies

### Steps:
1. Ensure ZenMaster still enabled
2. Navigate to Section 02 (Building Info)
3. **Change Occupancy Type:**
   - h_12 (Major Occupancy) → Select different type (e.g., Residential → Office)
   - h_15 (Carbon Benchmarking Standard) → May auto-update
4. Navigate to Section 09 (Internal Gains)
5. **Modify Internal Loads:**
   - d_63 (Occupants per Building) → Change value
   - d_65 (Plug Loads) → Change value
   - d_66 (Lighting Loads) → Change value
   - d_67 (Equipment Loads) → Change value
6. Trigger recalculation

**Expected Dependencies Captured:**
- h_12 → h_15 (occupancy affects benchmarking)
- h_15 → h_65, h_66, h_67 (occupancy affects internal gain defaults)
- d_63 → occupancy-related calculations
- Cascade: d_65 → h_65 → i_65 → j_65 → k_65 → l_65 → h_70 → h_71

---

## Test Scenario 9: Envelope Variations

**Purpose:** Trigger envelope component dependencies

### Steps:
1. Ensure ZenMaster still enabled
2. Navigate to Section 10 (Radiant Gains) and Section 11 (Transmission)
3. **Modify Envelope Components:**
   - **Windows:** Change d_74, d_75, d_76, d_77 (N/E/S/W window areas)
   - **Doors:** Change d_73 (door area)
   - **Skylights:** Change d_78 (skylight area)
   - **Orientation:** Change e_74-e_78 (orientations)
   - **U-values:** Change f_74-f_78 (U-values)
   - **SHGC:** Change g_74-g_78 (SHGC values)
4. Trigger recalculation

**Expected Dependencies Captured:**
- d_73-d_78 → i_73-i_78 (areas affect solar gains)
- e_73-e_78 → orientation-based calculations
- i_73-i_78 → i_79 (subtotal solar gains)
- i_79, j_79, k_79, l_79 → gain utilization
- d_85-d_95 → transmission calculations (g_101, g_102)

---

## Test Scenario 10: Embodied Carbon

**Purpose:** Trigger embodied carbon dependencies

### Steps:
1. Ensure ZenMaster still enabled
2. Navigate to Section 02 (Building Info)
3. **Set Embodied Carbon Target:**
   - d_16 (Embodied Carbon Target) → Enter value (e.g., 350 kgCO₂e/m²)
4. Navigate to Section 05 (Emissions)
5. **Modify Embodied Carbon Values:**
   - d_39 (Typology-Based Carbon Intensity A1-3) → Change if editable
   - d_40 (Total Embedded Carbon Emitted A1-3) → Modify
6. Trigger recalculation

**Expected Dependencies Captured:**
- d_16 → i_40, l_40, n_40 (embodied carbon target)
- d_39 → i_39, l_39, n_39 (carbon intensity)
- d_40, i_40 → i_41, d_41 (lifetime avoided emissions)
- d_106 (Total Floor Area) → embodied carbon per m²

---

## Post-Test Analysis

### 1. Disable ZenMaster and Validate

```javascript
zenDisable()
```

This will automatically run `zenValidate()` and show phantom dependencies.

### 2. Export Results

```javascript
zenExportFile()
```

Saves comprehensive dependency graph as JSON.

### 3. Compare with Baseline

Compare the new export with previous test:
- Previous test: 768 nodes, 2,499 links
- After comprehensive testing: Should have MORE links (conditional paths discovered)

### 4. Analyze Remaining Phantoms

After comprehensive testing, remaining phantoms are likely:

**Category A: TRUE PHANTOMS** (remove from field definitions)
- Fields that don't exist
- Dependencies never used in any scenario
- Leftover from old code

**Category B: EDGE CASE CONDITIONALS** (keep, document)
- Used only in rare scenarios not covered by test protocol
- Seasonal calculations
- Error handling paths

**Category C: UI-ONLY DEPENDENCIES** (keep, mark as uiDeps)
- Dropdown option population
- Field validation
- DOM manipulation

---

## Success Criteria

**Test is successful if:**

1. ✅ All 10 scenarios completed without errors
2. ✅ ZenMaster captures > 3000 links (vs 2499 baseline)
3. ✅ Phantom count drops by > 50% (from 405 to < 200)
4. ✅ All fuel type dependencies discovered
5. ✅ All heating/cooling system variations traced
6. ✅ Province/climate dependencies captured
7. ✅ Reference model (ref_*) dependencies traced

**Validation is complete when:**

1. ✅ Remaining phantoms categorized (true vs UI vs conditional)
2. ✅ True phantoms identified for removal
3. ✅ UI dependencies documented
4. ✅ Conditional dependencies marked in field definitions
5. ✅ Calculator.js optimization ready (using complete dependency graph)

---

## Next Steps After Testing

1. **Update Field Definitions:**
   - Remove confirmed true phantoms
   - Add `uiDeps` metadata for UI-only dependencies
   - Add `conditionalDeps` metadata for conditional logic

2. **Optimize Calculator.js:**
   - Use complete dependency graph for topological sort
   - Reorder section calculations for optimal performance
   - Use Clock.js to validate performance improvement

3. **Continuous Validation:**
   - Integrate ZenMaster into development workflow
   - Run comprehensive test before major releases
   - Flag new phantom dependencies in code review

---

## Automated Test Script (Future Enhancement)

```javascript
// Automated comprehensive test runner
async function runComprehensiveZenTest() {
  zenReset();
  zenEnable();

  // Scenario 1: Baseline
  await testScenario("Baseline", async () => {
    StateManager.setValue("d_14", "2024");
  });

  // Scenario 2: All energy types
  await testScenario("All Energy Types", async () => {
    ["d_27", "d_28", "d_29", "d_30", "d_31"].forEach(field => {
      StateManager.setValue(field, 1000);
    });
  });

  // Scenario 3-10: Similar structure
  // ...

  zenDisable();
  const results = zenValidate();
  zenExportFile();

  return {
    totalNodes: results.nodes.length,
    totalLinks: results.links.length,
    phantoms: results.phantomCount,
    missing: results.missingCount
  };
}
```

---

## Test Scenario 11: ConditionalDeps Validation (Section 02)

**Purpose:** Test enhanced ZenMaster validation with conditionalDeps support

**What Was Changed:**

1. **Section02.js Field Definitions:**
   - Added `conditionalDeps` and `uiDeps` metadata support to `getFields()`
   - Field `d_16` (Embodied Carbon Target) now declares:
     ```javascript
     {
       fieldId: "d_16",
       dependencies: ["d_15"],           // Always uses d_15 (Carbon Standard)
       conditionalDeps: ["i_39", "i_41"], // i_39 when TGS4, i_41 when Self Reported
     }
     ```

2. **ZenMaster.js Enhanced Validation:**
   - Now categorizes phantom dependencies into 4 types:
     - **TRUE PHANTOMS** ❌: Declared but never used
     - **CONDITIONAL** 🔀: Declared as `conditionalDeps`, not triggered in this test
     - **UI DEPS** 🎨: Declared as `uiDeps`, for dropdown/validation only
     - **NON-EXISTENT** 🚫: Dependency field doesn't exist in FieldManager

### Sub-Scenario 11a: Self Reported Standard

**Goal:** Verify that `i_41` is traced, `i_39` is marked as conditional (not phantom)

1. Reset and Enable ZenMaster: `zenReset(); zenEnable();`
2. Navigate to Section 02 (Building Info)
3. Ensure `d_15` (Carbon Benchmarking Standard) = "Self Reported"
4. Toggle Reporting Year to trigger calculation
5. Disable: `zenDisable()`

**Expected Results for d_16:**
- ✅ `d_15` traced (always used)
- ✅ `i_41` traced (used when d_15 = "Self Reported")
- 🔀 `i_39` marked as CONDITIONAL (not triggered, not a phantom)

### Sub-Scenario 11b: TGS4 Standard

**Goal:** Verify that `i_39` is traced, `i_41` is marked as conditional (not phantom)

1. Reset and Enable: `zenReset(); zenEnable();`
2. Change `d_15` to "TGS4"
3. Trigger calculation
4. Disable: `zenDisable()`

**Expected Results for d_16:**
- ✅ `d_15` traced
- ✅ `i_39` traced (used when d_15 = "TGS4")
- 🔀 `i_41` marked as CONDITIONAL (not triggered)

### Sub-Scenario 11c: BR18 Standard (No External Deps)

**Goal:** Verify that both `i_39` and `i_41` are marked as conditional (not phantoms)

1. Reset and Enable: `zenReset(); zenEnable();`
2. Change `d_15` to "BR18 (Denmark)" (uses hardcoded value 500)
3. Trigger calculation
4. Disable: `zenDisable()`

**Expected Results for d_16:**
- ✅ `d_15` traced
- 🔀 `i_39` marked as CONDITIONAL
- 🔀 `i_41` marked as CONDITIONAL

**Success Criteria:**
- ✅ Conditional deps are NOT flagged as true phantoms
- ✅ Validation summary shows breakdown by category
- ✅ Console output uses emoji indicators for clarity
- ✅ All three sub-scenarios show 0 true phantoms for d_16

---

## Conclusion

This comprehensive test protocol ensures ZenMaster captures ALL dependency paths, including:
- ✅ Baseline calculations
- ✅ Conditional logic (heating/cooling systems)
- ✅ User input cascades
- ✅ Climate/location variations
- ✅ Reference model calculations
- ✅ Embodied carbon paths
- ✅ Envelope variations
- ✅ Occupancy-based calculations
- ✅ ConditionalDeps validation (Section 02)

After completing this protocol, you'll have a **complete runtime dependency graph** that accurately represents your application's TRUE calculation flow, enabling confident dependency cleanup and Calculator.js optimization.
