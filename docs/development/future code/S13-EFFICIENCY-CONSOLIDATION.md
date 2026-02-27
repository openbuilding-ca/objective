# 📋 S13 HVAC Efficiency Consolidation - Workplan

**Branch**: `S13-HVAC-CONSOLIDATION` (branch from `dependency3` or current dev branch)
**Reference**: Modeled after S07 efficiency consolidation (commit `31f2e03` on branch `S07-TWEAK`)
**Target File**: `src/sections/Section13.js` (~3200 lines, complex dual-state architecture)
**Architecture Reference**: `docs/development/history (completed)/4012-CHEATSHEET.md`
**Backup Created**: `src/sections/Section13.js.backup-YYYYMMDD-HHMMSS` (create before starting)

---

## 🚀 **Post-Compaction Quick Start** (For Future Agent)

If you're picking this up after context compaction, here's what you need to know:

### **What Was Done (S07 Reference - Commit 31f2e03)**
- ✅ Successfully consolidated S07's dual efficiency (d_52 slider + k_52 editable) → single d_52 slider
- ✅ Modified 6 files: Section07.js, pcConfig.js, ExcelMapper.js, FileHandler.js, QCMonitor.js, TooltipManager.js
- ✅ All 8 phases completed, tested, committed
- ✅ Pattern proven to work: slider range constraints, legacy import conversion, dual-state isolation

### **S13 Complexity Differences from S07**
1. **Conditional j_116 Editability**: j_116 must be editable ONLY when d_113=Gas/Oil + d_116=Cooling
   - S07 had no conditional editability - simpler pattern
   - Requires new `updateJ116Editability()` function (see Phase 4)
2. **HSPF/COPh Relationship**: f_113 = h_113 × 3.413 (bidirectional conversion)
   - S07 only had unidirectional d_52 → e_52
   - ExcelMapper must handle HSPF→COPh→% conversion (see Phase 8)
3. **Multiple Calculation Functions**:
   - `calculateHeatingEfficiency()` - primary efficiency logic
   - `calculateCoolingEfficiency()` - j_116 conditional logic
   - `calculateHeatingLoads()` - uses AFUE for Gas/Oil
   - S07 only had 2 calculation functions
4. **Downstream Dependencies**: S13 feeds S14 (emissions), S15 (energy summary), S18 (parallel coords)
   - More extensive than S07's limited downstream impact

### **Before You Start Implementation**
1. ✅ Read this entire workplan (~700 lines)
2. ✅ Read S07 consolidation commit: `git show 31f2e03`
3. ✅ Create backup: `cp src/sections/Section13.js src/sections/Section13.js.backup-$(date +%Y%m%d-%H%M%S)`
4. ✅ Verify current branch: `git branch` (should be on feature branch, not main)
5. ✅ Check existing field usage: `grep -n "f_113\|j_115\|h_113" src/sections/Section13.js | head -50`

### **Critical Code Locations in Section13.js** (Line numbers approximate)
- **TargetState**: Lines 32-94 (syncFromGlobalState around line 96-110)
- **ReferenceState**: Lines 168-243 (syncFromGlobalState around line 259-273, setDefaults around line 280-310)
- **Field Definitions (sectionRows)**: Lines 800-1400 (Row 113 around line 1050, Row 115 around line 1150, Row 116 around line 1180)
- **Calculation Functions**: Lines 2100-2800
  - `calculateHeatingEfficiency()`: ~line 2150
  - `calculateCoolingEfficiency()`: ~line 2250
  - `calculateHeatingLoads()`: ~line 2350
- **Event Handlers**: Lines 3000-3200
  - `initializeEventHandlers()`: ~line 3050
  - `handleSliderChange()`: ~line 3100
  - System dropdown handler: ~line 3150

---

## 🎯 **Objective**

Consolidate S13's multiple heating/cooling efficiency inputs (f_113/HSPF, j_115/AFUE, j_116/COPc, derived h_113/COPh) into a unified **Heating Efficiency Slider** (50-600% range) to eliminate user confusion, reduce input complexity, and maintain Excel formula parity.

### **Current State** (Before Consolidation)
Users must manage multiple efficiency fields depending on system type:
- **Heatpump (d_113)**: `f_113` HSPF slider (editable) → derives `h_113` COPh (calculated)
- **Gas/Oil (d_113)**: `j_115` AFUE field (editable)
- **Electric (d_113)**: No specific efficiency field (assumes 100%)
- **Cooling (d_116)**:
  - `j_116` COPc (editable when d_113=Gas/Oil + d_116=Cooling)
  - `j_116` auto-calculated as `h_113 - 1` when d_113=Heatpump

### **Target State** (After Consolidation)
Single unified interface:
- **ALL HEATING SYSTEMS**: `d_113_eff` slider (50-600% efficiency range)
  - Gas/Oil: 50-98% (AFUE, step=1%)
  - Electric: 90-100% (efficiency, step=1%)
  - Heatpump: 100-600% (COPh, step=10%)
- **COOLING EFFICIENCY**:
  - Heatpump: `j_116` auto-calculated as `(d_113_eff/100) - 1` (COPc = COPh - 1)
  - Gas/Oil + Cooling: `j_116` editable field appears (manual COPc entry required)
  - No Cooling: `j_116` hidden/ghosted

