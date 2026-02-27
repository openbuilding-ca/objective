# 🎯 **TEUI 4.012RF - CLEAN REFACTORING PLAN**

**Date Updated**: June 30, 2025 - 9:06 PM  
**Status**: ✅ **BREAKTHROUGH ACHIEVED** - Automatic Reference mode now loads ReferenceValues & triggers calculations  
**Branch**: `solstice-v4012-refactor`

---

## 🏆 **ARCHITECTURAL VISION - THE ARCHITECT'S WORKFLOW**

### **Real-World Use Case**

An architect needs to compare their efficient Target design against different building code minimum standards:

1. **Target Model**: User's efficient design (heat pump, high insulation, etc.)
2. **Reference Model**: Code minimum standard (OBC SB12 3.1.1.2.A3 gas furnace vs OBC SB12 3.1.1.2.C4 heaptump - superior)
3. **Comparison Layer**: Visual indicators showing Target vs Reference performance
4. **Flexibility**: Change d_13 dropdown to compare against different code standards

**Goal**: Build **"Excel for Building Performance"** with real-time calculations, visual comparisons, and professional workflow support.

### **Current Achievement**

✅ **Reference mode toggle now works automatically**  
✅ **Target TEUI stable at 93.6 regardless of Reference changes**  
✅ **Reference TEUI shows proper values (~162.65) representing code minimums**  
✅ **Complete dual-state isolation maintained**

---

## 📋 **LOGICAL PATH FORWARD**

### **Phase 1: Foundation Cleanup (Next 2-3 commits)**

#### **1.1 Systematic Section Review**

```bash
# Priority order based on contamination risk:
S15 ✅ FIXED - TEUI calculation engine (h_10/e_10 updates)
S01 ✅ FIXED - Dashboard display (h_10 styling issues)
S04 ✅ FIXED - Emissions calculations (ref_k_32)
S03 ✅ FIXED - Climate data (template pattern)
S02 ✅ FIXED - Building Info (systematic refactor complete)
S05 ✅ FIXED - Typology and Form (systematic refactor complete)
S06 ✅ FIXED - Opaque Assemblies Heat Loss (systematic refactor complete)
S07 ✅ FIXED - Water Use (EXEMPLARY dual-state + UI preservation)
S08 ✅ FIXED - Indoor Air Quality (dual-state + S13 RH integration TODO)
S09 🔄 NEXT - Occupant & Internal Gains (starting from stable backup)
S10 📋 QUEUE - Infiltration & Ventilation
S11-S14 📋 QUEUE - Remaining calculation sections
```

#### **1.2 Eliminate Remaining Global State Pollution**

- Search for direct `setValue(fieldId, ...)` without prefix awareness
- Convert to mode-aware `setFieldValue()` pattern
- Ensure all cross-section communication uses prefixed values
- Remove legacy hybrid patterns from README.md

#### **1.3 Standardize Helper Functions**

Every section must have:

```javascript
// ✅ Mode-aware reading
function getNumericValue(fieldId) {
  const prefix = ModeManager.currentMode === "target" ? "target_" : "ref_";
  return (
    window.TEUI.parseNumeric(StateManager.getValue(`${prefix}${fieldId}`)) || 0
  );
}

// ✅ Mode-aware writing with global updates in target mode only
function setFieldValue(fieldId, value, fieldType = "calculated") {
  const modePrefix = ModeManager.currentMode === "target" ? "target_" : "ref_";
  StateManager.setValue(`${modePrefix}${fieldId}`, value, fieldType);

  if (ModeManager.currentMode === "target") {
    StateManager.setValue(fieldId, value, fieldType); // Global for DOM
  }
}
```

### **Phase 2: Enhanced d_13 Reference System (Next Major Feature)**

#### **2.1 Smart d_13 Integration**

```javascript
// When d_13 changes (e.g., "OBC A3" → "OBC C4"):
onD13Change(newStandard) {
  // 1. Load new reference dataset
  const referenceData = ReferenceValues.getStandard(newStandard);

  // 2. Write ONLY to ref_ prefixed states
  Object.entries(referenceData).forEach(([fieldId, value]) => {
    StateManager.setValue(`ref_${fieldId}`, value, "reference-standard");
  });

  // 3. Trigger ONLY Reference calculations
  calculateReferenceModel();

  // 4. Update comparison indicators (T-cells)
  updateComparisonIndicators();
}
```

