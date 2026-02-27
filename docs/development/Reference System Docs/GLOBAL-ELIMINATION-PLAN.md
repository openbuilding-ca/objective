# 🚨 **GLOBAL ELIMINATION PLAN - COMPLETE DUAL-MODEL SEPARATION**

**Date Created**: January 14, 2025  
**Objective**: Eliminate ALL global values and achieve complete state isolation for Target/Reference dual-model architecture  
**Status**: 🔄 **PLANNING PHASE**

---

## 🎯 **THE VISION CLARIFIED**

### **Two Completely Independent Models**

- **Target Model**: User's custom design (any location, any systems, any occupancy)
- **Reference Model**: Initially independent, eventually constrained by ReferenceValues.js
- **Zero Contamination**: No shared values, no global state, complete isolation

### **Current State vs Required State**

| Component           | Current (Partial)          | Required (Complete)         |
| ------------------- | -------------------------- | --------------------------- |
| Helper Functions    | Mix of prefixed/global     | 100% mode-aware prefixed    |
| Cross-Section Deps  | Some global fallbacks      | 100% prefixed communication |
| StateManager Access | Hybrid patterns            | Strict prefix-only access   |
| DOM Updates         | Global writes in all modes | Target-only global writes   |
| User Input Handlers | Some contamination         | 100% state isolation        |

---

## 🔍 **CONTAMINATION AUDIT RESULTS**

### **✅ Sections with Correct Pattern (S02, S03, S05, S06, S08)**

- Mode-aware helper functions
- Prefixed StateManager access
- Target-only global updates
- Clean user input handlers

### **❌ Sections with Global Contamination (S09, S04, S01, S07)**

- Direct unprefixed StateManager calls
- Global fallbacks in getFieldValue()
- Cross-contamination in calculations

### **🔄 Mixed State Sections (S10-S14)**

- Unknown status - need systematic audit
- Likely contain legacy global patterns

---

## 📋 **SYSTEMATIC ELIMINATION STRATEGY**

### **Phase 1: Helper Function Standardization (Priority 1)**

**Objective**: Every section must have identical, prefix-only helper functions

#### **A. Standard Helper Template**

```javascript
// ✅ CORRECT: Mode-aware reading with NO global fallback
function getNumericValue(fieldId) {
  const prefix = ModeManager.currentMode === "target" ? "target_" : "ref_";
  const value = window.TEUI.StateManager.getValue(`${prefix}${fieldId}`);
  return window.TEUI.parseNumeric(value) || 0;
}

// ✅ CORRECT: Mode-aware writing with Target-only global updates
function setFieldValue(fieldId, value, fieldType = "calculated") {
  const prefix = ModeManager.currentMode === "target" ? "target_" : "ref_";
  window.TEUI.StateManager.setValue(`${prefix}${fieldId}`, value, fieldType);

  // ONLY update globals in Target mode (for DOM)
  if (prefix === "target_") {
    window.TEUI.StateManager.setValue(fieldId, value, fieldType);
    updateDOMElement(fieldId, value);
  }
}

// ❌ WRONG: Any function that reads unprefixed values
function getFieldValue(fieldId) {
  return window.TEUI.StateManager.getValue(fieldId); // CONTAMINATION!
}
```

#### **B. Sections Needing Helper Function Fixes**

1. **S09 (Priority 1)**: Complete helper function replacement
2. **S01 (Priority 2)**: Remove getRefNumericValue() global fallbacks
3. **S04 (Priority 3)**: Fix getRefNumericValue() contamination
4. **S07 (Priority 4)**: Unknown status - audit needed
5. **S10-S14 (Priority 5)**: Systematic audit and fix

### **Phase 2: Cross-Section Communication (Priority 2)**

**Objective**: All sections read from other sections using prefixed values only

#### **A. Current Contamination Sources**

```javascript
// ❌ WRONG: S09 reading unprefixed climate data
const coolingDays = getNumericValue("m_19"); // Should be target_m_19 or ref_m_19

// ❌ WRONG: S15 reading unprefixed section outputs
const internalGains = getNumericValue("h_71"); // Should be target_h_71 or ref_h_71
```

#### **B. Required Pattern**