---

## 🔧 **Efficiency Unification Logic**

### **Heating Efficiency (d_113_eff) → Intermediate Values**

The d_113_eff slider (50-600%) feeds into different intermediate fields based on system type:

| System Type | Slider Range | Intermediate Field | Formula | Purpose |
|-------------|--------------|-------------------|---------|---------|
| **Heatpump** | 100-600% | `h_113` (COPh) | `d_113_eff / 100` | Direct COP for heating calcs |
| **Heatpump** | 100-600% | `f_113` (HSPF) | `h_113 * 3.413` | Derived for reference/export |
| **Gas** | 50-98% | `j_115` (AFUE) | `d_113_eff / 100` | AFUE as decimal (0.50-0.98) |
| **Oil** | 50-98% | `j_115` (AFUE) | `d_113_eff / 100` | AFUE as decimal (0.50-0.98) |
| **Electric** | 90-100% | `h_113` (COPh) | `d_113_eff / 100` | Efficiency as COP (0.90-1.00) |

### **Cooling Efficiency (j_116) Behavior**

| Scenario | j_116 Behavior | Formula | Notes |
|----------|---------------|---------|-------|
| d_113=**Heatpump** | Auto-calculated | `j_116 = h_113 - 1` | COPc derived from COPh |
| d_113=**Gas/Oil** + d_116=**Cooling** | User editable | Manual input | Separate cooling system COP |
| d_113=**Gas/Oil** + d_116=**No Cooling** | Hidden/ghosted | N/A | No cooling system |
| d_113=**Electric** | Auto-calculated | `j_116 = h_113 - 1` | Same as heatpump |

---

## 📊 **Field Mapping & Retirement Plan**

### **Fields to Retire** (removed from UI, retained in state for legacy import)
| Field | Current Role | Post-Consolidation Status |
|-------|-------------|---------------------------|
| `f_113` | HSPF slider (Heatpump) | ❌ Retired - auto-calculated from d_113_eff |
| `j_115` | AFUE editable (Gas/Oil) | ❌ Retired - auto-calculated from d_113_eff |

### **Fields to Modify**
| Field | Current Behavior | New Behavior |
|-------|-----------------|--------------|
| `j_116` | Mixed (editable/calculated) | Conditional: Editable ONLY when d_113=Gas/Oil + d_116=Cooling |
| `h_113` | Always calculated from f_113 | Calculated from d_113_eff for all systems |

### **New Fields**
| Field | Type | Range | Purpose |
|-------|------|-------|---------|
| `d_113_eff` | Slider | 50-600% | Unified heating efficiency input |
| `e_113_eff` | Calculated | 0.50-6.00 | Decimal efficiency (d_113_eff/100) |

---

## 🔄 **Calculation Flow Changes**

### **Current Flow** (Before)
```
Heatpump:  f_113 (HSPF slider) → h_113 (COPh) → j_116 (COPc = COPh-1)
Gas/Oil:   j_115 (AFUE editable) → heating calcs
```

### **New Flow** (After)
```
ALL SYSTEMS: d_113_eff (slider) → e_113_eff (decimal) →
  - Heatpump:  e_113_eff → h_113 (COPh) → f_113 (HSPF derived) + j_116 (COPc = COPh-1)
  - Gas/Oil:   e_113_eff → j_115 (AFUE) + j_116 (manual if cooling=Yes)
  - Electric:  e_113_eff → h_113 (efficiency COP)
```

---

## 📝 **Implementation Phases** (8 Phases, ~320 lines modified)

### **PHASE 1: Formula Consolidation** (~80 lines)
**Goal**: Update calculation functions to use e_113_eff instead of f_113/j_115

#### Changes:
1. **`calculateHeatingEfficiency(isReferenceCalculation)`**
   - Replace `f_113` (HSPF) read with `d_113_eff` read
   - Replace `j_115` (AFUE) read with `d_113_eff` read
   - Calculate `e_113_eff = d_113_eff / 100`
   - Branch logic:
     ```javascript
     if (systemType === "Heatpump" || systemType === "Electric") {
       const h_113 = e_113_eff; // COPh
       const f_113_derived = h_113 * 3.413; // HSPF for export
       setSectionValue("h_113", h_113, isReferenceCalculation);
       setSectionValue("f_113", f_113_derived, isReferenceCalculation);
     } else if (systemType === "Gas" || systemType === "Oil") {
       const j_115 = e_113_eff; // AFUE as decimal
       setSectionValue("j_115", j_115, isReferenceCalculation);
     }
     ```

2. **`calculateCoolingEfficiency(isReferenceCalculation)`**
   - Update j_116 calculation:
     ```javascript
     if (systemType === "Heatpump" || systemType === "Electric") {
       const h_113 = getSectionNumericValue("h_113", 1, isReferenceCalculation);
       const j_116_auto = h_113 - 1; // COPc = COPh - 1
       setSectionValue("j_116", j_116_auto, isReferenceCalculation);
     } else if ((systemType === "Gas" || systemType === "Oil") && coolingSystem !== "No Cooling") {
       // j_116 remains editable - read from user input
       const j_116_manual = getSectionNumericValue("j_116", 3.0, isReferenceCalculation);
       setSectionValue("j_116", j_116_manual, isReferenceCalculation);
     } else {
       setSectionValue("j_116", 0, isReferenceCalculation); // No cooling
     }
     ```

