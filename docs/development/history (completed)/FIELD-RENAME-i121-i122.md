# Field Rename Workplan: i_121 → h_121, i_122 → h_122

**Date**: December 6, 2025
**Purpose**: Move i_121 and i_122 one column left (to h_121 and h_122) to improve vertical alignment and provide more room for print layouts.

---

## Overview

### Current State
- **i_121**: "Heating Ventilation Energy Recovered: kWh/yr" (Row 121, Column I)
- **i_122**: "Latent Load Factor (%)" (Row 122, Column I)

### Target State
- **h_121**: "Heating Ventilation Energy Recovered: kWh/yr" (Row 121, Column H)
- **h_122**: "Latent Load Factor (%)" (Row 122, Column H)

### Impact Analysis
- **i_121**: Critical calculated field (Heating Ventilation Energy Recovered), consumed by m_121. No direct string references in other files.
- **i_122**: Critical calculated field (Latent Load Factor), referenced in 10 locations across Section13.js and Cooling.js
- **h_121**: Currently empty cell `h: {}` in row 121 (will receive i_121 definition)
- **h_122**: Currently empty cell `h: {}` in row 122 (will receive i_122 definition)

---

## 1. Impact on Dependencies and Updates Required

### 1.1 Field i_121 (Heating Ventilation Energy Recovered)

