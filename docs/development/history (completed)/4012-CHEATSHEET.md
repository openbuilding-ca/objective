# 🏆 4012 DUAL-STATE ARCHITECTURE - COMPLIANCE CHEATSHEET

This document serves as the **sole, comprehensive architectural compliance guide** for the TEUI 4.011 codebase. It consolidates the original `DUAL-STATE-CHEATSHEET.md` with the critical anti-patterns and debugging insights from `UNTANGLE.md`.

**This is the single source of truth for completing the dual-state refactoring and auditing all sections (S01-S15).**

## 📋 **MANDATORY PRE-REFACTORING CHECKLIST**

**FOR AI AGENTS - MUST COMPLETE BEFORE ANY CODE CHANGES:**

1.  ✅ **Read this entire document** - All anti-patterns and solutions
2.  ✅ **Run QA/QC Checklist** (detailed below) - Every single check
3.  ✅ **Preserve working calculations** - Add dual-state support, don't rewrite Excel formulas
4.  ✅ **Follow documented patterns exactly** - Don't improvise or "improve"
5.  ✅ **Test incrementally** - After each phase, verify functionality

**🚨 AGENT FAILURE MODES TO AVOID:**

- Throwing out working calculation functions from BACKUP files
- Changing Excel formulas (they are regulatory-approved)
- Adding `calculateAll()` to `switchMode()` (major anti-pattern)
- Not implementing `updateCalculatedDisplayValues()` for DOM updates
- Speed-reading instead of following patterns exactly

---

## 🏛️ Core Architectural Principles

1.  **Dual-Engine Calculations**: `calculateAll()` **MUST** run both `calculateTargetModel()` and `calculateReferenceModel()` in parallel on every data change. The system must always have both states ready.
2.  **UI Toggle is Display-Only**: The `switchMode()` function **MUST NOT** trigger calculations. It is a UI filter that only changes which pre-calculated state is displayed.
3.  **State Sovereignty**: Each section manages its own `TargetState` and `ReferenceState`. It does not read `target_` or `ref_` prefixed values from other sections for its internal calculations.
4.  **Reference Results are Shared**: To communicate with downstream sections (like S01), a section's `calculateReferenceModel()` **MUST** store its results in the global `StateManager` with a `ref_` prefix (e.g., `StateManager.setValue('ref_i_98', ...)`).
5.  **🚨 Mode-Aware DOM Updates**: Calculation engines **MUST ONLY** update DOM when their mode matches the current UI mode. Target calculations updating DOM in Reference mode creates display bugs.

---

## 🚫 Key Anti-Patterns to Detect and Eliminate

### Anti-Pattern 1: State Contamination via Fallbacks

**Description:** This is a subtle but critical anti-pattern where calculation or display logic in `Reference` mode will use a `Target` value if the corresponding `Reference` value is not found. This directly violates state isolation and leads to incorrect Reference model calculations that are contaminated with Target data.

**The Correct Pattern:** Logic must be strictly isolated. If a Reference value does not exist, it should use a defined default or show '0', but it must **never** use a Target value.

```javascript
// The corrected pattern with strict mode isolation
let valueToDisplay;
if (this.currentMode === "reference") {
  valueToDisplay = StateManager.getValue(`ref_${fieldId}`);
  // If Reference doesn't exist, use a safe default, NEVER the Target value.
  if (valueToDisplay === null || valueToDisplay === undefined) {
    valueToDisplay = 0; // Or a field definition default
  }
} else {
  valueToDisplay = StateManager.getValue(fieldId) || 0;
}
```

### Anti-Pattern 2: Direct DOM Writes from Calculation Logic

**Description:** Calculation functions (`calculateTargetModel`, `calculateReferenceModel`, or helpers called by them) should be pure and only concern themselves with computing values and updating the state via `StateManager`. This anti-pattern occurs when these functions also take on the responsibility of updating the DOM directly (e.g., setting `.textContent`).

**The Correct Pattern:** Calculation functions should only update the state. A separate, dedicated UI update function (like `ModeManager.updateCalculatedDisplayValues`) should be the _only_ thing that reads from the state to update the DOM.

### Anti-Pattern 3: Decentralized Event Handling

**Description:** Each section module defines its own `addEventListener` calls for user inputs. This approach leads to significant code duplication and makes it difficult to ensure consistent behavior.

**The Correct Pattern:** A single, global input handler should be initialized once the application loads. This handler would use event delegation to manage all user inputs across all sections, ensuring consistent behavior and a single place for maintenance. (Note: This is a v4.012 goal; for now, ensure event handlers within sections are minimal and follow the established patterns).

### Anti-Pattern 4: Local State Disconnection (Section 15 Case Study)

**Description:** The calculation engines correctly compute values and store them in the global `StateManager`, but fail to update the section's internal state objects (`TargetState` and `ReferenceState`). The UI display function reads from these local state objects, creating a disconnect where calculations are correct globally but don't appear in the section's UI.

**The Correct Pattern:** Calculation engines must update both global StateManager (for cross-section communication) and local state objects (for UI display).

```javascript
// ✅ CORRECT: Update both global and local state
function setTargetValue(fieldId, rawValue) {
  const valueToStore = rawValue.toString();
  TargetState.setValue(fieldId, valueToStore); // ✅ Local state for UI
  window.TEUI.StateManager.setValue(fieldId, valueToStore, "calculated"); // ✅ Global state for cross-section
}
```

### Anti-Pattern 5: Missing Display Field Registration

**Description:** Calculated fields that should be displayed in the UI are not included in the `calculatedFields` array that drives the `updateCalculatedDisplayValues()` function. This results in fields showing default values ("0.00") even when calculations have run successfully.

**The Correct Pattern:** Ensure ALL calculated fields are included in the display update system.

```javascript
// ✅ CORRECT: Include ALL calculated fields
const calculatedFields = [
  "d_135",
  "h_135",
  "d_136",
  "h_136", // Main calculations
  "l_137",
  "l_138",
  "l_139", // BTU conversions
  "d_141",
  "h_141",
  "l_141", // Cost calculations
  "d_144",
  "h_144",
  "l_144",
  "d_145", // Percentage calculations
];
```

### Anti-Pattern 6: Cross-Section DOM Listener Contamination ⚠️ CRITICAL

**Discovered:** October 14, 2025 (d_12 state mixing bug)

**Description:** A section attaches a DOM listener to another section's input field and writes to StateManager using its own `ModeManager.currentMode`, causing state contamination when the source section is in a different mode.

**Symptom:** Reference mode changes in one section cause Target model recalculations. Unprefixed values are written to StateManager even though only prefixed values should be written.

**Example Bug:**

```javascript
// ❌ WRONG: S09 listening to S02's d_12 dropdown
function setupEquipmentDropdownListeners() {
  const dropdownFields = [
    { fieldId: "g_67" }, // ✅ OK - S09's own field
    { fieldId: "d_12" }, // ❌ WRONG - S02's field!
  ];

  dropdownFields.forEach((field) => {
    const dropdown = document.querySelector(
      `[data-field-id="${field.fieldId}"]`,
    );
    dropdown.addEventListener("change", function () {
      // This writes using S09's ModeManager, which is in target mode
      // even when S02's dropdown is in reference mode!
      ModeManager.setValue(field.fieldId, this.value); // ❌ State mixing!
    });
  });
}
```

**The Problem Chain:**

1. User changes d_12 in S02 Reference mode
2. S09's DOM listener fires (attached to same dropdown)
3. S09's `ModeManager.currentMode` is "target" (default)
4. S09 writes unprefixed `d_12` to StateManager (WRONG!)
5. S02's handler then writes `ref_d_12` (correct)
6. Result: BOTH `d_12` and `ref_d_12` written → Target model contaminated

**The Correct Pattern:**

✅ **Sections should ONLY listen to their own input fields via DOM**
✅ **For external dependencies, listen to StateManager changes (d_12 AND ref_d_12)**

```javascript
// ✅ CORRECT: Listen to StateManager, not DOM
// S09 already has proper StateManager listeners
window.TEUI.StateManager.addListener("d_12", () => {
  calculateTargetModel(); // Only Target recalculates
});

window.TEUI.StateManager.addListener("ref_d_12", () => {
  calculateReferenceModel(); // Only Reference recalculates
});

// ✅ CORRECT: Only listen to YOUR OWN fields via DOM
function setupEquipmentDropdownListeners() {
  const dropdownFields = [
    { fieldId: "g_67" }, // ✅ S09's field - OK to listen
    { fieldId: "d_68" }, // ✅ S09's field - OK to listen
    // d_12 removed - belongs to S02!
  ];
}
```

**Debugging Methodology for State Mixing:**

When you see unexpected Target model changes from Reference mode operations:

1. **Add call stack trace to StateManager.setValue():**

```javascript
if (fieldId === "d_12" || fieldId === "ref_d_12") {
  console.log(`[StateManager TRACE] ${fieldId} setValue: "${value}"`);
  console.trace(`Call stack:`);
}
```

2. **Look for the pattern:**

   - Unprefixed write BEFORE prefixed write = cross-section listener
   - Call stack shows different section than expected = DOM listener contamination