3. **`calculateHeatingLoads(isReferenceCalculation)`**
   - Replace all `j_115` reads with `e_113_eff` reads
   - Ensure Gas/Oil calculations use `e_113_eff` directly as AFUE

---

### **PHASE 2: Field Definition Cleanup** (~40 lines)
**Goal**: Update field dependencies, add d_113_eff slider, retire f_113/j_115 UI fields

#### Changes:
1. **Add Row 113A** (new slider row between 113-114):
   ```javascript
   "113a": {
     rowId: "H.3.1a",
     cells: {
       d: {
         fieldId: "d_113_eff",
         type: "slider",
         value: "300", // Default 300% (COPh 3.0 for heatpump)
         min: 50,
         max: 600,
         step: 10,
         tooltip: true,
         label: "Heating Efficiency (%): 50-600%",
       },
       e: {
         fieldId: "e_113_eff",
         type: "calculated",
         value: "3.00",
         dependencies: ["d_113_eff"],
         label: "Efficiency Decimal",
       },
       f: { content: "Efficiency %", classes: ["text-left"] },
       h: { content: "All fuel types unified", classes: ["text-left"] },
     }
   }
   ```

2. **Update Row 113** (f_113 → calculated):
   ```javascript
   f: {
     fieldId: "f_113",
     type: "calculated", // WAS: "editable" or "slider"
     value: "7.10",
     dependencies: ["d_113", "d_113_eff", "h_113"],
     conditionalDeps: ["d_113_eff", "h_113"], // Derived from h_113 * 3.413
     label: "HSPF (derived from COPh)",
   },
   ```

3. **Update Row 115** (j_115 → calculated):
   ```javascript
   j: {
     fieldId: "j_115",
     type: "calculated", // WAS: "editable"
     value: "0.90",
     dependencies: ["d_113", "d_113_eff"],
     conditionalDeps: ["d_113_eff"], // Only used when d_113="Gas" or "Oil"
     label: "AFUE (derived from d_113_eff)",
   },
   ```

4. **Update Row 116** (j_116 conditional editability):
   ```javascript
   j: {
     fieldId: "j_116",
     type: "conditional-editable", // Editable ONLY when d_113=Gas/Oil + d_116=Cooling
     value: "2.50",
     dependencies: ["d_113", "d_116", "h_113", "d_113_eff"],
     conditionalDeps: ["h_113", "d_113_eff"],
     label: "COPc (auto for Heatpump, manual for Gas/Oil+Cooling)",
   },
   ```

---

### **PHASE 3: State Management Cleanup** (~50 lines)
**Goal**: Remove f_113/j_115 from editable field sync, add d_113_eff initialization

#### Changes:
1. **TargetState.syncFromGlobalState()**
   - Remove `f_113`, `j_115` from sync list
   - Add `d_113_eff`
   ```javascript
   syncFromGlobalState: function (
     fieldIds = [
       "d_113",    // Heating system type
       "d_113_eff", // ✅ NEW: Unified efficiency slider
       "d_116",    // Cooling system
       "j_116",    // COPc (conditional editable)
       "d_118",    // HRV/ERV SRE %
       // ... other fields
     ]
   ) { ... }
   ```

2. **ReferenceState.syncFromGlobalState()**
   - Same updates as TargetState

3. **ReferenceState.setDefaults()**
   - Remove f_113/j_115 defaults
   - Add d_113_eff default:
   ```javascript
   this.state.d_113 = "Electric"; // Reference default
   this.state.d_113_eff = "90";  // 90% efficiency for Electric
   this.state.d_116 = "No Cooling";
   ```

4. **userModified flag updates**:
   - Replace `f_113_userModified` with `d_113_eff_userModified`
   - Remove `j_115_userModified` (no longer user-editable)
   - Keep `j_116_userModified` for Gas/Oil+Cooling scenario

---

### **PHASE 4: Event Handler Cleanup** (~30 lines)
**Goal**: Remove f_113/j_115 editable handlers, add d_113_eff slider handler

#### Changes:
1. **`initializeEventHandlers()`**
   - Remove f_113/j_115 from editable fields array:
   ```javascript
   const editableFields = ["l_118", "d_119"]; // Was: ["f_113", "j_115", "l_118", "d_119"]
   ```

2. **`handleSliderChange(e)`**
   - Add d_113_eff slider logic (similar to d_52 in S07):
   ```javascript
   if (fieldId === "d_113_eff") {
     const systemType = ModeManager.getValue("d_113") || "Heatpump";
     const numValue = parseFloat(value);

     // Validate range constraints
     if ((systemType === "Gas" || systemType === "Oil") && (numValue < 50 || numValue > 98)) {
       console.warn(`[S13] ${systemType} efficiency ${numValue}% outside allowed range (50-98%)`);
     } else if (systemType === "Electric" && (numValue < 90 || numValue > 100)) {
       console.warn(`[S13] Electric efficiency ${numValue}% outside allowed range (90-100%)`);
     }
   }
   ```

