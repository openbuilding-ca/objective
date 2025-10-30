# 4012 Quick Patterns Reference

## 🚨 **CRITICAL: Read This First**

**Architecture Status**: ✅ **COMPLETE** - All 15 calculation sections converted to dual-state system.  
**Template Section**: `sections/4011-Section03.js` - Copy this pattern for any new sections.

---

## 📝 **Essential Patterns**

### **1. Section Structure (Required)**

```javascript
function calculateTargetModel() {
  // Target calculations - reads unprefixed values
}

function calculateReferenceModel() {
  // Reference calculations - reads ref_ prefixed values
}

function calculateAll() {
  calculateTargetModel();
  calculateReferenceModel();
}
```

### **2. Mode-Aware Writing (Required)**

```javascript
const setCalculatedValue = (fieldId, value, format = "number") => {
  if (window.TEUI?.ReferenceToggle?.isReferenceMode?.()) {
    StateManager.setValue(`ref_${fieldId}`, value, "calculated");
  } else {
    StateManager.setValue(fieldId, value, "calculated");
  }
};
```

### **3. Mode-Aware Reading (Critical for S15 and cross-section dependencies)**

```javascript
// Reference calculations - ONLY read ref_ prefixed
const ref_value = window.TEUI?.StateManager?.getValue("ref_fieldId") || 0;

// Target calculations - read target_ prefixed with fallback
const target_value =
  window.TEUI?.StateManager?.getValue("target_fieldId") ||
  getNumericValue("fieldId");
```

---

## 🎯 **Key Rules**

1. **Every calculation produces tuples**: `(target_value, ref_value)`
2. **Reference mode NEVER affects Target calculations**
3. **Use S03 as template** - it has the proven pattern
4. **StateManager is single source of truth** - all data flows through it
5. **Cross-section dependencies must read prefixed values** (like S15 reading building envelope)

---

## 🔧 **Troubleshooting**

**Problem**: Target values change when Reference toggle is used  
**Solution**: Check if section reads contaminated global values instead of prefixed values

**Problem**: Calculations not running in Reference mode  
**Solution**: Ensure `calculateReferenceModel()` function exists and is called

**Problem**: Values not displaying correctly  
**Solution**: Check `setCalculatedValue()` logic for proper prefix handling

---

**Most Common Issue**: Forgetting mode-aware reading in sections that consume other sections' outputs (like S15 reading S11/S12/S13 values).
