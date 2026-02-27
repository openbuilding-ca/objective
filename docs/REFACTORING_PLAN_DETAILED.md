# Detailed Implementation Plan: Multi-Model Architecture with Incremental Computation

## Status Update (December 2025)

### Implementation Status: PHASE 4 COMPLETE

Phase 1 (Computation Graph Infrastructure) completed December 2025.
Phase 2 (Section Migration to Computation Nodes) completed December 2025.
Phase 3 (Multi-Model State Management) completed December 2025.
Phase 4 (UI Integration) completed December 2025.

### Task Status Legend

| Symbol | Meaning |
|--------|---------|
| ⏳ | Not Started |
| 🔄 | In Progress |
| ✅ | Completed |
| ⚠️ | Blocked |

### Existing Infrastructure (Can Be Leveraged)

The following StateManager.js features provide a foundation:

```javascript
// Already exists in StateManager.js
dependencies = new Map();                    // Line 168
markDependentsDirty(fieldId, visited);       // Line 516
getCalculationOrder();                       // Line 791 (topological sort)
exportDependencyGraph(mode);                 // Line 1164
getDualStateDependencyAnalysis();            // Line 1584
```

**Dependency.js** already provides D3-based visualization of the dependency graph.

### Quick Start Recommendation

If starting implementation, begin with **Task 1.1** (Type Definitions) which has no dependencies and establishes the foundation for all subsequent work.

---

## Overview

This document provides a task-by-task breakdown of all phases for refactoring the OBJECTIVE TEUI Calculator. Each task includes:
- **Objective**: What we're trying to achieve
- **Inputs**: What we need before starting
- **Outputs**: Deliverables when complete
- **Dependencies**: What must be done first
- **Implementation Details**: Specific code and approach
- **Verification**: How to confirm it works

---

## Phase 1: Computation Graph Infrastructure ✅

**Status:** COMPLETE (December 2025)
**Goal:** Build the incremental computation engine as a standalone module that can work alongside existing code.

**Leverages Existing Code:**
- `StateManager.js` already has `dependencies` Map and `markDependentsDirty()`
- `getCalculationOrder()` provides topological sort
- `exportDependencyGraph()` exports node/link structure

---

### Task 1.1: Define Core Type Definitions ✅

**Objective:** Create JSDoc type definitions for the computation system.

**Dependencies:** None (can start immediately)

**Completed:** `src/core/computation/types.js`

**Inputs:**
- Existing field patterns from StateManager
- Current dependency structure from `exportDependencyGraph()`

**Outputs:**
- `src/core/computation/types.js` - Type definitions

**Implementation:**

```javascript
// src/core/computation/types.js

/**
 * Semantic path to a field (replaces cell references like d_135)
 * @typedef {string} FieldPath
 * @example 'envelope.roof.rsiValue'
 * @example 'energy.heating.load'
 */

/**
 * Unique identifier for a model
 * @typedef {string} ModelId
 */

/**
 * Field classification for shared vs model-specific behavior
 * @typedef {'G' | 'C' | 'A'} FieldClassification
 * G = Geometry (shared across related models)
 * C = Code/Performance (model-specific)
 * A = All other (model-specific)
 */

/**
 * A computation node represents a calculable value
 * @template T
 * @typedef {Object} ComputationNode
 * @property {FieldPath} id - Unique identifier (semantic path)
 * @property {string} legacyId - Original cell reference (d_135) for migration
 * @property {FieldPath[]} dependencies - What this node needs to compute
 * @property {function(Object<FieldPath, *>): T} compute - Pure computation function
 * @property {FieldClassification} classification - G, C, or A
 * @property {string} [section] - Which section owns this node (S03, S13, etc.)
 * @property {boolean} [converges] - True if needs iterative convergence
 * @property {number} [tolerance] - Convergence tolerance if converges=true
 * @property {number} [maxIterations] - Max iterations for convergence
 */

/**
 * Input node (user-editable, not computed)
 * @template T
 * @typedef {Object} InputNode
 * @property {FieldPath} id - Unique identifier
 * @property {string} legacyId - Original cell reference
 * @property {T} defaultValue - Default value
 * @property {FieldClassification} classification - G, C, or A
 * @property {function(T): boolean} [validate] - Validation function
 * @property {string} [section] - Which section owns this node
 */

/**
 * Current values of all nodes
 * @typedef {Map<FieldPath, *>} ComputationState
 */

/**
 * Multi-model state structure
 * @typedef {Object} MultiModelState
 * @property {ComputationState} shared - G-fields shared by all models
 * @property {Map<ModelId, ComputationState>} models - Per-model C-fields + computed
 */

/**
 * Computation graph structure
 * @typedef {Object} ComputationGraph
 * @property {Map<FieldPath, ComputationNode>} nodes - All computation nodes
 * @property {Map<FieldPath, InputNode>} inputs - All input nodes
 * @property {Object} edges - Adjacency lists
 * @property {Map<FieldPath, Set<FieldPath>>} edges.downstream - What depends on each node
 * @property {Map<FieldPath, Set<FieldPath>>} edges.upstream - What each node depends on
 */

/**
 * Model metadata (not computation values)
 * @typedef {Object} ModelMetadata
 * @property {ModelId} id - Unique identifier
 * @property {string} label - Display name
 * @property {'target' | 'reference' | 'variant'} modelType - Type of model
 * @property {ModelId} [parentId] - Parent model if this is a variant
 * @property {number} createdAt - Creation timestamp
 */

/**
 * Result of incremental recomputation
 * @typedef {Object} RecomputeResult
 * @property {ComputationState} state - New state after computation
 * @property {FieldPath[]} computed - Which nodes were recomputed
 * @property {number} iterations - Convergence iterations (if any)
 */

// Export as TEUI namespace extension
window.TEUI = window.TEUI || {};
window.TEUI.ComputationTypes = {
  // Type markers for runtime checks
  isComputationNode: (obj) => obj && typeof obj.compute === 'function',
  isInputNode: (obj) => obj && 'defaultValue' in obj && !('compute' in obj),
};
```

**Verification:**
- [ ] File loads without errors
- [ ] Types are accessible via `TEUI.ComputationTypes`
- [ ] JSDoc provides IntelliSense in IDE

---

### Task 1.2: Build ComputationGraph Module ✅

**Objective:** Create the graph structure with traversal operations.

**Completed:** `src/core/computation/ComputationGraph.js`

**Dependencies:** Task 1.1 (types)

**Inputs:**
- Type definitions from 1.1
- Existing graph export format from `StateManager.exportDependencyGraph()`

**Outputs:**
- `src/core/computation/ComputationGraph.js`

**Implementation:**