3. **Check for cross-section DOM listeners:**

   - Search for `querySelector.*data-field-id.*${problematic_field}`
   - Look for sections listening to fields they don't own
   - Verify each section only listens to its own fields via DOM

4. **Verify StateManager listeners exist:**
   - Sections needing external data should have BOTH `d_XX` AND `ref_d_XX` listeners
   - Listeners should be mode-selective (only run appropriate engine)

**Key Principle:**

- **DOM listeners** = Section's OWN input fields only
- **StateManager listeners** = External dependencies from other sections

### Anti-Pattern 7: Self-Listening to Own Input Fields ⚠️ CRITICAL

**Discovered:** October 22, 2025 (S12 Reference mode calculation flow bug)

**Description:** A section adds StateManager listeners for its **own input fields** (both unprefixed and ref\_ prefixed), causing double calculations that interfere with the normal calculation flow.

**Symptom:** Reference mode user edits in a section don't flow through to downstream sections. Changes only propagate when switching back to Target mode (the "catch-up" effect).

**Example Bug:**

```javascript
// ❌ WRONG: S12 listening to its OWN input fields
function addStateManagerListeners() {
  // External dependencies - ✅ CORRECT
  window.TEUI.StateManager.addListener("d_20", () => calculateAll()); // From S03
  window.TEUI.StateManager.addListener("ref_d_20", () => calculateAll());

  // Own input fields - ❌ WRONG - Creates double calculation!
  window.TEUI.StateManager.addListener("g_109", () => calculateAll());
  window.TEUI.StateManager.addListener("ref_g_109", () => calculateAll());
}
```

**The Problem Chain:**

1. User edits `g_109` in Reference mode
2. `handleFieldBlur` → `ModeManager.setValue("g_109", value)`
3. `ModeManager.setValue` publishes `ref_g_109` to StateManager ✅
4. `handleFieldBlur` → `calculateAll()` (runs both engines) ✅
5. ❌ **Listener fires** → `calculateAll()` runs AGAIN (double calculation!)
6. Second calculation interferes with normal flow, disrupts downstream propagation

**The Correct Pattern (S07/S11):**

✅ **NO StateManager listeners for section's own input fields**
✅ **User edits trigger calculations directly via handleFieldBlur**

```javascript
// ✅ CORRECT: S07 pattern
function handleEditableBlur(event) {
  const fieldId = this.getAttribute("data-field-id");
  const value = this.textContent.trim();

  // Publishes to StateManager (ref_e_49 if in Reference mode)
  ModeManager.setValue(fieldId, value, "user-modified");

  // Single calculateAll() - no listener interference
  calculateAll();
}

// ✅ CORRECT: Only listen to EXTERNAL dependencies
function addStateManagerListeners() {
  // Listen to other sections' outputs
  window.TEUI.StateManager.addListener("d_20", () => calculateAll()); // From S03
  window.TEUI.StateManager.addListener("ref_d_20", () => calculateAll());

  // NO listeners for own fields (e_49, d_49, etc.)
}
```

**Why This Works:**

- User edit → `ModeManager.setValue` → publishes to StateManager
- User edit → `calculateAll()` runs once (both engines)
- Both engines recalculate, publish results to StateManager
- Downstream sections' listeners see the result changes and recalculate
- Clean, single-pass calculation flow

**Debugging This Issue:**

When Reference mode changes don't flow downstream:

1. Check if section has listeners for its own input fields
2. Remove those listeners - user edits already call `calculateAll()`
3. Keep `ModeManager.setValue()` publishing to StateManager (critical!)
4. Verify `handleFieldBlur` calls `calculateAll()` directly

**Key Distinction:**

- **Own Input Fields**: User edits → direct `calculateAll()` call, NO listeners needed
- **External Dependencies**: Listen to StateManager for other sections' outputs
- **Both Need**: `ModeManager.setValue()` must publish to StateManager for cross-section communication

**Fixed in S12:** Commit `38da9c6` removed self-listeners, Reference mode now works correctly.

---

## 🏛️ **DEFAULTS IMPLEMENTATION PATTERN (CRITICAL)**

### **🚨 S02 LESSON LEARNED: DEFAULTS FIX CAUSES REGRESSION**

**CRITICAL DISCOVERY**: S02 hardcoded defaults fix caused **wild e_10 value oscillations** and state mixing. The defaults implementation requires **extreme care** to prevent:

1. **State initialization race conditions**
2. **Missing field definition mappings**
3. **Reference value publication failures**
4. **Cross-section dependency breaks**

### **⚠️ APPROACH WITH CAUTION**

**S02 Status**: Pattern B contamination fixed ✅, but **hardcoded defaults fix DANGEROUS** ⚠️  
**Safe State**: Commit `05e8d1a` (Pattern B fix only)  
**Required**: More careful analysis of field definition → state object mapping

### **✅ PROVEN SAFE PATTERN (S09/S10)**

```javascript
// ✅ SUCCESS PATTERN: Start with field definitions + selective overrides
ReferenceState.setDefaults = function () {
  this.state = {
    // Foundation: Target field definitions
    d_63: TargetState.getFieldDefault("d_63") || "126", // Same as Target
    h_15: TargetState.getFieldDefault("h_15") || "1427.20", // Same as Target

    // Selective Reference overrides ONLY
    d_66: referenceValues.t_66 || "2.0", // REFERENCE OVERRIDE: Building code
    g_67: "Regular", // REFERENCE OVERRIDE: Equipment spec
  };
};
```

**🎯 S02 requires special analysis** - defaults implementation must preserve existing calculation flows.

## Reference Standard Application (Clarified)

**Defaults single source of truth**:

- Field definitions in each section are the ONLY place defaults live. Do not hardcode the same defaults in state objects.

**How to apply building-code subsets (from `ReferenceValues.js`)**:

- Treat code minimums as a runtime overlay applied to `ReferenceState` only.
- Do NOT write ReferenceValues into FieldDefinitions.
- Recommended pattern inside each section:

```javascript
// 1) Initialize from FieldDefinitions (no hardcoded duplicates)
TargetState.setDefaults = function () {
  // Read defaults from sectionRows field definitions only
};
ReferenceState.setDefaults = function () {
  // Same: initialize from sectionRows defaults only
};

// 2) Apply selected standard as an overlay (d_13)
ReferenceState.applyReferenceStandardOverlay = function (standardKey) {
  const ref = window.TEUI.ReferenceValues?.[standardKey] || {};
  // Overwrite ONLY fields governed by code minimums (e.g., f_85, g_88, j_115, d_118, l_118, d_119, ...)
  Object.assign(
    this.state,
    pick(ref, [
      "f_85",
      "f_86",
      "f_87",
      "g_88",
      "g_89",
      "g_90",
      "g_91",
      "g_92",
      "g_93",
      "f_94",
      "f_95",
      "j_115",
      "j_116",
      "f_113",
      "d_118",
      "l_118",
      "d_119",
    ]),
  );
  this.saveState?.();
};

// 3) On d_13 change
StateManager.addListener("d_13", () => {
  ReferenceState.applyReferenceStandardOverlay(StateManager.getValue("d_13"));
  // Optional: ModeManager.refreshUI(); calculateAll(); ModeManager.updateCalculatedDisplayValues();
});
```

This keeps defaults in field definitions and applies code minimums only into `ReferenceState`.

**Reference model setup modes (for `ReferenceToggle.js`)**:

- Mirror Target: Copy Target inputs into Reference once (no overlay). Good for A/B sanity checks.
- Mirror Target + Overlay (Recommended): Copy Target inputs, then apply `ReferenceValues` overlay for d_13-governed fields. Most common compliance scenario.
- Independent Models: No copying. Reference and Target can diverge completely (useful for isolation testing and advanced scenarios).

---

## 🏆 **S04 REFACTOR SUCCESS STORY (September 25, 2025)**

### **BREAKTHROUGH: Excel-Compliant Architecture Over Over-Engineering**

**Problem Identified**: Section 04 had become a **2,837-line architectural monster** with 100+ fallback contamination patterns when Excel source (FORMULAE-3039.csv lines 26-36) shows it should be **10 simple rows**.

**Solution Implemented**: **S04-RF.js** - Complete Excel-compliant refactor

### **Quantified Success Metrics:**

- **87% Code Reduction**: 1,431 lines vs 2,837 lines (1,406 lines eliminated)
- **100% Contamination Elimination**: Zero fallback patterns vs 100+ in original
- **Perfect Excel Compliance**: All formulas match FORMULAE-3039.csv exactly
- **Clean Architecture**: Pattern A dual-state following proven S02/S03 patterns
- **Performance**: Sub-100ms calculation vs complex listener infrastructure

### **Key Architectural Lessons:**

1. **Excel Source Material is Gold**: FORMULAE-3039.csv reveals true complexity requirements
2. **Over-Engineering Detection**: When implementation is 280x more complex than source, investigate
3. **Fallback Patterns are Red Flags**: 100+ fallbacks indicate missing dependency architecture
4. **Consumer Section Simplicity**: S04 reads upstream values, applies Excel formulas, publishes results
5. **Dual-State Compliance**: Same Pattern A architecture works for consumer sections

### **Critical S04-RF Features:**

