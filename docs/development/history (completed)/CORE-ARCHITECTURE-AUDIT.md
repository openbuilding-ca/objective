# 🔍 **CORE ARCHITECTURE AUDIT & PATH FORWARD**

**Date**: January 14, 2025  
**Objective**: Systematic global elimination with README.md compliance  
**Status**: 🎯 **DEFINITIVE PLAN**

**⚠️ CRITICAL**: This document must be read with `README.md` which contains essential StateManager patterns and anti-patterns.

---

## 🏗️ **CORE FILE STATUS ANALYSIS**

### **✅ CORE FILES - COMPATIBLE WITH DUAL-STATE**

| File                | Status  | Dual-State Ready | Notes                                                  |
| ------------------- | ------- | ---------------- | ------------------------------------------------------ |
| **StateManager**    | ✅ Core | Ready            | Central truth source - supports prefixed values        |
| **Calculator**      | ✅ Core | Ready            | Orchestrates section `calculateAll()` in correct order |
| **FieldManager**    | ✅ Core | Ready            | Renders sections - no state management                 |
| **ComponentBridge** | ✅ Core | Ready            | UI components - depends on StateManager                |

### **❓ LEGACY FILES - EVALUATION NEEDED**

| File                  | Current Role                        | Dual-State Impact | Recommendation                      |
| --------------------- | ----------------------------------- | ----------------- | ----------------------------------- |
| **ReferenceManager**  | Gets values from ReferenceValues.js | 🚨 **CONFLICTS**  | Phase out after dual-state complete |
| **ReferenceToggle**   | UI mode switching                   | 🚨 **CONFLICTS**  | Replace with S03 ModeManager        |
| **ReferenceValues**   | Static reference data               | 🔄 **FUTURE**     | Keep for Phase 2 constraints        |
| **SectionIntegrator** | Cross-section deps                  | ❓ **AUDIT**      | May conflict with StateManager      |

### **🗑️ FILES TO RETIRE (Post-Refactor)**

- `ComponentBridge` dependencies on old Reference system
- Any direct ReferenceToggle/ReferenceManager calls in sections

---

## 🎯 **DEFINITIVE SECTION-BY-SECTION PLAN**

### **Phase 1: Global Elimination (Current Priority)**

#### **✅ COMPLETED (Functional Alpha)**

- **S02**: ✅ Building Info
- **S03**: ✅ Climate (Template Pattern)
- **S05**: ✅ Emissions
- **S06**: ✅ Renewable Energy
- **S08**: ✅ IAQ
- **S15**: ✅ TEUI Summary

#### **🔄 PRIORITY QUEUE (Systematic Order)**

**1. S09 - Internal Gains (IMMEDIATE)**

```
ISSUE: Global contamination causing state mirroring
STATUS: Critical - breaks calculation chain
TEMPLATE: Use S03 pattern with 100% state isolation
VALIDATION: Test h_71, i_71, k_71 outputs in both modes
```

**2. S01 - Key Values**

```
ISSUE: Uses getRefNumericValue() with global fallbacks
STATUS: Mixed patterns, needs standardization
TEMPLATE: S15 pattern for summary calculations
VALIDATION: Test h_10, e_10 isolation
```

**3. S04 - Energy Use**

```
ISSUE: Global contamination in Reference calculations
STATUS: Central to embodied carbon (e_6) issues
TEMPLATE: S05 emissions pattern
VALIDATION: Test embodied vs operational separation
```

**4. S07 - Water Use**

```
ISSUE: Unknown contamination status
STATUS: Cross-section dependency for S15
TEMPLATE: S03 pattern
VALIDATION: Test k_51 outputs
```

**5. S10-S14 - Remaining Sections**

```
ISSUE: Unknown status, likely mixed patterns
STATUS: Complete systematic audit needed
TEMPLATE: S03 pattern as base
VALIDATION: Test all cross-section outputs
```

---

## 📋 **SECTION REFACTOR CHECKLIST (Per README.md)**

### **✅ Mandatory Requirements**

**1. StateManager Centrality (README.md Point 3)**

```javascript
// ✅ CORRECT - Single source of truth
const value = window.TEUI.StateManager.getValue(`${prefix}${fieldId}`);

// ❌ WRONG - Multiple sources
const value = someLocalCache[fieldId] || StateManager.getValue(fieldId);
```