#### **2.2 Visual Comparison Layer (T-cells)**

```javascript
// T-cells showing Target vs Reference performance
function updateComparisonIndicators() {
  const targetTEUI = StateManager.getValue("target_h_10");
  const referenceTEUI = StateManager.getValue("ref_h_10");
  const improvement = ((referenceTEUI - targetTEUI) / referenceTEUI) * 100;

  // Show green checkmark + percentage if Target is better
  displayComparison(
    "h_10",
    improvement > 0 ? "✅" : "❌",
    `${improvement.toFixed(1)}%`,
  );
}
```

### **Phase 3: Advanced Features**

#### **3.1 Multi-Standard Comparison**

- Side-by-side comparison of multiple standards
- "What-if" scenarios with different d_13 values
- Export comparison reports

#### **3.2 Field-Level Granularity**

- Individual field comparisons (insulation, equipment, etc.)
- Color-coded performance indicators
- Detailed breakdown of where improvements come from

### **Phase 4: Performance & Dependency Graph Optimization (Post-Refactor)**

**Objective**: Transition from coarse-grained `calculateAll()` triggers to a fine-grained, dependency-driven calculation model using `Dependency.js`. This will eliminate UI lag (as seen in S09) and ensure maximum calculation efficiency.

**Context**: The dual-state refactoring, by making calculation chains more robust and synchronous, has correctly exposed performance bottlenecks. The ~2-second lag when changing "Occupied Hrs/Day" in S09 is a perfect example. The issue is not the _volume_ of calculation, but the _strategy_—recalculating entire sections is inefficient.

**Action Plan**:

1.  **Audit `addStateManagerListeners`**: Systematically review the dependency listeners in all 15 sections.
2.  **Replace Coarse Triggers**: Replace broad `calculateAll()` handlers with calls to more granular, specific calculation functions (e.g., `calculatePlugLoads()`, `calculateTotals()`).
3.  **Implement Calculation Orchestrator**: Investigate a central orchestrator that, upon a state change, queries the `Dependency.js` graph to build a precise list of only the downstream functions that need to be re-run.
4.  **Performance Goal**: User interactions should feel instantaneous, with UI updates completing in under 100ms.

---

## 🔧 **IMMEDIATE NEXT STEPS (Next 24 Hours)**

### **Step 1: Fix Section 01 Display Issues**

**Priority**: 🚨 **CRITICAL** - Affects main dashboard UX

- Fix h_10 styling/animation issues caused by Section 15 updates
- Ensure Section 01's specialized `updateDisplayValue` function is properly called
- Verify tier indicators and smooth transitions work correctly

### **Step 2: Systematic Section Review Checklist**

Create standardized review for each section (S02, S05-S14):

#### **A. Mode Manager Integration**

- [ ] Local `ModeManager` object with `currentMode` property
- [ ] `switchMode()` function that updates UI and triggers calculations
- [ ] Global exposure: `window.TEUI.ModeManager = ModeManager`

#### **B. Helper Function Patterns**

- [ ] `getNumericValue()`: Mode-aware reading with prefix logic
- [ ] `setFieldValue()`: Mode-aware writing with global updates in target mode only
- [ ] `setCalculatedValue()`: Standardized helper for calculated field updates
- [ ] Field type preservation: "derived" and "calculated" remain as StateManager states

#### **C. Calculation Engine Structure**

- [ ] `calculateAll()`: Calls both Target and Reference engines
- [ ] Target engine: Reads from target\_ prefixed or global state
- [ ] Reference engine: Reads from ref\_ prefixed state exclusively
- [ ] No contamination: Reference calculations never write to global state

#### **D. Cross-Section Communication**

- [ ] Output fields: Final values update both prefixed AND global fields
- [ ] Input dependencies: Use StateManager listeners for cross-section updates
- [ ] Mode isolation: Target calculations stable regardless of Reference changes

### **Step 3: Enhanced d_13 ReferenceValues Integration**

Build the proper integration that:

- Loads complete datasets based on standard selection
- Maintains perfect state isolation
- Enables architect workflow (OBC A3 vs OBC C4 comparison)
- Never contaminates Target model state

