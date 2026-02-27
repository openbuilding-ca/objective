# Refactoring Plan: Multi-Model Architecture with Incremental Computation

## Status Update (December 2025)

### Implementation Status: NOT STARTED

No implementation work has begun on this refactoring plan. All phases remain in planning/documentation stage.

### Existing Infrastructure to Leverage

StateManager.js already provides foundational dependency tracking that this plan can build upon:

| Feature | Current State | Location |
|---------|--------------|----------|
| Dependencies Map | ✅ Exists | `StateManager.js:168` |
| `markDependentsDirty()` | ✅ Exists | `StateManager.js:516` |
| `getCalculationOrder()` (topo sort) | ✅ Exists | `StateManager.js:791` |
| `exportDependencyGraph()` | ✅ Exists | `StateManager.js:1164` |
| `getDualStateDependencyAnalysis()` | ✅ Exists | `StateManager.js:1584` |
| Dependency.js (visualization) | ✅ Exists | `src/core/Dependency.js` |

### Phase Status Summary

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Computation Graph Infrastructure | ✅ Complete | All 5 tasks done (Dec 2025) |
| Phase 2: Section Migration to Nodes | ✅ Complete | All 6 tasks done (Dec 2025) |
| Phase 3: Multi-Model State | ✅ Complete | All 5 tasks done (Dec 2025) |
| Phase 4: UI Integration | ✅ Complete | All 5 tasks done (Dec 2025) |
| Phase 5: Cleanup & Optimization | ⏳ Not Started | Ready to begin |

### Phase 1 Deliverables

| File | Purpose |
|------|---------|
| `src/core/computation/types.js` | JSDoc type definitions |
| `src/core/computation/ComputationGraph.js` | Dependency graph structure |
| `src/core/computation/IncrementalEngine.js` | Incremental computation engine |
| `src/core/computation/FieldRegistry.js` | Legacy ID to semantic path mapping |
| `test/computation/computation.test.js` | Unit tests (run via test.html) |

### Phase 2 Deliverables

| File | Purpose |
|------|---------|
| `src/sections/nodes/ClimateNodes.js` | Climate (S03) calculation nodes |
| `src/sections/nodes/EnvelopeNodes.js` | Envelope (S10/S11/S12) calculation nodes |
| `src/sections/nodes/MechanicalNodes.js` | Mechanical (S13) calculation nodes |
| `src/sections/nodes/EnergyNodes.js` | Energy (S14/S15) result nodes |
| `test/computation/sectionNodes.test.js` | Section node verification tests |
| `test/computation/sectionNodes.test.html` | Browser test runner for section nodes |

### Phase 3 Deliverables

| File | Purpose |
|------|---------|
| `src/core/model/ModelMetadata.js` | Model identity and type management |
| `src/core/model/MultiModelState.js` | G/C field separation, state per model |
| `src/core/model/MultiModelEngine.js` | Incremental computation across models |
| `src/core/model/ModelOperations.js` | High-level ops (create, clone, compare) |
| `test/computation/multiModel.test.js` | Multi-model unit tests |
| `test/computation/multiModel.test.html` | Browser test runner for multi-model |

### Phase 4 Deliverables

| File | Purpose |
|------|---------|
| `src/core/computation/LegacyAdapter.js` | Bridge StateManager API to new engine |
| `src/core/ui/ModelSelector.js` | Model selection UI (dropdown/tabs/pills) |
| `src/core/ui/ComparisonView.js` | Side-by-side model comparison |
| `src/core/ui/DOMBridge.js` | DOM ↔ Engine connection (input/output) |
| `test/computation/phase4.test.js` | Phase 4 unit tests |
| `test/computation/phase4.test.html` | Browser test runner for Phase 4 |

### Recent Codebase Changes (Since Plan Creation)

- WOMBAT 3D visualization implemented in Section 19
- Section 19 dual-state architecture with bidirectional S12 sync
- Various bug fixes for state management and field synchronization
- Documentation reorganization into logical directories

---

## Executive Summary

This plan transforms the OBJECTIVE TEUI Calculator into a **multi-model architecture** with **incremental reactive computation**. When a value changes, only the affected portions of the dependency graph are recomputed—not the entire model.

**Key Principles:**
1. **Models as immutable values** - easy to compare, cache, and version
2. **Explicit dependency graph** - know exactly what depends on what
3. **Incremental computation** - only recompute what's affected
4. **Information hiding** - modules expose interfaces, hide implementation

---

## Part 1: Incremental Computation Model

### The Problem with Full Recomputation