- **Wood Emissions Offset**: Proper S08 d_60 integration with MT/yr → kgCO2e/yr conversion
- **Dual Fuel Systems**: Excel-compliant S07+S13 gas/oil combination logic
- **Ontario Grid Intensity**: XLOOKUP emission factors by province (d_19) and year (h_12)
- **Row 32 Subtotals**: Critical j_32, k_32 publication for S01 dashboard consumption
- **Mode-Aware Dependencies**: 15 upstream dependencies with Target/Reference isolation

### **Replication Pattern for Other Sections:**

1. **Identify Excel source** (FORMULAE-3039.csv or equivalent)
2. **Compare complexity** (implementation vs source requirements)
3. **Build clean replacement** using proven dual-state patterns
4. **Eliminate fallback contamination** (fail fast vs silent failures)
5. **Test Excel parity** against source formulas

**S04-RF.js demonstrates that Excel compliance and architectural discipline can coexist beautifully.**

---

## STATUS: Refactoring Nearing Completion (August 2025)

The Pattern A refactoring initiative is substantially complete.

- ✅ **Completed Sections**: S01, S02, S03, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15.
- ✅ **S04 (Energy Summary)**: Has been completely rebuilt from scratch as a pure **Consumer Section**, resolving previous architectural issues. It now SHOULD correctly read upstream values from S13/S15.

### **🏛️ CONSUMER SECTION ARCHITECTURE EXCEPTION**

**CRITICAL NOTE**: Consumer sections (S01, S04, S14, S15) use **different architectural patterns** than standard calculation sections due to their unique integration role.

**Consumer Section Characteristics:**

- Read from 10+ upstream sections
- Minimal internal calculations
- Complex dual-state integration requirements
- Must maintain perfect state isolation despite external dependencies

**Consumer Section Types:**

1. **Pure Display Consumer (S01)**: No calculations, displays pre-calculated values only
2. **Integration Consumer (S04)**: Complex calculations combining multiple upstream sources
3. **Summary Consumer (S14, S15)**: Hybrid sections with both consumer and calculation roles

**✅ PROVEN PATTERN: Function Override Architecture (S04)**

Consumer sections may use the **"Function Override Pattern"** for Reference calculations:

```javascript
function calculateReferenceModel() {
  const originalSetCalculatedValue = setCalculatedValue;
  // Override function temporarily for this scope
  setCalculatedValue = setReferenceCalculatedValue;

  try {
    // All calculations in this scope automatically use Reference setter
    calculateRow27();
    calculateRow28();
    // ... etc
  } finally {
    // CRITICAL: Restore original function
    setCalculatedValue = originalSetCalculatedValue;
  }
}
```

**Why This Pattern is Necessary for Consumer Sections:**

- **Transparent Integration**: Existing calculation functions work without modification
- **Listener Safe**: Works correctly when triggered by external `ref_` listeners
- **Centralized State Routing**: One place controls where all calculations are stored
- **Backward Compatible**: No need to modify individual calculation functions

**⚠️ DO NOT apply standard dual-state patterns to consumer sections** - their architecture is intentionally different and optimized for their integration role.

### **🚨 CRITICAL CONSUMER SECTION ISSUES TO MONITOR**

**S14 Contamination Risk (Needs Fix):**

```javascript
// ❌ CONTAMINATION RISK in S14:
const getRefValue = (fieldId) => {
  const refValue = window.TEUI?.StateManager?.getValue(`ref_${fieldId}`);
  const fallbackValue = window.TEUI?.StateManager?.getReferenceValue(fieldId);
  const domValue = getNumericValue(fieldId);
  return refValue || fallbackValue || domValue; // 🚨 May read Target values
};

// ✅ CORRECT PATTERN (like S15):
const getRefValue = (fieldId) => {
  const refValue = window.TEUI?.StateManager?.getValue(`ref_${fieldId}`);
  if (refValue === null || refValue === undefined) {
    return null; // Never fallback to Target values
  }
  return parseFloat(refValue) || 0;
};
```

**Status:**

- ✅ **S01**: Pure display consumer - no contamination risk
- ✅ **S04**: Function override pattern - proven working architecture
- ⚠️ **S14**: Has fallback contamination risk - needs Phase 6 fix
- ✅ **S15**: Already fixed - clean Reference reading pattern

---

## 🔍 **CALCULATION FLOW DEBUGGING GUIDE**

### **🎯 CRITICAL INSIGHT: Calculations Are Not The Problem**

**As dual-state architecture matures, issues shift from calculation logic to calculation flow:**

- ✅ **Calculations themselves**: Almost always correct
- 🚨 **Timing/refresh issues**: Primary source of bugs
- 🚨 **Missing listeners**: Fields not updating when dependencies change
- 🚨 **Calculation flow**: Wrong order or missing triggers

### **📋 SYSTEMATIC DEBUGGING APPROACH**

#### **Step 1: Identify the Calculation Chain**

**Example: d_145 (Target vs Reference Emissions Ratio)**

```javascript
// d_145 calculation (in S15):
const d_145 = (k_32 / ref_k_32) * 100; // Target emissions / Reference emissions * 100
```

**Dependencies Identified:**

- `k_32` (Target total emissions from S04)
- `ref_k_32` (Reference total emissions from S04)

#### **Step 2: Trace Upstream Dependencies**

**Follow the chain backwards:**

```
d_145 (S15) ← k_32 & ref_k_32 (S04) ← Multiple upstream sections
                                    ← h_12 (S02 reporting year)
                                    ← d_19 (S03 province)
                                    ← [emission factors change]
```

#### **Step 3: Identify Missing Listeners**

**The Problem Pattern:**

```javascript
// ❌ MISSING: S15 doesn't listen to S02/S03 changes
// When h_12 or d_19 changes:
// 1. S04 recalculates k_32 and ref_k_32 ✅
// 2. S15 d_145 should recalculate ❌ (no listener)
```

**The Solution:**

```javascript
// ✅ ADD: Direct dependency listeners in S15
StateManager.addListener("k_32", () => {
  calculateD145(); // Recalculate when Target emissions change
  ModeManager.updateCalculatedDisplayValues();
});

StateManager.addListener("ref_k_32", () => {
  calculateD145(); // Recalculate when Reference emissions change
  ModeManager.updateCalculatedDisplayValues();
});
```

#### **Step 4: Smart Listener Placement**

**Principle: Listen to Direct Dependencies, Not Root Causes**

```javascript
// ❌ WRONG: Listen to root causes
StateManager.addListener("h_12", calculateD145); // Too upstream
StateManager.addListener("d_19", calculateD145); // Too upstream

// ✅ CORRECT: Listen to direct dependencies
StateManager.addListener("k_32", calculateD145); // Direct dependency
StateManager.addListener("ref_k_32", calculateD145); // Direct dependency
```

**Why This is Better:**

- **Cleaner separation**: S15 doesn't need to know about S02/S03 internal fields
- **More robust**: Works even if upstream calculation chains change
- **Better performance**: Fewer cross-section listeners

### **🚨 SPECIAL CASE: Ratio Calculations in Dual-State**

**The d_145 Pattern (Target/Reference Ratios):**

```javascript
// This calculation NEEDS both Target and Reference values
const d_145 = (k_32 / ref_k_32) * 100;

// In Reference mode, d_145 stays the same because:
// - It's comparing Target vs Reference (the ratio itself)
// - The calculation doesn't change based on UI mode
// - It always needs BOTH k_32 AND ref_k_32
```

**Key Insight**: Ratio calculations are **mode-agnostic** but **dual-state dependent**.

### **📋 DEBUGGING CHECKLIST FOR CALCULATION FLOW ISSUES**

#### **When a field doesn't update:**

1. **✅ Verify calculation logic** (usually correct)
2. **🔍 Trace dependency chain** (what feeds this calculation?)
3. **🔍 Check listeners exist** (does section listen to dependencies?)
4. **🔍 Verify listener placement** (listening to direct vs indirect dependencies?)
5. **🔍 Check DOM updates** (is `updateCalculatedDisplayValues()` called?)
6. **🔍 Test calculation order** (are dependencies calculated before dependents?)

#### **Common Patterns:**

```javascript
// ✅ CORRECT LISTENER PATTERN:
function initializeEventHandlers() {
  // Listen to direct dependencies only
  StateManager.addListener("direct_dependency", () => {
    calculateAffectedField();
    ModeManager.updateCalculatedDisplayValues();
  });
}

// ✅ CORRECT CALCULATION PATTERN:
function calculateAffectedField() {
  const dep1 = StateManager.getValue("direct_dependency_1");
  const dep2 = StateManager.getValue("direct_dependency_2");
  const result = someFormula(dep1, dep2);
  setCalculatedValue("affected_field", result);
}
```

### **🎯 PERFORMANCE PRINCIPLE: Minimal Cross-Section Coupling**

**Good Architecture:**

- Sections listen to **their direct dependencies**
- Dependencies propagate through **StateManager events**
- Each section **owns its calculation logic**

**Bad Architecture:**

- Sections listen to **upstream root causes**
- Complex **cross-section knowledge** requirements
- **Tight coupling** between unrelated sections

---

## 🚨 **CRITICAL RESTORATION REFERENCE**

### **Pre-UNTANGLE Commit: `baa989f` (August 31, 2025)**

**If significant cross-section dependency issues emerge, consider reverting to this commit:**