```javascript
// src/core/computation/ComputationGraph.js

/**
 * ComputationGraph - Manages the dependency graph for incremental computation
 *
 * Key operations:
 * - getDownstream(nodeId): Find all nodes affected by a change
 * - getUpstream(nodeId): Find all dependencies of a node
 * - topologicalSort(nodeIds): Order nodes for safe computation
 */
(function() {
  'use strict';

  /**
   * Create a new computation graph
   * @returns {ComputationGraph}
   */
  function createComputationGraph() {
    const nodes = new Map();      // FieldPath → ComputationNode
    const inputs = new Map();     // FieldPath → InputNode
    const downstream = new Map(); // FieldPath → Set<FieldPath> (what depends on this)
    const upstream = new Map();   // FieldPath → Set<FieldPath> (what this depends on)

    return {
      // ========== Registration ==========

      /**
       * Register a computation node
       * @param {ComputationNode} node
       */
      registerNode(node) {
        if (nodes.has(node.id)) {
          console.warn(`ComputationGraph: Replacing existing node ${node.id}`);
        }
        nodes.set(node.id, node);

        // Initialize edge sets
        if (!downstream.has(node.id)) downstream.set(node.id, new Set());
        if (!upstream.has(node.id)) upstream.set(node.id, new Set());

        // Build edges from dependencies
        upstream.set(node.id, new Set(node.dependencies));

        for (const dep of node.dependencies) {
          if (!downstream.has(dep)) downstream.set(dep, new Set());
          downstream.get(dep).add(node.id);
        }
      },

      /**
       * Register an input node (not computed)
       * @param {InputNode} input
       */
      registerInput(input) {
        inputs.set(input.id, input);
        if (!downstream.has(input.id)) downstream.set(input.id, new Set());
      },

      /**
       * Register multiple nodes at once
       * @param {ComputationNode[]} nodeArray
       */
      registerNodes(nodeArray) {
        for (const node of nodeArray) {
          this.registerNode(node);
        }
      },

      // ========== Queries ==========

      /**
       * Get a node by ID
       * @param {FieldPath} nodeId
       * @returns {ComputationNode | undefined}
       */
      getNode(nodeId) {
        return nodes.get(nodeId);
      },

      /**
       * Get an input by ID
       * @param {FieldPath} inputId
       * @returns {InputNode | undefined}
       */
      getInput(inputId) {
        return inputs.get(inputId);
      },

      /**
       * Check if a node exists
       * @param {FieldPath} nodeId
       * @returns {boolean}
       */
      hasNode(nodeId) {
        return nodes.has(nodeId) || inputs.has(nodeId);
      },

      /**
       * Get all node IDs
       * @returns {FieldPath[]}
       */
      getAllNodeIds() {
        return [...nodes.keys()];
      },

      /**
       * Get all input IDs
       * @returns {FieldPath[]}
       */
      getAllInputIds() {
        return [...inputs.keys()];
      },

      // ========== Traversal ==========

      /**
       * Get all nodes that depend on the given node (transitively)
       * @param {FieldPath} nodeId - Starting node
       * @returns {FieldPath[]} - All affected downstream nodes
       */
      getDownstream(nodeId) {
        const affected = new Set();
        const queue = [nodeId];

        while (queue.length > 0) {
          const current = queue.shift();
          const dependents = downstream.get(current);

          if (dependents) {
            for (const dep of dependents) {
              if (!affected.has(dep)) {
                affected.add(dep);
                queue.push(dep);
              }
            }
          }
        }

        return Array.from(affected);
      },

      /**
       * Get immediate downstream nodes (not transitive)
       * @param {FieldPath} nodeId
       * @returns {FieldPath[]}
       */
      getImmediateDownstream(nodeId) {
        return Array.from(downstream.get(nodeId) || []);
      },

      /**
       * Get all nodes this node depends on (transitively)
       * @param {FieldPath} nodeId
       * @returns {FieldPath[]}
       */
      getUpstream(nodeId) {
        const deps = new Set();
        const queue = [nodeId];

        while (queue.length > 0) {
          const current = queue.shift();
          const dependencies = upstream.get(current);

          if (dependencies) {
            for (const dep of dependencies) {
              if (!deps.has(dep)) {
                deps.add(dep);
                queue.push(dep);
              }
            }
          }
        }

        return Array.from(deps);
      },

      /**
       * Get immediate upstream nodes (not transitive)
       * @param {FieldPath} nodeId
       * @returns {FieldPath[]}
       */
      getImmediateUpstream(nodeId) {
        return Array.from(upstream.get(nodeId) || []);
      },

      // ========== Ordering ==========

      /**
       * Topologically sort a set of node IDs
       * Returns nodes in order such that dependencies come before dependents
       * @param {FieldPath[]} nodeIds - Nodes to sort
       * @returns {FieldPath[]} - Sorted node IDs
       */
      topologicalSort(nodeIds) {
        const nodeSet = new Set(nodeIds);
        const visited = new Set();
        const temp = new Set();
        const result = [];

        const visit = (nodeId) => {
          if (!nodeSet.has(nodeId)) return; // Only sort requested nodes
          if (temp.has(nodeId)) {
            console.warn(`ComputationGraph: Circular dependency at ${nodeId}`);
            return;
          }
          if (visited.has(nodeId)) return;

          temp.add(nodeId);

          // Visit dependencies first
          const deps = upstream.get(nodeId) || new Set();
          for (const dep of deps) {
            visit(dep);
          }

          temp.delete(nodeId);
          visited.add(nodeId);
          result.push(nodeId);
        };

        for (const nodeId of nodeIds) {
          visit(nodeId);
        }

        return result;
      },

      /**
       * Get full computation order (all nodes)
       * @returns {FieldPath[]}
       */
      getFullComputationOrder() {
        return this.topologicalSort(this.getAllNodeIds());
      },

      // ========== Analysis ==========

      /**
       * Find nodes that require convergence iteration
       * @returns {FieldPath[][]} - Groups of nodes that form convergence cycles
       */
      findConvergenceGroups() {
        const convergentNodes = [];

        for (const [id, node] of nodes) {
          if (node.converges) {
            convergentNodes.push(id);
          }
        }

        // Group convergent nodes that share dependencies
        // (simplified - could use SCC algorithm for complex cycles)
        const groups = [];
        const processed = new Set();

        for (const nodeId of convergentNodes) {
          if (processed.has(nodeId)) continue;

          const group = [nodeId];
          processed.add(nodeId);

          // Find related convergent nodes
          const related = this.getDownstream(nodeId)
            .filter(id => convergentNodes.includes(id) && !processed.has(id));

          for (const relId of related) {
            group.push(relId);
            processed.add(relId);
          }

          if (group.length > 0) {
            groups.push(group);
          }
        }

        return groups;
      },

      /**
       * Get statistics about the graph
       * @returns {Object}
       */
      getStats() {
        let totalEdges = 0;
        let maxDownstream = 0;
        let maxUpstream = 0;
        let convergentCount = 0;

        for (const deps of downstream.values()) {
          totalEdges += deps.size;
          maxDownstream = Math.max(maxDownstream, deps.size);
        }

        for (const deps of upstream.values()) {
          maxUpstream = Math.max(maxUpstream, deps.size);
        }

        for (const node of nodes.values()) {
          if (node.converges) convergentCount++;
        }

        return {
          nodeCount: nodes.size,
          inputCount: inputs.size,
          edgeCount: totalEdges,
          maxDownstream,
          maxUpstream,
          convergentNodes: convergentCount,
          avgDependencies: totalEdges / Math.max(1, nodes.size)
        };
      },

      // ========== Serialization ==========

      /**
       * Export graph for visualization (compatible with existing Dependency.js)
       * @returns {{nodes: Array, links: Array}}
       */
      exportForVisualization() {
        const vizNodes = [];
        const vizLinks = [];

        // Add computation nodes
        for (const [id, node] of nodes) {
          vizNodes.push({
            id,
            legacyId: node.legacyId,
            type: 'computed',
            section: node.section,
            classification: node.classification,
            converges: node.converges || false
          });
        }

        // Add input nodes
        for (const [id, input] of inputs) {
          vizNodes.push({
            id,
            legacyId: input.legacyId,
            type: 'input',
            section: input.section,
            classification: input.classification
          });
        }

        // Add links
        for (const [sourceId, targets] of downstream) {
          for (const targetId of targets) {
            vizLinks.push({
              source: sourceId,
              target: targetId
            });
          }
        }

        return { nodes: vizNodes, links: vizLinks };
      },

      // ========== Debugging ==========

      /**
       * Print graph structure to console
       */
      debug() {
        console.group('ComputationGraph Debug');
        console.log('Stats:', this.getStats());
        console.log('Nodes:', [...nodes.keys()]);
        console.log('Inputs:', [...inputs.keys()]);
        console.log('Convergence groups:', this.findConvergenceGroups());
        console.groupEnd();
      }
    };
  }

  // Export
  window.TEUI = window.TEUI || {};
  window.TEUI.createComputationGraph = createComputationGraph;
})();
```

**Verification:**
- [ ] `TEUI.createComputationGraph()` returns a valid graph object
- [ ] Can register nodes and query downstream/upstream
- [ ] Topological sort returns correct order
- [ ] `exportForVisualization()` produces valid D3 format

---

### Task 1.3: Build IncrementalEngine Module ✅

**Objective:** Create the core incremental computation engine.

**Completed:** `src/core/computation/IncrementalEngine.js`

**Dependencies:** Task 1.2 (ComputationGraph)

**Inputs:**
- ComputationGraph from 1.2
- Type definitions from 1.1

**Outputs:**
- `src/core/computation/IncrementalEngine.js`

**Implementation:**

