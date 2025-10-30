# 📋 **SECTION-BY-SECTION REFACTOR CHECKLIST**

**Objective**: Complete global elimination with functional alpha after each section  
**Date**: January 14, 2025  
**Status**: 🔄 **ACTIVE**

**⚠️ CRITICAL**: This checklist must be read in conjunction with `README.md` which contains essential StateManager patterns, architectural principles, and anti-patterns to avoid.

---

## 🎯 **REFACTOR STANDARDS (Per README.md)**

### **✅ Requirements for Each Section**

1. **StateManager Centrality** (README.md Point 3)

   - StateManager is the single source of truth for all calculations
   - NO direct DOM manipulation in event handlers or calculation functions
   - NO custom calculation methods like `recalculateField()` that bypass StateManager
   - Use established patterns: `registerCalculation()`, `registerDependency()`, `addListener()`

2. **ModeManager**: Local object with `currentMode` property and global exposure
3. **Helper Functions**: 100% mode-aware, no global fallbacks, following README.md patterns
4. **Event Handlers**: 100% state isolation (user inputs only affect current mode)
5. **Cross-Section Dependencies**: Use StateManager listeners for calculated field updates (README.md Point 3)
6. **DOM Updates**: Only in Target mode for global values
7. **Calculation Engines**: Separate Target/Reference functions

### **❌ Anti-Patterns to Eliminate (Per README.md)**

**StateManager Anti-Patterns:**

- Direct DOM manipulation in event handlers: `element.textContent = value`
- Custom calculation bypasses: `recalculateField()`, `updateValue()`
- Non-existent method calls: `getCalculation()`, `StateManager.registerCalculation()`
- Writing to globals without prefixes: `setValue(fieldId, value)` instead of mode-aware setting

**Cross-Section Communication Anti-Patterns:**

- Direct section-to-section calls: `Section05.calculateSomething()`
- Dependency on load order rather than data availability
- Circular dependencies or broken calculation chains
- Missing StateManager listeners for calculated field updates

**Precision Anti-Patterns:**

- Using `parseFloat()` on formatted strings: `parseFloat("1,234.56")` returns `1`
- Truncating precision during calculation chains
- Not using `window.TEUI.parseNumeric()` for robust parsing

---

## 📊 **CURRENT SECTION STATUS AUDIT**

### **✅ PROPERLY REFACTORED (Clean Pattern)**

- **S02**: ✅ Mode-aware helpers, proper prefix handling
- **S03**: ✅ Complete dual-state architecture, StateManager integration
- **S05**: ✅ Standardized pattern, proper ModeManager
- **S06**: ✅ Standardized helpers, dual-state management
- **S08**: ✅ Mode-aware functions, clean prefix handling

### **❌ NEEDS COMPLETE REFACTOR (100% State Isolation)**

- **S09**: ❌ Global contamination, must implement 100% state isolation
- **S01**: ❌ Mixed patterns, `getRefNumericValue()` with global fallbacks
- **S04**: ❌ Global contamination in Reference calculations
- **S07**: ❌ Has contamination pattern like S09, needs 100% state isolation

### **❓ UNKNOWN STATUS (Need Audit)**

- **S10-S15**: Unknown - require systematic audit using checklist below

---

## 🔍 **SYSTEMATIC SECTION AUDIT CHECKLIST**

### **A. StateManager Integration Compliance (README.md Point 3)**

- [ ] Uses `StateManager.setValue()` for all value updates
- [ ] Uses `StateManager.addListener()` for cross-section calculated field dependencies
- [ ] Uses `StateManager.registerDependency()` for user input dependencies
- [ ] NO direct DOM manipulation in calculations
- [ ] NO custom calculation methods bypassing StateManager

### **B. Helper Function Patterns (README.md Point 11)**

- [ ] `getNumericValue()`: Uses `window.TEUI.parseNumeric()` - NO `parseFloat()`
- [ ] `getFieldValue()`: Reads from StateManager properly
- [ ] `setFieldValue()`: Mode-aware writing with global updates in target mode only
- [ ] `setCalculatedValue()`: Uses `window.TEUI.formatNumber()` for display
- [ ] ALL helpers defined in section IIFE scope, not outside

### **C. Mode Manager Implementation**

- [ ] Local `ModeManager` object with `currentMode` property
- [ ] `switchMode()` function updates UI and triggers calculations
- [ ] Global exposure: `window.TEUI.ModeManager = ModeManager`
- [ ] **CRITICAL**: 100% state isolation - Target mode inputs only affect `target_` state, Reference mode inputs only affect `ref_` state