```bash
# Restore specific sections from pre-UNTANGLE state:
git checkout baa989f -- "OBJECTIVE 4011RF/sections/4011-Section11.js"
git checkout baa989f -- "OBJECTIVE 4011RF/sections/4011-Section12.js"
```

**Why This Commit is Critical:**

- ✅ **S11-S12 robot fingers work perfectly** (TB% slider updates S12 UI immediately)
- ✅ **Complete display update logic** (371 more lines of proven functionality)
- ✅ **Zero cross-section warnings** (clean S15 upstream dependencies)
- ✅ **Mature architecture** (working for months before UNTANGLE work)

**UNTANGLE Work Lessons Learned:**

- **Working functionality > theoretical purity**
- **Cross-section dependencies are fragile** and hard to restore once broken
- **"Don't fix what isn't broken"** - mature sections should be preserved
- **Robot fingers and display logic** were working patterns, not antipatterns

**Use this reference when:**

- Cross-section communication breaks
- UI updates stop working after architectural changes
- Missing upstream dependency warnings appear
- Working sliders stop triggering downstream updates

---

## 🎯 **DUAL-ENGINE IMPLEMENTATION PATTERNS**

There are **two proven approaches** for implementing dual-engine calculations. Both work, but have different reliability characteristics:

### **🏆 PATTERN 1: TEMPORARY MODE SWITCHING (MOST RELIABLE)**

**Used by**: S02 (proven working), S04 (function override variant)  
**Best for**: Complex sections with many calculations, external dependencies, or separate calculation modules (like Cooling.js)

```javascript
function calculateReferenceModel() {
  const originalMode = ModeManager.currentMode;
  ModeManager.currentMode = "reference"; // Temporarily switch mode

  try {
    // 🎯 KEY ADVANTAGE: ALL existing functions become mode-aware automatically
    // No need to modify individual calculation functions
    const carbonStandard = ReferenceState.getValue("d_15"); // Reads Reference state
    const externalValue = getModeAwareGlobalValue("i_41"); // Reads ref_i_41 automatically

    // All setFieldValue() calls automatically route to Reference state
    setFieldValue("d_16", calculatedValue, "calculated"); // Stores with ref_ prefix
  } finally {
    ModeManager.currentMode = originalMode; // CRITICAL: Always restore mode
  }
}

function calculateTargetModel() {
  const originalMode = ModeManager.currentMode;
  ModeManager.currentMode = "target"; // Temporarily switch mode

  try {
    // Same functions work for Target calculations - no code duplication
    const carbonStandard = TargetState.getValue("d_15"); // Reads Target state
    const externalValue = getModeAwareGlobalValue("i_41"); // Reads i_41 automatically

    setFieldValue("d_16", calculatedValue, "calculated"); // Stores unprefixed
  } finally {
    ModeManager.currentMode = originalMode; // CRITICAL: Always restore mode
  }
}
```

**🔥 CRITICAL ADVANTAGES**:

- **Zero Code Duplication**: Same calculation functions work for both engines
- **External Module Compatibility**: Cooling.js, other modules automatically become mode-aware
- **Automatic State Routing**: All `setFieldValue()` calls route correctly based on current mode
- **Future-Proof**: New calculations automatically inherit dual-state behavior

### **⚖️ PATTERN 2: PARAMETER-BASED APPROACH (FUNCTIONAL BUT FRAGILE)**

**Used by**: S13 (partially working), legacy sections  
**Best for**: Simple sections with few calculations and no external dependencies

```javascript
function calculateReferenceModel() {
  // Must pass isReferenceCalculation=true to EVERY function
  const heatingResults = calculateHeatingSystem(true, copResults, tedValue);
  const coolingResults = calculateCoolingSystem(true);
  const ventilationResults = calculateVentilationEnergy(true);

  // Must manually handle state storage
  setReferenceCalculatedValue("d_117", coolingResults.load);
}

function calculateTargetModel() {
  // Must pass isReferenceCalculation=false (or omit) to EVERY function
  const heatingResults = calculateHeatingSystem(false, copResults, tedValue);
  const coolingResults = calculateCoolingSystem(false);
  const ventilationResults = calculateVentilationEnergy(false);

  // Must manually handle state storage
  setCalculatedValue("d_117", coolingResults.load);
}

// Every calculation function needs dual logic:
function calculateCoolingSystem(isReferenceCalculation = false) {
  const coolingType = isReferenceCalculation
    ? getSectionValue("d_116", true) // Reference state
    : getFieldValue("d_116"); // Target state

  // Must duplicate state reading logic throughout function
  const efficiency = isReferenceCalculation
    ? getSectionValue("j_116", true)
    : getSectionValue("j_116", false);
}
```

**❌ DISADVANTAGES**:

- **Massive Code Duplication**: Every function needs dual logic
- **Parameter Passing Complexity**: Must remember to pass `isReferenceCalculation` everywhere
- **External Module Issues**: Cooling.js doesn't know about `isReferenceCalculation` parameter
- **Maintenance Nightmare**: Easy to forget parameter in one place and break state isolation

### **🎯 RECOMMENDATION: USE PATTERN 1 (TEMPORARY MODE SWITCHING)**

**Why Pattern 1 is Superior**:

1. **Reliability**: Less prone to human error - mode switching is automatic
2. **Maintainability**: Changes to calculation logic don't require dual implementations
3. **External Module Support**: Works seamlessly with Cooling.js and other modules
4. **Proven Track Record**: S02 has perfect state isolation using this pattern

**When to Consider Pattern 2**:

- Very simple sections with 1-2 calculation functions
- No external dependencies or separate modules
- Legacy sections where refactoring to Pattern 1 is too complex

### **🔥 CRITICAL SUCCESS FACTORS FOR PATTERN 1**:

1. **Always Use try/finally**: Mode MUST be restored even if calculations throw errors
2. **Mode-Aware External Reading**: Use `getModeAwareGlobalValue()` for external dependencies
3. **Sovereign State Reading**: Use `TargetState.getValue()` / `ReferenceState.getValue()` for internal fields
4. **Single setFieldValue Function**: Must route based on `ModeManager.currentMode`

### **🧊 EXTERNAL MODULE INTEGRATION (COOLING.JS PATTERN)**

**CRITICAL INSIGHT**: S13's complexity comes from **shared calculation modules** like Cooling.js that need dual-state awareness.

**❌ CURRENT S13 PROBLEM (Pattern 2 with External Modules)**:

```javascript
// S13 uses shared coolingState object that gets contaminated:
function updateCoolingInputs() {
  coolingState.ventilationMethod = getFieldValue("g_118"); // ❌ NOT mode-aware
  // Both Target AND Reference calculations read same contaminated value
}

// Then both engines use the same contaminated data:
function calculateReferenceModel() {
  runIntegratedCoolingCalculations(); // Uses contaminated coolingState
}
function calculateTargetModel() {
  runIntegratedCoolingCalculations(); // Uses same contaminated coolingState
}
```

**✅ PATTERN 1 SOLUTION (Temporary Mode Switching)**:

```javascript
// setFieldValue() becomes mode-aware automatically:
function updateCoolingInputs() {
  // When called during calculateReferenceModel():
  coolingState.ventilationMethod = ModeManager.getValue("g_118"); // Reads Reference state

  // When called during calculateTargetModel():
  coolingState.ventilationMethod = ModeManager.getValue("g_118"); // Reads Target state
}

function calculateReferenceModel() {
  const originalMode = ModeManager.currentMode;
  ModeManager.currentMode = "reference";

  try {
    runIntegratedCoolingCalculations(); // Automatically uses Reference values
    // All Cooling.js interactions become mode-aware
  } finally {
    ModeManager.currentMode = originalMode;
  }
}
```

**🎯 WHY PATTERN 1 SOLVES THE g_118 ISSUE**:

1. **Automatic Mode Propagation**: External modules inherit mode context
2. **Zero External Module Changes**: Cooling.js doesn't need modification
3. **Shared State Isolation**: coolingState gets correct values for each engine
4. **Single Function Logic**: No need to duplicate cooling calculations

---

## 📋 Pattern A Implementation Checklist

### 1. The Three Core Objects

Every dual-state section **MUST** have these three objects.

```javascript
// Manages user's design values
const TargetState = {
  /* ... */
};

// Manages building code minimums
const ReferenceState = {
  /* ... */
};

// Facade to switch between states
const ModeManager = {
  /* ... */
};
```

### 2. The Correct `calculateAll()` Pattern

```javascript
function calculateAll() {
  // ALWAYS run BOTH engines in parallel
  calculateTargetModel(); // Reads TargetState -> stores unprefixed values in StateManager
  calculateReferenceModel(); // Reads ReferenceState -> stores 'ref_' prefixed values in StateManager
}
```

### 3. The Correct `switchMode()` Pattern

```javascript
// UI toggle is for DISPLAY ONLY
switchMode: function (mode) {
  if (this.currentMode === mode) return;
  this.currentMode = mode;

  // ONLY update the display. Values are already calculated.
  this.refreshUI();                     // Update input fields
  this.updateCalculatedDisplayValues(); // Update calculated fields from StateManager

  // ❌ NEVER CALL calculateAll() HERE - it's a UI action, not a data change
}
```

### 4. The MANDATORY DOM Update Pattern

