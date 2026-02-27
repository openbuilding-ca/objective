# 🤖 **AI-FRIENDLY DUAL-STATE PATTERNS**

_Automated find/replace patterns to add Reference capability without changing existing Target calculations_

## 🎯 **Core Principle: Additive Only**

- **Keep**: All existing calculation logic
- **Keep**: All existing DOM updates for Target mode
- **Keep**: All existing field definitions and layouts
- **Add**: Minimal mode awareness layer

---

## 📝 **Pattern 1: Add ModeManager (Apply to ALL sections except S01)**

### **Find** (at top of section, after namespace creation):

```javascript
window.TEUI.SectionModules.sectXX = (function () {
```

### **Replace With**:

```javascript
window.TEUI.SectionModules.sectXX = (function () {
  //==========================================================================
  // MODE MANAGER (Dual-State Support)
  //==========================================================================
  const ModeManager = {
    currentMode: "target",
    switchMode: function(mode) {
      if (mode !== "target" && mode !== "reference") return;
      if (this.currentMode === mode) return;

      this.currentMode = mode;
      console.log(`SXX: Switched to ${mode.toUpperCase()} mode`);

      // ✅ CRITICAL: Set Reference defaults when switching to Reference mode
      if (mode === "reference") {
        this.setReferenceDefaults();
      }

      // Refresh UI to show current mode's values
      this.refreshUI();
    }
  };
  window.TEUI.sectXX.ModeManager = ModeManager;
```

---

## 📝 **Pattern 2: Wrap User Input Event Handlers**

### **Find** (dropdown change handlers):

```javascript
dropdown.addEventListener("change", function () {
  const fieldId = this.getAttribute("data-field-id");
  window.TEUI.StateManager.setValue(fieldId, this.value, "user-modified");
});
```

### **Replace With**:

```javascript
dropdown.addEventListener("change", function () {
  const fieldId = this.getAttribute("data-field-id");

  // Write to current mode's state
  const prefix = ModeManager.currentMode === "target" ? "target_" : "ref_";
  window.TEUI.StateManager.setValue(
    `${prefix}${fieldId}`,
    this.value,
    "user-modified",
  );

  // Keep Target mode working exactly as before
  if (ModeManager.currentMode === "target") {
    window.TEUI.StateManager.setValue(fieldId, this.value, "user-modified");
  }
});
```

### **🚨 CRITICAL LESSON: DOM Updates Must Work in Both Modes**

### **Find** (calculated value setters that only update DOM in Target mode):

```javascript
if (ModeManager.currentMode === "target") {
  window.TEUI.StateManager.setValue(fieldId, value, "calculated");

  const element = document.querySelector(`[data-field-id="${fieldId}"]`);
  if (element) {
    element.textContent = formattedValue;
  }
}
```

### **Replace With**:

```javascript
// Update global state only in Target mode (prevents contamination)
if (ModeManager.currentMode === "target") {
  window.TEUI.StateManager.setValue(fieldId, value, "calculated");
}

// ✅ CRITICAL: Update DOM in BOTH modes (enables Reference mode visibility)
const element = document.querySelector(`[data-field-id="${fieldId}"]`);
if (element) {
  const formattedValue = window.TEUI.formatNumber(value, "integer-nocomma"); // Use proper StateManager formats
  element.textContent = formattedValue;
}
```

### **Find** (editable field blur handlers):

```javascript
field.addEventListener("blur", function () {
  const fieldId = this.getAttribute("data-field-id");
  const value = this.textContent.trim();
  window.TEUI.StateManager.setValue(fieldId, value, "user-modified");
});
```

### **Replace With**:

```javascript
field.addEventListener("blur", function () {
  const fieldId = this.getAttribute("data-field-id");
  const value = this.textContent.trim();

  // Write to current mode's state
  const prefix = ModeManager.currentMode === "target" ? "target_" : "ref_";
  window.TEUI.StateManager.setValue(
    `${prefix}${fieldId}`,
    value,
    "user-modified",
  );

  // Keep Target mode working exactly as before
  if (ModeManager.currentMode === "target") {
    window.TEUI.StateManager.setValue(fieldId, value, "user-modified");
  }
});
```

