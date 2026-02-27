# Section Migration Plan: Legacy to ComputationGraph

## Overview

This document outlines the strategy for migrating legacy Section*.js files from the old `setValue` calculation pattern to the new ComputationGraph system.

**Created:** January 2026
**Status:** Blockers Identified, Fixes Required

---

## Cutover Mechanism

The cutover is controlled by a single flag in `src/core/init.js`:

```javascript
window.TEUI.USE_COMPUTATION_GRAPH = true;  // Enable cutover
```

When enabled:
1. `Calculator.calculateAll()` bypasses all legacy Section*.js `calculateAll()` calls
2. ComputationGraph computes all values
3. `syncToStateManager()` writes values back to StateManager
4. Section files become UI-only (event handlers, display)

---

## Blockers (Must Fix Before Cutover)

Testing with `USE_COMPUTATION_GRAPH = true` revealed calculation mismatches:

| Field | Description | Issue |
|-------|-------------|-------|
| `d_117` | Cooling Energy | copCool calculation differs from legacy |
| `m_129` | CED (Cooling Energy Demand) | Mode handling differs |
| `i_103` | Air Leakage Heat Loss | Calculation mismatch |
| `k_103` | Air Leakage Heat Gain | Calculation mismatch |
| `j_10` | TEUI Tier | Off by 1 in some cases |
| `m_10` | Reduction % | Off by 1 in some cases |

**Root cause:** The ComputationGraph nodes have subtle differences in:
- COP (Coefficient of Performance) handling when copCool = 0
- Air leakage calculations (ACH50 → NRL50 conversion)
- Tier boundary rounding

**Fix required in:** `MechanicalNodes.js`, `VolumeMetricsNodes.js`, `KeyValuesNodes.js`

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Section files | 22 |
| Total lines of code | 43,376 |
| Total setValue calls | 572 |
| Node modules ready | 15 (238 legacyId mappings) |
| Case study validation | 12/12 passing |
| Performance improvement | 248x faster (full), 5,631x faster (incremental) |

---

## The Problem: Infinite Recursion

When `LegacyAdapter.install()` intercepts `StateManager.setValue`, every legacy calculation triggers the new graph. Since old `calculateAll()` functions call `setValue` 30-70+ times each, this creates cascade loops:

```
User edits field → Section.setValue() → StateManager.setValue() →
LegacyAdapter intercepts → Graph.recompute() →
Section.calculateAll() → more setValue() calls → INFINITE LOOP
```

**Solution:** Remove all `setValue` calls from `calculate*()` functions. Sections become UI-only; Graph handles all computations.

---

## Section Analysis

### setValue Call Rankings (Heaviest Offenders First)

| Section | Lines | setValue Calls | Description | Node Coverage |
|---------|-------|----------------|-------------|---------------|
| Section09 | 3,268 | 77 | Occupant + Internal Gains | Partial (OccupancyNodes) |
| Section13 | 4,185 | 63 | Mechanical Loads | Good (MechanicalNodes, VentilationNodes) |
| Section12 | 3,840 | 48 | Volume & Surface Metrics | Good (VolumeMetricsNodes) |
| Section07 | 1,882 | 47 | Water Heating | Good (WaterHeatingNodes) |
| Section05 | 1,494 | 40 | DHW/Emissions | Partial (EmissionsNodes) |
| Section19 | 2,824 | 38 | Carbon Intensity | Partial (EmissionsNodes) |
| Section11 | 3,774 | 37 | Transmission Loss | Good (TransmissionLossNodes) |
| Section03 | 2,823 | 35 | Climate/Temperature | Good (ClimateNodes) |
| Section02 | 2,075 | 33 | Building Info | Good (BuildingInfoNodes) |
| Section10 | 3,202 | 27 | Radiant Gains | Good (RadiantGainsNodes) |
| SectionXX | 842 | 24 | Compliance Summary | Partial (KeyValuesNodes) |
| Section01 | 1,537 | 20 | Key Values | Good (KeyValuesNodes) |
| Section04 | 1,914 | 19 | Energy/PER | Partial (EnergyNodes) |
| Section14 | 1,512 | 19 | TED/TEDI | Good (EnergyNodes) |
| Section08 | 834 | 16 | Forestry/Wood | Good (ForestryNodes) |
| Section06 | 808 | 16 | Renewable Energy | Full (RenewableNodes) |
| Section15 | 2,331 | 12 | TEUI Summary | Partial (EnergyNodes) |
| Section20 | 1,326 | 1 | Notes/QC | None (no calculations) |
| Section17 | 69 | 0 | Version Info | None (display only) |
| Section18 | 47 | 0 | Embodied Carbon | None (display only) |