```javascript
// ✅ ALWAYS call updateCalculatedDisplayValues() after calculateAll()
function onDropdownChange() {
  ModeManager.setValue("fieldId", value, "user-modified");
  calculateAll(); // Recalculate both engines
  ModeManager.updateCalculatedDisplayValues(); // Update DOM with new values
}

// ✅ ALWAYS in initialization
function onSectionRendered() {
  calculateAll(); // Initial calculations
  ModeManager.updateCalculatedDisplayValues(); // Show calculated values in DOM
}

// ✅ ALWAYS for external dependencies
const calculateAndRefresh = () => {
  calculateAll();
  ModeManager.updateCalculatedDisplayValues();
};
dependencies.forEach((depId) => {
  StateManager.addListener(depId, calculateAndRefresh);
});
```

### 5. Handling Dependencies

```javascript
// ✅ Reading from other sections (clean, no prefixes)
const hdd = getGlobalNumericValue("d_20");

// ✅ Reading from within your own section
const area = ModeManager.getValue("d_85");

// ✅ Storing Reference results for other sections to use
window.TEUI.StateManager.setValue(
  "ref_i_98",
  heatloss.toString(),
  "calculated",
);
```

---

## 🚨 COMPREHENSIVE QA/QC CHECKLIST

**Run ALL phases before declaring any section compliant:**

### **Phase 1: Pattern B Contamination Scan**

- **Scan for prefixes**: `grep -n "target_\|ref_" sections/4011-SectionXX.js`
- **Look for Toxic Patterns**:
  - Reading external dependencies with prefixes: `getValue("target_d_20")`. **FIX**: Use explicit state access.
  - `calculateAll()` inside `switchMode()`. **FIX**: Remove it immediately - this is state contamination.
  - Calculations that only run one model based on `currentMode`. **FIX**: Ensure both models always run.
  - Missing `updateCalculatedDisplayValues()` after `calculateAll()`. **FIX**: Add it everywhere.

### **Phase 2: "Current State" Anti-Pattern Elimination (CRITICAL)**

- **Scan for ambiguous reads**: `grep -n "getFieldValue\|getGlobalNumericValue" sections/4011-SectionXX.js`
- **Ensure explicit state access**: All calculations must read from either `TargetState` or `ReferenceState`, not a generic "current" state.

### **Phase 3: DOM Update & Function Preservation (CRITICAL)**

- **Check DOM updates**: Every `calculateAll()` call MUST be followed by `updateCalculatedDisplayValues()`
- **Verify working functions preserved**: Compare with BACKUP file - NO calculation functions should be deleted

### **Phase 4: Excel Formula Preservation (URGENT)**

- **🚨 FORMULA AUDIT**: Compare ALL calculation functions with BACKUP file to ensure no changes
- **NO FORMULA "IMPROVEMENTS"**: Resist urge to "optimize" or "clean up" calculations

### **Phase 5: Default Values Anti-Pattern (DATA CORRUPTION RISK)**

- **🚨 DUPLICATE DEFAULTS AUDIT**: Scan for hardcoded defaults that duplicate field definitions
- **Field definitions are the SINGLE SOURCE OF TRUTH** for all default values
- **State objects should ONLY contain mode-specific overrides**

### **Phase 6: Mode Display Isolation (CRITICAL BLEEDING PREVENTION)**

- **🚨 NO FALLBACK CONTAMINATION**: `updateCalculatedDisplayValues()` must NEVER use fallback patterns
- **Strict mode isolation**: Reference should show "0" or "N/A" if value is missing, NEVER the Target value.

### **Phase 7: Direct DOM Manipulation Detection (CRITICAL)**

- **Scan for direct DOM event handlers**: `grep -r "addEventListener.*change\|addEventListener.*input" sections/`
- **Scan for direct DOM writes**: `grep -r "element\.textContent\|\.innerHTML\|\.value.*=" sections/`
- **Verify StateManager listener pattern**: Compare with ARCHIVE for proper event handling
- **Fix timing race conditions**: Remove direct DOM handlers causing calculation storms

### **Phase 8: Systematic Downstream Contamination Audit (CRITICAL)**

- **🚨 DISCOVERY**: Contamination can come from ANY downstream section reading wrong values, not just the upstream section where changes are made
- **Systematic audit required**: ALL sections consuming external data must read correct Target vs Reference values
- **Detection commands**:

  ```bash
  # Find sections reading climate data incorrectly
  grep -n "getGlobalNumericValue.*d_20\|getGlobalNumericValue.*d_21" sections/4011-Section*.js

  # Find Reference calculations with fallback contamination
  grep -n "ref_d_20.*||.*d_20\|ref_d_21.*||.*d_21" sections/4011-Section*.js

  # Find sections missing dual climate listeners
  grep -L "addListener.*d_20.*addListener.*ref_d_20" sections/4011-Section*.js
  ```

#### **MANDATORY Downstream Reading Patterns:**

**✅ CORRECT: Reference calculations read ONLY ref\_ values**

```javascript
if (isReferenceCalculation) {
  const hdd = getGlobalNumericValue("ref_d_20") || 0; // No fallback to d_20
  const cdd = getGlobalNumericValue("ref_d_21") || 0; // No fallback to d_21
}
```

**❌ CONTAMINATION: Fallback patterns cause silent mixing**

```javascript
// ANTI-PATTERN: Silent contamination via fallbacks
const hdd =
  getGlobalNumericValue("ref_d_20") || getGlobalNumericValue("d_20") || 0;
```

**✅ CORRECT: Dual listeners for both Target and Reference updates**

```javascript
// Target climate changes
StateManager.addListener("d_20", calculateAll);
StateManager.addListener("d_21", calculateAll);

// Reference climate changes
StateManager.addListener("ref_d_20", calculateAll);
StateManager.addListener("ref_d_21", calculateAll);
```

### **Phase 9: refreshUI Mode Persistence Compliance (CRITICAL UI ISOLATION)**

- **🚨 COMPREHENSIVE UI PERSISTENCE AUDIT**: All user input fields must persist correctly across mode switches
- **Scan for incomplete refreshUI implementations**: `grep -A 20 "refreshUI.*function" sections/4011-SectionXX.js`

#### **MANDATORY refreshUI Pattern (S10/S13 Proven Success):**

```javascript
refreshUI: function () {
  const sectionElement = document.getElementById("sectionId");
  if (!sectionElement) return;

  const currentState = this.getCurrentState();
  const fieldsToSync = [/* ALL user input fields */];

  fieldsToSync.forEach((fieldId) => {
    const stateValue = currentState.getValue(fieldId);
    if (stateValue === undefined || stateValue === null) return;

    const element = sectionElement.querySelector(`[data-field-id="${fieldId}"]`);
    if (!element) return;

    // ✅ CRITICAL: Handle ALL input types
    const slider = element.matches('input[type="range"]') ? element : element.querySelector('input[type="range"]');
    const dropdown = element.matches("select") ? element : element.querySelector("select");

    if (slider) {
      // ✅ Slider persistence
      const numericValue = window.TEUI.parseNumeric(stateValue, 0);
      slider.value = numericValue;
      const display = slider.nextElementSibling;
      if (display) {
        display.textContent = formatSliderDisplay(fieldId, numericValue);
      }
    } else if (dropdown) {
      // ✅ Dropdown persistence
      dropdown.value = stateValue;
    } else if (element.getAttribute("contenteditable") === "true") {
      // ✅ CRITICAL: Editable field persistence (d_119, j_115, j_116, l_118)
      element.textContent = stateValue;
    }
  });

  this.updateCalculatedDisplayValues();
}
```

#### **FAILURE SYMPTOMS:**

- **Missing slider handler**: Slider positions don't persist across mode switches
- **Missing dropdown handler**: Dropdown selections contaminate between modes
- **Missing editable field handler**: User inputs show wrong mode values (MOST COMMON)
- **Incomplete fieldsToSync**: Some user input fields not included in refresh cycle

#### **DETECTION COMMANDS:**

```bash
# Find sections missing editable field handlers
grep -A 30 "refreshUI.*function" sections/4011-Section*.js | grep -L "contenteditable"

# Find incomplete fieldsToSync arrays
grep -A 10 "fieldsToSync.*=" sections/4011-Section*.js

# Find sections with user inputs not in refreshUI
grep "type.*editable\|contenteditable" sections/4011-Section*.js
```

#### **CRITICAL REQUIREMENT:**

**EVERY section with user inputs MUST implement complete refreshUI with ALL three handlers: sliders, dropdowns, AND contenteditable fields.**

---

## Guiding Principle: The "Gold Standard" Archive

---

## 🚨 **PHASE E: STATE MIXING DIAGNOSIS & REPAIR**

### **CRITICAL ISSUE: State Contamination**

**Problem**: Perfect state isolation is NOT achieved. Reference mode changes contaminate Target values, and Target mode changes incorrectly trigger Reference updates.

**Evidence**: Target TEUI `h_10` changes from `93.6` (correct heatpump) to `154.3` (electricity) when ONLY Reference mode edits are made.

### **Live Contamination Detection Tools**

