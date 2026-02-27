# OBJECTIVE TEUI 4.012 - Technical Documentation
- (updated 2025.12.06 for streamlined Pattern A template - SectionXX.js refactored)

> **Active Development Branch: `M-N-COMPLIANCE`**
>
> This document describes the current architecture of the TEUI Calculator 4.012, a dual-state building energy modeling tool for Canadian pre-production energy analysis.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Principles](#core-principles)
3. [State Management](#state-management)
4. [Calculation Engine](#calculation-engine)
   - 4.013 [Refactor Plan: Template Refinement & Pattern Documentation](#4013-refactor-plan-template-refinement--pattern-documentation)
   - 4.014 [Sections 13-15 + Cooling.js Refactor Assessment](#4014-sections-13-15--coolingjs-refactor-assessment)
5. [Module Architecture](#module-architecture)
6. [Graphical Sections](#graphical-sections)
7. [Developer Tools](#developer-tools)
8. [Field Naming Conventions](#field-naming-conventions)
9. [Calculation Flow](#calculation-flow)
10. [File Structure](#file-structure)
11. [Testing & Verification](#testing--verification)
12. [Known Limitations](#known-limitations)

---

## 1. Architecture Overview

OBJECTIVE TEUI 4.012 is a **building energy calculator** for early-phase design (even pre-design) and performance tracking of Canadian buildings. The calculator supports three distinct workflows:

- **🎯 Target Model**: User's proposed design values (equipment efficiency, envelope performance, etc.)
- **📋 Reference Model**: Code minimum values based on selected building standard (from `d_13`)
- **📊 Actual Building**: Real-world performance tracking via utility bills (Electricity, Gas, Water)

**Same geometry, different performance values** - enabling designers to compare proposed designs against code requirements and track actual performance post-construction.

### System Architecture

```
src/
├── core/                    # Core system modules (20+ files)
│   ├── StateManager.js      # Single source of truth for all state
│   ├── Calculator.js        # Dual-engine calculation orchestration
│   ├── FieldManager.js      # UI component management & DOM binding
│   ├── ReferenceValues.js   # Code minimum values database
│   ├── ReferenceManager.js  # Reference state management
│   ├── FileHandler.js       # Import/export (CSV, Excel)
│   ├── ExcelMapper.js       # Excel cell mapping
│   ├── Dependency.js        # Dependency graph visualization engine
│   ├── QCMonitor.js         # Quality control & state validation
│   ├── ZenMaster.js         # Runtime dependency discovery
│   ├── ClimateValues.js     # Weather data for Canadian locations
│   ├── AppendixE.js         # NBC 2020 climate zone calculations
│   ├── Cooling.js           # Cooling load calculations
│   ├── TooltipManager.js    # Context help system
│   ├── Clock.js             # Performance monitoring
│   ├── ReferenceToggle.js   # Target/Reference UI switching
│   ├── ToggleUISync.js      # UI synchronization utilities
│   ├── MobileDetect.js      # Mobile device detection
│   ├── SectionIntegrator.js # Cross-section coordination
│   ├── init.js              # System initialization
│   │
│   └── Parallel Coordinates modules (S18):
│       ├── ParallelCoordinates.js  # Main PC visualization
│       ├── pcConfig.js             # Configuration & metrics
│       ├── pcRendering.js          # D3 rendering engine
│       ├── pcOptimization.js       # Optimization algorithms
│       └── pcFinancials.js         # Financial calculations (Pro)
│
├── sections/                # Calculator sections (19 modules + template)
│   ├── SectionXX.js         # TEMPLATE: Pattern A dual-state template (refactored 2025.12.06)
│   ├── Section01.js         # S01: Key Values
│   ├── Section02.js         # S02: Building Information
│   ├── Section03.js         # S03: Climate Calculations
│   ├── Section04.js         # S04: Actual vs Target Energy & Carbon
│   ├── Section05.js         # S05: CO2e Emissions
│   ├── Section06.js         # S06: Renewable Energy
│   ├── Section07.js         # S07: Water Use (refactored Pattern A reference)
│   ├── Section08.js         # S08: Indoor Air Quality
│   ├── Section09.js         # S09: Occupant + Internal Gains
│   ├── Section10.js         # S10: Radiant Gains
│   ├── Section11.js         # S11: Transmission Losses
│   ├── Section12.js         # S12: Volume & Surface Metrics
│   ├── Section13.js         # S13: Mechanical Loads
│   ├── Section14.js         # S14: TEDI & TELI
│   ├── Section15.js         # S15: TEUI
│   ├── Section16.js         # S16: Sankey Diagram (Heating)
│   ├── Section16C.js        # S16C: Cooling Sankey
│   ├── Section17.js         # S17: Dependency Graph
│   ├── Section18.js         # S18: Parallel Coordinates (Optimize)
│   └── Section19.js         # S19: Notes & Developer Tools
│
├── styles/
│   └── styles.css           # Application styles
│
└── obc/                     # OBC Matrix project (separate tool)
```

### Calculator Sections (User-Facing)

**Section 01-15**: Core energy calculations
1. **Key Values** - Summary metrics displayed above all sections
2. **Building Information** - Project metadata, location, occupancy
3. **Climate Calculations** - HDD, CDD, weather data
4. **Actual vs Target Energy** - Utility bill tracking (Actual building performance)
5. **CO2e Emissions** - Carbon footprint calculations
6. **Renewable Energy** - On-site generation (solar, etc.)
7. **Water Use** - Domestic hot water and consumption
8. **Indoor Air Quality** - Ventilation requirements
9. **Occupant + Internal Gains** - People, equipment, lighting
10. **Radiant Gains** - Solar heat gains through glazing
11. **Transmission Losses** - Envelope heat loss
12. **Volume & Surface Metrics** - Building geometry
13. **Mechanical Loads** - HVAC sizing and energy
14. **TEDI & TELI** - Thermal Energy Demand/Load Intensity
15. **TEUI** - Total Energy Use Intensity

**Section 16-19**: Visualization and developer tools
16. **Sankey Diagram** - Energy flow visualization (heating + cooling)
17. **Dependency Graph** - Interactive D3 visualization of field dependencies
18. **Parallel Coordinates** - Multi-dimensional optimization with parameters, pending upgrades to manipulate geometry & RSI values
19. **Notes & Developer Tools** - QC Monitor, ZenMaster, project notes

### Key Architectural Features

- **Dual-State Management**: Separate Target and Reference calculations without state mixing
- **Single Source of Truth**: StateManager holds all values; DOM displays them
- **Modular Sections**: Self-contained calculation modules (Section01-Section19)
- **Field Naming Convention**:
  - Target fields: `d_12` (base field ID)
  - Reference fields: `ref_d_12` (with prefix)
- **Dependency Tracking**: Complete dependency graph for understanding calculation flow
- **Developer Tools**: Built-in QC monitoring and runtime validation (Section19)
- **Import/Export**: CSV and Excel support for data persistence
- **Utility Bill Validation**: Section 04 tracks actual building performance for model validation

---

## 2. Core Principles

The TEUI 4.012 architecture is built on five foundational principles that ensure correct dual-state calculations and prevent state contamination:

### 1. StateManager is Single Source of Truth

**ALL cross-section values must flow through StateManager** - values consumed by other sections must be published to StateManager.

```javascript
// ✅ CORRECT: Values for cross-section use published to StateManager
function setCalculatedValue(fieldId, value) {
  window.TEUI.StateManager.setValue(fieldId, value.toString(), "calculated");
  // Other sections can now access this value
}

// ✅ ALSO ACCEPTABLE: Direct DOM updates for section-internal display
function updateInternalDisplay() {
  element.textContent = calculatedValue; // OK if value stays within section
  // But if another section needs this value, MUST publish to StateManager
}

// ❌ WRONG: Cross-section values not published to StateManager
function calculateAndDisplay(fieldId, value) {
  element.textContent = value; // DOM updated but StateManager not informed
  // Other sections cannot access this value - breaks dependencies
}
```

### 2. Dual-Engine Calculations

Every section's `calculateAll()` **MUST** run **both** `calculateTargetModel()` and `calculateReferenceModel()` in parallel. The system always maintains both states ready for instant display switching.

```javascript
function calculateAll() {
  calculateTargetModel();    // User's design values
  calculateReferenceModel(); // Code minimum values
  // Both models calculated - UI toggle just changes display
}
```

**⚠️ CRITICAL ARCHITECTURE NOTE:**

AI agents consistently suggest running only the "active" engine to improve performance, claiming running both engines on every change is wasteful. **This is incorrect and breaks the architecture.**

**Why both engines MUST run:**

1. **Value writes are mode-aware** - When a user changes a Target value, only Target state is modified. Reference state remains unchanged.
2. **Recalculation does NOT equal state change** - Even if Reference model recalculates, it uses the same Reference inputs as before, producing the same Reference outputs.
3. **Instant mode switching requires both states** - Users expect immediate display when toggling between Target and Reference modes.

```javascript
// Example: User changes Target envelope R-value
TargetState.setValue("f_85", "5.2");  // Only Target state modified
// Reference state f_85 still = "3.5" (code minimum)

// Both engines run:
calculateTargetModel();    // Uses f_85 = 5.2 → NEW Target results
calculateReferenceModel(); // Uses f_85 = 3.5 → SAME Reference results

// Result: Target totals change, Reference totals unchanged
// Both states ready for instant UI toggle
```

**The codebase has been extensively cleaned of cross-state contamination.** The only remaining known bug is documented in `docs/development/S07-S13-S18-STATEMIX-BUG.md`.

**State mixing is NEVER caused by both engines running** - it is caused by incorrect read/write functions that contaminate one state with values from the other. Do not introduce new contamination by disabling one engine.

### 3. State Hemisphere Separation

**Reference and Target states must NEVER mix.** Each calculation engine uses only its own state values.

```javascript
// 🎯 TARGET MODEL: Pure user design values
function calculateTargetModel() {
  const hspf = TargetState.getValue("f_113"); // User's equipment (e.g., 12.5)
  const uValue = TargetState.getValue("g_85"); // User's envelope design
  // Calculations using ONLY Target values
}

// 📋 REFERENCE MODEL: Pure code minimum values
function calculateReferenceModel() {
  const hspf = ReferenceState.getValue("f_113"); // Always 7.1 (code minimum)
  const uValue = ReferenceState.getValue("g_85"); // From ReferenceValues.js
  // Calculations using ONLY Reference values
}
```

### 4. Field Naming Conventions

```javascript
// Target Model (unprefixed)
d_12         // Building type (Target)
f_113        // Equipment efficiency (Target)

// Reference Model (ref_ prefix)
ref_d_12     // Building type (Reference) - same value, different namespace
ref_f_113    // Equipment efficiency (Reference) - code minimum value

// Dual Storage Pattern - publish to both local and global state
function setTargetValue(fieldId, value) {
  TargetState.setValue(fieldId, value);                              // Local state for UI
  window.TEUI.StateManager.setValue(fieldId, value, "calculated");  // Global for cross-section
}

function setReferenceValue(fieldId, value) {
  ReferenceState.setValue(fieldId, value);                               // Local state for UI
  window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, "calculated"); // Global with prefix
}
```

### 5. UI Toggle is Display-Only

The `switchMode()` function **MUST NOT** trigger calculations. It is a UI filter that only changes which **pre-calculated** state is displayed.

```javascript
// ✅ CORRECT: switchMode only updates display
function switchMode(mode) {
  this.currentMode = mode; // Update mode flag
  this.updateCalculatedDisplayValues(); // Refresh DOM from pre-calculated state
  // NO CALCULATIONS - both states already exist
}

// ❌ WRONG: Never call calculateAll() in switchMode
function switchMode(mode) {
  this.currentMode = mode;
  this.calculateAll(); // ANTI-PATTERN - causes performance issues
}
```

---

### Critical Anti-Patterns to Avoid

#### ❌ State Contamination via Fallbacks

**Never** use Target values as fallback when Reference values are missing:

```javascript
// ❌ WRONG: Reference contaminated with Target data
let value = StateManager.getValue(`ref_${fieldId}`) || StateManager.getValue(fieldId);

// ✅ CORRECT: Strict mode isolation with safe defaults
let value;
if (currentMode === "reference") {
  value = StateManager.getValue(`ref_${fieldId}`);
  if (value === null || value === undefined) {
    value = 0; // Safe default, NEVER Target value
  }
} else {
  value = StateManager.getValue(fieldId) || 0;
}
```

#### ❌ Cross-Section Values Not Published to StateManager

**Section-internal** DOM updates are acceptable, but **cross-section** values MUST be published:

```javascript
// ✅ CORRECT: Section-internal calculations can update DOM directly
function updateSectionDisplay() {
  const internalValue = calculateInternalMetric();
  document.querySelector('[data-field-id="internal_123"]').textContent = internalValue;
  // OK - value only used within this section
}

// ✅ CORRECT: Cross-section values published to StateManager
function calculateExportedValue() {
  const result = performCalculation();
  setTargetValue("d_135", result); // Published - other sections can access
}

// ❌ WRONG: Cross-section value not published
function calculateForOtherSections() {
  const result = performCalculation();
  document.querySelector('[data-field-id="d_135"]').textContent = result;
  // Other sections cannot access this value - breaks dependencies!
}
```

#### ❌ Cross-Section DOM Listener Contamination

Sections should **ONLY** listen to their own input fields via DOM:

```javascript
// ❌ WRONG: S09 listening to S02's d_12 dropdown
dropdown.addEventListener("change", function() {
  ModeManager.setValue("d_12", this.value); // Wrong section's mode!
});

// ✅ CORRECT: Listen to StateManager for external dependencies
window.TEUI.StateManager.addListener("d_12", () => {
  calculateTargetModel(); // Responds to Target changes
});

window.TEUI.StateManager.addListener("ref_d_12", () => {
  calculateReferenceModel(); // Responds to Reference changes
});
```

#### ❌ Disabling One Calculation Engine

**Never disable either engine to "improve performance"**:

```javascript
// ❌ WRONG: Only running active engine
function calculateAll() {
  if (currentMode === "target") {
    calculateTargetModel(); // Reference state becomes stale!
  } else {
    calculateReferenceModel(); // Target state becomes stale!
  }
}

// ✅ CORRECT: Always run both engines
function calculateAll() {
  calculateTargetModel();    // Always updates Target state
  calculateReferenceModel(); // Always updates Reference state
  // Mode-aware writes ensure only changed values trigger state updates
}
```

### Reference Button Copy Functions

The **Reference button** (d_13 selector) provides productivity features for rapidly populating the Reference model from Target values. This accelerates code compliance comparisons by allowing users to quickly establish a Reference baseline.

#### Available Copy Methods

**Implementation status**: Feature complete and tested

```javascript
// ReferenceToggle.js - Reference button copy operations
const COPY_METHODS = {
  SINGLE_FIELD: "Copy single field value",
  ALL_GEOMETRY: "Copy all geometry values",
  SECTION_VALUES: "Copy section values",
  ENVELOPE_VALUES: "Copy envelope values",
  EQUIPMENT_VALUES: "Copy equipment values"
};
```

#### 1. Copy Single Field Value

**Purpose**: Copy one specific field from Target → Reference

**User workflow**:
1. User selects field they want to copy (e.g., d_19 Province)
2. Clicks Reference button → "Copy single field value"
3. Field value transfers from Target to Reference

**Implementation**:
```javascript
function copySingleField(fieldId) {
  const targetValue = window.TEUI.StateManager.getValue(fieldId);
  const refFieldId = `ref_${fieldId}`;

  window.TEUI.StateManager.setValue(refFieldId, targetValue, "user-modified");

  console.log(`[ReferenceButton] Copied ${fieldId}: ${targetValue} → ${refFieldId}`);
}
```

#### 2. Copy All Geometry Values

**Purpose**: Batch copy building geometry (floor area, dimensions, orientation)

**Affected fields**:
```javascript
const geometryFields = [
  "h_15",  // Conditioned Floor Area
  "d_19",  // Province
  "h_19",  // City
  "h_20",  // HDD18
  "h_21",  // CDD18
  "i_21",  // CDD10
  "m_19",  // Latitude
  "l_20",  // Longitude
  "l_21",  // Elevation
  "l_24",  // Relative Humidity
  "g_63",  // Volume
  "d_64",  // Gross Wall Area
  "d_66"   // Perimeter
];
```

**User workflow**:
1. User clicks Reference button → "Copy all geometry values"
2. All geometry fields transfer from Target to Reference
3. Reference model now has same building envelope as Target

**Why useful**: Start Reference with same building geometry, then modify only insulation/equipment for code compliance comparison.

#### 3. Copy Section Values

**Purpose**: Copy all user-editable fields from a specific section (e.g., S02, S03, S11)

**Example - Copy Section 11 (Envelope)**:
```javascript
function copySectionValues(sectionId) {
  // Get all fields from section (e.g., Section11.getFields())
  const section = window.TEUI.SectionModules[sectionId];
  if (!section || !section.getFields) return;

  const fields = section.getFields();
  const fieldIds = Object.keys(fields);

  // Use quarantine pattern for batch operation
  window.TEUI.StateManager.muteListeners();

  try {
    fieldIds.forEach(fieldId => {
      const targetValue = window.TEUI.StateManager.getValue(fieldId);
      const refFieldId = `ref_${fieldId}`;
      window.TEUI.StateManager.setValue(refFieldId, targetValue, "user-modified");
    });

    console.log(`[ReferenceButton] Copied ${fieldIds.length} fields from ${sectionId}`);
  } finally {
    window.TEUI.StateManager.unmuteListeners();
  }

  // Single recalculation after all copies
  window.TEUI.Calculator.calculateAll();
}
```

**Supported sections**: S02-S15 (all Pattern A sections with user inputs)

#### 4. Copy Envelope Values

**Purpose**: Copy all thermal envelope specifications (RSI values, window specs, airtightness)

**Affected fields**:
```javascript
const envelopeFields = [
  // Section 11 - Envelope RSI values
  "f_85",  // Roof RSI
  "f_89",  // Wall RSI
  "f_91",  // Foundation wall RSI
  "f_93",  // Slab RSI
  "f_95",  // Window RSI
  "f_97",  // Door RSI

  // Section 11 - Window specifications
  "f_99",  // Window SHGC
  "f_101", // Window U-value (if used)

  // Section 11 - Airtightness
  "f_103"  // ACH50 (air changes per hour at 50 Pa)
];
```

**User workflow**:
1. User designs high-performance Target envelope (e.g., Passivhaus)
2. Clicks Reference button → "Copy envelope values"
3. Reference starts with same envelope, user then adjusts to code minimum for comparison

**Why useful**: Compare high-performance design against code minimum while keeping all other parameters identical.

#### 5. Copy Equipment Values

**Purpose**: Copy all HVAC/DHW equipment specifications (fuel types, efficiencies)

**Affected fields**:
```javascript
const equipmentFields = [
  // Section 07 - Service Hot Water
  "d_49",  // SHW method
  "d_51",  // SHW fuel type
  "d_52",  // SHW efficiency (COP)
  "k_52",  // SHW efficiency (AFUE)

  // Section 13 - Heating System
  "d_113", // Primary heating system
  "f_113", // Heating efficiency (HSPF)
  "j_115", // Heating efficiency (AFUE)

  // Section 13 - Cooling System
  "d_116", // Cooling system type
  "f_114", // Cooling efficiency (SEER)
  "j_116", // Cooling efficiency (COP)

  // Section 13 - Ventilation
  "d_118", // HRV/ERV type
  "g_118", // Ventilation method
  "d_119"  // SRE% (sensible recovery efficiency)
];
```

**User workflow**:
1. User specifies high-efficiency equipment in Target (e.g., heat pumps)
2. Clicks Reference button → "Copy equipment values"
3. Reference starts with same equipment, user then adjusts to minimum code for comparison

#### State Handling & Validation

**All copy operations use `"user-modified"` state** (not `"over-ridden"`):

```javascript
// Correct: Treated as user intention
window.TEUI.StateManager.setValue("ref_f_85", targetValue, "user-modified");

// Incorrect: Would imply overriding a calculated value
// window.TEUI.StateManager.setValue("ref_f_85", targetValue, "over-ridden");
```

**QC Monitor validation**:
```javascript
// After copy operation, QC Monitor checks:
// 1. Mirror Target divergence (expected - user is setting up comparison)
// 2. Proper ref_ prefix usage
// 3. No Target state contamination
```

**Field lock compatibility**:
```javascript
// Copy operations trigger field lock updates (S07, S13)
// Example: If copying d_113="Heatpump", ensure f_113 (HSPF) unlocks in Reference mode
function copyEquipmentValues() {
  // ... copy equipment fields ...

  // Update field locks for copied fuel types
  const sect13 = window.TEUI.SectionModules.sect13;
  if (sect13?.handleHeatingSystemChangeForGhosting) {
    const ref_d_113 = window.TEUI.StateManager.getValue("ref_d_113");
    // Field lock logic applies to both Target and Reference (shared DOM elements)
    sect13.handleHeatingSystemChangeForGhosting(ref_d_113);
  }
}
```

#### Integration with Import Quarantine Pattern

Reference button copy operations use the same **quarantine pattern** as FileHandler imports:

```javascript
function copyWithQuarantine(fieldIds) {
  console.log("[ReferenceButton] 🔒 COPY QUARANTINE START");
  window.TEUI.StateManager.muteListeners();

  try {
    fieldIds.forEach(fieldId => {
      const targetValue = window.TEUI.StateManager.getValue(fieldId);
      window.TEUI.StateManager.setValue(`ref_${fieldId}`, targetValue, "user-modified");
    });

    console.log(`[ReferenceButton] Copied ${fieldIds.length} fields without cascading`);
  } finally {
    window.TEUI.StateManager.unmuteListeners();
    console.log("[ReferenceButton] 🔓 COPY QUARANTINE END");
  }

  // Single calculateAll() after all copies
  window.TEUI.Calculator.calculateAll();
}
```

**Performance**:
- Without quarantine: 13 fields × 13 cascades = ~2-3 seconds
- With quarantine: 13 fields + 1 cascade = ~0.5 seconds (**6x faster**)

#### User Workflow Example

**Scenario**: User wants to compare Passivhaus design against OBC SB10 5.5-6 minimum

1. **Set up Target model** (Passivhaus design):
   - f_85 (Roof RSI): 14.0
   - f_89 (Wall RSI): 10.0
   - f_95 (Window RSI): 1.5
   - d_113 (Heating): Heatpump
   - f_113 (HSPF): 14.0

2. **Click Reference button** → "Copy all geometry values"
   - Establishes same building size/location in Reference

3. **Click Reference button** → "Copy envelope values"
   - Reference now has Passivhaus envelope

4. **Toggle to Reference mode** and manually adjust to OBC minimum:
   - Change f_85 (Roof RSI): 14.0 → 5.30 (OBC minimum)
   - Change f_89 (Wall RSI): 10.0 → 3.72 (OBC minimum)
   - Change f_95 (Window RSI): 1.5 → 0.35 (OBC minimum)
   - Keep heating equipment same (or adjust to minimum efficiency)

5. **Toggle back to Target** to see comparison:
   - S01 dashboard shows:
     - h_10 (Target TEUI): 28 kWh/m²/year (Passivhaus)
     - e_10 (Reference TEUI): 87 kWh/m²/year (OBC minimum)
     - d_144 (Reduction): 68% improvement

**Time saved**: ~5 minutes vs manually entering all values twice

#### Future Enhancements

**Pending features** (not yet implemented):

1. **Copy presets** (one-click copy scenarios):
   - "Match Target → Reference" (copy everything)
   - "Mirror geometry only" (copy building size/location, let Reference use defaults for equipment)
   - "Code minimum envelope" (copy geometry, set Reference envelope to code minimum automatically)

2. **Selective copy dialog**:
   - Checkbox list of fields to copy
   - Preview before/after values
   - Batch operations with visual feedback

3. **Copy history/undo**:
   - Track copy operations
   - Allow undo of last copy
   - Restore previous Reference state

**Current status**: Core copy functions are feature-complete and tested. Presets and UI enhancements deferred to future release.

---

### Known State Mixing Bug

**ONE remaining known bug exists** and is documented in:
- `docs/development/S07-S13-S18-STATEMIX-BUG.md`

This bug involves S13 (Mechanical Loads) mode switching after S18 (Parallel Coordinates) Decarbonize operations. The codebase has been extensively cleaned of cross-state contamination issues. This remaining bug represents the type of issue we work hard to prevent and eliminate.

---

## 3. State Management

StateManager ([src/core/StateManager.js](src/core/StateManager.js)) is the **single source of truth** for all application data. Every field value, dependency relationship, and state change flows through this centralized module.

### Core API

```javascript
// Get a field value
const value = window.TEUI.StateManager.getValue("d_12"); // Returns current value or null

// Set a field value with state tracking
window.TEUI.StateManager.setValue(
  "d_12",        // Field ID
  "Multi-Unit",  // New value
  "user-modified" // State type
);

// Register a dependency (source → target)
window.TEUI.StateManager.registerDependency(
  "d_12",  // Source field (when this changes...)
  "h_15"   // Target field (...recalculate this)
);

// Add a listener for value changes
window.TEUI.StateManager.addListener("d_12", (newValue, oldValue, fieldId, state) => {
  console.log(`${fieldId} changed from ${oldValue} to ${newValue}`);
  calculateTargetModel(); // Trigger recalculation
});
```

### Field State Types

Every field value has an associated state that tracks its origin:

```javascript
const VALUE_STATES = {
  DEFAULT: "default",           // Original default value
  IMPORTED: "imported",         // Value loaded from CSV/Excel
  USER_MODIFIED: "user-modified", // User changed the value
  OVER_RIDDEN: "over-ridden",   // Overridden by ReferenceValues (when d_13 changes)
  CALCULATED: "calculated",     // Computed by calculation engine
  DERIVED: "derived"            // Derived from another field
};
```

**Why state tracking matters:**

- **3-Tier Reset System** uses state types to determine reset behavior (ie. Restore Baseline in S18)
- **Import quarantine** prevents cascading calculations during bulk data loads
- **QC Monitor** validates state consistency (e.g., calculated fields shouldn't be user-modified)
- **Auto-save** only persists `user-modified` and `imported` values to localStorage

### State Persistence (localStorage)

StateManager automatically saves state to browser localStorage:

```javascript
// Auto-save triggered 1 second after setValue() calls
window.TEUI.StateManager.setValue("d_12", "A-Assembly", "user-modified");
// → Debounced save to localStorage after 1 second

// Manual save
window.TEUI.StateManager.saveState(); // Saves to localStorage immediately

// Load saved state
window.TEUI.StateManager.loadState(); // Restores from localStorage on page load
```

**What gets saved:**
- Only `user-modified` and `imported` fields (keeps storage small)
- Last imported state preserved separately for "Undo Changes" functionality (undo stack can be added as a future project, separate module)
- Pattern A dual-state section storage (`S02_TARGET_STATE`, `S02_REFERENCE_STATE`, etc.)
- Parallel Coordinates capital budget data (note: Future TODO: add 4th row for .csv export of user saved Capital Budget values, currently 3 rows, Header, Target Values, Reference Values)

### Listeners and Observers

**Listeners** respond to specific field changes:

```javascript
// Add listener for a specific field
window.TEUI.StateManager.addListener("d_12", (newValue, oldValue, fieldId, state) => {
  // Triggered when d_12 changes
  calculateTargetModel();
});

// Remove listener
window.TEUI.StateManager.removeListener("d_12", callbackFunction);

// Mute all listeners (import quarantine, or larger field setting operations such as d_13 Standards & Set Values, or S18 'Decarbonize', 'Optimize', etc.)
window.TEUI.StateManager.muteListeners(); // Prevents cascading calculations during import
window.TEUI.StateManager.unmuteListeners(); // Restores normal behavior
```

**Observers** track getValue/setValue calls for debugging:

```javascript
// Add observer (used by ZenMaster for runtime dependency discovery, predominantly used to build Dependency.js but useful for continued development and runtime dependency discovery & validation)
const observer = {
  onGetValue: (fieldId, value) => {
    console.log(`GET: ${fieldId} = ${value}`);
  },
  onSetValue: (fieldId, value, state) => {
    console.log(`SET: ${fieldId} = ${value} (${state})`);
  }
};

window.TEUI.StateManager.addObserver(observer);
window.TEUI.StateManager.removeObserver(observer);
```

### 3-Tier Reset System

StateManager provides progressive reset levels based on current state:

```javascript
// Get current tier (0 = defaults, 1 = user changes, 2 = imported data)
const tier = window.TEUI.StateManager.getResetTier();

// TIER 1: Undo user changes
window.TEUI.StateManager.resetTier1_UndoChanges();
// - If imported data exists → revert to lastImportedState
// - If no import → clear to defaults

// TIER 2: Clear imported data
window.TEUI.StateManager.resetTier2_ClearImport();
// - Clears lastImportedState
// - Clears localStorage
// - Reloads page

// TIER 3: Factory reset
window.TEUI.StateManager.resetTier3_FactoryReset();
// - Clears all state (including Pattern A section storage)
// - Hard reload with cache bust
```

**Reset behavior:**

| Current State | Tier 1 Action | Tier 2 Action | Tier 3 Action |
|--------------|---------------|---------------|---------------|
| Has imported data + user changes | Revert to import | Clear import → defaults | Factory reset |
| Has imported data only | Revert to import | Clear import → defaults | Factory reset |
| Has user changes only | Clear to defaults | (same as Tier 1) | Factory reset |
| Fresh/defaults | No-op | No-op | Factory reset |

### Dual-State Architecture Support

StateManager provides explicit state getters for dual-engine calculations:

```javascript
// For Target model calculations (Column H)
const targetValue = window.TEUI.StateManager.getApplicationValue("f_113");
// Always returns Target state, regardless of UI mode

// For Reference model calculations (Column E)
const refValue = window.TEUI.StateManager.getReferenceValue("f_113");
// Always returns Reference state, regardless of UI mode

// For UI display (mode-aware)
const displayValue = window.TEUI.StateManager.getCurrentDisplayValue("f_113");
// Returns Target or Reference based on current UI toggle
```

**Reference Mode lifecycle:**

```javascript
// Load Reference data for a building standard
const standard = "OBC SB10 5.5-6 Z6";
window.TEUI.StateManager.loadReferenceData(standard);
// 1. Copies application state to activeReferenceDataSet
// 2. Applies Reference Mode defaults from AppendixE
// 3. Overlays standard-specific overrides from ReferenceValues

// Set value in Reference Mode (independently editable fields)
window.TEUI.StateManager.setValueInReferenceMode("h_12", "5000");
// Stores in independentReferenceState, separate from Target values
```

### Debug and Introspection

```javascript
// Get all field IDs
const keys = window.TEUI.StateManager.getAllKeys();
// → ["d_12", "h_15", "f_32", ...]

// Get debug info
const info = window.TEUI.StateManager.getDebugInfo();
// → { fieldCount: 450, dependencyCount: 320, calculatedCount: 180, ... }

// Get specific field info
const fieldInfo = window.TEUI.StateManager.getDebugInfo("d_12");
// → { id: "d_12", Occupancy value: "A-Assembly", state: "user-modified" }

// Export dependency graph for visualization
const graph = window.TEUI.StateManager.exportDependencyGraph("both");
// → { nodes: [...], links: [...] } for Section 17 D3 visualization
```

### Critical Patterns

**✅ CORRECT: Cross-section values published to StateManager**

```javascript
function calculateAndExport() {
  const result = performCalculation();

  // Store in both local state AND global StateManager !AGENT! Provide a better example here from the codebase please!
  TargetState.setValue("d_135", result);  // Local for UI
  window.TEUI.StateManager.setValue("d_135", result, "calculated"); // Global for other sections
}
```

**❌ WRONG: Cross-section values not published**

```javascript
function calculateAndDisplay() {
  const result = performCalculation();

  // Only updates DOM - other sections cannot access this value!
  document.querySelector('[data-field-id="d_135"]').textContent = result;
}
```

**✅ CORRECT: Section-internal (only) calculations can update DOM directly**

```javascript
function updateInternalDisplay() {
  const internalMetric = calculateInternalValue();

  // OK if value stays within section
  element.textContent = internalMetric;
}
```

### Import Quarantine Pattern

During CSV/Excel import, Set Values from d_13, or S18 Optimization Value Setting, listeners are muted to prevent cascading calculations with incomplete data, example:

```javascript
// In FileHandler.js
window.TEUI.StateManager.muteListeners(); // 🔒 Quarantine start

// Bulk import all values
importedData.forEach(([fieldId, value]) => {
  window.TEUI.StateManager.setValue(fieldId, value, "imported");
});

// Sync Pattern A sections from global state
syncAllDualStateSections();

window.TEUI.StateManager.unmuteListeners(); // 🔓 Quarantine end

// NOW trigger calculations with complete data
window.TEUI.Calculator.calculateAll();
```

This prevents intermediate calculations using stale values while data is being loaded.

---

## 4. Calculation Engine

Calculator ([src/core/Calculator.js](src/core/Calculator.js)) is the **"Traffic Cop"** that orchestrates all calculation operations across the entire application. It defines the execution order for section modules and coordinates the dual-engine calculation pattern.

### Core Responsibility

Calculator's primary job is to call each section's `calculateAll()` function in the correct dependency order. It does **NOT** perform calculations itself, sections handle their own math.

```javascript
// Calculator.js - The Traffic Cop
function calculateAll() {
  // Define calculation order based on dependencies
  const calcOrder = [
    "sect02",  // Building Info
    "sect03",  // Climate
    "sect08",  // IAQ
    "sect09",  // Internal Gains
    "sect10",  // Radiant Gains
    "sect11",  // Transmission Losses
    "sect12",  // Volume Metrics
    "sect07",  // Water Use
    "sect13",  // Mechanical Loads
    "sect06",  // Renewable Energy
    "sect14",  // TEDI Summary
    "sect04",  // Actual/Target Energy
    "sect05",  // Emissions
    "sect15",  // TEUI Summary
    "sect16",  // Sankey Diagram
    "sect17",  // Dependency Graph
    "sect01"   // Key Values (Dashboard)
  ];

  // Call each section's calculateAll()
  calcOrder.forEach(sectionKey => {
    const section = window.TEUI.SectionModules?.[sectionKey];
    if (section?.calculateAll) {
      section.calculateAll(); // Each section runs both engines
    }
  });
}
```

### Section Calculation Order

The calculation order is **critical** and based on data dependencies:

```
1. S02 (Building Info) → Establishes geometry, occupancy, location, Energy Prices
2. S03 (Climate) → Needs Occupancy from d_12 of S02 (for Tset Values) and location set in S03 for HDD/CDD
3. S08 (IAQ) → Independent RH% reporting section, Indoor Air Quality Metrics reporting, for future calculations, schedules. Presently feeds S13 Cooling calculations. 
4. S09 (Internal Gains) → Needs occupancy from S02
5. S10 (Radiant Gains) → Solar gains through envelope
6. S11 (Transmission Losses and Gains) → Envelope heat transfer
7. S12 (Volume Metrics) → Geometry calculations, consumes S11 outputs
8. S07 (Water Use) → DHW aka. SHW calculations (simplified now w. single efficiency master slider at d_52)
9. S13 (Mechanical Loads) → HVAC sizing, consumes S03 & S08-S12 outputs
10. S06 (Renewable Energy) → On-site generation, Exemptions and Special Loads (ie. Hockey/Rink Ice refrigeration, Parking Lot Lighting, etc.)
11. S14 (TEDI) → Summary of demand intensity, TELI, CEDI, etc. consumes S09-S13
12. S04 (Energy Summary) → Total energy calculations and Emissions Factors, needs location (S03) and reporting year (S02) for emissions calculations
13. S05 (Emissions) → Embodied Carbon calculations (A1-3), Operational (B6) emissions, consumes S04 outputs
14. S15 (TEUI) → Final energy summary, consumes S14 + many others
15. S16/S17 (Visualizations) → Display-only, consume finalized data
16. S01 (Key Values) → Dashboard display, consumes S15 + S05 outputs, importantly: State Agnostic, displays Reference model values in column E, Target model values in column H, and Actual Building Utility Bill values reported by user in S04. 
```

**Why S01 runs last:**

Section 01 is a **pure display consumer**—it reads final values from S15 and S05 and displays them at the top of the page. Running it last ensures it always shows the most current calculated totals.

### Performance Monitoring

Calculator integrates with Clock ([src/core/Clock.js](src/core/Clock.js)) for performance tracking:

```javascript
function calculateAll() {
  // Start timing
  if (window.TEUI?.Clock?.markCalculationStart) {
    window.TEUI.Clock.markCalculationStart();
  }

  // ... run all sections ...

  // End timing happens in S01 after final h_10 calculation
  // Clock.markCalculationEnd() called from Section01.runAllCalculations()
}
```

**Timing landmarks:**
- User interaction start → Clock.markUserInteractionStart() 
- Calculation start → Clock.markCalculationStart()
- Calculation end → Clock.markCalculationEnd() (in S01)
- Total user interaction time displayed in S19 Developer Tools
- ~200ms initialization time (aim always for improvement not regression) with sub 100ms recalculations after value sets/gets/calculateAll(). 

### Section Module Contract

Every section module MUST export a `calculateAll()` function:

```javascript
// Pattern A section (dual-state aware)
window.TEUI.SectionModules.sect03 = {
  calculateAll: function() {
    calculateTargetModel();    // Column H calculations
    calculateReferenceModel(); // Column E calculations
  },

  // Other exports: getFields, getLayout, initializeEventHandlers
};

// Both engines ALWAYS run - mode toggle only affects DOM display Target or Reference model values already calculated
```

### ⚠️ CRITICAL: Calculation Order for M-N Compliance Sections

**For sections with M-N compliance patterns** (sections that compare Target values against Reference thresholds), the calculation order within `calculateAll()` is **critical**:

```javascript
// ✅ CORRECT - Reference FIRST, Target SECOND
function calculateAll() {
  calculateReferenceModel();   // Publishes ref_* values to StateManager
  calculateTargetModel();       // NOW can read ref_* for compliance calculations
}

// ❌ WRONG - Target FIRST, Reference SECOND
function calculateAll() {
  calculateTargetModel();       // Tries to read ref_* → doesn't exist yet → 0%
  calculateReferenceModel();    // NOW publishes ref_* (too late!)
}
```

**Why This Order Matters:**

1. **Reference calculations** compute values (e.g., `h_49 = 40`) and store to `ReferenceState`
2. Then **publish to StateManager** as `ref_h_49` for cross-mode access
3. **Target compliance calculations** need `ref_h_49` from StateManager to calculate ratios
4. If Target runs first, `ref_h_49` is undefined → `parseNumeric()` returns 0 → compliance shows 0%

**Example from Section07 (Water Use):**

```javascript
function calculateAll() {
  // ✅ S11 PATTERN: Reference first so ref_* values exist before Target compliance runs
  calculateReferenceModel();   // Calculates and publishes ref_h_49, ref_h_50, ref_d_52, ref_d_53
  calculateTargetModel();       // Compliance calculation can now read ref_h_49 for ratio
}

function calculateCompliance(isReferenceCalculation = false) {
  // This helper is called by BOTH engines, but only Target mode needs Reference values
  const m_49_percent = calculateComplianceRatio("h_49", "ref_h_49", isReferenceCalculation);
  // If ref_h_49 doesn't exist yet, ratio = 0/0 = 0%
}

function calculateComplianceRatio(targetField, refField, isReferenceCalculation) {
  if (isReferenceCalculation) {
    return 1.0; // Reference mode: Always 100% (self-comparison)
  } else {
    const targetValue = window.TEUI.parseNumeric(window.TEUI.StateManager.getValue(targetField)) || 0;
    const refValue = window.TEUI.parseNumeric(window.TEUI.StateManager.getValue(refField)) || 0;
    return refValue > 0 ? targetValue / refValue : 0;  // Needs ref_h_49 to exist!
  }
}
```

**Performance Impact:**

Sections with correct Reference-first ordering (S07, S11) are **noticeably snappier** than those with Target-first ordering (S05 before fix) because there's no flash/reflow from displaying 0% → correct values. The calculations run in the correct order on first render.

**Affected Sections:**
- ✅ **S05** (Envelope): Uses `calculateComplianceRatio()` helper
- ✅ **S07** (Water): Uses `calculateComplianceRatio()` helper + Reference-first order
- ✅ **S11** (Embodied Carbon): Original reference implementation with correct order

**Rule of Thumb:**

If your section has M/N compliance columns that compare Target vs Reference values, **always use Reference-first calculation order** in `calculateAll()`. This ensures Reference values are published to StateManager before Target compliance calculations need them.

---

### Cross-Section Dependencies

Calculator doesn't track field-level dependencies (StateManager handles that). Instead, it ensures **section-level** execution order:

```javascript
// Example: S15 depends on outputs from S14
// Calculator guarantees S14 runs before S15

// In S14 (TEDI Summary):
function calculateTargetModel() {
  const tedi = performCalculation();
  window.TEUI.StateManager.setValue("h_126", tedi, "calculated"); // Publish
}

// In S15 (TEUI Summary):
function calculateTargetModel() {
  const tedi = window.TEUI.StateManager.getValue("h_126"); // Consume
  // Use tedi in TEUI calculations
}
```

### Special Case: Cooling Module

Cooling calculations are handled by a separate module ([src/core/Cooling.js](src/core/Cooling.js)) called **directly by S13**:

```javascript
// In Section13 (Mechanical Loads):
function calculateAll() {
  // CRITICAL: Call Cooling module BEFORE running section calculations
  if (window.TEUI?.CoolingCalculations?.calculateAll) {
    window.TEUI.CoolingCalculations.calculateAll("target");
    window.TEUI.CoolingCalculations.calculateAll("reference");
  }

  // Now run S13 calculations that consume cooling outputs
  calculateTargetModel();
  calculateReferenceModel();
}
```

This guarantees cooling values (`d_129`, `m_129`) are ready before S13 uses them. // need to address frequent errors in console wrt missing m_129 values, timing issue to be resolved when switch to topological sort/dependency-ordered calculations

### Dirty Field Recalculation (Deprecated Pattern)

Calculator.js contains legacy `recalculateDirtyFields()` code that is **no longer used**:

```javascript
// ❌ DEPRECATED: Dirty field pattern (not actively used)
function recalculateDirtyFields() {
  const dirtyFields = stateManager.getDirtyFields();
  const calculationOrder = stateManager.getCalculationOrder();
  // ... calculate each dirty field in topological order
}
```

**Current architecture:** Sections are responsible for their own recalculations. StateManager listeners trigger section-level `calculateAll()` calls, not individual field recalculation.

### Convergence and Iterative Calculations

**Current status:** The calculator runs a **single pass** through all sections. There is no iterative convergence loop. 

**Tilt Button:** Was added to complete incomplete calculations, forces further convergence, one press typically solves stuck values. To be resolved w proper dependency ordered calculations. 

**Future consideration:** Some building energy models require iterative solving (e.g., coupled thermal/moisture calculations). If needed, this would be implemented as:

```javascript
function calculateAllWithConvergence() {
  let converged = false;
  let iteration = 0;
  const maxIterations = 100;

  while (!converged && iteration < maxIterations) {
    const stateBefore = captureKeyValues();
    calculateAll();
    const stateAfter = captureKeyValues();

    converged = checkConvergence(stateBefore, stateAfter);
    iteration++;
  }
}
```

This is **not currently implemented** and is not required for the current TEUI calculations.

### Initialization Sequence

Calculator.initialize() is called from [src/core/init.js](src/core/init.js):

```javascript
// In init.js:
TEUI.Calculator.initialize();

// Calculator.initialize() does:
function initialize() {
  // 1. Initialize StateManager
  TEUI.StateManager.initialize();
  TEUI.StateManager.loadState(); // Load from localStorage

  // 2. Render all sections (FieldManager generates DOM)
  TEUI.FieldManager.renderAllSections();

  // 3. Wait for rendering complete event
  document.addEventListener("teui-rendering-complete", function() {
    // Sections initialize event handlers here
    // First calculateAll() happens after all sections ready
  });
}
```

**Initialization order matters:**
1. StateManager must initialize before sections
2. DOM must render before event handlers attach
3. Event handlers must attach before first calculateAll()

### Common Patterns

**Triggering a full recalculation:**

```javascript
// From any section or module:
if (window.TEUI?.Calculator?.calculateAll) {
  window.TEUI.Calculator.calculateAll();
}
```

**Triggering after bulk operations (import, Set Code Values, Decarbonize, etc.):**

```javascript
// Mute listeners during bulk changes
window.TEUI.StateManager.muteListeners();

// ... set many values ...

window.TEUI.StateManager.unmuteListeners();

// NOW trigger single calculateAll()
window.TEUI.Calculator.calculateAll();
```

This prevents N individual recalculations during bulk updates.

### Numerical Stability & Precision

TEUI prioritizes **RSI (R-value SI)** over U-values throughout calculations to maintain numerical precision and avoid cumulative errors.

#### The Problem with U-Values

**U-values are reciprocals** of R-values, creating numerical instability:

```javascript
// U-value precision issues
const rsi_exact = 5.0;
const u_exact = 1 / rsi_exact;  // → 0.2 (exact)

const rsi_typical = 5.1;
const u_typical = 1 / rsi_typical;  // → 0.196078431372549... (repeating decimal)

// Small rounding errors compound across large areas
const roofArea = 300;  // m²
const heatLoss_exact = u_exact * roofArea * 20;    // → 1200 W (exact)
const heatLoss_rounded = 0.196 * roofArea * 20;    // → 1176 W (2% error!)
```

#### Why RSI is Superior for Calculations

**RSI advantages:**
1. **Larger numbers** (RSI 5.0 vs U 0.2) → less susceptible to floating-point errors
2. **Additive** for series assemblies (RSI_total = RSI_1 + RSI_2 + ...) → no division
3. **Integer-friendly** for common values (RSI 3.0, 5.0, 7.0) → exact representation
4. **Avoids repeated reciprocals** (U → RSI → U → RSI) → no cumulative error

**U-value problems:**
1. **Very small numbers** (U 0.2, 0.15, 0.08) → floating-point precision loss
2. **Requires division** for series assemblies → rounding errors
3. **Repeating decimals** for most values (0.196078..., 0.142857...) → truncation errors
4. **Reciprocal cascade** amplifies errors with each conversion

#### Real-World Error Accumulation Example

**Scenario**: Calculate total envelope heat loss for a residential building

```javascript
// Envelope components (typical residential)
const components = [
  { name: "Roof", area: 120, rsi: 9.35 },           // RSI-53 (high performance)
  { name: "Walls", area: 180, rsi: 5.30 },          // RSI-30 (OBC minimum)
  { name: "Foundation", area: 120, rsi: 3.54 },     // RSI-20
  { name: "Windows", area: 30, rsi: 0.70 },         // Triple-pane
  { name: "Doors", area: 5, rsi: 0.88 }             // Insulated steel
];

// METHOD 1: Using U-values (WRONG - accumulates errors)
let totalLoss_uvalue = 0;
components.forEach(comp => {
  const u = 1 / comp.rsi;  // Convert to U-value (introduces rounding)
  const loss = u * comp.area * 20;  // Heat loss at 20°C ΔT
  totalLoss_uvalue += loss;
});
// Result: ~4,247 W (with cumulative rounding errors)

// METHOD 2: Using RSI values (CORRECT - maintains precision)
let totalLoss_rsi = 0;
components.forEach(comp => {
  const loss = (1 / comp.rsi) * comp.area * 20;  // Single division at calc time
  totalLoss_rsi += loss;
});
// Result: ~4,250 W (accurate)

// Error: ~3W difference may seem small, but compounds across:
// - Annual energy calculations (8760 hours)
// - Multiple buildings in portfolio analysis
// - Sensitivity analyses with parameter sweeps
```

#### TEUI Implementation Best Practices

**Internal calculations use RSI:**

```javascript
// Section 11 - Envelope Calculations
const roofRSI = StateManager.getValue("f_85");  // RSI value (e.g., 9.35)
const wallRSI = StateManager.getValue("f_89");  // RSI value (e.g., 5.30)

// Calculate heat loss using RSI (single division per component)
const roofLoss = (roofArea / roofRSI) * hdd18 * 24;  // W/m²·K
const wallLoss = (wallArea / wallRSI) * hdd18 * 24;

// Aggregate losses (no intermediate U-value conversions)
const totalEnvelopeLoss = roofLoss + wallLoss + foundationLoss + windowLoss;
```

**U-values only for display/reporting:**

```javascript
// Display U-value to user (conversion happens ONCE at render time)
function displayUValue(rsi) {
  if (!rsi || rsi === 0) return "—";
  const uValue = 1 / rsi;
  return uValue.toFixed(3);  // e.g., "0.196" (display only)
}

// NEVER store or recalculate using displayed U-value
// Always recalculate from original RSI value
```

**Avoid reciprocal cascades:**

```javascript
// ❌ BAD: Repeated conversions compound errors
const rsi = 5.1;
const u = 1 / rsi;                    // 0.196078...
const rsi_back = 1 / u;               // 5.100000000000001 (floating-point error!)
const u_again = 1 / rsi_back;         // 0.196078431372548 (error compounds)

// ✅ GOOD: Store RSI, calculate U only when needed
const rsi = 5.1;  // Store this
// ... later, if U needed for display:
const u = 1 / rsi;  // Calculate fresh from RSI (single conversion)
```

#### Excel Reference Model Compatibility

TEUI's RSI-first approach matches the Excel reference model calculation methodology:

**Excel calculation pattern** (Section 11 Envelope):
- Column F: RSI values (user inputs)
- Column G: Area (m²)
- Column H: Heat loss = `(G * 24 * HDD18) / F` → **Division by RSI, not multiplication by U**
- Total: Sum of heat losses

**TEUI web app mirrors this:**
```javascript
// Section11.js - calculateEnvelopeLosses()
const heatLoss_i87 = (roofArea * 24 * hdd18) / roofRSI;  // Matches Excel column H
const heatLoss_i89 = (wallArea * 24 * hdd18) / wallRSI;
// ... aggregate losses match Excel exactly
```

This ensures **100% calculation parity** with Excel reference model.

#### Field Naming Convention

TEUI uses consistent RSI-based field naming:

| Field ID | Description | Unit | Type |
|----------|-------------|------|------|
| `f_85` | Roof RSI | m²·K/W | User input |
| `f_89` | Wall RSI | m²·K/W | User input |
| `f_95` | Window RSI | m²·K/W | User input |
| `i_87` | Roof heat loss | kWh/year | Calculated |
| `i_89` | Wall heat loss | kWh/year | Calculated |

**No U-value fields in StateManager** - all thermal resistance stored as RSI.

#### User Input Expectations: Effective RSI Values

**CRITICAL**: Users are expected to provide **effective RSI values** that already include surface film resistances (R_si and R_se) for the specific assembly orientation.

**Typical workflow:**
1. Users model assemblies in external software (e.g., **[Ubakus.de](https://ubakus.de/)** - a detailed 2D parallel path thermal bridge calculator)
2. External software calculates effective RSI including:
   - Assembly materials (insulation, framing, cladding, etc.)
   - Interior surface resistance (R_si) - orientation-specific
   - Exterior surface resistance (R_se)
   - Thermal bridging effects (framing, fasteners)
3. Users enter the **total effective RSI value** into TEUI (Column F in Section11)

**Example - Wall Assembly:**
```
Ubakus.de calculates:
- Insulation RSI: 5.28 m²·K/W (R-30 insulation)
- Interior surface film: 0.13 m²·K/W (horizontal heat flow)
- Exterior surface film: 0.03 m²·K/W
- Framing thermal bridge adjustment: -0.24 m²·K/W
= Effective RSI: 5.20 m²·K/W (user enters this in TEUI)
```

**Why this matters:**
- TEUI calculations use: `Heat Loss = Area × ΔT / RSI_effective`
- The effective RSI already accounts for all resistances
- **No additional R_si is applied in TEUI heat loss calculations**
- This differs from condensation risk calculations (see below)

**Condensation Risk Calculations (Section11 Feature):**

For interior surface temperature calculations (condensation risk assessment), TEUI applies surface resistance **separately** because we need to find the temperature **at the interior surface**, not through the entire assembly:

```javascript
// Condensation formula uses R_si explicitly:
T_surface = T_interior - (U × ΔT × R_si)

// Where:
// - U = 1/RSI_effective (user's effective RSI input)
// - R_si = 0.10, 0.13, or 0.17 depending on orientation
```

**Physics explanation:**
- Heat flux through assembly: `q = U_effective × ΔT` (uses user's effective RSI)
- Temperature drop across interior film: `ΔT_surface = q × R_si`
- Surface temperature: `T_si = T_interior - ΔT_surface`

Even though the user's RSI input includes R_si, we apply it again in the surface temperature formula because we're calculating the temperature drop **across that specific layer**, not the entire assembly.

**Summary:**
- **Heat loss calculations**: Use effective RSI directly (no additional R_si)
- **Condensation calculations**: Apply R_si to find temperature at interior surface
- Users should provide effective RSI values from tools like Ubakus.de that account for real-world thermal bridging and orientation-specific surface resistances

#### Performance Implications

**Numerical stability improves performance:**

```javascript
// Clock.js timing shows RSI calculations are FASTER:
// - Fewer floating-point operations (no reciprocals in loops)
// - Better CPU cache utilization (larger numbers)
// - Fewer precision-loss edge cases to handle

// Example: Envelope calculation timing
const start = performance.now();

// RSI-based calculation
components.forEach(comp => {
  totalLoss += (comp.area * 24 * hdd18) / comp.rsi;  // Fast division
});

const elapsed = performance.now() - start;
// Typical: ~0.5ms for 450 field full calculation
```

#### Summary: RSI vs U-Value Decision Matrix

| Criterion | RSI | U-Value |
|-----------|-----|---------|
| **Numerical precision** | ✅ Excellent (larger numbers) | ❌ Poor (small numbers, repeating decimals) |
| **Floating-point stability** | ✅ Stable (integer-friendly) | ❌ Unstable (reciprocal cascade errors) |
| **Additive operations** | ✅ Simple (RSI_total = Σ RSI) | ❌ Complex (1/U_total = Σ 1/U) |
| **Excel parity** | ✅ Direct match | ⚠️ Requires conversion |
| **User familiarity** | ⚠️ Canadian standard, but less intuitive | ✅ Familiar to many users |
| **Display/reporting** | ⚠️ Larger numbers (R-30 = RSI 5.3) | ✅ Smaller numbers (U = 0.189) |
| **Internal calculations** | ✅ **TEUI uses RSI** | ❌ Avoid |
| **Display only** | ⚠️ Optional | ✅ Calculate from RSI when needed |

**TEUI design principle:** Calculate in RSI, display in whatever units the user prefers (currently RSI by default, U-value conversion available if needed).

---

## 5. Module Architecture

Section modules are the building blocks of the calculator. Each section is a **self-contained IIFE (Immediately Invoked Function Expression)** that encapsulates its own state, calculations, and UI management.

### Pattern A Template (SectionXX.js)

**Updated: 2025.12.06** - The canonical template for new section modules is [src/sections/SectionXX.js](../src/sections/SectionXX.js).

**Key Features** (728 lines, streamlined from 1353):
- **Modern structure**: 9 logical blocks (Field Definitions → Lifecycle)
- **Section07 best practices**: Proven dual-state patterns from Water Use module
- **47% reduction**: Removed verbose tutorial comments, kept critical architecture notes
- **Working reference**: Copy-paste ready with example field types (dropdown, editable, slider, M-N compliance)
- **Progressive disclosure**: Critical code first, implementation details follow

**Structure Overview**:
```
1. Field Definitions (sectionRows)     - Single source of truth
2. Accessor Methods                    - FieldManager integration
3. State Objects                       - TargetState/ReferenceState (slim, focused)
4. Mode Manager                        - Facade coordination
5. Helper Functions                    - Grouped by purpose (section/global/compliance)
6. Calculation Engines                 - Dual-engine pattern (Reference-first for M-N)
7. UI Management                       - Ghosting/visibility
8. Event Handling                      - All handlers together
9. Lifecycle & Public API              - Clean exports
```

**Reference Implementations**:
- [Section07.js](../src/sections/Section07.js) - Latest refactored Pattern A (Water Use, M-N compliance)
- [Section11.js](../src/sections/Section11.js) - Complex calculations (Envelope)
- [Section13.js](../src/sections/Section13.js) - Multi-mode calculations (Mechanical Loads)

### IIFE Module Pattern

All sections use browser-compatible IIFE pattern (no ES6 modules):

```javascript
// Section03.js - IIFE Pattern
window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

window.TEUI.SectionModules.sect03 = (function() {
  // Private variables and functions
  let privateVariable = "not accessible outside";

  function privateFunction() {
    // Section-internal logic
  }

  // Public API (required exports)
  return {
    getFields: function() { /* ... */ },
    getLayout: function() { /* ... */ },
    calculateAll: function() { /* ... */ },
    initializeEventHandlers: function() { /* ... */ },

    // Pattern A exports (dual-state sections)
    TargetState: TargetState,
    ReferenceState: ReferenceState,
    ModeManager: ModeManager
  };
})();
```

**Why IIFE?**
- Browser-compatible (no build step required, runs locally/air-gapped once loaded)
- Encapsulation without ES6 modules
- Prevents global namespace pollution
- Compatible with existing codebase architecture

### Required Exports

Every section module MUST export these four functions:

#### 1. getFields()

Returns field definitions for FieldManager to render:

```javascript
getFields: function() {
  return {
    d_19: {
      id: "d_19",
      type: "dropdown",
      label: "Province",
      defaultValue: "Ontario",
      options: ["Ontario", "BC", "Alberta", /* ... */]
    },
    h_19: {
      id: "h_19",
      type: "dropdown",
      label: "City",
      defaultValue: "Alexandria",
      dependencies: ["d_19"] // City options depend on province
    },
    // ... all field definitions
  };
}
```

#### 2. getLayout()

Returns HTML structure for the section:

```javascript
getLayout: function() {
  return `
    <div class="section-header">
      <h2>Section 03: Climate Calculations</h2>
      <button class="mode-toggle" data-section="sect03">
        <span class="toggle-indicator">Target</span>
      </button>
    </div>
    <div class="section-content">
      <!-- Field containers rendered by FieldManager -->
      <div data-field-id="d_19"></div>
      <div data-field-id="h_19"></div>
    </div>
  `;
}
```

#### 3. calculateAll()

Runs both calculation engines (dual-engine pattern):

```javascript
calculateAll: function() {
  calculateTargetModel();    // Column H calculations
  calculateReferenceModel(); // Column E calculations
  // NO conditionals - BOTH always run
}
```

#### 4. initializeEventHandlers()

Attaches DOM event listeners after rendering:

```javascript
initializeEventHandlers: function() {
  // Attach listeners to section's own input fields
  const provinceDropdown = document.querySelector('[data-field-id="d_19"] select');
  provinceDropdown?.addEventListener("change", (e) => {
    ModeManager.setValue("d_19", e.target.value);
    calculateAll(); // Trigger recalculation
  });

  // Listen to external dependencies via StateManager
  window.TEUI.StateManager.addListener("d_13", () => {
    calculateAll(); // Respond to standard changes
  });
}
```

### Pattern A: Dual-State Sections

Pattern A sections maintain **isolated Target and Reference states** with ModeManager coordination. Most sections (S02-S15) use this pattern.

#### Three Core Components

**1. TargetState Object**

```javascript
const TargetState = {
  state: {},                    // Internal state storage
  listeners: {},                // Field change listeners

  initialize: function() {
    // Load from localStorage or set defaults
    const saved = localStorage.getItem("S03_TARGET_STATE");
    this.state = saved ? JSON.parse(saved) : this.setDefaults();
  },

  setDefaults: function() {
    return {
      d_19: getFieldDefault("d_19"), // Single source of truth
      h_19: getFieldDefault("h_19"),
      // ... all user-editable fields
    };
  },

  getValue: function(fieldId) {
    return this.state[fieldId];
  },

  setValue: function(fieldId, value, source = "user") {
    this.state[fieldId] = value;
    this.notifyListeners(fieldId, value);
    this.saveState();
  },

  saveState: function() {
    localStorage.setItem("S03_TARGET_STATE", JSON.stringify(this.state));
  },

  syncFromGlobalState: function(fieldIds) {
    // Import quarantine: sync from global StateManager
    fieldIds.forEach(fieldId => {
      const value = window.TEUI.StateManager.getValue(fieldId);
      if (value !== null) this.setValue(fieldId, value, "imported");
    });
  }
};
```

**2. ReferenceState Object**

Identical structure to TargetState, but with `ref_` prefix for global sync:

```javascript
const ReferenceState = {
  // ... same structure as TargetState ...

  syncFromGlobalState: function(fieldIds) {
    fieldIds.forEach(fieldId => {
      const refFieldId = `ref_${fieldId}`;
      const value = window.TEUI.StateManager.getValue(refFieldId);
      if (value !== null) this.setValue(fieldId, value, "imported");
    });
  }
};
```

**3. ModeManager Facade**

Coordinates between Target and Reference states:

```javascript
const ModeManager = {
  currentMode: "target", // Current UI display mode

  initialize: function() {
    TargetState.initialize();
    ReferenceState.initialize();
  },

  switchMode: function(mode) {
    if (mode !== "target" && mode !== "reference") return;
    this.currentMode = mode;
    this.refreshUI();              // Update input field values
    this.updateCalculatedDisplayValues(); // Update calculated displays
    this.syncToggleUI(mode);       // Update toggle button
  },

  getCurrentState: function() {
    return this.currentMode === "target" ? TargetState : ReferenceState;
  },

  getValue: function(fieldId) {
    return this.getCurrentState().getValue(fieldId);
  },

  setValue: function(fieldId, value) {
    // Update local state
    this.getCurrentState().setValue(fieldId, value);

    // Sync to global StateManager (dual storage pattern)
    if (this.currentMode === "target") {
      window.TEUI.StateManager.setValue(fieldId, value, "user-modified");
    } else {
      window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, "user-modified");
    }
  },

  refreshUI: function() {
    // Update all input fields to show current state
    const state = this.getCurrentState();
    Object.keys(state.state).forEach(fieldId => {
      const element = document.querySelector(`[data-field-id="${fieldId}"] input, [data-field-id="${fieldId}"] select`);
      if (element) element.value = state.getValue(fieldId);
    });
  },

  updateCalculatedDisplayValues: function() {
    // Update all calculated field displays for current mode
    // (calculations already done by calculateAll())
  }
};
```

### Calculation Engine Pattern

Pattern A sections implement dual calculation engines:

```javascript
// Private calculation functions
function calculateTargetModel() {
  // Read from TargetState
  const province = TargetState.getValue("d_19");
  const city = TargetState.getValue("h_19");

  // Perform calculations
  const hdd = lookupClimateData(province, city).HDD;

  // Write to TargetState (local)
  TargetState.setValue("d_20", hdd, "calculated");

  // Write to global StateManager (for other sections)
  window.TEUI.StateManager.setValue("d_20", hdd, "calculated");
}

function calculateReferenceModel() {
  // Read from ReferenceState
  const province = ReferenceState.getValue("d_19");
  const city = ReferenceState.getValue("h_19");

  // Perform calculations
  const hdd = lookupClimateData(province, city).HDD;

  // Write to ReferenceState (local)
  ReferenceState.setValue("d_20", hdd, "calculated");

  // Write to global StateManager with ref_ prefix
  window.TEUI.StateManager.setValue("ref_d_20", hdd, "calculated");
}

// Public export
function calculateAll() {
  calculateTargetModel();
  calculateReferenceModel();
}
```

### Event Handler Patterns

**DOM Listeners (Own Fields Only)**

Sections only listen to their own input fields via DOM:

```javascript
function initializeEventHandlers() {
  // ✅ CORRECT: Listen to own dropdown
  const dropdown = document.querySelector('[data-field-id="d_19"] select');
  dropdown?.addEventListener("change", (e) => {
    ModeManager.setValue("d_19", e.target.value);
    calculateAll();
  });

  // ❌ WRONG: Don't listen to other sections' fields via DOM
  // const otherDropdown = document.querySelector('[data-field-id="d_12"] select');
}
```

**StateManager Listeners (External Dependencies)**

For fields owned by other sections, always use StateManager:

```javascript
function initializeEventHandlers() {
  // Listen to d_13 (owned by S02) via StateManager
  window.TEUI.StateManager.addListener("d_13", () => {
    calculateTargetModel(); // Recalculate when standard changes
  });

  window.TEUI.StateManager.addListener("ref_d_13", () => {
    calculateReferenceModel(); // Recalculate Reference when ref_d_13 changes
  });
}
```

### Traditional Sections (Non-Pattern A)

Some sections (S01, S16, S17, S18, S19) as data consumers not calculators don't need dual-state isolation:

```javascript
// Section01.js - Simple pattern
window.TEUI.SectionModules.sect01 = (function() {
  function calculateAll() {
    // S01 is display-only, reads from StateManager
    const tedi = window.TEUI.StateManager.getValue("h_126");
    const ghgi = window.TEUI.StateManager.getValue("h_140");

    // Update display
    updateDashboard(tedi, ghgi);
  }

  return {
    getFields: function() { /* ... */ },
    getLayout: function() { /* ... */ },
    calculateAll: calculateAll,
    initializeEventHandlers: function() { /* ... */ }
  };
})();
```

**When to use simple pattern:**
- Display-only sections (S01)
- Visualization sections (S16, S17, S18, S19)
- Sections with no user-editable fields
- Sections that only consume, never produce state

### Helper Functions

Pattern A sections use standardized helper functions:

```javascript
// Get field default from FieldManager (single source of truth)
function getFieldDefault(fieldId) {
  const fieldDef = window.TEUI.FieldManager?.getField(fieldId);
  return fieldDef?.defaultValue || "";
}

// Helper to retrieve numeric values safely
function getNumericValue(fieldId, defaultValue = 0) {
  const value = ModeManager.getValue(fieldId);
  return window.TEUI.parseNumeric(value, defaultValue);
}

// Helper to set calculated values (dual storage)
function setCalculatedValue(fieldId, value) {
  const state = ModeManager.getCurrentState();
  state.setValue(fieldId, value, "calculated");

  const prefix = ModeManager.currentMode === "reference" ? "ref_" : "";
  window.TEUI.StateManager.setValue(`${prefix}${fieldId}`, value, "calculated");
}
```

### Import Quarantine Integration

Pattern A sections support import quarantine via `syncFromGlobalState()`:

```javascript
// In FileHandler.js after Excel import:
window.TEUI.StateManager.muteListeners();

// Import all values to global StateManager
importedData.forEach(([fieldId, value]) => {
  window.TEUI.StateManager.setValue(fieldId, value, "imported");
});

// Sync Pattern A sections from global state
const patternASections = ["sect02", "sect03", /* ... */ "sect15"];
patternASections.forEach(sectionKey => {
  const section = window.TEUI.SectionModules[sectionKey];

  // Get list of user-editable fields for this section
  const fields = Object.keys(section.getFields()).filter(isUserEditable);

  // Sync isolated states from global StateManager
  section.TargetState.syncFromGlobalState(fields);
  section.ReferenceState.syncFromGlobalState(fields);
});

window.TEUI.StateManager.unmuteListeners();
window.TEUI.Calculator.calculateAll();
```

This prevents stale isolated state after bulk imports.

### Section Registration

Sections self-register on script load:

```javascript
// In Section03.js (end of file):
window.TEUI.SectionModules.sect03 = (function() {
  // ... entire module ...
  return { /* public API */ };
})();

// No explicit registration call needed - IIFE runs immediately
```

Calculator finds sections via namespace:

```javascript
// In Calculator.js:
const section = window.TEUI.SectionModules?.["sect03"];
if (section?.calculateAll) {
  section.calculateAll();
}
```

### FieldManager: UI Component Management

FieldManager ([src/core/FieldManager.js](src/core/FieldManager.js)) coordinates **section-specific field definitions** and **DOM rendering**. It acts as the bridge between declarative field definitions in section modules and the actual HTML rendered in the browser.

#### Core Responsibilities

**1. Field Registry** - Consolidates field definitions from all sections:

```javascript
// Section modules export field definitions
const fields = {
  d_19: {
    id: "d_19",
    type: "dropdown",
    label: "Province",
    defaultValue: "Ontario",
    options: ["Ontario", "BC", "Alberta", "Quebec", /* ... */]
  },
  h_15: {
    id: "h_15",
    type: "number",
    label: "Conditioned Floor Area",
    defaultValue: "1000",
    unit: "m²"
  }
};

// FieldManager aggregates all section field definitions
window.TEUI.FieldManager.registerFields(sectionKey, fields);
```

**2. Layout Generation** - Renders DOM elements based on field definitions:

```javascript
// FieldManager.renderAllSections() creates DOM structure
function renderAllSections() {
  const sections = ["sect01", "sect02", /* ... */ "sect18"];

  sections.forEach(sectionKey => {
    const module = window.TEUI.SectionModules[sectionKey];
    if (!module) return;

    // Get field definitions and layout from section
    const fields = module.getFields();
    const layout = module.getLayout();

    // Render section HTML
    const container = document.getElementById(sectionKey);
    container.innerHTML = renderSectionHTML(fields, layout);

    // Fire event for section initialization
    document.dispatchEvent(new CustomEvent("teui-section-rendered", {
      detail: { sectionKey }
    }));
  });
}
```

**3. Field Lookup API** - Used throughout codebase for field validation:

```javascript
// QC Monitor checks if field exists
const fieldDef = window.TEUI.FieldManager.getField("d_12");
if (!fieldDef) {
  console.warn("Undefined field: d_12");
}

// Get all fields for dependency analysis
const allFields = window.TEUI.FieldManager.getAllFields();
// → { d_12: {...}, h_15: {...}, f_85: {...}, ... }
```

**4. Field Type Rendering**

FieldManager supports multiple field types with consistent rendering:

| Field Type | HTML Element | Use Case |
|------------|--------------|----------|
| `"dropdown"` | `<select>` | Building type, fuel type, location |
| `"number"` | `<input type="number">` | Numeric inputs (area, RSI values) |
| `"editable"` | `<div contenteditable>` | User-editable calculated fields |
| `"calculated"` | `<div>` (read-only) | Display-only outputs |
| `"label"` | `<span>` | Static text labels |

**Example field definition and rendered output:**

```javascript
// Field definition in Section02.js
{
  id: "d_12",
  type: "dropdown",
  label: "Building Type",
  defaultValue: "Multi-Unit",
  options: ["Multi-Unit", "Single-Family", "Office", "Retail"],
  classes: ["user-input"]
}

// Rendered HTML by FieldManager
<div class="field-container" data-field-id="d_12">
  <label>Building Type</label>
  <select class="user-input" data-field-id="d_12">
    <option value="Multi-Unit" selected>Multi-Unit</option>
    <option value="Single-Family">Single-Family</option>
    <option value="Office">Office</option>
    <option value="Retail">Retail</option>
  </select>
</div>
```

#### Rendering Pipeline

The FieldManager rendering pipeline follows this sequence:

```
1. index.html loads → DOMContentLoaded fires
2. init.js calls FieldManager.renderAllSections()
3. For each section:
   a. Get field definitions (module.getFields())
   b. Get layout structure (module.getLayout())
   c. Generate HTML with proper data attributes
   d. Insert into DOM at section container
   e. Fire "teui-section-rendered" event
4. Sections attach event handlers (initializeEventHandlers)
5. StateManager loads saved values (loadState)
6. Calculator runs first calculateAll()
```

**Why this matters:**

- **Single source of truth** for field metadata (type, label, defaultValue)
- **Consistent rendering** across all sections
- **Validation support** (QC Monitor, ZenMaster can query field registry)
- **DOM-agnostic section logic** (sections define fields, FieldManager handles HTML)

### Contenteditable Input Pattern

User-editable numeric fields use the **contenteditable pattern** for enhanced UX. This provides Excel-like editing behavior with immediate visual feedback and forgiving interaction.

#### Field Definition

User-editable fields are defined with `type: "editable"` and typically include `classes: ["user-input"]`:

```javascript
// In section module's getFields()
{
  id: "i_41",
  type: "editable",
  label: "Override Value",
  defaultValue: "0",
  classes: ["user-input"]
}

// Rendered by FieldManager:
<div class="field-container" data-field-id="i_41">
  <label>Override Value</label>
  <div contenteditable="true"
       class="user-input"
       data-field-id="i_41">0</div>
</div>
```

#### Standard Event Handler Pattern

Sections implement a standardized handler for contenteditable fields:

```javascript
// In Section11.js initializeEventHandlers()
function initializeEventHandlers() {
  // Define handler inside module scope
  function handleEditableBlur(event) {
    const fieldId = this.getAttribute("data-field-id");
    const rawValue = this.textContent.trim();

    // Parse numeric value
    const numericValue = window.TEUI.parseNumeric(rawValue, 0);

    // Update StateManager (triggers recalculation)
    ModeManager.setValue(fieldId, numericValue.toString());

    // Optional: Reformat display
    this.textContent = window.TEUI.formatNumber(numericValue, "number-2dp");
  }

  // Attach to all editable fields in this section
  const editableFields = document.querySelectorAll(
    '[data-field-id^="i_"] .user-input[contenteditable="true"]'
  );

  editableFields.forEach(field => {
    // Blur event: Save changes
    field.addEventListener("blur", handleEditableBlur.bind(field));

    // Enter key: Prevent newline, trigger blur (save)
    field.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        this.blur(); // Triggers blur handler above
      }
    });

    // Optional: Focus styling
    field.addEventListener("focus", function() {
      this.classList.add("editing");
      this.dataset.originalValue = this.textContent.trim();
    });

    field.addEventListener("focusout", function() {
      this.classList.remove("editing");
    });
  });
}
```

#### CSS State Classes

Visual feedback is provided through CSS classes (defined in [src/styles/styles.css](src/styles/styles.css)):

```css
/* Default state: Grey italic placeholder */
.user-input:not(.user-modified) {
  color: #6c757d;
  font-style: italic;
}

/* Active editing: Blue highlight */
.user-input.editing {
  background-color: #e6f7ff;
  outline: 2px solid #007bff;
  font-style: normal;
}

/* Committed change: Blue confident text */
.user-input.user-modified {
  color: #007bff;
  font-weight: 500;
  font-style: normal;
}
```

#### UX Benefits

**Forgiving interaction:**
- Accidental clicks revert on blur if no changes made
- Escape key can cancel edit (via dataset.originalValue comparison)
- Enter key commits immediately (Excel-like)

**Visual feedback:**
- Grey italic = default/placeholder value
- Blue highlight = actively editing
- Blue bold = user has modified this field

**No type conflicts:**
- Using `type: "editable"` instead of `type: "number"` avoids browser number input quirks
- Allows custom formatting (e.g., "1,234.56" display while storing "1234.56")
- Works reliably with Enter key handling and import operations

#### Common Implementation Sites

Contenteditable pattern used extensively in:
- **Section 05** (CO2e Emissions): `i_41` override values
- **Section 07** (Water Use): User-editable efficiency fields
- **Section 11** (Envelope): RSI value overrides
- **Section 13** (Mechanical Loads): Equipment efficiency adjustments
- **Section 19** (Notes): `s18_notes` project notes field

### Conditional Field Locking (Ghosting)

Certain fields are **conditionally locked** (disabled) based on the value of other fields. This prevents users from editing fields that are irrelevant or overridden by system calculations.

#### Common Use Cases

**1. Fuel-type dependent efficiency fields** (Section 07, Section 13):

When user selects a fuel type dropdown, efficiency fields lock/unlock based on compatibility:

```javascript
// Section 13: Heating system efficiency fields
d_113: "Primary Heating System" dropdown
  ↓ (when set to "Heatpump")
f_113: "HSPF" → UNLOCKED (heat pump efficiency)
j_115: "AFUE" → LOCKED (furnace efficiency, N/A for heat pumps)

d_113: (when set to "Gas Furnace")
f_113: "HSPF" → LOCKED (N/A for furnaces)
j_115: "AFUE" → UNLOCKED (furnace efficiency)
```

**2. Calculation method selection** (Section 07):

```javascript
d_49: "SHW Method" dropdown
  ↓ (when set to "Simplified")
d_52: "Master Efficiency Slider" → UNLOCKED
[All detailed fields] → LOCKED

d_49: (when set to "Detailed")
d_52: "Master Efficiency Slider" → LOCKED
[Detailed fuel/equipment fields] → UNLOCKED
```

#### Implementation Pattern

Sections implement field locking via DOM manipulation:

```javascript
// In Section13.js
function handleHeatingSystemChangeForGhosting(systemType) {
  const hspfField = document.querySelector('[data-field-id="f_113"]');
  const afueField = document.querySelector('[data-field-id="j_115"]');

  if (systemType === "Heatpump" || systemType === "Air Source Heat Pump") {
    // Unlock HSPF, lock AFUE
    hspfField.classList.remove("ghosted");
    hspfField.removeAttribute("contenteditable");
    hspfField.setAttribute("contenteditable", "true");

    afueField.classList.add("ghosted");
    afueField.removeAttribute("contenteditable");
  } else if (systemType === "Gas Furnace" || systemType === "Electric Baseboard") {
    // Lock HSPF, unlock AFUE
    hspfField.classList.add("ghosted");
    hspfField.removeAttribute("contenteditable");

    afueField.classList.remove("ghosted");
    afueField.setAttribute("contenteditable", "true");
  }
}

// Trigger on dropdown change
const heatingSystemDropdown = document.querySelector('[data-field-id="d_113"] select');
heatingSystemDropdown?.addEventListener("change", (e) => {
  handleHeatingSystemChangeForGhosting(e.target.value);
  calculateAll();
});
```

#### CSS Styling

Locked fields are styled with the `.ghosted` class:

```css
/* Locked/disabled field appearance */
.ghosted {
  background-color: #f0f0f0 !important;
  color: #999 !important;
  cursor: not-allowed !important;
  pointer-events: none; /* Prevents interaction */
  font-style: italic;
}
```

#### Integration with Reference Button Copy

When copying equipment values from Target → Reference (Reference Button functions), field locks must update for the Reference state:

```javascript
// In ReferenceToggle.js copyEquipmentValues()
function copyEquipmentValues() {
  // ... copy d_113, f_113, j_115 values ...

  // Update field locks for copied fuel types
  const sect13 = window.TEUI.SectionModules.sect13;
  if (sect13?.handleHeatingSystemChangeForGhosting) {
    const ref_d_113 = window.TEUI.StateManager.getValue("ref_d_113");

    // Field lock logic applies to both Target and Reference (shared DOM elements)
    sect13.handleHeatingSystemChangeForGhosting(ref_d_113);
  }
}
```

**Note:** Field locking is a **DOM-only operation** and does not modify StateManager values. Locked fields retain their values in state; they are simply not editable in the UI.

### styles.css Architecture

TEUI uses a **consolidated CSS file** ([src/styles/styles.css](src/styles/styles.css)) with semantic class organization for consistent styling across all sections.

#### File Organization

The CSS file is organized into logical sections:

```css
/* ================================
   1. GLOBAL RESETS & BASE STYLES
   ================================ */
* { box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; }

/* ================================
   2. LAYOUT & GRID SYSTEM
   ================================ */
.section-container { display: grid; grid-template-columns: repeat(14, 1fr); }
.field-container { padding: 8px; }

/* ================================
   3. USER INPUT STATES
   ================================ */
.user-input { /* Base editable field styles */ }
.user-input:not(.user-modified) { /* Default/placeholder state */ }
.user-input.editing-intent { /* Active editing */ }
.user-input.user-modified { /* Committed change */ }

/* ================================
   4. FIELD LOCKING (GHOSTING)
   ================================ */
.ghosted { /* Disabled/locked fields */ }

/* ================================
   5. REFERENCE MODE STYLING
   ================================ */
.reference-mode .field-container { /* Reference-specific styling */ }
[data-field-id^="ref_"] { /* Reference field indicators */ }

/* ================================
   6. SECTION-SPECIFIC OVERRIDES
   ================================ */
#section16 .sankey-container { /* S16 Sankey diagram */ }
#section17 .dependency-graph { /* S17 force-directed graph */ }
#section18 .parallel-coordinates { /* S18 optimization view */ }

/* ================================
   7. VISUALIZATION COMPONENTS
   ================================ */
.sankey-node { /* D3 Sankey nodes */ }
.pc-axis { /* Parallel coordinates axes */ }
.dependency-link { /* Graph links */ }
```

#### User Input State Classes

The **3-state visual system** for user inputs:

**State 1: Default/Placeholder** (grey italic)

```css
.user-input:not(.user-modified) {
  color: #6c757d;           /* Muted grey */
  font-style: italic;        /* Italicized to indicate placeholder */
  background-color: #f8f9fa; /* Light grey background */
}
```

**State 2: Active Editing** (blue highlight)

```css
.user-input.editing-intent {
  color: #212529;            /* Dark text for readability */
  background-color: #e6f7ff; /* Light blue highlight */
  outline: 2px solid #007bff; /* Blue border */
  font-style: normal;        /* Remove italic */
  transition: all 0.2s ease; /* Smooth transition */
}
```

**State 3: User Modified** (blue confident)

```css
.user-input.user-modified {
  color: #007bff;            /* Blue text */
  font-weight: 500;          /* Medium weight */
  font-style: normal;        /* Remove italic */
  background-color: #ffffff; /* White background */
}
```

**UX Philosophy:**

- **Grey italic** = "This is a default value, you haven't touched it yet"
- **Blue highlight** = "You're editing this right now"
- **Blue confident** = "You've customized this value"

#### Reference Mode Styling

When user toggles to Reference mode, UI provides visual distinction:

```css
/* Reference mode toggle indicator */
.mode-toggle.reference-active {
  background-color: #28a745; /* Green = Reference mode */
  color: white;
}

.mode-toggle.target-active {
  background-color: #007bff; /* Blue = Target mode */
  color: white;
}

/* Reference field highlighting (Column E) */
[data-field-id^="ref_"] {
  border-left: 3px solid #28a745; /* Green border for Reference fields */
}

/* Reference mode section styling */
body.reference-mode .section-content {
  background-color: #f0fff4; /* Subtle green tint */
}
```

#### Conditional Ghosting Styles

Locked/disabled fields use consistent styling:

```css
.ghosted,
.field-locked,
[contenteditable="false"].user-input {
  background-color: #f0f0f0 !important;
  color: #999 !important;
  cursor: not-allowed !important;
  pointer-events: none;
  font-style: italic;
  opacity: 0.6;
}

/* Prevent interaction with locked dropdowns */
select.ghosted {
  pointer-events: none;
  opacity: 0.5;
}
```

#### Grid Layout System

TEUI uses CSS Grid for Excel-like column alignment:

```css
/* 14-column grid matching Excel columns A-N */
.section-container {
  display: grid;
  grid-template-columns:
    minmax(120px, 1fr)  /* Column A: Labels */
    repeat(13, minmax(80px, 1fr)); /* Columns B-N: Data */
  gap: 4px;
  padding: 16px;
}

/* Responsive breakpoints */
@media (max-width: 1200px) {
  .section-container {
    grid-template-columns: repeat(8, 1fr); /* Show 8 columns on tablets */
  }
}

@media (max-width: 768px) {
  .section-container {
    grid-template-columns: 1fr; /* Stack on mobile */
  }
}
```

#### Visualization Section Styles

**S16, S17, S18 moved from inline styles to CSS classes:**

```css
/* Section 16: Sankey Diagram */
.sankey-container {
  width: 100%;
  height: 600px;
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  position: relative;
}

.sankey-node rect {
  fill-opacity: 0.8;
  stroke: #333;
  stroke-width: 1px;
}

.sankey-link {
  fill: none;
  stroke-opacity: 0.3;
  transition: stroke-opacity 0.3s ease;
}

.sankey-link:hover {
  stroke-opacity: 0.6;
}

/* Section 17: Dependency Graph */
.dependency-graph-container {
  width: 100%;
  height: 800px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  overflow: hidden;
}

.dependency-node circle {
  stroke: #fff;
  stroke-width: 2px;
  cursor: pointer;
}

.dependency-link {
  stroke: #999;
  stroke-opacity: 0.4;
  stroke-width: 1.5px;
}

/* Section 18: Parallel Coordinates */
.parallel-coordinates-container {
  width: 100%;
  height: 700px;
  background: #ffffff;
  border: 1px solid #dee2e6;
  padding: 20px;
}

.pc-axis line {
  stroke: #333;
  stroke-width: 2px;
}

.pc-axis text {
  font-size: 12px;
  fill: #333;
}

.pc-line {
  fill: none;
  stroke: #007bff;
  stroke-width: 2px;
  stroke-opacity: 0.5;
  transition: stroke-opacity 0.2s ease;
}

.pc-line:hover {
  stroke-opacity: 1;
  stroke-width: 3px;
}
```

#### Benefits of Consolidated CSS

**Before consolidation:**
- Inline styles scattered across S16.js, S17.js, S18.js
- Difficult to maintain consistent styling
- Hard to debug visual issues
- Poor separation of concerns

**After consolidation to styles.css:**
- ✅ Single source of truth for all styling
- ✅ Easier to maintain and update visual design
- ✅ Better separation: JS handles logic, CSS handles presentation
- ✅ Improved performance (CSS caching)
- ✅ Consistent theming across all sections

**Migration:** S16, S17, and S18 were refactored to use CSS classes instead of inline `style.cssText` assignments, significantly improving maintainability.

---

## 6. Graphical Sections

Sections 16-18 are **visualization and optimization tools** that consume calculated data from sections S01-S15. These sections are **state-agnostic display consumers** that read from both Target and Reference models without maintaining isolated state - even though they can show both states (Sankey, Parallel Coordinates) .

### Common Pattern: Display-Only Sections

Unlike Pattern A sections (S02-S15), graphical sections:
- Do NOT maintain TargetState/ReferenceState objects
- Do NOT produce calculated values for other sections
- Read directly from StateManager (both Target and Reference)
- Render visualizations or interactive tools
- Export minimal `getFields()` and `getLayout()` (empty or minimal)

### S16: Sankey Diagram (Energy Flow Visualization)

**Purpose:** Visualize energy flows through the building envelope showing heating and cooling pathways.

**NOTE:** AI agents have struggled with Object/Numeric references and conversions, pay special attention to this for rendering and scaling functions with this D3 system.

**File:** [src/sections/Section16.js](src/sections/Section16.js)
**Visualization Engine:** D3.js Sankey plugin (in-file TEUI_SankeyDiagram class)

#### Dual-Mode Operation

S16 supports two season modes AND Emissions mode:

```javascript
window.TEUI.sect16 = {
  currentMode: "heating", // or "cooling"
  sankeyInstance: null,
  fullscreenSankeyInstance: null,
  showEmissions: false, // Toggle CO2e flow visualization
  MODES: {
    SANKEY: "sankey",
    ENERGY_BALANCE: "energy-balance"
  }
};
```

**Heating Mode (default):**
- Shows heat gains (occupants, equipment, solar, etc.)
- Shows heat losses (envelope, ventilation, etc.)
- Thermal Energy Demand (TED) as central node

**Cooling Mode (Section16C.js):**
- Shows cooling loads and heat rejection
- Separate Sankey for cooling season analysis
- Uses cooling-specific field mappings (k columns)

#### Data Sources

S16 reads **pre-calculated values** from StateManager:

```javascript
// Heating mode data sources (Column H for Target, Column E for Reference)
const data = {
  occupantGains: StateManager.getValue("h_79"),    // S09
  equipmentGains: StateManager.getValue("h_80"),   // S09
  solarGainsN: StateManager.getValue("h_82"),      // S10
  roofLosses: StateManager.getValue("h_87"),       // S11
  wallLosses: StateManager.getValue("h_88"),       // S11
  ventilationLosses: StateManager.getValue("h_102"),// S13
  thermalDemand: StateManager.getValue("h_126"),   // S14 (TEDI)
  // ... 30+ field mappings
};
```

**Reference mode:** Same field IDs with `ref_` prefix (e.g., `ref_h_79`)

#### Sankey Structure

```javascript
const nodes = [
  { name: "Building", color: "#4A96BA" },           // Central node
  { name: "G.1.2 Occupant Gains", color: "#FF8C00" },
  { name: "G.2 Plug Light Equipment", color: "#A5D3ED" },
  { name: "B.4 Roof", color: "#8FAFA6" },
  { name: "B.5 Walls Above Grade", color: "#8FAFA6" },
  { name: "Thermal Energy Demand", color: "#BFA586" },
  { name: "Total Envelope Losses", color: "#8FAFA6" },
  // ... 33 total nodes
];

const links = [
  { source: "OccupantGains", target: "Building", value: occupantGains },
  { source: "Building", target: "TotalEnvelopeLosses", value: totalLosses },
  // ... dynamic link values from StateManager
];
```

#### calculateAll() Pattern

```javascript
window.TEUI.SectionModules.sect16 = (function() {
  function calculateAll() {
    // NO calculations performed
    // Just refresh visualization with latest StateManager data
    updateSankeyData();
    if (window.TEUI.sect16.sankeyInstance) {
      window.TEUI.sect16.sankeyInstance.render();
    }
  }

  function updateSankeyData() {
    const mode = window.TEUI.sect16.currentMode;
    const prefix = getCurrentModePrefix(); // "" for Target, "ref_" for Reference

    // Fetch all values from StateManager
    const data = buildSankeyDataFromState(mode, prefix);

    // Update Sankey visualization
    window.TEUI.sect16.sankeyInstance.updateData(data);
  }

  return {
    getFields: () => ({}), // No fields
    getLayout: () => ({ rows: [] }), // Managed by index.html
    calculateAll: calculateAll,
    initializeEventHandlers: () => { /* DOM managed separately */ }
  };
})();
```

#### Emissions Overlay

Toggle CO2e emissions visualization:

```javascript
// When showEmissions = true, add emission flow links
const emissionLinks = [
  { source: "ThermalDemand", target: "E1 Scope 1 Emissions", value: scope1CO2, isEmissions: true },
  { source: "Electricity", target: "E2 Scope 2 Emissions", value: scope2CO2, isEmissions: true }
];
```

---

### S17: Dependency Graph (Interactive Field Relationships)

**Purpose:** Interactive D3 force-directed graph showing complete field dependency network.

**Files:**
- [src/sections/Section17.js](src/sections/Section17.js) (minimal wrapper)
- [src/core/Dependency.js](src/core/Dependency.js) (visualization engine)

#### Dependency Discovery

Dependency.js was built using **ZenMaster runtime dependency discovery**:

```javascript
// ZenMaster observers track ALL getValue/setValue calls during calculateAll()
const observer = {
  onGetValue: (fieldId, value) => {
    currentCalculation.reads.push(fieldId); // This field is a dependency
  },
  onSetValue: (fieldId, value, state) => {
    currentCalculation.writes.push(fieldId); // This field depends on reads
  }
};

// After full calculation cycle, build dependency graph:
// If calculateRoofLosses() reads h_87_area and h_87_uvalue, writes h_87_loss
// Then: h_87_area → h_87_loss, h_87_uvalue → h_87_loss
```

#### Graph Data Structure

```javascript
const dependencyGraph = {
  nodes: [
    { id: "d_12", label: "Building Type", section: "S02", type: "input" },
    { id: "h_126", label: "TEDI", section: "S14", type: "calculated" },
    { id: "h_10", label: "TEUI", section: "S15", type: "output" }
    // ... 450+ field nodes
  ],
  links: [
    { source: "d_12", target: "h_79" }, // Building type → Occupant gains
    { source: "h_126", target: "h_10" }, // TEDI → TEUI
    // ... 800+ dependency links
  ]
};
```

#### Interactive Features

- **Force-directed layout:** Nodes attract/repel to show dependency clusters
- **Filtering:** Show only Target, Reference, or both sets
- **Search:** Highlight specific fields and their dependencies
- **Zoom/Pan:** Navigate large graph (450+ nodes)
- **Node coloring:** By section, by state type, or by field type

#### calculateAll() Pattern

```javascript
window.TEUI.SectionModules.sect17 = (function() {
  function calculateAll() {
    // Refresh graph with latest dependency data
    if (window.TEUI?.initializeGraphInstanceAndUI) {
      window.TEUI.initializeGraphInstanceAndUI();
    }
  }

  return {
    getFields: () => ({}),
    getLayout: () => ({ rows: [] }),
    calculateAll: calculateAll
  };
})();
```

**Key Insight:** S17 does NOT recalculate dependencies—it visualizes the **static dependency graph** discovered during development. The graph shows structural relationships, not runtime values.

---

### S18: Parallel Coordinates (Multi-Dimensional Optimization)

**Purpose:** Interactive optimization tool for exploring design trade-offs between Target and Reference configurations.

**Files:**
- [src/sections/Section18.js](src/sections/Section18.js) (minimal wrapper)
- [src/core/ParallelCoordinates.js](src/core/ParallelCoordinates.js) (orchestrator, 800 lines, refactored from 3,199 lines)
- [src/core/pcConfig.js](src/core/pcConfig.js) (axis configuration, data fetching)
- [src/core/pcRendering.js](src/core/pcRendering.js) (D3 visualization)
- [src/core/pcOptimization.js](src/core/pcOptimization.js) (optimization presets)
- [src/core/pcFinancials.js](src/core/pcFinancials.js) (ROI calculations, Pro feature)

#### State-Agnostic Design

S18 is **state-agnostic** and reads **both** Target and Reference models:

```javascript
// Fetch data for parallel coordinates
const data = {
  target: {
    teui: StateManager.getValue("h_10"),
    ghgi: StateManager.getValue("h_140"),
    tedi: StateManager.getValue("h_126"),
    envelopeRSI: StateManager.getValue("h_avg_rsi"),
    equipmentHSPF: StateManager.getValue("h_113"),
    // ... 15+ metrics
  },
  reference: {
    teui: StateManager.getValue("ref_h_10"),
    ghgi: StateManager.getValue("ref_h_140"),
    tedi: StateManager.getValue("ref_h_126"),
    envelopeRSI: StateManager.getValue("ref_h_avg_rsi"),
    equipmentHSPF: StateManager.getValue("ref_h_113"),
    // ... same metrics with ref_ prefix
  }
};
```

#### Parallel Coordinates Visualization

Each vertical axis represents a design parameter or performance metric:

```
Envelope RSI    Equipment HSPF    TEUI    GHGI    Capital Cost    Payback
    │               │             │       │           │             │
    │               │             │       │           │             │
   5.2─────────────12.5───────────45─────2.1────────$450k─────────8.2y  ← Target
    │    ╱          │    ╱         │  ╱   │      ╱    │       ╱    │
    │  ╱            │  ╱           │╱     │    ╱      │     ╱      │
   3.5─────────────7.1────────────68─────3.8────────$200k────────15.3y  ← Reference
    │               │             │       │           │             │
```

Lines connect values across axes showing trade-offs between configurations.

#### Optimization Presets (Value Setting via Quarantine)

S18 can **set Target field values** using the import quarantine pattern:

```javascript
// "Decarbonize" preset: Maximize envelope, maximize equipment efficiency
function handleDecarbonize() {
  console.log("[S18] Applying Decarbonize preset");

  // 🔒 Mute listeners to prevent cascading calculations
  window.TEUI.StateManager.muteListeners();

  // Set aggressive envelope values
  window.TEUI.StateManager.setValue("f_85", "8.5", "user-modified"); // Roof RSI
  window.TEUI.StateManager.setValue("f_89", "7.0", "user-modified"); // Wall RSI
  window.TEUI.StateManager.setValue("f_95", "5.0", "user-modified"); // Slab RSI

  // Set high-efficiency equipment
  window.TEUI.StateManager.setValue("f_113", "14.0", "user-modified"); // HSPF
  window.TEUI.StateManager.setValue("f_107", "0.95", "user-modified"); // Furnace eff

  // Sync Pattern A sections from global state
  syncAllDualStateSections();

  // 🔓 Unmute listeners
  window.TEUI.StateManager.unmuteListeners();

  // NOW trigger single calculateAll()
  window.TEUI.Calculator.calculateAll();

  // Refresh visualization
  refresh();
}
```

**Available Presets:**
- **Restore Baseline:** Revert to last imported state (Tier 1 reset, works better after file import vs. restore defaults which requires full browser rebuild - needs more elegant solution!)
- **Decarbonize:** Maximize envelope + equipment efficiency
- **Optimize:** Balance performance and cost
- **Super Optimize:** Extreme efficiency (cost no object)
- **PassivHaus-ify:** Meet Passive House criteria

#### calculateAll() Pattern

```javascript
window.TEUI.SectionModules.sect18 = (function() {
  function calculateAll() {
    // Refresh parallel coordinates with latest data
    if (window.TEUI?.ParallelCoordinates?.refresh) {
      window.TEUI.ParallelCoordinates.refresh();
    }
  }

  return {
    getFields: () => ({}),
    getLayout: () => ({ rows: [] }),
    calculateAll: calculateAll,
    initializeEventHandlers: () => {
      // ParallelCoordinates.js handles initialization via DOMContentLoaded
    }
  };
})();
```

#### Financial Analysis (Pro Feature - in Preview mode now)

pcFinancials.js calculates ROI and payback for optimization scenarios:

```javascript
// Compare Target vs Reference capital costs
const capitalDelta = targetCapitalCost - referenceCapitalCost;
const energySavings = (referenceKWh - targetKWh) * electricityRate;
const paybackYears = capitalDelta / energySavings;

const roi = {
  capitalDelta: capitalDelta,
  annualSavings: energySavings,
  paybackPeriod: paybackYears,
  netPresentValue: calculateNPV(energySavings, roiTerm, discountRate)
};
```

#### Activation Pattern

S18 uses **lazy loading** to improve initial page load:

```html
<!-- Initial state: Placeholder message -->
<div class="parallel-coordinates-container">
  <p>Click 'Activate Optimization View' to visualize...</p>
</div>

<!-- After activation: Full D3 visualization loaded -->
```

```javascript
function activateVisualization() {
  isActivated = true;
  initializeFullControls(); // Enable all buttons
  refresh();                 // Render D3 visualization
}
```

#### Known Issue: State Mixing After Decarbonize

**Bug:** mode toggle contamination after data Import/Decarbonize/ operations, constrained to files with Gas SHW and Heating that S18 converts to HP systems (notably Community Centre file)

**Documentation:** [docs/development/S07-S13-S18-STATEMIX-BUG.md](docs/development/S07-S13-S18-STATEMIX-BUG.md)

**Symptom:** After clicking "Decarbonize" in S18, toggling to Reference mode in S01 shows contaminated values (Target values bleeding into Reference display, cycling recalculation on every mode switch, could be animation artifact or wrong values, uncertain).

**Root Cause:** Under investigation—suspected issue with ModeManager.switchMode() state synchronization after bulk value setting - or rendering/timing artefact.

**Workaround:** Click "Restore Baseline" button or perform Tier 1 reset before mode toggling.

---

### Summary: Graphical Sections Pattern

| Section | Purpose | Engine | State Pattern |
|---------|---------|--------|---------------|
| **S16** | Energy flow visualization | D3 Sankey | Display-only (reads H/E columns) |
| **S17** | Dependency graph | D3 Force-directed | Display-only (static graph) |
| **S18** | Optimization tool | D3 Parallel Coords | State-agnostic (reads + writes via quarantine) |

**Common characteristics:**
- Minimal Section module (empty getFields/getLayout)
- Heavy lifting in dedicated core modules
- Read from StateManager, never publish calculated values
- Refresh on calculateAll(), no actual calculations
- DOM and event handling managed by core modules

**Why separate from Pattern A sections?**
- No dual-state isolation needed (display-only or state-agnostic)
- Complex D3 visualizations warrant dedicated modules
- Lazy loading improves initial performance
- Easier to maintain visualization logic separately

---

## 7. Developer Tools

TEUI includes specialized debugging and monitoring tools for development and quality assurance. These tools run **only when explicitly enabled** and have zero overhead in production. S19 is collapsed by default on initialization. 

### S19: Notes & Quality Control Monitor

**Purpose:** Quality assurance dashboard with QC violation reporting, runtime dependency discovery, and project notes.

**Files:**
- [src/sections/Section19.js](src/sections/Section19.js)
- [src/core/QCMonitor.js](src/core/QCMonitor.js) (violation detection)
- [src/core/ZenMaster.js](src/core/ZenMaster.js) (dependency discovery)
- [src/core/Clock.js](src/core/Clock.js) (performance monitoring)

#### S19 Section Structure

```javascript
window.TEUI.SectionModules.sect18 = (function () {
  let qcEnabled = false;
  let userNotes = "";

  function getFields() {
    return {
      s18_notes: { type: "editable", label: "Project Notes" },
      s18_qc_output: { type: "calculated", label: "QC Report Output" }
    };
  }

  function getLayout() {
    return {
      customLayout: true,  // Uses custom full-width rendering
      rows: []
    };
  }

  function initializeEventHandlers() {
    addDebugToggleToHeader();  // Adds QC toggle switch to section header
  }

  return { getFields, getLayout, initializeEventHandlers, calculateAll };
})();
```

#### Debug Toggle UI

S19 adds interactive controls to section header:

```javascript
function addDebugToggleToHeader() {
  const toggleContainer = createToggleContainer();

  // QC status indicator
  const statusIndicator = createElement("QC ACTIVE" | "QC DISABLED");

  // QC monitoring toggle switch
  const toggleSwitch = createToggleSwitch({
    onClick: () => qcEnabled ? disableQCMonitoring() : enableQCMonitoring()
  });

  // Section filter dropdown (All | S01-S15)
  const sectionFilter = createDropdown(["all", "S01", "S02", ...]);

  // Zen Mode button (🧘 Zen)
  const zenButton = createButton({
    onClick: () => window.TEUI.zenMaster.toggle(),
    tooltip: "Runtime dependency discovery & validation"
  });

  // Generate QC Report button
  const reportButton = createButton({
    onClick: () => generateAndDisplayQCReport(sectionFilter.value)
  });

  // Copy Report button (📋 Copy Report)
  const copyModalButton = createButton({
    onClick: () => showCopyModal(sectionFilter.value)
  });

  sectionHeader.appendChild(toggleContainer);
}
```

#### Custom Full-Width Layout

Unlike standard sections, S19 uses custom rendering:

```javascript
function createCustomLayout() {
  const container = document.createElement("div");
  container.style.cssText = `
    padding: 20px;
    background: #f8f9fa;
    min-height: 100vh;  // Expandable to fit report
  `;

  // Notes section (contenteditable textarea)
  const notesSection = `
    <h6>📝 Project Notes</h6>
    <div contenteditable="true" data-field-id="s18_notes">
      ${userNotes || "Enter project notes here..."}
    </div>
  `;

  // QC Output section (expandable report display)
  const qcSection = `
    <h6>🔍 Quality Control Report</h6>
    <div data-field-id="s18_qc_output" class="qc-output">
      Click "Generate QC Report" to analyze violations
    </div>
  `;

  container.innerHTML = notesSection + qcSection;
  sectionContent.appendChild(container);
}
```

---

### QCMonitor.js: State Validation & Violation Detection

**Purpose:** Systematic detection of state mixing violations, stale values, and dependency issues.

**Architecture:** Observer pattern—hooks into StateManager via instrumentation.

#### Activation

QC Monitor has **zero overhead when disabled**:

```javascript
// URL-based activation
const urlParams = new URLSearchParams(window.location.search);
isActive = urlParams.get("qc") === "true";  // Add ?qc=true to URL

// OR Section 18 toggle activation
function forceActivate() {
  isActive = true;
  instrumentStateManager();  // Hook into StateManager
  return true;
}
```

#### StateManager Instrumentation

QC Monitor wraps StateManager methods to track all getValue/setValue operations:

```javascript
function instrumentStateManager() {
  const stateManager = window.TEUI.StateManager;

  // Store original methods
  const originalSetValue = stateManager.setValue;
  const originalGetValue = stateManager.getValue;

  // Wrap setValue to track writes
  stateManager.setValue = function(fieldId, value, source) {
    const startTime = performance.now();
    trackWrite(fieldId, value, source, startTime);
    const result = originalSetValue.call(this, fieldId, value, source);
    updatePerformanceMetrics(startTime);
    return result;
  };

  // Wrap getValue to track reads
  stateManager.getValue = function(fieldId) {
    const startTime = performance.now();
    const result = originalGetValue.call(this, fieldId);
    trackRead(fieldId, result, startTime);
    updatePerformanceMetrics(startTime);
    return result;
  };
}
```

#### Violation Categories

QC Monitor categorizes violations by severity and cause:

**Missing Value Analysis:**

```javascript
function analyzeMissingValue(fieldId, caller, timestamp) {
  const analysis = {
    violationType: "MISSING_VALUE",
    severity: "warning",
    category: "unknown",
    recommendations: []
  };

  // Check if field exists in FieldManager
  const fieldDefinition = window.TEUI.FieldManager.getField(fieldId);

  if (!fieldDefinition) {
    analysis.category = "undefined_field";
    analysis.violationType = "UNDEFINED_FIELD";
    analysis.severity = "error";
    analysis.recommendations = ["Add field definition to section module"];
  }

  // Check for orphaned ref_ fields
  if (fieldId.startsWith("ref_")) {
    const baseField = fieldId.substring(4);
    if (!window.TEUI.FieldManager.getField(baseField)) {
      analysis.category = "orphaned_ref_field";
      analysis.violationType = "ORPHANED_REF_FIELD";
      analysis.severity = "error";
    }
  }

  // Check for calculation failures (never written after many reads)
  const readCount = pathwayTracker.get(fieldId)?.operations.filter(op => op.operation === "read").length;
  if (readCount > 10 && !hasBeenWritten) {
    analysis.category = "calculation_failure";
    analysis.violationType = "CALCULATION_FAILURE";
    analysis.severity = "error";
    analysis.recommendations = ["Check calculation dependencies", "Verify calculation function exists"];
  }

  return analysis;
}
```

**Stale Value Detection** (flow-aware categorization):

```javascript
function detectStaleValues() {
  const staleThreshold = 5000;  // 5 seconds
  const violations = [];

  // Critical integration points - these fields flow data between sections
  const criticalIntegrationFields = {
    h_136: { priority: "error", reason: "TEUI Summary feeds dashboard" },
    d_144: { priority: "error", reason: "Reduction % feeds dashboard" },
    h_10: { priority: "error", reason: "Target TEUI for dashboard" },
    f_32: { priority: "error", reason: "Actual energy total for emissions" }
  };

  // Upstream fields that are legitimately stale (input fields)
  const upstreamFields = {
    d_85: true, d_86: true,  // Building geometry
    d_20: true, d_21: true   // Climate data
  };

  staleDetector.forEach((metadata, fieldId) => {
    if (currentTime - metadata.lastWrite > staleThreshold) {
      let violationType = "STALE_VALUE";
      let severity = "info";

      if (criticalIntegrationFields[fieldId]) {
        violationType = "CRITICAL_STALE_VALUE";
        severity = "error";
      } else if (upstreamFields[fieldId]) {
        violationType = "UPSTREAM_STALE_VALUE";
        severity = "info";  // Normal for input fields
      }

      violations.push({ type: violationType, field: fieldId, severity });
    }
  });

  return violations;
}
```

**Mirror Target Divergence:**

```javascript
function initializeMirrorTarget() {
  mirrorTargetMode = true;

  // Capture baselines (Reference defaults should = Target defaults)
  const targetBaseline = new Map();
  const referenceBaseline = new Map();

  Object.entries(stateManager.getAllValues()).forEach(([key, value]) => {
    if (key.startsWith("ref_")) {
      referenceBaseline.set(key.substring(4), value);
    } else {
      targetBaseline.set(key, value);
    }
  });

  baseline.set("Target", targetBaseline);
  baseline.set("Reference", referenceBaseline);
}

function checkMirrorTargetViolation(fieldId, value, source) {
  if (!mirrorTargetMode) return;

  const baseField = fieldId.replace("ref_", "");
  const targetValue = baseline.get("Target").get(baseField);

  if (shouldMatch(baseField) && targetValue !== value) {
    logViolation({
      type: "MIRROR_TARGET_DIVERGENCE",
      field: fieldId,
      message: `Reference ${fieldId}="${value}" diverges from Target ${baseField}="${targetValue}"`,
      severity: "error"
    });
  }
}
```

#### QC Report Generation

```javascript
function generateQCReport() {
  const allViolations = getAllViolations();

  const report = {
    timestamp: new Date().toISOString(),
    monitoring: {
      active: isActive,
      mirrorTarget: mirrorTargetMode,
      overhead: { totalCalls, avgTime, totalTime }
    },
    summary: {
      total: allViolations.length,
      byType: violations.reduce((acc, v) => { acc[v.type]++; return acc; }, {}),
      bySeverity: violations.reduce((acc, v) => { acc[v.severity]++; return acc; }, {})
    },
    violations: allViolations.sort(bySeverity)
  };

  return report;
}
```

#### Report Display Format

S19 formats QC reports as HTML for in-app display:

```javascript
function formatReportAsHTML(report, sectionFilter) {
  let html = `
    <div class="qc-report">
      <!-- Report Header -->
      <div class="header">
        <h5>🔍 QC REPORT: ${sectionFilter}</h5>
        <div class="timestamp">${new Date(report.timestamp).toLocaleString()}</div>
        <div class="total-violations">${report.summary.total}</div>
      </div>

      <!-- Status Grid -->
      <div class="status-grid">
        <div class="status active">${report.monitoring.active ? "✅ ACTIVE" : "⭕ INACTIVE"}</div>
        <div class="status mirror">${report.monitoring.mirrorTarget ? "🎯 ENABLED" : "⭕ DISABLED"}</div>
        <div class="status overhead">${report.monitoring.overhead.totalCalls} calls</div>
      </div>

      <!-- Violations by Type -->
      <h6>📋 Violations by Type</h6>
      <div class="violations-by-type">
        ${Object.entries(report.summary.byType).map(([type, count]) => `
          <div class="violation-card" style="border-left-color: ${getViolationColor(type)}">
            <div class="count">${getViolationEmoji(type)} ${count}</div>
            <div class="type">${type.replace(/_/g, " ")}</div>
          </div>
        `).join("")}
      </div>

      <!-- Violations Table -->
      <h6>🔍 Violations (${report.violations.length} total)</h6>
      <div class="violations-table">
        ${formatViolationsByType(report.violations)}
      </div>
    </div>
  `;

  return html;
}
```

---

### ZenMaster.js: Runtime Dependency Discovery

**Purpose:** Observe the application during calculations to discover the TRUE dependency graph based on actual getValue() calls.

**Philosophy:** "Truth over intention. What the code DOES, not what we THINK it does."

**Architecture:** Observer pattern—registers with StateManager.addObserver() instead of monkey-patching.

#### Activation

```javascript
// Global convenience methods
window.zenEnable = () => window.TEUI.zenMaster.enable();
window.zenDisable = () => window.TEUI.zenMaster.disable();

// Observer registration (zero overhead when disabled)
function enable() {
  const stateManager = window.TEUI.StateManager;
  stateManager.addObserver(this);  // Register as observer
  this.isEnabled = true;
}

function disable() {
  const stateManager = window.TEUI.StateManager;
  stateManager.removeObserver(this);  // Unregister
  this.isEnabled = false;
}
```

#### Observer Interface

ZenMaster implements observer interface methods called by StateManager:

```javascript
class ZenMaster {
  // Called when StateManager.getValue is invoked
  onGetValue(fieldId, value) {
    this.recordAccess(fieldId, value);
  }

  // Called when StateManager.setValue is invoked
  onSetValue(fieldId, value, state) {
    this.recordSetValue(fieldId, value);
  }
}
```

#### Dependency Tracing

```javascript
function recordAccess(accessedFieldId, value) {
  if (!this.isEnabled) return;

  // Log all accesses
  this.accessLog.push({
    timestamp: Date.now(),
    calculatingField: this.currentCalculation || "unknown",
    mode: this.currentMode,
    accessedField: accessedFieldId,
    value: value
  });

  // If we're in active trace, record dependencies
  if (this.isTracing && this.calculationStack.length > 0) {
    const currentCalc = this.calculationStack[this.calculationStack.length - 1];

    // Don't record self-references
    if (accessedFieldId !== currentCalc.fieldId) {
      currentCalc.dependencies.add(accessedFieldId);
      console.log(`  📖 ${currentCalc.fieldId} → reads → ${accessedFieldId}`);
    }
  }
}

function recordSetValue(fieldId, value) {
  if (!this.isEnabled) return;

  // Update current calculation context
  this.currentCalculation = fieldId;

  this.accessLog.push({
    timestamp: Date.now(),
    type: "setValue",
    calculatingField: fieldId,
    value: value
  });
}
```

#### Dependency Validation

Compare discovered dependencies vs declared dependencies:

```javascript
function validateDependencies() {
  const results = { sections: {}, summary: {} };
  const allFields = window.TEUI.FieldManager.getAllFields();

  Object.entries(allFields).forEach(([fieldId, fieldDef]) => {
    const declaredDeps = new Set([
      ...(fieldDef.dependencies || []),
      ...(fieldDef.conditionalDeps || []),
      ...(fieldDef.uiDeps || [])
    ]);

    const tracedDeps = this.dependencies.get(fieldId) || new Set();

    // Categorize phantom dependencies
    const phantoms = [];
    const conditionalPhantoms = [];
    const uiPhantoms = [];

    declaredDeps.forEach(dep => {
      if (!tracedDeps.has(dep)) {
        if (fieldDef.uiDeps?.includes(dep)) {
          uiPhantoms.push(dep);  // UI dependency (dropdowns, validation)
        } else if (fieldDef.conditionalDeps?.includes(dep)) {
          conditionalPhantoms.push(dep);  // Conditional (not triggered in this test)
        } else {
          phantoms.push(dep);  // True phantom (declared but never used)
        }
      }
    });

    // Find missing (used but not declared)
    const missing = Array.from(tracedDeps).filter(dep => !declaredDeps.has(dep));

    if (phantoms.length > 0 || missing.length > 0) {
      console.log(`⚠️ ${fieldId}`);
      if (phantoms.length > 0) {
        console.log(`  🤔 NON-SM-UKN deps (may use dual-state/DOM): ${phantoms.join(", ")}`);
      }
      if (conditionalPhantoms.length > 0) {
        console.log(`  🔀 CONDITIONAL deps (not triggered): ${conditionalPhantoms.join(", ")}`);
      }
      if (missing.length > 0) {
        console.log(`  ➕ MISSING deps (traced but not declared): ${missing.join(", ")}`);
      }
    }
  });

  return results;
}
```

**Critical Limitation:**

ZenMaster ONLY traces dependencies accessed via `StateManager.getValue()`. Dependencies accessed through the following methods are INVISIBLE:
- Dual-state storage (`ReferenceState.getValue`, `TargetState.getValue`)
- Direct DOM reads (`dropdown.value`, `input.value`)
- Local object storage (`this.data[fieldId]`)
- Mode-aware helpers (`ModeManager.getValue` wrapping local state)

⚠️ **NEVER delete dependencies based solely on ZenMaster output!** Always verify against source code.

#### Workflow (3-Click Operation)

```javascript
// 1. Enable tracing
zenEnable();

// 2. Interact with app (change values, trigger calculations)
// ... user changes dropdowns, sliders, inputs ...

// 3. Validate and export
zenValidate();      // Find MISSING deps & conditional patterns
zenLabels();        // Find unlabeled fields for graph viz
zenTypos();         // Find likely typos in dependency declarations
zenExportFile();    // Download dependency graph JSON
zenDisable();
```

#### Integration with S17 Dependency Graph

ZenMaster discovered the dependency graph visualized in S17:

```javascript
// Export discovered dependencies in Dependency.js format
function exportDependencyGraph() {
  const graph = { nodes: [], links: [] };

  // Build unique node set from access log
  const nodeSet = new Set();
  this.dependencies.forEach((deps, fieldId) => {
    nodeSet.add(fieldId);
    deps.forEach(dep => nodeSet.add(dep));
  });

  // Create nodes
  graph.nodes = Array.from(nodeSet).map(id => ({
    id,
    label: this.getFieldLabel(id),
    group: this.getFieldSection(id)
  }));

  // Create links from dependencies
  this.dependencies.forEach((deps, fieldId) => {
    deps.forEach(dep => {
      graph.links.push({ source: dep, target: fieldId });
    });
  });

  return graph;  // 450+ nodes, 800+ links
}
```

---

### Clock.js: Performance Monitoring

**Purpose:** Real-time calculation timing display showing Init vs Current calculation times.

**Display:** Key Values header feedback area (top-right corner).

#### Architecture

```javascript
window.TEUI.Clock = {
  initTime: null,
  initDisplayed: false,

  init() {
    window.TEUI.timing = {
      initStartTime: null,
      currentStartTime: null,
      isInitialLoad: true
    };
  },

  startTiming(isInitialLoad = false) {
    const now = performance.now();
    if (isInitialLoad) {
      window.TEUI.timing.initStartTime = now;
    } else {
      window.TEUI.timing.currentStartTime = now;
    }
  },

  endTiming(isInitialLoad = false) {
    const now = performance.now();
    if (isInitialLoad) {
      this.initTime = now - window.TEUI.timing.initStartTime;
      console.log(`🕐 [CLOCK] ⭐ INITIALIZATION COMPLETE: ${this.initTime.toFixed(0)}ms`);
    } else {
      const currentTime = now - window.TEUI.timing.currentStartTime;
      console.log(`🕐 [CLOCK] ⚡ CALCULATION COMPLETE: ${currentTime.toFixed(0)}ms`);
    }
    this.updateDisplay();
  }
};
```

#### Display Update

```javascript
function updateDisplay() {
  const feedbackArea = document.getElementById("feedback-area");
  if (!feedbackArea) return;

  let displayText = "";

  if (this.initTime && this.initDisplayed) {
    // Show initialization time (persistent)
    displayText = `Load: ${this.formatTime(this.initTime)}`;

    // Add current time if we have recent calculation data
    if (window.TEUI.timing.lastCalculationTime) {
      displayText += ` | Current: ${this.formatTime(window.TEUI.timing.lastCalculationTime)}`;
    }
  }

  feedbackArea.innerHTML = displayText;
  feedbackArea.style.color = "white";
  feedbackArea.style.fontFamily = "monospace";
}

function formatTime(ms) {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  } else {
    return `${Math.round(ms)}ms`;
  }
}
```

#### Integration with Calculator.js

```javascript
// Calculator.js calls Clock at start/end of calculateAll()
function calculateAll() {
  window.TEUI.Clock.markCalculationStart();  // Start timing

  // Section calculations...
  calculateSection02();
  calculateSection03();
  // ...

  window.TEUI.Clock.markCalculationEnd();    // End timing & update display
}
```

#### User Interaction Timing

Tracks user-perceived performance (interaction → h_10 settlement):

```javascript
// S01 marks user interaction start
function handleUserInputChange() {
  window.TEUI.Clock.markUserInteractionStart();
  // ... calculation cascade ...
}

// S01 marks user interaction end when h_10 is calculated
function calculateH10() {
  const result = computeTEUI();
  window.TEUI.StateManager.setValue("h_10", result, "calculated");
  window.TEUI.Clock.markUserInteractionEnd();  // User-perceived calculation complete
}
```

#### Integration with ZenMaster for Optimization

Clock + ZenMaster enable calculation flow optimization:

1. **ZenMaster** discovers true dependency graph
2. **Clock** measures current performance baseline
3. Reorder Calculator sections based on ZenMaster graph
4. **Clock** validates performance improvement
5. Iterate until optimal calculation flow achieved

```javascript
// Example: Reordering sections based on ZenMaster dependency graph
const calculationOrder = [
  "sect02",  // Building Info (no dependencies)
  "sect03",  // Climate (depends on Building)
  "sect10",  // Radiant Gains (depends on Climate)
  "sect11",  // Transmission (depends on Radiant)
  "sect13",  // Mechanical (depends on Transmission)
  "sect15"   // TEUI (depends on Mechanical)
];

// Clock will show if this order improves performance
```

---

### Developer Tools Summary

| Tool | Purpose | Activation | Performance Impact |
|------|---------|------------|-------------------|
| **QCMonitor** | State validation & violation detection | ?qc=true or S19 toggle | Zero when disabled |
| **ZenMaster** | Runtime dependency discovery | zenEnable() or 🧘 button | Zero when disabled |
| **Clock** | Calculation timing display | Always active | Negligible (~1ms overhead) |
| **S19** | Developer dashboard UI | Always available | Zero calculation overhead |

**Common Pattern:**
- Observer pattern architecture (loose coupling)
- Zero overhead when disabled (fast-path optimization)
- StateManager instrumentation (wrap getValue/setValue)
- Console-based reporting (detailed logs for debugging)
- Export functionality (JSON downloads for analysis)

**Typical Workflow:**

1. **Enable QC Monitor** (S19 toggle or ?qc=true)
   - Detects state mixing, stale values, missing fields
   - Real-time violation reporting

2. **Enable ZenMaster** (🧘 Zen button)
   - Traces all getValue/setValue calls
   - Discovers true dependency graph
   - Validates declared dependencies

3. **Monitor Performance** (Clock always active)
   - Tracks init time vs current calculation time
   - User-perceived performance metrics

4. **Generate Reports** (S19 "Generate QC Report" button)
   - Comprehensive violation analysis
   - Category breakdown (undefined, orphaned, stale, etc.)
   - Section filtering for targeted debugging

5. **Export Data** (zenExportFile, Copy Report buttons)
   - Download dependency graph JSON
   - Copy QC report to clipboard
   - Use in documentation (Logs.md)

---

## 8. Field Naming Conventions

TEUI uses an **Excel-compatible field naming system** where field IDs map directly to spreadsheet cell coordinates. This design enables regulatory compliance documentation and seamless Excel import/export.

### Column_Row Format

Every field ID follows the pattern: `{column}_{row}`

```javascript
// Basic pattern
d_12  // Column D, Row 12 → Major Occupancy dropdown
h_12  // Column H, Row 12 → Reporting Period slider
l_12  // Column L, Row 12 → Electricity price input

// Column letters correspond to Excel columns
a_5   // Column A, Row 5
z_100 // Column Z, Row 100
aa_15 // Column AA, Row 15 (multi-letter columns supported)
```

**Excel Coordinate Mapping:**

```
     A    B    C    D    E    F    G    H    I    J    K    L    M    N
  ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
5 │a_5 │b_5 │c_5 │d_5 │e_5 │f_5 │g_5 │h_5 │i_5 │j_5 │k_5 │l_5 │m_5 │n_5 │
  ├────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
12│a_12│b_12│c_12│d_12│e_12│f_12│g_12│h_12│i_12│j_12│k_12│l_12│m_12│n_12│
  └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘

Row numbers = Excel row numbers (direct 1:1 mapping)
```

### Column Assignments

TEUI organizes data into semantic column groups:

| Column(s) | Purpose | Example Fields |
|-----------|---------|----------------|
| **A-B** | Row labels, section headers | `a_12` = "B.1", `b_12` = "Major Occupancy" |
| **C-D** | Building metadata, classifications | `d_12` = Occupancy type, `d_13` = Reference standard |
| **E** | Reference model **calculated** outputs | `e_79` = Reference occupant gains (kWh) |
| **F-G** | Field labels for H column | `f_85` = "RSI Roof", `g_85` = "m²K/W" |
| **H** | Target model inputs & **calculated** outputs | `h_12` = Reporting year, `h_126` = TEDI (calculated) |
| **I-J** | Intermediate calculations, sub-totals | `i_104` = Ventilation sub-total |
| **K-L** | Energy prices, utility rates | `l_12` = Electricity price ($/kWh) |
| **M-N** | Units, annotations | `m_12` = "/kWh", `n_12` = Notes |

**Key Column Roles:**

- **Column D**: Primary input location (user selections, geometry)
- **Column E**: Reference model calculated outputs (code minimum results)
- **Column H**: Target model inputs + calculated outputs (user's design)
- **Columns I-J**: Intermediate calculation storage
- **Column K**: Cooling calculations (seasonal mode)

### Prefix Patterns: Target vs Reference

Field IDs use **prefix patterns** to distinguish Target and Reference states:

#### Target Model (Unprefixed)

```javascript
// Target model fields - NO prefix
d_12   // Building type (Target)
h_126  // TEDI (Target calculated output)
f_85   // Roof RSI value (Target input)

// In StateManager
window.TEUI.StateManager.getValue("d_12");   // "A-Assembly"
window.TEUI.StateManager.getValue("h_126");  // "45.2" (calculated TEDI)
```

#### Reference Model (ref_ Prefix)

```javascript
// Reference model fields - ref_ prefix
ref_d_12   // Building type (Reference) - same value as Target
ref_h_126  // TEDI (Reference calculated output) - different value
ref_f_85   // Roof RSI value (Reference - code minimum)

// In StateManager
window.TEUI.StateManager.getValue("ref_d_12");   // "A-Assembly"
window.TEUI.StateManager.getValue("ref_h_126");  // "68.5" (Reference TEDI)
window.TEUI.StateManager.getValue("ref_f_85");   // "3.5" (code minimum RSI)
```

**Storage Pattern:**

```javascript
// Pattern A sections use isolated state + global StateManager
function setTargetValue(fieldId, value) {
  TargetState.setValue(fieldId, value);  // Local: d_12 → "A-Assembly"
  window.TEUI.StateManager.setValue(fieldId, value, "user-modified");  // Global: d_12
}

function setReferenceValue(fieldId, value) {
  ReferenceState.setValue(fieldId, value);  // Local: d_12 → "A-Assembly"
  window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, "over-ridden");  // Global: ref_d_12
}
```

### Special Field Types

#### 1. Geometry Fields (Fully Independent)

**ALL user-editable fields are fully independent between Target and Reference models**, including geometry:

```javascript
// Target model geometry
d_85  // Target building area (m²)
d_86  // Target building volume (m³)
d_87  // Target roof area (m²)
d_88  // Target wall area above grade (m²)

// Reference model geometry (completely independent)
ref_d_85  // Reference building area (m²) - can differ from Target
ref_d_86  // Reference building volume (m³) - can differ from Target
ref_d_87  // Reference roof area (m²) - can differ from Target
ref_d_88  // Reference wall area above grade (m²) - can differ from Target

// Both models have separate geometry storage
const targetArea = window.TEUI.StateManager.getValue("d_85");      // Target geometry
const refArea = window.TEUI.StateManager.getValue("ref_d_85");     // Reference geometry (independent)
```

**Why fully independent geometry?**

1. **Maximum user flexibility**: Users can model different scenarios:
   - Different window areas (improve Target vs Reference baseline)
   - Different building sizes (enlarged building vs base case)
   - Different locations (same building in different climates)
   - Different envelope configurations

2. **State contamination prevention**: The **only** way to completely eliminate state pollution was to make ALL user-editable fields independent. No shared state = no contamination paths.

3. **Comprehensive comparison capabilities**: Allows modeling fundamentally different building configurations while maintaining dual-state architecture.

#### 2. Fuel Type Selectors (Mode-Aware)

Fuel type fields control equipment type and affect calculation pathways:

```javascript
// Section 07 (Water Use) fuel type selector
d_51  // Target: Fuel type for DHW system ("Heatpump", "Gas", "Electric", "Oil")
ref_d_51  // Reference: Fuel type (typically "Electric" per code)

// Section 13 (Mechanical) fuel type selector
d_105  // Target: Heating system fuel type
ref_d_105  // Reference: Heating system fuel type

// Fuel type affects conditional efficiency fields
if (fuelType === "Heatpump") {
  efficiencyField = "f_113";  // HSPF rating
} else if (fuelType === "Gas") {
  efficiencyField = "f_107";  // AFUE rating
}
```

#### 3. Conditional Efficiency Fields

Equipment efficiency fields are **conditionally active** based on fuel type:

```javascript
// Heating efficiency fields (Section 13)
f_107  // AFUE (Annual Fuel Utilization Efficiency) - Gas/Oil furnaces
f_113  // HSPF (Heating Seasonal Performance Factor) - Heat pumps
f_114  // SEER (Seasonal Energy Efficiency Ratio) - Cooling equipment

// Example: Gas furnace selected
if (StateManager.getValue("d_105") === "Gas") {
  efficiency = StateManager.getValue("f_107");  // Read AFUE
  // f_113 is hidden/disabled in UI
}

// Example: Heat pump selected
if (StateManager.getValue("d_105") === "Heatpump") {
  heatingEff = StateManager.getValue("f_113");  // Read HSPF
  coolingEff = StateManager.getValue("f_114");  // Read SEER
  // f_107 is hidden/disabled in UI
}
```

#### 4. Calculated Output Fields

Calculated fields store computation results and are **read-only** in the UI:

```javascript
// Calculated output fields (Target model)
h_79   // Occupant gains (kWh) - calculated by S09
h_126  // TEDI (kWh/m²/year) - calculated by S14
h_10   // TEUI (kWh/m²/year) - calculated by S15
j_32   // Total energy (kWh) - calculated by S04

// Calculated output fields (Reference model)
ref_e_79   // Reference occupant gains (kWh)
ref_h_126  // Reference TEDI
ref_h_10   // Reference TEUI
ref_j_32   // Reference total energy

// State type MUST be "calculated"
window.TEUI.StateManager.setValue("h_126", "45.2", "calculated");  // ✅ CORRECT
window.TEUI.StateManager.setValue("h_126", "45.2", "user-modified");  // ❌ WRONG
```

### Field Ownership by Section

Each section "owns" specific field IDs and is responsible for:
- Rendering UI elements for owned fields
- Handling user input events for owned fields
- Calculating and publishing values for owned fields

**Section Ownership Examples:**

```javascript
// Section 02 (Building Information) owns:
d_12   // Major Occupancy
d_13   // Reference Standard
h_12   // Reporting Period
l_12   // Electricity price
m_12   // Gas price

// Section 03 (Climate) owns:
d_19   // Province
h_19   // City
d_20   // HDD (calculated)
d_21   // CDD (calculated)

// Section 07 (Water Use) owns:
d_49   // DHW demand type ("User Defined", "OBC Calculated")
d_51   // DHW fuel type ("Heatpump", "Gas", "Electric")
d_52   // DHW efficiency slider
e_49   // Reference DHW demand (L/day)

// Section 13 (Mechanical) owns:
d_105  // Heating system fuel type
f_107  // Furnace AFUE
f_113  // Heat pump HSPF
f_114  // Cooling SEER
```

**Cross-Section Access:**

Sections can **read** fields owned by other sections via StateManager, but should **never** write to fields they don't own (exception: Section18 is a UI for some of these sections :)

```javascript
// ✅ CORRECT: S15 reads S14's TEDI output
const tedi = window.TEUI.StateManager.getValue("h_126");  // S14 owns h_126

// ❌ WRONG: S15 should NOT write to S14's field
window.TEUI.StateManager.setValue("h_126", "45.2", "calculated");  // Only S14 should write this
```

### Field State Metadata

Every field value has associated metadata tracking its origin:

```javascript
// Field state types (from StateManager)
const VALUE_STATES = {
  DEFAULT: "default",           // Initial default value
  IMPORTED: "imported",         // Loaded from CSV/Excel
  USER_MODIFIED: "user-modified", // User changed value in UI
  OVER_RIDDEN: "over-ridden",   // ReferenceValues.js applied (d_13 change)
  CALCULATED: "calculated",     // Computed by calculation engine
  DERIVED: "derived"            // Derived from another field
};

// Example: Tracking how a value was set
window.TEUI.StateManager.setValue("d_12", "A-Assembly", "user-modified");
// → StateManager stores: { value: "A-Assembly", state: "user-modified", timestamp: ... }

// Query field state
const info = window.TEUI.StateManager.getFieldInfo("d_12");
// → { id: "d_12", value: "A-Assembly", state: "user-modified", ... }
```

**State Rules:**

- **Input fields** (d_12, f_85, etc.) can have: `default`, `imported`, `user-modified`, `over-ridden`
- **Calculated fields** (h_126, e_79, etc.) can ONLY have: `calculated`, `derived`
- State affects reset behavior (3-tier reset system uses state metadata)

### Naming Conventions Summary

| Pattern | Example | Meaning |
|---------|---------|---------|
| `{col}_{row}` | `d_12` | Target model, Column D, Row 12 |
| `ref_{col}_{row}` | `ref_d_12` | Reference model, Column D, Row 12 (fully independent) |
| `dd_{col}_{row}` | `dd_d_12` | Dropdown DOM element ID |
| `s{nn}_{field}` | `s18_notes` | Section-specific field (S18 notes) |

**DOM Element IDs vs Field IDs:**

```javascript
// Field ID (data identifier)
fieldId = "d_12";

// DOM container ID (matches field ID)
containerId = "d_12";  // <div data-field-id="d_12">

// DOM element ID (for specific control)
dropdownId = "dd_d_12";  // <select id="dd_d_12">

// Example in HTML
<div data-field-id="d_12" class="field-container">
  <select id="dd_d_12">
    <option value="A-Assembly">A-Assembly</option>
  </select>
</div>
```

### Excel Import/Export Compatibility

Field naming enables seamless Excel integration:

```javascript
// ExcelMapper.js maps field IDs to Excel cells
const excelMapping = {
  "d_12": { sheet: "Input", cell: "D12" },
  "h_126": { sheet: "Output", cell: "H126" },
  "ref_h_126": { sheet: "Output", cell: "E126" }  // Reference in Column E
};

// Import from Excel
excelData.forEach(row => {
  const fieldId = cellToFieldId(row.cell);  // "D12" → "d_12"
  window.TEUI.StateManager.setValue(fieldId, row.value, "imported");
});

// Export to Excel
const exportData = [];
Object.keys(fields).forEach(fieldId => {
  const value = window.TEUI.StateManager.getValue(fieldId);
  const excelCell = fieldIdToCell(fieldId);  // "d_12" → "D12"
  exportData.push({ cell: excelCell, value: value });
});
```

**Regulatory Compliance:**

The Excel-compatible naming system supports regulatory submissions:
- Direct mapping to code compliance spreadsheets ie. OBC Matrix (by the OAA)
- Traceable field references in documentation
- Energy modeling standard compatibility (NECB, OBC, NBC)

---

## 9. Calculation Flow & Dependency Chains

This section describes the **data flow** through TEUI's calculation system, showing how values propagate from user inputs through intermediate calculations to final outputs.

### Section Dependency Chain

TEUI calculations follow a **directed acyclic graph (DAG)** pattern where sections calculate in a specific order to respect dependencies:

```
User Input (S02, S03)
    ↓
Climate Calculations (S03)
    ↓
Radiant Gains (S09, S10)
    ↓
Transmission Losses (S11)
    ↓
Thermal Balance (S12)
    ↓
Mechanical Systems (S13)
    ↓
Energy Totals (S14)
    ↓
TEUI Summary (S15)
    ↓
Dashboard Display (S01)
```

**Calculator.js execution order** (established through ZenMaster dependency discovery):

```javascript
const calcOrder = [
  "sect02",  // Building Info (inputs only)
  "sect03",  // Climate (HDD, CDD calculations)
  "sect09",  // Occupant Gains (depends on S02 building type)
  "sect10",  // Radiant Gains (depends on S03 climate)
  "sect11",  // Transmission (depends on S10 solar gains)
  "sect12",  // Balance (depends on S11 envelope losses)
  "sect13",  // Mechanical (depends on S12 thermal balance)
  "sect07",  // Water Use (independent, can run anytime)
  "sect04",  // Energy Summary (depends on S13 mechanical totals)
  "sect14",  // TEDI (depends on S04 energy totals)
  "sect15",  // TEUI (depends on S14 TEDI)
  "sect01"   // Dashboard (depends on S15 TEUI - final display)
];
```

**Why this order matters:**

```javascript
// ❌ WRONG ORDER: S15 calculates before S14
calculateSection15();  // Reads h_126 (TEDI) → undefined!
calculateSection14();  // Writes h_126 → too late

// ✅ CORRECT ORDER: S14 calculates first
calculateSection14();  // Writes h_126 = "45.2"
calculateSection15();  // Reads h_126 → "45.2" ✓
```

### Cross-Section Dependencies

Sections communicate via **StateManager-published values** that other sections depend on:

#### Example: Climate → Mechanical Chain

```javascript
// S03 (Climate) calculates HDD and publishes to StateManager
function calculateReferenceModel() {
  const hdd = calculateHeatingDegreeDays();  // Local calculation

  // Publish for other sections to use
  window.TEUI.StateManager.setValue("d_20", hdd, "calculated");  // Target HDD
  window.TEUI.StateManager.setValue("ref_d_20", hdd, "calculated");  // Reference HDD
}

// S13 (Mechanical) reads HDD from StateManager
function calculateHeatingLoad() {
  const hdd = window.TEUI.StateManager.getValue("d_20");  // Cross-section read
  const heatingLoad = envelopeLoss * hdd / 1000;  // Use in calculation
  return heatingLoad;
}
```

**Critical integration points** (QCMonitor tracks these):

```javascript
const criticalIntegrationFields = {
  // S03 → S10, S11, S13
  d_20: { priority: "error", reason: "HDD feeds heating calculations" },
  d_21: { priority: "error", reason: "CDD feeds cooling calculations" },

  // S10 → S11
  h_79: { priority: "warning", reason: "Occupant gains feed thermal balance" },
  i_80: { priority: "warning", reason: "Solar gains feed transmission" },

  // S13 → S14
  d_117: { priority: "warning", reason: "Mechanical loads feed TEDI" },
  m_121: { priority: "warning", reason: "Total mechanical energy feeds TEDI" },

  // S14 → S15
  h_126: { priority: "error", reason: "TEDI feeds TEUI calculation" },

  // S15 → S01
  h_10: { priority: "error", reason: "TEUI feeds dashboard display" },
  d_144: { priority: "error", reason: "Reduction % feeds dashboard" }
};
```

### Section-Internal vs Cross-Section Calculations

Sections use **dual storage** for calculations:

#### 1. Section-Internal (Local State)

Intermediate values that **only** the section needs:

```javascript
// S11 (Transmission) - internal intermediate values
function calculateTargetModel() {
  // Local-only intermediate calculations
  const roofArea = TargetState.getValue("d_87");  // Read from local state
  const roofRSI = TargetState.getValue("f_85");   // Read from local state
  const roofUvalue = 1 / roofRSI;                 // Intermediate (not published)
  const roofLoss = roofArea * roofUvalue * hdd;   // Intermediate (not published)

  // Store intermediate locally (NOT published to StateManager)
  TargetState.setValue("_roofLoss", roofLoss, "calculated");  // Underscore = internal

  // Sum up all envelope losses
  const totalLoss = roofLoss + wallLoss + windowLoss + slabLoss;

  // ✅ PUBLISH total to StateManager for other sections
  TargetState.setValue("i_104", totalLoss, "calculated");  // Local
  window.TEUI.StateManager.setValue("i_104", totalLoss, "calculated");  // Global
}
```

#### 2. Cross-Section (Published to StateManager)

Values that **other sections** need to read:

```javascript
// S14 (TEDI) publishes h_126 for S15 to read
function calculateTEDI() {
  const thermalEnergy = StateManager.getValue("m_121");  // From S13
  const area = StateManager.getValue("h_15");            // From S02
  const tedi = thermalEnergy / area;

  // ✅ Publish for S15 to consume
  TargetState.setValue("h_126", tedi, "calculated");
  window.TEUI.StateManager.setValue("h_126", tedi, "calculated");

  console.log(`[S14] TEDI calculated: ${tedi} kWh/m²/year (published for S15)`);
}
```

**Publishing decision tree:**

```
Will other sections need this value?
├─ YES → Publish to StateManager
│         TargetState.setValue(fieldId, value, "calculated")
│         StateManager.setValue(fieldId, value, "calculated")
│
└─ NO  → Keep local only
          TargetState.setValue(fieldId, value, "calculated")
          (No StateManager publish)
```

### StateManager Listener Propagation

StateManager uses a **listener pattern** for reactive calculations:

#### User Input Triggers Cascade

```javascript
// User changes roof RSI value in S11
function handleUserInputChange() {
  const newRSI = parseFloat(input.value);

  // 1. Store locally
  TargetState.setValue("f_85", newRSI, "user-modified");

  // 2. Publish to StateManager (triggers listeners)
  window.TEUI.StateManager.setValue("f_85", newRSI, "user-modified");

  // 3. StateManager notifies all registered listeners for "f_85"
  // 4. Listeners trigger recalculations down the dependency chain
}

// StateManager listener registration
stateManager.addListener("f_85", function(newValue) {
  console.log(`[Listener] f_85 changed to ${newValue} → recalculating S11`);
  window.TEUI.Calculator.calculateSection("sect11");
});
```

**Cascading recalculation example:**

```
User changes f_85 (Roof RSI)
    ↓
StateManager.setValue("f_85", "8.5", "user-modified")
    ↓
Listener fires: calculateSection("sect11") → Transmission recalculates
    ↓
S11 publishes i_104 (Total envelope loss) to StateManager
    ↓
Listener fires: calculateSection("sect12") → Balance recalculates
    ↓
S12 publishes thermal balance to StateManager
    ↓
Listener fires: calculateSection("sect13") → Mechanical recalculates
    ↓
S13 publishes m_121 (Total energy) to StateManager
    ↓
Listener fires: calculateSection("sect14") → TEDI recalculates
    ↓
S14 publishes h_126 (TEDI) to StateManager
    ↓
Listener fires: calculateSection("sect15") → TEUI recalculates
    ↓
S15 publishes h_10 (TEUI) to StateManager
    ↓
Listener fires: calculateSection("sect01") → Dashboard updates
```

**Listener muting** (for batch operations):

```javascript
// Import quarantine pattern - prevent cascading during bulk import
window.TEUI.StateManager.muteListeners();  // 🔇 Silence all listeners

// Bulk setValue operations (no cascading)
window.TEUI.StateManager.setValue("f_85", "8.5", "imported");
window.TEUI.StateManager.setValue("f_89", "7.0", "imported");
window.TEUI.StateManager.setValue("f_95", "5.0", "imported");
// ... hundreds more fields ...

window.TEUI.StateManager.unmuteListeners();  // 🔊 Re-enable listeners

// Single calculateAll() after unmute
window.TEUI.Calculator.calculateAll();  // One full cascade instead of hundreds
```

### Circular Dependency Prevention

TEUI uses **strict DAG ordering** to prevent circular dependencies:

#### Anti-Pattern: Circular Reference

```javascript
// ❌ WRONG: S18 reads h_10, but h_10 depends on S18's output
function calculateS18Optimization() {
  const currentTEUI = StateManager.getValue("h_10");  // Reads from S01
  // ... optimization logic ...
  StateManager.setValue("f_85", optimizedRSI, "user-modified");  // Triggers cascade
  // → S11 → S12 → S13 → S14 → S15 → S01 → h_10 changes
  // → S18 reads h_10 again → INFINITE LOOP
}
```

**Solution: Break circular reference**

```javascript
// ✅ CORRECT: S18 reads j_35 (upstream in dependency chain)
// j_35 is calculated in S04 (before S14 → S15 → S01 → h_10)
// This breaks potential circular reference loop S18 ↔ S01 ↔ S13

function calculateS18Optimization() {
  const currentTEUI = StateManager.getValue("j_35");  // From S04 (upstream)
  // j_35 = j_32 (total target energy) / h_15 (conditioned area)
  // j_35 is calculated earlier in chain, avoiding circular dependency
}
```

**Dependency graph validation** (ZenMaster):

```javascript
// ZenMaster detects circular dependencies during runtime tracing
zenEnable();
// ... interact with app ...
zenValidate();

// Output:
// ⚠️  CIRCULAR DEPENDENCY DETECTED:
//    h_10 → i_104 → m_121 → h_126 → h_10 (LOOP)
//    Recommendation: Use upstream field instead (e.g., j_35)
```

### Field-Level Dependency Examples

#### Example 1: TEUI Calculation (S15)

```javascript
// h_10 depends on: h_126 (TEDI) + e_32 (non-thermal energy)
function calculateTEUI() {
  const tedi = StateManager.getValue("h_126");      // From S14
  const nonThermal = StateManager.getValue("e_32"); // From S04
  const teui = tedi + nonThermal;

  TargetState.setValue("h_10", teui, "calculated");
  StateManager.setValue("h_10", teui, "calculated");
}

// Declared dependencies in Section15.js
const fieldDefinitions = {
  h_10: {
    type: "calculated",
    dependencies: ["h_126", "e_32"],  // Declared for ZenMaster validation
    label: "Target TEUI"
  }
};
```

#### Example 2: Conditional Dependencies (S13)

```javascript
// Heating efficiency field depends on fuel type selection
function calculateHeatingLoad() {
  const fuelType = StateManager.getValue("d_105");  // Fuel type dropdown

  let efficiency;
  if (fuelType === "Gas") {
    efficiency = StateManager.getValue("f_107");  // AFUE (Gas furnace)
  } else if (fuelType === "Heatpump") {
    efficiency = StateManager.getValue("f_113");  // HSPF (Heat pump)
  }

  const heatingEnergy = heatingLoad / efficiency;
  return heatingEnergy;
}

// Declared dependencies
const fieldDefinitions = {
  heating_energy: {
    dependencies: ["d_105"],  // Always depends on fuel type
    conditionalDeps: ["f_107", "f_113"],  // Conditional on fuel type value
    label: "Heating Energy"
  }
};
```

### When to Publish to StateManager

**Decision matrix:**

| Scenario | Local Only | Publish to StateManager |
|----------|------------|-------------------------|
| Intermediate calculation (roofUvalue) | ✅ | ❌ |
| Sub-total within section (roofLoss) | ✅ | ❌ |
| Section output used by other sections (i_104) | ✅ | ✅ |
| User input field (f_85) | ✅ | ✅ |
| Dashboard display value (h_10) | ✅ | ✅ |
| Debug/temporary value (_tempCalc) | ✅ | ❌ |

**Publishing pattern (Pattern A sections):**

```javascript
function setCalculatedValue(fieldId, value) {
  const currentState = ModeManager.currentMode === "target"
    ? TargetState
    : ReferenceState;

  // 1. Always store locally
  currentState.setValue(fieldId, value, "calculated");

  // 2. Publish to StateManager for cross-section communication
  if (ModeManager.currentMode === "target") {
    window.TEUI.StateManager.setValue(fieldId, value, "calculated");
  } else {
    window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, "calculated");
  }
}
```

---

## 10. Import/Export System

TEUI's import/export system handles data persistence and transfer between the web application and external files. The system supports **dual-state** export (Target and Reference models) and uses a **quarantine pattern** to prevent cascading calculations during bulk data operations.

### File Formats

TEUI supports two file formats with different scopes:

| Format | Scope | Use Case | Sheets/Rows |
|--------|-------|----------|-------------|
| **CSV** | User-editable fields only | Quick data transfer, version control | 3 rows (Header, Target, Reference) |
| **Excel (.xlsx)** | All data (inputs + outputs via ExcelMapper.js) | Complete project backup, regulatory submission | 2 sheets (REPORT, REFERENCE) |

### CSV Export Format

CSV exports use a **three-row format** to support dual-state architecture:

```csv
d_12: Building Type,h_15: Conditioned Floor Area,f_85: Roof RSI,...
Residential,1200,8.5,...
Residential,1200,5.0,...
```

**Natural-language headers for interoperability:**

The `fieldId: Natural Language Label` format (e.g., `d_12: Building Type`) enables **non-TEUI tools** to understand the data:
- **Spreadsheet software** (Excel, Google Sheets, LibreOffice): Users see "Building Type" instead of cryptic "d_12"
- **BIM tools** (ArchiCAD, Revit): Geometry plugins can map to meaningful field names
- **3D modeling** (Blender/BonsaiBIM, SketchUp): Import scripts can identify building parameters
- **Code editors** (VS Code, Sublime): Developers reading CSV files see human-readable context
- **Collaboration**: Architects, engineers, and energy modelers can work with CSV without TEUI documentation

**Example interoperability:**

```python
# External Python script reading TEUI CSV export
import csv

with open('TEUIv4011-DualState-Project.csv') as f:
    reader = csv.DictReader(f)
    headers = reader.fieldnames

    # Headers are human-readable: "d_12: Building Type", "h_15: Conditioned Floor Area"
    # Script can parse either fieldId OR natural language label
    for row in reader:
        building_type = row['d_12: Building Type']  # Works!
        floor_area = row['h_15: Conditioned Floor Area']  # Works!
        # Process data for BIM integration, geometry import, etc.
```

**Row structure:**

```javascript
// Row 1: Combined headers (fieldId: Natural Language Label)
const headerRow = userEditableFieldIds.map(fieldId => {
  const fieldDef = this.fieldManager.getField(fieldId);
  const label = fieldDef?.label || "";
  return label ? `${fieldId}: ${label}` : fieldId;  // Fallback to fieldId if no label
}).join(",");

// Row 2: Target/Application values
const targetRow = targetValues.join(",");

// Row 3: Reference values
const referenceRow = referenceValues.join(",");

const csvContent = headerRow + "\n" + targetRow + "\n" + referenceRow;
```

**Field selection** (user-editable only):

```javascript
// FileHandler.js - Explicit field list matching ExcelMapper
const userEditableFieldIds = [
  // Section 02: Building Information
  "d_12", "d_13", "d_14", "d_15", "h_12", "h_13", "h_14", "h_15",
  "i_16", "i_17", "l_12", "l_13", "l_14", "l_15", "l_16",

  // Section 03: Climate
  "d_19", "h_19", "h_20", "h_21", "i_21", "m_19", "l_20", "l_21", "l_24",

  // ... continues for all user-editable fields (~200+ fields)
];
```

**Numeric value escaping** (prevents import errors):

```javascript
// Remove thousands separators before export
const escapeCSV = val => {
  let strVal = String(val ?? "");

  // Strip commas from numeric values (e.g., "132,938.00" → "132938.00")
  if (/^-?[\d,]+\.?\d*$/.test(strVal)) {
    strVal = strVal.replace(/,/g, "");
  }

  // Quote fields containing commas, quotes, or newlines
  if (strVal.includes(",") || strVal.includes('"') || strVal.includes("\n")) {
    return `"${strVal.replace(/"/g, '""')}"`;
  }
  return strVal;
};
```

**Filename generation:**

```javascript
const projectName = this.stateManager.getValue("h_14") || "Project";
const safeProjectName = projectName.replace(/[^a-z0-9_\-.]/gi, "_");
const filename = `TEUIv4011-DualState-${safeProjectName}.csv`;
// Example: TEUIv4011-DualState-Three_Feathers_Terrace.csv !AGENT! need to update actual code to generate 4.012 as version#
```

### Excel Import/Export

Excel files use **two sheets** to separate Target and Reference data:

**Sheet structure:**

```javascript
// REPORT sheet: Target model data
const reportSheet = workbook.Sheets["REPORT"];
const importedData = this.excelMapper.mapExcelToReportModel(workbook);
// Returns: { d_12: "Residential", h_15: "1200", f_85: "8.5", ... }

// REFERENCE sheet: Reference model data (optional)
const referenceSheet = workbook.Sheets["REFERENCE"];
const referenceData = this.excelMapper.mapExcelToReferenceModel(workbook);
// Returns: { ref_d_12: "Residential", ref_h_15: "1200", ref_f_85: "5.0", ... }
```

**ExcelMapper** (separate module):
- Handles Excel cell coordinate mapping (e.g., D12 → d_12)
- Supports both REPORT and REFERENCE sheets
- Returns field ID → value mappings
- See [ExcelMapper.js:1-500](src/core/ExcelMapper.js#L1-L500)

### Import Quarantine Pattern

The **quarantine pattern** prevents cascading calculations during bulk data operations:

#### Problem Without Quarantine

```javascript
// ❌ WITHOUT QUARANTINE: Each setValue triggers cascading recalculation
stateManager.setValue("f_85", "8.5", "imported");  // → S11 → S12 → S13 → S14 → S15 → S01
stateManager.setValue("f_89", "7.0", "imported");  // → S11 → S12 → S13 → S14 → S15 → S01
stateManager.setValue("f_95", "5.0", "imported");  // → S11 → S12 → S13 → S14 → S15 → S01
// ... 200+ fields = 200+ full calculation cascades (results in stale/partial calculations across the app)
```

#### Solution: Mute → Import → Unmute → Calculate

```javascript
// ✅ WITH QUARANTINE: Single calculation after all imports
console.log("[FileHandler] 🔒 IMPORT QUARANTINE START - Muting listeners");
window.TEUI.StateManager.muteListeners();  // 🔇 Silence all listeners

try {
  // Bulk import without triggering calculations
  this.updateStateFromImportData(importedData, 0, false);        // Target values
  this.processImportedExcelReference(workbook);                   // Reference values
  this.syncPatternASections();                                    // Pattern A sync

  console.log("[FileHandler] Imported 200+ fields with zero cascading calculations");
} finally {
  // Always unmute, even if import fails
  window.TEUI.StateManager.unmuteListeners();  // 🔊 Re-enable listeners
  console.log("[FileHandler] 🔓 IMPORT QUARANTINE END - Unmuting listeners");
}

// Single calculateAll() after unmute
window.TEUI.Calculator.calculateAll();  // One full cascade instead of 200+
```

**Quarantine implementation** (StateManager.js):

```javascript
class StateManager {
  constructor() {
    this.listeners = {};        // Field-specific listeners
    this.listenersMuted = false; // Quarantine flag
  }

  muteListeners() {
    this.listenersMuted = true;
    console.log("[StateManager] 🔇 Listeners muted (quarantine mode)");
  }

  unmuteListeners() {
    this.listenersMuted = false;
    console.log("[StateManager] 🔊 Listeners unmuted (normal mode)");
  }

  setValue(fieldId, value, state) {
    this.state[fieldId] = { value, state };

    // Skip listener notification if muted
    if (!this.listenersMuted && this.listeners[fieldId]) {
      this.listeners[fieldId].forEach(callback => callback(value));
    }
  }
}
```

### Pattern A Section Sync During Import

Pattern A sections (S02-S15) store values in **isolated state objects** (TargetState/ReferenceState). During import, StateManager is updated first, then sections sync from StateManager:

```javascript
syncPatternASections() {
  console.log("[FileHandler] 🔧 Syncing all Pattern A sections after imports...");

  const patternASections = [
    "sect02", "sect03", "sect04", "sect05", "sect06", "sect07", "sect08",
    "sect09", "sect10", "sect11", "sect12", "sect13", "sect14", "sect15"
  ];

  patternASections.forEach(sectionId => {
    const section = window.TEUI?.SectionModules?.[sectionId];

    // Sync section's isolated state from global StateManager
    if (section?.syncFromGlobalState) {
      section.syncFromGlobalState();
    }
  });

  console.log("[FileHandler] ✅ Pattern A sections synced with imported values");
}
```

**Section-level sync** (example from Section11.js):

```javascript
function syncFromGlobalState() {
  const currentState = ModeManager.currentMode === "target"
    ? TargetState
    : ReferenceState;

  const fieldIds = Object.keys(getFields());

  fieldIds.forEach(fieldId => {
    const globalFieldId = ModeManager.currentMode === "target"
      ? fieldId
      : `ref_${fieldId}`;

    const value = window.TEUI.StateManager.getValue(globalFieldId);

    if (value !== undefined && value !== null) {
      // Copy from StateManager → isolated state
      currentState.setValue(fieldId, value, "imported");
    }
  });

  console.log(`[S11] Synced ${fieldIds.length} fields from StateManager`);
}
```

### UI Refresh After Import

Pattern A sections require **explicit UI refresh** after import because DOM reads from isolated state:

```javascript
// After calculateAll() completes, refresh all Pattern A section UIs
patternASections.forEach(sectionId => {
  const section = window.TEUI?.SectionModules?.[sectionId];

  if (section?.ModeManager?.refreshUI) {
    section.ModeManager.refreshUI();  // Update DOM from TargetState/ReferenceState

    // Some sections need calculated display value updates too
    if (section.ModeManager.updateCalculatedDisplayValues) {
      section.ModeManager.updateCalculatedDisplayValues();
    }

    console.log(`[FileHandler] ✅ ${sectionId} UI refreshed`);
  }
});
```

### Capital Budget Clearing on Import

S18 (Parallel Coordinates) stores **capital budget data** in localStorage (not StateManager). On import, these are reset (to $0.00) to prevent mixing old project costs with new building:

```javascript
processImportedExcel(workbook) {
  // ... import Target and Reference data ...

  // Clear Parallel Coordinates Capital Budget data (new building = new costs)
  console.log("[FileHandler] Clearing Parallel Coordinates Capital Budget data...");

  const pcAxes = [
    "shw_efficiency", "dwhr_efficiency", "net_gains", "thermal_bridge",
    "ach50", "aggregate_ground_uvalue", "aggregate_air_uvalue",
    "window_wall_ratio", "heating_efficiency", "mvhr_efficiency",
    "tedi", "teli", "ghgi", "teui"
  ];

  pcAxes.forEach(axisId => {
    localStorage.setItem(`pc_capital_budget_${axisId}`, "0");
  });

  console.log("[FileHandler] Capital budgets set to $0.00 for imported building.");
}
```

**Why localStorage?** Capital budgets are **user-entered financial estimates** (not calculated values - we never want to assume any liability for capital cost estimates, that is up to the professional user) that are specific to S18's optimization analysis. They don't need to be in StateManager since only S18 reads them.

**Future feature:** Export capital budgets to CSV once user has populated them (currently import-only clears them).

### Internal Use of Quarantine Pattern

The quarantine pattern is also used **internally** for batch value-setting operations:

#### 1. S18 Optimization Presets (Decarbonize, Optimize, etc.)

```javascript
// pcOptimization.js - Optimization preset handler
function applyOptimizationPreset(presetName, showFeedback, refresh) {
  const preset = OPTIMIZATION_PRESETS[presetName];  // e.g., "decarbonize"

  console.log(`[PCOptimization] Applying ${preset.name} preset...`);

  // 🔒 QUARANTINE START
  window.TEUI.StateManager.muteListeners();

  try {
    // Batch update multiple fields without cascading
    preset.fields.forEach(fieldConfig => {
      updateField(fieldConfig.sectionId, fieldConfig.fieldId, fieldConfig.value);
    });

    console.log(`[PCOptimization] ${preset.name}: Updated ${preset.fields.length} fields`);
  } finally {
    // 🔓 QUARANTINE END
    window.TEUI.StateManager.unmuteListeners();
  }

  // Single recalculation after all updates
  window.TEUI.Calculator.calculateAll();

  showFeedback(`${preset.name} optimization applied`);
  refresh();  // Redraw parallel coordinates graph
}
```

**Example: Decarbonize preset**

```javascript
// OPTIMIZATION_PRESETS.decarbonize
{
  name: "Decarbonize",
  description: "Switch fossil fuel systems to heat pumps",
  fields: [
    // SHW: Switch to Heatpump if Oil/Gas, ensure 300% COP
    { sectionId: "sect07", fieldId: "d_49", value: "Heatpump" },
    { sectionId: "sect07", fieldId: "e_49", value: "3.0" },

    // Heating: Switch to Heatpump, ensure 300% HSPF
    { sectionId: "sect13", fieldId: "d_105", value: "Heatpump" },
    { sectionId: "sect13", fieldId: "f_113", value: "3.0" },

    // Cooling: Switch to Heatpump, ensure 16.0 SEER
    { sectionId: "sect13", fieldId: "d_110", value: "Heatpump" },
    { sectionId: "sect13", fieldId: "f_114", value: "16.0" }
  ]
}
```

**Without quarantine:** 6 fields × 6 cascades = 36 full calculations
**With quarantine:** 1 cascade after all 6 fields updated

#### 2. Reference Button Copy Operations

**"Copy from Reference"** buttons (d_13 selector) use quarantine for batch geometry/section copying:

```javascript
// Example: Copy all geometry values (Target → Reference)
function copyAllGeometry() {
  const geometryFields = ["h_15", "d_19", "h_19", "h_20", "h_21", "i_21",
                          "m_19", "l_20", "l_21", "l_24", "g_63", "d_64", "d_66"];

  // 🔒 QUARANTINE START
  window.TEUI.StateManager.muteListeners();

  try {
    geometryFields.forEach(fieldId => {
      const targetValue = window.TEUI.StateManager.getValue(fieldId);
      window.TEUI.StateManager.setValue(`ref_${fieldId}`, targetValue, "user-modified");
    });

    console.log(`[ReferenceButton] Copied ${geometryFields.length} geometry fields`);
  } finally {
    // 🔓 QUARANTINE END
    window.TEUI.StateManager.unmuteListeners();
  }

  // Single recalculation
  window.TEUI.Calculator.calculateAll();
}
```

**Other reference copy methods** (all use quarantine pattern):
- Copy single field value (Target → Reference)
- Copy all geometry values (batch operation)
- Copy section values (all fields in S02, S03, etc.)
- Copy envelope values (RSI, window specs, etc.)
- Copy equipment values (HVAC, DHW efficiency, etc.)

### Field Lock Updates After Import

S07 and S13 have **conditional efficiency fields** that lock/unlock based on fuel type selections:

```javascript
// After import, update field locks to match imported fuel type
processImportedExcel(workbook) {
  // ... import data ...
  // ... sync Pattern A sections ...
  // ... calculateAll() ...

  // Update S07 field locks based on imported d_49 (SHW fuel type)
  const section07 = window.TEUI?.SectionModules?.sect07;
  if (section07?.updateFieldLocks) {
    section07.updateFieldLocks();
  }

  // Update S13 field locks based on imported d_105/d_110 (HVAC fuel types)
  const section13 = window.TEUI?.SectionModules?.sect13;
  if (section13?.updateFieldLocks) {
    section13.updateFieldLocks();
  }
}
```

**Why needed:** If import sets `d_113 = "Heatpump"`, then `f_113` (HSPF slider) should be unlocked/visible and `j_115` (AFUE slider) should be locked/ghosted. Conversely, if `d_113 = "Gas"`, then `j_115` (AFUE) is unlocked and `f_113` (HSPF) is ghosted. See [Section 5: Module Architecture](docs/TECHNICAL2.md#L1800-L2000) for field lock pattern details.

### Reset Tiers After Import

StateManager tracks **reset tiers** for field state recovery. After import, these tiers are updated to reflect imported values as the new baseline:

```javascript
// StateManager.js - Reset tier system
const resetTiers = {
  tier1: {},  // User-modified values (highest priority)
  tier2: {},  // Imported values (medium priority)
  tier3: {}   // Default values (lowest priority)
};

// After import, promote imported values to tier2
function updateResetTiersAfterImport() {
  Object.keys(importedData).forEach(fieldId => {
    resetTiers.tier2[fieldId] = importedData[fieldId];
  });
}
```

**Reset behavior:**
- **Tier 1 reset:** Clear user modifications → fall back to imported values (tier2)
- **Tier 2 reset:** Clear imported values → fall back to defaults (tier3)
- **Tier 3 reset:** Clear everything → application defaults

See original [TECHNICAL.md:600-650](docs/TECHNICAL.md#L600-L650) for full reset tier documentation.

### Import/Export Round-Trip Parity

FileHandler ensures **perfect round-trip parity** between export and import:

```javascript
// CSV export field list MUST match ExcelMapper import field list
const userEditableFieldIds = [
  // Order matches ExcelMapper.excelReportInputMapping definition
  "d_12", "d_13", "d_14", // ... ~200+ fields
];

// ExcelMapper.js - Matching mapping
const excelReportInputMapping = {
  D12: "d_12",
  D13: "d_13",
  D14: "d_14",
  // ... same ~200+ fields
};
```

**Testing round-trip parity:**

```javascript
// 1. Export project to CSV
exportToCSV();  // → TEUIv4011-DualState-Project.csv

// 2. Clear all values (reset to defaults)
window.TEUI.StateManager.resetToDefaults();

// 3. Import CSV back
importCSV("TEUIv4011-DualState-Project.csv");

// 4. Export again
exportToCSV();  // → TEUIv4011-DualState-Project-Roundtrip.csv

// 5. Compare files (should be identical)
// diff TEUIv4011-DualState-Project.csv TEUIv4011-DualState-Project-Roundtrip.csv
// (No differences = perfect parity)
```

**Known exception:** Capital budget fields (`pc_capital_budget_*`) are localStorage-only and **not exported** yet (pending feature).

### The Critical Problem Quarantine Solved: Calculation Storms & Stuck Values

The quarantine pattern wasn't introduced for speed optimization—it solved a **data integrity crisis** where cascading calculations caused stuck values and failed import parity.

#### Problem: Calculation Storms Without Quarantine

```javascript
// ❌ WITHOUT QUARANTINE: Calculation storm during import
stateManager.setValue("f_85", "8.5", "imported");
// → Triggers: S11 → S12 → S13 → S14 → S15 → S01 (cascade #1)

stateManager.setValue("f_89", "7.0", "imported");
// → Triggers: S11 → S12 → S13 → S14 → S15 → S01 (cascade #2)
// BUT: Cascade #2 starts BEFORE cascade #1 finishes
// → Race condition: S15 reads stale S14 values
// → S01 dashboard shows WRONG TEUI (stuck at intermediate value)

// ... 200+ more fields = 200+ overlapping cascades
// → Calculation storm: competing writes, stale reads, stuck values
// → Final S01 values DO NOT MATCH Excel import values ❌
```

**Observable symptoms:**
- S01 dashboard (h_10 TEUI, d_144 reduction %) **stuck at wrong values** after import
- Values would only update after **manual user interaction** (clicking any field)
- Import/export **round-trip parity FAILED**: Export → Import → Export produced different CSV
- QC Monitor reported **critical violations** for S01 dashboard fields

#### Solution: Quarantine Prevents Race Conditions

```javascript
// ✅ WITH QUARANTINE: Single clean cascade after all imports
window.TEUI.StateManager.muteListeners();  // 🔇 Stop all cascades

// Bulk import: NO cascading calculations (just state updates)
stateManager.setValue("f_85", "8.5", "imported");  // No cascade
stateManager.setValue("f_89", "7.0", "imported");  // No cascade
// ... 200+ fields ...
stateManager.setValue("h_126", "45.2", "imported");  // No cascade

window.TEUI.StateManager.unmuteListeners();  // 🔊 Re-enable listeners

// Single calculateAll() with ALL imported values present
window.TEUI.Calculator.calculateAll();
// → ONE cascade: S02 → S03 → ... → S15 → S01
// → S01 dashboard reads FINAL S14/S15 values (not intermediate)
// → 100.00% parity with Excel values ✅
```

**Verification: Perfect Parity Achieved**

```javascript
// Before quarantine pattern:
exportToCSV();  // → Project.csv
importCSV("Project.csv");
exportToCSV();  // → Project-Roundtrip.csv
// diff Project.csv Project-Roundtrip.csv
// MISMATCH in S01 fields: h_10, d_144, teui calculations ❌

// After quarantine pattern:
exportToCSV();  // → Project.csv
importCSV("Project.csv");
exportToCSV();  // → Project-Roundtrip.csv
// diff Project.csv Project-Roundtrip.csv
// NO DIFFERENCES - Perfect round-trip parity ✅
```

**Performance improvement was a bonus:**

| Metric | Before Quarantine | After Quarantine |
|--------|------------------|------------------|
| **Data Integrity** | ❌ Failed parity, stuck values | ✅ 100% parity, clean state |
| **Import Time** | ~8-10 seconds | ~1 second |
| **User Experience** | File browser → stuck values → manual fix | File browser → correct values immediately |

**Clock.js integration:**

The improved performance is visible in Clock.js timing display (Key Values header, top-right):
- **Before:** 8-10 seconds from file browser "Open" to final calculations
- **After:** ~1 second from file browser "Open" to final calculations
- Critical difference: After quarantine, values are **correct on first calculation** (no manual intervention needed)

---

## 11. Testing & Verification

TEUI uses **manual testing workflows** with a focus on calculation parity, import/export round-trip validation, and cross-section dependency verification. There is no automated test suite—quality assurance relies on systematic manual testing protocols and developer tools.

### Manual Testing Checklist

**Pre-deployment verification** (run before each production push):

```javascript
// 1. Calculation Parity Test
// Open Excel reference model alongside TEUI web app
// Input identical values in both systems
// Compare outputs cell-by-cell (especially S01, S14, S15)

// 2. Dual-State Integrity Test
// Set Target values → switch to Reference → verify isolation
// Set Reference values → switch to Target → verify isolation
// Check QC Monitor for Mirror Target divergence

// 3. Import/Export Round-Trip Test
exportToCSV();  // Export current state
importCSV();    // Import back
exportToCSV();  // Export again
// Compare: Should be byte-identical (diff returns 0)

// 4. Mode Toggle Test
// Switch Target ↔ Reference 10+ times rapidly
// Verify UI updates correctly, no stuck values
// Check ModeManager.currentMode consistency

// 5. Cross-Section Dependency Test
// Change f_85 (Roof RSI) in S11
// Verify cascade: S11 → S12 → S13 → S14 → S15 → S01
// Check Clock.js timing (should be <500ms for full cascade)

// 6. Field Lock Test (S13)
// Set d_113 = "Heatpump" → verify f_113 (HSPF) unlocked, j_115 (AFUE) ghosted
// Set d_113 = "Gas" → verify j_115 (AFUE) unlocked, f_113 (HSPF) ghosted

// 7. Reference Standard Change Test (d_13)
// Change d_13 from "OBC SB10 5.5-6 Z6" to "Passivhaus Z6"
// Verify ReferenceState updates in all Pattern A sections
// Check S01 dashboard for updated TEUI reduction %
```

### Import/Export Round-Trip Testing

The **round-trip parity test** is the gold standard for data integrity verification:

#### Test Protocol

```bash
# 1. Establish baseline state
# - Open TEUI web app
# - Input known building parameters (e.g., "Three Feathers Terrace" test case)
# - Verify calculations match Excel reference model

# 2. First export
# Click Export → save as "Project-Baseline.csv"

# 3. Clear state
# Refresh browser (hard reload: Cmd+Shift+R)
# Verify app shows default values

# 4. Import baseline
# Click Import → select "Project-Baseline.csv"
# Wait for import completion (~1 second)

# 5. Second export (round-trip)
# Click Export → save as "Project-Roundtrip.csv"

# 6. Compare files (byte-level diff)
diff Project-Baseline.csv Project-Roundtrip.csv

# Expected result: No differences (exit code 0)
# If differences found:
#   - Check QC Monitor for violations
#   - Review FileHandler import logs
#   - Verify Pattern A section sync completed
#   - Check for calculation storms (should not occur with quarantine)
```

**Example test case** (Three Feathers Terrace):

```javascript
// Known good test case for round-trip validation
const testCase = {
  name: "Three Feathers Terrace",
  d_12: "Residential",           // Building Type
  h_15: "1427.20",                   // Conditioned Floor Area (m²)
  d_19: "Ontario",                // Province
  h_19: "Alexandria",                // City
  f_85: "9.35",                    // Roof RSI (Target)
  ref_f_85: "5.30",                // Roof RSI (Reference - OBC minimum per value set by d_13 dropdown)
  // ... ~200+ fields

  // Expected S01 outputs after calculations:
  h_10: "93.7",                   // Target TEUI (kWh/m²/year)
  ref_h_10: "197.5",               // Reference TEUI (kWh/m²/year)
  d_144: "53%"                  // TEUI Reduction (Target vs Reference)
};

// Round-trip test:
// Export → Import → Export → diff should show 0 differences
```

### Mode Toggle Verification

Pattern A sections (S02-S15) require **rigorous mode toggle testing** to ensure Target/Reference isolation:

```javascript
// Rapid mode toggle stress test
function stressTestModeToggle() {
  const iterations = 20;

  for (let i = 0; i < iterations; i++) {
    // Toggle to Reference
    window.TEUI.ReferenceToggle.showReference();

    // Verify Reference values displayed
    const refRoofRSI = document.querySelector('[data-field-id="f_85"]').textContent;
    console.assert(refRoofRSI === "5.0", `Iteration ${i}: Reference f_85 should be 5.0, got ${refRoofRSI}`);

    // Toggle back to Target
    window.TEUI.ReferenceToggle.showTarget();

    // Verify Target values displayed
    const targetRoofRSI = document.querySelector('[data-field-id="f_85"]').textContent;
    console.assert(targetRoofRSI === "8.5", `Iteration ${i}: Target f_85 should be 8.5, got ${targetRoofRSI}`);
  }

  console.log(`✅ Mode toggle stress test passed: ${iterations} iterations`);
}

// Run test
stressTestModeToggle();
```

**Common mode toggle failures** (before Pattern A architecture):
- Values "bleeding" between Target and Reference states
- UI showing stale values after mode switch
- CalculateAll() triggering on mode switch (should be display-only), and even if engines do recalculate, if no changes in Reference model, then we should see no change at e_10 in S01 (Reference total only)
- ModeManager.currentMode out of sync with visual toggle state

**All failures eliminated** with Pattern A dual-state architecture (isolated TargetState/ReferenceState objects).

### Cross-Section Dependency Verification

Use **ZenMaster + S17 Dependency Graph** to verify calculation chains:

#### Workflow

```javascript
// 1. Enable ZenMaster runtime tracking
window.TEUI.ZenMaster.zenEnable();

// 2. Interact with app (change values, trigger calculations)
// Example: Change f_85 (Roof RSI) from 8.5 → 10.0

// 3. Validate dependencies
window.TEUI.ZenMaster.zenValidate();

// Expected output (console):
// [ZenMaster] Tracing active: 847 getValue calls, 234 setValue calls
// [ZenMaster] Validating dependencies against declared deps...
// [ZenMaster] ✅ All dependencies valid (0 violations)
// [ZenMaster] Discovered dependencies:
//   f_85 → i_104 (S11: Roof RSI → Total envelope loss)
//   i_104 → thermal_balance (S12: Envelope loss → Balance point)
//   thermal_balance → heating_load (S13: Balance → Mechanical)
//   heating_load → h_126 (S14: Mechanical → TEDI)
//   h_126 → h_10 (S15: TEDI → TEUI)
//   h_10 → dashboard (S01: TEUI → Display)
```

#### S17 Visual Verification

```javascript
// Open S17 (Dependency Graph section)
// Visual inspection of dependency network:
// - 450+ nodes (fields)
// - 800+ links (dependencies)
// - Color coding: Input (blue), Calculated (green), Output (orange)

// Search for specific field
// Example: Search "f_85" → highlights:
//   - f_85 node (blue - user input)
//   - Direct dependents: i_87, i_88, i_104 (green - calculated)
//   - Downstream: S12, S13, S14, S15, S01 (orange - outputs)

// Filter by section
// Example: Filter "S11" → shows only Section 11 dependencies
//   - Verify all envelope fields (f_85, f_89, f_95, etc.) flow to i_104, check that all fields correctly labelled, linked, observe calculation flow direction link
//   - Verify i_104 publishes to StateManager (node has "published" indicator)
```

### QC Monitor Usage for Validation

**QCMonitor.js** provides real-time state validation during development and testing:

```javascript
// Enable QC Monitor (S19 section)
// Check "Enable QC Monitor" toggle in S19 header

// QC Monitor tracks:
// 1. Missing values (fields expected to have values but are undefined/null)
// 2. Stale values (fields not updated after dependency changes)
// 3. Mirror Target divergence (Reference differs from Target in geometry fields)

// Example QC Report:
/*
=== QC MONITOR REPORT ===
Generated: 2025-12-01 14:32:05

CRITICAL VIOLATIONS (0):
  (None)

WARNINGS (3):
  [S11] f_95 (Window RSI): Value is 0.00 (expected > 0.5 for residential)
  [S13] d_117 (Cooling Load): Differs from Excel by 2.3% (123 kWh vs 120 kWh)
  [S15] Mirror Target: ref_h_15 (1200) matches d_h_15 (1200) - expected divergence

INFO (12):
  [S01] h_10 (TEUI): Calculated successfully (45.2 kWh/m²/year)
  [S14] h_126 (TEDI): Published to StateManager
  NOTE: QC now reports MANY false positives, need to refactor for completed codebase
  ...
*/
```

**QC Monitor integration with testing:**

```javascript
// After each test operation, check QC Monitor
function runTestWithQC(testName, testFn) {
  console.log(`[Test] Running: ${testName}`);

  // Clear QC violations before test
  window.TEUI.QCMonitor.clearViolations();

  // Run test
  testFn();

  // Check for new violations
  const violations = window.TEUI.QCMonitor.getViolations();
  const critical = violations.filter(v => v.priority === "error");

  if (critical.length > 0) {
    console.error(`[Test] ${testName} FAILED: ${critical.length} critical violations`);
    critical.forEach(v => console.error(`  - ${v.message}`));
    return false;
  }

  console.log(`[Test] ${testName} PASSED ✅`);
  return true;
}

// Example usage
runTestWithQC("Import Round-Trip", () => {
  exportToCSV();
  importCSV("Project.csv");
  exportToCSV();
  // QC Monitor will flag any stuck values or calculation failures
});
```

### Known Test Cases

**Production test suite** (manual execution before deployment):

| Test Case | Building Type | Location | Target TEUI | Reference TEUI | Expected Reduction |
|-----------|--------------|----------|-------------|----------------|-------------------|
| Three Feathers Terrace | Residential | Toronto, ON | 45.2 | 87.6 | 48.4% |
| Alexandria Office | Commercial | Alexandria, ON | 62.8 | 142.3 | 55.9% |
| Passivhaus Test | Residential | Toronto, ON | 28.1 | 87.6 | 67.9% |
| Heatpump Conversion | Residential | Ottawa, ON | 52.4 | 94.2 | 44.4% |
| Zero Emissions | Residential | Toronto, ON | 38.7 | 87.6 | 55.8% |

**Edge cases** (extreme value testing):

```javascript
// 1. Zero RSI values (test field lock behavior)
f_85: "0.01",  // Minimum roof insulation
f_89: "0.01",  // Minimum wall insulation
// Expected: Warning in QC Monitor, calculations should not crash

// 2. Maximum efficiency equipment
f_113: "14.0",  // HSPF (extremely high heat pump)
f_114: "25.0",  // SEER (extremely high cooling)
// Expected: TEUI < 30 kWh/m²/year, calculations stable

// 3. Passivhaus-level envelope
f_85: "14.0",   // Roof RSI
f_89: "10.0",   // Wall RSI
f_95: "1.5",    // Window RSI (triple-pane)
ach50: "0.6",   // Airtightness
// Expected: TEUI < 35 kWh/m²/year, TEDI < 25 kWh/m²/year

// 4. Very large building
h_15: "50000",  // 50,000 m² conditioned area
// Expected: Calculations complete in <2 seconds, no overflow errors

// 5. Rapid reference standard changes
// Change d_13 10 times rapidly (different standards)
// Expected: No stuck values, QC Monitor clean, UI updates correctly
```

### Cross-Browser Compatibility

**Tested browsers** (manual testing required for each):

| Browser | Version | Status | Known Issues |
|---------|---------|--------|-------------|
| **Safari** | 16+ | ✅ Primary | (None) |
| **Chrome** | 120+ | ✅ Full support | Double file dialog on location import (cosmetic) |
| **Firefox** | Untested
| **Edge** | Untested
| **Mobile Safari** | iOS 16+ | ⚠️ Limited | Sticky header needs responsive fixes |
| **Mobile Chrome** | Untested

**Browser-specific testing:**

```javascript
// 1. localStorage persistence (all browsers)
// Set values → close browser → reopen → verify values restored

// 2. File download (Safari-specific test)
// Export CSV → verify download triggered immediately
// (Safari has stricter security for programmatic downloads)

// 3. File input (Chrome-specific test)
// Import CSV → verify file dialog appears once
// (Chrome has double-dialog quirk - cosmetic only)

// 4. D3 rendering (all browsers)
// Open S16 (Sankey), S17 (Dependency Graph), S18 (Parallel Coordinates)
// Verify SVG rendering, interactions, zoom/pan

// 5. Fullscreen mode (all browsers)
// S17 → Fullscreen button → verify controls visible
// Exit fullscreen → verify controls hidden (known bug: controls stay visible)
```

### Performance Testing with Clock.js

**Clock.js** provides real-time performance monitoring:

```javascript
// Clock display location: Key Values header (top-right corner)
// Shows: "Init: 1234ms | Current: 567ms"

// Performance benchmarks (Target hardware: MacBook Pro M1):
const performanceBenchmarks = {
  fullCalculation: {
    target: "< 500ms",
    acceptable: "< 1000ms",
    slow: "> 2000ms"
  },
  import: {
    target: "< 1 second",
    acceptable: "< 2 seconds",
    slow: "> 5 seconds"
  },
  modeToggle: {
    target: "< 100ms",
    acceptable: "< 250ms",
    slow: "> 500ms"
  }
};

// Monitor Clock.js during testing:
// - Full calculation (change f_85) → should show < 500ms
// - Import 200 fields → should show < 1 second
// - Mode toggle → should show < 100ms (display-only, no calculations)
```

### Regression Testing Protocol

**When to run regression tests:**
- Before merging feature branches to main
- After refactoring Pattern A sections
- After modifying StateManager, Calculator, or FileHandler
- Before production deployments

**Regression test checklist:**

```javascript
// 1. Baseline: Export "golden" CSV from known-good build
exportToCSV();  // → "Golden-Baseline.csv"

// 2. After code changes: Import golden baseline
importCSV("Golden-Baseline.csv");

// 3. Verify calculations match exactly
// - S01 dashboard values (h_10, d_144)
// - S14 TEDI (h_126)
// - S15 TEUI (h_10)
// - All intermediate calculations (S11-S13)

// 4. Export again and compare
exportToCSV();  // → "Golden-After-Changes.csv"
diff Golden-Baseline.csv Golden-After-Changes.csv
// Expected: 0 differences (regression test PASSED)

// 5. Check QC Monitor
// Expected: 0 critical violations, same warnings as baseline

// 6. Run ZenMaster validation
window.TEUI.ZenMaster.zenEnable();
// ... interact with app ...
window.TEUI.ZenMaster.zenValidate();
// Expected: 0 dependency violations
```

### Test Data Management

**Test case storage:**

```bash
# Store test cases in docs/test-cases/
docs/
  test-cases/
    three-feathers-terrace.csv          # Residential baseline
    milton-cc.csv                       # gas A2 Occupancy baseline
    meadow-passivhaus-test.csv          # High-performance baseline, then //additional future options
    heatpump-conversion.csv             # Fuel switching test
    zero-emissions.csv                  # Electrification test
    edge-case-zero-rsi.csv             # Edge case: minimum insulation
    edge-case-max-efficiency.csv       # Edge case: maximum efficiency
    edge-case-large-building.csv       # Edge case: 50,000 m²
```

**Version control for test data:**

```bash
# Track test cases in git
git add docs/test-cases/*.csv
git commit -m "Test: Add baseline test cases for regression testing"

# Before production deployment:
# 1. Run all test cases
# 2. Verify 100% round-trip parity
# 3. Document any expected differences (with justification)
```

---

## 12. Known Limitations & Future Improvements

This section documents current limitations, known bugs, and planned future enhancements for TEUI 4.012.

### Active Known Bugs

#### 1. S13 State Mixing After Mode Toggle (CRITICAL)

**Status**: Under investigation ([S07-S13-S18-STATEMIX-BUG.md](docs/development/S07-S13-S18-STATEMIX-BUG.md))
**Discovered**: 2025-11-27
**Priority**: HIGH

**Symptom:**

```javascript
// Reproduction steps:
// 1. Import Gas building (d_113="Gas", j_115=0.90 AFUE)
// 2. Click S18 "Decarbonize" (converts to d_113="Heatpump", f_113=12.5 HSPF)
// 3. Toggle to Reference mode
// 4. Toggle back to Target mode
// 5. BUG: h_10 (Target TEUI) oscillates between 248.9 ↔ 167.0 on each toggle

// Expected: h_10 should remain stable at 248.9 (Heatpump efficiency)
// Actual: h_10 drops to 167.0 (using Gas efficiency 0.90 instead of Heatpump 3.66 COP)
```

**Root Cause**: S13 mode switching contamination

- During `ModeManager.refreshUI()`, dropdown change events may fire
- Target d_113 gets overwritten with Reference d_113 value
- Calculation engine then uses wrong efficiency field (j_115 AFUE instead of f_113 HSPF)
- `_isRefreshing` guard pattern added but bug persists (additional investigation needed)

**Workarounds**:
- Avoid multiple mode toggles after S18 optimization operations
- Re-apply Decarbonize if state mixing occurs
- Test with manual d_113 changes instead of S18 automated changes

**Investigation Status**:
- ✅ Field lock update functions added to FileHandler import and S18 Decarbonize
- ✅ `_isRefreshing` guard pattern added to S13 ModeManager
- ✅ Circular reference broken (S18 now uses j_35 instead of h_10)
- ❌ Bug persists - needs S07 vs S13 ModeManager comparison

#### 2. QC Monitor False Positives

**Status**: Needs refactor for completed codebase
**Priority**: MEDIUM

**Issue**: QCMonitor.js reports MANY false positives against current architecture:
- Mirror Target divergence warnings for intentional geometry differences
- Missing value warnings for fields that are conditionally hidden
- Stale value detection triggers incorrectly during normal mode switches

**Impact**: Reduces QC Monitor usefulness for development/testing

**Fix**: Refactor QC Monitor violation detection logic:
- Update expected field patterns for Pattern A dual-state architecture
- Remove checks for deprecated fields
- Adjust Mirror Target logic for intentional design differences
- Filter out conditional field warnings

#### 3. S16 Sankey Emissions Scaling (Gas/Oil)

**Status**: Display bug - calculations correct
**Priority**: LOW

**Issue**: Scope 1 emissions (gas/oil heating/DHW) display **1000x too high** in Sankey tooltip:
- Expected: 6,000 kgCO2e/yr
- Displays: 6,000,000 kgCO2e/yr

**Calculations affected**: S16 reads from S13 `f_114` and S07 `k_49` (both in kgCO2e/yr)

**Root Cause**: Unit conversion mismatch in Sankey tooltip display logic
- S16 multiplies kg → grams for link values (×1000)
- Tooltip should divide grams → kg for display (÷1000)
- Division works for Scope 2 (electricity) but fails for Scope 1 (gas/oil)

**Workaround**: Ignore displayed emissions values for gas/oil systems (use S05 instead)

#### 4. S17 Dependency Graph Fullscreen UI Issues

**Status**: Known cosmetic bugs
**Priority**: LOW

**Issues**:
1. **Floating info panel** has fixed `max-height` with `overflow-y: auto`
   - Causes scrolling even when ample screen space available in fullscreen
   - Should expand to show all content without scrolling

2. **Floating controls** (search, filters, layout buttons) remain visible after exiting fullscreen
   - Controls incorrectly overlay standard section view
   - Should only be visible in fullscreen mode

**Root Cause**: `toggleFullscreen()` in Dependency.js doesn't properly manage element visibility across fullscreen enter/exit events

**Fix**: Implement robust `fullscreenchange` event listener that handles both states consistently

### Browser Compatibility Limitations

**Tested browsers**: Safari, Chrome
**Untested browsers**: Firefox, Edge, Mobile browsers

| Browser | Version | Status | Limitations |
|---------|---------|--------|-------------|
| **Safari** | 16+ | ✅ Primary | (None) |
| **Chrome** | 120+ | ✅ Full support | Double file dialog on location import (cosmetic) |
| **Firefox** | Unknown | ⚠️ Untested | May have D3 rendering issues |
| **Edge** | Unknown | ⚠️ Untested | May have localStorage issues |
| **Mobile Safari** | iOS 16+ | ⚠️ Untested | Sticky header needs responsive fixes |
| **Mobile Chrome** | Android 12+ | ⚠️ Untested | Touch interactions need optimization |

**Mobile device limitations**:
- Sticky header (Key Values) does not collapse/minify on small screens
- D3 visualizations (S16, S17, S18) not optimized for touch interactions
- Large calculation tables difficult to navigate on mobile
- No responsive breakpoints defined

### Performance Considerations

**Target hardware**: MacBook Pro M1
**Acceptable performance**:
- Full calculation: < 500ms
- Import 200 fields: < 1 second
- Mode toggle: < 100ms (display-only)

**Current limitations**:
- No performance optimization for large buildings (>50,000 m²)
- D3 visualizations slow on older hardware
- No lazy loading for inactive sections
- Clock.js timing display helps identify performance bottlenecks

**Future optimization opportunities**:
- Implement topological sort for calculation ordering (replace hardcoded calcOrder)
- Add directed acyclic graph (DAG) validation for dependency changes
- Lazy load S16/S17/S18 visualizations on first activation
- Memoize expensive calculations (e.g., HDD/CDD lookups)

### Missing Features

#### 1. Print Report Feature

**Status**: Planned, not implemented
**Priority**: MEDIUM

**Requirements**:
- Generate PDF report from current state
- Include S01 dashboard summary
- Include key input parameters (S02, S03)
- Include envelope/equipment specifications (S07, S11, S13)
- Include S16 Sankey diagram
- Support Target-only or Target + Reference comparison layouts

**Technical approach**:
- Use browser print CSS media queries
- Generate print-friendly HTML layout
- Leverage existing section data (no new calculations needed)
- Store report templates in `/src/report-templates/`

#### 2. Monthly Energy Analysis

**Status**: Future feature
**Priority**: LOW

**Vision**: Break down annual energy consumption by month:
- Account for seasonal HDD/CDD variations
- Model occupancy patterns by month
- Visualize monthly energy use bar chart
- Compare Target vs Reference monthly profiles

**Requirements**:
- Monthly weather data integration (currently annual only)
- Occupancy schedule patterns (S09)
- DHW demand variations by season
- Additional calculations in S04, S13, S14

#### 3. Overheating Warning System

**Status**: Future feature
**Priority**: MEDIUM

**Vision**: Warn users when passive solar design may cause overheating:
- Calculate window-to-wall ratio impact on cooling loads
- Detect high solar gain scenarios (S10)
- Warn when cooling loads exceed typical residential thresholds
- Suggest mitigation strategies (shading, reduced WWR, better glazing)

**Thresholds** (preliminary):
- WWR > 40% on south façade → warning
- Cooling load > 25% of heating load → warning
- SHGC > 0.6 on south windows → warning

#### 4. High Wet Bulb Temperature Warnings

**Status**: Future feature
**Priority**: HIGH (climate change adaptation)

**Vision**: Alert users to climate resilience risks:
- Integrate wet bulb temperature data by location
- Warn when WBT exceeds safe thresholds for building type
- Flag buildings without mechanical cooling in high-WBT zones
- Recommend climate adaptation strategies

**Data sources**:
- Historical WBT data from Environment Canada
- Climate projection scenarios (RCP 4.5, RCP 8.5)
- Building code climate zone alignment

### Calculation Parity Limitations

**Known discrepancies vs Excel reference model:**

#### 1. Cooling Load Parity (d_117)

**Status**: ~2-3% discrepancy
**Affected field**: d_117 (Heatpump Cool Elect. Load in S13)
**Impact**: Flows through to S15 d_135 (cooling energy)

**Example**:
- Excel reference: 120 kWh
- TEUI web app: 123 kWh (~2.5% higher)

**Investigation**: Deep dive into S13 cooling calculation chain needed (likely originating in Cooling.js module)

**Workaround**: Acceptable for pre-production modeling (within 5% tolerance)

#### 2. Ventilation Constant Discrepancy

**Status**: Potential inconsistency (unconfirmed impact)
**Issue**: Two different air property constants in use:
- `1.21` factor (implicit density + specific heat for L/s flow rates)
- `1.204` kg/m³ air density + `1005` J/kg·K specific heat (explicit)

**Affected calculations**:
- S13 ventilation energy (d_121, d_122)
- S13 cooling calculations (coolingState object)

**Resolution needed**: Standardize on one convention:
- Option A: Stick to `1.21` shorthand convention
- Option B: Refactor to explicit density × specific heat × flow rate (m³/s)

**Current approach**: Both methods coexist (may cause minor discrepancies)

### Data Handling Limitations

#### 1. Field State Metadata Limitations

**Current states**: DEFAULT, IMPORTED, USER_MODIFIED, CALCULATED
**Missing states**:
- DERIVED (calculated from other calculated values)
- LOCKED (user cannot edit)
- OVERRIDDEN (calculated field manually set by user)

**Impact**: Cannot distinguish between different types of calculated values or track field lock reasons

#### 2. Reset Tier System Limitations

**Current tiers**:
- Tier 1: User-modified values
- Tier 2: Imported values
- Tier 3: Default values

**Limitation**: No tier for Reference standard values (d_13 changes)

**Workaround**: Reference standard changes treated as user modifications (tier 1)

### UI/UX Limitations

#### 1. Conditional Field Ghosting Brittleness

**Status**: Works but fragile
**Issue**: Ghosting logic (disabled-input class) can interfere with calculation logic if not carefully separated

**Example**: Early attempts to ghost emissions fields in S07/S13 based on fuel type broke calculation fidelity with Excel

**Best practice**: Ghosting must be DISPLAY-ONLY:
- Never modify field values during ghosting/unghosting
- Always test against Excel reference after ghosting changes
- Immediately revert if calculation discrepancies appear

#### 2. Number Display Formatting Inconsistency

**Status**: Partially implemented
**Issue**: Inconsistent decimal place formatting across sections:
- Some fields show integers: `24`
- Some show two decimals: `24.00`
- Zero values sometimes display as empty or `0` instead of `0.00`

**Impact**: Confusing for users, looks unpolished

**Fix needed**: Standardize `formatNumber()` helper and `blur` event handlers across all sections

#### 3. Section Naming Inconsistency (Legacy Technical Debt)

**Current state**: Sections use verbose IDs (e.g., `envelopeTransmissionLosses`, `mechanicalLoads`)
**Target state**: Simple numeric nomenclature (`sect01`, `sect02`, etc.)

**Rationale for change**:
- Simpler, more consistent naming
- Easier to maintain and debug
- Reduces confusion in section references
- Aligns with original architectural intent

**Migration plan**:
- Pre-production refactor to standardize all section IDs
- Update references in HTML, JS, CSS
- Maintain natural language labels in UI for user readability
- Create mapping documentation

#### 4. Simple Mode / N00b Mode (Not Implemented)

**Vision**: Hide redundant organizational text, show only user inputs and tooltips

**Benefits**:
- Cleaner UI for experienced users
- Faster navigation
- Mobile-friendly compact view
- Reduce cognitive load

**Implementation**: CSS class toggle to hide `.section-description` and `.field-help-text` elements

### Future Architectural Improvements

#### 1. Implement Topological Sort for Calculations

**Current**: Hardcoded `calcOrder` array in Calculator.js
**Future**: Dynamic topological sort based on declared dependencies

**Benefits**:
- Automatic calculation ordering based on dependencies
- No manual calcOrder maintenance when adding sections
- Detects circular dependencies at runtime
- Validates dependency graph integrity

**Implementation**: Use ZenMaster-discovered dependencies to build DAG, perform topological sort

#### 2. Directed Acyclic Graph (DAG) Validation

**Current**: Dependency graph visualized in S17, but not validated
**Future**: Runtime DAG validation to prevent circular dependencies

**Benefits**:
- Catch circular dependency bugs during development
- Ensure calculation order is always valid
- Document dependency constraints

**Integration**: Run DAG validation during development builds, warn on cycles

**Note on Pattern A Migration**: S01, S16-S19 do NOT need Pattern A migration. These sections are **state-agnostic data consumers/graphics** that display both Target and Reference models simultaneously in their UI. They read from StateManager but don't require isolated state objects. Pattern A architecture is only needed for sections with user-editable fields that toggle between Target/Reference modes (S02-S15).

---

## 4.013 Refactor Plan: Template Refinement & Pattern Documentation

**Analysis Date**: 2025.12.06
**Purpose**: Refine SectionXX.js template based on operational section analysis

### Template Applicability Assessment

Analysis of S02, S03, and S04 reveals **three distinct section patterns** in the codebase:

#### Pattern A-Calc: Calculation-Heavy Sections
**Characteristics**: Heavy calculations, minimal UI logic, external dependencies from multiple sections, M-N compliance patterns
**Examples**: S04, S07, S11, S13
**Template Fit**: ✅ **SectionXX.js is ideal** - designed for this pattern

#### Pattern A-Lookup: Data Lookup + Calculation Hybrid
**Characteristics**: External data lookup (JSON/API), cascading dropdown dependencies, calculation + lookup hybrid
**Examples**: S03 (Climate with ClimateValues.js lookup)
**Template Fit**: ⚠️ **Partially applicable** - needs lookup pattern documentation addendum

#### Pattern B: Master Data Input
**Characteristics**: Master data input, minimal calculations, heavy UI/event management, cost formatting, validation
**Examples**: S02 (Building Information)
**Template Fit**: ❌ **Not applicable** - needs separate Pattern B documentation

### SectionXX.js Template Refinements (Based on S04 Analysis)

The following patterns from [Section04.js](../src/sections/Section04.js) (87% code reduction, zero fallback contamination) should be incorporated into SectionXX.js template:

#### 1. External Dependency Helpers (Mode-Aware)

Add to **Block 5: Helper Functions**:

```javascript
// Mode-aware external dependency readers
function getGlobalNumericValue(fieldId) {
  let rawValue;
  if (ModeManager.currentMode === "reference") {
    rawValue = window.TEUI?.StateManager?.getValue(`ref_${fieldId}`);
  } else {
    rawValue = window.TEUI?.StateManager?.getValue(fieldId);
  }
  return window.TEUI?.parseNumeric?.(rawValue, 0) ?? 0;
}

function getGlobalStringValue(fieldId) {
  let rawValue;
  if (ModeManager.currentMode === "reference") {
    rawValue = window.TEUI?.StateManager?.getValue(`ref_${fieldId}`);
  } else {
    rawValue = window.TEUI?.StateManager?.getValue(fieldId);
  }
  return rawValue ? rawValue.toString() : "";
}
```

#### 2. Dual-Mode calculateAll() Pattern

Update **Block 6: Calculation Engines**:

```javascript
function calculateAll() {
  const originalMode = ModeManager.currentMode;

  // CRITICAL: For M-N compliance sections, Reference FIRST
  // (so ref_* values exist before Target compliance calculations need them)
  ModeManager.currentMode = "reference";
  calculateReferenceModel();

  ModeManager.currentMode = "target";
  calculateTargetModel();

  ModeManager.currentMode = originalMode;
}
```

#### 3. CSV Export Fix Pattern

Add to **ModeManager.initialize()** in **Block 4**:

```javascript
// ✅ CSV EXPORT FIX: Publish ALL Reference defaults to StateManager
// Without this, CSV export shows empty Reference values
if (window.TEUI?.StateManager) {
  ["d_27", "d_28", "l_28"].forEach(id => {  // Replace with actual field IDs
    const refId = `ref_${id}`;
    const val = ReferenceState.getValue(id);
    if (!window.TEUI.StateManager.getValue(refId) && val != null && val !== "") {
      window.TEUI.StateManager.setValue(refId, val, "calculated");
    }
  });
}
```

#### 4. Mode-Aware Dependency Listener Pattern

Add to **Block 8: Event Handling**:

```javascript
// Listen to BOTH Target and Reference external dependencies
if (window.TEUI?.StateManager?.addListener) {
  const calculateAndRefresh = () => {
    calculateAll();
    ModeManager.updateCalculatedDisplayValues();
  };

  const dependencies = [
    "d_63", "ref_d_63",  // Example: upstream dependency
    "h_15", "ref_h_15",  // Example: another dependency
  ];

  dependencies.forEach(fieldId => {
    window.TEUI.StateManager.addListener(fieldId, calculateAndRefresh);
  });
}
```

### Pattern Variant Documentation

Add to **Section 5: Module Architecture** subsection after Pattern A Template:

#### Pattern A Variants

**Pattern A-Calc** (S04, S07, S11, S13):
- Calculation-heavy with minimal UI logic
- Multiple external dependencies from upstream sections
- M-N compliance patterns (Target/Reference ratio calculations)
- **Use SectionXX.js template directly**

**Pattern A-Lookup** (S03):
- External data lookup (JSON files, APIs, lookup tables)
- Cascading dropdown dependencies (e.g., Province → City → Climate data)
- Calculation + lookup hybrid workflow
- **Use SectionXX.js template + add lookup block** between Helpers and Calculations:

```javascript
// 5.5. Data Lookup Functions (Pattern A-Lookup variant)
function lookupClimateData(province, city, timeframe) {
  const climateDB = window.TEUI?.ClimateValues?.data;
  return climateDB?.[province]?.[city]?.[timeframe] || getDefaults();
}
```

**Pattern B** (S02):
- Master data input with minimal calculations
- Heavy UI management (cost formatting, critical flags, validation)
- Complex event handling (multiple dropdowns, batch operations)
- **Separate pattern** - not applicable to SectionXX.js template
- Future: Create SectionXX-PatternB.js template for input-heavy sections

### Implementation Priority

**Phase 1: Template Refinement** (Immediate)
1. Update SectionXX.js with S04 external dependency helpers
2. Add dual-mode calculateAll() pattern with Reference-first ordering note
3. Add CSV export fix pattern to ModeManager.initialize()
4. Update TECHNICAL2.md Section 5 with pattern variant documentation

**Phase 2: Pattern Documentation** (Next sprint)
1. Document Pattern A-Lookup variant with S03 as reference
2. Create Pattern B documentation (S02 Master Data pattern)
3. Add pattern decision flowchart to TECHNICAL2.md

**Phase 3: Template Validation** (Future)
1. Refactor S05, S06, S08, S09, S10, S12, S14, S15 using refined SectionXX.js
2. Validate M-N compliance pattern consistency across S05, S07, S11
3. Performance audit: ensure all sections maintain sub-100ms recalculation

### Key Principles (Do NOT Change)

These architectural principles are **proven and must remain unchanged**:

1. **Dual-engine calculations** - Both Target and Reference ALWAYS run (not conditional)
2. **UI toggle is display-only** - switchMode() NEVER triggers calculations
3. **State sovereignty** - TargetState/ReferenceState remain isolated (no fallbacks)
4. **Reference-first for M-N compliance** - Essential for correct ratio calculations
5. **Single source of truth** - Field definitions, not hardcoded defaults

### Success Criteria

Template refinement is complete when:
- ✅ SectionXX.js includes S04 external dependency helpers
- ✅ calculateAll() pattern documents Reference-first ordering for M-N sections
- ✅ CSV export fix prevents empty Reference values
- ✅ TECHNICAL2.md documents three pattern variants (A-Calc, A-Lookup, B)
- ✅ All refactored sections maintain sub-100ms recalculation performance

---

## Sections 09-12 Refactor Assessment

**Analysis Date**: 2025.12.06
**Purpose**: Evaluate S09, S10, S11, S12 for SectionXX.js template applicability

### Summary Statistics

| Section | Lines | Calc Functions | M-N Compliance | External Deps | Pattern | Priority |
|---------|-------|----------------|----------------|---------------|---------|----------|
| **S09** | 3,218 | 15 | **3 fields** (plug, lighting, equipment) | 10 | A-Calc | ✅ HIGH |
| **S10** | 3,121 | 10 | None | Moderate | A-Calc | ✅ HIGH |
| **S11** | 3,363 | 5 | Candidate | Moderate | A-Calc | ⚠️ MEDIUM |
| **S12** | 3,229 | 14 | **4 fields** (PH, WWR, ACH50, ELA) | Moderate | A-Calc | ✅ HIGH |

---

### Section 09: Occupant + Internal Gains

**Current State**: 3,218 lines, Pattern A dual-state

**Characteristics**:
- **70% Calculations** - Occupancy, plug loads, lighting, elevators, internal gains
- **20% State Management** - Dropdowns, editable fields, ReferenceValues integration
- **10% UI Management** - Field ghosting, critical occupancy flags
- **3 M-N compliance fields** - m_65/n_65 (plug loads), m_66/n_66 (lighting), m_67/n_67 (equipment efficiency)
- **External dependencies** - S02 (occupancy type, floor area), minimal cross-section reads

**M-N Compliance Pattern** (S07-style):
```javascript
// m_65: Plug load density ratio (Target/Reference)
// n_65: Checkmark if Target ≤ Reference (ratio ≤ 1.0)
const complianceRatio = currentValue / referenceValue;
setCalculatedValue("m_65", formatNumber(complianceRatio, "percent-0dp"), "raw");
setCalculatedValue("n_65", complianceRatio <= 1.0 ? "✓" : "✗", "raw");
```

**Refactor Assessment**: ✅ **EXCELLENT CANDIDATE**

**Strengths**:
- Already uses Pattern A correctly
- Clean calculation structure (15 focused functions)
- M-N compliance follows S07 pattern (Reference-first ordering already implemented)
- syncFromGlobalState() implemented
- applyReferenceValues() for Set Values button

**Estimated Reduction**: **30%** (3,218 → ~2,250 lines)

**Recommended Actions**:
1. Reorder using XX template 9-block structure
2. Remove verbose comments (keep M-N compliance architecture notes)
3. Add external dependency helpers (getGlobalNumericValue/String from S04)
4. CSV export fix pattern (publish Reference defaults to StateManager)
5. Verify Reference-first calculateAll() ordering (already correct for M-N compliance)

---

### Section 10: Radiant Gains

**Current State**: 3,121 lines, Pattern A dual-state

**Characteristics**:
- **75% Calculations** - 6 orientations (Average, N, E, S, W, Skylight) × solar gain calculations
- **15% State Management** - Area fields, orientation dropdowns, SHGC values, shading percentages
- **10% UI Management** - Conditional field visibility, nGains utilization dropdown
- **No M-N compliance** - Pure solar gain physics calculations
- **External dependencies** - S03 (climate data, solar radiation), S02 (geometry)

**Unique Pattern**: Repetitive orientation-based calculations (DRY opportunity)

**Refactor Assessment**: ✅ **EXCELLENT CANDIDATE**

**Strengths**:
- Already uses Pattern A correctly
- **Already has CSV export fix** (publishToStateManager pattern from S04)
- Repetitive structure (6 orientations) ideal for consolidation
- Clean separation of concerns
- syncFromGlobalState() implemented

**Estimated Reduction**: **34%** (3,121 → ~2,050 lines)

**Recommended Actions**:
1. Reorder using XX template 9-block structure
2. **Consolidate repetitive orientation calculations** (DRY pattern for 6 orientations)
3. Remove verbose comments
4. Add external dependency helpers
5. Already has S04 CSV export pattern - keep it

---

### Section 11: Transmission Losses (Envelope)

**Current State**: 3,363 lines, Pattern A dual-state

**Characteristics**:
- **60% Calculations** - Envelope heat loss, thermal bridge penalties, RSI/U-value handling
- **25% State Management** - Area fields, RSI/U-value inputs, component types
- **15% Area Sync Logic** - S10→S11 synchronization with crash prevention guards
- **M-N compliance candidate** - Could compare envelope performance vs code minimum (not currently implemented)
- **External dependencies** - S10 (glazing areas), S03 (climate data), S12 (geometry)

**Critical Complexity**: S10-S11 area sync with recursion prevention

**RSI vs U-value Design Decision** (Intentional):
- **Windows/Doors**: U-value (assembly ratings) - industry standard practice
- **Walls/Roof/Foundation**: RSI (built-up layers) - architect designs thermal resistance serially
- **Rationale**: Numerical precision (RSI larger rational numbers vs U-value decimal expansion)
- **DO NOT universalize** - mixing is intentional for different component types

**Refactor Assessment**: ⚠️ **MEDIUM PRIORITY (Complex)**

**Strengths**:
- Already uses Pattern A correctly
- applyReferenceValues() for Set Values button
- syncFromGlobalState() implemented
- Clear component type metadata (air-facing, ground-facing, penalty)

**Complexity Factors**:
- S10-S11 area sync requires crash prevention logic (recursion guards, debouncing)
- RSI/U-value mixing intentional (DO NOT refactor numerical precision patterns)
- Multiple component types with different physics

**Estimated Reduction**: **18%** (3,363 → ~2,750 lines) - lower due to necessary complexity

**Recommended Actions**:
1. **Phase 1**: Reorder blocks only (DO NOT touch area sync logic)
2. **Phase 2**: Add external dependency helpers
3. **Phase 3**: Consider M-N compliance pattern (if comparing envelope to code minimum becomes requirement)
4. **Preserve**: RSI/U-value distinction, area sync guards, component type logic
5. **Test thoroughly** - area sync has crash prevention for a reason

---

### Section 12: Volume & Surface Metrics

**Current State**: 3,229 lines, Pattern A dual-state

**Characteristics**:
- **65% Calculations** - Volumes, surface areas, compactness ratios, blower door methods (AL-1B, MEASURED)
- **25% State Management** - Dropdowns (stories, exposure, blower door method), conditional visibility
- **10% UI Management** - Method-dependent field activation
- **4 M-N compliance fields**:
  - m_104/n_104: Passive House U-value compliance (thresholds: <0.15 "PH level", <0.20 "Very Good", <0.30 "Good")
  - m_107/n_107: WWR compliance (occupancy-based thresholds)
  - m_109/n_109: ACH50 compliance ratio (ref_d_109 / d_109, lower is better)
  - m_110/n_110: ELA compliance ratio (ref_d_110 / d_110, lower is better)
- **External dependencies** - S02 (geometry, occupancy type), S11 (envelope areas)

**M-N Compliance Patterns**:
```javascript
// Passive House threshold compliance
function calculatePassiveHouseCompliance(isReferenceCalculation) {
  const g104 = parseNumeric(getValue("g_104")) || 0;
  const complianceText = g104 < 0.15 ? "PH level" :
                         g104 < 0.20 ? "Very Good" :
                         g104 < 0.30 ? "Good" : "Meh";
  const checkmark = g104 < 0.30 ? "✓" : "✗";
  setCalculatedValue("m_104", complianceText, "raw", isReferenceCalculation);
  setCalculatedValue("n_104", checkmark, "raw", isReferenceCalculation);
}

// Ratio-based compliance (ACH50, ELA)
function calculateOperationalCompliance(isReferenceCalculation) {
  // m_109: ref_d_109 / d_109 (passing grade >= 100%)
  const ratio = ref_d_109 / d_109;
  const pass = ratio >= 1.0;
  setCalculatedValue("m_109", formatNumber(ratio, "percent-0dp"), "raw");
  setCalculatedValue("n_109", pass ? "✓" : "✗", "raw");
}
```

**Refactor Assessment**: ✅ **EXCELLENT CANDIDATE**

**Strengths**:
- Already uses Pattern A correctly
- **Already has S04 patterns** (CSV export fix, applyReferenceValues)
- Clean calculation structure (14 focused functions)
- M-N compliance follows S07/S09 pattern (Reference-first ordering)
- onReferenceStandardChange() for d_13 updates
- Conditional field logic (blower door methods) well-organized

**Estimated Reduction**: **30%** (3,229 → ~2,250 lines)

**Recommended Actions**:
1. Reorder using XX template 9-block structure
2. Remove verbose comments (keep M-N compliance architecture notes)
3. Add external dependency helpers (getGlobalNumericValue/String)
4. Already has S04 CSV export fix - keep it
5. Verify Reference-first calculateAll() ordering (already correct for M-N compliance)

---

### Refactor Priority Ranking

**Tier 1: Immediate Refactor** (High Value, Low Risk)
1. **Section 10** - Already has S04 patterns, repetitive structure (6 orientations) perfect for DRY consolidation
2. **Section 09** - Clean structure, M-N compliance correctly implemented, minimal UI complexity
3. **Section 12** - Already has S04 patterns, 4 M-N compliance fields, clean separation of concerns

**Tier 2: Next Sprint** (High Value, Moderate Risk)
4. **Section 11** - Complex area sync logic (DO NOT touch), RSI/U-value distinction intentional (DO NOT universalize)

---

### Estimated Code Reduction

| Section | Current | Post-Refactor | Reduction | Notes |
|---------|---------|---------------|-----------|-------|
| S09 | 3,218 | ~2,250 | **30%** (968 lines) | M-N compliance preserved |
| S10 | 3,121 | ~2,050 | **34%** (1,071 lines) | DRY orientation consolidation |
| S11 | 3,363 | ~2,750 | **18%** (613 lines) | Lower due to area sync complexity |
| S12 | 3,229 | ~2,250 | **30%** (979 lines) | 4 M-N compliance fields preserved |
| **Total** | **12,931** | **~9,300** | **28%** (3,631 lines) | Performance maintained |

---

### Key Architectural Principles (DO NOT CHANGE)

1. **RSI vs U-value distinction** (S11) - Windows/Doors use U-value (assembly), Walls/Roof use RSI (built-up)
2. **S10-S11 area sync** (S11) - Recursion guards, debouncing, crash prevention MUST be preserved
3. **M-N compliance Reference-first** (S09, S12) - Reference calculations MUST run before Target for correct ratios
4. **Component type metadata** (S11) - Air-facing, ground-facing, penalty types have different physics
5. **Blower door methods** (S12) - Conditional field visibility based on method selection

---

### Success Criteria

Refactoring is complete when:
- ✅ All four sections follow SectionXX.js 9-block structure
- ✅ M-N compliance patterns preserved (S09: 3 fields, S12: 4 fields)
- ✅ S11 RSI/U-value distinction maintained (DO NOT universalize)
- ✅ S11 area sync guards preserved (recursion prevention, debouncing)

---

## 4.014 Sections 13-15 + Cooling.js Refactor Assessment

**Analysis Date**: 2025.12.07
**Purpose**: Complete Pattern A template applicability analysis for final calculation sections

---

### Section 13: Mechanical Loads (+ Cooling.js Sidecar)

**Current State**: 4,130 lines (S13) + 1,347 lines (Cooling.js) = **5,477 lines total**, Pattern A dual-state

**Architecture**: **Sidecar Pattern** - S13 delegates psychrometric calculations to Cooling.js module
- Cooling.js calculates latent load factors, free cooling capacity, wet bulb temperatures
- S13 consumes Cooling.js results via StateManager (cooling_h_124, cooling_latentLoadFactor, cooling_m_124)
- **2-stage calculation architecture** breaks circular dependency:
  - Stage 1: Cooling.js calculates free cooling capacity (independent of m_129)
  - Stage 2: S13 calculates m_129 (mitigated cooling load) using Stage 1 results
  - Stage 2b: Cooling.js calculates days active cooling using S13's m_129

**S13 Characteristics**:
- **70% Calculations** - Heating systems (HSPF, AFUE, COP), cooling systems, ventilation (HRV/ERV), DHW
- **20% State Management** - 8+ dropdowns (heating system, cooling system, ventilation method, DHW type)
- **10% UI Management** - Conditional field visibility based on system selections
- **0 M-N compliance fields** - Pure calculation consumer (no ratio comparisons)
- **Complex external dependencies** - 25+ upstream sections (S02-S12, S14)

**Cooling.js Characteristics** (Sidecar Module):
- **90% Calculations** - Psychrometric physics (wet bulb temp, humidity ratios, partial pressures)
- **10% StateManager Integration** - Publishes cooling_* prefixed values
- **Pattern A dual-state** - Separate TargetState/ReferenceState for cooling calculations
- **Stage 1**: Ventilation & free cooling (independent calculations)
  - Outputs: h_124 (free cooling capacity), latentLoadFactor, psychrometric intermediates
- **Stage 2**: Active cooling system (dependent on S13's m_129)
  - Outputs: m_124 (days active cooling required), d_124 (free cooling percentage)

**Sidecar Integration Pattern**:
```javascript
// Cooling.js Stage 1: Calculate free cooling capacity (NO dependency on m_129)
function calculateStage1(mode = "target") {
  const stateObj = getStateForMode(mode);
  calculateWetBulbTemperature(stateObj);
  calculateAtmosphericValues(stateObj, mode);
  calculateHumidityRatios(stateObj);
  stateObj.latentLoadFactor = calculateLatentLoadFactor(stateObj);
  calculateFreeCoolingLimit(stateObj, mode);
  updateStateManagerStage1(mode, stateObj); // Publish h_124, latentLoadFactor
  dispatchCoolingEvent("stage1", mode);
}

// S13: Use Cooling.js Stage 1 results to calculate m_129
function calculateCoolingLoad() {
  const h_124 = parseNumeric(getValue("cooling_h_124")) || 0; // From Cooling.js Stage 1
  const d_129_unmitigated = k71 + k79 + k98 + d122;
  const d_123 = calculateRecoveredCooling();
  const m_129_mitigated = d_129_unmitigated - h_124 - d_123;
  setCalculatedValue("m_129", m_129_mitigated); // Publishes to StateManager
}

// Cooling.js Stage 2: Triggered by StateManager listener when m_129 changes
sm.addListener("m_129", function(newValue) {
  calculateStage2("target"); // Uses m_129 to calculate days active cooling
});
```

**Refactor Assessment**: ✅ **EXCELLENT CANDIDATE** (Keep Sidecar Pattern)

**Strengths**:
- Already uses Pattern A correctly in both S13 and Cooling.js
- **2-stage architecture solves bootstrap problem** - well-documented, CRITICAL to preserve
- Sidecar pattern provides clean separation of concerns (psychrometrics vs HVAC systems)
- Cooling.js is self-contained, reusable across sections
- Already has onReferenceStandardChange() for d_13 updates
- Event-driven coordination between S13 and Cooling.js

**Critical Patterns to Preserve**:
1. **Sidecar module isolation** - Cooling.js stays separate, not merged into S13
2. **2-stage calculation order**:
   - Cooling.js Stage 1 runs first (publishes h_124)
   - S13 calculates m_129 using h_124
   - Cooling.js Stage 2 triggered by m_129 StateManager listener
3. **StateManager event coordination** - cooling-calculations-stage1, cooling-calculations-stage2 events
4. **Mode-aware dual-state** - Both Target and Reference calculations use isolated state objects

**Estimated Reduction**: **25%** (5,477 → ~4,100 lines total)
- S13: 4,130 → ~3,100 (25% reduction)
- Cooling.js: 1,347 → ~1,000 (26% reduction, mostly verbose comments)

**Recommended Actions**:
1. Reorder S13 using XX template 9-block structure (keep sidecar integration notes)
2. Cooling.js: Add 9-block structure comments, consolidate psychrometric calculation functions
3. Document sidecar pattern in XX template addendum (not all sections need this)
4. Remove verbose Excel formula comments (keep Stage 1/Stage 2 architecture notes)
5. Add external dependency helpers for 25+ upstream fields

---

### Section 14: TEDI & TELI Summary

**Current State**: 1,499 lines, Pattern A dual-state

**Characteristics**:
- **85% Display/Aggregation** - Consumes upstream calculations, formats for regulatory reporting
- **15% Calculations** - Simple summations and intensity calculations (kWh/yr → kWh/m²/yr)
- **1 User Input** - d_142 (Capital cost premium for HP equipment)
- **0 M-N compliance fields** - Pure summary consumer
- **Heavy external dependencies** - Aggregates from S09-S13 (15+ fields)

**Calculation Pattern** (Lightweight Summary Consumer):
```javascript
// TEDI (Thermal Energy Demand Intensity)
// Excel: =(I97+I98+I103+M121)-I80 / H15
const tedHeatloss_d127 = i97 + i98 + i103 + m121 - i80;
const tedi_h127 = area > 0 ? tedHeatloss_d127 / area : 0;
setCalculatedValue("d_127", tedHeatloss_d127);
setCalculatedValue("h_127", tedi_h127);

// CEDI (Cooling Energy Demand Intensity)
// Excel: =(K71+K79+K98+D122) / H15
const cedCoolingUnmitigated_d129 = k71 + k79 + k98 + d122;
const cediUnmitigated_h129 = area > 0 ? cedCoolingUnmitigated_d129 / area : 0;
setCalculatedValue("d_129", cedCoolingUnmitigated_d129);
setCalculatedValue("h_129", cediUnmitigated_h129);

// TELI/TEDI Ratio (for cost pro-rating)
const m_131 = tedi_h127 > 0 ? teli_h131 / tedi_h127 : 0;
setCalculatedValue("m_131", m_131);
```

**Refactor Assessment**: ✅ **GOOD CANDIDATE** (Simplified Pattern)

**Strengths**:
- Already uses Pattern A correctly
- Minimal state management (only 1 user input)
- Straightforward calculations (no complex physics)
- Already has dual-engine architecture (calculateReferenceModel + calculateTargetModel)
- Clean external dependency management (15+ fields from S09-S13)

**Critical Patterns to Preserve**:
1. **Dual-engine calculation** - calculateReferenceModel() and calculateTargetModel() independence
2. **S13 hybrid architecture coordination** - S14 displays m_129, but S13 calculates it (Phase 3 pattern)
3. **Reference indicator logic** - h_127 (TEDI) comparison against T-cell reference values

**Estimated Reduction**: **20%** (1,499 → ~1,200 lines)
- Lower reduction % due to already-lean structure
- Most savings from removing redundant comments and consolidating dual-engine pattern

**Recommended Actions**:
1. Apply XX template 9-block structure (lightweight summary variant)
2. Document "Summary Consumer" pattern variant in XX template addendum
3. Consolidate dual-engine pattern (remove code duplication between Target/Reference)
4. Keep S13 hybrid architecture notes (m_129 calculated by S13, displayed by S14)

---

### Section 15: TEUI Summary (Final Dashboard)

**Current State**: 2,316 lines, Pattern A dual-state

**Characteristics**:
- **80% Display/Aggregation** - Final TEUI calculations, compliance ratios, cost summaries
- **20% Calculations** - Energy totals, carbon emissions, cost projections
- **Minimal User Inputs** - Most values consumed from upstream sections
- **Heavy M-N Aggregation** - Displays compliance summary from all upstream M-N fields
- **Dashboard Feed** - Publishes final values to UI dashboard (teui_target, teui_reference, improvement_percentage)

**Final Aggregation Pattern**:
```javascript
// TEUI Target: Total site energy intensity (kWh/m²/yr)
// Excel: =(D133+D134+D135+D136+D137+D138)/H15
const totalEnergy_d133_to_d138 = d133 + d134 + d135 + d136 + d137 + d138;
const teui_h142 = area > 0 ? totalEnergy_d133_to_d138 / area : 0;
setTargetValue("h_142", teui_h142);

// Publish to Dashboard
window.TEUI.StateManager.setValue("teui_target", teui_h142.toString(), "calculated");

// Improvement over Reference
const ref_teui_h142 = parseNumeric(getValue("ref_h_142")) || 0;
const improvement = ref_teui_h142 > 0 ? (ref_teui_h142 - teui_h142) / ref_teui_h142 : 0;
window.TEUI.StateManager.setValue("improvement_percentage", improvement.toString(), "calculated");
```

**Refactor Assessment**: ✅ **GOOD CANDIDATE** (Final Summary Pattern)

**Strengths**:
- Already uses Pattern A correctly
- Clean dual-state architecture (TargetState/ReferenceState with localStorage persistence)
- Dashboard integration well-abstracted
- Comprehensive external dependency listeners (30+ upstream fields)
- Already has publishToStateManager() pattern for CSV export

**Critical Patterns to Preserve**:
1. **Dashboard feed coordination** - teui_target, teui_reference, improvement_percentage publishing
2. **Dual-state persistence** - localStorage save/load for both Target and Reference
3. **Reference model CSV export** - publishToStateManager() ensures ref_* values available for export
4. **Comprehensive dependency listeners** - S15 must update when ANY upstream section changes

**Estimated Reduction**: **15%** (2,316 → ~1,970 lines)
- Lower reduction % due to already-optimized structure
- Most savings from consolidating dual-engine pattern and removing verbose comments

**Recommended Actions**:
1. Apply XX template 9-block structure (final summary variant)
2. Document "Dashboard Feed" pattern variant in XX template addendum
3. Keep publishToStateManager() pattern (critical for CSV export after page refresh)
4. Consolidate dual-engine calculations (reduce code duplication)
5. Add comprehensive dependency listener documentation (30+ fields from S02-S14)

---

### Refactor Priority Ranking (Updated with S13-S15)

**Tier 1: Immediate Refactor** (High Value, Low Risk)
1. **Section 10** - Repetitive 6-orientation structure, already has S04 patterns
2. **Section 09** - Clean M-N compliance, minimal UI complexity
3. **Section 12** - Already has S04 patterns, 4 M-N compliance fields

**Tier 2: Next Sprint** (High Value, Moderate Risk)
4. **Section 11** - Complex area sync (DO NOT touch), RSI/U-value intentional
5. **Section 14** - Lightweight summary consumer, straightforward aggregation
6. **Section 15** - Final dashboard feed, comprehensive dependency management

**Tier 3: Advanced Refactor** (High Value, High Complexity - Preserve Architecture)
7. **Section 13 + Cooling.js** - Sidecar pattern, 2-stage architecture (CRITICAL to preserve)

---

### Estimated Code Reduction (Complete S09-S15 Assessment)

| Section | Current | Post-Refactor | Reduction | Notes |
|---------|---------|---------------|-----------|-------|
| S09 | 3,218 | ~2,250 | **30%** (968 lines) | 3 M-N compliance fields preserved |
| S10 | 3,121 | ~2,050 | **34%** (1,071 lines) | DRY orientation consolidation |
| S11 | 3,363 | ~2,750 | **18%** (613 lines) | Area sync complexity preserved |
| S12 | 3,229 | ~2,250 | **30%** (979 lines) | 4 M-N compliance fields preserved |
| **S13** | **4,130** | **~3,100** | **25%** (1,030 lines) | Sidecar pattern preserved |
| **Cooling.js** | **1,347** | **~1,000** | **26%** (347 lines) | 2-stage architecture preserved |
| **S14** | **1,499** | **~1,200** | **20%** (299 lines) | Summary consumer pattern |
| **S15** | **2,316** | **~1,970** | **15%** (346 lines) | Dashboard feed pattern |
| **Total** | **22,223** | **~16,570** | **25%** (5,653 lines) | All patterns preserved |

---

### Key Architectural Principles (DO NOT CHANGE)

**Existing (S09-S12)**:
1. **RSI vs U-value distinction** (S11) - Windows/Doors use U-value, Walls/Roof use RSI
2. **S10-S11 area sync** - Recursion guards, debouncing, crash prevention
3. **M-N compliance Reference-first** - Reference calculations run before Target
4. **Component type metadata** (S11) - Air-facing, ground-facing, penalty physics
5. **Blower door methods** (S12) - Conditional field visibility

**New (S13-S15)**:
6. **Sidecar pattern** (S13 + Cooling.js) - Psychrometric calculations delegated to separate module
7. **2-stage calculation architecture** (Cooling.js) - Stage 1 (independent), Stage 2 (depends on S13's m_129)
8. **Stage 1/Stage 2 ordering** - Cooling.js Stage 1 → S13 m_129 → Cooling.js Stage 2 (StateManager listener)
9. **S13 hybrid architecture** (S14) - S13 calculates m_129, S14 displays it (Phase 3 pattern)
10. **Dashboard feed coordination** (S15) - teui_target, teui_reference, improvement_percentage publishing
11. **Reference CSV export** (S15) - publishToStateManager() ensures ref_* values available after page refresh

---

### Success Criteria (Updated)

Refactoring is complete when:
- ✅ All seven sections (S09-S15) follow SectionXX.js 9-block structure
- ✅ M-N compliance patterns preserved (S09: 3 fields, S12: 4 fields)
- ✅ S11 RSI/U-value distinction maintained
- ✅ S11 area sync guards preserved
- ✅ **S13 sidecar pattern maintained** (Cooling.js stays separate)
- ✅ **Cooling.js 2-stage architecture preserved** (Stage 1 → S13 → Stage 2)
- ✅ **S14 hybrid architecture preserved** (m_129 calculated by S13, displayed by S14)
- ✅ **S15 dashboard feed maintained** (teui_target, teui_reference, improvement_percentage)
- ✅ **S15 CSV export pattern preserved** (publishToStateManager for ref_* values)
- ✅ All Excel formula parity maintained (±0.01 tolerance)
- ✅ 25% overall code reduction achieved (22,223 → ~16,570 lines)
- ✅ Performance maintained or improved (target: <50ms per calculateAll)

---

### Template Variants Identified

Based on S02-S15 analysis, three distinct SectionXX.js variants emerge:

**Variant A-Calc**: Calculation-Heavy Sections (S04, S07, S09, S10, S11, S12, S13)
- 60%+ calculations, minimal UI
- Heavy external dependencies
- M-N compliance patterns (S07, S09, S12)
- **Template**: SectionXX.js (existing)

**Variant A-Summary**: Summary Consumer Sections (S14, S15)
- 80%+ aggregation/display
- Lightweight calculations (summations, intensity conversions)
- Heavy upstream dependencies (15-30+ fields)
- Dashboard feed integration (S15)
- **Template**: SectionXX-Summary.js (new variant - simplified 9-block structure)

**Variant A-Sidecar**: Delegated Calculation Modules (Cooling.js)
- 90%+ specialized calculations (psychrometrics, heat transfer, etc.)
- Publishes results via StateManager with module-specific prefix (cooling_*)
- Stage-based architecture for dependency management
- **Template**: ModuleXX-Sidecar.js (new variant - document pattern for future use)

**Variant A-Lookup**: Data Lookup + Calculation Hybrid (S03)
- 40% state management, 30% JSON data lookup, 20% calculations
- Complex dropdown dependencies (province → city → climate data)
- External JSON data source (ClimateValues.js)
- **Template**: SectionXX-Lookup.js (new variant - XX template + lookup block addendum)

**Variant B**: Master Data Input (S02)
- 65% UI management, 30% state management, 5% calculations
- Heavy event handling (multiple dropdowns, "Set Values" button)
- **Template**: Needs separate pattern documentation (not XX template compatible)
- ✅ S10 orientation calculations consolidated (DRY pattern)
- ✅ External dependency helpers added (getGlobalNumericValue/String from S04)
- ✅ CSV export fixes applied (S09, S11 need it; S10, S12 already have it)
- ✅ Sub-100ms recalculation performance maintained
- ✅ 28% code reduction achieved (~3,631 lines eliminated)

---