```javascript
// Current: ANY change triggers EVERYTHING
function onValueChange(fieldId, value) {
  calculateTargetModel();      // Recalculates ~200 fields
  calculateTargetModel();      // Pass 2
  calculateReferenceModel();   // Another ~200 fields
  calculateReferenceModel();   // Pass 2
}
// Result: ~800 calculations for changing one field
```

### The Solution: Dependency-Aware Incremental Computation

```javascript
// New: Change triggers only dependents
function onValueChange(fieldId, value) {
  const affected = dependencyGraph.getDownstream(fieldId);
  // affected might be just 5-10 fields, not 200+

  incrementalRecalculate(affected);
}
```

---

## Part 2: Computation Graph Architecture

### 2.1 Computation Nodes

Each calculable value is a **node** in the computation graph:

```typescript
type ComputationNode<T> = {
  readonly id: string;              // Semantic path: 'energy.heating.load'
  readonly compute: ComputeFn<T>;   // Pure function to calculate value
  readonly dependencies: string[];  // What this node needs
  readonly dependents: string[];    // What depends on this node (derived)
};

// Example: Heating load depends on HDD and UA
const heatingLoadNode: ComputationNode<KilowattHours> = {
  id: 'energy.heating.load',
  dependencies: ['climate.heating.degreedays', 'envelope.totalUA'],
  dependents: [],  // Populated by graph builder

  compute: (inputs) => {
    const hdd = inputs['climate.heating.degreedays'];
    const ua = inputs['envelope.totalUA'];
    return hdd * ua * 24 / 1000;
  }
};
```

### 2.2 Computation Graph Structure

```typescript
type ComputationGraph = {
  // All nodes in the graph
  nodes: Map<string, ComputationNode<unknown>>;

  // Adjacency lists for traversal
  edges: {
    downstream: Map<string, Set<string>>;  // What depends on this
    upstream: Map<string, Set<string>>;    // What this depends on
  };

  // Query operations
  getDownstream(nodeId: string): string[];   // All affected by change
  getUpstream(nodeId: string): string[];     // All dependencies
  topologicalOrder(nodeIds: string[]): string[];  // Safe compute order
};
```

### 2.3 Building the Graph

```typescript
const buildComputationGraph = (
  sections: SectionDefinition[]
): ComputationGraph => {
  const nodes = new Map();
  const downstream = new Map();
  const upstream = new Map();

  // Register all nodes from sections
  for (const section of sections) {
    for (const field of section.computedFields) {
      nodes.set(field.id, field);
      upstream.set(field.id, new Set(field.dependencies));

      // Build reverse edges (downstream)
      for (const dep of field.dependencies) {
        if (!downstream.has(dep)) downstream.set(dep, new Set());
        downstream.get(dep).add(field.id);
      }
    }
  }

  return {
    nodes,
    edges: { downstream, upstream },

    getDownstream(nodeId) {
      // BFS/DFS to find all transitively affected nodes
      const affected = new Set();
      const queue = [nodeId];

      while (queue.length > 0) {
        const current = queue.shift();
        for (const dependent of downstream.get(current) ?? []) {
          if (!affected.has(dependent)) {
            affected.add(dependent);
            queue.push(dependent);
          }
        }
      }
      return Array.from(affected);
    },

    topologicalOrder(nodeIds) {
      // Return nodes in dependency-safe order
      // Uses Kahn's algorithm or DFS-based topo sort
      return topologicalSort(nodeIds, upstream);
    }
  };
};
```

---

## Part 3: Incremental Recalculation

### 3.1 The Incremental Engine

```typescript
type ComputationState = Map<string, unknown>;  // Current values

const IncrementalEngine = {
  graph: null as ComputationGraph,

  initialize(graph: ComputationGraph) {
    this.graph = graph;
  },

  // Core: Recompute only affected nodes
  recompute(
    currentState: ComputationState,
    changedNodeId: string,
    newValue: unknown
  ): ComputationState {
    // 1. Find all affected nodes
    const affected = this.graph.getDownstream(changedNodeId);

    // 2. Order them by dependencies (topo sort)
    const computeOrder = this.graph.topologicalOrder(affected);

    // 3. Create new state with the change
    let newState = new Map(currentState);
    newState.set(changedNodeId, newValue);

    // 4. Recompute only affected nodes in order
    for (const nodeId of computeOrder) {
      const node = this.graph.nodes.get(nodeId);

      // Gather inputs from current state
      const inputs = {};
      for (const dep of node.dependencies) {
        inputs[dep] = newState.get(dep);
      }

      // Compute new value
      const computed = node.compute(inputs);
      newState.set(nodeId, computed);
    }

    return newState;
  }
};
```