---

## 🚨 **CRITICAL ANTI-PATTERNS TO ELIMINATE**

### **❌ Global State Pollution**

```javascript
// WRONG: Reference mode writing to globals
if (isReferenceMode()) {
  StateManager.setValue("d_20", value, "calculated"); // Contaminates Target
}

// ✅ CORRECT: Mode-aware writing
const prefix = ModeManager.currentMode === "target" ? "target_" : "ref_";
StateManager.setValue(`${prefix}d_20`, value, "calculated");
```

### **❌ Missing Mode Awareness**

```javascript
// WRONG: Direct field access without considering current mode
const hdd = getNumericValue("d_20"); // Should consider target_ vs ref_ prefix

// ✅ CORRECT: Mode-aware reading
function getNumericValue(fieldId) {
  const prefix = ModeManager.currentMode === "target" ? "target_" : "ref_";
  return StateManager.getValue(`${prefix}${fieldId}`);
}
```

### **❌ Inconsistent Prefix Usage**

```javascript
// WRONG: Mixing prefixed and unprefixed in same function
setCalculatedValue("target_h_10", value); // DOM looks for "h_10"
setCalculatedValue("d_135", value); // Inconsistent with above

// ✅ CORRECT: Final sections update both prefixed AND global
setCalculatedValue("h_10", value); // Updates target_h_10 AND h_10
```

---

## 📊 **PROGRESS TRACKING**

### **Completed Milestones**

- ✅ **S03**: Template pattern for mode-aware field handling
- ✅ **S04**: Reference emissions calculation (ref_k_32)
- ✅ **S15**: TEUI calculation engine with proper h_10/e_10 updates
- ✅ **Automatic Reference Mode**: Loads ReferenceValues & triggers calculations
- ✅ **State Isolation**: Target h_10 stable at 93.6 regardless of Reference toggle

### **Next 24 Hours Goals**

- 🔄 **S01**: Fix dashboard display styling issues
- 📋 **S02, S05-S14**: Systematic review using standardized checklist
- 🎯 **d_13 Enhancement**: Proper ReferenceValues integration

### **Success Metrics**

1. **No State Contamination**: Target values never change when Reference mode changes
2. **Proper Comparisons**: Reference TEUI consistently higher than Target (code minimums)
3. **Visual Feedback**: Clear indicators showing Target vs Reference performance
4. **Architect Workflow**: Easy switching between different code standards (d_13)

---

**Template Pattern**: Use `sections/4011-Section03.js` as canonical example for all future development.

**Architecture Status**: 🏗️ **Foundation Complete** - Ready for advanced comparison features.

# 🚨 **DOCUMENTATION MOVED**

## **Current Documentation Location**

This file has been replaced with clean, actionable documentation:

- **Primary Guide**: `4012-CLEAN-REFACTOR-GUIDE.md` - Complete implementation guide
- **Quick Reference**: `4012-QUICK-PATTERNS.md` - Essential patterns for daily use
- **Architecture**: `../OBJECTIVE 4012/documentation/ARCHITECTURE-COMPARISON.md` - Design principles

## **Why This Change**

The original document was too verbose and repetitive for practical use. The new documentation is:

- ✅ **Concise** - Essential information only
- ✅ **Actionable** - Clear patterns and examples
- ✅ **Up-to-date** - Reflects completed dual-state architecture
- ✅ **Agent-friendly** - Easy for future agents to understand

---

## 📋 **Architecture Summary**

**Status**: ✅ **MILESTONE COMPLETE** - All 15 calculation sections (S01-S15) converted to dual-state tuples-based system with complete state isolation.

**Template**: Use `sections/4011-Section03.js` as the canonical pattern for any future development.

**Key Achievement**: Target h_10 remains stable at 93.6 regardless of Reference toggle changes - no more state contamination.

**Critical Pattern**: Sections that read other sections' outputs (like S15) must use mode-aware reading with prefixed values.

---

## 🔧 **Target/Reference Prefix Patterns & Section Review Framework**

### **Critical Prefix Rules (Updated 2025-01-14)**

Following the h_10 contamination fix and S09 state isolation clarification, all sections must adhere to these patterns:

#### **1. Field Value Setting Patterns - 100% STATE ISOLATION**