```javascript
// src/core/computation/IncrementalEngine.js

/**
 * IncrementalEngine - Performs incremental computation on the graph
 *
 * Key principle: Only recompute nodes affected by a change
 */
(function() {
  'use strict';

  /**
   * Create an incremental computation engine
   * @param {ComputationGraph} graph - The computation graph
   * @returns {IncrementalEngine}
   */
  function createIncrementalEngine(graph) {
    // Internal state
    let currentState = new Map();
    let computeCount = 0;
    let lastComputeTime = 0;

    return {
      // ========== State Access ==========

      /**
       * Get current value of a node
       * @param {FieldPath} nodeId
       * @returns {*}
       */
      getValue(nodeId) {
        return currentState.get(nodeId);
      },

      /**
       * Get all current values
       * @returns {ComputationState}
       */
      getState() {
        return new Map(currentState);
      },

      /**
       * Set state (for initialization or import)
       * @param {ComputationState} state
       */
      setState(state) {
        currentState = new Map(state);
      },

      // ========== Core Computation ==========

      /**
       * Recompute affected nodes when a value changes
       * @param {FieldPath} changedNodeId - The node that changed
       * @param {*} newValue - The new value
       * @returns {RecomputeResult}
       */
      recompute(changedNodeId, newValue) {
        const startTime = performance.now();
        computeCount = 0;

        // 1. Update the changed value
        currentState.set(changedNodeId, newValue);

        // 2. Find all affected downstream nodes
        const affected = graph.getDownstream(changedNodeId);

        if (affected.length === 0) {
          // No downstream dependencies - nothing to recompute
          return {
            state: currentState,
            computed: [],
            iterations: 0
          };
        }

        // 3. Sort affected nodes in dependency order
        const computeOrder = graph.topologicalSort(affected);

        // 4. Check for convergence groups
        const convergenceGroups = graph.findConvergenceGroups()
          .filter(group => group.some(id => affected.includes(id)));

        // 5. Compute non-convergent nodes first
        const convergentIds = new Set(convergenceGroups.flat());
        const nonConvergent = computeOrder.filter(id => !convergentIds.has(id));

        for (const nodeId of nonConvergent) {
          this._computeNode(nodeId);
        }

        // 6. Handle convergent groups with iteration
        let totalIterations = 0;
        for (const group of convergenceGroups) {
          const iterations = this._computeConvergentGroup(group);
          totalIterations = Math.max(totalIterations, iterations);
        }

        lastComputeTime = performance.now() - startTime;

        return {
          state: currentState,
          computed: computeOrder,
          iterations: totalIterations
        };
      },

      /**
       * Recompute multiple changed values at once
       * @param {Object<FieldPath, *>} changes - Map of nodeId → newValue
       * @returns {RecomputeResult}
       */
      recomputeBatch(changes) {
        const startTime = performance.now();
        computeCount = 0;

        // 1. Apply all changes
        const changedIds = [];
        for (const [nodeId, value] of Object.entries(changes)) {
          currentState.set(nodeId, value);
          changedIds.push(nodeId);
        }

        // 2. Find union of all affected nodes
        const affectedSet = new Set();
        for (const nodeId of changedIds) {
          for (const affected of graph.getDownstream(nodeId)) {
            affectedSet.add(affected);
          }
        }

        const affected = Array.from(affectedSet);

        if (affected.length === 0) {
          return {
            state: currentState,
            computed: [],
            iterations: 0
          };
        }

        // 3. Sort and compute
        const computeOrder = graph.topologicalSort(affected);

        for (const nodeId of computeOrder) {
          this._computeNode(nodeId);
        }

        lastComputeTime = performance.now() - startTime;

        return {
          state: currentState,
          computed: computeOrder,
          iterations: 0
        };
      },

      /**
       * Compute a single node
       * @private
       * @param {FieldPath} nodeId
       */
      _computeNode(nodeId) {
        const node = graph.getNode(nodeId);
        if (!node) {
          console.warn(`IncrementalEngine: No node found for ${nodeId}`);
          return;
        }

        // Gather inputs
        const inputs = {};
        for (const dep of node.dependencies) {
          inputs[dep] = currentState.get(dep);
        }

        // Compute
        try {
          const result = node.compute(inputs);
          currentState.set(nodeId, result);
          computeCount++;
        } catch (error) {
          console.error(`IncrementalEngine: Error computing ${nodeId}:`, error);
        }
      },

      /**
       * Compute a convergent group with iteration
       * @private
       * @param {FieldPath[]} group
       * @returns {number} - Iterations taken
       */
      _computeConvergentGroup(group) {
        const maxIterations = 10;
        const tolerance = 0.001;

        let iterations = 0;
        let converged = false;

        while (!converged && iterations < maxIterations) {
          const prevValues = new Map();

          // Store previous values
          for (const nodeId of group) {
            prevValues.set(nodeId, currentState.get(nodeId));
          }

          // Compute all nodes in group
          for (const nodeId of group) {
            this._computeNode(nodeId);
          }

          // Check convergence
          converged = true;
          for (const nodeId of group) {
            const prev = prevValues.get(nodeId);
            const curr = currentState.get(nodeId);

            if (typeof prev === 'number' && typeof curr === 'number') {
              if (Math.abs(prev - curr) > tolerance) {
                converged = false;
                break;
              }
            } else if (prev !== curr) {
              converged = false;
              break;
            }
          }

          iterations++;
        }

        if (!converged) {
          console.warn(`IncrementalEngine: Convergence group did not converge after ${maxIterations} iterations`);
        }

        return iterations;
      },

      // ========== Full Computation ==========

      /**
       * Compute all nodes from scratch (for initialization)
       * @returns {RecomputeResult}
       */
      computeAll() {
        const startTime = performance.now();
        computeCount = 0;

        const computeOrder = graph.getFullComputationOrder();

        for (const nodeId of computeOrder) {
          this._computeNode(nodeId);
        }

        lastComputeTime = performance.now() - startTime;

        return {
          state: currentState,
          computed: computeOrder,
          iterations: 0
        };
      },

      // ========== Diagnostics ==========

      /**
       * Get computation statistics
       * @returns {Object}
       */
      getStats() {
        return {
          lastComputeCount: computeCount,
          lastComputeTimeMs: lastComputeTime.toFixed(2),
          totalNodes: graph.getAllNodeIds().length,
          stateSize: currentState.size
        };
      },

      /**
       * Validate that all dependencies are satisfied
       * @returns {string[]} - List of validation errors
       */
      validate() {
        const errors = [];

        for (const nodeId of graph.getAllNodeIds()) {
          const node = graph.getNode(nodeId);

          for (const dep of node.dependencies) {
            if (!currentState.has(dep) && !graph.hasNode(dep)) {
              errors.push(`Node ${nodeId} depends on unknown node ${dep}`);
            }
          }
        }

        return errors;
      },

      /**
       * Debug: Print computation trace
       * @param {FieldPath} nodeId - Node to trace
       */
      debugTrace(nodeId) {
        console.group(`Computation trace for ${nodeId}`);

        const upstream = graph.getUpstream(nodeId);
        console.log('Upstream dependencies:', upstream);

        const downstream = graph.getDownstream(nodeId);
        console.log('Downstream dependents:', downstream);

        const node = graph.getNode(nodeId);
        if (node) {
          console.log('Direct dependencies:', node.dependencies);
          console.log('Current value:', currentState.get(nodeId));

          const inputs = {};
          for (const dep of node.dependencies) {
            inputs[dep] = currentState.get(dep);
          }
          console.log('Current inputs:', inputs);
        }

        console.groupEnd();
      }
    };
  }

  // Export
  window.TEUI = window.TEUI || {};
  window.TEUI.createIncrementalEngine = createIncrementalEngine;
})();
```

**Verification:**
- [ ] Engine computes nodes in correct order
- [ ] Changing one value only recomputes downstream
- [ ] Convergent groups iterate until stable
- [ ] `getStats()` shows correct compute counts
- [ ] Batch changes work correctly

---

### Task 1.4: Create Field Registry (Legacy ID Mapping) ✅

**Objective:** Map legacy cell references (d_135) to semantic paths.

**Completed:** `src/core/computation/FieldRegistry.js`

**Dependencies:** Task 1.1 (types)

**Inputs:**
- Current field IDs from StateManager
- Field classifications from ReferenceToggle.js

**Outputs:**
- `src/core/computation/FieldRegistry.js`

**Implementation:**