### 3.2 Example: What Gets Recomputed

```
User changes: envelope.roof.rsiValue

Dependency graph:
  envelope.roof.rsiValue
    └─→ envelope.roof.uFactor
          └─→ envelope.totalUA
                ├─→ energy.heating.load
                │     └─→ energy.heating.delivered
                │           └─→ intensities.teui
                │                 └─→ compliance.teuiMargin
                └─→ energy.cooling.load
                      └─→ energy.cooling.delivered
                            └─→ intensities.teui (already counted)

Nodes recomputed: 8 (not 200+)
```

### 3.3 Comparison with Current System

```
                    Current System    |    Incremental System
Change roof RSI:    ~800 calcs        |    ~8 calcs (99% reduction)
Change city:        ~800 calcs        |    ~60 calcs (climate ripples)
Change label:       ~800 calcs        |    0 calcs (no dependencies)
```

---

## Part 4: Multi-Model with Shared Computation

### 4.1 Models Share Input Nodes, Have Separate C-Nodes

```typescript
// Geometry (G) fields: Single source, shared by all related models
// Code (C) fields: Each model has its own copy

type MultiModelState = {
  // Shared inputs (G-fields)
  shared: ComputationState;

  // Per-model states (C-fields + derived values)
  models: Map<ModelId, ComputationState>;
};

// Example structure:
{
  shared: {
    'geometry.conditionedFloorArea': 5000,
    'geometry.totalVolume': 15000,
    'climate.location.province': 'ON',
    'climate.heating.degreedays': 3652,
  },
  models: {
    'target-v1': {
      'envelope.roof.rsiValue': 5.0,
      'envelope.totalUA': 450,
      'energy.heating.load': 39000,
      'intensities.teui': 85,
    },
    'ref-obc-sb12': {
      'envelope.roof.rsiValue': 3.72,  // Code minimum
      'envelope.totalUA': 580,
      'energy.heating.load': 50000,
      'intensities.teui': 110,
    }
  }
}
```

### 4.2 Change Propagation by Field Type

```typescript
const MultiModelEngine = {
  // When G-field changes: Recompute downstream in ALL models
  onSharedFieldChange(
    state: MultiModelState,
    fieldId: string,
    newValue: unknown
  ): MultiModelState {
    // Update shared state
    const newShared = IncrementalEngine.recompute(
      state.shared, fieldId, newValue
    );

    // Get affected downstream nodes
    const affected = graph.getDownstream(fieldId);

    // Recompute in each model
    const newModels = new Map();
    for (const [modelId, modelState] of state.models) {
      const merged = mergeStates(newShared, modelState);
      const updated = IncrementalEngine.recomputeNodes(merged, affected);
      newModels.set(modelId, extractModelState(updated));
    }

    return { shared: newShared, models: newModels };
  },

  // When C-field changes: Recompute only in THAT model
  onModelFieldChange(
    state: MultiModelState,
    modelId: ModelId,
    fieldId: string,
    newValue: unknown
  ): MultiModelState {
    const modelState = state.models.get(modelId);
    const merged = mergeStates(state.shared, modelState);

    // Recompute only in this model
    const updated = IncrementalEngine.recompute(merged, fieldId, newValue);

    // Return state with only this model updated
    const newModels = new Map(state.models);
    newModels.set(modelId, extractModelState(updated));

    return { shared: state.shared, models: newModels };
  }
};
```

### 4.3 Efficiency: Shared Geometry Reuse

```typescript
// When geometry changes, models share intermediate calculations

const onGeometryChange = (fieldId, newValue) => {
  // Compute shared geometry-derived values ONCE
  const sharedUpdate = computeGeometryDerived(fieldId, newValue);
  // e.g., volume, surface area, window-to-wall ratio

  // For each model, compute only model-specific downstream
  for (const model of models) {
    const modelUpdate = computeModelSpecific(
      sharedUpdate,  // Reuse shared
      model          // Model's C-values
    );
    // Only UA, loads, TEUI etc. computed per-model
  }
};
```

---

## Part 5: Section Definitions with Dependencies

### 5.1 Section as Computation Node Factory