---

## 📝 **Pattern 3A: State Listeners Need Prefixed Versions**

### **🚨 CRITICAL LESSON: Global State Listeners Don't Trigger for Dual-State**

### **Find** (StateManager listeners that only listen to global state):

```javascript
window.TEUI.StateManager.addListener("d_20", function (newValue) {
  const climateZone = determineClimateZone(newValue);
  setFieldValue("j_19", climateZone, "derived");
});
```

### **Replace With**:

```javascript
// Listen for both target and reference state changes
window.TEUI.StateManager.addListener("target_d_20", function (newValue) {
  if (ModeManager.currentMode === "target") {
    const climateZone = determineClimateZone(newValue);
    setFieldValue("j_19", climateZone, "derived");
  }
});

window.TEUI.StateManager.addListener("ref_d_20", function (newValue) {
  if (ModeManager.currentMode === "reference") {
    const climateZone = determineClimateZone(newValue);
    setFieldValue("j_19", climateZone, "derived");
  }
});
```

### **🚨 CRITICAL LESSON: Lookup Functions Must Handle All Dropdown Values**

### **Find** (lookup functions that don't handle all possible dropdown values):

```javascript
function calculateGainFactor(orientation, climateZone = 6) {
  const orientations = ["North", "East", "South", "West"]; // Missing "Average"!
  const values = [1.31, 76.94, 70.74, 25.86, 50.0]; // Fallback at end

  let orientationIndex = orientations.indexOf(orientation);
  const valueIndex = orientationIndex === -1 ? 4 : orientationIndex; // Falls back to 50.0
  return values[valueIndex];
}
```

### **Problem**: If dropdown includes "Average" but lookup function doesn't, ALL "Average" selections get fallback value (50.0).

### **Replace With**:

```javascript
function calculateGainFactor(orientation, climateZone = 6) {
  const orientations = ["North", "East", "South", "West", "Average"]; // ✅ Include ALL dropdown values
  const values = [1.31, 76.94, 70.74, 25.86, 42.0, 50.0]; // Appropriate value for "Average" + fallback

  let orientationIndex = orientations.indexOf(orientation);
  const valueIndex = orientationIndex === -1 ? 5 : orientationIndex; // Updated fallback index
  return values[valueIndex];
}
```

## 📝 **Pattern 3B: Add Mode-Aware Reading Helper**

### **Find** (helper functions section, or add before existing helpers):

```javascript
function getNumericValue(fieldId, defaultValue = 0) {
  const value = window.TEUI.StateManager.getValue(fieldId);
  return window.TEUI.parseNumeric(value, defaultValue);
}
```

### **Replace With**:

```javascript
function getNumericValue(fieldId, defaultValue = 0) {
  // Mode-aware reading: try prefixed state first, fallback to global for Target compatibility
  const prefix = ModeManager.currentMode === "target" ? "target_" : "ref_";
  let value = window.TEUI.StateManager.getValue(`${prefix}${fieldId}`);

  // Fallback to global state (maintains Target model compatibility)
  if (value === null || value === undefined) {
    value = window.TEUI.StateManager.getValue(fieldId);
  }

  return window.TEUI.parseNumeric(value, defaultValue);
}
```

### **If section doesn't have getNumericValue, add it before existing functions:**

```javascript
//==========================================================================
// MODE-AWARE HELPERS (Dual-State Support)
//==========================================================================
function getNumericValue(fieldId, defaultValue = 0) {
  // Mode-aware reading: try prefixed state first, fallback to global for Target compatibility
  const prefix = ModeManager.currentMode === "target" ? "target_" : "ref_";
  let value = window.TEUI.StateManager.getValue(`${prefix}${fieldId}`);

  // Fallback to global state (maintains Target model compatibility)
  if (value === null || value === undefined) {
    value = window.TEUI.StateManager.getValue(fieldId);
  }

  return window.TEUI.parseNumeric(value, defaultValue);
}

function getFieldValue(fieldId, defaultValue = "") {
  // Mode-aware reading for non-numeric values
  const prefix = ModeManager.currentMode === "target" ? "target_" : "ref_";
  let value = window.TEUI.StateManager.getValue(`${prefix}${fieldId}`);

  // Fallback to global state (maintains Target model compatibility)
  if (value === null || value === undefined) {
    value = window.TEUI.StateManager.getValue(fieldId);
  }

  return value === null || value === undefined ? defaultValue : value;
}
```