```javascript
// src/core/computation/FieldRegistry.js

/**
 * FieldRegistry - Maps legacy cell references to semantic paths
 *
 * This enables gradual migration from d_135 style IDs to
 * semantic paths like 'envelope.roof.rsiValue'
 */
(function() {
  'use strict';

  // Bidirectional mapping
  const legacyToSemantic = new Map();
  const semanticToLegacy = new Map();

  // Field metadata
  const fieldMetadata = new Map();

  /**
   * Field definition for registration
   * @typedef {Object} FieldDefinition
   * @property {string} legacyId - Original cell reference (d_135)
   * @property {string} semanticPath - New semantic path
   * @property {FieldClassification} classification - G, C, or A
   * @property {string} section - Section ID (S03, S13, etc.)
   * @property {string} label - Human-readable label
   * @property {string} [unit] - Unit of measurement
   * @property {*} [defaultValue] - Default value
   */

  const FieldRegistry = {
    /**
     * Register a field mapping
     * @param {FieldDefinition} field
     */
    register(field) {
      legacyToSemantic.set(field.legacyId, field.semanticPath);
      semanticToLegacy.set(field.semanticPath, field.legacyId);
      fieldMetadata.set(field.semanticPath, field);

      // Also register ref_ variant for C-fields
      if (field.classification === 'C') {
        const refLegacy = `ref_${field.legacyId}`;
        legacyToSemantic.set(refLegacy, field.semanticPath);
      }
    },

    /**
     * Register multiple fields
     * @param {FieldDefinition[]} fields
     */
    registerAll(fields) {
      for (const field of fields) {
        this.register(field);
      }
    },

    /**
     * Get semantic path from legacy ID
     * @param {string} legacyId
     * @returns {string | undefined}
     */
    toSemantic(legacyId) {
      return legacyToSemantic.get(legacyId);
    },

    /**
     * Get legacy ID from semantic path
     * @param {string} semanticPath
     * @returns {string | undefined}
     */
    toLegacy(semanticPath) {
      return semanticToLegacy.get(semanticPath);
    },

    /**
     * Get field metadata
     * @param {string} pathOrId - Either format
     * @returns {FieldDefinition | undefined}
     */
    getMetadata(pathOrId) {
      // Try as semantic path first
      if (fieldMetadata.has(pathOrId)) {
        return fieldMetadata.get(pathOrId);
      }
      // Try converting from legacy
      const semantic = legacyToSemantic.get(pathOrId);
      if (semantic) {
        return fieldMetadata.get(semantic);
      }
      return undefined;
    },

    /**
     * Get field classification
     * @param {string} pathOrId
     * @returns {FieldClassification | undefined}
     */
    getClassification(pathOrId) {
      const meta = this.getMetadata(pathOrId);
      return meta?.classification;
    },

    /**
     * Check if field is shared (G-classification)
     * @param {string} pathOrId
     * @returns {boolean}
     */
    isShared(pathOrId) {
      return this.getClassification(pathOrId) === 'G';
    },

    /**
     * Get all fields for a section
     * @param {string} sectionId
     * @returns {FieldDefinition[]}
     */
    getFieldsBySection(sectionId) {
      return Array.from(fieldMetadata.values())
        .filter(f => f.section === sectionId);
    },

    /**
     * Get all G-fields (shared geometry)
     * @returns {FieldDefinition[]}
     */
    getSharedFields() {
      return Array.from(fieldMetadata.values())
        .filter(f => f.classification === 'G');
    },

    /**
     * Get all C-fields (code/performance)
     * @returns {FieldDefinition[]}
     */
    getModelSpecificFields() {
      return Array.from(fieldMetadata.values())
        .filter(f => f.classification === 'C');
    },

    /**
     * Export all mappings (for debugging)
     * @returns {Object}
     */
    exportMappings() {
      return {
        legacyToSemantic: Object.fromEntries(legacyToSemantic),
        semanticToLegacy: Object.fromEntries(semanticToLegacy),
        fieldCount: fieldMetadata.size
      };
    },

    /**
     * Check if a legacy ID is registered
     * @param {string} legacyId
     * @returns {boolean}
     */
    hasLegacy(legacyId) {
      return legacyToSemantic.has(legacyId);
    },

    /**
     * Check if a semantic path is registered
     * @param {string} semanticPath
     * @returns {boolean}
     */
    hasSemantic(semanticPath) {
      return semanticToLegacy.has(semanticPath);
    }
  };

  // ========== Initial Field Definitions ==========
  // These will be populated incrementally during migration

  const INITIAL_FIELDS = [
    // Section 02: Building Information
    {
      legacyId: 'd_12',
      semanticPath: 'metadata.buildingType',
      classification: 'A',
      section: 'S02',
      label: 'Building Type'
    },
    {
      legacyId: 'h_15',
      semanticPath: 'geometry.conditionedFloorArea',
      classification: 'G',
      section: 'S02',
      label: 'Conditioned Floor Area',
      unit: 'm²',
      defaultValue: 5000
    },
    {
      legacyId: 'd_16',
      semanticPath: 'geometry.numStoreys',
      classification: 'G',
      section: 'S02',
      label: 'Number of Storeys',
      defaultValue: 1
    },
    {
      legacyId: 'h_17',
      semanticPath: 'geometry.ceilingHeight',
      classification: 'G',
      section: 'S02',
      label: 'Average Ceiling Height',
      unit: 'm',
      defaultValue: 3.0
    },
    {
      legacyId: 'd_105',
      semanticPath: 'geometry.totalVolume',
      classification: 'G',
      section: 'S02',
      label: 'Total Building Volume',
      unit: 'm³'
    },

    // Section 03: Climate
    {
      legacyId: 'd_19',
      semanticPath: 'climate.location.province',
      classification: 'G',
      section: 'S03',
      label: 'Province'
    },
    {
      legacyId: 'h_19',
      semanticPath: 'climate.location.city',
      classification: 'G',
      section: 'S03',
      label: 'City'
    },
    {
      legacyId: 'd_21',
      semanticPath: 'climate.heating.degreedays',
      classification: 'G',
      section: 'S03',
      label: 'Heating Degree Days',
      unit: 'HDD'
    },
    {
      legacyId: 'h_23',
      semanticPath: 'climate.heating.setpoint',
      classification: 'C',
      section: 'S03',
      label: 'Heating Setpoint',
      unit: '°C',
      defaultValue: 21
    },
    {
      legacyId: 'i_21',
      semanticPath: 'climate.cooling.degreedays',
      classification: 'G',
      section: 'S03',
      label: 'Cooling Degree Days',
      unit: 'CDD'
    },
    {
      legacyId: 'h_24',
      semanticPath: 'climate.cooling.setpoint',
      classification: 'C',
      section: 'S03',
      label: 'Cooling Setpoint',
      unit: '°C',
      defaultValue: 24
    },

    // Section 11: Envelope
    {
      legacyId: 'd_85',
      semanticPath: 'envelope.roof.rsiValue',
      classification: 'C',
      section: 'S11',
      label: 'Roof RSI',
      unit: 'm²·K/W',
      defaultValue: 5.0
    },
    {
      legacyId: 'd_87',
      semanticPath: 'envelope.walls.rsiValue',
      classification: 'C',
      section: 'S11',
      label: 'Wall RSI',
      unit: 'm²·K/W',
      defaultValue: 4.0
    },
    {
      legacyId: 'd_88',
      semanticPath: 'envelope.windows.uFactor',
      classification: 'C',
      section: 'S11',
      label: 'Window U-Factor',
      unit: 'W/m²·K',
      defaultValue: 1.4
    },
    {
      legacyId: 'd_89',
      semanticPath: 'envelope.windows.shgc',
      classification: 'C',
      section: 'S11',
      label: 'Window SHGC',
      defaultValue: 0.25
    },
    {
      legacyId: 'd_90',
      semanticPath: 'envelope.foundation.rsiValue',
      classification: 'C',
      section: 'S11',
      label: 'Foundation RSI',
      unit: 'm²·K/W',
      defaultValue: 2.0
    },

    // Section 07: Water Heating
    {
      legacyId: 'd_52',
      semanticPath: 'mechanical.dhw.efficiency',
      classification: 'C',
      section: 'S07',
      label: 'DHW Efficiency',
      unit: '%',
      defaultValue: 90
    },
    {
      legacyId: 'd_53',
      semanticPath: 'mechanical.dhw.dwhrEfficiency',
      classification: 'C',
      section: 'S07',
      label: 'DWHR Efficiency',
      unit: '%',
      defaultValue: 42
    },

    // Section 13: Mechanical Systems
    {
      legacyId: 'd_113',
      semanticPath: 'mechanical.heating.type',
      classification: 'C',
      section: 'S13',
      label: 'Heating System Type'
    },
    {
      legacyId: 'f_113',
      semanticPath: 'mechanical.heating.efficiency',
      classification: 'C',
      section: 'S13',
      label: 'Heating Efficiency (HSPF/AFUE)',
      defaultValue: 7.1
    },
    {
      legacyId: 'j_115',
      semanticPath: 'mechanical.heating.afue',
      classification: 'C',
      section: 'S13',
      label: 'AFUE',
      unit: '%',
      defaultValue: 0.90
    },
    {
      legacyId: 'j_116',
      semanticPath: 'mechanical.cooling.cop',
      classification: 'C',
      section: 'S13',
      label: 'Cooling COP',
      defaultValue: 3.3
    },
    {
      legacyId: 'd_118',
      semanticPath: 'mechanical.ventilation.heatRecoveryEfficiency',
      classification: 'C',
      section: 'S13',
      label: 'ERV/HRV Efficiency',
      unit: '%',
      defaultValue: 55
    },

    // Section 04: Energy Results
    {
      legacyId: 'f_32',
      semanticPath: 'intensities.teui',
      classification: 'C',
      section: 'S04',
      label: 'TEUI',
      unit: 'kWh/m²'
    },
    {
      legacyId: 'j_32',
      semanticPath: 'intensities.teuiTarget',
      classification: 'C',
      section: 'S04',
      label: 'TEUI Target',
      unit: 'kWh/m²'
    }
  ];

  // Register initial fields
  FieldRegistry.registerAll(INITIAL_FIELDS);

  // Export
  window.TEUI = window.TEUI || {};
  window.TEUI.FieldRegistry = FieldRegistry;
})();
```