```typescript
type SectionDefinition = {
  id: string;
  name: string;

  // All computation nodes this section defines
  computedFields: ComputationNode[];

  // Input fields (not computed, but used)
  inputFields: string[];
};

// Example: Section 13 - Mechanical
const Section13: SectionDefinition = {
  id: 'S13',
  name: 'Mechanical Systems',

  inputFields: [
    'mechanical.heating.type',
    'mechanical.heating.efficiency',
    'mechanical.cooling.cop',
  ],

  computedFields: [
    {
      id: 'energy.heating.delivered',
      dependencies: [
        'energy.heating.load',           // From envelope section
        'mechanical.heating.efficiency'  // Input
      ],
      compute: ({ 'energy.heating.load': load, 'mechanical.heating.efficiency': eff }) =>
        load / eff
    },
    {
      id: 'energy.cooling.delivered',
      dependencies: [
        'energy.cooling.load',
        'mechanical.cooling.cop'
      ],
      compute: ({ 'energy.cooling.load': load, 'mechanical.cooling.cop': cop }) =>
        load / cop
    }
  ]
};
```

### 5.2 Curried Node Definitions

For calculations that share common parameters:

```typescript
// Curried: Create specialized calculator when shared params available
const createHeatingNodes = (climate: ClimateData): ComputationNode[] => [
  {
    id: 'energy.heating.load',
    dependencies: ['envelope.totalUA'],  // Only what varies

    // Climate is "baked in" via closure
    compute: ({ 'envelope.totalUA': ua }) =>
      climate.heating.degreedays * ua * 24 / 1000
  },
  {
    id: 'energy.heating.seasonalAdjustment',
    dependencies: ['energy.heating.load'],

    compute: ({ 'energy.heating.load': load }) =>
      load * climate.heating.adjustmentFactor
  }
];

// When climate changes, recreate these nodes
const onClimateChange = (newClimate) => {
  const newNodes = createHeatingNodes(newClimate);
  graph.updateNodes(newNodes);  // Replace in graph
};
```

---

## Part 6: Convergence in Incremental System

### 6.1 Handling Circular Dependencies

Some calculations have soft circular dependencies (iteration needed):

```typescript
// Free cooling depends on latent factor, which depends on cooling load,
// which can be affected by free cooling capacity

// Solution: Mark nodes that need convergence
type ConvergentNode<T> = ComputationNode<T> & {
  converges: true;
  tolerance: number;
  maxIterations: number;
};

const freeCoolingNode: ConvergentNode<KilowattHours> = {
  id: 'energy.cooling.freeCooling',
  dependencies: ['energy.cooling.latentFactor', 'climate.cooling.nightTemp'],
  converges: true,
  tolerance: 0.001,
  maxIterations: 3,

  compute: (inputs) => {
    // Normal computation
    return calculateFreeCooling(inputs);
  }
};
```

### 6.2 Incremental Engine with Convergence

```typescript
const recomputeWithConvergence = (
  state: ComputationState,
  affectedNodes: string[]
): ComputationState => {
  // Find convergent node groups
  const convergentGroups = findConvergentCycles(affectedNodes, graph);

  for (const group of convergentGroups) {
    // Iterate until convergence
    let iterations = 0;
    let prevValues = new Map();

    do {
      prevValues = new Map(state);

      // Compute all nodes in group
      for (const nodeId of group) {
        const node = graph.nodes.get(nodeId);
        const inputs = gatherInputs(node.dependencies, state);
        state.set(nodeId, node.compute(inputs));
      }

      iterations++;
    } while (
      !hasConverged(prevValues, state, group) &&
      iterations < maxIterations
    );
  }

  return state;
};
```

---

## Part 7: Complete Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User Interaction Layer                        │
│  - DOM events                                                        │
│  - Input validation                                                  │
│  - Display formatting                                                │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Model Manager                                │
│  - Multiple models (targets, references, variants)                   │
│  - Tracks which model is "active"                                    │
│  - Routes changes to correct model                                   │
├─────────────────────────────────────────────────────────────────────┤
│  HIDES: Number of models, model storage, active model selection      │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Shared State   │    │   Model State   │    │   Model State   │
│  (G-fields)     │    │   (Target)      │    │   (Reference)   │
│                 │    │                 │    │                 │
│ geometry.*      │    │ envelope.*      │    │ envelope.*      │
│ climate.loc.*   │    │ mechanical.*    │    │ mechanical.*    │
│                 │    │ energy.*        │    │ energy.*        │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Incremental Computation Engine                    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Computation Graph                          │   │
│  │                                                               │   │
│  │   geometry.area ──→ envelope.totalUA ──→ energy.heating.load │   │
│  │        │                   │                    │             │   │
│  │        │                   │                    ▼             │   │
│  │        │                   │           energy.heating.delivered│   │
│  │        │                   │                    │             │   │
│  │        ▼                   ▼                    ▼             │   │
│  │   geometry.volume    energy.cooling.load   intensities.teui  │   │
│  │                                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  On change:                                                          │
│  1. Find downstream nodes (graph traversal)                          │
│  2. Topological sort affected nodes                                  │
│  3. Recompute only affected, in order                                │
│  4. Handle convergence if needed                                     │
├─────────────────────────────────────────────────────────────────────┤
│  HIDES: Dependency resolution, compute order, convergence loops      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Part 8: Implementation Roadmap