```javascript
// ✅ CORRECT: Mode-aware setting with 100% state isolation
function setFieldValue(fieldId, value, fieldType = "calculated") {
  const modePrefix = ModeManager.currentMode === "target" ? "target_" : "ref_";
  const prefixedFieldId = `${modePrefix}${fieldId}`;

  // Always store with prefix for dual-state isolation
  window.TEUI.StateManager?.setValue(prefixedFieldId, value, fieldType);

  // CRITICAL: Only update global state in target mode (for DOM display)
  if (ModeManager.currentMode === "target") {
    window.TEUI.StateManager?.setValue(fieldId, value, fieldType);
    // Update DOM element
    updateDOMElement(fieldId, value);
  }
}

// ❌ WRONG: Writing to both states creates contamination
window.TEUI.StateManager.setValue(fieldId, value, "user-modified");
window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, "user-modified");
```

#### **2. User Input Event Handlers - 100% STATE ISOLATION**

```javascript
// ✅ CORRECT: User inputs only affect current mode's state
function handleUserInput(fieldId, newValue) {
  const modePrefix = ModeManager.currentMode === "target" ? "target_" : "ref_";
  window.TEUI.StateManager.setValue(
    `${modePrefix}${fieldId}`,
    newValue,
    "user-modified",
  );

  // Only update global state in target mode (for DOM display)
  if (ModeManager.currentMode === "target") {
    window.TEUI.StateManager.setValue(fieldId, newValue, "user-modified");
  }
}

// ❌ WRONG: Shared geometry concept violates 100% isolation
window.TEUI.StateManager.setValue(fieldId, newValue, "user-modified");
window.TEUI.StateManager.setValue(`ref_${fieldId}`, newValue, "user-modified");
```

#### **3. Cross-Section Output Patterns**

```javascript
// ✅ CORRECT: Final calculation sections (like S15) update global fields
setCalculatedValue("h_10", teui_h136); // Updates both target_h_10 AND h_10
setCalculatedValue("e_10", ref_teui_h136); // Updates both ref_e_10 AND e_10

// ❌ WRONG: Only updating prefixed values
setCalculatedValue("target_h_10", teui_h136); // DOM can't find this
```

#### **4. Mode-Aware Reading Patterns**

```javascript
// ✅ CORRECT: Mode-aware reading with fallbacks
function getNumericValue(fieldId) {
  const prefix = ModeManager.currentMode === "target" ? "target_" : "ref_";
  const prefixedValue = window.TEUI.StateManager.getValue(
    `${prefix}${fieldId}`,
  );
  const globalValue = window.TEUI.StateManager.getValue(fieldId);

  return window.TEUI.parseNumeric(prefixedValue) || 0;
}

// ❌ WRONG: Direct global reading without mode awareness
const value = window.TEUI.StateManager.getValue("d_20"); // Ignores current mode
```

### **Section Review Checklist**

Each of the 15 calculation sections (S01-S15) should be reviewed for:

#### **A. Mode Manager Integration**

- [ ] **ModeManager defined**: Local `ModeManager` object with `currentMode` property
- [ ] **Mode switching**: `switchMode()` function that updates UI and triggers calculations
- [ ] **Global exposure**: `window.TEUI.ModeManager = ModeManager` for cross-section access

#### **B. Helper Function Patterns**

- [ ] **getNumericValue()**: Mode-aware reading with prefix logic
- [ ] **setFieldValue()**: Mode-aware writing with global updates in target mode only
- [ ] **setCalculatedValue()**: Standardized helper for calculated field updates
- [ ] **Field type preservation**: "derived" and "calculated" remain as StateManager value states

#### **C. Calculation Engine Structure**

- [ ] **calculateAll()**: Calls both Target and Reference engines
- [ ] **Target engine**: Reads from target\_ prefixed or global state
- [ ] **Reference engine**: Reads from ref\_ prefixed state exclusively
- [ ] **No contamination**: Reference calculations never write to global state

#### **D. Cross-Section Communication**

- [ ] **Output fields**: Final values update both prefixed AND global fields
- [ ] **Input dependencies**: Use StateManager listeners for cross-section updates
- [ ] **Mode isolation**: Target calculations stable regardless of Reference changes

### **Priority Review Order**