**2. Helper Functions (README.md Point 11)**

```javascript
// ✅ CORRECT - Mode-aware, no global fallbacks
function getNumericValue(fieldId) {
  const prefix = ModeManager.currentMode === "target" ? "target_" : "ref_";
  const value = window.TEUI.StateManager.getValue(`${prefix}${fieldId}`);
  return window.TEUI.parseNumeric(value);
}

// ❌ WRONG - Global fallback
function getNumericValue(fieldId) {
  return StateManager.getValue(fieldId) || 0; // ← Global contamination!
}
```

**3. Cross-Section Dependencies (README.md Point 2)**

```javascript
// ✅ CORRECT - Read prefixed values
const coolingDays = getNumericValue("m_19"); // → reads prefix + m_19

// ❌ WRONG - Read global values
const coolingDays = StateManager.getValue("m_19"); // ← Global contamination!
```

**4. Event Handlers - 100% State Isolation**

```javascript
// ✅ CORRECT - Current mode only
function handleUserInput(fieldId, value) {
  const prefix = ModeManager.currentMode === "target" ? "target_" : "ref_";
  StateManager.setValue(`${prefix}${fieldId}`, value, "user-modified");
}

// ❌ WRONG - Dual contamination
function handleUserInput(fieldId, value) {
  StateManager.setValue(fieldId, value, "user-modified");
  StateManager.setValue(`ref_${fieldId}`, value, "user-modified"); // ← Contamination!
}
```

**5. DOM Updates (README.md Anti-Pattern 1)**

```javascript
// ✅ CORRECT - Only in Target mode
function setFieldValue(fieldId, value) {
  const prefix = ModeManager.currentMode === "target" ? "target_" : "ref_";
  StateManager.setValue(`${prefix}${fieldId}`, value, "calculated");

  // Only update DOM in Target mode for global display
  if (ModeManager.currentMode === "target") {
    updateDOMElement(fieldId, value);
  }
}
```

### **❌ Anti-Patterns to Eliminate (Per README.md)**

**1. Direct DOM Manipulation**

- Must use StateManager as intermediary
- No direct `element.textContent = value`

**2. Precision Issues**

- Use `window.TEUI.parseNumeric()` not `parseFloat()`
- Respect field formatting requirements

**3. Direct Section Calls**

- Use StateManager listeners, not `sect05.calculateAll()`
- Cross-section communication via StateManager only

**4. Global State Access**

- NO `StateManager.getValue(fieldId)` without prefix
- NO fallback to global when prefixed value missing

---

## 🚀 **IMMEDIATE EXECUTION PLAN**

### **Step 1: S09 Complete Refactor (This Session)**

1. Create `4011-Section09-CLEAN.js` using S03 template
2. Implement strict helper functions with no global fallbacks
3. Fix event handlers for 100% state isolation
4. Test calculation chain stability
5. Replace original S09 only after validation

### **Step 2: Systematic Section Progression**

1. S01 → S04 → S07 → S10-S14 in dependency order
2. After each section: Functional alpha test
3. Validate h/e column isolation in S01
4. Ensure cross-section deps use prefixed values

### **Step 3: Core File Updates (Post-Section Completion)**

1. Update Calculator if needed for dual-state orchestration
2. Phase out ReferenceManager/ReferenceToggle
3. Retire ComponentBridge legacy reference calls
4. Update README.md with dual-state patterns

### **Step 4: Validation & Testing**

1. Complete state isolation verification
2. Excel method parity testing
3. Cross-section dependency validation
4. Performance impact assessment

---

## 🎯 **SUCCESS CRITERIA**

**Immediate (S09)**:

- No state mirroring between Target/Reference modes
- Stable calculation chain (h_10 = 93.6)
- Proper embodied carbon calculation (e_6)

**Phase 1 Complete**:

- Zero global value access across all sections
- 100% state isolation in all user inputs
- Functional alpha with all 15 sections

**Architecture Clean**:

- Complete README.md compliance
- StateManager as single source of truth
- Clean deprecation of legacy reference system

---

**NEXT ACTION**: Begin S09 complete refactor using S03 template with strict global elimination.