### Visual: setValue Calls Distribution

```
Section09 ████████████████████████████████████████ 77
Section13 ████████████████████████████████ 63
Section12 ████████████████████████ 48
Section07 ███████████████████████ 47
Section05 ████████████████████ 40
Section19 ███████████████████ 38
Section11 ██████████████████ 37
Section03 █████████████████ 35
Section02 ████████████████ 33
Section10 █████████████ 27
SectionXX ████████████ 24
Section01 ██████████ 20
Section04 █████████ 19
Section14 █████████ 19
Section08 ████████ 16
Section06 ████████ 16
Section15 ██████ 12
Section20 █ 1
```

---

## Migration Phases

### Phase 1: Leaf Sections (No Downstream Dependencies) - LOW RISK

**1.1 Section06 (Renewable Energy) - TEMPLATE MIGRATION**
- Lines: 808, setValue: 16
- Node coverage: FULL (RenewableNodes.js has all computed values)
- Dependencies: None downstream
- Risk: Very low - isolated section
- Functions to remove: `calculateOnSiteSubtotal()`, `calculateOffsiteRenewable()`, `calculateGreenNaturalGasEnergy()`

**1.2 Section08 (Forestry/Wood)**
- Lines: 834, setValue: 16
- Node coverage: FULL (ForestryNodes.js)
- Dependencies: None downstream
- Risk: Very low

**1.3 Section20 (Notes/QC)**
- Lines: 1,326, setValue: 1
- Node coverage: N/A (no calculations)
- Risk: Trivial - just UI code

### Phase 2: Upstream Input Sections - LOW RISK

**2.1 Section02 (Building Info)**
- Lines: 2,075, setValue: 33
- Node coverage: Good (BuildingInfoNodes.js)
- Dependencies: Upstream of almost everything
- Risk: Low - mostly user inputs with derived calculations
- Note: Climate zone lookup, floor area are key inputs

**2.2 Section03 (Climate/Temperature)**
- Lines: 2,823, setValue: 35
- Node coverage: Good (ClimateNodes.js)
- Dependencies: Upstream of TEDI/TEUI calculations
- Risk: Low - mostly lookup-based

### Phase 3: Envelope Sections - MEDIUM RISK

**3.1 Section11 (Transmission Loss)**
- Lines: 3,774, setValue: 37
- Node coverage: Good (TransmissionLossNodes.js)
- Dependencies: Used by Section14 (TED)
- Risk: Medium - complex thermal bridging calculations

**3.2 Section12 (Volume & Surface Metrics)**
- Lines: 3,840, setValue: 48
- Node coverage: Good (VolumeMetricsNodes.js)
- Dependencies: Used by Section13 (ventilation rates)
- Risk: Medium - ACH50, combined U-value calculations

**3.3 Section10 (Radiant Gains)**
- Lines: 3,202, setValue: 27
- Node coverage: Good (RadiantGainsNodes.js)
- Dependencies: Used by Section14 (usable gains)
- Risk: Medium - orientation-based solar calculations

### Phase 4: Internal Loads - MEDIUM RISK