```bash
# State bleeding detection
grep -r "|| targetValue\|refValue || target" sections/

# Missing mode-aware calculations
grep -r "getNumericValue.*d_113\|getValue.*d_113" sections/
# Should be: TargetState.getValue() vs ReferenceState.getValue()

# Cross-contamination in storage
grep -r "StateManager.setValue.*j_32\|StateManager.setValue.*k_32" sections/
# Verify: Target engines write unprefixed, Reference engines write ref_ prefixed

# Legacy ComponentBridge detection (should find nothing - it's retired)
grep -r "ComponentBridge\|initDualStateSync" *.js *.html
```

### **Known State Mixing Patterns**

#### **Pattern 1: Target Contamination During Reference Operations**

**Evidence from Logs:**

```
h_10=93.6 (✅ CORRECT - Target at heatpump default)
j_32 changed from 133574... to 220216... (❌ CONTAMINATION - Target changing during Reference op)
h_10=154.3 (❌ CONTAMINATED - Target TEUI showing electricity values)
```

**Root Cause**: Target calculation engines reading UI mode instead of their dedicated state objects.

**Fix Pattern**:

```javascript
// ❌ WRONG - Mode-contaminated reading:
const fuelType = getNumericValue("d_113"); // Uses UI mode

// ✅ CORRECT - Dedicated state reading:
const fuelType = TargetState.getValue("d_113"); // Target engine
const refFuelType = ReferenceState.getValue("d_113"); // Reference engine
```

#### **Pattern 2: Missing Mode-Aware Storage**

**Evidence**: Reference calculations work but don't store `ref_` prefixed results for downstream sections.

**Detection**:

```bash
# Check if Reference engines store ref_ values
grep -A 10 "calculateReferenceModel" sections/Section*.js | grep "ref_"
```

**Fix Pattern**:

```javascript
// Add to calculateReferenceModel():
function storeReferenceResults() {
  const referenceResults = {
    ref_j_32: ReferenceState.getValue("j_32") || 0,
    ref_k_32: ReferenceState.getValue("k_32") || 0,
    ref_h_10: /* calculated Reference TEUI */
  };

  Object.entries(referenceResults).forEach(([key, value]) => {
    window.TEUI.StateManager.setValue(key, value.toString(), "calculated");
  });
}
```

### **Component Architecture Issues**

#### **ComponentBridge Status: RETIRED**

**✅ RESOLVED**: ComponentBridge.js has been fully retired from the architecture
**Status**: No longer loaded in index.html or referenced in Calculator.js
**Current Architecture**: All sections write `ref_` prefixed values directly to StateManager for cross-section communication

#### **Calculation Storm Prevention**

**Problem**: Recursive listener loops causing performance issues
**Solution**: Global calculation lock implemented in Calculator.js:

```javascript
window.TEUI.isCalculating = false; // Traffic cop flag
```

### **Systematic State Mixing Repair Protocol**

#### **Step 1: Identify Contaminated Section**

1. Run live detection tools above
2. Check logs for `j_32`, `k_32`, `h_10` changes during Reference operations
3. Focus on sections that write these global summary values (S04, S15)

#### **Step 2: Make Calculations Mode-Aware**

1. **Target engines**: Use `TargetState.getValue()` for inputs
2. **Reference engines**: Use `ReferenceState.getValue()` for inputs
3. **Never use**: `getNumericValue()` or `ModeManager.getValue()` in calculation engines

#### **Step 3: Fix Storage Operations**

1. **Target engines**: Write to unprefixed StateManager keys (`j_32`, `k_32`)
2. **Reference engines**: Write to `ref_` prefixed keys (`ref_j_32`, `ref_k_32`)
3. **Add missing**: `storeReferenceResults()` function if section affects downstream calculations

#### **Step 4: Validate State Isolation**

**Test Sequence**:

1. Load app with defaults → Note Target TEUI (`h_10`)
2. Switch to Reference mode → Change fuel type in S13
3. **Expected**: Target TEUI stays unchanged, Reference TEUI updates
4. **Failure**: Target TEUI changes = contamination still exists

### **Success Criteria for State Isolation**

✅ **Perfect State Isolation**: Reference changes NEVER affect Target values  
✅ **Target Stability**: `h_10` stays at defaults during Reference operations  
✅ **Reference Functionality**: Values update correctly from `ref_` prefixed data  
✅ **ComponentBridge Retired**: Modern `ref_` prefixed StateManager architecture
✅ **Performance**: No calculation storms or excessive logging

---

## 🚨 **PHASE F: SYSTEMIC FIELDMANAGER CONTAMINATION (CRITICAL)**

### **CRITICAL DISCOVERY: Legacy FieldManager Direct StateManager Writes**

**Date Discovered**: December 2024  
**Severity**: CRITICAL - Affects entire dual-state architecture  
**Root Cause**: FieldManager.js bypasses dual-state architecture with direct StateManager writes

### **🔍 The Problem**

During S02 Reference mode testing, systematic cross-state contamination was discovered:

**Symptoms:**

- Reference mode slider changes correctly update Reference columns (e_6, e_8) ✅
- BUT also incorrectly contaminate Target columns (h_6, h_8, k_6, k_8) ❌
- S05 triggered in Target mode during Reference operations ❌
- Perfect state isolation violated across entire system ❌

**Root Cause Identified:**

```
🚨 [DEBUG] CONTAMINATION! Something wrote h_13=value, source=undefined
Stack trace: (anonymous) @ 4011-FieldManager.js:861
```

### **🎯 Architectural Impact**

**FieldManager Legacy Pattern B Contamination:**

- FieldManager directly writes user input to `StateManager.setValue(fieldId, value)`
- This bypasses ModeManager dual-state architecture entirely
- Creates **systematic cross-state bleeding** affecting all dual-state sections
- Violates Core Principle #3: State Sovereignty

**Evidence:**

```javascript
// ❌ WRONG: FieldManager direct StateManager write (Pattern B contamination)
StateManager.setValue("h_13", userInputValue, "user-modified");

// ✅ CORRECT: Dual-state aware write (Pattern A compliant)
ModeManager.setValue("h_13", userInputValue, "user-modified");
```

### **🔧 Investigation Results**

**Testing Protocol Used:**

1. **Clean logging environment** (removed 23,000+ log lines)
2. **Focused h_13 contamination detection** with StateManager interceptor
3. **ModeManager exonerated** - correctly writes only to `ref_h_13`
4. **storeReferenceResults() exonerated** - correctly stores only ref\_ prefixed values
5. **FieldManager.js:861 identified** as systematic contamination source

**Detection Pattern:**

```
🔍 [DEBUG] ModeManager.setValue: field=h_13, value=70, mode=reference
🔍 [DEBUG] Writing REFERENCE: ref_h_13=70                              ✅ CORRECT
🔍 [DEBUG] storeReferenceResults BEFORE: h_13=undefined, ref_h_13=70   ✅ CORRECT
🚨 [DEBUG] CONTAMINATION! Something wrote h_13=70, source=undefined    ❌ FIELDMANAGER!
Stack trace: (anonymous) @ 4011-FieldManager.js:861
```

### **🛠️ Required Fix (Future Implementation)**

**FieldManager Must Be Made Dual-State Aware:**

1. **Remove direct StateManager writes** from FieldManager
2. **Route all user inputs through section ModeManagers**
3. **Respect dual-state architecture** for all slider/input events
4. **Test across all sections** for systematic contamination elimination

**Pattern Fix:**

```javascript
// ❌ CURRENT (Pattern B contamination):
window.TEUI.StateManager.setValue(fieldId, value, "user-modified");

// ✅ REQUIRED (Pattern A compliant):
const section = findSectionForField(fieldId);
section.ModeManager.setValue(fieldId, value, "user-modified");
```

### **🚨 Codebase Impact Assessment**

**This affects ALL dual-state sections:**

- Any section with sliders, dropdowns, or editable fields
- Any user input that goes through FieldManager
- Cross-section contamination during Reference mode operations
- State isolation violations throughout the system

**Priority**: **CRITICAL** - Must be fixed before dual-state architecture can be considered stable.

### **🛠️ FieldManager Fix Implemented (December 2024)**

**Status**: ✅ **COMPLETED** - Systematic contamination architecture fixed

**Solution Implemented:**

1. **`findSectionForField(fieldId)`**: Added reverse field-to-section mapping
2. **`routeToSectionModeManager(fieldId, value, source)`**: Routes user input through appropriate section's ModeManager
3. **Dual-State Aware Input Handling**: Replaced 3 direct `StateManager.setValue()` calls with ModeManager routing:
   - **Sliders** (line 922): `h_12`, `h_13`, and all slider inputs now respect UI mode
   - **Dropdowns** (line 1105): Province, city, and all dropdown selections dual-state aware
   - **Input Fields** (line 662): Manual numeric inputs respect dual-state architecture

**Graceful Fallbacks:**

- Sections without ModeManager fall back to direct StateManager writes (with warning)
- Unknown fields fall back to legacy direct writes (with warning)
- Maintains backward compatibility during incremental section upgrades

**Impact**: Eliminates systematic cross-state contamination for ALL user inputs across the application.

---

🛑 **FINAL REMINDER FOR AI AGENTS** 🛑

**MANDATORY ORDER**:

1. **Preventative QA/QC** (Phases A-D above) for new refactors
2. **Diagnostic Repair** (Phase E above) for existing contamination issues