3. **`handleConditionalEditability()`** (new function)
   - Make j_116 editable/read-only based on d_113 + d_116:
   ```javascript
   function updateJ116Editability() {
     const systemType = ModeManager.getValue("d_113") || "Heatpump";
     const coolingSystem = ModeManager.getValue("d_116") || "No Cooling";
     const j116Element = document.querySelector('[data-field-id="j_116"]');

     const isEditable =
       (systemType === "Gas" || systemType === "Oil") &&
       coolingSystem !== "No Cooling";

     if (j116Element) {
       j116Element.setAttribute("contenteditable", isEditable ? "true" : "false");
       j116Element.classList.toggle("editable", isEditable);
       j116Element.classList.toggle("disabled-input", !isEditable);
     }
   }
   ```

---

### **PHASE 5: Slider Range Validation** (~40 lines)
**Goal**: Dynamic slider constraints based on d_113 (heating system type)

#### Changes:
1. **`handleHeatingSystemChange(event)`** (update existing function)
   - Adjust d_113_eff slider min/max/step when d_113 changes:
   ```javascript
   function handleHeatingSystemChange(event) {
     const selectedSystem = event.target.value;
     const d113EffSlider = document.querySelector('input[data-field-id="d_113_eff"]');
     const d113EffDisplay = document.querySelector('span[data-display-for="d_113_eff"]');

     let newMin = 50, newMax = 600, newStep = 10, newValue = 300;
     let preservedValue = null;

     // Check for existing user/imported value
     const existingEff = ModeManager.getValue("d_113_eff");
     if (existingEff) {
       preservedValue = parseInt(existingEff);
     }

     if (selectedSystem === "Gas" || selectedSystem === "Oil") {
       newMin = 50;
       newMax = 98;
       newStep = 1;
       newValue = preservedValue || 90;

       // Clamp preserved value to Gas/Oil range
       if (preservedValue && (preservedValue < 50 || preservedValue > 98)) {
         console.warn(`[S13] Preserved ${preservedValue}% outside Gas/Oil range, resetting to 90%`);
         newValue = 90;
       }
     } else if (selectedSystem === "Electric") {
       newMin = 90;
       newMax = 100;
       newStep = 1;
       newValue = preservedValue || 100;
     } else if (selectedSystem === "Heatpump") {
       newMin = 100;
       newMax = 600;
       newStep = 10;
       newValue = preservedValue || 300; // Default COPh 3.0
     }

     // Update slider attributes
     if (d113EffSlider) {
       d113EffSlider.min = newMin;
       d113EffSlider.max = newMax;
       d113EffSlider.step = newStep;
       d113EffSlider.value = newValue;

       if (d113EffDisplay) {
         d113EffDisplay.textContent = newValue + "%";
       }

       // Update state
       ModeManager.setValue("d_113_eff", newValue.toString(), "system-update");
       calculateAll();
       ModeManager.updateCalculatedDisplayValues();
     }

     // Update j_116 editability
     updateJ116Editability();
   }
   ```

---

### **PHASE 6: Conditional Ghosting Updates** (~25 lines)
**Goal**: Remove f_113/j_115 ghosting, add j_116 conditional ghosting

#### Changes:
1. **`updateSection13Visibility(systemType, coolingType)`** (update existing or create new)
   ```javascript
   function updateSection13Visibility(systemType, coolingType) {
     // ✅ PHASE 6: f_113/j_115 no longer ghosted (always calculated now)

     // j_116 ghosting: editable ONLY when Gas/Oil + Cooling
     const isJ116Editable =
       (systemType === "Gas" || systemType === "Oil") &&
       coolingType !== "No Cooling";

     setFieldGhosted("j_116", !isJ116Editable);

     // Update contenteditable attribute for j_116
     const j116Element = document.querySelector('[data-field-id="j_116"]');
     if (j116Element) {
       j116Element.setAttribute("contenteditable", isJ116Editable ? "true" : "false");
     }
   }
   ```

---

### **PHASE 7: StateManager Publication Cleanup** (~30 lines)
**Goal**: Remove f_113/j_115 separate publication logic, add d_113_eff publication

#### Changes:
1. **`handleHeatingSystemChange()` publications**
   - Remove conditional f_113/j_115 StateManager.setValue() calls
   - Add unified d_113_eff publication:
   ```javascript
   if (window.TEUI?.StateManager) {
     window.TEUI.StateManager.setValue("d_113_eff", newValue.toString(), "system-update");
     window.TEUI.StateManager.setValue(`ref_d_113_eff`, newValue.toString(), "system-update");
     console.log(`[S13] Updated ${selectedSystem}: d_113_eff=${newValue}% (efficiency unified)`);
   }
   ```

2. **Remove legacy f_113/j_115 storage**
   - Remove from Target/Reference publication arrays:
   ```javascript
   // OLD: const targetFields = ["d_114", "f_113", "j_115", "h_113", ...];
   const targetFields = ["d_114", "d_113_eff", "h_113", "f_113", "j_115", ...];
   // ✅ Keep f_113/j_115 for export, but they're now calculated from d_113_eff
   ```

---

### **PHASE 8: Import/Export Infrastructure** (~45 lines)
**Goal**: Update all cross-file references, add legacy conversion logic