---

## 📝 **Pattern 4: Add Dual Calculation Engines**

### **Find** (main calculateAll function):

```javascript
function calculateAll() {
  // ... existing calculation logic ...
}
```

### **Replace With**:

```javascript
function calculateAll() {
  // Run Target calculations (existing logic - unchanged)
  calculateTargetModel();

  // Run Reference calculations (new)
  calculateReferenceModel();
}

function calculateTargetModel() {
  const originalMode = ModeManager.currentMode;
  ModeManager.currentMode = "target";

  // ... existing calculation logic moves here ...

  ModeManager.currentMode = originalMode;
}

function calculateReferenceModel() {
  const originalMode = ModeManager.currentMode;
  ModeManager.currentMode = "reference";

  // Copy of calculation logic for Reference mode
  // ... same logic as calculateTargetModel but in Reference mode ...

  ModeManager.currentMode = originalMode;
}
```

---

## 📝 **Pattern 5: Expose ModeManager (Add to return statement)**

### **Find** (return statement at end of section):

```javascript
return {
  getFields: getFields,
  getDropdownOptions: getDropdownOptions,
  getLayout: getLayout,
  // ... other exports ...
};
```

### **Replace With**:

```javascript
return {
  getFields: getFields,
  getDropdownOptions: getDropdownOptions,
  getLayout: getLayout,
  // ... other exports ...
  ModeManager: ModeManager,
};
```

---

## 📝 **Pattern 6: ⭐ CRITICAL - Reference Defaults & UI Refresh**

_This pattern is what makes Section 03 work perfectly - different baseline values for each mode_

### **Add to ModeManager object (before the closing }):**

```javascript
    setReferenceDefaults: function() {
      // ✅ CRITICAL: Define DIFFERENT Reference baseline values for this section
      // These should be realistic NBC/OBC code minimums or industry standards
      const referenceDefaults = {
        // Example for Section 10 (adjust field IDs and values per section):
        ref_d_73: "5.0",        // Door area (code minimum instead of user design)
        ref_e_73: "North",      // Door orientation (worst case instead of user choice)
        ref_f_73: "0.30",       // Door SHGC (code minimum instead of user design)
        ref_g_73: "0",          // Winter shading (none instead of user design)
        ref_h_73: "50",         // Summer shading (code assumption instead of user design)

        ref_d_74: "40.0",       // Window area (code minimum WWR instead of user design)
        ref_e_74: "North",      // Window orientation (worst case instead of user choice)
        ref_f_74: "0.40",       // Window SHGC (code maximum instead of user design)
        ref_g_74: "0",          // Winter shading (none instead of user design)
        ref_h_74: "80",         // Summer shading (code assumption instead of user design)

        // ... add all section fields with code minimums/standards as Reference values
        ref_d_80: "NRC 40%",    // Gains method (code standard instead of user choice)
      };

      // ✅ CRITICAL: Only set defaults if they don't already exist (preserve user edits)
      Object.entries(referenceDefaults).forEach(([fieldId, defaultValue]) => {
        if (!window.TEUI.StateManager.getValue(fieldId)) {
          window.TEUI.StateManager.setValue(fieldId, defaultValue, "default");
        }
      });

      console.log("SXX: Reference defaults set (preserving any user values)");
    },

    refreshUI: function() {
      // ✅ CRITICAL: Update DOM elements to show current mode's values
      const prefix = this.currentMode === "target" ? "target_" : "ref_";
      const sectionElement = document.getElementById("sectionElementId"); // Change per section
      if (!sectionElement) return;

      // Update all editable fields from StateManager
      const editableFields = sectionElement.querySelectorAll("[data-field-id]");
      editableFields.forEach((field) => {
        const fieldId = field.getAttribute("data-field-id");
        const stateValue = window.TEUI.StateManager.getValue(`${prefix}${fieldId}`);

        if (stateValue !== undefined && stateValue !== null) {
          if (field.hasAttribute("contenteditable")) {
            field.textContent = stateValue;
          } else if (field.tagName === "SELECT") {
            field.value = stateValue;
          } else if (field.tagName === "INPUT" && field.type === "range") {
            field.value = stateValue;
            // Update slider display
            const displayElement = document.querySelector(`[data-display-for="${fieldId}"]`);
            if (displayElement) {
              displayElement.textContent = `${stateValue}%`;
            }
          }
        }
      });

      console.log(`SXX: UI refreshed for ${this.currentMode} mode`);
    },
```

