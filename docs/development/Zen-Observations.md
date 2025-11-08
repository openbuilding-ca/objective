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

- [ ] **TODO: Fix j_76**
  - Section: envelopeRadiantGains
  - Field: Row 76 calculation
  - Issue: `dependencies: [..., "h_79"]` should be `dependencies: [..., "i_79"]`
  - File: [Section10.js](../../src/sections/Section10.js)

- [ ] **TODO: Fix j_77**
  - Section: envelopeRadiantGains
  - Field: Row 77 calculation
  - Issue: `dependencies: [..., "h_79"]` should be `dependencies: [..., "i_79"]`
  - File: [Section10.js](../../src/sections/Section10.js)

- [ ] **TODO: Fix j_78**
  - Section: envelopeRadiantGains
  - Field: Row 78 calculation
  - Issue: `dependencies: [..., "h_79"]` should be `dependencies: [..., "i_79"]`
  - File: [Section10.js](../../src/sections/Section10.js)

- [ ] **TODO: Fix e_80**
  - Section: radiantGains
  - Field: Row 80 calculation (column E)
  - Issue: `dependencies: [..., "h_79"]` should be `dependencies: [..., "i_79"]`
  - File: [Section10.js](../../src/sections/Section10.js)

#### Typo Pattern 2: Mechanical Loads - Wrong Column References

**Context**: d_120 and d_122 each have 2 incorrect column references.

- [ ] **TODO: Fix d_120 - First typo (h_118 → g_118)**
  - Section: mechanicalLoads
  - Field: d_120 (likely Heating/Cooling load calculation)
  - Issue: `dependencies: [..., "h_118"]` should be `dependencies: [..., "g_118"]`
  - File: [Section12.js](../../src/sections/Section12.js)

- [ ] **TODO: Fix d_120 - Second typo (j_63 → i_63)**
  - Section: mechanicalLoads
  - Field: d_120
  - Issue: `dependencies: [..., "j_63"]` should be `dependencies: [..., "i_63"]`
  - File: [Section12.js](../../src/sections/Section12.js)

- [ ] **TODO: Fix d_122 - First typo (h_118 → g_118)**
  - Section: mechanicalLoads
  - Field: d_122 (likely Ventilation energy calculation)
  - Issue: `dependencies: [..., "h_118"]` should be `dependencies: [..., "g_118"]`
  - File: [Section12.js](../../src/sections/Section12.js)

- [ ] **TODO: Fix d_122 - Second typo (j_63 → i_63)**
  - Section: mechanicalLoads
  - Field: d_122
  - Issue: `dependencies: [..., "j_63"]` should be `dependencies: [..., "i_63"]`
  - File: [Section12.js](../../src/sections/Section12.js)

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

## 🏷️ Label Quality Issues (Pending zenLabels() Results)

**Status**: Need to run `zenLabels()` to get comprehensive report.

### Known Issues from JSON Export

Many `ref_*` fields have poor labels (label = field ID):
- `ref_j_32` labeled as "ref_j_32" instead of "Reference ∑ Target Energy"
- `ref_k_32` labeled as "ref_k_32" instead of "Reference ∑ Target Emissions"
- `ref_h_15` labeled as "ref_h_15" instead of "Reference Carbon Benchmarking Standard"
- `ref_i_39` labeled as "ref_i_39" instead of "Reference Typology-Based Carbon Intensity"

**Impact**: Poor labels make S17 dependency graph hard to read and debug.

**Next Step**: Run `zenLabels()` to get full list of unlabeled and poorly-labeled fields.

- [ ] **TODO: Run zenLabels()** to identify all label quality issues
- [ ] **TODO: Fix ref_* field labels** based on zenLabels() output
- [ ] **TODO: Verify no unlabeled fields** exist

---

## ⚠️ Validation Results (Pending zenValidate() Results)

**Status**: Need to run `zenValidate()` to get comprehensive validation report.

Expected categories:
1. **MISSING** - Dependencies traced but not declared (safe to add)
2. **NON-SM-UKN** - Declared but not traced via StateManager (verify source)
3. **CHECK-SRC** - Dependency field doesn't exist in FieldManager (investigate)
4. **CONDITIONAL** - Conditional deps not triggered in this test scenario
5. **UI-only** - UI dependencies (expected, not calculation deps)

- [ ] **TODO: Run zenValidate()** to get full validation report
- [ ] **TODO: Review MISSING dependencies** and add to declarations
- [ ] **TODO: Review NON-SM-UKN dependencies** against source code
- [ ] **TODO: Investigate CHECK-SRC issues** (if any)
- [ ] **TODO: Document CONDITIONAL deps** for future test scenarios

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
1. [ ] Fix 10 dependency typos (Section10.js, Section12.js)
2. [ ] Run `zenLabels()` and document findings
3. [ ] Run `zenValidate()` and document findings
4. [ ] Update this document with validation results

### Before Topological Sort Implementation
1. [ ] Complete ALL test scenarios (Tests 1-7+)
2. [ ] Fix ALL dependency declaration errors
3. [ ] Verify all fields have proper labels
4. [ ] Build comprehensive dependency graph from merged test results
5. [ ] Document conditional dependencies and their triggers

### Nice to Have
1. [ ] Add ConditionalDeps metadata for scenario-specific dependencies
2. [ ] Create visual dependency graph from JSON export
3. [ ] Document architectural patterns discovered by ZenMaster

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
- Need validation results to assess completeness of dependency declarations

---

**Next Steps**: Run `zenValidate()` and `zenLabels()`, then update this document with findings before proceeding to Test 2.
