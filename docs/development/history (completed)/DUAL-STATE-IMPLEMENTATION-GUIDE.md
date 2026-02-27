# 🏆 TEUI 4.011RF - DUAL-STATE ARCHITECTURE GUIDE (v3)

**Status**: ✅ **Gold Standard** | **Updated**: July 24, 2025  
**Mandate**: This document outlines the **sole approved pattern** for implementing dual-state (Target/Reference) functionality. It is based on the successful, self-contained architecture proven in Section 03, 08, 10, and 11. Includes Sequential Refactoring Strategy for complete Pattern A migration. All previous guides are superseded.

**🚨 BEFORE IMPLEMENTING**: Review the **MANDATORY QA/QC Checklist** in `DUAL-STATE-CHEATSHEET.md` - it contains critical anti-pattern detection that prevents architectural failures.

---

## 🏛️ **ARCHITECTURAL MANDATE: The Self-Contained State Module (FINAL STANDARD)**

**⚠️ CRITICAL DECREE**: As of August 2025, **Pattern A (Self-Contained State Objects)** is the **SOLE APPROVED APPROACH** for dual-state implementation. All previous patterns using global prefixed state (target*, ref*) are **DEPRECATED** and should be migrated to this standard.

---

## 🚨 **CRITICAL: PATTERN B CONTAMINATION DETECTION & ELIMINATION**

**⚠️ URGENT WARNING**: Pattern B contamination has caused **multiple refactor failures** (S12 attempts 1-7). This section is **MANDATORY** reading before any dual-state implementation.

### **🔍 Pattern B Contamination Symptoms**

- **Dropdown Blanking**: Dropdowns go blank after user edits
- **State Persistence Issues**: Values don't persist across mode toggles
- **ComponentBridge Conflicts**: `target_` prefixed values created but not accessible
- **Mixed Architecture**: Some functions use Pattern A, others use Pattern B

### **🔍 How to Detect Pattern B Contamination**

**MANDATORY PRE-REFACTOR SCAN**:

```bash
# Search for Pattern B contamination in target section
grep -n "target_\|ref_" sections/4011-SectionXX.js

# Look for these TOXIC PATTERNS:
```

#### **❌ TOXIC PATTERN 1: Prefixed External Dependencies**

```javascript
// ❌ WRONG: Pattern B contamination
d20_hdd = parseFloat(getNumericValue("target_d_20") || getNumericValue("d_20"));
d21_cdd = parseFloat(getNumericValue("ref_d_21") || getNumericValue("d_21"));
```

#### **❌ TOXIC PATTERN 2: Prefixed Cross-Section Storage**

```javascript
// ❌ WRONG: Pattern B contamination
window.TEUI.StateManager.setValue("ref_i_103", value, "calculated");
window.TEUI.StateManager.setValue("target_d_105", value, "user-modified");
```

#### **❌ TOXIC PATTERN 3: Over-Engineered refreshUI Safety Checks**

```javascript
// ❌ WRONG: Causes dropdown blanking
const optionExists = Array.from(dropdown.options).some(
  (option) => option.value === stateValue,
);
if (optionExists && dropdown.value !== stateValue) {
  dropdown.value = stateValue;
}
```

### **✅ Pattern A Purification (MANDATORY)**

#### **✅ CORRECT PATTERN 1: Clean External Dependencies**

```javascript
// ✅ CORRECT: Pattern A clean access
function getGlobalNumericValue(fieldId) {
  const rawValue = window.TEUI?.StateManager?.getValue(fieldId);
  return window.TEUI.parseNumeric(rawValue) || 0;
}

// Usage: Clean climate data access
d20_hdd = getGlobalNumericValue("d_20");
d21_cdd = getGlobalNumericValue("d_21");
```

#### **✅ CORRECT PATTERN 2: No Prefixed Storage**

```javascript
// ✅ CORRECT: Pattern A doesn't need prefixed cross-section storage
// Reference calculations are internal only, not stored globally
calculateReferenceModel(); // Internal calculations only
```

#### **✅ CORRECT PATTERN 3: Simple refreshUI**

```javascript
// ✅ CORRECT: Simple dropdown updates (copy S10/S11 pattern)
if (dropdown) {
  dropdown.value = stateValue; // Simple and direct
} else if (element.hasAttribute("contenteditable")) {
  element.textContent = stateValue;
}
```

### **🔧 ComponentBridge Integration**

**CRITICAL**: Ensure ComponentBridge sync works with Pattern A:

```javascript
// In ModeManager.setValue():
setValue: function (fieldId, value, source = "user") {
  this.getCurrentState().setValue(fieldId, value, source);

  // BRIDGE: Sync Target changes to StateManager (NO PREFIX)
  if (this.currentMode === "target") {
    window.TEUI.StateManager.setValue(fieldId, value, "user-modified");
  }
}
```

### **📋 Pattern B Elimination Checklist**

**MANDATORY BEFORE ANY DUAL-STATE REFACTOR**:

- [ ] **Scan for Contamination**: `grep -n "target_\|ref_" targetFile.js`
- [ ] **Remove Prefixed Dependencies**: Replace with `getGlobalNumericValue()`
- [ ] **Remove Prefixed Storage**: Pattern A doesn't need `ref_` storage
- [ ] **Simplify refreshUI**: Use S10/S11 working pattern, no safety checks
- [ ] **Test ComponentBridge**: Ensure unprefixed sync to StateManager
- [ ] **Validate External Dependencies**: All external reads via `getGlobalNumericValue()`

### **⚠️ Why This Matters**

**Pattern B contamination has caused**:

- **7 failed S12 refactor attempts** over 3 days
- **Multiple AI agents** unable to identify root cause
- **Hundreds of hours** of debugging time wasted
- **Complete section functionality breakdown**

**This section prevents future failures and ensures first-attempt success.**

---

## 🏗️ **ARCHITECTURAL CLARITY: When to Use Prefixed Values**

**⚠️ CRITICAL DISTINCTION**: Not all prefixed values are contamination. Understanding **when to keep** vs **when to eliminate** prefixed values is essential for successful Pattern A implementation.

### **✅ KEEP ref\_ Prefixes: Cross-Section Communication**

**Purpose**: Downstream sections need access to "what would the reference values be?" for comparison and reporting.

```javascript
// ✅ CORRECT: Store calculated RESULTS for other sections to use
// In S11 (Pattern A) - calculateReferenceModel()
window.TEUI.StateManager.setValue(
  "ref_d_98",
  totals.areaD.toString(),
  "calculated",
);
window.TEUI.StateManager.setValue(
  "ref_i_98",
  totals.loss.toString(),
  "calculated",
);

// ✅ CORRECT: Store calculated RESULTS for downstream consumption
// In S09 (Pattern A) - calculateReferenceModel()
window.TEUI.StateManager.setValue(
  "ref_i_71",
  (refTotal * refHeatingRatio).toString(),
  "calculated",
);
window.TEUI.StateManager.setValue(
  "ref_h_71",
  refTotal.toString(),
  "calculated",
);
```

**Why This Works**: Other sections (S14, S15, S01) need to access reference calculation results for summary reports and compliance comparisons.

### **❌ ELIMINATE target*/ref* Prefixes: External Dependencies**

**Problem**: Sections try to read prefixed external values, but upstream sections manage Target/Reference internally.

```javascript
// ❌ WRONG: Pattern B contamination - trying to read external prefixed values
const refArea =
  window.TEUI?.StateManager?.getValue("ref_h_15") ||
  window.TEUI?.StateManager?.getValue("h_15");
const refClimate = parseFloat(
  getNumericValue("ref_d_20") || getNumericValue("d_20"),
);

// ✅ CORRECT: Pattern A clean access - upstream section handles Target/Reference
const area = getGlobalNumericValue("h_15"); // S02 manages Target vs Reference internally
const climate = getGlobalNumericValue("d_20"); // S03 manages Target vs Reference internally
```

**Why This Works**: S02 and S03 (Pattern A) internally manage Target vs Reference and provide the correct value based on current context.

### **🎯 The "State Sovereignty" Principle**

**Pattern A Architecture Rule**: Each section has **complete sovereignty** over its internal state management.

#### **Internal State Management (Self-Contained)**

```javascript
// Each section manages its own Target/Reference internally
const ModeManager = {
  currentMode: "target", // or "reference"
  getValue: function (fieldId) {
    return this.currentMode === "target"
      ? TargetState.getValue(fieldId)
      : ReferenceState.getValue(fieldId);
  },
};
```

#### **External Dependencies (Clean Interface)**

```javascript
// External reads are always clean - no prefixes
function getGlobalNumericValue(fieldId) {
  const rawValue = window.TEUI?.StateManager?.getValue(fieldId);
  return window.TEUI.parseNumeric(rawValue) || 0;
}

// Usage: Read climate data from S03
const hdd = getGlobalNumericValue("d_20"); // S03 provides correct value based on its mode
```

#### **Cross-Section Results (Prefixed for Clarity)**

```javascript
// Outbound results use prefixes for downstream consumption
if (isReferenceCalculation) {
  // Store reference results for other sections
  window.TEUI.StateManager.setValue(
    "ref_i_98",
    heatloss.toString(),
    "calculated",
  );
} else {
  // Store target results (unprefixed)
  window.TEUI.StateManager.setValue("i_98", heatloss.toString(), "calculated");
}
```

### **📋 Prefixed Values Decision Matrix**

| **Scenario**                              | **Use Prefixes?** | **Pattern**                     |
| ----------------------------------------- | ----------------- | ------------------------------- |
| **Reading from other sections**           | ❌ NO             | `getGlobalNumericValue("d_20")` |
| **Reading within own section**            | ❌ NO             | `ModeManager.getValue("d_105")` |
| **Storing calculated results for others** | ✅ YES            | `setValue("ref_i_98", value)`   |
| **Internal calculations**                 | ❌ NO             | Use state objects directly      |

### **🚨 Common Contamination Patterns**

#### **❌ TOXIC: External Dependency Contamination**

```javascript
// Reading prefixed values from other sections
const climate = getNumericValue("target_d_20") || getNumericValue("ref_d_20");
const area = window.TEUI?.StateManager?.getValue("ref_h_15");
```

#### **✅ CLEAN: External Dependency Pattern A**

```javascript
// Reading clean values - upstream section manages Target/Reference
const climate = getGlobalNumericValue("d_20");
const area = getGlobalNumericValue("h_15");
```

### **🎯 Why This Architecture Works**

1. **No Cross-Contamination**: Each section's state is completely isolated
2. **Simple Interfaces**: External dependencies use clean, unprefixed field names
3. **Clear Separation**: Internal state management vs external communication
4. **Downstream Compatibility**: Reference results available for reporting/comparison
5. **Mode Awareness**: Each section handles Target vs Reference internally

### **⚠️ Migration Strategy**

When purifying Pattern B contamination:

1. **Keep**: `ref_` prefixed STORAGE of calculated results (`setValue("ref_i_71", ...)`)
2. **Remove**: `target_`/`ref_` prefixed READING of external dependencies (`getValue("ref_d_20")`)
3. **Replace**: External reads with `getGlobalNumericValue(fieldId)`
4. **Preserve**: Cross-section communication patterns for downstream sections

This ensures **clean internal state management** while maintaining **cross-section compatibility**.

---

Each dual-state section must have its own `TargetState` and `ReferenceState` objects, managed by a `ModeManager` facade. This ensures that:

1.  **State Isolation:** Each section's state is completely independent, preventing cross-section interference.
2.  **Persistence:** States are saved to and loaded from `localStorage` using section-specific keys.
3.  **Default Values (Clarified):** Defaults originate in FieldDefinitions only (sectionRows value props). `setDefaults()` should load those values into state without redefining them.
4.  **Value Retrieval:** Values are retrieved using `getValue()` and updated using `setValue()`.
5.  **Reference Standard Overlay (Clarified):** Apply building-code subsets from ReferenceValues.js as an overlay to `ReferenceState` based on d_13. Do not push these values into FieldDefinitions.
6.  **Visual State Feedback:** Clear visual indicators distinguish between default and user-modified values.

---

## 🎯 **PATTERN A: Dynamic Reference Loading & Visual State Management**

### Dynamic Reference Defaults Integration

Reference state defaults must be dynamically loaded from the ReferenceValues.js system based on the user's selection in dropdown d_13 (Reference Standard). This ensures all reference values stay synchronized with the selected building code standard.