**Current Definition** ([Section13.js:1508-1515](src/sections/Section13.js#L1508-L1515)):
```javascript
i: {
  fieldId: "i_121",
  type: "calculated",
  value: "396,299.20",
  section: "mechanicalLoads",
  dependencies: ["d_121", "d_118"],
  label: "Heating Ventilation Energy Recovered: kWh/yr",
},
```

**Dependency Chain**:
- **Inputs**: `d_121` (Ventilation Heating Load), `d_118` (HRV/ERV SRE %)
- **Outputs**: `m_121` (Net Heating Season Ventilation Losses) at [Section13.js:1530](src/sections/Section13.js#L1530)

**Impact**:
- ✅ **LOW RISK**: Field `i_121` is self-contained within Section13.js (no external references)
- Single downstream consumer: `m_121` needs dependency update from `"i_121"` to `"h_121"`
- Upstream dependencies (d_121, d_118) remain unchanged

---

### 1.2 Field i_122 (Latent Load Factor)

**Current Definition** ([Section13.js:1574-1581](src/sections/Section13.js#L1574-L1581)):
```javascript
i: {
  fieldId: "i_122",
  type: "calculated",
  value: "159%",
  section: "mechanicalLoads",
  dependencies: ["cooling_latentLoadFactor"],
  label: "Latent Load Factor (from Cooling Calculation): %",
},
```

**Dependency Chain**:
- **Input**: `cooling_latentLoadFactor` (from Cooling.js Stage 1)
- **Output**: `d_122` (Ventilation Cooling Load) at [Section13.js:1559](src/sections/Section13.js#L1559)

**Impact**:
- ⚠️ **MODERATE RISK**: Field `i_122` is referenced in 10 locations across 2 files
- Must update ALL references to maintain calculation integrity

**All i_122 References**:

| File | Line | Context | Update Required |
|------|------|---------|-----------------|
| Section13.js | 360 | `i_122: "percent-0dp"` | Change to `h_122: "percent-0dp"` |
| Section13.js | 1559 | `dependencies: [..., "i_122"]` | Change to `"h_122"` |
| Section13.js | 1575 | `fieldId: "i_122"` | Change to `fieldId: "h_122"` |
| Section13.js | 2508 | `// Target i_122 affects D122/D123` | Update comment to `h_122` |
| Section13.js | 2509 | `// Reference i_122 affects...` | Update comment to `h_122` |
| Section13.js | 2988 | `setFieldValue("i_122", ...)` | Change to `"h_122"` |
| Section13.js | 3020 | `i_122: latentLoadFactor_i122` | Change to `h_122:` |
| Section13.js | 3745 | `if (coolingVentilationResults.i_122 !== undefined)` | Change to `.h_122` |
| Section13.js | 3746 | `setFieldValue("i_122", ...)` | Change to `"h_122"` |
| Cooling.js | 1242 | `consumedBy: ["i_122"]` | Change to `["h_122"]` |
| Cooling.js | 1253 | `consumedBy: ["ref_i_122"]` | Change to `["ref_h_122"]` |

---

## 2. Field Definition Updates within Section13.js

### 2.1 Row 121 Layout Update

**Before** ([Section13.js:1483-1535](src/sections/Section13.js#L1483-L1535)):
```javascript
cells: {
  // ... d, e, f, g cells ...
  h: {},  // ← Currently empty
  i: {    // ← Currently i_121
    fieldId: "i_121",
    type: "calculated",
    value: "396,299.20",
    section: "mechanicalLoads",
    dependencies: ["d_121", "d_118"],
    label: "Heating Ventilation Energy Recovered: kWh/yr",
  },
  // ... j, k, l, m, n cells ...
}
```

**After**:
```javascript
cells: {
  // ... d, e, f, g cells ...
  h: {    // ← Move i_121 definition here
    fieldId: "h_121",
    type: "calculated",
    value: "396,299.20",
    section: "mechanicalLoads",
    dependencies: ["d_121", "d_118"],
    label: "Heating Ventilation Energy Recovered: kWh/yr",
  },
  i: {},  // ← Now empty
  // ... j, k, l, m, n cells ...
}
```

**Required Changes**:
1. Move entire `i:` object definition to `h:` position
2. Change `fieldId: "i_121"` → `fieldId: "h_121"`
3. Set `i: {}` to empty placeholder
4. Update `m_121` dependency from `"i_121"` to `"h_121"` at [line 1530](src/sections/Section13.js#L1530)

---

### 2.2 Row 122 Layout Update

**Before** ([Section13.js:1537-1587](src/sections/Section13.js#L1537-L1587)):
```javascript
cells: {
  // ... d, e, f, g cells ...
  h: {},  // ← Currently empty
  i: {    // ← Currently i_122
    fieldId: "i_122",
    type: "calculated",
    value: "159%",
    section: "mechanicalLoads",
    dependencies: ["cooling_latentLoadFactor"],
    label: "Latent Load Factor (from Cooling Calculation): %",
  },
  // ... j, k, l, m, n cells ...
}
```

**After**:
```javascript
cells: {
  // ... d, e, f, g cells ...
  h: {    // ← Move i_122 definition here
    fieldId: "h_122",
    type: "calculated",
    value: "159%",
    section: "mechanicalLoads",
    dependencies: ["cooling_latentLoadFactor"],
    label: "Latent Load Factor (from Cooling Calculation): %",
  },
  i: {},  // ← Now empty
  // ... j, k, l, m, n cells ...
}
```

**Required Changes**:
1. Move entire `i:` object definition to `h:` position
2. Change `fieldId: "i_122"` → `fieldId: "h_122"`
3. Set `i: {}` to empty placeholder
4. Update `d_122` dependency from `"i_122"` to `"h_122"` at [line 1559](src/sections/Section13.js#L1559)

---

### 2.3 ModeManager.updateCalculatedDisplayValues() Update

**Location**: [Section13.js:352-453](src/sections/Section13.js#L352-L453)

**Before** (line 360):
```javascript
const fieldFormats = {
  // Percentages (0dp)
  i_122: "percent-0dp",
  d_124: "percent-0dp",
  // ...
};
```

**After**:
```javascript
const fieldFormats = {
  // Percentages (0dp)
  h_122: "percent-0dp",  // ← Changed from i_122
  d_124: "percent-0dp",
  // ...
};
```

---

### 2.4 Calculation Functions Update

#### calculateCoolingVentilationLoad()

**Location**: [Section13.js:2938-3034](src/sections/Section13.js#L2938-L3034)

**Changes Required**:
- Line 2988: `setFieldValue("i_122", ...)` → `setFieldValue("h_122", ...)`
- Line 3020: `i_122: latentLoadFactor_i122` → `h_122: latentLoadFactor_i122`

#### calculateCoolingSeasonVentilationEnergy()

**Location**: [Section13.js:3682-3761](src/sections/Section13.js#L3682-L3761)

**Changes Required**:
- Line 3745: `if (coolingVentilationResults.i_122 !== undefined)` → `if (coolingVentilationResults.h_122 !== undefined)`
- Line 3746: `setFieldValue("i_122", ...)` → `setFieldValue("h_122", ...)`

---

### 2.5 StateManager Listeners Update

**Location**: [Section13.js:2508-2509](src/sections/Section13.js#L2508-L2509)

**Before**:
```javascript
sm.addListener("cooling_latentLoadFactor", calculateAndRefresh); // Target i_122 affects D122/D123
sm.addListener("ref_cooling_latentLoadFactor", calculateAndRefresh); // Reference i_122 affects ref_D122/ref_D123
```

**After**:
```javascript
sm.addListener("cooling_latentLoadFactor", calculateAndRefresh); // Target h_122 affects D122/D123
sm.addListener("ref_cooling_latentLoadFactor", calculateAndRefresh); // Reference h_122 affects ref_D122/ref_D123
```

---

## 3. Cooling.js Field Definition Updates

**Location**: [src/core/Cooling.js:1233-1255](src/core/Cooling.js#L1233-L1255)

### 3.1 Target Mode Field

**Before** (line 1233-1244):
```javascript
cooling_latentLoadFactor: {
  label: "Latent Load Factor (A6)",
  description: "Psychrometric factor for latent cooling load calculation",
  type: "calculated",
  section: "mechanicalLoads",
  format: "number-3dp",
  unit: "",
  excelRef: "COOLING-TARGET A6",
  dependencies: ["l_20", "l_21", "h_24", "i_59"],
  consumedBy: ["i_122"],  // ← UPDATE THIS
  stage: 1,
},
```

**After**:
```javascript
cooling_latentLoadFactor: {
  label: "Latent Load Factor (A6)",
  description: "Psychrometric factor for latent cooling load calculation",
  type: "calculated",
  section: "mechanicalLoads",
  format: "number-3dp",
  unit: "",
  excelRef: "COOLING-TARGET A6",
  dependencies: ["l_20", "l_21", "h_24", "i_59"],
  consumedBy: ["h_122"],  // ← Changed from i_122
  stage: 1,
},
```

---

### 3.2 Reference Mode Field

**Before** (line 1245-1255):
```javascript
ref_cooling_latentLoadFactor: {
  label: "Latent Load Factor (Reference)",
  description: "Reference model latent load factor",
  type: "calculated",
  section: "mechanicalLoads",
  format: "number-3dp",
  unit: "",
  dependencies: ["ref_l_20", "ref_l_21", "ref_h_24", "ref_i_59"],
  consumedBy: ["ref_i_122"],  // ← UPDATE THIS
  stage: 1,
},
```

**After**:
```javascript
ref_cooling_latentLoadFactor: {
  label: "Latent Load Factor (Reference)",
  description: "Reference model latent load factor",
  type: "calculated",
  section: "mechanicalLoads",
  format: "number-3dp",
  unit: "",
  dependencies: ["ref_l_20", "ref_l_21", "ref_h_24", "ref_i_59"],
  consumedBy: ["ref_h_122"],  // ← Changed from ref_i_122
  stage: 1,
},
```

---

## 4. Other Updates Required

### 4.1 StateManager
✅ **No Changes Required**
- StateManager uses dynamic field IDs
- Automatically handles renamed fields once Section13.js is updated

### 4.2 FieldManager
✅ **No Changes Required**
- FieldManager reads field definitions from sectionRows
- Automatically picks up renamed fields from updated definitions

### 4.3 TooltipManager
✅ **No Changes Required**
- No tooltip definitions exist for `i_121` or `i_122`
- Fields inherit tooltips from their cell definitions in sectionRows

### 4.4 CSV/Excel Import/Export (FileHandler.js)
✅ **No Changes Required**
- Import/export uses dynamic field discovery from FieldManager
- Will automatically handle renamed fields
- **Note**: Existing CSV files with old column headers will still import correctly because import uses row-based matching, not column names

### 4.5 Dependency.js (Dependency Graph Visualization)
✅ **No Changes Required**
- Dependency graph reads dependencies from field definitions
- Automatically updates when field definitions change

### 4.6 Other Sections
✅ **No Impact**
- No other sections reference `i_121` or `i_122`
- Fields are self-contained within Section13

---

## 5. Testing Checklist

### 5.1 Functional Tests
- [ ] Row 121: Verify `h_121` displays "Heating Ventilation Energy Recovered" value
- [ ] Row 121: Verify `m_121` correctly calculates using `h_121` (not `i_121`)
- [ ] Row 122: Verify `h_122` displays "Latent Load Factor %" value
- [ ] Row 122: Verify `d_122` correctly calculates using `h_122` (not `i_122`)
- [ ] Verify `cooling_latentLoadFactor` still populates `h_122` (Target mode)
- [ ] Verify `ref_cooling_latentLoadFactor` still populates `ref_h_122` (Reference mode)

### 5.2 Dual-State Tests
- [ ] Switch to Reference mode → verify `h_121` and `h_122` show Reference values
- [ ] Switch back to Target mode → verify `h_121` and `h_122` show Target values
- [ ] Change HRV efficiency (d_118) → verify `h_121` updates
- [ ] Change indoor RH (i_59) → verify `h_122` updates via Cooling.js

### 5.3 Print Layout Tests
- [ ] Print Section 13 in Tabloid landscape → verify improved alignment
- [ ] Print Section 13 in Letter landscape → verify no horizontal clipping
- [ ] Verify columns H-N are now better balanced

### 5.4 Import/Export Tests
- [ ] Export CSV → verify `h_121` and `h_122` values are exported
- [ ] Import old CSV with `i_121`/`i_122` columns → verify values map correctly
- [ ] Import new CSV with `h_121`/`h_122` columns → verify values import correctly

---

## 6. Implementation Order (Critical Path)

### Phase 1: Section13.js Core Definitions
1. Update Row 121 cell layout (move `i:` → `h:`, set `i: {}`)
2. Update Row 122 cell layout (move `i:` → `h:`, set `i: {}`)
3. Update `m_121` dependency from `"i_121"` to `"h_121"`
4. Update `d_122` dependency from `"i_122"` to `"h_122"`

### Phase 2: Section13.js Field Formats
5. Update `fieldFormats` map: `i_122` → `h_122`

### Phase 3: Section13.js Calculation Functions
6. Update `calculateCoolingVentilationLoad()`: rename all `i_122` references
7. Update `calculateCoolingSeasonVentilationEnergy()`: rename all `i_122` references

### Phase 4: Section13.js Comments
8. Update StateManager listener comments (lines 2508-2509)

### Phase 5: Cooling.js Updates
9. Update `cooling_latentLoadFactor.consumedBy` array
10. Update `ref_cooling_latentLoadFactor.consumedBy` array

### Phase 6: Testing
11. Run full dual-state test suite
12. Test print layouts
13. Test CSV import/export

---

## 7. Rollback Plan

If issues arise during implementation:

1. **Immediate Rollback**: Revert all changes via git
   ```bash
   git checkout main -- src/sections/Section13.js src/core/Cooling.js
   ```

2. **Partial Rollback**: If only one field has issues, revert that field's changes while keeping the other

3. **Known Safe State**: Current commit `55f02c3` is known good

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Calculation breaks for `m_121` | Low | High | Update dependency immediately after field rename |
| Calculation breaks for `d_122` | Low | High | Update dependency immediately after field rename |
| Import fails for old CSVs | Very Low | Medium | FileHandler uses row-based import (not column names) |
| Print layout worse | Low | Medium | Test in all page sizes before commit |
| Reference mode breaks | Low | High | Test dual-state immediately after changes |

**Overall Risk**: ⚠️ **MODERATE** (due to 11 code locations affected)

**Recommendation**: Implement all changes in a single atomic commit to avoid partial state

---

## 9. Files to Modify

| File | Changes | Lines Affected |
|------|---------|----------------|
| [src/sections/Section13.js](src/sections/Section13.js) | 9 updates | 360, 1508-1515, 1530, 1559, 1574-1581, 2508-2509, 2988, 3020, 3745-3746 |
| [src/core/Cooling.js](src/core/Cooling.js) | 2 updates | 1242, 1253 |

**Total**: 2 files, 11 code locations

---

## 10. Commit Message Template

```
Refactor: Move i_121 and i_122 to h_121 and h_122 for print alignment

Move two calculated fields one column left to improve vertical alignment
and reduce horizontal clipping in Letter landscape print layouts.

Changes:
- Row 121: i_121 (Heating Ventilation Energy Recovered) → h_121
- Row 122: i_122 (Latent Load Factor %) → h_122
- Update all dependencies: m_121 now depends on h_121, d_122 on h_122
- Update Cooling.js consumedBy arrays for latent load factor fields
- Update field format maps and calculation function references

Testing:
- ✅ Dual-state calculations verified (Target and Reference modes)
- ✅ Print layout tested (Tabloid, Legal, Letter landscape)
- ✅ CSV import/export tested with both old and new column names

🤖 Co-Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Andy & Claude <andy@openbuilding.ca>
```

---

## Next Steps

1. Review this workplan
2. Confirm print layout improvement is worth the refactor
3. Create feature branch: `git checkout -b REFACTOR-h121-h122`
4. Implement changes following Phase 1-5 order
5. Test thoroughly (Phase 6 checklist)
6. Commit and push
7. Test in browser
8. Create PR if tests pass