**Verification:**
- [ ] Can lookup `d_85` → `envelope.roof.rsiValue`
- [ ] Can lookup `envelope.roof.rsiValue` → `d_85`
- [ ] Classification queries work correctly
- [ ] Section queries return expected fields

---

### Task 1.5: Unit Tests for Computation Infrastructure ✅

**Objective:** Create test suite for the new computation modules.

**Completed:**
- `test/computation/computation.test.js`
- `test/computation/test.html` (browser test runner)

**Dependencies:** Tasks 1.1-1.4

**Inputs:**
- All computation modules

**Outputs:**
- `test/computation/computation.test.js`

**Implementation:**

```javascript
// test/computation/computation.test.js
// Run with: node test/computation/computation.test.js

/**
 * Simple test framework (no dependencies)
 */
const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

function assertDeepEqual(actual, expected, message = '') {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
  }
}

function assertTrue(condition, message = '') {
  if (!condition) {
    throw new Error(message || 'Expected true');
  }
}

async function runTests() {
  console.log('\n=== Computation Infrastructure Tests ===\n');

  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (error) {
      console.log(`✗ ${name}`);
      console.log(`  ${error.message}\n`);
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);
}

// ========== ComputationGraph Tests ==========

test('ComputationGraph: creates empty graph', () => {
  const graph = TEUI.createComputationGraph();
  assertEqual(graph.getAllNodeIds().length, 0);
});

test('ComputationGraph: registers nodes', () => {
  const graph = TEUI.createComputationGraph();

  graph.registerNode({
    id: 'a',
    dependencies: [],
    compute: () => 1
  });

  assertEqual(graph.getAllNodeIds().length, 1);
  assertTrue(graph.hasNode('a'));
});

test('ComputationGraph: tracks dependencies', () => {
  const graph = TEUI.createComputationGraph();

  graph.registerNode({
    id: 'a',
    dependencies: [],
    compute: () => 1
  });

  graph.registerNode({
    id: 'b',
    dependencies: ['a'],
    compute: (inputs) => inputs.a * 2
  });

  assertDeepEqual(graph.getImmediateDownstream('a'), ['b']);
  assertDeepEqual(graph.getImmediateUpstream('b'), ['a']);
});

test('ComputationGraph: getDownstream finds all dependents', () => {
  const graph = TEUI.createComputationGraph();

  // a → b → c → d
  graph.registerNode({ id: 'a', dependencies: [], compute: () => 1 });
  graph.registerNode({ id: 'b', dependencies: ['a'], compute: () => 2 });
  graph.registerNode({ id: 'c', dependencies: ['b'], compute: () => 3 });
  graph.registerNode({ id: 'd', dependencies: ['c'], compute: () => 4 });

  const downstream = graph.getDownstream('a');
  assertEqual(downstream.length, 3);
  assertTrue(downstream.includes('b'));
  assertTrue(downstream.includes('c'));
  assertTrue(downstream.includes('d'));
});

test('ComputationGraph: topologicalSort orders correctly', () => {
  const graph = TEUI.createComputationGraph();

  graph.registerNode({ id: 'a', dependencies: [], compute: () => 1 });
  graph.registerNode({ id: 'b', dependencies: ['a'], compute: () => 2 });
  graph.registerNode({ id: 'c', dependencies: ['a', 'b'], compute: () => 3 });

  const order = graph.topologicalSort(['a', 'b', 'c']);

  // 'a' must come before 'b' and 'c'
  assertTrue(order.indexOf('a') < order.indexOf('b'));
  assertTrue(order.indexOf('a') < order.indexOf('c'));
  // 'b' must come before 'c'
  assertTrue(order.indexOf('b') < order.indexOf('c'));
});

// ========== IncrementalEngine Tests ==========

test('IncrementalEngine: computes simple chain', () => {
  const graph = TEUI.createComputationGraph();

  graph.registerInput({ id: 'input', defaultValue: 5 });
  graph.registerNode({
    id: 'doubled',
    dependencies: ['input'],
    compute: (inputs) => inputs.input * 2
  });
  graph.registerNode({
    id: 'plusTen',
    dependencies: ['doubled'],
    compute: (inputs) => inputs.doubled + 10
  });

  const engine = TEUI.createIncrementalEngine(graph);

  // Set initial value
  engine.recompute('input', 5);

  assertEqual(engine.getValue('input'), 5);
  assertEqual(engine.getValue('doubled'), 10);
  assertEqual(engine.getValue('plusTen'), 20);
});

test('IncrementalEngine: incremental update only affects downstream', () => {
  const graph = TEUI.createComputationGraph();

  // Two independent branches
  graph.registerInput({ id: 'a', defaultValue: 1 });
  graph.registerInput({ id: 'b', defaultValue: 2 });
  graph.registerNode({
    id: 'a2',
    dependencies: ['a'],
    compute: (inputs) => inputs.a * 2
  });
  graph.registerNode({
    id: 'b2',
    dependencies: ['b'],
    compute: (inputs) => inputs.b * 2
  });

  const engine = TEUI.createIncrementalEngine(graph);

  // Initialize
  engine.recompute('a', 1);
  engine.recompute('b', 2);

  // Change 'a' - should only recompute 'a2'
  const result = engine.recompute('a', 10);

  assertEqual(result.computed.length, 1);
  assertEqual(result.computed[0], 'a2');
  assertEqual(engine.getValue('a2'), 20);
  assertEqual(engine.getValue('b2'), 4); // Unchanged
});

test('IncrementalEngine: batch update', () => {
  const graph = TEUI.createComputationGraph();

  graph.registerInput({ id: 'x', defaultValue: 0 });
  graph.registerInput({ id: 'y', defaultValue: 0 });
  graph.registerNode({
    id: 'sum',
    dependencies: ['x', 'y'],
    compute: (inputs) => inputs.x + inputs.y
  });

  const engine = TEUI.createIncrementalEngine(graph);

  const result = engine.recomputeBatch({ x: 5, y: 3 });

  assertEqual(engine.getValue('sum'), 8);
});

// ========== FieldRegistry Tests ==========

test('FieldRegistry: legacy to semantic lookup', () => {
  assertEqual(
    TEUI.FieldRegistry.toSemantic('d_85'),
    'envelope.roof.rsiValue'
  );
});

test('FieldRegistry: semantic to legacy lookup', () => {
  assertEqual(
    TEUI.FieldRegistry.toLegacy('envelope.roof.rsiValue'),
    'd_85'
  );
});

test('FieldRegistry: classification lookup', () => {
  assertEqual(TEUI.FieldRegistry.getClassification('h_15'), 'G');
  assertEqual(TEUI.FieldRegistry.getClassification('d_85'), 'C');
});

test('FieldRegistry: isShared identifies G-fields', () => {
  assertTrue(TEUI.FieldRegistry.isShared('h_15'));
  assertTrue(!TEUI.FieldRegistry.isShared('d_85'));
});

// ========== Integration Test ==========

test('Integration: real calculation chain', () => {
  const graph = TEUI.createComputationGraph();

  // Simulate envelope → UA → heating load chain
  graph.registerInput({
    id: 'envelope.roof.area',
    defaultValue: 500
  });
  graph.registerInput({
    id: 'envelope.roof.rsiValue',
    defaultValue: 5.0
  });
  graph.registerInput({
    id: 'climate.heating.degreedays',
    defaultValue: 3652
  });

  graph.registerNode({
    id: 'envelope.roof.uFactor',
    dependencies: ['envelope.roof.rsiValue'],
    compute: (inputs) => 1 / inputs['envelope.roof.rsiValue']
  });

  graph.registerNode({
    id: 'envelope.roof.ua',
    dependencies: ['envelope.roof.area', 'envelope.roof.uFactor'],
    compute: (inputs) =>
      inputs['envelope.roof.area'] * inputs['envelope.roof.uFactor']
  });

  graph.registerNode({
    id: 'energy.heating.load',
    dependencies: ['envelope.roof.ua', 'climate.heating.degreedays'],
    compute: (inputs) =>
      inputs['envelope.roof.ua'] * inputs['climate.heating.degreedays'] * 24 / 1000
  });

  const engine = TEUI.createIncrementalEngine(graph);

  // Set initial values
  engine.recomputeBatch({
    'envelope.roof.area': 500,
    'envelope.roof.rsiValue': 5.0,
    'climate.heating.degreedays': 3652
  });

  // Verify chain computation
  assertEqual(engine.getValue('envelope.roof.uFactor'), 0.2);
  assertEqual(engine.getValue('envelope.roof.ua'), 100);

  // Now change RSI - should only recompute downstream
  const result = engine.recompute('envelope.roof.rsiValue', 10.0);

  assertEqual(result.computed.length, 3); // uFactor, ua, load
  assertEqual(engine.getValue('envelope.roof.uFactor'), 0.1);
  assertEqual(engine.getValue('envelope.roof.ua'), 50);
});

// Run if in Node.js (for CLI testing)
if (typeof window === 'undefined') {
  // Mock TEUI namespace for Node testing
  global.TEUI = {};
  require('../../../src/core/computation/types.js');
  require('../../../src/core/computation/ComputationGraph.js');
  require('../../../src/core/computation/IncrementalEngine.js');
  require('../../../src/core/computation/FieldRegistry.js');
  runTests();
} else {
  // Browser - run when ready
  window.runComputationTests = runTests;
}
```