#### Files to Update:
1. **pcConfig.js** - Section18 Parallel Coordinates HEAT% axis
2. **ExcelMapper.js** - Legacy f_113/j_115 → d_113_eff conversion
3. **FileHandler.js** - CSV export (add d_113_eff, keep f_113/j_115 as calculated)
4. **QCMonitor.js** - Remove f_113/j_115 from user-editable validations
5. **TooltipManager.js** - Update f_113/j_115 tooltips, add d_113_eff tooltip

#### Detailed Changes:

**1. pcConfig.js** (~15 lines)
```javascript
{
  id: "heat_efficiency",
  label: "HEAT%",
  unit: "%",
  description: "Space Heating efficiency",
  optimal: "higher",

  // ✅ S13 CONSOLIDATION: d_113_eff now unified for all fuel types
  targetField: "d_113_eff", // All fuel types use d_113_eff slider (50-600% range)
  targetFieldMultiplier: null, // Already in %
  targetFieldSelector: null, // No conditional logic needed

  referenceField: "ref_d_113_eff",
  referenceFieldMultiplier: null,
  referenceFieldSelector: null,

  domain: [0, 600], // Updated to reflect heatpump COPh range (100-600%)
},
```

**2. ExcelMapper.js** (~20 lines)
Add legacy conversion logic after f_113/j_115 normalization:

```javascript
// ✅ S13 CONSOLIDATION: Legacy f_113 (HSPF) → d_113_eff (%) conversion for Heatpump
if (fieldId === "f_113" && extractedValue) {
  const d_113Value = mappedData["d_113"];
  if (d_113Value === "Heatpump") {
    const f_113_num = parseFloat(extractedValue);
    if (!isNaN(f_113_num)) {
      const h_113 = f_113_num / 3.413; // HSPF → COPh
      const d_113_eff_pct = Math.round(h_113 * 100); // COPh → %
      mappedData["d_113_eff"] = d_113_eff_pct.toString();
      console.log(`[ExcelMapper] Legacy f_113=${f_113_num} → d_113_eff=${d_113_eff_pct}% (COPh=${h_113.toFixed(2)})`);
    }
  }
}

// ✅ S13 CONSOLIDATION: Legacy j_115 (AFUE) → d_113_eff (%) conversion for Gas/Oil
if (fieldId === "j_115" && extractedValue) {
  const d_113Value = mappedData["d_113"];
  if (d_113Value === "Gas" || d_113Value === "Oil") {
    const j_115_decimal = parseFloat(extractedValue);
    if (!isNaN(j_115_decimal)) {
      const d_113_eff_pct = Math.round(j_115_decimal * 100); // AFUE → %
      mappedData["d_113_eff"] = d_113_eff_pct.toString();
      console.log(`[ExcelMapper] Legacy j_115=${j_115_decimal} → d_113_eff=${d_113_eff_pct}% for ${d_113Value}`);
    }
  }
}
```

**Reference sheet** - same logic with `ref_` prefix

**3. FileHandler.js** (~5 lines)
```javascript
// CSV Export field list
const exportFields = [
  // Section 13: Mechanical Loads
  "d_113",
  "d_113_eff", // ✅ NEW: Unified efficiency slider
  "f_113",     // Keep for export (calculated from d_113_eff)
  "j_115",     // Keep for export (calculated from d_113_eff)
  "h_113",     // COPh
  "d_116",
  "j_116",
  // ... rest
];

// Remove f_113/j_115 from coefficient formatting (no longer 2dp fields)
// const coefficient2dpFields = ["j_115", "j_116"]; // OLD
const coefficient2dpFields = ["j_116"]; // NEW
```

**4. QCMonitor.js** (~3 lines)
```javascript
// Remove from optional user-editable fields
const optionalEditableFields = [
  // "f_113", // REMOVED - now calculated
  // "j_115", // REMOVED - now calculated
  "j_116",   // Keep - conditionally editable
  "l_118",
  "d_119",
];
```

**5. TooltipManager.js** (~7 lines)
```javascript
// Update tooltips
d_113_eff: {
  cell: "D113A",
  title: "Unified Heating Efficiency",
  message: "All fuel types use this slider. Gas/Oil: 50-98% AFUE. Electric: 90-100%. Heatpump: 100-600% COPh.",
},
f_113: {
  cell: "F113",
  title: "HSPF (Auto-Calculated)",
  message: "Heating Seasonal Performance Factor. Auto-calculated from COPh (h_113 × 3.413). Legacy field retained for export compatibility.",
},
j_115: {
  cell: "J115",
  title: "AFUE (Auto-Calculated)",
  message: "Annual Fuel Utilization Efficiency. Auto-calculated from d_113_eff for Gas/Oil systems. Legacy field retained for export compatibility.",
},
j_116: {
  cell: "J116",
  title: "COPc (Conditional)",
  message: "Cooling COP. Auto-calculated as COPh-1 for Heatpump. Editable ONLY when d_113=Gas/Oil AND d_116=Cooling (separate cooling system).",
},
```

---

## 🧪 **Testing Protocol** (10 Scenarios)

### **Core Functionality Tests** (Scenarios 1-5)
1. **Heatpump Default Initialization**
   - [ ] Set d_113=Heatpump → d_113_eff slider shows 300% (range 100-600%, step 10%)
   - [ ] h_113 calculates to 3.00 (COPh)
   - [ ] f_113 calculates to 10.24 (HSPF = 3.00 × 3.413)
   - [ ] j_116 calculates to 2.00 (COPc = 3.00 - 1)
   - [ ] j_116 is read-only (contenteditable="false")