**4.1 Section09 (Occupant + Internal Gains)** - HEAVIEST OFFENDER
- Lines: 3,268, setValue: 77 (HIGHEST)
- Node coverage: Partial (OccupancyNodes.js only has 4 inputs)
- Dependencies: Used by Section14 (internal gains offset)
- Risk: Medium-High - needs Node module expansion
- **Action Required:** Expand OccupancyNodes to cover ~30 more computed values

**4.2 Section07 (Water Heating)**
- Lines: 1,882, setValue: 47
- Node coverage: Good (WaterHeatingNodes.js)
- Dependencies: Used by Section15 (TEUI totals)
- Risk: Medium

### Phase 5: Mechanical Systems - HIGHER RISK

**5.1 Section13 (Mechanical Loads)** - SECOND HEAVIEST
- Lines: 4,185, setValue: 63
- Node coverage: Good (MechanicalNodes.js, VentilationNodes.js)
- Dependencies: COP calculations, ventilation, used by Section14/15
- Risk: Higher - complex heating/cooling system logic

### Phase 6: Energy Summation Sections - HIGH RISK

**6.1 Section14 (TED/TEDI)**
- Lines: 1,512, setValue: 19
- Node coverage: Good (EnergyNodes.js)
- Dependencies: Aggregates all upstream heat losses/gains
- Risk: High - critical output section

**6.2 Section15 (TEUI Summary)**
- Lines: 2,331, setValue: 12
- Node coverage: Partial (EnergyNodes.js)
- Dependencies: Final energy summary
- Risk: High - critical output section

**6.3 Section04 (Energy/PER)**
- Lines: 1,914, setValue: 19
- Node coverage: Partial (EnergyNodes.js)
- Dependencies: Actual energy from utility bills
- Risk: Medium - different calculation path

### Phase 7: Emissions & Compliance - HIGHEST RISK

**7.1 Section05 (GHGI/Emissions)**
- Lines: 1,494, setValue: 40
- Node coverage: Partial (EmissionsNodes.js)
- Dependencies: Used by Section01 (Key Values)
- Risk: High

**7.2 Section19 (Carbon Intensity)**
- Lines: 2,824, setValue: 38
- Node coverage: Partial (EmissionsNodes.js)
- Dependencies: Grid carbon factors
- Risk: High

**7.3 SectionXX (Compliance Summary)**
- Lines: 842, setValue: 24
- Node coverage: Partial (KeyValuesNodes.js)
- Dependencies: Aggregates all compliance checks
- Risk: High

**7.4 Section01 (Key Values Dashboard)**
- Lines: 1,537, setValue: 20
- Node coverage: Good (KeyValuesNodes.js)
- Dependencies: Final consumer of all values
- Risk: Highest - user-facing dashboard
- **Note:** Migrate LAST as it depends on everything

---

## What Changes in Each Section

### What Gets REMOVED

1. All `calculate*()` functions:
   - `calculateAll()`
   - `calculateTargetModel()`
   - `calculateReferenceModel()`
   - Section-specific calculation functions

2. All `setValue()` calls for computed fields

3. All formula implementations (already in Node modules)

4. Redundant dependency tracking

### What STAYS

1. **UI/DOM Responsibilities:**
   - `sectionRows` object (field layout definitions)
   - `createSectionElement()`, `renderSection()` (DOM building)
   - Event handlers (user input listeners)
   - Mode switching UI (`ModeManager.switchMode`, `refreshUI`)
   - Display formatting (`formatNumber`, tier badges)

2. **State Responsibilities:**
   - `TargetState`, `ReferenceState` objects (localStorage)
   - `syncFromGlobalState()` (import support)
   - `updateCalculatedDisplayValues()` (reads from StateManager)

---

## Migrated Section Template

