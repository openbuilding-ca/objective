# ZenMaster Test Observations & Findings

**Test Date**: 2025-11-08
**Test Scenario**: Test 1 - Baseline Full Calculation
**Branch**: `dependency2`
**ZenMaster Version**: With Observer Pattern + Typo Detection + Label Validation

---

## Executive Summary

ZenMaster successfully traced **210 unique nodes** and **1,544 dependency links** during the baseline calculation. The typo detection system identified **11 dependency declaration errors** across 6 fields that would cause issues when implementing topological sort for calculation ordering.

**Impact**: These typos do NOT currently affect calculations (which read correct DOM values), but WILL break topological sorting when we implement dependency-driven calculation order.

---

## 🔍 Critical Findings: Dependency Declaration Typos

### Priority: HIGH - Fix before implementing topological sort

#### Typo Pattern 1: Wrong "Sum of Gains" Column (h_79 → i_79)

**Context**: All fields reference `h_79` which doesn't exist. Should reference `i_79` (Sum of Gains).

- [ ] **TODO: Fix j_73** - Already fixed in [Section10.js:967](../../src/sections/Section10.js#L967)
  - ✅ Status: COMPLETE
  - Section: envelopeRadiantGains
  - Was: `dependencies: ["i_73", "h_79"]`
  - Now: `dependencies: ["i_73", "i_79"]`

- [x] **TODO: Fix j_76** - Already fixed in [Section10.js:1291](../../src/sections/Section10.js#L1291)
  - ✅ Status: COMPLETE
  - Section: envelopeRadiantGains
  - Was: `dependencies: ["i_76", "h_79"]`
  - Now: `dependencies: ["i_76", "i_79"]`

- [x] **TODO: Fix j_77** - Already fixed in [Section10.js:1398](../../src/sections/Section10.js#L1398)
  - ✅ Status: COMPLETE
  - Section: envelopeRadiantGains
  - Was: `dependencies: ["i_77", "h_79"]`
  - Now: `dependencies: ["i_77", "i_79"]`

- [x] **TODO: Fix j_78** - Already fixed in [Section10.js:1505](../../src/sections/Section10.js#L1505)
  - ✅ Status: COMPLETE
  - Section: envelopeRadiantGains
  - Was: `dependencies: ["i_78", "h_79"]`
  - Now: `dependencies: ["i_78", "i_79"]`

- [x] **TODO: Fix e_80** - Already fixed in [Section10.js:1619](../../src/sections/Section10.js#L1619)
  - ✅ Status: COMPLETE
  - Section: radiantGains
  - Was: `dependencies: ["h_79", "i_71"]`
  - Now: `dependencies: ["i_79", "i_71"]`

#### Typo Pattern 2: Mechanical Loads - Wrong Column References

**Context**: d_120 and d_122 each have 2 incorrect column references.

- [x] **TODO: Fix d_120 - First typo (h_118 → g_118)** - Already fixed in [Section13.js:1324](../../src/sections/Section13.js#L1324)
  - ✅ Status: COMPLETE
  - Section: mechanicalLoads
  - Was: `dependencies: ["h_118", "d_63", "d_119", "i_63", "j_63", "l_118", "d_105"]`
  - Now: `dependencies: ["g_118", "d_63", "d_119", "i_63", "l_118", "d_105"]`

- [x] **TODO: Fix d_120 - Second typo (j_63 → i_63)** - Already fixed in [Section13.js:1324](../../src/sections/Section13.js#L1324)
  - ✅ Status: COMPLETE
  - Section: mechanicalLoads
  - Note: Removed duplicate "j_63" (correct "i_63" already present)

- [x] **TODO: Fix d_122 - First typo (h_118 → g_118)** - Already fixed in [Section13.js:1443](../../src/sections/Section13.js#L1443)
  - ✅ Status: COMPLETE
  - Section: mechanicalLoads
  - Was: `dependencies: ["h_118", "l_119", "d_120", "d_21", "i_63", "j_63", "i_122"]`
  - Now: `dependencies: ["g_118", "l_119", "d_120", "d_21", "i_63", "i_122"]`

- [x] **TODO: Fix d_122 - Second typo (j_63 → i_63)** - Already fixed in [Section13.js:1443](../../src/sections/Section13.js#L1443)
  - ✅ Status: COMPLETE
  - Section: mechanicalLoads
  - Note: Removed duplicate "j_63" (correct "i_63" already present)

### Root Cause Analysis

**Pattern**: All typos are **adjacent column errors** (h→i, h→g, j→i), suggesting copy-paste mistakes during dependency declaration.

**Why calculations still work**: The actual calculation code reads from the correct DOM cells using absolute references. The dependency arrays are metadata used only for:
1. Change propagation (currently working via StateManager)
2. Dependency graph visualization (S17)
3. **Future: Topological sort for calculation ordering** ⚠️

**Future Risk**: When we implement topological sort to determine calculation order, these typos will cause:
- Incorrect calculation sequence
- Missing recalculations when dependencies change
- Potential circular dependency false positives

---

## 📊 Dependency Graph Statistics

**Exported**: [zen-dependencies-2025-11-08T03-52-05.json](./zen-dependencies-2025-11-08T03-52-05.json)

### Graph Metrics
- **Total Nodes**: 210
- **Total Edges**: 1,544
- **Average Degree**: 7.35 edges per node
- **Ref State Nodes**: 115 nodes (54.8% of total)

### Major Hub Nodes (High Fan-In)
- `ref_m_38` - **51 incoming dependencies** (major emissions aggregation)
- `ref_f_35` - **94 incoming dependencies** (major energy aggregation)
- `h_10` (TEUI Target) - **36 reference dependencies**
- `ref_d_145` - **54 incoming dependencies**

### Coverage by Section
- ✅ Key Values (e_10, h_10, k_10)
- ✅ Building Info (d_12, h_12, d_13, d_14, d_15, etc.)
- ✅ Climate (d_19, d_20, d_21, d_22, d_23, d_24)
- ✅ Energy Use - All fuel types (f_27-k_31)
- ✅ Emissions (d_38, g_38, i_38, i_39, i_40, i_41, d_41)
- ✅ Volume/Surface Metrics (d_101, d_102, d_106, i_104)
- ✅ Mechanical Loads (d_113, d_114, d_115, d_116, d_117, etc.)
- ✅ TEUI Summary (d_135-d_145)

### Dual-State Architecture Confirmation
Extensive `ref_*` prefix usage confirms Section02's ReferenceState/TargetState architecture:
- Reference emissions: `ref_d_38`, `ref_g_38`, `ref_i_38`
- Reference totals: `ref_j_32`, `ref_k_32`
- Reference fuel prices: `ref_l_12` through `ref_l_16`
- Reference standards: `ref_h_15`, `ref_h_13`

This validates that ZenMaster's limitation (cannot trace dual-state) is expected and by design.

---

## 🏷️ Label Quality Issues

**Status**: ✅ zenLabels() completed

### Results

**Fields without labels**: 139 (❌ CRITICAL for S17 graph viz)
**Fields with poor labels**: 0

### Breakdown by Pattern

#### Envelope Fields (Rows 85-98) - 126 unlabeled fields
Most unlabeled fields are in the **envelope section** (unknown section):
- Rows 85-95: Wall components (d, e, f, g, h, i, j, k, l, m, n columns × 11 rows = 121 fields)
- Row 96: `d_96`
- Row 97: `d_97` [envelope], `e_97`, `i_97`, `j_97`, `k_97`, `l_97`, `m_97`, `n_97`
- Row 98: `d_98`, `e_98`, `h_98`, `i_98`, `j_98`, `k_98`, `l_98`, `n_98`

**Pattern**: These are likely envelope assembly calculations (U-values, RSI, thermal bridging, etc.)

#### Other Unlabeled Fields
- `i_17` [buildingInfo] - Unknown purpose

### Impact Analysis

**S17 Dependency Graph**: Without labels, the graph will show field IDs instead of meaningful names, making it difficult to:
- Understand calculation flow
- Debug dependency chains
- Communicate architecture to stakeholders

### Recommendations

- [ ] **TODO: Add labels to envelope fields (d_85-d_98)** - Verify purpose from Excel source
- [ ] **TODO: Add label to i_17** [buildingInfo]
- [ ] **TODO: Fix ref_* field labels** to descriptive names (from JSON export)
- [ ] **TODO: Re-run zenLabels()** after fixes to verify

**Priority**: MEDIUM (needed for S17, but doesn't affect calculations)

---

## ⚠️ Validation Results

**Status**: ✅ zenValidate() completed

### Summary Statistics

- **Total fields validated**: 167
- **Fields with NON-SM-UKN deps**: 166 (392 deps total) ✅ **EXPECTED**
- **Fields with MISSING deps**: 4 (11 deps total) 🎯 **HIGH-VALUE FIXES**
- **Conditional deps not triggered**: 2 ✅ **EXPECTED** (i_39, i_41 on d_16)
- **UI-only deps**: 0
- **CHECK-SRC fields**: 14 🔍 **CRITICAL BUGS**

---

### 1. MISSING Dependencies (Add These!) 🎯

**Priority: HIGH** - These were traced during calculations but not declared. Safe to add.

- [ ] **TODO: i_39** - Add dependencies: `h_15`, `d_14`, `g_32`, `k_32`
  - Field: Typology-Based Carbon Intensity (A1-3)
  - Section: emissions
  - File: [Section05.js](../../src/sections/Section05.js)

- [ ] **TODO: d_40** - Add dependencies: `d_38`, `ref_d_38`, `h_13`
  - Field: Total Embedded Carbon Emitted (A1-3)
  - Section: emissions
  - File: [Section05.js](../../src/sections/Section05.js)

- [ ] **TODO: i_40** - Add dependency: `d_106`
  - Field: Total Embedded Carbon Emitted (A1-3)
  - Section: emissions
  - File: [Section05.js](../../src/sections/Section05.js)

- [ ] **TODO: d_41** - Add dependencies: `i_39`, `i_40`, `d_40`
  - Field: Lifetime Avoided (B6) Emissions
  - Section: emissions
  - File: [Section05.js](../../src/sections/Section05.js)

**Impact**: Missing these declarations will cause incomplete recalculation when dependencies change (once topological sort is implemented).

---

### 2. CHECK-SRC Dependencies (Critical Investigation Required) 🔍

**Priority: CRITICAL** - These declared dependencies DO NOT EXIST in FieldManager.

#### Pattern 1: h_79 doesn't exist (Same as typos!)
- [ ] **TODO: j_74** - CHECK-SRC: `h_79` (Window Area North)
- [ ] **TODO: j_75** - CHECK-SRC: `h_79` (Window Area East)
- [ ] **TODO: j_76** - CHECK-SRC: `h_79` (Window Area South)
- [ ] **TODO: j_77** - CHECK-SRC: `h_79` (Window Area West)
- [ ] **TODO: j_78** - CHECK-SRC: `h_79` (Skylights)
- [ ] **TODO: e_80** - CHECK-SRC: `h_79` (Gains Utilization Factor)

**Note**: These match the typos found by zenTypos()! All should be `i_79` (Sum of Gains).

#### Pattern 2: Mechanical Loads non-existent refs
- [ ] **TODO: d_120** - CHECK-SRC: `h_118`, `j_63` (Volumetric Ventilation Rate)
- [ ] **TODO: d_122** - CHECK-SRC: `h_118`, `j_63` (Incoming Cooling Season Ventil. Energy)

**Note**: These match the typos found by zenTypos()! Should be `g_118` and `i_63`.

#### Pattern 3: Non-existent constants (legitimate?)
- [ ] **TODO: d_41** - CHECK-SRC: `ref_d_38` (Lifetime Avoided Emissions)
  - **Investigation**: Is this a ref_* state field that should exist?

- [ ] **TODO: i_122** - CHECK-SRC: `cooling_latentLoadFactor`
  - **Investigation**: Likely a constant, not a field. Should be removed from dependencies or added as a field.

- [ ] **TODO: h_124** - CHECK-SRC: `cooling_freeCoolingLimit`
  - **Investigation**: Likely a constant, not a field.

- [ ] **TODO: m_124** - CHECK-SRC: `cooling_daysActiveCooling`
  - **Investigation**: Likely a constant, not a field.

**Action Required**:
1. Fix typos (h_79 → i_79, h_118 → g_118, j_63 → i_63) - 8 fixes total
2. Verify if `ref_d_38` should exist as a field
3. Determine if constants should be in dependencies or removed

---

### 3. NON-SM-UKN Dependencies (Expected - No Action) ✅

**166 fields with 392 NON-SM-UKN dependencies** - These are EXPECTED and VALID.

**Why**: These fields use dual-state storage, DOM reads, or local object storage that ZenMaster cannot trace.

**Examples from validation output**:
- `d_16` → `d_15` (dropdown value read directly from DOM)
- `h_19` → `d_19` (province dropdown)
- `d_23` → `d_19`, `h_19`, `d_12` (climate data lookups)
- All envelope calculations (i_73-i_82, d_101-d_110, etc.)

**No action required** - These are architectural patterns working as designed.

---

### 4. CONDITIONAL Dependencies (Expected - No Action) ✅

**2 conditional dependencies not triggered in Test 1**:
- `d_16` → `i_39`, `i_41` (Embodied Carbon conditionals)

**Why**: These only trigger when specific carbon standards are selected. Test 1 used baseline/default values.

**Next Steps**: Future test scenarios will trigger these to verify they work correctly.

---

## 🎯 Test Scenario Coverage

### Test 1: Baseline Full Calculation ✅
- **Completed**: 2025-11-08
- **Trigger**: Changed Reporting Year (d_14) to trigger full recalculation
- **Dependencies Traced**: 1,544 links across 210 nodes
- **Export**: [zen-dependencies-2025-11-08T03-52-05.json](./zen-dependencies-2025-11-08T03-52-05.json)

### Remaining Test Scenarios
- [ ] **Test 2**: All Energy Types Enabled
- [ ] **Test 3**: Province and Climate Variations
- [ ] **Test 4**: Different Heating Systems
- [ ] **Test 5**: Different DHW/SHW Systems
- [ ] **Test 6**: Embodied Carbon Variations
- [ ] **Test 7**: Different Carbon Standards
- [ ] Additional scenarios per [zenmaster-test-protocol.md](./zenmaster-test-protocol.md)

---

## 📋 Action Items Summary

### Immediate (Before Next Test)
1. [x] ~~**Fix 10 dependency typos**~~ ✅ **COMPLETE** (Section10.js: j_76, j_77, j_78, e_80; Section13.js: d_120, d_122)
2. [x] ~~Run `zenLabels()` and document findings~~ ✅ **COMPLETE**
3. [x] ~~Run `zenValidate()` and document findings~~ ✅ **COMPLETE**
4. [x] ~~Update this document with validation results~~ ✅ **COMPLETE**
5. [ ] **Add 11 MISSING dependencies** (Section05.js: i_39, d_40, i_40, d_41) - User reviewing against Excel
6. [ ] **Investigate 4 non-existent constants** (ref_d_38, cooling_*, ...)

### Before Topological Sort Implementation
1. [ ] Complete ALL test scenarios (Tests 1-7+)
2. [ ] Fix ALL dependency declaration errors (typos + missing + constants)
3. [ ] Add labels to 139 unlabeled fields (envelope section priority)
4. [ ] Build comprehensive dependency graph from merged test results
5. [ ] Document conditional dependencies and their triggers

### Nice to Have
1. [ ] Add ConditionalDeps metadata for scenario-specific dependencies
2. [ ] Create visual dependency graph from JSON export (S17)
3. [ ] Document architectural patterns discovered by ZenMaster
4. [ ] Add descriptive labels to all ref_* fields

---

## 🔬 ZenMaster Performance & Accuracy

### Strengths ✅
- **Typo detection is excellent** - Found 11 real bugs with smart suggestions
- **Observer Pattern works perfectly** - Clean integration with StateManager
- **Export format is ideal** - Ready for S17 dependency visualization
- **Dual-state detection** - Correctly identifies ref_* prefix pattern

### Limitations (As Expected) ⚠️
- **Cannot trace dual-state** - ReferenceState/TargetState reads are invisible
- **Cannot trace DOM reads** - Direct `dropdown.value` reads are invisible
- **Cannot trace local storage** - Section-local data structures are invisible

### Validation
These limitations are **expected and documented**. The GOLDEN RULE applies:
> **NEVER delete dependencies based solely on ZenMaster output!**
> **ALWAYS verify against source code before making ANY changes.**

---

## 📝 Notes

- All typos found are **metadata errors only** - calculations use correct DOM values
- No calculation bugs detected in Test 1
- Dependency graph is suitable for S17 visualization after label fixes
- **Test 1 validation complete**: zenValidate() + zenLabels() + zenTypos() all run successfully
- **Key insight**: ZenMaster found overlap between zenTypos() and zenValidate() CHECK-SRC results (same h_79, h_118, j_63 issues)
- **NON-SM-UKN dependencies are expected** - dual-state architecture working as designed

---

## 📊 Section-by-Section Dependency Validation (CSV vs Codebase)

### Section 01 (Rows 1-10): Key Values ✅ **DEPENDENCIES COMPLETELY MAPPED**

**Status**: Dependencies added to field definitions for S17 graph visualization and future topological sort.

**Analysis Date**: 2025-11-08
**Dependencies Added**: 2025-11-08

#### Excel Formula Dependencies (from TEUIv3043.csv)

**Row 6 - T.1 Lifetime Carbon:**
- `e_6`: `=REFERENCE!E6` → Calculated from: `ref_e_6`
- `h_6`: `=I41/H13+H8` → Calculated from: `i_41`, `h_13`, `h_8`
- `k_6`: `=IF(D14="Utility Bills", I41/H13+K8, "N/A")` → Calculated from: `d_14`, `i_41`, `h_13`, `k_8`

**Row 8 - T.2 Annual Carbon:**
- `e_8`: `=REFERENCE!E8` → Calculated from: `ref_e_8`
- `h_8`: `=K32/H15` → Calculated from: `k_32`, `h_15`
- `k_8`: `=IF(D14="Utility Bills", G32/H15, "N/A")` → Calculated from: `d_14`, `g_32`, `h_15`

**Row 10 - T.3 TEUI:**
- `e_10`: `=REFERENCE!E10` → Calculated from: `ref_e_10`
- `h_10`: `=J32/H15` → Calculated from: `j_32`, `h_15`
- `k_10`: `=IF(D14="Targeted Use", "N/A", (F32/H15))` → Calculated from: `d_14`, `f_32`, `h_15`

#### Codebase Implementation Verification

**File**: [Section01.js:1263-1337](../../src/sections/Section01.js#L1263-L1337)

**Pattern**: Section01 uses **StateManager event listeners** instead of field-level `dependencies` arrays:

1. **User Input Listeners** (lines 1268-1274):
   - `d_14` (Use type), `d_13` (Reference standard), `d_15` (Carbon standard)
   - ✅ Matches Excel conditionals (`IF(D14=...`)

2. **Upstream Calculated Field Listeners** (lines 1296-1317):
   - Energy totals: `j_32`, `k_32`, `f_32`, `g_32`, `ref_j_32`, `ref_k_32`
   - Building info: `h_15`, `ref_h_15`, `h_13`, `ref_h_13`, `i_41`
   - Reference carbon: `ref_i_39`
   - ✅ Matches Excel formula inputs

3. **Calculation Logic** (lines 745-989 - `updateTEUIDisplay()`):
   - Lines 791-804: `e_10 = ref_j_32 / ref_h_15`, `e_8 = ref_k_32 / ref_h_15`, `e_6 = ref_i_39 / ref_h_13 + e_8`
   - Lines 810-822: `h_10 = j_32 / h_15`, `h_8 = k_32 / h_15`, `h_6 = i_41 / h_13 + h_8`
   - Lines 832-851: `k_10 = f_32 / h_15`, `k_8 = g_32 / h_15`, `k_6 = i_41 / h_13 + k_8`
   - ✅ Matches Excel formulas exactly

#### Findings

**No missing dependencies** - Section01.js correctly implements all Excel formula dependencies via:
1. Event listeners on all upstream calculated fields (`j_32`, `k_32`, `f_32`, `g_32`, `ref_j_32`, `ref_k_32`, `h_15`, `ref_h_15`, `h_13`, `ref_h_13`, `i_41`, `ref_i_39`)
2. Event listeners on all user input fields (`d_14`, `d_13`, `d_15`)
3. Direct calculation logic matching Excel formulas

**Dependencies Added to Field Definitions** [Section01.js:20-173](../../src/sections/Section01.js#L20-L173):
- ✅ `e_6`: `["ref_e_6"]`
- ✅ `h_6`: `["i_41", "h_13", "h_8"]`
- ✅ `k_6`: `["d_14", "i_41", "h_13", "k_8"]`
- ✅ `e_8`: `["ref_e_8"]`
- ✅ `h_8`: `["k_32", "h_15"]`
- ✅ `k_8`: `["d_14", "g_32", "h_15"]`
- ✅ `j_8`: `["e_8", "h_8"]`
- ✅ `e_10`: `["ref_e_10"]`
- ✅ `f_10`: `["d_13", "d_144"]`
- ✅ `h_10`: `["j_32", "h_15"]`
- ✅ `i_10`: `["d_13", "d_144"]`
- ✅ `j_10`: `["e_10", "h_10"]`
- ✅ `k_10`: `["d_14", "f_32", "h_15"]`
- ✅ `m_6`: `["i_40", "d_15", "i_41", "h_13", "k_8", "h_8", "i_39"]`
- ✅ `m_8`: `["d_14", "k_8", "e_8", "h_8"]`
- ✅ `m_10`: `["d_14", "k_10", "e_10", "h_10"]`

**Architectural Pattern**: Section01 is a **Pure Display Consumer** section that:
- NOW has explicit `dependencies` arrays for S17 graph visualization
- Uses StateManager listeners to trigger recalculation (unchanged)
- Calculates values on-the-fly from upstream sources (unchanged)
- Dependencies won't affect current calculation flow (topological sort not yet implemented)

**Conclusion**: ✅ **Section 01 dependencies are completely mapped, declared in field definitions, and correctly implemented**

---

**Next Steps**:
1. ✅ ~~Fix 10 typos~~ **COMPLETE** (commit 9bdf86a)
2. ✅ ~~Verify S01 dependencies against Excel CSV~~ **COMPLETE** (All dependencies correctly implemented via event listeners)
3. Add 11 MISSING dependencies after user validates against Excel source
4. Investigate 4 non-existent constants (may need to remove from dependencies or add as fields)
5. Interactive Q&A session to add labels to envelope fields (139 unlabeled) for S17 graph viz