**Verification:**
- [ ] All tests pass
- [ ] Test output shows which tests failed (if any)
- [ ] Integration test simulates real calculation chain

---

## Phase 2: Section Migration to Computation Nodes ✅

**Status:** COMPLETE (December 2025)
**Goal:** Express existing section calculations as computation nodes while keeping current code working.

---

### Task 2.1: Analyze Section03 (Climate) Calculations ✅

**Objective:** Document all calculations in Section03 for migration.

**Dependencies:** Phase 1 complete

**Inputs:**
- `src/sections/Section03.js`
- Current dependency graph for S03

**Outputs:**
- `docs/migration/S03-analysis.md` - Detailed calculation documentation

**Process:**
1. List all input fields (user-editable)
2. List all computed fields with their formulas
3. Identify dependencies between fields
4. Note any convergence/iteration requirements
5. Map legacy IDs to semantic paths

---

### Task 2.2: Create Climate Computation Nodes ✅

**Objective:** Implement S03 calculations as computation nodes.

**Dependencies:** Task 2.1

**Outputs:**
- `src/sections/nodes/ClimateNodes.js`

**Implementation Pattern:**

```javascript
// src/sections/nodes/ClimateNodes.js

(function() {
  'use strict';

  /**
   * Climate section computation nodes
   * Covers: Province, City, HDD, CDD, setpoints, climate zone
   */
  const ClimateNodes = {
    sectionId: 'S03',
    sectionName: 'Climate',

    /**
     * Get all input nodes for this section
     * @returns {InputNode[]}
     */
    getInputNodes() {
      return [
        {
          id: 'climate.location.province',
          legacyId: 'd_19',
          defaultValue: 'ON',
          classification: 'G',
          section: 'S03',
          validate: (v) => typeof v === 'string' && v.length === 2
        },
        {
          id: 'climate.location.city',
          legacyId: 'h_19',
          defaultValue: 'Toronto',
          classification: 'G',
          section: 'S03'
        },
        {
          id: 'climate.heating.setpoint',
          legacyId: 'h_23',
          defaultValue: 21,
          classification: 'C',
          section: 'S03',
          validate: (v) => v >= 15 && v <= 25
        },
        {
          id: 'climate.cooling.setpoint',
          legacyId: 'h_24',
          defaultValue: 24,
          classification: 'C',
          section: 'S03',
          validate: (v) => v >= 20 && v <= 30
        }
      ];
    },

    /**
     * Get all computation nodes for this section
     * @returns {ComputationNode[]}
     */
    getComputationNodes() {
      return [
        // HDD from climate database
        {
          id: 'climate.heating.degreedays',
          legacyId: 'd_21',
          classification: 'G',
          section: 'S03',
          dependencies: [
            'climate.location.province',
            'climate.location.city',
            'climate.heating.setpoint'
          ],
          compute: (inputs) => {
            const climateData = TEUI.ClimateValues?.[inputs['climate.location.province']]
              ?.[inputs['climate.location.city']];

            if (!climateData) return 0;

            // Base HDD adjusted for setpoint (simplified)
            const baseHDD = climateData.HDD || 0;
            const setpointAdj = (inputs['climate.heating.setpoint'] - 18) * 30;
            return Math.max(0, baseHDD + setpointAdj);
          }
        },

        // CDD from climate database
        {
          id: 'climate.cooling.degreedays',
          legacyId: 'i_21',
          classification: 'G',
          section: 'S03',
          dependencies: [
            'climate.location.province',
            'climate.location.city',
            'climate.cooling.setpoint'
          ],
          compute: (inputs) => {
            const climateData = TEUI.ClimateValues?.[inputs['climate.location.province']]
              ?.[inputs['climate.location.city']];

            if (!climateData) return 0;

            const baseCDD = climateData.CDD || 0;
            const setpointAdj = (24 - inputs['climate.cooling.setpoint']) * 15;
            return Math.max(0, baseCDD + setpointAdj);
          }
        },

        // Climate zone determination
        {
          id: 'climate.climateZone',
          legacyId: 'd_20',
          classification: 'G',
          section: 'S03',
          dependencies: ['climate.heating.degreedays'],
          compute: (inputs) => {
            const hdd = inputs['climate.heating.degreedays'];
            if (hdd < 3000) return 4;
            if (hdd < 4000) return 5;
            if (hdd < 5000) return 6;
            if (hdd < 6000) return 7;
            return 8;
          }
        },

        // Ground temperature
        {
          id: 'climate.groundTemperature',
          legacyId: 'j_21',
          classification: 'G',
          section: 'S03',
          dependencies: [
            'climate.location.province',
            'climate.location.city'
          ],
          compute: (inputs) => {
            const climateData = TEUI.ClimateValues?.[inputs['climate.location.province']]
              ?.[inputs['climate.location.city']];
            return climateData?.groundTemp || 10;
          }
        }
      ];
    },

    /**
     * Register all nodes with a computation graph
     * @param {ComputationGraph} graph
     */
    register(graph) {
      for (const input of this.getInputNodes()) {
        graph.registerInput(input);
      }
      for (const node of this.getComputationNodes()) {
        graph.registerNode(node);
      }
    }
  };

  // Export
  window.TEUI = window.TEUI || {};
  window.TEUI.ClimateNodes = ClimateNodes;
})();
```

---

### Task 2.3: Create Envelope Computation Nodes ✅

**Objective:** Implement S10/S11 envelope calculations as nodes.

**Dependencies:** Task 2.1 pattern

**Outputs:**
- `src/sections/nodes/EnvelopeNodes.js`

---

### Task 2.4: Create Mechanical Computation Nodes ✅

**Objective:** Implement S13 mechanical calculations as nodes.

**Dependencies:** Tasks 2.2, 2.3 (mechanical depends on climate and envelope)

**Outputs:**
- `src/sections/nodes/MechanicalNodes.js`

**Special Considerations:**
- S13 has convergence requirements (free cooling)
- Mark convergent nodes appropriately
- Handle HSPF/AFUE/COP variations

---

### Task 2.5: Create Energy Results Computation Nodes ✅

**Objective:** Implement S04/S14/S15 summary calculations.

**Outputs:**
- `src/sections/nodes/EnergyNodes.js`

---

### Task 2.6: Verification Tests for Section Nodes ✅

**Objective:** Verify new nodes match existing calculations.

**Process:**
1. Load current page with existing calculations
2. Capture all computed values
3. Run same inputs through new computation nodes
4. Compare results (within tolerance)

**Outputs:**
- `test/migration/section-comparison.test.js`

---

## Phase 3: Multi-Model State Management ✅

**Status:** COMPLETE (December 2025)
**Goal:** Support multiple models with shared/separate state.

---

### Task 3.1: Create ModelMetadata Module ✅

**Objective:** Manage model identity and relationships.

**Dependencies:** Phase 1 complete

**Outputs:**
- `src/core/model/ModelMetadata.js`

**Implementation:**

```javascript
// src/core/model/ModelMetadata.js

(function() {
  'use strict';

  let nextId = 1;

  /**
   * Create model metadata
   * @param {Object} config
   * @returns {ModelMetadata}
   */
  function createModelMetadata(config) {
    return Object.freeze({
      id: `model-${nextId++}`,
      label: config.label || 'Unnamed Model',
      modelType: config.modelType || 'target',
      parentId: config.parentId || null,
      createdAt: Date.now(),
      standard: config.standard || null // For reference models: 'OBC SB12', etc.
    });
  }

  /**
   * Create a variant from an existing model
   * @param {ModelMetadata} parent
   * @param {string} label
   * @returns {ModelMetadata}
   */
  function createVariant(parent, label) {
    return createModelMetadata({
      label,
      modelType: 'variant',
      parentId: parent.id
    });
  }

  /**
   * Create a reference model
   * @param {string} standard - e.g., 'OBC SB12 3.1.1.2.C4'
   * @returns {ModelMetadata}
   */
  function createReferenceModel(standard) {
    return createModelMetadata({
      label: standard,
      modelType: 'reference',
      standard
    });
  }

  // Export
  window.TEUI = window.TEUI || {};
  window.TEUI.ModelMetadata = {
    create: createModelMetadata,
    createVariant,
    createReferenceModel
  };
})();
```

---