```javascript
/**
 * Migrated SectionXX.js
 * CALCULATION-FREE: All computations handled by ComputationGraph
 * This file only handles: UI, Events, State Display
 */
window.TEUI.SectionModules.sectXX = (function () {

  // =========================================================
  // DUAL-STATE ARCHITECTURE (UNCHANGED)
  // =========================================================
  const TargetState = {
    state: {},
    initialize: function() { /* localStorage load */ },
    setDefaults: function() { /* field defaults only */ },
    saveState: function() { /* localStorage save */ },
    setValue: function(fieldId, value) {
      this.state[fieldId] = value;
      this.saveState();
      // NO StateManager.setValue here for computed fields!
    },
    getValue: function(fieldId) { return this.state[fieldId]; },
    syncFromGlobalState: function(fieldIds) { /* import support */ }
  };

  const ReferenceState = { /* same pattern */ };

  // =========================================================
  // MODE MANAGER (SIMPLIFIED - NO CALCULATIONS)
  // =========================================================
  const ModeManager = {
    currentMode: "target",

    initialize: function() {
      TargetState.initialize();
      ReferenceState.initialize();
      // NO calculateAll() call - graph computes on demand
    },

    getCurrentState: function() {
      return this.currentMode === "target" ? TargetState : ReferenceState;
    },

    getValue: function(fieldId) {
      return this.getCurrentState().getValue(fieldId);
    },

    // NEW PATTERN: setValue for USER INPUTS only
    // Triggers graph recalculation via StateManager
    setValue: function(fieldId, value, source = "user") {
      this.getCurrentState().setValue(fieldId, value, source);
      if (source === "user-input" || source === "user-modified") {
        // Only user inputs trigger StateManager (and thus the graph)
        window.TEUI.StateManager.setValue(fieldId, value, source);
      }
    },

    switchMode: function(mode) {
      if (this.currentMode === mode) return;
      this.currentMode = mode;
      this.refreshUI();
      this.updateCalculatedDisplayValues();
    },

    // Read computed values FROM StateManager (populated by graph)
    updateCalculatedDisplayValues: function() {
      const calculatedFields = ["d_XX", "i_XX", /* ... */];
      calculatedFields.forEach(fieldId => {
        const element = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (!element) return;

        const prefix = this.currentMode === "reference" ? "ref_" : "";
        const value = window.TEUI.StateManager.getValue(`${prefix}${fieldId}`);
        element.textContent = window.TEUI.formatNumber(value, "number-2dp-comma");
      });
    },

    refreshUI: function() { /* sync input fields from local state */ }
  };

  // =========================================================
  // FIELD DEFINITIONS (UNCHANGED)
  // =========================================================
  const sectionRows = { /* layout definitions stay */ };

  // =========================================================
  // REMOVED: ALL CALCULATE FUNCTIONS
  // =========================================================
  // DELETE: calculateSomething()
  // DELETE: calculateAll()
  // DELETE: calculateTargetModel()
  // DELETE: calculateReferenceModel()

  // =========================================================
  // EVENT HANDLERS (MODIFIED)
  // =========================================================
  function initializeEventHandlers() {
    document.querySelectorAll('[contenteditable="true"]')
      .forEach(el => {
        el.addEventListener("blur", function() {
          const fieldId = this.dataset.fieldId;
          const newValue = this.textContent.trim();
          // Use "user-modified" to trigger graph via StateManager
          ModeManager.setValue(fieldId, newValue, "user-modified");
        });
      });
  }

  // =========================================================
  // PUBLIC API (SIMPLIFIED)
  // =========================================================
  return {
    initialize: function() {
      ModeManager.initialize();
      initializeEventHandlers();
      // NO calculateAll() - graph computes on initialization
    },
    getFields: () => fields,
    getLayout: () => ({ rows: Object.values(sectionRows) }),
    getDropdownOptions: () => ({}),
    initializeEventHandlers,
    ModeManager,
    TargetState,
    ReferenceState
  };
})();
```

---