```javascript
// Reference State Management (initialize from FieldDefinitions, then overlay)
const ReferenceState = {
  state: {},
  listeners: {},

  initialize: function () {
    const savedState = localStorage.getItem("SXX_REFERENCE_STATE");
    if (savedState) {
      this.state = JSON.parse(savedState);
    } else {
      this.setDefaults();
    }
  },

  setDefaults: function () {
    // Load ONLY FieldDefinition defaults here
    this.state = loadDefaultsFromFieldDefinitions();
  },

  applyReferenceStandardOverlay: function (standardKey) {
    const ref = window.TEUI?.ReferenceValues?.[standardKey] || {};
    // Overwrite only d_13-governed fields
    Object.assign(this.state, pick(ref, CODE_GOVERNED_FIELDS));
    this.saveState?.();
  },

  // Listen for changes to the reference standard and apply overlay
  onReferenceStandardChange: function () {
    console.log("SXX: Reference standard changed, applying overlay");
    const std = window.TEUI?.StateManager?.getValue?.("d_13");
    this.applyReferenceStandardOverlay(std);
    this.saveState();
    if (ModeManager.currentMode === "reference") {
      ModeManager.refreshUI();
      calculateAll();
    }
  },

  saveState: function () {
    localStorage.setItem("SXX_REFERENCE_STATE", JSON.stringify(this.state));
  },

  setValue: function (fieldId, value, source = "user") {
    this.state[fieldId] = value;
    this.saveState();

    // Mark field as user-modified for visual feedback
    if (source === "user" || source === "user-modified") {
      this.markAsUserModified(fieldId);
    }
  },

  getValue: function (fieldId) {
    return this.state[fieldId];
  },

  markAsUserModified: function (fieldId) {
    // Apply visual styling to indicate user modification
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (element && ModeManager.currentMode === "reference") {
      element.classList.remove("reference-default");
      element.classList.add("reference-modified");
    }
  },
};
```

### Enhanced ModeManager with Visual Feedback

```javascript
const ModeManager = {
  currentMode: "target",

  initialize: function () {
    TargetState.initialize();
    ReferenceState.initialize();

    // Listen for reference standard changes
    if (window.TEUI?.StateManager?.addListener) {
      window.TEUI.StateManager.addListener("d_13", () => {
        ReferenceState.onReferenceStandardChange();
      });
    }
  },

  resetState: function () {
    console.log("SXX: Resetting state and clearing localStorage.");

    // Reset both states to their current dynamic defaults
    TargetState.setDefaults();
    TargetState.saveState();
    ReferenceState.setDefaults(); // This will reload from current d_13 selection
    ReferenceState.saveState();

    // Clear all user-modified visual indicators
    this.clearUserModifiedIndicators();

    console.log("SXX: States have been reset to defaults.");

    // After resetting, refresh the UI and recalculate
    this.refreshUI();
    calculateAll();
  },

  clearUserModifiedIndicators: function () {
    const sectionElement = document.getElementById("sectionElementId");
    if (!sectionElement) return;

    const modifiedElements = sectionElement.querySelectorAll(
      ".reference-modified, .target-modified",
    );
    modifiedElements.forEach((element) => {
      element.classList.remove("reference-modified", "target-modified");
      element.classList.add(
        this.currentMode === "reference"
          ? "reference-default"
          : "target-default",
      );
    });
  },

  refreshUI: function () {
    // Standard UI refresh logic + visual state indicators
    const sectionElement = document.getElementById("sectionElementId");
    if (!sectionElement) return;

    const currentState = this.getCurrentState();
    const fieldsToSync = ["field1", "field2"]; // Define per section

    fieldsToSync.forEach((fieldId) => {
      const stateValue = currentState.getValue(fieldId);
      if (stateValue === undefined || stateValue === null) return;

      const element = sectionElement.querySelector(
        `[data-field-id="${fieldId}"]`,
      );
      if (!element) return;

      // Update element value (standard logic)
      // ... element update code ...

      // Apply visual state indicators
      this.applyVisualStateIndicators(element, fieldId);
    });
  },

  applyVisualStateIndicators: function (element, fieldId) {
    // Remove all state classes
    element.classList.remove(
      "reference-default",
      "reference-modified",
      "target-default",
      "target-modified",
    );

    if (this.currentMode === "reference") {
      // Check if this field has been user-modified vs. default
      const isUserModified = this.isFieldUserModified(fieldId);
      element.classList.add(
        isUserModified ? "reference-modified" : "reference-default",
      );
    } else {
      // Target mode: check for user modifications
      const isUserModified = this.isFieldUserModified(fieldId);
      element.classList.add(
        isUserModified ? "target-modified" : "target-default",
      );
    }
  },

  isFieldUserModified: function (fieldId) {
    // Implementation depends on how you track modifications
    // Could be based on comparing current value to default value
    // Or maintaining a separate "modified" flag in state
    return false; // Placeholder - implement based on section needs
  },

  // ... rest of standard ModeManager methods ...
};
```

### Required CSS for Visual State Feedback

```css
/* Default state styling - grey italic to indicate defaults */
.reference-default {
  color: #6c757d !important;
  font-style: italic !important;
  font-weight: normal !important;
}

.target-default {
  color: #495057 !important;
  font-style: normal !important;
  font-weight: normal !important;
}

/* User-modified state styling - bold blue to indicate user changes */
.reference-modified {
  color: #007bff !important;
  font-style: normal !important;
  font-weight: bold !important;
}

.target-modified {
  color: #0056b3 !important;
  font-style: normal !important;
  font-weight: bold !important;
}
```

### Naming Conventions (MANDATORY)

All dual-state implementations MUST follow these naming conventions:

- **State Objects**: `TargetState`, `ReferenceState` (PascalCase)
- **ModeManager**: Always named `ModeManager` (never `DualState` or other aliases)
- **localStorage Keys**: `"SXX_TARGET_STATE"`, `"SXX_REFERENCE_STATE"` (where XX is section number)
- **Methods**: `initialize()`, `setDefaults()`, `setValue()`, `getValue()`, `saveState()`, `resetState()`, `refreshUI()`
- **Mode Values**: `"target"`, `"reference"` (lowercase strings)
- **Global Exposure**: `window.TEUI.sectXX.ModeManager` (where XX is section number)

**⚠️ CRITICAL**: Future developers and AI agents must follow these exact naming conventions to prevent architectural regression.

---

## 🚨 **CRITICAL: Dual-Engine Architecture & UI Toggle Pattern**

**⚠️ MAJOR ARCHITECTURAL CLARIFICATION**: Previous guidance contained contradictory information about when calculations should run. This section provides the **definitive correct pattern** based on successful S04 implementation.

### **🎯 The Correct Dual-Engine Architecture**

**FUNDAMENTAL PRINCIPLE**:

- **Calculations run automatically** when data changes (dual-engine always producing both Target and Reference results)
- **UI toggles only switch display** (no calculation triggering)
- **Values are pre-calculated** and stored in StateManager with `ref_` prefixes

### **✅ CORRECT: Dual-Engine calculateAll() Pattern**

```javascript
// ✅ ALWAYS runs both engines to maintain dual data streams
function calculateAll() {
  console.log("[Section] Running dual-engine calculations...");

  // BOTH engines run in parallel, regardless of UI mode
  calculateTargetModel(); // Stores unprefixed values in StateManager
  calculateReferenceModel(); // Stores ref_ prefixed values in StateManager

  console.log("[Section] Dual-engine calculations complete");
}

function calculateReferenceModel() {
  // Switch to reference mode temporarily for calculations
  const originalMode = ModeManager.currentMode;
  ModeManager.currentMode = "reference";

  try {
    // Run calculations using Reference state inputs
    // Store results with ref_ prefix for downstream sections
    setReferenceCalculatedValue("j_32", value); // → StateManager.setValue("ref_j_32", value)
  } finally {
    ModeManager.currentMode = originalMode;
  }
}
```

### **✅ CORRECT: UI Toggle switchMode() Pattern**

```javascript
// ✅ CORRECT: UI toggle only switches display, never triggers calculations
switchMode: function (mode) {
  if (this.currentMode === mode) return; // No change needed

  this.currentMode = mode;
  console.log(`Switched to ${mode.toUpperCase()} mode`);

  // ONLY update display - values should already be calculated
  this.refreshUI();                    // 1. Update input field displays
  this.updateCalculatedDisplayValues(); // 2. Read pre-calculated values from StateManager

  // ❌ NEVER call calculateAll() here - it's a UI action, not a data change
}
```

### **🎯 When Calculations ARE Triggered**

**Calculations should run when data actually changes:**

```javascript
// ✅ User input changes
element.addEventListener('blur', function() {
  ModeManager.setValue(fieldId, value, 'user-modified');
  calculateAll(); // Recalculate because data changed
});

// ✅ External dependency changes
StateManager.addListener('d_136', () => {
  console.log('Upstream value changed');
  calculateAll(); // Recalculate because dependency changed
});

// ✅ App initialization
onSectionRendered: function() {
  ModeManager.initialize();
  calculateAll(); // Initial calculation to populate all values
}
```

### **🔍 Debugging "Identical Values" Issue**

**Symptom**: Reference mode shows identical values to Target mode  
**Root Cause**: Dual-engine calculations not storing Reference values properly  
**Fix**: Ensure `calculateReferenceModel()` stores values with `ref_` prefixes

**Debug Steps:**

1. Check if Reference values exist in StateManager:
   ```javascript
   const refValue = window.TEUI.StateManager.getValue(`ref_${fieldId}`);
   const targetValue = window.TEUI.StateManager.getValue(fieldId);
   console.log(`DEBUG: ${fieldId}: target="${targetValue}", ref="${refValue}"`);
   ```
2. If `refValue` is null/undefined, the dual-engine pattern is broken
3. Fix `calculateReferenceModel()` to store `ref_` prefixed values
4. **Never** add `calculateAll()` to `switchMode()` - that's treating the symptom, not the cause

### **📋 Implementation Checklist**

When implementing dual-state sections:

- [ ] **Dual-Engine**: `calculateAll()` always runs both Target and Reference models
- [ ] **Reference Storage**: `calculateReferenceModel()` stores `ref_` prefixed values in StateManager
- [ ] **UI Toggle**: `switchMode()` only calls `refreshUI()` and `updateCalculatedDisplayValues()`
- [ ] **Data Triggers**: `calculateAll()` called on user input, external changes, and initialization
- [ ] **Never**: Call `calculateAll()` from UI toggle functions

**⚠️ CRITICAL**: UI toggles are display filters, NOT calculation triggers. Values should be pre-calculated and waiting in StateManager.

### **🔧 CORRECTION NEEDED: Existing Sections with Wrong Pattern**

**URGENT**: Some existing sections incorrectly call `calculateAll()` in `switchMode()` and need correction:

```javascript
// ❌ WRONG: S11 line 249 - remove this calculateAll()
switchMode: function (mode) {
  this.currentMode = mode;
  this.refreshUI();
  calculateAll(); // ← REMOVE THIS LINE
}

// ✅ CORRECT: Should be display-only
switchMode: function (mode) {
  if (this.currentMode === mode) return;
  this.currentMode = mode;
  this.refreshUI();
  this.updateCalculatedDisplayValues(); // Only update display
}
```

**Sections Needing Correction**: S11 (and any others calling `calculateAll()` in `switchMode()`). S13 has been corrected.

---

## 🎯 **REFERENCE COMPARISON SYSTEM (M/N/O Columns)**

### **System Design Philosophy**

The Reference Comparison System provides real-time feedback on how the current design compares to building code requirements. This system must work differently in Target vs Reference modes to provide meaningful feedback.

### **Column Definitions**

- **Column M**: Reference percentage (current value ÷ reference value × 100%)
- **Column N**: Status indicator (✓ = pass, ✗ = fail)
- **Column O**: Additional reference metrics (varies by section)

### **Mode-Specific Behavior**

#### **🟢 Reference Mode: Perfect Compliance**

When in Reference mode, the system is displaying the **exact building code minimums**:

- **Column M**: Should ALWAYS show **100%**
- **Column N**: Should ALWAYS show **✓** (pass)
- **Logic**: Reference values meeting reference values = perfect compliance
- **Purpose**: Validates that ReferenceValues.js data is loading correctly

```javascript
// Reference Mode Logic
if (ModeManager.currentMode === "reference") {
  referencePercent = 100; // Always 100% in reference mode
  isGood = true; // Always pass in reference mode
}
```

#### **🔵 Target Mode: Performance Comparison**

When in Target mode, the system compares user design against building code requirements:

- **Column M**: Shows actual performance ratio
  - **110%** = 10% better than code minimum (exceeds requirement)
  - **90%** = 10% worse than code minimum (fails requirement)
- **Column N**: Shows pass/fail based on meeting minimum requirements
  - **✓** = meets or exceeds code minimum
  - **✗** = fails to meet code minimum

```javascript
// Target Mode Logic Examples
// RSI comparison (higher is better)
if (baseline.type === "rsi") {
  referencePercent = (currentValue / referenceValue) * 100;
  isGood = currentValue >= referenceValue;
}

// U-value comparison (lower is better)
if (baseline.type === "uvalue") {
  referencePercent = (referenceValue / currentValue) * 100;
  isGood = currentValue <= referenceValue;
}
```

### **Implementation Requirements**

#### **🚨 MANDATORY: d_13 Standard Change Integration**

**Only sections with ReferenceValues.js dependencies MUST implement this pattern:**

⚠️ **Exception**: Sections without building code minimums (S01, S04, S06, etc.) do NOT need this pattern. Only sections with entries in `ReferenceValues.js` require d_13 standard change integration.

```javascript
// 1. MANDATORY: Listen for d_13 changes in ModeManager.initialize()
window.TEUI.StateManager.addListener("d_13", () => {
  ReferenceState.onReferenceStandardChange();
});

// 2. MANDATORY: Implement onReferenceStandardChange in ReferenceState
onReferenceStandardChange: function () {
  console.log("SXX: Reference standard changed, reloading defaults");
  this.setDefaults(); // Reload from ReferenceValues.js[newStandard]
  this.saveState();
  // Only refresh UI if currently in reference mode
  if (ModeManager.currentMode === "reference") {
    ModeManager.refreshUI();
    calculateAll();
  }
}
```