### Task 3.2: Create MultiModelState Module ✅

**Objective:** Manage state for multiple models with G/C field separation.

**Dependencies:** Task 3.1, Phase 1

**Outputs:**
- `src/core/model/MultiModelState.js`

**Implementation:**

```javascript
// src/core/model/MultiModelState.js

(function() {
  'use strict';

  /**
   * Create multi-model state manager
   * @param {ComputationGraph} graph
   * @param {FieldRegistry} registry
   * @returns {MultiModelStateManager}
   */
  function createMultiModelState(graph, registry) {
    // Shared state (G-fields)
    let sharedState = new Map();

    // Per-model states (C-fields + computed)
    const modelStates = new Map();

    // Model metadata
    const models = new Map();

    // Active model for UI
    let activeModelId = null;

    return {
      // ========== Model Management ==========

      /**
       * Add a new model
       * @param {ModelMetadata} metadata
       * @param {ComputationState} [initialState] - Optional initial C-field values
       */
      addModel(metadata, initialState = new Map()) {
        models.set(metadata.id, metadata);
        modelStates.set(metadata.id, new Map(initialState));

        if (!activeModelId) {
          activeModelId = metadata.id;
        }
      },

      /**
       * Remove a model
       * @param {ModelId} modelId
       */
      removeModel(modelId) {
        models.delete(modelId);
        modelStates.delete(modelId);

        if (activeModelId === modelId) {
          activeModelId = models.keys().next().value || null;
        }
      },

      /**
       * Get model metadata
       * @param {ModelId} modelId
       * @returns {ModelMetadata}
       */
      getModel(modelId) {
        return models.get(modelId);
      },

      /**
       * Get all models
       * @returns {ModelMetadata[]}
       */
      getAllModels() {
        return Array.from(models.values());
      },

      /**
       * Set active model
       * @param {ModelId} modelId
       */
      setActiveModel(modelId) {
        if (!models.has(modelId)) {
          throw new Error(`Model ${modelId} not found`);
        }
        activeModelId = modelId;
      },

      /**
       * Get active model ID
       * @returns {ModelId}
       */
      getActiveModelId() {
        return activeModelId;
      },

      // ========== Value Access ==========

      /**
       * Get value for a field (from active model)
       * @param {FieldPath} fieldPath
       * @returns {*}
       */
      getValue(fieldPath) {
        return this.getValueForModel(activeModelId, fieldPath);
      },

      /**
       * Get value for a specific model
       * @param {ModelId} modelId
       * @param {FieldPath} fieldPath
       * @returns {*}
       */
      getValueForModel(modelId, fieldPath) {
        const classification = registry.getClassification(fieldPath);

        if (classification === 'G') {
          return sharedState.get(fieldPath);
        } else {
          const modelState = modelStates.get(modelId);
          return modelState?.get(fieldPath);
        }
      },

      /**
       * Get complete state for a model (merged shared + model-specific)
       * @param {ModelId} modelId
       * @returns {ComputationState}
       */
      getFullStateForModel(modelId) {
        const merged = new Map(sharedState);
        const modelState = modelStates.get(modelId);

        if (modelState) {
          for (const [key, value] of modelState) {
            merged.set(key, value);
          }
        }

        return merged;
      },

      // ========== Value Updates ==========

      /**
       * Set value for a field
       * @param {FieldPath} fieldPath
       * @param {*} value
       * @returns {FieldPath[]} - List of model IDs affected
       */
      setValue(fieldPath, value) {
        return this.setValueForModel(activeModelId, fieldPath, value);
      },

      /**
       * Set value for a specific model
       * @param {ModelId} modelId
       * @param {FieldPath} fieldPath
       * @param {*} value
       * @returns {ModelId[]} - List of model IDs affected
       */
      setValueForModel(modelId, fieldPath, value) {
        const classification = registry.getClassification(fieldPath);

        if (classification === 'G') {
          // G-field: Update shared state, affects ALL models
          sharedState.set(fieldPath, value);
          return Array.from(models.keys());
        } else {
          // C-field: Update only this model
          const modelState = modelStates.get(modelId);
          if (modelState) {
            modelState.set(fieldPath, value);
          }
          return [modelId];
        }
      },

      // ========== Batch Operations ==========

      /**
       * Set multiple values at once
       * @param {Object<FieldPath, *>} changes
       * @returns {Set<ModelId>} - Affected models
       */
      setValues(changes) {
        const affected = new Set();

        for (const [fieldPath, value] of Object.entries(changes)) {
          const modelIds = this.setValue(fieldPath, value);
          modelIds.forEach(id => affected.add(id));
        }

        return affected;
      },

      // ========== State Export/Import ==========

      /**
       * Export full state for persistence
       * @returns {Object}
       */
      exportState() {
        const modelsExport = {};
        for (const [id, state] of modelStates) {
          modelsExport[id] = Object.fromEntries(state);
        }

        return {
          shared: Object.fromEntries(sharedState),
          models: modelsExport,
          metadata: Object.fromEntries(
            Array.from(models).map(([id, meta]) => [id, meta])
          ),
          activeModelId
        };
      },

      /**
       * Import state from persistence
       * @param {Object} exported
       */
      importState(exported) {
        sharedState = new Map(Object.entries(exported.shared || {}));

        models.clear();
        modelStates.clear();

        for (const [id, meta] of Object.entries(exported.metadata || {})) {
          models.set(id, meta);
        }

        for (const [id, state] of Object.entries(exported.models || {})) {
          modelStates.set(id, new Map(Object.entries(state)));
        }

        activeModelId = exported.activeModelId || models.keys().next().value;
      },

      // ========== Debugging ==========

      debug() {
        console.group('MultiModelState Debug');
        console.log('Active Model:', activeModelId);
        console.log('Models:', Array.from(models.values()));
        console.log('Shared State:', Object.fromEntries(sharedState));
        console.log('Model States:', Object.fromEntries(
          Array.from(modelStates).map(([id, state]) => [id, Object.fromEntries(state)])
        ));
        console.groupEnd();
      }
    };
  }

  // Export
  window.TEUI = window.TEUI || {};
  window.TEUI.createMultiModelState = createMultiModelState;
})();
```

---

### Task 3.3: Create MultiModelEngine Module ✅

**Objective:** Coordinate incremental computation across multiple models.

**Dependencies:** Tasks 3.2, 1.3

**Outputs:**
- `src/core/model/MultiModelEngine.js`

---

### Task 3.4: Create Model Operations Module ✅

**Objective:** High-level operations: create variant, clone, compare.

**Dependencies:** Task 3.2

**Outputs:**
- `src/core/model/ModelOperations.js`

---

### Task 3.5: Model Comparison Module ✅

**Objective:** Compare metrics across multiple models.

**Dependencies:** Task 3.4

**Outputs:**
- `src/core/model/ModelComparison.js`

---

## Phase 4: UI Integration ✅

**Status:** COMPLETE (December 2025)
**Goal:** Connect new computation system to existing UI.

---

### Task 4.1: Create Legacy Adapter ✅

**Objective:** Allow existing code to work with new system.

**Dependencies:** Phase 3 complete

**Outputs:**
- `src/core/computation/LegacyAdapter.js`

**Implementation:**