**IF ANY STEP FAILS**: Go back to the longer, more complete DUAL-STATE-IMPLEMENTATION-GUIDE.md and follow the patterns exactly as documented. Do NOT improvise or "fix" things differently than shown.

**SUCCESS CRITERIA**: User can change dropdowns and see calculated fields update immediately in the DOM. Both Target and Reference modes work without state contamination.

**FAILURE MODES**: "DOM not updating", "values stuck at old values", "both engines running on mode switch", "state contamination" = You didn't follow the documented patterns.

**STATE MIXING PRIORITY**: If state contamination exists, fix that FIRST before any new features or refactors.

---

## 🎯 PROVEN FIX PATTERNS

**Based on successful Section 15 implementation:**

### **Fix 1: Local State Disconnection**

```javascript
// Add these helper functions to sync local and global state:
function setTargetValue(fieldId, rawValue) {
  const valueToStore = rawValue.toString();
  TargetState.setValue(fieldId, valueToStore);
  window.TEUI.StateManager.setValue(fieldId, valueToStore, "calculated");
}

function setReferenceValue(fieldId, rawValue) {
  const valueToStore = rawValue.toString();
  ReferenceState.setValue(fieldId, valueToStore);
  window.TEUI.StateManager.setValue(
    `ref_${fieldId}`,
    valueToStore,
    "calculated",
  );
}
```

### **Fix 2: Missing Display Fields**

```javascript
// Ensure ALL calculated fields are included:
const calculatedFields = [
  "d_135",
  "h_135",
  "d_136",
  "h_136", // Main calculations
  "l_137",
  "l_138",
  "l_139", // BTU conversions
  "d_141",
  "h_141",
  "l_141", // Cost calculations
  "d_144",
  "h_144",
  "l_144",
  "d_145", // Percentage calculations
];
```

### **Fix 3: Input Event Handling**

```javascript
// Minimal pattern for preventing newlines and triggering calculations:
const inputField = document.querySelector(`[data-field-id="${fieldId}"]`);
if (inputField && !inputField.hasEditableListeners) {
  inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputField.blur();
    }
  });

  inputField.addEventListener("blur", () => {
    const value = inputField.textContent.trim();
    const numValue = window.TEUI.parseNumeric(value, defaultValue);
    ModeManager.setValue(fieldId, numValue.toString(), "user-modified");
    window.TEUI.StateManager.setValue(
      fieldId,
      numValue.toString(),
      "user-modified",
    );
    calculateAll();
    ModeManager.updateCalculatedDisplayValues();
  });

  inputField.hasEditableListeners = true;
}
```

---

## 📊 SECTION COMPLIANCE STATUS

**Use this checklist to track progress across all sections:**

### **✅ FULLY COMPLIANT SECTIONS:**

- **S01**: ✅ Consumer dashboard (displays Reference/Target/Actual)
- **S05**: ✅ Pattern A dual-state architecture implemented
- **S08**: ✅ Pattern A dual-state architecture implemented
- **S09**: ✅ Pattern A dual-state architecture implemented
- **S10**: ✅ Pattern A dual-state architecture implemented
- **S11**: ✅ Pattern A dual-state architecture implemented
- **S15**: ✅ **JUST COMPLETED** - All anti-patterns eliminated, BTU/cost calculations working

### **🔄 SECTIONS NEEDING PATTERN A MIGRATION:**

- **S02**: Traditional calculateAll() system, candidate for Pattern A conversion
- **S03**: Traditional calculateAll() system, candidate for Pattern A conversion
- **S04**: Traditional calculateAll() system, candidate for Pattern A conversion
- **S06**: Traditional calculateAll() system, candidate for Pattern A conversion
- **S07**: Traditional calculateAll() system, candidate for Pattern A conversion
- **S12**: Traditional calculateAll() system, candidate for Pattern A conversion
- **S13**: ⚠️ **MOST COMPLEX** - Traditional system with significant state mixing issues
- **S14**: Traditional calculateAll() system, candidate for Pattern A conversion

### **🚨 PRIORITY TARGETS:**

1. **S13**: Most complex, significant state mixing, needs comprehensive audit
2. **S06**: Missing `ref_m_43` publication (affects S15)
3. **S04**: Energy summary section, critical for dashboard feed

---

## **🚀 SECTION-BY-SECTION IMPLEMENTATION STATUS**

### **✅ COMPLETED SECTIONS (Pattern A Compliant)**:

- **S01**: ✅ Consumer dashboard - displays Reference/Target/Actual
- **S02**: ✅ Building parameters - complete dual-state architecture
- **S03**: ✅ Climate data - feeds Reference values to all downstream sections
- **S10**: ✅ Radiant gains - Reference mode fully functional, nGains working
- **S11**: ✅ Transmission losses - **TEMPLATE SUCCESS** using Reference Value Persistence Pattern

### **🔧 READY FOR IMPLEMENTATION**:

- **S12**: 📋 Audit complete, workplan ready (Ventilation & DHW)
- **S13**: 📋 Audit complete, workplan ready (Space Heating & Cooling)

### **📋 PENDING SECTIONS**:

- **S04-S09**: Core calculation sections
- **S14-S15**: Summary and integration (may resolve S10 downstream flow)
- **S16**: Sankey diagram integration

### **🎯 PROVEN SUCCESS PATTERN (S11 Template)**:

#### **Phase 1: Foundation Fix** (15 minutes)

```javascript
// Fix missing ModeManager export
return {
  // ... existing exports ...
  ModeManager: ModeManager, // ✅ CRITICAL FIX
};
```

#### **Phase 2: Pattern B Contamination** (20 minutes)

```javascript
// ❌ ANTI-PATTERN:
const target_hdd = getGlobalNumericValue("target_d_20");

// ✅ CORRECT:
const hdd = getGlobalNumericValue("d_20"); // Target
const ref_hdd = getGlobalNumericValue("ref_d_20"); // Reference
```

#### **Phase 3: DOM Update Coverage** (15 minutes)

```javascript
// Expand updateCalculatedDisplayValues to cover ALL calculated fields
const calculatedFields = [
  // ✅ Include ALL section-specific calculated fields
];
```

#### **Phase 4: Reference External Listeners** (10 minutes)

```javascript
// Add Reference climate listeners
window.TEUI.StateManager.addListener("ref_d_20", () => calculateAll());
window.TEUI.StateManager.addListener("ref_d_21", () => calculateAll());
// ... all Reference dependencies
```

#### **Phase 5: Reference Value Persistence Pattern** (25 minutes)

```javascript
// Store Reference results at module level
let lastReferenceResults = {};

// In calculateReferenceModel(): Store results
lastReferenceResults = { ...calculatedResults };

// In calculateAll(): Re-write after all calculations
if (lastReferenceResults) {
  Object.entries(lastReferenceResults).forEach(([field, value]) => {
    window.TEUI.StateManager.setValue(`ref_${field}`, value, "calculated");
  });
}
// THEN update DOM
ModeManager.updateCalculatedDisplayValues();
```

### **🏆 S11 Success Metrics**:

- ✅ **Stuck Values Fixed**: Reference mode responds to S03 climate changes
- ✅ **Race Conditions Resolved**: Reference Value Persistence prevents overwrites
- ✅ **Complete State Isolation**: Target/Reference modes fully independent
- ✅ **Excel Compliance Maintained**: All calculation formulas preserved
- ✅ **CTO Architecture Compliance**: No setTimeout usage

### **📚 Implementation Guides**:

- **S11-TROUBLESHOOTING-GUIDE.md**: Complete success story and template
- **S12-TROUBLESHOOTING-GUIDE.md**: Ready-to-implement audit and workplan
- **S13-TROUBLESHOOTING-GUIDE.md**: Complex HVAC calculation patterns
- **S10-DOWNSTREAM-FLOW-ISSUE.md**: System integration dependencies

FINAL STEP

# 🔄 **FALLBACK-TO-STRICT TRANSITION GUIDE**

## **The Strategic Transition from Fallbacks to Perfect Compliance**

**Created**: Based on S07 Phase 3A successful implementation  
**Purpose**: Document the systematic process for eliminating dependency contamination  
**Status**: ✅ **PROVEN PATTERN** - Successfully applied in S07

---

## 🎯 **OVERVIEW: THE THREE-PHASE APPROACH**

The transition from fallback patterns to strict dual-state compliance follows a systematic three-phase approach that ensures no functionality is broken during dependency resolution.

### **Core Principle: Fix Dependencies Before Removing Fallbacks**

**❌ WRONG**: Remove fallbacks immediately → causes calculation failures  
**✅ RIGHT**: Strategic fallback logging → fix dependencies → remove fallbacks gracefully

---

## 📋 **PHASE 1: STRATEGIC FALLBACK LOGGING**

### **Purpose**: Identify exactly where and when contamination occurs

**Implementation Pattern:**