### Phase 1: Computation Graph Infrastructure

**Goal:** Build the incremental computation engine independent of existing code

1. Define `ComputationNode` type
2. Build `ComputationGraph` with traversal operations
3. Implement `IncrementalEngine.recompute()`
4. Add convergence handling
5. Unit test with small example graphs

**Deliverables:**
- `src/core/computation/ComputationNode.js`
- `src/core/computation/ComputationGraph.js`
- `src/core/computation/IncrementalEngine.js`
- `test/computation/*.test.js`

### Phase 2: Section Migration to Nodes

**Goal:** Express existing calculations as computation nodes

6. Map existing field IDs to semantic paths
7. Convert Section03 (Climate) to node definitions
8. Convert Section11 (Envelope) to node definitions
9. Convert Section13 (Mechanical) to node definitions
10. Verify results match existing calculations

**Deliverables:**
- `src/sections/nodes/ClimateNodes.js`
- `src/sections/nodes/EnvelopeNodes.js`
- `src/sections/nodes/MechanicalNodes.js`
- Integration tests comparing old vs new results

### Phase 3: Multi-Model State

**Goal:** Support multiple models with shared/separate state

11. Implement `MultiModelState` structure
12. Build `MultiModelEngine` change propagation
13. Add model creation, variants, cloning
14. Implement comparison operations

**Deliverables:**
- `src/core/model/MultiModelState.js`
- `src/core/model/MultiModelEngine.js`
- `src/core/model/ModelOperations.js`

### Phase 4: UI Integration

**Goal:** Connect new computation to existing UI

15. Create adapter layer for legacy field IDs
16. Wire DOM events to incremental engine
17. Implement model selector UI
18. Add comparison view

### Phase 5: Cleanup & Optimization

19. Remove legacy calculation code
20. Add computation caching
21. Profile and optimize hot paths
22. Final documentation

---

## Part 9: Data Structures Summary

### Core Types

```typescript
// Semantic field path
type FieldPath = string;  // e.g., 'envelope.roof.rsiValue'

// Computation node
type ComputationNode<T> = {
  id: FieldPath;
  dependencies: FieldPath[];
  compute: (inputs: Record<FieldPath, unknown>) => T;
  converges?: boolean;
  tolerance?: number;
};

// Computation state (current values)
type ComputationState = Map<FieldPath, unknown>;

// Multi-model state
type MultiModelState = {
  shared: ComputationState;           // G-fields
  models: Map<ModelId, ComputationState>;  // Per-model C-fields + derived
};

// Computation graph
type ComputationGraph = {
  nodes: Map<FieldPath, ComputationNode>;
  edges: {
    downstream: Map<FieldPath, Set<FieldPath>>;
    upstream: Map<FieldPath, Set<FieldPath>>;
  };
};

// Model metadata (not computed values)
type ModelMetadata = {
  id: ModelId;
  label: string;
  modelType: 'target' | 'reference' | 'variant';
  parentId?: ModelId;
  createdAt: Timestamp;
};
```

---

## Part 10: Benefits Summary

| Aspect | Full Recomputation | Incremental |
|--------|-------------------|-------------|
| **Performance** | ~800 calcs per change | ~8-60 calcs per change |
| **Scalability** | Degrades with model count | Efficient with many models |
| **Debugging** | Hard to trace what changed | Clear dependency chains |
| **Testing** | Test entire system | Test individual nodes |
| **Caching** | Difficult | Natural per-node caching |
| **Convergence** | Hidden in passes | Explicit, targeted |

---

## Summary

This architecture provides:

1. **Incremental Computation** - Only recalculate what's affected
2. **Explicit Dependencies** - Clear graph of what depends on what
3. **Multi-Model Support** - Any number of targets, references, variants
4. **Shared State Efficiency** - G-fields computed once, shared by models
5. **Information Hiding** - Modules expose interfaces, hide implementation
6. **Testability** - Pure functions, isolated node testing
7. **Convergence Handling** - Explicit, targeted iteration where needed