```javascript
// ✅ CORRECT: Mode-aware cross-section reading
function readFromS03Climate(fieldId) {
  const prefix = ModeManager.currentMode === "target" ? "target_" : "ref_";
  return window.TEUI.StateManager.getValue(`${prefix}${fieldId}`) || 0;
}
```

### **Phase 3: User Input Event Handlers (Priority 3)**

**Objective**: User inputs only affect current mode's state

#### **A. Current Contamination Pattern**

```javascript
// ❌ WRONG: Writing to both states
dropdown.addEventListener("change", (e) => {
  StateManager.setValue(fieldId, e.target.value, "user-modified");
  StateManager.setValue(`ref_${fieldId}`, e.target.value, "user-modified");
});
```

#### **B. Required Pattern (100% State Isolation)**

```javascript
// ✅ CORRECT: Only affects current mode
dropdown.addEventListener("change", (e) => {
  const prefix = ModeManager.currentMode === "target" ? "target_" : "ref_";
  StateManager.setValue(`${prefix}${fieldId}`, e.target.value, "user-modified");

  // Only update global in Target mode (for DOM)
  if (prefix === "target_") {
    StateManager.setValue(fieldId, e.target.value, "user-modified");
  }
});
```

### **Phase 4: StateManager Access Audit (Priority 4)**

**Objective**: Find and eliminate ALL direct unprefixed StateManager calls

#### **A. Search Patterns to Eliminate**

- `StateManager.getValue("unprefixed_field")`
- `getFieldValue()` without prefix awareness
- Any DOM reading without going through StateManager
- Cross-section dependencies using unprefixed values

#### **B. Replacement Strategy**

1. **Audit Tool**: Create script to find all unprefixed StateManager calls
2. **Systematic Replacement**: Replace with mode-aware equivalents
3. **Validation**: Ensure no regression in functionality

---

## 🛠️ **IMPLEMENTATION PLAN**

### **Week 1: Critical Fixes (S09, S01, S04)**

1. **Day 1-2**: Fix S09 helper functions and event handlers
2. **Day 3-4**: Fix S01 Reference column contamination
3. **Day 5-7**: Fix S04 emissions calculation contamination

### **Week 2: Systematic Section Audit (S07, S10-S14)**

1. **Day 1**: Audit S07 for contamination patterns
2. **Day 2-6**: Systematic audit and fix S10-S14
3. **Day 7**: Validation and testing

### **Week 3: Cross-Section Dependencies**

1. **Day 1-3**: Map all cross-section dependencies
2. **Day 4-6**: Convert to prefixed communication
3. **Day 7**: End-to-end testing

### **Week 4: Validation and Documentation**

1. **Day 1-3**: Comprehensive testing of dual-model independence
2. **Day 4-5**: Performance optimization
3. **Day 6-7**: Documentation update

---

## 🧪 **VALIDATION TESTS**

### **Test 1: Complete State Isolation**

- Switch to Reference mode
- Make changes to ALL user inputs
- Switch back to Target mode
- **Result**: Target state unchanged, Reference state isolated

### **Test 2: Cross-Section Independence**

- Change climate (S03) in Reference mode
- **Result**: Only Reference calculations affected, Target unchanged

### **Test 3: Calculation Chain Integrity**

- Modify inputs in Target mode
- **Result**: Only Target calculation chain triggered

### **Test 4: No Global Contamination**

- Search codebase for unprefixed StateManager calls
- **Result**: Zero direct global access found

---

## 📊 **SUCCESS METRICS**

### **Technical Metrics**

- ✅ Zero unprefixed StateManager.getValue() calls
- ✅ Zero unprefixed StateManager.setValue() calls
- ✅ Zero cross-section global dependencies
- ✅ Complete user input state isolation

### **Functional Metrics**

- ✅ Target TEUI stable regardless of Reference changes
- ✅ Reference model completely independent
- ✅ Mode switching preserves both states
- ✅ No calculation chain contamination

### **Performance Metrics**

- ✅ No performance regression
- ✅ Clean separation enables future optimizations
- ✅ Easier debugging and maintenance

---

## 🚀 **NEXT IMMEDIATE ACTION**

**Start with S09 Complete Fix**: Apply the correct pattern to S09 first, then use it as template for systematic fixes across all other sections.

This eliminates the "one section breaks everything" problem by ensuring complete global elimination from the start.