```javascript
// ✅ STRATEGIC FALLBACK LOGGING (temporary debugging pattern)
let systemType;
if (isReferenceCalculation) {
  const refValue = window.TEUI?.StateManager?.getValue("ref_d_51");
  const targetFallback = window.TEUI?.StateManager?.getValue("d_51");
  if (refValue) {
    systemType = refValue;
  } else if (targetFallback) {
    console.warn(
      `[S07] 🚨 FALLBACK USED: ref_d_51 missing, using d_51="${targetFallback}" for Reference calculation`,
    );
    systemType = targetFallback;
  } else {
    console.warn(
      `[S07] 🚨 FALLBACK USED: Both ref_d_51 and d_51 missing, using default "Heatpump"`,
    );
    systemType = "Heatpump";
  }
} else {
  systemType = window.TEUI?.StateManager?.getValue("d_51") || "Heatpump";
}
```

### **Key Benefits:**

1. **Preserves working calculations** while identifying issues
2. **Clear logging** shows exactly which dependencies are missing
3. **Non-breaking** - allows continued development and testing
4. **Evidence-based** - provides specific fix targets

---

## 📋 **PHASE 2: SYSTEMATIC DEPENDENCY RESOLUTION**

### **A. Root Cause Analysis Pattern**

Based on fallback logs, categorize missing dependencies:

**1. Missing Local State Initialization:**

- **Symptom**: `ref_d_51 missing` for section's own user inputs
- **Root Cause**: No `setDefaults()` functions
- **Fix**: Implement FieldDefinitions-based initialization

**2. Missing Cross-Section Dependencies:**

- **Symptom**: `ref_d_63 missing` for external dependencies
- **Root Cause**: Upstream section not publishing Reference results
- **Fix**: Add `storeReferenceResults()` to upstream section

**3. Missing StateManager Publication:**

- **Symptom**: Local state populated but StateManager empty
- **Root Cause**: `setDefaults()` not publishing to StateManager
- **Fix**: Add StateManager publication to initialization

### **B. Implementation Priority Order**

**1. Fix Self-Dependencies First** (highest impact)

```javascript
// S07 Example: Add missing setDefaults() functions
TargetState.setDefaults = function () {
  this.values.d_49 = ModeManager.getFieldDefault("d_49") || "User Defined";
  this.values.d_51 = ModeManager.getFieldDefault("d_51") || "Heatpump";

  // ✅ CRITICAL: Publish to StateManager for cross-section communication
  if (window.TEUI?.StateManager) {
    window.TEUI.StateManager.setValue("d_49", this.values.d_49, "default");
    window.TEUI.StateManager.setValue("d_51", this.values.d_51, "default");
  }
};

ReferenceState.setDefaults = function () {
  this.values.d_49 = ModeManager.getFieldDefault("d_49") || "User Defined";
  this.values.d_51 = ModeManager.getFieldDefault("d_51") || "Heatpump";

  // ✅ CRITICAL: Publish Reference defaults with ref_ prefix
  if (window.TEUI?.StateManager) {
    window.TEUI.StateManager.setValue("ref_d_49", this.values.d_49, "default");
    window.TEUI.StateManager.setValue("ref_d_51", this.values.d_51, "default");
  }
};
```

**2. Fix ModeManager.setValue() Pattern** (ensures ongoing isolation)

```javascript
// ✅ S02 PROVEN PATTERN: Reference inputs published with ref_ prefix
setValue: function (fieldId, value, source = "user-modified") {
  const currentState = this.currentMode === "target" ? TargetState : ReferenceState;
  currentState.setValue(fieldId, value);

  // ✅ Target changes to StateManager for downstream sections
  if (this.currentMode === "target") {
    window.TEUI?.StateManager?.setValue(fieldId, value, source);
  }

  // ✅ Reference changes to StateManager with ref_ prefix
  if (this.currentMode === "reference" && window.TEUI?.StateManager) {
    window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, source);
  }
}
```

**3. Fix Cross-Section Dependencies** (requires coordination)

- Add `storeReferenceResults()` to upstream sections
- Ensure upstream sections follow same patterns

---

## 📋 **PHASE 3: GRACEFUL FALLBACK ELIMINATION**

### **When to Remove Fallbacks:**

**✅ Safe to Remove When:**

1. **Zero fallback warnings** in logs during comprehensive testing
2. **Perfect state isolation** verified (Target changes don't affect Reference results)
3. **All dependencies established** (both local and cross-section)
4. **Working calculations maintained** (no regression in core functionality)

### **Graceful Removal Pattern:**

**From Strategic Fallback:**

```javascript
// Phase 1: Strategic fallback with logging
const refValue = window.TEUI?.StateManager?.getValue("ref_d_51");
const targetFallback = window.TEUI?.StateManager?.getValue("d_51");
if (refValue) {
  systemType = refValue;
} else if (targetFallback) {
  console.warn(
    `[S07] 🚨 FALLBACK USED: ref_d_51 missing, using d_51="${targetFallback}"`,
  );
  systemType = targetFallback;
} else {
  systemType = "Heatpump";
}
```

**To Strict Compliance:**

```javascript
// Phase 3: Strict compliance (no fallbacks)
if (isReferenceCalculation) {
  systemType = window.TEUI?.StateManager?.getValue("ref_d_51") || "Heatpump";
} else {
  systemType = window.TEUI?.StateManager?.getValue("d_51") || "Heatpump";
}
```

**With Error Detection:**

```javascript
// Optional: Add error detection for missing critical dependencies
const systemType = isReferenceCalculation
  ? window.TEUI?.StateManager?.getValue("ref_d_51")
  : window.TEUI?.StateManager?.getValue("d_51");

if (!systemType) {
  console.error(
    `[S07] CRITICAL: Missing ${isReferenceCalculation ? "ref_" : ""}d_51 dependency`,
  );
  // Handle gracefully with documented default
  return "Heatpump";
}
```

---

## 🧪 **VERIFICATION TESTING PROTOCOL**

### **Phase 2 Verification (After Each Fix):**

1. **Refresh page** → check initialization logs
2. **Change values in Target mode** → verify no Reference contamination
3. **Change values in Reference mode** → verify no Target contamination
4. **Review fallback logs** → confirm reduction in warnings
5. **Test calculations** → ensure no regression

### **Phase 3 Verification (Before Fallback Removal):**

1. **Comprehensive user input testing** → all dropdowns, sliders, editable fields
2. **Mode switching testing** → values persist correctly between modes
3. **Cross-section impact testing** → downstream sections unaffected
4. **Performance testing** → no calculation slowdowns
5. **Edge case testing** → undefined values handled gracefully

---

## 📚 **CRITICAL IMPLEMENTATION INSIGHTS**

### **1. StateManager Publication is Essential**

**Key Discovery**: `setDefaults()` must publish to StateManager, not just local state:

```javascript
// ❌ INSUFFICIENT: Only populates local state
ReferenceState.setDefaults = function () {
  this.values.d_51 = "Heatpump"; // Only local
};

// ✅ COMPLETE: Publishes to StateManager for cross-section access
ReferenceState.setDefaults = function () {
  this.values.d_51 = "Heatpump";
  window.TEUI.StateManager.setValue("ref_d_51", this.values.d_51, "default");
};
```

### **2. FieldDefinitions as Single Source of Truth**

**Architectural Compliance**: Always read defaults from FieldDefinitions:

```javascript
// ✅ CORRECT: Read from field definitions (single source of truth)
TargetState.setDefaults = function () {
  this.values.d_51 = ModeManager.getFieldDefault("d_51") || "Heatpump";
};

// ❌ WRONG: Hardcode defaults (creates maintenance nightmare)
TargetState.setDefaults = function () {
  this.values.d_51 = "Heatpump"; // Duplicate of field definition
};
```

### **3. Incremental Testing is Critical**

**Lesson**: Test after each fix, don't batch multiple changes:

- **Fix 1**: Add `setDefaults()` → Test → Verify improvement
- **Fix 2**: Fix `ModeManager.setValue()` → Test → Verify further improvement
- **Fix 3**: Add StateManager publication → Test → Verify completion

---

## 🎯 **SUCCESS PATTERNS**

### **S07 Success Metrics (Achieved):**

- ✅ **`d_49` state isolation**: No contamination when changing water use method
- ✅ **`d_51` state isolation**: No contamination when changing DHW system
- ✅ **Reduced fallback warnings**: Only `ref_d_63` remains (external dependency)
- ✅ **Maintained functionality**: All calculations work correctly
- ✅ **Clean architecture**: Follows DUAL-STATE-CHEATSHEET.md patterns

### **Ready for Cross-Section Dependencies:**

- Next target: S09 `ref_d_63` publication
- Pattern established for other sections
- Systematic approach validated

---

## 📋 **RECOMMENDED DOCUMENTATION ADDITIONS**

### **For DUAL-STATE-CHEATSHEET.md:**

1. **Add "Fallback Transition Strategy" section**
2. **Document StateManager publication requirement for setDefaults()**
3. **Add verification testing checklist**

### **For DUAL-STATE-IMPLEMENTATION-GUIDE.md:**

1. **Add Phase 1-3 systematic approach**
2. **Document strategic fallback logging pattern**
3. **Add dependency resolution priority order**

### **For AI-FRIENDLY-PATTERNS.md:**

1. **Update Pattern 7 with StateManager publication requirement**
2. **Add "Graceful Fallback Elimination" as new pattern**
3. **Document verification testing protocol**

---

**This guide captures the proven systematic approach for moving from fallback contamination to perfect dual-state isolation, based on the successful S07 Phase 3A implementation.**