### **Pattern 6B: Call setReferenceDefaults() on section initialization**

### **Find** (onSectionRendered function or similar initialization):

```javascript
function onSectionRendered() {
  // ... existing initialization ...
}
```

### **Replace With**:

```javascript
function onSectionRendered() {
  // ... existing initialization ...

  // ✅ CRITICAL: Initialize Reference defaults on first load
  ModeManager.setReferenceDefaults();
}
```

---

## 🚨 **Why Pattern 6 is CRITICAL**

**Without Reference defaults:**

- Reference mode reads `undefined` from `ref_*` fields
- DOM elements don't update (still show Target values)
- User sees "shared state" illusion
- **BROKEN ISOLATION**

**With Reference defaults:**

- Reference mode reads actual values from `ref_*` fields
- DOM elements update to show different values
- User sees true isolation (e.g., 50% SHGC → 30% SHGC)
- **PERFECT ISOLATION**

This is what makes Section 03 work: Alexandria vs Attawapiskat, 50% vs 0%, Present vs Future.

---

## 📝 **Pattern 7: ⭐ CRITICAL - Initialize Prefixed State from Field Definitions**

_This pattern fixes the dual-state initialization problem - ensures calculations work on first load_

### **🚨 CRITICAL ISSUE: Prefixed State Empty on Initialization**

**Problem**: Dual-state sections store values in `target_fieldId` and `ref_fieldId`, but field definitions only provide default values for global `fieldId`. On initial load, prefixed state is empty, so calculations read undefined values and return fallbacks.

**Symptom**: Manual changes work (populate prefixed state), but initial load shows wrong values (50.0 gain factors, wrong percentages).

### **Add to ModeManager object (before setReferenceDefaults):**

```javascript
initializePrefixedState: function() {
  // ✅ CRITICAL: Initialize prefixed state from field definitions
  // This ensures both target_ and ref_ state are populated before calculations
  const fields = getFields();

  Object.keys(fields).forEach(rowId => {
    const row = fields[rowId];
    if (row.cells) {
      Object.keys(row.cells).forEach(cellKey => {
        const cell = row.cells[cellKey];
        if (cell.fieldId && cell.value !== undefined) {
          // Populate both target and reference state with default values
          window.TEUI.StateManager.setValue(`target_${cell.fieldId}`, cell.value, "default");
          window.TEUI.StateManager.setValue(`ref_${cell.fieldId}`, cell.value, "default");
        }
      });
    }
  });

  console.log("SXX: Prefixed state initialized from field definitions");
},
```

### **Update onSectionRendered sequence:**

```javascript
function onSectionRendered() {
  initializeEventHandlers();
  setupDropdownDefaults();
  registerWithStateManager();
  registerWithIntegrator();
  addStateManagerListeners();

  // ✅ CRITICAL: Initialize prefixed state FIRST
  ModeManager.initializePrefixedState();

  // ✅ THEN: Set Reference-specific defaults (overrides ref_ values)
  ModeManager.setReferenceDefaults();

  // ✅ FINALLY: Calculate with populated prefixed state
  calculateAll();
}
```

### **Why This Works:**