2. **Gas System Efficiency**
   - [ ] Set d_113=Gas → d_113_eff slider shows 90% (range 50-98%, step 1%)
   - [ ] j_115 calculates to 0.90 (AFUE)
   - [ ] h_113 = 0 (not used for Gas)
   - [ ] f_113 = 0 (not used for Gas)
   - [ ] Adjust slider to 75% → j_115 = 0.75

3. **Oil System Efficiency**
   - [ ] Set d_113=Oil → d_113_eff slider shows 90% (range 50-98%, step 1%)
   - [ ] j_115 calculates to 0.90 (AFUE)
   - [ ] Adjust slider to 85% → j_115 = 0.85

4. **Electric System Efficiency**
   - [ ] Set d_113=Electric → d_113_eff slider shows 100% (range 90-100%, step 1%)
   - [ ] h_113 calculates to 1.00 (efficiency COP)
   - [ ] Adjust slider to 95% → h_113 = 0.95

5. **Gas+Cooling (Manual COPc Entry)**
   - [ ] Set d_113=Gas, d_116=Cooling (not "No Cooling")
   - [ ] j_116 becomes editable (contenteditable="true")
   - [ ] Edit j_116 to 3.5 → saves to state
   - [ ] Change d_113=Heatpump → j_116 becomes read-only, recalculates as h_113-1

### **Dual-State Isolation Tests** (Scenarios 6-7)
6. **Target/Reference Independence**
   - [ ] Target: d_113=Heatpump, d_113_eff=400% (h_113=4.0, j_116=3.0)
   - [ ] Reference: d_113=Electric, ref_d_113_eff=90% (ref_h_113=0.9)
   - [ ] Toggle between modes → each preserves its own values
   - [ ] StateManager shows unprefixed d_113_eff=400, ref_d_113_eff=90

7. **Cross-Section Dependency Isolation**
   - [ ] Verify d_114 (Space Heating Demand) reads h_113 correctly in Target mode
   - [ ] Verify ref_d_114 reads ref_h_113 correctly in Reference mode
   - [ ] No state contamination when toggling Reference mode on/off

### **Import/Export Tests** (Scenarios 8-10)
8. **Legacy Excel Import (Heatpump with f_113)**
   - [ ] Import Excel with F113=8.5 (HSPF), D113=Heatpump
   - [ ] Conversion: h_113 = 8.5 / 3.413 = 2.49, d_113_eff = 249%
   - [ ] Verify d_113_eff slider shows 250% (rounded)
   - [ ] Verify f_113 recalculates to 8.53 (2.50 × 3.413)
   - [ ] Verify j_116 = 1.50 (2.50 - 1)

9. **Legacy Excel Import (Gas with j_115)**
   - [ ] Import Excel with J115=0.94 (AFUE), D113=Gas
   - [ ] Conversion: d_113_eff = 94%
   - [ ] Verify d_113_eff slider shows 94%
   - [ ] Verify j_115 recalculates to 0.94

10. **CSV Export Verification**
    - [ ] Set d_113=Heatpump, d_113_eff=350%
    - [ ] Export CSV → verify columns: d_113_eff=350, f_113=11.95, h_113=3.50, j_116=2.50
    - [ ] Import CSV back → all values restored correctly
    - [ ] Set d_113=Gas, d_113_eff=92%
    - [ ] Export CSV → verify: d_113_eff=92, j_115=0.92

---

## 🚨 **Critical Considerations**

### **Excel Formula Parity** ⚠️
All heating/cooling calculations must produce **identical results** to Excel:
- Gas/Oil: Space heating = Demand / j_115 (AFUE)
- Heatpump: Space heating = Demand / h_113 (COPh)
- Cooling: Cooling energy = Cooling load / j_116 (COPc)

### **Dual-State Architecture Compliance** ⚠️
- Target fields: `d_113_eff`, `h_113`, `f_113`, `j_115`, `j_116`
- Reference fields: `ref_d_113_eff`, `ref_h_113`, `ref_f_113`, `ref_j_115`, `ref_j_116`
- NO cross-contamination when toggling Reference mode

### **Downstream Dependencies** ⚠️
Sections that read S13 efficiency fields:
- **Section 14** (Emissions): Reads h_113 for heatpump heating emissions
- **Section 15** (Energy Summary): Reads d_114/f_114 (space heating energy)
- **Section 18** (Parallel Coordinates): Reads HEAT% axis (now d_113_eff)

### **Legacy Data Preservation** ⚠️
Imported Excel files may contain:
- f_113 values (HSPF) from pre-consolidation exports
- j_115 values (AFUE) from Gas/Oil systems
- Must convert to d_113_eff while preserving precision

---

## 📦 **Deliverables**

### **Modified Files** (7 files)
1. `src/sections/Section13.js` - Core implementation (~320 lines modified)
2. `src/core/pcConfig.js` - Parallel Coordinates HEAT% axis
3. `src/core/ExcelMapper.js` - Legacy import conversion
4. `src/core/FileHandler.js` - CSV export updates
5. `src/core/QCMonitor.js` - Validation cleanup
6. `src/core/TooltipManager.js` - Tooltip updates
7. `docs/development/S13-EFFICIENCY-CONSOLIDATION.md` - This workplan