1. **S15 (TEUI Summary)** - ✅ **FIXED** - Now properly updates h_10 and e_10 globals
2. **S01 (Key Values)** - Dashboard display section, critical for user experience
3. **S03 (Climate)** - ✅ **FIXED** - Template pattern for mode-aware field handling
4. **S04 (Emissions)** - ✅ **FIXED** - Reference emissions calculation restored
5. **S02, S05-S14** - Remaining calculation sections for systematic review

### **Common Anti-Patterns to Fix**

#### **❌ Global State Pollution**

```javascript
// WRONG: Reference mode writing to globals
if (isReferenceMode()) {
  window.TEUI.StateManager.setValue("d_20", value, "calculated"); // Contaminates Target
}
```

#### **❌ Missing Mode Awareness**

```javascript
// WRONG: Direct field access without considering current mode
const hdd = getNumericValue("d_20"); // Should consider target_ vs ref_ prefix
```

#### **❌ Inconsistent Prefix Usage**

```javascript
// WRONG: Mixing prefixed and unprefixed in same function
setCalculatedValue("target_h_10", value); // DOM looks for "h_10"
setCalculatedValue("d_135", value); // Inconsistent with above
```

---

**For Implementation Details**: See `4012-CLEAN-REFACTOR-GUIDE.md`  
**For Quick Patterns**: See `4012-QUICK-PATTERNS.md`

---

## 🚨 **Architectural Debt & Documentation Cleanup Plan**

**Objective**: Eliminate legacy patterns from the codebase and documentation that conflict with the pure dual-state architecture. The project's stability depends on fully committing to the prefixed-value system (`ref_` and `target_`) and removing all reliance on shared, unprefixed "global" states.

### **1. Identify and Deprecate Flawed Documentation in `README.md`**

The main `README.md` file contains several outdated architectural patterns that are now considered harmful. The following sections must be reviewed and refactored or removed to align with the `4012-CLEAN-REFACTOR-GUIDE.md`:

- **❌ Flawed Pattern: "StateManager as Single Source of Truth"**

  - **Legacy Advice**: The code example shows `window.TEUI.StateManager.setValue(fieldId, ...)` which writes only to the global state.
  - **Conflict**: This directly causes state contamination.
  - **Action**: Replace this example with the new mode-aware `setCalculatedValue` pattern that correctly writes to `ref_` or `target_` prefixed states based on the current UI mode.

- **❌ Flawed Pattern: "Cross-State Contamination Fix (V2)"**

  - **Legacy Advice**: Introduces complex helper functions like `getRefFieldValue` that contain layered fallback logic (e.g., "try reference, then try application").
  - **Conflict**: This is a transitional pattern that obscures the simple purity of the new architecture. The new pattern is to read the exact prefixed value needed (`StateManager.getValue('ref_d_22')`) without ambiguity.
  - **Action**: Deprecate these complex helpers in favor of direct, explicit prefixed state access.

- **❌ Flawed Pattern: "HYBRID IT-DEPENDS ARCHITECTURE"**
  - **Legacy Advice**: Shows examples of writing to global state (`setCalculatedValue("i_80", ...)`) and suggests a hybrid model.
  - **Conflict**: The "hybrid" approach is the source of our technical debt. The project's direction is to eliminate this middle ground.
  - **Action**: Remove this section or heavily revise it to explain why this pattern has been superseded by the pure dual-state model.

### **2. The Correct Path for `d_13` Reference Standard Logic**

When refactoring the logic for the `d_13` dropdown (Reference Standard selection), we must adhere to the following strict pattern to avoid repeating past mistakes:

1.  **Listen**: The event listener for the `d_13` dropdown triggers a single function.
2.  **Fetch**: This function gets the reference dataset from `ReferenceValues.js`.
3.  **Write to `ref_` ONLY**: The function iterates through the dataset and writes every value **exclusively to its `ref_` prefixed state** in the `StateManager` (e.g., `StateManager.setValue('ref_h_115', ...)`).
4.  **NEVER Write to Globals**: At no point should this process write to an unprefixed field ID. This is non-negotiable.
5.  **Trigger Reference Calculation**: After setting all the `ref_` values, the function should explicitly trigger **only** the `calculateReferenceModel()` chain. This ensures the Target model is never affected.
