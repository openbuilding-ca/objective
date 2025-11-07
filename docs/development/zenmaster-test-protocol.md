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

## Test Scenario 12: Emissions Tracking (Multi-Conditional)

**Purpose:** Test comprehensive conditional dependencies across multiple sections

**Why This Test is Superior to Test 11:**
- Province-dependent emission factors (S03: d_19)
- Year-dependent emission factors (S02: h_12)
- Fuel-type variations (S04: d_27-d_31 enable/disable calculation branches)
- Wood offset calculations (S08: d_60 subtracted from totals)
- Cross-section cascades: S02 → S03 → S04 → S05 → S08 → emissions
- Expected 1200+ links (vs 547 from Test 11)

**Key Fields Under Test:**
- `k_27` - Electricity Emissions (depends on d_19 province, h_12 year)
- `k_28` - Gas Emissions (conditional on d_28 usage > 0)
- `k_29` - Propane Emissions (conditional on d_29 usage > 0)
- `k_30` - Oil Emissions (conditional on d_30 usage > 0)
- `k_31` - Wood Emissions (conditional on d_31 usage > 0, d_60 offset)
- `k_32` - ∑ Target Emissions (sum of active fuel types minus d_60)

### Sub-Scenario 12a: Baseline Emissions (Ontario, 2024)

**Goal:** Capture baseline emission dependencies with electricity + gas only

1. Reset and Enable: `zenReset(); zenEnable();`
2. Configure baseline:
   - Province (d_19) = "Ontario"
   - Reporting Year (h_12) = "2024"
   - Enable electricity and gas use (d_27 > 0, d_28 > 0)
   - Disable propane, oil, wood (d_29 = 0, d_30 = 0, d_31 = 0)
3. Trigger full calculation (toggle between Target/Reference modes)
4. Disable: `zenDisable()`

**Expected Dependencies:**
- k_27 → d_19 (province emission factor)
- k_27 → h_12 (year emission factor)
- k_27 → d_27, f_27, j_27 (electricity use values)
- k_28 → d_19, h_12 (province/year factors)
- k_28 → d_28, f_28, j_28 (gas use values)
- k_32 → k_27, k_28 (sum of active fuel types only)
- k_29, k_30, k_31 marked as CONDITIONAL (not traced when usage = 0)

### Sub-Scenario 12b: Multi-Fuel + Wood Offset (BC, 2022)

**Goal:** Capture wood burning with offset calculation

1. Reset and Enable: `zenReset(); zenEnable();`
2. Configure multi-fuel scenario:
   - Province (d_19) = "British Columbia"
   - Reporting Year (h_12) = "2022"
   - Enable all fuel types (d_27-d_31 all > 0)
   - Wood burning active → triggers d_60 offset calculation (S08)
3. Trigger calculation
4. Disable: `zenDisable()`

**Expected Additional Dependencies:**
- k_31 → d_31 (wood use)
- k_31 → d_60 (wood emissions offset from S08)
- d_60 → [S08 IAQ fields] (combustion efficiency, stack losses)
- k_32 → k_27, k_28, k_29, k_30, k_31, d_60 (all fuel types + offset)

### Sub-Scenario 12c: Province Comparison (AB vs QC)

**Goal:** Verify province-conditional emission factors trigger different dependencies

1. Reset and Enable: `zenReset(); zenEnable();`
2. Test Alberta (high carbon grid):
   - Province (d_19) = "Alberta"
   - All fuel types enabled
   - Note emission intensity values
3. Change to Quebec (low carbon hydro grid):
   - Province (d_19) = "Quebec"
   - Observe recalculation with different factors
4. Disable: `zenDisable()`

**Expected Behavior:**
- Same dependency structure (d_19 → k_27-k_31)
- Different emission factor VALUES accessed from S03 lookup tables
- Demonstrates province as primary conditional dependency source

**Success Criteria:**
- ✅ All active fuel types (k_27-k_31) traced with province + year dependencies
- ✅ Inactive fuel types (usage = 0) do NOT create phantom dependencies
- ✅ Wood offset (d_60) only appears when d_31 > 0
- ✅ Cross-section dependencies captured: S03 → S04 → S08 → emissions
- ✅ Greater link count than Test 11 (expected: 1200+ vs 547)
- ✅ ConditionalDeps validation correctly categorizes fuel-type conditionals

**Export Analysis:**

After running all 3 sub-scenarios:
```javascript
zenExportFile()  // Saves zen-dependencies-[timestamp].json
```

**Expected Metrics:**
- **Node Count:** 350+ (vs 282 from Test 11)
- **Link Count:** 1200+ (vs 547 from Test 11)
- **Access Events:** 20,000+ (multi-fuel scenarios generate more events)

**⚠️ Clock.js Performance Warning:**

Test 12 will generate significant Clock.js console spam due to:
- **h_12 slider** (reporting year) using `input` event → cascades on every pixel
- **Province dropdown** (d_19) recalculating ALL emission factors
- **Multi-fuel scenarios** (5 parallel calculation paths k_27-k_31)

**Recommendation:** Apply "calculate on release" pattern to h_12 slider (like d_97) BEFORE running Test 12:

```javascript
// In Section02.js - Change h_12 slider from 'input' to 'change' event
yearSlider.addEventListener("input", function (e) {
  // Update display only (no calculation)
  const yearDisplay = this.nextElementSibling;
  if (yearDisplay) yearDisplay.textContent = e.target.value;
});

yearSlider.addEventListener("change", function (e) {
  // Calculate only on release
  const newYear = e.target.value;
  ModeManager.setValue("h_12", newYear, "user-modified");
  // ... rest of calculation logic
});
```

