# NOV10-CLEANUP: Code Quality & Warning Cleanup

**Branch:** `nov10-cleanup` (to be created Nov 10, 2025)
**Status:** Planning
**Goal:** Eliminate fallbacks, reduce warning verbosity, improve code quality per 4012-CHEATSHEET.md principles

---

## Background

During S01-S07 dependency mapping work (Nov 9, 2025), we discovered Logs.md had grown to **28,637 lines** of warnings, a 7x increase from ~3,908 lines. Analysis revealed:

1. **Dependency work is NOT the cause** - our label/dependency additions are purely metadata
2. **Most warnings are from cascading calculation cycles** - same warnings logged repeatedly
3. **Fallbacks mask problems** - per CHEATSHEET.md, we should "error hard and fix bugs" not silently fallback
4. **Only 1 CRITICAL issue found** - S07 ref_d_63 fallback (✅ fixed in commit 06eded8)

---

## Warning Breakdown (28,637 total lines)

| Warning Type | Count | Severity | Root Cause | Priority |
|--------------|-------|----------|------------|----------|
| **DOM element not found** | 844 | Low | S12 writes to fields before sections render | P2 |
| **S13 fallback reads** | 134 | Info | cooling_m_124 falls back to m_19 | P3 |
| **S07 ref_d_63** | 5 | Low | ✅ **FIXED** (commit 06eded8) | ✅ Done |
| **S15 missing upstream** | Unknown | Info | Dependency timing issues | P3 |
| **Stack traces (noise)** | ~27,000 | None | Verbose logging of calculation cycles | P1 |

---

## Detailed Findings

### 1. DOM Element Not Found (844 occurrences)

**Most common missing elements:**
- S12 fields: `d_101`, `d_102`, `d_106`, `g_101`, `g_104`, `g_105`, `i_103`, `i_104`, `i_105`
- S12 envelope fields: `k_101`, `k_103`, `k_104`, `j_101`, `h_101`, `l_101`, `l_103`, `l_107`, `l_110`

**Root Cause:**
Section12.js tries to write calculated values to DOM elements during `calculateTargetModel()` and `calculateReferenceModel()`, but these sections may not be rendered yet.

**Example Stack Trace:**
```
Section12.js:1311 DOM element not found for calculated field: d_101
setCalculatedValue @ Section12.js:1311
calculateVolumeMetrics @ Section12.js:1483
calculateTargetModel @ Section12.js:2423
calculateAll @ Section12.js:2284
onSectionRendered @ Section12.js:2666
```

**Impact:** Low - calculations complete correctly, values eventually sync when sections render

**Fix Strategy:**
1. Add defensive check in S12's `setCalculatedValue()` before DOM updates
2. Or defer S12 calculations until all dependent sections are confirmed rendered
3. Or remove DOM updates from calculation functions (write to StateManager only)

---

### 2. S13 Fallback Reads (134 occurrences)

**Pattern:**
```
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
```

**Root Cause:**
Section13 (Mechanical Loads) attempts to read `cooling_m_124` (from cooling calculations), but falls back to `m_19` (Net Heating Demand) when unavailable.

**Analysis:**
- This is a **working-as-designed** fallback pattern
- The fallback logic is intentional, not an error
- However, per CHEATSHEET.md: "Fallbacks mask problems and cause silent failure"

**CHEATSHEET.md Principle:**
> "Our goal is to remove fallbacks so we can error hard and fix bugs"

**Fix Strategy:**
1. Investigate if `cooling_m_124` should always be available when S13 calculates
2. Check Calculator.js section order - does Cooling calculate before S13?
3. If timing issue: reorder sections or add explicit dependency wait
4. If legitimate fallback: keep logic but reduce logging verbosity to DEBUG level
5. **Decision required:** Is this a bug masked by fallback, or intentional design?

---

### 3. S07 ref_d_63 Fallback (✅ FIXED)

**Issue:** 5 CRITICAL warnings during initialization

**Root Cause:** S07 calculated before S09 published `ref_d_63` (total occupants)