### **D. Event Handling Patterns (README.md Point 12)**

- [ ] `contenteditable` fields use proper blur/keydown handlers defined in section scope
- [ ] Dropdown handlers use StateManager.setValue() then call calculateAll()
- [ ] NO direct element.textContent manipulation in event handlers
- [ ] Event handlers implement 100% state isolation

### **E. Cross-Section Communication (README.md Point 3)**

- [ ] Uses StateManager listeners for updates from calculated fields in other sections
- [ ] Dependencies properly registered with StateManager
- [ ] NO direct calls to other section modules
- [ ] Calculation chains respect dependency order

### **F. Calculation Engine Structure**

- [ ] `calculateAll()`: Calls both Target and Reference engines
- [ ] Target engine: Uses mode-aware helpers or reads from target\_/global state
- [ ] Reference engine: Uses mode-aware helpers reading only ref\_ state
- [ ] NO contamination: Reference calculations never write to global state

---

## 🚀 **SECTION-BY-SECTION EXECUTION PLAN**

### **Phase 1: Fix Critical Contamination (S07, S09)**

**Priority 1: S09 Occupant & Internal Gains**

- **Issue**: Event handlers write to both `target_` and `ref_` states simultaneously
- **Pattern**: Use S03 Climate as template (clean dual-state implementation)
- **Fix**: User inputs only update current mode's state
- **Validation**: Target and Reference can have completely different occupancy patterns

**Priority 2: S07 Water Use**

- **Issue**: Same contamination pattern as S09
- **Pattern**: Follow S03 template for 100% state isolation
- **Fix**: Separate water use scenarios for Target vs Reference models

### **Phase 2: Complete Global Elimination (S01, S04, S10-S15)**

**S01 Key Values**

- **Current Issue**: Mixed patterns, legacy helpers with global fallbacks
- **Required Fix**: Implement proper mode-aware helpers per README.md Point 11
- **Validation**: Dashboard shows correct Target/Reference TEUI independently

**S04 Actual vs Target Energy**

- **Current Issue**: Reference calculations contaminating global state
- **Required Fix**: Reference engine must read only ref\_ prefixed values
- **Integration**: Must use StateManager listeners for S15 dependencies per README.md

**S10-S15 Systematic Audit**

- Use checklist above for each section
- Apply S03 pattern for any needed corrections
- Ensure StateManager centrality throughout

### **Phase 3: Cross-Section Integration Cleanup**

**StateManager Listener Implementation (README.md Point 3)**

- Identify all calculated field dependencies between sections
- Replace any direct section calls with StateManager listeners
- Ensure proper event sequencing per README.md guidance

**Dependency Registration Cleanup**

- Audit all `registerDependency()` calls
- Ensure `addListener()` used for calculated field updates
- Remove any non-existent method calls

---

## 🎯 **SUCCESS CRITERIA**

### **Per Section Validation**

1. **100% State Isolation**: User inputs only affect current mode's state
2. **StateManager Compliance**: All updates go through StateManager
3. **Cross-Section Clean**: Uses only StateManager listeners, no direct calls
4. **Helper Functions**: Use global utilities (`parseNumeric`, `formatNumber`)
5. **Event Handling**: Proper patterns per README.md Point 12

### **System-Level Validation**

1. **No Global Contamination**: Changing Reference values never affects Target calculations
2. **Complete Independence**: Target and Reference can be entirely different buildings
3. **Calculation Stability**: Results match Excel regardless of mode switching
4. **Performance**: No excessive recalculations or UI lag

---

## 📝 **IMPLEMENTATION NOTES**

### **Template Sections for Reference**

- **S03 Climate**: Gold standard for dual-state architecture
- **S05 Typology**: Good example of proper ModeManager implementation
- **README.md Points 3, 11, 12**: Essential patterns for StateManager, helpers, events

### **Critical Memory Reference**

[[memory:141113]] - Documents the 100% state isolation requirement and contamination patterns found in S07, S09. User inputs should ONLY write to current mode's state for complete independence.

### **Testing Strategy**

1. **State Isolation Test**: Change Reference values, verify Target calculations unchanged
2. **Mode Independence Test**: Configure completely different buildings in each mode
3. **Excel Parity Test**: Ensure calculations match Excel in both modes
4. **Cross-Section Test**: Verify StateManager listeners work for calculated dependencies

---

**Next Action**: Start with S09 refactor using S03 as template, implementing 100% state isolation for user inputs and eliminating all global contamination patterns.