```javascript
// src/core/computation/LegacyAdapter.js

/**
 * LegacyAdapter - Bridges old StateManager API to new MultiModelEngine
 *
 * Allows gradual migration by making new system accessible via old API
 */
(function() {
  'use strict';

  /**
   * Create legacy adapter
   * @param {MultiModelState} multiModelState
   * @param {MultiModelEngine} engine
   * @param {FieldRegistry} registry
   */
  function createLegacyAdapter(multiModelState, engine, registry) {
    return {
      /**
       * getValue - Compatible with StateManager.getValue()
       * @param {string} fieldId - Legacy field ID (d_85) or semantic path
       * @returns {*}
       */
      getValue(fieldId) {
        // Handle ref_ prefix
        const isRef = fieldId.startsWith('ref_');
        const baseId = isRef ? fieldId.slice(4) : fieldId;

        // Convert to semantic path if needed
        const semanticPath = registry.hasSemantic(baseId)
          ? baseId
          : registry.toSemantic(baseId);

        if (!semanticPath) {
          console.warn(`LegacyAdapter: Unknown field ${fieldId}`);
          return undefined;
        }

        // For ref_ fields, get from reference model
        if (isRef) {
          const refModels = multiModelState.getAllModels()
            .filter(m => m.modelType === 'reference');
          if (refModels.length > 0) {
            return multiModelState.getValueForModel(refModels[0].id, semanticPath);
          }
        }

        return multiModelState.getValue(semanticPath);
      },

      /**
       * setValue - Compatible with StateManager.setValue()
       * @param {string} fieldId
       * @param {*} value
       * @param {string} [state] - Value state (ignored in new system)
       */
      setValue(fieldId, value, state) {
        const isRef = fieldId.startsWith('ref_');
        const baseId = isRef ? fieldId.slice(4) : fieldId;

        const semanticPath = registry.hasSemantic(baseId)
          ? baseId
          : registry.toSemantic(baseId);

        if (!semanticPath) {
          console.warn(`LegacyAdapter: Unknown field ${fieldId}`);
          return;
        }

        // Route to appropriate model
        if (isRef) {
          const refModels = multiModelState.getAllModels()
            .filter(m => m.modelType === 'reference');
          if (refModels.length > 0) {
            engine.updateField(refModels[0].id, semanticPath, value);
          }
        } else {
          engine.updateField(multiModelState.getActiveModelId(), semanticPath, value);
        }
      },

      /**
       * Install adapter as TEUI.StateManager replacement
       */
      install() {
        const originalStateManager = window.TEUI?.StateManager;

        // Store original for rollback
        window.TEUI._originalStateManager = originalStateManager;

        // Replace getValue/setValue
        if (originalStateManager) {
          originalStateManager.getValue = this.getValue.bind(this);
          originalStateManager.setValue = this.setValue.bind(this);
        }

        console.log('LegacyAdapter: Installed');
      },

      /**
       * Remove adapter and restore original StateManager
       */
      uninstall() {
        const original = window.TEUI?._originalStateManager;
        if (original) {
          window.TEUI.StateManager = original;
          console.log('LegacyAdapter: Uninstalled');
        }
      }
    };
  }

  // Export
  window.TEUI = window.TEUI || {};
  window.TEUI.createLegacyAdapter = createLegacyAdapter;
})();
```

---

### Task 4.2: Create Model Selector UI ✅

**Objective:** UI component for switching between models.

**Dependencies:** Task 4.1

**Completed:** `src/core/ui/ModelSelector.js`

**Features:**
- Dropdown, tabs, and pills display modes
- Auto-updates on model add/remove
- onModelChange callback support
- Keyboard accessible

---

### Task 4.3: Create Comparison View ✅

**Objective:** Side-by-side comparison of multiple models.

**Dependencies:** Task 3.5, 4.2

**Completed:** `src/core/ui/ComparisonView.js`

**Features:**
- Side-by-side value comparison
- Delta/percentage calculations
- Better/worse highlighting
- CSV export
- Field filtering

---

### Task 4.4: Wire DOM Events to New Engine ✅

**Objective:** Route input events through new computation system.

**Dependencies:** Tasks 4.1-4.3

**Completed:** `src/core/ui/DOMBridge.js`

**Architecture:**
- DOM is INPUT SOURCE (captures user edits) and OUTPUT SINK (displays values)
- Computation driven by DEPENDENCY GRAPH, not DOM events
- DOM changes trigger engine.onValueChange() → graph computes → DOM updates
- No cascading DOM events for calculation propagation

**Features:**
- Automatic element binding via data attributes
- Debounced input handling
- Bi-directional sync (state ↔ DOM)
- Support for all input types

---

### Task 4.5: Unit Tests for Phase 4 ✅

**Completed:**
- `test/computation/phase4.test.js`
- `test/computation/phase4.test.html`

**Test Coverage:**
- LegacyAdapter (11 tests)
- ModelSelector (8 tests)
- ComparisonView (8 tests)
- DOMBridge (11 tests)
- Integration (4 tests)

---

## Phase 5: Cleanup and Optimization ⏳

**Status:** NOT STARTED (Ready to begin)
**Goal:** Remove legacy code and optimize performance.

---

### Task 5.1: Add Computation Caching ⏳

**Objective:** Cache computation results for unchanged inputs.

**Dependencies:** Phase 4 complete

**Outputs:**
- Enhanced `IncrementalEngine.js` with memoization

---

### Task 5.2: Profile and Optimize Hot Paths ⏳

**Objective:** Identify and optimize performance bottlenecks.

**Process:**
1. Add performance instrumentation
2. Profile typical user workflows
3. Identify slow computations
4. Optimize (algorithm, caching, batching)

---

### Task 5.3: Remove Legacy Calculation Code ⏳

**Objective:** Remove old calculation code once new system is verified.

**Dependencies:** All verification tests pass

**Process:**
1. Feature flag to switch between old/new
2. Run both in parallel, compare results
3. Remove old code when confident
4. Update documentation

---

### Task 5.4: Update Dependency Visualization ⏳

**Objective:** Enhance Dependency.js to use new graph structure.

**Dependencies:** Task 5.3

---

### Task 5.5: Final Documentation ⏳

**Objective:** Document the new architecture.

**Outputs:**
- Updated `CLAUDE.md`
- Updated `TECHNICAL2.md`
- Architecture diagrams
- Migration guide for future sections

---

## Appendix: File Structure After Refactoring

```
src/
├── core/
│   ├── computation/           # NEW: Incremental computation
│   │   ├── types.js
│   │   ├── ComputationGraph.js
│   │   ├── IncrementalEngine.js
│   │   ├── FieldRegistry.js
│   │   └── LegacyAdapter.js
│   │
│   ├── model/                 # NEW: Multi-model state
│   │   ├── ModelMetadata.js
│   │   ├── MultiModelState.js
│   │   ├── MultiModelEngine.js
│   │   ├── ModelOperations.js
│   │   └── ModelComparison.js
│   │
│   ├── ui/                    # NEW: UI components
│   │   ├── ModelSelector.js
│   │   └── ComparisonView.js
│   │
│   ├── StateManager.js        # EXISTING: Gradually deprecated
│   ├── Calculator.js          # EXISTING: Gradually deprecated
│   └── ...
│
├── sections/
│   ├── nodes/                 # NEW: Computation node definitions
│   │   ├── ClimateNodes.js
│   │   ├── EnvelopeNodes.js
│   │   ├── MechanicalNodes.js
│   │   └── EnergyNodes.js
│   │
│   ├── Section01.js           # EXISTING: Gradually migrated
│   ├── Section03.js
│   └── ...
│
test/
├── computation/               # NEW: Unit tests
│   └── computation.test.js
│
├── migration/                 # NEW: Migration verification
│   └── section-comparison.test.js
│
└── ...
```

---

## Summary: Phase Dependencies

```
Phase 1: Computation Graph Infrastructure ✅ COMPLETE
├── 1.1 Type Definitions ✅
├── 1.2 ComputationGraph ✅ ────────┐
├── 1.3 IncrementalEngine ✅ ───────┤
├── 1.4 FieldRegistry ✅            │
└── 1.5 Unit Tests ✅ ──────────────┘

Phase 2: Section Migration ✅ (Complete)
├── 2.1 Analyze S03 ✅ ─────────────┐
├── 2.2 ClimateNodes ✅ ────────────┤
├── 2.3 EnvelopeNodes ✅ ───────────┤
├── 2.4 MechanicalNodes ✅ ─────────┤
├── 2.5 EnergyNodes ✅              │
└── 2.6 Verification ✅ ────────────┘

Phase 3: Multi-Model State ✅ (Complete)
├── 3.1 ModelMetadata ✅ ───────────┐
├── 3.2 MultiModelState ✅ ─────────┤
├── 3.3 MultiModelEngine ✅ ────────┤
├── 3.4 ModelOperations ✅          │
└── 3.5 ModelComparison ✅ ─────────┘

Phase 4: UI Integration ✅ (Complete)
├── 4.1 LegacyAdapter ✅ ───────────┐
├── 4.2 ModelSelector UI ✅ ────────┤
├── 4.3 ComparisonView ✅           │
├── 4.4 DOM Event Wiring ✅ ────────┤
└── 4.5 Unit Tests ✅ ──────────────┘

Phase 5: Cleanup & Optimization ⏳ (Ready to begin)
├── 5.1 Computation Caching ⏳
├── 5.2 Performance Optimization ⏳
├── 5.3 Remove Legacy Code ⏳
├── 5.4 Update Visualization ⏳
└── 5.5 Documentation ⏳
```

---

## Change Log

| Date | Changes |
|------|---------|
| December 2025 | Added status tracking, existing infrastructure notes, and task status markers |
| December 2025 | **Phase 1 Complete**: Created types.js, ComputationGraph.js, IncrementalEngine.js, FieldRegistry.js, and test suite |
| December 2025 | **Phase 2 Complete**: Created ClimateNodes.js, EnvelopeNodes.js, MechanicalNodes.js, EnergyNodes.js, and section node tests |
| December 2025 | **Phase 3 Complete**: Created ModelMetadata.js, MultiModelState.js, MultiModelEngine.js, ModelOperations.js, and multi-model tests |
| December 2025 | **Phase 4 Complete**: Created LegacyAdapter.js, ModelSelector.js, ComparisonView.js, DOMBridge.js, and Phase 4 tests |