1. **Field definitions** → Populate `target_d_73="7.50"`, `ref_d_73="7.50"`
2. **Reference defaults** → Override `ref_d_73="7.50"` (preserves target)
3. **Calculations** → Read from populated prefixed state, not undefined values
4. **Manual changes** → Update prefixed state directly

### **⭐ This pattern is REQUIRED for every dual-state section!**

---

## 📝 **Pattern 8: 🚧 FUTURE - ComponentBridge State Translation**

_Clean up dual-write complexity with centralized state synchronization_

### **🎯 Goal: Simplify Patterns with ComponentBridge**

**Current Issue**: Patterns 2, 3B, and 7 create dual-maintenance burden - every section writes to both prefixed AND global state.

**Better Architecture**: ComponentBridge automatically syncs `target_*` → global state for backward compatibility.

### **🚧 CAREFUL IMPLEMENTATION REQUIRED**

**⚠️ WARNING**: Function wrapping can break section rendering! Use event listeners instead:

```javascript
// ❌ BAD: Function wrapping (breaks initialization)
const originalSetValue = window.TEUI.StateManager.setValue;
window.TEUI.StateManager.setValue = function(fieldId, value, source) { ... };

// ✅ GOOD: Event listener approach (safe)
window.TEUI.StateManager.addListener("*", function(fieldId, value) {
  if (fieldId.startsWith('target_')) {
    const globalFieldId = fieldId.replace('target_', '');
    window.TEUI.StateManager.setValue(globalFieldId, value, 'bridge-sync');
  }
});
```

### **🎯 Benefits Once Implemented:**

1. **Simplified Patterns**: Sections only write to prefixed state
2. **Zero Backward Compatibility Code**: ComponentBridge handles translation
3. **Clean Migration Path**: Remove bridge when all sections refactored
4. **Single Responsibility**: Each component has one job

### **📋 Implementation Plan:**

1. **Test with listeners** instead of function wrapping
2. **Verify no rendering crashes**
3. **Simplify existing patterns** once stable
4. **Apply to other sections** with cleaner approach

---

## 🚀 **Execution Strategy**

### **Phase 1: One Section, One Pattern**

1. Pick **Section 10** (simplest after S03)
2. Apply **Pattern 1** only (add ModeManager)
3. Test - section should still work exactly as before
4. Commit

### **Phase 2: Add Input Wrapping**

1. Apply **Pattern 2** to Section 10 event handlers
2. Test - Target mode should work exactly as before
3. Test - Reference mode inputs should write to ref\_ state
4. Commit

### **Phase 3: Add Mode-Aware Reading**

1. Apply **Pattern 3** to Section 10 helpers
2. Apply **Pattern 4** to Section 10 calculations
3. Apply **Pattern 5** to exports
4. Test dual calculations
5. Commit

### **Phase 4: ⭐ CRITICAL - Add Reference Defaults**

1. Apply **Pattern 6** to Section 10 ModeManager
2. Define realistic Reference baseline values for all fields
3. Test mode switching shows different values
4. **THIS IS WHERE ISOLATION IS PROVEN**
5. Commit

### **Phase 5: Scale Pattern**

Repeat Phases 1-4 for each remaining section.

## 🎯 **Benefits of This Approach**

1. **Preserves working code**: Target model unchanged
2. **Incremental**: Test after each small change
3. **Mechanical**: AI agents can apply patterns exactly
4. **Reversible**: Easy to undo if something breaks
5. **Additive**: No deletion of existing functionality
6. **⭐ PROVEN ISOLATION**: Pattern 6 ensures true dual-state behavior

## 🔧 **AI Agent Instructions**

When applying these patterns:

1. **Find exact text matches** - don't interpret or modify
2. **Apply one pattern at a time** - test between each
3. **Preserve all existing logic** - only add, never remove
4. **Keep Target mode working** - it's the baseline
5. **⭐ DEFINE REALISTIC REFERENCE VALUES** - Pattern 6 needs thoughtful defaults

This approach transforms dual-state from a "refactoring project" into a "feature addition project."
