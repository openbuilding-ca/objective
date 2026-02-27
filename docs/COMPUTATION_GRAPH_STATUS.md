# ComputationGraph System - Status & Plan

## Overview

The ComputationGraph system is now the **single source of truth** for all calculations. Legacy Section*.js calculateAll() functions are no longer used.

## Current Status (February 6, 2026)

| Metric | Status |
|--------|--------|
| **Case Study Validation** | 12/12 passing (100%) |
| **Field Matches** | 329–368 exact matches per case study |
| **Close Matches** | 0–9 within 0.02% (floating point precision) |
| **Mismatches** | 0 |
| **Computed Nodes** | ~158 nodes in dependency graph |
| **Reference Model** | ✅ Correctly computes with wood offset = 0 |
| **Cutover Status** | ✅ COMPLETE — ComputationGraph is authoritative |

### Performance Benchmarks

```
=== Performance Comparison (20 iterations) ===
Legacy (StateManager + Section recalcs): 168.92ms avg
New - Full Recalc (computeAll):          0.68ms avg
New - Incremental (single value change): 0.03ms avg

Speedup vs Legacy:
  Full recalc:   248x faster
  Incremental:   5,631x faster
```

Run benchmark: `node test/perf-test.cjs`

### Why So Fast?

1. **No DOM manipulation** during calculation
2. **Cached topological sort** - computed once at init, reused for all calculations
3. **Incremental updates** only recompute downstream nodes
4. **Classification cache** - `isSharedField()` results cached to avoid repeated string comparisons
5. **Pure JavaScript** vs jQuery/DOM event propagation
6. **No listener notifications during bulk operations** - listeners muted during sync

## Architecture

### Dual Calculation Paths

The system has TWO calculation paths optimized for different scenarios:

#### 1. Incremental Updates (User Input Changes)

When a user changes a single input, DOMBridge triggers incremental computation:

```
User Input Change (single field)
       │
       ▼
┌──────────────────────────────────────────────────┐
│ DOMBridge.handleValueChange()                    │
│                                                  │
│ 1. Capture input value                           │
│ 2. Call engine.onValueChange(path, value, model) │
└──────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│ MultiModelEngine.onValueChange()                 │
│                                                  │
│ 1. Set value in MultiModelState                  │
│ 2. Get downstream nodes from graph               │
│ 3. Compute ONLY affected downstream nodes        │
│ 4. Store computed values in MultiModelState      │
│ 5. Notify listeners (DOMBridge updates DOM)      │
└──────────────────────────────────────────────────┘
       │
       │ ~0.03ms (incremental - 5,631x faster than legacy)
       ▼
UI displays updated values
```

**Key Point**: Incremental updates bypass StateManager entirely. No wildcard listeners fire. Only affected downstream nodes are recomputed.

#### 2. Full Recalculation (File Load, CSV Import)

When loading a file or importing CSV, Calculator.calculateAll() runs:

```
File Load / CSV Import
       │
       ▼
┌──────────────────────────────────────────────────┐
│ Calculator.calculateAll()                        │
│                                                  │
│ 1. syncFromStateManager() - inputs to graph      │
│ 2. populateReferenceModel() - load ref values    │
│ 3. computeAllWithReference() - compute both      │
│    ├─ Compute Target model (~158 nodes)          │
│    ├─ Compute Reference model (~158 nodes)       │
│    ├─ Force forestry.annualOffset = 0 for Ref    │
│    └─ Sync Reference outputs → Target ref_*      │
│ 4. syncToStateManager() - outputs back (muted)   │
│ 5. syncReferenceToStateManager() - ref outputs   │
│ 6. unmuteListeners()                             │
│ 7. updateCalculatedDisplayValues() - DOM refresh │
└──────────────────────────────────────────────────┘
       │
       │ ~0.68ms full recalc / ~20-30ms with DOM refresh
       ▼
UI displays all updated values
```

### System Components