### **Testing Artifacts**
- [ ] 10 test scenarios executed (checklist above)
- [ ] Excel parity verification report
- [ ] Dual-state isolation proof (console logs)
- [ ] Import/export round-trip test results

### **Git Artifacts**
- **Branch**: `S13-HVAC-CONSOLIDATION`
- **Commits**: Atomic commits per phase (8 commits)
- **Final Commit Message**:
  ```
  Feat: Consolidate S13 HVAC efficiency inputs (f_113/j_115 → d_113_eff)

  Unified heating efficiency into single d_113_eff slider (50-600% range):
  - Gas/Oil: 50-98% AFUE via slider (was j_115 editable)
  - Electric: 90-100% efficiency via slider
  - Heatpump: 100-600% COPh via slider (was f_113 HSPF)
  - COPc (j_116): Auto for Heatpump (COPh-1), manual for Gas/Oil+Cooling

  Changes across 6 files: Section13.js (8-phase consolidation),
  pcConfig.js (HEAT% axis), ExcelMapper.js (legacy conversion),
  FileHandler.js/QCMonitor.js/TooltipManager.js (infrastructure).

  Maintains Excel formula parity and dual-state architecture.
  ```

---

## 🔗 **References**

- **S07 Consolidation**: Commit `31f2e03` - DHW efficiency model
- **Dual-State Cheatsheet**: `docs/development/history (completed)/4012-CHEATSHEET.md`
- **S13 Bug History**: `docs/development/history (completed)/4012-S13-BUG-LOG.md`
- **Field Naming Convention**: `[column]_[row]` format (e.g., `d_113_eff` = column D, row 113A)

---

**Estimated Implementation Time**: 4-6 hours (based on S07 consolidation: 2-3 hours)
**Complexity**: High (conditional j_116 editability + HSPF/COPh relationship)
**Risk Level**: Medium (extensive downstream dependencies in S14/S15/S18)

---

## ⚠️ **Implementation Gotchas & Lessons from S07**

### **1. Slider Display Element Location**
**Issue**: Slider display spans may not be found by `data-display-for` attribute
**S07 Solution**: Used `.nextElementSibling` as fallback
```javascript
let displayElement = d113EffDisplay || d113EffSlider.nextElementSibling;
if (displayElement) {
  displayElement.textContent = `${newValue}%`;
}
```

### **2. State Sync Order Matters**
**Issue**: TargetState/ReferenceState must sync BEFORE calculations run
**Critical Pattern**:
```javascript
// WRONG - sync after calculations
calculateAll();
TargetState.syncFromGlobalState();

// RIGHT - sync before calculations
TargetState.syncFromGlobalState();
calculateAll();
```

### **3. Preserved Value Validation**
**Issue**: Imported values may be outside valid range for new system type
**S07 Pattern** (Phase 5 - handleHeatingSystemChange):
```javascript
const existingEff = ModeManager.getValue("d_113_eff");
if (existingEff) {
  preservedValue = parseInt(existingEff);
}

// Clamp to Gas/Oil range
if (preservedValue && (preservedValue < 50 || preservedValue > 98)) {
  console.warn(`[S13] Preserved ${preservedValue}% outside Gas/Oil range, resetting to 90%`);
  newValue = 90;
}
```

### **4. Field Definition Dependencies**
**Issue**: Forgetting to update `dependencies` arrays causes stale calculations
**Check List**:
- [ ] e_51 dependencies: updated from k_52 to e_52? (Gas volume calc)
- [ ] j_51 dependencies: updated from k_52 to e_52? (Net thermal demand)
- [ ] j_54 dependencies: updated from k_52 to e_52? (Exhaust losses)
- [ ] k_54 dependencies: updated from k_52 to e_52? (Oil volume)

**S13 Equivalent**: Update f_113, j_115, h_113, j_116 dependencies to reference d_113_eff

### **5. Console Logging for Debugging**
**Pattern from S07** (keep during implementation, remove for production):
```javascript
console.log(`[S13] Updated ${selectedSystem}: d_113_eff=${newValue}% (efficiency unified)`);
console.log(`[S13] 🔥 Gas calc: AFUE=${efficiency} → j_115=${j_115_decimal}`);
console.log(`[S13] ⚡ Heatpump: COPh=${h_113}, HSPF=${f_113_derived}, COPc=${j_116_auto}`);
```

### **6. Conditional j_116 Editability (NEW - Not in S07)**
**Critical Implementation**:
```javascript
// Call this in 3 places:
// 1. After d_113 (heating system) changes
// 2. After d_116 (cooling system) changes
// 3. During section initialization

function updateJ116Editability() {
  const systemType = ModeManager.getValue("d_113") || "Heatpump";
  const coolingSystem = ModeManager.getValue("d_116") || "No Cooling";
  const j116Element = document.querySelector('[data-field-id="j_116"]');

  const isEditable =
    (systemType === "Gas" || systemType === "Oil") &&
    coolingSystem !== "No Cooling";

  if (j116Element) {
    j116Element.setAttribute("contenteditable", isEditable ? "true" : "false");
    j116Element.classList.toggle("editable", isEditable);
    j116Element.classList.toggle("disabled-input", !isEditable);
  }
}
```