## Value Flow After Migration

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEW VALUE FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Input                                                     │
│      │                                                          │
│      ▼                                                          │
│  Section.ModeManager.setValue(fieldId, value, "user-modified")  │
│      │                                                          │
│      ▼                                                          │
│  StateManager.setValue(fieldId, value)                          │
│      │                                                          │
│      ▼                                                          │
│  LegacyAdapter.setValue() [intercepts]                          │
│      │                                                          │
│      ▼                                                          │
│  ComputationGraph.setInput(semanticPath, value)                 │
│      │                                                          │
│      ▼                                                          │
│  IncrementalEngine.recompute() [0.03ms]                         │
│      │                                                          │
│      ▼                                                          │
│  ComputationIntegration.syncToStateManager()                    │
│      │                                                          │
│      ▼                                                          │
│  StateManager now has all computed values                       │
│      │                                                          │
│      ▼                                                          │
│  Section.updateCalculatedDisplayValues() [reads from SM]        │
│      │                                                          │
│      ▼                                                          │
│  DOM Updated                                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Node Coverage Gaps

Before migrating certain sections, their Node modules need expansion:

| Section | Current Nodes | Gap | Action Required |
|---------|---------------|-----|-----------------|
| Section09 | OccupancyNodes (4 inputs) | ~30 computed nodes | Expand OccupancyNodes |
| Section05 | EmissionsNodes (partial) | ~15 nodes | Expand EmissionsNodes |
| Section19 | EmissionsNodes (partial) | ~10 nodes | Expand EmissionsNodes |
| Section04 | EnergyNodes (partial) | ~10 nodes | Expand EnergyNodes |
| SectionXX | KeyValuesNodes (partial) | ~10 nodes | Expand KeyValuesNodes |

---

## Risk Assessment & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing Node coverage | Medium | High | Audit each section's `calculate*` functions against Node modules before migration |
| Formula discrepancies | Low | High | Run 12 case study validation after each phase |
| Mode switching bugs | Medium | Medium | Test Target/Reference toggle after each section |
| Event handler loss | Low | Medium | Keep event handler code, only remove calculation triggers |
| Breaking UI during migration | Medium | High | Migrate one section at a time; feature flag to revert |

---

## Testing Protocol

After each section migration:

1. **Case Study Validation**
   ```bash
   npm test
   ```
   All 12 case studies must pass (0 mismatches)

2. **Manual Testing**
   - Load a CSV project file
   - Edit input fields in the migrated section
   - Verify computed values update correctly
   - Toggle Target/Reference mode
   - Verify both columns display correct values

3. **Regression Check**
   - Verify other sections still calculate correctly
   - Check downstream dependencies update

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/sections/Section06.js` | First migration target (template) |
| `src/sections/nodes/RenewableNodes.js` | Example complete Node module |
| `src/core/computation/LegacyAdapter.js` | Integration point (prevents recursion) |
| `src/core/computation/ComputationIntegration.js` | Has `syncToStateManager()` method |
| `src/core/computation/ComputationGraph.js` | Core dependency graph |
| `src/core/computation/IncrementalEngine.js` | Fast recomputation engine |

---

## Progress Tracking

| Phase | Section | Status | Date | Notes |
|-------|---------|--------|------|-------|
| 1.1 | Section06 | Pending | | Template migration |
| 1.2 | Section08 | Pending | | |
| 1.3 | Section20 | Pending | | |
| 2.1 | Section02 | Pending | | |
| 2.2 | Section03 | Pending | | |
| 3.1 | Section11 | Pending | | |
| 3.2 | Section12 | Pending | | |
| 3.3 | Section10 | Pending | | |
| 4.1 | Section09 | Pending | | Needs OccupancyNodes expansion |
| 4.2 | Section07 | Pending | | |
| 5.1 | Section13 | Pending | | |
| 6.1 | Section14 | Pending | | |
| 6.2 | Section15 | Pending | | |
| 6.3 | Section04 | Pending | | |
| 7.1 | Section05 | Pending | | Needs EmissionsNodes expansion |
| 7.2 | Section19 | Pending | | |
| 7.3 | SectionXX | Pending | | |
| 7.4 | Section01 | Pending | | Final section |