**Fix Applied (commit 06eded8):**
- Changed fallback from `0` to `126` (S09's default occupancy)
- Removed console.warn (normal initialization behavior)
- Updated header comment

**Status:** ✅ Complete - no further action needed

---

### 4. Calculation Cycle Logging (~27,000 lines)

**Pattern:**
Every calculation logs full stack traces showing:
```
calculateAll @ Section03.js:1803
(anonymous) @ Section03.js:2672
StateManager.js:574 notifyListeners
setValue @ StateManager.js:442
calculateTargetModel @ Section13.js:3182
```

**Root Cause:**
- Each StateManager setValue triggers notifyListeners
- notifyListeners triggers dependent section recalculations
- Each recalculation logs its call stack
- Result: same warning logged 20+ times per page load

**Impact:**
- Logs.md becomes unusable (28,637 lines)
- Hard to find actual errors in the noise
- Performance impact (logging overhead)

**Fix Strategy:**
1. Implement log level system (ERROR, WARN, INFO, DEBUG)
2. Move stack traces to DEBUG level
3. Only show ERROR/WARN in production
4. Add configuration: `window.TEUI.logLevel = 'WARN'`

---

## Workplan: NOV10-CLEANUP Branch

### Phase 1: Setup & Configuration (Priority 1)

**Task 1.1: Copy ESLint + Prettier configs from legacy codebase**
- Source: Previous project with working ESLint/Prettier setup
- Copy `.eslintrc.js` (or `.eslintrc.json`)
- Copy `.prettierrc`
- Copy relevant scripts to `package.json`
- Run `npm install` to add dependencies

**Task 1.2: Implement Log Level System**
- Create `src/core/Logger.js` utility
- Add log levels: ERROR, WARN, INFO, DEBUG
- Replace all `console.log()`, `console.warn()`, `console.error()` with Logger calls
- Add configuration: `window.TEUI.config.logLevel`
- Default to WARN in production, DEBUG in development

**Files to Update:**
- All Section*.js files (S01-S17)
- StateManager.js
- Calculator.js
- FieldManager.js

**Expected Impact:** Reduce Logs.md from 28,637 lines to <100 lines

---

### Phase 2: Eliminate Fallbacks (Priority 1 - Per CHEATSHEET.md)

**Task 2.1: S13 cooling_m_124 Fallback Investigation**

1. **Analyze:** Why is `cooling_m_124` unavailable when S13 calculates?
   - Check Calculator.js section order
   - Check if Cooling module calculates before S13
   - Review Section13.js:3018 fallback logic

2. **Decision Tree:**
   - If timing issue → Fix calculation order in Calculator.js
   - If missing field → Add proper initialization in Cooling module
   - If intentional design → Document why, add error handling, reduce log level

3. **Test:** Verify cooling values available before S13 runs

**Task 2.2: Audit All Fallback Patterns**

Search codebase for fallback patterns:
```bash
grep -rn "fallback" src/sections/
grep -rn "|| 0" src/sections/  # Numeric fallbacks
grep -rn "|| \"\"" src/sections/  # String fallbacks
grep -rn "|| null" src/sections/
```

**For each fallback found:**
1. Document why it exists
2. Determine if it masks a bug
3. Either: Fix root cause OR Document as intentional
4. Add proper error handling

**Goal:** Every fallback should be **intentional and documented**, not hiding bugs

---

### Phase 3: S12 DOM Timing Issues (Priority 2)

**Task 3.1: Fix S12 "DOM element not found" warnings**

**Option A (Defensive): Add DOM checks before updates**
```javascript
function setCalculatedValue(fieldId, value) {
  const element = document.querySelector(`[data-field-id="${fieldId}"]`);
  if (!element) {
    // Element not rendered yet - value will sync when section renders
    return;
  }
  element.textContent = formatValue(value);
}
```

**Option B (Architectural): Separate calculation from rendering**
```javascript
// Calculations only write to StateManager
function calculateVolumeMetrics() {
  const d_101 = calculateValue();
  window.TEUI.StateManager.setValue("d_101", d_101, "calculated");
  // Don't touch DOM here
}

// Rendering reads from StateManager
function updateDisplayValues() {
  const value = window.TEUI.StateManager.getValue("d_101");
  const element = document.querySelector(`[data-field-id="d_101"]`);
  if (element) element.textContent = formatValue(value);
}
```

**Recommendation:** Option B (cleaner separation of concerns)

**Files to Update:**
- Section12.js (844 warnings)
- Review other sections for similar patterns

---

### Phase 4: Code Quality Review (Priority 2)

**Task 4.1: Run ESLint on all files**
```bash
npx eslint src/**/*.js --fix
```

**Task 4.2: Run Prettier on all files**
```bash
npx prettier --write "src/**/*.js"
```

**Task 4.3: Review and fix ESLint errors**
- Unused variables
- Missing semicolons
- Inconsistent quotes
- Console statements (convert to Logger)

**Task 4.4: Add pre-commit hooks (optional)**
- Install husky: `npm install --save-dev husky`
- Add pre-commit hook to run ESLint + Prettier
- Ensures code quality on every commit

---

### Phase 5: Testing & Validation (Priority 1)

**Task 5.1: Visual Regression Testing**
- Load app with new logging system
- Verify all sections render correctly
- Verify calculations still work
- Compare before/after screenshots

**Task 5.2: Log Output Validation**
- Clear Logs.md
- Reload app with logLevel=WARN
- Verify Logs.md < 100 lines
- Verify only real errors/warnings logged

**Task 5.3: Performance Testing**
- Measure page load time before/after
- Measure calculation time before/after
- Verify no performance regression

---

## Success Criteria

1. ✅ Logs.md reduced from 28,637 lines to <100 lines (97% reduction)
2. ✅ All fallbacks documented and justified (no hidden bugs)
3. ✅ ESLint + Prettier configured and running
4. ✅ S12 DOM warnings eliminated (0 occurrences)
5. ✅ S13 fallback either fixed or documented as intentional
6. ✅ Log level system implemented (ERROR, WARN, INFO, DEBUG)
7. ✅ All calculations still work correctly (no regressions)
8. ✅ Code quality improved (consistent formatting, no lint errors)

---

## Timeline Estimate

- **Phase 1 (Setup):** 2-3 hours
- **Phase 2 (Fallbacks):** 4-6 hours (depends on number of fallbacks found)
- **Phase 3 (S12 DOM):** 2-3 hours
- **Phase 4 (Code Quality):** 2-3 hours
- **Phase 5 (Testing):** 2-3 hours

**Total:** 12-18 hours of focused work

---

## Notes & Considerations

### Why This Matters (Per CHEATSHEET.md)

> **Fallbacks mask problems and cause silent failure. Our goal is to remove them so we can error hard and fix bugs.**

Current situation:
- S13 silently falls back when `cooling_m_124` unavailable
- User has no idea cooling calculations might be wrong
- Bug could persist in production unnoticed

Desired situation:
- If `cooling_m_124` unavailable, app errors loudly
- Developer forced to fix root cause
- User sees accurate calculations or clear error message

### Technical Debt Consideration

The 28,637 lines of warnings represent **technical debt**. While the app works, the noise makes it impossible to spot real issues. This cleanup work is an investment in:

1. **Developer productivity** - Can actually use Logs.md to debug
2. **Code quality** - ESLint/Prettier catch errors early
3. **Maintainability** - Clear separation of concerns (calculation vs. rendering)
4. **Reliability** - Error hard instead of silent failures

---

## Related Documentation

- [4012-CHEATSHEET.md](./history%20(completed)/4012-CHEATSHEET.md) - "Error hard, fix bugs" principle
- [Zen-Observations.md](./Zen-Observations.md) - Current dependency mapping work (S01-S15)
- [Logs.md](./Logs.md) - Current warnings (28,637 lines)

---

## Branch Strategy

1. **dependency2 branch** - Continue S08-S15 dependency mapping (current work)
2. **nov10-cleanup branch** - Create Nov 10, 2025 for this cleanup work
3. **Merge order:**
   - Complete dependency2 → merge to main
   - Then nov10-cleanup → merge to main
   - Keeps work streams separate and reviewable

---

**Created:** Nov 9, 2025
**Last Updated:** Nov 9, 2025
**Next Action:** Create `nov10-cleanup` branch on Nov 10, 2025