**Why This is Critical:**

- User changes `d_13` in S02 → All sections must reload building code minimums
- Ensures Reference mode always reflects current building standard
- Maintains regulatory compliance across standard changes

#### **Dynamic Reference Values**

The comparison must use **dynamic reference values** from the current ReferenceState, not static baselines:

```javascript
function updateReferenceIndicators(rowId) {
  // ✅ CORRECT: Use dynamic reference values
  const referenceValue =
    ModeManager.currentMode === "reference"
      ? ModeManager.getValue(fieldId) // Use current reference state
      : ReferenceState.getValue(fieldId); // Use reference state for comparison

  // ❌ WRONG: Use static baseline values
  // const referenceValue = baselineValues[rowId]?.value;
}
```

#### **Area Field Preservation**

When d_13 (reference standard) changes:

- **Must Update**: RSI values (f*\*), U-values (g*\*) from ReferenceValues.js
- **Must Preserve**: User-modified area values (d\_\*) - these are design choices, not code requirements

```javascript
onReferenceStandardChange: function() {
  // Update only performance values, preserve area values
  const preservedAreas = {};

  // Preserve user-modified areas
  ['d_85', 'd_86', 'd_87', 'd_94', 'd_95', 'd_96'].forEach(fieldId => {
    if (this.isUserModified(fieldId)) {
      preservedAreas[fieldId] = this.state[fieldId];
    }
  });

  // Load new reference values
  this.setDefaults();

  // Restore preserved areas
  Object.assign(this.state, preservedAreas);
  this.saveState();
}
```

### **Cross-Section Consistency**

This Reference Comparison System should be implemented consistently across all sections with building code requirements:

- **Section 11**: Insulation values (RSI), thermal performance (U-values), thermal bridging
- **Section 10**: Solar heat gain coefficients, shading requirements
- **Section 08**: Ventilation rates, air quality standards
- **Future Sections**: Equipment efficiency, energy targets

### **Visual Feedback Standards**

#### **Status Indicators**

- **✓ (Green)**: Meets or exceeds requirements
- **✗ (Red)**: Fails to meet requirements
- **? (Yellow)**: Calculation error or missing data

#### **Percentage Colors**

- **Green**: ≥100% (meets/exceeds)
- **Yellow**: 90-99% (close but failing)
- **Red**: <90% (significantly failing)

### **Testing Validation**

To verify correct implementation:

1. **Reference Mode Test**: Switch to Reference mode → All M columns should show 100%, all N columns should show ✓
2. **Target Superior Test**: In Target mode with better values → Should show >100% with ✓
3. **Target Inferior Test**: In Target mode with worse values → Should show <100% with ✗
4. **d_13 Change Test**: Change reference standard → Reference percentages update, areas preserve user modifications

---

## 🚀 **REFACTORING PRIORITIES & ARCHITECTURAL MIGRATION**

### **Current Architecture Status**

**✅ Fully Refactored (Dual-State Pattern A):**

- **Section 03**: Climate data and reference standards ✅ **VERIFIED COMPLETE**
  - ✅ Province→City sequential selection preserved
  - ✅ ClimateValues.js integration preserved
  - ✅ Future/Present timeframe logic preserved
  - ✅ Occupancy dependency from S02 preserved
  - ✅ Climate zone reporting to S10 (j_19) preserved
  - ✅ Self-contained state module with complete Pattern A compliance
- **Section 08**: Ventilation rates and air quality
- **Section 10**: Solar radiant gains and utilization factors
- **Section 11**: Transmission losses and thermal performance

**🎯 Next Priority (Critical for Architecture Consistency):**

- **Section 01**: Building geometry and foundation data
- **Section 02**: Energy targets and performance metrics

**🔄 Future Migration:**

- **Section 04-07**: Equipment and systems
- **Section 09**: Internal gains
- **Section 12+**: Advanced calculations and reporting

### **S03 Migration Completed ✅**

Section 03 migration to Pattern A has been successfully completed and verified:

- **✅ Prefixed State Contamination Eliminated**: Clean `d_20`, `j_19` reads via ModeManager
- **✅ Cross-Section Dependencies Preserved**: S10, S11 continue to access climate data seamlessly
- **✅ Code Complexity Reduced**: Standardized helper functions and state management
- **✅ Maintenance Burden Eliminated**: Consistent patterns with S08, S10, S11

### **Migration Sequence Strategy**

#### **Phase 1: Core Foundation (Priority 1)**

**Target**: Complete by Q3 2025

1. **Section 01**: Building areas, geometry, foundation data

   - **Impact**: All area calculations depend on S01 data
   - **Dependencies**: S02, S11, S10 read building areas from S01

2. **Section 02**: Energy targets, performance benchmarks
   - **Impact**: Performance comparisons and compliance checks
   - **Dependencies**: S11, S12+ compare against S02 targets

#### **Phase 2: Systems Integration (Priority 2)**

**Target**: Complete by Q4 2025

3. **Section 04-07**: HVAC equipment, domestic hot water, lighting

   - **Impact**: Equipment efficiency and capacity calculations
   - **Dependencies**: Equipment selections affect overall energy performance

4. **Section 09**: Internal gains (people, equipment, lighting)
   - **Impact**: Gains calculations for thermal modeling
   - **Dependencies**: Works with S10 (radiant gains) and S11 (transmission)

#### **Phase 3: Advanced Features (Priority 3)**

**Target**: Complete by Q1 2026

5. **Section 12+**: Advanced calculations, reporting, compliance
   - **Impact**: Final performance metrics and code compliance
   - **Dependencies**: Integrates all previous sections

### **Migration Implementation Guide**

Each section migration should follow this standardized process:

1. **Pre-Migration Assessment**

   - Identify all dependencies (which sections read this section's data)
   - Document current state structure and field naming
   - Create backup of working version

2. **Pattern A Implementation**

   - Add TargetState and ReferenceState objects
   - Implement ModeManager facade
   - Add header controls (toggle + reset)
   - Update helper functions to use ModeManager

3. **Dependency Resolution**

   - Update dependent sections to read from new state structure
   - Test cross-section data flow
   - Verify calculations remain accurate

4. **Validation & Testing**

   - **Reference Mode Test**: All comparisons show 100%/✓
   - **Target Mode Test**: Performance comparisons work correctly
   - **Cross-Section Test**: Dependencies function properly
   - **Reset Test**: State management works as expected

5. **Documentation Update**
   - Update this GUIDE.md with lessons learned
   - Document any section-specific patterns or challenges
   - Update README.md status

## 🚀 **SEQUENTIAL REFACTORING STRATEGY (July 2025)**

**Status**: ✅ **Recommended Implementation Plan**  
**Context**: Based on dependency analysis and successful S03/S08/S10/S11 refactoring

### **🔄 Complete Dependency Flow Map**

```
S05 (Emissions) ──→ S04 (Energy/Emissions) ──→ S15 → S01
S06 (Renewable) ──→ S04 (Energy/Emissions) ──→ S15 → S01
S07 (Water) ──────→ S04 (Energy/Emissions) ──→ S15 → S01
                           ↑
S09 (Internal Gains) → S10 ✅ → S13 → S14 → S15 → S01
    ↓                    ↓      ↓      ↓      ↓      ↓
S12 (Volume/Surface) ────────→ S13 → S14 → S15 → S01
    ↓                           ↓      ↓      ↓      ↓
S11 ✅ (Envelope) ─────────────→ S14 → S15 → S01
    ↓                                  ↓      ↓
S03 ✅ (Climate) ──────────────────────→ S15 → S01
```

**🎯 Critical Insight**: S04 provides `ref_j_32` and `ref_k_32` that cause S01's oscillating bug, making S04-07 essential for the sequential refactoring plan.

**Key Insight**: Working **upstream-first** prevents timing issues and mixed architecture dependencies that cause calculation instability.

### **🎯 Implementation Sequence (Updated with S04-07)**

#### **Phase 1: Core Foundation**

**1. Section 09 (Internal Gains)** ← _Start Here_

- **Priority**: HIGH - Eliminates S10's last external dependency
- **Dependencies**: S02 ✅, S01 (floor area), S03 ✅ (climate)
- **Benefit**: Provides clean `i_71` feed to S10 (already Pattern A)
- **Scope**: Internal gains calculations, equipment loads, occupancy
- **Expected Duration**: 2-3 hours

**2. Section 12 (Volume/Surface Metrics)**

- **Dependencies**: S11 ✅ (envelope data), S03 ✅ (climate)
- **Benefit**: Provides envelope metrics to S13
- **Scope**: Building geometry calculations, surface areas, U-values

#### **Phase 2: Energy & Emissions Chain (Critical for S01 Bug)**

**3. Section 05 (CO2e Emissions)**

- **Dependencies**: S02 ✅ (building info), embodied carbon calculations
- **Benefit**: Feeds emissions calculations to S04
- **Scope**: Carbon emissions, embodied carbon targets

**4. Section 06 (Renewable Energy)**

- **Dependencies**: S02 ✅ (building info), renewable energy systems
- **Benefit**: Provides renewable energy offsets to S04
- **Scope**: Solar PV, wind, green gas, renewable energy credits

**5. Section 07 (Water Use)**

- **Dependencies**: S02 ✅ (building info), S03 ✅ (climate)
- **Benefit**: Provides domestic hot water energy to S04
- **Scope**: Water consumption, DHW heating systems

**6. Section 04 (Energy Summary - Emissions & Fuels)** ← _CRITICAL_

- **Priority**: CRITICAL - Provides `ref_j_32` and `ref_k_32` for S01's oscillating bug
- **Dependencies**: S05, S06, S07 (all energy sources)
- **Benefit**: **Resolves S01's primary dependency issue**
- **Scope**: Total energy calculations, fuel consumption, emissions totals

#### **Phase 3: Mechanical & Performance Summary**

**7. Section 13 (Mechanical Loads)**

- **Critical**: Uses elevation from S03 fix (cooling calculations)
- **Dependencies**: S09 (internal gains), S12 (envelope metrics)
- **Benefit**: Mechanical systems calculations for S14
- **Scope**: HVAC loads, ventilation, free cooling

**8. Section 14 (TEDI Summary)**

- **Dependencies**: S11 ✅, S10 ✅, S12, S13 (all clean by this point)
- **Benefit**: Building envelope performance metrics
- **Scope**: TEDI/TELI calculations, envelope performance

**9. Section 15 (TEUI Summary)**

- **Critical**: Provides `ref_h_136` that causes S01's oscillating bug
- **Dependencies**: S04, S14 and all other sections using Pattern A
- **Benefit**: Final energy performance metrics
- **Scope**: TEUI calculations, energy totals

#### **Phase 4: Final Integration**

**10. Section 01 (Key Values)** ← _Final Target_

- **Complexity**: HIGH - Partially integrated with index.html
- **Expected Result**: Oscillating calculation bug **disappears naturally**
- **Benefit**: Clean completion of Pattern A migration
- **Dependencies**: S04 (`ref_j_32`, `ref_k_32`) + S15 (`ref_h_136`) = **both resolved**
- **Scope**: Key performance indicators, summary displays

### **🎯 Why This Sequence is Optimal**

#### **1. Dependency Resolution**

- Each section's inputs are already Pattern A when we refactor it
- No more mixed architecture timing issues
- Clean, predictable state flow

#### **2. S01 Bug Resolution**

- By the time we reach S01, all upstream dependencies (S04/S14/S15) will be Pattern A
- The oscillating calculation bug will likely **self-resolve**
- No defensive patches needed

#### **3. Progressive Validation**

- Each refactor has clean upstream dependencies
- Easier to isolate and verify functionality
- Less complex debugging at each step

#### **4. Risk Mitigation**

- Most complex section (S01) tackled last when all dependencies are stable
- Can revert easily if issues arise
- Clear rollback points at each phase

### **🛠️ Implementation Guidelines for Each Section**

#### **Pre-Refactoring Checklist**

- [ ] Create backup file with `-BACKUP` suffix
- [ ] Document current dependencies and cross-section communications
- [ ] Verify all upstream dependencies are Pattern A compliant
- [ ] Test current functionality as baseline

#### **Pattern A Implementation Steps**

1. **Add Dual-State Structure**: TargetState + ReferenceState + ModeManager
2. **🚨 MANDATORY: Add d_13 Standard Change Integration**: `addListener("d_13")` + `onReferenceStandardChange()`
3. **Implement Header Controls**: Toggle switch + Reset button
4. **Add State Persistence**: localStorage with section-specific keys
5. **Update Helper Functions**: Route all data through ModeManager
6. **Test & Validate**: Reference mode, Target mode, cross-section flow, d_13 standard changes

#### **Post-Refactoring Validation**

- [ ] Reference mode shows 100%/✓ for all comparisons
- [ ] Target mode calculations are accurate
- [ ] Cross-section dependencies work correctly
- [ ] UI state synchronization functions properly
- [ ] Reset functionality works as expected
- [ ] **🚨 d_13 standard changes reload Reference defaults correctly**

### **🎉 Expected Outcomes**

#### **Immediate Benefits (After S09-S12)**

- ✅ S10 has clean internal gains dependency
- ✅ Envelope calculations use consistent Pattern A
- ✅ Foundation laid for energy chain refactoring

#### **Critical Benefits (After S04-S07)**

- ✅ **S01 oscillating bug 80% resolved** - `ref_j_32` and `ref_k_32` dependencies clean
- ✅ Complete energy calculation chain uses Pattern A
- ✅ All fuel sources, emissions, and renewable energy consistently managed
- ✅ Major calculation stability improvements

#### **Integration Benefits (After S13-S15)**

- ✅ All summary sections use consistent Pattern A
- ✅ Mechanical loads and performance metrics reliable
- ✅ **S01 oscillating bug 100% resolved** - `ref_h_136` dependency clean
- ✅ Predictable, reliable state management across entire application

#### **Final Benefits (After S01)**

- ✅ Complete Pattern A architecture across entire application
- ✅ S01 oscillating bug **permanently eliminated**
- ✅ Clean, maintainable codebase with consistent patterns
- ✅ Optimal performance and user experience
- ✅ **No more mixed architecture timing issues anywhere**

---

### **Benefits of Consistent Architecture**

When all sections use Pattern A:

- **🎯 State Isolation**: Complete independence between Target and Reference
- **🔄 Predictable Behavior**: All sections work the same way
- **🛠️ Easier Maintenance**: Consistent patterns across codebase
- **🚀 Performance**: Optimized state management and calculations
- **🎨 Better UX**: Consistent controls and visual feedback
- **📈 Scalability**: Easy to add new sections or features

---

## 🚨 **S12 REFACTOR BATTLEFIELD REPORT (July 2025)**

**⚠️ WARNING**: The Section 12 refactor has proven **exceptionally challenging** and is **NOW STABLE**. This section documents hard-learned lessons from **7+ refactor attempts** over **3 days** to help future implementers avoid the same pitfalls. The root cause was a combination of faulty initialization logic creating corrupt `localStorage` entries, compounded by minor deviations from the proven S10/S11 Pattern A implementation.

### **🎯 Current Status: ✅ STABLE AND FUNCTIONAL**

**✅ Progress Made:**

- ✅ **Dropdown Blanking Fixed**: Root cause was identified as corrupt `localStorage` state being loaded on initialization, which caused `refreshUI` to set dropdown values to `undefined`.
- ✅ **State Persistence Issues Fixed**: The "one-way" trip to Reference mode was a symptom of the corrupt `TargetState` being reloaded. Once the state initialization was fixed, bidirectional toggling and value persistence now work correctly.
- ✅ **Reset Button Functional**: The `resetState` function is now confirmed to be working as expected.
- ✅ **Event Listeners Corrected**: Event handlers were simplified to match the robust pattern in S10/S11, preventing duplicate listeners and ensuring reliable firing.
- ✅ **Default Value Logic Corrected**: The `TargetState.setDefaults()` function was updated to set `d_108` to `"MEASURED"` by default, preventing the `handleConditionalEditability` function from immediately overwriting `g_109` to `0` and creating the corrupt state.

### **🔍 Critical Lesson: The `localStorage` Trap**

The primary villain of the S12 bug was a subtle interaction between a logical flaw in the code and the persistence of `localStorage`.

1.  **The Flaw**: The initial `setDefaults` in `TargetState` set `d_108` to `"AL-1B"`. Immediately after, `handleConditionalEditability()` would run.
2.  **The Action**: Because `d_108` was not `"MEASURED"`, the function would correctly set the state for `g_109` to `"0"`.
3.  **The Trap**: This incomplete, corrupted state (`{"g_109":"0"}`) was then saved to `localStorage`.
4.  **The Loop**: On every subsequent page load, the `TargetState.initialize()` function would find the corrupt `S12_TARGET_STATE` in `localStorage` and load it, skipping the `setDefaults()` call entirely. This is why the bug was so persistent.

**The Fix**:

- **Manually deleting the `S12_TARGET_STATE` key** from the browser's developer tools was the essential first step to break the cycle.
- **Correcting the `setDefaults` logic** for `d_108` to `"MEASURED"` prevented the corrupt state from being created in the first place.
- **Aligning the module with the S10 pattern** (adding `listeners: {}`, simplifying event handlers) made the entire component more robust and less prone to such errors.

### **🎯 Comparison: Why S10/S11 Work vs S12 Struggled**

| **Aspect**         | **S10/S11 (Working)**    | **S12 (Problematic)**               | **Resolution**          |
| ------------------ | ------------------------ | ----------------------------------- | ----------------------- |
| **State Objects**  | Contains `listeners: {}` | Missing `listeners: {}`             | Added to match standard |
| **Initialization** | Cleanly loads defaults   | Loaded corrupt `localStorage`       | Corrected default logic |
| **Event Pattern**  | Pure inline handlers     | Mixed/conflicting patterns          | Simplified to match S10 |
| **UI Refresh**     | Reads valid state        | Read `undefined` from corrupt state | Now reads valid state   |

### **🔧 Debugging Sequence for Future Refactors**

1.  **ALWAYS SUSPECT `localStorage`**: If a component misbehaves on load, **first clear its state from `localStorage`** in the Application tab of dev tools and hard-refresh.
2.  **Verify Initialization**: Check the console for errors during `initializeEventHandlers` and `onSectionRendered`.
3.  **Log `setDefaults` vs `initialize`**: Add logs to see if a component is loading from storage or setting defaults.
4.  **Trace Conditional Logic**: Be wary of functions like `handleConditionalEditability` that run during initialization and can modify the state before the user has a chance to interact.

### **✅ CORRECTED: Dual-Engine Calculation Architecture**

**⚠️ CRITICAL CORRECTION**: The previous interpretation of "mode-aware calculations" was fundamentally wrong and caused months of state mixing issues. The correct dual-state architecture follows the working pattern established in S03, S08, S09, S10, S11.

### **🎯 The True Dual-State Architecture**

The application implements a **three-column performance display** in S01:

1. **Reference Column (Red)**: Building code minimum performance ← `ref_` prefixed values
2. **Target Column (Center)**: Optimized design performance ← unprefixed values
3. **Actual Column**: Real utility bill data ← S04 inputs

### **🔧 Correct Calculation Pattern (from working S11)**

```javascript
function calculateAll() {
  console.log("[Section] Running dual-engine calculations...");

  // ✅ ALWAYS run BOTH engines in parallel
  calculateReferenceModel(); // Reads ReferenceState → stores ref_ prefixed
  calculateTargetModel(); // Reads TargetState → stores unprefixed

  console.log("[Section] Dual-engine calculations complete");
}

function calculateReferenceModel() {
  // Use Reference state inputs to calculate Reference performance
  // Store results with ref_ prefix for downstream sections
  window.TEUI.StateManager.setValue("ref_i_104", value, "calculated");
}

function calculateTargetModel() {
  // Use Target state inputs to calculate Target performance
  // Store results unprefixed for downstream sections
  setCalculatedValue("i_104", value);
}
```

### **🚨 What Mode Switching Actually Controls**

**Mode switching is a UI display filter, NOT a calculation trigger:**

- **Target Mode**: User sees Target input values and Target calculated outputs from StateManager
- **Reference Mode**: User sees Reference input values and Reference calculated outputs from StateManager (ref\_ prefixed)

**Key Principle**: Values are **pre-calculated and waiting** in StateManager. UI toggles just choose which set to display.

- **Calculations**: ALWAYS run both engines automatically when data changes (dual-engine architecture)
- **UI Toggles**: Only switch between displaying Target vs Reference values
- **No Recalculation**: Mode switches never trigger `calculateAll()` - that would be an architectural error

### **📋 S12 & S13 Correction Workplan**

Both S12 and S13 were incorrectly implemented with "mode-aware calculations" that broke the dual-stream architecture. They need correction to follow the working S11 pattern.

#### **Phase 1: S12 Correction**

**Issues to Fix:**

- `calculateAll()` only runs one engine based on mode
- No `ref_` prefixed output storage for downstream sections
- Mode switching affects calculation streams instead of just UI

**Correction Steps:**

1. **Restore dual-engine `calculateAll()`**:

   ```javascript
   function calculateAll() {
     calculateReferenceModel(); // Always → ref_ prefixed
     calculateTargetModel(); // Always → unprefixed
   }
   ```

2. **Update calculation functions** to accept `isReferenceCalculation` parameter like S11
3. **Add Reference output storage** with `ref_` prefixes for S14/S15 consumption
4. **Test**: Verify Reference column updates in S01, Target column stable

#### **Phase 2: S13 Correction**

**Issues to Fix:**

- Same calculation engine problems as S12
- Complex cooling calculations need dual-stream outputs
- Missing `ref_` storage for mechanical load results

**Correction Steps:**

1. **Apply same dual-engine pattern** as S12 correction
2. **Ensure cooling calculations** run for both Target and Reference states
3. **Add Reference mechanical load outputs** with `ref_` prefixes
4. **Test**: Verify both heating and cooling systems populate correct columns

#### **Phase 3: Validation**

**Success Criteria:**

- ✅ Reference toggle updates **Reference column** (red values) in S01
- ✅ Target edits update **Target column** (center values) in S01
- ✅ No cross-contamination between streams
- ✅ Downstream sections (S14, S15, S04) receive both data streams

### **📊 Current Implementation Status (August 2, 2025)**

#### **✅ Completed Sections - 100% Operational**

- **S03, S08, S09, S10, S11**: Gold standard dual-state implementations
- **S12 (Volume & Surface Metrics)**: ✅ **COMPLETED** - Full dual-engine architecture working perfectly
  - Both Target and Reference calculations run in parallel
  - Complete state isolation achieved
  - Proper `ref_` prefixed output storage
  - Mode switching only affects UI display, not calculations
  - All calculated values update immediately when switching modes

#### **🚧 In Progress**

- **S13 (Mechanical Loads)**: ⚠️ **80% COMPLETE** - Critical state mixing issue identified
  - ✅ Fixed: Dual-engine `calculateAll()` structure implemented
  - ✅ Fixed: Reference calculations no longer contaminate Target state
  - ✅ Fixed: Upstream flow from S10/S11 now working (timing issue resolved)
  - ✅ Fixed: Cooling system toggle now affects calculations
  - ✅ Fixed: Cooling calculations properly switch to Reference mode (`mode=REF`)
  - 🚨 **CRITICAL ISSUE IDENTIFIED**: Heating calculations stuck in Target mode
    - **Problem**: Heating engine always runs `mode=TGT` regardless of UI mode
    - **Impact**: Reference fuel changes flow to Target column in S01 (state mixing)
    - **Evidence**: `grep "HEATING CALC.*mode=REF"` returns zero results
    - **Working**: Cooling calculations correctly switch to `mode=REF`
  - ⚠️ **Issue**: Reference TED (`ref_d_127`) may not be available from S14

#### **📋 Pending Sections**

- **S05, S06, S07**: Need dual-state Pattern A implementation (final 3 sections)

#### **🚨 Critical Issue Resolution**

- **S13 Heating Mode**: Fix mode detection to properly switch between Target/Reference
- **Reference Value Flow**: All upstream sections now provide correct `ref_` values to S01

#### **🔍 Root Cause Analysis**

The S13 zeros issue suggests **missing upstream Reference data flow**:

1. S13 correctly reads `ref_d_127` for Reference calculations
2. But `ref_d_127` may not exist or equals 0 from S14
3. S14/S15 refactoring should provide proper Reference TED values
4. This will cascade to fix S13 Reference calculations and S01 Reference TEUI

### **📚 Key Lessons Learned**

1. **Never break the dual-stream architecture** - both engines must always run
2. **Mode switching = UI filter only** - not a calculation trigger
3. **Follow working section patterns** (S11) rather than inventing new approaches
4. **Test with S01 three-column display** to verify correct data flow
5. **Debug timing/logging can resolve mysterious calculation flow issues**
6. **Upstream dependencies must be established before fixing downstream sections**
7. **SIMPLIFICATION**: Pattern 2 (separate functions + helpers) is cleaner than Pattern 1 (boolean parameters)

### **🔧 Pattern Simplification Recommendation**

Two valid dual-state patterns have emerged in the codebase:

**Pattern 1: Boolean Parameters (S11, S12)**

```javascript
function calculateValues(isReferenceCalculation = false) {
  if (isReferenceCalculation) {
    // Reference logic
  } else {
    // Target logic
  }
}
```

**Pattern 2: Separate Functions + Helpers (S14, S15, S01, S13)**

```javascript
function calculateReferenceModel() {
  const getRefValue = (fieldId) => {
    return window.TEUI.StateManager.getValue(`ref_${fieldId}`) || fallback;
  };
  // Use getRefValue throughout
}

function calculateTargetModel() {
  // Use getFieldValue throughout - naturally reads correct values
}
```

**Recommendation**: **Pattern 2 is preferred** for new implementations and future refactoring:

- Cleaner code without boolean parameters throughout
- Natural separation of concerns
- Easier to debug and maintain
- Follows S14/S15 proven approach

**Action**: Consider simplifying S11/S12 to Pattern 2 in future refactoring sessions.

This correction process has successfully restored the intended architecture in S12 and significantly advanced S13 implementation.

### **🔧 Planned Investigation & Audit (Evening Session)**

#### **Immediate S13 Investigation**

1. **Verify upstream Reference data**: Check if `ref_d_127` exists in StateManager from S14
2. **Debug Reference TED flow**: Track why Reference calculations result in zeros
3. **Validate Reference state object**: Ensure Reference defaults are being read correctly
4. **Test gas system calculations**: Verify AFUE, emissions, and exhaust calculations in Reference mode

#### **Comprehensive Section Audit Plan**

Once S13 is stabilized, conduct systematic audit of all Pattern A sections:

**Target Mode Validation:**

- S03, S08, S09, S10, S11, S12, S13: Verify Target calculations use Target state
- Confirm no Reference contamination in Target calculations
- Validate Target TEUI stability (93.6) across all section interactions

**Reference Mode Validation:**

- S03, S08, S09, S10, S11, S12, S13: Verify Reference calculations use Reference state
- Confirm Reference values display immediately upon mode switch
- Validate Reference defaults match expected building code baselines
- Ensure Reference calculations flow to S01 Reference column (red values)

**Cross-Section Data Flow:**

- Verify `ref_` prefixed values flow correctly between sections
- Confirm Target values flow correctly without `ref_` prefix
- Test edge cases and complex interactions (thermal bridges, cooling systems, etc.)

**Success Criteria:**

- S01 displays three distinct columns with appropriate values
- Reference TEUI appears in red column (not 0.0)
- No state mixing or cross-contamination between Target/Reference streams
- All sections follow identical dual-state patterns from the GUIDE

### **📋 Next Steps for S12 Completion & 'Robot Fingers'**

**Note**: This section addresses thermal bridge penalty communication between S11 and S12, which is a separate issue from the dual-state calculation architecture above. These options should be considered **after** completing the dual-engine correction.

With the core state corruption and UI bugs resolved, the final challenge is to implement a performant and architecturally sound connection between the Section 11 Thermal Bridge Penalty slider (`d_97`) and the U-value calculations in Section 12. The original "fence-jumping" direct call, while functional, is architecturally risky. The event-listener approach has proven unreliable due to complex timing issues.

Here are three potential paths forward:

#### **Option 1: The "Pragmatic Fence-Jump" (Refined Direct Call)**

This approach acknowledges that the direct call worked and focuses on making it safer and more explicit.

- **How:** Restore the direct call from S11 to a function in S12, but instead of calling `calculateCombinedUValue` directly, call a new, dedicated function like `TEUI.SectionModules.sect12.updateUValuesFromSlider(newValue)`.
- **Inside S12:** This new function would be very lightweight. It would _only_ calculate the two affected U-values (`g_101`, `g_102`) and update their DOM elements. It would **not** trigger a full `calculateAll()` in S12, preventing calculation storms.
- **The Final Update:** The `change` event on the slider (when the user lets go) would still fire a standard `StateManager` event to trigger the full, proper calculation chain for all dependent values.
- **Pros:** High likelihood of success, excellent performance. Explicitly naming the function makes the architectural exception clear.
- **Cons:** Still technically violates the principle of section sovereignty.

#### **Option 2: The "Direct State Injection" (A Better Listener)**

This is a more architecturally pure approach that aims to fix the flaws in our previous listener attempt.

- **How:** Use the `StateManager` listener in S12, but make the callback function much smarter and more direct.
- **Inside the S12 Listener:** When the `d_97` or `ref_d_97` event is received, the callback function will _immediately_ and _directly_ call a lightweight calculation for only the affected U-values, just as in Option 1. It will read the new slider value directly from the event payload.
- **Why It Might Work Now:** Our previous attempt tried to trigger a full `calculateAll`, which caused instability. By making the listener's action very small and targeted, we may get the same performance benefit as the direct call but keep the communication flowing through the proper channels.
- **Pros:** Architecturally pure; all communication is decoupled.
- **Cons:** Requires careful implementation to avoid the timing issues and instability we've already encountered.

#### **Option 3: Merge U-Value Calculations into Section 11 (User Preferred)**

This is the most robust solution, as it solves the communication problem by eliminating it entirely. Given the persistent difficulties in linking S11 and S12, this is the recommended path forward.

- **How:** Move the relevant rows (101, 102, and the total row 104) and their corresponding calculation logic (`calculateCombinedUValue`) from `4011-Section12.js` directly into `4011-Section11.js`.
- **Rationale:** Section 11 is fundamentally about the building envelope's transmission losses. The aggregate U-values are a direct summation and weighted average of the components defined in S11, making them a logical "total" for that section.
- **Impact:**
  - **Section 11:** Becomes the sole owner of all transmission-related data, from individual components to the final weighted average U-values. The `d_97` slider and its effects are now entirely local to the section, eliminating all cross-section communication issues for this feature.
  - **Section 12:** Becomes a leaner, more focused module dedicated purely to volume, surface area ratios, and airtightness metrics (`d_103` through `d_110`). Its complexity is significantly reduced.
  - **DOM/Import/Export:** The DOM structure and field IDs (`d_101`, `g_101`, etc.) remain unchanged, ensuring that import/export functionality and Excel parity are completely unaffected.
- **Pros:** Permanently eliminates the "robot fingers" problem. Architecturally clean and logical. Reduces the complexity of S12, making it easier to maintain.
- **Cons:** Requires a more significant, albeit straightforward, refactoring effort than the other options.

---

**⚠️ IMPORTANT**: This section is a **work in progress** and should be updated as S12 issues are resolved. Future implementers should consider the **cost/benefit** of continuing to debug S12 vs starting fresh with proven patterns.

---

## 🚧 **CURRENT IMPLEMENTATION STATUS & TEMPORARY MEASURES (July 2025)**

### **S12 Refactor Progress Update**

**Status**: Partially functional but ongoing challenges with state persistence and dropdown behavior.

**Recent Progress**:

- ✅ **Critical Function Scoping Fixed**: S09 `formatBuildingTypeForLookup` error resolved
- ✅ **Console Noise Eliminated**: S05 recursion bug fixed, S03 verbose logging cleaned
- ✅ **ComponentBridge Spam Reduced**: Sync logging commented out for cleaner debugging
- ✅ **Global Toggle Disabled**: Preventing retry warning spam during development

**S12 Specific Issues Resolved**:

- ✅ Dropdown event listeners now attach correctly
- ✅ Calculations fire when dropdowns change
- ✅ Basic Pattern A structure in place

**S12 Outstanding Issues**:

- ❌ Dropdown blanking after 1-2 edits persists
- ❌ Reset button non-functional
- ❌ State persistence only works one-way (Target→Reference)

### **Temporary Architecture Decisions**

#### **1. Global Toggle Temporarily Disabled**

```javascript
// ⏸️ DISABLED: Global toggle failing with 10 retries - causing console spam
// setTimeout(setupGlobalToggleUI, 1500);
// TODO: Re-enable when migrating to unified global toggle for all Pattern A sections
```

**Rationale**:

- Individual section toggles are functional and preferred for development
- Global toggle was looking for `window.TEUI.ModeManager` but S03 exposes `window.TEUI.sect03.ModeManager`
- Better to have clean console now, re-enable when architecture is ready

**Future Plan**:

- Complete Pattern A migration for all sections
- Implement unified global toggle that works with section-specific ModeManager exposure pattern
- Retire individual section toggles in favor of application-wide mode switching

#### **2. ComponentBridge Scheduled for Retirement**

**Current State**: ComponentBridge sync logging commented out but functionality preserved.

**Future Architecture Plan**:

- **Replace** ComponentBridge pattern with **direct state object reading**
- **Eliminate** `target_`/`ref_` prefixed sync mechanisms
- **Implement** clean Pattern A data flow: `StateManager` reads directly from section ModeManagers
- **Preserve** cross-section communication via section-specific APIs

**Migration Strategy**:

```javascript
// Current Pattern B (ComponentBridge dependent):
const value = window.TEUI.StateManager.getValue("target_d_103");

// Future Pattern A (direct state access):
const value = window.TEUI.sect12.ModeManager.getValue("d_103");
```

**Benefits**:

- Eliminates prefix-based state contamination
- Removes ComponentBridge as potential interference point
- Simplifies data flow with clear section sovereignty
- Reduces complexity and maintenance burden

### **Code Quality Improvements Completed**

#### **Console Noise Elimination (July 26, 2025)**

**Major Issues Resolved**:

- **S05 Recursion Catastrophe**: Eliminated hundreds of mode switches causing performance issues
- **S09 Function Scoping**: Fixed `ReferenceError` breaking Reference Model calculations
- **S03 Verbose Logging**: Commented out 11 debug logs firing on every state change
- **ComponentBridge Spam**: Reduced sync operation logging for cleaner debugging
- **Global Toggle Retries**: Stopped 10 consecutive warning messages on page load

**Impact**: Console dramatically quieter, actual debugging issues now visible.

#### **Next Phase: Code Formatting & Standards**

**Planned**: ESLint and Prettier cleanup for consistent code style and error detection.

---

**📋 TODO: Update this section as S12 completion and ComponentBridge retirement progress.**

---

## 🎯 **Implementation Status**

**COMPLETED SECTIONS (Pattern A Architecture Implemented):**

- ✅ **S03**: Climate & Location → COMPLETE (Full functionality verified)
- ✅ **S04**: Energy Use Summary → **COMPLETE** (Rebuilt from scratch as pure consumer section)
- ✅ **S11**: Building Envelope → COMPLETE (Full functionality verified)
- ✅ **S12**: Air Leakage & Volume → COMPLETE (Full functionality verified)
- ✅ **S13**: HVAC Systems → COMPLETE (Full functionality verified)
- ✅ **S14**: Heating & Cooling Demand → COMPLETE (Full functionality verified)
- ✅ **S15**: TEUI Summary → COMPLETE (Full functionality verified)

**COMPLETED SECTIONS (Minor refinements may be needed):**

- ✅ **S02**: Building Information → Pattern A implemented and functional
- ✅ **S08**: Capacity & Efficiency → Pattern A implemented and functional
- ✅ **S09**: Internal Gains → Pattern A implemented and functional
- ✅ **S10**: Solar Gains → Pattern A implemented and functional

**GLOBAL ARCHITECTURE (Pattern A Compatible):**

- ✅ **ReferenceToggle.js**: Modernized for Pattern A → COMPLETE
- ⚠️ **Global "Show Reference" Toggle**: UI styling works, **value switching partially failing**
- ✅ **Reference Standard (d_13) Changes**: Auto-updates ReferenceValues.js → COMPLETE
- ❌ **Zero State Contamination**: **Critical gaps discovered in S02, S01**

**PENDING SECTIONS:**

- 🔄 **S01**: Summary (Final consumer section - special structure, may not need refactoring)
- 🔄 **S05, S06, S07**: Additional sections

**ADVANCED FEATURES (Planned):**

- 🔄 **"Show Reference Differentiation"**: Highlight Target vs Reference input differences
- 🔄 **"Match Target Building Inputs"**: Copy Target inputs to Reference (except d_13 values)
- 🔄 **Component Bridge Retirement**: Remove Pattern B target\_ prefix translations

**PATTERN ANALYSIS:**

- **Pattern 1 (Boolean Parameters)**: S11, S12 - Working but could be simplified
- **Pattern 2 (Separate Functions)**: S13, S14, S15 - Cleaner architecture, **RECOMMENDED**

### **🔧 PATTERN 2 REFINEMENTS GUIDE**

**Pattern 2** represents the evolution from early Pattern A implementations to **cleaner architectural patterns**:

#### **Pattern 1 → Pattern 2 Evolution**

```javascript
// ❌ Pattern 1: Boolean parameter approach (early sections)
function calculateSomething(useReferenceState = false) {
  const stateToUse = useReferenceState ? ReferenceState : TargetState;
  // Complex conditional logic throughout function
}

// ✅ Pattern 2: Separate function approach (recommended)
function calculateTargetSomething() {
  // Clean, focused function for Target calculations
}

function calculateReferenceSomething() {
  // Clean, focused function for Reference calculations
}
```

#### **Sections Needing Pattern 2 Refinements**

1. **S11, S12**: Simplify boolean parameter complexity
2. **S13**: Fix heating calculation mode detection (state mixing issue)
3. **Future sections**: Apply Pattern 2 from the start

#### **Pattern 2 Benefits**

- ✅ **Cleaner code**: No complex boolean logic within functions
- ✅ **Easier debugging**: Separate functions for each mode
- ✅ **Better state isolation**: Prevents mode detection bugs like S13 heating issue
- ✅ **Maintainability**: Functions have single responsibility

**🔍 Pattern exceptions noted for sections without ReferenceValues.js dependencies**

---

## 🎮 **Reference Model Toggling & Global Controls**

### 🎯 **Core Reference Toggle Functionality**

**Primary Global Toggle: "Show Reference" / "Show Target"**

- **Purpose**: Switch ALL dual-state sections simultaneously between Target and Reference calculated values
- **Architecture**: Leverages Pattern A `ModeManager.switchMode()` across all sections
- **Button Location**: Global dropdown in header (`index.html`)
- **Functionality**:
  - ✅ **"Show Reference"**: Displays Reference calculated values (stored with `ref_` prefix) across all sections
  - ✅ **"Show Target"**: Displays Target calculated values (default application state) across all sections
  - ✅ **State Isolation**: No cross-contamination between Target and Reference calculations
  - ✅ **Real-time Updates**: Both Target and Reference calculations run in parallel always

**Reference Standard Selection (d_13)**

- **Purpose**: Selects which building code standard to use for Reference calculations
- **Location**: Section 02 (Building Information)
- **Functionality**: Changes ReferenceValues.js dataset loaded across all sections
- **Auto-Update**: Triggers `onReferenceStandardChange()` in sections with ReferenceValues.js dependencies

### 🔧 **Reference Model Setup Functions**

**New Architecture (v4.012): Three Reference Setup Scenarios**

The ReferenceToggle.js system provides three distinct scenarios for setting up Reference model comparisons, each serving different analysis purposes:

#### **1. Mirror Target**

- **Purpose**: Create 100% identical Target and Reference models for pure building code standard comparison
- **Behavior**:
  - Copies ALL Target state values (user inputs, defaults, even calculated values initially) to Reference state
  - Results in identical Target/Reference totals initially (perfect synchronization)
  - Subsequently allows user edits to Reference values for fine-tuning
- **Use Case**: "What if I built this exact building to different code standards?"
- **Expected Result**: Initially perfect Target/Reference match until user makes Reference modifications

#### **2. Mirror Target + Overlay (Reference) [Default]**

- **Purpose**: Apply Target building design with Reference Standard building code values
- **Behavior**:
  - Copies all Target user inputs (geometry, climate, energy costs) to Reference state
  - **Exception**: Reference Standard (d_13) drives ReferenceValues.js overrides
  - **Locks ReferenceValues-derived fields** to prevent user confusion
  - Target d_13 selection used only for L/M/O comparison displays, not Reference calculations
- **Use Case**: "How does my building design compare to code minimums?" (most common scenario)
- **Expected Result**: Same building envelope/geometry, different performance due to code requirements

#### **3. Independent Models**

- **Purpose**: Complete flexibility for custom Target vs Reference comparisons
- **Behavior**:
  - Unlocks all Reference values for user editing
  - No constraints or copying from Target state
  - Maintains complete state isolation
- **Use Case**: "Compare any two building scenarios" or "What-if analysis with custom Reference"
- **Expected Result**: Completely independent Target and Reference models

### 🎨 **User Experience Design**

#### **Reference Differentiation Highlighting (Always Active)**

- **Visual**: Automatic highlighting of fields that differ between Target and Reference states
- **Replaces**: Previous "Highlight Reference Values" as separate command
- **Benefit**: Users immediately see where models differ without manual activation

#### **Smart Field Locking**

- **Mode 1 (Mirror Target)**: All fields editable after initial copying
- **Mode 2 (Mirror Target \* Reference)**: ReferenceValues-derived fields locked, others editable
- **Mode 3 (Reference Independence)**: All fields editable
- **Visual Indication**: Locked fields clearly marked as "Code-Derived" with lock icon

#### **Reference Standard (d_13) Separation**

- **Target d_13**: Only affects L/M/O comparison displays in Target mode
- **Reference d_13**: Drives actual ReferenceValues.js dataset for Reference calculations
- **Benefit**: Eliminates confusion about which standard affects which calculations

### 🎮 **Updated Global Controls Architecture**

**Primary Display Toggle**:

- **"View Target State" / "View Reference State"**: Switches display between Target and Reference calculated values
- **Location**: Global header toggle
- **Function**: Pure display switching, no model setup

**Reference Setup Dropdown**:

- **"Mirror Target"**: Setup function for identical model comparison
- **"Mirror Target \* Reference"**: Setup function for standard building vs code comparison
- **"Reference Independence"**: Setup function for custom comparison scenarios
- **Location**: Reference setup dropdown (separate from display toggle)
- **Function**: Model configuration, not display switching

### 🏗️ **Implementation Pattern for Reference Setup Functions**

```javascript
// 1. Mirror Target Mode Implementation
TEUI.ReferenceToggle.mirrorTarget = function () {
  getAllDualStateSections().forEach((section) => {
    const targetState = section.ModeManager.TargetState.data;
    // Copy ALL Target values to Reference state
    Object.keys(targetState).forEach((fieldId) => {
      section.ModeManager.ReferenceState.setValue(
        fieldId,
        targetState[fieldId],
        "mirrored",
      );
    });
    section.ModeManager.refreshUI();
  });
  console.log(
    "🔗 Mirror Target: Reference state synchronized with Target state",
  );
};

// 2. Mirror Target * Reference Mode Implementation
TEUI.ReferenceToggle.mirrorTargetWithReference = function () {
  getAllDualStateSections().forEach((section) => {
    const targetState = section.ModeManager.TargetState.data;
    // Copy Target inputs except d_13-derived ReferenceValues
    Object.keys(targetState).forEach((fieldId) => {
      if (!section.isReferenceValueField?.(fieldId)) {
        section.ModeManager.ReferenceState.setValue(
          fieldId,
          targetState[fieldId],
          "mirrored",
        );
      }
    });
    // Lock ReferenceValues-derived fields
    section.lockReferenceValueFields?.();
    section.ModeManager.refreshUI();
  });
  console.log(
    "🔗 Mirror Target * Reference: Target inputs + locked Reference values",
  );
};

// 3. Reference Independence Mode Implementation
TEUI.ReferenceToggle.enableReferenceIndependence = function () {
  getAllDualStateSections().forEach((section) => {
    // Unlock all Reference fields for editing
    section.unlockAllReferenceFields?.();
    section.ModeManager.refreshUI();
  });
  console.log(
    "🔓 Reference Independence: All Reference fields unlocked for custom editing",
  );
};

// Display Toggle (unchanged)
TEUI.ReferenceToggle.switchAllSectionsMode = function (mode) {
  getAllDualStateSections().forEach((section) => {
    section.ModeManager.switchMode(mode);
    section.ModeManager.updateCalculatedDisplayValues();
  });
};
```

### 🎨 **Updated UI/UX Design Patterns**

**Global Reference Controls Location**: Header in `index.html`

**Primary Display Toggle**:

- **"View Target State"** / **"View Reference State"**: Pure display switching
- **Visual**: Blue (Target) / Red (Reference) UI styling
- **Function**: Shows Target or Reference calculated values across all sections

**Reference Setup Dropdown**:

- **"Mirror Target"**: Setup function for identical model comparison
- **"Mirror Target \* Reference"**: Setup function for building vs code comparison (default)
- **"Reference Independence"**: Setup function for custom comparison scenarios
- **Visual**: Setup dropdown separate from display toggle
- **Function**: Configures Reference model relationship to Target model

**Visual Indicators**:

- **Body Classes**: `viewing-target-state`, `viewing-reference-state` for global mode styling
- **Field Highlighting**: Automatic highlighting of fields that differ between Target/Reference
- **Field Locking**: Locked ReferenceValues fields show lock icon and "Code-Derived" tooltip
- **Button States**: Clear indication of current view mode and setup configuration

**Individual Section Controls**: Pattern A sections retain header toggles for debugging, but global controls are primary interface

---

## 🧪 **TESTING RESULTS & COMPLETION ROADMAP (July 24, 2025)**

### 🎯 **Global Reference Toggle Testing Results**

**✅ RED UI STYLING**: Global "Show Reference" button successfully triggers red Reference UI across all sections

**⚠️ CRITICAL ISSUES DISCOVERED**:

#### **1. Partial Section Mode Switching**

- **S10, S9, S8**: Still showing **Target values** when global Reference toggle is active
- **Expected**: Should show Reference calculated values when global toggle is "Show Reference"
- **Root Cause**: These sections may not be responding to `ModeManager.switchMode()` calls from `ReferenceToggle.js`

#### **2. S02 State Contamination**

- **Issue**: Reference year changes appear in **both Target and Reference states**
- **Symptom**: No state isolation - last edited value "bleeds through" to other mode
- **Impact**: Violates core dual-state architecture principle

#### **3. S01 State Mixing**

- **Issue**: When reporting year modified, **Target TEUI appears in Reference state S01 column**
- **Symptom**: S01 still showing cross-contamination despite all refactoring work
- **Impact**: Final consumer section not properly displaying Reference vs Target values

### 📋 **COMPLETION ROADMAP**

#### **Phase 1: Complete Remaining Sections (High Priority)**

**Sections Requiring Pattern A Implementation**:

- **S05 (CO2e Emissions)**: Apply Pattern 2 approach from start
- **S06 (Renewable Energy)**: Apply Pattern 2 approach from start
- **S07 (Water Use)**: Apply Pattern 2 approach with state mixing prevention

#### **Phase 2: Pattern 2 Refinements (Optional)**

**Code Quality Improvements**:

- **S13**: Fix heating calculation mode detection issue
- **S11, S12**: Simplify boolean parameter complexity
- **Documentation**: Update examples to show Pattern 2 best practices

#### **Phase 3: Final System Testing**

**Comprehensive Validation**:

- All 13 sections respond to global Reference/Target toggle
- State isolation confirmed across all sections
- Cross-section data flow validated
- Performance optimization and cleanup

### 🧪 **TESTING VALIDATION CHECKLIST**

**Global Toggle Test**:

- [ ] "Show Reference" → All sections show red UI ✅
- [x] "Show Reference" → All sections show Reference **values** ✅ (All sections operational)
- [ ] "Show Target" → All sections show normal UI ✅
- [ ] "Show Target" → All sections show Target **values** ✅

**State Isolation Test**:

- [ ] S02 Reference year change → Target year unchanged ❌
- [ ] S01 Reference mode → Shows Reference TEUI (138.3) ❌
- [ ] S01 Target mode → Shows Target TEUI (93.6) ✅

**Cross-Section Integration Test**:

- [ ] Reference calculations flow properly S10→S11→S12→S13→S14→S15→S01 ⚠️
- [ ] Target calculations flow properly (working baseline) ✅

### 🎯 **SUCCESS CRITERIA FOR COMPLETION**

1. **Global Toggle Works 100%**: All 13 sections respond to global Reference/Target toggle
2. **Zero State Contamination**: Changes in one mode never affect the other mode
3. **S01 Three-Column Accuracy**: Reference/Target/Actual columns show distinct, correct values
4. **Cross-Section Data Flow**: Reference calculations cascade properly through dependency chain

---

## 🔧 **COMPLETING PATTERN A SECTIONS WITH MISSING REFERENCE STORAGE**

### **📋 Problem: UI Works, Downstream Broken**

Some sections (notably **S03**) have **excellent Pattern A dual-state UI** but are missing the **Reference calculation engine** that stores `ref_` prefixed values for downstream consumption.

**Symptoms:**

- ✅ **Internal state switching**: Perfect (Target vs Reference locations work)
- ✅ **Header controls**: Working (local toggles function)
- ✅ **State isolation**: Complete (no contamination)
- ❌ **Downstream consumption**: Broken (other sections can't read Reference values)

### **🎯 S03 Specific Issue**

**S03 Currently Working:**

- **Target**: Ontario, Alexandria climate data
- **Reference**: BC, Vancouver climate data
- **UI Switching**: Perfect between both climate locations

**S03 Missing for S15:**

- `ref_h_23` (Reference heating setpoint - Vancouver)
- `ref_d_23` (Reference coldest day - Vancouver)
- `ref_d_24` (Reference hottest day - Vancouver)
- `ref_h_24` (Reference cooling setpoint - Vancouver)

**Result**: S15 cooling load calculations (rows 137-145) show identical Target/Reference values because they can't read Vancouver climate data.

### **🔧 Implementation Pattern**

**Add Reference Storage Engine to sections with perfect UI but missing downstream storage:**

#### **Step 1: Add Reference Calculation Engine**

```javascript
/**
 * REFERENCE MODEL ENGINE: Calculate all values using Reference state
 * Stores results with ref_ prefix for downstream sections (S15, S14, etc.)
 */
function calculateReferenceModel() {
  console.log("[Section03] Running Reference Model calculations...");

  try {
    // Force Reference mode temporarily to get Reference calculations
    const originalMode = ModeManager.currentMode;
    ModeManager.currentMode = "reference";

    // Run all calculations using Reference state values (Vancouver climate)
    calculateHeatingSetpoint();
    calculateCoolingSetpoint_h24();
    calculateTemperatures();
    calculateGroundFacing();
    updateCoolingDependents();

    // Restore original mode
    ModeManager.currentMode = originalMode;

    // Store Reference results for downstream consumption
    storeReferenceResults();
  } catch (error) {
    console.error("Error during Section 03 calculateReferenceModel:", error);
  }

  console.log("[Section03] Reference Model calculations complete");
}
```

#### **Step 2: Add Reference Storage Function**

```javascript
/**
 * Store Reference Model calculation results with ref_ prefix for downstream sections
 */
function storeReferenceResults() {
  if (!window.TEUI?.StateManager) return;

  // Get Reference state climate values and store with ref_ prefix
  const referenceResults = {
    h_23: ReferenceState.getValue("h_23"), // Vancouver heating setpoint
    d_23: ReferenceState.getValue("d_23"), // Vancouver coldest day
    d_24: ReferenceState.getValue("d_24"), // Vancouver hottest day
    h_24: ReferenceState.getValue("h_24"), // Vancouver cooling setpoint
    d_20: ReferenceState.getValue("d_20"), // Vancouver HDD
    d_21: ReferenceState.getValue("d_21"), // Vancouver CDD
    d_22: ReferenceState.getValue("d_22"), // Vancouver GF HDD
    h_22: ReferenceState.getValue("h_22"), // Vancouver GF CDD
    j_19: ReferenceState.getValue("j_19"), // Vancouver climate zone
  };

  // Store with ref_ prefix for downstream sections
  Object.entries(referenceResults).forEach(([fieldId, value]) => {
    if (value !== null && value !== undefined) {
      window.TEUI.StateManager.setValue(
        `ref_${fieldId}`,
        String(value),
        "calculated",
      );
    }
  });

  console.log(
    "[Section03] Reference results stored with ref_ prefix for downstream sections",
  );
}
```

#### **Step 3: Modify calculateAll() for Dual-Engine**

```javascript
function calculateAll() {
  // ALWAYS run BOTH engines in parallel for complete downstream data
  calculateTargetModel(); // Updates UI for current mode
  calculateReferenceModel(); // Stores ref_ values for downstream sections
}

function calculateTargetModel() {
  // Existing calculation logic (unchanged)
  calculateHeatingSetpoint();
  calculateCoolingSetpoint_h24();
  calculateTemperatures();
  calculateGroundFacing();
  updateCoolingDependents();
  updateCriticalOccupancyFlag();
}
```

### **🧪 Testing Success**

**After Implementation:**

- ✅ **S03 UI**: Still works perfectly (Target Ontario ↔ Reference BC)
- ✅ **S03 Storage**: Now provides `ref_h_23`, `ref_d_23`, etc. to StateManager
- ✅ **S15 Cooling Loads**: Will show different values using Vancouver vs Ontario climate data
- ✅ **Complete Pattern A**: UI switching + Downstream storage working

### **🎯 Apply This Pattern To:**

**Any section showing these symptoms:**

1. **Perfect local UI switching** ✅
2. **Perfect header controls** ✅
3. **Downstream sections showing identical Target/Reference values** ❌

**Likely candidates**: S03 (confirmed), potentially other early Pattern A refactors.

---

## 🚨 **CRITICAL SESSION FINDINGS: S02/S04 Dual-State Issues (Dec 2024)**

### **S02 Dual-State Corrections & Remaining Issues**

#### **✅ FIXED: Core Architecture Issues**

- **StateManager Bridge**: Added missing bridge in `ModeManager.setValue()` to sync Target→StateManager and Reference→ref_StateManager
- **Pattern B Contamination**: Removed direct StateManager calls in dropdown handlers, now use `ModeManager.setValue()`
- **Defaults Override Bug**: Removed `...this.data` spread in `setDefaults()` that allowed empty localStorage to override defaults

#### **🔴 REMAINING CRITICAL ISSUES**

**1. Reset Behavior Inconsistency**

- **Local Reset Button**: Works correctly, loads proper Target/Reference defaults and energy costs
- **Global Reset/Browser Refresh**: Clears Target mode energy costs, causes Reference d_13 (2010) to contaminate Target mode
- **Root Cause**: Global reset mechanism differs from local reset, likely bypassing `setDefaults()` entirely

**2. Initialization Order Problem**

- `setDefaults()` → `loadState()` order is correct
- Issue occurs during global reset or page reload, not local section reset
- Suggests StateManager or ComponentBridge interference during global initialization

### **S04 Critical Regression & Reversion**

#### **🚨 SEVERE REGRESSION DISCOVERED**

- **S04 Toggle Breaking S03**: Our S04 dual-state implementation caused S03's location dropdowns to malfunction
- **Cross-Section Contamination**: S04's `ModeManager` interfering with working S03 functionality
- **Immediate Action**: S04 reverted to backup, modified version suffixed 'ERROR' and taken offline

#### **S04 Architecture Problems Identified**

1. **No Reference State Display**: Toggle didn't show different Reference values
2. **Cross-Section Interference**: Our implementation broke other working sections
3. **Incorrect Scope**: S04 should read upstream values (d_19 from S03), not manage internal dual-state for them

#### **Lessons Learned**

- **Test Cross-Section Impact**: Always verify changes don't break working sections
- **Derived Sections Different**: S04's architecture should differ from input sections like S02/S03
- **StateManager Dependencies**: Sections that primarily read upstream values need different patterns

---

## 🔍 **QC/QA CHECKLIST FOR COMPLETED SECTIONS**

**⚠️ MANDATORY REVIEW**: Every completed dual-state section must pass this comprehensive checklist before being considered production-ready. This checklist prevents regression and ensures architectural compliance.

### **📋 1. ARCHITECTURAL COMPLIANCE**

#### **✅ Pattern A Implementation**

- [ ] **TargetState Object**: Properly defined with `setDefaults()`, `saveState()`, `loadState()`, `setValue()`, `getValue()`
- [ ] **ReferenceState Object**: Properly defined with same methods as TargetState
- [ ] **ModeManager Facade**: Contains `initialize()`, `switchMode()`, `refreshUI()`, `resetState()`, `getValue()`, `setValue()`
- [ ] **localStorage Keys**: Follow naming convention `"SXX_TARGET_STATE"`, `"SXX_REFERENCE_STATE"`
- [ ] **Global Exposure**: `window.TEUI.sectXX.ModeManager` accessible for cross-section integration

#### **✅ Pattern B Contamination Elimination**

- [ ] **No Global Prefixed State**: No `target_*`, `ref_*` in internal state management
- [ ] **No getAppNumericValue()**: All external dependencies use `getGlobalNumericValue()`
- [ ] **No ComponentBridge Interference**: Section doesn't interfere with other sections' DOM/state
- [ ] **Clean External Dependencies**: Only reads from StateManager using approved patterns

### **📋 2. DUAL-ENGINE ARCHITECTURE**

#### **✅ Calculation Pattern**

- [ ] **calculateAll() Dual-Engine**: Always runs both `calculateTargetModel()` and `calculateReferenceModel()`
- [ ] **Target Storage**: `calculateTargetModel()` stores unprefixed values in StateManager
- [ ] **Reference Storage**: `calculateReferenceModel()` stores `ref_` prefixed values in StateManager
- [ ] **Mode Independence**: Calculations run regardless of current UI mode
- [ ] **Parallel Execution**: Both engines run in same `calculateAll()` call

#### **✅ UI Toggle Pattern**

- [ ] **Display-Only switchMode()**: Only calls `refreshUI()` and `updateCalculatedDisplayValues()`
- [ ] **NO calculateAll() in switchMode()**: UI toggles never trigger calculations
- [ ] **Pre-calculated Values**: All values exist in StateManager before mode switch
- [ ] **Smooth Transitions**: Mode switches are instant (no calculation delays)

### **📋 3. FUNCTIONAL TESTING**

#### **✅ Core Functionality**

- [ ] **Distinct Values**: Reference mode shows different values from Target mode
- [ ] **User Input Persistence**: Input changes survive mode toggles
- [ ] **localStorage Persistence**: State survives browser refresh
- [ ] **External Dependencies**: Reacts to upstream section changes
- [ ] **Downstream Provision**: Provides calculated values to dependent sections

#### **✅ UI Testing**

- [ ] **Header Controls**: Target/Reference toggle and Reset button present and functional
- [ ] **Visual Feedback**: Toggle shows current mode (blue=Target, red=Reference)
- [ ] **Input Synchronization**: `refreshUI()` correctly loads state into input fields
- [ ] **Calculated Display Updates**: `updateCalculatedDisplayValues()` shows correct mode values
- [ ] **Reset Functionality**: Reset button clears localStorage and reloads defaults

### **📋 4. INTEGRATION TESTING**

#### **✅ StateManager Integration**

- [ ] **Value Storage**: Section stores values in StateManager for downstream consumption
- [ ] **Value Retrieval**: Section reads external dependencies from StateManager
- [ ] **Reference Value Provision**: Stores `ref_` prefixed values for Reference column in S01
- [ ] **Listener Registration**: Reacts to external changes via `StateManager.addListener()`

#### **✅ Cross-Section Communication**

- [ ] **Upstream Dependencies**: Correctly reads from required upstream sections
- [ ] **Downstream Provision**: Provides required values to dependent sections
- [ ] **S01 Dashboard Display**: Values appear correctly in Reference/Target/Actual columns
- [ ] **Global Toggle Integration**: Responds to global Reference toggle commands

### **📋 5. ERROR HANDLING & EDGE CASES**

#### **✅ Robustness**

- [ ] **Missing Dependencies**: Graceful handling when upstream values are undefined
- [ ] **Invalid Input Values**: Proper validation and error handling for user inputs
- [ ] **localStorage Corruption**: Falls back to defaults if saved state is invalid
- [ ] **StateManager Unavailable**: Section functions even if StateManager isn't loaded
- [ ] **Console Error Free**: No JavaScript errors in browser console

#### **✅ Performance**

- [ ] **Calculation Efficiency**: No redundant calculations on mode switches
- [ ] **Memory Management**: No memory leaks from event listeners
- [ ] **DOM Updates**: Minimal DOM manipulation, no layout thrashing
- [ ] **localStorage Size**: Reasonable storage usage (no bloated state objects)

### **📋 6. CODE QUALITY**

#### **✅ Maintainability**

- [ ] **Consistent Naming**: Follows established naming conventions
- [ ] **Clear Documentation**: Functions and complex logic documented
- [ ] **Helper Function Reuse**: Uses established patterns like `setCalculatedValue()`
- [ ] **Error Logging**: Appropriate console logging for debugging
- [ ] **Code Organization**: Clear separation of concerns (state, calculations, UI)

#### **✅ Standards Compliance**

- [ ] **Linter Clean**: No ESLint errors or warnings
- [ ] **DUAL-STATE Guide Compliance**: Follows all patterns from this guide
- [ ] **Excel Methodology**: Calculations match Excel reference implementation
- [ ] **Regulator Compliance**: Maintains approved calculation methodologies

---

## ⚠️ **KNOWN ISSUES TO ADDRESS POST-REFACTOR**

### **🐛 Reference State Initialization Issue**

**Status**: Identified - Fix Pending After S05-S07 Refactors  
**Affects**: S04, S13, S15, and potentially other sections  
**Discovered**: During S04 gas/oil calculation implementation

**Issue Description**:
The Reference state calculations work correctly when manually triggered (e.g., user changes fuel types), but **default Reference values are not properly initialized on initial page load**. This means:

- ✅ **Manual Triggers Work**: Changing fuel types correctly recalculates gas/oil flows
- ✅ **Cross-Section Flow Works**: S07/S13 → S04 integration functions properly
- ❌ **Initial Load Broken**: Default Reference state shows zero instead of calculated values
- ❌ **Mode Toggle Shows Same Values**: Target=Reference on fresh load

**Root Cause (Suspected)**:
The dual-engine architecture correctly calculates both models, but the **Reference state storage and initialization sequence** may have timing issues or missing triggers during initial section rendering.

**Examples Observed**:

- S13 defaults to Gas heating in Reference mode
- S13 calculates `ref_h_115 = 27,214.94 m³` correctly (visible in logs)
- S04 H28 shows `0.00 m³` instead of S13's gas volume on initial load
- After manually changing fuel types, calculations flow correctly

**Fix Strategy (Post S05-S07)**:

1. **Complete remaining section refactors** to ensure all upstream dependencies are Pattern A compliant
2. **Review initialization sequence** across all sections for Reference state triggers
3. **Test complete calculation flow** with all sections using dual-state architecture
4. **Implement initialization fixes** once the full dependency chain is stable

**Tracking**: Document resolution in next guide update after S05-S07 completion.

---

## 🔧 **STATE MIXING TROUBLESHOOTING WORKPLAN**

### **🎯 Critical Issue: Reference Mode Changes Flow to Target Column**

**Based on S13 diagnosis and S01 refactor findings**, this comprehensive workplan helps identify and fix state mixing issues where Reference mode changes incorrectly appear in Target columns.

#### **🔍 Diagnostic Sequence**

**Step 1: Verify Calculation Mode Detection**

```bash
# Check if heating calculations properly switch to Reference mode
grep -n "HEATING CALC.*mode=REF" documentation/Logs.md
grep -n "HEATING CALC.*mode=TGT" documentation/Logs.md | tail -5

# Check if cooling calculations switch properly (should show both modes)
grep -n "COOLING CALC.*mode=REF" documentation/Logs.md | tail -3
grep -n "COOLING CALC.*mode=TGT" documentation/Logs.md | tail -3
```

**Step 2: Verify Reference Value Storage**

```bash
# Check if section stores ref_ prefixed values when in Reference mode
grep -n "Storing ref_" documentation/Logs.md | tail -10

# Look for specific field storage (replace d_XXX with actual field)
grep -n "Storing ref_d_XXX" documentation/Logs.md
```

**Step 3: Verify S01 Column Flow**

```bash
# Check if S01 receives Reference values for Reference column
grep -n "\[S01\].*ref_.*from" documentation/Logs.md | tail -5

# Check if changes flow to correct columns
grep -n "\[S01\] REFERENCE RESULTS" documentation/Logs.md | tail -3
grep -n "\[S01\] TARGET RESULTS" documentation/Logs.md | tail -3
```

#### **🚨 Common State Mixing Patterns**

**❌ PATTERN 1: Calculation Engine Mode Stuck**

```
[SectionXX] 🔥 CALC: mode=TGT, systemType="Gas"  // Always Target mode
[SectionXX] 🔥 CALC: mode=TGT, systemType="Oil"  // Never switches to REF
```

**Root Cause**: Calculation engine not detecting UI mode changes
**Fix**: Update mode detection in calculation functions

**❌ PATTERN 2: Missing Reference Storage**

```
[SectionXX] Storing d_XXX = 12345    // Unprefixed (Target) storage
[SectionXX] Storing k_32 = 5678      // No ref_ equivalent stored
```

**Root Cause**: Reference calculations not storing `ref_` prefixed values
**Fix**: Add Reference storage in calculation engine

**❌ PATTERN 3: S01 Reading Wrong Values**

```
🔍 [S01] ref_k_32 from S04: 14740.8  // Default fallback (no Reference data)
🎯 [S01] Energy: k_32=15000          // Target value updated instead
```

**Root Cause**: Upstream section not providing Reference data
**Fix**: Fix upstream Reference storage (Pattern 2)

#### **✅ CORRECT STATE FLOW PATTERNS**

**✅ PATTERN 1: Proper Mode Switching**

```
[SectionXX] 🔥 HEATING CALC: mode=TGT, systemType="Electricity"
[SectionXX] 🔥 HEATING CALC: mode=REF, systemType="Gas"  // Switches to REF
```

**✅ PATTERN 2: Dual Value Storage**

```
[SectionXX] Storing k_32 = 5000      // Target value (unprefixed)
[SectionXX] Storing ref_k_32 = 8000  // Reference value (prefixed)
```

**✅ PATTERN 3: S01 Column Separation**

```
🔍 [S01] ref_k_32 from S04: 8000     // Reference data available
🔍 [S01] REFERENCE RESULTS: e_8=HIGHER  // Reference column updated
🎯 [S01] Energy: k_32=5000           // Target data separate
🎯 [S01] TARGET RESULTS: h_8=LOWER   // Target column updated
```

#### **🔧 Section-Specific Fix Patterns**

**For Dual-Engine Sections (S04, S13, S14, S15):**

1. **Mode-Aware Calculation Functions**: Accept `mode` parameter or detect current UI mode
2. **Dual Storage**: Store both unprefixed (Target) and `ref_` prefixed (Reference) values
3. **UI Toggle Validation**: Verify mode switches trigger appropriate calculations

**For Consumer Sections (S01):**

1. **Clean External Dependencies**: Use `getGlobalNumericValue()` for all reads
2. **Reference Column Logic**: Read `ref_` values for Column E display
3. **Target Column Logic**: Read unprefixed values for Column H display

#### **📋 State Mixing Prevention Checklist**

**During Refactoring:**

- [ ] **Mode Detection**: Calculation functions properly detect UI mode
- [ ] **Dual Storage**: Reference calculations store `ref_` prefixed values
- [ ] **UI Independence**: Mode switches don't affect which calculations run
- [ ] **Column Separation**: S01 Reference/Target columns show distinct values

**During Testing:**

- [ ] **Reference Test**: Change value in Reference mode → Reference column updates
- [ ] **Target Test**: Change value in Target mode → Target column updates
- [ ] **No Cross-Contamination**: Reference changes don't affect Target values
- [ ] **Log Verification**: Calculation logs show correct mode detection

---

## 📂 **SECTION-SPECIFIC WORKPLANS**

### **🎯 Section 01 (Dashboard) - Consumer Section Refactor**

**Reference**: `S01-PATTERN-A-REFACTOR-WORKPLAN.md`

Section 01 has a **dedicated workplan** due to its unique role as a consumer section that displays Reference/Target/Actual columns simultaneously. Unlike other sections, S01:

- ✅ **No Dual-State Objects**: Consumer sections don't need TargetState/ReferenceState
- ✅ **Clean External Dependencies**: Uses `getGlobalNumericValue()` for upstream data
- ✅ **State-Agnostic Display**: Shows all three columns (Reference, Target, Actual) at once
- ✅ **B Pattern Elimination**: Removes `getAppNumericValue()` complexity

**Priority**: Complete S01 refactor after all upstream sections (S04, S05-S07, S15) are Pattern A compliant.

### **🎯 Remaining Section Refactors**

**Next Priority Sections** (following corrected DUAL-STATE guide):

- **S05, S06, S07**: Standard dual-state refactors following the patterns established in S04
- **S11 Correction**: Remove `calculateAll()` from `switchMode()` (architectural error)
- **S12, S13 Review**: Verify compliance with dual-engine architecture

### **🎯 REMAINING SECTION REFACTOR WORKPLANS**

#### **Section 05 (CO2e Emissions) - Pattern A Refactor**

**Status**: 🚧 **PENDING** - Next priority section

- **Dependencies**: S02 ✅ (building info), embodied carbon calculations
- **Scope**: Carbon emissions, embodied carbon targets, lifecycle assessments
- **Pattern**: Apply **Pattern 2** (separate functions) from the start
- **Expected Duration**: 2-3 hours

#### **Section 06 (Renewable Energy) - Pattern A Refactor**

**Status**: 🚧 **PENDING** - Medium priority

- **Dependencies**: S02 ✅ (building info), renewable energy systems
- **Scope**: Solar PV, wind, green gas, renewable energy credits
- **Pattern**: Apply **Pattern 2** (separate functions) from the start
- **Expected Duration**: 2-3 hours

#### **Section 07 (Water Use) - Pattern A Refactor**

**Status**: 🚧 **PENDING** - Medium priority

- **Dependencies**: S02 ✅ (building info), S03 ✅ (climate)
- **Scope**: Water consumption, DHW heating systems, hot water loads
- **Pattern**: Apply **Pattern 2** (separate functions) from the start
- **Critical**: Apply state mixing prevention similar to S13 heating issue

### **🎯 Section 07 (Water Use) - Pre-Refactor Workplan**

**Section 07 will need state mixing fixes similar to S13.** Apply this workplan to prevent heating calculation mode issues:

#### **Critical Focus Areas:**

1. **DHW Heating Calculations**: Ensure mode detection works properly
   - Verify DHW heating calculations switch between `mode=TGT` and `mode=REF`
   - Check that Reference mode stores `ref_` prefixed values
2. **Fuel-Dependent Calculations**: Water heating fuel logic must respect UI mode
   - Test oil, gas, electricity, heatpump calculations in both modes
   - Verify Reference fuel changes flow to S01 Reference column
3. **Energy & Emissions Storage**: Dual storage for downstream consumption
   - Store unprefixed values for Target calculations
   - Store `ref_` prefixed values for Reference calculations

#### **State Mixing Prevention (S07-Specific):**

```bash
# During S07 refactor, verify these patterns work correctly:

# 1. Mode detection in water heating calculations
grep -n "WATER.*CALC.*mode=REF" documentation/Logs.md
grep -n "WATER.*CALC.*mode=TGT" documentation/Logs.md

# 2. Reference value storage for water heating
grep -n "Storing ref_.*water\|Storing ref_.*dhw" documentation/Logs.md

# 3. S01 receives S07 Reference values
grep -n "\[S01\].*ref_.*from S07" documentation/Logs.md
```

#### **Testing Sequence (S07):**

1. **Load app** → Default values displayed
2. **Switch to S07 Reference mode** → UI changes to red
3. **Change water heating fuel** (e.g., Gas → Oil) → Should trigger Reference calculations
4. **Verify S01 Reference column updates** → Reference values should change
5. **Switch back to Target mode** → Target values should be unchanged (no contamination)

**Expected Outcome**: Water heating fuel changes in Reference mode flow to S01's Reference column (E), not Target column (H).

---

## 🏁 **COMPLETION CRITERIA**

1. ✅ **Pattern A Compliant**: No Pattern B contamination detected
2. ✅ **Dual-Engine Functional**: Both Target and Reference calculations working
3. ✅ **Integration Tested**: Works correctly with upstream and downstream sections
4. ✅ **UI Toggle Reliable**: Mode switching shows distinct values consistently
5. ✅ **Error-Free Operation**: No console errors or functional issues
6. ✅ **Documentation Updated**: Any changes reflected in this guide

**Final Validation**: Section must contribute correctly to S01 dashboard display showing distinct Reference vs Target performance metrics.

---

---

## 🧐 **ARCHITECTURAL REVIEW & CLARIFICATIONS (August 2025)**

**Generated by AI Agent**

This section provides an overarching review of the `DUAL-STATE-IMPLEMENTATION-GUIDE.md` itself, reinforcing key principles and clarifying potentially confusing points to guide future development.

### **1. Guide Strengths & Core Mandates**

The guide is fundamentally sound and correctly identifies the "Gold Standard" patterns. Its greatest strengths are:

- **Unyielding Stance on Pattern A**: It is absolutely correct to mandate **Pattern A (Self-Contained State Objects)** as the sole approved architecture.
- **Invaluable Anti-Pattern Library**: The detailed descriptions of "Pattern B Contamination" and historical project issues (like the S12 refactor) are critical for preventing regressions.
- **Correct Core Principles**: The guide's two most important rules are correct and must be followed without exception:
  1.  Calculations for both Target and Reference models **must always run in parallel** whenever data changes.
  2.  The UI mode toggle (`switchMode()`) is for **display only** and **must never trigger calculations**.

### **2. Points of Clarification**

While the guide is excellent, its organic, log-book style has created minor inconsistencies that should be clarified.

#### **Clarification on `ComponentBridge`**

- **Observation**: The guide correctly marks `ComponentBridge` for future retirement (line 1524) but also includes it in a "correct" code pattern for the `ModeManager` (line 101).
- **Official Stance**: For all current refactoring, the `ComponentBridge` sync logic shown in the `ModeManager.setValue` function **is a required part of the pattern**. It provides essential backward compatibility with sections that have not yet been fully migrated. It should be implemented now and will be removed later in a separate, global refactor.

#### **Clarification on Architectural Patterns (`Pattern 1` vs. `Pattern 2`)**

- **Observation**: The guide identifies two "valid" dual-state patterns: `Pattern 1 (Boolean Parameters)` and the preferred `Pattern 2 (Separate Functions)`.
- **Official Stance**: To ensure future consistency, **Pattern 2 is now the mandated standard for all new refactoring work**. The use of separate `calculateTargetModel()` and `calculateReferenceModel()` functions provides better separation of concerns and has proven more robust. Sections still using Pattern 1 (S11, S12) are functional but should be considered candidates for a future cleanup refactor to align them with Pattern 2.

### **3. Review of `4011-Section02.js` vs. This Guide**

A review of `4011-Section02.js` revealed **critical architectural flaws** when compared to this guide:

- **Status**: Partially refactored, but **NOT COMPLETE**.
- **Primary Violation**: Its core helper functions (`getNumericValue`, `setFieldValue`) are textbook examples of **Pattern B contamination**. They manually construct `target_` and `ref_` prefixes to interact with the global `StateManager` instead of using the section's own internal `TargetState` and `ReferenceState` objects.
- **Secondary Violation**: Its `ModeManager.switchMode()` function incorrectly triggers `calculateAll()`, violating a core principle of this guide.
- **Conclusion**: Section 02 requires a significant overhaul to remove the Pattern B contamination and properly implement the internal state management, calculation, and UI patterns documented in this guide as the "Gold Standard".

---

### **🎯 NEXT SESSION PRIORITIES**

1. **S05-S07 Dual-State Refactors**: Apply corrected dual-engine architecture patterns
2. **S11 Architecture Correction**: Remove `calculateAll()` from `switchMode()` function
3. **QC/QA Review**: Run completed sections through comprehensive checklist
4. **S01 Consumer Refactor**: Execute dedicated workplan for dashboard section
5. **Cross-Section Integration Testing**: Verify all sections work together correctly

## 🚨 CRITICAL DISCOVERY: "Current State" Anti-Pattern Must Be Eliminated

**Date Added:** 2024-12-28  
**Context:** State mixing debug session revealed fundamental architectural flaw

### The Problem

During debugging of Target h_10 contamination during Reference mode operations, we discovered that **the concept of "current state" is architecturally broken** in a pure dual-state system.

### Root Cause

Functions like `getFieldValue(fieldId)` read from an ambiguous "current" state that changes based on UI mode, rather than from explicit state objects. This creates **implicit state contamination** where:

- **Target calculations** incorrectly read current UI values instead of Target defaults
- **Reference calculations** may read stale or incorrect state data
- **State isolation is impossible** when calculations depend on current UI context

### The Fix

**Replace all "current state" reads with explicit state object access:**

```javascript
// ❌ BROKEN: Ambiguous current state
const systemType = getFieldValue("d_113"); // Could be Target or Reference!

// ✅ CORRECT: Always know which state you're reading
const systemType = isReferenceCalculation
  ? ReferenceState.getValue("d_113") // Explicit Reference state
  : TargetState.getValue("d_113"); // Explicit Target state
```

### Implementation Priority

**This must be addressed together with Pattern 2 revisions** in the next major refactoring pass. Every section with `getFieldValue()` anti-patterns needs systematic cleanup to achieve true state isolation.

**Affected Sections:** All sections still using `getFieldValue()` for calculations (notably S13 has 50+ instances)

---