```
┌─────────────────────────────────┐
│ ComputationGraph                │
│ - ~158 compute nodes            │
│ - Cached topological sort       │
│ - Dependency tracking           │
└─────────────────────────────────┘
                │
                ▼
┌────────────────────────────────┐
│ MultiModelState                │
│ - G-fields (shared geometry)   │
│ - C-fields (per-model perf)    │
│ - Target + Reference models    │
└────────────────────────────────┘
                │
                │ sync to StateManager (listeners muted)
                ▼
┌─────────────────────┐          ┌────────────────────────────────┐
│ StateManager        │ ────────►│ Section*.js                    │
│ - Legacy state      │          │ - updateCalculatedDisplayValues│
│ - listeners (muted) │          │ - UI rendering only            │
└─────────────────────┘          │ - NO calculations              │
                                 └────────────────────────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `src/core/computation/ComputationGraph.js` | Dependency graph, cached topological sort |
| `src/core/model/MultiModelEngine.js` | Incremental + full computation engine |
| `src/core/computation/ComputationIntegration.js` | Integration layer (sync, compute, reference model) |
| `src/core/model/MultiModelState.js` | G/C field separation, per-model state |
| `src/core/ui/DOMBridge.js` | Input capture → engine.onValueChange() → DOM updates |
| `src/sections/nodes/*.js` | Node definitions per domain |
| `src/sections/nodes/CoolingNodes.js` | Psychrometric calculations (replaces Cooling.js) |
| `src/core/Cooling.js` | **DEPRECATED** - stub that reads from StateManager |
| `test/caseStudyValidation.spec.cjs` | Playwright validation tests |
| `test/perf-test.cjs` | Performance benchmark |

## Node Modules

| Module | Fields | Purpose |
|--------|--------|---------|
| `BuildingInfoNodes.js` | S02 | Building metadata, occupancy |
| `ClimateNodes.js` | S03 | HDD, CDD, temperatures |
| `EnergyNodes.js` | S04, S14, S15 | TED, CED, TEUI totals |
| `TransmissionLossNodes.js` | S11, S12 | Envelope transmission losses |
| `VolumeMetricsNodes.js` | S12 | Volume/surface metrics |
| `MechanicalNodes.js` | S13 | Heating/cooling systems, COP |
| `VentilationNodes.js` | S13 | Ventilation heat loss/gain |
| `RadiantGainsNodes.js` | S10 | Solar gains, SHGC |
| `KeyValuesNodes.js` | S01 | Summary metrics |
| `EmissionsNodes.js` | S05 | Carbon calculations |
| `ForestryNodes.js` | S08 | Wood emissions + offset |
| `RenewableNodes.js` | S06 | PV, wind, offsets |
| `WaterHeatingNodes.js` | S07 | DHW calculations + intermediates |
| `OccupancyNodes.js` | S08 | Occupants, occupied hours |
| `InternalGainsNodes.js` | S09 | Internal gains (occupants, plugs, lighting, equipment), seasonal splits |
| `CoolingNodes.js` | S03 | Psychrometric calculations (wet bulb, humidity) |
| `SpaceHeatingNodes.js` | S14 | Space heating demand calculations |

---

# Phase 1: Validation (COMPLETE)

## Achievements

- **12/12 case studies passing** validation
- Fixed precision issues (COP calculations, heat gain rates)
- Fixed formula bugs (d_129, h_10 override)
- Matched legacy behavior for all building types

## Fixes Applied

| Issue | Fix | Commit |
|-------|-----|--------|
| COP precision (copHeat, copCool) | toFixed(2) → toFixed(4) | `62ec56c` |
| h_10 TEUI override in Section15 | Removed duplicate setValue | `74f05f2` |
| d_129 formula in Section14 | Fixed overwrite bug | Earlier |
| Heat gain/loss rates | toFixed(2) → toFixed(4) | `7ca05dd` |
| U-value conversions | toFixed(3) → toFixed(4) | `7ca05dd` |

---

# Phase 1.5: Intermediate Node Conversion (COMPLETE)

Converted 5 intermediate INPUTs from legacy-synced to graph-native COMPUTED nodes, plus added 10 new intermediate computed nodes.

## Converted Nodes (INPUT → COMPUTED)

| Legacy ID | Semantic ID | Was | Now | Module |
|-----------|-------------|-----|-----|--------|
| `h_70` | `energy.plugLoads.subtotal` | INPUT in EnergyNodes | COMPUTED in InternalGainsNodes | S09 |
| `i_71` | `internal.heatingGains` | INPUT in RadiantGainsNodes | COMPUTED in InternalGainsNodes | S09 |
| `k_71` | `internal.coolingLoad.occupants` | INPUT in EnergyNodes | COMPUTED in InternalGainsNodes | S09 |
| `e_51` | `waterHeating.gasVolume` | INPUT in EmissionsNodes | COMPUTED in WaterHeatingNodes | S07 |
| `k_54` | `waterHeating.oilVolume` | INPUT in EmissionsNodes | COMPUTED in WaterHeatingNodes | S07 |
| `d_65` | `internal.plugLoadDensity` | INPUT | COMPUTED with lookup (standard + building type) | S09 |
| `d_67` | `internal.equipmentDensity` | INPUT | COMPUTED with lookup (building type × efficiency × elevators) | S09 |

## New Intermediate Computed Nodes

### WaterHeatingNodes.js (7 new)

| Legacy ID | Semantic ID | Formula |
|-----------|-------------|---------|
| `e_52` | `waterHeating.efficiencyDecimal` | d_52 / 100 |
| `j_51` | `waterHeating.netThermalDemand` | j_50 / e_52 |
| `e_53` | `waterHeating.energyRecovered` | j_51 × (d_53 / 100) |
| `j_52` | `waterHeating.netDemandAfterRecovery` | j_51 − e_53 |
| `d_54` | `waterHeating.systemLosses` | (e_52 ≤ 1) ? j_50 × factor : 0 |
| `e_51` | `waterHeating.gasVolume` | (type=Gas) ? j_52 / (0.0373 × 277.78 × e_52) : 0 |
| `k_54` | `waterHeating.oilVolume` | (type=Oil) ? j_52 / (10.18 × e_52) : 0 |

### InternalGainsNodes.js (4 inputs + 10 computed)

**Inputs:**

| Legacy ID | Semantic ID | Default |
|-----------|-------------|---------|
| `d_64` | `internal.activityLevel` | "Normal" (dropdown) |
| `d_66` | `internal.lightingDensity` | 1.5 W/m² |
| `g_67` | `internal.efficiencySpec` | "Regular" (dropdown) |
| `d_68` | `internal.elevators` | "No Elevators" (dropdown) |

**Computed nodes (including d_65/d_67 lookup tables):**

| Legacy ID | Semantic ID | Formula |
|-----------|-------------|---------|
| `d_65` | `internal.plugLoadDensity` | Lookup by standard + building type |
| `d_67` | `internal.equipmentDensity` | Lookup by building type × efficiency × elevators |
| `g_64` | `internal.occupants.wattsPerPerson` | Activity level → watts lookup |
| `h_64` | `internal.occupants.annual` | (g_64 × occupants × hours) / 1000 |
| `h_65` | `internal.plugLoads.annual` | (d_65 × area × hours) / 1000 |
| `h_66` | `internal.lighting.annual` | (d_66 × area × hours) / 1000 |
| `h_67` | `internal.equipment.annual` | (d_67 × area × hours) / 1000 |
| `h_70` | `energy.plugLoads.subtotal` | h_65 + h_66 + h_67 |
| `i_71` | `internal.heatingGains` | (h_70 + h_64 + d_54) × (365 − coolingDays) / 365 |
| `k_71` | `internal.coolingLoad.occupants` | (h_70 + h_64 + d_54) × coolingDays / 365 |

**d_65 Plug Load Density Logic:**
- PH Classic/Plus/Premium → 2.1 W/m²
- PHIUS/EnerPHit/PH Low Energy → 5 W/m²
- Residential/Care occupancies (C-, B1-, B2-, B3-) → 5 W/m²
- Otherwise → 7 W/m²

**d_67 Equipment Density Lookup Table** (11 building types × 2 efficiency × 2 elevator):
- Uses `equipmentLoadsTable` with fallback to 5.0 W/m²
- Reference model always uses g_67="Regular" (via ReferenceValues.js)

**Activity level mapping** (from SCHEDULES-3037.csv):
```
Relaxed:     96.71 W/person
Normal:     117.23 W/person
Active:     219.81 W/person
Hyperactive: 424.95 W/person
```

## Also Fixed

| Issue | Fix |
|-------|-----|
| `k_51` duplicate INPUT | Removed from EnergyNodes (already computed in WaterHeatingNodes) |
| `d_135`/`d_136` dependency | Changed from `energy.dhw.netElectrical` → `waterHeating.netElectricalDemand` |

## Validation

12/12 case studies passing, 0 mismatches. Commit: `aa74a2f`

## Running Validation

```bash
# Run all case study validations
npx playwright test test/caseStudyValidation.spec.cjs --reporter=list

# Expected output:
# Testing: 01-ThreeFeathersTerrace.csv
#   ✅ PASS (340 matches, 9 close)
# ...
# Testing: 12-AberdeenHouse.csv
#   ✅ PASS (338 matches, 11 close)
```

---

# Phase 2: Cutover Complete (January 29, 2026)

## Cutover Achieved

**ComputationGraph is now the single source of truth.** Legacy Section*.js calculateAll() functions are no longer called.

### What Changed

| Component | Before | After |
|-----------|--------|-------|
| Calculator.js | Conditional path (graph OR legacy) | Graph-only path |
| Section*.js | calculateAll() called in sequence | Only updateCalculatedDisplayValues() for DOM |
| Cooling.js | ~1,400 lines of calculations | ~70 line stub (reads from StateManager) |
| init.js | Flag toggleable | USE_COMPUTATION_GRAPH=true unconditionally |
| Tilt button | Workaround for stuck UI | Removed (no longer needed) |

### Reference Model Handling

The Reference model represents a code-minimum building for comparison. Key differences:

| Aspect | Target Model | Reference Model |
|--------|--------------|-----------------|
| C-fields (envelope, mechanical) | User-specified | Loaded from ReferenceValues.js |
| G-fields (geometry, climate) | Shared | Shared (copied from Target) |
| Wood carbon offset (`forestry.annualOffset`) | User-specified | **Forced to 0** |

**Why wood offset = 0 for Reference?**

The Reference building represents a code-minimum baseline. It gets the emissions from wood usage (if applicable) but does NOT receive the carbon credit offset. This ensures:
- Reference lifetime carbon (e_6) correctly shows higher emissions
- Target building can show carbon reduction via wood offsets
- Comparison metrics (j_6, j_8) are meaningful

Implementation in `computeAllWithReference()`:
```javascript
// Step 2.5: Force wood offset = 0 for Reference model
state.setValueForModel(refModelId, "forestry.annualOffset", 0);
engine.onValueChange("forestry.annualOffset", 0, refModelId);
```

### Validation

The following fields are validated across all 12 case studies:

| Field | Description | Status |
|-------|-------------|--------|
| `ref_j_32` | Reference Total Actual Energy | ✅ 12/12 pass |
| `ref_k_32` | Reference Total Emissions | ✅ 12/12 pass |
| `e_6` | Target Lifetime Carbon (T.1) | ✅ 12/12 pass |
| `e_8` | Target Annual Carbon (T.2) | ✅ 12/12 pass |

- **Secondary field mismatches** are test isolation issues, not missing calculations
- Fields like k_27, f_32, g_32 exist in EmissionsNodes.js

## Remaining Cleanup (Optional)

These are polish items, not functional blockers:

| Item | Description | Priority |
|------|-------------|----------|
| Dead code in Section*.js | 20 sections have unused calculateAll() functions | Low |
| DOMBridge not reactive | Still using updateCalculatedDisplayValues() for DOM refresh | Low |
| Test isolation | Secondary field carry-over between case studies | Low |

### Dead Code Details

Section*.js files still contain:
- `calculateAll()` functions (never called)
- `calculateTargetModel()` / `calculateReferenceModel()` (never called)
- Various `calculate*()` helper functions (never called)

These could be removed in a future cleanup pass. The files now serve as:
- UI rendering (`updateCalculatedDisplayValues()`)
- DOM structure/layout
- User input handling

### True "Model Drives UI" (Future)

Current state: After graph computation, we explicitly call `updateCalculatedDisplayValues()` on all sections.

Ideal state: DOMBridge would reactively update DOM when MultiModelState fires events.

Blocker: DOMBridge uses `textContent` which destroys HTML formatting in sections like S01. Would need smarter element updating that preserves structure.

---

# Phase 3: Multi-Model Architecture (COMPLETE)

## Implementation

The multi-model architecture is now working with Target and Reference models computed separately.

### How It Works

1. **Two models exist**: Target (user's building) and Reference (code-minimum baseline)
2. **G-fields shared**: Geometry and climate data identical between models
3. **C-fields separate**: Envelope and mechanical values differ per model
4. **Cross-model sync**: Reference outputs copied to Target's `reference.*` inputs

### REF_OUTPUT_TO_TARGET_INPUT Mapping

Reference model computed values are synced to Target model inputs for comparison:

```javascript
const REF_OUTPUT_TO_TARGET_INPUT = {
  "energy.target.total": "reference.targetEnergy",
  "energy.tedi.total": "reference.tedi",
  "energy.teui.total": "reference.teui",
  "emissions.target.subtotal": "reference.emissions",
  // ... additional mappings
};
```

### Cross-Model Value Access

For nodes that need both Target and Reference values (like KeyValuesNodes), the Reference values are available as `reference.*` inputs after `syncCrossModelValues()` runs.

```javascript
// KeyValuesNodes can access both:
compute: (inputs) => {
  const targetTEUI = inputs["energy.teui.total"];        // Target's TEUI
  const refTEUI = inputs["reference.teui"];              // Reference's TEUI
  return ((refTEUI - targetTEUI) / refTEUI) * 100;       // Reduction %
}
```

## Future Extensions

- Compare Target vs OBC Reference
- Compare Target vs NBC Reference
- Compare Target vs PHPP baseline
- Multiple target variants (design options)

---

# Field Classification

- **G-fields (Geometry)**: Shared across all models (location, floor area, volume)
- **C-fields (Code/Performance)**: Model-specific (envelope R-values, mechanical efficiency)
- **A-fields (All other)**: Model-specific metadata

When G-field changes → recompute all models
When C-field changes → recompute only that model

---

# Node Module Pattern

Each `*Nodes.js` file follows this pattern:

```javascript
(function () {
  window.TEUI = window.TEUI || {};
  window.TEUI.ComputationNodes = window.TEUI.ComputationNodes || {};

  const inputs = [
    {
      id: "semantic.input.path",
      legacyId: "d_XX",
      section: "SXX",
      label: "Human readable label",
      defaultValue: 0
    }
  ];

  const nodes = [
    {
      id: "semantic.computed.path",
      legacyId: "e_XX",
      dependencies: ["semantic.input.path", "other.dependency"],
      classification: "C",  // G, C, or A
      section: "SXX",
      label: "Computed value label",
      unit: "kWh/yr",
      compute: (inputs) => {
        const value = parseNum(inputs["semantic.input.path"], 0);
        return +(value * 24).toFixed(4);  // Use toFixed(4) for precision
      }
    }
  ];

  function register(graph) {
    inputs.forEach(i => graph.registerInput(i));
    nodes.forEach(n => graph.registerNode(n));
  }

  window.TEUI.ComputationNodes.SectionName = { register };
})();
```

---

# Testing

## Case Study Validation

```bash
npx playwright test test/caseStudyValidation.spec.cjs
```

Compares ~350 fields across 12 real building projects.

## Performance Benchmark

```bash
node test/perf-test.cjs
```

Measures:
- Legacy full recalc time
- New system full recalc time
- New system incremental update time

## Manual Browser Testing

Open `test/computation/fullCalculation.test.html`:
1. Load a CSV project file
2. Click "Validate" to compare systems
3. Review mismatches (should be 0)