### **7. Legacy Import Conversion (ExcelMapper.js)**
**Critical**: Check d_113 value BEFORE converting f_113 or j_115
```javascript
// WRONG - converts regardless of system type
const f_113_num = parseFloat(extractedValue);
const h_113 = f_113_num / 3.413;
mappedData["d_113_eff"] = Math.round(h_113 * 100).toString();

// RIGHT - only convert if system type matches
if (fieldId === "f_113" && extractedValue) {
  const d_113Value = mappedData["d_113"]; // ✅ CHECK THIS FIRST
  if (d_113Value === "Heatpump") {
    const f_113_num = parseFloat(extractedValue);
    const h_113 = f_113_num / 3.413;
    mappedData["d_113_eff"] = Math.round(h_113 * 100).toString();
  }
}
```

### **8. StateManager Publication Pattern**
**S07 Pattern** - publish to BOTH Target and Reference StateManagers when system changes:
```javascript
if (window.TEUI?.StateManager) {
  window.TEUI.StateManager.setValue("d_113_eff", newValue.toString(), "system-update");
  window.TEUI.StateManager.setValue(`ref_d_113_eff`, newValue.toString(), "system-update");
  console.log(`[S13] Updated ${selectedSystem}: d_113_eff=${newValue}%`);
}
```

### **9. Field Type Changes**
**Before**: `f_113` and `j_115` were `type: "editable"` or `type: "slider"`
**After**: MUST be `type: "calculated"`
**Check**: Search for `fieldId: "f_113"` and `fieldId: "j_115"` - ensure no `editable` remains

### **10. Testing Edge Cases**
**Must Test**:
- [ ] Switch Gas → Heatpump while d_116=Cooling (j_116 should go from editable → read-only)
- [ ] Import Excel with Gas system + AFUE 0.94, then switch to Heatpump (should preserve and convert)
- [ ] Toggle Reference mode while Target has Gas 75% AFUE (dual-state isolation)
- [ ] Set d_113_eff=49% for Gas (should warn and clamp to 50%)

---

## 🐛 **Troubleshooting Guide**

### **Problem**: Slider doesn't update when changing d_113 dropdown
**Solution**: Verify `handleHeatingSystemChange()` is called with correct event binding
```javascript
// Check event listener setup
const heatingDropdown = document.querySelector('[data-dropdown-id="d_113"]');
heatingDropdown?.addEventListener("change", handleHeatingSystemChange);
```

### **Problem**: j_116 stays editable when d_113=Heatpump
**Solution**: Ensure `updateJ116Editability()` is called AFTER system type change
```javascript
// In handleHeatingSystemChange():
ModeManager.setValue("d_113", selectedSystem, "user-modified");
calculateAll();
updateJ116Editability(); // ✅ Must call this
```

### **Problem**: Legacy Excel import doesn't convert f_113 to d_113_eff
**Solution**: Check ExcelMapper runs AFTER d_113 is mapped
```javascript
// In ExcelMapper.js - ensure d_113 is in mappedData before f_113 conversion
console.log(`[ExcelMapper] d_113=${mappedData["d_113"]}, f_113=${extractedValue}`);
```

### **Problem**: Reference mode shows Target efficiency values
**Solution**: Check StateManager publication uses `ref_` prefix in Reference mode
```javascript
// In Phase 3 - ReferenceState.syncFromGlobalState
const refFieldId = `ref_${fieldId}`;
const globalValue = window.TEUI.StateManager.getValue(refFieldId);
```

### **Problem**: Calculations use old k_52/f_113 values
**Solution**: Clear localStorage and refresh (old state may persist)
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

### **Problem**: CSV export missing d_113_eff column
**Solution**: Verify FileHandler.js exportFields array includes d_113_eff
```javascript
const exportFields = [
  "d_113",
  "d_113_eff", // ✅ Must be here
  "f_113",
  // ...
];
```

---

## 📝 **Phase-by-Phase Commit Strategy**

Follow S07 pattern - single commit after all 8 phases complete:

**Why Not Commit Per Phase?**
- Intermediate states may be broken (e.g., Phase 1 done but Phase 2 not done = broken UI)
- User prefers to test before committing (per `.clinerules` line 65)
- Easier to revert if testing reveals issues

**Commit Checklist** (before final commit):
- [ ] All 8 phases complete
- [ ] All 10 test scenarios passed
- [ ] No console errors on page load
- [ ] Excel import/export round-trip successful
- [ ] Dual-state toggle works (Target ↔ Reference)
- [ ] Backup file created and verified

**Commit Command** (use HEREDOC per `.clinerules`):
```bash
git commit -m "$(cat <<'EOF'
Feat: Consolidate S13 HVAC efficiency inputs (f_113/j_115 → d_113_eff)

[Full commit message from Deliverables section]

🤖 Co-Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Andy & Claude <andy@openbuilding.ca>
EOF
)"
```

---

**Estimated Implementation Time**: 4-6 hours (based on S07 consolidation: 2-3 hours)
**Complexity**: High (conditional j_116 editability + HSPF/COPh relationship)
**Risk Level**: Medium (extensive downstream dependencies in S14/S15/S18)
**Success Criteria**: All 10 test scenarios pass + Excel parity verified + No dual-state contamination