---

## Section-by-Section Dependency Validation Workplan

**Goal:** Systematically validate and fix dependencies using ZenMaster runtime discovery.

**Prerequisites:**
- ✅ Global slider fix (FieldManager.js calculate-on-release)
- ✅ ConditionalDeps pattern (Section02.js)
- ✅ ZenMaster categorizes phantoms (TRUE/CONDITIONAL/UI/NON-EXISTENT)

### Validation Workflow (Repeat Per Section)

1. `zenReset(); zenEnable();`
2. Interact with section fields (change dropdowns, adjust sliders, toggle modes)
3. `zenDisable();` → runs `zenValidate()`
4. `zenExportFile();`
5. Analyze output → Update field definitions → Re-test → Commit

---

### Phase 1: S02 (Building Info) - CURRENT

**Fields:** d_16 ✅, h_12 ✅, h_13, d_14, d_15, prices (l_12-l_16 likely uiDeps)

**Status:** ConditionalDeps working (i_41 → d_16 traced in Test 11)

---

### Phase 2: S03 (Climate) → Phase 3: S04 (Energy/Emissions) → Phase 4: S05 (Methods)

**Key Conditionals:**
- S03: Province-based lookups (d_19 → climate/emission factors)
- S04: Fuel-type variations (d_27-d_31, wood offset d_60 from S08)
- S05: Typology carbon intensities (i_39 TGS4, i_41 Self Reported)

**Test:** Run Test 12 (Emissions Tracking) after S03-S05 complete

---

### Phase 5-10: S06 (Envelope) → S07 (Glazing) → S08 (IAQ/Wood) → S09 (Internal Gains) → S10 (Radiant) ✅ → S11 (Metrics) → S13 (Mechanical) → S14-15 (Summary/PV)

**S13 Note:** d_118 slider has intentional local override (calculate-during-drag for accuracy - don't change)

---

### Success Metrics Per Section

- ✅ Zero TRUE PHANTOMS
- ✅ Conditionals in conditionalDeps array
- ✅ UI deps in uiDeps array
- ✅ No NON-EXISTENT references

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
- ✅ Multi-fuel emissions tracking (Section 04 → 08)

After completing this protocol, you'll have a **complete runtime dependency graph** that accurately represents your application's TRUE calculation flow, enabling confident dependency cleanup and Calculator.js optimization.


+++++

=============================================================================
AGENT HANDOFF - 2025-11-07 17:30 PST
=============================================================================

STATUS: Test 11 completed successfully - 88% performance improvement confirmed

COMPLETED WORK:
✅ Global slider fix (FieldManager.js calculate-on-release pattern)
✅ ConditionalDeps pattern implemented (Section02.js: d_16)
✅ Test 11 re-run validates slider fix (5,043 lines vs 41,375 = 88% reduction)
✅ ZenMaster runtime discovery operational
✅ Documentation updated (dependency-zen.md, zenmaster-test-protocol.md)
✅ PR description drafted (see chat history)

CURRENT PHASE: Phase 1 - Section 02 (Building Info) Validation

NEXT STEPS (Systematic Section-by-Section Workflow):
─────────────────────────────────────────────────────
1. Run Test Scenarios 1-10 for Section 02 (see zenmaster-test-protocol.md:29-260)
   - Focus on: h_13 (Reference Standard), d_14 (Actual/Target), d_15 (Carbon Standard)
   - Test: Different standard combinations, occupancy types, price fields (l_12-l_16)

2. Analyze zenValidate() output for S02:
   - Identify TRUE_PHANTOMS → remove from dependencies
   - Identify CONDITIONAL deps → add to conditionalDeps array
   - Identify UI_DEPS → add to uiDeps array

3. Update Section02.js field definitions with findings

4. Re-test to verify fixes (zenReset; zenEnable; [test]; zenDisable;)

5. Commit S02 fixes

6. Move to Phase 2: S03 (Climate) - Province conditionals
   - Key fields: d_19 (Province), h_19 (Municipality), d_20-d_24 (climate data)

7. Move to Phase 3: S04 (Energy/Emissions) - Fuel-type conditionals
   - Key fields: d_27-d_31 (fuel types), k_27-k_32 (emissions)

8. AFTER S03-S05 complete → Run Test 12 (Emissions Tracking)
   - Expected: 1200+ links (vs 536 currently)
   - Multi-conditional: Province + Year + Fuel Types + Wood Offsets

REFERENCES:
- Workplan: docs/development/zenmaster-test-protocol.md:588-638
- Test Scenarios: docs/development/zenmaster-test-protocol.md:29-385
- ConditionalDeps Pattern: docs/development/dependency-zen.md
- Test 11 Results: docs/development/zen-dependencies-2025-11-07T17-25-04.json

DO NOT:
❌ Jump to Test 12 before completing S02-S05 validation
❌ Create new documentation files (update existing docs only)
❌ Change d_118 slider behavior (Section13.js - intentional exception)

USER CONTEXT:
- 10hr break for other work
- Expects systematic section-by-section approach
- Wants dependencies fixed/relabeled after each test reveals calculation flow
- Wants clean commits per section (no push until user returns)

=============================================================================
TEST 11 OUTPUT BEGINS BELOW (5,043 lines - 88% reduction from 41,375)
=============================================================================
